# timetableai — Test Plan: teaching settings และ derived continuity warnings

> เขียนโดย test-planner · กลยุทธ์ร่วม ไม่ใช่ผลตรวจจริง · วันที่ผู้ใช้ 2026-10-11

## Trigger

cross-task + security — BE-013 ส่ง teacher settings/derived result ให้ FE-025/FE-023 ภายใต้สิทธิ์ต่างกัน; ความหมาย 0 ของเพดานชั่วโมงต่างจาก BR-9 และ response ที่ล้าหลังต้องไม่ทับค่าที่แก้.

## Affected

Tasks: BE-013, FE-023, FE-025; BE-012 เป็น prerequisite ของ full room eligibility ไม่รับรองจาก SQL artifact. REQ-015/017/018/021; DES-012 §37.2a, DES-013 BR-71, DES-014/015/018; UX-009 signed base + warning delta signed jtrp98 2026-10-11 และ UX-011 signed. ไม่เพิ่ม release feature/task/AC หรือเปลี่ยน verdict.

## Test Framework

มีจริง: backend net10.0/xUnit/MVC.Testing/EF InMemory; `dotnet build AITimeTableBackend.sln`, `dotnet test AITimeTableBackend.sln`. Frontend Vitest ผ่าน `npm test`, TypeScript `npm run type-check`, ESLint `npm run lint`, Next build `npm run build`. ใช้ in-memory/HTTP factory เดิม ไม่มี live DB. Test-planner ไม่รัน checks/tests; user API/browser/manual และ paired cutover ยังต้องหลักฐานภายหลัง. Build frontend ใช้ process-only SWC cache root ตาม QA16/plan เท่านั้น.

ตัวเลขใน Given/When เป็นตัวอย่าง fixture เพื่อทดสอบ ไม่ใช่ค่าของโรงเรียนจริงหรือค่าเริ่มต้นธุรกิจใหม่.

## Cases

### TP-002 — VR-12 ที่ HTTP binding จริง
- **Level:** API
- **REQ/AC:** REQ-017 AC-041 / DES-014 VR-12
- **Given:** รวม/รายคนมีค่าชั่วโมงเต็มที่บันทึกไว้แล้ว.
- **When:** POST Setting/Set ด้วย malformed/noninteger/negative หรือ day>week เมื่อทั้งคู่>0 รวมกรณี decimal/string/null ที่ผิด contract.
- **Then:** status0 InvalidTeachingCap, ไม่เขียน ไม่ปัด/ตัดเศษ/กลายเป็น0; valid0/positive round-trip ได้. แยก RequestSetting error translation จาก endpoint อื่น.

### TP-003 — H1 ไม่รับครูต่างโรงเรียน
- **Level:** API
- **REQ/AC:** REQ-018 AC-046 / DES-015 VR-13; REQ-021 AC-060..062
- **Given:** H1 มี teacherของโรงเรียนA และ authenticatedtenantA.
- **When:** ส่งครูไม่มีจริงหรือของBใน H1.
- **Then:** status0 InvalidHomeroomRestriction และไม่เขียน; valid H1 เก็บ/คืน [{nTeacherID}] ตรง contract ไม่สร้างคู่ห้อง/ครูขึ้นเอง.

### TP-004 — สามบทบาทและหน่วยเทอม
- **Level:** integration
- **REQ/AC:** REQ-018 AC-044..046a / DES-015 BR-41/42/44
- **Given:** TClassMember หัวหน้า/ผู้ช่วย1/ผู้ช่วย2 ในเทอมเป้าหมาย พร้อมข้อมูลต่างเทอม/ปี/โรงเรียนและ wizard assignment เดิม.
- **When:** Setting/Get ส่ง homeroomResponsibility สำหรับการ์ด Settings และ GetTeachersByClass ส่งข้อมูล generator; FE-025 คำนวณ eligible rooms ต่อวิชา/แผน/ห้อง.
- **Then:** ชุดห้องสามบทบาท/scoped predicates ของทั้งสอง carrier เท่ากัน; projection Settings มีทุก selectable teacher รวมคนไม่มี flag/assignment, sort/dedupe ตาม DES-015 §40.3a และไม่มี private details. Read สำเร็จไม่มีห้องเป็น [] ต่อครู; roster/responsibility อ่านล้มหรือ invalid เป็น unavailable/list=null ไม่ false empty; request ไม่ส่ง/null/ว่างเทอมยัง status0 TermRequired ตาม VR-9 ก่อนอ่าน setting/projection; legacy setting row NULL fallback เฉพาะ request เทอม valid แล้วและ projection ใช้ scope request, ไม่มี Setting row ยังคง defaults พร้อม projection จริง. Settings/roster/responsibility required loads ไม่ครบให้จบ Spinner/ดูส่วนที่สำเร็จแต่ Save ปิดตาม signed UX-011; stale/malformed/missing projection ไม่ทับ edits. ไม่มี flag ใช้ทุกห้องของแผนที่มีสิทธิ์วิชา; มี flag ใช้ intersection; missing valid row=ไม่มีห้อง ไม่ปลด flag. หลัง paired dev cutover ไม่อ่าน wizard/ธงเก่าและคง columns/data.

