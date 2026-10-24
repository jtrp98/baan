# SchoolBot — Gates และ Waiting on Human

## วิธีใช้

รายงาน Waiting on Human ก่อนงาน agent เสมอ รายการนี้ระบุสิ่งที่ต้องได้ ไม่ใช่บันทึกว่าอนุมัติแล้ว ผู้เตรียมเป็น role ผู้ตัดสินต้องเป็นมนุษย์จริงที่มีอำนาจ ชื่อ/วันที่/revision/ขอบเขตคำอนุญาตบันทึกจากคำตอบจริงเท่านั้น BA-004 เตรียมรายชื่อเจ้าของการตัดสินที่ยังขาดให้ผลิตภัณฑ์ระบุ

คง 17 gate IDs นิยาม description/refs/close_evidence ฉบับเต็มอยู่ใน [canonical JSON](tasks-001.json) ใช้ร่วมกับตารางนี้ ก่อนเริ่มส่วนที่พึ่ง gate ต้องมี artifact และหลักฐานการตัดสิน/ผลตรวจครบ การรับแผนไม่ปิด gate และ phase ไม่ใช่ barrier

## Waiting on Human

| Gate | ผู้เตรียมหลักฐาน | ผู้ตัดสิน/ผู้ให้หลักฐานที่ต้องเป็นคน | หลักฐานปิดและงานที่พึ่งพา |
|---|---|---|---|
| G-CORE | arch/vault/sys/jpo | เจ้าของ schema/API/security และผู้รัน test DB | มติ/สิ่งค้างเฉพาะ G-CORE ตาม [evidence-002](evidence-002.md); ไม่มีหลักฐานปิด gate ในรอบนี้ |
| G-AUTH | sys/arch | เจ้าของระบบเดิม/ผู้ตรวจ compatibility | มติ/สิ่งค้างเฉพาะ G-AUTH ตาม [evidence-002](evidence-002.md); ไม่มีหลักฐานปิด gate ในรอบนี้ |
| G-GUEST | spec/arch | เจ้าของผลิตภัณฑ์/ผู้แทนผู้ใช้ | มติ/สิ่งค้างเฉพาะ G-GUEST ตาม [evidence-002](evidence-002.md); ไม่มีหลักฐานปิด gate ในรอบนี้ |
| G-LEARN | spec | เจ้าของการเรียนรู้/ผลิตภัณฑ์ | มติ/สิ่งค้างเฉพาะ G-LEARN ตาม [evidence-002](evidence-002.md); ไม่มีหลักฐานปิด gate ในรอบนี้ |
| G-HW | BA-003, TP | ผู้รับผิดชอบความปลอดภัย/ผลิตภัณฑ์และผู้รับรอง | รุ่น/firmware/calibration/stop/disconnect/ฉุกเฉิน/platform matrix พร้อมคำสั่งอนุญาต test cases ก่อน QA-005..007 |
| G-DELIVERY | spec/inspect | เจ้าของส่งมอบ/signing/ผู้ตรวจรับ | มติ/สิ่งค้างเฉพาะ G-DELIVERY ตาม [evidence-002](evidence-002.md); ไม่มีหลักฐานปิด gate ในรอบนี้ |
| G-UX-ENTRY | UX-001 | ผู้มีอำนาจ UX | sign-off artifact revision รวม License/lease/Guest/Login/error/account switch/close ก่อน FE-001/002/005 |
| G-UX-PROJECT | UX-002 | ผู้มีอำนาจ UX | หลัง G-GUEST sign-off save/conflict/recovery/import Local/Cloud สามโหมด ก่อน FE-003 |
| G-UX-LABS | UX-003 | ผู้มีอำนาจ UX | sign-off sample/native และ predicted/written/measured/stop-requested ก่อน FE-006/007/008 ไม่ใช่ hardware approval |
| G-UX-LEARN | int (UX-004..007) | ผู้มีอำนาจ UX | มติ/สิ่งค้างเฉพาะ G-UX-LEARN ตาม [evidence-002](evidence-002.md); ไม่มีหลักฐานปิด gate ในรอบนี้ |
| G-PROJECT-DB | SA-001, DBA-004 | เจ้าของ schema/contract และผู้รัน test DB | หลัง G-GUEST review ownership/revisions/migration/constraints; SQL/rollback/catalog receipts ที่ DBA ตรวจ ก่อน BE-008 |
| G-LEARN-DB | arch/vault | เจ้าของ schema และผู้รัน test DB | มติ/สิ่งค้างเฉพาะ G-LEARN-DB ตาม [evidence-002](evidence-002.md); ไม่มีหลักฐานปิด gate ในรอบนี้ |
| G-RELEASE-DB | SA-001, DBA-006, SEC-001 | เจ้าของ schema/trust และผลิตภัณฑ์เมื่อมีคำตัดสิน scope | updater disposition ก่อน freeze; release/global uniqueness/key custody/origins review; SQL/rollback evidence ก่อน BE-018/019 และ signing ที่พึ่งพา |
| G-ROBOT-CONTRACT | SA-003 | เจ้าของ Host/robot contract | breaking payload/bounds/matching/timeout/cancel/drain-stop/compatibility review ก่อน BE-010 ไม่ใช่สิทธิ์สั่งหุ่น |
| G-SEC | SEC-002 | ผู้มีอำนาจรับความเสี่ยงเมื่อจำเป็น | RC-linked findings/retest; Critical/Important แก้หรือรับความเสี่ยงเป็นลายลักษณ์อักษรก่อน release |
| G-QA | check/inspect | ผู้รับรอง hardware/install/performance และผู้ตรวจรับ | มติ/สิ่งค้างเฉพาะ G-QA ตาม [evidence-002](evidence-002.md); ไม่มีหลักฐานปิด gate ในรอบนี้ |
| G-RELEASE | gm | เจ้าของ release/shared environment/ผู้ตรวจรับ | มติ/สิ่งค้างเฉพาะ G-RELEASE ตาม [evidence-002](evidence-002.md); ไม่มีหลักฐานปิด gate ในรอบนี้ |

