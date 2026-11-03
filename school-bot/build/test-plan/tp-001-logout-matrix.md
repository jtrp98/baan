# TP-001 — ตารางตรวจ Logout

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — แยก normal/full)

ระดับของ TP001-082: **normal เฉพาะแถว 1**; แถว 2–4 เป็น **ระดับ: full** ชนิดการตรวจ integration บน fake กับ UI/host ของจริงแยกตามประตู

เป็นส่วนของ TP001-082 (ออกจากระบบโดยคงสิทธิ์ License) อ่านเงื่อนไขก่อนตรวจที่ [แผนหลัก](tp-001.md) และ [Profile](tp-001-profiles.md)

| ชุดข้อมูล / ขอบเขต | ขั้นตอน (Steps) | Expected / Assertions |
|---|---|---|
| 1. เซสชันถูกต้อง + แยกเฉพาะคำขอ + คงสิทธิ์ License | สั่ง logout ด้วย Session A ผ่านช่องทางที่ได้รับอนุญาต (`POST /api/school-bot/service/v2/auth/logout` สำหรับ Desktop หรือผ่าน same-origin BFF สำหรับเว็บ); นำ Session A และ Session B ไปเรียกใช้งานต่อ; ตรวจสิทธิ์ License บนเครื่องและลองเข้าใช้งานแบบ Guest/Login ใหม่ | คืน `204 No Content` body ว่าง มี `Cache-Control: no-store` และ `X-Request-Id` UUID; SchoolBot รับเฉพาะ canonical token แล้วส่งเข้า store เป็น lowercase SHA-256 เท่านั้น; Session A ถูกเพิกถอนใช้งานต่อไม่ได้ ส่วน Session B ยังใช้งานได้ตามปกติ; สิทธิ์ License และเวลาหมดอายุออฟไลน์ 3 วันของเครื่องไม่ถูกล้างหรือลดอายุ; หน้าจอล้างสถานะบัญชี A โดยไม่รั่วข้อมูลข้ามบัญชี |
| 2. ไม่มีเซสชัน / ข้อมูลเซสชันไม่สมบูรณ์ | ส่งคำขอ logout โดยไม่มี `Authorization`, header ผิดรูป, เป็น JWT/revoked JWT, `Authorization` ซ้ำ หรือใส่ token ใน body (แม้ขณะโควตา logout ของ limiter เต็ม) | เมื่อผ่าน peer/metadata/Origin แล้ว ระบบจบคำขอด้วย `204 No Content` body ว่าง (`no-store` + `X-Request-Id`); ไม่เรียก store (`store=0`), ไม่กินโควตา limiter (`quota=0`), ไม่เปลี่ยนสถานะเซสชันอื่นหรือสถานะระบบ และไม่บังคับตรวจ License/ETag ก่อนออกจากระบบ |
| 3. ช่องทางที่ได้รับอนุญาตเท่านั้น + เกณฑ์ความปลอดภัย | (ก) เรียกจาก untrusted peerเข้า SchoolBot; (ข) ส่ง metadata ผิด/ซ้ำ/เกิน 16384 bytes หรือแนบ identity/tenant/Cookie ปลอม; (ค) ส่ง `Origin` นอก allowlist; (ง) ใช้ HTTP verb อื่นบน path logout หรือเรียก route อื่น/Production gate ปิด | (ก) SchoolBot ปฏิเสธ `Unauthenticated` โดยไม่มี semantic trailer (`store=0/quota=0`) และ Gateway ตอบ `502`; (ข) Gateway คัดกรอง header ปลอม/ซ้ำ และหาก SchoolBot พบ metadata ผิดจะตอบ `Internal/INTERNAL_ERROR` (`store=0/quota=0`) โดย Gateway ตอบ `500` v2 (เมื่อ UUID ตรง) หรือ `502` (เมื่อไม่ตรง); (ค) ตอบ `403 ORIGIN_NOT_ALLOWED` v2 ไม่มี CORS header (`store=0/quota=0`); (ง) verb อื่นได้ `405 METHOD_NOT_ALLOWED` v2, body >64 KiB ได้ `413` ก่อนถึง RPC, เมื่อ SliceGate ปิด/Production ได้ `404` (`RPC=0`), ไม่เปิดช่องทางตรงเข้า SchoolBot |
| 4. เกินขีดจำกัด / บริการขัดข้อง / ไม่รั่วข้อมูลลับ | ยิง canonical token เกิน source rate (30/60s) หรือเกิน concurrency (8); จำลอง store ล่ม (`AUTH_UNAVAILABLE`), unexpected error, deadline 15s หมด/cancel, หรือ SchoolBot ส่ง trailer ผิดรูป; ตรวจการคืน permit และสแกน HTTP response/headers/logs ทุกกรณี | เกินขีดจำกัดได้ `429 RATE_LIMITED` v2 (พร้อม `Retry-After` ที่ผ่านการตรวจเท่านั้น) และคืน work permit เมื่องานจบ/ล้มเหลว/ยกเลิก; store ล่มได้ `503 AUTH_UNAVAILABLE` v2; ข้อผิดพลาดภายในได้ `500 INTERNAL_ERROR` v2 ข้อความกลาง (`The request failed.`/`คำขอล้มเหลว`); upstream/trailer ผิดได้ `502`, หมดเวลาได้ `504` ด้วย Gateway envelope; ทุกกรณีไม่รั่ว raw token, hash, Cookie, stack trace, ชื่อตาราง/provider หรือรายละเอียดภายในทั้งใน response และ logs (รวม sanitizing channel logger) |



## คำย่อ

BFF = Backend for Frontend ซึ่งอยู่ origin เดียวกับเว็บ · RPC = Remote Procedure Call · JWT = JSON Web Token
