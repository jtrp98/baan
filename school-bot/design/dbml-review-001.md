# ผลตรวจ DBML — รอบ 001

วันที่: 2026-10-23 · ที่มา: ผู้ใช้ขอ DBML ให้เห็นภาพชัดขึ้น · ใบงาน [010](../planning/task-010.md)

## ผลตรวจ

| รายการ | ผล |
|---|---|
| แบบเต็ม schoolbot.dbml Rev4 | 32 ตาราง / 450 ฟิลด์ / 40 FK / 10 กลุ่มสี |
| คำอธิบาย | ทุกตารางมีหน้าที่ หนึ่งแถว ขั้นตอนที่ใช้ ตัวอย่างสมมติ และขอบเขต; ทุกฟิลด์มี Note ภาษาไทยจาก dictionary พร้อมคง technical note เดิม |
| ภาพ integration Rev1 | 24 ตาราง / 112 ฟิลด์: SchoolBot 10 + legacy 14; FK จริง 4 และ logical mapping เส้นประสีส้ม 12 |
| Parser | ทั้งสองไฟล์ผ่าน `@dbml/core 10.3.1`, `Parser.parse(text, 'dbmlv2')` |
| เทียบสัญญา | เปรียบเทียบ exported parser model ของแบบเต็มก่อน/หลัง: ชื่อตาราง/ฟิลด์ ชนิด NULL/default PK/unique/increment indexes enum และ FK/actions เหมือนเดิม เปลี่ยนเฉพาะ notes/colors/groups |
| FK ใน integration | 4 เส้นเป็น subset ของ FK เดิมและ endpoint ตรงกัน; 12 logical refs มีชื่อ LOGICAL_*, inactive=true, สี #EA580C |
| ตารางเดิม | ใช้ชื่อ physical table/column จาก arch/EF และเทียบกับ legacy dictionary; ไม่เติม PK/UNIQUE หรือยืนยัน physical type ของ string ที่ยังไม่พิสูจน์ |
| SQL | SHA-256 คงเดิม `2607a5177eafe53621619c21129ac7e2c7542e86a69ec86b0a1c94a8be8ee7a6` |
| Archive | เก็บ [DBML Rev3](archive/2026-10-23-before-dbml-notes/schoolbot.dbml) byte-for-byte; SHA-256 `8ab66eb5002fefade1ca405ac2192ba2e41b239f7c93c784f69fcc633cfbd3eb` |

นี่คือการตรวจเอกสารและ parser ไม่ใช่การรัน migration/DB หรือการยืนยัน writer คะแนนจริง ไม่เปลี่ยนสถานะ implementation/release

## หลักฐานและข้อจำกัด

arch ตรวจแบบ read-only ผ่าน `baan-role --agent codex --role arch --tier t1 --date 2026-10-23` จบ DONE / exit 0 รายงาน: `C:/src/AICode/baan/baan/reports/2026-10-23-02-42-54-arch-tier-t1-1agents-BPbdW4/codex.answer.txt`

namespace ของ legacy ใช้แยกฐานในภาพเท่านั้น ไม่ใช่ schema deploy; เส้นประเป็น application mapping ไม่ใช่ FK ข้าม DB จึงห้ามใช้ integration DBML สร้าง SQL

ไม่วาด join บัญชี→profile ที่ยังไม่พิสูจน์ ไม่วาด JSON/array→integer เป็น FK และไม่เพิ่ม CourseRunId ใน Submission; เส้นทางเหล่านี้อธิบายใน Note แทน ขอบเขตการเขียนคะแนนและการตรวจ roster ยังคงตามแบบเดิม

parser แบบ legacy ไม่รองรับ group settings/inactive refs บางส่วน จึงใช้ DBML v2 ตาม syntax visualization ปัจจุบัน คู่มือและไฟล์พร้อมอ่านที่ [dbml-guide-001.md](dbml-guide-001.md)

## Change Log

- 2026-10-23 — นายช่างบันทึกผล arch และผลตรวจ parser/semantic model ของ DBML ทั้งสองภาพ พร้อม archive ก่อนแก้
