# BAAN

BAAN เป็น local npm package สำหรับควบคุมงานพัฒนาผ่าน AI CLI โดยใช้ execution engine เดียว: Orchestrator เตรียมงาน → Planner เมื่อจำเป็น → Worker → Verifier ตามความเสี่ยง Core ที่เป็นโค้ดจัด dependency, ล็อก repository, ตรวจคำสั่งและขอบเขต และเก็บหลักฐาน งานเริ่มหลังคนยืนยัน acceptance/scope/commands และประตูเฉพาะงานครบ

BAAN **0.29.0** รองรับ Codex, Claude และ agy ส่วน OpenCode ใช้เป็น Worker ได้ ทีมสร้าง (`spec`, `arch`, `pm`, `build`, `check`) และทีมออกแบบ (`survey`, `ui`, `review`) ใช้แบบคุยสดผ่าน session ของผู้ใช้ ไม่มี runtime dependency

BAAN เป็นอิสระ ไม่ผูกมัดกับโครงการใดโครงการหนึ่ง สามารถเชื่อมต่อกับ Knowledge Base ได้หลายชุดตามที่ระบุใน `knowledge_roots` ของแต่ละ Workspace

ตัว package อยู่ในโฟลเดอร์ [`framework/`](framework/)

```text
baan/
├── framework/       # npm package BAAN
└── README.md
```

## เริ่มต้นใช้งานใน 1 นาที (Quick Start)

หากเปิดโฟลเดอร์งานใหม่ (`folder x`) ผ่าน **Claude Code**, **Codex**, หรือ **Antigravity (`agy`)** สามารถคัดลอก Prompt ด้านล่างนี้ไปสั่ง AI เพื่อติดตั้งและเชื่อมต่อ Knowledge Base ได้ทันที:

```markdown
ช่วยติดตั้ง BAAN และเชื่อมต่อ knowledge ให้พร้อมใช้งานในโฟลเดอร์นี้:
1. ตรวจสอบว่าเครื่องนี้มีคำสั่ง baan หรือยัง (where baan / which baan)
   - ถ้ายังไม่มี ให้ clone https://github.com/jtrp98/baan ไปไว้ที่ ~/.baan แล้วรัน npm link ที่โฟลเดอร์ framework
2. รัน baan --init --knowledge-git https://github.com/jtrp98/knowledge-sb ในโฟลเดอร์นี้
3. ตรวจสอบความพร้อมและสรุปบทบาททีม (spec, arch, pm, build, check, survey, ui, review) ให้ทราบ
```

ดูรายละเอียดฉบับเต็มได้ที่ [framework/GETTING-STARTED.md](framework/GETTING-STARTED.md)

## การซิงค์และอัปเดตอัตโนมัติ (`baan sync`)

เมื่อทำงานใน workspace (เช่น `schoolbright`) ไม่จำเป็นต้องใช้คำสั่ง Git ด้วยตนเอง:
- พิมพ์บอก AI ว่า: **"ซิงค์"** หรือ **"ดึงอันล่าสุดลงมา"**
- หรือรันคำสั่ง: `baan sync`

ระบบจะดึงความรู้ล่าสุด, บันทึกและส่งงานใหม่อัตโนมัติ (Safe Auto-Commit & Push), อัปเดตตัวแม่ BAAN เมื่อมีรุ่นใหม่ และรีเฟรช Agent stubs ให้พร้อมใช้งานเสมอ

## ติดตั้งด้วยตนเอง

ต้องมี Node.js 18 ขึ้นไป, Git และ AI CLI ที่ติดตั้งและลงชื่อเข้าใช้แล้ว สำหรับงานที่ต้องใช้ Planner/Verifier ต้องมี provider ที่รองรับ read-only contract ตามคู่มือ package

```bash
cd framework
npm link
baan --version
baan --help
baan --init --workspace C:/src/workspace
```

หลังจากนี้ใช้คำสั่ง `baan` ได้จากทุกโฟลเดอร์ หากเคย link จาก `baan/` ให้รัน `npm link` จาก `framework/` ใหม่
แก้ paths/targets ใน `baan.config.json` ของ workspace ให้ตรงเครื่องก่อนใช้งาน Run ใหม่เก็บใน `<workspace>/.baan/runs/`; เพิ่ม `.baan/` ใน gitignore ของ workspace

## เอกสาร

- [framework/GETTING-STARTED.md](framework/GETTING-STARTED.md) คู่มือเริ่มต้นใช้งานฉบับสมบูรณ์สำหรับทุกบทบาท (รวม UX/UI)
- [framework/README.md](framework/README.md) วิธีใช้งานทั้งหมด
- [framework/BAAN.md](framework/BAAN.md) หน้าที่ Orchestrator และประตูมนุษย์
- [framework/CONVENTIONS.md](framework/CONVENTIONS.md) กติกาทีมและการเก็บเอกสาร
- [framework/RELEASE-NOTES.md](framework/RELEASE-NOTES.md) สิ่งที่เปลี่ยนในแต่ละรุ่น
