# timetableai — QA Round 20 — BE-012 stage SQL artifact-only

> qa-engineer · clean session · solo · Phase 11 · วันที่ผู้ใช้ jtrp98 2026-10-11 · templates/qa-round.md · partial deliverable เท่านั้น
> B = C:/src/schoolbright/target/sb-api-academic-timetable-ai; M = C:/src/schoolbright/knowledge/timetableai. Static only; ไม่อ่าน review\/security\. ก่อนเขียน: round-19.md มีอยู่แล้วและสมบูรณ์ (BE-013 ✅ Verified) จึงใช้เลข 20; ไม่ทับ/ลบไฟล์ใด.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | resolved carry QA16; รอบนี้ไม่ตัดสินซ้ำ |

ไม่มี defect ที่ขวาง Acceptance ของ stage SQL. ข้อสังเกต Minor (ไม่เปิด QA-NNN; → backlog/engineer ตามดุลยพินิจ): (1) `room-term-setting-school-db.sql:3,5–7,12–13` ยังมีข้อความ "ผู้ใช้ยืนยัน…/คำตอบ: ยืนยันตารางและสัญญาอ่านนี้/ยังรอ live TRoom" ของ TRoomTermSetting ต่อจาก banner ล้าสมัย (:1–2) — อ่านขัดกับ banner แต่ banner อยู่บนสุดและชัดเจน ห้ามรัน. (2) ฐานเทียบ body เดิมของ round-18 ทำซ้ำไม่ได้ (ดู Checks) เพราะไฟล์ไม่อยู่ใน git (untracked) ไม่มี baseline อิสระ.

## Round 20

**Status:** ⚠️ Partial

Output PASS เฉพาะ static conformity ของ `class-setting-school-db.sql` ต่อ data-model §27.6 ก2 + be-012.md Acceptance; ไม่ใช่ DB/runtime pass และไม่ใช่ BE-012 verified. BE-012 คง `pending`; `plan\index.md` ไม่ถูกแก้. Full AC-038/038a/039/040 ยัง hold (SA-Q5, SA-Q10, §27.6 ก, security).

### Checks run

| Check | Command | Result |
|---|---|---|
| bytes/hash ไฟล์ใหม่ | `wc -c`; `sha256sum` | class-setting-school-db.sql = 2439 bytes (LF, UTF-8, 45 บรรทัด); SHA256 71aab0c9632d4349e35da03793f64a84d82f93b51b0504b5f9c8c9bfcd91a8d1 |
| bytes/hash ไฟล์เดิม | เช่นเดียวกัน; `file` | room-term-setting-school-db.sql = 2773 bytes (CRLF, 31 บรรทัด); SHA256 129ad0937077bd46d9c98e56c61b51de716eaa2d96b69aa8453e6aeee3fb7d90 |
| body ไฟล์เดิม | `tail -n +17` (บรรทัด 17 `BEGIN;` ถึงท้ายไฟล์) แล้ว `sha256sum` | 404 bytes; raw CRLF SHA256 e06b270b11f4176bf1e1f5cbaf8f93f1a395d9260f81c569e44623cca05c8a68; หลังตัด CR (LF) f5f3a0eb61e6d79634780d4bd7155bb683b90d9e8bd926e59253d11c4dd8cacf. ไม่ตรง round-18 raw body E652245D…AD3E4 ในทุกรูปแบบที่ลอง (brute force ช่วงบรรทัด × CRLF/LF × มี/ไม่มี newline ท้าย) → **ทำซ้ำ hash ไม่ได้ (not confirmed byte-identical)**. หลักฐานเนื้อหา: body คงเดิมตามรายการ statement ที่ round-18 บันทึก — BEGIN; CREATE TABLE public."TRoomTermSetting" 6 คอลัมน์ (SchoolID int NN, nYear int NN, nTerm text NN, sRoomID text NN, nCapacity int NULL DEFAULT NULL + CHECK, nCaretakerTeacherID int NULL DEFAULT NULL), PK(SchoolID,nYear,nTerm,sRoomID); COMMIT; (:17–30) |
| header ไฟล์เดิมเทียบ round-18 | ตัด 2 บรรทัด banner แล้วนับ | 2410 bytes ≠ 2397 bytes ที่ round-18 บันทึก (และ round-18 บันทึกว่า 28 บรรทัด ซึ่งเท่ากับ 28 บรรทัดที่เหลือ) → ส่วนที่ไม่ใช่ banner ต่างจาก round-18 อย่างน้อย 13 ไบต์ (อาจเป็น EOL/ท้ายไฟล์; ไม่มี git baseline ยืนยัน) |
| git read-only | `git status/log/diff` | ทั้งสองไฟล์ untracked → ไม่มี baseline เปรียบเทียบ |
| forbidden-token scan ไฟล์ใหม่ | grep ALTER/DROP/INSERT/UPDATE/DELETE/GRANT/REFERENCES/FOREIGN/UNIQUE/TRUNCATE/IF NOT EXISTS | ไม่มีใน statement; พบเฉพาะในคำอธิบาย header :11–12 และชื่อคอลัมน์ UpdatedBy/UpdatedDate |
| PostgreSQL parser offline | which pg_query/sqlfluff/psql; python import pglast/sqlglot/sqlparse | **NOT RUN: ไม่มีเครื่องมือในเครื่อง** (ไม่ติดตั้ง/ดาวน์โหลด); syntax ตรวจด้วยตาเท่านั้น |
| typecheck/lint/build/test | — | NOT RUN: stage เป็นไฟล์ SQL artifact-only |
| SQL/DB/migration/deploy | — | NOT RUN: ผู้ใช้รันเอง; ไม่มี agent execution |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| BE-012 — stage SQL artifact-only | ⚠️ Partial (static conformity ผ่าน) | B/class-setting-school-db.sql:15–44 ตรง §27.6 ก2; ไม่ใช่ BE-012 verified → Status ใน plan\index.md คง `pending` |

