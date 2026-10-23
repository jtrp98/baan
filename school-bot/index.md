# school-bot — Module Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน — เนื้อหา module-level ทั้งหมดอยู่ที่ `requirement\scope.md` · เขียนโดย `business-analyst`
> วิธีอ่าน: อ่าน index ของหมวดที่ packet/brief ชี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด

## Documents

| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `requirement\index.md` | สารบัญ requirement — ตาราง REQ + สถานะ + AC + decisions registry | 44 REQ (REQ-009..052) / 174 AC — DRAFT; decisions-001..030 |
| `requirement\scope.md` | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม |
| `design\index.md` | สารบัญ design — feasibility + ตาราง DES + ไฟล์สัญญา | Rev3 — data-model/rules/DBML Rev3 (32 ตาราง) CONFIRMED; DES-001..012 PROPOSED |
| `plan\index.md` | สารบัญ plan — release scope, phases, ตาราง Tasks | 74 tasks pending (8 phases / 17 gates) |
| `open-questions\index.md` | สารบัญ OQ ทั้งหมด | 12 OQ (OQ-006..017): 5 PARTIAL / 7 CLOSED |
| `test-plan\index.md` | สารบัญ test plan | ยังไม่มีเอกสาร |
| `review\index.md` | สารบัญ review findings | ยังไม่มีเอกสาร |
| `qa\index.md` | สารบัญ QA findings | ยังไม่มีเอกสาร |
| `uxui` | สารบัญ/เอกสาร UX/UI | ยังไม่มีเอกสาร |
| `security.md` | ผลตรวจความปลอดภัย | ยังไม่มีเอกสาร — จป. ยังไม่ได้รัน |
| `backlog.md` | งานที่ทำทีหลัง (append-only) | ยังไม่มี BL entry |
| `db\` | SQL DDL/rollback + review (`review-001..005.md`, `schoolbot_db.sql`) — convention เฉพาะโปรเจกต์ | DRAFT Rev5 (32 ตาราง, ยังไม่รัน) |
| `planning\` | ข้อเสนอ planner เดิม + ใบงาน run/ประวัติเก่า (task*.md, history*.md) — convention เฉพาะโปรเจกต์ (อ่านอย่างเดียว) | ADOPTED_BY_PM |
| `design\source-review-001..005.md` | หลักฐาน as-built จากการตรวจ source จริง (ย้ายมาจาก root วันที่ 2026-10-22) | 001: บทเรียนและสร้างงาน 3 โหมด · 002: account/profile/tenant ของ Academic · 003: Course Plan Sheet ป.1–ป.6 · 004: ระบบเกรด PGGradeDB (ทาง A) · 005: score writer อยู่ `sb-service-academic-score-record` นอก workspace (BLOCKED) |

## Change Log

- 2026-10-23 — [decisions-032](requirement/decisions-032.md): ผู้ใช้เลือกผลครูแบบ local/โครงงาน Cloud, หนึ่งกิจกรรมได้หลายช่องแต่หนึ่งช่องได้หนึ่งกิจกรรม และล็อก mapping หลังส่ง; OQ-016 เหลือใช้ช่องเดิม/สร้างช่องใหม่ ส่ง spec/arch sync โดยไม่เปลี่ยนสถานะ implementation

- 2026-10-23 — เพิ่ม [DBML อ่านภาพ](design/dbml-guide-001.md): แบบเต็ม 32 ตาราง/450 ฟิลด์/40 FK พร้อม notes ไทยและสี 10 กลุ่ม กับภาพเชื่อมตารางเก่า 24 ตาราง; schema ไม่เปลี่ยน

- 2026-10-23 — ตรวจแก้ auto-commit knowledge: แก้ parser รับ stdout ที่ถูก trim และกติกา Git ที่ขัดกับฟีเจอร์ เพิ่ม final commit หลังนายช่างบันทึกเอกสาร ผลทดสอบ BAAN 96 ผ่าน; [หลักฐาน](planning/knowledge-commit-001.md)
- 2026-10-23 — ขยาย [คู่มือ data model](design/data-model.md) Rev6: หน้าที่ 32 ตาราง/450 ฟิลด์ พร้อมตัวอย่าง, FK, JSON และแผนที่ตารางเก่า 27 รายการ; คง schema/SQL/สถานะตรวจรับเดิม ผลตรวจที่ [data-model-review-001](design/data-model-review-001.md)
- 2026-10-23 — บันทึก [decisions-031](requirement/decisions-031.md): repo เหลือ `school-bot` ตัวเดียว (`school-bot-v2` ไม่มีแล้ว) — เอา target v2 ออกจาก `baan.config.json` และแก้พาธในเอกสารที่ยังใช้จริง (ไฟล์หลักฐาน/decisions เดิมคงตามประวัติ)
- 2026-10-22 — ปรับโครงสร้าง `index.md` เป็นสารบัญล้วนตามมาตรฐาน baan และย้ายเนื้อหาสถานะปัจจุบันระดับโมดูลไป `requirement\scope.md` โดยคงถ้อยคำและ Change Log เดิมครบถ้วน
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
- 2026-10-22 — SA NEEDS_HUMAN: บันทึกผลตรวจระบบเกรด [source-review-004](design/source-review-004.md); ไม่มี API เขียนคะแนน รอผู้ใช้เลือก A/B/C ใน OQ-012
- 2026-10-22 — บันทึก [decisions-020](requirement/decisions-020.md): หลักสูตรกลางแบบ Level ต่อภาคเรียน เลื่อนทั้งห้องเมื่อครูยืนยัน quiz ตั้งรายหลักสูตร ส่งคะแนนเมื่อครูยืนยัน; เปิด OQ-012 ปลายทางคะแนน ส่ง SA ตรวจระบบเกรด
- 2026-10-22 — MYCELIUM ตรวจ Course Plan Sheet ของผู้ใช้ บันทึก [source-review-003](design/source-review-003.md); ยังไม่ amend REQ/DES รอคำตอบธุรกิจ
- 2026-10-22 — BA DONE; บันทึก amendment 34/132 และปิดธุรกิจ OQ-007; ส่ง [handoff](planning/ba-review-001.md) ให้ PM/TP และ SA ไม่เปลี่ยนสถานะงานจากเอกสาร
- 2026-10-21 — บันทึก decisions-018/019; MSI preflight ผ่านโดยไม่ติดตั้ง ผู้ใช้เปลี่ยนเป็น Win11 ตามข้อเสนอแรก ยุติสาขา Win10
- 2026-10-21 — SA ส่ง Windows10 review และ OS Rev2 แล้ว; เก็บผลตรวจรอบต่อและถามแนวทาง Home/Pro ไม่ปิด gates
- 2026-10-21 — บันทึก decisions-017 ให้รองรับ Windows 10 x64 ส่งทีมตรวจ edition/build และปรับขั้นต่ำก่อนยืนยัน
- 2026-10-21 — SA survey DONE; เก็บหลักฐาน hardware/OS และข้อเสนอแบบมีเงื่อนไข ไม่ปิด gates หรืออ้างว่าควบคุมหุ่นบน Mac ได้แล้ว
- 2026-10-21 — บันทึก decisions-016 ปิด OQ-006; ผู้ใช้ตรวจรับภาพรวม ทีมเสนอรุ่นหุ่น/OS ให้ตรวจภายหลัง
- 2026-10-21 — บันทึก decisions-015: ถังขยะ 30 วัน ทีมร่างหลักสูตรให้ตรวจ และกำหนด scope ครูรายชื่อนักเรียน
- ประวัติก่อนหน้า: [ชุด 1](planning/history-001.md), [ชุด 2](planning/history-002.md)
