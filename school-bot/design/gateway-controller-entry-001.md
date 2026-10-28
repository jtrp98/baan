# Gateway SchoolBot entry — controller + module-owned channel (Rev1)

วันที่2026-10-28 · arch AGY T1 (gemini-4-argon-high) run 2026-10-28-06-13-11-arch-tier-t1-1agents-vMHqG4 DONE · นายช่างสกัด · ตาม[มติ050](../requirement/decisions-050.md) + Amendment [มติ049](../requirement/decisions-049.md)

มี precedence เหนือข้อความเรื่อง minimal endpoint/`SchoolBotLogoutMiddleware`/pipeline แยก ใน [gateway-integration-001](gateway-integration-001.md), [gateway-grpc-contract-001](gateway-grpc-contract-001.md) §3/§5, [gateway-logout-slice-001](gateway-logout-slice-001.md) และคำว่า `directadapter` ใน [negative-boundary](gateway-logout-negative-boundary-001.md) — กฎ error/validator/metadata/trailer เดิมไม่เปลี่ยน · transport G→B gRPC, เว็บผ่าน BFF, ไม่มี direct public B คงเดิม · โค้ดต้นแบบเต็มอยู่ในคำตอบ arch (reports) ไม่คัดลอกมา

## As-built ที่ใช้อ้าง

- `Program.cs:60` AddControllers · pipeline `:119–129` UseAuthentication → RequestContextUserEnricher → ControlPlaneEnforcement → UseAuthorization → UseSbRateLimiting → MapControllers
- `ApiPrefixConvention` เติม `api` หน้า `[Route]` ทุก controller (เช่น AuthController `[Route("auth")]` → `/api/auth/*`)
- `ApiServiceExtensions.cs:68–129` SmartScheme (PolicyScheme) ส่ง Bearer เข้า JWT; เพิ่ม scheme เฉพาะโดเมนได้
- `RouteConventionTests` บังคับเฉพาะ namespace `ApiGateway.API.Controllers.<System>.<Feature>`

## A. Entry

- `src/ApiGateway.API/SchoolBot/SchoolBotAuthController.cs` · namespace `ApiGateway.API.SchoolBot` (ไม่ชน RouteConventionTests; harness ที่คอมไพล์ `SchoolBot/*.cs` ยังเห็น)
- class: `[ApiController] [Route("school-bot/service/v2/auth")] [Authorize(AuthenticationSchemes="SchoolBotOpaque")] [EnableRateLimiting("SensitiveEndpoint")] [SchoolBotSliceGate]`
- `POST logout` `[AllowAnonymous]` → `/api/school-bot/service/v2/auth/logout` (ต้องถึง handler แม้ไม่มี/ผิดรูป token เพื่อคืน 204 store0 ตามสัญญา)
- verb อื่นบน logout → action แยก `[AcceptVerbs(GET,HEAD,PUT,DELETE,PATCH,OPTIONS)]` คืน 405 JSON v2 `METHOD_NOT_ALLOWED` + no-store + X-Request-Id (ซ่อนจาก Swagger) · path อื่น 404 ตาม routing
- auth: scheme `SchoolBotOpaque` คืน NoResult ไม่ parse Bearer เป็น JWT · PostConfigure SmartScheme ให้ path `/api/school-bot/service/v2` ใช้ SchoolBotOpaque ก่อน selector เดิม → opaque token ไม่เข้า JwtBearerHandler, principal anonymous จึงไม่ถูก revocation ตัด 401 ก่อนถึง handler · ControlPlane maintenance/disabled ยังทำงาน (สมมติฐาน — ยังไม่ยืนยัน ว่า selector override ไม่กระทบ route อื่นจนกว่า test/JPO พิสูจน์)
- production ปิด: ไม่แตะ `Program.cs` · `[SchoolBotSliceGate]` (action constraint + controller convention) ซ่อนจาก ApiExplorer และ match เฉพาะเมื่อมี `SchoolBotLogoutMarker` จาก `AddSchoolBotLogoutModule` + `SchoolBotLogoutOptions.Enabled` + ไม่ใช่ Production → นอกนั้น 404

## B. Channel ที่ module เป็นเจ้าของ — ไม่มี reflection

