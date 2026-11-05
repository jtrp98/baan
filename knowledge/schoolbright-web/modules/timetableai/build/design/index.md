# timetableai — Design Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `system-analyst` เท่านั้น · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `des-*.md` / `data-model.md` ที่ packet/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · ตาราง DES ด้านล่างคือรายชื่อไฟล์ contract ทั้งหมด

## Feature-by-Feature Feasibility

| Feature / REQ | Verdict | เหตุผล / หลักฐาน (`path:line`) |
|---|---|---|
| REQ | คำวินิจฉัย | เหตุผลที่ตัดสินได้ (หลักฐาน) |
| REQ-012 รองรับเทอมทั้งโมดูล | **feasible-with-risk** | หน่วยขอบเขตเป็นคอลัมน์ `nYear` บนตารางราก + derive ผ่าน id แ |
| REQ-013 คัดลอกกติกา/ตารางข้ามเ | **feasible-with-risk · blocked | write path ใหม่ล้วน แต่ปริมาณเล็กและ backend CRUD sync (DES- |
| REQ | คำวินิจฉัย | เหตุผลที่ตัดสินได้ (หลักฐาน) |
| REQ-013 (5 จุดเข้า) | **feasible-with-risk** | DES-010 BR-66: mapping room copy คงเดิม; C1′ capacity/ผู้ดูแลไม่ copy ทุก scope ตาม jtrp98 2026-10-11; term/mapping schema gates ยัง hold |
| REQ-014 บล็อก Generate | **feasible** | จุดตัดวิชาเงียบจุดเดียว (EVD-042) · แหล่งสิทธิ์ BR-41 อ่านได |
| REQ-015 คาบต่อเนื่อง + กลุ่มวิ | **feasible-with-risk** | DES-012 §37.2a existing subject/ClassContinuity Get/Set เพิ่ม derived warning assessment ตาม jtrp98 2026-10-11; blob/auth unchanged, final eligible support ต้องรู้จริงก่อน complete; PM bound backend owner/dependency ใน existing task IDs + UX-009 partial/unavailable states ก่อน FE-023 integration |
| REQ-016 ห้อง + ความจุ + ผู้ดูแล | **feasible-with-risk (high)** | 2026-10-11 TClass/TClassSetting ยืนยัน (OQ-43/SA-Q25 ปิด); ตารางลูก TClassSettingCaretaker+DTO lstCaretakers ยืนยัน jtrp98 2026-10-11 (gate #2 รูปปิด); OQ-45(จ) ชุดว่าง=ตามความจุ+เตือน ไม่บังคับ Link; BR-71 ชุด/isInPlan (TPlanCourseTeacher.cs:12–21); live TClass/SA-Q10/(ก)/DDL/release/security hold |
| REQ-017 เพดานชั่วโมง | **feasible-with-risk; dev approved** | jtrp98 2026-10-11 ยืนยันสอง int DEFAULT 0/M1 เฉพาะ dev; DES-014/§27.6 ขจ; paired FE-025 cutover hold release |
| REQ-018 ครูประจำชั้นจำกัดห้อง | **feasible-with-risk; dev approved** | H1/dev+BR-42สามบทบาทยืนยันแล้ว; signed UX-011/UX-009 deltaจริง 2026-10-11; DES-015 §40.3a additive Setting/Get scoped responsibility card dataสำหรับ403/401; VR-9 mandatory request termก่อนprojection, legacy rowNULLเฉพาะvalid term; PM bound BE-013ก่อนFE-025; pairedcutover/DDL/release/securityคง |
| REQ-019 ส่งเข้า `/academic` | **feasible-with-risk (high)** | A+atomic T1 direction chosen jtrp98 2026-10-11; DES-016 §41.4a owner route/default/mapping/transaction/receipt-schema/runtime และ §27.6 งยัง hold |
| เรื่อง | คำวินิจฉัย | เหตุผลที่ตัดสินได้ (หลักฐาน) |
| Auth ของ API (DES-018) | **feasible-with-risk (critical | ตัวถอด JWT มีแล้ว (EVD-086) · frontend ส่ง Bearer (EVD-089)  |
| REQ-002 `nCourseIntensity` (DE | **feasible** | ข้อมูลหน่วยกิต/หมวดมีแล้ว (EVD-099, EVD-100) · soft ผ่าน val |
| เมนู Sidebar ผูกสิทธิ์ (DES-02 | **feasible** | Sidebar inject เมนู 5 รายการฝั่ง client จุดเดียว (EVD-114) · |
| REQ-008 แจ้ง shortfall (DES-02 | **feasible** | shortfall/remaining มีใน solver (EVD-103..EVD-105) · ไม่มี s |
| REQ-020 ลบ legacy (DES-021) | **feasible** | ไม่มี caller (EVD-109) · page-old หายแล้ว (EVD-110) · ไม่ DR |
| `BACKEND_URL` (OQ-4) | **ยอมรับความเสี่ยงชั่วคราว** — | D17 |

## Design Contracts

| ID | ชื่อ | Traces | ไฟล์ |
|---|---|---|---|
| DES-001 | 6. Business Rules รวบรวม (ที่ code บังคับจริง) | REQ-013 | `des-001.md` |
| DES-002 | 7. Validation Rules สรุปเฉพาะที่ backend บังคับ (นอกเหนือจาก | — | `des-002.md` |
| DES-003 | 9. Status / State Transitions | — | `des-003.md` |
| DES-004 | 12. Data / Entity สำคัญ (มุมมองธุรกิจ) | REQ-012, REQ-013, REQ-014, REQ-015, REQ-016, REQ-017, REQ-018, REQ-019, REQ-012, REQ-016, REQ-017, REQ-014, REQ-019, REQ-012, REQ-012, REQ-017, REQ-018, REQ-014, REQ-014, REQ-012, REQ-013 (เพิ่ม Rev 4), REQ-013, REQ-019, REQ-017, REQ-019, REQ-019, REQ-019, REQ-019, REQ-014, REQ-013, REQ-015, REQ-016, REQ-016, REQ-019, REQ-016, REQ-013, REQ-021, REQ-002, REQ-002, REQ-012, REQ-021, REQ-002, REQ-015, REQ-019 | `des-004.md` |
| DES-005 | 26. Backend Architecture | REQ-012, REQ-012, REQ-012, REQ-016, REQ-017, REQ-018, REQ-019, REQ-014, REQ-015, REQ-015, REQ-016, REQ-013, REQ-016, REQ-013, REQ-013, REQ-017, REQ-018, REQ-019, REQ-020 | `des-005.md` |
| DES-006 | 28. Timetable Generation Architecture | — | `des-006.md` |
| DES-007 | 29. Settings → Generation Influence Map (ความสัมพันธ์ settin | — | `des-007.md` |
| DES-008 | 31. Dependency & Integration Map | REQ-012 (เปลี่ยนหน่วยการทำงานเป็น (โรงเรียน, ปี, เทอม), REQ-013 (copy กติกา/ตาราง), REQ-014 (บล็อก Generate), REQ-015 (continuity บังคับจริง + กลุ่มวิชา), REQ-016 (ห้องประจำวิชา + ความจุ + ครูผู้ดูแลห้องเป็นข้อบังคับ + ค่าห้องต่อปี/เทอม + นับการใช้ห้องของ `/academic`), REQ-017 (เพดานชั่วโมงเต็ม), REQ-018 (ครูประจำชั้นจำกัดห้อง), REQ-016, REQ-019 (ปุ่ม "ใช้งานตารางสอน" → Service Academic: แทนที่ทั้งหมดต่อ (ห้องเรียน, เทอม), REQ-008, REQ-002, REQ-020, REQ-012, REQ-013 (เพิ่ม Rev 4 — ความเสี่ยงของ *แผน* ไม่ใช่ของ code ที่มีอยู่), REQ-013, REQ-014, REQ-019, REQ-019, REQ-017, REQ-018, REQ-015, REQ-016, REQ-013, REQ-019 | `des-008.md` |
| DES-009 | 34. มิติภาคเรียน (Term Dimension) — สัญญาเป้าหมายของ REQ-012 | REQ-012, REQ-012, REQ-008, REQ-012, REQ-002, REQ-011 | `des-009.md` |
| DES-010 | 35. การคัดลอกกติกา/ตารางข้ามเทอม-ปี — สัญญาเป้าหมายของ REQ-0 | REQ-013, REQ-013, REQ-010, REQ-013, REQ-013, REQ-006, REQ-013, REQ-013 (ยืนยันหมายเหตุ Rev 5 ข้างล่าง), REQ-013, REQ-013 | `des-010.md` |
| DES-011 | 36. ตรวจความพร้อมก่อน Generate และบล็อกเมื่อพบวิชาจัดไม่ได้  | REQ-014, REQ-014, REQ-014, REQ-009, REQ-014, REQ-014, REQ-009 | `des-011.md` |
| DES-012 | 37. Class Continuity เป็น hard constraint — สัญญาเป้าหมายของ | REQ-015, REQ-014, REQ-014, REQ-015 | `des-012.md` |
| DES-013 | 38. ห้องเรียนประจำวิชา + ความจุห้อง + นับการใช้ห้องข้าม `/ac | REQ-016, REQ-013 (§35.8), REQ-016 | `des-013.md` |
| DES-014 | 39. เพดานการสอนของครูเป็นเวลาสอนจริง + เพดานรายสัปดาห์ — สัญ | REQ-017, REQ-017, REQ-017 | `des-014.md` |
| DES-015 | 40. ครูประจำชั้นสอนเฉพาะห้องที่รับผิดชอบ — สัญญาเป้าหมายของ  | REQ-018, REQ-013 (ยืนยัน OQ-20 ข — §35.8 BR-66), REQ-018 | `des-015.md` |
| DES-016 | 41. ส่งตารางสอนเข้า `/academic` (ปุ่ม "ใช้งานตารางสอน") — สั | REQ-019, REQ-007, REQ-019 | `des-016.md` |
| DES-017 | 42. กลุ่มวิชา (`subjectGroups`) ห้ามจัดชนกันเอง — สัญญาเป้าห | REQ-015 (ส่วนกลุ่มวิชา), REQ-015, REQ-015 (`subjectGroups`, ปิด OQ-21) | `des-017.md` |
| DES-018 | 43. Authentication + Authorization ของ API โมดูล (แก้ D1) —  | REQ-007, REQ-021 | `des-018.md` |
| DES-019 | 44. ความเข้มข้นการจัดตาราง (`nCourseIntensity`) แบบ soft + ส | REQ-002 (ส่วน intensity), REQ-002 (`nCourseIntensity`) | `des-019.md` |
| DES-020 | 45. แจ้งผลวิชาที่วางไม่ได้หลัง Generate (shortfall report) — | REQ-008, REQ-014 (DES-011), REQ-008, REQ-014 | `des-020.md` |
| DES-021 | 46. ลบ legacy `Tbl_TeachingSchedule` + `page-old.tsx` อย่างป | REQ-020, REQ-020 (ไม่ DROP) | `des-021.md` |
| DES-022 | 47. การแสดงเมนู Teaching Schedule ใน Sidebar ตามสิทธิ์เมนู ( | REQ-021, REQ-012 (term dimension), REQ-013 (copy), REQ-013 (5 จุดเข้า), REQ-014, REQ-019 (UI redesign Phase 2), REQ-013, REQ-019 (requirement.md 2026-09-28 — OQ-9..OQ-24), REQ-014, REQ-016 (SA-Q5/SA-Q9/SA-Q10 กับเจ้าของ school DB/Service Academic), REQ-019 (SA-Q6/SA-Q11/SA-Q12 กับเจ้าของ `/academic`), REQ-021, REQ-013, REQ-012, REQ-015, REQ-012, REQ-013, REQ-002 | `des-022.md` |

## ไฟล์อื่นในหมวดนี้

| ไฟล์ | เนื้อหา |
|---|---|
| `data-model.md` | schema contract |
| `modules.md` | feature group ภายใน delivery unit |
| `risks.md` | dependencies + risks |
| `archive.md` | Q&A ที่ปิดแล้ว + Change Log entries ที่ถูกแทน — verbatim |

## Unresolved Open Questions

| ID | คำถาม | ผู้ตอบ | Blocking? |
|---|---|---|---|
| SA-Q5 / §27.6 ก | TClass model fields/max-length answered โดย jtrp98 2026-10-11; module SubjectRoom mapping schema ยังไม่อนุมัติ; live DB ไม่ได้ตรวจ | jtrp98 + module owner | BE-012/FE-024 และ consumers ก่อนเปิดใช้ (remaining schema/runtime) |
| SA-Q10 | X2 read direction + usage=ทุกคาบไม่ถูกลบในเทอมรวม inactive answered jtrp98 2026-10-11; concrete API/DTO/permissions/runtime ยังรอยืนยัน | jtrp98 | BE-012/FE-024 และ room constraints release (remaining contract/runtime) |
| SA-Q8 | paired BE-013/FE-025/DES-011 cutover | release owner | release เท่านั้น; BE-013 dev approved หลัง PM bounds |
| SA-Q6 / SA-Q11 / SA-Q12 details / §27.6 ง | route/default/mapping/locks/revision/receipt/schema/runtime owner; A+T1 direction answered | Academic/Attendance/DB/module owner | BE-014/FE-027 และ dependent release |

## Change Log

- 2026-10-11 — SA reconcile TClass owner model fields + X2/all-nondeleted usage ตามคำตอบจริง jtrp98 2026-10-11 (DES-013 §38.1/38.4, data-model §27.6 ก); Q&A/source statement เดิมอยู่ archive.md. ไม่ปิด concrete X2/module mapping/T1/runtime/security/DDL/deploy/release และไม่เปลี่ยน task Status.

- 2026-10-11 — DES-013 §38.5a + DES-011 + data-model (ก2): SA ตัดสิน 3 คำถามเทคนิคของ UX-014 ตามที่ jtrp98 มอบอำนาจ ("ได้ ให้ SA ตัดสินและแจ้งทราบ (Recommended)" — ไม่ใช่การอนุมัติของมนุษย์): ชื่อรหัสคงเดิม, `sTeacherName` เฉพาะครู active โรงเรียนเดียวกัน, params เหตุปฏิเสธ FE คำนวณเอง · ไม่มี schema/DTO shape/endpoint/permission ใหม่; ส่วนที่แทน archive.md verbatim
- 2026-10-11 — jtrp98 "ยืนยันทั้งตารางลูกและ DTO (Recommended)" + OQ-45 (จ) "ใช่ ใช้ได้ตามความจุ + เตือน ไม่บังคับ Link (Recommended)": gate #2 ส่วนรูป `TClassSettingCaretaker`/`lstCaretakers` ปิด (แถว Unresolved ย้าย archive.md verbatim); DES-013 BR-71 ชุดว่าง + รหัสเตือน (กรองหมด=`RoomCaretakerNotInPlan`), DES-011 wording, data-model §27.6 ก2 · ยังเปิด: SA-Q5, SA-Q10, (ก), DDL execution, security, release
- 2026-10-11 — คำตอบ jtrp98 OQ-43/44/45 + SA-Q25 (req-016): §27.6 ก2 `TClassSetting` ยืนยัน (ไม่มี sEmp) + เสนอ `TClassSettingCaretaker`/DTO `lstCaretakers` รอ gate #2; DES-013 BR-71 ชุดผู้ดูแล/isInPlan/link check; DES-011/004/008, risks.md wording; DES-016 ไม่กระทบ; แถว SA-Q25/Gate #2/REQ-016 เดิม + Change Log 2026-10-11 TClass ของ des-013/data-model ที่ถูกแทน archive.md verbatim
- 2026-10-11 — คำสั่ง jtrp98 (req-016): DES-013/data-model §27.6 ก,ก2 ทะเบียน TRoom→TClass, TRoomTermSetting→TClassSetting proposal รอ gate #2; DES-016 roomId/mapping, DES-004 API row, DES-005 pointer; SA-Q25 ใหม่; ไม่เปลี่ยน IDs/Status; ส่วนที่แทน archive.md verbatim

- 2026-10-11 — DES-015/018 responsibility projection correction: request missingterm→primary TermRequiredก่อนread/exposure; mandatorystring scope/ไม่มีContextNotSelected, legacy rowNULLไม่ใช่missingrequest; PM/test-planner reconcile referencesก่อนengineer; superseded wording archive.md verbatim ไม่มีใหม่human approval

- 2026-10-11 — DES-015 §40.3a/DES-018 bounded Setting/Get responsibility read projection สำหรับ signed UX-011; all selectable teachers/tenant-year-term/3roles/absence-vs-readfailure/requiredload errorsเดิม; PM amend BE-013/FE-025 bounds ก่อนcode addition; no schema/route/auth/newUXapproval, superseded metadata archive.md verbatim

- 2026-10-11 — ยืนยัน actual C1′ six-column SQL/schema/read/error/K1 ตาม jtrp98 และ DES-012 §37.2a derived warning API direction; backend contract ให้ PM bound owner/dependency ใน existing task IDs และ UX-009 diagnostic states; live TRoom/Academic/module mapping/DDL/release/security holds คง; ส่วนที่แทน archive.md verbatim ไม่เปลี่ยน Task/Status/IDs

- 2026-10-11 — jtrp98 คำตอบจริง 2026-10-11: DES-010/013 และ data-model C1′ read-only/SQL artifact ผู้ใช้รันเอง, no capacity/caretaker editor-copy; BE-013 §27.6 ขคจ/DES-014/015 schema+breaking dev only; DES-016 A+atomic T1 direction chosen; exact C1′ schema/read/K=1/runtime-room, Academic defaults/transaction/receipt/sync-schema/owner holds คง; superseded sections archive.md verbatim; IDs/release/Status ไม่เปลี่ยน

- 2026-10-09 — DES-016 provenance correction: ห้ามใช้ archive.md:2717 ที่ AskUserQuestion ไม่ได้รับคำตอบเป็น human schema/SA-Q6/7/11/12 approval (แก้ข้ออ้างใน entry SA code check เดิมด้านล่าง); superseded DES-016 metadata/Change Log อยู่ archive.md verbatim · §41.4a concrete T1 proposed endpoint/payload/status/atomic guard/receipt พร้อม exact owner questions; real Academic backend source พบแล้ว แต่ T1 ยัง proposed; BR/REQ/release/task Status ไม่เปลี่ยน

- 2026-10-09 — แก้ active approval provenance ของ data-model.md §27.5/§27.6 และหัว DES-009 ตาม archive.md:2717 (AskUserQuestion ไม่มีคำตอบ → ใช้ข้อเสนอเอง): ไม่ถือเป็น human sign-off; ประวัติ verbatim คงเดิม, technical contract/verdict BE-010 ไม่เปลี่ยน; รอ owner confirmation ตาม plan Waiting on Human #4/#5

- 2026-10-09 — DES-009 §34.2a: URL ?term= + preselect เฉพาะเทอมเดียวหรือการเลือกเดิมใน school/year เดียวกันตาม jtrp98 (09/10/2026); bridge workspace คงเดิม ไม่มี API/schema ใหม่; UX รายละเอียดนอกคำอนุมัติยัง draft · หัว gate DES-009 Rev 8–12 ที่ถูกแทนอยู่ archive.md verbatim

- 2026-10-09 — SA code check + amend (ที่มาของวันที่: วันที่ของ session — ผู้ใช้ไม่ได้ระบุแยก): **DES-016** — บันทึกการปิดประตู 2026-10-04 (SA-Q6/SA-Q11 ยืนยันตามข้อเสนอ §41.7, SA-Q7 = A, SA-Q12 = **T1**; Material ambiguity → resolved) · เพิ่ม §41.1a ผิว REST จริงของ gateway (`TimetableController.cs` @ `ccaf298` — มี `by-plan-course-section-period`, `copy`, `rooms`, `import/individual-registration` ที่ไม่เคยบันทึก; ยืนยัน schoolId/userId จาก context) · T1 endpoint ยังไม่มีใน code (scaffold `ServiceAcademic.*` ของ `sb-tech-upgrade-academic` ยังไม่มี code ส่วน timetable) — ต้องร่าง+ยืนยันสัญญา concrete ก่อน Phase 13 · **BL-021 คำตอบ: `PlanCourseSectionPeriodId` = additive ฝั่งอ่าน ไม่กระทบ payload** · refresh Evidence ของ DES-016 (EVD-065/066/069/070 → HEAD ปัจจุบัน + เพิ่ม EVD-117..119) · **DES-018/DES-019/DES-022** — เติมโน้ตลงวันที่ 2026-10-09: งานที่เคยเป็น `inferred` เพราะ "worktree ยังไม่ commit" commit ครบแล้ว (backend `2941f43`, frontend `205999b`) + แผนที่ชื่อไฟล์หลัง refactor kebab-case (`backendProxy.ts`/`authHeaders.ts` → `src/server/upstream`/`src/lib/auth-headers.ts`) — บรรทัดอ้างเดิมต้องยืนยันกับ HEAD ก่อนใช้ · ไม่มีกติกา/พื้นผิว API/schema ของสัญญาใดเปลี่ยน · สัญญาทุกตัวคง `.v1`
- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `../../INDEX.md`
