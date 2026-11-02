# SchoolBotQuestionBank

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บคลังข้อสอบกลางเป็นฉบับ เพื่อให้ Quiz/Test ใช้ข้อสอบและเฉลยที่ตรวจสอบย้อนหลังได้

**หนึ่งแถว:** หนึ่ง revision ของคลังข้อสอบหนึ่งชุด

**ใช้ตอนไหน/ใครใช้:** ส่วนกลางสร้าง/อนุมัติคลัง; Activity เลือกข้อ; Attempt snapshot คัดลอกข้อที่ใช้จริง

**ตัวอย่างสมมติ:** สมมติ: คลัง ลำดับคำสั่ง revision 1 มีข้อเลือกตอบและข้อถูก/ผิด

**ขอบเขต:** ข้อมูลส่วนกลาง: SchoolId ต้องเป็น NULL; โรงเรียนใช้เนื้อหาร่วมกัน

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotQuestionBankId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotQuestionBank (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `BankKey` | `uuid` | ไม่ได้ | UUID ของคลังข้อสอบที่คงเดิมข้าม revision |
| `Revision` | `integer` | ไม่ได้ | เลขฉบับคลัง; เผยแพร่แล้วไม่ย้อนแก้ข้อสอบที่ Attempt เคยใช้ |
| `Title` | `jsonb` | ไม่ได้ | ชื่อคลังข้อสอบหลายภาษาแบบ Text |
| `Questions` | `jsonb` | ไม่ได้ | JSON array ของข้อสอบ มี question_key, kind, prompt, options, correct_option_keys และ max_score; kind รองรับ single_choice/boolean, คะแนนเต็มเป็น DecimalString มากกว่า 0 และเฉลยไม่ส่งให้ผู้เรียนก่อนเวลาที่อนุญาต |
| `SourceRef` | `varchar(2048)` | ไม่ได้ | แหล่งอ้างอิงข้อสอบสำหรับตรวจที่มาและความถูกต้อง |
| `Lifecycle` | `varchar(16)` | ไม่ได้ | draft=ร่าง, published=เผยแพร่ผ่านการอนุมัติ, retired=เลิกใช้ใหม่แต่คงประวัติ |
| `PublishedAt` | `timestamptz` | ได้ | เวลา UTC เผยแพร่คลัง; null เมื่อยังไม่มีการเผยแพร่ และต้องมีค่าเมื่อ published |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ; ค่าเริ่มต้นใน DB = NULL |
| `CreateDate` | `timestamptz` | ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server; ค่าเริ่มต้นใน DB = NULL |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy; ค่าเริ่มต้นใน DB = NULL |
| `UpdateDate` | `timestamptz` | ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version; ค่าเริ่มต้นใน DB = NULL |
| `SchoolId` | `integer` | ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์เชิงตรรกะ (ไม่มี SQL FK)

ตารางนี้ไม่มี Foreign Key ขาออกใน SQL; การอ้างบัญชี/โรงเรียน/ผู้เรียนเดิมหรือรหัสใน JSON ต้องตรวจผ่าน application

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Title`: Text; ชื่อคลังข้อสอบหลายภาษาแบบ Text
- `Questions`: Question[]; JSON array ของข้อสอบ มี question_key, kind, prompt, options, correct_option_keys และ max_score; kind รองรับ single_choice/boolean, คะแนนเต็มเป็น DecimalString มากกว่า 0 และเฉลยไม่ส่งให้ผู้เรียนก่อนเวลาที่อนุญาต

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:341) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ
