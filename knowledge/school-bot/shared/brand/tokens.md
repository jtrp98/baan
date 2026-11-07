---
owner: design
---
# Tokens: School Bot Studio

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (แตกจาก brand.md ของ sketchbook ให้อ่านได้ทีละไฟล์)

ค่าที่ใช้ได้ทั้งหมด **ห้ามเขียนค่าที่ไม่อยู่ในไฟล์นี้** (สี ขนาด ระยะ มุม เงา เวลา) · ของที่ยังไม่อนุมัติอยู่ท้ายไฟล์ ใช้ได้เมื่อผู้ใช้อนุมัติแล้วเท่านั้น
รหัส `D-xx` = decision ของ brand (ต้นฉบับ DESIGN.md) ไม่ใช่ D# ของ design

## สี

กฎ: สีหนึ่งตัวมีความหมายเดียว · สีที่มีความหมายต้องมีข้อความหรือไอคอนคู่เสมอ

| Token | ค่า | ใช้ที่ไหน |
|---|---|---|
| `background` | #F4F7FB | พื้นหน้าจอ |
| `surface` | #FFFFFF | การ์ด แผง เมนู ปุ่มรอง |
| `text-primary` | #14243D | ตัวอักษรหลัก · ตัวอักษรบนส้ม (`action-robot`, `mode-block`) และบนพื้นเตือน |
| `text-secondary` | #5A6377 | ตัวอักษรรอง · ไอคอน/ข้อความสถานะปิด |
| `border` | #DCE3EC | ขอบทั่วไป · ขอบของสถานะปิด · พื้นรางของ tab |
| `border-strong` | #C6D6EA | ขอบปุ่มรอง |
| `action-primary` | #1866C9 | เลือก · active · ปุ่มหลักที่ไม่ขยับหุ่น · focus ring |
| `action-primary-dark` | #0F4C99 | ขอบล่างปุ่มนูนหลัก |
| `action-primary-subtle` | #EAF2FD | hover · พื้นของที่เลือก |
| `action-primary-halo` | #D0EBFD | วงตกแต่งรอบของที่เลือก/ช่องพิมพ์ · **ห้ามเป็นตัวบอก focus อย่างเดียว** (1.24:1) |
| `action-robot` | #FF8A00 | ปุ่มที่กดแล้วหุ่นขยับ (ปุ่มนูนเสมอ · D-06) |
| `action-robot-dark` | #B85E00 | ขอบล่างปุ่มหุ่น · ห้ามใช้เป็นสีของที่เลือก |
| `stop` | #D32F2F | ปุ่มหยุดทั้งหมดเท่านั้น (รูปทรงสงวน · D-01) |
| `danger` | #D32F2F | ลบ · ผิดพลาด · ห้ามใช้รูปทรงของปุ่มหยุด |
| `success` | #2E7D32 | สำเร็จ |
| `warning-bg` | #FFF4CC | พื้นแถบ/กล่องเตือน (D-02) |
| `warning-strong` | #B07F00 | ขอบ/ไอคอนเตือน |
| `off-bg` | #F4F6F8 | พื้นสถานะปิด/ใช้ไม่ได้ · ต้องมีขอบ `border` เสมอ (D-03) |
| `group` | #5B5FC7 | ท่าชุด (accent) |
| `group-border` | #7C78D8 | ขอบท่าชุด |
| `group-bg` | #F1F0FD | พื้นท่าชุด |
| `group-text` | #3F3A9E | ตัวอักษรท่าชุด |
| `mode-block` | #E8710A | สีประจำ Block Lab: การ์ดโหมด + แถบระบุแอปเท่านั้น (D-04) |
| `mode-arm` | #1866C9 | สีประจำ Arm Lab (เหมือนข้างบน) |
| `mode-quiz` | #7B3FC4 | สีประจำ Quiz (เหมือนข้างบน) |
| `star-fill` | #F2C94C | เนื้อดาวเต็มของบทเรียนเท่านั้น (ตกแต่ง คู่กับ star-border เสมอ) |
| `star-border` | #B07F00 | ขอบดาวเต็มของบทเรียน (3.57:1 บนขาว) · ค่าเท่ากับ warning-strong แต่ห้ามใช้แทนกัน |

