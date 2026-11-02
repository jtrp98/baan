# timetableai — Review Round 18 — BE-012 (stage SQL artifact-only: class-setting-school-db.sql)

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · วันที่ผู้ใช้ 2026-10-11 · static partial deliverable เท่านั้น ไม่ใช่ verdict ของ full BE-012 · ใช้ `templates/review-round.md`

## Findings

### REV-018

- **Severity:** Minor (→ backlog)
- **Task:** BE-012
- **Location:** `C:/src/schoolbright/target/sb-api-academic-timetable-ai/room-term-setting-school-db.sql:3`
- **Problem:** ใต้ banner ล้าสมัย (`:1–2`) header เดิม `:3–6` ยังเขียนว่า "รูปตารางและสัญญาอ่านที่ผู้ใช้ยืนยัน" / "ยืนยันตารางและสัญญาอ่านนี้" และ `:12` ยังอ้าง "live TRoom (SA-Q5)" — ผู้อ่านที่ข้าม banner อาจเข้าใจว่ารูป `TRoomTermSetting` ยังยืนยันอยู่ ทั้งที่ส่วนรูปตารางถูกแทนแล้ว (สัญญาอ่าน/K1 ยังมีผล) · banner ชัดพอสำหรับ AC ของ stage นี้ จึงไม่ blocking; ทางเลือก: ลบไฟล์ตาม BL-029 (ผู้ใช้ตัดสิน) หรือ annotate บรรทัด 3 ว่า "(รูปตารางถูกแทน)"
- **Reference:** `../../../../build/plan/timetableai--be-012.md` Scope/Expected Output ("ไฟล์เดิม: header ล้าสมัย body เดิม") · DES-013:8 (รูป TRoomTermSetting ถูกแทน) · plan #4

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-018 | Minor | `room-term-setting-school-db.sql:3` | backend-engineer (หรือผู้ใช้ตาม BL-029) · PM บันทึก backlog | → backlog |

## Round 18

**Verdict:** PASS

| Task | Verdict |
|---|---|
| BE-012 (stage SQL artifact-only; static partial) | PASS |

หลักฐาน (B = `C:/src/schoolbright/target/sb-api-academic-timetable-ai`):

1. **คอลัมน์ vs §27.6 ก2** (`design\data-model.md:131–153`)
   - `B/class-setting-school-db.sql:17–29` `public."TClassSetting"`: SchoolID integer NOT NULL / nYear integer NOT NULL / nTerm text NOT NULL / sClassID varchar NOT NULL (ไม่ระบุความยาว ตรง :138) — ไม่มี default · nCapacity integer NULL DEFAULT NULL + CHECK(`IS NULL OR >= 1`) · CreatedBy/UpdatedBy integer NULL DEFAULT NULL · CreatedDate/UpdatedDate timestamp NULL DEFAULT NULL · PK(SchoolID,nYear,nTerm,sClassID) · **ไม่มี sEmp** — ตรงครบ
   - `:31–42` `public."TClassSettingCaretaker"`: คีย์ 4 คอลัมน์ชนิด/NOT NULL เดียวกัน · sEmp integer NOT NULL ไม่มี default · audit 4 คอลัมน์ NULL DEFAULT NULL · PK(SchoolID,nYear,nTerm,sClassID,sEmp) — ตรง :149–153
   - `timestamp` = PostgreSQL timestamp without time zone ตรง `B/school_db.sql:1114–1115` (`TIMESTAMP NULL DEFAULT NULL` ของ TClass) และ integer audit ตรง `:1112–1113`; dump ล้าสมัย → ความตรงกับ live เป็น inferred ตามที่ §27.6 ก2:140–141 ระบุเอง
