---
owner: design
---
# สถานะเลือก

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (แตกจาก brand.md ของ sketchbook ให้อ่านได้ทีละไฟล์)
> ใช้ที่: การ์ด · แถว · รายการที่เลือกข้อมูล (ไม่ใช่รายการนำทาง — ดู [tabs.md](tabs.md))

| สถานะ | หน้าตา |
|---|---|
| เลือก (ต้นแบบ: การ์ดท่าใน Arm Lab) | ขอบ `border-selected` `action-primary` + พื้น `action-primary-subtle` · วงนอก 3px `action-primary-halo` ตกแต่งได้ (ห้ามเป็นตัวบอกเดียว) |
| เลือกหลายรายการ (ท่าชุด) | ขอบ `border-selected` `group` + พื้น `group-bg` |
| ไม่ได้เลือก | ขอบ `border-default` `border` (การ์ดกดได้ ขอบล่าง `raise`) |
| hover รายการเมนู/แถว | พื้น `action-primary-subtle` |


## การ์ดและ Tab นำทาง (DSG-20)
- การ์ดกดได้ทั้งหมด (งาน, Level, งานล่าสุด, อุปกรณ์) มีขอบล่างนูน raise 4px ทุกใบ
- รายการนำทางแนวตั้งใช้รูปแบบ Tab (พื้น surface ขาว + เงาเบา DSG-20)
