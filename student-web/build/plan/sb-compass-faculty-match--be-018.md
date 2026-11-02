# BE-018 — Replace-path data swap transaction

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

transaction สลับข้อมูลของเส้นทาง 'replace' — ลบแถวน้ำหนัก/mิติ/cluster ชุดเก่า → เขียนชุดใหม่ → อัปเดต `source_id`/`ai_raw_response`/`reviewed_by`/`reviewed_at`/`updated_at` ในทรานแซกชันเดียว เด็กยังเห็นชุดที่อนุมัติไว้เดิมจนกว่าจะสลับเสร็จ ห้ามเขียนทับข้อมูล approved ก่อนคนกดอนุมัติ (DES-019 §9) — สาขาที่ใช้งานอยู่ต้องไม่หาย/เพี้ยนช่วงระหว่างรอตรวจเอกสารใหม่ — การสลับครึ่ง ๆ ทำให้เด็กเห็นข้อมูลผสมกันครึ่งเล่มเก่าครึ่งเล่มใหม่

## References

REQ-003, AC-003.3, DES-019, DEC-019

## Scope

ทุกอย่างในทรานแซกชันเดียว — ล้มตรงไหน rollback ทั้งชุด · สาขาที่เคย approved คงสถานะ approved + ข้อมูลชุดเดิมจนกว่าอนุมัติชุดใหม่ · สาขาที่หายไปจากเอกสารใหม่ห้ามลบอัตโนมัติ (คงสถานะเดิม)

- Security-sensitive: yes

## Out of Scope

แถว approved ก่อนคนกดอนุมัติ · intake เดิม (เก็บเป็นประวัติ) · สคีมา

## Expected Output

none

## Acceptance

AC-003.3: การนำเอกสารฉบับใหม่มาแทนทำให้สาขากลับไปรอตรวจ และข้อมูลชุดใหม่ถึงเด็กเฉพาะหลังอนุมัติ — ข้อมูลชุดเก่าที่ approved อยู่ไม่หายไปจากผลของเด็กระหว่างรอ

## Dependencies

BE-017

## Handoff

ตรวจ AC-003.3 ด้วยสถานการณ์จริง: อัปโหลดเอกสารใหม่ของสาขาที่ approved อยู่ → ตรวจว่าเด็กยังเห็นชุดเดิม → อนุมัติชุดใหม่ → เห็นชุดใหม่ในทรานแซกชันเดียว (จำลองล้มกลางทางต้อง rollback ครบ) — เก็บผลสถานการณ์เป็นหลักฐาน
transaction ล้ม = rollback ครบตามธรรมชาติ · revert โค้ดไม่ย้อนการสลับที่เสร็จแล้ว (ประวัติอยู่ใน intake/source)
ส่งต่อ reviewer

Back-links: `INDEX.md`
