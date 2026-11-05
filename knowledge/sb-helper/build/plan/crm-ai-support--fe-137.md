# FE-137 — drawer รีวิว 3 มิติแยก

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P1-13`

## Goal

แก้ `case-review-detail-drawer.component.tsx` จากตัดสินใจเดียวทั้งเคส เป็นแสดง 3 มิติแยกกัน (เมนู/ประเภท/ความรุนแรง) แต่ละมิติมีปุ่ม 3 ทาง (ใช้/ใช้แต่แก้ไข/ไม่ใช้) ตาม Form Workflow มาตรฐาน — มิติประเภทเคสบังคับกรอกเหตุผลเมื่อเลือก ไม่ใช้ — คนตรวจตัดสินเฉพาะมิติที่ผิด — UI ต้องส่งการตัดสินแยกมิติและบังคับเหตุผลตรงกติกาของ schema

## References

REQ-009, AC-009.1, AC-009.2, DES-003, DEC-003

## Scope

แก้ drawer เดิมเป็น 3 กลุ่มตัดสินอิสระ — บังคับเหตุผลของมิติประเภทเคสเมื่อ ไม่ใช้ ให้ตรง Zod schema

- Security-sensitive: yes

## Out of Scope

endpoint/schema ฝั่ง BE (task BE-crm-ai-support-P1-21/22) · component ตาราง/filter

## Expected Output

none

## Acceptance

AC-009.1: drawer แสดงผลจำแนก 3 มิติแยกกัน — คนตรวจเลือกทีละมิติอิสระได้จริง
AC-009.2: ปุ่ม 3 ทางครบทุกมิติ — การตัดสินส่งแยกชุดตาม schema

## Dependencies

—

## Handoff

ตรวจ AC-009.1/AC-009.2 ด้วยการตัดสินจริงทั้ง 3 มิติ (สำเร็จ + error path เมื่อไม่กรอกเหตุผล) — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
แก้ component เดียว — revert ได้เป็นรูปแบบตัดสินรวมเดิม (ต้อง revert คู่กับ BE schema)
ส่งต่อ reviewer

Back-links: `INDEX.md`
