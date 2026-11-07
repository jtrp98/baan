---
project: school-bot
updated: 2026-11-06
status: Proposed
source: ../../modules/quiz/curriculum-source.md (S1–S4 · อ่าน 2026-11-05)
---

# 6. Curriculum Integration · 7. Progression Roadmap

**กฎ (CLAUDE.md 2026-11-05):** อิงแหล่งใน curriculum-source.md เท่านั้น ไม่แต่งชื่อบท/โจทย์ · ข้อมูลที่ไม่มี = เขียน "รอข้อมูล"

## 6.1 สถานะข้อมูล ป.1

- prompt อ้าง **44 คาบ** แต่ Sheet (S1) มีเทอม 1 ~20 Unit (≈ 40 คาบ) · เทอม 2 ว่าง → **วิเคราะห์ได้ระดับ Unit ไม่ใช่รายคาบ** จนกว่าได้เอกสาร Gemini (Q4) หรือ Sheet ครบ
- Unit ที่มีชื่อใน S1 (ลำดับยังไม่นิ่ง: Comment ในชีตเสนอสลับ U14/U15, ย้าย DATA Literacy มา week 6, week 10 อาจเป็น Robot Commands)
- แผนรายคาบเสร็จเฉพาะ U1–3 · มีรายละเอียดเฉพาะ U1 (S2) และ AI ใกล้ตัว (S3, week 3)

## 6.2 ป.1 รายหน่วย (Level 1: รู้จัก AI & ใช้อย่างปลอดภัย)

ช่อง: **CR** = Curriculum Requirement (จากแหล่ง) · **GD** = Game Design Recommendation (ข้อเสนอ) · Pattern เดิม = รอเอกสาร Gemini ทุกแถว

| Unit (S1) | CR: สิ่งที่ต้องเรียน (แหล่ง) | GD: engine / mechanics | Limited Block | C+P+M | Joystick | เชื่อมคลังเกม |
|---|---|---|---|---|---|---|
| U1 Hello Robot! (2 คาบ) | Robot ≠ Machine · หุ่นยนต์ = Sensor → Controller → Motor · เรียงลำดับคำสั่งอย่างง่าย (S2) · ใบงาน My Dream Robot วาด + วงกลม Sensor/สี่เหลี่ยม Motor (S4) | คาบ 1: Item Engine (หุ่นยนต์หรือเครื่องจักร? เลือกตอบภาพ) + Shape Editor ชั้น 1 + ป้ายหน้าที่ · คาบ 2: Robot Model แบบ **สายโซ่ 3 ช่อง** + Grid Beginner 3–4 บล็อกไม่มี budget | ใช่ (Beginner เท่านั้น) | ใช่ (แบบสายโซ่ ไม่ต่อสาย) | ไม่ | G12, G1 |
| Hello AI | รอข้อมูล (ชื่อจาก S1) | เสนอ: Item Engine · ยังไม่ระบุ engine ได้จนเห็นแผน | ไม่ | ไม่ | ไม่ | รอข้อมูล |
| AI ใกล้ตัว (week 3) | 3 ภารกิจ: หา AI รอบตัว · ไหนเอ่ย AI · AI ช่วยอะไร · AI Detective Challenge เลือก 4 ทาง (เข้าใจภาษา/ฟังเสียง/ดูภาพ/แนะนำ) · ภารกิจสุดท้าย 3 ข้อ (S3) | Item Engine (เลือกตอบภาพ + จับคู่) · ภารกิจสุดท้าย = ด่านบอส/ข้อสรุป (ต่อ OQ ด่านบอส) | ไม่ | ไม่ | ไม่ | G4 (แนวคิด AI ดูภาพ) |
| Real or Not | รอข้อมูล (S1: รู้ทันข้อมูล/มิจฉาชีพ) | เสนอ: Item Engine (จริงหรือปลอม) | ไม่ | ไม่ | ไม่ | G5 |
| Pose AI | สอน AI ด้วยภาพ/ท่าทาง (Teachable Machine · S1) | AI Training แบบชุดภาพเตรียมไว้ (กล้อง = Q5) | ไม่ | ไม่ | ไม่ | G4 |
| Prompt Thinking | Prompt (S1) · รายละเอียดรอข้อมูล | Item Engine (เรียงคำ/เลือก prompt ที่ชัดกว่า) · ไม่มี engine ใหม่ | ไม่ | ไม่ | ไม่ | รอข้อมูล |
| Joystick + Robot Arm | Joystick (S1) | Joystick Simulator **Basic** (แกนเดียว → 2 แกน, กลับกลาง) · ไม่มีตัวเลขมุม | ไม่ | ไม่ | **ใช่** | G2 |
| Unit อื่น (~13 Unit) | รอข้อมูล | – | – | – | – | – |

