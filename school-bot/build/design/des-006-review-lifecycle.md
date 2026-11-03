# DES-006 — ทบทวน lifecycle และความหมายของผล

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (SA-003 — ตรวจ cancel/drain/stop และ provenance)

ส่วนของ [ผลทบทวน Host/IPC/หุ่น](des-006-review.md) แยกสิ่งที่โค้ดทำแล้วออกจาก C3/C6 ที่เสนอให้คนทบทวน ไม่ใช้ OS write หรือเวลาของ animation ยืนยันการหยุดทางกายภาพ

## ลำดับเดิมที่อ่านพบ

1. Workspace ขอ stop: ตั้ง stopping, generation++, ล้าง pending joints/timers ก่อนเรียก RobotApi.stop(target เดิม)
2. ZideTransport.stop ตั้ง stopTask ให้คำขอ stop ซ้ำ join promise เดิม; command/discover/probe ใน instance นี้ถูกกันระหว่าง stopTask และรวม relockRequested จากผู้เรียก
3. await bridge.cancel(): manager cancel child ที่ไม่ใช่ robot.stop และรอ done หลัง reap/คืน slot; ไม่ cancel robot.stop ที่กำลังทำแต่รอ deadline เดิม
4. await active.catch(...): รอ promise เดิมจบ แล้วส่ง robot.stop ด้วย target เดิม/read_ms=1
5. หากมี relockRequested ส่ง servo.torque enabled:true ต่อเมื่อ stop request สำเร็จ; failure เรียก onFailure และ reject ไม่แสดง stop/lock สำเร็จ
6. Workspace ตั้ง st:"stopped" และ log ว่าส่ง stop เมื่อ promise สำเร็จ ค่านี้หมายถึง workflow ไม่ใช่ measured stopped

manager.stopping เริ่มเมื่อ Execute(robot.stop) ยึด slot แล้วเท่านั้น ช่วงหลัง Cancel คืนแต่ก่อน Execute(stop) ยังไม่มี host reservation caller ที่เรียก bridge ตรงหรือคนละ instance จึงอาจแทรกคำขอได้ Stop ซ้ำ join ระดับ frontend instance ไม่ใช่ Host ทั้งระบบ นี่คือช่องว่างที่ C3 ต้องปิด

Workspace ก่อน unmount ขอ stop แม้ไม่มี active request หากยัง connected/มีงาน/ปลดแรงบิด; cleanup ปัจจุบัน fire-and-forget และ console.warn เมื่อพลาด ส่วน window close guard await stop และส่ง error กลับ การมี stop request ใน unmount ไม่ได้พิสูจน์ว่า navigation ทุกทางรอ guard ครบ

## Written / predicted / measured / simulated

| ความหมาย | หลักฐานที่ทำให้ใช้คำนั้นได้ | สิ่งที่ห้ามสรุป |
|---|---|---|
| written | native exchange ส่งครบโดยไม่ error, delivery:"written",acknowledged:false | ไม่ยืนยันว่าบอร์ดรับ/เล่นจบ หุ่นถึงท่า หรือแรงบิดเปลี่ยนจริง |
| predicted | frontend glide และ timer เริ่มหลังส่งสำเร็จ ใช้ค่าที่สั่งกับ duration ประมาณภาพ | ไม่เป็น sensor reading; state cur/linked/done จากเวลาไม่กลายเป็น measured |
| measured | servo.read มี reply ของ ID ที่ขอ, PWM อยู่ในช่วง profile, generation/target ยังตรง, อ่านครบก่อน commit | ไม่ยืนยันมุมทางกลแม่นยำหรือ physical stop; protocol ไม่ได้มี field measured |
| simulated | engine dry-run หรือ test fixture/preview; ต้องติดป้ายตลอด session และเก็บ provenance ใน harness | ห้ามเป็น hardware evidence/ผลประเมินถาวร/สิทธิ์หรือ API success จริง |
| stop requested | ส่ง $DST! สำเร็จตาม transport; stop_requested:true | ไม่ใช่ emergency stop ที่รับรอง และไม่ใช่ measured stopped |
| unknown delivery | error/timeout/cancel ที่อาจเกิดหลังส่งบางส่วน | ห้ามถือว่าไม่มี movement หรือ retry คำสั่งเดิมอัตโนมัติ |

C6 เป็น **non-breaking** เมื่ออธิบาย/แสดงความหมายแยกและคง engine wire/state เดิม เพิ่ม discriminant ให้ public DTO หรือเปลี่ยน st enum ภายหลังต้อง review ใหม่ ไม่เสนอแอบเปลี่ยนในงานนี้ Comment “cancelled changed nothing” ต้องแก้เมื่อทำ implementation เพราะไม่จริงเมื่อส่งบางส่วนแล้ว

