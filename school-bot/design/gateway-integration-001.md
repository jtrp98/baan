# Gateway integration — Rev5

## Amendment Rev5 — G controller entry ตามมติ050 / BL-005 ข้อ 2 (2026-10-28)

ส่วนนี้มี precedence เฉพาะรูปแบบ G entry/registration และข้อความ readiness ของ local logout ใน Rev1–Rev4 ด้านล่าง ตาม [controller entry Rev2](gateway-controller-entry-001.md). เส้นปัจจุบันคือ client HTTP → SchoolBotAuthController → SchoolBotLogoutService → typed gRPC client → B; เว็บยังผ่าน BFF และไม่มี direct public B fallback.

G ใช้ controller กับ `/api` prefix convention เดิม โดย module ลงทะเบียนผ่าน AddSchoolBotLogoutModule และรับ route ผ่าน MapControllers. SmartScheme เลือก SchoolBotOpaque สำหรับ `/api/school-bot/service/v2`; handler คืน NoResult ไม่แปลง opaque token เป็น JWT. จึงไม่ใช้ public relay branch ก่อน UseAuthentication/UserEnricher, minimal endpoint หรือ SchoolBotLogoutMiddleware. AllowAnonymous ของ logout ทำงานร่วมกับ scheme selector ไม่ใช่มาตรการแยก token เพียงอย่างเดียว.

ข้อเท็จจริงจาก G/src/ApiGateway.API/SchoolBot/: SchoolBotAuthController.cs:8–58, SchoolBotLogoutRegistration.cs:15–28,97–163 และ SchoolBotLogoutService.cs:24–223. Channel/client สร้างผ่าน CreateChannel/CreateGeneratedClient และตรวจ provenance โดยไม่ใช้ reflection ตาม SchoolBotSessionGrpcClient.cs:17–102. ผลตรวจ local และข้อที่ยังไม่ได้ตรวจอ่านจาก [JPO092](../planning/jpo-092-logout-r4-001.md) และ [index](index.md).

ข้อความว่าไม่พบ SchoolBot route/ยังต้องเริ่ม transport implementation ในหลักฐานรอบเก่าเป็นประวัติของรอบนั้น ไม่ใช่สถานะ local logout ปัจจุบัน; ไม่ขยายผลไป Login/exchange/private introspection หรือ production. คง transport, authority ของ B, error/metadata/trailer และ gates เดิมทั้งหมด.

เหตุผล: ใช้ controller convention ที่มติ050 เลือกและโค้ดใช้อยู่แล้ว; ไม่เลือก middleware/minimal entry หรือ HTTP relay เพราะเป็นรูปแบบที่ถูกแทนแล้ว ไม่ได้เพิ่มทางเลือก transport ใหม่.

## Pointer amendment Rev4 — ใบงาน057 (2026-10-24)

อ่าน [gRPC contract Rev1](gateway-grpc-contract-001.md) สำหรับ RPC/DTO, HTTP/error mapping, opaque-session trust boundary และ G/Light review packet. Rev4 เพิ่ม pointer เท่านั้น ไม่แทนมติ transport Rev3 ด้านล่าง; ข้อยกเว้น tenant และ mapper ยังรอ H5/owner ไม่อนุญาต implementation หรือยืนยัน integration.

## Override Rev3 — transport ปัจจุบัน (2026-10-24)

**Desktop/Web → HTTP API Gateway → gRPC → SchoolBot service (B)**; browser คงผ่าน same-origin BFF. ฝั่ง client ของ G ใช้ REST/HTTP JSON; G→B ใช้ gRPC ตาม `G/AGENTS.md:29` ไม่ใช่ HTTP proxy และไม่มี direct public B fallback.

ส่วนนี้มี precedence เหนือข้อความ transport ทุกส่วนของ Rev1–Rev2 ด้านล่าง รวม HTTP relay/HttpClient, การปัด gRPC และข้อความรอเลือก transport/HTTP exception. เก็บข้อความเหล่านั้นเป็นประวัติ ไม่ใช่ทางเลือกปัจจุบัน; ไม่ต้องขอเลือก gRPC ซ้ำ. route/payload/status แบบ HTTP อ่านเป็นฝั่ง client ของ G ไม่ใช่หลักฐานว่า B ต้อง expose HTTP endpoint เดียวกันหรือมี RPC mapping แล้ว.

