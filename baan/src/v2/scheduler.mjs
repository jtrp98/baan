import { existsSync } from "node:fs";
import path from "node:path";
import { event, persist } from "./store.mjs";
import { transitiveFanOut } from "../plan.mjs";
import { alive, repoLock, lock } from "./repolock.mjs";
import { snapshot, matches, fileHash } from "./snapshot.mjs";
import { readiness, documentBasis } from "./packet.mjs";
import { evidence, gate } from "./gate.mjs";
import { callSession } from "./session.mjs";
import { verification } from "./triage.mjs";
import { looksLikeEnvironmentFailure } from "../failure-class.mjs";

const complete = (p) => p?.state === "done";
export function transition(run, p, state, data = {}) {
  Object.assign(p, data, { state }); event(run, "state", { package: p.id, state, failureClass: p.failureClass }); persist(run);
}
function waiting(run, p, questions) { transition(run, p, "waiting_human", { questions }); }
async function sharedDecision(run, p, cfg, options, context) {
  const packet = { id: p.id, goal: p.goal, acceptance: p.acceptance, contracts: p.contracts, read_first: p.read_first, decisions: p.decisions, basis: p.basis };
  const result = await (options.session ?? callSession)(run, { ...p, session: undefined }, "planner", cfg, { ...options, context: { mode: "decision", packet, ...context } });
  const decisions = (result.decisions ?? []).filter((d) => d.blocks.includes(p.id));
  const valid = decisions.length && !result.questions.length && decisions.every((d) => d.scope === "shared" && Object.keys(p.basis.docs).some((f) => path.resolve(p.repo.path, d.source.split("#")[0]) === f && fileHash(f) === p.basis.docs[f]));
  if (valid && !p.sharedDecisionUsed) {
    p.sharedDecisionUsed = true; p.decisions = [...(p.decisions ?? []), ...decisions];
    event(run, "shared_decision", { package: p.id, decisions }); persist(run); return true;
  }
  waiting(run, p, [...result.questions.map((q) => q.text), ...decisions.map((d) => `${d.text} (${d.source})`), "รอการตัดสินใจพร้อมแหล่งอ้างอิง"]);
  return false;
}

async function processPackage(run, p, cfg, options) {
  let release;
  const shared = [];
  const started = Date.now();
  try {
    release = repoLock(run.root, p.repo.path);
    for (const f of [...(p.shared_files ?? [])].sort()) shared.push(lock(run.root, path.resolve(p.repo.path, f)));
    const current = snapshot(p.repo.path);
    if (p.childPid && alive(p.childPid)) throw new Error(`previous CLI still running: ${p.childPid}`);
    delete p.childPid;
    if (!p.before) p.before = current;
    const overlap = (run.baselines?.[p.repo.path] ?? p.before).preexisting_changes.filter((f) => p.owns.some((g) => matches(f, g)));
    if (overlap.length && !p.dirty_approved) { waiting(run, p, [`ไฟล์ที่แก้ค้างอยู่: ${overlap.join(", ")} — ยืนยันด้วย decide --allow-dirty`]); return; }
    const docs = documentBasis(p);
    if (p.basis && Object.entries(p.basis.docs).some(([file, digest]) => docs[file] !== digest)) {
      transition(run, p, "stale", { questions: ["เอกสาร/สัญญาเปลี่ยน ต้องยืนยัน acceptance ใหม่"], acceptance_approved: false }); return;
    }
    p.basis = { repo_sha: current.head, snapshot: current.id, docs };
    transition(run, p, "probing");
    for (const cmd of [...new Set([p.commands.setup, p.commands.build, p.commands.test_targeted].filter(Boolean))]) {
      const r = await evidence(run, p.repo.path, cmd, options);
      if (!r.ok && (r.timedOut || looksLikeEnvironmentFailure(r.output) || r.code === null)) {
        transition(run, p, "env_failed", { failureClass: "ENVIRONMENT_FAILURE", probe: r }); return;
      }
    }
    for (;;) {
      if (options.signal?.aborted) { transition(run, p, "cancelled"); return; }
      transition(run, p, "running", { restarted: !!p.session, questions: [] });
      p.result = await (options.session ?? callSession)(run, p, "worker", cfg, options);
      if (p.result.state !== "DONE") {
        p.failureClass = p.result.failure_class;
        if (p.result.state === "NEEDS_DECISION") {
          if (await sharedDecision(run, p, cfg, options, { questions: p.result.questions })) continue;
          return;
        }
        waiting(run, p, p.result.questions?.length ? p.result.questions : [p.result.summary]); return;
      }
      transition(run, p, "gating");
      p.gate = await gate(run, p, options);
      if (p.gate.ok) {
        const lenses = verification(p, run.packages);
        if (lenses.length) {
          transition(run, p, "verifying");
          const verifierAgent = Object.keys(cfg.agents).find((a) => a !== p.session?.agent && cfg.tiers[run.tier]?.[a] != null) ?? run.agent;
          p.verdict = await options.withVerifier(() => (options.session ?? callSession)(run, p, "verifier", cfg, { ...options, forceAgent: verifierAgent, context: { lenses } }));
          const reviewed = snapshot(p.repo.path);
          if (["id", "head", "index", "stash"].some((key) => reviewed[key] !== p.after[key])) {
            waiting(run, p, ["Verifier เปลี่ยน working tree/Git state: ต้องตรวจหลักฐานใหม่"]);
            p.failureClass = "SCOPE_VIOLATION"; persist(run); return;
          }
          const all = p.acceptance.every((ac) => p.verdict.acceptance.some((v) => v.id === ac.id && v.passed && v.proof.length));
          if (p.verdict.verdict !== "PASS" || !all || p.verdict.findings.length) {
            p.failureClass = p.verdict.failure_class || "IMPLEMENTATION_FAILURE";
            if (p.failureClass === "CONTRACT_MISMATCH") {
              if (await sharedDecision(run, p, cfg, options, { findings: p.verdict.findings })) continue;
              return;
            }
          } else { transition(run, p, "done", { failureClass: "", durationMs: Date.now() - started }); return; }
        } else { transition(run, p, "done", { failureClass: "", durationMs: Date.now() - started }); return; }
      } else p.failureClass = p.gate.failureClass;
      if (["ENVIRONMENT_FAILURE", "TEST_DEFECT"].includes(p.failureClass)) { waiting(run, p, [`${p.failureClass}: แก้สภาพแวดล้อม/test ก่อน resume`]); return; }
      p.rework = (p.rework ?? 0) + 1;
      if (p.rework > (p.budget?.max_rework ?? 2)) { waiting(run, p, ["ESCALATED: ถึงเพดานแก้แล้ว ดู evidence/verdict แล้วตัดสินใจ" ]); return; }
    }
  } catch (e) {
    transition(run, p, options.signal?.aborted ? "cancelled" : "env_failed", { failureClass: e.failureClass ?? "ENVIRONMENT_FAILURE", questions: [e.message] });
  } finally {
    p.durationMs = (p.durationMs ?? 0) || Date.now() - started;
    event(run, "duration", { package: p.id, expected_minutes: p.budget?.expected_minutes ?? null, actualMs: p.durationMs });
    for (const release of shared.reverse()) release();
    release?.(); persist(run);
  }
}

