---
module: app-shell
updated: 2026-11-02
status: draft
depends_on: []
target: school-bot
platform: desktop
os: [windows, mac]
---

# App Shell (สารบัญ module)

เป้าหมาย: โครงแอปนักเรียนที่ทุก lab ใช้ร่วม: installer · แถบหน้าต่าง (สถานะบันทึก/อุปกรณ์/ปิดอย่างปลอดภัย) · login 3 ขั้น · หน้าหลัก · ตั้งค่า/ภาษา · มาสคอต · UI เดียว ป.1–6 บน Windows/Mac

นำเข้าจากระบบเก่า 2026-10-21 · knowledge เป็นแหล่งความจริงแล้ว · บริบทร่วมโปรเจกต์: `../../shared/context.md` · brand: `../../shared/brand/README.md` (มาสคอต §8)

## ไฟล์ (อ่านเฉพาะที่งานต้องใช้)

| ไฟล์ | อ่านเมื่อ |
|---|---|
| [shared/requirements.md](shared/requirements.md) | ต้องรู้ว่าต้องทำอะไร (R#, กฎ, edge case) |
| [shared/oq.md](shared/oq.md) | ต้องรู้ว่ามีอะไรยังไม่ตัดสิน |
| [design/feasibility.md](design/feasibility.md) | ตรวจ logic / navigation ทั้งแอป / BUG ของ HomeV6A / ข้อขัดแย้งในต้นฉบับ |
| [design/feasibility/R1.md](design/feasibility/R1.md) | Installer (SCR-01) |
| [design/feasibility/R2.md](design/feasibility/R2.md) | แถบหน้าต่าง ปุ่ม Win/Mac (SCR-02) |
| [design/feasibility/R3.md](design/feasibility/R3.md) | สถานะบันทึก ST-03 + ออฟไลน์ |
| [design/feasibility/R4.md](design/feasibility/R4.md) | ชิปอุปกรณ์ (CR-08, ST-39) |
| [design/feasibility/R5.md](design/feasibility/R5.md) | ปิดโปรแกรมอย่างปลอดภัย + AUD-F01/CR-10 |
| [design/feasibility/R6.md](design/feasibility/R6.md) | Login (SCR-03, SCR-04) |
| [design/feasibility/R7.md](design/feasibility/R7.md) | หน้าหลัก (SCR-05) |
| [design/feasibility/R8.md](design/feasibility/R8.md) | ตั้งค่า/บัญชี/ภาษา (SCR-20) |
| [design/feasibility/R9.md](design/feasibility/R9.md) | มาสคอต |
| design/ | แก้หรือตรวจ design (เลือกไฟล์ D# จากตาราง Design) · ยังว่าง |
| [design/review.md](design/review.md) | ดูผลตรวจ (มีผล Auditor เดิมของแถบหน้าต่าง) |
| handoff.md | ส่งต่อ dev (ยังไม่มี) |

## Canvas

สร้าง canvas: session หลักเท่านั้น · ไม่มี C# ที่ใช้ได้ → ถามผู้ใช้ก่อนเริ่มงานทุกครั้ง (กฎ "ไม่มี canvas" ใน CLAUDE.md) · สิทธิ์: private / shared (shared ต้องได้รับอนุมัติก่อน publish)

| ID | ชื่อ | ลิงก์ | สิทธิ์ | ใช้กับ |
|---|---|---|---|---|

**ยังไม่มี C# ที่ลงทะเบียนสำหรับ module นี้ → ถามผู้ใช้ก่อนเริ่มงาน canvas** (artifact เดิมด้านล่างยังไม่ได้ `read` ยืนยันและยังไม่ได้ตัดสินเรื่อง 1 canvas : 1 module)

## Canvas และ frame ที่พบในระบบเก่า (ยังไม่ใช่ C#/D#)

| FRM เดิม | ชื่อ frame / ไฟล์ | artifact | สถานะในระบบเก่า | หมายเหตุ |
|---|---|---|---|---|
| FRM-01 | 6A · หน้าหลัก (HomeV6A.dc.html 23 KB) + component HomeRail | [Canvas A](https://claude.ai/artifact/AnEWv6UNbgcNvUXS1sfHQd) | **Done** (ผู้ใช้อนุมัติ 2026-10-21 หลัง CR-05 + CR-06) · EDIT-09 แถบหน้าต่าง + 856 รอตรวจบน canvas | R7 · Tweaks: hero, works, sync, sideOpen, os · ฐานภาพของทั้งแอป |
| FRM-05 | แถบหน้าต่าง v1 (WindowBarV1.dc.html 36 KB) | ต้นฉบับ [Canvas B](https://claude.ai/artifact/P1JcYv8G7hhXLkHwMFLTVK) · สำเนาใน Canvas A | **Done** (ผู้ใช้อนุมัติ 2026-10-21 · r2) · Audit รอบ 1 พบ F01/F03–F06 ยังไม่แก้ · ยังไม่ใส่ใน Canvas C | แก้ที่ B แล้วสำเนา A/C ทุกครั้ง · ส่วนการเชื่อมต่อรอ prop จริง (CR-08) |
| FRM-09 | Installer | Canvas B | ยังไม่สร้าง | wizard · Tweaks ขั้นตอน ST-01, ST-02 |
| FRM-10 | เลือกโรงเรียน | Canvas B | ยังไม่สร้าง | ST-04, 05, 06 |
| FRM-11 | username + password | Canvas B | ยังไม่สร้าง | ขั้น 2/3, ST-05, 07, 08 |
| FRM-15 | ตั้งค่าแอป/บัญชี | Canvas B | ยังไม่สร้าง | Tweaks ไทย/EN/中文 |
| — | ARCHIVE (ฉบับเก่า 46 ไฟล์ของ Canvas A) | [ARCHIVE](https://claude.ai/artifact/NEfH8TjNuN5vavL7pjcD9Y) | ส่วนตัว (ผู้ใช้ต้องแชร์เองถ้าทีมต้องดู) | ไม่ต้องเปิด |

## ติดตาม R → D → OQ

ยังไม่มี D# · frame เดิมดูตารางด้านบน

| Req | สรุป | Design | OQ |
|---|---|---|---|
| R1 | Installer Win/Mac ไม่มีขั้น driver | - | OQ16 |
| R2 | แถบหน้าต่าง ปิด/ย่อ/ซ่อน ตามระบบ | - | OQ3, OQ4, OQ5 |
| R3 | ตัวบอกสถานะบันทึก 4 แบบที่แถบ | - | - |
| R4 | ชิปอุปกรณ์เฉพาะใน lab | - | OQ2, OQ13 |
| R5 | ปิดอย่างปลอดภัย · ปุ่มหยุดไม่ถูกบัง | - | OQ12 |
| R6 | Login 3 ขั้น | - | OQ6, OQ7, OQ8, OQ15 |
| R7 | หน้าหลัก 2 กลุ่มงาน ไม่มีปุ่มสร้าง | - | OQ14 |
| R8 | ตั้งค่า/ภาษา 3 ภาษา/ออกจากระบบ | - | OQ1 |
| R9 | มาสคอต 10 ท่า | - | OQ9, OQ10 |
| R10 | UI เดียว ป.1–6 · WCAG 2.2 AA | - | OQ1, OQ9 |
| R11 | ขนาดหน้าต่าง 1440×900 / แถบ 60 + พื้นที่ 840 (2026-10-22) | - | OQ11 |
| R12 | ชื่อทางการและถ้อยคำ | - | OQ4 |

## Design

| ID | ครอบคลุม | ไฟล์ | Canvas | Artboard | Publish | อัปเดต |
|---|---|---|---|---|---|---|

## ขั้นถัดไปที่ระบบเก่าวางไว้
1. แก้แถบหน้าต่างที่ต้นฉบับ Canvas B: CR-10 ทาง ก + AUD-F04/F05/F06 แล้วสำเนาไป A (ก่อนใส่ใน Canvas C) · เพิ่ม prop ชนิด/ชื่อ/พอร์ตตาม CR-08
2. ทำ FRM-09, 10, 11, 15 ใน Canvas B (ออกแบบที่พื้นที่ 856)
3. ผู้ใช้ตอบ AUD-F04 (Mac ปุ่มเขียว = ซ่อน) และส่งไฟล์โลโก้ School Bot Studio · เจ้าของ design system แก้ D-14 (856), DSG-11, DSG-12, ชั้นแถบหน้าต่างใน D-18
4. Designer ตัดแยกมาสคอตท่าละไฟล์ (DEL-09)

## สถานะ
- Feasibility: ยังไม่ได้ทำโดย ruler (มีข้อมูลอ้างอิงจาก Architect เดิม GO WITH CONDITIONS ใน feasibility.md และ feasibility/)
- OQ ที่ยังเปิด: OQ2, OQ3, OQ4, OQ6, OQ7, OQ9, OQ10, OQ11, OQ12, OQ13 (OQ6 = DEV-Q01 ติดอยู่กับ dev/SchoolBright · ไม่ block ออกแบบ)
- Review: ยังไม่ได้ทำโดย highlighter · นำเข้าผล Auditor เดิมรอบ 1 (RETURN · ข้อของแถบหน้าต่าง F01 สูง, F03/F04 กลาง, F05/F06 ต่ำ) ใน review.md
- ข้ามขั้น: **2026-10-26 (ผู้ใช้สั่ง)** ข้าม `ruler` ตรวจ app-shell R2/R11 ที่แก้ล่าสุด (หน้าต่างย่อ/ขยายได้ ขั้นต่ำ 1440×900 · ปุ่มกลางเป็น "ขยาย" ยกเลิกซ่อนลง tray · ส่วนหัวร่วมทุก lab · ปุ่ม home) และข้ามเงื่อนไข `approved` ก่อนออกแบบ (module ยัง `draft`) · เหตุผล: ผู้ใช้ต้องการเห็นส่วนหัวใหม่บน canvas ก่อน (ชุดที่ 2) · เสี่ยง: ถ้า ruler พบข้อขัดแย้ง (เช่น สถานะคลาวด์ 4 แบบของ app-shell R3 หายเมื่อส่วนหัวเหลือแค่ "บันทึกแล้ว" · ลำดับปุ่มหน้าต่าง Mac · leave guard ของปุ่ม home ระหว่างส่งลงบอร์ด) ต้องแก้ส่วนหัวซ้ำ · ก่อนหน้านี้ ruler ตรวจ R2/R10/R11/R17 ของ block-lab แล้ว (2026-10-26 · ทำได้มีเงื่อนไข · OQ111–OQ116)