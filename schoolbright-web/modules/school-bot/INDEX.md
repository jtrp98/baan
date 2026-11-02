---
module: school-bot
updated: 2026-11-02
status: draft
depends_on: [school-bot/quiz]
target: sb-tech-upgrade-web-system
platform: web
os: []
requested_by: [school-bot]
---

# เว็บครู School Bot (สารบัญ module)

เป้าหมาย: ครูในโรงเรียนลูกค้า SchoolBright ใช้เว็บ (แยกจากแอป) ดูความคืบหน้าและคะแนน Quiz รายเทอม/รายปี จัดตามห้อง · ตั้งค่า · แก้ปัญหาหุ่น · ไม่ใช้มาสคอต · ไม่แสดงงาน Arm/Block

**knowledge เป็นแหล่งความจริงแล้ว** (นำเข้าจากระบบเก่า 2026-10-21) · บริบทร่วม: `../../../school-bot/shared/context.md` · brand: `../../shared/brand.md`

## ไฟล์ (อ่านเฉพาะที่งานต้องใช้)

| ไฟล์ | อ่านเมื่อ |
|---|---|
| [shared/requirements.md](shared/requirements.md) | ต้องรู้ว่าต้องทำอะไร (R#, กฎ, edge case) |
| [shared/oq.md](shared/oq.md) | ต้องรู้ว่ามีอะไรยังไม่ตัดสิน |
| [design/feasibility.md](design/feasibility.md) | ตรวจ logic / ดูเงื่อนไขจาก role 2 (สารบัญ + ทั่วไป) |
| feasibility/R1.md–R8.md | รายละเอียดหน้าจอ สถานะ ข้อมูล ประเด็น DEV-Q ของแต่ละ R# |
| design/ | แก้หรือตรวจ design (ยังว่าง) |
| [design/review.md](design/review.md) | ดูผลตรวจ |
| handoff.md | ส่งต่อ dev (ยังไม่มี) |

## Canvas

สร้าง canvas: session หลักเท่านั้น · ไม่มี C# ที่ใช้ได้ → ถามผู้ใช้ก่อนเริ่มงานทุกครั้ง (กฎ "ไม่มี canvas" ใน CLAUDE.md) · สิทธิ์: private / shared (shared ต้องได้รับอนุมัติก่อน publish)

| ID | ชื่อ | ลิงก์ | สิทธิ์ | ใช้กับ |
|---|---|---|---|---|

ยังไม่มี C# ที่ลงทะเบียนสำหรับ module นี้ → ถามผู้ใช้ก่อนเริ่มงาน canvas

## Canvas และ frame ที่พบในระบบเก่า (ยังไม่ใช่ C#/D#)

| FRM เดิม | ชื่อ frame / ไฟล์ | artifact | สถานะในระบบเก่า | หมายเหตุ |
|---|---|---|---|---|
| FRM-20 | login เว็บครู (SCR-21) | Canvas D "School Bot Studio — เว็บครู" ยังไม่สร้าง | ยังไม่สร้าง | Tweaks: ST-07, ST-08 (ลิงก์ไป SchoolBright) · ขนาดงาน เล็ก |
| FRM-21 | ภาพรวมห้อง (SCR-22) | Canvas D (ยังไม่สร้าง) | ยังไม่สร้าง · Assume (DEV-Q01) | Tweaks ST-35/36/37 · 40+ คน · ตัวกรอง ปี → เทอม/ทั้งปี → ห้อง · ขนาดงาน กลาง |
| FRM-22 | รายละเอียดนักเรียน (SCR-23) | Canvas D (ยังไม่สร้าง) | ยังไม่สร้าง · Assume | Tweaks ST-35/36 · ตารางผลรายด่าน + สถานะส่ง SchoolBright |
| FRM-23 | ตั้งค่า (SCR-24) | Canvas D (ยังไม่สร้าง) | ยังไม่สร้าง | Tweak ST-38 · ขนาดงาน กลาง |
| FRM-24 | แก้ปัญหาหุ่น (SCR-25) | Canvas D (ยังไม่สร้าง) | ยังไม่สร้าง | Tweaks ST-35, ไม่มีรายงานสถานะ |

ไม่มี canvas เดิมที่ใช้กับ module นี้ · ออกแบบที่ 1280px ขึ้นไป + Tweak 1024px (DSG-01)

## ติดตาม R → D → OQ

| Req | สรุป | Design | OQ |
|---|---|---|---|
| R1 | login ครูด้วยบัญชี SchoolBright | - | OQ2, OQ3, OQ8 |
| R2 | ตัวกรอง ปี → เทอม/ทั้งปี → ห้อง บนสุดทุกหน้า | - | OQ1, OQ9 |
| R3 | ภาพรวมห้อง ค้นหา เรียง กรอง | - | OQ1, OQ10, OQ11 |
| R4 | รายละเอียดนักเรียนรายด่าน + สถานะส่งคะแนน | - | OQ1 |
| R5 | ตั้งค่า: เปิด/ปิดหน่วย เวลาเปิดด่าน เครื่องและหุ่น | - | OQ6, OQ7, OQ8 |
| R6 | แก้ปัญหาหุ่น: คู่มือ + สถานะหุ่น | - | OQ13, OQ14 |
| R7 | สิทธิ์ ข้อมูลเด็ก (ห้องที่สอน, ไม่มีหน้ายินยอม) | - | OQ4, OQ5 |
| R8 | แพลตฟอร์ม 1280/1024, 3 ภาษา, ไม่ใช้มาสคอต | - | OQ12 |

## Design

| ID | ครอบคลุม | ไฟล์ | Canvas | Artboard | Publish | อัปเดต |
|---|---|---|---|---|---|---|

## ขั้นถัดไปที่ระบบเก่าวางไว้
- สร้าง Canvas D "School Bot Studio — เว็บครู" แล้วออกแบบ FRM-20–24 (ตามลำดับ 20 → 24)
- เจ้าของ design system บันทึก DSG-01 เป็น D ใหม่ใน DECISIONS.md (เว็บครู 1280 หลัก รองรับ 1024)
- รอ DEV-Q01 (API SchoolBright) ก่อนส่ง dev สำหรับ SCR-22, SCR-23

## สถานะ
- Feasibility: ยังไม่ได้ทำโดย `ruler` (มีข้อมูลอ้างอิงจาก Architect เดิม: GO WITH CONDITIONS ดู feasibility.md)
- OQ ที่ยังเปิด: OQ1 (DEV-Q01 · block ส่ง dev ไม่ block ออกแบบ), OQ5, OQ7, OQ8, OQ9, OQ10, OQ11, OQ14 · answered: OQ2, OQ3, OQ4, OQ6, OQ12, OQ13
- Review: ยังไม่ได้ทำ (Auditor เดิมไม่มี finding ของเว็บครู)
- ข้ามขั้น: -
