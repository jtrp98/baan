# ใบงาน065 — gm sync คิว/สถานะที่คลาดเคลื่อนและ owner packet

วันที่ 2026-10-26 · gm / codex t2 / read-only · งานต่อเนื่องแผนใหญ่เดิม ไม่สร้าง scope ใหม่

K=C:/src/schoolbright/knowledge/school-bot. อ่าน K/index.md → plan/index.md → plan/extension/index.md → plan/tasks-001.json → plan/evidence-002.md → plan/dispatch-001.md → plan/queue-003.md → backlog.md. จากนั้นอ่าน:
- planning/task-062.md, planning/check-061-verdicts-001.md, planning/task-061.md
- requirement/index.md, requirement/decisions-036.md ถึง decisions-041.md
- uxui/index.md (ปัจจุบัน signed 5/7; int006/007 กำลังร่างในรอบนี้ ห้ามอ้างว่าผ่านตรวจหรือเซ็นแล้ว)
- design/index.md, design/gateway-grpc-contract-001.md §7, design/gateway-integration-001.md
- planning/h5-questionnaire-001.md, planning/routing-linkage-evidence-002.json
- db/index.md, db/db-safe-evidence-001.md, db/db-safe-evidence-cover-001.md
- test-plan/index.md, qa/index.md, security.md เฉพาะสถานะปัจจุบัน

ปัญหาที่ต้องแก้: plan/index และ extension มี verified15/pending95 แล้ว แต่ tasks-001.json status pending110; module index/evidence/dispatch/queue ยังแสดงยอดเก่าและ runner เก่า. ทำ related-impact sweep เฉพาะไฟล์ปัจจุบันที่ระบุข้างบน ไม่แก้ประวัติ/response/raw/archive. รายชื่อ verified ให้พิสูจน์เองจากตาราง+verdict ต้นทาง ไม่เพิ่ม verified หรือปิด gate. ปรับ JSON status15รายการให้ตรง verdictได้โดยส่ง delta IDs ให้ผู้คุมลงเอง; วันที่/revisionเดิมมีประวัติจึงใช้ amendment/precedence พร้อม change log (ไม่ลบประวัติหรือ regenerateJSON). ตรวจ count44REQ/185AC/80TP/110tasks/15verified/95pending/8phases/17gates. canonical task status ไม่ใช่เปอร์เซ็นต์โค้ดและไม่ใช่ gateผ่าน. คง IDs/DAG/effort/scope/owner/tier/gate definitions

ผู้ใช้กำหนดใหม่ t0/t1/t2=codex, t3/t4/t5=agy, --no-fallback (precedenceเหนือ runner เก่าทั้งหมด); ไม่ใช้ native subagent แทน. งานรอบนี้เอกสารก่อนตาม task062. ไม่เรียก plan มา replan. คุณคือ gm ห้ามเรียก role/CLI ต่อหรือเขียนไฟล์จริง

ผลที่ต้องส่ง:
1. new_files: plan/queue-004.md คิวล่าสุดสั้นตาม dependencyจริง อะไรทำได้/รอคน อ้าง artifacts ที่ครบแล้ว ไม่สั่งทำงานเตรียมที่เสร็จซ้ำ ไม่ปิดH5/G-CORE/UXโดยอัตโนมัติ. UX005007ร่างได้ทันทีรอcheck+คนเซ็น; ห้าม implementก่อนprerequisites. ระบุไม่ใช้4032localtestsแทนintegration
2. new_files: plan/owner-packet-001.md เป็นชุด review ที่ส่งต่อได้ทันทีถึง G/Light/infra/BFF และเจ้าของDB: ข้อที่ต้องตอบ ผู้รับตามrole หลักฐานแนบ รูปแบบresponseขั้นต่ำ ลำดับเปิดงาน; ไม่ขอsecret/ค่าจริง/บัญชีจริง ไม่รันSQLหรือส่งข้อความแทนผู้ใช้ ไม่สร้างคำถามซ้ำเรื่องtransport/cType/035. แยก owner approval, DB evidence, UX sign-off และruntime ต้องทำภายหลัง
3. exact edits เฉพาะไฟล์ของgm: plan/index.md, extension/index.md ถ้าต้อง, evidence-002.md, dispatch-001.md, queue-003.md (pointer current), tasks-001.json (เฉพาะ metadata notice/refsถ้าจำเป็น). ทุกแก้มีChangeLog2026-10-26 ไม่ regenerate
4. JSON status_sync [{id,from,to,evidence}] 15รายการให้ผู้คุม applyหลังตรวจ evidence; coverage list สำหรับผู้คุมแก้ moduleindexและuxuiindexเอง ไม่แก้ข้ามowner

ส่ง fencedJSON อย่างเดียว <=6500 tokens {"state":"DONE|BLOCKED|NEEDS_HUMAN","summary":"...","new_files":[{"path":"knowledge/school-bot/plan/...","content":"markdownเต็ม"}],"edits":[{"path":"...","old":"unique exact","new":"exact replacement"}],"status_sync":[{"id":"...","from":"pending","to":"verified","evidence":"..."}],"coverage":[{"path":"...","action":"amend|consistent|historical_preserve","reason":"..."}],"open_items":[],"handoff":"..."}. ไฟล์ใหม่ละ~4–10KB; ไม่เขียนจริง/ไม่แก้code/git/SQL/DB/tests/build/network ไม่มีownerapprovalเกิดขึ้นจากการเขียนpacket

## Change Log
- 2026-10-26 — ผู้คุมตรวจพบJSON pending110ขัดกับ15verifiedในindexและมอบgm syncพร้อมownerpacket; runnercodexตามผู้ใช้
