# school-bot — Scope เพื่อทบทวน

## Overview

School Bot มี 3 โหมด Block / Arm / Code สำหรับนักเรียนและครู พร้อมบทเรียนและระบบกลาง ดู [มติ 3 โหมด](decisions-003.md)

- สร้าง knowledge ใหม่ตามคำสั่งผู้ใช้
- เป้าหมายล่าสุดจากผู้ใช้: ทำระบบเต็มใช้งานจริงครบทุกส่วน ดู [มติระบบเต็ม](decisions-002.md)
- โครงสร้างหลัก: Block / Arm / Code มีหน้าบทเรียนแยกจากพื้นที่สร้างงาน ดู [ผลตรวจโค้ด](../design/source-review-001.md) และ [มติ 3 โหมด](decisions-003.md)

ตารางด้านล่างเป็นฐานโค้ดปัจจุบัน; ข้อจำกัด PoC เป็นช่องว่างที่ต้องพัฒนา ดู [มติระบบเต็ม](decisions-002.md) และ [มติผู้ใช้](decisions-001.md)

แหล่งที่มา: `target/school-bot` และมติผู้ใช้ในแชต

## Target Users

ผู้ใช้ยืนยันเมื่อ 2026-10-21: กลุ่มหลักคือนักเรียนและครูในโรงเรียน เพื่อเรียนเขียนโปรแกรมและควบคุมหุ่น

ผู้ดูแลปลด/ย้าย License ตาม decisions-007; กลุ่มผู้ดูแล release เพิ่มเติมยังเป็น `(สมมติฐาน — ยังไม่ยืนยัน)`

โค้ด SchoolBot ต้นทางยังไม่เชื่อมบัญชี/สิทธิ์จริง; Academic มีข้อมูลบัญชี นักเรียน และบุคลากรเดิมแล้ว ดู [review เพิ่มเติม](../design/source-review-002.md) และ [มติ API/บัญชี](decisions-010.md) ครูดู/ตรวจเฉพาะรายชื่อนักเรียนที่ผู้ดูแลกำหนดต่อครู ตาม decisions-015

## Release Scope

### ทิศทางที่ผู้ใช้ยืนยัน — 2026-10-21

ผู้ยืนยันมติ: ผู้ใช้ในแชต 2026-10-21; ผู้อนุมัติ requirement/UX และตรวจรับภาพรวมตาม decisions-016 ยังไม่ใช่การอนุมัติทุก AC

- ระบบเต็ม Block/Arm/Code พร้อม Lessons ภารกิจ ผลจริง ความคืบหน้า/ครู; Code/Block auto grade, Arm ครูตรวจ (decisions-002/003/009)
- Guest ร่วม OS account เก็บจนสั่งลบ ส่งออกได้ ถังขยะกู้ 30 วันแล้วลบถาวรอัตโนมัติ ไม่ลบงานปกติ (REQ-040)
- หลัง Login เลือกนำเข้าเอง คงต้นฉบับ/กันซ้ำ ไม่ auto-upload (REQ-041); ประวัติ Guest local เลือกย้ายได้ ต้องตรวจใหม่ Arm รอครู ไม่ถือ Guest เป็นตัวตนนักเรียน (REQ-042)
- ทีมร่างเนื้อหา/ภารกิจ/เกณฑ์ครบสามโหมด ให้ผู้ใช้หรือผู้ที่ผู้ใช้ระบุอนุมัติ; ยังไม่มี inventory/criteria/rubric ที่อนุมัติจริง (REQ-037..039)
- License บังคับ Guest/Login: ครั้งแรกออนไลน์ lease 3 วัน หนึ่ง Key/เครื่อง ผู้ดูแลย้ายทันที สิทธิ์เดิมคงถึงกำหนด (REQ-009/034/035)
- API รวม Login ใน school-bot/web ใช้บัญชี/4 DB เดิม ไม่สร้าง SchoolBotUser; PK/FK ของ SchoolBot int4 และฟิลด์มาตรฐานครบ (REQ-033/036; decisions-010..013)
- OS: Windows 11 25H2 x64 และ macOS 15+ Intel/Apple Silicon ทั้งคู่ต้องใช้หุ่นจริง (decisions-019; REQ-031/032)

รวม 34 REQ / 132 AC ใน [index](index.md); เพิ่ม REQ-040..042 เพื่อแบ่งหน้าที่และขนาด คง release ระบบเต็ม

### สถานะปัจจุบันระดับโมดูล (ย้ายจาก Module Index — 2026-10-22)