### TP-005 — ความหมาย 0 แยกตามหน่วย
- **Level:** unit + integration
- **REQ/AC:** REQ-017 AC-043/043a; REQ-015 AC-037b / DES-012 BR-9, DES-014 BR-39/40
- **Given:** ชั่วโมงรายคน/วัน=0, รวม/วัน=5; /สัปดาห์รายคนไม่กำหนดและรวมมีค่า. แถว BR-9 ของคนเดียวกันมีคาบต่อเนื่อง=0 และรวมมี finite cap.
- **When:** คำนวณ caps และ ContinuityExceedsTeacherCap.
- **Then:** ชั่วโมง0ใช้ค่ารวมของฟิลด์นั้น; BR-9 แถวรายคน0เป็น unlimited และไม่มีแถวรายคนจึงใช้รวม. ไม่ใช้ hours หรือ ×60 ใน warning BR-9; วางบล็อกยังผ่าน BR-52 จริง.

### TP-006 — 422 อ่าน outcome แต่ไม่ได้ raw settings
- **Level:** API
- **REQ/AC:** REQ-021 AC-060..062; REQ-015 AC-037b / DES-012 §37.2a, DES-018
- **Given:** authenticated userมี Read/Write422 อย่างเดียว และ scoped term ของโรงเรียนตน.
- **When:** SubjectSettings/ClassContinuity Get/Set, Setting/Get และ request ต่างtenant/ปี/เทอม.
- **Then:** subject APIs ตาม policy เดิม; Setting/Get ยัง403; auth/term/claims validation คงเดิม. Assessmentไม่เผย teacher IDs/caps/H1/config/exception/JWT; ไม่มี assessment อ้าง scopeผิดหรือ Saveสำเร็จจาก auth failure. อีกชุดผู้มี Read403-only: Setting/Get HTTP200/status1 พร้อม scoped responsibility ทุก selectable teacher และ GetTeachersByClass ยัง403; Read402-only อ่าน Setting/Get ไม่ได้, 401ตาม policy เดิม. Frontend Settings ไม่เรียก protected class endpoint; ไม่ส่ง transient projection เข้า Set. อ่านข้ามtenant/year/term/ครูต่างโรงเรียนไม่ได้ และ projectionไม่เผยชื่อครู/รูป/email/subjects/assignment/wizard ตาม §40.3a.

### TP-007 — pending N และ blob verbatim
- **Level:** API + integration
- **REQ/AC:** REQ-015 AC-036/037b / DES-012 §37.2a, DES-017 compatibility
- **Given:** legacy array หรือ object มี subjectGroups และ unknown extensions พร้อม persisted N เดิม.
- **When:** Set ส่ง N ใหม่ แล้วอ่านสอง Get actions.
- **Then:** Set assessment มาจาก blob ที่เพิ่งบันทึก; Getจาก persisted blob. ทั้งสี่ response คง fieldsเดิมเพิ่ม outcome; storage/GET blob verbatim ไม่ parse-normalize/reserialize/drop unknown keys. Malformed projection ไม่เป็น safe complete[].

### TP-008 — final eligibility ต่างจาก assigned list
- **Level:** unit + integration
- **REQ/AC:** REQ-015 AC-037b; REQ-018 AC-044/045 / DES-012 BR-52/53, DES-013 BR-71
- **Given:** assigned teachers มีทั้งผ่าน/ไม่ผ่าน H1 และ caretaker filter; final eligible subset ที่รู้จริงไม่ว่าง.
- **When:** ทุกคนใน final subset finitecap<N หรือมีหนึ่งคน unlimited/cap>=N.
- **Then:** เตือนเฉพาะกรณีทุก final eligible cap<N; ไม่ใช้ assigned list แทน. known eligible-empty ไม่ใช่ cap warning. ข้อมูลครูต่างplan/class/term/tenantที่รหัสวิชาเหมือนกันไม่รวมข้ามหน่วย.

### TP-009 — coverage และข้อมูลที่ไม่ทราบ
- **Level:** integration + API
- **REQ/AC:** REQ-015 AC-037b / DES-012 §37.2a
- **Given:** มี context ตรวจครบ/ไม่ครบ, H1/homeroom/room supportยังไม่พร้อม หรืออ่านล้ม, invalid cap/blob หรือ courseไม่พบ.
- **When:** ประเมินผลและส่ง response.
- **Then:** complete เฉพาะทุก contextตรวจครบ; partialมีครบและไม่ครบ; unavailableไม่มีที่ตรวจได้. lstUnassessed reasonตามcontractพร้อมscopeที่ยืนยันได้; empty warningsเมื่อpartial/unavailableไม่ใช่ไม่มีปัญหา. ไม่สร้าง room query/model ที่ยังไม่อนุมัติเพื่อให้ testผ่าน.

