# UX-012 — UX artifact: generate precheck blocker panel + warnings (DES-011, REQ-014 AC-033..AC-035)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

UX artifact: generate precheck blocker panel + warnings (DES-011, REQ-014 AC-033..AC-035)

## References

REQ-014, AC-033, AC-034, AC-035, DES-011, DEC-011

## Scope

ร่าง UX artifact หน้า generate: แผง `lstGenerateBlockers` — แสดง**รายการปัญหาทั้งหมด** (ไม่ใช่รายการแรก — AC-034) พร้อมทางลัดแท็บใหม่ไปหน้า "จัดการหลักสูตร/แผน" (นอกโมดูล — resolve จากเมนู; ผู้ใช้ไม่มีสิทธิ์เมนู = ข้อความแนะนำไม่มีลิงก์) · ปุ่ม "ตรวจใหม่" (AC-035 — BR-28) · เหตุบล็อก 2 ตัว (`NoEligibleTeacher` รวม `sDetail: RoomCaretaker` — แสดงห้อง/ผู้ดูแล, `ZeroPeriodsPerWeek`) · การแสดง `lstGenerateWarnings` (BR-53 ของ FE-023, `RoomSettingMissing` ของ FE-024, `SubjectGroupPinnedConflict`) — ไม่บล็อก

- Write paths: C:/src/schoolbright/knowledge/timetableai/uxui/UX-012-generate-precheck.md, C:/src/schoolbright/knowledge/timetableai/uxui/README.md
- Security-sensitive: yes

## Out of Scope

ไม่แตะโค้ด · สัญญา DES-011

## Expected Output

uxui/UX-012-generate-precheck.md (amend draft เดิม) + ทะเบียน uxui/README.md; ยังไม่มี human sign-off.

## Acceptance

AC-033/AC-034/AC-035 แสดงเป็น UX ครบ (ตรวจก่อน Generate, บล็อกปุ่ม, ตรวจซ้ำไม่ต้องปิดหน้า)

## Dependencies

UX-007

## Handoff

artifact + ตาราง Sign-off + ทะเบียน `../../modules/timetableai/build/uxui/README.md` · หลังคนเซ็น → PM ตรวจ → frontend-engineer; QA ตั้ง Status หลังมีผลตรวจจริง
ร่างเอกสาร — ไม่กระทบโค้ด/สัญญา
ส่งต่อ reviewer

## Change Log

- 2026-10-09 — ชื่อ output/Write paths ตรง draft ใน working tree; รักษา sign-off gate ไม่เซ็นแทนคน.

Back-links: `INDEX.md`
