# timetableai — QA Round 10 — UX-008

> qa-engineer · solo · Phase 9 · date 2026-10-09 จากผู้ใช้ jtrp98 09/10/2026 · ตรวจ draft deliverable เท่านั้น
> Evidence paths resolve ใต้ C:/src/schoolbright/knowledge/timetableai. ใช้ templates/qa-round.md; budget ≤10KB.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | carry open — qa/round-9.md:87–97; auth fixtures/full suite ล้ม; gate4 parked; นอก scope รอบนี้ |

## Round 10

**Status:** ✅ Verified

ผ่านเกณฑ์ร่างเอกสารของ task; ไม่มีการรับรอง implementation/business runtime หรือ human approval. Status verified ใช้กับ deliverable draft ตาม plan task Acceptance เท่านั้น.

### Checks run

| Check | Command | Result |
|---|---|---|
| document inspection | อ่าน task, REQ-013 / DES-010, contract ส่วนเกี่ยวข้อง, artifact ครบ และ review/round-12.md | inspected — AC evidence ด้านล่าง; ไม่ใช่ executable app test |
| metadata/registry | PowerShell Get-Content -Raw + Contains/section checks | inspected: draft, Signed by/on ว่าง, Sign-off ว่าง, 7 sections และ README entry ครบ |
| full Data Model read | Get-Content -Raw design/data-model.md; Get-FileHash SHA256 | อ่านเต็ม; 23214 chars; AFB17E1DCDF0862310CD1EBB0982EB77B7F12273140024C1635CC1B7C4D50E86; ไม่มี code/schema write |
| typecheck | npm run type-check | NOT RUN — docs-only; QA9 result ไม่ใช่ current pass |
| lint | npm run lint | NOT RUN — ไม่มี app change ใน scope |
| build | npm run build | NOT RUN — docs-only; carry QA9 SWC environment blocker |
| tests | npm test / dotnet test | NOT RUN — draft scope; carry QA9 1040 passed/6 failed ไม่ถือ green |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| UX-008 | verified — draft deliverable | plan/ux-008.md:28; uxui/UX-008-copy-across-term-year.md:10; uxui/README.md:22; AC evidence ด้านล่าง |

### Feature QA flows

ไม่ใช่ Feature QA/runtime flow; test-plan/index.md มี TP-001 Phase1 เท่านั้น ไม่มี TP ของ Phase9. ตารางนี้ตรวจว่าร่างอธิบาย AC ครบสำหรับคนตรวจ.

| Task / AC / contract | Result | Evidence |
|---|---|---|
| UX-008 / AC-029 | ✅ Verified draft | uxui/UX-008-copy-across-term-year.md:12 (12–24,77) — 5 จุดเข้าและปี/เทอมต้นทาง-ปลายทางอิสระจาก Terms จริง |
| UX-008 / AC-030 | ✅ Verified draft | uxui/UX-008-copy-across-term-year.md:14 (14–18,23,78) — scope ต่อหน้า; all เลือก 0..ทุกตารางรวม inactive; เตือนลบปลายทางเมื่อเลือก 0 |
| UX-008 / AC-031 | ✅ Verified draft | uxui/UX-008-copy-across-term-year.md:25 (25–35,77–79) — Preview/Confirm/Apply; ยืนยัน overwrite และ partial แยก; invalidate token เมื่อ context เปลี่ยน |
| UX-008 / AC-032 | ✅ Verified draft | uxui/UX-008-copy-across-term-year.md:35 (35–39,89) — ผล Apply status1 จริงและปลายทางเป็นข้อมูลอิสระ |
| UX-008 / AC-050 | ✅ Verified draft | uxui/UX-008-copy-across-term-year.md:30 (30,79,86) — missing-template/dependents บล็อกทั้งคำสั่ง แสดงทุกชื่อ |
| UX-008 / AC-051 | ✅ Verified draft | uxui/UX-008-copy-across-term-year.md:29 (29,85,89) — unmatched ทั้งหมดพร้อมยืนยัน partial และรายการ skipped/reason จริง |

### Review findings

review/round-12.md:35,41 PASS ตรวจซ้ำกับเนื้อหา; ไม่มี open finding ใน scope.

### Data Model check

§27.3 snapshot ตรง artifact:89; §27.5 sTermID เป็น string/Terms ไม่เดา; §27.6 hours/H1/SubjectRoom/RoomSetting consume แบบ conditional ที่ artifact:78,95 กับ DES-010:124–126. Copy ไม่มี DDL ของตนเอง; ไม่รับรอง schema/entity code ของ BE-011/012/013.
เปรียบเทียบ fields/semantics ที่ draft กล่าวถึงกับ Data Model ซึ่งอ่านครบและ hash เดิมในรอบนี้; ไม่มี changed entity/schema code ใน scope. ไม่ใช้การตรวจเอกสารนี้รับรอง implementation fields หรือ owner schema approval.

### Issues Found (defect packet)

ไม่มี Critical/Important ใหม่ที่ทำ draft Acceptance ไม่ผ่าน; ไม่สร้าง QA id ซ้ำให้ finding เดิม. Minor ของ review ไม่บล็อก draft และคง route → backlog. Phase9 security marker มีอยู่แล้ว คงเดิม; ไม่ปิด security gate.

## Unverified Behaviour — undeployed phases

- Phase9: ยังไม่รัน Preview/Apply transaction, rollback, mapping/token race, permissions หรือ live Copy; คนต้องเซ็น UX-008 ก่อน FE-022 และ owner schema ที่ consume ต้องพร้อม.
- Carry qa/round-9.md:99–106 ทั้งหมด: Phase8 live BE-010/DB, DDL 4 tables/backfill AC-028/NULL legacy/paired cutover AC-065/SA-Q8 และ manual 7 routes ยังไม่รัน; FE-021 blocked (QA-006, gate4 parked) และ SWC build environment blocked ตาม :24–28,96 ไม่เปลี่ยน verdict.
- Multi-tab/school-switch/stale HTTP ทุก locale, keyboard/focus/contrast/responsive/extreme text และ browser/manual E2E ไม่ตรวจ; document inspection ไม่ใช่ runtime pass.
- UX-007 approved subset jtrp98 09/10/2026 คงเดิม; precise copy/details/retry/UX-005/full sign-off ยัง hold. UX-008..013 Signed by/on และ Sign-off ว่างตาม metadata check; verified draft ไม่ใช่ sign-off/released.
- Carry QA8 ผ่าน QA9: live menu upstream/period JSON/DB/deep JSON ไม่ E2E; SA-Q14 MenuID401..404/422/permissions/Type/Role และ TP-D2/auth master data รอ DevOps/owner. ไม่ใช้ SEC-03 proof รับรอง UX/runtime รอบนี้.
- data-model.md §27.5/§27.6 และ plan Waiting on Human #4/#5: schema/owner/breaking/cutover/T1/default/transaction ยังรอยืนยัน; archive:2717 ไม่มีคำตอบจริง ใช้แทน approval ไม่ได้. SEC-01/02 production hold + DDL/shared deploy gate คงเดิม; QA ไม่ปิด finding/รับความเสี่ยงแทนคน.

## Change Log

- 2026-10-09 — Round 10 — UX-008 verified เฉพาะ draft deliverable; ไม่รัน app checks/runtime และไม่สร้าง sign-off; carry QA9/issues/owner/deploy holds.

Back-links: plan/index.md · ../index.md
