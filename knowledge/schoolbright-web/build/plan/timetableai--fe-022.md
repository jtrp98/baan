# FE-022 — Copy UI on 5 entry points + proxies, read real results (DES-010, REQ-013 AC-029..AC-032, AC-050, AC-051)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

Copy UI on 5 entry points + proxies, read real results (DES-010, REQ-013 AC-029..AC-032, AC-050, AC-051)

## References

REQ-013, AC-029, AC-030, AC-031, AC-032, AC-050, AC-051, DES-010, DEC-010 · `../../modules/timetableai/build/uxui/UX-008-copy-across-term-year.md` (signed jtrp98 2026-10-11 ตามร่างปัจจุบัน) · UX-014 ไม่ครอบ Copy flow — ไม่ใช่ gate

## Scope

ปุ่ม Copy บน 5 list-page ตาม UX-008 signed (จุดเข้ากำหนด scope; `/timetable` เลือกตารางได้ BR-69) + proxy `/api/timetable/copy/preview|apply` · **ห้ามมี code path ใดเรียก Apply โดยไม่ผ่าน Preview** (§35.2) · อ่าน `status` จริงทุกจุด — แสดง `lstMissingTemplates`/`lstUnmatched`/`lstDependents`/`lstSkipped` และ error 7 กรณีตามข้อความที่ backend คืน (ห้าม success modal ลวง — D26/D10) · เกณฑ์ = AC-029..AC-032, AC-050, AC-051 ฝั่ง UI

ใช้ FE-021 บริบทโรงเรียน/ปี/เทอมที่สร้างแล้ว ไม่สร้าง term selector/state อีกชุด; ส่ง/รีเซ็ต context ตาม DES-009

UX sign-off แล้ว (ตามที่ UX-008 ระบุ — ไม่ปิด schema/owner gate); เหลือ gate: UX-008 OD-1 ปิด jtrp98 2026-10-11 (“1A 2A 3A”): คัดลอกสำเร็จอยู่หน้าเดิม พร้อมปุ่มเลือกไปปี/เทอมปลายทาง ไม่เปลี่ยน context อัตโนมัติ · sign-off ไม่ปลด Depends: BE-011 (รอ BE-012 full/SA-Q5/SA-Q10) ต้อง verified ก่อน dispatch

- Security-sensitive: yes

## Out of Scope

modal ของ `/academic` (`schedule-copy-modal.tsx` — คนละระบบ) · endpoint เดิม · งาน DES-009 (FE-021)

## Expected Output

none

## Acceptance

AC-029..AC-032, AC-050, AC-051 ฝั่ง UI: flow Preview→ยืนยัน→Apply ครบทุกคำเตือน/ผลลัพธ์; ไม่มีทางลัดข้าม Preview

## Dependencies

BE-011, FE-021, UX-008

## Handoff

vitest: Preview→confirm→Apply, ทุก error/คำเตือน (mock backend), ผลจริงแสดงครบ · typecheck/lint/build · `[manual-E2E]` กับ BE-011 · ยืนยันบรรทัดกับ HEAD ล่าสุดก่อนแก้ (2026-10-09: tree commit ครบแล้ว)
additive — revert ได้เดี่ยว; กลับ mock เดิม
ส่งต่อ reviewer

## Change Log

- 2026-10-11 — Verified ใน QA Round 26 (Review Round 25 PASS): 5 entry points, locked scopes, proxies, preview validation, blockers, confirmations, OD-1 choice ครบถ้วน; typecheck/lint/build/tests (1,165 tests) pass.

- 2026-10-11 — PM รับ UX-008 OD-1 เลือก (ก) จาก jtrp98 “1A 2A 3A”; เอา UX navigation hold ออก คง Depends/schema/security/release.

- 2026-10-11 — UX-008 signed jtrp98 (ไฟล์จริง); เหลือ gate OD-1 redirect + Depends BE-011 เดิม; scope/Depends/Status คงเดิม.

- 2026-10-11 — note UX-014 ไม่ gate FE-022; scope/Depends/Status คงเดิม.

Back-links: `INDEX.md`
