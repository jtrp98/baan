# BE-037 — Premium entitlement wiring (Module H)

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

เชื่อม `CheckEntitlement` + `compass_premium` เข้าทุก endpoint ของ Module H — fail-closed (403) ห้าม fail-open ห้ามคืน payload แล้วให้หน้าจอซ่อน (กติกา Premium เดิมของ `sb-compass` `## Premium Entitlement Rules` — ใช้กติกาเดิมห้ามเขียนใหม่ สัญญาอยู่นอก design.md ของโมดูลนี้) — บล็อกที่ `sb-compass` OQ-15(a1)/(a2) — โมดูลนี้เป็น Premium ทั้งหมด — การคืน payload แล้วให้หน้าจอซ่อนคือการให้ข้อมูลเด็กไหลออกถึงคนที่จ่ายไม่และไม่มีสิทธิ์

## References

REQ-009, AC-009.1, AC-009.2, DES-018, DEC-018

## Scope

ตรวจสิทธิ์ก่อนคืนข้อมูลทุก endpoint · ตัวกลไก entitlement เป็นของภายนอก — โมดูลเรียกตรวจและบังคับผลเท่านั้น · จนกว่า `sb-compass` OQ-15(a1)/(a2) จะปิด งานเขียนได้แต่เปิดใช้จริงไม่ได้

- Security-sensitive: yes

## Out of Scope

กติกา entitlement ของ `sb-compass` (ใช้ตามเดิม) · endpoint ของ Module H อื่นที่ไม่ใช่การกั้น · สคีมา

## Expected Output

none

## Acceptance

AC-009.1: ทุก endpoint ของ Module H ตรวจสิทธิ์ Premium ที่ฝั่งเซิร์ฟเวอร์ก่อนคืนข้อมูล
AC-009.2: ผู้ใช้ที่ไม่มีสิทธิ์ไม่ได้ข้อมูลกลับไปเลย (403 fail-closed) — ไม่ใช่คืนข้อมูลแล้วให้หน้าจอซ่อน

## Dependencies

BE-022

## Handoff

ตรวจ AC-009.1/AC-009.2 ด้วยการยิงทุก endpoint ในสามสถานะ (มีสิทธิ์/ไม่มีสิทธิ์/ตรวจไม่ได้) — ไม่มีสิทธิ์/ตรวจไม่ได้ต้องไม่ได้ payload กลับ — เก็บผลราย endpoint เป็นหลักฐาน (เปิดใช้จริงหลัง OQ-15 ปิด)
ชั้นกั้นครอบ endpoint — revert ได้ทางเทคนิคแต่ห้ามเปิดโมดูลให้ใช้จริงโดยไม่มีชั้นนี้
ส่งต่อ reviewer

Back-links: `INDEX.md`
