# DES-004 — Identity และ school authorization — Rev9

อ้าง REQ-027, 033, 035–039, 043, 048–052; decisions-010, 011, 022, 025–030; [DES-012](des-012.md); [db/review-005.md](../db/review-005.md); OQ-007/009

## ข้อเท็จจริง

`web/src/SchoolBot.Api/Program.cs:96` มี static admin Bearer เท่านั้น
`app/frontend/src/shell.tsx:10` ระบุ profile/progress เป็น placeholder
`AppView.tsx:352` เปิดเมนูครู ไม่พิสูจน์สิทธิ์; academic มีข้อมูลบัญชี/profile เดิม ดู [review](source-review-002.md) ไม่ใช่หลักฐาน password algorithm หรือ auth API; พฤติกรรม lookup/verifier ของ port ใน gateway (web ≠ mobile) และช่องว่างหลักฐาน ดู [auth-evidence-001](auth-evidence-001.md) — port ไม่เท่ากับ legacy ต้นฉบับ

## Actor / trigger / preconditions

- **Desktop (`Channel=desktop`)**: Guest เข้า local ภายใต้ License; นักเรียนและครู (`P=student` หรือ `employee`) login เพื่อใช้งานโหมดเรียน/ทดลองและจัดการโครงงานบน Cloud (ไม่มีเมนูครู การตรวจงาน หรือการส่งคะแนนใน Desktop ตาม decisions-022/025/026)
- **Web โรงเรียน (`Channel=school_web`)**: ครูรายวิชาและผู้ดูแลโรงเรียน (`IsAdmin=1`) ใช้งานผ่านหน้าเว็บใน `sb-tech-upgrade-web-system` โดยแลก token เว็บผ่าน [DES-012](des-012.md)
- **Admin ส่วนกลาง (`Channel=staff_admin`)**: พนักงาน SchoolBright ใช้งานหน้าจัดการ Next.js ใน `school-bot/web` ผ่าน [DES-012](des-012.md)
ทุกคำขอ private ต้องตรวจ server authorization ซ้ำ ณ request และซ้ำ ณ จุดก่อน commit

## ข้อเสนอ: integration seam

มติ decisions-010/011/022/025..029: `school-bot/web` ทำ Login/session/API เอง; Desktop เรียก HTTPS ไม่มี DB access หรือ Academic Login/OIDC dependency. ตารางของ SchoolBot (`SchoolBotSession`, `SchoolBotLicense`, `SchoolBotStaffRole`, `SchoolBotIdempotency`, `SchoolBotAuditEvent`) อยู่ใน **SchoolBot DB (`10.0.0.128:9499`)** ตาม [decisions-027](../requirement/decisions-027.md) ส่วนข้อมูลบัญชี/โปรไฟล์/สิทธิ์วิชาเดิมอ่านจาก Master DB และ School DB ผ่าน connection แยกด้วย**บัญชี DB เดิม**ของระบบโดยไม่รัน GRANT/สร้าง role ใหม่ใน School DB ([decisions-029](../requirement/decisions-029.md)).

ภายใน web สำหรับ Desktop login: `LegacyCredentials.Verify(school_id,username,password)→AccountId:I`; `LegacyDirectory.Resolve(AccountId,SchoolId)→[{profile:P,roles:Role[]}]`; `Authorize(session,action,resource)→allow|deny` ตรวจ scope ณ request และ re-check ข้าม DB ก่อน commit (ส่วนการแลก session ของ `school_web` และ `staff_admin` ใช้ gateway introspection ตาม [DES-012](des-012.md))

Ports นี้อ่าน records เดิม ต้องมีหลักฐาน password encoding/hash/flags, username lookup, account↔profile/tenant และ active/role/scope rules ก่อนเปิดใช้ ห้ามเดา `nSystemID`/`cType` หรือสร้างบัญชี/mapping DB ชดเชย; ไม่คัดลอก/แก้ password hash ของ legacy

Session token: opaque token จาก CSPRNG 32 bytes, base64url 43 ตัว; DB เก็บ SHA-256 ใน `SchoolBotSession` เท่านั้น ส่ง raw token ครั้งเดียวตอนออก session; ปัดตก JWT/refresh เพื่อลด lifecycle รอบนี้ ครบอายุให้ login/แลกใหม่

