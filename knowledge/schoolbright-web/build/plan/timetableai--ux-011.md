# UX-011 — UX artifact: hour-based caps + homeroom-restricted card on settings (DES-014, DES-015, REQ-017/REQ-018)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

UX artifact: hour-based caps + homeroom-restricted card on settings (DES-014, DES-015, REQ-017/REQ-018)

## References

REQ-017, AC-041, AC-042, AC-043, AC-043a, AC-043b, REQ-018, AC-044, AC-045, AC-046, AC-046a, DES-014, DEC-014, DES-015, DEC-015

## Scope

ร่าง UX artifact หน้า `/timetable/settings`: ช่องเพดาน/วัน-สัปดาห์เป็น**จำนวนเต็มชั่วโมง** ป้ายหน่วย "ชั่วโมง" ตรงการบังคับ (แก้ D40) — เอา checkbox "ใช้กับครูทุกคน/ยกเว้น" ออก (ลำดับใหม่ 2 ระดับ: รายคน > รวม — AC-043) · การ์ด "3. ครูประจำชั้นสอนเฉพาะห้องที่รับผิดชอบ" (วันนี้ mock — EVD-061) แสดงห้องที่รับผิดชอบจาก `TClassMember` **อ่านอย่างเดียว** + **แก้ tooltip D43** (`homeroomTeacherSettings.onlyAssignedClassroom` — ข้อความเดิมบอกว่ายกเว้นเพดาน/คาบต่อเนื่อง **ผิด** — BR-44: ครูกลุ่มนี้ถูกบังคับเหมือนครูอื่นทุกประการ) · ข้อความปฏิเสธ `teacherMaxHoursPerDay`/`teacherMaxHoursPerWeek` แทน `teacherMaxPeriodPerDay` เดิม

- Write paths: C:/src/schoolbright/knowledge/timetableai/uxui/UX-011-teaching-caps-and-homeroom.md, C:/src/schoolbright/knowledge/timetableai/uxui/README.md
- Security-sensitive: yes

## Out of Scope

ไม่แตะโค้ด · สัญญา DES-014/DES-015

## Expected Output

uxui/UX-011-teaching-caps-and-homeroom.md+ทะเบียน uxui/README.md บันทึก signed จริง jtrp98 2026-10-11: "อนุมัติ UX-011 ทั้งฉบับ สรุปเป็นชั่วโมงและนาที (แนะนำ)". QA13verifieddraft เป็นประวัติ; signed ไม่ใช่ runtimeQA/schema/deployapproval.

## Acceptance

AC-041/AC-042/AC-043 (UI: ชั่วโมงเต็ม, /สัปดาห์, 2 ระดับ) · AC-046 (ตั้งรายครู แก้ได้อิสระ) · tooltip BR-44 ถูกต้อง

## Dependencies

UX-007

## Handoff

UXgate ปิดจาก humanrecord จริงแล้ว; FE-025 รอ BE-013 realimplementation/reviewer/QA ก่อน frontend(FE-021 verifiedQA16). Devschema approval แยกตาม DES-014/015; sharedDDL/SA-Q8paired cutover/SEC01/02production/deploy ยัง hold. ไม่แก้ Status หรือ sign แทนมนุษย์.

## Change Log

- 2026-10-11 — รับ actualsignedUX-011/README jtrp98who/when/literal; frontend รอ BE-013 real contract ไม่ขอ UXapproval ซ้ำ.

- 2026-10-09 — ชื่อ output/Write paths ตรง draft ใน working tree; รักษา sign-off gate ไม่เซ็นแทนคน.

Back-links: `INDEX.md`
