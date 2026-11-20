import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  appendTestPlanFile,
  appendWaveFile,
  lockArtifact,
  markSuperseded,
  parseFlowMarkdown,
  scanTestPlans,
  scanWaves,
  setArtifactStatus,
  verifyLockedArtifacts,
} from "../src/flow-lock.mjs";
import { initFlowState, saveFlowState } from "../src/flow-state.mjs";
import { lintKnowledge } from "../src/knowledge-index.mjs";

function makeModuleFixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "baan-flow-lock-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const projDir = path.join(root, "school-bot");
  const modDir = path.join(projDir, "modules", "quiz");
  mkdirSync(path.join(modDir, "build", "waves"), { recursive: true });
  mkdirSync(path.join(modDir, "build", "test-plan"), { recursive: true });
  writeFileSync(path.join(projDir, "INDEX.md"), "---\ntarget: school-bot\nplatform: web\n---\n# school-bot\n", "utf8");
  writeFileSync(path.join(modDir, "INDEX.md"), "---\nstatus: draft\nplatform: web\n---\n# quiz\n", "utf8");
  return { root, projDir, modDir };
}

test("flow-lock: parseFlowMarkdown reads frontmatter, owns, commands, and baan-wave sub-tasks", () => {
  const { modDir } = makeModuleFixture({ after: () => {} });
  try {
    const created = appendWaveFile(modDir, {
      title: "API + Service",
      round: 1,
      owns: ["src/a.mjs", "src/b.mjs"],
      dependsOn: ["wave-000"],
      build: "npm run build",
      test_targeted: "npm test",
      tasks: [
        { id: "T1", title: "Service", owns: ["src/a.mjs"] },
        { id: "T2", title: "Route", owns: ["src/b.mjs"] },
      ],
    });
    const parsed = parseFlowMarkdown(created.file);
    assert.equal(parsed.id, "wave-001");
    assert.equal(parsed.status, "pending");
    assert.deepEqual(parsed.owns, ["src/a.mjs", "src/b.mjs"]);
    assert.deepEqual(parsed.dependsOn, ["wave-000"]);
    assert.equal(parsed.tasks.length, 2);
    assert.equal(parsed.tasks[1].id, "T2");
  } finally {
    rmSync(path.dirname(path.dirname(path.dirname(modDir))), { recursive: true, force: true });
  }
});

test("flow-lock: done wave/test-plan is locked with SHA-256 and rejects edits or deletions", (t) => {
  const { root, modDir } = makeModuleFixture(t);
  const state = initFlowState("school-bot", "quiz", "Build quiz");
  const w1 = appendWaveFile(modDir, { title: "First wave", owns: ["src/a.mjs"] }, state);
  const tp1 = appendTestPlanFile(modDir, { title: "First test plan", owns: ["tests/a.test.mjs"] }, state);

  setArtifactStatus(modDir, w1.relPath, "done", {}, state);
  setArtifactStatus(modDir, tp1.relPath, "done", {}, state);
  saveFlowState(modDir, state);

  assert.equal(verifyLockedArtifacts(modDir, state.lockedFiles).ok, true);
  assert.throws(
    () => setArtifactStatus(modDir, w1.relPath, "pending", {}, state),
    (err) => err.failureClass === "IMMUTABLE_ARTIFACT_VIOLATION",
  );
  assert.throws(
    () => markSuperseded(modDir, "wave", "wave-001", "wave-002", "change", state),
    (err) => err.failureClass === "IMMUTABLE_ARTIFACT_VIOLATION",
  );

  // Tamper with done wave directly on disk -> detected by verifyLockedArtifacts and lintKnowledge
  writeFileSync(w1.file, readFileSync(w1.file, "utf8") + "\n<!-- tampered -->\n", "utf8");
  const check = verifyLockedArtifacts(modDir, state.lockedFiles);
  assert.equal(check.ok, false);
  assert.equal(check.violations[0].reason, "modified");

  const lint = lintKnowledge(root);
  assert.ok(lint.errors.some((e) => e.includes("wave-001.md")));

  // Deleting a locked TP is also caught as missing
  unlinkSync(tp1.file);
  const checkMissing = verifyLockedArtifacts(modDir, state.lockedFiles);
  assert.ok(checkMissing.violations.some((v) => v.relPath === tp1.relPath && v.reason === "missing"));
});

test("flow-lock: pending wave can be marked superseded and replaced by a new appended wave", (t) => {
  const { modDir } = makeModuleFixture(t);
  const state = initFlowState("school-bot", "quiz", "Initial");
  const w1 = appendWaveFile(modDir, { title: "Wave 1", owns: ["src/a.mjs"] }, state);
  setArtifactStatus(modDir, w1.relPath, "done", {}, state);
  const w2 = appendWaveFile(modDir, { title: "Wave 2 old", owns: ["src/b.mjs"], dependsOn: ["wave-001"] }, state);
  const w3 = appendWaveFile(modDir, { title: "Wave 3 new", owns: ["src/b.mjs", "src/c.mjs"], dependsOn: ["wave-001"] }, state);
  markSuperseded(modDir, "wave", w2.id, w3.id, "Requirement changed", state);
  lockArtifact(state, modDir, w1.relPath);

  const waves = scanWaves(modDir);
  assert.deepEqual(waves.map((w) => [w.id, w.status]), [
    ["wave-001", "done"],
    ["wave-002", "superseded"],
    ["wave-003", "pending"],
  ]);
  const indexText = readFileSync(path.join(modDir, "build", "waves", "INDEX.md"), "utf8");
  assert.match(indexText, /superseded by wave-003/);
  assert.equal(scanTestPlans(modDir).length, 0);
});
