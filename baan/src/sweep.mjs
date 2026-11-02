// related-impact sweep แบบกลไก — หาผู้อ้างอิงทุกจุดของสิ่งที่กำลังจะเปลี่ยน แล้วจัดกลุ่มตามเจ้าของไฟล์
// ที่มา: ผลตรวจอิสระ 2026-10-26 — sweep ที่ทำด้วย role ล้วนใช้ 9 role calls ต่อมติเดียว (มติ042 school-bot)
// เพราะต้องให้ AI อ่านเอกสารทั้งก้อนเพื่อหาว่าอะไรอ้างอะไร งานค้นหาเป็นงานกลไก ไม่ต้องใช้ model
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

// โฟลเดอร์หมวดใต้ module → role เจ้าของ (ตาม Read/write scope ในไฟล์ role)
export const OWNER_BY_CATEGORY = {
  requirement: "spec",
  "open-questions": "spec",
  design: "arch",
  plan: "gm",
  "test-plan": "inspect",
  uxui: "int",
  db: "vault",
  qa: "check",
  check: "check",
  review: "check",
};
const OWNER_BY_ROOT_FILE = { "backlog.md": "gm", "security.md": "jpo" };
const CONTROLLER = "นายช่าง";

// archive/ และ changelog/ เป็นประวัติ — แก้ย้อนหลังไม่ได้ จึงไม่ใช่ผู้อ้างอิงที่ต้องตามแก้ ส่วนที่เหลือเป็นของ build/เครื่องมือ
const SKIP_DIRS = new Set([".git", "node_modules", "archive", "changelog", "bin", "obj", "dist", "build", "reports", ".vs", ".idea"]);
const MAX_FILE_BYTES = 2 * 1024 * 1024;

export function ownerOf(relPath, kind) {
  if (kind === "target") return "front/sys";
  const parts = relPath.split(/[\\/]/);
  if (parts.length <= 2) return OWNER_BY_ROOT_FILE[parts.at(-1)] ?? CONTROLLER; // <module>/<ไฟล์> — index หลักเป็นของ นายช่าง
  return OWNER_BY_CATEGORY[parts[1]] ?? CONTROLLER;
}

function* walk(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name) && !e.name.startsWith(".")) yield* walk(full); }
    else if (e.isFile()) yield full;
  }
}

// target จริงมี toolchain ที่ vendor ไว้ใน repo (school-bot: .tools/ ~70k ไฟล์ ทำให้ค้นนาน 44 วินาที) —
// ใช้รายชื่อไฟล์จาก git ที่เคารพ .gitignore ก่อน ถ้าไม่ใช่ git repo ค่อยเดินโฟลเดอร์เอง
function listFiles(dir) {
  const r = spawnSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { cwd: dir, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0 || r.error) return [...walk(dir)];
  return r.stdout.split("\0").filter(Boolean)
    .filter((f) => !f.split("/").slice(0, -1).some((d) => SKIP_DIRS.has(d)))
    .map((f) => path.join(dir, f));
}

function readText(file) {
  if (statSync(file).size > MAX_FILE_BYTES) return null;
  const buf = readFileSync(file);
  if (buf.subarray(0, 8000).includes(0)) return null;
  return buf.toString("utf8");
}

// roots: [{ path, kind: "knowledge" | "target", label }]
export function sweep(roots, terms) {
  const hits = [];
  for (const root of roots) {
    for (const file of listFiles(root.path)) {
      let text;
      try { text = readText(file); } catch { continue; } // ไฟล์ที่ git ยังจำแต่ถูกลบไปแล้ว
      if (text === null || !terms.some((t) => text.includes(t))) continue;
      const rel = path.relative(root.path, file);
      const lines = [];
      text.split(/\r?\n/).forEach((l, i) => { if (terms.some((t) => l.includes(t))) lines.push(i + 1); });
      // --sweep-in ชี้โฟลเดอร์ module (label = ชื่อ module) ส่วน knowledge root ใช้ label ว่าง —
      // ต่อ label ก่อนหาเจ้าของ ให้ path เริ่มที่ <module>/<หมวด> เหมือนกันทั้งสองทาง
      hits.push({ file: path.join(root.label, rel), owner: ownerOf(root.kind === "target" ? rel : path.join(root.label, rel), root.kind), lines });
    }
  }
  return hits.sort((a, b) => a.owner.localeCompare(b.owner) || a.file.localeCompare(b.file));
}

export function formatSweep(hits, terms) {
  const out = [`related-impact sweep: ${terms.map((t) => JSON.stringify(t)).join(", ")}`];
  if (!hits.length) {
    out.push("ไม่มีผู้อ้างอิง — บันทึกในใบงานว่าตรวจแล้วไม่มี (ข้าม archive/ และ changelog/)");
    return out.join("\n");
  }
  const byOwner = new Map();
  for (const h of hits) byOwner.set(h.owner, [...(byOwner.get(h.owner) ?? []), h]);
  out.push(`พบ ${hits.length} ไฟล์ · ${hits.reduce((n, h) => n + h.lines.length, 0)} บรรทัด (ข้าม archive/ และ changelog/)`, "", "| เจ้าของ | ไฟล์ | บรรทัด |", "|---|---|---|");
  for (const h of hits) out.push(`| ${h.owner} | ${h.file.replaceAll("\\", "/")} | ${h.lines.join(", ")} |`);
  out.push("", `ต่อเจ้าของ: ${[...byOwner].map(([o, hs]) => `${o} ${hs.length} ไฟล์`).join(" · ")}`);
  return out.join("\n");
}
