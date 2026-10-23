# ใบงาน044 — sys แก้ CHECK041-001 Actor ตามสัญญาเดิม

วันที่2026-10-24 · sys/Codex t3 writeเฉพาะproductionauditactor. Exact K=C:/src/schoolbright/knowledge/school-bot; B=C:/src/schoolbright/target/school-bot. อ่านK/index.md→K/plan/index.md→K/design/index.md แล้ว K/planning/auth-flow-check-response-001.json findingCHECK041-001, K/design/data-dictionary/contract-index.md→contract-001.md/contract-002.md, table005/006 เฉพาะsession/audit. อ่านB/AGENTS/READMEก่อนแก้

แก้ PostgresSessionLogoutStore.cs ที่ทำActorเป็นjson_build_object::text ให้ตรงcanonicalAของcontract001ทุกchannel: desktopunbound/boundstudent/boundemployee, school_webemployee/admin, staff_admin. ใช้ข้อมูลจากrowที่ตรวจอยู่เท่านั้น, canonicaldecimal, nullable fieldsตามschema, ไม่เดาAccountId=ProfileIdหรือlookupcrossDB. คงrevoke+audittransaction/SQLparameters/hash/no-secret/no-rawtokenและauditcolumnsเดิม ไม่SQL/schema/newaccountmapping. ถ้าช่องrequiredของActorไม่มีในsessioncontractให้หยุดเฉพาะประเด็นนั้นแล้วส่งexactgapให้arch ไม่ใส่fallbackactorใหม่เอง

แก้เฉพาะrepositoryและhelperที่จำเป็นจริงตามภารกิจ ไม่ลดassertion/แตะtestsหรือcodecomponent/limiter. check045กำลังแก้testfixturesคนละไฟล์ **ไม่build/testพร้อมwriterอีกตัว** ส่งsourceพร้อมให้parentรันรวมจริง; ไม่เปิดDB/SQL/socketแม้localhost. Source/diffstaticcheckได้และส่งtruth tableactorstringทุกchannelให้checkตรวจ. ห้ามknowledge/gitstate/network/hardware/rolechainหรือsourcecommit

คืนfencedJSON<=2000tokens {"state":"DONE|NEEDS_DESIGN_CHANGE|BLOCKED","summary":"...","files_changed":[],"actor_examples":[],"checks":[],"limitations":[],"handoff":[]}. ไม่PASS/fulltaskclose

## Change Log
- 2026-10-24 — นายช่างส่งรอบแก้1ตามcheckfindingจริง ไม่เปลี่ยนlogicalcontractเพื่อให้โค้ดเดิมผ่าน
