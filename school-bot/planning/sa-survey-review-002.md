# SchoolBot — ตรวจผล SA รอบ Windows 10

## ผลส่งมอบ

- ต่อ SA session 01a15eab-eb91-75e2-a20a-f17ba55f6e79 ที่เปิดด้วย mycelium-role sa/t1; model gpt-6-astra/high, sandbox read-only, approval never
- Codex CLI resume จบ exit 0 แต่ role ส่ง state NEEDS_HUMAN เพราะต้องเลือกแนวทางตัว Setup บน Home/Pro จึงไม่ใช้ exit code ของ CLI แทน human gate
- บันทึก [Windows10 review Rev1](../design/windows10-compatibility-001.md) ตรงข้อความ SA และ apply unified diff เฉพาะ [OS Rev2](../design/os-compatibility-001.md) กับ design/index ตาม [response](sa-survey-response-002.json)
- ตรวจ static 10 Markdown / 83 local links ผ่าน ไม่มีไฟล์เกินงบ ข้อเสนอ Windows11-only เดิมถูก amend ตามมติ Win10 ทั้งนี้ไม่ใช่ SchoolBot QA PASS

## สิ่งที่ได้จากข้อเสนอ

ชุด candidate สำหรับทดสอบคือ Home/Pro22H2 build19045, Enterprise LTSC2019 build17763 และ LTSC2021 build19044 แยก edition/patch/vendor policy ไม่ยืนยันว่า build สูงกว่าทั้งหมดรองรับอัตโนมัติ Candidate ต่ำสุดที่เสนอคือ LTSC2019 ไม่ใช่ runtime floor ที่พิสูจน์ว่าต่ำกว่านั้นทำไม่ได้

พบ .NET10 support gap ของ Setup บน Home/Pro22H2 แยกจากความสามารถรันจริง Direct MSI ไม่เรียก WPF shell แต่ยังต้องตรวจแอป/engine/WebView2/driver และคง UX/trust requirements ไม่เปลี่ยน distribution flow เอง

ผู้คุมตรวจชื่อ build กับ [KB5126657](https://support.microsoft.com/help/5126657), [KB5126651](https://support.microsoft.com/help/5126651) และ [.NET Windows install policy](https://learn.microsoft.com/en-us/dotnet/core/install/windows) วันที่ 2026-10-21 ไม่มี installer/runtime/device tests ในรอบนี้

## รอมนุษย์และส่งต่อ

ส่งคำถาม [แนวทาง Home/Pro](human-questions-005.md) ผ่าน ask user question ให้เลือกหลังมีร่างจริงแล้ว ไม่ถามให้ผู้ใช้เดาข้อเท็จจริงจาก source

BA-004/SA-003/PM รับผลตาม ownership หลังคำตอบและหลักฐานพร้อม ไม่มีการแก้ code/plan/REQ หรือปิด G-DELIVERY/OQ-011 จากการตรวจนี้ Windows/macOS และหุ่นจริงคงตามมติเดิม ไม่มี Windows 10/เครื่องโรงเรียนจริงให้ใช้พิสูจน์ compatibility ในรอบ source review นี้

## รายงาน

C:/src/AICode/baan/baan/reports/2026-10-21-13-34-47-sa-tier-t1-1agents-HjWmXL

ไฟล์รอบต่อ: codex.windows10.answer.txt, codex.windows10.jsonl, codex.windows10.stderr.txt

## Change Log

- 2026-10-21 — MYCELIUM บันทึกผล SA รอบต่อและตรวจ artifacts ก่อนส่งทางเลือกให้ผู้ใช้
