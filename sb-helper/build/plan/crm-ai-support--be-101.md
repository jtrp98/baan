# BE-101 — 3 คอลัมน์จำแนกบน TCrmSupport

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-01`

## Goal

เพิ่ม 3 คอลัมน์ `MenuId` Int?, `AiCategory` String? @db.VarChar(20), `Severity` String? @db.VarChar(20) บน model `TCrmSupport` ใน `prisma/jabjai-master-single-db/schema.prisma` ตาม § Data Model — nullable ไม่มี default (NULL = ยังไม่จำแนก) — ผลจำแนกทั้ง 3 มิติต้องมีช่องเก็บบนเคสตารางเดิมโดยไม่เปลี่ยนช่องทางรับเคส และ NULL ต้องแยกจากค่าจำแนกแล้วเสมอเพื่อให้ backfill กวาดซ้ำได้ถูกเป้า

## References

REQ-002, AC-002.1, DES-001, DEC-001, DES-002, DEC-002

## Scope

แตะเฉพาะ model `TCrmSupport` ใน schema เดียว — เพิ่ม 3 คอลัมน์ nullable ตรง § Data Model ไม่แก้ field เดิม ไม่เพิ่ม relation/ตารางใหม่ (ธรรมเนียม DB นี้ไม่ใช้ FK)

- Security-sensitive: yes

## Out of Scope

model อื่นทั้งหมด · field เดิมของ `TCrmSupport` · การใส่ default ให้คอลัมน์ใหม่ (ทำให้ NULL หมายความเดียวกับ ยังไม่จำแนก ไม่ได้อีก)

## Expected Output

none

## Acceptance

AC-002.1: เคสมีช่องเก็บผลจำแนก 4 หมวดจริง (`AiCategory`) พร้อม `MenuId`/`Severity` ตาม § Data Model — โครงเก็บผลพร้อมใช้

## Dependencies

—

## Handoff

ตรวจ AC-002.1 ด้วยการเทียบ field/type ใน schema กับ § Data Model ทีละคอลัมน์ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
คอลัมน์ nullable additive — ถอนออกจาก schema แล้วตรวจซ้ำด้วย `prisma db pull` ได้ ไม่มีข้อมูลเดิมสูญ (ค่าเป็น NULL ตามธรรมชาติ)
ส่งต่อ reviewer

Back-links: `INDEX.md`
