# ผลตรวจ DBML — รอบ 002

วันที่: 2026-10-23 · ใบงาน [013](../planning/task-013.md) · ต่อจาก arch DONE และ [ผล vault](../db/review-006.md)

ผู้คุมบันทึก patches ของ arch แล้วตรวจด้วย @dbml/core 10.3.1, Parser.parse(text, 'dbmlv2') ทั้งสองไฟล์ผ่าน parser

| ไฟล์ | ตาราง | ฟิลด์ | FK จริง | Logical refs |
|---|---:|---:|---:|---:|
| schoolbot.dbml Rev5 | 32 | 450 | 40 | 0 |
| schoolbot-integration.dbml Rev2 | 24 | 112 | 4 | 12 |

เทียบ exported schemas กับ model ก่อนแก้: names/types/NULL/default/PK/unique/increment/indexes/enum/FK endpoints/actions/inactive flags เหมือนเดิม ข้ามเฉพาะ notes/colors/groups และ parser metadata; การเปลี่ยนรอบนี้เป็น annotations และลิงก์ canonical rules ไม่เปลี่ยน structural model

เก็บไฟล์เดิมแบบ byte-for-byte ที่ design/archive/2026-10-23-before-decisions-032-034 ตาม archive.md ก่อนบันทึกทุกไฟล์ของ arch; SQL SHA-256 คงเดิม 2607a5177eafe53621619c21129ac7e2c7542e86a69ec86b0a1c94a8be8ee7a6

ผลนี้ปิดเฉพาะข้อค้าง parser ที่ arch แจ้ง ไม่ใช่การรัน SQL การรับรอง application invariants หรือ runtime/grade/hardware/release acceptance คง gate เดิม และให้ inspect/check พิสูจน์ race/partial/crash/missing-vs-zero ตามสัญญาเมื่อมี implementation

## Change Log

- 2026-10-23 — นายช่างบันทึกผล parser/semantic model หลังรับ output arch และยืนยัน SQL ไม่เปลี่ยน
