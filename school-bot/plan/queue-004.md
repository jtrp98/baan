# คิวปัจจุบัน — Queue 004
วันที่ 2026-10-26 · gm · ใบงาน065 · ต่อ [task-062](../planning/task-062.md)

## Precedence และสถานะ
ใช้ไฟล์นี้เหนือ queue-003/dispatch/first_wave และ runner เดิมทุกฉบับ; คงประวัติไว้ ไม่เรียก plan มา replan. t0/t1/t2=codex, t3/t4/t5=agy, `--no-fallback`; ไม่ใช้ native subagent แทน runner.

ฐานปัจจุบัน: 44 REQ/185 AC/80 TP cases/110 tasks/15 verified/95 pending/8 phases/17 gates. นับ REQ/AC จาก requirement/index, tasks/phases/gates จาก tasks-001.json และ verified 11+4 จาก index หลัก/extension เทียบ verdict ที่ task-061 และ check-061-verdicts-001. JSON ยัง pending110 จนผู้คุม apply status_sync15; ไม่เพิ่ม verdict. canonical status ไม่ใช่เปอร์เซ็นต์โค้ดหรือผลปิด gate; 207 person-days เป็นสมมติฐานเดิม.

## Waiting on Human
- G/Light/infra/B/BFF: รับรองและตอบ H5 ตาม [owner packet](owner-packet-001.md); contract ยัง PROPOSED, fullLogin NOT_READY.
- ผู้ใช้: forward [DB cover](../db/db-safe-evidence-cover-001.md); เจ้าของ DB ส่ง EV-01..03→04/05→06 optional ตามชุดเดิม. ยังไม่มีหลักฐานว่าส่ง/ได้รับแล้ว.
- UX signed 5/7 ตาม decisions-036..041; UX-005/007 รอร่าง→check→ผู้ใช้เซ็น. int-006/007 กำลังร่างในรอบ062 ไม่อ้างว่าตรวจผ่านหรือเซ็นแล้ว.
- spec Q3 รุ่นหุ่น/firmware/calibration/stop-unplug-emergency, ผู้ถือ cert/ช่องทางแจกจ่าย และ security/SQL/runtime gates ยังรอคน; หุ่นจริงยังไม่อนุญาตตาม038.

## คิวที่ทำได้ในรอบเอกสาร
| ลำดับ | งาน/ผู้รับผ่านผู้คุม | หลักฐานและเงื่อนไข |
|---|---|---|
| 1 | UX-005, UX-007 — int/t2/codex | BA-002 และ SA-002 verified แล้ว; ร่างได้ทันที ตามใบงาน063/064; ไม่สร้างร่างซ้ำถ้ารับ output แล้ว |
| 2 | check/t2/codex | หลังรับร่างจริง ตรวจ AC/contract แยกสองงาน; ส่ง verdict พร้อม revision ที่ตรวจ |
| 3 | ผู้ใช้ | เซ็นเฉพาะฉบับผ่าน check; การเซ็นไม่เกิดจาก packet หรือ verdict |
| ขนาน | owner packet — ผู้ใช้ส่งถึงเจ้าของ | เอกสารพร้อมส่งแล้ว; ระหว่างรอ เดินเฉพาะสายที่ไม่พึ่งคำตอบ |

## Artifact ที่ครบแล้ว — ไม่สั่งเตรียมซ้ำ
รอบ055/056→057→058 มี routing-linkage-evidence-002, Gateway Rev4/gRPC Rev1 §7 และ h5-questionnaire-001 ครบสำหรับขอ owner review. รอบ060 มี packs Guest/content/hardware/delivery, สัญญา GAP/SEC, DB safe-evidence+cover และ TP-002 fixture plan. รอบ061 มี SA-004 export proof pack, TP-003 fixture plan, DBA-007 runtime evidence pack และ UX signed int-001..005. อ้าง index แต่ละหมวด; ความครบของเอกสารไม่ใช่ผลรัน. TP-002 ยัง pending เพราะไม่มี harness; ไม่เปิดงานเขียน harness ในรอบ docs-only นี้.

## ลำดับหลังคำตอบครบ
G/Light รับรอง + H5 ownership/technical proof → owner ตรึง contract ที่เกี่ยวข้อง → B เป็นเจ้าของ .proto/sync G พร้อม parser/codegen/hash → implementation เฉพาะส่วน prerequisite ครบ → integration จริง/หลักฐาน DB ตามลำดับ. Login ต้องมี selector/cardinality/account-profile linkage และ continuation/attempt/device-proof; ห้ามข้ามไปต่อ caller.

DBA-002 ยังรอ SA-001/BE-001 แม้ DBA-001 verified; SQL/rollback/catalog ต้องคน review/run ก่อน DBA-003→BE-002 และสายที่พึ่งพา. FE รอทั้ง signed UX ของตนและ backend/DAG/gates: FE-019/020 รอ UX-005, FE-021/022 รอ UX-007; UX อื่น signed แล้วไม่ปลด backend dependencies. เนื้อหาจริง BA-005/006 ยังต้อง G-LEARN/อนุมัติ revision; Arm รอหลักฐานกายภาพที่เกี่ยวข้อง.

ไม่ใช้ 4032 local/static tests แทน Gateway/gRPC/DB integration; 80 TP actual ยัง NOT_RUN. ไม่ปิด H5/G-CORE/UX gate หรือ security findings อัตโนมัติ. ก่อน release gm รวม SQL/rollback/deploy order/ผู้รันเป็น runbook ภายใต้ PM-001 หลังได้ชิ้นส่วนจริง; packet นี้ไม่ใช่คำสั่ง deploy.

## Backlog และส่งต่อ
ไม่เพิ่ม BL/task/scope; BL-001 คงประวัติงานเอกสารที่มี artifact แล้ว, BL-002..004 ส่งเจ้าของระบบภายนอกตามเดิม ไม่เปิดแก้ซ้ำใน SchoolBot. ส่งนายช่างตรวจ delta/บันทึกเอกสาร แล้วรับร่าง UX และคำตอบเจ้าของ; role นี้ไม่ dispatch ต่อเอง.

## Change Log
- 2026-10-26 — ใบงาน065: sync ยอด/verdict/runner และคิวจริง; คง IDs/DAG/effort/owner/tier/gate definitions และ frozen scope.
