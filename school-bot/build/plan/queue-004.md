# คิวปัจจุบัน — Queue 004
วันที่ 2026-10-26 · gm · ใบงาน065 · ต่อ [task-062](../../../../memory/school-bot/_cross/planning/task-062.md)

## Precedence และสถานะ
ใช้ไฟล์นี้เหนือ queue-003/dispatch/first_wave และ runner เดิมทุกฉบับ; คงประวัติไว้ ไม่เรียก plan มา replan. t0/t1/t2=codex, t3/t4/t5=agy, `--no-fallback`; ไม่ใช้ native subagent แทน runner.

ฐานปัจจุบัน: 44 REQ/186 AC/81 TP cases/110 tasks/15 verified/95 pending/8 phases/17 gates. นับ REQ/AC จาก requirement/index, tasks/phases/gates จาก tasks-001.json และ verified 11+4 จาก index หลัก/extension เทียบ verdict ที่ task-061 และ check-061-verdicts-001. JSON sync แล้วตาม [status-sync](../../../../memory/school-bot/_cross/planning/status-sync-062-001.json); ไม่เพิ่ม verdict. canonical status ไม่ใช่เปอร์เซ็นต์โค้ดหรือผลปิด gate; 207 person-days เป็นสมมติฐานเดิม.

## Waiting on Human
- G/Light/infra/B/BFF: รับรองและตอบ H5 ตาม [owner packet](owner-packet-001.md); contract ยัง PROPOSED, fullLogin NOT_READY.
- ผู้ใช้: forward [DB cover](../../../../memory/school-bot/_cross/db/db-safe-evidence-cover-001.md); เจ้าของ DB ส่ง EV-01..03→04/05→06 optional ตามชุดเดิม. ยังไม่มีหลักฐานว่าส่ง/ได้รับแล้ว.
- UX signed 7/7 ตาม [decisions-043](../../shared/decisions/decisions-043.md): Q39–Q46 รวม expired-copy delta042 อนุมัติแล้ว 2026-10-26; ไม่ถามซ้ำ. เจ้าของระบบ/DB และ technical proof ยังรอแยกตามเดิม
- spec Q3 รุ่นหุ่น/firmware/calibration/stop-unplug-emergency, ผู้ถือ cert/ช่องทางแจกจ่าย และ security/SQL/runtime gates ยังรอคน; หุ่นจริงยังไม่อนุญาตตาม038.

## คิวที่ทำได้ในรอบเอกสาร
| ลำดับ | งาน/ผู้รับผ่านผู้คุม | หลักฐานและเงื่อนไข |
|---|---|---|
| 1 | UX-005, UX-007 — ร่างเสร็จแล้ว | ร่างและ delta042 ครบตาม check073/080/082; ผู้ใช้เซ็นตาม decisions-043 ไม่ร่างซ้ำ |
| 2 | check/t2/codex — ตรวจเอกสารเสร็จแล้ว | check073/080/082 ตามขอบเขตเดิม; ยังไม่ใช่ runtime acceptance หรือ verdict ราย task ใหม่ |
| 3 | ผู้ใช้ — เสร็จแล้ว | อนุมัติ Q39–Q46 รวม delta042 ตาม decisions-043; UX signed 7/7 |
| ขนาน | owner packet — ผู้ใช้ส่งถึงเจ้าของ | เอกสารพร้อมส่งแล้ว; ระหว่างรอ เดินเฉพาะสายที่ไม่พึ่งคำตอบ |

## Artifact ที่ครบแล้ว — ไม่สั่งเตรียมซ้ำ
รอบ055/056→057→058 มี routing-linkage-evidence-002, Gateway Rev4/gRPC Rev1 §7 และ h5-questionnaire-001 ครบสำหรับขอ owner review. รอบ060 มี packs Guest/content/hardware/delivery, สัญญา GAP/SEC, DB safe-evidence+cover และ TP-002 fixture plan. รอบ061 มี SA-004 export proof pack, TP-003 fixture plan, DBA-007 runtime evidence pack และ UX signed int-001..005. อ้าง index แต่ละหมวด; ความครบของเอกสารไม่ใช่ผลรัน. TP-002 ยัง pending เพราะไม่มี harness; ไม่เปิดงานเขียน harness ในรอบ docs-only นี้.

