# ServiceSchoolBot — runtime, database, Desktop และ deployment

> Rev 2 · แก้ล่าสุด 2026-11-05 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดใน sb-web-school-robot)

พาธในเอกสารนี้อิง `target/sb-web-school-robot` ที่ commit `d8f27d3` Backend ใช้ [backend/ServiceSchoolBot.slnx](../../../../target/sb-web-school-robot/backend/ServiceSchoolBot.slnx) โค้ดอยู่ใน `backend/src/ServiceSchoolBot.{API,Application,Domain,Infrastructure}` ชุดทดสอบและเครื่องมือตรวจ repository/database อยู่ใต้ `backend/tests/` และ `backend/tools/` ส่วน Desktop อยู่ใต้ `app/` ดู [ขอบเขตโมดูล](modules.md) สำหรับการเชื่อมแต่ละส่วน

## Database และ storage

AddInfrastructureServices ลงทะเบียน scoped SchoolBotUnitOfWork/ISchoolBotRepositoryScope และ Project/License/WebSession/Curriculum/Import/Assessment/Idempotency repositories จาก unit เดียว ใช้ scaffold SchoolBotDbContext; MasterAccount/SchoolProfile/Logs/Grade รับ scaffold contexts ของ Master/School/Logs/PGGrade ตามฐานจริง Services/resolvers ที่ใช้ contexts เป็น scoped ใช้ PostgreSQL transaction/locking/ETag/audit/idempotency ไม่ fallback memory เมื่อฐานล้มเหลว

SchoolBot:Storage=Memory ใช้ได้เฉพาะ Development; explicit memory repositories อยู่ Repositories/Storage/Memory และทดสอบ opt-in แยกจาก database repositories File backing/snapshot เป็นของ development/test ไม่ใช่ production database อย่างไรก็ดี AddManagementStore ยังลงทะเบียน InMemoryManagementStore; replay/nonce และ release metadata บางส่วนยัง process-local, signer ยัง PoC จึงไม่อ้าง production/multi-instance readiness

หลักฐาน isolated PostgreSQL repository/DI/model checks อยู่ในใบงาน100 (memory) ใน checkout ปัจจุบัน `CurriculumImportRepository.ImportCurriculumLessonsAsync` ฝั่ง PostgreSQL โยน `DomainRuleException` รหัส `STATE_CONFLICT` โดยระบุว่าต้องมี `SchoolBotLesson.ImportSource` และ refresh scaffold สถานะคอลัมน์ในฐานที่ deploy ต้องตรวจแยกจากโค้ด

## Desktop licensing

โค้ด Host สร้าง device key/proof และ canonical body, ตรวจ signed ES256 entitlement, binding/JKT/expiry, trusted clock/generation และใช้ entitlement gate ก่อนเรียก engine; Windows ProtectedStore ใช้ DPAPI ส่วน macOS ใช้ Keychain ผ่าน security command ไม่ใช่ plaintext portable cache มีการตรวจ response identity/checked_at/expires_at กับ claims และล้าง/ปฏิเสธ cache ตาม online denial

ลำดับ URL ที่ `NewDesktopService` อ่านคือ `SCHOOL_BOT_API_URL` → `ARM_API_URL` → environment ที่แอปบันทึก → `defaultAPIURL` สคริปต์ build ใช้ `SCHOOL_BOT_BUILD_API_URL` สำหรับฝัง URL ใน binary ดู [desktopservice.go](../../../../target/sb-web-school-robot/app/desktopservice.go) และ [build.ps1](../../../../target/sb-web-school-robot/scripts/desktop/build.ps1) ผล compile ของ HostServer ในใบงาน101 เป็นผลของ checkout ก่อนหน้า

## เว็บครูและ Admin

| ส่วน | การตั้งค่าที่อ่านจากโค้ด |
|---|---|
| เว็บครู | `SITE_USERNAME`, `SITE_PASSWORD` และ `SESSION_SECRET` ใช้สร้าง session `sb_auth` หน้า `/management` ใช้ `NEXT_PUBLIC_SCHOOL_BOT_API_URL` ค่าเริ่มต้น `/api/service-school-bot` |
| Admin | `/admin/login` ใช้ `ADMIN_USERNAME`, `ADMIN_PASSWORD` และ `SESSION_SECRET` ออก session `sb_admin_auth` โดยอ่าน `SCHOOL_BOT_STAFF_ADMIN_ID2` และ `SCHOOL_BOT_STAFF_USER_ID` สำหรับตัวตนที่ส่งไป Gateway |
| Admin BFF | อ่าน `SCHOOL_BOT_GATEWAY_ORIGIN` และลงนาม staff assertion ด้วย key ที่โหลดจาก `SCHOOL_BOT_STAFF_SIGNING_KEY_PEM` หรือ `SCHOOL_BOT_STAFF_SIGNING_KEY_FILE` |

