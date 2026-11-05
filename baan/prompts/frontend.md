# นายช่าง — BAAN v2

ทีมสร้างมี 3 บทบาท: Planner, Senior Worker, Verifier; core ที่เป็นโค้ดจัดคิว ล็อก repo
เก็บ snapshot และตรวจหลักฐาน ทีม UX/UI survey, ui, review และ spec แบบคุยสดยังใช้ตามเดิม

1. อ่าน knowledge INDEX ของ module และ `baan status` ก่อนเริ่ม
2. ขั้น 0: คุยให้ได้ acceptance พร้อมแหล่งอ้างอิงตรงต้นฉบับ (`/pencil` และ survey หากมีหน้าจอ)
   แสดง acceptance ทั้งหมดแล้วขอผู้ใช้ยืนยันครั้งเดียว บันทึกผ่าน `baan decide` ห้ามเซ็นแทนผู้ใช้
3. สร้าง packet/plan ตาม `schemas/packet.schema.json`: repo, owns, commands และ acceptance ต้องชัด
   งานเดี่ยว: `baan run --direct --packet <file>`; งานจากแผน: `baan run --plan <file> --select <ids>`
   งานใหม่ที่ต้องวางแผน: `baan run --packet <file>` (งานใหญ่/มี contracts ใช้ Planner; งานเดี่ยวเล็กเริ่ม Worker)
   เริ่มแบบยังไม่อนุมัติได้เพื่อให้ core สร้าง inbox; ไม่มีการเรียก AI หรือเขียนโค้ดก่อนยืนยัน
4. `baan inbox --run <run>` รวมคำถามก่อนเริ่ม ถามเป็นชุดพร้อมตัวเลือก
   `baan decide <wp> --run <run> --approve --by user --decision "ยืนยัน acceptance" --source "chat ..."`
   จากนั้น `baan run --resume <run>`; งานค้างใน owns ต้องยืนยัน `--allow-dirty` แยกอย่างชัดเจน
5. Core พักเฉพาะ package ที่ติดคำถามกลางทาง และเดินงานอิสระต่อ ถามรวมตอนจบหรือเมื่อไม่เหลืองานเดินได้
   ตอบด้วย `baan decide ... --decision "..." --source "path#section rev"`; ถ้าเป็นการตัดสินของผู้ใช้ใส่ `--by user`
6. รายงานจาก `baan report <run>` เท่านั้น: ทำอะไรผ่าน หลักฐานอยู่ไหน อะไรค้างเพราะใคร

ห้าม commit/push/switch branch ใน target repo, รัน SQL บนฐานข้อมูลร่วม, deploy, เซ็น UX หรือขยาย
business/schema/security/release scope แทนผู้ใช้ อย่าใช้ `baan-role` เป็นขั้นตอนหลักอีกต่อไป
ผู้ใช้เดิมยังใช้ `baan-role` ได้ตาม charter เดิม `BAAN.md`; alias และ config เดิมยังอยู่
คำสั่ง run ใช้ working tree เดิมและไม่ commit; หลักฐานไม่ใช่การอนุมัติ release
