# TP-002 — รายละเอียด API fixtures

วันที่ 2026-10-29 · inspect · ส่วนต่อของ [แผนหลัก](tp-002-fixture-plan-001.md) · ทุก actual=NOT_RUN

## FX-04 lost response ตอน explicit import (receipt/tombstone)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-04a | stub G/proxy กลืน response หลัง DB commit สำเร็จ (drop response post-commit) | TP001-028 · AC-041-04 | 201 เกิดหลัง durable commit เท่านั้น; response หาย→retry ด้วย RequestKey/snapshot เดิม ได้ผลเดิม ไม่เกิดสำเนาใหม่ |
| FX-04b | crash host ก่อนเติมใบรับ/หลังเขียน pending; ลบไฟล์ใบรับ | TP001-028/078 · AC-041-04/05 | ใบรับเขียนก่อนส่ง (atomic); สูญหายยังคำนวณ key จาก UUID; server ไม่เชื่อ local receipt; state เติมจากผล server เท่านั้น |
| FX-04c | แก้เนื้อหา/ชื่อ Guest หลัง freeze; 2 clients POST พร้อมกัน | TP001-028 · AC-041-04 | RequestHash ต่าง→409 IDEMPOTENCY_CONFLICT ไม่เปลี่ยน key อัตโนมัติ; logical key (SchoolId,Principal,Operation,RequestKey) เหลือชุดเดียว; ไม่สมมติว่ามี standalone unique index |
| FX-04d | ล้าง Guest workspace + trash sweep แล้ว retry; ล้าง ResultCipher | TP001-078 · AC-041-04 | tombstone กันซ้ำข้ามการล้าง; ไม่ purge จากการล้าง Guest/trash |
| FX-04e | transactional fake repository fail ก่อน commit: หลังสร้าง staged Project/Revision หรือก่อน idempotency/audit commit; retry snapshot/key เดิม | เกณฑ์ DB failure ของ TP-002; TP001-028 สนับสนุนเดิม ไม่เพิ่ม AC ใน pack | ไม่ตอบ import สำเร็จ; committed rows/receipt=0, ไม่มีครึ่งชุด; rollback แล้ว retry ครั้งที่สำเร็จสร้างสำเนาเดียว. post-commit response หายแยกใช้ FX-04a ไม่ตีความเป็น rollback |

วิธี: stub G proxy (ควบคุม drop/delay/replay) + transactional fake repository ตรวจ committed/staged rows before/after+audit (E-API ติดป้าย fake ไม่ใช่ DB runtime); Project/Revision/Idempotency commit เป็น transaction เดียว

## FX-05 cross-tenant / authority injection (GAP-06)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-05a | synthetic School DB fixture: T/A/ห้อง1/เทอมX, U/B/ห้อง1/เทอมX, R ใน roster, S ย้ายออก (หลายแถว history), sId==sEmp ชน, SchoolID ทุก alias | TP001-058/079 · AC-038-05, AC-039-05 | เห็นเฉพาะ course-teacher∩roster∩term; ครูอีกคนในห้อง/PlanCourseIds ของ run ไม่เปิดสิทธิ์; ใช้ history ไม่ใช่ห้องปัจจุบันของ TUser; ไม่เดา Max(nHistoryId) |
| FX-05b | spoof identity/tenant/forwarding headers; ใช้ ID ข้ามโรงเรียน/เทอม; ถอนสิทธิ์ระหว่าง read→commit | TP001-058/079 · AC-038-05, AC-039-05 | 403 SUBJECT_PERMISSION_REQUIRED หรือ 404; tenant ทุก join; re-check ก่อน commit ปฏิเสธ in-flight; ผลเดิมไม่เปลี่ยน |
| FX-05c | inject School DB resolver ล่ม / ข้อมูลกำกวม | TP001-079 · AC-038-05, AC-039-05 | แหล่งล่ม→503 AUTH_UNAVAILABLE; resolve ไม่ได้→fail closed 503 AUTH_NOT_CONFIGURED ไม่เปิดสิทธิ์จาก query |