### TP-010 — บันทึกสำเร็จกับ diagnostic failure
- **Level:** API + integration
- **REQ/AC:** REQ-015 AC-037b / DES-012 §37.2a
- **Given:** primary Set สำเร็จ แต่ helper/supportอ่านล้มภายหลัง; อีกกรณี primary persistenceล้ม.
- **When:** รับ response ใน editor.
- **Then:** กรณีแรก status1/nID+partial/unavailable และแจ้งบันทึกแล้ว; ไม่บล็อกหรือ re-saveอัตโนมัติ. กรณีสองใช้ primary Save error เดิม ไม่ปลอม success. Diagnostic readไม่เป็น prerequisite Save.

### TP-011 — response เก่าไม่ทับ input/context ใหม่
- **Level:** integration (frontend)
- **REQ/AC:** REQ-015 AC-037b / DES-012 §37.2a; UX-009 delta signed jtrp98 2026-10-11
- **Given:** GET/Setกำลังรอ แล้วผู้ใช้แก้Nหรือสลับschool/year/term.
- **When:** responseเก่ามาถึง.
- **Then:** ไม่ทับ input/คำเตือนของ contextใหม่; pendingNไม่ใช้ GETผลเก่าเป็นผลของค่าใหม่. ไม่มีassessment/malformedresponseไม่อ้างcomplete[]. ผลหลังSaveอยู่live regionและแยกsuccessจากwarning; no private config fetch. ต้อง signed delta ก่อน FE implement.

### TP-012 — นาทีจริงและ Link Subject
- **Level:** unit + integration (frontend)
- **REQ/AC:** REQ-017 AC-041/042/043a / DES-014 BR-37/38/39
- **Given:** คาบ40/50/60นาที, external same-termรวมlegacyNULLตามS1, Linkครูเดียวหลายห้อง และเพดานเต็มชั่วโมง.
- **When:** Generate/validateDrop/add/swap เพิ่มภาระข้ามวันหรือข้ามเพดานสัปดาห์.
- **Then:** ใช้นาทีจริงและshared function, Linkเดียวกันนับครั้งเดียว, daily/weeklyเทียบถูก; คาบไม่มีstart/endวางไม่ได้เมื่อครูมีเพดานไม่ใช่0นาที. สรุปชั่วโมงและนาทีตาม signed UX-011; BR-9/continuityยังจริง.

### TP-013 — M1 และ paired release
- **Level:** integration + manual release checklist
- **REQ/AC:** REQ-017 AC-043b; REQ-018 AC-046a / DES-014/015 SA-Q8
- **Given:** มีค่าเดิมหน่วยคาบและ wizard/ธงเก่า.
- **When:** ตรวจ paired dev implementation และวางแผนเปิดใช้จริง.
- **Then:** ไม่แปลง/backfill; ค่าใหม่default0จนตั้งใหม่; columns/dataเดิมคง. Beforecutoverคงพฤติกรรมเดิมทั้งชุด; releaseต้องคู่ BE-013/FE-025/DES-011 ไม่ผสม units/eligibility; dev tests ไม่ใช่ permission DDL/sharedDB/deploy/cutover.

### TP-014 — full completion แยกจาก partial transport
- **Level:** API + integration + manual readiness checklist
- **REQ/AC:** REQ-015 AC-037b; REQ-016 AC-038..040 / DES-012/013
- **Given:** BE-013 safe diagnostic contractผ่าน แต่ BE-012มีเพียง SQL artifactหรือ live room supportยังhold.
- **When:** reviewer/QAประเมิน FE-023 full BR-53 และ prerequisites.
- **Then:** ไม่อ้าง FE-023 verifiedจาก fixture/partial transport; full final eligibilityใช้room mapping/caretakerที่พร้อมจริง. SQLไม่ได้executeจากteststrategy; SA-Q5/10/modulemapping/DDL/release/securityคงhold.

## Unresolved Open Questions

| ID | ช่องว่างของพฤติกรรม | ส่งไปที่ |
|---|---|---|
| SA-Q5 / SA-Q10 / §27.6 ก | live TRoom/Academic room mapping/read/active และmodulemapping schemaยังไม่มีownerconfirmation | SA/เจ้าของ DB/Academic; full BE-012/FE-023 hold |

| SA-Q8 / production holds | paired cutover/shared DDL/security/deployยังไม่อนุมัติ | release/DB/security owners; dev testsไม่ปลด |

## Change Log

- 2026-10-11 — TP-004 ใช้ DES-015 §40.3a correction: VR-9 missing request term เดิม ไม่อ่าน projection; แยก valid-request legacy setting NULL fallback. ไม่รันตรวจ/ไม่เปลี่ยน approval/Status.

- 2026-10-11 — amend TP-004/006 ตาม DES-015 §40.3a Settings responsibility carrier/403-only boundary/signed UX-011 required-load; UX-009 delta signed จริงจึงปิดคำถามนั้น. ตัวเลข fixture ไม่ใช่ค่าจริง; ไม่รันตรวจ/ไม่แก้ plan Status.

- 2026-10-11 — เพิ่ม shared cross-task/security cases TP-002..014 จาก actualcontracts/PMscope/manifests; ไม่รันchecksไม่อ้างPASS, ไม่เปลี่ยนrelease/task/Status/approval. tp-001 legacyคงเดิม.

Back-links: `../../../../build/plan/INDEX.md` · `../../INDEX.md`