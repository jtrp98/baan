# ใบงาน034 — arch ยืนยัน Desktop auth contract และเลือกส่วนลงโค้ด

วันที่ 2026-10-23 · arch Codex t1 read-only · ต่อ flow ผู้ใช้ "ทำตาม flow เลย". รับ sys task033 ก่อนเท่านั้น; ผู้คุมจะเริ่มใบงานนี้หลังบันทึกผล sys. ใช้ Codex ไม่ fallback. เจ้าของ requirement/schema/แผนคงเดิม

อ่าน index-first module/plan/design แล้ว planning/desktop-login-evidence-001.json (ผล033), planning/gateway-login-receipt-001.md, design/gateway-login-reuse-001.md, DES004/012 เฉพาะ auth และมติ035. ไม่สำรวจ auth ใหม่ทั้งหมด ใช้ source:line จาก sys เป็นหลัก; ถ้าต้องอ่านโค้ดเพิ่มเติมทำตาม AGENTS/graphify ของ repo. skill postman:api-engineer + api-documentation local contracts; ไม่ต้อง init/publish/install

ภารกิจ: ปิด design questions ของ033 ด้วยสัญญาที่ชัดพอให้ sys implement+check ตรวจได้. เลือก student/teacher completion approach จากหลักฐานจริง; แยก hashที่ไม่ต้องทำซ้ำ/identityที่ยังต้องตรวจ. กำหนด DTO/discriminants/bounds/normalization/token trust/tenant/account/profile mapping/purpose/error/timeout/retry และขั้น pending/challenge/fully-authenticated. คง C, opaque SchoolBot session, License, Channel, DeviceJkt, fresh authorization/035 ไม่อ้าง JWT/HTTP200เป็น session. ห้าม fakeIMEI, bypass2FA/contact/passwordreset หรือสร้าง mapping/account DB/verifier/hash ใหม่

เลือก smallest complete backend behavior slice ที่ทำจริงใน B=C:/src/schoolbright/target/school-bot ได้รอบนี้หลังรับสัญญา โดยมี meaningful tests และ integrateกับ production path จริง ไม่สร้าง unused framework/pure scaffolding/constant503แล้วอ้าง featureเสร็จ. ระบุส่วน prerequisiteพร้อมลงโค้ดกับส่วนรอ owner/runtimeก่อนenable แยกชัด; deployment/H5 unknownไม่ใช่เหตุห้าม unit-tested logicทั้งหมดโดยอัตโนมัติ. ถ้ายังไม่มี complete sliceจริงให้ระบุข้อเท็จจริงที่ขาดและ owner อย่างเจาะจง ไม่บังคับสร้างโค้ดปลอมเพื่อให้flowดูครบ

ขอบเขต implementationที่ผู้ใช้อนุญาตในflow: backend auth adapterใน B + tests/docเดิมที่ตรงงาน; ไม่ UI/installer/hardware/DB/SQL/productionlogin/deploy/sourcegitmutation. ห้ามแก้ G protected paths/hosting/auth โดยอ้างว่าได้รับ Light reviewแล้ว; ถ้าต้องแก้ Gให้แยก precise review packet/contractออกมา ไม่ตัดสินข้อยกเว้น REST→gRPC/tenantruleเอง. ไม่เปิดคำถามนโยบาย035หรือalgorithmให้ผู้ใช้. ยังไม่มี schema deltaที่อนุมัติ

ส่ง patch proposalให้ผู้คุม ไม่เขียนknowledge/sourceเอง. ใช้ appendoverrideมีprecedenceและChangeLog ไม่ regenerateDES; ผู้คุม archiveก่อนapply. allowedexisting filesเฉพาะ design/des-004.md,des-012.md,gateway-login-reuse-001.md,index.md. newfileได้ design/desktop-login-adapter-001.md และ review packetถ้าจำเป็น. ไม่แก้plan/gmfilesหรือให้PASS. คง110tasks pending/77cases NOT_RUN/Important6OPEN จนcheckมีverdictเฉพาะscopeจริง

คืน fencedJSONเดียว <=6500tokens {"state":"DONE|NEEDS_DESIGN_CHANGE|BLOCKED|NEEDS_HUMAN","summary":"...","decisions":[...],"edits":[{"path":"knowledge/school-bot/design/...","old":"uniqueexact","new":"..."}],"new_files":[{"path":"knowledge/school-bot/design/desktop-login-adapter-001.md","content":"complete spec tied to source + ChangeLog"}],"implementation":{"ready":true,"scope":"bounded exact behavior","files":[],"requirements":[],"contract":"...","verification":[],"excluded":[],"gates":[]},"remaining_evidence":[{"owner":"...","needed":"...","blocks":"..."}],"handoff":[]}. ready=falseถ้าไม่มีส่วนครบจริง ไม่ใช้NEEDS_HUMANเพียงเพราะยังไม่deploy/ไม่มีtestcredentials; owner/code evidenceหาได้ในworkspaceให้ routetechnicalต่อ ไม่สร้างคำถามapprovalใหม่จากการตีความskill

## Change Log

- 2026-10-23 — นายช่างเตรียมขั้น arch ตามflow ให้รับ033แล้วตรึงสัญญาและเลือกงานเขียนโค้ดที่พิสูจน์ได้
