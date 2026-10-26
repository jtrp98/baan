# DBA-007 — cross-DB/export runtime evidence pack — Rev1

วันที่: 2026-10-24 · เตรียมโดย: vault (ใบงาน061) · ประเภท: **docs-only evidence pack** — เป็น "ชุดคำขอ/ขั้นตอนหลักฐาน" ให้มนุษย์รันบนสภาพแวดล้อมทดสอบเท่านั้น ไม่ใช่ผลรับรอง runtime ไม่ใช่การปิด gate และ vault ไม่ได้รัน SQL ใด ๆ ตามกติกา

อ้างอิง: [DBA-007](../plan/DBA-007.md) + [tasks-001.json](../plan/tasks-001.json) (AC-052-01..05, AC-033-04..05 · des_refs DES-009/DES-012) · [export-proof-pack-001 Rev2](export-proof-pack-001.md) · [des-009 Rev4](des-009.md) · [source-review-004](source-review-004.md) · [db/review-005](../db/review-005.md) · [schema-notes Rev5](schema-notes.md) · [db-safe-evidence-001](../db/db-safe-evidence-001.md)

ครอบ 5 gate: G-PARITY / G-COEXIST / G-TARGET / G-AUTHZ / G-DB — แต่เฉพาะ**ขอบเขต vault**: การจำลอง writer race/xmin CAS บน test DB, durable receipt + `PgtgradeAuditLog` จำลอง, วิธีเก็บ before/after snapshot, บัญชี DB ที่ใช้ และคำขอหลักฐานจากเจ้าของ PGGradeDB · การรับรอง parity/authorization matrix เป็นหน้าที่เจ้าของเกรด/sys ตาม SA-004 ชุดนี้ไม่แทน

## 0) กติกาบังคับทุกรายการ

1. **ผู้รันทุกขั้นตอน = มนุษย์เสมอ** (CONVENTIONS §9 ตามหลักข้อ 3 ของ [db-safe-evidence-001](../db/db-safe-evidence-001.md)) — vault เขียนขั้นตอน/ตัวอย่างได้ ห้ามรันเด็ดขาด
2. **SQL ตัวอย่างในเอกสารนี้อนุญาตให้รันเฉพาะ test-SchoolBot DB และ test PGGradeDB clone** — ห้ามชี้ production ทุกกรณี โดยเฉพาะ **PGGradeDB จริงห้ามแตะทั้งอ่านเพื่อทดสอบและเขียน** (ของจริงให้เจ้าของรันตาม §9 เท่านั้น)
3. **Synthetic fixtures เป็นหลัก** ตาม export-proof-pack-001 Rev2 — ห้ามคัดลอกข้อมูลบุคคล/คะแนนจริงมาใส่ fixture; ใช้ synthetic identifiers สอดคล้องกันตลอดชุด
4. **บัญชี DB ตาม decisions-029 — ใช้บัญชีเดิม ไม่ขอสร้างใหม่**: (ก) test-SchoolBot DB ใช้บัญชีที่ `db/schoolbot_db.sql` สร้างเอง (`schoolbot_app`) (ข) ต่อ School DB/PGGradeDB clone ด้วย**สำเนาบัญชีเดิมของระบบ** ที่เจ้าของจัดให้บน test env — **ห้าม GRANT/REVOKE/CREATE ROLE ใหม่**; ชื่อบัญชีเดิมต้องได้จาก EV-GR-06(a) และบันทึกแบบ masked
5. **Evidence hygiene ก่อนเข้า knowledge ทุก artifact** (ตาม export-proof-pack-001 Rev2): ตรวจ JSON/screenshots/receipt/logs/before-after documents ทั้งฉบับ ห้ามมี PII จริง/password/hash/token/private key/connection string; แนบผู้ตรวจ วันที่ ขอบเขต — **ถ้าพบ PII แจ้ง jpo ทันที**; ช่อง actual/evidence ต้องมาจากการรันจริง ห้ามเติม PASS จากเอกสาร
6. รูปแบบบันทึกผลทุกรายการ: gate/จุดตรวจ · expected · actual · evidence path · ผู้รัน/วันที่ — ส่งให้ role `check` ตรวจตาม acceptance ของ DBA-007
7. รหัส error ที่ต้องเห็นที่ client boundary ตาม DES-009: `WRITER_NOT_VERIFIED` / `CALCULATOR_NOT_VERIFIED` / `COEXISTENCE_NOT_VERIFIED` / `GRADE_SOURCE_UNAVAILABLE` / `RECEIPT_UNAVAILABLE` / `PREVIEW_STALE`/`412 VERSION_CONFLICT` — ก่อน gate ผ่าน confirm ตอบ 503 ตามรหัส gate ที่ค้าง

