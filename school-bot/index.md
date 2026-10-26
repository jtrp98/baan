# school-bot — Module Index

> สารบัญ + สถานะปัจจุบันของโมดูล — เขียนทับให้เป็นความจริงวันนี้ ไม่มี Change Log (ประวัติดู `git log` ของไฟล์นี้)
> วิธีอ่าน: อ่าน index ของหมวดที่ brief ชี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด

## สถานะปัจจุบัน (2026-10-26)

- **แผน**: 110 tasks — 15 verified (งานเอกสารทั้งหมด) / 95 pending · 8 phases / 17 gates · 44 REQ / 186 AC / 81 TP cases — ดู [plan/index.md](plan/index.md)
- **คิว**: [Queue 004](plan/queue-004.md) + [ชุดส่งต่อเจ้าของ Gateway/DB](plan/owner-packet-001.md) · รอบล่าสุดปิดที่ [handoff-003](planning/handoff-003.md)
- **โค้ด**: logout API + Gateway outcome decoder ใน `target/school-bot/web` — test local 4032 ผ่าน ([qa/round-001](qa/round-001.md)); PG/fullLogin NOT_RUN และยังไม่ต่อ Gateway/gRPC จริง
- **transport**: [Gateway Rev4](design/gateway-integration-001.md) + [gRPC contract Rev1](design/gateway-grpc-contract-001.md) — client→HTTP Gateway→gRPC SchoolBot · PROPOSED รอ G/Light รับรองข้อยกเว้น opaque-session/mapper และ H5
- **UX**: เซ็นครบ 7/7 ชุดตาม [decisions-043](requirement/decisions-043.md); UX-005 Q39–Q42 และ UX-007 Q43–Q46 รวม delta042 อนุมัติแล้ว
- **สัญญาที่ UX ต้องใช้**: [gap receipt 7 กลุ่ม](design/learning-ux-contract-gaps-001.md) — technical proof ยัง OPEN · มติ [decisions-042](requirement/decisions-042.md) (ตอบ A: หมดเวลาตรวจคำตอบที่บันทึกทันอัตโนมัติ) ห้ามถามซ้ำ
- **รอคน**: ดู [plan/index.md § Waiting on Human](plan/index.md#waiting-on-human)
- **กติกา runner จากผู้ใช้**: t0–t2 ใช้ Codex · t3–t5 ใช้ AGY · ไม่ fallback ข้าม runner

## Documents

| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `requirement\index.md` | สารบัญ requirement — ตาราง REQ + สถานะ + AC + decisions registry | 44 REQ (REQ-009..052) / 186 AC — DRAFT · decisions-001..044 |
| `requirement\scope.md` | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม |
| `design\index.md` | สารบัญ design — feasibility + ตาราง DES + ไฟล์สัญญา | data-model Rev8 / rules Rev10 / DBML Rev7 (32 ตาราง); constraints เหลือเฉพาะ PK32 ตามใบงาน086; DES-001..012 PROPOSED |
| `plan\index.md` | release scope, Waiting on Human, phases, ตาราง Tasks + [extension](plan/extension/index.md) | 110 tasks: 15 verified / 95 pending |
| `open-questions\index.md` | สารบัญ OQ ทั้งหมด | 12 OQ (OQ-006..017): 3 PARTIAL / 9 CLOSED |
| [test-plan/index.md](test-plan/index.md) | สารบัญ test plan | 81 cases / 186 AC (Amendment004); traceability/joined JSON ยังเป็นชุด 180/77; actual ทุกเคส NOT_RUN |
| [qa/index.md](qa/index.md) | สารบัญ QA findings | round001 PASS local logout/component; PG/fullLogin NOT_RUN |
| [uxui/index.md](uxui/index.md) | สารบัญ/เอกสาร UX/UI | เซ็นครบ 7/7 รวม delta042 (decisions-043) |
| [security.md](security.md) | ผลตรวจความปลอดภัย | static review: Important 6 / Medium 6 / Minor 3 OPEN; SEC001-003/009 mitigation ระดับแบบ; ยังไม่มี re-audit runtime |
| [backlog.md](backlog.md) | งานที่ทำทีหลัง (append-only) | BL-001..004 |
| `db\` | SQL DDL/rollback + review (`review-001..007.md`, `schoolbot_db.sql`) | DRAFT Rev7 (32 ตาราง; PK32/UQ0/FK0/CHECK0; ยังไม่รัน) |
| `planning\` | ใบงาน (task-NNN), handoff, หลักฐานรายรอบ — บันทึกประวัติ ไม่ใช่สถานะ | ล่าสุด: [handoff-003](planning/handoff-003.md) · ประวัติเก่า: [history-001](planning/history-001.md), [history-002](planning/history-002.md) |
| `design\source-review-001..005.md` | หลักฐาน as-built จากการตรวจ source จริง | 001 บทเรียน/3 โหมด · 002 account/profile/tenant · 003 Course Plan Sheet · 004 PGGradeDB · 005 score writer นอก workspace (BLOCKED) |
