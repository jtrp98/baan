# Check088 — B gRPC Logout FAIL

วันที่2026-10-26 · check CodexT2 · run `2026-10-26-09-15-00-check-tier-t2-1agents-UVQwLe`

Verdict FAIL:101cases ผ่าน80/ตก21. Descriptor2/2; directservice30/39; typedRPC/TestServerและproductionregistration48/60. ใช้Add-Typecompileharnessในหน่วยความจำ: Grpc.Net.Client→TestServer→realgeneratedserver→fakestore ไม่มีsocket/network/DB. ตรวจPE↔PDBและsourcechecksums35/35ตรงก่อนรันล่าสุด; protohash37c03aba66c608b21f4af6e30ea70be5747e95318b0f8f6ce7318365cabf635c

## Findings สำหรับ sys รอบ1

| กลุ่ม | Expected/actual |
|---|---|
| Major: deadline | parent60sต้องcap15s; หลัง16.21sstoreยังไม่cancel ต้องharnesscleanupเอง |
| Major: capturedpeer | capturepeerเดิมแล้วrewriteIP: request2ควรถูกquota; actualOK/store2 เพราะอ่านRemoteIpAddressปัจจุบัน |
| Major: metadata cap | traceparent/user-agent17000ASCIIbytesต้องrejectก่อนstore; actualOK/store1 ทั้งdirect/wire |
| Medium: metadata validation | traceparentinvalid/x-lang=root/ค่าซ้ำต้องreject; actualOK/store1 |
| Medium: UUIDcorrelation | UUIDถูกต้อง+forbiddencookieควรคงUUID; actualสร้างใหม่ |
| Major: semanticcodes | ส่งINVALID_ARGUMENT/PERMISSION_DENIEDนอกallowlistmapping; Gต้องมองเป็นinvalidreply |
| Major: exceptionredaction | storeโยนRpcExceptionพร้อมsynthetictoken/provider marker ต้องInternal/INTERNAL_ERRORพร้อมtrailerคู่; actualส่งUnavailable/detail/markerต่อ ไม่มีcompanion |

Sourceหลัก:SchoolBotSessionServiceAdapter.cs:82,91,107,135,157,195,217 ตามrunที่ตรวจ. ไม่เปิดrouteproductionจึงไม่อ้างruntimeexploitจริง; defaultpeerdeny/productionregistrationoffผ่านตรวจ

## ส่วนที่ผ่านและข้อจำกัด

ผ่านtokenabsent/malformed/canonicalbase64urltails, peerdeny/store0, hash/requestUUIDถึงstore, forbiddenidentitymetadatareject, Originallow/deny, sanitizedAuthenticationUnavailable/InvalidOperation, source/concurrencyquota, permitdrain/release/cancellationpropagation, protobuf4MiBcap, IPv4-mappedquota, streamingprotobufEmptyframeจริง และactualProgramProductionRPCpath404/store0

Cancellationwireบางกรณีเป็นUnknownแม้ถึงstore จึงไม่รับรองstatusmapping. NOT_RUN: Gcopy/codegen/hash/GErrorDetail.Parser, Gtrailernegatives/HTTPmapping/routing/64KiB/CORS/integration, H5/TLS/DBatomicity/fullLogin. Interoperabilityadvisory: rawrequestมีContent-Lengthถูกrejectเป็นunknownmetadata ขณะที่streamingผ่าน แยกจาก101casesและไม่ใช่เหตุverdict

Exact101cases/expected/actualและharnesscommandsอยู่rawanswer/stderrของrun ไม่คัดลอกstdoutเข้าknowledge. ส่งsysแก้รอบ1เมื่อผู้ใช้ให้ต่อ; ยังไม่dispatchเพราะdecisions048ให้ปิดงานที่เปิดอยู่แล้วหยุด

## Change Log

- 2026-10-26 — บันทึกindependentwirecheck101cases/7findinggroups ไม่ใช้regression4032แทนacceptanceใหม่
