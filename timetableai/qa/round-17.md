# timetableai — QA Round 17 — BE-012 SQL artifact-only

> qa-engineer · fresh session · solo · Phase 11 · วันที่ผู้ใช้ jtrp98 2026-10-11 · ใช้ templates/qa-round.md; partial deliverable เท่านั้น
> B = C:/src/schoolbright/target/sb-api-academic-timetable-ai; M = C:/src/schoolbright/knowledge/timetableai. อ่าน index-first และ data-model.md เต็ม; closed rounds คงเดิม.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | resolved carry QA16; รอบนี้ไม่ adjudicate FE-021 ซ้ำ |

ไม่มี defect ใหม่ใน SQL draft. Full BE-012 รอ exact schema/read contract/K=1/SA-Q5/SA-Q10 ตาม plan Waiting on Human #4; เป็น prerequisite hold เดิม ไม่ใช่ failed fix round ใหม่.

## Round 17

**Status:** ⚠️ Partial

Output PASS เฉพาะ static SQL draft conformity; ไม่ใช่ runtime pass หรือ full BE-012 verified. ไฟล์ตรง proposal ที่ยังต้องให้คนยืนยัน. BE-012 คง pending ตาม plan/be-012.md Acceptance; ไม่แก้ plan Status/phase และไม่เปิด dependent consumers.

### Checks run

| Check | Command | Result |
|---|---|---|
| อ่าน artifact/contract | Get-Content ของ B/room-term-setting-school-db.sql, plan/be-012.md, REQ-016, DES-013, data-model.md เต็ม, review14 และ QA16 ตาม indexes | inspected; มี SQL 25 บรรทัด; review14 ไม่มี finding ใหม่ |
| bytes/hash | ReadAllBytes; UTF8 decode/re-encode; Get-FileHash -Algorithm SHA256 | inspected: 1966 bytes; UTF8 byte-length roundtrip ตรง; SHA256 975601DDE86ED19D7FC78A65E7C62F922D0CC4EA7212D61B963A5CFA6EF8B1D3 ตรง review14 |
| exact statement comparison | ตัด comment/whitespace แล้ว case-sensitive compare กับ explicit §27.6 ก2 proposal body | inspected: True; 3 statements = BEGIN / CREATE TABLE / COMMIT |
| bounded prohibited body scan | regex บน SQL body: ALTER/DROP/INSERT/UPDATE/DELETE/GRANT/REFERENCES/Migrate/EnsureCreated/IF NOT EXISTS | inspected: ไม่พบ; ไม่มี startup/migration call ในไฟล์นี้; ไม่ได้ audit linkage ทั่ว repository |
| typecheck / lint | — | NOT RUN: text-only partial artifact |
| build / test / browser | — | NOT RUN: ไม่ใช่ full runtime task |
| SQL execution / liveDB / disposableDB / migration / deploy | — | NOT RUN ตามผู้ใช้ขอไฟล์ไปรันเอง |

Checks แบบอ่านข้างต้นเป็น static inspection ไม่ใช่ database/runtime test pass.

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| BE-012 — SQL partial deliverable / full task | blocked | ⚠️ Partial: B/room-term-setting-school-db.sql:1–25 ตรง draft; AC-038/038a/039/040 implementation ยังไม่ครบ; plan/be-012.md Acceptance ระบุคง pending จน full task ครบ |

### Feature QA flows

ไม่ใช่ Feature QA; ไม่มี user flow ที่รันจริง.

| AC / scope | อ้าง | Result |
|---|---|---|
| SQL draft exact fields/PK/check + owner-run header | plan/be-012.md SQL-stage Acceptance; data-model.md:125–146 | ⚠️ Partial — static conformity; execution/schema sign-off ยังไม่มี |
| TRoom inventory + 1:1 SubjectRoom mapping/VR-10/11 | REQ-016 AC-038; DES-013 §38.3/38.5 | ⚠️ Partial — ไม่ implement/ไม่ทดสอบ runtime |
| scoped read-only capacity/caretaker + hard caretaker rule | REQ-016 AC-038a; DES-013 BR-54/71 | ⚠️ Partial — SQL field shape ตรวจแล้ว; read states/K=1/eligibility ยังไม่ verified |
| capacity across module + Academic usage | REQ-016 AC-039; DES-013 BR-36/55/56/57 | ⚠️ Partial — live mapping/read path ยัง hold; ไม่รันทดสอบ |
| unmapped subject exemption | REQ-016 AC-040 | ⚠️ Partial — ไม่มี runtime verification |
| current reviewer findings | review/round-14.md Open Findings | ⚠️ Partial — ไม่มี finding ใหม่ให้ reproduce; review เป็น static-only |

### Data Model check

เทียบทีละ field กับ M/design/data-model.md:129–140 ไม่อ้าง dump ว่า live schema:

