import { spawn } from "node:child_process";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { changedFiles, hash, matches, snapshot, git } from "./snapshot.mjs";
import { save } from "./store.mjs";
import { looksLikeEnvironmentFailure } from "./failure-class.mjs";

export function command(command, cwd, timeoutSec = 600, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) { resolve({ command, code: null, output: "cancelled", timedOut: false, ok: false }); return; }
    const child = spawn(command, { cwd, shell: true, windowsHide: true });
    let output = "", settled = false, timedOut = false;
    const abort = () => {
      if (!child.pid) return;
      if (process.platform === "win32") spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
      else child.kill("SIGKILL");
    };
    const timer = setTimeout(() => { timedOut = true; abort(); }, timeoutSec * 1000);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    const done = (code, error = "") => {
      if (settled) return;
      settled = true; clearTimeout(timer); signal?.removeEventListener("abort", abort);
      resolve({ command, code, output: output + error, timedOut, ok: code === 0 && !timedOut && !signal?.aborted });
    };
    child.stdout.on("data", (d) => { output = (output + d).slice(-4 * 1024 * 1024); });
    child.stderr.on("data", (d) => { output = (output + d).slice(-4 * 1024 * 1024); });
    child.on("error", (e) => done(null, e.message));
    child.on("close", (code) => done(code));
  });
}
export function counts(output) {
  const get = (...patterns) => { for (const re of patterns) { const m = output.match(re); if (m) return Number(m[1].replaceAll(",", "")); } return null; };
  return {
    passed: get(/# pass (\d+)/, /Passed:\s*([\d,]+)/i, /(\d+) passed/i),
    failed: get(/# fail (\d+)/, /Failed:\s*([\d,]+)/i, /(\d+) failed/i),
    skipped: get(/# skipped? (\d+)/, /Skipped:\s*([\d,]+)/i, /(\d+) skipped/i),
    goPassed: (output.match(/^ok\s+/gm) ?? []).length,
  };
}
export function testNames(output) {
  const names = new Set();
  for (const line of output.split(/\r?\n/)) {
    const tap = line.match(/^\s*# Subtest:\s+(.+)$/);
    const node = line.match(/^\s*[✔✓√]\s+(.+?)(?:\s+\([\d.]+(?:ms|s)\))?\s*$/);
    const dotnet = line.match(/^\s*(?:Passed|\[PASS\])\s+(.+?)(?:\s+\[[^\]]+\])?\s*$/);
    const jest = line.match(/^\s*PASS\s+(.+\.(?:test|spec)\.[cm]?[jt]sx?)\s*$/);
    const name = tap?.[1] ?? node?.[1] ?? dotnet?.[1] ?? jest?.[1];
    if (name?.trim()) names.add(name.trim());
  }
  return names;
}
export async function evidence(run, repo, cmd, { execute = command, signal, basis = null } = {}) {
  const before = snapshot(repo);
  const key = hash(JSON.stringify([repo, before.id, before.head, before.branch, before.index, before.stash, cmd, basis]));
  const file = path.join(run.dir, "evidence", `${key}.json`);
  if (!signal?.aborted && existsSync(file)) {
    const cached = JSON.parse(readFileSync(file, "utf8"));
    return { ...cached, output: cached.output ?? readFileSync(cached.output_file, "utf8") };
  }
  const r = await execute(cmd, repo, run.timeoutSec, signal);
  const after = snapshot(repo);
  const attempt = `${key}-${randomUUID()}`;
  const outputFile = path.join(run.dir, "evidence", `${attempt}.log`);
  save(path.join(run.dir, "evidence", `${attempt}.command.json`), { command: cmd });
  writeFileSync(outputFile, r.output);
  const summary = counts(r.output);
  const result = { ...r, ok: r.ok && !(summary.failed > 0), counts: summary, snapshot: after.id, cacheKey: key, output_file: outputFile,
    result_file: path.join(run.dir, "evidence", `${attempt}.result.json`) };
  const { output: rawOutput, ...record } = result;
  save(result.result_file, record);
  // Build/test commands may generate tracked output; never reuse evidence for a different tree.
  if (["id", "head", "branch", "index", "stash"].every((k) => after[k] === before[k]) && result.ok && !signal?.aborted) save(file, record);
  return result;
}
export async function gate(run, p, options) {
  const results = [];
  for (const cmd of [...new Set([p.commands.build, p.commands.test_targeted, p.commands.test_full])]) {
    results.push(await evidence(run, p.repo.path, cmd, options));
    if (options.signal?.aborted) break;
  }
  const after = snapshot(p.repo.path);
  const changed = changedFiles(p.before, after);
  const outside = changed.filter((f) => !p.owns.some((g) => matches(f, g)));
  for (const key of ["head", "branch", "index", "stash"]) if (p.before[key] !== after[key]) outside.push(`.git/${key}`);
  const output = results.map((r) => r.output).join("\n");
  const names = testNames(output);
  const unmapped = p.acceptance.filter((a) => {
    const mapping = p.result.acceptance.find((x) => x.id === a.id);
    return !mapping?.proof?.length || mapping.proof.some((proof) => typeof proof !== "string" || !names.has(proof.trim()));
  }).map((a) => a.id);
  const failures = results.filter((r) => !r.ok);
  const failureClass = outside.length ? "SCOPE_VIOLATION" : failures.some((r) => r.timedOut || r.code === null || looksLikeEnvironmentFailure(r.output)) ? "ENVIRONMENT_FAILURE" : failures.length ? "IMPLEMENTATION_FAILURE" : "";
  const test_changes = changed.filter((f) => p.before.files[f] != null && /(?:test|spec)[^/]*\.(?:[cm]?[jt]sx?|cs|go|py)$/i.test(f));
  const attempt = `${p.id}-${randomUUID()}`;
  const diff_file = path.join(run.dir, `${attempt}.diff.txt`);
  const snapshots_file = path.join(run.dir, `${attempt}.snapshots.json`);
  const evidence_file = path.join(run.dir, `${attempt}.evidence.json`);
  writeFileSync(diff_file, git(p.repo.path, "diff", "--binary", p.before.tracked, "--"));
  save(snapshots_file, { before: p.before, after });
  const result = { ok: !failureClass, failureClass, results, changed, outside, unmapped, test_changes, snapshot: after.id, diff_file, snapshots_file, evidence_file };
  p.after = after;
  save(evidence_file, { ...result, results: results.map(({ output, ...summary }) => summary) });
  return result;
}
