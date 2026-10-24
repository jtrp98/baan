# ผลตรวจและส่งต่อใบงาน060a — Rev1

วันที่ของงาน 2026-10-24 · arch · สถานะเอกสารอยู่ที่ [index](index.md). งานนี้ docs-only ตาม queue-003 §3.1 ไม่ใช่ implementation/re-audit หรือ release acceptance

## ผลลัพธ์และ coverage

| ใบงาน | ไฟล์ / Rev ที่ส่ง | สิ่งที่แก้หรือเตรียม |
|---|---|---|
| 1 GAP-01 | DES-003 Rev4 | โหลด UI ≤16384 UTF-16 code units แยก runtime ≤16384 UTF-8 bytes; ไม่บังคับเปลี่ยนหน่วย REQ-025 |
| 2 GAP-02 | DES-002 Rev3, DES-004 Rev11, license-admin-security Rev1 | path เต็ม /v2/admin/licenses, staff_admin+license_admin, 503/401/403 แยกเหตุ; ปิดทาง static bearer ตามมติเดิม |
| 3 GAP-03 | DES-002/003/007 Rev3/4/3, project-api Rev1 | UpdateDate/ETag/If-Match; แยก revision PK/counter และ binary version ออกจาก concurrency |
| 4 GAP-04 | DES-003/004/005 Rev4/11/7; guest-workspace/import/history Rev1 | workspace ร่วม, trash30วัน/เวลาปิด/rollback/purge, JSON export, explicit import/receipt/tombstone และ local snapshot→ตรวจใหม่/provenance |
| 5 GAP-06 | DES-004/005, teacher-authority Rev1 | authority เดียว course-teacher∩roster∩term, tenant ทุก join; ไม่สร้าง TeacherGrant; unknown resolver fail closed |
| 6 GAP-07 | DES-007, update-disposition Rev1 | ข้อเสนอคง explicit workflow เทียบ check-only พร้อมผลต่อ REQ-030/BE-019 ให้คนตัดสิน; ไม่มี AC ใหม่ |
| 7 GAP-08 | DES-006 Rev2, robot-boundary Rev1 | polling3000ms/debounce0 ติดสมมติฐาน; payload/bounds/drain-stop จาก source ไม่อ้าง stop latency จริง |
| 8 SEC001-003 | DES-007, release-trust Rev1 | signer เทียบ immutable CI registry เอง, host pin Authenticode subject/thumbprint และ Apple Team ID; ไม่มี unrestricted signer |
| 9 SEC001-009 | DES-002, data-contract-rules Rev8, license-admin-security | TTL15นาทีเฉพาะ create-license ติดสมมติฐาน, read-time expiry, ล้าง cipher/key-id คู่กันและคง tombstone; backup expiry ยังต้องพิสูจน์ |
| 10 SA-004/SEC001-006 | credential-matrix/signing-custody/export-proof-pack Rev1 | process×account×สิทธิ์ที่ต้องใช้/จริงที่ทราบ แยก worker/adapter, custody ทุกมิติ, outline19ACและห้าgate; unknown ไม่เติมชื่อ/สิทธิ์เอง |
| 11 BL-001 | schema-notes Rev5 | แก้ยอดเป็น PK32/UQ24/CHECK80/FK40/unique indexes13/non-unique0 ตาม review-006 และนับ SQL ซ้ำ |

