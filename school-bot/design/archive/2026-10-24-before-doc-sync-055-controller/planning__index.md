# SchoolBot — Planner proposal

## สถานะ

ADOPTED_BY_PM — PM รับเป็น [แผนหลัก](../plan/index.md) แล้ว เก็บหมวดนี้เป็นข้อเสนอเดิม หลักฐานการรับช่วง และเอกสาร run/ประวัติเก่าของโมดูล (ย้ายมาจาก root วันที่ 2026-10-22 ตามการปรับโครงสร้างให้เข้ามาตรฐาน baan)

74 tasks / 8 phases / 17 gates ครบ 31 REQ / 109 AC; effort 136 person-days เป็นสมมติฐาน ไม่ใช่กำหนดส่ง

- [ข้อเสนอเดิม](proposal-001.md)
- [tasks และ gates](tasks-001.json)
- [ผลตรวจและประเด็นส่ง PM](review-001.md)
- [brief ที่เปิดงาน](task-003.md)
- [PM adoption/render contract](pm-response-001.json)
- [ผลตรวจหลังบันทึกแผน PM](pm-review-001.md)
- [ใบงานเปิด PM](task-004.md)

## เอกสาร run และประวัติเก่า (ย้ายมาจาก root 2026-10-22)

- ใบงาน run หลัก: [task.md](task.md) · ต่อเนื่อง [task-history-001.md](task-history-001.md)
- ใบงานย่อยรายรอบ: [task-002](task-002.md) · [task-003](task-003.md) · [task-004](task-004.md) · [task-005](task-005.md) · [task-006](task-006.md) · [task-007](task-007.md) · [task-008](task-008.md)
- ประวัติ knowledge ก่อนหน้า: [ชุด 1](history-001.md) · [ชุด 2](history-002.md)

## Phases

| Phase | Tasks | Effort รวม | รายละเอียด |
|---|---:|---:|---|
| P0 — ฐานและข้อเสนอปิด gate | 13 | 23 | [ส่วน 1](phase-p0-001.md) |
| P1 — DB integration | 3 | 5 | [ส่วน 1](phase-p1-001.md) |
| P2 — License | 5 | 9 | [ส่วน 1](phase-p2-001.md) |
| P3 — Login และหลายโครงงาน | 13 | 24 | [ส่วน 1](phase-p3-001.md) |
| P4 — สาม Labs และ native transport | 14 | 27 | [ส่วน 1](phase-p4-001.md) |
| P5 — หลักสูตรและผลเรียนจริง | 13 | 25 | [ส่วน 1](phase-p5-001.md) |
| P6 — แพ็กเกจและตรวจรับ | 11 | 21 | [ส่วน 1](phase-p6-001.md) |
| P7 — ส่งมอบระบบเต็ม | 2 | 2 | [ส่วน 1](phase-p7-001.md) |

## งานแรกพร้อมให้ PM จัดคิว

- SA-001: จัด contracts/backend boundaries (sa/t1)
- BE-001: ตรวจ legacy auth จาก source เดิม (be/t3)
- DBA-001: เสนอ physical placement/constraints (dba/t2)
- BA-001: เตรียมคำตัดสิน Guest (ba/t2)
- BA-002: เตรียม criteria/scope ครู (ba/t2)
- BA-003: เตรียมเกณฑ์หุ่นจริง (ba/t2)
- BA-004: เตรียมเกณฑ์ส่งมอบ (ba/t2)
- UX-001: ออกแบบ entry/shell ตามระบบเดิม (ux/t2)
- UX-003: ทบทวน UX สาม Labs (ux/t2)
- TP-001: จัด traceability/test matrix (tp/t2)
- SEC-001: ทบทวน threat/trust (sec/t2)
- SA-003: เตรียม Host/robot contract review (sa/t1)

## หลักฐาน

เปิดจริงผ่าน mycelium-role planner/t2 แบบ read-only, timeout 1800s; report: C:/src/AICode/baan/baan/reports/2026-10-21-12-05-17-planner-tier-t2-1agents-BsBOdk

PM รับแล้วผ่าน mycelium-role pm/t2 แบบ read-only; report: C:/src/AICode/baan/baan/reports/2026-10-21-12-30-00-pm-tier-t2-1agents-5vaCrZ ผล state NEEDS_HUMAN เพราะ downstream gates ยังไม่มีหลักฐานปิด แต่แผนพร้อมบันทึกครบ หมวดนี้ยังเป็น proposal history ใช้ plan/ สำหรับงานต่อ ไม่เปิด execution อัตโนมัติจาก JSON เดิม

## Change Log

- 2026-10-22 — ย้ายเอกสาร run/ประวัติเก่าจาก root ของโมดูลเข้าหมวดนี้ (task.md, task-002..008, task-history-001, history-001/002) พร้อมแก้ลิงก์ที่ชี้ path เดิม — การปรับโครงสร้างตามมาตรฐาน baan โดยนายช่าง
- 2026-10-21 — บันทึก PM acceptance และชี้ไป canonical plan โดยรักษา Planner artifacts เดิม
- 2026-10-21 — เก็บผล Planner พร้อมฉบับอ่านง่ายและการตรวจ ไม่เปิด implementation หรือสร้าง plan.md แทน PM

## รอบส่งต่อมติ — 2026-10-23

- [handoff-001.md](handoff-001.md) — ผล spec/vault/arch/gm และคิวถัดไป 44 REQ/180 AC/110 งาน
- [spec-review-001.md](spec-review-001.md) / [spec-response-001.json](spec-response-001.json) — REQ/AC ตาม decisions-032..034
- [arch-review-001.md](arch-review-001.md) / [arch-response-001.json](arch-response-001.json) — DES/JSON/invariants และผล DBML หลังบันทึก
- [gm-review-001.md](gm-review-001.md) / [gm-response-001.json](gm-response-001.json) / [gm-response-002.json](gm-response-002.json) — เจ้าของแผนรับร่างและ correction
- [vault-response-001.json](vault-response-001.json) — SQL static findings ส่ง arch; บันทึกหลักที่ ../db/review-006.md
- [gm-recovery-001.json](gm-recovery-001.json) — ร่าง workproduct ที่กู้หลัง timeout และ gm ยืนยัน SHA256 ก่อนบันทึก
- ใบงานต่อเนื่อง task-011.md..task-016.md เป็นประวัติ run นี้ ไม่ใช่การเปลี่ยนสถานะ task ใน canonical plan

### Change Log รอบส่งต่อ

- 2026-10-23 — นายช่างเชื่อมผลส่งต่อและคำรับรองเจ้าของแผนหลังบันทึกเอกสารครบ คง index/planner history เดิม
