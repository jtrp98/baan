import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { resolveTargetByPath } from "./config.mjs";
import { gitIn } from "./knowledge-commit.mjs";

const SKIP_SCAN_DIRS = new Set([
  "node_modules", ".git", ".baan", ".next", "dist", "build", "bin", "obj", ".vs", ".idea",
]);

const toPosix = (p) => String(p).split(path.sep).join("/");

const normalizeKey = (p) => {
  const resolved = path.resolve(p);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
};

const isDir = (p) => {
  try { return statSync(p).isDirectory(); } catch { return false; }
};

const isGitRepo = (dir) => existsSync(path.join(dir, ".git"));

/**
 * Returns the active branch name of a Git repository, supporting unborn HEADs before the first commit.
 */
export function currentBranchOf(dir) {
  if (!dir || !isDir(dir) || !isGitRepo(dir)) return null;
  const head = gitIn(dir, ["rev-parse", "--abbrev-ref", "HEAD"]);
  if (head.ok && head.out.trim()) return head.out.trim();
  const sym = gitIn(dir, ["symbolic-ref", "--short", "HEAD"]);
  return sym.ok && sym.out.trim() ? sym.out.trim() : null;
}

function dirtyCountOf(dir) {
  if (!dir || !isDir(dir) || !isGitRepo(dir)) return null;
  const st = gitIn(dir, ["status", "--porcelain"]);
  if (!st.ok) return null;
  return st.out.split(/\r?\n/).filter(Boolean).length;
}

function inspectTarget(kr, tg, { includeDirty = false } = {}) {
  const resolved = tg.path ? path.resolve(tg.path) : "";
  const exists = Boolean(resolved && isDir(resolved));
  const git = exists && isGitRepo(resolved);
  const registeredBranch = typeof tg.branch === "string" && tg.branch.trim() ? tg.branch.trim() : null;
  const currentBranch = git ? currentBranchOf(resolved) : null;
  const branchMatch = registeredBranch ? currentBranch === registeredBranch : null;
  return {
    knowledgeRoot: kr.name,
    name: tg.name,
    path: tg.path,
    exists,
    git,
    registeredBranch,
    currentBranch,
    branchMatch,
    ...(includeDirty ? { dirtyFiles: git ? dirtyCountOf(resolved) : null } : {}),
  };
}

