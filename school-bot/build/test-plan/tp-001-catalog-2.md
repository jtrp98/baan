# TP-001 — สารบัญ TP001-017–TP001-032

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [แผน TP-001](tp-001.md) AC หมายถึง Acceptance Criteria หรือเกณฑ์ตรวจรับ; ความหมาย AC อยู่ใน case ที่ลิงก์และ [ตาราง AC](traceability-001.md) ทุกผลจริงยัง NOT_RUN

| ID | ตรวจอะไร | AC ที่ครอบ | ไฟล์ |
|---|---|---|---|
| TP001-017 | เปิดไฟล์ | [AC-011-03 (เปิดไฟล์ JSON เสียหรือเกิน 1 MiB แล้วมีข้อผิดพลาด)](../../modules/my-work/shared/requirements/req-011.md), [AC-011-04 (เมื่อมีข้อมูลทั้งชื่อแอปเก่าและใหม่ การเริ่มแอปไม่ทับข้อมูลใหม่)](../../modules/my-work/shared/requirements/req-011.md) | [รายละเอียด](tp-001-cases-desktop-2.md#tp001-017) |
| TP001-018 | load/validate | [AC-017-01 (โหลดโครงงานถูกต้องที่มีสองท่าและกลุ่ม แล้วได้ชื่อ ค่า เวลา ลำดับ…)](../../modules/arm-lab/shared/requirements/req-017.md), [AC-017-02 (โหลดโครงงานที่มี ID ท่าซ้ำหรือค่าท่านอกช่วงแล้วมีข้อผิดพลาด)](../../modules/arm-lab/shared/requirements/req-017.md), [AC-017-03 (บันทึกและเปิดใหม่แล้วไม่มีสถานะยืนยันว่าอัปโหลดตรงกับบอร์ดหรืออยู่ตรงท่า…)](../../modules/arm-lab/shared/requirements/req-017.md) | [รายละเอียด](tp-001-cases-desktop-2.md#tp001-018) |
| TP001-019 | (1) โหลดไฟล์ผ่าน UI load | [AC-025-01 (รันชุด move_right, jump, move_left ที่ถูกต้องแล้วได้รายการคำสั่ง จำนวน…)](../../modules/code-lab/shared/requirements/req-025.md), [AC-025-02 (ส่งคำสั่งนอก DSL แล้วแสดงข้อผิดพลาด ไม่ดำเนินเป็น Python ทั่วไป)](../../modules/code-lab/shared/requirements/req-025.md), [AC-025-03 (บันทึกแล้วเปิด source เดิมได้)](../../modules/code-lab/shared/requirements/req-025.md) | [รายละเอียด](tp-001-cases-desktop-3.md#tp001-019) |
| TP001-020 | compile/run/save/reopen | [AC-026-01 (move_right(2) ตามด้วย repeat 2 ครั้งของ jump ให้ผลคำสั่ง move_right,…)](../../modules/block-lab/shared/requirements/req-026.md), [AC-026-02 (มีสองลำดับที่ไม่เชื่อมกันแล้วรันไม่ได้ และแจ้งให้เชื่อมเป็นลำดับเดียว)](../../modules/block-lab/shared/requirements/req-026.md), [AC-026-03 (โปรแกรมที่ขยายเกิน 64 commands, ซ้อน repeat เกิน 8 ชั้น หรือใช้…)](../../modules/block-lab/shared/requirements/req-026.md), [AC-026-04 (บันทึก workspace แล้วเปิดใหม่ได้บล็อก ค่า การเชื่อมต่อ และสถานะ enabled…)](../../modules/block-lab/shared/requirements/req-026.md) | [รายละเอียด](tp-001-cases-desktop-3.md#tp001-020) |
| TP001-021 | บันทึกและเปิดหลายงานทั้งสามโหมด | [AC-036-01 (Guest ที่มี License บันทึกและเปิดหลายงานทั้งสามโหมดในเครื่องได้โดยไม่ต้อ…)](../../modules/app-shell/shared/requirements/req-036.md) | [รายละเอียด](tp-001-cases-guest.md#tp001-021) |
| TP001-022 | Login แล้ว save/open Cloud | [AC-036-02 (นักเรียนและครู Login ด้วยบัญชีเดิมและ License แล้วบันทึก/เปิดโครงงาน…)](../../modules/app-shell/shared/requirements/req-036.md), [AC-036-04 (บันทึก Cloud ไม่สำเร็จแล้วแจ้งความล้มเหลว ไม่แสดงว่า Cloud…)](../../modules/app-shell/shared/requirements/req-036.md) | [รายละเอียด](tp-001-cases-guest.md#tp001-022) |
| TP001-023 | login desktop | AC-036-02 | [รายละเอียด](tp-001-cases-guest.md#tp001-023) |
| TP001-024 | ทดลอง local | [AC-036-05 (ครูทดลองภารกิจ/ข้อสอบ local และเก็บโครงงาน Cloud ได้ แต่ส่ง…)](../../modules/app-shell/shared/requirements/req-036.md) | [รายละเอียด](tp-001-cases-guest.md#tp001-024) |

[case ลำดับถัดไปในช่วงเดียวกัน](tp-001-catalog-2-continued.md)
