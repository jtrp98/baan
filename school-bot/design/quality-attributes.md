# Quality attributes และ verification

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

เอกสารนี้กำหนดสิ่งที่ต้องพิสูจน์ ทุกเกณฑ์ในตารางยังต้องมีหลักฐานตรวจรับ เอกสารนี้ไม่ได้ยืนยันว่าผ่านแล้ว AC คือเกณฑ์ตรวจรับ (Acceptance Criteria) และ OQ คือคำถามที่ต้องอาศัยผู้รับผิดชอบยืนยัน (Open Question)

## เกณฑ์ขั้นต่ำ

| คุณลักษณะ | เกณฑ์ตรวจ | Trace | สถานะวันนี้ |
|---|---|---|---|
| License | ไม่มี cache/หมดอายุ/denied เข้า mode ไม่ได้; เปิดซ้ำไม่เลื่อน expiry | AC-009-01/02, AC-034-01–06  ยังต้องพิสูจน์ตามเกณฑ์ |
| Atomic binding | สอง API instances activate พร้อมกันเหลือ current binding เดียว; retry ไม่ renew ผลเดิม | AC-028-01/02  ยังต้องพิสูจน์ตามเกณฑ์ |
| Transfer | ปลดแล้ว เครื่องปลายทาง activate ทันที; เครื่องเดิม offline ใช้ได้ถึง exp เดิม; เครื่องเดิม online ไม่ renew | AC-035-02–05  ยังต้องพิสูจน์ตามเกณฑ์ |
| Durability | save สำเร็จแล้ว restart ยังอ่านได้; failed save ไม่รายงานสำเร็จ | AC-027-04, AC-036-03/04  ยังต้องพิสูจน์ตามเกณฑ์ |
| Projects | สองงานต่อ mode/store ไม่ทับกัน; conflict ไม่สูญเสีย draft | AC-011-01–04  ยังต้องพิสูจน์ตามเกณฑ์ |
| Isolation | เปลี่ยน resource ID/school/learner แล้วไม่เข้าถึงข้อมูลข้ามสิทธิ์ | AC-038-03, AC-039-02/04  ยังต้องพิสูจน์ตามเกณฑ์ |
| Learning | run สำเร็จไม่เท่ากับผ่าน; Arm รอครู; ผลอ้าง snapshot/criteria/reviewer ได้ | AC-037-03/04, AC-038-01–04  ยังต้องพิสูจน์ตามเกณฑ์ |
| Robot lifecycle | drain ก่อน stop, late callback ไม่ส่งท่าต่อ, ไม่มี movement retry | AC-021-01–04, AC-024-02/03  ยังต้องพิสูจน์ตามเกณฑ์ |
| Evidence semantics | predicted/written/read/verified แยกกัน; read ไม่ครบไม่ commit | AC-016-02, AC-019-03, AC-022-03  ยังต้องพิสูจน์ตามเกณฑ์ |
| Platforms | Windows และ Mac ควบคุมหุ่นจริงในรุ่นที่อนุมัติ | AC-032-02, OQ-008  ยังต้องพิสูจน์ตามเกณฑ์ |
| Distribution | check ไม่ติดตั้ง; artifact ผิดไม่ execute; uninstall เก็บข้อมูล | AC-030-01–03, AC-031-01–04, AC-032-01/03  ยังต้องพิสูจน์ตามเกณฑ์ |
| ภาษา | th/en/zh offline; เปลี่ยนภาษาไม่เปลี่ยนงาน/ชื่อและไม่ remount | AC-010-01–03  ยังต้องพิสูจน์ตามเกณฑ์ |

## Targets และข้อจำกัด

- จากโค้ด: engine request 64 KiB, stdout 1 MiB, diagnostics 8 KiB, host deadline 5 วินาที และ pipe drain 1 วินาที (source ที่ระบุท้ายไฟล์)
- จากโค้ด transport: 4 วินาที และ HID CHECK_FW อาจรอ 1.5 วินาที (source ที่ระบุท้ายไฟล์, source ที่ระบุท้ายไฟล์) ไม่ใช่ SLA หยุดทางกายภาพ
- ข้อเสนอ: HTTP control 64 KiB/content 2 MiB; project 1 MiB; pagination ≤100; server-side rate limits ต้องใช้ shared counters เมื่อหลาย instance
- 300 MB/startup 5 วินาที/30 FPS เป็นเป้าหมายเดิมที่ยังไม่ยืนยัน (source ที่ระบุท้ายไฟล์) ต้องระบุเครื่อง/scene/percentile ก่อนใช้ตรวจรับ
- Local administrator/VM snapshot อาจย้อน credential/clock state; offline revocation ทันทีทำไม่ได้ สิทธิ์เก่าหลังย้ายคงได้ตามมติ ไม่อ้าง anti-copy สมบูรณ์

## วิธีพิสูจน์ภายหลัง

Frontend: typecheck/build/i18n และ adapter/workspace regression; Go: tests/vet; API: domain/contract/integration กับ persistent transactional store; engine: source-built dry-run/IPC tests ตาม AGENTS.md:91–95

เพิ่ม fault cases เฉพาะสัญญาใหม่: clock rollback, DB commit fail, lost response, duplicate key, school injection, revoked grant during commit, worker crash และ installer trust failure ไม่ใช้ fake bridge เป็นหลักฐาน hardware

ก่อน hardware/install tests ต้องมีคำสั่งผู้ใช้และเครื่องทดสอบแยก ผลต้องแยก automated logic, native UI, hardware และ installer acceptance ไม่มีการ rebuild EXE/installer ในงาน SA นี้

## หลักฐาน

- `manager.go:19`
- `transport.cpp:8`
- `transport_hid.cpp:26`
- `README.md:206`
