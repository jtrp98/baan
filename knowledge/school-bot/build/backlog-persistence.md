# SchoolBot — Backlog ความคงทนของข้อมูล

> แก้ล่าสุด 2026-11-03 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (เพิ่ม BL-007)

กลับ [ทะเบียน backlog](backlog.md)

<a id="bl-006"></a>

### BL-006 — ข้อเสนอจากการตรวจรับ [BE-002](plan/index-foundation.md) (เชื่อมฐานข้อมูล) ที่อยู่นอกเกณฑ์ตรวจรับส่วนที่เริ่มไว้

- วันที่: 2026-11-02; ที่มา: ผลตรวจรับงานเชื่อมฐานข้อมูล ดูหลักฐานท้ายไฟล์; ผู้บันทึก: นายช่าง
- รายละเอียด: (1) `FileSchoolBotBackingStore` ไม่อ่านรูปแบบสองไฟล์เดิม (`projects.json`/`project_revisions.json`) — ปัจจุบันไม่มีข้อมูลเดิมตาม [มติ 051 (commit Project และ Revision เป็นหน่วยเดียว)](../shared/decisions/decisions-051.md) แต่ต้องกำหนดก่อนเปิดใช้ File store ที่ใด (2) Project/Revision โหลดจาก snapshot สองครั้ง — หลาย instance อาจได้คนละรุ่น (กลุ่ม lost-update หลาย instance เดิม) (3) ไม่มี flush ลง disk ก่อน replace — kill/ไฟดับยังไม่พิสูจน์ (4) ETag อิง ticks ของ UpdateDate — สอง update ใน tick เดียวได้ ETag ซ้ำ (5) เคส extra เดิมยังตก: TwoInstancesDoNotLoseAcknowledgedLicense · SessionProfileCannotAuthorizeAnotherProfile (6) memory store ส่วน License/Session ยังใช้ `Clear()` แล้วเติมทีละรายการ
- ขอบเขต: ไม่เปิด task ใหม่ · ข้อ 2/3/5 เป็นเงื่อนไขก่อนต่อ DB จริง/production ([DBA-003 (รวบรวมหลักฐานฐานข้อมูลหลัก)](plan/index-foundation.md)/G-CORE) · ข้อ 4 ส่ง arch พิจารณาตอนแก้สัญญา ETag ครั้งถัดไป

<a id="bl-007"></a>

### BL-007 — approval_ref ที่ไม่ใช่ข้อความได้ error code ผิด

- วันที่: 2026-11-03; ที่มา: ผลตรวจหลักสูตรกลาง [BE-027](plan/extension/index.md); ความสำคัญ: Minor; ผู้บันทึก: นายช่าง
- รายละเอียด: ผู้อนุมัติส่วนกลางเรียก `POST /v2/admin/curricula/{id}/publish` พร้อม ETag และ Idempotency-Key ถูกต้อง แต่ส่ง `{"approval_ref":123}` (ตัวเลขแทนข้อความ) ได้ `400 INVALID_REQUEST` จาก middleware แปลง JSON แทน `400 INVALID_INPUT` ตามแผนทดสอบ TP001-061 — ข้อมูลบนดิสก์ไม่เปลี่ยน ไม่มีผลสำเร็จหลุด
- ผลต่อ AC: ไม่บล็อก AC-044-03 (เผยแพร่ไม่ได้และข้อมูลไม่เปลี่ยนถูกต้อง) · test อิสระ `NonStringApprovalIsRejectedBeforeChangingFileSnapshot` ยังตกใน target จนกว่าจะแก้
- ขอบเขต: ไม่เปิด task ใหม่เอง · ควรแก้พร้อมงานที่แตะการแปลง error ของ HTTP ครั้งถัดไป

## หลักฐาน

- BL-007: check-096-B (memory), check run sUU6Li (round-096-B.md ใน snapshot-B)
- BL-006: check-094-wave2-gate-004 (memory), check run yneac0; ข้อเสนออยู่นอกเกณฑ์เดิมของส่วน S1 และเกิดจากการแก้ BE-002 ครั้งที่ 3
