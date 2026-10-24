# school-bot — Scope เพื่อทบทวน

## Overview

School Bot มี 3 โหมด Block / Arm / Code สำหรับนักเรียนและครู พร้อมบทเรียนและระบบกลาง ดู [มติ 3 โหมด](decisions-003.md)

- สร้าง knowledge ใหม่ตามคำสั่งผู้ใช้
- เป้าหมายล่าสุดจากผู้ใช้: ทำระบบเต็มใช้งานจริงครบทุกส่วน ดู [มติระบบเต็ม](decisions-002.md)
- โครงสร้างหลัก: Block / Arm / Code มีหน้าบทเรียนแยกจากพื้นที่สร้างงาน ดู [ผลตรวจโค้ด](../design/source-review-001.md) และ [มติ 3 โหมด](decisions-003.md)

ข้อจำกัดฐานเดิมเป็นช่องว่างที่ต้องพัฒนา ไม่ใช่เพดานขอบเขตเป้าหมาย

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
- บริการ SchoolBot (B) อยู่ใน school-bot/web ใช้บัญชี/4 DB เดิม; ตาราง SchoolBot อยู่ DB แยกตาม decisions-027 ไม่สร้าง SchoolBotUser ใช้ PK/FK int4/ฟิลด์มาตรฐาน (REQ-033/036). เส้นทางปัจจุบันใช้ client→HTTP G→gRPC B ตาม [Gateway Rev3](../design/gateway-integration-001.md)/[DES-012 Rev9](../design/des-012.md); browser ผ่าน same-origin BFF และ HTTP Login เดิมของ G แยกจาก service transport B.
- OS: Windows 11 25H2 x64 และ macOS 15+ Intel/Apple Silicon ทั้งคู่ต้องใช้หุ่นจริง (decisions-019; REQ-031/032)

รวม 44 REQ / 180 AC ตาม [index](index.md); คง release ระบบเต็มและรหัสเดิม

### มติล่าสุด — 2026-10-23

ผู้ยืนยัน: ผู้ใช้ในแชต ตาม decisions-032/033/034

- ครูทดลอง local/เก็บโครงงาน Cloud ได้ แต่ห้าม submission/attempt Cloud (REQ-036/038/039)
- กิจกรรมหนึ่งได้หลายช่องข้ามวิชา ช่องหนึ่งได้กิจกรรมเดียว; ใช้ช่องเดิม mapping ที่ส่งแล้วล็อก เปลี่ยนใช้ชุดใหม่ ไม่ย้าย/ล้างคะแนนเดิม (REQ-049)
- export ต่อช่อง = earned/max × target max ปัด half-up; ไม่มีผลให้ข้าม คงเดิม ส่งภายหลังได้ (REQ-050/051)
- รวมหลักสูตร = SUM((earned/max) × weight) น้ำหนักรวม 100% Quiz ไม่นับ = 0; เปลี่ยนเฉพาะ CourseRun ใหม่ (REQ-047)
- ครูปรับเฉพาะเวลาสอบ/ช่วงเปิด–ปิด ส่วนจำนวนครั้ง/สุ่ม/เวลาเฉลยคงส่วนกลาง; คงซ่อมรายคน/คะแนนสูงสุดไม่มีเพดาน (REQ-046)
- เลื่อน Level นับทุกคนใน roster งานขาด = 0 แยกจาก export (REQ-048)

สถานะโมดูลเดิมเก็บที่ [ประวัติ](scope-history-20261023-011.md); ไม่ใช่หลักฐานผ่าน contract/QA/release

### หลักฐานฐานเดิม

ความสามารถและ sample/preview/mock ณ 2026-10-21 เก็บครบที่ [scope-baseline-001.md](scope-baseline-001.md); ไม่ใช่ขอบเขตเป้าหมายหรือผล QA

## Constraints

