# Gateway–SchoolBot gRPC contract — Deadline, limits และ private exposure

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) อธิบาย Deadline, limits และ private exposure.

## เอกสารอ้างอิง

[DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)

## 6. Deadline, limits และ private exposure

ตัวเลขต่อไปเป็นข้อเสนอ ไม่ใช่ deployed SLA:

| Class | Total deadline | Retry |
|---|---|---|
| Query: GetSession/GetMe | 5s | Unavailable ที่ไม่มี domain trailer สูงสุดอีก 2 ครั้ง 100/300ms ภายใน deadline เดิม |
| Mutation: Logout/BindProfile/RevokeSessions | 15s | ไม่ auto-retry แม้มี Idempotency-Key |
| Auth: Login/ExchangeWebSession | 15s | ไม่ auto-retry |
| SchoolBot gRPC service→HTTP API Gateway credential/continuation | ไม่เกิน 10s และเวลาที่เหลือ | ไม่ retry |
| SchoolBot gRPC service→private HTTP API Gateway introspection | ไม่เกิน 3s และเวลาที่เหลือ | ไม่ retry |

ส่ง absolute deadline/cancellation ถึง application/store; child deadline=min(class cap,parent remaining). HTTP API Gateway interceptor เดิมผูก RequestAborted เฉพาะเมื่อ caller ไม่มี token จึงต้อง linked cancellation เมื่อมี token อยู่แล้ว. ControlPlane override ห้ามขยายเกิน class cap นี้โดยเงียบ. Query retry ต้องตรวจทั้ง RPC class และ HTTP verb; domain AUTH_UNAVAILABLE ไม่ retry เพียงเพราะเป็น Unavailable. ไม่อ้าง rollback เมื่อ timeout หลัง commit.

HTTP control body64KiB, large document body2MiB/project document1MiB, response2MiB ตาม rules. เสนอ protobuf send/receive cap4MiB ทั้ง sb-api-gateway/SchoolBot gRPC service และตรวจ DTO/JSON limits ซ้ำ; overhead/proof body ไม่เพิ่มเพดาน HTTP. จำกัด metadata รวม 16KiB แยกจาก message; credential อยู่ใน DTO สำหรับ exchange. ก่อนเปิดใช้ต้องตรวจขนาด worst-case serialized protobuf/JSON; ไม่สืบทอด 16MiB ของ HTTP API Gateway เป็นสิทธิ์เพิ่ม payload. Request oversized→413; response เกินหรือเสีย→502; ไม่ใช้ compression ข้าม limit.

Private web-principal ยังคง `GET /api/school-bot/auth/web-principal` ที่ HTTP API Gateway ตาม DES-012 §2 ไม่ใช่ RPC ของ SchoolBot gRPC service และไม่เพิ่ม public alias. Request มี service-peer authentication แยกจาก legacy credential; scheme JabjaiWebLegacy เท่านั้น, reject purpose/aud legacy-handoff. Response200 `{school_id:int32,user_id:int32|null,admin_id:string≤64|null,is_admin:bool,user_type:string≤16|null,expires_at:UTC|null}`; exp=null เฉพาะนโยบายเว็บเดิม. invalid credential401, mapping ไม่พร้อม 503 AUTH_NOT_CONFIGURED, dependency ล้มเหลว 503 AUTH_UNAVAILABLE; SchoolBot gRPC service normalize โดยไม่ parse message.

Private route/listener ต้องรับเฉพาะ SchoolBot gRPC service workload และ public ingress/Backend for Frontend (BFF) ต้องเข้าไม่ถึง แม้ชื่อ path ถูกต้อง; SchoolBot gRPC service upstream ห้ามชี้กลับ Q. HTTP API Gateway private lookup ห้ามเรียก SchoolBot gRPC service exchange วนกลับ. ตำแหน่ง listener/network/TLS/identity และ rate limits **รอ H5 (เงื่อนไข listener/TLS/peer/private ingress และ trust ระหว่างระบบ)**; no-store และไม่ log credential ทุก hop.
