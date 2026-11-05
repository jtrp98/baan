# FE-214 — issue-link-case modal

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P2-03`

## Goal

`_components/issue-link-case-modal.component.tsx` — ผูกเคสเข้าเรื่อง — การผูกเคสเป็น action ของ SA/PM บนหน้าจอ — ต้องมี modal เดียวชี้เป้าเคสและเรื่องชัดเจน

## References

REQ-010, AC-010.1, DES-008, DEC-008

## Scope

modal เดียว — เรียก link-case endpoint ผ่าน service ของหน้า

- Security-sensitive: no

## Out of Scope

endpoint ฝั่ง BE · drawer/ตาราง (task อื่น)

## Expected Output

none

## Acceptance

AC-010.1: ผูกเคสเข้าเรื่องจากหน้าจอได้จริง — เคสปรากฏในรายการของเรื่องหลังผูก

## Dependencies

—

## Handoff

ตรวจ AC-010.1 ด้วยการผูกจริงผ่าน modal — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
component ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
