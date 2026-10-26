# ใบงาน067 — arch ตรวจและเติมข้อเสนอสัญญาที่ UX-005/007 ต้องใช้

วันที่ 2026-10-26 · arch / codex t1 / read-only · docs-only; ผู้คุมบันทึกผล

K=C:/src/schoolbright/knowledge/school-bot. อ่าน K/index.md → design/index.md → requirement/index.md → uxui/index.md → plan/index.md และ plan/extension/index.md แล้วเปิดเฉพาะ:
- plan/tasks-001.json เฉพาะ UX-005/UX-007 และ BE-027..034, plan/evidence-002.md
- requirement/req-043.md ถึง req-048.md; req-036.md, req-039.md; decisions-020..025.md, decisions-032..034.md, decisions-038..041.md (เฉพาะเกี่ยว)
- design/modules.md, data-model.md และ linked dictionary/JSON/rules เฉพาะ curriculum/QuestionBank/attempt/ScoringPolicy/CourseRun/Level snapshots; des-005.md, des-010.md, des-011.md, des-012.md, data-contract-rules.md, learning-rules-032-034.md, teacher-authority-001.md, gateway-integration-001.md, gateway-grpc-contract-001.md
- uxui/int-006-admin-trace.md §T3 และ int-007-trace.md §3 (เป็นคำขอจากint ต้องพิสูจน์เอง ไม่เชื่อตามคำอ้าง); main/statecompanionsที่ลิงก์โดยตรงถ้าจำเป็น
- source as-builtแบบread-only: target/school-bot/AGENTS.md, web/README.md, web/src/SchoolBot.Api/Program.cs, web/src/SchoolBot.Application/Contracts.cs, app/frontend/src/App.tsx. ไม่มีAPIการเรียนจริงในไฟล์ที่อ่านให้ระบุข้อจำกัด ห้ามอ้างว่ามีimplementation
- skill C:/Users/jabja/.codex/plugins/cache/postman/postman/1.1.0/skills/api-documentation/SKILL.md (ใช้สัญญาท้องถิ่นเดิมเป็นauthoritative; ไม่ตั้งworkspace/publish/สร้างcollectionที่ไม่จำเป็น)

ข้อที่ต้องพิสูจน์และทำข้อเสนอสัญญาที่ขาดจริง:
1) Admin list/detail/read/edit draft + approval evidence; QuestionBank read/edit draft; immutable revisions/four-eyes/role boundariesเดิม
2) CoursePlanSheet preview/validate/import พร้อม stable row/key binding, D/O/P–X, validation/duplicate/atomicoutcome/readbackreplay; ห้ามสัญญา atomicถ้าไม่มีstorageรองรับหรือเดาschema เพิ่มfield/schemaที่จำเป็นต้องแยกเป็นข้อเสนอรอรับรอง
3) Resume/answers/attempt historyและsafe policy/revision view ไม่รั่วanswerkey; trustedtime/deadline/expired lifecycle โดยไม่เพิ่มbusinessruleที่มนุษย์ยังไม่ตัดสิน
4) Authoritative aggregate breakdown/frozen weights และLevel snapshot/roster/source refsที่ครูต้องอ่าน; ไม่ให้frontประกอบผลสดเป็นsnapshot
5) HTTP→RPC manifest ยังขาดlearning/admin ต้องแยกgRPC proposalและG/Lightรับรอง ไม่ขยายmanifestแบบเงียบ/ไม่สร้าง.proto

ห้ามสร้างfeatureใหม่หรือเปลี่ยนมติเดิม. ถ้ากฎธุรกิจไม่พอจริงให้ระบุTask/REQ/OQที่ต้องspec/มนุษย์ตัดสิน. ไม่ทำexpiredautoscore/atomicimport/หลังunknownค้นข้อมูลด้วยbroadqueryโดยสมมติ. สิ่งที่มีอยู่แล้วชี้exactpath:lineและไม่ออกแบบซ้ำ

ผล: new_files ข้อเสนอ addendum แบบแบ่งไฟล์ละ4–10KB ตามขนาดภาษาไทยจริง (UTF-8): design/learning-ux-contract-gap-review-001.md เป็นhub + companionเฉพาะจำเป็น. แต่ละoperationระบุmethod/pathที่client G, actor/scope, DTOrequired/optional/types/nullable/bounds, responseguarantees, error/etag/idempotency/replay/unknownreadback, sideeffects/sourceauthority. ข้อเสนอRPCระดับschemaเป็นเอกสารเท่านั้น ไม่codegen. ยกตัวอย่างsuccess+failureที่สำคัญด้วยsyntheticdataตามruleเดิม. ระบุสถานะPROPOSEDและapproval/evidenceที่ขาด ห้ามอ้างว่าตรึงหรือผ่านจริง

ยังไม่amend canonicalDES/DB/schemaเพราะมีข้อเสนอใหม่รอownerreview; ส่งตารางrelated-impactต่อowner(arch/spec/int/inspect/gm/vault)ว่าถ้ารับรองแล้วต้องแก้อะไร ไม่เปลี่ยนrevisionpointerปัจจุบันหรือindexให้ร่างเป็นapproved. ถ้าข้อเสนอไม่เปลี่ยนschemaให้พิสูจน์เทียบdictionary; ถ้าจำเป็นต้องเปลี่ยนให้แยกdeltaและรอประตูเดิม

คืนfencedJSON <=7000tokens {"state":"DONE|NEEDS_HUMAN|NEEDS_REQUIREMENT_CHANGE|NEEDS_DESIGN_CHANGE|BLOCKED","summary":"...","new_files":[{"path":"knowledge/school-bot/design/...","content":"markdownเต็ม"}],"gaps":[{"id":"LUX-01","reference":"path:line","confirmed":true,"disposition":"existing|proposal|needs_owner|needs_requirement","evidence":"..."}],"coverage":[],"open_items":[],"handoff":"..."}. ห้ามเขียนไฟล์จริงทุกrepo/SQL/DB/runtime/tests/build/network/publish/rolechain/Git. จบstateเดียวในJSON

## Change Log
- 2026-10-26 — routeจากint063/064ตามช่องว่างจริงที่ต้องตรวจ; Codex t1ตามผู้ใช้
- 2026-10-26 — runnerหมดเวลา600วินาที ไม่มีanswer (arch-067-timeout-001.json); ไม่รับartifact/ไม่อ้างว่าสัญญาใหม่ครบ. แยกscopeยืนยันgapและrouteในtask-071 โดยคงCodex t1
