# FE-107 — remove unused settings mock data

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-case-dashboard-P1-03`

## Goal

ลบ mock data ที่ไม่ถูกใช้แล้วของ 2 หน้า settings (sla-mock.data.ts / csat-mock.data.ts → ค่าย้ายเป็น constant แล้ว) — ลบแล้วทั้ง sla-timing-options.tsx (แทนด้วย setting-options-card.tsx ที่ settings/_components) — สัญญา wiring กำหนดให้ mock/_data ถูกลบเมื่อ wire เสร็จ เพื่อไม่ให้เหลือสองแหล่งค่า

## References

REQ-004, REQ-005, AC-004.2, AC-005.1, DES-008, DEC-008

## Scope

ลบเฉพาะไฟล์ mock ที่หน้า settings เลิกใช้แล้ว — ต้องเช็คว่าไม่มี import ค้างก่อนลบทุกไฟล์

- Security-sensitive: no

## Out of Scope

`crm-mock.data.ts` (ยังถูกใช้โดย groups/schools — อยู่ใน Phase 2/3) · หน้า settings ที่ wire แล้ว

## Expected Output

none

## Acceptance

AC-004.2: หน้า settings/sla ยังแสดงค่าจาก constant ถูกต้องหลังลบ mock
AC-005.1: หน้า settings/csat ยังแสดงค่าจาก constant ถูกต้องหลังลบ mock

## Dependencies

—

## Handoff

ตรวจ AC-004.2 และ AC-005.1 ด้วย build/tsc ผ่านหลังลบ + grep ไม่เหลือ import ค้าง — เก็บผลเป็นหลักฐาน (verified แล้วตามแถวเดิม)
ไฟล์ที่ลบอยู่ใน git history — restore รายไฟล์ได้หากพบ consumer ที่พลาด
ส่งต่อ reviewer

Back-links: `INDEX.md`
