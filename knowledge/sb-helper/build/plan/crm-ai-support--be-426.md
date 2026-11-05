# BE-426 — hook: แก้สิทธิ์ role → sync ทุก user ของ role

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P4-17`

## Goal

hook เข้าจุดอัปเดตชุดสิทธิ์ของ role (`role-management.service.ts` — `PrismaTimesheet.rolePermission` ลบทั้งชุดแล้วสร้างใหม่) → sync ทุก `user` ที่ `role_id` นั้น (`is_deleted=false`) หลังเขียนสิทธิ์สำเร็จ — การแก้สิทธิ์ระดับ role กระทบคนทั้งชุดพร้อมกัน — hook หลังเขียนสำเร็จจึงไม่ทำให้การแก้สิทธิ์เป็นโมฆะ

## References

REQ-016, AC-016.3, DES-006, DEC-006

## Scope

ต่อ hook หลังเขียนสิทธิ์สำเร็จ — best-effort: sync ล้ม log error แล้วปล่อยการแก้สิทธิ์สำเร็จตามปกติ (ห้าม throw กลับ)

- Security-sensitive: no

## Out of Scope

พฤติกรรมลบ-สร้างสิทธิ์เดิม (ห้ามแก้) · การ throw เมื่อ sync ล้ม (ห้าม — ทำให้แก้สิทธิ์ล้มตาม) · schema สองฐาน

## Expected Output

none

## Acceptance

AC-016.3: แก้สิทธิ์ role แล้วบทบาทของผู้ใช้ทุกคนใน role สะท้อนถูกต้อง โดยการแก้สิทธิ์ยังสำเร็จแม้ sync ล้ม

## Dependencies

—

## Handoff

ตรวจ AC-016.3 ด้วยการแก้สิทธิ์ role จริง (ได้/เสีย CRM_AI_*) — เทียบตารางบทบาท + จำลอง sync ล้ม — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
hook ต่อหลังจุดเดียว — ถอด hook ได้โดยการแก้สิทธิ์ไม่เปลี่ยน (แต่ตารางบทบาทจะไม่ sync — ใช้ endpoint sync เต็มระบบกู้)
ส่งต่อ reviewer

Back-links: `INDEX.md`
