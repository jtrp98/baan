# ความเสี่ยงและประตูตัดสิน

> Rev 5 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

decisions-012 ยืนยัน PK SchoolBot ใหม่เป็น int4 และ FK ชนิดเดียวกันแล้ว ไม่ถามซ้ำ; ไม่ใช่อนุมัติ schema/placement/credential compatibility ที่เหลือ

## เรื่องธุรกิจที่ยังรอหลักฐาน

| Task / Reference | สิ่งที่ต้องยืนยัน / เหตุผล |
|---|---|
| Identity — DES-004, decisions-010/011 | SchoolBot gRPC service เป็นเจ้าของ session/directory/authorization; reuse Login HTTP เดิมของ HTTP API Gateway (`sb-api-gateway`). HTTP API Gateway ไปยัง SchoolBot gRPC service ใช้ gRPC; RPC/trusted tenant/opaque-session mapping และ account↔profile/active/role ยังต้องพิสูจน์ ไม่เลือก transport/provider ใหม่หรือสร้าง verifier ซ้ำ |
| Guest — DES-003/005 | นโยบายตอบแล้ว; ตาม032 ห้ามนำเข้าผลครู Cloud แต่เก็บโครงงานได้ ตรวจ implementation ต่อ |
| Learning — DES-005, OQ-009 | ทีมเตรียมเนื้อหา/numeric rubric ให้ผู้ใช้ตรวจตาม015/016; สูตรรวมตอบแล้วตาม034 ไม่กำหนดเกณฑ์ภารกิจแทน |
| Hardware — DES-006, OQ-008 | รุ่น board/robot, calibration, stop limits และผู้รับรองคือใคร? ไม่ใช้ checkbox หรือ write success แทนผลจริง |
| Acceptance — OQ-006/011 | ผู้ใช้ตรวจรับตาม016; OS ตามมติ 019; ทีมเตรียม signing/delivery/performance evidence ไม่ถามนโยบายซ้ำ |

## การอนุมัติที่ implementation ยังต้องพึ่งพา

| Task / Reference | คำตัดสินที่รอมนุษย์ |
|---|---|
| Schema — data-model / REQ-033 | baseline ตาม026..030; รอบนี้ใช้ 32 ตารางเดิม ไม่มี delta ใหม่ การรัน SQL ยังต้องมนุษย์ |
| External integration — DES-004/012 | placement เป็น SchoolBot DB ตาม027; ยังต้องพิสูจน์ credentials/account-profile/roster และ H5 ไม่ถามทาง A/placement ซ้ำ |
| Breaking behavior — DES-001/002 | อนุมัติ host gating, API v2 และปิด v1 mutation/bridge ที่ข้าม enforcement ใน production หรือไม่? |
| Storage migration — DES-003 | อนุมัติ document v2, revision semantics และ copy-only migration จากหนึ่ง slot โดยเก็บต้นฉบับหรือไม่? |
| Credential trust — DES-002 | อนุมัติ OS credential/key model และข้อจำกัด privileged clone/clock rollback หรือกำหนด hardware-backed requirement เพิ่ม? |
| Release trust — DES-007 | อนุมัติ signing roots, publisher identities, artifact origins และ explicit install workflow ก่อนพัฒนา integration หรือไม่? |
| UX — DES-001/003/005 | flow License, conflict, account switch, teacher review ต้องมี human UX sign-off ก่อน FE ที่พึ่ง flow; ชุดนี้ไม่ใช่ visual sign-off |

การอนุญาตให้ออกแบบไม่เท่ากับอนุมัติ schema/breaking change ไม่มีรายการใดถูกเซ็นแทนมนุษย์

## ความเสี่ยงทางเทคนิคและมาตรการตามแบบ

ทุกข้อในตารางยังต้องพิสูจน์ด้วย implementation และผลทดสอบ มาตรการที่ระบุเป็นข้อเสนอในสัญญา ยังไม่ใช่หลักฐานว่าลดความเสี่ยงสำเร็จ

| ความเสี่ยง | ข้อเสนอใช้ได้ / ทางที่ปัดตก |
|---|---|
| Activate/transfer race | transaction+unique+epoch+idempotency / ปัดตก process lock อย่างเดียว |
| เครื่องเก่า reacquire หลัง unbind | detached fingerprint ถูกกันจน admin อนุญาต / ปัดตก validate ที่ activate แอบแฝง |
| Offline clock tampering | signed expiry+protected high-water mark+online recovery / ไม่อ้างกัน disk snapshot ได้สมบูรณ์ |
| Cloud overwrites | immutable revision+If-Match / ปัดตก last-write-wins |
| False grading | server reparse snapshot+versioned criteria / ปัดตก client trace/ดาวเป็น authority |
| Partial hardware delivery | unknown outcome, no replay, drain/stop / ปัดตก cancel=physical stop |
| Mac compatibility | Darwin adapter+Intel/ARM proof / ปัดตก simulator-only delivery |
| Update supply chain | signed manifest+OS publisher+TOCTOU checks / ปัดตก checksum-only execution |

## ข้อแตกต่างจากเอกสาร/ข้อจำกัดหลักฐาน

source ที่ระบุท้ายไฟล์ ยังใช้คำ Robot Simulator แต่ native path มีจริง; `:84` ระบุไม่ enforce license ซึ่งขัดเป้าหมายล่าสุด ไม่ใช่ข้อยกเว้น

source ที่ระบุท้ายไฟล์ ยังเปิด device_limit 1–1000; source ยืนยันที่ source ที่ระบุท้ายไฟล์ ต้องเปลี่ยนเป็นหนึ่งเครื่อง `docs/INSTALLERS.md` ปัจจุบันมี setup EXE และเนื้อหาเพิ่ม เลขบรรทัดเดิมใน REQ บางแห่งจึงไม่ตรง ใช้ source citations ของ Rev1

source ที่ระบุท้ายไฟล์ ไม่ strict unknown-field validation เท่าที่ข้อความ schema อาจทำให้เข้าใจ; ต้องเพิ่มก่อนอ้าง complete contract validation

ไม่อ่านไฟล์นอก allowlist จึงยังไม่รับรอง helpers, third-party implementation, auth integration หรือ installer scripts ไม่มีข้อขัดแย้งใหม่ที่จำเป็นต้องแก้ REQ ทั้งชุด; ประเด็นค้างมี dependency ระบุแล้ว

ผลกระทบ consumer/schema, API/migration และ release signing ยังต้องผ่านการอนุมัติเดิม ไม่ใช่การอนุมัติรหัสผ่าน legacy หรือการเขียนเกรด ทางเลือกที่ปัดตกคือใช้ client int PK พร้อม public UUID ซ้ำทุกตาราง

## ส่งต่อ

หลังมนุษย์ตัดสิน: DBA ตรวจ physical schema/constraints/migration และเป็นผู้เขียน SQL; SA amend contract หากผล review เปลี่ยนแบบ จากนั้นผู้คุมจึงส่งบทบาทถัดไป ไม่เปิด implementation/PM plan ในงานนี้

## เรื่องที่ตอบแล้วและข้อรอที่ยังคงอยู่

OQ-014/016/ทาง A ตอบครบตาม032..034; ใช้ [ผลเรียน](learning-rules-032-034.md)/[คะแนน](grade-rules-032-034.md) คง H5 และ G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB งานเนื้อหา/hardware/ส่งมอบรอทีมเตรียมหลักฐาน ไม่ถามนโยบายเดิม

## หลักฐาน

- `docs/ARCHITECTURE.md:5`
- `docs/API.md:44`
- `SchoolLicense.cs:12`
- `manager.go:207`
