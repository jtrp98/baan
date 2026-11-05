# BE-016 — RecomputeAsync MeanScore per level x subject from weighted values

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

`RecomputeAsync` (`:382`, `:409`): เปลี่ยน mean ต่อ (ระดับชั้น × กลุ่มสาระ) จากเฉลี่ยของค่าเฉลี่ยดิบ เป็นเฉลี่ยของค่าที่**ถ่วงน้ำหนักแล้ว** — mean นี้ถูกเขียนลง `public."TCompassLevelSubjectStat"` เพื่อเทียบข้ามโรงเรียน และเป็นประชากรเดียวกับที่ `"StddevScore"` ใช้ — ต้องมาจากค่าถ่วงน้ำหนักชุดเดียวกันมิฉะนั้น T-Score ปลายทางเพี้ยนแบบไม่มีอะไรฟ้อง (DES-021 ตาราง `:382`/`:409` + § `"StddevScore"` ข้อ 1)

## References

REQ-004, REQ-017, AC-004.1, AC-004.2, DES-021

## Scope

แก้เฉพาะสูตร mean ต่อ (ระดับชั้น × กลุ่มสาระ) — ประชากรที่ใช้ต้องเป็นชุดเดียวกับที่นับเข้า `"StudentCount"` และที่ stddev ใช้;
ค่าคะแนนรายนักเรียนที่เข้าสูตรคือค่าถ่วงน้ำหนักแล้วจาก BE-014

- Security-sensitive: no

## Out of Scope

ห้ามใช้ค่าเฉลี่ยดิบในสูตรใหม่; ห้ามแตะประชากร/`"StudentCount"` ให้ต่างจากที่ stddev ใช้; ห้ามแตะเกณฑ์/พฤติกรรม REQ-010 เดิม

## Expected Output

none

## Acceptance

AC-004.1: ค่า mean ใหม่ต้องทำให้การเทียบ/อันดับที่อ่านจากตารางสอดคล้องกับค่าถ่วงน้ำหนักของ batch ทั้งระบบ
AC-004.2: mean ที่เขียนลงตารางคำนวณจากค่ากลุ่มสาระถ่วงน้ำหนักของ batch รอบเดียวกัน

## Dependencies

BE-014

## Handoff

ตรวจ AC-004.1 และ AC-004.2 โดย recompute ด้วยชุดข้อมูลที่ค่าถ่วงน้ำหนักต่างจากค่าดิบชัดเจน แล้วอ่าน `"MeanScore"` จากตารางจริงเทียบกับการคำนวณด้วยมือ;
ยืนยันว่า stddev ของแถวเดียวกันใช้ประชากรชุดเดียวกัน
คืนสูตรเดิมต้อง recompute ใหม่ทั้งเครือข่ายให้ค่าในตารางสอดคล้อง — เปลี่ยน/ถอดต้องอยู่ในรอบ deploy เดียวกับ BE-014/BE-015/BE-017 และตามด้วย recompute (ดู Sequencing Notes)
ส่งต่อ reviewer

Back-links: `INDEX.md`
