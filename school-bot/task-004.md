# SchoolBot — PM รับแผนระบบเต็ม

- วันที่: 2026-10-21
- คำสั่งผู้ใช้: เรียก pm เลยครับ
- ผู้คุม: MYCELIUM; เรียก PM จริงผ่าน mycelium-role แบบ read-only
- เป้าหมาย: PM รับ Planner เป็นเจ้าของ canonical plan/backlog และใบงานราย task ก่อนเริ่ม execution
- Dispatch จบแล้ว: mycelium-role --agent codex --role pm --tier t2 แบบ read-only, model gpt-6.1-sol/high, timeout 1800s; elapsed 654.1s, state NEEDS_HUMAN/exit 1 เพราะ downstream gates ยังรอคน ไม่ใช่ timeout
- Report directory: C:/src/AICode/baan/baan/reports/2026-10-21-12-30-00-pm-tier-t2-1agents-5vaCrZ

## Inputs — อนุญาตให้อ่านตาม path นี้

Knowledge root: C:/src/schoolbright/knowledge/school-bot

อ่าน index ก่อน แล้วอ่านเฉพาะไฟล์ที่เกี่ยวในรายการนี้:

- index.md; requirement/index.md; design/index.md; open-questions/index.md
- planning/index.md; planning/proposal-001.md; planning/tasks-001.json; planning/review-001.md
- requirement/decisions-002.md ถึง decisions-013.md (แต่ละไฟล์ในช่วงนี้ได้รับอนุญาต)
- requirement/scope.md; design/data-model.md; design/data-contract-rules.md; design/schema-notes.md; design/risks.md
- design/des-001.md ถึง des-007.md (แต่ละไฟล์ได้รับอนุญาต); design/quality-attributes.md
- open-questions/oq-006.md ถึง oq-011.md (แต่ละไฟล์ได้รับอนุญาต)
- source-review-001.md; source-review-002.md
- requirement/req-009.md ถึง req-039.md เฉพาะต้องตรวจ AC mapping (แต่ละไฟล์ได้รับอนุญาต)

ยังไม่มี plan/ และ backlog.md ไม่ต้องค้นหา/อ่านซ้ำ source หรือรัน code/SQL/hardware

## Baseline ที่ต้องรักษา

Full production scope ทุกส่วน ไม่ลดเป็น PoC/MVP: Block/Arm/Code + Lessons จริง + auto grade Code/Block และครูตรวจ Arm + progress/teacher scope; Win/macOS ควบคุมหุ่นจริงทั้งคู่; หลายโครงงานทุก mode ทั้ง Guest local และ Login cloud

License บังคับทั้ง Guest/Login, ครั้งแรก online, signed offline lease ไม่เกิน 3 วันจาก online check สำเร็จล่าสุด, 1 Key/เครื่อง, admin ย้ายทันทีโดยเครื่องเดิมอาจ offline จน lease เดิมหมด

API ทั้งหมดรวม Login อยู่ target/school-bot-v2/web แอปเรียก HTTPS; ใช้บัญชีและ 4 DB เดิม ไม่สร้าง SchoolBotUser ซ้ำ ไม่บังคับ Academic Login API/OIDC. ตารางใหม่ prefix SchoolBot, PK/FK อ้าง PK เป็น int4, ฟิลด์ IsDelete/CreateBy/CreateDate/UpdateBy/UpdateDate/SchoolId ครบ; UUID logical/local/request ไม่ใช่ DB PK ยังมีได้

Logical model และ DBML ยืนยันแล้วตาม decisions-013 ไม่ถามยืนยัน PK/API/diagram ซ้ำ แต่ไม่ถือว่าอนุมัติ physical SQL/UX/release แล้ว. REQ ยัง DRAFT/DES บางส่วน PROPOSED; ห้ามอ้าง SchoolBot QA PASS หรือ implementation เสร็จ

## งานของ PM

1. รับ/ปรับ proposal 74 tasks / 8 phases / 17 gates เป็น canonical plan; รักษา IDs เดิมและ mapping31REQ/109AC ไม่ renumber; taskใหม่ pending ทั้งหมด
2. Release Scope frozen ตามมติเดิม; Waiting on Human รายงานก่อนคิวงาน agent พร้อมเจ้าของเตรียมหลักฐาน ไม่สร้างการอนุมัติแทนคน
3. แผนมี index + 1 markdown ต่อ task 8 headings: Goal/References/Scope/Out of Scope/Expected Output/Acceptance/Dependencies/Handoff และ gates/queue/backlog
4. วาง first wave ตาม dependencies และกำลังเครื่อง ไม่ถือ phase เป็น barrier รวม; ระบุ effort สมมติฐานไม่ใช่ deadline
5. ประเด็น review-001: DES-007 เสนอ PrepareUpdate/InstallPreparedUpdate แต่ BE-019 check-only. ให้ SA-001 ตรวจเทียบ REQ-030/มติจริงและเสนอ disposition ก่อน freeze implementation contract; ไม่ตัด requirement หรือเพิ่ม feature/release scope เอง. สามารถเพิ่ม precondition/งานเตรียม clarification ได้ตามอำนาจ PM; งานส่วนไม่ติดเดินต่อได้
6. DBA ตรวจ human-provided SQL/catalog evidence ไม่รัน SQL เอง; สำหรับ legacy auth ให้ BE-001 หาหลักฐาน source ก่อน ไม่ผลัก technical facts เป็นคำถามธุรกิจ
7. ไม่เรียก role ต่อ ไม่แก้ requirement/design/code ไม่ deploy/install/move robot. Findings ไม่บล็อก AC ไป backlog; อย่าเพิ่ม speculative feature

## Output protocol

เก็บข้อความ protocol ที่ใช้เปิด PM ครบที่ [pm-render-001.md](planning/pm-render-001.md); output จริงอยู่ [pm-response-001.json](planning/pm-response-001.json)

## Change Log

- 2026-10-21 — PM รับ 74 tasks / 8 phases / 17 gates; MYCELIUM บันทึก canonical plan/74 ใบงาน/backlog แล้ว ตรวจ 31 REQ / 109 AC, DAG และ 988 links ผ่าน ดู [ผลตรวจ](planning/pm-review-001.md) ยังไม่เปิด implementation roles
- 2026-10-21 — MYCELIUM เตรียม PM dispatch ตามคำสั่งผู้ใช้ รับ Planner โดยไม่แต่ง canonical plan แทน PM
