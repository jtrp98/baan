// Live providers run only against synthetic temporary repositories, never real workspace data.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { cli } from "../src/cli.mjs";
import { loadAgentsConfig } from "../src/config.mjs";

const args = process.argv.slice(2), opts = { agents: ["codex", "claude", "agy"], tier: "t3" };
for (let i = 0; i < args.length; i++) {
  if (!["--agents", "--tier"].includes(args[i]) || !args[i + 1]) throw new Error("use --agents codex,claude,agy --tier t3");
  const name = args[i++];
  if (name === "--agents") opts.agents = args[i].split(",").filter(Boolean); else opts.tier = args[i];
}
const config = loadAgentsConfig();
assert.ok(opts.agents.length);
const root = mkdtempSync(path.join(tmpdir(), "baan-live-")), results = [];
for (const agent of opts.agents) {
  assert.ok(config.agents[agent] && config.tiers[opts.tier]?.[agent], `unsupported agent/tier: ${agent}/${opts.tier}`);
  const repo = path.join(root, agent); mkdirSync(repo);
  const nonce = randomBytes(16).toString("hex");
  writeFileSync(path.join(repo, "secret.txt"), nonce);
  writeFileSync(path.join(repo, "value.mjs"), 'export const value = "";\n');
  writeFileSync(path.join(repo, "value.test.mjs"), "import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {value} from './value.mjs';test('copies exact nonce',()=>assert.equal(value,readFileSync(new URL('./secret.txt',import.meta.url),'utf8')));\n");
  const git = (...a) => execFileSync("git", ["-C", repo, ...a], { encoding: "utf8", windowsHide: true });
  git("init", "-q"); git("config", "user.name", "live fixture"); git("config", "user.email", "fixture@invalid");
  git("add", "."); git("commit", "-qm", "synthetic fixture");
  const head = git("rev-parse", "HEAD");
  const packet = { id: "SMOKE", title: "copy fixture nonce", goal: "Read secret.txt and export its exact text as value in value.mjs. Run the supplied checks.", tasks: [], repo: { path: repo }, owns: ["value.mjs"], read_first: [{ path: "secret.txt" }],
    acceptance: [{ id: "AC-1", text: "value equals the nonce in secret.txt", source: "synthetic live fixture" }], depends_on: [], risk: "high",
    commands: { build: "node --check value.mjs", test_targeted: "node --test value.test.mjs", test_full: "node --test value.test.mjs" } };
  const file = path.join(root, `${agent}.json`); writeFileSync(file, JSON.stringify(packet));
  const cfg = { agents: { [agent]: config.agents[agent] }, tiers: Object.fromEntries(Object.entries(config.tiers).map(([tier, row]) => [tier, { [agent]: row[agent], _fallback: [agent] }])) };
  try {
    const waiting = await cli(["run", "--direct", "--packet", file, "--workspace", root, "--agent", agent, "--tier", opts.tier, "--planner-tier", opts.tier, "--timeout", "420"], { cfg });
    await cli(["decide", "SMOKE", "--run", waiting.dir, "--approve", "--by", "user", "--decision", "synthetic test confirmation", "--source", "explicit live-smoke invocation; fixture only"], { cfg });
    const result = await cli(["run", "--resume", waiting.dir], { cfg });
    assert.equal(result.ok, true, JSON.stringify(result));
    git("diff", "--exit-code", "--", "secret.txt", "value.test.mjs");
    assert.equal(git("rev-parse", "HEAD"), head);
    assert.ok(readFileSync(path.join(repo, "value.mjs"), "utf8").includes(nonce));
    results.push({ agent, ok: true, dir: result.dir, readonlyVerifier: true });
  } catch (error) { results.push({ agent, ok: false, error: error.message }); }
}
console.log(JSON.stringify({ root, results }, null, 2));
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
