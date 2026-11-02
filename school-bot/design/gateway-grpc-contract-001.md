# Gateway–SchoolBot gRPC contract — Rev2

## Amendment Rev2 — G entry และเจ้าของ mapping ตามมติ050 / BL-005 ข้อ 2 (2026-10-28)

ส่วนนี้มี precedence เฉพาะ entry/registration/ผู้ทำ HTTP mapping ของ local logout ใน §3/§5 และคำอธิบาย implementation ใน §1/§2/§7; RPC อื่นยังคงขอบเขตข้อเสนอเดิม. ใช้ [controller entry Rev2](gateway-controller-entry-001.md) และ [logout slice Rev1](gateway-logout-slice-001.md).

§3: G รับ logout ด้วย SchoolBotAuthController ใน controller pipeline เดิม. SmartScheme selector ส่ง prefix `/api/school-bot/service/v2` ไป SchoolBotOpaque ซึ่งคืน NoResult; opaque token ไม่เข้า JwtBearerHandler. ไม่ใช้ branch ก่อน UseAuthentication และไม่พึ่ง AllowAnonymous เพียงอย่างเดียว. B ยังคงเป็น authority ของ session/tenant/Channel/License/membership/revocation; การมี local entry ไม่ปิด G/Light/H5 หรือเปิด production.

§5: SchoolBotAuthController ส่งงานให้ SchoolBotLogoutService; service รับ RpcException แล้วใช้ SchoolBotTrailerValidator ตรวจ peer/status/code/correlation ก่อนสร้าง HTTP response ตามสัญญาเดิม. คำว่า mapper เฉพาะ Q สำหรับ logout จึงหมายถึง service นี้ ไม่ใช่ global exception middleware และไม่ใช่ controller catch แล้วกลืน failure. HTTP validation ของ logout อยู่ใน controller/service ก่อน RPC; ข้อ 415/JSON validation ของ operation อื่นไม่ทำให้ logout เริ่ม parse JSON body.

หลักฐาน G/src/ApiGateway.API/SchoolBot/: SchoolBotAuthController.cs:38–58; SchoolBotLogoutRegistration.cs:120–133; SchoolBotLogoutService.cs:40–173,185–223. Client ของ logout ใช้ CreateChannel/CreateGeneratedClient ตาม SchoolBotSessionGrpcClient.cs:17–102; คำว่า named gRPC client ใน review packet ไม่ใช่ข้ออ้างว่า logout ใช้ global client registration.

ข้อความ “ยังไม่มี .proto/codegen”, “ก่อน implementation” และ “ยังไม่ได้รัน” ในฉบับแรกเป็นหลักฐาน ณ ใบงาน057 สำหรับ logout; อ่านขอบเขต wire subset จาก logout slice และผลตรวจที่ JPO092 (memory: planning/jpo-092-logout-r4-001.md). ไม่ถือว่า RPC Login/exchange/session/me/revoke ถูก implement หรือรับรองตามไปด้วย. สถานะปัจจุบันอยู่ที่ [index](index.md).

คง DTO/field numbers, error pairs, metadata/trailer limits, deadline/retry และ transport เดิม. ไม่เลือก global mapper หรือ middleware entry เพราะมติ050 กำหนด controller และ local logout มี service รับผิดชอบ mapping อยู่แล้ว.

วันที่ 2026-10-24 · ใบงาน057 · สถานะและรายการรอรับรองอยู่ที่ [index](index.md)

## 1. ขอบเขตและหลักฐาน

สัญญาเสนอสำหรับ client HTTP→G→gRPC B ตาม [Gateway Rev3](gateway-integration-001.md); browser ผ่าน BFF. อ่านร่วม [DES-012](des-012.md), [HTTP rules Rev7](data-contract-rules.md), [Desktop adapter Rev4](desktop-login-adapter-001.md). ไม่เปลี่ยน schema, session lifetime หรือมติ035; ไม่ต้องมี DBML delta. เอกสารนี้ไม่อนุญาต implementation และไม่รับรอง integration.

