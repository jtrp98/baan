# พื้นที่ Guest — ส่งออกและเปิดไฟล์กลับ

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [พื้นที่ Guest ถังขยะ และไฟล์ส่งออก](guest-workspace-001.md)

## Export / เปิดกลับ

ส่งออกหนึ่งงานเป็นไฟล์ `.schoolbot-project.json`, media type `application/json`, UTF-8 ไม่มี archive/ไฟล์แนบ; bytes ทั้งไฟล์ ≤1 MiB. เนื้อหาคือ LocalProjectDocument ตาม [DES-003 (จัดการหลาย Project)](des-003.md) (schema=2, UUID, mode, name, local_revision, updated_at, content) ไม่ใส่ License/session/device key, acceptance/connection/uploaded truth, Cloud owner หรือประวัติเรียน. เขียนไฟล์แบบ atomic ผ่าน save dialog ที่ host คุม แล้วคืน `{exported:true}` หลังสำเร็จ; cancel → `EXPORT_CANCELLED`, I/O failure → `STORE_UNAVAILABLE`, ขนาดเกิน → `PROJECT_TOO_LARGE`; ต้นฉบับไม่ถูกแก้

เปิดกลับตรวจ JSON/schema/content/ขนาดรวม และ Code UI UTF-16 bound ตาม DES-003 ก่อนเขียน. ไม่รัน source/คำสั่งหุ่นจากการเปิดไฟล์. UUID ที่ยังไม่มีนำกลับพร้อม mode/content เดิม; UUID ที่มีและเนื้อหาเท่ากันเปิดงานเดิม; ถ้าเนื้อหาต่างคืน `PROJECT_EXISTS` ให้ผู้ใช้เลือกสร้างสำเนา UUID ใหม่ ไม่ทับเงียบ. การเปิดงาน trash ต้อง restore ตามอายุ ไม่ใช้ export/import เป็นการต่ออายุรายการเดิม
