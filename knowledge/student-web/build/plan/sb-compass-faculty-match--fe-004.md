# FE-004 — Question bank screen

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

หน้าจอจัดการชุดคำถาม RIASEC กลาง (ทั้งสองรูปแบบ) ต่อกับ BE-020 — ทีมงานต้องดูแลคลังคำถามได้เองโดยไม่แตะฐานข้อมูลตรง ๆ — และต้องเห็นสองรูปแบบคำถามแยกกันชัดเจน

## References

REQ-012, AC-012.3, DES-023, DEC-023

## Scope

แสดง/แก้ผ่าน endpoint ของ BE-020 เท่านั้น · แยกมุมมอง Likert กับบล็อกเรียงลำดับชัดเจน

- Security-sensitive: no

## Out of Scope

endpoint ฝั่ง BE · คำตอบนักเรียนที่เก็บแล้ว · หน้าจออื่น

## Expected Output

none

## Acceptance

AC-012.3 (ฐานคลัง): จัดการคำถามทั้งสองรูปแบบผ่านหน้าจอได้จริง และข้อมูลที่แสดงตรงกับสิ่งที่ endpoint เก็บ

## Dependencies

BE-020

## Handoff

ตรวจ AC-012.3 (ฐานคลัง) ด้วยการเพิ่ม/แก้/ปิดใช้คำถามผ่านหน้าจอจริงแล้วเทียบกับ endpoint — เก็บผลเป็นหลักฐาน
หน้าจอใหม่ additive — revert ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
