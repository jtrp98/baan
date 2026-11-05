# sb-compass-faculty-match — Plan Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` — **ผู้เขียนคอลัมน์ Status ตามโหมด:** PM = แถวใหม่ `pending` · orchestrated = orchestrator คัดลอกจาก verdict ของ `qa-engineer` · solo = `qa-engineer` เขียนเอง · ค่า `pending`/`verified`/`blocked` เท่านั้น · Depends อยู่ที่ตารางนี้แหล่งเดียว · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `<task-id>.md` ที่ packet/brief ระบุ — ตาราง Tasks ด้านล่างคือแหล่งสถานะเดียว

## Release Scope

**Release:** R1
**อยู่ใน release:** BE-001, BE-002, BE-003, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012, BE-013, BE-014, BE-015, BE-016, BE-017, BE-018, BE-019, FE-001, FE-002, FE-003, BE-020, BE-021, FE-004, FE-005, BE-027, BE-028, BE-029, BE-504, BE-030, BE-031, BE-032, BE-033, BE-034, BE-035, BE-036, FE-007, FE-008, FE-009, FE-010, BE-040, BE-041, BE-042, BE-043, BE-044, FE-011, BE-054, FE-013, BE-045, BE-046, BE-047, BE-048, BE-049, BE-050, BE-051, BE-052, BE-053, FE-012, BE-022, BE-023, BE-024, BE-025, BE-026, FE-006, BE-037, BE-038, BE-039
**Done เมื่อ:** ทุก task verified และ deploy เรียบร้อย

## Waiting on Human

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน | ขวาง task |
|---|---|---|---|---|

## Phases

| Phase | ชื่อ | Tasks | หมายเหตุ |
|---|---|---|---|
| 1 | Module E — Shared Score Access | BE-001 | — |
| 2 | Module F — Curriculum Import Service (REQ-001, REQ-002, REQ-004) 🔒 Security gate | BE-002, BE-003, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012 | 🔒 security gate |
| 3 | Module G — Review & Approval Console (REQ-003, REQ-004) 🔒 Security gate | BE-013, BE-014, BE-015, BE-016, BE-017, BE-018, BE-019, FE-001, FE-002, FE-003 | 🔒 security gate |
| 4 | Module I-a — RIASEC Content Authoring (REQ-007, REQ-008 ฝั่งคลังข้อมูล) | BE-020, BE-021, FE-004, FE-005 | — |
| 5 | Module I-b — RIASEC Test & Quest, ฝั่งนักเรียน (REQ-007, REQ-008, REQ-012, REQ-017, REQ-018) 🔒 Security gate | BE-027, BE-028, BE-029, BE-504, BE-030, BE-031, BE-032, BE-033, BE-034, BE-035, BE-036, FE-007, FE-008, FE-009, FE-010, BE-040, BE-041, BE-042, BE-043, BE-044, FE-011, BE-054, FE-013 | 🔒 security gate |
| 6 | Module K — Cluster Determination, T-Score + RIASEC (REQ-011, REQ-013) 🔒 Security gate | BE-045, BE-046, BE-047, BE-048, BE-049, BE-050, BE-051, BE-052, BE-053, FE-012 | 🔒 security gate |
| 7 | Module H — Program Matching & Top-10 (REQ-005, REQ-006, REQ-011) 🔒 Security gate | BE-022, BE-023, BE-024, BE-025, BE-026, FE-006 | 🔒 security gate |
| 8 | Module H + I-b — Entitlement Wiring & Ownership Audit (cross-module) 🔒 Security gate | BE-037, BE-038, BE-039 | 🔒 security gate |

## Tasks



ตาราง task, module, Depends และ Status อยู่ที่ [แผนรวม](INDEX.md#tasks) ที่เดียว
## Sequencing Notes

-

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `../../modules/sb-compass-faculty-match/INDEX.md`
