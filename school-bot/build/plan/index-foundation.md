# SchoolBot — งานฐานระบบและหน้าจอเริ่มต้น

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

กลับ [แผนหลัก](index.md) สถานะและชื่อ role อธิบายในแผนหลัก DDL คือคำสั่งกำหนดโครงสร้างฐานข้อมูล; IPC คือ Inter-Process Communication; HID คือ Human Interface Device

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| SA-001 | ทบทวนสัญญาระบบและการอัปเดต | sa | P0 | — | verified |
| BE-001 | ตรวจความเข้ากันได้ของบัญชีเดิม | be | P0 | — | verified |
| DBA-001 | ทำแผนผังฐานข้อมูลจริง | dba | P0 | — | verified |
| DBA-002 | เตรียม DDL ฐานข้อมูลหลัก | dba | P0 | DBA-001, SA-001, BE-001 | verified |
| DBA-003 | รวบรวมหลักฐานฐานข้อมูลหลัก | dba | P1 | DBA-002 | pending |
| BE-002 | เชื่อมฐานข้อมูลของบริการ | be | P1 | DBA-002 (stub DB; ต่อ DB จริงหลัง DBA-003) | verified |
| BA-001 | กำหนดนโยบาย Guest | ba | P0 | — | verified |
| BA-002 | กำหนดเกณฑ์การเรียน | ba | P0 | — | verified |
| BA-003 | กำหนดเกณฑ์ควบคุมหุ่น | ba | P0 | — | verified |
| BA-004 | กำหนดเกณฑ์ส่งมอบ | ba | P0 | — | verified |
| UX-001 | ออกแบบ UX หน้าเข้าใช้งาน | ux | P0 | — | verified |
| UX-002 | ออกแบบ UX โครงงาน | ux | P3 | BA-001 | verified |
| UX-003 | ออกแบบ UX ห้องทดลอง | ux | P0 | — | verified |
| UX-004 | ออกแบบ UX การเรียน | ux | P5 | BA-002 | verified |
| TP-001 | ทำตารางจับคู่เกณฑ์ตรวจรับ | tp | P0 | — | verified |
| TP-002 | เตรียมข้อมูลทดสอบความล้มเหลว | tp | P1 | TP-001 | verified |
| SEC-001 | ทบทวนขอบเขตความเชื่อถือและความปลอดภัย | sec | P0 | — | verified |
| BE-003 | ทำ API ผู้ดูแล License | be | P2 | BE-002, SEC-001, BE-039 | verified (normal) |
| BE-004 | ทำ signed offline lease | be | P2 | BE-003 | verified (normal) |
| BE-005 | ทำการย้าย License Key | be | P2 | BE-004 | done-local |
| BE-006 | ทำ Login และ session | be | P3 | BE-007, BE-001 | verified (normal) |
| BE-007 | ตรวจสิทธิ์ใช้งานของ Desktop host | be | P2 | BE-005, SEC-001 | pending |
| DBA-004 | เตรียม DDL โครงงาน | dba | P3 | DBA-001, SA-001, BA-001 | verified |
| BE-008 | ทำโครงงาน Cloud | be | P3 | BE-006, DBA-004 | pending |
| BE-009 | ทำโครงงาน Local | be | P3 | BE-007, BA-001 | pending |
| BE-010 | ทำ Desktop host และ IPC | be | P3 | BE-007, SA-003 | pending |
| SA-003 | กำหนดสัญญา Desktop host กับหุ่น | sa | P0 | — | pending |
| BE-011 | ทำ Darwin HID transport | be | P4 | BE-010 | pending |
| BE-012 | ทำ Darwin Serial transport | be | P4 | BE-010 | pending |
| BE-013 | จำกัดขอบเขตคำสั่ง engine | be | P4 | BE-010 | pending |
| BE-014 | ทำ stop/read/torque | be | P4 | BE-013 | pending |
| FE-001 | ทำหน้าจอ License | fe | P2 | BE-007, UX-001 | pending |
| FE-002 | ทำหน้าจอ Login | fe | P3 | BE-006, FE-001 | pending |
| FE-003 | ทำหน้าจอโครงงาน | fe | P3 | BE-008, BE-009, FE-002, UX-002 | pending |
| FE-004 | ทำ adapter ของแต่ละโหมด | fe | P3 | FE-003 | pending |
| FE-005 | ทำ shell และหลายภาษา | fe | P3 | FE-004, BE-010 | pending |
| FE-006 | ทำ Code Lab | fe | P4 | FE-004, BE-010, UX-003 | pending |
| FE-007 | ทำ Block Lab | fe | P4 | FE-004, BE-010, UX-003 | pending |
