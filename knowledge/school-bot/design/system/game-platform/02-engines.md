---
project: school-bot
updated: 2026-11-06
status: Proposed
---

# 3. Core Game Engine Architecture · 4. Gameplay Mechanics Specification

## 3.1 Architecture Diagram

```
┌──────────────────────────── 1. EXPERIENCE LAYER ─────────────────────────────┐
│  Lesson Shell (level → map → ด่าน · quiz R1/R12/R13)   Library Shell (หมวด → การ์ด) │
└───────────────┬───────────────────────────────────────────────┬──────────────┘
                │ โหลด Game Definition (06-config-schema.md)      │
┌───────────────▼───────────────────────────────────────────────▼──────────────┐
│ 2. GAME ENGINE LAYER                                                         │
│                                                                              │
│  INPUT / EDITORS            PROGRAM CORE              WORLDS (simulators)    │
│  ┌──────────────┐          ┌──────────────┐          ┌───────────────────┐   │
│  │ Block Editor │──┐       │  Program IR  │          │ Grid World        │   │
│  │ Flowchart Ed.│──┼──────▶│  + Runtime   │─commands▶│ Circuit World     │   │
│  │ (State Mach.)│──┘       │ step · trace │◀─sensors─│  (+ Sensor/Signal)│   │
│  └──────────────┘          │ budget count │          │ Arm World         │   │
│  ┌──────────────┐  live    └──────────────┘          │  (Kinematic)      │   │
│  │ Joystick In. │──────── axis/button ──────────────▶│ Factory World     │   │
│  └──────────────┘  (ไม่ผ่าน IR)                       │ (conveyor/traffic)│   │
│  ┌──────────────┐                                    └─────────┬─────────┘   │
│  │ Shape Editor │ (ไม่มี runtime · Visual Creativity)          │ state       │
│  └──────────────┘                                    ┌─────────▼─────────┐   │
│  ┌──────────────┐  ┌──────────────┐                  │ Robot Model       │   │
│  │ Item Engine  │  │ AI Training  │                  │ circuit↔port↔mech │   │
│  │ (quiz R3)    │  │ data→model   │                  │ (Integration)     │   │
│  └──────────────┘  └──────────────┘                  └───────────────────┘   │
│                                                                              │
│  CROSS-CUTTING MODES (ทุก World ต้องรองรับ): Debug Mode · Evaluator           │
└───────────────┬──────────────────────────────────────────────────────────────┘
┌───────────────▼──────────── 3. GAMEPLAY MECHANICS LAYER ────────────────────┐
│ Block Budget · Step Execution · Drag & Connect · Joystick Control ·         │
│ Pick & Place · Sorting · Free-form Drawing · C+P+M Integration · Fault Inject│
│ (= กติกาที่ประกอบจาก engine ด้วย config ไม่มีโค้ดของตัวเอง หรือมีน้อยมาก)     │
└───────────────┬──────────────────────────────────────────────────────────────┘
┌───────────────▼──────────────── 4. SHARED SYSTEM LAYER ─────────────────────┐
│ UI Shell (DS) · HUD · Progress · Hint (มาสคอต) · Audio · Reward (ดาว/เหรียญ) │
│ Analytics (event ของ Runtime/Evaluator) · Save & Resume (my-work cloud)      │
└──────────────────────────────────────────────────────────────────────────────┘
```

**หลักของ layer:** layer บนเรียก layer ล่างได้ ล่างไม่รู้จักบน · Engine ไม่รู้ว่ากำลังเป็นบทเรียนหรือเกม (รู้แค่ config) · Mechanic ไม่ใช่โค้ดใหม่ แต่เป็นการตั้งค่า engine + กติกาใน Evaluator

## 3.2 รายการ engine (เทียบกับ 9 ตัวใน prompt)

