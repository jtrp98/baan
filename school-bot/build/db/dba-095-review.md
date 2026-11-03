# ใบงาน 095 — ผลทบทวน learning และ release SQL

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (DBA-005/006 — ทบทวนตามมติ 054)

DBA-005 และ DBA-006 ผ่านขอบเขตเตรียม DDL/rollback: ไม่มี physical delta ไม่ต้องรัน SQL เพิ่ม คง DDL/rollback เดิมทุก byte ตาม [มติ 054 (เลขอ้างอิงไม่เกิน 1,000 ตัวอักษรและไม่ขยาย schema)](../../shared/decisions/decisions-054.md) ผล learning ฉบับเต็มอยู่ใน [DBA-005](dba-005-learning-review.md) ผลนี้ไม่ปิด runtime, trust, การเชื่อม API หรือ release และไม่เปลี่ยนสถานะในแผน

## DBA-005 — ผลทบทวน: ผ่านขอบเขตเตรียม SQL (DONE)

| Criterion | Deliverable | Expected | Actual | ข้อจำกัด |
|---|---|---|---|---|
| curriculum/Level/question/attempt/policy/mapping/outbox/promotion | [DBA-005: ตารางที่ตรวจ](dba-005-learning-review.md#ตารางที่ตรวจและข้อมูลเดิมที่ใช้) | learning 23 ตารางใน baseline 32 ตาราง | ครบ | static parity และ catalog ที่มนุษย์ส่ง; ไม่ใช่ runtime |
| SQL รวม/rollback เดิม | schoolbot_db.sql + schoolbot_db_rollback.sql | delta เท่าที่จำเป็น พร้อม rollback คู่ | ครบ: delta เป็นศูนย์, hash เดิม | ห้ามใช้ DROP rollback กับฐานปัจจุบัน |
| UpdateDate / single FK + tenant | [Physical delta](dba-095-schema-parity.md#physical-delta-และผลต่อข้อมูลเดิม) | ไม่มี Version; reference ID เดิมร่วม SchoolId | ครบ | ไม่มี SQL FK ตามมติ 044 (คงเฉพาะ Primary Key); แอปต้องตรวจ tenant/locking |
| Learner A ไม่เพิ่ม LearnerKind | learning-rules-032-034.md Rev2 | employee เก็บ Project Cloud ได้ แต่ห้าม Submission/Attempt ทุกทาง | ครบเฉพาะแบบ | ต้องพิสูจน์ authorization/import/worker |
| รับ task-012/013 ก่อน freeze | learning-design-reconciliation-001.md Rev2 | มีผลรับกฎและเทียบ delta | ครบ | อ่านต้นฉบับ task และ review-006 (memory) แล้ว; counts รุ่นเก่าใช้แทน Rev7 ไม่ได้ |
| export runtime pack แยก DBA-007 | DBA-005: การปิดช่องว่างแบบและสิ่งที่ส่งต่อ | ไม่ขยายงานนี้ไปทดสอบเขียนเกรด | ครบ | receipt/lease/fencing/reconcile และ legacy writer ยังรอ DBA-007 |
| version/reviewer/tenant/history/int4/audit | DBA-005: Acceptance ที่ตรึง; audit-evidence-storage-001.md Rev2 | revisions/history เดิม, PK int4 ALWAYS; audit commit ร่วม | ครบเฉพาะแบบ/SQL | runtime transaction และ four-eyes ยังไม่พิสูจน์ |

## DBA-006 — ผลทบทวน: ผ่านขอบเขตเตรียม SQL (DONE)

| Criterion | Deliverable | Expected | Actual | ข้อจำกัด |
|---|---|---|---|---|
| unique version/channel/platform | SchoolBotRelease + data-contract-rules-grades.md | serialize global/tenant ก่อนตรวจ tuple ซ้ำ | ครบเฉพาะแบบ/SQL | ไม่มี SQL UNIQUE ตามมติ 044; concurrency ยังไม่พิสูจน์ |
| audit | DES-007 Rev5 + audit-evidence-storage-001.md Rev2 | evidence_ref:T1000 เก็บ Reason ตรงตัว; domain/audit/idempotency commit ร่วม | ครบเฉพาะแบบ/SQL | ต้องทดสอบ 1000/1001 Unicode, rollback, retry และ read-back |
| placement | SQL 32 ตาราง public ใน SchoolBot DB เดิม | ไม่เพิ่ม role/GRANT หรือเขียน schema ในฐานเดิมอื่น | ครบ | catalog ที่ผู้ใช้ส่งตรง; ไม่พิสูจน์ runtime privileges |
| rollback | schoolbot_db_rollback.sql เดิม | ครบ 32 ตาราง มี lock+empty guard ไม่มี CASCADE | ครบเฉพาะ static review | DESTRUCTIVE: DROP เฉพาะ fresh empty create ที่ยังไม่เปิด writer; ไม่ใช่ migration งานนี้ |
| trust | des-007-manifest.md Rev5 + release-trust-001.md Rev3 | signed JWS, immutable CI registry, publisher pin/expiry/hash | ครบเฉพาะแบบ | cryptography/custody/pin/implementation ยังรอหลักฐาน; SQL ไม่บังคับ trust |

Publish เก็บ evidence_ref:T1000 ตรงตัวใน Reason; withdraw เก็บ reason อีกแถว อ่าน evidence เดิมด้วย Event/EntityType/EntityId/SchoolId/CreateDate=PublishedAt ไม่พบ/กำกวมคืน 409 STATE_CONFLICT; เกิน bound คืน 400 INVALID_INPUT ก่อน sign/publish ไม่ truncate/hash/split

Release ใช้ PK int4 ALWAYS; VersionText/Channel/Platform varchar(32/16/32), Manifest varchar(16384), ArtifactHash varchar(64), Lifecycle varchar(16) NOT NULL ไม่มี default; PublishedAt/WithdrawnAt timestamptz NULL, SchoolId int4 NULL ตาม [dictionary](../design/data-dictionary/table-003.md)

## DBA-003 — หลักฐานเดิมและสิ่งค้างนอกงานทบทวนนี้

ผู้ใช้ส่ง Q01–Q07 แล้ว: Q02 ชื่อ public.SchoolBotLicense/32ตาราง, Q03/Q07 common fields6และชนิด/NULL450ฟิลด์, Q04–Q06 int4 PK32/ALWAYS identity/ไม่มี UQ/FK/CHECK; Q03/Q07 ReceiptId=int8 ตรง expected ของ AC-033-01..05 ใน scoped inventory ผู้ใช้ยืนยันฐานทดสอบแล้ว ไม่ต้องรัน catalog ซ้ำเพื่อ DBA-005/006 แต่ execution receipt การสร้างฐานเดิมและ concurrency/rollback receipts ยังไม่มี DBA-003/G-CORE จึงยังไม่ปิด Catalog ไม่พิสูจน์ค่าแถว/runtime/ไฟล์ที่เคยรันหรือ table นอกชุด

[Expected](dba-003-catalog-expected.md) และ [fingerprints](dba-003-catalog-fingerprints.md) คงเดิม

## สิ่งที่รอผู้รับผิดชอบและผู้รับต่อ

DBA-005/006 ไม่มีคำถาม schema หรือ SQL เพิ่มที่ต้องรอคนในขอบเขตนี้ ส่ง check ตรวจชุดส่งมอบ และ arch แก้ [คำอธิบายเก่า](dba-095-schema-parity.md#deltas-ที่ขอ-arch-แก้ใน-canonical-documents); นายช่างบันทึก changelog นอกขอบเขต build/db

| Task / Reference | คำถาม/สิ่งค้างและเหตุผล | ผู้ตัดสิน / งานที่จะปลดล็อก |
|---|---|---|
| DBA-003 / REQ-033, G-CORE (ประตูหลักฐาน core) | มี execution receipt การสร้างฐานเดิมและ concurrency/rollback receipts หรือไม่? Catalog พิสูจน์ไฟล์ที่เคยรันหรือ atomicity ไม่ได้ | ผู้ใช้/เจ้าของ DB → check พิจารณาปิด DBA-003 |
| งาน implementation / storage Rev2, DBA-007 | พิสูจน์ boundary/read-back/atomicity/tenant/history และ receipt/recovery ตามสัญญา | ทีมพัฒนาและ check; ของจริงคง human gate เดิม |
| Release / release-trust และ custody | ใครถือ certificate และค่า pin ที่ยืนยันคืออะไร? | ผู้ใช้/เจ้าของ signing → ทดสอบ trust และเปิดส่งมอบจริง |

ส่ง jpo พิจารณา PII (ข้อมูลส่วนบุคคล): Actor/LearnerId/AssessorId/SchoolId คำตอบ/ผลเรียน/roster/อุปกรณ์ รวม masking/encryption/สิทธิ์ audit ห้ามเก็บ token/password/source นักเรียนใน Reason

## หลักฐาน

- SQL physical Rev7: schoolbot_db.sql:30–677; Release:71–88, AuditEvent.Reason:123; schoolbot_db_rollback.sql:17 เป็นต้นไป อ่านไฟล์เท่านั้น
- SHA-256 DDL: `b330135619c8d613c66234b5ed7dc6626694256edabbbfdcb6212d953474bf12`
- SHA-256 rollback: `2112a68ef54b8271ce7a368fa49a1f26b87b53ecd9695619fbec707cebc5b08b`
- DES-005 Rev10, DES-010 Rev7, DES-007 Rev5, audit-evidence-storage-001 Rev2, audit-evidence-migration-001 Rev2, learning-design-reconciliation-001 Rev2 และมติ 054 อ่านจริงวันที่ 2026-11-03; acceptance/req_ids/ac_ids จาก cards และ tasks-001.json ตรึงเดิม ac_ids ว่างตามเดิม
- task-012.md/task-013.md และ review-006.md (memory) อ่านเทียบกฎปัจจุบัน; dba-003-catalog-evidence-001.md (memory) บันทึกผลมนุษย์ Q01–Q07, Q07 diff ว่าง32/32 รวม450ฟิลด์
- ตรวจจริงด้วย PowerShell here-string `node -` อ่านไฟล์อย่างเดียว: ผ่าน6/ตก0 กลุ่ม (inventory32/450, DBML type/NULL/default/PK/identity, dictionary450, PK-only, rollback coverage+guards, SHA-256 คู่เดิม); ไม่ใช่ PostgreSQL/DBML parser หรือ runtime test
- แก้ review สามไฟล์ที่ใบงานระบุเท่านั้น ไม่เปลี่ยน SQL/rollback/catalog-check/expected/fingerprints/สถานะแผน; ไฟล์รอบก่อนคงอยู่



