# FE-025 — Caps in real teaching minutes + homeroom-restricted eligibility, single shared function (DES-014 §39, DES-015 §40)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

Caps in real teaching minutes + homeroom-restricted eligibility, single shared function (DES-014 §39, DES-015 §40)

## References

REQ-017, AC-041, AC-042, AC-043, AC-043a, AC-043b, REQ-018, AC-044, AC-045, AC-046, AC-046a, DES-014, DEC-014, DES-015 §40.3/§40.3a, DEC-015 · DES-018 §43.2a · UX-011 signed jtrp98 2026-10-11

## Scope

DES-014: ฟังก์ชันเดียวคืน `{maxMinutesPerDay, maxMinutesPerWeek}` (= ชั่วโมง × 60 หลัง BR-39 — 2 ระดับต่อฟิลด์: รายคน > 0 → รวม > 0 → ไม่จำกัด; ตั้งรายคนเฉพาะ /วัน → /สัปดาห์ใช้ค่ารวม — AC-043a) ใช้ร่วม solver + validateDrop (แทน `getEffectiveMaxPeriod` EVD-056 และ `ranges.length >= maxPeriod` EVD-057) · นับ **นาทีสอนจริง** (end − start ตาม columnMetas — ตัวเดียวกับ BR-17) ของช่องครูในกริด + ตารางอื่นบันทึกแล้วในขอบเขต conflict เดียวกับ BR-17 (BR-38; Link Subject หลายห้องนับครั้งเดียว) · เทียบ `Σนาที ≤ ชั่วโมง × 60` ทั้ง /วัน และ /สัปดาห์ · ข้อความปฏิเสธ `teacherMaxHoursPerDay`/`teacherMaxHoursPerWeek` · ช่องไม่มีเวลาจริง (columnMeta ขาด start/end) → วางไม่ได้สำหรับครูที่มีเพดาน — ห้ามนับ 0 นาที · UI ตาม UX-011 (จำนวนเต็มชั่วโมง, เลิก checkbox ยกเว้น, การ์ด `TClassMember` อ่านอย่างเดียว, tooltip D43 แก้ตาม BR-44) · DES-015: `getEligibleClasses` = BR-41 (ครูไม่มี flag → ทุกห้องเรียนของ**แผน**ที่มีชื่อใน `TPlanCourseTeacher` — สิทธิ์วิชา+ห้องในตัว) ∩ BR-42 (ครูมี flag → เฉพาะห้องจาก `lstRestrictedClasses` ของ BE-013) — **จุดเดียว**ที่ solver/validateDrop/AddCourseModal/DES-011 ใช้ (R5); flag จำกัดอย่างเดียว (BR-44); ครู flag ไม่พบห้องที่รับผิดชอบ → ไม่มีห้องที่สอนได้ (เข้า BR-27 ของ FE-026 — ไม่ใช่สอนได้ทุกห้อง); BR-17 กันครูซ้อนเวลาคงเดิม (นับข้ามทุกตารางของขอบเขต conflict) · **cutover รุ่นเดียวกับ BE-013** (SA-Q8 — ห้ามผสมหน่วย; ห้ามตัด `lstClassTaught` ก่อน BR-41 ทำงานในรุ่นเดียวกับ FE-026)

ใช้ FE-021 บริบทโรงเรียน/ปี/เทอมที่สร้างแล้ว ไม่สร้าง term selector/state อีกชุด; ส่ง/รีเซ็ต context ตาม DES-009

UX-011 signed จริง jtrp98 2026-10-11: "อนุมัติ UX-011 ทั้งฉบับ สรุปเป็นชั่วโมงและนาที (แนะนำ)"; FE-021 verifiedQA16. BE-013 prerequisite ครบแล้ว: review17 PASS, QA19 verified, `../../modules/timetableai/build/security.md` Phase12/BE-013 ไม่พบ finding ใหม่ → frontend อ่าน real DTO/JSON/lstRestrictedClasses จาก source จริง ไม่เดา wirecontract; Depends BE-013/FE-021/UX-011 ครบ พร้อม dispatch. SA-Q8holdrelease ไม่ holddev เมื่อ prerequisite พร้อม.

