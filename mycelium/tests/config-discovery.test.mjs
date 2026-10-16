// Regression: config ของ workspace อยู่นอก package (กัน update version ทับ config)
// หาโดยเดินขึ้นจากจุดที่เรียกจนเจอ <dir>/mycelium/mycelium.json
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { findWorkspaceConfig, loadWorkspace, resolveWorkspaceConfig } from "../src/config.mjs";

test("findWorkspaceConfig เดินขึ้นจากไดเรกทอรีลึกๆ จนเจอ", () => {
  const root = mkdtempSync(path.join(tmpdir(), "mycelium-test-"));
  try {
    const cfgDir = path.join(root, "mycelium");
    mkdirSync(cfgDir);
    writeFileSync(path.join(cfgDir, "mycelium.json"), "{}", "utf8");
    const deep = path.join(root, "target", "some-repo", "src");
    mkdirSync(deep, { recursive: true });
    assert.equal(findWorkspaceConfig(deep), path.join(cfgDir, "mycelium.json"));
    assert.equal(findWorkspaceConfig(root), path.join(cfgDir, "mycelium.json"), "เรียกจากตำแหน่งราก workspace ก็ต้องเจอ");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("findWorkspaceConfig ไม่เจอ = null (เดินถึงรากของ drive)", () => {
  const root = mkdtempSync(path.join(tmpdir(), "mycelium-empty-"));
  try {
    assert.equal(findWorkspaceConfig(root), null);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("resolveWorkspaceConfig: --config และ env ชนะ discovery และชี้ไฟล์ที่ไม่มีต้อง error", () => {
  const root = mkdtempSync(path.join(tmpdir(), "mycelium-test-"));
  try {
    const cfgDir = path.join(root, "mycelium");
    mkdirSync(cfgDir);
    const configFile = path.join(cfgDir, "mycelium.json");
    writeFileSync(configFile, "{}", "utf8");

    const elsewhere = mkdtempSync(path.join(tmpdir(), "mycelium-elsewhere-"));
    try {
      assert.equal(resolveWorkspaceConfig(configFile, elsewhere), path.resolve(configFile), "--config ชนะ discovery");
      assert.throws(() => resolveWorkspaceConfig(path.join(root, "nope.json"), elsewhere), /--config/);

      process.env.MYCELIUM_CONFIG = configFile;
      try {
        assert.equal(resolveWorkspaceConfig(null, elsewhere), path.resolve(configFile), "env ชนะ discovery");
        process.env.MYCELIUM_CONFIG = path.join(root, "nope.json");
        assert.throws(() => resolveWorkspaceConfig(null, elsewhere), /MYCELIUM_CONFIG/);
      } finally { delete process.env.MYCELIUM_CONFIG; }

      assert.equal(resolveWorkspaceConfig(null, elsewhere), null, "ไม่มี --config/env และไม่เจอ = null ไม่ใช่ error");
    } finally { rmSync(elsewhere, { recursive: true, force: true }); }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("loadWorkspace อ่านจากไฟล์ที่ระบุได้ครบ และไม่มี config = default ในโค้ด", () => {
  const root = mkdtempSync(path.join(tmpdir(), "mycelium-test-"));
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
