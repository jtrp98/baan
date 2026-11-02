# สัญญาอ้างอิง — ชนิดและกฎร่วม

[กลับคู่มือ](../data-model.md) · [สารบัญสัญญา](contract-index.md)

ข้อความจาก data-model Rev5 คงชื่อฟิลด์ ชนิด และกฎเดิม ใช้คู่กับคำอธิบายรายตาราง

## ชนิดและกฎร่วม

`K` = PostgreSQL int4, 1–2147483647; `U` = UUID ที่ไม่ใช่ table key; `N` = integer ≥1; `B` = boolean; `Tn` = Unicode string ยาวไม่เกิน n; `D` = UTC instant (`timestamptz`); `H` = SHA-256 hex 64 ตัว; `?` = nullable; `[]` = array; ค่าอื่น non-null ไม่มี implicit default

`I` = signed int32; `S` = SchoolId:I (JSON integer); ชนิดยืนยันจาก source ([source-review-002.md](../source-review-002.md) และ `db/review-001.md` (memory))

`DecimalString` = JSON string ของเลขฐานสิบไม่ติดลบ ไม่มี exponent/เครื่องหมายบวก ไม่เกิน 6 ตำแหน่งทศนิยม; เก็บคะแนนใน DB เป็น `numeric(18,6)` (และเกณฑ์เลื่อน Level เป็น `numeric(9,6)` ช่วง `0..100`); ค่าติดลบ/NaN/Infinity ถูกปฏิเสธ; API ไม่ใช้ float สำหรับคะแนนหรือน้ำหนัก; `weight_bps` เป็น `int4` ช่วง `0..10000`

Legacy term identifier (`NTerm`) ใช้ `T64` ไม่ใช่ `K` หรือเลขภาคเรียนที่เดาเอง; PGGradeDB `GradeAuditLogId` (`ReceiptId`) เป็น `int8` (`bigint`) และส่งใน API เป็น decimal string

`P={school_id:S,kind:student|employee,profile_id:I}`; student → `TUser(SchoolId,SId)`, employee → `TEmployees(SchoolId,SEmp)`. `AccountId:I` → `TMasterDBUser.sID` แยกจาก `P`; ห้ามเดา link

`A` = string ≤512:
- ช่อง `desktop`: `account:<S>:<AccountId>:none` ก่อนเลือก `P` หรือ `account:<S>:<AccountId>:<kind>:<profile_id>` หลังเลือก (`kind` เป็น `student` หรือ `employee` ตาม decisions-025/026)
- ช่อง `school_web`: `web:<S>:employee:<I>` หรือ `web:<S>:admin:<T64>`
- ช่อง `staff_admin`: `staff:<S>:<I>`
- อุปกรณ์/บริการ: `device:<H>`, `service:<name>`
โดย integer ใช้ canonical decimal และ `name` ตรง `[A-Za-z0-9._-]{1,128}` จาก server เท่านั้น

CreateBy/CreateDate/UpdateBy/UpdateDate ทุกตารางรับ NULL และมี DEFAULT NULL ตามคำสั่งผู้ใช้ 2026-10-26; ฐานข้อมูลไม่เติมวันเวลาให้อัตโนมัติ การกำหนดค่าจาก server ยังเป็นหน้าที่ application

**ทุกตาราง** ด้านล่างมี common columns จริง 6 คอลัมน์ (ไม่มีคอลัมน์ `Version` — optimistic concurrency ใช้ `UpdateDate` ที่ server ตั้งด้วย `clock_timestamp()` เป็น opaque `ETag`/`If-Match` ตาม [decisions-030](../../requirement/decisions-030.md)):

| Column | ชนิด/กฎ |
|---|---|
| IsDelete | B; เริ่ม false; soft delete โดย authorized operation |
| CreateBy | I?; server กำหนด — `sEmp` ของพนักงาน/ครู หรือ `sId` ของนักเรียนที่ทำรายการ; `null` = ระบบทำเอง (เช่น ตัวตรวจอัตโนมัติ, worker, งานตามกำหนด หรือ legacy admin ที่ไม่มี `sEmp`); ชนิดผู้ทำเต็มอยู่ใน `SchoolBotAuditEvent.Actor` ตาม [decisions-028](../../requirement/decisions-028.md) |
| CreateDate | D?; DEFAULT NULL ใน DB; server UTC เมื่อ application กำหนด |
| UpdateBy | I?; เริ่มเท่ากับ CreateBy; กฎเดียวกับ CreateBy |
| UpdateDate | D?; DEFAULT NULL ใน DB; เมื่อ application กำหนดจะเริ่มเท่ากับ CreateDate; ทุกการ UPDATE ต้องตั้งด้วย `clock_timestamp()` บน server และใช้เป็น concurrency token (`ETag`/`If-Match`) ตาม [decisions-030](../../requirement/decisions-030.md) |
| SchoolId | S?; non-null (`SchoolId > 0`) ยกเว้น global rows ที่กำหนดให้ `SchoolId = null` ด้านล่าง |

ทุกตาราง SchoolBot มี PK `SchoolBot<Entity>Id:K` ที่ server จัดสรร (`GENERATED ALWAYS AS IDENTITY`); ไม่มี SQL FOREIGN KEY. ฟิลด์อ้างอิงเดิมยังเก็บ int4 และ application ต้องตรวจแถวแม่ SchoolId และบริบทเอง; CurrentRevision อ้าง ProjectId/Revision เชิงตรรกะ ไม่ใช่ composite FK

`K` เป็น JSON integer; create ไม่รับ PK จาก client และคืน `K` หลัง commit เท่านั้น ห้าม wrap/reuse เมื่อเต็ม; `CurrentRevision`, `Revision`, `Sequence`, `BindingEpoch` เป็น `N` ไม่ใช่ row ID

Default reads ตัด `IsDelete=true`; unique keys ที่ระบุไม่ถูกคืนให้ใช้ใหม่เมื่อ soft delete เว้นแต่ระบุ “live” ห้าม cascade hard delete ผลเรียน/ประวัติ/receipt; Immutable rows ไม่แก้ business fields หลังสร้าง


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
