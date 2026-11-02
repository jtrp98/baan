# DES-012 — Private introspection และแลก token เว็บ

> Rev 9 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-012 (auth ข้ามระบบ)](des-012.md) ใช้วิธี C: token exchange ผ่าน private API Gateway

## ฐานข้อมูลและการตรวจซ้ำ

- ตาราง `SchoolBotSession`, `SchoolBotStaffRole`, `SchoolBotLicense`, `SchoolBotIdempotency` และ `SchoolBotAuditEvent` อยู่บน **SchoolBot DB (`10.0.0.128:9499`)**
- การอ่านข้อมูลสถานะโรงเรียน (`TCompany`), พนักงาน (`TEmployees`) และสิทธิ์ครูรายวิชา (`TplanCourseTeacher`, `TplanCourse`, `TplanCourseTerm`, `TplanTermSubLevel2`) อ่านจาก **School DB (`JabjaiSchoolSingleDB`)** ผ่าน connection แยกด้วย**บัญชี DB เดิม**ของระบบ โดย**ไม่รัน GRANT/สร้าง role ใหม่**ใน School DB ([มติ 029 (ใช้บัญชี DB เดิมโดยไม่สร้าง role หรือ GRANT ใหม่)](../../shared/decisions/decisions-029.md))
- เนื่องจากไม่มี transaction เดียวครอบ SchoolBot DB กับ School DB ทุกคำสั่งแก้ไขต้อง **re-check สิทธิ์จาก School DB และสถานะ session/License/StaffRole ใน SchoolBot DB ณ จุดก่อน commit**

## Private web-principal

`GET /api/school-bot/auth/web-principal`

- Authenticate ด้วย scheme `JabjaiWebLegacy` อย่างเดียว; ปฏิเสธ token ที่มี claim `purpose` หรือ `aud` (`legacy-handoff`) → `401`
- Rate limit ตาม claim `(school,user)`, `Cache-Control: no-store`, ไม่ log token/claims
- คืน `200 {school_id:I,user_id:I|null,admin_id:T64|null,is_admin:B,user_type:T16|null,expires_at:D|null}` (ต้องคืน `is_admin` ตาม [มติ 035 (ตรวจกลุ่ม admin ฝั่ง server)](../../shared/decisions/decisions-035.md))

## POST /v2/auth/web-sessions — แลก SchoolBot session

Header: `JabjaiWebKey-*: <token>`; body: `{channel:"school_web"|"staff_admin"}`
ไม่ใช้ `Idempotency-Key`/raw response cache; คืน `201 {access_token:T43,token_type:"Bearer",session:SessionView}` (`Cache-Control: no-store`)

ขั้นตรวจ (fail closed ทุกข้อ):

1. Introspection สำเร็จภายใน timeout 3 วินาที ไม่งั้น `503 AUTH_UNAVAILABLE`
2. ใช้ `school_id`/`user_id`/`admin_id`/`is_admin` จาก response เท่านั้น ไม่อ่านจากชื่อ header/body
3. **Token ที่ไม่มี `exp` (`expires_at=null` จาก bypassgarde)**: **อนุญาตให้แลกได้ตามมติผู้ใช้ [มติ 025 (แลก token ผ่าน Gateway และแยกสิทธิ์ตามช่องทาง)](../../shared/decisions/decisions-025.md) (ผู้ใช้รับความเสี่ยง)** โดยจำกัดอายุ `SchoolBotSession` ตาม [อายุ session](des-012-authorization.md#browser-security-และอายุ-session)
4. โรงเรียน active (`TCompany IsActive & !CDel`) จาก School DB
5. `P = employee(school_id, user_id)` เมื่อพบ `TEmployees` ที่ไม่ถูกลบในโรงเรียนนั้นและ `WorkStatus ∉ {2,3}`; ไม่พบ → `P=null` (ใช้ได้เฉพาะกรณี `is_admin=true` แบบ legacy admin โดยบันทึก `LegacyAdminId = admin_id`)
6. **เมื่อ `channel = "school_web"` (ยืนยันตาม [มติ 025 (แลก token ผ่าน Gateway และแยกสิทธิ์ตามช่องทาง)](../../shared/decisions/decisions-025.md) และ [มติ 026 (รับแบบข้อมูลและสัญญาที่แก้ตามมติผู้ใช้)](../../shared/decisions/decisions-026.md))**: ต้องตรวจใน SchoolBot DB ว่าโรงเรียนมี `SchoolBotLicense` ที่ active (`RevokedAt IS NULL AND IsDelete = false AND ExpiresAt > now()`) โดย**ไม่ต้องมี device binding (`DeviceJkt=null`)**; หากไม่มี คืน `403 LICENSE_REQUIRED`
7. **เมื่อ `channel = "staff_admin"`**: ต้องมี `SchoolBotStaffRole` ที่ active (`IsDelete = false AND ValidFrom <= now() AND (ValidUntil IS NULL OR ValidUntil > now())`) ของ `(school_id, user_id)` และ `DeviceJkt=null`
8. บันทึก `SchoolBotSession` และ `SchoolBotAuditEvent` ใน **SchoolBot DB transaction เดียว** โดย `CreateBy`/`UpdateBy` = `user_id` (`sEmp`) หรือ `null` เมื่อไม่มี `user_id` ([มติ 028 (ใช้ CreateBy/UpdateBy เป็น int null)](../../shared/decisions/decisions-028.md))

`SessionView={session_id:K,channel:desktop|school_web|staff_admin,account_id:I|null,school_id:S,profile:P|null,legacy_admin:B,expires_at:D,update_date:D}` (+ ETag จาก `UpdateDate` ตาม [มติ 030 (ใช้ UpdateDate เป็น concurrency token)](../../shared/decisions/decisions-030.md))

## ชนิดและข้อผิดพลาด

ชนิด Data Transfer Object (DTO): `I` = integer รหัสระบบเดิม, `K` = integer primary key ของ SchoolBot, `S` = รหัสโรงเรียน, `Tn` = string ไม่เกิน n ตัวอักษร, `B` = boolean, `D` = วันเวลา, `P` = profile ชนิดและรหัส (`student|employee`) นิยามเต็มอยู่ใน [พจนานุกรมข้อมูล](data-model.md) และ [SessionView](des-004-session.md)

introspection token ไม่ผ่าน → `401`; unavailable/timeout → `503 AUTH_UNAVAILABLE`; identity/mapping ยังไม่พร้อม → `503 AUTH_NOT_CONFIGURED`; โรงเรียนไม่มี License active → `403 LICENSE_REQUIRED` ห้าม fallback ยกระดับสิทธิ์

## หลักฐาน

- [มติ 025 (แลก token และยอมรับ token เว็บไม่มี exp)](../../shared/decisions/decisions-025.md), [มติ 026 (รับแบบแก้ไข)](../../shared/decisions/decisions-026.md), [มติ 027 (SchoolBot DB)](../../shared/decisions/decisions-027.md), [มติ 029 (ใช้บัญชี DB เดิม)](../../shared/decisions/decisions-029.md)
- auth-evidence-001 (memory) และ [หลักฐาน auth baseline](des-012.md#หลักฐาน) ยังไม่พิสูจน์ว่า user_id ตรง sEmp หรือ canonical AccountId จึงห้ามเดา mapping
