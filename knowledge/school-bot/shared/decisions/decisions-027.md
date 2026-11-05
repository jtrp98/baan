---
owner: spec
---
# มติที่ตั้งฐานข้อมูล SchoolBot
> หมายเหตุ 2026-11-02: ข้อความเดิมที่มตินี้แทนอยู่ใน `../../build/design/data-model.md` ฉบับก่อน (git commit `e116d0a`) ไม่ได้อยู่ในตัวมติ 011 — มติ 011 ยังมีผลเรื่องใช้ฐานข้อมูลเดิมสี่ตัว

## คำตอบผู้ใช้ — 2026-10-22

ผู้ตอบ: ผู้ใช้ในแชตนี้ หลังเห็นว่า SQL วางตาราง SchoolBot ไว้ใน School DB

"SchoolBot ใน 10.0.0.128 Port 9499 อันนี้นะ ไม่ใช่ SchoolDB"

## ข้อกำหนดที่ยืนยัน

- ตาราง SchoolBot ทั้ง 33 ตารางอยู่ในฐานข้อมูล SchoolBot ที่ host `10.0.0.128` port `9499` ไม่ใช่ School DB (JabjaiSchoolSingleDB)
- มตินี้แทนข้อความใน [decisions-011](decisions-011.md) และ data-model ที่ว่า "วางทุกตาราง SchoolBot ใน School DB / ไม่เพิ่ม DB ที่ห้า" — SchoolBot ใช้ DB ของตัวเองเพิ่มจาก 4 DB เดิม (Master, School, Logs, PGGradeDB) ซึ่งยังใช้อ่าน/เขียนตามมติเดิม
- ไม่บันทึก credential ใดๆ ใน knowledge; นายช่าง และทีมไม่ต่อ DB นี้เอง

## การตีความที่ยังไม่ยืนยัน (สมมติฐาน — ยังไม่ยืนยัน)

- ชื่อ database บน server นั้นคือ `SchoolBot` และเป็น PostgreSQL schema `public` เช่นเดียวกับ DB เดิม
- server 10.0.0.128:9499 เป็น cluster คนละตัวกับ School DB/PGGradeDB จึงต้องสร้าง role `schoolbot_app` แยกในแต่ละ cluster

## ผลกระทบ

- SQL: แยกเป็น SchoolBot DB (ตาราง 33 ตาราง) + School DB (GRANT SELECT ตาราง legacy เท่านั้น) + PGGradeDB (GRANT ตาม gate เดิม) — ดู db/review-004 (memory: db/review-004.md)
- ความสัมพันธ์กับข้อมูลเดิม (TUser, TEmployees, TPlanCourse ฯลฯ) เป็น logical ID ข้าม DB อยู่แล้ว ไม่มี physical FK — ไม่ต้องเปลี่ยน schema
- การตรวจสิทธิ์ครู/roster/term ที่เคยคิดว่าอ่านใน DB เดียวกัน ต้องอ่านผ่าน connection School DB แยก → ไม่มี transaction เดียวครอบ SchoolBot + School DB; ต้อง re-check ก่อน commit ตามแบบ DES-009/011 (SA ต้อง amend data-model/DES ที่อ้าง "School transaction เดียว")
- SA ที่กำลัง sync baseline (สั่งก่อนมตินี้) ยังเขียน placement เป็น School DB — ต้อง amend ต่อหลังได้ผล

## Change Log

- 2026-10-22 — MYCELIUM บันทึกคำสั่งผู้ใช้; แทน placement ใน decisions-011

- 2026-10-23 — นายช่าง (BAAN) ปรับชื่อผู้คุมจาก MYCELIUM เป็นนายช่าง ในข้อความส่งต่อ ตามการเปลี่ยนชื่อระบบเป็น BAAN (release 0.12.0) — รายการลงวันที่เดิมที่อ้าง MYCELIUM คงไว้ตามประวัติ
