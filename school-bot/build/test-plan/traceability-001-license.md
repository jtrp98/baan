# Traceability — License/Release/ตัวตน

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-027-01 (เมื่อระบบยืนยันตัวตนพนักงานที่ /v2/admin ยังไม่ถูกตั้งค่า (เดิมเรียก…)](../../modules/app-shell/shared/requirements/req-027.md) | [TP001-007](tp-001-cases-license-2.md#tp001-007) | [BE-003 (Admin License)](../plan/index.md)/sys | [QA-001 (License QA)](../plan/index.md)/check | NOT_RUN |
| [AC-027-02 (ผู้เรียกที่มี staff session และ StaffRole ที่มีสิทธิ์…)](../../modules/app-shell/shared/requirements/req-027.md) | [TP001-007](tp-001-cases-license-2.md#tp001-007) | BE-003/sys | QA-001/check | NOT_RUN |
| [AC-027-03 (ผู้เรียกที่มีสิทธิ์ (ตาม BR-027-01) เรียกรายการหลังสร้างแล้วเห็น…)](../../modules/app-shell/shared/requirements/req-027.md) | [TP001-007](tp-001-cases-license-2.md#tp001-007) | BE-003/sys | QA-001/check | NOT_RUN |
| [AC-027-04 (ผู้เรียกที่มีสิทธิ์ (ตาม BR-027-01) สร้าง License แล้ว restart API…)](../../modules/app-shell/shared/requirements/req-027.md) | [TP001-008](tp-001-cases-license-2.md#tp001-008) | BE-003/sys | QA-001/check | NOT_RUN |
| [AC-028-01 (เปิดใช้ Key เดียวบนเครื่อง A ซ้ำได้)](../../modules/app-shell/shared/requirements/req-028.md) | [TP001-005](tp-001-cases-license.md#tp001-005) | [BE-004 (Signed lease)](../plan/index.md)/sys | QA-001/check | NOT_RUN |
| [AC-028-02 (Validate device ที่ยังไม่ activate ได้ DEVICE_NOT_ACTIVATED)](../../modules/app-shell/shared/requirements/req-028.md) | [TP001-005](tp-001-cases-license.md#tp001-005) | BE-004/sys | QA-001/check | NOT_RUN |
| [AC-028-03 (หลัง revoke หรือถึงเวลาหมดอายุ ทั้ง activate และ validate ถูกปฏิเสธว่า…)](../../modules/app-shell/shared/requirements/req-028.md) | [TP001-006](tp-001-cases-license-2.md#tp001-006) | BE-004/sys | QA-001/check | NOT_RUN |
| [AC-028-04 (เมื่อลองเปิดใช้ด้วย License ไม่ถูกต้องและไม่เคยมีสิทธิ์ที่ใช้ได้…)](../../modules/app-shell/shared/requirements/req-028.md) | [TP001-002](tp-001-cases-license.md#tp001-002) | [FE-001 (License UI)](../plan/index.md)/front | QA-001/check | NOT_RUN |
| [AC-029-01 (สร้าง metadata ถูกต้องแล้ว published=false)](../../modules/app-shell/shared/requirements/req-029.md) | [TP001-046](tp-001-cases-release-model.md#tp001-046) | [BE-018 (Release API)](../plan/index.md)/sys | [QA-010 (Update/assets QA)](../plan/index.md)/check | NOT_RUN |
| [AC-029-02 (Version ผิดรูปแบบ, platform ไม่รองรับ, URL ไม่ใช่ HTTPS, hash ผิด หรือ…)](../../modules/app-shell/shared/requirements/req-029.md) | [TP001-046](tp-001-cases-release-model.md#tp001-046) | BE-018/sys | QA-010/check | NOT_RUN |
| [AC-029-03 (Update check คืนเฉพาะ published release ใหม่สุดที่ channel/platform…)](../../modules/app-shell/shared/requirements/req-029.md) | [TP001-047](tp-001-cases-release-model.md#tp001-047) | BE-018/sys | QA-010/check | NOT_RUN |
| [AC-030-01 (เมื่อไม่มี published release ใหม่กว่า ผลตรวจมี available=false,…)](../../modules/app-shell/shared/requirements/req-030.md) | [TP001-047](tp-001-cases-release-model.md#tp001-047) | [BE-019 (Update check/Prepare/Install)](../plan/index.md)/sys | QA-010/check | NOT_RUN |
| [AC-030-02 (เมื่อมี release ที่เข้าเงื่อนไข ผู้ใช้เห็น metadata…)](../../modules/app-shell/shared/requirements/req-030.md) | [TP001-048](tp-001-cases-release-model.md#tp001-048) | BE-019/sys | QA-010/check | NOT_RUN |
| [AC-030-03 (เมื่อ API เข้าไม่ได้ การตรวจแสดงข้อผิดพลาดและผู้ใช้กลับไปใช้งาน local…)](../../modules/app-shell/shared/requirements/req-030.md) | [TP001-048](tp-001-cases-release-model.md#tp001-048) | BE-019/sys | QA-010/check | NOT_RUN |
| [AC-030-04 (การเตรียมอัปเดตเริ่มเฉพาะเมื่อผู้ใช้สั่งเอง และตรวจ trust ครบ)](../../modules/app-shell/shared/requirements/req-030.md) | [TP001-080](tp-001-cases-boundary-2.md#tp001-080), [TP001-048](tp-001-cases-release-model.md#tp001-048) | BE-019/sys | QA-010/check | NOT_RUN |
| [AC-030-05 (artifact ใน staging ถูกตรวจความสมบูรณ์ซ้ำ (กัน TOCTOU) ตอนสั่งติดตั้ง —…)](../../modules/app-shell/shared/requirements/req-030.md) | [TP001-080](tp-001-cases-boundary-2.md#tp001-080) | BE-019/sys | QA-010/check | NOT_RUN |
| [AC-030-06 (การติดตั้งต้องขอหยุดงานค้าง/หุ่น (stop เป็นเพียงคำขอ)…)](../../modules/app-shell/shared/requirements/req-030.md) | [TP001-080](tp-001-cases-boundary-2.md#tp001-080) | BE-019/sys | QA-010/check | NOT_RUN |
| [AC-030-07 (การติดตั้งล้มเหลวกลางทาง เครื่องกลับมาใช้งานเวอร์ชันเดิมได้…)](../../modules/app-shell/shared/requirements/req-030.md) | [TP001-080](tp-001-cases-boundary-2.md#tp001-080) | BE-019/sys | QA-010/check | NOT_RUN |
| [AC-030-08 (ผู้ใช้ยกเลิกหรือปิดแอประหว่างเตรียม/ก่อนติดตั้ง…)](../../modules/app-shell/shared/requirements/req-030.md) | [TP001-080](tp-001-cases-boundary-2.md#tp001-080) | BE-019/sys | QA-010/check | NOT_RUN |
| [AC-031-01 (บน Windows 11 25H2 x64 บัญชีทดสอบสะอาดที่มี WebView2 ติดตั้ง MSI…)](../../modules/app-shell/shared/requirements/req-031.md) | [TP001-049](tp-001-cases-release-model.md#tp001-049) | [BE-020 (Windows MSI)](../plan/index.md)/sys | [QA-008 (Windows install QA)](../plan/index.md)/check | NOT_RUN |
| [AC-031-02 (เมื่อไม่มี WebView2 มีขั้นตอนขอให้ติดตั้ง)](../../modules/app-shell/shared/requirements/req-031.md) | [TP001-049](tp-001-cases-release-model.md#tp001-049) | BE-020/sys | QA-008/check | NOT_RUN |
| [AC-031-03 (ใน installation ทดสอบ ลบไฟล์ engine แล้ว repair คืนได้)](../../modules/app-shell/shared/requirements/req-031.md) | [TP001-050](tp-001-cases-release-model.md#tp001-050) | BE-020/sys | QA-008/check | NOT_RUN |
| [AC-031-04 (แพ็กเกจเวอร์ชันใหม่อัปเกรด installation ทดสอบได้ และแพ็กเกจเก่ากว่าไม่…)](../../modules/app-shell/shared/requirements/req-031.md) | [TP001-050](tp-001-cases-release-model.md#tp001-050) | BE-020/sys | QA-008/check | NOT_RUN |
| [AC-031-05 (บน Windows 11 25H2 x64 กับหุ่นที่ผ่านการยืนยันรุ่นแล้ว…)](../../modules/app-shell/shared/requirements/req-031.md) | [TP001-041](tp-001-cases-robot-3.md#tp001-041), [TP001-042](tp-001-cases-robot-3.md#tp001-042) | [BE-013 (Engine bounds)](../plan/index.md)/sys | [QA-005 (Windows robot QA)](../plan/index.md)/check, QA-008/check | NOT_RUN |
| [AC-032-01 (ติดตั้งแพ็กเกจเดียวบนเครื่องทดสอบ macOS 15+ ทั้ง Intel และ Apple Silicon…)](../../modules/app-shell/shared/requirements/req-032.md) | [TP001-051](tp-001-cases-release-model-2.md#tp001-051) | [BE-021 (macOS PKG)](../plan/index.md)/sys | [QA-009 (macOS install QA)](../plan/index.md)/check | NOT_RUN |

## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · BR = Business Rule หรือกฎธุรกิจ · TOCTOU = Time of Check to Time of Use
