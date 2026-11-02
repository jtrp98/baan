# SchoolBot — เงื่อนไขการเรียน ฐานข้อมูล และเผยแพร่

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

กลับ [เงื่อนไขอนุมัติหลัก](gates-001.md) ทุกแถวคงหลักฐานปิดและงานที่พึ่งพาเดิม

| Gate | ผู้เตรียมหลักฐาน | ผู้ตัดสิน/ผู้ให้หลักฐานที่ต้องเป็นคน | หลักฐานปิดและงานที่พึ่งพา |
|---|---|---|---|
| G-UX-LEARN (อนุมัติ UX การเรียน) | int ([UX-004 (ออกแบบ UX การเรียน)](index-foundation.md)..007) | ผู้มีอำนาจ UX | **ปิดแล้ว 2026-10-29** (ผู้ใช้ยืนยันจาก sign-off ที่มี): UX-004 signed int-004 · [UX-006 (เตรียม UX mapping/preview/ชน/export)](extension/index.md) ตาม [มติ 041 (อนุมัติ UX mapping/ส่งคะแนน)](../requirement/decisions-041.md) · [UX-005 (เตรียม UX admin หลักสูตร/คลังข้อสอบ)](extension/index.md)/007 ตาม [มติ 043 (อนุมัติ UX และยืนยัน runner)](../requirement/decisions-043.md) |
| G-PROJECT-DB (ฐานข้อมูลโครงงาน) | [SA-001 (ทบทวนสัญญาระบบและการอัปเดต)](index-foundation.md), [DBA-004 (เตรียม DDL โครงงาน)](index-foundation.md) | เจ้าของ schema/contract และผู้รัน test DB | หลัง G-GUEST review ownership/revisions/migration/constraints; SQL/rollback/catalog receipts ที่ DBA ตรวจ ก่อน [QA-002 (ตรวจรับโครงงาน)](index-delivery.md) ตรวจรับบน DB จริง ([BE-008 (ทำโครงงาน Cloud)](index-foundation.md)/[BE-025 (ทำ explicit project import กันซ้ำ)](extension/index.md) ทำบน stub DB) |
| G-LEARN-DB (ฐานข้อมูลการเรียนและส่งคะแนน) | arch/vault | เจ้าของ schema และผู้รัน test DB | ยังไม่มีหลักฐานปิด G-LEARN-DB เพิ่มเติม ดูหลักฐานท้ายไฟล์ · **งานที่ต้องผ่านเงื่อนไขนี้:** [QA-015 (ตรวจ mapping/preview/คะแนนชน)](extension/index.md)/[QA-016 (ตรวจ export authz/outbox/receipt recovery)](extension/index.md) — [BE-015 (ทำ API การเรียน)](index-delivery.md)/026–038 ทำบน stub DB |
| G-RELEASE-DB (ฐานข้อมูลเผยแพร่และ trust) | SA-001, [DBA-006 (เตรียม DDL การเผยแพร่)](index-delivery.md), [SEC-001 (ทบทวนขอบเขตความเชื่อถือและความปลอดภัย)](index-foundation.md) | เจ้าของ schema/trust และผลิตภัณฑ์เมื่อมีคำตัดสิน scope | updater disposition ก่อน freeze; release/global uniqueness/key custody/origins review; SQL/rollback evidence ก่อน [QA-010 (ตรวจรับอัปเดตและ assets)](index-delivery.md) ตรวจรับ ([BE-018 (ทำ API การเผยแพร่)](index-delivery.md)/019/022 ทำบน stub DB) และ signing ที่พึ่งพา |
| G-ROBOT-CONTRACT (สัญญา Desktop host กับหุ่น) | [SA-003 (กำหนดสัญญา Desktop host กับหุ่น)](index-foundation.md) | เจ้าของ Host/robot contract | breaking payload/bounds/matching/timeout/cancel/drain-stop/compatibility review ก่อน [BE-010 (ทำ Desktop host และ IPC)](index-foundation.md) ไม่ใช่สิทธิ์สั่งหุ่น |
| G-SEC (ความปลอดภัยก่อนเผยแพร่) | [SEC-002 (ทบทวนความปลอดภัย Release Candidate)](index-delivery.md) | ผู้มีอำนาจรับความเสี่ยงเมื่อจำเป็น | RC-linked findings/retest; Critical/Important แก้หรือรับความเสี่ยงเป็นลายลักษณ์อักษรก่อน release |
| G-QA (ตรวจรับระบบจริง) | check/inspect | ผู้รับรอง hardware/install/performance และผู้ตรวจรับ | ยังไม่มีหลักฐานปิด G-QA เพิ่มเติม ดูหลักฐานท้ายไฟล์ |
| G-RELEASE (อนุมัติเผยแพร่) | gm | เจ้าของ release/shared environment/ผู้ตรวจรับ | ยังไม่มีหลักฐานปิด G-RELEASE เพิ่มเติม ดูหลักฐานท้ายไฟล์ |
