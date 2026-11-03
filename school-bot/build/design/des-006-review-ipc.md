# DES-006 — ทบทวน Host/IPC และ validation

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (SA-003 — ตรวจ Host/robot กับโค้ดจริง)

ส่วนของ [ผลทบทวน Host/IPC/หุ่น](des-006-review.md) baseline ต่อไปนี้อ่านพบในโค้ด ส่วน C1/C4 เป็นข้อเสนอรอคนทบทวน

## Bridge และ routing เดิม

DesktopService.Run(mode,action,dataString) คืน (engine.Response, Go error) ตรวจความยาว data และ json.Valid ก่อน manager; client.run stringify input และโยน EngineError(code,detail) เมื่อ status:error ส่วน Go error จาก bridge เป็น rejection คนละชั้น ไม่ได้มี code เดียวกันทุกกรณี CancelRun() คืน void และรอ manager cancel จบ ไม่ได้คืนว่าหุ่นหยุด

Host เลือก executable จาก directory ของตัวแอป ไม่ค้น working directory และไม่รับ path จาก frontend: robot-control → engines/zide/zide-engine[.exe], coding-adventure|block-programming → demo-engine[.exe] มี slot เดียวทั้งระบบ งานชนคืน ENGINE_BUSY ทันที ไม่มีคิว

| Mode | Actions ที่ Host อนุญาต |
|---|---|
| robot-control | device.list, board.info, servo.set, servo.read, servo.torque, robot.stop, group.execute, group.download, group.run |
| coding-adventure / block-programming | program.run |

engine.info, group.read, project.import/export มีใน C++ แต่ไม่อยู่ใน Host allowlist ไม่เสนอเปิดเพิ่ม Host สร้าง request ID จาก random 16 bytes เป็น ASCII hex 32 ตัว ไม่รับ ID ของ frontend และสร้าง child ใหม่ต่อ Execute; standalone engine รับหลายบรรทัดได้ แต่ Host ส่งเพียงหนึ่งบรรทัดแล้วปิด stdin

## Envelope เดิมและ validation ที่ต่างกัน

Request: {protocol,request_id,mode,action,data}; response: {protocol,request_id,status,data?,error?}

| Field | สัญญาและ runtime |
|---|---|
| protocol | string 1.0 ทั้งสองทิศทาง ต้องตรง |
| request_id | schema request 1–128 ตัวอักษร, response 0–128; C++ ใช้ 1–128 bytes และคืนค่าว่างเมื่อสะท้อน ID ไม่ได้ Host ใช้ ASCII 32 จึงไม่ชนความต่างนี้ |
| mode/action | schema string 1–128 ตัวอักษร; Host จำกัด registry/allowlist, C++ รับ mode robot-control และ action ที่มี handler |
| request.data | object; schema/C++ บังคับ แต่ Run ตรวจเพียง valid JSON จึงส่ง scalar ไปให้ engine ปฏิเสธได้ |
| response.status | success/error; error ต้องมี error ไม่มี data; success ห้าม error โดย schema อนุญาตไม่มี data |
| response.data | object เมื่อมี; รูปตาม action ใน [payload](des-006-review-payload.md) |
| error | {code:string,message:string}; code อยู่ใน enum, message ไม่ว่าง, schema ห้าม field อื่น |

Host ตรวจ protocol/request_id ให้ตรงคำขอ, status, data เป็น object, success ไม่มี error, error มี code ที่รู้จัก/message ไม่ว่าง/ไม่มี data แต่ json.Unmarshal ไม่ปฏิเสธ unknown fields และแยก missing จาก explicit null ไม่ครบ หลาย JSON responses หรือ log บน stdout ทำให้ decode ล้มเหลว; whitespace รอบ response ยังรับได้

schema เป็น JSON Schema draft 2020-12 แต่ไม่ใช่ Go runtime validator C++ ตรวจด้วย code จึงห้ามอ้างว่าทุกชั้นตรวจ strict UTF-8/JSONL/schema ครบจาก json.Valid เพียงอย่างเดียว

## Bounds และเวลาเดิม

