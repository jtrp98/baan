# timetableai — QA Round 12 — UX-010

> qa-engineer · solo · Phase 11 · date 2026-10-09 จากผู้ใช้ jtrp98 09/10/2026 · ตรวจ draft deliverable เท่านั้น
> Evidence paths resolve ใต้ C:/src/schoolbright/knowledge/timetableai. ใช้ templates/qa-round.md; budget ≤10KB.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | carry open — qa/round-9.md:87–97; auth fixtures/full suite ล้ม; gate4 parked; นอก scope รอบนี้ |

## Round 12

**Status:** ✅ Verified

ผ่านเกณฑ์ร่างเอกสารของ task; ไม่มีการรับรอง implementation/business runtime หรือ human approval. Status verified ใช้กับ deliverable draft ตาม plan task Acceptance เท่านั้น.

### Checks run

| Check | Command | Result |
|---|---|---|
| document inspection | อ่าน task, REQ-016 / DES-013, contract ส่วนเกี่ยวข้อง, artifact ครบ และ review/round-12.md | inspected — AC evidence ด้านล่าง; ไม่ใช่ executable app test |
| metadata/registry | PowerShell Get-Content -Raw + Contains/section checks | inspected: draft, Signed by/on ว่าง, Sign-off ว่าง, 7 sections และ README entry ครบ |
| full Data Model read | Get-Content -Raw design/data-model.md; Get-FileHash SHA256 | อ่านเต็ม; 23214 chars; AFB17E1DCDF0862310CD1EBB0982EB77B7F12273140024C1635CC1B7C4D50E86; ไม่มี code/schema write |
| typecheck | npm run type-check | NOT RUN — docs-only; QA9 result ไม่ใช่ current pass |
| lint | npm run lint | NOT RUN — ไม่มี app change ใน scope |
| build | npm run build | NOT RUN — docs-only; carry QA9 SWC environment blocker |
| tests | npm test / dotnet test | NOT RUN — draft scope; carry QA9 1040 passed/6 failed ไม่ถือ green |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| UX-010 | verified — draft deliverable | plan/ux-010.md:30; uxui/UX-010-subject-rooms.md:10; uxui/README.md:24; AC evidence ด้านล่าง |

### Feature QA flows

ไม่ใช่ Feature QA/runtime flow; test-plan/index.md มี TP-001 Phase1 เท่านั้น ไม่มี TP ของ Phase11. ตารางนี้ตรวจว่าร่างอธิบาย AC ครบสำหรับคนตรวจ.

| Task / AC / contract | Result | Evidence |
|---|---|---|
| UX-010 / AC-038 | ✅ Verified draft | uxui/UX-010-subject-rooms.md:15 (15–17,25,72–75) — 1 วิชา:1TRoom; stringkey; ไม่มีรายเซลล์/pool |
| UX-010 / AC-038a | ✅ Verified draft | uxui/UX-010-subject-rooms.md:18 (18–22,72,75–76,84) — capacity จำนวนเต็มต่อหน่วย/ผู้ดูแล; C2 editor conditional; C1′ read-only |
| UX-010 / AC-039 | ✅ Verified draft | uxui/UX-010-subject-rooms.md:26 (26–32,76,85–87) — นับต่างห้องพร้อมกันตามเวลาจริง รวม academic; showall source; fail-closed |
| UX-010 / AC-040 | ✅ Verified draft | uxui/UX-010-subject-rooms.md:74 (74,87) — ไม่มี mapping ไม่ถูกบังคับห้อง; manual ยังได้เมื่อ academic โหลดล้ม |

### Review findings

review/round-12.md:37,41 PASS ตรวจซ้ำ; actual save แยก 2endpoint ตาม artifact:75 ไม่อ้าง atomic ข้ามชุด;ไม่มี defect ใหม่.

### Data Model check

เทียบ §27.6(ก)/(ก 2): sCourseCode/sRoomID string, nCapacity≥1 หรือ NULL และ nCaretakerTeacherIDNULL, school/year/sTermID scope, snapshot sRoomID/sRoomName ตรง artifact:72–77/84. C2 Tbl_RoomSetting/editor กับ C1′ noSet แยกชัด;ไม่ cast nClassroomID. GateSA-Q5/9/10 ยังเปิด;ไม่มี entity/schema code เปลี่ยนให้รับรอง.
เปรียบเทียบ fields/semantics ที่ draft กล่าวถึงกับ Data Model ซึ่งอ่านครบและ hash เดิมในรอบนี้; ไม่มี changed entity/schema code ใน scope. ไม่ใช้การตรวจเอกสารนี้รับรอง implementation fields หรือ owner schema approval.

### Issues Found (defect packet)

ไม่มี Critical/Important ใหม่ที่ทำ draft Acceptance ไม่ผ่าน; ไม่สร้าง QA id ซ้ำให้ finding เดิม. Minor ของ review ไม่บล็อก draft และคง route → backlog. Phase11 security marker มีอยู่แล้ว คงเดิม; ไม่ปิด security gate.

## Unverified Behaviour — undeployed phases

- Phase11: registry/VR10/11/15/room mapping/capacity/caretaker/liveAcademicUsage ยังไม่รัน; owner เลือก C2/C1′/X1/X2+schema จริงและคนเซ็น UX-010 ก่อน dependent frontend.
- Carry qa/round-9.md:99–106 ทั้งหมด: Phase8 live BE-010/DB, DDL 4 tables/backfill AC-028/NULL legacy/paired cutover AC-065/SA-Q8 และ manual 7 routes ยังไม่รัน; FE-021 blocked (QA-006, gate4 parked) และ SWC build environment blocked ตาม :24–28,96 ไม่เปลี่ยน verdict.
- Multi-tab/school-switch/stale HTTP ทุก locale, keyboard/focus/contrast/responsive/extreme text และ browser/manual E2E ไม่ตรวจ; document inspection ไม่ใช่ runtime pass.
- UX-007 approved subset jtrp98 09/10/2026 คงเดิม; precise copy/details/retry/UX-005/full sign-off ยัง hold. UX-008..013 Signed by/on และ Sign-off ว่างตาม metadata check; verified draft ไม่ใช่ sign-off/released.
- Carry QA8 ผ่าน QA9: live menu upstream/period JSON/DB/deep JSON ไม่ E2E; SA-Q14 MenuID401..404/422/permissions/Type/Role และ TP-D2/auth master data รอ DevOps/owner. ไม่ใช้ SEC-03 proof รับรอง UX/runtime รอบนี้.
- data-model.md §27.5/§27.6 และ plan Waiting on Human #4/#5: schema/owner/breaking/cutover/T1/default/transaction ยังรอยืนยัน; archive:2717 ไม่มีคำตอบจริง ใช้แทน approval ไม่ได้. SEC-01/02 production hold + DDL/shared deploy gate คงเดิม; QA ไม่ปิด finding/รับความเสี่ยงแทนคน.

## Change Log

- 2026-10-09 — Round 12 — UX-010 verified เฉพาะ draft deliverable; ไม่รัน app checks/runtime และไม่สร้าง sign-off; carry QA9/issues/owner/deploy holds.

Back-links: plan/index.md · ../index.md
