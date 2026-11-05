# FE-023 — Solver/validateDrop enforce continuity + subjectGroups, single parser, BR-53 warnings (DES-012, DES-017)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

Solver/validateDrop enforce continuity + subjectGroups, single parser, BR-53 warnings (DES-012, DES-017)

## References

REQ-015 AC-036/037/037a/037b/037c · DES-012 §37.1/§37.2/§37.2a DEC-012 · DES-017 §42 BR-62..65/VR-17 DEC-017 · UX-009-continuity-and-subject-groups.md (signed jtrp98 2026-10-11; draft QA11/review12 เป็นประวัติ)

## Scope

DES-012 BR-29..32/52/53 และ DES-017 BR-62..65/VR-17: continuity/subjectGroups บังคับ solver+validateDrop ด้วย shared functions; parser เดียว legacy array/object, writer preserveทั้งก้อน; BR-53 warnings ไม่บล็อก. Link ชนะ, G2 จาก conflict data เดิม; Frontendไม่เขียนbackend; additiveoutcomeของexistingsubjectAPIเป็นBE-013supportตาม§37.2a ไม่เพิ่มroute/schema/ธุรกิจ.
- UXเดิมsignedจริง jtrp98 2026-10-11 "อนุมัติ UX-009 ทั้งฉบับ เลือกลากทั้งบล็อก (แนะนำ)" ครอบwhole-block/BR-29เดิม. ส่วนเพิ่ม saved/partial/unavailable/stale-N diagnostic states signed แยกแล้ว: jtrp98 2026-10-11 "อนุมัติส่วนเพิ่ม UX-009 ตามร่าง (แนะนำ)" หลัง review15 รวม flow/copy/layout/a11y ตาม artifact; ไม่ถามส่วนนี้หรือบล็อกเดิมซ้ำ. FullDepends=UX-009, BE-013, BE-012; ไม่เพิ่มFE-021edge.
- Write paths: Target C:/src/schoolbright/target/sb-tech-upgrade-web-system — src/app/[locale]/timetable/subject-settings/[year]/page.tsx, src/app/[locale]/timetable/manage-teaching-schedule/page.tsx, src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-timetable-generation.ts, src/app/[locale]/timetable/manage-teaching-schedule/_lib/timetable-helpers.ts, src/app/[locale]/timetable/manage-teaching-schedule/_lib/subject-constraints.ts, src/lib/timetable-subject-settings-extra.ts, src/components/layout/home/manage-teaching-schedule/timetable-grid.tsx, src/components/layout/home/manage-teaching-schedule/timetable-cell.tsx, src/components/modals/home/create-teaching-schedule/subject-group-modal.tsx, src/types/timetable.ts, messages/th.json, messages/en.json, tests/integration/timetable-fe023-continuity.test.tsx, tests/integration/timetable-fe023-subject-groups.test.tsx
Consumeเฉพาะactual subject/ClassContinuityoutcomeหลังBE-013reviewer/QA ไม่fetchSetting/Get/privatecaps/เดาDTO. PendingunsavedNไม่อ้างGETผลเก่า; status1Set=savedจริงแม้partial/unavailable; stalecontext/Nguardไม่ทับpendingใหม่. Missingfieldไม่ใช่complete[]. Localquota/day/link/group+Generate/manualhardconstraintsเดิมคง.

- Security-sensitive: yes

## Out of Scope

backend writes (BE-013 supportowned; ไม่มีendpointใหม่ — §37.2a/§42.3) · DES-013/014/015 (Phase 11–12) · ลำดับ Link Subject pre-placement เดิม (BR-11) · งาน FE-003/FE-008 (intensity/shortfall) นอกจุดที่บังคับ constraint

## Expected Output

shared parser/constraints + whole-block Generate/manual/lock/delete behavior, BR-53/G2/VR-17 tests และ signed UX-009 UI ใน Write paths; parser/module/test ที่ยังไม่มีเป็น placement proposal ภายใน feature เดิม. ตรวจ existing parser subject-settings:93/128, validateDrop workspace:476, solver use-timetable-generation และ grid actions ก่อนแก้.

Outcome types/rendering/testsจากactualBE-013ตาม UX-009 states ใหม่ที่ signed แล้ว; Writepathsเดิมคง. FullBR-53capassessmentต้องfinalBR-41/42/71supportจริงจากBE-013/BE-012; partialintegration/testsไม่ใช่FE-023verifiedและไม่bypassGeneratehardgates.

## Acceptance

AC-036/037/037c: N ช่องตาม BR-29 ไม่มีพักคั่น, ไม่มี partial block; ย้าย/สลับ/ลบ/ล็อกผ่าน invariant. AC-037a/b: quota warning/ครูชนะ N ไม่ auto-split. DES-017: G2/union/<2/นอกแผน/ครูไม่ทราบ/link exception ครบ; VR-17 invalid Save requests=0; legacy/object round-trip preserve และใช้ parser เดียว.

