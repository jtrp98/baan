# ตรวจและแก้ knowledge auto-commit — รอบ 001

วันที่: 2026-10-23 · ที่มา: ผู้ใช้แจ้งว่า auto-commit knowledge ไม่ทำงานหลังปรับคู่มือข้อมูล

## สาเหตุที่พบ

1. นายช่างใช้ config ชั่วคราวที่ไม่มี knowledge roots ตอนเปิด arch เพราะ charter/CONVENTIONS ห้าม state-changing git ทุกกรณี ซึ่งขัดกับฟีเจอร์ auto-commit ที่มีอยู่ และไม่ได้เรียก final commit หลังเขียนคู่มือเอง
2. hook ของ `baan-role` ทำงานเมื่อ role จบ ก่อนนายช่างบันทึก output จาก role แบบ read-only จึงไม่ครอบคลุมไฟล์ที่เขียนตามมาภายหลัง
3. พบและพิสูจน์บั๊กใน `baan/src/knowledge-commit.mjs`: `gitIn` ใช้ `.trim()` กับ stdout ของ `git status --porcelain -z`; รายการแรก ` M school-bot/...` เสียช่องว่างนำหน้า แล้ว parser อ่านชื่อ module เป็น `chool-bot/...`

## การแก้

- sys เปลี่ยนให้ stdout คง raw bytes/text ที่ส่งจาก Git โดยคง stderr handling และ parser/grouping เดิม
- check เพิ่ม integration regression 2 กรณี: tracked file แก้แต่ยังไม่ stage เป็นรายการเดียว และรายการแรกที่ module/path มีช่องว่าง ตรวจข้อความ commit ขอบเขตไฟล์ เนื้อหา และสถานะ clean
- ปรับ BAAN.md/CONVENTIONS.md ให้ยกเว้นเฉพาะ commit เอกสารใน configured knowledge roots ผ่านกลไกของ BAAN; source/target commits, push, branch/history ไม่อยู่ในข้อยกเว้น
- กำหนดให้นายช่างเรียก `baan --commit --config <workspace config จริง>` หลังบันทึกเอกสารครบ แม้ role จะจบไปก่อนแล้ว และตรวจสถานะ Git จริง

## หลักฐานตรวจ

- sys DONE: `C:/src/AICode/baan/baan/reports/2026-10-23-02-24-49-sys-tier-t4-1agents-YbfJtn`
- check เขียน tests แล้ว แต่รอบแรก BLOCKED เพราะ sandbox เขียน Git metadata ใน disposable fixture ไม่ได้: `C:/src/AICode/baan/baan/reports/2026-10-23-02-25-03-check-tier-t2-1agents-uOr3Tr`
- นายช่างรัน `npm test` ที่ `C:/src/AICode/baan/baan` ด้วยสิทธิ์ที่สร้าง Git fixture ได้: **96 tests ผ่านทั้งหมด / 0 fail** รวม regression ใหม่ทั้งสองกรณี
- การทดสอบ commit ใช้ repo ชั่วคราว ไม่ commit source ของ BAAN ไม่เปลี่ยนเวอร์ชันหรือ release

## ขั้นปิดงาน

บันทึกไฟล์นี้และ index ก่อน แล้วเรียก `baan --commit --config C:/src/schoolbright/baan.config.json` เพื่อเก็บเอกสาร SchoolBot ที่ค้างอยู่ ผล commit และสถานะ clean ให้ยืนยันจาก Git log/status หลังคำสั่ง ไม่เขียนเอกสารเพิ่มหลัง commit รอบสุดท้าย

## Change Log

- 2026-10-23 — นายช่างบันทึกสาเหตุ การแก้จาก sys/check และผลทดสอบหลังผู้ใช้แจ้ง auto-commit ไม่ทำงาน
