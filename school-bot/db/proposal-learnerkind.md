# ข้อเสนอแก้ปัญหา LearnerId ของครู (`sEmp`) ชนกับนักเรียน (`sId`) บน Desktop

วันที่เสนอ: 2026-10-22 · ผู้เสนอ: System Analyst (`sa`) · ผู้ใช้เลือกทาง A เมื่อ 2026-10-23 ตาม [decisions-032](../requirement/decisions-032.md); เนื้อหาข้อเสนอเดิมด้านล่างเก็บเป็นประวัติ ไม่อนุมัติ SQL delta ทาง B

บันทึกผลตัดสิน: ครูทดลอง local และเก็บโครงงาน Cloud ได้ แต่ไม่ส่งงานหรือสอบเก็บผลบน Cloud; ส่ง arch sync สัญญาที่เกี่ยว ไม่ใช่ผลตรวจ implementation
อ้างอิง: [decisions-025.md](../requirement/decisions-025.md), [decisions-026.md](../requirement/decisions-026.md), [db/review-002.md](review-002.md), [db/schoolbot_db.sql](schoolbot_db.sql), [des-004.md](../design/des-004.md), [des-005.md](../design/des-005.md), [des-009.md](../design/des-009.md), [des-010.md](../design/des-010.md), [des-011.md](../design/des-011.md)

---

## 1. สาเหตุของปัญหา (Root Cause)

1. ตามมติ `decisions-025` และ `decisions-026` แอป Desktop (`Channel = 'desktop'`) อนุญาตให้ bind โปรไฟล์ได้ทั้งนักเรียน (`ProfileKind = 'student'`, `ProfileId = TUser.sID`) และครู (`ProfileKind = 'employee'`, `ProfileId = TEmployees.sEmp`) เพื่อ **"ใช้เรียน/ลองเท่านั้น"**
2. ในฐานข้อมูล School DB เดิม ค่า `TUser.sID` (นักเรียน) และ `TEmployees.sEmp` (ครู/พนักงาน) เป็น `integer` คนละลำดับกันภายใน `SchoolId` เดียวกัน จึง**มีค่าตัวเลขตรงกันได้** (เช่น ครู ข. มี `sEmp = 105` และนักเรียน ก. ในห้องที่ครูสอนก็มี `sID = 105` พอดี)
3. ใน `db/schoolbot_db.sql` ปัจจุบัน:
   - ตาราง `SchoolBotProject` มีคอลัมน์ `"OwnerKind" varchar(16) NOT NULL` (`'student' | 'employee'`) คู่กับ `"OwnerId" integer NOT NULL` อยู่แล้ว → **ไม่ชนกันที่ตาราง Project**
   - แต่ตาราง `SchoolBotSubmission` และ `SchoolBotAttempt` มีเฉพาะ `"LearnerId" integer NOT NULL` โดยไม่มีคอลัมน์บอกว่าเป็น `student` หรือ `employee`
4. **ความเสี่ยงหากครูสร้าง `Submission` หรือ `Attempt` ด้วย `LearnerId = sEmp`**:
   - การกรองแค่ `LearnerId IN (roster_sIds)` ตอนส่งคะแนน (`DES-009`) หรือคำนวณค่าเฉลี่ยเลื่อน Level ของห้อง (`DES-011`) **ไม่สามารถป้องกันได้** หากเลข `sEmp` ของครูตรงกับเลข `sID` ของนักเรียนที่มีตัวตนอยู่ใน roster ห้องนั้นจริง ผลทดลองของครูจะไปปนหรือทับผลของนักเรียนคนนั้นทันที

---

## 2. การเปรียบเทียบทางเลือก (3 ทางเลือก)

