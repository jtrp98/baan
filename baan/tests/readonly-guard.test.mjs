import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { assertAgyReadonly } from "../src/session.mjs";

const guard = fileURLToPath(new URL("../setup/agy/baan-readonly-guard.js", import.meta.url));
function check(input, readonly = "1") {
  const r = spawnSync(process.execPath, [guard], { input, env: { ...process.env, BAAN_READONLY: readonly }, encoding: "utf8", windowsHide: true });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout).decision;
}
test("read-only guard denies shell/script evaluation, write/network/unknown tools and malformed input", () => {
  for (const name of ["run_command", "write_to_file", "search_web", "manage_task", "new_privileged_tool"]) {
    assert.equal(check(JSON.stringify({ toolCall: { name, args: { CommandLine: "node arbitrary.js" } } })), "deny");
  }
  for (const input of ["{", "null", "{}", '{"toolCall":{}}']) assert.equal(check(input), "deny");
});
test("read-only guard permits only file inspection and does not change worker/standalone permissions", () => {
  for (const name of ["view_file", "grep_search", "find_by_name", "list_dir"]) assert.equal(check(JSON.stringify({ toolCall: { name } })), "allow");
  assert.equal(check('{"toolCall":{"name":"run_command"}}', "0"), "allow");
});
test("agy read-only setup must match shipped profile, guard and all-tool hook before dispatch", (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-readonly-")); t.after(() => rmSync(root, { recursive: true, force: true }));
  const def = { readArgs: ["--agent", "baan-readonly", "--print"] };
  assert.throws(() => assertAgyReadonly(def, root), /missing or outdated/);
  for (const file of ["agents/baan-readonly/agent.md", "baan-readonly-guard.js"]) {
    const dest = path.join(root, file); mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(new URL(`../setup/agy/${file}`, import.meta.url)));
  }
  const hooks = { "baan-readonly-guard": { PreToolUse: [{ matcher: ".*", hooks: [{ type: "command", command: `node "${path.join(root, "baan-readonly-guard.js").replaceAll("\\", "/")}"` }] }] } };
  writeFileSync(path.join(root, "hooks.json"), JSON.stringify(hooks));
  assert.doesNotThrow(() => assertAgyReadonly(def, root));
  hooks["baan-readonly-guard"].PreToolUse[0].matcher = "run_command";
  writeFileSync(path.join(root, "hooks.json"), JSON.stringify(hooks));
  assert.throws(() => assertAgyReadonly(def, root), /missing or outdated/);
});
