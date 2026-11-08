# agy read-only profile และ guard

Planner/Verifier ใช้ `agy --agent baan-readonly --print` ผ่าน core; Worker ใช้ write mode หลัง approval
อัปเกรดเป็น 0.29.0 ต้องติดตั้ง profile/guard และอัปเดต hook ใหม่ เพราะชุดเดิมยังอนุญาต terminal

Profile ใหม่นี้มีเฉพาะ view_file/grep_search/find_by_name/list_dir/read_file และ invoke_subagent สำหรับส่ง subagent ตรวจงานขนานกัน ไม่มี terminal, scripts, network หรือ write tools
Core สร้าง diff_file, snapshots_file และ command logs ให้ Verifier อ่าน ไม่ต้องรัน git/test เอง
Guard ตรวจ `BAAN_READONLY=1` ที่ runner ตั้งให้ read-only call แล้วปฏิเสธ tool อื่นและ input ที่ parse ไม่ได้
Worker ได้ `BAAN_READONLY=0`; standalone agy session ที่ไม่ได้เปิดผ่าน core ใช้ permissions ของตัวเอง
ไม่มีการอ่าน command line ผ่าน PowerShell/CIM, cache การเดาสถานะ หรือปล่อยผ่านเมื่ออ่านสถานะไม่ได้

ก่อน dispatch core ตรวจไฟล์ profile/guard ว่าตรง package และมี all-tool hook ที่ชี้ guard ตัวจริง
ขาด/เก่า/ผิดรูปแบบจะไม่เรียก agy สำหรับงานอ่าน และใช้ fallback ที่รองรับ ถ้าไม่มีจะบันทึก environment blocker

## ติดตั้งใน PowerShell

```powershell
$baanPackage = Join-Path (npm root -g) "baan"
$baanAgyConfig = Join-Path $HOME ".gemini/config"
New-Item -ItemType Directory -Force (Join-Path $baanAgyConfig "agents/baan-readonly") | Out-Null
Copy-Item (Join-Path $baanPackage "setup/agy/agents/baan-readonly/agent.md") (Join-Path $baanAgyConfig "agents/baan-readonly/agent.md")
Copy-Item (Join-Path $baanPackage "setup/agy/baan-readonly-guard.js") (Join-Path $baanAgyConfig "baan-readonly-guard.js")
```

รวม entry `baan-readonly-guard` จาก [hooks.example.json](hooks.example.json) เข้า `.gemini/config/hooks.json` โดยรักษา hook อื่นทั้งหมด
เปลี่ยน `<HOME>` เป็น home จริงแบบ forward slash; ใช้ `node "<HOME>/.gemini/config/baan-readonly-guard.js"` เมื่อ path มีช่องว่าง
Matcher ต้องเป็น `.*` เพื่อปิด tool ใหม่ที่ไม่อยู่ใน whitelist ด้วย สำรอง hooks.json เดิมก่อนแก้
ไม่ได้ติดตั้ง guard อัตโนมัติจาก package เพราะต้องรักษา config ของผู้ใช้

ตรวจด้วย `agy agents` แล้วรัน `npm run smoke:live -- --agents agy --tier t3` จาก package
Live smoke ใช้ quota และ temporary repository; ไม่แตะ workspace งานจริง
หลังอัปเดต agy ให้ตรวจ tool names/profile และรัน live smoke อีกครั้ง
[`grant-read.mjs`](grant-read.mjs) เป็น utility เพิ่ม/ถอนสิทธิ์อ่าน workspace สำหรับการตั้งค่า agy ที่จำกัด path; ไม่ใช่เงื่อนไขของ Worker write mode

Read-only เป็นขอบเขต tools ของ provider และ hook ไม่ใช่ OS sandbox ที่ BAAN สร้างขึ้น
Core ตรวจ mutation ของ tracked/untracked files และ Git state เพิ่มอีกชั้น และไม่ rollback ให้เอง
