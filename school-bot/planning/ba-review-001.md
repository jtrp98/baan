# SchoolBot — BA amendment review 001

วันที่งาน 2026-10-22; ผู้บันทึก MYCELIUM จากผล BA จริงตามคำสั่งผู้ใช้ “งั้นเรียก ba เลย”

## ผล

BA DONE, CLI exit0, เวลา 622.2 วินาที; เรียก `mycelium-role --agent codex --role ba --tier t2 --date 2026-10-22` แบบ read-only, timeout1800s ตาม [ใบงาน](task-008.md)

บันทึก amendment 17 ไฟล์เดิมและ 4 ไฟล์ใหม่ รวม **34 REQ / 132 AC** เพิ่ม 3 REQ และ 23 AC; ยืนยันธุรกิจจากคำตอบผู้ใช้วันที่ 2026-10-21 โดยคงวันที่เดิม ไม่ถือว่าผู้ใช้อนุมัติทุก AC

- [REQ-040](../requirement/req-040.md): พื้นที่ Guest ร่วม เก็บจนสั่งลบ ส่งออก ถังขยะกู้ 30 วันแล้วลบถาวร
- [REQ-041](../requirement/req-041.md): เลือกนำเข้างานหลัง Login คงต้นฉบับและกันซ้ำ
- [REQ-042](../requirement/req-042.md): ประวัติ Guest ในเครื่อง เลือกย้ายและตรวจผลใหม่ Arm รอครู
- เพิ่ม AC ใน REQ-031/033/037/038/039 สำหรับหุ่นจริง Windows, PK/FK int4 ใน DB จริง, การอนุมัติเนื้อหา และขอบเขตครูรายชื่อนักเรียน
- OQ-007 ปิดเฉพาะธุรกิจ; รวม 3 PARTIAL / 3 CLOSED งาน storage/migration contract ยังส่ง SA ไม่ถือ G-GUEST ผ่าน

หลักฐาน source/sample ที่แยกจาก scope เก็บที่ [scope-baseline-001](../requirement/scope-baseline-001.md) ไม่ตัดความสามารถระบบเต็มเพื่อคุมขนาด

## การตรวจเอกสาร

นายช่าง ตรวจไฟล์หลังบันทึก: จำนวนและ AC ต่อ REQ ตรง index; รหัส REQ เดิม31/AC เดิม109 คงครบและไม่มี AC ซ้ำ; ลิงก์ในเอกสารที่เปลี่ยนเปิดไปยังไฟล์จริงครบ; ขนาดเอกสารอยู่ในงบทุกไฟล์ Plan ทุกไฟล์มี SHA256 เดิมก่อนและหลังบันทึก

ผลตรวจแบบเครื่องอ่าน: [ba-validation-001.json](ba-validation-001.json); ฐานเดิม [ba-baseline-001.json](ba-baseline-001.json); ผล BA ฉบับเต็มรวม patch/delta mapping [ba-response-001.json](ba-response-001.json)

Report ต้นทาง: `C:/src/AICode/baan/baan/reports/2026-10-22-01-03-31-ba-tier-t2-1agents-IWkZf4/codex.answer.txt`

การตรวจนี้เป็นความถูกต้องเอกสาร ไม่มีการรันแอป API installer SQL หรือหุ่นจริง และไม่มีผล QA PASS หรือการปิด gates

## งานรับต่อ

1. **PM** ปรับ canonical plan/JSON/ใบงานและ dependencies จากฐาน74งาน/31REQ/109AC ให้สอดคล้อง 34/132 โดยคง task IDs และพิจารณาจำนวนงานเอง; รอบนี้ยังไม่แก้ plan หรือ backlog
2. **TP-001/002** เตรียม evidence matrix/fixtures ครบ AC ใหม่23ข้อและ AC เดิมที่แก้ หลัง PM รับ mapping
3. **SA-001/002** amend storage/document/import/trash contract และ provenance/reevaluation; แทน Guest profile/ข้อความรอธุรกิจด้วยมติจริง ดู technical_handoff ในผล BA
4. **BE-001** ตรวจ credential/account-profile และแหล่งรายชื่อนักเรียนต่อครูของระบบเดิม ก่อน SA/DBA เสนอ reuse/fallback; ไม่อนุมัติ SchoolBotUser หรือ grant table ใหม่จาก amendment นี้
5. **DBA** รับ physical design/PK-FK และการเก็บโครงงาน/ผลตามแบบที่ผ่านขั้นต่อไป โดยไม่รัน SQL จากงาน BA

ไม่มีคำถามธุรกิจใหม่ที่บล็อก amendment (`questions: []`) ข้อค้างสำหรับมนุษย์เป็นการตรวจ artifact ในอนาคต: ทีมร่างหลักสูตร/เกณฑ์สามโหมด, สำรวจหุ่นพร้อมผู้รับรอง/หลักฐาน และเสนอเกณฑ์ส่งมอบ/ผลติดตั้งให้ผู้ใช้ตรวจ Windows10 ยุติตาม decisions-019 ไม่เปิดถามใหม่

## Change Log

- 2026-10-22 — MYCELIUM บันทึกผล BA ตรวจเอกสาร และระบุ handoff ที่ยังรอเจ้าของแต่ละ role

- 2026-10-23 — นายช่าง (BAAN) ปรับชื่อผู้คุมจาก MYCELIUM เป็นนายช่าง ในข้อความส่งต่อ ตามการเปลี่ยนชื่อระบบเป็น BAAN (release 0.12.0) — รายการลงวันที่เดิมที่อ้าง MYCELIUM คงไว้ตามประวัติ
