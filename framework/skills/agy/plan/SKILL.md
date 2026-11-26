---
name: plan
description: Use before implementing any multi-file feature, architecture change, or complex task to run parallel context exploration, clarify requirements, apply the 8-question Decision Quality Gate, design AC-to-test mapping, and get explicit user approval via Plan Artifact.
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "<project> <goal>"
---

# 🧭 `plan` — วางแผนแบบ Explore → Challenge → Approve ก่อนลงมือทำ

ยึดหลัก Plan-First และ Learning Protocol (`LEARNING.md`) เพื่อป้องกันการแก้ผิดจุด Overengineering และ Context Bloat

## ขั้นตอนปฏิบัติ (Antigravity-Native 4 จังหวะ)

1. **Parallel Explore (รักษา Context ตัวหลักให้สะอาด)**:
   - ใช้ `invoke_subagent` (`TypeName: "research"` หรือ `Model: "flash"`) อ่านเอกสารกลาง (`<project>/INDEX.md`, `repo-map.md`, `coding-pattern.md`, `ui-design-system.md`) และโค้ดจริงใน `target/` พร้อมกัน
   - หากยังไม่มี `repo-map.md` หรือพบว่าล้าสมัย ให้เรียก `repo-map` (หรือ `baan survey --target <name> --json`) ก่อน
2. **Clarify & Challenge (อย่าเดาและอย่าเออออตาม)**:
   - ใช้ `ask_question` ถามจุดที่ยังคลุมเครือ (Goal & Out-of-Scope, Actors & Permissions, Edge Cases, Idempotency, Failure States)
   - สำหรับการตัดสินใจทางสถาปัตยกรรมสำคัญ ให้ผ่าน **Decision Quality Gate (8 คำถาม)** และ **Learning Protocol** ใน `LEARNING.md`: เสนออย่างน้อย 2 ทางเลือกพร้อม Trade-offs, อธิบายศัพท์เทคนิค, และแย้งด้วยหลักฐานหากพบความเสี่ยง
3. **Plan Artifact + AC ↔ Test Matrix**:
   - สร้าง Implementation Plan Artifact (`RequestFeedback: true`) โดยระบุ:
     - ขอบเขตไฟล์ที่จะแก้ (`owns`) และผลกระทบข้ามโมดูล
     - Acceptance Criteria (AC#) พร้อม source ที่ชัดเจน
     - **AC ↔ Test Strategy Matrix**: ระบุเทสต์สำหรับ Happy Path, Boundary/Null, Auth/Tenant, Concurrency/Idempotency และ Failure Simulation
     - **Rollback / Failure Recovery**
   - บันทึกแผนลง `<project>/features/<feature>/plan.md` (หรือ `<project>/modules/<module>/` ในโปรเจกต์เดิม) และ ADR ลง `<project>/decisions/ADR-xxx.md` เมื่อมีการตัดสินใจสถาปัตยกรรมสำคัญ
4. **รอการอนุมัติแล้วเลือก Execution Engine**:
   - **ห้ามแก้ไขโค้ด production ก่อนผู้ใช้เห็นชอบแผน**
   - หลังอนุมัติ:
     - *รันบน Antigravity Native*: ใช้ `update_steps` + `invoke_subagent` / `run_workflow` (ยึด **1 writer ต่อ repo**) + `verify-before-done`
     - *รันผ่าน BAAN Core*: เมื่อต้องการ cross-provider verifier (`claude`/`codex`) หรือ repo lock ให้สร้าง `packet.json` และสั่ง `baan run`
