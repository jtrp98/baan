# BE-034 — Quest attempt endpoint

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

endpoint `public."TCompassQuestAttempt"` — state machine `suggested`→`accepted`→`done` ทางเดียวห้ามถอยกลับ, ทำซ้ำสร้างแถวใหม่ได้, `reflection` ห้ามส่งออกนอกระบบและห้ามส่งให้ AI (REQ-010) — reflection เป็นความคิดเห็นส่วนตัวของเด็กที่ให้มาโดยคาดหวังว่าไม่มีใครอื่นเห็น — ข้อมูลชิ้นนี้ห้ามออกนอกระบบเด็ดขาด

## References

REQ-008, AC-008.1, REQ-010, AC-010.2, DES-025, DEC-025, DES-018, DEC-018

## Scope

state machine บังคับที่เซิร์ฟเวอร์ · ทำซ้ำ = INSERT แถวใหม่ · reflection เก็บในตารางของโมดูลเท่านั้น — ไม่มีทางส่งออก (ไม่ log แบบเปิดเผย ไม่ส่งบริการภายนอก)

- Security-sensitive: yes

## Out of Scope

คลัง quest (อ่านอย่างเดียว) · ผล RIASEC · สคีมา

## Expected Output

none

## Acceptance

AC-008.1 (ฐาน attempt): เด็กยอมรับ/ทำ quest จบได้จริงตาม state machine ทางเดียว และทำซ้ำได้โดยไม่ทับประวัติเดิม
AC-010.2: reflection ไม่มีทางออกไปยัง AI ภายนอกหรือบริการภายนอกใด — สิ่งที่ออกจากระบบยังคงเป็นเอกสารหลักสูตรเท่านั้น

## Dependencies

BE-033

## Handoff

ตรวจ AC-008.1 (ฐาน attempt) ด้วยการเดินสถานะจริง + พยายามถอยกลับ (ต้องถูกปฏิเสธ) + ทำซ้ำ (แถวใหม่) · ตรวจ AC-010.2 ด้วยการตรวจทุกเส้นทางออกของ reflection (log/ส่งต่อ) ว่าไม่มีจุดส่งออก — เก็บผลเป็นหลักฐาน
endpoint เขียนตารางของตัวเอง — revert ได้ · attempt ที่เกิดแล้วเป็นประวัติของเด็ก
ส่งต่อ reviewer

Back-links: `INDEX.md`
