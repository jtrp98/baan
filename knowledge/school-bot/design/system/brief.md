---
project: school-bot
updated: 2026-11-05
---

# Brief: ปรับทั้งระบบ School Bot Studio (รอบความสมบูรณ์ + consistency)

## Goal (ผู้ใช้ 2026-11-03 · Confirmed)
หน้าตาทั้งระบบมีครบแล้วแต่ยังไม่สมบูรณ์และไม่ consistent · phase นี้ต้องการ **ความสมบูรณ์แบบ** และ **ความ consistency ทั้งระบบ** · ขอบเขตแก้ได้ตั้งแต่ Site Map, ของกลางที่เชื่อมทุกหน้า (เช่น nav bar, focus) ไปจนถึงรายละเอียดเล็กในหน้า · auditor ต้องเสนอจุดที่ควรปรับเพิ่มนอกจาก comment ของผู้ใช้ด้วย

## เกณฑ์ "สมบูรณ์" (ผู้ใช้เลือก 2026-11-03)
1. ไม่มี req ให้แก้เพิ่มจากผู้ใช้แล้ว (ทุก comment ปิดครบ)
2. Quiz: มีรูปภาพ ชื่อด่าน เนื้อหาด้านใน และ content ครบทั้ง 6 level
3. ฟังก์ชันพื้นฐานที่โปรแกรมประเภทนี้ควรมีครบ และใช้งานได้จริง
4. State ครบทุกหน้า (empty / loading / error / offline / หุ่นหลุด ตามที่เกี่ยวข้อง)
5. Flow ไม่ขาด: ทุกปุ่ม/ลิงก์ไปหน้าที่มีจริง ไม่มีทางตัน
6. Keyboard / focus / a11y: focus แบบเดียวกันทั้งระบบ ผ่าน WCAG AA
7. Copy / ชื่อเรียก: ชื่อหน้า ปุ่ม คำศัพท์เหมือนกันทั้งระบบ ตาม voice ใน brand.md

## ความหมายของแต่ละหน้า (ผู้ใช้ 2026-11-03)

| หน้า | คืออะไร | ใครเห็น | เข้าจาก / แสดงเมื่อ | module |
|---|---|---|---|---|
| Home | หน้าแรกหลัง login (SCR-05) | นักเรียน + ครู | หลัง login | app-shell |
| File | หน้าเดียวกับ my-work / งานของฉัน (SCR-09) | นักเรียน + ครู | จาก Home | my-work |
| Quiz Map | แผนที่เลือกด่าน | นักเรียน + ครู | หลังเลือก level | quiz |
| Workspace | ตัวแก้ไขของ Arm Lab / Block Lab | นักเรียน + ครู | เปิดงานจาก my-work, กดงานใหม่ หรือจาก Home | arm-lab, block-lab |
| Connected Page | หน้าเชื่อมต่อหุ่น (เลือกพอร์ต/อุปกรณ์ + สถานะ) | นักเรียน + ครู | ก่อนเข้า Workspace ทุกครั้ง · หุ่นหลุด → popup เปลี่ยนหุ่น | app-shell |

ครูใช้แอปเดียวกับนักเรียน หน้าตาเหมือนกัน (ผู้ใช้ 2026-11-03)

```
Login → Home → File (my-work) ─┐
           └→ งานใหม่ ──────────┼→ Connected Page → Workspace (Arm Lab / Block Lab)
                                    ↑ หุ่นหลุด → popup เปลี่ยนหุ่น
Home → Quiz → เลือก level → Quiz Map → (ด่าน → ? ให้ auditor ดูจาก canvas แล้วเสนอ)
```

## ข้อขัดกับเอกสารเดิม (ต้องแก้ตามกฎการเปลี่ยน requirement ใน Phase spec)
- **ครูในแอป:** context.md DEC-14 ระบุว่าแอปเป็นของนักเรียน ยกเว้นโหมดครูใน Arm Lab · คำตอบใหม่: ครูเห็นทุกหน้า หน้าตาเหมือนกัน
- **Connected Page:** frame ConnectV3 (FRM-06) ลงไว้ที่ arm-lab · คำตอบใหม่: เป็นของ app-shell ใช้ร่วม Arm Lab และ Block Lab
- **ชื่อ File vs งานของฉัน:** หน้าเดียวกันแต่เรียกต่างกัน

## Canvas ที่ใช้

| canvas | ลิงก์ | หน้า | ลงทะเบียนแล้วที่ |
|---|---|---|---|
| Canvas A (ใช้ร่วม) | https://claude.ai/artifact/AnEWv6UNbgcNvUXS1sfHQd | Home, File, Quiz, Quiz Map, Arm Lab, Connected | arm-lab C1, quiz C1, app-shell C1, my-work C1 (2026-11-03) |
| Block Lab | https://claude.ai/artifact/YYgSHL2aCtVbkDTgBQBzTV | Block Lab Workspace | block-lab C1 |

