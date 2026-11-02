# SchoolBotRelease

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บรายการรุ่นซอฟต์แวร์และ manifest ที่ลงนามสำหรับตรวจสอบไฟล์ติดตั้ง

**หนึ่งแถว:** หนึ่งเวอร์ชัน ต่อ channel ต่อ platform ใน catalog กลางหรือของโรงเรียนหนึ่ง

**ใช้ตอนไหน/ใครใช้:** ผู้เผยแพร่สร้าง/เผยแพร่/ถอนรุ่น; Desktop ตรวจอัปเดตและตรวจความน่าเชื่อถือก่อนติดตั้ง

**ตัวอย่างสมมติ:** สมมติ: รุ่น 2.1.0 ช่อง stable สำหรับ windows-amd64

**ขอบเขต:** รองรับทั้งส่วนกลาง (SchoolId=NULL) และรายโรงเรียน (SchoolId>0)

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotReleaseId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotRelease (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `VersionText` | `varchar(32)` | ไม่ได้ | เลขรุ่นซอฟต์แวร์รูป x.y.z เช่น 2.1.0; ไม่ใช่ concurrency token |
| `Channel` | `varchar(16)` | ไม่ได้ | ช่องแจกจ่าย stable สำหรับรุ่นปกติ หรือ beta สำหรับรุ่นทดลอง |
| `Platform` | `varchar(32)` | ไม่ได้ | ระบบและสถาปัตยกรรมที่ไฟล์รองรับ: windows-amd64, darwin-amd64 หรือ darwin-arm64 |
| `Manifest` | `varchar(16384)` | ไม่ได้ | ข้อความ JWS ที่ลงนามแล้ว ระบุ release ID, URL, SHA-256, ขนาดเป็น bytes, ชนิด package, OS ขั้นต่ำ และข้อมูล engine ตาม DES-007 |
| `ArtifactHash` | `varchar(64)` | ไม่ได้ | SHA-256 ของไฟล์แจกจ่ายหลัง signing/notarization ใช้ตรวจว่าไฟล์ตรงกับรุ่นที่ประกาศ |
| `Lifecycle` | `varchar(16)` | ไม่ได้ | draft=ร่าง, published=เผยแพร่ให้ใช้, withdrawn=ถอนจากการแจกจ่าย |
| `PublishedAt` | `timestamptz` | ได้ | เวลา UTC ที่เผยแพร่; null เมื่อยังไม่มีเวลาเผยแพร่ และต้องมีค่าเมื่อ Lifecycle=published |
| `WithdrawnAt` | `timestamptz` | ได้ | เวลา UTC ที่ถอนรุ่น; null เมื่อยังไม่มีการถอน ไม่ใช่หลักฐานว่าถอน binary ที่ติดตั้งไปแล้ว |
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

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:65) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ
