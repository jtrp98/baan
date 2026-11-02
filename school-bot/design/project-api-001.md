# Project API และ concurrency

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วน canonical ต่อจาก [DES-003 (หลายโครงงาน Local/Cloud)](des-003.md); [GAP-03 (ช่องว่าง Project API และ concurrency)](project-api-001.md)/[มติ 030 (มติถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md). สถานะอยู่ที่ [index](index.md). HTTP เป็น client semantics ผ่าน HTTP API Gateway; HTTP API Gateway → SchoolBot gRPC service ตาม [Gateway](gateway-integration-001.md)

## Operations

Cloud prefix `/v2/projects`; ตารางนี้ใช้ K (รหัส int4) และ CloudProjectDocument. `ProjectsV2` local ใช้ operation เดียวกัน แต่ ID เป็น U (UUID) และคืน LocalProjectDocument โดยไม่มี project_revision_id/HTTP; Host สร้าง ID ให้ local create/copy

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

## Commit Project และ Revision

อ่านรายละเอียดที่ [Project API — commit Project และ Revision ร่วมกัน](project-api-001-commit.md) โดยคง input/output ขอบเขต commit และ failure behavior เดิมครบ

## ความหมายของ token

ETag เป็น opaque token จาก UpdateDate ความละเอียด microsecond; If-Match ขาด→428 PRECONDITION_REQUIRED, ไม่ตรง→412 VERSION_CONFLICT+details.current_etag. Server ตั้ง UpdateDate และไม่รับ timestamp/version จาก client. `revision` คือเลข snapshot และ `project_revision_id` คือ PK; ไม่เอาเลขใดเลขหนึ่งมาแทน ETag. Copy ตรวจ revision อยู่ใต้ source project และ scope ตรงก่อน commit; RequestKey เดิมกู้การตอบหาย ไม่สร้างสำเนาซ้ำ

เลือก immutable revision PK สำหรับเลือก snapshot และ ETag สำหรับ concurrency; ปัดตก source_version ที่ปะปนสองหน้าที่หรือ client Date ที่เสีย microseconds. ความสัมพันธ์ current-pointer `(ProjectId, CurrentRevision, SchoolId) -> (ProjectId, Revision, SchoolId)` เป็นความสัมพันธ์เชิงตรรกะ (`LOGICAL_SchoolBotProject_CurrentRevision` ตาม [data-contract-rules](data-contract-rules.md)) ที่ `CommitProjectAsync` ต้องรักษาให้ตรงกันในหน่วย commit เดียว; สัญญานี้ไม่แก้ schema


## หลักฐาน

หลักฐาน ตาราง `SchoolBotProject`/`SchoolBotProjectRevision` ใน `db/schoolbot_db.sql` (Rev7 ตาม [decisions-044](../requirement/decisions-044.md)) มี `CurrentRevision`/`Revision`/`UpdateDate` โดยคงเฉพาะ PRIMARY KEY และไม่มีคอลัมน์ `Version` หรือ SQL `UNIQUE`/`FK`/`CHECK`
