# timetableai — QA Round 14 — UX-013

> qa-engineer · solo · Phase 13 · date 2026-10-09 จากผู้ใช้ jtrp98 09/10/2026 · ตรวจ draft deliverable เท่านั้น
> Evidence paths resolve ใต้ C:/src/schoolbright/knowledge/timetableai. ใช้ templates/qa-round.md; budget ≤10KB.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | carry open — qa/round-9.md:87–97; auth fixtures/full suite ล้ม; gate4 parked; นอก scope รอบนี้ |

## Round 14

**Status:** ✅ Verified

ผ่านเกณฑ์ร่างเอกสารของ task; ไม่มีการรับรอง implementation/business runtime หรือ human approval. Status verified ใช้กับ deliverable draft ตาม plan task Acceptance เท่านั้น.

### Checks run

| Check | Command | Result |
|---|---|---|
| document inspection | อ่าน task, REQ-019 / DES-016 §41.4a, contract ส่วนเกี่ยวข้อง, artifact ครบ และ review/round-12.md | inspected — AC evidence ด้านล่าง; ไม่ใช่ executable app test |
| metadata/registry | PowerShell Get-Content -Raw + Contains/section checks | inspected: draft, Signed by/on ว่าง, Sign-off ว่าง, 7 sections และ README entry ครบ |
| full Data Model read | Get-Content -Raw design/data-model.md; Get-FileHash SHA256 | อ่านเต็ม; 23214 chars; AFB17E1DCDF0862310CD1EBB0982EB77B7F12273140024C1635CC1B7C4D50E86; ไม่มี code/schema write |
| typecheck | npm run type-check | NOT RUN — docs-only; QA9 result ไม่ใช่ current pass |
| lint | npm run lint | NOT RUN — ไม่มี app change ใน scope |
| build | npm run build | NOT RUN — docs-only; carry QA9 SWC environment blocker |
| tests | npm test / dotnet test | NOT RUN — draft scope; carry QA9 1040 passed/6 failed ไม่ถือ green |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| UX-013 | verified — draft deliverable | plan/ux-013.md:28; uxui/UX-013-academic-push.md:10; uxui/README.md:27; AC evidence ด้านล่าง |

### Feature QA flows

ไม่ใช่ Feature QA/runtime flow; test-plan/index.md มี TP-001 Phase1 เท่านั้น ไม่มี TP ของ Phase13. ตารางนี้ตรวจว่าร่างอธิบาย AC ครบสำหรับคนตรวจ.

| Task / AC / contract | Result | Evidence |
|---|---|---|
| UX-013 / AC-047 | ✅ Verified draft | uxui/UX-013-academic-push.md:12 (12–18,79) — entry[year];active ล่าสุดเป็น gate; snapshot ทางเดียวไม่ read-back |
| UX-013 / AC-048 | ✅ Verified draft | uxui/UX-013-academic-push.md:30 (30–39,82,91–100) — ผลจริงครบรายคู่/invalidrows;receipt;unknown แยก;record-onlyrecovery |
| UX-013 / AC-049 | ✅ Verified draft | uxui/UX-013-academic-push.md:24 (24–28,38,80,93) — เตือนแทนที่ทุกครั้งรวม retry;purePreview/guard ยัง proposal |
| UX-013 / AC-052 | ✅ Verified draft | uxui/UX-013-academic-push.md:77 (77,81) — calculate=true ยืนยันธุรกิจ; mapping/default/null รอ owner ต่อ field |
| UX-013 / AC-053 | ✅ Verified draft | uxui/UX-013-academic-push.md:17 (17,22–23,79,92) — หลายชุดไม่จำกัด;คู่ซ้ำ NotSendable ไม่เลือกเอง คู่อื่นต่อได้ |

### Review findings

review/round-12.md:40–41 PASS ตรวจซ้ำ; DES016:65–114 concreteT1 เป็น proposal ชัด ไม่ถือ source/unsigneddraft เป็น ownerapproval;ไม่มี defect ใหม่.

