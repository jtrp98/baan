# Logout negative boundary — Error table

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Logout negative boundary](gateway-logout-negative-boundary-001.md) ส่วนนี้อธิบายError table อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

HTTP API Gateway entry ปัจจุบันคือ SchoolBotAuthController → SchoolBotLogoutService ตาม [controller entry Rev2](gateway-controller-entry-001.md); direct invocation ฝั่ง HTTP API Gateway ใช้ controller/service ไม่ใช่ middleware.

คำว่า adapter ที่ถูกเรียกโดยตรง ในย่อหน้าหลัง error table อยู่ในบริบทการเรียก adapter โดยตรงเพื่ออธิบายการแข่งขัน context cancellation กับ timer ฝั่ง SchoolBot gRPC service ไม่ใช่ชื่อ HTTP API Gateway entry. กฎ branch ของ context cancellation ชนะเมื่อทั้งสอง signal พร้อมกันคงเดิม และ transport ยังอาจจบก่อนตอบ; ห้ามเปลี่ยนกฎนี้เป็นกฎของ controller HTTP API Gateway จากการแก้คำเรียก. รอบเอกสารนี้ไม่ได้ตรวจ SchoolBot gRPC service adapter ซ้ำ จึงไม่อ้างหลักฐาน runtime ใหม่ของ SchoolBot gRPC service.

ผลตรวจภายหลังอ้างหลักฐานท้ายไฟล์ กฎ error pairs, validation order, metadata accounting, UUID correlation, trace/lang และ runtime/H5 limitations คงเดิม.

ส่วนชี้แจงของ [logout packet](gateway-logout-slice-001.md)/[gRPC Rev1](gateway-grpc-contract-001.md) ไม่เพิ่มpubliccode/field/protoหรือhuman gate. สัญญารวมมีหลายcodeแต่localsubsetใช้เฉพาะpairของpacket. Peerที่ผ่านแล้วแต่ส่งmetadataผิดเป็นความผิดพลาดของสัญญาภายใน Gateway–SchoolBot ไม่ตีความเป็นความผิดผู้ใช้.

## Error table

คู่trailersคือsb-error-binหนึ่ง+schoolbot-error-binหนึ่ง ชนิด/ข้อความ/codeสอดคล้องเดิม. R=UUID-D36nonemptyเพียงหนึ่งค่า ใช้UUIDเดิมcanonicalD (ไม่บังคับversion); L=หาย/ผิด/ซ้ำสร้างUUIDใหม่สำหรับerrorนี้ ไม่เลือกค่าตัวแรก. quota0=ไม่เรียกAttemptSource/AttemptWork; store0=ไม่เรียกstore.

| กรณี | status/code | trailers/correlation | งาน/ผลที่HTTP API Gatewayรับได้ |
|---|---|---|---|
| Peerไม่ผ่านแม้tokenabsent | Unauthenticated/ไม่มีsemantic | ไม่มีsemantictrailers ไม่เชื่อUUID | store0/quota0; Gateway HTTP 502 ไม่domain401 |
| Metadataunknown/ผิดชนิด/ผิดรูปแบบ/ซ้ำ/forbiddenidentityหรือforwarded | Internal/INTERNAL_ERROR | คู่/RหรือL | store0/quota0; Rตรงoutbound→500v2 มิฉะนั้น502 |
| x-callerหาย/ผิดordinal api-gateway; UUIDผิด/ซ้ำ; trace/langผิด; metadata>16384 | Internal/INTERNAL_ERROR | คู่/RหรือL; UUIDผิดใช้L | store0/quota0; HTTP API Gatewayห้ามนำSchoolBot gRPC serviceใหม่มาแทนoutboundUUID |
| Metadataผ่านแต่Originไม่อยู่allowlist/ยังไม่มีallowlist | PermissionDenied/ORIGIN_NOT_ALLOWED | คู่/R | store0/quota0; Gateway HTTP 403v2/noCORS |
| Peer/metadata/Originผ่านแต่tokenabsent/malformed/JWT | OK/Empty | ไม่มีsemanticerrors | store0/quota0แม้quotaเต็ม;204body0 |
| Canonicaltokenแต่limiterdeny | ResourceExhausted/RATE_LIMITED | คู่/R | store0;429/validatedRetryAfterเท่านั้น |
| AuthenticationUnavailableException | Unavailable/AUTH_UNAVAILABLE | คู่/R |503;คืนworkpermitเมื่องานจบ |
| UnexpectedexceptionรวมOCEที่ไม่มีcancel signal | Internal/INTERNAL_ERROR | คู่/R |500sanitized ไม่อ้างstore0/rollback |
| Linkeddeadlineหมดก่อนcontextcancel | DeadlineExceeded/ไม่มีsemantic | ไม่มีsemantictrailers | Gateway outer deadline→504; upstreamfailureก่อนouter→502 |
| Contextcancelแล้วงานโยนcancellation | Cancelled/ไม่มีsemantic | ไม่มีsemantictrailers | disconnectไม่เขียนresponseใหม่; Gateway deadline504/อื่น502 |

ถ้าcontextcancelและtimerพร้อมกัน branch ของ context cancellationชนะในadapter ที่ถูกเรียกโดยตรง; transportอาจจบก่อนตอบ. AUTH_NOT_CONFIGUREDคู่Unavailableยังอนุญาตเฉพาะconfigจริง ไม่ใช้แทนbadmetadata. ข้อความinternalคง `The request failed.`/`คำขอล้มเหลว` ไม่สะท้อนkey/value/token/exception ไม่เพิ่มdetails.
