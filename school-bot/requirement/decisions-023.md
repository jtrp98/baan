# มติ writer คะแนน, ปัดเศษ, นำเข้า Sheet และเจ้าของ mapping
> ถูกแทนด้วย มติ 031 (เปลี่ยนเฉพาะพาธ school-bot-v2 เป็น school-bot) — [มติ 031](decisions-031.md)

## คำตอบผู้ใช้ — 2026-10-22

ผู้ตอบ: ผู้ใช้ในแชตนี้ หลังอ่านผล SA ([source-review-005](../design/source-review-005.md)) และ OQ-014/016/017

1. writer เดิม (`sb-service-academic-score-record` ไม่อยู่ใน workspace): "แค่หน้า fe ทำหน้าใหม่เลย ใน folder school-bot แล้ว backend อยู่ ฝั่งนี้"
2. ปัดเศษ: "ปัดขึ้นตั้งแต่ .5"
3. นำเข้า Sheet: "ทุกแถวเป็นร่าง"
4. ผู้จัดการ mapping: "เฉพาะ admin โรงเรียน"

## ข้อกำหนดที่ยืนยัน

- ไม่พึ่ง service score-record เดิม: หน้าเว็บสร้างใหม่ และ backend (รวมการเขียนคะแนน) อยู่ฝั่ง SchoolBot
- ปัดคะแนนเป็นจำนวนเต็มแบบ half-up: x.5 ขึ้นไปปัดขึ้น ต่ำกว่า x.5 ปัดลง (7.5 → 8, 7.4 → 7)
- นำเข้าทุกแถวของ Sheet เป็น draft; แถว D=TRUE ติดป้ายอนุมัติจากต้นทาง ไม่มีแถวใด publish เอง — ปิด OQ-017
- สร้าง/แก้ mapping คาบ↔ช่องคะแนนได้เฉพาะ admin โรงเรียน ครูไม่แก้ mapping

## การตีความที่ยังไม่ยืนยัน (สมมติฐาน — ยังไม่ยืนยัน)

- "folder school-bot" = โฟลเดอร์ใหม่ชื่อ school-bot ใน `target/sb-tech-upgrade-web-system` สำหรับหน้าครูและหน้า admin โรงเรียนทั้งหมดของ SchoolBot ตาม decisions-022 (หน้า admin ฝั่ง SchoolBright ยังอยู่ Next.js ใน school-bot-v2/web)
- "backend อยู่ฝั่งนี้" = `target/school-bot-v2/web` เป็นผู้เขียน PGGradeDB เองโดยไม่เรียก gateway score-record เดิม

## ความเสี่ยงที่ยังเปิด (จาก source-review-004/005)

- ไม่มี source ของ writer เดิม จึงไม่รู้ว่าระบบเดิมคำนวณคะแนนรวม/`GetScore100` และ merge `ScoreData` อย่างไร — SchoolBot ต้องพิสูจน์ด้วย fixtures จากข้อมูลจริงว่าแก้ช่องย่อยแล้วหน้า score-record เดิมและรายงานแสดงผลตรง (parity) ก่อนเปิดใช้
- writer เดิมใช้ row version `xmin` ตาม proto; SchoolBot ต้องกันชนกับครูที่บันทึกผ่านหน้าเดิมพร้อมกัน
- admin โรงเรียนเป็นผู้แมพ แต่สิทธิ์ส่งคะแนนยังเป็นครูรายวิชา (decisions-021); ต้องระบุแหล่งสิทธิ์ admin โรงเรียนในระบบเดิม

## ส่งต่อ

- BA amend REQ-045/049/050 ตามมตินี้; ข้อค้าง OQ-014/016 ตอบต่อครบแล้วใน decisions-032/033/034 ไม่เปิดถามซ้ำ
- SA amend DES-008/009: actor ของ mapping = admin โรงเรียน, ปัด half-up, writer อยู่ใน SchoolBot พร้อมแผนพิสูจน์ parity; ออกแบบ auth ข้ามระบบ web-system ↔ SchoolBot

## Change Log

- 2026-10-23 — เชื่อม decisions-032..034 ซึ่งตอบข้อค้าง OQ-014/016; ไม่รับรอง parity/contract

- 2026-10-22 — MYCELIUM บันทึกคำตอบผู้ใช้ 4 ข้อ; ปิด OQ-017
