import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { detectMojibake, repairMojibake, repairFile } from "../src/mojibake.mjs";
import { cli } from "../src/cli.mjs";

// Helper to simulate CP874 / CP1252 mojibake from UTF-8 string for deterministic test fixtures
const byteToChar = new Map();
for (let b = 0; b <= 0x7f; b++) byteToChar.set(b, String.fromCharCode(b));
for (let b = 0xa1; b <= 0xfb; b++) byteToChar.set(b, String.fromCharCode(b - 0xa0 + 0x0e00));
byteToChar.set(0xa0, "\u00a0");
const win874Known = {
  0x80: "\u20ac", 0x85: "\u2026", 0x91: "\u2018", 0x92: "\u2019",
  0x93: "\u201c", 0x94: "\u201d", 0x95: "\u2022", 0x96: "\u2013", 0x97: "\u2014",
};
for (const [b, ch] of Object.entries(win874Known)) byteToChar.set(Number(b), ch);
const win1252Extra = {
  0x82: "\u201a", 0x83: "\u0192", 0x84: "\u201e", 0x86: "\u2020", 0x87: "\u2021",
  0x88: "\u02c6", 0x89: "\u2030", 0x8a: "\u0160", 0x8b: "\u2039", 0x8c: "\u0152",
  0x8e: "\u017d", 0x98: "\u02dc", 0x99: "\u2122", 0x9a: "\u0161", 0x9b: "\u203a",
  0x9c: "\u0153", 0x9e: "\u017e", 0x9f: "\u0178",
};
for (const [b, ch] of Object.entries(win1252Extra)) byteToChar.set(Number(b), ch);
for (let b = 0x80; b <= 0x9f; b++) {
  if (!byteToChar.has(b)) byteToChar.set(b, String.fromCharCode(b));
}

function simulateMojibake(text) {
  const buf = Buffer.from(text, "utf8");
  let res = "";
  for (const b of buf) res += byteToChar.get(b);
  return res;
}

test("repairMojibake accurately recovers CP874/CP1252 mojibake to Thai", () => {
  const sample1 = "precedence เหนือ adoption/first_wave";
  assert.equal(repairMojibake(simulateMojibake(sample1)), sample1);

  const sample2 = "ฐานและข้อเสนอปิด gate";
  assert.equal(repairMojibake(simulateMojibake(sample2)), sample2);

  const sample3 = "Login และหลายโครงงาน";
  assert.equal(repairMojibake(simulateMojibake(sample3)), sample3);
});

test("detectMojibake identifies CP874 mojibake patterns accurately", () => {
  const corrupted = simulateMojibake("ทดสอบตัวอย่างภาษาไทยที่เกิดอาการเพี้ยน");
  assert.equal(detectMojibake(corrupted), true);
  assert.equal(detectMojibake("Hello world! This is plain English."), false);
  assert.equal(detectMojibake("สวัสดีครับ นี่คือข้อความภาษาไทยปกติ"), false);
});

test("repairFile handles dryRun and live write for JSON", () => {
  const tmp = mkdtempSync(path.join(tmpdir(), "mojibake-test-"));
  const filePath = path.join(tmp, "test-plan.json");
  const corrupted = JSON.stringify({
    title: simulateMojibake("ฐานและข้อเสนอปิด gate"),
    desc: simulateMojibake("precedence เหนือ adoption"),
  });

  try {
    writeFileSync(filePath, corrupted, "utf8");

    // 1. Dry run
    const dryRes = repairFile(filePath, { dryRun: true });
    assert.equal(dryRes.ok, true);
    assert.equal(dryRes.modified, true);
    assert.equal(dryRes.dryRun, true);
    assert.equal(readFileSync(filePath, "utf8"), corrupted);

    // 2. Live write
    const liveRes = repairFile(filePath, { write: true, indent: 2 });
    assert.equal(liveRes.ok, true);
    assert.equal(liveRes.modified, true);
    assert.equal(liveRes.dryRun, false);

    const updated = JSON.parse(readFileSync(filePath, "utf8"));
    assert.equal(updated.title, "ฐานและข้อเสนอปิด gate");
    assert.equal(updated.desc, "precedence เหนือ adoption");

    // 3. Run on already repaired file
    const secondPass = repairFile(filePath, { write: true });
    assert.equal(secondPass.modified, false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("cli accepts --repair-mojibake flag with --dry-run", async () => {
  const tmp = mkdtempSync(path.join(tmpdir(), "mojibake-cli-"));
  const filePath = path.join(tmp, "cli-test.json");
  const corrupted = JSON.stringify({
    title: simulateMojibake("ฐานและข้อเสนอปิด gate"),
    notice: simulateMojibake("เหนือ ตาม และ ผ่าน"),
  });

  try {
    writeFileSync(filePath, corrupted, "utf8");
    const res = await cli(["--repair-mojibake", filePath, "--dry-run"]);
    assert.equal(res.ok, true);
    assert.equal(res.dryRun, true);
    assert.equal(res.modified, true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
