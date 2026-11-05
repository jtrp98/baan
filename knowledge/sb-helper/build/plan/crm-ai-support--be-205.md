# BE-205 — GET /issues/[id] detail

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P2-05`

## Goal

เพิ่ม `GET /api/v2/support/crm-ai/issues/[id]` — รายละเอียดเรื่อง + เคสที่ผูกอยู่ (join ผ่าน `TCrmCaseAiAssessment.IssueId` ที่ app layer เพราะ DB นี้ไม่มี FK) — drill-down เรื่อง → เคสต้องได้จาก endpoint เดียว — join ที่ app layer ตามธรรมเนียม DB ที่ไม่ใช้ FK

## References

REQ-010, AC-010.1, DES-008, DEC-008

## Scope

read endpoint — รวมรายการเคสที่ผูกผ่าน assessment · ไม่แตะข้อมูลต้นทาง

- Security-sensitive: no

## Out of Scope

schema · เคส/assessment (อ่านอย่างเดียว) · endpoint อื่น

## Expected Output

none

## Acceptance

AC-010.1: รายละเอียดเรื่อง + เคสที่ผูกอยู่คืบครบใน payload เดียว — เคสที่ถูกติดป้ายซ้ำยังถูกนับตามปกติ

## Dependencies

—

## Handoff

ตรวจ AC-010.1 ด้วย dev server: เรื่องที่มี/ไม่มีเคสผูก — เทียบ payload — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
