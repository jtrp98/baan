# Logout negative boundary — Rev1

วันที่2026-10-26 · arch CodexT1 · run `2026-10-26-11-08-46-arch-tier-t1-1agents-pAQfPC` · ผู้คุมสกัด

ส่วนชี้แจงของ [logout packet](gateway-logout-slice-001.md)/[gRPC Rev1](gateway-grpc-contract-001.md) ไม่เพิ่มpubliccode/field/protoหรือhuman gate. สัญญารวมมีหลายcodeแต่localsubsetใช้เฉพาะpairของpacket. Peerที่ผ่านแล้วแต่ส่งmetadataผิดเป็นinternalG–Bcontractfailure ไม่ตีความเป็นความผิดผู้ใช้.

## Error table

คู่trailersคือsb-error-binหนึ่ง+schoolbot-error-binหนึ่ง ชนิด/ข้อความ/codeสอดคล้องเดิม. R=UUID-D36nonemptyเพียงหนึ่งค่า ใช้UUIDเดิมcanonicalD (ไม่บังคับversion); L=หาย/ผิด/ซ้ำสร้างUUIDใหม่สำหรับerrorนี้ ไม่เลือกค่าตัวแรก. quota0=ไม่เรียกAttemptSource/AttemptWork; store0=ไม่เรียกstore.

| กรณี | status/code | trailers/correlation | งาน/ผลที่Gรับได้ |
|---|---|---|---|
| Peerไม่ผ่านแม้tokenabsent | Unauthenticated/ไม่มีsemantic | ไม่มีsemantictrailers ไม่เชื่อUUID | store0/quota0; G502 ไม่domain401 |
| Metadataunknown/ผิดชนิด/ผิดรูปแบบ/ซ้ำ/forbiddenidentityหรือforwarded | Internal/INTERNAL_ERROR | คู่/RหรือL | store0/quota0; Rตรงoutbound→500v2 มิฉะนั้น502 |
| x-callerหาย/ผิดordinal api-gateway; UUIDผิด/ซ้ำ; trace/langผิด; metadata>16384 | Internal/INTERNAL_ERROR | คู่/RหรือL; UUIDผิดใช้L | store0/quota0; Gห้ามนำBใหม่มาแทนoutboundUUID |
| Metadataผ่านแต่Originไม่อยู่allowlist/ยังไม่มีallowlist | PermissionDenied/ORIGIN_NOT_ALLOWED | คู่/R | store0/quota0; G403v2/noCORS |
| Peer/metadata/Originผ่านแต่tokenabsent/malformed/JWT | OK/Empty | ไม่มีsemanticerrors | store0/quota0แม้quotaเต็ม;204body0 |
| Canonicaltokenแต่limiterdeny | ResourceExhausted/RATE_LIMITED | คู่/R | store0;429/validatedRetryAfterเท่านั้น |
| AuthenticationUnavailableException | Unavailable/AUTH_UNAVAILABLE | คู่/R |503;คืนworkpermitเมื่องานจบ |
| UnexpectedexceptionรวมOCEที่ไม่มีcancel signal | Internal/INTERNAL_ERROR | คู่/R |500sanitized ไม่อ้างstore0/rollback |
| Linkeddeadlineหมดก่อนcontextcancel | DeadlineExceeded/ไม่มีsemantic | ไม่มีsemantictrailers | Gouterdeadline→504; upstreamfailureก่อนouter→502 |
| Contextcancelแล้วงานโยนcancellation | Cancelled/ไม่มีsemantic | ไม่มีsemantictrailers | disconnectไม่เขียนresponseใหม่; Gdeadline504/อื่น502 |

ถ้าcontextcancelและtimerพร้อมกัน branchcontextชนะในdirectadapter; transportอาจจบก่อนตอบ. AUTH_NOT_CONFIGUREDคู่Unavailableยังอนุญาตเฉพาะconfigจริง ไม่ใช้แทนbadmetadata. ข้อความinternalคง `The request failed.`/`คำขอล้มเหลว` ไม่สะท้อนkey/value/token/exception ไม่เพิ่มdetails.

