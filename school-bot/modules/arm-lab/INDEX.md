---
module: arm-lab
updated: 2026-11-02
status: draft
depends_on: [app-shell, my-work]
target: school-bot
platform: desktop
os: [windows, mac]
---

# Arm Lab (สารบัญ module)

เป้าหมาย: นักเรียน ป.1–6 สอนท่าแขนกล 6 ข้อต่อ แล้วเล่นเป็นลำดับ กับหุ่น Raspberry Pi ผ่าน USB · ครูตั้งค่าขั้นสูงในโหมดครู

ข้อมูลจากระบบเก่า (`~/Documents/School Bot/Handoff`) นำเข้ามาไว้ใน module นี้ครบแล้ว (2026-10-21) **knowledge เป็นแหล่งความจริง** ไม่ต้องเปิดโฟลเดอร์เดิม · บริบทร่วมโปรเจกต์: `../../shared/context.md` · brand: `../../design/archive/sketchbook-brand.md`

## ไฟล์ (อ่านเฉพาะที่งานต้องใช้)

| ไฟล์ | อ่านเมื่อ |
|---|---|
| [shared/requirements.md](shared/requirements.md) | ต้องรู้ว่าต้องทำอะไร (R1–R17, กฎ, ตัวเลข/ขีดจำกัด, edge case) |
| [shared/oq.md](shared/oq.md) | ต้องรู้ว่ามีอะไรยังไม่ตัดสิน (OQ1–OQ21) |
| [design/feasibility.md](design/feasibility.md) | ผล feasibility รวม (ruler 2026-10-21) + ตารางผลรายข้อ + เงื่อนไขหลัก + สถานะที่ขาด (H1/H5/H9) + BUG ของ frame ฐาน (ข้อมูล BUG/EDIT จาก Architect เดิม) |
| [design/feasibility/R1.md](design/feasibility/R1.md) | R1, R2, R3, R10: ฐาน 6A, โปรโตคอล Pi, แขนบนจอไม่ขยับ, ป.1–6 (ARC-I04, DEV-Q02) |
| [design/feasibility/R4.md](design/feasibility/R4.md) | R4: โหมดครู (SCR-14, SCR-15, ST-26) |
| [design/feasibility/R5.md](design/feasibility/R5.md) | R5, R11, R16: ปุ่มหยุด, เชื่อมต่อหุ่น, หลุด/เชื่อมกลับ (SCR-12/13, ตาราง ST-19–24/48, ARC-I31, DEV-Q15) |
| [design/feasibility/R6.md](design/feasibility/R6.md) | R6–R9: บันทึก cloud, export .ini, กู้คืนสำรอง, นำเข้า (เทียบ my-work) |
| [design/feasibility/R12.md](design/feasibility/R12.md) | R12–R15, R17: ท่า, ข้อต่อ/ขีดจำกัด, แก้/อ่านท่า, การเล่น, เมนูและคีย์ลัด |
| design/ | แก้หรือตรวจ design (ยังว่าง · ดูตาราง "งานออกแบบเดิม") |
| [design/review.md](design/review.md) | ดูผลตรวจ (นำเข้าผล Auditor เดิม AUD-F01, F02, F07–F09) |
| handoff.md | ส่งต่อ dev (ยังไม่มี) |

## Canvas

สร้าง canvas: session หลักเท่านั้น · ไม่มี C# ที่ใช้ได้ → ถามผู้ใช้ก่อนเริ่มงานทุกครั้ง (กฎ "ไม่มี canvas" ใน CLAUDE.md) · สิทธิ์: private / shared (shared ต้องได้รับอนุมัติก่อน publish)

| ID | ชื่อ | ลิงก์ | สิทธิ์ | ใช้กับ |
|---|---|---|---|---|
| C1 | School Bot – หน้าควบคุมแขนกล (ประถม) (Canvas A) | https://claude.ai/artifact/AnEWv6UNbgcNvUXS1sfHQd | shared ในองค์กร (ผู้ใช้เป็นเจ้าของ · `read` ได้ 2026-10-21) | R1–R17 · frame ของ Arm Lab: MainV6A (FRM-02) + component, TeacherLoginV1 (FRM-04), ConnectV3 (FRM-06), TeacherV5A (FRM-08) |

