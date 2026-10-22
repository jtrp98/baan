# SchoolBot — ตรวจแพ็กเกจเดิมก่อนทดสอบ runtime

## ผลที่ทำจริง — 2026-10-21

ทำตาม decisions-018 ก่อนผู้ใช้เปลี่ยน Windows target ใน decisions-019 ผลข้อมูลเต็มเก็บที่ [JSON](installer-preflight-001.json)

| ตรวจ | ผล |
|---|---|
| Setup EXE | dist/installers/school-bot-0.1.5-windows-amd64-setup.exe; 74,988,927 bytes; FileVersion0.1.5.0/ProductVersion0.1.5 |
| MSI | dist/installers/school-bot-0.1.5-windows-amd64.msi; 13,848,576 bytes |
| SHA256 | ทั้ง EXE/MSI ตรง sidecar ของแต่ละไฟล์ |
| Authenticode | ทั้งสองไฟล์ NotSigned ตามผลอ่านจริง ไม่ใช่ release-ready proof |
| Structural tests | scripts/tests/installer-package.test.ps1 -InstallerPath dist/installers/school-bot-0.1.5-windows-amd64.msi จบ exit0 |
| ขอบเขต tests | cross-language upgrades, launch checkbox, six launch conditions, user context, success-only UI และ dialog bounds; อ่าน MSI/evaluate conditions ไม่ติดตั้งหรือเปิดแอป |

## เครื่องและข้อจำกัด

อ่าน CIM แบบ require_escalated สำเร็จ: Windows 11 Home Single Language 10.0.26300 64-bit ไม่ใช่เครื่อง Windows 10 ไม่ตีความ kernel version10.0 ว่าเป็น Windows10

ไม่พบ Get-VM/VBoxManage/vmrun/QEMU/WindowsSandbox/vmconnect จาก PATH/ชุด default provider paths ที่ตรวจ และไม่พบ process VM จากชุดที่ตรวจ เป็นขอบเขต inventory ไม่ใช่การพิสูจน์ว่าไม่มี VM อยู่ทุกที่

app/bin/school-bot.exe ปัจจุบันเป็น0.1.3 ขณะที่แพ็กเกจที่เลือกเป็น0.1.5 ต้องตรึง payload ให้ตรง MSI ก่อนใช้ scripts/test-installer.ps1 เพื่อไม่ให้เปรียบเทียบคนละ build ไม่มีการรัน smoke script ที่ติดตั้ง/repair/uninstall บนเครื่องหลัก และไม่ได้ extract/rebuild/แก้ binary

## หลังผู้ใช้เปลี่ยนขอบเขต

ผู้ใช้ยืนยัน Windows11 ตามข้อเสนอแรกใน [decisions-019](../requirement/decisions-019.md) จึงยุติงาน runtime Win10 ในสาขานี้ คำถามหาเครื่อง Win10 ไม่ต้องรอคำตอบเพิ่ม ไม่ใช้ structural checks เป็นผลทดสอบ Windows11 runtime/hardware/installer จริง หรือเป็น SchoolBot QA verdict

## Change Log

- 2026-10-21 — MYCELIUM บันทึก preflight ที่ทำจริงและยุติสาขา Win10 ตามมติล่าสุด
