# DES-011 — ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง — ขอบเขตและ Placement

> Rev 6 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-011 — ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง](des-011.md)

## ขอบเขตและ Placement

รายละเอียด projection ของ snapshot, source references และความเข้ากันได้กับข้อมูลเดิมอยู่ใน [สัญญา snapshot](learning-snapshot-projection-001.md) การทดสอบ projection ด้วย fixture ที่ครบทำได้ แต่ต้องพิสูจน์ roster/term จริงและความเข้ากันได้ของ reader ก่อนเขียนหรือ confirm ห้ามเติม stored snapshot ด้วยผลสดย้อนหลัง.

Level เป็นระดับหลักสูตร ไม่ใช่การเลื่อนชั้น/ย้ายห้องในทะเบียนนักเรียน ระบบเสนอจากค่าเฉลี่ยคะแนนรวมของห้อง ครูยืนยันทั้งห้องเท่านั้น ไม่เขียน CompassStudentLevelScore หรือทะเบียนชั้นเรียนเดิม ไม่เลื่อนนักเรียนเป็นรายบุคคล หน้าครูอยู่ web-system ([BR-048-05 (หน้าครูยืนยันเลื่อน Level อยู่ใน sb-tech-upgrade-web-system ตาม decisions-022)](../requirement/req-048.md)); หน้าตั้งเกณฑ์อยู่ admin ส่วนกลาง

- ตาราง `SchoolBotLevel`, `SchoolBotLevelPromotionPolicy`, `SchoolBotCourseRun`, `SchoolBotLevelProposal`, `SchoolBotIdempotency` และ `SchoolBotAuditEvent` อยู่บน **SchoolBot DB (`10.0.0.128:9499`)** ตาม [decisions-027](../requirement/decisions-027.md)
- การอ่านรายชื่อนักเรียนในห้อง (roster), ข้อมูลสิ้นเทอม/เทอมถัดไป (`TTerm`) และสิทธิ์ครูรายวิชา (`TplanCourseTeacher`) อ่านจาก **School DB** ผ่าน connection แยกด้วย**บัญชี DB เดิม** ([decisions-029](../requirement/decisions-029.md))

## Policy (มติ [มติ 024 (เกณฑ์เลื่อน Level และ policy Quiz/Test)](../requirement/decisions-024.md))

- เกณฑ์ (threshold) เป็นข้อมูลราย Level ที่ admin ส่วนกลางตั้ง (staff role `level_policy_admin` ตาม [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)) ค่าเริ่ม 70.000000 ช่วง 0..100 เก็บเป็น revision immutable; proposal อ้าง revision ที่ใช้
- เงื่อนไข "สูงกว่าเกณฑ์" = strict `>` (เท่ากับเกณฑ์ไม่ผ่าน, [AC-048-04 (เฉลี่ยเท่ากับหรือต่ำกว่าเกณฑ์ไม่เสนอเลื่อน เทอมถัดไปอยู่ Level เดิมและแสดงส่วนที่ขาด (เท่ากันแสดง 0))](../requirement/req-048.md))
- ประเมินตอนสิ้นเทอม มีผลเทอมถัดไปทั้งห้อง; ไม่ถึงเกณฑ์: อยู่ Level เดิมอีกเทอม และแสดงส่วนที่ขาด
- ค่าเฉลี่ยนับนักเรียนทุกคนใน roster; กิจกรรมที่ไม่ส่ง/ไม่มีผลนับ 0 (ใช้เฉพาะการเลื่อน Level; ส่งคะแนนไม่แปลงเป็น 0 ตาม [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](des-009.md))

สูตรรวมยืนยันแล้วตาม [มติ 034 (สูตรรวมหลักสูตร น้ำหนักรอบเรียน และขอบเขตครูปรับ policy ข้อสอบ)](../requirement/decisions-034.md) ใช้ policy ที่ freeze ตาม [กฎผลเรียน](learning-rules-032-034.md); ขาด policy ที่ใช้ได้คืน 409 POLICY_NOT_CONFIGURED

## ยังไม่ยืนยัน

- แหล่ง roster ของห้อง ณ สิ้นเทอม ซึ่งยังต้องยืนยัน และวันสิ้นเทอม/เทอมถัดไปจากข้อมูลเทอมเดิม — SA ตรวจ source ก่อน build
- สิทธิ์ยืนยันเมื่อ CourseRun ผูกหลายวิชา: ข้อเสนอ SA = ครูรายวิชาคนใดก็ได้ของ `PlanCourseIds` ของ CourseRun (DES-012) โดย `If-Match` (`UpdateDate`) ร่วมกับ transaction lock บน CourseRun ต้นทางและการตรวจ finalized proposal ซ้ำตาม data-contract-rules.md กันยืนยันซ้ำข้าม proposal; ไม่มี partial unique index บังคับ

