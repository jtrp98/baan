import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  applyStepResult,
  initFlowState,
  recordGateApproval,
  recordTicketAnswer,
  startNewRound,
} from "../src/flow-state.mjs";
import { appendWaveFile, setArtifactStatus } from "../src/flow-lock.mjs";

const cleanResult = (extra = {}) => ({
  status: "done",
  summary: "ok",
  artifacts_written: [],
  tickets: [],
  knowledge_impact: { required: false, plan: "", affected_paths: [] },
  has_db_changes: false,
  failed_tests: [],
  ...extra,
});

test("flow-state: full lifecycle with knowledge restructure, batched SA->BA OQ, DBA skip/run, and gates", (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-flow-state-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(path.join(dir, "build", "waves"), { recursive: true });

  const state = initFlowState("school-bot", "notify", "Add absence alert");
  assert.equal(state.stage, "spec");

  // 1. BA asks a ticket -> waiting_human -> user answers -> written to shared/oq/INDEX.md
  applyStepResult(state, "spec", cleanResult({
    status: "needs_input",
    tickets: [{ id: "T-1", to: "user", question: "ส่งแจ้งเตือนผ่านช่องทางไหน?", options: ["LINE", "Email"] }],
  }), { moduleDir: dir });
  assert.equal(state.status, "waiting_human");
  assert.equal(state.openTickets.length, 1);

  assert.throws(() => recordTicketAnswer(state, { ticketId: "T-1", answer: "LINE", by: "ai", source: "x" }), /--by user/);
  recordTicketAnswer(state, { ticketId: "T-1", answer: "LINE", by: "user", source: "chat", moduleDir: dir });
  assert.equal(state.status, "ready");
  assert.match(readFileSync(path.join(dir, "shared", "oq", "INDEX.md"), "utf8"), /resolved/);

  // 2. BA completes with knowledge_impact -> G-SPEC -> G-KB-RESTRUCTURE -> knowledge_restructure -> arch_survey
  applyStepResult(state, "spec", cleanResult({
    knowledge_impact: { required: true, plan: "Split module", affected_paths: ["modules/notify"] },
  }), { moduleDir: dir });
  assert.equal(state.pendingGate, "G-SPEC");
  recordGateApproval(state, { gateId: "G-SPEC", decision: "approve spec", by: "user", source: "chat" });
  assert.equal(state.pendingGate, "G-KB-RESTRUCTURE");
  recordGateApproval(state, { gateId: "G-KB-RESTRUCTURE", decision: "approve restructure", by: "user", source: "chat" });
  assert.equal(state.stage, "knowledge_restructure");

  applyStepResult(state, "knowledge_restructure", cleanResult(), { moduleDir: dir });
  assert.equal(state.stage, "arch_survey");
  applyStepResult(state, "arch_survey", cleanResult(), { moduleDir: dir });
  assert.equal(state.stage, "arch_design");

  // 3. SA Pass 2 batches logic OQ back to spec -> user answers -> spec returns straight to arch_design
  applyStepResult(state, "arch_design", cleanResult({
    status: "needs_input",
    tickets: [{ id: "T-SA-1", to: "spec", question: "ถ้านักเรียนลาป่วยซ้ำวันเดียวกันต้องแจ้งซ้ำไหม?" }],
  }), { moduleDir: dir });
  assert.equal(state.stage, "spec");
  assert.equal(state.returnStageAfterSpec, "arch_design");
  recordTicketAnswer(state, { ticketId: "T-SA-1", answer: "ไม่แจ้งซ้ำ", by: "user", source: "chat", moduleDir: dir });
  applyStepResult(state, "spec", cleanResult(), { moduleDir: dir });
  assert.equal(state.stage, "arch_design");

  // 4. SA Pass 2 finishes with DB changes -> dba -> G-ARCH-DBA -> pm -> G-WAVES -> build -> testplan -> check -> completed
  applyStepResult(state, "arch_design", cleanResult({ has_db_changes: true }), { moduleDir: dir });
  assert.equal(state.stage, "dba");
  applyStepResult(state, "dba", cleanResult(), { moduleDir: dir });
  assert.equal(state.pendingGate, "G-ARCH-DBA");
  recordGateApproval(state, { gateId: "G-ARCH-DBA", decision: "approve sql", by: "user", source: "chat" });
  assert.equal(state.stage, "pm");

  applyStepResult(state, "pm", cleanResult(), { moduleDir: dir });
  assert.equal(state.pendingGate, "G-WAVES");
  recordGateApproval(state, { gateId: "G-WAVES", decision: "approve waves", by: "user", source: "chat" });
  assert.equal(state.stage, "build");

  const w1 = appendWaveFile(dir, { title: "Wave 1", owns: ["src/a.mjs"] }, state);
  setArtifactStatus(dir, w1.relPath, "done", {}, state);
  applyStepResult(state, "build", cleanResult(), { moduleDir: dir });
  assert.equal(state.stage, "testplan");
  applyStepResult(state, "testplan", cleanResult(), { moduleDir: dir });
  assert.equal(state.stage, "check");
  applyStepResult(state, "check", cleanResult(), { moduleDir: dir });
  assert.equal(state.stage, "completed");
  assert.equal(state.status, "completed");
  assert.ok(state.lockedFiles[w1.relPath], "done wave must stay locked");

  // 5. Next iteration round preserves locked files and enables deltaMode
  startNewRound(state, { goal: "Add SMS fallback" });
  assert.equal(state.round, 2);
  assert.equal(state.deltaMode, true);
  assert.equal(state.stage, "spec");
  assert.ok(state.lockedFiles[w1.relPath], "round 2 must keep round 1 wave lock");
});

test("flow-state: QA repair loop caps at 2 rounds then stops for user decision", () => {
  const state = initFlowState("p", "m", "g");
  state.stage = "check";

  applyStepResult(state, "check", cleanResult({
    status: "failed",
    failed_tests: [{ case_id: "TC-1", file: "tests/a.test.mjs", error: "expected 200 got 500" }],
  }));
  assert.equal(state.stage, "build");
  assert.equal(state.repairPending, true);
  assert.equal(state.repairRound, 1);

  // Repair 1 returns straight to check (skips testplan)
  applyStepResult(state, "build", cleanResult());
  assert.equal(state.stage, "check");
  assert.equal(state.repairPending, false);

  // Fail 2 -> repair 2
  applyStepResult(state, "check", cleanResult({
    status: "failed",
    failed_tests: [{ case_id: "TC-1", file: "tests/a.test.mjs", error: "still 500" }],
  }));
  assert.equal(state.repairRound, 2);
  assert.equal(state.stage, "build");
  applyStepResult(state, "build", cleanResult());
  assert.equal(state.stage, "check");

  // Fail 3 -> exceeds maxRepairRounds (2) -> waiting_human ticket
  applyStepResult(state, "check", cleanResult({
    status: "failed",
    failed_tests: [{ case_id: "TC-1", file: "tests/a.test.mjs", error: "persistent failure" }],
  }));
  assert.equal(state.status, "waiting_human");
  assert.equal(state.waitingReason, "repair_limit_exceeded");
  assert.equal(state.openTickets.length, 1);
});
