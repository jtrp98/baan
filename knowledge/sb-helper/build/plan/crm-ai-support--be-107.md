# BE-107 — POST /safety-keywords

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-07`

## Goal

เพิ่ม `POST /api/v2/support/crm-ai/safety-keywords` — สร้าง safety keyword (guard `auth()` + `CRM_AI_SA`/`CRM_AI_PM`) — SA/PM ต้องเพิ่มคำสำคัญความเสี่ยงได้เองโดยไม่แก้โค้ด — safety override จึงตามของจริงได้ทันที

## References

REQ-004, AC-004.1, DES-001, DEC-001

## Scope

route/service ตาม pattern ของโมดูล — write สงวน `CRM_AI_SA`/`CRM_AI_PM` · error ผ่าน `handleError(err, "[CRM_AI_...]")` · ไม่แตะ schema

- Security-sensitive: yes

## Out of Scope

กติกาบังคับ BUG ที่ classify (จัดการที่ BE-crm-ai-support-P1-11) · schema/ตาราง · permission เดิม

## Expected Output

none

## Acceptance

AC-004.1: เพิ่มคำสำคัญความเสี่ยงผ่าน endpoint ได้จริงโดยเฉพาะผู้มีสิทธิ์ SA/PM — คำสำคัญใหม่มีผลกับการจำแนกเคสถัดไปทันที

## Dependencies

—

## Handoff

ตรวจ AC-004.1 ด้วย dev server: สร้าง keyword สำเร็จ + 401/403 เมื่อสิทธิ์ไม่พอ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้ ไม่กระทบ endpoint อื่น
ส่งต่อ reviewer

Back-links: `INDEX.md`
