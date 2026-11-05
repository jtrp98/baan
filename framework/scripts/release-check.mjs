import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const source = fileURLToPath(new URL("..", import.meta.url));
mkdirSync(path.join(source, ".release"), { recursive: true });
const temp = mkdtempSync(path.join(source, ".release", "validation-"));
const npmCli = process.env.npm_execpath;
assert.ok(npmCli && existsSync(npmCli), "run with npm run validate:release");
const execute = (exe, args, cwd = temp, env = process.env) => execFileSync(exe, args, { cwd, env, encoding: "utf8", windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
const npm = (args, cwd = temp) => execute(process.execPath, [npmCli, ...args], cwd);
const [pack] = JSON.parse(npm(["pack", "--json", "--ignore-scripts", "--pack-destination", temp], source));
assert.ok(pack.files.length > 0);
for (const { path: file } of pack.files) {
  assert.ok(!/(?:^|\/)(?:reports|planning|tests|docs|\.baan|node_modules)(?:\/|$)/i.test(file), `unwanted package entry: ${file}`);
  assert.ok(!/(?:^|\/)(?:\.env(?:\..*)?|AGENTS\.md|CLAUDE\.md|baan\.config\.json|demo-notes\.md)$/.test(file), `local data: ${file}`);
  assert.ok(!/(?:^|\/)v[12](?:\/|$)|baan-role\.mjs$/.test(file), `obsolete entry: ${file}`);
  if (/\.(?:mjs|js|json|md|txt)$/.test(file)) {
    const contents = readFileSync(path.join(source, file), "utf8");
    assert.ok(!/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{40,}/.test(contents), `possible secret: ${file}`);
  }
}
writeFileSync(path.join(temp, "package.json"), '{"private":true,"type":"module"}\n');
const tarball = path.join(temp, pack.filename);
npm(["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false", tarball]);
const installed = path.join(temp, "node_modules", "baan");
for (const file of readdirSync(path.join(installed, "src")).filter((f) => f.endsWith(".mjs"))) await import(pathToFileURL(path.join(installed, "src", file)).href);
const bin = path.join(installed, "bin", "baan.mjs");
const meta = JSON.parse(readFileSync(path.join(installed, "package.json"), "utf8"));
assert.deepEqual(Object.keys(meta.bin), ["baan"]);
assert.equal(execute(process.execPath, [bin, "--version"]).trim(), meta.version);
assert.match(execute(process.execPath, [bin, "--help"]), /BAAN/);
const shim = path.join(temp, "node_modules", ".bin", process.platform === "win32" ? "baan.cmd" : "baan");
assert.ok(existsSync(shim), "installed CLI shim missing");
const shimVersion = npm(["exec", "--offline", "--", "baan", "--version"]);
assert.equal(shimVersion.trim(), meta.version);
const workspace = path.join(temp, "workspace");
execute(process.execPath, [bin, "--init", "--workspace", workspace]);
const stub = readFileSync(path.join(workspace, "AGENTS.md"), "utf8");
assert.ok(stub.includes(path.join(installed, "BAAN.md")));
for (const role of ["spec", "survey", "ui", "review"]) assert.ok(existsSync(path.join(installed, "roles", `${role}.md`)));

// This synthetic provider and its approvals exist only inside disposable release fixtures.
const provider = path.join(temp, "provider.cjs");
writeFileSync(provider, `const fs=require('fs'),path=require('path');let input='';process.stdin.on('data',d=>input+=d);process.stdin.on('end',()=>{
const packet=JSON.parse(input.split('INPUT (data):\\n')[1].split('\\n\\nReturn JSON')[0]);
const role=input.match(/\\[baan: (\\w+)\\]/)[1];let output;
if(role==='planner') output={packages:packet.packages.map(p=>({id:p.id,depends_on:p.depends_on,subpackages:[]})),questions:[],decisions:[]};
else if(role==='worker'){for(const f of packet.owns)fs.writeFileSync(path.resolve(f),'export const value = 2;\\n');output={state:'DONE',summary:'fixture fixed',acceptance:packet.acceptance.map(a=>({id:a.id,proof:['value test']})),test_changes:[],questions:[],failure_class:''};}
else output={verdict:'PASS',failure_class:'',findings:[],acceptance:packet.acceptance.map(a=>({id:a.id,passed:true,proof:['value test']}))};
process.stdout.write(JSON.stringify(output));});`);
const agentsFile = path.join(temp, "agents-fixture.json");
writeFileSync(agentsFile, JSON.stringify({ agents: { fixture: { command: process.execPath, useShell: false, promptVia: "stdin", modelArgs: ["<MODEL>"], readArgs: [], writeArgs: [], answerFrom: "stdout" } }, tiers: { t2: { fixture: { model: provider }, _fallback: ["fixture"] } } }));
const env = { ...process.env, BAAN_AGENTS_FILE: agentsFile };
delete env.BAAN_CONFIG;
const cli = (args) => {
  try { return JSON.parse(execute(process.execPath, [bin, ...args], workspace, env)); }
  catch (error) { if (error.status !== 1) throw error; return JSON.parse(String(error.stdout)); }
};
function fixture(name, planned) {
  const repo = path.join(temp, name); mkdirSync(repo);
  const git = (...args) => execute("git", ["-C", repo, ...args]);
  git("init", "-q"); git("config", "user.name", "release fixture"); git("config", "user.email", "fixture@invalid"); git("config", "core.autocrlf", "false");
  writeFileSync(path.join(repo, "code.mjs"), "export const value = 1;\n");
  writeFileSync(path.join(repo, "other.mjs"), "export const value = 1;\n");
  writeFileSync(path.join(repo, "value.test.mjs"), "import test from 'node:test';import assert from 'node:assert/strict';import {value} from './code.mjs';test('value test',()=>assert.equal(value,2));\n");
  git("add", "."); git("commit", "-qm", "fixture initial");
  const head = git("rev-parse", "HEAD");
  const packet = (id, file, depends_on = []) => ({ id, title: "artifact validation", goal: "set fixture value to 2", tasks: [id], repo: { path: repo }, owns: [file], read_first: [], depends_on,
    risk: "low", acceptance: [{ id: "AC-1", text: "fixture value is 2", source: "synthetic release fixture" }], commands: { build: `node --check ${file}`, test_targeted: "node --test value.test.mjs", test_full: "node --test value.test.mjs" }, needs_planning: planned, acceptance_approved: false });
  const file = path.join(temp, `${name}.json`);
  writeFileSync(file, JSON.stringify({ packages: planned ? [packet("A", "code.mjs"), packet("B", "other.mjs", ["A"])] : [packet("A", "code.mjs")] }));
  return { repo, git, head, file };
}
for (const planned of [false, true]) {
  const f = fixture(planned ? "planned" : "direct", planned);
  const args = ["run", "--plan", f.file, "--workspace", workspace, "--agent", "fixture", "--timeout", "30"];
  const dry = cli([...args, "--dry-run"]); assert.equal(dry.packages.length, planned ? 2 : 1);
  const waiting = cli(args); assert.equal(waiting.ok, false);
  assert.ok(!readFileSync(path.join(waiting.dir, "ledger.jsonl"), "utf8").includes('"call_start"'));
  for (const p of waiting.packages) cli(["decide", p.id, "--run", waiting.dir, "--approve", "--by", "user", "--decision", "synthetic fixture confirmation", "--source", "release-check fixture only"]);
  const done = cli(["run", "--resume", waiting.dir]);
  assert.equal(done.ok, true, JSON.stringify(done)); assert.equal(done.mode, planned ? "planned" : "direct");
  assert.equal(cli(["status", waiting.dir]).ok, true);
  assert.deepEqual(cli(["inbox", waiting.dir]), []);
  assert.equal(f.git("rev-parse", "HEAD"), f.head);
  assert.ok(done.packages.every((p) => existsSync(p.evidence)));
}
const result = { ok: true, version: meta.version, tarball, files: pack.files.length, installed, checks: ["pack contents", "secret patterns", "offline install", "all source imports", "CLI shim/help/version", "init/design roles", "direct/planned execution", "approval/inbox/status", "real machine gates", "Git preservation"] };
writeFileSync(path.join(temp, "validation.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
