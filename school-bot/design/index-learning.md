# สารบัญ Learning และการส่งคะแนน

[กลับสารบัญ design](index.md) · สัญญาหลักคือ [DES-005 (หลักสูตร/ผลประเมิน)](des-005.md), [DES-008 (mapping คะแนน)](des-008.md), [DES-009 (ส่งคะแนน)](des-009.md), [DES-010 (ข้อสอบ/Attempt)](des-010.md) และ [DES-011 (เลื่อน Level)](des-011.md)

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [learning-rules-032-034.md](learning-rules-032-034.md) | 2 | Profile/run/freeze/สูตรรวมและขอบเขต override | นโยบายยืนยันแล้ว; รอ implementation proof |
| [grade-rules-032-034.md](grade-rules-032-034.md) | 1 | Mapping, partial/skip และ recovery ของการส่งคะแนน | สัญญาเดิม; export gates ยังมีผล |
| [learning-curriculum-draft-001.md](learning-curriculum-draft-001.md) | 1 | อ่าน/แก้ curriculum draft และหลักฐานอนุมัติ | Local contract; approval storage รอ vault/มนุษย์ |
| [learning-bank-draft-001.md](learning-bank-draft-001.md) | 1 | อ่าน/แก้ bank draft และจำกัด visibility | Local contract; publish เต็มรอ approval storage |
| [learning-attempt-read-001.md](learning-attempt-read-001.md) | 1 | Discovery, saved answers, history, policy และ reveal | Local contract; การเชื่อมจริงยังต้องพิสูจน์ |
| [learning-attempt-finalization-001.md](learning-attempt-finalization-001.md) | 1 | Finalization, clock/race/replay/recovery โดยไม่เพิ่ม state/table | Local contract; DB/worker proof ยังรอ |
| [learning-snapshot-projection-001.md](learning-snapshot-projection-001.md) | 1 | Snapshot reconciliation และ reader projection | Fixtures/JSON dictionary พร้อมตามฐานเดิม; reader/roster จริงยังรอ |
| [learning-sheet-import-001.md](learning-sheet-import-001.md) | 1 | ตรวจ supplied rows และขอบเขต import storage | Validator พร้อมตามฐานเดิม; source identity/ImportSource ยังรอ |
| [learning-grpc-manifest-001.md](learning-grpc-manifest-001.md) | 1 | Typed RPC/Data Transfer Object (DTO) manifest และ mapper ของ Learning | Fixtures ทำได้; Gateway/Light/SchoolBot/H5 (เงื่อนไข route/env/network/trust ระหว่างระบบ) review ยังรอ |
| [learning-ux-contract-gaps-001.md](learning-ux-contract-gaps-001.md) | 2 | สรุปช่องว่างระหว่าง Learning API และ UX | รายการช่องว่างเดิม; ไม่ใช่สัญญาใหม่ |
| [export-proof-pack-001.md](export-proof-pack-001.md) | 2 | โครงหลักฐานส่งคะแนนครบเกณฑ์เดิมและห้าเงื่อนไขเปิดใช้ | DRAFT EVIDENCE PACK — ไม่ใช่ผลทดสอบ |
| [source-review-003.md](source-review-003.md) | ไม่ระบุ | หลักฐาน Course Plan จาก Google Sheet | EVIDENCE — ไม่ใช่เนื้อหาที่อนุมัติแล้ว |
| [source-review-004.md](source-review-004.md) | ไม่ระบุ | หลักฐาน schema/reader เกรด SchoolBright ใน PGGradeDB | EVIDENCE — ไม่ยืนยัน writer/production parity |
| [source-review-005.md](source-review-005.md) | ไม่ระบุ | เส้นทาง writer score-record เดิมและ source ที่ขาด | EVIDENCE — ข้อจำกัด writer เดิม; ใช้มติให้ SchoolBot เขียนเอง |
