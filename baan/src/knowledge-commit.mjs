// auto commit ให้ที่เก็บเอกสาร (knowledge) หลังจบ run — ผู้ใช้ขอให้ข้อความเป็นภาษาอังกฤษ
// สั้นๆ รูปแบบ "module: สิ่งที่ update" (module = โฟลเดอร์ย่อยแรกใต้ knowledge root)
// ทำงานเฉพาะ knowledge root ที่เป็น git repo (มี .git) — ไม่ใช่ก็ข้ามเงียบๆ
// ความล้มเหลวของ git ห้ามกระทบผล run จริง — แค่เตือนแล้วไปต่อ
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { memoryRootOf } from "./config.mjs";

export function gitIn(root, args) {
  const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true });
  return { ok: r.status === 0, out: r.stdout ?? "", err: (r.stderr ?? "").trim() };
}

// แกะ `git status --porcelain -z`: รายการคั่นด้วย NUL และ R/C มี path เดิมตามหลังอีกช่อง
export function parsePorcelain(raw) {
  const parts = raw.split("\0");
  const entries = [];
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    const code = parts[i].slice(0, 2);
    let file = parts[i].slice(3);
    if (code[0] === "R" || code[0] === "C") i++; // ทิ้ง path เดิม — เอา path ใหม่อย่างเดียวพอ
    entries.push({ code, file });
  }
  return entries;
}

// add = ไฟล์ใหม่ (A/??) · remove = ลบอย่างเดียว (D) · ที่เหลือรวมเป็น update
export function classifyChange(code) {
  if (code.includes("?") || code.includes("A")) return "add";
  if (code.replace(/\s/g, "") === "D") return "remove";
  return "update";
}

// ไฟล์ที่โชว์ในข้อความ commit — ชื่อพอ ไม่ต้องเต็ม path เพื่อให้สั้นตามที่ผู้ใช้ขอ (เกิน 2 ตัวย่อเป็น +N more)
function fileList(paths) {
  const names = [...paths].sort().map((p) => p.split(/[\\/]/).pop());
  const head = names.slice(0, 2).join(", ");
  return names.length > 2 ? `${head} +${names.length - 2} more` : head;
}

// จัดกลุ่มตาม module (โฟลเดอร์ย่อยแรก) แล้วสร้างข้อความ commit ต่อ module —
// ไฟล์ระดับรากของ repo (เช่น README.md) ใช้ชื่อ knowledge root จาก config เป็น module
export function planCommits(entries, rootName) {
  const groups = new Map();
  for (const e of entries) {
    const seg = e.file.split(/[\\/]/);
    const mod = seg.length > 1 ? seg[0] : rootName;
    if (!groups.has(mod)) groups.set(mod, []);
    groups.get(mod).push(e);
  }
  return [...groups.entries()].map(([mod, es]) => {
    const kinds = new Set(es.map((e) => classifyChange(e.code)));
    const verb = kinds.size === 1 ? [...kinds][0] : "update";
    const paths = es.map((e) => e.file);
    return { module: mod, verb, paths, message: `${mod}: ${verb} ${fileList(paths)}` };
  });
}

export function commitKnowledgeRoot(kr, log = () => {}) {
  if (!kr.path || !existsSync(path.join(kr.path, ".git"))) return { repo: false, commits: [] };
  // --untracked-files=all เพราะค่า default ยุบโฟลเดอร์ untracked ทั้งโฟลเดอร์เป็น "dir/" ไฟล์เดียว
  // (ชื่อไฟล์ในข้อความ commit จะหายทั้งหมด)
  const status = gitIn(kr.path, ["status", "--porcelain", "-z", "--untracked-files=all"]);
  if (!status.ok) {
    log(`⚠ ${kr.name}: อ่าน git status ไม่ได้ — ${status.err.split("\n")[0]}`);
    return { repo: true, commits: [], error: status.err };
  }
  const plans = planCommits(parsePorcelain(status.out), kr.name);
  const commits = [];
  for (const p of plans) {
    // add เฉพาะขอบเขตของกลุ่มนี้ก่อน commit ด้วย pathspec เดียวกัน — ของที่ผู้ใช้ staged
    // ไว้ในกลุ่มอื่นจะไม่ถูกกลืนเข้า commit นี้ (กลุ่มไฟล์ระดับรากต้องระบุชื่อไฟล์เพราะไม่มีโฟลเดอร์ครอบ)
    const isRootGroup = !p.paths.some((f) => f.includes("/") || f.includes("\\"));
    const scope = isRootGroup ? p.paths : [p.module];
    const add = gitIn(kr.path, ["add", "-A", "--", ...scope]);
    const commit = add.ok ? gitIn(kr.path, ["commit", "-m", p.message, "--", ...scope]) : add;
    if (!commit.ok) {
      log(`⚠ ${kr.name}: commit "${p.message}" ไม่สำเร็จ — ${commit.err.split("\n")[0]}`);
      continue;
    }
    commits.push(p.message);
    log(`${kr.name}: ${p.message}`);
  }
  return { repo: true, commits };
}

export function commitKnowledge(ws, log = () => {}) {
  const all = [];
  for (const kr of ws.knowledge_roots ?? []) {
    all.push(...commitKnowledgeRoot(kr, log).commits);
    const mem = memoryRootOf(kr);
    // ชื่อ "<root>-memory" ใช้กับไฟล์ระดับรากของ memory และให้ log บอกได้ว่า commit ลง repo ไหน
    if (mem) all.push(...commitKnowledgeRoot({ name: `${kr.name}-memory`, path: mem }, log).commits);
  }
  return all;
}
