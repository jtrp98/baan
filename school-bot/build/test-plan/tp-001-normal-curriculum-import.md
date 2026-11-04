# TP-001 — เคส normal ของการนำเข้า Course Plan Sheet ในหน้า admin (FE-019)

> Rev 1 · แก้ล่าสุด 2026-11-04 · แก้โดย inspect · ขอโดย ผู้ใช้ (จัดแผนตรวจหน้า preview และนำเข้า Course Plan Sheet)

เคสระดับ normal (happy flow + ผลปฏิเสธหลักของ AC) ผลจริงทุกเคส NOT_RUN · path ใช้ Q = /api/school-bot/service ของ Gateway ตามสัญญา gRPC Rev4

## Setup ร่วม

**L-R — Release ต่อจาก setup L**

- หนึ่ง host/หนึ่ง process มี services/adapters A และ B สองชุด; memory แชร์ store object เดียว ส่วน persistent/file ใช้ store objects คนละตัวชี้ canonical directory เดียวกันตาม setup L
- reader C เป็น service/adapter ใหม่; การตรวจ reopen ต้อง dispose A/B และ store objects เดิมทั้งหมด แล้วสร้างใหม่จาก persistent location เดิม ห้ามคัดลอกรายการ release กลับเข้า memory เพื่อทำให้ผ่าน
- memory ใช้ตรวจการมองเห็นข้าม adapter เท่านั้น **ไม่นับเป็นหลักฐาน restart persistence**
- เวลา fake UTC `2026-11-04T00:00:00Z`; ผู้จัดการ release เป็น central staff ที่มี `AdminId`; update check ไม่ต้อง login
- ใช้ trusted peer/identity doubles เฉพาะ harness; ไม่มี fault injection และไม่ติดต่อ artifact URL จริง
- ข้อมูลถูกต้องตั้งต้น: version `1.2.3`, channel `stable`, platform `windows-amd64`, URL `https://example.invalid/school-bot.exe`, SHA256 เป็น `a` จำนวน 64 ตัว และ signature `fixture-signature`
- ตรวจ state ผ่าน C ไม่ใช้ response/cache ของ writer แทนข้อมูลที่เก็บจริง

**U — Admin หลักสูตร**

- หนึ่ง host/หนึ่ง process มี browser context ของ author และ approver แยกกัน; service/adapters A/B และ reader C ใช้ topology memory/file ตาม L
- author เป็น `staff_admin` มี `content_author`; approver เป็นอีก principal มี `content_approver` และไม่เคยสร้างหรือแก้ revision ที่จะเผยแพร่
- โรงเรียน S1 มี License active; school admin เป็น `school_web`, `IsSchoolAdmin=true`; ผู้เรียนเป็น student ของ S1 ที่อยู่ใน roster
- ใช้ Level/subjects และ LessonInput/ActivityInput ที่ผ่าน validation ตาม DES-005; ข้อมูลทดสอบใช้ instruction activities จึงไม่เพิ่มเงื่อนไขประเมินภารกิจที่ไม่เกี่ยวข้อง
- mutation ส่ง `Idempotency-Key` UUID ใหม่; metadata/content/publish ส่ง `If-Match` ล่าสุดจาก server
- ไม่มี fault injection; ไม่ใช้ Google Sheet หรือ hardware จริง; อ่าน state ใหม่ผ่าน C หลังจบแต่ละช่วง
- UI ต้องใช้ implementation จริงของ FE-019 เมื่อมีแล้ว; API/component harness ที่ไม่มีหน้าจอจริงไม่นับเป็นผลตรวจ UI

**U-R — Revision และผลเดิม**

ต่อจาก U โดย seed published v1 ซึ่งมี Lesson A/B คนละ LessonKey, run ของ S1 ที่อ้าง v1 และผลผู้เรียนเดิมอย่างน้อยหนึ่งรายการ เก็บ baseline ของ v1, children, run, result และ snapshot ทั้งหมดก่อนเริ่ม

สำหรับ TP001-125 seed draft v2 ด้วย CurriculumKey เดิม แต่ resource ID ใหม่และ LessonKey A/B เดิม พร้อมประวัติ contributor ที่ถูกต้อง ส่วน TP001-127 เริ่มโดยยังไม่มี v2

**I — นำเข้า**

ใช้ supplied-row fixture และ setup จาก `tp-001-cases-quiz-grade-import.md` Rev2 และผลที่คาดจาก `des-005-import-state.md` Rev1:

