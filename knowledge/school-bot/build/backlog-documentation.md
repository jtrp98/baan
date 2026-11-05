# SchoolBot — Backlog งานเอกสารและการทดสอบ

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

กลับ [ทะเบียน backlog](backlog.md)

<a id="bl-001"></a>

### BL-001 — แก้คำอธิบายและตรวจยอด constraints ในเอกสาร

- วันที่: 2026-10-23
- ที่มา: vault review-006 advisory V012-09 (รายงานที่ระบุท้ายไฟล์) และข้อจำกัดที่บันทึกใน รายงานที่ระบุท้ายไฟล์; ผู้เสนอ: vault; ผู้บันทึก: gm
- ความสำคัญ: advisory ไม่บล็อก AC จากตัวเลขเอกสารเพียงอย่างเดียว
- งานติดตาม: arch แก้คำอธิบาย `schema-notes.md`; vault ตรวจยอดและเพิ่มคำชี้แจงใน รายงานที่ระบุท้ายไฟล์ โดยรักษาประวัติเดิม อ้างผลนับปัจจุบันจาก review-006: 32 ตาราง/450 ฟิลด์/40 FK/24 UQ/80 CHECK/13 unique indexes/0 non-unique indexes พร้อมตรวจความตรงกันอีกครั้งตอนทบทวนสัญญาก่อน implementation
- ขอบเขต: งานเอกสารและตรวจยอดเท่านั้น ไม่เพิ่ม task หรือ frozen release feature ไม่เปลี่ยนสถานะตรวจรับหรือปิด gates และ finding นี้ไม่อนุญาตให้รัน SQL

<a id="bl-005"></a>

### BL-005 — กรณีทดสอบ logout และเอกสาร Gateway ตามมติ 050

- วันที่: 2026-10-28; ผู้บันทึก: นายช่าง; ผู้รับผิดชอบ: inspect/arch
- ที่มา: งาน logout และการทบทวนเอกสาร Gateway ดูหลักฐานท้ายไฟล์
- สถานะวันนี้: ปิดแล้วทั้งสองข้อ โดยไม่เพิ่ม feature/scope
- ข้อ (1): [AC-036-06 (logout และความล้มเหลวอย่างปลอดภัย)](../modules/app-shell/shared/requirements/req-036.md) เคยเพิ่มแล้วแต่ test-plan ครอบ 186 AC/81 cases จึงต้องเพิ่ม case/traceability ก่อนตรวจรับ logout ปัจจุบัน [ส่วนเพิ่มแผนทดสอบ logout](test-plan/tp-001-amendment-005.md) เพิ่ม TP001-082 ครอบแล้ว รวม 82 cases/187 AC โดย actual ยัง NOT_RUN
- ข้อ (2): เอกสาร Gateway เคยใช้ minimal endpoint/middleware และ pointer ชั่วคราว ปัจจุบันแก้ครบหกไฟล์ตาม [มติ 050 (Gateway ใช้ controller convention เดิม)](../shared/decisions/decisions-050.md): gateway-integration Rev5, gRPC contract Rev2, logout contract Rev1 (ใส่เลขครั้งแรก), negative boundary Rev2 (แยก directadapter ฝั่ง SchoolBot gRPC service จาก Gateway entry), [controller entry](design/gateway-controller-entry-001.md) Rev2 และ design/index Rev6 ซึ่งแสดงสถานะปัจจุบันแล้ว ผลค้นหาหลังแก้เหลือประวัติหรือการอ้าง Gateway Rev3 เป็นฐานมติ transport ที่ยังถูก

## หลักฐาน

- BL-001: `db/review-006.md` (memory); `planning/arch-review-001.md` (memory); `db/review-005.md` (memory); review-006 advisory V012-09 และ planning/arch-review-001.md (memory)
- BL-005: planning/task-092.md (memory); spec run 5OJQP0, arch run vMHqG4 และ arch Codex T1 run oJUppA; รายการตำแหน่งแก้ในรายงาน arch E; ตรวจเอกสารครบ 6 ไฟล์ 2026-10-28
