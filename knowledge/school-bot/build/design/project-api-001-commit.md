# Project API — commit Project และ Revision ร่วมกัน

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Project API และ concurrency](project-api-001.md)

## หน่วย commit ร่วม

ใช้ขอบเขตที่ผู้ใช้ยืนยันตาม [มติ 051 (commit Project และ Revision เป็นหน่วยเดียว)](../../shared/decisions/decisions-051.md)

- `ISchoolBotDbAdapter` และ `ISchoolBotBackingStore` ใช้ `CommitProjectAsync` เป็นจุด commit ร่วมหน่วยเดียวสำหรับการสร้างและบันทึกงาน (`POST /v2/projects`, `PUT /v2/projects/{id}`, `POST /v2/projects/{id}/copies`) แทนการเรียก `SaveProjectAsync` → `SaveProjectRevisionAsync` แยกกัน โดยไม่คงเมธอดเขียนแยกเป็นทางลัดสร้างหรือบันทึก snapshot; คำสั่งแก้เฉพาะ metadata/soft-delete ห้ามเปลี่ยน `CurrentRevision` โดยพลการ
- **Input / Server-managed / Output:** รับ `ProjectId:int?` (`null` = create), `SchoolId`, `OwnerKind: student|employee`, `OwnerId` จากบริบทที่ตรวจสิทธิ์แล้ว, `Mode: block|arm|code`, `Name` (1–200), `Content: ProjectContent` ตาม [DES-003 (จัดการหลาย Project)](des-003.md) และ `ExpectedETag` (`null` ตอน create, บังคับตอน update); server เป็นผู้กำหนด PK (`SchoolBotProjectId`, `SchoolBotProjectRevisionId`), เลข `Revision`, `CurrentRevision`, `ContentHash` และ audit/เวลา (`CreateBy`/`CreateDate`/`UpdateBy`/`UpdateDate`) โดยห้ามเปลี่ยน `OwnerKind`/`OwnerId`/`SchoolId`/`Mode` ของงานเดิม; คืน `ProjectCommitResult { Project, Revision }` ที่ commit แล้วจริง (คงโครงสร้าง record เดิม 12 + 11 = 23 properties)
- **ลำดับการทำงานและผลก่อน/หลัง commit:** อ่านสถานะ authoritative ภายใต้ lock → ตรวจบริบทสิทธิ์/tenant และ `ExpectedETag` → สร้างชุด candidate (`Project` + `Revision`) → สั่ง commit ทั้งคู่เป็นหน่วยเดียวใน backing store → publish เข้า in-memory cache และคืนผลหลัง commit สำเร็จเท่านั้น. ความล้มเหลวก่อนจุด commit ต้องไม่เปลี่ยนสถานะทั้งใน store และ cache (ห้ามเพิ่มรายการเข้า cache หรือเลื่อนลำดับ ID ก่อน commit); หากเกิดความล้มเหลวที่ไม่อาจทราบผล (unknown commit outcome เช่น ยกเลิก/ขาดการเชื่อมต่อ/ล้มระหว่างสลับผล) ต้องไม่รายงานว่าสำเร็จ, ต้อง invalidate/reload cache จากสถานะ authoritative ของ store แทนการเดาว่า rollback แล้วหรือชดเชยด้วย compensation write, และห้าม retry create อัตโนมัติจนเกิดงานซ้ำ. รหัสความผิดพลาดคงตาม envelope กลาง: `400 INVALID_INPUT`, `404 NOT_FOUND`, `428 PRECONDITION_REQUIRED`, `412 VERSION_CONFLICT`, `503 SERVICE_UNAVAILABLE` (ไม่ใช้ `STORE_UNAVAILABLE` ของ local IPC)
- **สัญญาต่อชนิด store:** **File store** เก็บคู่ข้อมูลใน snapshot เดียว (`{format:1, projects:[], revisions:[]}`) เขียนลงไฟล์ชั่วคราวแล้ว replace ครั้งเดียว (ตาม `decisions-051` ยืนยันว่าไม่มีไฟล์คู่เดิมใน target ที่ต้องทำ importer/migration; ความทนทานต่อ kill/power-loss ขึ้นกับการ flush/close/replace ที่ต้องพิสูจน์ในทดสอบ); **Memory store** สลับ snapshot ทั้งคู่ใต้ lock เดียว; **PostgreSQL** (เมื่อต่อ DB จริงใน [DBA-003 (Core evidence สำหรับการเชื่อมฐานข้อมูล)](../plan/index.md)/`G-CORE`) ใช้ transaction เดียวสำหรับ insert `SchoolBotProjectRevision` และ insert/update `SchoolBotProject` (รวม idempotency/audit เมื่อผ่าน Cloud API เต็มเส้น) โดยไม่เขียนทับทั้งตารางและไม่เพิ่ม `UNIQUE`/`FK`/`CHECK` ([มติ 044 (มติที่ 044 — SQL constraints เหลือเฉพาะ Primary Key)](../../shared/decisions/decisions-044.md))


## หลักฐาน

ที่มาสัญญาการ commit: project-commit-proposal-001 (memory)
