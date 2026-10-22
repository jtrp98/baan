# 🏗️ BAAN

บ้านของ **BAAN (นายช่าง)** — local npm package "ผู้คุมทีม AI 11 ตำแหน่ง" ธีมไซต์งานก่อสร้าง: แตกงาน เปิด session รายช่างผ่าน claude/codex/agy ส่งต่อ context และหยุดถามคนที่ประตูมนุษย์

> ชื่อเดิมของ project คือ MYCELIUM (เปลี่ยนชื่อ + ธีมก่อสร้าง 2026-10-22) · คำสั่งเก่า `mycelium` / `mycelium-role` ยังใช้ได้เป็น alias

## อ่านต่อ

- **คู่มือการใช้งานเต็ม**: [`baan/README.md`](baan/README.md) — BAAN คืออะไร · เริ่มต้นใช้งาน · ทีม 11 ตำแหน่ง · tier ladder · ทุกคำสั่ง
- ติดตั้งแบบย่อ: `cd baan && npm link` แล้วใช้คำสั่ง `baan` / `baan-role` ได้จากทุกโปรเจกต์
- ประวัติแต่ละรุ่น: `baan/RELEASE-NOTES.md` · charter ของทีม: `baan/BAAN.md`

## โมเดล branch / release

- `dev/golf` — branch ทำงาน รับ commit ทุกอย่าง
- `release` — เก็บของรุ่นล่าสุดที่ release แล้วเสมอ
- `releases/x.x.x` — branch ของแต่ละรอบ release ตัดจาก `dev/golf` พร้อม tag `v<x.x.x>` ที่หัว branch
  (ใช้ `releases/` เพราะ git สร้าง `release/x.x.x` คู่กับ branch ชื่อ `release` ไม่ได้)
- พิธีต่อรอบ: ตัด `releases/x.x.x` จาก `dev/golf` → ติด tag → **PR จาก `dev/golf` เข้า `release`** → merge แล้ว push branch + tag
