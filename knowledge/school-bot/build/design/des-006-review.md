# DES-006 — ผลทบทวนสัญญา Host/IPC/หุ่น

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (SA-003 — เตรียม Host/robot contract review ตามมติ 053)

ใช้ร่วมกับ [DES-001 (Desktop host และ Inter-Process Communication: IPC)](des-001.md) และ [DES-006 (หุ่นจริง Windows/macOS)](des-006.md) แยก as-built กับข้อเสนอรอคนก่อน BE-010 (Host engine) ไม่แก้ target หรือรันอุปกรณ์

## วิธีอ่าน

| เอกสาร | เนื้อหา |
|---|---|
| [IPC และ validation](des-006-review-ipc.md) | bridge, routing, envelope, matching, bounds และ errors |
| [Payload หุ่น](des-006-review-payload.md) | input/output ของทุก action ที่ Host เปิดให้ใช้ |
| [รูปผลและการอ่านตำแหน่ง](des-006-review-results.md) | exchange/byte counts และ atomic read |
| [Lifecycle และความหมายผล](des-006-review-lifecycle.md) | cancel/drain/stop, written/predicted/measured และ lost |
| [Windows/Darwin](des-006-review-platform.md) | HID/Serial, compatibility และหลักฐานที่ยังขาด |
| [Fake และ simulator](des-006-review-simulator.md) | จุดเสียบ fixture และกรณีทดสอบที่ไม่ใช้หุ่นจริง |
| [กรณีทดสอบ fake](des-006-review-scenarios.md) | inputs/scheduling/expected สำหรับส่งต่อ |
| [เกณฑ์และข้อเสนอ AC](des-006-review-acceptance.md) | coverage ของใบงานและ ac_ids เดิมที่เสนอให้ผู้คุมผูก |

## ข้อเท็จจริงที่ต่างจากคำอธิบายเดิม

- DES-001 อธิบาย host admission guard ก่อน drain→stop เป็นข้อเสนอ ปัจจุบัน manager ป้องกันการ cancel เมื่อ robot.stop เริ่มแล้ว แต่ยังไม่สงวนช่วงระหว่าง cancel จบกับเริ่ม stop; การ join stop อยู่ในแต่ละ ZideTransport instance
- “ห้าม unknown data keys” ใน robot boundary หมายถึงชื่อที่อยู่นอกชุดรวมของ engine เท่านั้น ปัจจุบันยอมรับ field ของ action อื่นที่อยู่ในชุดรวม ส่วน response ของ Go ยังยอมรับ unknown fields และบางกรณี null
- board.info ปัจจุบันตรวจว่ามี bytes ตอบ และ adapter ตรวจ simulated:false; ยังไม่มี parser ยืนยันชนิดบอร์ด/firmware จาก reply จึงไม่ใช่หลักฐานว่าเป็นหุ่นรุ่นที่รับรอง
- Comment ที่ว่า busy/cancelled ไม่เปลี่ยนหุ่นใน adapter กล่าวเกินหลักฐาน: cancelled อาจเกิดหลัง partial write ได้ การไม่เปลี่ยนเป็น lost จากสอง code นี้เพียงอย่างเดียวยังคงถูกต้อง
- predicted และ measured เป็นความหมายของ state/ผลอ่านใน frontend ยังไม่ใช่ field ใน engine envelope; st:"stopped" เป็น state ของ workflow หลังส่งคำขอ ไม่ใช่ผลวัด physical stop

## รายการเปลี่ยนที่เสนอให้ทบทวน

ข้อเสนอ: **breaking** รวมพฤติกรรมที่ caller อาจพึ่ง แม้ protocol ยังเป็น 1.0

| รายการ | ประเภท | ผลกระทบและขอบเขตเสนอ |
|---|---|---|
| C1 ตรวจ UTF-8/JSONL และ response ให้ครบ schema | **breaking** | Go manager ปฏิเสธ unknown fields/explicit null ที่เดิมหลุดผ่าน; กระทบ engines, fake process และ consumer ของ response ผิดรูปแบบ ดู IPC |
| C2 ตรวจ payload ตาม action ที่ Host boundary | **breaking** | ปฏิเสธ field ข้าม action และ native device command ที่ขาด explicit target/transport; คง default dry-run สำหรับ standalone engine และ alias servo+angle เดิม ดู payload |
| C3 Host สงวน admission ตลอด drain→stop | **breaking** | direct bridge caller จะได้ busy ระหว่างสงวน slot; stop/close/cancel ประสานงานเดียวกัน และ lost/เปลี่ยน target ล้าง uploaded session กระทบ Host/Labs ดู lifecycle |
| C4 RunV2 และ authorization ของ Host | **breaking** สำหรับ gate บน Run เดิม; **non-breaking** สำหรับเพิ่ม method | ใช้รูปผล/error ของ DES-001 เดิม; Run เก่าผ่าน gate เดียวกัน, cancel/stop recovery ใช้ได้ขณะ locked; ไม่ลบ method หรือเปลี่ยน engine error enum |
| C5 เพิ่ม Darwin adapters | **non-breaking** สำหรับ Windows wire contract | คง payload; จำกัด OS token ตาม discovery; เพิ่ม validation ของ Windows serial target เป็น **breaking** แยกจาก backend ใหม่ ดู platform |
| C6 provenance ของผลและคำอธิบาย cancellation | **non-breaking** เมื่อคง wire/state เดิม | แยก written/predicted/measured ใน consumer และติดป้าย simulated; ไม่เพิ่ม measured:true หรือเปลี่ยน enum โดยเงียบ |
| C7 fake bridge/process/transport ใน test harness | **non-breaking** | ใช้ dependency seams เดิม เฉพาะ tests; ไม่เปิด runtime selector ของ executable หรือ fake เป็น production fallback |

parser ตรวจ board reply แบบใหม่จะเปลี่ยนผล probe สำเร็จเดิม จัด **breaking** หากนำมาใช้ ต้องได้รูป reply จากทีมอุปกรณ์ก่อนออกข้อเสนอเจาะจง วันนี้ระบุเป็นช่องว่าง ไม่สมมติ grammar

## หลักฐานที่คนต้องตัดสินก่อน BE-010

ประตู G-ROBOT-CONTRACT คือการทบทวน breaking Host/IPC/robot contract ตาม [มติ 053 ข้อ 4 (เตรียมสัญญาและใช้ simulator)](../../shared/decisions/decisions-053.md) ผูกกับ BE-010 เท่านั้น ผู้มีอำนาจ contract ที่ผู้ใช้ระบุเป็นผู้ตัดสิน ไม่ใช่ arch

ชุดตัดสินต้องระบุไฟล์ review ทั้งเก้าฉบับพร้อม Rev, DES-001 Rev 1 และ DES-006 Rev 3, รายการ C1–C7 ที่รับ/ไม่รับ/ให้แก้พร้อมเหตุผล, consumer และ fixture ที่ต้องย้ายพร้อมกัน, ชื่อผู้ตัดสินและวันที่จริง หากเปลี่ยนเนื้อหาที่ตัดสินต้องชี้ revision ใหม่ การอนุมัตินี้ไม่ปิดประตูทดสอบหุ่นจริง

คำถามต่อผู้มีอำนาจ: ยอมรับ breaking C1–C4 และการตรวจ Windows serial target ใน C5 ตามขอบเขตที่ระบุหรือให้แก้ข้อใด? คำตอบปลดล็อกเฉพาะ BE-010; Labs ทำต่อบน fake ได้ ส่วนรุ่นบอร์ด/firmware/calibration/stop latency/emergency และการอนุญาตสั่งจริงยังให้ผู้ใช้กับทีมอุปกรณ์ยืนยันตามมติ 038

## หลักฐาน

- โค้ดใต้ C:/src/schoolbright/target/school-bot ตรวจแบบอ่านอย่างเดียววันที่ 2026-11-03; HEAD f77659fb1666b7fdf0b8af775f332e470c252455 เป็นฐานอ้างอิง หลักฐานไฟล์ที่อ่านอยู่ในเอกสารย่อย ไม่แทน uncommitted files
- app/internal/engine/manager.go:115–164,207–240; app/frontend/src/modes/robot-control/engineAdapter.ts:77–127; engines/zide/src/request.cpp:45–69,111–116
- knowledge/school-bot/build/plan/tasks-001.json:266–272 นิยาม close_evidence; card SA-003 และ canonical ยังไม่มี ac_ids งานนี้ไม่แก้ plan
- อ่าน source/เอกสาร ไม่รัน target tests; ตาราง simulator เป็น expected ไม่ใช่ runtime/hardware PASS

## ข้อเสนอ ac_ids ให้ผูก SA-003

เสนอ 17 AC เดิมตามรายการใน [เกณฑ์และข้อเสนอ AC](des-006-review-acceptance.md#ข้อเสนอ-ac_ids-ให้ผูก-sa-003) ให้นายช่างพิจารณาตรึง ไม่เพิ่ม AC และไม่เปลี่ยน oracle ของใบงานนี้
