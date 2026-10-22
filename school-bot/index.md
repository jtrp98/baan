# school-bot — Knowledge Index

## สถานะปัจจุบัน

- สร้าง knowledge ใหม่ตามคำสั่งผู้ใช้
- ตาราง SchoolBot อยู่ SchoolBot DB 10.0.0.128:9499 ตาม [decisions-027](requirement/decisions-027.md) (ไม่ใช่ School DB)
- PK ของตาราง SchoolBot ใหม่เป็น `int4` ตาม [มติผู้ใช้](requirement/decisions-012.md); มี [DBML](design/schoolbot.dbml) สำหรับ dbdiagram.io และปรับ timeout MYCELIUM แล้ว
- API ทั้งหมดรวม Login อยู่ `target/school-bot-v2/web`; แอปเรียก API และ backend ใช้ User/DB เดิมทั้ง 4 ตัว ดู [มติ API](requirement/decisions-010.md), [มติ DB](requirement/decisions-011.md) และ [ผลตรวจบัญชีเดิม](source-review-002.md)
- เป้าหมายล่าสุดจากผู้ใช้: ทำระบบเต็มใช้งานจริงครบทุกส่วน ดู [มติระบบเต็ม](requirement/decisions-002.md)
- โครงสร้างหลัก: Block / Arm / Code มีหน้าบทเรียนแยกจากพื้นที่สร้างงาน ดู [ผลตรวจโค้ด](source-review-001.md) และ [มติ 3 โหมด](requirement/decisions-003.md)
- Windows และ macOS ต้องควบคุมหุ่นจริงได้ทั้งคู่ ดู [มติ OS](requirement/decisions-008.md); ฝั่ง macOS ยังต้องพัฒนาจากโค้ดเดิม
- เป้าหมาย OS ล่าสุด Windows11 25H2 x64 และ macOS15+ Intel/AppleSilicon ตาม [decisions-019](requirement/decisions-019.md) แทนข้อกำหนด Windows10 เดิม
- Guest และ Login เก็บหลายโครงงานทุกโหมด; Code/Block ประเมินอัตโนมัติ Arm ให้ครูตรวจ ดู [มติผู้ประเมิน](requirement/decisions-009.md); Guest ใช้พื้นที่ร่วมและเลือกนำเข้างาน/ประวัติหลัง Login ตาม [มติ Guest](requirement/decisions-014.md)
- Guest ลบเข้าถังขยะกู้ได้ 30 วัน; ทีมร่างหลักสูตรสามโหมดให้ผู้ใช้ตรวจ ครูดูแลเฉพาะรายชื่อนักเรียนที่ผู้ดูแลกำหนด ดู [มติชุด 2](requirement/decisions-015.md)
- ต้องมี License ก่อนใช้แอปทั้ง Guest/Login; ตาราง `SchoolBotLicense` ใช้ PK `SchoolBotLicenseId` และฟิลด์มาตรฐาน ดู [มติ License/DB](requirement/decisions-004.md)
- ครั้งแรกตรวจ License ออนไลน์ แล้วใช้สิทธิ์ในเครื่องได้ 3 วัน ครบกำหนดต้องตรวจ Key ว่ายัง Active ก่อนต่อสิทธิ์ ดู [มติออฟไลน์](requirement/decisions-005.md)
- 1 Key ผูก 1 เครื่อง; ผู้ดูแลปลดก่อนย้าย Key เดิมได้ทันที เครื่องเดิมอาจใช้ออฟไลน์จนสิทธิ์เดิมหมด ดู [มติย้ายสิทธิ์](requirement/decisions-007.md)
- BA amend แล้ว: 44 REQ / 174 AC ยังเป็น DRAFT (เพิ่ม REQ-043..052 หลักสูตร Level/ข้อสอบ/ส่งคะแนน) ดู [ผลตรวจเอกสาร](planning/ba-review-001.md); คงรหัสเดิมครบ เพิ่ม REQ-040..042
- logical baseline ยืนยันแล้ว; [แผนหลัก](plan/index.md) 74 งาน / 8 phases / 17 gates ทุกงาน pending ยังอ้าง 31/109 ให้ PM/TP ปรับ mapping ตาม AC ใหม่ 23 ข้อ; ยังไม่เริ่ม implementation SchoolBot
- หลักสูตรเปลี่ยนเป็นหลักสูตรกลางแบบ Level ต่อภาคเรียน ผูกชั้น/วิชาได้ ตาม [decisions-020](requirement/decisions-020.md); ยังไม่ amend REQ/DES
- ส่งคะแนนเป็นช่องย่อยต่อกิจกรรม SchoolBot เขียนระบบเกรดเองผ่านหน้า mapping โดยไม่เปลี่ยนโครงสร้างเดิม ตาม [decisions-021](requirement/decisions-021.md)
- มี 12 ประเด็นคำถาม: 5 PARTIAL / 7 CLOSED (ไม่มี OPEN); OQ-006/007/010 ได้ข้อยุติธุรกิจแล้ว งาน contract ส่ง SA ส่วนเนื้อหา/หุ่น/ส่งมอบรอทีมเสนอให้ผู้ใช้ตรวจ
- หลักฐานเป็น working tree ณ 2026-10-21; source repository ยังไม่มี commit ให้อ้าง hash

## เอกสาร

| หมวด | ตำแหน่งเมื่อมีเอกสาร | สถานะ |
|---|---|---|
| Requirements | [requirement/index.md](requirement/index.md) | 44 REQ / 174 AC — DRAFT |
| Scope | [requirement/scope.md](requirement/scope.md) | ภาพรวม ความสามารถปัจจุบัน ข้อจำกัด และแหล่งที่มา |
| Source Review | [source-review-001.md](source-review-001.md) | ตรวจเส้นทางบทเรียนและสร้างงาน 3 โหมด |
| Existing User Review | [source-review-002.md](source-review-002.md) | ตรวจ account/profile/tenant ของ Academic เพื่อแก้แบบ |
| Course Plan Review | [source-review-003.md](source-review-003.md) | ตรวจ Google Sheet หลักสูตร ป.1–ป.6 และข้อเสนอโครงที่ยังไม่ยืนยัน |
| Grade System Review | [source-review-004.md](source-review-004.md) | SA ตรวจ PGGradeDB; ผู้ใช้เลือกทาง A (decisions-021) |
| Score Writer Review | [source-review-005.md](source-review-005.md) | writer จริงอยู่ service `sb-service-academic-score-record` ที่ไม่อยู่ใน workspace — BLOCKED |
| Design | [design/index.md](design/index.md) | DES-001..007 และแบบ PK int4/DBML; เก็บ archive — PROPOSED |
| DBML | [design/schoolbot.dbml](design/schoolbot.dbml) | 16 ตาราง / 243 คอลัมน์ / 14 refs; ผ่าน parser สองแบบ |
| Logical Data Model | [design/data-model.md](design/data-model.md) | ผู้ใช้ยืนยัน logical baseline แล้ว; physical DDL เป็นขั้นถัดไป |
| Design Review Decisions | [design/risks.md](design/risks.md) | สิ่งที่ต้องยืนยันก่อน implementation ที่พึ่งพา |
| Hardware/OS Survey | [hardware](design/hardware-survey-001.md), [OS ปัจจุบัน](requirement/decisions-019.md), [preflight](planning/installer-preflight-001.md) | เลือก target Win11/macOS แล้ว; Win10 survey เก็บเป็นประวัติ ยังรอผลตรวจจริง |
| Plan | [plan/index.md](plan/index.md) | PM รับแล้ว; 74 tasks pending พร้อมใบงานราย task และ gates |
| Backlog | [backlog.md](backlog.md) | PM เป็นเจ้าของ; ยังไม่มี BL entry |
| Planner Proposal | [planning/index.md](planning/index.md) | เก็บข้อเสนอเดิม; PM รับเป็นแผนหลักแล้ว |
| Open Questions | [open-questions/index.md](open-questions/index.md) | 3 PARTIAL / 3 CLOSED |
| Human Gate Questions | [ชุด 1](planning/human-questions-001.md), [ชุด 2](planning/human-questions-002.md), [ชุด 3](planning/human-questions-003.md), [ตรวจ OS](planning/human-questions-004.md), [Setup](planning/human-questions-005.md), [environment](planning/human-questions-006.md) | ตอบครบแล้ว; ยุติคำถาม Win10 ตามมติผู้ใช้ เปลี่ยนเป็น Win11 |
| DB / SQL | [review-005](db/review-005.md) (ล่าสุด), [001](db/review-001.md)–[004](db/review-004.md) | DRAFT Rev5 — ไฟล์เดียว `schoolbot_db.sql` + rollback สำหรับ SchoolBot DB 10.0.0.128:9499 (32 ตาราง, ไม่มี index เพื่อความเร็ว, FK คอลัมน์เดียว); ไม่แตะ School DB/PGGradeDB; ยังไม่รัน |
| Test Plan | `test-plan/index.md` | ยังไม่มีเอกสาร |
| QA | `qa/index.md` | ยังไม่มีเอกสาร |
| Review | `review/index.md` | ยังไม่มีเอกสาร |

