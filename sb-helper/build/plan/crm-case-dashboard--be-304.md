# BE-304 — GET /schools + /schools/[schoolId]

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P3-04`

## Goal

`GET /api/v2/support/crm-case/schools` — list โรงเรียนที่มีเคส (pagination, join `TCompany.sCompany` app-layer) · `GET .../schools/[schoolId]` — สรุปโรงเรียน + เคส pagination ✅ verify tsc/eslint/401 (2026-08-24) — ⚠️ frontend wiring ของ groups/schools ยังค้าง (mockup pages ยัง render mock) — มุมมองตามโรงเรียนต้องใช้ id ที่เทียบกับ `TCompany` ได้จริง และ list/summary ทุกใบต้อง pagination บังคับ

## References

REQ-003, AC-003.1, DES-007

## Scope

join `TCompany.sCompany` ทำ app-layer — โรงเรียนที่ไม่ระบุ (NULL) ต้องมี label "ไม่ระบุ" ไม่หายไป — wiring ฝั่ง frontend ยังไม่เสร็จ (อยู่ Phase 3 FE tasks)

- Security-sensitive: no

## Out of Scope

สคีมา/ตาราง (อ่านอย่างเดียว) · endpoint groups

## Expected Output

none

## Acceptance

AC-003.1: เลือกโรงเรียนหนึ่งๆ แล้วดึงรายการ/สรุปเคสของโรงเรียนนั้นได้ผ่าน endpoint พร้อม pagination จริง

## Dependencies

—

## Handoff

ตรวจ AC-003.1 ด้วยการเรียกทั้ง 2 endpoint (มี/ไม่มี pagination params) + 401 guard + tsc/eslint — บันทึกแล้ว 2026-08-24
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
