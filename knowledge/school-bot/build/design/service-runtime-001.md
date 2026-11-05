# ServiceSchoolBot — runtime, database, Desktop และ deployment

> Rev 1 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

Backend ใช้ `web/ServiceSchoolBot.slnx`; src มี ServiceSchoolBot.API, .Application, .Domain, .Infrastructure; tests/tools ใช้ ServiceSchoolBot.Tests, .RepositorySelfCheck, .DatabaseSelfCheck ฝั่ง app ใช้ SchoolBot เช่น SchoolBot.Installer, SchoolBot.Setup และ SchoolBot.msi; references จาก app ไป backend คง ServiceSchoolBot ตามโปรเจกต์จริง โฟลเดอร์ชื่อเก่าถูกลบแล้ว ไม่เปลี่ยน generated proto namespace

## Database และ storage

AddInfrastructureServices ลงทะเบียน scoped SchoolBotUnitOfWork/ISchoolBotRepositoryScope และ Project/License/WebSession/Curriculum/Import/Assessment/Idempotency repositories จาก unit เดียว ใช้ scaffold SchoolBotDbContext; MasterAccount/SchoolProfile/Logs/Grade รับ scaffold contexts ของ Master/School/Logs/PGGrade ตามฐานจริง Services/resolvers ที่ใช้ contexts เป็น scoped ใช้ PostgreSQL transaction/locking/ETag/audit/idempotency ไม่ fallback memory เมื่อฐานล้มเหลว

SchoolBot:Storage=Memory ใช้ได้เฉพาะ Development; explicit memory repositories อยู่ Repositories/Storage/Memory และทดสอบ opt-in แยกจาก database repositories File backing/snapshot เป็นของ development/test ไม่ใช่ production database อย่างไรก็ดี AddManagementStore ยังลงทะเบียน InMemoryManagementStore; replay/nonce และ release metadata บางส่วนยัง process-local, signer ยัง PoC จึงไม่อ้าง production/multi-instance readiness

มี isolated PostgreSQL repository/DI/model checks ตามใบงาน100 (memory) แต่ไม่ใช่ business writes กับฐานร่วม ImportCurriculumLessons ยังปฏิเสธ STATE_CONFLICT เพราะ live scaffold ไม่มี SchoolBotLesson.ImportSource ต้องรัน migration-002 โดยผู้มีอำนาจและ refresh scaffold; ไม่มีการรัน SQL ในงานนี้

## Desktop licensing

โค้ด Host สร้าง device key/proof และ canonical body, ตรวจ signed ES256 entitlement, binding/JKT/expiry, trusted clock/generation และใช้ entitlement gate ก่อนเรียก engine; Windows ProtectedStore ใช้ DPAPI ส่วน macOS ใช้ Keychain ผ่าน security command ไม่ใช่ plaintext portable cache มีการตรวจ response identity/checked_at/expires_at กับ claims และล้าง/ปฏิเสธ cache ตาม online denial

การมีโค้ดนี้ไม่พิสูจน์ distribution, OS runtime หรือ Gateway login ครบ HostServer test fixture ยังอ้างชนิดที่ถูกถอดก่อน rename; ไม่มีผลใหม่แทน compile failure ของใบงาน101 ดู [auth compatibility](gateway-grpc-contract-001-login.md)

## Endpoints และ deployment ที่ยังรอ

หากไม่มี urls/HTTP_PORTS/HTTPS_PORTS/Kestrel:Endpoints ที่กำหนดเอง SchoolBot bind loopback HTTP/2 h2c 8080 และ HTTP/1 8081; map gRPC ทั้งห้าบริการกับ `/healthz` health คืน status ok/service/poc/storage เป็น liveness ไม่ตรวจ readiness ของ DB/trust/signing และยังไม่ใช่ gRPC health protocol

Gateway ยังไม่มี SchoolBot module/channel registration ใน Program; transport validator ไม่ configured/untrusted และ SchoolBot default DenyAllGatewayPeerVerifier ปฏิเสธทุก peer ต้องทำ endpoint/env ownership, network isolation, TLS/mTLS/service peer verification, trusted metadata, BFF CSRF และ health/readiness ก่อนเปิด H5/G-AUTH ไม่เปิด h2c สู่ public เพียงเพราะ default local ใช้งานทดสอบได้

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

ตรวจ Git/source SchoolBot35c62bf: Program.cs, Infrastructure/Extensions/InfrastructureServiceExtensions.cs, DatabaseServiceExtensions.cs, Repositories/Databases, app/internal/license, scripts/README.md และ .gitignore; ใบงาน100–105 (memory) เป็นผลตรวจเดิม [หลักฐานทดสอบ](gateway-integration-evidence.md) ไม่ deploy หรือแจก installer ใหม่
