// Regression: แยก "สถานะงาน" ออกจาก "exit code ของ CLI" และตรวจ output state marker
// ตามสัญญา CONVENTIONS §8 (จบ handoff ด้วยสถานะเดียว) — อิงรูปแบบจริงจาก run pipeline-2026-10-15-02-02-30
import test from "node:test";
import assert from "node:assert/strict";
import { detectStateMarker, classifyOutcome } from "../src/scheduler.mjs";

test("marker ท้ายคำตอบ: ครอบ markdown bold ก็อ่านได้ (กรณีจริงของ INSPECT-001)", () => {
  const answer = "สรุปแผนทดสอบยาว... ต้องแก้ requirement ก่อน\n\n**NEEDS_REQUIREMENT_CHANGE**";
  assert.equal(detectStateMarker(answer), "NEEDS_REQUIREMENT_CHANGE");
});

test("marker ที่มีข้อความต่อท้ายอีก ~400 ตัวอักษรก็ยังอยู่ในหน้าต่างสแกน (กรณีจริงของ SPEC-001)", () => {
  const answer = `สรุปงาน\n\nNEEDS_HUMAN\n\nต้องการผู้ใช้ยืนยันว่าต้องการหน้าจอค้นหาขั้นสูงหรือไม่ และรายละเอียดวิธีกรองข้อมูล ควรทำตารางรายการวิดีโอ หรือแถบเลื่อนดูภาพต่อเนื่อง และ${"คำถามเพิ่มเติม".repeat(30)}`;
  assert.equal(detectStateMarker(answer), "NEEDS_HUMAN");
});

test("marker ตัวสุดท้ายในหน้าต่างชนะ (บรรทัดจบคือคำตอบสุดท้าย)", () => {
  assert.equal(detectStateMarker("มีข้อโต้แย้ง\n\nNEEDS_HUMAN\n\nแต่คืนหลังข้อมูลครบแล้วจึงทำต่อได้\n\nDONE"), "DONE");
  assert.equal(detectStateMarker("สรุปผลทดสอบ ผ่านทุกข้อ\n\nPASS"), "PASS");
});

test("marker ที่อยู่ไกลกว่าหน้าต่างท้ายคำตอบไม่ถูกนับ (กัน false positive จากเนื้อความ)", () => {
  assert.equal(detectStateMarker(`NEEDS_HUMAN\n${"เนื้อหายาว".repeat(300)}`), null);
  assert.equal(detectStateMarker(""), null);
  assert.equal(detectStateMarker("เขียนเสร็จแล้ว done ครับ"), null); // ตัวพิมพ์เล็กไม่ใช่ marker
});

test("classifyOutcome: exit 0 + มีคำตอบ + DONE/PASS/ไม่มี marker = completed", () => {
  assert.deepEqual(classifyOutcome({ ok: true, timedOut: false, answer: "ผลงาน\nDONE" }), { state: "completed", ok: true, marker: "DONE" });
  assert.equal(classifyOutcome({ ok: true, timedOut: false, answer: "ผลงานเฉยๆ ไม่มี marker" }).state, "completed");
  assert.equal(classifyOutcome({ ok: true, timedOut: false, answer: "ผลงานเฉยๆ ไม่มี marker" }).marker, null);
});

test("classifyOutcome: NEEDS_* / FAIL / BLOCKED = งานไม่สำเร็จ แม้ exit code เป็น 0 (บั๊กเดิมจาก AUDIT ข้อ 1)", () => {
  for (const [marker, state] of [
    ["NEEDS_HUMAN", "needs_human"],
    ["NEEDS_REQUIREMENT_CHANGE", "needs_requirement_change"],
    ["NEEDS_DESIGN_CHANGE", "needs_design_change"],
    ["FAIL", "fail"],
    ["BLOCKED", "blocked"],
  ]) {
    const c = classifyOutcome({ ok: true, timedOut: false, answer: `รายงานผล\n\n${marker}` });
    assert.equal(c.state, state, marker);
    assert.equal(c.ok, false, marker);
    assert.equal(c.marker, marker);
  }
});

test("classifyOutcome: timeout / exit ไม่เป็นศูนย์ / คำตอบว่าง = ไม่สำเร็จ (กัน resume ปลอมสถานะจาก AUDIT ข้อ 2)", () => {
  // กรณีจำลองของ audit: "Partial output: NEEDS_HUMAN" ที่ timeout — ต้องไม่กลายเป็น success ตอน resume
  assert.equal(classifyOutcome({ ok: true, timedOut: true, answer: "Partial output: NEEDS_HUMAN" }).state, "timeout");
  assert.equal(classifyOutcome({ ok: false, timedOut: false, answer: "" }).state, "failed");
  assert.equal(classifyOutcome({ ok: true, timedOut: false, answer: "" }).state, "failed");
  assert.equal(classifyOutcome({ ok: true, timedOut: false, answer: "   \n  " }).state, "failed");
});

// Regression 2026-11-05: codex ตอบว่าทำไม่ได้ แต่ประโยคท้ายพูดถึง `PASS` — เดิมถูกนับว่าสำเร็จ
test("marker: บรรทัดที่ขึ้นต้นด้วยสถานะชนะคำที่ถูกพูดถึงในประโยค (กรณีจริงของ codex)", () => {
  const real = "**BLOCKED** — ทำตามคำสั่งนี้ไม่ได้ เพราะสภาพแวดล้อมกำหนดให้ filesystem เป็น read-only จึงไม่ได้อ่านไฟล์\n\nสถานะที่ขอให้จบด้วย `PASS` จึงยังยืนยันไม่ได้จากหลักฐานการทดสอบที่รันได้";
  assert.equal(detectStateMarker(real), "BLOCKED");
  assert.equal(classifyOutcome({ ok: true, timedOut: false, answer: real }).state, "blocked");
  assert.equal(detectStateMarker("งานเสร็จ\n- AC-1: ผ่าน\n\nDONE — ส่งต่อ check"), "DONE");
  assert.equal(detectStateMarker("ผลตรวจ\n\nFAIL\n\nหมายเหตุ: ถ้าแก้แล้วจะได้ PASS"), "FAIL", "บรรทัดสถานะชนะคำในประโยคที่ตามมา");
});

test("marker: ไม่มีบรรทัดสถานะ — ข้ามคำใน `code` และมีทั้งสำเร็จ/ไม่สำเร็จ = ถือว่าไม่สำเร็จ", () => {
  assert.equal(detectStateMarker("ทำไม่ได้ จึง BLOCKED แม้ใบงานขอให้ตอบ PASS"), "BLOCKED");
  assert.equal(detectStateMarker("ทำเสร็จแล้ว ผลคือ PASS ตามที่ขอ ไม่ใช่ `FAIL`"), "PASS");
  assert.equal(detectStateMarker("ใบงานบอกให้จบด้วย `DONE`"), null);
});
