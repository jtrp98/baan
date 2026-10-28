# agy profile `baan-readonly` — ติดตั้งครั้งเดียวต่อเครื่อง

`agents.json` เรียก agy แบบอ่านอย่างเดียวด้วย `agy --agent baan-readonly --print` — **ต้องมี profile นี้ในเครื่อง**
ไม่งั้น agy จะล้มทุกงาน read-only (ค่าเริ่มต้นของ นายช่าง และอยู่ใน fallback ทุก tier) และไม่สลับตัวรันให้ เพราะไม่ใช่ข้อผิดพลาดโควตา

ทำไมต้องมี: `--mode plan` ของ agy ยังเขียนไฟล์ได้ และ `--sandbox` กันแค่ terminal (live smoke 2026-10-17) — profile นี้กันสองชั้น
1. `agents/baan-readonly/agent.md` — ตัด tool ที่เขียนไฟล์ออกจาก toolset ของเซสชัน
2. `baan-readonly-guard.js` + entry ใน `hooks.json` — `PreToolUse` hook ที่ deny tool เขียนไฟล์และยอมเฉพาะคำสั่งอ่านอย่างเดียว
   (git status/log/diff/show ฯลฯ, Get-Content/ls/rg ฯลฯ, `node <script>` ที่ไม่มีการเขียนไฟล์/spawn) — มีผลเฉพาะเซสชันที่เรียกด้วย `--agent baan-readonly` จึงไม่กระทบการใช้ agy ปกติ

## ติดตั้ง (PowerShell)

```powershell
$pkg = Join-Path (npm root -g) "baan"          # ตำแหน่ง package ที่ npm link ไว้ (หรือใส่ path ของ repo ตรงๆ)
$cfg = Join-Path $HOME ".gemini\config"

New-Item -ItemType Directory -Force (Join-Path $cfg "agents\baan-readonly") | Out-Null
Copy-Item (Join-Path $pkg "setup\agy\agents\baan-readonly\agent.md") (Join-Path $cfg "agents\baan-readonly\agent.md")
Copy-Item (Join-Path $pkg "setup\agy\baan-readonly-guard.js") (Join-Path $cfg "baan-readonly-guard.js")
```

แล้ว**รวม** entry `baan-readonly-guard` จาก `hooks.example.json` เข้า `~\.gemini\config\hooks.json` เอง:
- สำรองไฟล์เดิมก่อน (`Copy-Item hooks.json hooks.json.bak`) — hook ของผู้ใช้ที่มีอยู่ต้องอยู่ครบ ห้ามเขียนทับทั้งไฟล์
- เปลี่ยน `<HOME>` เป็น home ของเครื่องแบบ forward slash เช่น `C:/Users/<ชื่อผู้ใช้>`
- ถ้ายังไม่มี `hooks.json` ใช้เนื้อหาของ `hooks.example.json` (แทน `<HOME>` แล้ว) เป็นไฟล์ใหม่ได้เลย

## ตรวจว่าติดตั้งแล้วใช้ได้

```powershell
agy agents                                                   # ต้องเห็น baan-readonly
cd <repo baan>; npm run smoke:live -- --agents agy       # ต้องได้ PASS — "RO กันเขียน" ต้องเป็น ✅
```

## สิทธิ์อ่านนอก cwd สำหรับงาน `--write` — ตั้งครั้งเดียวต่อ workspace

งานเขียนรันโดยให้ cwd เป็น target repo แต่ต้องอ่าน `knowledge/` หรือ repo อื่นใน workspace ด้วย ซึ่ง agy แบบ headless จะปฏิเสธเงียบๆ
(`jetski: ... required the "read_file" permission ... auto-denied` แล้ว exit 0 คำตอบว่าง) · `--add-dir` ใช้ในโหมดเขียนไม่ได้เพราะเปิดสิทธิ์เขียนตามไปด้วย
ทางที่ใช้คือ allow-rule `read_file(<dir>)` ใน `~\.gemini\antigravity-cli\settings.json` ซึ่งให้**แค่สิทธิ์อ่าน** (live test 2026-10-26: อ่านได้ · `write_file` ไปที่เดียวกันยังถูกปฏิเสธ)

```powershell
cd C:\src\schoolbright                                       # โฟลเดอร์ที่มี baan.config.json
node <repo baan>\baan\setup\agy\grant-read.mjs             # เพิ่ม read_file(<ราก workspace>) · สำรองเดิมไว้ที่ settings.json.baan-bak
node <repo baan>\baan\setup\agy\grant-read.mjs <dir>       # หรือระบุโฟลเดอร์เอง (เช่น repo legacy นอก workspace) · ถอนด้วย --remove
```

อย่าใช้ `--dangerously-skip-permissions` แทน — อนุมัติทุก tool รวมการเขียนนอก cwd

## ข้อจำกัดที่รู้แล้ว

- guard ตรวจว่าเป็นเซสชัน `baan-readonly` จาก command line ของ process `agy` (ผ่าน PowerShell/CIM, Windows) — ถ้าตรวจไม่ได้
  (เช่น PowerShell เกิน 4 วินาที) hook จะ**ปล่อยผ่าน** ชั้นที่ 1 (toolset ใน `agent.md`) ยังตัด tool เขียนไฟล์อยู่ แต่คำสั่ง shell ที่เขียนไฟล์อาจหลุดได้
- อัปเดต agy แล้วชื่อ tool เปลี่ยน = รายชื่อใน `agent.md`/guard อาจต้องตามแก้ — รัน `npm run smoke:live -- --agents agy` ทุกครั้งหลังอัปเดต agy
