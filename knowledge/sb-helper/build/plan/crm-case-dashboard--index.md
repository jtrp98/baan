# crm-case-dashboard — Plan Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` — **ผู้เขียนคอลัมน์ Status ตามโหมด:** PM = แถวใหม่ `pending` · orchestrated = orchestrator คัดลอกจาก verdict ของ `qa-engineer` · solo = `qa-engineer` เขียนเอง · ค่า `pending`/`verified`/`blocked` เท่านั้น · Depends อยู่ที่ตารางนี้แหล่งเดียว · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `<task-id>.md` ที่ packet/brief ระบุ — ตาราง Tasks ด้านล่างคือแหล่งสถานะเดียว

## Release Scope

**Release:** R1
**อยู่ใน release:** BE-101, BE-102, BE-103, BE-104, FE-105, FE-106, FE-107, BE-201, BE-202, BE-203, BE-204, BE-205, FE-206, FE-207, FE-208, BE-301, BE-302, BE-303, BE-304, FE-305, FE-306, FE-307, FE-308, BE-401, BE-402, BE-403, BE-404, BE-405, BE-406, BE-407, FE-408, FE-409, BE-501, BE-502, BE-503, FE-504, BE-505
**Done เมื่อ:** ทุก task verified และ deploy เรียบร้อย

## Waiting on Human

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน | ขวาง task |
|---|---|---|---|---|

## Phases

| Phase | ชื่อ | Tasks | หมายเหตุ |
|---|---|---|---|
| 1 | Constants & Settings Pages (display-only) | BE-101, BE-102, BE-103, BE-104, FE-105, FE-106, FE-107 | — |
| 2 | Dashboard Aggregation API + Wiring | BE-201, BE-202, BE-203, BE-204, BE-205, FE-206, FE-207, FE-208 | — |
| 3 | Groups & Schools Drill-down | BE-301, BE-302, BE-303, BE-304, FE-305, FE-306, FE-307, FE-308 | — |
| 4 | Insights (TCrmKnowledgeEntry `INSIGHT_*`) | BE-401, BE-402, BE-403, BE-404, BE-405, BE-406, BE-407, FE-408, FE-409 | — |
| 5 | CSAT Loop Enhancements (reuse ลูปเดิม) | BE-501, BE-502, BE-503, FE-504, BE-505 | — |

## Tasks



ตาราง task, module, Depends และ Status อยู่ที่ [แผนรวม](INDEX.md#tasks) ที่เดียว
## Sequencing Notes

-

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `../../modules/crm-case-dashboard/INDEX.md`
