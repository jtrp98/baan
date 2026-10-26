# ใบงาน076 — arch amend เฉพาะผลหมดเวลาตามมติ042

วันที่ 2026-10-26 · arch / codex t1 / read-only · เริ่มหลังreq046/decisions042บันทึกแล้ว

K=C:/src/schoolbright/knowledge/school-bot. อ่านK/index.md→requirement/index.md→design/index.md แล้วrequirement/decisions-042.md, req-046.md AC-046-07, expired-attempt-decision-proposal-001.md; design/des-010.md, learning-rules-032-034.md, learning-ux-contract-gaps-001.md LUX05; data-model.mdลิงก์ExamAttempt/selectedresult/JSONpolicyและdictionary/table-024.md, contract-002.md, contract-003.mdเฉพาะเกี่ยว; des-011.mdเฉพาะผลหมดเวลาเข้าคะแนนรวม/Level; uxui/int-007-trace.mdข้อexpired

amendให้น้อยที่สุด: userAหมดเวลาแล้วตรวจคำตอบที่serverบันทึกทันเวลาอัตโนมัติ ข้อว่าง0 คะแนนเต็มทั้งชุด แม้ไม่กดส่งนับครั้ง/สิทธิ์ซ่อมตามpolicy/snapshotเดิม. stateexpiredยังexisting อย่าสร้างstate/field/table/APIใหม่เพียงเพราะACใหม่. ชี้ผลต่อselectedresult/maxretake/aggregateตามกฎเดิม. แยกmutationsหลังexpired(ไม่รับanswersเพิ่ม)จากreadoutcome/feedbackตามpolicyเดิม. ตรวจcontractsourceก่อนระบุว่าscoreexistingfieldรองรับ. กลไกclock/race/idempotentfinalization/recoveryเป็นtechnicalที่ยังต้องตรึงและพิสูจน์ ห้ามอ้างworker/endpoint/transactionมีแล้ว. ถ้าเลือกtechnicaldetailใหม่ให้ติดPROPOSEDไม่เปลี่ยนschemaหรือเปิดimplementation/gates

แก้LUX05ว่าbusiness042ตอบแล้ว เหลือtechnicalproof; gapsอื่นOPEN. เพิ่มpointer/Revหรือdatedamendmentในdesign/indexให้ตรงเอกสารจริงโดยคงPROPOSED; relatedimpactoldrefsเท่าที่จำเป็น ห้ามแก้ownerอื่น. หากdes005หรือdata-contract-rulesมีข้อความขัดAชัดให้amendจุดนั้นพร้อมเหตุผล ไม่กวาดนอกscope

คืนfencedJSON<=3000tokens {"state":"DONE|NEEDS_DESIGN_CHANGE|NEEDS_REQUIREMENT_CHANGE|BLOCKED","summary":"...","edits":[{"path":"knowledge/school-bot/design/...","old":"uniqueexact","new":"replacement"}],"coverage":[],"open_items":[],"handoff":"..."}. ไม่เขียนจริง/code/SQL/DB/tests/network/Git/rolechain. คง32tables/DTOfields/17gatesโดยไม่อ้างว่าพิสูจน์schema/runtimeใหม่. หมวดอื่นผู้คุมrouteตามownerแล้ว

## Change Log
- 2026-10-26 — รับมติAจริงจาก042เพื่อsyncเฉพาะสัญญาที่อ้างผลexpired; Codex t1
