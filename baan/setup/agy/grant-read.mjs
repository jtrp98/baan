#!/usr/bin/env node
// เพิ่ม/ถอน allow-rule `read_file(<dir>)` ใน settings ของ agy — ให้งานโหมดเขียน (cwd = target repo) อ่าน knowledge
// และ repo อื่นใน workspace ได้ · headless ถามสิทธิ์ไม่ได้จึงปฏิเสธเงียบๆ จนได้คำตอบว่าง
// ใช้ --add-dir แทนไม่ได้ เพราะขยายสิทธิ์ "เขียน" ตามไปด้วย ส่วน read_file ให้แค่อ่าน (live test 2026-10-26)
//
//   node setup/agy/grant-read.mjs                 ← ราก workspace ที่หาเจอจาก baan.config.json ของไดเรกทอรีปัจจุบัน
//   node setup/agy/grant-read.mjs <dir> [<dir>…]  ← ระบุเอง
//   เพิ่ม --remove เพื่อถอน · --settings <file> ชี้ settings อื่น (ค่าเริ่มต้น ~/.gemini/antigravity-cli/settings.json)
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { workspaceRootOf } from "../../src/config.mjs";

export const DEFAULT_SETTINGS = path.join(os.homedir(), ".gemini", "antigravity-cli", "settings.json");

export function readRule(dir) {
  const abs = path.resolve(dir);
  // ราก drive = อ่านได้ทั้งเครื่อง — agy เองเตือนห้าม read_file(/)
  if (path.parse(abs).root === abs) throw new Error(`ไม่ให้สิทธิ์อ่านทั้ง drive: ${abs}`);
  return `read_file(${abs})`;
}

export function applyRules(settings, rules, remove = false) {
  const allow = settings.permissions?.allow ?? [];
  const next = remove ? allow.filter((r) => !rules.includes(r)) : [...allow, ...rules.filter((r) => !allow.includes(r))];
  return { ...settings, permissions: { ...settings.permissions, allow: next } };
}

function main(argv) {
  let settingsFile = DEFAULT_SETTINGS;
  let remove = false;
  const dirs = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--remove") remove = true;
    else if (argv[i] === "--settings") settingsFile = argv[++i];
    else dirs.push(argv[i]);
  }
  if (!dirs.length) {
    const root = workspaceRootOf(null);
    if (!root) throw new Error("ไม่พบ baan.config.json จากไดเรกทอรีนี้ — ระบุโฟลเดอร์เอง");
    dirs.push(root);
  }
  if (!existsSync(settingsFile)) throw new Error(`ไม่พบ settings ของ agy: ${settingsFile}`);
  const before = JSON.parse(readFileSync(settingsFile, "utf8"));
  const rules = dirs.map(readRule);
  const after = applyRules(before, rules, remove);
  if (JSON.stringify(after) === JSON.stringify(before)) {
    console.log(`ไม่มีอะไรเปลี่ยน (${rules.join(", ")} ${remove ? "ไม่มีอยู่แล้ว" : "มีอยู่แล้ว"})`);
    return;
  }
  copyFileSync(settingsFile, `${settingsFile}.baan-bak`);
  writeFileSync(settingsFile, `${JSON.stringify(after, null, 2)}\n`, "utf8");
  console.log(`${remove ? "ถอน" : "เพิ่ม"}: ${rules.join(", ")} → ${settingsFile} (สำรองเดิมไว้ที่ .baan-bak)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(1); }
}
