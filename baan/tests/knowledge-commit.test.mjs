// auto commit ของ knowledge repo — ข้อความอังกฤษสั้น "module: verb files" แยก commit ต่อ module
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { classifyChange, commitKnowledgeRoot, parsePorcelain, planCommits } from "../src/knowledge-commit.mjs";

test("parsePorcelain: แกะรูปแบบ -z ครบ และ rename กิน path เดิมหนึ่งช่อง", () => {
  const raw = ["?? school-bot/a.md", "M  school-bot/b.md", "R  school-bot/new.md", "school-bot/old.md", " D school-bot/c.md"].join("\0") + "\0";
  assert.deepEqual(parsePorcelain(raw), [
    { code: "??", file: "school-bot/a.md" },
    { code: "M ", file: "school-bot/b.md" },
    { code: "R ", file: "school-bot/new.md" },
    { code: " D", file: "school-bot/c.md" },
  ]);
});

test("classifyChange: ไฟล์ใหม่=add ลบเท่านั้น=remove ที่เหลือ=update", () => {
  assert.equal(classifyChange("??"), "add");
  assert.equal(classifyChange("A "), "add");
  assert.equal(classifyChange("AM"), "add");
  assert.equal(classifyChange("D "), "remove");
  assert.equal(classifyChange(" D"), "remove");
  assert.equal(classifyChange("M "), "update");
  assert.equal(classifyChange("R "), "update");
});

test("planCommits: ข้อความอังกฤษสั้นต่อ module — verb ตามชนิดของ change และไฟล์เกิน 2 ย่อเป็น +N more", () => {
  // ชื่อไฟล์ในข้อความโชว์แค่ basename เพื่อความสั้น (ตำแหน่งเต็มดูได้จากตัวไฟล์ใน commit)
  const one = planCommits([{ code: "??", file: "school-bot/db/a.sql" }], "kr");
  assert.equal(one[0].message, "school-bot: add a.sql");

  const many = planCommits([
    { code: "??", file: "school-bot/a.md" },
    { code: "??", file: "school-bot/b.md" },
    { code: "??", file: "school-bot/c.md" },
    { code: "??", file: "school-bot/d.md" },
  ], "kr");
  assert.equal(many[0].message, "school-bot: add a.md, b.md +2 more");

  const del = planCommits([{ code: "D ", file: "school-bot/old.md" }], "kr");
  assert.equal(del[0].message, "school-bot: remove old.md");

  const mixed = planCommits([{ code: "??", file: "school-bot/new.md" }, { code: "M ", file: "school-bot/index.md" }], "kr");
  assert.equal(mixed[0].message, "school-bot: update index.md, new.md");

  // ไฟล์ระดับรากของ repo ไม่มี module ของตัวเอง — ใช้ชื่อ knowledge root แทน
  const root = planCommits([{ code: "M ", file: "README.md" }], "schoolbright-knowledge");
  assert.equal(root[0].message, "schoolbright-knowledge: update README.md");

  // module ต่างกัน = commit ต่างกัน (เรียงตามชื่อที่เจอก่อน)
  const two = planCommits([{ code: "??", file: "a/x.md" }, { code: "M ", file: "b/y.md" }], "kr");
  assert.deepEqual(two.map((p) => p.message), ["a: add x.md", "b: update y.md"]);
});

function makeRepo() {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-kcommit-"));
  const git = (args) => spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" });
  git(["init", "-q"]);
  git(["config", "user.email", "test@baan.local"]);
  git(["config", "user.name", "baan test"]);
  return { dir, git };
}

test("commitKnowledgeRoot: commit จริงต่อ module ข้อความตรงรูปแบบ และ commit ของ module หนึ่งไม่กลืนของอีก module", () => {
  const { dir, git } = makeRepo();
  try {
    mkdirSync(path.join(dir, "school-bot", "db"), { recursive: true });
    writeFileSync(path.join(dir, "school-bot", "db", "review.md"), "# r1\n", "utf8");
    writeFileSync(path.join(dir, "school-bot", "index.md"), "# idx\n", "utf8");
    mkdirSync(path.join(dir, "timetableai"), { recursive: true });
    writeFileSync(path.join(dir, "timetableai", "notes.md"), "# n\n", "utf8");

    const logs = [];
    const res = commitKnowledgeRoot({ name: "kr", path: dir }, (m) => logs.push(m));
    assert.equal(res.repo, true);
    assert.equal(res.commits.length, 2);

    const subjects = git(["log", "--format=%s"]).stdout.trim().split("\n");
    assert.deepEqual([...subjects].sort(), ["school-bot: add review.md, index.md", "timetableai: add notes.md"]);
    assert.equal(git(["status", "--porcelain"]).stdout.trim(), "", "ต้อง clean หลัง commit ครบ");

    // แต่ละ commit แตะเฉพาะไฟล์ของ module ตัวเอง
    for (const sha of git(["rev-list", "HEAD"]).stdout.trim().split("\n")) {
      const lines = git(["show", "--name-only", "--format=%s", sha]).stdout.trim().split("\n");
      const subject = lines[0];
      for (const f of lines.slice(1).filter(Boolean)) {
        assert.ok(f.startsWith(`${subject.split(":")[0]}/`), `${subject} ต้องแตะเฉพาะ module ตัวเอง (เจอ ${f})`);
      }
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("commitKnowledgeRoot: ของที่ผู้ใช้ staged ไว้ล่วงหน้าก็ถูกเก็บเข้า commit ของ module นั้น", () => {
  const { dir, git } = makeRepo();
  try {
    mkdirSync(path.join(dir, "m1"), { recursive: true });
    writeFileSync(path.join(dir, "m1", "a.md"), "# a\n", "utf8");
    git(["add", "m1/a.md"]); // staged ค้างไว้แบบที่เจอจริงใน schoolbright
    const res = commitKnowledgeRoot({ name: "kr", path: dir }, () => {});
    assert.deepEqual(res.commits, ["m1: add a.md"]);
    assert.equal(git(["status", "--porcelain"]).stdout.trim(), "");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("commitKnowledgeRoot: ไม่ใช่ git repo = ข้ามเงียบไม่ต้องพัง", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-kcommit-nogit-"));
  try {
    const res = commitKnowledgeRoot({ name: "kr", path: dir }, () => {});
    assert.equal(res.repo, false);
    assert.deepEqual(res.commits, []);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("commitKnowledgeRoot: ไม่มีการเปลี่ยนแปลง = ไม่สร้าง commit", () => {
  const { dir, git } = makeRepo();
  try {
    const res = commitKnowledgeRoot({ name: "kr", path: dir }, () => {});
    assert.deepEqual(res.commits, []);
    assert.equal(git(["rev-list", "--count", "HEAD"]).status, 128, "ยังไม่มี commit แรกใน repo เลย");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
