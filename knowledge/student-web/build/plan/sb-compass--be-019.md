# BE-019 — Assemble Courses in calculate/score after the premium check

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

ต่อ `Courses` เข้า response ของ `calculate/score` โดยประกอบ breakdown **หลัง** ผ่านการตรวจสิทธิ์ `compass_premium` เท่านั้น — ห้ามประกอบ payload เต็มก่อนแล้วค่อยกรองออก — Module D Security Considerations — breakdown เปิดเผยคะแนนดิบ/หน่วยกิตรายเทอมที่ละเอียดกว่าเดิม ถ้าเติม field ก่อนตรวจสิทธิ์ข้อมูลอาจหลุดผ่าน response ที่ควรถูกกั้น (DES-018 Fallback กำหนดไว้ชัด)

## References

REQ-016, AC-016.5, DES-018

## Scope

จุดประกอบ `Courses` ต้องอยู่หลังจุดที่ BE-005 กั้น 403 — ผู้ไม่มีสิทธิ์ไม่ควรมี object ของ breakdown ถูกสร้างเลยในเส้นทาง response

- Security-sensitive: no

## Out of Scope

ห้ามประกอบ payload เต็มแล้วกรอง/ตัดออกภายหลัง; ห้ามแตะกติกาประกอบข้อมูลรายวิชาของ BE-018; ห้ามแตะฝั่งฟรี

## Expected Output

none

## Acceptance

AC-016.5: ผู้ใช้ที่ไม่มีสิทธิ์ Premium ยิง API ตรง → ไม่ได้ breakdown รายวิชากลับไปเลย (ทั้ง endpoint ถูกกั้น 403 จาก BE-005)

## Dependencies

BE-018, BE-005

## Handoff

ตรวจ AC-016.5 ด้วย request ไม่มีสิทธิ์ — response ต้องเป็น 403 และไม่มี field `Courses` ในเส้นทางประกอบเลย (ตรวจได้จากโค้ดว่า
การประกอบอยู่หลังจุด 403); บันทึก response และลำดับโค้ด
ถอดการต่อ `Courses` ได้เดี่ยว (response กลับไปไม่มี field ใหม่) — FE-001 ต้องถอดพร้อมกัน; การย้ายจุดประกอบไว้ก่อนการตรวจสิทธิ์
ถือเป็นการเปิดช่องข้อมูลหลุด ห้ามทำแม้ชั่วคราว
ส่งต่อ reviewer

Back-links: `INDEX.md`
