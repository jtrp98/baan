# BE-105 — PERMISSIONS.CRM_AI_CS/SA/PM

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-05`

## Goal

เพิ่ม `PERMISSIONS.CRM_AI_CS` / `PERMISSIONS.CRM_AI_SA` / `PERMISSIONS.CRM_AI_PM` ใน `src/constants/permission.constant.ts` — แทนตาราง staff-role แยกตามมติ design — การตรวจสิทธิ์ทุก endpoint ของโมดูลต้องอ้างค่า constant เดียวกัน — ใช้ตารางแยกจะทำให้สองแหล่งความจริงเรื่องสิทธิ์

## References

REQ-016, AC-016.2, DES-006, DEC-006

## Scope

เพิ่ม 3 ค่า constant ในไฟล์ permission เดิม — guard ของทุก route ในโมดูลอ้างชื่อค่าเหล่านี้เสมอ ไม่ hardcode string ซ้ำ

- Security-sensitive: yes

## Out of Scope

ค่า permission ของโมดูลอื่น · การผูก constant กับตาราง `TCrmStaffRole` (derive ทางเดียวเป็นของ DES-006 ภายหลัง)

## Expected Output

none

## Acceptance

AC-016.2: การตรวจสิทธิ์เข้าถึง API ยังใช้ `PERMISSIONS.CRM_AI_*` เดิม — constant ครบ 3 ค่าสำหรับ CS/SA/PM และ guard อ้างผ่านค่าเดียว

## Dependencies

—

## Handoff

ตรวจ AC-016.2 ด้วยการอ่าน guard ของ routes โมดูลว่าอ้าง constant นี้เท่านั้น — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
constant additive — ลบรายค่าได้ แต่ต้องไม่ลบขณะ guard ยังอ้างอยู่
ส่งต่อ reviewer

Back-links: `INDEX.md`
