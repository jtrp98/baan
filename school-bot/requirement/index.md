# Requirements — school-bot

เอกสารกลั่นจาก repository `C:/src/schoolbright/target/school-bot` ตามคำสั่งผู้ใช้ เพื่อทบทวนความต้องการ ไม่ใช่การอนุมัติ release scope หรือหลักฐานว่าระบบผ่าน QA

ผู้ใช้ยืนยันระบบเต็มแล้ว ฐานเดิมถูกปรับและเติมเป็น 44 REQ รวม Guest/Cloud หลักสูตร Level ข้อสอบ และส่งคะแนน (REQ-043..052 ตาม decisions-020..022) ประเมินและติดตามผลตาม [มติล่าสุด](decisions-009.md); License/DB และการย้ายสิทธิ์ตาม decisions-004..007

## วิธีอ่าน

- ข้อเท็จจริงอ้าง `path:line` จากไฟล์ที่ BA ตรวจอ่าน เป็นหลักฐาน implementation หรือเอกสารประกอบ ไม่ใช่การยืนยันธุรกิจโดยมนุษย์
- มติธุรกิจอ้างผู้ยืนยัน/วันที่ในแต่ละ REQ; ประโยชน์หรือกฎที่ไม่มีมติรองรับเป็น `(สมมติฐาน — ยังไม่ยืนยัน)` ไม่ยกข้อจำกัดโค้ดเดิมเหนือมติ
- AC เป็นเกณฑ์เสนอสำหรับตรวจระบบที่รันอยู่ ยังไม่ได้ทดสอบในงานนี้
- Native หมายถึง Desktop ที่ใช้บริการในเครื่อง; sample/preview/mock เป็นการจำลอง
- เลข REQ-001..008 เป็นเลขใน Git index ของเอกสารชุดเดิมที่ นายช่าง ตรวจพบก่อนเริ่มชุดใหม่ จึงสงวนเลขและเริ่มที่ REQ-009
- สถานะ REQ เก็บในตารางนี้เท่านั้น

ลำดับอ้างอิง transport ปัจจุบัน: [Gateway Rev3](../design/gateway-integration-001.md) และ [DES-012 Rev9](../design/des-012.md) มี precedence เหนือถ้อยคำเส้นทาง API เดิมในหมวดนี้: client→HTTP G→gRPC B ไม่มี HTTP relay/direct public B. HTTP paths/status ใน BR/AC ของ REQ-027 รวม AC-027-01/02 เป็นเกณฑ์ที่ client boundary ของ G ไม่บังคับ B expose HTTP และไม่ยืนยันว่ามี RPC mapping แล้ว; HTTP Login เดิมของ G แยกจาก service transport B.

REQ026draft/Runปัจจุบัน: [spec090](../planning/spec-090-draft-fuel-001.md)ชี้fuel1000เป็นก่อนRun; structuralvaliddraftเก็บได้ ไม่มีคำถามธุรกิจใหม่/ACIDsและ44REQ186ACไม่เปลี่ยน.

## รายการ