Login HTTP เดิมของ G เป็นคนละขอบเขตกับ service transport ใหม่; ไม่สั่ง rewrite Login หรือ decoder ที่ parse HTTP/JSON outcomes. คง C, opaque session, Channel/License, decisions-035, cType และ private introspection ที่แยกจาก public service-route.

**As-built ที่ตรวจรอบนี้:** `B/web/src/SchoolBot.Api/Program.cs:45–48,94` ผูก LogoutService/PostgresSessionLogoutStore และ `LogoutEndpoint.cs:9,22` รับ HTTP POST แล้วเรียก use case. ยังไม่ครบ G→gRPC→B; inventory csproj/proto และ Program.cs ไม่พบ gRPC registration/reference หรือ .proto ในขอบเขตตรวจ. ใช้ domain/application/logout persistence เดิมซ้ำเมื่อเปลี่ยน transport โดยยังต้องพิสูจน์ integration. [QA round001](../qa/round-001.md) 4032 tests คง verdict local/static เดิม ไม่ใช่ gRPC/Gateway/DB integration proof.

**งานถัดไป sys/arch:** จัดทำ gRPC contract + HTTP mapping + trust boundary ก่อน transport implementation: RPC/DTO, auth/tenant metadata, error mapping, timeout/cancellation/retry และ private exposure ต้องอิงหลักฐานจริง งานนี้ไม่กำหนดรายละเอียดเหล่านั้นแทนเจ้าของ. `G/AGENTS.md:35–37` ยังต้อง reconcile tenant จาก JWT กับ opaque session และผ่าน Light review สำหรับ protected paths; H5/TLS/peer/runtime proof ยังค้าง ไม่ใช่คำถามเลือก transport ใหม่.

เหตุผล: ใช้มาตรฐาน G ที่ยืนยันแล้ว; ไม่ใช้ HTTP relay/HttpClient เป็น service transport เพราะขัดมาตรฐาน และไม่ rewrite Login เดิมเพราะอยู่นอกการเชื่อม G→B.

## ประวัติ Rev1–Rev2 — transport ถูก supersede โดย Rev3

ข้อความเดิมด้านล่างเก็บเพื่อประวัติ; มติ035และสัญญา auth ที่ไม่เกี่ยวกับ transport ยังคงใช้.

วันที่2026-10-23 · ใบงาน029 · สถานะอยู่ที่ [index](index.md)

## ขอบเขตและลำดับอ้างอิง

เอกสารนี้ override เฉพาะ routing/trust-boundary/H5 ของ [DES-012](des-012.md) และ [auth-evidence](auth-evidence-001.md) ตาม [คำตอบผู้ใช้](../planning/user-context-001.md) ไม่แทนสัญญา auth C, Channel, License หรือมติ025/026 และไม่ยืนยันว่ามี deployment แล้ว

## หลักฐาน as-built

พาธ G = `C:/src/schoolbright/target/sb-api-gateway` อ่าน AGENTS/CLAUDE ก่อนตรวจ source; ไม่อ่าน config/env/secret

- `G/src/ApiGateway.API/Program.cs:59–72,118–130`: ลงทะเบียน controller; authentication → user logging → control plane → authorization → rate limit → controllers
- `G/src/ApiGateway.API/Extensions/ApiServiceExtensions.cs:68–123`: SmartScheme เลือก Bearer ก่อน JabjaiWebKey; :293–296 และ `Helpers/ApiPrefixConvention.cs:13–22` เติม `/api` ให้ controller
- `G/src/ApiGateway.Infrastructure/Extensions/InfrastructureServiceExtensions.cs:549–614`: client เดิมเป็น gRPC พร้อม metadata/deadline/retry; ไม่ใช่ HTTP relay
- `G/src/ApiGateway.Infrastructure/Common/Authentication/JabjaiWebLegacyAuthHandler.cs:27–53`: เลือก header แรกและ log ชื่อ header; `JwtTokenService.cs:41–45,184–220`: secret มี fallback, ไม่บังคับ exp/iss/aud, Sid รวม admin_id/user_id
- `G/src/ApiGateway.API/ControlPlane/ControlPlaneEnforcementMiddleware.cs:29–49,56–76`: revocation ใช้ principal; maintenance ใช้ route/service และมี error envelope ของ gateway

ค้น routing/auth ใน API/Infrastructure source แล้วไม่พบ SchoolBot route, web-principal หรือ HTTP forwarder; ขอบเขตนี้ไม่ใช่การพิสูจน์ทุก proxy ภายนอกหรือ instance ที่ deploy ข้อเท็จจริงเดิมว่าไม่มี HTTP forwarder จึงคงไว้เป็น implementation needed

