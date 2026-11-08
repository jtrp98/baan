import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const cfg = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "agents.json"), "utf8"));
const AGENTS = ["claude", "codex", "agy"];

test("ทุก tier ประกาศครบทั้ง 3 native agents และรูปแบบถูกต้อง", () => {
  for (const [tier, conf] of Object.entries(cfg.tiers)) {
    for (const a of AGENTS) {
      assert.ok(a in conf, `tier ${tier} ต้องประกาศ ${a} ไว้เสมอ`);
      if (conf[a] !== null) {
        assert.equal(typeof conf[a].model, "string", `tier ${tier}/${a}: ต้องมี model เป็น string`);
        assert.ok(conf[a].model.length > 0);
      }
    }
  }
});

test("_fallback ของทุก tier ต้องเป็นลำดับ native agent ที่รู้จัก ไม่ซ้ำ ไม่ว่าง", () => {
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

test("agy: t0 = null (รักษา tier scale) · t1–t3 = gemini-4-argon · t4–t5 = flash", () => {
  assert.equal(cfg.tiers.t0.agy, null, "t0 agy ต้องเป็น null เพราะเพดาน argon-high อยู่ที่ t1 แล้ว");
  for (const tier of ["t1", "t2", "t3"]) {
    assert.match(cfg.tiers[tier].agy.model, /^gemini-4-argon/, `tier ${tier}: agy ต้องใช้ gemini-4-argon`);
  }
  for (const tier of ["t4", "t5"]) {
    assert.match(cfg.tiers[tier].agy.model, /^gemini-3\.8-flash/, `tier ${tier}: agy คงเป็น flash`);
  }
});

test("agy: --print เป็น arg สุดท้าย · read-only ใช้ --mode plan · write ใช้ --mode accept-edits", () => {
  const { readArgs, writeArgs } = cfg.agents.agy;
  for (const args of [readArgs, writeArgs]) assert.equal(args.at(-1), "--print", `ต้องจบด้วย --print: ${JSON.stringify(args)}`);
  const modeRead = readArgs[readArgs.indexOf("--mode") + 1];
  assert.equal(modeRead, "plan", "read-only ต้องใช้ --mode plan");
  const modeWrite = writeArgs[writeArgs.indexOf("--mode") + 1];
  assert.equal(modeWrite, "accept-edits", "write safe default ต้องใช้ --mode accept-edits");
});

test("workspaceDirArgs ส่ง --add-dir ทั้งโหมดอ่านและเขียนเมื่อระบุ workspace root", async () => {
  const { buildArgs } = await import("../src/runner.mjs");
  for (const name of AGENTS) {
    const def = cfg.agents[name];
    assert.deepEqual(def.workspaceDirArgs, ["--add-dir", "<WORKSPACE_ROOT>"], `${name} ต้องมี workspaceDirArgs`);
    const ro = buildArgs(def, "model", "effort", false, "a.txt", "C:/ws");
    assert.ok(ro.includes("--add-dir"), `${name} read mode ต้องมี --add-dir`);
    const rw = buildArgs(def, "model", "effort", true, "a.txt", "C:/ws");
    assert.ok(rw.includes("--add-dir"), `${name} write mode ต้องมี --add-dir เพื่ออ่าน knowledge ข้าม repo ได้`);
  }
});

test("claude & codex: safe defaults ใน package agents.json", () => {
  const { readArgs: claudeRead, writeArgs: claudeWrite } = cfg.agents.claude;
  assert.equal(claudeRead[claudeRead.indexOf("--permission-mode") + 1], "plan");
  assert.equal(claudeWrite[claudeWrite.indexOf("--permission-mode") + 1], "acceptEdits");
  assert.ok(!claudeWrite.includes("bypassPermissions"), "package default ต้องไม่เป็น bypassPermissions");

  const { readArgs: codexRead, writeArgs: codexWrite } = cfg.agents.codex;
  assert.equal(codexRead[codexRead.indexOf("-s") + 1], "read-only");
  assert.equal(codexWrite[codexWrite.indexOf("-s") + 1], "workspace-write");
  assert.ok(!codexWrite.includes("--dangerously-bypass-approvals-and-sandbox"), "package default ต้องไม่เป็น dangerously bypass");
});

test("setup/agy guard และ profile: รองรับ inspection tools และ subagents โดยไม่มี write tools", async () => {
  const { spawnSync } = await import("node:child_process");
  const setup = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "setup", "agy");
  const agentMd = readFileSync(path.join(setup, "agents", "baan-readonly", "agent.md"), "utf8");
  const tools = agentMd.split("---")[1].split("\n").filter((l) => /^\s*-\s+/.test(l)).map((l) => l.replace(/^\s*-\s+/, "").trim());
  assert.ok(tools.includes("view_file"));
  assert.ok(tools.includes("invoke_subagent"), "guard ต้องอนุญาต invoke_subagent ให้ verifier");
  for (const t of tools) assert.ok(!/write|replace|edit|create|delete|sed_file|terminal|command/.test(t), `toolset ห้ามมี write tool: ${t}`);
  const check = spawnSync(process.execPath, ["--check", path.join(setup, "baan-readonly-guard.js")], { encoding: "utf8" });
  assert.equal(check.status, 0, check.stderr);
});
