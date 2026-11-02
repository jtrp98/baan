# SchoolBot — งานการเรียนและส่งมอบ

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

กลับ [แผนหลัก](index.md) สถานะและชื่อ role อธิบายในแผนหลัก DDL คือคำสั่งกำหนดโครงสร้างฐานข้อมูล; MSI/PKG คือรูปแบบตัวติดตั้ง Windows/macOS

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| FE-008 | ทำการเชื่อมต่อและ profile หุ่น | fe | P4 | BE-013, UX-003 | pending |
| FE-009 | ทำคิวท่าหุ่น | fe | P4 | FE-008, FE-004 | pending |
| FE-010 | ทำชุดท่าและการหยุด | fe | P4 | FE-009, BE-014 | pending |
| FE-011 | ทำขั้นตอนทำงานกับ board | fe | P4 | FE-010 | pending |
| FE-012 | ทำ servo และรับมือการเชื่อมต่อขาด | fe | P4 | FE-010 | pending |
| SA-002 | กำหนดสัญญาการเรียน | sa | P5 | BA-001, BA-002, BE-001 | verified |
| DBA-005 | เตรียม DDL การเรียน | dba | P5 | SA-002, DBA-001 | pending |
| BE-015 | ทำ API การเรียน | be | P5 | BE-008, DBA-005, BA-005, BA-006, BE-027, BE-029 | pending |
| BA-005 | จัดเนื้อหา Block/Code | ba | P5 | BA-002 | pending |
| BA-006 | จัดเนื้อหา Arm | ba | P5 | BA-002 | pending |
| BE-016 | ทำการตรวจอัตโนมัติ | be | P5 | BE-015, BA-005 | pending |
| BE-017 | ทำ API ครู | be | P5 | BE-015, BA-006 | pending |
| FE-013 | ทำหน้าจอบทเรียน | fe | P5 | BE-015, BA-005, BA-006, UX-004 | pending |
| FE-014 | ทำหน้าจอผลตรวจอัตโนมัติ | fe | P5 | FE-013, FE-006, FE-007, BE-016 | pending |
| FE-015 | ทำหน้าจอครู | fe | P5 | FE-013, FE-011, FE-012, BE-017 | pending |
| FE-016 | ทำหน้าจอความคืบหน้า | fe | P5 | FE-014, FE-015 | pending |
| DBA-006 | เตรียม DDL การเผยแพร่ | dba | P3 | DBA-001, SA-001, SEC-001 | pending |
| BE-018 | ทำ API การเผยแพร่ | be | P3 | BE-005, DBA-006 | pending |
| BE-019 | ทำการตรวจอัปเดตและ Prepare/Install | be | P4 | BE-018, BE-007, SA-001 | pending |
| BE-020 | ทำตัวติดตั้ง Windows MSI | be | P6 | FE-005, FE-016, FE-012, BE-019 | pending |
| BE-021 | ทำตัวติดตั้ง macOS PKG | be | P6 | FE-005, FE-016, FE-012, BE-011, BE-012, BE-019 | pending |
| BE-022 | ทำ signing และ assets | be | P6 | BE-020, BE-021, SEC-001 | pending |
| BE-023 | เตรียมชุด deploy API | be | P6 | BE-018, BE-017, BE-038, BE-039, FE-019, FE-020, FE-022, FE-024 | pending |
| QA-001 | ตรวจรับ License | qa | P3 | BE-005, BE-006, BE-007, FE-001, FE-002, TP-002 | pending |
| QA-002 | ตรวจรับโครงงาน | qa | P4 | FE-005, QA-001 | pending |
| QA-003 | ตรวจรับห้องทดลอง | qa | P4 | FE-006, FE-007, FE-011, FE-012, BE-011, BE-012, TP-002 | pending |
| QA-004 | ตรวจรับการเรียน | qa | P5 | FE-016, QA-002 | pending |
| QA-005 | ตรวจรับหุ่นบน Windows | qa | P6 | FE-011, FE-012, BE-014, TP-002, BA-003 | pending |
| QA-006 | ตรวจรับหุ่นบน macOS Intel | qa | P6 | QA-003, BA-003 | pending |
| QA-007 | ตรวจรับหุ่นบน macOS ARM | qa | P6 | QA-003, BA-003 | pending |
| QA-008 | ตรวจรับตัวติดตั้ง Windows | qa | P6 | BE-022, QA-004, QA-005 | pending |
| QA-009 | ตรวจรับตัวติดตั้ง macOS | qa | P6 | BE-022, QA-004, QA-006, QA-007 | pending |
| QA-010 | ตรวจรับอัปเดตและ assets | qa | P6 | QA-008, QA-009, BE-019 | pending |
| SEC-002 | ทบทวนความปลอดภัย Release Candidate | sec | P6 | QA-001, QA-004, BE-022, BE-023, QA-011, QA-012, QA-013, QA-014, QA-015, QA-016 | pending |
| PM-001 | ตรวจความพร้อมเผยแพร่ | pm | P7 | QA-010, SEC-002, BE-023, QA-011, QA-012, QA-013, QA-014, QA-015, QA-016 | pending |
| PM-002 | รวบรวมหลักฐานส่งมอบ | pm | P7 | PM-001 | pending |