## ช่องว่างที่รับแล้ว
- เทคนิค: [receipt071](../design/learning-ux-contract-gaps-001.md) LUX-01..07 ยัง OPEN; arch/sys ตรึงสัญญาก่อน FE แยกจาก owner/H5 เดิม.
- ธุรกิจ: [042](../../shared/decisions/decisions-042.md) ผู้ใช้ตอบ A แล้ว มี precedence เหนือ proposal072; [AC-046-07](../../modules/quiz/shared/requirements/req-046.md) และ [TP001-081](../test-plan/tp-001-amendment-004.md) บันทึกแล้ว ทุก actual NOT_RUN. ไม่ถาม A/B ซ้ำ ไม่ใช่ UX sign-off. DES/UX delta ตรวจแล้วและผู้ใช้เซ็นตาม decisions-043; technical proof และ gates อื่นคงรอเจ้าของ

## ลำดับหลังคำตอบครบ
G/Light รับรอง + H5 ownership/technical proof → owner ตรึง contract ที่เกี่ยวข้อง → B เป็นเจ้าของ .proto/sync G พร้อม parser/codegen/hash → implementation เฉพาะส่วน prerequisite ครบ → integration จริง/หลักฐาน DB ตามลำดับ. Login ต้องมี selector/cardinality/account-profile linkage และ continuation/attempt/device-proof; ห้ามข้ามไปต่อ caller.

DBA-002 ยังรอ SA-001/BE-001 แม้ DBA-001 verified; SQL/rollback/catalog ต้องคน review/run ก่อน DBA-003→BE-002 และสายที่พึ่งพา. FE รอทั้ง signed UX ของตนและ backend/DAG/gates: FE-019/020 มี UX-005 signed แล้ว และ FE-021/022 มี UX-007 signed แล้วตาม decisions-043; backend dependencies คงเดิม. เนื้อหาจริง BA-005/006 ยังต้อง G-LEARN/อนุมัติ revision; Arm รอหลักฐานกายภาพที่เกี่ยวข้อง.

ไม่ใช้ 4032 local/static tests แทน Gateway/gRPC/DB integration; 81 TP actual ยัง NOT_RUN; legacy Traceability/Joined/raw JSON คง snapshot180/77 อ่าน Amendment004 สำหรับ coverage186/81. UX sign-off มีหลักฐานจาก decisions-043; ไม่ปิด H5/G-CORE หรือ security findings อัตโนมัติ. ก่อน release gm รวม SQL/rollback/deploy order/ผู้รันเป็น runbook ภายใต้ PM-001 หลังได้ชิ้นส่วนจริง; packet นี้ไม่ใช่คำสั่ง deploy.

## Backlog และส่งต่อ
ไม่เพิ่ม BL/task/scope; BL-001 คงประวัติงานเอกสารที่มี artifact แล้ว, BL-002..004 ส่งเจ้าของระบบภายนอกตามเดิม ไม่เปิดแก้ซ้ำใน SchoolBot. ส่งนายช่างตรวจ delta/บันทึกเอกสาร อ้าง UX signed ตาม decisions-043 แล้วรับคำตอบเจ้าของ; role นี้ไม่ dispatch ต่อเอง.

## Change Log
- 2026-10-26 — 079: sync042/075/078; เอกสาร→check delta→เซ็นUX คงscope/status/gates.
- 2026-10-26 — 074: แทนคิวร่าง/JSONรอapply ของ065 ด้วยหลักฐาน062/066/070/split/071/072; ไม่มีผล073หรือ approval ใหม่.
- 2026-10-26 — ใบงาน065: sync ยอด/verdict/runner และคิวจริง; คง IDs/DAG/effort/owner/tier/gate definitions และ frozen scope.
- 2026-10-26 — ผู้คุมลง execution receipt: รับ076/077จริงแล้ว; แก้ข้อความรอรับที่ค้างจาก snapshotของrole โดยไม่เปลี่ยนสัญญา/QA/gates
- 2026-10-26 — ผู้คุมลงผลตรวจ080/082จริง: ข้อพบเอกสาร3จุดปิดแล้วตาม [check082](../../../../memory/school-bot/_cross/planning/check-082-expired-spot-001.md); ไม่ใช่human sign-off/runtime/gate closure

- 2026-10-26 — ใบงาน083: แก้สถานะเซ็นตามคำตอบผู้ใช้จริงใน decisions-043 (แก้ตาม sweep); คงแบบและข้อจำกัดทางเทคนิคเดิม
