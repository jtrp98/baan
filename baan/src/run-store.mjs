// การเก็บสถานะของ run: checkpoint ราย task, manifest ของ run, และการ resume
import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import path from "node:path";

// เขียนแบบ atomic (ไฟล์ชั่วคราว + rename ในโฟลเดอร์เดียวกัน) เพื่อไม่ให้ crash กลางทาง
// ทิ้งไฟล์ครึ่งๆ ที่ resume อาจไปอ่านเข้า
function writeAtomic(file, data) {
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
  writeFileSync(tmp, data, "utf8");
  renameSync(tmp, file);
}

export function writeCheckpoint(runDir, rec) {
  writeAtomic(path.join(runDir, `${rec.id}.status.json`), JSON.stringify(rec, null, 2));
}

export function readCheckpoint(runDir, id) {
  try {
    const cp = JSON.parse(readFileSync(path.join(runDir, `${id}.status.json`), "utf8"));
    return typeof cp === "object" && cp !== null ? cp : null;
  } catch { return null; }
}

// manifest เก็บบริบทที่ resolve แล้ว เพื่อคืนค่าตอน --resume โดยไม่ต้องส่ง --target/--cwd ซ้ำ
export function writeManifest(runDir, opts) {
  const m = {
    version: 1,
    createdAt: new Date().toISOString(),
    goal: opts.goal ?? "",
    target: opts.target || null,
    cwd: opts.cwd,
    projectCtx: opts.projectCtx ?? "",
    write: !!opts.write,
    agent: opts.agent ?? "",
    plannerTier: opts.plannerTier ?? "",
    maxParallel: opts.maxParallel ?? 0,
    timeoutSec: opts.timeoutSec ?? 0,
  };
  writeAtomic(path.join(runDir, "run.json"), JSON.stringify(m, null, 2));
  return m;
}

export function readManifest(runDir) {
  try {
    const m = JSON.parse(readFileSync(path.join(runDir, "run.json"), "utf8"));
    return typeof m === "object" && m !== null ? m : null;
  } catch { return null; }
}

// คืนบริบทจาก manifest เฉพาะ field ที่ผู้ใช้ไม่ได้ส่ง flag มาเอง (explicit ชนะเสมอ)
export function applyManifestToOpts(opts, manifest, log = () => {}) {
  if (!manifest) return opts;
  if (!opts.explicit.has("cwd") && !opts.cwd && typeof manifest.cwd === "string" && manifest.cwd) {
    // path ที่เคยมีอาจถูกลบ/ย้ายไปแล้ว — เงียบๆ ตกไปทำงานผิดที่อันตรายกว่า error
    if (!existsSync(manifest.cwd)) throw new Error(`cwd ของ run เดิมไม่มีอยู่อีกแล้ว: ${manifest.cwd} — ส่ง --cwd <path ปัจจุบัน> แทน`);
    opts.cwd = manifest.cwd;
    log(`คืน cwd จาก run เดิม: ${manifest.cwd}`);
  }
  if (!opts.explicit.has("write") && manifest.write) {
    opts.write = true;
    log("คืนโหมด --write จาก run เดิม (run เดิมสั่งเขียนไฟล์)");
  }
  if (!opts.target && typeof manifest.projectCtx === "string" && manifest.projectCtx) {
    opts.projectCtx = manifest.projectCtx;
    if (manifest.target) log(`คืนบริบทโปรเจกต์ของ target เดิม: ${manifest.target}`);
  }
  return opts;
}

// ข้ามเฉพาะ task ที่ checkpoint ระบุ completed และมีไฟล์คำตอบจริง —
// ไฟล์คำตอบเดียวไม่ใช่หลักฐานความสำเร็จ (อาจเป็น output บางส่วนจาก task ที่ timeout)
export function preloadDone(runDir, plan, log = console.log) {
  const done = new Map();
  let sawCheckpoint = false;
  for (const t of plan.tasks) {
    const cp = readCheckpoint(runDir, t.id);
    if (!cp) continue;
    sawCheckpoint = true;
    if (cp.state === "completed") {
      let answer = "";
      try { answer = readFileSync(path.join(runDir, `${t.id}.answer.txt`), "utf8").trim(); } catch { /* ไม่มีไฟล์ = รันใหม่ */ }
      if (answer) {
        done.set(t.id, { state: "completed", ok: true, exitCode: cp.exitCode ?? 0, durationMs: cp.durationMs ?? 0, timedOut: false, answer, marker: cp.marker ?? null });
        log(`ข้าม ${t.id} — completed ตาม checkpoint ของ run เดิม`);
        continue;
      }
      log(`รัน ${t.id} ใหม่ — checkpoint ระบุ completed แต่ไม่มีไฟล์คำตอบ`);
    } else {
      log(`รัน ${t.id} ใหม่ — run เดิมจบสถานะ ${cp.state}${cp.marker ? ` (${cp.marker})` : ""}`);
    }
  }
  if (!sawCheckpoint && plan.tasks.length) log(`(run เดิมไม่มี checkpoint — อาจเป็น run ก่อน v0.3.0 งานทุกตัวจะถูกรันใหม่)`);
  return done;
}

export { writeAtomic };
