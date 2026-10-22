# หมายเหตุ schema — Rev1

## ขอบเขตและหลักฐาน

ครบ 16 ตารางตาม [data-model.md](data-model.md) รวม TeacherGrant แบบ conditional fallback; ไม่มี SchoolBotUser/Progress/UUID mapping เพิ่ม. DBA ส่งข้อความ handoff ให้ MYCELIUM บันทึก artifact ไม่เขียน/รัน SQL หรือเชื่อม DB.

มติ [decisions-012.md](../requirement/decisions-012.md) ใช้ PK/FK domain int4; Cloud keys ออกโดย server. ResourceId/EntityId เป็น int4. UUID คงเฉพาะ RequestKey/RequestId, logical keys และ embedded IDs. Guest project UUID อยู่ local file. SA amend domain keys เป็น K/int4 แล้ว; ไม่เพิ่ม client UUID column ชดเชย.

ยืนยัน int จาก source: Academic TmasterDbuser.cs:8; School Tuser.cs:8,142 และ Temployee.cs:8,92 (paths เต็มใน [source-review-002.md](../source-review-002.md)). Model/ข้อจำกัด: [data-model.md](data-model.md); invariants: [data-contract-rules.md](data-contract-rules.md); semantics: DES-002/003/004/005/007. Syntax: [DBML](https://dbml.dbdiagram.io/docs/), [TableGroup/Notes](https://dbml.dbdiagram.io/syntax/enrichment-visualization/).

## Placement และ integrity

เสนอทุกตารางอยู่ School DB เดียวเพื่อ commit domain+idempotency+audit; Master/School/Logs/PGGradeDB เป็น connections คนละ DB ไม่ใช่ schemas; ไม่เพิ่ม DB5. public ใช้เพื่อ diagram เท่านั้น ต้องยืนยัน physical schema/keys ก่อน DDL. ไม่วาด legacy tables/cross-DB FK; account/profile link ยังต้องพิสูจน์.

Composite refs มี unique target ตรงชุด: current binding อยู่ License/School เดียวกัน; criteria อยู่ mission เดียวกัน; current/superseded assessment อยู่ submission เดียวกัน. Project current revision เกิดวง FK: DDL ภายหลังต้อง defer current-pointer validation และสร้างสองแถวใน transaction เดียว.

Owner/Profile เป็น polymorphic; ใช้ SchoolId+kind+legacy ID ตรวจใน trusted adapter ห้าม FK ไปสอง profile พร้อมกัน. ResourceId/EntityId ไม่มี FK เพราะเลือกชนิดตาม operation/entity type.

## สิ่งที่ diagram ยังไม่บังคับ

- Global SchoolId=null ได้เฉพาะ Release และ Idempotency/Audit operation กลางที่เสนอ; unique ปกติยังกัน global ซ้ำไม่ได้ ต้องเลือก NULLS NOT DISTINCT ตาม DB version หรือ partial unique แยกภายหลัง.
- Binding ที่ยังไม่ detached ต้องมีหนึ่งเดียว; TeacherGrant ต้อง live unique. วาดเพียง lookup index เพราะ DBML ไม่มี partial predicate; ต้องยืนยันนิยาม live/soft delete ไม่ให้สิทธิ์หรือ binding ซ้อน.
- ต้อง enforce bounds, session null-pair/expiry, approvals, ownership/mode, immutable revisions/published content, latest assessment/no supersedes cycle, lease และ atomic commit เพิ่ม. FK/Note ไม่ตรวจเงื่อนไขเหล่านี้.
- ไม่มี cascade delete; soft delete ห้ามทำลาย snapshot/ผล/ประวัติหรือคืน unique. Audit append-only; replay หมดอายุลบเฉพาะ ciphertext คง tombstone; retention ต้องตกลงก่อน.
- JSONB ต้อง validate ตาม DES; Manifest คง signed JWS string; encrypted response เป็น bytea; timestamp เป็น UTC. Enum ในภาพเป็น logical values. DBML export ไม่เท่ากับ production DDL.
- Index ที่ระบุ Proposed อิง list/progress/queue queries; unique tenant pairs รองรับ FK แต่เพิ่ม write/storage cost ต้องวัดก่อน production. int4 มีเพดาน 2,147,483,647 โดยเฉพาะ revision/audit/idempotency ต้องวาง capacity.

## ตรวจและส่งต่อ

ตรวจครบ fields/common columns, nullable และ FK target keys เชิงโครงสร้าง; ยังไม่ได้ทดสอบด้วย dbdiagram parser/live UI และไม่มี DB/build/hardware tests. SQL/migration/rollback อยู่นอกงานนี้.

SA รับไป amend types/API และยืนยัน constraints/placement; sec ต้องพิจารณา encryption/masking, access และ retention ของ profile IDs, งานนักเรียน, feedback, actors/device identifiers และ replay ciphertext. มนุษย์อนุมัติ schema/fallback/global rows ก่อน implementation; ไม่มีการขออนุมัติ diagram ซ้ำ.

## ผลตรวจ artifact โดย MYCELIUM

- ตรวจด้วย @dbml/core 10.3.1 ผ่านทั้ง `dbml` และ `dbmlv2`: 16 ตาราง, 243 คอลัมน์, 14 composite refs; PK ทุกตารางเป็น int4 และมี common columns ครบ
- เปลี่ยน Note ใน TableGroup เป็น comment เพื่อ compatibility ของ parser โดยคง note ระดับตารางและ schema เดิม
- เปิดไฟล์ `schoolbot.dbml` แล้วนำเข้า/วางใน dbdiagram.io; ไม่ต้องใช้ไฟล์ Markdown นี้เป็น DBML และไม่ต้องรัน SQL
- การ parse ผ่านเป็นการตรวจ artifact ไม่ใช่การอนุมัติ production schema; syntax อ้าง [DBML documentation](https://dbml.dbdiagram.io/docs/)

## Change Log

- 2026-10-21 — MYCELIUM บันทึกผล SA/DBA, ตรวจ parser ทั้งสองแบบ และคงส่วนที่ต้องทบทวนใน index

- 2026-10-21 — จัดทำ diagram handoff ตามมติ PK int4 โดยไม่แก้ไฟล์หรือฐานข้อมูล.
