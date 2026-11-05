# timetableai — QA Round 18 — BE-012 SQL header comment-only

> qa-engineer · clean session · solo · Phase 11 · วันที่ผู้ใช้ jtrp98 2026-10-11 · ใช้ templates/qa-round.md; partial deliverable เท่านั้น
> B = C:/src/schoolbright/target/sb-api-academic-timetable-ai; M = C:/src/schoolbright/knowledge/timetableai. อ่าน index-first/data-model.md เต็ม; ตรวจ actual file ไม่ใช้ reviewer verdict แทนหลักฐาน.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | resolved carry QA17/QA16; รอบนี้ไม่ตัดสิน FE-021 ซ้ำ |

ไม่มี defect ใหม่ของ comment-only stage. Exact C1′ schema/read/K1 ยืนยันแล้ว; full BE-012 ยังรอ SA-Q5 live TRoom, SA-Q10 Academic mapping/read/active definition และ module mapping schema §27.6 ก. เป็น prerequisite hold เดิม ไม่ใช่ failed fix round ใหม่.

## Round 18

**Status:** ⚠️ Partial

Output PASS เฉพาะ static conformity ของ header/body; ไม่ใช่ database/runtime pass หรือ full BE-012 verified. BE-012 คง pending ตาม plan/be-012.md Acceptance; plan/index.md ทั้งไฟล์คงเดิม. ไม่ปลด dependent full implementation/release.

### Checks run

| Check | Command | Result |
|---|---|---|
| artifact/contract inspection | Get-Content SQL, REQ-016, DES-013, data-model.md เต็ม, BE-012, review16/14, QA17 ตาม indexes | inspected: actual 28 lines; review16 ไม่มี finding ใหม่; review14/QA17 เป็น historical baseline |
| bytes/hash/UTF8 | ReadAllBytes; strict UTF8 decode/re-encode; SHA256 | inspected: 2397 bytes; UTF8 roundtrip=True; full hash 8FE5AE46275ED365F15EBB0004B9FED7B0D163848EA7B65783AF7FB00C535EA0 |
| body comparison | UTF8 substring ตั้งแต่ BEGIN; ถึงท้ายไฟล์; explicit body compare normalize EOL/ท้ายไฟล์ | inspected: exact=True; raw body SHA256 E652245D79DF433C91F13E0B10819BE8FB1C95974226DA32989571A0E62AD3E4 ตรง baseline และ review16 |
| bounded body scan | regex บน body สำหรับ ALTER/DROP/INSERT/UPDATE/DELETE/GRANT/REFERENCES/Migrate/EnsureCreated/IF NOT EXISTS | inspected: 0 matches; 3 statements BEGIN/CREATE TABLE/COMMIT; ไม่ audit linkage ทั่ว repository |
| typecheck / lint / build / test / browser | — | NOT RUN: authorized text-only partial stage |
| SQL / liveDB / disposableDB / migration / deploy | — | NOT RUN: ผู้ใช้รันไฟล์เอง; ไม่มี agent execution |
| document preservation snapshot | Get-FileHash SHA256 ของ SQL และ exact docs ที่อ่าน | captured ก่อนเขียน; เทียบหลังเขียนใน handoff; ไม่รัน git |

Checks ข้างต้นเป็น static inspection เท่านั้น. Latest QA index=17 และ round18 ไม่มีไฟล์ก่อนเริ่มเขียน.

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| BE-012 — comment-only partial / full task | blocked | ⚠️ Partial: B/room-term-setting-school-db.sql:1–28 static conformity; AC-038/038a/039/040 ไม่ครบ runtime. Verdict นี้ไม่เปลี่ยน plan pending ตาม bounded Acceptance |

### Feature QA flows

ไม่ใช่ Feature QA; ไม่มี flow ที่ execute.

| AC / scope / reviewer | Result | หลักฐาน |
|---|---|---|
| SQL-stage header/conservation | ⚠️ Partial — static conformity | SQL:1–13 คำยืนยัน/owner-run/remaining holds; :15–28 body unchanged; BE-012 Acceptance |
| AC-038 TRoom + 1:1 mapping | ⚠️ Partial | REQ-016:24; DES-013 §38.3; SA-Q5/module mapping hold |
| AC-038a C1′ scoped read/caretaker | ⚠️ Partial | SQL six fields inspected; actual API/auth/tenant/read states/eligibility ไม่ implement หรือ execute ในรอบนี้ |
| AC-039 capacity/Academic usage | ⚠️ Partial | SA-Q10 read path/active definition ยัง hold; ไม่มี runtime test |
| AC-040 unmapped exemption | ⚠️ Partial | ไม่มี runtime verification |
| review16 open findings | ⚠️ Partial — ไม่มี finding ใหม่ | review/round-16.md:7–33; static-only ไม่มี finding ให้ reproduce |

### Data Model check

เทียบ actual SQL ทีละ field กับ M/design/data-model.md:129–146; confirmed shape เท่านั้น ไม่อ้าง external/live schema facts.