พาธย่อ: G=`target/sb-api-gateway`, B=`target/school-bot`; GI=`G/src/ApiGateway.Infrastructure`, GA=`G/src/ApiGateway.API`, BA=`B/web/src/SchoolBot.Api`.

ข้อเท็จจริงที่ตรวจ source ซ้ำ:
- `G/AGENTS.md:29,35–37`: REST→gRPC, tenant จาก JWT, error ผ่าน middleware และ protected paths ต้อง Light review.
- `GI/Extensions/InfrastructureServiceExtensions.cs:597–676`: metadata/deadline/circuit breaker/retry; default deadline 5s, receive limit 16MiB, มี insecure channel เมื่อ scheme เป็น http/dns. ไม่ใช่หลักฐาน TLS/config ที่ deploy.
- `GI/Common/Grpc/GatewayCallMetadataInterceptor.cs:64–77,100–107`: ส่ง PostalCode/Sid/IsAdmin จาก principal และไม่ทับ metadata ที่มีอยู่แล้ว; Sid ไม่ใช่ canonical AccountId/ProfileId.
- `GI/Common/Grpc/IdempotentRetryInterceptor.cs:28–30,51–75`: GET/HEAD retry Unavailable อีก 2 ครั้ง ระยะ 100/300ms ภายใน deadline เดิม.
- `GA/ControlPlane/ControlPlaneEnforcementMiddleware.cs:29–48,66–76`: revocation/maintenance ใช้ G envelope; maintenance 503 + Retry-After 300.
- `GA/Middleware/ExceptionHandlingMiddleware.cs:90–123,157–166`: อ่าน sb-error-bin แต่คืน G envelope; Unavailable→503, DeadlineExceeded/Cancelled→408; Development อาจส่ง exception.ToString ที่บรรทัด100. จึงยังไม่ตรงเป้าหมาย 502/504 และ v2 envelope ของ B.
- `BA/Program.cs:45–48,94–129`: ลงทะเบียน logout/store และ HTTP routes; ช่วงที่ตรวจยังไม่มี login/exchange/gRPC wiring. ไม่อ้าง inventory ทั้ง repo.
- `BA/LogoutEndpoint.cs:9–33,38–45`: token ผิดรูปแบบ→204; storage failure→503 AUTH_UNAVAILABLE; unexpected→500 INTERNAL_ERROR.
- `B/web/src/SchoolBot.Application/LogoutService.cs:9–26`: ตรวจ opaque token 43 ตัว, hash แล้วเรียก store พร้อม cancellation. `SchoolBot.Infrastructure/Persistence/PostgresSessionLogoutStore.cs:19–30,32–72,74–82`: revoke+audit transaction เดียว; active session เท่านั้น; DB timeout 5s และ sanitize provider errors. ใช้ application/store เดิมได้โดยไม่ย้าย SQL ไป G.

หลักฐานรับต่อ ไม่ใช่ผลตรวจ login source ซ้ำ: sys055 (memory: planning/routing-linkage-evidence-001.json), sys056 (memory: planning/routing-linkage-evidence-002.json). HTTP logout/4032 local tests ไม่พิสูจน์ Gateway/gRPC/DB integration.

## 2. RPC และ HTTP mapping

เสนอ package `schoolbot.v2`; unary RPC แยกตาม use case ไม่มี Execute(method,path,json) หรือ catch-all. Prefix client `Q=/api/school-bot/service/v2`; mapper ต้องใช้ allowlist method/path แบบ exact. ไม่เปิด /v1/admin, health/control หรือ private introspection ผ่าน Q.

