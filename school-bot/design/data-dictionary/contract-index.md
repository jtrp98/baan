# สัญญาชนิดข้อมูลและ JSON เดิม

[กลับคู่มือ](../data-model.md) · [ตารางทั้งหมด](index.md)

ภาคผนวกนี้รักษาสัญญา Rev5 ไว้ครบเพื่ออ้างอิงชนิดข้อมูล enum และโครงสร้าง JSON; คำอธิบายภาษางานอยู่ในหน้าของแต่ละตาราง

อ้าง REQ-011, 027–029, 033–039, 040–052; decisions-012, 013, 020–030; อ้าง physical DDL ปัจจุบันใน [db/schoolbot_db.sql](../../db/schoolbot_db.sql) และผลการตัดทอนใน [db/review-005.md](../../db/review-005.md) ชุดนี้เป็น CONFIRMED baseline (32 ตาราง)

| ส่วน | รายละเอียด |
|---|---|
| [ชนิดและกฎร่วม](contract-001.md) | ข้อความสัญญาเดิม |
| [ตารางครบทุก field นอก common columns/PK (32 ตาราง)](contract-002.md) | ข้อความสัญญาเดิม |
| [Enums และ embedded types](contract-003.md) | ข้อความสัญญาเดิม |
| [Legacy refs / placement](contract-004.md) | ข้อความสัญญาเดิม |
| [กฎข้อมูลและ HTTP contract ร่วม](contract-005.md) | ข้อความสัญญาเดิม |

`ProjectContent` อธิบายใน [DES-003](../des-003.md) และ `CriteriaRules` ใน [DES-005](../des-005.md); `Manifest` ใน [DES-007](../des-007.md)

Canonical เพิ่มเติม: [ผลเรียน](../learning-rules-032-034.md), [คะแนน](../grade-rules-032-034.md)

## Change Log
- 2026-10-23 — Rev2: sync032..034; physicalเดิม

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
