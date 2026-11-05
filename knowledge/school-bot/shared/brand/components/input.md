---
owner: design
---
# ช่องพิมพ์

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (แตกจาก brand.md ของ sketchbook ให้อ่านได้ทีละไฟล์)
> ใช้ที่: ช่องพิมพ์ทุกชนิด (ชื่องาน · ตัวแก้โค้ด · ช่องส่งของ Output · ฟอร์ม)

- ข้อความ ≥ 16px · `radius-md` (ช่องเล็ก `radius-sm`)
- **focus เฉพาะเมื่อเข้าด้วยคีย์บอร์ด (Tab):** ขอบ `border-default` `action-primary` + วงนอก 3px `action-primary-halo` (ตกแต่ง)
- **คลิกด้วยเมาส์ = ไม่มีขอบ/วง** เหลือเคอร์เซอร์เป็นตัวบอก
- **พิมพ์ตัวอักษรแรกแล้ววงหาย** (แม้เข้าด้วย Tab)
- ต้องจำ modality ล่าสุด (keydown vs pointerdown) เพราะเบราว์เซอร์นับคลิกช่องพิมพ์เป็น focus-visible
- ไม่ใช้สีส้มกับ focus ใด ๆ (focus เป็น `action-primary` ทุกที่ · [tokens.md](../tokens.md))

ยังไม่มีแบบ: ฟอร์มเต็ม (ช่องกรอก · combobox ค้นหา · ข้อความ error ใต้ช่อง) = DSG-04 ดู [gaps.md](../gaps.md)
