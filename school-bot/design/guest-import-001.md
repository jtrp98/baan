# Explicit import โครงงาน Guest

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ต่อจาก [DES-003 (หลายโครงงาน Local/Cloud)](des-003.md), [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md); [REQ-041 (เลือกนำเข้าโครงงาน Guest)](../requirement/req-041.md). HTTP semantics ฝั่ง client → HTTP API Gateway ตาม Gateway; สถานะอยู่ที่ [index](index.md)

## ตัวตนและคำสั่ง

Login ไม่เริ่มนำเข้า. ผู้ใช้เลือกงานแต่ละชิ้นและเห็นบัญชี/โรงเรียน/profile ปลายทางก่อนสั่ง; Host freeze snapshot และ session generation ขณะเลือก. รับทั้ง student และ employee เพื่อสร้าง Project เท่านั้น; ประวัติเลือกแยกตาม [guest-history](guest-history-001.md). Guest UUID ไม่เป็น AccountId และไม่พิสูจน์ผู้สร้าง

ข้อเสนอ `POST /v2/projects/imports` รับ `{local_project_id:UUID,mode:block|arm|code,name:string,content:ProjectContent}`; name/content/ขนาดตาม DES-003. ไม่รับ school/owner/Cloud PK. `Idempotency-Key` ต้องเท่ากับ `local_project_id` เพื่อให้การเลือกงานเดิมใหม่ยังใช้ key เดิม ไม่ใช่ UUID สุ่มต่อการคลิก; operation ใน SchoolBotIdempotency คือ `GuestProject.Import`. Principal ใช้ A จาก session ตาม [ชนิดกลาง](data-dictionary/contract-001.md), SchoolId จาก session; จึงแยกบัญชี/profile/โรงเรียนโดยไม่ใช้ session token เป็นตัวกันซ้ำ

ผล `201 {project:CloudProjectDocument}` + ETag หลัง commit เท่านั้น; replay ขณะยังมีผลตอบเข้ารหัสคืนผลเดิม. ไม่มี auto-merge/overwrite งาน Cloud ที่เคยนำเข้า. UUID เดิมแต่เนื้อหา/ชื่อเปลี่ยนทำให้ RequestHash ต่าง → `409 IDEMPOTENCY_CONFLICT`; ให้เปิด Cloud งานเดิมหรือผู้ใช้สร้างสำเนา Guest ใหม่อย่างชัดแจ้ง ไม่เปลี่ยน key อัตโนมัติเพื่อผ่าน conflict

## ใบรับ local และ atomicity

Host เขียนใบรับก่อนส่งด้วย lock/atomic replace:

```text
{schema:1, local_project_id:UUID,
 destination:{school_id:int32,account_id:int32,kind:student|employee,profile_id:int32},
 request_key:UUID, request_hash:sha256, snapshot:ImportRequest,
 state:pending|committed|conflict|unavailable,
 cloud_project_id:int32|null, cloud_project_revision_id:int32|null, committed_at:UTC|null}
```

`ImportRequest` คือ body ที่นิยามข้างต้น; snapshot เป็นสำเนาคงที่ ไม่อ่านเนื้อหา Guest ที่แก้ภายหลังเพื่อ retry. Hash ของ canonical body ใช้กฎเดียวกับ server; ID เป็น null ก่อนยืนยันผล, committed_at เป็นเวลาที่ได้รับ durable result ไม่ใช่เวลาเกิดงาน. ใบรับไม่เก็บ token/password; local data แยก P และป้องกันตามนโยบาย Cloud recovery. Logout ไม่ย้ายใบรับไปบัญชีใหม่; callback ของ generation เก่าห้ามเติม UI บัญชีปัจจุบัน

Server ตรวจ Channel/License/device proof/ownership แล้วสร้าง Project+Revision+Idempotency+Audit ใน SchoolBot DB transaction เดียว. ใช้ unique `(SchoolId,Principal,Operation,RequestKey)` เดิม; คำขอแข่งกันสำเร็จเพียงชุดเดียว อีกคำขออ่านผลเดิม. `ResourceId` เก็บ Project PK; audit `Event=GuestProject.Import`, `EntityType=SchoolBotProject`, Actor เป็นผู้รับเข้า ไม่ใช่ผู้สร้าง Guest. `Reason` เป็นข้อความคงรูป `guest-project:<UUID>` (ไม่เก็บ source/คะแนน/secret)

เมื่อ response สูญหาย/restart ให้ส่ง snapshot/key เดิม. หลัง replay window ทั่วไป 24 ชั่วโมง ตอบ `409 IDEMPOTENCY_EXPIRED` + resource_id ที่ยังมีสิทธิ์; Host GET งานนั้นเพื่อยืนยันและเติมใบรับ ไม่ POST ใหม่. งาน Cloud ถูกลบหรือสิทธิ์หาย → 404/403 ตามกฎเดิม, state=unavailable และไม่คืนชีพ/สร้างสำเนาเอง. Tombstone ต้องอยู่เพื่อกันซ้ำแม้ ciphertext ถูกล้าง; ไม่ purge จากการล้าง Guest/trash. ใบรับสูญหายยังคำนวณ key จาก UUID งานเดิมได้; server ไม่เชื่อ local receipt เป็นหลักฐาน commit

ชื่อ/ProjectContent ผิด → `400 PROJECT_INVALID`, payload เกิน → `413 PROJECT_TOO_LARGE`; auth errors ตาม DES-004, store ล่ม → `503 STORE_UNAVAILABLE`. บางชิ้นสำเร็จรายงานแยกชิ้น ไม่รายงานสำเร็จทั้งชุด. ต้นฉบับ Guest ทุกชิ้นคงอยู่

## เหตุผลที่เลือกแบบนี้

เลือก reuse Idempotency+ResourceId/tombstone เดิม (ตาราง `SchoolBotIdempotency` ใน `db/schoolbot_db.sql`) และ Project/Revision (ตาราง `SchoolBotProject`/`SchoolBotProjectRevision`); ไม่มี ClientId/import table ใหม่. ปัดตกสุ่ม RequestKey ใหม่ทุก login, dedup ด้วยชื่อ/hash อย่างเดียว และ local receipt อย่างเดียว เพราะ response หาย/หลาย instance ทำซ้ำได้. หลักฐาน E01 ยังเป็น single-slot file store ไม่ใช่ implementation ของข้อเสนอนี้

[AC-041-01 (มีงาน Guest หลายงานแล้ว Login โดยไม่สั่งนำเข้า ไม่เกิดงานเหล่านั้นในบัญชี)](../requirement/req-041.md)..05 ต้องตรวจเลือกเฉพาะ A, restart/replay หลัง TTL, response หาย, สอง instance, เปลี่ยนบัญชีระหว่างรอ และ Guest ไม่ถูกแก้. หลักฐาน runtime ยังต้องจัดทำ

## ตัวตนที่อ้างในข้อมูล local

`P` คือบริบทปลายทาง `{school_id,kind,profile_id}`; `A` คือตัวตนผู้ทำรายการจาก session ตาม [ชนิดข้อมูลกลาง](data-dictionary/contract-001.md) AccountId แยกจาก student/employee profile ID และ Guest UUID ไม่พิสูจน์บัญชีผู้สร้าง

## หลักฐาน

- E01 — `app/desktopstorage.go:103–147`
