# SchoolBot — ขอบเขตแผนส่งมอบ

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## ขอบเขตระบบ

ขอบเขตผลิตภัณฑ์ใช้ [ขอบเขตระบบ SchoolBot](../../shared/scope.md) เป็นแหล่งเดียว ทั้งสามโหมด Block/Arm/Code, Labs/Lessons, Guest, License, หลักสูตร/ข้อสอบ, คะแนน, ฐานข้อมูล และแพลตฟอร์ม โดยคงระบบเต็มตาม [มติ 002 (ระบบใช้งานจริง)](../../shared/decisions/decisions-002.md), [มติ 003 (สามโหมด)](../../shared/decisions/decisions-003.md), [มติ 009 (หลายโครงงานและผู้ประเมิน)](../../shared/decisions/decisions-009.md) และ [มติ 013 (ฐาน logical DBML)](../../shared/decisions/decisions-013.md) ไม่ลดเป็น PoC/MVP หรือถือข้อจำกัด source เดิมเป็นเพดานผลิตภัณฑ์

รายละเอียดต่อไปนี้คงเป็นเงื่อนไขของแผนที่ต้องใช้ร่วมกับขอบเขตระบบ:

- หลายโครงงานทั้ง Guest local และ Login DB/Cloud ต้องคง ownership, durability และ failure semantics โครงงานหนึ่งไม่แทนอีกงานโดยอัตโนมัติ
- Windows/macOS ต้องมี platform/transport/hardware evidence และการตรวจรับ signed installer ตามเกณฑ์มนุษย์ ไม่ส่ง Mac simulator แทน native ตาม [มติ 008 (ควบคุมหุ่นจริงสองแพลตฟอร์ม)](../../shared/decisions/decisions-008.md)
- Signed offline lease ไม่เกินสามวันนับจาก online check สำเร็จล่าสุด การเปิดแอปซ้ำไม่เริ่มนับใหม่
- API อยู่ `target/school-bot/web`; ฐาน SchoolBot แยกจากสี่ฐานเดิม มี 32 ตาราง/450 ฟิลด์ ใช้ single foreign key (FK) และ application tenant/recheck ฟิลด์ audit เป็น int ที่ยอมรับ null และ UpdateDate ตาม [มติ 028 (ชนิด CreateBy/UpdateBy)](../../shared/decisions/decisions-028.md) และ [มติ 030 (ใช้ UpdateDate แทน Version)](../../shared/decisions/decisions-030.md) ใช้บัญชี DB เดิม ไม่ GRANT School/PGGradeDB ตาม [มติ 029 (ไม่ GRANT สองฐานเดิม)](../../shared/decisions/decisions-029.md)
- หลักสูตรใช้ four-eyes approval, Sheet draft และข้อสอบ snapshot ตามมติหลักสูตร การส่งคะแนน ที่อยู่หน้าจอ Sheet, Level และ auth ใน [ทะเบียนมติ](../../shared/decisions/INDEX.md) หมายเลข 020..025/034 เงื่อนไข runtime ของการส่งคะแนนยังไม่ผ่าน
- Admin Next.js อยู่ `school-bot/web`; เว็บครู/ผู้ดูแลโรงเรียนอยู่ `web-system/school-bot` ตาม [มติ 022 (ที่อยู่หน้าจอ)](../../shared/decisions/decisions-022.md), [มติ 023 (writer/Sheet/mapping)](../../shared/decisions/decisions-023.md) และ [มติ 031 (repo school-bot)](../../shared/decisions/decisions-031.md) พาธย่อยและ environment ต้องมี artifact ตรวจ
- ตารางใหม่ใช้ prefix SchoolBot มี IsDelete/CreateBy/CreateDate/UpdateBy/UpdateDate/SchoolId ครบ Primary Key (PK) และ FK ที่อ้าง PK เป็น int4 ส่วน UUID สำหรับ logical/local/request ที่ไม่ใช่ DB PK ยังใช้ได้ตาม [มติ 012 (ชนิดรหัสและ DBML)](../../shared/decisions/decisions-012.md)
- คงภาษา th/en/zh แบบ offline, shell/window controls/close guards, sample/native boundary, trusted engine routing และ protocol/lifecycle ตาม REQ ที่เกี่ยวข้อง
- รวม persistent License/release APIs, update metadata check และการแจกจ่าย Windows/macOS ตาม REQ-027..035; API server deploy แยกจาก desktop installer
- เส้นทาง API ใช้ client ผ่าน HTTP API Gateway (`sb-api-gateway`) ไป SchoolBot gRPC service และผ่าน Backend for Frontend (BFF) ตาม consumer ไม่มี direct public service หรือ HTTP relay ส่วน HTTP Login เดิมของ Gateway แยกจาก service transport ตาม [Gateway integration](../design/gateway-integration-001.md) Rev3 ที่แผนเดิมอ้าง การชี้แจงนี้ไม่เพิ่ม feature/task หรืออนุญาต implementation

