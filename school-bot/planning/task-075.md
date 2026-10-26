# ใบงาน075 — spec บันทึกมติ A: ผลข้อสอบเมื่อหมดเวลา

วันที่ 2026-10-26 · spec / codex t2 / read-only · ผู้คุมจะapply

ผู้ใช้ตอบแบบฟอร์มจริงในแชต: **"A: ตรวจคำตอบที่บันทึกแล้วอัตโนมัติ ได้ 4/10 (แนะนำ)"**. คำถามที่ผู้ใช้ตอบระบุTest10ข้อ บันทึกทันเวลา6ข้อ ถูก4ข้อ คำตอบค้างเครื่องไม่รับย้อนหลัง ทั้งสองทางนับการทำครั้งนี้/ใช้สิทธิ์ซ่อมตามpolicyเดิม. จึงเลือกAจากproposal072จริง ไม่ใช่เดาapprovalจากคำแนะนำ

K=C:/src/schoolbright/knowledge/school-bot. อ่านK/index.md→requirement/index.md→open-questions/index.md แล้วrequirement/req-046.md,req-047.md,req-048.md, decisions-024.md,025.md,034.md,041.md; expired-attempt-decision-proposal-001.md; design/index.md→learning-ux-contract-gaps-001.md LUX-05. ไม่ค้นหรืออ่านทั้งrepo

ส่งnew_files requirement/decisions-042.md บันทึกมติactualวันที่26พร้อมขอบเขตA: เมื่อหมดเวลาปิดattempt ตรวจอัตโนมัติเฉพาะคำตอบที่serverบันทึกทันเวลา ข้อไม่มีคำตอบได้0 คะแนนเต็มคงทั้งชุด แม้ไม่กดส่งก็นับครั้ง/สิทธิ์ซ่อมตามpolicy/snapshotเดิม; คำตอบค้างเครื่องหรือส่งไม่ทันไม่รับย้อนหลัง. ตัวอย่าง4/10ตามคำถาม. แยกมติbusinessจากclock/race/DTO/lifecycleที่arch/sysต้องทำ ไม่อ้างproduction/UIพร้อมและไม่ให้humanUXsignoffแทนผู้ใช้

exacteditsเฉพาะownerrequirement: req046เพิ่มBRสำหรับAและAC-046-07(เลขถัดจาก06)ที่ทดสอบผลหมดเวลาได้ชัด ใช้ตัวอย่างครบ10/6/4และcountpolicyเดิม. แยกความหมายexpiredauto-scoreจากsubmitโดยผู้เรียน ไม่เปิดmanualgradingfeatureหรือเปลี่ยนretake/maxscore/weights/roster. req047/048ถ้าต้องเพิ่มreadingpointerมติไม่เปลี่ยนสูตรเดิม/AC. indexเพิ่มdecisions042และยอด44REQ/186ACถ้าเพิ่ม1ACตามนี้; proposal072เพิ่มprecedenceว่าเลือกAแล้วชี้042 เก็บคำถาม/ทางเลือกเดิมเป็นประวัติ ห้ามrewriteทั้งไฟล์. ใส่ChangeLog26ทุกfile

ส่งimpactlistให้arch/int/inspect/gm: DES010/learningrules/UX004ที่signedและUX007draft/TPcase/canonicaltaskmapping/indexยอด185→186. ระบุว่าการตอบAไม่signoffQ39–Q46และไม่closeowner/H5/DB/hardware/security/runtime. ไม่สร้างOQใหม่ซ้ำหรือเปลี่ยนOQเก่าถ้าไม่เกี่ยว

fencedJSON<=3000tokens {"state":"DONE|BLOCKED|NEEDS_REQUIREMENT_CHANGE","summary":"...","new_files":[{"path":"knowledge/school-bot/requirement/decisions-042.md","content":"markdownเต็ม"}],"edits":[{"path":"knowledge/school-bot/requirement/...","old":"uniqueexact","new":"replacement"}],"impact":[],"handoff":"..."}. ห้ามเขียนจริง/SQL/DB/network/tests/sourcecode/Git/rolechain. ไม่ลงstatuscanonicaltaskหรือsignoffUX

## Change Log
- 2026-10-26 — รับคำตอบผู้ใช้Aจริงและrouteบันทึกมติ/REQก่อนส่วนที่พึ่งพา
