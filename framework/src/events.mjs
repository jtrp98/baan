import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";

export function createStreamParser(format, opts = {}) {
  const { onSessionId, onEvent, streamLogFile } = opts;
  let sessionId = null;
  const usage = { inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0, turns: 0 };
  const errors = [];
  let answer = null;
  let buffer = "";

  if (streamLogFile) {
    try { mkdirSync(path.dirname(streamLogFile), { recursive: true }); } catch {}
  }

  function logRaw(chunk) {
    if (streamLogFile) {
      try { appendFileSync(streamLogFile, chunk, "utf8"); } catch {}
    }
  }

  function handleEvent(ev) {
    onEvent?.(ev);

    // Claude streaming format
    if (format === "claude-stream-json" || format === "claude-json") {
      const sid = ev.session_id || ev.sessionId;
      if (sid && !sessionId) {
        sessionId = sid;
        onSessionId?.(sid);
      }
      if (ev.type === "result" || ev.structured_output) {
        if (ev.structured_output) answer = ev.structured_output;
        else if (typeof ev.result === "string") answer = ev.result;
        if (ev.usage) {
          usage.inputTokens += ev.usage.input_tokens ?? 0;
          usage.cacheReadTokens += ev.usage.cache_read_input_tokens ?? 0;
          usage.cacheWriteTokens += ev.usage.cache_creation_input_tokens ?? 0;
          usage.outputTokens += ev.usage.output_tokens ?? 0;
          usage.turns = ev.num_turns ?? usage.turns + 1;
        }
      }
      if (ev.is_error || ev.error) errors.push(ev.error || ev.message || JSON.stringify(ev));
    }

    // Codex JSONL format
    if (format === "codex-jsonl") {
      if (ev.type === "thread.started" && ev.thread_id) {
        sessionId = ev.thread_id;
        onSessionId?.(sessionId);
      }
      if (ev.type === "turn.completed" && ev.usage) {
        usage.turns++;
        usage.inputTokens += ev.usage.input_tokens ?? 0;
        usage.cacheReadTokens += ev.usage.cached_input_tokens ?? 0;
        usage.cacheWriteTokens += ev.usage.cache_write_input_tokens ?? 0;
        usage.outputTokens += (ev.usage.output_tokens ?? 0) + (ev.usage.reasoning_output_tokens ?? 0);
      }
      if (ev.type === "error" || ev.type === "turn.failed") {
        errors.push(ev.message ?? ev.error?.message ?? JSON.stringify(ev));
      }
    }

    // AGY stream format
    if (format === "agy-stream-json" || format === "agy-json") {
      const cid = ev.conversation_id || ev.conversationId;
      if (cid && !sessionId) {
        sessionId = cid;
        onSessionId?.(sessionId);
      }
      if (ev.status === "SUCCESS" && ev.response !== undefined) {
        answer = ev.response;
      }
      if (ev.usage) {
        usage.inputTokens += ev.usage.input_tokens ?? 0;
        usage.cacheReadTokens += ev.usage.cache_read_tokens ?? 0;
        usage.outputTokens += (ev.usage.output_tokens ?? 0) + (ev.usage.thinking_tokens ?? 0);
        usage.turns = ev.num_turns ?? usage.turns + 1;
      }
      if (ev.status === "ERROR" || ev.error) {
        errors.push(ev.error || ev.message || "AGY execution error");
      }
    }
  }

  function feed(chunk) {
    logRaw(chunk);
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop(); // keep partial trailing line

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const ev = JSON.parse(line.trim());
        handleEvent(ev);
      } catch {
        // Line is not valid JSON, ignore or treat as raw message
      }
    }
  }

  function flush() {
    if (buffer.trim()) {
      try {
        const ev = JSON.parse(buffer.trim());
        handleEvent(ev);
      } catch {}
      buffer = "";
    }
    return { sessionId, usage, errors, answer };
  }

  return { feed, flush, getState: () => ({ sessionId, usage, errors, answer }) };
}
