# SchoolBotCourseRun

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** นำหลักสูตรกลางฉบับหนึ่งมาเปิดใช้จริงกับห้อง ปี และเทอมของโรงเรียน

**หนึ่งแถว:** การเปิดใช้ curriculum revision หนึ่งกับห้องหนึ่งในปี/เทอมหนึ่ง

**ใช้ตอนไหน/ใครใช้:** ผู้ดูแลโรงเรียนเปิด/ปิดหลักสูตร; ครูตั้งคะแนนและกิจกรรม; ตรวจ roster, mapping, export และการต่อ Level

**ตัวอย่างสมมติ:** สมมติ: ห้อง ป.4/1 ใช้ Beginner revision 2 ในเทอมที่เลือก และผูกวิชาวิทยาการคำนวณของห้องนั้น

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotCourseRunId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotCourseRun (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `CurriculumId` | `integer` | ไม่ได้ | FK ไป SchoolBotCurriculum ฉบับที่เลือกใช้; ไม่เปลี่ยนฉบับกลางทางของ run เดิม |
| `ClassroomId` | `integer` | ไม่ได้ | รหัสห้อง TTermSubLevel2.nTermSubLevel2 ใช้ร่วมกับ SchoolId และบริบทปี/เทอม |
| `NYear` | `integer` | ไม่ได้ | รหัสปีจากระบบเดิม ใช้เชื่อม TYear.nYear และ TTerm.nYear; ไม่ใช่ numberYear ที่แสดง เช่น 2569 โดยอัตโนมัติ |
| `NTerm` | `varchar(64)` | ไม่ได้ | รหัสเทอมเดิมชนิดข้อความจาก TTerm.nTerm; ไม่ใช่การใส่เลข 1 หรือ 2 โดยไม่ resolve |
| `PlanCourseIds` | `integer[]` | ไม่ได้ | integer[] ของ TPlanCourse.PlanCourseId ที่ผูก run; ต้องมีอย่างน้อยหนึ่งรายการ ไม่มี null และตามสัญญาต้องไม่ซ้ำและตรงห้อง/เทอม |
| `CurrentPolicyId` | `integer` | ได้ | FK ไป SchoolBotScoringPolicy ฉบับปัจจุบันของ run นี้; null เมื่อยังไม่มี pointer ไป policy |
| `PreviousRunId` | `integer` | ได้ | FK ไป CourseRun ก่อนหน้าที่นำมาสู่ run นี้; null เมื่อไม่ใช่ successor |
| `EffectiveAt` | `timestamptz` | ไม่ได้ | เวลา UTC ที่การเปิดใช้ run นี้มีผล รวมกรณี run เทอมถัดไปจากการตัดสิน Level |
| `Lifecycle` | `varchar(16)` | ไม่ได้ | planned=เตรียมเปิด, active=กำลังใช้, closing=กำลังปิดเทอม, closed=ปิดแล้ว |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `CurriculumId` | [SchoolBotCurriculum](table-012.md) (`SchoolBotCurriculumId`) |
| `PreviousRunId` | [SchoolBotCourseRun](table-018.md) (`SchoolBotCourseRunId`) |
| `CurrentPolicyId` | [SchoolBotScoringPolicy](table-019.md) (`SchoolBotScoringPolicyId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotCourseRun](table-018.md) (PreviousRunId), [SchoolBotScoringPolicy](table-019.md) (CourseRunId), [SchoolBotCourseRunActivity](table-020.md) (CourseRunId), [SchoolBotAttempt](table-024.md) (CourseRunId), [SchoolBotRetakeGrant](table-025.md) (CourseRunId), [SchoolBotGradeSlot](table-026.md) (CourseRunId), [SchoolBotScoreMapping](table-027.md) (CourseRunId), [SchoolBotScorePreview](table-028.md) (CourseRunId), [SchoolBotLevelProposal](table-032.md) (CourseRunId), [SchoolBotLevelProposal](table-032.md) (SuccessorRunId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[TPlanCourse](legacy-007.md) · [TPlanCourseTerm](legacy-008.md) · [TPlanTermSubLevel2](legacy-009.md) · [TTermSubLevel2](legacy-011.md) · [TClassMember](legacy-012.md) · [TYear](legacy-013.md) · [TTerm](legacy-014.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:572) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
