# Traceability — License/Release/ตัวตน

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — trace setup BE-005/BE-007 และ tamper/copy)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-032-02 (บน macOS 15+ ทั้ง Intel และ Apple Silicon…)](../../modules/app-shell/shared/requirements/req-032.md) | [TP001-043](tp-001-cases-robot-3.md#tp001-043), [TP001-044](tp-001-cases-robot-3.md#tp001-044) | [BE-021 (macOS PKG)](../plan/index.md)/sys | [QA-006 (Intel robot QA)](../plan/index.md)/check, [QA-007 (ARM robot QA)](../plan/index.md)/check, [QA-009 (macOS install QA)](../plan/index.md)/check | NOT_RUN |
| [AC-032-03 (ถอนแอปจาก Applications แล้วข้อมูลโครงงานใน Application Support ยังคงอยู่)](../../modules/app-shell/shared/requirements/req-032.md) | [TP001-051](tp-001-cases-release-model-2.md#tp001-051) | BE-021/sys | QA-009/check | NOT_RUN |
| [AC-033-01 (ตรวจหลักฐาน catalog ของ DB ที่ระบบทดสอบใช้งานแล้วพบชื่อตาราง License…)](../../modules/app-shell/shared/requirements/req-033.md) | [TP001-052](tp-001-cases-release-model-2.md#tp001-052), [TP001-053](tp-001-cases-release-model-2.md#tp001-053) | [DBA-001 (Physical map)](../plan/index.md)/vault, [DBA-003 (Core evidence)](../plan/index.md)/vault | [QA-001 (License QA)](../plan/index.md)/check | NOT_RUN |
| [AC-033-02 (ตรวจ catalog ของ DB เดียวกันแล้วพบ SchoolBotLicenseId เป็น Primary Key…)](../../modules/app-shell/shared/requirements/req-033.md) | [TP001-052](tp-001-cases-release-model-2.md#tp001-052), [TP001-053](tp-001-cases-release-model-2.md#tp001-053) | DBA-001/vault, DBA-003/vault | QA-001/check | NOT_RUN |
| [AC-033-03 (ตรวจ catalog ของ DB เดียวกันแล้วพบฟิลด์มาตรฐานครบทั้งหกชื่อ…)](../../modules/app-shell/shared/requirements/req-033.md) | [TP001-052](tp-001-cases-release-model-2.md#tp001-052), [TP001-053](tp-001-cases-release-model-2.md#tp001-053) | DBA-001/vault, DBA-003/vault | QA-001/check | NOT_RUN |
| [AC-033-04 (ตรวจ catalog ของ DB ที่ระบบทดสอบใช้งานแล้วทุกตารางข้อมูลของผลิตภัณฑ์ใช้…)](../../modules/app-shell/shared/requirements/req-033.md) | [TP001-052](tp-001-cases-release-model-2.md#tp001-052), [TP001-053](tp-001-cases-release-model-2.md#tp001-053) | DBA-001/vault, DBA-003/vault, DBA-007/vault | QA-001/check | NOT_RUN |
| [AC-033-05 (จาก catalog เดียวกัน PK ของตาราง SchoolBot ใหม่เป็น int4…)](../../modules/app-shell/shared/requirements/req-033.md) | [TP001-052](tp-001-cases-release-model-2.md#tp001-052), [TP001-053](tp-001-cases-release-model-2.md#tp001-053) | DBA-001/vault, DBA-003/vault, DBA-007/vault | QA-001/check | NOT_RUN |
| [AC-034-01 (ครั้งแรกไม่มีอินเทอร์เน็ต เข้าโหมดหลักไม่ได้แม้กรอก Key แล้ว)](../../modules/app-shell/shared/requirements/req-034.md) | [TP001-002](tp-001-cases-license.md#tp001-002) | [BE-007 (Host entitlement)](../plan/index.md)/sys | QA-001/check | NOT_RUN |
| [AC-034-02 (ตรวจออนไลน์ได้ Active แล้วเข้าใช้งานได้และมีสิทธิ์ในเครื่อง)](../../modules/app-shell/shared/requirements/req-034.md) | [TP001-004](tp-001-cases-license.md#tp001-004), [TP001-088](tp-001-cases-license-3.md#tp001-088) | BE-007/sys | QA-001/check | NOT_RUN |
| [AC-034-03 (ออฟไลน์ภายใน 3 วันจากตรวจสำเร็จล่าสุดใช้งานได้)](../../modules/app-shell/shared/requirements/req-034.md) | [TP001-003](tp-001-cases-license.md#tp001-003) | BE-007/sys | QA-001/check | NOT_RUN |
| [AC-034-04 (ครบ 3 วันและติดต่อเซิร์ฟเวอร์ไม่ได้…)](../../modules/app-shell/shared/requirements/req-034.md) | [TP001-003](tp-001-cases-license.md#tp001-003) | BE-007/sys | QA-001/check | NOT_RUN |
| [AC-034-05 (ตรวจ Key เดิมออนไลน์ได้ Active อีกครั้ง แล้วต่อสิทธิ์ 3…)](../../modules/app-shell/shared/requirements/req-034.md) | [TP001-004](tp-001-cases-license.md#tp001-004) | BE-007/sys | QA-001/check | NOT_RUN |
| [AC-034-06 (ได้ผล Key ไม่ Active แล้วไม่ต่อสิทธิ์หรือใช้ค่าเดิมข้ามผลปฏิเสธเพื่อปลดล็อก)](../../modules/app-shell/shared/requirements/req-034.md) | [TP001-004](tp-001-cases-license.md#tp001-004) | BE-007/sys | QA-001/check | NOT_RUN |
| [AC-035-01 (ผู้ไม่มีสิทธิ์ผู้ดูแลขอปลดเครื่องแล้วถูกปฏิเสธ และการผูกเครื่องไม่เปลี่ยน)](../../modules/app-shell/shared/requirements/req-035.md) | [TP001-009](tp-001-cases-license-3.md#tp001-009) | [BE-005 (Key transfer)](../plan/index.md)/sys | QA-001/check | NOT_RUN |
| [AC-035-02 (ผู้ดูแลปลด A แล้ว B เปิดใช้ Key เดิมได้ทันที แม้ A…)](../../modules/app-shell/shared/requirements/req-035.md) | [TP001-009](tp-001-cases-license-3.md#tp001-009) | BE-005/sys | QA-001/check | NOT_RUN |
| [AC-035-03 (B ต้องเปิดใช้ Key ออนไลน์ครั้งแรก ไม่ใช้สิทธิ์ออฟไลน์ของ A แทน)](../../modules/app-shell/shared/requirements/req-035.md) | [TP001-009](tp-001-cases-license-3.md#tp001-009), [TP001-088](tp-001-cases-license-3.md#tp001-088) | BE-007/sys | QA-001/check | NOT_RUN |
| [AC-035-04 (หลัง Key ผูกกับ B แล้ว A ตรวจออนไลน์ไม่ผ่านและไม่ได้สิทธิ์ออฟไลน์รอบใหม่)](../../modules/app-shell/shared/requirements/req-035.md) | [TP001-009](tp-001-cases-license-3.md#tp001-009) | BE-005/sys | QA-001/check | NOT_RUN |
| [AC-035-05 (A ที่ออฟไลน์ยังใช้ได้ก่อนสิทธิ์เดิมหมด แต่ครบกำหนดแล้วเข้าโหมดหลักไม่ได้)](../../modules/app-shell/shared/requirements/req-035.md) | [TP001-010](tp-001-cases-license-3.md#tp001-010) | BE-007/sys | QA-001/check | NOT_RUN |
| [AC-036-01 (Guest ที่มี License บันทึกและเปิดหลายงานทั้งสามโหมดในเครื่องได้โดยไม่ต้อ…)](../../modules/app-shell/shared/requirements/req-036.md) | [TP001-021](tp-001-cases-guest.md#tp001-021) | [BE-009 (Local projects)](../plan/index.md)/sys | [QA-002 (Projects QA)](../plan/index.md)/check | NOT_RUN |
| [AC-036-02 (นักเรียนและครู Login ด้วยบัญชีเดิมและ License แล้วบันทึก/เปิดโครงงาน…)](../../modules/app-shell/shared/requirements/req-036.md) | [TP001-022](tp-001-cases-guest.md#tp001-022), [TP001-023](tp-001-cases-guest.md#tp001-023) | [BE-008 (Cloud projects)](../plan/index.md)/sys | QA-001/check | NOT_RUN |
| [AC-036-03 (Restart บริการแล้ว Login บัญชีเดิมยังเรียกโครงงานที่บันทึกสำเร็จได้)](../../modules/app-shell/shared/requirements/req-036.md) | [TP001-008](tp-001-cases-license-2.md#tp001-008) | BE-008/sys | QA-001/check | NOT_RUN |
| [AC-036-04 (บันทึก Cloud ไม่สำเร็จแล้วแจ้งความล้มเหลว ไม่แสดงว่า Cloud…)](../../modules/app-shell/shared/requirements/req-036.md) | [TP001-022](tp-001-cases-guest.md#tp001-022) | BE-008/sys | QA-001/check | NOT_RUN |
| [AC-036-05 (ครูทดลองภารกิจ/ข้อสอบ local และเก็บโครงงาน Cloud ได้ แต่ส่ง…)](../../modules/app-shell/shared/requirements/req-036.md) | [TP001-024](tp-001-cases-guest.md#tp001-024) | BE-026/sys, BE-031/sys, FE-021/front | QA-001/check, QA-011/check, QA-013/check | NOT_RUN |
| [AC-036-06 (เมื่อสั่งออกจากระบบของบัญชี Login…)](../../modules/app-shell/shared/requirements/req-036.md) | [TP001-082](tp-001-cases-boundary-3.md#tp001-082) | [BE-006 (Login/session)](../plan/index.md)/sys, [BE-039 (เชื่อม SchoolBot ผ่าน Gateway)](../plan/index.md)/sys, [FE-002 (Login UI)](../plan/index.md)/front | QA-001/check | NOT_RUN |

[Pack BE-005/BE-007 — ครบ 3+8 AC](traceability-001-license-host-pack.md) และ [setup/doubles/ประตู](traceability-001-license-host-setup.md) เป็นส่วนบังคับของ cases; tamper/copy เป็น criterion เดิมของ BE-007 ไม่เพิ่ม AC ผลจริงยัง NOT_RUN

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · PK = Primary Key