`SchoolBotSession` มี `Channel:desktop|school_web|staff_admin` (ค่าเริ่ม `'desktop'`), `DeviceJkt:H?` และ `AccountId:I?` (บังคับ `not null` เฉพาะเมื่อ `Channel=desktop`; เมื่อเป็น `school_web` หรือ `staff_admin` ต้อง `DeviceJkt=null` และใช้ตัวตนจาก token ที่ตรวจแล้วตาม DES-012), `LegacyAdminId:T64?`, `SourceTokenExpiresAt:D?`; คอลัมน์ `CreateBy`/`UpdateBy` เป็น `I?` (`sId`/`sEmp` หลังเลือกโปรไฟล์ หรือ `null` ตอนออก unbound session/legacy admin ตาม [decisions-028](../requirement/decisions-028.md))

`SessionView={session_id:K,channel:SessionChannel,account_id:I?,school_id:S,profile:P?,legacy_admin:B,expires_at:D,update_date:D}` พร้อมส่ง header `ETag` (opaque string ของ `UpdateDate` ตาม [decisions-030](../requirement/decisions-030.md)); roles/สิทธิ์ไม่ cache เป็น authority ใน session ต้อง resolve ใหม่เสมอ

username/password ต้องไม่ว่าง; ไม่ trim/normalize password; username normalization รอ compatibility evidence (as-built: port web `Trim()` ทั้งสองฝั่ง, port mobile เทียบตรงตัว, ไม่ lowercase ทั้งคู่, ไม่ทราบ collation — [auth-evidence-001](auth-evidence-001.md))

| Endpoint `/v2` | ช่องทาง / สิทธิ์ | Input/ผล |
|---|---|---|
| POST /auth/login | desktop (มี active License + device proof) | `{school_id:S,username:T256,password:T1024}` → 201 `{access_token:T43,token_type:"Bearer",session:SessionView}` |
| POST /auth/web-sessions | school_web, staff_admin (DES-012) | header `JabjaiWebKey-*` + `{channel:"school_web"\|"staff_admin"}` → 201 `{access_token:T43,token_type:"Bearer",session:SessionView}` |
| GET /auth/session | ทุก channel | Bearer → 200 SessionView (+ ETag จาก `UpdateDate`) |
| PUT /auth/session | desktop | `{profile:P}` + If-Match (`ETag`) → 200 SessionView; bind ครั้งเดียว (`P=student` หรือ `employee`) |
| POST /auth/logout | ทุก channel | Bearer → 204; revoke session ปัจจุบัน |
| GET /me | desktop | Bearer → 200 `{account_id:I,display_name:T200,memberships:[{profile:P,roles:Role[]}]}` |
| GET /admin/teacher-grants | school_web (`school_admin`, fallback) | scope/pagination → grant list |
| POST /admin/teacher-grants | school_web (`school_admin`, fallback) | `{teacher_id,learner_id,mode,can_view,can_assess,valid_from,valid_until}` → 201 grant |
| DELETE /admin/teacher-grants/{id} | school_web (`school_admin`, fallback) | If-Match (`ETag`) → 200 `{id,deleted:true,update_date}` |

Teacher/Learner IDs เป็น `I` ตาม data-model; grant result คือ input + `id:K`/`update_date:D`; school/common fields เป็น server-managed. **หมายเหตุทางสำรอง (`SchoolBotTeacherGrant`)**: ตาราง `SchoolBotTeacherGrant` และ endpoints `/v2/admin/teacher-grants` เป็นทางสำรอง (conditional fallback) ซึ่ง**ยังไม่ได้ตัดสินให้สร้างและถอนออกจาก `db/schoolbot_db.sql` แล้ว**ตาม [decisions-026.md](../requirement/decisions-026.md) และ [db/review-005.md](../db/review-005.md)

Session/Grant PK และ grant path `{id}` ใช้ `K` ที่ web สร้าง; ไม่ใช้ token/device UUID เป็น PK. Login และ web-sessions คงข้อยกเว้น idempotency ด้านล่าง

## Permissions ตามช่องทางและบทบาท

