import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { findWorkspaceConfig, layoutOf, loadWorkspace, memoryRootOf } from "./config.mjs";
import { gitIn, parsePorcelain, commitKnowledgeRoot } from "./knowledge-commit.mjs";
import { updateIndexes } from "./knowledge-index.mjs";
import { performInit } from "./init.mjs";

export function updateSelfFramework(teamDir, log = () => {}) {
  const isGit = gitIn(teamDir, ["rev-parse", "--is-inside-work-tree"]);
  if (!isGit.ok) return { ok: true, updated: false, reason: "not_git" };

  const remotes = gitIn(teamDir, ["remote"]);
  if (!remotes.ok || !remotes.out.trim()) return { ok: true, updated: false, reason: "no_remote" };

  const fetch = gitIn(teamDir, ["fetch", "--quiet"]);
  if (!fetch.ok) {
    log(`⚠ BAAN self-update: fetch ไม่สำเร็จ — ${fetch.err.split("\n")[0]}`);
    return { ok: false, updated: false, error: fetch.err };
  }

  const rev = gitIn(teamDir, ["rev-list", "--count", "HEAD..@{u}"]);
  let behind = rev.ok ? Number(rev.out.trim()) : 0;
  if (!rev.ok) {
    const revFallback = gitIn(teamDir, ["rev-list", "--count", "HEAD..origin/dev/golf"]);
    if (revFallback.ok) behind = Number(revFallback.out.trim());
  }

  if (behind <= 0) return { ok: true, updated: false, reason: "up_to_date" };

  let oldVersion = "unknown";
  try {
    oldVersion = JSON.parse(readFileSync(path.join(teamDir, "package.json"), "utf8")).version;
  } catch { /* ignore */ }

  const pull = gitIn(teamDir, ["pull", "--ff-only"]);
  if (!pull.ok) {
    log(`⚠ BAAN self-update: pull ไม่สำเร็จ — ${pull.err.split("\n")[0]}`);
    return { ok: false, updated: false, error: pull.err };
  }

  try {
    spawnSync("npm", ["link"], { cwd: teamDir, encoding: "utf8", windowsHide: true });
  } catch { /* ignore */ }

  let newVersion = oldVersion;
  try {
    newVersion = JSON.parse(readFileSync(path.join(teamDir, "package.json"), "utf8")).version;
  } catch { /* ignore */ }

  log(`✨ BAAN อัปเดตเป็น ${newVersion} เรียบร้อยแล้ว (+${behind} commits)`);
  return { ok: true, updated: true, oldVersion, newVersion, commits: behind };
}

export function syncKnowledgeRoot(kr, opts = {}, log = () => {}) {
  if (!kr.path || !existsSync(path.join(kr.path, ".git"))) {
    return { name: kr.name, ok: true, repo: false, commits: [] };
  }

  const result = { name: kr.name, ok: true, repo: true, commits: [], pulled: false, pushed: false };

  const status = gitIn(kr.path, ["status", "--porcelain", "-z", "--untracked-files=all"]);
  if (!status.ok) {
    result.ok = false;
    result.error = status.err;
    log(`⚠ ${kr.name}: อ่าน git status ไม่ได้ — ${status.err.split("\n")[0]}`);
    return result;
  }

  const changes = parsePorcelain(status.out);
  if (changes.length > 0) {
    if (opts.dryRun) {
      result.dirty = changes.length;
      log(`${kr.name}: มีไฟล์รอ commit ${changes.length} ไฟล์ (dry-run)`);
    } else {
      const commitRes = commitKnowledgeRoot(kr, log);
      result.commits = commitRes.commits;
    }
  }

  const remotes = gitIn(kr.path, ["remote"]);
  if (!remotes.ok || !remotes.out.trim()) {
    log(`${kr.name}: ไม่มี remote repository ให้ซิงค์`);
    return result;
  }

  if (opts.dryRun) return result;

  const pull = gitIn(kr.path, ["pull", "--rebase", "--autostash"]);
  if (!pull.ok) {
    result.ok = false;
    result.pullError = pull.err;
    log(`⚠ ${kr.name}: pull ไม่สำเร็จ — ${pull.err.split("\n")[0]}`);
  } else {
    result.pulled = true;
    if (!pull.out.includes("Already up to date")) {
      log(`${kr.name}: ดึงการเปลี่ยนแปลงล่าสุดเรียบร้อย`);
    }
  }

  const shouldPush = opts.push !== false && !opts.pullOnly;
  if (shouldPush && result.ok) {
    const rev = gitIn(kr.path, ["rev-list", "--count", "@{u}..HEAD"]);
    const hasUnpushed = rev.ok && Number(rev.out.trim()) > 0;
    if (hasUnpushed || result.commits.length > 0) {
      const push = gitIn(kr.path, ["push"]);
      if (!push.ok) {
        const branch = gitIn(kr.path, ["rev-parse", "--abbrev-ref", "HEAD"]);
        const currentBranch = branch.ok ? branch.out.trim() : "main";
        const pushSetUpstream = gitIn(kr.path, ["push", "-u", "origin", currentBranch]);
        if (!pushSetUpstream.ok) {
          result.ok = false;
          result.pushError = pushSetUpstream.err;
          log(`⚠ ${kr.name}: push ไม่สำเร็จ — ${pushSetUpstream.err.split("\n")[0]}`);
        } else {
          result.pushed = true;
          log(`${kr.name}: ส่งงานขึ้น remote (${currentBranch}) เรียบร้อย`);
        }
      } else {
        result.pushed = true;
        log(`${kr.name}: ส่งงานขึ้น remote เรียบร้อย`);
      }
    }
  }

  return result;
}

