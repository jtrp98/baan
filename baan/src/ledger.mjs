// ledger ของเหตุการณ์ราย call (append-only JSONL ต่อวัน) — ให้วัดเวลาข้าม run ได้โดยไม่ต้องแกะชื่อโฟลเดอร์
// report.json แยกโฟลเดอร์ละ call และบันทึกเฉพาะตอนจบ จึงไม่รู้ว่า call ไหนเริ่มเมื่อไรและรอกันนานแค่ไหน
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { reportsDirOf } from "./config.mjs";
import { localDate } from "./prompts.mjs";

export function ledgerDirOf(workspaceRoot) {
  return path.join(reportsDirOf(workspaceRoot), "ledger");
}

// เขียนบรรทัดเดียวต่อครั้งด้วย append — หลาย baan-role ที่รันขนานเขียนไฟล์เดียวกันได้โดยบรรทัดไม่แทรกกัน
// คืน false แทนการ throw: ledger เป็นแค่เครื่องวัด เขียนไม่ได้ต้องไม่ลากงานจริงล้ม
export function appendEvent(dir, event, now = new Date()) {
  if (!dir) return false;
  try {
    mkdirSync(dir, { recursive: true });
    const line = `${JSON.stringify({ ts: now.toISOString(), pid: process.pid, ...event })}\n`;
    appendFileSync(path.join(dir, `${localDate(now)}.jsonl`), line, "utf8");
    return true;
  } catch {
    return false;
  }
}

// บรรทัดที่ parse ไม่ได้ (เช่น process ตายกลางบรรทัด) ข้ามไป ไม่ทำให้อ่านทั้งไฟล์ไม่ได้
export function readEvents(dir) {
  if (!dir || !existsSync(dir)) return [];
  const events = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".jsonl")).sort()) {
    for (const line of readFileSync(path.join(dir, f), "utf8").split("\n")) {
      if (!line.trim()) continue;
      try { events.push(JSON.parse(line)); } catch { /* บรรทัดเสีย */ }
    }
  }
  return events;
}
