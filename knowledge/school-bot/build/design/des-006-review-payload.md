# DES-006 — ทบทวน payload หุ่น

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (SA-003 — ตรวจ payload/validation กับโค้ดจริง)

ส่วนของ [ผลทบทวน Host/IPC/หุ่น](des-006-review.md) ตารางนี้เป็น as-built ของ action ที่ Host เปิดใช้ ไม่ใช่ schema ใหม่ ทุก action ใช้ envelope/error ของ [IPC](des-006-review-ipc.md)

## Target และชนิดข้อมูลร่วม

Target field สำหรับ device commands ใช้ transport:string enum dry-run|hid|serial (default dry-run), HID ใช้ device:string (default ว่าง), serial ต้องมี port:string ไม่ว่าง; ห้าม device ไม่ว่างเมื่อไม่ใช่ hid และห้าม port ไม่ว่างเมื่อไม่ใช่ serial ปัจจุบัน HID device ว่างเลือกเองได้เมื่อพบเพียงหนึ่งตัว ส่วน device.list ห้ามมี transport/device/port/baud/read_ms

baud เป็น integer default 115200 จากชุด 9600,19200,38400,57600,115200,128000,230400,256000,460800,512000,921600; read_ms เป็น integer 1–1500 default 1000 ใช้ควบคุมหน้าต่างรอ reply ไม่ใช่เวลาการเคลื่อนไหว adapter native ส่ง explicit target: HID {transport:"hid",device:path}; serial {transport:"serial",port:path,baud:115200} และใช้ read_ms=1000 สำหรับ probe/read, 1 สำหรับ movement/stop/torque

ฟิลด์ integer ต้องเป็น JSON integer ไม่ใช่ float/string/bool; ไม่รับ null เป็น default ค่า NaN/Infinity ไม่ใช่ JSON ที่ใช้ได้ ต้องปฏิเสธก่อนส่งหุ่น ไม่ clamp ชุดชื่อ data ที่ C++ รับเป็นชุดรวม: transport,port,baud,device,read_ms,id,pwm,time_ms,bias,servo,angle,enabled,group,groups,start,end,times,content ชื่ออื่นถูกปฏิเสธ แต่ field ที่เป็นของ action อื่นในชุดนี้อาจถูกละเลย นี่เป็นช่องว่างจาก strict per-action validation

## Input และผลเฉพาะ action

Target หมายถึง field ร่วมข้างต้น; field ที่ไม่ระบุ default ในตารางต้องมี รายการผลด้านล่างเสริม common output ท้ายเอกสาร

| Action | Inputs / bounds | ผลและเงื่อนไข |
|---|---|---|
| device.list | {} | devices:[{transport:"hid"หรือ"serial",path:string,name:string}]; ไม่ open output handle หรือส่ง movement, discovery ไม่เท่ากับ connected |
| board.info | Target | สร้าง $DRS!; native ต้องได้รับ bytes จึงไม่ DEVICE_TIMEOUT; ยังไม่ตรวจ grammar/รุ่นบอร์ด ไม่คืนข้อมูล firmware ที่ parse แล้ว |
| servo.set | Target + id integer 0–254, pwm integer 500–2500; time_ms integer 0–9999 default 1000; bias integer −500..500 default 0 | pwm+bias ต้อง 500–2500 ไม่เช่นนั้น SAFETY_LIMIT; ผล id,pwm (รวม bias),time_ms |
| servo.set alias เดิม | ใช้ servo integer 1–4 และ angle integer 0–180 แทน id/pwm; ห้ามผสมสองชุด | pwm=500+floor((angle×2000+90)/180); ผลเพิ่ม servo,angle; alias เดิมไม่ใช่ profile หกข้อ |
| servo.read | Target + id integer 0–254 | สร้าง #NNNPRAD!; ต้องมี bytes ใน native; engine คืน raw reply ให้ frontend parse ไม่คืน typed position |
| servo.torque | Target + enabled boolean; id integer 0–255 default 255 | 255 คือ broadcast; enabled true → PSCK, false → PULK; ไม่ได้วัดว่าแรงบิดล็อก/ปลดแล้ว |
| robot.stop | Target | สร้าง $DST!, ผล stop_requested:true; ไม่คืน stopped/physical stop |
| group.execute | Target + group หรือ groups อย่างใดอย่างหนึ่ง; จำนวนหนึ่ง group | live group ต้องมี items อย่างน้อยหนึ่ง ไม่ใช่คำสั่ง play ชุดที่อัปโหลด |
| group.download | Target + group หรือ groups อย่างใดอย่างหนึ่ง; จำนวน 1–8 | index ไม่ซ้ำใน batch; empty items ยอมรับเป็น marker เดิม; UI ส่งครั้งละ ≤4 และยังต้องพอดี envelope 65536 bytes |
| group.run | Target + start integer 0–9999, end integer start–9999, times integer 1–9999 | สร้าง $DGT:start-end,times!; ผล runs_on_device = !simulated; engine ไม่มี upload-session persistence, frontend ต้องมี session ของ target ปัจจุบัน |

