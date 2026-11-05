# BE-425 — ฟังก์ชัน sync กลาง (findFirst+update/create)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P4-16`

## Goal

เขียนฟังก์ชัน sync กลาง (`findFirst` แล้ว `update`/`create` — **ห้ามใช้ `upsert`** เพราะไม่มี unique constraint บน `(AdminId, FunctionalRole)` และห้ามเพิ่ม index เอง): มีสิทธิ์+ไม่มีแถว → สร้าง `Active=true`/`AssignedBy`/`AssignedAt=now()` · มีสิทธิ์+แถว `Active=false` → ตั้งกลับ `Active=true` อัปเดต `AssignedBy`/`AssignedAt` · มีสิทธิ์+แถว `Active=true` → ไม่ทำอะไร (ห้ามเขียนทับ `AssignedAt`) · ถูกถอนสิทธิ์ → `Active=false` เท่านั้น **ห้าม `delete`** · แถวซ้ำจากข้อมูลเก่า → เก็บ `CrmStaffRoleId` น้อยสุดเป็นตัวจริง ปิดที่เหลือ `Active=false` ตาม design § ข้อ 5 — สถานะเครื่องของ sync ต้องคาดเดาได้และ idempotent — upsert บนตารางไม่มี unique จะเสี่ยงสร้างแถวซ้ำเอง

## References

REQ-016, AC-016.1, AC-016.3, DES-006, DEC-006

## Scope

ฟังก์ชันกลางเดียวของทุกจุด sync — กติกา 4 สถานะ + จัดการแถวซ้ำ · ข้ามฐานข้อมูลจึงไม่มีทรานแซกชันร่วม (DEC-006)

- Security-sensitive: no

## Out of Scope

`upsert`/การเพิ่ม unique constraint/index (ห้าม) · `delete` แถว (ห้าม — ถอน = Active=false) · `AssignedAt` ของแถวที่ active อยู่แล้ว (ห้ามเขียนทับ)

## Expected Output

none

## Acceptance

AC-016.1: บทบาทตามสิทธิ์ปรากฏ/ปิดถูกต้องทุกสถานะเริ่มต้น — ไม่มีแถวถูกลบ
AC-016.3: ผู้ใช้ที่ไม่มีสิทธิ์ไม่มีบทบาท active — การถอนสิทธิ์สะท้อนเป็น Active=false

## Dependencies

—

## Handoff

ตรวจ AC-016.1/AC-016.3 ด้วยชุดทดสอบครบทุกสถานะเริ่มต้น (ไม่มีแถว/Active=false/Active=true/ถอนสิทธิ์/แถวซ้ำ) — เทียบ DB — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ฟังก์ชันใหม่ใน sync service — revert ได้ (แถวที่ sync แล้วกลับสภาพด้วยการ sync ซ้ำ)
ส่งต่อ reviewer

Back-links: `INDEX.md`
