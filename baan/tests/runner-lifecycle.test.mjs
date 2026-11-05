import test from "node:test";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { runCli } from "../src/runner.mjs";

const def = { command: process.execPath, useShell: false, answerFrom: "stdout" };
test("idle timeout stops a silent child before its normal completion", async () => {
  const started = Date.now();
  const r = await runCli(def, ["-e", "console.log('start');setTimeout(()=>{},15000)"], "stdin", "", tmpdir(), 30, undefined, { idleTimeoutSec: 1 });
  assert.equal(r.timedOut, true);
  assert.equal(r.idle, true);
  assert.ok(Date.now() - started < 10000);
});
test("progress resets idle timeout and an aborted child cannot return success", async () => {
  const r = await runCli(def, ["-e", "let n=0;const t=setInterval(()=>{console.log(n++);if(n===6)clearInterval(t)},250)"], "stdin", "", tmpdir(), 30, undefined, { idleTimeoutSec: 1 });
  assert.equal(r.ok, true);
  const controller = new AbortController();
  const cancelled = await runCli(def, ["-e", "setTimeout(()=>{},15000)"], "stdin", "", tmpdir(), 30, undefined,
    { signal: controller.signal, onSpawn: () => controller.abort() });
  assert.equal(cancelled.ok, false);
});
test("runner passes per-call read-only context without changing its own environment", async () => {
  const original = process.env.BAAN_READONLY;
  const r = await runCli(def, ["-e", "process.stdout.write(process.env.BAAN_READONLY)"], "stdin", "", tmpdir(), 10, undefined, { env: { BAAN_READONLY: "1" } });
  assert.equal(r.ok, true); assert.equal(r.answer, "1"); assert.equal(process.env.BAAN_READONLY, original);
});
