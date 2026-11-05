# BE-331 — prerequisite: log KNOWLEDGE_MATCH จากเส้นทางตอบ QA

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-22`

## Goal

**prerequisite (ต้องเสร็จก่อน task detection job)**: แก้เส้นทางตอบเคส QA (จุดที่เชื่อม knowledge retrieval เข้า classify — Phase 2 เดิม, `AiCategory=QA`) ให้เขียนแถว `TCrmAiDecisionLog` ใหม่ (`SubjectType=KNOWLEDGE`, `DecisionType=KNOWLEDGE_MATCH`) ทุกครั้งที่ระบบเสนอ entry ให้ CS — `ReviewStatus=CONFIRMED` เมื่อ CS ใช้คำตอบ / `REJECTED` เมื่อ CS ตอบเอง — additive ล้วน · ถ้ายังไม่เสร็จ กฎ STALE_KNOWLEDGE ของ detection คืน 0 suggestion ไม่ใช่ error — กฎ STALE_KNOWLEDGE นับจาก log REJECTED ที่เส้นทางนี้เขียน — ไม่มี log จึงไม่มีสัญญาณให้ detection ทำงาน

## References

REQ-011, AC-011.2, DES-008, DEC-008, DES-001, DEC-001

## Scope

แตะเส้นทางตอบ QA จุดเดียวแบบ additive — เขียน log เสนอ/ใช้/ไม่ใช้ · ห้ามแตะ logic จำแนกอื่น

- Security-sensitive: no

## Out of Scope

logic จำแนกอื่นของ classify · workflow ของ `TCrmKnowledgeEntry` · แถว log เดิม

## Expected Output

none

## Acceptance

AC-011.2: ทุกครั้งที่ระบบเสนอ/คนใช้/คนไม่ใช้ความรู้ มีแถว log KNOWLEDGE_MATCH สถานะตรงพฤติกรรมจริง — สัญญาณพร้อมให้ detection อ่าน

## Dependencies

—

## Handoff

ตรวจ AC-011.2 ด้วยเคส QA จริงทั้ง 3 กรณี (เสนอ+ใช้ / เสนอ+ตอบเอง / ไม่มี entry) — เทียบแถว log — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
additive จุดเดียว — revert ได้ แต่ detection กฎ STALE_KNOWLEDGE จะคืน 0 เสมอ (เงื่อนไข prerequisite ตาม Sequencing Notes)
ส่งต่อ reviewer

Back-links: `INDEX.md`
