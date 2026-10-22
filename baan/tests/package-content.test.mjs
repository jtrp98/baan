// Regression: package ต้องส่งไฟล์สัญญาครบ (AUDIT ข้อ 6) และห้ามส่งข้อมูล run เข้า tarball
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const pkgPath = fileURLToPath(new URL("../package.json", import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const pkgDir = path.dirname(pkgPath);

test('files รวม CONVENTIONS.md (สัญญาบังคับที่ทุก role ต้องได้รับ)', () => {
  assert.ok(pkg.files.includes("CONVENTIONS.md"), `files ปัจจุบัน: ${pkg.files.join(", ")}`);
});

test("package ห้ามมี config ของเครื่อง — มีแค่ template ตัวอย่าง", () => {
  assert.ok(pkg.files.includes("baan.example.json"), "ต้องมี baan.example.json");
  assert.ok(!pkg.files.includes("baan.json"), "baan.json เป็นของ workspace ต้องไม่ติด package");
  assert.ok(!existsSync(path.join(pkgDir, "baan.json")), "ใน package ต้องไม่มีไฟล์ baan.json จริง");
});

test("ไฟล์ประกาศใน files มีอยู่จริงทุกไฟล์บนดิสก์", () => {
  for (const f of pkg.files) {
    const p = path.join(pkgDir, f);
    assert.ok(existsSync(p), `ประกาศแต่ไม่มีจริง: ${f}`);
  }
});

test("entrypoints และโมดูลหลักอยู่ครบใน package", () => {
  for (const f of ["bin/", "src/", "agents.json", "roles/", "CONVENTIONS.md", "BAAN.md", "README.md"]) {
    assert.ok(pkg.files.includes(f), `ขาด ${f}`);
  }
  assert.equal(pkg.bin.baan, "./bin/baan.mjs");
  assert.equal(pkg.bin["baan-role"], "./bin/baan-role.mjs");
  assert.ok(existsSync(path.join(pkgDir, "bin", "baan.mjs")), "ไฟล์ bin ต้องมีจริง");
  assert.ok(existsSync(path.join(pkgDir, "bin", "baan-role.mjs")), "ไฟล์ bin ต้องมีจริง");
});

test("ข้อมูล run (reports/) และ tests ต้องไม่ติดเข้า package", () => {
  assert.ok(!pkg.files.some((f) => f.startsWith("reports")));
  assert.ok(!pkg.files.some((f) => f.startsWith("tests")));
});

test("เวอร์ชันอยู่ในรูปแบบ semver เสมอ", () => {
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
});
