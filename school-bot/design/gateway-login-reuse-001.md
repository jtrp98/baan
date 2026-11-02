# Gateway Login reuse — ใช้ authentication เดิมร่วมกับ SchoolBot

> Rev 4 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

สัญญานี้กำหนดให้ API Gateway รับผิดชอบ credential/challenge และ SchoolBot รับผิดชอบ session, directory และ authorization ใช้ Login HTTP เดิมของ Gateway แยกจาก client HTTP → Gateway → gRPC SchoolBot service ตาม [Gateway integration](gateway-integration-001.md) ไม่มี schema delta

## ใช้ Login ตามผู้ใช้และช่องทาง

| ผู้ใช้ | เส้นทางเดิม | สิ่งที่ต้องพิสูจน์ |
|---|---|---|
| Desktop student | /api/auth/login เป็น candidate | IMEI (รหัสประจำเครื่องโทรศัพท์)/device lifecycle, full authentication และ student/AccountId mapping |
| Desktop teacher | /api/auth/web/login พร้อม native continuation | first-password/2FA/contact และ account/profile mapping; ไม่ fallback mobile |
| school_web | web-system Login/BFF → Gateway web login | private web-principal, token exchange, admin กลุ่มฝั่ง server และ License active |
| staff_admin | Gateway web login เมื่อพิสูจน์พนักงานได้ | token exchange, active SchoolBotStaffRole และ admin BFF/bootstrap |

Two-Factor Authentication (2FA) และ contact continuation ต้องจบตาม flow เดิม คงข้อกำหนด [Desktop adapter](desktop-login-adapter-001.md) เรื่อง cType/pre-auth routing, effective bounds, decoder และ admission สำหรับ Desktop รายละเอียด payload อยู่ใน [Request และ bounds](desktop-login-adapter-requests.md)

## เงื่อนไขออก session

SchoolBot ไม่สร้าง verifier ใหม่ ไม่คัดลอก password hash และไม่เพิ่มบัญชี/mapping DB ชดเชย Local IAuthService/IWebLoginService ไม่ใช่สัญญาเรียก procedure ระหว่าง process (Remote Procedure Call: RPC)

ออก 201 ได้หลัง full authentication จาก upstream ที่เชื่อถือได้ พร้อม identity/tenant และเงื่อนไข [DES-004 (ตัวตน/สิทธิ์)](des-004.md) / [DES-012 (auth ข้ามระบบ)](des-012.md) ครบ HTTP 200, temporaryToken, AccessLevel0, forceResetPassword และ challenge ที่ยังไม่จบ ห้ามออกแม้ unbound session ห้าม fake International Mobile Equipment Identity (IMEI) หรือใช้ DeviceJkt แทน และห้ามข้าม first-password/2FA/contact

Desktop /v2/auth/login ยังไม่มี IMEI/continuation contract ห้ามเพิ่ม field/endpoint หรือรับ web token เป็น desktop sessionเอง adapter ไม่พร้อม → 503 AUTH_NOT_CONFIGURED; dependency ล่ม → 503 AUTH_UNAVAILABLE; input ผิด → 400 INVALID_INPUT; credential ผิด → 401 UNAUTHORIZED; rate limit → 429 RATE_LIMITED พร้อม Retry-After ไม่ส่ง raw errors/secrets และไม่ retry login/challenge mutation อัตโนมัติ challenge คงเป็น challenge ไม่แปลงเป็นสำเร็จหรือผิดรหัส

[DES-004 (ตัวตนและสิทธิ์)](des-004.md) มีเพดาน username256/password1024; mobile100/20; web100/100 ต้องใช้ effective validation/normalization ของ adapter ไม่ truncate หรือเปลี่ยน password ให้ผ่าน upstream

## ขอบเขต session และสิทธิ์

คง opaque SchoolBotSession, Channel, profile binding, revocation และ audit; desktop ต้อง License+DeviceJkt; school_web ต้อง License และ DeviceJkt=null; staff_admin ต้อง StaffRole และ DeviceJkt=null อายุ session และการตรวจสิทธิ์สดก่อน commit คงเดิม Gateway JWT ไม่แทน SchoolBot session; parse-legacy-token/handoff ไม่แทน private introspection

[มติ 035 (ตรวจกลุ่ม admin ฝั่ง server และคง super admin)](../requirement/decisions-035.md) ให้ school_admin เฉพาะ school_web ไม่ให้ staff_admin อัตโนมัติ

## เหตุผลและสิ่งที่ยังขาด

reuse pipeline เพราะมี attempts/lock/challenge อยู่แล้ว ปัด verifier ซ้ำหรือผสม hash สองเส้น เลือก web continuation สำหรับครูเพื่อคง challenges ไม่สรุป student entrypoint จนมี device contract Gateway→SchoolBot ใช้ gRPC ไม่ใช้ HTTP relay; HTTP Login/JSON decoder คงเดิม

internal web decoder ทำและทดสอบตรงได้ตาม [Gateway outcome component](gateway-outcome-component-001.md) แต่ไม่เท่ากับ Login ครบทั้งระบบ การต่อ public Login ยังต้องมี production caller/dependency และ trusted identity/device/transport จริง ไม่ถือ scaffolding หรือ constant503 เป็น feature

เจ้าของ Gateway/sys ส่ง completion/continuation Data Transfer Object (DTO), device lifecycle, token trust, bounds และ routing binding; legacy/vault พิสูจน์ตัวตรวจ TAdmin, identity/tenant/status, collation/hash/student login; Gateway/Light กับ SchoolBot พิสูจน์ private exposure/TLS/secret-owner/opaque isolation ตาม H5 (เงื่อนไข route/env/network/trust ระหว่างระบบ); admin owner พิสูจน์ staff bootstrap/BFF/CSRF ส่วนที่หลักฐานขาด fail closed ไม่เปิดคำถามนโยบายมติ 035 ซ้ำ

## หลักฐาน

- gateway-login-response-001, gateway-login-review-001 และ gateway-login-source-check-001 (memory): Gateway HEAD `9a03c9428a47150aa960e61ca91eedad6d0196af`, web-system HEAD `7ae35eb4ed3123783afa04e70181eb3576503e45`; working tree ว่าง ณ การตรวจเดิม ไม่อ้างสถานะ Git ปัจจุบัน
- Gateway `AuthService.cs:177` ให้ temporaryToken AccessLevel0 เมื่อ device ไม่ verified; `WebAuthController.cs:265` คืน 200 ทั้ง token/challenge; `WebLoginService.cs:206,272` ใช้ identity keys ต่างกัน; `ServiceMobile/AuthController.cs` refresh เป็น comment ไม่ใช่ route
- auth-flow-handoff-001 (memory) บันทึกผล local component/logout ไม่ยืนยัน Login ครบหรือ Gateway integration; desktop-auth-review-packet-001 (memory) ระบุหลักฐานที่ยังขาด งานนี้ไม่ตรวจ source/runtime ซ้ำ
