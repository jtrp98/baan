# SchoolBot — Queue และ Handoff Routing

## Waiting on Human ก่อนคิว

เริ่มรายงานด้วย [Waiting on Human](gates-001.md) ทั้งหมด โดยระบุ Task / Reference / Reason / ผู้เตรียม / ผู้ตัดสินที่ยังขาด ห้ามสะสม implementation หลังคำถามที่ตัวงานพึ่งพาค้างอยู่ งานเตรียมหลักฐานและสายที่ไม่พึ่งคำตอบเดินต่อได้

## First wave

Rev2 ใช้ [queue-002](queue-002.md) และrole_aliasesเป็นคิวปัจจุบันเมื่อข้อความเดิมขัดกัน; runนี้เฉพาะ evidence preparation ไม่ dispatch implementation/SQL/deploy

12 งานต่อไปนี้ไม่มี task dependency หรือ gate precondition จึงพร้อมสำหรับการเตรียมงานตามบทบาท ยังไม่ได้ dispatch จากการรับแผนนี้

1. SA-001 — contracts และ update disposition
2. BE-001 — legacy auth source evidence
3. DBA-001 — physical mapping review
4. BA-001 — สรุปมติ Guest ที่ตอบแล้วส่ง contract (spec)
5. BA-002 — learning criteria/scope pack
6. SEC-001 — trust/security review
7. BA-003 — hardware acceptance pack
8. BA-004 — delivery/decision-owner pack
9. TP-001 — 180-AC evidence matrix (inspect)
10. SA-003 — Host/robot contract review
11. UX-001 — entry/shell flows
12. UX-003 — Lab flows

## กำลังเครื่องและการเลือกงาน

ตั้งเพดานจัดคิวเริ่มต้นไม่เกิน 3 role jobs พร้อมกันเพื่อเหลือช่องผู้คุมหนึ่งช่อง เป็นนโยบายเริ่มต้นด้านทรัพยากร (สมมติฐาน — ยังไม่ยืนยันกำลัง runner/เครื่องจริง ไม่ใช่ผล benchmark) ผู้คุมตรวจ resource availability ก่อน dispatch และลด concurrency เมื่อจำเป็น ห้ามเปิดทั้ง 12 งานพร้อมกันจากรายการนี้

เริ่ม SA-001/BE-001/DBA-001 เมื่อมีครบสามช่อง ถ้ามีน้อยให้เรียงตามรายการ ช่องที่ว่างเติมงานพร้อมลำดับถัดไปโดยไม่รอจบทั้งชุด งาน BA เตรียมคำถามที่จำเป็นก่อนส่งผู้ใช้ และรายงานสิ่งรอคนก่อนทุกครั้ง ไม่เรียก role จากไฟล์นี้โดยอัตโนมัติ

ใน workspace เดียวให้มี code writer ทีละงาน เว้นแต่ผู้คุมพิสูจน์ ownership/path ไม่ชนกัน และไม่เกินหนึ่ง build/package job ที่แย่ง output/cache ชุดเดียวกันเป็นค่าเริ่มต้น การเพิ่ม concurrency ต้องอิงพื้นที่ทำงานและเครื่องจริง ห้ามสร้าง git branch/worktree เองเมื่อผู้ใช้ยังไม่สั่ง state-changing git

Hardware มีผู้ควบคุมหนึ่งคนต่ออุปกรณ์และต้องผ่านสิทธิ์ทดสอบเฉพาะ; installer tests ใช้เครื่องแยกและคำอนุญาตจริง ไม่ใช้ process/EXE ที่ผู้ใช้กำลังเปิดทดสอบ

## คิวต่อเมื่อ prerequisites พร้อม

