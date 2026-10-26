# ใบงาน069 — inspect แยกtrace snapshot180จากcoverageปัจจุบัน185

วันที่ 2026-10-26 · inspect / codex t2 / read-only. K=C:/src/schoolbright/knowledge/school-bot

อ่านK/index.md→test-plan/index.md→requirement/index.md แล้วtest-plan/tp-001.md, traceability-001.md, traceability-001.json เฉพาะmetadata/ACinventory และrequirement/decisions-037.md; planning/task-062.md เท่านั้น. ห้ามเปิดrawTP001JSONทั้งก้อนถ้าไม่จำเป็น

related-impactจากgm065: test-plan/index rowTraceability180/Joinedrevision2อาจทำให้คนเข้าใจว่าcurrentcoverage180ทั้งที่TP80/185แล้ว. ตรวจไฟล์จริงก่อน: ถ้าtraceยัง180ให้ระบุว่าsnapshotเดิม180และ5ACเพิ่มเติมอยู่ในTPamendment003 ไม่อ้างว่าjoined185ถ้าไม่จริง. ถ้าครบ185ชี้evidence. exacteditsเฉพาะtest-plan/index.md+ChangeLog2026-10-26. ไม่แก้snapshot/raw/actual/REQ/tasks/status/caseIDs, ไม่สร้างtestexecutionหรือharnessปลอม. คืนfencedJSON <=1700tokens {"state":"DONE|BLOCKED","summary":"...","edits":[{"path":"knowledge/school-bot/test-plan/index.md","old":"uniqueexact","new":"replacement"}],"evidence":[],"handoff":"..."}. ห้ามเขียนไฟล์จริง/SQL/DB/network/tests/build/Git/rolechain

## Change Log
- 2026-10-26 — related-impact sweepตามgm065; codex t2ตามผู้ใช้