## Validator rules

1. ลำดับ peer→metadata integrity/size/requiredvaluesทั้งหมด→Originpolicy→token→source→work→store. Metadataผิดพร้อมOriginผิดต้องInternal ไม่ขึ้นกับheaderorder. Appallowlistมีx-request-id/x-caller/optionaltraceparent/x-lang/originเท่านั้น; tracestateไม่ได้รับอนุมัติจากการมีชื่อในcode. Transportentryไม่ใช่identityauthority.
2. traceparentไม่trim/lowercaseซ่อม ใช้lowercaseASCIIhex; trace-id32/parent-id16ไม่zero, flags2รับ00..ffไม่จำกัด00/01; versionffห้าม, v00ต้อง55charsไม่มีsuffix, v01..feฐานอย่างน้อย55และsuffixเริ่มด้วยhyphenเมื่อมี ไม่ตีความextensionเป็นidentity. อ้าง [W3C versioning](https://www.w3.org/TR/trace-context/#versioning-of-traceparent); เป็นlocalvalidatorcontract ไม่ใช่ผลรับรองimplementationทั้งstandard.
3. x-langpresentต้องexactordinalth/en; empty/whitespace/TH/EN/duplicateปฏิเสธ. UUIDuppercasehexไม่ใช่ข้อห้ามใหม่ เทียบcorrelationด้วยUUIDcanonicalized; ErrorDetailไม่มีUUIDfieldไม่เพิ่มschema.
4. Metadataรวมทุกoccurrenceก่อนกรอง: `Σ(ASCIIkeybytes+ASCIIvaluebytesหรือbinarybytes+32)` ใช้counterไม่overflow;16384ผ่านขนาด/16385rejectก่อนlimiter/store. นับduplicates/transportentries ไม่ใช้compressedsize/replaceUnicodeด้วยquestionmark. หลักoverheadอ้าง [RFC9113 §6.5.2](https://www.rfc-editor.org/rfc/rfc9113.html#name-defined-settings). Binaryformulaเป็นกฎlocal ไม่อ้างphysicalbase64wireaccountingครบ.
5. Runtimeซ่อนtransportfieldsจากRequestHeadersต้องมีหลักฐานจากจุดรับจริง; อย่าอ้างloopมองครบHTTP/2headerlist. ถ้าtransportrejectก่อนadapterจะไม่มีsemanticpairและGใช้502. Physical/privatehosting/H5proofยังค้าง ไม่ลดสูตรเพื่อให้ผ่าน.
6. คงsource30/60s/concurrency8queue0/capturedsocketpeer; sourcequotaใช้แล้วไม่คืนเพราะstorefail แต่workpermitถือจนactualworkจบ/fail/cancel. ไม่อ้างcancel=rollbackหรือstore0หลังเข้าทำงาน.

## Impact/limits

รอsysrework2แก้Bและcheckทวนจากrulesนี้; Gmapperต้องใช้correlation/statuspairsเดิม. ผู้คุมกวาดtraceparentทั้งtargetB/G: currentBvalidatorและGrequesthelperเป็นจุดกลไก; CommonGrpc/TraceContextinterceptors/handbook/legacytestsของGไม่เปลี่ยนเพราะไม่ขยายlocalsubsetไปlegacy/protectedpaths. ตรวจGhelperมาตรฐานActivityContextตามruntimeก่อนเสนอแก้ อย่าแก้globalinterceptorsแถม. Existingtestreceiptsเป็นประวัติไม่แทนrulesปัจจุบัน.

## Change Log

- 2026-10-26 — Rev1: สกัดnegativepairs/correlation/accounting/trace/langจากarch; ไม่ปิดH5/production/securityหรืออ้างtestsใหม่ผ่าน.