- สามแถว D=true/false/null; แถวแรก C=6 แต่ชื่อแผนเป็น `Unit 7: How AI Learns`
- source identity และ LessonKey เป็น UUID ตาม manifest fixture ไม่สร้างจาก C/Unit/O/ตำแหน่ง
- แถวแรกมี supplied media refs ห้าค่า J/L/N/T/X
- baseline S0: Curriculum draft=1, Level=1; Lesson/Activity/Mission/audit/ledger=0
- baseline S1 หลังนำเข้าครั้งแรก: Lesson=3, Activity=3, audit=1, ledger=1
- raw-to-normalized mapping ของ fixture เป็น **สมมติฐานทดสอบ ยังไม่ยืนยันเป็น mapping เนื้อหาจริง**

<a id="tp001-128"></a>
## TP001-128 — นำเข้าทุกแถวเป็น draft พร้อม provenance และสื่อสองชุด

- **ระดับ:** normal
- **อ้างอิง:** FE-019; AC-045-01/03; BR-045-01/03/05; DES-005 import Rev2; import-state Rev1; UX-005 Q40
- **ระดับการตรวจ:** unit normalization และ UI component/integration
- **Setup:** I เริ่ม S0; author เปิด preview supplied rows; ไม่มี fault
- **ขั้นตอน:** ตรวจ preview ทั้งสามแถวและสื่อชุด 1/2; ก่อนยืนยันตรวจว่าไม่มี import mutation; ยืนยันผ่าน `POST Q/admin/curricula/{id}/import` ด้วย UUID ใหม่ ไม่ส่ง If-Match; ปิดหน้าและเปิด admin detail ผ่าน C
- **Response:** preview แสดง D=true ว่า “ตรวจแล้วจากต้นทาง — ยังไม่เผยแพร่”; false/null ไม่อ้างว่าอนุมัติแล้ว; import ได้ 200 `created` สามรายการ; read-back แสดง source/provenance และสื่อห้ารายการใน Lesson แรก
- **Persisted state:** ก่อนยืนยันเท่า S0; หลังยืนยันเท่า S1: Lesson=3, Activity=3, audit=1, ledger=1; Curriculum draft, approval/published_at เป็น null; source_approved=true/false/null ตรงแถว; Level/Curriculum คงอย่างละ 1 และ P–X ไม่สร้าง Lesson ใหม่
- **ส่วน full:** แถวหนึ่ง invalid ต้องไม่ลงบางส่วน; missing/invalid link; merged/header rows; ImportSource ผิดรูป; import แข่ง publish — AC-045-01/03

<a id="tp001-129"></a>
## TP001-129 — O ไม่เปลี่ยนข้อมูล และรหัสไม่ผูก C/Unit/ลำดับ

- **ระดับ:** normal
- **อ้างอิง:** FE-019; AC-045-02/04; BR-045-02/04; DES-005 import-state Rev1; UX-005 Q39/Q40
- **ระดับการตรวจ:** unit normalization และ UI component/integration
- **Setup:** I; แยกสองกรณีจาก S1 ใหม่ ไม่สะสม counts ข้ามกรณี
- **ขั้นตอน A:** เปลี่ยนเฉพาะ O เป็น 999/−1/ข้อความ; preview และ normalize เทียบ base; import ด้วย UUID ใหม่ แล้วอ่านผ่าน C
- **Response A:** normalized body เท่ากับ base; import ได้ 200 `unchanged` สามรายการ
- **Persisted state A:** Lesson/Activity/identity/content/ordinal/ETag เดิม; audit=1, ledger=2
- **ขั้นตอน B:** preview แถว C=6/Unit 7 โดยแสดง LessonKey แยกทั้งสองค่า; สลับแถวเป็น 5,3,4 โดยคง manifest identity แล้ว import ด้วย UUID ใหม่; จากนั้นใช้ปุ่มขึ้น/ลงใน content editor และบันทึกด้วย UUID ใหม่/ETag สด
- **Response B:** reimport ได้ 200 `unchanged` สามรายการ; ไม่อ้างว่าการสลับ supplied rows ย้ายบทเรียนเดิม; content PUT ได้ 200 และเปิดใหม่เห็นลำดับที่แก้ผ่าน editor
- **Persisted state B:** หลัง reimport ordinal เดิมคงอยู่, audit=1/ledger=2; หลัง content PUT ordinal เปลี่ยนตาม editor แต่ LessonKey และ ImportSource ทั้งสามคงเดิม, audit=2/ledger=3; ไม่กำหนดให้ PK ของ children คงเดิม
- **ส่วน full:** identity สูญหาย/ชนกัน; row เดิมเปลี่ยนเนื้อหา; reorder ด้วย request key เดิม; จับคู่ข้าม revision โดยไม่มี manifest — AC-045-02/04

## หลักฐาน

- [ตาราง normal แยกตาม task](tp-001-normal-index.md) · [สัญญา Gateway–gRPC Rev4](../design/gateway-grpc-contract-001.md) · [DES-005 import state](../design/des-005-import-state.md)
