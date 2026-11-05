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
// usage (เก็บ token): ค่ายที่ประกาศ `usage` ใน agents.json เปลี่ยนรูปแบบ output เป็น JSON — แทนที่ flag เดิม
// (เช่น --output-format text ของ claude) แทนการต่อท้ายซ้ำ เพราะ flag ซ้ำแล้วตัวไหนชนะขึ้นกับ CLI
// usage.insertBefore: arg ท้ายที่ต้องอยู่ท้ายสุดเสมอ — "-" ของ codex (prompt ทาง stdin) และ "--print" ของ agy
// (กลืน arg ถัดไปเป็น prompt) จึงต้องแทรก flag ของ usage ก่อนตัวนั้น
export function buildArgs(def, model, effort, write, answerFile, workspaceRoot = "", usage = false) {
  const fill = (arr) => arr.map((a) => a.replaceAll("<ANSWER>", answerFile).replaceAll("<MODEL>", model).replaceAll("<EFFORT>", effort).replaceAll("<WORKSPACE_ROOT>", workspaceRoot));
  let main = fill(write ? def.writeArgs : def.readArgs);
  if (usage && def.usage?.args) {
    for (const flag of def.usage.replaces ?? []) {
      const i = main.indexOf(flag);
      if (i !== -1) main = [...main.slice(0, i), ...main.slice(i + 2)];
    }
    const tail = def.usage.insertBefore && main.at(-1) === def.usage.insertBefore ? [main.pop()] : [];
    main = [...main, ...def.usage.args, ...tail];
  }
  return [
    ...(model && def.modelArgs ? fill(def.modelArgs) : []),
    ...(effort && def.effortArgs ? fill(def.effortArgs) : []),
    ...(!write && workspaceRoot && def.workspaceDirArgs ? fill(def.workspaceDirArgs) : []),
    ...main,
  ];
}