- สีประจำแอป (`mode-*`) ห้ามใช้บนปุ่ม สถานะ หรือ Attention Ring
- ฉากหลัง dialog = `text-primary` ที่ alpha 0.35 · แผงลอย (flyout) = `surface` ที่ alpha 0.9 (DSG-14 · ผู้ใช้อนุมัติ)
- สีหมวดบล็อก 16 คู่ (พื้น/ขอบ) เป็นของ block-lab ดู sketchbook `projects/school-bot/modules/block-lab/design/D1-editor.md` §ค่าที่ใช้ (ยังไม่ย้ายเข้า knowledge) (DSG-13)

### คอนทราสต์ที่ตรวจแล้ว

| คู่ | ค่า | ผล |
|---|---|---|
| `text-primary` บน `background` | 14.48 | ผ่าน |
| `text-secondary` บน `background` | 5.61 | ผ่าน |
| `text-secondary` บน `border` (tab ปกติ) | 4.66 | ผ่าน |
| `text-primary` บน `warning-bg` | 14.13 | ผ่าน |
| `warning-strong` บนขาว / บน `warning-bg` | 3.57 / 3.24 | ผ่าน (กราฟิก 3:1) |
| ขาว บน `action-primary` | 5.55 | ผ่าน |
| `action-primary` (focus ring) บนขาว | ≈5.6 | ผ่าน (1.4.11) |
| `text-primary` บน `action-robot` | 6.59 | ผ่าน |
| ขาว บน `mode-block` | 3.09 | **ไม่ผ่าน** → ใช้ `text-primary` (5.04) |

## ตัวอักษร

- **IBM Plex Sans Thai (Loopless) ฟอนต์เดียว** ทั้งหัวข้อและเนื้อหา (D-08, D-09) · น้ำหนัก 400 · 500 · 600 · 700 (ไม่มี 800) · หัวข้อใช้ 700 แยกระดับด้วยขนาด
- ฝังไฟล์ฟอนต์ในโปรแกรม ห้ามพึ่ง Google Fonts ตอนรัน (โปรแกรมติดตั้งในเครื่อง · license OFL)
- monospace: Consolas, ui-monospace — คอนโซลครูเท่านั้น (ในแอปนักเรียนยังไม่อนุมัติ · DSG-15)
- ภาษาจีน: fallback IBM Plex Sans SC เฉพาะ locale zh (Proposed · DSG-02) · เผื่อความยาวข้อความ EN/中文 +40%

| Token | ขนาด | ใช้กับ |
|---|---|---|
| `text-xs` | 12px | ข้อมูลรองเท่านั้น |
| `text-sm` | 14px | ข้อมูลรองเท่านั้น |
| `text-md` | 16px | **ขั้นต่ำของเนื้อหาหลักและทุก control** |
| `text-lg` | 18px | หัวข้อย่อย · ชื่อการ์ดเด่น |
| `text-xl` | 20px | หัว section |
| `text-2xl` | 24px | หัว dialog / หัวหน้า |
| `text-3xl` | 28px | หัวหน้าหลัก |
| `text-4xl` | 36px | ข้อความใหญ่พิเศษ (ฉลองสำเร็จ) |
| `display-countdown` | 88px | ตัวนับถอยหลังคลายแขนเท่านั้น |

**หลัก vs รอง (D-12):** ≥16px = ทุกอย่างที่กด/พิมพ์/เลือกได้ · คำสั่งงาน คำแนะนำ error คำเตือน · ชื่อที่เป็นเนื้อหาหลักของการ์ด · ค่าที่ต้องอ่านเพื่อทำงาน · 12–14px ได้ = คำใบ้คีย์ลัด · metadata · ป้ายสเกล · ตัวเลขใน badge · คำบรรยายใต้ภาพ · ไม่แน่ใจ: ซ่อนข้อความแล้วเด็กยังทำงานต่อได้ = รอง

| Token | ค่า | ใช้กับ |
|---|---|---|
| `lh-heading` | 1.3 | หัวข้อ ≥20px บรรทัดเดียว · ห้ามใช้ในกล่องที่ตัดข้อความ |
| `lh-body` | 1.6 | ค่าเริ่มต้นทุกข้อความ |
| `lh-clip` | 1.7 | **บังคับ** ทุกกล่องที่ตัดข้อความ (overflow hidden / ellipsis / line-clamp) — สระบน วรรณยุกต์ สระล่างต้องการ ≈1.65em |

## Spacing และโครงหน้าจอ

| Token | ค่า |
|---|---|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |

- ใช้กับ padding margin gap ทุกจุด · 1–2px ใช้ได้เฉพาะความหนาขอบและระยะของ ring
- โครงหน้าจอแอป: ดู [components/layout.md](components/layout.md)

## มุม ขอบ เงา

| Token | ค่า | ใช้กับ |
|---|---|---|
| `radius-sm` | 8px | chip · badge · input เล็ก · tooltip |
| `radius-md` | 12px | ปุ่ม · input · การ์ดเล็ก · tab |
| `radius-lg` | 16px | การ์ด · แผง · popover · dialog |
| `radius-pill` | 999px | ปุ่ม pill · ป้ายสถานะ · ชิป |
| `radius-circle` | 50% | avatar |
| `border-thin` | 1px | เส้นคั่นภายในเท่านั้น |
| `border-default` | 2px | ขอบทั่วไป |
| `border-selected` | 3px | ของที่เลือกอยู่ (คู่กับ `action-primary`) |
| `raise` | ขอบล่าง 4px | ปุ่มนูน · กดแล้วเหลือ 2px + เลื่อนลง 2px |
| `shadow-float` | 0 8px 20px rgba(20,36,61,.2) | popover · เมนู · toast · กลุ่มปุ่มลอย |
| `shadow-modal` | 0 16px 40px rgba(20,36,61,.3) | dialog |
| `shadow-tab` | 0 1px 3px rgba(20,36,61,.18) | tab ที่เลือกในรางเท่านั้น (DSG-20 · ผู้ใช้อนุมัติ) |

## Focus ring

- **`outline: 3px solid` `action-primary` · `outline-offset: 2px` ทุก control ที่โฟกัสได้** (ปุ่ม tab ชิป ชื่องาน การ์ด ช่องพิมพ์) ผ่าน `:focus-visible` — ไม่มีสีอื่น
- **แสดงเฉพาะเมื่อมาจากคีย์บอร์ด** · คลิก/แตะด้วยเมาส์ = ไม่มีวง (ช่องพิมพ์ต้องจำ modality ล่าสุด keydown vs pointerdown เพราะเบราว์เซอร์นับคลิกช่องพิมพ์เป็น focus-visible)
- บนปุ่มพื้น `action-primary` ต้องคง offset 2 ให้มีช่องพื้นหลังคั่น
- ช่องพิมพ์: ดู [components/input.md](components/input.md)
- focus ring ≠ Attention Ring (focus = ตำแหน่งคีย์บอร์ด เส้นนิ่ง · Attention Ring = ชี้สิ่งที่ต้องทำต่อ กะพริบ)

## ชั้น (z-index)

| Token | ค่า | ใช้กับ |
|---|---|---|
| `z-base` | 0 | เนื้อหาปกติ |
| `z-sticky` | 10 | หัวแผงที่ติดเวลาเลื่อน |
| `z-backdrop` | 20 | ฉากหลัง dialog |
| `z-dialog` | 30 | dialog |
| `z-popover` | 40 | popover · เมนู · dropdown · tooltip |
| `z-toast` | 50 | toast |
| `z-bottombar` | 60 | แถบล่าง · แถบสถานะ |
| `z-stop` | 70 | **ปุ่มหยุดทั้งหมดเท่านั้น** ไม่มีอะไรสูงกว่า |

popover ที่ชี้ปุ่มในแถบล่างเปิดขึ้นด้านบน ห้ามบังปุ่มหยุด · ฉากหลัง dialog/popover ต้องเว้นปุ่มหยุด

## Motion

| Token | ค่า | ใช้กับ |
|---|---|---|
| `dur-press` | 0.1s | กดยุบ · hover |
| `dur-move` | 0.2s | เข้า/ออก (popover การ์ด toast) |
| `dur-shake` | 0.45s | สั่นครั้งเดียวเมื่อกดผิด |
| `dur-spin` | 0.8s | spinner ตอนโหลด |
| `dur-success` | 1.2s | วงเขียวสำเร็จ ครั้งเดียว |
| `dur-advance` | 2s | แถบนับก่อนไปต่อเอง |
| `dur-ring` | 2.4s | Attention Ring |
| `ease-out` | cubic-bezier(.2,.8,.2,1) | ของที่เข้ามา |
| `ease-in` | ease-in | ของที่ออกไป |
| `ease-ring` | ease-in-out | Attention Ring เท่านั้น |
| `linear` | linear | spinner และแถบนับเท่านั้น |

