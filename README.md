# BAAN

BAAN เป็นเครื่องมือ command line ที่แบ่งงานพัฒนาซอฟต์แวร์ให้ AI หลายตัวทำตามตำแหน่ง เช่น คนเขียน requirement, คนออกแบบ, คนเขียนโค้ด, คนตรวจ แทนที่จะให้ AI ตัวเดียวทำทุกอย่าง แต่ละตำแหน่งรันผ่าน AI CLI ที่มีอยู่ในเครื่อง (claude, codex หรือ agy) และระบบจะหยุดถามคนเมื่อถึงเรื่องที่ต้องให้คนตัดสิน เช่น รัน SQL หรือเซ็น UX

ตัว package อยู่ในโฟลเดอร์ [`framework/`](framework/) และเอกสารร่วมอยู่ใน [`knowledge/`](knowledge/) ซึ่ง sync กับ repository แยกผ่าน Git subtree

```text
baan/
├── framework/       # npm package BAAN
├── knowledge/       # subtree จาก jtrp98/knowledge-sb
├── GIT_WORKFLOW.md
└── README.md
```

## ติดตั้ง

ต้องมี Node.js 18 ขึ้นไป และ AI CLI อย่างน้อยหนึ่งตัวที่ login แล้ว

```bash
cd framework
npm link
```

หลังจากนี้ใช้คำสั่ง `baan` ได้จากทุกโฟลเดอร์ หากเคย link จาก `baan/` ให้รัน `npm link` จาก `framework/` ใหม่

## เอกสาร

- [framework/README.md](framework/README.md) วิธีใช้งานทั้งหมด
- [framework/RELEASE-NOTES.md](framework/RELEASE-NOTES.md) สิ่งที่เปลี่ยนในแต่ละรุ่น
- [GIT_WORKFLOW.md](GIT_WORKFLOW.md) วิธี clone และ sync knowledge ระหว่าง projects
