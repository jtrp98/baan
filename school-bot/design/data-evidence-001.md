# ผลตรวจ data model และขอบเขตหลักฐาน (1/2)

[กลับคู่มือ](data-model.md) · [แผนที่ตารางเดิม](data-legacy-001.md)

[ส่วน 1](data-evidence-001.md) · [ส่วน 2](data-evidence-002.md)

- ขอบเขตหลักฐานวันที่ 2026-10-23: arch อ่านเอกสารและ source แบบ static; นายช่างบันทึกคู่มือ ไม่รัน SQL/ฐานข้อมูลหรืออ่าน secret และไม่อ้างผล production
- คำอธิบายครอบคลุม 32 ตาราง: ฟิลด์เฉพาะงาน 226 ฟิลด์ เมื่อรวม PK และ 6 ฟิลด์ร่วมต่อตารางเป็น 450 ฟิลด์ตาม SQL; ตัวอย่างทั้งหมดเป็นเรื่องสมมติ
- ชื่อ table/column เดิมอ้าง EF mapping ใน checkout sb-tech-upgrade-academic; หน้ารายตารางมีลิงก์ source และบรรทัด ไม่ใช่ผลตรวจ schema ของฐานที่ deploy จริง
- ทุกตาราง SchoolBot มี PK ชื่อชื่อตารางต่อท้าย Id ชนิด int4 ที่ server จัดสรร; FK ที่กล่าวถึงชี้ PK นี้ เว้น CurrentRevision ซึ่งชี้คู่ ProjectId/Revision; legacy refs เป็น logical reference ข้าม DB
- common 6 fields คือ IsDelete, CreateBy, CreateDate, UpdateBy, UpdateDate, SchoolId; CreateBy/UpdateBy เก็บ sID หรือ sEmp ตามผู้กระทำ หรือ null สำหรับระบบ/กรณีไม่มี profile โดย Actor ใน audit ระบุชนิดเต็ม; UpdateDate ใช้ concurrency แบบ opaque ETag/If-Match และไม่มีคอลัมน์ Version
- SchoolBot timestamps ใช้ UTC timestamptz; nullable ที่อธิบายว่าไม่มีค่าไม่ใช่คะแนนศูนย์หรือหลักฐานอนุญาตโดยอัตโนมัติ ส่วน legacy หลายคอลัมน์เป็น timestamp without time zone จึงยังยืนยัน timezone จริงไม่ได้
- SchoolId=null ใช้เฉพาะ global content 8 ตาราง ได้แก่ Level, LevelPromotionPolicy, Curriculum, Lesson, Mission, Criteria, Activity, QuestionBank; Release/Idempotency/AuditEvent รองรับ global หรือ tenant; อีก 21 ตารางต้องมี SchoolId>0
- ไม่สร้าง SchoolBotUser และไม่คัดลอกรหัสผ่าน; SchoolBotSession เป็น session เท่านั้น AccountId จาก TMasterDBUser.sID ต้องแยกจาก profile TUser.sID/TEmployees.sEmp แม้ตัวเลขบังเอิญตรงกัน; account-profile link และ credential compatibility ยังไม่ยืนยัน
- DES-012 กล่าวถึง TEmployees.WorkStatus แต่ไม่พบ property นี้ใน Entities/JabjaiSchoolSingleDB/Temployee.cs ที่ตรวจ จึงไม่ใส่เป็น physical column และยังไม่อ้างว่าตรวจสถานะ WorkStatus ได้ครบ; LegacyAdminId อธิบายตาม DES-012 แต่ไม่ได้ตรวจ source TAdmins โดยตรงในใบงานนี้
- หลักฐานมีทั้ง Master และ School context ที่ map profile ชื่อเดียวกัน และ TCompany ถูก map เป็น keyless ที่ masterdb_schema.TCompany; ยังไม่พิสูจน์การวางฐานจริง การ replicate หรือ foreign-table arrangement
- Logs DB ถูกระบุเป็นหนึ่งในฐานเดิม แต่เอกสารที่อนุญาตยังไม่มี use case และชื่อตารางที่ SchoolBot ต้องใช้ชัดเจน จึงไม่แต่ง legacy table ขึ้นมา; SchoolBotAuditEvent อยู่ SchoolBot DB และ PGTGradeAuditLog อยู่ PGGradeDB
- SQL ยังเป็น DRAFT ที่เอกสารระบุว่ายังไม่รัน; ชื่อ database SchoolBot ยังติดป้ายสมมติฐานในเอกสาร แม้ placement ของ 32 ตารางกำหนดเป็น SchoolBot DB แล้ว
- db/review-005.md มีข้อความประวัติเรื่องคง Version บางตารางและจำนวน FK ที่ไม่ตรง SQL ปัจจุบัน; ใช้ SQL ปัจจุบันเป็นฐาน field dictionary ซึ่งไม่มี Version/PreviousVersion/NewVersion, ไม่มี SchoolBotTeacherGrant, ไม่มี ScoringPolicy.CurriculumId และไม่มี ScoreOutbox.ScorePreviewId
- การมี FK คอลัมน์เดียวใน SchoolBot ไม่พิสูจน์ tenant consistency; application ต้องตรวจ SchoolId และความเป็นเจ้าของ parent/child รวม Criteria กับ Mission, Activity กับ curriculum และ PreviewItem กับ Export ตามสัญญา
- SchoolBotSubmission ไม่มี CourseRunId โดยตรงใน SQL ปัจจุบัน การอธิบายนี้ไม่เพิ่มความสัมพันธ์ใหม่; การเลือกผลเพื่อ run/export ต้องอาศัย mission/activity/curriculum revision และกติกาใน DES ที่เกี่ยวข้อง
- numeric rubric/evaluator ของโครงงานยังรอเกณฑ์อนุมัติ ห้ามตีความ Outcome=passed เป็นคะแนนเต็ม; สูตรรวมเพื่อเลื่อน Level รอ OQ-014; หลาย source ต่อ mapping รอ OQ-016; ขอบเขตครูปรับ AssessmentPolicy ยังไม่ยืนยัน
- พบ entity ของประวัติห้อง รายวิชานักเรียน และ section enrollment แต่ยังไม่ยืนยันกฎรวม roster ณ สิ้นเทอม การเลือกสถานะ EnrollStatus และ timezone/วันตัดสมาชิก; ห้ามเลือกแหล่งหนึ่งเป็นความจริงครบทุกกรณีโดยเดา
- GradeService ยืนยันว่าอ่าน ScoreData และใช้ int.TryParse กับคะแนนรายช่อง รวมทั้งใช้ getScore100 ที่เก็บไว้และรองรับ override; ไม่ได้พิสูจน์สูตร writer, การ merge, CAS, lock transition หรือ audit ของ writer เดิม


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009; คง baseline เดิม