| HTTP ที่ G | service.RPC | Request → Reply | สำเร็จ |
|---|---|---|---|
| POST Q/auth/logout | SchoolBotSessionService.Logout | LogoutRequest → Empty | 204 ไม่มี body |
| POST Q/auth/web-sessions | SchoolBotSessionService.ExchangeWebSession | WebExchangeRequest → SessionIssued | 201 |
| POST Q/auth/login | SchoolBotSessionService.Login | DesktopLoginRequest → SessionIssued | 201 เฉพาะ admission ครบ |
| GET Q/auth/session | SchoolBotSessionService.GetSession | Empty → SessionView | 200 + ETag |
| PUT Q/auth/session | SchoolBotSessionService.BindProfile | BindProfileRequest → SessionView | 200 + ETag |
| GET Q/me | SchoolBotSessionService.GetMe | Empty → MeView | 200 |
| POST Q/admin/sessions/revoke | SchoolBotAdministrationService.RevokeSessions | RevokeSessionsRequest → RevokeSessionsReply | 200 |

Login/session/me ตาม DES-004 ตาราง /v2 และ lifecycle; RevokeSessions ตาม DES-012 §5. รายการนี้ไม่เปิด endpoints อื่นโดยปริยาย; staff-role/learning/export RPC ต้องมี DTO และ route manifest ของสัญญานั้นก่อนเพิ่ม ไม่ใช้ generic proxy ชดเชย.

### DTO เชิง wire

นี่คือ sketch ในเอกสาร ยังไม่มี .proto/codegen. ฟิลด์ required ต้องตรวจ presence ไม่ยอมรับ proto default แทนข้อมูลที่หาย; nullable ใช้ explicit presence. IDs เป็น int32 ตาม [canonical types](data-dictionary/contract-001.md); row ID 1..2147483647, school_id>0. UTC ใช้ google.protobuf.Timestamp โดยรักษา microseconds; enum strings ตรวจ allowlist; null แปลงเป็น JSON null ไม่ใช่ 0/empty string.

- `LogoutRequest{optional string token}`: opaque token เท่านั้น; ไม่มี/Authorization ซ้ำ/รูปแบบผิดให้ส่ง absent. B ใช้ LogoutService เดิม; token ไม่พบ/หมดอายุ/revoked→204. ไม่ตรวจ License/If-Match/Idempotency-Key ก่อน logout; storage failure ห้ามคืน204.
- `WebExchangeRequest{string legacy_credential, string channel}`: credential สกัดจาก JabjaiWebKey เพียงหนึ่งค่า; channel=school_web|staff_admin. ไม่ส่ง suffix เป็น identity. หลาย credential ปฏิเสธ401. ไม่รับ school_id/is_admin จาก body.
- `DesktopLoginRequest{int32 school_id,string username,string password,DeviceProofContext proof}`: body เดิม {school_id,username,password}; proof เป็น context จาก headers ไม่เพิ่ม public body fields. bounds ใช้ adapter Rev4 โดย password ไม่ Trim. school_id เป็น lookup hint จน admission สำเร็จ.
- `BindProfileRequest{Profile profile}`; `Profile{int32 school_id,string kind,int32 profile_id}`; kind=student|employee. Profile จาก client เป็นตัวเลือกให้ B ตรวจ membership ใหม่ ไม่ใช่ authority.
- `SessionView{int32 session_id,string channel,optional int32 account_id,int32 school_id,optional Profile profile,bool legacy_admin,Timestamp expires_at,Timestamp update_date}`; channel=desktop|school_web|staff_admin. account_id=null หมายถึงไม่มี canonical account ที่ยืนยันสำหรับ web exchange; profile=null ใช้ได้ตาม unbound/legacy-admin rules เท่านั้น.
- `SessionIssued{string access_token,string token_type,SessionView session}`; token_type=Bearer, token เป็น CSPRNG32bytes/base64url43; ไม่มี JWT/refresh. คืนครั้งเดียวและ no-store.
- `MeView{int32 account_id,string display_name,repeated Membership memberships}`; display_name≤200; `Membership{Profile profile,repeated string roles}`, roles=student|teacher|school_admin เป็นผล resolve สด ไม่ใช่ cType.
- `RevokeSessionsRequest{int32 school_id,optional int32 profile_id,optional string legacy_admin_id,optional string channel,string reason}`; legacy_admin_id≤64, reason≤1000, channel ใช้ชุดข้างต้น. null filter หมายถึงไม่จำกัดมิตินั้นตาม DES-012. school_id เป็นเป้าหมายคำสั่ง ไม่เปลี่ยน tenant ของผู้เรียก; B ตรวจ staff_admin และ scope ก่อน revoke. `RevokeSessionsReply{int32 revoked}` ≥0.
- `DeviceProofContext{string canonical_method,string canonical_path,bytes original_body,repeated ProofHeader headers}`; `ProofHeader{string name,string value}`. เฉพาะชื่อ proof headers ที่สัญญา device เดิมกำหนด; G ห้ามสร้าง DeviceJkt/ผล verified เอง. ต้องตรึง manifest ชื่อ headers และ signed path หลังตัด Q เป็น /v2 กับเจ้าของก่อนเปิด Login/Bind; ระหว่างไม่พร้อมใช้ AUTH_NOT_CONFIGURED. ไม่ reserialize body ก่อนตรวจลายเซ็น.