### Data Model check

§27.6(ง) Tbl_TimetableAcademicSync key(nTimetableID,nClassID,sTermID), nStatus1..4, jScheduleIDs/jDetail ตรง artifact:34,39,77,82,98–99. NotSendable/unknown เป็น UI ผล/การรับรู้ ไม่เพิ่ม persistedenum;Sent อ้าง receipt จริง. §27.6(ก) sRoomID snapshot เป็น dependency;TRoom↔Tclasses/plane/day/default ยัง ownerproposal DES-016:78–94. ไม่รับรอง T1endpoint/transaction/schema จริง.
เปรียบเทียบ fields/semantics ที่ draft กล่าวถึงกับ Data Model ซึ่งอ่านครบและ hash เดิมในรอบนี้; ไม่มี changed entity/schema code ใน scope. ไม่ใช้การตรวจเอกสารนี้รับรอง implementation fields หรือ owner schema approval.

### Issues Found (defect packet)

ไม่มี Critical/Important ใหม่ที่ทำ draft Acceptance ไม่ผ่าน; ไม่สร้าง QA id ซ้ำให้ finding เดิม. Minor ของ review ไม่บล็อก draft และคง route → backlog. Phase13 security marker มีอยู่แล้ว คงเดิม; ไม่ปิด security gate.

## Unverified Behaviour — undeployed phases

- Carry QA10..13: Phase9 Copy/token/transaction, Phase10 solver/whole-block/groups, Phase11 mapping/capacity/caretaker/Academic usage และ Phase12 caps/eligibility/precheck/recheck ยังไม่รันตาม qa/round-10.md..round-13.md; ทุก draft ยัง unsigned. review:REV-016 Minor → backlog คงเดิมตาม qa/round-11.md/review/round-12.md.
- Phase13: T1purePreview/atomicreplace/concurrency/receipt/replay/recordrecovery/defaultattendance/roommapping ทั้งหมดไม่รัน; owner ยังไม่ยืนยัน. UX013 ยัง unsigned และไม่เปิดส่งจริงจาก QA verdict.
- Carry qa/round-9.md:99–106 ทั้งหมด: Phase8 live BE-010/DB, DDL 4 tables/backfill AC-028/NULL legacy/paired cutover AC-065/SA-Q8 และ manual 7 routes ยังไม่รัน; FE-021 blocked (QA-006, gate4 parked) และ SWC build environment blocked ตาม :24–28,96 ไม่เปลี่ยน verdict.
- Multi-tab/school-switch/stale HTTP ทุก locale, keyboard/focus/contrast/responsive/extreme text และ browser/manual E2E ไม่ตรวจ; document inspection ไม่ใช่ runtime pass.
- UX-007 approved subset jtrp98 09/10/2026 คงเดิม; precise copy/details/retry/UX-005/full sign-off ยัง hold. UX-008..013 Signed by/on และ Sign-off ว่างตาม metadata check; verified draft ไม่ใช่ sign-off/released.
- Carry QA8 ผ่าน QA9: live menu upstream/period JSON/DB/deep JSON ไม่ E2E; SA-Q14 MenuID401..404/422/permissions/Type/Role และ TP-D2/auth master data รอ DevOps/owner. ไม่ใช้ SEC-03 proof รับรอง UX/runtime รอบนี้.
- data-model.md §27.5/§27.6 และ plan Waiting on Human #4/#5: schema/owner/breaking/cutover/T1/default/transaction ยังรอยืนยัน; archive:2717 ไม่มีคำตอบจริง ใช้แทน approval ไม่ได้. SEC-01/02 production hold + DDL/shared deploy gate คงเดิม; QA ไม่ปิด finding/รับความเสี่ยงแทนคน.

## Change Log

- 2026-10-09 — Round 14 — UX-013 verified เฉพาะ draft deliverable; ไม่รัน app checks/runtime และไม่สร้าง sign-off; carry QA9/issues/owner/deploy holds.

Back-links: plan/index.md · ../index.md
