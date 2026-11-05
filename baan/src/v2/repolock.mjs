import { mkdirSync, rmdirSync, openSync, closeSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { hash, repoRoot, git } from "./snapshot.mjs";

export function alive(pid) {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code !== "ESRCH"; }
}
export function lock(root, key) {
  const dir = path.join(root, ".baan", "locks");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${hash(key.toLowerCase())}.lock`);
  const token = randomUUID();
  for (let retry = 0; retry < 2; retry++) {
    try {
      const fd = openSync(file, "wx");
      try { writeFileSync(fd, JSON.stringify({ pid: process.pid, token, key })); } finally { closeSync(fd); }
      return () => { if (JSON.parse(readFileSync(file, "utf8")).token === token) unlinkSync(file); };
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
      let owner;
      try { owner = JSON.parse(readFileSync(file, "utf8")); } catch { throw new Error(`LOCK_BUSY: ${key} (lock incomplete)`); }
      if (!Number.isInteger(owner.pid) || owner.pid <= 0 || alive(owner.pid)) throw new Error(`LOCK_BUSY: ${key} pid=${owner.pid}`);
      const recovery = `${file}.recovery`;
      try { mkdirSync(recovery); } catch { throw new Error(`LOCK_BUSY: ${key} (recovering)`); }
      try {
        const current = JSON.parse(readFileSync(file, "utf8"));
        if (current.token !== owner.token || alive(current.pid)) throw new Error(`LOCK_BUSY: ${key}`);
        unlinkSync(file);
      } catch (e) { if (e.code !== "ENOENT") throw e; }
      finally { rmdirSync(recovery); }
    }
  }
  throw new Error(`LOCK_BUSY: ${key}`);
}
export function repoLock(root, repo) {
  const canonical = repoRoot(repo);
  // The Git directory is shared even when two different workspaces target the same repository.
  const common = path.resolve(canonical, git(canonical, "rev-parse", "--git-common-dir").trim());
  return lock(common, canonical);
}
