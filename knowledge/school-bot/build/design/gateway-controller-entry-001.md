# Gateway SchoolBot — controllers และ DI ปัจจุบัน

> Rev 3 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

ทางเข้าปัจจุบันคือ controllers ใน namespace `ApiGateway.API.Controllers.ServiceSchoolBot` ทั้งห้า ใช้ `[ApiController]`, `[Authorize]` และ `[SchoolBotSliceGate]` โดย device challenge/activate/validate และ release update check มี `[AllowAnonymous]` เฉพาะ action

## Registration และ channel

AddSchoolBotModule ลงทะเบียน Application, Infrastructure, SchoolBotModuleMarker และ MVC/prefix convention; SchoolBotOptions.Enabled เริ่ม true แต่ไม่เพียงพอให้ routes เปิด SchoolBotSliceGate ต้องมี marker และห้าม Production

AddSchoolBotInfrastructure ลงทะเบียน trailer validator และ ProductionSchoolBotTransportValidator (IsConfigured=false/IsPeerTrusted=false) เท่านั้น AddSchoolBotGrpcClients(channel) เป็นอีกขั้นที่ลงทะเบียน singleton repository ทั้งห้า จึงไม่ถือว่า AddSchoolBotModule สร้าง channel/client ครบ

SchoolBotGrpcChannel.Create ตั้ง sanitizing logger, message cap 4MiB และ MaxRetryAttempts=0; SchoolBotGrpcCalls ใส่ metadata/deadline/cancellation จาก SchoolBotCall ส่งตรง CallOptions; repository แปลง response/ETag และ RpcException กลับ pipeline

Gateway Program ยังไม่เรียก registration สองขั้นนี้ ไม่มี endpoint address/trusted transport ที่ใช้งานจริงจากเพียงการมี source; MapControllers ตามปกติไม่ข้าม gate

## HTTP pipeline

SchoolBotHttpPipeline ตรวจ binding/ขนาด body, Origin, maintenance/circuit, transport configuration และ identity แล้ว invoke repository; คืน no-store/X-Request-Id, success status/ETag และแยก business error จาก transport error ดู [identity](gateway-grpc-contract-001-identity.md), [limits](gateway-grpc-contract-001-limits.md) และ [errors](gateway-grpc-contract-001-errors.md)

SchoolBotAuthController, AddSchoolBotLogoutModule, SchoolBotSessionGrpcClient และ SchoolBotOpaque เป็น implementation รุ่นก่อนที่ไม่มีอยู่ใน current source เอกสารทดสอบ/logout รุ่นก่อนเก็บเป็นหลักฐานประวัติ ไม่ใช้เป็น wiring ปัจจุบัน

## หลักฐาน

Gateway SchoolBot/SchoolBotRegistration.cs, Application/Extensions/SchoolBotApplicationExtensions.cs, Infrastructure/Extensions/SchoolBotInfrastructureExtensions.cs, Infrastructure/Repositories/Services/ServiceSchoolBot และ API Program.cs ตรวจที่ b4181ca วันที่ 2026-11-04; [หลักฐานปัจจุบัน](gateway-integration-evidence.md)
