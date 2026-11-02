---
owner: spec
---
# Brand: School Bot Studio

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (แตกจาก brand.md ของ sketchbook ให้อ่านได้ทีละไฟล์)

หน้าตาของแอปนักเรียน School Bot Studio (Arm Lab · Block Lab · Quiz) และเว็บครู · **Arm Lab ที่อนุมัติแล้วเป็นแม่ของทุกหน้า** (design-taste ข้อ 1): ของที่ Arm Lab มีแล้วใช้แบบเดียวกัน ของที่ไม่มีออกแบบให้เป็นตระกูลเดียวกัน

## Design System (ตัวจริงของ token + component)

**School Bot Studio** บน Claude Design: https://claude.ai/artifact/BK3TUSLzMLSWgryiT7wPP1 (สร้าง 2026-11-02 · namespace `SBS` · ตอนนี้ private ของเจ้าของ)
canvas ทุกอันของโปรเจกต์ติดตั้งระบบนี้และดึง component จริงไปใช้ · ไฟล์ในโฟลเดอร์นี้คือข้อกำหนดที่ระบบสร้างตาม — แก้ที่นี่แล้วต้องแก้ระบบตามด้วย (session หลักเป็นผู้แก้)

## กฎที่ใช้ทุกหน้า

1. ค่าทุกตัวมาจาก [tokens.md](tokens.md) เท่านั้น — ไม่มีในนั้น = ห้ามใช้ (เสนอเป็น DSG ใน [gaps.md](gaps.md))
2. component ใช้ตาม `components/` — หน้าไหนต้องการของที่ไม่มี ให้เสนอเข้า design system ก่อน ไม่คิดเฉพาะหน้า
3. ทุก control: ข้อความ ≥ 16px · เป้ากด ≥ 44×44 · focus ring `action-primary` เฉพาะเมื่อมาจากคีย์บอร์ด · ไอคอน SVG Lucide เส้น 2.4 · ปุ่มที่ใช้ไม่ได้ = `aria-disabled` + popup อธิบาย · ทุก animation มีแบบลดการเคลื่อนไหว
4. สีที่มีความหมายมีข้อความหรือไอคอนคู่เสมอ · ห้าม emoji
5. ไฟล์ในโฟลเดอร์นี้เขียนเฉพาะค่าปัจจุบัน — ประวัติอยู่ที่ [changelog ของ school-bot](../../changelog/2026-11.md) · ฉบับก่อนแตกไฟล์คือ `brand.md` ใน git ของ sketchbook

## ไฟล์

| ไฟล์ | อ่านเมื่อ |
|---|---|
| [tokens.md](tokens.md) | ทุกครั้งที่ออกแบบ/ตรวจ (สี ตัวอักษร spacing มุม เงา focus z-index motion ไอคอน) |
| [components/layout.md](components/layout.md) | โครงหน้า · แผง · เวที · ขนาดหน้าต่าง · เว็บครู |
| [components/header.md](components/header.md) | แถบบน (ทุก lab) |
| [components/job-title.md](components/job-title.md) | ชื่องาน + สถานะบันทึก + เปลี่ยนชื่อ |
| [components/window-buttons.md](components/window-buttons.md) | ปุ่มหน้าต่าง Windows / Mac |
| [components/buttons.md](components/buttons.md) | ปุ่มนูน · ปุ่มไอคอน · กลุ่มปุ่ม · ปุ่มหยุดทั้งหมด · ปุ่มขยายแผง |
| [components/chip.md](components/chip.md) | ชิปสถานะ |
| [components/tabs.md](components/tabs.md) | tab · tab ไอคอนล้วน · รายการนำทางแนวตั้ง |
| [components/selection.md](components/selection.md) | การ์ด/แถวที่เลือก |
| [components/tooltip.md](components/tooltip.md) | tooltip |
| [components/popover.md](components/popover.md) | popover · เมนู · dropdown · popover ยืนยัน |
| [components/dialog.md](components/dialog.md) | dialog + ฉากหลัง |
| [components/input.md](components/input.md) | ช่องพิมพ์ |
| [components/canvas-controls.md](components/canvas-controls.md) | ปุ่มเลื่อน/ซูมพื้นที่ทำงาน (block-lab) |
| [components/flyout.md](components/flyout.md) | แผงลอยรายการบล็อก (block-lab) |
| [components/block.md](components/block.md) | บล็อก · ไอคอนบนหัวบล็อก · หัวกลุ่มในแผง (block-lab) |
| [voice.md](voice.md) | ข้อความบนจอ · คำที่ตัดสินแล้ว · ชื่อทางการ |
| [mascot.md](mascot.md) | มาสคอต 10 ท่า |
| [gaps.md](gaps.md) | ของที่ยังไม่มีแบบ (DSG) |

กฎเฉพาะตัวแก้โค้ด/terminal ของ Block Lab (autocomplete · สี syntax · Output) อยู่ที่ [modules/block-lab/design/code-editor-rules.md](../../modules/block-lab/design/code-editor-rules.md)