Group คือ {index:integer 0–9999,items:array} ไม่มี field อื่น items ≤32 รายการ โดย item คือ {id,pwm,time_ms,bias?} และไม่มี field อื่น id integer 0–254 ไม่ซ้ำใน group, pwm integer 500–2500, time_ms integer 0–9999 **ต้องระบุ** (ต่างจาก servo.set), bias integer −500..500 default 0 และผลรวม PWM ต้องอยู่ในช่วง กลุ่ม live ห้ามว่าง; download ยอมว่าง ขอบเขต engine 32 servos ไม่เท่ากับ profile/UI หกข้อ

UI profile คือ {name:string ไม่ว่างหลัง trim,servos:[{id,pwmMin,pwmMax}]} ครบหก, ID integer 0–254 ไม่ซ้ำ, endpoints integer 500–2500 และไม่เท่ากัน รองรับกลับทิศ UI_RANGES ตามลำดับคือ −180..180, −135..135 สี่ข้อ, 0..100 ของ gripper; เป็นพิกัดหน้าจอ ไม่ใช่มุมที่ยืนยันทางกล การส่งแปลงเชิงเส้นแล้ว Math.round ส่วนข้อมูล Project ใช้ duration ที่จำกัดกว่านี้ตาม DES-006 เดิม ไม่เปลี่ยน engine bounds

## รูปผลและผลอ่าน

อ่าน [รูปผลและการอ่านตำแหน่ง](des-006-review-results.md) สำหรับ common output, exchange, byte counts, fixture ตัวอย่าง และการ commit ผลอ่าน

## C2 — ขอบเขตเสนอรอคน review

**breaking:** Host ตรวจ field ตาม action และ object/bounds ก่อน dispatch; native device command ต้องมี explicit transport+target จาก discovery ไม่ใช้ default dry-run หรือ HID auto-select แบบเงียบ `servo.set` ยังคง alias และ bounds เดิม ไม่เพิ่มหกข้อบังคับให้ทุก engine group; standalone dry-run default ยังอยู่ การคง standalone และเพิ่ม Host checks เป็นทางเลือกที่เล็กกว่าการทำ protocol ใหม่

Per-action allowed keys = target keys + inputs ในแถวที่เลือก; device.list รับ {} เท่านั้น servo.set เลือกหนึ่งชุด alias/canonical, group.execute/download เลือก group หรือ groups หนึ่งชุด โดยไม่รับ field ข้าม action validation failure ใช้ INVALID_INPUT/SAFETY_LIMIT เดิม ไม่เพิ่ม error enum

## หลักฐาน

พาธอยู่ใต้ target/school-bot อ่านวันที่ 2026-11-03

- engines/zide/src/request.cpp:32–69,83–118,127–158; engines/zide/include/validation.hpp:16–31
- engines/zide/src/actions.cpp:22–108,110–112,132–149; engines/zide/src/protocol.cpp:37–68,90–135
- app/frontend/src/modes/robot-control/engineAdapter.ts:1–69,95–109
- app/frontend/src/modes/robot-control/workspace/NativeWorkspace.tsx:243–275,325–364
