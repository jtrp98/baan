# Gateway–SchoolBot — หลักฐานปัจจุบันและรายการค้าง

> Rev 6 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

อ่าน source/Git และรายงานที่มีจริงวันที่ 2026-11-04 โดยไม่ build/test ใหม่ การ commit source ไม่ใช่ผลตรวจ integration ใหม่ ไม่เปลี่ยนแผนเป็น verified และไม่ปิด production gates

## ผลที่ยืนยันจากรายงานเดิม

| ขอบเขต | ผลที่อ่านได้ | ข้อจำกัด |
|---|---|---|
| SchoolBot suite | 4397 ผ่าน / 4398, skipped0 | repository-current-test.log และ schoolbot.trx ยังล้ม idempotency คาด409ได้403 |
| Gateway SchoolBotPipelineTests | 12/12 | gateway-schoolbot.trx; in-process fixture ไม่ใช่ production host |
| JWT → Gateway → gRPC | 5/5 | e2e.trx; JWT จริง แต่ TestServer override trust, memory/file storage และ fake legacy profile/lookup |
| Gateway route/Swagger + health/warm-up | 621/623, 57 batches, aborted0/notExecuted0 | summary.json: filterเดิม608/610 + checks13/13; Swagger schema conflictเดิม2เคส |
| Proto | 6/6 bytes ตรง; normalized hashตรง metadata | ตรวจซ้ำรอบเอกสาร; ไม่ใช่ RPC runtime check |
| Database | isolated PostgreSQL repository/DI/model checks ผ่านตามใบงาน100 | ไม่เขียนฐานร่วม; live schemaยังไม่มี ImportSource |
| Installer/frontend | installer build; typecheck/build; i18n14/14 ผ่านตามใบงาน103 | ไม่ rebuild Go executable หรือแพ็ก/แจก installer ใหม่ |

e2e เดิมตรวจ project CRUD/replay/stale ETag/tenant isolation, invalid/temporary JWT, entitlement activation/validation/second-device/revocation, TAdmin four-eyes/admin_id, approval_ref เป็นตัวเลข→400 พร้อม snapshot/auditไม่เปลี่ยน, release publish/anonymous update, no-store, HTTP business เดิม404/health200 Harness ชั่วคราวถูกลบแล้วตาม handoff จึงไม่อ้างว่า rerun จาก source harness ที่ยังอยู่

## ข้อคลาดเคลื่อนและงานค้าง

1. API idempotency case ApiV2LicenseSecurityAdversarialTests.Idempotency_SamePayloadReplays_DifferentPayloadConflicts ยัง expected409 actual403 ไม่พบผลใหม่ที่ปิดเคสนี้; เปลี่ยน license key ทำให้ ledger tupleไม่ตรงและ nonceถูกใช้แล้ว
2. Gateway Swagger_IsEnabled_InDevelopment และ Swagger_TagsFollowPersonalInformationFeature ยังล้มจาก SaveJournalRequestDto ชื่อ schema ชน Accounting.Generated/GeneralAdministration.Generated ไม่ขยายแก้ข้ามโมดูล
3. Gateway Program ยังไม่ wire module/channel; Production gate และ deny-all trust ทั้งสองฝั่งคงอยู่ H5/G-AUTH ยังไม่ผ่าน ต้องมี configuration/trusted transport และ runtime proof จริง
4. Desktop มี signed entitlement/protected storage แล้ว แต่ URL/path/JWT flow ยังเก่า; HostServer fixture compile issue ยังเห็นใน source; BFF/CSRF และ Assessment authority/roster ยังไม่ยืนยัน
5. repositories ใช้ scaffold contexts แล้ว ต่างจาก knowledgeเก่าที่บอกยังไม่มี DB implementation แต่ผล isolated checksไม่พิสูจน์ shared DB integration/rollback/concurrencyทุกกรณี; ImportSource migration และ multi-instance replay/signing/release configยังค้าง
6. สัญญาเก่า opaque session/logout/package schoolbot.v2 ต่างจาก current JWT/versionless routes/package ServiceSchoolBot ต้อง reconcile DES-004/DES-012 และ acceptance ก่อนพัฒนาต่อ ผล logoutเก่าคงเป็นประวัติ ไม่รับรอง current pipelineโดยอัตโนมัติ

## Git และขอบเขตหลักฐาน

SchoolBot branch golf/zide HEAD35c62bf ไม่มี working-tree changes ตอนตรวจ: commits0d6d8b2/707d681/888b55f/35c62bf; Gateway branchdev/golf/school-bot HEADb4181ca commits2b02246/bf926ea/b4181ca รวม46ไฟล์ source/contract/test source ไม่มี sourceค้าง ตอนเริ่มตรวจพบ graphify-out5ไฟล์ modified และ tests/ApiGateway.Platform.Tests/TestResults/ untracked ตามใบงาน105 แต่การทวนท้ายงาน (รวมปิด fsmonitor ในคำสั่งอ่านสถานะ) พบ working treeสะอาด TestResultsยังอยู่และcheck-ignoreระบุว่าถูกignore; ไม่ได้แก้/ลบ/commit artifactsเหล่านี้ในงานนี้และยังยืนยันสาเหตุที่สถานะเปลี่ยนไม่ได้ งานเอกสารนี้ไม่เปลี่ยน branch/deploy/push และไม่แก้ source ใบงาน104/105บันทึกว่าไม่ได้pushในรอบนั้น; รอบนี้ไม่ได้push การทวนท้ายงานbranch trackingของGatewayแสดงเท่ากับorigin/dev/golf/school-bot จึงไม่ยืนยันสถานะไม่ได้pushทั้งrepositoryในปัจจุบันหรืออนุมานว่าใครpushเมื่อใด

## หลักฐาน

- reports/schoolbot-grpc-handoff004-verification/: schoolbot.trx, gateway-schoolbot.trx, e2e.trx, e2e.log, proto-sha256.json; gateway-batches/isolated/summary.json, results.md, coverage.json และ57TRX
- reports/repository-current-test.log (4397/1), repository-current-build.log; ใบงาน100–105และhandoff005 (memory) ไม่มีการแก้ผลย้อนหลัง
- Source baseline SchoolBot35c62bf/Gatewayb4181ca; [contract](gateway-grpc-contract-001.md), [controller](gateway-controller-entry-001.md), [runtime](service-runtime-001.md); การอ่านรายงานเก่าไม่ใช่การรัน verificationใหม่
