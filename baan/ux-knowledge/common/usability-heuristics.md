---
updated: 2026-10-20
source: Jakob Nielsen's 10 Usability Heuristics
used_by: Designer (ออกแบบ), Reviewer (ตรวจ), Feasibility (เช็ก state/error)
---

# 10 Usability Heuristics (มาตรฐานตรวจ UX)

ใช้ตรวจทุก module ใน Review ให้อ้างเป็นเลขข้อ เช่น "H5: ปุ่มลบไม่มี confirm"

| # | หลักการ | ตรวจอะไร | ตัวอย่างที่ผ่าน |
|---|---|---|---|
| H1 | Visibility of System Status | ผู้ใช้รู้ตลอดว่าระบบทำอะไรอยู่ | loading, success message, upload progress % |
| H2 | Match System & Real World | ใช้คำ/ไอคอนที่ผู้ใช้คุ้นเคย | ไอคอนตะกร้า, ถังขยะ, คำว่า "บันทึก" ไม่ใช้ศัพท์เทคนิค |
| H3 | User Control & Freedom | ย้อน/ยกเลิก/ออกได้ง่าย | Undo/Redo, ปุ่ม Cancel, ปิด popup ได้ |
| H4 | Consistency & Standards | pattern เหมือนกันทั้งระบบ | ปุ่ม/สีเหมือนกัน, navigation อยู่ที่เดิม |
| H5 | Error Prevention | กันผิดก่อนเกิด | disable Submit จนกรอกครบ, confirm ก่อนลบ, validate |
| H6 | Recognition over Recall | แสดงตัวเลือก ไม่ให้จำ | autocomplete, recently viewed, label ชัด |
| H7 | Flexibility & Efficiency | มือใหม่ง่าย มือเก่าเร็ว | keyboard shortcut, filter, quick action |
| H8 | Aesthetic & Minimalist | สะอาด โฟกัส | whitespace, visual hierarchy, เน้น CTA หลัก |
| H9 | Recognize/Diagnose/Recover from Errors | error บอกสาเหตุ + วิธีแก้ | "รหัสผ่านต้องมีอย่างน้อย 8 ตัว" ไม่ใช่ "Invalid input" |
| H10 | Help & Documentation | ช่วยเหลือได้ตรงจุด | tooltip, FAQ, onboarding, contextual help |

## วิธีใช้
- **Feasibility:** ตรวจว่า requirement ครอบคลุม state ของ H1, H5, H9 (loading, validation, error) หรือไม่
- **Designer:** ออกแบบให้ครบตามตาราง ระบุข้อที่ใช้ในหัวข้อ Design
- **Reviewer:** ให้ผล ผ่าน/ไม่ผ่าน/ไม่เกี่ยวข้อง รายข้อ H1-H10 ในหัวข้อ Review พร้อมจุดที่ต้องแก้ ใช้คู่กับ `wcag-aa.md`

## ระดับความรุนแรงเมื่อไม่ผ่าน
- **สูง:** ผู้ใช้ทำงานไม่สำเร็จ หรือเสียข้อมูล (เช่น H5 ลบโดยไม่ confirm, H9 error ไม่บอกทางแก้)
- **กลาง:** ทำได้แต่สับสนหรือช้า (H4, H6)
- **ต่ำ:** ความสวยงาม/ความสะดวกเสริม (H7, H10)
