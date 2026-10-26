# ใบงาน079 — gm sync มติ042/AC04607 และยอดcoverageปัจจุบัน

วันที่ 2026-10-26 · gm / codex t2 / read-only · เริ่มหลังspec075และinspect078บันทึกแล้ว

K=C:/src/schoolbright/knowledge/school-bot. อ่านK/index.md→requirement/index.md→test-plan/index.md→plan/index.md,extension/index.md,tasks-001.json,queue-004.md,evidence-002.md,owner-packet-001.md; requirement/decisions-042.md,req046AC07; test-plan/tp001amendment004/TP001081; uxui/index.md; planning/task-062.md. ถ้ามี076/077/080responseหรือreportอ่านเฉพาะsummaryactual ไม่เดาผลหากยังไม่มี

ผู้ใช้Aตอบจริงแล้ว การหมดเวลาตรวจsavedanswerอัตโนมัติ/ข้อว่าง0/นับครั้งตามpolicyเดิม; ไม่ถามA/Bซ้ำและไม่ถือเป็นUXsignoff. ปัจจุบัน44REQ186AC/81TPcasesตามspec075+inspect078; legacyTraceability/Joined/rawJSONยังsnapshot180/77ชี้amendmentล่าสุด ไม่regen. 110tasks/8phases/17gatesเหมือนเดิม status15verified95pendingก่อนUXsignoff. UX5ชุดมีsignedbaselineเดิม ส่วนexpiredcopydeltaและUX005007รอเซ็นตามint077 (ถ้ามีให้ใช้actual)

exacteditsเฉพาะplanfiles:
- canonicalJSONเพิ่มAC04607ให้BE031/FE021/UX007/QA013 (ดูtaskgoalจริงและเพิ่มจุดอื่นเฉพาะจำเป็นพร้อมเหตุผล) โดยไม่ลบACเก่าหรือเปลี่ยนDAG/owner/tier/effort/gates/taskIDs; metadata186AC81casesและnewdatedchangelogมติ042; ไม่flipstatus
- planindex/extensionindex/queue004/evidence002/ownerpacketcurrentnoticesแก้185→186/80→81เฉพาะcurrentfieldsที่เกี่ยว, expiredpending→Aตอบแล้ว, ขั้นต่อไปsyncdocsตามowner→ตรวจdelta→เซ็นUX. ประวัติเก่ามีprecedenceชัดให้คงไว้ ไม่rewritehistoryหรือclaimroleเสร็จถ้ายังไม่รับactual
- ใบtaskBE031/FE021/UX007/QA013หากเป็นgenericreferenceJSONไม่ต้องแก้; ถ้ามีenumeratedAC listให้syncเฉพาะAC07+changelog. ตอบcoverageว่าแก้/ไม่ต้องแก้แต่ละจุด
- งานรอบนี้เอกสารก่อนตาม062; ไม่มีSQL/DB/runtime/deploy/sourceGitหรือownerH5/gateclosureใหม่. จัดlinkactualproofให้เปิดอ่านได้ ไม่เพิ่มpermissionflow

fencedJSON<=3500tokens {"state":"DONE|BLOCKED","summary":"...","edits":[{"path":"knowledge/school-bot/plan/...","old":"uniqueexact","new":"replacement"}],"approved_ac_delta":[{"id":"BE-031","add":"AC-046-07"}],"coverage":[],"handoff":"..."}. ห้ามเขียนจริง/แก้ข้ามowner/status/Git/SQL/DB/tests/network/rolechain. DONEเฉพาะsyncข้อมูลแผน ไม่ใช่releaseหรือhumanapproval

## Change Log
- 2026-10-26 — related-impactจากมติAจริงและAC04607; คงscope featureเดิมและIDs
