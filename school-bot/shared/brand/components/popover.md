---
owner: spec
---
# popover · เมนู · ยืนยันใกล้จุดที่กด

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (แตกจาก brand.md ของ sketchbook ให้อ่านได้ทีละไฟล์)
> ใช้ที่: popover ข้อมูล · เมนู · dropdown · popover ยืนยัน

## popover

- พื้น `surface` · ขอบ `border-thin` `border` · `radius-lg` · padding `space-4` · `shadow-float` · `z-popover`
- หัว 18/700 · ตัว 16 `lh-body` · เมตา 14 `text-secondary`
- ฉากหลังโปร่งใสคลุมจอ · ปิดด้วยแตะที่อื่นและ Esc
- เข้า `dur-move` `ease-out` จาก translateY(-4px) · ลดการเคลื่อนไหว = ไม่มี
- popover ในแถบล่างเปิดขึ้นด้านบน ไม่บังปุ่มหยุด

## เมนู (รายการกดได้ · เมนู ☰ · dropdown ค่า)

- กว้างตามเนื้อหา ≤ 280 · padding `space-2`
- รายการสูง 44 · `radius-md` · 16/600 · hover `action-primary-subtle` · ตัวคั่น `border-thin`
- คีย์ลัดท้ายรายการ: kbd 12/700 `text-secondary`
- dropdown ค่าในบล็อกใช้หน้าตานี้ ไม่ใช้สไตล์ Blockly

## popover ยืนยัน

- ใช้แทน dialog กลางจอ เมื่อยืนยันเรื่องของปุ่ม/tab ที่เพิ่งกด (design-taste ข้อ 12) · เปิดใต้ปุ่ม/tab นั้น
- `role=alertdialog` · โฟกัสเริ่มที่ปุ่มปลอดภัย · Esc ปิด
