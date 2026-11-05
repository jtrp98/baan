# FE-026 — Generate precheck: blockers + warnings + shortcut, no silent drop (DES-011, REQ-014 AC-033..AC-035)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

Generate precheck: blockers + warnings + shortcut, no silent drop (DES-011, REQ-014 AC-033..AC-035)

## References

REQ-014, AC-033, AC-034, AC-035, DES-011, DEC-011 · `../../modules/timetableai/build/uxui/UX-012-generate-precheck.md` (signed jtrp98 2026-10-11: ร่างปัจจุบัน + หัวข้อ "Fold จาก UX-014") + `../../modules/timetableai/build/uxui/UX-014-multi-caretaker-delta.md` §C (signed) · DES-013 §38.5a

## Scope

ตาม design §36: คำนวณ `lstGenerateBlockers` จาก **BR-27** — (ก) `NoEligibleTeacher` = ไม่มีครูใน `TPlanCourseTeacher` ของวิชาในแผนนั้นที่ผ่านการจำกัดห้องประจำชั้น (BR-41/42 ของ FE-025) **และ** ตัวกรองผู้ดูแลห้อง (BR-71 ของ FE-024 — ชุดว่างเพราะผู้ดูแล = `sDetail: "RoomCaretaker"` + ชื่อห้อง/ผู้ดูแล + ทางลัดหน้า subject-settings) (ข) `ZeroPeriodsPerWeek` (โควตา 0/ไม่มีค่า) — **สองเหตุนี้เท่านั้นที่บล็อก**; เลิกใช้ `Tbl_TeacherClassAssignment`/`lstClassTaught` เป็นแหล่ง (AC-046a) · **BR-50** — ตรวจทุก sub-course ของทุกแผนใน `sPlanIDs` × ห้องเรียนของแผน ไม่ใช่เฉพาะที่ผู้ใช้ติ๊ก (ขอบเขตที่จัดยังตาม Schedule Summary เดิม) · **BR-28** — ตรวจครบทุกรายการ + ตรวจซ้ำได้โดยไม่ reload (GET ชุด maps ใหม่แล้วคำนวณใหม่โดยไม่ล้างกริด/ช่องล็อก — ข้อยกเว้นเฉพาะจุดของ DES-007; GET ล้ม = คงสถานะบล็อกเดิม + error **ห้ามปลดด้วยข้อมูลที่โหลดไม่สำเร็จ**) · **BR-51** — ทางลัด resolve URL จากข้อมูลเมนูที่ layout โหลดไว้ ด้วย identity รายการเมนู (SA-Q13 มี fallback — ห้าม hardcode ห้ามใช้หน้า `/academic`) เปิด**แท็บใหม่** คงกริด/ช่องล็อก; deep-link เฉพาะเมื่อ SA-Q13 ยืนยันว่าปลายทางรองรับ · ปุ่ม Generate/Regenerate disabled เมื่อ blockers ไม่ว่าง ร่วม gate เดิม `isConflictDataReady` + `isAcademicRoomUsageReady` (FE-024) · ยกเลิกพฤติกรรมตัดวิชาเงียบที่ `use-timetable-generation.ts:205-207` (AC-016 ยกเลิก) — **ห้าม fallback กลับไปพฤติกรรมเดิม** · รวม `lstGenerateWarnings` (BR-53, `RoomSettingMissing`, `SubjectGroupPinnedConflict` — ไม่บล็อก) · การวางมือไม่ถูกบล็อกโดยรายการนี้; Link Subject pre-placement รอด้วย (อยู่ใน Generate) · precheck กับ DES-020 shortfall ไม่ซ้อนกัน (BR-83) · ออกพร้อม/หลัง FE-025 (SA-Q8)

UX-014 §C: copy blocker `RoomCaretaker` = ชุดผู้ดูแลที่นับได้, warning `RoomCaretakerNotInPlan` หนึ่งแถวต่อห้อง (OD-5). UX sign-off แล้ว (UX-012 + fold + UX-014 ตามที่ไฟล์ระบุ; ชื่อรหัสตาม DES-013 §38.5a — SA ตัดสิน); เหลือ gate: deep-link เฉพาะเมื่อ SA-Q13 ยืนยัน · sign-off ไม่ปลด Depends: FE-023 (full รอ BE-012), FE-024, FE-025 ต้อง verified ก่อน dispatch; release คู่ FE-025 (SA-Q8)

- Security-sensitive: yes

## Out of Scope

DES-020 shortfall (FE-005/FE-008 — คนละกลไก BR-83) · ตรรกะ solver อื่น · DES-018 (FE-018/019)

## Expected Output

none

## Acceptance

AC-033: ตรวจก่อนเรียก Generate เสมอ — ทุกวิชาของแผนที่เลือก; ทางลัดไปหน้าจัดการหลักสูตร/แผน (resolve จากเมนู)
AC-034: พบปัญหา 1 รายการ → บล็อกปุ่ม + แสดงรายการครบ
AC-035: แก้ครบแล้ว ปุ่มกลับมากดได้โดยไม่ปิดหน้า (ตรวจซ้ำ BR-28)

## Dependencies

FE-023, FE-024, FE-025, UX-012

## Handoff

vitest: 2 เหตุบล็อก + `RoomCaretaker`, ขอบเขต BR-50 (วิชาไม่ได้ติ๊กก็บล็อก), ตรวจซ้ำไม่ล้างกริด/ล็อก, GET ล้ม = คงบล็อก, resolve เมนู + fallback ไม่มีสิทธิ์, ปฏิสัมพันธ์ `isConflictDataReady`/`isAcademicRoomUsageReady` · grep ยืนยันไม่มีจุดตัดวิชาเงียบเหลือ · typecheck/lint/build · `[manual-E2E]` · ยืนยันบรรทัดกับ HEAD ล่าสุดก่อนแก้ (2026-10-09: tree commit ครบแล้ว)
revert ได้เดี่ยว — กลับพฤติกรรมตัดวิชาเงียบ (R31 เปิดอีก) · behavior-change — ผู้ใช้ที่เคย Generate ได้จะถูกบล็อก (ธุรกิจยืนยันแล้ว REQ-014)
ส่งต่อ reviewer

## Change Log

- 2026-10-11 — FE-026 verified (Review Round 27 PASS, QA Round 28 PASS; 11 vitest tests passed, 68 regression tests passed, typecheck 0 errors, build exit 0; precheck blockers NoEligibleTeacher/ZeroPeriodsPerWeek, RoomCaretaker details, warnings, recheck without clearing grid, no silent drop). Status verified in plan/index.md.
- 2026-10-11 — PM รับ UX-012 OD-1 เลือก (ก) จาก jtrp98 “1A 2A 3A”: blocker สูงตามพื้นที่หน้าจอ เลื่อน/keyboard ถึงทุกแถว ไม่ซ่อนรายการ; OD ไม่ gate แล้ว คง Depends/owner/schema/security/release.

- 2026-10-11 — UX-012 (+fold)/UX-014 §C signed jtrp98 (ไฟล์จริง); เหลือ gate UX-012 OD-1 + Depends เดิม; scope/Depends/Status คงเดิม.

- 2026-10-11 — อ้าง UX-014 §C + gate copy ผู้ดูแลใน precheck (OD-1..6 ยืนยัน jtrp98; artifact ยังไม่ signed); scope/Depends/Status คงเดิม.

Back-links: `INDEX.md`
