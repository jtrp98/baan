# ใบงาน 095 — ตรวจ core และ release SQL

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (DBA-003/005/006)

เตรียม SELECT ตรวจ catalog แล้ว คง DDL/rollback เดิมทุก byte ไม่มี SQL delta ที่ให้รันเพิ่ม ฐานที่ผู้ใช้สร้างแล้วให้รันเฉพาะ catalog-check ห้ามรัน CREATE หรือ rollback เดิมซ้ำ ผล learning แยกใน [DBA-005](dba-005-learning-review.md)

## DBA-003 — verdict: รอมนุษย์ (NEEDS_HUMAN)

| AC/criterion | Deliverable | Expected | Actual | ข้อจำกัด |
|---|---|---|---|---|
| AC-033-01 (ชื่อ License) | catalog-check Q02 | public.SchoolBotLicense ตรงตัวพิมพ์ | รอคน | จำนวน 32 อย่างเดียวไม่ยืนยันชื่อ |
| AC-033-02 (PK License int4) | Q03/Q04/Q06 | SchoolBotLicenseId int4, PK, ALWAYS identity | รอคน | static DDL ไม่ใช่ deployed catalog |
| AC-033-03 (6 common fields) | Q03/Q07 | IsDelete/CreateBy/CreateDate/UpdateBy/UpdateDate/SchoolId ครบ | รอคน | เทียบชนิดและ NULL ด้วย |
| AC-033-04 (ทุกตารางผลิตภัณฑ์) | Q02/Q03/Q07 | 32 ตาราง public prefix SchoolBot และ common fields ทุกตาราง | รอคน | เจ้าของยืนยันว่าไม่มีตารางผลิตภัณฑ์นอก prefix |
| AC-033-05 (ชนิดและ constraints) | Q03–Q07 | 450 fields, PK32 เป็น int4, UQ/FK/CHECK0; ReceiptId=int8 | รอคน | PK backing indexes เป็น unique ได้ตามปกติ |
| execution/environment | Q01 และ execution receipt | ผู้รัน/เวลา/environment/ไฟล์ revision+hash ที่เคยรัน | บางส่วน | ใบงานแจ้ง PG15.19/32 ตาราง แต่ไม่มี receipt ให้ตรวจ |
| concurrency/rollback | ขอ receipt จากเจ้าของ DB ผ่านนายช่าง | expected/actual ของการทดสอบ transaction และ concurrent writers บนฐานทดสอบ | รอคน | SELECT catalog ไม่พิสูจน์ application locking หรือ rollback |

ผลคาดหวังครบทุก query อยู่ใน [expected](dba-003-catalog-expected.md) และ [fingerprints](dba-003-catalog-fingerprints.md) ไม่มีการปิด G-CORE (ประตูหลักฐาน core)

## DBA-006 — verdict: ต้องแก้แบบ (NEEDS_DESIGN_CHANGE)

| Criterion | Deliverable / expected | Actual | ข้อจำกัด |
|---|---|---|---|
| unique version/channel/platform | SchoolBotRelease + กฎ serialize global/tenant ก่อนตรวจซ้ำ | ครบเฉพาะ static review | ไม่มี SQL UNIQUE ตามมติ 044; ยังไม่พิสูจน์ writer พร้อมกัน |
| audit | Release/Idempotency/AuditEvent อยู่ฐานเดียวและ commit พร้อมกัน | บางส่วน | evidence_ref:T2048 ยังไม่มี storage mapping ที่เก็บครบได้ |
| placement | 32 ตาราง public ใน SchoolBot DB; ไม่เพิ่ม role/GRANT ในฐานเดิม | ครบเฉพาะแบบ/DDL | รอ catalog ยืนยัน environment |
| rollback | rollback เดิมครบ 32 ตาราง มี lock+empty guard ไม่มี CASCADE | ครบเฉพาะ static review | DESTRUCTIVE: DROP ใช้เฉพาะ fresh empty create ที่ยังไม่เปิด writer ห้ามใช้ฐานปัจจุบัน |
| trust | Manifest signed JWS, immutable CI registry, publisher pin/expiry/hash ตรวจนอก SQL | บางส่วน | ไม่มี runtime หรือ custody/pin approval ให้ตรวจ; SQL ไม่ตรวจ cryptography |

DES-007 กำหนด publish evidence_ref ยาว 2,048 ตัว และ release-trust กำหนด audit ผูก evidence_ref แต่ AuditEvent มีเพียง Reason varchar(1000) สำหรับข้อความนี้ ไม่มี field แยกที่ระบุให้เก็บครบ จึงต้องให้ arch ระบุ storage/read-back ที่ชัดร่วมกับปัญหา approval ของ DBA-005 ก่อน freeze ไม่ถือว่าการ truncate/hash-only แทนข้อความผ่านเอง

Release physical เดิม: SchoolBotReleaseId integer ALWAYS identity PK; VersionText varchar(32), Channel varchar(16), Platform varchar(32), Manifest varchar(16384), ArtifactHash varchar(64), Lifecycle varchar(16) เป็น NOT NULL ไม่มี default; PublishedAt/WithdrawnAt timestamptz NULL; common fields ตาม expected โดย SchoolId integer NULL (mixed global/tenant) ไม่มี physical FK/UNIQUE/CHECK ไม่เพิ่ม/ถอน/เปลี่ยน field ในงานนี้

## สิ่งที่รอผู้รับผิดชอบ

| Task / Reference | คำถามและเหตุผล | ผู้ตอบ / สิ่งที่จะปลดล็อก |
|---|---|---|
| DBA-003 / REQ-033, G-CORE | ส่งผล Q01–Q07 พร้อมยืนยัน connection ระบบทดสอบได้หรือไม่? แนบ execution/concurrency/rollback receipts ที่มี โดยไม่สร้างหลักฐานย้อนหลัง | ผู้ใช้/เจ้าของ DB → ตรวจ actual และให้ check ตัดสิน |
| DBA-005 / DES-005, DES-010 | ส่ง exact path และผลยอมรับ task-012/013; ข้อสรุป storage approval_ref คืออะไร? | นายช่าง/arch; หากเปลี่ยน business bound ส่ง spec/ผู้ใช้ → freeze learning |
| DBA-006 / DES-007 | evidence_ref:T2048 บันทึกและอ่านกลับจากไหนโดยไม่ตัดข้อความ? | arch/ผู้ใช้ตาม schema gate → freeze release |

นายช่างส่งต่อ arch เพื่อแก้ canonical model/dictionary/DBML และ check เพื่อตรวจชุดส่งมอบ; ส่ง jpo พิจารณา masking/encryption ของ Actor, LearnerId, SchoolId, คำตอบ/ผลเรียน, ข้อมูลอุปกรณ์ และข้อความ audit ห้ามใส่ token/password/source นักเรียนใน Reason

## หลักฐาน

- schoolbot_db.sql:30–677; Release:71–88, AuditEvent.Reason:123; schoolbot_db_rollback.sql:17 เป็นต้นไป ตรวจไฟล์เท่านั้น
- SHA-256 DDL: `b330135619c8d613c66234b5ed7dc6626694256edabbbfdcb6212d953474bf12`
- SHA-256 rollback: `2112a68ef54b8271ce7a368fa49a1f26b87b53ecd9695619fbec707cebc5b08b`
- DES-007 Rev3: des-007-manifest.md:24 และ release-trust-001.md; data-contract-rules-grades.md กำหนด lock แบบ global/tenant แยกกัน
- อ่าน acceptance ใน cards DBA-003/005/006 และ tasks-001.json วันที่งาน 2026-11-03; REQ-033 AC01–05 และ REQ-029 AC01–03
- คำสั่งตรวจจริง: PowerShell here-string `node -` ใช้ Node assert อ่านไฟล์อย่างเดียว แบ่ง 6 กลุ่มผ่าน 6/ตก 0: inventory, DBML parity, dictionary parity, PK-only declarations, rollback coverage, SELECT-only 7 statements; ไม่ใช่ PostgreSQL parser/runtime test ตัวตรวจฉบับแรกตกเพราะยังไม่รองรับ DEFAULT 'desktop' จากนั้นแก้ตัวตรวจและรันครบใหม่; `python -` เปิดไม่ได้ จึงใช้ Node
- apply_patch เขียนไฟล์ใหม่ไม่ได้ จึงใช้ Set-Content ในโฟลเดอร์ที่อนุญาตสำเร็จ ไม่มีการเขียนนอก build/db
- ต้องให้นายช่างเพิ่มรายการไฟล์ใหม่ใน index/changelog ของ knowledge ตามสิทธิ์ตน; vault ไม่แก้ไฟล์นอกขอบเขตและไม่ commit
- ตรวจ artifact รอบสุดท้ายด้วย `node -`: ผ่าน4/ตก0 กลุ่ม (links/encoding/date, hash DDLคู่เดิม, SELECT-only, fingerprints32/450); ไม่มีการรัน SQL หรือ PostgreSQL parser
- ไฟล์ใหม่6ไฟล์: dba-003-catalog-check.sql, dba-003-catalog-expected.md, dba-003-catalog-fingerprints.md, dba-005-learning-review.md, dba-095-schema-parity.md และ dba-095-review.md ทั้งหมดอยู่ build/db; ไม่แก้ไฟล์เดิม
