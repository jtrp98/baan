// related-impact sweep แบบกลไก — หาผู้อ้างอิงทุกจุดแล้วจัดกลุ่มตามเจ้าของไฟล์ โดยไม่ต้องใช้ model
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { formatSweep, ownerOf, sweep } from "../src/sweep.mjs";

function tree(files) {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-sweep-"));
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

test("ownerOf: หมวดใต้ module → role เจ้าของ · ไฟล์ราก module ตามชื่อ · target = front/sys", () => {
  assert.equal(ownerOf("mod/requirement/req-001.md"), "spec");
  assert.equal(ownerOf("mod/design/des-001.md"), "arch");
  assert.equal(ownerOf("mod/test-plan/tp-001.md"), "inspect");
  assert.equal(ownerOf("mod/index.md"), "นายช่าง");
  assert.equal(ownerOf("mod/backlog.md"), "gm");
  assert.equal(ownerOf("mod/security.md"), "jpo");
  assert.equal(ownerOf("mod/planning/task-001.md"), "นายช่าง", "หมวดที่ไม่รู้จักเป็นของ นายช่าง");
  assert.equal(ownerOf("src/a.cs", "target"), "front/sys");
});

test("sweep (ไม่ใช่ git repo): เจอทุกบรรทัด ข้าม archive/ changelog/ โฟลเดอร์ซ่อน และไฟล์ binary", () => {
  const dir = tree({
    "mod/index.md": "สถานะ 15 verified\nอื่นๆ\nย้ำ 15 verified",
    "mod/requirement/req-001.md": "186 AC",
    "mod/design/archive/old.md": "15 verified",
    "mod/changelog/2026-11.md": "2026-11-02 · index.md · แก้ 15 verified เป็น 16 verified",
    "mod/.cache/x.md": "15 verified",
    "mod/plan/blob.bin": Buffer.from([0, 1, 2, ...Buffer.from("15 verified")]),
    "mod/plan/index.md": "ไม่เกี่ยว",
  });
  try {
    const hits = sweep([{ path: dir, kind: "knowledge", label: "" }], ["15 verified", "186 AC"]);
    assert.deepEqual(hits.map((h) => [h.owner, h.file.replaceAll("\\", "/"), h.lines]), [
      ["spec", "mod/requirement/req-001.md", [1]],
      ["นายช่าง", "mod/index.md", [1, 3]],
    ]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("sweep-in ชี้โฟลเดอร์ module: เจ้าของต้องตรงกับตอนค้นจาก knowledge root", () => {
  const dir = tree({ "mod/db/index.md": "x", "mod/index.md": "x" });
  try {
    const hits = sweep([{ path: path.join(dir, "mod"), kind: "knowledge", label: "mod" }], ["x"]);
    assert.deepEqual(hits.map((h) => [h.owner, h.file.replaceAll("\\", "/")]), [["vault", "mod/db/index.md"], ["นายช่าง", "mod/index.md"]]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("sweep (git repo): เคารพ .gitignore — toolchain ที่ ignore ไว้ไม่ถูกค้น", () => {
  const dir = tree({ ".gitignore": ".tools/\n", ".tools/go/x.txt": "OLD-NAME", "src/a.cs": "// OLD-NAME" });
  try {
    if (spawnSync("git", ["init", "-q"], { cwd: dir }).status !== 0) return; // เครื่องไม่มี git — fallback ถูกทดสอบในเคสก่อนหน้าแล้ว
    const hits = sweep([{ path: dir, kind: "target", label: "target:x" }], ["OLD-NAME"]);
    assert.deepEqual(hits.map((h) => [h.owner, h.file.replaceAll("\\", "/")]), [["front/sys", "target:x/src/a.cs"]]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("formatSweep: ไม่มีผู้อ้างอิงต้องบอกชัด · มีผู้อ้างอิงเป็นตาราง + สรุปต่อเจ้าของ", () => {
  assert.match(formatSweep([], ["x"]), /ไม่มีผู้อ้างอิง/);
  const out = formatSweep([{ file: "m\\plan\\index.md", owner: "gm", lines: [5, 11] }, { file: "m/index.md", owner: "นายช่าง", lines: [1] }], ["x"]);
  assert.match(out, /\| gm \| m\/plan\/index.md \| 5, 11 \|/);
  assert.match(out, /พบ 2 ไฟล์ · 3 บรรทัด/);
  assert.match(out, /ต่อเจ้าของ: gm 1 ไฟล์ · นายช่าง 1 ไฟล์/);
});
