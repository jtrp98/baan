# Project API และ concurrency — Rev1

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

## ความหมายของ token

ETag เป็น opaque token จาก UpdateDate ความละเอียด microsecond; If-Match ขาด→428 PRECONDITION_REQUIRED, ไม่ตรง→412 VERSION_CONFLICT+details.current_etag. Server ตั้ง UpdateDate และไม่รับ timestamp/version จาก client. `revision` คือเลข snapshot และ `project_revision_id` คือ PK; ไม่เอาเลขใดเลขหนึ่งมาแทน ETag. Copy ตรวจ revision อยู่ใต้ source project และ scope ตรงก่อน commit; RequestKey เดิมกู้การตอบหาย ไม่สร้างสำเนาซ้ำ

เลือก immutable revision PK สำหรับเลือก snapshot และ ETag สำหรับ concurrency; ปัดตก source_version ที่ปะปนสองหน้าที่หรือ client Date ที่เสีย microseconds. หลักฐาน ตาราง `SchoolBotProject`/`SchoolBotProjectRevision` ใน `db/schoolbot_db.sql` มี CurrentRevision/Revision/UpdateDate และ composite current-pointer FK เดิม ไม่มี Version column; รอบนี้ไม่แก้ schema

## Change Log
- 2026-10-24 — Rev1: ใบงาน060a แยก API table จาก DES-003 พร้อม ETag/immutable revision semantics; archive เดิมคงครบ