| ขอบเขต | ค่าและผลเกินขอบเขต |
|---|---|
| dataString ตอน Run | ≤65536 bytes; เกิน/JSON เสีย → Go error ไม่ dispatch |
| envelope หลัง marshal | ≤65536 bytes ไม่รวม LF; เกิน → INVALID_REQUEST ก่อน start child; data พอดีขอบเขตอาจไม่พอดี envelope |
| stdout | ≤1048576 bytes (1 MiB); เกิน → ENGINE_FAILED; buffer ทิ้งส่วนเกินและรับ write ต่อเพื่อไม่อุด pipe |
| stderr | เก็บ ≤8192 bytes; เนื้อหา diagnostic ตัดที่ 512 bytes แล้วอาจต่อ … |
| Host deadline | 5 วินาทีต่อ Execute; หมดเวลา → ENGINE_TIMEOUT ไม่ใช่ stop success |
| pipe drain | WaitDelay 1 วินาทีจำกัด pipe ที่ descendant ถือไว้; อาจคืน failure ไม่ใช่ hardware หยุด และ 5+1 ไม่ใช่ stop latency SLA |
| Windows exchange | deadline 4 วินาที; read_ms 1–1500 default 1000; firmware probe/pacing อยู่ภายใน exchange |
| received / command | reply รวม ≤65536 bytes; command printable ASCII 1–4096 bytes; ตรวจทุก command ก่อน exchange |

## Errors และ failure behavior

| ชั้น/Code | ความหมาย/การจัดการ |
|---|---|
| Go error | mode/action ไม่อนุญาต หรือ data preflight เสีย; ไม่ใช่ engine error envelope |
| PROTOCOL_INVALID / INVALID_REQUEST | envelope ผิด / syntax หรือขนาดคำขอผิด; ไม่ใช่ cable loss โดยตัวมันเอง |
| INVALID_INPUT / SAFETY_LIMIT | payload ผิด / pwm+bias นอกช่วง; ปฏิเสธก่อน exchange ไม่ clamp |
| ACTION_UNKNOWN / PROJECT_INVALID | standalone action ไม่มี / import-export ผิด; Host ไม่เปิดเส้นทางหลัง |
| ENGINE_BUSY / ENGINE_CANCELLED | slot ชน / cancel child; ไม่ lost จาก code อย่างเดียว; cancelled อาจส่งแล้วบางส่วน |
| ENGINE_FAILED / ENGINE_TIMEOUT | หา/รัน child ไม่ได้, output/contract เสีย / หมดเวลา; หากเริ่มส่งแล้ว delivery อาจไม่ทราบ ไม่ retry movement |
| TRANSPORT_ERROR / DEVICE_TIMEOUT | open/read/write ผิด / คำสั่งต้องตอบไม่มี bytes; อาจส่งแล้ว ให้ lost/error และ probe ใหม่ |

enum คง PROGRAM_INVALID, COMMAND_UNKNOWN, STEP_LIMIT ของ demo engine ด้วย ไม่เพิ่ม/ลดใน review นี้ host failure ก่อนสร้าง request ID อาจคืน request_id ว่าง เช่น busy/หา executable ไม่พบ ห้าม match เป็น response ของงานอื่น Engine error ไม่มี data จึงไม่รับประกันว่าจะมี byte counts ให้กู้จาก failure

## ข้อเสนอรอ review

**C1 — breaking:** ตรวจ strict UTF-8/หนึ่ง JSONL response และ presence/type/unknown properties ของ envelope/error ตาม schema เดิม รวม explicit null ที่เดิมหลุดผ่าน กระทบ fixture ที่เคยพึ่งความผ่อนปรน คง mismatch → ENGINE_FAILED ไม่ส่ง data ให้ consumer ไม่จำเป็นต้องเปลี่ยน protocol/error enum

**C4:** เพิ่ม RunV2({mode,action,data}) → HostResult<EngineResponse> เป็น non-breaking โดยรูปเดิมของ DES-001 คือ {ok:true,data:T} หรือ {ok:false,error:{code,message}} ส่วน License/entitlement gate บนทั้ง Run/RunV2 เป็น breaking; preflight codes LICENSE_REQUIRED, LICENSE_EXPIRED, CLOCK_UNTRUSTED, MODE_NOT_ALLOWED, ACTION_NOT_ALLOWED อยู่นอก engine envelope ผล engine valid คงใน data:T แม้ status:error แล้ว adapter แปลงเป็น coded rejection cancel/stop recovery ต้องใช้ได้ขณะ locked

เลือกเสริม registry/manager เดิม ปัดตก executable path จาก caller, persistent engine pool และ protocol 2.0 เพราะไม่จำเป็นต่อช่องว่างนี้

## หลักฐาน

พาธต่อไปนี้อยู่ใต้ target/school-bot อ่านวันที่ 2026-11-03

- app/desktopservice.go:98–107; app/internal/engine/manager.go:19–25,43–101,115–164,167–240,244–253
- app/internal/engine/protocol.go:5–54; app/internal/engine/buffer.go พฤติกรรมเก็บ output จำกัด
- contracts/engine/request.schema.json:5–14; contracts/engine/response.schema.json:5–48
- engines/zide/src/line_reader.cpp:7–52; engines/zide/src/request.cpp:7–69,87–118; engines/zide/include/transport_windows.hpp:26–45
- app/frontend/src/core/client.ts:5–10,55–74; app/frontend/src/core/engineError.ts:1–11