| Actor | ช่องทาง Session | อนุญาต |
|---|---|---|
| Guest + License | desktop (local) | local projects/Labs/cached published lessons; ไม่มี Cloud identity |
| Student (`P=student`) | desktop | CRUD งานตน (`OwnerKind='student'`), ส่ง/อ่าน submission, ทำ quiz/test attempt และดูผลตนในโหมดเรียน/ทดลอง |
| Teacher บน Desktop (`P=employee`) | desktop | **ใช้เรียน/ทดลองและจัดการโครงงานทดลองของตน (`SchoolBotProject` ที่ `OwnerKind='employee'`) เท่านั้น** ไม่มีเมนูครู ไม่ตรวจงานนักเรียน และไม่ส่งคะแนนใน Desktop (decisions-022/025/026); ใน schema ปัจจุบันไม่อนุญาตให้ `P=employee` สร้างแถวใน `SchoolBotSubmission`/`SchoolBotAttempt` เพื่อป้องกันเลข `sEmp` ชนกับ `sId` นักเรียน (ทาง A ยืนยันแล้วตาม [decisions-032](../requirement/decisions-032.md); ห้ามผล Cloud ของ employee รวม Guest import ตาม [กฎผลเรียน](learning-rules-032-034.md)) |
| ครูรายวิชา (`P=employee`) | school_web (DES-012) | ดูความคืบหน้า, ตรวจภารกิจ Arm, ตั้งค่า `ScoringPolicy`/override/สอบซ่อม, ยืนยันเลื่อน Level ทั้งห้อง และ preview/ยืนยันส่งคะแนนเฉพาะวิชาที่ตนสอนใน `web-system` |
| ผู้ดูแลโรงเรียน (`IsAdmin=1`) | school_web (DES-012) | จัดการ `GradeSlot`/`ScoreMapping` (DES-008), เปิด/ปิด `CourseRun`, อ่านสถานะ export ของโรงเรียน (และจัดการ grant หากเปิดใช้ fallback) ใน `web-system` |
| พนักงานส่วนกลาง SchoolBright | staff_admin (DES-012) | `/v2/admin/*` ตาม `SchoolBotStaffRole` (`content_author`, `content_approver` แบบ four-eyes, `level_policy_admin`, `license_admin`, `release_publisher`, `dashboard_viewer`, `staff_admin`) |

ไม่ให้ครูเห็นทั้งโรงเรียนโดยปริยาย; administrative role (`school_admin` / `staff_admin`) ไม่ได้รับสิทธิ์อ่าน source นักเรียนหรือส่งคะแนนแทนครูรายวิชาอัตโนมัติ; session ที่ `Channel` ไม่ตรงกับ endpoint คืน `403 CHANNEL_NOT_ALLOWED`

**ข้อกำหนดการตรวจ License ตามช่องทาง (ยืนยันตาม decisions-025/026):**
1. **ช่อง `desktop` (`/v2/auth/login` และทุก private request ของ desktop)**: ต้องมี active `SchoolBotLicense` ของโรงเรียน **พร้อม device proof (`DeviceJkt`) ที่ผูกกับเครื่องนั้น** และ `school_id` ตรงกัน; web ตรวจ credential แล้วสร้าง session ผูก `SchoolId`/`DeviceJkt`
2. **ช่อง `school_web` (`/v2/auth/web-sessions` และทุก private request ของ `school_web` ตาม DES-012)**: **ต้องตรวจว่าโรงเรียนมี `SchoolBotLicense` ที่ active (ยังไม่หมดอายุและไม่ถูกเพิกถอน) เช่นกัน แต่ไม่ต้องมี device binding (`DeviceJkt=null`)** หากโรงเรียนไม่มี License ที่ active คืน `403 LICENSE_REQUIRED`
3. **ช่อง `staff_admin`**: ตรวจ `SchoolBotStaffRole` ที่ active ของพนักงานส่วนกลาง ไม่ผูกกับ License ของโรงเรียน

## State / invariants / failure

Desktop session lifecycle: `guest → authenticating → authenticated_unbound → authenticated → expired|signed_out`

`POST /v2/auth/login` ให้ unbound desktop session อายุ 5 นาที (`ProfileKind/ProfileId=null`, `CreateBy/UpdateBy=null`); ใช้ได้เฉพาะ `session`/`me`/`logout`. การ `PUT /v2/auth/session` เพื่อ bind ต้องเลือก `P` (`student` หรือ `employee`) ที่อยู่ใน `memberships` ที่ re-check ใหม่จาก School DB และ `school_id` ตรงกับ session; สำเร็จแล้วตั้ง `ExpiresAt = CreateDate + 8 ชั่วโมง`, `UpdateBy = ProfileId`, `UpdateDate = clock_timestamp()`; `kind/id` เปลี่ยนอีกไม่ได้ (`409 SESSION_ALREADY_BOUND`); bind ซ้ำ `P` เดิมคืนค่าเดิมหลังตรวจสิทธิ์/`If-Match` โดยไม่ต่ออายุ; เปลี่ยนโรงเรียนหรือเปลี่ยนโปรไฟล์ต้อง login ใหม่ (ส่วน `school_web` และ `staff_admin` ออก session ที่ resolve ตัวตนพร้อมใช้งานตั้งแต่ตอนแลกตาม DES-012)

