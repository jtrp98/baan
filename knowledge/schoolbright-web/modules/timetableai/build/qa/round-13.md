# timetableai — QA Round 13 — UX-011, UX-012

> qa-engineer · solo · Phase 12 · date 2026-10-09 จากผู้ใช้ jtrp98 09/10/2026 · ตรวจ draft deliverable เท่านั้น
> Evidence paths resolve ใต้ C:/src/schoolbright/knowledge/timetableai. ใช้ templates/qa-round.md; budget ≤10KB.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | carry open — qa/round-9.md:87–97; auth fixtures/full suite ล้ม; gate4 parked; นอก scope รอบนี้ |

## Round 13

**Status:** ✅ Verified

ผ่านเกณฑ์ร่างเอกสารของ task; ไม่มีการรับรอง implementation/business runtime หรือ human approval. Status verified ใช้กับ deliverable draft ตาม plan task Acceptance เท่านั้น.

### Checks run

| Check | Command | Result |
|---|---|---|
| document inspection | อ่าน task, REQ-017/018/014 / DES-014/015/011, contract ส่วนเกี่ยวข้อง, artifact ครบ และ review/round-12.md | inspected — AC evidence ด้านล่าง; ไม่ใช่ executable app test |
| metadata/registry | PowerShell Get-Content -Raw + Contains/section checks | inspected: draft, Signed by/on ว่าง, Sign-off ว่าง, 7 sections และ README entry ครบ |
| full Data Model read | Get-Content -Raw design/data-model.md; Get-FileHash SHA256 | อ่านเต็ม; 23214 chars; AFB17E1DCDF0862310CD1EBB0982EB77B7F12273140024C1635CC1B7C4D50E86; ไม่มี code/schema write |
| typecheck | npm run type-check | NOT RUN — docs-only; QA9 result ไม่ใช่ current pass |
| lint | npm run lint | NOT RUN — ไม่มี app change ใน scope |
| build | npm run build | NOT RUN — docs-only; carry QA9 SWC environment blocker |
| tests | npm test / dotnet test | NOT RUN — draft scope; carry QA9 1040 passed/6 failed ไม่ถือ green |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| UX-011 | verified — draft deliverable | plan/ux-011.md:28; uxui/UX-011-teaching-caps-and-homeroom.md:10; uxui/README.md:25; AC evidence ด้านล่าง |
| UX-012 | verified — draft deliverable | plan/ux-012.md:28; uxui/UX-012-generate-precheck.md:10; uxui/README.md:26; AC evidence ด้านล่าง |

### Feature QA flows

ไม่ใช่ Feature QA/runtime flow; test-plan/index.md มี TP-001 Phase1 เท่านั้น ไม่มี TP ของ Phase12. ตารางนี้ตรวจว่าร่างอธิบาย AC ครบสำหรับคนตรวจ.

| Task / AC / contract | Result | Evidence |
|---|---|---|
| UX-011 / AC-041 | ✅ Verified draft | uxui/UX-011-teaching-caps-and-homeroom.md:15 (15–17,32,76–77,80) — จำนวนเต็มชั่วโมง;บังคับความละเอียดนาทีจริง;continuitycap ยังคาบ |
| UX-011 / AC-042 | ✅ Verified draft | uxui/UX-011-teaching-caps-and-homeroom.md:15 (15,34,47,80) — hardcap วัน/สัปดาห์ รวม 7 วัน/S1/link นับครั้งเดียว |
| UX-011 / AC-043/AC-043a | ✅ Verified draft | uxui/UX-011-teaching-caps-and-homeroom.md:16 (16,19–21,76) — รายคน>รวมต่อ field;0 รายคน fallback;เลิก exemption |
| UX-011 / AC-043b | ✅ Verified draft | uxui/UX-011-teaching-caps-and-homeroom.md:78 (78,96) — M1 ไม่แปลงเพดานคาบเดิม; transition/cutoverconditional |
| UX-011 / AC-044/BR-44 | ✅ Verified draft | uxui/UX-011-teaching-caps-and-homeroom.md:25 (25–29,79) — TClassMember3 บทบาท read-only;flag จำกัดไม่เพิ่มสิทธิ์/ไม่ยกเว้น cap |
| UX-011 / AC-045 | ✅ Verified draft | uxui/UX-011-teaching-caps-and-homeroom.md:79 (79) — ไม่มี flag ใช้ TPlanCourseTeacher ของแผน;ไม่อ่าน assignment เดิม |
| UX-011 / AC-046/AC-046a | ✅ Verified draft | uxui/UX-011-teaching-caps-and-homeroom.md:27 (27,78–79) — แก้ flag รายครู/H1;ไม่ migrate ข้อมูลเดิม |
| UX-012 / AC-033 | ✅ Verified draft | uxui/UX-012-generate-precheck.md:14 (14–18,27,71,74) — ทุก subcourse×แผน×ห้องก่อน solver;2 เหตุ+RoomCaretakerdetail;runtime shortcut |
| UX-012 / AC-034 | ✅ Verified draft | uxui/UX-012-generate-precheck.md:21 (21–26,52,72) — แม้ 1blocker ปิด Generate/Regenerate;เปิดทุก rowscrollable |
| UX-012 / AC-035 | ✅ Verified draft | uxui/UX-012-generate-precheck.md:29 (29–33,73,79,84–85) — recheck คงกริด/ล็อก;failed/stale ไม่ปลด;warnings ไม่บล็อก |