## Change Log

- 2026-10-22 — SA (agy) NEEDS_HUMAN: sync เอกสารแบบให้ตรง SQL ปัจจุบัน (DBML Rev3 32 ตาราง ผ่าน parser, ชื่อตารางตรง SQL); เสนอแก้ LearnerId ที่ [db/proposal-learnerkind.md](db/proposal-learnerkind.md) รอผู้ใช้เลือก A/B
- 2026-10-22 — บันทึก [decisions-030](requirement/decisions-030.md): ถอนคอลัมน์ Version ทั้งหมด (SQL 20 จุด, DBML, data-model) ใช้ UpdateDate เป็น concurrency token แทน (ผู้ใช้เลือก)
- 2026-10-22 — DBA (agy) DONE Rev5 ตามคำสั่ง "อะไรไม่จำเป็นไม่ต้องใส่ / เอา index ออก": 33→32 ตาราง (ตัด TeacherGrant), ix_* 0, composite FK → single-column, Version 17 ตาราง, CHECK 117→53; Rev4 เก็บที่ db/archive/rev4/; design (data-model/DBML/DES) ยังไม่ sync
- 2026-10-22 — บันทึก [decisions-029](requirement/decisions-029.md): ไม่ GRANT/สร้าง role ใน School DB และ PGGradeDB ใช้บัญชี DB เดิม; archive ไฟล์ grants
- 2026-10-22 — SA (agy) DONE: baseline Rev4 sync (data-model/contract/DES-004/005 Rev4, DBML Rev2 33 ตาราง ผ่าน parser); บันทึก [decisions-028](requirement/decisions-028.md) CreateBy/UpdateBy = int null; ค้าง: SA amend placement ตาม decisions-027 และ LearnerId ครู/นักเรียนชนกัน
- 2026-10-22 — บันทึก [decisions-027](requirement/decisions-027.md): ตาราง SchoolBot อยู่ DB ของตัวเอง 10.0.0.128:9499 ไม่ใช่ School DB (แทน placement ใน decisions-011); แยก SQL ตาม [db/review-004](db/review-004.md); แบบที่อ้าง School DB ต้องให้ SA amend
- 2026-10-22 — ผู้ใช้สั่งถอน index license และรวม SQL หนึ่งไฟล์ต่อ database: บันทึก [db/review-003](db/review-003.md); ไฟล์แยกเดิมที่ db/archive/split-rev1/
- 2026-10-22 — DBA (agy) Rev2: เพิ่ม partial index license active ต่อโรงเรียนใน db/001 (+rollback); 002–007 ไม่เปลี่ยน; Rev1 ของ 001 เก็บที่ db/archive/rev1/; DBA เตือนว่า LearnerId ของครูบน Desktop อาจชนกับ SId นักเรียน — ส่ง SA ออกแบบ
- 2026-10-22 — บันทึก [decisions-026](requirement/decisions-026.md): ผู้ใช้อนุมัติ amendment-proposal-001/002 เป็น baseline ใหม่ (แก้ 2 จุดตาม decisions-025); archive baseline เดิมที่ design/archive/2026-10-22-before-rev4/; ส่ง SA sync และ DBA ปรับ SQL (agy) ขนานกัน
- 2026-10-22 — DBA (agy) NEEDS_HUMAN: บันทึก db/001–007 + rollback และ review-001 (DRAFT ไม่รัน); ครอบคลุมงาน DBA-001/002/004/005/006 ในแผน แต่ไม่เปลี่ยนสถานะ task — PM ต้อง reconcile; ส่ง sec ตรวจ PII ตามที่ DBA แจ้ง
- 2026-10-22 — บันทึก [decisions-025](requirement/decisions-025.md): auth ทาง C, ผู้ใช้ยอมรับความเสี่ยง token ไม่มี exp, admin โรงเรียน = IsAdmin, ต้องมี License, publish four-eyes, ปิด /v1/admin, สอบซ่อมใช้คะแนนสูงสุด, Desktop นักเรียน+ครู; amend REQ-044/046/049
- 2026-10-22 — SA NEEDS_HUMAN: DES-008..011 Rev2 ตาม decisions-022..024, DES-012 auth ข้ามระบบ (เสนอ token exchange + gateway introspection), amendment-proposal-002; รอมนุษย์ H1–H8 และ release gates ของ DES-009
- 2026-10-22 — บันทึก [decisions-024](requirement/decisions-024.md): เกณฑ์ Level ราย Level (เริ่ม 70%) สิ้นเทอม, policy quiz/test ค่าเริ่มส่วนกลาง ครูปรับได้; ปิด OQ-013/015; amend REQ-046/048
- 2026-10-22 — บันทึก [decisions-023](requirement/decisions-023.md): backend SchoolBot เขียนคะแนนเอง หน้าใหม่ในโฟลเดอร์ school-bot ของ web-system, ปัด half-up, นำเข้าทุกแถวเป็นร่าง, mapping เฉพาะ admin โรงเรียน; amend REQ-045/049/050/052
- 2026-10-22 — SA BLOCKED: บันทึก DES-008..011, amendment-proposal-001 (ยังไม่ apply baseline) และ source-review-005; การเขียนคะแนนรอ source `sb-service-academic-score-record`
- 2026-10-22 — BA NEEDS_HUMAN: บันทึก REQ-043..052 (10 REQ/42 AC), amend REQ-037/038, เปิด OQ-013..017; เพิ่ม BR ที่อยู่หน้าจอตาม decisions-022
- 2026-10-22 — บันทึก [decisions-022](requirement/decisions-022.md): admin เป็น Next.js ใน school-bot-v2/web, หน้าครูอยู่ใน sb-tech-upgrade-web-system, Desktop ใช้เรียนอย่างเดียว
- 2026-10-22 — บันทึก [decisions-021](requirement/decisions-021.md) ปิด OQ-012; ยังไม่ amend REQ/DES/plan
- 2026-10-22 — SA NEEDS_HUMAN: บันทึกผลตรวจระบบเกรด [source-review-004](source-review-004.md); ไม่มี API เขียนคะแนน รอผู้ใช้เลือก A/B/C ใน OQ-012
- 2026-10-22 — บันทึก [decisions-020](requirement/decisions-020.md): หลักสูตรกลางแบบ Level ต่อภาคเรียน เลื่อนทั้งห้องเมื่อครูยืนยัน quiz ตั้งรายหลักสูตร ส่งคะแนนเมื่อครูยืนยัน; เปิด OQ-012 ปลายทางคะแนน ส่ง SA ตรวจระบบเกรด
- 2026-10-22 — MYCELIUM ตรวจ Course Plan Sheet ของผู้ใช้ บันทึก [source-review-003](source-review-003.md); ยังไม่ amend REQ/DES รอคำตอบธุรกิจ
- 2026-10-22 — BA DONE; บันทึก amendment 34/132 และปิดธุรกิจ OQ-007; ส่ง [handoff](planning/ba-review-001.md) ให้ PM/TP และ SA ไม่เปลี่ยนสถานะงานจากเอกสาร
- 2026-10-21 — บันทึก decisions-018/019; MSI preflight ผ่านโดยไม่ติดตั้ง ผู้ใช้เปลี่ยนเป็น Win11 ตามข้อเสนอแรก ยุติสาขา Win10
- 2026-10-21 — SA ส่ง Windows10 review และ OS Rev2 แล้ว; เก็บผลตรวจรอบต่อและถามแนวทาง Home/Pro ไม่ปิด gates
- 2026-10-21 — บันทึก decisions-017 ให้รองรับ Windows 10 x64 ส่งทีมตรวจ edition/build และปรับขั้นต่ำก่อนยืนยัน
- 2026-10-21 — SA survey DONE; เก็บหลักฐาน hardware/OS และข้อเสนอแบบมีเงื่อนไข ไม่ปิด gates หรืออ้างว่าควบคุมหุ่นบน Mac ได้แล้ว
- 2026-10-21 — บันทึก decisions-016 ปิด OQ-006; ผู้ใช้ตรวจรับภาพรวม ทีมเสนอรุ่นหุ่น/OS ให้ตรวจภายหลัง
- 2026-10-21 — บันทึก decisions-015: ถังขยะ 30 วัน ทีมร่างหลักสูตรให้ตรวจ และกำหนด scope ครูรายชื่อนักเรียน
- ประวัติก่อนหน้า: [ชุด 1](history-001.md), [ชุด 2](history-002.md)
