# BE-303 — GET /cases/[id] case detail

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P3-03`

## Goal

`GET /api/v2/support/crm-case/cases/[id]` — header + thread (`TCrmSupportComment` sort CreateDate asc) + CSAT ของเคส (`TCrmFeedback` dedupe) + assignee (tAdmin FirstName/LastName) + assessment ✅ — หน้ารายละเอียดเคสต้องได้ข้อมูลครบชุดเดียวจาก endpoint เดียว เพื่อให้ drill-down ถึงเคสเดี่ยวจบใน payload เดียว

## References

REQ-002, AC-002.3, DES-002, DES-007

## Scope

thread เรียง `CreateDate` asc — CSAT เคสต้อง dedupe ต่อเคสก่อนใช้ (ตาราง feedback ไม่มี unique constraint) — timeline ใช้ timestamp ที่มีจริงเท่านั้น

- Security-sensitive: no

## Out of Scope

สคีมา/ตาราง (อ่านอย่างเดียว) · endpoint อื่นของโมดูล

## Expected Output

none

## Acceptance

AC-002.3: รายละเอียดเคสเดี่ยวคืบ header/thread/CSAT/assignee ครบ — ใช้ไปเป็น message thread, timeline, ผู้รับผิดชอบ และคะแนน CSAT ของเคสนั้นได้

## Dependencies

—

## Handoff

ตรวจ AC-002.3 ด้วยการเรียก endpoint กับเคสที่มี/ไม่มี feedback ซ้ำ — เทียบโครง response + tsc/eslint (verified แล้วตามแถวเดิม)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