**ข้อสังเกต:**
- ป.1 ไม่ต้องใช้ Circuit World, Flowchart, Factory World · ไม่ยัด mechanic เกินวัย
- Limited Block ใช้เฉพาะ Beginner ใน ป.1 (ไม่มี budget, ไม่มี loop) · budget เริ่ม ป.2–3
- คำว่า "ภารกิจ" ในห้อง = กิจกรรมย่อยในคาบ แต่ในแอป = ด่าน (curriculum-source ข้อ 5) → ด่านหนึ่งด่านอาจมีหลาย "ภารกิจ" ของห้อง เสนอให้ item = ภารกิจของห้อง เพื่อให้คำตรงกับที่ครูใช้

## 7. Progression Roadmap ป.2–6 (ความซับซ้อนต่อ engine)

ฐาน: คอนเซปต์รายชั้นจาก S1 (Roadmap ของ Gemini ยังไม่มี · Q4)

| Engine | ป.1 AI & ปลอดภัย | ป.2 Robot Arm | ป.3 Coding & Sensor | ป.4 Sensor → นวัตกรรม | ป.5 Program Arm | ป.6 อุตสาหกรรม |
|---|---|---|---|---|---|---|
| Grid World + IR | ลำดับ 3–4 บล็อก ไม่มี budget | budget เป็นดาว | loop · if (sensor) | AND/OR · ตัวแปรนับ | – | – |
| Joystick + Arm World | แกนเดียว · ไม่มีตัวเลข | 2 แกน · มุม 0/90/180 · Pick & Place · นับ/คัดสี (S1) | – | – | ตำแหน่งปลายแขน · บันทึกการโยกเป็นท่า (Playback · S1) | คุมแขนในสายการผลิต |
| Arm World + IR (โปรแกรมแขน) | – | – | – | – | พิกัด/มุม joint · ลำดับท่า · Pick & Place อัตโนมัติด้วย sensor · Debug (S1) | Robot Arm + Conveyor |
| Circuit World | – | Servo/Gripper (เลือกต่อ ไม่ต่อสายอิสระ) | Blink · RGB · ไฟจราจร · Servo (S1) · ต่อสายอิสระ | threshold · Smart Home/Farm | sensor คุมแขน | sensor ตรวจคุณภาพ |
| Robot Model (C+P+M) | สายโซ่ 3 ช่อง | + เลือกกลไก (มือคีบ) | วงจร + โปรแกรม | ระบบเล็ก (sensor → action) | แขน + sensor + โปรแกรม | สายการผลิตเต็ม |
| Flowchart / State | – | – | ไฟจราจร (state) | Smart System (if ซ้อน) | ลำดับท่าเป็น flowchart | Conveyor · Cycle Time |
| Factory World | – | – | สี่แยก | – | Sorting | Mini Product Line · Quality Inspection |
| AI Training | สอนด้วยภาพ/ท่าทาง | – | – | ข้อมูล sensor → ตัดสินใจ | – | AI ตรวจคุณภาพ (เสนอ · ไม่มีใน S1) |
| Shape Editor | ชั้น 1 + ป้ายหน้าที่ | Design Your Robot Arm (S1) | ชั้น 2 | ต้นแบบนวัตกรรม (Prototype · S1) | – | – |
| Debug Mode | – | – | step ทีละบล็อก | trace ค่า sensor | debug ลำดับท่า (S1) | หาคอขวด |

**หลักการเติบโต:** แต่ละชั้นเพิ่ม **1 มิติ** ต่อ engine (แกนเพิ่ม, โครงสร้างโปรแกรมเพิ่ม, ชั้นระบบเพิ่ม) ไม่เพิ่มหลายมิติพร้อมกัน · UI เหมือนเดิมทุกชั้น (DEC-06) ต่างกันที่ config
