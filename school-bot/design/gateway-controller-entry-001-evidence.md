# Gateway SchoolBot entry — controller + module-owned channel — หลักฐานและข้อที่ยังไม่ยืนยัน

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway SchoolBot entry — controller + module-owned channel](gateway-controller-entry-001.md) อธิบายหลักฐานและข้อที่ยังไม่ยืนยัน.

## เอกสารอ้างอิง

[SEC001-016 (ความปลอดภัยของ local logout และ log redaction)](gateway-controller-entry-001.md) · [BL-005 (ข้อ 2: ผูกเอกสาร logout กับ controller as-built)](gateway-controller-entry-001.md)

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
- บันทึกก่อนการตรวจอิสระระบุ SEC001-016 ว่ายังเปิดอยู่ (จน JPO อิสระ) · H5 (เงื่อนไข listener/TLS/peer/private ingress และ trust ระหว่างระบบ)/Light (ผู้ทบทวน implementation ของ Gateway) review/production registration/TLS/peer จริง/Backend for Frontend (BFF) CSRF · G-AUTH

รหัสอ้างอิงที่ปรากฏในบันทึกเดิม: BL-005.

ที่มาคำชี้แจง entry อ้าง [มติ 049 (เงื่อนไขความปลอดภัยของ logout)](../requirement/decisions-049.md) และ [มติ 050 (ใช้ controller convention ของ Gateway)](../requirement/decisions-050.md).
