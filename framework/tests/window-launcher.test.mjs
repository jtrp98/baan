import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createWindowSlotPool, gridGeometry, buildLaunchCmdScript } from "../src/window-launcher.mjs";
import { callSession } from "../src/session.mjs";
import { schedule } from "../src/scheduler.mjs";
import { cli } from "../src/cli.mjs";
import { save } from "../src/store.mjs";
import { fixture, packet, passing } from "./helpers.mjs";

const realCfg = JSON.parse(readFileSync(path.join(process.cwd(), "agents.json"), "utf8"));

test("window-launcher: slot pool assigns 0..3 uniquely and gridGeometry splits screen 2x2", () => {
  const pool = createWindowSlotPool(4);
  const s0 = pool.acquire();
  const s1 = pool.acquire();
  const s2 = pool.acquire();
  const s3 = pool.acquire();
  assert.deepEqual([s0, s1, s2, s3], [0, 1, 2, 3]);
  pool.release(s1);
  assert.equal(pool.acquire(), 1);

  const area = { x: 0, y: 0, width: 1920, height: 1000 };
  assert.deepEqual(gridGeometry(0, area), { slot: 0, x: 0, y: 0, width: 960, height: 500 });
  assert.deepEqual(gridGeometry(1, area), { slot: 1, x: 960, y: 0, width: 960, height: 500 });
  assert.deepEqual(gridGeometry(2, area), { slot: 2, x: 0, y: 500, width: 960, height: 500 });
  assert.deepEqual(gridGeometry(3, area), { slot: 3, x: 960, y: 500, width: 960, height: 500 });
});

