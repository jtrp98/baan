# ใบงาน 020 — arch รับหลักฐาน BE-001 และจัด auth evidence pack

วันที่ 2026-10-23 · arch tier t1 · read-only · Claude ก่อน AGY และ Codex สุดท้าย (--no-fallback ผู้คุมคุมลำดับ)

อ่าน index-first school-bot/index.md, design/index.md, plan/index.md แล้ว planning/legacy-auth-response-001.json (sys/Claude DONE จากtask017), design/des-004.md, des-012.md, source-review-002.md และ plan/BE-001.md, SA-001.md, evidence-002.md เฉพาะ G-AUTH/H5. Baseline decisions-025/026/032 ยืนยันแล้ว ไม่เปิดนโยบายถามซ้ำ.

หน้าที่รอบนี้คือรับ/ตรวจหลักฐาน auth จากsys ไม่ใช่ regenerate DES/schema/plan และไม่ใช่ปิด SA-001 ทั้งก้อน. sys พบ web/mobile verifierต่างกัน, employee mappingขัดกัน, student mappingมีcode, IsAdmin=1 producerยังขาด. sysบอกอ่านindexไม่ครบและใช้บางAcademicevidenceจากเอกสารเก่า จึงอย่ารับ 'proven' ทั้งหมดโดยไม่ตรวจ. อ่าน AGENTS/CLAUDE ของ target ก่อน. ตรวจ source:line สำคัญโดยตรง รวม TeacherRepository.cs:24-32 และ PlanCourseRepository.cs:194-215 เพื่อปิดช่องที่อ่านได้ในworkspace. ห้ามสแกนทั้ง C:/src หรือ secrets.

ส่ง addendum แบบใหม่ให้ผู้คุมบันทึก design/auth-evidence-001.md พร้อมหลักฐานที่รับ/หักล้าง, compatibility/fixture policyที่ยังไม่ยืนยัน, trust boundaryและfail-closed. หากต้องamend DES ให้คืน exact old/new เฉพาะส่วนข้อเท็จจริงที่ตรวจได้/ลิงก์และChangeLog ไม่คัดทั้งไฟล์ ไม่เลือก superset verifierแทนเจ้าของ. การมีportไม่เท่ากับlegacyต้นฉบับ; ownerชื่อจากcommentเป็น candidateยังไม่ยืนยัน. แยก implementation gaps (ทีมแก้ได้) จาก missingexternalfacts (เจ้าของระบบให้source/DDL/sanitizedfixtures). จัดคำขอหลักฐานเทคนิคให้ส่งได้จริง: repo+commit+paths / schemaexcerpt / fixture fields / expected พร้อมผู้เตรียมที่ยังไม่ทราบ ห้ามขอ credentials/PII/รหัสผ่านจริง. หากขาดsourceให้ใช้ผลค้นหาเฉพาะworkspace ไม่อ้างว่าไม่มีทุกที่.

จัด H5 checklist แบบ concrete: W BFFroute, G web-principal, B session/bootstrap, env variable namesและ trust/network/originค่าที่คนต้องระบุ, staffbootstrapสิ่งที่ต้องเตรียมและre-audit. ไม่ระบุidentity/host/secretหรือriskacceptanceแทนคน. ไม่เขียนcode/knowledge/SQL, ไม่เรียกrole/DB/loginจริง, ไม่เปลี่ยนstatusplan. ข้อsecurityจากSEC-001กำลังตรวจแยก งานนี้อย่าอ้างว่ารับผลที่ยังไม่เห็น.

คืน fenced JSON เดียวประมาณ<=6,000tokens:
{"state":"DONE|NEEDS_DESIGN_CHANGE|NEEDS_HUMAN","summary":"...","verified":[{"topic":"...","result":"...","evidence":["source:line"]}],"edits":[{"path":"knowledge/school-bot/design/...","old":"exact unique text","new":"..."}],"new_files":[{"path":"knowledge/school-bot/design/auth-evidence-001.md","content":"Markdown ไทยพร้อมChangeLog"}],"technical_requests":[{"id":"...","candidate_owner":"... (ยังไม่ยืนยัน)","needed":"...","safe_fixture_fields":["..."],"blocks":["..."]}],"handoff":[{"role":"...","task":"...","action":"..."}]}

## Change Log
- 2026-10-23 — นายช่างส่งผล sys ที่บันทึกจริงให้ arch ตรวจต่อ; ไม่มีการเปิดนโยบายหรือimplementation
