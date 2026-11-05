# TP-002 — รายละเอียด Clock fixtures

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [แผน TP-002](tp-002-fixture-plan-001.md) ทุก actual เป็น NOT_RUN ใช้ PF (Test Profile: สภาพแวดล้อมตรวจ) และรหัสหลักฐาน E ตาม [TP-001](tp-001.md#profiles)

## FX-01 fake clock + monotonic rollback (offline window / TTL / replay window)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-01a | wall clock แช่และย้อน + monotonic เดินต่อ + anchor {server UTC ล่าสุด, wall, max effective} | License offline 3 วัน · TP001-003/004/010 · [AC-034-03 (ออฟไลน์ภายใน 3 วันจากตรวจสำเร็จล่าสุดใช้งานได้)](../../modules/app-shell/shared/requirements/req-034.md)/04, [AC-035-05 (A ที่ออฟไลน์ยังใช้ได้ก่อนสิทธิ์เดิมหมด แต่ครบกำหนดแล้วเข้าโหมดหลักไม่ได้)](../../modules/app-shell/shared/requirements/req-035.md) | exp=min(checked_at+259200,license_exp); ขอบ exp−1s/exp/exp+1s; ย้อน→CLOCK_UNTRUSTED ต้อง online; monotonic ไม่ลด high-water; เปิดซ้ำไม่เลื่อน exp; replay คืน exp เดิมไม่ใช่ online check ใหม่ |
| FX-01b | server-side fake clock ขับ ReplayUntil (fixture ตั้ง TTL=900 วินาทีชัดเจน — อนุมัติตาม [มติ 046 (Gateway dev และระยะเวลา replay ของ License)](../../shared/decisions/decisions-046.md)) | create-license TTL replay · TP001-007 · [AC-027-02 (ผู้เรียกที่มี staff session และ StaffRole ที่มีสิทธิ์…)](../../modules/app-shell/shared/requirements/req-027.md)/03 | ทดสอบที่ `ReplayUntil−1s` คืน key เดิม (ตรวจสิทธิ์+license ไม่ revoke); ที่/หลัง `ReplayUntil`→409 IDEMPOTENCY_EXPIRED+details.resource_id แม้ purge ยังไม่รัน (สัญญากำหนดเพียง ReplayUntil≤CompletedAt+900s จึงทดสอบรอบ ReplayUntil ไม่ใช่ offset จาก CompletedAt ); retry ไม่ต่อ TTL; ResultCipher+ResultKeyId ล้างคู่กัน tombstone คง |
| FX-01c | fake clock พ้น window 24 ชม. ของ idempotency ทั่วไป | import/recheck replay · TP001-028/030/078 · [AC-041-04 (นำเข้างานเดิมซ้ำในบัญชีเดิม รวม retry หลังคำตอบสูญหาย/เปิดแอปใหม่…)](../../modules/my-work/shared/requirements/req-041.md), [AC-042-05 (ย้ายประวัติ Arm แล้วแสดงรอครูตรวจ ไม่นับผ่านก่อนครูที่มีสิทธิ์บันทึกผล)](../../modules/my-work/shared/requirements/req-042.md) | พ้น window→409 IDEMPOTENCY_EXPIRED+resource_id; Host GET ยืนยันไม่ POST ใหม่; snapshot freeze ไม่อ่านเนื้อหาที่แก้ภายหลัง |
| FX-01d | API stub คืน network unavailable ที่ exp−1s/exp/exp+1s; cache เดิม checked_at=T | TP001-003 · AC-034-03/04 | ก่อน exp ยังใช้สิทธิ์เดิม; ที่/หลัง exp ล็อก+แจ้งต่ออินเทอร์เน็ต; checked_at/exp ไม่เปลี่ยนเพราะเปิดซ้ำหรือผลตรวจล้มเหลว |
| FX-01e | A มี cache exp=E; fake binding ย้ายไป B ขณะ A offline ที่ T+1d; เปิด A ซ้ำที่ E−1s/E/E+1s | TP001-010 · AC-035-05 | A ใช้ได้ก่อน E และไม่ได้ที่/หลัง E; เก็บ E เดิมข้าม restart ไม่เริ่ม 3 วันจากเวลาย้าย; online stub ของ A คืน revoked แล้วไม่ใช้ cache ต่อ |

วิธี: inject clock interface (wall กับ monotonic แยกคู่ + จุด persist anchor) ที่ host/API ใช้ — ห้ามเปลี่ยนเวลาเครื่องจริง; เก็บ log เวลาทุกการอ่านค่าเป็น E-TRACE

## FX-02 trash 30 วัน: boundary · ปิดแอปข้ามอายุ · rollback · race

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-02a | fake wall ที่ deleted_at+29d23h59m59s / +30d / +30d+1s ขณะแอปเปิด | TP001-026 · [AC-040-04 (สั่งลบงานแล้วงานออกจากรายการปกติและอยู่ในถังขยะ ไม่แสดงว่าลบถาวรแล้ว)](../../modules/my-work/shared/requirements/req-040.md)/05/06 | now>=expires_at→TRASH_EXPIRED กู้ไม่ได้แม้ unlink ยังไม่สำเร็จ; ก่อนนั้น restore คืน UUID เดิม+counter ถัดไป; timer 60 วินาที  + sweep ก่อนทุก operation |
| FX-02b | ปิดแอป (ไม่มี process) → เลื่อน wall ข้าม expires_at → เปิดใหม่ | TP001-026 · [AC-040-06 (เปิดระบบโดยมีงานในถังขยะครบ 30 วันแล้ว…)](../../modules/my-work/shared/requirements/req-040.md) | ไม่มี background service; เวลานับจาก absolute expires_at; เปิดครั้งถัดไป sweep ก่อน list/restore/export; งานปกติ/ประวัติ/tombstone ไม่ถูกลบ |
| FX-02c | ย้อน wall หลังลบ / VM snapshot | TP001-026 · [BR-040-04 (ต้องมี License ตาม REQ-034)](../../modules/my-work/shared/requirements/req-040.md) | ตรวจ rollback ตอน start/resume ก่อนเลื่อน anchor; ไม่น่าเชื่อถือ→CLOCK_UNTRUSTED หยุด restore+irreversible purge จน online ยืนยัน; ไม่ตั้ง deleted_at ใหม่ ไม่เพิ่มอายุ |
| FX-02d | restore ∥ sweep พร้อมกัน; inject unlink fail | TP001-026 · [AC-040-05 (กู้คืนงานก่อนครบ 30 วันนับจากสั่งลบ แล้วเปิดได้โหมด/เนื้อหาเดิม)](../../modules/my-work/shared/requirements/req-040.md)/06 | ผลเดียวชนะตามขอบเวลา; unlink fail→STORE_UNAVAILABLE และ retry ได้ แต่ list ต้องไม่แสดงว่ากู้ได้ |

วิธี: fake clock ของ FX-01 + fake local store (inject failpoint ที่ unlink/rename) · ห้ามใช้เวลาที่ UI ส่งเป็นความจริง (host สร้าง deleted_at/expires_at เอง)

[การเตรียม การกระตุ้นเหตุการณ์ และสิ่งที่วัด](tp-002-fixture-clock-001-setup.md)


## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · REQ = Requirement หรือข้อกำหนด · BR = Business Rule หรือกฎธุรกิจ · TTL = Time to Live หรืออายุที่ใช้งานได้ · UTC = Coordinated Universal Time


## ยังไม่ยืนยัน

trash sweep timer 60 วินาทีและ poll 3000 ms/debounce 0 ยังเป็นสมมติฐาน ให้ arch/เจ้าของสัญญายืนยันก่อน runtime; TTL License 15 นาทีได้รับอนุมัติตามมติ 046 แล้ว
