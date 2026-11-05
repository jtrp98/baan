---
owner: spec
---
# crm-case-dashboard — Requirement Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `business-analyst` เท่านั้น · **สถานะของ REQ อยู่ในตารางนี้เท่านั้น** · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `req-*.md` / `scope.md` ที่ packet/brief ระบุ — ห้าม ls

| REQ | ชื่อ | Status | AC ids | ไฟล์ |
|---|---|---|---|---|
| REQ-001 | 1. ภาพรวมเคส (`/pages/support/crm`) | confirmed | AC-001.1, AC-001.2, AC-001.3 | `req-001.md` |
| REQ-002 | 2. จัดกลุ่มเคสตามประเภท (`groups/[type]`) | confirmed | AC-002.1, AC-002.2, AC-002.3 | `req-002.md` |
| REQ-003 | 3. สรุปตามโรงเรียน (`schools/[schoolName]`) | confirmed | AC-003.1 | `req-003.md` |
| REQ-004 | 4. ตั้งค่า SLA (`settings/sla`) | confirmed | AC-004.1, AC-004.2 | `req-004.md` |
| REQ-005 | 5. ตั้งค่า CSAT (`settings/csat`) | confirmed | AC-005.1, AC-005.2 | `req-005.md` |
| REQ-006 | 6. รายงานเชิงลึก (`insights`) | confirmed | AC-006.1, AC-006.2, AC-006.3 | `req-006.md` |
| scope.md | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม | — | `scope.md` |

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `../../INDEX.md`
