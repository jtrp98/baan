# สารบัญ Learning และการส่งคะแนน

> แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 054 — เลขอ้างอิงไม่เกิน 1,000 ตัวอักษรและไม่ขยาย schema)

[กลับสารบัญ design](index.md) · สัญญาหลักคือ [DES-005 (หลักสูตร/ผลประเมิน)](des-005.md), [DES-008 (mapping คะแนน)](des-008.md), [DES-009 (ส่งคะแนน)](des-009.md), [DES-010 (ข้อสอบ/Attempt)](des-010.md) และ [DES-011 (เลื่อน Level)](des-011.md)

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [learning-design-reconciliation-001.md](learning-design-reconciliation-001.md) | 2 | เทียบผลรับกฎ learning/คะแนนและข้อค้างก่อน freeze DBA-005 | รับกฎเข้าแบบแล้ว; ไม่ใช่ runtime acceptance |
| [audit-evidence-storage-001.md](audit-evidence-storage-001.md) | 2 | Mapping approval/evidence ที่เก็บตรงตัวและอ่านกลับได้ | ใช้ T1000/Reason เดิมตามมติ 054; ไม่มี schema delta; รอ implementation proof |
| [learning-rules-032-034.md](learning-rules-032-034.md) | 2 | Profile/run/freeze/สูตรรวมและขอบเขตครูปรับ policy | นโยบายยืนยันแล้ว; รอ implementation proof |
| [grade-rules-032-034.md](grade-rules-032-034.md) | 1 | Mapping, partial/skip และ recovery ของการส่งคะแนน | สัญญาเดิม; export gates ยังมีผล |
| [learning-curriculum-draft-001.md](learning-curriculum-draft-001.md) | 3 | อ่าน/แก้ curriculum draft และหลักฐานอนุมัติ | Local contract; T1000 ตามมติ 054 ไม่มี migration; รอ implementation proof |
| [learning-bank-draft-001.md](learning-bank-draft-001.md) | 3 | อ่าน/แก้ bank draft และจำกัด visibility | Local contract; T1000 ตามมติ 054 ไม่มี migration; รอ implementation proof |
| [learning-attempt-read-001.md](learning-attempt-read-001.md) | 1 | Discovery, saved answers, history, policy และ reveal | Local contract; การเชื่อมจริงยังต้องพิสูจน์ |
| [learning-attempt-finalization-001.md](learning-attempt-finalization-001.md) | 1 | Finalization, clock/race/replay/recovery โดยไม่เพิ่ม state/table | Local contract; DB/worker proof ยังรอ |
| [learning-snapshot-projection-001.md](learning-snapshot-projection-001.md) | 1 | Snapshot reconciliation และ reader projection | Fixtures/JSON dictionary พร้อมตามฐานเดิม; reader/roster จริงยังรอ |
| [learning-sheet-import-001.md](learning-sheet-import-001.md) | 1 | ตรวจ supplied rows และขอบเขต import storage | Validator พร้อมตามฐานเดิม; source identity/ImportSource ยังรอ |
| [learning-grpc-manifest-001.md](learning-grpc-manifest-001.md) | 1 | Typed RPC/Data Transfer Object (DTO) manifest และ mapper ของ Learning | Fixtures ทำได้; Gateway/Light/SchoolBot/H5 (เงื่อนไข route/env/network/trust ระหว่างระบบ) review ยังรอ |
| [learning-ux-contract-gaps-001.md](learning-ux-contract-gaps-001.md) | 2 | ช่องว่าง Learning/UX พร้อมตารางเจ็ดรายการและหลักฐานแยกไฟล์ | รายการช่องว่างเดิม; ไม่ใช่สัญญาใหม่ |
| [export-proof-pack-001.md](export-proof-pack-001.md) | 2 | โครงหลักฐานส่งคะแนนครบเกณฑ์เดิมและห้าเงื่อนไขเปิดใช้ | DRAFT EVIDENCE PACK — ไม่ใช่ผลทดสอบ |
| [source-review-003.md](source-review-003.md) | ไม่ระบุ | หลักฐาน Course Plan จาก Google Sheet | EVIDENCE — ไม่ใช่เนื้อหาที่อนุมัติแล้ว |
| [source-review-004.md](source-review-004.md) | ไม่ระบุ | หลักฐาน schema/reader เกรด SchoolBright ใน PGGradeDB | EVIDENCE — ไม่ยืนยัน writer/production parity |
| [source-review-005.md](source-review-005.md) | ไม่ระบุ | เส้นทาง writer คะแนนเดิม พร้อม reader/schema และหลักฐานแยกไฟล์ | EVIDENCE — ข้อจำกัด writer เดิม; ใช้มติให้ SchoolBot เขียนเอง |

