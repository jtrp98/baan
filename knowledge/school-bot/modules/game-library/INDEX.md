---
module: game-library
updated: 2026-11-06
status: draft
depends_on: [app-shell, my-work, quiz]
target: school-bot
platform: desktop
os: [windows, mac]
---

# game-library (สารบัญ module)

เป้าหมาย: เมนู "เกม" (sidebar รายการที่ 3 · app-shell R7) คลังเกมที่นักเรียนเลือกเล่นได้อิสระ ไม่ล็อกตามบทเรียน · ใช้ engine เดียวกับด่านเกมในบทเรียน (ข้อเสนอ `../../design/system/game-platform/`)

## ไฟล์ (อ่านเฉพาะที่งานต้องใช้)

| ไฟล์ | อ่านเมื่อ |
|---|---|
| [shared/requirements.md](shared/requirements.md) | ต้องรู้ว่าต้องทำอะไร (R#, กฎ, edge case) |
| [shared/oq.md](shared/oq.md) | ต้องรู้ว่ามีอะไรยังไม่ตัดสิน |
| [design/feasibility.md](design/feasibility.md) | ตรวจ logic / ดูเงื่อนไขจาก role 2 (สรุป + ทุก R# + ทั่วไป: RSK-11, module ที่พึ่งพา, ตารางสถานะ, DS gap, R# ที่ควรแก้) |
| [design/feasibility/R1.md](design/feasibility/R1.md) | ชั้นแนะนำต่อเกม, 13 เกมกับ RSK-11, ไม่รู้ชั้น |
| [design/feasibility/R5.md](design/feasibility/R5.md) | ด่านวันนี้: seed/รุ่นโปรแกรม, ทางแก้อ้างอิง, ขอบวัน |
| [design/feasibility/R6.md](design/feasibility/R6.md) | ใบ้ 3 ขั้นต่อ world, สถิติดีสุด, หน้าจบ, a11y เกมเวลาจริง |
| [design/feasibility/R8.md](design/feasibility/R8.md) | ข้อขัดโหลดผลไม่ได้ ↔ ออฟไลน์, ช่องทางอัปเดตด่าน, สถานะที่ขาด, sync |
| design/ | แก้หรือตรวจ design (เลือกไฟล์ D# จากตาราง Design) |
| [design/review.md](design/review.md) | ดูผลตรวจ |
| handoff.md | ส่งต่อ dev (มีเมื่อทำ handoff แล้ว) |

## Canvas

ยังไม่มี (ผู้ใช้ 2026-11-06: ถามอีกครั้งก่อนเริ่มออกแบบ)

สร้าง canvas: session หลักเท่านั้น · ไม่มี C# ที่ใช้ได้ → ถามผู้ใช้ก่อนเริ่มงานทุกครั้ง (กฎ "ไม่มี canvas" ใน CLAUDE.md) · สิทธิ์: private / shared (shared ต้องได้รับอนุมัติก่อน publish)

| ID | ชื่อ | ลิงก์ | สิทธิ์ | ใช้กับ |
|---|---|---|---|---|

## ติดตาม R → D → OQ

| Req | สรุป | Design | OQ |
|---|---|---|---|
| R1 | หน้าคลังเกม 13 เกม · เห็นทุกเกม เรียงตามชั้น · กรองหมวด | - | OQ3, OQ6, OQ7 |
| R2 | การ์ดเกม: ภาพ ชื่อ ทักษะ Tag ชั้นแนะนำ ผ่าน x/y | - | OQ2, OQ6, OQ8 |
| R3 | หน้าเกม: ทักษะ สถิติ รายการด่าน เล่นต่อ / ด่านวันนี้ | - | OQ2, OQ8, OQ10, OQ13, OQ15 |
| R4 | ความยากระดับเดียว · ด่านเลือกอิสระ · ด่านแรกสอนวิธีเล่น | - | OQ6, OQ13 |
| R5 | ด่านวันนี้ เหมือนกันทุกคน สร้างจากวันที่ | - | OQ1, OQ5, OQ11 |
| R6 | จำลองบนจอ · ใบ้ 3 ขั้น · ไม่มีดาว · เป้าเสริม · สถิติตัวเอง | - | OQ10, OQ11 |
| R7 | ออกกลางด่าน เก็บเฉพาะด่านที่จบ | - | OQ9 |
| R8 | เล่นออฟไลน์ · sync cloud | - | OQ8, OQ12 |
| R9 | ไม่แชร์ ไม่มีอันดับ ครูไม่เห็น | - | - |
| R10 | 3 ภาษา · WCAG AA · DS เท่านั้น | - | - |
| R11 | มาสคอตในใบ้/ผ่านด่าน | - | - |
| R13 | เกมแนะนำบนหน้าหลัก (engine เดียวกับบทเรียนล่าสุด) | - | OQ14 |
| R12 | Future: อันดับ สร้างด่าน อิสระ แชร์ รางวัล หุ่นจริง G12 | - | OQ4 |

## Design

| ID | ครอบคลุม | ไฟล์ | Canvas | Artboard | Publish | อัปเดต |
|---|---|---|---|---|---|---|

## สถานะ
- Feasibility: **ทำได้มีเงื่อนไข (ruler 2026-11-06 · R1–R12)** · ไม่มีข้อที่ทำไม่ได้ · ข้อขัดใน requirement: R8 ↔ กฎสถานะโหลดผลไม่ได้ (OQ8) · ข้อขัดกับ quiz ST-14: ออกกลางด่าน (OQ9) · ความเสี่ยงขอบเขต 13 เกม (RSK-11 · OQ7) · ไม่มีเจ้าของ R# ของ engine ที่ใช้ร่วมกับ quiz (เสนอ module/spec กลาง) · R# ที่ควรแก้ + DS gap ดู feasibility.md "ทั่วไป" · สถานะคง `draft` (session หลักเปลี่ยนเมื่อผู้ใช้ยืนยัน)
- **2026-11-06:** ruler ตรวจ R1–R12 = ทำได้มีเงื่อนไข · ผู้ใช้ตอบ OQ6–OQ9 (ข้อที่ควรตอบก่อน approved) แล้ว แก้ R1/R2/R4/R7/R8 แล้ว · OQ10, OQ11, OQ13–OQ15 ตอบแล้ว (เพิ่ม R13 เกมแนะนำ) · ยังค้าง OQ12 (รอถาม dev), OQ1/OQ5 (ก่อน dev), OQ3/OQ4 (ไม่ block) · DS gap 6 ข้อตัดสินแล้ว: Skeleton/FilterChip/Card มีภาพ/ไอคอนเติมแล้ว (DS v22) · ภาพเกม = ฉากจริงจาก engine · แถวรายการด่าน + ชุดหน้าเล่น ให้ crayon เสนอตอนออกแบบ (ds-build G15–G18)
- OQ ที่ยังเปิด (เดิม): OQ1, OQ3–OQ15 (OQ2 ตอบแล้ว) · **ควรตอบก่อน `approved`: OQ6, OQ7, OQ8** · ก่อนออกแบบ: OQ9, OQ10, OQ11, OQ13, OQ14, OQ15 · ก่อนส่ง dev: OQ1, OQ5, OQ11 (ขอบวัน), OQ12 · ไม่ block: OQ3, OQ4
- Review: ยังไม่ได้ทำ
- ข้ามขั้น: -
