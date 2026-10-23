# ผลตรวจ data model และขอบเขตหลักฐาน (2/2)

[กลับคู่มือ](data-model.md) · [แผนที่ตารางเดิม](data-legacy-001.md)

[ส่วน 1](data-evidence-001.md) · [ส่วน 2](data-evidence-002.md)

- source-review-005 ระบุว่า implementation ของ sb-service-academic-score-record ไม่มีใน workspace ที่ตรวจครั้งนั้น; ใบงานนี้ไม่ได้ค้นนอก source ที่อนุญาต จึงไม่อ้างว่าตรวจ writer เดิมครบหรือยืนยันสถานะ deployment ปัจจุบัน
- PGTGradeDetail มี index บน SchoolId/NGradeId/SId/CDel ที่ EF ไม่ประกาศ unique; ห้ามสมมติว่าค้นด้วยชุดนี้จะได้หนึ่งแถวเสมอ ต้องตรวจความกำกวมตาม DES-009
- ชื่อ category ใน ScoreData ที่ reader ใช้คือ scoreGrade, scoreCheewat, scoreMid และ scoreFinal; ไม่ได้หมายความว่า PGTAssessment มีคอลัมน์ ScoreIdentifier หรือเป็นคลังตัวชี้วัดกลาง
- กฎผลพิเศษและค่า null/ว่างยังต้องยืนยันกับ writer/fixtures; reader บางจุดแทน null ด้วยค่า None เพื่อแสดงผล ไม่ใช่สิทธิ์ให้ writer ใหม่ clear ผลพิเศษหรือแปลงเป็นศูนย์
- Preview/Export/Outbox และ receipt อธิบายตามสัญญาปัจจุบัน ไม่ใช่หลักฐานว่าใช้งานแล้ว; การเปิด export ยังขึ้นกับ G-PARITY, G-COEXIST, G-TARGET, G-AUTHZ และ G-DB ตาม DES-009 โดยไม่มี transaction เดียวครอบ SchoolBot DB กับฐานเดิม
- งานนี้เป็นคำอธิบาย baseline เดิม ไม่มีการเสนอ schema/SQL/สัญญาใหม่ ไม่มีการเปลี่ยนสถานะตรวจรับ และไม่มีการลงนามอนุมัติแทนมนุษย์


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009; คง baseline เดิม
