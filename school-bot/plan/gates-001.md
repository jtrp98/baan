# SchoolBot — Gates และ Waiting on Human

## วิธีใช้

รายงาน Waiting on Human ก่อนงาน agent เสมอ รายการนี้ระบุสิ่งที่ต้องได้ ไม่ใช่บันทึกว่าอนุมัติแล้ว ผู้เตรียมเป็น role ผู้ตัดสินต้องเป็นมนุษย์จริงที่มีอำนาจ ชื่อ/วันที่/revision/ขอบเขตคำอนุญาตบันทึกจากคำตอบจริงเท่านั้น BA-004 เตรียมรายชื่อเจ้าของการตัดสินที่ยังขาดให้ผลิตภัณฑ์ระบุ

คง 17 gate IDs นิยาม description/refs/close_evidence ฉบับเต็มอยู่ใน [canonical JSON](tasks-001.json) ใช้ร่วมกับตารางนี้ ก่อนเริ่มส่วนที่พึ่ง gate ต้องมี artifact และหลักฐานการตัดสิน/ผลตรวจครบ การรับแผนไม่ปิด gate และ phase ไม่ใช่ barrier

## Waiting on Human

| Gate | ผู้เตรียมหลักฐาน | ผู้ตัดสิน/ผู้ให้หลักฐานที่ต้องเป็นคน | หลักฐานปิดและงานที่พึ่งพา |
|---|---|---|---|
| G-CORE | SA-001, DBA-002, BE-001, SEC-001 | เจ้าของ schema/API/security และผู้รัน test DB | core schema/API v2/host gating/custody review; test SQL/rollback/catalog/transaction receipts ก่อน DBA-003 และสาย DB/License ไม่รัน shared จาก gate นี้ |
| G-AUTH | BE-001, SA | เจ้าของระบบเดิม/ผู้ตรวจ compatibility | source:line และ sanitized credential/profile/role/tenant fixtures ก่อน BE-006 ไม่ให้ธุรกิจเดา technical facts |
| G-GUEST | BA-001, SA-001 | เจ้าของผลิตภัณฑ์/ผู้แทนผู้ใช้ | shared OS account/recovery/retention/import/history และ document v2/copy-only migration ที่ตัดสินจริง ก่อน UX-002/DBA-004/BE-009/SA-002 |
| G-LEARN | BA-002 | เจ้าของการเรียนรู้/ผลิตภัณฑ์ | inventory/criteria/rubric/ดาว/scope/คู่ผ่าน-ไม่ผ่าน ก่อน SA-002/UX-004/BA-005/006 |
| G-HW | BA-003, TP | ผู้รับผิดชอบความปลอดภัย/ผลิตภัณฑ์และผู้รับรอง | รุ่น/firmware/calibration/stop/disconnect/ฉุกเฉิน/platform matrix พร้อมคำสั่งอนุญาต test cases ก่อน QA-005..007 |
| G-DELIVERY | BA-004, TP | เจ้าของส่งมอบ/signing/ผู้ตรวจรับ | min OS/network/performance/วิธีวัด/ช่องทางแจก/เครื่องแยก และสิทธิ์ installer tests ก่อน packaging/QA ที่พึ่งพา |
| G-UX-ENTRY | UX-001 | ผู้มีอำนาจ UX | sign-off artifact revision รวม License/lease/Guest/Login/error/account switch/close ก่อน FE-001/002/005 |
| G-UX-PROJECT | UX-002 | ผู้มีอำนาจ UX | หลัง G-GUEST sign-off save/conflict/recovery/import Local/Cloud สามโหมด ก่อน FE-003 |
| G-UX-LABS | UX-003 | ผู้มีอำนาจ UX | sign-off sample/native และ predicted/written/measured/stop-requested ก่อน FE-006/007/008 ไม่ใช่ hardware approval |
| G-UX-LEARN | UX-004 | ผู้มีอำนาจ UX | หลัง G-LEARN sign-off Lessons/ผลจริง/Arm pending/error/teacher scope ก่อน FE-013 |
| G-PROJECT-DB | SA-001, DBA-004 | เจ้าของ schema/contract และผู้รัน test DB | หลัง G-GUEST review ownership/revisions/migration/constraints; SQL/rollback/catalog receipts ที่ DBA ตรวจ ก่อน BE-008 |
| G-LEARN-DB | SA-002, DBA-005 | เจ้าของ schema และผู้รัน test DB | หลัง G-GUEST/G-LEARN review version/learner/reviewer/history/fallback; SQL/rollback/catalog receipts ที่ DBA ตรวจ ก่อน BE-015 |
| G-RELEASE-DB | SA-001, DBA-006, SEC-001 | เจ้าของ schema/trust และผลิตภัณฑ์เมื่อมีคำตัดสิน scope | updater disposition ก่อน freeze; release/global uniqueness/key custody/origins review; SQL/rollback evidence ก่อน BE-018/019 และ signing ที่พึ่งพา |
| G-ROBOT-CONTRACT | SA-003 | เจ้าของ Host/robot contract | breaking payload/bounds/matching/timeout/cancel/drain-stop/compatibility review ก่อน BE-010 ไม่ใช่สิทธิ์สั่งหุ่น |
| G-SEC | SEC-002 | ผู้มีอำนาจรับความเสี่ยงเมื่อจำเป็น | RC-linked findings/retest; Critical/Important แก้หรือรับความเสี่ยงเป็นลายลักษณ์อักษรก่อน release |
| G-QA | QA-001..010, TP | ผู้รับรอง hardware/install/performance และผู้ตรวจรับ | verdict/evidence 109 AC แยกประเภทและ RC hashes; Critical/ตกครั้งสามส่งคนตัดสิน ก่อน release |
| G-RELEASE | PM-001 | เจ้าของ release/shared environment/ผู้ตรวจรับ | หลัง G-SEC/G-QA อนุมัติ RC/environment/SQL/backup/rollback/deploy/publish อย่างเจาะจง ก่อน PM-002 ประสานคนรัน |

