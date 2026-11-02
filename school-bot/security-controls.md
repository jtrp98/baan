# ขอบเขตและ controls ที่ตรวจ

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

IPC คือ Inter-Process Communication; CSP คือ Content Security Policy.

เป็น static review วันที่ 2026-10-23 ไม่ใช่ข้อยืนยัน source วันนี้ ไม่มี runtime penetration test, request/login จริง หรือ network probe.

HTTP API Gateway คือ sb-api-gateway; SchoolBot gRPC service คือบริการ SchoolBot ภายใน. BFF คือ Backend for Frontend; JWT คือ JSON Web Token; PII คือข้อมูลที่ระบุตัวบุคคลได้; TTL คือ Time to Live หรือเวลาที่อนุญาตให้เก็บหรือใช้ข้อมูล.

## ขอบเขตเดิม

- knowledge: index ทั้งสี่หมวด, งาน [SEC-001 (Trust review)](plan/index.md), [DES-001 (Desktop host และ IPC)](design/des-001.md), [DES-002 (License และ device binding)](design/des-002.md), [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](design/des-004.md), [DES-007 (Release และ trusted update)](design/des-007.md), [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](design/des-012.md), [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](design/des-009.md) (เฉพาะส่วน auth/channel/grade write), [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](requirement/decisions-025.md), [มติ 029 (ไม่รัน GRANT กับฐานข้อมูลเดิม)](requirement/decisions-029.md); เอกสารเงื่อนไขและหลักฐานเดิมระบุท้ายไฟล์
- code: web/src/SchoolBot.Api/Program.cs และ ApiErrors.cs, SchoolBot.Application/ManagementService.cs, SchoolBot.Domain (SchoolLicense, DesktopRelease), InMemoryManagementStore.cs
- code: app/desktopservice.go, desktopstorage.go, main.go, internal/engine/manager.go และ environment.go, frontend core/client.ts, index.html (CSP), teacher menu
- code: scripts/build-desktop.ps1/.sh, package-desktop.sh, docs/DEPLOYMENT.md และ API.md
- code: sb-api-gateway เฉพาะ JabjaiWebLegacyAuthHandler.cs และ JwtTokenService.cs (GetWebSessionPrincipal), grep หา web-principal
- manifests: SchoolBot.Api.csproj, Directory.Build.props, global.json, SchoolBot.Tests.csproj, app/go.mod, frontend package.json และ package-lock.json (เวอร์ชันและ license), engines/zide/THIRD-PARTY-NOTICES.md
- ไม่ได้เปิด: ค่า secret/env/credential, sb-tech-upgrade-web-system, C++ engine source, ไม่ได้รัน build/test/audit tool

## ผลตรวจ controls

ผลต่อไปนี้เป็น static observations วันที่ 2026-10-23 ไม่ใช่การยืนยัน source วันนี้. ขณะนั้น API ใช้ memory store ไม่มี identity/entitlement/update-install จริง และ install_supported=false. ช่องว่างส่วนใหญ่เป็นงานตามแผนที่ยังไม่ implement; actual defect เดิมมี [SEC001-007 (/v1/admin ใช้ static bearer เดียวร่วมกัน ไม่มี throttle, ไม่มี identity รายบุคคล, ไม่มี audit; มี fallback ชื่อ env เดิมและ /healthz เปิดเผยสถานะ PoC)](security-findings-05.md), [SEC001-008 (build Desktop ไม่บังคับ API URL production จึงอาจแจก binary ที่ฝัง http://localhost:8080)](security-findings-06.md), [SEC001-013 (gateway handler log ชื่อ header ของ JabjaiWebKey ระดับ Information ทุก request ซึ่งตามที่ อ้างมติที่เกี่ยวข้อง บันทึกอาจมีรหัสโรงเรียนและผู้ใช้)](security-findings-09.md), [SEC001-014 (เมนูครูบน Desktop ใช้ PIN ฝั่ง client ที่เป็นค่าคงที่ใน bundle เป็นเครื่องหมาย 'ต้องใช้ PIN')](security-findings-09.md) และ [SEC001-015 (provenance ของ HIDAPI ที่แก้ไขในเครื่อง และ nlohmann/json ไม่มี commit/hash ต้นทางเพื่อเทียบกับ upstream)](security-findings-10.md) ซึ่งผลกระทบจำกัด.

ผลแยกเป็น [API, auth, logs และ dependency](security-controls-api.md) และ [Desktop, engine และ update](security-controls-desktop.md).

## ยังไม่ยืนยัน

ไม่มี runtime pentest ในการตรวจแรก ไม่ได้สแกนทั้ง repo/binary หรือเปิดข้อมูลลับ. ข้อที่ยังไม่ยืนยันทั้งหมดอยู่ใน [เส้นทางข้อมูลและ compliance](security-data-flows.md).

## หลักฐาน

- planning/task-019.md; plan/SEC-001.md; plan/tasks-001.json แถว SEC-001 (memory)
- planning/security-response-001.json (reports)
- gates-001 และ evidence-002 เป็นเอกสารที่การตรวจเดิมอ้าง; งานเรียบเรียงนี้ไม่ได้เปิดเพิ่ม