// แกะ token usage จาก output แบบ JSON ของแต่ละค่าย — รูปแบบตรวจจากของจริง (Claude Code 2.1.318, codex-cli 0.166.0)
// claude: object เดียว { result, usage, total_cost_usd, num_turns, session_id, is_error }
// codex: JSONL events · usage อยู่ที่ turn.completed (รวมทุก turn) · error มาเป็น event แทน stderr
// agy (1.4.12): object เดียว { response, status, num_turns, conversation_id, usage }
export function parseUsageOutput(format, stdout) {
  const text = String(stdout ?? "");
  if (format === "agy-json") {
    try {
      const j = JSON.parse(text.trim());
      const u = j.usage ?? {};
      return {
        answer: typeof j.response === "string" ? j.response.trim() : "",
        isError: typeof j.status === "string" && j.status !== "SUCCESS",
        usage: {
          inputTokens: u.input_tokens ?? 0,
          cacheReadTokens: u.cache_read_tokens ?? 0,
          cacheWriteTokens: 0,
          outputTokens: (u.output_tokens ?? 0) + (u.thinking_tokens ?? 0),
          costUsd: null,
          turns: j.num_turns ?? null,
          sessionId: j.conversation_id ?? null,
        },
        errors: [],
      };
    } catch { return null; }
  }
  if (format === "claude-json") {
    try {
      const j = JSON.parse(text.trim());
      const u = j.usage ?? {};
      return {
        answer: typeof j.result === "string" ? j.result.trim() : "",
        isError: j.is_error === true,
        usage: {
          inputTokens: u.input_tokens ?? 0,
          cacheReadTokens: u.cache_read_input_tokens ?? 0,
          cacheWriteTokens: u.cache_creation_input_tokens ?? 0,
          outputTokens: u.output_tokens ?? 0,
          costUsd: j.total_cost_usd ?? null,
          turns: j.num_turns ?? null,
          sessionId: j.session_id ?? null,
        },
        errors: [],
      };
    } catch { return null; }
  }
  if (format === "codex-jsonl") {
    const usage = { inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0, costUsd: null, turns: 0, sessionId: null };
    const errors = [];
    let seen = false;
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim().startsWith("{")) continue;
      let ev;
      try { ev = JSON.parse(line); } catch { continue; }
      seen = true;
      if (ev.type === "thread.started") usage.sessionId = ev.thread_id ?? null;
      if (ev.type === "turn.completed" && ev.usage) {
        usage.turns++;
        usage.inputTokens += ev.usage.input_tokens ?? 0;
        usage.cacheReadTokens += ev.usage.cached_input_tokens ?? 0;
        usage.cacheWriteTokens += ev.usage.cache_write_input_tokens ?? 0;
        usage.outputTokens += (ev.usage.output_tokens ?? 0) + (ev.usage.reasoning_output_tokens ?? 0);
      }
      if (ev.type === "error" || ev.type === "turn.failed") errors.push(ev.message ?? ev.error?.message ?? JSON.stringify(ev));
    }
    return seen ? { answer: null, isError: false, usage, errors } : null;
  }
  return null;
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
// usage = args ถูกสร้างด้วย buildArgs(..., usage=true) — ต้องแกะ stdout เป็น JSON ตาม def.usage.format
// idle timeout: ฆ่า process ที่เงียบ (ไม่มี stdout/stderr) นานเกินกำหนด แยกจาก wall timeout — ใช้ได้เฉพาะค่ายที่
// พิมพ์ความคืบหน้าระหว่างทำ (codex) ประกาศด้วย idleTimeoutSec ใน agents.json · claude -p/agy --print แบบ text
// เงียบจนจบงาน ถ้าตั้งให้จะฆ่างานปกติทิ้ง · ที่มา: school-bot 2026-11-03 call เดียวค้าง 183 นาที
export function runCli(def, args, promptVia, prompt, cwd, timeoutSec, answerFileHint, { usage = false, idleTimeoutSec = def.idleTimeoutSec, signal, onSpawn, onStdout } = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const startedAt = new Date(started).toISOString();
    // ใช้ command string เดียวแทน args array สำหรับตัวที่ผ่าน shell (เลี่ยง DEP0190) — ปลอดภัยเพราะ prompt
    // ไม่เคยอยู่ใน args ของ shell
    const cmdString = [def.command, ...args.map((a) => (a.includes(" ") ? `"${a}"` : a))].join(" ");
    const child = def.useShell
      ? spawn(cmdString, { cwd, shell: true, windowsHide: true, env: process.env })
      : spawn(def.command, args, { cwd, windowsHide: true, env: process.env });
    onSpawn?.(child.pid);
    const abort = () => killTree(child);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let idle = false;
    let settled = false;
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, timeoutSec * 1000);
    let idleTimer = null;
    const armIdle = () => {
      if (!idleTimeoutSec) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { timedOut = true; idle = true; killTree(child); }, idleTimeoutSec * 1000);
    };
    const stopTimers = () => { clearTimeout(timer); clearTimeout(idleTimer); signal?.removeEventListener("abort", abort); };
    armIdle();

    child.stdout.on("data", (d) => { stdout += d; armIdle(); onStdout?.(d.toString()); });
    child.stderr.on("data", (d) => { stderr += d; armIdle(); });
    child.on("error", (err) => {
      if (settled) return;
      settled = true; stopTimers();
      resolve({ ok: false, exitCode: null, startedAt, durationMs: Date.now() - started, timedOut: false, idle: false, answer: "", error: err.message, stdout, stderr, usage: null });
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true; stopTimers();
      const parsed = usage && def.usage?.format ? parseUsageOutput(def.usage.format, stdout) : null;
      let answer = "";
      if (def.answerFrom === "answerFile" && answerFileHint) {
        try { answer = readFileSync(answerFileHint, "utf8").trim(); } catch { /* agent ไม่ได้เขียนไฟล์ = ไม่มีคำตอบ */ }
      } else answer = parsed?.answer ?? stdout.trim();
      // error ของ codex --json มาทาง stdout เป็น event — ต่อเข้า stderr ให้การตรวจโควตา/startup error ยังเห็น
      const errText = parsed?.errors?.length ? `${stderr}\n${parsed.errors.map((e) => `ERROR: ${e}`).join("\n")}` : stderr;
      const ok = code === 0 && !timedOut && !parsed?.isError;
      const idleNote = idle ? `ไม่มี output เกิน ${idleTimeoutSec} วินาที (idle timeout) — ถูกหยุด` : "";
      const error = ok && answer ? "" : [idleNote, summarizeStderr(errText)].filter(Boolean).join(" | ");
      resolve({ ok, exitCode: code, startedAt, durationMs: Date.now() - started, timedOut, idle, answer, error, stdout, stderr: errText, usage: parsed?.usage ?? null });
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
