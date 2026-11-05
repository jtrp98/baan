# SchoolBot ใช้ตารางเดิมของ SchoolBright อะไรบ้าง

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับคู่มือ](data-model.md) · [32 ตารางใหม่](data-dictionary/index.md)

ตารางด้านล่างเป็นตารางเดิมที่แบบ SchoolBot อ้างถึง ไม่ได้สร้างซ้ำใน SchoolBot DB กดชื่อเพื่อดูฟิลด์ที่ใช้ เส้นทางเชื่อม และหลักฐานจาก source เฉพาะฟิลด์ที่เกี่ยวข้องกับ SchoolBot ไม่ใช่ schema ทั้งหมดของระบบเดิม

## หลักการเชื่อม

- บัญชี (`AccountId`) แยกจากนักเรียน (`SId`) และบุคลากร (`SEmp`); ห้ามถือว่ารหัสเท่ากันหรือแปลงข้ามกันเอง
- รหัสนักเรียน/ครู/วิชา/ห้องต้องตรวจคู่กับ SchoolId และบริบทปี/เทอมที่เกี่ยวข้อง
- ตารางเดิมอยู่คนละ DB จึงไม่มี FK หรือ transaction เดียวครอบทุกฐาน การตรวจจาก source ไม่ใช่ผลยืนยันฐาน production
- SchoolBotAssessment คือผลตรวจภารกิจ ส่วน PGTAssessment คือหัวข้อ/ช่องคะแนนเดิม

## รายชื่อและวิธีใช้

| ฐานข้อมูล | ตารางเดิม | ขอบเขตการใช้ |
|---|---|---|
| Master DB | [TMasterDBUser](data-dictionary/legacy-001.md) | อ่าน / ตรวจบริบท |
| Master DB | [MasterDBTUser](data-dictionary/legacy-002.md) | view ประกอบ — ไม่ใช่บัญชีใหม่ |
| Master/School context | [masterdb_schema.TCompany](data-dictionary/legacy-003.md) | อ่าน / ตรวจบริบท |
| School DB | [TUser](data-dictionary/legacy-004.md) | อ่าน / ตรวจบริบท |
| School DB | [TEmployees](data-dictionary/legacy-005.md) | อ่าน / ตรวจบริบท |
| School DB | [TPlane](data-dictionary/legacy-006.md) | อ่าน / ตรวจบริบท |
| School DB | [TPlanCourse](data-dictionary/legacy-007.md) | อ่าน / ตรวจบริบท |
| School DB | [TPlanCourseTerm](data-dictionary/legacy-008.md) | อ่าน / ตรวจบริบท |
| School DB | [TPlanTermSubLevel2](data-dictionary/legacy-009.md) | อ่าน / ตรวจบริบท |
| School DB | [TPlanCourseTeacher](data-dictionary/legacy-010.md) | อ่าน / ตรวจบริบท |
| School DB | [TTermSubLevel2](data-dictionary/legacy-011.md) | อ่าน / ตรวจบริบท |
| School DB | [TClassMember](data-dictionary/legacy-012.md) | อ่าน / ตรวจบริบท |
| School DB | [TYear](data-dictionary/legacy-013.md) | อ่าน / ตรวจบริบท |
| School DB | [TTerm](data-dictionary/legacy-014.md) | อ่าน / ตรวจบริบท |
| School DB | [TStudentClassroomHistory](data-dictionary/legacy-015.md) | อ่าน / ตรวจบริบท |
| School DB | [TPlanCourseStudent](data-dictionary/legacy-016.md) | อ่าน / ตรวจบริบท |
| School DB | [TPlanCourseSection](data-dictionary/legacy-017.md) | อ่าน / ตรวจบริบท |
| School DB | [TPlanCourseSectionEnrollment](data-dictionary/legacy-018.md) | อ่าน / ตรวจบริบท |
| School DB | [TPlanCourseSectionAllowedRoom](data-dictionary/legacy-019.md) | อ่าน / ตรวจบริบท |
| PGGradeDB | [PGTGrade](data-dictionary/legacy-020.md) | อ่าน / ตรวจบริบท |
| PGGradeDB | [PGTAssessment](data-dictionary/legacy-021.md) | อ่าน / ตรวจบริบท |
| PGGradeDB | [PGTGradeDetail](data-dictionary/legacy-022.md) | อ่าน / เขียนคะแนนเฉพาะช่องเมื่อผ่านเงื่อนไข |
| PGGradeDB | [PGTGradeEdits](data-dictionary/legacy-023.md) | อ่าน / ตรวจบริบท |
| PGGradeDB | [PGTGradeSetting](data-dictionary/legacy-024.md) | อ่าน / ตรวจบริบท |
| PGGradeDB | [PGTGradeAuditLog](data-dictionary/legacy-025.md) | อ่าน / เพิ่ม receipt เมื่อผ่านเงื่อนไข |
| PGGradeDB | [compass_student_level_score](data-dictionary/legacy-026.md) | เปรียบเทียบเท่านั้น — ไม่เขียน |
| PGGradeDB | [compass_level_subject_stat](data-dictionary/legacy-027.md) | เปรียบเทียบเท่านั้น — ไม่เขียน |

## ขอบเขตหลักฐาน

อ่านจาก source/EF ไม่ใช่การตรวจฐานที่ deploy จริง ยังไม่ยืนยันการเชื่อมบัญชีกับ profile, กฎรายชื่อนักเรียนเมื่อสิ้นเทอม และ writer คะแนนเดิม ดูหลักฐานท้ายไฟล์

Logs DB ยังไม่มีตาราง/use case ที่ชัดเจนในแบบนี้; ตาราง Compass สองรายการแสดงเพื่อแยกออกจาก Level ของ SchoolBot และไม่ได้เป็นปลายทางการเขียน

## ยังไม่ยืนยัน

- การเชื่อมบัญชีกับ profile, กฎ roster เมื่อสิ้นเทอม และ writer คะแนนเดิมยังต้องพิสูจน์จาก source และฐานที่ใช้งานจริง
- Logs DB ยังไม่มีตารางหรือ use case ที่ระบุชัด ต้องยืนยันขอบเขตการใช้ก่อนออกแบบเพิ่ม

## หลักฐาน

- design/data-evidence-001.md (memory)
