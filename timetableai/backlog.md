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
