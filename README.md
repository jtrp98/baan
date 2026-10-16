# project-ai

บ้านของ **🍄 MYCELIUM** — local npm package "สมองของทีม AI" อยู่ที่ `mycelium\` (ติดตั้งแล้วผ่าน `npm link` — ใช้คำสั่ง `mycelium` / `mycelium-role` ได้จากทุกที่)

- ติดตั้งลง workspace (ครั้งเดียว): `cd <ราก workspace> && mycelium --init` — สร้าง CLAUDE.md/AGENTS.md ให้ AI session สวมบท MYCELIUM เอง + config ของ workspace
- สวมบท MYCELIUM (ถ้าไม่ได้ init): `อ่าน C:\src\AICode\project-ai\mycelium\MYCELIUM.md แล้วสวมบทบาท MYCELIUM`
- เอกสารทั้งหมด: `mycelium\README.md` · ประวัติแต่ละรุ่น: `mycelium\RELEASE-NOTES.md`

## โมเดล branch / release

- `dev/golf` — branch ทำงาน รับ commit ทุกอย่าง
- `release` — เก็บของรุ่นล่าสุดที่ release แล้วเสมอ
- `releases/x.x.x` — branch ของแต่ละรอบ release ตัดจาก `dev/golf` พร้อม tag `v<x.x.x>` ที่หัว branch
  (ใช้ `releases/` เพราะ git สร้าง `release/x.x.x` คู่กับ branch ชื่อ `release` ไม่ได้)
- พิธีต่อรอบ: ตัด `releases/x.x.x` จาก `dev/golf` → ติด tag → **PR จาก `dev/golf` เข้า `release`** → merge แล้ว push branch + tag
