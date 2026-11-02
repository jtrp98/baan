# ขอบเขตอ้างอิงของสัญญาตัวตนและ auth ข้ามระบบ

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

เอกสารนี้รวมหัวข้อ requirement และมติที่ต้นฉบับ [DES-004 (ตัวตนและสิทธิ์)](des-004.md) Rev12 กับ [DES-012 (auth ข้ามระบบ)](des-012.md) Rev9 อ้างอยู่ เป็นสารบัญอ้างอิงของสัญญาเดิม ไม่เพิ่มกฎธุรกิจหรือเกณฑ์ตรวจ

## ขอบเขต requirement

| Requirement และความหมาย | ตัวตน/สิทธิ์ ([DES-004 (ตัวตนและสิทธิ์)](des-004.md)) | Auth ข้ามระบบ ([DES-012 (auth ข้ามระบบ)](des-012.md)) |
|---|---|---|
| [REQ-027 (จัดการ license ผ่าน admin API)](../requirement/req-027.md) | อ้าง | อ้าง |
| [REQ-033 (ชื่อและฟิลด์ข้อมูล SchoolBot)](../requirement/req-033.md) | อ้าง | — |
| [REQ-035 (ผู้ดูแลปลดเครื่องและย้าย Key เดิม)](../requirement/req-035.md) | อ้าง | — |
| [REQ-036 (Guest Local และ Login Cloud)](../requirement/req-036.md) | อ้าง | — |
| [REQ-037 (หลักสูตรและภารกิจสามโหมด)](../requirement/req-037.md) | อ้าง | — |
| [REQ-038 (ประเมิน Code/Block อัตโนมัติและ Arm โดยครู)](../requirement/req-038.md) | อ้าง | อ้าง |
| [REQ-039 (ความคืบหน้าและการติดตามโดยครู)](../requirement/req-039.md) | อ้าง | อ้าง |
| [REQ-040 (พื้นที่ร่วมและถังขยะ Guest)](../requirement/req-040.md) | อ้าง | — |
| [REQ-041 (เลือกนำเข้าโครงงาน Guest)](../requirement/req-041.md) | อ้าง | — |
| [REQ-042 (ประวัติเรียน Guest และตรวจผลใหม่)](../requirement/req-042.md) | อ้าง | — |
| [REQ-043 (หลักสูตรกลางแบบ Level และ Activity)](../requirement/req-043.md) | อ้าง | อ้าง |
| [REQ-048 (เสนอและยืนยันเลื่อน Level ทั้งห้อง)](../requirement/req-048.md) | อ้าง | อ้าง |
| [REQ-049 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](../requirement/req-049.md) | อ้าง | อ้าง |
| [REQ-050 (Preview และยืนยันส่งคะแนนกิจกรรม)](../requirement/req-050.md) | อ้าง | อ้าง |
| [REQ-051 (คะแนนชนและการคุ้มครองคะแนนครู)](../requirement/req-051.md) | อ้าง | — |
| [REQ-052 (สิทธิ์ การส่งซ้ำ และ audit คะแนน)](../requirement/req-052.md) | อ้าง | อ้าง |

[DES-012 (auth ข้ามระบบ)](des-012.md) อ้างกฎธุรกิจ [BR-043-05 (กฎหลักสูตรกลาง)](../requirement/req-043.md), [BR-048-05 (กฎเลื่อน Level)](../requirement/req-048.md), [BR-049-05 และ BR-049-06 (กฎ mapping คะแนน)](../requirement/req-049.md) และ [BR-052-01 (กฎสิทธิ์/audit ส่งคะแนน)](../requirement/req-052.md) ภายใต้ requirement ที่ลิงก์ในตาราง เลขกฎเหล่านี้คงตามต้นฉบับ ไม่แก้หรือเพิ่ม Acceptance Criteria (AC)

## มติที่ใช้อ้าง

