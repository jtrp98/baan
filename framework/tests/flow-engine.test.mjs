import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cli, parse } from "../src/cli.mjs";
import { scaffoldKnowledgeModule } from "../src/knowledge-scaffold.mjs";
import { appendTestPlanFile, appendWaveFile, scanWaves } from "../src/flow-lock.mjs";

const TEAM_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const realCfg = JSON.parse(readFileSync(path.join(TEAM_DIR, "agents.json"), "utf8"));

function setupWorkspace(t) {
  const root = mkdtempSync(path.join(tmpdir(), "baan-flow-eng-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const kbRoot = path.join(root, "knowledge");
  const projDir = path.join(kbRoot, "school-bot");
  const repoA = path.join(root, "target", "repo-a");
  const repoB = path.join(root, "target", "repo-b");
  mkdirSync(path.join(projDir, "modules"), { recursive: true });
  mkdirSync(repoA, { recursive: true });
  mkdirSync(repoB, { recursive: true });
  writeFileSync(path.join(projDir, "INDEX.md"), "---\nproject: school-bot\ntarget: school-bot\nplatform: web\n---\n# school-bot\n", "utf8");

  const kr = {
    name: "kb",
    path: kbRoot,
    layout: "project",
    targets: [{ name: "school-bot", path: repoA }],
  };
  const scaffold = scaffoldKnowledgeModule(kr, "school-bot", "quiz", { targetName: "school-bot", platform: "web" });
  writeFileSync(path.join(root, "baan.config.json"), JSON.stringify({
    knowledge_roots: [kr],
    defaults: { execution_mode: "headless", max_parallel: 4 },
  }, null, 2), "utf8");

  return { root, kbRoot, modDir: scaffold.dir, repoA, repoB };
}

test("cli parse: baan flow commands and flags parse cleanly", () => {
  const o = parse(["flow", "answer", "--module", "school-bot/quiz", "--ticket", "T-1", "--answer", "Yes", "--by", "user", "--source", "chat"]);
  assert.equal(o.command, "flow");
  assert.equal(o.subject, "answer");
  assert.equal(o.module, "school-bot/quiz");
  assert.equal(o.ticket, "T-1");
  assert.equal(o.answer, "Yes");

  const a = parse(["flow", "approve", "--module", "school-bot/quiz", "--gate", "G-SPEC", "--by", "user", "--decision", "ok", "--source", "chat"]);
  assert.equal(a.command, "flow");
  assert.equal(a.subject, "approve");
  assert.equal(a.gate, "G-SPEC");
});

test("flow-engine: end-to-end 7 stages, parallel wave slots (<=4), repair loop, and immutable wave lock", async (t) => {
  const { root, modDir, repoB } = setupWorkspace(t);
  const localConfig = { agents: { claude: true, codex: true, agy: true } };
  const calls = [];
  let maxConcurrentBuild = 0;
  let activeBuild = 0;
  let qaRuns = 0;

  const stepRunner = async (job) => {
    calls.push({ stage: job.stage, role: job.role, agent: job.agent, slot: job.slot, subTaskId: job.subTaskId, prompt: readFileSync(job.promptFile, "utf8") });
    if (job.stage === "spec") {
      return {
        ok: true,
        result: {
          status: "done",
          summary: "Requirements collected",
          artifacts_written: ["shared/requirements/F1-core.md"],
          tickets: [],
          knowledge_impact: { required: false, plan: "", affected_paths: [] },
          has_db_changes: false,
          failed_tests: [],
        },
      };
    }
    if (job.stage === "arch_survey" || job.stage === "arch_design") {
      return {
        ok: true,
        result: {
          status: "done",
          summary: `Completed ${job.stage}`,
          artifacts_written: ["build/contracts/INDEX.md"],
          tickets: [],
          knowledge_impact: { required: false, plan: "", affected_paths: [] },
          has_db_changes: job.stage === "arch_design",
          failed_tests: [],
        },
      };
    }
    if (job.stage === "dba") {
      return {
        ok: true,
        result: {
          status: "done",
          summary: "SQL generated",
          artifacts_written: ["build/db/001.sql"],
          tickets: [],
          knowledge_impact: { required: false, plan: "", affected_paths: [] },
          has_db_changes: true,
          failed_tests: [],
        },
      };
    }
    if (job.stage === "pm") {
      appendWaveFile(modDir, {
        title: "Wave 1 Parallel",
        owns: ["a.mjs", "b.mjs"],
        tasks: [
          { id: "W1-A", title: "Part A", owns: ["a.mjs"] },
          { id: "W1-B", title: "Part B", owns: ["b.mjs"], repo: repoB },
        ],
      });
      return {
        ok: true,
        result: {
          status: "done",
          summary: "Wave 1 planned",
          artifacts_written: ["build/waves/wave-001.md"],
          tickets: [],
          knowledge_impact: { required: false, plan: "", affected_paths: [] },
          has_db_changes: false,
          failed_tests: [],
        },
      };
    }
    if (job.stage === "build") {
      activeBuild++;
      maxConcurrentBuild = Math.max(maxConcurrentBuild, activeBuild);
      await new Promise((r) => setTimeout(r, 25));
      activeBuild--;
      return {
        ok: true,
        result: {
          status: "done",
          summary: `Built ${job.subTaskId || job.waveId}`,
          artifacts_written: [],
          tickets: [],
          knowledge_impact: { required: false, plan: "", affected_paths: [] },
          has_db_changes: false,
          failed_tests: [],
        },
      };
    }
    if (job.stage === "testplan") {
      appendTestPlanFile(modDir, { title: "System Test 1", owns: ["tests/e2e.test.mjs"] });
      return {
        ok: true,
        result: {
          status: "done",
          summary: "Test plan created",
          artifacts_written: ["build/test-plan/TP-001.md"],
          tickets: [],
          knowledge_impact: { required: false, plan: "", affected_paths: [] },
          has_db_changes: false,
          failed_tests: [],
        },
      };
    }
    if (job.stage === "check") {
      qaRuns++;
      if (qaRuns === 1) {
        return {
          ok: true,
          result: {
            status: "failed",
            summary: "1 test failed",
            artifacts_written: ["tests/e2e.test.mjs"],
            tickets: [],
            knowledge_impact: { required: false, plan: "", affected_paths: [] },
            has_db_changes: false,
            failed_tests: [{ case_id: "TC-001", file: "tests/e2e.test.mjs", command: "npm test", error: "AssertionError: expected 1" }],
          },
        };
      }
      return {
        ok: true,
        result: {
          status: "done",
          summary: "All autotests pass",
          artifacts_written: ["tests/e2e.test.mjs"],
          tickets: [],
          knowledge_impact: { required: false, plan: "", affected_paths: [] },
          has_db_changes: false,
          failed_tests: [],
        },
      };
    }
    throw new Error(`unexpected stage ${job.stage}`);
  };

  // Dry run first
  const dry = await cli(["flow", "start", "--module", "school-bot/quiz", "--workspace", root, "--dry-run"], { cfg: realCfg, localConfig });
  assert.equal(dry.dryRun, true);
  assert.equal(dry.routes.dba.role, "dba");
  assert.equal(dry.routes.dba.agent, "codex");
  assert.equal(dry.routes.testplan.role, "testplan");
  assert.equal(dry.routes.testplan.agent, "claude");

  // Start -> hits G-SPEC
  let res = await cli(["flow", "start", "--module", "school-bot/quiz", "--goal", "Quiz timer", "--workspace", root], { cfg: realCfg, localConfig, stepRunner });
  assert.equal(res.pendingGate, "G-SPEC");

  // Approve G-SPEC -> runs arch_survey -> arch_design -> dba -> hits G-ARCH-DBA
  await cli(["flow", "approve", "--module", "school-bot/quiz", "--gate", "G-SPEC", "--by", "user", "--decision", "ok", "--source", "chat", "--workspace", root], { cfg: realCfg, localConfig });
  res = await cli(["flow", "start", "--module", "school-bot/quiz", "--workspace", root], { cfg: realCfg, localConfig, stepRunner });
  assert.equal(res.pendingGate, "G-ARCH-DBA");

  // Approve G-ARCH-DBA -> runs pm -> hits G-WAVES
  await cli(["flow", "approve", "--module", "school-bot/quiz", "--gate", "G-ARCH-DBA", "--by", "user", "--decision", "ok", "--source", "chat", "--workspace", root], { cfg: realCfg, localConfig });
  res = await cli(["flow", "start", "--module", "school-bot/quiz", "--workspace", root], { cfg: realCfg, localConfig, stepRunner });
  assert.equal(res.pendingGate, "G-WAVES");

  // Approve G-WAVES -> runs build (2 parallel sub-tasks across repoA & repoB) -> testplan -> check fail -> repair wave -> check pass -> completed
  await cli(["flow", "approve", "--module", "school-bot/quiz", "--gate", "G-WAVES", "--by", "user", "--decision", "ok", "--source", "chat", "--workspace", root], { cfg: realCfg, localConfig });
  res = await cli(["flow", "start", "--module", "school-bot/quiz", "--workspace", root], { cfg: realCfg, localConfig, stepRunner });
  assert.equal(res.stage, "completed");
  assert.equal(res.status, "completed");
  assert.equal(maxConcurrentBuild, 2, "independent multi-repo sub-tasks in a wave must run concurrently");
  assert.equal(qaRuns, 2);

  // Repair wave must receive ONLY failed test case context
  const repairCall = calls.filter((c) => c.stage === "build").at(-1);
  assert.match(repairCall.prompt, /TC-001/);
  assert.match(repairCall.prompt, /AssertionError: expected 1/);

  // Waves wave-001 and wave-fix-1-1 must both be done & locked
  const waves = scanWaves(modDir);
  assert.deepEqual(waves.map((w) => [w.id, w.status]), [
    ["wave-001", "done"],
    ["wave-fix-1-1", "done"],
  ]);
  assert.equal(res.lockedCount, 3); // wave-001, wave-fix-1-1, TP-001
});

test("flow-engine: upstream escalation from build pauses at waiting_human", async (t) => {
  const { root, modDir } = setupWorkspace(t);
  const localConfig = { agents: { claude: true, codex: true, agy: true } };
  appendWaveFile(modDir, { title: "Wave 1", owns: ["a.mjs"] });

  const stepRunner = async (job) => {
    if (job.stage === "spec") {
      return { ok: true, result: { status: "done", summary: "ok", artifacts_written: [], tickets: [], knowledge_impact: { required: false, plan: "", affected_paths: [] }, has_db_changes: false, failed_tests: [] } };
    }
    if (["arch_survey", "arch_design", "pm"].includes(job.stage)) {
      return { ok: true, result: { status: "done", summary: "ok", artifacts_written: [], tickets: [], knowledge_impact: { required: false, plan: "", affected_paths: [] }, has_db_changes: false, failed_tests: [] } };
    }
    if (job.stage === "build") {
      return { ok: true, result: { status: "escalate_upstream", summary: "DB missing column", artifacts_written: [], tickets: [], knowledge_impact: { required: false, plan: "", affected_paths: [] }, has_db_changes: false, failed_tests: [], upstream_issue: { target_stage: "dba", reason: "Need status column in table" } } };
    }
    throw new Error(`unexpected ${job.stage}`);
  };

  await cli(["flow", "start", "--module", "school-bot/quiz", "--workspace", root], { cfg: realCfg, localConfig, stepRunner });
  await cli(["flow", "approve", "--module", "school-bot/quiz", "--gate", "G-SPEC", "--by", "user", "--decision", "ok", "--source", "chat", "--workspace", root], { cfg: realCfg, localConfig });
  await cli(["flow", "start", "--module", "school-bot/quiz", "--workspace", root], { cfg: realCfg, localConfig, stepRunner });
  await cli(["flow", "approve", "--module", "school-bot/quiz", "--gate", "G-ARCH-DBA", "--by", "user", "--decision", "ok", "--source", "chat", "--workspace", root], { cfg: realCfg, localConfig });
  await cli(["flow", "start", "--module", "school-bot/quiz", "--workspace", root], { cfg: realCfg, localConfig, stepRunner });
  await cli(["flow", "approve", "--module", "school-bot/quiz", "--gate", "G-WAVES", "--by", "user", "--decision", "ok", "--source", "chat", "--workspace", root], { cfg: realCfg, localConfig });
  const res = await cli(["flow", "start", "--module", "school-bot/quiz", "--workspace", root], { cfg: realCfg, localConfig, stepRunner });

  assert.equal(res.status, "waiting_human");
  assert.equal(res.waitingReason, "upstream_escalation");
  assert.match(res.openTickets[0].question, /Need status column in table/);
});