## ประเด็น update ที่ต้องปิดก่อน contract

Task SA-001 / Reference DES-007, REQ-030, planning/review-001 / Reason: แบบมี PrepareUpdate/InstallPreparedUpdate แต่ BE-019 มี coverage check-only ให้ SA เสนอตาราง requirement/design/decision coverage และ disposition ไม่ตั้งข้อสรุปว่าต้องเพิ่มหรือตัด workflow เอง

ถ้าเป็น technical/design clarification ให้ SA เตรียมแก้ในเขตตนผ่านผู้คุม ถ้าต้องเปลี่ยน requirement หรือเป็นทางเลือกธุรกิจให้ BA/ผู้ใช้ตัดสิน ถ้าเปลี่ยน frozen release scope ต้องมีคำสั่งผู้ใช้ PM amend แผนหลังคำตัดสินจริง ไม่ใช้ gate เป็นสิทธิ์เพิ่ม scope

## กฎหลักฐาน

DBA ไม่รัน SQL ตรวจเฉพาะ scripts และ human-provided execution/catalog evidence การอนุมัติ SQL ไม่เท่ากับรัน SQL; test DB ไม่เท่ากับ shared environment ต้องมี revision/hash/environment/ผู้รันจริง และ expected/actual ของ constraints/rollback ที่เกี่ยวข้อง

Hardware gate ต้องมีคำสั่งอนุญาตกรณีจริงก่อน motion/upload/torque ไม่ใช้ dry-run หรือ OS write success ยืนยันตำแหน่ง/การหยุด การทดสอบจาก source build และจาก signed installer เป็นคนละหลักฐาน

Critical/Important security ต้องส่งคนทุกข้อ Critical QA หรือ fail ครั้งสามต้องหยุดส่งคนตัดสิน แก้ซ้ำสูงสุดสองรอบต่อ task แล้วให้คนเลือกยอมรับ/re-scope/drop ไม่มี agent ลงนามหรือเปลี่ยน scope แทน

ใช้ [evidence-002](evidence-002.md) Rev2 แยกมติที่ยืนยันแล้วจากหลักฐานค้าง; export G-PARITY/COEXIST/TARGET/AUTHZ/DB เป็น preconditions ย่อยใต้ G-LEARN-DB เฉพาะงานเขียนเกรด คง17gateIDs

## Precedence 051 — 2026-10-24

G-AUTH/H5 ใช้ [evidence-002](evidence-002.md) ฉบับ051 และ Gateway Rev3: gRPC/035/cType ตอบแล้ว; รอ contract/RPC+HTTP mapping/auth/tenant trust และ Light implementation review. 4032 local tests ไม่ปิด Gateway/gRPC/DB gate; ไม่เพิ่ม gate/คำถามธุรกิจ.

## Change Log
- 2026-10-24 — ใบงาน051: sync หลักฐาน transport; คง17 gates และเงื่อนไขอนุมัติเดิม.

- 2026-10-23 — Rev2: นโยบายตอบแล้วไม่ปิด SQL/UX/QA/security/release; ไม่ถามOQ014/016/Learner Aซ้ำ

- 2026-10-21 — PM รับจาก Planner; MYCELIUM บันทึกตาม adoption/render contract
