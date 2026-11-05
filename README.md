# BAAN

BAAN เป็น local npm package สำหรับควบคุมงานพัฒนาผ่าน AI CLI โดยใช้ execution engine เดียว: Orchestrator เตรียมงาน → Planner เมื่อจำเป็น → Worker → Verifier ตามความเสี่ยง Core ที่เป็นโค้ดจัด dependency, ล็อก repository, ตรวจคำสั่งและขอบเขต และเก็บหลักฐาน งานเริ่มหลังคนยืนยัน acceptance/scope/commands และประตูเฉพาะงานครบ

BAAN **0.29.0** รองรับ Codex, Claude และ agy ส่วน OpenCode ใช้เป็น Worker ได้ ทีมออกแบบ `spec` (`/pencil`), `survey`, `ui`, `review` ใช้แบบคุยสดผ่าน session ของผู้ใช้ ไม่มี runtime dependency

ตัว package อยู่ในโฟลเดอร์ [`framework/`](framework/) และเอกสารร่วมอยู่ใน [`knowledge/`](knowledge/) ซึ่ง sync กับ repository แยกผ่าน Git subtree

```text
baan/
├── framework/       # npm package BAAN
├── knowledge/       # subtree จาก jtrp98/knowledge-sb
├── GIT_WORKFLOW.md
└── README.md
```

## ติดตั้ง

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

- [framework/README.md](framework/README.md) วิธีใช้งานทั้งหมด
- [framework/BAAN.md](framework/BAAN.md) หน้าที่ Orchestrator และประตูมนุษย์
- [framework/CONVENTIONS.md](framework/CONVENTIONS.md) กติกาทีมและการเก็บเอกสาร
- [framework/RELEASE-NOTES.md](framework/RELEASE-NOTES.md) สิ่งที่เปลี่ยนในแต่ละรุ่น
- [knowledge/README.md](knowledge/README.md) วิธีอ่านเอกสารโครงการและแผนจากระบบเดิม
- [GIT_WORKFLOW.md](GIT_WORKFLOW.md) วิธี clone และ sync knowledge ระหว่าง projects
