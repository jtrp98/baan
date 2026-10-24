# ใบงาน050 — ตรวจเอกสารที่เกี่ยวข้องทั้งหมดกับ Gateway→gRPC

วันที่2026-10-24 · arch/Codex t1 read-only · userย้ำ “ทำแค่ส่วนเอกสารก่อนนะ ยังไม่ต้อง imprement” ห้าม code changes/testexecution/SQL/runtime/network/commit source

K=C:/src/schoolbright/knowledge/school-bot; B=C:/src/schoolbright/target/school-bot. ผู้ใช้ทักว่ารอบ049แก้แคบ ต้องตรวจทุกเอกสารที่เกี่ยวข้อง ไม่ใช่เพียงindexหรือappendoverrideหนึ่งจุด ขอบเขตเป็น doc consistency ของ baseline049: client→HTTP G→gRPC B; GHTTPLoginเดิม/decoderแยกจาก service transport; asbuiltBยังHTTPและ4032localtestsไม่ใช่integration; cType/035/C/opaqueLicense/deviceคงเดิม ไม่มี schema/REQscope change

อ่านK/index→plan/index→design/index และ gateway-integration Rev3/des012Rev8/reuseRev3/packetRev5 จาก049. Inventory Markdownทั้งK (รวมdesign/DD/contracts/modules/des001..012/requirement/plan/test-plan/security/openquestions และ current planning handoffs/receipts) กับ B README.md/web/README.md/app/README.md/docs/*.md. ใช้rg inventory+matchedlinesเลือกอ่าน ไม่dump archive/rawJSON หรือสแกน sourceอื่น ไม่แก้เนื้อหาประวัติ/decisions/rawresponses/archivedQA. Historical/source-review/scope-history/tasksบันทึกการรันเดิมคงbytes ให้ current indexชี้สถานะล่าสุดแทน. อ่านBAGENTSและGAGENTSสำหรับกฎอย่างเดียว; ไม่ค้นsourceG/secret

ตรวจแยกว่าข้อความHTTPเป็นฝั่งclientG, localdevelopment asbuilt หรือชวนสั่งใช้directpublicB/HTTPproxy. จัดทำcoverage matrixทั้งเอกสารที่ควรแก้และเอกสารเกี่ยวข้องที่ไม่ต้องแก้พร้อมเหตุผล (จัดกลุ่มpathsได้ถ้าชัดครอบคลุมไฟล์สมาชิก). หลักสำคัญไม่ทำให้engineIPC/localhardwareHTTPหรือGatewayLoginเดิมกลายเป็นgRPCโดยผิดขอบเขต ไม่เปิดใหม่businessgates/สร้างprotoหรือerror/authmetadataด้วยการเดา. เส้นtrustedJWTtenant/opaquetokenต้องระบุdesignpendingตรงตาม049

คืน exact amendmentsเฉพาะเอกสารที่archเป็นเจ้าของในK/design รวม DD/diagram/HTTPsemantics และsource documentation B README/webREADME/docsArchitecture/API/Deployment/Installers/AppREADMEถ้าเกี่ยวข้อง (คืนpatchเท่านั้นผู้คุมapply). ให้current operative textอ่านตรงกันในแต่ละหน้า ไม่อาศัยindexoverrideอย่างเดียว ถ้ามี oldactiveHTTPproxy ให้แก้ประโยคactiveและคงประวัติในarchiveที่ผู้คุมเก็บ. ไม่regenerate/noIDrenumber. docs asbuiltdevcommandsต้องคงใช้งานปัจจุบันไม่ใส่URL/port/protofilenameสมมติหรืออ้างgrpcพร้อม. SourceDocไม่ใส่taskIDs/ประวัติคุยใส่เฉพาะproductfacts+limitations+target

เอกสารplan/backlog/tasksJSONเป็นgmเจ้าของ ไม่แก้ ให้coverageระบุpath+exactproblem+recommendedamendmentส่งgm. test-planเป็นinspect, requirementเป็นspec, securityเป็นjpo: ระบุถ้าจำเป็นจริงที่ต้องเปลี่ยนเองเท่านั้น อย่าแก้businessREQ/ACหรือsecurityverdictเพื่อdocconsistency. QAactuallocalverdictเดิมคงไว้ ให้scopeclarificationอย่างเดียวถ้าจำเป็น ไม่อ้างPASS

คืน fencedJSON <=8000tokens {"state":"DONE|NEEDS_DESIGN_CHANGE","summary":"...","coverage":[{"paths":[],"classification":"amend|current_consistent|historical_preserve|owner_handoff|unrelated","reason":"...","owner":"..."}],"edits":[{"path":"knowledge/school-bot/design/...|target/school-bot/...md","old":"exactuniqueanchor","new":"exactreplacement"}],"owner_handoffs":[{"owner":"gm|inspect|spec|jpo","paths":[],"required_change":"..."}],"remaining_design_gaps":[]}. ขอคงscopeให้ครบแต่กระชับ anchorsไม่ซ้ำ/Rev/indexsync/datedchangelogสำหรับknowledge ไม่มีcode/SQLwrite ไม่มีknowledgewrite/rolechain. ผู้คุมarchiveก่อนapplyทั้งหมด

## Change Log
- 2026-10-24 — ผู้ใช้ขอปรับทุกเอกสารที่เกี่ยวข้องและย้ำdocs-only; ส่งarchทำcoverageaudit/amendmentsตามowner