## ขั้นแรก: CI กลาง (ผู้ใช้ 2026-11-03 · ทำก่อน comment)
- **ปัญหา:** ไม่มีแหล่ง component เดียว · 2 canvas ต่างคนต่างมี component ของตัวเอง (เช่น WindowBarV1 vs WindowBarA2 และ WindowBar สำเนาอีก 3 ไฟล์ใน Block Lab) แก้ที่หนึ่งอีกที่ไม่ตาม
- **ทางแก้ที่เลือก:** สร้าง **Design System artifact แยก** (type "Design System") เป็นแหล่งกลางของ tokens + component + asset ของทั้ง 2 canvas · `brand.md` §1–11 ยังเป็นกฎ · ข้อจำกัด: canvas ไม่ update เอง แก้ DS แล้วต้อง sync เข้าทั้ง 2 canvas
- **สถานะ 2026-11-03:** สแกนเสร็จ (`system/ci-audit.md`) · ผู้ใช้ตัดสินครบ · brand.md §11 แก้แล้ว · สร้าง DS artifact แล้ว https://claude.ai/artifact/DgwzCEnxThrSoxnE5ZrNoy (ยังว่าง → crayon เติม)
- **ลำดับ:** auditor สแกน component ทั้ง 2 canvas เทียบ `brand.md` §11 ก่อน → `system/ci-audit.md` → ผู้ใช้ตัดสินแบบที่ขัดกัน → session หลักสร้าง DS artifact → เติม component → sync เข้า canvas

## งานที่รวมเข้ารอบนี้
- Block Lab: เชื่อม R21 context menu เข้า Main-A2 / BlocksPaneA2 (งานค้าง) ทำหลังกำหนดของกลาง (ระดับ B)

## Comment ของผู้ใช้
> **งานถัดไป (ผู้ใช้สั่ง 2026-11-05 · ใช้ได้ทุกเครื่อง):** เครื่องที่มาทำต่อ ให้ส่ง `ruler` ตรวจ quiz ซ้ำก่อน (R7 กฎ access 1–N + ไม่รู้ชั้น/โหลดไม่ได้, R8, R12, R16, AC-05 ที่แก้หลัง ruler รอบแรก · ดู CHANGELOG 2026-11-05 รายการบนสุด) แล้วจึงถามผู้ใช้ว่า approve · ruler ไม่มี AskUserQuestion → session หลักถามแทน · หลังจากนั้นแผน 4 (Studio) ทำทีละข้อ รอผู้ใช้สั่ง

### รอบ 2026-11-05 (Studio + บทเรียน · ผู้ใช้ approve แผน 1–4 แล้ว · ทำทีละข้อ รอผู้ใช้สั่งข้อต่อไป)
**ลำดับงาน (ผู้ใช้ยืนยัน):** 1 Arm Lab / Block Lab → 2 Connect (เสร็จแล้วอยู่ในหมวด Studio) → 3 Update Software (อยู่ในหมวด Studio) → 4 เกม (เก็บ req เพิ่มเมื่อถึงคิว) → 5 Studio (Login, Home, My work) → 6 บทเรียน (quiz)

| U | ความต้องการ | module | แผน |
|---|---|---|---|
| U1 | หน้า login + โหมด guest (ขัด U5: guest บันทึกที่ไหน → ต้องถาม) | app-shell | 4 |
| U2 | หน้าอัปเดตซอฟต์แวร์ | update-software (ใหม่) | 4 |
| U3 | เมนูเกมคล้าย Y8 (เก็บ req เพิ่ม) | games (ใหม่) | 4 |
| U4 | แนวทาง pattern = สูตร pattern × หลักสูตร (ต้องเก็บ req ละเอียดอีกรอบ) | quiz / games | 4 (OQ) |
| U5 | งานของฉันแสดงเฉพาะไฟล์บน cloud (ขัด my-work R3 กู้คืนสำรอง + ออฟไลน์) | my-work | 4 |
| U6 | เอาโลโก้ออกจาก sidebar เหลือเมนูหน้าหลัก (ตรง ci-audit §7.2) | app-shell | 4 |
| U7 | หัวงานของฉัน Arm/Block ใช้โลโก้ส่วนหัวของแต่ละ lab แทนโลโก้ที่ gen | my-work | 4 |
| U8 | ซ่อนส่วนความสำเร็จไว้ก่อน (กระทบ quiz R6) | app-shell | 4 |
| U9 | Arm/Block บันทึกบน cloud เป็นค่าเริ่มต้น (save, save as) · ได้ไฟล์ออกมา = export | my-work, arm-lab, block-lab | 4 |
| U10 | แหล่งเนื้อหาบทเรียนจริง + กฎอิงเนื้อหา | quiz | 1 (ทำแล้ว + สรุปเนื้อหาแล้ว 2026-11-05) |
| U11 | node ภารกิจ: วาด shape ตาม .svg + ตัวหนังสือจริง ไม่ตัดรูป · โชว์แผน 3 state ก่อนแก้ | quiz D2 | 2 (DS gap) → แก้ design |
| U12 | timeline ด้านล่าง (แผนที่ย่อ) ทำใหม่: ไม่เข้ม ไม่ focus หนัก เข้ากับ shape ด่าน | quiz D2 | 2 (DS gap) → แก้ design |
| U13 | ปลดล็อก level ตามชั้นของนักเรียน + ครูเปลี่ยนได้บนเว็บครู (ขัด R7, R16, OQ21/22) | quiz, teacher-web | 3 (req แก้แล้ว 2026-11-05 · R7/R12/R16 · รอ ruler + req teacher-web) |
| U14 | ด่านเล่นเฉย ๆ vs ด่านบอสเก็บคะแนน (ต้องถามรายละเอียด) | quiz | 3 (OQ37 เปิดแล้ว 2026-11-05 · รอเก็บรายละเอียด) |
| U15 | พื้นหลังแต่ละ level ตาม theme ที่สอน | quiz R17 | 3 (R17 แก้แล้ว 2026-11-05) |
| U16 | CI = CI ของ School Bot Studio (ยึด Arm Lab · ส่วนที่ไม่มีออกแบบใหม่) | system | 2 (ทำแล้ว 2026-11-05 · DS gap G1–G8 ใน ds-build.md) |
