import test from "node:test";
import assert from "node:assert/strict";
import { updateClis, SUPPORTED_CLIS } from "../src/update-clis.mjs";

test("SUPPORTED_CLIS contains agy, claude, codex with checkCmd and updateCmd", () => {
  const names = SUPPORTED_CLIS.map((c) => c.name);
  assert.deepEqual(names, ["agy", "claude", "codex"]);
  for (const c of SUPPORTED_CLIS) {
    assert.ok(c.checkCmd.includes("--version"));
    assert.ok(c.updateCmd.includes("update"));
  }
});

test("updateClis handles simulated commands and reports results", async () => {
  const logs = [];
  const fakeClis = [
    {
      name: "fake-ok",
      label: "Fake OK",
      checkCmd: 'node -e "console.log(\'1.0.0\')"',
      updateCmd: 'node -e "process.exit(0)"',
    },
    {
      name: "fake-fail",
      label: "Fake Fail",
      checkCmd: 'node -e "console.log(\'1.0.0\')"',
      updateCmd: 'node -e "process.exit(1)"',
    },
    {
      name: "fake-missing",
      label: "Fake Missing",
      checkCmd: "command_that_does_not_exist_at_all_12345",
      updateCmd: "echo none",
    },
  ];
  const res = await updateClis({ clis: fakeClis, onLog: (msg) => logs.push(msg) });
  assert.equal(res.ok, false);
  assert.equal(res.results.length, 3);
  assert.equal(res.results[0].ok, true);
  assert.equal(res.results[1].ok, false);
  assert.equal(res.results[2].ok, false);
  assert.equal(res.results[2].error, "not_found");
});
