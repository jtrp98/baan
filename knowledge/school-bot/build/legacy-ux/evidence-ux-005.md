# UX-005 — หลักฐานแบบ admin หลักสูตรและคลังข้อสอบ

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย int · ขอโดย ผู้ใช้ (ใบงาน 095 — จัดหลักฐานแบบที่อนุมัติแล้ว)

เชื่อมเกณฑ์ตรวจรับ (Acceptance Criteria: AC) ทั้ง 12 ข้อกับแบบที่ผู้ใช้อนุมัติ Q39–Q42 วันที่ 2026-10-26 ตามมติ 043 ไม่มีการเปลี่ยนหน้าจอ ข้อความ หรือ interaction

## ฐานอนุมัติ

- [หลัก: admin หลักสูตร](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-curriculum.md) §1–3
- [นำเข้า/คลัง: Sheet และข้อสอบ](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-import-bank.md) §4–5
- [สถานะ: ทุกพื้นที่ข้อมูล](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-states.md) S1–S5
- [Sign-off Q39–Q42](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-review-signoff.md): ผู้ใช้ / 2026-10-26 ครบทุกส่วน ไม่มีข้อเสนอใหม่รอเซ็น

ใช้ DES-005 (หลักสูตร) Rev9, DES-010 (คลังข้อสอบและ Attempt) Rev6, DES-012 (auth) Rev9 และสัญญาย่อยตาม [เงื่อนไขร่วม](evidence-ux-preconditions.md)

## ตารางราย AC

**Actual ทุกแถว:** ครบสำหรับการชี้แบบที่อนุมัติและ expected; UI/runtime ยังไม่ได้ทดสอบในงานนี้ คอลัมน์สุดท้ายเป็นหลักฐานที่ check ต้องรับจาก implementation ก่อนตัดสินพฤติกรรมจริง

| AC และความหมาย | หน้าจอ/สถานะอนุมัติ | Expected | ข้อจำกัด/actual ที่ยังขาด |
|---|---|---|---|
| AC-044-01 ย้ายลำดับคงรหัส | หลัก §2; สถานะ S2 | ขึ้น/ลงย้าย 6→7; LessonKey และการอ้างผลเดิมคงเดิม | ผลอ่านก่อน/หลังและประวัติเดิม |
| AC-044-02 เปิดร่างที่แก้แล้ว | หลัก §2; สถานะ S1 | “บันทึกฉบับร่างแล้ว” หลัง server ยืนยัน; เปิดกลับเห็นเนื้อหาใหม่ | save/read-back; draft contract มีแล้ว |
| AC-044-03 เผยแพร่พร้อมหลักฐาน | หลัก §3; สถานะ S2/S4 | ขาดหลักฐานหรือเป็นผู้สร้าง/ผู้แก้ร่างเผยแพร่ไม่ได้; สำเร็จเห็นที่มา ผู้อนุมัติ เวลา | four-eyes ทุก contributor/approval read-back; storage ยังรอคน |
| AC-044-04 ผู้เรียนคงฉบับเดิม | หลัก §3 | publish ฉบับ 4 แล้วผู้เรียนฉบับ 3 ยังเปิดบทเรียนและผลฉบับ 3 | session ผู้เรียนเดิมก่อน/หลัง publish |
| AC-044-05 ไม่แก้ published | หลัก §3 | อ่านอย่างเดียว; “สร้างฉบับแก้ไขใหม่” ไม่เปลี่ยนฉบับเก่า | published read-back เทียบฉบับใหม่ |
| AC-045-01 D=TRUE ยัง draft | นำเข้า/คลัง §4; สถานะ S3 | “ตรวจแล้วจากต้นทาง — ยังไม่เผยแพร่” พร้อมที่มา | preview ทำ local ได้; provenance/persistence รอ storage/source identity |
| AC-045-02 ไม่นำ O มาใช้ | นำเข้า/คลัง §4 | เปลี่ยน O อย่างเดียวแล้วเนื้อหา รหัส ลำดับไม่เปลี่ยน | supplied rows คู่ก่อน/หลัง; import จริงยังรอ |
| AC-045-03 สื่อสองชุด Lesson เดิม | นำเข้า/คลัง §4 | P–X แสดง “สื่อชุดที่ 2” ใต้ Lesson เดิม ไม่เพิ่ม Course/Level | preview และ read-back หลัง persistence พร้อม |
| AC-045-04 รหัสแยก C/Unit | หลัก §2; นำเข้า/คลัง §4 | C ไม่ตรง Unit ยังแสดง LessonKey แยก; ย้ายลำดับ key คงเดิม | manifest ผูก stable key ไม่เดาจาก C/Unit/O |
| AC-043-01 ส่วนกลางแก้ โรงเรียนเลือก | หลัก §1–3; สถานะ S5 | staff author แก้ร่าง; school_web เลือก published แต่แก้กลางไม่ได้ | ผลสิทธิ์สองช่องทาง; H5 ยังรอ |
| AC-046-01 อ่าน policy จริง | นำเข้า/คลัง §5 | เห็นครั้ง เฉลย เวลา สุ่มจากค่าที่บันทึก; Test ไม่มีเวลาเผยแพร่ไม่ได้ | Activity policy read-back ไม่อนุมานจากชื่อ |
| AC-046-04 bank ใหม่คงอดีต | นำเข้า/คลัง §5 | คงคำถาม ลำดับ เกณฑ์ policy และผล attempt เดิม | history/snapshot ด้วยสิทธิ์ผู้เรียน/ครู; ไม่เพิ่มหน้าประวัติใน admin |

## สถานะและการเข้าถึงที่ตรวจประกอบ

ใช้สถานะ S1–S5 และ [error/a11y](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-errors-a11y.md): loading, empty, read error, disabled พร้อมเหตุผล, read-only, ข้อมูลผิดรูป, conflict และ unknown mutation ผลค้างใช้ “ยังไม่ทราบว่าบันทึกสำเร็จหรือไม่ — ตรวจสอบผลก่อนทำรายการใหม่” ไม่แสดง success ก่อน server ยืนยัน ตรวจ keyboard ขึ้น/ลง, focus, label, contrast และ reduced-motion ตามแบบเดิม

## หลักฐาน

- [มติ 043 อนุมัติ UX-005/007](../../shared/decisions/decisions-043.md); [trace เดิมครบ 12 ข้อ](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-trace-acceptance.md)
- [REQ-043 หลักสูตรกลาง](../../modules/quiz/shared/requirements/req-043.md), [REQ-044 revision](../../modules/quiz/shared/requirements/req-044.md), [REQ-045 Sheet](../../modules/quiz/shared/requirements/req-045.md), [REQ-046 ข้อสอบ](../../modules/quiz/shared/requirements/req-046.md)
- รายการ AC ตรวจตรง build/plan/tasks-001.json รายการ UX-005 และ build/plan/UX-005.md วันที่ 2026-11-03; [preconditions และ DES ปัจจุบัน](evidence-ux-preconditions.md)
