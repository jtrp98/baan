import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const cfg = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "agents.json"), "utf8"));
const AGENTS = ["claude", "codex", "agy"];
const EXPECTED_ROLES = ["planner", "worker", "verifier", "docs", "arch", "spec", "pm", "build", "check", "survey", "ui", "review"];
const NEON_PINNED_ROLES = ["planner", "arch", "survey", "ui", "review"];

test("agents.json ใช้โครงสร้าง Role-Owned Tiers ครบ 12 บทบาท และทุก tier ประกาศครบทั้ง 3 ค่าย", () => {
  assert.equal(cfg.tiers, undefined, "เลิกใช้ global tiers กลางแล้ว — ทุกบทบาทต้องประกาศ tiers ของตัวเองใน roles");
  for (const role of EXPECTED_ROLES) {
    const def = cfg.roles?.[role];
    assert.ok(def, `ต้องมีบทบาท ${role} ใน agents.json.roles`);
    assert.equal(def.strict, true, `บทบาท ${role} ต้องเปิด strict: true (Strict No-Impersonation)`);
    assert.ok(Array.isArray(def.preference) && def.preference.length === 3, `บทบาท ${role} ต้องประกาศ preference ครบ 3 ค่าย`);
    assert.equal(new Set(def.preference).size, 3, `บทบาท ${role}: preference ห้ามซ้ำ`);
    for (const a of def.preference) assert.ok(AGENTS.includes(a), `บทบาท ${role}: preference มีค่ายที่ไม่รู้จัก (${a})`);
    assert.ok(def.defaultTier && def.tiers?.[def.defaultTier], `บทบาท ${role}: defaultTier (${def.defaultTier}) ต้องมีจริงใน tiers`);

    for (const [tier, td] of Object.entries(def.tiers)) {
      for (const a of AGENTS) {
        assert.ok(a in td, `${role}/${tier} ต้องประกาศ ${a} ไว้เสมอ`);
        assert.equal(typeof td[a]?.model, "string", `${role}/${tier}/${a} ต้องมี model`);
        assert.ok(td[a].model.length > 0);
        assert.equal(typeof td[a]?.effort, "string", `${role}/${tier}/${a} ต้องมี effort`);
      }
    }
  }
  assert.equal(cfg.roles.verifier.mustDifferFromWorker, true, "verifier ต้องตั้ง mustDifferFromWorker: true");
});

test("งานออกแบบระบบและ UX/UI บน agy ยึด gemini-4-neon ทุก tier (ปรับเฉพาะ effort) และ docs t2 ใช้ hydrogen low", () => {
  for (const role of NEON_PINNED_ROLES) {
    for (const [tier, td] of Object.entries(cfg.roles[role].tiers)) {
      assert.equal(td.agy.model, "gemini-4-neon", `${role}/${tier}/agy ต้องยึด gemini-4-neon เสมอ`);
    }
    assert.equal(cfg.roles[role].preference[0], "agy", `${role} ต้องมี agy เป็น specialist อันดับ 1`);
  }
  assert.deepEqual(cfg.roles.docs.tiers.t2.agy, { model: "gemini-4-hydrogen", effort: "low" });
  assert.deepEqual(cfg.roles.docs.tiers.t3.agy, { model: "gemini-3.8-flash", effort: "low" });
  assert.deepEqual(cfg.roles.docs.tiers.t1.preference, ["claude", "agy", "codex"]);
  assert.deepEqual(cfg.roles.docs.tiers.t2.preference, ["codex", "claude", "agy"]);
});

test("Policy Guard: เฉพาะแพ็กเกจ $20/เดือน, ห้าม effort ที่ตกหน้าผาความคุ้มค่า, และต้องมี MODEL-POLICY.md ครบ 11 เกณฑ์", () => {
  const policyPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "MODEL-POLICY.md");
  assert.ok(existsSync(policyPath), "ต้องมี framework/MODEL-POLICY.md คู่กับ agents.json");
  const policyText = readFileSync(policyPath, "utf8");
  assert.match(policyText, /Quality & Accuracy/);
  assert.match(policyText, /Speed & Latency/);
  assert.match(policyText, /Cost per Successful Task/);
  assert.match(policyText, /Risk & Verification/);

  const forbiddenModels = new Set(["fable", "gemini-4-carbon", "gpt-6-luna"]);
  const allowedXhighRoles = new Set(["planner", "arch", "worker", "build", "verifier", "check"]);

  for (const [role, def] of Object.entries(cfg.roles)) {
    for (const [tier, td] of Object.entries(def.tiers)) {
      for (const agent of AGENTS) {
        const entry = td[agent];
        assert.ok(!forbiddenModels.has(entry.model), `${role}/${tier}/${agent}: ห้ามใช้โมเดลนอกแพ็กเกจ $20 หรือถูกครอบงำ (${entry.model})`);
        if ((entry.model.startsWith("gpt-6.2-") || entry.model === "opus" || entry.model === "sonnet" || entry.model === "haiku") && entry.effort === "max") {
          assert.fail(`${role}/${tier}/${agent}: ห้ามใช้ effort 'max' บน ${entry.model} (ผลตอบแทนไม่คุ้มต้นทุน)`);
        }
        if (entry.model === "gemini-4-neon" && entry.effort === "xhigh") {
          assert.fail(`${role}/${tier}/agy: ห้ามใช้ gemini-4-neon xhigh (ลดเพดาน AGY ลงมาที่ high เพื่อความคุ้มค่าและเวลาตอบสนอง)`);
        }
        if (entry.model === "gpt-6.2-sol" && entry.effort === "xhigh") {
          assert.fail(`${role}/${tier}/codex: ห้ามใช้ gpt-6.2-sol xhigh (+5.7% แลก +59% — ให้ใช้ medium หรือ low)`);
        }
        if (entry.model === "sonnet" && entry.effort === "xhigh") {
          assert.fail(`${role}/${tier}/claude: ห้ามใช้ sonnet xhigh (ถูกครอบงำโดย opus high)`);
        }
        if (entry.effort === "xhigh") {
          assert.ok(tier === "t1" && allowedXhighRoles.has(role), `${role}/${tier}/${agent}: สงวน xhigh ไว้เฉพาะ t1 Overdrive ของสายวิศวกรรม/ตรวจรับเท่านั้น`);
        }
        if (entry.model === "gemini-4-hydrogen" && entry.effort !== "low") {
          assert.fail(`${role}/${tier}/agy: ห้ามใช้ gemini-4-hydrogen ที่ effort '${entry.effort}' (ถูกครอบงำโดย gemini-4-neon)`);
        }
        if (entry.model === "gpt-6.1-terra" && entry.effort !== "low") {
          assert.fail(`${role}/${tier}/codex: ห้ามใช้ gpt-6.1-terra ที่ effort '${entry.effort}' (ถูกครอบงำโดย gpt-6.2-sol)`);
        }
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