## ขอบเขตที่ยังต้องทบทวน

สถานะ REQ และ DES ใช้ index ของหมวดนั้น การยืนยัน DBML ไม่ใช่การยืนยัน physical DDL, การรัน SQL, credential compatibility, UX sign-off, hardware acceptance หรือ release approval

[DES-007 (Release และ trusted update)](../design/des-007.md) เสนอ PrepareUpdate/InstallPreparedUpdate ขณะที่ [BE-019](index-delivery.md) (ทำการตรวจอัปเดตและ Prepare/Install) เดิมระบุ check-only ให้ [SA-001](index-foundation.md) (ทบทวนสัญญาระบบและการอัปเดต) trace กับ [REQ-030 (ตรวจข้อมูลอัปเดตจาก Desktop)](../../modules/app-shell/shared/requirements/req-030.md) และมติจริง เสนอ disposition ก่อนตรึง implementation contract ผ่าน G-RELEASE-DB (เงื่อนไขฐานข้อมูลเผยแพร่) แผนไม่ตัด requirement หรืออนุมัติ feature เพิ่มแทนคน งานที่ไม่พึ่งคำตอบทำต่อได้

TeacherGrant เป็น conditional fallback ต้องมีหลักฐานช่องว่าง scope เดิมและ schema approval ก่อนใช้ การรับ logical model ไม่อนุมัติ fallback อัตโนมัติ เช่นเดียวกับ global SchoolId/null semantics, physical placement และ retention ที่ยังต้อง review ตาม [เงื่อนไขอนุมัติ](gates-001.md)

## การควบคุมขอบเขต

Release scope ถูกตรึงไว้ ย้ายเข้า/ออกได้เฉพาะคำสั่งผู้ใช้ ข้อค้นพบที่ไม่บล็อก AC เข้า [backlog](../backlog.md) ไม่เปิดงานเองและไม่เปลี่ยนเลข ID ถ้า inventory/matrix ทำให้งานเกิน 1–2 วัน ผู้รับผิดชอบแผนต้องเสนอแยกงานก่อนจ่าย โดยรักษาขอบเขตและ mapping ไม่ลด requirement เพื่อให้พอดี effort

110 งานประกอบด้วย 74 งานเดิมและ 36 งานส่วนต่อ Effort ไม่รวมเวลารอคน อุปกรณ์ หรือ credentials ความสำเร็จต้องมี receipts และผู้ตรวจรับจริง ไม่ใช้ verified แทน released

Owner เดิมรวม Handoff เป็น alias: sa = arch, ba = spec, be = sys, fe = front, dba = vault, tp = inspect, qa = check, sec = jpo, ux = int, pm = gm ใช้ role_aliases ใน JSON โดยไม่เปลี่ยนเลขงาน

## ยังไม่ยืนยัน

- ประมาณการ 207 person-days เป็นสมมติฐาน ไม่ใช่กำหนดส่ง ต้องให้ผู้ใช้ยืนยันหากจะใช้เป็นกำหนดส่ง

## หลักฐาน

- เดิมอ้าง spec-review-001 และมติ 014/015/016/019..034 ที่ยืนยันแล้ว ดู [ทะเบียนมติ](../../shared/decisions/INDEX.md) และ [ทะเบียนข้อกำหนด](../../shared/requirements-index.md)
- source-review-001/002 เป็นหลักฐาน as-built ภายใต้ขอบเขตรายงานเดิม งานแผนอ่าน knowledge และตรวจโครงสร้าง/AC mapping ไม่ audit source, build/tests/SQL/UI/hardware หรือ rebuild EXE/installer จึงไม่รับรอง SchoolBot QA หรือ implementation เพิ่ม
- คิวที่ scope เดิมอ้าง: plan/queue-003.md (memory); คิวปัจจุบันดู [แผนหลัก](index.md)

- ฐานอ้างอิงเดิมของเอกสาร: 44 REQ/180 AC ปัจจุบันดู [ขอบเขตระบบ](../../shared/scope.md) และ [แผนหลัก](index.md) โดยไม่แก้เกณฑ์ตรวจรับในงานนี้