- ตาราง SchoolBot อยู่ SchoolBot DB 10.0.0.128:9499 ตาม [decisions-027](decisions-027.md) (ไม่ใช่ School DB)
- PK ของตาราง SchoolBot ใหม่เป็น `int4` ตาม [มติผู้ใช้](decisions-012.md); มี [DBML](../design/schoolbot.dbml) สำหรับ dbdiagram.io และปรับ timeout MYCELIUM แล้ว
- API ทั้งหมดรวม Login อยู่ `target/school-bot/web`; แอปเรียก API และ backend ใช้ User/DB เดิมทั้ง 4 ตัว ดู [มติ API](decisions-010.md), [มติ DB](decisions-011.md) และ [ผลตรวจบัญชีเดิม](../design/source-review-002.md)
- Windows และ macOS ต้องควบคุมหุ่นจริงได้ทั้งคู่ ดู [มติ OS](decisions-008.md); ฝั่ง macOS ยังต้องพัฒนาจากโค้ดเดิม
- เป้าหมาย OS ล่าสุด Windows11 25H2 x64 และ macOS15+ Intel/AppleSilicon ตาม [decisions-019](decisions-019.md) แทนข้อกำหนด Windows10 เดิม
- Guest และ Login เก็บหลายโครงงานทุกโหมด; Code/Block ประเมินอัตโนมัติ Arm ให้ครูตรวจ ดู [มติผู้ประเมิน](decisions-009.md); Guest ใช้พื้นที่ร่วมและเลือกนำเข้างาน/ประวัติหลัง Login ตาม [มติ Guest](decisions-014.md)
- Guest ลบเข้าถังขยะกู้ได้ 30 วัน; ทีมร่างหลักสูตรสามโหมดให้ผู้ใช้ตรวจ ครูดูแลเฉพาะรายชื่อนักเรียนที่ผู้ดูแลกำหนด ดู [มติชุด 2](decisions-015.md)
- ต้องมี License ก่อนใช้แอปทั้ง Guest/Login; ตาราง `SchoolBotLicense` ใช้ PK `SchoolBotLicenseId` และฟิลด์มาตรฐาน ดู [มติ License/DB](decisions-004.md)
- ครั้งแรกตรวจ License ออนไลน์ แล้วใช้สิทธิ์ในเครื่องได้ 3 วัน ครบกำหนดต้องตรวจ Key ว่ายัง Active ก่อนต่อสิทธิ์ ดู [มติออฟไลน์](decisions-005.md)
- 1 Key ผูก 1 เครื่อง; ผู้ดูแลปลดก่อนย้าย Key เดิมได้ทันที เครื่องเดิมอาจใช้ออฟไลน์จนสิทธิ์เดิมหมด ดู [มติย้ายสิทธิ์](decisions-007.md)
- BA amend แล้ว: 44 REQ / 174 AC ยังเป็น DRAFT (เพิ่ม REQ-043..052 หลักสูตร Level/ข้อสอบ/ส่งคะแนน) ดู [ผลตรวจเอกสาร](../planning/ba-review-001.md); คงรหัสเดิมครบ เพิ่ม REQ-040..042
- หลักสูตรเปลี่ยนเป็นหลักสูตรกลางแบบ Level ต่อภาคเรียน ผูกชั้น/วิชาได้ ตาม [decisions-020](decisions-020.md); ยังไม่ amend REQ/DES
- ส่งคะแนนเป็นช่องย่อยต่อกิจกรรม SchoolBot เขียนระบบเกรดเองผ่านหน้า mapping โดยไม่เปลี่ยนโครงสร้างเดิม ตาม [decisions-021](decisions-021.md)

### หลักฐานฐานเดิม

ความสามารถและ sample/preview/mock ณ 2026-10-21 เก็บครบที่ [scope-baseline-001.md](scope-baseline-001.md); ไม่ใช่ขอบเขตเป้าหมายหรือผล QA

## Constraints

- หลักฐานมาจากการอ่านไฟล์ที่ BA ตรวจอ่าน ไม่ได้รันแอป tests, build, API, installer หรือ hardware
- มติธุรกิจที่ตอบแล้วใช้ตามแหล่งยืนยัน; AC ยังเป็นเกณฑ์เสนอ ไม่ใช่ผล QA หรือการรับความเสี่ยง
- เป้าหมาย OS เป็นมติ ไม่ใช่ compatibility proof; รุ่นหุ่น/firmware/ผู้รับรอง/หลักฐานจริงยังรอทีมเสนอ (decisions-016/019; OQ-008/011)
- ตำแหน่งภาพเคลื่อนไหวหลังส่งคำสั่งเป็นการคาดการณ์ ไม่ใช่ค่าที่วัดจากหุ่น
- OS write สำเร็จไม่ยืนยันว่าหุ่นเคลื่อนที่จบ หยุดจริง หรือเก็บชุดท่าถูกต้อง
- การ cancel process ไม่หยุดชุดท่าที่บอร์ดกำลังเล่น ต้องขอ stop แยก และการสื่อสารขาดอาจส่งไม่ถึง
- HOME/BOX/POSE0 ยังไม่มี calibrated preset สำหรับ native; native pause/resume และ firmware upgrade ไม่อยู่ในความสามารถปัจจุบัน
- API ของ SchoolBot ต้นทางใช้ Memory Store และยังไม่เชื่อม user/RBAC; เป้าหมายให้ API ทั้งหมดอยู่ `school-bot/web` และใช้ User/4 DB เดิมตาม [มติ DB](decisions-011.md)
- เป้าหมาย License: ครั้งแรกออนไลน์ แล้วใช้สิทธิ์ในเครื่อง 3 วันตาม [มติ](decisions-005.md); โค้ดเดิมยังไม่บังคับ
- ไม่มี update download/install, signature verification หรือ rollback
- เอกสารระบุ Windows installer ยังไม่ลงนาม และ macOS ยังต้อง Developer ID/notarization
- เป้าหมายขนาด 300 MB, startup 5 วินาที และ 30 FPS ยังไม่ใช่ผล benchmark หรือเกณฑ์ที่ธุรกิจอนุมัติ
- Hardware, macOS และ installer verification ยังไม่พิสูจน์ในงานนี้
- logical baseline ยืนยันแล้ว; [แผนหลัก](../plan/index.md) 74 งาน / 8 phases / 17 gates ทุกงาน pending ยังอ้าง 31/109 ให้ PM/TP ปรับ mapping ตาม AC ใหม่ 23 ข้อ; ยังไม่เริ่ม implementation SchoolBot
- มี 12 ประเด็นคำถาม: 5 PARTIAL / 7 CLOSED (ไม่มี OPEN); OQ-006/007/010 ได้ข้อยุติธุรกิจแล้ว งาน contract ส่ง SA ส่วนเนื้อหา/หุ่น/ส่งมอบรอทีมเสนอให้ผู้ใช้ตรวจ
- หลักฐานเป็น working tree ณ 2026-10-21; source repository ยังไม่มี commit ให้อ้าง hash

