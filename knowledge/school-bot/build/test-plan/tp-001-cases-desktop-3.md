# TP-001 — Desktop และโครงงาน (TP001-019–TP001-020)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-019"></a>

## TP001-019 — (1) โหลดไฟล์ผ่าน UI load

AC: [AC-025-01 (รันชุด move_right, jump, move_left ที่ถูกต้องแล้วได้รายการคำสั่ง จำนวน…)](../../modules/code-lab/shared/requirements/req-025.md), [AC-025-02 (ส่งคำสั่งนอก DSL แล้วแสดงข้อผิดพลาด ไม่ดำเนินเป็น Python ทั่วไป)](../../modules/code-lab/shared/requirements/req-025.md), [AC-025-03 (บันทึกแล้วเปิด source เดิมได้)](../../modules/code-lab/shared/requirements/req-025.md) · References: [DES-001 (Desktop host และ IPC)](../design/des-001.md), [DES-003 (หลายโครงงาน Local/Cloud)](../design/des-003.md), [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md) · Level: integration · Profiles: PF-HOST, PF-UNIT

เงื่อนไขก่อนตรวจ: DSL ถูก; คำสั่งนอก DSL (import/eval/__import__/exec); ไฟล์ schema 1 เตรียมตรง (ไม่พึ่ง save ของ UI) แบบ DSL ถูก + บรรทัดคอมเมนต์ `#` ปรับ padding ให้ได้: (A) ASCII 16384/16385 units=bytes; (B) ไทย units≈5.5K ≤16384 แต่ bytes=16384 และ 16385; (C) ไทย units=16385; (D) emoji 8192 ตัว (16384 units, 32768 bytes) และ +1 ASCII (16385 units); schema ผิด. ตรวจ units=String.length, bytes=UTF-8 len ก่อนใช้

ขั้นตอน: (1) โหลดไฟล์ผ่าน UI load; (2) ส่ง source เดียวกันเข้า engine program.run; (3) รัน DSL ถูก/นอก DSL; (4) บันทึกแล้วเปิด source เดิม; (5) โหลด schema ผิด

ผลที่คาด: ได้รายการคำสั่ง/steps/ผลในฉาก ไม่มีคำสั่งไปหุ่น; นอก DSL→error ไม่รันเป็น Python; บันทึก/เปิด source เดิม; schema ผิด→error. AC-025-03 (โหลด UI นับ UTF-16 units): units 16384 โหลดได้, 16385→error ตัดที่ units ไม่ใช่ bytes (ครอบ A/C/D). [BR-025-03 (ขอบเขตรันปัจจุบันคือ 1–64 คำสั่ง เดินครั้งละ 1–10 ช่อง รวมไม่เกิน 100…)](../../modules/code-lab/shared/requirements/req-025.md) (รัน นับ UTF-8 bytes): A และ B ที่ bytes 16384 ผ่านด่านขนาด, bytes 16385 engine ปฏิเสธ; B ผ่านโหลด UI แต่ถูกปฏิเสธตอนรัน; emoji 8192 ผ่านโหลดแต่ engine ปฏิเสธ. ไม่ assert code/ข้อความ error ของ engine, ไม่ทดสอบ codepoint/grapheme, ใช้ DES-003 Rev4 ส่วน ProjectContent code/Migration ร่วม BR-025-03/AC-025-03 เป็น expected; เพดาน bytes ไม่ใช่เกณฑ์ AC-025-03

หลักฐานที่ต้องเก็บ: E-TRACE

ผลจริง: NOT_RUN

บันทึก/โหลดไม่เพิ่มเงื่อนไข bytes

<a id="tp001-020"></a>

## TP001-020 — compile/run/save/reopen

AC: [AC-026-01 (move_right(2) ตามด้วย repeat 2 ครั้งของ jump ให้ผลคำสั่ง move_right,…)](../../modules/block-lab/shared/requirements/req-026.md), [AC-026-02 (มีสองลำดับที่ไม่เชื่อมกันแล้วรันไม่ได้ และแจ้งให้เชื่อมเป็นลำดับเดียว)](../../modules/block-lab/shared/requirements/req-026.md), [AC-026-03 (โปรแกรมที่ขยายเกิน 64 commands, ซ้อน repeat เกิน 8 ชั้น หรือใช้…)](../../modules/block-lab/shared/requirements/req-026.md), [AC-026-04 (บันทึก workspace แล้วเปิดใหม่ได้บล็อก ค่า การเชื่อมต่อ และสถานะ enabled…)](../../modules/block-lab/shared/requirements/req-026.md) · References: DES-003, DES-005 · Level: unit · Profiles: PF-UNIT, PF-UI-WIN

เงื่อนไขก่อนตรวจ: move_right(2)+repeat2(jump); 2 stacks ไม่เชื่อม; expansion 64/65 commands; repeat ซ้อน 8/9 ชั้น; blocks 1000/1001; tiles 0/1/10/11; repeat 0/1/10/11; id ซ้ำ; schema ผิด

ขั้นตอน: compile/run/save/reopen

ผลที่คาด: ได้ move_right,jump,jump ตามลำดับ; สอง stack→รันไม่ได้แจ้งให้เชื่อม; >64 commands หรือ >8 ชั้น→ปฏิเสธไม่แสดงผลสำเร็จ (64/8 ผ่าน); บันทึก/เปิดได้บล็อก ค่า การเชื่อมเดิม; schema ผิด→error

หลักฐานที่ต้องเก็บ: unit log+E-UI

ผลจริง: NOT_RUN



## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · IPC = Inter-Process Communication


## หลักฐานอ้างอิงตำแหน่ง

- ตำแหน่งที่เอกสารเดิมอ้าง: useCodeLab.ts:56
- ตำแหน่งที่เอกสารเดิมอ้าง: demo.go:72
- ตำแหน่งที่เอกสารเดิมอ้าง: demo.go:66
