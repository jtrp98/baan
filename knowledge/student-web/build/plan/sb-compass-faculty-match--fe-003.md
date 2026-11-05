# FE-003 — Resolution + approval console screen

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

หน้าจอปุ่ม resolution (new/replace/discard) + ปุ่มอนุมัติ — เงื่อนไขก่อนอนุมัติ 6 ข้อแสดงเป็น UX hint เท่านั้น เซิร์ฟเวอร์ยังเป็นแหล่งความจริงเดียว (ต่อ BE-016/BE-017) — ถ้าหน้าจอบังคับแทนเซิร์ฟเวอร์ ผู้ใช้จะเข้าใจว่าเงื่อนไขผ่านแล้วทั้งที่เซิร์ฟเวอร์ปฏิเสธ — ความจริงต้องมาจากฝั่งเดียว

## References

REQ-003, AC-003.1, DES-023, DEC-023

## Scope

ปุ่มส่งคำสั่งไป endpoint จริงเสมอ · hint 6 ข้อเป็นข้อความช่วยจำ ไม่ใช่ตัวตัดสิน · error จากเซิร์ฟเวอร์ (ข้อที่ล้ม) ต้องแสดงกลับให้คนตรวจเห็น

- Security-sensitive: yes

## Out of Scope

เงื่อนไข 6 ข้อฝั่งเซิร์ฟเวอร์ · endpoint · หน้าจออื่น

## Expected Output

none

## Acceptance

AC-003.1 (ฐานการตัดสิน): คนตรวจตัดสิน resolution และกดอนุมัติผ่านหน้าจอได้จริง โดยผลเสมอมาจากการตรวจของเซิร์ฟเวอร์ — ไม่มีทางที่หน้าจอปล่อยผ่านสิ่งที่เซิร์ฟเวอร์ปฏิเสธ

## Dependencies

BE-016, BE-017

## Handoff

ตรวจ AC-003.1 (ฐานการตัดสิน) ด้วยการกดจริงทั้ง 3 resolution + อนุมัติบนชุดข้อมูลขาดเงื่อนไข (ต้องเห็นข้อที่ล้มจากเซิร์ฟเวอร์) — เก็บผลเป็นหลักฐาน
หน้าจอใหม่ additive — revert ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
