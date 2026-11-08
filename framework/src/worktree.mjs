import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { lock } from "./repolock.mjs";

export function worktreePathFor(runDir, pkgId) {
  return path.join(runDir, "worktrees", pkgId);
}

export function createPackageWorktree(runDir, pkgId, repoPath) {
  const dest = worktreePathFor(runDir, pkgId);
  if (existsSync(dest)) return dest;
  mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync("git", ["-C", repoPath, "worktree", "add", dest, "HEAD", "--detach"], {
    encoding: "utf8",
    windowsHide: true,
  });
  return dest;
}

export function removePackageWorktree(runDir, pkgId, repoPath) {
  const dest = worktreePathFor(runDir, pkgId);
  if (!existsSync(dest)) return;
  try {
    execFileSync("git", ["-C", repoPath, "worktree", "remove", "--force", dest], {
      encoding: "utf8",
      windowsHide: true,
    });
  } catch {}
}

export function lockWorktree(runRoot, worktreePath) {
  return lock(runRoot, `worktree:${path.resolve(worktreePath)}`);
}
