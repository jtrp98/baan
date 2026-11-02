# BE-009 — AI_exercise/path: identity from JWT only

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

`AI_exercise/path` (`CompassApiController.cs:643` — ยืนยันบรรทัดกับ source ปัจจุบัน): เปลี่ยนจากอ่าน `request.SID` เป็น `UserData.UserID` (JWT); เพิ่มตรวจ `ud == null → 401`; คง field `SID` ไว้ใน request DTO ตามเดิมแต่ server ต้องไม่อ่านค่านั้นเลย; `SID` ใน response ต้องเป็น `UserData.UserID` เสมอ — REQ-015 — endpoint นี้ยังรับ `SID` จาก client เป็นช่อง IDOR และยังไม่มีการตรวจ `ud == null` ต่างจาก endpoint หลักที่แก้แล้ว (DES-017)

## References

REQ-009, REQ-015, AC-009.2, AC-015.1, DES-017

## Scope

แก้เฉพาะเรื่องตัวตนของ endpoint นี้ — ตรรกะที่เหลือของ `AI_exercise/path` (ยังไม่เสร็จตาม REQ-008) ไม่อยู่ในขอบเขต;
พฤติกรรม "IGNORED by design" ต้องเหมือน endpoint หลักที่ทำไว้แล้ว

- Security-sensitive: yes

## Out of Scope

ห้ามถอด field `SID` ออกจาก request DTO (`VMAdvicePathRequest`/`VMExerciseSubmitRequest` กลุ่มนี้) เพราะหน้าจอปัจจุบันยังส่งมา —
แต่ server ห้ามอ่านค่านั้น; `SID` ใน response ห้ามสะท้อนค่าที่ client ส่งมา

## Expected Output

none

## Acceptance

AC-015.1: `AI_exercise/path` ใช้ตัวตนจาก `UserData.UserID` (JWT) เสมอ — ค่า `SID` ที่ client ส่งมาถูกละเว้นทุกครั้ง และ `ud == null` → 401
AC-009.2: การแก้เลขนักเรียนใน request ต้องไม่ทำให้เห็น/ส่งผลของเด็กคนอื่นได้

## Dependencies

—

## Handoff

ตรวจ AC-015.1 และ AC-009.2 ด้วย request สองชุด (ส่ง `SID` ของตัวเอง / ส่ง `SID` ของคนอื่น พร้อมไม่ส่ง) — ผลต้องเป็นข้อมูลของ
ผู้ใช้จาก JWT เสมอ ไม่ต่างตามค่าที่ส่งมา; บันทึก response และกรณี 401 เมื่อไม่มี session
เป็นการแก้จุดเดียวต่อ endpoint — ถอดกลับได้เดี่ยว แต่การถอดจะเปิดช่อง IDOR เดิมคืน จึงต้องถอดพร้อมกันทั้ง BE-009/BE-010/BE-011
ถ้ามีเหตุถอน; field `SID` คงอยู่ใน DTO ทำให้หน้าจอเดิมไม่พัง
ส่งต่อ reviewer

Back-links: `INDEX.md`
