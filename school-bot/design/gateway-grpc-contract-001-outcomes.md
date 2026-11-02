# Gateway–SchoolBot gRPC contract — 4. Login routing และ admission

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) ส่วนนี้อธิบาย4. Login routing และ admission อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)

Metadata allowlist:
- `authorization: Bearer <opaque>` เฉพาะ resource หลัง login; logout ใช้ token ใน DTO และไม่ส่งซ้ำ. ไม่ส่ง legacy credential กับ resource requests.
- `x-request-id`: UUID ที่ HTTP API Gateway ตรวจ/สร้าง; SchoolBot gRPC service ตรวจอีกครั้งและใช้กับ audit/v2 error. HTTP API Gateway requestId เดิมไม่รับประกัน UUID จึงห้าม copy โดยไม่ตรวจ.
- `x-caller=api-gateway`, traceparent ที่ผ่าน validation, x-lang=th|en; เป็น context ไม่ใช่สิทธิ์.
- `if-match`, `idempotency-key`, `origin` ตาม operation; source-rate-limit key ต้องสร้างจาก trusted ingress peer และไม่เชื่อ X-Forwarded-For ของ client. การส่งต่อไป SchoolBot gRPC service ต้องรับรองใน H5 มิฉะนั้นทุกผู้ใช้จะถูกรวมเป็น HTTP API Gateway peer.
- `x-school-id` ส่งได้เฉพาะค่าจาก JWT ที่ HTTP API Gateway validate แล้วใน flow ที่ใช้ JWT จริง; ห้ามผลิตจาก login hint/body. Resource แบบ opaque ไม่ต้องมี metadata นี้; SchoolBot gRPC service อ่าน school จาก session. หากมี trusted JWT context คู่กัน ต้องตรวจ tenant ตรง session มิฉะนั้น403 SCHOOL_MISMATCH. x-user-id/Sid/x-is-admin ไม่ใช้สร้าง SchoolBot gRPC service principal.

HTTP API Gateway ต้องสร้าง Metadata ใหม่จาก allowlist ไม่ copy client headers แล้วหวังให้ AddIfMissing ทับ: strip x-school-id/x-user-id/x-employee-id/x-admin-id/x-is-admin/x-access-level/x-caller และ metadata ภายในทั้งหมด. Reject duplicate authority headers; Cookie อยู่ที่ BFF, ไม่ส่งไป sb-api-gateway/SchoolBot gRPC service. BFF ตรวจ Origin/CSRF ก่อนแปลง cookie เป็น Bearer; SchoolBot gRPC service ยังคงตรวจ Origin allowlist.

Service identity ที่ยืนยัน peer และ private ingress เป็นคนละเรื่องกับ user credential; x-caller อย่างเดียวพิสูจน์ peer ไม่ได้. host/listener/TLS/service identity/secret/env owner **รอ H5**. ไม่รับปลายทาง/Host override จาก client.

Exchange ใช้ทาง C: SchoolBot gRPC service เรียก private HTTP API Gateway web-principal แล้วตรวจ active school/profile/License/StaffRole เอง. decisions-035 ให้ HTTP API Gateway ตรวจกลุ่มแอดมิน/ผู้บริหารฝั่ง server และคง superadmin เดิม; JWT IsAdmin=0 ไม่ล้มผลกลุ่มที่ผ่าน แต่ห้ามใช้ IsAdmin=1 ลอยๆ แทน lookup. mapping/config ไม่พร้อม→503 AUTH_NOT_CONFIGURED; lookup ล้มเหลว→503 AUTH_UNAVAILABLE. cType ไม่ให้ school_admin/staff_admin. ทุก mutation re-check สิทธิ์/session/License ก่อน commit ตาม DES-012 §4; HTTP API Gateway control-plane revocation ไม่แทน SchoolBot gRPC service session revocation.

## 4. Login routing และ admission

sys056 พบ web lookup เลือก SId ล่าสุด, mobile เลือก category หลังตรวจ password/สร้าง token; ยังไม่มี single-account selector ที่พิสูจน์แล้ว. ห้ามนำ FirstOrDefault มาเป็น cardinality contract.

ก่อนส่ง password: trusted selector ใช้ school+username ตาม normalization ของ upstream ที่เลือก; ไม่ lowercase/Unicode-normalize เอง. ต้องพบ active account เดียว, cType เป็น0หรือ1 และไม่มีความกำกวมด้านบัญชี/ประเภท; missing/deleted/unknown/ambiguous ปฏิเสธ ไม่ลองหลาย routes. Routing hint ให้เพียง account/tenant/category สำหรับเลือก student mobile หรือ employee web ไม่ให้สิทธิ์ login.

หลัง authentication: ต้องผูกผลกับ account เดิมจาก selector ตลอด password-change/2FA/contact/device stages และ re-read active account/profile/tenant ก่อนออก session. ห้ามให้ caller ส่ง validated=true หรือใช้ decoded JWT/response user เป็นหลักฐาน. private attempt binding/replay/expiry/store และ public continuation ยังรอ sb-api-gateway/owner; เอกสารนี้ไม่สร้าง ticket, actor/step field หรือ endpoint ใหม่.