ส่ง ETag ผ่าน response metadata `schoolbot-etag`; G คืน HTTP ETag เดิมโดยไม่ parse วันที่. If-Match และ Idempotency-Key ส่งแบบ lossless ใน metadata เฉพาะ operation ที่ต้องใช้; BindProfile ต้องมีทั้งคู่. Login/exchange/logout ไม่มี idempotency cache. Duplicate/unknown JSON keys ต้องถูกปฏิเสธก่อนแปลง protobuf.

## 3. Identity และ tenant boundary

**ข้อเสนอที่ต้องรอ G/Light ใน H5:** route Q ใช้ scheme/pipeline เฉพาะ opaque SchoolBot session; B เป็น authority ของ session, tenant, Channel, License, membership และ revocation. ไม่ส่ง opaque Bearer เข้า SmartScheme/JWT validator และไม่ mint JWT จำลอง. JWT-only ของ G ใช้ต่อกับ legacy routes; ไม่ขอ client ถือ JWT คู่ session เพื่อใช้งาน B.

ข้อนี้เป็นข้อยกเว้นต่อ G/AGENTS.md:35 ที่ยังไม่ได้รับรอง ไม่ใช่การประกาศว่ากฎทั้งสอง reconcile แล้ว. ก่อนรับรอง ให้ service-route ยังไม่เปิดใช้งาน. AllowAnonymous อย่างเดียวไม่เพียงพอ เพราะ authentication middleware อาจอ่าน Bearer แล้ว.

Metadata allowlist:
- `authorization: Bearer <opaque>` เฉพาะ resource หลัง login; logout ใช้ token ใน DTO และไม่ส่งซ้ำ. ไม่ส่ง legacy credential กับ resource requests.
- `x-request-id`: UUID ที่ G ตรวจ/สร้าง; B ตรวจอีกครั้งและใช้กับ audit/v2 error. G requestId เดิมไม่รับประกัน UUID จึงห้าม copy โดยไม่ตรวจ.
- `x-caller=api-gateway`, traceparent ที่ผ่าน validation, x-lang=th|en; เป็น context ไม่ใช่สิทธิ์.
- `if-match`, `idempotency-key`, `origin` ตาม operation; source-rate-limit key ต้องสร้างจาก trusted ingress peer และไม่เชื่อ X-Forwarded-For ของ client. การส่งต่อไป B ต้องรับรองใน H5 มิฉะนั้นทุกผู้ใช้จะถูกรวมเป็น G peer.
- `x-school-id` ส่งได้เฉพาะค่าจาก JWT ที่ G validate แล้วใน flow ที่ใช้ JWT จริง; ห้ามผลิตจาก login hint/body. Resource แบบ opaque ไม่ต้องมี metadata นี้; B อ่าน school จาก session. หากมี trusted JWT context คู่กัน ต้องตรวจ tenant ตรง session มิฉะนั้น403 SCHOOL_MISMATCH. x-user-id/Sid/x-is-admin ไม่ใช้สร้าง B principal.

