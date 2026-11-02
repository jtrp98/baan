# school-bot — Module Index

> สารบัญ + สถานะปัจจุบันของโมดูล — เขียนทับให้เป็นความจริงวันนี้ ไม่มี Change Log (ประวัติดู `git log` ของไฟล์นี้)
> วิธีอ่าน: อ่าน index ของหมวดที่ต้องการก่อน แล้วเปิดเฉพาะไฟล์ที่ระบุ
> ที่นี่คือ**เอกสารกลาง** (สัญญา + สถานะที่คนอ่านได้) · ใบงาน คิว ผลตรวจรายรอบ และหลักฐานของทีม AI อยู่ใน memory repo ของเครื่องที่รัน BAAN (`memory/school-bot/` — สถานะ run: `status.md`) ข้อความที่ลงท้าย "(memory)" คือการอ้างไฟล์ในนั้น

## สถานะปัจจุบัน (2026-11-02)

- **แผน**: 110 งาน — ตรวจผ่านแล้ว (verified) 22 · โค้ดเสร็จและ test ผ่านในเครื่องแต่ยังไม่ต่อระบบจริง (done-local) 2 คือ BE-006, BE-039 · รอทำ 86 · 8 phase / 17 gate · ขอบเขต 44 REQ / 187 AC / 82 test case — ดู [plan/index.md](plan/index.md)
- **กำลังทำ**: wave 2 — BE-002 ตรวจผ่านแล้วหลังแก้ 3 รอบ ตาม[มติ051](requirement/decisions-051.md) (บันทึก Project + Revision เป็นหน่วยเดียว) · BE-039 (logout) ยังเป็น done-local
- **ทำงานได้แล้วในเครื่อง (ยังไม่ขึ้น production)**: logout ผ่าน Gateway → gRPC ผ่านการตรวจทั้ง check และ security (SEC-001..016 ปิดเฉพาะ local) · Auth และตรรกะคะแนน (Math) ผ่าน test · **ยังไม่เปิด**: gRPC บน production, Login เต็มรูปแบบ, การต่อฐานข้อมูลจริงกับ API, H5
- รายละเอียดของ run (คิว, ผล PASS/FAIL ราย slice, รอบ rework, งานที่รอ check) อยู่ใน memory `status.md`
- **ฐานข้อมูล**: ผู้ใช้รัน `schoolbot_db.sql` แล้ว ([บันทึก045](requirement/decisions-045.md)) · เชื่อมต่อจริงสำเร็จ: PostgreSQL 15.19 มีตาราง `SchoolBot*` 32 ตาราง · ยังไม่ตรวจว่า schema ตรงกับแบบทุกจุด และยังไม่ได้ต่อกับ API
- **transport**: [Gateway Rev5](design/gateway-integration-001.md) + [gRPC contract Rev2](design/gateway-grpc-contract-001.md) + [controller entry Rev2](design/gateway-controller-entry-001.md) — client→HTTP Gateway (controller ตาม[มติ050](requirement/decisions-050.md))→gRPC SchoolBot · ผู้ใช้อนุญาต dev บน branch ที่เตรียมไว้ตาม [046](requirement/decisions-046.md); local logout มี implementation + JPO092 แล้ว ส่วน Login อื่น/H5/production/runtime ยังต้องพิสูจน์
- **License**: create-license replay 15 นาทีอนุมัติแล้วตาม [046](requirement/decisions-046.md); ผู้ใช้พักเรื่อง signer/custody ตาม [047](requirement/decisions-047.md) เก็บค้างก่อนใช้กุญแจจริง งานส่วนที่ไม่พึ่งกุญแจเดินต่อได้
- **UX**: เซ็นครบ 7/7 ชุดตาม [decisions-043](requirement/decisions-043.md); UX-005 Q39–Q42 และ UX-007 Q43–Q46 รวม delta042 อนุมัติแล้ว
- **สัญญาที่ UX ต้องใช้**: [ช่องว่าง 7 กลุ่ม](design/learning-ux-contract-gaps-001.md) — สัญญาฝั่ง local พร้อมแล้ว · เรื่อง approval, ที่เก็บ provenance และหลักฐานจากเจ้าของระบบยังเปิด · มติ [decisions-042](requirement/decisions-042.md) (ตอบ A: หมดเวลาตรวจคำตอบที่บันทึกทันอัตโนมัติ) ห้ามถามซ้ำ
- **รอคน**: ดู [plan/index.md § Waiting on Human](plan/index.md#waiting-on-human)
- **กติกา runner จากผู้ใช้**: t0–t2 ใช้ Codex · t3–t5 ใช้ AGY · ไม่ fallback ข้าม runner

## Documents

| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `requirement\index.md` | สารบัญ requirement — ตาราง REQ + สถานะ + AC + decisions registry | 44 REQ (REQ-009..052) / 187 AC — DRAFT · decisions-001..051 |
| `requirement\scope.md` | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม |
| `design\index.md` | สารบัญ design — feasibility + ตาราง DES + ไฟล์สัญญา | data-model Rev8 / rules Rev11 / DBML Rev7 (32 ตาราง); constraints เหลือเฉพาะ PK32 ตามใบงาน086 (memory); DES-001..012 PROPOSED |
| `plan\index.md` | release scope, Waiting on Human, phases, ตาราง Tasks + [extension](plan/extension/index.md) | 110 tasks: 22 verified / 2 done-local / 86 pending |
| `open-questions\index.md` | สารบัญ OQ ทั้งหมด | 12 OQ (OQ-006..017): 3 PARTIAL / 9 CLOSED |
| [test-plan/index.md](test-plan/index.md) | สารบัญ test plan | 82 cases / 187 AC ([Amendment005](test-plan/tp-001-amendment-005.md) เพิ่ม TP001-082 ครอบ AC-036-06); traceability/joined JSON ยังเป็นชุด 180/77; actual ทุกเคส NOT_RUN |
| [uxui/index.md](uxui/index.md) | สารบัญ/เอกสาร UX/UI | เซ็นครบ 7/7 รวม delta042 (decisions-043) |
| [security.md](security.md) | ผลตรวจความปลอดภัย | ยังเปิด: Important 6 / Medium 6 / Minor 3 · SEC-001..016 ปิดแล้วเฉพาะ local · finding จากรอบตรวจ Gateway รอบ 2 ยังเปิด 16 ข้อ |
| [backlog.md](backlog.md) | งานที่ทำทีหลัง (append-only) | BL-001..006 |
| `db\` | SQL DDL/rollback (`schoolbot_db.sql`, `schoolbot_db_rollback.sql`) + `pii-inventory-001.md` — ผลรีวิวรายรอบของ vault อยู่ใน memory | ร่าง Rev7 · ผู้ใช้รัน DDL แล้วและนับได้ 32 ตาราง · ยังไม่ตรวจ schema parity, transaction และการต่อ API |
| `design\source-review-001..005.md` | หลักฐาน as-built จากการตรวจ source จริง | 001 บทเรียน/3 โหมด · 002 account/profile/tenant · 003 Course Plan Sheet · 004 PGGradeDB · 005 score writer นอก workspace (BLOCKED) |
