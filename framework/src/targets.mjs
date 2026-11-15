import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

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
 * Lists all configured targets across knowledge_roots with on-disk existence and Git checks.
 */
export function listTargets(ws) {
  const targets = [];
  for (const kr of ws?.knowledge_roots ?? []) {
    for (const tg of kr.targets ?? []) {
      const resolved = tg.path ? path.resolve(tg.path) : "";
      const exists = Boolean(resolved && isDir(resolved));
      targets.push({
        knowledgeRoot: kr.name,
        name: tg.name,
        path: tg.path,
        exists,
        git: exists && isGitRepo(resolved),
      });
    }
  }
  const valid = targets.filter((t) => t.exists).length;
  const missing = targets.length - valid;
  return {
    ok: true,
    config: ws?.source ? toPosix(ws.source) : null,
    total: targets.length,
    valid,
    missing,
    targets,
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

  const byPath = kr.targets.find((t) => normalizeKey(t.path) === key);
  const byName = kr.targets.find((t) => t.name === targetName);

  let action;
  let resultTarget;
  let previousPath;

  if (byName) {
    if (normalizeKey(byName.path) === key) {
      action = "kept";
      resultTarget = byName;
    } else {
      previousPath = byName.path;
      byName.path = posixPath;
      action = "updated";
      resultTarget = byName;
    }
  } else if (byPath && !opts.name) {
    // Preserve existing alias (e.g. school-bot -> sb-web-school-robot) when caller did not force a new name.
    action = "kept";
    resultTarget = byPath;
  } else {
    resultTarget = { name: targetName, path: posixPath };
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

  for (const repo of repos) {
    const key = normalizeKey(repo.resolved);
    const existingByPath = byPath.get(key);
    if (existingByPath) {
      kept.push({ name: existingByPath.name, path: existingByPath.path });
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

    const entry = { name: repo.name, path: repo.path };
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

  const changed = added.length > 0 || repaired.length > 0 || pruned.length > 0;
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