G ต้องสร้าง Metadata ใหม่จาก allowlist ไม่ copy client headers แล้วหวังให้ AddIfMissing ทับ: strip x-school-id/x-user-id/x-employee-id/x-admin-id/x-is-admin/x-access-level/x-caller และ metadata ภายในทั้งหมด. Reject duplicate authority headers; Cookie อยู่ที่ BFF, ไม่ส่งไป G/B. BFF ตรวจ Origin/CSRF ก่อนแปลง cookie เป็น Bearer; B ยังคงตรวจ Origin allowlist.

Service identity ที่ยืนยัน peer และ private ingress เป็นคนละเรื่องกับ user credential; x-caller อย่างเดียวพิสูจน์ peer ไม่ได้. host/listener/TLS/service identity/secret/env owner **รอ H5**. ไม่รับปลายทาง/Host override จาก client.

Exchange ใช้ทาง C: B เรียก private G web-principal แล้วตรวจ active school/profile/License/StaffRole เอง. decisions-035 ให้ G ตรวจกลุ่มแอดมิน/ผู้บริหารฝั่ง server และคง superadmin เดิม; JWT IsAdmin=0 ไม่ล้มผลกลุ่มที่ผ่าน แต่ห้ามใช้ IsAdmin=1 ลอยๆ แทน lookup. mapping/config ไม่พร้อม→503 AUTH_NOT_CONFIGURED; lookup ล้มเหลว→503 AUTH_UNAVAILABLE. cType ไม่ให้ school_admin/staff_admin. ทุก mutation re-check สิทธิ์/session/License ก่อน commit ตาม DES-012 §4; G control-plane revocation ไม่แทน B session revocation.

## 4. Login routing และ admission

sys056 พบ web lookup เลือก SId ล่าสุด, mobile เลือก category หลังตรวจ password/สร้าง token; ยังไม่มี single-account selector ที่พิสูจน์แล้ว. ห้ามนำ FirstOrDefault มาเป็น cardinality contract.

ก่อนส่ง password: trusted selector ใช้ school+username ตาม normalization ของ upstream ที่เลือก; ไม่ lowercase/Unicode-normalize เอง. ต้องพบ active account เดียว, cType เป็น0หรือ1 และไม่มีความกำกวมด้านบัญชี/ประเภท; missing/deleted/unknown/ambiguous ปฏิเสธ ไม่ลองหลาย routes. Routing hint ให้เพียง account/tenant/category สำหรับเลือก student mobile หรือ employee web ไม่ให้สิทธิ์ login.

หลัง authentication: ต้องผูกผลกับ account เดิมจาก selector ตลอด password-change/2FA/contact/device stages และ re-read active account/profile/tenant ก่อนออก session. ห้ามให้ caller ส่ง validated=true หรือใช้ decoded JWT/response user เป็นหลักฐาน. private attempt binding/replay/expiry/store และ public continuation ยังรอ G/owner; เอกสารนี้ไม่สร้าง ticket, actor/step field หรือ endpoint ใหม่.

แยก keys ตาม evidence002:
- AccountId คือ Master Tusers.SId; SchoolId คือ NCompany ที่ตรวจแล้ว.
- student candidate: School Tusers.SId+SchoolId จาก master SId; ต้องตรวจ active และ cardinality ไม่ใช่ถือ ID เท่ากันว่า join ผ่าน.
- employee candidate: Temployees.SEmp+SchoolId จาก NSystemId; web WorkStatus ใช้ SId, token ใช้ NSystemId??SId, 2FA ใช้ NSystemId>1 มิฉะนั้น SId. ทั้งสามไม่เท่ากันโดยอัตโนมัติ.
- เสนอ canonical employee linkage จาก server mapping ที่พิสูจน์แล้วเท่านั้น; ไม่ยอมรับ SId fallback เพียงเพราะมีค่า. ต้อง reconcile account/profile ที่ status/token/2FA ใช้ให้ตรงกัน; sentinel/null/หลาย profile ยังรอ G/legacy/vault พิสูจน์. ไม่มี schema proposal ในรอบนี้.

เสนอ diagnostic codes ภายในใหม่: `AUTH_PROFILE_MISSING`, `AUTH_ACCOUNT_CARDINALITY`, `AUTH_PROFILE_CARDINALITY`. ทั้งหมดห้ามออก session; outward คง503 AUTH_NOT_CONFIGURED สำหรับ linkage ที่ยังไม่ยืนยัน ไม่เผยจำนวนบัญชี/profile. missing/deleted account หรือ credential ผิด→401 UNAUTHORIZED; unknown category→503 AUTH_NOT_CONFIGURED. การเปิด codes ใหม่เป็น public API ต้องให้ owner รับรองก่อน ไม่แก้ rules Rev7 เอง.

HTTP200 จาก G อาจเป็น pending; token+pending หรือ malformed outcome→503 AUTH_UNAVAILABLE. คง password-change→2FA→contact และ mobile device/password-reset ทุกขั้นก่อน fully_authenticated. หลัง admission ครบจึงออก unbound Desktop session5นาที แล้ว bind ตาม membership สด อายุหลัง bind=CreateDate+8ชม. ไม่ยืดจาก retry. Web exchange คง30นาที/Staff8ชม. จำกัดด้วย source expiry เมื่อมี; ข้อยกเว้น exp=null ของเว็บไม่ขยายไป Desktop.

Login RPC ระบุเฉพาะ successful terminal contract; public pending/continuation ยังไม่ถูกตรึง จึงยังไม่พร้อมเปิด Login end-to-end. ห้ามแปลง pending เป็น401/201 เพื่อปิดช่องว่างนี้.

## 5. Error mapping

เลือก RpcException สำหรับ failure และ mapper กลางเฉพาะ route Q; controller ไม่ catch กลืน exception. ใช้ sb-error-bin มาตรฐาน G พร้อม companion trailer `schoolbot-error-bin` สำหรับ v2 semantic fields เพื่อไม่เปลี่ยน protobuf ของ service อื่น.

เสนอ `SchoolBotError{string code,string message,string request_id,optional ErrorDetails details}`; bounds code64/message512/request_id UUID. `ErrorDetails{optional string field,optional string current_etag,optional int32 retry_after_seconds,optional int32 resource_id}`; field≤128/etag≤64/retry≥0/resource>0. ไม่มี StackTrace, raw upstream results หรือ credential. จำกัด companion trailer8KiB; schema/serializer และ compatibility ของ sb-error-bin ต้องตรวจจริงก่อน codegen.

G ยอมรับเฉพาะ trailer จาก authenticated B peer, parse ผ่าน, code อยู่ allowlist และคู่ code/status ตรงตาราง; สร้าง HTTP `{error:{code,message,request_id,details?}}` ตาม rules Rev7. ไม่ห่อซ้ำใน results. ห้ามเชื่อ http_status ที่ upstream ส่งตามอำเภอใจ.

| gRPC + semantic code จาก B | HTTP |
|---|---|
| OK | ตาม success table; Logout→204 |
| InvalidArgument + INVALID_REQUEST/INVALID_INPUT/INVALID_QUERY | 400 |
| Unauthenticated + UNAUTHORIZED/SESSION_EXPIRED | 401 |
| PermissionDenied + codes403 ใน rules รวม STAFF_ROLE_REQUIRED/LICENSE_REQUIRED | 403 |
| NotFound + NOT_FOUND | 404 |
| AlreadyExists/Aborted + conflict codes409 | 409 |
| FailedPrecondition + VERSION_CONFLICT/PRECONDITION_REQUIRED/UPGRADE_REQUIRED | 412/428/426 ตาม code |
| ResourceExhausted + PAYLOAD_TOO_LARGE/RATE_LIMITED | 413/429 ตาม code |
| Internal + INTERNAL_ERROR | 500 |
| Unavailable + AUTH_NOT_CONFIGURED/AUTH_UNAVAILABLE/SERVICE_UNAVAILABLE/ADMIN_NOT_CONFIGURED | 503 |

