# FE-139 — backfill panel + progress

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P1-15`

## Goal

เพิ่มปุ่ม Backfill + progress indicator ในหน้า review-queue (`backfill-panel.component.tsx` — ซ่อนอัตโนมัติเมื่อ remaining=0) เรียก `POST /backfill` ทีละชุด แสดงจำนวนที่เหลือ กดซ้ำได้จนครบ — ผู้ดูแลต้องกดกวาดเคสเก่าเองแบบคุมจังหวะ — progress ที่ซ่อนเมื่อจบป้องกันการกดซ้ำโดยไม่จำเป็น

## References

REQ-007, AC-007.1, DES-004, DEC-004

## Scope

component panel เดียวบนหน้า review-queue — กด = เรียก batch แล้วรีเฟรช remaining · ยังไม่จบกดซ้ำได้

- Security-sensitive: yes

## Out of Scope

endpoint ฝั่ง BE · ส่วนอื่นของหน้าคิว

## Expected Output

none

## Acceptance

AC-007.1: กดกวาดทีละชุดจากหน้าจอได้จริง เห็นจำนวนที่เหลือลดลง และ panel ซ่อนเมื่อ remaining=0

## Dependencies

—

## Handoff

ตรวจ AC-007.1 ด้วยการกดจริงจน remaining=0 — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
component ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
