# Gateway–SchoolBot gRPC contract

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## ส่วนต่อของสัญญา

- [DTO และ presence ของข้อมูล](gateway-grpc-contract-001-dto.md)
- [Identity และ tenant boundary](gateway-grpc-contract-001-identity.md)
- [Login routing และ admission](gateway-grpc-contract-001-login.md)
- [Error mapping](gateway-grpc-contract-001-errors.md)
- [Deadline, limits และ private exposure](gateway-grpc-contract-001-limits.md)
- [รายการรับรองและทางเลือก](gateway-grpc-contract-001-review.md)
- [หลักฐาน source และ local logout](gateway-grpc-contract-001-evidence.md)

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
