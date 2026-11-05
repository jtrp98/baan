# BE-401 — ตรวจ model TCrmQueueInterrupt

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P4-01`

## Goal

ตรวจ model `TCrmQueueInterrupt` ตรงกับ § Data Model — สังเกต `ApprovedBy`/`Decision` เป็น `NOT NULL` ระดับ schema ทั้งคู่ แถวถูกสร้างหลังตัดสินใจแล้วเท่านั้น (ไม่มี state รออนุมัติ) — form ฝั่ง frontend รวบ justification + การตัดสินใจใน submit เดียว ไม่ออกแบบ 2 ขั้นคนละ endpoint — **ไม่เขียนแถว `TCrmAiDecisionLog` เลยไม่ว่ากรณีใด** (การอนุมัติแทรกคิวเป็นการตัดสินของคนล้วน ไม่มี `SubjectType=QUEUE_INTERRUPT` — audit ครบในคอลัมน์ของตารางเอง) — ข้อจำกัด NOT NULL และการไม่มี SubjectType เป็นเจตนาของ design — เข้าใจผิดตั้งแต่โครงจะแตกทั้ง endpoint และฟอร์ม

## References

REQ-012, AC-012.2, AC-012.3, DES-009, DEC-009

## Scope

งานยืนยัน mapping/schema เท่านั้น — บันทึกข้อสรุปเรื่อง NOT NULL + ห้ามเขียน decision log ให้งานถัดไปใช้

- Security-sensitive: no

## Out of Scope

DDL/ตารางใน DB · model อื่น · `TCrmAiDecisionLog` (ห้ามเขียนจาก flow นี้เด็ดขาด)

## Expected Output

none

## Acceptance

AC-012.2: โครงตารางบังคับผู้อนุมัติ+การตัดสินใจระดับ schema — ไม่มีแถวที่อนุมัติโดยไม่ระบุตัวตนได้
AC-012.3: โครงตารางผูกกับ `TCrmIssue` ผ่าน `CrmIssueId` (NOT NULL) ตาม § Data Model

## Dependencies

—

## Handoff

ตรวจ AC-012.2/AC-012.3 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
งานยืนยัน — ไม่มีผลข้างเคียงถ้าไม่แก้ schema
ส่งต่อ reviewer

Back-links: `INDEX.md`