- `SchoolBotSessionGrpcClient.CreateChannel(address, options?, loggerFactory?)` คัดลอก options ใหม่ (ไม่แก้ของ caller) ตั้ง `LoggerFactory` = sanitizing factory ผ่าน public `GrpcChannelOptions` · `MaxRetryAttempts=0` · บันทึก provenance ใน `ConditionalWeakTable<GrpcChannel,…>`
- `CreateGeneratedClient(channel)` รับเฉพาะ channel ที่อยู่ในตาราง → สร้าง generated client จาก channel ตรง (ไม่มี Hidden/CallerLogger invoker) → บันทึกใน `ConditionalWeakTable<Client,GrpcChannel>`
- constructor `SchoolBotSessionGrpcClient(GrpcChannel)` / `(generated client)` ไม่อยู่ในตาราง = throw ตอนสร้าง (RPC0) · ลบ `System.Reflection`/BindingFlags ทั้งหมด
- `SchoolBotSanitizingLogger`: BeginScope = NullScope · message คงที่ · StatusCode เอาจาก RpcException/state/ข้อความเฉพาะเมื่อ `Enum.TryParse` + `IsDefined` ผ่าน (EventId3 ไม่รู้ = Internal) · exception ถูกแทนด้วย RpcException(status, "") หรือ generic

## C. Mapping

ลบ `SchoolBotLogoutMiddleware.cs` · ใหม่ `SchoolBotAuthController.cs` + `SchoolBotLogoutService.cs` (ย้าย logic middleware ครบ: 405/64KiB/413/deadline 15s 504/prep 400/Origin 403/maintenance+circuit 503/validator-client absent 503/RPC/peer 502/trailer validator/G envelope) · แก้ `SchoolBotLogoutRegistration.cs` (ลบ Use/Map, เพิ่ม AddSchoolBotLogoutModule: opaque scheme, SmartScheme selector, AddControllers+ApplicationPart, prefix convention ถ้าไม่มี ApiPrefixConvention), `SchoolBotLogoutOptions.cs` (+Enabled), `SchoolBotSessionGrpcClient.cs` · คงเดิม: ISchoolBotSessionClient, ISchoolBotTransportValidator, ProductionSchoolBotTransportValidator (fail closed), RequestPreparation, TrailerValidator, helper433, proto

## D. Harness seam (เปลี่ยนเฉพาะ construction/entry ห้ามแตะ assertion/expected/logsink)

- repro: `GrpcChannel.ForAddress` → `SchoolBotSessionGrpcClient.CreateChannel` · generated client → `CreateGeneratedClient(channel)` · TestServer `AddSchoolBotLogoutModule()` + `UseRouting/UseAuthentication/UseAuthorization/MapControllers` แทน `UseSchoolBotLogout`+404
- regression: ไม่ต้องแก้ (อ่าน repro + แทรก `LoggerFactory = logs`) — ต้องชี้ไปที่สำเนา repro ใหม่ถ้า path เปลี่ยน
- extended: เหมือน repro + direct entry `SchoolBotLogoutMiddleware(...).InvokeAsync` → `SchoolBotAuthController(new SchoolBotLogoutService(), peer, client, options){ControllerContext}.Logout(...)`

Assertion ที่ความหมายเปลี่ยน (JPO อิสระเป็นผู้ตัดสินว่ายอมรับ — ไม่ใช่ writer):

| assertion | เดิม | ตามแบบใหม่ |
|---|---|---|
| shared-channel-factory-not-mutated | channel ดิบเข้า constructor แล้วต้องไม่ถูก mutate | channel สร้างผ่าน CreateChannel; constructor ไม่ mutate · channel ดิบถูก reject ใน construction-* |
| bound-arbitrary/scope/event3/marker-scope ×3 levels | log ผ่าน `Bound(ch)` | `Bound(ch)` ต้องเป็น sanitizing factory และกรองทุกระดับ |
| construction-standard/warm (+logs-) | ดิบผ่านได้ถ้า LogsClean หรือ rejected | ทุก shape ที่ไม่ผ่าน factory = rejected RPC0 (นิพจน์เดิมรองรับ) |
| middleware-unsafe-generated-fallback-failclosed | middleware ไม่ fallback | controller/service ไม่ fallback ไป generated client ดิบ → 503 RPC0 (ชื่อคงเดิม) |

## E. ผลกระทบ

- B (target/school-bot): 0 changes · [check-092-grpc-r3](../planning/check-092-grpc-r3-001.md) ไม่กระทบ
- OPEN: SEC001-016 (จน JPO อิสระ) · H5/Light review/production registration/TLS/peer จริง/BFF CSRF · G-AUTH

## Change Log

- 2026-10-28 — Rev1 จาก arch vMHqG4 ตามมติ050 + Amendment049
