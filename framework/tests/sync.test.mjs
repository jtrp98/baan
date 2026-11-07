import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { syncKnowledgeRoot, updateSelfFramework, syncWorkspace } from "../src/sync.mjs";
import { parse } from "../src/cli.mjs";

const TEAM_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function makeGitRepo(prefix = "baan-sync-") {
  const dir = mkdtempSync(path.join(tmpdir(), prefix));
  const git = (args) => spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" });
  git(["init", "-q", "-b", "main"]);
  git(["config", "user.email", "test@baan.local"]);
  git(["config", "user.name", "baan test"]);
  return { dir, git };
}

test("parse CLI: รองรับคำสั่ง sync และ flags ที่เกี่ยวข้อง", () => {
  const o1 = parse(["sync"]);
  assert.equal(o1.command, "sync");
  assert.equal(o1.sync, true);

  const o2 = parse(["--sync", "--pull-only", "--dry-run", "--no-self-update"]);
  assert.equal(o2.sync, true);
  assert.equal(o2["pull-only"], true);
  assert.equal(o2["dry-run"], true);
  assert.equal(o2["no-self-update"], true);

  assert.throws(() => parse(["--sync", "--goal", "x"]));
});

test("syncKnowledgeRoot: ไม่ใช่ git repo คืนค่า repo: false โดยไม่พัง", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-sync-notgit-"));
  try {
    const res = syncKnowledgeRoot({ name: "test", path: dir });
    assert.equal(res.repo, false);
    assert.equal(res.ok, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("syncKnowledgeRoot: auto-commit ไฟล์ที่แก้ค้างไว้ก่อน และ push เมื่อมี remote", () => {
  const bare = mkdtempSync(path.join(tmpdir(), "baan-sync-bare-"));
  const local = makeGitRepo("baan-sync-local-");

  try {
    spawnSync("git", ["init", "--bare", "-q", "-b", "main", bare], { encoding: "utf8" });
    local.git(["remote", "add", "origin", bare]);

    // Initial commit and push
    writeFileSync(path.join(local.dir, "README.md"), "# Initial\n");
    local.git(["add", "."]);
    local.git(["commit", "-m", "initial"]);
    local.git(["push", "-u", "origin", "main"]);

    // User makes new file (e.g. UX/UI designer adds screen)
    mkdirSync(path.join(local.dir, "school-bot"), { recursive: true });
    writeFileSync(path.join(local.dir, "school-bot", "screen-01.md"), "# Screen 01\n");

    const logs = [];
    const res = syncKnowledgeRoot({ name: "school-bot", path: local.dir }, {}, (m) => logs.push(m));

    assert.equal(res.ok, true);
    assert.equal(res.commits.length, 1);
    assert.match(res.commits[0], /school-bot: add screen-01\.md/);
    assert.equal(res.pulled, true);
    assert.equal(res.pushed, true);

    // Verify remote received the commit
    const logCheck = spawnSync("git", ["-C", bare, "log", "--oneline"], { encoding: "utf8" });
    assert.match(logCheck.stdout, /screen-01\.md/);
  } finally {
    rmSync(bare, { recursive: true, force: true });
    rmSync(local.dir, { recursive: true, force: true });
  }
});

test("syncKnowledgeRoot dry-run: ตรวจนับไฟล์ค้างแต่ไม่ commit และไม่ pull/push", () => {
  const local = makeGitRepo("baan-sync-dry-");
  try {
    writeFileSync(path.join(local.dir, "a.md"), "hello");
    const res = syncKnowledgeRoot({ name: "kr", path: local.dir }, { dryRun: true });
    assert.equal(res.dirty, 1);
    assert.equal(res.commits.length, 0);
    assert.equal(res.pulled, false);
    assert.equal(res.pushed, false);
  } finally {
    rmSync(local.dir, { recursive: true, force: true });
  }
});

test("syncKnowledgeRoot: localOnly commit ในเครื่องได้โดยไม่พยายาม push/pull และไม่เตือนเรื่อง remote", () => {
  const local = makeGitRepo("baan-sync-localonly-");
  try {
    writeFileSync(path.join(local.dir, "evidence.md"), "local run log");
    const logs = [];
    const res = syncKnowledgeRoot({ name: "my-memory", path: local.dir }, { localOnly: true }, (m) => logs.push(m));
    assert.equal(res.ok, true);
    assert.equal(res.localOnly, true);
    assert.equal(res.commits.length, 1);
    assert.equal(res.pulled, false);
    assert.equal(res.pushed, false);
    assert.equal(logs.some((l) => l.includes("ไม่มี remote")), false, "ต้องไม่เตือนเรื่องไม่มี remote");
  } finally {
    rmSync(local.dir, { recursive: true, force: true });
  }
});

test("updateSelfFramework: ทำงานปลอดภัยกับไดเรกทอรีที่ไม่ใช่ git", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-self-notgit-"));
  try {
    const res = updateSelfFramework(dir);
    assert.equal(res.ok, true);
    assert.equal(res.updated, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("syncWorkspace: ซิงค์ knowledge roots, รีเฟรช stubs และ index ครบถ้วน", () => {
  const wsDir = mkdtempSync(path.join(tmpdir(), "baan-ws-sync-"));
  const kr = makeGitRepo("baan-ws-kr-");
  try {
    writeFileSync(path.join(kr.dir, "school-bot.md"), "# test");
    kr.git(["add", "."]);
    kr.git(["commit", "-m", "init"]);

    const ws = {
      source: path.join(wsDir, "baan.config.json"),
      defaults: {},
      knowledge_roots: [{
        name: "test-kr",
        path: kr.dir,
        layout: "module",
        targets: [],
      }],
    };

    const res = syncWorkspace(ws, wsDir, TEAM_DIR, { noSelfUpdate: true });
    assert.equal(res.ok, true);
    assert.ok(res.stubs);
    assert.ok(existsSync(path.join(wsDir, "CLAUDE.md")), "CLAUDE.md ต้องถูกสร้าง/รีเฟรช");
    assert.ok(existsSync(path.join(wsDir, "AGENTS.md")), "AGENTS.md ต้องถูกสร้าง/รีเฟรช");
    assert.ok(existsSync(path.join(wsDir, ".claude", "agents", "ui.md")), "agent UI ต้องมี");
  } finally {
    rmSync(wsDir, { recursive: true, force: true });
    rmSync(kr.dir, { recursive: true, force: true });
  }
});
