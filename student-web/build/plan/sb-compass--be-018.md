# BE-018 — Add VMCourseBreakdown and VMSubjectStat.Courses

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

เพิ่ม `VMCourseBreakdown` (`CourseName`, `CourseCode`, `Term`, `Score` เป็นคะแนนดิบ 0-100, `Credit` เป็น `double?` — ห้ามแปลง null เป็น 0) และ field `Courses` ใน `VMSubjectStat`; ประกอบข้อมูลจาก `CompassSubjectScore` ตามกฎของสัญญา: วิชาไม่มีคะแนนเป็นตัวเลขไม่แสดง, วิชาชื่อเดียวกันหลายเทอมแสดงแยกแถวต่อเทอมพร้อมฟิลด์ `Term` (ไม่ยุบรวม), เรียงคะแนนมากไปน้อย (เท่ากันเรียงตามชื่อวิชา), non-core (`CanonicalSubject == null`) ไม่แสดง, กลุ่มที่เข้า fallback ยังแสดงโดย `Credit` ทุกแถวเป็น null และ `StudentScore` คือค่าเฉลี่ยธรรมดา — REQ-016 ให้ Premium แสดงระดับรายวิชาคู่กับระดับกลุ่มสาระ — ข้อมูล (`CourseName`/`Score100`/`Credit`) มีอยู่แล้วใน `CompassSubjectScore` ก่อนถูก aggregate จึงเป็นการเปิดดูข้อมูลเดิม ไม่ต้องเพิ่มแหล่งข้อมูล (DES-018)

## References

REQ-016, AC-016.1, AC-016.2, AC-016.3, AC-016.4, DES-018

## Scope

เป็นสัญญา response ที่ FE-001 จะอ่าน — รูปร่าง field/ชื่อ field ต้องตรงตามสัญญา; ค่า `StudentScore` ของกลุ่มสาระยังมาจาก
เมธอดถ่วงน้ำหนักของ BE-001 (ทศนิยม 2 ตำแหน่ง); `Percentile` คง 0 คงที่ตามเดิม

- Security-sensitive: no

## Out of Scope

`Credit` ห้ามแปลง null เป็น 0 และห้ามซ่อนวิชาที่ไม่มีหน่วยกิต; ห้ามแตะฝั่งฟรี (`analyst/{sID}`); ห้ามเปลี่ยน field เดิมของ
`VMSubjectStat` (ห้ามถอด/เปลี่ยนชนิด); ห้ามประกอบ breakdown ก่อนการตรวจสิทธิ์ (เป็นขอบเขต BE-019)

## Expected Output

Contract:PremiumSubjectBreakdown.v1

## Acceptance

AC-016.1: กลุ่มสาระที่มีหลายวิชาแสดงทุกวิชาแยกแถวพร้อมคะแนนดิบและหน่วยกิต นอกเหนือจากค่ากลุ่มสาระถ่วงน้ำหนักแล้ว
AC-016.2: กลุ่มสาระที่มีวิชาเดียวแสดงวิชานั้น 1 รายการ ไม่ซ่อน breakdown
AC-016.3: วิชาที่ไม่มีคะแนนเป็นตัวเลขไม่แสดงใน breakdown
AC-016.4: วิชาที่มีคะแนนแต่ไม่มีหน่วยกิตยังแสดง โดย `Credit` เป็น JSON `null` — ห้ามส่ง 0 และห้ามซ่อนวิชา

## Dependencies

BE-001

## Handoff

ตรวจ AC-016.1, AC-016.2, AC-016.3, AC-016.4 ด้วย response จริงของ `calculate/score`: กลุ่มหลายวิชา/วิชาเดียว/วิชาไม่มีคะแนน/
วิชาไม่มีหน่วยกิต/หลายเทอม/non-core — บันทึก response JSON ทุกกรณีและตรวจลำดับการเรียงตามกฎ
เพิ่ม field ใหม่ (additive) — ถอดกลับได้โดย response เดิมไม่เปลี่ยนรูป แต่ FE-001 ต้องถอดพร้อมกันเพราะอ่าน field นี้;
ไม่มี schema ฐานข้อมูลถูกแตะ
ส่งต่อ reviewer

Back-links: `INDEX.md`
