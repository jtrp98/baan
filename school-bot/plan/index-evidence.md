# SchoolBot — หลักฐานสถานะงาน

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

กลับ [แผนหลัก](index.md) เก็บที่มาของสถานะเดิม ไม่รับรองผลเพิ่ม

## หลักฐาน

- SA-001 (ทบทวนสัญญาระบบและการอัปเดต): **verified** (งาน093 — check PASS (memory: planning/check-093-SA-001-001.md) · contract-review-sa-001 (memory) Rev1)
- BE-001 (ตรวจความเข้ากันได้ของบัญชีเดิม): **verified** (งาน093 — check PASS รอบ 3 (memory: planning/check-093-BE-001-003.md) · auth-evidence-001 (memory) Rev7 · ข้อรอคน TR-AUTH-03/04/06, GAP-AUTH-006)
- DBA-001 (ทำแผนผังฐานข้อมูลจริง): **verified** (งาน061 — check PASS static + parser 10.3.1 evidence)
- DBA-002 (เตรียม DDL ฐานข้อมูลหลัก): **verified** (งาน094 — check PASS (memory: planning/check-094-DBA-002-004-001.md) static · รัน SQL/catalog C0–C5 = คน → DBA-003)
- BE-002 (เชื่อมฐานข้อมูลของบริการ): **verified** (งาน094 การแก้ครั้งที่ 3 ตาม [มติ051](../requirement/decisions-051.md) — check PASS (memory: planning/check-094-wave2-gate-004.md) บน stub · ต่อ DB จริง = DBA-003/G-CORE)
- BA-001 (กำหนดนโยบาย Guest): **verified** (งาน061 ตาม check-060 + decisions-038)
- BA-002 (กำหนดเกณฑ์การเรียน): **verified** (งาน061 ตาม check-060 + decisions-038)
- BA-003 (กำหนดเกณฑ์ควบคุมหุ่น): **verified** (งาน061 ตาม check-060 + decisions-038)
- BA-004 (กำหนดเกณฑ์ส่งมอบ): **verified** (งาน061 ตาม check-060 + decisions-037/038)
- UX-001 (ออกแบบ UX หน้าเข้าใช้งาน): **verified** (งาน061 — signed int-001 + check-060 PASS)
- UX-002 (ออกแบบ UX โครงงาน): **verified** (งาน061 — signed int-003 + check PASS รอบ 3)
- UX-003 (ออกแบบ UX ห้องทดลอง): **verified** (งาน061 — signed int-002 + check-060 PASS)
- UX-004 (ออกแบบ UX การเรียน): **verified** (งาน061 — signed int-004 ครบ + check PASS รอบ 7)
- TP-001 (ทำตารางจับคู่เกณฑ์ตรวจรับ): **verified** (งาน061 — ส่วนเพิ่มแผนทดสอบ 002/003 + check-060 PASS)
- TP-002 (เตรียมข้อมูลทดสอบความล้มเหลว): **verified** (งาน093 — wave gate PASS (memory: planning/check-093-wave1-gate-001.md) · tp-002-fixture-*)
- SEC-001 (ทบทวนขอบเขตความเชื่อถือและความปลอดภัย): **verified** (งาน093 — check PASS (memory: planning/check-093-SEC-001-001.md) · security-review-093-001 (memory) · ข้อรอคน H1/H2/H4/H5)
- BE-006 (ทำ Login และ session): **done-local** (ส่วน gRPC logout AC-036-06 local — check092 (memory: planning/check-092-grpc-r3-001.md)/jpo092 (memory: planning/jpo-092-logout-r4-001.md); full Login ยังค้าง)
- DBA-004 (เตรียม DDL โครงงาน): **verified** (งาน094 — check PASS (memory: planning/check-094-DBA-002-004-001.md) static · SQL จริง = G-PROJECT-DB ที่ QA-002)
- SA-002 (กำหนดสัญญาการเรียน): **verified** (งาน061 — check PASS: สัญญาสามโหมด/Level/ข้อสอบ/ส่งคะแนน sync มติครบ)
