# TP-001 — เคส normal ของหน้า admin หลักสูตรและ revision (FE-019)

> Rev 1 · แก้ล่าสุด 2026-11-04 · แก้โดย inspect · ขอโดย ผู้ใช้ (จัดแผนตรวจหน้า admin หลักสูตรและ revision)

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

<a id="tp001-124"></a>
## TP001-124 — สร้าง แก้ และเปิดร่างจากข้อมูลที่บันทึกจริง

- **ระดับ:** normal
- **อ้างอิง:** FE-019; AC-044-02; AC-043-01 ส่วนส่วนกลาง; BR-044-01; DES-005 Rev12; draft contract Rev3; UX-005 Q39
- **ระดับการตรวจ:** UI component/integration ต่อ Gateway↔RPC
- **Setup:** U; ยังไม่มี Curriculum; author ใช้ metadata ถูกต้องและเนื้อหาสอง Lesson
- **ขั้นตอน:** สร้างร่างผ่าน UI → `POST Q/admin/curricula`; แก้ชื่อ/ที่มา → `PUT Q/admin/curricula/{id}`; แก้ instructions และกิจกรรม → `PUT Q/admin/curricula/{id}/content`; ปิดหน้า สร้าง reader ใหม่ แล้วเปิดผ่าน admin list/detail
- **Response:** 201/200/200; UI แสดงยืนยันหลัง server ตอบสำเร็จ และเปิดใหม่เห็น metadata/content ล่าสุดจาก `GET Q/admin/curricula/{id}`
- **Persisted state:** Curriculum draft=1, Lesson=2 และ children ตรง payload; `published_at=null`, `approval=null`; audit เพิ่ม 3 และ ledger เพิ่ม 3 จากสาม mutation; read-back ไม่เพิ่ม state
- **ส่วน full:** save conflict, validation error, session หมดอายุ, timeout หลัง commit และตรวจผลคำขอเดิม — AC-044-02/AC-043-01

<a id="tp001-125"></a>
## TP001-125 — ย้ายลำดับโดยคงรหัสและผลเดิม

- **ระดับ:** normal
- **อ้างอิง:** FE-019; AC-044-01; BR-044-01/04; DES-005; draft contract Rev3; UX-005 Q39
- **ระดับการตรวจ:** UI component/integration
- **Setup:** U-R; v2 มี A ordinal=1 และ B ordinal=2
- **ขั้นตอน:** ใช้ keyboard กดปุ่มขึ้นของ B แล้วบันทึก content; ปิดและเปิด v2 ใหม่ จากนั้นอ่าน v1 และผลผู้เรียนผ่าน reader C
- **Response:** PUT ได้ 200; GET ได้ลำดับ B,A; UI แสดง LessonKey A/B เดิมแยกจากลำดับ
- **Persisted state:** v2 มี ordinal B=1/A=2 และ logical LessonKey เดิม; audit/ledger เพิ่มอย่างละ 1; v1 และการอ้างอิงผลเดิมเท่า baseline ไม่บังคับให้ PK ของ children ใน draft คงเดิม
- **ส่วน full:** ordinal/key ซ้ำ; ย้ายพร้อมกันสอง editor; stale ETag; ตัด Lesson ที่ยังมีการอ้างอิง — AC-044-01

<a id="tp001-126"></a>
## TP001-126 — เผยแพร่ต้องมีหลักฐานและผู้ตรวจอีกคน

- **ระดับ:** normal
- **อ้างอิง:** FE-019; AC-044-03; BR-044-02/05; DES-005; draft contract Rev3; UX-005 Q39
- **ระดับการตรวจ:** UI component/integration
- **Setup:** U; draft ที่สร้างและบันทึก content แล้ว มี contributor audit ครบ; author ในกรณีตรวจ self-publish มีทั้ง author/approver role เพื่อทดสอบ four-eyes โดยตรง
- **ขั้นตอน:** approver ส่ง approval ว่างด้วย ETag สด; author ทดลอง publish revision ที่ตนแก้; จากนั้น approver คนที่สองกรอก `fixture:approved-curriculum-v2` และเผยแพร่ แล้วเปิดรายละเอียดใหม่
- **Response:** ขาดหลักฐานได้ 400 `INVALID_INPUT`; self-publish ได้ 409 `FOUR_EYES_REQUIRED`; UI ของผู้สร้างปิดปุ่มพร้อมเหตุผล; approver ที่ถูกต้องได้ 200 และ UI แสดง published พร้อม source/actor/time/ref จาก read-back
- **Persisted state:** สองคำขอปฏิเสธไม่เปลี่ยน draft/audit/success ledger; สำเร็จเปลี่ยนเป็น published พร้อม `PublishedAt`, publication audit หนึ่งรายการ และ ledger เพิ่มหนึ่งรายการ; approval actor ตรง authenticated approver และ ref เก็บตรงตัว
- **ส่วน full:** ผู้แก้หลายคนกลับมาอนุมัติ; contributor audit ไม่ครบ; approval เกิน 1,000 ตัวอักษร; publish แข่ง content PUT — AC-044-03

