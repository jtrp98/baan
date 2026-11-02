# Gateway SchoolBot entry — controller + module-owned channel

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## ส่วนต่อของสัญญา

- [การเชื่อมชุดทดสอบและ assertion](gateway-controller-entry-001-tests.md)
- [หลักฐานและข้อที่ยังไม่ยืนยัน](gateway-controller-entry-001-evidence.md)

สัญญานี้กำหนด controller entry และ module-owned channel ของ HTTP API Gateway (`sb-api-gateway`) สำหรับ SchoolBot gRPC service ผล surface probe และการประเมิน assertion อ้างรายงานการตรวจอิสระในหลักฐานท้ายไฟล์ ผล local ไม่ขยายเป็นการรับรอง production/H5 (เงื่อนไข listener/TLS/peer/private ingress และ trust ระหว่างระบบ)/Light (ผู้ทบทวน implementation ของ Gateway)/DB/Backend for Frontend (BFF).

ใช้ controller/service แทน minimal endpoint หรือ middleware แยก กฎ error/validator/metadata/trailer เดิมคงอยู่ เว็บผ่าน BFF และไม่มี direct public SchoolBot service.

## Entry

- `src/ApiGateway.API/SchoolBot/SchoolBotAuthController.cs` · namespace `ApiGateway.API.SchoolBot` (ไม่ชน RouteConventionTests; harness ที่คอมไพล์ `SchoolBot/*.cs` ยังเห็น)
- class: `[ApiController] [Route("school-bot/service/v2/auth")] [Authorize(AuthenticationSchemes="SchoolBotOpaque")] [EnableRateLimiting("SensitiveEndpoint")] [SchoolBotSliceGate]`
- `POST logout` `[AllowAnonymous]` → `/api/school-bot/service/v2/auth/logout` (ต้องถึง handler แม้ไม่มี/ผิดรูป token เพื่อคืน 204 store0 ตามสัญญา)
- verb อื่นบน logout → action แยก `[AcceptVerbs(GET,HEAD,PUT,DELETE,PATCH,OPTIONS)]` คืน 405 JSON v2 `METHOD_NOT_ALLOWED` + no-store + X-Request-Id (ซ่อนจาก Swagger) · path อื่น 404 ตาม routing
- auth: scheme `SchoolBotOpaque` คืน NoResult ไม่ parse Bearer เป็น JWT · PostConfigure SmartScheme ให้ path `/api/school-bot/service/v2` ใช้ SchoolBotOpaque ก่อน selector เดิม → opaque token ไม่เข้า JwtBearerHandler, principal anonymous จึงไม่ถูก revocation ตัด 401 ก่อนถึง handler · ControlPlane maintenance/disabled ยังทำงาน 
- production ปิด: ไม่แตะ `Program.cs` · `[SchoolBotSliceGate]` (action constraint + controller convention) ซ่อนจาก ApiExplorer และ match เฉพาะเมื่อมี `SchoolBotLogoutMarker` จาก `AddSchoolBotLogoutModule` + `SchoolBotLogoutOptions.Enabled` + ไม่ใช่ Production → นอกนั้น 404

## Channel ที่ module เป็นเจ้าของ — ไม่มี reflection

- `SchoolBotSessionGrpcClient.CreateChannel(address, options?, loggerFactory?)` คัดลอก options ใหม่ (ไม่แก้ของ caller) ตั้ง `LoggerFactory` = sanitizing factory ผ่าน public `GrpcChannelOptions` · `MaxRetryAttempts=0` · บันทึก provenance ใน `ConditionalWeakTable<GrpcChannel,…>`
- `CreateGeneratedClient(channel)` รับเฉพาะ channel ที่อยู่ในตาราง → สร้าง generated client จาก channel ตรง (ไม่มี Hidden/CallerLogger invoker) → บันทึกใน `ConditionalWeakTable<Client,GrpcChannel>`
- constructor `SchoolBotSessionGrpcClient(GrpcChannel)` / `(generated client)` ไม่อยู่ในตาราง = throw ตอนสร้าง (RPC0) · ลบ `System.Reflection`/BindingFlags ทั้งหมด
- `SchoolBotSanitizingLogger`: BeginScope = NullScope · message คงที่ · StatusCode เอาจาก RpcException/state/ข้อความเฉพาะเมื่อ `Enum.TryParse` + `IsDefined` ผ่าน (EventId3 ไม่รู้ = Internal) · exception ถูกแทนด้วย RpcException(status, "") หรือ generic

## Mapping

การย้ายจาก middleware เดิมใช้ `SchoolBotAuthController.cs` + `SchoolBotLogoutService.cs` (ย้าย logic middleware ครบ: 405/64KiB/413/deadline 15s 504/prep 400/Origin 403/maintenance+circuit 503/validator-client absent 503/RPC/peer 502/trailer validator/HTTP API Gateway envelope) · แก้ `SchoolBotLogoutRegistration.cs` (ลบ Use/Map, เพิ่ม AddSchoolBotLogoutModule: opaque scheme, SmartScheme selector, AddControllers+ApplicationPart, prefix convention ถ้าไม่มี ApiPrefixConvention), `SchoolBotLogoutOptions.cs` (+Enabled), `SchoolBotSessionGrpcClient.cs` · คงเดิม: ISchoolBotSessionClient, ISchoolBotTransportValidator, ProductionSchoolBotTransportValidator (fail closed), RequestPreparation, TrailerValidator, helper433, proto
