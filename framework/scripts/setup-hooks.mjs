#!/usr/bin/env node
// ติดตั้ง Git hook post-merge เพื่อสั่ง auto-update ตาม local.json อัตโนมัติทุกครั้งที่มีการ merge หรือ pull
import { existsSync, mkdirSync, writeFileSync, chmodSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const teamDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(teamDir, "..");
const gitHooksDir = path.join(repoRoot, ".git", "hooks");

if (!existsSync(gitHooksDir)) {
  mkdirSync(gitHooksDir, { recursive: true });
}

const postMergeHook = `#!/bin/sh
# ติดตั้งโดย BAAN setup:hooks — auto-update ทุก workspace ใน local.json หลัง pull หรือ merge
if [ -f "framework/bin/baan.mjs" ]; then
  node framework/bin/baan.mjs sync --no-self-update || true
fi
`;

const hookPath = path.join(gitHooksDir, "post-merge");
writeFileSync(hookPath, postMergeHook, "utf8");
try {
  chmodSync(hookPath, 0o755);
} catch { /* ignore on Windows */ }

console.log(`✨ ติดตั้ง Git hook เรียบร้อย: ${hookPath}`);