| ทางเลือก | รายละเอียด | ข้อดี | ข้อเสีย | ผลประเมินของ SA |
|---|---|---|---|---|
| **ทางเลือก A: ไม่ให้ครูสร้างผลทางการใน `Submission` / `Attempt` (ทดลองใน Lab / Local เท่านั้น)** | บน Desktop ครู (`ProfileKind = 'employee'`) เปิดดูบทเรียนทั้งหมด, ทดลองรัน Code/Block/Arm ในเครื่อง (`authority: "local"` ตาม DES-005) และบันทึก `SchoolBotProject` (`OwnerKind = 'employee'`) บน Cloud ได้ แต่ API `POST /v2/submissions` และ `POST /v2/attempts` รับเฉพาะ `ProfileKind = 'student'` (คืน `403 PROFILE_NOT_ALLOWED` สำหรับ `employee`) | - **ไม่ต้องแก้ Schema (`db/schoolbot_db.sql` 32 ตารางคงเดิม 100%)**<br>- ไม่ต้องให้ครูเลือกผูก `CourseRunId` ของห้องนักเรียนตอนลองทำ Quiz/Test<br>- ตาราง `Submission` และ `Attempt` มีเฉพาะข้อมูลนักเรียนแท้ 100% ไม่ปนใน DES-009 / DES-011 หรือคิวตรวจงานครู | - ครูไม่สามารถลองกดส่งการบ้าน (`Submission`) ให้ server ตรวจบน Cloud หรือลองทำข้อสอบ (`Attempt`) แบบบันทึกประวัติบน Cloud ได้ | **เลือกเป็นค่าเริ่มต้นในเอกสาร Rev5 ปัจจุบัน (หากครูไม่จำเป็นต้องบันทึกผลส่งงาน/สอบลง Cloud)** |
| **ทางเลือก B: เพิ่มคอลัมน์ `"LearnerKind"` ใน `SchoolBotSubmission` และ `SchoolBotAttempt`** | เพิ่ม `"LearnerKind" varchar(16) NOT NULL DEFAULT 'student'` (`CHECK ("LearnerKind" IN ('student', 'employee'))`) ใน 2 ตาราง (`SchoolBotSubmission`, `SchoolBotAttempt`); ส่วน `SchoolBotRetakeGrant` และ `SchoolBotScorePreviewItem` คงใช้เฉพาะนักเรียน (`student`) และบังคับ `WHERE "LearnerKind" = 'student'` ใน DES-009 / DES-011 / คิวตรวจงานของครู | - ครูบน Desktop สามารถทดลองกดส่ง `Submission` และลองทำ `Attempt` (Quiz/Test) พร้อมดู `GET /v2/progress` ของตนเองบน Cloud ได้ครบเหมือนผู้เรียน<br>- แยกข้อมูลครู (`employee`) ออกจากนักเรียน (`student`) ที่เลข `sEmp == sId` อย่างเด็ดขาดในระดับ DB<br>- แก้ schema น้อยที่สุด (เพิ่มคอลัมน์เดียวใน 2 ตาราง ไม่เพิ่มตารางใหม่) | - ต้องแก้ DDL (`db/schoolbot_db.sql`) 2 ตาราง<br>- สำหรับ `Attempt` ซึ่งบังคับ `CourseRunId NOT NULL` ครูต้องเลือกทดลองภายใต้ `CourseRun` ที่เปิดอยู่ และทุก query ของห้องเรียน (DES-005/009/011) ต้องไม่ลืมกรอง `LearnerKind = 'student'` | **เลือกเป็นข้อเสนอหลักหากผู้ใช้ต้องการให้ครูทดลองส่งภารกิจและลองทำข้อสอบ Quiz/Test บน Desktop ได้จริง** |
| **ทางเลือก C: แยกตารางผลของครู (`SchoolBotTeacherSubmission` / `SchoolBotTeacherAttempt`)** | สร้างตารางแยกสำหรับเก็บผลการทดลองส่งงานและทำข้อสอบของครูโดยเฉพาะ | - ตารางของนักเรียนไม่มีแถวของครูเลย | - เพิ่มจำนวนตารางอีก 2–3 ตาราง และโค้ดซ้ำซ้อน ขัดกับแนวทางตัดทอนความซับซ้อนของ `db/review-005.md` | **ปัดตก** |

---

## 3. ข้อเสนอที่ SA เลือก

- **กรณีที่ผู้ใช้ต้องการให้ครูบน Desktop ลองส่งภารกิจ (`Submission`) และลองทำแบบทดสอบ (`Attempt`) บน Cloud ได้ครบเหมือนนักเรียน**: SA เลือก **ทางเลือก B** (เพิ่มคอลัมน์ `"LearnerKind"` ใน `SchoolBotSubmission` และ `SchoolBotAttempt` เท่านั้น; ไม่เพิ่มตารางใหม่ และไม่อนุญาตให้ส่งภารกิจ Arm ของครูเข้าคิวตรวจงานจริงของห้อง หรือส่งคะแนนออกใน DES-009 / คิดค่าเฉลี่ยใน DES-011)
- **กรณีที่ผู้ใช้ต้องการให้ครูบน Desktop เปิดดูบทเรียนและทดลองต่อบล็อก/เขียนโค้ด/บังคับหุ่นใน Lab + บันทึก `SchoolBotProject` โดยไม่ต้องส่งการบ้านหรือทำข้อสอบเข้า `CourseRun`**: SA เลือก **ทางเลือก A** (ไม่ต้องแก้ SQL `db/schoolbot_db.sql` เลย และใช้กฎในเอกสาร Rev5 ที่ sync แล้วได้ทันที)

