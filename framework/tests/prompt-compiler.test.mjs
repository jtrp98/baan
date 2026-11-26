import test from "node:test";
import assert from "node:assert/strict";
import { compileExecutionPrompt, resolveModelFamily } from "../src/prompt-compiler.mjs";

const PROVIDERS = ["claude", "codex", "agy"];
const ROLES = ["planner", "worker", "verifier"];

test("resolveModelFamily maps provider models across all 3 providers", () => {
  assert.equal(resolveModelFamily("claude", "opus"), "opus");
  assert.equal(resolveModelFamily("claude", "claude-sonnet-5.5"), "sonnet");
  assert.equal(resolveModelFamily("claude", "haiku"), "haiku");
  assert.equal(resolveModelFamily("codex", "gpt-6.2-astra"), "gpt-6.2-astra");
  assert.equal(resolveModelFamily("codex", "gpt-6.2-sol"), "gpt-6.2-sol");
  assert.equal(resolveModelFamily("codex", "gpt-6.1-terra"), "gpt-6.1-terra");
  assert.equal(resolveModelFamily("agy", "gemini-4-neon"), "gemini-4-neon");
  assert.equal(resolveModelFamily("agy", "gemini-4-carbon"), "gemini-4-carbon");
  assert.equal(resolveModelFamily("agy", "gemini-pro-orchestrator"), "gemini-pro-orchestrator");
  assert.equal(resolveModelFamily("agy", "gemini-pro-orchestrator-neon"), "gemini-pro-orchestrator");
  assert.equal(resolveModelFamily("agy", "gemini-4-hydrogen"), "gemini-4-hydrogen");
});

test("compileExecutionPrompt compiles all 3 providers x 3 execution roles with zero unresolved placeholders", () => {
  const models = { claude: "opus", codex: "gpt-6.2-sol", agy: "gemini-4-neon" };
  for (const provider of PROVIDERS) {
    for (const role of ROLES) {
      const compiled = compileExecutionPrompt({
        provider,
        role,
        model: models[provider],
        effort: "medium",
        tier: "t3",
        tierLabel: "Standard",
        packet: { id: "WP-1", goal: "test" },
        nativeSchema: true,
      });
      assert.ok(compiled.systemPrompt.includes(`[baan: ${role}]`), `${provider}/${role} must carry role marker`);
      assert.ok(!compiled.systemPrompt.includes("{{"), `${provider}/${role} must not leave unresolved template tokens`);
      assert.ok(compiled.userPrompt.includes('"WP-1"'), `${provider}/${role} userPrompt must contain serialized packet`);
      assert.ok(compiled.combinedPrompt.includes(compiled.systemPrompt));
      assert.ok(compiled.combinedPrompt.includes(compiled.userPrompt));
    }
  }
});

test("Native Style Guard: each provider uses its official prompting style and own subagent tool only", () => {
  const claude = compileExecutionPrompt({ provider: "claude", role: "worker", model: "opus", effort: "high", packet: { id: "WP-1" } });
  assert.match(claude.systemPrompt, /<role>/);
  assert.match(claude.systemPrompt, /<core_contract>/);
  assert.match(claude.systemPrompt, /<output_contract>/);
  assert.match(claude.systemPrompt, /Agent.*Task/);
  assert.ok(!claude.systemPrompt.includes("collaboration.spawn_agent"), "Claude prompt must not reference Codex subagent tool");
  assert.ok(!claude.systemPrompt.includes("invoke_subagent"), "Claude prompt must not reference Agy subagent tool");

  const codex = compileExecutionPrompt({ provider: "codex", role: "worker", model: "gpt-6.2-sol", effort: "xhigh", packet: { id: "WP-1" } });
  assert.match(codex.systemPrompt, /## Goal/);
  assert.match(codex.systemPrompt, /## Context/);
  assert.match(codex.systemPrompt, /## Constraints/);
  assert.match(codex.systemPrompt, /## Done When/);
  assert.match(codex.systemPrompt, /do not stop at a proposal/i, "Codex worker should include Bias Toward Action");
  assert.match(codex.systemPrompt, /collaboration\.spawn_agent/);
  assert.ok(!codex.systemPrompt.includes("invoke_subagent"), "Codex prompt must not reference Agy subagent tool");

  const agy = compileExecutionPrompt({ provider: "agy", role: "planner", model: "gemini-4-neon", effort: "high", packet: { id: "WP-1" } });
  assert.match(agy.systemPrompt, /Explore -> Plan/);
  assert.match(agy.systemPrompt, /invoke_subagent/);
  assert.ok(!agy.systemPrompt.includes("collaboration.spawn_agent"), "Agy prompt must not reference Codex subagent tool");
});

test("Core Contract Zero-Drift Guard: non-negotiable BAAN invariants appear in all 3 providers", () => {
  for (const provider of PROVIDERS) {
    const planner = compileExecutionPrompt({ provider, role: "planner", model: "opus", packet: {} });
    assert.match(planner.systemPrompt, /Read-only role/i);
    assert.match(planner.systemPrompt, /plan\.result/);

    const worker = compileExecutionPrompt({ provider, role: "worker", model: "opus", packet: {} });
    assert.match(worker.systemPrompt, /Edit only files within `owns`/);
    assert.match(worker.systemPrompt, /Red-Test First/);
    assert.match(worker.systemPrompt, /worker\.result/);

    const verifier = compileExecutionPrompt({ provider, role: "verifier", model: "opus", packet: {} });
    assert.match(verifier.systemPrompt, /Strict read-only independence/);
    assert.match(verifier.systemPrompt, /without relying on any Worker narrative/i);
    assert.match(verifier.systemPrompt, /verifier\.result/);
  }
});

test("Model-Family Overlay injects distinct model guidance within the same provider", () => {
  const neon = compileExecutionPrompt({ provider: "agy", role: "worker", model: "gemini-4-neon", effort: "high", packet: {} });
  const carbon = compileExecutionPrompt({ provider: "agy", role: "worker", model: "gemini-4-carbon", effort: "high", packet: {} });
  const orch = compileExecutionPrompt({ provider: "agy", role: "planner", model: "gemini-pro-orchestrator", effort: "", packet: {} });
  const hydrogen = compileExecutionPrompt({ provider: "agy", role: "worker", model: "gemini-4-hydrogen", effort: "low", packet: {} });
  assert.match(neon.systemPrompt, /Gemini 4 Neon/);
  assert.match(carbon.systemPrompt, /Gemini 4 Carbon/);
  assert.match(orch.systemPrompt, /Antigravity Orchestrator/);
  assert.match(hydrogen.systemPrompt, /Gemini 4 Hydrogen/);
  assert.notEqual(neon.systemPrompt, hydrogen.systemPrompt);
  assert.notEqual(carbon.systemPrompt, neon.systemPrompt);

  const astra = compileExecutionPrompt({ provider: "codex", role: "worker", model: "gpt-6.2-astra", effort: "high", packet: {} });
  const sol = compileExecutionPrompt({ provider: "codex", role: "worker", model: "gpt-6.2-sol", effort: "xhigh", packet: {} });
  assert.match(astra.systemPrompt, /GPT-6\.2 Astra/);
  assert.match(sol.systemPrompt, /GPT-6\.2 Sol/);
  assert.notEqual(astra.systemPrompt, sol.systemPrompt);
});
