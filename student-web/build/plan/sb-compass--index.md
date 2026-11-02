# sb-compass — Plan Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` — **ผู้เขียนคอลัมน์ Status ตามโหมด:** PM = แถวใหม่ `pending` · orchestrated = orchestrator คัดลอกจาก verdict ของ `qa-engineer` · solo = `qa-engineer` เขียนเอง · ค่า `pending`/`verified`/`blocked` เท่านั้น · Depends อยู่ที่ตารางนี้แหล่งเดียว · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `<task-id>.md` ที่ packet/brief ระบุ — ตาราง Tasks ด้านล่างคือแหล่งสถานะเดียว

## Release Scope

**Release:** R1
**อยู่ใน release:** BE-001, BE-002, BE-003, BE-013, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012, BE-014, BE-015, BE-016, BE-017, BE-018, BE-019, FE-001, FE-002
**Done เมื่อ:** ทุก task verified และ deploy เรียบร้อย

## Waiting on Human

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน | ขวาง task |
|---|---|---|---|---|

## Phases

| Phase | ชื่อ | Tasks | หมายเหตุ |
|---|---|---|---|
| 1 | Module A — Score Aggregation (REQ-012) | BE-001, BE-002, BE-003 | — |
| 2 | Module B — Premium Entitlement & API Authorization (REQ-013, REQ-014, REQ-015) 🔒 Security gate | BE-013, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012 | 🔒 security gate |
| 3 | Module C — National Stats Alignment (REQ-004 × REQ-012 + REQ-017 + DES-012) | BE-014, BE-015, BE-016, BE-017 | — |
| 4 | Module D — Premium Subject Breakdown (REQ-016) | BE-018, BE-019, FE-001 | — |
| 5 | MyCompass Consolidation — Wording Scope Only (REQ-019, WORD-01 extension) 🔒 Security gate n/a | FE-002 | 🔒 security gate |

## Tasks



ตาราง task, module, Depends และ Status อยู่ที่ [แผนรวม](INDEX.md#tasks) ที่เดียว
## Sequencing Notes

-

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `../../modules/sb-compass/INDEX.md`
