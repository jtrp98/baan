# Gateway SchoolBot entry — controller + module-owned channel — ยังไม่ยืนยัน

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway SchoolBot entry — controller + module-owned channel](gateway-controller-entry-001.md) ส่วนนี้อธิบายยังไม่ยืนยัน อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[SEC001-016 (ความปลอดภัยของ local logout และ log redaction)](gateway-controller-entry-001.md) · [BL-005 (ข้อ 2: ผูกเอกสาร logout กับ controller as-built)](gateway-controller-entry-001.md)

ตารางเทียบ assertion ระหว่าง entry เดิมกับ controller โดยผู้ตรวจอิสระเป็นผู้ประเมินการยอมรับ:

| assertion | เดิม | ตามแบบใหม่ |
|---|---|---|
| shared-channel-factory-not-mutated | channel ดิบเข้า constructor แล้วต้องไม่ถูก mutate | channel สร้างผ่าน CreateChannel; constructor ไม่ mutate · channel ดิบถูก reject ใน construction-* |
| bound-arbitrary/scope/event3/marker-scope ×3 levels | log ผ่าน `Bound(ch)` | `Bound(ch)` ต้องเป็น sanitizing factory และกรองทุกระดับ |
| construction-standard/warm (+logs-) | ดิบผ่านได้ถ้า LogsClean หรือ rejected | ทุก shape ที่ไม่ผ่าน factory = rejected RPC0 (นิพจน์เดิมรองรับ) |
| middleware-unsafe-generated-fallback-failclosed | middleware ไม่ fallback | controller/service ไม่ fallback ไป generated client ดิบ → 503 RPC0 (ชื่อคงเดิม) |

## ยังไม่ยืนยัน

ผลของ selector override ต่อ route อื่นเป็นสมมติฐานที่ยังต้องมี test และผลตรวจอิสระยืนยันตามขอบเขตเดิม ไม่ใช้การมี controller เป็นหลักฐาน production.

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

ข้อเท็จจริงจาก sb-api-gateway/src/ApiGateway.API/SchoolBot/: SchoolBotAuthController.cs:8–58 เรียก SchoolBotLogoutService; SchoolBotLogoutRegistration.cs:97–163 ลงทะเบียน module/controller และ selector; SchoolBotSessionGrpcClient.cs:17–102 สร้าง channel/client และตรวจ provenance. ไม่พบ SchoolBotLogoutMiddleware.cs หรือ UseSchoolBotLogout/MapSchoolBotLogout ใน source กลุ่มนี้ และไม่พบการใช้ System.Reflection/BindingFlags.

ชื่อ marker ใน as-built มีทั้ง SchoolBotLogoutModuleMarker และ SchoolBotLogoutMarker; registration เพิ่มทั้งสอง และ gate ยอมรับเมื่อพบอย่างใดอย่างหนึ่ง ตาม SchoolBotLogoutRegistration.cs:41–57,101–107. Options.Enabled มีค่าเริ่มต้น true ตาม SchoolBotLogoutOptions.cs:5. นี่เป็นรายละเอียด implementation ปัจจุบัน ไม่ใช่ข้อเสนอเปลี่ยน gate.

- `Program.cs:60` AddControllers · pipeline `:119–129` UseAuthentication → RequestContextUserEnricher → ControlPlaneEnforcement → UseAuthorization → UseSbRateLimiting → MapControllers
- `ApiPrefixConvention` เติม `api` หน้า `[Route]` ทุก controller (เช่น AuthController `[Route("auth")]` → `/api/auth/*`)
- `ApiServiceExtensions.cs:68–129` SmartScheme (PolicyScheme) ส่ง Bearer เข้า JWT; เพิ่ม scheme เฉพาะโดเมนได้
- `RouteConventionTests` บังคับเฉพาะ namespace `ApiGateway.API.Controllers.<System>.<Feature>`

- SchoolBot gRPC service (target/school-bot): 0 changes · check-092-grpc-r3 (memory: planning/check-092-grpc-r3-001.md) ไม่กระทบ
- บันทึกก่อนการตรวจอิสระระบุ SEC001-016 ว่ายังเปิดอยู่ (จน JPO อิสระ) · H5/Light review/production registration/TLS/peer จริง/BFF CSRF · G-AUTH

รหัสอ้างอิงที่ปรากฏในบันทึกเดิม: BL-005.
