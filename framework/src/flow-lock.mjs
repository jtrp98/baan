import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { readFrontMatter } from "./knowledge-index.mjs";
import { writeAtomic } from "./store.mjs";

export const LOCKED_STATUSES = new Set(["done", "superseded", "cancelled"]);

const ARTIFACT_KINDS = {
  wave: {
    dirRel: path.join("build", "waves"),
    prefix: "wave-",
    pad: 3,
    indexTitle: "สารบัญ Waves",
    indexEmpty: "| - | ยังไม่มี wave | - | - | - |",
  },
  testplan: {
    dirRel: path.join("build", "test-plan"),
    prefix: "TP-",
    pad: 3,
    indexTitle: "สารบัญแผนทดสอบ (Test Plan)",
    indexEmpty: "| - | ยังไม่มี Test Plan | - | - | - |",
  },
};

const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);

export function normalizeContentForHash(text) {
  return String(text ?? "").replaceAll("\r\n", "\n");
}

export function hashFile(filePath) {
  const text = readFileSync(filePath, "utf8");
  return createHash("sha256").update(normalizeContentForHash(text), "utf8").digest("hex");
}

export function parseFlowMarkdown(filePath) {
  const text = readFileSync(filePath, "utf8");
  const fm = readFrontMatter(text);
  const heading = /^#\s+(.+)$/m.exec(text)?.[1]?.trim() ?? "";
  let tasks = [];
  const block = /```json\s+baan-wave\r?\n([\s\S]*?)```/i.exec(text);
  if (block) {
    try {
      const parsed = JSON.parse(block[1]);
      if (Array.isArray(parsed)) tasks = parsed;
      else if (Array.isArray(parsed?.tasks)) tasks = parsed.tasks;
    } catch { /* fallback to single task from frontmatter */ }
  }
  const baseName = path.basename(filePath, ".md");
  const id = fm.id || baseName;
  const title = fm.title || heading || id;
  const status = String(fm.status || "pending").trim().toLowerCase();
  const owns = asList(fm.owns);
  const dependsOn = asList(fm.depends_on);
  const commands = {
    build: fm.build || "",
    test_targeted: fm.test_targeted || "",
    test_full: fm.test_full || "",
  };
  return {
    id,
    file: filePath,
    fileName: path.basename(filePath),
    title,
    status,
    round: fm.round ? Number(fm.round) : 1,
    kind: fm.kind || "code",
    target: fm.target || "",
    owns,
    dependsOn,
    supersededBy: fm.superseded_by || "",
    supersededReason: fm.superseded_reason || "",
    commands,
    tasks,
    fm,
    raw: text,
  };
}

function scanArtifacts(moduleDir, artifactKind) {
  const spec = ARTIFACT_KINDS[artifactKind];
  const dir = path.join(moduleDir, spec.dirRel);
  if (!existsSync(dir)) return [];
  const re = new RegExp(`^${spec.prefix.replace("-", "\\-")}.*\\.md$`, "i");
  return readdirSync(dir)
    .filter((f) => re.test(f) && f.toLowerCase() !== "index.md")
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => {
      const parsed = parseFlowMarkdown(path.join(dir, f));
      parsed.relPath = path.relative(moduleDir, parsed.file).split(path.sep).join("/");
      return parsed;
    });
}

export function scanWaves(moduleDir) {
  return scanArtifacts(moduleDir, "wave");
}

export function scanTestPlans(moduleDir) {
  return scanArtifacts(moduleDir, "testplan");
}

export function lockArtifact(flowState, moduleDir, relPath) {
  const norm = relPath.split(path.sep).join("/");
  const abs = path.join(moduleDir, norm);
  if (!existsSync(abs)) {
    throw new Error(`ไม่สามารถล็อกไฟล์ที่ไม่มีอยู่: ${norm}`);
  }
  flowState.lockedFiles ??= {};
  flowState.lockedFiles[norm] = {
    hash: hashFile(abs),
    lockedAt: new Date().toISOString(),
  };
  return flowState.lockedFiles[norm];
}

export function verifyLockedArtifacts(moduleDir, lockedFiles = {}) {
  const violations = [];
  for (const [relPath, entry] of Object.entries(lockedFiles ?? {})) {
    const abs = path.join(moduleDir, relPath);
    if (!existsSync(abs)) {
      violations.push({ relPath, reason: "missing", expectedHash: entry?.hash ?? null });
      continue;
    }
    const actualHash = hashFile(abs);
    if (entry?.hash && actualHash !== entry.hash) {
      violations.push({ relPath, reason: "modified", expectedHash: entry.hash, actualHash });
    }
  }
  return { ok: violations.length === 0, violations };
}

export function assertImmutableUnlocked(moduleDir, relPath, flowState = null) {
  const norm = relPath.split(path.sep).join("/");
  const abs = path.join(moduleDir, norm);
  if (flowState?.lockedFiles?.[norm]) {
    throw Object.assign(
      new Error(`ห้ามแก้ไขไฟล์ที่ล็อกแล้ว (${norm}) — ตามกฎ Immutable History ให้สร้าง Wave/TP ใหม่ต่อท้ายแทน`),
      { failureClass: "IMMUTABLE_ARTIFACT_VIOLATION" },
    );
  }
  if (existsSync(abs)) {
    const parsed = parseFlowMarkdown(abs);
    if (LOCKED_STATUSES.has(parsed.status)) {
      throw Object.assign(
        new Error(`ห้ามแก้ไข ${norm} เพราะสถานะเป็น "${parsed.status}" แล้ว — ให้สร้างไฟล์ใหม่ต่อท้ายแทน`),
        { failureClass: "IMMUTABLE_ARTIFACT_VIOLATION" },
      );
    }
  }
}

function updateFrontMatterField(raw, updates) {
  const match = /^(\uFEFF?---\r?\n)([\s\S]*?)(\r?\n---)/.exec(raw);
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  if (!match) {
    const fmLines = Object.entries(updates).map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.join(", ")}]` : v}`);
    return `---${eol}${fmLines.join(eol)}${eol}---${eol}${eol}${raw}`;
  }
  const lines = match[2].split(/\r?\n/);
  const keysSeen = new Set();
  const nextLines = lines.map((line) => {
    const kv = /^([A-Za-z_][\w-]*):/.exec(line.trim());
    if (!kv || !Object.hasOwn(updates, kv[1])) return line;
    keysSeen.add(kv[1]);
    const val = updates[kv[1]];
    return `${kv[1]}: ${Array.isArray(val) ? `[${val.join(", ")}]` : val}`;
  });
  for (const [k, v] of Object.entries(updates)) {
    if (!keysSeen.has(k)) {
      nextLines.push(`${k}: ${Array.isArray(v) ? `[${v.join(", ")}]` : v}`);
    }
  }
  return `${match[1]}${nextLines.join(eol)}${match[3]}${raw.slice(match[0].length)}`;
}

export function setArtifactStatus(moduleDir, relPath, newStatus, extraUpdates = {}, flowState = null) {
  const norm = relPath.split(path.sep).join("/");
  assertImmutableUnlocked(moduleDir, norm, flowState);
  const abs = path.join(moduleDir, norm);
  if (!existsSync(abs)) throw new Error(`ไม่พบไฟล์ ${norm}`);
  const raw = readFileSync(abs, "utf8");
  const updated = updateFrontMatterField(raw, { status: newStatus, ...extraUpdates });
  writeAtomic(abs, updated);
  if (flowState && LOCKED_STATUSES.has(String(newStatus).toLowerCase())) {
    lockArtifact(flowState, moduleDir, norm);
  }
  return abs;
}

export function refreshArtifactIndex(moduleDir, artifactKind) {
  const spec = ARTIFACT_KINDS[artifactKind];
  const dir = path.join(moduleDir, spec.dirRel);
  mkdirSync(dir, { recursive: true });
  const items = scanArtifacts(moduleDir, artifactKind);
  const cell = (s) => String(s || "-").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  const rows = items.length
    ? items.map((it) => {
        const note = it.supersededBy ? `superseded by ${it.supersededBy}` : (it.dependsOn.length ? `depends: ${it.dependsOn.join(", ")}` : "-");
        return `| [${it.id}](${it.fileName}) | ${cell(it.title)} | ${cell(it.status)} | ${cell(it.round)} | ${cell(note)} |`;
      })
    : [spec.indexEmpty];
  const content = [
    `# ${spec.indexTitle}`,
    "",
    "> สร้าง/อัปเดตอัตโนมัติ — ห้ามแก้ไขรายการที่สถานะ `done` หรือ `superseded`",
    "",
    "| รหัส | รายการ | สถานะ | รอบ | หมายเหตุ |",
    "|---|---|---|---:|---|",
    ...rows,
    "",
  ].join("\n");
  const indexFile = path.join(dir, "INDEX.md");
  writeAtomic(indexFile, content);
  return indexFile;
}

export function refreshWaveIndex(moduleDir) {
  return refreshArtifactIndex(moduleDir, "wave");
}

export function refreshTestPlanIndex(moduleDir) {
  return refreshArtifactIndex(moduleDir, "testplan");
}

function nextArtifactNumber(items, prefix) {
  let max = 0;
  for (const it of items) {
    const m = new RegExp(`^${prefix.replace("-", "\\-")}(\\d+)`, "i").exec(it.id) || new RegExp(`^${prefix.replace("-", "\\-")}(\\d+)`, "i").exec(it.fileName);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

export function appendWaveFile(moduleDir, waveSpec = {}, flowState = null) {
  const dir = path.join(moduleDir, ARTIFACT_KINDS.wave.dirRel);
  mkdirSync(dir, { recursive: true });
  const existing = scanWaves(moduleDir);
  const nextNum = nextArtifactNumber(existing, ARTIFACT_KINDS.wave.prefix);
  const id = waveSpec.id || `wave-${String(nextNum).padStart(3, "0")}`;
  const fileName = waveSpec.fileName || `${id}.md`;
  const relPath = path.join(ARTIFACT_KINDS.wave.dirRel, fileName).split(path.sep).join("/");
  const abs = path.join(moduleDir, relPath);
  if (existsSync(abs)) {
    assertImmutableUnlocked(moduleDir, relPath, flowState);
  }
  const fmLines = [
    "---",
    `id: ${id}`,
    `title: ${waveSpec.title || id}`,
    `status: ${waveSpec.status || "pending"}`,
    `round: ${waveSpec.round ?? 1}`,
    `kind: ${waveSpec.kind || "code"}`,
    ...(waveSpec.target ? [`target: ${waveSpec.target}`] : []),
    `owns: [${asList(waveSpec.owns).join(", ")}]`,
    `depends_on: [${asList(waveSpec.dependsOn ?? waveSpec.depends_on).join(", ")}]`,
    ...(waveSpec.build ? [`build: ${waveSpec.build}`] : []),
    ...(waveSpec.test_targeted ? [`test_targeted: ${waveSpec.test_targeted}`] : []),
    ...(waveSpec.test_full ? [`test_full: ${waveSpec.test_full}`] : []),
    "---",
  ];
  const body = [
    `# ${id}: ${waveSpec.title || id}`,
    "",
    waveSpec.goal ? `## เป้าหมาย\n${waveSpec.goal}\n` : "",
    waveSpec.body || "",
    Array.isArray(waveSpec.tasks) && waveSpec.tasks.length
      ? `\`\`\`json baan-wave\n${JSON.stringify({ tasks: waveSpec.tasks }, null, 2)}\n\`\`\`\n`
      : "",
  ].filter(Boolean).join("\n");
  writeAtomic(abs, `${fmLines.join("\n")}\n\n${body}\n`);
  refreshWaveIndex(moduleDir);
  return { id, file: abs, relPath };
}

export function appendTestPlanFile(moduleDir, tpSpec = {}, flowState = null) {
  const dir = path.join(moduleDir, ARTIFACT_KINDS.testplan.dirRel);
  mkdirSync(dir, { recursive: true });
  const existing = scanTestPlans(moduleDir);
  const nextNum = nextArtifactNumber(existing, ARTIFACT_KINDS.testplan.prefix);
  const id = tpSpec.id || `TP-${String(nextNum).padStart(3, "0")}`;
  const fileName = tpSpec.fileName || `${id}.md`;
  const relPath = path.join(ARTIFACT_KINDS.testplan.dirRel, fileName).split(path.sep).join("/");
  const abs = path.join(moduleDir, relPath);
  if (existsSync(abs)) {
    assertImmutableUnlocked(moduleDir, relPath, flowState);
  }
  const fmLines = [
    "---",
    `id: ${id}`,
    `title: ${tpSpec.title || id}`,
    `status: ${tpSpec.status || "pending"}`,
    `round: ${tpSpec.round ?? 1}`,
    ...(tpSpec.target ? [`target: ${tpSpec.target}`] : []),
    `owns: [${asList(tpSpec.owns).join(", ")}]`,
    ...(tpSpec.test_targeted ? [`test_targeted: ${tpSpec.test_targeted}`] : []),
    "---",
  ];
  const body = [
    `# ${id}: ${tpSpec.title || id}`,
    "",
    tpSpec.body || "",
  ].filter(Boolean).join("\n");
  writeAtomic(abs, `${fmLines.join("\n")}\n\n${body}\n`);
  refreshTestPlanIndex(moduleDir);
  return { id, file: abs, relPath };
}

export function markSuperseded(moduleDir, artifactKind, id, supersededBy, reason = "", flowState = null) {
  const items = scanArtifacts(moduleDir, artifactKind);
  const item = items.find((x) => x.id === id);
  if (!item) throw new Error(`ไม่พบ ${artifactKind} รหัส ${id}`);
  assertImmutableUnlocked(moduleDir, item.relPath, flowState);
  setArtifactStatus(moduleDir, item.relPath, "superseded", {
    superseded_by: supersededBy,
    ...(reason ? { superseded_reason: reason } : {}),
  }, flowState);
  refreshArtifactIndex(moduleDir, artifactKind);
  return item.relPath;
}