### Feature QA flows

ไม่ใช่ Feature QA; ไม่มี flow ที่ execute.

### Data Model check

เทียบ `design\data-model.md` §27.6 ก2 (:125–154) ทีละคอลัมน์:

| Relation / คอลัมน์ | SQL line | ผล |
|---|---|---|
| public."TClassSetting" | :17 | ตรง |
| SchoolID integer NOT NULL, nYear integer NOT NULL, nTerm text NOT NULL, sClassID varchar NOT NULL (ไม่ระบุความยาว) ไม่มี default | :18–21 | ตรง |
| nCapacity integer NULL DEFAULT NULL + CHECK(IS NULL OR >=1) | :22–23 | ตรง |
| CreatedBy/UpdatedBy integer NULL DEFAULT NULL; CreatedDate/UpdatedDate timestamp NULL DEFAULT NULL | :24–27 | ตรง; ไม่มี sEmp ตาม OQ-44 |
| PK(SchoolID,nYear,nTerm,sClassID) | :28 | ตรง |
| public."TClassSettingCaretaker" | :31 | ตรง |
| SchoolID/nYear/nTerm/sClassID ชนิดเดียวกัน NOT NULL | :32–35 | ตรง |
| sEmp integer NOT NULL | :36 | ตรง |
| audit 4 คอลัมน์ NULL DEFAULT NULL | :37–40 | ตรง |
| PK(SchoolID,nYear,nTerm,sClassID,sEmp) | :41 | ตรง |
| ไม่มี FK/UNIQUE นอก PK, ALTER TClass, INSERT/DROP/backfill/GRANT | ทั้งไฟล์ | ตรง (scan + อ่านครบ) |
| BEGIN; (:15) … COMMIT; (:44) เดียว; CREATE TABLE ไม่มี IF NOT EXISTS | :15,17,31,44 | ตรง |

Header (:1–13): ระบุ jtrp98/2026-10-11 ยืนยัน "รูปเท่านั้น" (:3–5) และ "ไม่ใช่ อนุมัติ DDL/deploy/security/release" (:6); ที่ยังเปิด SA-Q5/SA-Q10/§27.6 ก/security/release-SA-Q8 (:7–8); ผู้ใช้รันเอง ไม่มี agent execute (:9); ไฟล์เดิมล้าสมัยห้ามรัน (:10); เหตุผลไม่ใส่ IF NOT EXISTS (:12); external writer/read-only (:13) → ไม่อ้างอนุมัติเกินจริง ตรง Expected Output. ไฟล์เดิม banner :1–2 ระบุล้าสมัย ห้ามรัน ชี้ไปไฟล์ใหม่ และ BL-029.

## Unverified Behaviour — undeployed phases

- BE-012 stage SQL: ไม่ execute ใน PostgreSQL จริง/disposable DB; syntax ไม่ผ่าน parser อัตโนมัติ; ชื่อชนกับ live (TClassSetting/TClassSettingCaretaker) ไม่ทราบ (หยุดด้วย CREATE ไม่มี IF NOT EXISTS ตามออกแบบ); สิทธิ์ role/ownership/ทะเบียนเดิมไม่ตรวจ.
- Phase 11 full BE-012: endpoint Rooms/DTO lstCaretakers/isInPlan/mapping Tbl_SubjectRoom/VR-10/11/AC-038..040 ไม่ implement/ไม่รัน; SA-Q5, SA-Q10, §27.6 ก, 🔒 security gate คงเดิม; SQL artifact ไม่ปลด FE-023 full/FE-024.
- Carry round-19/18: Phase 12 BE-013 holds (paired FE-025 cutover/SA-Q8/shared DDL/release), Phase 13 A+atomic T1 รายละเอียด, §27.5 schema/DDL/backfill, SEC-01/SEC-02 production hold, UX drafts/sign-off holds คงเดิม; ไม่มี deploy/release หรือรับความเสี่ยงแทนมนุษย์.

## Change Log

- 2026-10-11 — Round 20 BE-012 stage SQL artifact-only ⚠️ Partial; class-setting-school-db.sql 2439 bytes ตรง §27.6 ก2 ทุกคอลัมน์/PK/CHECK/BEGIN-COMMIT; ไม่มี defect ใหม่; hash body ไฟล์เดิมทำซ้ำเทียบ round-18 ไม่ได้ (ไม่มี git baseline); parser offline ไม่มี. plan\index.md ไม่แก้ BE-012 pending; closed rounds คงเดิม. Next: driver/user รัน SQL เอง; full BE-012 รอ SA-Q5/SA-Q10.

Back-links: plan/index.md · ../index.md
