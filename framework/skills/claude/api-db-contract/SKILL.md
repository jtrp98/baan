---
name: api-db-contract
description: Use when designing or changing cross-service REST/gRPC/event contracts, database schemas, SQL migrations, indexes, or transaction/locking/idempotency/rollback plans.
argument-hint: "<project> [service-or-table]"
metadata:
  author: baan
  version: "1.0.0"
---

# 🔌 `api-db-contract` — สัญญา API ข้ามระบบและการออกแบบฐานข้อมูลอย่างปลอดภัย

ป้องกัน production incident จาก breaking contract, migration ล็อกตาราง, race condition และข้อมูลรั่วข้าม tenant

## ขั้นตอนปฏิบัติ (Claude Code Native)

1. **สำรวจ Producer / Consumer และ Schema จริงแบบขนาน**:
   - ส่ง `Agent` ชนิด `scout` หลายตัวใน message เดียว กวาดหาทั้ง **producer** และ **consumer** ทุก target repo ที่เกี่ยวข้อง (Gateway, Microservice, Frontend/App) รวม migration/schema ล่าสุด — ให้คืนรายการ `file:line`
2. **ตรวจเช็กลิสต์วิกฤต 6 แกน**:
   - **Contract Compatibility**: ฟิลด์ใหม่ optional ไหม มี versioning / backward-compat ให้ client เก่าหรือไม่
   - **Normalization & Indexing**: PK/FK, composite index ตรง query pattern จริง, เลี่ยง full-table scan
   - **Transaction & Concurrency**: atomicity, isolation level, optimistic/pessimistic locking
   - **Idempotency**: กัน retry/double-submit ด้วย idempotency key หรือ unique constraint
   - **Multi-Tenant / Auth Isolation**: filter `schoolId` / `tenantId` / `userId` จาก verified auth context เสมอ ไม่เชื่อค่าจาก client body
   - **Safe Migration & Rollback Plan**: expand-contract เมื่อจำเป็น, ประเมิน table lock และเตรียม rollback script คู่กันเสมอ
3. **ให้คนตัดสินก่อนลงมือ**:
   - สรุป trade-offs + rollback plan แล้วใช้ `AskUserQuestion` (รวมคำถามเป็นชุดเดียว ทางเลือกที่แนะนำเป็นข้อแรก) ก่อนแก้ schema หรือ breaking contract
   - งานใหญ่ให้เข้า plan mode (`/plan`) แล้วขออนุมัติด้วย ExitPlanMode
4. **บันทึกสัญญาและตรวจซ้ำ**:
   - Neutral v2: `<project>/features/<feature>/contracts/` (และ ADR ที่ `<project>/decisions/ADR-xxx.md`)
   - 3-slot เดิม: `<project>/modules/<module>/build/contracts/` และ `build/db/`
   - หลังแก้ ส่ง `Agent` ชนิด `auditor` ตรวจมุม DB/concurrency/idempotency/tenant โดยส่งเฉพาะ AC, contracts, diff และ paths (หรือรัน `/code-review` เป็นมุมเสริม)

## กฎเหล็ก
- **ห้ามรัน SQL หรือ Migration บนฐานข้อมูลร่วมโดยไม่มีคำสั่งชัดเจนจากผู้ใช้**
- **ห้ามเดาชื่อตาราง/คอลัมน์/endpoint** — อ้างจาก schema/proto/controller จริงที่อ่านแล้วเท่านั้น
