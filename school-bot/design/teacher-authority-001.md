# Authority รายชื่อนักเรียนของครู

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## เอกสารอ้างอิง

[DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md) · [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](des-005.md) · [GAP-06 (ช่องว่าง authority รายชื่อนักเรียนของครู)](teacher-authority-001.md) · [REQ-038 (ประเมิน Code/Block อัตโนมัติและ Arm โดยครู)](../requirement/req-038.md) · [REQ-039 (ความคืบหน้าและการติดตามโดยครู)](../requirement/req-039.md)

ต่อจาก [DES-004](des-004.md), ใช้ร่วม [DES-005](des-005.md); GAP-06/REQ-038/REQ-039. สถานะอยู่ที่ [index](index.md)

### Authority เดียวของรายชื่อนักเรียนที่ได้รับมอบหมาย

ทุกการอ่าน progress/source และตรวจ Arm ใช้ `course-teacher ∩ roster ∩ term` บน School DB ร่วม SchoolId ของ session. ไม่สร้าง TeacherGrant ในงานนี้; fallback endpoints ตาม DES-004 เป็น conditional และไม่ใช่แหล่งสิทธิ์ที่เปิดใช้

| ส่วนของ authority | ตาราง/การเชื่อมและเงื่อนไข |
|---|---|
| ครูรายวิชา | `TPlanCourseTeacher(SchoolID,sEmp,PlanCourseId)` ที่ IsActive=true/cDel=false เชื่อม `TPlanCourse(SchoolID,PlanCourseId)` ที่ IsActive=true/cDel=false/CourseStatus=1; sEmp ต้องเป็น employee profile ที่ยืนยันแล้ว ไม่ใช่ AccountId |
| วิชา/ห้อง | TPlanCourse.PlanId → `TPlanTermSubLevel2.PlanId` ภายใน SchoolID เดียว, IsActive=true/cDel=false; nTermSubLevel2 ต้องตรงห้องของ CourseRun และ TTermSubLevel2 ที่ใช้งาน |
| เทอม/ปี | `TPlanCourseTerm(SchoolID,PlanCourseId,nTerm)` ที่ IsActive=true/cDel=false → `TTerm(SchoolID,nTerm)`; nYear ต้องตรง CourseRun.NYear; nTerm เป็น string key ไม่ใช่ numberTerm |
| roster นักเรียน | `TStudentClassroomHistory(SchoolID,sID,nTerm,nTermSubLevel2)` → `TUser(SchoolID,sID)`; ต้องอยู่ห้อง/เทอมที่อนุญาตและผ่าน active/move/status resolver ที่พิสูจน์แล้ว; ไม่ใช้ห้องปัจจุบันของ TUser แทน history |
| การใช้ผล | intersect ก่อน pagination/อ่าน source และตรวจซ้ำก่อน commit; วิชาที่ครูไม่มีสิทธิ์ไม่หลุดเข้ามาจากการมีครูอีกคนในห้องหรือ PlanCourseIds ของ run |

## เหตุผลและขอบเขต

เลือก reuse assignment/roster/term เดิมแทน TeacherGrant ใหม่หรือสิทธิ์ทั้งโรงเรียน. ตารางนี้กำหนดแหล่ง authorization ไม่เพิ่ม relation/field ใน relational model; [dictionary](data-legacy-001.md) และ [ภาพ integration](schoolbot-integration.dbml) คงเดิม. ตัวอย่างสมมติ: ครูวิชา A ในห้อง 1/เทอม X ดูนักเรียนใน roster 1/X ได้ แต่ไม่ได้ทุกวิชาใน run และไม่เห็นนักเรียนที่ย้ายออกโดยอาศัยประวัติเก่าเพียงแถวเดียว; ต้องพิสูจน์ roster resolver ก่อนเปิดใช้

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

นี่คือตาราง authority ของ application ไม่ใช่ table/view ใหม่หรือ SQL FK ข้าม DB. ชื่อ physical/property และหลักฐานแยกอยู่ที่ [data-legacy-001](data-legacy-001.md); หลักฐานตรวจใหม่ gap-sync-review (memory: design/gap-sync-review-001.md). TeacherRepository.cs:111–124 ยืนยัน join ครู/รายวิชา/เทอม; PlanCourseRepository.cs:194–215 มี join ห้องแต่กรอง tenant ไม่ครบทุก alias จึงห้ามคัดลอกเป็น authorization โดยตรง. ยังไม่พิสูจน์วิธีเลือกประวัติซ้ำ/move dates/status/เวลา TTerm; ห้ามเดารหัสสถานะหรือเลือก Max(nHistoryId) เพื่อให้ได้สิทธิ์. ถ้า resolve ไม่ได้ให้ fail closed `503 AUTH_NOT_CONFIGURED` (แหล่งล่ม `503 AUTH_UNAVAILABLE`); เมื่อ resolve ได้แต่ไม่อยู่ scope → `403 SUBJECT_PERMISSION_REQUIRED` หรือ 404 สำหรับ object ที่ไม่ควรรู้. ช่องว่างหลักฐานนี้ไม่เปิดคำถาม Guest/[มติ 035 (แหล่งสิทธิ์แอดมินโรงเรียน)](../requirement/decisions-035.md) ใหม่
