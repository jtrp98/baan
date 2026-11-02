---
owner: spec
---
# ช่องว่างของ design system (DSG ที่ยังเปิด)

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (แตกจาก brand.md ของ sketchbook ให้อ่านได้ทีละไฟล์)

ของที่ยังไม่มีแบบ · module ไหนต้องใช้ ให้ออกแบบเข้า design system ก่อน (เสนอผู้ใช้อนุมัติ) แล้วค่อยใช้ในหน้า **ห้ามคิดเฉพาะหน้า**
token ที่ยังไม่อนุมัติอยู่ท้าย [tokens.md](tokens.md)

| DSG | ต้องการอะไร | ใช้ที่ module | แนวทางเริ่มต้น (Proposed) |
|---|---|---|---|
| DSG-04 | ฟอร์ม: ช่องกรอก · combobox ค้นหา · error ใต้ช่อง | app-shell, teacher-web | ตาม [components/input.md](components/input.md) + radius/border |
| DSG-05 | การ์ดคำถาม (เลือกตอบ · เรียงลำดับ · จับคู่ · สไลเดอร์) + ดาว 0–3 | quiz | แบบปุ่มนูน |
| DSG-06 | การ์ดงาน + เมนู ⋯ + ป้าย sync | app-shell, my-work | ต่อยอดการ์ดงานจาก HomeV6A |
| DSG-07 | ตารางข้อมูล + แถบตัวกรอง (ค้นหา เรียง แถวเยอะ) | teacher-web | component ใหม่ |
| DSG-08 | wizard ติดตั้ง | app-shell | layout ใหม่ ใช้ token เดิม |
| DSG-09 | ชิ้นส่วนตัวจำลองวงจร + stage | block-lab | ภาพเวกเตอร์เรียบสไตล์ไอคอน (ไม่จ้างวาด) |
| DSG-12 | `stop-dark` ขอบล่างปุ่มหยุด | ทุก lab | #8E1B1B ชั่วคราว |
| DSG-13 | 16 สีหมวดบล็อก → token `cat-*` | block-lab | ค่าอยู่ใน D1-editor |
| DSG-15 | monospace ในแอปนักเรียน | block-lab | ยังไม่ approve |
| DSG-16 | สีสถานะบนพื้นเข้ม | block-lab | ใช้เฉพาะถ้าเลือก terminal พื้นเข้ม (ไม่แนะนำ) |
| DSG-17 | พื้นเวที (stage) | arm-lab, block-lab | `background` หรือ `surface` |
| DSG-18 | ขนาด + radius ปุ่มหยุดทั้งหมด (รูปทรงสี่เหลี่ยมมนอนุมัติแล้ว) | ทุก lab | ค่าเดียว ≥ 44 |
| — | เทาอ่อน 7 เฉดในงานเดิม → token เดียวต่อความหมาย | ทุก lab | |
| — | z-index แถบหน้าต่าง (ต่ำกว่า `z-stop` · CR-10) | ทุก lab | |
| — | motion ของ quiz R18 (Attention Ring วน ≤2 รอบ) | quiz | |
| — | ไฟล์โลโก้ "School Bot Studio" | ทุกหน้า | รอเจ้าของแบรนด์ (ตอนนี้เป็นตัวอักษร) |