| prompt | ข้อเสนอ | เหตุผล |
|---|---|---|
| Grid & Path Engine | **Grid World** | คงไว้ |
| Circuit Assembly Engine | **Circuit World** (ใช้ตัวจำลองของ Block Lab R4–R6) | มีงานอยู่แล้ว ใช้ซ้ำ |
| Sensor & Signal Engine | **รวมเข้า Circuit World + Robot Model** | สัญญาณ sensor คือค่าบนสาย/พอร์ต แยก engine ทำให้ข้อมูลสองที่ |
| Kinematic Manipulator Engine | **Arm World** | คงไว้ (2D มุมมองข้าง + มุมมองบน) |
| Block Programming Engine | **Block Editor + Program IR/Runtime** | แยก editor ออกจาก runtime เพื่อให้ Flowchart ใช้ runtime เดียวกัน |
| AI Training Engine | **AI Training** | คงไว้ |
| State Machine Engine | **Flowchart Editor** (แปลงเป็น IR: state/transition = loop + if + event) | ไม่ต้องมี runtime ที่สอง |
| Debugging Engine | **Debug Mode** (โหมดกลาง) | ทุก world ต้องรองรับอยู่แล้ว: step, trace, ใส่บั๊ก, ไฮไลต์บรรทัดที่ผิด |
| Creative Shape Editor | **Shape Editor** | คงไว้ แยกขาดจาก Robot Model (หลักข้อ 10) |
| (ไม่มีใน prompt) | **Item Engine** | แบบฝึก 4 กลุ่มของ quiz R3 (เลือกตอบ, เรียงบล็อก, จับคู่/ลากวาง, …) ทุกด่านบทเรียนต้องใช้ |
| (ไม่มีใน prompt) | **Factory World** | world ของสายพาน/ไฟจราจร สำหรับ Sorting, State, ป.6 Conveyor (S1) |
| (ไม่มีใน prompt) | **Robot Model** | จุดเชื่อม C+P+M (§4.2) ไม่มีที่อยู่ใน 9 ตัวเดิม |

**ใช้ร่วม / แยก:**
- ใช้ร่วม: Program IR/Runtime (ทุก editor × ทุก world) · Debug Mode · Evaluator · Robot Model (Grid, Arm, Factory อ่านสถานะมอเตอร์จากที่เดียว)
- ต้องแยก: Shape Editor (ไม่มี physics ไม่มีโปรแกรม) · AI Training (ข้อมูลและโมเดล คนละโดเมนกับคำสั่ง) · Joystick Input (live control ไม่ผ่าน IR · แต่**บันทึก**การโยกเป็น IR ได้ = ต่อยอดสู่ "บันทึกท่า/Playback" ของ ป.5)

## 3.3 Mapping กับ 8 Core Game Patterns เดิม (รอเอกสาร Gemini · Q4)

| Pattern เดิม (ชื่อ) | engine ที่รองรับ | ต้องเพิ่ม sub-engine ไหม |
|---|---|---|
| รอเอกสาร (8 แถว) | – | – |

เกณฑ์เมื่อได้เอกสาร: pattern ใดรองรับได้ด้วย config ของ engine ที่มี = ไม่เพิ่ม · pattern ที่ต้องการ interaction ใหม่ (เช่น ลากเส้นต่อจุดอิสระ) = เสนอ sub-engine พร้อมเหตุผลด้านการเรียนรู้

## 3.4 Program IR (หัวใจของการใช้ซ้ำ)

- คำสั่งพื้นฐาน: `move`, `turn`, `set_port`, `wait`, `servo`, `grip`, `emit` (world ประกาศว่ารองรับคำสั่งใด)
- โครงสร้าง: `seq`, `repeat(n)`, `repeat_until(cond)`, `if/else`, `on(event)`, `var`
- Runtime: รันทีละ tick · **step** ทีละคำสั่ง · เก็บ **trace** (คำสั่ง → ผลบน world) · นับ **budget** (จำนวนบล็อกในโปรแกรม ไม่ใช่จำนวนครั้งที่รัน)
- Editor ประกาศชุดบล็อกที่ "แสดง" ได้ · World ประกาศชุดคำสั่งที่ "รับ" ได้ · config เลือกส่วนที่ตัดกัน

## 3.5 วิธีเพิ่มเกมใหม่โดยไม่สร้างระบบใหม่

| สิ่งที่ต้องการ | ต้องทำ |
|---|---|
| ด่าน/เกมใหม่ใน world เดิม | เขียน config อย่างเดียว (แผนที่, เป้า, block ที่เปิด, budget) |
| ธีมใหม่ | `theme_pack` ใหม่ (sprite/สี จาก DS) · engine ไม่เปลี่ยน |
| ความยากใหม่ | `difficulty_profile` ใหม่ (§4.1 ตาราง) |
| กติกาชนะใหม่ | เพิ่ม predicate ใน Evaluator (เช่น `item_in_zone`, `collected_all`) ใช้ได้ทุก world |
| world ใหม่ | implement interface `World` (reset, apply(command), sense(), state(), render()) → ได้ทุก editor + debug ทันที |