| id | ชื่อ | status | AC | ไฟล์ |
|---|---|---|---|---|
| REQ-009 | Desktop และการใช้งานออฟไลน์ | DRAFT | 3 | [req-009.md](req-009.md) |
| REQ-010 | ภาษาของแอปและข้อมูลผู้ใช้ | DRAFT | 3 | [req-010.md](req-010.md) |
| REQ-011 | บันทึกและเปิดหลายโครงงาน | DRAFT | 4 | [req-011.md](req-011.md) |
| REQ-012 | ออกจากงานและปิดหน้าต่าง | DRAFT | 3 | [req-012.md](req-012.md) |
| REQ-013 | ขอบเขต sample/preview/mock | DRAFT | 3 | [req-013.md](req-013.md) |
| REQ-014 | ค้นหาและเชื่อมต่อหุ่น | DRAFT | 3 | [req-014.md](req-014.md) |
| REQ-015 | โปรไฟล์หุ่นหกข้อต่อ | DRAFT | 3 | [req-015.md](req-015.md) |
| REQ-016 | ส่งท่าและปรับข้อต่อ | DRAFT | 3 | [req-016.md](req-016.md) |
| REQ-017 | ข้อมูลท่า ลำดับ และกลุ่ม | DRAFT | 3 | [req-017.md](req-017.md) |
| REQ-018 | เล่นลำดับจากแอป | DRAFT | 3 | [req-018.md](req-018.md) |
| REQ-019 | อัปโหลดท่าไปบอร์ด | DRAFT | 3 | [req-019.md](req-019.md) |
| REQ-020 | เล่นชุดท่าบนบอร์ด | DRAFT | 3 | [req-020.md](req-020.md) |
| REQ-021 | ขอหยุดหุ่นและยกเลิกงานค้าง | DRAFT | 4 | [req-021.md](req-021.md) |
| REQ-022 | อ่านค่าตำแหน่ง servo | DRAFT | 3 | [req-022.md](req-022.md) |
| REQ-023 | ปลดและล็อกแรงบิด | DRAFT | 3 | [req-023.md](req-023.md) |
| REQ-024 | การเชื่อมต่อขาดและคำสั่งล้มเหลว | DRAFT | 3 | [req-024.md](req-024.md) |
| REQ-025 | Code Lab — เขียนและรันโปรแกรม | DRAFT | 3 | [req-025.md](req-025.md) |
| REQ-026 | สร้างและทดลองโปรแกรมบล็อก | DRAFT | 4 | [req-026.md](req-026.md) |
| REQ-027 | จัดการ license ผ่าน admin API | DRAFT | 4 | [req-027.md](req-027.md) |
| REQ-028 | Activate, validate และจำกัดอุปกรณ์ | DRAFT | 4 | [req-028.md](req-028.md) |
| REQ-029 | จัดการ release metadata | DRAFT | 3 | [req-029.md](req-029.md) |
| REQ-030 | ตรวจข้อมูลอัปเดตจาก Desktop | DRAFT | 8 | [req-030.md](req-030.md) |
| REQ-031 | ติดตั้งและดูแลแอปบน Windows | DRAFT | 5 | [req-031.md](req-031.md) |
| REQ-032 | ติดตั้งแอปบน macOS | DRAFT | 3 | [req-032.md](req-032.md) |
| REQ-033 | ชื่อและฟิลด์ข้อมูล SchoolBot | DRAFT | 5 | [req-033.md](req-033.md) |
| REQ-034 | ตรวจ License ออนไลน์และสิทธิ์ออฟไลน์ 3 วัน | DRAFT | 6 | [req-034.md](req-034.md) |
| REQ-035 | ผู้ดูแลปลดเครื่องและย้าย Key เดิม | DRAFT | 5 | [req-035.md](req-035.md) |
| REQ-036 | Guest Local และ Login Cloud | DRAFT | 6 | [req-036.md](req-036.md) |
| REQ-037 | หลักสูตรและภารกิจสามโหมด | DRAFT | 6 | [req-037.md](req-037.md) |
| REQ-038 | ประเมิน Code/Block อัตโนมัติและ Arm โดยครู | DRAFT | 5 | [req-038.md](req-038.md) |
| REQ-039 | ความคืบหน้าและการติดตามโดยครู | DRAFT | 5 | [req-039.md](req-039.md) |
| REQ-040 | พื้นที่ร่วมและถังขยะ Guest | DRAFT | 6 | [req-040.md](req-040.md) |
| REQ-041 | เลือกนำเข้าโครงงาน Guest | DRAFT | 5 | [req-041.md](req-041.md) |
| REQ-042 | ประวัติเรียน Guest และตรวจผลใหม่ | DRAFT | 6 | [req-042.md](req-042.md) |
| REQ-043 | หลักสูตรกลางแบบ Level และ Activity | DRAFT | 4 | [req-043.md](req-043.md) |
| REQ-044 | รหัสบทเรียนและ revision หลักสูตร | DRAFT | 5 | [req-044.md](req-044.md) |
| REQ-045 | นำเข้า Course Plan Sheet | DRAFT | 4 | [req-045.md](req-045.md) |
| REQ-046 | Quiz/Test และคลังข้อสอบแบบ revision | DRAFT | 7 | [req-046.md](req-046.md) |
| REQ-047 | การนับคะแนน Quiz รายหลักสูตร | DRAFT | 5 | [req-047.md](req-047.md) |
| REQ-048 | เสนอและยืนยันเลื่อน Level ทั้งห้อง | DRAFT | 4 | [req-048.md](req-048.md) |
| REQ-049 | Mapping หลักสูตรกับช่องคะแนน SchoolBright | DRAFT | 5 | [req-049.md](req-049.md) |
| REQ-050 | Preview และยืนยันส่งคะแนนกิจกรรม | DRAFT | 4 | [req-050.md](req-050.md) |
| REQ-051 | คะแนนชนและการคุ้มครองคะแนนครู | DRAFT | 5 | [req-051.md](req-051.md) |
| REQ-052 | สิทธิ์ การส่งซ้ำ และ audit คะแนน | DRAFT | 5 | [req-052.md](req-052.md) |

