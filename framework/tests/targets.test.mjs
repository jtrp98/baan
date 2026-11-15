import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { cli, parse } from "../src/cli.mjs";
import { discoverGitRepos, listTargets, registerTarget, removeTarget, scanTargets } from "../src/targets.mjs";
import { loadWorkspace } from "../src/config.mjs";

function makeTempWorkspace(config) {
  const root = mkdtempSync(path.join(tmpdir(), "baan-targets-"));
  const cfgPath = path.join(root, "baan.config.json");
  if (config) writeFileSync(cfgPath, JSON.stringify(config, null, 2), "utf8");
  return { root, cfgPath };
}

test("discoverGitRepos: พบ git repos ทั้งระดับบนและภายใต้โฟลเดอร์กลุ่ม พร้อมหยุดลงลึกใน repo", (t) => {
  const { root } = makeTempWorkspace(null);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const targetDir = path.join(root, "target");
  mkdirSync(path.join(targetDir, "web-app", ".git"), { recursive: true });
  mkdirSync(path.join(targetDir, "web-app", "subpackage", ".git"), { recursive: true });
  mkdirSync(path.join(targetDir, "microservices", "svc-a", ".git"), { recursive: true });
  mkdirSync(path.join(targetDir, "microservices", "svc-b"), { recursive: true });
  writeFileSync(path.join(targetDir, "microservices", "svc-b", ".git"), "gitdir: ../.git/worktrees/svc-b\n", "utf8");
  mkdirSync(path.join(targetDir, "ref", "plain-docs"), { recursive: true });
  mkdirSync(path.join(targetDir, "node_modules", "ignored-pkg", ".git"), { recursive: true });

  const repos = discoverGitRepos(targetDir);
  assert.deepEqual(
    repos.map((r) => r.name),
    ["svc-a", "svc-b", "web-app"],
  );
  assert.ok(!repos.some((r) => r.name === "subpackage"), "ต้องหยุดลงลึกเมื่อเจอ .git แล้ว");
  assert.ok(!repos.some((r) => r.name === "plain-docs"), "โฟลเดอร์ไม่มี .git ต้องไม่ถูกนับ");
  assert.ok(!repos.some((r) => r.name === "ignored-pkg"), "ต้องข้าม node_modules");
});

test("scanTargets: คง alias เดิม ซ่อม path ที่หาย และจัดการ --prune กับ --dry-run ได้ถูกต้อง", (t) => {
  const { root, cfgPath } = makeTempWorkspace(null);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const targetDir = path.join(root, "target");
  mkdirSync(path.join(targetDir, "sb-web-school-robot", ".git"), { recursive: true });
  mkdirSync(path.join(targetDir, "microservices", "sb-api-gateway", ".git"), { recursive: true });
  mkdirSync(path.join(targetDir, "sb-web-helper", ".git"), { recursive: true });

  const initialCfg = {
    main_root: "C:/src",
    knowledge_roots: [
      {
        name: "schoolbright-knowledge",
        path: `${root.replace(/\\/g, "/")}/knowledge`,
        layout: "project",
        memory_root: `${root.replace(/\\/g, "/")}/memory`,
        targets: [
          { name: "school-bot", path: `${targetDir.replace(/\\/g, "/")}/sb-web-school-robot` },
          { name: "sb-api-gateway", path: `${root.replace(/\\/g, "/")}/old-location/sb-api-gateway` },
          { name: "sb-tech-upgrade-academic", path: `${targetDir.replace(/\\/g, "/")}/sb-tech-upgrade-academic` },
        ],
      },
    ],
    defaults: { agent: "claude", timeout_sec: 1800 },
  };
  writeFileSync(cfgPath, JSON.stringify(initialCfg, null, 2), "utf8");

  // 1. dry-run ต้องไม่แก้ไฟล์
  const dry = scanTargets(cfgPath, { dryRun: true });
  assert.equal(dry.dryRun, true);
  assert.deepEqual(dry.kept.map((x) => x.name), ["school-bot"]);
  assert.equal(dry.repaired.length, 1);
  assert.equal(dry.repaired[0].name, "sb-api-gateway");
  assert.deepEqual(dry.added.map((x) => x.name), ["sb-web-helper"]);
  assert.deepEqual(dry.missing.map((x) => x.name), ["sb-tech-upgrade-academic"]);
  assert.equal(dry.pruned.length, 0);
  assert.deepEqual(JSON.parse(readFileSync(cfgPath, "utf8")), initialCfg, "dry-run ห้ามแก้ baan.config.json");

  // 2. scan จริงโดยไม่ใส่ --prune ต้องคงรายการ missing ไว้และไม่ซ้ำกับ alias
  const res = scanTargets(cfgPath);
  assert.equal(res.totalTargets, 4);
  const saved = JSON.parse(readFileSync(cfgPath, "utf8"));
  assert.equal(saved.main_root, "C:/src");
  assert.deepEqual(saved.defaults, initialCfg.defaults);
  const names = saved.knowledge_roots[0].targets.map((x) => x.name);
  assert.deepEqual(names, ["school-bot", "sb-api-gateway", "sb-tech-upgrade-academic", "sb-web-helper"]);
  assert.equal(
    saved.knowledge_roots[0].targets.find((x) => x.name === "sb-api-gateway").path,
    `${targetDir.replace(/\\/g, "/")}/microservices/sb-api-gateway`,
  );

  // 3. scan พร้อม --prune ต้องลบ target ที่ไม่มีจริงออก
  const pruned = scanTargets(cfgPath, { prune: true });
  assert.deepEqual(pruned.pruned.map((x) => x.name), ["sb-tech-upgrade-academic"]);
  assert.equal(pruned.missing.length, 0);
  assert.equal(pruned.totalTargets, 3);
});

