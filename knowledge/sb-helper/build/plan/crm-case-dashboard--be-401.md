# BE-401 — prerequisite: INSIGHT_% filter at crm-ai-support retrieval

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P4-01`

## Goal

**prerequisite (ต้องเสร็จก่อน task APPROVED แรกของ insights)**: แก้ knowledge retrieval ของ crm-ai-support (จุดที่ query `Status=APPROVED` ไปตอบ QA — Phase 2 ของ crm-ai-support) เพิ่ม filter `Category NOT LIKE 'INSIGHT_%'` — additive 1 จุด ประสาน owner crm-ai-support + อัปเดต spec ฝั่งนั้นด้วย (กัน insight โดนดึงไปตอบคำถามลูกค้า) — ถ้าไม่กรอง entry `APPROVED` ของ insights จะถูกดึงไปตอบคำถามลูกค้าผ่าน QA retrieval (knowledge pollution — design Risk 5) จึงเป็นเงื่อนไขบังคับก่อนปล่อย insights ใช้จริง

## References

REQ-006, AC-006.2, DES-006, DEC-006

## Scope

แตะโค้ด crm-ai-support จุดเดียวแบบ additive (เพิ่มเงื่อนไข filter) — ต้องประสาน owner crm-ai-support และอัปเดต spec ฝั่งนั้นให้ตรง — จนกว่า filter จะ deploy ให้คง entry ไว้ `DRAFT` เท่านั้น

- Security-sensitive: no

## Out of Scope

logic อื่นของ crm-ai-support นอกจากจุด filter เดียว · `TCrmKnowledgeEntry` schema · entry ที่เป็น knowledge ปกติ (non-INSIGHT)

## Expected Output

none

## Acceptance

AC-006.2: retrieval ของ crm-ai-support ไม่ดึง entry ที่ `Category` ขึ้นต้น `INSIGHT_` ไปตอบ QA อีกต่อไป ในขณะที่ entry ปกติยังถูกดึงเหมือนเดิม

## Dependencies

—

## Handoff

ตรวจ AC-006.2 ด้วยการรัน retrieval กับชุดข้อมูลที่มีทั้ง knowledge ปกติและ INSIGHT_* — INSIGHT ต้องไม่ปรากฏในคำตอบ — บันทึกการประสาน owner + spec ที่อัปเดตเป็นหลักฐานก่อนปิด task
filter เป็นเงื่อนไขเพิ่มจุดเดียว — revert ได้ทันที แต่ต้องไม่ revert หลังเริ่ม `APPROVED` ใช้จริงโดยไม่มีทางเลือกกัน pollution
ส่งต่อ reviewer

Back-links: `INDEX.md`
