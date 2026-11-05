# BE-010 — AI_exercise/submit: identity from JWT only

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

แก้แบบเดียวกับ BE-009 ให้ `AI_exercise/submit` (`CompassApiController.cs:675` — ยืนยันบรรทัดกับ source ปัจจุบัน): ใช้ `UserData.UserID` (JWT) แทน `request.SID`, เพิ่มตรวจ `ud == null → 401`, คง field `SID` ใน request DTO แต่ server ไม่อ่าน, `SID` ใน response เป็น `UserData.UserID` เสมอ — REQ-015 บังคับปิดให้ครบทุกจุด ไม่ใช่แค่จุดเดียว — endpoint นี้เป็นหนึ่งในสามจุดที่ยังรับ `SID` จาก client (DES-017)

## References

REQ-009, REQ-015, AC-009.2, AC-015.1, DES-017

## Scope

แก้เฉพาะเรื่องตัวตน — logic การตรวจให้คะแนน/บันทึกผลของ submit ไม่อยู่ในขอบเขต (ยังเป็น TODO ของ REQ-008 ตามเดิม)

- Security-sensitive: yes

## Out of Scope

ห้ามถอด field `SID` ออกจาก `VMExerciseSubmitRequest`; server ห้ามอ่านค่าที่ client ส่งมา; response ห้ามสะท้อนค่า client

## Expected Output

none

## Acceptance

AC-015.1: `AI_exercise/submit` ใช้ `UserData.UserID` เสมอ — ค่า `SID` จาก client ถูกละเว้น และ `ud == null` → 401
AC-009.2: การแก้เลขนักเรียนใน request ต้องไม่ทำให้เห็น/ส่งผลของเด็กคนอื่นได้

## Dependencies

—

## Handoff

ตรวจ AC-015.1 และ AC-009.2 แบบเดียวกับ BE-009 (ส่ง SID ตัวเอง/คนอื่น/ไม่ส่ง) — บันทึกผลว่าผลลัพธ์ผูกกับ JWT เสมอ;
ยืนยันบันทึกผล (ถ้ามี) ผูกกับ `UserData.UserID` ไม่ใช่ค่าที่ส่งมา
เหมือน BE-009 — ถอด/คงต้องตัดสินร่วมกันทั้งสาม endpoint (BE-009/010/011) เพราะ REQ-015 นับเป็นชุดเดียว;
หน้าจอเดิมไม่พังเพราะ field `SID` คงอยู่ใน DTO
ส่งต่อ reviewer

Back-links: `INDEX.md`
