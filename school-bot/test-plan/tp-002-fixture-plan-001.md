# TP-002 — แผน failure/race fixtures

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

อ้างอิง: [DES-001 (Desktop host และ IPC) Rev1](../design/des-001.md) · [TP-001](tp-001.md) เฉพาะ TP001-003/010/037/040/045/058/079. เอกสารนี้เป็นแผนเตรียม fixtures ไม่ใช่ harness ที่เขียนแล้วหรือผล QA

## หลักการกลาง

- จำลองด้วย fake เท่านั้น: fake clock (wall+monotonic+anchor), fake engine transport (scripted JSON Lines), stub Gateway proxy (drop/delay/replay), synthetic School DB resolver, in-memory transactional fake repository (ไม่เชื่อม DB จริง)
- **ห้าม**: set system clock ของเครื่องจริง · สั่งหุ่นจริงทุกชนิด (ไม่ HID/Serial จริง, ไม่ motion/upload/torque/stop ลง hardware — dry-run/fake bridge เท่านั้น) · เชื่อม/รัน SQL บน DB จริงทุกชนิด · ใช้ sample/preview/mock เป็นหลักฐาน native/Cloud/hardware
- ทุก fixture ระบุ build/commit hash + profile + evidence code ตาม TP-001; ผลทุกเคสเริ่ม NOT_RUN

## ส่วนต่อ fixtures

| รายละเอียด | กลุ่ม / ขอบเขต |
| --- | --- |
| [Clock](tp-002-fixture-clock-001.md) | FX-01a–e / FX-02a–d: 3 วัน, ย้ายเครื่อง, 30 วัน, rollback/restart |
| [Bridge](tp-002-fixture-bridge-001.md) | FX-03a–e: late callback/timer, drain/stop, partial write/transport error |
| [API](tp-002-fixture-api-001.md) | FX-04a–e / FX-05a–c: import lost response/DB failure, tenant/teacher authority |

[ตารางหก AC → fixture และระดับตรวจ](tp-002-fixture-plan-001-coverage.md)

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
| API/DB integration / prerequisites ใน test-plan index | mapping/proto/error และหลักฐาน DB runtime พร้อมให้ check ใช้หรือยัง? arch/sys/Gateway/Light และเจ้าของ DB | integration จริง; ระหว่างรอ boundary stub/transactional fake ไม่รัน SQL |

## สิ่งส่งต่อให้ check

ส่ง check สร้าง harness/tests ตามส่วนต่อ เลือก unit ก่อน integration. แต่ละ run บันทึก fixture ID/variation/TP case/AC, source+contract revision, profile, seed/hash, fault point, event order และ expected/actual แยกราย AC. เก็บ raw trace/JSON/stdout/stderr ใน reports ของ runner; knowledge เก็บสรุป+run-folder pointer

ใช้ข้อมูลสมมติทั้งหมด; redact token/key/secret ก่อนเก็บหลักฐาน; fake signing/identity ติดป้าย test-only. ค่า sweep 60 วินาทีและ poll 3000 ms/debounce 0 ยังเป็นสมมติฐาน ไม่ใช่เกณฑ์ physical SLA.

## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · IPC = Inter-Process Communication · HID = Human Interface Device · SLA = Service Level Agreement


## หลักฐาน

ผลตรวจเอกสารเดิม 2026-10-29 ด้วย PowerShell แบบ static: AC rows 6/6, fixture rows 22/22, local file links 19/19; ทุกไฟล์ไม่เกิน 10 KiB. git diff --check ผ่าน (exit 0). ไม่รัน harness/tests/SQL/หุ่น; runtime NOT_RUN

## ยังไม่ยืนยัน

timer sweep 60 วินาทีและ poll 3000 ms/debounce 0 ยังเป็นสมมติฐาน ต้องให้ arch/เจ้าของสัญญายืนยันก่อน runtime และระบุค่าสมมติฐานใน expected; ไม่ใช่เกณฑ์ physical SLA

## หลักฐานอ้างอิง

นิยามขอบเขตหก AC: plan/TP-002.md (memory)
