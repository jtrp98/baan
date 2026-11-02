# DES-004 — Session, profile binding และ HTTP API

> Rev 12 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-004 (ตัวตนและสิทธิ์)](des-004.md) กำหนด token/session และ HTTP semantics ฝั่ง client ของ Gateway

## ชนิดข้อมูลที่ใช้

ชื่อชนิดเดิมใน Data Transfer Object (DTO): `K` = primary key แบบ integer ของ SchoolBot, `I` = รหัส integer ของระบบเดิม, `S` = รหัสโรงเรียน, `Tn` = string เพดาน n ตัวอักษร, `D` = วันเวลา, `P` = profile อ้าง kind (`student|employee`) และ id, `Role` = บทบาทที่ resolve ใหม่จาก directory รายละเอียดรูปแบบ/ชนิดอยู่ใน [พจนานุกรมข้อมูล](data-model.md) ไม่ใช้รหัสบัญชีแทน profile ID

`SchoolBotSession.Channel` เป็น `desktop|school_web|staff_admin` default `desktop`; `DeviceJkt` เป็นค่าอ้าง device key ที่ว่างได้ และ `AccountId` เป็นรหัสบัญชีที่ว่างได้ ทั้งสองฟิลด์บังคับ not null เฉพาะเมื่อ `Channel=desktop`; ช่องเว็บทั้งสองมี `DeviceJkt=null` และรับตัวตนจาก token ที่ตรวจแล้ว `LegacyAdminId` เป็น string≤64 ที่ว่างได้; `SourceTokenExpiresAt` เป็นวันเวลาที่ว่างได้ `CreateBy/UpdateBy` เป็น integer nullable ใช้ `sId/sEmp` หลังเลือก profile และ null ตอน unbound/legacy admin ตาม [มติ 028 (audit actor เป็น int null)](../requirement/decisions-028.md)

`SessionView={session_id:K,channel:desktop|school_web|staff_admin,account_id:I?,school_id:S,profile:P?,legacy_admin:boolean,expires_at:D,update_date:D}` เครื่องหมาย `?` หมายถึง null ได้; ส่ง `ETag` จาก `UpdateDate` ตาม [มติ 030 (concurrency token)](../requirement/decisions-030.md) roles/สิทธิ์ใน session ไม่เป็น authority ต้อง resolve ใหม่เสมอ

## Token และ endpoints

Session token: opaque token จาก ตัวสุ่มที่เหมาะกับ cryptography (CSPRNG) 32 bytes, base64url 43 ตัว; DB เก็บ SHA-256 ใน `SchoolBotSession` เท่านั้น ส่ง raw token ครั้งเดียวตอนออก session; ปัดตก JWT/refresh เพื่อลด lifecycle รอบนี้ ครบอายุให้ login/แลกใหม่

username/password ต้องไม่ว่าง; ไม่ trim/normalize password; username normalization รอ compatibility evidence

| Endpoint `/v2` | ช่องทาง / สิทธิ์ | Input/ผล |
|---|---|---|
| POST /auth/login | desktop (มี active License + device proof) | `{school_id:S,username:T256,password:T1024}` → 201 `{access_token:T43,token_type:"Bearer",session:SessionView}` |
| POST /auth/web-sessions | school_web, staff_admin ([DES-012 (auth ข้ามระบบ)](des-012.md)) | header `JabjaiWebKey-*` + `{channel:"school_web"\|"staff_admin"}` → 201 `{access_token:T43,token_type:"Bearer",session:SessionView}` |
| GET /auth/session | ทุก channel | Bearer → 200 SessionView (+ ETag จาก `UpdateDate`) |
| PUT /auth/session | desktop | `{profile:P}` + If-Match (`ETag`) → 200 SessionView; bind ครั้งเดียว (`P=student` หรือ `employee`) |
| POST /auth/logout | ทุก channel | Bearer → 204; revoke session ปัจจุบัน |
| GET /me | desktop | Bearer → 200 `{account_id:I,display_name:T200,memberships:[{profile:P,roles:Role[]}]}` |
| GET /admin/teacher-grants | school_web (`school_admin`, fallback) | scope/pagination → grant list |
| POST /admin/teacher-grants | school_web (`school_admin`, fallback) | `{teacher_id,learner_id,mode,can_view,can_assess,valid_from,valid_until}` → 201 grant |
| DELETE /admin/teacher-grants/{id} | school_web (`school_admin`, fallback) | If-Match (`ETag`) → 200 `{id,deleted:true,update_date}` |

Teacher/Learner IDs เป็น `I` ตาม data-model; grant result คือ input + `id:K`/`update_date:D`; school/common fields เป็น server-managed. **หมายเหตุทางสำรอง (`SchoolBotTeacherGrant`)**: ตาราง `SchoolBotTeacherGrant` และ endpoints `/v2/admin/teacher-grants` เป็นทางสำรอง (conditional fallback) ซึ่ง**ยังไม่ได้ตัดสินให้สร้างและถอนออกจาก `db/schoolbot_db.sql` แล้ว**ตาม [มติ 026 (รับแบบข้อมูลและสัญญาที่แก้ตามมติผู้ใช้)](../requirement/decisions-026.md) และ `db/review-005.md` (memory)

Session/Grant primary key และ grant path `{id}` เป็น integer ที่ web สร้าง ไม่ใช้ token/device UUID แทน Login และ web-sessions คงข้อยกเว้น idempotency ใน [Lifecycle](des-004-lifecycle.md)

Lifecycle, logout และ error อ่าน [ส่วนอายุ session และ failure](des-004-lifecycle.md)

## หลักฐาน

- สัญญาเดิม [DES-004 (ตัวตนและสิทธิ์)](des-004.md) Rev12; auth-evidence-001 (memory) ระบุ port web Trim username/password, mobile เทียบตรงตัว ทั้งคู่ไม่ lowercase และยังไม่ทราบ collation นี่เป็นพฤติกรรมที่บันทึกไว้ ไม่ใช่นโยบายให้ adapter Trim password
- รูปแบบ error กลางอยู่ใน [กฎข้อมูลและ HTTP](data-contract-rules.md); TeacherGrant ถูกถอนจาก `db/schoolbot_db.sql` ตาม db/review-005 (memory)
