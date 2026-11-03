---
project: school-bot
platform: desktop
os: [windows, mac]
target: school-bot
---
# SchoolBot — ระบบเรียนเขียนโปรแกรมและควบคุมหุ่น

> แก้ล่าสุด 2026-11-03 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (สถานะหลังรอบ 2026-11-03 เย็น)

SchoolBot เป็นระบบสำหรับนักเรียนและครูในโรงเรียน มีบทเรียนและพื้นที่สร้างงาน Block (โปรแกรมบล็อก), Arm (แขนกล) และ Code (เขียนโปรแกรม) พร้อมโครงงาน การประเมินผล และการส่งคะแนนกลับ SchoolBright

## สถานะปัจจุบัน

แผนมีข้อกำหนด 44 รายการ เกณฑ์ตรวจรับ 187 ข้อ และทดสอบ 82 กรณี มี 110 งานใน 8 ระยะ และเงื่อนไขก่อนดำเนินงาน 17 จุด: ตรวจผ่านแล้ว 39 งาน (8 งานในจำนวนนี้ตรวจระดับทางหลักระหว่างพัฒนา ยังต้องตรวจเต็มก่อนส่งมอบ) และรอทำ 71 งาน ดู [แผนและสถานะงาน](build/plan/index.md)

- การบันทึกโครงงานและฉบับของโครงงานเป็นหน่วยเดียวตรวจผ่านแล้ว ตาม [มติ 051 (บันทึก Project และ Revision พร้อมกัน)](shared/decisions/decisions-051.md)
- การออกจากระบบผ่าน API Gateway และบริการ SchoolBot ผ่านการตรวจการทำงานและความปลอดภัยในเครื่องแล้ว การยืนยันตัวตนและตรรกะคำนวณคะแนนผ่านการทดสอบ แต่ Login เต็มรูปแบบ การเชื่อมฐานข้อมูลจริงกับ API และการเปิดบริการบน production ยังไม่พร้อม
- ผู้ใช้รัน SQL สร้างฐานข้อมูลแล้ว (PostgreSQL 15.19 ฐานทดสอบ) และผลตรวจ catalog 2026-11-03 ตรงกับแบบครบ 32 ตาราง 450 ฟิลด์ ยังขาดบันทึกการรันครั้งแรก การทดสอบ rollback/การเขียนพร้อมกัน และการเชื่อม API กับฐานจริง
- License ฝั่ง admin, การ activate เครื่อง และการย้ายเครื่อง (BE-003/004/005), Login/logout ฝั่งบริการ (BE-006), การแลก session เว็บ (BE-039), CourseRun รายห้อง (BE-029), คลังข้อสอบ (BE-030) และการนำเข้าแผนรายวิชา (BE-028) ผ่านการตรวจระดับทางหลัก (normal) บนที่เก็บข้อมูลจำลองแล้ว ยังต้องตรวจเต็ม (race/replay/ความปลอดภัย) ก่อนส่งมอบ · ข้อค้างที่ย้ายไปรอตรวจเต็มรวม License บันทึก audit/ผลไม่อยู่ในหน่วยเดียวกับข้อมูล · สิทธิ์ใช้งานฝั่ง Desktop (BE-007) มีโค้ดแล้วแต่ทดสอบทางหลักยังไม่ผ่าน
- การนำเข้าแผนรายวิชาใช้คอลัมน์ใหม่ `SchoolBotLesson.ImportSource` ตาม [migration-002](build/db/migration-002-lesson-import-source.md) (คอลัมน์เดียว ไม่มี index/constraint ตามคำผู้ใช้) — ผู้ใช้ยังต้องรัน SQL เอง
- เลขอ้างอิงการอนุมัติและหลักฐาน release ยาวไม่เกิน 1,000 ตัวอักษร ตาม [มติ 054](shared/decisions/decisions-054.md)
- แอปเรียก API Gateway ผ่าน HTTP แล้ว Gateway เรียก SchoolBot ผ่าน gRPC (Remote Procedure Call) เว็บผ่าน BFF (Backend for Frontend) บน origin เดียวกัน Gateway ใช้ controller ตาม [มติ 050 (ใช้รูปแบบ controller เดิมของ Gateway)](shared/decisions/decisions-050.md) ผลในเครื่องยังไม่ยืนยันการทำงานบนระบบจริง
- ผู้ใช้อนุญาตพัฒนา Gateway และกู้ License Key เดิมจากคำขอสร้างซ้ำได้ภายใน 15 นาทีตาม [มติ 046 (พัฒนา Gateway และกำหนดช่วงกู้ Key)](shared/decisions/decisions-046.md) ส่วนที่เก็บกุญแจเซ็นและผู้ดูแลยังพักไว้ตาม [มติ 047 (พักเรื่องกุญแจเซ็น License)](shared/decisions/decisions-047.md)
- UX/UI (ประสบการณ์ผู้ใช้และหน้าจอ) อนุมัติครบ 7 ชุด รวมหน้าจอข้อสอบเมื่อหมดเวลาตาม [มติ 043 (อนุมัติหน้าจอหลักสูตร ข้อสอบ และหน้าครู)](shared/decisions/decisions-043.md) สัญญาในเครื่องพร้อมแล้ว แต่หลักฐานอนุมัติ ที่มาข้อมูล และหลักฐานเจ้าของระบบยังค้าง

