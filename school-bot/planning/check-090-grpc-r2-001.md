# B typed gRPC logout — final rework2 independent check

วันที่2026-10-26 · check CodexT2 run 2026-10-26-14-06-44-check-tier-t2-1agents-Mn8507 · **FAIL / NEEDS_HUMAN เฉพาะtaskหลังครบ2รอบแก้**

Baseline150/150ผ่าน แต่additionalwireยังผิดnegativeboundary: **2222pass/12fail/8wireNOT_RUN**, exit1. Sourcebinding44documents/DLL/PDBก่อนหลังตรง: Domain7/Application11/Infrastructure12/Api14. AdapterD734F9…AED7/API-DLL90CB5E…0963/API-PDB809618…F542. ไม่อ้างผ่านทั้งหมดจากparent150หรือregression4147.

| กลุ่ม | pass | fail |
|---|---:|---:|
| baseline direct/wire/extra-log | 110/23/17 | 0 |
| additional direct | 780 | 0 |
| additional wire | 1284 | 12 |
| additional extra/log | 8 | 0 |

## Findings หลังรอบสุดท้าย

| Finding | Severityตามcheck / actual | Expectedตามarch |
|---|---|---|
| UUIDduplicate+emptyทั้งสองลำดับ | Important: rawHTTPมี2ค่าแต่RequestHeadersทำให้ผ่านOK/store1/กินquotaและใช้UUIDเดิม | Internal/INTERNAL_ERRORpaired, UUIDใหม่L, store0/quota0 |
| Originduplicate | Major: HTTPยังมี2ค่าแต่RequestHeadersรวมเป็นx,xแล้วตอบPermissionDenied/ORIGIN_NOT_ALLOWED | Internal/INTERNAL_ERRORก่อนOriginpolicy |
| malformed/duplicatebinary grpc-trace-bin | Major: !!! หรือAQ==สองค่าตอบUnknown/no-semanticหลังpeerผ่าน/store0/quota0 | Internal/INTERNAL_ERRORpaired/UUIDR |
| transportheaderduplicate | Major: incomingTestServercontextuser-agent2ค่าผ่านOK/store1/กินquota | Internal/INTERNAL_ERROR/store0/quota0 |

Sourcepoints AdapterValidateMetadata:124, UUID:135, Origin:246; RequestHeadersอ่านก่อนlogouttry. ไม่เปิดsysrework3โดยอัตโนมัติ. เก็บถามผู้ใช้ท้ายวง: แนะนำอนุมัติรอบแก้เพิ่มเติมเฉพาะrawwireboundaryแล้วcheck/JPOใหม่; ทางเลือกคงtaskนี้รอและproductionoff. ไม่เสนอรับriskเป็นdefault ไม่หยุดงานreadyอื่น.

Flags00..ff/versions01..fe/futuresuffix/base trace/lang/Origin+junkorder/limiter/permitdrain/cancel/deadline/redactionผ่าน. 8wireNOT_RUNแยกจากassertion: clientรวมduplicateuser-agent/ละemptylanguage และcontrol/nonASCII6กรณีไม่มีwirefixture; directผ่าน. Incomingcontextinjectionแยกจากactualwire. Physicalhiddenheaders/H5/Gcorrelation502/DB/fullLogin/TLS/actualproductionregistration NOT_RUN.

RawanswerมีfullPowerShell/C#source; ผู้คุมสกัดunchangedไปworkspace normal-089/grpc-r2-extended-independent.ps1 เพื่อทวนparent โดยไม่buildหรือแก้product. Parentผลกำลังรอ. ไม่เปลี่ยนcanonicalverified/task/gates.

Parentทวนscriptเดิมจริง exit1: **2222pass/12fail**, additional2072pass/12fail/8NOT_RUN; sourcebinding44documents/DLL/PDBตรงกับcheckerและdisk. Raw normal-089/grpc-r2-extended-parent.log. UUIDduplicateempty/Originduplicate/malformedbinary/duplicateuser-agentได้actualเดิม ไม่ใช่writerclaimหรือstaleDLL.

## Change Log

- 2026-10-26 — รับfinalcheck2222/12/8; baseline150greenเป็นsubsetเท่านั้น เก็บข้อขอรอบแก้เกิน2ไว้ท้ายวง.
- 2026-10-26 — parentextendedreproยืนยัน2222/12/8และbinding44ตรงครบ ไม่มีproductrework3.
