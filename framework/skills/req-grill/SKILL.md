---
name: req-grill
description: ทักษะสัมภาษณ์และรีดความต้องการเชิงลึกสำหรับ BA (spec) แบบไล่ทีละกิ่งของ decision tree, ชี้นำคำถามที่ตกหล่น, ประเมินความเป็นไปได้เบื้องต้น, คัดแยก module, และตรวจผลกระทบต่อโครงสร้าง Knowledge
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "<project>/<module>"
---

# 🎤 คู่มือปฏิบัติการ BA: การรีดโจทย์และคัดแยกโมดูล (`req-grill`)

ทักษะนี้ใช้สำหรับบทบาท **`spec` (BA)** เพื่อเก็บความต้องการให้ครบถ้วน ชัดเจน ทดสอบได้ และไม่เหลือจุดคลุมเครือให้ทีมสถาปัตย์หรือทีมพัฒนาต้องเดา

## ขั้นตอนการวิเคราะห์และตั้งคำถาม (Decision-Tree Grilling)

### 1. สำรวจข้อมูลเดิมก่อนถาม
- อ่าน `<project>/INDEX.md`, `<moduleDir>/INDEX.md`, `shared/requirements/`, `shared/oq/`, และ `resolvedTickets` ที่ผู้ใช้ตอบไว้แล้ว
- หากเป็น **Delta Round (`round > 1`)**: ให้อ่าน `build/contracts/` และสรุป `build/test-plan/` ที่มีอยู่เพื่อลดการถามซ้ำเรื่องเดิม

### 2. รีดความต้องการและชี้นำคำถามที่ผู้ใช้อาจลืม
ไล่ตรวจสอบครบทั้ง 6 แกน:
1. **เป้าหมายและขอบเขต (Goal & Out-of-Scope)**: ปัญหาที่แก้คืออะไร และอะไรที่ *ยังไม่ทำ* ในรอบนี้
2. **ผู้ใช้งานและสิทธิ์ (Actors & Permissions)**: ใครทำอะไรได้บ้าง (Role, Auth, Multi-tenant isolation)
3. **Business Rules & Edge Cases**: เงื่อนไขคำนวณ ค่าขอบเขต (Boundary), null/empty, ค่าซ้ำ
4. **Data Flow & Idempotency**: ถ้ากดส่งซ้ำ / เน็ตหลุด / ทำพร้อมกัน 2 คน ต้องได้ผลอย่างไร
5. **สถานะและการจัดการ Error**: Loading / Empty / Error / Disabled / Partial failure
6. **Module Classification & Feasibility**:
   - ฟีเจอร์นี้ควรอยู่ในโมดูลปัจจุบัน หรือเป็น Cross-cutting (`_cross`) หรือควรแยกเป็นโมดูลใหม่
   - ประเมินความเป็นไปได้เบื้องต้นเทียบกับระบบรวมและข้อจำกัดที่มี

### 3. กติกาการส่งคำถาม (`Ticket & Close` ใน `baan flow`)
- เมื่อรันใน `baan flow` **ห้ามถามโต้ตอบใน terminal**
- ให้รวบรวมคำถามที่ยังขาดคำตอบเป็น `tickets` (แต่ละข้อระบุ `id`, `to: "user"`, `question`, `options` ที่แนะนำเป็นข้อแรก, และ `context` ว่าทำไมคำถามนี้ถึงสำคัญ) แล้วคืน `status: "needs_input"` เพื่อให้ตัวกลางบน Desktop App นำไปถามผู้ใช้

### 4. ตรวจผลกระทบโครงสร้าง Knowledge (`knowledge_impact`)
ตรวจสอบว่าโจทย์ใหม่นี้กระทบโครงสร้างเอกสารหรือ framework ของ Knowledge เดิมหรือไม่ (เช่น ต้องแยกโมดูล ย้ายขอบเขต module เปลี่ยน ID structure):
- หาก **ไม่กระทบ**: ตั้ง `"knowledge_impact": { "required": false, "plan": "", "affected_paths": [] }`
- หาก **กระทบ**: ตั้ง `"knowledge_impact": { "required": true, "plan": "<แผนการย้าย/แยกโมดูล และ map ID เดิมใน shared/id-map.md>", "affected_paths": [...] }` เพื่อส่งเข้าประตูอนุมัติ `G-KB-RESTRUCTURE`

### 5. บันทึกผลเมื่อข้อมูลครบ
- เขียน/อัปเดต `shared/requirements/` (`F# -> R# -> AC#` พร้อม source ต้นฉบับ) และอัปเดต `shared/requirements/INDEX.md` และ `<moduleDir>/INDEX.md`
- คืน `status: "done"` เพื่อส่งเข้าประตู `G-SPEC`
