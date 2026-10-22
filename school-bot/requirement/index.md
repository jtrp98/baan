# Requirements — school-bot

เอกสารกลั่นจาก repository `C:/src/schoolbright/target/school-bot-v2` ตามคำสั่งผู้ใช้ เพื่อทบทวนความต้องการ ไม่ใช่การอนุมัติ release scope หรือหลักฐานว่าระบบผ่าน QA

ผู้ใช้ยืนยันระบบเต็มแล้ว ฐานเดิมถูกปรับและเติมเป็น 44 REQ รวม Guest/Cloud หลักสูตร Level ข้อสอบ และส่งคะแนน (REQ-043..052 ตาม decisions-020..022) ประเมินและติดตามผลตาม [มติล่าสุด](decisions-009.md); License/DB และการย้ายสิทธิ์ตาม decisions-004..007

## วิธีอ่าน

- ข้อเท็จจริงอ้าง `path:line` จากไฟล์ที่ BA ตรวจอ่าน เป็นหลักฐาน implementation หรือเอกสารประกอบ ไม่ใช่การยืนยันธุรกิจโดยมนุษย์
- มติธุรกิจอ้างผู้ยืนยัน/วันที่ในแต่ละ REQ; ประโยชน์หรือกฎที่ไม่มีมติรองรับเป็น `(สมมติฐาน — ยังไม่ยืนยัน)` ไม่ยกข้อจำกัดโค้ดเดิมเหนือมติ
- AC เป็นเกณฑ์เสนอสำหรับตรวจระบบที่รันอยู่ ยังไม่ได้ทดสอบในงานนี้
- Native หมายถึง Desktop ที่ใช้บริการในเครื่อง; sample/preview/mock เป็นการจำลอง
- เลข REQ-001..008 เป็นเลขใน Git index ของเอกสารชุดเดิมที่ MYCELIUM ตรวจพบก่อนเริ่มชุดใหม่ จึงสงวนเลขและเริ่มที่ REQ-009
- สถานะ REQ เก็บในตารางนี้เท่านั้น

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
| REQ-030 | ตรวจข้อมูลอัปเดตจาก Desktop | DRAFT | 3 | [req-030.md](req-030.md) |
| REQ-031 | ติดตั้งและดูแลแอปบน Windows | DRAFT | 5 | [req-031.md](req-031.md) |
| REQ-032 | ติดตั้งแอปบน macOS | DRAFT | 3 | [req-032.md](req-032.md) |
| REQ-033 | ชื่อและฟิลด์ข้อมูล SchoolBot | DRAFT | 5 | [req-033.md](req-033.md) |
| REQ-034 | ตรวจ License ออนไลน์และสิทธิ์ออฟไลน์ 3 วัน | DRAFT | 6 | [req-034.md](req-034.md) |
| REQ-035 | ผู้ดูแลปลดเครื่องและย้าย Key เดิม | DRAFT | 5 | [req-035.md](req-035.md) |
| REQ-036 | Guest Local และ Login Cloud | DRAFT | 4 | [req-036.md](req-036.md) |
| REQ-037 | หลักสูตรและภารกิจสามโหมด | DRAFT | 6 | [req-037.md](req-037.md) |
| REQ-038 | ประเมิน Code/Block อัตโนมัติและ Arm โดยครู | DRAFT | 5 | [req-038.md](req-038.md) |
| REQ-039 | ความคืบหน้าและการติดตามโดยครู | DRAFT | 5 | [req-039.md](req-039.md) |
| REQ-040 | พื้นที่ร่วมและถังขยะ Guest | DRAFT | 6 | [req-040.md](req-040.md) |
| REQ-041 | เลือกนำเข้าโครงงาน Guest | DRAFT | 5 | [req-041.md](req-041.md) |
| REQ-042 | ประวัติเรียน Guest และตรวจผลใหม่ | DRAFT | 6 | [req-042.md](req-042.md) |
| REQ-043 | หลักสูตรกลางแบบ Level และ Activity | DRAFT | 4 | [req-043.md](req-043.md) |
| REQ-044 | รหัสบทเรียนและ revision หลักสูตร | DRAFT | 5 | [req-044.md](req-044.md) |
| REQ-045 | นำเข้า Course Plan Sheet | DRAFT | 4 | [req-045.md](req-045.md) |
| REQ-046 | Quiz/Test และคลังข้อสอบแบบ revision | DRAFT | 4 | [req-046.md](req-046.md) |
| REQ-047 | การนับคะแนน Quiz รายหลักสูตร | DRAFT | 4 | [req-047.md](req-047.md) |
| REQ-048 | เสนอและยืนยันเลื่อน Level ทั้งห้อง | DRAFT | 4 | [req-048.md](req-048.md) |
| REQ-049 | Mapping หลักสูตรกับช่องคะแนน SchoolBright | DRAFT | 4 | [req-049.md](req-049.md) |
| REQ-050 | Preview และยืนยันส่งคะแนนกิจกรรม | DRAFT | 4 | [req-050.md](req-050.md) |
| REQ-051 | คะแนนชนและการคุ้มครองคะแนนครู | DRAFT | 4 | [req-051.md](req-051.md) |
| REQ-052 | สิทธิ์ การส่งซ้ำ และ audit คะแนน | DRAFT | 5 | [req-052.md](req-052.md) |