## ส่วนต่อของสัญญาหลัก

แต่ละไฟล์ขยายสัญญา DES ที่มีเลขเดียวกัน ใช้ Rev ตามหัวไฟล์และสถานะของสัญญาหลักในสารบัญ design

| เอกสาร | Rev | มีเนื้อหาอะไร |
|---|---|---|
| [des-005-actors.md](des-005-actors.md) | 8 | อธิบาย ผู้ใช้และเงื่อนไขก่อนเรียน |
| [des-005-api.md](des-005-api.md) | 9 | อธิบาย API หลักสูตรและผลเรียน |
| [des-005-content.md](des-005-content.md) | 8 | อธิบาย โครงสร้างเนื้อหาและเกณฑ์ |
| [des-005-grading.md](des-005-grading.md) | 8 | อธิบาย การประเมินผลและกันคำขอซ้ำ |
| [des-005-offline.md](des-005-offline.md) | 8 | อธิบาย Guest ออฟไลน์และข้อผิดพลาด |
| [des-005-references.md](des-005-references.md) | 8 | อธิบาย ข้อกำหนดและมติที่อ้าง |
| [des-008-api.md](des-008-api.md) | 6 | อธิบาย API จัดการ mapping |
| [des-008-grade-slot.md](des-008-grade-slot.md) | 6 | อธิบาย การได้มาและตรวจ GradeSlot ก่อน commit |
| [des-008-ownership.md](des-008-ownership.md) | 6 | อธิบาย ขอบเขตและผู้ใช้ mapping |
| [des-008-references.md](des-008-references.md) | 6 | อธิบาย ข้อกำหนดและมติที่อ้าง |
| [des-008-validation.md](des-008-validation.md) | 6 | อธิบาย การตรวจข้อมูล โรงเรียน และสิทธิ์ |
| [des-009-api.md](des-009-api.md) | 4 | อธิบาย API preview และยืนยันส่ง |
| [des-009-delivery.md](des-009-delivery.md) | 4 | อธิบาย การล็อกและกันชนกับ writer เดิม |
| [des-009-gates.md](des-009-gates.md) | 4 | อธิบาย เงื่อนไขก่อนเปิดส่งคะแนน |
| [des-009-references.md](des-009-references.md) | 4 | อธิบาย ข้อกำหนดและมติที่อ้าง |
| [des-009-snapshot.md](des-009-snapshot.md) | 4 | อธิบาย สูตรรายช่องและ LearnerId |
| [des-010-api.md](des-010-api.md) | 6 | อธิบาย API ข้อสอบและ Attempt |
| [des-010-expiry.md](des-010-expiry.md) | 5 | อธิบาย ข้อผิดพลาดของข้อสอบ |
| [des-010-policy.md](des-010-policy.md) | 5 | อธิบาย Activity และนโยบายข้อสอบ |
| [des-010-question-bank.md](des-010-question-bank.md) | 5 | อธิบาย เจ้าของข้อมูลและ concurrency |
| [des-010-references.md](des-010-references.md) | 5 | อธิบาย ข้อกำหนดและมติที่อ้าง |
| [des-011-policy.md](des-011-policy.md) | 7 | อธิบาย ขอบเขตและ Placement |
| [des-011-proposal.md](des-011-proposal.md) | 7 | อธิบาย การคำนวณและตรึง snapshot |
| [des-011-references.md](des-011-references.md) | 7 | อธิบาย ข้อกำหนดและมติที่อ้าง |
| [des-011-transition.md](des-011-transition.md) | 7 | อธิบาย การเปลี่ยนสถานะและตรวจข้าม DB |
