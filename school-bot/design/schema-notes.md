# หมายเหตุ schema

> Rev 7 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

อ่าน [คู่มือ DBML](dbml-guide-001.md) สำหรับแบบเต็ม Rev7 และภาพ integration ที่เลือกเฉพาะจุดเชื่อมตารางเดิม; ชนิดของเส้นและจำนวนตารางในสองภาพต่างกันตามขอบเขตภาพ ไม่ได้เพิ่ม schema

## ขอบเขตและหลักฐาน

ครบ **32 ตาราง** ตาม [data-model.md](data-model.md) Rev8, [db/schoolbot_db.sql](../db/schoolbot_db.sql) และผลตรวจการตัดทอนที่ระบุท้ายไฟล์ ภายใต้[มติ 026 (อนุมัติแบบข้อมูลที่ปรับใหม่)](../requirement/decisions-026.md) ถึง [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md) (ตาราง `SchoolBotTeacherGrant` เป็นทางสำรองตาม [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md) ที่ยังไม่ได้ตัดสินให้สร้าง จึงไม่รวมใน 32 ตารางของ SQL และ DBML).

คงไว้ในไฟล์ [schoolbot.dbml](schoolbot.dbml) ไฟล์เดียวเพื่อให้คัดลอกหรือนำเข้าไปเปิดใน [dbdiagram.io](https://dbdiagram.io) ได้ครบทั้ง 32 ตาราง (PRIMARY KEY 32 รายการ; ไม่มี FOREIGN KEY) ทันทีโดยไม่ต้องรวมไฟล์เอง.

[มติ 012 (PK int4 และไฟล์ DBML)](../requirement/decisions-012.md) ใช้ PK/FK domain `int4`; Cloud keys ออกโดย server (`GENERATED ALWAYS AS IDENTITY`). `ResourceId`/`EntityId` เป็น `int4` ส่วน `SchoolBotScoreOutbox.ReceiptId` เป็น `int8` (`bigint`) อ้าง `PGTGradeAuditLog.GradeAuditLogId` แบบ logical. UUID คงเฉพาะ `RequestKey`/`RequestId`, `OperationKey`, logical keys (`*Key`) และ embedded IDs.

ตาม [มติ 028 (ชนิดคอลัมน์ CreateBy/UpdateBy)](../requirement/decisions-028.md) คอลัมน์ `CreateBy` และ `UpdateBy` ของทุกตารางเป็น `integer NULL` (`int4 null` — เก็บ `sEmp` ของพนักงาน/ครู หรือ `sId` ของนักเรียน; `NULL` = ระบบทำเอง). ตาม [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md) ถอนคอลัมน์ `Version` ออกจากทุกตารางและถอน `PreviousVersion`/`NewVersion` ออกจาก `SchoolBotAuditEvent` โดยใช้ `UpdateDate` (ที่ server ตั้งด้วย `clock_timestamp()`) เป็น optimistic concurrency token (`ETag`/`If-Match` แบบ opaque string).

ชนิดข้อมูล legacy อ้างผลอ่าน source ของ Academic, School และ PGGradeDB ตาม [ผลตรวจ source](source-review-002.md) และหลักฐานท้ายไฟล์

ชนิดข้อมูล identity, nullability/default และสถานะการบังคับกฎยึด [ฐานสัญญาปัจจุบัน](data-model.md) คอลัมน์อื่นยังคงเงื่อนไขเดิม รายละเอียดข้อจำกัด SQL อยู่ด้านล่าง

CreateBy/CreateDate/UpdateBy/UpdateDate ทุกตารางรับ NULL และ DEFAULT NULL ตามคำสั่งผู้ใช้ 2026-10-26; application เป็นผู้กำหนดค่าจาก server เมื่อเขียนข้อมูล

## ตำแหน่งและความถูกต้องของข้อมูล

อ่าน [ตำแหน่งฐานข้อมูลและขอบเขตการอ้างอิง](schema-notes-placement.md) สำหรับการแยก connection, re-check ก่อน commit, ตาราง global/tenant, คอลัมน์ที่ถอน และ profile แบบ polymorphic

## ข้อจำกัดของร่าง SQL ปัจจุบัน

- ถอน standalone unique indexes 13 ตัว; กฎ binding, release, idempotency/nonce, staff role, active run/successor, ownership/mapping และ finalized proposal/successor คงเดิมผ่าน application/repository transaction locks ตาม [กฎข้อมูลร่วม](data-contract-rules.md) โดยต้อง serialize logical scope เดียวกันแม้ยังไม่มีแถว
- คงเฉพาะ PRIMARY KEY; DBML ไม่มี UNIQUE markers/index blocks/physical refs. ความสัมพันธ์เดิมแสดงใน dictionary และภาพ integration แบบ logical-only
- ยอด declaration ปัจจุบัน: PRIMARY KEY 32 รายการ, UNIQUE 0, FK 0, CHECK 0; standalone indexes 0. PostgreSQL ยังสร้าง backing indexes ของ PRIMARY KEY 32 รายการ
- การบังคับทดแทนด้วย application/repository locks: NOT_IMPLEMENTED — ไม่มี runtime evidence; SQL ยังคง DRAFT ไม่ได้รัน
- **คอลัมน์ Array และ Enum**:
  - `SchoolBotCourseRun.PlanCourseIds` ยังคง integer[] ใน SQL และ DBML; จำนวนสมาชิก/NULL ใน array/ค่าซ้ำเป็นกฎฝั่งแอป ไม่มี CHECK บังคับ
  - ค่าประเภท/สถานะเดิมเป็น allowed values ของแอป; SQL และ DBML ใช้ varchar เดิม ไม่มี enum type หรือ CHECK จำกัดค่า

## สถานะการอนุมัติและสิ่งที่ยังรอ

- **อนุมัติแล้ว**: Logical/physical baseline 32 ตารางบน SchoolBot DB (`10.0.0.128:9499`), `CreateBy`/`UpdateBy` เป็น `integer NULL`, การไม่แตะ School DB/PGGradeDB ด้วย GRANT และการใช้ `UpdateDate` แทน `Version` ตาม [มติ 026 (อนุมัติแบบข้อมูลที่ปรับใหม่)](../requirement/decisions-026.md) ถึง [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md) และผลตรวจที่ระบุท้ายไฟล์
- **ตัดสินแล้ว**: ผู้ใช้เลือกทาง A สำหรับการป้องกัน `LearnerId` ครู/นักเรียนชนกัน ตาม [มติ 032 (ผลทดลองของครูและ cardinality/การล็อก mapping คะแนน)](../requirement/decisions-032.md); การปรับ authorization ยังเป็นงานที่ต้องทำ
- **ยังไม่อนุมัติ / รอประตูมนุษย์**:
  - การรัน `db/schoolbot_db.sql` บนฐานทดสอบโดยมนุษย์และส่งผลให้ [DBA-003 (Core evidence — ตรวจหลักฐานฐานข้อมูล)](../plan/index.md) ตรวจ

  - การเปิดเขียนคะแนนลง PGGradeDB (รอผ่าน release gates ทั้งห้า `G-PARITY`, `G-COEXIST`, `G-TARGET`, `G-AUTHZ`, `G-DB` ของ [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](des-009.md))
  - การเปิด endpoint `web-principal` ใน gateway และ config `H5`

## ยังไม่ยืนยัน

ชื่อ database `SchoolBot` เป็นชื่อในแบบเดิม ต้องยืนยันด้วย configuration หรือ catalog จริง

## หลักฐาน

- `db/review-005.md` (memory)
- `db/review-001.md` (memory)
- `db/proposal-learnerkind.md` (memory)
- `TmasterDbuser.cs:8`
- `Tuser.cs:8,142`
- `Temployee.cs:8,92`

- Academic: `TmasterDbuser.cs:8`
- School: `Tuser.cs:8,142`, `Temployee.cs:8,92`, `TPlanCourse`, `TPlanCourseTeacher`, `TTerm`
- PGGradeDB: `Pgtgrade.cs`, `PgtgradeDetail.cs`, `Pgtassessment.cs`, `PgtgradeAuditLog.cs`
- [BL-001 (ปรับยอด declaration ให้ตรง SQL และผลตรวจ)](../backlog.md): อ้างในประวัติ Rev5; งานเรียบเรียงนี้ไม่เปลี่ยนยอด
