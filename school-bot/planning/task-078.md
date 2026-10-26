# ใบงาน078 — inspect เพิ่มcoverageกรณีหมดเวลาAC04607

วันที่ 2026-10-26 · inspect / codex t2 / read-only · เริ่มหลังreq046/decisions042บันทึกแล้ว

K=C:/src/schoolbright/knowledge/school-bot. อ่านK/index.md→requirement/index.md→test-plan/index.md→design/index.md แล้วrequirement/decisions-042.md,req046AC07; test-plan/tp-001.md, traceability-001.mdเฉพาะmetadata/AC046casesและtest-plan/index.md (ไม่เปิดrawjsonทั้งก้อน); design/des-010.md,LUX05gapreceipt (หาก076ยังไม่บันทึกให้ใช้business042เป็นexpectedและmarktechnicaldetailรอ)

AmendTP001เพิ่มTP001-081เป็นเลขถัดจาก80 ครอบAC04607: หมดเวลาTest10ข้อ serverบันทึก6ถูก4→4/10แม้ไม่กดส่ง; ข้อว่าง0/คะแนนเต็มเดิม; ไม่รับคำตอบที่ค้างเครื่อง/ส่งไม่ทัน; count+retakepolicyเดิม รวมfailedresponse/reloadตรวจผลเดิมไม่finalizeซ้ำ. ระบุexpected/steps/data/preconditions/evidence/assertionsและactualNOT_RUNชัด. clock/race/preciseboundaryที่contractยังPROPOSEDให้markpendingtechnicalproofไม่แต่งผลผ่าน. อ้างactorstudent/Guest/teacherCloudbanตามเดิมเท่าที่เกี่ยว ไม่ขยายmanualgradingfeature

TPcurrentรวม81cases/186AC. เพิ่มAmendment004ในtp001MD/indexพร้อมreference042; traceabilityMD/JoinedJSON/rawTPJSONยังsnapshotเดิม180/77ให้คงประวัติและชี้coveragecurrentเพิ่มAC07อยู่Amendment004 ไม่regenraw/ไม่อ้างjoinedมี186. exacteditsเฉพาะowner test-plan,ไฟล์ใหม่companionถ้าจำเป็นไม่ขยายMDเกินbudgetที่มีอยู่. ไม่เปลี่ยนcaseIDsเก่า/actual/QA/verdict/status/gates. ให้mappingข้อเสนอBE031/FE021/UX007/QA013แก่gm ไม่แก้canonicaltaskเอง

คืนfencedJSON<=3000tokens {"state":"DONE|BLOCKED|NEEDS_DESIGN_CHANGE","summary":"...","new_files":[],"edits":[{"path":"knowledge/school-bot/test-plan/...","old":"uniqueexact","new":"replacement"}],"case_count":81,"ac_count":186,"handoff":"..."}. ห้ามเขียนจริง/code/SQL/DB/producttest/network/Git/rolechain. ยืนยันเพิ่มcoverageไม่ใช่testexecution

## Change Log
- 2026-10-26 — รับมติ042AและACใหม่เพื่อsynccoverage โดยยังไม่รันทดสอบระบบ
