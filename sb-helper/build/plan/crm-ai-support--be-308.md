# BE-308 — POST /menu-relations (DECLARED)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-08`

## Goal

เพิ่ม `POST /api/v2/support/crm-ai/menu-relations` — สร้างแบบ `Source=DECLARED` เท่านั้นในรอบนี้ (`CRM_AI_SA`/`CRM_AI_UX_UI`) — ตั้ง `Status=CONFIRMED` ทันทีพร้อม `ConfirmedBy`/`ConfirmedAt` ตาม design ข้อ 2(ก) — คนประกาศความสัมพันธ์เองเริ่ม CONFIRMED ทันที — แยกจากแถว AI_SUGGESTED ที่ต้องรอยืนยัน

## References

REQ-014, AC-014.1, AC-014.2, DES-007, DEC-007

## Scope

create เฉพาะ `Source=DECLARED` — สิทธิ์ SA/UX-UI · ตั้ง CONFIRMED พร้อมตัวตนผู้ยืนยัน ห้ามรับสถานะจาก client

- Security-sensitive: no

## Out of Scope

แถว AI_SUGGESTED (สร้างเฉพาะจาก accept suggestion ตามสัญญา) · schema · permission constant

## Expected Output

none

## Acceptance

AC-014.1: สร้างความสัมพันธ์แบบ DECLARED ได้จริง — `RelationType` อยู่ใน 3 ค่าที่กำหนด
AC-014.2: แถว DECLARED เริ่ม CONFIRMED พร้อมผู้ยืนยัน — แยกชัดจาก AI_SUGGESTED

## Dependencies

—

## Handoff

ตรวจ AC-014.1/AC-014.2 ด้วย dev server: สร้างสำเร็จ + 403 non-SA/UX-UI + สถานะเริ่มต้นถูกต้อง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
