// Regression: config ของ workspace อยู่นอก package (กัน update version ทับ config)
// แผนปัจจุบัน: <ราก workspace>\baan.config.json · แผนเก่า mycelium\mycelium.json ยังรองรับ
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { REPORTS_DIR, findWorkspaceConfig, loadWorkspace, reportsDirOf, resolveWorkspaceConfig, workspaceRootOf } from "../src/config.mjs";

const realConfig = { main_root: "C:/src", knowledge_roots: [{ name: "k", path: "C:/k", targets: [] }], defaults: { agent: "codex" } };

test("ค้นพบ baan.config.json ที่ราก workspace จากไดเรกทอรีลึกๆ", () => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    writeFileSync(path.join(root, "baan.config.json"), JSON.stringify(realConfig), "utf8");
    const deep = path.join(root, "target", "some-repo", "src");
    mkdirSync(deep, { recursive: true });
    assert.equal(findWorkspaceConfig(deep), path.join(root, "baan.config.json"));
    assert.equal(findWorkspaceConfig(root), path.join(root, "baan.config.json"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("ตัวใกล้สุดชนะ (workspace ซ้อนกันได้)", () => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    writeFileSync(path.join(root, "baan.config.json"), JSON.stringify(realConfig), "utf8");
    const nested = path.join(root, "sub-workspace");
    mkdirSync(nested);
    writeFileSync(path.join(nested, "baan.config.json"), JSON.stringify(realConfig), "utf8");
    assert.equal(findWorkspaceConfig(path.join(nested, "repo")), path.join(nested, "baan.config.json"));
    assert.equal(findWorkspaceConfig(root), path.join(root, "baan.config.json"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("แผนเก่า mycelium\\mycelium.json ยังถูกพบ และชื่อใหม่กว่าชนะเสมอ", () => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const legacyDir = path.join(root, "mycelium");
    mkdirSync(legacyDir);
    writeFileSync(path.join(legacyDir, "mycelium.json"), JSON.stringify(realConfig), "utf8");
    assert.equal(findWorkspaceConfig(path.join(root, "a", "b")), path.join(legacyDir, "mycelium.json"));

    // ชื่อเก่าแบบแยกไฟล์ (mycelium.config.json) ชนะแผนเก่าสุด
    writeFileSync(path.join(root, "mycelium.config.json"), JSON.stringify(realConfig), "utf8");
    assert.equal(findWorkspaceConfig(path.join(root, "a", "b")), path.join(root, "mycelium.config.json"));

    // ชื่อปัจจุบัน (baan.config.json) ชนะทุกชื่อเก่า
    writeFileSync(path.join(root, "baan.config.json"), JSON.stringify(realConfig), "utf8");
    assert.equal(findWorkspaceConfig(path.join(root, "a", "b")), path.join(root, "baan.config.json"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("ไม่เจออะไรเลย = null (ไม่ throw)", () => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-empty-"));
  try {
    assert.equal(findWorkspaceConfig(root), null);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("resolveWorkspaceConfig: --config และ env ชนะ discovery และชี้ไฟล์ที่ไม่มีต้อง error", () => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const configFile = path.join(root, "any-name.json");
    writeFileSync(configFile, JSON.stringify(realConfig), "utf8");

    const elsewhere = mkdtempSync(path.join(tmpdir(), "baan-elsewhere-"));
    try {
      assert.equal(resolveWorkspaceConfig(configFile, elsewhere), path.resolve(configFile), "--config ชนะ discovery");
      assert.throws(() => resolveWorkspaceConfig(path.join(root, "nope.json"), elsewhere), /--config/);

      process.env.BAAN_CONFIG = configFile;
      try {
        assert.equal(resolveWorkspaceConfig(null, elsewhere), path.resolve(configFile), "env ชนะ discovery");
        process.env.BAAN_CONFIG = path.join(root, "nope.json");
        assert.throws(() => resolveWorkspaceConfig(null, elsewhere), /BAAN_CONFIG/);
      } finally { delete process.env.BAAN_CONFIG; }

      assert.equal(resolveWorkspaceConfig(null, elsewhere), null, "ไม่มี --config/env และไม่เจอ = null ไม่ใช่ error");
    } finally { rmSync(elsewhere, { recursive: true, force: true }); }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("loadWorkspace อ่านจากไฟล์ที่ระบุได้ครบ และไม่มี config = default ในโค้ด", () => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const configFile = path.join(root, "ws.json");
    writeFileSync(configFile, JSON.stringify({
      main_root: "C:/src",
      knowledge_roots: [{ name: "k", path: "C:/k", targets: [{ name: "t1", path: "C:/t1" }] }],
      defaults: { agent: "claude", timeout_sec: 99 },
    }), "utf8");
    const ws = loadWorkspace(configFile);
    assert.equal(ws.source, path.resolve(configFile));
    assert.equal(ws.defaults.agent, "claude");
    assert.equal(ws.defaults.timeout_sec, 99);
    assert.equal(ws.defaults.planner_tier, "t2", "field ที่ไม่ระบุใช้ default");
    assert.deepEqual(ws.knowledge_roots[0].targets[0], { name: "t1", path: "C:/t1" });

    const fallback = loadWorkspace(null);
    assert.equal(fallback.source, null);
    assert.deepEqual(fallback.knowledge_roots, []);
    assert.equal(fallback.defaults.agent, "codex");

    writeFileSync(configFile, "{ broken", "utf8");
    assert.throws(() => loadWorkspace(configFile), /อ่าน config ไม่ได้/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// Regression (2026-10-28): run dir อยู่ใน package (นอก workspace) — agy T3 โหมดเขียนอ่านโค้ดต้นแบบของ arch ไม่ได้ ล้มที่ 29 วิ
test("run dir อยู่ใต้ราก workspace (reports/baan) ที่ agy มีสิทธิ์อ่านอยู่แล้ว · ไม่เจอ workspace = reports/ ของ package", () => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    writeFileSync(path.join(root, "baan.config.json"), JSON.stringify(realConfig), "utf8");
    const target = path.join(root, "target", "repo");
    mkdirSync(target, { recursive: true });
    const dir = reportsDirOf(workspaceRootOf(null, target));
    assert.equal(dir, path.join(root, "reports", "baan"));
    assert.ok(!path.relative(root, dir).startsWith(".."), "ต้องอยู่ในขอบเขต workspace");
  } finally { rmSync(root, { recursive: true, force: true }); }
  assert.equal(reportsDirOf(""), REPORTS_DIR);
});