รวม 44 REQ / 187 AC — DRAFT (AC-030-04..08 ตรวจรับแล้วตาม [decisions-037](decisions-037.md))

ประวัติ REQ-046: [req-046-history-001.md](req-046-history-001.md)

## หมวดตามผลิตภัณฑ์

- Block Lab: REQ-026
- Arm Lab: REQ-014..024 และข้อมูลโครงงานใน REQ-011/017
- Code Lab: REQ-025
- บทเรียนเลือก Block/Arm/Code แยกจาก Lab; ณ source ที่ตรวจ Arm เปิด LearnMap ส่วน Block/Code แสดงว่ายังไม่มีบทเรียน ดู [ผลตรวจโค้ด](../design/source-review-001.md) และ [มติ 3 โหมด](decisions-003.md)
- REQ อื่นเป็นระบบกลาง; การจัดหมวดนี้ไม่เพิ่มโหมดหรือเปลี่ยน IDs

## ประเด็นรอยืนยัน

มติ Guest/ครู/ผู้อนุมัติ/OS ตอบแล้วใน decisions-014/015/016/019; [OQ](../open-questions/index.md) เหลือ artifact หุ่น เนื้อหา และส่งมอบ ส่วน contract ส่ง SA ไม่ถามนโยบายเดิมซ้ำ

## เอกสารขอบเขตและอ้างอิงในหมวด

- [scope.md](scope.md) — ภาพรวมโมดูล, Target Users, Release Scope, Constraints, Declined และ References
- [pack-guest-001.md](pack-guest-001.md) — ชุดอ้างอิงมติ Guest ส่งต่อ arch/int (BA-001 · 2026-10-24)
- [pack-content-inventory-001.md](pack-content-inventory-001.md) — inventory สามโหมด + เกณฑ์/ดาว + คู่ผ่าน–ไม่ผ่าน + ช่องผู้อนุมัติ (BA-002 · ครอบ GAP-09)
- [pack-hardware-001.md](pack-hardware-001.md) — hardware acceptance pack ครอบ 8 AC + platform matrix + ช่องกรอกคน (BA-003 · ครอบ GAP-05)
- [pack-delivery-001.md](pack-delivery-001.md) — delivery & decision-owner pack เข้า G-DELIVERY (BA-004)
- [scope-history-20261023-011.md](scope-history-20261023-011.md) — ส่วนประวัติ/Change Log ที่แยกจาก scope.md; ไม่ใช่สถานะปัจจุบัน
- [scope-baseline-001.md](scope-baseline-001.md) — หลักฐานความสามารถฐานเดิมและขอบเขต sample/preview/mock ณ 2026-10-21
- [source-references.md](source-references.md) — รายการไฟล์ source code และเอกสารต้นทางที่ใช้กลั่น requirement

