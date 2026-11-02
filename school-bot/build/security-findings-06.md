# รายละเอียดความปลอดภัยและเงื่อนไขการแก้

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

TTL คือ Time to Live หรือระยะเวลาที่อนุญาตให้เก็บหรือใช้.

ข้อสังเกตเดิมคงความหมายตามวันที่ตรวจ; สถานะปัจจุบันรวมผลตรวจต่อมาของข้อนั้น.

## SEC001-008 — build Desktop ไม่บังคับ API URL production จึงอาจแจก binary ที่ฝัง http://localhost:8080

**สถานะปัจจุบัน:** เปิด · Medium. ต้องพิสูจน์ release build/payload และการปฏิเสธ response ที่ไม่ลงนาม.

ลักษณะข้อค้นพบ: actual_defect. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: บน เครื่องที่ใช้ร่วมกัน process อื่นที่ฟังพอร์ต 8080 ปลอมเป็น API ตอบ license/update ได้. ตอนนี้ผลถูกทิ้งหรือไม่ถูกบังคับ จึงยังไม่มีผล แต่ถ้า host ไม่ verify ลายเซ็นของ lease/manifest จะกลายเป็นช่องหลบ. ยังมี env override SCHOOL_BOT_API_URL และ ARM_API_URL ที่เครื่องผู้ใช้

วิธีแก้: ให้ build/package แบบ release ล้มเหลวถ้าไม่ตั้ง SCHOOL_BOT_BUILD_API_URL เป็น HTTPS, ใน production ไม่ใช้ env override หรือจำกัดเฉพาะ dev build, และสำคัญกว่าคือให้ความน่าเชื่อถือของ lease/manifest มาจากลายเซ็นกับ trust root ที่ฝัง ไม่ใช่จาก transport ([SEC001-003 (ห่วงโซ่ update trust ยังไม่มี: signature ไม่ถูก verify, ไม่มี origin allowlist, ไม่มี withdraw หรือ audit และยังไม่มีหลักฐาน signing ของ installer จริง)](security-findings-03.md), [SEC001-004 (Desktop ไม่บังคับ entitlement ฝั่ง host เลย: Run/Save/Load ไม่มี gate, ผล activate ถูกทิ้ง และไม่มี signed lease)](security-findings-04.md))

ผู้รับ: be

การตรวจซ้ำ: jpo ตรวจ release payload ว่าไม่มี localhost URL และทดสอบว่า response ที่ไม่ลงนามไม่ถูกรับเป็นสิทธิ์

## ยังไม่ยืนยัน

ข้อมูลที่ยังต้องพิสูจน์ระบุในสถานะปัจจุบันและวิธีตรวจซ้ำของแต่ละข้อ. การแก้แบบยังไม่ยืนยัน implementation; ตัวเลข TTL/limit เดิมยังต้องยืนยัน ยกเว้น replay 15 นาทีตาม [มติ 046 (อนุมัติ replay License 15 นาที)](../shared/decisions/decisions-046.md).

## หลักฐาน

- SEC001-008: app/desktopservice.go:29,54-61,182-193; scripts/build-desktop.ps1:41-49; docs/DEPLOYMENT.md:13-33
- งานที่รับข้อค้นพบนี้: BE-020, BE-021, BE-022, BE-007
