# G typed logout — final rework2 JPO

วันที่2026-10-26 · JPO CodexT2 run 2026-10-26-15-10-16-jpo-tier-t2-1agents-LqKvlN · NEEDS_HUMANเฉพาะsliceหลัง2reworks · นายช่างสกัด/ทวน

**SEC001-016ImportantยังOPEN**. Baseline5/5ไม่ปิดfinding; extended **81pass/15fail/96assertions exit1**. ParentรันexactJPOextendedscriptซ้ำได้ **81/15/96 exit1** เช่นกัน. Rawscript/logอยู่workspace normal-089/gateway-jpo-r2-extended.ps1 และ gateway-jpo-r2-extended-parent.log.

## Actual residuals

- Client:27reflectionหาchannelไม่เจอไม่rejectก่อนRPC; HiddenCallInvokerทำให้Information/Event3บันทึกopaqueStatus.Detailจริง.
- Logger:114ส่งrawscopeต่อ; :172heuristicไม่ป้องกันข้อความสุ่ม. Testผ่านactualboundfactoryรั่วDebug/Information/Errorและscope ไม่อาศัยknownmarkerอย่างเดียว.
- Callerloggerinterceptorยังlograwdetail+RpcException; middleware:153generatedclientfallbackเรียกunsafeclientได้/RPC1และเกิดlogleak.
- Constructorเปลี่ยนsharedchannelLoggerFactoryจริงกระทบcallerอื่น; unrelatedGatewayloggercontrolยังvisibleก่อน/หลัง ไม่ใช่globalfilterปิดหลักฐาน.

แนวแก้ที่พร้อมให้ผู้ใช้อนุมัติรอบเพิ่มเติม: module-ownedchannel/logboundaryก่อนสร้างclientผ่านpublicconfigurationAPI, rejectprebuilt/unprovenclient-invokerก่อนRPC, allowliststatus/method/requestIDที่sanitizeแล้ว, ไม่rawstate/scope/exception/markerregex/private-fieldmutation/sharedchannel. **ไม่เปิดrework3เอง/ไม่รับriskแทนคน**.

## สิ่งที่ fix verified

**SEC001-017Minor — CLOSEDเฉพาะlocalearlydeadlinecause**: earlyupstreamDeadlineExceeded502, outerRPCexpiry504/15.0708s/RPC1, slowbody504/15.0041s/RPC0. Parentextendedยืนยันouter504/15.0743253s/RPC1/bodyremainingdeadline14.7994131s; no retry/cancelcontextไม่writebody.

PairedInternalHTTP500fixed/no details/RetryAfter/markers; malformed/missing/duplicate/status/UUID/8KiB/16KiB/4MiB→502clean; default/missingtrustconfigfailclosed/peerdeny/body65536pass65537rejectผ่าน. Fullprivatebuild/fullpipeline/TLS/H5/production/DB/hardware/CVE NOT_RUN; ไม่พบข้อมูลบุคคลจริงรั่วในรอบsynthetictestsนี้ ไม่รับรองcompliance.

Sourcebefore/afterตรง: ClientAB3610…A4D1/MiddlewareBE1E22…F3AF/Validator6C1407…B129/Program8E7242…2255/protoG-B37C03A…635C. Baseline5hash009E8C…A840/loaderFCFBF3…D71; parentผูกต้นฉบับก่อนรันแล้ว.

## B QA triage

JPOอ่านcheck2222/12/8และBsourcehashตรง ไม่ได้รันBใหม่. UUIDduplicateempty/store1เป็น **Mediumintegrity/correlation** ในlogoutsurface ยังไม่proveข้ามสิทธิ์/tenant. Origin/binary/transportduplicateเป็น **Minorcontract/errornormalization**. ไม่เพิ่มSECIDซ้ำ/ไม่เปลี่ยนQAFAILหรือรับrisk; Bยังต้องขอรอบแก้เกิน2ท้ายวง.

## Change Log

- 2026-10-26 — รับJPO2และparent96ยืนยันOPEN16/localCLOSED17; รวมB/Gขอadditionalrepairไว้waitingledger ไม่หยุดlocalreadyอื่น.
