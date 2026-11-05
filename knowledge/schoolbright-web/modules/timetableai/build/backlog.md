# timetableai — Backlog

> ทุกอย่างที่ไม่อยู่ใน `plan.md` `## Release Scope` · ใครก็เพิ่มบรรทัดได้ · ย้ายเข้า release ได้เฉพาะเมื่อผู้ใช้สั่ง

| ID | รายการ (1 บรรทัด) | มาจาก | ความสำคัญ | Decision |
|---|---|---|---|---|
| BL-001 | lookup admin โหลด `TAdmin` ทั้งแถว ขณะ `id2` เป็น `int` ไม่ nullable — ถ้าคอลัมน์จริงรับ NULL admin นั้นได้ 403 ทุก endpoint · แก้: project เฉพาะ `active`/`del` หรือยืนยัน `id2 NOT NULL` (ส่วนยืนยันข้อมูล = `plan.md` Waiting on Human #3) · owner: backend-engineer (+ `devops` ยืนยันข้อมูล) | RV-21 (`review.md`, `qa.md`) | Med | — |
| BL-002 | ไม่มี test ใน repo ของการสลับ identity ใน cache ฝั่ง AC-071 (admin ผ่าน ↔ admin ไม่ active/ถูกลบ ใน resolver เดียว) — เพิ่ม `[Fact]` ใน `ResolverCacheIdentityTests` · owner: backend-engineer | RV-22 (`review.md`, `qa.md`) | Low | — |
| BL-003 | BE-009: การเทียบ filter ต่อหน้าใน `Be009Tests.cs:136-152` ขับ filter ด้วย `ActionExecutingContext` สร้างมือ ไม่ผ่าน HTTP routing (ยกเว้นกรณีลบ 402) · owner: backend-engineer | `qa.md` Round 5 Issues Found (Minor) · `review.md` Round 9 (3) | Low | — |
| BL-004 | package advisories: NU1904 `System.Linq.Dynamic.Core` 1.2.20 (critical), NU1903 `Newtonsoft.Json` 10.0.3 (high) — มีมาก่อน · **แจ้ง `security` ในรอบ DES-018** · owner: backend-engineer / security | `qa/phase-5.md` (BE-008 R4 Issues Found) · `qa.md` Round 5 | High | — |
| BL-005 | `CreateClassPeriodForm` อาจเป็นโค้ดตาย (ไม่มีผู้ import ใต้ `src/`) — ยืนยันแล้วลบ + ย้าย test หรือต่อเข้า route · owner: frontend-engineer → project-manager | RV-9 (`review.md`, `qa.md`) | Low | — |
| BL-006 | test 401 ของจุดที่มีหน้าจอสำเร็จไม่ assert ว่าไม่มีหน้าจอสำเร็จ และไม่ assert ว่า `isSaving` ถูกปลด (ช่องว่างหลักฐาน FE-018) · owner: frontend-engineer | RV-16 (`review.md`, `qa.md`) | Low | — |
| BL-007 | catch ของ `handleDetailSave` (`subject-settings/[year]`) ไม่มี `it` 401/403/คุมของตัวเอง (ช่องว่างหลักฐาน FE-018) · owner: frontend-engineer | RV-17 (`review.md`, `qa.md`) | Low | — |
| BL-008 | `expectSilent401` ตรวจ `queryByRole("alert")` ซึ่ง `Alert` ไม่มี role — แก้ที่ test (ช่องว่างหลักฐาน FE-018) · owner: frontend-engineer | RV-18 (`review.md`, `qa.md`) | Low | — |
| BL-009 | `locale` ไม่อยู่ใน dependency ของ `handleAiGenerate`/`handleCpGenerate` และ effect restore (ส่วนที่ยังเปิด) · owner: frontend-engineer | FIND-P4-08 (`qa.md`) | Low | — |
| BL-010 | `useTimetableMenuPermissions.test.tsx` Case 13b/13c ไม่ใช่กรณี S2-A #13(b)(c) ของ test-plan (ช่องว่างหลักฐาน FE-010) · owner: frontend-engineer | FIND-P5-02 (`qa.md`) | Low | — |
| BL-011 | race ใน `AuthContext.tsx` `initAuth` — token หมดอายุถูกเขียนกลับ `localStorage` ถ้า `sb-session-expired` เกิดระหว่าง `await` (มีมาก่อน) · owner: frontend-engineer | FIND-P5-03 (`qa.md`) | Med | — |
| BL-012 | UX-005 (กติกาการแสดงความล้มเหลวของ action) ร่างแล้ว ยังไม่มีคนเซ็นและยังไม่กำหนดขอบเขตเทียบ as-built — หลังเซ็น PM จึงแตก task · owner: คนเซ็น UX → project-manager | `uxui/UX-005-failure-surface-rules.md` · `plan.md` Sequencing Notes | Low | — |
| BL-013 | `add-teacher` ไม่อ่าน body `status` (200 + `status !== 1` ถือว่าสำเร็จ — ชนิดเดียวกับ RV-15) · owner: frontend-engineer | ข้อสังเกตของ FE-020 ตามที่ driver แจ้ง 2026-10-04 — ยังไม่มี id ใน `review.md`/`qa.md` | Med | — |
| BL-014 | FE-020 edge: response สำเร็จที่มาถึงไม่ตามลำดับหลัง rollback แบบ latest-write ไม่ถูก re-sync จนกว่า reload · owner: frontend-engineer | ข้อสังเกตของ FE-020 ตามที่ driver แจ้ง 2026-10-04 — ยังไม่มี id ใน `review.md`/`qa.md` | Low | — |
| BL-015 | การแทนที่ link subject แบบ atomic (delete+recreate ไม่ทำข้อมูลหายเมื่อ set ล้มกลางทาง) — ต้องมี backend replace endpoint = เปลี่ยนสัญญา · FE-020 ทำเพียง reload ใน `catch` · owner: system-analyst | RV-13 (`review.md`) · `plan.md` Unresolved Open Questions | Low | — |
| BL-016 | Phase 6 FE-011..FE-016 — UX-001..UX-004/UX-006 เซ็น as-is 2026-10-04 แล้ว; ทุก task pending | plan.md Phase 6 / PM amend 2026-10-04 | Med | ย้ายเข้า R2 แล้วตามคำสั่งผู้ใช้ 2026-10-04; ไม่ใช่งานนอก scope/ไม่ต้องเซ็น UX เดิมซ้ำ |
| BL-017 | REQ-012..REQ-019 + BR-17a — วางครบ 19 task Phase 8–13; dependency ตาม SA Rev21 | plan.md Phase 8–13 / PM amend 2026-10-04 | Med | ย้ายเข้า R2 แล้วตามคำสั่งผู้ใช้ 2026-10-04; #10..#16 คงเดิม ไม่อนุมัติ schema/contract/UX เพิ่ม |
| BL-018 | retry control ของ required load — signed UX-004 ครอบ 401/403 เท่านั้น; คง reload/no auto retry ตาม AC-070 จนมี UX ครอบ retry + คนตัดสิน scope | DES-018 §43.2b4e / SA Rev21 + PM amend 2026-10-04 | Low | อยู่นอก R1/R2; ไม่เพิ่มใน FE-016/FE-019; ผู้ใช้ตัดสิน scope หลัง UX draft/sign-off |
| BL-019 | test gaps เกิน Required validation ของ FE-020 (§S14-B/§S14-C): set-times modal race (เก่าล้มหลังใหม่สำเร็จ), control "สองการแก้สำเร็จทั้งคู่" ของ `persistGroupTeachers`, กรณี delete ล้ม → ไม่ส่ง set / delete 200 + set 403 / set 401 ใน `timetable-fe020-hygiene.test.tsx` · owner: frontend-engineer | RV-27 (`review.md` Round 11, `qa.md` R7) | Low | — |
| BL-020 | ไฟล์ legacy `page-old.tsx` เหลือ 2 จุดนอกสายตาของ FE-006: `src/app/[locale]/timetable/create-classroom/page-old.tsx` และ `create-teachers-schedule/page-old.tsx` (route inactive — ไม่มี `page.tsx`) — ยืนยันแล้วลบให้สอดคล้อง REQ-020 · owner: frontend-engineer → project-manager วาง task ถ้าเกี่ยวพันสิ่งอื่น | PM code check 2026-10-09 | Low | — |
| BL-021 | gateway ACA-4945 (`ccaf298` 2026-10-07) เพิ่มฟิลด์ `PlanCourseSectionPeriodId` ใน `TimeTableItemDto` + gRPC proto + mapping ของ Service Academic timetable — ประเมินผลต่อ payload BR-47/§41.7 ของ DES-016 (BE-014/FE-027 ยังไม่ implement) · owner: system-analyst | PM code check 2026-10-09 | Med | ปิด 2026-10-09 — SA ประเมินแล้ว: additive ฝั่งอ่านอย่างเดียว (response ของ GET) ไม่กระทบ payload `POST by-room` — §41.7 ไม่ต้องแก้ (บันทึกที่ `design/des-016.md` §41.7 + EVD-118/119) |
| BL-022 | repo `sb-tech-upgrade-academic` มี `src/`, `tests/` แบบ untracked ที่ root (ไม่ใช่งาน commit ของโมดูลนี้) — เจ้าของ repo ยืนยันที่มาก่อนใช้ repo นี้อ้างอิงสัญญา Service Academic ของ REQ-019 · owner: เจ้าของ repo / devops | PM code check 2026-10-09 | Low | SA ตรวจ 2026-10-09: untracked = scaffold `ServiceAcademic.Application/Domain/Infrastructure` + `tests/ServiceAcademic.UnitTests` ที่**ยังไม่มี code ส่วน timetable** (T1 ยังไม่มีใครเริ่ม) — ยังรอเจ้าของ repo ยืนยันที่มา/การทิ้งไว้ |

| BL-023 | FE-021 hub 401/error/empty state hygiene; unsigned retry/empty copy ไม่ดึงเข้า FE-021 approved subset · owner frontend-engineer/uxui-designer | review:REV-010 (review/round-8.md), PM 2026-10-09 | Low | — |
| BL-024 | กริดอ่าน global sTermID แทน page prop; ปรับแหล่ง context เมื่อคนย้ายเข้า scope · owner frontend-engineer | review:REV-012 (review/round-8.md), PM 2026-10-09 | Low | — |
| BL-025 | success copy ระบุเทอมทุกจุด; ต้อง sign-off precise copy ก่อน · owner uxui-designer/frontend-engineer | review:REV-013 (review/round-8.md), PM 2026-10-09 | Low | — |
| BL-026 | UX-007 draft verified กับ full sign-off คนละความหมาย; บันทึกคำอนุมัติ subset แล้ว แต่ precise details ยังรอคน ไม่เปลี่ยน artifact เป็น signed แทนคน · owner uxui-designer | review:REV-014 (review/round-8.md), PM 2026-10-09 | Low | — |

- 2026-10-09 — review:REV-011 (review/round-8.md) เพิ่มหลักฐาน sTermID ใน dead CreateClassPeriodForm ให้ BL-005 เดิม; ไม่สร้าง backlog item ซ้ำ/ไม่ดึง Minor เข้า frozen scope.

| BL-027 | UX-009 copy “เวลาติดกันจริง” อาจกำกวมว่าคาบต้อง end=start; refine ให้ตรง DES-012 BR-29 ช่องเรียนถัดกัน ไม่มีพัก/lunch คั่น และเวลาเปลี่ยนคาบที่ไม่ได้ประกาศพักไม่ทำขาด; ไม่บล็อก draft/ไม่เพิ่ม business rule · owner uxui-designer | review:REV-016 (review/round-12.md), qa/round-11.md, PM 2026-10-09 | Low | — |

- 2026-10-09 — BL-022 factual update: ข้ออ้าง scaffold-only เก่าถูกแทนด้วย DES-016 §41.4a source ที่พบจริงใน target sb-tech-upgrade-academic/backend/src/ (repository/RPC/DTO/proto timetable); import append ไม่ใช่ atomic replace และ T1 ยัง proposal. Runtime/deploy owner ยังต้องยืนยัน; ไม่แก้ historical row.
- 2026-10-09 — BL-016/BL-017 factual update: current frozen Release Scope คือ R1 ทั้ง48 tasks (ไม่ใช่ขอ scopeใหม่); Phase6 verified, UX008..013 draft verified QA10..14 ยัง unsigned, FE021 blocked QA9/gate4; schema/owner/T1 และ production holds คงอยู่. ประวัติ R2/pending เดิมเก็บไว้ไม่เขียนทับ.
| BL-028 | BE-013 support failure เพิ่ม scope/state/reason/correlation logs โดยไม่ log PII/JWT/config/blob; owner backend-engineer — ข้อสังเกตคุณภาพ ไม่ทำลาย AC/error contract และไม่เปิดงานแก้ใน frozen R1 | review:REV-017 (review/round-17.md); PM 2026-10-11 | Low | → backlog; ไม่เพิ่ม release task/scope |
| BL-029 | ไฟล์ `room-term-setting-school-db.sql` (target sb-api-academic-timetable-ai root; สร้าง TRoomTermSetting) ล้าสมัยหลังคำสั่ง TRoom→TClass+TClassSetting — ห้ามรัน; ลบ/เก็บไฟล์เป็นการตัดสินของผู้ใช้ (git/file state) · owner ผู้ใช้ | plan/be-012.md, DES-013 2026-10-11; PM 2026-10-11 | Low | — |
| BL-030 | header เดิมของ `room-term-setting-school-db.sql` (:3–6 "ผู้ใช้ยืนยัน/ยืนยันตารางและสัญญาอ่านนี้", :12 "live TRoom (SA-Q5)") ใต้ banner ล้าสมัย อาจทำให้เข้าใจว่ารูป TRoomTermSetting ยังยืนยัน — annotate "(รูปตารางถูกแทน)" หรือปิดพร้อม BL-029 ถ้าผู้ใช้ลบไฟล์ · owner backend-engineer หรือผู้ใช้ตาม BL-029 | review:REV-018 (review/round-18.md); PM 2026-10-11 | Low | → backlog; ไม่ blocking, ไม่เพิ่ม task/scope |
| BL-031 | `GetTeachersByClass.lstSubjects` อิงรหัสวิชาทั้งโรงเรียน ไม่ผูกแผน (`GetTeacherInfos` ใช้ `DistinctBy(courseCode)` — WebAPIController.cs ~:2452) → BR-41 แบบผูกแผนไม่แม่นเมื่อรหัสวิชาเดียวกันอยู่หลายแผน; FE-025 ใช้ map ตามรหัสวิชาตรงกับที่ BE ให้ · owner system-analyst (ประเมินสัญญา) → project-manager | รายงาน frontend-engineer FE-025 2026-10-11; PM ตรวจโค้ด BE 2026-10-11 | Med | — |
| BL-032 | Schedule Summary แสดงครูทุกคนในทุกแผนพร้อม classes = ทุกห้องของแผนแม้ไม่มีวิชาในแผนนั้น — การจัดตารางจริงยังกรองด้วย teacherSubjectsInChargeMap จึงเป็นปัญหาแสดงผล (REV-021) · owner frontend-engineer | review:REV-019/round-19.md; PM 2026-10-11 | Low | — |
| BL-033 | Accessibility ของ settings: input ชั่วโมงไม่มี aria-describedby ผูก error, tooltip BR-44 เปิดเฉพาะ hover, VR-12 ปิด Save แทน error summary + auto-focus (REV-022) · owner frontend-engineer | review:REV-022 (review/round-19.md); PM 2026-10-11 | Low | — |
| BL-034 | `unionMinutes` ใน `teaching-caps.ts:223` ทิ้งช่วงเวลาไม่มี start/end ของช่องที่วางอยู่แล้ว (นับ 0 นาทีในยอดสะสม) สำหรับช่อง legacy (REV-023) · owner frontend-engineer | review:REV-023 (review/round-19.md); PM 2026-10-11 | Low | — |

## Change Log

- 2026-10-11 — PM append BL-032..BL-034 จาก review:REV-021..023 Minor (FE-025 backlog items); append-only ไม่กระทบ frozen scope/Status.

- 2026-10-11 — PM append BL-031 (finding นอกขอบเขต FE-025: lstSubjects ไม่ผูกแผน); ไม่ขยาย FE-025 scope/ไม่เปลี่ยน task/Status/Release Scope.

- 2026-10-11 — PM append BL-030 จาก review:REV-018 Minor (ข้อความ header เดิมชวนเข้าใจผิด); BL-029 ครอบเฉพาะการลบไฟล์ จึงอ้างกันแทนการซ้ำ; ไม่เปลี่ยน task/Status/scope.
- 2026-10-11 — PM append BL-029 (SQL เดิม TRoomTermSetting ล้าสมัย; disposal = ผู้ใช้); REV-017 มีแล้วที่ BL-028 ไม่ append ซ้ำ.
- 2026-10-11 — PM รับ review:REV-017 Minor เป็น BL-028 หลัง BE-013 review/QA; append-only, ไม่มีการ implement/เปลี่ยน task/Status/scope.
