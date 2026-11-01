---
module: quiz
design: D1
covers: [R12, R1, R6, R8, R10, R11, R17]
canvas: C1
updated: 2026-11-01
---

# D1 หน้าเลือก Level (6 ใบ)

- **Artboard:** `QuizLevelsV1.dc.html` (1440×900 · แถบหน้าต่าง 60 + พื้นที่ 840 · มี sidebar `HomeRail` เลือก "บทเรียน") ใน canvas C1 · ปลายทางลิงก์ไป `QuizMapV1.dc.html` (D2)
- **Publish:** publish แล้ว 2026-11-01 บน C1 (version 708 · ผู้ใช้อนุมัติ) · artboard `QuizLevelsV1.dc.html` · https://claude.ai/artifact/AnEWv6UNbgcNvUXS1sfHQd · ยังไม่ได้ตรวจ render จริง · ไม่เก็บ HTML ใน sketchbook · **แก้ 2026-11-01 (ผู้ใช้ขอใช้ภาพจริงจากโฟลเดอร์ ref):** ภาพเกาะบนการ์ดเปลี่ยนจากเวกเตอร์เป็นภาพเกาะ 6 ใบที่ตัดจาก `assets/ref/Quiz/Start Page.png` (200×176 พื้นขาว · asset ของ C1 · ค่า `img` ต่อ level ใน renderVals) publish C1 version 713 · เปิดตรวจบน canvas แล้ว: แสดงครบ 6 ใบ · ข้อสังเกต: ภาพเกาะเล็กกว่าในภาพอ้างอิง (ราว 140×124) เพราะภาพตัดจากหน้าจอขนาดเล็ก ถ้าต้องการใหญ่ขึ้นต้องได้ไฟล์ภาพเกาะต้นฉบับ (OQ19) · พื้นภาพเป็นสีขาวทึบ ใช้ได้เฉพาะบนการ์ดพื้นขาว
- **ภาพอ้างอิง:** `Start Page.png` (ตัด Arm Lab และปุ่ม "เพิ่มท่า" ออก) · ภาพเกาะวาดใหม่เป็นเวกเตอร์ placeholder (ไม่ฝังบิตแมป) · ชื่อเกาะ/ระดับเป็นตัวอย่างสมมติ (OQ19)

## สิ่งที่ออกแบบ
- หัวหน้า "บทเรียน" 28/700 + คำอธิบาย + ชิป "ดาวรวม" · การ์ด 3×2 gap 24 (กว้างหดตามพื้นที่ · สูงต่ำสุด 340) · เลื่อนเฉพาะ `main` เมื่อข้อความยาว (+40%)
- การ์ด Level: ป้าย LEVEL n (จุดสี accent + ข้อความ) · ป.n · ภาพเกาะ · ชื่อ 20/700 · คำอธิบาย 16 · ความคืบหน้า "ผ่าน x/44 ภารกิจ" + แถบ + ★ ดาวรวมของ level · แตะเข้าได้ทุกใบ (ลิงก์ไปแผนที่)
- ป้าย "ชั้นของฉัน" (ขอบการ์ด `action-primary`) ตาม OQ25 Proposed: แสดงเมื่อรู้ชั้น (Tweak myGrade 0 = ไม่รู้ = ไม่แสดง) · ป้าย "เล่นล่าสุด" (Level 2 ในตัวอย่าง) เพื่อให้กลับไปต่อได้เร็ว
- **สถานะ (Tweaks):** `state` = normal · first (ยังไม่เริ่ม ดาว 0) · loading (skeleton นิ่ง + spinner ไม่ใช่ 0/0) · progressFail (แถบเตือน "ยังโหลดความคืบหน้าไม่ได้" + ตัวเลข "–/44" ไม่แสดงเป็นครั้งแรก · R8) · offline (ชิปบนแถบหน้าต่าง) · `soon` = Level 5–6 "เร็ว ๆ นี้" แตะแล้วขยายคำอธิบายในการ์ด (OQ27 Proposed ไม่เงียบ) · Level 1 ตัวอย่างแสดง "จบแล้ว" (ไอคอน check + ข้อความ + แถบเขียว)
- ภาษา: Tweak `lang` ไทย/EN/中文 (ฟอนต์ fallback IBM Plex Sans SC)