ตรวจจาก [auth.ts](../../../../target/sb-web-school-robot/frontend/lib/auth.ts), [auth-admin.ts](../../../../target/sb-web-school-robot/frontend/lib/auth-admin.ts), [learning-api.ts](../../../../target/sb-web-school-robot/frontend/lib/api/learning-api.ts), [Admin BFF](../../../../target/sb-web-school-robot/frontend/app/api/service-school-bot/admin/%5B...path%5D/route.ts) และ [staff-signing-key.ts](../../../../target/sb-web-school-robot/frontend/lib/server/staff-signing-key.ts)

## Endpoints และ deployment ที่ยังรอ

หากไม่มี urls/HTTP_PORTS/HTTPS_PORTS/Kestrel:Endpoints ที่กำหนดเอง SchoolBot bind loopback HTTP/2 h2c 8080 และ HTTP/1 8081; map gRPC ทั้งห้าบริการกับ `/healthz` health คืน status ok/service/poc/storage เป็น liveness ไม่ตรวจ readiness ของ DB/trust/signing และยังไม่ใช่ gRPC health protocol

บริการที่ลงทะเบียนคือ `ProjectService`, `LicenseService`, `CurriculumService`, `AssessmentService` และ `ReleaseService` ดู [Protobuf contracts](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Protos/ServiceSchoolBot/) สำหรับชื่อ RPC และ payload เช่น `ReleaseService.CheckUpdate` รับ version, channel และ platform ส่วน `CurriculumService` ใช้ `GetPublishedCurriculum`, `GetAdminCurriculum`, `ImportCurriculum` และ `PublishCurriculum` ตามประเภทงาน

การตรวจรอบนี้ครอบคลุมฝั่ง SchoolBot [SchoolBotGrpcRegistration.cs](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.API/SchoolBotGrpcRegistration.cs) ลงทะเบียน `DenyAllGatewayPeerVerifier` เป็นค่าเริ่มต้น ส่วนการลงทะเบียนฝั่ง Gateway, trusted transport และสถานะ H5/G-AUTH ต้องอ้างหลักฐานจาก integration และ deployment ตามสภาพแวดล้อม

ค่าการเชื่อมฐานข้อมูลอ่านจาก [DatabaseConnectionConfig.cs](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Configuration/DatabaseConnectionConfig.cs) โดยให้ `SCHOOL_BOT_DB_CONNECTION_STRING`, `MASTER_DB_CONNECTION_STRING`, `SCHOOL_DB_CONNECTION_STRING`, `LOGS_DB_CONNECTION_STRING` และ `PGGRADE_DB_CONNECTION_STRING` จาก environment มาก่อนค่า `ConnectionStrings:*` ที่ตรงกัน `SCHOOL_BOT_REPLAY_KEY` ใช้กับข้อมูล idempotency ฝั่ง persistence ตาม [ตัวอย่าง environment](../../../../target/sb-web-school-robot/backend/.env.example)

## Scripts และ artifacts

scripts จัดหมวด api, desktop, engines, installer, assets, checks, lib และ tests; root มี verify.ps1/package-source.ps1 ตัวอย่างจาก scripts/README.md:

| งาน | คำสั่งจาก repo root |
|---|---|
| เปิด API | ./scripts/api/run.ps1 หรือ bash scripts/api/run.sh |
| scaffold metadata | ./scripts/api/scaffold-databases.ps1 -Database Master |
| build/run Desktop | ./scripts/desktop/build.ps1; ./scripts/desktop/run.ps1 -SkipBuild |
| package | ./scripts/desktop/package.ps1 หรือ bash scripts/desktop/package.sh |
| engine | ./scripts/engines/build.ps1 -Engine zide -Test |
| notices | node scripts/checks/third-party-notices.mjs |
| ตรวจรวม / source pack | ./scripts/verify.ps1 / ./scripts/package-source.ps1 |

verify/package ไม่ได้ถูกรันในงานเอกสารนี้ installer/test-installation.ps1 ติดตั้ง/ซ่อม/ถอน MSI จริงต้องใช้เครื่องที่อนุญาต .gitignore และ source-package filter ตัด scratch/reports/editor/cache/bin/obj/TestResults/แพ็กเกจ/signing material แต่คง .env.example/source/manifests/lockfiles ไฟล์ที่ track อยู่เดิมยัง track แม้เพิ่ม ignore แล้ว ใบงาน102 ลบ orphan runner และ scratch 4 ไฟล์ ไม่ลบ maintained scripts ที่มีผู้เรียก

## หลักฐาน

- ตรวจ [Program.cs](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.API/Program.cs), [InfrastructureServiceExtensions.cs](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Extensions/InfrastructureServiceExtensions.cs), [CurriculumImportRepository.cs](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Repositories/Databases/CurriculumImportRepository.cs), [app/internal/license](../../../../target/sb-web-school-robot/app/internal/license/) และ [scripts/README.md](../../../../target/sb-web-school-robot/scripts/README.md) ที่ `d8f27d3`
- หลักฐานก่อนย้าย repository อ้าง `35c62bf` และใบงาน100–105 (memory) ดู [หลักฐานทดสอบ](gateway-integration-evidence.md)