## ทะเบียนมติผู้ใช้ (Decisions Registry)

| ไฟล์ | สรุปมติ |
|---|---|
| [decisions-001.md](decisions-001.md) | มติผู้ใช้ชุดแรกสำหรับ OQ-006..009 |
| [decisions-002.md](decisions-002.md) | เป้าหมายระบบเต็มใช้งานจริงครบทุกส่วน |
| [decisions-003.md](decisions-003.md) | โครงสร้าง 3 โหมด Block / Arm / Code แยกหน้าบทเรียนจากพื้นที่สร้างงาน |
| [decisions-004.md](decisions-004.md) | บังคับ License ก่อนใช้แอปทั้ง Guest/Login และตารางมาตรฐาน `SchoolBotLicense` |
| [decisions-005.md](decisions-005.md) | ตรวจ License ออนไลน์ครั้งแรก และใช้สิทธิ์ออฟไลน์ในเครื่องได้ 3 วัน |
| [decisions-006.md](decisions-006.md) | จำกัดสิทธิ์ 1 Key ผูก 1 เครื่อง |
| [decisions-007.md](decisions-007.md) | ผู้ดูแลปลดเครื่องก่อนย้าย Key เดิมได้ทันที; เครื่องเดิมอาจใช้ออฟไลน์จนสิทธิ์เดิมหมด |
| [decisions-008.md](decisions-008.md) | Windows และ macOS ต้องควบคุมหุ่นจริงได้ทั้งคู่ |
| [decisions-009.md](decisions-009.md) | Guest/Login เก็บหลายโครงงานทุกโหมด; Code/Block ประเมินอัตโนมัติ Arm ให้ครูตรวจ |
| [decisions-010.md](decisions-010.md) | API ทั้งหมดรวม Login อยู่ `school-bot/web` และใช้บัญชีเดิม |
| [decisions-011.md](decisions-011.md) | ใช้ DB เดิม 4 ตัวของ Academic (ส่วน placement ตาราง SchoolBot ปรับตาม decisions-027) |
| [decisions-012.md](decisions-012.md) | PK ของตาราง SchoolBot ใหม่เป็น `int4` |
| [decisions-013.md](decisions-013.md) | ยืนยัน DBML / logical data model เป็น baseline |
| [decisions-014.md](decisions-014.md) | Guest ใช้พื้นที่ร่วมและเลือกนำเข้างาน/ประวัติหลัง Login |
| [decisions-015.md](decisions-015.md) | ถังขยะ Guest กู้ได้ 30 วัน, ทีมร่างหลักสูตรสามโหมดให้ตรวจ, ครูดูแลเฉพาะนักเรียนที่ผู้ดูแลกำหนด |
| [decisions-016.md](decisions-016.md) | ผู้ใช้เป็นผู้อนุมัติ requirement/UX และตรวจรับภาพรวม (ปิด OQ-006) |
| [decisions-017.md](decisions-017.md) | มติเดิมให้ตรวจรองรับ Windows 10 x64 (ประวัติ — ถูกแทนโดย decisions-019) |
| [decisions-018.md](decisions-018.md) | ผลตรวจ MSI preflight บน Windows (ประวัติ — ถูกแทนโดย decisions-019) |
| [decisions-019.md](decisions-019.md) | เป้าหมาย OS ล่าสุด Windows 11 25H2 x64 และ macOS 15+ Intel/Apple Silicon (ยุติสาขา Windows 10) |
| [decisions-020.md](decisions-020.md) | หลักสูตรกลางแบบ Level ต่อภาคเรียน ผูกชั้น/วิชา เลื่อนทั้งห้องเมื่อครูยืนยัน; เปิด OQ-012 |
| [decisions-021.md](decisions-021.md) | ส่งคะแนนเป็นช่องย่อยต่อกิจกรรม เขียนระบบเกรดเองผ่านหน้า mapping (ปิด OQ-012) |
| [decisions-022.md](decisions-022.md) | admin เป็น Next.js ใน `school-bot/web`, หน้าครูอยู่ใน `sb-tech-upgrade-web-system`, Desktop ใช้เรียนอย่างเดียว |
| [decisions-023.md](decisions-023.md) | backend SchoolBot เขียนคะแนนเอง, ปัด half-up, นำเข้าทุกแถวเป็นร่าง, mapping เฉพาะ admin โรงเรียน (ปิด OQ-017; OQ-014/016 เป็น PARTIAL) |
| [decisions-024.md](decisions-024.md) | เกณฑ์ผ่านราย Level (เริ่ม 70%) สิ้นเทอม, policy quiz/test ค่าเริ่มส่วนกลาง ครูปรับได้ (ปิด OQ-013/015) |
| [decisions-025.md](decisions-025.md) | auth ทาง C, ยอมรับ token ไม่มี exp, admin โรงเรียน = IsAdmin, ต้องมี License, publish four-eyes, ปิด `/v1/admin`, สอบซ่อมใช้คะแนนสูงสุด, Desktop นักเรียน+ครู |
| [decisions-026.md](decisions-026.md) | อนุมัติ `amendment-proposal-001/002` เป็น baseline ใหม่ |
| [decisions-027.md](decisions-027.md) | ตาราง SchoolBot อยู่ SchoolBot DB (`10.0.0.128:9499`) ไม่ใช่ School DB (แทน placement ใน decisions-011) |
| [decisions-028.md](decisions-028.md) | `CreateBy`/`UpdateBy` เป็น `int null` |
| [decisions-029.md](decisions-029.md) | ไม่ GRANT/สร้าง role ใน School DB และ PGGradeDB ใช้บัญชี DB เดิม |
| [decisions-030.md](decisions-030.md) | ถอนคอลัมน์ `Version` ทั้งหมด ใช้ `UpdateDate` เป็น concurrency token แทน |
| [decisions-031.md](decisions-031.md) | repo เหลือ `school-bot` ตัวเดียว (`school-bot-v2` ไม่มีแล้ว) — พาธ `school-bot-v2` ในเอกสารเดิมให้อ่านเป็น `target/school-bot` |
| [decisions-032.md](decisions-032.md) | ครูทดลอง local/เก็บโครงงาน Cloud แต่ไม่ส่งงานหรือสอบบน Cloud; กิจกรรมหนึ่งได้หลายช่อง หนึ่งช่องได้กิจกรรมเดียว; ล็อก mapping หลังส่ง ใช้ชุดใหม่เมื่อเปลี่ยน |
| [decisions-033.md](decisions-033.md) | ใช้เฉพาะช่องคะแนนเดิม แปลงตามสัดส่วนคะแนนเต็มแล้วปัด half-up ข้ามผลที่ยังไม่มีตอนส่งเกรด; ปิด OQ-016 |
| [decisions-034.md](decisions-034.md) | สูตรรวมถ่วงน้ำหนักรายกิจกรรมรวม 100%; แก้น้ำหนักใช้รอบใหม่; ครูปรับเฉพาะเวลาสอบ/ช่วงเปิด–ปิด; ปิด OQ-014 |
| [decisions-035.md](decisions-035.md) | แอดมินโรงเรียนตรวจกลุ่มแอดมิน/ผู้บริหารฝั่ง server และคง super admin เดิม; ปิดคำถามแหล่ง is_admin ส่ง arch sync |
| [decisions-036.md](decisions-036.md) | GAP-07: คง workflow PrepareUpdate/InstallPreparedUpdate — spec ร่าง AC-030-04..08 (รอผู้ใช้ตรวจรับ) / inspect เพิ่ม coverage / gate เดิม |
| [decisions-037.md](decisions-037.md) | ตรวจรับ AC-030-04..08 ทั้ง 5 · UX Q5 ถามทุกครั้ง · UX Q9 ป้ายจำลองตลอด session (ยืนยัน BR-013-03) · performance 300MB/5s/30FPS เป็น acceptance ของ G-DELIVERY |
| [decisions-038.md](decisions-038.md) | Sign-off UX ครบทั้ง int-001/int-002 (Q2/Q3/Q6–Q8/Q10/Q11/Q13) · spec Q1 ผู้อนุมัติเนื้อหา=ผู้ใช้ · Q2 ยืนยัน rubric ดาว · Q4 ยังไม่อนุญาตทดสอบหุ่นจริง · Q5 cert ยังไม่ระบุ |
| [decisions-039.md](decisions-039.md) | Sign-off UX-002 ครบ (Q14–Q21); UX-004 อนุมัติบางส่วน (Q22–Q25) |
| [decisions-040.md](decisions-040.md) | Sign-off UX-004 เพิ่ม Q26–Q29 รวมกับ decisions-039 เป็นอนุมัติครบ; G-UX-LEARN มีหลักฐาน sign-off ครบ |
| [decisions-041.md](decisions-041.md) | Sign-off UX-006 ครบ (Q30–Q38); G-UX กลุ่ม mapping/export มีหลักฐานตามเงื่อนไข gate เดิม |

