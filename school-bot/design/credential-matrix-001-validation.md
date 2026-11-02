# SA-004 — Credential matrix — เงื่อนไขตรวจรับ matrix

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [SA-004 — Credential matrix](credential-matrix-001.md) ส่วนนี้อธิบายเงื่อนไขตรวจรับ matrix อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](des-009.md) · [SA-004 (งานเตรียมหลักฐานความปลอดภัยและ export)](export-proof-pack-001.md)

| Process / deploy unit | บัญชี/identity | อ่านที่จำเป็น | เขียนที่จำเป็น | สิทธิ์ที่มีผลจริง (effective privileges) / สิ่งที่ยังไม่พิสูจน์ |
|---|---|---|---|---|
| HTTP API Gateway public edge / W/admin BFF | identity เดิมของแต่ละระบบ; ชื่อ deploy ยังไม่ทราบ | route/auth ตามขอบเขต HTTP API Gateway เดิม; ไม่อ่าน PGGradeDB เพื่อ SchoolBot | ไม่มี grade write ของ SchoolBot | ไม่ได้สำรวจ secret mounts/DB grants ของระบบเดิม; ไม่กล่าวว่า HTTP API Gateway ถือ PG credential จากคำว่า public API |
| SchoolBot gRPC service service API | login DB account ยังไม่ทราบ; ร่าง DDL ไม่สร้าง role หรือกำหนดสิทธิ์ฐานข้อมูล | SchoolBot session/license/roles/projects/content/results/preview/export | domain+idempotency+audit ตาม DES; confirm สร้าง outbox | `Program.cs:45–46` อ่าน key ชื่อ SCHOOL_BOT_DB_CONNECTION_STRING สำหรับ logout; ไม่อ่านค่า. ร่าง DDL ไม่กำหนดสิทธิ์ SELECT/INSERT/UPDATE; ยังไม่มีหลักฐานสิทธิ์จริงของบัญชีที่ deploy |
| SchoolBot gRPC service directory/authorization | บัญชี Master/School เดิม ชื่อยังไม่ทราบ | directory/profile, ครู/roster/term แบบ select เฉพาะคอลัมน์; ไม่ทำ password verifier ซ้ำ | ไม่มี legacy write ตามแบบ | ไม่ทราบ actual grants/ขอบเขตข้าม tenant; School DB residual ยังคง Important ตาม mitigation แม้ใช้ query filter |
| SchoolBot gRPC service API สำหรับ preview/confirm | **ไม่มี PGGradeDB credential ในข้อเสนอ process boundary** | เรียก adapter ภายในให้อ่าน grade context/snapshot | enqueue เท่านั้น ไม่เรียก PG write connection | ต้องพิสูจน์ API start ได้เมื่อไม่มี PG secret และ DI resolve connection/writer ไม่ได้; ยังไม่มีหลักฐาน deploy |
| grade worker/adapter process ภายใน | บัญชี PGGradeDB เดิม ชื่อยังไม่ทราบ; runtime identity แยกจาก SchoolBot gRPC service | PGTGrade/PGTAssessment/PGTGradeDetail/PGTGradeEdits/PGTGradeSetting/PGTGradeAuditLog ตาม DES-009 | เปลี่ยนช่อง owned ใน PGTGradeDetail และ derived fields ที่ parity ยืนยัน; INSERT receipt ใน PGTGradeAuditLog | ต้องให้เจ้าของยืนยันชื่อบัญชีและสิทธิ์จริง; ไม่อ้างว่า DB จำกัดรายช่อง. ไม่มีสิทธิ์สร้าง schema/แถวปลายทางที่ขาดโดยการอนุมาน |
| grade worker/adapter process ภายใน | SchoolBot LOGIN ยังไม่ทราบ; ร่าง DDL ไม่สร้าง role | confirmed snapshot/outbox/ownership และข้อมูลตรวจสิทธิ์ก่อน apply | lease/outbox/receipt linkage/audit ใน SchoolBot DB | DDL เป็นร่าง ไม่ได้พิสูจน์ runtime membership/transaction. ถ้าต้องอ่าน School DB ใช้บัญชีเดิมเฉพาะ process ที่จำเป็นและบันทึก grants จริง |
| grader process | SchoolBot LOGIN ยังไม่ทราบ | job/submission/revision/approved criteria | lease/assessment/current pointer/audit | evaluator ไม่ควรถือ PGGradeDB/legacy passwords; ไม่รับรอง isolation จากเอกสารเพียงอย่างเดียว |
| Desktop/renderer/engines | ไม่มี DB account | ผ่าน host/API ตามสิทธิ์ | ไม่มี direct DB write | ห้ามฝัง credential ใน payload; device/private key ตาม custody ไม่ใช่ DB identity |

รหัสอ้างอิงที่ปรากฏในบันทึกเดิม: SA-004.
