# Gateway–SchoolBot gRPC contract — 6. Deadline, limits และ private exposure

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) ส่วนนี้อธิบาย6. Deadline, limits และ private exposure อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)

แยก HTTP API Gateway failures: connection/protocol/invalid SchoolBot gRPC service reply→502; deadline ก่อนรับผล→504; maintenance/service disabled/config ไม่พร้อม/circuit open→503. ใช้ HTTP API Gateway envelope `{code:<HTTP integer>,message,messageTh,requestId,results:null}` แบบ sanitized. กรณี Unavailable ไม่มี SchoolBot gRPC service trailer ต้องมี local evidence แยก circuit/config จาก upstream failure; ยังต้องปรับ mapper เพราะ HTTP API Gateway ปัจจุบันให้503ทั้งหมด. DeadlineExceeded ปัจจุบัน408 ต้องปรับเฉพาะ Q หลัง Light review.

SchoolBot gRPC service เรียก introspection timeout/ล้มเหลว→SchoolBot gRPC service trailer AUTH_UNAVAILABLE→503 ไม่ใช่504 ถ้า SchoolBot gRPC service ตอบได้ก่อน outer deadline. หาก HTTP API Gateway หมดเวลาก่อนรับ SchoolBot gRPC service ให้504 และผล mutation ไม่ทราบ. Client disconnect ส่ง cancellation และไม่พยายามเขียน response ใหม่; ไม่แปลงเป็น success. ปิด exception detail ทั้ง Development บน Q และ redact logs ไม่ให้ข้อความ/StackTrace ของ upstream รั่ว.

## 6. Deadline, limits และ private exposure

ตัวเลขต่อไปเป็นข้อเสนอ ไม่ใช่ deployed SLA:

| Class | Total deadline | Retry |
|---|---|---|
| Query: GetSession/GetMe | 5s | Unavailable ที่ไม่มี domain trailer สูงสุดอีก2ครั้ง 100/300ms ภายใน deadlineเดิม |
| Mutation: Logout/BindProfile/RevokeSessions | 15s | ไม่ auto-retry แม้มี Idempotency-Key |
| Auth: Login/ExchangeWebSession | 15s | ไม่ auto-retry |
| SchoolBot gRPC service→HTTP API Gateway credential/continuation | ไม่เกิน10s และเวลาที่เหลือ | ไม่ retry |
| SchoolBot gRPC service→private HTTP API Gateway introspection | ไม่เกิน3s และเวลาที่เหลือ | ไม่ retry |

ส่ง absolute deadline/cancellation ถึง application/store; child deadline=min(class cap,parent remaining). HTTP API Gateway interceptor เดิมผูก RequestAborted เฉพาะเมื่อ caller ไม่มี token จึงต้อง linked cancellation เมื่อมี token อยู่แล้ว. ControlPlane override ห้ามขยายเกิน class cap นี้โดยเงียบ. Query retry ต้องตรวจทั้ง RPC class และ HTTP verb; domain AUTH_UNAVAILABLE ไม่ retry เพียงเพราะเป็น Unavailable. ไม่อ้าง rollback เมื่อ timeout หลัง commit.

HTTP control body64KiB, large document body2MiB/project document1MiB, response2MiB ตาม rules. เสนอ protobuf send/receive cap4MiB ทั้ง sb-api-gateway/SchoolBot gRPC service และตรวจ DTO/JSON limits ซ้ำ; overhead/proof body ไม่เพิ่มเพดาน HTTP. จำกัด metadataรวม16KiBแยกจาก message; credential อยู่ใน DTO สำหรับ exchange. ก่อนเปิดใช้ต้องตรวจขนาด worst-case serialized protobuf/JSON; ไม่สืบทอด16MiBของ HTTP API Gateway เป็นสิทธิ์เพิ่ม payload. Request oversized→413; responseเกินหรือเสีย→502; ไม่ใช้ compression ข้าม limit.

Private web-principal ยังคง `GET /api/school-bot/auth/web-principal` ที่ HTTP API Gateway ตาม DES-012 §2 ไม่ใช่ RPC ของ SchoolBot gRPC service และไม่เพิ่ม public alias. Request มี service-peer authentication แยกจาก legacy credential; scheme JabjaiWebLegacy เท่านั้น, reject purpose/aud legacy-handoff. Response200 `{school_id:int32,user_id:int32|null,admin_id:string≤64|null,is_admin:bool,user_type:string≤16|null,expires_at:UTC|null}`; exp=null เฉพาะนโยบายเว็บเดิม. invalid credential401, mappingไม่พร้อม503 AUTH_NOT_CONFIGURED, dependencyล้มเหลว503 AUTH_UNAVAILABLE; SchoolBot gRPC service normalize โดยไม่ parse message.

Private route/listener ต้องรับเฉพาะ SchoolBot gRPC service workload และ public ingress/BFF ต้องเข้าไม่ถึง แม้ชื่อ path ถูกต้อง; SchoolBot gRPC service upstream ห้ามชี้กลับ Q. HTTP API Gateway private lookup ห้ามเรียก SchoolBot gRPC service exchange วนกลับ. ตำแหน่ง listener/network/TLS/identity และ rate limits **รอ H5**; no-store และไม่ log credential ทุก hop.
