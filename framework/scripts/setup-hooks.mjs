#!/usr/bin/env node
// ติดตั้ง Git hook post-merge ให้รีเฟรช stubs ของทุก workspace ใน local.json หลัง pull หรือ merge repo BAAN
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MARKER = "ติดตั้งโดย BAAN setup:hooks";

// Stubs only: a merge in the BAAN repo must not commit or push any workspace's knowledge.
export const POST_MERGE_HOOK = `#!/bin/sh
# ${MARKER} — รีเฟรช stubs ทุก workspace ใน local.json หลัง pull หรือ merge (ไม่ commit/push knowledge)
if [ -f "framework/bin/baan.mjs" ]; then
  node framework/bin/baan.mjs sync --all --stubs-only --no-self-update || true
fi
`;

export function installPostMergeHook(hooksDir) {
  mkdirSync(hooksDir, { recursive: true });
  const hookPath = path.join(hooksDir, "post-merge");
  if (existsSync(hookPath) && !readFileSync(hookPath, "utf8").includes(MARKER)) {
    return { installed: false, hookPath, reason: "มี post-merge hook ของคนอื่นอยู่แล้ว — ไม่เขียนทับ" };
  }
  writeFileSync(hookPath, POST_MERGE_HOOK, "utf8");
  try { chmodSync(hookPath, 0o755); } catch { /* Windows has no exec bit; Git for Windows runs it anyway. */ }
  return { installed: true, hookPath };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const res = installPostMergeHook(path.join(repoRoot, ".git", "hooks"));
  console.log(res.installed ? `✨ ติดตั้ง Git hook เรียบร้อย: ${res.hookPath}` : `⚠ ${res.reason}: ${res.hookPath}`);
  if (!res.installed) process.exitCode = 1;
}
