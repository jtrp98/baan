# ใบงาน070 — int จัดแบ่งร่างที่ผ่านcheckและใช้กฎเฉพาะเว็บครู

วันที่ 2026-10-26 · int / codex t2 / read-only · ผู้คุมบันทึกผลเอง

K=C:/src/schoolbright/knowledge/school-bot. อ่านK/index.md→uxui/index.md แล้ว uxui/int-006-admin-curriculum.md, int-006-admin-states.md, int-006-admin-trace.md, int-007-attempt-policy.md, int-007-teacher-score.md, int-007-states.md, int-007-trace.md; planning/check-066-ux-review-001.md. สองร่างผ่านcheckด้านdraftcompletenessแล้ว ไม่เปิดกฎธุรกิจหรือมติเดิมใหม่ ทุกข้อQ39–Q46ยังรอเซ็น

งานreworkเอกสารครั้งที่1 (ไม่ใช่ACFAIL):
1) แบ่งไฟล์ที่เกินประมาณ10KBเป็นcompanionโดยย้ายเนื้อหาตามsectionเดิมตรงๆ ห้ามregenerate/ตัดAC/state/signoff/constraintsออก: adminmain14785B, adminstates17619B, admintrace13615B, attemptstates12128B. เป้าหมายแต่ละไฟล์ใหม่/ที่แก้<=11000UTF8bytes (งบ~4–10KB); เลือกsectionsplitที่อ่านง่าย อัปเดตnavigationและcrossrefsทุกแห่งใน7ไฟล์เดิมที่เกี่ยว โดยรักษาเลขsectionID/Q/ACและความหมายเดิม. newfilecontentฉบับเต็ม + editsold/newเฉพาะส่วนที่ย้าย/ลิงก์/changelogไม่ทับทั้งไฟล์. ลิงก์ควรใช้Markdownrelative; referencesแบบtextเดิมต้องชี้ไฟล์ที่ย้ายจริงไม่ปล่อย§ที่ไม่อยู่แล้ว
2) ข้อผิดพลาดbriefจากผู้คุม: skillกลางdefaultSpinner แต่ **repoของเว็บครูมีuserprojectinstructionที่สำคัญกว่า**. อ่านtarget/sb-tech-upgrade-web-system/AGENTS.md→_docs/policy/project-policy.md→CLAUDE.md→DESIGN.md และ .claude/rules/loading.md (เฉพาะกติกาที่เกี่ยวกับร่างUX007 ไม่แตะsource): หน้าteacher/Level/adminthresholdที่อยู่web-systemใช้ Skeletonเฉพาะส่วนที่โหลดตามP9; งานบันทึกปุ่มdisabled/.sb-progress-bar, ไม่ใช้Spinnerหรือข้อความloadingแทนโครงข้อมูล; reducedmotionและsharedcomponentตามrepo. Desktopและadminส่วนกลางในschool-botใช้กติกาของตน ไม่ลากweb-systemruleข้ามrepoหรืออ้างต้องmigration
3) แก้คำกล่าวในint006traceที่ว่าSpinnerเป็นคำสั่งผู้ใช้โดยตรง เพราะเป็นbriefของผู้คุม ไม่ใช่คำสั่งผู้ใช้. ระบุrulepriorityและplatformชัดตามข้อ2 ไม่ต้องขอhumanapprovalเรื่องแก้loadingเพื่อให้ตรงกฎเดิม. จุดที่component/font/spacingของweb-systemต่างจากskillให้ยึดDESIGN/sharedpropsเดิม ไม่hardcodeหรือเปลี่ยนstack; ไม่อ้างUIverifiedถ้ายังไม่อ่านcomponent
4) ส่งexacteditsuxui/index.mdเพิ่ม2ชุดพร้อมcompanionlinks: UX005/007ร่างผ่านcheck066แต่ยังไม่เซ็น; signedรวม5/7เท่าเดิม. แก้ข้อความ"กำลังร่าง"/"ร่างทั้งสอง"เดิมที่ล้าสมัยให้ชัด ห้ามแก้signedartifacts001–005

ส่งfencedJSON<=6500tokens {"state":"NEEDS_HUMAN|BLOCKED|NEEDS_DESIGN_CHANGE","summary":"...","new_files":[{"path":"knowledge/school-bot/uxui/...","content":"movedsectionsเต็ม"}],"edits":[{"path":"knowledge/school-bot/uxui/...","old":"uniqueexact","new":"replacement"}],"moved_sections":[{"from":"...","to":"...","sections":[]}],"questions_changed":false,"limitations":[],"handoff":"..."}. ต้องรักษาเนื้อหาทั้งหมดเว้นจุดแก้loading/rulepriorityที่ระบุและnav/filechangelog; ไม่แก้design/requirement/plan/status/signoff. ห้ามเขียนไฟล์จริง/SQL/DB/tests/build/network/Git/rolechain. เช็คbytebudgetผ่านการคำนวณได้ ไม่ใช่producttest

## Change Log
- 2026-10-26 — ผู้คุมส่งreworkเอกสารจากbudgetและกฎrepoP9หลังcheck066PASS; codex t2ตามผู้ใช้