## ค่าที่ใช้
- โทเค็น brand: `background #F4F7FB` · `surface #FFFFFF` · `border #DCE3EC` · `text-primary #14243D` · `text-secondary #5A6377` · `action-primary #1866C9` / `-dark #0F4C99` / `-subtle #EAF2FD` · `success #2E7D32` · `warning-bg #FFF4CC` + `warning-strong #B07F00` (ชิปออฟไลน์/แถบเตือน) · radius-lg 16 · radius-md 12 · border-default 2px · ปุ่มนูน ขอบล่าง 4px · shadow-float · focus ring 3px `#1866C9` offset 2 (เฉพาะ :focus-visible) · spacing 4/8/12/16/24/32 · type 14/16/18/20/28
- **ค่าชั่วคราว (ไม่อยู่ใน brand §1):** สีดาวเต็ม `#F2C94C` + ขอบ `#B07F00` (ดาวว่างไม่ได้ใช้ในหน้านี้) · สี accent ต่อ level (จุด/เกาะ เท่านั้น ไม่ใช่ปุ่ม/สถานะ): L1 `#5BC98A` L2 `#5AA9F5` L3 `#F5B97A` L4 `#73B8FF` L5 `#FF7B5C` L6 `#C03BF0` · สีภาพเกาะ placeholder (rock/top/rim/decor) ต่อ level · แถบหน้าต่าง 60 เป็น stand-in (รอ `WindowBarV1` ฉบับ 60 · CR-09) → OQ33 / OQ35

## Heuristics / UD
- H1 สถานะระบบ (loading skeleton, progressFail ไม่หลอกว่า 0) · H2 ภาษาเด็ก "ผ่าน 12/44 ภารกิจ" · H3 ทางกลับ (sidebar) · H4 คำเดียว "ภารกิจ" ทั้งหน้า (OQ30) · H5 การ์ด "เร็ว ๆ นี้" อธิบาย ไม่ปล่อยเงียบ · H6 จำง่าย (ป้ายเล่นล่าสุด/ชั้นของฉัน) · H9 ข้อความ error บอกว่าข้อมูลไม่ได้หาย
- UD: สถานะไม่ใช้สีอย่างเดียว (จบแล้ว = ไอคอน+ข้อความ · accent เป็นของตกแต่ง ตัวบอก level = ข้อความ "LEVEL n")

## WCAG AA (ตรวจด้วยมือ)
- text-primary บน surface 14.5:1 · text-secondary บน surface ≈6.1:1 · `#0F4C99` บน `#EAF2FD` ≈7.5:1 · success บนขาว 5.1:1 · focus ring บนขาว 5.6:1
- เป้ากด: การ์ดทั้งใบ · ปุ่มแถบเตือน 48 · ปุ่มหน้าต่าง 48×44 · ตัวอักษรใน control/เนื้อหา ≥16 (ข้อมูลรอง 14 = ป้าย LEVEL/ป.n/ป้ายชั้นของฉัน)
- role=link/button ตามกรณี · aria-label รวมชื่อ level + ความคืบหน้า + ดาว · reduced-motion: ปิด transition/spinner (เหลือวงนิ่ง) · ไม่กะพริบ
- **ยังไม่ได้ตรวจ:** render จริง/ภาพหน้าจอ · ความยาวข้อความ EN/中文 ในการ์ด (ออกแบบเผื่อ +40% ด้วยการ์ดสูงยืดและ `main` เลื่อนได้) · screen reader จริง

## ข้อเสนอแนะ
- ใช้คำ "ภารกิจ" ทั้ง UI (แทน "ด่าน") เพื่อให้ตรงกับแผงภารกิจ (OQ30) · ภาพเกาะจริง/ชื่อเกาะจริงรอ OQ19 · ตัวเลข "x/44" มาจาก manifest (ไม่ fix 44 · OQ18)