## 1) สภาพแวดล้อมและ fixtures ก่อนเริ่ม (preconditions)

- **EV-EN-01 — test-SchoolBot DB พร้อม**: มนุษย์รัน `db/schoolbot_db.sql` บน test env (ประตูมนุษย์ตาม schema-notes §สถานะที่ยังรอ) แล้ว DBA-003 ตรวจรับ · ผลที่ยอมรับ: deploy สำเร็จไม่มี error ค้าง · ห้าม: รัน DDL บน production
- **EV-EN-02 — test PGGradeDB clone พร้อม**: เจ้าของ/มนุษย์จัดสำเนา schema ของ PGGradeDB (restore จาก DDL ที่จะได้จาก EV-GR-01 หรือ pg_dump schema-only ที่เจ้าของจัดให้) พร้อม synthetic นักเรียน/หัวเกรด/`PgtgradeDetail` rows · ผลที่ยอมรับ: ตารางเป้าหมาย (Pgtgrade/PgtgradeDetail/Pgtassessment/PgtgradeAuditLog/PgtgradeEdit/PgtgradeSetting) มีครบ; ไม่มีข้อมูลจริงปน · ห้าม: dump/restore ข้อมูลจริงเข้า test env; เชื่อม test env ไปหา PGGradeDB จริง
- **EV-EN-03 — synthetic fixtures + บัญชี**: สร้าง fixtures (learners, grade slots, mappings, preview/export/outbox rows) บน test env ทั้งสอง DB; บัญชีตามกติกาข้อ 4 · ผลที่ยอมรับ: fixtures มี synthetic IDs ชุดเดียวกันทั้งสองฝั่ง; บัญชีบันทึกเป็นรายการ masked

## 2) G-DB — บัญชี/สิทธิ์/receipt บนฐานทดสอบ

### EV-DB-01 — catalog ตรวจ test-SchoolBot DB (AC-033-04, AC-033-05)
- **จุดตรวจ**: ทุกตารางข้อมูลผลิตภัณฑ์ใช้ prefix `SchoolBot` มีฟิลด์มาตรฐานครบ และ PK/FK เป็น int4 ตรงกันทุกคู่
- **สิ่งที่ต้องรัน** (มนุษย์ บน test-SchoolBot DB): สอบถาม catalog เทียบ `db/schoolbot_db.sql`/db/review-006:
```sql
SELECT table_name FROM information_schema.tables
 WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY 1;
SELECT tc.table_name, tc.constraint_type, kcu.column_name, c.data_type
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
  JOIN information_schema.columns c
    ON c.table_schema = tc.table_schema AND c.table_name = tc.table_name AND c.column_name = kcu.column_name
 WHERE tc.table_schema='public' AND tc.constraint_type IN ('PRIMARY KEY','FOREIGN KEY')
 ORDER BY tc.table_name, tc.constraint_type;
```
- **ผลที่ยอมรับ**: ตาราง `SchoolBot*` ครบ **32** ตรง DDL; PK int4 ทุกตาราง; FK **40** เส้น (รวม natural composite `FK_SchoolBotProject_CurrentRevision`) int4 ตรงคู่ทุกเส้น; UQ 24 / CHECK 80 / partial unique index 13 / non-unique 0 ตรง schema-notes (หมายเหตุ: `SchoolBotScoreOutbox.ReceiptId` int8 logical reference ไม่ใช่ FK — ไม่นับ)
- **ห้าม**: รันบน production; แก้ DDL ให้ตัวเลขตรง; อ้างผลจากไฟล์ SQL โดยไม่รันจริง

### EV-DB-02 — บัญชีเดิม UPDATE คะแนน + INSERT `PgtgradeAuditLog` ใน transaction เดียว (G-DB ตาม DES-009/decisions-029)
- **สิ่งที่ต้องรัน** (มนุษย์ บน **test PGGradeDB clone** ด้วยสำเนาบัญชีเดิม):
  1. โหมด commit: `BEGIN;` → `UPDATE` แถว `PgtgradeDetail` synthetic หนึ่งแถว (เปลี่ยน `ScoreData` เฉพาะช่อง synthetic) → `INSERT INTO "PgtgradeAuditLog"` พร้อม `Application='SchoolBot'`, `MethodName='ScoreExport.Apply'`, `SEmp` = sEmp ครู synthetic → `COMMIT;` (ชื่อคอลัมน์เป็นสมมติฐานตาม source-review-004 จนกว่า EV-GR-01 ยืนยัน)
  2. โหมด rollback: ลำดับเดียวกันแต่ `ROLLBACK;` → ตรวจทั้งสองตารางไม่เปลี่ยนแปลง
- **ผลที่ยอมรับ**: โหมด 1 commit สำเร็จทั้งคู่ใน TX เดียว; โหมด 2 สะอาด; ทำได้**โดยไม่ต้องขอสิทธิ์เพิ่ม/GRANT ใหม่ใด ๆ**
- **ห้าม**: รันบน PGGradeDB จริง; GRANT/REVOKE/CREATE ROLE ทุกที่; ใช้บัญชีสิทธิ์เกิน (เช่น superuser) แล้วอ้างว่าผ่าน; บันทึก password/connection string ลง evidence

### EV-DB-03 — B API ไม่มี PG secret (process boundary)
- **จุดตรวจ**: credential PGGradeDB ต้องอยู่ที่ worker เท่านั้น (export-proof-pack-001)
- **สิ่งที่ต้องรัน** (มนุษย์ ตรวจ config — ไม่ใช่ SQL): ตรวจ config/secret store ของ B API และ worker บน test env ว่ามี reference credential PGGradeDB ที่ไหน; สรุปเป็น inventory
- **ผลที่ยอมรับ**: ไม่พบ credential PGGradeDB ใน config ของ B API; พบเฉพาะที่ worker; ส่งผลสรุป (ไม่แนบค่า secret)
- **หมายเหตุ**: เป็น mitigation ประกอบ SEC001-002 เท่านั้น (DES-009) ไม่ใช่การปิด gate

## 3) G-COEXIST — จำลอง writer race / xmin CAS บน test DB

### EV-CX-01 — race กับ writer เดิม: xmin CAS ต้องชนและไม่ทับครู
- **สิ่งที่ต้องรัน** (มนุษย์ สาม session psql บน **test PGGradeDB clone**):
  1. **Session R (จำลอง preview)**: อ่านนอก transaction — จด (PK, `xmin` = X1, `before_document_hash` = H1, `ScoreData`)
  2. **Session L (จำลอง writer เดิม/ครูแก้ช่องตัวเอง)**: `UPDATE` แถวเดียวกัน (เปลี่ยน Score ช่องครู) แล้ว `COMMIT` → `xmin` เปลี่ยนเป็น X2
  3. **Session W (จำลอง SchoolBot worker)**: `BEGIN;` → `SELECT ... FOR UPDATE` → `UPDATE ... WHERE <PK ตรง> AND "xmin" = X1` (และเทียบ document hash กับ H1):
