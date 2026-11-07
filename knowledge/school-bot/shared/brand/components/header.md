---
owner: design
---
# แถบบน (header)

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (แตกจาก brand.md ของ sketchbook ให้อ่านได้ทีละไฟล์)
> ใช้ที่: ทุก lab (Arm Lab, Block Lab) — เหมือนกันทุก lab (OQ109, OQ118)

แถบเดียวรวมแถบหน้าต่าง (ไม่มีแถบหน้าต่างแยก) · แบบเครื่องมือมืออาชีพ (Figma): โลโก้เล็ก ปุ่มไอคอนล้วน + tooltip ให้พื้นที่ทำงานเด่นที่สุด

- สูง 60 · padding 0 `space-6` · พื้น `surface` · ขอบล่าง `border-default` `border` · gap `space-3`
- **ลำดับซ้าย → ขวา:** ปุ่ม home › ปุ่ม ☰ › tab โหมดไอคอนล้วน ([tabs.md](tabs.md)) › โลโก้ › │ › พื้นที่ว่างยืด › │ › ปุ่ม "เปลี่ยน" + ชิปอุปกรณ์ › │ › ชื่องาน + สถานะบันทึก ([job-title.md](job-title.md)) › │ › ปุ่มหน้าต่าง ([window-buttons.md](window-buttons.md))
- **เส้นคั่น │ = `border-thin` `border` สูงเต็มแถบ 60** (บนจรดล่าง) — ส่วนหัวเป็นช่อง ๆ คั่นด้วยเส้นเต็มความสูง
- popover ที่เปิดจากส่วนหัวอยู่ `z-popover` เหนือเนื้อหาทั้งหมด

## ชิ้นส่วน

| ชิ้น | ค่า |
|---|---|
| ปุ่ม home | 44×44 · ไอคอน `house` · กลับหน้าหลักที่อยู่ก่อนเข้า lab · ผ่าน leave guard (งานยังไม่บันทึก/กำลังส่งลงบอร์ด) · tooltip "หน้าหลัก" |
| ปุ่ม ☰ | 44×44 · `radius-md` · ขอบ `border-default` `border-strong` · พื้น `surface` · ไอคอน `icon-md` · เปิดอยู่: พื้น+ขอบ `action-primary` ไอคอนขาว |
| โลโก้ | ย่อสัดส่วน (Block Lab: sketchbook `projects/school-bot/assets/logo/block-lab-logo.svg` และกลุ่ม Logos ของ Design System) · ขนาดจริงให้ designer เสนอ · ชื่อทางการ "School Bot Studio · Arm Lab · Block Lab" |
| ชิปอุปกรณ์ | **ไม่มีกรอบ** ([chip.md](chip.md) แบบไม่มีกรอบ) · พฤติกรรม/popover/ขั้นตอนเชื่อมยกจาก Arm Lab ครบ (OQ160) · ปุ่ม "เปลี่ยน" แยกอยู่ข้างชิป |
| สถานะคลาวด์ | แสดงที่ส่วนหัวที่เดียว · ชิปขึ้นเฉพาะตอนผิดปกติ |

หมายเหตุ: canvas Arm Lab (`WindowBarV1`, `MainV6A`) ยังเป็นแบบเก่า 44 + 856 จนกว่าจะเปิด CR แก้


## โลโก้ประจำส่วน (3 ชุด)
- School Bot Studio: `design/assets/logo/School Bot.svg`
- Arm Lab: `design/assets/logo/Arm Lab.svg`
- Block Lab: `design/assets/logo/block-lab-logo.svg`
