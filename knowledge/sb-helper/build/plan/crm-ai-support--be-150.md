# BE-150 — อัปเดต spec ของ crm-sla-rule

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-34`

## Goal

อัปเดต `_docs/create-spec.md`/spec ที่เกี่ยวข้องของ `crm-sla-rule.constant.ts` ให้ตรงสูตร v2 — spec ที่ยังอ้าง v1 ทำให้ engineer/QA คนถัดไป implement ผิดสูตร — เอกสารต้องตามสัญญาที่ใช้จริง

## References

REQ-003, AC-003.1, DES-005, DEC-005

## Scope

แตะเอกสารเท่านั้น — เขียนตาม endpoint/constant ที่ implement แล้ว ไม่แก้โค้ด

- Security-sensitive: yes

## Out of Scope

โค้ดใด ๆ (งานนี้เอกสารเท่านั้น) · spec ของ area อื่น

## Expected Output

none

## Acceptance

AC-003.1: spec ระบุสูตร v2 ครบ (น้ำหนัก/ตัวคูณ 4 ช่วง/กรณีขอบ) ตรง constant จริง — ผู้อ่าน implement ต่อได้โดยไม่ต้องเดา

## Dependencies

—

## Handoff

ตรวจ AC-003.1 ด้วยการเทียบ spec กับ constant จริงทีละค่า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
เอกสารเท่านั้น — revert ปลอดภัย
ส่งต่อ reviewer

Back-links: `INDEX.md`
