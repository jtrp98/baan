# BE-005 — Gate Premium endpoints with compass_premium (HTTP 403, Data = null)

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

กั้นทั้ง endpoint ด้วย feature key `compass_premium` โดยใช้ `CheckEntitlement` ตัวเดียวกัน — ไม่มีสิทธิ์ → คืน HTTP 403 พร้อม `VMResponseModel` ที่ `Data = null` ไม่คืน payload ให้หน้าจอซ่อนเอง: `calculate/score` (REQ-004/016), `AI_calculate/path` (REQ-005), `AI_advice/path` (REQ-006), `AI_mbti/questions`·`AI_mbti/answer`·`AI_mbti/latest` (REQ-007), `AI_exercise/path`·`AI_exercise/submit` (REQ-008), `certificate/issue` (REQ-011) — การกั้นเดิมอยู่เฉพาะฝั่งหน้าจอ คนยิง API ตรงได้ข้อมูล Premium ฟรี — REQ-013 บังคับให้ตรวจฝั่งเซิร์ฟเวอร์และห้ามคืนข้อมูลให้หน้าจอซ่อน (DES-016 ตาราง endpoint ที่ต้องกั้น)

## References

REQ-004, REQ-005, REQ-006, REQ-007, REQ-008, REQ-011, REQ-013, AC-013.1, AC-013.2, DES-016

## Scope

กั้นทั้ง endpoint ทุกตัวในรายการ (แม้ฟีเจอร์บางตัวยังไม่เสร็จ — `AI_exercise/*`, `certificate/issue`);
ค่าที่ใช้ตรวจคือ feature key `compass_premium` เท่านั้น — กรณี DB ล่ม/ไม่พบ record ให้ผล fail-closed จาก CheckEntitlement (403)

- Security-sensitive: yes

## Out of Scope

ห้ามคืน payload Premium แล้วให้หน้าจอซ่อน; `analyst/{sID}` ไม่อยู่ในรายการนี้ (กั้นระดับ field ต่างหากที่ BE-006 — ห้ามกั้น 403 ทั้ง endpoint ตัวนั้น);
ห้ามสร้างกลไกตรวจสิทธิ์ใหม่แทน `CheckEntitlement`

## Expected Output

none

## Acceptance

AC-013.1: ทุก endpoint ในรายการตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์ก่อนคืนข้อมูลเสมอ
AC-013.2: ผู้ไม่มีสิทธิ์ยิง API ตรงต้องได้ 403 พร้อม `Data = null` — ไม่ได้ข้อมูล Premium กลับไปเลยแม้หน้าจอจะซ่อนได้

## Dependencies

BE-004

## Handoff

ตรวจ AC-013.1 และ AC-013.2 ต่อ endpoint ทั้งรายการด้วย request ที่มี/ไม่มีสิทธิ์ — บันทึก status code และ response body
(ต้องเป็น 403 + Data null ทุกตัวเมื่อไม่มีสิทธิ์); ยืนยันว่าไม่มี payload Premium หลุดใน response กรณีไม่มีสิทธิ์
การถอดต้องถอดครบทุก endpoint พร้อมกัน — ถอดเฉพาะบางตัวจะทำให้การกั้น Premium ไม่สม่ำเสมอ (บาง endpoint ยิงตรงได้);
ไม่มี schema/payload เดิมถูกเปลี่ยนรูป ฝั่งผู้มีสิทธิ์ไม่ควรเห็นความต่าง
ส่งต่อ reviewer

Back-links: `INDEX.md`
