# BE-007 — Gate recompute/* with compass_admin_ops entitlement

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

เพิ่มการตรวจ feature key `compass_admin_ops` (คนละ key กับ `compass_premium` โดยเจตนา) ให้ `recompute/national-stats` และ `recompute/status` โดยใช้ `CheckEntitlement` ตัวเดียวกัน — ชั้นที่ 1 จากสองชั้นของ REQ-014 — endpoint นี้สั่ง `TRUNCATE` สถิติทั้งเครือข่าย — ถ้าผูกกับ `compass_premium` นักเรียนที่จ่ายเงินทุกคนจะสั่งลบได้ ขัด REQ-014 ที่บังคับว่านักเรียนทั่วไปเรียกไม่ได้เด็ดขาด (DES-016 REQ-014 ชั้นที่ 1)

## References

REQ-014, AC-014.1, AC-014.2, DES-016

## Scope

ใช้ `CheckEntitlement` ตัวเดียวกันแต่ตรวจ key `compass_admin_ops` เท่านั้น — ห้ามใช้ `compass_premium`;
`recompute/status` ต้องถูกกั้นด้วย (เปิดเผยสถานะงาน batch ระดับเครือข่าย ไม่ควรให้นักเรียนเห็น) ·
ชั้นนี้ต้องทำงานร่วมกับชั้น IP allowlist ของ BE-008 (ตรวจ IP ก่อน entitlement) — ห้ามตัดชั้นใดชั้นหนึ่ง

- Security-sensitive: yes

## Out of Scope

ห้ามผูก key นี้เข้าแพ็กเกจที่ขายให้นักเรียน/ผู้ปกครอง (เป็นการตั้งค่าฝั่ง SB PLUS — PRE-02); ห้ามใช้ key เดียวกับ `compass_premium`;
ห้ามถอดชั้น IP allowlist หรือสลับลำดับการตรวจทั้งสองชั้น

## Expected Output

none

## Acceptance

AC-014.1: `recompute/national-stats` ถูกจำกัดด้วยการตรวจ `compass_admin_ops` ฝั่งเซิร์ฟเวอร์ก่อนสั่งงาน
AC-014.2: นักเรียนทั่วไปที่ล็อกอินอยู่เรียก `recompute/national-stats` และ `recompute/status` ไม่ได้เด็ดขาด

## Dependencies

BE-004

## Handoff

ตรวจ AC-014.1 และ AC-014.2 ด้วย request ของบัญชีที่มี/ไม่มี `compass_admin_ops` ต่อ endpoint ทั้งสอง — บันทึก status code;
ยืนยันว่าการตรวจเกิดก่อนการเริ่ม batch จริงและไม่มีเส้นทางข้ามการตรวจ
ถอดชั้น entitlement นี้ได้เดี่ยว แต่ห้ามถอดโดยที่ชั้น IP allowlist (BE-008) ยังไม่ทำงาน — สองชั้นต้องมีอย่างน้อยหนึ่งชั้นเสมอ;
ผู้มีสิทธิ์จริง (staff/internal) ต้องยังเรียกได้หลังถอด/แก้
ส่งต่อ reviewer

Back-links: `INDEX.md`
