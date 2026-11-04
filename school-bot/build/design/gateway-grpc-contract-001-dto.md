# Gateway–SchoolBot — DTO และ presence ปัจจุบัน

> Rev 4 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

Proto Common/Project/License/Curriculum/Assessment/Release เป็น wire contract; DTO ของ Gateway อยู่ Application/DTOs/ServiceSchoolBot Repositoryทั้งห้า map typed request/reply ไม่มี session DTO/RPC ใน current proto

SchoolBotJson ใช้ Web defaults, SnakeCaseLower, Disallow unknown members และ required/nullability checks; บาง operation รับ raw body เช่น device licensing/question bank เพื่อรักษา validation semantics โดย Assessment แยก not-json/null/malformed/duplicate-property/valid และส่ง body state ต่อ gRPC ไม่ถือว่า raw body เป็น generic transport proxy

ETag/If-Match, Idempotency-Key, optional presence, paging cursors, enums, bytes และ ErrorDetails ต้อง map ตาม proto/requestของแต่ละ method ไม่เดาค่า defaultแทน absent การตรวจ roundtrip/sizeทุกกรณีบนระบบจริงยังไม่ครบ ดู [RPC inventory](gateway-grpc-contract-001.md), [limits](gateway-grpc-contract-001-limits.md) และ [ผลตรวจ](gateway-integration-evidence.md)

## หลักฐาน

Gateway Application/DTOs/ServiceSchoolBot, Controllers/ServiceSchoolBot/AssessmentsController.cs, Infrastructure/Repositories/Services/ServiceSchoolBot และ protoทั้งสองฝั่งที่ hashตรง6/6 ตรวจ2026-11-04
