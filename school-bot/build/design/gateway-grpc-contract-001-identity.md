# Gateway–SchoolBot gRPC contract — Identity และ tenant boundary

> Rev 3 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 052 — อายุ Desktop session นับจากเวลา bind)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) อธิบาย Identity และ tenant boundary.

## เอกสารอ้างอิง

[DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)

## 3. Identity และ tenant boundary

Local logout ใช้ SchoolBotAuthController → SchoolBotLogoutService ใน controller pipeline เดิม SmartScheme เลือก SchoolBotOpaque ซึ่งคืน NoResult สำหรับ prefix `/api/school-bot/service/v2`; opaque token ไม่เข้า JwtBearerHandler ส่วนการรับรอง Gateway/Light (ผู้ทบทวน implementation ของ Gateway)/H5 (เงื่อนไข listener/TLS/peer/private ingress และ trust ระหว่างระบบ) ยังรออยู่ route Q ใช้ scheme เฉพาะ opaque SchoolBot session; SchoolBot gRPC service เป็น authority ของ session, tenant, Channel, License, membership และ revocation. ไม่ส่ง opaque Bearer เข้า SmartScheme/JWT validator และไม่ mint JWT จำลอง. JWT-only ของ HTTP API Gateway ใช้ต่อกับ legacy routes; ไม่ขอ client ถือ JWT คู่ session เพื่อใช้งาน SchoolBot gRPC service.

Metadata allowlist:
- `authorization: Bearer <opaque>` เฉพาะ resource หลัง login; logout ใช้ token ใน DTO และไม่ส่งซ้ำ. ไม่ส่ง legacy credential กับ resource requests.
- `x-request-id`: UUID ที่ HTTP API Gateway ตรวจ/สร้าง; SchoolBot gRPC service ตรวจอีกครั้งและใช้กับ audit/v2 error. HTTP API Gateway requestId เดิมไม่รับประกัน UUID จึงห้าม copy โดยไม่ตรวจ.
- `x-caller=api-gateway`, traceparent ที่ผ่าน validation, x-lang=th|en; เป็น context ไม่ใช่สิทธิ์.
- `if-match`, `idempotency-key`, `origin` ตาม operation; source-rate-limit key ต้องสร้างจาก trusted ingress peer และไม่เชื่อ X-Forwarded-For ของ client. การส่งต่อไป SchoolBot gRPC service ต้องรับรองใน H5 มิฉะนั้นทุกผู้ใช้จะถูกรวมเป็น HTTP API Gateway peer.
- `x-school-id` ส่งได้เฉพาะค่าจาก JWT ที่ HTTP API Gateway validate แล้วใน flow ที่ใช้ JWT จริง; ห้ามผลิตจาก login hint/body. Resource แบบ opaque ไม่ต้องมี metadata นี้; SchoolBot gRPC service อ่าน school จาก session. หากมี trusted JWT context คู่กัน ต้องตรวจ tenant ตรง session มิฉะนั้น 403 SCHOOL_MISMATCH. x-user-id/Sid/x-is-admin ไม่ใช้สร้าง SchoolBot gRPC service principal.

HTTP API Gateway ต้องสร้าง Metadata ใหม่จาก allowlist ไม่ copy client headers แล้วหวังให้ AddIfMissing ทับ: strip x-school-id/x-user-id/x-employee-id/x-admin-id/x-is-admin/x-access-level/x-caller และ metadata ภายในทั้งหมด. Reject duplicate authority headers; Cookie อยู่ที่ Backend for Frontend (BFF), ไม่ส่งไป sb-api-gateway/SchoolBot gRPC service. BFF ตรวจ Origin/CSRF ก่อนแปลง cookie เป็น Bearer; SchoolBot gRPC service ยังคงตรวจ Origin allowlist.

Service identity ที่ยืนยัน peer และ private ingress เป็นคนละเรื่องกับ user credential; x-caller อย่างเดียวพิสูจน์ peer ไม่ได้. host/listener/TLS/service identity/secret/env owner **รอ H5**. ไม่รับปลายทาง/Host override จาก client.

Exchange ใช้ทาง C: SchoolBot gRPC service เรียก private HTTP API Gateway web-principal แล้วตรวจ active school/profile/License/StaffRole เอง. [มติ 035 (แหล่งสิทธิ์แอดมินโรงเรียน)](../../shared/decisions/decisions-035.md) ให้ HTTP API Gateway ตรวจกลุ่มแอดมิน/ผู้บริหารฝั่ง server และคง superadmin เดิม; JWT IsAdmin=0 ไม่ล้มผลกลุ่มที่ผ่าน แต่ห้ามใช้ IsAdmin=1 ลอยๆ แทน lookup. mapping/config ไม่พร้อม→503 AUTH_NOT_CONFIGURED; lookup ล้มเหลว→503 AUTH_UNAVAILABLE. cType ไม่ให้ school_admin/staff_admin. ทุก mutation re-check สิทธิ์/session/License ก่อน commit ตาม DES-012 §4; HTTP API Gateway control-plane revocation ไม่แทน SchoolBot gRPC service session revocation.
