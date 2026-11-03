# DES-006 — รูปผลและการอ่านตำแหน่ง

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (SA-003 — รูปผลจาก engine)

ส่วนของ [payload หุ่น](des-006-review-payload.md) และ [ผลทบทวน Host/IPC/หุ่น](des-006-review.md)

## Common output และผลอ่าน

Success data มี engine:"zide",language:"C++",simulated:boolean,transport:string และเมื่อสร้างคำสั่งมี commands:string[]

- device.list ใช้ transport:"none",simulated:false แต่ไม่ได้หมายความว่าได้สั่ง/เชื่อมต่ออุปกรณ์แล้ว
- dry-run ใช้ simulated:true,delivery:"dry-run",hid_reports:number[][] แต่ละ report 64 bytes; ไม่มี exchange ของจริง
- native success ใช้ simulated:false,delivery:"written",acknowledged:false,exchange:{received:string,received_hex:string,bytes_written:integer≥0,bytes_read:integer≥0} โดย received_hex เป็น lowercase hex ของ received และ bytes_read นับ bytes ทั้ง reply
- bytes_written ของ serial นับ command bytes; HID นับ report ที่ส่งคำสั่งเป็นชุดละ 64 ไม่รวม CHECK_FW probe ในตัวเลขนี้ จึงเทียบขนาดสอง transport ตรงๆ ไม่ได้
- transport throw → TRANSPORT_ERROR พร้อมข้อความ delivery อาจ partial; native action ที่ต้อง reply แต่ bytes_read=0 → DEVICE_TIMEOUT แม้เขียนแล้ว Error envelope ไม่มี exchange/data จึงไม่รับประกันจำนวน bytes ใน failure

ตัวอย่างสมมติของ response.data สำหรับ servo.read ที่ fake ให้เฉพาะ unit test:

    {"engine":"zide","language":"C++","simulated":false,"transport":"serial","commands":["#000PRAD!"],"delivery":"written","acknowledged":false,"exchange":{"received":"#000PRAD=1500!","received_hex":"23303030505241443d3135303021","bytes_written":9,"bytes_read":14}}

นี่เป็น fixture รูป native ไม่ใช่หลักฐาน hardware; ต้องมี provenance=fake ใน harness ตาม [simulator](des-006-review-simulator.md) Frontend parser ใช้ regex `#(\d{1,3})P(?:RAD=)?(\d{3,4})!`, เลือกผลสุดท้ายของ ID ที่ขอ ตรวจช่วง endpoints ของ profile แล้วแปลงกลับ UI ด้วย Math.round อ่านหกข้อเป็นหกคำขอและ commit ต่อเมื่อผ่านครบ ไม่ใช้ predicted values เติมส่วนขาด

## หลักฐาน

พาธ source ใต้ target/school-bot อ่านวันที่ 2026-11-03: engines/zide/src/request.cpp:87–118,146–150; src/actions.cpp:29–38; src/transport_hid.cpp:18–24,65–81; app/frontend/src/modes/robot-control/engineAdapter.ts:58–67; app/frontend/src/modes/robot-control/workspace/NativeWorkspace.tsx:325–364
