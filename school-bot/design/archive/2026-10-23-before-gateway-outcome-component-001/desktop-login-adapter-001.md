# Desktop login adapter — Rev1

สถานะอยู่ที่ [index](index.md). สัญญานี้ครอบ outcome/admission ภายใน; ไม่สร้าง public endpoint หรือ schema. ใช้ร่วม [packet](desktop-auth-review-packet-001.md), DES-004 Rev9 และ DES-012 Rev7.

## ฐานหลักฐาน

G/B = target/sb-api-gateway และ target/school-bot. G อ้าง source:line ที่ sys033 อ่านจริงใน [evidence](../planning/desktop-login-evidence-001.json); ไม่อ้างตรวจ G/runtime ซ้ำ. ตรวจ B เพิ่มจริง: Program.cs:43–44,84–118 มี memory management และ v1 License/Release; ManagementService.cs:45–65 ใช้ key/device ID ไม่ใช่ DeviceJkt proof; InMemoryManagementStore.cs:8–13 ไม่มี session; ApiErrors.cs:18–20 เป็น v1 envelope; ApiHelpers.cs:19–28 มี WebApplicationFactory/FakeClock. พาธ C# เหล่านี้อยู่ใต้ B/web/src หรือ B/web/tests/SchoolBot.Tests ตามชื่อ project.

## ทางเลือก

ครูเลือก native continuation ผ่าน B adapter ไป G web flow เดิม; ปัด browser handback เพราะไม่มี callback/redemption binding และไม่ fallback mobile. นักเรียนใช้ mobile ได้เฉพาะเมื่อ owner พิสูจน์ Desktop device lifecycle; ขณะนี้ไม่มีเส้นสำเร็จที่ยืนยันได้. ปัด verifier/hash ใหม่และ fake IMEI. B/app/desktopservice.go:70–78 สุ่ม installation ID ซึ่งไม่ใช่ IMEI/DeviceJkt.

## DTO ภายในและ bounds

เป็นคำสั่งภายใน adapter ไม่ใช่ body ที่เปิดให้ client เรียกใหม่. actor=student|employee, channel=desktop ถูกตรึงตลอด attempt. school_id เป็น positive int32; mobile จำกัด1..99999. ขอบเขต string ใช้ UTF-16 code units ให้ตรง C#; ไม่ truncate/lowercase/Unicode-normalize/password trim.

| operation | G route ใต้ /api/auth | payload |
|---|---|---|
| student_login | /login | user:string1..100, password:string1..20, schoolId:int, imei:string1..50 จาก lifecycle ที่ owner รองรับเท่านั้น |
| employee_login | /web/login | schoolId:int, username:string1..100 หลัง Trim, password:string1..100, lang?:string, trustedDeviceToken?:secret |
| first_password | /web/first-password | changeToken:secret, newPassword:string1..100, lang?:string |
| two_factor_send | /web/two-factor/send | challengeToken:string1..200, channel:sms|email |
| two_factor_verify | /web/two-factor/verify | challengeToken:string1..200, code:string1..20, trustDevice:boolean |
| contact_send | /web/contact/send | challengeToken:string1..200, type:phone|email, value:string1..100 |
| contact_verify | /web/contact/verify | ฟิลด์ contact_send + code:string1..20 + trustDevice:boolean |

อ้าง G WebAuthController.cs:15–35,143–245; WebLoginService.cs:58 และ mobile LoginRequestValidator.cs:10 ตาม033. lang/trusted token/new-password policy ใช้ G เดิม; ไม่ถือ bounds ข้างบนเป็นการยืนยัน complexity policy. ไม่แปลง phone/email/code เอง; G ตรวจและ normalize ตาม flow เดิม. contact_verify ต้องใช้ type/value ของ send เดียวกัน.

DES-004 username256/password1024 เป็นเพดานเดิมก่อนส่ง upstream: หากเกิน effective bounds คืน400 INVALID_INPUT ก่อนเรียก G; ไม่ลองอีก actor. employee Trim เฉพาะ username; student เทียบตามเดิม. secret ใช้ภายใน memory ไม่ log/persist. เพดาน parser ที่เสนอ: request64KiB, response2MiB, depth32; token/changeToken/trustedDeviceToken ไม่เกิน16KiB UTF-8; challenge ยังไม่เกิน200ตาม G. ค่าป้องกัน parser เป็นการออกแบบ B ไม่ใช่ deployed limit ของ G.

## Outcome และการเปลี่ยนขั้น

Decoder รับ source_kind=mobile|web, operation, HTTP status และ bounded JSON จาก adapter ที่กำหนดปลายทางไว้เท่านั้น. ห้ามรับผล decode หรือ validated=true จาก client. ปฏิเสธ duplicate keys, wrong types, truncated JSON และ discriminant ที่ไม่รู้จัก; ห้ามตัดสินจาก message/desc.

