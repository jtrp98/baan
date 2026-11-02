# Traceability — Desktop และโครงงาน

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-017-01 (โหลดโครงงานถูกต้องที่มีสองท่าและกลุ่ม แล้วได้ชื่อ ค่า เวลา ลำดับ…)](../requirement/req-017.md) | [TP001-018](tp-001-cases-desktop-2.md#tp001-018) | [FE-004 (Mode adapters)](../plan/index.md)/front | [QA-003 (Labs QA)](../plan/index.md)/check | NOT_RUN |
| [AC-017-02 (โหลดโครงงานที่มี ID ท่าซ้ำหรือค่าท่านอกช่วงแล้วมีข้อผิดพลาด)](../requirement/req-017.md) | [TP001-018](tp-001-cases-desktop-2.md#tp001-018) | FE-004/front | QA-003/check | NOT_RUN |
| [AC-017-03 (บันทึกและเปิดใหม่แล้วไม่มีสถานะยืนยันว่าอัปโหลดตรงกับบอร์ดหรืออยู่ตรงท่า…)](../requirement/req-017.md) | [TP001-018](tp-001-cases-desktop-2.md#tp001-018) | FE-004/front | QA-003/check | NOT_RUN |

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ
