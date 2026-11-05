# FE-005 — Quest bank screen

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

หน้าจอจัดการคลัง quest ระดับมิติ (~8-24 ชิ้น) พร้อมสถานะ ต่อกับ BE-021 — เนื้อหา quest ต้องผ่านการอนุมัติก่อนถึงเด็ก — หน้าจอต้องสะท้อน state machine จริง ไม่ใช่ให้แก้สถานะลอย ๆ

## References

REQ-008, AC-008.1, DES-023, DEC-023

## Scope

การเปลี่ยนสถานะส่งผ่าน endpoint ของ BE-021 (state machine ทางเดียว) — หน้าจอไม่มีปุ่มถอยสถานะ

- Security-sensitive: no

## Out of Scope

endpoint ฝั่ง BE · attempt ของนักเรียน · หน้าจออื่น

## Expected Output

none

## Acceptance

AC-008.1 (ฐานคลัง): จัดการ quest ผ่านหน้าจอได้จริงตาม state machine — quest ที่ยังไม่ approved แสดงสถานะรอตรวจชัดเจน

## Dependencies

BE-021

## Handoff

ตรวจ AC-008.1 (ฐานคลัง) ด้วยการเดินสถานะผ่านหน้าจอจริงแล้วเทียบกับ endpoint — เก็บผลเป็นหลักฐาน
หน้าจอใหม่ additive — revert ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