---

# 4. Gameplay Mechanics Specification (5 แนวคิดใหม่)

## 4.1 Limited Block Programming Challenge

**engine:** Block Editor → Program IR → Grid World · **mechanics:** Block Budget, Step Execution, Pick (collect), Debug Mode

องค์ประกอบ: แผนที่ grid · จุดเริ่ม · เป้า · สิ่งกีดขวาง · ไอเทม · ชุดบล็อกคำสั่ง · ตัวนับ budget (`ใช้ 4/5`)

| ระดับ | config ที่เปลี่ยน (engine เดิม) | สิ่งที่เด็กฝึก |
|---|---|---|
| Beginner | บล็อก: เดิน/หมุน · ไม่มี budget · สิ่งกีดขวางไม่มีหรือ 1 · รันอัตโนมัติทีละก้าวช้า | คำสั่ง 1 บล็อก = 1 การกระทำ |
| Intermediate | budget แสดงเป็นเป้าดาว · สิ่งกีดขวาง · ไอเทม 1 ชิ้น | วางแผนเส้นทางก่อนรัน |
| Advanced | เปิด `repeat`, `if (ข้างหน้ามีกำแพง)` · budget ต่ำกว่าทางยาว → ต้องใช้ loop | บีบ algorithm ด้วยรูปแบบที่ซ้ำ |
| Challenge | หลายเป้า · ต้องเก็บไอเทมก่อนเส้นชัย · budget เป็นเงื่อนไขผ่าน | ลำดับ + ประสิทธิภาพพร้อมกัน |

กติกาที่เสนอ:
- **ผ่าน = ถึงเป้า** · **ด่านเกมในบทเรียนไม่ให้ดาว** (ผู้ใช้ตัดสิน 2026-11-06 · Q7) ดาวมาจากแบบฝึก (Item Engine) ตาม quiz R4 เท่านั้น · เก็บไอเทมครบ / ใช้บล็อก ≤ budget เป็น **เป้าเสริม (bonus goal)** แสดงเป็นเครื่องหมายสำเร็จ ไม่นับดาว · Challenge: budget เป็นเงื่อนไขผ่าน
- **Feedback เมื่อผิด:** หุ่นหยุดที่คำสั่งที่ทำให้ชน · บล็อกนั้นสั่นและไฮไลต์ · เส้นทางที่เดินจริง (สีหนึ่ง) ซ้อนกับเส้นทางที่ตั้งใจ (เส้นประ) · มาสคอตท่าคิดบอกเหตุ ("ชนกำแพงหลังก้าวที่ 3")
- **การปรับปรุง algorithm:** หลังผ่าน ถ้าบล็อก > budget แสดง "ทำได้ใน N บล็อก ลองหาส่วนที่ซ้ำไหม" + ไฮไลต์ลำดับบล็อกที่ซ้ำกัน (ช่วยชี้ ไม่เฉลย)
- Step-by-step: ปุ่ม ▶ รัน · ⏭ ทีละก้าว · ↺ เริ่มใหม่ (ชุดเดียวกันทุก world)

## 4.2 Robotics Integration: Circuit + Program + Mechanic

**engine:** Circuit World + Block Editor/IR + Robot Model + Grid/Arm World · **mechanics:** C+P+M Integration, Drag & Connect, Fault Inject, Debug Mode

**Robot Model (จุดที่ทำให้ 3 ระบบไม่แยกกัน):**

```
 Battery ─▶ [Circuit] ─ power ok? ─▶ Port D9 ─▶ [Program] set D9 / servo D9 90°
                                        │
                                        ▼
                               Motor/Servo state (หมุน?, มุม?)
                                        │
                                        ▼
                         [Mechanic] wheel r · gear ratio · arm length · gripper
                                        │
                                        ▼
                         World: ระยะที่เคลื่อน / ตำแหน่งปลายแขน / หยิบได้ไหม
```

