# BE-110 — DELETE /safety-keywords/[id]

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-10`

## Goal

เพิ่ม `DELETE /api/v2/support/crm-ai/safety-keywords/[id]` — คำสำคัญที่สร้างผิดต้องลบออกได้โดยเฉพาะผู้มีสิทธิ์ — คงปุ่มเดียวจบสำหรับข้อมูลสกปรกก่อนถูกใช้จริง

## References

REQ-004, AC-004.1, DES-001, DEC-001

## Scope

delete เฉพาะแถว keyword — guard `CRM_AI_SA`/`CRM_AI_PM` เดียวกับ write อื่นของ area นี้

- Security-sensitive: yes

## Out of Scope

แถว `TCrmAiDecisionLog` (append-only แตะไม่ได้เลย) · schema · endpoint อื่น

## Expected Output

none

## Acceptance

AC-004.1: ลบคำสำคัญที่ผิดผ่าน endpoint ได้โดยเฉพาะผู้มีสิทธิ์ — คำสำคัญที่ถูกลบไม่มีผลกับการจำแนกอีก

## Dependencies

—

## Handoff

ตรวจ AC-004.1 ด้วย dev server: DELETE สำเร็จ + 403 เมื่อสิทธิ์ไม่พอ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้ (ข้อมูลที่ลบอยู่ใน DB backup ปกติ)
ส่งต่อ reviewer

Back-links: `INDEX.md`
