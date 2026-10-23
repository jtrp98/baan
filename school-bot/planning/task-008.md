# SchoolBot — BA amend REQ/AC จากมติล่าสุด

- วันที่งาน: 2026-10-22 (Asia/Bangkok ตามผู้ใช้)
- คำสั่งผู้ใช้: งั้นเรียก ba เลย
- งาน: ปรับ requirement/business rules/AC และ OQ ที่เกี่ยวกับคำตอบจริงให้พร้อมส่ง SA/BE/DBA ไม่ใช่ร่างระบบใหม่หรือเริ่ม implementation
- เจ้าของเอกสาร BA; role read-only ส่ง output ให้ นายช่าง บันทึก ไม่มีการเขียน code/design/plan/SQL/QA หรือเรียก role ต่อ
- Dispatch แล้ว: mycelium-role ba/t2 แบบ read-only, gpt-6.1-sol/high, timeout1800s, exec session44464; report C:/src/AICode/baan/baan/reports/2026-10-22-01-03-31-ba-tier-t2-1agents-IWkZf4

## อ่านตาม path — index first

Knowledge root: C:/src/schoolbright/knowledge/school-bot

- index.md; requirement/index.md; open-questions/index.md; design/index.md; plan/index.md; backlog.md
- requirement/scope.md; requirement/source-references.md
- requirement/req-009.md, req-011.md, req-012.md, req-031.md, req-032.md, req-033.md, req-034.md, req-035.md, req-036.md, req-037.md, req-038.md, req-039.md
- requirement/decisions-001.md ถึง decisions-019.md (ทุกไฟล์ในช่วงได้รับอนุญาต; อ่านเฉพาะที่จำเป็น คำตอบ014/015/016/019 เป็นแกน)
- open-questions/oq-006.md ถึง oq-011.md (ทุกไฟล์ในช่วงได้รับอนุญาต); open-questions/history-001.md
- planning/human-questions-001.md ถึง human-questions-006.md (ทุกไฟล์ในช่วงได้รับอนุญาต)
- plan/BA-001.md, BA-002.md, BA-003.md, BA-004.md, gates-001.md, dispatch-001.md
- design/des-003.md, des-004.md, des-005.md, des-007.md, schema-notes.md, risks.md, data-model.md, data-contract-rules.md
- source-review-001.md; source-review-002.md

ไม่ audit source ใหม่ ไม่ต้องค้น filesystem ข้ามหมวด ไม่เปิด browser/สร้าง UI หรือเลือก stack ถ้าข้อเท็จจริงทางเทคนิคยังขาดให้ส่ง SA ไม่ถามธุรกิจเดาจากโค้ด

## มติที่ต้องใช้ (คำตอบจริงอยู่ใน decisions)

1. ระบบเต็ม ไม่ลดเป็น PoC/MVP; Block/Arm/Code + Lessons จริง/ภารกิจ/ความคืบหน้า/ครู คง Code/Block auto grade และ Arm ครูตรวจ
2. Guest เป็นพื้นที่ร่วมใน OS account เดียว ทุกคนเปิดงานได้ เก็บงานปกติจนสั่งลบ ส่งออกไฟล์ได้ งานที่สั่งลบเข้าถังขยะกู้ได้30วันแล้วลบถาวรอัตโนมัติ การลบถาวรนี้ไม่ใช่ลบงานที่ยังไม่สั่งลบ
3. หลัง Login เลือกโครงงาน Guest แล้วสั่งนำเข้าเอง รักษาต้นฉบับและกันนำเข้าซ้ำ ไม่ auto-upload ทุกงานเมื่อ Login
4. ประวัติ/ผล Guest เก็บ local หลัง Login เลือกย้ายประวัติได้ ต้องตรวจผลใหม่ ส่วน Arm รอครูตรวจ อย่าเชื่อ client ผ่านเองหรืออ้างว่า Guest พิสูจน์ตัวตนผู้เรียนแล้ว
5. ทีมร่างหลักสูตร/ภารกิจ/เกณฑ์ครบสามโหมด ให้ผู้ใช้หรือผู้รับผิดชอบที่ผู้ใช้ระบุตรวจอนุมัติ ยังไม่มี inventory/criteria/rubric ที่อนุมัติจริง ห้ามแต่งว่าอนุมัติเนื้อหาแล้ว
6. ครูดู/ตรวจเฉพาะรายชื่อนักเรียนที่ผู้ดูแลกำหนดให้ครูแต่ละคน ภายในขอบเขตโรงเรียน/บัญชีเดิม ไม่ใช้ทั้งโรงเรียนหรือห้องแทนนโยบายที่เลือก ไม่อนุมัติ grant table ใหม่แทนคน
7. ผู้ใช้ในแชตเป็นผู้อนุมัติ requirement/UX และตรวจรับภาพรวม ไม่ถามหาเจ้าของคนเดิมซ้ำ
8. ทีมสำรวจหุ่นและเสนอรุ่นให้ตรวจภายหลัง รุ่น/firmware/ผู้รับรอง/physical evidence ยังไม่พร้อม ไม่ใช่คำถามให้ผู้ใช้เดา technical facts
9. OS ปัจจุบันตาม decisions-019: Windows11 25H2 x64 และ macOS15+ Intel/AppleSilicon ทั้งคู่ต้องใช้หุ่นจริง ยุติ Windows10 ตามคำสั่งใหม่ มติ017/018และคำถามเรื่อง Home/Pro/VM เป็นประวัติ ไม่เปิดกลับมาถามอีก การเลือก target ยังไม่ใช่ compatibility proof
10. License บังคับทั้ง Guest/Login, offline lease3วัน/Keyเดียวเครื่องเดียว/adminย้ายทันทีตามมติเดิม; APIทุกอย่างรวมLoginใน school-bot-v2/web ใช้บัญชี/4DBเดิม ไม่สร้างSchoolBotUser; SchoolBotPK/FKอ้างPK int4 และฟิลด์มาตรฐานครบ ไม่เปลี่ยนDBMLหรือschema

