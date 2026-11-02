# DES-001 — Desktop host และ Inter-Process Communication (IPC) — เกณฑ์ตรวจ

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-001 — Desktop host และ IPC](des-001.md)

## เกณฑ์ตรวจ

- [AC-009-01 (เริ่มแอปโดยไม่เคยใส่ License แล้วเข้าใช้งาน Block Lab, Arm Lab และ Code Lab ไม่ได้ และมีทางให้กรอก License)](../requirement/req-009.md) และ [AC-009-02 (เลือก Guest หรือ Login โดยยังไม่มี License แล้วไม่สามารถข้ามข้อกำหนด License เพื่อเข้าใช้โหมดหลักได้)](../requirement/req-009.md) เรียก bridge ตรงโดยไม่มีสิทธิ์ต้องไม่ dispatch
- [AC-012-02 (เมื่อเลือก Save แล้วออกและจำลอง storage ล้มเหลว หน้ายังไม่ออกและมีข้อความบันทึกล้มเหลว)](../requirement/req-012.md) และ [AC-012-03 (เมื่อจำลอง close guard ล้มเหลว หน้าต่างยังเปิดและแสดงเหตุผลให้ผู้ใช้เห็น)](../requirement/req-012.md) ล้มเหลวแล้วไม่ออก
- [AC-013-01 (เปิด browser โดยไม่มี `preview=1` และไม่มี bridge แล้วพบข้อผิดพลาด native bridge แทนผลสำเร็จจำลอง)](../requirement/req-013.md) ไม่ fallback mock
- [AC-021-01 (ระหว่างเล่นผ่าน test bridge เมื่อกดหยุด พบการยกเลิกและจบงานค้างก่อนคำขอ stop)](../requirement/req-021.md) และ [AC-021-02 (หลังหยุดแล้วปล่อยคำตอบเก่าหรือ timer ค้าง ไม่มีคำสั่งท่าถัดไปออกไป)](../requirement/req-021.md) stop กัน late callback และ interleaving ได้
- ตรวจ bounds/unknown fields/mismatched request_id ด้วย fake process โดยไม่สั่ง hardware
