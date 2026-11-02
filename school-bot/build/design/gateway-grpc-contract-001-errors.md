# Gateway–SchoolBot gRPC contract — Error mapping

> Rev 3 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 052 — อายุ Desktop session นับจากเวลา bind)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) อธิบาย Error mapping.

## 5. Error mapping

เลือก RpcException สำหรับ failure และ mapping เฉพาะ route Q; สำหรับ logout SchoolBotLogoutService รับ RpcException และ SchoolBotTrailerValidator ตรวจ peer/status/code/correlation ก่อนสร้าง HTTP response ไม่ใช้ global exception middleware และ controller ไม่ catch กลืน exception. HTTP validation ของ logout อยู่ใน controller/service ก่อน RPC ข้อ 415/JSON validation ของ operation อื่นไม่ทำให้ logout parse JSON body. ใช้ sb-error-bin มาตรฐาน HTTP API Gateway พร้อม companion trailer `schoolbot-error-bin` สำหรับ v2 semantic fields เพื่อไม่เปลี่ยน protobuf ของ service อื่น.

เสนอ `SchoolBotError{string code,string message,string request_id,optional ErrorDetails details}`; bounds code64/message512/request_id UUID. `ErrorDetails{optional string field,optional string current_etag,optional int32 retry_after_seconds,optional int32 resource_id}`; field≤128/etag≤64/retry≥0/resource>0. ไม่มี StackTrace, raw upstream results หรือ credential. จำกัด companion trailer8KiB; schema/serializer และ compatibility ของ sb-error-bin ต้องตรวจจริงก่อน codegen.

HTTP API Gateway ยอมรับเฉพาะ trailer จาก authenticated SchoolBot gRPC service peer, parse ผ่าน, code อยู่ allowlist และคู่ code/status ตรงตาราง; สร้าง HTTP `{error:{code,message,request_id,details?}}` ตาม rules Rev7. ไม่ห่อซ้ำใน results. ห้ามเชื่อ http_status ที่ upstream ส่งตามอำเภอใจ.

| gRPC + semantic code จาก SchoolBot gRPC service | HTTP |
|---|---|
| OK | ตาม success table; Logout→204 |
| InvalidArgument + INVALID_REQUEST/INVALID_INPUT/INVALID_QUERY | 400 |
| Unauthenticated + UNAUTHORIZED/SESSION_EXPIRED | 401 |
| PermissionDenied + codes403 ใน rules รวม STAFF_ROLE_REQUIRED/LICENSE_REQUIRED | 403 |
| NotFound + NOT_FOUND | 404 |
| AlreadyExists/Aborted + conflict codes409 | 409 |
| FailedPrecondition + VERSION_CONFLICT/PRECONDITION_REQUIRED/UPGRADE_REQUIRED | 412/428/426 ตาม code |
| ResourceExhausted + PAYLOAD_TOO_LARGE/RATE_LIMITED | 413/429 ตาม code |
| Internal + INTERNAL_ERROR | 500 |
| Unavailable + AUTH_NOT_CONFIGURED/AUTH_UNAVAILABLE/SERVICE_UNAVAILABLE/ADMIN_NOT_CONFIGURED | 503 |

405/415/JSON validation เกิดที่ HTTP adapter ก่อน RPC; ใช้ v2 codes เดิม. Retry-After รับเฉพาะจำนวนที่ผ่าน validation. ไม่มี trailer หรือคู่ status/code ขัดกัน ห้ามเดา semantic code จาก message.

แยก HTTP API Gateway failures: connection/protocol/invalid SchoolBot gRPC service reply→502; deadline ก่อนรับผล→504; maintenance/service disabled/config ไม่พร้อม/circuit open→503. ใช้ HTTP API Gateway envelope `{code:<HTTP integer>,message,messageTh,requestId,results:null}` แบบ sanitized. กรณี Unavailable ไม่มี SchoolBot gRPC service trailer ต้องมี local evidence แยก circuit/config จาก upstream failure; ยังต้องปรับ mapper เพราะ HTTP API Gateway ปัจจุบันให้ 503 ทั้งหมด. DeadlineExceeded ปัจจุบัน 408 ต้องปรับเฉพาะ Q หลัง Light (ผู้ทบทวน implementation ของ Gateway) review.

SchoolBot gRPC service เรียก introspection timeout/ล้มเหลว→SchoolBot gRPC service trailer AUTH_UNAVAILABLE→503 ไม่ใช่ 504 ถ้า SchoolBot gRPC service ตอบได้ก่อน outer deadline. หาก HTTP API Gateway หมดเวลาก่อนรับ SchoolBot gRPC service ให้ 504 และผล mutation ไม่ทราบ. Client disconnect ส่ง cancellation และไม่พยายามเขียน response ใหม่; ไม่แปลงเป็น success. ปิด exception detail ทั้ง Development บน Q และ redact logs ไม่ให้ข้อความ/StackTrace ของ upstream รั่ว.