<a id="tp001-127"></a>
## TP001-127 — ฉบับใหม่ไม่แก้ published และประวัติผู้เรียนเดิม

- **ระดับ:** normal
- **อ้างอิง:** FE-019; AC-044-04/05; BR-044-03/04; DES-005; draft contract Rev3; UX-005 Q39
- **ระดับการตรวจ:** integration และ UI component
- **Setup:** U-R; มีเฉพาะ published v1; เก็บ baseline run และผลผู้เรียน
- **ขั้นตอน:** เปิด v1 ตรวจ read-only; ส่ง metadata/content PUT ที่ถูกต้องด้วย ETag สดเพื่อยืนยัน server guard; ใช้ “สร้างฉบับแก้ไขใหม่” ผ่าน create เดิม ไม่เรียก clone endpoint; สร้าง v2 โดยคง CurriculumKey/LessonKey แล้วแก้เนื้อหาและให้ approver publish; เปิด v1/v2 และผลผู้เรียนเดิมใหม่
- **Response:** PUT ต่อ v1 ได้ 409 `STATE_CONFLICT`; create/content/publish v2 ได้ 201/200/200; ผู้เรียนเดิมยังเปิด v1 และอ่านผลเดิมได้
- **Persisted state:** มีสอง revisions คนละ resource ID; v1/children/run/result/snapshot เดิมไม่เปลี่ยน; v2 เก็บเนื้อหาใหม่และ publication evidence ของตน; mutation สำเร็จเพิ่ม audit/ledger อย่างละ 3 ส่วนคำขอปฏิเสธไม่เพิ่ม
- **ส่วน full:** publish ระหว่างผู้เรียนอ่าน; history ข้าม revision ที่ key ตรงกัน; stale reader/cache; เปลี่ยน policy หรือเกณฑ์แล้วตรวจ snapshot เดิม — AC-044-04/05

<a id="tp001-130"></a>
## TP001-130 — โรงเรียนอ่านและเลือกใช้ได้ แต่แก้หลักสูตรกลางไม่ได้

- **ระดับ:** normal
- **อ้างอิง:** FE-019; AC-043-01; BR-043-01/05; DES-005; Gateway–gRPC contract Rev4; UX-005 §1
- **ระดับการตรวจ:** unit authorization และ integration/UI เมื่อ selection contract พร้อม
- **Setup:** U-R; school admin S1 มี License active; published v1 พร้อมเลือก; จับ baseline หลักสูตรและ run ของ S1
- **ขั้นตอนที่ตรวจได้:** school admin เรียก `GET Q/curricula` และ detail; ทดลอง create, metadata PUT และ content PUT ด้วยข้อมูลถูกต้อง; ตรวจ `EvaluateSelectCurriculum` ด้วย school admin/License/published ที่กำหนด
- **Response:** published read ได้ 200; mutation หลักสูตรกลางได้ 403 `CHANNEL_NOT_ALLOWED`; unit selection authorization อนุญาต
- **Persisted state:** คำขออ่าน/ปฏิเสธไม่เปลี่ยน curriculum/children/audit/success ledger
- **ส่วนที่ยังเขียน executable acceptance ไม่ได้:** การกดเลือกแล้วบันทึก assignment ลงห้อง/เทอม ไม่มี write RPC/HTTP ใน contract Rev4 ต้องให้ arch ระบุ operation, payload, response และ read-back ของ persisted assignment ก่อน ห้ามนับ authorization unit หรือ seeded CourseRun เป็นหลักฐานเลือกใช้สำเร็จ
- **ส่วน full:** ต่างโรงเรียน/ห้อง/เทอม; License หมดอายุ; เลือก draft; สอง admin เลือกพร้อมกัน — AC-043-01

## หลักฐาน

- [ตาราง normal แยกตาม task](tp-001-normal-index.md) · [สัญญา Gateway–gRPC Rev4](../design/gateway-grpc-contract-001.md) · [DES-005 import state](../design/des-005-import-state.md)