export function syncWorkspace(ws, targetDir, teamDir, opts = {}, log = console.log) {
  const summary = { ok: true, framework: null, stubs: null, knowledge: [], index: [] };

  if (!opts.noSelfUpdate && !opts.dryRun) {
    summary.framework = updateSelfFramework(teamDir, log);
    if (summary.framework.ok === false) summary.ok = false;
  }

  if (!opts.dryRun) {
    const initRes = performInit(targetDir, teamDir, () => {});
    summary.stubs = {
      agents: initRes.design.length,
      stubs: initRes.stubs,
    };
  }

  for (const kr of ws.knowledge_roots ?? []) {
    const krRes = syncKnowledgeRoot(kr, opts, log);
    summary.knowledge.push(krRes);
    if (!krRes.ok) summary.ok = false;

    const mem = memoryRootOf(kr);
    if (mem) {
      const memRes = syncKnowledgeRoot({ name: `${kr.name}-memory`, path: mem, layout: kr.layout }, opts, log);
      summary.knowledge.push(memRes);
      if (!memRes.ok) summary.ok = false;
    }

    if (layoutOf(kr) === "project" && !opts.dryRun) {
      const updated = updateIndexes(kr.path);
      summary.index.push({ name: kr.name, count: updated.length });
    }
  }

  return summary;
}

export function syncAllWorkspaces(localConfig, teamDir, opts = {}, log = console.log) {
  const summary = { ok: true, framework: null, workspaces: [] };
  const entries = localConfig?.workspaces ?? [];
  if (!entries.length) {
    log("⚠ ไม่พบ workspace/company ที่ลงทะเบียนใน local.json");
    return summary;
  }

  if (!opts.noSelfUpdate && !opts.dryRun) {
    summary.framework = updateSelfFramework(teamDir, log);
    if (summary.framework.ok === false) summary.ok = false;
  }

  for (const entry of entries) {
    const wsPath = entry.path;
    const wsName = entry.name || path.basename(wsPath);
    if (!existsSync(wsPath)) {
      log(`⚠ [${wsName}] ไม่พบไดเรกทอรี: ${wsPath} (ข้าม)`);
      summary.workspaces.push({ name: wsName, path: wsPath, ok: false, error: "directory_not_found" });
      summary.ok = false;
      continue;
    }

    const cfgFile = findWorkspaceConfig(wsPath);
    if (!cfgFile) {
      log(`⚠ [${wsName}] ไม่พบ baan.config.json ใน ${wsPath} (ข้าม)`);
      summary.workspaces.push({ name: wsName, path: wsPath, ok: false, error: "config_not_found" });
      summary.ok = false;
      continue;
    }

    let ws;
    try {
      ws = loadWorkspace(cfgFile);
    } catch (e) {
      log(`⚠ [${wsName}] อ่าน config ไม่ได้: ${e.message}`);
      summary.workspaces.push({ name: wsName, path: wsPath, ok: false, error: e.message });
      summary.ok = false;
      continue;
    }

    log(`🔄 [${wsName}] กำลังซิงค์โครงสร้างและเอกสาร...`);
    const wsRes = syncWorkspace(ws, wsPath, teamDir, { ...opts, noSelfUpdate: true }, log);
    summary.workspaces.push({ name: wsName, path: wsPath, ok: wsRes.ok, ...wsRes });
    if (!wsRes.ok) summary.ok = false;
    log(`✨ [${wsName}] ซิงค์เรียบร้อย`);
  }

  return summary;
}
