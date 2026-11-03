# สารบัญ Desktop, Project, License และ Release

> แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (SA-003 — เพิ่มผลทบทวน Host/robot)

[กลับสารบัญ design](index.md) · สัญญาหลักและสถานะอยู่ในสารบัญหลัก ส่วนตารางนี้เป็นสัญญาย่อยและหลักฐานประกอบ

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [project-api-001.md](project-api-001.md) | 2 | HTTP Project API, ETag, immutable revision และ CommitProjectAsync | PROPOSED — หน่วย commit ยืนยันตามมติผู้ใช้แล้ว |
| [local-project-boundary-001.md](local-project-boundary-001.md) | 1 | Local revision/errors, OS locks, anchored filesystem, strict JSON และ migration receipt | คำชี้แจงสัญญา — ประโยค fuel ใน DES ยังรอ align กับ requirement |
| [guest-workspace-001.md](guest-workspace-001.md) | 1 | พื้นที่ร่วม Guest ถังขยะและไฟล์ส่งออก | PROPOSED — นโยบายยืนยันแล้ว; เวลา/trash/export รอ proof |
| [guest-import-001.md](guest-import-001.md) | 1 | Explicit Project import, receipt และ deduplication | PROPOSED — ใช้ schema เดิม |
| [guest-history-001.md](guest-history-001.md) | 1 | Local history, provenance และตรวจผลใหม่ก่อนเข้า Cloud | PROPOSED — employee ไม่สร้างผลเรียน Cloud |
| [des-006-review.md](des-006-review.md) | 1 | ทบทวน Host/IPC/robot: as-built, payload, lifecycle, platform และ fake | เตรียมรายการให้คน review ก่อน BE-010; runtime/hardware ยังไม่ตรวจ |
| [robot-boundary-001.md](robot-boundary-001.md) | 2 | Robot payload และ idle/drain-stop | poll 3000ms/debounce0 ยังเป็นสมมติฐาน |
| [license-admin-security-001.md](license-admin-security-001.md) | 1 | License admin roles/errors และ replay/cleanup | replay create-license 15 นาทีอนุมัติแล้ว |
| [audit-evidence-storage-001.md](audit-evidence-storage-001.md) | 1 | เก็บ evidence ของ publish และอ่านจาก event เดิมตอน withdraw | รออนุมัติขยาย Reason ตาม [physical delta](audit-evidence-migration-001.md) |
| [release-trust-001.md](release-trust-001.md) | 2 | Manifest signer/publisher pin และ registry | รอ custody/security และอนุมัติ audit storage ร่วม |
| [update-disposition-001.md](update-disposition-001.md) | 1 | ทางเลือกขอบเขต check กับ PrepareUpdate/InstallPreparedUpdate | ผู้ใช้เลือก workflow explicit และตรวจรับ AC แล้ว |
| [credential-matrix-001.md](credential-matrix-001.md) | 2 | Process/account/สิทธิ์ที่แต่ละงานต้องใช้ | actual grants/account names ยังไม่ยืนยัน |
| [credential-matrix-001-matrix.md](credential-matrix-001-matrix.md) | 2 | Matrix process และสิทธิ์ | ใช้ร่วมสัญญาทางเข้า Rev 2; ขอบเขตที่รับรองคงตามแถวทางเข้า |
| [signing-custody-001.md](signing-custody-001.md) | 2 | ผู้ถือ/ที่เก็บ/sign/rotate/revoke/backup ของกุญแจ | รอเจ้าของเติม; ผู้ใช้พักคำถาม custody |
| [signing-custody-001-matrix.md](signing-custody-001-matrix.md) | 2 | Matrix การถือและใช้ key | ใช้ร่วมสัญญาทางเข้า Rev 2; ขอบเขตที่รับรองคงตามแถวทางเข้า |
| [hardware-survey-001.md](hardware-survey-001.md) | 1 | หลักฐานและแผนสำรวจอุปกรณ์/OS | รอ physical evidence และตรวจรับรุ่น |
| [hardware-survey-001-evidence.md](hardware-survey-001-evidence.md) | 1 | หลักฐาน source และข้อจำกัดเดิม | ใช้ร่วมสัญญาทางเข้า Rev 1; ขอบเขตที่รับรองคงตามแถวทางเข้า |
| [os-compatibility-001.md](os-compatibility-001.md) | 2 | หลักฐาน compatibility และข้อเสนอ OS เดิม | target ใช้มติ Windows11 ปัจจุบัน; runtime ยังรอ |
| [os-compatibility-001-evidence.md](os-compatibility-001-evidence.md) | 2 | หลักฐาน source และข้อจำกัดเดิม | ใช้ร่วมสัญญาทางเข้า Rev 2; ขอบเขตที่รับรองคงตามแถวทางเข้า |
| [windows10-compatibility-001.md](windows10-compatibility-001.md) | 1 | ผลสำรวจ Windows 10 ก่อนเปลี่ยน target | Windows10 ไม่อยู่ในเป้าหมายปัจจุบัน |
| [windows10-compatibility-001-evidence.md](windows10-compatibility-001-evidence.md) | 1 | หลักฐาน source และข้อจำกัดเดิม | ใช้ร่วมสัญญาทางเข้า Rev 1; ขอบเขตที่รับรองคงตามแถวทางเข้า |
| [export-proof-pack-001.md](export-proof-pack-001.md) | 2 | ชุดหลักฐาน export: coverage, สิทธิ์, recovery และการตรวจข้อมูลก่อนเข้า knowledge | โครงชุดหลักฐาน; ยังไม่ใช่ผลรับรอง runtime |
| [export-proof-pack-001-recovery.md](export-proof-pack-001-recovery.md) | 2 | Gate, recovery และหลักฐาน | ใช้ร่วมโครงชุดหลักฐาน; ยังไม่ใช่ผลรับรอง runtime |
| [source-review-001.md](source-review-001.md) | ไม่ระบุ | As-built Block/Arm/Code และเส้นทางบทเรียน/สร้างงาน | EVIDENCE — ไม่ใช่ test verdict/release proof |
| [des-001-host.md](des-001-host.md) | 1 | กำหนดเงื่อนไข Desktop host, bridge, engine และวงจรงาน | ใช้ร่วมสัญญา DES-001 Rev 1; สถานะตามสารบัญหลัก |
| [des-001-acceptance.md](des-001-acceptance.md) | 1 | กำหนดเกณฑ์ตรวจ Desktop host และ IPC | ใช้ร่วมสัญญา DES-001 Rev 1; สถานะตามสารบัญหลัก |
| [des-001-references.md](des-001-references.md) | 1 | รวมข้อกำหนดและมติของ Desktop host และ IPC | ใช้ร่วมสัญญา DES-001 Rev 1; สถานะตามสารบัญหลัก |
| [des-002-device-proof.md](des-002-device-proof.md) | 3 | กำหนดการเก็บ key, ตัวตนอุปกรณ์, API และ device proof | ใช้ร่วมสัญญา DES-002 Rev 3; สถานะตามสารบัญหลัก |
| [des-002-entitlement.md](des-002-entitlement.md) | 3 | กำหนดการบันทึกเป็นหน่วยเดียว การลองซ้ำ และ signed entitlement | ใช้ร่วมสัญญา DES-002 Rev 3; สถานะตามสารบัญหลัก |
| [des-002-recovery.md](des-002-recovery.md) | 3 | กำหนดสถานะในเครื่อง ข้อผิดพลาด การกู้คืน และเกณฑ์ตรวจ License | ใช้ร่วมสัญญา DES-002 Rev 3; สถานะตามสารบัญหลัก |
| [des-002-references.md](des-002-references.md) | 3 | รวมข้อกำหนดและมติของ License และ device binding | ใช้ร่วมสัญญา DES-002 Rev 3; สถานะตามสารบัญหลัก |
| [des-003-document.md](des-003-document.md) | 4 | กำหนดเงื่อนไขโครงงาน เอกสาร v2, API และ bridge | ใช้ร่วมสัญญา DES-003 Rev 4; สถานะตามสารบัญหลัก |
| [des-003-persistence.md](des-003-persistence.md) | 4 | กำหนดสถานะ การแก้ข้อมูลชน การกู้คืน และการย้ายข้อมูลโครงงาน | ใช้ร่วมสัญญา DES-003 Rev 4; สถานะตามสารบัญหลัก |
| [des-003-acceptance.md](des-003-acceptance.md) | 4 | อธิบายทางเลือกและเกณฑ์ตรวจโครงงาน Local/Cloud | ใช้ร่วมสัญญา DES-003 Rev 4; สถานะตามสารบัญหลัก |
| [des-003-references.md](des-003-references.md) | 4 | รวมข้อกำหนดและมติของโครงงาน Local/Cloud | ใช้ร่วมสัญญา DES-003 Rev 4; สถานะตามสารบัญหลัก |
| [des-006-platform.md](des-006-platform.md) | 2 | กำหนดเงื่อนไข platform boundary, profile และการรับรองหุ่นจริง | ใช้ร่วมสัญญา DES-006 Rev 3; สถานะตามสารบัญหลัก |
| [des-006-commands.md](des-006-commands.md) | 2 | กำหนดคำสั่ง ผลลัพธ์ วงจรงาน ความล้มเหลว และ release guard ของหุ่นจริง | ใช้ร่วมสัญญา DES-006 Rev 3; สถานะตามสารบัญหลัก |
| [des-006-references.md](des-006-references.md) | 2 | รวมข้อกำหนดและมติของหุ่นจริง Windows/macOS | ใช้ร่วมสัญญา DES-006 Rev 3; สถานะตามสารบัญหลัก |
| [des-007-manifest.md](des-007-manifest.md) | 4 | กำหนดเงื่อนไข release manifest, API และขั้นตอนของ host | ใช้ร่วมสัญญา DES-007 Rev 4; สถานะตามสารบัญหลัก |
| [des-007-recovery.md](des-007-recovery.md) | 3 | กำหนดข้อผิดพลาด การกู้คืน ความเข้ากันได้ และเกณฑ์ตรวจ trusted update | ใช้ร่วมสัญญา DES-007 Rev 4; สถานะตามสารบัญหลัก |
| [des-007-references.md](des-007-references.md) | 3 | รวมข้อกำหนดและมติของ release และ trusted update | ใช้ร่วมสัญญา DES-007 Rev 4; สถานะตามสารบัญหลัก |
