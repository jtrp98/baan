# project-ai

บ้านของ **🏗️ BAAN (นายช่าง)** — local npm package "ผู้คุมทีม AI 11 ตำแหน่ง" ธีมงานก่อสร้าง (แตกงาน เปิด session รายช่าง ผ่าน claude/codex/agy ส่งต่อ context และหยุดถามคนที่ประตูมนุษย์) — ติดตั้งแล้วผ่าน `npm link` ใช้คำสั่ง `baan` / `baan-role` ได้จากทุกที่ (คำสั่งเก่า `mycelium` / `mycelium-role` ยังใช้ได้เป็น alias)

> ชื่อเดิมของ project คือ MYCELIUM — เปลี่ยนเป็น BAAN + ธีมก่อสร้างเมื่อ 2026-10-22

- ติดตั้งลง workspace (ครั้งเดียว): `cd <ราก workspace> && baan --init` — สร้าง CLAUDE.md/AGENTS.md ให้ AI session สวมบท นายช่าง เอง + config ของ workspace
- สวมบท นายช่าง (ถ้าไม่ได้ init): `อ่าน C:\src\AICode\project-ai\baan\BAAN.md แล้วสวมบทบาทนายช่าง`
- เอกสารทั้งหมด: `baan\README.md` · ประวัติแต่ละรุ่น: `baan\RELEASE-NOTES.md`

## โมเดล branch / release

- `dev/golf` — branch ทำงาน รับ commit ทุกอย่าง
- `release` — เก็บของรุ่นล่าสุดที่ release แล้วเสมอ
- `releases/x.x.x` — branch ของแต่ละรอบ release ตัดจาก `dev/golf` พร้อม tag `v<x.x.x>` ที่หัว branch
  (ใช้ `releases/` เพราะ git สร้าง `release/x.x.x` คู่กับ branch ชื่อ `release` ไม่ได้)
- พิธีต่อรอบ: ตัด `releases/x.x.x` จาก `dev/golf` → ติด tag → **PR จาก `dev/golf` เข้า `release`** → merge แล้ว push branch + tag
