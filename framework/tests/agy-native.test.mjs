import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AgyAdapter, isOrchestratorModel } from "../src/adapters/agy.mjs";
import { performInit, PROVIDER_SKILLS } from "../src/init.mjs";
import { STUB_MARKER } from "../src/role-compiler.mjs";
import { lintKnowledge, updateIndexes } from "../src/knowledge-index.mjs";
import { scaffoldKnowledgeFeature, scaffoldKnowledgeProject } from "../src/knowledge-scaffold.mjs";

const TEAM_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("AgyAdapter: Orchestrator models omit --effort while Carbon/Neon/Hydrogen preserve --effort", () => {
  const adapter = new AgyAdapter();
  assert.equal(isOrchestratorModel("gemini-pro-orchestrator"), true);
  assert.equal(isOrchestratorModel("gemini-pro-orchestrator-neon"), true);
  assert.equal(isOrchestratorModel("gemini-4-carbon"), false);

  const orch = adapter.buildHeadless({
    def: { command: "agy" },
    role: "planner",
    model: "gemini-pro-orchestrator",
    effort: "high",
  });
  assert.ok(orch.args.includes("--model"));
  assert.ok(!orch.args.includes("--effort"), "Orchestrator model must never receive --effort");

  const carbon = adapter.buildHeadless({
    def: { command: "agy" },
    role: "worker",
    model: "gemini-4-carbon",
    effort: "high",
  });
  assert.equal(carbon.args[carbon.args.indexOf("--model") + 1], "gemini-4-carbon");
  assert.equal(carbon.args[carbon.args.indexOf("--effort") + 1], "high");

  const orchInteractive = adapter.buildInteractive({
    def: { command: "agy" },
    role: "planner",
    model: "gemini-pro-orchestrator-neon",
    effort: "medium",
  });
  assert.ok(!orchInteractive.args.includes("--effort"));
});

test("AgyAdapter.probe: detects GEMINI.md and workspace .agents/hooks.json", async () => {
  const ws = mkdtempSync(path.join(tmpdir(), "baan-agy-probe-"));
  try {
    writeFileSync(path.join(ws, "GEMINI.md"), "# Native Orchestrator\n", "utf8");
    mkdirSync(path.join(ws, ".agents", "skills"), { recursive: true });
    writeFileSync(path.join(ws, ".agents", "hooks.json"), "{}", "utf8");

    const adapter = new AgyAdapter();
    const res = await adapter.probe({ command: "nonexistent-agy-binary-xyz" }, { cwd: ws, workspaceRoot: ws });
    assert.equal(res.customInstructions, true);
    assert.equal(res.hooks, true);
    assert.equal(res.skills, true);
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

test("init: cleans up obsolete BAAN .agents/agents/*.md & old managed skills while preserving user files", () => {
  const ws = mkdtempSync(path.join(tmpdir(), "baan-agy-cleanup-"));
  try {
    mkdirSync(path.join(ws, ".agents", "agents"), { recursive: true });
    writeFileSync(path.join(ws, ".agents", "agents", "arch.md"), `${STUB_MARKER}\nold baan stub\n`, "utf8");
    writeFileSync(path.join(ws, ".agents", "agents", "my-custom.md"), "# User custom agent\n", "utf8");

    mkdirSync(path.join(ws, ".agents", "skills", "feature-flow"), { recursive: true });
    writeFileSync(path.join(ws, ".agents", "skills", "feature-flow", ".baan-managed"), "old\n", "utf8");
    mkdirSync(path.join(ws, ".agents", "skills", "user-skill"), { recursive: true });
    writeFileSync(path.join(ws, ".agents", "skills", "user-skill", "SKILL.md"), "# Mine\n", "utf8");

    const logs = [];
    performInit(ws, TEAM_DIR, (m) => logs.push(m));

    assert.equal(existsSync(path.join(ws, ".agents", "agents", "arch.md")), false, "BAAN-managed .agents/agents/*.md must be cleaned up");
    assert.equal(readFileSync(path.join(ws, ".agents", "agents", "my-custom.md"), "utf8"), "# User custom agent\n", "user-created agent must remain untouched");
    assert.equal(existsSync(path.join(ws, ".agents", "skills", "feature-flow")), false, "obsolete BAAN-managed skill in .agents/skills must be removed");
    assert.equal(existsSync(path.join(ws, ".agents", "skills", "user-skill", "SKILL.md")), true, "user skill must remain untouched");
    for (const s of PROVIDER_SKILLS.agy) {
      assert.ok(existsSync(path.join(ws, ".agents", "skills", s, "SKILL.md")), `missing agy skill ${s}`);
    }
    assert.ok(existsSync(path.join(ws, ".agents", "skills", "ui-design-system", "references", "web-rules.md")));
    assert.equal(existsSync(path.join(ws, ".claude", "skills", "agy")), false, "provider-specific agy/ dir must never leak into .claude/skills");
    assert.equal(existsSync(path.join(ws, ".claude", "skills", "repo-map")), false, "agy skills must not be installed into .claude/skills");
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

test("Neutral Knowledge v2: scaffoldKnowledgeProject(neutral) + scaffoldKnowledgeFeature pass lintKnowledge with 0 errors and 0 warnings", () => {
  const kDir = mkdtempSync(path.join(tmpdir(), "baan-neutral-kb-"));
  try {
    const kr = { path: kDir, layout: "project" };
    const proj = scaffoldKnowledgeProject(kr, "billing-api", "billing-api", { layout: "neutral", platform: "web" });
    assert.equal(proj.ok, true);
    assert.equal(proj.layout, "neutral");

    const feat = scaffoldKnowledgeFeature(kr, "billing-api", "invoice-sync", { title: "Invoice Sync" });
    assert.equal(feat.ok, true);
    assert.equal(feat.lean, true);

    updateIndexes(kDir);
    const lint = lintKnowledge(kDir);
    assert.deepEqual(lint.errors, []);
    assert.deepEqual(lint.warnings, []);
    const idx = readFileSync(path.join(kDir, "billing-api", "INDEX.md"), "utf8");
    assert.match(idx, /\[features\/invoice-sync\]\(features\/invoice-sync\/INDEX\.md\)/);
  } finally {
    rmSync(kDir, { recursive: true, force: true });
  }
});
