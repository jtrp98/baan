import test from "node:test";
import assert from "node:assert/strict";
import { parseLiveActivity, createStreamParser } from "../src/events.mjs";

test("events: parseLiveActivity extracts Claude tool_use and thoughts", () => {
  const toolEv = {
    type: "tool_use",
    name: "View",
    input: { file_path: "src/cli.mjs" },
  };
  const act = parseLiveActivity(toolEv, "claude-stream-json");
  assert.equal(act.type, "tool");
  assert.equal(act.name, "View");
  assert.equal(act.detail, "src/cli.mjs");

  const thoughtEv = {
    type: "content_block_delta",
    delta: { type: "thinking_delta", thinking: "Analyzing options for monitor" },
  };
  const actThought = parseLiveActivity(thoughtEv, "claude-stream-json");
  assert.equal(actThought.type, "thought");
  assert.equal(actThought.thought, "Analyzing options for monitor");

  const costEv = { total_cost_usd: 0.045 };
  const actCost = parseLiveActivity(costEv, "claude-stream-json");
  assert.equal(actCost.type, "cost");
  assert.equal(actCost.costUsd, 0.045);
});

test("events: parseLiveActivity extracts Codex tool_call and reasoning", () => {
  const toolEv = {
    type: "item.created",
    item: {
      type: "tool_call",
      name: "exec",
      arguments: JSON.stringify({ cmd: "npm test" }),
    },
  };
  const act = parseLiveActivity(toolEv, "codex-jsonl");
  assert.equal(act.type, "tool");
  assert.equal(act.name, "exec");
  assert.equal(act.detail, "npm test");

  const reasonEv = {
    type: "item.created",
    item: {
      type: "reasoning",
      text: "Checking repository baseline",
    },
  };
  const actReason = parseLiveActivity(reasonEv, "codex-jsonl");
  assert.equal(actReason.type, "thought");
  assert.equal(actReason.thought, "Checking repository baseline");
});

test("events: parseLiveActivity extracts AGY tool_call and thought", () => {
  const toolEv = {
    type: "tool_call",
    name: "read_file",
    args: { Path: "C:\\src\\schoolbright\\README.md" },
  };
  const act = parseLiveActivity(toolEv, "agy-stream-json");
  assert.equal(act.type, "tool");
  assert.equal(act.name, "read_file");
  assert.equal(act.detail, "C:\\src\\schoolbright\\README.md");

  const thoughtEv = {
    type: "thought",
    thought: "Reviewing requirements",
  };
  const actThought = parseLiveActivity(thoughtEv, "agy-stream-json");
  assert.equal(actThought.type, "thought");
  assert.equal(actThought.thought, "Reviewing requirements");
});

test("events: createStreamParser emits onActivity and accumulates usage", () => {
  const activities = [];
  const usages = [];
  const parser = createStreamParser("claude-stream-json", {
    onActivity: (act, usage) => {
      activities.push(act);
      usages.push({ ...usage });
    },
  });

  parser.feed(JSON.stringify({ type: "tool_use", name: "Bash", input: { command: "git status" } }) + "\n");
  parser.feed(JSON.stringify({ type: "result", usage: { input_tokens: 100, output_tokens: 20 }, total_cost_usd: 0.01 }) + "\n");

  assert.equal(activities.length, 2);
  assert.equal(activities[0].name, "Bash");
  assert.equal(activities[0].detail, "git status");
  assert.equal(activities[1].type, "cost");
  assert.equal(activities[1].costUsd, 0.01);
  assert.equal(usages.at(-1).inputTokens, 100);
});

test("events: parseLiveActivity reads the real codex exec --json items and Claude assistant messages", () => {
  const codexCommand = { type: "item.started", item: { id: "item_1", type: "command_execution", command: "\"C:\\Users\\u\\.cache\\codex-runtimes\\pwsh.exe\" -Command 'dotnet build backend/ServiceSchoolBot.slnx'", aggregated_output: "", exit_code: null, status: "in_progress" } };
  assert.deepEqual(({ ...parseLiveActivity(codexCommand, "codex-jsonl"), at: 0 }), { type: "tool", name: "shell", detail: "dotnet build backend/ServiceSchoolBot.slnx", at: 0 });

  const fileChange = { type: "item.started", item: { id: "item_5", type: "file_change", changes: [{ path: "C:\repo\a.cs", kind: "add" }, { path: "C:\repo\b.cs", kind: "update" }] } };
  const edit = parseLiveActivity(fileChange, "codex-jsonl");
  assert.equal(edit.name, "edit_file"); assert.equal(edit.detail, "C:\repo\a.cs +1 more");
  assert.equal(parseLiveActivity({ ...fileChange, type: "item.completed" }, "codex-jsonl"), null, "a finished edit must not be reported twice");

  assert.equal(parseLiveActivity({ type: "item.completed", item: { type: "reasoning", text: "Check the contract first" } }, "codex-jsonl").thought, "Check the contract first");
  assert.equal(parseLiveActivity({ type: "item.completed", item: { type: "agent_message", text: "ผมจะอ่านสัญญาก่อน" } }, "codex-jsonl").thought, "ผมจะอ่านสัญญาก่อน");

  const claudeTool = { type: "assistant", message: { content: [{ type: "text", text: "Let me look at the file." }, { type: "tool_use", name: "Read", input: { file_path: "src/cli.mjs" } }] }, session_id: "s" };
  const tool = parseLiveActivity(claudeTool, "claude-stream-json");
  assert.equal(tool.type, "tool"); assert.equal(tool.name, "Read"); assert.equal(tool.detail, "src/cli.mjs");
  assert.equal(parseLiveActivity({ type: "assistant", message: { content: [{ type: "thinking", thinking: "weighing two options" }] } }, "claude-stream-json").thought, "weighing two options");

  let calls = 0;
  const parser = createStreamParser("codex-jsonl", { onActivity: () => calls++ });
  parser.feed(`${JSON.stringify(codexCommand)}\n${JSON.stringify(fileChange)}\n`);
  assert.equal(calls, 2, "the monitor's active file must update while Codex works");
});
