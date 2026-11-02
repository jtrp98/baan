# BE-149 — ย้าย call site ไป v2 ทั้ง 3 จุด

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-33`

## Goal

ย้าย call site ทั้งหมดของ `computeCrmPriorityScore` มาใช้ `computeCrmPriorityScoreV2` + เขียน `SlaRuleVersion="v2"`+`ComputedAt` คู่กันทุกจุดคำนวณ: (ก) classify/re-classify (`classification.service.ts`), (ข) คนตรวจเปลี่ยน Severity ผ่าน review-queue (`review-queue.service.ts`), (ค) ผูกเคสเข้า `TCrmIssue` ทั้งจาก SA group มือ (link-case) และ accept `MERGE_ISSUE`/`MERGE_REQUEST` — จุด (ค) best-effort หลัง commit ห้าม rollback — แถวเก่า v1 ไม่ต้อง migrate — คะแนนต้องคำนวณใหม่ทุกจังหวะที่ข้อมูลตั้งต้นเปลี่ยน — พลาดจุดเดียวคะแนนค้างเก่าเงียบ ๆ

## References

REQ-003, AC-003.1, AC-003.3, DES-005, DEC-005

## Scope

แก้ call site 3 กลุ่มตามสัญญา — เขียน `ComputedAt`+`SlaRuleVersion` คู่กันเสมอ · จุด (ค) best-effort หลัง commit ล้ม = log เท่านั้น · ไม่มีการ migrate แถวเก่า

- Security-sensitive: yes

## Out of Scope

สูตรใน constant (แก้ที่ task BE-crm-ai-support-P1-31) · แถว v1 เดิม (ไม่ migrate) · การ rollback การผูกเรื่องเมื่อคำนวณคะแนนล้ม

## Expected Output

none

## Acceptance

AC-003.1: ทุกจังหวะที่กำหนดคำนวณด้วย v2 จริง — ไม่เหลือ call site v1
AC-003.3: ทุกแถวที่คำนวณใหม่มี v2+ComputedAt คู่กัน — ย้อนอ่านเวอร์ชันได้ทุกจุด

## Dependencies

—

## Handoff

ตรวจ AC-003.1/AC-003.3 ด้วยการไล่ 3 จังหวะจริง (classify/เปลี่ยน Severity/ผูกเรื่อง) และ grep ไม่เหลือ call site v1 — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ย้าย call site — revert ได้รายจุด (แถวที่คำนวณด้วย v2 คงค่า+เวอร์ชันของตัวเอง)
ส่งต่อ reviewer

Back-links: `INDEX.md`