## Topology และ route ที่ต้องเพิ่ม

```text
browser web-system → same-origin W BFF → G public service-route → B
browser admin web → same-origin admin BFF → G public service-route → B
Desktop host → G public service-route → B
B exchange → G private web-principal → response กลับ B
```

B คือ SchoolBot service เดียว เส้น introspection เป็นคนละ route/listener exposure กับ public relay ไม่วิ่งวนผ่าน BFF หรือ SchoolBot relay

ข้อเสนอ route: `G /api/school-bot/service/v2/<path>` ส่งไป `B /v2/<path>` ด้วย method/path allowlist จากสัญญาที่มีอยู่; ตัวอย่าง POST `auth/web-sessions`, POST `auth/login` และ resource หลัง login เส้น private คง `GET /api/school-bot/auth/web-principal` ตาม DES-012 §2 ห้าม public ingress/BFF relay เปิดถึงเส้นนี้ ห้าม catch-all รวม `/api/school-bot/*`, `/v1/admin`, health/control หรือ URL ปลายทางจาก client

W ใช้ upstream gateway เดิมและเพิ่ม route mapping SchoolBot; admin BFF ใช้ gateway เช่นกัน Desktop base URL ต้องรวม public service prefix ไม่มี direct public B fallback ชื่อ host/instance ยังไม่ทราบ

## วิธี implement เล็กสุดและ trust

ต่อยอด ASP.NET hosting, controller/route convention, rate limit และ logging เดิมด้วย HTTP adapter เฉพาะ SchoolBot ใช้ HttpClient ที่มีในแพลตฟอร์ม ไม่เพิ่ม proxy framework/dependency และไม่แปลง SchoolBot เป็น gRPC เพียงเพื่อ routing

แยก public relay pipeline ก่อน legacy UseAuthentication/UserEnricher: SchoolBot Bearer ต้องไม่เข้า SmartScheme/JWT validator ไม่สร้าง legacy principal จาก opaque token; ไม่ใช้ AllowAnonymous อย่างเดียวแล้วปล่อย global authentication อ่าน Bearer ต่อ ต้องคง security headers, request limits, rate limit และ maintenance ของ route โดย authz/session/revocation/Channel/tenant ตรวจที่ B จริง นี่ไม่ใช่การ bypass auth ของ B และไม่กระทบ scheme ของ route legacy อื่น การแก้ Program/ส่วนล็อกต้องผ่าน Light/CODEOWNERS review

- Exchange ส่งเฉพาะ legacy credential ที่จำเป็นไป B แล้ว B ส่งไป private G; resource หลังแลกส่งเฉพาะ SchoolBot Bearer ไม่พก legacy credential ต่อ
- BFF เป็นทางส่ง ไม่ผลิตสิทธิ์ admin BFF อ่าน `__Host-sb-admin` ใน session ของตน แปลงเป็น Bearer ฝั่ง server ไม่ส่ง Cookie ไป G/B; mutation คง Origin/CSRF validation ก่อนใช้ cookie
- strip identity/tenant headers จาก client รวม x-school-id/x-user-id, forwarding headers และ hop-by-hop headers; สร้าง forwarding metadata เฉพาะ trusted proxy ไม่ใช้ header suffix/body เป็น SchoolId หรือสิทธิ์ SchoolId ของ resource มาจาก SchoolBot session; ตอน exchange มาจากผล introspection ที่ตรวจแล้ว
- request/response ใช้ header allowlist ตาม endpoint เช่น Content-Type, Accept, Authorization, Origin, ETag/If-Match, Idempotency-Key, Retry-After, request-id; ไม่ส่ง Cookie/Set-Cookie, secret หรือ connection string เกินจำเป็น ไม่ log token/body/ชื่อ JabjaiWebKey ที่มีตัวตน
- upstream origin/port/path ตั้งฝั่ง server แบบ allowlist ไม่รับ Host/URL override; ตรวจ normalized path ป้องกัน traversal; ปิด auto-redirect/auto-cookie และไม่ retry mutation อัตโนมัติ กำหนด bounded timeout/body size/cancellation ตาม endpoint
- ใช้ TLS และตรวจ certificate สำหรับเส้นข้าม host; infra ต้องระบุ termination/เครือข่ายภายในจริงก่อนเปิดเส้นทาง ห้ามถือว่า HTTP default ใน source พิสูจน์ TLS แล้ว B upstream ต้องไม่ชี้กลับ G/BFF; introspection URL ต้องชี้เฉพาะ private G route

Private web-principal ใช้ scheme JabjaiWebLegacy ที่ตรึงไว้และ authenticated policy ไม่ใช้ MenuPermission เฉพาะเมนู; ปฏิเสธ purpose/aud, missing school หรือไม่มีทั้ง user/admin ตาม security-mitigation-001 ใช้ raw user_id/admin_id ไม่ใช้ Sid รวม ค่า expires_at=null ยังคงอนุญาตตามมติเดิม คง no-store/rate limit; identity ที่ยังไม่ผ่านตรวจใช้ IP partition การจำกัด network/service identity ต้องแยกจาก credential ของผู้ใช้

ผล B ส่งกลับ status/body ตามสัญญาเดิม; transport failure ก่อนถึง B ใช้ gateway error envelope เดิมแบบ sanitized: upstream ติดต่อไม่ได้ 502, timeout 504, maintenance 503 ไม่รายงาน mutation ว่าสำเร็จ ส่วน exchange: introspection invalid token 401; unavailable/timeout 503 AUTH_UNAVAILABLE; แหล่ง identity/mapping ยังไม่พร้อม 503 AUTH_NOT_CONFIGURED; ไม่มี License 403 LICENSE_REQUIRED ตาม DES-012 ไม่เพิ่ม fallback ยกระดับสิทธิ์

## IsAdmin: ข้อเท็จจริงและจุดหยุด

รับหลักฐาน sys ที่ [legacy-auth-review-002](../planning/legacy-auth-review-002.md) พร้อม [HEAD/hash13ไฟล์](../planning/legacy-source-check-001.json) ไม่อ่าน source นอก workspace ซ้ำ

Legacy `FingerprintPayment/Default.aspx.cs:193–240` คำนวณ IsAdmin ใน server session จากสมาชิกกลุ่มแอดมิน/ผู้บริหารที่ active ผูก SchoolID/UserID และกลุ่ม Type=W/isEditable=false พร้อมแถวเมนู แต่ `FingerprintPayment/bypassgarde.aspx.cs:55–75` ให้ JWT IsAdmin=1 เฉพาะ user_id=0/admin_id!=null; แอดมินโรงเรียนปกติได้0

ดังนั้น introspection ที่อ่าน claim อย่างเดียวจะไม่ให้ school_admin แก่สมาชิกกลุ่มดังกล่าว G/B มองไม่เห็น server session โดยอัตโนมัติ ห้ามแก้ด้วย body/header is_admin หรือถือ token ที่มีลายเซ็นว่าเก็บสิทธิ์ครบแล้ว

Task: DES-012 §2/§4, C11/TR-AUTH-02; Reference: มติ025 H3/026 และ security-mitigation-001 SEC001-001; Reason: การเปลี่ยนจาก claim เป็นการคำนวณกลุ่มมีผลต่อผู้ได้รับสิทธิ์ จึงหยุดเฉพาะส่วนนี้รอคำตอบมนุษย์ ตัวเลือก A ตรวจ IsAdmin ตามกลุ่มฝั่ง server โดยคง superadmin เดิม; B คง JWT-only ซึ่งกลุ่มแอดมินโรงเรียนปกติจะไม่ได้สิทธิ์นี้ ห้าม implement A ก่อนอนุมัติและพิสูจน์ mapping ที่เกี่ยวข้อง

## เจ้าของและหลักฐานก่อนเปิดใช้

| เจ้าของ | สิ่งที่เตรียม | สถานะหลักฐาน |
|---|---|---|
| G/Light | relay isolation, private endpoint, route/rate-limit/log review | ยังไม่มี implementation ที่ตรวจพบ |
| W/admin BFF | gateway mapping, credential filtering, Origin/CSRF | ต้องจัดทำ |
| B/sys | exchange/session/Channel/License/revocation; bootstrap staff_admin ตามเดิม | ยังไม่มี runtime proof |
| infra/G/B | env matrix: gateway public/private origin, B upstream, TLS/allowlist, service access, secret แยกหรือ fallback; ระบุชื่อ key/owner/status ไม่ส่งค่า | host/env/instance ยังไม่ยืนยัน |
| legacy/vault | TR-AUTH-02 login TAdmin; 03 mapping; 04 collation; 05 hash/culture; 06 student login | ยังขาดตามรายงาน sys |

