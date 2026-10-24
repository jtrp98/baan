# SchoolBot — Security review รอบ 001

## ประกาศขอบเขตปัจจุบัน — 2026-10-24

ส่วนนี้กำหนดลำดับการอ่าน ไม่ใช่ re-audit: transport ใช้ [Gateway Rev3](design/gateway-integration-001.md#override-rev3--transport-ปัจจุบัน-2026-10-24) และ design/index.md ก่อนข้อความเก่า: Desktop/Web→HTTP G→gRPC B; browser ผ่าน same-origin BFF ไม่มี HTTP relay หรือ direct public B fallback. HTTP routes/status/payload ที่ระบุให้อ่านเป็นฝั่ง client ของ G; ยังไม่มีหลักฐาน RPC mapping ครบ. HTTP Login เดิมของ G และ decoder เป็นอีกขอบเขต ไม่สั่ง rewrite ตาม service transport.

คงทาง C, opaque session, Channel/License และ device binding. แหล่ง is_admin ใช้ override decisions-035 ใน Gateway Rev3: ตรวจกลุ่มฝั่ง server และคง superadmin เดิม แทนคำแนะนำ claim-only/คำถามแหล่งสิทธิ์เดิม. cType ใช้ตามคำชี้แจงใน [auth-flow](planning/auth-flow-handoff-001.md); ไม่ใช่สิทธิ์ admin หรือหลักฐาน AccountId=ProfileId และไม่เปิดคำถามธุรกิจเดิมซ้ำ.

มาตรฐาน gRPC ยืนยันแล้ว แต่ trust boundary, JWT tenant กับ opaque session, auth/tenant metadata, private exposure/service identity, TLS/peer และ Light/H5 ยังเป็น design/implementation gaps. การเลือก transport ไม่พิสูจน์ controls เหล่านี้ ไม่กำหนดรายละเอียดแทน sys/arch และไม่เพิ่ม finding เพียงเพราะยังไม่ implement. SEC001-002 ยังต้องพิสูจน์ credential/process boundary ของ B/worker; ห้ามตีความว่า G ถือ credential DB หรือ private B ลดผลกระทบจากบัญชี DB กว้างได้เอง.

[auth-flow](planning/auth-flow-handoff-001.md) ระบุ HTTP logout ใน B และผล4032 tests เฉพาะ local/static. SEC040-001 CLOSED เฉพาะ local per-process scope ไม่ครอบคลุม distributed limiting หรือ Gateway/gRPC/DB integration. Important6/Medium6/Minor3 เดิมยัง OPEN; verdict, accepted risks และ gates เดิมไม่เปลี่ยน.

ข้อความรายงานและ source observations วันที่2026-10-23 ด้านล่าง รวม mitigation และคำถามเดิม เก็บเป็นหลักฐานตามเวลานั้น อ่านประกาศนี้ก่อนเมื่อขัดกัน. ไม่ใช่ข้อยืนยัน source ปัจจุบัน และไม่ใช่คำขออนุมัติใหม่.

วันที่ 2026-10-23 · jpo / Claude Sonnet tier t2 · ผล role: NEEDS_HUMAN

[ใบงาน](planning/task-019.md) · [ผลต้นฉบับ](planning/security-response-001.json)

ตรวจแบบ static จาก source จริงของ target/school-bot (API, Desktop host, frontend, build scripts, manifests) และเส้นทาง legacy-token ใน sb-api-gateway แล้ว พบ Important 6 รายการ (planned_gap 4, deployment_unknown 1 และ web-principal 1) และ Medium/Minor 9 รายการ ไม่พบ Critical. ระบบปัจจุบันเป็น PoC ที่ไม่มี identity, entitlement หรือ update-install จริง (API ใช้ memory store และ install_supported=false) ช่องว่างส่วนใหญ่จึงเป็นงานที่ยังไม่ได้ implement ตามแผน ไม่ใช่ช่องโหว่ที่เปิดอยู่ในโค้ดตอนนี้. ที่เป็น actual defect มีเฉพาะ SEC001-007/008/013/014/015 ซึ่งผลกระทบจำกัด. ตรวจ CVE ของ dependency และสถานะกฎหมายปัจจุบันไม่ได้ เพราะ WebFetch/WebSearch ไม่ได้รับสิทธิ์ในรอบนี้ จึงไม่ประกาศ compliant หรือ vulnerable ในสองเรื่องนี้. รอบนี้ไม่มีการเขียน source/knowledge, ไม่มี request/login จริงและไม่มี network probe.

การตรวจนี้เป็น static review. ไม่มี runtime penetration test หรือคำรับรอง compliance/release. ทุก finding ที่ OPEN ยังต้องตรวจตามขอบเขตจริง; Critical/Important ใช้แก้และ jpo re-audit หรือมนุษย์รับความเสี่ยงเป็นลายลักษณ์อักษร การอนุมัติ no-exp ไม่ขยายไป finding อื่น

## Waiting on Human

- ผู้ดูแล infra/deploy: ตอนนี้มี instance ของ PoC API (Program.cs) ที่เข้าถึงจากนอกเครื่อง dev ได้หรือไม่ ตั้ง SCHOOL_BOT_ADMIN_KEY หรือ ARM_ADMIN_KEY ไว้หรือไม่ และมี reverse proxy/TLS อย่างไร (ตอบแค่มี/ไม่มี ห้ามส่งค่า)
- เจ้าของ release/infra: ใครถือ signing key ของ entitlement และ release, มี KMS/HSM หรือไม่ และ key จะอยู่ที่ใด ต้องตอบก่อน BE-004/BE-018/BE-022 และ G-RELEASE-DB
- เจ้าของ School DB/PGGradeDB (G-DB): บัญชี DB เดิมที่จะให้ SchoolBot ใช้คือตัวไหน และมีบัญชีที่มีสิทธิ์แคบกว่าอยู่แล้วหรือไม่ jpo ไม่ขอ GRANT แต่ต้องรู้ขอบเขตสิทธิ์จริง
- เจ้าของ sb-api-gateway (H5/BE-039): ยืนยันว่า LegacyWebJwt:Secret ถูกตั้งแยกจาก Jwt:Secret และใครรับผิดชอบ endpoint web-principal (ตอบสถานะ ห้ามส่งค่า secret)
- เจ้าของด้านกฎหมาย/DPO: ฐานการประมวลผลข้อมูลนักเรียนที่เป็นผู้เยาว์, retention ของ Submission/Attempt/Session/Audit/Project, และที่ตั้ง hosting. jpo ไม่ได้ตรวจกฎหมายปัจจุบัน จึงยังไม่ตัดสินเรื่องนี้

## Scope

- knowledge: index ทั้งสี่หมวด, plan/SEC-001.md, tasks-001.json แถว SEC-001, DES-001/002/004/007/012, DES-009 (เฉพาะส่วน auth/channel/grade write), decisions-025/029, gates-001, evidence-002
- code: web/src/SchoolBot.Api/Program.cs และ ApiErrors.cs, SchoolBot.Application/ManagementService.cs, SchoolBot.Domain (SchoolLicense, DesktopRelease), InMemoryManagementStore.cs
- code: app/desktopservice.go, desktopstorage.go, main.go, internal/engine/manager.go และ environment.go, frontend core/client.ts, index.html (CSP), teacher menu
- code: scripts/build-desktop.ps1/.sh, package-desktop.sh, docs/DEPLOYMENT.md และ API.md
- code: sb-api-gateway เฉพาะ JabjaiWebLegacyAuthHandler.cs และ JwtTokenService.cs (GetWebSessionPrincipal), grep หา web-principal
- manifests: SchoolBot.Api.csproj, Directory.Build.props, global.json, SchoolBot.Tests.csproj, app/go.mod, frontend package.json และ package-lock.json (เวอร์ชันและ license), engines/zide/THIRD-PARTY-NOTICES.md
- ไม่ได้เปิด: ค่า secret/env/credential, sb-tech-upgrade-web-system, C++ engine source, ไม่ได้รัน build/test/audit tool

## Checks

| การตรวจ | ผล | หลักฐาน |
| --- | --- | --- |
| Auth/authz ของ endpoint ที่เปิดอยู่ใน API | /v1/licenses/* และ /v1/updates/check เป็น public โดยออกแบบ (ไม่มี tenant หรือ user data) ส่วน /v1/admin/* ใช้ static bearer เทียบแบบ constant-time (SHA256+FixedTimeEquals) และ fail-closed 503 เมื่อไม่ตั้ง key ≥32 ตัว ไม่มี throttle หรือ audit ของ admin ดู SEC001-007 | web/src/SchoolBot.Api/Program.cs:85-118 |
| License key custody และ replay ใน API ปัจจุบัน | key สุ่ม 256 บิตและเก็บเฉพาะ SHA-256 (เหมาะกับ entropy ระดับนี้) แสดงครั้งเดียวพร้อม Cache-Control: no-store ทั้ง API. ไม่มี nonce, challenge หรือ signed lease เลย activate/validate ตอบ JSON ไม่ลงนาม จึงไม่มีกลไก replay ให้ตรวจ ดู SEC001-004/005 | ManagementService.cs:24-31,45-67<br>Program.cs:62-65 |
| Device binding | device_id เป็นสตริง 8-128 ตัวที่ client ระบุเอง ไม่มี proof-of-possession. Desktop เก็บเป็นไฟล์ plaintext ที่คัดลอกข้ามเครื่องได้ และไม่มี unbind API ดู SEC001-005 | ManagementService.cs:47-58<br>SchoolLicense.cs:20-27<br>app/desktopservice.go:70-81<br>app/desktopstorage.go:45-52 |
| Host gate / entitlement ฝั่ง Desktop | Run, SaveProject, LoadProject ไม่มี gate. ผล ActivateLicense ไม่ถูกเก็บหรือบังคับใช้ และ frontend ส่งต่อ response ดิบ ดู SEC001-004 | app/desktopservice.go:98-107,118-124<br>app/frontend/src/core/client.ts:55-71,90-94 |
| Trusted engine routing และ IPC | ผ่านในส่วนที่ตรวจ: host เลือก executable จาก registry และหาไฟล์เฉพาะข้าง exe, มี action allowlist ต่อ mode, จำกัด request 64 KB/output 1 MiB/timeout 5 วินาที, ส่ง env ให้ engine เฉพาะที่จำเป็นโดยไม่รับ host env. ไม่ได้ตรวจ validation ใน C++ engine | app/internal/engine/manager.go:28-102,184-190<br>app/internal/engine/environment.go:8-20 |
| Webview/XSS และ external navigation | ไม่พบ dangerouslySetInnerHTML, eval หรือ new Function ใน frontend/src. CSP มี script-src 'self' และไม่มี unsafe-eval. window.open ถูกเรียกจาก URL คงที่เพียงจุดเดียว (https://www.schoolbot.app) จึงไม่เห็นเส้นที่ข้อมูลภายนอกควบคุมการเปิด URL | app/frontend/index.html:6-9<br>workspace/WorkspaceLogic.ts:622-629<br>workspace/components/MainMenu.tsx:159 |
| Update trust (ฝั่ง server และ host) | publish แค่ตั้ง flag. signature ต้องไม่ว่างและ ≤4096 ตัวเท่านั้น ไม่มีการ verify, ไม่มี origin allowlist, ไม่มี withdraw. host ไม่ดาวน์โหลดหรือรันอะไรจึงไม่มีช่องเข้าถึงในตอนนี้. ดู SEC001-003 | ManagementService.cs:74-97<br>DesktopRelease.cs:35-42<br>Program.cs:85-89<br>app/desktopservice.go:109-116 |
| Signing ของ artifact ตาม script | สคริปต์ macOS ใช้ ad-hoc codesign และข้อความในสคริปต์ระบุว่าต้องใช้ Developer ID/notarization ก่อนแจกจริง. ใน scripts/ ที่ grep ไม่พบ signtool/Authenticode ของ payload Windows (พบเฉพาะการตรวจลายเซ็น WebView2 bootstrapper) จึงยังไม่มีหลักฐาน Windows signing ผูกกับ SEC001-003/006 | scripts/build-desktop.sh:95-104<br>scripts/package-desktop.sh:35<br>scripts/prepare-installer-tools.ps1:25-27 |
| เส้น gateway/web-principal | grep ไม่พบ endpoint web-principal หรือโค้ด SchoolBot ใน sb-api-gateway/src จึงเป็น planned gap. validator เดิมที่ web-principal จะต้องพึ่งไม่บังคับ exp/iss/aud และ handler ไม่ปฏิเสธ purpose=legacy-handoff ดู SEC001-001 | sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/JwtTokenService.cs:184-197<br>JabjaiWebLegacyAuthHandler.cs:25-54<br>design/des-012.md:33-37 |
| Logs และ PII ในโค้ด school-bot | API log เฉพาะคำเตือนตอนเริ่ม ไม่ log body, key หรือ device_id; error body เป็นข้อความคงที่; client IP ใช้เป็น key ของ rate limiter ใน memory เท่านั้น. ที่ gateway handler log ชื่อ header ซึ่งอาจมีรหัสโรงเรียนและผู้ใช้ดู SEC001-013. /healthz เปิดเผยว่าเป็น poc และ storage=memory (Minor) | Program.cs:84,120<br>ApiErrors.cs:25-63<br>JabjaiWebLegacyAuthHandler.cs:33,46,51 |
| Secrets ใน repo และ release payload | ไม่พบ secret literal ในไฟล์ที่ตรวจ (ตรวจเฉพาะรูปแบบการอ้างชื่อ env ไม่เปิดค่า). admin key อ่านจาก env เท่านั้น และ URL ฝังเป็น public address ตามที่ระบุ. ไม่ได้สแกนทั้ง repo และ binary | Program.cs:98<br>app/desktopservice.go:28-29<br>docs/DEPLOYMENT.md:28 |
| Dependency manifests | โปรเจกต์ .NET ที่ใช้งานจริงไม่มี PackageReference จากภายนอก (เป็น framework net10.0 + SDK 10.0.100 rollForward latestFeature), test project ใช้ xunit/coverlet. Desktop ใช้ wails/v3 v3.0.0-beta.30 (pre-release) และ x/sys v0.46.0. Frontend ใช้ react 19.3.1, blockly 13.4.0, phaser 4.2.1, vite 8.3.4, typescript 7.0.2 พร้อม lock file. ไม่ได้ตรวจ CVE ของรายการเหล่านี้ (เครื่องมือถูกปฏิเสธ) | web/src/SchoolBot.Api/SchoolBot.Api.csproj:1-6<br>web/global.json:2<br>app/go.mod:3-17<br>app/frontend/package.json:13-34<br>app/frontend/package-lock.json:1519-1536,2111,2179,2446 |
| License ของ dependency | package-lock ระบุ MIT, Apache-2.0, OFL-1.1 (fonts) และ MPL-2.0 (กลุ่ม lightningcss ซึ่งดูเป็น build-time) ไม่พบ copyleft ที่ขัดกับการแจก desktop แบบปิด. C++ ใช้ HIDAPI (เลือก BSD) และ nlohmann MIT พร้อม notice. ไม่ได้รัน check-notices และไม่ได้ตรวจ license ของ Go modules ทั้งหมด. ดู SEC001-015 เรื่อง provenance | app/frontend/package-lock.json:250-277,643-898,1206<br>engines/zide/THIRD-PARTY-NOTICES.md:3-37 |
| Design ของ grade-write และ session (DES-009/012/004) | ตรวจเฉพาะระดับเอกสาร ไม่ใช่หลักฐานว่า implement แล้ว. ทิศทางดี: preview ผูก snapshot hash, re-check สิทธิ์ก่อน confirm และตอน apply, idempotency, receipt ใน PgtgradeAuditLog, token เก็บเป็น SHA-256, password ไม่เก็บ. ข้อกังวลอยู่ที่ SEC001-002/009/010 | design/des-009.md:56-136<br>design/des-012.md:39-72<br>design/des-004.md:26,76 |

## Findings

### SEC001-001 — web-principal และการแลก token เว็บยังไม่มี และตัว validator ที่จะใช้ยังหลวมเกินกว่าที่ decisions-025 ยอมรับ

Important · planned_gap · OPEN

ผลกระทบ: decisions-025 ยอมรับเฉพาะการรับ token ที่ไม่มี exp. validator เดิมไม่ตรวจ issuer/audience และไม่บังคับ exp, handler ไม่ปฏิเสธ handoff token (purpose=legacy-handoff) และ secret fallback ไปที่ Jwt:Secret. ถ้า web-principal ห่อ validator นี้ตรงๆ จะรับ token ผิดประเภทแลกเป็น SchoolBot session และ IsAdmin ที่ตรวจสิทธิ์ admin โรงเรียนอาจมาจาก claim ที่ไม่ผ่านการตรวจประเภท token. ปัจจุบันไม่มี endpoint จึงยังไม่ถูกใช้โจมตี

หลักฐาน: sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/JwtTokenService.cs:184-197; sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/JabjaiWebLegacyAuthHandler.cs:25-54; knowledge/school-bot/design/des-012.md:33-37,46; knowledge/school-bot/requirement/decisions-025.md:19

วิธีแก้: ในงาน web-principal (BE-039/H5): (1) ปฏิเสธ token ที่มี claim purpose หรือ aud ทุกกรณี (2) บังคับ claim NCompany และ user_id/admin_id (3) คืน is_admin จาก claim ที่ตรวจแล้ว ไม่อ่านจากชื่อ header/body (4) rate limit ตาม (school,user), no-store, ไม่ log token/claims (5) ฝั่ง SchoolBot ล็อกอายุ session 30 นาที/8 ชม., audit ทุกการแลกพร้อมแหล่ง token และมีช่องทาง revoke ตาม DES-012 ข้อ 3 และ 6 (6) เมื่อ expires_at เป็น null ต้องยังจำกัดอายุ session ตามตาราง

ผู้รับ: be (ร่วมกับเจ้าของ sb-api-gateway) · Tasks: BE-039, BE-006, BE-001

การตรวจซ้ำ: jpo re-audit endpoint จริงหลัง implement: test token ที่มี purpose/aud ต้อง 401, token ไม่มี NCompany ต้อง 401, token ที่เซ็นด้วย Jwt:Secret ของ Bearer ปกติต้องไม่ผ่านถ้ามี secret แยก, ตรวจ log ว่าไม่มี token/claims. ตรวจ session cap และ audit ในรอบ SEC-002

### SEC001-002 — SchoolBot API ที่เปิดสู่ภายนอกจะถือบัญชี DB เดิมที่สิทธิ์กว้าง ทั้ง School DB และ PGGradeDB โดยไม่มีแนวป้องกันระดับ DB

Important · planned_gap · OPEN

ผลกระทบ: ถ้า API ถูกยึด ผู้โจมตีอ่านข้อมูลข้ามโรงเรียนและเขียนเกรดได้ (decisions-029 ระบุเองว่าไม่มี least privilege ระดับ DB และเป็นสมมติฐานที่ยังไม่ยืนยัน). tenant isolation ฝั่ง SchoolBot DB พึ่ง single-column FK + การตรวจใน application. Desktop login ต้องอ่านข้อมูลบัญชี legacy ซึ่งน่าจะรวม password hash ที่ยังไม่มีหลักฐานเรื่อง algorithm. นี่ไม่ใช่การรับความเสี่ยงของผู้ใช้ เพราะ decisions-029 ตัดสินแค่ไม่รัน GRANT

หลักฐาน: knowledge/school-bot/requirement/decisions-029.md:13-18; knowledge/school-bot/design/des-009.md:34,116-120; knowledge/school-bot/design/des-004.md:20-24

วิธีแก้: ไม่ต้อง GRANT: (1) แยก process/identity ของ worker เขียนเกรดออกจาก public API และให้เฉพาะ worker ถือ credential PGGradeDB (2) public API ใช้ credential School DB ที่แคบที่สุดที่เจ้าของ DB มีอยู่แล้วถ้ามี (3) data-access layer บังคับพารามิเตอร์ SchoolId ทุก query ห้าม raw SQL จาก input และมี cross-tenant test ทุก endpoint (4) credential อยู่ใน secret store/env ไม่อยู่ใน repo หรือ knowledge (5) จำกัด network egress ของ API ไปเฉพาะ DB/gateway ที่จำเป็น (6) เปิด DB audit/alert สำหรับการเขียนนอกช่องที่ SchoolBot เป็นเจ้าของ (7) ห้ามเก็บ/แคช/log password หรือ hash legacy และ rate limit login ตาม school/account/source ตาม DES-004

ผู้รับ: arch (สัญญา) และ be (implementation) โดยเจ้าของ DB ยืนยันบัญชี · Tasks: BE-001, BE-006, BE-037, BE-038, SA-004

การตรวจซ้ำ: jpo ตรวจ source ว่า credential PGGradeDB ไม่อยู่ใน process ของ public API, ตรวจ cross-tenant test และ adapter ownership guard ตาม G-AUTHZ/G-DB ก่อนเปิด export

### SEC001-003 — ห่วงโซ่ update trust ยังไม่มี: signature ไม่ถูก verify, ไม่มี origin allowlist, ไม่มี withdraw หรือ audit และยังไม่มีหลักฐาน signing ของ installer จริง

Important · planned_gap · OPEN

ผลกระทบ: ตอนนี้ไม่เปิดช่องโจมตีเพราะ host ไม่ดาวน์โหลดหรือรันอะไร (install_supported=false). แต่ถ้าเพิ่ม PrepareUpdate/InstallPreparedUpdate ก่อนปิดช่องนี้ ผู้ถือ admin key ใส่ URL https ใดก็ได้ที่ผ่านการตรวจแค่รูปแบบแล้วให้เครื่องนักเรียนรัน installer นั้นได้. build macOS ที่มีตอนนี้เป็น ad-hoc signed

หลักฐาน: ManagementService.cs:74-97; DesktopRelease.cs:35-42; Program.cs:85-89,120; scripts/build-desktop.sh:95-104; knowledge/school-bot/design/des-007.md:33-48

วิธีแก้: ห้ามเปิดดาวน์โหลด/ติดตั้งจนมีครบ: manifest ลงนาม ES256 + trust root ฝังใน host (แยก key จาก license), hash ของ artifact หลัง signing/notarization, verify ซ้ำก่อนส่งให้ OS installer จาก staging ที่ป้องกัน, origin allowlist และไม่ตาม cross-origin redirect, ปฏิเสธ version ≤ ที่ติดตั้งและ manifest หมดอายุ, publish ผ่านบัญชีรายบุคคลพร้อม four-eyes และ audit, มี withdraw, Windows Authenticode และ macOS Developer ID + notarization ก่อนแจกจริง

ผู้รับ: be (ร่วม sa สำหรับ disposition ตาม SA-001) · Tasks: BE-018, BE-019, BE-022, DBA-006, SA-001

การตรวจซ้ำ: jpo re-audit บน source จริง: manifest ปลอม, hash ไม่ตรง, signature ผิด, kid ไม่รู้จัก, redirect ข้าม origin, version ย้อนหลัง และ release ที่ withdraw ต้องไม่ถูก execute. ตรวจ signature ของ RC จริงใน SEC-002

### SEC001-004 — Desktop ไม่บังคับ entitlement ฝั่ง host เลย: Run/Save/Load ไม่มี gate, ผล activate ถูกทิ้ง และไม่มี signed lease

Important · planned_gap · OPEN

ผลกระทบ: ผู้ใช้เปิดใช้ทั้งสามโหมดได้โดยไม่ต้อง activate, เรียก host method ตรงจาก webview ได้ และ frontend gate เพียงอย่างเดียวจะข้ามได้. ไม่มีข้อมูลรั่ว แต่ REQ-009/028/034 จะไม่ถูกบังคับจนกว่าจะทำ host gate และ lease

หลักฐาน: app/desktopservice.go:98-107,118-124; app/desktopstorage.go:103-141; app/frontend/src/core/client.ts:55-94; knowledge/school-bot/design/des-001.md:5-8,28

วิธีแก้: ตามแบบ DES-001/002: gate ใน host ก่อน dispatch และก่อน Save/Load, lease เป็น JWS ES256 ผูก device key และ exp=min(checked_at+259200, license_expires_at) พร้อม public root ฝังใน host, เก็บใน OS credential store แบบ fail closed ไม่ fallback เป็นไฟล์ plaintext, ตรวจ rollback ของเวลา. อย่าถือ UI gate เป็นการควบคุม

ผู้รับ: be · Tasks: BE-007, BE-004, BE-010, FE-001

การตรวจซ้ำ: jpo re-audit: เรียก bridge ตรงโดยไม่มีสิทธิ์ต้องไม่ dispatch, copy lease ข้ามเครื่องต้องใช้ไม่ได้, denial ชนะ cache, restart ไม่ต่ออายุ ตาม AC-034

### SEC001-005 — Device binding เป็น ID สุ่มที่คัดลอกได้ และไม่มี unbind จึงทั้งใช้ซ้ำข้ามเครื่องและเกิดการล็อก seat ได้

Important · planned_gap · OPEN

ผลกระทบ: ใครคัดลอกไฟล์ device-id ไปเครื่องอื่นจะใช้ seat เดียวกันได้ไม่จำกัด. ผู้ถือ key ที่รั่วส่ง device_id สุ่มจนเต็ม DeviceLimit ได้ทำให้เครื่องจริงถูกปฏิเสธ (409) และไม่มี unbind ให้ผู้ดูแลแก้ ตรงข้ามกับ REQ-035. ผลกระทบเป็นเชิงสิทธิ์การใช้งาน ไม่ใช่ข้อมูลส่วนบุคคล

หลักฐาน: app/desktopservice.go:70-81; app/desktopstorage.go:45-52; ManagementService.cs:51-58; SchoolLicense.cs:20-27; Program.cs:109-118

วิธีแก้: ใช้ P-256 device key ใน OS store พร้อม challenge และ proof ตาม DES-002 (device_jkt แทน device-id), unbind ผ่าน admin พร้อม If-Match และ BindingEpoch, rate limit ต่อ license และต่อ IP, ล็อกการ activate ที่ล้มเหลวซ้ำ. ยอมรับตามที่ DES-002 ระบุว่า key store ไม่ป้องกัน cloned VM หรือผู้ใช้ที่เป็น administrator

ผู้รับ: be · Tasks: BE-004, BE-005, BE-007

การตรวจซ้ำ: jpo re-audit: race สองเครื่องเหลือ 1 binding, คัดลอก state ข้ามเครื่องต้องปฏิเสธ, unbind แล้วเครื่องเก่าต่อ lease ไม่ได้ ตาม AC-035

### SEC001-006 — ยังไม่ทราบว่าใครถือและเก็บ signing key ของ entitlement/release (KMS/HSM เป็นเพียงข้อเสนอ)

Important · deployment_unknown · OPEN

ผลกระทบ: ถ้า key อยู่เป็นไฟล์บน server เดียวกับ API ผู้ยึด API จะออก lease ปลอมและลงนาม update ที่ถูกรันบนเครื่องนักเรียนได้ ผลกระทบเกินกว่าตัว API

หลักฐาน: knowledge/school-bot/design/des-002.md:61; knowledge/school-bot/design/des-007.md:35; knowledge/school-bot/plan/gates-001.md:25

วิธีแก้: ตัดสิน custody ก่อน BE-004/BE-018/BE-022: key แยกกันสามชุด (license, release, content), release signing อยู่ใน CI/เครื่องแยกพร้อม HSM หรือ hardware token และ dual control, private key ห้ามอยู่ใน repo/payload/log, มี rotation และ revoke kid ด้วย keyset ที่ root เซ็น, backup มีการเข้ารหัสและบันทึกผู้เข้าถึง

ผู้รับ: arch และ infra/release owner (ผู้ตัดสินเป็นคน) · Tasks: BE-004, BE-018, BE-022, DBA-006

การตรวจซ้ำ: jpo ตรวจ runbook/คำตอบ custody ที่คนระบุ และตรวจ source/CI ว่าไม่มี private key ใน payload ก่อนปิด G-RELEASE-DB

### SEC001-007 — /v1/admin ใช้ static bearer เดียวร่วมกัน ไม่มี throttle, ไม่มี identity รายบุคคล, ไม่มี audit; มี fallback ชื่อ env เดิมและ /healthz เปิดเผยสถานะ PoC

Medium · actual_defect · OPEN

ผลกระทบ: ถ้า deploy จริง ผู้ถือ key เดียวสร้าง/เพิกถอน license และ publish release ได้โดยไม่มีผู้ใช้ผูกกับการกระทำ และไม่ถูกจำกัดการเดา key (key ยาว ≥32 ตัวอักษรแต่ตรวจเฉพาะความยาว). ผลกระทบจริงขึ้นกับว่า deploy หรือไม่ (ดูคำถามที่รอคน) และ decisions-025 สั่งปิด /v1/admin อยู่แล้ว

หลักฐาน: Program.cs:96-118; Program.cs:84; knowledge/school-bot/requirement/decisions-025.md:23

วิธีแก้: ก่อนปิด /v1/admin ตาม BE-003: ห้ามเปิดนอก loopback/ชั้น proxy ที่มี IP allowlist, ใส่ rate limit กลุ่ม admin, ลบ fallback ARM_ADMIN_KEY, log จำนวนการ auth ล้มเหลว (ไม่ log ค่า), ตัด poc/storage ออกจาก /healthz ใน production. ถาวร: ย้ายไป /v2/admin ด้วย staff session และ StaffRole ตาม DES-012 แล้วปิด v1

ผู้รับ: be · Tasks: BE-003

การตรวจซ้ำ: jpo re-audit: /v1/admin ต้องไม่ตอบหรือถูกปิดใน build ที่ release, admin ทุกเส้นต้องผูก staff identity และมี audit

### SEC001-008 — build Desktop ไม่บังคับ API URL production จึงอาจแจก binary ที่ฝัง http://localhost:8080

Medium · actual_defect · OPEN

ผลกระทบ: บน เครื่องที่ใช้ร่วมกัน process อื่นที่ฟังพอร์ต 8080 ปลอมเป็น API ตอบ license/update ได้. ตอนนี้ผลถูกทิ้งหรือไม่ถูกบังคับ จึงยังไม่มีผล แต่ถ้า host ไม่ verify ลายเซ็นของ lease/manifest จะกลายเป็นช่องหลบ. ยังมี env override SCHOOL_BOT_API_URL และ ARM_API_URL ที่เครื่องผู้ใช้

หลักฐาน: app/desktopservice.go:29,54-61,182-193; scripts/build-desktop.ps1:41-49; docs/DEPLOYMENT.md:13-33

วิธีแก้: ให้ build/package แบบ release ล้มเหลวถ้าไม่ตั้ง SCHOOL_BOT_BUILD_API_URL เป็น HTTPS, ใน production ไม่ใช้ env override หรือจำกัดเฉพาะ dev build, และสำคัญกว่าคือให้ความน่าเชื่อถือของ lease/manifest มาจากลายเซ็นกับ trust root ที่ฝัง ไม่ใช่จาก transport (SEC001-003/004)

ผู้รับ: be · Tasks: BE-020, BE-021, BE-022, BE-007

การตรวจซ้ำ: jpo ตรวจ release payload ว่าไม่มี localhost URL และทดสอบว่า response ที่ไม่ลงนามไม่ถูกรับเป็นสิทธิ์

### SEC001-009 — DES-002 ให้ replay คืน license key เดิมจาก replay window ที่เข้ารหัส ทำให้ต้องเก็บ secret ไว้ในตาราง idempotency

Medium · planned_gap · OPEN

ผลกระทบ: ตาราง SchoolBotIdempotency กลายเป็นที่เก็บ license key ที่ถอดรหัสได้ ถ้า DB หรือ key ของการเข้ารหัสรั่วจะได้ key ใช้งานได้จริง และ audit/log อาจพลอยบันทึกค่านั้น

หลักฐาน: knowledge/school-bot/design/des-002.md:51

วิธีแก้: ไม่เก็บ key ใน idempotency: ถ้า response หาย ให้ผู้ดูแลออก key ใหม่และเพิกถอนตัวเดิม (rotate); ถ้าต้องคง replay ให้ใช้ envelope encryption ด้วย KMS key แยก, TTL สั้น, ลบทันทีหลังอ่านครั้งแรก และห้ามอยู่ใน audit/log/backup นานกว่า TTL

ผู้รับ: sa (แก้ contract) และ be · Tasks: BE-003, DBA-002, SA-001

การตรวจซ้ำ: jpo ตรวจ DDL/ข้อมูลตัวอย่างว่าไม่มี key ถอดรหัสได้ค้างเกิน TTL และ list/audit ไม่คืน key

### SEC001-010 — ยังไม่มี data inventory/retention/masking สำหรับข้อมูลนักเรียน (ผู้เยาว์) ใน Session, Submission, Attempt, Project, Audit และ log

Medium · planned_gap · OPEN

ผลกระทบ: ข้อมูลที่จะเข้ามาคือ credential flow ของนักเรียนและครู, ผลงาน/ผลสอบรายบุคคล, รหัสผู้เรียนที่ผูกคะแนน, และ audit ที่ผูกตัวตนครู. ถ้าไม่ระบุ PII ต่อคอลัมน์, retention, การลบและการ mask ใน log ก่อนเขียน SQL จะแก้ย้อนหลังยาก. Desktop เก็บ project JSON แบบไม่เข้ารหัสในโปรไฟล์ผู้ใช้. ไม่ได้ตัดสินฐานทางกฎหมายหรือ cross-border เพราะตรวจแหล่งทางการไม่ได้

หลักฐาน: app/desktopstorage.go:46-52,103-141; knowledge/school-bot/design/des-004.md:76; knowledge/school-bot/design/des-009.md:131-135; knowledge/school-bot/requirement/decisions-015.md

วิธีแก้: จป. จัดทำตาราง PII ต่อคอลัมน์ (ผ่านรอบ review SQL ของ vault) พร้อม retention ที่คนตัดสิน, บังคับ mask/ไม่ log: password, token, key, school/user id ใน header, เนื้อหา submission; กำหนดว่า AuditEvent เก็บอะไรได้; ระบุเส้นทางลบ/ส่งออกข้อมูลรายคน; ให้ DPO ตัดสินฐานกฎหมายสำหรับผู้เยาว์ ที่ตั้ง hosting และการส่งข้อมูลข้ามประเทศ

ผู้รับ: arch/vault (schema) และ DPO/เจ้าของกฎหมาย (ผู้ตัดสิน) · Tasks: DBA-002, DBA-005, BE-006, BE-024

การตรวจซ้ำ: jpo ตรวจ DDL review และตัวอย่าง log จริงหลัง implement ว่าไม่มี PII ที่ห้าม พร้อมรายการที่เจ้าของกฎหมายตอบ

### SEC001-011 — ยังไม่ทราบสถานะการตั้งค่า LegacyWebJwt:Secret ของ gateway และการแชร์ key กับระบบเว็บเดิม

Medium · deployment_unknown · OPEN

ผลกระทบ: ถ้าไม่ตั้ง LegacyWebJwt:Secret โค้ดจะใช้ Jwt:Secret ซึ่งเป็น key เซ็น Bearer ของ gateway ทำให้ key เดียวเซ็นทั้ง token เว็บเดิมที่ไม่มี exp และ Bearer ปกติ. ถ้ารั่ว/แชร์ผลกระทบกว้าง และ DES-012 ทาง D (SchoolBot ถือ secret ร่วม) ถูกปัดตกด้วยเหตุผลนี้

หลักฐาน: sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/JwtTokenService.cs:44-45; sb-api-gateway/src/ApiGateway.API/Hosting/StartupDiagnostics.cs:15-22; knowledge/school-bot/design/des-012.md:22-24

วิธีแก้: ยืนยันว่าตั้ง LegacyWebJwt:Secret แยกจาก Jwt:Secret ใน production, อยู่ใน secret store, SchoolBot ไม่ได้รับ secret นี้ (ใช้ introspection ทางเดียว), มีแผน rotation. ห้ามส่งค่ามาให้ jpo ให้ตอบเพียงสถานะ

ผู้รับ: เจ้าของ sb-api-gateway/infra · Tasks: BE-039

การตรวจซ้ำ: jpo รับคำตอบสถานะจากคนและตรวจ config template ว่าไม่มีค่าจริงก่อนเปิด web-principal

### SEC001-012 — ยังไม่ทราบ topology ของ proxy/TLS ซึ่งกำหนดว่า rate limit และการป้องกันเส้นทาง public ทำงานจริงหรือไม่

Medium · deployment_unknown · OPEN

ผลกระทบ: API เชื่อ X-Forwarded-For เฉพาะจาก loopback. ถ้า proxy อยู่คนละเครื่องหรืออยู่ container network ทุก client ใช้ bucket เดียว (30/60 ต่อนาที) ทำให้ client เดียวบล็อก activate/update ของโรงเรียนอื่นได้ และ API เองไม่ทำ HTTPS/HSTS. IPv6 ใช้ที่อยู่ละบัญชี จึงเลี่ยง limit ได้ง่าย (ผลต่ำเพราะ key 256 บิต)

หลักฐาน: Program.cs:31-40,56-57,123-131; docs/DEPLOYMENT.md:49-54

วิธีแก้: ตัดสิน topology ก่อน deploy: ถ้า proxy ไม่อยู่ loopback ให้เพิ่ม trusted proxy ที่ระบุเฉพาะในโค้ด/config, ให้ proxy บังคับ HTTPS+HSTS, limit แยกชั้น edge, เพิ่ม partition ของ IPv6 เป็นระดับ /64

ผู้รับ: be และ infra · Tasks: BE-023

การตรวจซ้ำ: jpo ตรวจ deploy pack และคำตอบ topology; การทดสอบ limit บนระบบจริงทำใน SEC-002 เมื่อมีคำสั่งอนุญาต

### SEC001-013 — gateway handler log ชื่อ header ของ JabjaiWebKey ระดับ Information ทุก request ซึ่งตามที่ DES-012 บันทึกอาจมีรหัสโรงเรียนและผู้ใช้

Minor · actual_defect · OPEN

ผลกระทบ: รหัสพนักงาน/โรงเรียนเป็นตัวระบุแบบ pseudonymous ที่เข้า log ทุกครั้ง ขัดกับกฎ repo ของ gateway ที่ห้าม log PII และ web-principal จะผ่านเส้นนี้. หมายเหตุ: รูปแบบชื่อ header อ้างจาก DES-012 ไม่ได้เปิด source ของ web-system ยืนยัน

หลักฐาน: sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/JabjaiWebLegacyAuthHandler.cs:33,39,46,51; knowledge/school-bot/design/des-012.md:12

วิธีแก้: ใน endpoint web-principal และ handler ที่ใช้ร่วม ให้ log เฉพาะผลสำเร็จ/ล้มเหลวและ correlation id โดยไม่ใส่ชื่อ header หรือ claim; ตรวจเจ้าของ repo gateway

ผู้รับ: เจ้าของ sb-api-gateway · Tasks: BE-039

การตรวจซ้ำ: jpo ตรวจตัวอย่าง log หลังแก้

### SEC001-014 — เมนูครูบน Desktop ใช้ PIN ฝั่ง client ที่เป็นค่าคงที่ใน bundle เป็นเครื่องหมาย 'ต้องใช้ PIN'

Minor · actual_defect · OPEN

ผลกระทบ: ใครอ่าน bundle ก็ผ่านได้ จึงเป็น false assurance. ตอนนี้ไม่มีสิทธิ์จริงให้ข้าม (การ restart ใน UI เป็น timer จำลอง) และไม่ได้ยืนยันค่า PIN ในรายงานนี้. decisions-025 ให้ Desktop ไม่มีเมนูครู

หลักฐาน: app/frontend/src/modes/robot-control/teacher/teacherData.ts:5; app/frontend/src/modes/robot-control/teacher/TeacherMenu.tsx:174; app/frontend/src/app/AppView.tsx:348-357

วิธีแก้: นำเมนูครูออกจาก Desktop ตามมติ หรือจำกัดให้ sample/preview เท่านั้น ห้ามใช้เป็นการควบคุมสิทธิ์

ผู้รับ: fe · Tasks: FE-005

การตรวจซ้ำ: jpo ตรวจ source ว่าไม่มีเส้นทาง native ไปเมนูครูและไม่มี PIN คงที่ใน bundle release

### SEC001-015 — provenance ของ HIDAPI ที่แก้ไขในเครื่อง และ nlohmann/json ไม่มี commit/hash ต้นทางเพื่อเทียบกับ upstream

Minor · actual_defect · OPEN

ผลกระทบ: ตรวจย้อนไม่ได้ว่าโค้ด vendored ตรงกับ release ต้นทาง ซึ่งกระทบการติดตามช่องโหว่ upstream และ supply chain. license และ notice ครบตามที่เห็น

หลักฐาน: engines/zide/THIRD-PARTY-NOTICES.md:20-37

วิธีแก้: บันทึก tag/commit และ hash ของ release ต้นทาง, เทียบกับ upstream แล้วเก็บ diff ของการแก้ภายใน และเพิ่มขั้นตอนตรวจ advisory ของ dependency ใน RC

ผู้รับ: be · Tasks: BE-022

การตรวจซ้ำ: jpo ตรวจไฟล์ notice หลังอัปเดต

## Accepted risks ตามมติเดิม

| Decision | ขอบเขต | ข้อจำกัด |
| --- | --- | --- |
| decisions-025 | เฉพาะการรับ token เว็บเดิมที่ไม่มี exp และ revoke รายตัวไม่ได้ เพื่อแลกเป็น SchoolBot session ตามที่ผู้ใช้ยืนยัน (H2, 2026-10-22) | ไม่ขยายไปถึง: handoff token, token ผิดประเภทหรือไม่มี claim, การใช้ Jwt:Secret ร่วม, การ log token/claims, การรับ is_admin จากแหล่งที่ไม่ผ่านการตรวจ, session ที่อายุเกิน 30 นาที/8 ชม. ที่ DES-012 กำหนด และการไม่ audit การแลก. ข้อเสนอลดความเสี่ยงใน decisions-025 ถูกบันทึกเป็นสมมติฐาน (ยังไม่ยืนยัน) ดังนั้น jpo ถือ session cap, audit และ revoke เป็นเงื่อนไขของการตรวจ ไม่ใช่เงื่อนไขที่ผู้ใช้ยอมรับ. ไม่มีการรับความเสี่ยงอื่นจากผู้ใช้ และ jpo ไม่ได้รับความเสี่ยงแทนใคร |

## Personal data flows

| ข้อมูล | Flow | Controls | Gaps |
| --- | --- | --- | --- |
| license key และ device_id (Desktop → API) | Desktop host POST /v1/licenses/activate → API ตรวจ hash → เก็บ device_id ใน memory | ส่งผ่าน HTTPS (http อนุญาตเฉพาะ loopback), ไม่ตาม redirect, ตอบ ≤64 KB, timeout 5 วินาที, API เก็บเฉพาะ SHA-256 ของ key, ไม่ log body, rate limit 30/นาที/IP | device_id คัดลอกได้ (SEC001-005), ผลไม่ถูกเก็บหรือบังคับ (SEC001-004), URL อาจเป็น localhost ใน release (SEC001-008), ยังไม่มี persistent store จึงยังไม่มี retention |
| Project JSON ของผู้เรียน (local) | frontend → SaveProject → ไฟล์ <mode>.json ใน config dir ของผู้ใช้ (ไม่ผ่าน API) | จำกัด 1 MiB, validate JSON, เขียนแบบ atomic, ไฟล์ 0600/โฟลเดอร์ 0700 (ผลบน Windows ขึ้นกับ ACL ของโปรไฟล์ ไม่ได้ตรวจ) | ไม่เข้ารหัส, ไม่มี policy retention/ลบเมื่อถอนการติดตั้ง, ยังไม่ผ่าน host gate (SEC001-004/010) |
| ข้อมูลยืนยันตัวตน (แผน: password นักเรียน/ครู, token เว็บของครู/admin) | Desktop → /v2/auth/login → ตรวจกับบัญชี legacy ใน School DB; web-system → gateway introspection → /v2/auth/web-sessions → opaque session | ตามแบบ: password อยู่ใน memory ชั่วคราว ไม่ log, session token สุ่ม 32 ไบต์เก็บ SHA-256, ล็อกอายุ session, ตรวจ channel และ License, rate limit ตาม school/account/source | ยังไม่มี code ในรอบนี้. ติดตาม SEC001-001/002/010/011/013; algorithm password legacy ยังไม่มีหลักฐาน |
| คะแนนรายนักเรียนที่ส่งกลับ PGGradeDB (แผน) | ครู preview/confirm → outbox → worker → PGGradeDB + receipt ใน PgtgradeAuditLog | ตามแบบ: preview ผูก snapshot hash, If-Match, re-check สิทธิ์สามจุด, CAS ด้วย xmin, receipt, idempotency | บัญชี DB เดิมสิทธิ์กว้าง (SEC001-002), G-PARITY/COEXIST/TARGET/AUTHZ/DB ยังไม่ปิด, ยังไม่มี code ให้ตรวจ |
| metadata update (version/channel/platform → release URL/sha256/signature) | Desktop GET /v1/updates/check → API คืน release; host ไม่ดาวน์โหลดหรือรัน | public, ไม่มี PII, install_supported=false, ตรวจรูปแบบ HTTPS URL ไม่มี userinfo | ไม่มี verify ลายเซ็น/allowlist/withdraw (SEC001-003), key custody ไม่ทราบ (SEC001-006) |
| log และ telemetry | API logger มาตรฐาน; rate limiter ถือ IP ใน memory; gateway handler log ชื่อ header | API ไม่ log body, key หรือ device_id; ไม่มี telemetry ใน code ที่ตรวจ | ต้องกำหนดรายการห้าม log ก่อน persistent store และ web-principal (SEC001-010/013) |

## ยังไม่ได้ยืนยัน

- CVE/advisory ของ wails v3.0.0-beta.30 (pre-release), x/sys, Go 1.25 toolchain, react 19.3.1, blockly 13.4.0, phaser 4.2.1, vite 8.3.4, .NET 10 runtime ที่ใช้จริง และ NuGet/npm อื่น — WebFetch/WebSearch ไม่ได้รับสิทธิ์รอบนี้ และไม่ได้รัน npm audit/govulncheck/dotnet list package --vulnerable จึงไม่ประกาศว่ามีหรือไม่มีช่องโหว่
- สถานะกฎหมายปัจจุบัน (PDPA/GDPR) และข้อกำหนดเฉพาะของผู้เยาว์/ข้ามประเทศ — ไม่ได้ตรวจแหล่งทางการ จึงไม่ประกาศ compliant หรือไม่
- การ deploy จริง: ว่ามี instance ของ API ที่เข้าถึงได้หรือไม่, ค่า env, proxy/TLS, ที่ตั้ง hosting, secret store
- ผลของ Wails service binding ว่าเปิด method ใดให้ webview บ้างและพฤติกรรมของ -tags production (ไม่ได้รันหรืออ่าน runtime)
- ความปลอดภัยของ C++ engine, demo-engine และการ execute ของ Code/Block Lab (ไม่ได้อ่าน source)
- ACL จริงของไฟล์ใน config dir บน Windows และสถานะ signing ของ binary/installer จริง
- source ของ sb-tech-upgrade-web-system (auth-headers, BFF) และ sb-tech-upgrade-academic (credential/profile) ที่ DES-012/004 อ้างถึง — ใช้ตามที่เอกสารบันทึกเท่านั้น
- go.sum, license ของ Go modules ทั้งหมด, ผล scripts/check-notices.mjs, และผล dotnet/go/npm test (ไม่ได้รัน)
- ไม่ได้ทดสอบ rate limit, admin brute force หรือ replay กับ instance จริง (static review ไม่เท่ากับ pentest)

## ส่งต่อ

- นายช่างบันทึกรายงานนี้ลง security.md แบบ append-only; ไม่มีการเขียนไฟล์โดย jpo และไม่มี task verdict
- ส่ง finding ตาม owner/task เดิม: SEC001-001/011/013 → BE-039 (เจ้าของ sb-api-gateway, be); SEC001-002 → arch/be (BE-001/006/037/038); SEC001-003/006/008 → BE-018/019/022 และ SA-001/DBA-006; SEC001-004/005 → BE-004/005/007; SEC001-007 → BE-003; SEC001-009 → SA-001/BE-003; SEC001-010 → DBA-002/005; SEC001-014 → FE-005; SEC001-015 → BE-022
- ข้อกำหนดที่ BE-003/004/005/007, DBA-006, BE-018/019 ต้องรับเป็น input: เงื่อนไขในช่อง fix ของ SEC001-001/002/003/004/005 และ 009; งานเหล่านี้ยังไม่ควรถือ SEC-001 เป็นสัญญาณ 'ปลอดภัย' เพราะนี่คือรายงานการตรวจ ไม่ใช่การรับรอง
- Important ทั้ง 6 รายการเดินตามทางปกติ fix + jpo re-audit บน code จริง (ห้ามเชื่อคำอ้างว่าแก้แล้วจนกว่า re-audit); ไม่ขอให้คนรับความเสี่ยงแทนการแก้ และ jpo ไม่ได้รับความเสี่ยงใดเอง
- ให้เปิดสิทธิ์ WebFetch/WebSearch หรือรัน SCA (npm audit, govulncheck, dotnet list package --vulnerable) ในสภาพแวดล้อมที่อนุญาต แล้วส่งผลกลับมาที่ jpo เพื่ออ่านผล CVE และเติมในรายงานรอบหน้า; ตามแผนจะตรวจซ้ำบน RC ที่ SEC-002
- คำถามที่รอคน 5 ข้อใน waiting_on_human ตอบเป็นสถานะหรือการตัดสิน ห้ามส่งค่า secret/credential มาในแชตหรือเอกสาร
- สถานะ NEEDS_HUMAN เพราะมี Important ค้างรอ fix และ re-audit และมีข้อเท็จจริง deployment/custody/กฎหมายที่ต้องให้คนตอบ

## Change Log

- 2026-10-23 — นายช่างบันทึกและจัดรูปจากผล role ผ่าน Claude; ไม่มี runtime/test verdict หรือการปิด gate
- 2026-10-24 — ใบงาน054: เพิ่มประกาศ reading precedence ตาม Gateway Rev3 และ auth-flow; คง findings/หลักฐาน/verdict เดิม ไม่มี source review หรือ re-audit เพิ่ม

## รอบทบทวน mitigation — 2026-10-23

[คำตอบjpoครบ5ข้อ](planning/security-mitigation-001.md) · [ข้อมูลต้นฉบับ](planning/security-mitigation-response-001.json)

ตอบ 5 ข้อจาก DES-002/004/007/009/012, db/schoolbot_db.sql:142-167 และ source gateway (อ่านอย่างเดียว) ความเห็นนี้ไม่ใช่การปิด finding ทุก Important ยัง OPEN จนมี code จริงและ jpo re-audit ไม่มี risk acceptance แทนคน คำตอบ 'service เดียวผ่าน gateway' ยืนยันเฉพาะ routing ไม่ยืนยัน host/TLS/exposure/secret/instance จึงไม่ปิด SEC001-011/012 และไม่ปิด auth gap ใด รอผลอ่าน legacy ของ sys และ arch ปรับ topology ก่อนประเมิน SEC001-002 ใหม่ (gateway ซ่อน API ลด exposure ตรง แต่ไม่ลดความกว้างของ credential) ตัวเลข TTL/limit ทุกค่าเป็น (สมมติฐาน — ยังไม่ยืนยัน) CVE/กฎหมาย/ข้อกำหนด CA ยังไม่ได้ตรวจแหล่งทางการ

| Finding | ผลพิจารณา | ข้อมูลจากคนที่ยังต้องระบุ |
| --- | --- | --- |
| SEC001-002 | รับเป็นหลักฐานของการแก้บางส่วน ไม่ใช่ risk acceptance และไม่พอปิดทั้งข้อ (a)(d) พิสูจน์ตรรกะของแอป ไม่ใช่ขอบเขตความปลอดภัย (c) เป็น detective และเขียนด้วยบัญชีเดียวกับ writer (DES-009:134) process ที่ถูกยึดปลอม receipt ได้ มีแต่ (b) ที่ลด blast radius ของเส้นเขียนเกรด และนับก็ต่อเมื่อ process ของ public API ไม่ถือ credential PGGradeDB จริง แต่ preview/confirm ต้องอ่าน PGGradeDB (DES-009:58,131) จึงต้องให้การอ่านและเขียน PGGradeDB ผ่าน worker/adapter process ภายใน DES-009:31 ไม่บังคับ process เดียว ทำได้โดยไม่เปลี่ยนสัญญา ถ้าทำได้ ส่วนเขียนเกรดอาจลดเป็น Medium หลัง re-audit ส่วน School DB (บัญชีกว้าง อ่านข้ามโรงเรียน และอ่านข้อมูลบัญชี legacy ที่ login ต้องใช้ DES-004:20-24) ยังเป็น Important จนเจ้าของ DB มีบัญชีแคบกว่า หรือคนยอมรับเป็นลายลักษณ์อักษร ตอนนี้คง Important/OPEN | เจ้าของ DB+infra ตอบเป็นสถานะว่ามีบัญชี read-only/บัญชีที่แคบกว่าแล้วหรือไม่ และแยก process/unit ใน deploy จริงได้หรือไม่ ถ้าไม่ได้ ผู้มีอำนาจต้องตัดสินยอมรับ residual เป็นลายลักษณ์อักษร |
| SEC001-003 | เหตุผลของ arch มีช่อง: JWS+hash ไม่อิสระจากเส้นทาง publish เพราะ DES-007:37 ให้ trusted release signer ลงนาม manifest_input ที่ผู้ดูแลส่ง (url+sha256) ผู้ถือ release_publisher หรือ API ที่ถูกยึดจึงได้ manifest ลงนามถูกต้องของ artifact ใดก็ได้ และ DES-007:33 ขัดกับ :37 ว่าใครลงนาม ตัวตรวจที่อิสระจริงคือ OS publisher signature (DES-007:48) แต่สัญญายังไม่ระบุว่า host ต้อง pin ตัวตนผู้เผยแพร่ ลายเซ็นที่ถูกต้องของใครก็ได้ไม่พอ ถ้าครบ MUST-1..4 ผมลด four-eyes จาก must เป็น optional และ release_publisher รายบุคคล+audit+evidence_ref เป็น baseline พอ (four-eyes ที่มีความหมายอยู่ที่ CI protected environment ไม่ใช่ที่ API) decisions-025 H6 ครอบเฉพาะหลักสูตร/คลังข้อสอบ ถ้าจะขยายต้อง gate 1 นี่เป็นการปรับเงื่อนไขปิด ไม่ใช่การปิด คง Important/OPEN | product owner (gate 1) ยืนยันว่าคงสัญญา 'release_publisher คนเดียว' หรือขยาย H6 ให้ครอบ release และระบุผู้ถือสิทธิ์ signing ของ OS cert |
| SEC001-006 | entitlement: รับเป็น baseline ได้ ถ้า API ถูกยึดจะออก lease ปลอมอายุ ≤3 วันให้ device key ของผู้โจมตีได้ (กระทบสิทธิ์ใช้งาน ไม่ใช่ PII หรือโค้ดบนเครื่องนักเรียน) ครบ MUST แล้วส่วนนี้อาจต่ำกว่า Important หลัง re-audit แต่ห้ามเป็นไฟล์ key บน host/process ของ API และ signer ต้องบังคับ exp cap เอง release: CI protected env + required reviewer = dual control ในทางปฏิบัติ และเป็นแบบที่แนะนำ hardware token ที่คนเดียวถือ รับเป็น baseline ได้เฉพาะเมื่อ SEC001-003 MUST-1/2 ครบ เพราะคนเดียวยังเซ็น artifact อันตรายได้ (insider) ให้คนตัดสินว่ารับหรือไม่ jpo ไม่รับแทน HSM/dual control เป็น optional ส่วน release key คง Important จน custody ถูกระบุและ re-audit | เจ้าของ release/infra เลือก: KMS/signer ที่องค์กรมี, CI protected env หรือ token, ผู้ถือ root/token (ตอบเป็นสถานะ ไม่ส่งค่า) |
| SEC001-009 | ถ้า implement แล้ว re-audit ผ่านจะแก้ได้ เพราะไม่มี secret ใน idempotency แต่ไม่จำเป็นต้องเปลี่ยนสัญญา วิธีเรียบง่ายกว่าที่รักษา DES-002:51: กำหนดหน้าต่าง replay เฉพาะ operation create-license ให้สั้น (ข้อเสนอ ≤15 นาที) แทน 24 ชม. ทั่วไป (data-contract-rules:41) ใช้ envelope ผ่าน ResultKeyId ที่มีแล้ว ลบ ciphertext เมื่อหมด ReplayUntil และตรวจตอนอ่านด้วย หลังหน้าต่างให้ได้ IDEMPOTENCY_EXPIRED+resource_id แล้ว admin rotate DDL ร่าง db/schoolbot_db.sql:142-167 มี ResultCipher/ResultKeyId/ReplayUntil อยู่แล้วและไม่มี CHECK จำกัด ReplayUntil จึงไม่น่าต้องเปลี่ยน schema (vault ยืนยัน) ไม่เป็น breaking เพราะเข้มกว่าเดิมและ DES-002 ยัง PROPOSED หน้าต่างสั้นจำเป็นจริง เพราะ 24 ชม. คือเก็บ key ใช้งานได้นานเกินเหตุ (retry จริงเกิดในวินาที–นาที) เงื่อนไข 'ลบหลังอ่านครั้งแรก' ในข้อเสนอเดิมของผมเข้มเกินสัญญา เพราะถ้า response แรกหาย retry จะไม่ได้ key ให้ใช้ TTL + จำกัดจำนวน replay แทน คง Medium | ไม่ต้องให้คนตัดสินด้านความปลอดภัยถ้าใช้แบบ tightening ให้ arch/SA-001 ระบุ TTL ใน DES-002/data-contract-rules ให้ชัด เจ้าของ schema/API ตัดสิน (gate 2) เฉพาะเมื่อจะเลือกทาง A |
| SEC001-001 | ไม่ขัด fix ข้อ 1-6 ไม่ได้กำหนด MenuPermission และ endpoint นี้เป็น introspection ของ token ตัวเอง ไม่ได้เข้าข้อมูลตามเมนู MenuPermission ผูก TMenuPermission/Master DB และ fail closed (MenuPermission.cs:14-19) เห็นด้วยกับ arch แต่ policy ต้องไม่หลวม SmartScheme ส่ง Bearer ก่อน JabjaiWebKey (ApiServiceExtensions.cs:79-109) ถ้าใช้ default scheme/RequireAuthenticatedUser เฉยๆ Bearer ปกติ (Jwt:Secret) จะผ่านได้ handler ใช้ FirstOrDefault ของ JabjaiWebKey-* (JabjaiWebLegacyAuthHandler.cs:27-28) และ validator ไม่ปฏิเสธ purpose/aud จึงต้องปฏิเสธที่ endpoint/policy เอง ข้อเสนอ 'JabjaiWebKey-* มากกว่า 1 header → 401' ยืนยันเป็น optional ไม่ใช่ gate เพราะ claims ที่ตรวจแล้วเป็นแหล่งตัวตนเดียว (DES-012 §3 ข้อ 2) | เจ้าของ G ยืนยันแหล่ง is_admin/user_id (TR-AUTH-02/03) และสถานะ secret ถ้าเจ้าของ G ยืนยันว่าต้องใช้ MenuPermission ให้เป็น NEEDS_DESIGN_CHANGE DES-012 |

- 2026-10-23 — appendตามjpoใบงาน025; Important6ยังOPEN, SEC001-009คงMedium; ไม่มีrisk acceptanceใหม่

## Logoutsubset — SEC040-001

2026-10-24: [jpo040](planning/logout-security-response-001.json) พบMediumเรื่องpubliclogoutทำDBworkไม่bounded; [fix042](planning/logout-limiting-response-001.json) และ [jpo043](planning/logout-security-response-002.json) ระบุstaticREMEDIATED. checkยืนยันruntimecriteriaครบตามconditionalclose จึงCLOSEDเฉพาะlocalperprocessscope. หลักฐาน [QAround001](qa/round-001.md) และ [check](planning/auth-flow-check-response-002.json). ไม่re-audit/ปิดImportant6เดิมและsecuritygatesทั้งระบบ

- 2026-10-24 — นายช่างบันทึกdispositionจากjpo+check; ไม่มีriskacceptanceใหม่
