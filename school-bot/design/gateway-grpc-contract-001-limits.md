# Gateway–SchoolBot gRPC contract — 7. Review packet และการตัดสินใจ

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) ส่วนนี้อธิบาย7. Review packet และการตัดสินใจ อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[BL-005 (ข้อ 2: ผูกเอกสาร logout กับ controller as-built)](gateway-controller-entry-001.md)

ข้อเท็จจริงที่ตรวจ source ซ้ำ:
- `sb-api-gateway/AGENTS.md:29,35–37`: REST→gRPC, tenant จาก JWT, error ผ่าน middleware และ protected paths ต้อง Light review.
- `sb-api-gateway/src/ApiGateway.Infrastructure/Extensions/InfrastructureServiceExtensions.cs:597–676`: metadata/deadline/circuit breaker/retry; default deadline 5s, receive limit 16MiB, มี insecure channel เมื่อ scheme เป็น http/dns. ไม่ใช่หลักฐาน TLS/config ที่ deploy.
- `sb-api-gateway/src/ApiGateway.Infrastructure/Common/Grpc/GatewayCallMetadataInterceptor.cs:64–77,100–107`: ส่ง PostalCode/Sid/IsAdmin จาก principal และไม่ทับ metadata ที่มีอยู่แล้ว; Sid ไม่ใช่ canonical AccountId/ProfileId.
- `sb-api-gateway/src/ApiGateway.Infrastructure/Common/Grpc/IdempotentRetryInterceptor.cs:28–30,51–75`: GET/HEAD retry Unavailable อีก 2 ครั้ง ระยะ 100/300ms ภายใน deadline เดิม.
- `sb-api-gateway/src/ApiGateway.API/ControlPlane/ControlPlaneEnforcementMiddleware.cs:29–48,66–76`: revocation/maintenance ใช้ HTTP API Gateway envelope; maintenance 503 + Retry-After 300.
- `sb-api-gateway/src/ApiGateway.API/Middleware/ExceptionHandlingMiddleware.cs:90–123,157–166`: อ่าน sb-error-bin แต่คืน HTTP API Gateway envelope; Unavailable→503, DeadlineExceeded/Cancelled→408; Development อาจส่ง exception.ToString ที่บรรทัด100. จึงยังไม่ตรงเป้าหมาย 502/504 และ v2 envelope ของ SchoolBot gRPC service.
- `school-bot/web/src/SchoolBot.Api/Program.cs:45–48,94–129`: ลงทะเบียน logout/store และ HTTP routes; ช่วงที่ตรวจยังไม่มี login/exchange/gRPC wiring. ไม่อ้าง inventory ทั้ง repo.
- `school-bot/web/src/SchoolBot.Api/LogoutEndpoint.cs:9–33,38–45`: token ผิดรูปแบบ→204; storage failure→503 AUTH_UNAVAILABLE; unexpected→500 INTERNAL_ERROR.
- `school-bot/web/src/SchoolBot.Application/LogoutService.cs:9–26`: ตรวจ opaque token 43 ตัว, hash แล้วเรียก store พร้อม cancellation. `SchoolBot.Infrastructure/Persistence/PostgresSessionLogoutStore.cs:19–30,32–72,74–82`: revoke+audit transaction เดียว; active session เท่านั้น; DB timeout 5s และ sanitize provider errors. ใช้ application/store เดิมได้โดยไม่ย้าย SQL ไป HTTP API Gateway.

หลักฐานรับต่อ ไม่ใช่ผลตรวจ login source ซ้ำ: sys055 (memory: planning/routing-linkage-evidence-001.json), sys056 (memory: planning/routing-linkage-evidence-002.json). HTTP logout/4032 local tests ไม่พิสูจน์ Gateway/gRPC/DB integration.

ข้อนี้เป็นข้อยกเว้นต่อ sb-api-gateway/AGENTS.md:35 ที่ยังไม่ได้รับรอง ไม่ใช่การประกาศว่ากฎทั้งสอง reconcile แล้ว. ก่อนรับรอง ให้ service-route ยังไม่เปิดใช้งาน. AllowAnonymous อย่างเดียวไม่เพียงพอ เพราะ authentication middleware อาจอ่าน Bearer แล้ว.

หลักฐาน sb-api-gateway/src/ApiGateway.API/SchoolBot/: SchoolBotAuthController.cs:38–58; SchoolBotLogoutRegistration.cs:120–133; SchoolBotLogoutService.cs:40–173,185–223. Client ของ logout ใช้ CreateChannel/CreateGeneratedClient ตาม SchoolBotSessionGrpcClient.cs:17–102; คำว่า named gRPC client ใน review packet ไม่ใช่ข้ออ้างว่า logout ใช้ global client registration.

หลักฐาน local logout ภายหลังอ้าง JPO092 (memory: planning/jpo-092-logout-r4-001.md). DTO/field numbers, error pairs, metadata/trailer limits, deadline/retry และ transport คงเดิม ไม่เลือก global mapper หรือ middleware entry เพราะมติ050 กำหนด controller และ service ทำ mapping อยู่แล้ว.

รหัสอ้างอิงที่ปรากฏในบันทึกเดิม: BL-005.
