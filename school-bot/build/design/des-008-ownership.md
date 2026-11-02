# DES-008 — Mapping หลักสูตรกับช่องคะแนน SchoolBright — ขอบเขตและผู้ใช้

> Rev 6 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 044 — SQL constraints เหลือเฉพาะ Primary Key)

ส่วนต่อของ [DES-008 — Mapping หลักสูตรกับช่องคะแนน SchoolBright](des-008.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `U` = UUID ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## ขอบเขตและผู้ใช้

admin โรงเรียนที่แก้ mapping คือบัญชี `IsAdmin=1` ของโรงเรียน ตาม [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../../shared/decisions/decisions-025.md)

API ทั้งหมดอยู่ school-bot/web ภายใต้ /v2
หน้า mapping อยู่ `sb-tech-upgrade-web-system` โฟลเดอร์ school-bot ซึ่งยังต้องยืนยัน
เรียกผ่าน Backend for Frontend (BFF) `/api/school-bot/*` ด้วย session channel `school_web` ตาม [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)

| Actor | สิทธิ์ใน DES นี้ |
|---|---|
| admin โรงเรียน (`school_admin` = `IsAdmin=1` ตาม decisions-025 และ DES-012) | ถือครอง GradeSlot, สร้าง/แก้/retire mapping, อ่านทุกวิชาในโรงเรียน |
| ครูรายวิชา (DES-012) | อ่าน mapping/targets เฉพาะวิชาที่ตนสอน เพื่อ preview ตาม [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](des-009.md); ไม่แก้ |
| ครูประจำห้อง / TeacherGrant | ไม่ได้สิทธิ์ใดเพิ่ม |

SchoolId และผู้กระทำมาจาก session ไม่รับจาก body (`CreateBy`/`UpdateBy` เก็บ `sEmp` เป็น `int4 null` หรือ `null` เมื่อเป็น legacy admin ที่ไม่มี `sEmp` ตาม [decisions-028](../../shared/decisions/decisions-028.md))
ครูไม่แก้ mapping ([BR-049-06 (เฉพาะ admin โรงเรียนสร้าง/แก้ mapping ครูแก้ไม่ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)); school_admin ไม่ได้สิทธิ์ส่งคะแนน (DES-009)
การไม่มีข้อมูลสิทธิ์ให้ปฏิเสธ

หลักสูตรกลางเก็บตัวชี้วัดกลาง (`SchoolId=null` บน **SchoolBot DB**) ส่วน mapping และ GradeSlot เป็นข้อมูลรายโรงเรียน (`SchoolId>0` บน **SchoolBot DB `10.0.0.128:9499`** ตาม [decisions-027](../../shared/decisions/decisions-027.md))
การอ่านแผนการเรียน/เทอมจาก **School DB** และการอ่านช่องคะแนนจาก **PGGradeDB** ทำผ่าน connection แยกด้วย**บัญชี DB เดิม** ([decisions-029](../../shared/decisions/decisions-029.md)) ไม่มี external physical FK ข้าม DB

## โมเดล

CourseRun = การใช้ curriculum revision หนึ่งกับห้องและเทอมหนึ่ง ผูกวิชา (PlanCourseIds) ที่ admin โรงเรียนเลือกตอนเปิดใช้ เพื่อใช้ตรวจสิทธิ์ครู

GradeSlot = ช่อง PGGradeDB ที่ได้รับการยืนยันให้ SchoolBot ดูแล ระบุ n_grade_id, assessment_id และ score_identifier แบบ exact รวม school/year/term/plan_course/course/classroom context

ScoreMapping = GradeSlot หนึ่งกับแหล่งคะแนน Activity
Source={activity_id:K,indicator_key:U|null,weight_bps:0..10000}

Sources ต้องมีหนึ่งรายการเท่านั้น และ weight_bps=10000 อย่างถาวรตาม [มติ 032 (ผลทดลองของครูและ cardinality/การล็อก mapping คะแนน)](../../shared/decisions/decisions-032.md); หลาย source คืน 409 MAPPING_SOURCE_COUNT_INVALID น้ำหนักผิดคืน 400 MAPPING_WEIGHT_INVALID

Lesson เป็นตัวเลือกกลุ่มกิจกรรม ไม่เป็นคะแนนที่สร้างขึ้นเอง การเลือก Lesson/Indicator ในหน้า mapping ต้องขยายเป็นรายการ activity_id ที่แน่นอนก่อนบันทึก ห้ามตามกิจกรรมเพิ่มใน revision ใหม่เอง

หนึ่ง Activity แมพได้หลาย GradeSlot ข้ามหลายวิชา ([มติ 020 (หลักสูตรแบบ Level, quiz/test และการส่งคะแนนกลับ SchoolBright)](../../shared/decisions/decisions-020.md) คำชี้แจง, [BR-049-02 (กิจกรรมหนึ่งได้หลายช่องข้ามวิชา แต่ช่องหนึ่งในบริบทโรงเรียน/เทอม/วิชารับกิจกรรมเดียว ไม่รวมหลายกิจกรรม)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md))
ใน CourseRun หนึ่งมี active mapping ต่อ GradeSlot ได้หนึ่งชุดเมื่อ RetiredAt=null และ IsDelete=false; application/repository ต้องถือ transaction lock บน (CourseRunId,GradeSlotId) ร่วมกับ stable ownership key (SchoolId,NGradeId,AssessmentId,ScoreIdentifier) ตาม data-contract-rules.md แล้วตรวจซ้ำก่อนเขียน ห้ามสร้าง mapping ซ้ำเพื่อส่งคะแนนไปช่องเดียวกันสองครั้ง ไม่มี partial unique index บังคับ

