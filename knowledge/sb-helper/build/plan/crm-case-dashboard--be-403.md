# BE-403 — insights.repository.ts CRUD on TCrmKnowledgeEntry

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P4-03`

## Goal

service/repository กลาง `insights.repository.ts` — CRUD บน `TCrmKnowledgeEntry` (`Category=INSIGHT_*`, create default `Status=DRAFT`, update bump `Version`+set `SupersededById` chain ตามธรรมเนียมตาราง, delete = `Status=ARCHIVED` soft เท่านั้น) — workflow ของตารางเดิม (DRAFT/APPROVED + SupersededById) ต้องถูกใช้ให้ตรง — soft delete เท่านั้น ห้ามลบแถว

## References

REQ-006, AC-006.2, DES-006

## Scope

CRUD ผ่าน repository กลางเดียว — create ตั้ง `Status=DRAFT` เสมอ · update เพิ่ม `Version` และผูก `SupersededById` · delete = set `Status=ARCHIVED` (ห้าม hard delete) · `AnswerBody` ผ่าน Zod ทุกครั้ง

- Security-sensitive: no

## Out of Scope

`TCrmKnowledgeEntry` schema · entry ของระบบอื่น (non-INSIGHT categories) · endpoint route (task ถัดไป)

## Expected Output

none

## Acceptance

AC-006.2: ข้อมูล insights ถูกเก็บบน `TCrmKnowledgeEntry` ด้วย Category `INSIGHT_*` ตาม workflow เดิม — DRAFT default, update bump version พร้อม supersede chain, ลบ = ARCHIVED เท่านั้น

## Dependencies

—

## Handoff

ตรวจ AC-006.2 ด้วยการทดสอบ CRUD จริงบน dev database (create → ได้ DRAFT, update → Version+SupersededById ถูกต้อง, delete → Status=ARCHIVED แถวยังอยู่) — เก็บผลเป็นหลักฐานก่อนปิด task
repository ใหม่ additive — ข้อมูลที่สร้างเป็นแถว DRAFT ปกติ ลบ task ไม่ทำให้ข้อมูลเสีย
ส่งต่อ reviewer

Back-links: `INDEX.md`
