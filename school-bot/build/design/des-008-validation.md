# DES-008 — Mapping หลักสูตรกับช่องคะแนน SchoolBright — การตรวจข้อมูล โรงเรียน และสิทธิ์

> Rev 6 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 044 — SQL constraints เหลือเฉพาะ Primary Key)

ส่วนต่อของ [DES-008 — Mapping หลักสูตรกับช่องคะแนน SchoolBright](des-008.md)

## การตรวจข้อมูล โรงเรียน และสิทธิ์

ตรวจ school_admin หรือสิทธิ์ครูรายวิชาตาม [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md) ทั้ง ณ request และ re-check ซ้ำก่อน commit ใน SchoolBot DB
ครูอ่านได้เฉพาะวิชาที่ตนสอน ไม่รวมสิทธิ์ครูคนหนึ่งไปยังวิชาอื่น
ไม่มี SQL FOREIGN KEY บังคับความสัมพันธ์ ชั้น application ต้องตรวจการมีอยู่และความสัมพันธ์ของ `CourseRun`, `GradeSlot` และ `ScoreMapping` รวมทั้ง `SchoolId` เดียวกับ session และ `GradeSlot.CourseRunId == ScoreMapping.CourseRunId` ใน SchoolBot DB transaction เดียวกับการเขียน ตาม [มติ 044 (SQL constraints เหลือเฉพาะ Primary Key)](../../shared/decisions/decisions-044.md)
plan_course_id ของ GradeSlot ต้องอยู่ใน PlanCourseIds ของ CourseRun
source ต้องเป็น published Activity ใน curriculum revision ของ run และ indicator ต้องถูกประกาศอยู่บน Activity นั้น
source ต้องมีผลตัวเลขที่นิยามได้ ไม่แปลง passed เป็น 100 เอง; quiz ที่ ScoringPolicy ไม่นับคะแนนเป็น source ไม่ได้ ([DES-010 (Question Bank, Attempt และนโยบายคะแนน)](des-010.md)); ค่าหายไม่ถือเป็นศูนย์
mapping/slot ที่ confirm ส่งแล้ว immutable รวม soft-delete/retire; pending/partial และชุดใหม่ใช้ [กฎล็อกประวัติ](grade-rules-032-034.md); ก่อน confirm การแก้ที่อนุญาตทำให้ preview เก่าใช้ไม่ได้

## ข้อผิดพลาด

400 INVALID_INPUT, MAPPING_WEIGHT_INVALID
401 UNAUTHORIZED, SESSION_EXPIRED (DES-012)
403 FORBIDDEN, SCHOOL_MISMATCH, SCHOOL_ADMIN_REQUIRED, SUBJECT_PERMISSION_REQUIRED, CHANNEL_NOT_ALLOWED, LICENSE_REQUIRED
404 NOT_FOUND
409 TARGET_AMBIGUOUS, SLOT_UNAVAILABLE, SLOT_ALREADY_OWNED, TARGET_CHANGED, SOURCE_NOT_SCORABLE, POLICY_NOT_CONFIGURED, CONTENT_NOT_PUBLISHED, MAPPING_SOURCE_COUNT_INVALID, MAPPING_LOCKED, EXPORT_IN_PROGRESS
412 VERSION_CONFLICT (`UpdateDate` ไม่ตรง `If-Match`)
428 PRECONDITION_REQUIRED
503 GRADE_SOURCE_UNAVAILABLE, AUTH_NOT_CONFIGURED

details ใช้รูปเดิมเท่านั้น; resource_id ชี้ SchoolBot resource

## ทางเลือกและการตรวจ

เลือก explicit many-to-many และ GradeSlot ownership ใน SchoolBot DB; ปัดตก FK จากหลักสูตรกลางไป Pgtassessment, ปัดตกสร้างช่องอัตโนมัติจากชื่อ/เลขลำดับ, ปัดตกตั้ง quiz→คะแนนเก็บ/test→สอบเป็นกฎตายตัว, ปัดตกให้ครูรายวิชาแก้ mapping และปัดตกหลาย source ต่อช่องอย่างถาวรตาม [มติ 032 (ผลทดลองของครูและ cardinality/การล็อก mapping คะแนน)](../../shared/decisions/decisions-032.md)
พิสูจน์หนึ่งคาบส่งหลายวิชา, slot ซ้ำ, context ไม่ตรง, indicator ไม่อยู่ Activity, เปลี่ยน revision แล้วไม่ remap อัตโนมัติ, ครูพยายามสร้าง/แก้ mapping → 403 SCHOOL_ADMIN_REQUIRED, ครูอ่านวิชาที่ไม่ได้สอน → 403, admin โรงเรียนอื่น → 404/SCHOOL_MISMATCH, ส่งสอง source → 409 MAPPING_SOURCE_COUNT_INVALID, session channel desktop → 403, และไม่มี PGGradeDB mutation จากการบันทึก mapping

อ่าน canonical [กฎคะแนน](grade-rules-032-034.md)
