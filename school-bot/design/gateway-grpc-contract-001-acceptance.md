# Gateway–SchoolBot gRPC contract — 5. Error mapping

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) ส่วนนี้อธิบาย5. Error mapping อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

แยก keys ตาม evidence002:
- AccountId คือ Master Tusers.SId; SchoolId คือ NCompany ที่ตรวจแล้ว.
- student candidate: School Tusers.SId+SchoolId จาก master SId; ต้องตรวจ active และ cardinality ไม่ใช่ถือ ID เท่ากันว่า join ผ่าน.
- employee candidate: Temployees.SEmp+SchoolId จาก NSystemId; web WorkStatus ใช้ SId, token ใช้ NSystemId??SId, 2FA ใช้ NSystemId>1 มิฉะนั้น SId. ทั้งสามไม่เท่ากันโดยอัตโนมัติ.
- เสนอ canonical employee linkage จาก server mapping ที่พิสูจน์แล้วเท่านั้น; ไม่ยอมรับ SId fallback เพียงเพราะมีค่า. ต้อง reconcile account/profile ที่ status/token/2FA ใช้ให้ตรงกัน; sentinel/null/หลาย profile ยังรอ sb-api-gateway/legacy/vault พิสูจน์. ไม่มี schema proposal ในรอบนี้.

เสนอ diagnostic codes ภายในใหม่: `AUTH_PROFILE_MISSING`, `AUTH_ACCOUNT_CARDINALITY`, `AUTH_PROFILE_CARDINALITY`. ทั้งหมดห้ามออก session; outward คง503 AUTH_NOT_CONFIGURED สำหรับ linkage ที่ยังไม่ยืนยัน ไม่เผยจำนวนบัญชี/profile. missing/deleted account หรือ credential ผิด→401 UNAUTHORIZED; unknown category→503 AUTH_NOT_CONFIGURED. การเปิด codes ใหม่เป็น public API ต้องให้ owner รับรองก่อน ไม่แก้ rules Rev7 เอง.

กฎ admission และอายุ session ของต้นฉบับที่ยังต้องตรวจความสอดคล้องอยู่ในหัวข้อยังไม่ยืนยันท้ายเอกสาร.

Login RPC ระบุเฉพาะ successful terminal contract; public pending/continuation ยังไม่ถูกตรึง จึงยังไม่พร้อมเปิด Login end-to-end. ห้ามแปลง pending เป็น401/201 เพื่อปิดช่องว่างนี้.

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
