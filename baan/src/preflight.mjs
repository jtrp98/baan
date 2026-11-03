// ตรวจใบงานก่อนเปิด session — จับเฉพาะเงื่อนไขที่ sandbox ของ CLI ขวางแน่ๆ และเคยทำให้ role รันเปล่า
// จนตอบ BLOCKED หลังเผาเวลาไป 2–27 นาที (school-bot 2026-10-26..11-03: รันเสีย 28 ครั้ง ~19% ของเวลา agent)
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

// ต้องเขียน bin/obj/cache ระหว่าง build — โหมดอ่านของทุก agent ทำไม่ได้ (codex read-only sandbox,
// claude allowedTools ไม่มีคำสั่งเหล่านี้) · ใบงานจริงมักสั่งเป็นร้อยแก้ว ("รัน xUnit runner ครบทุก test") จึงจับคำไทยด้วย
const BUILD_CMD = /\b(?:dotnet\s+(?:test|build|run)|npm\s+(?:test|run|ci|install)|pnpm\s+\w+|yarn\s+(?:test|build)|go\s+(?:test|build)|pytest|cargo\s+(?:test|build)|mvn|gradlew?|xunit|vstest|jest|vitest)\b|รัน[^\n]{0,30}(?:test|เทสต์|ทดสอบ)/i;
// เฉพาะคำสั่งที่อ่านประวัติ — ใบงานพูดถึง git ในประโยคอื่นบ่อย ("ห้าม git commit", "ประวัติอยู่ใน git")
const GIT_HISTORY = /\bgit\s+(?:-C\s+\S+\s+)?(?:show|diff|log|blame)\b|\bHEAD:/;
// path แบบ drive letter เท่านั้น — path แบบ /x/y ชนกับ route ของ API (/v2/admin/...) ในใบงานบ่อยเกินไป
// ตัดที่อักษรไทยด้วยเพราะใบงานมักเขียนติดกันไม่เว้นวรรค เช่น "C:\x\yที่"
const WIN_PATH = /[A-Za-z]:[\\/][^\s"'`<>|*?()[\]\u0E00-\u0E7F]+/g;
const TASK_FILE_CAP = 64 * 1024;

export function extractWinPaths(text) {
  const out = new Set();
  for (const m of String(text ?? "").matchAll(WIN_PATH)) {
    const p = m[0].replace(/[.,;:]+$/, "").replace(/#L\d+(?:-L\d+)?$/, "").replace(/:\d+(?::\d+)?$/, "");
    if (p.length > 3) out.add(path.win32.normalize(p));
  }
  return [...out];
}

function insideDir(dir, p) {
  const rel = path.win32.relative(dir.toLowerCase(), p.toLowerCase());
  return rel === "" || (!rel.startsWith("..") && !path.win32.isAbsolute(rel));
}

export function findGitRoot(start, exists = existsSync) {
  let dir = path.resolve(start);
  for (;;) {
    if (exists(path.join(dir, ".git"))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return "";
    dir = up;
  }
}

// ใบงานแบบ "อ่าน <ไฟล์>-task.txt แล้วทำตามนั้น" มีคำสั่งจริงอยู่ในไฟล์ — ตามอ่านชั้นเดียวเฉพาะ .txt
// (.md ที่อ้างคือเอกสารอ้างอิงซึ่งเต็มไปด้วย path ของคนอื่น จะเตือนผิด)
export function expandTaskText(task, { exists = existsSync, read = (p) => readFileSync(p, "utf8"), size = (p) => statSync(p).size } = {}) {
  const parts = [task];
  for (const p of extractWinPaths(task)) {
    if (!/\.txt$/i.test(p) || !exists(p)) continue;
    try { if (size(p) <= TASK_FILE_CAP) parts.push(read(p)); } catch { /* อ่านไม่ได้ = ไม่ขยาย */ }
  }
  return parts.join("\n");
}

// คืนรายการปัญหา (ว่าง = ผ่าน) · ทุกข้อเป็นเหตุให้ไม่เปิด session เพราะรันไปก็ได้ BLOCKED
export function preflightTask({ task, cwd, write }, { exists = existsSync, gitRoot = findGitRoot } = {}) {
  const problems = [];
  if (!write && BUILD_CMD.test(task)) {
    problems.push({
      code: "read-build",
      message: `ใบงานสั่ง build/test (${task.match(BUILD_CMD)[0]}) แต่เปิดโหมดอ่าน — sandbox โหมดอ่านเขียน bin/obj ไม่ได้ role จะตอบ BLOCKED · ใส่ --write (งานตรวจให้รันใน snapshot เพื่อไม่แตะ source)`,
    });
  }
  if (write && /^[A-Za-z]:/.test(cwd)) {
    // บรรทัด "memory ของ module" จาก baan --module-context ชี้ที่ที่นายช่างจะบันทึกภายหลัง ไม่ใช่ปลายทางของ role
    const scanned = task.replace(/^- memory ของ module:.*$/gm, "");
    const missing = extractWinPaths(scanned).filter((p) => !insideDir(cwd, p) && !exists(p));
    if (missing.length) {
      problems.push({
        code: "write-outside",
        message: `ใบงานอ้าง path นอก --cwd ที่ยังไม่มีอยู่: ${missing.join(", ")} — ถ้าให้ role สร้าง sandbox โหมดเขียนจะปฏิเสธ (เขียนได้เฉพาะใน ${cwd}) · ย้ายปลายทางเข้า cwd หรือเปลี่ยน --cwd · ถ้าเป็นไฟล์ให้อ่าน แปลว่า path ผิด`,
      });
    }
  }
  if (write && GIT_HISTORY.test(task)) {
    const root = gitRoot(cwd);
    if (root && path.resolve(root).toLowerCase() !== path.resolve(cwd).toLowerCase()) {
      problems.push({
        code: "git-parent",
        message: `ใบงานให้อ่านประวัติ git แต่ --cwd อยู่ใต้ repo ${root} — sandbox โหมดเขียนของ codex ปฏิเสธ .git ที่โฟลเดอร์แม่เป็นพักๆ (school-bot 2026-11-02: BLOCKED 4 ใน 8 รัน) · ให้ --cwd ${root} หรือให้นายช่างเทียบกับ git เองแล้วตัดคำสั่ง git ออกจากใบงาน`,
      });
    }
  }
  return problems;
}