- หลักฐานมาจากการอ่านไฟล์ที่ BA ตรวจอ่าน ไม่ได้รันแอป tests, build, API, installer หรือ hardware
- มติธุรกิจที่ตอบแล้วใช้ตามแหล่งยืนยัน; AC ยังเป็นเกณฑ์เสนอ ไม่ใช่ผล QA หรือการรับความเสี่ยง
- งานนี้ docs-only ไม่เริ่ม implementation. ตาม Gateway Rev3 HTTP logout ที่มีแล้วและผล local4032tests ไม่ยืนยัน Gateway/gRPC/DB integration; full Login ยังไม่พร้อม และ H5/Light/runtime gates ยังค้าง.
- เป้าหมาย OS เป็นมติ ไม่ใช่ compatibility proof; รุ่นหุ่น/firmware/ผู้รับรอง/หลักฐานจริงยังรอทีมเสนอ (decisions-016/019; OQ-008/011)
- ตำแหน่งภาพเคลื่อนไหวหลังส่งคำสั่งเป็นการคาดการณ์ ไม่ใช่ค่าที่วัดจากหุ่น
- OS write สำเร็จไม่ยืนยันว่าหุ่นเคลื่อนที่จบ หยุดจริง หรือเก็บชุดท่าถูกต้อง
- การ cancel process ไม่หยุดชุดท่าที่บอร์ดกำลังเล่น ต้องขอ stop แยก และการสื่อสารขาดอาจส่งไม่ถึง
- HOME/BOX/POSE0 ยังไม่มี calibrated preset สำหรับ native; native pause/resume และ firmware upgrade ไม่อยู่ในความสามารถปัจจุบัน
- API ของ SchoolBot ต้นทางใช้ Memory Store และยังไม่เชื่อม user/RBAC; เป็นหลักฐานฐานเดิม ไม่กำหนด public exposure ของ B. Transport ปัจจุบันอ่าน Gateway Rev3/DES-012 Rev9; ไม่มี HTTP relay หรือ direct public B.
- เป้าหมาย License: ครั้งแรกออนไลน์ แล้วใช้สิทธิ์ในเครื่อง 3 วันตาม [มติ](decisions-005.md); โค้ดเดิมยังไม่บังคับ
- ไม่มี update download/install, signature verification หรือ rollback
- เอกสารระบุ Windows installer ยังไม่ลงนาม และ macOS ยังต้อง Developer ID/notarization
- เป้าหมายขนาด 300 MB, startup 5 วินาที และ 30 FPS ยังไม่ใช่ผล benchmark หรือเกณฑ์ที่ธุรกิจอนุมัติ
- Hardware, macOS และ installer verification ยังไม่พิสูจน์ในงานนี้
- [แผนปัจจุบัน](../plan/index.md) gm reconcile แล้วเป็น 110 งาน/8 phases/17 gates ครอบคลุม 44 REQ/180 AC ตาม [gm-review-001](../planning/gm-review-001.md); ทุกงานยัง pending งานเอกสารนี้ไม่เริ่ม implementation
- 12 OQ: 3 PARTIAL/9 CLOSED ตาม index; OQ-008/009/011 รอทีมเตรียมข้อเสนอให้มนุษย์ตรวจ การปิด OQ ไม่รับรอง contract/implementation
- หลักฐานเป็น working tree ณ 2026-10-21; source repository ยังไม่มี commit ให้อ้าง hash

### ช่องว่างของหลักฐาน

SA ตรวจ 3 โหมดเพิ่มใน [source review](../design/source-review-001.md); ยังไม่ได้ตรวจทุกเส้นทางแบบ end-to-end หรือทดสอบหุ่นจริง

เอกสารภาพรวม `docs/ARCHITECTURE.md:5` ยังใช้ชื่อ Robot Simulator แต่รายละเอียด `docs/ARCHITECTURE.md:49` และ source native ระบุเส้นทางหุ่นจริง จึงใช้รายละเอียดและ source ประกอบ ไม่ตีความว่าทั้ง mode เป็น simulator

## Declined

Windows 10 ออกจาก target ตามคำสั่งผู้ใช้ 2026-10-21 ใน decisions-019; decisions-017/018 และคำถาม Home/Pro/VM เป็นประวัติ ไม่เปิดถามซ้ำ

ความสามารถที่ยังไม่พบหรือเอกสารระบุว่ายังไม่มี ไม่ถือว่าเป็นการตัด scope โดยธุรกิจ และงานนี้ไม่สร้าง backlog หรือ plan ใหม่

## References

ดู [Source References](source-references.md), decisions-014/015/016/019; OQ-007 ตอบนโยบายธุรกิจครบ ส่วน storage/migration contract ส่ง SA; OQ-008/009/011 และ gates ยังรอหลักฐานจริง

สถานะแผนปัจจุบันใช้ 110 งาน/8 phases/17 gates ใน Constraints; งานเอกสารนี้ไม่เปลี่ยนสถานะงานหรือผลตรวจรับ

## Change Log

- 2026-10-24 — ใบงาน053: ปรับ current transport/readiness และตัดคำสั่งอ้างแผน74งานที่ล้าสมัย; คง business scope และประวัติเดิม

- 2026-10-23 — นายช่างบันทึกสถานะแผนจาก output gm ที่ตรวจรับแล้วเป็น 110 งาน/180 AC; ไม่เปลี่ยนนโยบายหรือสถานะตรวจรับ requirement

- 2026-10-23 — amend ตาม decisions-032..034 รวม 44 REQ/180 AC; คง 3 PARTIAL/9 CLOSED ไม่เปลี่ยนผลตรวจรับ; แยกส่วนประวัติคุมขนาดที่ [scope-history-20261023-011.md](scope-history-20261023-011.md)