---

## 4. ข้อความ SQL Delta ที่เสนอให้ DBA (สำหรับทางเลือก B)

หากผู้ใช้อนุมัติ **ทางเลือก B** ให้ DBA นำ SQL delta ด้านล่างไปปรับใน `db/schoolbot_db.sql` (Section 004 ตารางที่ 4 `SchoolBotSubmission` และตารางที่ 7 `SchoolBotAttempt`) โดยตารางอื่นอีก 30 ตารางไม่ต้องเปลี่ยน:

```sql
-- =============================================================================
-- SQL Delta Proposal (Option B): เพิ่ม LearnerKind ใน SchoolBotSubmission และ SchoolBotAttempt
-- Target Database: SchoolBot DB (10.0.0.128:9499, schema: public)
-- =============================================================================

BEGIN;

-- 1. SchoolBotSubmission: เพิ่ม LearnerKind ('student' | 'employee')
ALTER TABLE public."SchoolBotSubmission"
    ADD COLUMN IF NOT EXISTS "LearnerKind" varchar(16) NOT NULL DEFAULT 'student';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CK_SchoolBotSubmission_LearnerKind'
    ) THEN
        ALTER TABLE public."SchoolBotSubmission"
            ADD CONSTRAINT "CK_SchoolBotSubmission_LearnerKind"
            CHECK ("LearnerKind" IN ('student', 'employee'));
    END IF;
END
$$;

-- 2. SchoolBotAttempt: เพิ่ม LearnerKind ('student' | 'employee')
ALTER TABLE public."SchoolBotAttempt"
    ADD COLUMN IF NOT EXISTS "LearnerKind" varchar(16) NOT NULL DEFAULT 'student';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CK_SchoolBotAttempt_LearnerKind'
    ) THEN
        ALTER TABLE public."SchoolBotAttempt"
            ADD CONSTRAINT "CK_SchoolBotAttempt_LearnerKind"
            CHECK ("LearnerKind" IN ('student', 'employee'));
    END IF;
END
$$;

COMMIT;
```

*(หมายเหตุสำหรับ DBA: หากรวมเข้าไฟล์สร้างตารางใหม่ `db/schoolbot_db.sql` ให้วาง `"LearnerKind" varchar(16) NOT NULL DEFAULT 'student'` ไว้หน้า `"LearnerId" integer NOT NULL` ใน `CREATE TABLE public."SchoolBotSubmission"` และ `CREATE TABLE public."SchoolBotAttempt"` พร้อม `CONSTRAINT "CK_SchoolBotSubmission_LearnerKind"` และ `"CK_SchoolBotAttempt_LearnerKind"` ซึ่งจะทำให้จำนวน `CHECK` ทั้งไฟล์เพิ่มจาก 53 เป็น 55 ข้อ)*

---

## 5. สิ่งที่ต้องให้ผู้ใช้ตัดสิน (Human Gate)

1. **เลือกแนวทางสำหรับครู (`ProfileKind = 'employee'`) บน Desktop**:
   - **เลือก A (ไม่แก้ SQL)**: ครูบน Desktop เปิดดูบทเรียน ทดลองรันใน Lab/Local และบันทึก `SchoolBotProject` (`OwnerKind = 'employee'`) ได้ แต่ไม่สร้างแถวใน `SchoolBotSubmission` และ `SchoolBotAttempt`
   - **เลือก B (แก้ SQL 2 ตารางตาม SQL Delta ด้านบน)**: เพิ่มคอลัมน์ `"LearnerKind"` ใน `SchoolBotSubmission` และ `SchoolBotAttempt` เพื่อให้ครูทดลองกดส่งงานและลองทำข้อสอบ Quiz/Test บน Cloud ได้โดยไม่ชนกับ `sId` นักเรียน

## Change Log
- 2026-10-22 — SA สร้างข้อเสนอเปรียบเทียบ 3 ทางเลือกสำหรับแก้ปัญหา `LearnerId` ครู/นักเรียนชนกัน พร้อม SQL delta สำหรับ DBA และประเด็นให้ผู้ใช้ตัดสิน

## บันทึกมติภายหลัง

- 2026-10-23 — ผู้ใช้เลือกทาง A ตาม decisions-032; คงข้อเสนอเดิมไว้เป็นประวัติและไม่ใช้ SQL delta ทาง B
