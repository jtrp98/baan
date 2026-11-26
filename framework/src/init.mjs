import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  STUB_MARKER,
  TOML_STUB_MARKER,
  TEAM_AGENTS,
  compileWorkspaceStub,
  compileClaudeAgent,
  compileAgyAgent,
  compileCodexAgentToml,
} from "./role-compiler.mjs";

export { TEAM_AGENTS };

const toPosix = (p) => p.split(path.sep).join("/");

function cloneInto(url, dest, log) {
  if (existsSync(dest)) { log(`มี ${dest} อยู่แล้ว (ไม่ clone ทับ)`); return "kept"; }
  const r = spawnSync("git", ["clone", url, dest], { encoding: "utf8", windowsHide: true });
  if (r.status !== 0) throw new Error(`git clone ไม่สำเร็จ: ${(r.error?.message || r.stderr || "unknown Git error").trim().slice(-3000)}`);
  log(`clone ${url} → ${dest}`);
  return "cloned";
}

function generatedConfig(teamDir, targetDir, knowledgeDir, memoryDir, knowledgeName) {
  const example = JSON.parse(readFileSync(path.join(teamDir, "baan.example.json"), "utf8"));
  return {
    knowledge_roots: [{
      name: knowledgeName,
      path: toPosix(knowledgeDir),
      layout: "project",
      ...(memoryDir ? { memory_root: toPosix(memoryDir) } : {}),
      targets: [],
    }],
    defaults: example.defaults,
  };
}

const END_MARKER = "<!-- baan:end — เขียนต่อใต้บรรทัดนี้ได้ baan sync / --init จะเก็บส่วนนี้ไว้ -->";
const TOML_END_MARKER = "# baan:end — เขียนต่อใต้บรรทัดนี้ได้ baan sync / --init จะเก็บส่วนนี้ไว้";

// Claude Code's "#" memory and people append to these files; a refresh may replace only the generated part.
function userTail(current, generated, endMarker = END_MARKER) {
  const at = current.indexOf(endMarker);
  if (at >= 0) return current.slice(at + endMarker.length).replace(/^\r?\n/, "");
  // Stubs from before the end marker: keep whatever follows the generated text's last line.
  const lastLine = generated.trimEnd().split("\n").at(-1).slice(0, 20);
  const lines = current.split(/\r?\n/);
  const i = lines.findLastIndex((l) => l.startsWith(lastLine));
  return i >= 0 ? lines.slice(i + 1).join("\n").replace(/^\n+/, "") : null;
}

// Returns "created" | "updated" | "skipped"; never loses text a person wrote into a managed file.
function writeStub(file, generated, log, { marker = STUB_MARKER, endMarker = END_MARKER } = {}) {
  if (!existsSync(file)) {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `${generated}${endMarker}\n`, "utf8");
    return "created";
  }
  const current = readFileSync(file, "utf8");
  if (!current.includes(marker)) return "skipped";
  const tail = userTail(current, generated, endMarker);
  if (tail === null) {
    writeFileSync(`${file}.baan-backup`, current, "utf8");
    log(`สำรอง ${file} เดิมไว้ที่ ${file}.baan-backup — หาส่วนที่ผู้ใช้เขียนเพิ่มไม่เจอ`);
  }
  writeFileSync(file, `${generated}${endMarker}\n${tail ?? ""}`, "utf8");
  return "updated";
}

function writeManaged(file, content, results, log, opts = {}) {
  if (writeStub(file, content, log, opts) === "skipped") {
    results.skipped.push(file);
    log(`ข้าม ${file} — มีอยู่แล้วและไม่ได้สร้างโดย baan`);
    return;
  }
  results.design.push(file);
}

const SKILL_MARKER = ".baan-managed";

export const PROVIDER_SKILLS = {
  agy: [
    "repo-map",
    "coding-pattern",
    "ui-design-system",
    "api-db-contract",
    "plan",
    "bug-fix",
    "code-review",
    "verify-before-done",
    "knowledge-handoff",
  ],
  claude: [
    "bug-fix",
    "feature-flow",
    "project-survey",
    "req-grill",
    "wave-plan",
    "web-design-guidelines",
  ],
};

function installSkills(teamDir, targetDir, results, log) {
  const src = path.join(teamDir, "skills");
  if (!existsSync(src)) return;
  const targets = [
    { root: path.join(targetDir, ".agents", "skills"), srcDir: path.join(src, "agy"), names: PROVIDER_SKILLS.agy },
    { root: path.join(targetDir, ".claude", "skills"), srcDir: src, names: PROVIDER_SKILLS.claude },
  ];
  for (const { root, srcDir, names } of targets) {
    const allowed = new Set(names);
    if (existsSync(root)) {
      for (const existingName of readdirSync(root)) {
        if (allowed.has(existingName)) continue;
        const staleDir = path.join(root, existingName);
        if (existsSync(path.join(staleDir, SKILL_MARKER))) {
          rmSync(staleDir, { recursive: true, force: true });
          log(`ลบ skill รุ่นเก่าของ baan ออกจาก ${root}: ${existingName}`);
        }
      }
    }
    for (const name of names) {
      const skillSrc = path.join(srcDir, name);
      if (!existsSync(skillSrc)) continue;
      const dest = path.join(root, name);
      if (existsSync(dest) && !existsSync(path.join(dest, SKILL_MARKER))) {
        results.skipped.push(dest);
        log(`ข้าม skill ${name} ใน ${root} — มีอยู่แล้วและไม่ได้ติดตั้งโดย baan`);
        continue;
      }
      rmSync(dest, { recursive: true, force: true });
      cpSync(skillSrc, dest, { recursive: true });
      writeFileSync(path.join(dest, SKILL_MARKER), `ติดตั้งโดย baan --init จาก ${skillSrc} — รัน baan --init ซ้ำเพื่ออัปเดต\n`, "utf8");
      results.design.push(dest);
    }
  }
}

// Antigravity uses native Orchestrator + built-in/dynamic subagents instead of static 10-role .agents/agents/*.md stubs.
function cleanupObsoleteAgyAgents(targetDir, log) {
  const dir = path.join(targetDir, ".agents", "agents");
  if (!existsSync(dir)) return;
  let removed = 0;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    try {
      if (entry.endsWith(".md") && readFileSync(full, "utf8").includes(STUB_MARKER)) {
        rmSync(full, { force: true });
        removed++;
      }
    } catch { /* ignore */ }
  }
  if (removed) log(`ลบ .agents/agents/*.md รุ่นเก่าของ baan ${removed} ไฟล์ (ฝั่ง Antigravity ใช้ Native Orchestrator + Common Skills แล้ว)`);
  try {
    if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true, force: true });
  } catch { /* ignore */ }
}

function removeObsoletePencil(targetDir, log) {
  const oldPencil = path.join(targetDir, ".claude", "commands", "pencil.md");
  if (existsSync(oldPencil)) {
    try {
      if (readFileSync(oldPencil, "utf8").includes(STUB_MARKER)) {
        rmSync(oldPencil, { force: true });
        log("ลบ .claude/commands/pencil.md เดิม (เปลี่ยนเป็น agent spec แล้ว)");
      }
    } catch { /* ignore */ }
  }
}

// Only an old wrapper that launched BAAN is obsolete; any other baan.cmd belongs to the user.
function removeObsoleteBaanCmd(targetDir, log) {
  const cmd = path.join(targetDir, "baan.cmd");
  if (!existsSync(cmd)) return;
  try {
    if (!/baan[\\/]+(?:framework[\\/]+)?bin[\\/]+baan\.mjs|baan\.mjs/i.test(readFileSync(cmd, "utf8"))) return;
    rmSync(cmd, { force: true });
    log("ลบ baan.cmd เดิม (ใช้คำสั่ง baan กลางจาก PATH ได้โดยตรง)");
  } catch { /* ignore */ }
}

const HOOK_MARKER = "baan-live-telemetry.mjs";

function mergeJsonSafe(file, mergeFn, log) {
  let current = {};
  const existed = existsSync(file);
  if (existed) {
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8"));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        log(`⚠ ข้าม ${file} — โครงสร้าง JSON เดิมไม่ใช่วัตถุ`);
        return "skipped";
      }
      current = parsed;
    } catch {
      log(`⚠ ข้าม ${file} — JSON เดิมเสียรูป (ไม่เขียนทับ)`);
      return "skipped";
    }
  }
  const next = mergeFn(structuredClone(current));
  const nextText = JSON.stringify(next, null, 2) + "\n";
  if (existed && readFileSync(file, "utf8") === nextText) return "kept";
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, nextText, "utf8");
  return existed ? "updated" : "created";
}

function mergeHookEvents(current, events) {
  const next = { ...current };
  const hooks = next.hooks && typeof next.hooks === "object" && !Array.isArray(next.hooks) ? { ...next.hooks } : {};
  for (const [eventName, ourEntries] of Object.entries(events)) {
    const existing = Array.isArray(hooks[eventName]) ? hooks[eventName] : [];
    const kept = existing.filter((entry) => !Array.isArray(entry?.hooks) || !entry.hooks.some((h) => String(h?.command ?? "").includes(HOOK_MARKER)));
    hooks[eventName] = [...kept, ...ourEntries];
  }
  next.hooks = hooks;
  return next;
}

export function installTelemetryHooks(workspaceDir, teamDir, results = { hooks: [], skipped: [] }, log = () => {}) {
  const srcScript = path.join(teamDir, "setup", "hooks", HOOK_MARKER);
  if (!existsSync(srcScript)) return results;

  const destScript = path.join(workspaceDir, ".agents", "hooks", HOOK_MARKER);
  mkdirSync(path.dirname(destScript), { recursive: true });
  const scriptText = readFileSync(srcScript, "utf8");
  if (!existsSync(destScript) || readFileSync(destScript, "utf8") !== scriptText) {
    writeFileSync(destScript, scriptText, "utf8");
    results.hooks.push(destScript);
  }

  const agyCmd = `node ./hooks/${HOOK_MARKER} --provider=agy`;
  const agyHook = {
    SessionStart: [{ type: "command", command: agyCmd, timeout: 5 }],
    PreInvocation: [{ type: "command", command: agyCmd, timeout: 5 }],
    PreToolUse: [{ matcher: "invoke_subagent|run_workflow|define_subagent", hooks: [{ type: "command", command: agyCmd, timeout: 5 }] }],
    PostToolUse: [{ matcher: ".*", hooks: [{ type: "command", command: agyCmd, timeout: 5 }] }],
    Stop: [{ type: "command", command: agyCmd, timeout: 5 }],
  };

  const makeEntry = (cmd, matcher = null) => ({
    ...(matcher ? { matcher } : {}),
    hooks: [{ type: "command", command: cmd, timeout: 5 }],
  });
  const claudeCmd = `node .agents/hooks/${HOOK_MARKER} --provider=claude`;
  const codexCmd = `node .agents/hooks/${HOOK_MARKER} --provider=codex`;

  const targets = [
    [path.join(workspaceDir, ".agents", "hooks.json"), (cur) => ({ ...cur, "baan-live-telemetry": agyHook })],
    [path.join(workspaceDir, ".claude", "settings.json"), (cur) => mergeHookEvents(cur, {
      SessionStart: [makeEntry(claudeCmd)],
      PreToolUse: [makeEntry(claudeCmd, ".*")],
      PostToolUse: [makeEntry(claudeCmd, ".*")],
      SubagentStart: [makeEntry(claudeCmd)],
      SubagentStop: [makeEntry(claudeCmd)],
      Stop: [makeEntry(claudeCmd)],
    })],
    [path.join(workspaceDir, ".codex", "hooks.json"), (cur) => mergeHookEvents(cur, {
      SessionStart: [makeEntry(codexCmd)],
      PreToolUse: [makeEntry(codexCmd, ".*")],
      PostToolUse: [makeEntry(codexCmd, ".*")],
      Stop: [makeEntry(codexCmd)],
    })],
  ];

  for (const [file, mergeFn] of targets) {
    const outcome = mergeJsonSafe(file, mergeFn, log);
    if (outcome === "skipped") results.skipped.push(file);
    else if (outcome === "created" || outcome === "updated") results.hooks.push(file);
  }
  return results;
}

