# school-bot — Scope เพื่อทบทวน

## Overview

School Bot มี 3 โหมด Block / Arm / Code สำหรับนักเรียนและครู พร้อมบทเรียนและระบบกลาง ดู [มติ 3 โหมด](decisions-003.md)

ตารางด้านล่างเป็นฐานโค้ดปัจจุบัน; ข้อจำกัด PoC เป็นช่องว่างที่ต้องพัฒนา ดู [มติระบบเต็ม](decisions-002.md) และ [มติผู้ใช้](decisions-001.md)

แหล่งที่มา: `target/school-bot-v2` และมติผู้ใช้ในแชต

## Target Users

ผู้ใช้ยืนยันเมื่อ 2026-10-21: กลุ่มหลักคือนักเรียนและครูในโรงเรียน เพื่อเรียนเขียนโปรแกรมและควบคุมหุ่น

ผู้ดูแลปลด/ย้าย License ตาม decisions-007; กลุ่มผู้ดูแล release เพิ่มเติมยังเป็น `(สมมติฐาน — ยังไม่ยืนยัน)`

โค้ด SchoolBot ต้นทางยังไม่เชื่อมบัญชี/สิทธิ์จริง; Academic มีข้อมูลบัญชี นักเรียน และบุคลากรเดิมแล้ว ดู [review เพิ่มเติม](../source-review-002.md) และ [มติ API/บัญชี](decisions-010.md) ครูดู/ตรวจเฉพาะรายชื่อนักเรียนที่ผู้ดูแลกำหนดต่อครู ตาม decisions-015

## Release Scope

### ทิศทางที่ผู้ใช้ยืนยัน — 2026-10-21

ผู้ยืนยันมติ: ผู้ใช้ในแชต 2026-10-21; ผู้อนุมัติ requirement/UX และตรวจรับภาพรวมตาม decisions-016 ยังไม่ใช่การอนุมัติทุก AC

- ระบบเต็ม Block/Arm/Code พร้อม Lessons ภารกิจ ผลจริง ความคืบหน้า/ครู; Code/Block auto grade, Arm ครูตรวจ (decisions-002/003/009)
- Guest ร่วม OS account เก็บจนสั่งลบ ส่งออกได้ ถังขยะกู้ 30 วันแล้วลบถาวรอัตโนมัติ ไม่ลบงานปกติ (REQ-040)
- หลัง Login เลือกนำเข้าเอง คงต้นฉบับ/กันซ้ำ ไม่ auto-upload (REQ-041); ประวัติ Guest local เลือกย้ายได้ ต้องตรวจใหม่ Arm รอครู ไม่ถือ Guest เป็นตัวตนนักเรียน (REQ-042)
- ทีมร่างเนื้อหา/ภารกิจ/เกณฑ์ครบสามโหมด ให้ผู้ใช้หรือผู้ที่ผู้ใช้ระบุอนุมัติ; ยังไม่มี inventory/criteria/rubric ที่อนุมัติจริง (REQ-037..039)
- License บังคับ Guest/Login: ครั้งแรกออนไลน์ lease 3 วัน หนึ่ง Key/เครื่อง ผู้ดูแลย้ายทันที สิทธิ์เดิมคงถึงกำหนด (REQ-009/034/035)
- API รวม Login ใน school-bot-v2/web ใช้บัญชี/4 DB เดิม ไม่สร้าง SchoolBotUser; PK/FK ของ SchoolBot int4 และฟิลด์มาตรฐานครบ (REQ-033/036; decisions-010..013)
- OS: Windows 11 25H2 x64 และ macOS 15+ Intel/Apple Silicon ทั้งคู่ต้องใช้หุ่นจริง (decisions-019; REQ-031/032)

รวม 34 REQ / 132 AC ใน [index](index.md); เพิ่ม REQ-040..042 เพื่อแบ่งหน้าที่และขนาด คง release ระบบเต็ม

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
- API ของ SchoolBot ต้นทางใช้ Memory Store และยังไม่เชื่อม user/RBAC; เป้าหมายให้ API ทั้งหมดอยู่ `school-bot-v2/web` และใช้ User/4 DB เดิมตาม [มติ DB](decisions-011.md)
- เป้าหมาย License: ครั้งแรกออนไลน์ แล้วใช้สิทธิ์ในเครื่อง 3 วันตาม [มติ](decisions-005.md); โค้ดเดิมยังไม่บังคับ
- ไม่มี update download/install, signature verification หรือ rollback
- เอกสารระบุ Windows installer ยังไม่ลงนาม และ macOS ยังต้อง Developer ID/notarization
- เป้าหมายขนาด 300 MB, startup 5 วินาที และ 30 FPS ยังไม่ใช่ผล benchmark หรือเกณฑ์ที่ธุรกิจอนุมัติ
- Hardware, macOS และ installer verification ยังไม่พิสูจน์ในงานนี้

### ช่องว่างของหลักฐาน

SA ตรวจ 3 โหมดเพิ่มใน [source review](../source-review-001.md); ยังไม่ได้ตรวจทุกเส้นทางแบบ end-to-end หรือทดสอบหุ่นจริง

เอกสารภาพรวม `docs/ARCHITECTURE.md:5` ยังใช้ชื่อ Robot Simulator แต่รายละเอียด `docs/ARCHITECTURE.md:49` และ source native ระบุเส้นทางหุ่นจริง จึงใช้รายละเอียดและ source ประกอบ ไม่ตีความว่าทั้ง mode เป็น simulator

## Declined

Windows 10 ออกจาก target ตามคำสั่งผู้ใช้ 2026-10-21 ใน decisions-019; decisions-017/018 และคำถาม Home/Pro/VM เป็นประวัติ ไม่เปิดถามซ้ำ

ความสามารถที่ยังไม่พบหรือเอกสารระบุว่ายังไม่มี ไม่ถือว่าเป็นการตัด scope โดยธุรกิจ และงานนี้ไม่สร้าง backlog หรือ plan ใหม่

## References

ดู [Source References](source-references.md), decisions-014/015/016/019; OQ-007 ตอบนโยบายธุรกิจครบ ส่วน storage/migration contract ส่ง SA; OQ-008/009/011 และ gates ยังรอหลักฐานจริง

Canonical plan/JSON 74 งานยังเป็น baseline 31/109 ให้ PM/TP reconcile mapping และยอดใหม่ ไม่แก้สถานะ task จากเอกสารนี้

## Change Log

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
