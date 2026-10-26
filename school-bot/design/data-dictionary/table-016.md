# SchoolBotActivity

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** นิยามหน่วยกิจกรรมที่ผู้เรียนพบในบทเรียน ทั้งการอ่าน โครงงาน Quiz และ Test

**หนึ่งแถว:** กิจกรรมหนึ่งรายการภายใต้ Lesson หนึ่ง; เฉพาะชนิด project จึงอ้าง Mission

**ใช้ตอนไหน/ใครใช้:** แสดงลำดับกิจกรรม; เปิดให้ห้องเรียนทำ; ติดตามผล; เลือกแหล่งคะแนนสำหรับ mapping

**ตัวอย่างสมมติ:** สมมติ: บทหนึ่งมี instruction ตามด้วย project แบบ Block และ quiz

**ขอบเขต:** ข้อมูลส่วนกลาง: SchoolId ต้องเป็น NULL; โรงเรียนใช้เนื้อหาร่วมกัน

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotActivityId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotActivity (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `LessonId` | `integer` | ไม่ได้ | FK ไป SchoolBotLesson เจ้าของกิจกรรม |
| `ActivityKey` | `uuid` | ไม่ได้ | UUID ถาวรของกิจกรรมข้าม curriculum revision |
| `Ordinal` | `integer` | ไม่ได้ | ลำดับกิจกรรมภายใน Lesson; ไม่ซ้ำใน Lesson เดียวกัน |
| `Title` | `jsonb` | ไม่ได้ | ชื่อกิจกรรมหลายภาษาแบบ Text ใช้แสดงให้ผู้เรียนและครูเลือก |
| `Type` | `varchar(16)` | ไม่ได้ | instruction=อ่าน/ดูสื่อ, project=ทำและส่งโครงงาน, quiz=แบบฝึกทดสอบ, test=การสอบ |
| `Mode` | `varchar(16)` | ได้ | block, arm หรือ code เฉพาะ Type=project; null สำหรับ instruction/quiz/test |
| `Indicators` | `jsonb` | ไม่ได้ | JSON รายตัวชี้วัดกลางของกิจกรรม มี indicator_key, code, title; ไม่ใช่ PGTAssessment |
| `Config` | `jsonb` | ไม่ได้ | JSON รายละเอียดตามชนิด: instruction-v1 เก็บคำแนะนำและสื่อ, project-v1 อ้าง mission_id, question-v1 อ้าง bank_id/question_keys/default_policy; policy มีจำนวนครั้ง วิธีเลือกคะแนน เวลาเป็นวินาที เวลาเปิดเฉลย และการสุ่ม |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ; ค่าเริ่มต้นใน DB = NULL |
| `CreateDate` | `timestamptz` | ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server; ค่าเริ่มต้นใน DB = NULL |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy; ค่าเริ่มต้นใน DB = NULL |
| `UpdateDate` | `timestamptz` | ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version; ค่าเริ่มต้นใน DB = NULL |
| `SchoolId` | `integer` | ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์เชิงตรรกะ (ไม่มี SQL FK)

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `LessonId` | [SchoolBotLesson](table-013.md) (`SchoolBotLessonId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotCourseRunActivity](table-020.md) (ActivityId), [SchoolBotAttempt](table-024.md) (ActivityId), [SchoolBotRetakeGrant](table-025.md) (ActivityId)

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[PGTAssessment](legacy-021.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Title`: Text; ชื่อกิจกรรมหลายภาษาแบบ Text ใช้แสดงให้ผู้เรียนและครูเลือก
- `Indicators`: Indicator[]; JSON รายตัวชี้วัดกลางของกิจกรรม มี indicator_key, code, title; ไม่ใช่ PGTAssessment
- `Config`: ActivityConfig; JSON รายละเอียดตามชนิด: instruction-v1 เก็บคำแนะนำและสื่อ, project-v1 อ้าง mission_id, question-v1 อ้าง bank_id/question_keys/default_policy; policy มีจำนวนครั้ง วิธีเลือกคะแนน เวลาเป็นวินาที เวลาเปิดเฉลย และการสุ่ม

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:321) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
