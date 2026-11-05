-- ชุดตรวจ catalog ใบงาน094 DBA-002/004 — คนเป็นผู้รันเท่านั้น ห้าม agent รัน
-- Change Log: 2026-10-29 — C0..C5 สำหรับ AC-033-01..05; ไม่อ่าน business rows/secret
-- Preconditions/expected: review-008.md; ทุกผลเป็น snapshot เดียว ไม่รับรอง app ใช้ DB นี้จนเจ้าของยืนยัน
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;

-- C0: ผูกหลักฐานกับฐานทดสอบจริง (ไม่ส่ง connection string)
SELECT current_database() AS database_name, current_setting('server_version') AS server_version;

-- C1: inventory ทุกตารางผู้ใช้ เพื่อให้คนจำแนกตารางผลิตภัณฑ์ที่อาจไม่มี prefix ด้วย
SELECT n.nspname AS schema_name, c.relname AS table_name, c.relkind, c.relpersistence
FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r','p') AND n.nspname <> 'information_schema' AND n.nspname !~ '^pg_'
ORDER BY 1,2;

-- C2: ตารางที่ต้องมีครบทั้ง32 ชื่อและตัวพิมพ์ตรง ไม่มี missing; ไม่ใช้ count อย่างเดียว
WITH expected(table_name) AS (VALUES
    ('SchoolBotLicense'),
    ('SchoolBotLicenseBinding'),
    ('SchoolBotRelease'),
    ('SchoolBotIdempotency'),
    ('SchoolBotAuditEvent'),
    ('SchoolBotSession'),
    ('SchoolBotStaffRole'),
    ('SchoolBotProject'),
    ('SchoolBotProjectRevision'),
    ('SchoolBotLevel'),
    ('SchoolBotLevelPromotionPolicy'),
    ('SchoolBotCurriculum'),
    ('SchoolBotLesson'),
    ('SchoolBotMission'),
    ('SchoolBotCriteria'),
    ('SchoolBotActivity'),
    ('SchoolBotQuestionBank'),
    ('SchoolBotCourseRun'),
    ('SchoolBotScoringPolicy'),
    ('SchoolBotCourseRunActivity'),
    ('SchoolBotSubmission'),
    ('SchoolBotGradingJob'),
    ('SchoolBotAssessment'),
    ('SchoolBotAttempt'),
    ('SchoolBotRetakeGrant'),
    ('SchoolBotGradeSlot'),
    ('SchoolBotScoreMapping'),
    ('SchoolBotScorePreview'),
    ('SchoolBotScorePreviewItem'),
    ('SchoolBotScoreExport'),
    ('SchoolBotScoreOutbox'),
    ('SchoolBotLevelProposal')
)
SELECT e.table_name, c.oid IS NOT NULL AS present, c.relkind, c.relpersistence
FROM expected e
LEFT JOIN pg_catalog.pg_namespace n ON n.nspname = 'public'
LEFT JOIN pg_catalog.pg_class c ON c.relnamespace = n.oid AND c.relname = e.table_name
ORDER BY 1;

-- C3: ทุกคอลัมน์ SchoolBot ทุก schema — เทียบ450ฟิลด์กับ DDL ไม่เดาชนิดจากชื่อ *Id
-- typname int4=int4; _int4=integer[]; int8=bigint. identity_kind ต้อง a สำหรับPK
SELECT n.nspname AS schema_name, c.relname AS table_name, a.attnum AS ordinal,
       a.attname AS column_name, t.typname AS type_name,
       pg_catalog.format_type(a.atttypid,a.atttypmod) AS physical_type,
       a.attnotnull AS not_null, pg_catalog.pg_get_expr(d.adbin,d.adrelid) AS default_expr,
       a.attidentity AS identity_kind, a.attgenerated AS generated_kind
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
JOIN pg_catalog.pg_type t ON t.oid = a.atttypid
LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
WHERE c.relkind IN ('r','p') AND c.relname ILIKE 'schoolbot%'
  AND n.nspname <> 'information_schema' AND n.nspname !~ '^pg_'
ORDER BY 1,2,3;

-- C4: ต้องมีPK32บนคอลัมน์ <ชื่อเต็มตาราง>Id; p เท่านั้น ไม่พบ u/f/c/x
SELECT n.nspname AS schema_name, c.relname AS table_name, k.conname, k.contype,
       pg_catalog.pg_get_constraintdef(k.oid,true) AS definition
FROM pg_catalog.pg_constraint k
JOIN pg_catalog.pg_class c ON c.oid = k.conrelid
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname ILIKE 'schoolbot%' AND n.nspname !~ '^pg_'
ORDER BY 1,2,3;

-- C5: ต้องเป็น ordinary logged tables; backing indexes เฉพาะPK32; ไม่มี standalone unique/indexแฝง
SELECT n.nspname AS schema_name, c.relname AS table_name, i.relname AS index_name,
       x.indisprimary, x.indisunique, x.indisvalid, x.indisready,
       pg_catalog.pg_get_indexdef(i.oid) AS definition
FROM pg_catalog.pg_index x
JOIN pg_catalog.pg_class c ON c.oid = x.indrelid
JOIN pg_catalog.pg_class i ON i.oid = x.indexrelid
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname ILIKE 'schoolbot%' AND n.nspname !~ '^pg_'
ORDER BY 1,2,3;

COMMIT;
