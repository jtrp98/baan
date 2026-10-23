# มติผู้ใช้ — repo เหลือ `school-bot` ตัวเดียว (`school-bot-v2` ไม่มีแล้ว)

## คำตอบผู้ใช้ — 2026-10-23

ผู้ตอบ: ผู้ใช้ในแชตนี้ หลังนายช่างรายงานสถานะ (จุดที่ชี้ว่า `school-bot-v2` ประกาศไว้ใน config แต่ยังไม่มีโฟลเดอร์จริง)

"เหลือ อันเดียวแล้ว หมายถึง school-bot-v2 ไม่มีแล้ว"

## ข้อกำหนดที่ยืนยัน

- `target/school-bot-v2` ไม่มีแล้ว — target ของงาน SchoolBot เหลือ `C:/src/schoolbright/target/school-bot` ตัวเดียว (นายช่างเอา target `school-bot-v2` ออกจาก `baan.config.json` แล้ว)
- การอ้างอิงพาธ `school-bot-v2` (รวม `school-bot-v2/web`) ในเอกสารก่อนหน้านี้ ให้อ่านเป็น `target/school-bot` (และ `target/school-bot/web`) แทนที่พาธที่ระบุไว้ใน decisions-010/011/021/022/023
- โครงสร้างที่เคยบันทึกว่าอยู่ใน v2 ตรวจพบจริงที่ `target/school-bot` แล้ว (นายช่างตรวจ 2026-10-23): `web` เป็น .NET solution `SchoolBot.slnx` (ตรงข้อสังเกตใน decisions-022), `engines`/`app`/`contracts`/`go.work` ครบ — ยังไม่มีโปรเจกต์ Next.js ของ admin ใน `web`

## การตีความที่ยังไม่ยืนยัน (สมมติฐาน — ยังไม่ยืนยัน)

- หน้า admin Next.js จะเพิ่มใน `target/school-bot/web` คู่กับ API เดิม ตามเจตนาเดิมของ decisions-022 ("nextjs ไว้ใน web") — ผู้ใช้ยืนยันว่า v2 ไม่มีแล้ว แต่ยังไม่ได้ระบุชื่อ/ที่อยู่หน้า admin ต่อเมื่อเริ่ม implement ต้องยืนยันจุดนี้อีกครั้ง

## ผลต่อเอกสารเดิม

- แก้พาธ `school-bot-v2` → `school-bot` ในเอกสารที่ยังใช้จริง (requirement\scope, req-036/043, index · design\des-004/005/008/009/010/012, modules, index · plan\scope-001 · db\review-001) พร้อม Change Log รายไฟล์
- คงข้อความเดิมตามประวัติ (ไม่แตะ): decisions-010..023 · source-review-002/005 · hardware-survey-001 · os-compatibility-001 · source-references · amendment-proposal-001 · design\archive\** · planning\**

## Change Log

- 2026-10-23 — นายช่างบันทึกคำยืนยันผู้ใช้ แก้ `baan.config.json` และแก้พาธในเอกสารที่เกี่ยวตามรายการด้านบน
