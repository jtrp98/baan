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

const clean = (p) => p.replace(/[.,;:]+$/, "").replace(/#L\d+(?:-L\d+)?$/, "").replace(/:\d+(?::\d+)?$/, "");
const SPACED_TAIL = /^(?: [^\s"'`<>|*?()[\]\u0E00-\u0E7F]+){1,6}/;

// exists (ถ้าส่ง): path ที่ถูกตัดตรงช่องว่างแล้วไม่มีอยู่ ลองต่อคำถัดไป (เช่น "C:\Users\a\OneDrive - Co\proj")
// เลือกตัวที่ยาวสุดซึ่งมีอยู่ หรือข้ามช่องว่างเข้าไปถึงโฟลเดอร์ที่มีอยู่ (ไฟล์ที่จะสร้างในนั้น) — ไม่ต่อ = workspace
// ที่มีช่องว่างถูกเตือนผิดทุก path · ห้ามรับแค่ "โฟลเดอร์แม่เดิมมีอยู่" ไม่งั้นคำในประโยคถัดไปจะถูกกลืนเป็นชื่อไฟล์
export function extractWinPaths(text, exists = null) {
  const s = String(text ?? "");
  const out = new Set();
  for (const m of s.matchAll(WIN_PATH)) {
    let p = path.win32.normalize(clean(m[0]));
    const tail = exists && !exists(p) ? SPACED_TAIL.exec(s.slice(m.index + m[0].length)) : null;
    if (tail) {
      const words = tail[0].slice(1).split(" ");
      for (let i = words.length; i > 0; i--) {
        const c = path.win32.normalize(clean(`${m[0]} ${words.slice(0, i).join(" ")}`));
        const dir = path.win32.dirname(c);
        if (exists(c) || (dir.length > path.win32.dirname(p).length && exists(dir))) { p = c; break; }
      }
    }
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
  // โหมดเขียนไม่มี sandbox แล้ว (ผู้ใช้สั่ง 2026-11-04) — เดิมตรวจ write-outside (สร้างไฟล์นอก cwd) และ git-parent
  // (อ่าน .git ของโฟลเดอร์แม่) ซึ่งเป็นข้อจำกัดของ sandbox โหมดเขียนเท่านั้น จึงไม่ต้องหยุดอีก
  return problems;
}
