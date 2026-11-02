---
project: school-bot
updated: 2026-11-01
---

# school-bot

School Bot Studio: โปรแกรมติดตั้ง (Windows/Mac) สอน coding และหุ่นยนต์ให้นักเรียน ป.1–6 ของโรงเรียนลูกค้า SchoolBright ทุกชั้นใช้ UI เดียวกัน มี 3 ส่วนในโปรแกรม (Quiz Game, Arm Lab, Block Lab) และเว็บครูแยกต่างหาก
**knowledge เป็นแหล่งความจริงของ requirement และผลวิเคราะห์ทั้งหมด** (นำเข้าจากระบบเก่า `~/Documents/School Bot` ครบเมื่อ 2026-10-21 · ไม่ต้องเปิดโฟลเดอร์เดิม · แผนที่ ID เดิม → ไฟล์ใหม่ที่ `2026-10-21_legacy-map.md`)

## Modules

| Module | สรุป | สถานะ | อัปเดต | พึ่งพา | ไฟล์ |
|---|---|---|---|---|---|
| app-shell | โครงแอปนักเรียน: installer · แถบหน้าต่าง (สถานะบันทึก, ชิปอุปกรณ์) · login · หน้าหลัก · ตั้งค่า/ภาษา · มาสคอต | draft | 2026-10-30 | - | [../../modules/app-shell/INDEX.md](../../modules/app-shell/INDEX.md) |
| my-work | งานของฉัน: บันทึกบน cloud · ออฟไลน์/sync · export .ini · กู้คืนสำรอง · นำเข้า | draft | 2026-10-26 | app-shell | [../../modules/my-work/INDEX.md](../../modules/my-work/INDEX.md) |
| quiz | Quiz Game (เมนูบทเรียน): เลือก Level 1–6 (= ป.1–6) · แผนที่ยาว 2 เทอม + ตัวบอกเทอม · แบบฝึก 4 กลุ่ม 5–8 ข้อ · ดาว 0–3 · phase 1 ยังไม่ส่ง SchoolBright (เก็บที่ cloud School Bot) | approved | 2026-11-01 | app-shell | [../../modules/quiz/INDEX.md](../../modules/quiz/INDEX.md) |
| arm-lab | สอนท่าแขนกล 6 ข้อต่อแล้วเล่นเป็นลำดับ (หุ่น Raspberry Pi) · ความปลอดภัยของหุ่น · โหมดครู · บันทึก cloud/.ini | draft | 2026-10-21 | app-shell, my-work | [../../modules/arm-lab/INDEX.md](../../modules/arm-lab/INDEX.md) |
| block-lab | ต่อบล็อกสั่ง Arduino Uno (ป.3–6 เน้น ป.3–4) · ดูโค้ด C++ · ตัวจำลองบอร์ดต่อสายอิสระ + ตัวช่วย · บล็อกอ้างอุปกรณ์ + เตือนก่อนรัน · stage มาสคอต · แผงข้อความจากบอร์ด | approved | 2026-10-30 | app-shell, my-work | [../../modules/block-lab/INDEX.md](../../modules/block-lab/INDEX.md) |
| teacher-web | เว็บครู (เบราว์เซอร์): ความคืบหน้า/คะแนน Quiz รายเทอม-รายปีตามห้อง · ตั้งค่า · แก้ปัญหาหุ่น | draft | 2026-10-21 | quiz | [../../../schoolbright-web/modules/school-bot/INDEX.md](../../../schoolbright-web/modules/school-bot/INDEX.md) |

ลิงก์ canvas อยู่ในตาราง Canvas ของ `sketchbook-project-index.md` แต่ละ module (1 module มีได้หลาย canvas) · ตอนนี้ลงทะเบียนแล้ว: C1 ที่ arm-lab, C1 ที่ block-lab, C1 ที่ quiz (ใช้ Canvas A ร่วม) · canvas อื่นของระบบเก่า (B, C, ARCHIVE) ยังไม่ลงทะเบียน ต้องถามผู้ใช้ก่อนใช้

สถานะ: `draft` → `approved` → `designed` → `reviewed` → `built` (ใครเปลี่ยนดู CLAUDE.md)
quiz เป็น `approved` (2026-11-01 · ผู้ใช้ยืนยันหลัง ruler ตรวจ R1–R18 (ทำได้มีเงื่อนไข) · ก่อนหน้านั้น `draft` 2026-10-31 เพราะแก้ requirement ตามภาพอ้างอิง Level/แผนที่ 2 เทอม · ก่อน handoff ต้องปิด OQ16/OQ18/OQ19/OQ23) · block-lab เป็น `approved` (2026-10-30 · ผู้ใช้ยืนยันหลัง ruler ตรวจ R21 เมนูคลิกขวาตรง Mixly · ทำได้มีเงื่อนไข) · ก่อนหน้านั้น `approved` (2026-10-29 · ผู้ใช้ยืนยันหลัง ruler ตรวจ R20 ครบ 6 ข้อ (ทำได้มีเงื่อนไข) และตอบ OQ205–OQ207 · D1 ที่ C1 (v330) ต้องแก้ตาม OQ204–OQ207) · ก่อนหน้า `approved` (2026-10-28 · ผู้ใช้ยืนยันหลัง ruler ตรวจและตอบ OQ167/168/170/171 · เคยกลับเป็น draft วันเดียวกันเพราะ แก้ R1/R2/R3/R10/R11/R17/R18/R19 ตามคำขอ A2 phase 1–2 · OQ156–OQ166 · ต้องให้ ruler ตรวจก่อน approved) · ก่อนหน้า `approved` (2026-10-27 · ผู้ใช้ยืนยันหลัง ruler ตรวจ R2/R3/R8/R11/R19 และตอบ OQ152/OQ153 · ต้องปิด OQ154/OQ155 ก่อน handoff และปรับ D1–D5 ตามคำตอบ) · เดิมกลับเป็น `draft` (2026-10-22 · เคย approved หลัง ruler ตรวจ R1/R18 · ผู้ใช้เปลี่ยนแถบหน้าต่างเป็นสูง 60 / พื้นที่ 840 กระทบ R11/R12/R18 ต้องให้ ruler ตรวจเฉพาะส่วนขนาดก่อน approved · D1–D5 ที่ C1 ต้องแก้ตาม) · module อื่นเป็น `draft` · arm-lab ผ่าน feasibility ของ role 2 (`ruler`) แล้ว 2026-10-21 (ทำได้มีเงื่อนไข · รอผู้ใช้ยืนยัน → `approved`) · module อื่นยังไม่ผ่าน (มีผล Architect เดิม GO WITH CONDITIONS เป็นข้อมูลอ้างอิง)

## ลิงก์

- บริบทร่วม (ผู้ใช้, ขอบเขต MVP, การตัดสินใจร่วม, ข้อจำกัด, ความเสี่ยง, เกณฑ์ตรวจเฉพาะโปรเจกต์): context.md
- Brand (สี, ฟอนต์, layout, motion, icon, voice + มาสคอต §8 + ข้อตัดสินหน้าจอ §9 + DS gap §10): brand.md
- มาสคอต 10 ท่า: assets/mascot/schoolbot_mascot_sheet_10poses.png
- Changelog: CHANGELOG.md
