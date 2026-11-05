# พื้นที่ Guest ถังขยะ และไฟล์ส่งออก

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

สัญญาต่อจาก [DES-003 (หลายโครงงาน Local/Cloud)](des-003.md) สำหรับ [REQ-040 (พื้นที่ร่วมและถังขยะ Guest)](../../modules/my-work/shared/requirements/req-040.md); สถานะอยู่ที่ [index](index.md). เป็น local files ของ host ไม่ใช่ relational schema ใหม่

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

เปิดแอป/resume ต้องตรวจเวลาและ sweep ก่อน list/restore/export; ขณะแอปเปิดตรวจด้วย timer ตามช่วงเวลาที่ยังต้องยืนยัน และก่อน operation เสมอ. ขณะปิดไม่มี background service ใหม่: เวลายังคงนับจาก absolute expires_at และลบเมื่อเปิดครั้งถัดไปตาม [AC-040-06 (เปิดระบบโดยมีงานในถังขยะครบ 30 วันแล้ว งานนั้นถูกลบถาวรอัตโนมัติและกู้ไม่ได้ งานปกติยังอยู่)](../../modules/my-work/shared/requirements/req-040.md). ที่ขอบ `now >= expires_at` กู้ไม่ได้ (`TRASH_EXPIRED`) แม้ยัง unlink ไม่สำเร็จ. ไม่เพิ่มปุ่มลบถาวรก่อนครบกำหนดในงานนี้

ใช้ clock anchor ของ host ตาม [DES-002 (License และ device binding)](des-002.md): server UTC ล่าสุด, wall time และ max effective UTC; ระหว่างเปิดใช้ monotonic elapsed และไม่ลด high-water mark. ตรวจ rollback เมื่อเริ่ม/resume ก่อนเลื่อน anchor; ถ้าเวลาไม่น่าเชื่อถือ → `CLOCK_UNTRUSTED` หยุด restore และ irreversible purge จน online ยืนยันเวลาใหม่ ไม่ตั้ง deleted_at ใหม่หรือเพิ่มอายุ. การปิดเครื่องด้วยนาฬิกาปกติยังนับช่วงปิดด้วย wall clock. การย้อนทั้งดิสก์/OS store ยังป้องกันไม่ได้ทั้งหมดตามข้อจำกัด DES-002 ไม่อ้างเป็น trusted clock ออฟไลน์สมบูรณ์

Purge ลบเฉพาะไฟล์ project ใน trash และ cache/thumbnail ของ project นั้น; ไม่ลบงานปกติ, Cloud copy, import tombstone หรือประวัติเรียนอิสระใน [guest-history](guest-history-001.md). ประวัติมี snapshot ของตนเอง ไม่ชี้ไฟล์ trash ที่จะหาย; การลบงานจึงไม่เท่ากับลบประวัติหรือ secure erase จาก backup/SSD. ถ้าต้องลบข้อมูลส่วนบุคคลทุกสำเนาเป็นเรื่อง retention เดิมของเจ้าของข้อมูล ไม่อนุมานจาก 30 วัน

## ส่งออกและเปิดไฟล์กลับ

อ่านรายละเอียดที่ [พื้นที่ Guest — ส่งออกและเปิดไฟล์กลับ](guest-workspace-001-export.md) โดยคง input/output ขอบเขต commit และ failure behavior เดิมครบ

## เหตุผลที่เลือกแบบนี้

เลือก JSON เดียว/absolute expiry/atomic replace ต่อจาก หลักฐาน E01 ซึ่งปัจจุบันมีเพียงไฟล์ `<mode>.json`; ยังไม่มีหลักฐาน implementation ของ trash/multi-project. ปัดตก ZIP เพราะไม่มี asset อ้างไฟล์ภายนอกใน ProjectContent, per-Guest PIN ขัดมติ และการนับเฉพาะเวลาเปิดขัด AC-040-06

ตรวจเอกสารครอบ [AC-040-01 (ผู้ใช้สองคนใช้ Guest ใน OS account เดียวกัน เปิดงานที่อีกคนบันทึกไว้ได้ทั้ง Block/Arm/Code โดยไม่ขอ PIN แยก)](../../modules/my-work/shared/requirements/req-040.md)..06; ขั้นตรวจ runtime ต้องมีปิดข้ามวันที่ 30, rollback, I/O fail, crash ระหว่างย้าย, restore แข่ง sweep และ roundtrip สามโหมด. รอบนี้ไม่ได้รันทดสอบเหล่านั้น


## ยังไม่ยืนยัน

ช่วงตรวจ timer ขณะแอปเปิดที่เสนอคือทุก 60 วินาที ต้องให้เจ้าของสัญญา storage ยืนยัน ส่วนการตรวจก่อน operation และ absolute expiry คงตามกฎข้างต้น

## ตัวตนที่อ้างในข้อมูล local

`P` คือบริบทปลายทาง `{school_id,kind,profile_id}`; `A` คือตัวตนผู้ทำรายการจาก session ตาม [ชนิดข้อมูลกลาง](data-dictionary/contract-001.md) AccountId แยกจาก student/employee profile ID และ Guest UUID ไม่พิสูจน์บัญชีผู้สร้าง

## หลักฐาน

- E01 — `app/desktopstorage.go:46–130`
