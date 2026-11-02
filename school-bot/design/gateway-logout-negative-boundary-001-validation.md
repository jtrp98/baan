# Logout negative boundary — Validator และข้อจำกัด

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Logout negative boundary](gateway-logout-negative-boundary-001.md) อธิบาย Validator และข้อจำกัด.

## เอกสารอ้างอิง

[BL-005 (ข้อ 2: ผูกเอกสาร logout กับ controller as-built)](gateway-controller-entry-001.md)

## Validator rules

1. ลำดับ peer→metadata integrity/size/requiredvalues ทั้งหมด→Originpolicy→token→source→work→store. Metadata ผิดพร้อม Origin ผิดต้อง Internal ไม่ขึ้นกับ headerorder. Appallowlist มี x-request-id/x-caller/optionaltraceparent/x-lang/origin เท่านั้น; tracestate ไม่ได้รับอนุมัติจากการมีชื่อใน code. Transportentry ไม่ใช่ identityauthority.
2. traceparent ไม่ trim/lowercase ซ่อม ใช้ lowercaseASCIIhex; trace-id32/parent-id16 ไม่ zero, flags2 รับ 00..ff ไม่จำกัด 00/01; versionff ห้าม, v00 ต้อง 55chars ไม่มี suffix, v01..fe ฐานอย่างน้อย 55 และ suffix เริ่มด้วย hyphen เมื่อมี ไม่ตีความ extension เป็น identity. อ้าง [W3C versioning](https://www.w3.org/TR/trace-context/#versioning-of-traceparent); เป็น localvalidatorcontract ไม่ใช่ผลรับรอง implementation ทั้ง standard.
3. x-langpresent ต้อง exactordinalth/en; empty/whitespace/TH/EN/duplicate ปฏิเสธ. UUIDuppercasehex ไม่ใช่ข้อห้ามใหม่ เทียบ correlation ด้วย UUIDcanonicalized; ErrorDetail ไม่มี UUIDfield ไม่เพิ่ม schema.
4. Metadata รวมทุก occurrence ก่อนกรอง: `Σ(ASCIIkeybytes+ASCIIvaluebytesหรือbinarybytes+32)` ใช้ counter ไม่ overflow;16384 ผ่านขนาด/16385reject ก่อน limiter/store. นับ duplicates/transportentries ไม่ใช้ compressedsize/replaceUnicode ด้วย questionmark. หลัก overhead อ้าง [RFC9113 §6.5.2](https://www.rfc-editor.org/rfc/rfc9113.html#name-defined-settings). Binaryformula เป็นกฎ local ไม่อ้าง physicalbase64wireaccounting ครบ.
5. Runtime ซ่อน transportfields จาก RequestHeaders ต้องมีหลักฐานจากจุดรับจริง; อย่าอ้าง loop มองครบ HTTP/2headerlist. ถ้า transportreject ก่อน adapter จะไม่มี semanticpair และ HTTP API Gateway ใช้ 502. Physical/privatehosting/H5 (เงื่อนไข listener/TLS/peer/private ingress และ trust ระหว่างระบบ)proof ยังค้าง ไม่ลดสูตรเพื่อให้ผ่าน.
6. คง source30/60s/concurrency8queue0/capturedsocketpeer; sourcequota ใช้แล้วไม่คืนเพราะ storefail แต่ workpermit ถือจน actualwork จบ/fail/cancel. ไม่อ้าง cancel=rollback หรือ store0 หลังเข้าทำงาน.

## Impact/limits

ข้อกำหนดสำหรับ implementation และการตรวจรับของ SchoolBot service คือ rules นี้; Gateway mapper ต้องใช้ correlation/statuspairs เดิม. ผู้คุมกวาด traceparent ทั้ง target SchoolBot/HTTP API Gateway: SchoolBot validator ปัจจุบันและ Gateway request helper เป็นจุดกลไก; CommonGrpc/TraceContextinterceptors/handbook/legacytests ของ HTTP API Gateway ไม่เปลี่ยนเพราะไม่ขยาย localsubset ไป legacy/protectedpaths. ตรวจ Gateway helper มาตรฐาน ActivityContext ตาม runtime ก่อนเสนอแก้ อย่าแก้ globalinterceptors แถม. Existingtestreceipts เป็นประวัติไม่แทน rules ปัจจุบัน.

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

รหัสอ้างอิงที่ปรากฏในบันทึกเดิม: BL-005.

ผู้คุม probeActivityContext.TryParse บน runtime จริง 7inputs: baseline/flagsff/futurebase รับ, uppercaseIDs/ffversion/v00suffix ปฏิเสธ; futurev01 พร้อม suffixvendor ถูก SDK ปฏิเสธจึง Gateway helper จะ omitoptionaltrace ในกรณีนั้น. เป็น compatibilitylimitation ที่ยังไม่รับรอง fullW3Cpropagation ไม่ใช้เป็นเหตุขยาย Gglobalinterceptor หรือแก้ helper ขณะ critical การแก้ไข. SchoolBot custom validator ยังต้องทำตาม rules ด้านบน; ผล probe นี้ไม่ใช่ Gateway HTTP/RPCtest หรือ gateclose.
