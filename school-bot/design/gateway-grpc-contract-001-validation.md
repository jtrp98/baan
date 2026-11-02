# Gateway–SchoolBot gRPC contract — 3. Identity และ tenant boundary

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) ส่วนนี้อธิบาย3. Identity และ tenant boundary อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)

- `LogoutRequest{optional string token}`: opaque token เท่านั้น; ไม่มี/Authorization ซ้ำ/รูปแบบผิดให้ส่ง absent. SchoolBot gRPC service ใช้ LogoutService เดิม; token ไม่พบ/หมดอายุ/revoked→204. ไม่ตรวจ License/If-Match/Idempotency-Key ก่อน logout; storage failure ห้ามคืน204.
- `WebExchangeRequest{string legacy_credential, string channel}`: credential สกัดจาก JabjaiWebKey เพียงหนึ่งค่า; channel=school_web|staff_admin. ไม่ส่ง suffix เป็น identity. หลาย credential ปฏิเสธ401. ไม่รับ school_id/is_admin จาก body.
- `DesktopLoginRequest{int32 school_id,string username,string password,DeviceProofContext proof}`: body เดิม {school_id,username,password}; proof เป็น context จาก headers ไม่เพิ่ม public body fields. bounds ใช้ adapter Rev4 โดย password ไม่ Trim. school_id เป็น lookup hint จน admission สำเร็จ.
- `BindProfileRequest{Profile profile}`; `Profile{int32 school_id,string kind,int32 profile_id}`; kind=student|employee. Profile จาก client เป็นตัวเลือกให้ SchoolBot gRPC service ตรวจ membership ใหม่ ไม่ใช่ authority.
- `SessionView{int32 session_id,string channel,optional int32 account_id,int32 school_id,optional Profile profile,bool legacy_admin,Timestamp expires_at,Timestamp update_date}`; channel=desktop|school_web|staff_admin. account_id=null หมายถึงไม่มี canonical account ที่ยืนยันสำหรับ web exchange; profile=null ใช้ได้ตาม unbound/legacy-admin rules เท่านั้น.
- `SessionIssued{string access_token,string token_type,SessionView session}`; token_type=Bearer, token เป็น CSPRNG32bytes/base64url43; ไม่มี JWT/refresh. คืนครั้งเดียวและ no-store.
- `MeView{int32 account_id,string display_name,repeated Membership memberships}`; display_name≤200; `Membership{Profile profile,repeated string roles}`, roles=student|teacher|school_admin เป็นผล resolve สด ไม่ใช่ cType.
- `RevokeSessionsRequest{int32 school_id,optional int32 profile_id,optional string legacy_admin_id,optional string channel,string reason}`; legacy_admin_id≤64, reason≤1000, channel ใช้ชุดข้างต้น. null filter หมายถึงไม่จำกัดมิตินั้นตาม DES-012. school_id เป็นเป้าหมายคำสั่ง ไม่เปลี่ยน tenant ของผู้เรียก; SchoolBot gRPC service ตรวจ staff_admin และ scope ก่อน revoke. `RevokeSessionsReply{int32 revoked}` ≥0.
- `DeviceProofContext{string canonical_method,string canonical_path,bytes original_body,repeated ProofHeader headers}`; `ProofHeader{string name,string value}`. เฉพาะชื่อ proof headers ที่สัญญา device เดิมกำหนด; HTTP API Gateway ห้ามสร้าง DeviceJkt/ผล verified เอง. ต้องตรึง manifest ชื่อ headers และ signed path หลังตัด Q เป็น /v2 กับเจ้าของก่อนเปิด Login/Bind; ระหว่างไม่พร้อมใช้ AUTH_NOT_CONFIGURED. ไม่ reserialize body ก่อนตรวจลายเซ็น.

ส่ง ETag ผ่าน response metadata `schoolbot-etag`; HTTP API Gateway คืน HTTP ETag เดิมโดยไม่ parse วันที่. If-Match และ Idempotency-Key ส่งแบบ lossless ใน metadata เฉพาะ operation ที่ต้องใช้; BindProfile ต้องมีทั้งคู่. Login/exchange/logout ไม่มี idempotency cache. Duplicate/unknown JSON keys ต้องถูกปฏิเสธก่อนแปลง protobuf.

## 3. Identity และ tenant boundary

Local logout ใช้ SchoolBotAuthController → SchoolBotLogoutService ใน controller pipeline เดิม SmartScheme เลือก SchoolBotOpaque ซึ่งคืน NoResult สำหรับ prefix `/api/school-bot/service/v2`; opaque token ไม่เข้า JwtBearerHandler ส่วนการรับรอง Gateway/Light/H5 ยังรออยู่ route Q ใช้ scheme เฉพาะ opaque SchoolBot session; SchoolBot gRPC service เป็น authority ของ session, tenant, Channel, License, membership และ revocation. ไม่ส่ง opaque Bearer เข้า SmartScheme/JWT validator และไม่ mint JWT จำลอง. JWT-only ของ HTTP API Gateway ใช้ต่อกับ legacy routes; ไม่ขอ client ถือ JWT คู่ session เพื่อใช้งาน SchoolBot gRPC service.
