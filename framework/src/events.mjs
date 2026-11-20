import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";

// codex counts cached tokens inside input_tokens and reasoning inside output_tokens; Claude reports input
// without cache reads. Normalise so each usage column means the same thing for every provider.
export function codexTurnUsage(u = {}) {
  const cached = u.cached_input_tokens ?? 0;
  return { inputTokens: Math.max(0, (u.input_tokens ?? 0) - cached), cacheReadTokens: cached, cacheWriteTokens: u.cache_write_input_tokens ?? 0, outputTokens: u.output_tokens ?? 0 };
}

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

// Codex launches every command through its own shell wrapper; show the command the model actually asked for.
export function shellCommand(command) {
  const text = String(command ?? "")
    .replace(/^(?:"[^"]*"|\S+)\s+(?:-(?:NoProfile|NonInteractive|NoLogo)\s+)*(?:-Command|-lc|-c|\/d\s+\/s\s+\/c|\/c)\s+/i, "")
    .replace(/^(["'])([\s\S]*)\1$/, "$2");
  return formatToolDetail(text);
}

// Claude -p --output-format stream-json emits whole messages; one message may hold text, thinking and tool_use blocks.
function claudeMessageActivity(content, at) {
  const blocks = Array.isArray(content) ? content : [];
  const tool = blocks.findLast((b) => b?.type === "tool_use");
  if (tool) return { type: "tool", name: tool.name ?? "tool", detail: formatToolDetail(tool.input), at };
  const thinking = blocks.findLast((b) => b?.type === "thinking" && b.thinking?.trim());
  if (thinking) return { type: "thought", thought: thinking.thinking.trim().slice(0, 250), at };
  const text = blocks.findLast((b) => b?.type === "text" && b.text?.trim().length > 5);
  return text ? { type: "thought", thought: text.text.trim().slice(0, 250), at } : null;
}

export function parseLiveActivity(ev, format) {
  if (!ev || typeof ev !== "object") return null;

  // Claude streaming format
  if (format === "claude-stream-json" || format === "claude-json") {
    if (ev.type === "assistant" && ev.message) return claudeMessageActivity(ev.message.content, new Date().toISOString());
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
    // Real `codex exec --json` items: tools announce on item.started, reasoning/messages arrive on item.completed.
    const at = new Date().toISOString();
    const item = ev.item ?? {};
    if (ev.type === "item.started") {
      if (item.type === "command_execution") return { type: "tool", name: "shell", detail: shellCommand(item.command), at };
      if (item.type === "file_change") {
        const paths = (item.changes ?? []).map((c) => c?.path).filter(Boolean);
        return { type: "tool", name: "edit_file", detail: formatToolDetail(paths.length > 1 ? `${paths[0]} +${paths.length - 1} more` : paths[0] ?? ""), at };
      }
      if (item.type === "mcp_tool_call") return { type: "tool", name: `${item.server ?? "mcp"}.${item.tool ?? "tool"}`, detail: formatToolDetail(item.arguments), at };
      if (item.type === "web_search") return { type: "tool", name: "web_search", detail: formatToolDetail(item.query), at };
    }
    if (ev.type === "item.completed" && ["reasoning", "agent_message"].includes(item.type) && item.text?.trim()) {
      return { type: "thought", thought: item.text.trim().slice(0, 250), at };
    }
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
  const { onSessionId, onEvent, onActivity, onUsage, streamLogFile } = opts;
  let sessionId = null;
  const startedCommandIds = new Set();
  // costUsd stays null unless the provider reports one: codex/agy publish no price, and 0 read as "free".
  const usage = { inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0, turns: 0, commands: 0, toolOutputBytes: 0, costUsd: null };
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
        const u = codexTurnUsage(ev.usage);
        for (const key of ["inputTokens", "cacheReadTokens", "cacheWriteTokens", "outputTokens"]) usage[key] += u[key];
      }
      if (ev.type === "error" || ev.type === "turn.failed") {
        errors.push(ev.message ?? ev.error?.message ?? JSON.stringify(ev));
      }
      if (ev.type === "item.started" && ev.item && ["command_execution", "mcp_tool_call"].includes(ev.item.type)) {
        if (ev.item.id) startedCommandIds.add(ev.item.id);
        usage.commands++;
      }
      if (ev.type === "item.completed" && ev.item) {
        if (ev.item.type === "command_execution" || ev.item.type === "mcp_tool_call") {
          if (!ev.item.id || !startedCommandIds.has(ev.item.id)) usage.commands++;
          if (ev.item.type === "command_execution") {
            usage.toolOutputBytes += Buffer.byteLength(String(ev.item.aggregated_output ?? ""), "utf8");
          }
        }
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
      if (activity.type === "tool" && format !== "codex-jsonl") {
        usage.commands++;
      }
      onActivity?.(activity, { ...usage });
    }
    onUsage?.({ ...usage });
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
