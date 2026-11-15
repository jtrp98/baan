import { execFileSync } from "node:child_process";
import { mkdirSync, rmdirSync, openSync, closeSync, readFileSync, unlinkSync, writeFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { hash, repoRoot, git } from "./snapshot.mjs";

export function alive(pid) {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code !== "ESRCH"; }
}

const OWNER_EXE = path.basename(process.execPath).toLowerCase();

function imageName(pid) {
  try {
    if (process.platform === "win32") {
      const out = execFileSync("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"], { encoding: "utf8", windowsHide: true });
      const name = out.trim().startsWith('"') ? out.trim().split('","')[0].replace(/^"/, "") : "";
      return name.toLowerCase() || null;
    }
    return execFileSync("ps", ["-p", String(pid), "-o", "comm="], { encoding: "utf8" }).trim().split("/").pop().toLowerCase() || null;
  } catch { return undefined; }
}

// Windows recycles PIDs quickly, so a lock left by a crashed run could point at an unrelated live process and
// stay "busy" forever. The owner is always BAAN's runtime; a different image name means the lock is stale.
function ownerAlive(owner) {
  if (!alive(owner.pid)) return false;
  const name = imageName(owner.pid);
  if (name === undefined) return true; // Cannot tell: keep the lock rather than risk two writers.
  if (name === null) return false;
  const expected = String(owner.exe ?? "node").toLowerCase().replace(/\.exe$/, "");
  return name.replace(/\.exe$/, "") === expected;
}
export function lock(root, key) {
  const dir = path.join(root, ".baan", "locks");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${hash(key.toLowerCase())}.lock`);
  const token = randomUUID();
  for (let retry = 0; retry < 2; retry++) {
    try {
      const fd = openSync(file, "wx");
      try { writeFileSync(fd, JSON.stringify({ pid: process.pid, exe: OWNER_EXE, token, key })); } finally { closeSync(fd); }
      // Releasing runs in finally blocks: a lock file someone already removed must not replace the real error.
      return () => {
        try { if (JSON.parse(readFileSync(file, "utf8")).token === token) unlinkSync(file); }
        catch (e) { if (e.code !== "ENOENT") throw e; }
      };
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
      let owner;
      try { owner = JSON.parse(readFileSync(file, "utf8")); } catch { throw new Error(`LOCK_BUSY: ${key} (lock incomplete)`); }
      if (!Number.isInteger(owner.pid) || owner.pid <= 0 || ownerAlive(owner)) throw new Error(`LOCK_BUSY: ${key} pid=${owner.pid}`);
      const recovery = `${file}.recovery`;
      try { mkdirSync(recovery); } catch { throw new Error(`LOCK_BUSY: ${key} (recovering)`); }
      try {
        const current = JSON.parse(readFileSync(file, "utf8"));
        if (current.token !== owner.token || ownerAlive(current)) throw new Error(`LOCK_BUSY: ${key}`);
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
  return lock(common, `repository:${realpathSync(common)}`);
}