| ผิดที่ | ผลที่เห็นในโลก | Fault Trace ชี้ |
|---|---|---|
| Circuit (ไม่มีไฟถึงมอเตอร์, สายผิดพอร์ต) | หุ่นนิ่ง · ไฟสถานะพอร์ตไม่ติด | "มอเตอร์ซ้ายไม่มีไฟ" → ไฮไลต์สายบนแผงวงจร |
| Program (สั่งพอร์ตที่ไม่ได้ต่อ, ลำดับผิด, loop ไม่จบ) | หุ่นทำผิดลำดับ / ไม่หยุด | บล็อกที่สั่งพอร์ตว่าง (เหมือน block-lab R16/R17) |
| Mechanic (ล้อเล็ก/เฟืองช้า, แขนสั้น, มือคีบเล็กกว่าวัตถุ) | ไปไม่ถึง / เอื้อมไม่ถึง / คีบหลุด | "แขนยาว 12 วัตถุอยู่ไกล 15" |

**Stage flow:** prompt กำหนด 5 stage เรียงกัน · เสนอให้เป็น **แผงเดียว 3 แท็บที่เห็นหุ่นตลอด** (Circuit / Program / Mechanic) + ปุ่มทดสอบที่ใช้ได้ทุกเมื่อ · stage 1–3 เป็นลำดับแนะนำของบทเรียน ไม่ใช่ประตูบังคับ · stage 4–5 (Integration, Test & Debug) เกิดทุกครั้งที่กดทดสอบ

**ปรับตามวัย:** ป.1 = "สายโซ่ 3 ช่อง" Sensor → Controller → Motor (แนวคิดรวบยอด ป.1 U1) เลือกชิ้นใส่ช่อง ไม่ต่อสาย · ป.2 = Servo + มือคีบ เลือกกลไก · ป.3–4 = ต่อวงจรจริงใน Circuit World + บล็อก · ป.5–6 = เต็มรูป + sensor ควบคุมแขน/สายพาน

## 4.3 Free-form Robot Creator

**engine:** Shape Editor · **mechanics:** Free-form Drawing · **ไม่มี** Robot Model หรือ physics (หลักข้อ 10)

| ชั้นเครื่องมือ | เปิดเมื่อ | เครื่องมือ |
|---|---|---|
| 1 พื้นฐาน | เสมอ | วงกลม · สี่เหลี่ยม · สี่เหลี่ยมมุมมน · สามเหลี่ยม · เส้น · ระบายสีจาน · เลือก/ย้าย/ย่อขยาย · ลบ · ย้อน/ทำซ้ำ |
| 2 เพิ่ม | กด "เครื่องมือเพิ่ม" | วาดอิสระ · วงรี · หลายเหลี่ยม · หมุน · ทำสำเนา · ลำดับชั้น (หน้า/หลัง) · สีกำหนดเอง |
| 3 ป้ายหน้าที่ (ทางเลือก) | ในบทเรียน ป.1 U1 | แปะป้าย Sensor / Controller / Motor บนรูปทรงใดก็ได้ |

- ไม่มีรายการหัว/ตัว/แขน/ขา · ไม่มีโครงกระดูกบังคับ · ผืนผ้าใบว่าง
- ผลงานบันทึกที่ my-work · แกลเลอรีของห้อง = Q (การแชร์ผลงานเด็ก ต้องตัดสิน · ข้อมูลผู้เยาว์)
- เชื่อม Creative กับ Functional ได้ทางเดียว: ใช้ภาพที่วาดเป็น **สกิน** ของหุ่นใน Grid/Arm World (เปลี่ยนแค่ภาพ ไม่เปลี่ยนความสามารถ)

## 4.4 Joystick Manipulator Simulator

**engine:** Joystick Input + Arm World (+ Robot Model ถ้าเชื่อมแขนจริง) · **mechanics:** Joystick Control, Pick & Place, Sorting

