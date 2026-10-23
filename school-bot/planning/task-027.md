# ใบงาน027 — gm รับหลักฐานรอบนี้และจัดคิวต่อแบบdelta

วันที่2026-10-23 · gm t2 read-only · Claudeชนweeklylimitแล้วจากarch task023 (report2026-10-23-05-20-54-arch-tier-t1-1agents-Po5MY0) ผู้คุมใช้AGYก่อนCodexตามผู้ใช้ ไม่retryClaudeที่รู้ว่าใช้ไม่ได้

อ่านindex-first school-bot/index.md,plan/index.md,requirement/index.md,design/index.md แล้วplan/queue-002.md,evidence-002.md,backlog.md และผลจริงที่บันทึก: planning/legacy-auth-review-001/002.md,legacy-source-check-001.json,user-context-001.md,spec-test-gaps-review-001.md,security-disposition-001.md,security-mitigation-001.md,test-plan/index.md,tp-001.jsonเฉพาะgaps/amendments. ไม่มีcode/testSQL/runtime/signoffในรอบนี้ ทุก110tasksยังpending 44REQ180AC 17gates 8phasesเดิม

ส่งdeltaสั้นไม่ต้องอ่าน/คืนtasksJSONทั้งก้อน: เพิ่มbacklogตามownerที่archร้องขอ (ถ้าพบอยู่แล้วไม่ซ้ำ) สำหรับbugในportG/AกับlegacyนอกSchoolBot: queryactive/WorkStatus/rosterไม่กรองtenantหรือผิดkey, legacyIsAdmin sessionกับJWTต่างกัน/การhandoffqที่มีข้อมูลอ่อนไหว, headerloggingตามSEC001-013. ติดป้ายยังไม่ผ่านsecuritytriageของเจ้าของระบบ ไม่กำหนดseverity/รับriskแทนjpo ไม่เพิ่มscope/tasksrelease. สิ่งที่มีtaskเดิมอยู่แล้วให้route taskเดิม ไม่แตกงานใหม่

ทำqueue-003หรือamendqueueแบบappendตามownerให้เริ่มต่อจากหลักฐานจริง: authn/h5+gateway, DBsafe-evidence, designgapsจากTP, Guestcontracts/units/ETag/update disposition, content/hardware/delivery/UXartifact และยังไม่ปิดgates. ผู้ใช้บอกSchoolBotเป็นserviceผ่านgatewayและให้legacyพาธจริงแล้ว ห้ามถาม2เรื่องนั้นซ้ำ. รายละเอียดgateway integrationกำลังให้archผ่านAGYรับ task023 ยังไม่มีoutputในknowledge อย่าเขียนว่าdone/approve/routeverified. งานprepareที่ไม่พึ่งคำตอบเดินต่อได้; ไม่มีphase barrier

บันทึกpreferenceผู้ใช้สำหรับคิว: Claude→AGY→Codexสุดท้าย พร้อม--no-fallbackผู้คุมคุมลำดับ; ถ้าClaudeweeklylimitยังอยู่ข้ามไปAGY ไม่fallbackCodexก่อนAGY. ไม่ต้องแก้globalagents/config/code. ส่งข้อที่รอทีมเตรียมartifactก่อนaskhuman; ยังไม่มีsignoffหรือriskacceptanceใหม่ ไม่ระบุperson-daysเป็นdeadline

คืนfencedJSONเดียว<=3500tokens {"state":"DONE","summary":"...","edits":[{"path":"knowledge/school-bot/backlog.md|...plan...","old":"uniqueexact","new":"..."}],"new_files":[{"path":"knowledge/school-bot/plan/queue-003.md","content":"...พร้อมChangeLog"}],"handoff":["..."]}. ไม่เปลี่ยนtasks/status/dependencies/gates/REQcounts ไม่writefiles/เรียกrole/sourcegit/SQL/runtime

## Change Log
- 2026-10-23 — นายช่างส่งผลเตรียมหลักฐานให้เจ้าของแผนจัดคิวต่อและเก็บนอกscopeในbacklog
