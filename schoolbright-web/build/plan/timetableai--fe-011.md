# FE-011 — Sidebar disabled / loading / checkFailed rendering (UX-006, DES-022)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

`Sidebar.tsx` ใช้ผลของ FE-010 ที่จุด inject ส่วน Teaching Schedule: แสดงครบ 5 รายการเสมอ · รายการปิดทุกเหตุ: ไม่นำทาง (ไม่มี href ที่คลิกได้) + `aria-disabled` · สิ่งบ่งชี้แยกตามเหตุ (ไม่มีสิทธิ์ · กำลังโหลดที่หัวกลุ่ม · ตรวจไม่สำเร็จ + tooltip ให้ reload) ตามหน้าตา/ถ้อยคำของ **UX-006 ฉบับที่มีคนเซ็น** — AC-064 ส่วนที่ผู้ใช้เห็น (ปิดไม่ซ่อน, loading, checkFailed แยกจากไม่มีสิทธิ์)

## References

REQ-021, AC-064, DES-022, DEC-022

## Scope

ใช้ UX-006 ฉบับเซ็น as-is 2026-10-04 · `frontend-engineer` อ่านได้เฉพาะฉบับที่เซ็น — ถ้าฉบับที่เซ็นขัด DES-022 (เช่น ซ่อนแทนปิด, retry อัตโนมัติ) → ส่ง `system-analyst` ก่อน · contrast/component/Sidebar หุบและ mobile ตรวจเทียบ as-built ตามฉบับที่เซ็น · ห้ามแสดงรายการเปิดก่อนรู้ผล (fail-closed) · Sidebar ไม่แสดงข้อความ 401/403 และไม่เริ่ม SessionExpired · เมนูกลุ่มอื่นไม่เปลี่ยน · ประตู `security` ตาม DES-022 (การนำทางด้วย URL ตรงยังถูก DES-018 กัน)

- Security-sensitive: yes

## Out of Scope

hook/config ของ FE-010 (ใช้เท่านั้น) · เมนูกลุ่มอื่นและเงื่อนไขการแสดงส่วน Teaching Schedule · การจัดการ 401/403 ของหน้า

## Expected Output

none

## Acceptance

AC-064: ผู้ใช้ที่ไม่มีสิทธิ์อ่านของ m เห็นรายการ m แบบปิด (ไม่ซ่อน, คลิก/คีย์บอร์ดไม่นำทาง, `aria-disabled`) + สิ่งบ่งชี้ "ไม่มีสิทธิ์" · ระหว่างโหลด ทุกรายการปิด + ตัวบ่งชี้ที่หัวกลุ่ม · ตรวจไม่สำเร็จ ทุกรายการปิด + ไอคอนเตือน + tooltip ให้ reload และแยกได้จาก "ไม่มีสิทธิ์" · ผู้มีสิทธิ์เปิดหน้าได้ตามปกติ · หน้าตา/ถ้อยคำตรง UX-006 ที่เซ็น

## Dependencies

FE-010

## Handoff

ตรวจ AC-064 ด้วย response 4 สถานะ (enabled, noPermission, loading ที่หน่วงเวลา, checkFailed) — ภาพ Sidebar แต่ละสถานะเทียบ UX-006 ที่เซ็น + คลิก/คีย์บอร์ดบนรายการปิด → ไม่นำทาง + `aria-disabled` จาก accessibility tree · typecheck/lint/build ผ่าน — เก็บภาพและรายการตรวจเป็นหลักฐาน
revert คืน Sidebar as-built (D53 — รายการเปิดทั้งหมด; API ยังบังคับตาม DES-018) · ไม่มีข้อมูลเปลี่ยน
ส่งต่อ reviewer

Back-links: `INDEX.md`
