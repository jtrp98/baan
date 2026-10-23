# ใบงาน 010 — DBML อ่านภาพระบบและตารางเดิมได้

วันที่ของงาน: 2026-10-23 · ที่มา: ผู้ใช้ขอทำ DBML ให้เห็นภาพชัดขึ้นหลังปรับคู่มือข้อมูล

## ขอบเขต

คำอธิบายและ visualization ของแบบปัจจุบันเท่านั้น ไม่เปลี่ยน SQL/schema/สัญญาธุรกิจ ไม่รันฐานจริง ผู้คุมบันทึกผลและ final knowledge commit หลังแก้เอกสารครบ

## งาน arch แบบ read-only

อ่าน design/index.md, design/schoolbot.dbml, design/data-model.md, design/data-legacy-001.md, design/schema-notes.md และ db/index.md, db/schoolbot_db.sql ภายใต้ C:/src/schoolbright/knowledge/school-bot ก่อน แล้วตามลิงก์ exact path ใน data-dictionary/index.md และ legacy-001..027.md เฉพาะที่ต้องใช้; ถ้าต้องตรวจ physicalชื่อ/ชนิดเพิ่มให้อ่าน source EF ที่ลิงก์ในหน้ารายตารางนั้นเท่านั้น ไม่อ่าน secrets

แผนที่ผู้คุมจะทำ: 1) amend schoolbot.dbml คง 32 ตาราง/450 ฟิลด์/40 FK และ constraintsเดิม เพิ่ม table/field notes จาก dictionaryครบ + สี/ชื่อกลุ่มภาษาไทย + คำอธิบาย 1แถว/ตัวอย่าง 2) เพิ่ม schoolbot-integration.dbml เป็นภาพเฉพาะจุดเชื่อม legacy ลดจำนวนฟิลด์เพื่ออ่านง่าย เลือก SchoolBotSession, SchoolBotStaffRole, SchoolBotProject, SchoolBotCourseRun, SchoolBotSubmission, SchoolBotAssessment, SchoolBotAttempt, SchoolBotGradeSlot, SchoolBotScorePreviewItem, SchoolBotScoreOutbox และตารางเดิมที่จำเป็น; ไม่ต้องใส่ views/Compass/rosterทางสำรองทุกตารางหากทำให้รก

ขอผลเป็น fenced JSON เดียว <= 7000 ตัวอักษร:
{"legacy_tables":[{"name":"physical table เช่น TUser","namespace":"LegacyMaster|LegacySchool|LegacyGrade","fields":[{"name":"physical column","type":"ชนิด DBML ที่พิสูจน์ได้จากEF, int/string ถ้าเป็นlogicalให้บอก","note":"ความหมายสั้น"}],"note":"หน้าที่/ข้อจำกัด"}],"logical_refs":[{"from":"SchoolBotTable.Field หรือ (SchoolId,Field)","to":"LegacyNamespace.Table.Field หรือ (SchoolId,Field)","condition":"โรงเรียน/ชนิดprofile/บริบทปีเทอม/เงื่อนไขอื่น"}],"warnings":["ประเด็นต้องระบุบนภาพ"]}

เลือก legacyหลักไม่เกิน 18 ตาราง และlogicalrefsไม่เกิน 20 เส้น ให้ครอบคลุมบัญชี/profile/สิทธิ์ครู/วิชา/ห้อง/ปีเทอม/ช่องคะแนน/ผลรายนักเรียน/override/ล็อก/receipt เมื่อมีหลักฐาน ใช้ชื่อphysicalcolumnจริง เช่น sID/sEmp, SchoolID vs SchoolId, PGTGradeEdits, TPlane.sPlaneID หากยืนยันได้ fieldในnewtablesต้องมีจริง และ compositeที่เชื่อมต้องเทียบชนิดได้

DBML documentation ปัจจุบันรองรับ table headercolor/TableGroup color/note และ inactive ref เส้นประ ผู้คุมจะใช้เส้นประสีส้มและชื่อ LOGICAL_* สำหรับlogicalข้ามDB พร้อมคำเตือนบนภาพว่าไม่ใช่FKและห้ามใช้integrationfileสร้างSQL บอกถ้าการวาดเส้นใดจะสื่อความหมายผิด ต้องไม่วาด AccountId = sID/sEmp ถ้าไม่พิสูจน์ account-profilelink และไม่สร้างเส้น CourseRunId ในSubmissionที่ไม่มีจริง

ห้ามแก้ไฟล์/เรียกroleซ้อน คืนคำแนะนำให้ผู้คุมบันทึกเอง งานนี้เป็นคำอธิบายไม่ใช่อนุมัติ schemaใหม่ จบ DONE หากแนะนำได้ครบ

## Change Log

- 2026-10-23 — นายช่างเปิดงาน DBML ตามคำขอผู้ใช้ ให้ arch ตรวจภาพ integration แบบ read-only

- 2026-10-23 — arch DONE; นายช่างบันทึก schoolbot.dbml Rev4 และ schoolbot-integration.dbml พร้อมคู่มือ/ผลตรวจ parser; final knowledge commit หลังบันทึกเอกสารครบ