ชื่อ env ใหม่ให้เจ้าของแต่ละ process กำหนด; W ใช้ GATEWAY_API_URL ตามหลักฐานเดิม ไม่ตั้ง SCHOOL_BOT_API_URL ไป B ตรงโดยอัตโนมัติ

ทางเลือกที่ไม่ใช้: direct B ขัด topology ผู้ใช้; แชร์ signing secret กับ B ขัดทาง C; generic proxy/gRPC rewrite เพิ่มงานเกินความจำเป็น ไม่มี schema change จึงไม่สร้าง DBML ในรอบนี้

## Override ตามมติ decisions-035: แหล่งสิทธิ์ IsAdmin (มีลำดับเหนือจุดหยุดรอคำตอบด้านบน)

ผู้ใช้ยืนยัน**ทาง A** ตาม [decisions-035](../requirement/decisions-035.md) ปิดคำถามนโยบายแหล่ง `is_admin` (C11 / ส่วนนโยบายของ TR-AUTH-02):

1. **เกณฑ์ให้สิทธิ์ `is_admin=true` ฝั่ง server**:
   - **แอดมินโรงเรียนปกติ**: ตรวจสมาชิกกลุ่มฝั่ง server ตามหลักฐาน legacy `FingerprintPayment/Default.aspx.cs:193–240` (`TGroupPermissionUser` ที่ `SchoolID==school_id`, `UserID==user_id` (`nSystemID`), `IsActive==true` join `TGroupPermissionMenu(Type=='W')` และ `TMenuPermission` ที่ `groupName=='แอดมิน/ผู้บริหาร' && isEditable==false` และมีแถวเมนูอย่างน้อย 1 แถว) ผูกกับตัวตนพนักงานที่ active (`WorkStatus ∉ {2,3}`) และโรงเรียน active (`TCompany`) ของ `school_id` ที่ตรวจจาก token แล้วเท่านั้น
   - **Super admin เดิม**: คงสิทธิ์ตาม legacy `FingerprintPayment/bypassgarde.aspx.cs:55–75` และ `BypassAcademic.aspx.cs:43–63` (`user_id==0 && admin_id!=null` ที่ตรวจ `TAdmins` และโรงเรียน active แล้ว)
2. **การตีความ JWT และ fail-closed**:
   - JWT ของพนักงานปกติที่ส่ง `IsAdmin=0` ไม่ใช่เหตุปิดสิทธิ์กลุ่ม หากผลตรวจกลุ่มฝั่ง server ผ่าน
   - ห้ามเชื่อ `is_admin`/`user_id`/`admin_id`/`school_id` จาก request body, header หรือ suffix ของ `JabjaiWebKey-*`
   - เมื่อข้อมูล mapping (`TR-AUTH-03`), ตารางกลุ่มสิทธิ์ หรือ identity lookup ยังไม่พร้อม/เกิดความผิดพลาด ต้อง **fail closed** (`503 AUTH_NOT_CONFIGURED` / `503 AUTH_UNAVAILABLE`) ห้ามยกสิทธิ์จาก JWT claim ลอยๆ
3. **ขอบเขตสิทธิ์และข้อจำกัด**:
   - ได้เฉพาะสิทธิ์ `school_admin` ของ `school_id` นั้นบน `channel="school_web"` (ไม่กลายเป็น `staff_admin`, ไม่ให้สิทธิ์แอดมินแก่ครูทุกคนที่ไม่ใช่สมาชิกกลุ่ม, ไม่ข้ามโรงเรียน) และต้อง re-check ก่อน commit
   - ไม่สร้างตาราง/GRANT/Role ใหม่ ไม่เพิ่ม AC และไม่สมมติชื่อคอลัมน์/DB placement/query นอกเหนือที่ source ยืนยัน
   - แยก policy choice ที่ปิดแล้วออกจากสิ่งที่ยังค้าง: `TR-AUTH-02-rest` (ตัวตรวจ login `TAdmin`), `TR-AUTH-03..06`, การ implement ใน `G`/`B` และ H5 ยังไม่ปิด (G-AUTH ยังไม่ผ่าน)