index Rev5/ทะเบียน archive เพิ่มรายการรอบนี้. ไฟล์ชื่อย่อในตารางอยู่ใต้ `design/` และลิงก์ exact path ทั้งหมดอยู่ใน [index §060a](index.md#ใบงาน060a--สัญญาเฉพาะเรื่องและชุดหลักฐาน). ไฟล์ใหม่แยกต่อ contract เพื่อไม่เพิ่มเนื้อหายาวลง DES เดิม; ไฟล์เดิมขนาดใหญ่คงส่วนที่ไม่เกี่ยวข้องและประวัติ ไม่ regenerate

## As-built ที่ตรวจจริง

อ่าน [หลักฐาน source/DDL และข้อขัดกับแบบเดิม](gap-sync-evidence-001.md); แยกข้อเท็จจริงใน checkout จากข้อเสนอและ runtime proof

## การตรวจเอกสารและขอบเขตข้อมูล

ตรวจ archive SHA256 เทียบ manifest, ลิงก์ local ของไฟล์ที่แก้/เพิ่ม, Rev/Change Log วันที่งาน, residual version/source_version ที่ยังเป็นข้อห้าม/ประวัติ และยอด SQL declaration. หลักฐานเครื่องตรวจบันทึกที่ [gap-sync-validation-001.json](gap-sync-validation-001.json); ไม่รันแอป/API/SQL/hardware/installer

Relational model คง 32 ตาราง/450ฟิลด์/40 FK ตาม baseline; รอบนี้ไม่มี field/type/default/enum/key/relation เปลี่ยน ไม่เพิ่ม JSON shape ในคอลัมน์ DB. Local file/HTTP DTO ใหม่อยู่ในสัญญา Guest; Submission origin เป็น projection ของ AuditEvent เดิม ไม่เปลี่ยน Evidence:ArmEvidence. Authority ใช้ mapping เดิมและระบุ unknown เพิ่ม ไม่วาด account/profile FK ที่ไม่มีหลักฐาน

SQL และ full/integration DBML ต้องได้ SHA256 เดิมตาม [manifest](archive/2026-10-24-before-gap-sync/manifest.json). ไม่มี DBML annotation amendment จึงไม่สร้างภาพใหม่. ผล parser เดิมอ้าง [dbml-review-002](dbml-review-002.md): @dbml/core10.3.1/dbmlv2, full32/450/physical40/logical0; integration24/112/physical4/logical12. รอบนี้ module ไม่อยู่ใน Node resolution path จึงไม่ได้รัน parser ใหม่ และไม่ใช้ผลเก่ากล่าวว่า runtime/parity รอบนี้ผ่าน

## ข้อที่ยังหยุดก่อน downstream และผู้รับต่อ

| Task / Reference | เหตุผล / สิ่งส่งต่อ |
|---|---|
| SA-001/BE-019 / GAP-07, REQ-030 | ต้องให้ผู้มีอำนาจเลือกตาม [disposition](update-disposition-001.md); arch ไม่ตัด scope หรือเพิ่ม AC. หลังคำตอบให้ spec/gm/inspect amend เอกสารที่ตนเป็นเจ้าของ |
| SA-004 / SEC001-002/006/003/009 | เจ้าของ DB/infra/release เติมชื่อบัญชีจริง/grants/process mounts/custodian/publisher pin/rotation/backup expiry; jpo re-audit หรือส่ง residual ให้ผู้มีอำนาจรับเป็นลายลักษณ์อักษรตาม gate เดิม |
| DES-004/005 / GAP-06 | legacy/sys/vault ต้องให้หลักฐาน resolver roster/status/move/term และ tenant ทุก alias; ไม่ถามธุรกิจเดิม ไม่เปิดสิทธิ์จาก query ที่ยังพิสูจน์ไม่ได้ |
| G/Light / transport contract | endpoint/projection ที่เติมใน Guest และ ETag/copy semantics ต้องตามแก้ RPC/DTO/mapper เมื่อรับแบบ; ไม่แก้ proto/config หรืออ้างว่าข้อยกเว้น opaque-session/H5 ผ่าน |
| inspect / TP001 GAP-01..04/06..08 | sync expected จากเอกสารรอบนี้และเพิ่มกรณีตรวจภายใต้ AC เดิม; runtime cases ยังไม่รัน. GAP-07 coverage รอคำตอบก่อนเพิ่ม AC |
| vault / BL-001 และ schema parity | ไม่มี schema proposal/SQL delta ส่งให้ตรวจ reuse constraints/atomicity; review-005 ยอดเก่าเป็นประวัติ ส่วน schema-notes แก้แล้วโดย arch ไม่แตะ db/ |

ไม่มีการแก้ requirement/plan/test-plan/planning/code/SQL/proto/config, ไม่มี commit หรือ release. คง110tasks pending และ gates/security findings ตามเดิม. นายช่างรับเอกสารแล้วส่งเจ้าของต่อ; ไม่ถือว่าส่งมอบเอกสารเท่ากับได้รับ approval

## Change Log
- 2026-10-24 — Rev1: ใบงาน060a สรุป11รายการ หลักฐาน as-built/verification และข้อที่ยังต้องให้เจ้าของ/มนุษย์ตัดสิน
