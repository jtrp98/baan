# timetableai — QA Round 11 — UX-009

> qa-engineer · solo · Phase 10 · date 2026-10-09 จากผู้ใช้ jtrp98 09/10/2026 · ตรวจ draft deliverable เท่านั้น
> Evidence paths resolve ใต้ C:/src/schoolbright/knowledge/timetableai. ใช้ templates/qa-round.md; budget ≤10KB.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | carry open — qa/round-9.md:87–97; auth fixtures/full suite ล้ม; gate4 parked; นอก scope รอบนี้ |

## Round 11

**Status:** ✅ Verified

ผ่านเกณฑ์ร่างเอกสารของ task; ไม่มีการรับรอง implementation/business runtime หรือ human approval. Status verified ใช้กับ deliverable draft ตาม plan task Acceptance เท่านั้น.

### Checks run

| Check | Command | Result |
|---|---|---|
| document inspection | อ่าน task, REQ-015 / DES-012/017, contract ส่วนเกี่ยวข้อง, artifact ครบ และ review/round-12.md | inspected — AC evidence ด้านล่าง; ไม่ใช่ executable app test |
| metadata/registry | PowerShell Get-Content -Raw + Contains/section checks | inspected: draft, Signed by/on ว่าง, Sign-off ว่าง, 7 sections และ README entry ครบ |
| full Data Model read | Get-Content -Raw design/data-model.md; Get-FileHash SHA256 | อ่านเต็ม; 23214 chars; AFB17E1DCDF0862310CD1EBB0982EB77B7F12273140024C1635CC1B7C4D50E86; ไม่มี code/schema write |
| typecheck | npm run type-check | NOT RUN — docs-only; QA9 result ไม่ใช่ current pass |
| lint | npm run lint | NOT RUN — ไม่มี app change ใน scope |
| build | npm run build | NOT RUN — docs-only; carry QA9 SWC environment blocker |
| tests | npm test / dotnet test | NOT RUN — draft scope; carry QA9 1040 passed/6 failed ไม่ถือ green |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| UX-009 | verified — draft deliverable | plan/ux-009.md:30; uxui/UX-009-continuity-and-subject-groups.md:10; uxui/README.md:23; AC evidence ด้านล่าง |

### Feature QA flows

ไม่ใช่ Feature QA/runtime flow; test-plan/index.md มี TP-001 Phase1 เท่านั้น ไม่มี TP ของ Phase10. ตารางนี้ตรวจว่าร่างอธิบาย AC ครบสำหรับคนตรวจ.

| Task / AC / contract | Result | Evidence |
|---|---|---|
| UX-009 / AC-036 | ✅ Verified draft | uxui/UX-009-continuity-and-subject-groups.md:23 (23–28,75) — บล็อก N ช่องวันเดียว ไม่มีพัก/lunch; target Generate/วางมือ |
| UX-009 / AC-037 | ✅ Verified draft | uxui/UX-009-continuity-and-subject-groups.md:27 (27–30,44–45,75,87) — ปฏิเสธย้าย/สลับที่ทำลายบล็อก คงกริด/คืน focus |
| UX-009 / AC-037a | ✅ Verified draft | uxui/UX-009-continuity-and-subject-groups.md:16 (16,76,82–85) — quota ไม่ลงตัวเตือนให้แก้; ไม่ auto-split; BR53 ทั้ง 4 ไม่บล็อก |
| UX-009 / AC-037b | ✅ Verified draft | uxui/UX-009-continuity-and-subject-groups.md:35 (35,76,83) — เพดานครูชนะ ไม่หด N; วางไม่ได้เป็น shortfall |
| UX-009 / AC-037c | ✅ Verified draft | uxui/UX-009-continuity-and-subject-groups.md:25 (25–26,58,75) — ลบ/ล็อกทั้งบล็อก |
| UX-009 / DES-017 G2/VR-17 | ✅ Verified draft | uxui/UX-009-continuity-and-subject-groups.md:18 (18–20,77–78,87–90) — S1+legacyNULL; same-code teacher exception/unknown; link ชนะ; frontend validation+preserveblob |

