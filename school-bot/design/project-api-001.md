# Project API และ concurrency — Rev2

ส่วน canonical ต่อจาก [DES-003](des-003.md); GAP-03/decisions-030. สถานะอยู่ที่ [index](index.md). HTTP เป็น client semantics ผ่าน G; G→B gRPC ตาม [Gateway](gateway-integration-001.md)

## Operations

Cloud prefix `/v2/projects`; ตารางนี้ใช้ K/CloudProjectDocument. `ProjectsV2` local ใช้ operation เดียวกัน แต่ ID เป็น U และคืน LocalProjectDocument โดยไม่มี project_revision_id/HTTP; Host สร้าง ID ให้ local create/copy

| Operation | Input | Result |
|---|---|---|
| GET collection | mode + pagination | metadata list: id,mode,name,revision,update_date |
| POST collection | `{mode,name,content}` | 201 document, revision=1 + ETag |
| GET /{id} | ID | 200 document + ETag |
| PUT /{id} | `{name,content}` + If-Match | 200 document, revision ถัดไป + ETag ใหม่ |
| DELETE /{id} | If-Match | 200 `{project_id,deleted:true,update_date}` + ETag ใหม่ |
| POST /{id}/copies | `{name,source_project_revision_id:K}` + If-Match ของ Project ต้นทาง | 201 งานใหม่ revision=1 + ETag |

Save As ของ unsaved draft ใช้ POST; ของ saved revision ใช้ copies; server สร้าง Project/Revision K ใหม่และ source ไม่เปลี่ยน Owner/School มาจาก auth ไม่ใช่ body Copy ระบุ immutable revision PK ที่ต้องอยู่ใต้ project ต้นทางและยังมีสิทธิ์อ่าน; `source_project_revision_id` เลือกเนื้อหา ส่วน `If-Match` ตรวจสถานะ Project ปัจจุบัน ไม่ใช้ `source_version` หรือ timestamp จาก client. Local ใช้ `expected_local_revision` ภายใต้ lock; save เพิ่ม counter ส่วน copy สร้าง UUID/counter=1 ใหม่

Cloud commit ProjectRevision+current pointer+idempotency+audit transaction เดียว; ห้ามคืนสำเร็จก่อน durable commit DELETE soft delete ไม่ทำลาย submission ที่อ้าง revision อยู่

**หน่วย commit ร่วมของ Project + Revision ใน adapter และ backing store (ยืนยันทาง A ตาม [decisions-051](../requirement/decisions-051.md) / [project-commit-proposal-001](project-commit-proposal-001.md)):**
- `ISchoolBotDbAdapter` และ `ISchoolBotBackingStore` ใช้ `CommitProjectAsync` เป็นจุด commit ร่วมหน่วยเดียวสำหรับการสร้างและบันทึกงาน (`POST /v2/projects`, `PUT /v2/projects/{id}`, `POST /v2/projects/{id}/copies`) แทนการเรียก `SaveProjectAsync` → `SaveProjectRevisionAsync` แยกกัน โดยไม่คงเมธอดเขียนแยกเป็นทางลัดสร้างหรือบันทึก snapshot; คำสั่งแก้เฉพาะ metadata/soft-delete ห้ามเปลี่ยน `CurrentRevision` โดยพลการ
- **Input / Server-managed / Output:** รับ `ProjectId:int?` (`null` = create), `SchoolId`, `OwnerKind: student|employee`, `OwnerId` จากบริบทที่ตรวจสิทธิ์แล้ว, `Mode: block|arm|code`, `Name` (1–200), `Content: ProjectContent` ตาม [DES-003](des-003.md) และ `ExpectedETag` (`null` ตอน create, บังคับตอน update); server เป็นผู้กำหนด PK (`SchoolBotProjectId`, `SchoolBotProjectRevisionId`), เลข `Revision`, `CurrentRevision`, `ContentHash` และ audit/เวลา (`CreateBy`/`CreateDate`/`UpdateBy`/`UpdateDate`) โดยห้ามเปลี่ยน `OwnerKind`/`OwnerId`/`SchoolId`/`Mode` ของงานเดิม; คืน `ProjectCommitResult { Project, Revision }` ที่ commit แล้วจริง (คงโครงสร้าง record เดิม 12 + 11 = 23 properties)
- **ลำดับการทำงานและผลก่อน/หลัง commit:** อ่านสถานะ authoritative ภายใต้ lock → ตรวจบริบทสิทธิ์/tenant และ `ExpectedETag` → สร้างชุด candidate (`Project` + `Revision`) → สั่ง commit ทั้งคู่เป็นหน่วยเดียวใน backing store → publish เข้า in-memory cache และคืนผลหลัง commit สำเร็จเท่านั้น. ความล้มเหลวก่อนจุด commit ต้องไม่เปลี่ยนสถานะทั้งใน store และ cache (ห้ามเพิ่มรายการเข้า cache หรือเลื่อนลำดับ ID ก่อน commit); หากเกิดความล้มเหลวที่ไม่อาจทราบผล (unknown commit outcome เช่น ยกเลิก/ขาดการเชื่อมต่อ/ล้มระหว่างสลับผล) ต้องไม่รายงานว่าสำเร็จ, ต้อง invalidate/reload cache จากสถานะ authoritative ของ store แทนการเดาว่า rollback แล้วหรือชดเชยด้วย compensation write, และห้าม retry create อัตโนมัติจนเกิดงานซ้ำ. รหัสความผิดพลาดคงตาม envelope กลาง: `400 INVALID_INPUT`, `404 NOT_FOUND`, `428 PRECONDITION_REQUIRED`, `412 VERSION_CONFLICT`, `503 SERVICE_UNAVAILABLE` (ไม่ใช้ `STORE_UNAVAILABLE` ของ local IPC)
- **สัญญาต่อชนิด store:** **File store** เก็บคู่ข้อมูลใน snapshot เดียว (`{format:1, projects:[], revisions:[]}`) เขียนลงไฟล์ชั่วคราวแล้ว replace ครั้งเดียว (ตาม `decisions-051` ยืนยันว่าไม่มีไฟล์คู่เดิมใน target ที่ต้องทำ importer/migration; ความทนทานต่อ kill/power-loss ขึ้นกับการ flush/close/replace ที่ต้องพิสูจน์ในทดสอบ); **Memory store** สลับ snapshot ทั้งคู่ใต้ lock เดียว; **PostgreSQL** (เมื่อต่อ DB จริงใน `DBA-003`/`G-CORE`) ใช้ transaction เดียวสำหรับ insert `SchoolBotProjectRevision` และ insert/update `SchoolBotProject` (รวม idempotency/audit เมื่อผ่าน Cloud API เต็มเส้น) โดยไม่เขียนทับทั้งตารางและไม่เพิ่ม `UNIQUE`/`FK`/`CHECK` ([decisions-044](../requirement/decisions-044.md))