วิธี: stub School DB resolver จาก synthetic dataset + hash แนบทุก run (SQL หากมีใช้เป็นข้อความประกอบ ไม่ execute) — **synthetic ติดป้าย test-only** จนได้ resolver roster/status/move/term + tenant alias proof จาก legacy/sys ตาม gap-sync-review §ผู้รับต่อ; สิทธิ์ไม่ยกจาก client/cType

## Setup / trigger / สิ่งที่วัด

- API ระดับ unit/domain ใช้ trusted-session stub, scripted G boundary และ in-memory transactional fake; ไม่มี DSN/credentials หรือ connection ถึง DB/service จริง. PF-API/PF-WEB/PF-LEGACY เป็นเป้าหมาย integration ภายหลังตาม prerequisites ใน index ไม่ใช่ integration ที่รันแล้ว
- FX-04a/e: seed store ว่าง, Guest UUID และ frozen snapshot/hash/key สมมติ; barrier ก่อน commit และหลัง durable-in-fake commit แยกกัน. วัด staged/committed Project/Revision/idempotency/audit counts ก่อน/หลัง, result ID และ attempt count. fail ก่อน commit เหลือศูนย์; drop หลัง commit+retry เหลือชุดเดิม 1 ชุด. receipt ไม่ใช่หลักฐาน PGGradeDB
- FX-05a: seed School A/B ให้ learner ID และ classroom ID ชนกัน; T สอนวิชา A/ห้อง1/เทอม X, U สอนวิชา B ในห้องเดียวกัน. ใส่ผลสมมติคนละ marker ต่อคน/วิชา; T→R วิชา A เป็น positive control แล้ว T→รายชื่อ/ผลวิชา B, U→ผลวิชา A, ข้าม School/term, ครูไม่ assigned และ ID ที่ทราบ ต้องไม่เห็นข้อมูลต้องห้าม
- สัญญา fixture resolver ระบุผลตอบต่อ tuple (School, teacher, course, learner, term) ชัดเจนเป็น allow/deny/unavailable/ambiguous; history หลายแถวของ S ใช้ scripted expected ไม่เดา latest row หรือสร้างกฎ roster เอง. sId==sEmp ต้องไม่ทำให้ employee กลายเป็น learner
- FX-05b: spoof tenant/identity/profile/channel ใน request และถอน assignment หลัง read ก่อน commit ผ่าน barrier; trusted session คงเป็น authority. วัด response body/list/detail/error ไม่มี marker/ชื่อ/คะแนนของขอบเขตต้องห้าม, downstream result reads และ committed mutations=0 เมื่อถูกปฏิเสธ; positive control ต้องอ่านได้เพื่อกัน fake ที่ deny ทุกคำขอ
- FX-05c: สลับ resolver เป็น unavailable/ambiguous ก่อนอ่านและก่อน commit; ตรวจ fail closed ตามตาราง ไม่ใช้ cache/query เปิดสิทธิ์; ผลเดิมไม่เปลี่ยน. teacher ban ในงานนี้หมายถึงไม่ assigned/ถูกถอนสิทธิ์ตาม AC-039-05 ไม่เพิ่มนโยบาย ban บัญชีใหม่
- แยก fake receipt กับหลักฐาน DB จริง; E-API เก็บ sanitized request/outcome/correlation + dataset hash + counts/audit/fault point โดยไม่มี token/key หรือข้อมูลจริง. transport จริงต้องรอ HTTP G→gRPC B mapping ตาม index; ไม่กำหนด RPC/error ใหม่
- export parity/coexistence/score writer/crash และ lease worker ของคะแนนอยู่ที่ [TP-003](tp-003-grade-fixture-plan-001.md); FX-04 เป็น Project import เท่านั้น ไม่ปิด grade gates


## Change Log
- 2026-10-29 — ใบงาน093: แยกรายละเอียดจากแผนหลัก คง IDs เดิม และเติม setup/trigger/สิ่งที่วัด; fake เท่านั้น ไม่มี test execution
