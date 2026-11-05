import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { git } from "../src/snapshot.mjs";
import { approvalBasis } from "../src/packet.mjs";
import { persist } from "../src/store.mjs";

export function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "baan-engine-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const makeRepo = (name) => {
    const repo = path.join(root, name); mkdirSync(repo);
    git(repo, "init"); git(repo, "config", "user.email", "test@invalid"); git(repo, "config", "user.name", "test");
    git(repo, "config", "core.autocrlf", "false");
    writeFileSync(path.join(repo, "code.mjs"), "export const value = 1;\n");
    writeFileSync(path.join(repo, ".gitignore"), ".baan/\n");
    git(repo, "add", "."); git(repo, "commit", "-m", "initial");
    return repo;
  };
  const repo = makeRepo("repo");
  return { root, repo, makeRepo };
}
export const cfg = { agents: { codex: {}, claude: {} }, tiers: { t5: { codex: {}, claude: {} }, t2: { codex: {}, claude: {} } } };
export function packet(repo, id = "WP-1", overrides = {}) {
  const p = { id, title: "tiny change", goal: "change a value", tasks: [id], repo: { path: repo }, owns: ["code.mjs"], read_first: [], depends_on: [], risk: "low",
    acceptance: [{ id: "AC-1", text: "value is 2", source: "user" }], commands: { build: "build", test_targeted: "test", test_full: "test" },
    acceptance_approved: true, approved_by: "user", approved_at: "2026-11-05", state: "pending", ...overrides };
  p.approved_source = "test fixture: human confirmation";
  p.approved_basis = approvalBasis(p);
  return p;
}
export function runAt(root, packages) {
  const run = { version: 2, id: "test", root, dir: path.join(root, ".baan", "runs", "test"), packages, tier: "t5", plannerTier: "t2", agent: "codex", maxParallel: 3, timeoutSec: 10, direct: true };
  mkdirSync(run.dir, { recursive: true }); persist(run); return run;
}
export const good = { state: "DONE", summary: "completed", acceptance: [{ id: "AC-1", proof: ["value test"] }], test_changes: [], questions: [], failure_class: "" };
export const passing = async (cmd) => ({ command: cmd, code: 0, ok: true, output: "# Subtest: value test\n# pass 1\n# fail 0\n", timedOut: false });
export const session = async (run, p, role) => {
  if (role === "verifier") return { verdict: "PASS", findings: [], failure_class: "", acceptance: p.acceptance.map((a) => ({ id: a.id, passed: true, proof: ["value test"] })) };
  if (role === "planner") return { packages: run.packages.map((p) => ({ id: p.id, depends_on: p.depends_on, subpackages: [] })), questions: [], decisions: [] };
  writeFileSync(path.join(p.repo.path, "code.mjs"), "export const value = 2;\n");
  return structuredClone(good);
};
