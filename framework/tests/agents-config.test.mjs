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

test("agy: t0–t3 = gemini-4-neon (xhigh→low) · t4 = gemini-4-hydrogen (low) · t5 = gemini-3.8-flash (low)", () => {
  const expected = {
    t0: { model: "gemini-4-neon", effort: "xhigh" },
    t1: { model: "gemini-4-neon", effort: "high" },
    t2: { model: "gemini-4-neon", effort: "medium" },
    t3: { model: "gemini-4-neon", effort: "low" },
    t4: { model: "gemini-4-hydrogen", effort: "low" },
    t5: { model: "gemini-3.8-flash", effort: "low" },
  };
  for (const [tier, want] of Object.entries(expected)) {
    assert.deepEqual(cfg.tiers[tier].agy, want, `tier ${tier}: agy ต้องตรงตามผัง Neon/Hydrogen/Flash`);
  }
  assert.deepEqual(cfg.tiers.t0._fallback, ["codex", "agy", "claude"], "t0 _fallback ต้องรวม agy ด้วย");
});

test("codex & claude: ตรงตามผังแพ็กเกจ $20 บนเส้น Pareto (MODEL-POLICY.md)", () => {
  const expectedCodex = {
    t0: { model: "gpt-6.2-astra", effort: "xhigh" },
    t1: { model: "gpt-6.2-astra", effort: "high" },
    t2: { model: "gpt-6.2-sol", effort: "xhigh" },
    t3: { model: "gpt-6.2-sol", effort: "medium" },
    t4: { model: "gpt-6.2-sol", effort: "low" },
    t5: { model: "gpt-6.1-terra", effort: "low" },
  };
  const expectedClaude = {
    t0: { model: "opus", effort: "xhigh" },
    t1: { model: "opus", effort: "high" },
    t2: { model: "opus", effort: "medium" },
    t3: { model: "sonnet", effort: "high" },
    t4: { model: "haiku", effort: "high" },
    t5: { model: "haiku", effort: "low" },
  };
  for (const [tier, want] of Object.entries(expectedCodex)) {
    assert.deepEqual(cfg.tiers[tier].codex, want, `tier ${tier}: codex ต้องตรงตามผัง Pareto`);
  }
  for (const [tier, want] of Object.entries(expectedClaude)) {
    assert.deepEqual(cfg.tiers[tier].claude, want, `tier ${tier}: claude ต้องตรงตามผัง Claude Pro $20`);
  }
  for (const tier of ["t4", "t5"]) {
    assert.deepEqual(cfg.tiers[tier]._fallback, ["codex", "claude", "agy"], `${tier} _fallback ต้องเรียงตามความคุ้มค่า`);
  }
});

test("Policy Guard: ห้ามใส่โมเดลนอกแพ็กเกจ $20 หรือ effort ที่ตกหน้าผาความคุ้มค่า และต้องมี MODEL-POLICY.md", async () => {
  const { existsSync } = await import("node:fs");
  const policyPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "MODEL-POLICY.md");
  assert.ok(existsSync(policyPath), "ต้องมี framework/MODEL-POLICY.md คู่กับ agents.json");

  const forbiddenModels = new Set(["fable", "gemini-4-carbon"]);
  for (const [tier, conf] of Object.entries(cfg.tiers)) {
    for (const agent of AGENTS) {
      const entry = conf[agent];
      if (!entry) continue;
      assert.ok(!forbiddenModels.has(entry.model), `tier ${tier}/${agent}: ห้ามใช้โมเดลนอกแพ็กเกจ $20 (${entry.model})`);
      if ((entry.model.startsWith("gpt-6.2-") || entry.model === "opus") && entry.effort === "max") {
        assert.fail(`tier ${tier}/${agent}: ห้ามใช้ effort 'max' บน ${entry.model} (ผลตอบแทนไม่คุ้มต้นทุน)`);
      }
      if (tier !== "t0" && entry.model === "gemini-4-neon" && entry.effort === "xhigh") {
        assert.fail(`tier ${tier}/agy: สงวน gemini-4-neon xhigh ไว้เฉพาะ t0 เท่านั้น`);
      }
    }
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
