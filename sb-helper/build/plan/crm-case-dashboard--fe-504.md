# FE-504 — LIFF CES question toggle

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-case-dashboard-P5-01`

## Goal

LIFF form อ่าน flag ใหม่แสดง/ซ่อนคำถาม CES (score/reasons/comment flow เดิมไม่แตะ) — คำถาม CES เสริมต้องเปิด/ปิดจากค่า settings โดยไม่ deploy ใหม่ทุกครั้งที่อยากซ่อน และ flow หลักของ LIFF ต้องคงเดิม

## References

REQ-005, AC-005.2, DES-005

## Scope

แก้เฉพาะการอ่าน flag และการแสดง/ซ่อนคำถาม CES — score/reasons/comment flow เดิมห้ามเปลี่ยน — ค่าที่ใช้มาจาก summary endpoint (BE-crm-case-dashboard-P5-03)

- Security-sensitive: no

## Out of Scope

endpoint ฝั่ง BE (แตะที่ BE-crm-case-dashboard-P5-03) · flow ให้คะแนนหลัก · constant

## Expected Output

none

## Acceptance

AC-005.2: LIFF form แสดง/ซ่อนคำถาม CES ตาม flag จริง — flow ให้คะแนนหลัก (ดาว/reasons/comment) ทำงานเหมือนเดิมทุกกรณี

## Dependencies

—

## Handoff

ตรวจ AC-005.2 ด้วย dev/LIFF: เปิด flag → คำถาม CES แสดง, ปิด flag → ซ่อน — ส่งคะแนนปกติได้ทั้งสองกรณี — เก็บผลเป็นหลักฐานก่อนปิด task
แก้เฉพาะส่วนแสดง/ซ่อน — revert ได้ ค่า default (แสดง) ตาม constant
ส่งต่อ reviewer

Back-links: `INDEX.md`
