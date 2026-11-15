import { readFileSync } from "node:fs";
import path from "node:path";
import { TEAM_DIR, listRoles, tierMatrixText, resolveTarget, layoutOf, memoryRootIssues, loadLocalConfig } from "./config.mjs";
import { performInit } from "./init.mjs";
import { lintKnowledge, updateIndexes } from "./knowledge-index.mjs";
import { lintPlanFile } from "./plan.mjs";
import { commitKnowledge } from "./knowledge-commit.mjs";
import { sweep, formatSweep } from "./sweep.mjs";
import { syncWorkspace, syncAllWorkspaces } from "./sync.mjs";
import { surveyProject } from "./survey.mjs";
import { repairFile } from "./mojibake.mjs";

export const utilityFlags = ["help", "version", "init", "list", "commit", "index", "lint-knowledge", "lint-plan", "repair-mojibake", "sweep", "sync", "survey", "scan"];
// Inside a workspace sync only that one: fanning out committed and pushed half-written work of every other workspace.
// Outside any workspace (e.g. the BAAN repo during a release) the registered workspaces are the only sensible target.
// Never fall back to the cwd: that ran a full --init in whatever folder sync was called from.
export function syncScope(o, ws, local) {
  if (o.all) return "all";
  if (ws?.source) return "current";
  if (!o.workspace && local.auto_update && local.workspaces.length) return "all";
  throw new Error("ไม่พบ baan.config.json — รัน baan sync ในโฟลเดอร์ workspace, ใช้ --all เพื่อซิงค์ทุก workspace ใน local.json หรือสร้าง workspace ด้วย baan --init ก่อน");
}

export function utility(o, ws, cfg, root, local) {
  if (o.help) return `BAAN — one execution engine
  baan monitor | ui [--port <3456>] [--no-open] [--tui]
  baan parity [--agent <claude|codex|agy>] [--cwd <repo>] [--json]
  baan update-clis
  baan attach <package> [--run <run>]
  baan --init [--workspace <dir>] [--knowledge-git <url>] [--memory-git <url>]
  baan target [list | check [<name>] | scan [<dir>] [--prune] [--pin-branch] [--update-branch] | add <dir> [--name <name>] [--branch <branch> | --pin-branch] | branch <name> [<branch> | --clear] | remove <name>] [--root <kr>] [--dry-run]
  baan sync [--all] [--stubs-only] [--pull-only] [--push] [--dry-run] [--no-self-update]
  baan survey [--target <name>] [--project <name>] [--cwd <path>]
    [--scaffold-module <name>] [--scaffold-project <name>] [--json]
  baan --list | --version | --help
  baan run --packet <file> | --plan <file> | --goal <text>
    [--cwd <repo>] [--workspace <dir>] [--config <file>] [--target <name>] [--module <project/module>]
    [--owns <glob,glob>] [--acceptance <text>] [--source <reference>]
    [--build <cmd>] [--test <cmd>] [--test-full <cmd>] [--setup <cmd>]
    [--agent <name>] [--tier <tier>] [--planner-tier <tier>] [--timeout <0..86400>] [--max-parallel <1..64>]
    [--execution-mode <headless|interactive>] [--permission-policy <native-safe|bypass>] [--allow-bypass] [--allow-fallback] [--allow-branch-mismatch]
    [--direct] [--dry-run] [--select <id,id>]
  baan status | report | inbox [<run>] [--workspace <dir>]
  baan decide <package> --run <run> --by user --decision <text> --source <reference>
    [--approve] [--allow-dirty] [--gate <id>]
  baan run --resume <run> [--dry-run]
  baan run --cancel <package> --run <run>
  baan --index | --lint-knowledge | --lint-plan <file> | --repair-mojibake <file> | --commit | --sync
  baan --sweep <term> [--sweep <term>] [--sweep-in <dir>] [--target <name>]
See README.md for approval, provider setup, evidence and security boundaries.`;
  if (o.version) return JSON.parse(readFileSync(path.join(TEAM_DIR, "package.json"), "utf8")).version;
  if (o.init) return performInit(root, TEAM_DIR, () => {}, { knowledgeGit: o["knowledge-git"], memoryGit: o["memory-git"] });
  if (o.sync) {
    const localConfig = local ?? loadLocalConfig(TEAM_DIR);
    const opts = {
      // Sync always pushes unless --pull-only; --push stays accepted for old scripts but changes nothing.
      push: !o["pull-only"],
      pullOnly: Boolean(o["pull-only"]),
      dryRun: Boolean(o["dry-run"]),
      noSelfUpdate: Boolean(o["no-self-update"]),
      stubsOnly: Boolean(o["stubs-only"]),
    };
    if (syncScope(o, ws, localConfig) === "all") return syncAllWorkspaces(localConfig, TEAM_DIR, opts, (m) => console.log(m));
    return syncWorkspace(ws, root, TEAM_DIR, opts, (m) => console.log(m));
  }
  if (o.survey || o.scan) {
    return surveyProject(o, ws, root, (m) => console.log(m));
  }
  if (o.list) {
    const local = loadLocalConfig(TEAM_DIR);
    return {
      config: ws?.source ?? null,
      defaults: ws?.defaults ?? {},
      knowledge_roots: (ws?.knowledge_roots ?? []).map((kr) => ({ ...kr, issues: memoryRootIssues(kr, root) })),
      ...(local.workspaces.length ? { local_workspaces: local.workspaces } : {}),
      ...(local.agents ? { local_agents: local.agents } : {}),
      execution_roles: ["planner", "worker", "verifier"],
      interactive_roles: listRoles(),
      tiers: tierMatrixText(cfg.tiers, cfg.agents),
    };
  }
  if (o["lint-plan"]) {
    const messages = [];
    const code = lintPlanFile(path.resolve(o["lint-plan"]), (f) => readFileSync(f, "utf8"), (m) => messages.push(m));
    return { ok: code === 0, messages };
  }
  if (o["repair-mojibake"]) {
    return repairFile(path.resolve(o["repair-mojibake"]), { write: !o["dry-run"], dryRun: Boolean(o["dry-run"]) });
  }
  if (o.commit) return { commits: commitKnowledge(ws) };
  if (o.index || o["lint-knowledge"]) {
    const roots = ws.knowledge_roots.filter((kr) => layoutOf(kr) === "project");
    if (!roots.length) throw new Error('ต้องมี knowledge root ที่ตั้ง layout: "project"');
    const results = roots.map((kr) => ({ name: kr.name, updated: o.index ? updateIndexes(kr.path) : [],
      ...(o["lint-knowledge"] ? lintKnowledge(kr.path) : {}) }));
    return { ok: results.every((r) => !r.errors?.length), results };
  }
  const terms = o.sweep.filter((t) => t.trim());
  if (!terms.length) throw new Error("--sweep requires a nonempty term");
  const hit = o.target ? resolveTarget(ws, o.target) : null;
  if (o.target && !hit) throw new Error(`unknown target ${o.target}`);
  const roots = o["sweep-in"]?.length ? o["sweep-in"].map((dir) => ({ path: path.resolve(dir), kind: "knowledge", label: "" }))
    : [...(hit ? [hit.knowledgeRoot] : ws.knowledge_roots).map((kr) => ({ path: kr.path, kind: "knowledge", label: kr.name })),
      ...(hit ? [{ path: hit.target.path, kind: "target", label: hit.target.name }] : [])];
  if (!roots.length) throw new Error("ไม่มีที่ให้ค้น: ตั้ง knowledge_roots หรือ --sweep-in");
  return formatSweep(sweep(roots, terms), terms);
}
