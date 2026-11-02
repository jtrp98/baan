# Desktop login adapter — Outcome decoder และ wire facts

> Rev 4 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Desktop adapter](desktop-login-adapter-001.md) ใช้ [Gateway outcome component](gateway-outcome-component-001.md) สำหรับ callable web decoder/parser/normalized outcomes โดยไม่เพิ่ม public completion หรือ session admission ใหม่

## Decode และ outcomes

Decoder รับ source_kind=mobile|web, operation, HTTP status และ bounded JSON จาก adapter ที่กำหนดปลายทางไว้เท่านั้น. ห้ามรับผล decode หรือ validated=true จาก client. ปฏิเสธ duplicate keys, wrong types, truncated JSON และ discriminant ที่ไม่รู้จัก; ห้ามตัดสินจาก message/desc.

Normalized outcome เป็นหนึ่งใน:

- pending_device: requirements เป็นชุดไม่ซ้ำของ device_verification/password_reset; artifact เป็น secret ภายใน ไม่เป็น session
- password_change: change_token
- two_factor: challenge_token, expires_at
- contact: challenge_token, expires_at
- sent: ref, masked, expires_at, resend_after_seconds; คง stage เดิม
- terminal_candidate: source_kind, token; ยังไม่มี AccountId/profile/roles ที่เชื่อถือได้
- rejected: HTTP/error code ที่ sanitize แล้ว

รายละเอียด channels/missing เป็นข้อมูลนำเสนอจาก API Gateway ไม่เป็น authority; adapter ที่จะส่งต่อให้ host ต้องตรึง nested wire shape จาก controller ของ Gateway ใน fixture ก่อนเพิ่ม public surface ห้ามส่ง opaque raw results ทั้งก้อน.

Mobile terminal_candidate ต้อง token ไม่ว่าง, temporaryToken ว่าง, isDeviceVerified=true และ forceResetPassword=false. forceResetPassword=true แม้มี full token เป็น pending password_reset ตาม authentication service ของ Gateway ไม่ใช่ success; ถ้ายังไม่ verified เพิ่ม device_verification. token/temp/flags ขัดกันนอกกรณีที่ source รองรับเป็น protocol failure.

Web200 ต้องตรงหนึ่ง branch ของ controller Gateway: requirePasswordChange=true+changeToken; next=two-factor+challengeToken/expiresAt; next=contact+challengeToken/expiresAt; หรือ token+requirePasswordChange=false โดยไม่มี pending discriminant. token ปน next/changeToken หรือ unknown next ไม่ผ่าน. send success ไม่ใช่ terminal. verify อาจไป contact ต่อ; ไม่หยุดหลัง รหัสใช้ครั้งเดียว (OTP) ครั้งแรก.

pending/challenge → terminal_candidate → trusted token + directory admission ตามรายการ admission ใน desktop-auth-review-packet-001 (memory) → fully_authenticated → commit opaque unbound session5นาที → bind profile. fully_authenticated เป็นสถานะภายใน ไม่ใช่ public access token. bind คง CreateDate+8ชั่วโมงตาม [DES-004 (ตัวตนและสิทธิ์)](des-004.md) ไม่ต่ออายุจาก retry. ก่อนครบ admission ห้ามสร้างแม้ unbound session.

## Wire facts และ correlation

Gateway code เป็น HTTP integer ไม่ใช่ semantic code; decoder ยังคง tolerance ของ string-code ตามสัญญา component Nullable Data Transfer Object (DTO) fields ของ upstream ไม่บังคับ SchoolBot ยอมรับ null ใน required authority fields แต่ละ branch ใช้ keys ของตน ห้ามเติม flags/expiry จาก branch อื่น

Gateway requestId เป็น string ไม่รับรอง UUID SchoolBot สร้าง correlation request_id UUID เอง ไม่ copy requestId; Gateway expiresAt ไม่ใช่ SchoolBot session expiry การสร้าง UUID และ request validation ไม่เพิ่มใน decoder

## หลักฐาน

- desktop-login-evidence-001 (memory): `AuthService.cs:196–207` และ `WebAuthController.cs:265–348` ยืนยัน mobile flags และ web branches; nested channels/missing ต้องตรึง wire shape ก่อนส่งต่อ host
- desktop-login-wire-evidence-001 (memory), ส่วน contract_deltas/wire_fixtures: `WebAuthController.cs:245–356`, `RequestContextMiddleware.cs:51` ไม่ได้ตรวจ Gateway ซ้ำในงานเรียบเรียง
