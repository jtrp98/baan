# B typed gRPC logout rework3 — writer receipt (ยังไม่ทวนด้วย oracle ตรึง)

วันที่2026-10-28 · sys AGY T3 (gemini-3.8-flash-medium) · ตาม[มติ049](../requirement/decisions-049.md)

- run 2026-10-28-04-55-19-sys-tier-t3-1agents-FkPMk4: exit0 แต่ไม่มีhandoff/ไม่แก้ไฟล์ → runner failure ไม่นับรอบ
- run 2026-10-28-05-01-49-sys-tier-t3-1agents-sjuk7W DONE: แก้ `web/src/SchoolBot.Api/SchoolBotSessionServiceAdapter.cs` (487บรรทัด) อ่านraw `HttpContext.Request.Headers` นับค่าซ้ำของ x-request-id/origin/grpc-trace-bin/transport ก่อนOrigin policy/quota/store → Internal/INTERNAL_ERROR paired · hash D734F9…AED7 → **C5DE7BFC2B04E034A0F1C6ED9912A298EB338A99A22673FF1886AEF8F6240B45**

## ผลที่writerอ้าง (ยังไม่ทวน)

- `dotnet build web/SchoolBot.slnx` exit0 0warn
- harness: **2234pass/0fail/8NOT_RUN** (base150, arch wire1296/0) — แต่รันผ่าน Runner.csproj ที่writerสร้างใน scratch ของ agy (`~/.gemini/antigravity-cli/brain/.../scratch`) **ไม่ใช่** script ตรึง normal-089/grpc-r2-extended-independent.ps1
- `dotnet test web/SchoolBot.slnx -m:1`: 4147/0/0 exit0
- 8 NOT_RUN = ชุดเดิม (duplicate user-agent ไม่ถึงwire, lang ว่าง, lang/trace nonASCII ไม่มีwire fixture)

## ทวนของผู้คุม

ทวน script ตรึงไม่ได้: script ต้องใช้ PowerShell 7 (generic type/Roslyn) แต่เครื่องนี้ **ไม่มี pwsh.exe** (where.exe/ค้นทั้งดิสก์ไม่พบ) · รันด้วย Windows PowerShell 5.1 ล้มที่ parse type (`System.Collections.Generic.List`) ไม่ใช่ผลทดสอบ · log normal-092/grpc-r3-parent.log. ยังไม่ลง done-local/ยังไม่ส่ง check

## ทวนของผู้คุมหลังติดตั้ง PowerShell 7 (2026-10-28)

ผู้ใช้ติดตั้ง PowerShell 7.6.9 (`%LOCALAPPDATA%\Microsoft\WindowsApps\pwsh.exe`) แล้ว ผู้คุมรันซ้ำเอง:

- `pwsh -NoProfile -File reports/school-bot/normal-089/grpc-r2-extended-independent.ps1` จาก root target/school-bot (script ตรึงไม่แก้ + bundle hash 81E232…4FD1 ผ่าน + DLL/PDB/source binding ผ่าน): **BASE 150/0 · ARCH direct780/0 wire1296/0 extra8/0 · SUMMARY 2234pass/0fail exit0** · NOT_RUN 8 ชุดเดิม + H5 physical hidden headers · log normal-092/grpc-r3-parent.log
- `dotnet test web/SchoolBot.slnx --disable-build-servers -m:1`: **4147pass/0fail/0skip exit0** · log normal-092/grpc-r3-parent-regression.log
- adapter hash บน disk = C5DE7BFC…0B45 ตรงกับ writer

ผลนี้เข้าเกณฑ์ local green. ลง `done-local` ใน tasks-001.json ไม่ได้: `baan --lint-plan` บังคับ slice ระบุ ac_ids แต่ไม่มี AC ใน REQ-036/043 ที่ครอบ logout transport → ต้องให้ spec ผูก AC ก่อน (ผู้คุมไม่ผูกเอง)
check อิสระ Codex T2 run 2026-10-28-06-01-14-check-tier-t2-1agents-SBYeSR **ไม่ได้เริ่ม** — Codex ติด usage limit ถึง 2026-11-02 13:40

## Change Log

- 2026-10-28 — รับwriter sjuk7W; ผลอ้าง2234/0 + 4147/0 รอทวนด้วยscriptตรึงเมื่อมีpwsh
- 2026-10-28 — parentทวนด้วยpwsh7: oracleตรึง2234/0 + regression4147/0 = local green; checkอิสระติดโควตาCodex