| Contract | SQL line | Static result |
|---|---|---|
| public."TRoomTermSetting" | :17 | ตรง |
| SchoolID integer NOT NULL ไม่มี default | :18 | ตรง |
| nYear integer NOT NULL ไม่มี default | :19 | ตรง |
| nTerm text NOT NULL ไม่มี default | :20 | ตรง; key ตรงตัว |
| sRoomID text NOT NULL ไม่มี default | :21 | ตรง; ไม่เดา length จาก dump |
| nCapacity integer NULL DEFAULT NULL; CHECK NULL OR >=1 | :22–23 | ตรง; ไม่มี SQL default 1/clamp |
| nCaretakerTeacherID integer NULL DEFAULT NULL | :24 | ตรง |
| PK(SchoolID,nYear,nTerm,sRoomID) ลำดับเดิม | :25 | ตรง |
| ไม่มี surrogate/audit/soft-delete/FK/seed/ALTER/grants/backfill | :15–28 | ตรงขอบเขต body |

Header: SQL:1–4 ระบุ jtrp98/2026-10-11 และคำตอบจริง “ยืนยันตารางและสัญญาอ่านนี้ (แนะนำ)” / “ใช้ความจุ 1 พร้อมคำเตือน (แนะนำ)” ตรง REQ-016:17–20/DES-013:8. SQL:5–9 ระบุ owner รันเอง/read-only/exact unit/โรงเรียนเดียวกัน; successful no-row/NULL เท่านั้น K=1+warning ตาม RoomSettingMissing, read failure/invalid BLOCK, external writer/no copy. SQL:10–13 คง SA-Q5/10/module mapping/security/release และไม่ใช่ live DB confirmation; CREATE collision หยุดตาม why-comment. เป็นการ amend existing header ตาม conventions ของไฟล์เดิม.

Historical full-file hash 975601DDE86ED19D7FC78A65E7C62F922D0CC4EA7212D61B963A5CFA6EF8B1D3 ของ review14/QA17 เป็น snapshot ก่อน amend; ไม่แก้ closed records. Raw body hash ตรง baseline; exact statement compare ยืนยัน six fields/PK/CHECK/BEGIN/CREATE/COMMIT คงเดิม.

### Issues Found (defect packet — 1 ข้อ = 1 QA-NNN)

ไม่มี defect ใหม่ต่อ SQL-stage Acceptance; ไม่สร้าง QA ID ให้ prerequisite holds. ไม่พบ Critical/failed round ใหม่. ไม่มี code/design/requirement/plan writes หรือ risk acceptance.

## Unverified Behaviour — undeployed phases

- Phase11 full BE-012: mapping/TRoom/VR-10/11/transactions/tenant-menu/auth/read states/caretaker eligibility/capacity/Academic usage/AC-040 ไม่ execute. Exact C1′ schema/read/K1 confirmed; SA-Q5 live TRoom, SA-Q10 mapping/read/active definition และ module mapping schema ยัง hold. SQL artifact ไม่ทำ room support พร้อมใช้และไม่ปลด full FE-023/FE-024 consumers.
- Phase11 🔒 Security gate คงเดิม; independent security ตรวจ tenant binding/external values/Academic trust ก่อน release. Header/static QA ไม่ปิด gate.
- Carry QA17/16 Phase8: sharedDB/DDL4tables/backfill/legacyNULL/AC-028/AC-065/SA-Q8/manual7routes ไม่รัน. FE-021 verified/approved-cache build proof คง; default SWC cache ไม่ซ่อมถาวร. Multi-tab/school switch/staleHTTP/locales/keyboard/focus/contrast/responsive/browser E2E ยังไม่ตรวจ.
- UX-007 precise details/retry/UX-005/full sign-off ยัง hold; UX-009 base/UX-011 signed แต่ UX-009 saved/partial/unavailable/stale-N delta ยังรอ gate3; UX-008/010/012/013 drafts รอ align/sign. REV-016/backlog คงเดิม.
- Phase9 copy/token/transaction; Phase10 continuity/whole-block/solver/groups/derived warnings; Phase12 caps/eligibility/precheck/recheck ยังไม่ live verified. BE-013 ขคจ dev/M1/H1 approved และ conservative partial/unavailable diagnostic ทำได้อย่างอิสระ; paired FE-025 cutover/SA-Q8/sharedDDL/release ยัง hold.
- Phase13 A+atomicT1 direction approved; concrete owner route/RPC/DTO/permission/default/mapping/revision/locks/receipt schema/verification/recovery และ §27.6 งยังรอยืนยัน; ไม่มี preview/replace/replay/unknown-outcome/runtime verification.
- Carry QA17: live menu upstream/periodJSON/deepJSON E2E/SA-Q14 MenuID401..404/422/permissions/Type/Role/TP-D2 รอ owner/DevOps. SEC-03 proof ไม่แทน liveQA.
- §27.5 schema/DDL/backfill/owner holds และ SEC-01/SEC-02 production hold คงเดิม; archive:2717 ไม่ใช่ approval. ไม่มี SQL/shared migration/deploy/release execution หรือรับความเสี่ยงแทนมนุษย์.

## Change Log

- 2026-10-11 — Round18 BE-012 header comment-only ⚠️ Partial; actual hash/raw body/exact statement/field/header inspected ไม่มี defect ใหม่. Full task pending; exact C1′ answered/remaining holds carry. เขียนเฉพาะ round18/QA index; closed QA17/review14/16 และ plan คงเดิม. Next backend-engineer BE-013 ตาม bounded dev scope.

Back-links: plan/index.md · ../index.md
