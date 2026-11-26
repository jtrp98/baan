---
name: coding-pattern
description: Use before writing or modifying code to follow repository conventions (layering, error handling, validation, transaction/idempotency, test style) — or when capturing/updating <project>/coding-pattern.md from real canonical files.
argument-hint: "[apply | capture] <project>"
metadata:
  author: baan
  version: "1.0.0"
---

# 📐 `coding-pattern` — มาตรฐานและแบบแผนโค้ดจริงของโปรเจกต์

คุมให้โค้ดใหม่กลมกลืนกับสถาปัตยกรรมและสไตล์ของ repo จริง และเก็บ `<project>/coding-pattern.md` เป็นภาษากลางของทั้ง 3 ค่าย

## โหมด 1 — Apply (ก่อนวางแผนและก่อนแก้โค้ดทุกครั้ง)

1. อ่าน `<project>/coding-pattern.md` (ถ้ายังไม่มี ให้อ่านไฟล์ต้นแบบในเลเยอร์ที่จะแก้ 2–3 ไฟล์ก่อน)
2. ตรวจว่าโค้ดที่จะเขียนสอดคล้องกับ:
   - **Layering & Boundaries**: Route/Controller → Service/UseCase → Repository/DB (ห้ามข้ามชั้น)
   - **Error Handling & Validation**: รูปแบบ DTO/Schema validation, error code/shape, ห้ามกลืน exception (no empty catch-all)
   - **Data Safety**: transaction boundary, idempotency key, multi-tenant / school scoping, locking
   - **Testing Pattern**: framework (`node:test`, `vitest`, `xUnit`, `Playwright`), naming, fixture และวิธี assert (ห้าม mock ทับ logic หลักจนจับบั๊กจริงไม่ได้)
3. ถ้า pattern ในเอกสารขัดกับโค้ดจริง ให้ยึดโค้ดจริงที่ผ่านเทสต์ แล้วแจ้งผู้ใช้ว่าเอกสาร drift (อย่าแก้เงียบๆ)

## โหมด 2 — Capture / Refresh (สกัดจากโค้ดจริงลง `<project>/coding-pattern.md`)

1. ส่ง `Agent` ชนิด `scout` ขนานกันใน message เดียว ให้อ่านไฟล์ตัวอย่างจริง 2–3 ไฟล์ต่อเลเยอร์ (API route, service, data access, UI component, test)
2. สกัดเป็นกฎ **Do / Don't + Canonical File Path** (≤ 15 KB):
   - โครงสร้างโฟลเดอร์และ naming convention
   - Canonical examples (ชี้ไฟล์อ้างอิงที่ดีที่สุดใน repo)
   - กฎ error handling, auth/permission context, DB/transaction, logging
   - รูปแบบเทสต์ที่ repo ยอมรับ พร้อมคำสั่งจริง
3. ให้ `scribe` เขียนไฟล์ตามโครงที่ผู้ใช้เห็นชอบ แล้วรัน `baan --lint-knowledge`
