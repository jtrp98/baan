# Robot payload และ idle/drain-stop — Rev1

ต่อจาก [DES-006](des-006.md); GAP-08/AC-024-01. สถานะอยู่ที่ [index](index.md)

## ขอบเขต payload

Envelope JSON Lines `{protocol:"1.0",request_id:string,mode:"robot-control",action:string,data:object}` หนึ่งบรรทัด ≤65536 UTF-8 bytes, request_id 1–128 bytes; success `{protocol,request_id,status:"success",data}` / error `{protocol,request_id,status:"error",error:{code,message}}`. ห้าม unknown envelope/data keys, float แทน integer, NaN/Infinity. Host เลือก action/target จาก allowlist และส่ง explicit transport; dry-run ไม่เป็น hardware success. หลักฐาน `engines/zide/src/request.cpp:32–69,122–156`, `line_reader.cpp:7,46`

group.index integer 0–9999 ไม่ซ้ำใน batch; items ≤32, servo id ไม่ซ้ำและ bounds ตาม servo.set; live group ห้ามว่าง ส่วน empty download เป็น marker เดิม ไม่ใช่ท่าหกข้อที่ valid ใน Project. Profile UI ยังคงหกข้อ; engine ไม่เพิ่มเป็นหกโดยเงียบ. `servo.torque.id` 0–255 (255 broadcast), enabled เป็น boolean; group.run ต้อง end≥start. Serial baud ใช้ allowlist `9600,19200,38400,57600,115200,128000,230400,256000,460800,512000,921600`, default 115200; read_ms 1–1500 default 1000; UI movement/stop ใช้ 1, probe/read ใช้ 1000 ตาม engineAdapter.ts:69,103–109. หลักฐาน bounds `actions.cpp:45–100`, `protocol.cpp:38–65,90–96`; invalid → INVALID_INPUT/SAFETY_LIMIT ก่อนส่ง ห้าม clamp ให้เคลื่อนเงียบ

## Stop และ drain

Stop ซ้ำระหว่างกำลังหยุด join งานเดิม ไม่สร้างคิว movement/relock ใหม่; รอ child reaped และ stdout/stderr drained ก่อนส่ง stop (manager.go:115–127,188–189; process WaitDelay=1 วินาที). ไม่ยกเลิก robot.stop ที่กำลังทำจาก navigation/close ซ้ำ; deadline host 5 วินาทียังคงอยู่. ผลการ cancel อาจเกิดหลัง partial write จึงไม่รับรองว่าไม่มี movement. Relock เมื่อผู้ใช้ขอและ stop request ส่งสำเร็จเท่านั้น; failure คง lost/unknown delivery และให้ผู้ใช้ recovery ไม่ replay command

### Idle discovery — AC-024-01

as-built `app/frontend/src/modes/robot-control/robotContext.tsx:119–129` ใช้ interval 3000 ms, เฉพาะ connected/มี target/transport.idle; discovery สำเร็จแต่ target transport+path หายครั้งเดียว → DEVICE_NOT_FOUND/lost; debounce เพิ่ม=0. errors จาก discovery ถูก catch ไม่ถือว่าถอดสาย; engineAdapter.ts:77–110 แยก busy/cancelled จาก command failure

ข้อเสนอคง **poll 3000 ms, debounce 0 ms/หนึ่งผลสำเร็จที่ไม่พบ target (สมมติฐาน — ยังไม่ยืนยัน)** เพื่อ reuse พฤติกรรมเดิม. ไม่ซ้อน poll ขณะ busy/stopping; ผลเก่าหลังสลับ target/unmount/generation เปลี่ยนต้องถูกทิ้ง. lost ต้อง invalidate uploaded session/งานค้างและแสดง reconnect; reconnect ต้อง probe ใหม่ ไม่ auto movement. poll failure แสดง discovery error โดยไม่ตีความ cable loss; busy/cancelled ไม่เปลี่ยน connected. 3 วินาทีเป็น cadence ไม่ใช่รับรองเวลาตรวจพบสูงสุด เพราะขึ้นกับ scheduler/OS/engine; ไม่ใช้เป็น stop latency/hardware acceptance. ปัดตก poll ถี่กว่างาน transport และ debounce หลายรอบที่เพิ่มช่วงไม่รู้ว่าหลุดโดยยังไม่มีหลักฐานจำเป็น

## Change Log
- 2026-10-24 — Rev1: ใบงาน060a แยกสัญญาเฉพาะเรื่องและหลักฐาน; ไม่เปลี่ยน schema/gates/AC

