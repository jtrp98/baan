# Gateway–SchoolBot gRPC contract

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

สัญญานี้กำหนด Remote Procedure Call (RPC), Data Transfer Object (DTO), metadata และ HTTP mapping ระหว่าง HTTP API Gateway (`sb-api-gateway`) กับ SchoolBot gRPC service ใช้ unary RPC ตาม use case โดย local logout ใช้ controller/service แล้ว ส่วน operation อื่นยังเป็นข้อเสนอ. Browser ผ่าน same-origin Backend for Frontend (BFF).

## วิธีอ่าน

อ่านส่วนต่อด้านล่างตามลำดับ สัญญาและหลักฐานคง Rev เดียวกัน ทุกตารางและเงื่อนไขเดิมอยู่ในส่วนต่อ.

1. [2. RPC และ HTTP mapping](gateway-grpc-contract-001-contract.md)
2. [3. Identity และ tenant boundary](gateway-grpc-contract-001-validation.md)
3. [4. Login routing และ admission](gateway-grpc-contract-001-outcomes.md)
4. [5. Error mapping](gateway-grpc-contract-001-acceptance.md)
5. [6. Deadline, limits และ private exposure](gateway-grpc-contract-001-evidence.md)
6. [7. Review packet และการตัดสินใจ](gateway-grpc-contract-001-details.md)
7. [7. Review packet และการตัดสินใจ](gateway-grpc-contract-001-limits.md)