2. **ความปลอดภัย DDL:** มี `BEGIN;` `:15` / `COMMIT;` `:44` ครอบทั้งสอง CREATE · `CREATE TABLE` ไม่มี IF NOT EXISTS (คำนี้ปรากฏเฉพาะ comment `:12`) · ไม่มี ALTER TClass, FK, UNIQUE (นอก PK), INSERT, DROP, backfill, GRANT, seed
3. **Header** `:1–13`: ยืนยันรูปเท่านั้น jtrp98 2026-10-11 (TClassSetting ไม่มี sEmp + audit, nYear OQ-43, cDel NULL/'0', ตารางลูก OQ-44, `lstCaretakers`) ตรง plan #8; `:6` ระบุชัด "ไม่ใช่: อนุมัติ DDL/deploy/security/release"; `:7–8` ที่ยังเปิด SA-Q5, §27.6 ก, SA-Q10, security, release ตรง plan #4/#8 และ Expected Output; `:9` ผู้ใช้รันเอง agent ไม่ execute; `:10` ชี้ไฟล์เดิมล้าสมัยห้ามรัน · หมายเหตุ: `:8` ผูก release กับ SA-Q8 (cutover BE-013/FE-025) ขณะ plan #8 เขียน "release (#7)" — DES-013:98 ก็คง SA-Q8 ไว้ ไม่ขัดสัญญา ไม่นับเป็น finding
4. **ไฟล์เดิม** `B/room-term-setting-school-db.sql`: `:1–2` banner ใหม่ "ล้าสมัย — ห้ามรัน… ใช้ class-setting-school-db.sql แทน; ลบ = ผู้ใช้ (BL-029)"; `:3–15` = header เดิมที่ round-16 บันทึก (`:1–13` เดิม เลื่อน 2 บรรทัด); body `:17–30` (BEGIN / CREATE TABLE public."TRoomTermSetting" six fields / PK(SchoolID,nYear,nTerm,sRoomID) / COMMIT) ตรงรายละเอียด body ที่ round-16:27 บันทึกทุกคอลัมน์/ชนิด/NULL/DEFAULT/CHECK/PK ลำดับเดิม · **ข้อจำกัด:** session นี้ไม่มีเครื่องมือคำนวณ SHA256 จึงเทียบเชิงข้อความกับคำบรรยาย round-16 เท่านั้น ไม่ได้ยืนยัน hash `E652245D…3E4` ของ substring BEGIN..EOF — QA ควรคำนวณซ้ำ
5. **ไม่ชวนรันไฟล์เก่า / ชื่อ-ที่ตั้ง:** ไฟล์ใหม่อยู่ราก B ข้าง `school_db.sql` ชื่อ `class-setting-school-db.sql` ตรง Write paths `plan\be-012.md:23`; ทั้งสองไฟล์ชี้กันและกัน (ใหม่ `:10`, เก่า `:1–2`)

**ขอบเขตที่ไม่ได้ตรวจ:** ไม่ execute SQL/parser/live หรือ disposable DB/build/tests/git; ไม่คำนวณ hash; ไม่ตรวจ live schema (SA-Q5), Academic read path (SA-Q10), runtime/auth/tenant ของ AC-038/038a/039/040, security/deploy/release — ยัง hold ตาม plan #4/#8 ไม่ใช่ defect ของ stage นี้

**Next:** clean qa-engineer ตรวจ partial (body/hash ไฟล์เดิม, เนื้อหาไฟล์ใหม่ vs §27.6 ก2) โดยไม่ execute SQL และไม่เปลี่ยน BE-012 เป็น verified; PM บันทึก REV-018 เข้า backlog

## Reviewed

- `C:/src/schoolbright/target/sb-api-academic-timetable-ai/class-setting-school-db.sql` (ทั้งไฟล์)
- `C:/src/schoolbright/target/sb-api-academic-timetable-ai/room-term-setting-school-db.sql` (ทั้งไฟล์)
- `C:/src/schoolbright/target/sb-api-academic-timetable-ai/school_db.sql:1100–1121` (TClass)
- `C:/src/schoolbright/knowledge/timetableai/plan/index.md` (Waiting on Human #1–#8, แถว BE-012, grep SA-Q8), `../../../../build/plan/timetableai--be-012.md`
- `C:/src/schoolbright/knowledge/timetableai/design/data-model.md:99–158` (§27.6 ก/ก2), `../design/des-013.md` (grep §38.3/SA-Q8 เท่านั้น)
- `C:/src/schoolbright/knowledge/timetableai/review/index.md`, `round-16.md`
- `C:/src/schoolbright/rong-ngang-workspace/CLAUDE.md`, `.claude/agents/reviewer.md`, `policies/coding.md` §4–6, `policies/documentation.md` §4, `templates/review-round.md`

## Change Log

- 2026-10-11 — Round 18 BE-012 stage SQL artifact-only: PASS static; REV-018 Minor → backlog; ไม่ execute SQL/ไม่คำนวณ hash/ไม่แก้ Status หรือ closed rounds

Back-links: `../../../../build/plan/INDEX.md` · `../../INDEX.md`
