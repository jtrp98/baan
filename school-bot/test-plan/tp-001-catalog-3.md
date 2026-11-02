# TP-001 — สารบัญ TP001-033–TP001-048

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [แผน TP-001](tp-001.md) AC หมายถึง Acceptance Criteria หรือเกณฑ์ตรวจรับ; ความหมาย AC อยู่ใน case ที่ลิงก์และ [ตาราง AC](traceability-001.md) ทุกผลจริงยัง NOT_RUN

| ID | ตรวจอะไร | AC ที่ครอบ | ไฟล์ |
|---|---|---|---|
| TP001-033 | ส่งท่า | [AC-016-01 (เมื่อ disconnected หรือปลดแรงบิด…)](../requirement/req-016.md), [AC-016-02 (เมื่อจำลองการส่งล้มเหลว ภาพไม่เริ่มเคลื่อนไปตามท่าราวกับส่งสำเร็จ…)](../requirement/req-016.md), [AC-016-03 (ปรับข้อต่อถี่ผ่าน test bridge แล้ว trace มีคำสั่งทำงานครั้งละหนึ่งรายการ)](../requirement/req-016.md) | [รายละเอียด](tp-001-cases-robot.md#tp001-033) |
| TP001-034 | เล่นลำดับ | [AC-018-01 (ให้สองท่าและสองรอบผ่าน test bridge แล้วพบการส่งตามลำดับเดิมครบสี่ท่า)](../requirement/req-018.md), [AC-018-02 (เมื่อการส่งท่าแรกผิดพลาด ไม่มีการส่งท่าที่สองต่อ และผู้ใช้เห็นข้อผิดพลาด)](../requirement/req-018.md), [AC-018-03 (เมื่อส่งครบและเวลาครบ แอปแสดงจบการส่งลำดับ…)](../requirement/req-018.md) | [รายละเอียด](tp-001-cases-robot.md#tp001-034) |
| TP001-035 | upload | [AC-019-01 (อัปโหลดห้าท่าผ่าน test bridge แล้วพบสองคำขอ ขนาดสี่และหนึ่งท่า ตามลำดับ)](../requirement/req-019.md), [AC-019-02 (ระหว่างรอคำตอบ progress ยังไม่เพิ่ม)](../requirement/req-019.md), [AC-019-03 (เมื่อชุดแรกผิดพลาด ไม่มีชุดที่สอง และไม่มีผลยืนยันว่าข้อมูลครบหรือ…)](../requirement/req-019.md) | [รายละเอียด](tp-001-cases-robot.md#tp001-035) |
| TP001-036 | เล่นจากบอร์ด | [AC-020-01 (เมื่อยังไม่มีชุดอัปโหลดใน session การเลือกเล่นจากบอร์ดไม่ส่งคำสั่งเริ่ม)](../requirement/req-020.md), [AC-020-02 (เมื่อเลือกวนไม่สิ้นสุด ระบบไม่ส่ง group.run และแจ้งให้ระบุจำนวนรอบ)](../requirement/req-020.md), [AC-020-03 (เมื่อ test bridge รับคำสั่งเริ่มสำเร็จ…)](../requirement/req-020.md) | [รายละเอียด](tp-001-cases-robot-2.md#tp001-036) |
| TP001-037 | กด stop | [AC-021-01 (ระหว่างเล่นผ่าน test bridge เมื่อกดหยุด พบการยกเลิกและจบงานค้างก่อนคำขอ…)](../requirement/req-021.md), [AC-021-02 (หลังหยุดแล้วปล่อยคำตอบเก่าหรือ timer ค้าง ไม่มีคำสั่งท่าถัดไปออกไป)](../requirement/req-021.md), [AC-021-03 (เมื่อส่ง stop ล้มเหลว ผู้ใช้เห็นข้อผิดพลาดและไม่มีข้อความยืนยันว่าหุ่นหย…)](../requirement/req-021.md), [AC-021-04 (เมื่อออกจาก native workspace ที่เชื่อมต่ออยู่ พบคำขอ stop…)](../requirement/req-021.md) | [รายละเอียด](tp-001-cases-robot-2.md#tp001-037) |
| TP001-038 | อ่าน servo ครั้งเดียวและครบหก แล้วสร้างท่า | [AC-022-01 (เมื่อ test device ตอบ PWM ที่ถูกต้องของ ID ที่ขอ…)](../requirement/req-022.md), [AC-022-02 (เมื่ออ่านครบหกข้อแล้วสร้างท่าใหม่ ท่านั้นมีค่าจากคำตอบทั้งหกข้อ)](../requirement/req-022.md), [AC-022-03 (เมื่อข้อใดข้อหนึ่งไม่ตอบ ตอบผิด ID หรือเกินช่วง…)](../requirement/req-022.md) | [รายละเอียด](tp-001-cases-robot-2.md#tp001-038) |
| TP001-039 | ปลด/ล็อก | [AC-023-01 (กดปลดและล็อกผ่าน test bridge แล้วพบคำสั่ง enabled=false และ enabled=true…)](../requirement/req-023.md), [AC-023-02 (หลังปลดสำเร็จ การส่งท่า เล่น และอัปโหลดถูกกันไว้พร้อมข้อความให้ล็อกก่อน)](../requirement/req-023.md), [AC-023-03 (ขอ stop ขณะอยู่ในสถานะปลดแรงบิด แล้วพบคำขอ stop ก่อนคำขอล็อก)](../requirement/req-023.md) | [รายละเอียด](tp-001-cases-robot-2.md#tp001-039) |
| TP001-040 | หายขณะ idle | [AC-024-01 (จำลองอุปกรณ์หายจาก discovery ขณะ idle แล้วสถานะเปลี่ยนเป็น lost…)](../requirement/req-024.md), [AC-024-02 (จำลอง transport error ระหว่างส่งท่าแล้วเห็นข้อผิดพลาดและไม่มีการส่งท่าเด…)](../requirement/req-024.md), [AC-024-03 (เชื่อมต่อใหม่หลัง lost แล้วไม่มีคำสั่งเคลื่อนไหวจนผู้ใช้สั่ง)](../requirement/req-024.md) | [รายละเอียด](tp-001-cases-robot-3.md#tp001-040) |
| TP001-041 | ตามขั้นตอนที่ผู้อนุญาตกำหนด: probe→connect→คำสั่งควบคุมที่อนุญาตผ | [AC-031-05 (บน Windows 11 25H2 x64 กับหุ่นที่ผ่านการยืนยันรุ่นแล้ว…)](../requirement/req-031.md) | [รายละเอียด](tp-001-cases-robot-3.md#tp001-041) |
| TP001-042 | เช่น TP001-041 จากแอปที่ติดตั้ง | AC-031-05 | [รายละเอียด](tp-001-cases-robot-3.md#tp001-042) |
| TP001-043 | probe→connect→ส่งคำสั่งตามที่อนุญาต | [AC-032-02 (บน macOS 15+ ทั้ง Intel และ Apple Silicon…)](../requirement/req-032.md) | [รายละเอียด](tp-001-cases-robot-3.md#tp001-043) |
| TP001-044 | เช่น TP001-043 จากแอปที่ติดตั้ง Intel และ ARM | AC-032-02 | [รายละเอียด](tp-001-cases-robot-3.md#tp001-044) |
| TP001-045 | unplug/replug ขณะ idle และส่งท่า | [AC-014-03 (ใช้ test device ที่ไม่ตอบ probe แล้วไม่เข้าสถานะ connected)](../requirement/req-014.md), AC-019-03, AC-021-01, AC-021-03, AC-024-01, AC-024-02 | [รายละเอียด](tp-001-cases-robot-3.md#tp001-045) |
| TP001-046 | POST /v2/admin/releases | [AC-029-01 (สร้าง metadata ถูกต้องแล้ว published=false)](../requirement/req-029.md), [AC-029-02 (Version ผิดรูปแบบ, platform ไม่รองรับ, URL ไม่ใช่ HTTPS, hash ผิด หรือ…)](../requirement/req-029.md) | [รายละเอียด](tp-001-cases-release-model.md#tp001-046) |
| TP001-047 | GET /updates/check จาก version ต่าง ๆ | [AC-029-03 (Update check คืนเฉพาะ published release ใหม่สุดที่ channel/platform…)](../requirement/req-029.md), [AC-030-01 (เมื่อไม่มี published release ใหม่กว่า ผลตรวจมี available=false,…)](../requirement/req-030.md) | [รายละเอียด](tp-001-cases-release-model.md#tp001-047) |
| TP001-048 | กดตรวจอัปเดต | [AC-030-02 (เมื่อมี release ที่เข้าเงื่อนไข ผู้ใช้เห็น metadata…)](../requirement/req-030.md), [AC-030-03 (เมื่อ API เข้าไม่ได้ การตรวจแสดงข้อผิดพลาดและผู้ใช้กลับไปใช้งาน local…)](../requirement/req-030.md) | [รายละเอียด](tp-001-cases-release-model.md#tp001-048) |


## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ
