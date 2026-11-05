import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const cfg = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "agents.json"), "utf8"));
const AGENTS = ["claude", "codex", "agy", "opencode"];

test("ทุก tier ประกาศครบทุก agent และรูปแบบถูกต้อง", () => {
  for (const [tier, conf] of Object.entries(cfg.tiers)) {
    for (const a of AGENTS) {
      assert.ok(a in conf, `tier ${tier} ต้องประกาศ ${a} ไว้เสมอ (ถ้ายังไม่มี model ให้ใส่ null)`);
      if (conf[a] !== null) {
        assert.equal(typeof conf[a].model, "string", `tier ${tier}/${a}: ต้องมี model เป็น string`);
        assert.ok(conf[a].model.length > 0);
      }
    }
  }
});

test("_fallback ของทุก tier ต้องเป็นลำดับ agent ที่รู้จัก ไม่ซ้ำ ไม่ว่าง", () => {
  for (const [tier, conf] of Object.entries(cfg.tiers)) {
    const fb = conf._fallback;
    assert.ok(Array.isArray(fb) && fb.length > 0, `tier ${tier}: ต้องมี _fallback`);
    for (const a of fb) assert.ok(AGENTS.includes(a), `tier ${tier}: _fallback มี agent ที่ไม่รู้จัก (${a})`);
    assert.equal(new Set(fb).size, fb.length, `tier ${tier}: _fallback ห้ามซ้ำ`);
    for (const a of AGENTS) {
      if (conf[a] !== null) assert.ok(fb.includes(a), `tier ${tier}: ${a} ใช้ได้แต่ไม่อยู่ใน _fallback`);
    }
  }
});

test("agy: t1/t2 = gemini-4-argon · t3–t5 = flash · t0 = null (ไม่มี overdrive เหนือ t1)", () => {
  assert.equal(cfg.tiers.t0.agy, null);
  for (const tier of ["t1", "t2"]) {
    assert.match(cfg.tiers[tier].agy.model, /^gemini-4-argon-(high|medium|low)$/, `tier ${tier}: agy ต้องใช้ gemini-4-argon`);
  }
  for (const tier of ["t3", "t4", "t5"]) {
    assert.match(cfg.tiers[tier].agy.model, /^gemini-3\.8-flash-/, `tier ${tier}: agy คงเป็น flash`);
  }
});

test("agy: --print เป็น arg สุดท้ายทั้งสองโหมด · read-only ใช้ --agent baan-readonly · write ใช้ --mode auto (ไม่จำกัด)", () => {
  const { readArgs, writeArgs } = cfg.agents.agy;
  for (const args of [readArgs, writeArgs]) assert.equal(args.at(-1), "--print", `ต้องจบด้วย --print: ${JSON.stringify(args)}`);
  const agent = (args) => args[args.indexOf("--agent") + 1];
  assert.equal(agent(readArgs), "baan-readonly", "read-only ต้องใช้ --agent baan-readonly เพื่อบังคับห้ามเขียนไฟล์จริง");
  assert.ok(!readArgs.includes("--sandbox"));
  const mode = (args) => args[args.indexOf("--mode") + 1];
  assert.equal(mode(writeArgs), "auto");
});

test("agy: workspaceDirArgs ใส่ --add-dir เฉพาะโหมดอ่านและเมื่อรู้ราก workspace และต้องมาก่อน --print", async () => {
  const { buildArgs } = await import("../src/runner.mjs");
  const def = cfg.agents.agy;
  assert.deepEqual(def.workspaceDirArgs, ["--add-dir", "<WORKSPACE_ROOT>"], "agy ต้องประกาศ workspaceDirArgs");
  const ro = buildArgs(def, "gemini-4-argon-high", "", false, "a.txt", "C:/ws");
  assert.deepEqual(ro.slice(ro.indexOf("--add-dir"), ro.indexOf("--add-dir") + 2), ["--add-dir", "C:/ws"], "โหมดอ่านต้องมี --add-dir <ราก workspace>");
  assert.ok(ro.indexOf("--add-dir") < ro.indexOf("--print"), "--add-dir ต้องอยู่ก่อน --print");
  for (const args of [
    buildArgs(def, "gemini-4-argon-high", "", true, "a.txt", "C:/ws"), // โหมดเขียน: ห้ามขยายขอบเขตเขียน
    buildArgs(def, "gemini-4-argon-high", "", false, "a.txt", ""),    // ไม่เจอ workspace config: ไม่มี flag ค้าง
  ]) assert.ok(!args.includes("--add-dir"), `ห้ามมี --add-dir: ${JSON.stringify(args)}`);
  for (const name of ["claude", "codex"]) {
    assert.ok(!cfg.agents[name].workspaceDirArgs, `${name} ไม่มี workspaceDirArgs (จำกัดการอ่านไม่ใช่ข้อจำกัดของตัวนี้)`);
  }
});

test("claude: read-only อนุญาตเฉพาะ tool/คำสั่งอ่านอย่างเดียว · write = bypassPermissions (ไม่จำกัด)", () => {
  const tools = (args) => args[args.indexOf("--allowedTools") + 1].split(",");
  const { readArgs, writeArgs } = cfg.agents.claude;
  const ro = tools(readArgs);
  for (const t of ["Read", "Grep", "Glob"]) assert.ok(ro.includes(t), `read-only ต้องมี ${t}`);
  assert.ok(ro.some((t) => t.startsWith("Bash(git log")), "read-only ต้องรันคำสั่งอ่านอย่างเดียวได้ (เช่น git log)");
  for (const t of ro) {
    assert.ok(!["Bash", "PowerShell", "Edit", "MultiEdit", "Write", "NotebookEdit"].includes(t), `read-only ห้ามมี ${t} แบบไม่จำกัด`);
    assert.ok(!/^(Bash|PowerShell)\((node|npm|python|pwsh|powershell|cmd|git (commit|push|checkout|reset|branch|merge|rebase))/.test(t), `read-only ห้ามคำสั่งที่เขียนได้: ${t}`);
  }
  assert.ok(!readArgs.includes("--permission-mode"), "read-only ต้องไม่ auto-accept การแก้ไฟล์");
  assert.equal(writeArgs[writeArgs.indexOf("--permission-mode") + 1], "bypassPermissions");
  assert.ok(!writeArgs.includes("--allowedTools"), "bypassPermissions ไม่ต้องมี allow-list");
  assert.ok(cfg.agents.codex.writeArgs.includes("--dangerously-bypass-approvals-and-sandbox"), "codex โหมดเขียนต้องไม่มี sandbox");
  assert.ok(cfg.agents.codex.readArgs.includes("read-only"), "codex โหมดอ่านยังเป็น sandbox read-only");
});

test("opencode: ไม่มี effortArgs (effort อยู่ใน model string) · stdin · read-only = ไม่ใส่ --auto · write = --auto", () => {
  const def = cfg.agents.opencode;
  assert.equal(def.promptVia, "stdin", "prompt ต้องทาง stdin — prompt ของ role ยาวเกิน command-line limit ของ Windows");
  assert.ok(!def.effortArgs, "effort ส่งผ่าน #variant ใน model อยู่แล้ว ห้ามมี effortArgs");
  assert.ok(!def.readArgs.includes("--auto"), "read-mode ห้าม auto-approve: non-interactive ที่ไม่มี --auto จะปฏิเสธสิ่งที่ต้องขออนุญาต (กันเขียนไฟล์)");
  assert.ok(def.writeArgs.includes("--auto"), "write-mode ต้อง --auto เพราะไม่มีคนกดอนุมัติกลางทาง");
});

test("opencode: t0–t2 = null (GLM ไม่ถึงระดับ) · t3/t4/t5 = flash (high/low/low) ตามชนิดงาน", () => {
  for (const tier of ["t0", "t1", "t2"]) assert.equal(cfg.tiers[tier].opencode, null, `${tier}: GLM ยังไม่ถึงระดับ tier นี้`);
  const expect = {
    t3: "zai-coding-plan/glm-5.3-flash#high",
    t4: "zai-coding-plan/glm-5.3-flash#low",
    t5: "zai-coding-plan/glm-5.3-flash#low",
  };
  for (const [tier, model] of Object.entries(expect)) assert.equal(cfg.tiers[tier].opencode?.model, model, `tier ${tier} ผัง GLM ผิด`);
});

test("setup/agy มี profile ที่ readArgs อ้างถึง: ชื่อตรง · ไม่มี tool เขียนไฟล์ · hook ชี้ guard · guard parse ได้", async () => {
  const { spawnSync } = await import("node:child_process");
  const setup = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "setup", "agy");
  const { readArgs } = cfg.agents.agy;
  const profile = readArgs[readArgs.indexOf("--agent") + 1];
  const agentMd = readFileSync(path.join(setup, "agents", profile, "agent.md"), "utf8");
  assert.equal(agentMd.match(/^name:\s*(\S+)\s*$/m)?.[1], profile, "name ใน agent.md ต้องตรงกับ --agent ใน readArgs");
  const tools = agentMd.split("---")[1].split("\n").filter((l) => /^\s*-\s+/.test(l)).map((l) => l.replace(/^\s*-\s+/, "").trim());
  assert.deepEqual(tools, ["view_file", "grep_search", "find_by_name", "list_dir"], "read-only ไม่มี terminal/network/write tools");
  for (const t of tools) assert.ok(!/write|replace|edit|create|delete|sed_file/.test(t), `toolset ห้ามมี tool เขียนไฟล์: ${t}`);
  const hooks = JSON.parse(readFileSync(path.join(setup, "hooks.example.json"), "utf8"));
  const cmd = hooks["baan-readonly-guard"].PreToolUse[0].hooks[0].command;
  assert.match(cmd, /<HOME>\/\.gemini\/config\/baan-readonly-guard\.js$/, "ตัวอย่างต้องใช้ <HOME> ไม่ใช่ path ของเครื่องใดเครื่องหนึ่ง");
  assert.equal(hooks["baan-readonly-guard"].PreToolUse[0].matcher, ".*");
  const check = spawnSync(process.execPath, ["--check", path.join(setup, "baan-readonly-guard.js")], { encoding: "utf8" });
  assert.equal(check.status, 0, check.stderr);
});