**A. Joystick:** วงฐาน + ก้านลากได้ (เมาส์/ทัช) · ปล่อยแล้วสปริงกลับกลาง (Neutral) · ลูกศรทิศจางที่ขอบวง ส่วนที่โยกอยู่สว่างขึ้นตามแรง · ปุ่ม **มือคีบ เปิด/ปิด** · ปุ่ม **สลับคู่ข้อต่อ** (A: ฐานหมุน ↔ ซ้าย/ขวา · ไหล่ ↔ หน้า/หลัง · B: ศอก ↔ หน้า/หลัง · ข้อมือ ↔ ซ้าย/ขวา) · รองรับจอยเกมจริง (USB gamepad) เป็นทางเลือก · คีย์บอร์ด (WASD/ลูกศร + Space) เป็นทางเข้าถึงตาม WCAG 2.1.1 ไม่ใช่ทางหลัก (หลักข้อ 6 ยังผ่าน: ทางหลักคือก้านโยก)

**B. Arm World:** 2D มุมมองข้าง (ไหล่/ศอก/ข้อมือ/มือคีบ) + วงมุมมองบนเล็กมุมจอ (ฐานหมุน) · ข้อต่อแต่ละตัวมีส่วนโค้งแสดงมุม (ป.1 ไม่มีตัวเลข · ป.2 ขึ้นไปแสดง 0/90/180 ตาม S1 ป.2 "มุม 0/90/180") · ขีดจำกัดข้อต่อตามแขนจริง (arm-lab R13: S0 ±180° · S1–S4 ±135° · มือคีบ 0–100%) ชนขีดแล้วส่วนโค้งเป็นสีเตือน + สั่นเบา

**C. Object:** วัตถุมีขนาด/สี/ประเภท · หยิบได้เมื่อมือคีบรอบวัตถุและปิด · วัตถุตามมือคีบ · ปล่อยแล้วตกลงพื้น/ในโซน · โซนเป้าหมายเรืองเมื่อวัตถุถูกที่

| ระดับ | config | เป้า |
|---|---|---|
| Basic | เปิดแกนเดียว (ฐาน) แล้วทีละแกน · ความไวต่ำ · มีเงาเป้าหมายให้ทาบ | เข้าใจทิศโยก ↔ ทิศแขน · กลับกลาง |
| Intermediate | 2 แกนพร้อมกัน + สลับคู่ · เป้าตำแหน่งปลายแขน | ประสานหลายข้อต่อ |
| Advanced | Pick & Place 1 วัตถุ · ลำดับ เปิด→ลง→ปิด→ยก→ย้าย→ปล่อย มี checklist ภาพ | ลำดับการทำงาน |
| Expert | Sorting หลายวัตถุ · จำกัดเวลาหรือจำนวนการเคลื่อน · ความไวสูง | ความต่อเนื่องและแผน |

**ข้อจำกัดฮาร์ดแวร์ (เมื่อเชื่อมแขนจริง · phase 3):** แสดง 2 ชั้นแยกกันเสมอ — **"คำสั่งที่ส่ง"** (เงาโปร่ง) และ **"ตำแหน่งที่หุ่นตอบกลับ"** (ทึบ) · ถ้า Pi อ่านตำแหน่งข้อต่อไม่ได้ (arm-lab OQ1 · R14 "อ่านท่าปัจจุบัน" ทำได้ตอนคลายแขนเท่านั้นหรือไม่ ยังไม่ยืนยัน) **ห้ามแสดงชั้นตอบกลับ** แสดงเฉพาะคำสั่ง + ข้อความ "หุ่นไม่ได้บอกตำแหน่งจริง" · กฎความปลอดภัยของ arm-lab (หยุดได้เสมอ, NFR-04) ใช้ทั้งหมด

## 4.5 ความสัมพันธ์ของ mechanics (ใช้ซ้ำ)

| Mechanic | ใช้ใน engine | เกม/ด่านที่ใช้ (03-game-library.md) |
|---|---|---|
| Block Budget | Runtime | G1, G6, G3 (เป้าเสริม) |
| Step Execution | Runtime + Debug | G1, G3, G6, G7, G10, G11, G13 |
| Drag & Connect | Circuit, Flowchart, Item | G8, G9, G10, G11, G13 |
| Joystick Control | Joystick Input | G2, (G13 โหมดทดสอบ) |
| Pick & Place | Arm World, Grid World | G2, G13 |
| Sorting | Evaluator (predicate `zone_by_property`) | G2 Expert, G4, G10 |
| Free-form Drawing | Shape Editor | G12 |
| C+P+M Integration | Robot Model | G13 |
| Fault Inject | Debug Mode | G7, G9, G13 |