## สิ่งที่รอผู้รับผิดชอบ

| ผู้รับผิดชอบ | สิ่งที่ยังรอ |
|---|---|
| ผู้ใช้และเจ้าของฐานข้อมูล | รอผู้ใช้ส่งคำถามหลักฐานให้เจ้าของฐานข้อมูล ยังไม่มีหลักฐานว่าส่งหรือได้รับคำตอบแล้ว |
| เจ้าของ Gateway และโครงสร้างพื้นฐาน | หลักฐานการเชื่อมบริการจริง เครือข่ายและการยืนยันตัวตนครบเส้นทาง |
| เจ้าของฐานข้อมูล Master และระบบเดิม | หลักฐานสิทธิ์และการยืนยันตัวตน รวมแหล่งรายชื่อนักเรียนที่ครูดูแล |
| ผู้ใช้และทีมอุปกรณ์ | รุ่นหุ่น บอร์ด firmware การปรับเทียบ และเกณฑ์หยุดเมื่อถอดสายหรือเกิดเหตุฉุกเฉิน; ยังไม่อนุญาตทดสอบหุ่นจริง |
| ผู้ใช้และผู้รับผิดชอบส่งมอบ | ผู้ถือใบรับรองลงนามแอปและช่องทางแจกจ่าย; เรื่องกุญแจเซ็น License พักไว้ก่อนใช้กุญแจจริง |
| ผู้รับผิดชอบคุ้มครองข้อมูลส่วนบุคคล | ข้อพิจารณาด้านข้อมูลส่วนบุคคลที่ระบุในแผน |

