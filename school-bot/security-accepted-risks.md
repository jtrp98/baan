# ความเสี่ยงที่ผู้ใช้ยอมรับ

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

| Decision | ขอบเขต | ข้อจำกัด |
| --- | --- | --- |
| [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](requirement/decisions-025.md) | เฉพาะการรับ token เว็บเดิมที่ไม่มี exp และ revoke รายตัวไม่ได้ เพื่อแลกเป็น SchoolBot session ตามที่ผู้ใช้ยืนยัน (คำยืนยันเรื่อง token เว็บไม่มี exp, 2026-10-22) | ไม่ขยายไปถึง: handoff token, token ผิดประเภทหรือไม่มี claim, การใช้ Jwt:Secret ร่วม, การ log token/claims, การรับ is_admin จากแหล่งที่ไม่ผ่านการตรวจ, session ที่อายุเกิน 30 นาที/8 ชม. ที่ [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](design/des-012.md) กำหนด และการไม่ audit การแลก. ข้อเสนอลดความเสี่ยงใน decisions-025 ยังไม่ได้ยืนยัน ดังนั้น jpo ถือ session cap, audit และ revoke เป็นเงื่อนไขของการตรวจ ไม่ใช่เงื่อนไขที่ผู้ใช้ยอมรับ. ไม่มีการรับความเสี่ยงอื่นจากผู้ใช้ และ jpo ไม่ได้รับความเสี่ยงแทนใคร |

ไม่มี risk acceptance ใหม่จากการตรวจภายหลัง. [มติ 046 (Gateway dev และระยะเวลา replay ของ License)](requirement/decisions-046.md) อนุมัติ dev และ replay 15 นาที ไม่ปิด security gates; [มติ 047 (พักเรื่องกุญแจเซ็น License)](requirement/decisions-047.md) พัก signer/custody ของ License ไม่ใช่รับความเสี่ยง. Important ต้องแก้และตรวจซ้ำหรือผู้มีอำนาจยอมรับเป็นลายลักษณ์อักษร ระบุผู้ยอมรับ วันที่ และขอบเขต.

## ยังไม่ยืนยัน

ข้อเสนอลดความเสี่ยงในมติ 025 ยังไม่ใช่เงื่อนไขที่ผู้ใช้ยอมรับ; session cap, audit และ revoke เป็นเงื่อนไขตรวจของ จป.

## หลักฐาน

- requirement/decisions-025.md:19
- requirement/decisions-035.md
- requirement/decisions-046.md
- requirement/decisions-047.md
