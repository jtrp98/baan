# SchoolBot — Queue และ Handoff Routing

## Waiting on Human ก่อนคิว

เริ่มรายงานด้วย [Waiting on Human](gates-001.md) ทั้งหมด โดยระบุ Task / Reference / Reason / ผู้เตรียม / ผู้ตัดสินที่ยังขาด ห้ามสะสม implementation หลังคำถามที่ตัวงานพึ่งพาค้างอยู่ งานเตรียมหลักฐานและสายที่ไม่พึ่งคำตอบเดินต่อได้

## First wave

12 งานต่อไปนี้ไม่มี task dependency หรือ gate precondition จึงพร้อมสำหรับการเตรียมงานตามบทบาท ยังไม่ได้ dispatch จากการรับแผนนี้

1. SA-001 — contracts และ update disposition
2. BE-001 — legacy auth source evidence
3. DBA-001 — physical mapping review
4. BA-001 — Guest decision pack
5. BA-002 — learning criteria/scope pack
6. SEC-001 — trust/security review
7. BA-003 — hardware acceptance pack
8. BA-004 — delivery/decision-owner pack
9. TP-001 — 109-AC evidence matrix
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

ทุก role ส่ง MYCELIUM เท่านั้น ผู้คุมเลือกผู้รับจากงานที่ depends_on task นั้นพร้อมตรวจ gates ไม่ให้ role เรียกต่อกันเอง

| กลุ่มผู้ส่ง | ผู้รับถัดไปและหลักฐาน |
|---|---|
| BA-001..004 | มนุษย์ตัดสินผ่านผู้คุม แล้ว SA/UX/DBA/TP ตามสาย; decision pack ต้องมีทางเลือก ผลกระทบ และผู้ตอบ |
| BA-005/006 | BE-015/016/017 และ FE-013 ผ่านผู้คุม; ส่ง approved inventory/criteria/rubric/คู่ผ่าน-ไม่ผ่าน |
| SA | DBA/SEC/BE และเจ้าของ contract ผ่านผู้คุม; ส่ง revision, consumer impact และข้อรอคน |
| DBA | ผู้มีอำนาจ schema/ผู้รัน SQL และ BE ผ่านผู้คุม; ส่ง SQL/rollback หรือผลตรวจ human evidence ไม่รันเอง |
| UX | มนุษย์ UX sign-off แล้ว FE ผ่านผู้คุม; ส่ง artifact revision และ flow/failure coverage |
| TP | QA และผู้ทำ fixture ตาม dependencies ผ่านผู้คุม; ส่ง AC/platform/store/mode matrix และวิธีพิสูจน์ |
| BE/FE | ผู้ทำ consumer ถัดไปและ QA ตาม task DAG ผ่านผู้คุม; ส่ง artifact/source changes/checks/ข้อจำกัด |
| QA | MYCELIUM รับ verdict บันทึก index แล้วส่งผู้แก้หรือ PM; ห้าม PM ลง verified/blocked แทน |
| SEC | ผู้แก้/มนุษย์รับความเสี่ยง/PM ผ่านผู้คุม; ส่ง findings, severity, RC hashes และ retest |
| PM-001 | เจ้าของ release/shared environment/ผู้ตรวจรับผ่านผู้คุม; ส่ง full-scope evidence pack |
| PM-002 | ผู้คุม/ผู้ใช้รับ receipts และ handover จริง; ไม่มีการ dispatch deployment จากบทบาท PM เอง |

## Effort และข้อจำกัด

136 person-days และแต่ละ task 1–2 วันเป็นสมมติฐาน ไม่ใช่ deadline ไม่รวมรอคน/เครื่อง/credentials ถ้า inventory หรือ matrix เกินขนาดให้ PM แตกงานก่อนจ่ายโดยไม่ renumber/ลด scope การรับครั้งนี้ไม่เพิ่ม task

ตรวจ static แล้ว 74 IDs ไม่ซ้ำ, 8 phases, 17 gates, REQ/AC associations ครบ 31/109 และ dependency ไม่มี cycle หลัง overrides First wave ยัง 12 งานพร้อมเตรียม ไม่มี SchoolBot build/test/QA/UI/hardware/SQL/release จากการตรวจแผนนี้

## Change Log

- 2026-10-21 — PM รับจาก Planner; MYCELIUM บันทึกตาม adoption/render contract
