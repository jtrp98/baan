# ขอบเขตอ้างอิงของสัญญาตัวตนและ auth ข้ามระบบ

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (ปรับอ้างอิงมติ 052 และอธิบาย OQ-009 เรื่องผลลัพธ์การเรียนและเมนูครู)

เอกสารนี้รวมหัวข้อ requirement และมติที่ [DES-004 (ตัวตนและสิทธิ์)](des-004.md) Rev13 กับ [DES-012 (auth ข้ามระบบ)](des-012.md) Rev9 อ้างอยู่ เป็นสารบัญอ้างอิงของสัญญาปัจจุบัน ไม่เพิ่มกฎธุรกิจหรือเกณฑ์ตรวจ

## ขอบเขต requirement

| Requirement และความหมาย | ตัวตน/สิทธิ์ ([DES-004 (ตัวตนและสิทธิ์)](des-004.md)) | Auth ข้ามระบบ ([DES-012 (auth ข้ามระบบ)](des-012.md)) |
|---|---|---|
| [REQ-027 (จัดการ license ผ่าน admin API)](../../modules/app-shell/shared/requirements/req-027.md) | อ้าง | อ้าง |
| [REQ-033 (ชื่อและฟิลด์ข้อมูล SchoolBot)](../../modules/app-shell/shared/requirements/req-033.md) | อ้าง | — |
| [REQ-035 (ผู้ดูแลปลดเครื่องและย้าย Key เดิม)](../../modules/app-shell/shared/requirements/req-035.md) | อ้าง | — |
| [REQ-036 (Guest Local และ Login Cloud)](../../modules/app-shell/shared/requirements/req-036.md) | อ้าง | — |
| [REQ-037 (หลักสูตรและภารกิจสามโหมด)](../../modules/quiz/shared/requirements/req-037.md) | อ้าง | — |
| [REQ-038 (ประเมิน Code/Block อัตโนมัติและ Arm โดยครู)](../../modules/quiz/shared/requirements/req-038.md) | อ้าง | อ้าง |
| [REQ-039 (ความคืบหน้าและการติดตามโดยครู)](../../modules/quiz/shared/requirements/req-039.md) | อ้าง | อ้าง |
| [REQ-040 (พื้นที่ร่วมและถังขยะ Guest)](../../modules/my-work/shared/requirements/req-040.md) | อ้าง | — |
| [REQ-041 (เลือกนำเข้าโครงงาน Guest)](../../modules/my-work/shared/requirements/req-041.md) | อ้าง | — |
| [REQ-042 (ประวัติเรียน Guest และตรวจผลใหม่)](../../modules/my-work/shared/requirements/req-042.md) | อ้าง | — |
| [REQ-043 (หลักสูตรกลางแบบ Level และ Activity)](../../modules/quiz/shared/requirements/req-043.md) | อ้าง | อ้าง |
| [REQ-048 (เสนอและยืนยันเลื่อน Level ทั้งห้อง)](../../modules/quiz/shared/requirements/req-048.md) | อ้าง | อ้าง |
| [REQ-049 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) | อ้าง | อ้าง |
| [REQ-050 (Preview และยืนยันส่งคะแนนกิจกรรม)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md) | อ้าง | อ้าง |
| [REQ-051 (คะแนนชนและการคุ้มครองคะแนนครู)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md) | อ้าง | — |
| [REQ-052 (สิทธิ์ การส่งซ้ำ และ audit คะแนน)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) | อ้าง | อ้าง |

[DES-012 (auth ข้ามระบบ)](des-012.md) อ้างกฎธุรกิจ [BR-043-05 (กฎหลักสูตรกลาง)](../../modules/quiz/shared/requirements/req-043.md), [BR-048-05 (กฎเลื่อน Level)](../../modules/quiz/shared/requirements/req-048.md), [BR-049-05 และ BR-049-06 (กฎ mapping คะแนน)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) และ [BR-052-01 (กฎสิทธิ์/audit ส่งคะแนน)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) ภายใต้ requirement ที่ลิงก์ในตาราง เลขกฎเหล่านี้คงตามต้นฉบับ ไม่แก้หรือเพิ่ม Acceptance Criteria (AC)

## มติที่ใช้อ้าง

