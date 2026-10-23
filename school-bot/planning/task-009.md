# ใบงาน 009 — อธิบาย data model ให้อ่านรู้เรื่อง

วันที่ของงาน: 2026-10-23

ที่มา: ผู้ใช้ระบุว่า data-model อ่านไม่รู้เรื่อง ไม่เห็นหน้าที่ตาราง/ฟิลด์และตารางเก่าที่เกี่ยวข้อง

## ขอบเขต

ปรับคำอธิบายเอกสารเท่านั้นตาม SQL 32 ตารางปัจจุบัน ไม่เปลี่ยน schema/SQL/โค้ด/ข้อกำหนดหรือสถานะตรวจรับ ไม่รันฐานข้อมูล ไม่ใช้ state-changing git ผู้คุมบันทึกผล arch เข้า knowledge เอง

## งาน arch (read-only)

อ่าน design/index.md ก่อน แล้วอ่าน design/data-model.md, design/data-contract-rules.md, design/schema-notes.md, design/source-review-002.md, design/source-review-004.md, design/source-review-005.md, design/des-002.md ถึง des-005.md และ des-007.md ถึง des-012.md, db/index.md, db/schoolbot_db.sql, db/review-005.md ภายใต้ C:/src/schoolbright/knowledge/school-bot

ตรวจ source จริงเฉพาะ entity/context/repository/GradeService ที่ source-review ข้างต้นระบุภายใต้ C:/src/schoolbright/target/sb-tech-upgrade-academic; อนุญาต rg หา mapping entity ใน Common/Databases และ entity field ใน Entities เพื่อชี้ชื่อ table/column ให้ตรงจริง ห้ามอ่าน secret/connection string

ส่งผลทางคำตอบเป็น fenced JSON เดียว รูปแบบ {"tables":[{"name":"SchoolBot...","purpose":"ภาษาไทย","row":"หนึ่งแถวหมายถึงอะไร","example":"ตัวอย่างสมมติที่เข้าใจง่าย","used_by":"ขั้นตอนงานที่อ่าน/เขียน","columns":{"ชื่อฟิลด์":"คำอธิบายไทย มีหน่วย/ความหมาย null/ค่า enum สำคัญหรือความสัมพันธ์ถ้ามี"}}],"legacy":[{"database":"...","table":"ชื่อ physical table","purpose":"...","fields":[{"name":"ชื่อ physical column (ชื่อ CLR ถ้าต่างกัน)","meaning":"..."}],"relation":"SchoolBot table.field ใดใช้เชื่อม + โรงเรียน/เทอมประกอบ","access":"อ่าน/เขียนแบบมีเงื่อนไข/หลักฐานยังไม่พอ","evidence":"พาธไฟล์จริง:บรรทัด"}],"warnings":["ข้อเท็จจริงที่ยังยืนยันไม่ได้"]}

ต้องมี tables ครบ 32 ตาราง และ columns ครบทุก business field ตาม SQL (รวม PK ได้ แต่ common 6 ฟิลด์ไม่ต้องซ้ำ) ให้ความหมายเฉพาะฟิลด์แต่ละตัว ไม่แปลชื่อเฉย ๆ แยก SchoolBotAssessment ออกจาก PGTAssessment, Mission/Activity, Submission/Attempt, GradeSlot/ScoreMapping, Preview/Export/Outbox ชัดเจน แสดงว่าไม่สร้าง SchoolBotUser และ AccountId ไม่เท่ากับ SId/SEmp ตัดสินธุรกิจหรือแก้สัญญาไม่ได้ สิ่งที่พิสูจน์ไม่ได้ให้ติดป้าย ห้ามอ้างผลระบบ production

ตารางเก่าต้องครอบคลุมบัญชี/โรงเรียน/profile/วิชา/ห้อง/ปีเทอม/ครูรายวิชา/roster/คะแนน/override/ล็อก/audit ตามแบบจริง ระบุ Logs DB หากยังไม่มี use case ชัดเจน ห้ามแต่งตารางขึ้นมา

ห้ามเขียนไฟล์ใด ๆ; ผู้คุมจะนำ JSON ไปทำคู่มือ ภาคผนวก field dictionary และแผนที่ legacy เอง จบด้วย handoff สั้นและ DONE เมื่อคำอธิบายครบ ไม่เปิดประตู schema ใหม่จากงานคำอธิบาย

## Change Log

- 2026-10-23 — นายช่างเปิดงานจากคำติของผู้ใช้ ให้ arch ตรวจความหมายแบบ read-only แล้วผู้คุมบันทึกคำอธิบาย
- 2026-10-23 — arch DONE / exit 0; นายช่างบันทึก data-model Rev6, dictionary 32 ตาราง/450 ฟิลด์, แผนที่ legacy 27 รายการ, JSON/แผนภาพและภาคผนวกเดิม พร้อมผลตรวจที่ [data-model-review-001](../design/data-model-review-001.md); SQL/DBML ไม่เปลี่ยน
