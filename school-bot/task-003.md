# SchoolBot — เปิด Planner จัดแผนระบบเต็ม

- วันที่: 2026-10-21
- คำสั่งผู้ใช้: "เรียก planner เลย"
- บทบาท: Planner t2 ผ่าน MYCELIUM แบบ read-only
- Code root: `C:/src/schoolbright/target/school-bot-v2`
- Knowledge root: `C:/src/schoolbright/knowledge/school-bot`
- สถานะ: Planner DONE; บันทึกร่างและตรวจแล้ว ดู [planning/index.md](planning/index.md) พร้อมส่ง PM
- คำสั่งจริง: `mycelium-role --agent codex --role planner --tier t2 --date 2026-10-21 --cwd C:/src/schoolbright/target/school-bot-v2 --task-file C:/src/schoolbright/knowledge/school-bot/task-003.md`
- Timeout ที่ตัวรัน resolve จริง: 1800 วินาที แบบ read-only
- รายงาน: `C:/src/AICode/baan/baan/reports/2026-10-21-12-05-17-planner-tier-t2-1agents-BsBOdk`

## ขอบเขตงาน Planner

แตกแผนพัฒนาระบบเต็มตาม REQ-009..039 รวม 31 REQ / 109 AC ให้มี phases, dependencies แบบ DAG, owner, effort, outputs และเกณฑ์เสร็จที่ตรวจได้ งานหนึ่งควรจบใน 1–2 วันทำงาน; effort เป็นสมมติฐาน ไม่ใช่กำหนดส่งจริง

แผนเป็นข้อเสนอส่ง PM ไม่ใช่การเริ่ม implementation และไม่ใช่ plan ที่พร้อมใช้กับ mycelium --plan-file. Planner ไม่เขียน knowledge/code/SQL ไม่เรียก role ต่อ ไม่แก้ REQ/DES ไม่ประกาศ QA PASS หรือ released และไม่เขียน plan.md แทน PM

## เอกสารให้อ่าน (index-first)

รากทุก path ต่อไปนี้คือ `C:/src/schoolbright/knowledge/school-bot`:

1. `index.md`, `requirement/index.md`, `design/index.md`, `open-questions/index.md`
2. `requirement/scope.md`
3. REQ ที่ให้เปิดโดยตรง: `requirement/req-009.md`, `requirement/req-010.md`, `requirement/req-011.md`, `requirement/req-012.md`, `requirement/req-013.md`, `requirement/req-014.md`, `requirement/req-015.md`, `requirement/req-016.md`, `requirement/req-017.md`, `requirement/req-018.md`, `requirement/req-019.md`, `requirement/req-020.md`, `requirement/req-021.md`, `requirement/req-022.md`, `requirement/req-023.md`, `requirement/req-024.md`, `requirement/req-025.md`, `requirement/req-026.md`, `requirement/req-027.md`, `requirement/req-028.md`, `requirement/req-029.md`, `requirement/req-030.md`, `requirement/req-031.md`, `requirement/req-032.md`, `requirement/req-033.md`, `requirement/req-034.md`, `requirement/req-035.md`, `requirement/req-036.md`, `requirement/req-037.md`, `requirement/req-038.md`, `requirement/req-039.md`
4. มติผู้ใช้: `requirement/decisions-001.md`, `requirement/decisions-002.md`, `requirement/decisions-003.md`, `requirement/decisions-004.md`, `requirement/decisions-005.md`, `requirement/decisions-006.md`, `requirement/decisions-007.md`, `requirement/decisions-008.md`, `requirement/decisions-009.md`, `requirement/decisions-010.md`, `requirement/decisions-011.md`, `requirement/decisions-012.md`, `requirement/decisions-013.md`
5. OQ: `open-questions/oq-006.md`, `open-questions/oq-007.md`, `open-questions/oq-008.md`, `open-questions/oq-009.md`, `open-questions/oq-010.md`, `open-questions/oq-011.md`

ยังไม่มี plan/index.md หรือ backlog.md; ไม่ต้องเปิด path ที่ยังไม่มี ไม่อ่าน source/หมวดอื่นนอก brief. ใช้ DES IDs และ references จาก design/index.md สำหรับวางแผน ไม่ต้อง audit source/DBML ใหม่ในงานนี้

## Baseline ที่ต้องรักษา

