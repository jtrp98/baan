# BE-141 — ค่า MenuReviewStatus NO_MENU

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-26`

## Goal

เพิ่มค่า `MenuReviewStatus = 'NO_MENU'` เมื่อจำแนกเมนูสำเร็จแต่ได้ null (ทั้งกรณี AI ตอบ `menuId: null` และถูกปฏิเสธจาก anti-hallucination check) — ใช้ทุกเส้นทาง: classify ปกติ, Safety Override, menu-only path · เขียน `MenuReasoning` ถ้า AI ให้มา (`MenuConfidence` ปล่อย NULL ได้) และยังเขียนแถว log `MENU_CLASSIFICATION` ตามเดิม — NULL เหลือความหมายเดียวคือ ยังไม่เคยได้คำตอบ — แยก AI ตอบว่า ไม่เกี่ยวกับเมนู ออกจาก เรียกไม่สำเร็จ — ถ้าปนกัน remaining ของ backfill จะไม่ถึง 0 และความหมาย NULL เพี้ยน

## References

REQ-006, AC-006.3, DES-002, DEC-002

## Scope

เพิ่มค่า app-layer ทุกเส้นทางเขียนผลเมนู — NULL สงวนเฉพาะกรณีไม่เคยได้คำตอบ/ล้ม (ยังอยู่คิว Mode B)

- Security-sensitive: yes

## Out of Scope

ความหมาย NULL (ยังไม่เคยได้คำตอบ) · schema · แถว log เดิม

## Expected Output

none

## Acceptance

AC-006.3: กรณีจำแนกสำเร็จแต่ไม่มีเมนู สถานะเป็น NO_MENU ไม่ใช่ NULL — การกวาดซ้ำเลือกเฉพาะ NULL จึงไม่กวาดซ้ำไม่รู้จบ

## Dependencies

—

## Handoff

ตรวจ AC-006.3 ด้วยกรณีทดสอบ: AI ตอบ null / ถูกปฏิเสธ id / Gemini ล้ม — เทียบสถานะที่เขียนแยกกันจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ค่า enum ใหม่ additive — revert ได้ แต่ต้องคงการแยก NULL ไม่งั้น remaining ไม่ถึง 0
ส่งต่อ reviewer

Back-links: `INDEX.md`
