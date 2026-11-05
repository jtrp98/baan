# DBA-003 — ผล catalog ที่คาดหวังจาก SQL Rev7

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 095 / มติ 053 — ผู้ใช้รัน SELECT เอง)

เอกสารนี้เป็น expected จากการอ่าน DDL เท่านั้น ยังไม่มี actual ของฐานทดสอบ ไม่ปิด G-CORE (ประตูตรวจหลักฐาน core หลังมนุษย์รัน SQL) และไม่ยืนยันว่า revision ที่เคยรันตรงกัน

## วิธีส่งผลให้ตรวจ

ผู้ใช้รัน [dba-003-catalog-check.sql](dba-003-catalog-check.sql) บน connection เดียวกับระบบทดสอบ ส่งผลทุกชุด Q01–Q07 พร้อมชื่อ environment ผู้รัน เวลา/เขตเวลา และยืนยันว่าเป็นฐานที่แอปทดสอบใช้จริง ห้ามส่ง connection string หรือ secret ต้องไม่มีการเปลี่ยน schema ระหว่างเก็บผล หากมีให้เก็บใหม่หลังงานนั้นเสร็จ

แนบ execution receipt เดิม (ไฟล์/revision/SHA-256 ที่รัน เวลา ผลสำเร็จหรือ error) ถ้าไม่มีให้ระบุว่าไม่มี ไม่สร้างย้อนหลังจาก catalog; Q07 พิสูจน์ความตรงของโครงสร้างปัจจุบันได้ แต่พิสูจน์ไฟล์ที่เคยรันไม่ได้ หากเครื่องมือคืนเพียง result set สุดท้าย ให้รันทีละ Q และส่งครบทั้งเจ็ดชุด

## Expected ต่อ query

| Query | ค่าที่ควรได้จาก DDL ปัจจุบัน | Actual / ข้อจำกัด |
|---|---|---|
| Q01 | PostgreSQL 15.19 ตามข้อมูลที่ผู้ใช้แจ้ง; encoding UTF8 สำหรับ fingerprint; database/address/port ต้องตรง environment ที่เจ้าของยืนยัน ไม่ hard-code จากชื่อในแบบ | รอคน; ชื่อ database ในแบบยังเป็นสมมติฐาน |
| Q02 | 32 แถว ชื่อตามตารางท้ายเอกสาร ทั้งหมด schema=public, relkind=r, relpersistence=p, RLS/force RLS=false; ไม่มี SchoolBot table ใน schema อื่น | รอคน; ตารางที่ไม่ใช้ prefix ต้องให้เจ้าของยืนยัน inventory ของผลิตภัณฑ์เพิ่ม |
| Q03 | 450 แถว ตรงลำดับ/ชนิด/NULL ของ SQL; PK ทุกตัว internal_type=int4 และ identity_kind=a; generated_kind ว่าง; 6 common fields ครบทุกตาราง | รอคน; ดูรายละเอียดฟิลด์ใน dictionary และ Q07 |
| Q04 | 32 แถว ทุกตัว contype=p, convalidated=true, condeferrable=false, condeferred=false; ชื่อ PK_<table>; definition=PRIMARY KEY ("<table>Id"); ไม่มี FK/UNIQUE/CHECK/exclusion | รอคน; referenced endpoint ไม่มีเพราะไม่มี FK; action code ของ non-FK ไม่มีความหมาย |
| Q05 | 32 แถว backing indexes ของ PK ชื่อ PK_<table>, btree, primary/unique/valid/ready=true, indnkeyatts=indnatts=1, predicate=NULL; indexed field=<table>Id; ไม่มี standalone index | รอคน; unique=true ของ PK ถูกต้อง ไม่ใช่ UNIQUE constraint เพิ่ม |
| Q06 | 32 แถว <table>Id, ALWAYS, start=increment=min=1, max=2147483647, cycle=NO | รอคน; information_schema อาจซ่อนแถวตามสิทธิ์ ขาดแถวไม่ใช่ผ่าน; ไม่ตรวจ last_value |
| Q07 | 32 แถว เทียบชื่อ/count/hash รายตารางด้านล่างทุกแถว ไม่มีแถวเกินหรือขาด; ผลรวม column_count=450 และ identity_always_count=32 | รอคน; MD5 ใช้เทียบโครงสร้าง ไม่ใช่ security attestation และไม่รวม constraints/index/sequence options |

## กฎเทียบฟิลด์

`IsDelete` เป็น boolean NOT NULL DEFAULT false ทุกตาราง; `CreateBy`/`UpdateBy` เป็น integer NULL และ `CreateDate`/`UpdateDate` เป็น timestamp with time zone NULL ทั้งสี่ DEFAULT NULL; `SchoolId` เป็น integer และ nullable ใน global 8 + mixed 3 ตาราง อีก 21 ตาราง NOT NULL กฎ global=NULL/tenant>0 เป็น application rule ไม่มี CHECK บังคับ

`SchoolBotSession.Channel` เป็น character varying(16) NOT NULL DEFAULT 'desktop' (catalog อาจแสดง cast `::character varying`); ฟิลด์อื่นไม่มี default ที่ไม่ใช่ NULL และ PK เป็น GENERATED ALWAYS AS IDENTITY ทุกตาราง ไม่เติม clock_timestamp() default ให้ UpdateDate โดยอนุมานเอง

Q07 ใช้ UTF-8 MD5 ของบรรทัด `ordinal|name|format_type|notnull|identity|generated|default` เรียง ordinal คั่น LF ไม่มี LF ท้าย; notnull=1/0, identity=a/-, generated=-, absent/NULL default=- และ string default ใช้รูป pg_get_expr รวม cast ชนิด ชื่อและชนิดทุกฟิลด์อยู่ใน [dictionary](../design/data-dictionary/index.md) และ SQL hash ที่ระบุในหลักฐาน หาก hash ต่างให้เทียบ Q03 ทีละฟิลด์ ห้ามแก้ฐานให้ตรงโดยอัตโนมัติ

## ขอบเขตที่ SELECT นี้ไม่พิสูจน์

ไม่อ่านข้อมูลแถวจริง จึงไม่พิสูจน์ uniqueness/tenant/history/PII ในข้อมูล ไม่พิสูจน์ transaction rollback, concurrent writers, application locks, trust หรือการเชื่อม API ต้องให้เจ้าของส่งหลักฐานทดสอบเดิมหรือจัดการทดสอบแยกโดยมนุษย์บนฐานทดสอบที่เหมาะสม ห้ามนำ rollback DROP เดิมไปรันกับฐานที่สร้างแล้วเพื่อทำหลักฐาน

Rollback สำหรับชุดตรวจนี้: ไม่มีการย้อนข้อมูล เพราะทั้งเจ็ด statement เป็น SELECT เท่านั้น ถ้าอ่านไม่สำเร็จให้ส่ง error และสิทธิ์ที่ขาด ไม่รัน GRANT ผ่านชุดนี้

## หลักฐาน

ฐานเปรียบเทียบคือ [schoolbot_db.sql](schoolbot_db.sql) physical Rev7 และ [rollback](schoolbot_db_rollback.sql) เดิม SHA-256 แสดงใน [handoff](dba-095-review.md#หลักฐาน) ผล PostgreSQL 15.19/32 ตารางเป็นข้อมูลที่ใบงานอ้างจาก connection-001.md (memory) ไม่ใช่ catalog actual ที่ตรวจในงานนี้

[Q07: ค่าคาดหวังรายตาราง](dba-003-catalog-fingerprints.md)

