import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

function killTree(child) {
  // Providers may leave grandchildren alive after the direct process exits.
  if (!child.pid) return;
  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    killer.on("error", () => child.kill("SIGKILL"));
    killer.on("close", (code) => { if (code !== 0) child.kill("SIGKILL"); });
  }
  else child.kill("SIGKILL");
}

export function buildArgs(def, model, effort, write, answerFile, workspaceRoot = "", usage = false) {
  // Some CLI flags consume the remaining prompt, so usage options must precede them.
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

export function runCli(def, args, promptVia, prompt, cwd, timeoutSec, answerFileHint, { usage = false, idleTimeoutSec = def.idleTimeoutSec, signal, onSpawn, onStdout, env = {} } = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const startedAt = new Date(started).toISOString();
    const child = spawn(def.command, args, { cwd, windowsHide: true, env: { ...process.env, ...env } });
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
      const errText = parsed?.errors?.length ? `${stderr}\n${parsed.errors.map((e) => `ERROR: ${e}`).join("\n")}` : stderr;
      const ok = code === 0 && !timedOut && !signal?.aborted && !parsed?.isError;
      const idleNote = idle ? `ไม่มี output เกิน ${idleTimeoutSec} วินาที (idle timeout) — ถูกหยุด` : "";
      const error = ok && answer ? "" : [idleNote, summarizeStderr(errText)].filter(Boolean).join(" | ");
      resolve({ ok, exitCode: code, startedAt, durationMs: Date.now() - started, timedOut, idle, answer, error, stdout, stderr: errText, usage: parsed?.usage ?? null });
    });
    if (promptVia === "stdin") {
      child.stdin.on("error", () => {}); // The child may exit before consuming stdin.
      child.stdin.write(prompt);
      child.stdin.end();
    } else {
      child.stdin?.end();
    }
  });
}