```sql
-- ตัวอย่าง (รันบน test PGGradeDB clone เท่านั้น; ชื่อคอลัมน์เป็นสมมติฐานตาม source-review-004)
UPDATE "PgtgradeDetail" SET "ScoreData" = :new_json
 WHERE "NGradeId" = :n AND "SId" = :sid AND "xmin" = :xmin_from_snapshot;
```
  4. บันทึก affected rows และ state ที่ worker เห็น
- **ผลที่ยอมรับ**: affected rows = **0** → worker มาร์ก conflict รายคนนั้นและ rollback; ค่าที่ writer เดิมเขียน (X2) อยู่ครบไม่ถูกทับ; conflict ปรากฏที่ client boundary (paused_conflict/reason_code ตาม DES-009)
- **ห้าม**: อ้าง `UpdateDate` ของ SchoolBot ไปแทน `xmin` ของ PGGradeDB; ถือว่า affected=0 จากเงื่อนไข PK อย่างเดียวแล้วเรียกว่า "CAS ผ่าน"; รันบน PGGradeDB จริง

### EV-CX-02 — happy path CAS + operation lock serialize
- **สิ่งที่ต้องรัน**: (1) ไม่มีใครแย่ง: snapshot X1 → worker `BEGIN; SELECT..FOR UPDATE; UPDATE..WHERE xmin=X1` → affected = **1** → INSERT receipt ใน TX เดียว → `COMMIT` → อ่านกลับ `ScoreData` ต้องรักษาช่องอื่น/ลำดับรายการ/unknown properties/ผลพิเศษเดิม (DES-009) (2) serialize: W1 ถือ transaction-scoped operation lock แล้ว W2 เข้าเงื่อนไขเดียวกัน — W2 ต้องรอหรือถูกปฏิเสธ ไม่มี double-write
- **ผลที่ยอมรับ**: affected=1; คะแนนเปลี่ยนเฉพาะช่องเป้าหมาย; receipt ผูก TX เดียวกัน; W2 ไม่เขียนซ้ำ (after snapshot + audit ไม่มีสอง receipt ต่อ apply หนึ่งครั้ง)
- **ห้าม**: ปิด/ข้าม lock เพื่อให้ทดสอบง่าย; ยืนยันผ่านโดยไม่ตรวจ affected rows จริง

### EV-CX-03 — idempotency/retry: OperationKey/Export ซ้ำไม่เกิดผลซ้ำ (AC-052-03)
- **สิ่งที่ต้องรัน**:
  1. บน **test-SchoolBot DB**: จำลอง duplicate ระดับตาราง — INSERT `"SchoolBotScoreOutbox"` ด้วย `"OperationKey"` เดิมสองครั้ง → ครั้งที่สองต้อง ERROR 23505
  2. ผ่าน B API บน test env: confirm ซ้ำด้วย `Idempotency-Key` เดิม (และกรณี response หาย — recovery ลำดับ 2) → ต้องได้ export เดิม (`UQ_SchoolBotScoreExport_ScorePreviewId` กัน 1 preview : 1 export)
- **ผลที่ยอมรับ**: 23505 จริง; retry ผ่าน API ได้ export_id/state/receipt เดิม; before/after snapshot (EV-SN-01) ยืนยันคะแนนไม่บวกซ้ำ
- **ห้าม**: ตัด UQ ชั่วคราว; ทดสอบขั้นตอน 2 โดยแก้ตารางตรง ๆ แทนการเรียก API

## 4) Durable receipt + audit จำลอง (G-DB × AC-052-03..05)

### EV-RC-01 — atomicity ของ "คะแนน + receipt" (recovery ลำดับ 3)
- **สิ่งที่ต้องรัน**: ทำซ้ำ EV-DB-02 โหมด commit แต่เพิ่มโหมด kill — รัน TX (UPDATE + INSERT receipt) แล้ว**ยกเลิก connection กลางคัน** (ปิด session/`pg_terminate_backend` ตัวเองก่อน COMMIT)
- **ผลที่ยอมรับ**: all-or-nothing — โหมด kill แล้ว `PgtgradeDetail` และ `PgtgradeAuditLog` ไม่มีการเปลี่ยนแปลงใด ๆ (ตรวจคู่ before/after snapshot)
- **ห้าม**: เขียน receipt นอก TX เดียวกับคะแนนแล้วอ้างว่า atomic

### EV-RC-02 — crash หลัง PG commit ก่อน SchoolBot ack → reconcile จาก receipt (recovery ลำดับ 4; AC-052-03/04)
- **สิ่งที่ต้องรัน**: (1) apply สำเร็จครบ (UPDATE + INSERT receipt + COMMIT) แต่**จำลอง crash ก่อนข้อ 5 ของลำดับ DES-009** — ไม่อัปเดต `SchoolBotScoreOutbox` (2) รอบ worker ถัดไป/จำลอง reconcile: ค้น receipt ใน clone ด้วย marker ของ OperationKey (`Application='SchoolBot'` + `MethodName='ScoreExport.Apply'` + grade context) → UPDATE test-SchoolBot DB outbox เป็น `State='applied'`, `ReceiptId`, `ReceiptHash` (3) สาขาตรงข้าม: ไม่พบ receipt → ถือว่ายังไม่เคย commit (retry ได้) ไม่ใช่ apply ใหม่ทับ (4) partial (AC-052-04): fixture 3 คน (applied/conflict/blocked) → export state `completed_with_skips`/`paused_conflict` ตามจริง แสดงผลรายคน
- **ผลที่ยอมรับ**: สาขา 2 — `xmin`/`ScoreData` ของแถวเป้าหมาย**ไม่เปลี่ยนเพิ่ม**จากรอบก่อน (EV-SN-01); state รายคนตรงความจริง; คงผลคนที่สำเร็จ ไม่ rollback โดยเดา (recovery ลำดับ 5–6)
- **ห้าม**: apply ซ้ำเมื่อสถานะไม่แน่ใจ; rollback คะแนนที่ลงแล้วโดยไม่มีหลักฐาน

### EV-RC-03 — ReceiptHash ตรวจซ้ำได้ + audit ครบ (AC-052-05)
- **สิ่งที่ต้องรัน**: หลัง EV-RC-02 อ่าน receipt กลับจาก clone → recompute hash จาก canonical receipt เทียบ `ReceiptHash` ใน test-SchoolBot DB; นับ `SchoolBotAuditEvent` + `PgtgradeAuditLog` ครบทุกการเปลี่ยน state ของ export ชุดทดสอบ
- **ผลที่ยอมรับ**: hash ตรงทุกรายการ; audit event ครบทุก transition (create/confirm/apply/conflict/skip); ไม่มี receipt กำพร้า
- **ห้าม**: ปรับ hash ภายหลังให้ตรง

## 5) Before/after snapshot — วิธีเก็บ (ใช้ร่วมทุก gate และ AC-052-05)

### EV-SN-01 — ขั้นตอนเก็บ snapshot มาตรฐานของชุดนี้
- **วิธีเก็บ** (มนุษย์ ทุกครั้ง): ต่อ test DB ด้วยบัญชี **read-only** แล้วดึงเฉพาะ synthetic keys:
  - ฝั่ง **PG clone** ต่อรายการ (learner × slot): PK · `xmin` · canonical `ScoreData` (sort keys) + SHA-256 · รายช่อง (`ScoreIdentifier`/`Score`/`AssessmentId`) · ธงผลพิเศษ · ธง `PgtgradeEdit` · derived ที่ reader แสดง (GetScore100) · timestamp · ชื่อบัญชีที่อ่าน (masked)
  - ฝั่ง **test-SchoolBot DB**: id/state ของ `SchoolBotScorePreview`/`ScoreExport`/`ScoreOutbox` (`OperationKey`, `ReceiptId`, `State`) + `snapshot_hash`
  - จังหวะเก็บ: ก่อน confirm · หลัง confirm ก่อน apply · หลัง apply ทุกรอบรวม retry — พิสูจน์ "ไม่มี write ก่อน confirm" และ "assignment ไม่ increment"
  - จัดเก็บ: คู่ไฟล์ `before.json`/`after.json` + ตาราง diff สรุป + SHA-256 ของไฟล์; ผ่านการตรวจ PII/secret ก่อนเข้า knowledge; พบ PII → flag ให้ jpo
- **ห้าม**: `SELECT *`/pg_dump ข้อมูลทั้งตาราง; เก็บข้อมูลนักเรียนจริง; screenshot ที่มีข้อมูลจริงรอบภาพ; เก็บ connection string/secret

## 6) G-PARITY — ส่วนที่ vault เตรียม

### EV-PAR-01 — ตัวเก็บ golden before/after + คำขอ authoritative fixtures
- vault เตรียมเฉพาะตัวเก็บข้อมูลและรูปแบบเทียบ — ใช้ EV-SN-01 เก็บ before/after ของ fixture parity (ครอบทุก category: `scoreGrade`/`scoreCheewat`/`scoreMid`/`scoreFinal`) + ส่งคำขอตาม EV-GR-06(d) เพื่อขอสูตร/fixture อ้างอิง · ตัวเลข parity 100% เป็นของเจ้าของเกรด/sys (ห้ามอ้าง reader เพื่อพิสูจน์ writer; ห้ามสรุป PASS parity เองโดยไม่มีเจ้าของรับรอง)

## 7) G-TARGET — ส่วนที่ vault เตรียม (บน test clone)

### EV-TG-01 — ปลายทางไม่มีแถว/กำกวม → ห้ามสร้าง implicit zero row
- ลบ detail row ของ synthetic learner หนึ่งคน → เรียก apply ผ่าน test env → บันทึก response + after snapshot · **ผลที่ยอมรับ**: `TARGET_NOT_READY` (ไม่สร้าง header/detail/zero row ใหม่); after snapshot ยืนยันไม่มีแถวเกิด · ห้ามสร้างแถวแทนระบบ/แปลง missing เป็นศูนย์
### EV-TG-02 — identifier กำกวม/ผลพิเศษ/PgtgradeEdit → หยุดหรือ block
- (1) ใส่ `ScoreIdentifier`/AssessmentId ซ้ำสองชุดใน `ScoreData` synthetic → apply ต้องหยุด (duplicate/ambiguous) ห้ามเลือก array index จาก Ordinal (2) ใส่ธง `PgtgradeEdit` และรหัสผลพิเศษรายคน → ต้อง block รายคนนั้น ห้าม clear override/แปลงผลพิเศษเป็นศูนย์ (GradeSpecialConstants ตาม source-review-004) · **ผลที่ยอมรับ**: ทั้งสองกรณีถูกหยุด/block พร้อม reason_code; after snapshot ยืนยันข้อมูลเดิมครบ

## 8) G-AUTHZ — ส่วนที่ vault เตรียม (fixture เท่านั้น)

### EV-AZ-01 — fixture ล็อกปลายทาง/ถอนสิทธิ์ สำหรับ negative tests (AC-052-01/02)
- (1) ตั้งธงล็อกบน synthetic row ปลายทาง (`PgtgradeSetting.IsLocked` หรือ GradeClose*/Option* ตามที่ EV-GR-01/06(c) ยืนยันความหมาย) → confirm/apply ต้องถูกปฏิเสธ (2) ถอนสิทธิ์ครูรายวิชาใน School DB test **ระหว่าง** preview กับ confirm และอีกครั้งระหว่างรอ worker → ต้องหยุดทั้งสองจุด (DES-009 re-check ณ create/confirm/apply)
- **ผลที่ยอมรับ**: ทุกกรณีถูกปฏิเสธ/บล็อกตาม error matrix ของ DES-009/DES-012; before/after snapshot ยืนยันคะแนนไม่เปลี่ยน
- **หมายเหตุ**: authorization matrix จริงเป็นหน้าที่ legacy owner ตาม SA-004 — ชุดนี้เตรียม fixture/หลักฐาน DB เท่านั้น

## 9) คำขอหลักฐานจากเจ้าของ PGGradeDB (EV-GR-01..06) — schema-only/aggregate เท่านั้น

ใช้หลัก 6 ข้อของ [db-safe-evidence-001](../db/db-safe-evidence-001.md) ทั้งก้อน: schema-only + aggregate เท่านั้น · กลุ่ม < 5 รวม "other" + complementary suppression · ผู้รัน = เจ้าของ/DBA ของ PGGradeDB (มนุษย์) — **ฝั่งทีม SchoolBot ห้ามรันกับ PGGradeDB จริงเด็ดขาด** · ผลต้องผ่านการตรวจ PII รายแถวก่อนเข้า knowledge · ชื่อคอลัมน์จาก as-built port (source-review-004) ถือเป็นสมมติฐานจนกว่า EV-GR-01 ยืนยัน · DDL ส่งเฉพาะ metadata ตรวจ literal ก่อนส่ง ห้าม raw dump

| รหัส | สิ่งที่ขอ | เหตุผล (gate) | รูปแบบที่ยอมรับ |
|---|---|---|---|
| EV-GR-01 | DDL schema-only ของ `Pgtgrade`, `PgtgradeDetail`, `Pgtassessment`, `PgtgradeAuditLog`, `PgtgradeEdit`, `PgtgradeSetting` (+ `Tplane`/`TplanCourse`/`TplanCourseTerm` ถ้าอนุญาต) | ปลดสมมติฐานชื่อคอลัมน์ · ยืนยัน index `(SchoolId,NGradeId,SId,CDel)` ไม่ unique/ไม่มี concurrency token · G-COEXIST inventory trigger/function | pg_dump --schema-only / `\d+` / information_schema + pg_indexes + pg_constraint + pg_trigger — ตรวจ literal ก่อนส่ง |
| EV-GR-02 | Aggregate inventory writers: จำนวน trigger ต่อตารางแยกตาม event; จำนวน/ชื่อ role ที่ถือสิทธิ์ UPDATE `PgtgradeDetail`/INSERT `PgtgradeAuditLog` (ชื่อ role + privilege เท่านั้น) | G-COEXIST — รู้จำนวน writer จริงที่แย่งแถวกับ SchoolBot | ตาราง count รายกลุ่ม |
| EV-GR-03 | Aggregate รูปร่าง `ScoreData`: count ราย identifier label, การกระจายจำนวนช่องต่อรายการ (bucket), ป้ายชนิดคะแนน (`INT_OK`/`DECIMAL`/`EMPTY` — คำนวณใน DB) | G-TARGET — cardinality/identifier/row shape; reader `int.TryParse` ทำ decimal เป็น null (source-review-004) | ตาราง (label, count); กลุ่ม < 5 รวม other |
| EV-GR-04 | Aggregate `PgtgradeAuditLog`: count ราย `Application`/`MethodName` | ยืนยัน receipt shape สมจริง (G-DB) | ตาราง count ไม่มี payload |
| EV-GR-05 | Aggregate override/ผลพิเศษ: count `PgtgradeEdit` ที่มีค่า GetScore100, count รหัสผลพิเศษรายรหัส | ประเมินความชุกของ block/conflict (G-TARGET/G-AUTHZ) | ตาราง count; กลุ่ม < 5 รวม other |
| EV-GR-06 | คำถามถึงเจ้าของ (ไม่มี SQL): (a) บัญชี DB เดิมตัวไหนที่ระบบเดิมใช้เขียน PGGradeDB และ**ยินยอมให้ SchoolBot worker ใช้บัญชีเดิมหรือไม่** (decisions-029/G-DB) (b) writer เดิม (`sb-service-academic-score-record`) บังคับ CAS ด้วย `xmin` จริงหรือไม่ (proto ระบุ row version = xmin แต่ไม่ใช่หลักฐานพฤติกรรมจริง) (c) ความหมาย/transition จริงของ GradeClose*/Option*/IsLocked — เกณฑ์ "เกรดล็อก" (G-AUTHZ) (d) สูตรน้ำหนัก/derived fields ที่ใช้จริง หรือ authoritative fixtures ให้เจ้าของรับรอง (G-PARITY) | ปิดช่อง "ยังไม่ยืนยัน" ที่กันห้า gate | คำตอบเป็นลายลักษณ์อักษร/ผลสรุป |

ผู้ตอบทุกรายการ: เจ้าของ/DBA ของ PGGradeDB (มนุษย์) · ทุกผลส่งกลับให้ vault/sys ตรวจ PII ก่อนเข้า knowledge

## 10) ตาราง coverage (AC × gate × EV)

| เป้าหมาย | EV ที่ครอบ | ผู้รับรองหลัก |
|---|---|---|
| AC-033-04, AC-033-05 (catalog) | EV-DB-01 | vault เตรียม · มนุษย์รัน · check ตรวจ |
| G-DB | EV-DB-01..03, EV-RC-01..03, EV-GR-06(a) | มนุษย์รัน + เจ้าของเกรดยินยอม |
| G-COEXIST | EV-CX-01..03, EV-GR-01/02, EV-GR-06(b) | มนุษย์รัน + ยืนยันจากเจ้าของ |
| G-PARITY | EV-SN-01, EV-PAR-01, EV-GR-06(d) | เจ้าของเกรด/sys (vault เตรียมตัวเก็บ) |
| G-TARGET | EV-TG-01..02, EV-GR-03 | sys + เจ้าของ |
| G-AUTHZ | EV-AZ-01, EV-GR-06(c) + matrix จากเจ้าของตาม SA-004 | legacy owner |
| AC-052-01 | EV-AZ-01 | sys/legacy owner |
| AC-052-02 | EV-AZ-01 + EV-CX-01 (target เปลี่ยนกลางทาง) | sys |
| AC-052-03 | EV-CX-03 + EV-RC-02 | sys + มนุษย์รัน |
| AC-052-04 | EV-RC-02 (สาขา partial) | sys |
| AC-052-05 | EV-SN-01 + EV-RC-03 | sys + เจ้าของ (ผลรวม/เกรดตรงระบบเดิม) |

## 11) ประตูมนุษย์ G-DB — ยังไม่ปิด

1. **ชื่อบัญชี DB เดิมที่ใช้ต่อ PGGradeDB ยังไม่ได้รับการยืนยัน** — รอ EV-GR-06(a)
2. **ความยินยอมเจ้าของระบบเกรด** (ให้ใช้บัญชีเดิมเขียนคะแนน + INSERT `PgtgradeAuditLog`) ยังไม่มีเป็นลายลักษณ์อักษร
3. **หลักฐานบนฐานทดสอบยังไม่รัน** — EV-DB-02/EV-RC-01 pending ผู้รันมนุษย์

ผ่าน EV ทั้งหมดบน test clone **ไม่เท่ากับปิด gate** — จนกว่า gates ทั้งห้าผ่านและมนุษย์ลงนาม confirm ยังตอบ 503 ตามรหัส gate ที่ค้าง (G-DB → `RECEIPT_UNAVAILABLE`); preview แบบ non-production เปิดได้ก่อนตาม DES-009 แต่ไม่ใช่สิทธิ์เปิด confirm/apply · ไม่เพิ่ม export queue/table/gate ใหม่ตาม export-proof-pack-001

## Change Log

- 2026-10-24 — Rev1: สร้างชุดคำขอ/ขั้นตอนหลักฐาน runtime cross-DB/export ครอบ G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB (docs-only, SQL ตัวอย่างจำกัด test-SchoolBot DB/test clone เท่านั้น) — รันโดย นายช่าง solo (subagent role vault)