- [มติ 010 (ใช้บัญชีเดิมและวาง API ใน school-bot/web)](../../shared/decisions/decisions-010.md)
- [มติ 011 (ใช้ฐานข้อมูลเดิมร่วมกับ SchoolBot)](../../shared/decisions/decisions-011.md)
- [มติ 021 (ส่งคะแนนเข้าระบบเกรดโดย SchoolBot)](../../shared/decisions/decisions-021.md)
- [มติ 022 (แยกหน้า admin/ครูออกจาก Desktop)](../../shared/decisions/decisions-022.md)
- [มติ 023 (SchoolBot เขียนคะแนน ปัด half-up และ admin โรงเรียนจัด mapping)](../../shared/decisions/decisions-023.md)
- [มติ 024 (เกณฑ์ผ่าน Level และ policy ข้อสอบ)](../../shared/decisions/decisions-024.md)
- [มติ 025 (แลก token ผ่าน Gateway และแยกสิทธิ์ตามช่องทาง)](../../shared/decisions/decisions-025.md)
- [มติ 026 (รับแบบข้อมูลและสัญญาที่แก้ตามมติผู้ใช้)](../../shared/decisions/decisions-026.md)
- [มติ 027 (วางตารางใหม่ใน SchoolBot DB)](../../shared/decisions/decisions-027.md)
- [มติ 028 (ใช้ CreateBy/UpdateBy เป็น int null)](../../shared/decisions/decisions-028.md)
- [มติ 029 (ใช้บัญชี DB เดิมโดยไม่สร้าง role หรือ GRANT ใหม่)](../../shared/decisions/decisions-029.md)
- [มติ 030 (ใช้ UpdateDate เป็น concurrency token)](../../shared/decisions/decisions-030.md)
- [มติ 032 (ครูเก็บ Project Cloud ได้ แต่ไม่สร้างผลเรียน Cloud)](../../shared/decisions/decisions-032.md)
- [มติ 033 (ใช้ช่องคะแนนเดิม แปลงคะแนนตามสัดส่วน และข้ามผู้ไม่มีผล)](../../shared/decisions/decisions-033.md)
- [มติ 034 (ตรึงน้ำหนักรอบเรียนและขอบเขตครูปรับข้อสอบ)](../../shared/decisions/decisions-034.md)
- [มติ 035 (ตรวจกลุ่มแอดมิน/ผู้บริหารฝั่ง server และคง super admin เดิม)](../../shared/decisions/decisions-035.md)
- [มติ 051 (บันทึก Project และ Revision ในหน่วย commit เดียว)](../../shared/decisions/decisions-051.md)
- [มติ 052 (อายุ Desktop session นับจากเวลา bind)](../../shared/decisions/decisions-052.md)

## ผลลัพธ์การเรียนและความหมายของเมนูครู

[OQ-009 (ผลลัพธ์การเรียนและความหมายของเมนูครู)](../../shared/open-questions/oq-009.md) ถามว่าผู้ใช้หรือผู้ที่ผู้ใช้ระบุอนุมัติ inventory/ภารกิจ/criteria/rubric/ดาวสามโหมดฉบับใดแล้ว [มติ 038 (ผู้อนุมัติเนื้อหาและ rubric ดาว)](../../shared/decisions/decisions-038.md) ส่วน spec Q1 กำหนดผู้อนุมัติเนื้อหา/เกณฑ์ revision บทเรียนเป็นผู้ใช้ และ Q2 ยืนยัน rubric ดาว 1/2/3 กับคู่ผ่าน–ไม่ผ่าน โดยดาวไม่เป็นเงื่อนไขเลื่อน Level; การอนุมัติเนื้อหาราย revision ยังต้องทำทีละฉบับเมื่อมีเนื้อหา และค่าที่ผูกกับหุ่นจริงยังรอข้อมูลตาม spec Q3

ความเกี่ยวข้องกับสัญญา auth คือชื่อ “เมนูครู” ไม่ยืนยันว่าผู้ใช้มีบัญชีหรือสิทธิ์ครู การติดตามผลและตรวจงานต้องใช้ตัวตน ช่องทาง และขอบเขตรายชื่อนักเรียนตาม [สิทธิ์ DES-004](des-004-permissions.md) และ [Authorization DES-012](des-012-authorization.md); Desktop ไม่มีเมนูครู การอนุมัติเนื้อหาหรือ rubric ไม่ใช่การให้สิทธิ์ครูแก่ผู้ใช้

## หลักฐาน

- ขอบเขตอ้างอิงใช้ [DES-004 (ตัวตนและสิทธิ์)](des-004.md) Rev13 และ [DES-012 (auth ข้ามระบบ)](des-012.md) Rev9; ผู้ใช้ยืนยันจุดเริ่มนับอายุ Desktop session ในแชตวันที่ 2026-11-02 ตาม [มติ 052 (อายุ Desktop session นับจากเวลา bind)](../../shared/decisions/decisions-052.md)
- [OQ-009 (ผลลัพธ์การเรียนและความหมายของเมนูครู)](../../shared/open-questions/oq-009.md) ส่วนคำถาม/เหตุผล/คำตอบผู้ใช้ และ [มติ 038 (ผู้อนุมัติเนื้อหาและ rubric ดาว)](../../shared/decisions/decisions-038.md) ส่วน spec Q1/Q2 และเรื่องที่ยังค้าง แยกการอนุมัติเนื้อหาออกจากการยืนยันสิทธิ์ครู
- requirement/index.md ให้ชื่อ requirement; รายการมติที่ลิงก์ข้างต้นให้ความหมายมติ งานนี้ไม่อ่าน/แก้เนื้อหา REQ หรือเปลี่ยนสถานะ requirement
- db/review-005 (memory) เป็นหลักฐานการ sync แบบเดิม ไม่ใช่ผลตรวจ SQL/runtime เพิ่มในงานนี้

