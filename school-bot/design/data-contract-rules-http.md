# HTTP contract ที่ใช้ร่วมกัน

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](data-contract-rules.md)

## HTTP contract ร่วม

HTTP paths/JSON/status/headers ด้านล่างและใน [DES-002 (License และ device binding)](des-002.md), [DES-003 (หลายโครงงาน Local/Cloud)](des-003.md), [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md), [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](des-005.md), [DES-007 (Release และ trusted update)](des-007.md), [DES-008 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](des-008.md), [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](des-009.md), [DES-010 (Question Bank, Attempt และนโยบายคะแนน)](des-010.md), [DES-011 (ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง)](des-011.md), [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md) เป็น client-facing semantics ผ่าน HTTP API Gateway (`sb-api-gateway`); HTTP API Gateway ไปยัง SchoolBot gRPC service ใช้ gRPC ตาม [Gateway Rev3](gateway-integration-001.md). ยังไม่มี RPC/metadata/error mapping ที่ยืนยัน; ไม่แปลง HTTP status เป็น gRPC status โดยตรง. คง ETag/If-Match, idempotency และ device proof เดิม; การรักษา canonical method/path/body ข้าม HTTP API Gateway ต้องออกแบบก่อน implement. Login HTTP เดิมของ HTTP API Gateway (`sb-api-gateway`) และ local IPC/hardware ไม่เปลี่ยน.

ผลสำเร็จตามแต่ละ DES; failures:
`{error:{code:T64,message:T512,request_id:U,details:{field:T128?,current_etag:T64?,retry_after_seconds:integer≥0?,resource_id:K?}?}}`

| HTTP | Codes |
|---|---|
| 400 | INVALID_REQUEST, INVALID_INPUT, INVALID_QUERY |
| 401 / 403 | UNAUTHORIZED, SESSION_EXPIRED / FORBIDDEN, SCHOOL_MISMATCH, CHANNEL_NOT_ALLOWED, PROFILE_NOT_ALLOWED, SCHOOL_ADMIN_REQUIRED, SUBJECT_PERMISSION_REQUIRED, STAFF_ROLE_REQUIRED, ORIGIN_NOT_ALLOWED, LICENSE_REQUIRED |
| 404 / 405 | NOT_FOUND / METHOD_NOT_ALLOWED |
| 409 | IDEMPOTENCY_CONFLICT, IDEMPOTENCY_EXPIRED, STATE_CONFLICT |
| 412 / 428 | VERSION_CONFLICT / PRECONDITION_REQUIRED |
| 413 / 415 | PAYLOAD_TOO_LARGE / UNSUPPORTED_MEDIA_TYPE |
| 426 / 429 | UPGRADE_REQUIRED / RATE_LIMITED |
| 500 / 503 | INTERNAL_ERROR / SERVICE_UNAVAILABLE, ADMIN_NOT_CONFIGURED, AUTH_NOT_CONFIGURED, AUTH_UNAVAILABLE |

Domain codes จาก [DES-001 (Desktop host และ Inter-Process Communication (IPC))](des-001.md), DES-002, DES-003, DES-004, DES-005, [DES-006 (หุ่นจริง Windows/macOS)](des-006.md), DES-007, DES-008, DES-009, DES-010, DES-011, DES-012 ใช้ envelope เดียวกัน Unknown fields/duplicate JSON keys ถูกปฏิเสธ; ห้ามตัดสินจาก message. Requests มี `X-Request-Id:U`; mutation มี `Idempotency-Key:U` (ยกเว้น login/web-sessions/logout ตาม DES-004 และ DES-012).

**Optimistic Concurrency ด้วย `UpdateDate` (ยืนยันตาม [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md)):**
- ไม่มีคอลัมน์ `Version` ในตาราง SchoolBot; server ส่ง header `ETag` (และฟิลด์ `update_date:D` ใน body) โดยค่า `ETag` เป็น opaque string ที่เข้ารหัสจาก `UpdateDate` ความละเอียดระดับ microsecond ของ `timestamptz`
- ทุกคำสั่งแก้ไขแถวเดิมต้องส่ง header `If-Match: "<ETag>"` (ขาด header คืน `428 PRECONDITION_REQUIRED`); client **ห้าม parse ค่า ETag เป็นวันที่** (เช่น `new Date()` ของ JS ที่ตัดความละเอียดเหลือ millisecond)
- Server ทำ `UPDATE ... SET ..., "UpdateDate" = clock_timestamp() WHERE "SchoolBot<Entity>Id" = @id AND "UpdateDate" = @expected` (ห้ามใช้ `now()` เพื่อให้การแก้ซ้ำใน transaction เดียวได้ค่าใหม่เสมอ และห้ามรับ `UpdateDate` จาก client); หากได้ 0 แถว คืน `412 VERSION_CONFLICT` พร้อม `details.current_etag`

SchoolBot ไม่ส่ง `Access-Control-Allow-*` (ไม่เปิด CORS); request ที่มี header `Origin` นอก allow-list คืน `403 ORIGIN_NOT_ALLOWED`. ปิด `/v1/admin/*` static bearer และใช้ `/v2/admin/*` ด้วย `staff_admin` session ตาม [มติ 025 ( auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../requirement/decisions-025.md) และ [มติ 026 (อนุมัติแบบข้อมูลที่ปรับใหม่)](../requirement/decisions-026.md).

SchoolBot resource IDs ใช้ `K`; legacy ใช้ `I`; logical keys ใช้ `U`. JSON `K` รับ integer เท่านั้น; path/query ใช้ canonical decimal; ผิดชนิด/ช่วงคืน `400 INVALID_INPUT`. `IDEMPOTENCY_EXPIRED` คืน `error.details.resource_id:K?` เมื่อเปิดเผยได้.

List: `limit` 1–100 ค่าเริ่ม 50, `cursor` opaque; คืน `{items:[],next_cursor:string|null}` โดย cursor ผูก actor/school/filter.

Control body ≤64 KiB; project/submission/curriculum/question-bank body ≤2 MiB และ project document ≤1 MiB; response ≤2 MiB ต้องรักษาขอบเขตที่ client/HTTP API Gateway และ SchoolBot gRPC service; gRPC message limits และ mapping ยัง design pending ไม่เท่ากับขนาด JSON โดยอัตโนมัติ และไม่ยก limit ของ engine ตาม HTTP.

