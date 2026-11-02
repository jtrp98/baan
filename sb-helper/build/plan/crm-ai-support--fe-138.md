# FE-138 — คอลัมน์เมนูในตารางรีวิว

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P1-14`

## Goal

เพิ่มคอลัมน์เมนูใน `case-review-table.component.tsx` — คนตรวจต้องเห็นผลเมนูที่ AI เสนอในรายการโดยไม่ต้องเปิด drawer ทุกแถว

## References

REQ-009, AC-009.1, DES-002, DEC-002

## Scope

เพิ่ม 1 คอลัมน์ — อ่านค่าเมนูจาก payload ของคิว ไม่เรียก API เพิ่ม

- Security-sensitive: yes

## Out of Scope

drawer (task อื่น) · payload ฝั่ง BE

## Expected Output

none

## Acceptance

AC-009.1: คอลัมน์เมนูแสดงผลจำแนกเมนูของแต่ละเคสในรายการคิว — ตรงข้อมูลจริง

## Dependencies

—

## Handoff

ตรวจ AC-009.1 ด้วยการเทียบคอลัมน์กับข้อมูลเคสจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
เพิ่มคอลัมน์ — ลบรายคอลัมน์คืนได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
