# BE-042 — Set-target endpoint

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

endpoint ตั้งเป้าหมาย — เรียก `CanSetAsTarget` (BE-041) ก่อนเขียนเสมอ, เมื่อผ่าน gate ให้ทำเครื่องหมายสาขาเดิมที่ active อยู่เป็น `Status='superseded'`, `SupersededAt=now()` ใน transaction เดียวกัน ก่อนเขียนแถวใหม่ `Status='active'` พร้อม `RiasecResultID` snapshot ที่ผ่าน gate (OQ-F14 ปิดแล้ว: 1 active target) — การเขียนก่อนเรียก gate แม้ครั้งเดียวคือช่องทางให้เป้าหมายเกิดโดยไม่ผ่านกติกา — และการบังคับ 1 active target (OQ-F14) ต้อง supersede แถวเดิมก่อน insert ใหม่ เพื่อไม่ให้ชน partial unique index

## References

REQ-017, AC-017.1, AC-017.2, DES-021, DEC-021

## Scope

เรียก gate ก่อนเขียนทุกคำขอ (ลำดับในโค้ดเดียวกัน) · หากมีแถวเดิมที่ active อยู่ ต้อง supersede ก่อน insert แถว active ใหม่ใน transaction เดียวกันเสมอ · บังคับ 1 active target ต่อคน

- Security-sensitive: yes

## Out of Scope

query ของ gate (BE-041) · ตาราง RIASEC result · สคีมา

## Expected Output

none

## Acceptance

AC-017.1 (ฐาน endpoint): การตั้งเป้าหมายเกิดได้เฉพาะผ่าน gate เสมอ — ไม่มีเส้นทางเขียนแถว active ที่ข้าม gate
AC-017.2 (ฐาน endpoint): การตั้งที่ผ่าน gate ทำการ supersede แถวเดิม (ถ้ามี) และเขียนแถว active ใหม่สำเร็จพร้อม snapshot ของรอบที่ผ่าน gate — มีแถว active คงอยู่เพียง 1 รายการเสมอ

## Dependencies

BE-041

## Handoff

ตรวจ AC-017.1/AC-017.2 (ฐาน endpoint) ด้วยการเรียกจริง: ผ่าน gate โดยไม่มีเป้าหมายเดิม (active แถวแรกเกิด), ผ่าน gate โดยมีเป้าหมายเดิม (แถวเดิมกลายเป็น superseded + แถวใหม่ active), ไม่ผ่าน gate (ไม่มีแถวเกิด + 409/400) — เก็บผลเป็นหลักฐาน
endpoint ใหม่ additive — revert ได้ · แถวที่เขียนแล้วถูกจัดการด้วย supersede ไม่ใช่การลบ
ส่งต่อ reviewer

Back-links: `INDEX.md`