## ความหมายของ token

ETag เป็น opaque token จาก UpdateDate ความละเอียด microsecond; If-Match ขาด→428 PRECONDITION_REQUIRED, ไม่ตรง→412 VERSION_CONFLICT+details.current_etag. Server ตั้ง UpdateDate และไม่รับ timestamp/version จาก client. `revision` คือเลข snapshot และ `project_revision_id` คือ PK; ไม่เอาเลขใดเลขหนึ่งมาแทน ETag. Copy ตรวจ revision อยู่ใต้ source project และ scope ตรงก่อน commit; RequestKey เดิมกู้การตอบหาย ไม่สร้างสำเนาซ้ำ

เลือก immutable revision PK สำหรับเลือก snapshot และ ETag สำหรับ concurrency; ปัดตก source_version ที่ปะปนสองหน้าที่หรือ client Date ที่เสีย microseconds. หลักฐาน ตาราง `SchoolBotProject`/`SchoolBotProjectRevision` ใน `db/schoolbot_db.sql` (Rev7 ตาม [decisions-044](../requirement/decisions-044.md)) มี `CurrentRevision`/`Revision`/`UpdateDate` โดยคงเฉพาะ PRIMARY KEY และไม่มีคอลัมน์ `Version` หรือ SQL `UNIQUE`/`FK`/`CHECK`; ความสัมพันธ์ current-pointer `(ProjectId, CurrentRevision, SchoolId) -> (ProjectId, Revision, SchoolId)` เป็นความสัมพันธ์เชิงตรรกะ (`LOGICAL_SchoolBotProject_CurrentRevision` ตาม [data-contract-rules](data-contract-rules.md)) ที่ `CommitProjectAsync` ต้องรักษาให้ตรงกันในหน่วย commit เดียว; รอบนี้ไม่แก้ schema

## Change Log
- 2026-11-02 — Rev2: ใบงาน094 ออก delta ตาม [decisions-051](../requirement/decisions-051.md) และ [project-commit-proposal-001](project-commit-proposal-001.md) (ทาง A): กำหนดขอบเขต `CommitProjectAsync` บันทึก Project+Revision เป็นหน่วย commit เดียว, ผลก่อน/หลัง commit และ unknown outcome ต่อ store (file snapshot เดียว/memory lock เดียว/PostgreSQL transaction เดียว) และปรับถ้อยคำบรรทัด 26 จาก composite FK เดิมเป็น logical relation ตาม DDL Rev7 (`decisions-044`); ไม่แก้ schema/AC/TP
- 2026-10-24 — Rev1: ใบงาน060a แยก API table จาก DES-003 พร้อม ETag/immutable revision semantics; archive เดิมคงครบ