- ระบบเต็มใช้งานจริง ไม่ตัดเป็น MVP/PoC: Block / Arm / Code พร้อม Lessons แยกจาก Labs
- Guest เก็บหลายโครงงานใน local; Login เก็บหลายโครงงานบน DB/Cloud
- API ทุกอย่างรวม Login ทำใน school-bot-v2/web; App เรียก HTTPS ไม่เข้าถึง DB โดยตรง ใช้ User/DB เดิมทั้ง 4 domain จาก Academic ไม่สร้าง SchoolBotUser ซ้ำ
- PK/FK ที่อ้าง PK ของตาราง SchoolBot ใหม่เป็น int4; prefix/PK name/audit ทั้ง 6 ฟิลด์ตาม REQ-033. DBML 16 ตารางผ่าน parser และผู้ใช้ยืนยันเป็น logical baseline แล้วตาม decisions-013; ไม่ถามยืนยัน PK/diagram ซ้ำ Physical DDL/constraints และตำแหน่งที่ pending เป็นงาน DBA ต่อ ไม่ถือว่า SQL ถูกสร้างหรือรันแล้ว
- License บังคับทั้ง Guest/Login; 1 Key ต่อ 1 เครื่อง; first activation online; offline lease 3 วันจาก online check สำเร็จเท่านั้น; admin ย้ายได้ทันทีและยอมให้เครื่องเดิม offline จน lease เดิมหมด ไม่เพิ่มจำนวนเครื่องหรือเลื่อนย้าย 3 วัน
- หลักสูตร/ภารกิจ/ประเมิน/ความคืบหน้าจริง; Code/Block ตรวจอัตโนมัติ, Arm ครูตรวจ
- Windows และ macOS ต้องควบคุมหุ่นจริง; Mac source transport ยังต้องพัฒนา ไม่ส่ง simulator แทน
- API/engine bounds, native/sample separation, predicted/written/measured/stop-requested semantics คงตาม REQ; ต้องมีงานทดสอบจริงกับหุ่น/installer ภายหลังตามอุปกรณ์และเกณฑ์ที่คนยืนยัน
- MYCELIUM timeout แก้แล้วและ tests 85/85 เป็นผลตัวรัน ไม่ใช่ผล QA SchoolBot ไม่มี implementation ของ SchoolBot ที่ถือ completed จากงานเอกสารนี้

## ลำดับและประตูที่ให้วางในแผน

เริ่มฐาน backend/DB integration → License → Login แล้วต่อหลายโครงงาน ระบบเรียนรู้ และสามโหมด โดยแตกตาม dependency จริง Backend ก่อน FE เมื่อใช้ API contract ร่วมกัน; DBA/UX/TP และงานเทคนิคที่ไม่พึ่งกันทำขนานได้

ต้องมีงานตรวจ legacy password/profile/role compatibility จาก source เดิมก่อนเขียน auth ที่ใช้จริง ไม่เดา hash หรือ ID mapping และไม่ทำให้กลายเป็น OQ ว่า API จะอยู่ไหนอีก

เก็บประเด็นค้างเป็น gate/task ที่ชัดพร้อม refs และสิ่งที่ใช้ปิด gate: Guest shared-machine/recovery/import, scope ครู/criteria, รุ่นบอร์ด/calibration/stop/ผู้รับรอง, min OS/signing/performance/ผู้ตรวจรับ. OQ PARTIAL ไม่ใช่เหตุให้หยุดการวางแผนส่วนที่เป็นอิสระ และไม่เปิดคำถามธุรกิจใหม่ที่ไม่จำเป็น

UX sign-off ก่อน FE ที่พึ่ง flow; physical schema/breaking contract review และมนุษย์รัน SQL ตามงานนั้น; QA/Sec/hardware/install acceptance ก่อน release. งานที่สร้าง SQL/rollback ต้องทำให้ review ได้ก่อนขอคนรัน ห้ามนับการยืนยัน DBML เป็นผล physical test หรือการรัน SQL

## รูปแบบผลส่งมอบ

ดู [brief-output-001.md](planning/brief-output-001.md) ซึ่งเก็บข้อกำหนด output ที่ส่งให้ Planner ครบโดยไม่เปลี่ยนเนื้อหา

## Change Log

- 2026-10-21 — Planner จบ exit 0 / DONE ใน 681.9s; รับ 74 tasks / 8 phases / 17 gates ตรวจ IDs/DAG/tier/effort/first wave และ mapping 31 REQ/109 AC ผ่าน เก็บประเด็นส่ง PM ใน planning/review-001.md โดยไม่เปิด implementation
- 2026-10-21 — เปิด Planner CLI จริง; แยกข้อกำหนด output เพื่อคุมขนาดโดยไม่เปลี่ยน prompt ที่ส่งไปแล้ว
- 2026-10-21 — MYCELIUM สร้าง brief ตามคำสั่งผู้ใช้ให้เรียก Planner โดยรับ logical baseline ที่ยืนยันแล้วและคง scope ระบบเต็ม