405/415/JSON validation เกิดที่ HTTP adapter ก่อน RPC; ใช้ v2 codes เดิม. Retry-After รับเฉพาะจำนวนที่ผ่าน validation. ไม่มี trailer หรือคู่ status/code ขัดกัน ห้ามเดา semantic code จาก message.

แยก G failures: connection/protocol/invalid B reply→502; deadline ก่อนรับผล→504; maintenance/service disabled/config ไม่พร้อม/circuit open→503. ใช้ G envelope `{code:<HTTP integer>,message,messageTh,requestId,results:null}` แบบ sanitized. กรณี Unavailable ไม่มี B trailer ต้องมี local evidence แยก circuit/config จาก upstream failure; ยังต้องปรับ mapper เพราะ G ปัจจุบันให้503ทั้งหมด. DeadlineExceeded ปัจจุบัน408 ต้องปรับเฉพาะ Q หลัง Light review.

B เรียก introspection timeout/ล้มเหลว→B trailer AUTH_UNAVAILABLE→503 ไม่ใช่504 ถ้า B ตอบได้ก่อน outer deadline. หาก G หมดเวลาก่อนรับ B ให้504 และผล mutation ไม่ทราบ. Client disconnect ส่ง cancellation และไม่พยายามเขียน response ใหม่; ไม่แปลงเป็น success. ปิด exception detail ทั้ง Development บน Q และ redact logs ไม่ให้ข้อความ/StackTrace ของ upstream รั่ว.

## 6. Deadline, limits และ private exposure

ตัวเลขต่อไปเป็นข้อเสนอ ไม่ใช่ deployed SLA:

| Class | Total deadline | Retry |
|---|---|---|
| Query: GetSession/GetMe | 5s | Unavailable ที่ไม่มี domain trailer สูงสุดอีก2ครั้ง 100/300ms ภายใน deadlineเดิม |
| Mutation: Logout/BindProfile/RevokeSessions | 15s | ไม่ auto-retry แม้มี Idempotency-Key |
| Auth: Login/ExchangeWebSession | 15s | ไม่ auto-retry |
| B→G credential/continuation | ไม่เกิน10s และเวลาที่เหลือ | ไม่ retry |
| B→private G introspection | ไม่เกิน3s และเวลาที่เหลือ | ไม่ retry |

ส่ง absolute deadline/cancellation ถึง application/store; child deadline=min(class cap,parent remaining). G interceptor เดิมผูก RequestAborted เฉพาะเมื่อ caller ไม่มี token จึงต้อง linked cancellation เมื่อมี token อยู่แล้ว. ControlPlane override ห้ามขยายเกิน class cap นี้โดยเงียบ. Query retry ต้องตรวจทั้ง RPC class และ HTTP verb; domain AUTH_UNAVAILABLE ไม่ retry เพียงเพราะเป็น Unavailable. ไม่อ้าง rollback เมื่อ timeout หลัง commit.

HTTP control body64KiB, large document body2MiB/project document1MiB, response2MiB ตาม rules. เสนอ protobuf send/receive cap4MiB ทั้ง G/B และตรวจ DTO/JSON limits ซ้ำ; overhead/proof body ไม่เพิ่มเพดาน HTTP. จำกัด metadataรวม16KiBแยกจาก message; credential อยู่ใน DTO สำหรับ exchange. ก่อนเปิดใช้ต้องตรวจขนาด worst-case serialized protobuf/JSON; ไม่สืบทอด16MiBของ G เป็นสิทธิ์เพิ่ม payload. Request oversized→413; responseเกินหรือเสีย→502; ไม่ใช้ compression ข้าม limit.

