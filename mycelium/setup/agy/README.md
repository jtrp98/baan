# agy profile `mycelium-readonly` — ติดตั้งครั้งเดียวต่อเครื่อง

`agents.json` เรียก agy แบบอ่านอย่างเดียวด้วย `agy --agent mycelium-readonly --print` — **ต้องมี profile นี้ในเครื่อง**
ไม่งั้น agy จะล้มทุกงาน read-only (ค่าเริ่มต้นของ MYCELIUM และอยู่ใน fallback ทุก tier) และไม่สลับตัวรันให้ เพราะไม่ใช่ข้อผิดพลาดโควตา

ทำไมต้องมี: `--mode plan` ของ agy ยังเขียนไฟล์ได้ และ `--sandbox` กันแค่ terminal (live smoke 2026-10-17) — profile นี้กันสองชั้น
1. `agents/mycelium-readonly/agent.md` — ตัด tool ที่เขียนไฟล์ออกจาก toolset ของเซสชัน
2. `mycelium-readonly-guard.js` + entry ใน `hooks.json` — `PreToolUse` hook ที่ deny tool เขียนไฟล์และยอมเฉพาะคำสั่งอ่านอย่างเดียว
   (git status/log/diff/show ฯลฯ, Get-Content/ls/rg ฯลฯ, `node <script>` ที่ไม่มีการเขียนไฟล์/spawn) — มีผลเฉพาะเซสชันที่เรียกด้วย `--agent mycelium-readonly` จึงไม่กระทบการใช้ agy ปกติ

## ติดตั้ง (PowerShell)

```powershell
$pkg = Join-Path (npm root -g) "mycelium"          # ตำแหน่ง package ที่ npm link ไว้ (หรือใส่ path ของ repo ตรงๆ)
$cfg = Join-Path $HOME ".gemini\config"

New-Item -ItemType Directory -Force (Join-Path $cfg "agents\mycelium-readonly") | Out-Null
Copy-Item (Join-Path $pkg "setup\agy\agents\mycelium-readonly\agent.md") (Join-Path $cfg "agents\mycelium-readonly\agent.md")
Copy-Item (Join-Path $pkg "setup\agy\mycelium-readonly-guard.js") (Join-Path $cfg "mycelium-readonly-guard.js")
```

แล้ว**รวม** entry `mycelium-readonly-guard` จาก `hooks.example.json` เข้า `~\.gemini\config\hooks.json` เอง:
- สำรองไฟล์เดิมก่อน (`Copy-Item hooks.json hooks.json.bak`) — hook ของผู้ใช้ที่มีอยู่ต้องอยู่ครบ ห้ามเขียนทับทั้งไฟล์
- เปลี่ยน `<HOME>` เป็น home ของเครื่องแบบ forward slash เช่น `C:/Users/<ชื่อผู้ใช้>`
- ถ้ายังไม่มี `hooks.json` ใช้เนื้อหาของ `hooks.example.json` (แทน `<HOME>` แล้ว) เป็นไฟล์ใหม่ได้เลย

## ตรวจว่าติดตั้งแล้วใช้ได้

```powershell
agy agents                                                   # ต้องเห็น mycelium-readonly
cd <repo mycelium>; npm run smoke:live -- --agents agy       # ต้องได้ PASS — "RO กันเขียน" ต้องเป็น ✅
```

## ข้อจำกัดที่รู้แล้ว

- guard ตรวจว่าเป็นเซสชัน `mycelium-readonly` จาก command line ของ process `agy` (ผ่าน PowerShell/CIM, Windows) — ถ้าตรวจไม่ได้
  (เช่น PowerShell เกิน 4 วินาที) hook จะ**ปล่อยผ่าน** ชั้นที่ 1 (toolset ใน `agent.md`) ยังตัด tool เขียนไฟล์อยู่ แต่คำสั่ง shell ที่เขียนไฟล์อาจหลุดได้
- อัปเดต agy แล้วชื่อ tool เปลี่ยน = รายชื่อใน `agent.md`/guard อาจต้องตามแก้ — รัน `npm run smoke:live -- --agents agy` ทุกครั้งหลังอัปเดต agy
