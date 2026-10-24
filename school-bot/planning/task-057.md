# ใบงาน057 — arch ออกแบบ gRPC contract G→B + HTTP mapping + trust boundary (docs-only)

วันที่2026-10-24 · arch/Codex t1 read-only · คิว override ใบงาน051 ขั้นที่สอง: "arch/sys จัด RPC/DTO + HTTP mapping + auth/tenant trust (JWT กับ opaque session), error/timeout/cancellation/retry/private exposure" และเตรียมส่ง implementation review ให้ G/Light

K=C:/src/schoolbright/knowledge/school-bot. อ่านก่อนตามลำดับ: K/index → design/index (ส่วน Transport ใบงาน049) → design/gateway-integration-001.md (Gateway Rev3 = มาตรฐาน transport ยืนยันแล้ว: client HTTP → G → gRPC → B; browser ผ่าน BFF) → planning/routing-linkage-evidence-001.json + 002.json (หลักฐาน sys055/056 รอบนี้) → design/des-012.md Rev9 (§2 web-principal/§4) → design/data-contract-rules.md Rev7 (HTTP semantics ฝั่ง client) → design/desktop-login-adapter-001.md Rev4 (login/session shape ที่มี)

As-built ที่ต้องตรวจซ้ำเองจาก source จริง (read-only ไม่อ่าน config/env/secret):
- G = C:/src/schoolbright/target/sb-api-gateway: AGENTS.md:29,35–37 (REST→gRPC, tenant จาก JWT, Light review) · src/ApiGateway.Infrastructure/Extensions/InfrastructureServiceExtensions.cs:549–614 (รูปแบบ gRPC client เดิม: metadata/deadline/retry) · รูป error envelope ของ G ที่ ControlPlane ใช้
- B = C:/src/schoolbright/target/school-bot: web/src/SchoolBot.Api/Program.cs:45–48,94–129 · LogoutEndpoint.cs:9–33 · Application/LogoutService + PostgresSessionLogoutStore (ใช้ domain/application ซ้ำได้เมื่อเปลี่ยน transport)

สิ่งที่ต้องออกแบบ (ทุกข้ออิงหลักฐานจริงเท่านั้น — ห้ามเดา host/port/TLS/secret ที่ยังไม่มีคำตอบ ให้ติดป้าย "รอ H5"):
1. **RPC/DTO**: เสนอ gRPC service contract ของ B (ชื่อ service/RPC ต่อ use case ที่มีจริงเริ่มจาก logout + session exchange/web-principal + service RPC ที่ DES มีอยู่) พร้อม DTO ฟิลด์และชนิด — เป็น**เอกสารสัญญา PROPOSED** ใส่ proto sketch ใน doc ได้ แต่ห้ามสร้างไฟล์ .proto จริง
2. **HTTP↔gRPC mapping**: กติกาแปลง client HTTP (path/method/status ฝั่ง G) ↔ RPC และ gRPC status ↔ HTTP status ↔ v2 error codes ที่มีอยู่ (เช่น 503 AUTH_NOT_CONFIGURED/AUTH_UNAVAILABLE, 401, 403 STAFF_ROLE_REQUIRED/LICENSE_REQUIRED, 204 logout) + gateway error envelope เดิม (upstream 502/timeout 504/maintenance 503) โดยคง error contract ของ B เดิม
3. **Auth/tenant trust boundary**: metadata ที่ G ส่งให้ B (identity/tenant มาจาก JWT ของ G ตาม AGENTS.md:35 กับ opaque session ของ B — reconcile อย่างไร ใครเป็น authority ต่อ resource ไหน), strip client headers, fail-closed ตาม decisions-035, cType ไม่ใช่สิทธิ์ admin
4. **Login/session contract ตาม handoff ของ sys056**: แยก pre-auth routing hint จาก post-auth admission; selector ต้อง reject missing/unknown/deleted/ambiguous และผูกกับบัญชีที่ authenticate จริง; แยก AccountId/ProfileId/SchoolId ชัด (สะสาง SId vs NSystemId??SId ที่ต่างกันระหว่าง web/mobile/2FA ตาม evidence002); missing-profile/cardinality failure codes ใหม่ที่ต้องเสนอ; คง password-change/2FA/contact/device stages ก่อนออก SchoolBot session; ไม่คัดลอก internal error/StackTrace ออกสาธารณะ
5. **Timeout/cancellation/retry/message-limit**: กติกาต่อ class ของ RPC (query อ่าน vs mutation vs auth exchange) — อิงรูปแบบ metadata/deadline/retry ที่ G ใช้เดิม; ห้าม auto-retry mutation; bounded message size
6. **Private exposure**: เส้น private (web-principal introspection) แยก listener/route จาก public service-route อย่างไรในสัญญา
7. **Review packet สำหรับ G/Light**: สรุปสิ่งที่ G/Light ต้องตรวจ/อนุมัติ (service-route registration, gRPC client wiring, tenant reconciliation, Light/CODEOWNERS touchpoints) เป็นรายการพร้อมหลักฐานอ้างอิง

ส่งคืน fenced JSON <=6000 tokens: {"state":"DONE|NEEDS_DESIGN_CHANGE|NEEDS_REQUIREMENT_CHANGE|NEEDS_HUMAN","summary":"...","new_files":[{"path":"knowledge/school-bot/design/gateway-grpc-contract-001.md","content":"markdown เต็มของเอกสารสัญญาใหม่ (PROPOSED)"}],"edits":[{"path":"...","old":"unique exact","new":"exact replacement"}],"open_items":["จุดที่รอ H5/owner โดยไม่เดา"],"handoff":"..."} · edits สำหรับ point­ers เท่านั้น (design/index, gateway-integration-001 Rev3→เพิ่มส่วนชี้ contract ใหม่, DES-012 ถ้าจำเป็น) — นายช่างเป็นคน apply และเก็บฉบับก่อนแก้เอง

ห้าม: เขียน/แก้ไฟล์จริงทุก repo รวม .proto, รัน build/tests/network/DB, เปิด implementation, เปลี่ยน canonical task status/gates/QA verdict, ถามผู้ใช้ซ้ำ (transport/cType/มติ035 ตอบแล้ว), อ้างว่า integration พิสูจน์แล้ว (4032 tests = local เดิม), เดา host/env/TLS/secret

## Change Log
- 2026-10-24 — เปิดใบงาน arch ออกแบบ gRPC contract ตามคิว override 051 ขั้นสอง รับหลักฐาน routing/linkage จาก055/056
