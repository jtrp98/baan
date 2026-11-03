// Regression: config ของ workspace อยู่นอก package (กัน update version ทับ config)
// อยู่ที่ <ราก workspace>\baan.config.json
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { REPORTS_DIR, findWorkspaceConfig, loadWorkspace, memoryRootIssues, memoryRootOf, reportsDirOf, resolveWorkspaceConfig, workspaceRootOf } from "../src/config.mjs";

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

    assert.equal(ws.defaults.test_level, "normal", "ไม่ตั้ง = ตรวจ happy flow ระหว่างพัฒนา");

    writeFileSync(configFile, JSON.stringify({ defaults: { test_level: "full" } }), "utf8");
    assert.equal(loadWorkspace(configFile).defaults.test_level, "full");
    writeFileSync(configFile, JSON.stringify({ defaults: { test_level: "quick" } }), "utf8");
    assert.throws(() => loadWorkspace(configFile), /defaults\.test_level.*normal\/full/);

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

// memory_root แยกความจำของทีม (ใบงาน/ผลตรวจ/หลักฐาน) ออกจาก knowledge ที่คนอื่นใช้ร่วม — ไม่ตั้ง = แบบเดิม
test("memoryRootOf: ไม่ตั้ง/ไม่ใช่ข้อความ = ว่าง (พฤติกรรมเดิม) · ตั้งแล้วคืน path", () => {
  assert.equal(memoryRootOf({ name: "k", path: "C:/k" }), "");
  assert.equal(memoryRootOf({ name: "k", path: "C:/k", memory_root: 42 }), "");
  assert.equal(memoryRootOf({ name: "k", path: "C:/k", memory_root: " C:/ws/memory " }), "C:/ws/memory");
  assert.equal(memoryRootOf(undefined), "");
});

test("memoryRootIssues: เตือนเมื่อไม่มีจริง/ไม่ใช่ git/อยู่ใน knowledge/อยู่นอก workspace", () => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const knowledge = path.join(root, "knowledge");
    const memory = path.join(root, "memory");
    mkdirSync(knowledge, { recursive: true });
    const kr = { name: "k", path: knowledge, memory_root: memory };

    assert.deepEqual(memoryRootIssues({ name: "k", path: knowledge }, root), [], "ไม่ตั้ง = ไม่มีอะไรให้เตือน");
    assert.match(memoryRootIssues(kr, root).join(), /ไม่มีจริง/);

    mkdirSync(memory);
    assert.match(memoryRootIssues(kr, root).join(), /ไม่ใช่ git repo/);

    mkdirSync(path.join(memory, ".git"));
    assert.deepEqual(memoryRootIssues(kr, root), [], "อยู่ใต้ workspace + เป็น git repo + แยกจาก knowledge = ใช้ได้");

    const nested = path.join(knowledge, "_memory");
    mkdirSync(path.join(nested, ".git"), { recursive: true });
    assert.match(memoryRootIssues({ ...kr, memory_root: nested }, root).join(), /ภายใน knowledge root/);

    const other = mkdtempSync(path.join(tmpdir(), "baan-outside-"));
    try {
      mkdirSync(path.join(other, ".git"));
      assert.match(memoryRootIssues({ ...kr, memory_root: other }, root).join(), /นอกราก workspace/);
    } finally { rmSync(other, { recursive: true, force: true }); }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
