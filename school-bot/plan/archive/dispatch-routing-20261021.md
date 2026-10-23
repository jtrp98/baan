# Dispatch routing เดิม

ข้อความก่อน Rev2 เก็บเป็นประวัติ ใช้ queue-002.md สำหรับคิวปัจจุบัน

ทุก role ส่ง นายช่าง เท่านั้น ผู้คุมเลือกผู้รับจากงานที่ depends_on task นั้นพร้อมตรวจ gates ไม่ให้ role เรียกต่อกันเอง

| กลุ่มผู้ส่ง | ผู้รับถัดไปและหลักฐาน |
|---|---|
| BA-001..004 | มนุษย์ตัดสินผ่านผู้คุม แล้ว SA/UX/DBA/TP ตามสาย; decision pack ต้องมีทางเลือก ผลกระทบ และผู้ตอบ |
| BA-005/006 | BE-015/016/017 และ FE-013 ผ่านผู้คุม; ส่ง approved inventory/criteria/rubric/คู่ผ่าน-ไม่ผ่าน |
| SA | DBA/SEC/BE และเจ้าของ contract ผ่านผู้คุม; ส่ง revision, consumer impact และข้อรอคน |
| DBA | ผู้มีอำนาจ schema/ผู้รัน SQL และ BE ผ่านผู้คุม; ส่ง SQL/rollback หรือผลตรวจ human evidence ไม่รันเอง |
| UX | มนุษย์ UX sign-off แล้ว FE ผ่านผู้คุม; ส่ง artifact revision และ flow/failure coverage |
| TP | QA และผู้ทำ fixture ตาม dependencies ผ่านผู้คุม; ส่ง AC/platform/store/mode matrix และวิธีพิสูจน์ |
| BE/FE | ผู้ทำ consumer ถัดไปและ QA ตาม task DAG ผ่านผู้คุม; ส่ง artifact/source changes/checks/ข้อจำกัด |
| QA | นายช่าง รับ verdict บันทึก index แล้วส่งผู้แก้หรือ PM; ห้าม PM ลง verified/blocked แทน |
| SEC | ผู้แก้/มนุษย์รับความเสี่ยง/PM ผ่านผู้คุม; ส่ง findings, severity, RC hashes และ retest |
| PM-001 | เจ้าของ release/shared environment/ผู้ตรวจรับผ่านผู้คุม; ส่ง full-scope evidence pack |
| PM-002 | ผู้คุม/ผู้ใช้รับ receipts และ handover จริง; ไม่มีการ dispatch deployment จากบทบาท PM เอง |

## Change Log
- 2026-10-23 — แยกประวัติจากdispatch-001.mdเพื่อคุมขนาด ไม่ลบหลักฐานเดิม