| [decisions-042.md](decisions-042.md) | ผู้ใช้เลือก A: หมดเวลาตรวจคำตอบที่ server บันทึกทัน นับครั้ง/สิทธิ์ซ่อมเดิม ไม่รับย้อนหลัง |
| [decisions-043.md](decisions-043.md) | อนุมัติ UX-005 Q39–Q42 และ UX-007 Q43–Q46 รวม delta042; UX signed 7/7; ยืนยัน T0–T2 Codex / T3–T5 AGY |
| [decisions-044.md](decisions-044.md) | คงเฉพาะ PK32; ถอน UNIQUE24/FK40/CHECK80 จากร่าง SQL คงคอลัมน์/ชนิด/NOT NULL/default/identity เดิม |
| [decisions-045.md](decisions-045.md) | ผู้ใช้ยืนยันรัน schoolbot_db.sql สร้างตารางแล้ว; ยังไม่มีผลตรวจ catalog/API integration และไม่ปิด runtime gates |
| [decisions-046.md](decisions-046.md) | อนุญาตพัฒนา Gateway บน branch ที่เตรียมไว้; อนุมัติ create-license replay 15 นาที; custody กุญแจเซ็นยังรอคำอธิบาย/คำตอบ |
| [decisions-047.md](decisions-047.md) | ผู้ใช้พักเรื่อง signer/custody ของ License ไว้ก่อน; คำอนุญาต dev Gateway และ replay 15 นาทีคงเดิม |
| [decisions-048.md](decisions-048.md) | ปิดผลสามงานที่กำลังรันแล้วหยุดก่อน ไม่เปิดงานชุดถัดไป; เก็บข้อค้างไว้รอบหน้า |
| [decisions-049.md](decisions-049.md) | อนุมัติแก้รอบ 3 แบบแคบหนึ่งรอบ: B gRPC raw wire boundary และ Gateway log/channel boundary พร้อม check/JPO ซ้ำด้วย oracle เดิม; ไม่ใช่ risk acceptance |
| [decisions-050.md](decisions-050.md) | เส้น HTTP ของ SchoolBot ใน Gateway ใช้ controller ตาม convention เดิมของ Gateway แทน minimal endpoint/middleware; transport G→B gRPC/BFF คงเดิม; ต้องผ่าน arch ก่อน sys |
| [decisions-051.md](decisions-051.md) | อนุมัติทาง A: commit Project+Revision เป็นหน่วยเดียว (`CommitProjectAsync`) และเปิด rework 3 ของ BE-002 F2; ไม่มีข้อมูล file store เดิมต้องนำเข้า |