- DBA-002 รับหลัง SA-001/BE-001/DBA-001 ส่งหลักฐานที่ใช้ได้ แล้วมนุษย์ review/run test SQL; DBA-003 ตรวจ evidence หลัง G-CORE จากนั้น BE-002 เริ่ม DB integration
- BE-003 → BE-004 → BE-005 → BE-007 เป็นสาย License โดยใช้ SEC-001 และ approval ที่สืบทอดผ่าน G-CORE; FE-001 รอ UX-001/G-UX-ENTRY และ host entitlement
- BE-006 รอ BE-007/BE-001/G-AUTH แล้วเชื่อม FE-002 งาน Local รอ BA-001/G-GUEST; Cloud รอ project schema/SQL evidence และ G-PROJECT-DB ก่อน BE-008
- TP-002 เริ่มหลัง TP-001 ได้ ไม่ต้องรอ P0 ทั้งหมด BA-005/006 และ UX-004 เริ่มได้หลัง BA-002/G-LEARN แม้ส่วน DB/License ยังไม่จบ
- SA-003/G-ROBOT-CONTRACT และ BE-007 เปิดทาง BE-010 แล้ว Darwin HID/Serial/engine validation เดินตาม dependencies ของตน ไม่รอ P4 ทั้ง phase FE แต่ละส่วนรอ UX gate และ backend ของตน
- Release metadata/schema/trust เตรียมขนานสายอื่นได้ แต่ BE-018/019 ต้องรอ G-RELEASE-DB รวม update disposition ที่เกี่ยวข้อง ไม่ freeze จากข้อเสนอเดิมเพียงอย่างเดียว
- Learning contracts/DDL/content เดินตาม G-GUEST/G-LEARN และ dependencies; BE-015 รอ Cloud projects/content/learning schema evidence แล้ว grading/teacher APIs และ UI ต่อเป็นสายของตน
- QA logic เริ่มรายสายเมื่อ dependencies พร้อม แยก source-built hardware บน Windows/Intel/ARM จาก signed installer acceptance; packaging/signing/QA/Security ต้องผูก RC hashes รุ่นเดียวกัน
- PM-001 รวบรวม release pack หลัง dependencies ส่งหลักฐานจริง; PM-002 ประสานคนส่งมอบหลัง G-SEC/G-QA/G-RELEASE ไม่ใช้ verified เป็น released

รายการนี้อธิบายเส้นทางสำคัญ ไม่แทน depends_on/gate_ids ของ [canonical JSON](tasks-001.json) Gate อาจต้องใช้หลักฐานจากงานที่ไม่ใช่ task predecessor โดยตรง ต้องตรวจ close_evidence ด้วย

## Routing หลังส่งงาน

ใช้ [routing ปัจจุบัน](queue-002.md) Rev2; ทุก role ส่งผู้คุม ไม่เรียก role ต่อกันเอง; [routing เดิม](archive/dispatch-routing-20261021.md) เก็บเป็นประวัติ Owner resolveตามrole_aliases

## Effort และข้อจำกัด

207 person-days/110งานเป็นสมมติฐาน — ยังไม่ยืนยัน ไม่ใช่deadline; แตก36งานscopeเดิมเพื่อคุม1–2วัน ไม่ลดscope/renumber ไม่เพิ่มphase

Rev2:110 IDs/8phases/17gates, coverage180ACมีimplementationและcheck owner, DAGไม่วน/pendingทั้งหมด; staticแผนไม่ใช่ผลSchoolBot QA/SQL/implementation/release

## Change Log

- 2026-10-23 — Rev2: reconcile44/180และคิวqueue-002; ไม่ถามนโยบายเดิมซ้ำ

- 2026-10-21 — PM รับจาก Planner; MYCELIUM บันทึกตาม adoption/render contract

- 2026-10-23 — นายช่าง (BAAN) ปรับชื่อผู้คุมจาก MYCELIUM เป็นนายช่าง ในข้อความส่งต่อ ตามการเปลี่ยนชื่อระบบเป็น BAAN (release 0.12.0) — รายการลงวันที่เดิมที่อ้าง MYCELIUM คงไว้ตามประวัติ