Private web-principal ยังคง `GET /api/school-bot/auth/web-principal` ที่ G ตาม DES-012 §2 ไม่ใช่ RPC ของ B และไม่เพิ่ม public alias. Request มี service-peer authentication แยกจาก legacy credential; scheme JabjaiWebLegacy เท่านั้น, reject purpose/aud legacy-handoff. Response200 `{school_id:int32,user_id:int32|null,admin_id:string≤64|null,is_admin:bool,user_type:string≤16|null,expires_at:UTC|null}`; exp=null เฉพาะนโยบายเว็บเดิม. invalid credential401, mappingไม่พร้อม503 AUTH_NOT_CONFIGURED, dependencyล้มเหลว503 AUTH_UNAVAILABLE; B normalize โดยไม่ parse message.

Private route/listener ต้องรับเฉพาะ B workload และ public ingress/BFF ต้องเข้าไม่ถึง แม้ชื่อ path ถูกต้อง; B upstream ห้ามชี้กลับ Q. G private lookup ห้ามเรียก B exchange วนกลับ. ตำแหน่ง listener/network/TLS/identity และ rate limits **รอ H5**; no-store และไม่ log credential ทุก hop.

## 7. Review packet และการตัดสินใจ

G/Light ต้องรับต่อก่อน implementation:
1. รับรองข้อยกเว้น opaque-session tenant/pipeline พร้อม negative tests ของ spoofed headers, JWT/opaque สลับกัน, cross-school, anonymous logout; อ้าง AGENTS:35 และ metadata source ข้างต้น.
2. ตรวจ exact route manifest, policy/SbRateLimit/Swagger, control-plane maintenance/revocation และ BFF CSRF; ห้าม catch-all/private exposure. ระบุ CODEOWNERS สำหรับ Program/hosting/middleware/Common/Grpc.
3. ตรวจ named gRPC client, deadlines/retry/circuit/limits และ error mapper เฉพาะ Q; fixtures ต้องครอบ204,401,403,412,428,B503,G502/504/503 และ malformed trailers. อ้าง source ใน§1; ยังไม่ได้รัน.
4. G/sys/legacy/vault คืน selector/account-profile cardinality และ status/token/2FA key ที่ตรงกัน; ทำ evidence เรื่อง deleted/null/sentinel/duplicate/cross-school. ไม่ใช้ cType อนุมัติ admin.
5. Owner ตรึง continuation/attempt/device-proof contract ก่อนเปิด Login; รับรอง internal diagnostic codes และ public codes หากต้องเพิ่ม.
6. Infra/G/B ระบุ host/env-key owner/private exposure/TLS/peer authentication โดยไม่ส่งค่าลับ; ยืนยัน no-loop และ public reachability denial. H5 ยังเปิด.
7. หลังรับรอง ให้ B เป็นเจ้าของ .proto แล้ว sync ไป G ตาม AGENTS:32; ตรวจ parser/codegen/hash, HTTP fixtures และ integration จริงก่อนอ้างพร้อม. งานนี้ไม่ได้ทำขั้นเหล่านั้น.

ADR: ใช้ application logout เดิมแทนเขียน persistence ที่ G; ใช้ typed RPC แทน generic tunnel; ใช้ C exchange/opaque session แทนแชร์ signing secret หรือบังคับ JWT คู่; companion trailer เฉพาะ B แทนเปลี่ยน global G envelope; ไม่ retry mutation เพื่อเลี่ยง OTP/consume/commit ซ้ำ. ข้อยกเว้น tenant และ mapper ยังต้อง owner รับรอง ไม่ถือว่าร่างคือ approval.

## Change Log
- 2026-10-28 — Rev2: มติ050 / BL-005 ข้อ 2 ชี้แจง controller/opaque scheme และ SchoolBotLogoutService เป็นผู้ทำ logout mapping; แยกหลักฐานก่อน implementation ออกจาก local logout ปัจจุบัน โดยไม่เปลี่ยน RPC/DTO/error/metadata/trailer/transport หรือ gates.
- 2026-10-24 — Rev1: ร่าง RPC/DTO, HTTP/error mapping, trust boundary, login admission, deadlines/limits และ G/Light review packet; ไม่มี source/schema/runtime/gate delta.
