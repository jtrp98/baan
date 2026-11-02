# Gateway logout — local gRPC slice — Rev1

## Amendment Rev1 — controller entry ตามมติ050 / BL-005 ข้อ 2 (2026-10-28)

Rev1 เป็นการใส่เลข revision ครั้งแรกของไฟล์นี้; เนื้อหาใบงาน088/089 ด้านล่างคงเป็นฐานและประวัติเดิม. ส่วนนี้มี precedence เฉพาะ G entry, channel construction และ harness seam ตาม [controller entry Rev2](gateway-controller-entry-001.md).

HTTP adapter ของ G คือ SchoolBotAuthController → SchoolBotLogoutService สำหรับ `/api/school-bot/service/v2/auth/logout`. ใช้ AddSchoolBotLogoutModule และ MapControllers พร้อม prefix convention; SmartScheme เลือก SchoolBotOpaque แทนการแยก pipeline ก่อน authentication. ไม่มี SchoolBotLogoutMiddleware, UseSchoolBotLogout หรือ MapSchoolBotLogout เป็น entry ปัจจุบัน.

Harness ฝั่ง G ใช้ AddSchoolBotLogoutModule กับ UseRouting/UseAuthentication/UseAuthorization/MapControllers; direct invocation ใช้ controller/service. Channel สร้างด้วย SchoolBotSessionGrpcClient.CreateChannel และ generated client ด้วย CreateGeneratedClient; constructor ปฏิเสธ instance ที่ไม่มี provenance ก่อน RPC. ไม่ใช้ reflection หรือ fallback ไป generated client ดิบ.

หลักฐาน G/src/ApiGateway.API/SchoolBot/: SchoolBotAuthController.cs:8–58; SchoolBotLogoutRegistration.cs:97–163; SchoolBotSessionGrpcClient.cs:17–102. ข้อความ “All packet outcomes initially NOT_RUN” เป็นประวัติเริ่มต้นของ packet; ผลตรวจภายหลังอ้าง JPO092 (memory: planning/jpo-092-logout-r4-001.md) และสถานะใน [index](index.md).

คง wire baseline, negative boundary, HTTP/RPC outcomes, limits และกฎ cancellation เดิมทุกข้อ. การเปลี่ยน harness entry ไม่อนุญาตแก้ assertion/expected/logsink นอกขอบเขตที่ controller-entry §D และ JPO ระบุ; ไม่ใช้ผล local ปิด production/H5/DB/BFF gates.

วันที่ 2026-10-26 · เจ้าของ: arch Codex T1 · ผู้สกัดบันทึก: นายช่าง · ใบงาน088

รับผล DONE จาก run `2026-10-26-08-33-29-arch-tier-t1-1agents-a7Dj4N`. สืบจาก gateway-grpc-contract-001 Rev1 และ decisions-046; เป็น technical baseline ของ subset ใหม่สำหรับ dev/in-process เท่านั้น ไม่ใช่ผล review/deploy หรือเปิด production

## ขอบเขตที่พร้อม

B สร้าง typed gRPC server เรียก LogoutService เดิม; G ทำ exact HTTP adapter เฉพาะ `POST /api/school-bot/service/v2/auth/logout`. Registration ของทั้งสองส่วนยังไม่เปิดใน production host; harness เรียก module โดยตรงกับ fake trust/store. ทำ B ก่อนแล้ว sync proto ไป G ห้ามเขียน service proto ด้วยมือใน G

ไม่เกี่ยวกับ signer, schema หรือการออก session. HTTP logout เดิมไม่ parse body และยังไม่มี Origin guard; อย่าแก้ behavior เดิมแถมหรืออ้างว่าตรงกฎทุกข้อแล้ว. Production Gateway ต้องแยก opaque pipeline ก่อน SmartScheme และผ่าน implementation review/H5

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

Canonical proto B: `web/src/SchoolBot.Infrastructure/Protos/ServiceSchoolBot/SchoolBotSession.proto`. G copy target: `src/ApiGateway.Infrastructure/Protos/ServiceSchoolBot/SchoolBotSession.proto`. Verify descriptors/hash and sb-error-bin compatibility with Gateway ErrorDetail.Parser. Generated types/dependencies stay out of Application/Domain; codegen server belongs API project linking canonical file

## Trust/request boundary

Exact negative cases/correlation/metadata accounting/trace/lang สำหรับ rework2 ใช้ [negative boundary Rev1](gateway-logout-negative-boundary-001.md) ภายใน allowlist ของ packet เดิม; ไม่ใช้ทุก status/code ของสัญญารวมกับ logout subset โดยอัตโนมัติ.

- B order: verified service peer → metadata/Origin → token canonical validation → source/work limiter → LogoutService → existing store. ITrustedGatewayPeerVerifier reads transport context; production default denies all. No trust from x-caller/header/DTO, no TrustAll/IsDevelopment/test-header bypass. Fake verifier only in test assembly
- G must verify B transport identity before trusting domain trailers. No route registration in production and no outbound call if configuration/trust adapter absent
- One Authorization Bearer of exact baseline format supplies token; missing/duplicate/malformed/JWT becomes absent. No trim-to-repair and no token from body. Body≤64KiB, body identity ignored
- Fresh metadata allowlist: nonempty UUID-D x-request-id, x-caller=api-gateway; optional validated traceparent/x-lang/origin. No Cookie/Jabjai credential/tenant/user/admin assertions/XFF or repeated authorization. Strip spoofed single identity headers; duplicate authority headers reject without RPC. B validates metadata again
- Origin present with no configured allowlist denies; no CORS headers. Fake synthetic allowlist belongs harness
- No License/ETag/If-Match/Idempotency precondition, JWT fallback, direct HTTP B fallback or mutation retry
- Keep local source limiter30/60seconds and concurrency8/queue0; peer captured before forwarded headers. Distributed source propagation remains H5, no new trusted source metadata invented

## Replies/errors

Success Empty→204/body0. Every HTTP result has no-store and X-Request-Id UUID; body request_id matches header when applicable

| B status/code | HTTP |
|---|---|
| OK/Empty | 204 |
| ResourceExhausted/RATE_LIMITED | 429 v2; Retry-After only validated metadata |
| Unavailable/AUTH_UNAVAILABLE or AUTH_NOT_CONFIGURED | 503 v2 |
| Internal/INTERNAL_ERROR | 500 v2 sanitized |
| PermissionDenied/ORIGIN_NOT_ALLOWED | 403 v2 |
| Untrusted service peer | Unauthenticated without semantic trailer; never store/success |

Domain errors carry one each sb-error-bin(binary ErrorDetail) and schoolbot-error-bin(binary SchoolBotError), consistent codes/messages/request UUID. Enforce companion≤8KiB, total metadata≤16KiB, protobuf≤4MiB; code≤64/message≤512, field≤128/etag≤64, retry≥0/resource>0. G rejects missing/duplicate/malformed/oversize/unknown/status-mismatched/UUID-mismatched/untrusted trailers as502; never infer semantics from Status.Detail

G transport/protocol/invalid reply→502; outer deadline→504; disabled/config/circuit/maintenance→503. These use sanitized existing G envelope, not v2; maintenance Retry-After300. No exception detail even Development. Logout total deadline≤15seconds and parent remainder; linked cancellation through RPC/store; no retries/hedging. Cancellation is not proof of rollback

## Code/test acceptance subset

1. One RPC, optional token presence, both codegens/hash/import closure and binary Gateway ErrorDetail compatibility
2. Absent/malformed/JWT/duplicateAuthorization→204/store0 after valid peer; canonical token reaches store only as lowercaseSHA256. Wrong peer→no store even absent token
3. Source/concurrency429; malformed still204 when logout quota exhausted; permits held through actual work and released after completion/failure/cancel
4. Storage503/unexpected500 sanitized; no token/provider details in responses/logs; UUID/no-store/empty204 assertions
5. Negative trailer cases above failclosed; spoofed identity/forwarded metadata does not change target/hash/quota
6. Exact route only; wrong method405; siblings/private/v1/admin/health/traversal not proxied; production host does not expose new route
7. Cancellation/deadline cap/no retry; body>64KiB→413 before RPC; disallowedOrigin403; no CORS
8. Existing HTTP logout/Gateway legacy behavior regression passes. TestServer generatedclient→actualprotobuf→realserver→fakeControlledLogoutStore; G HTTProute→typedclient→inprocessfakegRPC endpoint. No real DB/socket requirement

sys implements product code, check owns independent tests. Expected commands after dependencies available: B `dotnet test SchoolBot.slnx --no-restore --disable-build-servers -m:1`; G `dotnet test tests/ApiGateway.Platform.Tests --no-restore --filter FullyQualifiedName~SchoolBotLogout --blame-hang-timeout 5m`. All packet outcomes initially NOT_RUN

## Remaining live prerequisites

Light implementation review; H5 listener/TLS/peer/private ingress/source-rate-limit/Origin/BFF-CSRF; real DB atomicity/schema parity; distributed limiter/maintenance/circuit/fullpipeline log redaction/reachability and real Gateway↔B evidence. Packet is not their closure. signer/custody stays deferred047

## Change Log

- 2026-10-28 — Rev1: มติ050 / BL-005 ข้อ 2 เพิ่มเลข revision ครั้งแรกและชี้แจง controller/service, module-owned channel และ harness seam; คงประวัติ088/089, wire/error/metadata/trailer/transport และ gates เดิม.
- 2026-10-26 — ใบงาน089: เชื่อมคำชี้แจงnegativeboundaryของarchจากcheck119/150; ไม่เปลี่ยนproto/feature/gates.

- 2026-10-26 — บันทึกข้อสรุปarchและtechnicalwirebaselineสำหรับrunnablelocalLogout; ไม่เพิ่มREQ/AC/taskIDหรือschema
