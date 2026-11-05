import { repoLock } from "./repolock.mjs";
import { evidence } from "./gate.mjs";
import { event, persist } from "./store.mjs";
import { snapshot } from "./snapshot.mjs";

export async function integrate(run, options = {}) {
  for (const test of run.integration ?? []) {
    const packages = test.packages.map((id) => run.packages.find((p) => p.id === id));
    if (packages.some((p) => !p || p.state !== "done")) continue;
    const releases = [];
    try {
      for (const repo of [...new Set(packages.map((p) => p.repo.path))].sort()) releases.push(repoLock(run.root, repo));
      const basis = packages.map((p) => [p.repo.path, snapshot(p.repo.path).id]);
      const result = await evidence(run, packages[0].repo.path, test.command, { ...options, basis });
      event(run, "integration", { packages: test.packages, result });
      test.evidence = result;
      if (!result.ok) for (const p of packages) {
        p.failureClass = "INTEGRATION_FAILURE";
        p.integrationFailure = result;
        p.rework = (p.rework ?? 0) + 1;
        p.state = p.rework <= (p.budget?.max_rework ?? 2) ? "pending" : "waiting_human";
        p.questions = p.state === "waiting_human" ? ["integration test ยังไม่ผ่านหลังถึงเพดานแก้"] : [];
      }
    } finally { for (const release of releases.reverse()) release(); }
  }
  persist(run);
}
