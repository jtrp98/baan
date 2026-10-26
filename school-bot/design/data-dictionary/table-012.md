# SchoolBotCurriculum

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บหลักสูตรกลางเป็นราย revision เพื่อให้แต่ละห้องเลือกใช้เนื้อหาฉบับแน่นอน

**หนึ่งแถว:** หนึ่ง revision ของหลักสูตรหนึ่งสำหรับ Level หนึ่ง

**ใช้ตอนไหน/ใครใช้:** ส่วนกลางสร้างร่าง/อนุมัติเผยแพร่; โรงเรียนเลือกเปิด CourseRun; ผู้เรียนอ่านบทเรียน

**ตัวอย่างสมมติ:** สมมติ: หลักสูตร Beginner revision 2 มีทั้งกิจกรรม Block, Arm และ Quiz

**ขอบเขต:** ข้อมูลส่วนกลาง: SchoolId ต้องเป็น NULL; โรงเรียนใช้เนื้อหาร่วมกัน

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotCurriculumId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotCurriculum (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `CurriculumKey` | `uuid` | ไม่ได้ | UUID ของหลักสูตรที่คงเดิมข้าม revision |
| `Revision` | `integer` | ไม่ได้ | เลขฉบับหลักสูตร; คู่ CurriculumKey/Revision ไม่ซ้ำ และฉบับเผยแพร่แล้วไม่ย้อนแก้เนื้อหา |
| `LevelId` | `integer` | ไม่ได้ | FK ไป SchoolBotLevel ของหลักสูตรฉบับนี้ |
| `Title` | `jsonb` | ไม่ได้ | ชื่อหลักสูตรหลายภาษาแบบ Text ใช้แสดงรายการและหัวหลักสูตร |
| `RecommendedGrades` | `jsonb` | ไม่ได้ | JSON array ระดับชั้นที่แนะนำ เช่น ป.4; เป็นคำแนะนำ ไม่ใช่เงื่อนไขห้ามชั้นอื่นเรียน |
| `Subjects` | `jsonb` | ไม่ได้ | JSON รายวิชากลาง แต่ละรายการมี subject_key, code, title; ไม่ใช่รหัส TPlane ของโรงเรียน |
| `SourceRef` | `varchar(2048)` | ไม่ได้ | แหล่งอ้างอิงเนื้อหา เช่น Course Plan หรือเอกสารต้นทาง เพื่อย้อนตรวจที่มา |
| `Lifecycle` | `varchar(16)` | ไม่ได้ | draft=กำลังจัดทำ, published=อนุมัติให้เลือกใช้, retired=เลิกให้เลือกใช้ใหม่โดยยังเก็บประวัติ |
| `PublishedAt` | `timestamptz` | ได้ | เวลา UTC เผยแพร่หลักสูตร; null เมื่อยังไม่มีการเผยแพร่ และต้องมีค่าเมื่อ published |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `LevelId` | [SchoolBotLevel](table-010.md) (`SchoolBotLevelId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotLesson](table-013.md) (CurriculumId), [SchoolBotCourseRun](table-018.md) (CurriculumId), [SchoolBotLevelProposal](table-032.md) (TargetCurriculumId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[TPlane](legacy-006.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Title`: Text; ชื่อหลักสูตรหลายภาษาแบบ Text ใช้แสดงรายการและหัวหลักสูตร
- `RecommendedGrades`: รายการรหัสชั้นที่แนะนำ; JSON array ระดับชั้นที่แนะนำ เช่น ป.4; เป็นคำแนะนำ ไม่ใช่เงื่อนไขห้ามชั้นอื่นเรียน
- `Subjects`: CurriculumSubject[]; JSON รายวิชากลาง แต่ละรายการมี subject_key, code, title; ไม่ใช่รหัส TPlane ของโรงเรียน

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:372) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
