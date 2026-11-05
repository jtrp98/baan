# CONVENTIONS — สัญญาร่วม

ใช้กับ Orchestrator และทีมออกแบบที่คุยสด; execution roles ใช้ contract ใน `prompts/` และ structured schemas
Core ไม่แนบเอกสารนี้ซ้ำในทุก call

## ขอบเขตและหลักฐาน

- อ่าน INDEX ก่อน แล้วอ่าน source ที่งานอ้างถึงและไฟล์ที่จำเป็นต่อ scope เท่านั้น
- Source จริงชนะความจำ แยกข้อเท็จจริง สมมติฐาน และ OQ ชัดเจน ห้ามแต่ง test results หรือ approval
- เขียนเฉพาะส่วนที่ได้รับมอบหมาย เจ้าของไฟล์อื่นเสนอแก้ผ่าน OQ; ห้ามแก้ของคนอื่นเงียบ ๆ
- ตอบภาษาไทย ยกเว้น code/identifiers และ convention ของ target; ใช้วันที่ของงานหรือวันที่ปัจจุบันของ session
- การตรวจอิสระใช้ acceptance/contracts/diff/evidence โดยไม่ใช้คำอธิบายของ Worker เป็นข้อพิสูจน์
- ไม่เปิด role อื่นหรือเรียก BAAN ซ้อนจาก execution role; หนึ่ง writer ต่อ repository รวม linked worktrees

## ประตูมนุษย์

การตัดสิน business, schema/migration/breaking contract, security, UX sign-off, deploy และ release scope
เป็นของคน บันทึกใคร/เมื่อไร/source ตามคำตอบจริง งานที่ต้องใช้คำตอบนั้นรอ; งานอิสระทำต่อได้
Acceptance ต้องได้รับการยืนยันก่อน dispatch และยืนยันใหม่เมื่อ source/scope/commands เปลี่ยน
`DONE`/`PASS` ของโมเดลไม่ใช่ความสำเร็จของ run: core ตรวจ schema, machine evidence และ risk policy อีกชั้น
Rework สูงสุดตาม budget (default 2) แล้วถามคน; ไม่มีการลดมาตรฐาน test เพื่อให้ผ่าน

## Knowledge

- Knowledge = สิ่งที่ทีมคนต้องใช้ตัดสินใจวันนี้: requirements, decisions, contracts, design, handoff, OQ
- Memory เดิมเป็นประวัติ อย่าย้าย/เขียนทับ; หลักฐาน run ใหม่อยู่ `.baan/runs/<id>`
- เขียนทั้งไฟล์ให้เป็นความจริงปัจจุบัน ไม่ append override ทับกติกาเก่า; ประวัติอยู่ Git และ changelog
- ID ไม่ใช้ซ้ำ ไม่เปลี่ยนหมายเลข; เก็บ ID เก่าที่ถูกอ้างผ่าน `shared/id-map.md`
- เอกสารสัญญามี Rev/วันที่/ผู้แก้/ผู้ขอ; การเปลี่ยนความหมายเพิ่ม Rev และ append changelog รายเดือน
- Changelog/backlog/security findings เป็น append-only; ไม่ลบข้อมูลประวัติเพื่อ cleanup
- Knowledge อ้าง memory ที่ไม่ได้แจกให้ทีมด้วยข้อความ; ไม่สร้างลิงก์ไป path ที่ผู้อ่านไม่มี
- ไฟล์ยาวให้แยกตามเรื่องและมี INDEX; ไม่คัดลอกเอกสารข้าม project

## Layout และเจ้าของ

`layout: project`: `<project>/modules/<module>/{shared,design,build}` และ `INDEX.md`
`shared` ระบุ owner ของเอกสาร, `design` เป็นทีมออกแบบ, `build` เป็นสัญญา/หลักฐานส่งมอบด้านพัฒนา
`shared/requirements.md` จัด feature `F#` → requirement `R#` → AC; OQ อยู่ `shared/oq.md`
หัว INDEX เป็นแหล่งจริงของ status/updated/depends_on/requested_by/target/platform/os
สถานะ `draft → approved → designed → reviewed → built` ต้องสะท้อนหลักฐานและการเซ็นของคนจริง
`baan --index` สร้างตาราง project จากหัว module; ไม่แก้ตารางที่สร้างเองด้วยมือ
ไม่ตั้ง layout ใช้โฟลเดอร์ module เดิมและเส้นทางที่งานระบุ

## Git และการส่งมอบ

อ่าน Git ได้ ห้าม reset/revert/commit/push/เปลี่ยน branch ของ target โดยพลการ
`baan --commit` เก็บเฉพาะเอกสารใน knowledge/memory roots ที่มี Git ของตัวเองตาม config
ไม่รัน SQL/migration/deploy บนระบบร่วม ไม่มี network หรือ permission เพิ่มโดยอนุมานจากใบงาน
ทีมออกแบบส่งผลสั้น ๆ: สิ่งที่ตัดสิน/ไฟล์ที่แก้/หลักฐาน/คำถามค้าง/ผู้รับต่อ; ห้ามอ้างว่าเซ็นแล้วถ้าคนยังไม่เซ็น
