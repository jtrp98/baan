# BE-029 — studentLevel mixed Likert+ranking formula

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

คำนวณ `studentLevel(dimension)` แบบผสม — ค่า Likert เฉลี่ยพร้อม reverse-scoring (6−answer) ข้อที่ reverse-scored, มิติที่ไม่มีคำตอบเลยตัดออก (ไม่ใช่ค่า 3), เก็บทศนิยมไม่ปัดก่อนคำนวณต่อ · รวมกับค่าจากบล็อกเรียงลำดับ (แปลงอันดับกลับเข้าสเกล 1-5 แบบเชิงเส้นระยะห่างเท่ากัน ต่อ block ที่ตอบครบ 5≤k≤7) ด้วยสูตรถ่วงน้ำหนักเท่ากัน `W_LIKERT = W_RANK = 1` (ยืนยันแล้ว 2026-09-02 OQ-F11) — ทุกมิติต้องมีคำถามครบทั้งสองรูปแบบเป็นเงื่อนไขฝั่งเนื้อหา ไม่ใช่ให้ engineer ชดเชยตอน runtime · ต้อง log มิติที่ได้ค่าจากรูปแบบเดียว — ค่า studentLevel เป็น input ของทุกสูตรปลายน้ำ (%, จุดไม่เข้ากัน, InterestFit) — สูตรรวมที่เพี้ยนทำให้ทุกผลที่เด็กเห็นเพี้ยนพร้อมกันทั้งระบบ

## References

REQ-012, AC-012.3, DES-025, DEC-025

## Scope

ค่าคงที่ W_LIKERT/W_RANK เป็น named constant แก้ที่เดียว ไม่ hardcode · ไม่ปัดเป็นจำนวนเต็มก่อนเทียบ (ปัดเมื่อแสดงเท่านั้น) · block ที่มีตัวเลือก active นอกช่วง 5-7 ถือว่าคลังคำถามผิด — ตัด block นั้นออกและ log ห้ามคำนวณต่อด้วยสูตรปรับเอง

- Security-sensitive: yes

## Out of Scope

แถวผลที่เก็บแล้ว (คำนวณจากค่าที่เก็บ ไม่แก้ค่า) · คลังคำถาม · สูตรของขั้นถัดไป (คงสเกล 1-5 ตามสัญญา)

## Expected Output

none

## Acceptance

AC-012.3: แบบทดสอบใช้แบบผสมจริง — studentLevel ของมิติหนึ่งถูกรวมจากทั้ง Likert (เฉลี่ย + reverse) และ ranking (แปลงเชิงเส้น) ด้วยน้ำหนักเท่ากัน และค่าที่ได้อยู่ในสเกล 1-5 เสมอโดยไม่กระทบสูตรปลายน้ำ

## Dependencies

BE-028

## Handoff

ตรวจ AC-012.3 ด้วยชุดคำตอบทดสอบ: มี reverse-scored, มี ranking block ครบ/ไม่ครบ, มิติไม่มีคำตอบเลย — เทียบค่าที่คำนวณกับสูตรทีละขั้นด้วยมือ + ตรวจ log มิติที่มาจากรูปแบบเดียว — เก็บตารางเทียบเป็นหลักฐาน
เป็นขั้นคำนวณ — revert ได้ · ผลเก่าที่เก็บไว้เป็นค่าของวันนั้น ห้ามคำนวณใหม่เมื่อคลังคำถามเปลี่ยน
ส่งต่อ reviewer

Back-links: `INDEX.md`
