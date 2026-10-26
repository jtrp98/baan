# SchoolBotSession

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บ session เข้าใช้งานที่หมดอายุและเพิกถอนได้ โดยใช้บัญชีเดิม; ไม่ใช่ SchoolBotUser

**หนึ่งแถว:** หนึ่ง session สำหรับช่องทางหนึ่งและโรงเรียนหนึ่ง

**ใช้ตอนไหน/ใครใช้:** Desktop login/bind profile; เว็บแลก token; API ตรวจ session; logout/revoke

**ตัวอย่างสมมติ:** สมมติ: บัญชี Master เลข 900 เลือก profile นักเรียนเลข 120 ของโรงเรียน ก; AccountId และ ProfileId มีหน้าที่คนละอย่าง

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotSessionId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotSession (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `Channel` | `varchar(16)` | ไม่ได้ | desktop=เรียน/ทดลอง, school_web=งานโรงเรียน, staff_admin=งานส่วนกลาง; ใช้จำกัด endpoint ที่เรียกได้; ค่าเริ่มต้นใน SQL = 'desktop' |
| `AccountId` | `integer` | ได้ | รหัสบัญชี TMasterDBUser.sID; Desktop ต้องมีค่า ส่วนช่องเว็บอาจ null; ห้ามถือว่าเท่ากับ TUser.sID หรือ TEmployees.sEmp |
| `TokenHash` | `varchar(64)` | ไม่ได้ | SHA-256 ของ opaque access token สำหรับค้นหา session; ไม่เก็บ raw token |
| `ProfileKind` | `varchar(16)` | ได้ | student หรือ employee เพื่อเลือกชนิด profile; null พร้อม ProfileId ก่อน Desktop bind หรือกรณี legacy admin ที่ไม่มี employee profile |
| `ProfileId` | `integer` | ได้ | รหัส TUser.sID เมื่อ kind=student หรือ TEmployees.sEmp เมื่อ kind=employee ใช้ SchoolId ประกอบเสมอ; null พร้อม ProfileKind |
| `LegacyAdminId` | `varchar(64)` | ได้ | รหัสผู้ดูแลเดิมจากตัวตนเว็บที่ตรวจแล้ว เมื่อใช้กรณี legacy admin; null เมื่อไม่มีรหัสนี้ ห้ามแปลงเป็น sEmp เอง |
| `DeviceJkt` | `varchar(64)` | ได้ | ลายนิ้วมือ device key ที่ผูก session Desktop; ต้องมีใน desktop และต้อง null ใน school_web/staff_admin |
| `SourceTokenExpiresAt` | `timestamptz` | ได้ | เวลา UTC หมดอายุของ token เว็บต้นทาง; null เมื่อไม่มีเวลา exp จากต้นทางหรือช่องทางนั้นไม่ใช้ token เว็บ |
| `ExpiresAt` | `timestamptz` | ไม่ได้ | เวลา UTC ที่ session SchoolBot หมดอายุ แม้ token ต้นทางไม่มี exp ก็ยังต้องมีอายุ session นี้ |
| `RevokedAt` | `timestamptz` | ได้ | เวลา UTC ที่เพิกถอน session เช่น logout; null หมายถึงยังไม่มีการเพิกถอน แต่ session อาจหมดอายุแล้ว |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ; ค่าเริ่มต้นใน DB = NULL |
| `CreateDate` | `timestamptz` | ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server; ค่าเริ่มต้นใน DB = NULL |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy; ค่าเริ่มต้นใน DB = NULL |
| `UpdateDate` | `timestamptz` | ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version; ค่าเริ่มต้นใน DB = NULL |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์เชิงตรรกะ (ไม่มี SQL FK)

ตารางนี้ไม่มี Foreign Key ขาออกใน SQL; การอ้างบัญชี/โรงเรียน/ผู้เรียนเดิมหรือรหัสใน JSON ต้องตรวจผ่าน application

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[TMasterDBUser](legacy-001.md) · [masterdb_schema.TCompany](legacy-003.md) · [TUser](legacy-004.md) · [TEmployees](legacy-005.md) · [TPlanCourseTeacher](legacy-010.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:135) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
