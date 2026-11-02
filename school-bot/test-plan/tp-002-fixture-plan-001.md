# TP-002 — แผน failure/race fixtures — Rev2

วันที่ 2026-10-29 · inspect · สถานะเอกสารอยู่ที่ [index](index.md)
อ้างอิง: TP-002 Oracle pack (memory: plan/TP-002.md) · [DES-001 Rev1](../design/des-001.md) · [TP-001](tp-001.md) เฉพาะ TP001-003/010/037/040/045/058/079. เอกสารนี้เป็นแผนเตรียม fixtures ไม่ใช่ harness ที่เขียนแล้วหรือผล QA

## หลักการกลาง

- จำลองด้วย fake เท่านั้น: fake clock (wall+monotonic+anchor), fake engine transport (scripted JSON Lines), stub G proxy (drop/delay/replay), synthetic School DB resolver, in-memory transactional fake repository (ไม่เชื่อม DB จริง)
- **ห้าม**: set system clock ของเครื่องจริง · สั่งหุ่นจริงทุกชนิด (ไม่ HID/Serial จริง, ไม่ motion/upload/torque/stop ลง hardware — dry-run/fake bridge เท่านั้น) · เชื่อม/รัน SQL บน DB จริงทุกชนิด · ใช้ sample/preview/mock เป็นหลักฐาน native/Cloud/hardware
- timer sweep 60 วินาทีและ poll 3000 ms/debounce 0 ต้องติดป้าย (สมมติฐาน — ยังไม่ยืนยัน) ใน expected; TTL 15 นาทีอนุมัติแล้วตาม decisions-046
- ทุก fixture ระบุ build/commit hash + profile + evidence code ตาม TP-001; ผลทุกเคสเริ่ม NOT_RUN


## ส่วนต่อ fixtures

| รายละเอียด | กลุ่ม / ขอบเขต |
| --- | --- |
| [Clock](tp-002-fixture-clock-001.md) | FX-01a–e / FX-02a–d: 3 วัน, ย้ายเครื่อง, 30 วัน, rollback/restart |
| [Bridge](tp-002-fixture-bridge-001.md) | FX-03a–e: late callback/timer, drain/stop, partial write/transport error |
| [API](tp-002-fixture-api-001.md) | FX-04a–e / FX-05a–c: import lost response/DB failure, tenant/teacher authority |

## Traceability ของ Oracle pack

ครบ 6/6 AC มี setup/trigger/สิ่งที่วัดในส่วนต่อ; ทุก runtime actual=NOT_RUN. expected เป็นสิ่งที่ check ต้องวัด ไม่ใช่ผลรอบนี้

| AC / reference | Fixture → TP case / ระดับ | Expected ที่ต้องวัด | Actual ของ deliverable / ข้อจำกัด |
| --- | --- | --- | --- |
| [AC-021-02 / BR-021-02](../requirement/req-021.md) · DES-001 Rev1 lifecycle | FX-03a/e → TP001-037, TP001-040 เฉพาะ stale generation / integration fake | หลัง stop ปล่อย callback/timer เก่าแล้ว next movement=0; drain/reap ก่อน stop | ครบในแผน; NOT_RUN; ไม่พิสูจน์ physical stop |
| [AC-024-02 / BR-024-02](../requirement/req-024.md) · TP001-040 | FX-03d → TP001-040 / integration fake; TP001-045 / manual รอคน | error ระหว่างส่งท่าแสดงต่อผู้ใช้; ท่าเดิม dispatch=1 ไม่มี auto retry | ครบในแผน; NOT_RUN; fake ไม่ปิด TP001-045/E-HW |
| [AC-034-03 / BR-034-03](../requirement/req-034.md) · DES-001 gate | FX-01a/d → TP001-003 / unit clock + integration fake | exp−1s เข้าได้; restart ไม่เลื่อน checked_at/exp | ครบในแผน; NOT_RUN; fake credential/clock |
| [AC-034-04 / BR-034-04/05](../requirement/req-034.md) · DES-001 expiry | FX-01a/d + FX-03a → TP001-003 / unit + integration fake | exp/exp+1s+network fail ล็อกและแจ้งต่ออินเทอร์เน็ต; stale timer ไม่ dispatch | ครบในแผน; NOT_RUN; online/DB จริงยังไม่ตรวจ |
| [AC-035-05 / BR-035-04/05](../requirement/req-035.md) · TP001-010 | FX-01e → TP001-010 / unit + integration fake | ย้าย A→B แล้ว A offline ใช้ก่อน E ได้ ที่/หลัง E ไม่ได้; E เดิมไม่เลื่อน | ครบในแผน; NOT_RUN; binding server เป็น stub |
| [AC-039-05 / BR-039-02](../requirement/req-039.md) · TP001-058/079 | FX-05a/b/c → TP001-058, TP001-079 / domain + integration fake | นอก assignment/ต่างโรงเรียน/รู้ ID ไม่เห็นรายชื่อหรือผล; positive control อ่านได้; resolver ล่ม fail closed | ครบในแผน; NOT_RUN; roster/history resolver จริงรอ proof |

## เกณฑ์สนับสนุนและเส้นแบ่ง

- late callback/drain → FX-03a/e; transport/partial write → FX-03d; DB fail ก่อน commit → FX-04e; response หายหลัง commit → FX-04a. ต้องแยกสองจุดเพื่อไม่อ้างว่าหายหลัง commit คือ rollback
- 3 วัน+clock rollback → FX-01a/d/e; clock 30 วัน+restart/race → FX-02a–d. FX-01b/c, FX-02 และ FX-04 เป็น fixtures สนับสนุนเดิม; ไม่เพิ่ม AC นอก pack เป็นเงื่อนไขตรวจรับ
- TP001-045 ใช้ fake ซ้อม logic เท่านั้น; unplug/replug/stop latency/การเคลื่อนจริงอยู่ PF-HW ภายใต้ G-HW ไม่มีคำสั่งถึงหุ่นจาก fixtures นี้
- export parity/coexistence/grade crash/worker lease อยู่ [TP-003](tp-003-grade-fixture-plan-001.md) ทั้งหมด; TP-002 ทดสอบ Project import/License clock ไม่เขียนคะแนน

## ข้อรอคนและข้อจำกัด

ไม่มีคำตอบจากคนที่ต้องใช้ก่อนส่งแผน fake ชุดนี้; ยังไม่มีการยอมรับความเสี่ยงหรือปิด gate

| Task / Reference | คำถาม / ผู้ตัดสิน | งานที่จะปลดล็อก / ทางจำลองก่อนนั้น |
| --- | --- | --- |
| QA หุ่น / TP001-045, G-HW | รุ่น/firmware/calibration/วิธี stop-unplug-emergency และอนุญาตทดสอบอะไรบ้าง? ผู้ใช้/ผู้รับรอง hardware | manual E-HW; ระหว่างรอใช้ FX-03 ไม่แทนผลจริง |
| Authority runtime / TP001-058/079 | หลักฐาน resolver roster/status/move/term/tenant alias ที่เจ้าของรับรองอยู่ที่ใด? เจ้าของ School DB ผ่าน legacy/sys | ต่อข้อมูลจริง; ระหว่างรอ FX-05 scripted resolver ไม่เดา history |
| API/DB integration / prerequisites ใน test-plan index | mapping/proto/error และหลักฐาน DB runtime พร้อมให้ check ใช้หรือยัง? arch/sys/G/Light และเจ้าของ DB | integration จริง; ระหว่างรอ boundary stub/transactional fake ไม่รัน SQL |

## สิ่งส่งต่อให้ check

ส่ง check สร้าง harness/tests ตามส่วนต่อ เลือก unit ก่อน integration. แต่ละ run บันทึก fixture ID/variation/TP case/AC, source+contract revision, profile, seed/hash, fault point, event order และ expected/actual แยกราย AC. เก็บ raw trace/JSON/stdout/stderr ใน reports ของ runner; knowledge เก็บสรุป+run-folder pointer

ใช้ข้อมูลสมมติทั้งหมด; redact token/key/secret ก่อนเก็บหลักฐาน; fake signing/identity ติดป้าย test-only. ค่า sweep 60 วินาทีและ poll 3000 ms/debounce 0 ยังเป็นสมมติฐาน ไม่ใช่เกณฑ์ physical SLA.

## การตรวจเอกสาร 2026-10-29

ตรวจ PowerShell แบบ static: AC rows 6/6, fixture rows 22/22, local file links 19/19; ทุกไฟล์ไม่เกิน 10 KiB. git diff --check ผ่าน (exit 0). ไม่รัน harness/tests/SQL/หุ่น; runtime NOT_RUN

## Change Log
- 2026-10-29 — Rev2 ใบงาน093: เติม FX-01d/e, FX-03d/e, FX-04e และ setup/trigger/สิ่งที่วัด; traceability ครบ 6 AC/7 TP cases; แยกส่วนต่อควบคุมขนาด คง IDs เดิม; fake เท่านั้น ไม่เขียน tests/ไม่รัน DB หรือหุ่น
- 2026-10-24 — Rev1: สร้างแผน failure/race fixtures ตามใบงาน060e (fake clock/monotonic, trash 30 วัน/rollback/ปิดแอป, late callback/drain-stop, lost response/receipt/tombstone, cross-tenant GAP-06); docs-only ไม่มีการรัน
- 2026-10-24 — แก้ตาม check 060f (นายช่างสวมบท inspect): FX-01b ปรับเป็น fixture TTL=900s และทดสอบรอบ ReplayUntil (ไม่ใช่ offset จาก CompletedAt)

- 2026-10-26 — แก้ป้าย create-license TTL 15 นาทีตาม decisions-046 (แก้ตาม sweep); ไม่เปลี่ยน logic/ผลทดสอบ/สมมติฐานอื่น
