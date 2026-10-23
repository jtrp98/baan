# ประวัติ data model ก่อนคู่มือ Rev6

[กลับคู่มือ](data-model.md) · [ต้นฉบับ Rev5 แบบ byte-for-byte](archive/2026-10-23-before-readable-data-model/data-model.md)

- 2026-10-22 — Rev5: sync ให้ตรงกับ `db/schoolbot_db.sql` (32 ตาราง) และ `db/review-005.md` ตามมติ decisions-027..030; ย้ายที่ตั้งตาราง SchoolBot ไป SchoolBot DB (10.0.0.128:9499) และระบุการอ่านข้าม DB ด้วยบัญชี DB เดิมโดย re-check ก่อน commit; ถอน `SchoolBotTeacherGrant` ออกจากตารางสร้างจริงคงเป็นหมายเหตุทางสำรอง; ถอน `ScoringPolicy.CurriculumId`; ปรับ FK เป็น single-column ชี้ PK พร้อมตรวจ `SchoolId` ใน application; แทน `version:N` ของแถวด้วย `update_date:D` (ETag/If-Match จาก `UpdateDate`)
- 2026-10-22 — Rev4.2: ถอน Version จาก common columns ใช้ UpdateDate เป็น concurrency token ตาม decisions-030 (ส่วนอื่นยังรอ SA sync กับ SQL Rev5/decisions-027/029)
- 2026-10-22 — Rev4.1: CreateBy/UpdateBy เป็น I? (sEmp/sId, null = ระบบ) ตาม decisions-028
- 2026-10-22 — Rev4: sync logical baseline 33 ตารางตามมติอนุมัติ decisions-026 (รวม amendment-proposal-001/002 และแก้ 2 จุดตาม decisions-025: Desktop bind ได้ทั้ง student/employee, school_web ต้องตรวจ License active ของโรงเรียน); ถอน Curriculum.Mode, เพิ่ม global content (SchoolId=null), Session.Channel, StaffRole, CourseRun/Activity/Attempt/Retake, GradeSlot/ScoreMapping/Preview/Export/Outbox และ LevelProposal
- 2026-10-21 — Rev3: PK/FK เป็น K; แยก legacy I และ logical UUID U
- 2026-10-21 — Rev2: legacy keys; ถอน User ซ้ำ เพิ่ม Session/placement
- 2026-10-21 — Rev1: เสนอ logical schema, audit/SchoolId ทุกตาราง, concurrency และ error contract เพื่อส่ง DBA หลังอนุมัติ
- 2026-10-21 — MYCELIUM แยกกฎข้อมูลและ HTTP contract เพื่อคุมขนาด โดยไม่เปลี่ยน fields หรือ IDs


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009; คง baseline เดิม
