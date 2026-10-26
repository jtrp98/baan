# school-bot — Module Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน — เนื้อหา module-level ทั้งหมดอยู่ที่ `requirement\scope.md` · เขียนโดย `business-analyst`
> วิธีอ่าน: อ่าน index ของหมวดที่ packet/brief ชี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด

## Documents

| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `requirement\index.md` | สารบัญ requirement — ตาราง REQ + สถานะ + AC + decisions registry | 44 REQ (REQ-009..052) / 185 AC — DRAFT (AC-030-04..08 ตรวจรับแล้วตาม decisions-037); decisions-001..041 |
| `requirement\scope.md` | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม |
| `design\index.md` | สารบัญ design — feasibility + ตาราง DES + ไฟล์สัญญา | data-model Rev7/rules Rev8/DBML Rev5 (32 ตารางเดิม); parser/semantic ผ่าน; DES-001..012 PROPOSED; รอบ060a ปิด GAP-01..04/06/08 + SEC001-003/009 ระดับสัญญา (ดู §060a) |
| `plan\index.md` | สารบัญ plan — release scope, phases, ตาราง Tasks และ extension/index.md | 110 tasks: 15 verified / 95 pending (8 phases / 17 gates), 44 REQ/185 AC; verified เป็นงานเอกสาร ไม่ใช่ release/runtime |
| `open-questions\index.md` | สารบัญ OQ ทั้งหมด | 12 OQ (OQ-006..017): 3 PARTIAL / 9 CLOSED |
| [test-plan/index.md](test-plan/index.md) | สารบัญ test plan | 80 cases/185 AC (Amendment002+003 — AC GAP-07 ตรวจรับแล้ว) + TP-002 fixture plan; actual ทุกเคส NOT_RUN |
| `review\index.md` | สารบัญ review findings | ยังไม่มีเอกสาร |
| [qa/index.md](qa/index.md) | สารบัญ QA findings | round001 PASS local logout/component; PG/fullLogin NOT_RUN |
| [uxui/index.md](uxui/index.md) | สารบัญ/เอกสาร UX/UI | UX อนุมัติ 5/7 ชุด: Entry, Labs, Projects, Learning, Mapping ตาม decisions-036..041; UX-005/007 กำลังร่าง; implementation ต้องผ่าน backend/contract gates ของแต่ละงานด้วย |
| [security.md](security.md) | ผลตรวจความปลอดภัย | Static review: Important6/Medium6/Minor3 OPEN; รอบ060 ฝัง mitigation SEC001-003/009 ระดับแบบ + jpo ตรวจรับ (security-gap-sync-review-001); ยังไม่มี re-audit runtime |
| [backlog.md](backlog.md) | งานที่ทำทีหลัง (append-only) | BL-001 เอกสารconstraints; BL-002..004 ข้อพบของG/A/legacyนอกscope ยังไม่ผ่านsecuritytriageเจ้าของระบบ |
| `db\` | SQL DDL/rollback + review (`review-001..006.md`, `schoolbot_db.sql`) — convention เฉพาะโปรเจกต์ | DRAFT Rev5 (32 ตาราง, ยังไม่รัน); review-006 ส่ง design gaps ให้ arch |
| [planning/handoff-002.md](planning/handoff-002.md) | ผลส่งต่อหลักฐาน/ใบงาน run/ประวัติ planner เดิม — convention เฉพาะโปรเจกต์ | authต้นฉบับ/TP/spec/security/gmบันทึกแล้ว; สถานะรับGatewayและfinalvalidationอ่านในhandoff002 |
| `design\source-review-001..005.md` | หลักฐาน as-built จากการตรวจ source จริง (ย้ายมาจาก root วันที่ 2026-10-22) | 001: บทเรียนและสร้างงาน 3 โหมด · 002: account/profile/tenant ของ Academic · 003: Course Plan Sheet ป.1–ป.6 · 004: ระบบเกรด PGGradeDB (ทาง A) · 005: score writer อยู่ `sb-service-academic-score-record` นอก workspace (BLOCKED) |

สถานะปัจจุบัน 2026-10-26: [ใบงาน062](planning/task-062.md) เดินต่อ UX-005/UX-007 และเตรียมรับรอง Gateway/DB; 15 verified/95 pending ตามผลตรวจใบงาน061. กติกา runner ล่าสุดจากผู้ใช้: T0–T2 ใช้ Codex, T3–T5 ใช้ AGY และไม่ fallback ข้าม runner. รายการลงวันที่ก่อนหน้าด้านล่างเป็นประวัติ; ไม่ใช้ยอด pending110 เก่าทับสถานะปัจจุบัน

เอกสารล่าสุด: [ผลตรวจ Login Gateway และแบบ reuse ด้วย Codex](planning/gateway-login-receipt-001.md) — source review/contract amend; adapter/H5 ยังมี technical gaps

เอกสารล่าสุด: [Authflow code/localcheck](planning/auth-flow-handoff-001.md) — logoutและinternaldecoderผ่านlocalcheck; fullLoginยังไม่พร้อม

เอกสารล่าสุด: [รอบ gRPC contract ใบงาน055–058](planning/gateway-grpc-contract-response-001.json) — sys หลักฐาน routing/linkage 001/002 (ไม่มี pre-auth cType selector ฝั่ง G), arch สร้าง [gRPC contract Rev1](design/gateway-grpc-contract-001.md) PROPOSED + [H5 questionnaire](planning/h5-questionnaire-001.md); รอประตู G/Light และ H5 ยังไม่ implement

เอกสาร transport ปัจจุบัน: [Gateway Rev4](design/gateway-integration-001.md) + [gRPC contract Rev1](design/gateway-grpc-contract-001.md) — client→HTTP Gateway→gRPC SchoolBot; contract ยัง PROPOSED รอ G/Light รับรองข้อยกเว้น opaque-session/mapper และ H5; HTTP logout ที่มีแล้วและผล local4032testsยังไม่ยืนยัน Gateway/gRPC integration.

เอกสารที่เกี่ยวข้องรอบล่าสุด: [ผลตรวจและรายการแก้ทั้งหมด](planning/transport-docs-review-001.md) — แบบระบบ/คู่มือ/แผน/ทดสอบ/ข้อกำหนด/security ตรวจและปรับตาม owner; รอบนี้เอกสารเท่านั้น ยังไม่ implement.

เอกสารล่าสุด: [ใบงาน060 โหมด solo](planning/task-060.md) — ปิด GAP design รอบ060a + packs/DB docs/TP/UX + jpo/check ตรวจข้ามโมเดล (ผล check รอบ 1 FAIL → แก้ครบ ตาม [check-060-docs-review-001](planning/check-060-docs-review-001.md)); ประตูมนุษย์ใหม่: GAP-07 disposition, spec Q1–Q6, UX Q1–Q13, EV-01..06.

## Change Log

- 2026-10-26 — ใบงาน062: sync สารบัญหลักตาม plan/index + extension และ decisions-041 เป็น 15 verified/95 pending, UX signed 5/7; เริ่มร่างสองชุดที่เหลือและบันทึกคำสั่ง runner ของผู้ใช้. ไม่มี gate/runtime/release acceptance ใหม่

- 2026-10-24 — decisions-038 (มติผู้ใช้ชุดสุดท้าย): **UX sign-off ครบทั้ง int-001/int-002** (G-UX-ENTRY/G-UX-LABS มีหลักฐานครบ — front implement UX-001/UX-003 ได้) · ผู้อนุมัติเนื้อหา=ผู้ใช้ · rubric ดาวยืนยัน · ยังไม่อนุญาตทดสอบหุ่นจริง · cert signing ยังไม่ระบุ · ค้าง: spec Q3 (รุ่นหุ่น/calibration จริง), EV forwarding, ประตูเดิม

- 2026-10-24 — decisions-037 (มติผู้ใช้ชุดถัดมา): ตรวจรับ AC-030-04..08 ทั้ง 5 (req-030 ถอดป้ายข้อเสนอ) · UX Q5 ถามทุกครั้ง (§4) / Q9 ป้ายจำลองตลอด session (ยืนยัน BR-013-03 ของ REQ-013) · performance 300MB/5s/30FPS = acceptance ของ G-DELIVERY (pack-delivery §4) · คง 110 pending/gates ไม่มี code/SQL/runtime; ค้าง: spec Q1–Q5, UX Q2/Q3/Q6–Q8/Q10/Q11/Q13

- 2026-10-24 — decisions-036 (มติผู้ใช้ผ่านแบบฟอร์มคำถามหลังปิดรอบ060): GAP-07 คง Prepare/Install → REQ-030 +BR-030-04..06 +AC-030-04..08 (ข้อเสนอรอตรวจรับ) รวม 44 REQ/**185 AC** · TP Amendment003 (TP001-048 แก้ + TP001-080 ใหม่ = **80 cases**) · UX Q1/Q4 sign-off บันทึกที่ uxui/int-001 · EV-01..06 เตรียมข้อความให้ผู้ใช้ forward (db-safe-evidence-cover-001) · คง 110 tasks pending/17 gates ไม่มี code/SQL/runtime

- 2026-10-24 — ใบงาน060 (โหมด solo): ปิดคิวเตรียมเอกสาร queue-003 §3 ครบ — arch ผ่าน runner ภายนอก codex t1 (GAP-01..04/06/08 + SEC001-003/009 ระดับสัญญา + BL-001 + SA-004 ชุดเกณฑ์ + arch-fix Rev2 ตาม jpo) · spec/int/inspect/vault เป็น subagent โดยนายช่างบันทึก (packs 4 ชุดครอบ GAP-05/09, uxui int-001/002 รอเซ็น Q1–Q13, TP 79 cases + TP-002 fixtures, db review-007/pii-inventory/db-safe-evidence + BL-001) · jpo และ check ตรวจข้ามโมเดลผ่าน baan-role (jpo NEEDS_HUMAN ตาม gates เดิม; check รอบ 1 FAIL 4 จุด → เจ้าของไฟล์แก้ครบ) · คง 110 tasks pending/44 REQ/180 AC/17 gates ไม่มี code/SQL/runtime; ประตูมนุษย์ใหม่: GAP-07 disposition (update-disposition-001), spec Q1–Q6 (packs), UX Q1–Q13, EV-01..06 (ส่งเจ้าของ Master DB)

- 2026-10-24 — รอบ transport contract (ใบงาน055–059): sys055/056 หลักฐาน routing/linkage ([001](planning/routing-linkage-evidence-001.json)/[002](planning/routing-linkage-evidence-002.json)) สรุปว่าไม่มี pre-auth cType selector ที่พิสูจน์แล้ว (fullLogin คง NOT_READY), arch057 สร้าง [gateway-grpc-contract-001](design/gateway-grpc-contract-001.md) Rev1 PROPOSED + Gateway Rev4 pointer (เก็บฉบับก่อนแก้พร้อม SHA256 ที่ design/archive/2026-10-24-before-grpc-contract-001), sys058 [H5 questionnaire](planning/h5-questionnaire-001.md) 7 หัวข้อ, gm059 sync คิว/แผน; คง 110 tasks pending/77 TP NOT_RUN/Important6 OPEN ไม่มี code/SQL/runtime ใหม่; ประตูค้าง: G/Light รับรองข้อยกเว้น opaque-session + error mapper, เจ้าของ/มนุษย์ตอบ H5, selector/cardinality/linkage พิสูจน์ต่อ

- 2026-10-24 — ตรวจหลังรอบ doc-sync: แก้ช่องสถานะ design ในตาราง Documents เป็น rules Rev7 ให้ตรง data-contract-rules.md จริง และจัดรายการ Change Log สองรายการ (rename 2026-10-23, cType 2026-10-24) ที่วางหลังบรรทัดประวัติก่อนหน้ากลับเข้าลำดับวันที่ใหม่ไปเก่า

- 2026-10-24 — รับ arch050/gm051/inspect052/spec053/jpo054 และปรับ current pointers; คง44REQ/180AC/110pending/77NOT_RUN และผล4032localเดิม

- 2026-10-24 — รับ arch049 ปรับเอกสาร transport ให้ใช้มาตรฐาน gRPC; คง source/SQL/tasks/QA scope เดิม

- 2026-10-24 — รับ cType category clarification แล้วใน [arch048](planning/desktop-login-ctype-contract-response-001.json); adapter/packet Rev4 แยก routing/profile linkage ที่ทีมต้องตรวจต่อ คง fullLogin NOT_READY

- 2026-10-24 — รับโค้ดและcheckจากCodex; 4032testsผ่านเฉพาะlocalscope คง110tasks pending/77TPcases NOT_RUN/Important6OPEN


- 2026-10-23 — ตรวจ Login Gateway ที่มีอยู่แล้วและรับ DES-004 Rev8/DES-012 Rev6/Gateway Rev2; ใช้ Gateway authentication ผ่าน adapter คง opaque session และ035 ไม่ปิด gate


- 2026-10-23 — [decisions-035](requirement/decisions-035.md): ผู้ใช้เลือกตรวจกลุ่มแอดมิน/ผู้บริหารฝั่งserverและคงsuperadminเดิม; ปิดเฉพาะคำถามแหล่งis_admin ส่งarch syncสัญญา ไม่ปิดG-AUTH/H5/QA/security

- 2026-10-23 — รอบ002รับหลักฐานบัญชีเดิมจากพาธที่ผู้ใช้ให้ (ตรวจHEAD/hash13ไฟล์), 77cases/180AC, specแก้REQ025/027ตามมติเดิม, security15findingsOPEN และgmรับqueue003/BL002..004; คง110tasks pending ไม่มีruntime/SQL/sign-off/riskacceptanceใหม่ ผลรับGatewayและfinalcommitตามhandoff002

- 2026-10-23 — ปิดรอบ [handoff-001](planning/handoff-001.md): spec44/180, arch sync/DBMLตรวจแล้ว และ gmรับแผน110งาน/17gates; ไม่มี source/SQL/runtime/release จากรอบนี้ ทุก taskยังpending คิวถัดไปที่ plan/queue-002.md

- 2026-10-23 — vault ตรวจ SQL static ตามมติ 032..034 ที่ db/review-006.md ส่ง NEEDS_DESIGN_CHANGE (mapping lock, policy/run, missing/partial apply, Submission context) ยังไม่มี physical SQL delta; arch/gm กำลังรับงานตาม task-013/014

- 2026-10-23 — spec amend ตาม decisions-032..034 เป็น 44 REQ/180 AC; คง 3 PARTIAL/9 CLOSED และสถานะตรวจรับ ส่ง arch sync contract แล้ว gm reconcile แผนเดิม

- 2026-10-23 — [decisions-034](requirement/decisions-034.md): สูตรรวมถ่วงน้ำหนักรายกิจกรรม น้ำหนักใหม่มีผลรอบใหม่ และครูปรับเฉพาะเวลาสอบ/ช่วงเปิด–ปิด; ปิด OQ-014 เหลือ OQ-008/009/011 รอทีมเตรียมข้อเสนอ/หลักฐานให้ตรวจ

- 2026-10-23 — [decisions-033](requirement/decisions-033.md): ใช้ช่องคะแนนเดิม แปลงตามสัดส่วนคะแนนเต็ม/half-up ข้ามผลที่ยังไม่มีตอนส่งเกรด; ปิด OQ-016 คง OQ-014 เฉพาะสูตรรวม/เปลี่ยนสัดส่วน ส่ง spec/arch sync ต่อ

- 2026-10-23 — [decisions-032](requirement/decisions-032.md): ผู้ใช้เลือกผลครูแบบ local/โครงงาน Cloud, หนึ่งกิจกรรมได้หลายช่องแต่หนึ่งช่องได้หนึ่งกิจกรรม และล็อก mapping หลังส่ง; OQ-016 เหลือใช้ช่องเดิม/สร้างช่องใหม่ ส่ง spec/arch sync โดยไม่เปลี่ยนสถานะ implementation

- 2026-10-23 — เพิ่ม [DBML อ่านภาพ](design/dbml-guide-001.md): แบบเต็ม 32 ตาราง/450 ฟิลด์/40 FK พร้อม notes ไทยและสี 10 กลุ่ม กับภาพเชื่อมตารางเก่า 24 ตาราง; schema ไม่เปลี่ยน

- 2026-10-23 — ตรวจแก้ auto-commit knowledge: แก้ parser รับ stdout ที่ถูก trim และกติกา Git ที่ขัดกับฟีเจอร์ เพิ่ม final commit หลังนายช่างบันทึกเอกสาร ผลทดสอบ BAAN 96 ผ่าน; [หลักฐาน](planning/knowledge-commit-001.md)
- 2026-10-23 — ขยาย [คู่มือ data model](design/data-model.md) Rev6: หน้าที่ 32 ตาราง/450 ฟิลด์ พร้อมตัวอย่าง, FK, JSON และแผนที่ตารางเก่า 27 รายการ; คง schema/SQL/สถานะตรวจรับเดิม ผลตรวจที่ [data-model-review-001](design/data-model-review-001.md)
- 2026-10-23 — บันทึก [decisions-031](requirement/decisions-031.md): repo เหลือ `school-bot` ตัวเดียว (`school-bot-v2` ไม่มีแล้ว) — เอา target v2 ออกจาก `baan.config.json` และแก้พาธในเอกสารที่ยังใช้จริง (ไฟล์หลักฐาน/decisions เดิมคงตามประวัติ)
- 2026-10-23 — ปรับคำสั่งส่งต่อทั้งโมดูลจาก MYCELIUM เป็นนายช่าง (BAAN) ตามการเปลี่ยนชื่อระบบ (release 0.12.0): แก้ใบงาน/แผน/ส่วนสั่งงานในไฟล์ข้อมูล รวม 104 ไฟล์ — บรรทัดลงวันที่ใน Change Log/หมายเหตุประวัติ และโฟลเดอร์ archive ยังอ้าง MYCELIUM ตามประวัติ (หมายถึงผู้คุมคนเดิม)

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
