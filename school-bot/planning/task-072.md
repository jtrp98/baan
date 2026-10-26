# ใบงาน072 — spec ตรวจคำถามธุรกิจผลข้อสอบเมื่อหมดเวลา

วันที่ 2026-10-26 · spec / codex t2 / read-only. K=C:/src/schoolbright/knowledge/school-bot

อ่านK/index.md→requirement/index.md→open-questions/index.md แล้วrequirement/req-046.md, req-047.md, req-048.md, decisions-020.mdถึงdecisions-025.md, decisions-034.md; design/index.md→design/learning-ux-contract-gaps-001.md LUX-05 + des-010.mdเฉพาะattemptdeadline/expired. ห้ามเปิดทุกเอกสาร/ค้นทั้งrepo

arch071ระบุหมดเวลามีdeadline/state/error แต่ไม่มีกฎธุรกิจว่าคะแนนexpiredคิดจากอะไร/นับครั้งหรือไม่. โปรดตรวจจากมติจริงก่อนว่าตอบแล้วหรือยัง; ถ้าตอบแล้วชี้หลักฐานและไม่ถามซ้ำ. ถ้ายังไม่มีมติ เตรียมคำถามมนุษย์เพียง1ข้อรวมผลที่สัมพันธ์กัน: เมื่อหมดเวลา ให้ปิดการทำและตรวจเฉพาะคำตอบที่serverรับ/บันทึกแล้วอัตโนมัติแม้ยังไม่กดส่ง และนับการทำครั้งนั้นตามpolicyหรือไม่? แยกคำตอบที่ยังอยู่ในเครื่อง/ส่งไม่ทันเป็นไม่รับเข้าสอบ, ห้ามสัญญาofflineส่งย้อนหลังหรือauto-scoreที่ยังไม่มีมติ. ให้ทางเลือกที่อยู่ในscopeเดิม (ไม่เพิ่มmanualteachergradingfeature) พร้อมผลของแต่ละทางและข้อเสนอที่ต้องติดป้ายว่ารอผู้ใช้ยืนยัน. รายละเอียดclock/race/DTOเป็นtechnicalให้arch/sysไม่ถามผู้ใช้

สร้างnew_files requirement/expired-attempt-decision-proposal-001.md <=6500UTF8bytes พร้อมexampleเน็ตขาด/คำตอบบันทึกบางข้อ/นับครั้ง และตารางถ้าตัดสินแล้วกระทบREQ/DES/TP/UXอะไร. สถานะPROPOSEDไม่amendREQ/AC/OQ/decisionsและไม่บันทึกมติแทนผู้ใช้. ไม่สร้างOQIDใหม่ก่อนตรวจregistryทั้งหมดหรือrenumber. จัดเป็นproposallinkedgapreceiptก็พอ

คืนfencedJSON<=2000tokens {"state":"DONE|NEEDS_HUMAN|BLOCKED","summary":"...","new_files":[{"path":"knowledge/school-bot/requirement/expired-attempt-decision-proposal-001.md","content":"markdownเต็ม"}],"question":{"title":"คำถามพร้อมแสดงในform","options":["...","..."]},"evidence":[],"handoff":"..."}. ห้ามเขียนจริง/SQL/DB/network/tests/code/Git/rolechain. DONEถ้ามีมติจริงแล้ว; NEEDS_HUMANถ้าข้อเสนอต้องรอคำตอบ

## Change Log
- 2026-10-26 — routeเฉพาะLUX-05จากarch071 ไม่ผลักคำถามเทคนิคอื่นให้มนุษย์
