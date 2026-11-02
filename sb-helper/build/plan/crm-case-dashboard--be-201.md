# BE-201 — dashboard endpoint scaffold

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P2-01`

## Goal

scaffold `src/app/api/v2/support/crm-case/dashboard/route.ts` + `dashboard.repository.ts` + `dashboard.schema.ts` (Zod query: `from`/`to` `z.coerce.date()` optional default 30 วัน) + `dashboard.service.ts` — guard `MENU_SUPPORT_CRM` — verify 2026-08-24 (401 guard ถูกต้อง, tsc/eslint ผ่าน) — ทุก KPI ต้อง aggregate server-side ที่ route เดียวนี้ — scaffold คือจุดที่เมตริกทั้งหมดจะถูกประกอบ

## References

REQ-001, AC-001.1, DES-003, DES-007, DEC-003

## Scope

สร้างโครง route/repository/schema/service ตาม pattern v2 — query รับ `from`/`to` optional (default 30 วัน) ผ่าน `z.coerce.date()` — ยังไม่ implement สูตรเมตริก (อยู่ที่ task ถัดไปของเฟสนี้)

- Security-sensitive: no

## Out of Scope

สูตรเมตริกใน task อื่นของเฟสนี้ · สคีมา/ตาราง · route ของโมดูลอื่น

## Expected Output

Contract:CrmCaseDashboardApi.v1

## Acceptance

AC-001.1: endpoint พร้อมรับช่วงวันที่และคืน payload โครงสร้างเดียวสำหรับทุกการ์ดของหน้าภาพรวม (เนื้อค่าจะตามจาก task เมตริก)

## Dependencies

—

## Handoff

ตรวจ AC-001.1 ด้วย dev server: 401 เมื่อไม่ผ่าน guard + response โครงถูกต้อง + tsc/eslint — บันทึกแล้ว 2026-08-24
ไฟล์ scaffold ใหม่ทั้งหมด — revert รายไฟล์ได้ ไม่มี consumer ภายนอกยัง wire
ส่งต่อ reviewer

Back-links: `INDEX.md`
