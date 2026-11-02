# Logout negative boundary

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## ส่วนต่อของสัญญา

- [Validator และข้อจำกัด](gateway-logout-negative-boundary-001-validation.md)

HTTP API Gateway entry ปัจจุบันคือ SchoolBotAuthController → SchoolBotLogoutService ตาม [controller entry Rev2](gateway-controller-entry-001.md); direct invocation ฝั่ง HTTP API Gateway ใช้ controller/service ไม่ใช่ middleware.

คำว่า adapter ที่ถูกเรียกโดยตรง ในย่อหน้าหลัง error table อยู่ในบริบทการเรียก adapter โดยตรงเพื่ออธิบายการแข่งขัน context cancellation กับ timer ฝั่ง SchoolBot gRPC service ไม่ใช่ชื่อ HTTP API Gateway entry. กฎ branch ของ context cancellation ชนะเมื่อทั้งสอง signal พร้อมกันคงเดิม และ transport ยังอาจจบก่อนตอบ; ห้ามเปลี่ยนกฎนี้เป็นกฎของ controller HTTP API Gateway จากการแก้คำเรียก. รอบเอกสารนี้ไม่ได้ตรวจ SchoolBot gRPC service adapter ซ้ำ จึงไม่อ้างหลักฐาน runtime ใหม่ของ SchoolBot gRPC service.

ผลตรวจภายหลังอ้างหลักฐานท้ายไฟล์ กฎ error pairs, validation order, metadata accounting, UUID correlation, trace/lang และ runtime/H5 (เงื่อนไข listener/TLS/peer/private ingress และ trust ระหว่างระบบ) limitations คงเดิม.

ส่วนชี้แจงของ [logout packet](gateway-logout-slice-001.md)/[gRPC Rev1](gateway-grpc-contract-001.md) ไม่เพิ่ม publiccode/field/proto หรือ human gate. สัญญารวมมีหลาย code แต่ localsubset ใช้เฉพาะ pair ของ packet. Peer ที่ผ่านแล้วแต่ส่ง metadata ผิดเป็นความผิดพลาดของสัญญาภายใน Gateway–SchoolBot ไม่ตีความเป็นความผิดผู้ใช้.

## Error table

คู่ trailers คือ sb-error-bin หนึ่ง+schoolbot-error-bin หนึ่ง ชนิด/ข้อความ/code สอดคล้องเดิม. R=UUID-D36nonempty เพียงหนึ่งค่า ใช้ UUID เดิม canonicalD (ไม่บังคับ version); L=หาย/ผิด/ซ้ำสร้าง UUID ใหม่สำหรับ error นี้ ไม่เลือกค่าตัวแรก. quota0=ไม่เรียก AttemptSource/AttemptWork; store0=ไม่เรียก store.

| กรณี | status/code | trailers/correlation | งาน/ผลที่ HTTP API Gateway รับได้ |
|---|---|---|---|
| Peer ไม่ผ่านแม้ tokenabsent | Unauthenticated/ไม่มี semantic | ไม่มี semantictrailers ไม่เชื่อ UUID | store0/quota0; Gateway HTTP 502 ไม่ domain401 |
| Metadata ที่ไม่รู้จัก/ผิดชนิด/ผิดรูปแบบ/ซ้ำ/forbiddenidentity หรือ forwarded | Internal/INTERNAL_ERROR | คู่/R หรือ L | store0/quota0; R ตรง outbound→500v2 มิฉะนั้น 502 |
| x-caller หาย/ผิด ordinal api-gateway; UUID ผิด/ซ้ำ; trace/lang ผิด; metadata>16384 | Internal/INTERNAL_ERROR | คู่/R หรือ L; UUID ผิดใช้ L | store0/quota0; HTTP API Gateway ห้ามนำ SchoolBot gRPC service ใหม่มาแทน outboundUUID |
| Metadata ผ่านแต่ Origin ไม่อยู่ allowlist/ยังไม่มี allowlist | PermissionDenied/ORIGIN_NOT_ALLOWED | คู่/R | store0/quota0; Gateway HTTP 403v2/noCORS |
| Peer/metadata/Origin ผ่านแต่ tokenabsent/malformed/JWT | OK/Empty | ไม่มี semanticerrors | store0/quota0 แม้ quota เต็ม;204body0 |
| token รูป canonical แต่ limiterdeny | ResourceExhausted/RATE_LIMITED | คู่/R | store0;429/validatedRetryAfter เท่านั้น |
| AuthenticationUnavailableException | Unavailable/AUTH_UNAVAILABLE | คู่/R |503;คืน work permit เมื่องานจบ |
| exception ที่ไม่คาดหมาย รวม OCE ที่ไม่มี cancel signal | Internal/INTERNAL_ERROR | คู่/R |500sanitized ไม่อ้าง store0/rollback |
| linked deadline หมดก่อน contextcancel | DeadlineExceeded/ไม่มี semantic | ไม่มี semantictrailers | Gateway outer deadline→504; upstreamfailure ก่อน outer→502 |
| context cancellation แล้วงานโยน cancellation | Cancelled/ไม่มี semantic | ไม่มี semantictrailers | disconnect ไม่เขียน response ใหม่; Gateway deadline504/อื่น 502 |

ถ้า contextcancel และ timer พร้อมกัน branch ของ context cancellation ชนะใน adapter ที่ถูกเรียกโดยตรง; transport อาจจบก่อนตอบ. AUTH_NOT_CONFIGURED คู่ Unavailable ยังอนุญาตเฉพาะ config จริง ไม่ใช้แทน badmetadata. ข้อความ internal คง `The request failed.`/`คำขอล้มเหลว` ไม่สะท้อน key/value/token/exception ไม่เพิ่ม details.
