# crm-case-dashboard — Design Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `system-analyst` เท่านั้น · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `des-*.md` / `data-model.md` ที่ packet/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · ตาราง DES ด้านล่างคือรายชื่อไฟล์ contract ทั้งหมด

## Feature-by-Feature Feasibility

| Feature / REQ | Verdict | เหตุผล / หลักฐาน (`path:line`) |
|---|---|---|
| Feature (requirement § Core Fe | สถานะ | แหล่งข้อมูลจริง |
| 1. ภาพรวมเคส (dashboard) | ตรงไปตรงมา | Aggregate server-side ทั้งหมด — `GET /api/v2/support/crm-cas |
| 2. จัดกลุ่มเคสตามประเภท + จัดอ | ตรงไปตรงมา | group ด้วย `AiCategory`, อันดับด้วย `ComputedPriorityScore`  |
| 3. สรุปตามโรงเรียน | ตรงไปตรงมา | Filter `SchoolId` + join `TCompany.sCompany` — route param เ |
| 4. ตั้งค่า SLA | ตรงไปตรงมา (display-only) | Constant `CRM_CASE_SLA_SETTING` — seed default จาก mockup ที |
| 5. ตั้งค่า CSAT | ตรงไปตรงมา (display-only) | Constant `CRM_CASE_CSAT_SETTING` + ลูปส่ง/เก็บ reuse ของเดิม |
| 6. Insights (กรอกเอง) | ตรงไปตรงมา | `TCrmKnowledgeEntry` Category `INSIGHT_*` + ฟอร์ม CRUD ของ S |

## Design Contracts

| ID | ชื่อ | Traces | ไฟล์ |
|---|---|---|---|
| DES-001 | การตัดสินใจที่ผู้ใช้ยืนยันแล้ว (2026-08-23) | — | `des-001.md` |
| DES-002 | Subsystem & Grouping Rules | — | `des-002.md` |
| DES-003 | Metrics & Ranking Rules (ห้ามตีความเอง) | — | `des-003.md` |
| DES-004 | SLA Settings Rules (display-only) | — | `des-004.md` |
| DES-005 | CSAT Rules | — | `des-005.md` |
| DES-006 | Insights Rules | — | `des-006.md` |
| DES-007 | Permission & API Surface | — | `des-007.md` |
| DES-008 | Frontend Wiring Notes (mockup → ของจริง) | — | `des-008.md` |

## ไฟล์อื่นในหมวดนี้

| ไฟล์ | เนื้อหา |
|---|---|
| `data-model.md` | schema contract |
| `modules.md` | feature group ภายใน delivery unit |
| `risks.md` | dependencies + risks |
| `archive.md` | Q&A ที่ปิดแล้ว + Change Log entries ที่ถูกแทน — verbatim |

## Unresolved Open Questions

| ID | คำถาม | ผู้ตอบ | Blocking? |
|---|---|---|---|

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `../../INDEX.md`
