# Gateway integration — หลักฐานและข้อจำกัด

> Rev 5 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway integration](gateway-integration-001.md) รวบรวมผลตรวจที่เอกสารเดิมบันทึก แยก baseline เก่าจากหลักฐาน local logout ที่ใหม่กว่า งานเรียบเรียงนี้ไม่ตรวจ source หรือ runtime เพิ่ม

## หลักฐาน

พาธ source อ้างจาก `C:/src/schoolbright/target`: API Gateway คือ `sb-api-gateway`, SchoolBot คือ `school-bot`, เว็บโรงเรียนคือ `sb-tech-upgrade-web-system` และ academic คือ `sb-tech-upgrade-academic`

### Controller และ local logout

- Gateway `src/ApiGateway.API/SchoolBot/SchoolBotAuthController.cs:8–58`, `SchoolBotLogoutRegistration.cs:15–28,97–163`, `SchoolBotLogoutService.cs:24–223` ยืนยัน controller/service/module registration; `SchoolBotSessionGrpcClient.cs:17–102` ยืนยัน CreateChannel/CreateGeneratedClient และตรวจ provenance โดยไม่ใช้ reflection
- รายงานตรวจ local logout ล่าสุด (memory: planning/jpo-092-logout-r4-001.md): ประเด็น log leak/metadata ที่รายงานปิดแล้วเฉพาะ local logout; Gateway repro 3 ผ่าน, regression 5 ผ่าน, extended 96 ผ่าน, surface probe 6 ผ่าน; SchoolBot extended 2234 ผ่าน และ 8 wire fixtures ยังไม่ได้รัน เป็นตัวเลขรับจากรายงาน ไม่ใช่การรันใหม่
- ยังไม่ได้พิสูจน์ TLS/mTLS/peer จริง, physical HTTP/2 hidden headers บน Kestrel, 8 wire fixtures, Program.cs/production registration, full private NuGet build, PostgreSQL/atomicity, BFF CSRF และ Light/CODEOWNERS review จึงไม่รับรอง Login/exchange/private introspection หรือ release จาก local logout

### Baseline ก่อนเพิ่ม gRPC/controller

- Gateway `src/ApiGateway.API/Program.cs:59–72,118–130`: controller registration และ pipeline authentication → logging → control plane → authorization → rate limit → controllers
- `src/ApiGateway.API/Extensions/ApiServiceExtensions.cs:68–123,293–296` และ `Helpers/ApiPrefixConvention.cs:13–22`: SmartScheme เดิมเลือก Bearer ก่อน JabjaiWebKey และเติม /api prefix; `src/ApiGateway.Infrastructure/Extensions/InfrastructureServiceExtensions.cs:549–614` มี gRPC client พร้อม metadata/deadline/retry
- `src/ApiGateway.Infrastructure/Common/Authentication/JabjaiWebLegacyAuthHandler.cs:27–53` เลือก header แรกและ log ชื่อ header; `JwtTokenService.cs:41–45,184–220` มี secret fallback, ไม่บังคับ exp/iss/aud, Sid รวม admin_id/user_id
- `src/ApiGateway.API/ControlPlane/ControlPlaneEnforcementMiddleware.cs:29–49,56–76`: revocation ใช้ principal, maintenance ใช้ route/service และ gateway envelope
- การค้นเดิมไม่พบ SchoolBot route/web-principal/HTTP forwarder เป็นผล ณ ก่อน local logout ปัจจุบัน ไม่ใช่หลักฐานว่าไม่มี controller แล้ว และไม่พิสูจน์ทุก proxy ภายนอกหรือ deployment
- SchoolBot `web/src/SchoolBot.Api/Program.cs:45–48,94` และ `LogoutEndpoint.cs:9,22` ในผลตรวจเก่าผูก LogoutService/PostgresSessionLogoutStore กับ HTTP POST ยังไม่พบ gRPC registration/reference/.proto ใน inventory ที่ตรวจ ใช้ domain/application/logout persistence เดิมซ้ำได้ ผลนี้ไม่ลบหลักฐาน typed gRPC logout ที่ใหม่กว่า
- qa/round-001 (memory) รายงาน 4032 tests ในขอบเขต local/static ไม่ใช่ Gateway/gRPC/DB integration proof; auth-flow-handoff-001 (memory) บันทึก local component/logout

### มติที่เกี่ยวข้อง

- [มติ 049 (อนุมัติแก้ raw metadata และ log/channel boundary แบบจำกัด)](../../shared/decisions/decisions-049.md) และ [มติ 050 (controller convention)](../../shared/decisions/decisions-050.md) เป็นที่มาของขอบเขต local logout ล่าสุด
- [มติ 035 (แหล่ง admin กลุ่มฝั่ง server)](../../shared/decisions/decisions-035.md) คง policy; [DES-012 (auth ข้ามระบบ)](des-012.md) คง token exchange, License และ session lifetime; [gRPC contract](gateway-grpc-contract-001.md) คง Data Transfer Object (DTO)/error/metadata/trailer
