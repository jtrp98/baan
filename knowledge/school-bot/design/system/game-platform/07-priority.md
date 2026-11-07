---
project: school-bot
updated: 2026-11-06
status: Proposed · ผู้ใช้เลือก 2026-11-06 (Q3): **ทำทั้งหมดในรอบแรก**
---

# 10. Implementation Priority

**คำตัดสิน (Q3 · 2026-11-06):** เมนู "เกม" และเกมทั้งชุดอยู่ในรอบแรก (พร้อม Quiz, Arm Lab, Block Lab, เว็บครู) · ดังนั้น "MVP / Phase 2 / Phase 3" ด้านล่างเป็น **ลำดับการสร้างภายในรอบแรก** (อะไรต้องเสร็จก่อนเพื่อให้ชิ้นต่อไปใช้ซ้ำได้) ไม่ใช่การเลื่อนออกไปรอบถัดไป

**ความเสี่ยงที่ต้องบันทึก (เสนอเพิ่มใน context.md เมื่อแก้ requirement):** ขอบเขตรอบแรกใหญ่ขึ้นมาก (เดิม RSK-06 ตัวจำลอง Block Lab = สูง · เวลา/ทีมไม่ทราบ CON-08) · ทางลดความเสี่ยง: สร้างตามลำดับขั้นด้านล่างเพื่อให้ทุกขั้นได้ของที่ใช้งานได้ และใช้ของ Block Lab/quiz ซ้ำให้มากที่สุด · G14 ต้องเพิ่ม sub-engine ใหม่ จึงเป็นชิ้นเดียวที่เสนอให้ตัดได้ถ้าเวลาไม่พอ (ไม่กระทบเกมอื่น)

## ขั้น 1: แกนกลาง + ด่าน ป.1–2 (ใช้ซ้ำมากที่สุด)

| ชิ้น | เหตุผล | ใช้ซ้ำจาก |
|---|---|---|
| Game Definition loader + Evaluator + predicate ชุดเริ่ม | แกนกลางของทุกอย่าง | – |
| Item Engine | ด่านบทเรียนทุกด่านต้องใช้ | quiz R3 |
| Program IR/Runtime + Block Editor ชุดภาพ + Grid World | ป.1 U1 "เรียงลำดับคำสั่ง" · ป.3 ต่อยอด | editor ของ Block Lab (ชุดบล็อกย่อย) |
| Joystick Input + Arm World (ไม่เชื่อมแขนจริง) | ป.1 "Joystick + Robot Arm" · ป.2 แขนกลทั้งชั้น | ช่วงข้อต่อจาก arm-lab R13 |
| Shape Editor ชั้น 1 | ป.1 U1 My Dream Robot (S4) | – |
| Shared: HUD, Run Controls, Hint, Result · เมนูเกม + การ์ด | consistency | quiz D3/D4, มาสคอต |
| เกม G1, G2, G12 | engine เดียวกับบทเรียน | – |

## ขั้น 2: ป.3–4 (Coding & Sensor)

- Circuit World โหมดปริศนา/guided (ใช้ตัวจำลอง Block Lab) → G8, G9
- Debug Mode เต็ม (trace, fault inject, edit budget) → G7
- Sensor บน Grid World → G3
- Flowchart Editor + Factory World (สี่แยก) → G11
- AI Training ด้วยชุดภาพเตรียมไว้ → G4, G5
- Robot Model แบบสายโซ่ (ป.1) และแบบวงจร + โปรแกรม (ป.3)
- G6 (stage มาสคอตของ Block Lab)

## ขั้น 3: ป.5–6 (ระบบ/อุตสาหกรรม)

- Robot Model เต็ม C+P+M + Fault Trace → G13
- Arm World + IR (โปรแกรมแขน, Playback จากการโยก)
- Factory World สายพาน + Sorting → G10
- เชื่อม Joystick กับแขนจริง (ต้องตอบ Q6 + กฎความปลอดภัย arm-lab)
- Level generator (ด่านสุ่ม/รายวัน) และโหมดสร้างด่านให้เพื่อน
- Mechanism sub-engine → G14 (ตัดได้ถ้าเวลาไม่พอ)

## ขั้นต่อไปตาม workflow ของ sketchbook

1. ผู้ใช้ตอบ Q4, Q5, Q6, Q8 ที่เหลือ (README.md)
2. session หลักเปิด module ใหม่ผ่าน `/pencil` (เสนอ `game-library` สำหรับเมนูเกม + `game-engine` สำหรับ engine/config ที่บทเรียนและเกมใช้ร่วม) และแก้ R# ที่ขัด: app-shell R7 (5 เมนู) · quiz R2/R3/R4/R15 (ด่านมี item ที่เป็นเกม, ด่านเกมไม่ให้ดาว) · บันทึก CHANGELOG · สถานะ app-shell/quiz คง `draft`
3. `ruler` ตรวจ feasibility ของ module ใหม่และ R# ที่แก้
4. ถาม DS gap (05-ux-ui.md §8.5) ก่อน `crayon` ออกแบบ
