# DES-006 — แบบ fake transport และ simulator สำหรับ Labs

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (SA-003 — เตรียมการทดสอบโดยไม่มีหุ่นจริง)

ส่วนของ [ผลทบทวน Host/IPC/หุ่น](des-006-review.md) C7 เป็นข้อเสนอ **non-breaking** สำหรับ test harness ไม่ใช่ runtime backend ใหม่ BE-010 และ Labs ใช้ลำดับ/fixtures ด้านล่างทำงานแยกจากการทดสอบหุ่นจริงได้ตามมติ 053 ไม่มี implementation เพิ่มในใบงานนี้

## จุดเสียบที่ใช้ของเดิมได้

| ระดับ | Seam ที่มีใน source | สิ่งที่พิสูจน์ได้ / ข้อจำกัด |
|---|---|---|
| Labs adapter | Bridge {run(mode,action,data):Promise<{data?:unknown}>,cancel():Promise<void>} ที่ constructor ของ ZideTransport รับ | scheduling, stop join, lost, read conversion โดยไม่มี Wails/USB; ไม่พิสูจน์ Go/OS drain |
| Workspace | RobotApi fixture ให้ run/stop, deferred promise และ timer callbacks | stale callback, atomic read, no auto motion, exit guard; ไม่พิสูจน์ transport จริง |
| Host | manager.resolve/command hooks และ helper process ใน Go tests เดิม | registry/allowlist, matching, stdout/stderr bounds, timeout/cancel/reap/pipe drain; ต้องไม่มี process เปิดอุปกรณ์ |
| C++ protocol | dry-run ผ่าน handle_request/standalone JSONL | bounds/build commands/HID reports โดยไม่ exchange; dry-run ไม่ใช้ทดสอบ device.list เพราะ action นี้ทำ OS discovery แม้ไม่มี transport |
| Darwin adapter ในอนาคต | fake exchange/enumeration ใน test build ของ backend | command framing/partial-write/deadline/error mapping; จุดเสียบนี้ยังต้องทำ ไม่อ้างว่ามี Darwin fake backend แล้ว |

Browser preview ไม่ใช่ native robot simulator ครบชุด: runPreview รองรับ robot servo.set แบบ servo+angle และ robot.stop เท่านั้น, ZideTransport เมื่อ sample=true ปฏิเสธ native requests จึงใช้ dependency injection ใน tests แทนการเปิด preview แล้วอ้างว่าครอบ native

## สัญญา fixture ที่เสนอ

Harness เก็บ context แยกจาก engine envelope: provenance=fake, scenarioId:string, generation:integer, target:{transport,path}, virtualNowMs:number, events:array และ counters:{apiCalls,usbOpens,fileCopies,persistentGrades} ทุก counter ต้องเป็น 0 ตลอดกรณีจำลอง ไม่ใช้ fixture flag ขอสิทธิ์หรือเป็น production setting

แต่ละ event เก็บ ordinal:integer เพิ่มทีละหนึ่ง, virtualAtMs:number, operation:string, action?:string, requestId?:string, target?:{transport,path}, outcome?:string โดย optional หมายถึง event นั้นไม่มีข้อมูล เช่น cancel ยังไม่มี action ที่ dispatch ใช้ event order ตรวจลำดับ ไม่ใช้ sleep เป็นข้อพิสูจน์

FakeBridge.run ต้องบันทึก action/input ก่อนรอ deferred result และอนุญาตหนึ่ง active request ถ้าชน reject {code:"ENGINE_BUSY"}; engine/host failure reject coded error ตาม Bridge เดิม ไม่ resolve status:error ให้ adapter ที่คาดแต่ success หากทดสอบ client.run ให้ป้อน envelope เต็มที่ native stub ชั้นล่างแทน

Fake cancel จะแยก event cancel_requested จาก active_settled/drain_complete และคืน promise เมื่อ harness ปล่อยให้ drain จบเท่านั้น Stop ยังไม่ออกระหว่างสองเหตุการณ์นี้; Go helper ต้องพิสูจน์ process reap/pipe drain เพิ่มต่างหาก ไม่ถือว่า deferred promise จบเป็น OS proof

Fixture แบบ native-shaped ใช้ simulated:false ได้เฉพาะ dependency test ที่ต้องผ่าน probe guard; ต้องมี provenance=fake นอก envelope และป้ายจำลองในหน้าทดสอบ ห้ามใช้บนเส้นทาง production หรือเก็บเป็น measured telemetry/ผลเรียนจริง Dry-run response ใช้ simulated:true,delivery:"dry-run" ตาม engine เดิม

ตัวอย่าง input สมมติสำหรับ bounds test:

    {"protocol":"1.0","request_id":"sim-1","mode":"robot-control","action":"servo.set","data":{"transport":"dry-run","id":0,"pwm":1500,"time_ms":1000}}

ตัวอย่าง scripted stop: run(group.execute) ค้าง → stop สองครั้ง → cancel_requested → ยังไม่มี robot.stop → ปล่อย active_settled และ drain_complete → robot.stop หนึ่งครั้ง target เดิม → ถ้าขอ relock จึง servo.torque หนึ่งครั้ง → callback/timer เก่าถูกปล่อยแต่ไม่มี movement ใหม่

## กรณีทดสอบที่ต้องส่งต่อ

[ตาราง scenarios](des-006-review-scenarios.md) กำหนด inputs, scheduling และ expected ของ validation/matching/bounds/timeout/cancel/drain-stop/lost/read/preview/platform โดยไม่เปิด hardware

## หลักฐาน

พาธอยู่ใต้ target/school-bot อ่านวันที่ 2026-11-03 มีเพียงการอ่าน tests ไม่ได้รัน

- app/frontend/src/modes/robot-control/engineAdapter.ts:70–127; app/frontend/tests/frontend-workspace.test.mjs:25–57,100–165,300–348,350–425
- app/internal/engine/manager.go:30–38; manager_test.go:114–229,298–367; stop_test.go:9–48; limits_test.go:71–132
- engines/zide/tests/ipc.test.mjs:43–72,84–179; src/request.cpp:87–118; src/actions.cpp:29–38
- app/frontend/src/core/preview.ts:57–74; client.ts:55–94; การทดสอบ UI ตัวอย่าง AC-013-03 ทั้งหมดต้องมี inspect/check ตรวจ caller เพิ่ม ไม่ใช้แค่ preview.run แทนทั้ง flow
