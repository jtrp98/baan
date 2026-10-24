# Gateway Login reuse — Rev3

> Override Rev3 (2026-10-24): [Gateway integration Rev3](gateway-integration-001.md) มี precedence เหนือข้อความด้านล่างที่ยังไม่เลือก relay/gRPC: G→B ใช้ gRPC ตามมาตรฐานแล้ว. HTTP Login เดิมของ G และ HTTP/JSON outcomes ของ decoder เป็นอีกขอบเขต ไม่ต้อง rewrite จาก amendment นี้. หลักฐาน local component/logout ล่าสุดอ่าน [receipt](../planning/auth-flow-handoff-001.md); ไม่ยืนยัน full Login หรือ Gateway integration.

สถานะอยู่ที่ [index](index.md). ขอบเขต: auth seam เท่านั้น; ไม่มี schema delta.

## ข้อเท็จจริงและแหล่งหลักฐาน

รับ source evidence ของ sys จาก [response](../planning/gateway-login-response-001.json) และ [review](../planning/gateway-login-review-001.md); ไม่อ้างตรวจ runtime. G/W หมายถึง target/sb-api-gateway และ target/sb-tech-upgrade-web-system. [ผู้คุมยืนยัน Git](../planning/gateway-login-source-check-001.json): G HEAD 9a03c9428a47150aa960e61ca91eedad6d0196af status/diff ว่าง; W HEAD 7ae35eb4ed3123783afa04e70181eb3576503e45 status ว่าง.

G AuthService.cs:177 ให้ temporaryToken AccessLevel0 เมื่อ device ยังไม่ verified; WebAuthController.cs:265 คืน200ได้ทั้ง token และ challenge. WebLoginService.cs:206,272 ใช้ identity keys ต่างกันระหว่าง WorkStatus กับ token จึงยังเทียบ AccountId/SId/NSystemId/sEmp ไม่ได้. Login มี side effects เช่น attempts/lock; ไม่ใช่ pure verifier. refresh ใน ServiceMobile/AuthController.cs เป็น comment ไม่ใช่ active route.

## ข้อเสนอ reuse ตาม actor

| Actor | ใช้ของเดิม | สิ่งที่ยังต้องพิสูจน์ |
|---|---|---|
| Desktop student | /api/auth/login เป็น candidate | IMEI/device lifecycle, full-auth และ student/AccountId mapping |
| Desktop teacher | /api/auth/web/login เป็น candidate หลัก; ไม่ fallback mobile | first-password/2FA/contact continuation, account/profile mapping |
| school_web | W login/BFF→G web login | private web-principal + C exchange +035 + active License |
| staff_admin | G web login เมื่อพิสูจน์พนักงานได้ | C exchange + active SchoolBotStaffRole + admin BFF/bootstrap |

## สัญญา adapter

Gateway รับผิดชอบ credential/challenge ตาม DTO เดิม; B รับผิดชอบ SchoolBot session/directory/authorization. ห้ามสร้าง verifier ใหม่ คัดลอก password hash หรือเพิ่มบัญชี/mapping DB ชดเชย. Local IAuthService/IWebLoginService ไม่ใช่ remote RPC contract.

ออก201 SchoolBot session ได้หลังตรวจ full authentication จาก upstream ที่เชื่อถือได้ พร้อม identity/tenant ที่พิสูจน์แล้วและเงื่อนไข DES-004/012 เท่านั้น. HTTP200, temporaryToken, AccessLevel0, forceResetPassword หรือ challenge ที่ยังไม่จบ ห้ามออกแม้ unbound session. ห้าม fake IMEI/แทนด้วย DeviceJkt และห้ามข้าม first-password/2FA/contact.

