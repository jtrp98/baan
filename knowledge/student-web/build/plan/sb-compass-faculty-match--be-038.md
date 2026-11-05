# BE-038 — Premium entitlement wiring (Module I-b)

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

เชื่อม `CheckEntitlement` เข้าทุก endpoint ของ Module I-b เช่นเดียวกับ BE-037 (รวม endpoint ใหม่ของ Target Major Rules — BE-041/042/043) — fail-closed เดียวกัน — บล็อกที่ `sb-compass` OQ-15(a1)/(a2) — endpoint ตั้ง/สลับเป้าหมายเป็นจุดเขียนข้อมูลใหม่ — ถ้าลืมกั้น คนที่ไม่มีสิทธิ์เขียนเป้าหมายเข้าบัญชีได้ ไม่ใช่แค่อ่าน

## References

REQ-009, AC-009.1, AC-009.2, DES-018, DEC-018

## Scope

ครอบ endpoint อ่านคำถาม ส่งคำตอบ ผล quest และชุดเป้าหมายทั้งหมด · กติกา/กลไกเดียวกับ BE-037 (จุดเดียวกัน) · จนกว่า OQ-15 จะปิด เปิดใช้จริงไม่ได้

- Security-sensitive: yes

## Out of Scope

กติกา entitlement ของ `sb-compass` · endpoint อื่นที่ไม่ใช่การกั้น · สคีมา

## Expected Output

none

## Acceptance

AC-009.1: ทุก endpoint ของ Module I-b (รวม Target Major Rules) ตรวจสิทธิ์ Premium ที่เซิร์ฟเวอร์ก่อนอ่าน/เขียน
AC-009.2: ผู้ใช้ที่ไม่มีสิทธิ์ไม่ได้ข้อมูลและไม่มีทางเขียนข้อมูลกลับ — fail-closed ทุกจุด

## Dependencies

BE-027, BE-041

## Handoff

ตรวจ AC-009.1/AC-009.2 ด้วยการยิง endpoint ทุกตัว (รวม BE-041/042/043) ในสามสถานะ — ไม่มีสิทธิ์ต้องไม่ได้ข้อมูลและไม่มีการเขียนเกิด — เก็บผลราย endpoint เป็นหลักฐาน
ชั้นกั้นครอบ endpoint — revert ได้ทางเทคนิคแต่ห้ามเปิดโมดูลให้ใช้จริงโดยไม่มีชั้นนี้
ส่งต่อ reviewer

Back-links: `INDEX.md`
