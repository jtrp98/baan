# school-bot — Module Index

> สารบัญ + สถานะปัจจุบันของโมดูล — เขียนทับให้เป็นความจริงวันนี้ ไม่มี Change Log (ประวัติดู `git log` ของไฟล์นี้)
> วิธีอ่าน: อ่าน index ของหมวดที่ brief ชี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด

## สถานะปัจจุบัน (2026-10-26)

- **แผน**: 110 tasks — 15 verified (งานเอกสารทั้งหมด) / 95 pending · 8 phases / 17 gates · 44 REQ / 186 AC / 81 TP cases — ดู [plan/index.md](plan/index.md)
- **คิว**: กำลังเดิน CONTINUE-NORMAL [ใบงาน091](planning/task-091.md) ต่อ090 ตาม [Queue 007](plan/queue-007.md) (21localready/5partial/37waitingจาก63tasks); [ใบงาน092](planning/task-092.md) rework3ตาม[มติ049](requirement/decisions-049.md): B gRPC [checkอิสระPASS2234/0](planning/check-092-grpc-r3-001.md) รอJPO / G เหลือ1/96 กำลังแก้รอบเล็ก (SEC001-016ยังOPEN); Localoverlay63pass26fail1skip; [archpacketพร้อม](design/local-project-boundary-001.md)GoR1DONEรอcheck; [Entry66PASS/shellclosecauseFAIL](planning/check-091-front-entry-001.md)กำลังFrontR1; checkGo/checkBackendขนานFrontR1close-reasonไม่เกิน3
- **โค้ด**: AuthPASS45; [Mathหลังแก้PASS70+9](planning/check-090-math-r1-001.md) ownerlabelpatchติดตั้งแล้ว[parent4147ผ่าน](planning/slice-090-grpc-math-parent-001.md); [Localprojects](planning/slice-089-local-projects-001.md) parentoverlay63pass26fail1skip; archpacketพร้อม/[GoR1parentregressionผ่าน](planning/slice-091-local-projects-r1-001.md)รอcheckGo/[fuelRun-onlyชัดแล้ว](planning/spec-090-draft-fuel-001.md); [Bcheckรอบ1](planning/check-089-grpc-r1-001.md) เดิมFAIL119/150; parent150ผ่านแต่[finalcheckFAIL2222/12/8](planning/check-090-grpc-r2-001.md)หลัง2reworks; [GhelperPASS](planning/check-089-gateway-r1-001.md)433/433; [Gtypedcheck](planning/check-089-gateway-typed-001.md) เดิมFAIL258/260; [fix parent3/3](planning/slice-090-gateway-r1-001.md)[JPOพบlogleak](planning/jpo-090-gateway-r1-001.md)[parent5/5หลังrework2](planning/slice-091-gateway-r2-001.md)แต่[JPO2FAIL81/15](planning/jpo-091-gateway-r2-001.md)ครบ2reworks. [BE003/028helpersparent4147ผ่าน](planning/slice-091-pure-backend-001.md)รอcheck; FullGbuildติดpackages; ยังไม่เปิดgRPCproduction/fullLogin/DBintegration
- **ฐานข้อมูล**: ผู้ใช้รัน `schoolbot_db.sql` แล้ว ([บันทึก045](requirement/decisions-045.md)); [เชื่อมต่อจริงสำเร็จ](db/connection-001.md) จาก `web/.env`: SELECT 1 ผ่าน พบ public SchoolBot* 32 ตาราง (PostgreSQL 15.19); ยังไม่ตรวจ schema parity/revision และ API integration
- **transport**: [Gateway Rev4](design/gateway-integration-001.md) + [gRPC contract Rev1](design/gateway-grpc-contract-001.md) — client→HTTP Gateway→gRPC SchoolBot · ผู้ใช้อนุญาต dev บน branch ที่เตรียมไว้ตาม [046](requirement/decisions-046.md); implementation review/H5/runtime ยังต้องพิสูจน์
- **License**: create-license replay 15 นาทีอนุมัติแล้วตาม [046](requirement/decisions-046.md); ผู้ใช้พักเรื่อง signer/custody ตาม [047](requirement/decisions-047.md) เก็บค้างก่อนใช้กุญแจจริง งานส่วนที่ไม่พึ่งกุญแจเดินต่อได้
- **UX**: เซ็นครบ 7/7 ชุดตาม [decisions-043](requirement/decisions-043.md); UX-005 Q39–Q42 และ UX-007 Q43–Q46 รวม delta042 อนุมัติแล้ว
- **สัญญาที่ UX ต้องใช้**: [gap receipt 7 กลุ่ม](design/learning-ux-contract-gaps-001.md) — [localcontracts091พร้อม](planning/arch-091-learning-001.md); approval/provenancestorageproposal/ownerproofยังOPEN · มติ [decisions-042](requirement/decisions-042.md) (ตอบ A: หมดเวลาตรวจคำตอบที่บันทึกทันอัตโนมัติ) ห้ามถามซ้ำ
- **รอคน**: ดู [plan/index.md § Waiting on Human](plan/index.md#waiting-on-human)
- **กติกา runner จากผู้ใช้**: t0–t2 ใช้ Codex · t3–t5 ใช้ AGY · ไม่ fallback ข้าม runner

## Documents

| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `requirement\index.md` | สารบัญ requirement — ตาราง REQ + สถานะ + AC + decisions registry | 44 REQ (REQ-009..052) / 186 AC — DRAFT · decisions-001..050 |
| `requirement\scope.md` | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม |
| `design\index.md` | สารบัญ design — feasibility + ตาราง DES + ไฟล์สัญญา | data-model Rev8 / rules Rev10 / DBML Rev7 (32 ตาราง); constraints เหลือเฉพาะ PK32 ตามใบงาน086; DES-001..012 PROPOSED |
| `plan\index.md` | release scope, Waiting on Human, phases, ตาราง Tasks + [extension](plan/extension/index.md) | 110 tasks: 15 verified / 95 pending |
| `open-questions\index.md` | สารบัญ OQ ทั้งหมด | 12 OQ (OQ-006..017): 3 PARTIAL / 9 CLOSED |
| [test-plan/index.md](test-plan/index.md) | สารบัญ test plan | 81 cases / 186 AC (Amendment004); traceability/joined JSON ยังเป็นชุด 180/77; actual ทุกเคส NOT_RUN |
| [qa/index.md](qa/index.md) | สารบัญ QA findings | GhelperPASS433/AuthPASS45/MathPASS70+9; BgRPC rework3 checkPASS2234/0 ([check092](planning/check-092-grpc-r3-001.md)); GtypedFAIL258/260→rework1/jpo; Localprojectsรอcheck; PG/fullLogin NOT_RUN |
| [uxui/index.md](uxui/index.md) | สารบัญ/เอกสาร UX/UI | เซ็นครบ 7/7 รวม delta042 (decisions-043) |
| [security.md](security.md) | ผลตรวจความปลอดภัย | Important7/Medium6/Minor3OPEN; [JPO2](planning/jpo-091-gateway-r2-001.md)16OPEN/17CLOSEDlocalfix; Importantเดิม6คงOPEN |
| [backlog.md](backlog.md) | งานที่ทำทีหลัง (append-only) | BL-001..004 |
| `db\` | SQL DDL/rollback + review (`review-001..007.md`, `schoolbot_db.sql`) | ร่างRev7; ผู้ใช้รันDDLแล้ว/directconnectionและนับ32ตารางผ่าน; schema parity/transaction/APIintegrationยังไม่ตรวจ |
| `planning\` | ใบงาน (task-NNN), handoff, หลักฐานรายรอบ — บันทึกประวัติ ไม่ใช่สถานะ | ล่าสุด: [ใบงาน091](planning/task-091.md) — GoR1/Frontlocalchecks/corequeueต่อจาก090 |
| `design\source-review-001..005.md` | หลักฐาน as-built จากการตรวจ source จริง | 001 บทเรียน/3 โหมด · 002 account/profile/tenant · 003 Course Plan Sheet · 004 PGGradeDB · 005 score writer นอก workspace (BLOCKED) |
