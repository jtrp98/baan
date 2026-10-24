# พื้นที่ Guest ถังขยะ และไฟล์ส่งออก — Rev1

สัญญาต่อจาก [DES-003](des-003.md) สำหรับ REQ-040; สถานะอยู่ที่ [index](index.md). เป็น local files ของ host ไม่ใช่ relational schema ใหม่

## พื้นที่และข้อมูล

หนึ่ง workspace ต่อ OS account อยู่ใต้ app data root ที่ host เลือก; ทุกคนใช้ Guest ใน account นั้นเปิดงานร่วมกันได้ ไม่มี PIN/guest profile. UUID ของงานไม่ใช่ตัวตนผู้เรียน; Login/logout ไม่ย้ายหรือล้างงาน. ไม่ใช้ชื่อโครงงานเป็น path และไม่เปิด path จาก renderer โดยตรง

`LocalProjectDocument` และ `ProjectContent` ใช้ [DES-003](des-003.md#project-document-v2). งานปกติเก็บจนผู้ใช้สั่งลบ ไม่มีอายุ 30 วันบนงานปกติ. การเปลี่ยนสถานะใช้ lock ต่อ project และ atomic replace; index สร้างใหม่จากไฟล์ได้. ใบรับนำเข้าแยกพื้นที่ตามบัญชี P และไม่เปิดเผย Cloud IDs/ผลนักเรียนผ่าน Guest list

## ถังขยะ 30 วัน

Host เก็บ record `{schema:1,project:LocalProjectDocument,deleted_at:UTC,expires_at:UTC}`; UTC เป็น RFC3339 instant ที่ host สร้าง, ไม่มี null. `expires_at=deleted_at+2592000 วินาที` (30×24 ชั่วโมง) ไม่เลื่อนเมื่อเปิด/ปิดแอป. record เก็บโครงงานฉบับที่ลบครบเพื่อกู้ได้; ไม่บันทึกเวลาที่ UI ส่งมา

| Operation ของ ProjectsV2 | Input | ผลสำเร็จ / failure |
|---|---|---|
| delete local | project_id, expected_local_revision | ย้ายเข้าสถานะ trashed แบบ durable ก่อนตอบ `{project_id,deleted:true,deleted_at,expires_at}`; ไม่แสดงว่าลบถาวร |
| list trash | ไม่มี owner/path จาก UI | metadata ของรายการที่ยังไม่หมดอายุ; ไม่รวมใน list งานปกติ |
| restore | project_id | ก่อน expires_at คืน document UUID เดิมและ counter ถัดไป; ชื่อซ้ำได้เพราะไม่ใช่ key; active UUID ชน → PROJECT_EXISTS |
| sweep | host เรียกเอง | ลบ project payload ที่หมดอายุ; การลบไม่สำเร็จ → STORE_UNAVAILABLE และ retry ไม่แสดงรายการว่ากู้ได้ |

เปิดแอป/resume ต้องตรวจเวลาและ sweep ก่อน list/restore/export; ขณะแอปเปิดตรวจด้วย timer ทุก 60 วินาที (สมมติฐาน — ยังไม่ยืนยัน) และก่อน operation เสมอ. ขณะปิดไม่มี background service ใหม่: เวลายังคงนับจาก absolute expires_at และลบเมื่อเปิดครั้งถัดไปตาม AC-040-06. ที่ขอบ `now >= expires_at` กู้ไม่ได้ (`TRASH_EXPIRED`) แม้ยัง unlink ไม่สำเร็จ. ไม่เพิ่มปุ่มลบถาวรก่อนครบกำหนดในงานนี้

ใช้ clock anchor ของ host ตาม DES-002: server UTC ล่าสุด, wall time และ max effective UTC; ระหว่างเปิดใช้ monotonic elapsed และไม่ลด high-water mark. ตรวจ rollback เมื่อเริ่ม/resume ก่อนเลื่อน anchor; ถ้าเวลาไม่น่าเชื่อถือ → `CLOCK_UNTRUSTED` หยุด restore และ irreversible purge จน online ยืนยันเวลาใหม่ ไม่ตั้ง deleted_at ใหม่หรือเพิ่มอายุ. การปิดเครื่องด้วยนาฬิกาปกติยังนับช่วงปิดด้วย wall clock. การย้อนทั้งดิสก์/OS store ยังป้องกันไม่ได้ทั้งหมดตามข้อจำกัด DES-002 ไม่อ้างเป็น trusted clock ออฟไลน์สมบูรณ์

Purge ลบเฉพาะไฟล์ project ใน trash และ cache/thumbnail ของ project นั้น; ไม่ลบงานปกติ, Cloud copy, import tombstone หรือประวัติเรียนอิสระใน [guest-history](guest-history-001.md). ประวัติมี snapshot ของตนเอง ไม่ชี้ไฟล์ trash ที่จะหาย; การลบงานจึงไม่เท่ากับลบประวัติหรือ secure erase จาก backup/SSD. ถ้าต้องลบข้อมูลส่วนบุคคลทุกสำเนาเป็นเรื่อง retention เดิมของเจ้าของข้อมูล ไม่อนุมานจาก 30 วัน

## Export / เปิดกลับ

ส่งออกหนึ่งงานเป็นไฟล์ `.schoolbot-project.json`, media type `application/json`, UTF-8 ไม่มี archive/ไฟล์แนบ; bytes ทั้งไฟล์ ≤1 MiB. เนื้อหาคือ LocalProjectDocument ตาม DES-003 (schema=2, UUID, mode, name, local_revision, updated_at, content) ไม่ใส่ License/session/device key, acceptance/connection/uploaded truth, Cloud owner หรือประวัติเรียน. เขียนไฟล์แบบ atomic ผ่าน save dialog ที่ host คุม แล้วคืน `{exported:true}` หลังสำเร็จ; cancel → `EXPORT_CANCELLED`, I/O failure → `STORE_UNAVAILABLE`, ขนาดเกิน → `PROJECT_TOO_LARGE`; ต้นฉบับไม่ถูกแก้

เปิดกลับตรวจ JSON/schema/content/ขนาดรวม และ Code UI UTF-16 bound ตาม DES-003 ก่อนเขียน. ไม่รัน source/คำสั่งหุ่นจากการเปิดไฟล์. UUID ที่ยังไม่มีนำกลับพร้อม mode/content เดิม; UUID ที่มีและเนื้อหาเท่ากันเปิดงานเดิม; ถ้าเนื้อหาต่างคืน `PROJECT_EXISTS` ให้ผู้ใช้เลือกสร้างสำเนา UUID ใหม่ ไม่ทับเงียบ. การเปิดงาน trash ต้อง restore ตามอายุ ไม่ใช้ export/import เป็นการต่ออายุรายการเดิม

## เหตุผลและหลักฐาน

เลือก JSON เดียว/absolute expiry/atomic replace ต่อจาก `app/desktopstorage.go:46–130` ซึ่งปัจจุบันมีเพียงไฟล์ `<mode>.json`; ยังไม่มีหลักฐาน implementation ของ trash/multi-project. ปัดตก ZIP เพราะไม่มี asset อ้างไฟล์ภายนอกใน ProjectContent, per-Guest PIN ขัดมติ และการนับเฉพาะเวลาเปิดขัด AC-040-06

ตรวจเอกสารครอบ AC-040-01..06; ขั้นตรวจ runtime ต้องมีปิดข้ามวันที่ 30, rollback, I/O fail, crash ระหว่างย้าย, restore แข่ง sweep และ roundtrip สามโหมด. รอบนี้ไม่ได้รันทดสอบเหล่านั้น

## Change Log
- 2026-10-24 — Rev1: ใบงาน060a เติมสัญญา Guest/ถังขยะ/export ตามมติเดิม ไม่เปลี่ยนระยะหรือ schema
