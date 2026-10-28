// ตัวเรียก AI CLI (claude/codex/agy) — ใช้ร่วมทั้ง baan และ baan-role
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
// ส่วนการอ่านนอก cwd ในโหมดเขียนให้ผ่าน allow-rule read_file ของเครื่อง (setup/agy/grant-read.mjs) ซึ่งไม่ให้สิทธิ์เขียน
export function buildArgs(def, model, effort, write, answerFile, workspaceRoot = "") {
  const fill = (arr) => arr.map((a) => a.replaceAll("<ANSWER>", answerFile).replaceAll("<MODEL>", model).replaceAll("<EFFORT>", effort).replaceAll("<WORKSPACE_ROOT>", workspaceRoot));
  return [
    ...(model && def.modelArgs ? fill(def.modelArgs) : []),
    ...(effort && def.effortArgs ? fill(def.effortArgs) : []),
    ...(!write && workspaceRoot && def.workspaceDirArgs ? fill(def.workspaceDirArgs) : []),
    ...fill(write ? def.writeArgs : def.readArgs),
  ];
}

// เหตุที่ล้มต้องอยู่ใน report.json เลย — เดิม error ว่างเมื่อ process จบเอง (codex "at capacity" exit 1,
// agy ถูกปฏิเสธสิทธิ์แต่ exit 0 คำตอบว่าง) ต้องไปเปิด stderr เองถึงรู้
// stderr ของ codex มี transcript ทั้งงานปนอยู่ จึงเลือกเฉพาะบรรทัดที่ CLI ประกาศ error เอง ไม่ใช่ทั้งก้อน
const ERROR_LINE = /^(?:ERROR|AGY_ERROR|API Error|Error|fatal|jetski):/;
const ERROR_TEXT_CAP = 600;
const ERROR_HINTS = [
  [/"read_file" permission/, "อ่านไฟล์นอก cwd ไม่ได้ — ให้สิทธิ์อ่านด้วย setup/agy/grant-read.mjs (อย่าใช้ --add-dir/--dangerously-skip-permissions ในโหมดเขียน)"],
];

export function summarizeStderr(stderr) {
  const lines = String(stderr ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return "";
  const picked = [...new Set(lines.filter((l) => ERROR_LINE.test(l)))].slice(-3);
  let text = picked.length ? picked.join(" | ") : lines.join("\n").length <= ERROR_TEXT_CAP ? lines.join(" | ") : "";
  for (const [re, hint] of ERROR_HINTS) if (re.test(text)) text += ` → ${hint}`;
  return text.length > ERROR_TEXT_CAP ? `${text.slice(0, ERROR_TEXT_CAP)}…` : text;
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
      const ok = code === 0 && !timedOut;
      const error = ok && answer ? "" : summarizeStderr(stderr);
      resolve({ ok, exitCode: code, durationMs: Date.now() - started, timedOut, answer, error, stdout, stderr });
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
