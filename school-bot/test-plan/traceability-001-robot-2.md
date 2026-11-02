# Traceability — หุ่นและ Code Lab

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-026-01 (move_right(2) ตามด้วย repeat 2 ครั้งของ jump ให้ผลคำสั่ง move_right,…)](../requirement/req-026.md) | [TP001-020](tp-001-cases-desktop-3.md#tp001-020) | [FE-007 (Block Lab)](../plan/index.md)/front | [QA-003 (Labs QA)](../plan/index.md)/check | NOT_RUN |
| [AC-026-02 (มีสองลำดับที่ไม่เชื่อมกันแล้วรันไม่ได้ และแจ้งให้เชื่อมเป็นลำดับเดียว)](../requirement/req-026.md) | [TP001-020](tp-001-cases-desktop-3.md#tp001-020) | FE-007/front | QA-003/check | NOT_RUN |
| [AC-026-03 (โปรแกรมที่ขยายเกิน 64 commands, ซ้อน repeat เกิน 8 ชั้น หรือใช้…)](../requirement/req-026.md) | [TP001-020](tp-001-cases-desktop-3.md#tp001-020) | FE-007/front | QA-003/check | NOT_RUN |
| [AC-026-04 (บันทึก workspace แล้วเปิดใหม่ได้บล็อก ค่า การเชื่อมต่อ และสถานะ enabled…)](../requirement/req-026.md) | [TP001-020](tp-001-cases-desktop-3.md#tp001-020) | [FE-004 (Mode adapters)](../plan/index.md)/front | QA-003/check | NOT_RUN |

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ
