-- DBA-003: catalog เท่านั้น ไม่มีการอ่านข้อมูลธุรกิจหรือเปลี่ยนข้อมูล
-- Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 095 / มติ 053)
-- มนุษย์รัน Q01-Q07 บน connection ระบบทดสอบ แล้วส่งผลพร้อม environment/ผู้รัน/เวลา
-- expected: dba-003-catalog-expected.md; ไม่ต้อง rollback เพราะเป็น SELECT ทั้งหมด
-- ต้องไม่มี concurrent schema changes ขณะเก็บผล; หลาย SELECT ไม่ใช่ snapshot เดียวกัน

-- Q01: บริบท connection ไม่คืน secret
SELECT 'Q01' AS query_id, current_database() AS database_name,
 current_user AS executed_by, current_setting('server_version') AS server_version,
 current_setting('server_encoding') AS server_encoding,
 inet_server_addr() AS server_address, inet_server_port() AS server_port,
 statement_timestamp() AS captured_at;

-- Q02: รวม user schema อื่นเพื่อเห็นตารางที่วางผิด schema
SELECT 'Q02' AS query_id, n.nspname AS schema_name, c.relname AS table_name,
 c.relkind, c.relpersistence, c.relrowsecurity, c.relforcerowsecurity
FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
WHERE left(c.relname,9)='SchoolBot' AND c.relkind IN ('r','p','f')
 AND n.nspname <> 'information_schema' AND n.nspname !~ '^pg_'
ORDER BY n.nspname COLLATE "C", c.relname COLLATE "C";

-- Q03: ทุกฟิลด์ รวมชนิด legacy reference, NULL, default และ identity
SELECT 'Q03' AS query_id, c.relname AS table_name, a.attnum AS ordinal_position,
 a.attname AS column_name, t.typname AS internal_type,
 pg_catalog.format_type(a.atttypid,a.atttypmod) AS formatted_type,
 a.attnotnull AS not_null, a.attidentity AS identity_kind,
 a.attgenerated AS generated_kind,
 pg_catalog.pg_get_expr(d.adbin,d.adrelid) AS default_expression
FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
JOIN pg_catalog.pg_attribute a ON a.attrelid=c.oid
JOIN pg_catalog.pg_type t ON t.oid=a.atttypid
LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
WHERE n.nspname='public' AND left(c.relname,9)='SchoolBot'
 AND c.relkind IN ('r','p','f') AND a.attnum>0 AND NOT a.attisdropped
ORDER BY c.relname COLLATE "C", a.attnum;

-- Q04: constraint ทุกชนิด; FK endpoint/action ต้องอ่านจาก catalog ไม่เดาจากชื่อ
SELECT 'Q04' AS query_id, c.relname AS table_name, k.conname AS constraint_name,
 k.contype AS constraint_type, k.convalidated, k.condeferrable, k.condeferred,
 rn.nspname AS referenced_schema, rc.relname AS referenced_table,
 k.confupdtype AS on_update_code, k.confdeltype AS on_delete_code,
 pg_catalog.pg_get_constraintdef(k.oid,false) AS definition
FROM pg_catalog.pg_constraint k JOIN pg_catalog.pg_class c ON c.oid=k.conrelid
JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
LEFT JOIN pg_catalog.pg_class rc ON rc.oid=k.confrelid
LEFT JOIN pg_catalog.pg_namespace rn ON rn.oid=rc.relnamespace
WHERE n.nspname='public' AND left(c.relname,9)='SchoolBot'
ORDER BY c.relname COLLATE "C", k.conname COLLATE "C";

-- Q05: ตรวจ standalone unique index ด้วย แม้ไม่มี pg_constraint
SELECT 'Q05' AS query_id, c.relname AS table_name, ic.relname AS index_name,
 am.amname AS access_method, i.indisprimary, i.indisunique, i.indisvalid,
 i.indisready, i.indnkeyatts, i.indnatts,
 pg_catalog.pg_get_expr(i.indpred,i.indrelid) AS predicate,
 pg_catalog.pg_get_indexdef(i.indexrelid) AS definition
FROM pg_catalog.pg_index i JOIN pg_catalog.pg_class c ON c.oid=i.indrelid
JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
JOIN pg_catalog.pg_class ic ON ic.oid=i.indexrelid
JOIN pg_catalog.pg_am am ON am.oid=ic.relam
WHERE n.nspname='public' AND left(c.relname,9)='SchoolBot'
ORDER BY c.relname COLLATE "C", ic.relname COLLATE "C";

-- Q06: identity configuration เท่านั้น ไม่อ่าน/เลื่อน sequence value (ไม่มี nextval)
SELECT 'Q06' AS query_id, table_name, column_name, identity_generation,
 identity_start, identity_increment, identity_minimum, identity_maximum, identity_cycle
FROM information_schema.columns
WHERE table_schema='public' AND left(table_name,9)='SchoolBot' AND is_identity='YES'
ORDER BY table_name COLLATE "C", ordinal_position;

-- Q07: signature ฟิลด์รายตาราง: ordinal|name|type|notnull(1/0)|identity(a/-)|generated(-)|default
-- ไม่มี default และ DEFAULT NULL normalize เป็น '-'; MD5 ใช้เทียบโครงสร้าง ไม่ใช่ security
-- ไม่ใช่ hash ของไฟล์ที่มนุษย์เคยรัน ต้องเทียบ Q03-Q06 ร่วมด้วย
SELECT 'Q07' AS query_id, c.relname AS table_name, count(*) AS column_count,
 count(*) FILTER (WHERE a.attnotnull) AS not_null_count,
 count(*) FILTER (WHERE a.attidentity='a') AS identity_always_count,
 md5(string_agg(concat_ws('|',a.attnum::text,a.attname,
 pg_catalog.format_type(a.atttypid,a.atttypmod),
 CASE WHEN a.attnotnull THEN '1' ELSE '0' END,
 coalesce(nullif(a.attidentity,''),'-'),coalesce(nullif(a.attgenerated,''),'-'),
 CASE WHEN d.oid IS NULL OR pg_catalog.pg_get_expr(d.adbin,d.adrelid) ~ '^NULL(::.*)?$'
 THEN '-' ELSE pg_catalog.pg_get_expr(d.adbin,d.adrelid) END),
 E'\n' ORDER BY a.attnum)) AS columns_md5
FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
JOIN pg_catalog.pg_attribute a ON a.attrelid=c.oid
LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
WHERE n.nspname='public' AND left(c.relname,9)='SchoolBot'
 AND c.relkind IN ('r','p','f') AND a.attnum>0 AND NOT a.attisdropped
GROUP BY c.relname ORDER BY c.relname COLLATE "C";