| Contract | Actual artifact line | Static result |
|---|---|---|
| public."TRoomTermSetting" | :14 | ตรง quoted exact relation |
| SchoolID integer NOT NULL, ไม่มี default | :15 | ตรง |
| nYear integer NOT NULL, ไม่มี default | :16 | ตรง |
| nTerm text NOT NULL, ไม่มี default | :17 | ตรง; key ตรงตัว ไม่มี legacy NULL |
| sRoomID text NOT NULL, ไม่มี default | :18 | ตรง; ไม่เดา varchar(10) จาก dump |
| nCapacity integer NULL DEFAULT NULL; CHECK NULL OR >=1 | :19–20 | ตรง; ไม่มี clamp/default 1 |
| nCaretakerTeacherID integer NULL DEFAULT NULL | :21 | ตรง; ไม่เดา FK จาก external schema |
| PK(SchoolID,nYear,nTerm,sRoomID) ตามลำดับ | :22 | ตรง |
| ไม่มี surrogate/audit/soft-delete/FK/seed/backfill/ALTER | :12–25 | ตรงขอบเขต SQL-only |
| draft/ผู้ใช้รันเอง/read-only/no copy; schema/read/K=1 holds | :1–10 | ระบุครบ; ไม่ใช่คำอนุมัติ schema หรือ permission execute |

BEGIN/COMMIT เป็นข้อความใน artifact; ไม่เคยส่งให้ database. ตรวจได้เฉพาะไม่มี startup/EF linkage ในไฟล์ที่อ่าน; repository-wide linkage/runtime integration ไม่อยู่ใน scope นี้.

### Issues Found (defect packet — 1 ข้อ = 1 QA-NNN)

ไม่มี defect ใหม่ต่อ SQL-stage AC; ไม่สร้าง QA id สำหรับ prerequisite gate เดิม. ไม่มี Critical failure/failed round ใหม่และไม่รับความเสี่ยงแทนมนุษย์.

## Unverified Behaviour — undeployed phases

- Phase11: full BE-012 mapping/TRoom/transaction/auth tenant-menu/capacity/caretaker/Academic usage/AC-040 ยังไม่ทดสอบ. Exact C1′ schema, successful absence vs read failure/invalid external data, capacity NULL/ไม่มี row → K=1 และ SA-Q5 runtime TRoom/SA-Q10 Academic mapping/readpath/active definition รอยืนยัน. Storage/read-only ตอบแล้ว ไม่ถามซ้ำ.
- Phase11 🔒 Security gate ใน plan/index.md คงอยู่; independent security ต้องตรวจ trust boundary/tenant binding/external values ก่อน release. SQL draft review ไม่ปิด gate.
- Carry QA16 Phase8: liveBE-010/sharedDB/DDL4tables/backfillAC-028/legacyNULL/pairedcutoverAC-065/SA-Q8/manual7routes ยังไม่รัน; FE-021 approved-cache build ผ่าน QA16 แต่ default cache ไม่ซ่อมถาวร. Multi-tab/school-switch/staleHTTP/locales และ keyboard/focus/contrast/responsive/browsermanualE2E ยังไม่ตรวจ.
- UX-007 precise copy/details/retry/UX-005/fullsignoff ยัง hold; UX-009/011 signed ตาม current plan/index.md; UX-008/010/012/013 ยัง draft/รอแก้และ sign-off. Review REV-016/backlog ไม่ปิด.
- Phase9 copy/token/transaction; Phase10 continuity whole-block/solver/groups; Phase12 caps/eligibility/precheck/recheck ยังไม่ live verified. BE-013 ขคจ dev approved/M1 re-enter หลัง pairedcutover; sharedDDL/deploy และ SA-Q8 releasecutover ยัง hold.
- Phase13 A+atomicT1 direction approved เท่านั้น; preview/replace/concurrency/replay/unknown-outcome/receipt/recovery/attendance-room defaults/runtime owner/§27.6 ง exact schema ยังรอยืนยันและไม่รัน.
- Carry QA8/16: live menu upstream/periodJSON/liveDB/deepJSON E2E, SA-Q14 MenuID401..404/422/permissions/Type/Role และ TP-D2 auth masterdata ยังรอ owner/DevOps; SEC-03 proof ไม่แทน liveQA.
- §27.5 schema/DDL/backfill/owner holds คง; archive:2717 ไม่ใช่ approval. SEC-01/SEC-02 production hold ไม่เปลี่ยน. ไม่มี SQL execute แม้ disposableDB/shared migration/release/deploy หรือ risk acceptance.

## Change Log

- 2026-10-11 — Round17 BE-012 SQL-only ⚠️ Partial: actual1966bytes/hash/exactstatement/field comparison inspected, no new defect; fulltask pending และ gates คง. ไม่มี SQL/build/test/git/code/design/plan writes; closed QA/review rounds preserved.

Back-links: plan/index.md · ../index.md