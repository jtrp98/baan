ผลตรวจใบงาน 012: ต้องแก้สัญญาแบบตาม V012-02..08 ก่อนส่งต่อ implementation ยังไม่ร้องขอ physical schema delta

วันที่ของงาน: 2026-10-23

ขอบเขต: อ่าน index ก่อนตรวจ decisions-032..034, SQL/rollback, review-005, proposal-learnerkind, DES-004/005/008..011, data-contract-rules และ dictionary table-012..032 พร้อมภาคผนวก JSON/legacy/DBML ที่เชื่อมตรงกับงาน ทุกพาธด้านล่างอ้างจาก knowledge/school-bot/ ไม่เขียนไฟล์ ไม่รัน SQL ไม่ต่อ DB และไม่แตะ source Git

| ประเด็น | หลักฐาน SQL | สิ่งที่บังคับจริง / ส่วนที่แอปต้องรับผิดชอบ |
|---|---|---|
| ทาง A | db/schoolbot_db.sql:283,680,799 | Project แยกชนิดเจ้าของ; การห้าม employee สร้างผลและการอ่านผลตามชนิด profile เป็น authorization ของแอป |
| ช่องเดิม/cardinality | db/schoolbot_db.sql:879,911,916,939 | unique กัน active ownership และ mapping ตามคู่คีย์; Sources หนึ่งกิจกรรมและบริบทข้ามตาราง/DB ต้องตรวจในแอป |
| ประวัติ mapping | db/schoolbot_db.sql:920,941,952,982 | มี JSON/snapshot เก็บประวัติ แต่ไม่มี Mapping.Revision หรือข้อบังคับ immutability; ต้องปิดทางแก้/ลบ/retire หลบประวัติ |
| น้ำหนักรายรอบ | db/schoolbot_db.sql:579,616,643,658 | มี revision/pointer/JSON; ผลรวม น้ำหนัก frozen และ allow-list ครูปรับเป็นกติกาแอป |
| ผลต่อรอบเรียน | db/schoolbot_db.sql:680,801 | Attempt ผูก run; Submission ไม่ผูก run ต้องนิยามการเลือกผล project เมื่อใช้ revision เดิมซ้ำ |
| Preview/Export/Outbox | db/schoolbot_db.sql:990,1012,1044 | กันรายการซ้ำตามคีย์ใน SchoolBot DB; missing รายช่อง การจับคู่ export/item และ receipt ข้าม DB ต้องตรวจในแอป |
| การกู้ | db/schoolbot_db_rollback.sql:7,24 | rollback ลบตารางและข้อมูล ไม่ย้อนเกรดที่ส่งแล้ว ต้องใช้ reconcile ตาม receipt |

ผลเทียบเอกสาร: dictionary 21 ตาราง/300 ฟิลด์ตรงชื่อ ชนิด และ NULL กับ SQL แบบเต็มมี 32 ตาราง/450 ฟิลด์/40 FK โดย endpoints/actions ของ DBML ตรงกับ SQL นับ declaration ปัจจุบันได้ UQ 24, CHECK 80, unique indexes 13, non-unique indexes 0 ต้องแก้ยอดอ้างอิงเก่า 23/53/27 ใน review-005 และ schema-notes โดยรักษาประวัติไว้

ข้อจำกัด DBML ที่ตั้งใจแยกจาก mismatch: PlanCourseIds แสดง jsonb แทน integer[], enum แทน varchar/CHECK และ partial/deferred behavior อยู่ใน Notes; bigint/int8 เป็น alias ภาพ integration ระบุ subset และแยก logical/JSON/cross-DB mappings จาก physical FK ห้ามใช้สร้าง migration ผล parser เดิมอ้าง dbml-review-001:12; รอบนี้ไม่ได้รัน parser ใหม่ SQL SHA-256 ตรงกับหลักฐานเดิมใน dbml-review-001:16

ผู้รับต่อ: arch แก้สัญญาและคำอธิบายตาม findings; spec sync ข้อกำหนดตามมติที่ปิดแล้ว; inspect/check พิสูจน์ race และ recovery หลังแบบพร้อม; jpo พิจารณา PII ใน roster/คะแนน/snapshots คงประตูมนุษย์รัน SQL และเขียนเกรดจริง รวม G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB ไม่ถือว่าปิด OQ เท่ากับผ่าน runtime

schema_delta_required=false หมายถึงรอบนี้ยังไม่มี physical delta ที่ต้องเสนอ หาก arch พิสูจน์ไม่ได้ว่าข้อมูลเดิมรองรับสัญญาแก้แล้ว ให้ส่งกลับ vault ก่อนเขียน SQL ไม่มีการเสนอเพิ่ม index/constraint สวนมติเดิม

## Change Log

- 2026-10-23 — vault ตรวจ static เทียบมติ 032..034 ส่งหลักฐานและช่องว่างให้ arch โดยไม่แก้ไฟล์หรือดำเนินการกับฐานข้อมูล
