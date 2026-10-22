# ความเสี่ยงและประตูตัดสิน — Rev2

## Business pending

| Task / Reference | สิ่งที่ต้องยืนยัน / เหตุผล |
|---|---|
| Identity — DES-004, decisions-010/011 | ตำแหน่ง API/Login ยุติแล้ว: web; ต้องตรวจ password compatibility, account↔profile, active/role/scope rules เพื่อ implementation ไม่ใช่รอเลือก API/provider |
| Guest — DES-003/005, OQ-007 | ผู้ใช้ร่วม OS account แยก/ล้างข้อมูลอย่างไร? อนุญาต encrypted recovery และ explicit Guest import หรือไม่? ไม่ auto-upload |
| Learning — DES-005, OQ-009 | ใครอนุมัติเนื้อหา/criteria และแต่ละ mission ใช้เกณฑ์ใด? ไม่มีสูตรคะแนน/ดาวที่ agent กำหนดแทน |
| Hardware — DES-006, OQ-008 | รุ่น board/robot, calibration, stop limits และผู้รับรองคือใคร? ไม่ใช้ checkbox หรือ write success แทนผลจริง |
| Acceptance — OQ-006/011 | ผู้ตรวจรับ, OS ขั้นต่ำ, signing owner และ performance measurement ยังต้องระบุ ไม่บล็อกการทบทวนแบบส่วนอื่น |

## Required approval ก่อน implementation ที่พึ่งพา

| Task / Reference | คำตัดสินที่รอมนุษย์ |
|---|---|
| Schema — data-model / REQ-033 | อนุมัติ logical entities/relations/uniqueness/audit และข้อเสนอ SchoolId=null เฉพาะ global release/operations หรือให้ใช้ ownership model อื่น? |
| External schema — DES-004 | SchoolId/legacy IDs เป็น int; ขอทบทวน Session และ placement ตารางใหม่ใน School DB, physical keys/FKs/tenant routing; DBA ทำต่อหลังมนุษย์อนุมัติ |
| Breaking behavior — DES-001/002 | อนุมัติ host gating, API v2 และปิด v1 mutation/bridge ที่ข้าม enforcement ใน production หรือไม่? |
| Storage migration — DES-003 | อนุมัติ document v2, revision semantics และ copy-only migration จากหนึ่ง slot โดยเก็บต้นฉบับหรือไม่? |
| Credential trust — DES-002 | อนุมัติ OS credential/key model และข้อจำกัด privileged clone/clock rollback หรือกำหนด hardware-backed requirement เพิ่ม? |
| Release trust — DES-007 | อนุมัติ signing roots, publisher identities, artifact origins และ explicit install workflow ก่อนพัฒนา integration หรือไม่? |
| UX — DES-001/003/005 | flow License, conflict, account switch, teacher review ต้องมี human UX sign-off ก่อน FE ที่พึ่ง flow; ชุดนี้ไม่ใช่ visual sign-off |

การอนุญาตให้ออกแบบไม่เท่ากับอนุมัติ schema/breaking change ไม่มีรายการใดถูกเซ็นแทนมนุษย์

## Technical proof และทางเลือก

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

`docs/ARCHITECTURE.md:5` ยังใช้คำ Robot Simulator แต่ native path มีจริง; `:84` ระบุไม่ enforce license ซึ่งขัดเป้าหมายล่าสุด ไม่ใช่ข้อยกเว้น

`docs/API.md:44` ยังเปิด device_limit 1–1000; source ยืนยันที่ `SchoolLicense.cs:12` ต้องเปลี่ยนเป็นหนึ่งเครื่อง `docs/INSTALLERS.md` ปัจจุบันมี setup EXE และเนื้อหาเพิ่ม เลขบรรทัดเดิมใน REQ บางแห่งจึงไม่ตรง ใช้ source citations ของ Rev1

`manager.go:207` ไม่ strict unknown-field validation เท่าที่ข้อความ schema อาจทำให้เข้าใจ; ต้องเพิ่มก่อนอ้าง complete contract validation

ไม่อ่านไฟล์นอก allowlist จึงยังไม่รับรอง helpers, third-party implementation, auth integration หรือ installer scripts ไม่มีข้อขัดแย้งใหม่ที่จำเป็นต้องแก้ REQ ทั้งชุด; ประเด็นค้างมี dependency ระบุแล้ว

Rev2 ถอน SchoolBotUser, เปลี่ยน legacy UUID→int และ SchoolId wire string→int; เพิ่ม web auth/session และเสนอ colocate ตารางใหม่ ผลกระทบ consumer/schema ต้องผ่านมนุษย์ก่อน build; ไม่ใช่การอนุมัติรหัสผ่าน legacy หรือเขียนเกรด

## ส่งต่อ

หลังมนุษย์ตัดสิน: DBA ตรวจ physical schema/constraints/migration และเป็นผู้เขียน SQL; SA amend contract หากผล review เปลี่ยนแบบ จากนั้นผู้คุมจึงส่งบทบาทถัดไป ไม่เปิด implementation/PM plan ในงานนี้

## Change Log
- 2026-10-21 — Rev2: ปิด API location; คง compatibility/schema review
- 2026-10-21 — Rev1: แยก business pending, technical proof และ required approvals
