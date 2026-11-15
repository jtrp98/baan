import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { findWorkspaceConfig, layoutOf, loadWorkspace, memoryRootOf } from "./config.mjs";
import { gitIn, parsePorcelain, commitKnowledgeRoot, conflictState, unfinishedOperation } from "./knowledge-commit.mjs";
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

  // A branch without upstream (e.g. a local feature branch) has nothing to fast-forward to. The old fallback
  // compared with origin/dev/golf, then `pull --ff-only` failed, so every sync on such a branch reported ok:false.
  const rev = gitIn(teamDir, ["rev-list", "--count", "HEAD..@{u}"]);
  if (!rev.ok) {
    log("BAAN self-update: branch นี้ไม่มี upstream — ข้ามการอัปเดตตัวเอง");
    return { ok: true, updated: false, reason: "no_upstream" };
  }
  const behind = Number(rev.out.trim());

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
  const blocked = conflictState(kr.path, changes);
  if (blocked) {
    Object.assign(result, { ok: false, blocked });
    log(`⚠ ${kr.name}: ค้าง ${blocked} — แก้ conflict ให้เสร็จก่อน แล้วค่อย sync (ข้าม commit/pull/push)`);
    return result;
  }
  if (changes.length > 0) {
    if (opts.dryRun) {
      result.dirty = changes.length;
      log(`${kr.name}: มีไฟล์รอ commit ${changes.length} ไฟล์ (dry-run)`);
    } else {
      const commitRes = commitKnowledgeRoot(kr, log);
      result.commits = commitRes.commits;
    }
  }

  if (opts.localOnly) {
    result.localOnly = true;
    return result;
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
    const reason = pull.err.split("\n").find((line) => /conflict|error|fatal/i.test(line)) ?? pull.err.split("\n")[0];
    // The guard above proved nothing was in progress, so this rebase is ours to undo; the user merges by hand.
    if (unfinishedOperation(kr.path)?.startsWith("rebase")) {
      result.rebaseAborted = gitIn(kr.path, ["rebase", "--abort"]).ok;
      log(`⚠ ${kr.name}: pull ชน conflict — ยกเลิก rebase คืนสภาพเดิมแล้ว ให้ pull/merge เอง — ${reason}`);
    } else {
      log(`⚠ ${kr.name}: pull ไม่สำเร็จ — ${reason}`);
    }
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
      // No "push -u origin <branch>" retry: pull already proved an upstream exists, so a failed push means the
      // branch does not match it (e.g. main tracking master) and a retry would create a stray remote branch.
      const push = gitIn(kr.path, ["push"]);
      if (!push.ok) {
        result.ok = false;
        result.pushError = push.err;
        log(`⚠ ${kr.name}: push ไม่สำเร็จ — ${push.err.split("\n").find((l) => /error|fatal|rejected/i.test(l)) ?? push.err.split("\n")[0]}`);
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
  // Used by the BAAN repo's post-merge hook: refreshing stubs must never commit or push a workspace's knowledge.
  if (opts.stubsOnly) return summary;

  for (const kr of ws.knowledge_roots ?? []) {
    // Refresh INDEX.md before committing so the new table goes out in this same sync; doing it afterwards left
    // every repo dirty until the next sync. Never inside an unfinished rebase/merge (it would mix both sides).
    if (layoutOf(kr) === "project" && !opts.dryRun && kr.path && existsSync(kr.path)) {
      const isRepo = existsSync(path.join(kr.path, ".git"));
      const status = isRepo ? gitIn(kr.path, ["status", "--porcelain", "-z"]) : null;
      if (!isRepo || (status.ok && !conflictState(kr.path, parsePorcelain(status.out)))) {
        const updated = updateIndexes(kr.path);
        summary.index.push({ name: kr.name, count: updated.length });
      }
    }

    const krRes = syncKnowledgeRoot(kr, opts, log);
    summary.knowledge.push(krRes);
    if (!krRes.ok) summary.ok = false;

    const mem = memoryRootOf(kr);
    if (mem) {
      const memRes = syncKnowledgeRoot({ name: `${kr.name}-memory`, path: mem, layout: kr.layout }, { ...opts, localOnly: true }, log);
      summary.knowledge.push(memRes);
      if (!memRes.ok) summary.ok = false;
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
