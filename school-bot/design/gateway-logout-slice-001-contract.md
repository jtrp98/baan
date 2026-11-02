# Gateway logout — local gRPC slice — ขอบเขตที่พร้อม

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway logout — local gRPC slice](gateway-logout-slice-001.md) ส่วนนี้อธิบายขอบเขตที่พร้อม อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

สัญญานี้กำหนด typed gRPC logout สำหรับ dev/in-process โดยใช้ [controller entry](gateway-controller-entry-001.md).

HTTP adapter ของ HTTP API Gateway คือ SchoolBotAuthController → SchoolBotLogoutService สำหรับ `/api/school-bot/service/v2/auth/logout`. ใช้ AddSchoolBotLogoutModule และ MapControllers พร้อม prefix convention; SmartScheme เลือก SchoolBotOpaque แทนการแยก pipeline ก่อน authentication. ไม่มี SchoolBotLogoutMiddleware, UseSchoolBotLogout หรือ MapSchoolBotLogout เป็น entry ปัจจุบัน.

Harness ฝั่ง HTTP API Gateway ใช้ AddSchoolBotLogoutModule กับ UseRouting/UseAuthentication/UseAuthorization/MapControllers; direct invocation ใช้ controller/service. Channel สร้างด้วย SchoolBotSessionGrpcClient.CreateChannel และ generated client ด้วย CreateGeneratedClient; constructor ปฏิเสธ instance ที่ไม่มี provenance ก่อน RPC. ไม่ใช้ reflection หรือ fallback ไป generated client ดิบ.

คง wire baseline, negative boundary, HTTP/RPC outcomes, limits และกฎ cancellation เดิมทุกข้อ. การเปลี่ยน harness entry ไม่อนุญาตแก้ assertion/expected/logsink นอกขอบเขตที่ controller-entry §D และ JPO ระบุ; ไม่ใช้ผล local ปิด production/H5/DB/BFF gates.

สืบจาก Gateway gRPC contract และมติ 046 เป็น technical baseline ของ logout สำหรับ dev/in-process ไม่ใช่ผล review/deploy หรือการเปิด production.

## ขอบเขตที่พร้อม

SchoolBot gRPC service สร้าง typed gRPC server เรียก LogoutService เดิม; HTTP API Gateway ทำ exact HTTP adapter เฉพาะ `POST /api/school-bot/service/v2/auth/logout`. Registration ของทั้งสองส่วนยังไม่เปิดใน production host; harness เรียก module โดยตรงกับ fake trust/store. ทำ SchoolBot gRPC service ก่อนแล้ว sync proto ไป HTTP API Gateway ห้ามเขียน service proto ด้วยมือใน HTTP API Gateway

ไม่เกี่ยวกับ signer, schema หรือการออก session. HTTP logout เดิมไม่ parse body และยังไม่มี Origin guard; อย่าแก้ behavior เดิมแถมหรืออ้างว่าตรงกฎทุกข้อแล้ว. Production Gateway ต้องใช้ opaque scheme selector ตาม controller entry และผ่าน implementation review/H5

## Wire baseline

Field numbers/csharp_namespace/google.protobuf.Empty เป็น technical choices ของ wire subset ที่ยังไม่มี implementationเดิม ไม่ใช่คำอ้างว่าเคยมีbinarycontractที่รับรองแล้ว

```proto
syntax = "proto3";
package schoolbot.v2;
option csharp_namespace = "SchoolBot.Infrastructure.Protos";
import "google/protobuf/empty.proto";
service SchoolBotSessionService {
  rpc Logout(LogoutRequest) returns (google.protobuf.Empty);
}
message LogoutRequest { optional string token = 1; }
message SchoolBotError {
  string code = 1;
  string message = 2;
  string request_id = 3;
  ErrorDetails details = 4;
}
message ErrorDetails {
  optional string field = 1;
  optional string current_etag = 2;
  optional int32 retry_after_seconds = 3;
  optional int32 resource_id = 4;
}
message ErrorDetail {
  string code = 1;
  string message = 2;
  string message_th = 3;
  repeated FieldViolation field_violations = 4;
}
message FieldViolation {
  string field = 1;
  string description = 2;
  string description_th = 3;
}
```

Canonical proto SchoolBot gRPC service: `web/src/SchoolBot.Infrastructure/Protos/ServiceSchoolBot/SchoolBotSession.proto`. HTTP API Gateway copy target: `src/ApiGateway.Infrastructure/Protos/ServiceSchoolBot/SchoolBotSession.proto`. Verify descriptors/hash and sb-error-bin compatibility with Gateway ErrorDetail.Parser. Generated types/dependencies stay out of Application/Domain; codegen server belongs API project linking canonical file

## Trust/request boundary

Exact negative cases/correlation/metadata accounting/trace/lang สำหรับ การแก้ไขเดิม ใช้ [negative boundary Rev1](gateway-logout-negative-boundary-001.md) ภายใน allowlist ของ packet เดิม; ไม่ใช้ทุก status/code ของสัญญารวมกับ logout subset โดยอัตโนมัติ.
