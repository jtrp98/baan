# G typed logout — independent JPO re-audit1

วันที่2026-10-26 · JPO CodexT2 run 2026-10-26-13-49-32-jpo-tier-t2-1agents-o1ULFh · NEEDS_HUMAN เฉพาะImportantยังOPEN; ผู้คุมrouteauthorizedfixต่อ

HTTP disclosureจากcheck089แก้แล้ว: validpaired Internal/INTERNAL_ERROR คืนHTTP500ข้อความคงที่ ไม่มี synthetic provider/token/stack markers ใน body/headers/details แม้Development. Basewire3/3ผ่าน; slowbody504/15.010951s/RPC0. แต่ยังปิดImportantไม่ได้เพราะ dependency client logรับ upstream Status.Detail ก่อนmiddleware sanitize.

| ID | Severity/ผลจริง | Owner/ทางต่อ |
|---|---|---|
| SEC001-016 | Important OPEN: category Grpc.Net.Client.Internal.GrpcCall/Information/EventId3 มี synthetic provider/token/stack จากstatusdetail; SchoolBotSessionGrpcClient.cs:19/hash6A1FCE…E0E5 | sysGแก้scopedchannel/call logging boundary แล้วJPOreaudit ห้ามปิดglobalGatewayloggingหรือรับriskแทนคน |
| SEC001-017 | Minor OPEN: upstream DeadlineExceededก่อนouterbudgetหมดตอบ504ภายใน0.001s แทน502ตามnegativeboundary; Middleware.cs:209 | sysGแยกouterexpiry504จากearlyupstream502 |

JPOตรวจregistry001..015/SEC040-001ก่อนเสนอIDs ไม่ชนเดิม. Extendedwire17/19 exit1, boundary/cancellation9/9 exit0, repro5cases3/5 exit1. Negativetrailerpair/missing/duplicate/status/UUID/unknowncode/8KiB/16KiB/4MiB→502 HTTPไม่มีmarkersผ่าน. Defaultvalidator+faketrustheaders503/RPC0, untrustedpeer502, body65536ผ่าน/65537rejectก่อนRPC, remainingbudget14.783s, parentcancelถึงpeer/noresponsewriteผ่าน. Sourcehashก่อนหลังตรง: Middleware FABD8A…2421/TrailerValidator6C1407…B129/Client6A1FCE…E0E5/Program8E7242…2255.

Raw runเก็บfullanswer/testsource; ผู้คุมสกัดexactJPO5caseregressionเป็นworkspace normal-089/gateway-jpo-regression.ps1. ไม่ใส่rawsource/logในknowledge. ยังไม่ตรวจproductionhost/network/DB/hardware/TLS/H5/fullparentdeadline/fullpipelinelogging/privatepackages; ไม่พบข้อมูลบุคคลจริงในรอบนี้และไม่รับรองcompliance/CVEทั้งระบบ.

ส่งsysG **rework2สุดท้าย** แก้codeตามauthorizationเดิม ไม่ถามfix-vs-riskเพราะแก้ได้; ต้องparentrepro+JPOซ้ำก่อนปิดImportant. หากfailหลังรอบ2จึงเข้าคำถามท้ายวง. SourceGitไม่มีmutation; ไม่เปิดproductionrouteหรือH5gate.

## Change Log

- 2026-10-26 — สกัดJPOผลจริงและลงSEC001-016/017ในregistry; คงImportantเดิม6ข้อทั้งหมด ไม่รับrisk/ไม่เพิ่มbusinessgate.
