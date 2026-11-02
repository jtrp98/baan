# BE-133 — ReviewCaseSchema รับ 3 มิติแยก

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-21`

## Goal

แก้ `review-queue.schema.ts` (`ReviewCaseSchema`) จากตัดสินใจเดียวทั้งเคส เป็นรับ 3 ชุดแยกอิสระ (เมนู/ประเภท/ความรุนแรง) แต่ละชุด `decision: CONFIRMED | OVERRIDDEN | REJECTED` — มิติประเภทเคส: `REJECTED` ต้องมี `overridden_category` เสมอและ `review_reason` บังคับ; มิติเมนู/ความรุนแรง: `REJECTED` ตั้ง NULL ได้ `review_reason` optional — รีวิวรายมิติต้องส่งการตัดสินแยกชุดได้ — กติกา mandatory ต่างกันต่อมิติต้องล็อกที่ Zod schema จึงไม่มีทางส่งข้อมูลไม่ครบ

## References

REQ-009, AC-009.2, AC-009.3, DES-003, DEC-003

## Scope

แก้ schema ของ route เดียว — 3 ชุด decision อิสระ · ความต่าง mandatory ของ review_reason ล็อกที่ refine ของ Zod

- Security-sensitive: yes

## Out of Scope

service/repository (task ถัดไป) · ค่า enum decision · การผ่อน mandatory ของมิติประเภทเคส

## Expected Output

none

## Acceptance

AC-009.2: ส่งการตัดสิน 3 มิติแยกกันได้จริง (ใช้/ใช้แต่แก้ไข/ไม่ใช้ ต่อมิติ)
AC-009.3: ไม่ใช้ มิติประเภทเคสต้องมีค่าแทน+เหตุผลเสมอ ส่วนเมนู/ความรุนแรงปล่อย NULL ได้ — schema ปฏิเสธข้อมูลไม่ตรงกติกา

## Dependencies

—

## Handoff

ตรวจ AC-009.2/AC-009.3 ด้วยการ parse ตัวอย่างผ่าน/ไม่ผ่านต่อมิติด้วย Zod จริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
แก้ schema ไฟล์เดียว — revert ได้ (request รูปแบบใหม่จะไม่ผ่าน schema เดิม จึงต้อง revert พร้อม service)
ส่งต่อ reviewer

Back-links: `INDEX.md`
