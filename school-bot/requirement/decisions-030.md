# มติถอนคอลัมน์ Version — ใช้ UpdateDate แทน

## คำตอบผู้ใช้ — 2026-10-22

ผู้ตอบ: ผู้ใช้ในแชตนี้ หลังอ่านคำอธิบายเรื่อง optimistic concurrency

"\"Version\" integer NOT NULL DEFAULT 1, เอาออกด้วย น่าจะมีวิธีอื่นนะที่ไม่ใช่วิธีนี้"

## ข้อกำหนดที่ยืนยัน

- ไม่มีคอลัมน์ `Version` ในตาราง SchoolBot ใดๆ (ถอนจาก SQL ทั้งหมด); `SchoolBotAuditEvent` ไม่เก็บ `PreviousVersion`/`NewVersion`
- ยังต้องกันการแก้ทับกัน (lost update) ด้วยวิธีที่ไม่ต้องเพิ่มคอลัมน์

## วิธีที่ MYCELIUM เลือกแทน (สมมติฐาน — ยังไม่ยืนยัน)

- ใช้ system column `xmin` ของ PostgreSQL เป็น concurrency token: ทุกแถวมีอยู่แล้วโดยไม่ต้องสร้างคอลัมน์ และเปลี่ยนเองทุกครั้งที่แถวถูก UPDATE
- EF Core/Npgsql รองรับตรง (`UseXminAsConcurrencyToken` / `[Timestamp] uint xmin`); ระบบเกรดเดิม (score-record) ก็ใช้ `xmin` เป็น row version ตาม proto ที่ SA พบ ([source-review-005](../design/source-review-005.md))
- API ยังใช้ `ETag`/`If-Match` เหมือนเดิม แต่ค่าเป็น xmin; UPDATE ใช้ `WHERE "Id" = @id AND xmin = @expected` → 0 แถว = `412 VERSION_CONFLICT`
- ข้อจำกัด: ค่า xmin เปลี่ยนหลัง dump/restore หรือย้ายเครื่อง — ไม่เป็นปัญหาเพราะ ETag เป็นค่าชั่วคราวระหว่างอ่าน–แก้ ห้ามเก็บ xmin ไว้ถาวรหรือใช้เทียบข้ามเวลานาน
- ทางสำรองถ้าไม่ใช้ xmin: ใช้ `UpdateDate` (timestamptz ระดับ microsecond) เป็น token

## คำตอบเพิ่ม — 2026-10-22

ผู้ใช้: "UpdateDate ใช้อันนี้สิ อุตส่ามีแล้ว"

ยืนยัน: ใช้ `UpdateDate` เป็น concurrency token แทน xmin (ส่วน "วิธีที่ MYCELIUM เลือกแทน" ด้านบนถูกแทนด้วยข้อนี้ เก็บไว้เป็นประวัติ)

- UPDATE ทุกครั้ง: `SET ..., "UpdateDate" = clock_timestamp() WHERE "Id" = @id AND "UpdateDate" = @expected` → 0 แถว = `412 VERSION_CONFLICT`
- API ส่ง `ETag` เป็นค่า UpdateDate แบบ opaque string ที่ server สร้าง (ความละเอียด microsecond ของ timestamptz) และรับกลับทาง `If-Match`; client ห้าม parse เป็นวันที่ (เช่น JS Date ตัดเหลือ millisecond แล้วจะชนกันผิด)
- server เป็นผู้ตั้ง UpdateDate เท่านั้น ห้ามรับจาก client; ใช้ `clock_timestamp()` ไม่ใช่ `now()` เพื่อไม่ได้ค่าซ้ำเมื่อแก้แถวเดิมหลายครั้งใน transaction เดียว
- ไม่ต้องแก้ SQL: `UpdateDate timestamptz NOT NULL` มีอยู่แล้วทุกตาราง
- (สมมติฐาน — ยังไม่ยืนยัน) EF Core ตั้ง `UpdateDate` เป็น `IsConcurrencyToken()` แล้ว set ค่าใหม่ใน SaveChanges

## ผลต่อเอกสาร

- data-model/data-contract-rules/DBML/DES ที่อ้าง `Version`, `If-Match` ของ Version, หรือ `AuditEvent.PreviousVersion/NewVersion` ต้อง amend ให้เป็น UpdateDate — SA (xmin ที่ DES-009 อ้างถึงคือของ writer เดิมใน PGGradeDB ยังคงเดิม)

## Change Log

- 2026-10-22 — ผู้ใช้เลือก UpdateDate เป็น concurrency token แทน xmin
- 2026-10-22 — MYCELIUM ถอน Version 20 จุดและ Previous/NewVersion ใน db/schoolbot_db.sql; Rev5 เดิมที่ db/archive/rev5/
