# มติ auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop
> ถูกแทนด้วย มติ 035 (เฉพาะแหล่งสิทธิ์ผู้ดูแลโรงเรียนจากกลุ่มสิทธิ์ฝั่ง server) — [มติ 035](decisions-035.md)

## คำตอบผู้ใช้ — 2026-10-22

ผู้ตอบ: ผู้ใช้ในแชตนี้ ตอบประตูมนุษย์ของ [DES-012](../design/des-012.md) และรายการค้างจาก SA ผ่านคำถามแบบเลือกตอบ

1. H1 วิธียืนยันตัวตนหน้าเว็บ: "C. แลก token + gateway ตรวจ"
2. H2 token เว็บที่ไม่มีวันหมดอายุ (bypassgarde): "รับ และยอมรับความเสี่ยง"
3. H3 admin โรงเรียน: "บัญชี IsAdmin ของโรงเรียน"
4. H7 License สำหรับหน้าเว็บ: "ต้องมี License active"
5. H6 publish หลักสูตร/คลังข้อสอบกลาง: "ต้องมีคนที่สองอนุมัติ"
6. H8 `/v1/admin` static bearer: "ย้ายไป /v2/admin แล้วปิด v1"
7. สอบซ่อม Test: "คะแนนสูงสุด ไม่มีเพดาน"
8. Login Desktop: "นักเรียนและครู (ใช้เรียน/ลองเท่านั้น)"

## ข้อกำหนดที่ยืนยัน

- หน้าครู/admin โรงเรียนใน web-system แลก token เว็บเป็น SchoolBot session อายุสั้นแยก channel โดยตรวจ token ผ่าน endpoint ใหม่ของ gateway (`web-principal`) ตาม DES-012 ทาง C; ไม่ใช้ key ที่แชร์ และไม่ผ่าน gateway ทุกเส้น
- **การยอมรับความเสี่ยง (risk acceptance) โดยผู้ใช้:** รับ token เว็บที่ออกจากระบบเดิมโดยไม่มี exp และ revoke รายตัวไม่ได้ เพื่อแลกเป็น SchoolBot session — ผู้ใช้รับทราบว่า token ที่หลุดใช้แลก session ได้ไม่จำกัดเวลา (SA เสนอให้ปฏิเสธ แต่ผู้ใช้เลือกรับ)
- admin โรงเรียน = บัญชีที่ IsAdmin=1 ของโรงเรียนนั้น; เป็นผู้สร้าง/แก้ mapping ตาม decisions-023 — endpoint `web-principal` ต้องคืนค่า IsAdmin (parse-legacy-token เดิมไม่คืน)
- session ช่องเว็บโรงเรียนต้องมี SchoolBot License ที่ active ของโรงเรียน
- publish หลักสูตร/คลังข้อสอบกลางต้องมี staff คนที่สองอนุมัติ (four-eyes) ผู้สร้างอนุมัติเองไม่ได้
- ย้าย admin API ไป `/v2/admin` ที่ใช้ staff session แล้วปิด `/v1/admin` static bearer
- สอบซ่อม Test: ใช้คะแนนสูงสุดระหว่างครั้งจริงกับครั้งซ่อม ไม่มีเพดาน
- Desktop: นักเรียนและครู login ได้ ใช้เรียน/ลองเท่านั้น ไม่มีเมนูครูหรือการส่งคะแนนใน Desktop

## ข้อเสนอลดความเสี่ยง H2 (สมมติฐาน — ยังไม่ยืนยัน)

- SchoolBot session ที่แลกได้ยังอายุสั้นและ revoke ได้ตาม DES-012
- audit ทุกการแลก session พร้อมแหล่ง token (ระบบเดิม vs gateway) เพื่อให้ตรวจย้อนได้
- ทบทวนการยอมรับนี้ใหม่เมื่อระบบเดิมเลิกออก token แบบไม่มี exp

## ยังรอ

- H4 schema ใหม่/แก้ (Session channel, StaffRole, CourseRun.PlanCourseIds ฯลฯ) → DBA
- H5 env/route ใหม่ใน web-system และ network SchoolBot ↔ gateway → เจ้าของ repo/infra
- endpoint `web-principal` → เจ้าของ sb-api-gateway
- รายชื่อ staff_admin ตั้งต้น, release gates ของ DES-009, test สุ่มลำดับตัวเลือกหรือไม่; OQ-014/016 และขอบเขตครูปรับ policy ตอบแล้วตาม decisions-032/033/034 ไม่ใช่ข้อค้าง

## Change Log

- 2026-10-23 — เชื่อม decisions-032..034 ตัด OQ-014/016/ขอบเขตครูออกจากรายการรอ; gate อื่นคงเดิม

- 2026-10-22 — MYCELIUM บันทึกคำตอบผู้ใช้ 8 ข้อ รวม risk acceptance H2
