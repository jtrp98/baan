---
name: coding-pattern
description: Use before writing or modifying code to follow repository conventions, layering, error handling, validation, transaction/idempotency, and test patterns — or when capturing/updating <project>/coding-pattern.md from real canonical files.
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "[apply | capture] <project>"
---

# 📐 `coding-pattern` — มาตรฐานและแบบแผนโค้ดจริงของโปรเจกต์

คุมให้โค้ดที่เขียนใหม่กลมกลืนกับสถาปัตยกรรมและสไตล์ของ repo จริง และเก็บ `<project>/coding-pattern.md` เป็นภาษากลางสำหรับทั้ง 3 ค่าย

## โหมด 1 — Apply (ใช้ก่อนวางแผนและก่อนแก้โค้ดทุกครั้ง)

1. อ่าน `<project>/coding-pattern.md` (ถ้ายังไม่มี ให้ตรวจไฟล์ต้นแบบในเลเยอร์ที่จะแก้ก่อน 2–3 ไฟล์)
2. ตรวจให้มั่นใจว่าโค้ดที่จะเขียนสอดคล้องกับ:
   - **Layering & Boundaries**: Route/Controller → Service/UseCase → Repository/DB (ห้ามข้ามชั้น)
   - **Error Handling & Validation**: รูปแบบ DTO/Schema validation, error code/shape, ห้ามกลืน exception (no empty catch-all)
   - **Data Safety**: Transaction boundary, Idempotency key, Multi-tenant / school scoping, Optimistic/Pessimistic locking
   - **Testing Pattern**: Framework (`node:test`, `vitest`, `xUnit`, `Playwright`), naming convention, fixture style และวิธี assert (ห้าม mock ทับ logic หลักจนไม่จับบั๊กจริง)

## โหมด 2 — Capture / Refresh (สกัดจากโค้ดจริงลง `<project>/coding-pattern.md`)

1. ใช้ `invoke_subagent` (`TypeName: "research"`) อ่านไฟล์ตัวอย่างจริง 2–3 ไฟล์ต่อเลเยอร์ (API route, service, data access, UI component, test file) พร้อมกัน
2. สกัดออกมาเป็นกฎ **Do / Don't + Canonical File Path** ลง `<project>/coding-pattern.md` (บังคับ ≤ 15 KB):
   - โครงสร้างโฟลเดอร์และ Naming Convention
   - Canonical Examples (ชี้ไฟล์อ้างอิงจริงที่ดีที่สุดใน repo)
   - กฎ Error Handling, Auth/Permission Context, DB/Transaction, Logging/Observability
   - รูปแบบ Test ที่ repo ยอมรับ (รวมคำสั่งเฉพาะ เช่น `dotnet test --logger "console;verbosity=normal"`)
3. รัน `baan --lint-knowledge` เพื่อตรวจลิงก์และขนาดไฟล์
