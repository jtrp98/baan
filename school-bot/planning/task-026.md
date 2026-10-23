# ใบงาน026 — inspect ปรับ2casesตามspecที่บันทึกแล้ว

วันที่2026-10-23 · inspect t2 read-only · Claude→AGY→Codexสุดท้าย --no-fallback

อ่านindex-first school-bot/index.md,requirement/index.md,design/index.md,plan/index.md แล้ว planning/spec-test-gaps-response-001.json, req-025/027ปัจจุบัน (ผู้คุมapply9editsแล้ว), test-plan/tp-001.json เฉพาะTP001-007/019,gaps01/02 และcanonical task ac_idsที่เกี่ยว. ไม่ต้องอ่าน180AC/77casesซ้ำ. จำนวนและIDsเดิม44/180/77คงเดิม; JSON+ownerjoinของผู้คุมครบ180 ทุกactualNOT_RUN

รับhandoffspec: แก้TP001-007ให้รองรับ/v2/admin staffsession+StaffRole 503/401/403 และปิด/v1/admin ไม่ยึดstaticadminkey. TP001-019แยกUI load UTF16codeunits 16384/16385 กับruntime UTF8byteboundของBR-025-03 เพิ่มmultibyteที่expectยืนยันได้จากREQ แต่DES003ยังขัดอยู่ ให้statusgap01เป็นrequirementclarified/designsyncpending ไม่ปิดruntime/ไม่เติมPASS. Errorcodeกรณีไม่มีroleอ้างสัญญาจริงอย่าเดาSTAFF_ROLE_REQUIREDถ้าไม่มีในDES. Gapsอื่นคงเดิมไม่ได้ถูกแก้ในงานนี้. ผู้ใช้ให้legacyและgatewaytopologyล่าสุด archกำลังรับ ไม่ต้องเปลี่ยนเคสauthอื่นจนมีcontractใหม่

คืนfencedJSONเดียว<=2500tokens {"state":"DONE|NEEDS_DESIGN_CHANGE","summary":"...","case_edits":[{"id":"TP001-...","field":"action|expected|fixture|refs","old": "valueเดิมตรง" ,"new":"valueใหม่"}],"gap_updates":[{"id":"GAP-01|GAP-02","status":"...","resolution":"...","remaining":"..."}],"handoff":["..."]}. ผู้คุมarchiveก่อนamendJSON/render Markdown/traceabilityให้ตรงREQ ไม่ต้องคืนเอกสารทั้งก้อน. ห้ามไฟล์writes/tests/planstatus/rolechaining

## Change Log
- 2026-10-23 — ปรับตามrequirementเดิมที่ชัดขึ้น ไม่เพิ่มจำนวนAC/caseหรืออ้างQAผ่าน