### Review findings

review/round-12.md:38–39,41 PASS ตรวจซ้ำ; BR42 สามบทบาทยืนยันแล้ว ไม่เปิดถามซ้ำ;ไม่มี defect ใหม่.

### Data Model check

§27.6(ข)/(ค)/(จ): nMaxTeachingHoursPerDay/Week int0, individualkeys, jHomeroomRestrictedTeachers=[{nTeacherID}] H1, retainedlegacy fields/assignment+M1 ตรง UX011:76–79,96. UX012 blockers/warnings เป็น clientstate ไม่ persist/ไม่มี DDL ตาม DES-011:20–21;ไม่เพิ่ม enum/schema. Owner/schema/breaking ยัง conditional.
เปรียบเทียบ fields/semantics ที่ draft กล่าวถึงกับ Data Model ซึ่งอ่านครบและ hash เดิมในรอบนี้; ไม่มี changed entity/schema code ใน scope. ไม่ใช้การตรวจเอกสารนี้รับรอง implementation fields หรือ owner schema approval.

### Issues Found (defect packet)

ไม่มี Critical/Important ใหม่ที่ทำ draft Acceptance ไม่ผ่าน; ไม่สร้าง QA id ซ้ำให้ finding เดิม. Minor ของ review ไม่บล็อก draft และคง route → backlog. Phase12 security marker มีอยู่แล้ว คงเดิม; ไม่ปิด security gate.

## Unverified Behaviour — undeployed phases

- Phase12: ยังไม่รัน hours solver/VR12/13/teachereligibility/precheck/recheck/shortcut สิทธิ์;คนเซ็น UX011/012 และ owner schema/cutover พร้อมก่อน FE025/026.
- Carry qa/round-9.md:99–106 ทั้งหมด: Phase8 live BE-010/DB, DDL 4 tables/backfill AC-028/NULL legacy/paired cutover AC-065/SA-Q8 และ manual 7 routes ยังไม่รัน; FE-021 blocked (QA-006, gate4 parked) และ SWC build environment blocked ตาม :24–28,96 ไม่เปลี่ยน verdict.
- Multi-tab/school-switch/stale HTTP ทุก locale, keyboard/focus/contrast/responsive/extreme text และ browser/manual E2E ไม่ตรวจ; document inspection ไม่ใช่ runtime pass.
- UX-007 approved subset jtrp98 09/10/2026 คงเดิม; precise copy/details/retry/UX-005/full sign-off ยัง hold. UX-008..013 Signed by/on และ Sign-off ว่างตาม metadata check; verified draft ไม่ใช่ sign-off/released.
- Carry QA8 ผ่าน QA9: live menu upstream/period JSON/DB/deep JSON ไม่ E2E; SA-Q14 MenuID401..404/422/permissions/Type/Role และ TP-D2/auth master data รอ DevOps/owner. ไม่ใช้ SEC-03 proof รับรอง UX/runtime รอบนี้.
- data-model.md §27.5/§27.6 และ plan Waiting on Human #4/#5: schema/owner/breaking/cutover/T1/default/transaction ยังรอยืนยัน; archive:2717 ไม่มีคำตอบจริง ใช้แทน approval ไม่ได้. SEC-01/02 production hold + DDL/shared deploy gate คงเดิม; QA ไม่ปิด finding/รับความเสี่ยงแทนคน.

## Change Log

- 2026-10-09 — Round 13 — UX-011, UX-012 verified เฉพาะ draft deliverable; ไม่รัน app checks/runtime และไม่สร้าง sign-off; carry QA9/issues/owner/deploy holds.

Back-links: plan/index.md · ../index.md
