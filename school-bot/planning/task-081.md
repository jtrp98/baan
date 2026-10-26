# ใบงาน081 — int แก้ C080-01..03 เฉพาะ trace

วันที่ 2026-10-26 · int/codex t2/read-only. K=C:/src/schoolbright/knowledge/school-bot

อ่าน K/index.md→uxui/index.md→requirement/index.md→design/index.md แล้วเฉพาะ uxui/int-007-trace.md, requirement/req-046.md, design/des-010.mdส่วนAmendment076, design/learning-ux-contract-gaps-001.mdLUX05, planning/check-080-expired-delta-001.md และ test-plan/tp-001-amendment-004.md:20 (TPมีexecutionreceiptของผู้คุมแล้วให้ตรวจactual ไม่แก้ไฟล์inspect)

แก้3findingที่อยู่ในownerint: traceบอกยังไม่มี076ทั้งที่บันทึกแล้วให้ชี้Amendment076และคงtechnicalclock/race/finalization/recovery/read-revealOPEN; ลบบรรทัดว่างที่ตัดตารางหลังAC04607ให้16ACอยู่ในตารางเดียวครบ3columns; อ้างreq046AC01..06ให้ตรงบรรทัดปัจจุบัน24/25/26/27/29/30โดยตรวจไฟล์จริง. ไม่แก้business/copy/UXsignoff/AC/Q39–46หรือไฟล์อื่น. เพิ่มChangeLog26เท่านั้น ไม่regen

fencedJSON<=1300tokens {"state":"DONE|BLOCKED","summary":"...","edits":[{"path":"knowledge/school-bot/uxui/int-007-trace.md","old":"uniqueexact","new":"replacement"}],"evidence":[],"handoff":"..."}. ห้ามเขียนจริง/SQL/DB/tests/network/code/Git/rolechain. ทำเฉพาะ3ข้อ ไม่ร่างUXใหม่

## Change Log
- 2026-10-26 — rework1จากcheck080 เฉพาะ3ข้อเอกสารที่ตก
