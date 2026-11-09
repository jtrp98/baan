import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";

export function formatToolDetail(input) {
  if (!input) return "";
  if (typeof input === "string") return input.slice(0, 200);
  if (typeof input === "object") {
    const candidate = input.file_path || input.path || input.filePath || input.Path || input.command || input.cmd || input.CommandLine || input.query || input.pattern || "";
    if (candidate) return String(candidate).slice(0, 200);
    try {
      const s = JSON.stringify(input);
      return s.length > 200 ? `${s.slice(0, 197)}...` : s;
    } catch {
      return "";
    }
  }
  return String(input).slice(0, 200);
}

export function parseLiveActivity(ev, format) {
  if (!ev || typeof ev !== "object") return null;

  // Claude streaming format
  if (format === "claude-stream-json" || format === "claude-json") {
    if (ev.type === "tool_use" || (ev.type === "content_block_start" && ev.content_block?.type === "tool_use")) {
      const block = ev.content_block ?? ev;
      const name = block.name ?? "tool";
      return { type: "tool", name, detail: formatToolDetail(block.input), at: new Date().toISOString() };
    }
    if (ev.type === "content_block_delta") {
      if (ev.delta?.type === "thinking_delta" && ev.delta.thinking) {
        return { type: "thought", thought: ev.delta.thinking.trim().slice(0, 250), at: new Date().toISOString() };
      }
      if (ev.delta?.type === "text_delta" && ev.delta.text) {
        const text = ev.delta.text.trim();
        if (text.length > 5) return { type: "thought", thought: text.slice(0, 250), at: new Date().toISOString() };
      }
    }
    if (ev.total_cost_usd != null) {
      return { type: "cost", costUsd: ev.total_cost_usd, at: new Date().toISOString() };
    }
  }

  // Codex JSONL format
  if (format === "codex-jsonl") {
    if (ev.type === "item.created") {
      const item = ev.item ?? {};
      if (item.type === "tool_call" || item.type === "function_call") {
        const name = item.name ?? item.tool ?? "tool";
        let args = item.arguments ?? item.parameters ?? {};
        if (typeof args === "string") {
          try { args = JSON.parse(args); } catch {}
        }
        return { type: "tool", name, detail: formatToolDetail(args), at: new Date().toISOString() };
      }
      if (item.type === "reasoning" && item.text) {
        return { type: "thought", thought: item.text.trim().slice(0, 250), at: new Date().toISOString() };
      }
    }
  }

  // AGY stream format
  if (format === "agy-stream-json" || format === "agy-json") {
    if (ev.type === "tool_call" || ev.tool_call) {
      const tc = ev.tool_call ?? ev;
      const name = tc.name ?? "tool";
      return { type: "tool", name, detail: formatToolDetail(tc.args ?? tc.parameters), at: new Date().toISOString() };
    }
    if (ev.thought || ev.type === "thought") {
      const text = ev.thought ?? ev.text ?? "";
      if (text) return { type: "thought", thought: String(text).trim().slice(0, 250), at: new Date().toISOString() };
    }
  }

  return null;
}

export function createStreamParser(format, opts = {}) {
  const { onSessionId, onEvent, onActivity, streamLogFile } = opts;
  let sessionId = null;
  const usage = { inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0, turns: 0, costUsd: 0 };
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
      if (ev.total_cost_usd != null) {
        usage.costUsd = (usage.costUsd ?? 0) + ev.total_cost_usd;
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

    const activity = parseLiveActivity(ev, format);
    if (activity) {
      onActivity?.(activity, { ...usage });
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