ดูรายละเอียดที่ [รายการรอผู้รับผิดชอบในแผน](build/plan/index.md#waiting-on-human)

## ความเสี่ยงที่ยังเปิด

- ความปลอดภัยยังมีระดับ Important 6 ข้อ, Medium 6 ข้อ และ Minor 3 ข้อ; ผลตรวจ Gateway ครั้งที่สองยังเปิด 16 ข้อ ผลปิดประเด็นของ logout ใช้ได้เฉพาะในเครื่อง
- ฐานข้อมูลยังไม่ยืนยันความตรงกับแบบ การทำงานแบบ transaction และการเชื่อม API
- ชุดทดสอบมี 82 กรณีครอบคลุมเกณฑ์ตรวจรับ 187 ข้อ แต่ข้อมูลเชื่อมโยงเกณฑ์กับกรณีทดสอบยังเป็นชุด 180 ข้อ/77 กรณี และผล actual ทุกกรณียังเป็น NOT_RUN
- การอ่านโค้ดส่วนเขียนคะแนนเดิมยังติดข้อจำกัด เพราะแหล่งโค้ดอยู่นอก workspace

## เอกสารของโมดูล

| เอกสาร | เนื้อหา |
|---|---|
| [ข้อกำหนด](shared/requirements-index.md) | ข้อกำหนดรายเรื่อง กฎธุรกิจ และเกณฑ์ตรวจรับ |
| [ขอบเขต](shared/scope.md) | ผู้ใช้ เป้าหมาย ข้อจำกัด และสิ่งที่ไม่รองรับ |
| [มติที่ใช้อยู่](shared/decisions/INDEX.md) | ข้อตกลงจากผู้ใช้และมติที่ถูกแทน |
| [แบบระบบ](build/design/index.md) | สัญญาบริการ แบบข้อมูล และผลตรวจโค้ดต้นทาง |
| [แผน](build/plan/index.md) | ขอบเขตส่งมอบ งาน สถานะ และสิ่งที่รอผู้รับผิดชอบ |
| [คำถามค้าง](shared/open-questions/index.md) | คำถามธุรกิจ 14 เรื่อง: เปิด 2 เรื่อง (OQ-018, OQ-019) ตอบบางส่วน 3 เรื่อง และปิดแล้ว 9 เรื่อง |
| [แผนทดสอบ](build/test-plan/index.md) | กรณีทดสอบและการเชื่อมกับเกณฑ์ตรวจรับ |
| [หน้าจอและประสบการณ์ใช้งาน](build/legacy-ux/index.md) | แบบหน้าจอและหลักฐานอนุมัติ |
| [หน้าตาและ Design System](shared/brand/README.md) | สี ตัวอักษร ระยะ component ที่ทุกหน้าต้องใช้ · ลิงก์ Design System "School Bot Studio" บน Claude Design |
| [ความปลอดภัย](build/security.md) | ประเด็นความปลอดภัยและความเสี่ยงที่ยังเปิด |
| [งานภายหลัง](build/backlog.md) | รายการงานที่ทำภายหลัง |
| [SQL สร้างตาราง](build/db/schoolbot_db.sql), [SQL ย้อนกลับ](build/db/schoolbot_db_rollback.sql), [ข้อมูลส่วนบุคคล](build/db/pii-inventory-001.md) | โครงสร้างฐานข้อมูล การย้อนกลับ และรายการข้อมูลส่วนบุคคล |

## หลักฐาน

สถานะอ้างหน้าแรกเดิมและ [แผนปัจจุบัน](build/plan/index.md) สัญญาอ่านที่ [Gateway integration Rev5](build/design/gateway-integration-001.md), [สัญญา gRPC Rev2](build/design/gateway-grpc-contract-001.md) และ [controller entry Rev2](build/design/gateway-controller-entry-001.md)

## Modules

<!-- baan:modules:start -->
<!-- ตารางนี้สร้างจากหัวไฟล์ INDEX.md ของแต่ละ module ด้วย `baan --index` — แก้ที่หัวไฟล์ของ module ไม่ใช่ที่นี่ -->

| Module | สรุป | สถานะ | อัปเดต | พึ่งพา | ไฟล์ |
|---|---|---|---|---|---|
| app-shell | App Shell (สารบัญ module) | draft | 2026-11-02 | - | [modules/app-shell](modules/app-shell/INDEX.md) |
| arm-lab | Arm Lab (สารบัญ module) | draft | 2026-11-02 | app-shell, my-work | [modules/arm-lab](modules/arm-lab/INDEX.md) |
| block-lab | Block Lab (สารบัญ module) | draft | 2026-11-02 | app-shell, my-work | [modules/block-lab](modules/block-lab/INDEX.md) |
| code-lab | Code Lab | draft | 2026-11-02 | app-shell, my-work | [modules/code-lab](modules/code-lab/INDEX.md) |
| my-work | my-work (สารบัญ module) | draft | 2026-11-02 | app-shell | [modules/my-work](modules/my-work/INDEX.md) |
| quiz | Quiz (บทเรียน) (สารบัญ module) | draft | 2026-11-02 | app-shell | [modules/quiz](modules/quiz/INDEX.md) |

**module ที่อยู่ project อื่นแต่เกี่ยวกับ project นี้**

| Module | สรุป | สถานะ | อัปเดต | เกี่ยวข้อง | อยู่ที่ |
|---|---|---|---|---|---|
| school-bot | เว็บครู School Bot (สารบัญ module) | draft | 2026-11-02 | ขอโดย school-bot · พึ่ง school-bot/quiz | [schoolbright-web/modules/school-bot](../schoolbright-web/modules/school-bot/INDEX.md) |
<!-- baan:modules:end -->