## ผลที่ต้องทำ

- Amend เฉพาะ REQ/BR/AC/Scope ที่กระทบ ตัดข้อความ pending ที่มนุษย์ตอบแล้วออกจากกฎปัจจุบัน แต่รักษาประวัติและsourceข้อเท็จจริงเก่าตามช่วงเวลาที่ตรวจ
- ทุก AC ต้องตรวจ yes/no ได้ Preserve IDs เก่าทั้งหมด ไม่ renumber ไม่ลบ AC เดิม; แก้ข้อความได้เมื่อมีมติใหม่โดยใส่ Change Log. ถ้าต้องเพิ่มให้ใช้ AC เลขถัดไปของ REQ; ถ้าเนื้อหาเกิน4KiBให้ split เป็น REQ ใหม่ตั้งแต่040พร้อม crossrefs ไม่ลด scope/แยกเป็น MVP/releaseย่อยเพียงเพื่อคุมขนาด
- อัปเดต requirement index/ยอดREQ/ACจริง และscopeให้ตรงกัน สถานะ REQในindexเท่านั้น ไม่สวมว่าผู้ใช้อนุมัติทุกAC หรือระบบผ่านQA
- OQ-006/010ปิดแล้วรักษาไว้ OQ-007นโยบายธุรกิจตอบครบแล้ว ตรวจว่าปิดส่วนธุรกิจได้หรือยังและแยกเรื่องstorage contractทางเทคนิคส่งSA ไม่ปล่อยธุรกิจค้างเพียงเพราะยังไม่เขียนcontract. OQ-008/009/011ที่ยังมีartifact/เกณฑ์ต้องเสนอให้คงส่วนที่ยังไม่ตอบจริง ไม่ปิด hardware/learning/delivery gates อัตโนมัติ
- ห้ามสร้างคำถามซ้ำจากสิ่งที่เลือกแล้ว หากมีคำถามธุรกิจใหม่ที่บล็อกจริงเท่านั้น ให้ระบุ Task/Reference/Reason และ2–3choices ทำส่วนที่ไม่ติดให้ครบก่อน อย่าถามเชิง implementation ที่ SAควรออกแบบ
- สรุป delta mapping: มติแต่ละเรื่องไป REQ/ACใด งานSA/BE/DBA/PM/TPใดรับต่อ Canonical plan 74tasksและJSONยังเป็นbaselineเก่า ห้ามแก้เองหรือเปลี่ยนtaskverified ส่งข้อที่ต้องให้PM/TPreconcileหลังREQเพิ่ม

## Output protocol

ข้อความ protocol ที่ใช้เรียก BA เก็บครบที่ [ba-output-protocol-001.md](ba-output-protocol-001.md)

## Change Log

- 2026-10-22 — BA DONE, exit0; บันทึก 34 REQ / 132 AC ตรวจ IDs/ยอด/ลิงก์/ขนาดผ่าน ดู [ผลและ handoff](ba-review-001.md); ไม่มีคำถามธุรกิจใหม่
- 2026-10-22 — MYCELIUM เตรียม BA amendment ตามคำสั่งผู้ใช้ โดยใช้มติล่าสุดและรักษาownership

- 2026-10-23 — นายช่าง (BAAN) ปรับชื่อผู้คุมจาก MYCELIUM เป็นนายช่าง ในข้อความส่งต่อ ตามการเปลี่ยนชื่อระบบเป็น BAAN (release 0.12.0) — รายการลงวันที่เดิมที่อ้าง MYCELIUM คงไว้ตามประวัติ
