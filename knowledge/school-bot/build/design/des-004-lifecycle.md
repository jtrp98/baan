# DES-004 — อายุ session, logout และ failure

> Rev 13 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 052 — อายุ Desktop session นับจากเวลา bind)

ส่วนต่อของ [DES-004 (ตัวตนและสิทธิ์)](des-004.md) ใช้ [SessionView และชนิด Data Transfer Object (DTO)](des-004-session.md); profile ในข้อความ/DTO เดิมใช้สัญลักษณ์ `P`

## Lifecycle และ failure

Desktop session lifecycle: `guest → authenticating → authenticated_unbound → authenticated → expired|signed_out`

`POST /v2/auth/login` ให้ unbound desktop session อายุ 5 นาที (`ProfileKind/ProfileId=null`, `CreateBy/UpdateBy=null`); ใช้ได้เฉพาะ `session`/`me`/`logout`. การ `PUT /v2/auth/session` เพื่อ bind ต้องเลือก `P` (`student` หรือ `employee`) ที่อยู่ใน `memberships` ที่ re-check ใหม่จาก School DB และ `school_id` ตรงกับ session; สำเร็จแล้วตั้ง `ExpiresAt = เวลาที่ bind สำเร็จ + 8 ชั่วโมง` ตาม [มติ 052 (อายุ Desktop session นับจากเวลา bind)](../../shared/decisions/decisions-052.md), `UpdateBy = ProfileId`, `UpdateDate = clock_timestamp()`; `kind/id` เปลี่ยนอีกไม่ได้ (`409 SESSION_ALREADY_BOUND`); bind ซ้ำ `P` เดิมคืนค่าเดิมหลังตรวจสิทธิ์/`If-Match` โดยไม่ต่ออายุ; เปลี่ยนโรงเรียนหรือเปลี่ยนโปรไฟล์ต้อง login ใหม่ (ส่วน `school_web` และ `staff_admin` ออก session ที่ resolve ตัวตนพร้อมใช้งานตั้งแต่ตอนแลกตาม [DES-012 (auth ข้ามระบบ)](des-012.md))

`GET /auth/session` คืน `ETag` (จาก `UpdateDate`); `PUT /auth/session` ใช้ `If-Match`/`Idempotency-Key` ตามกฎกลาง (`UpdateDate` เป็น concurrency token ตาม [มติ 030 (ใช้ UpdateDate เป็น concurrency token)](../../shared/decisions/decisions-030.md)); `SchoolBotSession` + `SchoolBotIdempotency` + `SchoolBotAuditEvent` commit ใน **SchoolBot DB** เดียว. `login` และ `web-sessions` ไม่ใช้ idempotency/cache raw response; timeout ให้ขอใหม่ session ที่ไม่ได้รับจะหมดอายุเอง. `logout` ไม่ต้อง `If-Match`/`Idempotency-Key`/License: revoke+audit ใน SchoolBot DB transaction เดียว คืน 204 แม้ token หาย/หมดอายุ/ถูกถอน; DB ล่มคืน 503 ไม่อ้างว่า revoke สำเร็จ

ไม่มี refresh token; token หมดอายุ/เครือข่ายล้มเหลวไม่เปลี่ยนเป็น Guest หรืออ้างว่าบันทึก Cloud สำเร็จ. Password อยู่ UI/host memory ชั่วคราว ส่ง HTTPS แล้วล้าง; ห้าม log/telemetry/local disk/OS store เก็บ password; Desktop host เก็บเฉพาะ token ใน OS credential store ไม่คืน token ให้ renderer. Response auth ใช้ `Cache-Control: no-store`; backend ห้ามบันทึก password/raw token รวมทั้งใน SQL/request logs

Logout บน Desktop ใช้ robot drain/close guard เดิม; ล้าง token/UI แม้ offline และแจ้งว่า revocation ยังไม่ยืนยัน (server expiry ยังมีผล)

ใช้ error envelope กลาง: `400 INVALID_INPUT`; `401 UNAUTHORIZED` แบบเดียวสำหรับ username/password ผิดหรือบัญชีปิด, token invalid/revoked; `401 SESSION_EXPIRED`; `403 PROFILE_REQUIRED` / `PROFILE_NOT_ALLOWED` / `CHANNEL_NOT_ALLOWED` / `LICENSE_REQUIRED` / `FORBIDDEN` / `SCHOOL_MISMATCH`; `409 SESSION_ALREADY_BOUND`; `412 VERSION_CONFLICT` (เมื่อ `UpdateDate` ไม่ตรง `If-Match`); `429 RATE_LIMITED` + `Retry-After` (จำกัดตาม school/account/source); `503 AUTH_NOT_CONFIGURED` เมื่อ compatibility ยังไม่พร้อมทั้งระบบ, `AUTH_UNAVAILABLE` เมื่อ DB หรือ gateway introspection ล่ม ไม่ใช้ sample login หรือเปิดสิทธิ์แทน; object ที่ไม่ควรรู้คืน `404`

ยุติ `/v1/admin/*` static bearer เมื่อย้าย admin API ไป `/v2/admin/*` ที่ใช้ staff_admin session, SchoolBotStaffRole และ audit รายบุคคล ตาม [มติ 025 (ย้าย admin ไป v2)](../../shared/decisions/decisions-025.md) และ [มติ 026 (รับแบบที่ปรับแล้ว)](../../shared/decisions/decisions-026.md)

## หลักฐาน

- [DES-004 (ตัวตนและสิทธิ์)](des-004.md) Rev13 และ [มติ 030 (ใช้ UpdateDate ตรวจ concurrency)](../../shared/decisions/decisions-030.md)
- ผู้ใช้ยืนยันในแชตวันที่ 2026-11-02 ว่าอายุ Desktop session นับจากเวลาที่ bind สำเร็จ ตาม [มติ 052 (อายุ Desktop session นับจากเวลา bind)](../../shared/decisions/decisions-052.md)
- [กฎข้อมูลและ HTTP](data-contract-rules.md) กำหนด error envelope และกฎร่วม