### ช่องว่างของหลักฐาน

SA ตรวจ 3 โหมดเพิ่มใน [source review](../design/source-review-001.md); ยังไม่ได้ตรวจทุกเส้นทางแบบ end-to-end หรือทดสอบหุ่นจริง

เอกสารภาพรวม `docs/ARCHITECTURE.md:5` ยังใช้ชื่อ Robot Simulator แต่รายละเอียด `docs/ARCHITECTURE.md:49` และ source native ระบุเส้นทางหุ่นจริง จึงใช้รายละเอียดและ source ประกอบ ไม่ตีความว่าทั้ง mode เป็น simulator

## Declined

Windows 10 ออกจาก target ตามคำสั่งผู้ใช้ 2026-10-21 ใน decisions-019; decisions-017/018 และคำถาม Home/Pro/VM เป็นประวัติ ไม่เปิดถามซ้ำ

ความสามารถที่ยังไม่พบหรือเอกสารระบุว่ายังไม่มี ไม่ถือว่าเป็นการตัด scope โดยธุรกิจ และงานนี้ไม่สร้าง backlog หรือ plan ใหม่

## References

ดู [Source References](source-references.md), decisions-014/015/016/019; OQ-007 ตอบนโยบายธุรกิจครบ ส่วน storage/migration contract ส่ง SA; OQ-008/009/011 และ gates ยังรอหลักฐานจริง

Canonical plan/JSON 74 งานยังเป็น baseline 31/109 ให้ PM/TP reconcile mapping และยอดใหม่ ไม่แก้สถานะ task จากเอกสารนี้

## Change Log
- 2026-10-23 — แก้พาธ `school-bot-v2` → `school-bot` ตาม [decisions-031](decisions-031.md)

- 2026-10-22 — ย้ายเนื้อหาสถานะปัจจุบันระดับโมดูลจาก `index.md` มาจัดเข้าหมวด Overview, Release Scope และ Constraints โดยคงถ้อยคำเดิม ไม่ตีความเพิ่ม และไม่ปิด OQ ใด
- 2026-10-22 — amend ตามมติจริง แยกหลักฐานเดิม คงระบบเต็มและเกณฑ์ที่รออนุมัติ

- 2026-10-21 — ชี้ขอบเขตข้อจำกัด SchoolBot ต้นทางให้แยกจาก User/DB เดิมของ Academic และบันทึกตำแหน่ง API ตามผู้ใช้

- 2026-10-21 — สร้างจาก source repo ตามคำสั่งผู้ใช้ให้กลั่น requirement โดยไม่อนุมัติ release scope
- 2026-10-21 — เพิ่มมติผู้ใช้ OQ-006..009; รายละเอียดใน decisions-001.md
- 2026-10-21 — ผู้ใช้ยืนยันเป้าหมายระบบเต็มใช้งานจริง ดู decisions-002.md
- 2026-10-21 — ตรวจโค้ดเพิ่ม แยกบทเรียนจาก Block/Arm/Code Labs
- 2026-10-21 — เพิ่มมติบังคับ License และมาตรฐาน SchoolBot ดู decisions-004.md
- 2026-10-21 — บันทึกสิทธิ์ออฟไลน์ 3 วันตามคำตอบผู้ใช้ ดู decisions-005.md
- 2026-10-21 — ยืนยันผู้ดูแลย้ายทันทีและสิทธิ์ออฟไลน์เดิมตาม decisions-007.md
- 2026-10-21 — ยืนยัน Windows/macOS ควบคุมหุ่นจริงตาม decisions-008.md

- 2026-10-21 — ย้าย References ไป source-references.md โดยคงเนื้อหาเดิม; เป้าหมายหลายโครงงานและการประเมินตาม decisions-009.md