## ประเด็น update ที่ต้องปิดก่อน contract

Task SA-001 / Reference DES-007, REQ-030, planning/review-001 / Reason: แบบมี PrepareUpdate/InstallPreparedUpdate แต่ BE-019 มี coverage check-only ให้ SA เสนอตาราง requirement/design/decision coverage และ disposition ไม่ตั้งข้อสรุปว่าต้องเพิ่มหรือตัด workflow เอง

ถ้าเป็น technical/design clarification ให้ SA เตรียมแก้ในเขตตนผ่านผู้คุม ถ้าต้องเปลี่ยน requirement หรือเป็นทางเลือกธุรกิจให้ BA/ผู้ใช้ตัดสิน ถ้าเปลี่ยน frozen release scope ต้องมีคำสั่งผู้ใช้ PM amend แผนหลังคำตัดสินจริง ไม่ใช้ gate เป็นสิทธิ์เพิ่ม scope

## กฎหลักฐาน

DBA ไม่รัน SQL ตรวจเฉพาะ scripts และ human-provided execution/catalog evidence การอนุมัติ SQL ไม่เท่ากับรัน SQL; test DB ไม่เท่ากับ shared environment ต้องมี revision/hash/environment/ผู้รันจริง และ expected/actual ของ constraints/rollback ที่เกี่ยวข้อง

Hardware gate ต้องมีคำสั่งอนุญาตกรณีจริงก่อน motion/upload/torque ไม่ใช้ dry-run หรือ OS write success ยืนยันตำแหน่ง/การหยุด การทดสอบจาก source build และจาก signed installer เป็นคนละหลักฐาน

Critical/Important security ต้องส่งคนทุกข้อ Critical QA หรือ fail ครั้งสามต้องหยุดส่งคนตัดสิน แก้ซ้ำสูงสุดสองรอบต่อ task แล้วให้คนเลือกยอมรับ/re-scope/drop ไม่มี agent ลงนามหรือเปลี่ยน scope แทน

## Change Log

- 2026-10-21 — PM รับจาก Planner; MYCELIUM บันทึกตาม adoption/render contract
