# SchoolBotIdempotency

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** จำผลคำสั่งเพื่อให้การส่งคำขอซ้ำไม่สร้างข้อมูลหรือทำธุรกรรมซ้ำ

**หนึ่งแถว:** ผลคำสั่งหนึ่งชุด ภายใต้โรงเรียน ผู้กระทำ Operation และ RequestKey เดียวกัน

**ใช้ตอนไหน/ใครใช้:** API mutation ตรวจคำขอซ้ำ บันทึกผลร่วมกับ domain transaction และคืนผล replay

**ตัวอย่างสมมติ:** สมมติ: บันทึกโครงงานสำเร็จแต่เครือข่ายขาด การ retry ด้วย RequestKey เดิมได้รับผลเดิม

**ขอบเขต:** รองรับทั้งส่วนกลาง (SchoolId=NULL) และรายโรงเรียน (SchoolId>0)

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotIdempotencyId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotIdempotency (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `Principal` | `varchar(512)` | ไม่ได้ | ตัวตนผู้เรียกแบบมีชนิดและขอบเขต เช่น account, web, staff, device หรือ service; ไม่ใช่เลขผู้ใช้เดี่ยว |
| `Operation` | `varchar(200)` | ไม่ได้ | ชื่อ operation ที่แยกขอบเขตคำสั่ง เช่น การสร้าง resource คนละประเภทต้องไม่ใช้ผลแทนกัน |
| `RequestKey` | `uuid` | ไม่ได้ | UUID จาก Idempotency-Key ใช้ระบุคำสั่งเดิมขณะ retry |
| `RequestHash` | `varchar(64)` | ไม่ได้ | SHA-256 ของ request ที่ทำ canonical แล้ว; Key เดิมแต่เนื้อหาต่างต้องเป็น conflict |
| `NonceHash` | `varchar(64)` | ได้ | hash ของ nonce สำหรับกัน replay ของ device challenge; null เมื่อ operation ไม่ใช้ nonce |
| `HttpStatus` | `integer` | ไม่ได้ | HTTP status ของผลที่บันทึกไว้สำหรับ replay ตามสัญญาช่วง 100–599 |
| `ResultCipher` | `bytea` | ได้ | response ที่เข้ารหัสเป็น bytes; null เมื่อไม่มี ciphertext ให้ replay รวมกรณีล้างหลังหมดอายุ |
| `ResultKeyId` | `varchar(128)` | ได้ | ชื่ออ้างอิงกุญแจที่ใช้เข้ารหัส ResultCipher ไม่ใช่ตัวกุญแจ; null พร้อม ResultCipher |
| `ResourceId` | `integer` | ได้ | PK ของ SchoolBot resource หลักที่ operation สร้างหรือคืน; null เมื่อไม่มี resource ที่ระบุได้ โดยชนิดตารางต้องดู Operation |
| `CompletedAt` | `timestamptz` | ไม่ได้ | เวลา UTC ที่คำสั่งเสร็จและบันทึกผล |
| `ReplayUntil` | `timestamptz` | ไม่ได้ | เวลา UTC สิ้นสุดช่วง replay response ที่เข้ารหัส; สัญญากำหนด 24 ชั่วโมง หลังจากนั้นยังเก็บ tombstone กันทำซ้ำ |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ; ค่าเริ่มต้นใน DB = NULL |
| `CreateDate` | `timestamptz` | ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server; ค่าเริ่มต้นใน DB = NULL |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy; ค่าเริ่มต้นใน DB = NULL |
| `UpdateDate` | `timestamptz` | ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version; ค่าเริ่มต้นใน DB = NULL |
| `SchoolId` | `integer` | ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์เชิงตรรกะ (ไม่มี SQL FK)

ตารางนี้ไม่มี Foreign Key ขาออกใน SQL; การอ้างบัญชี/โรงเรียน/ผู้เรียนเดิมหรือรหัสใน JSON ต้องตรวจผ่าน application

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/build/db/schoolbot_db.sql:86) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ
