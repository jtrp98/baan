# Gateway logout — local gRPC slice — Replies/errors

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway logout — local gRPC slice](gateway-logout-slice-001.md) ส่วนนี้อธิบายReplies/errors อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

- SchoolBot gRPC service order: verified service peer → metadata/Origin → token canonical validation → source/work limiter → LogoutService → existing store. ITrustedGatewayPeerVerifier reads transport context; production default denies all. No trust from x-caller/header/DTO, no TrustAll/IsDevelopment/test-header bypass. Fake verifier only in test assembly
- HTTP API Gateway must verify SchoolBot gRPC service transport identity before trusting domain trailers. No route registration in production and no outbound call if configuration/trust adapter absent
- One Authorization Bearer of exact baseline format supplies token; missing/duplicate/malformed/JWT becomes absent. No trim-to-repair and no token from body. Body≤64KiB, body identity ignored
- Fresh metadata allowlist: nonempty UUID-D x-request-id, x-caller=api-gateway; optional validated traceparent/x-lang/origin. No Cookie/Jabjai credential/tenant/user/admin assertions/XFF or repeated authorization. Strip spoofed single identity headers; duplicate authority headers reject without RPC. SchoolBot gRPC service validates metadata again
- Origin present with no configured allowlist denies; no CORS headers. Fake synthetic allowlist belongs harness
- No License/ETag/If-Match/Idempotency precondition, JWT fallback, direct HTTP SchoolBot gRPC service fallback or mutation retry
- Keep local source limiter30/60seconds and concurrency8/queue0; peer captured before forwarded headers. Distributed source propagation remains H5, no new trusted source metadata invented

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

Light implementation review; H5 listener/TLS/peer/private ingress/source-rate-limit/Origin/BFF-CSRF; real DB atomicity/schema parity; distributed limiter/maintenance/circuit/fullpipeline log redaction/reachability and real Gateway↔SchoolBot gRPC service evidence. Packet is not their closure. signer/custody stays deferred047

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.
