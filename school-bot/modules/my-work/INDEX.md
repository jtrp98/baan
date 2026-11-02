---
module: my-work
updated: 2026-11-02
status: draft
depends_on: [app-shell]
target: school-bot
platform: desktop
os: [windows, mac]
---

# my-work (สารบัญ module)

เป้าหมาย: นักเรียนจัดการงาน Arm Lab / Block Lab ของตัวเองบน cloud (สร้าง เปิด เปลี่ยนชื่อ ทำสำเนา ลบ export import) ทำงานต่อได้เมื่อเน็ตหลุด และกู้คืนงานสำรองในเครื่องได้ · นำเข้าจากระบบเก่า 2026-10-21 (knowledge เป็นแหล่งความจริง)

## ไฟล์ (อ่านเฉพาะที่งานต้องใช้)

| ไฟล์ | อ่านเมื่อ |
|---|---|
| [shared/requirements.md](shared/requirements.md) | ต้องรู้ว่าต้องทำอะไร (R#, กฎ, edge case, พฤติกรรม FRM-03 ที่อนุมัติแล้ว) |
| [shared/oq.md](shared/oq.md) | ต้องรู้ว่ามีอะไรยังไม่ตัดสิน |
| [design/feasibility.md](design/feasibility.md) | ดูสารบัญ + BUG + ความขัดแย้งในต้นฉบับ + ข้อมูลจาก role 2 |
| [design/feasibility/R1.md](design/feasibility/R1.md) | R1, R7, R8, R11: cloud, ออฟไลน์/sync, ฉบับใหม่กว่าชนะ, ข้อมูลเด็ก (ST-03, ST-17, ARC-I05/I06/I14, DEV-Q05) |
| [design/feasibility/R2.md](design/feasibility/R2.md) | R2, R4, R9, R10: export/import, dialog นำท่าจากงานอื่น, งาน Block (ARC-I07, DEV-Q06, ENT-17) |
| [design/feasibility/R3.md](design/feasibility/R3.md) | R3: กู้คืนสำรอง (SCR-10, ST-18, ENT-18) |
| [design/feasibility/R5.md](design/feasibility/R5.md) | R5, R6: หน้างานของฉัน SCR-09, การสร้างงานใหม่ (CR-06, CR-07, ARC-I17) |
| design/ | แก้หรือตรวจ design (เลือกไฟล์ D# จากตาราง Design) · ยังว่าง |
| [design/review.md](design/review.md) | ดูผลตรวจ |
| handoff.md | ส่งต่อ dev (ยังไม่มี) |

## ความสัมพันธ์กับ module อื่น
- **app-shell:** แถบหน้าต่าง (SCR-02) แสดงสถานะ sync ST-03 · หน้าหลัก (SCR-05) แสดงงานล่าสุดแยก 2 กลุ่ม + sidebar (component HomeRail ใช้ร่วม) · module นี้เป็นเจ้าของความหมายของสถานะ app-shell เป็นเจ้าของตำแหน่งที่แสดง
- **arm-lab:** R6–R9 ของ arm-lab (บันทึก/export/กู้คืน/นำเข้า ในหน้า Arm Lab) อ้าง FR-22–25 เหมือนกัน · ☰ › งานใหม่/งานของฉัน/dialog นำท่าจากงานอื่นอยู่ในตัวแก้ไข Arm Lab
- **block-lab:** SCR-16 ต้องมี "งานใหม่" และ "งานของฉัน" แบบเดียวกับ Arm Lab · งาน Block บันทึกวงจรไปกับงาน (ENT-17) เนื้อหาบล็อก/วงจรเป็นของ block-lab
- **quiz / teacher-web:** ไม่เกี่ยว (งาน Lab ไม่มีคะแนน ไม่แสดงบนเว็บครู · DEC-18)

## Canvas

สร้าง canvas: session หลักเท่านั้น · ไม่มี C# ที่ใช้ได้ → ถามผู้ใช้ก่อนเริ่มงานทุกครั้ง (กฎ "ไม่มี canvas" ใน CLAUDE.md) · สิทธิ์: private / shared (shared ต้องได้รับอนุมัติก่อน publish)

| ID | ชื่อ | ลิงก์ | สิทธิ์ | ใช้กับ |
|---|---|---|---|---|

ยังไม่มี C# ที่ลงทะเบียนสำหรับ module นี้ → ถามผู้ใช้ก่อนเริ่มงาน canvas (frame ของ module นี้อยู่ใน canvas ที่ลงทะเบียนเป็น C1 ของ arm-lab · รอผู้ใช้ตัดสินเรื่อง 1 canvas : 1 module)

## Canvas และ frame ที่พบในระบบเก่า (ยังไม่ใช่ C#/D#)

| FRM เดิม | ชื่อ frame / ไฟล์ | artifact | สถานะในระบบเก่า | หมายเหตุ |
|---|---|---|---|---|
| FRM-03 | งานของฉัน v1 · `MyWorkV1.dc.html` (39 KB) + wrapper `MyWorkV1Block` · component `HomeRail` | [Canvas A](https://claude.ai/artifact/AnEWv6UNbgcNvUXS1sfHQd) | **Done** (ผู้ใช้อนุมัติ 2026-10-21) · EDIT-09 แถบหน้าต่าง + ตัดป้ายคลาวด์รวม **รอตรวจบน canvas** | Tweaks: `lab` arm/block · `works` some/many/none (ST-10) · `sync` ok/offline/fail (ST-03, ST-17) · `replaced` (EC-04) · `sideOpen` · กดได้: ค้นหา/ไม่เจอ, ⋯ เปิด/เปลี่ยนชื่อ (error ชื่อว่าง/ซ้ำ)/สำเนา/ส่งออก/ลบ+เลิกทำ, สร้างงานใหม่, นำเข้าไฟล์ |
| FRM-07 | กู้คืนงานสำรอง (SCR-10 dialog · ST-18) | Canvas A (ใหม่) | ยังไม่สร้าง | ขนาดเล็ก |
| (ส่วนของ FRM-02) | dialog "นำท่าจากงานอื่นมาต่อ" + เมนู ☰ (บันทึกงาน/บันทึกสำเนา/ส่งออก .ini) · อยู่ใน `MainV6A` / `MainV6ATopBar` | Canvas A | Done (EDIT-04 · 2026-10-21) | เป็นของ arm-lab |
| (ส่วนของ FRM-01) | การ์ดงานล่าสุด 2 กลุ่ม `HomeV6A` + `HomeRail` | Canvas A | Done (EDIT-01, EDIT-06 · ผู้ใช้อนุมัติ 2026-10-21) | เป็นของ app-shell |
| FRM-05 | แถบหน้าต่าง `WindowBarV1` (ป้ายสถานะบันทึก 4 แบบ + popover + E-CLOUD) | [Canvas B](https://claude.ai/artifact/P1JcYv8G7hhXLkHwMFLTVK) (สำเนาใน Canvas A) | Done (ผู้ใช้อนุมัติ 2026-10-21) | เป็นของ app-shell · ต้นฉบับอยู่ B |
| SCR-16 | Block Lab ตัวแก้ไข (ต้องมี งานใหม่ + งานของฉัน) | [Canvas C](https://claude.ai/artifact/1tXuNM7Q26QfEfv5Legqrh) | ยังไม่เริ่ม | เป็นของ block-lab |
| (เก่า) | `MyWorkLocalV4C/V5A`, `MyWorkV4C`(+New) แบบโฟลเดอร์ในเครื่อง · `HomeV6AArm` (ถูกลบใน EDIT-06) | [ARCHIVE](https://claude.ai/artifact/NEfH8TjNuN5vavL7pjcD9Y) (ส่วนตัว) | Archived | ไม่ใช้ |

ข้อมูลตัวอย่างที่ FRM-03 ใช้: Arm 7 งาน (มีชื่อยาว "เรียงบล็อกสีแดง เขียว น้ำเงิน ให้เป็นแถวตรงตามลำดับสีรุ้ง") · Block 6 งาน · `many` = 17 / 15 งาน · หุ่นกลุ่ม 1/3/5 · เครื่อง ห้องคอม 2-15 (FRAME_REGISTRY เดิม) · ชื่องานตัวอย่างบนหน้าหลัก FRM-01: Arm = แขนหยิบกล่อง, โบกมือทักทาย, ส่งลูกบอล · Block = รถเลี้ยวหลบกล่อง, ไฟกะพริบตามจังหวะเพลงวันเกิดของเพื่อนในห้อง (ชื่อยาว), กดปุ่มแล้ว buzzer ดัง · ผู้ใช้ตัวอย่าง "น้องมายด์"

## ติดตาม R → D → OQ

ยังไม่มี D# · frame ใน Canvas A ที่เกี่ยวข้องดูตารางด้านบน (ยังไม่ได้ลงทะเบียนเป็น D#)

| Req | สรุป | Design | OQ |
|---|---|---|---|
| R1 | บันทึกบน cloud เป็นค่าเริ่มต้น แทนโฟลเดอร์ | - | OQ2, OQ3 |
| R2 | export (Arm .ini · Block รูปแบบแยก + วงจร) | - | OQ5 |
| R3 | กู้คืนงานสำรองในเครื่อง (SCR-10) | - | OQ9 |
| R4 | นำเข้า .ini (?) | - | OQ4 |
| R5 | หน้างานของฉันตามโปรแกรม (SCR-09) | - | OQ6, OQ7 |
| R6 | การสร้างงานใหม่ (หน้างานของฉัน + Ctrl+N ในตัวแก้ไข ไม่สร้างบนหน้าหลัก) | - | - |
| R7 | ออฟไลน์ + สถานะ sync 4 แบบ | - | OQ1, OQ2 |
| R8 | ฉบับใหม่กว่าชนะ + แจ้ง | - | OQ1, OQ2 |
| R9 | dialog นำท่าจากงานอื่นมาต่อ | - | OQ4 |
| R10 | งาน Block บันทึกวงจรกับ cloud | - | OQ5 |
| R11 | ข้อมูลเด็กเท่าที่จำเป็น | - | OQ8 |

## Design

| ID | ครอบคลุม | ไฟล์ | Canvas | Artboard | Publish | อัปเดต |
|---|---|---|---|---|---|---|

## ขั้นถัดไปที่ระบบเก่าวางไว้
- FRM-07 กู้คืนงานสำรอง (Canvas A · ขนาดเล็ก) · FRM-03 และ EDIT-09 รอผู้ใช้ตรวจบน canvas
- Block Lab ตัวแก้ไข (SCR-16 ใน Canvas C) ต้องมี "งานใหม่" + "งานของฉัน" แบบเดียวกับ Arm Lab
- ถาม dev: ความถี่บันทึกอัตโนมัติ, "ใหม่กว่า" นับอย่างไร, ชื่อ/โครงสร้างไฟล์ Block (DEV-Q05, DEV-Q06)

## สถานะ
- Feasibility: ยังไม่ได้ทำโดย `ruler` (มีข้อมูลอ้างอิงจาก Architect ระบบเก่า: GO WITH CONDITIONS · ดู feasibility.md)
- OQ ที่ยังเปิด: OQ2, OQ4, OQ5, OQ6, OQ9 (ไม่มีข้อที่ block ออกแบบ) · ตอบแล้ว: OQ1, OQ3, OQ7, OQ8
- Review: ยังไม่ได้ทำ (ระบบเก่าไม่ได้ตรวจ FRM-03 · มีข้อมูลอ้างอิงใน review.md)
- ข้ามขั้น: -
