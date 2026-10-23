# SchoolBot — มติและหลักฐานค้าง Rev2

วันที่2026-10-23 · refs: planning/spec-review-001.md, task-011.md, task-013.md; requirement/decisions-014/015/016/019..034.md; design/des-008..012.md; db/review-005.md

## หลักฐานก่อนคิว

ยังไม่มีหลักฐานปิด gate/UX/SQL/QA/release ในรอบนี้ ทุก task (110 งาน) ยัง pending. ผู้ใช้ตอบพาธ legacy (`C:\src\sb-web-academic-dev-1`) และยืนยันว่า SchoolBot เป็น 1 service ผ่าน `sb-api-gateway` แล้ว (`planning/user-context-001.md`) — ห้ามถาม 2 เรื่องนี้ซ้ำ เช่นเดียวกับ OQ-014/016 และ Learner A. รอบนี้ได้หลักฐานโค้ด BE-001 รอบ 001/002 (`planning/legacy-auth-review-001.md`, `002.md`, `legacy-source-check-001.json`), ผลทบทวน security (`security.md`, `planning/security-disposition-001.md`, `security-mitigation-001.md`), และการปรับถ้อยคำ REQ-025/027 กับเคสทดสอบ (`planning/spec-test-gaps-review-001.md`, `test-plan/tp-001.json` Amendment001) แล้ว แต่ ณ ตอนจัดทำ queue-003 รายละเอียด gateway integration ของ arch (`task023`) ยังไม่มี output ใน knowledge (ให้อ่าน `planning/handoff-002.md` ที่ผู้คุมจะบันทึกหลังรับงาน arch เป็นสถานะรับล่าสุด) จึงห้ามถือว่า done/approved/route verified จากร่างคิวนี้ และห้ามปิด gate ใดๆ

| Gate | มติที่ยืนยันแล้ว | หลักฐานค้าง/ผู้เตรียม |
|---|---|---|
| G-CORE | 025/026 H4 แบบ; 027 placement; 028 audit; 029 DB account; 030 UpdateDate | arch SA-001/vault DBA-001/002/jpo SEC-001 รับ latest contract; มนุษย์รัน test SQL/rollback/catalog/concurrency ส่ง DBA-003 ตรวจ; ไม่อนุญาต shared migration |
| G-AUTH | 025/026 ทางC/IsAdmin/Licenseเว็บ/no-exp risk acceptance; 032 Learner A | sys BE-001 source:line+sanitized lookup/hash/encoding/profile/role/tenant fixtures ไม่เดาcredential; BE-039เตรียมH5 route/BFF/web-principal/env/network/เจ้าของrepoและstaff_adminตั้งต้นให้คนระบุจากartifactก่อนส่วนที่พึ่งพา |
| G-GUEST | 014/015 shared/export/trash30วัน/เลือกproject-history/เก็บต้นฉบับ/กันซ้ำ; 032 teacher ban | spec BA-001สรุปมติ; arch SA-001/002 storage/migration/provenance/dedup/failure contract; inspect fixtures; ไม่เปิดpolicyเดิมถามใหม่ |
| G-LEARN | 015/020..025/032..034 เนื้อหาทีมร่าง/scopeครู/Level/สูตร/ข้อสอบ/ซ่อม | spec BA-002/005/006 inventory/criteria/rubricทั้งสามโหมด+คู่ผ่านไม่ผ่าน+หลักฐานผู้อนุมัติ revision ให้ผู้ใช้หรือผู้ที่ระบุพิจารณา; ยังไม่มีsigned inventory |
| G-HW | 016ผู้ใช้ตรวจภาพรวม; 019 OS | spec BA-003+arch SA-003เสนอรุ่น/firmware/calibration/stop/disconnect/platform/testcasesให้คนกำหนดเกณฑ์และอนุญาตก่อนสั่งหุ่น |
| G-DELIVERY | 016ผู้ตรวจภาพรวม; 019 Windows11 25H2 x64/macOS15+Intel/ARM | spec BA-004เสนอเครื่อง/signing/network/performance/วิธีวัด/ช่องทางแจก/installer casesให้คนตรวจ ไม่ถามOSซ้ำ; 300MB/5s/30FPSยังไม่ใช่SLA |
| G-UX-ENTRY/PROJECT/LABS/LEARN | 016ผู้ใช้เป็นผู้อนุมัติ UX; 022/023/031ที่อยู่หน้าจอ | int UX-001..004ยังไม่มีsignedartifact; UX-005admin,006mapping/export,007exams/policy/promotionเพิ่มartifactในscopeเดิม; sign-offแยกconsumerก่อนfront ไม่รวมถามpermissionก่อนมีartifact |
| G-PROJECT-DB | Guest policyตอบแล้ว | arch/vaultตรวจ project SQL/ownership/copy migration; test SQL/rollback/catalogจากคนก่อน BE-008 |
| G-LEARN-DB | 025/026แบบ; 032ไม่เพิ่มLearnerKind; 033/034สูตร | SA-002/DBA-005 latest32ตาราง; singleFKต้องapp tenant/recheck; UpdateDate opaque ETag; ไม่มีTeacherGrantใหม่; runtimeSQL/rollback/catalogยังค้าง |
| G-RELEASE-DB | 027..030ที่ตั้ง/บัญชี/audit/concurrency | SA-001 DES-007/REQ-030 dispositionยังต้องtraceก่อนfreezeupdate; DBA-006 SQL/rollback/runtime; jpo custody/trust |
| G-ROBOT-CONTRACT | ไม่เท่ากับอนุญาตmotion | SA-003 payload/bounds/matching/timeout/cancel/drain-stop/compatibility artifact และคนreview |
| G-SEC | 025ยอมรับเฉพาะno-exp token | SEC-002บนRCจริง; Critical/Importantทุกข้อแก้+retestหรือคนรับเป็นลายลักษณ์อักษร ไม่ขยายriskacceptanceเดิม |
| G-QA | OQclosedไม่เท่ากับACผ่าน | QA-001..016/check ตามTP-001/003ครบ180AC แยกlogic/UI/SQLruntime/hardware/signedinstaller/RC hashes; Critical/ตกครั้ง3ส่งคน |
| G-RELEASE | ไม่มีคำสั่งdeployในrunนี้ | gm PM-001รวมrunbook/RC/env/backup/rollback/ผู้รัน/ผู้ตรวจรับ หลังG-SEC/G-QAคนอนุมัติเจาะจง; PM-002เก็บreceiptsหลังเกิดจริง |

## DES-009 — preconditions ย่อย ไม่เพิ่ม 17 gate IDs

SA-004/TP-003/DBA-007เตรียม artifact ได้ทันทีเมื่อ dependenciesพร้อม; BE-035 mapping/BE-036 preview ไม่เขียนเกรด. BE-037/038 และ QA-015/016 ต้องมีหลักฐานครบก่อน grade write:
- G-PARITY: fixturesกฎเดิม/derived totals/เกรดเทียบ100%; mockไม่ปิดเงื่อนไข
- G-COEXIST: writer race/xmin CAS/lock/recheck ไม่อ้าง writerเดิมร่วมlockโดยไม่มีproof
- G-TARGET: ScoreData JSON/identifier/detail row exactจากsanitizedfixtures ไม่เดาordinal/สร้างPgtassessment
- G-AUTHZ: ครู/วิชา/ห้อง/เทอม/ล็อก/SubmitPeriod/overrideตรวจฝั่งserverและrecheckก่อนcommit/write
- G-DB: คนระบุบัญชีDBเดิม/เจ้าของเกรดยอมให้ใช้/ผลtestว่าwriteกับINSERT durable receipt PgtgradeAuditLogได้ ไม่GRANT/เปลี่ยนschemaPGGradeDB

## Scope งานที่ต้องคง

BE-024 trash/export; BE-025 explicit importกันซ้ำ; BE-026 local history/regrade/Arm pending/teacher ban. BE-027 central revision/four-eyes;028 Sheetทุกแถวdraft Dเป็นป้าย/Oไม่ใช้/P–Xสื่อLessonเดิม;029CourseRun Level/Activity;030bank revision;031attempt snapshots/time/random;032ครูoverrideเฉพาะเวลา/ช่วงเปิดปิดและซ่อมรายคนสูงสุดไม่มีเพดาน.
BE-033 weightsรวม100%, Quizไม่นับ0, freezeตอนเริ่มrun เปลี่ยนรอบใหม่ (79→81ตัวอย่างทดสอบ ไม่ใช่default);034เลื่อนทั้งห้องสิ้นเทอม rosterทุกคนmissing0 เฉลี่ยต้องสูงกว่าเกณฑ์ ครูยืนยันเทอมหน้า.
BE-035หนึ่งsource100%ต่อช่อง,activityหลายช่องข้ามวิชา,ช่องเดิม/กันซ้ำข้ามชุด,immutableหลังส่งรวมretire/soft-delete/partial/pendingตามcontractล่าสุด;036earned/max*targetMax decimal half-up/missing skipคงเดิมแยกจริง0;037ชนต้องresolve/previewใหม่/CAS/owned-only merge/teacher overrideและผลพิเศษคงเดิม/receipt transactionเดียว;038outbox/replay/crash/partial/recheck/authz/auditสองฝั่ง.

## Change Log
- 2026-10-23 — Rev2: แยก approved decisions กับ evidence; ไม่ปิด gate ไม่เปลี่ยนstatus
- 2026-10-23 — บันทึกสถานะหลักฐานจาก task017..026 และ user-context-001; ย้ำห้ามถามพาธ legacy และรูปแบบ service ผ่าน gateway ซ้ำ และระบุสถานะ task023 ณ ตอนจัดทำ queue-003 โดยให้อ้างอิงสถานะรับล่าสุดจาก planning/handoff-002.md ที่ผู้คุมบันทึก โดยไม่ปิด gate
