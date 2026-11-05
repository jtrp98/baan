import { repoLock } from "./repolock.mjs";
import { evidence } from "./gate.mjs";
import { event, persist } from "./store.mjs";
import { snapshot, sameState } from "./snapshot.mjs";

export async function integrate(run, options = {}) {
  for (const test of run.integration ?? []) {
    const packages = test.packages.map((id) => run.packages.find((p) => p.id === id));
    if (packages.some((p) => !p || p.state !== "done")) continue;
    const releases = [];
    try {
      for (const repo of [...new Set(packages.map((p) => p.repo.path))].sort()) releases.push(repoLock(run.root, repo));
      const before = new Map(packages.map((p) => [p.repo.path, snapshot(p.repo.path)]));
      const basis = [...before].map(([repo, s]) => [repo, s.id, s.head, s.branch, s.index, s.stash]);
      const result = await evidence(run, packages[0].repo.path, test.command, { ...options, basis });
      const mutated = [...before].filter(([repo, s]) => !sameState(s, snapshot(repo))).map(([repo]) => repo);
      event(run, "integration", { packages: test.packages, result });
      test.evidence = result;
      if (mutated.length) {
        for (const p of packages) { p.state = "waiting_human"; p.failureClass = "SCOPE_VIOLATION"; p.questions = [`integration command changed repository/Git state: ${mutated.join(", ")}`]; }
        continue;
      }
      if (!result.ok) for (const p of packages) {
        p.failureClass = "INTEGRATION_FAILURE";
        p.integrationFailure = result;
        p.rework = (p.rework ?? 0) + 1;
        p.state = p.rework <= (p.budget?.max_rework ?? 2) ? "pending" : "waiting_human";
        p.questions = p.state === "waiting_human" ? ["integration test ยังไม่ผ่านหลังถึงเพดานแก้"] : [];
        if (p.state === "pending") {
          // Start the next attempt from the integrated tree; preserve the prior recovery snapshot as evidence.
          (p.previous_attempts ??= []).push({ before: p.before, after: p.after, gate: p.gate, verdict: p.verdict });
          delete p.before; delete p.after; delete p.gate; delete p.verdict;
        }
      }
    } finally { for (const release of releases.reverse()) release(); }
  }
  persist(run);
}