## Lost และ reconnect เดิม

Native เริ่ม off ไม่ restore connection จาก Project การ connect ต้องเลือก device, validate profile, ยืนยันหน้า connect และ probe ผ่าน แต่ checkbox ไม่ใช่ calibration approval

- คำสั่งล้มเหลวที่ไม่ใช่ ENGINE_BUSY/ENGINE_CANCELLED และไม่ได้กำลัง stop เรียก onFailure → lost; สอง code นี้เพียงอย่างเดียวไม่ lost และไม่ได้รับรองว่าไม่ส่งบางส่วน
- ทุก 3000 ms เมื่อ connected/มี target/transport idle ทำ discovery; ผลสำเร็จที่ไม่พบ transport+path เดิมครั้งเดียว → DEVICE_NOT_FOUND/lost; result เก่าต้องยัง mounted/connected และ device object ตรง ผล discovery error ปัจจุบันถูก catch ทิ้ง ไม่ได้แสดง error โดยอัตโนมัติ
- fail/invalidate ล้างภาพการเคลื่อนไหวและงานค้าง; snapshot ไม่เก็บ upload session ว่าใช้ต่อได้ เปิดใหม่/reconnect ไม่ auto play; board playback ไม่ตั้งจบจาก duration timer
- 3000 ms/debounce เพิ่ม 0 เป็นค่าในโค้ด ไม่ใช่ stop latency หรือเวลาตรวจพบสูงสุดที่มนุษย์รับรอง

## C3 — สัญญาลำดับที่เสนอรอคน review

**breaking:** Host เป็นเจ้าของ stop operation ครอบทั้งช่วง ไม่เพิ่ม queue ไม่จำกัด และไม่ถือว่า frontend guard เป็น authority

1. ปิด admission และเก็บ target เดิมก่อน cancel; ใช้ ENGINE_BUSY สำหรับคำขอใหม่ที่ไม่ใช่ recovery ตลอดช่วง reservation ไม่เพิ่ม engine enum
2. invalidate generation/timers/คิวที่ producer; cancel child เดิมแล้ว await reap/drain และผลคำขอเดิมก่อนส่ง $DST! ห้ามส่ง stop หากยังไม่ทราบว่า child ที่ส่งเดิมจบแล้ว
3. reserve slot จน stop และ relock ที่ผู้ใช้ขอเสร็จ; คำขอ stop ซ้ำของ target เดิม join งานเดิม ไม่สร้าง movement/relock ซ้ำ และ cancel จาก close ไม่ฆ่า stop
4. สำเร็จหมายถึง stop_requested เท่านั้น; failed/timeout ยังคง error/unknown, ไม่ปล่อย callback เก่าสร้างงานและไม่ replay movement การเริ่มงานใหม่ต้องเกิดจาก user action และ probe/recovery ที่เหมาะสม
5. navigation/close ที่พึ่ง guard ต้อง await operation เดียวกันก่อนออก; cleanup หลัง unmount เป็นเพียง fallback ไม่ใช้เป็นหลักฐานว่า drain สำเร็จ
6. matching ของ callback รวม generation และ target/session/project context ที่เปิดงานตาม DES-001 ผล response ตรง request_id อย่างเดียวยังไม่พอให้อัปเดต workspace ที่เปลี่ยนแล้ว

คง timeout 5 วินาที/WaitDelay 1 วินาทีและ transport 4 วินาทีแยกหน้าที่ตาม IPC ห้ามตั้ง timeout รวมของ stop เป็น SLA จากการบวกตัวเลขเอง หาก drain/stop ไม่สำเร็จแสดงเหตุผลและคง guard ตามบริบท ไม่อ้าง safety การ relock ต้องยังเป็น explicit user intent ไม่ทำจาก timeout

เลือกขยาย manager เดิมกับ test seams ปัดตก kill child แล้วแสดง stopped, timer-confirmed stop, retry movement และ engine pool เพราะทำให้ผลจริงคลุมเครือหรือเปลี่ยน semantics เกินความจำเป็น

## หลักฐาน

พาธอยู่ใต้ target/school-bot อ่านวันที่ 2026-11-03

- app/internal/engine/manager.go:115–164,184–211; app/internal/engine/stop_test.go:9–48 (อ่าน test ไม่ได้รัน)
- app/frontend/src/modes/robot-control/engineAdapter.ts:58–67,77–127; robotContext.tsx:39–51,61–105,108–134
- app/frontend/src/modes/robot-control/workspace/NativeWorkspace.tsx:67–70,133–145,184–211,228–240,278–305,325–364,366–373,399–420
- engines/zide/src/request.cpp:99–116; engines/zide/src/actions.cpp:105–108