1. วนไม่หยุดได้ 2 อย่าง: Attention Ring และ spinner ตอนโหลด
2. เปลี่ยนความทึบ/ขนาดครั้งเดียวได้ ถ้าไม่เกิน `dur-move` หรือเป็นการสั่น/วงสำเร็จที่กำหนดไว้
3. ทุก animation ต้องมีแบบ `prefers-reduced-motion: reduce` — ไม่มี = ไม่ผ่าน

**Attention Ring:** ระบบกะพริบเดียวทั้งแอป `dur-ring` `ease-ring` · วงนอกโปร่ง .15 → .7 · ต่างกันแค่สี: น้ำเงิน = กดต่อ ไม่ขยับหุ่น · ส้ม = กดแล้วหุ่นขยับ · แดง = ผิดพลาด/ขีดจำกัด · เขียว = สำเร็จ ครั้งเดียว `dur-success` · ปุ่มในแถบที่ตัดขอบใช้วงด้านใน (inset 2→3px) · ลดการเคลื่อนไหว = วงนิ่งความเข้ม .5

## ไอคอน

- **ห้าม emoji และอักขระสัญลักษณ์แทนไอคอนทุกชนิด** (D-20) — โปรแกรมรันบน Windows ฟอนต์ของเครื่องวาดไม่ตรงแบบ
- ชุดฐาน **Lucide** (ISC) · viewBox 0 0 24 24 · เส้น **2.4** ค่าเดียว · สี `currentColor` · ไอคอนเฉพาะหุ่น (แขน มือคีบ ข้อต่อ ท่าชุด พอร์ต USB) วาดเพิ่มในสไตล์เดียวกัน
- ชุดทึบ (`fill=currentColor`) ใช้เฉพาะไอคอนควบคุมบนหัวบล็อก (เฟือง, ?) ของ block-lab — ดู [components/block.md](components/block.md)

| Token | ขนาด | คู่กับ |
|---|---|---|
| `icon-sm` | 16px | ข้อความรอง 12–14px |
| `icon-md` | 20px | ค่าเริ่มต้น · ข้อความ 16–18px |
| `icon-lg` | 24px | ปุ่มไอคอนเดี่ยว |
| `icon-xl` | 32px | empty state · ภาพประกอบ |

ชื่อไอคอนแทนอักขระ: ถูก `check` · กากบาท `x` · เล่น `play` · หยุดทั้งหมด `square` · ลง `chevron-down` · ขวา `chevron-right` · บวก `plus` · ดินสอ `pencil` · กรรไกร `scissors` · สามจุด `ellipsis` · ย้อน `rotate-ccw` · กุญแจ `lock` · ถังขยะ `trash-2` · โฟลเดอร์ `folder` · เตือน `triangle-alert` · บันทึก `save` · คอม `laptop` · ปลั๊ก `plug` · ลูกศรในประโยค `arrow-right`

## ยังไม่อนุมัติ (ห้ามใช้จนผู้ใช้อนุมัติ)

| ชื่อที่เสนอ | ค่า | เรื่อง |
|---|---|---|
| `stop-dark` | #8E1B1B | ขอบล่างปุ่มหยุด (DSG-12 · ใช้ชั่วคราวได้) |
| `z-windowbar` | ต่ำกว่า 70 (ค่ายังไม่ตั้ง) | แถบหน้าต่าง — ผู้ใช้ตัดสินแล้วว่าต้องต่ำกว่า `z-stop` (CR-10) แต่ยังไม่ได้ใส่ค่า |
| `cat-*` | ดู D1-editor | 16 สีหมวดบล็อก (DSG-13) |
| (ยังไม่ตั้ง) | — | เทาอ่อน 7 เฉดในงานเดิม (#EEF1F5, #EEF3F9, #F7F9FC, #F3F8FE, …) ต้องรวมเหลือ token เดียวต่อความหมาย |
| (ยังไม่ตั้ง) | — | motion token ของ quiz R18 (Attention Ring วน ≤2 รอบ) |


### Focus ในที่แคบ (AU21)
- **[เพิ่ม 2026-11-03 · AU21]** ในที่แคบที่ขอบแผงตัดวง (รายการเมนู ☰, รางหมวดบล็อก) วาด focus **ด้านในขอบรายการ** ได้ (`outline-offset: -3px` สีและความหนาเดิม) เฉพาะที่แคบเท่านั้น · Attention Ring คงสีส้ม