function readRawConfig(configPath) {
  if (!configPath || !existsSync(configPath)) {
    throw new Error("ไม่พบ baan.config.json — รัน baan --init ใน workspace ก่อน");
  }
  let raw;
  try {
    raw = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (e) {
    throw new Error(`อ่าน config ไม่ได้ (${configPath}): ${e.message}`);
  }
  if (!Array.isArray(raw.knowledge_roots) || !raw.knowledge_roots.length) {
    throw new Error(`config ไม่มี knowledge_roots (${configPath})`);
  }
  return raw;
}

function selectKnowledgeRoot(raw, rootName) {
  if (rootName) {
    const hit = raw.knowledge_roots.find((kr) => kr.name === rootName);
    if (!hit) {
      const names = raw.knowledge_roots.map((kr) => kr.name).join(", ");
      throw new Error(`ไม่พบ knowledge_root "${rootName}" (ที่มี: ${names})`);
    }
    return hit;
  }
  if (raw.knowledge_roots.length > 1) {
    const names = raw.knowledge_roots.map((kr) => kr.name).join(", ");
    throw new Error(`มีหลาย knowledge_roots (${names}) — ระบุ --root <name>`);
  }
  return raw.knowledge_roots[0];
}

function findTargetEntry(raw, targetName, rootName) {
  if (rootName) {
    const kr = selectKnowledgeRoot(raw, rootName);
    const tg = (kr.targets ?? []).find((t) => t.name === targetName);
    if (!tg) throw new Error(`ไม่พบ target "${targetName}" ใน ${kr.name}`);
    return { kr, tg };
  }
  const hits = [];
  for (const kr of raw.knowledge_roots) {
    for (const tg of kr.targets ?? []) {
      if (tg.name === targetName) hits.push({ kr, tg });
    }
  }
  if (!hits.length) throw new Error(`ไม่พบ target "${targetName}"`);
  if (hits.length > 1) throw new Error(`พบ target "${targetName}" ในหลาย knowledge_roots — ระบุ --root <name>`);
  return hits[0];
}

function writeConfig(configPath, raw) {
  writeFileSync(configPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
}

/**
 * Recursively discovers Git repositories under rootDir up to maxDepth.
 * Stops descending once a directory has `.git` so nested submodules or worktrees are not misread.
 */
export function discoverGitRepos(rootDir, opts = {}) {
  const resolvedRoot = path.resolve(rootDir);
  if (!isDir(resolvedRoot)) {
    throw new Error(`ไม่พบโฟลเดอร์สำหรับสแกน target: ${resolvedRoot}`);
  }
  const maxDepth = Number.isInteger(opts.maxDepth) && opts.maxDepth >= 0 ? opts.maxDepth : 3;
  const found = [];

  function walk(dir, depth) {
    if (isGitRepo(dir)) {
      found.push({
        name: path.basename(dir),
        path: toPosix(dir),
        resolved: dir,
      });
      return;
    }
    if (depth >= maxDepth) return;

    let entries;
    try {
      entries = readdirSync(dir).sort();
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP_SCAN_DIRS.has(entry) || entry.startsWith(".")) continue;
      const child = path.join(dir, entry);
      if (isDir(child)) walk(child, depth + 1);
    }
  }

  walk(resolvedRoot, 0);
  return found.sort((a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path));
}

/**
 * Lists all configured targets across knowledge_roots with existence and branch status.
 */
export function listTargets(ws) {
  const targets = [];
  for (const kr of ws?.knowledge_roots ?? []) {
    for (const tg of kr.targets ?? []) {
      targets.push(inspectTarget(kr, tg));
    }
  }
  const valid = targets.filter((t) => t.exists).length;
  const missing = targets.length - valid;
  const mismatches = targets
    .filter((t) => t.branchMatch === false)
    .map(({ name, path: p, registeredBranch, currentBranch }) => ({ name, path: p, registeredBranch, currentBranch }));
  return {
    ok: true,
    config: ws?.source ? toPosix(ws.source) : null,
    total: targets.length,
    valid,
    missing,
    pinnedBranches: targets.filter((t) => t.registeredBranch !== null).length,
    branchMismatches: mismatches.length,
    mismatches,
    targets,
  };
}

/**
 * Checks target paths, registered branch matches, and dirty working trees.
 * Sets `ok: false` when any target path is missing or any repo is on a different branch than registered.
 */
export function checkTargets(ws, opts = {}) {
  const filterName = String(opts.name || "").trim();
  const targets = [];
  for (const kr of ws?.knowledge_roots ?? []) {
    for (const tg of kr.targets ?? []) {
      if (filterName && tg.name !== filterName && `${kr.name}/${tg.name}` !== filterName) continue;
      targets.push(inspectTarget(kr, tg, { includeDirty: true }));
    }
  }
  if (filterName && !targets.length) {
    throw new Error(`ไม่พบ target "${filterName}"`);
  }
  const missingTargets = targets.filter((t) => !t.exists).map(({ name, path: p }) => ({ name, path: p }));
  const mismatches = targets
    .filter((t) => t.branchMatch === false)
    .map(({ name, path: p, registeredBranch, currentBranch }) => ({ name, path: p, registeredBranch, currentBranch }));
  const dirty = targets
    .filter((t) => (t.dirtyFiles ?? 0) > 0)
    .map(({ name, path: p, currentBranch, dirtyFiles }) => ({ name, path: p, currentBranch, dirtyFiles }));

  return {
    ok: missingTargets.length === 0 && mismatches.length === 0,
    config: ws?.source ? toPosix(ws.source) : null,
    total: targets.length,
    valid: targets.length - missingTargets.length,
    missing: missingTargets.length,
    pinnedBranches: targets.filter((t) => t.registeredBranch !== null).length,
    branchMismatches: mismatches.length,
    dirtyTargets: dirty.length,
    mismatches,
    missingTargets,
    dirty,
    targets,
  };
}

/**
 * Pins, updates, or clears the registered branch for an existing target in baan.config.json.
 */
export function setTargetBranch(configPath, opts = {}) {
  const targetName = String(opts.name || "").trim();
  if (!targetName) throw new Error("ระบุชื่อ target ด้วย --name <name> หรืออาร์กิวเมนต์");

  const raw = readRawConfig(configPath);
  const { kr, tg } = findTargetEntry(raw, targetName, opts.root);
  const previousBranch = typeof tg.branch === "string" && tg.branch.trim() ? tg.branch.trim() : null;

  let action;
  if (opts.clear) {
    if (previousBranch === null && !Object.hasOwn(tg, "branch")) {
      action = "kept";
    } else {
      delete tg.branch;
      action = "cleared";
    }
  } else {
    const resolved = tg.path ? path.resolve(tg.path) : "";
    const explicit = typeof opts.branch === "string" ? opts.branch.trim() : "";
    const nextBranch = explicit || currentBranchOf(resolved);
    if (!nextBranch) {
      throw new Error(`อ่าน branch ปัจจุบันของ "${tg.name}" ไม่ได้ — ระบุชื่อ branch ด้วย --branch <name>`);
    }
    if (previousBranch === nextBranch) {
      action = "kept";
    } else {
      tg.branch = nextBranch;
      action = "pinned";
    }
  }

  if (!opts.dryRun && action !== "kept") {
    writeConfig(configPath, raw);
  }

  return {
    ok: true,
    config: toPosix(configPath),
    knowledgeRoot: kr.name,
    dryRun: Boolean(opts.dryRun),
    action,
    target: { ...tg },
    previousBranch,
  };
}

/**
 * Registers or updates a single target entry in baan.config.json.
 */
export function registerTarget(configPath, opts = {}) {
  if (!opts.path) throw new Error("ระบุ path ของ target ด้วย --path <dir> หรืออาร์กิวเมนต์");
  const resolvedTarget = path.resolve(opts.path);
  if (!isDir(resolvedTarget)) {
    throw new Error(`ไม่พบโฟลเดอร์ target: ${resolvedTarget}`);
  }
  const raw = readRawConfig(configPath);
  const kr = selectKnowledgeRoot(raw, opts.root);
  kr.targets = Array.isArray(kr.targets) ? kr.targets : [];

  const targetName = (opts.name || path.basename(resolvedTarget)).trim();
  if (!targetName) throw new Error("ชื่อ target ต้องไม่ว่าง");
  const posixPath = toPosix(resolvedTarget);
  const key = normalizeKey(resolvedTarget);
  const explicitBranch = typeof opts.branch === "string" ? opts.branch.trim() : "";
  const desiredBranch = explicitBranch || (opts.pinBranch ? currentBranchOf(resolvedTarget) : null);

  const byPath = kr.targets.find((t) => normalizeKey(t.path) === key);
  const byName = kr.targets.find((t) => t.name === targetName);

  let action;
  let resultTarget;
  let previousPath;

  if (byName) {
    resultTarget = byName;
    const pathChanged = normalizeKey(byName.path) !== key;
    if (pathChanged) {
      previousPath = byName.path;
      byName.path = posixPath;
    }
    const branchChanged = Boolean(desiredBranch && byName.branch !== desiredBranch);
    if (branchChanged) byName.branch = desiredBranch;
    action = pathChanged || branchChanged ? "updated" : "kept";
  } else if (byPath && !opts.name) {
    // Preserve existing alias (e.g. school-bot -> sb-web-school-robot) when caller did not force a new name.
    resultTarget = byPath;
    const branchChanged = Boolean(desiredBranch && byPath.branch !== desiredBranch);
    if (branchChanged) byPath.branch = desiredBranch;
    action = branchChanged ? "updated" : "kept";
  } else {
    resultTarget = { name: targetName, path: posixPath, ...(desiredBranch ? { branch: desiredBranch } : {}) };
    kr.targets.push(resultTarget);
    action = "added";
  }

  if (!opts.dryRun && (action === "added" || action === "updated")) {
    writeConfig(configPath, raw);
  }

  return {
    ok: true,
    config: toPosix(configPath),
    knowledgeRoot: kr.name,
    dryRun: Boolean(opts.dryRun),
    action,
    target: { ...resultTarget },
    ...(previousPath ? { previousPath } : {}),
    git: isGitRepo(resolvedTarget),
  };
}

/**
 * Scans scanDir (default `<workspace>/target`) for Git repos and registers/repairs them in baan.config.json.
 */
export function scanTargets(configPath, opts = {}) {
  const raw = readRawConfig(configPath);
  const kr = selectKnowledgeRoot(raw, opts.root);
  kr.targets = Array.isArray(kr.targets) ? kr.targets : [];

  const defaultDir = path.join(path.dirname(path.resolve(configPath)), "target");
  const scanDir = path.resolve(opts.scanDir || defaultDir);
  const repos = discoverGitRepos(scanDir, { maxDepth: opts.maxDepth ?? 3 });

  const byPath = new Map();
  const byName = new Map();
  for (const tg of kr.targets) {
    if (tg.path) byPath.set(normalizeKey(tg.path), tg);
    if (tg.name && !byName.has(tg.name)) byName.set(tg.name, tg);
  }

  const added = [];
  const repaired = [];
  const kept = [];
  const conflicts = [];
  const branchUpdated = [];

  const maybeSyncBranch = (tg, repoDir) => {
    if (!opts.pinBranch && !opts.updateBranch) return;
    const cur = currentBranchOf(repoDir);
    if (!cur) return;
    if (opts.updateBranch && tg.branch !== cur) {
      branchUpdated.push({ name: tg.name, from: tg.branch ?? null, to: cur });
      tg.branch = cur;
    } else if (opts.pinBranch && !tg.branch) {
      branchUpdated.push({ name: tg.name, from: null, to: cur });
      tg.branch = cur;
    }
  };

  for (const repo of repos) {
    const key = normalizeKey(repo.resolved);
    const existingByPath = byPath.get(key);
    if (existingByPath) {
      maybeSyncBranch(existingByPath, repo.resolved);
      kept.push({ name: existingByPath.name, path: existingByPath.path, ...(existingByPath.branch ? { branch: existingByPath.branch } : {}) });
      continue;
    }

    const existingByName = byName.get(repo.name);
    if (existingByName) {
      const oldResolved = existingByName.path ? path.resolve(existingByName.path) : "";
      if (!oldResolved || !isDir(oldResolved)) {
        const from = existingByName.path;
        existingByName.path = repo.path;
        if (from) byPath.delete(normalizeKey(from));
        byPath.set(key, existingByName);
        maybeSyncBranch(existingByName, repo.resolved);
        repaired.push({ name: existingByName.name, from, to: repo.path });
      } else {
        conflicts.push({
          name: repo.name,
          existingPath: existingByName.path,
          discoveredPath: repo.path,
        });
      }
      continue;
    }

    const cur = (opts.pinBranch || opts.updateBranch) ? currentBranchOf(repo.resolved) : null;
    const entry = { name: repo.name, path: repo.path, ...(cur ? { branch: cur } : {}) };
    kr.targets.push(entry);
    byPath.set(key, entry);
    byName.set(entry.name, entry);
    added.push({ ...entry });
  }

  const missing = [];
  const pruned = [];
  const nextTargets = [];
  for (const tg of kr.targets) {
    const exists = Boolean(tg.path && isDir(path.resolve(tg.path)));
    if (exists) {
      nextTargets.push(tg);
    } else if (opts.prune) {
      pruned.push({ name: tg.name, path: tg.path });
    } else {
      missing.push({ name: tg.name, path: tg.path });
      nextTargets.push(tg);
    }
  }
  kr.targets = nextTargets;

  const branchMismatches = nextTargets
    .map((tg) => inspectTarget(kr, tg))
    .filter((t) => t.branchMatch === false)
    .map(({ name, path: p, registeredBranch, currentBranch }) => ({ name, path: p, registeredBranch, currentBranch }));

  const changed = added.length > 0 || repaired.length > 0 || pruned.length > 0 || branchUpdated.length > 0;
  if (!opts.dryRun && changed) {
    writeConfig(configPath, raw);
  }

  return {
    ok: true,
    config: toPosix(configPath),
    knowledgeRoot: kr.name,
    scanDir: toPosix(scanDir),
    dryRun: Boolean(opts.dryRun),
    totalTargets: kr.targets.length,
    discovered: repos.length,
    added,
    repaired,
    kept,
    pruned,
    missing,
    branchUpdated,
    branchMismatches,
    conflicts,
  };
}

/**
 * Removes a target entry by name from baan.config.json.
 */
export function removeTarget(configPath, opts = {}) {
  const targetName = String(opts.name || "").trim();
  if (!targetName) throw new Error("ระบุชื่อ target ที่ต้องการลบด้วย --name <name> หรืออาร์กิวเมนต์");

  const raw = readRawConfig(configPath);
  const kr = selectKnowledgeRoot(raw, opts.root);
  kr.targets = Array.isArray(kr.targets) ? kr.targets : [];

  const idx = kr.targets.findIndex((t) => t.name === targetName);
  if (idx < 0) {
    throw new Error(`ไม่พบ target "${targetName}" ใน ${kr.name}`);
  }
  const [removed] = kr.targets.splice(idx, 1);

  if (!opts.dryRun) {
    writeConfig(configPath, raw);
  }

  return {
    ok: true,
    config: toPosix(configPath),
    knowledgeRoot: kr.name,
    dryRun: Boolean(opts.dryRun),
    removed,
  };
}

/**
 * Checks whether any package repository is on a different branch than its registered target branch.
 */
export function checkPackageBranches(ws, packages) {
  const mismatches = [];
  const seenRepos = new Set();
  for (const pkg of packages ?? []) {
    const repoPath = pkg?.repo?.path;
    if (!repoPath) continue;
    const key = normalizeKey(repoPath);
    if (seenRepos.has(key)) continue;
    seenRepos.add(key);

    const hit = resolveTargetByPath(ws, repoPath);
    const expectedBranch = typeof hit?.target?.branch === "string" ? hit.target.branch.trim() : "";
    if (!expectedBranch) continue;

    const currentBranch = currentBranchOf(repoPath);
    if (currentBranch !== expectedBranch) {
      mismatches.push({
        targetName: hit.target.name,
        repoPath: toPosix(path.resolve(repoPath)),
        expectedBranch,
        currentBranch,
      });
    }
  }
  return mismatches;
}

/**
 * Formats a clear user-facing error message when one or more targets are on an unexpected branch.
 */
export function formatBranchMismatchError(mismatches) {
  const lines = mismatches.map(
    (m) => `- target "${m.targetName}" (${m.repoPath}) ลงทะเบียน branch "${m.expectedBranch}" ไว้ แต่ตอนนี้อยู่ที่ "${m.currentBranch ?? "unknown"}"`,
  );
  return [
    "หยุดทำงานเพราะ repo อยู่ผิด branch ที่ลงทะเบียนไว้:",
    ...lines,
    "ทางเลือก: (1) git switch กลับไป branch ที่ลงทะเบียน, (2) อัปเดตด้วย baan target branch <target> [branch], หรือ (3) ส่ง --allow-branch-mismatch เพื่อยืนยันทำงานต่อบน branch นี้",
  ].join("\n");
}
