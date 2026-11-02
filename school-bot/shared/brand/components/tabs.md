# tab (segmented)

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (แตกจาก brand.md ของ sketchbook ให้อ่านได้ทีละไฟล์)
> ใช้ที่: ทุก lab · tab โหมดในส่วนหัว · รายการนำทางแนวตั้ง

- ราง: พื้น `border` · padding `space-1` · gap `space-1` · `radius-md`
- tab: สูง 44 · padding 0 `space-3` · `radius-md` · 16/700 · ไอคอน `icon-md` gap `space-2`

| สถานะ | หน้าตา |
|---|---|
| ปกติ | พื้นโปร่ง · ตัว `text-secondary` |
| hover | พื้น `action-primary-subtle` · ตัว `text-primary` |
| **เลือก** | พื้น `surface` + `shadow-tab` · ตัวและไอคอน `action-primary` · **ไม่มีกรอบสี** |
| focus-visible | focus ring มาตรฐาน ([tokens.md](../tokens.md)) |
| ปิดใช้ | `aria-disabled` + พื้น `off-bg` + ขอบ `border` + ตัว `text-secondary` + popup อธิบาย |

- `role=tablist` / `tab` · `aria-selected` · ลูกศรซ้าย/ขวาเลื่อนระหว่าง tab

## tab ไอคอนล้วน (โหมด บล็อก | โค้ด ในส่วนหัว)

- 44×44 ไอคอน `icon-md` · ไม่มีข้อความบนจอ · `aria-label` + tooltip ใต้ปุ่ม ขึ้นตอน hover/focus-visible · สถานะอื่นเหมือนข้างบน
- เปลี่ยนโหมดที่ต้องยืนยัน: popover ยืนยันใต้ tab ([popover.md](popover.md))

## รายการนำทางแนวตั้ง (เช่น แถบหมวดบล็อก)

- เลือก = แบบ tab (พื้น `surface` + `shadow-tab` + ตัว/ไอคอน `action-primary` · ไม่มีกรอบสี) · ไอคอนหมวดคงสีหมวดเดิม
