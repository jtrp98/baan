# BE-013 — Staff auth middleware

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

Auth middleware ของ Curriculum Service — ตัวตนของผู้ใช้งาน console มาจาก SchoolBright Staff/Admin Login session (ปิด OQ-F08 2026-09-15) ห้ามรับ user id/role จาก client (DES-023 §4) — ใช้ session/token จากระบบ SchoolBright Staff ปัจจุบันโดยไม่สร้างระบบ SSO ใหม่ — คนที่ล็อกอินเข้ามาได้คือคนที่ตัดสินว่าเด็กทั้งเครือข่ายจะเห็นคำแนะนำอนาคตอะไร — ปิด OQ-F08 แล้ว โดยใช้ session ของ SchoolBright Staff/Admin ที่มีอยู่เดิม

## References

REQ-010, AC-010.1, DES-023, DEC-023, DES-024, DEC-024

## Scope

ทุก endpoint ของ console ผ่าน middleware นี้ · fail-closed เมื่อตรวจตัวตนไม่ได้ · ตรวจสอบ session กับ SchoolBright Staff/Admin Login ปัจจุบัน (สกัด UserID / SchoolID จาก token/session ที่ยืนยันแล้ว)

- Security-sensitive: yes

## Out of Scope

กลไก Staff Login session ของระบบเดิม · endpoint อื่น · สคีมา

## Expected Output

none

## Acceptance

AC-010.1 (เชิงตัวตนผู้ใช้งาน console): ทุก action ของ console ยึดตัวตนจาก session SchoolBright Staff/Admin เท่านั้น — ไม่มี endpoint ใดรับ user id/role จาก request body/header ที่ client ตั้งเองได้

## Dependencies

—

## Handoff

ตรวจ AC-010.1 (เชิงตัวตน) ด้วยการยิง request แนบ user id ปลอมใน body/header แล้วยืนยันถูกปฏิเสธ + กรณีไม่มี session ที่ถูกต้องต้อง fail-closed — เก็บผลทดสอบเป็นหลักฐาน
middleware ชั้นเดียว — revert ได้ แต่ต้องไม่ปล่อย console ขึ้นใช้จริงโดยไม่มี middleware นี้ · การเปลี่ยน provider ภายหลังแก้ที่ middleware จุดเดียว
ส่งต่อ reviewer

Back-links: `INDEX.md`
