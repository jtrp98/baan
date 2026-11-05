# Plan

PlanTask format: 1

## Release Scope

**Release:** R1 — ยืนยันโดยผู้ใช้ 2026-10-04 (ตอบ AskUserQuestion ของ driver ใน chat: ให้รัน task ที่ agent ทำได้ BE-009, FE-019, FE-020 ใน release นี้ — "ตอนนี้มีงานอะไรบ้าง… รันต่อเนื่อง")
**อยู่ใน release (23 task):** Phase 1 BE-003, FE-002, FE-005, FE-003, FE-004 · Phase 2 BE-004, FE-006 · Phase 3 BE-001, BE-002, FE-001 · Phase 4 BE-005, FE-007, FE-008, FE-009 · Phase 5 BE-006, BE-007, BE-008, BE-009, FE-017, FE-010 · Phase 7 FE-018, FE-019, FE-020 — AC ตาม Traceability ของ task เหล่านี้: AC-017, AC-054, AC-055, AC-056, AC-058..AC-064, AC-066..AC-072 · **AC-054/AC-055/AC-056/AC-064 เฉพาะส่วนข้อมูล/ตรรกะ/API** — ส่วน "ผู้ใช้เห็น" มากับ Phase 6 ซึ่งไม่อยู่ใน R1 (Sequencing Notes "ผลที่ผู้ใช้เห็น…")
**ไม่อยู่ใน R1:** Phase 6 FE-011..FE-016 และ REQ-012..REQ-019 + BR-17a อยู่ใน R2 ตามคำสั่งผู้ใช้ 2026-10-04 ด้านล่าง · BL-001..BL-015 (รวม UX-005) ยังอยู่ใน backlog และไม่อยู่ใน R1/R2
**Done เมื่อ:** **ยังไม่ระบุ** — environment ที่ deploy และผู้รับมอบไม่มีในเอกสารใด → Waiting on Human #6 (ใช้ร่วมทั้ง R1 และ R2 — ต้องระบุต่อ release)
ของที่ไม่อยู่ในรายการนี้ไปอยู่ `../../modules/timetableai/build/backlog.md` — ย้ายเข้ามาได้เฉพาะเมื่อผู้ใช้สั่ง

