import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { resolveRoleRoute, escalateRoleTier, formatRoleMatrix } from "../src/routing.mjs";
import { callSession, resolveWorkerTier } from "../src/session.mjs";
import { schedule } from "../src/scheduler.mjs";
import { cli } from "../src/cli.mjs";
import { save } from "../src/store.mjs";
import { fixture, packet, runAt, passing } from "./helpers.mjs";

const realCfg = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "agents.json"), "utf8"));

test("เปิดครบ 3 ค่าย: แต่ละ role เลือกค่ายและรุ่นตามความถนัดจริง (Availability-Driven Specialist)", () => {
  const localAll = { agents: { agy: true, codex: true, claude: true } };

  const planner = resolveRoleRoute(realCfg, "planner", { localConfig: localAll });
  assert.equal(planner.agent, "agy");
  assert.equal(planner.tier, "t3");
  assert.equal(planner.model, "gemini-4-neon");
  assert.equal(planner.effort, "medium");

  const arch = resolveRoleRoute(realCfg, "arch", { localConfig: localAll });
  assert.equal(arch.agent, "agy");
  assert.equal(arch.tier, "t2");
  assert.equal(arch.model, "gemini-4-neon");
  assert.equal(arch.effort, "high");

  const ui = resolveRoleRoute(realCfg, "ui", { localConfig: localAll });
  assert.equal(ui.agent, "agy");
  assert.equal(ui.model, "gemini-4-neon");

  const worker = resolveRoleRoute(realCfg, "worker", { localConfig: localAll });
  assert.equal(worker.agent, "codex");
  assert.equal(worker.tier, "t3");
  assert.equal(worker.model, "gpt-6.2-sol");
  assert.equal(worker.effort, "medium");

  const verifier = resolveRoleRoute(realCfg, "verifier", { localConfig: localAll, workerAgent: worker.agent });
  assert.equal(verifier.agent, "claude");
  assert.equal(verifier.tier, "t2");
  assert.equal(verifier.model, "opus");
  assert.equal(verifier.effort, "high");
  assert.equal(verifier.independentCrossProvider, true);

  const spec = resolveRoleRoute(realCfg, "spec", { localConfig: localAll });
  assert.equal(spec.agent, "claude");
  assert.equal(spec.model, "sonnet");
  assert.equal(spec.effort, "high");

  // Docs: critical -> claude opus, standard -> codex sol low, light -> codex terra low
  const docsCritical = resolveRoleRoute(realCfg, "worker", { localConfig: localAll, packet: { kind: "docs", goal: "ADR for auth schema" } });
  assert.equal(docsCritical.routingRole, "docs");
  assert.equal(docsCritical.tier, "t1");
  assert.equal(docsCritical.agent, "claude");
  assert.equal(docsCritical.model, "opus");

  const docsStd = resolveRoleRoute(realCfg, "worker", { localConfig: localAll, packet: { kind: "docs", goal: "update module requirements" } });
  assert.equal(docsStd.routingRole, "docs");
  assert.equal(docsStd.tier, "t2");
  assert.equal(docsStd.agent, "codex");
  assert.equal(docsStd.model, "gpt-6.2-sol");
  assert.equal(docsStd.effort, "low");

  const docsLight = resolveRoleRoute(realCfg, "docs", { localConfig: localAll, tier: "t3" });
  assert.equal(docsLight.agent, "codex");
  assert.equal(docsLight.model, "gpt-6.1-terra");
  assert.equal(docsLight.effort, "low");
});