test("window-launcher: buildLaunchCmdScript sets UTF-8, title, banner, command, and sentinel done file", () => {
  const script = buildLaunchCmdScript({
    title: "[BAAN #1] WP-1 (worker · codex)",
    cwd: "C:\\src\\repo",
    command: "codex",
    args: ["-m", "gpt-6.2-sol", "Read brief"],
    env: { BAAN_READONLY: "0" },
    pidFile: "C:\\tmp\\wp1.pid",
    doneFile: "C:\\tmp\\wp1.done.json",
    briefFile: "C:\\tmp\\wp1.brief.md",
    bannerLines: ["Package: WP-1"],
  });
  assert.match(script, /chcp 65001 >nul/);
  assert.match(script, /title \[BAAN #1\] WP-1/);
  assert.match(script, /set "BAAN_READONLY=0"/);
  assert.match(script, /codex -m gpt-6\.2-sol "Read brief"/);
  assert.match(script, /wp1\.done\.json/);
});

test("interactive-first: worker exit with file edits runs machine gate -> cross-provider verifier -> done", async (t) => {
  const { root, repo } = fixture(t);
  const p = packet(repo, "WP-INT", { risk: "high", contracts: [{ ref: "code.mjs" }] });
  const run = {
    version: 2,
    id: "interactive-test",
    root,
    dir: path.join(root, ".baan", "runs", "interactive-test"),
    packages: [p],
    tier: "t3",
    plannerTier: "t3",
    verifierTier: "t2",
    agent: "codex",
    explicitAgent: "codex",
    executionMode: "interactive",
    interactiveWindow: "grid",
    maxParallel: 4,
    timeoutSec: 60,
    direct: true,
  };
  mkdirSync(run.dir, { recursive: true });
  save(path.join(run.dir, "run.json"), run);

  const launched = [];
  await schedule(run, realCfg, {
    localConfig: { agents: { codex: true, claude: true, agy: true } },
    execute: passing,
    interactiveRunner: async (spec) => {
      launched.push({ title: spec.title, slot: spec.slot, command: path.basename(spec.command), readonly: spec.env.BAAN_READONLY, args: spec.args });
      if (spec.env.BAAN_READONLY === "0") {
        // Worker edits file in interactive terminal without writing answer JSON.
        writeFileSync(path.join(repo, "code.mjs"), "export const value = 2;\n");
        return { ok: true, exitCode: 0, durationMs: 120, slot: spec.slot };
      }
      // Verifier writes JSON verdict to answer file before exiting.
      const answerMatch = spec.briefFile.replace(/\.brief\.md$/, ".answer.txt");
      writeFileSync(answerMatch, JSON.stringify({
        verdict: "PASS",
        findings: [],
        failure_class: "",
        acceptance: [{ id: "AC-1", passed: true, proof: ["value test"] }],
      }), "utf8");
      return { ok: true, exitCode: 0, durationMs: 80, slot: spec.slot };
    },
  });

  assert.equal(p.state, "done");
  assert.equal(launched.length, 2);
  assert.equal(launched[0].readonly, "0");
  assert.match(launched[0].title, /codex gpt-6\.2-sol\/medium/, "high-risk + contract starts at t3 sol/medium");
  assert.equal(launched[1].readonly, "1");
  assert.match(launched[1].title, /claude opus\/high/, "--agent codex must NOT lock verifier onto codex");
});

test("interactive verifier closed without JSON verdict parks at waiting_human (INTERACTIVE_REVIEW), not OUTPUT_CONTRACT", async (t) => {
  const { root, repo } = fixture(t);
  const p = packet(repo, "WP-REV", { risk: "high" });
  const run = {
    version: 2,
    id: "interactive-review",
    root,
    dir: path.join(root, ".baan", "runs", "interactive-review"),
    packages: [p],
    tier: "t3",
    plannerTier: "t3",
    verifierTier: "t2",
    agent: "codex",
    executionMode: "interactive",
    maxParallel: 4,
    timeoutSec: 60,
    direct: true,
  };
  mkdirSync(run.dir, { recursive: true });
  save(path.join(run.dir, "run.json"), run);

  await schedule(run, realCfg, {
    localConfig: { agents: { codex: true, claude: true, agy: true } },
    execute: passing,
    interactiveRunner: async (spec) => {
      if (spec.env.BAAN_READONLY === "0") {
        writeFileSync(path.join(repo, "code.mjs"), "export const value = 2;\n");
      }
      return { ok: true, exitCode: 0, durationMs: 50, slot: spec.slot };
    },
  });

  assert.equal(p.state, "waiting_human");
  assert.equal(p.failureClass, "INTERACTIVE_REVIEW");
});

test("4-parallel interactive scheduler assigns distinct slots 0..3 across 4 repos or --worktree", async (t) => {
  const { root, makeRepo, repo } = fixture(t);
  const repos = [repo, makeRepo("r2"), makeRepo("r3"), makeRepo("r4")];
  const pkgs = repos.map((r, i) => packet(r, `P-${i + 1}`));
  const file = path.join(root, "plan.json");
  save(file, { packages: pkgs });

  const dry = await cli(["run", "--plan", file, "--agent", "codex", "--workspace", root, "--dry-run"], {
    cfg: realCfg,
    localConfig: { agents: { codex: true, claude: true, agy: true } },
  });
  assert.equal(dry.executionMode, "interactive");
  assert.equal(dry.maxParallel, 4);
  assert.equal(dry.mode, "parallel");
  assert.equal(dry.resolved_routes.worker.agent, "codex");
  assert.equal(dry.resolved_routes.verifier.agent, "claude");
  assert.equal(dry.packages[0].verifier_route.agent, "claude");

  const run = {
    version: 2,
    id: "four-parallel",
    root,
    dir: path.join(root, ".baan", "runs", "four-parallel"),
    packages: pkgs,
    tier: "t3",
    plannerTier: "t3",
    verifierTier: "t2",
    agent: "codex",
    executionMode: "interactive",
    maxParallel: 4,
    timeoutSec: 60,
    direct: false,
    mode: "parallel",
  };
  mkdirSync(run.dir, { recursive: true });
  save(path.join(run.dir, "run.json"), run);

  const seenSlots = new Set();
  await schedule(run, realCfg, {
    localConfig: { agents: { codex: true, claude: true, agy: true } },
    execute: passing,
    interactiveRunner: async (spec) => {
      seenSlots.add(spec.slot);
      await new Promise((r) => setTimeout(r, 40));
      const pkgIdx = pkgs.findIndex((x) => spec.title.includes(x.id));
      writeFileSync(path.join(repos[pkgIdx], "code.mjs"), "export const value = 2;\n");
      return { ok: true, exitCode: 0, durationMs: 40, slot: spec.slot };
    },
  });

  assert.deepEqual([...seenSlots].sort(), [0, 1, 2, 3]);
  assert.ok(pkgs.every((x) => x.state === "done"));
});
