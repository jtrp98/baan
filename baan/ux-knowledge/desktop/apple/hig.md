---
updated: 2026-10-21
source: Apple Human Interface Guidelines (developer.apple.com/design/human-interface-guidelines) อ่านจากเว็บ Apple เมื่อ 2026-10-21
used_by: Designer, Reviewer, Feasibility
---

# Apple HIG (สารบัญ)

HIG คือ design system ของ Apple ที่ทีมใช้เป็นเกณฑ์ตรวจเรื่อง**พฤติกรรมและขั้นต่ำ**ของ platform (แถบ เมนู หน้าต่าง ขนาด สี วัสดุ) ส่วนหน้าตาเฉพาะโปรเจกต์ใช้ `<project>/shared/brand/` ใน knowledge ของ workspace
เนื้อหาแยกเป็นไฟล์ตามหัวข้อ เปิดเฉพาะไฟล์ที่งานใช้:

| ไฟล์ | เนื้อหา | เลขข้อ |
|---|---|---|
| `hig-macos-bars.md` | menu bar, toolbar, title/window, bottom bar, sidebar, split view, panel, tab view, sheet, ปุ่มบน Mac | HM1–HM30 |
| `hig-foundations.md` | ตัวเลขขั้นต่ำ (ขนาดตัวอักษร/ควบคุม) text styles ของ macOS, สี, Liquid Glass/materials, layout, ปุ่ม, คีย์บอร์ด, ทางเลือกนอกจาก gesture | HF1–HF16 |

ใช้คู่กับ `../../common/usability-heuristics.md` (H1–H10) และ `../../common/universal-design.md` (UD1–UD7)

## หลักการตัดสินเมื่อไม่มีกฎเฉพาะ (แนวคิดของ HIG ฉบับ Liquid Glass)
- **ชั้นเนื้อหากับชั้นควบคุมแยกกัน** ตัวควบคุมและ navigation (toolbar, sidebar, tab bar) ลอยเหนือเนื้อหาและปล่อยให้เนื้อหาโผล่ผ่าน เนื้อหาคือพระเอก
- **ใช้ component มาตรฐานก่อน** มุมโค้ง สถานะ hover/selected และการปรับตามระบบมาให้เอง ทำเองต้องตรงทุกจุดไม่งั้นดู "พัง"
- **ให้ผู้ใช้คุมได้** ซ่อน/แสดง ปรับแต่ง ย่อขยาย ใช้คีย์บอร์ดล้วนได้ และทุกคำสั่งหาได้ใน menu bar

## ข้อควรระวัง
- ตัวเลข touch target 44 pt เป็นของ iOS/iPadOS บน macOS ปริยาย 28 pt ต่ำสุด 20 pt (ดู `hig-foundations.md`) ใช้ค่าตาม platform ของ module
- HIG ปรับปรุงทุกปี (Liquid Glass เข้ามาปี 2025) ถ้าจะอ้างเป็นข้อกำหนดกับ dev ให้เปิดหน้าต้นฉบับเทียบอีกครั้ง
- เลขข้อ HM/HF เป็นของทีม ไม่ใช่ของ Apple

## วิธีใช้ต่อ role
- **Feasibility:** ใช้ `hig-macos-bars.md` เช็กว่าคำสั่ง/flow ใน requirement มีที่อยู่ในเมนูหรือแถบมาตรฐาน และ `hig-foundations.md` เช็กขั้นต่ำ
- **Designer:** ระบุข้อ HM/HF ที่ใช้ใน design ถ้าเบี่ยง เขียนเหตุผล
- **Reviewer:** ให้ผล ผ่าน/ไม่ผ่าน/ไม่เกี่ยวข้อง รายข้อ (ข้อเฉพาะ Mac ที่ module ไม่ใช่ app Mac ให้ "ไม่เกี่ยวข้อง")