`GET /auth/session` คืน `ETag` (จาก `UpdateDate`); `PUT /auth/session` ใช้ `If-Match`/`Idempotency-Key` ตามกฎกลาง (`UpdateDate` เป็น concurrency token ตาม [decisions-030](../requirement/decisions-030.md)); `SchoolBotSession` + `SchoolBotIdempotency` + `SchoolBotAuditEvent` commit ใน **SchoolBot DB** เดียว. `login` และ `web-sessions` ไม่ใช้ idempotency/cache raw response; timeout ให้ขอใหม่ session ที่ไม่ได้รับจะหมดอายุเอง. `logout` ไม่ต้อง `If-Match`/`Idempotency-Key`/License: revoke+audit ใน SchoolBot DB transaction เดียว คืน 204 แม้ token หาย/หมดอายุ/ถูกถอน; DB ล่มคืน 503 ไม่อ้างว่า revoke สำเร็จ

ไม่มี refresh token; token หมดอายุ/เครือข่ายล้มเหลวไม่เปลี่ยนเป็น Guest หรืออ้างว่าบันทึก Cloud สำเร็จ. Password อยู่ UI/host memory ชั่วคราว ส่ง HTTPS แล้วล้าง; ห้าม log/telemetry/local disk/OS store เก็บ password; Desktop host เก็บเฉพาะ token ใน OS credential store ไม่คืน token ให้ renderer. Response auth ใช้ `Cache-Control: no-store`; backend ห้ามบันทึก password/raw token รวมทั้งใน SQL/request logs

Logout บน Desktop ใช้ robot drain/close guard เดิม; ล้าง token/UI แม้ offline และแจ้งว่า revocation ยังไม่ยืนยัน (server expiry ยังมีผล)

ใช้ error envelope กลาง: `400 INVALID_INPUT`; `401 UNAUTHORIZED` แบบเดียวสำหรับ username/password ผิดหรือบัญชีปิด, token invalid/revoked; `401 SESSION_EXPIRED`; `403 PROFILE_REQUIRED` / `PROFILE_NOT_ALLOWED` / `CHANNEL_NOT_ALLOWED` / `LICENSE_REQUIRED` / `FORBIDDEN` / `SCHOOL_MISMATCH`; `409 SESSION_ALREADY_BOUND`; `412 VERSION_CONFLICT` (เมื่อ `UpdateDate` ไม่ตรง `If-Match`); `429 RATE_LIMITED` + `Retry-After` (จำกัดตาม school/account/source); `503 AUTH_NOT_CONFIGURED` เมื่อ compatibility ยังไม่พร้อมทั้งระบบ, `AUTH_UNAVAILABLE` เมื่อ DB หรือ gateway introspection ล่ม ไม่ใช้ sample login หรือเปิดสิทธิ์แทน; object ที่ไม่ควรรู้คืน `404`

**การตรวจซ้ำข้าม DB ก่อน Commit ([decisions-027](../requirement/decisions-027.md)):** เนื่องจาก `SchoolBotSession` อยู่บน SchoolBot DB ส่วนข้อมูลโปรไฟล์และสิทธิ์วิชาอยู่บน School DB จึงไม่มี transaction เดียวครอบข้าม DB; ทุก mutation ต้อง re-check สถานะโปรไฟล์/สิทธิ์ครูหรือผู้ดูแลจาก School DB และตรวจสถานะ session/License ใน SchoolBot DB ณ จุดก่อน commit เพื่อไม่ปล่อย in-flight commit ที่หมดสิทธิ์แล้ว

**การยุติ `/v1/admin` static bearer (ยืนยันตาม decisions-025 H8 และ decisions-026):** ย้าย admin API ทั้งหมดไป `/v2/admin/*` ที่ใช้ `staff_admin` session พร้อม `SchoolBotStaffRole` และ audit รายบุคคล แล้ว**ปิด `/v1/admin/*` static bearer**

## ทางเลือกและการตรวจ

ปัดตก PIN/ชื่อเมนูใน Desktop เป็นสิทธิ์, ปัดตกการแชร์เมนูครูไว้ใน Desktop, ปัดตกการให้ `school_web` ใช้งานได้โดยโรงเรียนไม่มี License active และปัดตกข้อเสนอที่เคยห้ามครู bind บน Desktop เลือก deny-by-default + แยก `Channel` ชัดเจน ทดสอบ cross-school IDs, โรงเรียนไม่มี License active เรียก `school_web` → `403 LICENSE_REQUIRED`, ครู login บน Desktop เข้าเรียน/ทดลองได้แต่เรียก endpoint ครู (`school_web`) ด้วย desktop token → `403 CHANNEL_NOT_ALLOWED`, ถอนสิทธิ์ขณะทำรายการ และ logout/login บัญชีใหม่ไม่รับ callback/ข้อมูลบัญชีเก่า ตาม AC-035-01, AC-038-03, AC-039-02/04

