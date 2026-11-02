# สารบัญข้อมูลและฐานข้อมูล

[กลับสารบัญ design](index.md) · เริ่มจาก [data-model.md Rev8](data-model.md) แล้วเลือกตาราง/หัวข้อที่เกี่ยวข้อง

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [data-dictionary/index.md](data-dictionary/index.md) | ไม่ระบุ | สารบัญคำอธิบาย 32 ตาราง ทุกฟิลด์ ชนิด NULL และตัวอย่าง | พจนานุกรมของแบบปัจจุบัน |
| [data-dictionary/contract-index.md](data-dictionary/contract-index.md) | 5 | นิยามชนิด/enum/JSON และกฎของสัญญาข้อมูลเดิมที่แยกส่วน | สัญญาข้อมูลเดิม; ใช้คู่ SQL ปัจจุบัน |
| [data-legacy-001.md](data-legacy-001.md) | ไม่ระบุ | ตารางเดิมที่ใช้ mapping/join keys และขอบเขตอ่านเขียน | EVIDENCE/CONTRACT — ไม่ยืนยัน production mapping |
| [data-fields-001.md](data-fields-001.md) | ไม่ระบุ | ชนิดฟิลด์ NULL, primary key และ shared columns | คำอธิบายพจนานุกรม |
| [data-terms-001.md](data-terms-001.md) | ไม่ระบุ | แยก Mission/Activity, Submission/Attempt, Assessment และ export | คำอธิบายพจนานุกรม |
| [data-json-001.md](data-json-001.md) | ไม่ระบุ | Nested JSON ของข้อความ กิจกรรม ข้อสอบ policy น้ำหนักและ snapshot | คำอธิบายสัญญา JSON |
| [data-relations-001.md](data-relations-001.md) | ไม่ระบุ | เส้นทางข้อมูลจากเนื้อหาถึงงาน ข้อสอบ และเกรดเดิม | ภาพอธิบายแบบข้อมูล |
| [data-contract-rules.md](data-contract-rules.md) | 11 | Invariants/HTTP, UpdateDate, tenant/re-check และหน่วย commit | ฐานสัญญาเดิม; replay License 15 นาทีอนุมัติแล้ว |
| [schema-notes.md](schema-notes.md) | 7 | ข้อจำกัด SQL และ application relationships/validation | PK32/UQ0/FK0/CHECK0; runtime ยังไม่ยืนยัน |
| [schoolbot.dbml](schoolbot.dbml) | 7 | แบบเต็ม 32 ตาราง 450 ฟิลด์ Primary Key 32 รายการ | DBML ตรงฐานที่บันทึกไว้; ไม่ยืนยัน runtime |
| [schoolbot-integration.dbml](schoolbot-integration.dbml) | 3 | ภาพเฉพาะ legacy integration 24 ตาราง 112 ฟิลด์ | ภาพอธิบาย — physical FK0/logical16; ห้ามใช้สร้าง SQL |
| [dbml-guide-001.md](dbml-guide-001.md) | ไม่ระบุ | วิธีอ่านกลุ่มสี เส้น และข้อจำกัด syntax ของภาพ | คู่มือ DBML |