test("เปิดแค่ claude ใน local.json: ทุก role ใช้ claude อัตโนมัติ พร้อมรุ่นที่เหมาะกับแต่ละ Role x Tier", () => {
  const claudeOnly = { agents: { claude: true, codex: false, agy: false } };

  const planner = resolveRoleRoute(realCfg, "planner", { localConfig: claudeOnly });
  assert.equal(planner.agent, "claude");
  assert.equal(planner.model, "sonnet");
  assert.equal(planner.effort, "high");

  const workerDefault = resolveRoleRoute(realCfg, "worker", { localConfig: claudeOnly });
  assert.equal(workerDefault.agent, "claude");
  assert.equal(workerDefault.model, "sonnet");
  assert.equal(workerDefault.effort, "high");

  const workerContracted = resolveRoleRoute(realCfg, "worker", {
    localConfig: claudeOnly,
    tier: "t4",
    packet: { kind: "code", risk: "low", worker_tier: "t4", contracts: [{ ref: "api.md" }] },
  });
  assert.equal(workerContracted.agent, "claude");
  assert.equal(workerContracted.model, "sonnet");
  assert.equal(workerContracted.effort, "high");

  const docsStd = resolveRoleRoute(realCfg, "worker", { localConfig: claudeOnly, packet: { kind: "docs", goal: "write runbook" } });
  assert.equal(docsStd.agent, "claude");
  assert.equal(docsStd.model, "haiku");
  assert.equal(docsStd.effort, "high");

  const verifier = resolveRoleRoute(realCfg, "verifier", { localConfig: claudeOnly, workerAgent: "claude" });
  assert.equal(verifier.agent, "claude");
  assert.equal(verifier.model, "opus");
  assert.equal(verifier.independentSessionOnly, true);
  assert.equal(verifier.independentCrossProvider, false);
});

test("เปิดแค่ agy ใน local.json: งานออกแบบ/สถาปัตยกรรม/UX-UI ยึด gemini-4-neon ทุก tier และ docs t2 ใช้ hydrogen low", () => {
  const agyOnly = { agents: { agy: true, codex: false, claude: false } };

  for (const role of ["planner", "arch"]) {
    for (const tier of ["t1", "t2", "t3", "t4", "t5"]) {
      const r = resolveRoleRoute(realCfg, role, { localConfig: agyOnly, tier });
      assert.equal(r.agent, "agy");
      assert.equal(r.model, "gemini-4-neon", `${role}/${tier} บน agy ต้องยังคงใช้ gemini-4-neon`);
    }
  }
  const clamped = resolveRoleRoute(realCfg, "arch", { localConfig: agyOnly, tier: "t5" });
  assert.equal(clamped.tier, "t4");
  assert.equal(clamped.clamped, true);
  assert.equal(clamped.effort, "low");

  const docsStd = resolveRoleRoute(realCfg, "docs", { localConfig: agyOnly, tier: "t2" });
  assert.equal(docsStd.model, "gemini-4-hydrogen");
  assert.equal(docsStd.effort, "low");

  const docsLight = resolveRoleRoute(realCfg, "docs", { localConfig: agyOnly, tier: "t3" });
  assert.equal(docsLight.model, "gemini-3.8-flash");
});

test("เปิด 2 ค่าย (codex + agy, ปิด claude): verifier แยกคนละค่ายกับ worker อัตโนมัติ", () => {
  const two = { agents: { codex: true, agy: true, claude: false } };
  const worker = resolveRoleRoute(realCfg, "worker", { localConfig: two });
  assert.equal(worker.agent, "codex");

  const verifier = resolveRoleRoute(realCfg, "verifier", { localConfig: two, workerAgent: worker.agent });
  assert.equal(verifier.agent, "agy");
  assert.equal(verifier.model, "gemini-4-neon");
  assert.equal(verifier.independentCrossProvider, true);
});

test("High-Risk Guard, Contract-Gated Step-Down และ Rework Escalation ทำงานบน Role-Owned Tiers", () => {
  const run = { tier: "t3", plannerTier: "t3" };
  assert.equal(resolveWorkerTier(run, { kind: "code", risk: "high", worker_tier: "t4" }, realCfg), "t2");
  assert.equal(resolveWorkerTier(run, { kind: "code", risk: "low", worker_tier: "t4" }, realCfg), "t3");
  assert.equal(resolveWorkerTier(run, { kind: "code", risk: "low", worker_tier: "t4", contracts: [{ ref: "c.md" }] }, realCfg), "t4");
  assert.equal(resolveWorkerTier(run, { kind: "code", risk: "low", rework: 1 }, realCfg), "t2");
  assert.equal(resolveWorkerTier(run, { kind: "code", risk: "low", rework: 2 }, realCfg), "t1");
  assert.equal(escalateRoleTier(realCfg, "worker", "t4"), "t3");
  assert.equal(escalateRoleTier(realCfg, "worker", "t1"), "t1");
});