อ่าน canonical [กฎผลเรียน](learning-rules-032-034.md)

## Override Rev8 — reuse authentication เดิม

[gateway-login-reuse-001](gateway-login-reuse-001.md) มีลำดับเหนือข้อกำหนด integration seam เดิมที่บังคับ `LegacyCredentials.Verify` อ่าน Master DB/ตรวจ password เอง: ใช้ผล authentication จาก pipeline ของ G ผ่าน adapter ตาม actor; ไม่สร้าง SchoolBot verifier หรือคัดลอก hash. Desktop entrypoints ยังเป็น conditional candidates จนพิสูจน์ completion/device/identity และ wire contract ได้; ไม่อนุมาน remote API จาก local DI. คง LegacyDirectory/authorization, opaque session, Channel, License, DeviceJkt และ profile binding เดิม. HTTP 200/temporary/challenge ห้ามออก session แม้เป็น unbound; ส่วนที่ยังไม่พร้อมคืน `503 AUTH_NOT_CONFIGURED`.

## Override Rev9 — Desktop adapter ตามใบงาน034

[desktop-login-adapter-001.md](desktop-login-adapter-001.md) มี precedence เหนือ integration seam และข้อความ readiness ของ Rev8 เฉพาะ Desktop authentication: G ทำ credential/challenge; B ไม่ทำ hash/verifier ซ้ำ แต่ยังต้องพิสูจน์ AccountId/profile/tenant และ active authorization. ครูเลือก G web continuation; นักเรียนยังไม่เปิด mobile จนมี Desktop device lifecycle จริง. terminal_candidate ไม่ใช่ fully_authenticated และห้ามออก unbound session ก่อน admission ครบ.

สัญญานี้กำหนด DTO ภายใน ไม่เพิ่ม public continuation endpoint โดยปริยาย. /v2/auth/login เดิมยังไม่ใช่ implementation สำเร็จ; ข้อค้าง binding/identity และหลักฐานก่อนเปิดใช้ระบุใน [review packet](desktop-auth-review-packet-001.md). คง opaque session, License, Channel, DeviceJkt, profile binding และอายุเดิม; ไม่มี schema delta.

## Change Log
- 2026-10-23 — Rev9: ใบงาน034 ตรึง outcome/admission และเลือก teacher continuation; แยก core ที่ทดสอบได้จาก complete production slice ที่ยังขาด prerequisite
- 2026-10-23 — Rev8: ใบงาน032 แทนข้อบังคับ verifier อ่าน DB ด้วย reuse seam แบบมีเงื่อนไข; ไม่เปลี่ยน schema หรือเปิด gate
- 2026-10-23 — Rev7: เพิ่มลิงก์/ข้อเท็จจริง as-built ของ auth port ตาม auth-evidence-001; สัญญา/schema/มติไม่เปลี่ยน
- 2026-10-23 — Rev6: sync032..034/review-006; schemaเดิม
- 2026-10-23 — แก้พาธ `school-bot-v2` → `school-bot` ตาม [decisions-031](../requirement/decisions-031.md)
- 2026-10-22 — Rev5: sync ตาม `db/schoolbot_db.sql` และ `db/review-005.md` ภายใต้มติ decisions-027..030; ปรับ placement เป็น SchoolBot DB (10.0.0.128:9499) คู่กับการอ่าน Master/School DB ด้วยบัญชี DB เดิมและ re-check ก่อน commit; เปลี่ยน `version` เป็น `update_date` (`ETag`/`If-Match` จาก `UpdateDate`); ระบุชัดว่า `SchoolBotTeacherGrant` ยังไม่สร้างใน DDL และป้องกัน `sEmp` ครูชน `sId` นักเรียน
- 2026-10-22 — Rev4: sync baseline ตาม decisions-025/026 และ DES-012; เพิ่ม Session.Channel; บังคับตรวจ SchoolBot License active ทั้งช่อง desktop (พร้อม device binding) และช่อง school_web (ไม่ต้องมี device binding); เปิดให้ Desktop bind ได้ทั้ง student และ employee เพื่อเรียน/ลองเท่านั้น (ถอนข้อเสนอจำกัดเฉพาะ student); ย้ายงานครู/admin โรงเรียนไป school_web และงานส่วนกลางไป /v2/admin (staff_admin) พร้อมปิด /v1/admin
- 2026-10-21 — Rev3: Session/Grant K; account/profile I ไม่เปลี่ยน
- 2026-10-21 — Rev2: web auth APIs บนข้อมูลเดิม
- 2026-10-21 — Rev1: เสนอ identity ports และ least-privilege school authorization
