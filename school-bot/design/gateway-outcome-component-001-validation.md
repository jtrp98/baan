# Gateway outcome component — Validation และ bounds

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway outcome component](gateway-outcome-component-001.md) อธิบาย Validation และ bounds.

## Validation และ bounds ตามลำดับ

1. enum/status นอก 100..599 หรือ operation-stage ไม่ตรงตาราง → Rejected(400,INVALID_INPUT). Mobile ทุก operation รวม terminal/pending_device/password_reset → Rejected(400,INVALID_INPUT) โดยไม่ decode body; ไม่ fallback web.
2. body เกิน 2,097,152 bytes → Rejected(503,AUTH_UNAVAILABLE). สำหรับ 200 body ว่าง/whitespace ไม่ผ่าน. ไม่ truncate; ขนาดวัดก่อน parse.
3. ใช้ System.Text.Json ตรวจ UTF-8/Unicode ถูกต้อง รวม escaped surrogate; JSON เดียวทั้ง input, root object, depth ไม่เกิน 32 (root container=1), ไม่มี BOM/comments/trailing comma/trailing document. ตรวจ duplicate property names หลัง unescape แบบ Ordinal ทุก object ทั้ง tree รวม unknown fields/arrays. Duplicate, malformed, depth เกิน, wrong type →503 AUTH_UNAVAILABLE. ห้ามข้าม unknown subtree ก่อนตรวจ.
4. names case-sensitive. ที่ root และ results หากชื่อเทียบ OrdinalIgnoreCase ตรง known name แต่สะกด case ผิดให้ปฏิเสธ. Known root: code/results/message/messageTh/requestId; known results: fields ในสัญญานี้รวม channels/missing/user/retryAfterSeconds และ mobile markers. Unknown fields อื่นละได้หลังตรวจทั้ง tree ไม่ใช้เป็น authority และไม่ส่งออก.
5. code ถ้ามีต้องเป็น JSON integer lexical100..599 หรือ string สามหลัก 100..599 เท่านั้น ไม่รับ decimal/exponent/space/null/boolean. ต้องเท่ากับ httpStatus; ขัดกันหรือ code อื่น →503 AUTH_UNAVAILABLE. HTTP200 บังคับมี code และ results object; ไม่รับ null. กฎรับ code สอง representation เป็น tolerance ของ SchoolBot gRPC service ไม่ใช่ข้อยืนยันรูปแบบ HTTP API Gateway.
6. ตรวจ HTTP errors ก่อนเลือก success branch ตามตารางถัดไป. สำหรับ 200 เลือกได้หนึ่ง branch และต้องอนุญาตโดย operation; ไม่ตรง/หลาย branch →503 AUTH_UNAVAILABLE.

Unknown presentation values รวม channels/missing/user รับ JSON value ใดก็ได้ภายใน bounds แต่ไม่ตีความ. message/messageTh/requestId ไม่ถูกใช้ตัดสิน outcome. Known authority fields ห้ามอาศัย unknown-field rule: null ไม่เท่ากับ absent; marker ที่ branch ไม่ใช้ต้อง absent เว้นแต่ระบุข้อยกเว้น.

Secret ที่ต้องมีต้องเป็น string ไม่ว่าง ไม่มี Unicode whitespace/control; ไม่ trim/normalize. token/changeToken/trustedDeviceToken ไม่เกิน 16,384 UTF-8 bytes หลัง unescape. challengeToken ใช้เพดานเดียวกันและไม่เกิน 200 UTF-16 code units. ref/masked เป็น string1..512 UTF-16 code units ไม่มี control; ไม่ trim. resendAfterSeconds เป็น JSON integer lexical0..2147483647 ไม่รับ string/fraction/exponent.

expiresAt เป็น string รูปแบบ `YYYY-MM-DDTHH:mm:ss[.1..7digits](Z|±HH:mm)`, ปี 0001..9999, Gregorian date/time ถูกต้อง, seconds00..59, offset ไม่เกิน±14:00; ใช้ invariant culture, normalize เป็น UTC DateTimeOffset. ปฏิเสธ timezone หาย/epoch/null/date ผิด/leap second. ไม่เทียบเวลาปัจจุบัน ไม่ตัดสิน token lifetime หรือ authenticity; ค่าที่เป็นอดีตยัง decode ได้และต้องตรวจต่อที่ admission ภายหลัง.
