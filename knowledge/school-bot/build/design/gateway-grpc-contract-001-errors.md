# Gateway–SchoolBot — status, trailers และ HTTP response

> Rev 4 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

SchoolBotGrpcRunner แปลง domain/business failure เป็น gRPC status พร้อม `sb-error-bin` และ HTTP status metadata; Gateway repository จับ RpcException เป็น SchoolBotUpstreamException โดยเก็บทั้ง binary/non-binary trailers แล้ว SchoolBotTrailerValidationAdapter/SchoolBotTrailerValidator ตรวจคู่ status/code, requestId และ peer trust ก่อนคืน business error

| HTTP ของ business error | gRPC status |
|---|---|
| 400/415 | InvalidArgument |
| 401 / 403 / 404 | Unauthenticated / PermissionDenied / NotFound |
| 409 | Aborted |
| 412/428 | FailedPrecondition |
| 413/429 | ResourceExhausted |
| 503 | Unavailable |
| 500 ขึ้นไปที่เหลือ | Internal |

Domain response ใช้ `{error:{code,message,request_id,details?}}` ตาม endpoint.V2Envelope แม้ public URL ไม่มี v2; คืน current_etag/retry_after_seconds และรายละเอียดที่ผ่าน validator ไม่ใช้เลข gRPC status แทน HTTP โดยตรง Success ส่ง status/body/ETag ตาม controller และ Cache-Control:no-store/X-Request-Id

transport ไม่ configured/client absent→503; peer ไม่น่าเชื่อถือ, trailer malformed หรือ status/code ไม่ตรง→502; deadline→504 ใช้ Gateway envelope `{code,message,messageTh,requestId,errors,results}`; client abort หยุดตอบ ไม่รั่ว raw upstream exception ผู้เรียกต้องแยก domain envelope กับ Gateway transport envelope

## หลักฐาน

SchoolBot API GrpcServices/SchoolBotGrpcRunner.cs และ SchoolBotGrpcMetadata.cs; Gateway SchoolBotGrpcCalls.cs, SchoolBotGrpcChannel.cs, SchoolBotHttpPipeline.cs และ SchoolBotTrailerValidator.cs ตรวจ 2026-11-04; [ผลตรวจและข้อจำกัด](gateway-integration-evidence.md)