หมายเหตุ C1: canvas นี้มี frame ของ module อื่นด้วย (HomeV6A + HomeRail + WindowBarV1 สำเนา → `app-shell` · MyWorkV1/MyWorkV1Block → `my-work` · LearnMapV1 → `quiz`) → กฎ "1 canvas อยู่ใน module เดียว" ลงทะเบียนไว้ที่ module นี้ก่อน · รอผู้ใช้ตัดสินถ้าต้องแยก canvas
canvas อื่นในระบบเก่า (ยังไม่ลงทะเบียน): Canvas B เข้าระบบ+บทเรียน (WindowBarV1 ต้นฉบับ) · Canvas C Block Studio · ARCHIVE ของ Canvas A (46 ไฟล์ฉบับเก่า) · ดู `app-shell`, `block-lab`

## งานออกแบบเดิม (frame จากระบบเก่า · ยังไม่ลงทะเบียนเป็น D#)

| FRM | ชื่อ / ไฟล์ | สถานะในระบบเก่า | หมายเหตุ |
|---|---|---|---|
| FRM-02 | 6A · Arm Lab MainV6A.dc.html (327 KB) + component MainV6ATopBar, MainV6AStage → MainV6ABar, MainV6AJoints, MainV6ASeq | **Done** (ผู้ใช้อนุมัติ 2026-10-21 หลัง CR-05 + EDIT-07) · EDIT-09 แถบหน้าต่าง + เวที 768 รอตรวจบน canvas | ฐาน frame (อนุมัติแล้ว DEC-08) · แก้ผ่านใบสั่งแก้เท่านั้น · ยังต้องออกแบบ ST-21/ST-48 ตาม CR-11 |
| FRM-04 | login ครู TeacherLoginV1.dc.html (dialog) | **Done** (ผู้ใช้อนุมัติ 2026-10-21) · EDIT-09 รอตรวจ | Tweaks: ok/wrong/student/otherSchool/offKnown/offNew · ข้อมูลตัวอย่าง: โรงเรียนตัวอย่างวิทยา · ครูสมใจ (somjai.k) · น้องมายด์ |
| FRM-06 | เชื่อมต่อหุ่น ConnectV3.dc.html (73 KB) + wrapper Many/Connected/Fail2 | **Draft** · Auditor ตีกลับ (RETURN) · EDIT-10 รอผู้ใช้ตรวจ | ข้อมูลตัวอย่าง: หุ่นกลุ่ม 3 COM7 · หุ่นกลุ่ม 5 COM9 · Bluetooth COM3 · 115200/9600 bps · รหัส E-NOREPLY, E-BUSY · ต้องแก้ตาม CR-10, CR-11, AUD-F07/F08/F09 |
| FRM-08 | เมนูครู 5A TeacherV5A.dc.html (ฐาน SCR-15) | Draft (ฐานเดิม · Assume) · EDIT-03 เปิดที่หน้าเข้าแล้ว + ปุ่มออกจากโหมดครู | หน้า PIN ใน Tweaks ล้าสมัย ต้องลบ · ยังมี emoji เดิม · ทำได้ทุกเมื่อ (ไม่ขึ้นกับ DEV-Q) |
| FRM-07 | กู้คืนงานสำรอง (SCR-10) | ยังไม่สร้าง | module `my-work` |

ข้อควรรู้เมื่อแตะ frame: MainV6A มี logic/state ทั้งหมด (dialog กู้คืน/นำท่าจากงานอื่น/ออก/เริ่มใหม่, ลิ้นชักประวัติ, เมนูซ้อน) ส่ง `vals6` ให้ component ลูก · CSS `.sc-host` = display:contents · ตรวจ emoji ด้วย `tools/check_emoji.py` ของ skill schoolbot-design (ไม่อยู่ใน repo นี้) · แยก component เกิน ~150 KB (ดู `../../shared/context.md` บทเรียน canvas)

## ติดตาม R → D → OQ

ยังไม่มี D# · frame ที่เกี่ยวข้องดูตารางด้านบน

