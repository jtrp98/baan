# SchoolBot — Backlog ความคงทนของข้อมูล

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

กลับ [ทะเบียน backlog](backlog.md)

<a id="bl-006"></a>

### BL-006 — ข้อเสนอจากการตรวจรับ [BE-002](plan/index-foundation.md) (เชื่อมฐานข้อมูล) ที่อยู่นอกเกณฑ์ตรวจรับส่วนที่เริ่มไว้

- วันที่: 2026-11-02; ที่มา: ผลตรวจรับงานเชื่อมฐานข้อมูล ดูหลักฐานท้ายไฟล์; ผู้บันทึก: นายช่าง
- รายละเอียด: (1) `FileSchoolBotBackingStore` ไม่อ่านรูปแบบสองไฟล์เดิม (`projects.json`/`project_revisions.json`) — ปัจจุบันไม่มีข้อมูลเดิมตาม [มติ 051 (commit Project และ Revision เป็นหน่วยเดียว)](../shared/decisions/decisions-051.md) แต่ต้องกำหนดก่อนเปิดใช้ File store ที่ใด (2) Project/Revision โหลดจาก snapshot สองครั้ง — หลาย instance อาจได้คนละรุ่น (กลุ่ม lost-update หลาย instance เดิม) (3) ไม่มี flush ลง disk ก่อน replace — kill/ไฟดับยังไม่พิสูจน์ (4) ETag อิง ticks ของ UpdateDate — สอง update ใน tick เดียวได้ ETag ซ้ำ (5) เคส extra เดิมยังตก: TwoInstancesDoNotLoseAcknowledgedLicense · SessionProfileCannotAuthorizeAnotherProfile (6) memory store ส่วน License/Session ยังใช้ `Clear()` แล้วเติมทีละรายการ
- ขอบเขต: ไม่เปิด task ใหม่ · ข้อ 2/3/5 เป็นเงื่อนไขก่อนต่อ DB จริง/production ([DBA-003 (รวบรวมหลักฐานฐานข้อมูลหลัก)](plan/index-foundation.md)/G-CORE) · ข้อ 4 ส่ง arch พิจารณาตอนแก้สัญญา ETag ครั้งถัดไป

## หลักฐาน

- BL-006: check-094-wave2-gate-004 (memory), check run yneac0; ข้อเสนออยู่นอกเกณฑ์เดิมของส่วน S1 และเกิดจากการแก้ BE-002 ครั้งที่ 3
