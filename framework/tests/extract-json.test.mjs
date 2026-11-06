import test from "node:test";
import assert from "node:assert/strict";
import { extractJson } from "../src/plan.mjs";

test("extractJson: parses standard JSON object", () => {
  const input = JSON.stringify({ verdict: "PASS", count: 1 });
  assert.deepEqual(extractJson(input), { verdict: "PASS", count: 1 });
});

test("extractJson: parses JSON inside markdown code block", () => {
  const input = "Here is the result:\n```json\n{\"verdict\":\"PASS\"}\n```\nDone.";
  assert.deepEqual(extractJson(input), { verdict: "PASS" });
});

test("extractJson: parses first balanced JSON when multiple concatenated objects exist", () => {
  const first = { verdict: "PASS", acceptance: [{ id: "AC-1", passed: true }] };
  const second = { verdict: "PASS", acceptance: [{ id: "AC-1", passed: true }] };
  const input = `${JSON.stringify(first)}\n${JSON.stringify(second)}`;
  assert.deepEqual(extractJson(input), first);
});

test("extractJson: handles braces inside string literals without miscounting depth", () => {
  const payload = { note: "braces: {test} and {nested: {value}}", ok: true };
  const input = `${JSON.stringify(payload)}\n{"extra":"ignored"}`;
  assert.deepEqual(extractJson(input), payload);
});

test("extractJson: throws when no JSON object is found", () => {
  assert.throws(() => extractJson("no json here"), /ไม่พบ JSON ในคำตอบของนักวางผัง/);
});
