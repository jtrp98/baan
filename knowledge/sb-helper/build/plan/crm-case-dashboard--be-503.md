# BE-503 — feedback summary returns CES flag/scale

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P5-03`

## Goal

ขยาย `GET .../feedback` (summary endpoint เดิม) คืน `cesQuestionEnabled`/scale จาก constant ให้ LIFF `/liff/crm-feedback` ใช้ซ่อน/แสดงคำถามเสริม — additive field ไม่ break consumer เดิม — LIFF ต้องอ่าน flag/scale จากค่าเดียวกับ settings โดยไม่แตะ constant ตรง ๆ และ consumer เดิมของ endpoint ต้องไม่พัง

## References

REQ-005, AC-005.2, DES-005, DES-007

## Scope

เพิ่ม field ใน response เดิมแบบ additive เท่านั้น — ค่ามาจาก CSAT constant เสมอ — ไม่เปลี่ยน field/รูปร่างเดิมของ response

- Security-sensitive: no

## Out of Scope

field เดิมของ response · LIFF form (task FE-crm-case-dashboard-P5-01) · constant

## Expected Output

none

## Acceptance

AC-005.2: LIFF ได้ flag/scale จาก endpoint เดิมเพิ่มเติมโดย consumer เดิมของ endpoint ยังทำงานเหมือนเดิมทุกจุด

## Dependencies

—

## Handoff

ตรวจ AC-005.2 ด้วยการเรียก endpoint เทียบ response เดิม (ไม่หาย field) + field ใหม่ตรง constant + consumer เดิมยัง parse ได้ — เก็บผลเป็นหลักฐานก่อนปิด task
additive field — revert ได้โดย consumer เดิมไม่เคยรู้สึก
ส่งต่อ reviewer

Back-links: `INDEX.md`
