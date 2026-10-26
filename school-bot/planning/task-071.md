# ใบงาน071 — arch ยืนยันช่องว่างสัญญาแบบจำกัดขอบเขต

วันที่ 2026-10-26 · arch / codex t1 / read-only. รอบ067timeout600sไม่มีanswer จึงไม่รับผล067และไม่อ้างว่าได้สัญญาใหม่

K=C:/src/schoolbright/knowledge/school-bot. อ่านK/index.md→design/index.md→requirement/index.md แล้วเฉพาะ:
- design/des-005.md, des-010.md, des-011.md, learning-rules-032-034.md, gateway-grpc-contract-001.md §2/§7
- uxui/int-006-admin-trace.md T3, uxui/int-007-trace.md §3
- requirement/req-043.md ถึง req-048.md, decisions-025.md, decisions-034.md, decisions-036.md, decisions-037.md
- design/data-model.mdเฉพาะลิงก์สารบัญตาราง+dictionary/contractที่เกี่ยวถ้าต้องพิสูจน์ว่าแค่ขาดAPIviewหรือขาดstorage; ห้ามอ่านทั้งcatalogโดยไม่จำเป็น
- plan/queue-004.md และ planning/task-062.md

งานนี้เป็น **gap receipt/route ไม่ใช่เขียนสัญญาครบ/ออกแบบDTOใหม่**. ภายในผลสั้นๆพิสูจน์ข้ออ้างจากintด้วยcanonicaldocsเอง: (1)draftread/edit/approvalevidence (2)Sheetpreview/import+atomic/dedup/stablekey (3)bankdraftread/edit (4)attemptresume/answers/history/policyview (5)expired/time (6)aggregate/proposalsnapshotread (7)missingG→Bmanifest. ข้อไหนมีแล้วชี้path:lineไม่สร้างgapซ้ำ. ข้อไหนขาดจริงระบุAPIส่วนที่มี/ส่วนที่ยังขาด ผลต่อUX เจ้าของtaskถัดไป และสิ่งที่ต้องตรึงก่อนimplement; แยกคำถามbusinessจริงจากtechnicalที่arch/sysต้องทำเอง. อย่าขอให้ผู้ใช้เดาตาราง/DTO. ไม่เติมendpoint/field/schema/lifecycleที่ยังไม่มีมติ

new_files: design/learning-ux-contract-gaps-001.md (ภาษาไทย <=10000UTF8bytes) ตารางgap/หลักฐาน/ผลกระทบ/route/เงื่อนไขเปิดงาน; ทุกtechnicalgapยังOPENไม่ใช่gatepassed และไม่ต้องสร้างคำถามให้คนหากกฎธุรกิจมีมติแล้ว. ยึดสัญญาท้องถิ่นเดิมตามpostmanapi-engineer/documentationของผู้คุม ไม่เพิ่มcollection/workspaceหรือpublish

exacteditsเฉพาะdesign/index.md: เพิ่มpointergapreceipt(ไม่เปลี่ยนDESrevision/PROPOSED); ชี้currentqueue004 และแก้แถว update-disposition-001 ที่ยังรอเลือกให้ระบุตัดสินexplicitPrepare/Installแล้วตาม036/037 คงเอกสารdispositionเดิมเป็นประวัติไม่regenerate. เพิ่มChangeLog2026-10-26. คง44REQ185AC/15verified95pending/32tablesและgatesทั้งหมด

คืนfencedJSONเท่านั้น <=3000tokens {"state":"DONE|NEEDS_REQUIREMENT_CHANGE|NEEDS_HUMAN|BLOCKED","summary":"...","new_files":[{"path":"knowledge/school-bot/design/learning-ux-contract-gaps-001.md","content":"markdownเต็ม"}],"edits":[{"path":"knowledge/school-bot/design/index.md","old":"uniqueexact","new":"replacement"}],"gaps":[{"id":"LUX-01","confirmed":true,"evidence":"path:line","owner_task":"...","needs_business_decision":false}],"open_items":[],"handoff":"..."}. ห้ามเขียนจริง/code/SQL/DB/tests/build/network/rolechain/Git. DONEหมายถึงgapreceiptครบไม่ใช่contractsหรือimplementationพร้อม

## Change Log
- 2026-10-26 — ลดขอบเขตหลัง067timeoutเพื่อรับหลักฐานและrouteที่ตรวจย้อนกลับได้โดยไม่เดาAPI
