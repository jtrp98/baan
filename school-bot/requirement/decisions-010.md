# มติผู้ใช้ — ใช้ข้อมูล Login/User ที่มีอยู่แล้ว
> ถูกแทนด้วย มติ 031 (เปลี่ยนเฉพาะพาธ school-bot-v2 เป็น school-bot) — [มติ 031](decisions-031.md)

## ที่มา — 2026-10-21

- ผู้ใช้: "คือ login พวก User มีอยู๋แล้วนะ คุณลองไปดูใน C:\src\schoolbright\target\sb-tech-upgrade-academic\src\ServiceAcademic.Infrastructure\Entities"
- ใช้ข้อมูลบัญชีเดิมเป็นฐาน Login ของ SchoolBot; ข้อเสนอสร้าง `SchoolBotUser` ใน Rev1 ต้องทบทวนกับข้อมูลจริงก่อนใช้ การใช้ DB เดิมยังไม่ใช่การเลือกว่าจะเรียก Login API เดิมหรือทำ Login ใน SchoolBot
- ยังไม่ถือว่าผู้ใช้อนุมัติ schema, API หรือวิธีตรวจ credential ใหม่

## คำชี้แจงที่ยุติเรื่องตำแหน่ง API — 2026-10-21

ผู้ใช้ตอบ: "api ทุกอย่าง ที่ต้องใช้ จะไปทำใน C:\src\schoolbright\target\school-bot-v2\web ตัว app เรียกใช้เอา เหมือนที่ app เท่าไปเขาทำกัน"

- API ทั้งหมดที่ SchoolBot ต้องใช้ รวม Login ทำใน `school-bot-v2/web`; Desktop app เรียก API นี้
- Backend ใช้บัญชีและข้อมูลเดิม ไม่สร้างบัญชีผู้ใช้ชุดใหม่เพียงเพื่อ Login SchoolBot
- ไม่เลือกให้ SchoolBot ต้องเรียก Login API ของ Academic หรือ provider ภายนอกเป็นเงื่อนไขตั้งต้น คำถามเรื่องตำแหน่ง Login จบแล้ว
- รูปแบบตรวจรหัสผ่านเดิม, account/profile mapping และตำแหน่งตารางใหม่ยังต้องตรวจ/เสนอให้ครบ ไม่ใช่อนุมัติ SQL หรือ implementation ในงานกลั่นแบบนี้

## ขอบเขตการตรวจ

ตรวจ Entities และ EF mapping ที่เกี่ยวข้องแบบ read-only เพื่อแยกบัญชี นักเรียน บุคลากร และโรงเรียน ไม่อ่านค่ารหัสผ่านจริง ไม่เชื่อมฐานข้อมูล และไม่แก้ source

SA ต้องแยกหลักฐานเรื่อง entity/key ออกจาก login API/token validation ซึ่งยังต้องอ้าง implementation ของระบบเดิม ห้ามใช้ชื่อฟิลด์เป็นหลักฐานว่าระบบรองรับ OAuth/OIDC หรือว่า ID ทุกชนิดเป็นค่าเดียวกัน

เกี่ยวข้องกับ REQ-033/036/038/039, DES-003/004/005 และ logical data model โดยคงมติ Guest/Local, Login/Cloud และ License เดิมทั้งหมด

## Change Log

- 2026-10-21 — MYCELIUM บันทึกคำชี้แจงผู้ใช้และส่ง SA ทบทวนการเชื่อมข้อมูลเดิมก่อนแก้แบบ
- 2026-10-21 — ผู้ใช้ชี้แจง "ระบบ login อะ ก็ทำที่เดิม แต่แค่ db เราจะใช้ 4 คัวนี้ด้วย"; แยกการใช้ข้อมูลบัญชีเดิมจากตำแหน่ง login implementation และเปิดคำถามแบบเลือกคำตอบเพื่อไม่อนุมาน API แทนผู้ใช้
- 2026-10-21 — ผู้ใช้ตอบแล้วว่า API ทั้งหมดอยู่ school-bot-v2/web และแอปเรียก API; ปิดคำถามตำแหน่ง Login ส่ง SA แก้ร่างให้ตรงมตินี้
