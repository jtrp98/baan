import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { findLocalConfig, loadLocalConfig } from "../src/config.mjs";
import { syncAllWorkspaces } from "../src/sync.mjs";
import { parse } from "../src/cli.mjs";

const TEAM_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, "$1")), "..");

test("parse CLI: รองรับแฟล็ก --all กับ sync", () => {
  const o = parse(["sync", "--all", "--dry-run"]);
  assert.equal(o.command, "sync");
  assert.equal(o.sync, true);
  assert.equal(o.all, true);
  assert.equal(o["dry-run"], true);
});

test("loadLocalConfig: คืน workspaces ว่างเมื่อไม่มีไฟล์", () => {
  const emptyDir = mkdtempSync(path.join(tmpdir(), "baan-local-empty-"));
  try {
    const res = loadLocalConfig(emptyDir);
    assert.equal(res.source, null);
    assert.equal(res.auto_update, false);
    assert.deepEqual(res.workspaces, []);
  } finally {
    rmSync(emptyDir, { recursive: true, force: true });
  }
});

test("loadLocalConfig: อ่านและ normalize ทั้ง workspaces และ companies รูปแบบ string และ object", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-local-cfg-"));
  try {
    const file = path.join(dir, "local.json");
    writeFileSync(file, JSON.stringify({
      companies: [
        "C:/src/company-a",
        { name: "b-corp", path: "C:/src/company-b" }
      ]
    }), "utf8");

    const res = loadLocalConfig(dir);
    assert.equal(res.source, file);
    assert.equal(res.auto_update, true);
    assert.equal(res.workspaces.length, 2);
    assert.equal(res.workspaces[0].name, "company-a");
    assert.equal(res.workspaces[0].path, path.resolve("C:/src/company-a"));
    assert.equal(res.workspaces[1].name, "b-corp");
    assert.equal(res.workspaces[1].path, path.resolve("C:/src/company-b"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("loadLocalConfig: เคารพการตั้งค่า auto_update: false", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-local-noauto-"));
  try {
    const file = path.join(dir, "local.json");
    writeFileSync(file, JSON.stringify({
      auto_update: false,
      workspaces: ["C:/src/test-ws"]
    }), "utf8");

    const res = loadLocalConfig(dir);
    assert.equal(res.auto_update, false);
    assert.equal(res.workspaces.length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("loadLocalConfig: throw เมื่อไฟล์ JSON เสีย", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-local-bad-"));
  try {
    const file = path.join(dir, "local.json");
    writeFileSync(file, "{ invalid json", "utf8");
    assert.throws(() => loadLocalConfig(dir), /อ่าน local\.json ไม่ได้/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("syncAllWorkspaces: วนลูปอัปเดต stubs ให้ทุก workspace ที่ลงทะเบียน และข้าม path ที่เสียอย่างปลอดภัย", () => {
  const base = mkdtempSync(path.join(tmpdir(), "baan-sync-all-"));
  const ws1 = path.join(base, "ws1");
  const ws2 = path.join(base, "ws2");
  mkdirSync(ws1, { recursive: true });
  mkdirSync(ws2, { recursive: true });

  // ws1 has valid config
  writeFileSync(path.join(ws1, "baan.config.json"), JSON.stringify({
    knowledge_roots: []
  }), "utf8");

  // ws2 has valid config
  writeFileSync(path.join(ws2, "baan.config.json"), JSON.stringify({
    knowledge_roots: []
  }), "utf8");

  const localConfig = {
    workspaces: [
      { name: "ws-one", path: ws1 },
      { name: "ws-two", path: ws2 },
      { name: "ws-missing", path: path.join(base, "non-existent") }
    ]
  };

  const logs = [];
  const res = syncAllWorkspaces(localConfig, TEAM_DIR, { noSelfUpdate: true }, (m) => logs.push(m));

  try {
    assert.equal(res.ok, false, "ต้องแจ้งไม่ ok เพราะมี 1 path ที่ไม่มีจริง");
    assert.equal(res.workspaces.length, 3);

    // ws1 should have stubs updated
    assert.equal(res.workspaces[0].ok, true);
    assert.ok(existsSync(path.join(ws1, "CLAUDE.md")));
    assert.ok(existsSync(path.join(ws1, "AGENTS.md")));
    assert.ok(existsSync(path.join(ws1, ".claude", "agents", "spec.md")));

    // ws2 should have stubs updated
    assert.equal(res.workspaces[1].ok, true);
    assert.ok(existsSync(path.join(ws2, "CLAUDE.md")));
    assert.ok(existsSync(path.join(ws2, "AGENTS.md")));

    // missing ws should be marked error safely
    assert.equal(res.workspaces[2].ok, false);
    assert.equal(res.workspaces[2].error, "directory_not_found");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});
