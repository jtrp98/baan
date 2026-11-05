# FE-014 — `nCourseIntensity` selector in timetable create/edit modal + settings level labels (UX-002, DES-019 D51)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

เพิ่มตัวเลือกระดับ 0/1/2 ใน modal สร้าง/แก้ตาราง (ตำแหน่ง/ป้ายตาม UX-002 ที่เซ็น) และส่ง `nCourseIntensity` ใน `Timetable/Set` · ตารางใหม่ prefill จาก `Tbl_Setting.nCourseIntensity` ของ (โรงเรียน, ปี) · ตารางเดิม prefill จาก `Timetable/Get` (NULL → 0) · แก้ป้ายระดับใน `/timetable/settings` ให้ตรง BR-78 (0 = ไม่กระจาย, 1 = พยายามกระจายวิชาหนัก, 2 = พยายามสลับหนัก-เบา — ถ้อยคำจริงตาม UX-002) และแก้ key ↔ ป้ายที่เลื่อนกันหนึ่งระดับ (D51) — AC-054 — วันนี้ไม่มี UI ตั้ง L ต่อตาราง ตารางใหม่ได้ L = 0 เสมอ (FE-003) · ป้ายปัจจุบันขัดนิยามธุรกิจ (D51)

## References

REQ-002, AC-054, DES-019, DEC-019

## Scope

ใช้ UX-002 ฉบับเซ็น as-is 2026-10-04 · ป้าย UI ไม่ใช่การยืนยันธุรกิจ (บทเรียน D43) — ความหมายระดับมาจาก BR-78 เท่านั้น · ค่าใน `/timetable/settings` เป็นค่าตั้งต้นของตารางใหม่เท่านั้น · `Tbl_Setting.nCourseIntensity` คงไว้ · ส่งได้เฉพาะ 0/1/2 (VR-21) · ห้ามสร้างโหมดกรอกความหนักรายวิชา · ประตู `schema`: อ่าน/เขียนคอลัมน์ที่ยืนยันแล้ว — **deploy ได้หลัง `devops` รัน DDL (PRE-01) และ BE-003 live**

- Security-sensitive: yes

## Out of Scope

API `Timetable/Set|Get` (BE-003) · `Setting/Set|Get` · solver/สรุป (FE-003/FE-008)

## Expected Output

none

## Acceptance

AC-054: เลือก 0/1/2 ใน modal แล้วบันทึก → `Timetable/Get` คืนค่าที่เลือกและ Generate ใช้ระดับนั้น · ตารางใหม่ prefill ค่าของ `/settings` · ตารางเดิม NULL แสดงเป็น 0 · ป้ายใน `/settings` และ modal ตรง BR-78 และ UX-002 ที่เซ็น · key ↔ ป้ายไม่เลื่อน (D51)

## Dependencies

BE-003

## Handoff

ตรวจ AC-054 ด้วยการสร้าง/แก้ตารางด้วยทั้ง 3 ระดับแล้วอ่านกลับจาก `Timetable/Get` + Generate ด้วยระดับที่เลือก + ตรวจ prefill ทั้งตารางใหม่และตารางเดิม (NULL → 0) + ภาพป้ายทั้งสองหน้าเทียบ BR-78 และ UX-002 ที่เซ็น · typecheck/lint/build ผ่าน — เก็บ response ที่อ่านกลับและภาพป้ายเป็นหลักฐาน
revert UI → ตารางใหม่กลับเป็น L = 0 (ค่าที่บันทึกแล้วคงอยู่) · ห้าม revert BE-003 ขณะ UI นี้ใช้งาน
ส่งต่อ reviewer

Back-links: `INDEX.md`
