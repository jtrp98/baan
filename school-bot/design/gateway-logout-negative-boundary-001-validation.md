# Logout negative boundary — Validator rules

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Logout negative boundary](gateway-logout-negative-boundary-001.md) ส่วนนี้อธิบายValidator rules อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[BL-005 (ข้อ 2: ผูกเอกสาร logout กับ controller as-built)](gateway-controller-entry-001.md)

## Validator rules

1. ลำดับ peer→metadata integrity/size/requiredvaluesทั้งหมด→Originpolicy→token→source→work→store. Metadataผิดพร้อมOriginผิดต้องInternal ไม่ขึ้นกับheaderorder. Appallowlistมีx-request-id/x-caller/optionaltraceparent/x-lang/originเท่านั้น; tracestateไม่ได้รับอนุมัติจากการมีชื่อในcode. Transportentryไม่ใช่identityauthority.
2. traceparentไม่trim/lowercaseซ่อม ใช้lowercaseASCIIhex; trace-id32/parent-id16ไม่zero, flags2รับ00..ffไม่จำกัด00/01; versionffห้าม, v00ต้อง55charsไม่มีsuffix, v01..feฐานอย่างน้อย55และsuffixเริ่มด้วยhyphenเมื่อมี ไม่ตีความextensionเป็นidentity. อ้าง [W3C versioning](https://www.w3.org/TR/trace-context/#versioning-of-traceparent); เป็นlocalvalidatorcontract ไม่ใช่ผลรับรองimplementationทั้งstandard.
3. x-langpresentต้องexactordinalth/en; empty/whitespace/TH/EN/duplicateปฏิเสธ. UUIDuppercasehexไม่ใช่ข้อห้ามใหม่ เทียบcorrelationด้วยUUIDcanonicalized; ErrorDetailไม่มีUUIDfieldไม่เพิ่มschema.
4. Metadataรวมทุกoccurrenceก่อนกรอง: `Σ(ASCIIkeybytes+ASCIIvaluebytesหรือbinarybytes+32)` ใช้counterไม่overflow;16384ผ่านขนาด/16385rejectก่อนlimiter/store. นับduplicates/transportentries ไม่ใช้compressedsize/replaceUnicodeด้วยquestionmark. หลักoverheadอ้าง [RFC9113 §6.5.2](https://www.rfc-editor.org/rfc/rfc9113.html#name-defined-settings). Binaryformulaเป็นกฎlocal ไม่อ้างphysicalbase64wireaccountingครบ.
5. Runtimeซ่อนtransportfieldsจากRequestHeadersต้องมีหลักฐานจากจุดรับจริง; อย่าอ้างloopมองครบHTTP/2headerlist. ถ้าtransportrejectก่อนadapterจะไม่มีsemanticpairและHTTP API Gatewayใช้502. Physical/privatehosting/H5proofยังค้าง ไม่ลดสูตรเพื่อให้ผ่าน.
6. คงsource30/60s/concurrency8queue0/capturedsocketpeer; sourcequotaใช้แล้วไม่คืนเพราะstorefail แต่workpermitถือจนactualworkจบ/fail/cancel. ไม่อ้างcancel=rollbackหรือstore0หลังเข้าทำงาน.

## Impact/limits

ข้อกำหนดสำหรับ implementation และการตรวจรับของ SchoolBot service คือ rules นี้; Gateway mapperต้องใช้correlation/statuspairsเดิม. ผู้คุมกวาดtraceparentทั้งtarget SchoolBot/HTTP API Gateway: SchoolBot validator ปัจจุบันและGateway request helperเป็นจุดกลไก; CommonGrpc/TraceContextinterceptors/handbook/legacytestsของHTTP API Gatewayไม่เปลี่ยนเพราะไม่ขยายlocalsubsetไปlegacy/protectedpaths. ตรวจGateway helperมาตรฐานActivityContextตามruntimeก่อนเสนอแก้ อย่าแก้globalinterceptorsแถม. Existingtestreceiptsเป็นประวัติไม่แทนrulesปัจจุบัน.

ผู้คุมprobeActivityContext.TryParseบนruntimeจริง7inputs: baseline/flagsff/futurebaseรับ, uppercaseIDs/ffversion/v00suffixปฏิเสธ; futurev01พร้อมsuffixvendorถูกSDKปฏิเสธจึงGateway helperจะomitoptionaltraceในกรณีนั้น. เป็นcompatibilitylimitationที่ยังไม่รับรองfullW3Cpropagation ไม่ใช้เป็นเหตุขยายGglobalinterceptorหรือแก้helperขณะcriticalการแก้ไข. SchoolBot custom validatorยังต้องทำตามrulesด้านบน; ผลprobeนี้ไม่ใช่Gateway HTTP/RPCtestหรือgateclose.

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

รหัสอ้างอิงที่ปรากฏในบันทึกเดิม: BL-005.