test("scanTargets: รายงาน conflict เมื่อเจอชื่อซ้ำแต่ path เดิมยังมีอยู่จริง", (t) => {
  const { root, cfgPath } = makeTempWorkspace(null);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const repoA = path.join(root, "target", "group-a", "shared-name");
  const repoB = path.join(root, "target", "group-b", "shared-name");
  mkdirSync(path.join(repoA, ".git"), { recursive: true });
  mkdirSync(path.join(repoB, ".git"), { recursive: true });

  writeFileSync(cfgPath, JSON.stringify({
    knowledge_roots: [
      { name: "kr", path: root, targets: [{ name: "shared-name", path: repoA.replace(/\\/g, "/") }] },
    ],
  }), "utf8");

  const res = scanTargets(cfgPath);
  assert.equal(res.kept.length, 1);
  assert.equal(res.conflicts.length, 1);
  assert.equal(res.conflicts[0].name, "shared-name");
});

test("registerTarget และ removeTarget: เพิ่ม อัปเดต ตรวจสอบ multi-root และลบ target ได้ถูกต้อง", (t) => {
  const { root, cfgPath } = makeTempWorkspace(null);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const repo1 = path.join(root, "repo-one");
  const repo2 = path.join(root, "repo-two");
  mkdirSync(path.join(repo1, ".git"), { recursive: true });
  mkdirSync(repo2, { recursive: true });

  writeFileSync(cfgPath, JSON.stringify({
    knowledge_roots: [
      { name: "kr1", path: root, targets: [] },
      { name: "kr2", path: root, targets: [] },
    ],
  }), "utf8");

  assert.throws(() => registerTarget(cfgPath, { path: repo1 }), /--root/);

  const added = registerTarget(cfgPath, { path: repo1, name: "custom-one", root: "kr1" });
  assert.equal(added.action, "added");
  assert.equal(added.target.name, "custom-one");
  assert.equal(added.git, true);

  const keptByPath = registerTarget(cfgPath, { path: repo1, root: "kr1" });
  assert.equal(keptByPath.action, "kept");
  assert.equal(keptByPath.target.name, "custom-one");

  const updated = registerTarget(cfgPath, { path: repo2, name: "custom-one", root: "kr1" });
  assert.equal(updated.action, "updated");
  assert.equal(updated.git, false);

  const ws = loadWorkspace(cfgPath);
  const listed = listTargets(ws);
  assert.equal(listed.total, 1);
  assert.equal(listed.valid, 1);
  assert.equal(listed.missing, 0);

  const removed = removeTarget(cfgPath, { name: "custom-one", root: "kr1" });
  assert.equal(removed.removed.name, "custom-one");
  assert.throws(() => removeTarget(cfgPath, { name: "custom-one", root: "kr1" }), /ไม่พบ target/);
});

test("cli และ parse รองรับคำสั่ง baan target [list|scan|add|remove]", async (t) => {
  const { root, cfgPath } = makeTempWorkspace(null);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const repo = path.join(root, "target", "demo-service");
  mkdirSync(path.join(repo, ".git"), { recursive: true });
  writeFileSync(cfgPath, JSON.stringify({
    knowledge_roots: [{ name: "kr", path: root, targets: [] }],
  }), "utf8");

  assert.equal(parse(["target", "--list"]).subject, "list");
  assert.equal(parse(["target", "--scan", "--dry-run"]).subject, "scan");
  const parsedAdd = parse(["target", "add", repo, "--name", "demo"]);
  assert.equal(parsedAdd.command, "target");
  assert.equal(parsedAdd.subject, "add");
  assert.equal(parsedAdd.arg, repo);
  assert.equal(parsedAdd.name, "demo");

  const scanRes = await cli(["target", "scan", "--workspace", root]);
  assert.equal(scanRes.added.length, 1);
  assert.equal(scanRes.added[0].name, "demo-service");

  const listRes = await cli(["target", "--workspace", root]);
  assert.equal(listRes.total, 1);
  assert.equal(listRes.valid, 1);

  const addRes = await cli(["target", "add", repo, "--name", "demo-alias", "--workspace", root]);
  assert.equal(addRes.action, "added");

  const rmRes = await cli(["target", "remove", "demo-alias", "--workspace", root]);
  assert.equal(rmRes.removed.name, "demo-alias");

  await assert.rejects(() => cli(["target", "unknown", "--workspace", root]), /คำสั่งย่อยของ target ไม่ถูกต้อง/);
});