- [มติ 010 (ใช้บัญชีเดิมและวาง API ใน school-bot/web)](../requirement/decisions-010.md)
- [มติ 011 (ใช้ฐานข้อมูลเดิมร่วมกับ SchoolBot)](../requirement/decisions-011.md)
- [มติ 021 (ส่งคะแนนเข้าระบบเกรดโดย SchoolBot)](../requirement/decisions-021.md)
- [มติ 022 (แยกหน้า admin/ครูออกจาก Desktop)](../requirement/decisions-022.md)
- [มติ 023 (SchoolBot เขียนคะแนน ปัด half-up และ admin โรงเรียนจัด mapping)](../requirement/decisions-023.md)
- [มติ 024 (เกณฑ์ผ่าน Level และ policy ข้อสอบ)](../requirement/decisions-024.md)
- [มติ 025 (แลก token ผ่าน Gateway และแยกสิทธิ์ตามช่องทาง)](../requirement/decisions-025.md)
- [มติ 026 (รับแบบข้อมูลและสัญญาที่แก้ตามมติผู้ใช้)](../requirement/decisions-026.md)
- [มติ 027 (วางตารางใหม่ใน SchoolBot DB)](../requirement/decisions-027.md)
- [มติ 028 (ใช้ CreateBy/UpdateBy เป็น int null)](../requirement/decisions-028.md)
- [มติ 029 (ใช้บัญชี DB เดิมโดยไม่สร้าง role หรือ GRANT ใหม่)](../requirement/decisions-029.md)
- [มติ 030 (ใช้ UpdateDate เป็น concurrency token)](../requirement/decisions-030.md)
- [มติ 032 (ครูเก็บ Project Cloud ได้ แต่ไม่สร้างผลเรียน Cloud)](../requirement/decisions-032.md)
- [มติ 033 (ใช้ช่องคะแนนเดิม แปลงคะแนนตามสัดส่วน และข้ามผู้ไม่มีผล)](../requirement/decisions-033.md)
- [มติ 034 (ตรึงน้ำหนักรอบเรียนและขอบเขตครูปรับข้อสอบ)](../requirement/decisions-034.md)
- [มติ 035 (ตรวจกลุ่มแอดมิน/ผู้บริหารฝั่ง server และคง super admin เดิม)](../requirement/decisions-035.md)
- [มติ 051 (บันทึก Project และ Revision ในหน่วย commit เดียว)](../requirement/decisions-051.md)

## ยังไม่ยืนยัน

หัว [DES-004 (ตัวตนและสิทธิ์)](des-004.md) เดิมอ้าง [OQ-009 (คำถามเดิมที่ยังยืนยันหัวข้อไม่ได้)](../open-questions/oq-009.md) โดยไม่ระบุความหมาย ไม่มีข้อความในเนื้อหาที่ชี้ว่าต้องใช้คำตอบใด งานนี้ไม่ได้รับสิทธิ์อ่านคำถามนั้น จึงคงเป็นหลักฐานว่ามีการอ้าง [OQ-009 (คำถามเดิมที่ DES-004 อ้างแต่ยังยืนยันหัวข้อไม่ได้)](../open-questions/oq-009.md) ให้เจ้าของ requirement ยืนยันความหมายหากยังต้องใช้ ไม่ใช้ ID นี้ตัดสิน policy

## หลักฐาน

- ขอบเขตอ้างอิงมาจากหัวเอกสาร [DES-004 (ตัวตนและสิทธิ์)](des-004.md) Rev12 และ [DES-012 (auth ข้ามระบบ)](des-012.md) Rev9 ก่อนเรียบเรียง
- requirement/index.md ให้ชื่อ requirement; รายการมติที่ลิงก์ข้างต้นให้ความหมายมติ งานนี้ไม่อ่าน/แก้เนื้อหา REQ หรือเปลี่ยนสถานะ requirement
- db/review-005 (memory) เป็นหลักฐานการ sync แบบเดิม ไม่ใช่ผลตรวจ SQL/runtime เพิ่มในงานนี้

