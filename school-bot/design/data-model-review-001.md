# ผลตรวจคู่มือข้อมูล — รอบ 001

วันที่: 2026-10-23 · ที่มา: ผู้ใช้แจ้งว่า data-model ไม่อธิบายหน้าที่ตาราง/ฟิลด์และตารางเก่าที่ใช้

## ผลที่บันทึก

ปรับ [data-model.md](data-model.md) เป็น Rev6 โดยคง SQL/DBML และสัญญาเดิม เพิ่มคู่มืออ่านตามงาน หน้ารายตาราง แผนภาพ JSON ตัวอย่าง และแผนที่ตารางเดิม

| รายการ | ผลตรวจ |
|---|---|
| ตาราง SchoolBot | ครบ 32 ตารางตรงกับ CREATE TABLE ใน SQL |
| ฟิลด์ | ครบ 450 ฟิลด์: เฉพาะงาน 226 + PK 32 + ฟิลด์ร่วม 192; ชื่อ/ชนิด/NULL ตรง SQL |
| ความสัมพันธ์ใน SQL | ครบ 40 FK รวม FK ที่ประกาศผ่าน ALTER TABLE |
| ตาราง/วิวเดิม | 27 รายการ พร้อมฟิลด์ที่เกี่ยวข้อง เส้นทางเชื่อม ขอบเขตอ่าน/เขียน และ source references |
| สัญญา Rev5 | ตรวจว่าข้อความทุกบรรทัดของเนื้อหาสัญญาเดิมคงอยู่ในภาคผนวก; ปรับเฉพาะพาธลิงก์ให้สัมพันธ์กับที่เก็บใหม่ |
| ต้นฉบับ | เก็บ [Rev5](archive/2026-10-23-before-readable-data-model/data-model.md) แบบ byte-for-byte และ hash ตรง |
| SQL/DBML | SHA-256 หลังทำเอกสารตรงกับก่อนเริ่มงาน |
| ลิงก์ | ตรวจปลายทางไฟล์และเลขบรรทัดอ้างอิงของคู่มือ/ภาคผนวกใหม่ ไม่มีปลายทางขาด |

นี่เป็นการตรวจความครบถ้วนของเอกสาร ไม่ใช่ผล QA ของแอป API ฐานข้อมูล หรือการส่งคะแนน ไม่มีการรัน SQL/ทดสอบฐานจริง และไม่เปลี่ยนสถานะ 74 งานในแผน

## หลักฐานต้นทาง

- ใบงาน: [task-009.md](../planning/task-009.md)
- เปิด arch จริงผ่าน `baan-role --agent codex --role arch --tier t1 --date 2026-10-23` แบบ read-only; จบ exit 0 / DONE
- รายงาน: `C:/src/AICode/baan/baan/reports/2026-10-23-01-44-28-arch-tier-t1-1agents-VwnEw4/codex.answer.txt`
- ใช้ config แยกที่ไม่มี knowledge roots เพื่อไม่ให้ตัวรัน auto-commit; ไม่มี state-changing git
- SQL ก่อน/หลัง: `2607a5177eafe53621619c21129ac7e2c7542e86a69ec86b0a1c94a8be8ee7a6`
- DBML ก่อน/หลัง: `8ab66eb5002fefade1ca405ac2192ba2e41b239f7c93c784f69fcc633cfbd3eb`
- data-model Rev5 archive: `c23ec3ab918a7176b571d559af581145f58bc592bfcd67c449e39e545c7170fd`

## ข้อสังเกตจาก source

ชื่อ `PGTGradeEdits`, การใช้ `SchoolID`/`SchoolId` และชื่อ column/CLR ถูกแยกในหน้ารายตารางเดิม ไม่เติม `TEmployees.WorkStatus` ซึ่งไม่พบใน entity ที่ตรวจ ไม่ถือว่า AccountId เท่ากับ SId/SEmp และไม่เลือก roster/writer contract แทนหลักฐานที่ยังขาด รายละเอียดครบที่ [ขอบเขตหลักฐาน](data-evidence-001.md)

## Change Log

- 2026-10-23 — นายช่างบันทึกผล arch และตรวจความครบถ้วนของคู่มือจาก SQL/source ตามคำติผู้ใช้
