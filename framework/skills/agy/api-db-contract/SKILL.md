---
name: api-db-contract
description: Use when designing or changing cross-service REST/gRPC/Event contracts, modifying database schemas, writing SQL migrations, designing indexes, or handling transactions, locking, idempotency, and rollback plans.
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "<project> [service-or-table]"
---

# 🔌 `api-db-contract` — สัญญา API ข้ามระบบและการออกแบบฐานข้อมูลอย่างปลอดภัย

ป้องกัน production incident จาก breaking contract, migration ล็อกตาราง, race condition, และข้อมูลรั่วข้าม tenant

## ขั้นตอนปฏิบัติ (Antigravity-Native)

1. **สำรวจ Producer / Consumer และ Schema จริงแบบขนาน**:
   - ใช้ `invoke_subagent` (`TypeName: "research"`) กวาดหาทั้ง **ผู้ส่ง (producer)** และ **ผู้เรียกใช้ (consumer)** ทุก target repo ที่เกี่ยวข้อง (เช่น Gateway, Microservice, Frontend/App) รวมถึง migration/schema ล่าสุด
2. **ตรวจเช็กลิสต์วิกฤต 6 แกน**:
   - **Contract Compatibility**: ฟิลด์ใหม่ optional หรือไม่? มี versioning หรือ backward-compat สำหรับ client เก่าหรือไม่?
   - **Normalization & Indexing**: Primary/Foreign keys, composite indexes ตรง query pattern จริง, avoid full-table scan
   - **Transaction & Concurrency**: Atomicity, Isolation level, Optimistic/Pessimistic locking เมื่อมี concurrent updates
   - **Idempotency**: ป้องกัน retry/double-submit ด้วย idempotency key หรือ unique constraint
   - **Multi-Tenant / Auth Isolation**: บังคับ filter `schoolId` / `tenantId` / `userId` จาก verified auth context เสมอ ไม่เชื่อค่าจาก client body
   - **Safe Migration & Rollback Plan**: แยก expand-contract เมื่อจำเป็น, ตรวจ table lock risk, และเตรียมสคริปต์ Rollback คู่กันเสมอ
3. **บันทึกสัญญาและล็อกประตูมนุษย์**:
   - เขียน contract / DBML / migration script ลง `<project>/features/<feature>/contracts/` (หรือ `<project>/modules/<module>/build/contracts/` และ `build/db/` สำหรับโปรเจกต์โครงสร้างเดิม)
   - แสดงผลกระทบ Trade-offs + Rollback Plan ด้วย `ask_question` ให้ผู้ใช้ตัดสินใจก่อนลงมือแก้ schema หรือ breaking contract

## กฎเหล็ก
- **ห้ามรัน SQL หรือ Migration บนฐานข้อมูลร่วมโดยไม่มีคำสั่งชัดเจนจากผู้ใช้**
- **ห้ามเดาชื่อตาราง/คอลัมน์/endpoint** — ต้องอ้างอิงจาก schema/proto/controller จริงที่อ่านเท่านั้น