**Release ถัดไป — R2 (ผู้ใช้สั่ง 2026-10-04: "ปรับ plan ทั้งหมด … ทำทุกอย่างใน design"):** ทุกสัญญาเป้าหมายที่เหลือของ `design.md` (DES-009..DES-017) วางเป็น task ครบ **19 task ใหม่** ใน 6 เฟส + **Phase 6 (6 task) ย้ายกลับจาก `../../modules/timetableai/build/backlog.md` BL-016** เข้า release นี้ — รวม 25 task · Phase 6: FE-011..FE-016 (UX-001..UX-004, UX-006 เซ็นแล้ว 2026-10-04) · Phase 8 REQ-012 (DES-009): UX-007, BE-010, FE-021 · Phase 9 REQ-013 (DES-010): UX-008, BE-011, FE-022 · Phase 10 REQ-015 (DES-012, DES-017): UX-009, FE-023 · Phase 11 REQ-016 (DES-013): UX-010, BE-012, FE-024 · Phase 12 REQ-017 + REQ-018 + REQ-014 (DES-014, DES-015, DES-011): UX-011, UX-012, BE-013, FE-025, FE-026 · Phase 13 REQ-019 (DES-016): UX-013, BE-014, FE-027 · AC ตาม Traceability: AC-026..AC-032, AC-033..AC-053, AC-028/AC-065 · task ใหม่ทุกตัว `pending` (ช่อง Status เริ่มต้นของ PM) · **ประตูคนที่ขวางอยู่:** schema confirmation §27.5 + SA-Q1 (Waiting on Human #10 — ขวางทั้ง Phase 8 และเป็นเงื่อนไขก่อนหน้าของ Phase 9–13), migration/backfill §27.5 (จ) + DDL ของ §27.6 (#11 — ขวาง deploy), schema confirmation §27.6 (ก)(ก2)(ข)(ค)(ง) + SA-Q5/SA-Q9 (#12), SA-Q10 (#13), SA-Q6/SA-Q7/SA-Q11/SA-Q12 (#14 — ขวางทั้ง Phase 13), SA-Q8 cutover (#15), UX sign-off ของ UX-007..UX-013 (#16) · คำถามธุรกิจของ REQ-012..REQ-019 **ปิดครบแล้ว** (OQ-8..OQ-28 ปิดหมดตาม design §21.1/§21.2 — ที่เหลือเป็นคำถามเทคนิค/อำนาจอนุมัติเท่านั้น) · **R1 คง frozen** — ขอบเขต R1 ข้างบนไม่เปลี่ยน


## Waiting on Human

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน | ขวาง task |
|---|---|---|---|---|
| 1 | รอบ security ของ DES-018/target endpoint mapping + trust boundaries ของ phase sensitive (เดิม SEC-GATE-P5/P7 ใน qa.md); Critical/Important ต้องแก้หรือคนรับ risk เป็นลายลักษณ์อักษร · **ปิด 2026-10-04 — ผู้ใช้สั่ง "ปิด human gate ทั้งหมด" ในแชต: สั่งรันรอบ security แล้ว (ยังไม่ได้รันจริง — อยู่ในคิว stage ถัดไป · finding Critical/Important ที่พบจะเปิดประตูตัดสินใหม่ตาม gate 5)** | รัน security → คนตัดสิน finding | คน (ยังไม่ระบุชื่อ) — human gate 5 | production ของ Phase 3/5/7 และงาน auth/endpoint ใหม่ของ R2 (Phase 6/8/9/11/12/13); ไม่ขวาง engineer/QA ที่ gates อื่นครบ |
| 2 | **SEC-01** `Token_Secret` ใน `appsettings.json` — rotate หรือรับความเสี่ยง**เป็นลายลักษณ์อักษร** · ที่มีคือการรับความเสี่ยงด้วยวาจา 2026-09-29 (`review.md`: "Business accepted risk not to rotate") ยังไม่มีบันทึกลายลักษณ์อักษรว่าใคร · **ปิด 2026-10-04 — บันทึกการรับความเสี่ยงเป็นลายลักษณ์อักษร: ผู้ใช้ (คำสั่ง "ปิด human gate ทั้งหมด" ในแชต — สืบเนื่องการเลือก "ไม่ rotate" ที่บันทึกใน design.md Rev 9) รับความเสี่ยงไม่ rotate `Token_Secret` · รอบ `security` ต้องอ้างการรับความเสี่ยงนี้ — จะเปลี่ยนเป็น rotate ต้องให้ผู้ใช้สั่งใหม่** | rotate / ยอมรับเป็นลายลักษณ์อักษร (ใคร + วันที่) | ยังไม่ระบุ (บันทึกเดิมเขียนเพียง "Business") | deploy production ของ Phase 3/5/7 |
| 3 | ตรวจข้อมูลจริงใน master DB ตามกฎ OQ-39 รวม nullability ของ `TCompany.isActive`/`cDel`, `TAdmin.active`/`del` และ `TAdmin.id2` (RV-21 — NULL = admin ได้ 403 ทุก endpoint) | ผลตรวจ: ตรงกฎ / พบ null → `system-analyst` | `devops` / เจ้าของระบบ SB | deploy BE-008/BE-009 |
| 4 | SA-Q14 (MenuID 401–404, 422 + `Type`/`Role` + แถว IsActive=true/IsDel=true ใน master DB) · SA-Q15 (token มี `admin_id`/`exp`) · SA-Q18 (ค่าจริง `TCourseGroup.Description`, `MasterCode`/`PurposeCode`) · **ปิด 2026-10-04 — ผู้ใช้สั่งปิดทั้งหมด: ใช้ fallback ตาม design §21.3 ทั้งสามข้อ (SA-Q14: `W` = เขียน, แถว active = อ่าน, Role ไม่ตีความ · SA-Q15: ไม่บล็อก — P2 · SA-Q18: BR-77 ค่าภาษาไทยดิบ, ไม่ตรง = เบา/ทั้งแผน "จำแนกวิชาหนักไม่ได้") — ตรวจข้อเท็จจริงกับ DB จริงได้ภายหลัง ถ้าไม่ตรง fallback → ส่ง `system-analyst`** | ตอบ / fallback ตาม `design.md` §21.3 | SA-Q14: `devops` / เจ้าของระบบ SB · SA-Q15: เจ้าของระบบ SB + `security` · SA-Q18: `devops` / technical owner (school DB) | SA-Q14: deploy auth + DES-022 · SA-Q15: ก่อนรอบ `security` · SA-Q18: เปิดใช้ intensity กับโรงเรียนจริง |
| 5 | TP-D2 — บัญชีทดสอบ U0–U6 + บัญชีโรงเรียน/admin ที่ไม่ active/ถูกลบ บน master DB จริง · **ปิด 2026-10-04 — ผู้ใช้สั่งปิดทั้งหมด: ยังไม่มีบัญชีทดสอบ → คงเป็น Unverified Behaviour ที่ `devops` ต้องแสดงต่อผู้ใช้ก่อน deploy (ทางเลือกสำรองตามแถวนี้)** | จัดให้ / ไม่มี → คงเป็น Unverified Behaviour ที่ `devops` แสดงต่อผู้ใช้ก่อน deploy | `devops` / เจ้าของระบบ SB | ไม่ขวาง task · ขวางการปิด Unverified Behaviour |
| 6 | Environment/ผู้รับมอบของ R1 และ R2 (= Done) ต้องระบุต่อ release; PRE-01 nCourseIntensity และ DDL/backfill #11 ต้องยืนยัน target/blast radius ก่อน shared migration จริง | ระบุ environment + ผู้รับมอบ + ผู้สั่งรัน migration ต่อ release | ผู้ใช้ — human gate 6 | devops/deploy ของแต่ละ release |
| 7 | commit/merge งานของ repo ที่จะ deploy; engineer ยืนยัน worktree จริงก่อนส่งมอบ (revision ในประวัติไม่ใช่สถานะปัจจุบัน) | commit / merge เมื่อพร้อม | ผู้ใช้ — no state-changing git ใน `C:\src\AICode\sta\AGENTS.md` | deploy R1/R2 |
| 8 | **ปิดแล้ว:** ผู้ใช้เซ็น UX-001..UX-004/UX-006 as-is 2026-10-04 ตาม Sign-off ของแต่ละ artifact; UX-004 ครอบ 401/403 ไม่ครอบ retry | ไม่ต้องเซ็นซ้ำฉบับเดิม | ผู้ใช้ (บันทึกเดิม) | ไม่ขวาง FE-011..FE-016; ปัจจุบัน pending ทั้งหมด |
| 10 | **Schema confirmation §27.5 (มิติเทอม — DES-009):** เพิ่ม `sTermID varchar NULL` บน `Tbl_Setting`, `Tbl_ClassPeriod`, `Tbl_TeacherClassAssignment`, `Tbl_Timetable` + index §27.5 (ง) (nullable คงอยู่ — แถวของปีที่ไม่มี `TTerm` ค้าง NULL ตาม BR-24) · รวม **SA-Q1** — ยืนยันชื่อ/ชนิดคีย์เทอม = `sTermID varchar` (= `TTerm.nTerm` ซึ่งเป็น string; ข้อเสนอ SA) · **เซ็นแล้ว 2026-10-04 — ผู้ใช้สั่งปิดทั้งหมด: อนุมัติตามรูปครบทุกจุด (รวม SA-Q1 = `sTermID varchar`) → ปลดล็อก Phase 8 (BE-010, FE-021; UX-007 เริ่มร่างได้) · บันทึกเพิ่มใน design.md หมายเหตุปิดประตู 2026-10-04** | เซ็นตามรูป / แก้รูปก่อนเซ็น | ผู้อนุมัติ schema (คน — design ห้าม SA เซ็นแทน) | **ขวาง Phase 8 ทั้งเฟส** (BE-010, FE-021; UX-007 เริ่มร่างได้หลังเซ็น — §34.6) · เป็นเงื่อนไขก่อนหน้าของ Phase 9–13 |
| 11 | **Migration/backfill §27.5 (จ) 5 ขั้น** (คอลัมน์ nullable → deploy code อ่าน NULL ได้ → backfill เป็นเทอมแรกของปีตาม `dStart` — ขั้น 3 **บังคับ** ตาม OQ-37/AC-028 → รายงานแถวที่แปลไม่ได้ → เปิดโหมดบังคับเทอม) **ใน release window เดียว** (AC-065 — breaking ไม่มี grace) · รวม DDL ของ §27.6 (ก)(ก2)(ข)(ค)(ง) — SQL มือ ไม่มี EF Migrations (PRE ถัดจาก PRE-01) · ยืนยันซ้ำก่อน backfill ว่ายังไม่มีข้อมูล production (R36) · **สั่งรันแล้ว 2026-10-04 — ผู้ใช้สั่งปิดทั้งหมด: ให้ `devops` เตรียมรันครบ 5 ขั้นใน release window เดียว — การรันจริงยังต้องยืนยัน target + blast radius ตาม gate 6 (ผูกกับ #6 ที่ยังเปิด) และยืนยันซ้ำ "ยังไม่มีข้อมูล production" ก่อนขั้น 3** | สั่งรันผ่าน `devops` / เลื่อน | ผู้ใช้ + `devops` | deploy ของ Phase 8 และ phase ที่มี schema (ไม่ขวางการเขียนโค้ด) |
| 12 | **Schema confirmation §27.6:** (ก) SubjectRoom, (ก2) ความจุ/ผู้ดูแลต่อหน่วย C2 หรือ C1′ + SA-Q5/SA-Q9, (ข) ชั่วโมง, (ค) homeroom, (ง) sync record · C2 ใช้ RoomSetting/Set/editor/Copy ตามสัญญาปัจจุบัน; C1′ ไม่มี write endpoint ของโมดูล ต้อง SA amend read/edit/copy กับเจ้าของระบบก่อน ห้ามข้ามค่าห้องจาก Copy เงียบ ๆ · **เซ็นแล้ว 2026-10-04 — ผู้ใช้สั่งปิดทั้งหมด: (ก2) เลือก C2 ตามสัญญาปัจจุบัน (RoomSetting/Set/editor/Copy) → ปิด SA-Q9 · SA-Q5 ยืนยันตามข้อเสนอ (map `TRoom` ใน `StudentDataContext`) — schema จริงของ `TRoom` ยังต้องตรวจกับ DB จริงก่อน BE-012 (Unverified) → ปลดล็อก BE-012/BE-013/BE-014 (BE-011 ตาม DAG)** | เซ็นรายส่วน; คนเลือก C2/C1′ | ผู้อนุมัติ schema + เจ้าของ school DB | BE-012/BE-013/BE-014; BE-011 รอ BE-012/BE-013; UX-010/FE-024 และ Copy UI รอรูป C2/C1′ และ contract ที่ยืนยัน |
| 13 | **SA-Q10 — read path ห้องข้าม /academic:** X2 endpoint Service Academic ผ่าน gateway หรือ X1 อ่าน school DB read-only; ยืนยัน active-row predicate/อ่านสดตอนเปิดหน้า ไม่ cache · **ตัดสิน 2026-10-04 — ผู้ใช้สั่งปิดทั้งหมด: X2 (ข้อเสนอ design) + active-row predicate/อ่านสดตาม design — X2 ต้องตามด้วย SA amend Target/endpoint ที่ยืนยัน และการเพิ่ม endpoint จริงต้องสั่งทีม Service Academic (งานภายนอกโมดูล)** | เลือก X2/X1 + ยืนยัน contract; X2 ต้อง SA amend Target/endpoint ที่ยืนยันก่อน | เจ้าของ Service Academic + technical owner + security | BE-012 ส่วนที่ขึ้นกับ read path และ FE-024; ปิดก่อน dependent implementation ตาม DES-013 §38.7 และก่อนเปิดฟีเจอร์ |
| 14 | **SA-Q6 / SA-Q7 / SA-Q11 / SA-Q12 ของ DES-016:** สัญญาจริงของ Service Academic (`timetables/import`/`by-room`, `planeId`, รูปแบบ `day`) · orchestrate A (browser — ข้อเสนอ) หรือ B (service credential) · ค่า default ต่อฟิลด์ payload (§41.7 — `null` หมายความอะไรในระบบเช็คชื่อ) · transaction boundary T1 (endpoint atomic ใหม่ — **Target ใหม่** ต้อง amend design ด้วยสัญญาที่ยืนยัน) หรือ T2 · **ยืนยันตามข้อเสนอ design ครบ 2026-10-04 — ผู้ใช้สั่งปิดทั้งหมด: สัญญาตาม §41, orchestrate = A (browser), default = §41.7, transaction = T1 — T1 เป็น Target ใหม่ ต้องตามด้วย SA amend เพิ่มสัญญา T1 ก่อน Phase 13 เริ่ม · ถ้าตรวจกับเจ้าของ `/academic` จริงแล้วสัญญาต่างออก → `system-analyst` amend** | ตอบรายข้อ | เจ้าของ `/academic` + technical owner + `security` | **ขวาง Phase 13 ทั้งเฟส** (BE-014, FE-027) — design: ก่อนปิดและ schema เซ็น = ฟีเจอร์ไม่เปิดใช้ |
| 15 | **SA-Q8 — cutover:** BE-013+FE-025 ชั่วโมง/eligibility ออกรุ่นเดียว; DES-015 ก่อน/พร้อม DES-011 (FE-026); sync record/read BE-014 พร้อมก่อน BR-56 ใน FE-024 และ push FE-027 · DAG เตรียมงาน = FE-025+BE-014 → FE-024 → FE-027; ไม่ใช้ FE-027 เป็น prerequisite ของ FE-024 · จัดการ worktree ที่ขัดสัญญาก่อน merge (#7) · **ยืนยันตามแผน 2026-10-04 — ผู้ใช้สั่งปิดทั้งหมด (ในนาม technical owner): ลำดับ/DAG ตามที่ plan วาง · การ merge worktree ยังผูกกับ #7 ที่ยังเปิด** | technical owner ยืนยัน / ส่ง SA amend หากต่าง | technical owner | release Phase 11–13; เป็น deployment gate แยกจาก dependency การทำงาน |
| 16 | **UX sign-off UX-007..UX-013** — 7 artifact; UX-007 เริ่มหลัง #10, UX-010 รอรูป C2/C1′/contract ที่ยืนยัน — **2026-10-04: ผู้ใช้อนุมัติให้ `uxui-designer` ร่าง (ยังไม่เริ่มร่าง; UX-007 เริ่มได้เพราะ #10 เซ็นแล้ว) — ประตูเซ็นยังเปิดจนกว่าจะมีร่าง + ลายเซ็นของผู้ใช้** | เซ็นรายไฟล์เมื่อมีร่างตรง design | ผู้ใช้ | FE-021..FE-027 ต้อง signed artifact/backend prerequisite ครบ; ไม่เปลี่ยน Status เพราะ sign-off |

## Plan Summary

**timetableai** — 13 Phase / **48 task** · Status cells ปัจจุบัน: **21 verified / 27 pending / 0 blocked** · R1 frozen 23 task (21 verified; FE-019/FE-020 pending); R2 frozen 25 task (pending ทั้งหมด) · backend `sb-api-academic-timetable-ai` / frontend `sb-tech-upgrade-web-system` · verified ยังไม่เท่ากับ released (#6)

- Phase 1–5 และ FE-018 verified; รายละเอียดเดิมอยู่ plan-archive.md พร้อม QA pointer ของแต่ละ task
- Phase 6 pending บน UX-001..UX-004/UX-006 ที่เซ็น as-is 2026-10-04; FE-016 รับ 401/403 ไม่เพิ่ม retry
- Phase 7 FE-019/FE-020 pending; FE-019 คง reload/no auto retry ตาม AC-070
- Phase 8–13: 19 task pending ครอบ DES-009..DES-017; dependency ตาม SA clarification 2026-10-04
- Human gates #1..#7/#10..#16 ยังเปิด; #8 ปิดแล้ว · รอบนี้ไม่อนุมัติ schema/contract/UX/security/deploy เพิ่ม
- ประวัติ Summary/คำถามปิด/Sequencing ที่ถูกแทน/Change Log เดิมย้าย verbatim ไป plan-archive.md (PM amend 2026-10-04); task IDs/Status/R1/R2 scope คงเดิม

## Phase 1: Module B — Generate Results: Course Intensity (DES-019) + Shortfall Report (DES-020)

### Task BE-003 — `Tbl_Timetable.nCourseIntensity` in model + `Timetable/Set|Get|GetAllByYear`
Owner: backend-engineer
Tier: T5
Targets: sb-api-academic-timetable-ai
Depends on: none
Traceability: REQ-002, AC-054, DES-019, DEC-019
Produces: Contract:CourseIntensityDistribution.v1
Risk: schema
Human gate: schema
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §BE-003 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-002 — Heavy/light course classification (BR-77) — group matching corrected by FE-007
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: none
Traceability: REQ-002, AC-054, DES-019, DEC-019
Produces: none
Risk: medium, schema
Human gate: schema
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-002 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-005 — Shortfall report data after Generate (DES-020)
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: none
Traceability: REQ-008, AC-056, AC-017, DES-020, DEC-020
Produces: Contract:GenerateShortfallReport.v1
Risk: medium
Human gate: none
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-005 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-003 — Solver soft intensity goal (BR-78..BR-80)
Owner: frontend-engineer
Tier: T3
Targets: sb-tech-upgrade-web-system
Depends on: BE-003, FE-002, FE-005
Traceability: REQ-002, REQ-008, AC-054, AC-017, DES-019, DEC-019, DES-020
Produces: none
Risk: medium, schema
Human gate: schema
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-003 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-004 — Per-timetable intensity summary data (BR-81 counts; recommendations added by FE-008)
Owner: frontend-engineer
Tier: T5
Targets: sb-tech-upgrade-web-system
Depends on: BE-003, FE-002
Traceability: REQ-002, AC-055, DES-019, DEC-019
Produces: none
Risk: low, schema
Human gate: schema
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-004 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

## Phase 2: Module H — Legacy Removal, Code Only (DES-021)

### Task BE-004 — Remove legacy `Schedule*` endpoints and models from backend
Owner: backend-engineer
Tier: T5
Targets: sb-api-academic-timetable-ai
Depends on: none
Traceability: REQ-020, AC-058, AC-059, DES-021, DEC-021
Produces: none
Risk: medium, breaking-contract
Human gate: breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §BE-004 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-006 — Remove legacy `schedule(s)` proxy routes from frontend
Owner: frontend-engineer
Tier: T6
Targets: sb-tech-upgrade-web-system
Depends on: none
Traceability: REQ-020, AC-058, DES-021, DEC-021
Produces: none
Risk: low, breaking-contract
Human gate: breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-006 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

## Phase 3: Module G — API Authentication + Authorization (REQ-021, DES-018) 🔒 Security gate

### Task BE-001 — Bearer JWT authentication scheme + global fallback policy + tenant binding
Owner: backend-engineer
Tier: T2
Targets: sb-api-academic-timetable-ai
Depends on: none
Traceability: REQ-021, AC-060, AC-061, DES-018, DEC-018
Produces: Contract:ApiAuthorization.v1
Risk: critical, security, breaking-contract
Human gate: security, breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §BE-001 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task BE-002 — Per-page MenuID authorization policy (P2 server-side lookup)
Owner: backend-engineer
Tier: T2
Targets: sb-api-academic-timetable-ai
Depends on: BE-001
Traceability: REQ-021, AC-062, DES-018, DEC-018
Produces: none
Risk: critical, security, breaking-contract
Human gate: security, breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §BE-002 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-001 — Bearer coverage on every timetable call + 401/403 handling
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: BE-001, BE-002
Traceability: REQ-021, AC-063, DES-018, DEC-018
Produces: none
Risk: security, breaking-contract
Human gate: security, breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-001 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

## Phase 4: Module B — BR-77 Raw-Thai Group Matching, Shared T_c, Recommendations, Manual-Edit Warning Data (DES-019 Rev 11/13)

### Task BE-005 — Additive `sCourseGroupDescTh` on `GetSubjectsByPlan` (BR-77)
Owner: backend-engineer
Tier: T5
Targets: sb-api-academic-timetable-ai
Depends on: none
Traceability: REQ-002, AC-054, DES-019, DEC-019
Produces: none
Risk: low, schema
Human gate: schema
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §BE-005 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-007 — Fix BR-77 group matching (raw Thai `sCourseGroupDescTh`, no `sCourseTypeDesc` fallback) + FE-002 re-verification
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: BE-005, FE-002
Traceability: REQ-002, AC-054, DES-019, DEC-019
Produces: none
Risk: medium, schema
Human gate: schema
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-007 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-008 — Single T_c function + single D_c counter (BR-81a/BR-81b) shared by solver, warning and summary + `lstRecommendations` (BR-81)
Owner: frontend-engineer
Tier: T3
Targets: sb-tech-upgrade-web-system
Depends on: FE-003, FE-004
Traceability: REQ-002, REQ-008, AC-054, AC-055, AC-017, DES-019, DEC-019, DES-020
Produces: none
Risk: medium, schema
Human gate: schema
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-008 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-009 — Manual-edit non-blocking intensity warning data (BR-80, no UI)
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: FE-008
Traceability: REQ-002, AC-054, DES-019, DEC-019
Produces: none
Risk: medium, schema
Human gate: schema
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-009 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

## Phase 5: Module G — Sidebar Menu Permission Source (DES-022) 🔒 Security gate

### Task BE-006 — Extract shared menu-permission resolver from `TimetableAuthorizationFilter` (BR-74..BR-76, no behavior change)
Owner: backend-engineer
Tier: T2
Targets: sb-api-academic-timetable-ai
Depends on: BE-002
Traceability: REQ-021, AC-062, DES-018, DEC-018, DES-022, DEC-022
Produces: none
Risk: critical, security, breaking-contract
Human gate: security, breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §BE-006 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task BE-007 — `GET WebAPI/MenuPermissions/Get` with authenticated-only policy (DES-022 BR-88, the single BR-74 exception)
Owner: backend-engineer
Tier: T2
Targets: sb-api-academic-timetable-ai
Depends on: BE-006
Traceability: REQ-021, AC-064, AC-062, DES-022, DEC-022, DES-018, DEC-018
Produces: Contract:TimetableMenuVisibility.v1
Risk: high, security, breaking-contract
Human gate: security, breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §BE-007 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task BE-008 — School found, active and not deleted check on the regular-user path of the shared resolver (DES-018 BR-74 (ข), SA-Q20, OQ-41 = A) + tests for BR-74 (ข) / BR-76 (ก)
Owner: backend-engineer
Tier: T2
Targets: sb-api-academic-timetable-ai
Depends on: BE-006, BE-007
Traceability: REQ-021, AC-071, AC-072, AC-062, AC-064, DES-018, DEC-018, DES-022, DEC-022
Produces: none
Risk: critical, security, breaking-contract
Human gate: security, breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §BE-008 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task BE-009 — Resolver hardening: identity-keyed per-request cache (RV-1) + real-resolver integration coverage (RV-4)
Owner: backend-engineer
Tier: T3
Targets: sb-api-academic-timetable-ai
Depends on: BE-008
Traceability: REQ-021, AC-062, AC-064, AC-071, AC-072, DES-018, DEC-018, DES-022, DEC-022
Produces: none
Risk: medium, security, breaking-contract
Human gate: security, breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §BE-009 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-017 — Additive session-expired opt-out on `timetableFetch` (DES-022 BR-89, FE-001 wrapper)
Owner: frontend-engineer
Tier: T5
Targets: sb-tech-upgrade-web-system
Depends on: FE-001
Traceability: REQ-021, AC-063, AC-064, DES-018, DEC-018, DES-022, DEC-022
Produces: none
Risk: medium, security, breaking-contract
Human gate: security, breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-017 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-010 — `MenuPermissions/Get` proxy + `useTimetableMenuPermissions` hook + per-item state (DES-022 BR-86/BR-89, no visual change)
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: BE-007, FE-017
Traceability: REQ-021, AC-064, DES-022, DEC-022
Produces: none
Risk: medium, security
Human gate: security
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-010 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

## Phase 6: UI on Signed UX Artifacts (UX-001..UX-004, UX-006) 🔒 Security gate

### Task FE-011 — Sidebar disabled / loading / checkFailed rendering (UX-006, DES-022)

Objective: `Sidebar.tsx` ใช้ผลของ FE-010 ที่จุด inject ส่วน Teaching Schedule: แสดงครบ 5 รายการเสมอ · รายการปิดทุกเหตุ: ไม่นำทาง (ไม่มี href ที่คลิกได้) + `aria-disabled` · สิ่งบ่งชี้แยกตามเหตุ (ไม่มีสิทธิ์ · กำลังโหลดที่หัวกลุ่ม · ตรวจไม่สำเร็จ + tooltip ให้ reload) ตามหน้าตา/ถ้อยคำของ **UX-006 ฉบับที่มีคนเซ็น**
Why: AC-064 ส่วนที่ผู้ใช้เห็น (ปิดไม่ซ่อน, loading, checkFailed แยกจากไม่มีสิทธิ์)
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: FE-010
Traceability: REQ-021, AC-064, DES-022, DEC-022
Produces: none
Consumes: Contract:TimetableMenuVisibility.v1
Risk: medium, security
Human gate: security
Status: pending

#### Scope and constraints

ใช้ UX-006 ฉบับเซ็น as-is 2026-10-04 · `frontend-engineer` อ่านได้เฉพาะฉบับที่เซ็น — ถ้าฉบับที่เซ็นขัด DES-022 (เช่น ซ่อนแทนปิด, retry อัตโนมัติ) → ส่ง `system-analyst` ก่อน · contrast/component/Sidebar หุบและ mobile ตรวจเทียบ as-built ตามฉบับที่เซ็น · ห้ามแสดงรายการเปิดก่อนรู้ผล (fail-closed) · Sidebar ไม่แสดงข้อความ 401/403 และไม่เริ่ม SessionExpired · เมนูกลุ่มอื่นไม่เปลี่ยน · ประตู `security` ตาม DES-022 (การนำทางด้วย URL ตรงยังถูก DES-018 กัน)

#### Retrieval hints

Hypothesis: จุด inject `Sidebar.tsx:884` (EVD-114) และการ render `SidebarSubItem` (:93 — EVD-115) · ร่าง UX-006 อ้าง design-system `school-bright-design` — ยืนยัน component ของรายการย่อยและโหมดหุบใน worktree
Query: ค้น `MANUAL`, `SidebarSubItem`, `href`, `aria-`, `Tooltip`, `collapsed` ใน `src/components/layout`
Provenance: DES-022, DEC-022, Contract:TimetableMenuVisibility.v1

#### Do not modify

hook/config ของ FE-010 (ใช้เท่านั้น) · เมนูกลุ่มอื่นและเงื่อนไขการแสดงส่วน Teaching Schedule · การจัดการ 401/403 ของหน้า

#### Acceptance criteria

AC-064: ผู้ใช้ที่ไม่มีสิทธิ์อ่านของ m เห็นรายการ m แบบปิด (ไม่ซ่อน, คลิก/คีย์บอร์ดไม่นำทาง, `aria-disabled`) + สิ่งบ่งชี้ "ไม่มีสิทธิ์" · ระหว่างโหลด ทุกรายการปิด + ตัวบ่งชี้ที่หัวกลุ่ม · ตรวจไม่สำเร็จ ทุกรายการปิด + ไอคอนเตือน + tooltip ให้ reload และแยกได้จาก "ไม่มีสิทธิ์" · ผู้มีสิทธิ์เปิดหน้าได้ตามปกติ · หน้าตา/ถ้อยคำตรง UX-006 ที่เซ็น

#### Required validation and expected evidence

ตรวจ AC-064 ด้วย response 4 สถานะ (enabled, noPermission, loading ที่หน่วงเวลา, checkFailed) — ภาพ Sidebar แต่ละสถานะเทียบ UX-006 ที่เซ็น + คลิก/คีย์บอร์ดบนรายการปิด → ไม่นำทาง + `aria-disabled` จาก accessibility tree · typecheck/lint/build ผ่าน — เก็บภาพและรายการตรวจเป็นหลักฐาน

#### Rollback/compatibility notes

revert คืน Sidebar as-built (D53 — รายการเปิดทั้งหมด; API ยังบังคับตาม DES-018) · ไม่มีข้อมูลเปลี่ยน

### Task FE-012 — Post-Generate shortfall report UI (UX-001, DES-020)

Objective: แสดงผลหลัง Generate/Regenerate ทุกครั้งจาก `generateResult` (FE-005): จำนวนรวมที่ค้าง + รายการ (ห้องเรียน, วิชา, ต้องการ/วางได้/ขาด) · "จัดครบ" เมื่อ `nShortfallTotal = 0` · หมวด `ExcludedFromAutoGenerate` แยก · "ตรวจผลการจัดไม่ได้" เมื่อคำนวณไม่ได้ · เวลา `dFinishedAt` ของผล — หน้าตา/ถ้อยคำตาม UX-001 ที่เซ็น
Why: AC-056 — ผู้ใช้ต้องเห็นผลทุกครั้ง ห้ามจบเงียบ (FE-005 มีเฉพาะข้อมูล)
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: FE-005
Traceability: REQ-008, AC-056, DES-020, DEC-020
Produces: none
Consumes: Contract:GenerateShortfallReport.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

ใช้ UX-001 ฉบับเซ็น as-is 2026-10-04 · ไม่ระบุสาเหตุรายคู่ (BR-84) · รายงานเป็นภาพ ณ เวลา Generate จบ — การแก้มือไม่คำนวณรายงานใหม่ (BR-85) · Generate ล้มกลางทาง → ไม่แสดงรายงานของ attempt ที่ไม่ถูก apply · ไม่เพิ่มการตรวจความครบก่อนบันทึก · สรุปความเข้มข้นที่แสดงร่วม = FE-013 · `lstGenerateWarnings` (DES-011) ยังไม่มี — ไม่แสดง · UX-005 (กติกาแสดงความล้มเหลว) ไม่อยู่ใน task นี้

#### Retrieval hints

Hypothesis: `generateResult` สร้างใน `_lib/use-timetable-generation.ts` (FE-005 — worktree) และปุ่ม Generate/Regenerate อยู่ใน `manage-teaching-schedule/page.tsx` · จุดแสดงผลที่ UX-001 เลือกอาจอยู่ใกล้ `ScheduleSummaryModal` — ยืนยันกับ worktree
Query: ค้น `generateResult`, `nShortfallTotal`, `lstExcluded`, `handleCpGenerate`, `ScheduleSummaryModal`, `Regenerate` ใน `src/app/[locale]/timetable/manage-teaching-schedule`, `src/components`
Provenance: DES-020, DEC-020, Contract:GenerateShortfallReport.v1

#### Do not modify

`generateResult`/solver (FE-003/FE-005/FE-008) · การบันทึกตาราง · i18n key ของหน้าอื่น

#### Acceptance criteria

AC-056 / BR-82..BR-85: หลัง Generate/Regenerate ทุกครั้งมีผลแสดง — ค้าง: จำนวนรวม + รายการตรง `lstShortfall` · ครบ: "จัดครบ" · มีรายการถูกตัดก่อน solver: หมวด `ExcludedFromAutoGenerate` แยก · exception ในขั้นรายงาน: "ตรวจผลการจัดไม่ได้" ไม่ใช่ "จัดครบ" · แก้มือหลัง Generate ไม่เปลี่ยนรายงาน · หน้าตา/ถ้อยคำตรง UX-001 ที่เซ็น

#### Required validation and expected evidence

ตรวจ AC-056 ด้วย Generate บนข้อมูลที่วางไม่ครบ / วางครบ / มีวิชาไม่มีครู / บังคับ exception — ภาพหน้าจอแต่ละกรณีเทียบ `generateResult` dump และ UX-001 ที่เซ็น · typecheck/lint/build ผ่าน — เก็บภาพ + dump เป็นหลักฐาน

#### Rollback/compatibility notes

UI additive — revert ได้อิสระ (ข้อมูลของ FE-005 คงอยู่) · revert คู่กับ FE-013 ถ้า FE-013 วางอยู่ในผลเดียวกัน

### Task FE-013 — Intensity summary + recommendations UI after Generate and on open (UX-001, DES-019)

Objective: แสดงสรุปความเข้มข้นของตาราง (`L`, วิชาหนัก, หนัก/เบาต่อวันของทุกห้อง, `lstRecommendations`) จากสรุปของ FE-004/FE-008 ร่วมกับผลของ FE-012 หลัง Generate และตอนเปิดตารางเดิม (Flow D) · `ConsecutiveHeavy` ไม่แสดงค่าเกณฑ์ · L0 ไม่มีส่วนข้อเสนอแนะ (หนัก/เบาต่อวันยังแสดง) · สถานะ "จำแนกวิชาหนักไม่ได้"/"ไม่มีวิชาหนักตามสูตร" แสดงเป็นข้อความ · ถ้อยคำ `sSuggestion` ตาม UX-001 ที่เซ็น
Why: AC-055 — ผู้ใช้ต้องเห็นสรุปและข้อเสนอแนะห้อง/วันที่หนักเกิน
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: FE-012, FE-008, FE-007
Traceability: REQ-002, AC-055, DES-019, DEC-019
Produces: none
Consumes: Contract:CourseIntensityDistribution.v1
Risk: medium, schema
Human gate: schema
Status: pending

#### Scope and constraints

ใช้ UX-001 ฉบับเซ็น as-is 2026-10-04 · ประตู `schema` สะท้อน DES-019 (ไม่แตะสคีมา) · ข้อเสนอแนะเท่านั้น ไม่บล็อก/ไม่เปลี่ยนกริด · สรุปคำนวณใหม่จากกริดปัจจุบัน ต่างจากรายงาน shortfall ที่เป็นภาพ ณ Generate (BR-85) — การสื่อความต่างนี้ตาม UX-001 · ตาราง NULL แสดงเป็น L0 · ไม่มีดัชนีเฉลี่ย · ค่าหมวดจริง (SA-Q18) ต้องตรวจก่อนเปิดใช้กับโรงเรียนจริง — ข้อกำหนดก่อน deploy ใน Sequencing Notes ไม่บล็อก task

#### Retrieval hints

Hypothesis: สรุปของ FE-004/FE-008 อยู่ใน `manage-teaching-schedule/_lib/` · restore ของ Flow D อยู่ใน `manage-teaching-schedule/page.tsx` — ยืนยันจุดที่ UX-001 วางสรุปตอนเปิดตาราง
Query: ค้น `lstClassDays`, `lstRecommendations`, `lstHeavyCourseCodes`, `restore`, `Timetable/Get` ใน `src/app/[locale]/timetable/manage-teaching-schedule`
Provenance: DES-019, DEC-019, Contract:CourseIntensityDistribution.v1

#### Do not modify

ฟังก์ชัน T_c/สรุป (FE-008) · ตัวจำแนก (FE-007) · ส่วนของรายงาน shortfall (FE-012) นอกจุดวางร่วม

#### Acceptance criteria

AC-055: หลัง Generate และตอนเปิดตารางที่บันทึกแล้ว แสดงหนัก/เบาต่อวันของทุกห้องครบตรงสรุป · L1/L2 แสดงห้อง/วันที่หนักเกินตรง `lstRecommendations` (L2 รวมคาบหนักติดกันโดยไม่แสดงค่าเกณฑ์) · L0 ไม่แสดงข้อเสนอแนะแต่ยังแสดงหนัก/เบาต่อวัน · สถานะจำแนกไม่ได้/ไม่มีวิชาหนักแสดงชัด · กริดไม่เปลี่ยน · หน้าตา/ถ้อยคำตรง UX-001 ที่เซ็น

#### Required validation and expected evidence

ตรวจ AC-055 ด้วยภาพหน้าจอ L0/L1/L2 + ตารางที่จำแนกไม่ได้ + ตาราง NULL ทั้งหลัง Generate และหลังเปิดตารางเดิม เทียบ state dump ของสรุป (หนัก/เบาต่อวันทุกห้อง, `lstRecommendations`) และ UX-001 ที่เซ็น · typecheck/lint/build ผ่าน — เก็บภาพ + state dump เป็นหลักฐาน

#### Rollback/compatibility notes

UI additive — revert ได้อิสระ (ข้อมูลของ FE-004/FE-008 คงอยู่)

### Task FE-014 — `nCourseIntensity` selector in timetable create/edit modal + settings level labels (UX-002, DES-019 D51)

Objective: เพิ่มตัวเลือกระดับ 0/1/2 ใน modal สร้าง/แก้ตาราง (ตำแหน่ง/ป้ายตาม UX-002 ที่เซ็น) และส่ง `nCourseIntensity` ใน `Timetable/Set` · ตารางใหม่ prefill จาก `Tbl_Setting.nCourseIntensity` ของ (โรงเรียน, ปี) · ตารางเดิม prefill จาก `Timetable/Get` (NULL → 0) · แก้ป้ายระดับใน `/timetable/settings` ให้ตรง BR-78 (0 = ไม่กระจาย, 1 = พยายามกระจายวิชาหนัก, 2 = พยายามสลับหนัก-เบา — ถ้อยคำจริงตาม UX-002) และแก้ key ↔ ป้ายที่เลื่อนกันหนึ่งระดับ (D51)
Why: AC-054 — วันนี้ไม่มี UI ตั้ง L ต่อตาราง ตารางใหม่ได้ L = 0 เสมอ (FE-003) · ป้ายปัจจุบันขัดนิยามธุรกิจ (D51)
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: BE-003
Traceability: REQ-002, AC-054, DES-019, DEC-019
Produces: none
Consumes: Contract:CourseIntensityDistribution.v1
Risk: medium, schema
Human gate: schema
Status: pending

#### Scope and constraints

ใช้ UX-002 ฉบับเซ็น as-is 2026-10-04 · ป้าย UI ไม่ใช่การยืนยันธุรกิจ (บทเรียน D43) — ความหมายระดับมาจาก BR-78 เท่านั้น · ค่าใน `/timetable/settings` เป็นค่าตั้งต้นของตารางใหม่เท่านั้น · `Tbl_Setting.nCourseIntensity` คงไว้ · ส่งได้เฉพาะ 0/1/2 (VR-21) · ห้ามสร้างโหมดกรอกความหนักรายวิชา · ประตู `schema`: อ่าน/เขียนคอลัมน์ที่ยืนยันแล้ว — **deploy ได้หลัง `devops` รัน DDL (PRE-01) และ BE-003 live**

#### Retrieval hints

Hypothesis: `INTENSITY_MAP` ที่ `src/app/[locale]/timetable/settings/[year]/page.tsx:80` (EVD-097) และ key ป้ายที่ :293 (EVD-098) · ข้อความป้ายใน `messages/th.json:711-716` (§32.5 `inferred`) · modal สร้าง/แก้ตารางอยู่ในหน้า `/timetable/[year]` — ยืนยันชื่อ component กับ worktree
Query: ค้น `INTENSITY_MAP`, `courseIntensity`, `nCourseIntensity`, `Timetable/Set`, `Modal`, `scheduleSettings.courseIntensity` ใน `src/app/[locale]/timetable`, `messages`
Provenance: DES-019, DEC-019, Contract:CourseIntensityDistribution.v1

#### Do not modify

API `Timetable/Set|Get` (BE-003) · `Setting/Set|Get` · solver/สรุป (FE-003/FE-008)

#### Acceptance criteria

AC-054: เลือก 0/1/2 ใน modal แล้วบันทึก → `Timetable/Get` คืนค่าที่เลือกและ Generate ใช้ระดับนั้น · ตารางใหม่ prefill ค่าของ `/settings` · ตารางเดิม NULL แสดงเป็น 0 · ป้ายใน `/settings` และ modal ตรง BR-78 และ UX-002 ที่เซ็น · key ↔ ป้ายไม่เลื่อน (D51)

#### Required validation and expected evidence

ตรวจ AC-054 ด้วยการสร้าง/แก้ตารางด้วยทั้ง 3 ระดับแล้วอ่านกลับจาก `Timetable/Get` + Generate ด้วยระดับที่เลือก + ตรวจ prefill ทั้งตารางใหม่และตารางเดิม (NULL → 0) + ภาพป้ายทั้งสองหน้าเทียบ BR-78 และ UX-002 ที่เซ็น · typecheck/lint/build ผ่าน — เก็บ response ที่อ่านกลับและภาพป้ายเป็นหลักฐาน

#### Rollback/compatibility notes

revert UI → ตารางใหม่กลับเป็น L = 0 (ค่าที่บันทึกแล้วคงอยู่) · ห้าม revert BE-003 ขณะ UI นี้ใช้งาน

### Task FE-015 — Non-blocking intensity warning toast on manual edit (UX-003, BR-80)

Objective: แสดง toast ไม่บล็อกจาก state ของ FE-009 หลังการแก้มือที่สำเร็จ: คำนำ + รายการคู่ (จำนวนสูงสุดและข้อความ "และอีก k คู่" ตาม UX-003 ที่เซ็น) · `ConsecutiveHeavy` ไม่แสดงค่าเกณฑ์ · ไม่ใช้ error modal ของกฎ hard
Why: AC-054 ส่วนเพิ่ม 2026-09-30 — ผู้ใช้ต้องรู้ว่าการแก้มือทำให้ขัดเป้าหมายความเข้มข้น โดยการแก้ไม่ถูกปฏิเสธ
Owner: frontend-engineer
Tier: T5
Targets: sb-tech-upgrade-web-system
Depends on: FE-009
Traceability: REQ-002, AC-054, DES-019, DEC-019
Produces: none
Consumes: Contract:CourseIntensityDistribution.v1
Risk: low, schema
Human gate: schema
Status: pending

#### Scope and constraints

ใช้ UX-003 ฉบับเซ็น as-is 2026-10-04 · ประตู `schema` สะท้อน DES-019 · ไม่ปฏิเสธ/ไม่ย้อนการแก้ ไม่เปลี่ยนกริด · L0 ไม่มี toast · ใช้ข้อมูลของ FE-009 เท่านั้น ห้ามคำนวณเอง · ห้ามใช้รูปแบบ error modal ของ `validateDrop`

#### Retrieval hints

Hypothesis: ระบบ toast ที่แอปใช้อยู่ (ยังไม่ยืนยัน) · error modal ของกฎ hard ที่ `TimetableGrid.tsx:708-733` (อ้างในร่าง UX-003 — ยืนยันกับ worktree)
Query: ค้น `toast`, `useToast`, `Snackbar`, `dropError`, `TimetableGrid` ใน `src`
Provenance: DES-019, DEC-019, Contract:CourseIntensityDistribution.v1

#### Do not modify

state ของ FE-009 และฟังก์ชันของ FE-008 · error modal กฎ hard · `validateDrop`

#### Acceptance criteria

AC-054: การแก้ที่ทำให้คู่ใหม่ละเมิด → toast ไม่บล็อกหนึ่งครั้งที่ระบุคู่เหล่านั้น · คู่ที่ละเมิดอยู่แล้วไม่ถูกเตือนซ้ำ · L0 ไม่มี toast · การแก้สำเร็จและกริดไม่เปลี่ยนเพราะ toast · ถ้อยคำ/จำนวนรายการตรง UX-003 ที่เซ็น

#### Required validation and expected evidence

ตรวจ AC-054 ด้วยสคริปต์การแก้มือชุดเดียวกับ FE-009 ที่ L0/L1/L2 + ภาพ toast ทุกขั้นเทียบ state คำเตือนของ FE-009 และ UX-003 ที่เซ็น (ไม่มี toast ที่ L0, คู่ที่ละเมิดอยู่แล้วไม่เตือนซ้ำ, กริดไม่เปลี่ยน) · typecheck/lint/build ผ่าน — เก็บตารางลำดับการแก้ → toast และภาพเป็นหลักฐาน

#### Rollback/compatibility notes

UI additive — revert ได้อิสระ (state ของ FE-009 คงอยู่)

### Task FE-016 — Dedicated 403 copy + page-level 403 (UX-004, DES-018)

Objective: แทนทางแสดงข้อผิดพลาดเดิมที่ FE-001 ใช้ ด้วย copy/หน้าจอตาม UX-004 ที่เซ็น: 403 จาก API ใน action (toast/Alert) · 403 ระดับหน้า (เข้าด้วย URL ตรงโดยไม่มีสิทธิ์) พร้อมลิงก์ "กลับหน้าหลัก" · 401 ยังพาไปหน้า SessionExpired เดิม · สอดคล้องกับเมนูปิดของ UX-006
Why: AC-063 — "403 แสดงเป็นความล้มเหลวที่ผู้ใช้เห็น (ข้อความให้ `uxui-designer`)" · FE-001 ใช้ทางแสดงผลเดิมในรอบก่อน UX-004 เซ็น; task นี้ใช้ฉบับเซ็นแล้ว
Owner: frontend-engineer
Tier: T5
Targets: sb-tech-upgrade-web-system
Depends on: FE-001
Traceability: REQ-021, AC-063, DES-018, DEC-018
Produces: none
Consumes: Contract:ApiAuthorization.v1
Risk: medium, security, breaking-contract
Human gate: security, breaking-contract
Status: pending

#### Scope and constraints

ใช้ `../../modules/timetableai/build/uxui/UX-004-auth-messages.md` ฉบับเซ็น as-is 2026-10-04 ครอบ copy/ช่องทาง 401/403 และลิงก์กลับหน้าหลักเท่านั้น (DES-018 §43.2b4e) · คง security/breaking-contract gates ของ DES-018; ห้ามตีความ 401/403 เป็น body status ปกติ/เพิ่มทางเลี่ยง token · คง AC-063 ของ FE-001; ไม่แตะ Sidebar (FE-011) · UX-005 ไม่อยู่ใน task · **ไม่เพิ่ม retry control:** signed UX-004 ไม่ครอบ retry; FE-019 คง reload/no auto retry; ข้อเสนอ retry อยู่ BL-018 รอ UX/คำตัดสิน scope ใหม่

#### Retrieval hints

Hypothesis: การส่งต่อ 401/403 ที่ FE-001 ทำอยู่ใน `src/lib/backendProxy.ts` และทางแสดงข้อผิดพลาดของแต่ละหน้าใต้ `src/app/[locale]/timetable/**` (worktree) · หน้า SessionExpired มีอยู่แล้ว (design §16)
Query: ค้น `SessionExpired`, `403`, `Forbidden`, `SchoolMismatch`, `status === 403` ใน `src/app/[locale]/timetable`, `src/lib`, `src/components`
Provenance: DES-018, DEC-018, Contract:ApiAuthorization.v1

#### Do not modify

การส่ง Bearer และการส่งต่อ 401/403 ของ `backendProxy.ts` (FE-001) · `Sidebar.tsx` · backend

#### Acceptance criteria

AC-063: ทุก action ที่ได้ 403 แสดง copy ของ UX-004 ที่เซ็น · เข้าหน้าด้วย URL ตรงโดยไม่มีสิทธิ์ → หน้า 403 พร้อมลิงก์กลับหน้าหลัก · 401 → SessionExpired · ไม่มีจุดใดแสดงสำเร็จหรือเงียบ

#### Required validation and expected evidence

ตรวจ AC-063 ด้วยผู้ใช้ไม่มีสิทธิ์เมนูทดสอบ action อ่าน/เขียนตัวแทนทั้ง 5 หน้า (403 → copy ของ UX-004) + เข้า URL ตรงทั้ง 5 หน้า (หน้า 403 + ลิงก์กลับหน้าหลัก) + token หมดอายุ (→ SessionExpired) — ภาพเทียบ UX-004 ที่เซ็น + รายการ call ของ FE-001 ยังผ่าน · typecheck/lint/build ผ่าน — เก็บภาพและรายการ call เป็นหลักฐาน

#### Rollback/compatibility notes

revert คืนทางแสดงข้อผิดพลาดเดิมของ FE-001 (ยังผ่าน AC-063) · ไม่มีสัญญาเปลี่ยน

## Phase 7: Module G — Frontend Request-Failure Rules (DES-018 §43.2b, SA-Q19 = A) + Request Hygiene 🔒 Security gate

### Task FE-018 — 401 = SessionExpired only: remove page toasts / Alerts / `saveError` on 401 (DES-018 §43.2b item 1, RV-10)
Owner: frontend-engineer
Tier: T5
Targets: sb-tech-upgrade-web-system
Depends on: FE-001
Traceability: REQ-021, AC-066, AC-063, DES-018, DEC-018
Produces: none
Risk: low, security, breaking-contract
Human gate: security, breaking-contract
Status: verified
> รายละเอียดงานที่ verified ย้ายไป archive แล้ว — เนื้อหาเดิมทั้งหมด (Objective, Why, Scope and constraints, Retrieval hints, Do not modify, Acceptance criteria, Required validation and expected evidence, Rollback/compatibility notes) ย้าย verbatim ไป `plan-archive.md` §FE-018 · สัญญาต้นทาง = `design.md` (Traceability ด้านบน) · หลักฐานรอบ QA = `qa.md` / `qa/phase-*.md` · ช่อง Status คงค่าเดิมของ `qa-engineer`

### Task FE-019 — Required-load failure blocks Generate / Regenerate / Save, cancels a pending Generate, page stays viewable (DES-018 §43.2b item 4 (a)–(d), SA-Q19 = A, RV-11/RV-12)

Objective: ทำ §43.2b ข้อ 4 (a)–(d) **พร้อมกันต่อหน้า** บนสองหน้า · **(1) `manage-teaching-schedule` (หน้า generate + เส้นทาง restore):** load required ตามตาราง §43.2b ข้อ 3 (`class-period/get` ของหน้าและของ `TimetableGrid`, `setting/get`, `subject-settings/get`, `timetable/get-all-by-year`, `teacher-group/get-all` และ load ของ restore — `teacher-class-assignment/get-by-class`, plan subjects, `setting/get`) มีผลแยก "สำเร็จ" (2xx + `status === 1` + รูปข้อมูลที่ต้องใช้ — ข้อ 2) จาก "ล้ม" · เลิกตั้ง loaded ใน `finally` โดยไม่มีเงื่อนไข · **(a)** หน้ายังดูได้: ความล้มเหลวไม่ทำให้ทั้งหน้าค้าง spinner · ส่วนที่โหลดสำเร็จแสดงตามปกติ · ช่องทาง = toast เดิมของ AC-063 (401 ไม่มี toast — FE-018) · 200 + `status !== 1` ต้อง toast เหมือน non-401 อื่น · **(b)** Generate และ Regenerate ไม่ถูกเรียก และ Save ของตาราง (หน้า generate และ restore) ไม่ถูกส่ง เมื่อ required load ใดของบริบทปัจจุบันล้ม — ใช้สถานะ disabled ที่ component มีอยู่ · **(c)** Generate ที่รออยู่ (`fireGeneration` ที่รอ `onReady`) ไม่รันและสถานะ "กำลัง Generate" ถูกปิดเมื่อ required load ใดล้ม · `TimetableGrid` รายงาน `onReady({ ok })` แบบ additive (ผู้เรียกเดิมที่ไม่อ่าน `ok` ไม่พัง) · ห้ามรันบน `DEFAULT_ROWS`/`DEFAULT_TIMES` · **(d)** gate `setting/get` ปลดการบล็อกเฉพาะเมื่อสำเร็จตามข้อ 2 — ปิด drift ที่ตั้ง `settingsLoaded = true` เมื่อ 200 + `status !== 1` โดยไม่มี toast · **(2) `settings/[year]`:** Save ไม่ถูกส่งจนกว่า `setting/get` ของหน้านั้นสำเร็จ · ล้ม → หน้ายังดูได้ + toast · **(3) design Rev 20 §43.2b ข้อ 5 (2026-10-04 — รอบแก้ที่กำลังรัน):** (5.1) เพิ่ม `curriculum-plans` ของ restore เข้าชั้น required · `subject-settings/get` สำเร็จเมื่อ `data.lstLinkSubjectSettings` เป็น array (`[]` = สำเร็จ; `data` null / ไม่มี key / ไม่ใช่ array = ผิดรูป — ห้ามแปลงเป็น `[]`) · (5.3) กริด `class-period/get`: ไม่มี `periodGridData` และสร้างแถวไม่ได้ → `onReady({ ok:false })` + toast id เดิม · (5.5) toast ≤ 1 ต่อ load (endpoint, บริบท) ต่อ page instance — `setting/get` ที่อ่านสองครั้งในบริบทเดียวใช้ toast id เดียว · (5.6) key บริบทของผลโหลดรวมโรงเรียน (`user.schoolId`) ทุก load — รวมการล้าง `gridLoadFailed` และ `periodLoadFailed`/`restoreLoadFailed` · (5.2) restore แบบ `displayOnly` ขณะบล็อก = "ดู" อนุญาต (ไม่ใช่ Generate) · **SA-Q24 = A** (ผู้ใช้ 2026-10-04): restore ที่ load ระดับหน้าล้ม = header + toast ไม่มีกริด → นับว่า "หน้ายังดูได้" (AC-067) · reload กู้คืน · ไม่มี UI ใหม่
Why: RV-11 + RV-12 → SA-P5-Q1 → **SA-Q19 = A** (ผู้ใช้เลือก 2026-10-01, design Rev 18) · R38: Generate/Save บนข้อมูลที่โหลดไม่สำเร็จทำให้ตารางที่บันทึกละเมิด link subject / ชนตารางอื่น / ผิดโครงคาบ และ Save ของ `settings/[year]` ทับค่าจริงด้วยค่าเริ่มต้น · Fallback ของ design ห้ามแก้ทีละส่วน ((a)–(d) ต้องออกพร้อมกันต่อหน้า) → task เดียว · รวมสองหน้าเพราะกติกา หลักฐาน และ rollback เดียวกัน (`settings/[year]` ใช้เพียงข้อ (a)/(b) ของ Save) · หลัง FE-018 เพราะแก้ `settings/[year]/page.tsx` ไฟล์เดียวกัน และกติกา 401 ของ FE-018 เป็นฐานของข้อ (a)
Owner: frontend-engineer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: FE-001, FE-018
Traceability: REQ-021, AC-067, AC-068, AC-069, AC-070, AC-063, AC-066, DES-018, DEC-018
Produces: none
Consumes: Contract:ApiAuthorization.v1
Risk: high, security, breaking-contract
Human gate: security, breaking-contract
Status: verified

#### Scope and constraints

**ปุ่ม/control "ลองใหม่" ไม่อยู่ใน task นี้** — signed UX-004 ครอบ 401/403 ไม่ครอบ retry (SA clarification §43.2b4e; FE-016/BL-018) → ทางกู้คืนเดียวของ task นี้คือ reload หน้า (§43.2b ข้อ 4 e) · ห้าม retry อัตโนมัติ · ไม่มี copy ใหม่ · การวางมือ/ดูตาราง (Flow B.2) ไม่ถูกบล็อก · การบล็อก = action ไม่ถูกเรียก (ไม่ใช่เรียกแล้วรอ backend ปฏิเสธ) · load ไม่บังคับ (รายการปี, หลักสูตรใน modal, ชื่อครู, ระดับชั้น) ล้ม = toast เท่านั้น ไม่บล็อก · "ไม่มีแถว" ที่ backend คืน 200 + `status:1` + ค่าเริ่มต้น = สำเร็จ — โรงเรียนใหม่ต้องไม่ถูกบล็อก · abort ที่ระบบ/ผู้ใช้ยกเลิกเอง (เปลี่ยนตาราง, unmount) ไม่ใช่ความล้มเหลว · ผลของ load ผูกกับบริบทปัจจุบัน (โรงเรียน, ปี, ตารางที่ restore) — ผลของบริบทเก่าไม่ปลดหรือบล็อกบริบทใหม่ · 401 ไม่มี toast (FE-018) แต่ยังนับเป็น "ล้ม" สำหรับการบล็อก · หน้าอื่นใน 7 routes ไม่อยู่ใน task นี้ (§43.2b ข้อ 4 f — ใช้เมื่อ engineer แตะหน้านั้น) · ประตู `security` + `breaking-contract` สะท้อน DES-018 — task ไม่เปลี่ยนพื้นผิว API/สิทธิ์/สคีมา · ก่อน task นี้ verified → as-built คงไว้และ R38 ยังเปิด (Fallback) · FE-001 `verified` → รอบ QA ตรวจ AC-063 ซ้ำ · เกณฑ์ = **AC-067** (ข้อ 4 a), **AC-068** (ข้อ 4 b/d), **AC-069** (ข้อ 4 c), **AC-070** (ข้อ 4 e — reload, ไม่ retry อัตโนมัติ) ของ `requirement.md` (2026-10-02) + §43.2b ข้อ 2–4 และ R38 · นิยาม "สำเร็จ" (ข้อ 2), "ไม่มีแถว = สำเร็จ" และรายการ load ไม่บังคับ (ข้อ 3) มาจาก design (SA) ไม่อยู่ในถ้อยคำ AC · AC-063/AC-066 = regression · worktree frontend ยังไม่ commit — ยืนยันบรรทัดก่อนแก้ · *(2026-10-04)* oracle ของรูปขั้นต่ำ / ว่าง / หน่วยนับ toast / key บริบท = design §43.2b ข้อ 5.1–5.6 (Rev 20 — ไม่มีพื้นผิว API/สิทธิ์/schema ใหม่) · SA-Q24 ปิด = A (`requirement.md` OQ-42 = SA-Q24) — ไม่มี empty state / มุมมองลดรูป / copy ใหม่

#### Retrieval hints

*(Rev 20, `inferred`, worktree)* `page.tsx:1022-1040` (`curriculum-plans` ไม่ตั้ง `restoreLoadFailed`), `:614, :619-620` (`subject-settings/get` รับ `data` null / แปลง list หายเป็น `[]`), `:138` vs `:1189` (toast id ของ `setting/get` ต่างกัน) · `TimetableGrid.tsx:551-557` (`ok:true` ขณะ `newRows` ว่าง) · `use-timetable-generation.ts:947` (ล้าง `gridLoadFailed` ไม่รวมโรงเรียน) · `page.tsx:883-887` (bootstrap ไม่ล้าง `periodLoadFailed`/`restoreLoadFailed`) — design §43.2b ข้อ 5
Hypothesis: `manage-teaching-schedule/page.tsx:118-159` (gate `setting/get` — `!res.ok` ~131-135, `status === 1` ~137, `setSettingsLoaded(true)` ~152 ไม่มีเงื่อนไข, catch ~154-158), `:342` (`isScheduleDataReady`), `:586-604` (`subject-settings/get` ตั้ง loaded ใน `finally`), `:1168-1176` (load ของ restore), `:1264-1284` (`class-period/get`), `:1426` (spinner) · `_lib/use-timetable-generation.ts:85-104` (`get-all-by-year`), `:114-154` (`teacher-group/get-all`), `:914-957` (`handleGridReady`/`fireGeneration`) · `TimetableGrid.tsx:448-477, 573-578` (`onReady` เมื่อ load ล้ม/network, `DEFAULT_ROWS`/`DEFAULT_TIMES`) · `settings/[year]/page.tsx:198-231` (load), `:233-296` (`isFormValid`, Save) — design §43.2b หลักฐาน Rev 17/18 (`inferred`, worktree)
Query: ค้น `settingsLoaded`, `isScheduleDataReady`, `onReady`, `handleGridReady`, `fireGeneration`, `DEFAULT_ROWS`, `DEFAULT_TIMES`, `finally`, `status === 1`, `readJsonOrNotify`, `isFormValid`, `disabled` ใน `src/app/[locale]/timetable/manage-teaching-schedule`, `src/app/[locale]/timetable/settings`, `src/components/layout/home/manage-teaching-schedule`, `src/lib`
Provenance: DES-018, DEC-018, Contract:ApiAuthorization.v1

#### Do not modify

ตรรกะ solver/การวางคาบ (Flow B.1/B.2) และโค้ดของ FE-003/FE-005/FE-008 นอกจุดที่ต้องรอผลโหลด · `timetableFetch`/`backendProxy.ts` · การจัดการ 401 ของ FE-018 · copy/UI ใหม่ (รวมปุ่มลองใหม่ — อยู่นอก signed UX-004) · หน้าอื่นใน 7 routes · backend

#### Acceptance criteria

AC-067 (ข้อ 4 a): หน้า generate, เส้นทาง restore และ `settings/[year]` — required load ใดล้มด้วยเหตุที่ไม่ใช่ 401 (403 / 5xx / network / 200 + `status !== 1` / body ผิดรูป) → หน้ายังดูได้ แสดงส่วนที่โหลดสำเร็จ ไม่ค้าง spinner · ความล้มเหลวแสดงเป็น toast เดิมของ AC-063 (ไม่มีข้อความใหม่) · *(Rev 20)* toast ≤ 1 ต่อ load (endpoint, บริบท) ต่อ page instance และ ≥ 1 เมื่อมี non-401 failure (§43.2b ข้อ 5.5) · restore ที่ `class-period/get` ของหน้า (หรือ `timetable/get`) ล้ม = header + toast ไม่มีกริด/Save → **ผ่าน AC-067** (SA-Q24 = A, ผู้ใช้ 2026-10-04) · restore `displayOnly` ขณะบล็อกยัง apply ตารางที่บันทึกได้ ห้ามวางบน `DEFAULT_*` (ข้อ 5.2)
AC-068 (ข้อ 4 b/d): required load ใดของบริบทปัจจุบันล้ม → Generate / Regenerate และ Save ตาราง (หน้า generate + restore) ไม่ถูกเรียก (control disabled, request = 0) · `settings/[year]`: `setting/get` ล้ม → Save ไม่ถูกส่ง · `setting/get` ได้ 200 + `status !== 1` → ยังบล็อก · ควบคุม: ทุก required load สำเร็จ (รวมโรงเรียนใหม่ที่ `Setting/Get` คืนค่าเริ่มต้น) → Generate/Save ทำงานเหมือน as-built · load ไม่บังคับล้ม → toast เท่านั้น ไม่บล็อก · *(Rev 20)* `curriculum-plans` ของ restore ล้ม → Regenerate/Save ของ restore บล็อก (ข้อ 5.1) · `subject-settings/get` ได้ `data` null / ไม่มี `lstLinkSubjectSettings` / ไม่ใช่ array → บล็อก · `lstLinkSubjectSettings: []` → ไม่บล็อก (ข้อ 5.1) · ผลของบริบทเก่า (รวมโรงเรียนอื่น) ไม่ปลดและไม่บล็อกบริบทใหม่ (ข้อ 5.6)
AC-069 (ข้อ 4 c): Generate ที่รอข้อมูลอยู่ + required load ใดล้ม → Generate ไม่รัน สถานะ "กำลัง Generate" ปิด และไม่มีการรันบน `DEFAULT_ROWS`/`DEFAULT_TIMES` · *(Rev 20)* กริดไม่มี `periodGridData` และ `class-period/get` สร้างแถวไม่ได้ → `onReady({ ok:false })` (นับเป็นล้ม) · มี `periodGridData` (แม้ 0 แถว) + `lstPeriods: []` → `ok:true` ไม่ใช่ความล้มเหลว (ข้อ 5.3)
AC-070 (ข้อ 4 e): ทางกู้คืนเดียว = reload หน้า · ไม่มี retry อัตโนมัติของ load ที่ล้ม · task นี้ไม่เพิ่ม control/ถ้อยคำ "ลองใหม่" (signed UX-004 ไม่ครอบ retry)
AC-063 / AC-066 (regression): 401 ของ required load → SessionExpired เท่านั้น ไม่มี toast (แต่ยังนับเป็น "ล้ม" สำหรับ AC-068/AC-069) · 403 ยังเป็นความล้มเหลวที่ผู้ใช้เห็น · ไม่มีจุดใดแสดงสำเร็จหรือเงียบ

#### Required validation and expected evidence

ตรวจด้วย vitest ใหม่ต่อ required load (mock 403, 500, network, 200 + `{status:-1}`, body ผิดรูป, 401) ของหน้า generate, เส้นทาง restore และ `settings/[year]`: **AC-067** — toast (ไม่มีเมื่อ 401 = AC-066) · หน้าไม่ค้าง spinner · **AC-068** — ปุ่ม Generate/Regenerate/Save disabled และ handler ไม่ถูกเรียก (นับ request `timetable/set-all` / `setting/set` = 0) · **AC-069** — Generate ที่รออยู่ถูกยกเลิก (กริดรายงาน `onReady({ ok: false })` → solver ไม่ถูกเรียก, สถานะ generating = false) · **AC-070** — นับ request ของ load ที่ล้ม = 1 ต่อ page load (ไม่มี retry อัตโนมัติ) · mount ใหม่ (จำลอง reload) ที่ load สำเร็จ → ปลดบล็อก · grep ไม่พบ control/copy ลองใหม่ที่เพิ่มใหม่ · กรณีควบคุมของ AC-068: ทุก load สำเร็จ และโรงเรียนใหม่ (200 `status:1` ค่าเริ่มต้น) → Generate/Save ทำงาน · ผู้เรียก `onReady` เดิมที่ไม่อ่าน `ok` ยังผ่าน · regression AC-063/AC-066: รัน S10-A และ `timetable-session-expired.test.tsx` ซ้ำผ่าน · `[manual-E2E]` บน backend จริง: บังคับ 500/network ของ `setting/get` และ `class-period/get` แล้วยืนยัน (a)–(d) บนหน้า generate, restore และ `settings/[year]` · grep ยืนยันไม่มี required load ที่ตั้ง loaded ใน `finally` แบบไม่มีเงื่อนไขเหลือในสองหน้า · typecheck/lint (ไฟล์ที่แตะ)/build ผ่าน — เก็บตาราง "load × ความล้มเหลว → toast / บล็อก / ยกเลิก" ที่ระบุ AC-067..AC-070 ต่อคอลัมน์เป็นหลักฐาน · *(Rev 20, 2026-10-04)* vitest เพิ่ม: `curriculum-plans` ของ restore ล้ม (403/500/200 `status:-1`) → Regenerate/Save ของ restore request = 0 · `subject-settings/get` `data:null` / ไม่มี `lstLinkSubjectSettings` / ไม่ใช่ array → บล็อก และ `[]` → ไม่บล็อก · กริด: ไม่มี `periodGridData` + response สร้างแถวไม่ได้ → `ok:false` + toast `timetable-grid-period-load` และมี `periodGridData` + `lstPeriods: []` → `ok:true` · restore ที่ `setting/get` ล้มในบริบทเดียว (สองการอ่าน) → toast = 1 · เปลี่ยนโรงเรียนใน page instance เดิม → flag ล้มของโรงเรียนเก่าไม่บล็อกโรงเรียนใหม่ · restore ที่ load ระดับหน้าล้ม → header + toast ไม่มีกริด/Save (= pass ตาม SA-Q24 = A) · test ที่ assertion ต้องเปลี่ยนตามสัญญา → ระบุชื่อ + เหตุผลตาม `test-plan.md` §S12-F · แผนทดสอบ: `test-plan.md` §S12 (2026-10-02) + §S12-H (2026-10-04)

#### Rollback/compatibility notes

revert ทั้ง task เท่านั้น — ห้าม revert บางส่วน (Fallback ของ §43.2b ข้อ 4 ห้ามสภาพที่แก้ gate แล้วแต่ไม่บล็อก) → กลับ as-built และ R38 เปิดอีกครั้ง · `onReady({ ok })` additive — ผู้เรียกเดิมไม่กระทบ · ไม่มีสัญญา API/ข้อมูลเปลี่ยน

### Task FE-020 — Frontend request hygiene on the 7 routes (RV-7, RV-13, RV-14, RV-15) + missing 403 tests

Objective: **(1) RV-15** — write ที่ถือ HTTP 200 ทุกตัวว่าบันทึกแล้ว (`timetable/set-all` ที่ `manage-teaching-schedule/page.tsx` ~727-736, `teacher-group/set-times` ที่ `TeacherGroupsTab.tsx` ~551-558 และ ~812) ต้องอ่าน body `status` — 200 + `status !== 1` = ล้ม (toast/rollback ทางเดิม ไม่เปิด success modal หรือสรุปสำเร็จ) ตาม DES-002 (HTTP 200 เสมอ ผลธุรกิจอยู่ใน `status`) · **(2) RV-7** — rollback ของ `persistGroupTeachers` และของ `set-times` modal ต้องไม่คืน snapshot ทั้งก้อนทับผลของ request ที่สำเร็จทีหลัง (serialize ต่อกลุ่ม หรือ rollback เฉพาะเมื่อ response เป็นของ request ล่าสุด) และย้าย side effect ออกจาก updater ของ `setTeacherGroups` · **(3) RV-13** — `handleGroupModalSave` ของ `subject-settings/[year]` เรียก `loadSubjectSettings()` ใน `catch` ให้ UI ตรงกับ server หลัง delete สำเร็จแต่ set ล้ม · **(4) RV-14** — เลิก `readJsonOrNotify` ท้องถิ่นที่บังชื่อ import ในบล็อก restore (ใช้ helper ร่วมด้วย id `restore-schedule-data`) · **(5)** เพิ่ม test 403 ที่ยังขาดของ loader/write ใน `subject-settings/[year]`, `settings/[year]`, `create-class-period/[year]` และ loader ของ generation hook (`use-timetable-generation.ts`)
Why: `review.md` RV-7/RV-13/RV-14/RV-15 (non-blocking, มีมาก่อน — `qa.md` ส่ง RV-15 ให้ `project-manager`) · อยู่นอกถ้อยคำ AC-063 (และนอก AC-066..AC-072) แต่ RV-15 แสดง "สำเร็จ" ขณะที่ backend รายงานล้ม (เสี่ยงข้อมูล) และ RV-7/RV-13 ทำให้ UI ไม่ตรงกับ server · test 403 ที่ขาดทำให้ regression ของ AC-063 บนพื้นที่เหล่านี้พึ่งการอ่านโค้ดอย่างเดียว · **รวมเป็น task เดียว** เพราะ owner, ชนิดหลักฐาน (vitest + อ่านโค้ด), rollback (revert ไฟล์ frontend) เหมือนกัน ไม่มีสัญญาใหม่ และแต่ละข้อเล็กเกินจะแยก · **แยกจาก FE-019** เพื่อไม่ถ่วงชุด (a)–(d) ที่ต้องออกพร้อมกัน · หลัง FE-018/FE-019 เพราะแก้ไฟล์เดียวกัน (`manage-teaching-schedule/page.tsx`, `subject-settings/[year]`, `settings/[year]`, `create-class-period`)
Owner: frontend-engineer
Tier: T4
Targets: sb-tech-upgrade-web-system
Depends on: FE-018, FE-019
Traceability: REQ-021, AC-063, DES-018, DEC-018
Produces: none
Consumes: Contract:ApiAuthorization.v1
Risk: medium, security, breaking-contract
Human gate: security, breaking-contract
Status: verified

#### Scope and constraints

ไม่มี copy ใหม่ · ไม่มี endpoint/สัญญาใหม่ — การแทนที่แบบ atomic ของ RV-13 ต้องมี backend replace endpoint จึงอยู่นอก task (Unresolved Open Questions → `system-analyst` ถ้าต้องการ) · ไม่แตะกติกาการบล็อกของ FE-019 และกติกา 401 ของ FE-018 (401 ยังไม่มี toast) · ไม่ลบ `CreateClassPeriodForm` (RV-9 — Unresolved Open Questions) · ประตู `security` + `breaking-contract` สะท้อน DES-018 — task ไม่เพิ่ม breaking · **ไม่มี AC ใหม่ (ตรวจแล้ว 2026-10-02):** AC-066..AC-072 ที่ BA เพิ่มไม่มีข้อใดครอบ task นี้ — AC-067..AC-070 ว่าด้วย *load* ที่จำเป็นต่อ Generate/Save ไม่ใช่ผลของ *write* (RV-15), การ rollback ซ้อน (RV-7) หรือ reload หลัง delete+set (RV-13) · Traceability จึงคงเป็น **AC-063 เท่านั้น** (test 403 ของ loader/write = ส่วน "403 แสดงเป็นความล้มเหลวที่ผู้ใช้เห็น") · **AC-062 ไม่ใช้** — เป็นการตัดสิน 403 ของ backend ที่ task frontend ที่ mock 403 พิสูจน์ไม่ได้ · RV-15/RV-7/RV-13 ยังไม่มีถ้อยคำ AC — อ้าง DES-002 (`status` ใน body) และ AC-063 "ไม่มีจุดใดแสดงสำเร็จ" ในเชิงเจตนาเท่านั้น (ถ้าต้องมี AC แยก → `business-analyst` ก่อนรอบ QA — Unresolved Open Questions) · test 403 ของ loader ใน generation hook และ `setting/get` ของ `settings/[year]` ซ้อนกับ AC-067 ที่ FE-019 เป็นเจ้าของ — ที่นี่เป็น regression ไม่ใช่หลักฐานของ AC-067 · AC-066 = regression (401 ยังไม่มี toast — รัน test ของ FE-018 ซ้ำ) · worktree frontend ยังไม่ commit — ยืนยันบรรทัดก่อนแก้

#### Retrieval hints

Hypothesis: `manage-teaching-schedule/page.tsx:727-736` (`set-all` ไม่อ่าน `status`), `:1156-1166` (`readJsonOrNotify` ท้องถิ่น — แบบอย่าง helper ร่วมที่ ~999) · `manage-timetable/[year]/TeacherGroupsTab.tsx:70-119` (`persistGroupTeachers` ใน updater ~110, ~119), `:501-512` (`set-times` modal snapshot), `:551-558`, `:812` · `subject-settings/[year]/page.tsx:344-395` (delete แล้ว set, catch ~391-394 ไม่ reload) · write ที่ตรวจ `json.status` แล้ว: `add-multiple` ~762, `update` ~1007, `teacher-class-assignment/set` ~574 — `review.md` RV-7/RV-13/RV-14/RV-15 (`inferred`, worktree)
Query: ค้น `set-all`, `set-times`, `persistGroupTeachers`, `setTeacherGroups`, `previousTeachers`, `handleGroupModalSave`, `loadSubjectSettings`, `readJsonOrNotify`, `json.status`, `setCreatedGroupsSummary` ใน `src/app/[locale]/timetable` และ `tests/`
Provenance: DES-018, DEC-018, Contract:ApiAuthorization.v1

#### Do not modify

`timetableFetch`/`authHeaders.ts`/`backendProxy.ts` · กติกาการบล็อกของ FE-019 · กติกา 401 ของ FE-018 · backend · การมีอยู่ของ `CreateClassPeriodForm`

#### Acceptance criteria

AC-063: write `timetable/set-all` และ `set-times` (modal + wizard) ที่ได้ 200 + `status !== 1` → ไม่แสดงสำเร็จ (ไม่มี success modal/สรุปสำเร็จ) + toast/rollback · แก้กลุ่มครูสองครั้งติดกันที่ request แรกล้มหลัง request สองสำเร็จ → UI ตรงกับ server · ไม่มี POST ซ้ำภายใต้ StrictMode · `subject-settings` delete สำเร็จแต่ set ล้ม → หน้ารีโหลดสถานะจาก server · บล็อก restore ใช้ helper ร่วม (ไม่มีการบังชื่อ) · loader/write ของ `subject-settings/[year]`, `settings/[year]`, `create-class-period/[year]` และ generation hook ที่ได้ 403 → ความล้มเหลวที่ผู้ใช้เห็น พร้อม test

#### Required validation and expected evidence

ตรวจ AC-063 ด้วย vitest: (1) mock 200 `{status:-1}` ของ `set-all`/`set-times` → ไม่มี success modal/สรุป + toast/rollback (2) สองการแก้ซ้อน (request 1 ล้มหลัง request 2 สำเร็จ) → state = ผลของ request 2 และนับ POST = 1 ต่อการกดภายใต้ StrictMode (3) delete OK + set 500 → `loadSubjectSettings` ถูกเรียก (4) 403 ของ loader/write ทุกจุดในสี่พื้นที่ข้างบน → toast/Alert · รัน S10-A, `timetable-session-expired.test.tsx` และ test ของ FE-018/FE-019 ซ้ำผ่าน · grep ไม่พบ `readJsonOrNotify` ท้องถิ่น · typecheck/lint (ไฟล์ที่แตะ)/build ผ่าน — เก็บผลรันเป็นหลักฐาน

#### Rollback/compatibility notes

revert ได้อิสระ — กลับพฤติกรรม as-built (ไม่ใช่ regression ของ AC-063) · ไม่มีสัญญา/ข้อมูลเปลี่ยน

## Phase 8: REQ-012 — Term Dimension (DES-009) 🔒 Security gate

> หน่วยขอบเขตของโมดูลเปลี่ยนเป็น (nSchoolID, nYear, sTermID) ทั้งโมดูล — breaking ตั้งแต่ release ไม่มีช่วงผ่อนผัน (AC-065 — ผู้ใช้เลือก "เริ่มเลย") → **BE-010 + FE-021 ต้องออก release เดียวกัน** · ขวางอยู่ที่ schema confirmation §27.5 + SA-Q1 (Waiting on Human #10) และ migration/backfill (#11 — ไม่ขวางการเขียนโค้ด)

### Task UX-007 — UX artifact: term context/selector across the 7 routes (DES-009 §34.6, REQ-012 AC-027)
Owner: uxui-designer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: none
Traceability: REQ-012, AC-027, DES-009, DEC-009
Produces: uxui/UX-007-term-context.md
Consumes: Contract:TimetableTermScope.v1
Risk: medium
Human gate: schema
Status: pending

#### Scope and constraints

ร่าง UX artifact ของมิติเทอม: ตำแหน่ง/พฤติกรรมตัวเลือกเทอมบนทั้ง 7 routes, การแสดงชื่อเทอมจาก `TTerm` (`sTermNumber`/`dStart` — ห้ามคำนวณ/hardcode, ห้าม localize คีย์ — BR-23 + บทเรียน §19-3), ผลของการเปลี่ยนเทอมต่อ state ของหน้า, กรณี `TTerm` ของปีว่าง/endpoint Terms ล้ม = แจ้งผู้ใช้และห้ามเดาเทอม/ห้าม hardcode "เทอม 1" (Fallback ของ DES-009) · การเขียนทับที่เกี่ยวกับเทอมต้องมีขั้นยืนยัน (สัญญา §35.2 — ร่วมกับ UX-008) · **เริ่มร่างได้หลัง schema confirmation §27.5 เซ็น** (§34.6 — Waiting on Human #10) · เกณฑ์ = AC-027

#### Retrieval hints

Hypothesis: design §34.6 (ขอบเขต UX), §25.1 (รายการ API ต่อหน้า), §35.2 · `../../modules/timetableai/build/uxui/README.md` (รูปแบบ artifact + ตาราง Sign-off)
Query: ค้น `TTerm`, `sTermNumber`, `dStart`, `Terms` ใน `design.md` §34

#### Do not modify

ไม่แตะโค้ด — เขียนเฉพาะ `../../modules/timetableai/build/uxui/UX-007-term-context.md` + ทะเบียนใน `../../modules/timetableai/build/uxui/README.md` · สัญญา (DES-009) ไม่ใช่ของ uxui-designer

#### Acceptance criteria

AC-027: artifact แสดงว่าตัวเลือกเทอมทุกหน้าอ้าง `TTerm` ของปีนั้นเสมอ — ไม่มีจุด hardcode จำนวน/ชื่อเทอม

#### Required validation and expected evidence

artifact ครอบครบ 7 routes + กรณี `TTerm` ว่าง/ล้ม + มีตาราง Sign-off ท้ายไฟล์ (คนเซ็น — agent ไม่เซ็นแทน) · ทะเบียนใน `../../modules/timetableai/build/uxui/README.md` · หลังคนเซ็น → `project-manager` ตรวจว่าฉบับที่เซ็นไม่เปลี่ยนขอบเขต task แล้วให้ `qa-engineer` เปลี่ยน Status ของ FE-021

#### Rollback/compatibility notes

ร่างเอกสาร — ไม่กระทบโค้ด/สัญญา

### Task BE-010 — Term dimension backend: additive `sTermID` + VR-8/VR-9 + BR-17a conflict scope (DES-009)
Owner: backend-engineer
Tier: T2
Targets: sb-api-academic-timetable-ai
Depends on: none
Traceability: REQ-012, AC-026, AC-027, AC-028, AC-065, DES-009, DEC-009
Produces: none
Consumes: Contract:TimetableTermScope.v1
Risk: critical, security, breaking-contract
Human gate: schema, breaking-contract, security
Status: pending

#### Scope and constraints

มิติเทอมฝั่ง backend ตาม design §34.1–§34.4: model/request เพิ่ม `sTermID` แบบ **additive** บน 4 ตาราง (`Tbl_Setting`, `Tbl_ClassPeriod`, `Tbl_TeacherClassAssignment`, `Tbl_Timetable` — §27.5) — **ไม่มี DDL ใน task นี้** (DDL/backfill = Waiting on Human #11 โดย `devops`) · endpoint ครบทุกกลุ่มของตาราง §34.2 — Setting/Get|Set (**เงื่อนไข lookup รวม sTermID ไม่ใช่แค่เก็บค่า** — EVD-033), SubjectSettings/Get, ClassContinuity/Get|Set, LinkSubjectSetting/Get|Set|Delete (ผูกผ่าน `nSettingID` — ไม่เพิ่มคอลัมน์ EVD-039), ClassPeriod/Get|Set|Delete, TeacherGroup/GetAll|GetAllByYear (`periodIDsInYear` → ชุด period ของ (year, term)), TeacherClassAssignment/GetAll|GetAllByYear|GetTeachersByClass|Set, Timetable/GetAllByYear|Get|Set · read school DB **กรองเทอม** ผ่าน `TTermSubLevel2.nTerm` — `School/{id}/Year/{y}/Plans` และ `LevelClasses` (D36 — จุดที่ AC-026 พังง่ายที่สุด) · endpoint `School/{id}/Year/{y}/Terms` มีอยู่แล้ว **ไม่แก้** (EVD-026) · BR-22..BR-26 (แถว `sTermID IS NULL` = legacy ทั้งปี — อ่านได้ นับใน conflict ทุกเทอม; ห้ามสร้าง/แก้ `TTerm`) · **VR-8** `TermNotInYear` (เทียบ `TTerm` ทุกครั้ง — `sTermID` เป็น identity จาก client เหมือน nSchoolID/nYear), **VR-9** `TermRequired` (มีผลตั้งแต่ release — ไม่มี grace ตาม AC-065) · **BR-17a** — `Timetable/GetAllByYear` รับ `sTermID` เป็นพารามิเตอร์ขอบเขต conflict (S1 — เทอมเดียวกัน + แถว NULL) ยกเว้นตัวเอง; ตัวเทียบเวลาจริงไม่เปลี่ยน · เกณฑ์ = AC-026 (ตาราง §34.2 = รายการจุดที่ต้องครบ) · AC-028 เป็นผลของ backfill (#11) — task นี้ต้องอ่านแถว NULL ได้ · AC-065 = VR-9 ไม่มีช่วงผ่อนผัน

#### Retrieval hints

Hypothesis: `AITimeTableBackend/Controllers/WebAPIController.cs` — `GetTermsInYear` :139, `Tbl_Setting` :1889, `GetTeacherGroupsByYear` :1759, `GetPlansByYear` :426, `GetAllTimetablesByYear` :2664, `SetTimetable` :2471, `UpsertTermSubLevel2Rows` :2787 · `Models/TTerm.cs:16` (`nTerm` — string) · `Models/Tbl_Setting.cs:12` · `Models/TTermSubLevel2.cs:16` · ตาม Evidence EVD-025..EVD-035 ของ DES-009 (design §34)
Query: ค้น `Tbl_Setting`, `Tbl_ClassPeriod`, `Tbl_TeacherClassAssignment`, `Tbl_Timetable`, `TTerm`, `nTerm`, `GetAllByYear`, `periodIDsInYear`, `LevelClasses` ใน `AITimeTableBackend`

#### Do not modify

schema จริง (DDL เป็นของ Waiting on Human #11) · `TTerm` และ endpoint Terms (อ่านอย่างเดียว — BR-23) · DES-018 auth ทั้งหมด (BE-001..BE-009) · validation/envelope เดิมของ DES-002 · `Tbl_TeacherGroup`, `Tbl_TimetableClass`, `Tbl_LinkSubjectSetting(+Detail)` (derive ตามแม่ — ไม่เพิ่มคอลัมน์) · solver/validateDrop (BR-17a เป็นพารามิเตอร์ของ query ไม่ใช่ตรรกะ solver)

#### Acceptance criteria

AC-026: ทุกจุดอ่าน-เขียนในตาราง §34.2 ผูก (nSchoolID, nYear, sTermID) — ไม่มีจุดใดทำงานข้ามเทอมโดยไม่ตั้งใจ (รวม read ของ school DB ที่กรองเทอมแล้ว)
AC-027: เทอมมาจาก `TTerm` อย่างเดียวผ่าน endpoint Terms — ไม่มี hardcode
AC-065: request ที่ละเว้น `sTermID` → `TermRequired` (VR-9) ทันทีตั้งแต่ release — ไม่มี grace; `sTermID` นอกชุดเทอมของปี → `TermNotInYear` (VR-8) ไม่เขียนอะไร
AC-028 (เตรียมพร้อม): อ่านแถว `sTermID IS NULL` ได้ (legacy ทั้งปี) — การ backfill เป็นของ #11

#### Required validation and expected evidence

`dotnet build` + `dotnet test` · test ของ VR-8/VR-9 (รวมกรณี NULL ของ `TTerm` เทียบ) · test BR-17a — ชุด conflict ของเทอมเดียวกัน + แถว NULL นับทุกเทอม + ตัดตัวเอง · grep ยืนยัน endpoint ครบทุกแถวของตาราง §34.2 (รวม Plans/LevelClasses กรอง `TTermSubLevel2.nTerm`) · `[manual-API]` หลัง cutover (ผูก #11) · เกณฑ์ schema ยังไม่เซ็น (#10) → task นี้ยัง dispatch ไม่ได้

DES-018 regression: term parameter ไม่ข้าม tenant/resource ownership; claims และ existing menu mapping คงเดิม

#### Rollback/compatibility notes

additive ที่ระดับ API แต่ **breaking** ที่พฤติกรรม — release window เดียวกับ FE-021 (AC-065); release ล้มกลางทาง → ถอย release ทั้งชุด ห้ามเปิดโหมดบังคับเทอมบางส่วน · revert แล้วกลับ as-built (ไม่มีเทอม) · ไม่มีสคีมาเปลี่ยนใน task นี้

### Task FE-021 — Term dimension frontend: Terms proxy + term context on 7 routes + bridge + conflict scope S1 (DES-009)
Owner: frontend-engineer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: BE-010, UX-007
Traceability: REQ-012, AC-026, AC-027, AC-065, DES-009, DEC-009
Produces: none
Consumes: Contract:TimetableTermScope.v1
Risk: high, breaking-contract
Human gate: breaking-contract
Status: pending

#### Scope and constraints

ฝั่ง frontend ตาม design §34.2 รายการ 1–5: proxy ใหม่ `/api/school/[schoolId]/years/[yearId]/terms` → `School/{id}/Year/{y}/Terms` (รูปแบบเดียวกับ `years/[yearId]/plans` — วันนี้ไม่มี, D37) · ทุกหน้าใน 7 routes ที่อ่าน `[year]` ต้องมี**เทอมที่เลือก**และส่ง `sTermID` ไปทุก call · สะพาน `localStorage` พา `sTermID` คู่กับ `nScheduleID`/`nYear` (จุดที่พลาดแล้วตารางถูกบันทึกผิดเทอมเงียบ ๆ) · ชุด conflict data (`isConflictDataReady`) โหลดตามขอบเขต S1 (BR-17a — เทอมเดียวกัน + แถว NULL) · แสดงชื่อเทอมจาก endpoint (`sTermNumber`/`dStart`) — ห้าม hardcode/คำนวณ/localize คีย์ · จัดการ VR-9/VR-8 ตามกติกา 200 + `status !== 1` ที่ FE-018/FE-019 วางไว้ · UX ตาม artifact UX-007 ที่มีคนเซ็น (Waiting on Human #16) · **ออก release เดียวกับ BE-010** (AC-065) · เกณฑ์ = AC-026/AC-027 ฝั่ง UI

#### Retrieval hints

Hypothesis: `src/app/api/` (proxy รูปแบบ `years/[yearId]/plans`), 7 routes ใต้ `src/app/[locale]/timetable/`, จุดอ่าน `[year]` ต่อหน้า (§25.1), `localStorage` bridge จาก `/timetable/[year]` (§25.2), `isConflictDataReady` ใน `manage-teaching-schedule` · ตาม design §34.2 ฝั่ง frontend
Query: ค้น `years/[yearId]`, `localStorage`, `nScheduleID`, `nYear`, `isConflictDataReady`, `[year]` ใน `src/app`

#### Do not modify

`timetableFetch`/`backendProxy.ts` และกติกา 401 ของ FE-018 (401 = SessionExpired เท่านั้น) · ตรรกะ solver/validateDrop (นอกจากพารามิเตอร์ขอบเขตของ conflict data) · งาน DES-012/013/014/015/017 (Phase 10–12) · endpoint เดิม

#### Acceptance criteria

AC-026/AC-027 ฝั่ง UI: ทุก call ของทุกหน้าแนบ `sTermID`; ตัวเลือกเทอมอ่านจาก endpoint Terms เสมอ
AC-065: frontend ส่ง `sTermID` ครบตั้งแต่ release — caller เดิมที่ไม่ส่งเจอ `TermRequired` อย่างเดียวกับที่ design กำหนด (breaking ตั้งใจ)

#### Required validation and expected evidence

vitest ต่อหน้า: ส่ง `sTermID` ครบทุก call (นับ request), bridge ข้ามหน้า, conflict data ต่อเทอม, กรณี Terms ล้ม/ว่าง = แจ้งผู้ใช้ไม่เดาเทอม · typecheck/lint/build (ไฟล์ที่แตะ) · `[manual-E2E]` กับ BE-010 ใน release window เดียว (ผูก #11) · worktree frontend ยังไม่ commit — ยืนยันบรรทัดก่อนแก้

#### Rollback/compatibility notes

revert คู่กับ BE-010 — release window เดียว (AC-065) · proxy ใหม่ additive · กลับ as-built = หน้าไม่มีเทอม

## Phase 9: REQ-013 — Copy Across Term/Year (DES-010) 🔒 Security gate

> ปุ่ม Copy 5 จุดเข้า + Preview → ยืนยัน → Apply (write ที่แรงที่สุดต่อ request ในโมดูล — เข้ารอบ `security` · Waiting on Human #1/#2) · blocked-by DES-009 (ต้องมีเทอมปลายทางให้เลือก) · ยังไม่มี endpoint/caller ทั้งสองฝั่ง (UI Copy ปัจจุบันเป็น mock — EVD-071, D45)

### Task UX-008 — UX artifact: Copy entry points + Preview/Apply flow on 5 pages (DES-010, REQ-013 AC-029..AC-032, AC-050, AC-051)
Owner: uxui-designer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: UX-007
Traceability: REQ-013, AC-029, AC-030, AC-031, AC-032, AC-050, AC-051, DES-010, DEC-010
Produces: uxui/UX-008-copy-across-term-year.md
Consumes: Contract:TimetableCopyAcrossTermYear.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

ร่าง UX artifact ของการคัดลอก: ปุ่ม Copy บน 5 หน้า list-page — ขอบเขตกำหนดโดย**หน้าที่กด** ไม่มี checkbox ผสมเมนู (AC-030 — requirement REQ-013 ตาราง 5 จุดเข้า) · flow Preview → ยืนยัน → Apply: คำเตือนเขียนทับแสดงรายการที่จะถูกลบ/ทับ (AC-031 — แทนที่ทั้งหมด ไม่ใช่เพิ่มซ้อน, BR-66), คำเตือนจับคู่ไม่ได้บางส่วน `lstUnmatched` (AC-051 — BR-68), บล็อกเมื่อ template ที่อ้างไม่มีที่ปลายทาง `lstMissingTemplates` (AC-050 — BR-67), บล็อก dependents `lstDependents` (BR-70), ผลลัพธ์จริง `lstCreated/lstOverwritten/lstSkipped` (ห้าม success modal ลวง — D26/D10) · เลือกตารางบางชุดได้เฉพาะจุดเข้า `/timetable` (BR-69)

#### Retrieval hints

Hypothesis: design §35.2, §35.7 (scope enum), §35.8 (BR-66..70) · mock เดิม `src/app/[locale]/timetable/timetable-copy-modal.tsx` (UI-only — EVD-071)
Query: ค้น `Copy`, `Preview`, `Apply`, `scope`, `lstUnmatched` ใน `design.md` §35

#### Do not modify

ไม่แตะโค้ด — เขียนเฉพาะ `../../modules/timetableai/build/uxui/UX-008-copy-across-term-year.md` + `../../modules/timetableai/build/uxui/README.md` · modal ของ `/academic` (`schedule-copy-modal.tsx`) คนละระบบ ห้ามอ้างเป็น precedent (EVD-041)

#### Acceptance criteria

AC-029..AC-032, AC-050, AC-051 แสดงเป็น flow ที่ผู้ใช้อ่านออกใน artifact — ครบทั้ง 5 จุดเข้า + ทุกคำเตือน/ผลลัพธ์ของ §35.8

#### Required validation and expected evidence

artifact ครอบครบ 5 จุดเข้า + ตาราง Sign-off ท้ายไฟล์ + ทะเบียน `../../modules/timetableai/build/uxui/README.md` · หลังคนเซ็น → PM ตรวจขอบเขต → `qa-engineer` ตั้ง Status ของ FE-022

#### Rollback/compatibility notes

ร่างเอกสาร — ไม่กระทบโค้ด/สัญญา

### Task BE-011 — `Timetable/Copy/Preview|Apply` — cross-term/year copy, single transaction (DES-010 §35, BR-66..BR-70)
Owner: backend-engineer
Tier: T2
Targets: sb-api-academic-timetable-ai
Depends on: BE-010, BE-012, BE-013
Traceability: REQ-013, AC-029, AC-030, AC-031, AC-032, AC-050, AC-051, DES-010, DEC-010, REQ-021, AC-060, AC-061, AC-062, DES-018, DEC-018
Produces: none
Consumes: Contract:TimetableCopyAcrossTermYear.v1
Risk: critical, security
Human gate: security
Status: pending

#### Scope and constraints

endpoint ใหม่สองตัวตาม design §35.1–§35.5 + §35.7 + §35.8: `Copy/Preview` (อ่านอย่างเดียว — รายการที่มีอยู่/จะเพิ่ม/จะถูกทับ, คำเตือน จับคู่ไม่ได้, `sPreviewToken`) · `Copy/Apply` (synchronous, **DB transaction เดียว** — commit ทั้งชุดหรือ rollback ทั้งชุด, ลำดับเขียน §35.3 คงที่) · `scope` enum 5 ค่า (`all`/`systemConditions`/`subjectConditions`/`classPeriods`/`teacherConditions`) — ขอบเขต/ตาราง/re-point ตามตาราง §35.7 (`Tbl_RoomSetting` คัดลอกกับ `subjectConditions`/`all` — OQ-33 ปิด; `Tbl_TeacherClassAssignment` ไม่คัดลอกทุก scope) · copy = สร้างแถวใหม่ + re-point id ภายในชุด (AC-032) · map ห้อง/หลักสูตรด้วย natural key (§35.4 — `TTermSubLevel2` ต่อเทอม, `TCurriculum` ผูกปี) · BR-66 แทนที่ทั้งหมดหลัง `isConfirmOverwrite` (soft-delete artifact ของ scope แล้วเขียน — ใน transaction เดียวกัน), BR-67 `MissingTemplate` บล็อกทั้งคำสั่ง, BR-68 `isConfirmPartial`/`lstSkipped`, BR-69 `lstTimetableIDs` เฉพาะ `all`, BR-70 `DependentsWouldBeOrphaned` · ปลายทาง = โรงเรียนเดียวกับต้นทางเสมอ (§35.5 — ไม่รับ nSchoolID ปลายทางแยก) · ลำดับตรวจ error §35.8: `InvalidCopyScope` → `TermNotInYear` → `DestinationChanged` → `MissingTemplate` → `DependentsWouldBeOrphaned` → `ConfirmationRequired` → `PartialMatchConfirmationRequired` · `NothingToCopy` · เกณฑ์ = AC-029 (input), AC-030 (scope ค่าเดียว), AC-031 (`ConfirmationRequired`/`DestinationChanged` — ห้ามเขียนทับเงียบ), AC-032 (กฎกำกับ §35.1 + §35.4), AC-050 (BR-67+BR-70), AC-051 (BR-68)

ลงทะเบียน endpoint ใหม่ใน authorization policy/filter ตาม DES-018 §43.2(a) ใน task เดียวกัน; คง fail-closed/claims/school-resource ownership และ audit identity จาก claims (BR-73); ไม่เชื่อ audit identity จาก client

รอ BE-012/BE-013 ตาม DES-010 §35.9 เพื่อ Copy ครบ SubjectRoom/RoomSetting และชั่วโมง/homeroom ตาม §35.7; ไม่ copy TeacherClassAssignment · C2 รองรับสัญญาปัจจุบัน; ถ้า #12 เลือก C1′ ต้อง SA amend read/edit/copy ก่อน ห้ามข้ามค่าห้อง/ลด scope เงียบ ๆ · Copy Preview และ Apply ทั้งคู่ตรวจ **write permission ของ M(parsed scope)** และสิทธิ์อ่านต้นทางเมนูเดียวกัน (§43.2a); Preview อ่านอย่างเดียวไม่แปลว่าใช้เพียง read permission

#### Retrieval hints

Hypothesis: design §35.1–§35.8 · precedent `UpsertTermSubLevel2Rows` (EVD-037), `SetTimetable` (EVD-036) · `Tbl_Timetable`/`Tbl_TimetableClass` snapshot jsonb (BR-20 — คัดลอก snapshot ตามเจตนา REQ-010) · backend ไม่มี transaction ที่ไหนวันนี้ (D29) — path ใหม่จึงเพิ่มได้โดยไม่กระทบเดิม
Query: ค้น `Tbl_LinkSubjectSetting`, `Tbl_TeacherGroup`, `Tbl_ClassPeriod`, `nClassPeriodID`, `nSettingID`, `sTeacherIDs` ใน `AITimeTableBackend`

#### Do not modify

endpoint เดิมทุกตัว (additive-external — ไม่มี caller เปลี่ยน) · DES-009 (BE-010) · สัญญา `timetables/*` ของ Service Academic · ถ้า implement พบว่าต้องเพิ่มคอลัมน์ batch id เพื่อ rollback → **ห้ามเพิ่มเอง** กลับมา amend สัญญา DES-010 ก่อน (§35.3) · DES-018 auth ของ endpoint เดิม/claims/tenant/predicate; อนุญาตเพิ่ม mapping ของ endpoint ใหม่ใน task นี้ตาม §43.2(a) โดยคง semantics เดิม

#### Acceptance criteria

AC-029: เลือกเทอม-ปีต้นทาง/ปลายทางอิสระรวมข้ามปี ที่ทุกจุดเข้า
AC-030: scope = enum ค่าเดียวตามจุดเข้า; `lstTimetableIDs` เฉพาะ `all` (0..ทุกชุด ไม่จำกัด `isActive` — 0 ชุด = คัดลอก 4 เมนูโดยตารางปลายทางยังถูกแทน คำเตือนต้องบอกชัด)
AC-031: ปลายทางมี artifact ของ scope อยู่แล้วแม้ชิ้นเดียว → Preview คืน "ต้องยืนยัน"; Apply ไม่มี `isConfirmOverwrite` → `ConfirmationRequired` ไม่เขียนอะไร; token ไม่ตรง → `DestinationChanged`
AC-032: ของที่คัดลอกเป็นอิสระจากต้นทาง — ไม่แชร์แถว/id ข้ามปลายทาง-ต้นทาง
AC-050: template ที่อ้างหาย/ชนกัน → Preview แจ้ง `lstMissingTemplates` และ Apply ปฏิเสธทั้งคำสั่ง `MissingTemplate`; dependents → `DependentsWouldBeOrphaned`
AC-051: จับคู่ไม่ได้บางส่วน → เตือน + `isConfirmPartial` แล้วคัดลอกส่วนที่จับคู่ได้ เข้า `lstSkipped`

#### Required validation and expected evidence

`dotnet build` + `dotnet test` · test ลำดับ error ครบ 7 กรณี + `NothingToCopy` + `InvalidCopyScope` · test transaction — ล้มกลางทางแล้วปลายทางเหมือนก่อนเรียกทุกกรณี (ห้ามสถานะครึ่งก้อน) · test re-point (template/setting/link/timetable ใหม่ทั้งหมด) + natural-key map (ห้อง/หลักสูตร) · `[manual-API]` หลัง deploy · เข้ารอบ `security` (ผูก Waiting on Human #1 — write ที่แรงที่สุด)

Auth evidence ของ endpoint ใหม่: no token → 401; school/resource คนละโรงเรียน → 403/ไม่อ่านหรือเขียน; read/write menu permission ตาม mapping + missing mapping fail-closed; audit identity จาก claims; regression existing policy semantics คงเดิม (AC-060..AC-062)

Copy matrix ครบ 5 scopes รวม SubjectRoom/RoomSetting/ชั่วโมง/homeroom, ไม่ copy TeacherClassAssignment; parsed-scope permission ทั้ง Preview/Apply (read-only user ถูกปฏิเสธ), unknown scope → InvalidCopyScope ตามลำดับ validation ก่อน resolve M(scope); ไม่มี destination ครึ่งก้อน

#### Rollback/compatibility notes

endpoint ใหม่ล้วน — revert ได้เดี่ยว ไม่กระทบ caller เดิม · ไม่มี schema change (ใช้ตารางเดิม เพิ่มแถว) · ล้มเหลว = rollback transaction ปลายทางเหมือนก่อนเรียก

### Task FE-022 — Copy UI on 5 entry points + proxies, read real results (DES-010, REQ-013 AC-029..AC-032, AC-050, AC-051)
Owner: frontend-engineer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: BE-011, FE-021, UX-008
Traceability: REQ-013, AC-029, AC-030, AC-031, AC-032, AC-050, AC-051, DES-010, DEC-010
Produces: none
Consumes: Contract:TimetableCopyAcrossTermYear.v1
Risk: high
Human gate: none
Status: pending

#### Scope and constraints

ปุ่ม Copy บน 5 list-page ตาม UX-008 ที่มีคนเซ็น (Waiting on Human #16 — จุดเข้ากำหนด scope; `/timetable` เลือกตารางได้ BR-69) + proxy `/api/timetable/copy/preview|apply` · **ห้ามมี code path ใดเรียก Apply โดยไม่ผ่าน Preview** (§35.2) · อ่าน `status` จริงทุกจุด — แสดง `lstMissingTemplates`/`lstUnmatched`/`lstDependents`/`lstSkipped` และ error 7 กรณีตามข้อความที่ backend คืน (ห้าม success modal ลวง — D26/D10) · เกณฑ์ = AC-029..AC-032, AC-050, AC-051 ฝั่ง UI

ใช้ FE-021 บริบทโรงเรียน/ปี/เทอมที่สร้างแล้ว ไม่สร้าง term selector/state อีกชุด; ส่ง/รีเซ็ต context ตาม DES-009

#### Retrieval hints

Hypothesis: `timetable-copy-modal.tsx` (mock เดิม — EVD-071), 5 list-page ของ 7 routes, รูปแบบ proxy `src/app/api/**`
Query: ค้น `timetable-copy-modal`, `Copy`, `preview` ใน `src/app`

#### Do not modify

modal ของ `/academic` (`schedule-copy-modal.tsx` — คนละระบบ) · endpoint เดิม · งาน DES-009 (FE-021)

#### Acceptance criteria

AC-029..AC-032, AC-050, AC-051 ฝั่ง UI: flow Preview→ยืนยัน→Apply ครบทุกคำเตือน/ผลลัพธ์; ไม่มีทางลัดข้าม Preview

#### Required validation and expected evidence

vitest: Preview→confirm→Apply, ทุก error/คำเตือน (mock backend), ผลจริงแสดงครบ · typecheck/lint/build · `[manual-E2E]` กับ BE-011 · worktree ยังไม่ commit — ยืนยันบรรทัดก่อนแก้

#### Rollback/compatibility notes

additive — revert ได้เดี่ยว; กลับ mock เดิม

## Phase 10: REQ-015 — Class Continuity + Subject Groups as hard constraints (DES-012, DES-017)

> solver + validateDrop บังคับจริง — frontend ล้วน ไม่มี endpoint/DDL (backend เก็บ blob verbatim อยู่แล้ว — §37.2) · ค่า continuity/กลุ่มที่ผู้ใช้เคยตั้ง "เก็บเฉย ๆ" (D12/D41) เริ่มมีผลทันทีหลัง deploy — ตารางที่บันทึกแล้วไม่ถูก re-validate (snapshot §15)

### Task UX-009 — UX artifact: continuity block UX + config warnings (DES-012 BR-31/BR-53, DES-017 BR-65)
Owner: uxui-designer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: UX-007
Traceability: REQ-015, AC-036, AC-037, AC-037a, AC-037b, AC-037c, DES-012, DEC-012, DES-017, DEC-017
Produces: uxui/UX-009-continuity-subject-groups.md
Consumes: Contract:ClassContinuityConstraint.v1, Contract:SubjectGroupSeparation.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

ร่าง UX artifact ของผลข้าง UI จาก DES-012/DES-017: การลาก/ลบ/ล็อกบล็อก continuity เป็น**หน่วยเดียว** (BR-31 — "การลากทั้งบล็อกเป็นหน่วยเดียวหรือไม่ เป็นงาน UX" แต่ทุกทางต้องผ่าน BR-31) · ข้อความปฏิเสธ `continuityBroken`/`subjectGroupOverlap` · คำเตือน config 4 ตัวของ BR-53 บน subject-settings (ตอนบันทึก) และใน `lstGenerateWarnings` — ไม่บล็อก Generate · editor continuity/subjectGroups เดิมคงรูป object ใหม่ (ห้ามทำ `subjectGroups` หาย — §37.2)

รวม VR-17 error ของ subjectGroups (ชื่อว่าง/ซ้ำ/courseCodes ไม่เป็น array ของ string) ใน artifact ที่เซ็น; ไม่สร้าง server validator ใหม่

#### Retrieval hints

Hypothesis: design §37.1 (BR-29..BR-32, BR-52, BR-53), §42.2 (BR-62..BR-65) · `parseSubjectSettingsExtra` ของหน้า subject-settings (EVD-046)
Query: ค้น `continuity`, `subjectGroups`, `BR-53` ใน `design.md` §37, §42

#### Do not modify

ไม่แตะโค้ด · สัญญา DES-012/DES-017 · editor เดิมของ subject-settings (ตรรกะ serialize คงเดิม)

#### Acceptance criteria

AC-036..AC-037c แสดงเป็น UX ที่ผู้ใช้อ่านออก (บล็อกติดกันจริง, โควตาไม่ลงตัว = เตือนแก้ค่า, เพดานครูชนะ, ลบทั้งบล็อก)

#### Required validation and expected evidence

artifact + ตาราง Sign-off + ทะเบียน `../../modules/timetableai/build/uxui/README.md` · หลังคนเซ็น → PM ตรวจ → `qa-engineer` ตั้ง Status ของ FE-023

#### Rollback/compatibility notes

ร่างเอกสาร — ไม่กระทบโค้ด/สัญญา

### Task FE-023 — Solver/validateDrop enforce continuity + subjectGroups, single parser, BR-53 warnings (DES-012, DES-017)
Owner: frontend-engineer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: UX-009
Traceability: REQ-015, AC-036, AC-037, AC-037a, AC-037b, AC-037c, DES-012, DEC-012, DES-017, DEC-017
Produces: none
Consumes: Contract:ClassContinuityConstraint.v1, Contract:SubjectGroupSeparation.v1
Risk: high
Human gate: none
Status: pending

#### Scope and constraints

hard constraint ใน solver และ validateDrop ด้วยฟังก์ชันร่วมตัวเดียว (R5) — DES-012: BR-29 ("ติดกัน" = ช่องเรียนถัดกันในวันเดียวกัน คั่นด้วยคอลัมน์พัก/lunch เท่านั้น — เวลาเปลี่ยนคาบที่ template ไม่ประกาศพักไม่ทำขาด), BR-30 (วางเป็นบล็อกเต็ม ⌊โควตา/N⌋ — ห้าม partial/ห้าม auto-split, เหลือเป็น shortfall), BR-31 (วางมือ/สลับ/ลบที่ทำลายบล็อก = ปฏิเสธ `continuityBroken`; ลบได้ทั้งบล็อก; ล็อก/Regenerate ทั้งบล็อก), BR-32 (key `sCourseCode`), BR-52 (เพดานคาบต่อเนื่องไม่พักของครู BR-9 ชนะ N เสมอ — วางไม่ได้ = shortfall + `ContinuityExceedsTeacherCap` ห้ามหดบล็อก) · DES-017: BR-63 (ขอบเขต G2 = กริดปัจจุบัน + snapshot ของตารางอื่นใน conflict data เดิม — เมื่อมี DES-009 = เทอมเดียวกันตาม BR-17a; ไม่รวม `/academic`), BR-64 (รหัสเดียวกันคนละห้อง = ชนเมื่อครูเดียวกัน; เซลล์ไม่มี `nTeacherID` → ถือว่าชน), BR-65 (Link Subject ตรึงชนะ + `SubjectGroupPinnedConflict` ไม่บล็อก; กลุ่ม link เดียวกันครูเดียวนับเป็นการวางเดียว) · reader ใช้ `parseSubjectSettingsExtra` **ตัวเดียว** รับทั้ง legacy array + object ใหม่ (§37.2 — ห้ามเขียน parser ซ้ำ) · writer เขียนรูปแบบ object เสมอ · คำเตือน BR-53 ครบ 4 (`ContinuityQuotaNotDivisible`, `ContinuityExceedsDay`, `ContinuityExceedsTeacherCap`, `LinkedSubjectContinuityConflict`) — ไม่บล็อก Generate (เหตุบล็อกมีแค่ 2 ของ DES-011) · blob parse ไม่ได้ = ถือว่าไม่มีกติกา + คำเตือน ห้าม Generate ด้วยกติกาที่อ่านผิดโดยไม่แจ้ง

DES-017 BR-62: กลุ่ม <2 รหัสไม่มีผล, รหัสอยู่หลายกลุ่มใช้ union, รหัสนอกแผนไม่มีผล · VR-17: frontend ปฏิเสธ Save ก่อน request เมื่อชื่อกลุ่มว่าง/ซ้ำ หรือ courseCodes ไม่ใช่ array ของ string; backend คง blob verbatim

#### Retrieval hints

Hypothesis: `manage-teaching-schedule/page.tsx` (solver/validateDrop — EVD-043), `_lib/timetable-helpers.ts`, `subject-settings/[year]/page.tsx` (`parseSubjectSettingsExtra` :90 — EVD-046), `SubjectGroupModal.tsx` (EVD-082) · design §37, §42
Query: ค้น `nContinuousPeriod`, `subjectGroups`, `jSetSubjectsClassContinuity`, `parseSubjectSettingsExtra`, `validateDrop`, `ConsecutiveHeavy` ใน `src/app`

#### Do not modify

backend (ไม่มี endpoint ใหม่ — §37.2/§42.3) · DES-013/014/015 (Phase 11–12) · ลำดับ Link Subject pre-placement เดิม (BR-11) · งาน FE-003/FE-008 (intensity/shortfall) นอกจุดที่บังคับ constraint

#### Acceptance criteria

AC-036: วิชา N คาบถูกวางติดกันจริง N ช่องทั้ง Generate และวางมือ (ห้ามข้ามพัก)
AC-037: การวาง/สลับมือที่ทำให้ไม่ครบ N หรือแยกวัน → ปฏิเสธพร้อมเหตุผล
AC-037a: โควตาไม่ลงตัวกับ N → คำเตือนให้แก้ค่า — ไม่ auto-split
AC-037b: เพดานครู BR-9 ชนะ N — ห้ามวางเกินเพดานแม้วิชาวางไม่ครบ (shortfall)
AC-037c: ลบได้เฉพาะทั้งบล็อกพร้อมกัน

DES-017 BR-62/VR-17 (done-check ส่วน subjectGroups ของ REQ-015): union ถูกบังคับ, กลุ่ม <2 รหัส/รหัสนอกแผนไม่มีผล; รูปผิดตาม VR-17 → Save request = 0 โดยไม่สร้าง AC ใหม่

#### Required validation and expected evidence

vitest oracle ตาม design (กริดตัวอย่าง: ติดกันจริง/ข้ามพัก/แยกวัน, โควตาไม่ลงตัว, เพดานครูต่ำกว่า N, กลุ่มชนข้ามห้องตารางอื่น, รหัสเดียวกันครูต่างกัน = วางได้, ครูไม่ทราบ = ชน, link ชนะ) · grep ยืนยัน parser เดียว + ฟังก์ชันร่วมต่อชั้นเดียว · typecheck/lint/build · `[manual-E2E]` · worktree ยังไม่ commit — ยืนยันบรรทัดก่อนแก้

vitest oracle เพิ่ม union/<2 รหัส/รหัสนอกแผน และ VR-17 ชื่อว่าง/ซ้ำ/courseCodes ไม่เป็น array/สมาชิกไม่ใช่ string → Save request = 0; รูปถูกต้อง Save ได้; legacy array/object round-trip คง subjectGroups/shared parser เดียว

#### Rollback/compatibility notes

revert ได้เดี่ยว — กลับ as-built "เก็บเฉย ๆ" (ค่ายังถูกเก็บ) · behavior-change ที่ผู้ใช้มองไม่เห็นล่วงหน้า — ต้องสื่อสารก่อน deploy

## Phase 11: REQ-016 — Subject Rooms, Capacity, Cross-/academic Usage (DES-013) 🔒 Security gate

> กติกาใหม่ทั้งหมด (ความจุ + ผู้ดูแลห้อง + นับข้ามระบบ) — ขวางอยู่ที่ schema confirmation §27.6 (ก)(ก2) + SA-Q5/SA-Q9 (Waiting on Human #12) และ SA-Q10 (read path ข้าม `/academic` — #13) · ก่อนปิด #13 = ฟีเจอร์ห้องทั้งฟีเจอร์ไม่เปิดใช้ (Fallback ของ design — ห้ามกันห้องโดยไม่นับ `/academic`)

### Task UX-010 — UX artifact: room mapping + per-unit room settings on subject-settings (DES-013, REQ-016 AC-038..AC-040)
Owner: uxui-designer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: UX-007
Traceability: REQ-016, AC-038, AC-038a, AC-039, AC-040, DES-013, DEC-013
Produces: uxui/UX-010-room-settings.md
Consumes: Contract:SubjectRoomConstraint.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

ร่าง UX artifact ของส่วนห้องบน `/timetable/subject-settings` (ตำแหน่งตาม OQ-15 (จ)/OQ-31 (ค) — design §38.3): mapping **1 วิชา : 1 ห้อง** เลือกจากทะเบียน `TRoom` ของ school DB (BR-33/34 — ไม่มี pool, ห้ามแก้รายเซลล์ — BR-35) · หน้าตั้งความจุ (K ≥ 1) และครูผู้ดูแล**ต่อหน่วย (ปี, เทอม)** (BR-54/BR-71 — ยังไม่มี UI ใน worktree, EVD-084) · คำเตือน `RoomSettingMissing` (K=1/ไม่มีผู้ดูแล), `CaretakerNotTeachingMappedSubject` (ตอนบันทึก), ข้อความปฏิเสธ `roomCapacityExceeded` (ระบุผู้ใช้ห้องในช่วงนั้น — ต้นเหตุอาจอยู่นอกโมดูล), `roomCaretakerMismatch`, `academicRoomUsageUnavailable` · ค่าเป็นรายเทอม — ตั้งเทอมหนึ่งไม่มีผลเทอมอื่น

ร่าง/เซ็น editor หลัง #12 ยืนยัน C2/C1′: C2 ใช้ RoomSetting/Set; C1′ รอ SA amend read/edit/copy กับเจ้าของ school DB; ห้ามร่าง write path ที่ไม่มี contract

#### Retrieval hints

Hypothesis: design §38.0–§38.3, §27.6 (ก)(ก2) · `TRoom` (dump — SA-Q5), `subject-settings/[year]/page.tsx`
Query: ค้น `TRoom`, `nCapacity`, `nCaretakerTeacherID`, `Tbl_RoomSetting` ใน `design.md` §38

#### Do not modify

ไม่แตะโค้ด · สัญญา DES-013 · `classroom-list` proxy เดิม (ชี้ endpoint ไม่มีจริง — D42, ห้ามต่อยอด)

#### Acceptance criteria

AC-038/AC-038a/AC-039/AC-040 แสดงเป็น UX ครบ (mapping 1:1, ความจุต่อหน่วย, ผู้ดูแล, วิชาไม่มี mapping ไม่ถูกบังคับ)

#### Required validation and expected evidence

artifact + ตาราง Sign-off + ทะเบียน `../../modules/timetableai/build/uxui/README.md` · หลังคนเซ็น → PM ตรวจ → `qa-engineer` ตั้ง Status ของ FE-024

#### Rollback/compatibility notes

ร่างเอกสาร — ไม่กระทบโค้ด/สัญญา

### Task BE-012 — Rooms backend: `Tbl_SubjectRoom` + `Tbl_RoomSetting` + Rooms/RoomSetting/SubjectRoom endpoints (DES-013 §38.3)
Owner: backend-engineer
Tier: T2
Targets: sb-api-academic-timetable-ai
Depends on: BE-010
Traceability: REQ-016, AC-038, AC-038a, AC-039, AC-040, DES-013, DEC-013, REQ-021, AC-060, AC-061, AC-062, DES-018, DEC-018
Produces: none
Consumes: Contract:SubjectRoomConstraint.v1
Risk: critical, security
Human gate: schema, security
Status: pending

#### Scope and constraints

ตาม design §38.3 ฝั่ง backend: model `Tbl_SubjectRoom` (§27.6 ก — ตารางราก ถือขอบเขตเอง) + ความจุ/ครูผู้ดูแลต่อ (ปี, เทอม) (§27.6 ก2 — **C2** `Tbl_RoomSetting` ฝั่งโมดูล ข้อเสนอ SA; **C1′** = ตารางใน school DB ที่เจ้าของต้องสร้าง — ผล SA-Q9 ตัดสิน) — **ไม่มี DDL ใน task นี้** (#11) · endpoints: `GET School/{schoolid}/Rooms?nYear&sTermID?` (map `TRoom` อ่านอย่างเดียวใน `StudentDataContext` + left-join ค่าของหน่วย; ไม่มีแถว = `nCapacity: null`/`nCaretakerTeacherID: null` → K = 1 + ไม่มีข้อบังคับผู้ดูแล — BR-54/BR-71; `sTermID` ผ่าน VR-8), `RoomSetting/Set` (upsert รายห้องภายในหน่วยใน **DB transaction เดียว**; คืน `lstWarnings:[CaretakerNotTeachingMappedSubject]` — เตือน ไม่ปฏิเสธ; VR-15 `InvalidRoomSetting` — capacity จำนวนเต็ม ≥ 1/ห้องใน `TRoom`/ผู้ดูแลใน `TEmployees`/ซ้ำใน lstItems), `SubjectRoom/Get|Set` (full replace ต่อหน่วยใน transaction เดียว; VR-10 `RoomNotFound`, VR-11 `DuplicateSubjectRoom` — 1 วิชา : 1 ห้อง) · ถ้า SA-Q10 = **X1** เท่านั้น: `GET School/{id}/Terms/{nTerm}/AcademicRoomUsage` (อ่านอย่างเดียว) — X2 = endpoint ของ Service Academic (Target ใหม่ — ต้อง amend design ด้วยสัญญาที่ยืนยันก่อน) · แถวใหม่มี `sTermID` ตาม DES-009 (ถ้าออกหลัง Phase 8) · เกณฑ์ = AC-038 (BR-33/34), AC-038a (BR-36/54), AC-039 (BR-55..57 ฝั่ง backend), AC-040 (BR-34)

ลงทะเบียน endpoint ใหม่ใน authorization policy/filter ตาม DES-018 §43.2(a) ใน task เดียวกัน; คง fail-closed/claims/school-resource ownership และ audit identity จาก claims (BR-73); ไม่เชื่อ audit identity จาก client

RoomSetting/Set/VR-15 transaction ของโมดูล **เฉพาะ C2**; C1′ ไม่มี endpoint นี้และห้ามโมดูลเขียน school DB — รอ SA amend read/edit/copy ก่อนส่วนที่พึ่งตัวเลือก (#12); #13 ต้องปิดก่อน dependent read-path implementation ตาม §38.7

#### Retrieval hints

Hypothesis: design §38.3, §27.6 (ก)(ก2), §38.5 (VR-10/11/15) · `StudentDataContext` (map `TRoom` — ข้อเสนอ §38.5) · `school_db.sql` `TRoom` (dump ล้าสมัย — SA-Q5)
Query: ค้น `TRoom`, `StudentDataContext`, `SubjectRoom`, `RoomSetting`, `TEmployees` ใน `AITimeTableBackend`

#### Do not modify

`TRoom`/`TSchedule` (อ่านอย่างเดียว — BR-33/BR-45 ห้ามเขียน school DB) · DES-018 auth ของ endpoint เดิม/claims/tenant/predicate; อนุญาตเพิ่ม mapping ของ endpoint ใหม่ใน task นี้ตาม §43.2(a) โดยคง semantics เดิม · proxy `classroom-list` เดิม · คอลัมน์เดิมของ `TRoom` (SA-Q5 ตัดสิน)

#### Acceptance criteria

AC-038: ห้องจาก `TRoom` เท่านั้น; mapping 1 วิชา : 1 ห้อง ต่อหน่วย; VR-10/VR-11 ครบ
AC-038a/AC-039 (backend): ความจุ/ผู้ดูแลเป็นค่าต่อ (ปี, เทอม) ของหน่วยตาราง; ไม่ตั้ง = K 1/ไม่บังคับ
AC-040: วิชาไม่มี mapping ไม่ถูกบังคับห้อง

#### Required validation and expected evidence

`dotnet build` + `dotnet test` · test VR-10/VR-11/VR-15 + transaction rollback ของ `SubjectRoom/Set`/`RoomSetting/Set` · test หน่วย (ค่าต่างเทอมเป็นอิสระ, ไม่มีแถว = null) · `[manual-API]` หลัง deploy · ห้าม dispatch ก่อน #12 เซ็น (รูป C2/C1′ และ schema `TRoom`)

Auth evidence ของ endpoint ใหม่: no token → 401; school/resource คนละโรงเรียน → 403/ไม่อ่านหรือเขียน; read/write menu permission ตาม mapping + missing mapping fail-closed; audit identity จาก claims; regression existing policy semantics คงเดิม (AC-060..AC-062)

C2: RoomSetting/Set write 422; Rooms read OR(401/402/403/404/422); SubjectRoom Get read(422 OR 401)/Set write422; AcademicRoomUsage เฉพาะ X1 read401 · C1′ ไม่เปิด write endpoint และรอ SA amendment ที่ยืนยัน; #12/#13 คงเป็น gates

#### Rollback/compatibility notes

endpoint/ตารางใหม่ — revert ได้เดี่ยว; ก่อนเปิดใช้ทุกห้อง K = 1 ไม่มีผู้ดูแล (Fallback) · ถ้า (ก)(ก2) ออกก่อน DES-009 → แถว `sTermID` NULL ถูก backfill เป็นเทอมแรกและเทอมอื่นเริ่มว่าง — รายงานให้คนอ่าน (§27.6)

### Task FE-024 — Rooms frontend: mapping/setting UI + `canUseRoom` + /academic usage (fail-closed) + caretaker filter (DES-013 §38.3, BR-36..BR-57, BR-71)
Owner: frontend-engineer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: BE-012, BE-014, FE-021, FE-025, UX-010
Traceability: REQ-016, AC-038, AC-038a, AC-039, AC-040, DES-013, DEC-013
Produces: none
Consumes: Contract:SubjectRoomConstraint.v1
Risk: high, security
Human gate: security
Status: pending

#### Scope and constraints

ตาม design §38.3 ฝั่ง frontend: proxy `/api/school/[schoolId]/rooms`, `/api/subject-room/get|set`, `/api/room-setting/set` (**ห้ามต่อยอด** `/api/classroom-list/get|set` — EVD-050, D42) · หน้า subject-settings ตั้ง mapping + ความจุ/ผู้ดูแลต่อหน่วยตาม UX-010 · solver/validateDrop: `roomOccupancy` = (ก) กริดปัจจุบัน + (ข) ตารางอื่นบันทึกแล้วใน conflict scope เดียวกับ BR-17 + ((ค) การใช้ห้อง `/academic` − BR-56) ต่อ `sRoomID` ต่อวัน → ฟังก์ชันเดียว `canUseRoom(sRoomID, day, start, end, nClassID)` (BR-36 — sweep เวลาจริง, ห้องเรียนเดียวกันหลายรายการทับ = นับ 1, link หลายห้องเรียนนับต่อห้องเรียน) — K ใช้ค่า**ของหน่วยตารางที่กำลังแก้** (BR-54) · โหลดการใช้ห้อง `/academic` **สดตอนเปิดหน้า generate** รวม conflict data (X2 ผ่าน gateway ด้วย JWT / X1 ผ่าน backend — ตาม SA-Q10) + `Timetable/GetAcademicSyncResults` (BR-56 ตัดแถวที่โมดูลส่งเอง — ตาราง sync มากับ BE-014; ต้องมี BE-014 sync-read พร้อมก่อน task นี้ ห้ามสมมติว่าผล sync ว่างเพราะยังไม่ implement) · BR-57 fail-closed: `isAcademicRoomUsageReady` — โหลดไม่สำเร็จ → Generate ถูกระงับ + การวางมือวิชาที่มี mapping ห้องถูกปฏิเสธด้วย `academicRoomUsageUnavailable`; วิชาไม่มี mapping ยังวางได้ (AC-040); **ห้ามถือว่า "ไม่มีการใช้ห้อง" เมื่ออ่านไม่ได้** · เซลล์ฝัง snapshot `{sRoomID, sRoomName}` (BR-20 — ห้ามใช้ `nClassroomID`) · ห้องของเซลล์**มาจาก mapping เสมอ** — เปิดตารางเดิม (Flow D) คำนวณใหม่จาก mapping ปัจจุบัน + แจ้งรายการเซลล์ที่ห้องเปลี่ยนจาก snapshot; ตารางที่ไม่ถูกเปิดแก้ นับตามห้องใน snapshot · ตัวกรองผู้ดูแล **BR-71** — `roomCaretakerBySubject` (map วิชา → T_R ของหน่วย) ต่อท้ายจุด eligibility เดียวกับ DES-015 (ลำดับ: `TPlanCourseTeacher` → จำกัดห้องประจำชั้น → ผู้ดูแลห้อง); ผู้ดูแลไม่ได้สิทธิ์เพิ่ม; วางขัด → `roomCaretakerMismatch` (ระบุห้อง/ผู้ดูแล/ครูที่พยายามวาง); ผู้ดูแลไม่มีสิทธิ์สอนวิชา → `NoEligibleTeacher (RoomCaretaker)` บล็อก Generate (DES-011) · AddCourseModal **ไม่มีตัวเลือกห้อง** (BR-35) · ฟีเจอร์ห้อง**ไม่เปิดใช้**ก่อน #13 เซ็น (Fallback)

ใช้ FE-021 term context และ FE-025 shared eligibility; BE-014 sync-read ก่อน FE-024 ไม่รอ FE-027 push UI (§38.7) · RoomSetting proxy/editor เฉพาะ C2; C1′ รอ contract/UX ที่ยืนยัน ห้ามสร้าง write path school DB · คง #12/#13/#14/#15/#16 ตาม design

ใช้ FE-021 บริบทโรงเรียน/ปี/เทอมที่สร้างแล้ว ไม่สร้าง term selector/state อีกชุด; ส่ง/รีเซ็ต context ตาม DES-009

#### Retrieval hints

Hypothesis: design §38.2–§38.3 · `getEligibleClasses` (`timetable-helpers.ts:113` — EVD-060 จุด eligibility เดียว), `AddCourseModal`, `isConflictDataReady` · `/api/gateway/service-academic/*` proxy (EVD-066)
Query: ค้น `getEligibleClasses`, `isConflictDataReady`, `classroom-list`, `nClassroomID`, `AddCourseModal` ใน `src/app`, `src/components`

#### Do not modify

`parseSubjectSettingsExtra` (ใช้ตัวเดิม) · ตัวกรองของ DES-015 นอกจุดต่อ BR-71 ท้าย chain (ห้ามเขียนตัวกรองซ้ำต่อชั้น) · DES-012/017 (FE-023) · endpoint ของ Service Academic (สัญญาของเขา)

#### Acceptance criteria

AC-038/AC-038a ฝั่ง UI: mapping 1:1 จาก `TRoom`; ความจุ/ผู้ดูแลต่อหน่วย
AC-039: ห้องเดียวกันไม่เกิน K ในเวลาเดียวกัน — นับรวมตารางทุกชุดของขอบเขต conflict และ `/academic` (BR-36/55/56)
AC-040: วิชาไม่มี mapping ไม่ถูกบังคับ (วางมือได้แม้ `/academic` อ่านไม่ได้)
BR-71: วิชาที่ใช้ห้องที่มีผู้ดูแล มีผู้สอนได้ = ผู้ดูแลคนเดียว — ผ่านจุด eligibility เดียว

#### Required validation and expected evidence

vitest: sweep ความจุ (K, ห้องเรียนเดียวกันนับ 1, link หลายห้องเรียน), K ของหน่วยตาราง, K=1 เมื่อไม่ตั้ง, BR-56 ตัดแถวโมดูล/นับทุกแถวเมื่อบันทึกผลอ่านไม่ได้, BR-57 fail-closed (ระงับ Generate/ปฏิเสธวางมือเฉพาะวิชามี mapping), BR-71 ผ่านจุดเดียว (grep) · typecheck/lint/build · `[manual-E2E]` กับ read path ที่ #13 เลือก (X2/X1) · worktree ยังไม่ commit — ยืนยันบรรทัดก่อนแก้

DES-013 Fallback: room/mapping load ล้ม → fail-closed ตาม contract, ลงทะเบียนล้ม → ไม่บันทึก, ห้องถูกลบ → แจ้งและถือวิชาไม่มี mapping, ผู้ดูแลถูกลบ → คงข้อจำกัดจนคนแก้, sync-read ล้ม → นับ academic ทุกแถว · BR-71 snapshot ครูเดิมขัดผู้ดูแล → แจ้ง/ไม่เปลี่ยนครูอัตโนมัติ; shared eligibility ใช้ solver/validateDrop/AddCourseModal/precheck

#### Rollback/compatibility notes

additive — revert ได้เดี่ยว; กลับ as-built ไม่กันห้อง · behavior-change รวมการถูกปฏิเสธเพราะระบบอื่น — ต้องแสดงผู้ใช้ห้องที่ขัด (BR-36 ข้อความ)

## Phase 12: REQ-017 + REQ-018 + REQ-014 — Teaching Caps (Hours), Homeroom Restriction, Generate Precheck (DES-014, DES-015, DES-011) 🔒 Security gate

> กลุ่ม cutover ของ SA-Q8 (Waiting on Human #15): DES-014 ออก**รุ่นเดียว**ห้ามผสมหน่วย (BE-013 + FE-025) · DES-015 ก่อน/พร้อม DES-011 (FE-025 → FE-026 ออกด้วยกัน — ห้ามตัดแหล่งสิทธิ์เดิมก่อน BR-41 ทำงาน) · M1 = ไม่ migrate ค่าเพดานเดิม (AC-043b — ค่าเดิม "หมดผล" ทันทีที่ cutover ตามที่ธุรกิจยืนยันแล้ว — ต้องสื่อสาร) · ขวางอยู่ที่ schema confirmation §27.6 (ข)(ค) (#12)

### Task UX-011 — UX artifact: hour-based caps + homeroom-restricted card on settings (DES-014, DES-015, REQ-017/REQ-018)
Owner: uxui-designer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: UX-007
Traceability: REQ-017, AC-041, AC-042, AC-043, AC-043a, AC-043b, REQ-018, AC-044, AC-045, AC-046, AC-046a, DES-014, DEC-014, DES-015, DEC-015
Produces: uxui/UX-011-caps-homeroom.md
Consumes: Contract:TeacherTeachingLoadCap.v1, Contract:HomeroomRestrictedTeaching.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

ร่าง UX artifact หน้า `/timetable/settings`: ช่องเพดาน/วัน-สัปดาห์เป็น**จำนวนเต็มชั่วโมง** ป้ายหน่วย "ชั่วโมง" ตรงการบังคับ (แก้ D40) — เอา checkbox "ใช้กับครูทุกคน/ยกเว้น" ออก (ลำดับใหม่ 2 ระดับ: รายคน > รวม — AC-043) · การ์ด "3. ครูประจำชั้นสอนเฉพาะห้องที่รับผิดชอบ" (วันนี้ mock — EVD-061) แสดงห้องที่รับผิดชอบจาก `TClassMember` **อ่านอย่างเดียว** + **แก้ tooltip D43** (`homeroomTeacherSettings.onlyAssignedClassroom` — ข้อความเดิมบอกว่ายกเว้นเพดาน/คาบต่อเนื่อง **ผิด** — BR-44: ครูกลุ่มนี้ถูกบังคับเหมือนครูอื่นทุกประการ) · ข้อความปฏิเสธ `teacherMaxHoursPerDay`/`teacherMaxHoursPerWeek` แทน `teacherMaxPeriodPerDay` เดิม

#### Retrieval hints

Hypothesis: design §39.2 (UI), §40.3 (การ์ด/tooltip — EVD-061/062) · `settings/[year]/page.tsx` (MOCK_HOMEROOM_CLASSROOMS :34, tooltip :568), `messages/th.json:617` (tooltip จริง — §32.5)
Query: ค้น `nMaxTeachingPeriodPerDay`, `homeroomTeacherSettings`, `MOCK_HOMEROOM_CLASSROOMS` ใน `src/app`, `messages`

#### Do not modify

ไม่แตะโค้ด · สัญญา DES-014/DES-015

#### Acceptance criteria

AC-041/AC-042/AC-043 (UI: ชั่วโมงเต็ม, /สัปดาห์, 2 ระดับ) · AC-046 (ตั้งรายครู แก้ได้อิสระ) · tooltip BR-44 ถูกต้อง

#### Required validation and expected evidence

artifact + ตาราง Sign-off + ทะเบียน `../../modules/timetableai/build/uxui/README.md` · หลังคนเซ็น → PM ตรวจ → `qa-engineer` ตั้ง Status ของ FE-025

#### Rollback/compatibility notes

ร่างเอกสาร — ไม่กระทบโค้ด/สัญญา

### Task BE-013 — Settings additive: `nMaxTeachingHoursPerDay/Week` + VR-12, `jHomeroomRestrictedTeachers` + VR-13, `lstRestrictedClasses` from `TClassMember` (DES-014 §39.2, DES-015 §40.3)
Owner: backend-engineer
Tier: T2
Targets: sb-api-academic-timetable-ai
Depends on: BE-010
Traceability: REQ-017, AC-041, AC-042, AC-043, AC-043a, AC-043b, REQ-018, AC-044, AC-045, AC-046, AC-046a, DES-014, DEC-014, DES-015, DEC-015
Produces: none
Consumes: Contract:TeacherTeachingLoadCap.v1, Contract:HomeroomRestrictedTeaching.v1
Risk: critical, security, breaking-contract
Human gate: schema, breaking-contract, security
Status: pending

#### Scope and constraints

`Setting/Get|Set` เพิ่มฟิลด์ additive `nMaxTeachingHoursPerDay`, `nMaxTeachingHoursPerWeek` (int ชั่วโมงเต็ม, 0 = ไม่กำหนด) + key เดียวกันใน `jSetMaxPeriodIndividually` (รายคน) · **VR-12** `InvalidTeachingCap` — ค่าไม่ใช่จำนวนเต็ม/ติดลบ หรือ /วัน > /สัปดาห์ เมื่อทั้งคู่ > 0 (ทั้งรวมและรายคน) — **ห้ามปัด/ตัดเศษเงียบ ๆ** (ระวัง model binding แปลงเป็น 0) · `jHomeroomRestrictedTeachers` = `[{nTeacherID}]` (H1) + **VR-13** `InvalidHomeroomRestriction` — `nTeacherID` ไม่อยู่ใน `TEmployees` ของโรงเรียน · `TeacherClassAssignment/GetTeachersByClass` (ตัวสร้าง maps ของหน้า generate) คืน `lstRestrictedClasses` ต่อครูจาก `TClassMember` (บทบาทชุดเดียวกับ `lstHomeroomClasses` — หัวหน้า + ผู้ช่วย 1 + ผู้ช่วย 2 — ต่อ (ห้อง, เทอม) ตาม BR-42) และ**เลิกคืน `lstClassTaught` จาก `Tbl_TeacherClassAssignment` หลัง cutover** — cutover รุ่นเดียวกับ FE-025 (SA-Q8) · เลิกอ่านธง homeroom 7 ตัวเดิม + `isApplyMaxPeriodToAllTeachers`/`isExceptMaxPeriodTeachers`/`sMaxPeriodExceptTeacherIDs` (คงคอลัมน์ ไม่ลบ) · **M1** — ไม่แปลงค่าเดิม `nMaxTeachingPeriodPerDay` (คอลัมน์ใหม่ default 0 = ไม่จำกัด จนผู้ใช้กรอกใหม่ — AC-043b; ค่า /สัปดาห์รวมไม่เคยถูกบันทึก — D38) · เพดาน "คาบต่อเนื่องไม่พัก" (BR-9) ไม่เปลี่ยนหน่วย (BR-40) · **ไม่มี DDL ใน task นี้** (#11) · flag เป็นตัวจำกัดอย่างเดียว (BR-44 — ตรรกะ eligibility อยู่ FE-025); ครูมี flag แต่ไม่มีแถว `TClassMember` ของเทอม → ไม่มีห้องที่สอนได้ (ไม่ใช่สอนได้ทุกห้อง) · `Tbl_TeacherClassAssignment` ไม่ลบ (dead data — AC-046a; การลบ = การตัดสินของคน)

#### Retrieval hints

Hypothesis: `Models/Tbl_Setting.cs` (`nMaxTeachingPeriodPerDay` :15 — EVD-053), `Models/Request.cs` `RequestSetting` :128 (ไม่มีฟิลด์ /สัปดาห์ — EVD-054), `WebAPIController.cs` `TClassMember` :2289 (EVD-059), `Tbl_TeacherClassAssignment` :2333 (EVD-058) · design §39.2, §40.3
Query: ค้น `RequestSetting`, `jSetMaxPeriodIndividually`, `TClassMember`, `GetTeachersByClass`, `lstClassTaught` ใน `AITimeTableBackend`

#### Do not modify

DES-018 auth · `Tbl_TeacherClassAssignment` (ไม่แก้ ไม่ลบ) · BR-9/ตรรกะคาบต่อเนื่องไม่พัก · DES-009 (BE-010)

#### Acceptance criteria

AC-041: เก็บ/รับเป็นจำนวนเต็มชั่วโมง; VR-12 ปฏิเสธค่าผิดรูปโดยไม่เขียน
AC-042: ฟิลด์ /สัปดาห์ รับ-คืนได้ (การบังคับจริงอยู่ FE-025)
AC-043/AC-043a: โครงค่ารายคน/รวมต่อฟิลด์พร้อม (จุดตัดสินอยู่ FE-025)
AC-043b: ไม่มีการแปลงค่าเดิม (M1)
AC-046: flag รายครู แก้ได้อิสระต่อหน่วย; VR-13 ครบ
AC-045 (เตรียมพร้อม): `lstRestrictedClasses` จาก `TClassMember` ต่อ (ห้อง, เทอม)

#### Required validation and expected evidence

`dotnet build` + `dotnet test` · test VR-12 (ทศนิยม/ติดลบ/วัน>สัปดาห์ — รวมกรณี model binding) + VR-13 + `lstRestrictedClasses` จาก `TClassMember` (ครบ 3 บทบาท, ต่อเทอม) · `[manual-API]` · ห้าม dispatch ก่อน #12 (ข)(ค) เซ็น

DES-018 regression ของ Setting/Get|Set/GetTeachersByClass: school binding/read-write menu permission/audit claims คงเดิม

#### Rollback/compatibility notes

additive ที่ระดับ API, **breaking** ที่พฤติกรรม — cutover รุ่นเดียวกับ FE-025 (SA-Q8); ก่อน cutover solver ใช้กติกาเดิม (BR-8 นับคาบ) คงอยู่ · revert คู่กับ FE-025

### Task FE-025 — Caps in real teaching minutes + homeroom-restricted eligibility, single shared function (DES-014 §39, DES-015 §40)
Owner: frontend-engineer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: BE-013, FE-021, UX-011
Traceability: REQ-017, AC-041, AC-042, AC-043, AC-043a, AC-043b, REQ-018, AC-044, AC-045, AC-046, AC-046a, DES-014, DEC-014, DES-015, DEC-015
Produces: none
Consumes: Contract:TeacherTeachingLoadCap.v1, Contract:HomeroomRestrictedTeaching.v1
Risk: high, breaking-contract
Human gate: breaking-contract
Status: pending

#### Scope and constraints

DES-014: ฟังก์ชันเดียวคืน `{maxMinutesPerDay, maxMinutesPerWeek}` (= ชั่วโมง × 60 หลัง BR-39 — 2 ระดับต่อฟิลด์: รายคน > 0 → รวม > 0 → ไม่จำกัด; ตั้งรายคนเฉพาะ /วัน → /สัปดาห์ใช้ค่ารวม — AC-043a) ใช้ร่วม solver + validateDrop (แทน `getEffectiveMaxPeriod` EVD-056 และ `ranges.length >= maxPeriod` EVD-057) · นับ **นาทีสอนจริง** (end − start ตาม columnMetas — ตัวเดียวกับ BR-17) ของช่องครูในกริด + ตารางอื่นบันทึกแล้วในขอบเขต conflict เดียวกับ BR-17 (BR-38; Link Subject หลายห้องนับครั้งเดียว) · เทียบ `Σนาที ≤ ชั่วโมง × 60` ทั้ง /วัน และ /สัปดาห์ · ข้อความปฏิเสธ `teacherMaxHoursPerDay`/`teacherMaxHoursPerWeek` · ช่องไม่มีเวลาจริง (columnMeta ขาด start/end) → วางไม่ได้สำหรับครูที่มีเพดาน — ห้ามนับ 0 นาที · UI ตาม UX-011 (จำนวนเต็มชั่วโมง, เลิก checkbox ยกเว้น, การ์ด `TClassMember` อ่านอย่างเดียว, tooltip D43 แก้ตาม BR-44) · DES-015: `getEligibleClasses` = BR-41 (ครูไม่มี flag → ทุกห้องเรียนของ**แผน**ที่มีชื่อใน `TPlanCourseTeacher` — สิทธิ์วิชา+ห้องในตัว) ∩ BR-42 (ครูมี flag → เฉพาะห้องจาก `lstRestrictedClasses` ของ BE-013) — **จุดเดียว**ที่ solver/validateDrop/AddCourseModal/DES-011 ใช้ (R5); flag จำกัดอย่างเดียว (BR-44); ครู flag ไม่พบห้องที่รับผิดชอบ → ไม่มีห้องที่สอนได้ (เข้า BR-27 ของ FE-026 — ไม่ใช่สอนได้ทุกห้อง); BR-17 กันครูซ้อนเวลาคงเดิม (นับข้ามทุกตารางของขอบเขต conflict) · **cutover รุ่นเดียวกับ BE-013** (SA-Q8 — ห้ามผสมหน่วย; ห้ามตัด `lstClassTaught` ก่อน BR-41 ทำงานในรุ่นเดียวกับ FE-026)

ใช้ FE-021 บริบทโรงเรียน/ปี/เทอมที่สร้างแล้ว ไม่สร้าง term selector/state อีกชุด; ส่ง/รีเซ็ต context ตาม DES-009

#### Retrieval hints

Hypothesis: `manage-teaching-schedule/page.tsx` (`getEffectiveMaxPeriod` :253, `maxPeriod` :409 — EVD-056/057), `_lib/timetable-helpers.ts` `getEligibleClasses` :113 (EVD-060), `settings/[year]/page.tsx` (EVD-055/061) · design §39, §40
Query: ค้น `getEffectiveMaxPeriod`, `getEligibleClasses`, `lstClassTaught`, `taught`, `nMaxTeachingPeriodPerWeek` ใน `src/app`

#### Do not modify

ตรรกะ DES-012/DES-017 (FE-023) นอกจุด eligibility ร่วม (แต่ BR-52 ของ FE-023 ต้องยังจริง — เพดานครูชนะ N) · DES-013 (FE-024) · DES-018/DES-022 · backend

#### Acceptance criteria

AC-041: เพดาน/วัน-สัปดาห์บังคับเป็นชั่วโมงสอนจริง (นาที) ทั้ง Generate และวางมือ
AC-042: เพดาน/สัปดาห์เป็น hard constraint เทียบเท่า /วัน
AC-043/AC-043a: รายคน > รวม 2 ระดับ; ตั้งเฉพาะ /วัน → /สัปดาห์ใช้ค่ารวม
AC-043b: ค่าเดิมหน่วยคาบไม่ถูกแปลง/ไม่ถูกอ่านหลัง cutover (หมดผล — ตามธุรกิจ)
AC-044: ครูที่มี flag วางสอนห้องอื่นไม่ได้ทั้ง Generate/วางมือ (แม้มีสิทธิ์วิชา)
AC-045: ครูไม่มี flag สอนได้ทุกห้องของแผนที่มีชื่อใน `TPlanCourseTeacher`
AC-046: ตั้ง/แก้รายครูได้อิสระ (จุดตั้ง = BE-013/UI)

#### Required validation and expected evidence

vitest: นาทีจริงข้าม template (ช่วงทับบางส่วน), 2 ระดับ + AC-043a, AC-043b (ค่าเดิมไม่ถูกอ่าน), BR-41/42 จาก `lstRestrictedClasses` (ครบ 3 บทบาท/ต่อเทอม), BR-44 (flag จำกัดอย่างเดียว — ไม่ให้สิทธิ์), ช่องไม่มีเวลา = วางไม่ได้ · regression ของ FE-023 (BR-52 ยังจริง) + ของ DES-011 เดิม · typecheck/lint/build · `[manual-E2E]` · worktree ยังไม่ commit — ยืนยันบรรทัดก่อนแก้

#### Rollback/compatibility notes

revert คู่กับ BE-013 — cutover รุ่นเดียว (SA-Q8); ห้าม revert บางส่วน (ห้ามสภาพหน่วยผสม) · หลัง cutover โรงเรียนที่เคยพึ่ง wizard ได้สิทธิ์ตาม BR-41 ทันที (อาจกว้างขึ้น) จนกว่าตั้ง flag ใหม่ — ต้องแจ้ง

### Task UX-012 — UX artifact: generate precheck blocker panel + warnings (DES-011, REQ-014 AC-033..AC-035)
Owner: uxui-designer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: UX-007
Traceability: REQ-014, AC-033, AC-034, AC-035, DES-011, DEC-011
Produces: uxui/UX-012-generate-precheck.md
Consumes: Contract:TimetableGeneratePrecheck.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

ร่าง UX artifact หน้า generate: แผง `lstGenerateBlockers` — แสดง**รายการปัญหาทั้งหมด** (ไม่ใช่รายการแรก — AC-034) พร้อมทางลัดแท็บใหม่ไปหน้า "จัดการหลักสูตร/แผน" (นอกโมดูล — resolve จากเมนู; ผู้ใช้ไม่มีสิทธิ์เมนู = ข้อความแนะนำไม่มีลิงก์) · ปุ่ม "ตรวจใหม่" (AC-035 — BR-28) · เหตุบล็อก 2 ตัว (`NoEligibleTeacher` รวม `sDetail: RoomCaretaker` — แสดงห้อง/ผู้ดูแล, `ZeroPeriodsPerWeek`) · การแสดง `lstGenerateWarnings` (BR-53 ของ FE-023, `RoomSettingMissing` ของ FE-024, `SubjectGroupPinnedConflict`) — ไม่บล็อก

#### Retrieval hints

Hypothesis: design §36.1 (BR-27/28/50/51), §36.2 (outputs) · Figma board Phase 2 (อ้างใน §34.6)
Query: ค้น `lstGenerateBlockers`, `NoEligibleTeacher`, `ZeroPeriodsPerWeek` ใน `design.md` §36

#### Do not modify

ไม่แตะโค้ด · สัญญา DES-011

#### Acceptance criteria

AC-033/AC-034/AC-035 แสดงเป็น UX ครบ (ตรวจก่อน Generate, บล็อกปุ่ม, ตรวจซ้ำไม่ต้องปิดหน้า)

#### Required validation and expected evidence

artifact + ตาราง Sign-off + ทะเบียน `../../modules/timetableai/build/uxui/README.md` · หลังคนเซ็น → PM ตรวจ → `qa-engineer` ตั้ง Status ของ FE-026

#### Rollback/compatibility notes

ร่างเอกสาร — ไม่กระทบโค้ด/สัญญา

### Task FE-026 — Generate precheck: blockers + warnings + shortcut, no silent drop (DES-011, REQ-014 AC-033..AC-035)
Owner: frontend-engineer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: FE-023, FE-024, FE-025, UX-012
Traceability: REQ-014, AC-033, AC-034, AC-035, DES-011, DEC-011
Produces: none
Consumes: Contract:TimetableGeneratePrecheck.v1
Risk: high
Human gate: none
Status: pending

#### Scope and constraints

ตาม design §36: คำนวณ `lstGenerateBlockers` จาก **BR-27** — (ก) `NoEligibleTeacher` = ไม่มีครูใน `TPlanCourseTeacher` ของวิชาในแผนนั้นที่ผ่านการจำกัดห้องประจำชั้น (BR-41/42 ของ FE-025) **และ** ตัวกรองผู้ดูแลห้อง (BR-71 ของ FE-024 — ชุดว่างเพราะผู้ดูแล = `sDetail: "RoomCaretaker"` + ชื่อห้อง/ผู้ดูแล + ทางลัดหน้า subject-settings) (ข) `ZeroPeriodsPerWeek` (โควตา 0/ไม่มีค่า) — **สองเหตุนี้เท่านั้นที่บล็อก**; เลิกใช้ `Tbl_TeacherClassAssignment`/`lstClassTaught` เป็นแหล่ง (AC-046a) · **BR-50** — ตรวจทุก sub-course ของทุกแผนใน `sPlanIDs` × ห้องเรียนของแผน ไม่ใช่เฉพาะที่ผู้ใช้ติ๊ก (ขอบเขตที่จัดยังตาม Schedule Summary เดิม) · **BR-28** — ตรวจครบทุกรายการ + ตรวจซ้ำได้โดยไม่ reload (GET ชุด maps ใหม่แล้วคำนวณใหม่โดยไม่ล้างกริด/ช่องล็อก — ข้อยกเว้นเฉพาะจุดของ DES-007; GET ล้ม = คงสถานะบล็อกเดิม + error **ห้ามปลดด้วยข้อมูลที่โหลดไม่สำเร็จ**) · **BR-51** — ทางลัด resolve URL จากข้อมูลเมนูที่ layout โหลดไว้ ด้วย identity รายการเมนู (SA-Q13 มี fallback — ห้าม hardcode ห้ามใช้หน้า `/academic`) เปิด**แท็บใหม่** คงกริด/ช่องล็อก; deep-link เฉพาะเมื่อ SA-Q13 ยืนยันว่าปลายทางรองรับ · ปุ่ม Generate/Regenerate disabled เมื่อ blockers ไม่ว่าง ร่วม gate เดิม `isConflictDataReady` + `isAcademicRoomUsageReady` (FE-024) · ยกเลิกพฤติกรรมตัดวิชาเงียบที่ `use-timetable-generation.ts:205-207` (AC-016 ยกเลิก) — **ห้าม fallback กลับไปพฤติกรรมเดิม** · รวม `lstGenerateWarnings` (BR-53, `RoomSettingMissing`, `SubjectGroupPinnedConflict` — ไม่บล็อก) · การวางมือไม่ถูกบล็อกโดยรายการนี้; Link Subject pre-placement รอด้วย (อยู่ใน Generate) · precheck กับ DES-020 shortfall ไม่ซ้อนกัน (BR-83) · ออกพร้อม/หลัง FE-025 (SA-Q8)

#### Retrieval hints

Hypothesis: `_lib/use-timetable-generation.ts:205-207` (`itemsToPlace` — EVD-042), `page.tsx` `eligibleClassesMap` :1205 (EVD-043), `Sidebar.tsx:579` (เมนู "จัดการหลักสูตร/แผน" — EVD-079, D48) · design §36
Query: ค้น `itemsToPlace`, `eligibleClassesMap`, `isGenerateBlocked`, `lstClassTaught` ใน `src/app/[locale]/timetable/manage-teaching-schedule`

#### Do not modify

DES-020 shortfall (FE-005/FE-008 — คนละกลไก BR-83) · ตรรกะ solver อื่น · DES-018 (FE-018/019)

#### Acceptance criteria

AC-033: ตรวจก่อนเรียก Generate เสมอ — ทุกวิชาของแผนที่เลือก; ทางลัดไปหน้าจัดการหลักสูตร/แผน (resolve จากเมนู)
AC-034: พบปัญหา 1 รายการ → บล็อกปุ่ม + แสดงรายการครบ
AC-035: แก้ครบแล้ว ปุ่มกลับมากดได้โดยไม่ปิดหน้า (ตรวจซ้ำ BR-28)

#### Required validation and expected evidence

vitest: 2 เหตุบล็อก + `RoomCaretaker`, ขอบเขต BR-50 (วิชาไม่ได้ติ๊กก็บล็อก), ตรวจซ้ำไม่ล้างกริด/ล็อก, GET ล้ม = คงบล็อก, resolve เมนู + fallback ไม่มีสิทธิ์, ปฏิสัมพันธ์ `isConflictDataReady`/`isAcademicRoomUsageReady` · grep ยืนยันไม่มีจุดตัดวิชาเงียบเหลือ · typecheck/lint/build · `[manual-E2E]` · worktree ยังไม่ commit — ยืนยันบรรทัดก่อนแก้

#### Rollback/compatibility notes

revert ได้เดี่ยว — กลับพฤติกรรมตัดวิชาเงียบ (R31 เปิดอีก) · behavior-change — ผู้ใช้ที่เคย Generate ได้จะถูกบล็อก (ธุรกิจยืนยันแล้ว REQ-014)

## Phase 13: REQ-019 — Push Timetable to `/academic` (DES-016) 🔒 Security gate

> cross-backend integration ใหม่ (ทางเดียว timetableai → academic, แทนที่ทั้งหมดต่อ (ห้องเรียน, เทอม) รวมแถวที่คนสร้างเอง) — ขวางอยู่ที่ schema confirmation §27.6 (ง) (#12) และ **SA-Q6/SA-Q7/SA-Q11/SA-Q12** (#14 — ก่อนปิด = ฟีเจอร์ไม่เปิดใช้ toggle `isActive` คง as-built) · ต้องเข้ารอบ `security` (#1) — write ที่ลบข้อมูล production ของระบบอื่น

### Task UX-013 — UX artifact: "ใช้งานตารางสอน" push flow (DES-016, REQ-019 AC-047..AC-049, AC-052, AC-053)
Owner: uxui-designer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: UX-007
Traceability: REQ-019, AC-047, AC-048, AC-049, AC-052, AC-053, DES-016, DEC-016
Produces: uxui/UX-013-push-to-academic.md
Consumes: Contract:AcademicTimetableSync.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

ร่าง UX artifact: ปุ่ม "ใช้งานตารางสอน" บน `/timetable/[year]` (แทน toggle `isActive` เดิม — EVD-069; แท็บ ใช้งาน/ไม่ใช้งาน ของ REQ-007 คงความหมาย) — disabled เมื่อ `isActive=false` (BR-58) · เลือกหลายตารางพร้อมกันได้ (AC-053) · flow Preview → คำเตือน "จะแทนที่ข้อมูลเดิมทั้งหมดใน `/academic`" **ทุกครั้งที่ปลายทางมีแถว** (AC-049 — รวมส่งซ้ำ; ไม่มี publish/lock) → Apply → ผลจริงราย (ห้องเรียน, เทอม) `Sent/Rejected/Failed/Partial/NotSendable` + `lstInvalidRows` + เหตุ `NotSendable` (`NotActive`/`NoTerm`/`MissingTeacherOrCourse`/`SchoolMismatch`/`ClassInMultipleTimetables` พร้อมรายชื่อตารางที่ครอบคู่ซ้ำ — BR-60 ห้ามเลือกชุดให้เอง) · ส่งซ้ำเฉพาะคู่ที่ล้ม

#### Retrieval hints

Hypothesis: design §41.2, §41.5 · `/timetable/[year]/page.tsx` `toggleTimetableStatus` :156 (EVD-069) · spec `/academic` (§32.5 — inferred)
Query: ค้น `isActive`, `NotSendable`, `Preview` ใน `design.md` §41

#### Do not modify

ไม่แตะโค้ด · สัญญา DES-016

#### Acceptance criteria

AC-047..AC-049, AC-052, AC-053 แสดงเป็น UX ครบ (gate isActive, ผลจริงรายคู่, เตือนแทนที่ทุกครั้ง, payload default, หลายชุดพร้อมกัน)

#### Required validation and expected evidence

artifact + ตาราง Sign-off + ทะเบียน `../../modules/timetableai/build/uxui/README.md` · หลังคนเซ็น → PM ตรวจ → `qa-engineer` ตั้ง Status ของ FE-027

#### Rollback/compatibility notes

ร่างเอกสาร — ไม่กระทบโค้ด/สัญญา

### Task BE-014 — Academic sync record backend: `Tbl_TimetableAcademicSync` + `Timetable/SetAcademicSyncResult|GetAcademicSyncResults` (DES-016 §41.4)
Owner: backend-engineer
Tier: T2
Targets: sb-api-academic-timetable-ai
Depends on: BE-010
Traceability: REQ-019, AC-048, DES-016, DEC-016, REQ-021, AC-060, AC-061, AC-062, DES-018, DEC-018
Produces: none
Consumes: Contract:AcademicTimetableSync.v1
Risk: critical, security
Human gate: schema, security
Status: pending

#### Scope and constraints

ตาม design §41.4: model ตารางใหม่ `Tbl_TimetableAcademicSync` (§27.6 **ง — บังคับ**; 1 แถวต่อ (ตาราง, ห้องเรียน, เทอม): สถานะล่าสุด, `jScheduleIDs` ที่ Service Academic คืน, ผลรายแถว, ผู้ส่ง/เวลา) — **ไม่มี DDL ใน task นี้** (#11) · `Timetable/SetAcademicSyncResult` `{nSchoolID, nTimetableID, lstResults:[{nClassID, sTermID, nStatus, lstScheduleIDs, jDetail}], nTeacherID}` — upsert ต่อคู่ใน **DB transaction เดียว** · `Timetable/GetAcademicSyncResults?nSchoolID&nYear[&sTermID]` — ผลทุกคู่ของปี (ใช้โดยหน้าผลการส่งและ BR-56 ของ FE-024) · **VR-16** `InvalidSyncResult` — `nTimetableID` ไม่ใช่ของ `nSchoolID` / `nClassID` ไม่อยู่ในตาราง / `sTermID` ไม่ใช่เทอมที่ derive ได้ (BR-46) / `nStatus` นอก enum → `status 0` ไม่เขียนอะไร · จำเป็นเพราะ AC-048 (ผลจริง + ส่งซ้ำเฉพาะที่ล้ม) และ BR-56 (กันนับห้องซ้ำ) · เกณฑ์ = AC-048 (ส่วนบันทึกผล) + VR-16

ลงทะเบียน endpoint ใหม่ใน authorization policy/filter ตาม DES-018 §43.2(a) ใน task เดียวกัน; คง fail-closed/claims/school-resource ownership และ audit identity จาก claims (BR-73); ไม่เชื่อ audit identity จาก client

#### Retrieval hints

Hypothesis: design §41.4, §27.6 (ง), §41.5 (VR-16) · `Timetable/Set|Get` (EVD-036) — รูปแบบ endpoint ของโมดูล
Query: ค้น `Tbl_Timetable`, `SetAcademicSyncResult`, `BR-56` ใน `design.md`, `AITimeTableBackend`

#### Do not modify

`TSchedule`/`TTermTimeTable` (ห้ามเขียน school DB — BR-45) · สัญญาของ Service Academic (SA-Q6) · DES-018 auth ของ endpoint เดิม/claims/tenant/predicate; อนุญาตเพิ่ม mapping ของ endpoint ใหม่ใน task นี้ตาม §43.2(a) โดยคง semantics เดิม

#### Acceptance criteria

AC-048 (ส่วนบันทึกผล): ทุกคู่ที่ส่งถูกบันทึกสถานะล่าสุด + `jScheduleIDs` + ผลรายแถว — อ่านย้อนได้ครบของปี
VR-16: ข้อมูลไม่ตรงเจ้าของ/สัญญา → ปฏิเสธโดยไม่เขียน (กันบันทึกเท็จที่ทำให้ BR-56 ตัดการใช้ห้องจริงออก)

#### Required validation and expected evidence

`dotnet build` + `dotnet test` · test VR-16 ทุกเงื่อนไข + upsert transaction + การอ่านย้อนต่อปี/เทอม · `[manual-API]` หลัง deploy · ห้าม dispatch ก่อน #12 (ง) เซ็น · เข้ารอบ `security` ร่วม DES-016

Auth evidence ของ endpoint ใหม่: no token → 401; school/resource คนละโรงเรียน → 403/ไม่อ่านหรือเขียน; read/write menu permission ตาม mapping + missing mapping fail-closed; audit identity จาก claims; regression existing policy semantics คงเดิม (AC-060..AC-062)

ห้าม dispatch ก่อน #14 ปิดครบ (SA-Q6/7/11/12) ตาม DES-016 พร้อม #12(ง); sync-read พร้อมก่อน FE-024 ใช้ BR-56 โดยไม่รอ FE-027; Set write/Get read MenuID401

#### Rollback/compatibility notes

ตาราง/endpoint ใหม่ — revert ได้เดี่ยว · อ่านบันทึกผลไม่ได้ → BR-56 นับทุกแถว (เข้มขึ้น — อาจปฏิเสธเกินจริง แต่ไม่หละหลวม)

### Task FE-027 — Push orchestration (option A) + push UI per contract (DES-016, REQ-019 AC-047..AC-049, AC-052, AC-053)
Owner: frontend-engineer
Tier: T2
Targets: sb-tech-upgrade-web-system
Depends on: BE-014, FE-021, FE-024, UX-013
Traceability: REQ-019, AC-047, AC-048, AC-049, AC-052, AC-053, DES-016, DEC-016
Produces: none
Consumes: Contract:AcademicTimetableSync.v1
Risk: critical, security
Human gate: security
Status: pending

#### Scope and constraints

orchestrate ตัวเลือก **A — browser** (ข้อเสนอ SA — ต้องรอ SA-Q7 ยืนยัน; ตัวเลือก B = service credential ใหม่): อ่าน snapshot จาก `Timetable/Get` แล้วเรียก Service Academic ผ่าน `/api/gateway/service-academic/*` ด้วย JWT ผู้ใช้ (school จาก claims — ห้ามส่ง schoolId จาก client) · ต่อ (ห้องเรียน, เทอม): **Preview** (BR-61) อ่านแถวเดิมด้วย `GET timetables/by-room` + จำนวนแถวที่จะถูกแทน + ลายนิ้วมือ (`scheduleId` เรียงแล้ว) + `NotSendable` (`NotActive` BR-58 — อ่านสถานะล่าสุดจาก backend ก่อนส่ง ห้ามเชื่อ state ของหน้า / `NoTerm` BR-46 / `MissingTeacherOrCourse` / `SchoolMismatch` — ตรวจ `nSchoolID` ของตาราง = school ใน JWT / `ClassInMultipleTimetables` BR-60 — ห้ามเลือกชุดให้เอง ห้าม merge) → ผู้ใช้ยืนยัน (คำเตือนแทนที่ทุกครั้ง) → เขียนตาม **transaction boundary ที่ SA-Q12 ยืนยัน** (T1 endpoint atomic ใหม่ของ Service Academic หรือ T2 เขียนใหม่ก่อน-ลบของเดิมทีหลัง ลู่เข้า; **ห้าม T3**) → `Timetable/SetAcademicSyncResult` ทันทีหลังได้ `scheduleId` · payload ตาม BR-47/BR-59 + ตาราง §41.7 (`calculate = true` เสมอ; ฟิลด์ที่ไม่มีข้อมูล = ตามตาราง — ห้ามเดาค่าอื่น; `nTerm` ตาม BR-46) · แสดงผลจริงรายคู่ครบ (BR-48 — ห้าม success modal ลวง D26; **ไม่มี distributed transaction ข้ามคู่** — ไม่ rollback คู่ที่สำเร็จ) · idempotency — ทุก Apply อ้างลายนิ้วมือ Preview ล่าสุด; ไม่ตรง → `DestinationChanged` ต้อง Preview ใหม่; ปุ่มล็อกระหว่างส่ง (T2) · Service Academic `code ≠ 200` → `Rejected` (400 + ผลรายแถว) หรือ `Failed` — **ไม่ retry อัตโนมัติแบบเงียบ** แสดงให้ผู้ใช้ส่งซ้ำ; บันทึกผลล้มหลังเขียนสำเร็จ → แสดงผลจริง + แจ้งว่าบันทึกไม่สำเร็จ (BR-56 จะนับเข้มขึ้น) · ทางเดียว — ไม่มี read-back ของเนื้อตาราง (BR-49; อ่านได้เฉพาะ Preview + การใช้ห้องของ FE-024) · envelope ของ Service Academic `{code, message, messageTh, results}` ต่างจากโมดูล `{status, message, data}` — ห้ามตีความปนกัน (§13) · **ไม่เริ่มก่อน #14 ปิดครบ (SA-Q6/7/11/12) และ #12 (ง) เซ็น** — ก่อนนั้นฟีเจอร์ไม่เปิดใช้ (toggle `isActive` คง as-built)

ใช้ FE-021 บริบทโรงเรียน/ปี/เทอมที่สร้างแล้ว ไม่สร้าง term selector/state อีกชุด; ส่ง/รีเซ็ต context ตาม DES-009

#### Retrieval hints

Hypothesis: `src/services/academic/timetable-service.academic.ts` (`import` :213 — EVD-065), `client.academic.ts` (`ACADEMIC_BASE` :17 — EVD-066; gateway อ่าน token จาก custom header — D54), `toggleTimetableStatus` (EVD-069) · design §41.1–§41.7
Query: ค้น `timetables/by-room`, `timetables/import`, `scheduleId`, `gateway/service-academic`, `calculate` ใน `src/services`, `src/app`

#### Do not modify

backend ของโมดูล (เรียก endpoint BE-014 ที่สร้างแล้วเท่านั้น; frontend ไม่เขียน backend) · สัญญาของ Service Academic · DES-018/DES-022 · toggle `isActive` เดิมคงความหมาย (BR-58 — REQ-007)

#### Acceptance criteria

AC-047: ส่งเข้า `/academic` ทางเดียวได้เฉพาะตาราง `isActive=true`
AC-048: ผลจริงราย (ห้องเรียน, เทอม) แสดงครบ + บันทึกลงโมดูล
AC-049: ส่งซ้ำเตือนแทนที่ทั้งหมด + รอยืนยันทุกครั้ง — ไม่มี publish/lock
AC-052: `calculate = true` เสมอ; ฟิลด์ที่ไม่มีข้อมูล = ตามตาราง §41.7 ที่ยืนยันแล้วเท่านั้น
AC-053: ส่งหลายชุดพร้อมกันได้; คู่ที่ถูก ≥ 2 ตารางครอบ = `NotSendable(ClassInMultipleTimetables)` คู่อื่นส่งปกติ

#### Required validation and expected evidence

vitest: mapping snapshot → payload (BR-47/59), fingerprint/`DestinationChanged`, `NotSendable` 5 เหตุ, BR-60, ผลรายคู่ + ไม่ rollback คู่สำเร็จ, T2 ลู่เข้า (ถ้าเลือก T2), 503 → `Failed` ไม่ retry เงียบ · `[manual-E2E]` กับ environment ของ Service Academic (หลัง #14 ปิด) · เข้ารอบ `security` — แทนที่ข้อมูล production ของระบบอื่น, `SchoolMismatch`, VR-16 · worktree ยังไม่ commit — ยืนยันบรรทัดก่อนแก้

#### Rollback/compatibility notes

ฟีเจอร์ไม่เปิดใช้ได้เดี่ยว (กลับ toggle as-built) · การถอนข้อมูลที่ส่งแล้วใน `/academic` = requirement ใหม่ (ทางเดียว — BR-49) · ขึ้นกับสัญญาที่ยืนยันของ SA-Q6/12 — คำตอบต่างจากข้อเสนอ → `system-analyst` amend DES-016 ก่อน

## Sequencing Notes

- **ลำดับของ R1:** FE-019 → reviewer → QA (S12/S12-H + AC-063/AC-066 regression) → FE-020 → reviewer → QA (S14) → security/ตรวจข้อมูลจริง → ผู้ใช้ commit/merge → devops หลัง #6 ยืนยัน · R1 frozen; Phase 6/8–13 อยู่ R2 · finding นอก scope ไป backlog
- **DAG (จาก `Depends on`) — Phase 1–3 (verified):** BE-003, FE-002, FE-005 ไม่มี dependency · FE-003 ← BE-003 + FE-002 + FE-005 · FE-004 ← BE-003 + FE-002 · BE-004, FE-006 ไม่มี dependency · BE-001 → BE-002 → FE-001
- **DAG — Phase 4–6 (เพิ่ม 2026-09-30):** BE-005 → FE-007 (← FE-002 ด้วย) · FE-003 + FE-004 → FE-008 → FE-009 · BE-002 → BE-006 → BE-007 → FE-010 · FE-001 → FE-017 → FE-010 (Rev 15) · UI: FE-010 → FE-011 · FE-005 → FE-012 → FE-013 (← FE-008 + FE-007 ด้วย) · BE-003 → FE-014 · FE-009 → FE-015 · FE-001 → FE-016 · edge ข้ามเฟสทุกเส้นชี้ไปยัง task ที่ verified แล้วหรืออยู่เฟสก่อนหน้า — ไม่มีวงวน · **Phase 4 กับ Phase 5 ไม่มี edge ระหว่างกัน ทำคู่ขนานได้** · เฟสของ 10 task เดิมไม่เปลี่ยน
- **DAG — Phase 5/7:** BE-006+BE-007 → BE-008 → BE-009; FE-001 → FE-018 → FE-019 → FE-020 (FE-019 รอ FE-001 ด้วย) · ไม่มี contract edge ระหว่าง BE-008/BE-009 กับ FE-018..FE-020 · Phase 6 pending บน signed UX แล้ว; Phase 7 ไม่รอ Phase 6
- **backend ก่อน frontend:** BE-005 ก่อน FE-007 (FE-007 ทนได้ตาม Fallback แต่ UI อังกฤษจะ "จำแนกวิชาหนักไม่ได้" จนกว่า BE-005 live) · BE-006 → BE-007 ก่อน FE-010
- **FE-008 เป็นจุดรวมของ T_c:** solver (FE-003), สรุป (FE-004), คำเตือน (FE-009) และ UI (FE-013/FE-015) ต้องผ่านฟังก์ชันเดียวของ FE-008 — BR-81a Rev 13 ห้ามสูตรซ้ำ · FE-007 กับ FE-008 ไม่มี edge (แก้คนละจุด) แต่ FE-013 ต้องรอทั้งคู่เพื่อให้วิชาหนักที่แสดงถูกต้อง
- **QA ตรวจซ้ำของ task ที่ verified แล้ว:** FE-002 — ผลได้มาก่อน BR-77 Rev 11 → รอบ QA ของ FE-007 รันชุดตรวจ BR-77 ของ FE-002 ครบ · FE-001 — FE-017 แก้ wrapper ของ FE-001 (additive, ค่าเริ่มต้นไม่เปลี่ยน) → รอบ QA ของ FE-017 ตรวจ AC-063 ซ้ำ · FE-003/FE-004 — ได้ `verified` ก่อน Rev 13/15/16; ส่วนที่เปลี่ยน (BR-81b, การเลือก attempt จากกริด, RNG, **ชุดวันของ `lstClassDays` = ชุดวันของ D_c — Rev 16**) อยู่ใน FE-008 และตรวจในรอบของ FE-008 · **FE-004:** ความเห็น PM — ไม่ต้องมีรอบตรวจแยก เพราะถ้อยคำเกณฑ์ของ FE-004 ไม่เปลี่ยนและยังจริง แต่ FE-008 แก้โค้ดสรุปของ FE-004 (`intensity-summary.ts`) → รอบ QA ของ FE-008 ต้องรันการนับของ FE-004 ซ้ำและถือว่าการที่วันไม่มีช่องสอนหายจากสรุปเป็นการเปลี่ยนที่ตั้งใจ (ไม่ใช่ regression) — การตัดสินช่อง Status ของ FE-004 เป็นของ `qa-engineer` · ช่อง Status ของ task ที่ verified เป็นของ `qa-engineer` (PM ไม่แก้)
- **Phase 6 พร้อมด้าน UX:** UX-006 → FE-011; UX-001 → FE-012/FE-013; UX-002 → FE-014; UX-003 → FE-015; UX-004 → FE-016 · เซ็น as-is 2026-10-04 แล้ว; Status pending · PM ตรวจ scope แต่ไม่เปลี่ยน Status ของ QA · UX-004 ไม่ครอบ retry
- **FE-005 ก่อน FE-003 เป็น edge จริง:** FE-003 เปลี่ยนการเลือก attempt (shortfall ก่อน intensity) ขณะที่รายงานของ FE-005 อ่านจาก attempt ที่ถูก apply (BR-82) — ทั้งสองแก้ `use-timetable-generation.ts` ไฟล์เดียวกัน
- **Phase 3 (auth) เริ่มได้โดยไม่รอ Phase 1/2:** REQ-021 + AC-060..AC-063 ลงทะเบียนแล้วใน `requirement.md` (2026-09-29) → BE-001, BE-002, FE-001 เป็น canonical task แล้ว · แถว mapping ของ endpoint จากสัญญาที่ยังถูกประตู (DES-010/DES-013/DES-016) มากับ task ของสัญญานั้น ไม่ใช่ BE-002
- **ข้อกำหนดก่อน deploy (ไม่ใช่ task ของแผนนี้ · ไม่ใช่ QA gate):**
  - **Phase 3 + Phase 5 + FE-011/FE-016 (auth/สิทธิ์เมนู) → production:** รอบ `security` ของ DES-018 เป็น **ประตูมนุษย์บังคับที่ยังเปิด** (Critical/Important) — รวม `Token_Secret` ใน `appsettings.json:13` ที่ผู้ใช้รับความเสี่ยงไม่ rotate (R33, D49 — SEC-01 ใน `review.md`) ซึ่ง **ยังเป็น finding Critical ไม่ถือว่าปิด** · **รอบเดียวกันต้องตรวจ (2026-09-30):** การแยก resolver (BE-006) และ **ข้อยกเว้น BR-74 ของ `MenuPermissions/Get` แบบ authenticated-only (BE-007)** ตาม DES-022 Security: sensitive
  - **Auth → deploy ใด ๆ:** `devops`/เจ้าของระบบ SB ตรวจ **SA-Q14** — MenuID 401, 402, 403, 404, **422** มีใน `TMenu` (active), `TMenuPermission.MenuUrl` ตรง route, มีแถว `TGroupPermissionMenu` ของกลุ่มที่ควรเข้าได้, ค่าจริงของ `Type`/`Role` · 422 ไม่มี = ทุกคนได้ 403 ที่ subject-settings และรายการ subject-settings ใน Sidebar เป็น `noPermission` สำหรับทุกคน
  - **หลักฐาน Phase 5:** TP-D3 test project ปิดแล้ว; TP-D1/TP-D2/Unverified Behaviour ที่ยังเปิดให้ devops แสดงก่อน deploy ตาม qa.md; ไม่ย้อนเปิด gate dispatch ของ task verified
  - **BE-008/BE-009 → production:** OQ-39/OQ-40/SA-Q23 ปิดแล้ว; security ตรวจ predicate null/fail-closed/ข้อยกเว้น BE-007, devops ตรวจข้อมูลจริง #3/#4; TP-D2/Unverified Behaviour ตาม qa.md ยังต้องแสดงก่อน deploy
  - **FE-019 → production:** (a)–(d) ออกพร้อมกันต่อหน้า; recovery = reload/no auto retry ตาม AC-070; signed UX-004 เฉพาะ 401/403; retry control ใหม่รอ signed UX ที่ครอบจริง + คนตัดสิน scope (BL-018)
  - **DES-022 ลำดับออกรุ่น:** FE-017 ออกก่อนหรือพร้อม FE-010 (FE-017 เดี่ยวไม่มีผลต่อผู้ใช้) · FE-010/FE-011 ต้อง live **ไม่เร็วกว่า** BE-006/BE-007 — ถ้า Sidebar ออกก่อน endpoint จะได้ 404 → `checkFailed` = ทุกรายการปิดสำหรับทุกคน (fail-closed ตามสัญญา แต่เป็นการถดถอยที่ผู้ใช้เห็น)
  - **Auth ลำดับออกรุ่น:** FE-001 ต้อง live ไม่ช้ากว่า BE-001/BE-002 (ส่ง Bearer ให้ backend ที่ยังไม่ตรวจไม่มีผล แต่กลับกันจะพังเงียบ)
  - **R32 (ยอมรับชั่วคราว):** production frontend ชี้ backend dev — เมื่อ auth ใช้งาน backend dev ต้องถือ `Token_Secret` ของ production · รอบ `security` ต้องรับทราบ
  - **BE-003 (+ FE-014) → deploy:** `devops` รัน DDL มือ `ALTER TABLE "Tbl_Timetable" ADD COLUMN "nCourseIntensity" smallint NULL;` **ก่อน** deploy backend ที่มี BE-003 (real migration = ประตูมนุษย์ของ `devops` — PRE-01 ใน `review.md`) · FE-003/FE-004/FE-008 ทนต่อ backend ที่ยังไม่มีฟิลด์ (ถือ L = 0) · FE-014 ต้องไม่ออกก่อน DDL + BE-003
  - **Intensity กับโรงเรียนจริง (FE-007/FE-008/FE-013):** `devops`/เจ้าของ school DB ตรวจ **SA-Q18** — ค่าจริงของ `TCourseGroup.Description` ขึ้นต้นด้วย "พื้นฐาน"/"เพิ่มเติม" จริงหรือไม่ และ `MasterCode`/`PurposeCode` เป็นรหัสมาตรฐานหรือไม่ · ไม่ตรง → โรงเรียนนั้นได้ "จำแนกวิชาหนักไม่ได้" (fallback) · พบรหัสมาตรฐาน → `system-analyst` amend BR-77 → `project-manager` re-plan
- **ผลที่ผู้ใช้เห็นของ Phase 1/4/5 มาพร้อม Phase 6 เท่านั้น:** FE-002..FE-005, FE-007..FE-010 เป็นข้อมูล/ตรรกะ — ตารางใหม่ได้ L = 0 จนกว่า FE-014, รายงาน/สรุป/ข้อเสนอแนะ/คำเตือน/เมนูปิดยังไม่ถูกแสดงจนกว่า FE-011..FE-015 (AC-054/AC-055/AC-056/AC-064 ส่วน "ผู้ใช้เห็น" ยังไม่ครบ)
- **UX ที่ร่างแล้วแต่ยังไม่มี task:** UX-005 (กติกาการแสดงความล้มเหลวของ action — แก้ as-built จาก UI review; อ้าง AC-063, DES-020 §45.3, AC-014) — ยังไม่มีคนเซ็นและยังไม่ได้กำหนดขอบเขตเทียบ as-built · หลังคนเซ็น `project-manager` จะแตก task (ถ้าเปลี่ยนพฤติกรรมเกินสัญญาที่มี → ส่ง `system-analyst`/`business-analyst` ก่อน)
- **REQ-012..REQ-019 วางเป็น task แล้ว:** Phase 8–13; gates ปัจจุบันดู Waiting on Human #10..#16

- **ลำดับของ R2:** #10 → UX-007/BE-010 → FE-021 หลัง UX-007 เซ็น; BE-010 → BE-012/BE-013/BE-014 หลัง schema/contract gates → BE-011 หลัง BE-012+BE-013 → FE-022 หลัง FE-021+signed UX-008 · BE-013+FE-021 → FE-025 หลัง signed UX-011 → FE-024 หลัง BE-012+BE-014+FE-021+signed UX-010 → FE-027 หลัง BE-014+FE-021+signed UX-013 · UX-009 → FE-023; FE-023+FE-024+FE-025 → FE-026 หลัง signed UX-012 · UX-008..UX-013 รอ UX-007 ตาม metadata · Phase 6 ทำได้แยกจากงานใหม่ · เป็นลำดับเตรียมงาน ไม่ใช่อนุมัติ dispatch/deploy; #10..#16 ยังมีผล
- **DAG — Phase 8–13:** BE-010 → FE-021/BE-011/BE-012/BE-013/BE-014; BE-012+BE-013 → BE-011; BE-011+FE-021+UX-008 → FE-022; BE-013+FE-021+UX-011 → FE-025; BE-012+BE-014+FE-021+FE-025+UX-010 → FE-024; FE-023+FE-024+FE-025+UX-012 → FE-026; BE-014+FE-021+FE-024+UX-013 → FE-027 · UX-007 → FE-021/UX-008..UX-013; UX-009 → FE-023 · ไม่มี FE-027 → FE-024; BR-56 ใช้ BE-014 sync-read · C1′ รอ SA edit/copy contract; SA-Q8 deployment cutover ยังต้องคนยืนยัน


## Unresolved Open Questions

- ~~หลักฐานของ DES-018..DES-021 ยัง `hash=pending-sha256`~~ — design Rev 10 เขียนบรรทัด Evidence ใหม่ด้วย revision + sha256 แล้ว · **ที่ยังค้าง (2026-09-30):** หลักฐานเสริมของ Rev 11–14 ที่ task ใหม่อ้าง (`TimetableAuthorizationFilter.cs`, `course-weight.ts`, บรรทัด `WebAPIController.cs`/`backendProxy.ts`/`Startup.cs` ใน worktree) เป็น `inferred` เพราะไฟล์ยังไม่ commit/ไม่ได้ hash → Hypothesis ของ BE-005..BE-007, FE-007..FE-010 ยังไม่ใช่ข้อเท็จจริงของ source จน engineer ยืนยัน · เติม Evidence เป็นงานของ `system-analyst`/orchestrated run · plan.md ไม่แก้ `design.md`
- **Stack/check commands จาก kit นี้:** `C:\src\AICode\sta\AGENTS.md` Project config: backend .NET 10 Web API — `dotnet build AITimeTableBackend.sln` / `dotnet test AITimeTableBackend.sln` จาก `C:\src\sb-api-academic-timetable-ai`; frontend Next.js 16 + React 19 + TypeScript (next-intl) — `npm run type-check` / `npm run lint` / `npm run build` / `npm test` จาก `C:\src\sb-tech-upgrade-web-system` · scaffold มีแล้ว ไม่เรียก setup/sync จากข้อมูลล้าสมัย; ห้ามอ่าน/ใช้ STA ใน schoolbright-knowledge
- **SA-Q14** — ตรวจ MenuID/Type/Role ใน master DB ก่อน deploy งาน auth และ DES-022 (`devops`/เจ้าของระบบ SB) · fallback ของ BR-75 ใช้ได้จนกว่าจะพบค่าอื่น (พบ = `system-analyst` amend BR-75 → `project-manager` re-plan)
- **SA-Q15** — token มี `admin_id`/`exp` หรือไม่ — ไม่บล็อก (P2 เลือกแล้ว) · ต้องตอบก่อนรอบ `security`
- **SA-Q18** (เปิด — ไม่บล็อกการวางแผน) — ค่าจริงของ `TCourseGroup.Description` ของโรงเรียนที่ใช้โมดูล + ความหมายของ `MasterCode`/`PurposeCode` · เจ้าของ: `devops`/technical owner (school DB) · ต้องตอบก่อนเปิดใช้ intensity กับโรงเรียนจริง · fallback: ไม่ตรงกติกา = เบา / ทั้งแผน "จำแนกวิชาหนักไม่ได้"
- **UX ที่เซ็นแล้ว:** UX-001..UX-004/UX-006 as-is 2026-10-04; Phase 6 pending พร้อมด้าน UX · UX-005 ยังไม่มี sign-off/task (BL-012); retry control ไม่อยู่ signed UX-004/FE-016/FE-019 (BL-018)
- **TP-D2 — บัญชีทดสอบ U0–U6 + (Rev 18) บัญชีของโรงเรียนที่ไม่ active / ถูกลบ และ admin ที่ไม่ active / ถูกลบ** (ประตูคน · ก่อนทดสอบ S1 ของ BE-006/BE-007/BE-008 บน master DB จริง · *2026-10-02: ประตูก่อน release ที่ยังเปิด — ส่วนของ BE-006/BE-007 อยู่ใน Unverified Behaviour ของ `qa.md` แล้ว*) — บัญชี + แถวใน master DB ที่ใช้ร่วมทั้งองค์กร (agent สร้าง/แก้ไม่ได้) · เจ้าของ: `devops` / เจ้าของระบบ SB · ไม่มี → ส่วน `[manual-API]` ของ AC-062/AC-064 เข้า Unverified Behaviour (test ใน `AITimeTableBackend.Tests` ยังทำได้)
- **TP-D1 — ตำแหน่งจริงของ `AuthTests`** (ยังเปิด · *2026-10-02: ไม่บล็อก task ใดแล้ว — HUMAN-P5-R1 ยอมรับ BE-006 โดยให้ TP-D1 อยู่ใน Unverified Behaviour ของ `qa.md` จนถึง deploy*) — QA Phase 5 R1 grep ทั้ง Target backend แล้วไม่พบ และ baseline `[manual-API]` ก่อน refactor ไม่ได้เก็บ · เจ้าของ: `qa-engineer` / คนที่รันรอบ 2026-09-29 (ชี้ที่อยู่ หรือแก้บันทึกใน `review.md`) · ผลต่อแผน (2026-10-01): validation ของ BE-006 เปลี่ยนไปเทียบกับข้อความ BR-74/BR-76 ฉบับ Rev 18 ยกเว้น (ข) แทน "ผลก่อน refactor"
- ~~requirement drift ของ Rev 17/18 → `business-analyst`~~ — **ปิด 2026-10-02:** BA เพิ่ม AC-066..AC-072 (ไม่แก้ข้อความ AC-062/AC-063/AC-064) → Traceability/AC ของ FE-018, FE-019, BE-008, BE-009 ปรับแล้ว · FE-020 ไม่มี AC ใหม่ (ดู Scope ของ FE-020) · **ที่ยังค้าง:** (1) RV-15/RV-7/RV-13 ของ FE-020 ไม่มีถ้อยคำ AC — ถ้าต้องมี AC แยก → `business-analyst` ก่อนรอบ QA ของ FE-020 (ไม่บล็อก engineer) (2) ~~`design.md` ยังไม่อ้าง AC-066..AC-072/OQ-39/OQ-40 → `system-analyst`~~ — เสร็จ 2026-10-02 (design.md Rev 18 หมายเหตุ cross-reference)
- **RV-9 — `CreateClassPeriodForm` / `ClassDropdown` อาจเป็นโค้ดตาย** (ไม่วางเป็น task · *2026-10-04: → `../../modules/timetableai/build/backlog.md` BL-005*) — เจ้าของ: `frontend-engineer` ยืนยันด้วย grep ว่าไม่มีผู้ import ใต้ `src/` (ปัจจุบันมีเพียง `tests/integration/timetable-session-expired.test.tsx:54` และ comment ใน `class-period-overview.tsx:28`) · เหตุผลที่ไม่วางเป็น task ตอนนี้: ยังไม่ยืนยันว่าตายจริง, design §43.2b ข้อ 1 ยังระบุไฟล์นี้ (FE-018 จึงแก้ตามสัญญา) และการลบจะลบ test ที่ integration ของ AC-063 import อยู่ — ต้องตัดสินว่าจะลบหรือต่อเข้า route ก่อน · ยืนยันว่าตาย → `project-manager` วาง task ลบไฟล์ + ย้าย test ไปที่ component ที่ route ใช้จริง · ระหว่างนี้ test ของไฟล์นี้ไม่ใช่หลักฐานของ route ใด (QA)
- **RV-13 — การแทนที่ link subject แบบ atomic** (ไม่วางเป็น task · *2026-10-04: → `../../modules/timetableai/build/backlog.md` BL-015*) — FE-020 ทำเพียง reload ใน `catch` · ถ้าต้องการให้ delete+recreate ไม่ทำข้อมูลหายเมื่อ set ล้มกลางทาง ต้องมี backend replace endpoint หรือ set-in-place = เปลี่ยนสัญญา → เจ้าของ: `system-analyst` (ตัดสินว่าจำเป็นหรือไม่) · ไม่มี fallback ที่ปิดความเสี่ยงได้ครบนอกจาก reload ให้ UI ตรงกับ server
- **Worktree ที่ยังไม่ commit ของทั้งสอง Target** (design Rev 11: backend HEAD `6d997a33…`, frontend HEAD `c212ca68…` + งาน implement ของ Phase 1–3 ที่ยังไม่ commit — volatile) — task ใหม่ทุกตัวต่อยอดบนงานนี้ · การ commit/merge เป็นการกระทำของคน (agent ห้าม git ที่เปลี่ยนสถานะ) · คำถามว่างานไม่ commit ที่ขัดสัญญา (D38–D43, D45) จัดการอย่างไรก่อน merge ยังเป็นส่วนหนึ่งของ **SA-Q8** (technical owner) — ไม่บล็อก แต่ engineer ต้องยืนยันไฟล์/บรรทัดกับ worktree ก่อนแก้

- **ประตูของ Phase 8–13 (เพิ่ม 2026-10-04 — สัญญา DES-009..DES-017 วางเป็น task แล้ว):** คำถามธุรกิจของ REQ-012..REQ-019 ปิดครบแล้วใน design/requirement (OQ-8..OQ-28 — ไม่มีคำถามธุรกิจค้าง) · ที่เหลือเป็นประตูเทคนิค/อำนาจอนุมัติของคน รวมอยู่ที่ `## Waiting on Human` #10..#16: **SA-Q1** (ชื่อ/ชนิดคีย์เทอม `sTermID` — #10 รวมกับ schema confirmation §27.5), **SA-Q4** (รวมใน §27.6 (ข) — #12), **SA-Q5/SA-Q9** (schema `TRoom` + ที่เก็บ C2/C1′ — #12), **SA-Q10** (read path ข้าม `/academic` X2/X1 — #13), **SA-Q6/SA-Q7/SA-Q11/SA-Q12** (สัญญา Service Academic/orchestrate/ค่า default/transaction boundary — #14), **SA-Q8** (ลำดับ cutover — #15) · SA-Q13 (identity เมนู "จัดการหลักสูตร/แผน") มี fallback — **ไม่บล็อก** FE-026 · การตีความ BR-42 (ห้องที่รับผิดชอบ = ครูประจำชั้น + ผู้ช่วย 1 + ผู้ช่วย 2 ตาม `lstHomeroomClasses`) เป็นข้อเสนอของ SA ที่ส่ง `business-analyst` ยืนยัน**แบบไม่บล็อก** — ถ้าธุรกิจหมายถึงหัวหน้าอย่างเดียว → `business-analyst` amend DES-015 → `project-manager` re-plan (FE-025/BE-013) · UX sign-off ของ UX-007..UX-013 = #16 (agent ไม่เซ็นแทน)

## Change Log

> ประวัติ Change Log ที่อ้างข้อกำหนดเดิมย้าย verbatim ไป archive ของเอกสาร/phase ที่ระบุในรอบ 2026-10-05; ไม่ใช่ข้อจำกัดปัจจุบัน

ประวัติเดิมย้าย verbatim ไป plan-archive.md รอบ PM amend 2026-10-04
- 2026-10-05 — ผู้ใช้สั่ง "เอางบออกให้หมด": ลบเพดานขนาดเอกสารและประตู #9 รวมเงื่อนไขขออนุมัติ/ตัด release จากขนาดไฟล์; ย้ายข้อความเดิม verbatim ไป plan-archive.md; task IDs/Status/dependencies/R1/R2 scope คงเดิม