รวม 44 REQ / 174 AC

## หมวดตามผลิตภัณฑ์

- Block Lab: REQ-026
- Arm Lab: REQ-014..024 และข้อมูลโครงงานใน REQ-011/017
- Code Lab: REQ-025
- บทเรียนเลือก Block/Arm/Code แยกจาก Lab; ณ source ที่ตรวจ Arm เปิด LearnMap ส่วน Block/Code แสดงว่ายังไม่มีบทเรียน ดู [ผลตรวจโค้ด](../source-review-001.md) และ [มติ 3 โหมด](decisions-003.md)
- REQ อื่นเป็นระบบกลาง; การจัดหมวดนี้ไม่เพิ่มโหมดหรือเปลี่ยน IDs

## ประเด็นรอยืนยัน

มติ Guest/ครู/ผู้อนุมัติ/OS ตอบแล้วใน decisions-014/015/016/019; [OQ](../open-questions/index.md) เหลือ artifact หุ่น เนื้อหา และส่งมอบ ส่วน contract ส่ง SA ไม่ถามนโยบายเดิมซ้ำ

## Change Log

- 2026-10-22 — เพิ่ม REQ-043..052 จำนวน 10 REQ/42 AC (BA) และ amend REQ-037/038 คง IDs/จำนวน AC เดิม; รวม 44 REQ/174 AC; MYCELIUM เพิ่ม BR ที่อยู่หน้าจอตาม decisions-022 ไม่เปลี่ยนจำนวน AC; ไม่ถือเป็นการอนุมัติ release
- 2026-10-22 — amend 9 REQ เพิ่ม 040..042 รวม 34/132; PM/TP ต้อง reconcile plan/JSON 74 งานเดิม ไม่เปลี่ยน task verified

- 2026-10-21 — สร้างจาก source repo ตามคำสั่งผู้ใช้ให้กลั่น requirement; สงวน IDs เดิมที่ MYCELIUM ตรวจพบใน Git index
- 2026-10-21 — เชื่อมมติผู้ใช้ OQ-006..009; ยังไม่ได้เปลี่ยนสถานะยอมรับ REQ หรืออ้างว่า Login/Cloud และระบบเรียนรู้จริง implement แล้ว
- 2026-10-21 — บันทึกเป้าหมายระบบเต็มใช้งานจริง; ไม่ใช้ข้อจำกัด PoC เป็นเพดานของ requirement
- 2026-10-21 — จัดหมวด Block/Arm/Code ตามคำชี้แจงผู้ใช้และผลตรวจโค้ด SA; Code Lab แยกจากหน้าบทเรียน
- 2026-10-21 — บังคับ License ตามมติผู้ใช้ใน REQ-009/027/028 และเพิ่ม REQ-033 สำหรับ `SchoolBotLicense`, PK และฟิลด์มาตรฐาน; รวม 25 REQ / 82 AC
- 2026-10-21 — เพิ่ม REQ-034 ตามคำตอบออนไลน์ครั้งแรกและสิทธิ์ออฟไลน์ 3 วัน; รวม 26 REQ / 88 AC
- 2026-10-21 — ยืนยัน 1 เครื่องต่อ Key ใน decisions-006.md; ปรับ REQ-027/028 คง 26 REQ / 88 AC
- 2026-10-21 — เพิ่ม REQ-035 ตามมติผู้ดูแลย้ายทันทีและยอมให้สิทธิ์ออฟไลน์เดิมคงเหลือ; รวม 27 REQ / 93 AC
- 2026-10-21 — เปลี่ยน BR/AC ฝั่ง macOS ใน REQ-032 ให้รองรับหุ่นจริงตามคำตอบผู้ใช้; จำนวน REQ/AC คงเดิม
- 2026-10-21 — ผู้ใช้ตอบหลายโครงงานและวิธีประเมินแล้ว ปรับ REQ-011 เพิ่ม REQ-036..039 จากมติจริง รวม 31 REQ / 109 AC เพื่อส่ง SA