test("Strict No-Impersonation: ระบุ --agent ที่ปิดใน local.json ต้อง error ทันทีไม่แอบสลับค่าย", () => {
  const claudeClosed = { agents: { claude: false, codex: true, agy: true } };
  assert.throws(
    () => resolveRoleRoute(realCfg, "verifier", { forcedAgent: "claude", localConfig: claudeClosed }),
    /ไม่สวมรอย/
  );
});

test("Strict No-Impersonation (Runtime Rate Limit): ติดลิมิตระหว่างรันต้องหยุดแจ้ง waiting_human (PROVIDER_LIMIT) ห้ามแอบสลับค่าย", async (t) => {
  const { root, repo } = fixture(t);
  const p = packet(repo, "WP-LIM");
  const run = runAt(root, [p]);
  run.tier = "t3";
  run.explicitAgent = null;

  const calledAgents = [];
  await assert.rejects(
    () => callSession(run, p, "planner", realCfg, {
      localConfig: { agents: { agy: true, codex: true, claude: true } },
      runner: async (def) => {
        calledAgents.push(def.command);
        return { ok: false, exitCode: 1, answer: "", error: "429 rate limit exceeded: quota exhausted", stdout: "", stderr: "rate limit exceeded", durationMs: 5 };
      },
    }),
    (err) => err.failureClass === "PROVIDER_LIMIT" && /ไม่สวมรอย/.test(err.message)
  );
  // Must have attempted ONLY the chosen specialist (agy), never silently switched to codex/claude.
  assert.deepEqual(calledAgents, ["agy"]);

  // Verify scheduler transitions PROVIDER_LIMIT to waiting_human (inbox) rather than env_failed.
  const p2 = packet(repo, "WP-LIM2");
  const run2 = runAt(root, [p2]);
  await schedule(run2, realCfg, {
    execute: passing,
    session: async () => {
      throw Object.assign(new Error("[PROVIDER_LIMIT] agy quota exhausted"), { failureClass: "PROVIDER_LIMIT" });
    },
  });
  assert.equal(p2.state, "waiting_human");
  assert.equal(p2.failureClass, "PROVIDER_LIMIT");
  assert.match(p2.questions[0], /PROVIDER_LIMIT/);
});

test("cli --dry-run แสดง resolved_routes ตาม local.json จริง และ formatRoleMatrix แสดงครบ 12 roles", async (t) => {
  const { root, repo } = fixture(t);
  const file = path.join(root, "plan.json");
  save(file, { packages: [packet(repo)] });

  const dryAll = await cli(["run", "--plan", file, "--workspace", root, "--dry-run"], {
    cfg: realCfg,
    localConfig: { agents: { agy: true, codex: true, claude: true } },
  });
  assert.equal(dryAll.resolved_routes.planner.agent, "agy");
  assert.equal(dryAll.resolved_routes.planner.model, "gemini-4-neon");
  assert.equal(dryAll.resolved_routes.worker.agent, "codex");
  assert.equal(dryAll.resolved_routes.verifier.agent, "claude");

  const dryClaude = await cli(["run", "--plan", file, "--workspace", root, "--dry-run"], {
    cfg: realCfg,
    localConfig: { agents: { agy: false, codex: false, claude: true } },
  });
  assert.equal(dryClaude.resolved_routes.planner.agent, "claude");
  assert.equal(dryClaude.resolved_routes.planner.model, "sonnet");
  assert.equal(dryClaude.resolved_routes.worker.agent, "claude");
  assert.equal(dryClaude.resolved_routes.verifier.agent, "claude");
  assert.equal(dryClaude.resolved_routes.verifier.model, "opus");

  const matrix = formatRoleMatrix(realCfg, { agents: { agy: true, codex: true, claude: true } });
  for (const role of ["planner", "worker", "verifier", "docs", "arch", "spec", "pm", "build", "check", "survey", "ui", "review"]) {
    assert.ok(matrix.includes(`[${role}]`), `matrix ต้องมีบทบาท ${role}`);
  }
});
