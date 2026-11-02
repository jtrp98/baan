# ความเสี่ยงและประตูตัดสิน

> Rev 5 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[มติ 012 (PK int4 และไฟล์ DBML)](../requirement/decisions-012.md) ยืนยัน PK SchoolBot ใหม่เป็น int4 และ FK ชนิดเดียวกันแล้ว ไม่ถามซ้ำ; ไม่ใช่อนุมัติ schema/placement/credential compatibility ที่เหลือ

## เรื่องธุรกิจที่ยังรอหลักฐาน

| Task / Reference | สิ่งที่ต้องยืนยัน / เหตุผล |
|---|---|
| Identity — [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md), [มติ 010 (ใช้ข้อมูล Login/User ที่มีอยู่แล้ว)](../requirement/decisions-010.md) และ [มติ 011 (ใช้ฐานข้อมูลเดิมทั้ง 4 ตัวร่วมกับ SchoolBot)](../requirement/decisions-011.md) | SchoolBot gRPC service เป็นเจ้าของ session/directory/authorization; reuse Login HTTP เดิมของ HTTP API Gateway (`sb-api-gateway`). HTTP API Gateway ไปยัง SchoolBot gRPC service ใช้ gRPC; RPC/trusted tenant/opaque-session mapping และ account↔profile/active/role ยังต้องพิสูจน์ ไม่เลือก transport/provider ใหม่หรือสร้าง verifier ซ้ำ |
| Guest — [DES-003 (หลายโครงงาน Local/Cloud)](des-003.md) และ [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](des-005.md) | นโยบายตอบแล้ว; ตาม [มติ 032 (ผลทดลองของครูและ cardinality/การล็อก mapping คะแนน)](../requirement/decisions-032.md) ห้ามนำเข้าผลครู Cloud แต่เก็บโครงงานได้ ตรวจ implementation ต่อ |
| Learning — DES-005, [OQ-009 (ผลลัพธ์การเรียนและความหมายของเมนูครู)](../open-questions/oq-009.md) | ทีมเตรียมเนื้อหา/numeric rubric ให้ผู้ใช้ตรวจตาม [มติ 015 (ถังขยะ Guest ผู้ร่างหลักสูตร และขอบเขตครู)](../requirement/decisions-015.md) และ [มติ 016 (ผู้อนุมัติภาพรวมและการจัดทำข้อเสนอหุ่น/OS)](../requirement/decisions-016.md); สูตรรวมตอบแล้วตาม [มติ 034 (สูตรรวมหลักสูตร น้ำหนักรอบเรียน และขอบเขตครูปรับ policy ข้อสอบ)](../requirement/decisions-034.md) ไม่กำหนดเกณฑ์ภารกิจแทน |
| Hardware — [DES-006 (หุ่นจริง Windows/macOS)](des-006.md), [OQ-008 (ขอบเขตหุ่นและการยอมรับความปลอดภัย)](../open-questions/oq-008.md) | รุ่น board/robot, calibration, stop limits และผู้รับรองคือใคร? ไม่ใช้ checkbox หรือ write success แทนผลจริง |
| Acceptance — [OQ-006 (ปัญหา ผู้ใช้ และเจ้าของการตัดสิน)](../open-questions/oq-006.md) และ [OQ-011 (กลุ่มเครื่องและเกณฑ์ยอมรับการส่งมอบ)](../open-questions/oq-011.md) | ผู้ใช้ตรวจรับตาม [มติ 016 (ผู้อนุมัติภาพรวมและข้อเสนอหุ่น/OS)](../requirement/decisions-016.md); OS ตาม [มติ 019 (Windows 11 ตามข้อเสนอแรก)](../requirement/decisions-019.md); ทีมเตรียม signing/delivery/performance evidence ไม่ถามนโยบายซ้ำ |

## การอนุมัติที่ implementation ยังต้องพึ่งพา

| Task / Reference | คำตัดสินที่รอมนุษย์ |
|---|---|
| Schema — data-model / [REQ-033 (ชื่อและฟิลด์ข้อมูล SchoolBot)](../requirement/req-033.md) | baseline ตาม [มติ 026 (อนุมัติแบบข้อมูลที่ปรับใหม่)](../requirement/decisions-026.md) ถึง [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md); แบบปัจจุบันใช้ 32 ตารางเดิม ไม่มี delta ใหม่ การรัน SQL ยังต้องมนุษย์ |
| External integration — DES-004 และ [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md) | placement เป็น SchoolBot DB ตาม [มติ 027 (ที่ตั้งฐานข้อมูล SchoolBot)](../requirement/decisions-027.md); ยังต้องพิสูจน์ credentials/account-profile/roster และ H5 ไม่ถามทาง A/placement ซ้ำ |
| Breaking behavior — [DES-001 (Desktop host และ Inter-Process Communication (IPC))](des-001.md) และ [DES-002 (License และ device binding)](des-002.md) | อนุมัติ host gating, API v2 และปิด v1 mutation/bridge ที่ข้าม enforcement ใน production หรือไม่? |
| Storage migration — DES-003 | อนุมัติ document v2, revision semantics และ copy-only migration จากหนึ่ง slot โดยเก็บต้นฉบับหรือไม่? |
| Credential trust — DES-002 | อนุมัติ OS credential/key model และข้อจำกัด privileged clone/clock rollback หรือกำหนด hardware-backed requirement เพิ่ม? |
| Release trust — [DES-007 (Release และ trusted update)](des-007.md) | อนุมัติ signing roots, publisher identities, artifact origins และ explicit install workflow ก่อนพัฒนา integration หรือไม่? |
| UX — DES-001 และ DES-003 และ DES-005 | flow License, conflict, account switch, teacher review ต้องมี human UX sign-off ก่อน FE ที่พึ่ง flow; ชุดนี้ไม่ใช่ visual sign-off |

การอนุญาตให้ออกแบบไม่เท่ากับอนุมัติ schema/breaking change ไม่มีรายการใดถูกเซ็นแทนมนุษย์

## ความเสี่ยงทางเทคนิค

อ่าน [มาตรการ ทางเลือกที่ปัดตก และข้อจำกัดหลักฐาน](risks-technical.md) ทุกข้อยังต้องพิสูจน์ด้วย implementation และผลทดสอบ ข้อความเรื่อง unique ที่ยังตีความไม่ได้อยู่ในรายการที่ยังไม่ยืนยันของไฟล์นั้น

## ส่งต่อ

หลังมนุษย์ตัดสิน: DBA ตรวจ physical schema/constraints/migration และเป็นผู้เขียน SQL; SA amend contract หากผล review เปลี่ยนแบบ จากนั้นผู้คุมจึงส่งบทบาทถัดไป ไม่เปิด implementation/PM plan ในงานนี้

## เรื่องที่ตอบแล้วและข้อรอที่ยังคงอยู่

[OQ-014 (สูตรคะแนนและการปัดก่อนส่ง)](../open-questions/oq-014.md) และ [OQ-016 (การจัดการและเปลี่ยน mapping คะแนน)](../open-questions/oq-016.md) รวมถึงทาง A ตอบครบตาม [มติ 032 (ผลทดลองของครูและการล็อก mapping คะแนน)](../requirement/decisions-032.md) ถึง [มติ 034 (สูตรรวมและขอบเขตครูปรับข้อสอบ)](../requirement/decisions-034.md); ใช้ [ผลเรียน](learning-rules-032-034.md)/[คะแนน](grade-rules-032-034.md) คง H5 และ G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB งานเนื้อหา/hardware/ส่งมอบรอทีมเตรียมหลักฐาน ไม่ถามนโยบายเดิม

