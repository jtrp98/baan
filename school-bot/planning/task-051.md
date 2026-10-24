# ใบงาน051 — gm sync เอกสารแผนที่เกี่ยวกับ gRPC (docs-only)

วันที่2026-10-24 · gm/Codex t2 read-only · เป็นownerแผนโครงการใหญ่เดิม ไม่ร่างplanใหม่ ไม่เพิ่มscope/tasks

ผู้ใช้ย้ำปรับทุกเอกสารที่เกี่ยวข้อง และ “ทำแค่ส่วนเอกสารก่อนนะ ยังไม่ต้อง imprement”. K=C:/src/schoolbright/knowledge/school-bot อ่านK/index→plan/index→design/index แล้ว design/gateway-integration-001.md Rev3, planning/auth-flow-handoff-001.md, planning/gateway-grpc-doc-amendment-response-001.json และ plan/queue-003/evidence002/gates001/release-runbook001/scope001/backlog/tasks-001.json/extensionindex กับ taskmdที่ค้นเกี่ยวข้อง

Current client→HTTP G→gRPC SchoolBot; ไม่มีHTTPrelay/directpublicB. GHTTPLoginเดิมแยกจากservice transport. BมีHTTPlogout+internaldecoder4032localtestsแล้ว แต่ยังไม่มีgRPC/Gatewayintegration/DBruntime. gRPCมาตรฐานทราบแล้วไม่รอเลือกtransportหรือขอHTTPexception; ยังต้องcontract/RPC+HTTPmapping+auth/tenanttrust/Lightimplementationreview/H5. cTypecategoryตอบแล้ว ทีมรับrouting/linkageต่อ ไม่ถาม035/businessซ้ำ. UserเลือกCodexสำหรับงานนี้ชัดกว่าrunnerpreferenceเก่าในqueue003 ต้องแยกประวัติจากคำสั่งปัจจุบัน

Audit plan/backlog/currentqueue/canonicaltaskmd+JSONทั้งหมดที่มีข้อความเกี่ยวข้องให้คนรับงานไม่implementdirectBHTTPตามผิด ไม่เปลี่ยน110pending/44REQ180AC/8phases17gates/taskdeps/IDs/effort/release scope ไม่ปิดgate ไม่เปลี่ยนQAverdict ไม่เพิ่มหรือexecuteimplementationงานรอบนี้. คืนamendmentเฉพาะจำเป็น. metadatahistoricalเช่นqueue001/002เดิมคงประวัติ แต่currentindexชี้คิวล่าสุดที่ถูกต้อง อย่าแก้logเก่าเหมือนเกิดเหตุใหม่. ถ้าสร้างqueue004ให้ครบชัดและส่งexactfullnewfileผู้คุมบันทึก แต่preferamendcurrentเพื่อไม่สร้างหลายแหล่ง. ตารางtasks JSONถ้าโน้ตมีผิดต้องsyncคู่mdตามschemaเดิม ถ้าไม่เกี่ยวไม่แตะ

คืน fencedJSON <=6500tokens {"state":"DONE","summary":"...","coverage":[{"paths":[],"action":"amend|consistent|historical_preserve","reason":"..."}],"edits":[{"path":"knowledge/school-bot/plan/...|knowledge/school-bot/backlog.md","old":"uniqueexact","new":"exactreplacement"}],"new_files":[],"invariants":[],"handoff":"..."}. ทุกamendมีวันที่/precedence ไม่regenerate/noIDrenumber. ห้ามsource/knowledgewrites/rolechain/gitmutations/tests/SQL/network. ผู้คุมarchiveก่อนapplyเอง

## Change Log
- 2026-10-24 — ให้gmเจ้าของแผนเดิมแก้ความสอดคล้องเอกสารtransportโดยคงcanonicalstatusและdocs-only