request เทอมยังต้องผ่าน DES-009 VR-9; legacy setting row NULL ไม่ใช่ missing request term. การ์ด Settings ใช้ actual Setting/Get.data.homeroomResponsibility ตาม DES-015 §40.3a หลัง BE-013 reviewer/QA/security; join nTeacherID กับ School/GetTeachers เดิมเพื่อชื่อครู. 403-only ต้องใช้งานได้โดยไม่เรียก GetTeachersByClass ที่ต้อง 402/401 หรือขยาย policy. ห้องอ่านอย่างเดียว/ไม่ mock; successful empty แสดง signed empty states แต่ unavailable/missing/malformed/wrong scope เป็น required-load failure. Settings/teacher roster/responsibility โหลดไม่ครบ → ส่วนที่สำเร็จยังดูได้, Spinner จบ, Save ปิดจน reload สำเร็จตาม UX-011. ไม่ส่ง projection/room pairs กลับ Set, ไม่ทับ edits/H1/hours ด้วย default; ไม่ตั้ง global Generate readiness ให้หน้าอื่น.

- Write paths: Target C:/src/schoolbright/target/sb-tech-upgrade-web-system — src/app/[locale]/timetable/settings/[year]/page.tsx, src/components/modals/home/create-teaching-schedule/set-individually-modal.tsx, src/app/[locale]/timetable/manage-teaching-schedule/page.tsx, src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-timetable-generation.ts, src/app/[locale]/timetable/manage-teaching-schedule/_lib/timetable-helpers.ts, src/app/[locale]/timetable/manage-teaching-schedule/_lib/teaching-caps.ts (new), src/components/layout/home/manage-teaching-schedule/add-course-modal.tsx, src/types/timetable.ts, messages/th.json, messages/en.json, tests/app/timetable/teaching-caps.test.ts (new), tests/integration/timetable-fe025-teaching-settings.test.tsx (new), tests/integration/timetable-fe025-eligibility.test.tsx (new), src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-select-curriculum.ts, tests/integration/timetable-401-silent.test.tsx, tests/integration/timetable-401-silent-settings.test.tsx, tests/integration/timetable-fe021-term-context.test.tsx
- Security-sensitive: yes
- Write-path alignment 2026-10-11 (ไม่เปลี่ยน scope): `use-select-curriculum.ts` = ส่วน cutover คู่ BE-013 (GetTeachersByClass ไม่คืน `lstClassTaught` แล้ว; SA-Q8 ห้ามผสมแหล่งสิทธิ์) แก้เฉพาะ 3 จุด — เลิกกรองครูด้วย `lstClassTaught` · ส่ง plan classes (id/name จาก `plan.lstClasses`) เป็นอาร์กิวเมนต์ที่ 3 ของ `getEligibleClasses` · type ครูใช้ `lstRestrictedClasses`. 3 test files = fixture `setting/get` ตาม DES-015 §40.3a (field ชั่วโมง + `homeroomResponsibility` ที่ valid) + testid `max-hours-per-day-input` ใน fe021; คงเจตนา assertion เดิม

## Out of Scope

ตรรกะ DES-012/DES-017 (FE-023) นอกจุด eligibility ร่วม (แต่ BR-52 ของ FE-023 ต้องยังจริง — เพดานครูชนะ N) · DES-013 (FE-024) · DES-018/DES-022 · backend

## Expected Output

Code/tests ใน exactpaths: real BE-013 hour/H1types+signedUX-011 settings/individualmodal/read-onlyTClassMembercard/load/errors; singleeffectiveminute-cap/BR-41+42eligibility ใช้ solver/validateDrop/AddCourseModal และ existingDES-011 precheck source เดียว. Scope ไม่เพิ่ม precheckpanelFE-026. ตรวจ backendactualoutputs ก่อนต่อ; helper/test ใหม่เป็น boundedplacementproposal ตาม_lib/testspatterns.

## Acceptance

