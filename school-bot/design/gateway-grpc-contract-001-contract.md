# Gateway–SchoolBot gRPC contract — 2. RPC และ HTTP mapping

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) ส่วนนี้อธิบาย2. RPC และ HTTP mapping อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md) · [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)

สัญญานี้กำหนด Remote Procedure Call (RPC), Data Transfer Object (DTO), metadata และ HTTP mapping ระหว่าง HTTP API Gateway (`sb-api-gateway`) กับ SchoolBot gRPC service ใช้ unary RPC ตาม use case โดย local logout ใช้ controller/service แล้ว ส่วน operation อื่นยังเป็นข้อเสนอ. Browser ผ่าน same-origin Backend for Frontend (BFF).

## 2. RPC และ HTTP mapping

เสนอ package `schoolbot.v2`; unary RPC แยกตาม use case ไม่มี Execute(method,path,json) หรือ catch-all. Prefix client `Q=/api/school-bot/service/v2`; mapper ต้องใช้ allowlist method/path แบบ exact. ไม่เปิด /v1/admin, health/control หรือ private introspection ผ่าน Q.

| HTTP ที่ HTTP API Gateway | service.RPC | Request → Reply | สำเร็จ |
|---|---|---|---|
| POST Q/auth/logout | SchoolBotSessionService.Logout | LogoutRequest → Empty | 204 ไม่มี body |
| POST Q/auth/web-sessions | SchoolBotSessionService.ExchangeWebSession | WebExchangeRequest → SessionIssued | 201 |
| POST Q/auth/login | SchoolBotSessionService.Login | DesktopLoginRequest → SessionIssued | 201 เฉพาะ admission ครบ |
| GET Q/auth/session | SchoolBotSessionService.GetSession | Empty → SessionView | 200 + ETag |
| PUT Q/auth/session | SchoolBotSessionService.BindProfile | BindProfileRequest → SessionView | 200 + ETag |
| GET Q/me | SchoolBotSessionService.GetMe | Empty → MeView | 200 |
| POST Q/admin/sessions/revoke | SchoolBotAdministrationService.RevokeSessions | RevokeSessionsRequest → RevokeSessionsReply | 200 |

Login/session/me ตาม DES-004 ตาราง /v2 และ lifecycle; RevokeSessions ตาม DES-012 §5. รายการนี้ไม่เปิด endpoints อื่นโดยปริยาย; staff-role/learning/export RPC ต้องมี DTO และ route manifest ของสัญญานั้นก่อนเพิ่ม ไม่ใช้ generic proxy ชดเชย.

### DTO เชิง wire

รายการ DTO เป็นแบบเชิง wire ของสัญญารวม ส่วน Logout มี proto/codegen ของขอบเขต local ตาม [สัญญา logout](gateway-logout-slice-001.md). ฟิลด์ required ต้องตรวจ presence ไม่ยอมรับ proto default แทนข้อมูลที่หาย; nullable ใช้ explicit presence. IDs เป็น int32 ตาม [canonical types](data-dictionary/contract-001.md); row ID 1..2147483647, school_id>0. UTC ใช้ google.protobuf.Timestamp โดยรักษา microseconds; enum strings ตรวจ allowlist; null แปลงเป็น JSON null ไม่ใช่ 0/empty string.
