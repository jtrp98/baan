# timetableai — Review Round 16 — BE-012 (SQL header comment-only)

> เขียนโดย `reviewer` · วันที่ผู้ใช้ jtrp98 2026-10-11 · static partial deliverable เท่านั้น · ใช้ `templates/review-round.md`

## Findings

ไม่พบ Critical/Important/Minor ใหม่ต่อ comment-only stage ของ `../../../../build/plan/timetableai--be-012.md`; ไม่ใช่ verdict ของ full BE-012 implementation

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|

## Round 16

**Verdict:** PASS

| Task | Verdict |
|---|---|
| BE-012 (SQL header comment-only; static partial) | PASS |

หลักฐานจาก `C:/src/schoolbright/target/sb-api-academic-timetable-ai/room-term-setting-school-db.sql`:

- `:1–4` เปลี่ยน header เป็นรูปตาราง/สัญญาอ่านที่ยืนยันแล้ว; ระบุ jtrp98/2026-10-11 และคำตอบจริง “ยืนยันตารางและสัญญาอ่านนี้ (แนะนำ)” / “ใช้ความจุ 1 พร้อมคำเตือน (แนะนำ)” ตรง REQ-016 และ DES-013/data-model §27.6 ก2 ปัจจุบัน
- `:5–9` ผู้ใช้รันเอง; module read-only เฉพาะ SchoolID/nYear/nTerm ตรวจห้อง/ครูของโรงเรียนเดียวกัน; successful no-row/NULL capacity เท่านั้นใช้ K=1 พร้อมคำเตือนตาม RoomSettingMissing; read failure/invalid data BLOCK ไม่มี default; external writer จัดค่า ไม่ copy/สืบทอด/backfill
- `:10–13` live TRoom SA-Q5, Academic mapping/usage SA-Q10, module mapping schema §27.6 ก และ security/release ยัง hold; ไม่อ้าง live DB confirmation ไม่เดา FK จาก dump; CREATE collision หยุดเพื่อไม่ซ่อน schema ที่ต่างกัน
- `:15–28` statement body ยังคง BEGIN / CREATE TABLE / COMMIT; `:17–26` relation public."TRoomTermSetting" มี six fields ตรงรูปที่ review14 บันทึก: SchoolID/nYear integer NOT NULL ไม่มี default; nTerm/sRoomID text NOT NULL ไม่มี default; nCapacity integer NULL DEFAULT NULL และ CHECK(NULL OR >=1); nCaretakerTeacherID integer NULL DEFAULT NULL; PK(SchoolID,nYear,nTerm,sRoomID) ลำดับเดิม ไม่มี ALTER/FK/seed/backfill/grants หรือ field เพิ่ม
- exact statement comparison กับ explicit body รูปเดิมตาม review14 (normalize EOL/ท้ายไฟล์เท่านั้น): True. Raw UTF8 substring ตั้งแต่ BEGIN; ถึงท้ายไฟล์ SHA256 `E652245D79DF433C91F13E0B10819BE8FB1C95974226DA32989571A0E62AD3E4` ตรง baseline ที่ driver ส่ง; ไม่อ้างว่ามีสำเนา raw body เก่าใน round14
- actual file 2397 bytes / 28 lines; full SHA256 `8FE5AE46275ED365F15EBB0004B9FED7B0D163848EA7B65783AF7FB00C535EA0`. Historical full-file hash `975601DDE86ED19D7FC78A65E7C62F922D0CC4EA7212D61B963A5CFA6EF8B1D3` ใน review14/QA17 เป็น snapshot ก่อน comment amend; ไม่แก้ closed records ให้เป็น hash ใหม่

**ขอบเขต:** static read/statement comparison/hash เท่านั้น ไม่ execute SQL/live DB/disposable DB/parser/build/tests/network/setup/git; ไม่ตรวจ repository-wide linkage หรือ runtime integration. QA17 อ่าน readonly ตาม brief เพื่อแยก historical snapshot เท่านั้น ไม่ใช้ QA verdict แทนการตรวจไฟล์จริง. เขียนเฉพาะ round16/review index ไม่แก้ code/plan/Status/closed rounds

**Blockers ของ full BE-012:** SA-Q5 live TRoom, SA-Q10 Academic mapping/read path/active definition และ module mapping schema §27.6 ก ยังเปิด; runtime/auth/tenant/AC-038/038a/039/040 และ security/release/DDL/deploy ยังไม่ verified. Exact C1′ schema/read/K1 ยืนยันแล้ว ไม่ถามซ้ำ; holds เหล่านี้ไม่ใช่ failed fix round หรือ defect ของ comment-only stage

**Next:** clean qa-engineer ตรวจ actual hash/body/header ใหม่เป็น partial deliverable โดยไม่ execute SQL และไม่เปลี่ยน BE-012 เป็น verified; QA17/review14/15 คงเดิม

## Reviewed

- `C:/src/schoolbright/target/sb-api-academic-timetable-ai/room-term-setting-school-db.sql` (ทั้งไฟล์)
- `C:/src/schoolbright/knowledge/timetableai/index.md` (สารบัญ)
- `C:/src/schoolbright/knowledge/timetableai/requirement/index.md`, `../../shared/requirement/req-016.md` (คำยืนยัน/AC)
- `C:/src/schoolbright/knowledge/timetableai/design/index.md`, `../design/des-013.md`, `../design/data-model.md` (§27.6 ก2)
- `C:/src/schoolbright/knowledge/timetableai/plan/index.md` (Waiting on Human/BE-012), `../../../../build/plan/timetableai--be-012.md`
- `C:/src/schoolbright/knowledge/timetableai/review/index.md`, `round-15.md` (latest Open Findings/verdict), `round-14.md`
- `C:/src/schoolbright/knowledge/timetableai/qa/index.md`, `../qa/round-17.md` (readonly historical snapshot ตาม brief)
- `C:/src/schoolbright/rong-ngang-workspace/CLAUDE.md`, `.claude/agents/reviewer.md`, `policies/README.md`, `policies/coding.md` §§4–6, `policies/documentation.md`, `templates/review-round.md`

## Change Log

- 2026-10-11 — Round16 BE-012 SQL header comment-only PASS static; exact body/hash inspected ไม่มี finding ใหม่; full task pending/remaining holds และ closed rounds คงเดิม ไม่ execute SQL/ไม่เปลี่ยน Status

Back-links: `../../../../build/plan/INDEX.md` · `../../INDEX.md`