export function performInit(targetDir, teamDir, log = console.log, opts = {}) {
  const results = { config: "", stubs: [], skipped: [], design: [], hooks: [], cloned: [] };
  mkdirSync(targetDir, { recursive: true });
  mkdirSync(path.join(targetDir, "target"), { recursive: true });

  let knowledgeDir = "";
  let memoryDir = "";
  if (opts.knowledgeGit) {
    knowledgeDir = path.join(targetDir, "knowledge");
    if (cloneInto(opts.knowledgeGit, knowledgeDir, log) === "cloned") results.cloned.push(knowledgeDir);
  }
  if (opts.memoryGit) {
    memoryDir = path.join(targetDir, "memory");
    if (cloneInto(opts.memoryGit, memoryDir, log) === "cloned") results.cloned.push(memoryDir);
  }

  const newCfg = path.join(targetDir, "baan.config.json");
  if (existsSync(newCfg)) {
    results.config = "kept";
    log(`มี config อยู่แล้ว (ไม่แตะ): ${newCfg}`);
  } else if (knowledgeDir) {
    const name = String(opts.knowledgeGit).replace(/[\\/]+$/, "").split(/[\\/:]/).pop().replace(/\.git$/, "") || "knowledge";
    writeFileSync(newCfg, JSON.stringify(generatedConfig(teamDir, targetDir, knowledgeDir, memoryDir, name), null, 2) + "\n", "utf8");
    results.config = "generated";
    log(`สร้าง config ที่ path ตรงเครื่องนี้แล้ว: ${newCfg} — เพิ่ม targets (repo โค้ด) เองเมื่อต้องใช้`);
  } else {
    writeFileSync(newCfg, readFileSync(path.join(teamDir, "baan.example.json"), "utf8"), "utf8");
    results.config = "written";
    log(`สร้าง config จากตัวอย่าง: ${newCfg} — แก้ path ให้ตรงเครื่องนี้ (targets/knowledge/memory) แล้ว git init โฟลเดอร์ memory`);
  }

  for (const id of Object.keys(TEAM_AGENTS)) {
    writeManaged(path.join(targetDir, ".claude", "agents", `${id}.md`), compileClaudeAgent(id, teamDir), results, log);
    writeManaged(
      path.join(targetDir, ".codex", "agents", `${id}.toml`),
      compileCodexAgentToml(id, teamDir),
      results,
      log,
      { marker: TOML_STUB_MARKER, endMarker: TOML_END_MARKER }
    );
  }
  cleanupObsoleteAgyAgents(targetDir, log);
  removeObsoletePencil(targetDir, log);
  removeObsoleteBaanCmd(targetDir, log);
  installSkills(teamDir, targetDir, results, log);
  installTelemetryHooks(targetDir, teamDir, results, log);
  if (results.design.length) log(`วาง native agents (claude · codex) และ skills แยกตามค่าย ${results.design.length} รายการ (.claude · .codex · .agents/skills)`);
  if (results.hooks.length) log(`ติดตั้ง/อัปเดต live telemetry hooks ${results.hooks.length} ไฟล์ที่ราก workspace (agy · claude · codex)`);

  const charterPath = path.join(teamDir, "BAAN.md");
  const learningPath = path.join(teamDir, "LEARNING.md");
  const rootStubs = [
    ["CLAUDE.md", "claude"],
    ["AGENTS.md", "codex"],
    ["GEMINI.md", "agy"],
  ];
  for (const [name, provider] of rootStubs) {
    const outcome = writeStub(path.join(targetDir, name), compileWorkspaceStub(provider, charterPath, learningPath), log);
    if (outcome === "skipped") {
      results.skipped.push(name);
      log(`ข้าม ${name} — มีอยู่แล้วและไม่ได้สร้างโดย baan (เพิ่มบรรทัดชี้ไป ${charterPath} เองถ้าต้องการ)`);
      continue;
    }
    results.stubs.push(name);
    log(outcome === "created" ? `สร้าง ${name} — AI session (${provider}) ที่เปิดที่นี่จะสวมบท นายช่าง เองโดยอัตโนมัติ` : `อัปเดต ${name} ใหม่ (เก็บข้อความที่เขียนต่อท้ายไว้)`);
  }
  return results;
}
