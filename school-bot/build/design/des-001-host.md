# DES-001 — Desktop host และ Inter-Process Communication (IPC) — ผู้ใช้และเงื่อนไขก่อนเริ่ม

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-001 — Desktop host และ IPC](des-001.md)

## ผู้ใช้และเงื่อนไขก่อนเริ่ม

Guest/Login เปิด Lab/Lessons, run, save, navigate หรือ close; host ต้องตรวจ entitlement ตาม [DES-002 (License และ device binding)](des-002.md) ก่อนเริ่มงานหลัก ไม่เชื่อสถานะ unlocked จาก React

## ข้อเสนอ bridge และการเลือก engine

เพิ่ม typed bridge `RunV2({mode,action,data}) → HostResult<EngineResponse>` โดย `HostResult<T>` เป็น `{ok:true,data:T}` หรือ `{ok:false,error:{code,message}}`

Mode ใช้ implementation ID ตาม modules; host เลือก executable เอง

| Mode | Actions ที่อนุญาต |
|---|---|
| coding-adventure / block-programming | program.run |
| robot-control | device.list, board.info, servo.set, servo.read, servo.torque, robot.stop, group.execute, group.download, group.run |

`Run`, Save/Load เก่าเมื่อยังอยู่ต้องผ่าน gate เดียวกัน ห้ามเหลือ ungated compatibility path Production ปิด scenario/debug entry; preview development ไม่มี native/API authority

Engine envelope คง `1.0`:
`{protocol,request_id,mode,action,data}` → `{protocol,request_id,status,data? ,error?}`
success ห้ามมี error; error ต้องมี `{code,message}` และไม่มี data ตรวจ required/type/unknown fields/ID matching และขนาดก่อนใช้ผล stdout มีหนึ่ง response; stderr จำกัดเดิม

Host preflight errors อยู่นอก engine envelope: `LICENSE_REQUIRED`, `LICENSE_EXPIRED`, `CLOCK_UNTRUSTED`, `MODE_NOT_ALLOWED`, `ACTION_NOT_ALLOWED` ไม่เพิ่ม engine error enum โดยไม่จำเป็น

## วงจรงานและเงื่อนไขที่ต้องรักษา

`locked → entitled → draining → locked|ready|closed`

- ตรวจ gate ตอนเข้าหน้า ก่อน dispatch และเมื่อครบ expiry; timer เก่าไม่สร้างคำสั่งใหม่หลังสิทธิ์หมด
- สิทธิ์หมดระหว่างหุ่นทำงาน: ปิด admission → invalidate generation → cancel/drain → stop เป้าหมายเดิม
- `CancelRun`, Stop, close guards, credential recovery และการเก็บ recovery snapshot ของงานที่เปิดอยู่ยังใช้ได้ขณะ locked; ไม่เปิดโหมดหรือเริ่มงานใหม่
- Recovery snapshot ไม่ถือเป็น Cloud save สำเร็จ; policy เก็บข้าม session ตาม [DES-003 (หลายโครงงาน Local/Cloud)](des-003.md)
- ตั้ง stopping ที่ host ก่อน cancel เพื่อกันคำสั่งอื่นแทรกระหว่าง drain/stop; concurrent stop ใช้ operation เดียว
- Navigate/close รอ guard; save-then-leave รอ persistence สำเร็จ Error คงหน้าต่างและแสดงเหตุผล
- UI generation, session epoch และ project ID ต้องตรงก่อน callback แก้ state; cleanup ยกเลิก subscriptions/timers

Engine slot มีหนึ่งคำขอ; busy คืน `ENGINE_BUSY` ไม่เข้าคิวไม่จำกัด Timeout/ผิด protocol คืน code เดิม ไม่ถือว่าหุ่นหยุด

ภาษา th/en/zh และ fonts อยู่ offline เปลี่ยนภาษาไม่ remount mode ไม่เปลี่ยน source/ชื่อ/diagnostics; static UI ใหม่ต้องมี keys ครบสามภาษา ใช้ components/assets เดิมและคง fullscreen/frameless/window controls

## ความเข้ากันได้และทางเลือก

เป็น breaking host authorization behavior และ bridge เพิ่มเติม ต้องทบทวนก่อน build ปัดตก gate เฉพาะหน้า React เพราะเรียก bridge ตรงได้ ปัดตก persistent engine pool ในรอบนี้ เพราะไม่จำเป็นต่อสามโหมดและเปลี่ยน cancellation semantics