export async function schedule(run, cfg, options = {}) {
  const active = new Map(), repositories = new Set();
  const slots = run.mode === "planned" ? 1 : run.maxParallel;
  let verifiers = 0;
  const verifierQueue = [];
  options = { ...options, withVerifier: async (work) => {
    if (verifiers >= Math.max(1, Math.floor(slots / 2))) await new Promise((resolve) => verifierQueue.push(resolve));
    verifiers++;
    try { return await work(); } finally { verifiers--; verifierQueue.shift()?.(); }
  } };
  run.baselines ??= Object.fromEntries([...new Set(run.packages.map((p) => p.repo.path))].map((repo) => [repo, snapshot(repo)]));
  const fanout = transitiveFanOut(run.packages.map((p) => ({ id: p.id, dependsOn: p.depends_on })));
  // Validate all known questions before the first dispatch, instead of discovering them one by one.
  let preflightBlocked = false;
  for (const p of run.packages) {
    if (complete(p)) continue;
    const reasons = readiness(p);
    const overlap = run.baselines[p.repo.path].preexisting_changes.filter((f) => p.owns.some((g) => matches(f, g)));
    if (overlap.length && !p.dirty_approved) reasons.push(`ไฟล์ที่แก้ค้างอยู่: ${overlap.join(", ")} — decide --allow-dirty`);
    if (reasons.length) { waiting(run, p, reasons); preflightBlocked = true; }
  }
  if (preflightBlocked) { event(run, "inbox_ready"); return run; }
  for (const p of run.packages) if (["running", "probing", "gating", "verifying", "env_failed", "blocked"].includes(p.state)) p.state = "pending";
  const critical = (p, seen = new Set()) => {
    if (seen.has(p.id)) return 0;
    seen.add(p.id);
    const children = run.packages.filter((x) => x.depends_on.includes(p.id));
    return (p.budget?.expected_minutes ?? 1) + Math.max(0, ...children.map((c) => critical(c, new Set(seen))));
  };
  for (;;) {
    const ready = run.packages.filter((p) => p.state === "pending" && p.depends_on.every((d) => complete(run.packages.find((p) => p.id === d))))
      .sort((a, b) => critical(b) - critical(a) || fanout.get(b.id) - fanout.get(a.id));
    for (const p of ready) {
      if (active.size >= slots || repositories.has(p.repo.path)) continue;
      repositories.add(p.repo.path);
      const controller = new AbortController();
      const cancelFile = path.join(run.dir, `cancel-${p.id}.json`);
      const timer = setInterval(() => { if (existsSync(cancelFile)) controller.abort(); }, 100);
      const promise = processPackage(run, p, cfg, { ...options, signal: controller.signal })
        .finally(() => { clearInterval(timer); active.delete(p.id); repositories.delete(p.repo.path); });
      active.set(p.id, promise);
    }
    if (!active.size) break;
    await Promise.race(active.values());
  }
  for (const p of run.packages) if (p.state === "pending") transition(run, p, "blocked", { questions: ["รอ dependency ที่ยังไม่ done"] });
  event(run, "run_end", { ok: run.packages.every(complete), waiting: run.packages.filter((p) => !complete(p)).map((p) => p.id) });
  persist(run);
  return run;
}
