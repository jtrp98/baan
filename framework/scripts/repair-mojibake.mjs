#!/usr/bin/env node
// CLI script สำหรับซ่อมแซมไฟล์ที่เกิดปัญหา Mojibake (CP874/Windows-1252 -> UTF-8)
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { repairFile } from "../src/mojibake.mjs";

function printHelp() {
  console.log(`การใช้งาน:
  node scripts/repair-mojibake.mjs <file...> [--write] [--dry-run] [--indent <n>]

ตัวเลือก:
  --write, -w     เขียนผลลัพธ์ทับลงไฟล์จริง
  --dry-run, -n   ตรวจสอบและทดลองถอดรหัสโดยไม่เขียนไฟล์
  --indent <n>    จำนวนช่องว่างสำหรับจัดรูป JSON (ค่าเริ่มต้น: 2)
  --help, -h      แสดงวิธีใช้งาน`);
}

const args = process.argv.slice(2);
if (!args.length || args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

let write = false;
let dryRun = false;
let indent = 2;
const files = [];

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--write" || a === "-w") write = true;
  else if (a === "--dry-run" || a === "-n") dryRun = true;
  else if (a === "--indent") {
    indent = Number(args[++i]) || 2;
  } else if (!a.startsWith("-")) {
    files.push(a);
  } else {
    console.error(`ตัวเลือกที่ไม่รู้จัก: ${a}`);
    process.exit(1);
  }
}

if (!files.length) {
  console.error("โปรดระบุไฟล์ที่ต้องการซ่อมแซม");
  process.exit(1);
}

let hasError = false;
for (const file of files) {
  const resolved = path.resolve(file);
  if (!existsSync(resolved) || !statSync(resolved).isFile()) {
    console.error(`ไม่พบไฟล์: ${file}`);
    hasError = true;
    continue;
  }
  try {
    const res = repairFile(resolved, { write, dryRun, indent });
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(`เกิดข้อผิดพลาดในการซ่อมแซม ${file}: ${err.message}`);
    hasError = true;
  }
}

process.exit(hasError ? 1 : 0);