Normalized outcome เป็นหนึ่งใน:
- pending_device: requirements เป็นชุดไม่ซ้ำของ device_verification/password_reset; artifact เป็น secret ภายใน ไม่เป็น session
- password_change: change_token
- two_factor: challenge_token, expires_at
- contact: challenge_token, expires_at
- sent: ref, masked, expires_at, resend_after_seconds; คง stage เดิม
- terminal_candidate: source_kind, token; ยังไม่มี AccountId/profile/roles ที่เชื่อถือได้
- rejected: HTTP/error code ที่ sanitize แล้ว

รายละเอียด channels/missing เป็นข้อมูลนำเสนอจาก G ไม่เป็น authority; adapter ที่จะส่งต่อให้ host ต้องตรึง nested wire shape จาก WebAuthController.cs:265–348 ใน fixture ก่อนเพิ่ม public surface ห้ามส่ง opaque raw results ทั้งก้อน.

Mobile terminal_candidate ต้อง token ไม่ว่าง, temporaryToken ว่าง, isDeviceVerified=true และ forceResetPassword=false. forceResetPassword=true แม้มี full token เป็น pending password_reset ตาม G AuthService.cs:196–207 ไม่ใช่ success; ถ้ายังไม่ verified เพิ่ม device_verification. token/temp/flags ขัดกันนอกกรณีที่ source รองรับเป็น protocol failure.

Web200 ต้องตรงหนึ่ง branch ของ G WebAuthController.cs:265–348: requirePasswordChange=true+changeToken; next=two-factor+challengeToken/expiresAt; next=contact+challengeToken/expiresAt; หรือ token+requirePasswordChange=false โดยไม่มี pending discriminant. token ปน next/changeToken หรือ unknown next ไม่ผ่าน. send success ไม่ใช่ terminal. verify อาจไป contact ต่อ; ไม่หยุดหลัง OTP ครั้งแรก.

pending/challenge → terminal_candidate → trusted token + directory admission ตาม packet → fully_authenticated → commit opaque unbound session5นาที → bind profile. fully_authenticated เป็นสถานะภายใน ไม่ใช่ public access token. bind คง CreateDate+8ชั่วโมงตาม DES-004 ไม่ต่ออายุจาก retry. ก่อนครบ admission ห้ามสร้างแม้ unbound session.

## Failure / timeout / retry

ใช้ v2 envelope ของ [data-contract-rules.md](data-contract-rules.md): error.code/message/request_id/details; request_id สร้าง/ตรวจใน B ไม่คัดลอก upstream error ทั้งก้อน. no-store ทุก auth response.

Input/wrong-stage/wrong-code →400 INVALID_INPUT; credentialผิด/บัญชี inactive/invalid-expired-consumed challenge →401 UNAUTHORIZED; License/device/tenant/channel ใช้403ตาม DES-004. Missing configuration/proven mapping →503 AUTH_NOT_CONFIGURED; timeout/DB/network/delivery failure/upstream5xx/malformedหรือcontradictory response →503 AUTH_UNAVAILABLE. 429→RATE_LIMITED; Retry-After ใช้ header ที่ตรวจแล้วหรือ results.retryAfterSeconds; ถ้าไม่มีใช้60วินาทีเป็น client cooldown ของ B ไม่อ้างว่า G reset แล้ว. ไม่เผย attemptsLeft/PII/raw errors โดยอัตโนมัติ.

เสนอ deadline ต่อ credential/continuation call10วินาที และ private introspection3วินาทีตาม DES-012; propagate cancellation, ไม่ follow redirect และไม่ retry mutation อัตโนมัติ แม้ timeout เพราะ G อาจเขียน attempts/ส่ง OTP/consume token แล้ว. หลังผลไม่แน่นอนห้ามอ้าง rollback หรือ success; เริ่มใหม่ได้หลัง action ผู้ใช้. G TTL/limits ใน033เป็น defaults ไม่ใช่ deployed configuration.

## ขอบเขตที่ยังไม่ปิด

Public /v2/auth/login ยังมี DTO เดิม; ห้ามเพิ่ม actor/step/flow_token หรือ continuation routes จาก DTO ภายในนี้เอง. ต้องมี attempt binding ที่ตรวจได้จริงกับ school/account/License/current binding/DeviceJkt, stage, expiry และ replay/cancellation ก่อนส่ง pending กลับ host. รอบนี้ไม่สร้าง store/ticket format ชดเชยโดยไม่มีฐานรองรับ. รายการที่ต้องรับต่ออยู่ใน packet.

## Change Log
- 2026-10-23 — Rev1: ใบงาน034 รับ033และตรวจ B; ตรึง internal outcome/bounds/failures แยกข้อค้าง public completion; ไม่มี source/SQL/tests/runtime