AC-041: เพดาน/วัน-สัปดาห์บังคับเป็นชั่วโมงสอนจริง (นาที) ทั้ง Generate และวางมือ
AC-042: เพดาน/สัปดาห์เป็น hard constraint เทียบเท่า /วัน
AC-043/AC-043a: รายคน > รวม 2 ระดับ; ตั้งเฉพาะ /วัน → /สัปดาห์ใช้ค่ารวม
AC-043b: ค่าเดิมหน่วยคาบไม่ถูกแปลง/ไม่ถูกอ่านหลัง cutover (หมดผล — ตามธุรกิจ)
AC-044: ครูที่มี flag วางสอนห้องอื่นไม่ได้ทั้ง Generate/วางมือ (แม้มีสิทธิ์วิชา)
AC-045: ครูไม่มี flag สอนได้ทุกห้องของแผนที่มีชื่อใน `TPlanCourseTeacher`
AC-046: ตั้ง/แก้รายครูได้อิสระ (จุดตั้ง = BE-013/UI)

DES-015 §40.3a / signed UX-011: integration 403-only ใช้การ์ดจาก Setting/Get จริง; all selectable teachers/สามบทบาท/เทอม/empty roster/empty ต่อครูอ่านออก. Unavailable/null/field missing/ผิดรูป/wrong context ไม่ปลอม empty หรือ Save สำเร็จ; response เก่าไม่ทับ context/edits. ไม่มี 402-only dependency หรือ forbidden GetTeachersByClass call จาก Settings; Save ไม่ส่ง transient projection.

## Dependencies

BE-013, FE-021, UX-011

## Handoff

vitest: นาทีจริงข้าม template (ช่วงทับบางส่วน), 2 ระดับ + AC-043 a, AC-043 b (ค่าเดิมไม่ถูกอ่าน), BR-41/42 จาก `lstRestrictedClasses` (ครบ 3 บทบาท/ต่อเทอม), BR-44 (flag จำกัดอย่างเดียว — ไม่ให้สิทธิ์), ช่องไม่มีเวลา = วางไม่ได้ · regression ของ FE-023 (BR-52 ยังจริง) + ของ DES-011 เดิม · typecheck/scopedlint/fulltests/build; build ใช้ same-rootextended-lengthprocesscache/try-finally ตาม QA16 และ FE-023 Handoff ไม่มี ACL/deps/configchanges · `[manual-E2E]` · ยืนยัน paths/symbols/currentsource ก่อนแก้; หลัง BE-013 verified จึงเริ่ม frontend ตาม real contract
revert คู่กับ BE-013 — cutover รุ่นเดียว (SA-Q8); ห้าม revert บางส่วน (ห้ามสภาพหน่วยผสม) · หลัง cutover โรงเรียนที่เคยพึ่ง wizard ได้สิทธิ์ตาม BR-41 ทันที (อาจกว้างขึ้น) จนกว่าตั้ง flag ใหม่ — ต้องแจ้ง
ส่งต่อ reviewer

## Change Log

- 2026-10-11 — Write-path alignment จากรายงาน engineer (PM ตรวจโค้ดจริง: use-select-curriculum.ts :97–142 ยังใช้ `lstClassTaught`/เรียก `getEligibleClasses` 2 อาร์กิวเมนต์; BE GetTeachersByClass :2325–2330 ไม่คืน `lstClassTaught`; fixture 3 ไฟล์ไม่มี `homeroomResponsibility`): เพิ่ม 4 exact paths. Goal/Scope/Acceptance/Depends/Phase/Owner/Release Scope/Status คงเดิม; ผลรอบแรกยังไม่ผ่าน review/QA.

- 2026-10-11 — BE-013 review17/QA19/security ครบ (ตรวจไฟล์จริง) → FE-025 พร้อม dispatch; หลัง FE-025 review/QA แล้ว security ขอบเขต frontend Phase12; Write paths/Depends/Status คงเดิม.

- 2026-10-11 — reconcile DES-015 §40.3a correction: request term mandatory/VR-9 เดิมก่อน projection; legacy NULL setting row fallback เฉพาะ valid request. ไม่มี ContextNotSelected state/permission/primary response change; IDs/paths/Depends/Status คงเดิม.

- 2026-10-11 — ใช้ actual Setting/Get responsibility projection ตาม DES-015 §40.3a ภายใต้สิทธิ์เดิมและ signed UX-011; เพิ่ม required-load/card acceptance, Write paths/Depends/Status/paired release hold คงเดิม.

- 2026-10-11 — boundedexactfrontendWritepaths/output จาก source+modal จริง, UX-011 signed/FE-021 verified; backend ก่อน frontend/SA-Q8release hold คงเดิมไม่มี implementation.

Back-links: `INDEX.md`
