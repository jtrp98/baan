# DES-005 — หลักสูตร ภารกิจ และผลประเมิน — ผู้ใช้และเงื่อนไขก่อนเริ่ม

> Rev 8 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-005 — หลักสูตร ภารกิจ และผลประเมิน](des-005.md)

ชนิดข้อมูลที่ใช้: `P` = profile ที่ระบุโรงเรียน kind และ id; `A` = actor string ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## ผู้ใช้และเงื่อนไขก่อนเริ่ม

- **ส่วนกลาง SchoolBright (`Channel=staff_admin` บนหน้า admin Next.js ใน `school-bot/web`)**: `content_author` สร้าง/แก้ร่างหลักสูตรกลางและนำเข้า Course Plan Sheet; `content_approver` อนุมัติเผยแพร่แบบ four-eyes (ผู้สร้างอนุมัติเองไม่ได้ ตาม [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../../shared/decisions/decisions-025.md) และ [มติ 026 (อนุมัติ amendment-proposal-001/002 เป็น baseline ใหม่)](../../shared/decisions/decisions-026.md))
- **โรงเรียน (`Channel=school_web` บน `web-system`)**: ผู้ดูแลโรงเรียน (`school_admin`) เลือกเปิดใช้ published curriculum revision กับห้อง/เทอมผ่าน `CourseRun`; ครูรายวิชาดูความคืบหน้าและตรวจภารกิจ Arm บนเว็บ (ไม่มีหน้าตรวจงานหรือเมนูครูใน Desktop ตาม [มติ 022 (ที่อยู่ของหน้าจอ Admin / ครู / Desktop)](../../shared/decisions/decisions-022.md) และ decisions-025 และ decisions-026)
- **ผู้เรียนบน Desktop (`Channel=desktop`)**: นักเรียนและครูใช้เรียน/ทดลองภายใต้ License ที่ active; นักเรียน (`P=student`) ส่ง immutable project revision เพื่อรับการตรวจ Code/Block อัตโนมัติหรือส่งงาน Arm ให้ครูตรวจ และทำแบบทดสอบ Quiz/Test ตาม [DES-010](des-010.md) (ส่วนครู `P=employee` บน Desktop เปิดอ่านบทเรียนและทดลองรันในเครื่อง/บันทึก `SchoolBotProject` ที่ `OwnerKind='employee'` ได้ แต่ไม่สร้างแถว `SchoolBotSubmission` ใน schema ปัจจุบันเพื่อป้องกัน `sEmp` ชนกับ `sId` นักเรียน — ทาง A ยืนยันแล้วตาม [decisions-032](../../shared/decisions/decisions-032.md); ห้ามผล Cloud ของ employee รวม Guest import ตาม [กฎผลเรียน](learning-rules-032-034.md))

