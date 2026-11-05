# BE-024 — Module H edge cases

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

กรณีขอบทั้งหมดของ Module H — เด็กยังไม่มีคะแนนเลย → สถานะ "รอครูกรอกผลสอบ" ไม่ใช่รายการว่าง/error, คลัง approved ว่าง → ข้อความคลังยังไม่พร้อม, น้อยกว่า 10 → แสดงเท่าที่มีห้ามเติมของปลอม, สาขาไม่มีแถวน้ำหนัก → ตัดออกจากผู้สมัคร, % เสมอกัน → เรียง `program_name` ordinal ascending, สาขา pending_review/retired → ไม่โผล่เลย, สาขาผูกหลาย cluster → แสดงครั้งเดียว (หมวด Program Matching §4) — ทุกกรณีนี้ requirement ไม่ได้ระบุเอง — เอกสารกำหนดไว้เพื่อกัน "หน้าว่าง/ตัวเลขปลอม/เรียงไม่นิ่ง" ซึ่งเป็นความล้มเหลวที่เด็กเห็นก่อนใคร

## References

REQ-006, AC-006.2, AC-006.3, DES-020, DEC-020

## Scope

พฤติกรรมทั้งเจ็ดกรณีคงตามสัญญาเป๊ะ · การเรียงต้องนิ่งทุกครั้งที่เปิด · สาขาที่ไม่ approved ไม่มีทางโผล่แม้แบบเทา

- Security-sensitive: yes

## Out of Scope

สูตร % (BE-023) · ตารางคลัง (อ่านอย่างเดียว) · สคีมา

## Expected Output

none

## Acceptance

AC-006.2: คลังที่ approved มีน้อยกว่า 10 สาขา แสดงเท่าที่มี — ห้าม error และห้ามเติมของปลอมทุกกรณี
AC-006.3: ถ้าเด็กยังไม่มีคะแนนในระบบเลย แสดงสถานะรอครูกรอกผลสอบ — ไม่แสดงหน้าว่างหรือ error

## Dependencies

BE-023

## Handoff

ตรวจ AC-006.2/AC-006.3 ด้วยการจำลองทุกกรณีขอบ (คลังว่าง/น้อยกว่า 10/ไม่มีน้ำหนัก/เสมอกัน/ไม่มีคะแนน) แล้วเทียบพฤติกรรมกับสัญญา — เก็บผลทุกกรณีเป็นหลักฐาน
เป็นตรรกะภายใน endpoint — revert ได้ · ไม่เขียนข้อมูลถาวร
ส่งต่อ reviewer

Back-links: `INDEX.md`
