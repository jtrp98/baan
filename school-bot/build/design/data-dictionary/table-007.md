# SchoolBotStaffRole

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** กำหนดสิทธิ์งานส่วนกลางให้พนักงาน SchoolBright เป็นรายบทบาท

**หนึ่งแถว:** สิทธิ์หนึ่งบทบาทของพนักงานหนึ่งคนในโรงเรียนต้นสังกัดหนึ่ง

**ใช้ตอนไหน/ใครใช้:** ผู้ดูแลมอบ/ถอนสิทธิ์; admin API ตรวจบทบาทและช่วงเวลาที่มีผล

**ตัวอย่างสมมติ:** สมมติ: พนักงานคนหนึ่งเป็น content_author แต่อีกคนเป็น content_approver

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotStaffRoleId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotStaffRole (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `EmployeeId` | `integer` | ไม่ได้ | TEmployees.sEmp ของผู้รับสิทธิ์ ใช้ร่วมกับ SchoolId ต้นสังกัด ไม่ใช่ Master AccountId |
| `Role` | `varchar(32)` | ไม่ได้ | content_author=สร้างเนื้อหา, content_approver=อนุมัติเนื้อหา, level_policy_admin=ตั้งเกณฑ์ Level, license_admin=จัดการ License, release_publisher=เผยแพร่ซอฟต์แวร์, dashboard_viewer=ดู dashboard, staff_admin=จัดการสิทธิ์ส่วนกลาง |
| `ValidFrom` | `timestamptz` | ไม่ได้ | เวลา UTC เริ่มใช้สิทธิ์บทบาทนี้ |
| `ValidUntil` | `timestamptz` | ได้ | เวลา UTC สิ้นสุดสิทธิ์ ต้องหลัง ValidFrom; null หมายถึงไม่ตั้งวันสิ้นสุด แต่ยังถอนได้ |
| `Reason` | `varchar(1000)` | ไม่ได้ | เหตุผลการมอบบทบาท เพื่อให้ตรวจสอบการให้สิทธิ์ย้อนหลังได้ |
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

[TEmployees](legacy-005.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:157) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ
