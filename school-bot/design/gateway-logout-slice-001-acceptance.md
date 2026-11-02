# Gateway logout — local gRPC สำหรับ dev/in-process — Replies, acceptance และหลักฐาน

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway logout — local gRPC สำหรับ dev/in-process](gateway-logout-slice-001.md) อธิบาย Replies, acceptance และหลักฐาน.

## เอกสารอ้างอิง

[BL-005 (ข้อ 2: ผูกเอกสาร logout กับ controller as-built)](gateway-controller-entry-001.md)

## Replies/errors

Success Empty→204/body0. Every HTTP result has no-store and X-Request-Id UUID; body request_id matches header when applicable

| SchoolBot gRPC service status/code | HTTP |
|---|---|
| OK/Empty | 204 |
| ResourceExhausted/RATE_LIMITED | 429 v2; Retry-After only validated metadata |
| Unavailable/AUTH_UNAVAILABLE or AUTH_NOT_CONFIGURED | 503 v2 |
| Internal/INTERNAL_ERROR | 500 v2 sanitized |
| PermissionDenied/ORIGIN_NOT_ALLOWED | 403 v2 |
| Untrusted service peer | Unauthenticated without semantic trailer; never store/success |

Domain errors carry one each sb-error-bin(binary ErrorDetail) and schoolbot-error-bin(binary SchoolBotError), consistent codes/messages/request UUID. Enforce companion≤8KiB, total metadata≤16KiB, protobuf≤4MiB; code≤64/message≤512, field≤128/etag≤64, retry≥0/resource>0. HTTP API Gateway rejects missing/duplicate/malformed/oversize/unknown/status-mismatched/UUID-mismatched/untrusted trailers as502; never infer semantics from Status.Detail

HTTP API Gateway transport/protocol/invalid reply→502; outer deadline→504; disabled/config/circuit/maintenance→503. These use sanitized existing HTTP API Gateway envelope, not v2; maintenance Retry-After300. No exception detail even Development. Logout total deadline≤15seconds and parent remainder; linked cancellation through RPC/store; no retries/hedging. Cancellation is not proof of rollback

## Code/test acceptance subset

1. One RPC, optional token presence, both codegens/hash/import closure and binary Gateway ErrorDetail compatibility
2. Absent/malformed/JWT/duplicateAuthorization→204/store0 after valid peer; canonical token reaches store only as lowercaseSHA256. Wrong peer→no store even absent token
3. Source/concurrency429; malformed still204 when logout quota exhausted; permits held through actual work and released after completion/failure/cancel
4. Storage503/unexpected500 sanitized; no token/provider details in responses/logs; UUID/no-store/empty204 assertions
5. Negative trailer cases above failclosed; spoofed identity/forwarded metadata does not change target/hash/quota
6. Exact route only; wrong method405; siblings/private/v1/admin/health/traversal not proxied; production host does not expose new route
7. Cancellation/deadline cap/no retry; body>64KiB→413 before RPC; disallowedOrigin403; no CORS
8. Existing HTTP logout/Gateway legacy behavior regression passes. TestServer generatedclient→actualprotobuf→realserver→fakeControlledLogoutStore; HTTP API Gateway HTTProute→typedclient→inprocessfakegRPC endpoint. No real DB/socket requirement

ผู้พัฒนา implement product code และผู้ตรวจรับเป็นเจ้าของ independent tests. Expected commands after dependencies available: SchoolBot gRPC service `dotnet test SchoolBot.slnx --no-restore --disable-build-servers -m:1`; HTTP API Gateway `dotnet test tests/ApiGateway.Platform.Tests --no-restore --filter FullyQualifiedName~SchoolBotLogout --blame-hang-timeout 5m`. All packet outcomes initially NOT_RUN

## Remaining live prerequisites

Light (ผู้ทบทวน implementation ของ Gateway) implementation review; H5 (เงื่อนไข listener/TLS/peer/private ingress และ trust ระหว่างระบบ) listener/TLS/peer/private ingress/source-rate-limit/Origin/Backend for Frontend (BFF)-CSRF; real DB atomicity/schema parity; distributed limiter/maintenance/circuit/fullpipeline log redaction/reachability and real Gateway↔SchoolBot gRPC service evidence. Packet is not their closure. signer/custody stays พักตาม [มติ 047 (พักคำถาม signing custody)](../requirement/decisions-047.md)

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

หลักฐาน sb-api-gateway/src/ApiGateway.API/SchoolBot/: SchoolBotAuthController.cs:8–58; SchoolBotLogoutRegistration.cs:97–163; SchoolBotSessionGrpcClient.cs:17–102. ข้อความ “สถานะเริ่มต้นก่อนตรวจเป็นยังไม่ได้รัน ผลภายหลังอยู่ในหลักฐาน integration” เป็นประวัติเริ่มต้นของ packet; ผลตรวจภายหลังอ้าง JPO092 (memory: planning/jpo-092-logout-r4-001.md) และสถานะใน [index](index.md).

รหัสอ้างอิงที่ปรากฏในบันทึกเดิม: BL-005.
