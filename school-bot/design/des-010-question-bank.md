# DES-010 — Question Bank, Attempt และนโยบายคะแนน — เจ้าของข้อมูล ตำแหน่งฐานข้อมูล และการแก้ข้อมูลพร้อมกัน

> Rev 5 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-010 — Question Bank, Attempt และนโยบายคะแนน](des-010.md)

ชนิดข้อมูลที่ใช้: `U` = UUID ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## อ้างอิง

- [มติ 027 (ที่ตั้งฐานข้อมูล SchoolBot)](../requirement/decisions-027.md)
- [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)
- [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../requirement/decisions-025.md)
- [มติ 026 (อนุมัติ amendment-proposal-001/002 เป็น baseline ใหม่)](../requirement/decisions-026.md)
- [มติ 029 (ไม่แตะ School DB / PGGradeDB ด้วย GRANT)](../requirement/decisions-029.md)
- [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md)
- [มติ 024 (เกณฑ์เลื่อน Level และ policy Quiz/Test)](../requirement/decisions-024.md)

## เจ้าของข้อมูล ตำแหน่งฐานข้อมูล และการแก้ข้อมูลพร้อมกัน

- ตารางทั้งหมด (`SchoolBotQuestionBank`, `SchoolBotCourseRun`, `SchoolBotScoringPolicy`, `SchoolBotCourseRunActivity`, `SchoolBotAttempt`, `SchoolBotRetakeGrant`) อยู่บน **SchoolBot DB (`10.0.0.128:9499`)** ตาม [decisions-027](../requirement/decisions-027.md)
- SchoolBright ส่วนกลางสร้าง/เผยแพร่ Question Bank และ Activity (`SchoolId=null`) ผ่านหน้า admin (Next.js ใน school-bot/web) ด้วย `staff_admin` session ตาม DES-012: role `content_author` สร้าง/แก้ draft, `content_approver` publish โดย**ต้องผ่านกฎ four-eyes** (ผู้สร้าง/แก้ร่างอนุมัติเองไม่ได้ คืน `409 FOUR_EYES_REQUIRED` ตาม [decisions-025](../requirement/decisions-025.md) และ [decisions-026](../requirement/decisions-026.md))
- ครูรายวิชาของ CourseRun (หน้าใน web-system ช่อง `school_web`) ตั้ง `ScoringPolicy`, ตั้งเวลา/override ของ `CourseRunActivity` และเปิด `RetakeGrant` รายคนได้ โดยต้องอ่านและ **re-check สิทธิ์ครูรายวิชาจาก School DB ผ่าน connection แยกด้วยบัญชี DB เดิม ([decisions-029](../requirement/decisions-029.md)) ณ จุดก่อน commit ใน SchoolBot DB**
- ไม่มีคอลัมน์ `Version`; การแก้ไขแถวเดิมใช้ `UpdateDate` (`clock_timestamp()`) เป็น opaque `ETag`/`If-Match` ตาม [decisions-030](../requirement/decisions-030.md)
- ใน `SchoolBotScoringPolicy` ถอนคอลัมน์ `CurriculumId` ออกตาม เพราะอ่านจาก `SchoolBotCourseRun.CurriculumId` ได้โดยตรง

Bank revision ที่เผยแพร่ immutable; Attempt snapshot คัดลอกคำถาม ตัวเลือก ลำดับ คะแนนเต็ม เฉลย bank revision, curriculum revision, policy ที่มีผลจริง และ evaluator version ห้ามให้การแก้/retire bank เปลี่ยน attempt ที่เริ่มแล้ว

## โครงสร้างคำถาม

ชนิดรุ่นแรกตามมติ decisions-024: `single_choice | boolean`; ชนิดอื่นตอบ `409 QUESTION_KIND_UNSUPPORTED`

Question={
question_key:U,kind:QuestionKind,prompt:Text,
options:[{option_key:U,text:Text}],
correct_option_keys:U[],max_score:DecimalString
}

single_choice มีตัวเลือก ≥2 และเฉลยหนึ่งตัว; boolean มีตัวเลือกสองตัวและเฉลยหนึ่งตัว; IDs ไม่ซ้ำ; correct keys ต้องอยู่ใน options; max_score > 0; ตอบถูกได้ max_score ตอบผิด/ไม่ตอบได้ 0
PublicQuestion ตัด `correct_option_keys` ออก ไม่คืนเฉลยก่อนเวลาที่ policy อนุญาต และไม่รับ earned/score จาก client

