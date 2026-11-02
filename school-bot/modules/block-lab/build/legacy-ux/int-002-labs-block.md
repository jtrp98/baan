---
legacy: true
---
# 4. Block Lab — [REQ-026 (สร้างและทดลองโปรแกรมบล็อก)](../../shared/requirements/req-026.md)

> แก้ล่าสุด 2026-11-02 · แก้โดย int · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับint-002-labs](../../../../build/legacy-ux/int-002-labs.md) · ส่วนหนึ่งของ UX ชุดเดียวกับตาราง Sign-off ในไฟล์ทางเข้า

## 4. Block Lab — REQ-026

ผืนบล็อก: move / jump / repeat (ลากวาง) + ป้าย "ผลลัพธ์เป็นการจำลอง ไม่ได้ส่งบล็อกไปหุ่นจริง" ([BR-026-03 (ผลเป็นข้อมูล trace จำลอง ไม่ใช่การส่งบล็อกไปหุ่นจริง)](../../shared/requirements/req-026.md))

| State | คำ copy (ข้อเสนอ) |
|---|---|
| empty | ผืนว่าง + กล่องบล็อกให้ลาก 3 ชนิด |
| abnormal: สองลำดับไม่เชื่อม | ป้ายบนผืน "โปรแกรมต้องเชื่อมเป็นลำดับเดียว" + ปุ่มรัน disabled ([AC-026-02 (มีสองลำดับที่ไม่เชื่อมกันแล้วรันไม่ได้ และแจ้งให้เชื่อมเป็นลำดับเดียว)](../../shared/requirements/req-026.md)) |
| disabled block | บล็อกที่ถูกปิดแสดงจางลง ข้ามตอนรัน แจ้งในผล "ข้าม 1 บล็อกที่ปิดไว้" ([BR-026-01 (เมื่อรัน บล็อกต้องเชื่อมเป็นหนึ่งลำดับ และข้ามการทำงานของบล็อกที่ disabled)](../../shared/requirements/req-026.md)) |
| error: เกินขอบเขต | ตรวจก่อนรัน: "โปรแกรมขยายเกิน 64 คำสั่ง" / "repeat ซ้อนกันเกิน 8 ชั้น" / "ค่า move/repeat ต้องอยู่ระหว่าง 1–10" — ไม่แสดงผลรันสำเร็จ ([AC-026-03 (โปรแกรมที่ขยายเกิน 64 commands, ซ้อน repeat เกิน 8 ชั้น หรือใช้ compilation fuel เกิน 1000 ถูกปฏิเสธก่อนส่งรัน โดยไม่แสดงผลรันสำเร็จ)](../../shared/requirements/req-026.md), [BR-026-02 (ก่อนส่งรันต้องตรวจ compilation fuel ≤1000 และขอบเขตการรันเดิม หากเกินให้แสดงข้อผิดพลาดโดยไม่ส่งรัน)](../../shared/requirements/req-026.md)) |
| success | trace คำสั่งตามลำดับ เช่น move_right → jump → jump ([AC-026-01 (move_right(2) ตามด้วย repeat 2 ครั้งของ jump ให้ผลคำสั่ง move_right, jump, jump ตามลำดับ)](../../shared/requirements/req-026.md)) + ภาพเดินในฉากจำลอง |
| บันทึก/เปิด | workspace schema 1 คืนบล็อก/ค่า/การเชื่อมเดิม · schema ผิด → "ไฟล์ไม่ตรงกับโปรแกรมนี้" ([AC-026-04 (บันทึก workspace แล้วเปิดใหม่ได้บล็อก ค่า การเชื่อมต่อ และสถานะ enabled เดิม รวม draft หลายลำดับหรือที่เกิน fuel/จำนวนคำสั่งสำหรับรัน หากผ่าน structural validation)](../../shared/requirements/req-026.md)) |

## 5. กติกา preview/mock ([REQ-013 (ขอบเขต sample/preview/mock)](../../../app-shell/shared/requirements/req-013.md) — ใช้ร่วมทุก Lab)

- browser ไม่มี native bridge และไม่มี `preview=1` → หน้า error "ต้องเปิดจากแอป SchoolBot เท่านั้น (ไม่พบ native bridge)" ไม่แสดงผลสำเร็จจำลอง ([AC-013-01 (เปิด browser โดยไม่มี `preview=1` และไม่มี bridge แล้วพบข้อผิดพลาด native bridge แทนผลสำเร็จจำลอง)](../../../app-shell/shared/requirements/req-013.md), [BR-013-01 (Browser ที่ไม่มี native bridge ต้องไม่เปลี่ยนเป็น preview อัตโนมัติ)](../../../app-shell/shared/requirements/req-013.md))
- ใน preview: บันทึกงานใน browser ได้ แต่ activate/ตรวจอัปเดตไม่ยิง API จริง ([AC-013-02 (ใน preview บันทึกงานได้ใน browser แต่ activate และตรวจอัปเดตไม่เรียก API จริง)](../../../app-shell/shared/requirements/req-013.md)) · Teacher restart/console/USB ตัวอย่าง ไม่มีคำสั่งไปอุปกรณ์ ไม่มีไฟล์จริง ไม่มีผลประเมินถาวร ([AC-013-03 (ทดลอง LearnMap, Teacher restart/reset/console และ USB ตัวอย่างแล้วไม่มีคำสั่งไปอุปกรณ์ ไม่มีไฟล์ USB ที่ถูกคัดลอกจริง และไม่มีผลประเมินถาวร)](../../../app-shell/shared/requirements/req-013.md))
- ผล mock ไม่ใช่สิทธิ์ครู/ผลประเมิน ([BR-013-02 (ผล mock ไม่ใช่สิทธิ์ครู ผลประเมิน การส่งคำสั่งจริง หรือ multi-project)](../../../app-shell/shared/requirements/req-013.md)) — ป้ายจำลองตาม §1