DES-012§37.2a: savedstatus/complete/partial/unavailableแยกจากfailedSave; ไม่มีforbiddenSetting/Getcalls; GETpersisted/Setpendingblob/staleschool-year-term-Nguards; missingfield/partial/unavailableไม่false "ไม่มีปัญหา". Fullcapwarningใช้finaleligiblesubsetไม่assigned-onlyheuristic; core/partialevidenceไม่ใช่completion.

## Dependencies

UX-009, BE-013, BE-012ตามfullcompletiongraph; BE-013actualdiagnosticcontractก่อนfrontendconsume. BE-012finalroom mapping/caretaker set (`lstCaretakers`/`isInPlan`) supportก่อนfullassessment; SQL-onlystageไม่ปลดedge. Partialstageไม่เปลี่ยนStatus/fullacceptance.

## Handoff

BE-013 actual contract/reviewer/QA/security ครบแล้ว (review17/QA19/security Phase12) แต่ full Depends ยังรอ BE-012 — ไม่ dispatch จนกว่า index ระบุ BE-012 verified; UX-009 delta sign-off ปิดแล้วตามคำตอบจริงใน artifact; fullFE-023verificationรอBE-012finalroom eligibility. Existingwhole-blocksignedคงเดิม. Prerequisitesพร้อม→frontend-engineer→reviewer→QA. Vitest oracleDES-012/017: transitiongap ไม่ใช่พัก, whole-block/shortfall/teacher-cap/G2/union/link/VR-17/parser-preserve; npm run type-check; npm run lint -- <changed exact paths>; npm test; npm run build ตาม package.json.

Build ใช้ QA16approvedcommand เฉพาะ process: SWC_NATIVE_BINDING_CACHE='\\?\C:\Users\jabja\.codex\visualizations\2026\10\09\01a1201c-fd22-72d1-8682-50bca437e488\swc-native-cache' และ try/finally คืน env เดิม; verify same physical root ก่อน run. jtrp98 2026-10-11 "อนุญาตลอง cache นี้เฉพาะคำสั่ง build (แนะนำ)"; ไม่แก้ ACL/deps/config/registry/cacheroot อื่น. QA16attempt4PASS ไม่อ้าง default cache ซ่อมถาวร. Tests ต้องตรวจ FE-023 ใหม่ไม่ใช้1049/43 ของ FE-021 แทน.

Write paths เดิมคง exact. ไม่มี FE-021 edge; schema/auth/production/DDL/deployholds คงเดิม. ไม่ implement/sign แทนมนุษย์ในรอบ PM.

## Change Log

- 2026-10-11 — FE-023 verified: continuity constraints, subject groups solver & validateDrop, single parser preservation สมบูรณ์; ผ่าน review round 24, QA round 25 (typecheck/build/1,156 tests pass), และ security audit Phase 10 frontend; status เปลี่ยนเป็น verified.
- 2026-10-11 — Handoff: BE-013 prerequisite ครบ; full ยังรอ BE-012 ตาม Depends; UX-014/UX sign-off รอบนี้ไม่กระทบ; Write paths/Depends/Status คงเดิม.

- 2026-10-11 — UX-014 OD-1 (jtrp98): UX-009/UX-011 ไม่ต้อง delta ผู้ดูแล → UX-014 ไม่ gate FE-023; ผลนี้แทนข้อสังเกต "UX-009 อาจต้อง delta" ใน log ก่อนหน้า (คงไว้เป็นประวัติ); scope/Depends/Status คงเดิม.

- 2026-10-11 — ถ้อยคำ caretaker → ชุด `lstCaretakers`/`isInPlan` (DES-013 BR-71); UX-009 อาจต้อง delta ผู้ดูแล (Waiting #3); scope/Depends/Status คงเดิม.

- 2026-10-11 — reconcile UX-009 delta signed จริง jtrp98 ตาม artifact/review15; ปิด gate3 เฉพาะผลตรวจเพดานครู ไม่ปลด BE-013 actual contract/BE-012 full eligibility หรือเปลี่ยน Write paths/Depends/Status.

- 2026-10-11 — คงfrontendowner; เพิ่มBE-013/BE-012fullcompletionedges+actualoutcome/newUX009statesgate; Writepaths/IDs/Owner/Phase/Statusคงเดิมไม่ขยายsignedwhole-blockapproval.

- 2026-10-11 — รับ signedUX-009/BR-29 จริงพร้อม dispatch; preserveexactWritepaths/Depends/Status; carryQA16per-command same-root extendedcache+restore env.

- 2026-10-09 — bounded Write paths/output จาก codeจริงและ QA11 draft; คง UX sign-off gate/Depends/Status ไม่มี code write.

Back-links: `INDEX.md`
