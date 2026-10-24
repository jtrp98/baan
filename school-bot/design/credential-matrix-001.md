# SA-004 — Credential matrix — Rev1

ร่างเพื่อ SEC001-002 และ [export proof pack](export-proof-pack-001.md); สถานะที่ [index](index.md). ไม่เก็บค่า secret/connection string และไม่สร้างบัญชี/GRANT. Topology ยังคง client→HTTP G→gRPC B; worker/adapter เป็น process ภายในของบริการ SchoolBot ไม่ใช่ public API อีกตัว

## สิทธิ์ที่ต้องใช้เทียบกับหลักฐานจริง

| Process | บัญชี/identity | อ่านที่จำเป็น | เขียนที่จำเป็น | สิทธิ์จริง/สิ่งที่ยังไม่พิสูจน์ |
|---|---|---|---|---|
| G public edge / W/admin BFF | identity เดิมของแต่ละระบบ; ชื่อ deploy ยังไม่ทราบ | route/auth ตามขอบเขต G เดิม; ไม่อ่าน PGGradeDB เพื่อ SchoolBot | ไม่มี grade write ของ SchoolBot | ไม่ได้สำรวจ secret mounts/DB grants ของระบบเดิม; ไม่กล่าวว่า G ถือ PG credential จากคำว่า public API |
| B service API | login DB account ยังไม่ทราบ; `schoolbot_app` เป็น role NOLOGIN ใน DDL | SchoolBot session/license/roles/projects/content/results/preview/export | domain+idempotency+audit ตาม DES; confirm สร้าง outbox | `Program.cs:45–46` อ่าน key ชื่อ SCHOOL_BOT_DB_CONNECTION_STRING สำหรับ logout; ไม่อ่านค่า. DDL role ให้ SELECT/INSERT/UPDATE กว้างกว่าราย operation ไม่พิสูจน์ actual LOGIN membership |
| B directory/authorization | บัญชี Master/School เดิม ชื่อยังไม่ทราบ | directory/profile, ครู/roster/term แบบ select เฉพาะคอลัมน์; ไม่ทำ password verifier ซ้ำ | ไม่มี legacy write ตามแบบ | ไม่ทราบ actual grants/ขอบเขตข้าม tenant; School DB residual ยังคง Important ตาม mitigation แม้ใช้ query filter |
| B API สำหรับ preview/confirm | **ไม่มี PGGradeDB credential ในข้อเสนอ process boundary** | เรียก adapter ภายในให้อ่าน grade context/snapshot | enqueue เท่านั้น ไม่เรียก PG write connection | ต้องพิสูจน์ API start ได้เมื่อไม่มี PG secret และ DI resolve connection/writer ไม่ได้; ยังไม่มีหลักฐาน deploy |
| grade worker/adapter process ภายใน | บัญชี PGGradeDB เดิม ชื่อยังไม่ทราบ; runtime identity แยกจาก B | PGTGrade/PGTAssessment/PGTGradeDetail/PGTGradeEdits/PGTGradeSetting/PGTGradeAuditLog ตาม DES-009 | เปลี่ยนช่อง owned ใน PGTGradeDetail และ derived fields ที่ parity ยืนยัน; INSERT receipt ใน PGTGradeAuditLog | ต้องให้เจ้าของยืนยันชื่อบัญชีและสิทธิ์จริง; ไม่อ้างว่า DB จำกัดรายช่อง. ไม่มีสิทธิ์สร้าง schema/แถวปลายทางที่ขาดโดยการอนุมาน |
| grade worker/adapter process ภายใน | SchoolBot LOGIN ยังไม่ทราบ (role ที่มีอยู่ตาม DDL) | confirmed snapshot/outbox/ownership และข้อมูลตรวจสิทธิ์ก่อน apply | lease/outbox/receipt linkage/audit ใน SchoolBot DB | DDL เป็นร่าง ไม่ได้พิสูจน์ runtime membership/transaction. ถ้าต้องอ่าน School DB ใช้บัญชีเดิมเฉพาะ process ที่จำเป็นและบันทึก grants จริง |
| grader process | SchoolBot LOGIN ยังไม่ทราบ | job/submission/revision/approved criteria | lease/assessment/current pointer/audit | evaluator ไม่ควรถือ PGGradeDB/legacy passwords; ไม่รับรอง isolation จากเอกสารเพียงอย่างเดียว |
| Desktop/renderer/engines | ไม่มี DB account | ผ่าน host/API ตามสิทธิ์ | ไม่มี direct DB write | ห้ามฝัง credential ใน payload; device/private key ตาม custody ไม่ใช่ DB identity |

## เงื่อนไขตรวจรับ matrix

เจ้าของ DB/infra เติมต่อแถว: ชื่อ LOGIN จริง (ไม่ใช่ค่า secret), inherited roles, SELECT/INSERT/UPDATE/DELETE/DDL จริงแยก schema/table, secret-key name/mount, OS/service identity, deploy unit และเจ้าของอนุมัติ. ถ้าใช้บัญชีกว้างให้ระบุส่วนเกินจริง ไม่เขียนคำว่า read-only จากความตั้งใจของ query. `schoolbot_app` ใน `db/schoolbot_db.sql:29,34,200–206` เป็น role NOLOGIN/USAGE/SELECT INSERT UPDATE; ไม่มีหลักฐานว่า role นี้คือ login ที่ deploy

PG preview/confirm และ write ต้องผ่าน worker/adapter ภายในทั้งคู่เพื่อให้ B API ไม่มี PG credential จริง ตาม security-mitigation-001 MUST-1..5. ช่องภายในต้องมี peer authentication/private exposure, ไม่รับ arbitrary SQL/URL/ปลายทาง/SchoolId จาก client; tenant/actor มาจาก session ที่ B ตรวจและ adapter ตรวจ context ซ้ำ. วิธี peer auth/host/TLS รอเจ้าของตาม H5 ไม่เลือกแทน. แยก process อย่างเดียวแต่ใช้ secret mount ร่วมไม่ถือว่าผ่าน

หลักฐานต้องมี config **ชื่อ key เท่านั้น**, composition-root registration ของสอง process, negative DI test, cross-tenant tests, receipt/reconcile และตัวอย่าง log ที่ไม่มี password/hash/token. การพิสูจน์บัญชีจริง/ฐานทดสอบให้เจ้าของดำเนินการภายใต้ gate เดิม; เอกสารนี้ไม่อนุญาต connection หรือ SQL

## ทางเลือกและสิ่งที่ส่งคน

เลือกแยก process/config โดย reuse adapter/outbox เดิม; ปัดตกการซ่อน B หลัง G หรือ query filter เป็นเหตุอ้างว่า credential แคบลง. บัญชี read-only ที่มีอยู่แล้วเป็นทางเลือกถ้าเจ้าของยืนยันว่ามี; ไม่สร้าง role/GRANT ใน School/PGGradeDB สวน decisions-029. ถ้าแยก secret/process ไม่ได้หรือบัญชียังกว้าง ให้เจ้าของ DB/infra ระบุข้อจำกัดให้ jpo ประเมินก่อนส่งผู้มีอำนาจรับ residual เป็นลายลักษณ์อักษร; ไม่รับความเสี่ยงแทนคน

## Change Log
- 2026-10-24 — Rev1: ใบงาน060a เตรียม matrix process/account/สิทธิ์ที่ต้องใช้ และช่องหลักฐานจริง; ไม่อ้างว่าตรวจ grants แล้ว
