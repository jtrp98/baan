# Gateway–SchoolBot — JWT identity และ tenant boundary

> Rev 4 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

Gateway รับผิดชอบ authenticate JWT ผ่าน pipeline เดิม Controllers resources ใช้ Authorize และ SchoolBotHttpPipeline ปฏิเสธ AccessLevel=0 (temporary/device-unverified) กับ principal ที่ไม่มี PostalCode เป็น schoolId>0 หรือ Sid เป็น userId>=0 ไม่ส่ง opaque Bearer ไป SchoolBot

## Metadata และ authority

Pipeline สร้าง metadata ใหม่: x-school-id จาก PostalCode, x-user-id จาก Sid; x-admin-id จาก admin_id, x-is-admin จาก IsAdmin, x-employee-id จาก claim user_id ที่เป็นจำนวนบวก; userId>0 lookup ITusersRepository ด้วย schoolId/userId แล้วส่ง x-user-type เป็น student เมื่อ CType='0' มิฉะนั้น employee ไม่อ้างว่า mapping นี้พิสูจน์ cardinality/linkage ของระบบจริงครบแล้ว

X-Device-Entitlement หนึ่งค่าไม่เกิน 4096 ตัวอักษรส่งเป็น x-device-entitlement; SchoolBot ตรวจ signer/typ/aud/expiry/school/binding/epoch/jkt กับ license ที่ยัง active ก่อนให้ desktop principal TAdmin ใช้ admin_id และไม่มี TUsers row; Curriculum resolver ให้ staff_admin roles content_author/content_approver/license_admin เมื่อมี AdminId การรับรองนโยบายและแหล่งสิทธิ์จริงยังเป็นงาน integration/security

RequestPreparation สร้าง UUID x-request-id, x-caller=api-gateway, traceparent ที่ถูกต้อง, x-lang=th|en และ origin; reject duplicate authority headers ไม่ copy x-school-id/x-user-id ที่ client ส่งมาเป็นสิทธิ์ If-Match/idempotency ถูก map เป็นฟิลด์ของแต่ละ request ไม่ส่ง credential/cookie ทั้งชุด

SchoolBot ตรวจ metadata allowlist/ขนาด/ซ้ำและ trusted peer ก่อนใช้ GatewayIdentity; x-caller อย่างเดียวไม่พิสูจน์ peer DenyAllGatewayPeerVerifier ยังเป็น default

## ขอบเขต

device-challenges, licenses/activate, licenses/validate และ updates/check ไม่ต้องมี user identity; resource requests ต้อง full login ข้อนี้ไม่ใช่หลักฐานว่า Desktop login หรือ BFF cookie/CSRF เสร็จแล้ว Session/private exchange ของสัญญาเดิมไม่มี RPC ใน contract ปัจจุบัน ต้อง reconcile DES-004/DES-012 ก่อนนำสัญญาเก่ามาใช้ต่อ

## หลักฐาน

Gateway SchoolBotHttpPipeline.cs:242 เป็นต้นไป, SchoolBotRequestPreparation.cs; SchoolBot API GrpcServices/GatewayIdentity.cs, GatewayPrincipalResolver.cs, SchoolBotGrpcMetadata.cs และ SchoolBotGrpcRegistration.cs ตรวจ 2026-11-04 ที่ SchoolBot35c62bf/Gatewayb4181ca; [หลักฐาน local](gateway-integration-evidence.md)
