# TP-002 — รายละเอียด API fixtures

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [แผน TP-002](tp-002-fixture-plan-001.md) ทุก actual เป็น NOT_RUN ใช้ PF (Test Profile: สภาพแวดล้อมตรวจ) และรหัสหลักฐาน E ตาม [TP-001](tp-001.md#profiles)

## FX-04 lost response ตอน explicit import (receipt/tombstone)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-04a | stub Gateway/proxy กลืน response หลัง DB commit สำเร็จ (drop response post-commit) | TP001-028 · [AC-041-04 (นำเข้างานเดิมซ้ำในบัญชีเดิม รวม retry หลังคำตอบสูญหาย/เปิดแอปใหม่…)](../requirement/req-041.md) | 201 เกิดหลัง durable commit เท่านั้น; response หาย→retry ด้วย RequestKey/snapshot เดิม ได้ผลเดิม ไม่เกิดสำเนาใหม่ |
| FX-04b | crash host ก่อนเติมใบรับ/หลังเขียน pending; ลบไฟล์ใบรับ | TP001-028/078 · AC-041-04/05 | ใบรับเขียนก่อนส่ง (atomic); สูญหายยังคำนวณ key จาก UUID; server ไม่เชื่อ local receipt; state เติมจากผล server เท่านั้น |
| FX-04c | แก้เนื้อหา/ชื่อ Guest หลัง freeze; 2 clients POST พร้อมกัน | TP001-028 · AC-041-04 | RequestHash ต่าง→409 IDEMPOTENCY_CONFLICT ไม่เปลี่ยน key อัตโนมัติ; logical key (SchoolId,Principal,Operation,RequestKey) เหลือชุดเดียว; ไม่สมมติว่ามี standalone unique index |
| FX-04d | ล้าง Guest workspace + trash sweep แล้ว retry; ล้าง ResultCipher | TP001-078 · AC-041-04 | tombstone กันซ้ำข้ามการล้าง; ไม่ purge จากการล้าง Guest/trash |
| FX-04e | transactional fake repository fail ก่อน commit: หลังสร้าง staged Project/Revision หรือก่อน idempotency/audit commit; retry snapshot/key เดิม | เกณฑ์ DB failure ของ TP-002; TP001-028 สนับสนุนเดิม ไม่เพิ่ม AC ใน pack | ไม่ตอบ import สำเร็จ; committed rows/receipt=0, ไม่มีครึ่งชุด; rollback แล้ว retry ครั้งที่สำเร็จสร้างสำเนาเดียว. post-commit response หายแยกใช้ FX-04a ไม่ตีความเป็น rollback |

วิธี: stub Gateway proxy (ควบคุม drop/delay/replay) + transactional fake repository ตรวจ committed/staged rows before/after+audit (E-API ติดป้าย fake ไม่ใช่ DB runtime); Project/Revision/Idempotency commit เป็น transaction เดียว

## FX-05 cross-tenant / authority injection (GAP-06)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-05a | synthetic School DB fixture: T/A/ห้อง1/เทอมX, U/B/ห้อง1/เทอมX, R ใน roster, S ย้ายออก (หลายแถว history), sId==sEmp ชน, SchoolID ทุก alias | TP001-058/079 · [AC-038-05 (ครูตรวจ Arm ของนักเรียนนอกรายชื่อที่ได้รับมอบหมายหรือข้ามโรงเรียนไม่ได้…)](../requirement/req-038.md), [AC-039-05 (ครูขอดูรายชื่อหรือผลนักเรียนนอกที่ได้รับมอบหมาย…)](../requirement/req-039.md) | เห็นเฉพาะ course-teacher∩roster∩term; ครูอีกคนในห้อง/PlanCourseIds ของ run ไม่เปิดสิทธิ์; ใช้ history ไม่ใช่ห้องปัจจุบันของ TUser; ไม่เดา Max(nHistoryId) |
| FX-05b | spoof identity/tenant/forwarding headers; ใช้ ID ข้ามโรงเรียน/เทอม; ถอนสิทธิ์ระหว่าง read→commit | TP001-058/079 · AC-038-05, AC-039-05 | 403 SUBJECT_PERMISSION_REQUIRED หรือ 404; tenant ทุก join; re-check ก่อน commit ปฏิเสธ in-flight; ผลเดิมไม่เปลี่ยน |
| FX-05c | inject School DB resolver ล่ม / ข้อมูลกำกวม | TP001-079 · AC-038-05, AC-039-05 | แหล่งล่ม→503 AUTH_UNAVAILABLE; resolve ไม่ได้→fail closed 503 AUTH_NOT_CONFIGURED ไม่เปิดสิทธิ์จาก query |

วิธี: stub School DB resolver จาก synthetic dataset + hash แนบทุก run (SQL หากมีใช้เป็นข้อความประกอบ ไม่ execute) — **synthetic ติดป้าย test-only** จนได้ resolver roster/status/move/term + tenant alias proof จาก legacy/sys ตาม gap-sync-review §ผู้รับต่อ; สิทธิ์ไม่ยกจาก client/cType

[การเตรียม การกระตุ้นเหตุการณ์ และสิ่งที่วัด](tp-002-fixture-api-001-setup.md)


## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ


## ยังไม่ยืนยัน

resolver roster/status/move/term และ tenant alias proof จาก legacy/sys ยังต้องมีหลักฐานจริงก่อนเชื่อมระบบ; fixture scripted ไม่กำหนดกฎ history ใหม่