| Req | สรุป | Design | OQ |
|---|---|---|---|
| R1 | ใช้ 6A แขนกล (MainV6A) เป็นฐาน | - | OQ1, OQ20 |
| R2 | หุ่น Raspberry Pi (ใกล้เคียง Zide) | - | OQ1, OQ12, OQ14 |
| R3 | แขนบนจอไม่ขยับ | - | - |
| R4 | โหมดครู (login ครูโรงเรียนเดียวกัน) | - | OQ6, OQ7, OQ8, OQ9, OQ10, OQ12, OQ19 |
| R5 | ปุ่มหยุด · เตือน · ปิดปุ่มเมื่อหลุด | - | OQ11, OQ14, OQ15 |
| R6 | บันทึกบน cloud | - | OQ2, OQ3, OQ8, OQ21 |
| R7 | export .ini | - | OQ3 |
| R8 | กู้คืนสำรองในเครื่อง | - | OQ2, OQ3, OQ21 |
| R9 | นำเข้า .ini (?) | - | OQ4 |
| R10 | UI เดียว ป.1–6 · WCAG 2.2 AA | - | OQ8, OQ17, OQ20 |
| R11 | เชื่อมต่อหุ่น USB · สถานะ | - | OQ5, OQ14 |
| R12 | ท่าและท่าชุด (G####/K####, ท่า 0, เลิกทำ 6 วินาที) | - | OQ11, OQ17, OQ20 |
| R13 | ข้อต่อและขีดจำกัด (±180/±135/0–100%, 1000–9000 ms) | - | OQ17 |
| R14 | แก้ท่า · อ่านท่าปัจจุบัน · ประวัติ | - | OQ1, OQ12, OQ17, OQ18 |
| R15 | การเล่น (ติ๊กดูรอบหุ่น, ช่วงท่า, รอบ, เตือน 30°) | - | OQ1, OQ14, OQ16 |
| R16 | หุ่นหลุดและเชื่อมกลับ (ST-21, ST-48) | - | OQ11, OQ14, OQ15, OQ16, OQ18 |
| R17 | เมนู ☰ และคีย์ลัด | - | OQ13, OQ15 |

## Design

| ID | ครอบคลุม | ไฟล์ | Canvas | Artboard | Publish | อัปเดต |
|---|---|---|---|---|---|---|

## ขั้นถัดไปที่ระบบเก่าวางไว้
1. Designer: แก้ ConnectV3 (AUD-F07, F08) + ออกแบบ ST-21/ST-48 ตาม CR-11 ใน FRM-06 และ FRM-02 (ตัดทางข้ามท่าพัก · วิธีหยุดทางกายภาพเป็นข้อความถาวร)
2. Designer: แก้แถบหน้าต่างที่ต้นฉบับ (CR-10 ทาง ก) แล้วสำเนามา Canvas A · FRM-08 เมนูครู (ลบหน้า PIN ใน Tweaks, ตัด emoji)
3. ผู้ใช้: ตรวจ EDIT-09/EDIT-10 บน canvas · ตอบ OQ11 กับ firmware

## สถานะ
- Feasibility: **ทำได้มีเงื่อนไข** (ruler 2026-10-21 · R1–R17 · ดู feasibility.md · เสี่ยงสูงสุด R16/ST-48 ความปลอดภัยหุ่น)
- OQ ที่ยังเปิด: OQ1, OQ4, OQ5, OQ6, OQ9, OQ10, OQ11, OQ12, OQ13, OQ14, OQ17, OQ18, OQ19, OQ21 · answered: OQ2, OQ3, OQ7, OQ8, OQ15, OQ16, OQ20 (3 ข้อหลังตอบ 2026-10-21 และแก้ requirements R1, R10, R12, R14–R16 แล้ว) · **ไม่มีข้อที่ block ผล feasibility** · ต้องตอบก่อนส่ง dev: OQ1, OQ11, OQ12, OQ14, OQ18 · ที่เหลือใช้ข้อสมมติ Proposed ออกแบบต่อได้
- การเปลี่ยนสถานะ: ยังเป็น `draft` · session หลักเปลี่ยนเป็น `approved` หลังผู้ใช้ยืนยัน (ถ้าแก้ requirements.md ตาม OQ15/16/20 สถานะต้องกลับ draft ตามกฎ)
- Review: ยังไม่ได้ทำโดย highlighter (นำเข้าผล Auditor เดิม RETURN: AUD-F01 สูง ดู review.md)
- ข้ามขั้น: -
