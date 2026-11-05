# controls ของ API, auth, logs และ dependency

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

SDK คือ Software Development Kit.

CVE คือรหัสอ้างอิงช่องโหว่ที่ทราบแล้ว; PII คือข้อมูลที่ระบุตัวบุคคลได้.

ผลต่อไปนี้คงข้อสังเกต static วันที่ 2026-10-23; [ขอบเขตที่ตรวจ](security-controls.md).

| การตรวจ | ผล |
|---|---|
| Auth/authz ของ endpoint ที่เปิดอยู่ใน API | /v1/licenses/* และ /v1/updates/check เป็น public โดยออกแบบ (ไม่มี tenant หรือ user data) ส่วน /v1/admin/* ใช้ static bearer เทียบแบบ constant-time (SHA256+FixedTimeEquals) และ fail-closed 503 เมื่อไม่ตั้ง key ≥32 ตัว ไม่มี throttle หรือ audit ของ admin ดู [SEC001-007 (admin bearer)](security-findings-05.md) |
| License key custody และ replay ใน API ปัจจุบัน | key สุ่ม 256 บิตและเก็บเฉพาะ SHA-256 (เหมาะกับ entropy ระดับนี้) แสดงครั้งเดียวพร้อม Cache-Control: no-store ทั้ง API. ไม่มี nonce, challenge หรือ signed lease เลย activate/validate ตอบ JSON ไม่ลงนาม จึงไม่มีกลไก replay ให้ตรวจ ดู [SEC001-004 (host entitlement)](security-findings-04.md) และ [SEC001-005 (device binding)](security-findings-04.md) |
| เส้น gateway/web-principal | grep ไม่พบ endpoint web-principal หรือโค้ด SchoolBot ใน sb-api-gateway/src จึงเป็น planned gap. validator เดิมที่ web-principal จะต้องพึ่งไม่บังคับ exp/iss/aud และ handler ไม่ปฏิเสธ purpose=legacy-handoff ดู [SEC001-001 (web-principal และชนิด token)](security-findings-01.md) |
| Logs และ PII ในโค้ด school-bot | API log เฉพาะคำเตือนตอนเริ่ม ไม่ log body, key หรือ device_id; error body เป็นข้อความคงที่; client IP ใช้เป็น key ของ rate limiter ใน memory เท่านั้น. ที่ gateway handler log ชื่อ header ซึ่งอาจมีรหัสโรงเรียนและผู้ใช้ดู [SEC001-013 (log header)](security-findings-09.md). /healthz เปิดเผยว่าเป็น poc และ storage=memory (Minor) |
| Secrets ใน repo และ release payload | ไม่พบ secret literal ในไฟล์ที่ตรวจ (ตรวจเฉพาะรูปแบบการอ้างชื่อ env ไม่เปิดค่า). admin key อ่านจาก env เท่านั้น และ URL ฝังเป็น public address ตามที่ระบุ. ไม่ได้สแกนทั้ง repo และ binary |
| Dependency manifests | โปรเจกต์ .NET ที่ใช้งานจริงไม่มี PackageReference จากภายนอก (เป็น framework net10.0 + SDK 10.0.100 rollForward latestFeature), test project ใช้ xunit/coverlet. Desktop ใช้ wails/v3 v3.0.0-beta.30 (pre-release) และ x/sys v0.46.0. Frontend ใช้ react 19.3.1, blockly 13.4.0, phaser 4.2.1, vite 8.3.4, typescript 7.0.2 พร้อม lock file. ไม่ได้ตรวจ CVE ของรายการเหล่านี้ (เครื่องมือถูกปฏิเสธ) |
| License ของ dependency | package-lock ระบุ MIT, Apache-2.0, OFL-1.1 (fonts) และ MPL-2.0 (กลุ่ม lightningcss; การใช้เฉพาะ build-time ยังต้องยืนยัน) ไม่พบ copyleft ที่ขัดกับการแจก desktop แบบปิด. C++ ใช้ HIDAPI (เลือก BSD) และ nlohmann MIT พร้อม notice. ไม่ได้รัน check-notices และไม่ได้ตรวจ license ของ Go modules ทั้งหมด. ดู [SEC001-015 (provenance)](security-findings-10.md) เรื่อง provenance |
| Design ของ grade-write และ session ([DES-009 (Preview ยืนยัน และส่งคะแนน)](design/des-009.md), [DES-012 (Auth ข้ามระบบ)](design/des-012.md), [DES-004 (ตัวตนและสิทธิ์ SchoolBot)](design/des-004.md)) | ตรวจเฉพาะระดับเอกสาร ไม่ใช่หลักฐานว่า implement แล้ว. ทิศทางดี: preview ผูก snapshot hash, re-check สิทธิ์ก่อน confirm และตอน apply, idempotency, receipt ใน PgtgradeAuditLog, token เก็บเป็น SHA-256, password ไม่เก็บ. ข้อกังวลอยู่ที่ [SEC001-002 (บัญชี DB กว้าง)](security-findings-02.md), [SEC001-009 (replay key)](security-findings-07.md) และ [SEC001-010 (ข้อมูลนักเรียน)](security-findings-08.md) |

การตรวจ 2026-10-29 พบ API csproj มี gRPC/Protobuf PackageReference แล้ว จึงแทนข้อสังเกตไม่มี external package เฉพาะส่วนนี้; ยังไม่มี CVE/license sign-off.

## ยังไม่ยืนยัน

การใช้ lightningcss เฉพาะ build-time ยังไม่ยืนยัน ต้องตรวจ dependency graph และขั้นตอน package. ไม่ได้รัน build/test/audit tool ในการตรวจแรก; ไม่ยืนยัน runtime, CVE หรือ license ปัจจุบัน.

## หลักฐาน

- Auth/authz ของ endpoint ที่เปิดอยู่ใน API: web/src/SchoolBot.Api/Program.cs:85-118
- License key custody และ replay ใน API ปัจจุบัน: ManagementService.cs:24-31,45-67<br>Program.cs:62-65
- เส้น gateway/web-principal: sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/JwtTokenService.cs:184-197<br>JabjaiWebLegacyAuthHandler.cs:25-54<br>design/des-012.md:33-37
- Logs และ PII ในโค้ด school-bot: Program.cs:84,120<br>ApiErrors.cs:25-63<br>JabjaiWebLegacyAuthHandler.cs:33,46,51
- Secrets ใน repo และ release payload: Program.cs:98<br>app/desktopservice.go:28-29<br>docs/DEPLOYMENT.md:28
- Dependency manifests: web/src/SchoolBot.Api/SchoolBot.Api.csproj:1-6<br>web/global.json:2<br>app/go.mod:3-17<br>app/frontend/package.json:13-34<br>app/frontend/package-lock.json:1519-1536,2111,2179,2446
- License ของ dependency: app/frontend/package-lock.json:250-277,643-898,1206<br>engines/zide/THIRD-PARTY-NOTICES.md:3-37
- Design ของ grade-write/session: design/des-009.md:56-136; design/des-012.md:39-72; design/des-004.md:26,76