### Review findings

review:REV-016 ⚠️ Partial — Minor → backlog ตาม review/round-12.md:7–20; artifact:75 คำว่าเวลาติดกันจริงยังอาจกำกวมเรื่องช่องว่างเปลี่ยนคาบ ตาม DES-012:12. Flow:28/44 ไม่มีพักคั่น ไม่พบคำสั่งปฏิเสธช่องว่าง จึงไม่บล็อก draft; UX/PM รับ copy refinement.

### Data Model check

§27.6:107 REQ015 ไม่มี DDL; blob เดิม Tbl_Setting.jSetSubjectsClassContinuity รับ legacy array/object. artifact:20,78 คง continuityRows/subjectGroups;ตรง DES-012:21–24/DES-017:25,34. ไม่สร้าง server validator หรือ schema ใหม่; solver/parser runtime ยังไม่ตรวจ.
เปรียบเทียบ fields/semantics ที่ draft กล่าวถึงกับ Data Model ซึ่งอ่านครบและ hash เดิมในรอบนี้; ไม่มี changed entity/schema code ใน scope. ไม่ใช้การตรวจเอกสารนี้รับรอง implementation fields หรือ owner schema approval.

### Issues Found (defect packet)

ไม่มี Critical/Important ใหม่ที่ทำ draft Acceptance ไม่ผ่าน; ไม่สร้าง QA id ซ้ำให้ finding เดิม. Minor ของ review ไม่บล็อก draft และคง route → backlog. Phase10 security marker ไม่เพิ่ม: task Security-sensitive=no และไม่ได้สร้าง auth/input contract ใหม่; ไม่ปิด security gate.

## Unverified Behaviour — undeployed phases

- Phase10: solver/validateDrop/whole-block keyboard และ BR53 warnings ยังไม่รัน; คนเซ็น UX-009 interaction/copy ก่อน FE-023. ไม่รับรองว่า implementation บังคับ continuity/groups แล้ว.
- Carry qa/round-9.md:99–106 ทั้งหมด: Phase8 live BE-010/DB, DDL 4 tables/backfill AC-028/NULL legacy/paired cutover AC-065/SA-Q8 และ manual 7 routes ยังไม่รัน; FE-021 blocked (QA-006, gate4 parked) และ SWC build environment blocked ตาม :24–28,96 ไม่เปลี่ยน verdict.
- Multi-tab/school-switch/stale HTTP ทุก locale, keyboard/focus/contrast/responsive/extreme text และ browser/manual E2E ไม่ตรวจ; document inspection ไม่ใช่ runtime pass.
- UX-007 approved subset jtrp98 09/10/2026 คงเดิม; precise copy/details/retry/UX-005/full sign-off ยัง hold. UX-008..013 Signed by/on และ Sign-off ว่างตาม metadata check; verified draft ไม่ใช่ sign-off/released.
- Carry QA8 ผ่าน QA9: live menu upstream/period JSON/DB/deep JSON ไม่ E2E; SA-Q14 MenuID401..404/422/permissions/Type/Role และ TP-D2/auth master data รอ DevOps/owner. ไม่ใช้ SEC-03 proof รับรอง UX/runtime รอบนี้.
- data-model.md §27.5/§27.6 และ plan Waiting on Human #4/#5: schema/owner/breaking/cutover/T1/default/transaction ยังรอยืนยัน; archive:2717 ไม่มีคำตอบจริง ใช้แทน approval ไม่ได้. SEC-01/02 production hold + DDL/shared deploy gate คงเดิม; QA ไม่ปิด finding/รับความเสี่ยงแทนคน.

## Change Log

- 2026-10-09 — Round 11 — UX-009 verified เฉพาะ draft deliverable; ไม่รัน app checks/runtime และไม่สร้าง sign-off; carry QA9/issues/owner/deploy holds.

Back-links: plan/index.md · ../index.md
