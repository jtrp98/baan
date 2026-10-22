// ตัวเรียก AI CLI (claude/codex/agy) — ใช้ร่วมทั้ง mycelium และ mycelium-role
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

function killTree(child) {
  if (!child.pid) return;
  // ต้องฆ่าทั้ง tree เพราะ shell:true ทำให้มี process ลูกหลายชั้น
  if (process.platform === "win32") spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  else child.kill("SIGKILL");
}

// buildArgs: วาง model/effort ก่อน args หลักเสมอ — agy ต้องการ --model มาก่อน --print
// (เพราะ --print กลืน argument ถัดไปเป็น prompt)
// workspaceDirArgs (--add-dir ของ agy) ใส่เฉพาะโหมดอ่านและเมื่อเจอ workspace config:
// jetski ของ agy กันอ่านไฟล์นอก workspace และ headless ปฏิเสธคำขอแทนการถาม จนได้คำตอบว่างเปล่า
// (พบจริงจาก SA ที่ cwd=target อ่าน knowledge/ ไม่ได้) · โหมดเขียนไม่ใส่ เพราะ --add-dir
// ขยายขอบเขต "การเขียน" ตามไปด้วย (ทดสอบแล้วใน accept-edits) — งานเขียนจึงต้องอยู่ใน cwd เท่านั้น
export function buildArgs(def, model, effort, write, answerFile, workspaceRoot = "") {
  const fill = (arr) => arr.map((a) => a.replaceAll("<ANSWER>", answerFile).replaceAll("<MODEL>", model).replaceAll("<EFFORT>", effort).replaceAll("<WORKSPACE_ROOT>", workspaceRoot));
  return [
    ...(model && def.modelArgs ? fill(def.modelArgs) : []),
    ...(effort && def.effortArgs ? fill(def.effortArgs) : []),
    ...(!write && workspaceRoot && def.workspaceDirArgs ? fill(def.workspaceDirArgs) : []),
    ...fill(write ? def.writeArgs : def.readArgs),
  ];
}

// runCli คืนผลเสมอ (ไม่ reject) เพื่อให้ scheduler จัดการความล้มเหลวเป็นสถานะงานต่อเนื่องได้
// ส่ง prompt ทาง stdin เมื่อทำได้ เพื่อเลี่ยงปัญหา quote อักขระพิเศษ; agy รับทาง arg และ spawn ตรงไม่ผ่าน shell
export function runCli(def, args, promptVia, prompt, cwd, timeoutSec, answerFileHint) {
  return new Promise((resolve) => {
    const started = Date.now();
    // ใช้ command string เดียวแทน args array สำหรับตัวที่ผ่าน shell (เลี่ยง DEP0190) — ปลอดภัยเพราะ prompt
    // ไม่เคยอยู่ใน args ของ shell
    const cmdString = [def.command, ...args.map((a) => (a.includes(" ") ? `"${a}"` : a))].join(" ");
    const child = def.useShell
      ? spawn(cmdString, { cwd, shell: true, windowsHide: true, env: process.env })
      : spawn(def.command, args, { cwd, windowsHide: true, env: process.env });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, timeoutSec * 1000);

    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });
    child.on("error", (err) => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      resolve({ ok: false, exitCode: null, durationMs: Date.now() - started, timedOut: false, answer: "", error: err.message, stdout, stderr });
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      let answer = "";
      if (def.answerFrom === "answerFile" && answerFileHint) {
        try { answer = readFileSync(answerFileHint, "utf8").trim(); } catch { /* agent ไม่ได้เขียนไฟล์ = ไม่มีคำตอบ */ }
      } else answer = stdout.trim();
      resolve({ ok: code === 0 && !timedOut, exitCode: code, durationMs: Date.now() - started, timedOut, answer, error: "", stdout, stderr });
    });
    if (promptVia === "stdin") {
      child.stdin.on("error", () => {}); // กัน crash ถ้า process ตายก่อนรับ stdin
      child.stdin.write(prompt);
      child.stdin.end();
    } else {
      child.stdin?.end();
    }
  });
}