Desktop /v2/auth/login เดิมยังไม่มี IMEI/continuation contract; ห้ามแอบเพิ่ม field/endpoint หรือรับ web token เป็น desktop sessionเอง. ส่วนที่ adapter ยังไม่พร้อมใช้503 AUTH_NOT_CONFIGURED; ขณะเรียก dependency ล่มใช้503 AUTH_UNAVAILABLE. Gateway challenge คงอยู่ใน flow เดิม ไม่แปลงเป็น loginสำเร็จหรือผิดรหัส. เมื่อ adapter พร้อมต้อง map invalid input→400 INVALID_INPUT, credentialผิด→401 UNAUTHORIZED, rate limit→429 RATE_LIMITED พร้อม Retry-After ตามสัญญากลาง; ไม่ส่ง raw upstream errors/secrets. ห้าม retry login/challenge mutation อัตโนมัติ.

Input bounds ต่างกัน: DES-004 username256/password1024; mobile100/20; web100/100. ต้องระบุ validation/normalization และ continuation wire contract ก่อนเปิด Desktop adapter; ห้าม truncate หรือเปลี่ยน password เพื่อให้ผ่าน upstream.

คง opaque SchoolBotSession/Channel/profile binding/revocation/audit; desktop ต้อง License+DeviceJkt, school_web ต้อง LicenseและDeviceJkt=null, staff_admin ตรวจ StaffRoleและDeviceJkt=null. คงอายุเดิมและสิทธิ์สดก่อนcommit. Gateway JWT ไม่แทนสิ่งเหล่านี้; parse-legacy-token/handoff ไม่แทน private introspection. มติ035ยังใช้กลุ่มฝั่งserverและsuperadminเดิมเฉพาะschool_web ไม่ให้staff_adminเอง.

## ทางเลือกและหลักฐานค้าง

เลือก reuse pipeline เพราะมี lock/challenge เดิม; ปัด verifier ซ้ำ/ผสม hash สองเส้นเพราะทำ behavior แตกต่าง. เลือก web candidate สำหรับครูเพื่อคง challenges. ไม่สรุป student entrypoint จนมี device contract. ไม่เลือก HTTP relay หรือ gRPC rewrite เอง: [Gateway Rev2](gateway-integration-001.md) ระบุข้อขัดกับ G/AGENTS.md:29,35,37.

G/sys ต้องให้ completion/continuation DTO, device lifecycle, token trust และ bounds mapping; legacy/vault ให้ TR-AUTH-02-rest/03..06 โดยเฉพาะ identity/tenant/status; G/Light+B ให้ H5 transport/private exposure/TLS/secret-owner และ opaque-token isolation; admin owner ให้ staff bootstrap/BFF/CSRF. ระหว่างนี้ fail closed เฉพาะส่วนที่หลักฐานขาด ไม่เปิดคำถาม035ใหม่.

## Override Rev2 — ผลรับ033และขอบเขต034

[desktop-login-adapter-001.md](desktop-login-adapter-001.md) มี precedence เหนือ candidate/readiness และ bounds เดิมเฉพาะ Desktop: เลือก teacher web continuation, student mobile ยังไม่มี Desktop completion ที่พิสูจน์ได้; ไม่ fallback หรือ fake IMEI. ไม่ต้องตรวจ password/hash ซ้ำใน B แต่ต้องตรวจ directory และ authorization ต่อ.

ข้อเสนอ decoder/admission ของ033เป็น prerequisite logic ที่ทดสอบได้ ไม่ใช่ complete slice จนมี production caller และ dependency จริง. B ปัจจุบันมีเฉพาะ v1 License/Release กับ memory store; รอบ034ไม่อนุมัติ scaffolding/constant503 เป็น feature. ข้อค้างเจาะจงและ packet สำหรับ G อยู่ที่ [desktop-auth-review-packet-001.md](desktop-auth-review-packet-001.md).

## Change Log
- 2026-10-24 — Rev3: ใบงาน049 แยก Login reuse เดิมจาก G→B gRPC; คง adapter/admission และประวัติ
- 2026-10-23 — Rev2: ใบงาน034 รับ033 กำหนด outcome/admission และรายงาน complete-slice gap โดยไม่เปลี่ยน schema/035
- 2026-10-23 — Rev1: ใบงาน032 รับหลักฐาน031 เลือก reuse แบบมีเงื่อนไข; ไม่เขียน source/SQL ไม่ทดสอบหรือปิด gate
