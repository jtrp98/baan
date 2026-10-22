import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAgentsConfig, loadWorkspace } from "../src/config.mjs";
import { parseRoleArgs, resolveRoleTimeout, runRoleAgents } from "../src/role-session.mjs";
import { execute } from "../src/scheduler.mjs";
import { resolveTimeout } from "../src/timeout.mjs";
import { callStageWithFallback } from "../bin/mycelium.mjs";

const okRun = () => ({ ok: true, answer: "DONE", stderr: "", durationMs: 0 });
const limitRun = () => ({ ok: false, answer: "", stderr: "usage limit reached" });
const invalid = [0, -1, 1.5, 86401, NaN, Infinity, null, "1800", false];

test("timeout ที่เลือกต้องเป็น integer ในขอบเขต และค่า override ชนะค่าที่ไม่ได้ใช้", () => {
  for (const value of invalid) {
    assert.throws(() => resolveTimeout({ timeoutSec: value }), /1–86400/);
    assert.throws(() => resolveTimeout({ timeoutSec: 80 }, { _timeoutSec: value }), /1–86400/);
    assert.equal(resolveTimeout({ timeoutSec: 80, explicit: new Set(["timeoutSec"]) }, { _timeoutSec: value }), 80);
    assert.equal(resolveTimeout({ timeoutSec: value }, { _timeoutSec: 90 }), 90);
  }
  for (const value of [1, 86400]) assert.equal(resolveTimeout({ timeoutSec: value }), value);
});

test("role ใช้ shared discovery จาก invocation/--cwd, legacy และ env โดยไม่เปลี่ยน agent/cwd/write", () => {
  const root = mkdtempSync(path.join(tmpdir(), "mycelium-timeout-"));
  const savedEnv = process.env.MYCELIUM_CONFIG;
  delete process.env.MYCELIUM_CONFIG;
  try {
    const cfg = loadAgentsConfig();
    const opts = parseRoleArgs(["--agent", "codex"], root);
    assert.equal(resolveRoleTimeout(opts, cfg), 1800);
    writeFileSync(path.join(root, "mycelium.config.json"), JSON.stringify({ defaults: { timeout_sec: 2100, agent: "agy" } }));
    const nested = path.join(root, "nested");
    mkdirSync(path.join(nested, "mycelium"), { recursive: true });
    const legacy = path.join(nested, "mycelium", "mycelium.json");
    writeFileSync(legacy, JSON.stringify({ defaults: { timeout_sec: 2200 } }));
    assert.equal(resolveRoleTimeout(opts, cfg), 2100);
    const moved = parseRoleArgs(["--cwd", "nested"], root);
    assert.equal(resolveRoleTimeout(moved, cfg), 2200);
    assert.equal(moved.cwd, nested);
    assert.deepEqual(opts.agents, ["codex"]);
    assert.equal(opts.write, false);
    process.env.MYCELIUM_CONFIG = path.join(root, "mycelium.config.json");
    assert.equal(resolveRoleTimeout(moved, cfg), 2100);
    delete process.env.MYCELIUM_CONFIG;
    assert.equal(resolveRoleTimeout({ ...opts, tier: "t0" }, cfg), 3600);
    assert.equal(resolveRoleTimeout(parseRoleArgs(["--timeout", "99", "--tier", "t0"], root), cfg), 99);
    writeFileSync(legacy, JSON.stringify({ defaults: { timeout_sec: null } }));
    assert.throws(() => resolveRoleTimeout(moved, cfg), /1–86400/);
    writeFileSync(legacy, "{ broken");
    assert.throws(() => resolveRoleTimeout(moved, cfg), /อ่าน config ไม่ได้/);
  } finally {
    if (savedEnv === undefined) delete process.env.MYCELIUM_CONFIG;
    else process.env.MYCELIUM_CONFIG = savedEnv;
    rmSync(root, { recursive: true, force: true });
  }
});

test("role fallback ใช้ timeout ที่ resolve แล้วเหมือนกันทุก attempt", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "mycelium-timeout-"));
  try {
    const cfg = loadAgentsConfig();
    const opts = parseRoleArgs(["--tier", "t0", "--timeout", "75"], root);
    opts.timeoutSec = resolveRoleTimeout(opts, cfg);
    const seen = [];
    await runRoleAgents({ cfg, opts, selected: ["codex"], log: () => {}, attempt: async (agent) => {
      seen.push([agent, opts.timeoutSec]);
      return seen.length === 1 ? limitRun() : okRun();
    } });
    assert.deepEqual(seen, [["codex", 75], ["agy", 75]]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("PM/planner และ scheduler ใช้ priority เดียวกัน รวม fallback โดยไม่เรียก provider", async () => {
  const cfg = loadAgentsConfig();
  const root = mkdtempSync(path.join(tmpdir(), "mycelium-timeout-"));
  try {
    const configFile = path.join(root, "config.json");
    writeFileSync(configFile, JSON.stringify({ defaults: { timeout_sec: 2050 } }));
    for (const [tier, explicit, expected] of [["t2", false, 1800], ["t2", false, 2050], ["t0", false, 3600], ["t0", true, 85], ["t2", true, 85]]) {
      const timeoutSec = explicit ? 85 : expected === 1800 ? loadWorkspace().defaults.timeout_sec : loadWorkspace(configFile).defaults.timeout_sec;
      const opts = { agent: "codex", cwd: root, timeoutSec, explicit: new Set(explicit ? ["timeoutSec"] : []), maxParallel: 1 };
      for (const file of ["pm.answer.txt", "planner.answer.txt"]) {
        const seen = [];
        await callStageWithFallback(cfg, opts, root, tier, file, "งานจำลอง", async (_def, _args, _via, _prompt, _cwd, timeout) => {
          seen.push(timeout);
          return seen.length === 1 ? limitRun() : okRun();
        });
        assert.deepEqual(seen, [expected, expected]);
      }
      const seen = [];
      const plan = { tasks: [{ id: "job", role: "be", tier, agent: "codex", task: "งานจำลอง" }] };
      await execute(plan, opts, root, cfg, new Map(), async (_cfg, resolved) => {
        seen.push(resolved.timeoutSec);
        return seen.length === 1 ? limitRun() : okRun();
      });
      assert.deepEqual(seen, [expected, expected]);
      assert.equal(opts.timeoutSec, timeoutSec);
    }
    for (const value of invalid) {
      const opts = { agent: "codex", cwd: root, timeoutSec: value, maxParallel: 1 };
      let called = false;
      await assert.rejects(callStageWithFallback(cfg, opts, root, "t2", "pm.answer.txt", "x", async () => { called = true; return okRun(); }), /1–86400/);
      await assert.rejects(execute({ tasks: [{ id: "job", tier: "t2", agent: "codex" }] }, opts, root, cfg, new Map(), async () => { called = true; return okRun(); }), /1–86400/);
      assert.equal(called, false);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("ทั้งสอง CLI ปฏิเสธ --timeout ที่ผิดก่อนเรียก provider แทนการใช้ default เงียบๆ", () => {
  for (const bin of ["mycelium", "mycelium-role"]) {
    const file = fileURLToPath(new URL(`../bin/${bin}.mjs`, import.meta.url));
    for (const value of ["0", "-1", "1.5", "86401", "NaN", "Infinity", "abc", ""]) {
      const args = [file, "--timeout", ...(value ? [value] : [])];
      const result = spawnSync(process.execPath, args, { encoding: "utf8" });
      assert.equal(result.status, 2, `${bin}: ${value}: ${result.stderr}`);
      assert.match(result.stderr, /1–86400/);
    }
  }
});