4. **Test scenarios สำหรับ `inspect`/`sys` รับต่อ (สถานะ NOT_RUN — ไม่อ้างรันผ่าน)**:
   - **S1 (สมาชิกกลุ่ม)**: พนักงานในกลุ่ม `แอดมิน/ผู้บริหาร` ที่ active ของโรงเรียนตนเอง แม้ JWT ส่ง `IsAdmin=0` → ได้ `is_admin=true` (`school_admin` เฉพาะโรงเรียนนั้น)
   - **S2 (ไม่เป็นสมาชิก)**: ครู/พนักงานปกติในโรงเรียนเดียวกันที่ไม่อยู่ในกลุ่ม → ได้ `is_admin=false` (ไม่ได้ `school_admin`)
   - **S3 (ถูกถอนสิทธิ์/พ้นสภาพ)**: ผู้ใช้ที่ถูกถอนจากกลุ่ม (`IsActive=false` หรือไม่มีเมนู `Type='W'` ของกลุ่ม) หรือ `WorkStatus ∈ {2,3}` → ปฏิเสธ `school_admin` ทั้งตอนแลก session และตอน re-check ก่อน commit
   - **S4 (ข้ามโรงเรียน)**: แอดมินกลุ่มของโรงเรียน A เรียกจัดการข้อมูลโรงเรียน B → ปฏิเสธ (`403`)
   - **S5 (Super admin เดิม)**: token `user_id=0, admin_id!=null` ของโรงเรียนที่ active → คงได้ `is_admin=true` สำหรับ `school_web` ของโรงเรียนนั้น แต่แลก `staff_admin` ไม่ได้หากไม่มี `SchoolBotStaffRole`
   - **S6 (Body/Header ปลอม หรือ mapping ไม่พร้อม)**: ส่ง body/header ปลอม (`is_admin=true`, `x-school-id`, suffix ไม่ตรง) หรือระบบกลุ่ม/mapping ยังไม่ตั้งค่า → ปฏิเสธ (`401`/`403`) หรือ fail closed (`503 AUTH_NOT_CONFIGURED`)

## Override Rev2 — H5 transport ต้อง owner review

มีลำดับเหนือข้อเสนอ HTTP adapter/HttpClient และการปัด gRPC ด้านบน: `G/AGENTS.md:29` กำหนด REST→gRPC ไป service; `:35,37` กำหนด tenant จาก JWT และ Light review ส่วน hosting/auth pipeline. ข้อเสนอ relay opaque Bearer เดิมจึงมี owner-review gap ทั้ง transport/tenant boundary. คง topology ผ่าน G และ private introspection แยกจาก public service-route; ให้ G/Light กับ B ระบุวิธีที่สอดคล้องมาตรฐานหรือข้อยกเว้นที่ได้รับอนุมัติก่อน implement. ไม่สร้าง proxy/framework/proto หรือเลือก transport ใหม่ในงานนี้. Login เดิมและ local DI ports ไม่พิสูจน์ว่า SchoolBot route พร้อม ดู [reuse](gateway-login-reuse-001.md).

## Change Log
- 2026-10-28 — Rev5: มติ050 / BL-005 ข้อ 2 ปรับคำอธิบาย G entry เป็น controller/service และ module-owned channel ตาม as-built; จำกัดข้อความ implementation เดิมให้เป็นประวัติของรอบตรวจ คง transport/error/metadata/trailer/schema และ gates เดิม.
- 2026-10-24 — Rev4: ใบงาน057 เพิ่ม pointer สัญญา gRPC Rev1; คง transport/auth/schema/gates เดิม
- 2026-10-24 — Rev3: ใบงาน049 ยก REST→gRPC ขึ้นเป็น topology ปัจจุบัน; แยก HTTP logout as-built/ผล local tests จาก transport integration; คงประวัติและ H5/Light
- 2026-10-23 — Rev2: ใบงาน032 ระบุข้อขัดกัน HTTP relay กับกฎ G; คง035/C/H5 และไม่อนุมัติข้อยกเว้นแทน owner
- 2026-10-23 — ใบงาน030: append override ตาม [decisions-035](../requirement/decisions-035.md) ยืนยันทาง A (ตรวจกลุ่มแอดมิน/ผู้บริหารฝั่ง server + คง superadmin เดิม), กฎ fail-closed และ test scenarios S1–S6; คง H5/technical proof/gates เดิม
- 2026-10-23 — Rev1: ใบงาน029 รับ topology ผู้ใช้/legacy evidence และตรวจ gateway routing/auth แบบ read-only; แยก implementation จาก unknown คง gates เดิม ไม่มี tests/network probe/deploy
