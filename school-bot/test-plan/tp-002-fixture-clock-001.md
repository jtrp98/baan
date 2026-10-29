# TP-002 — รายละเอียด Clock fixtures

วันที่ 2026-10-29 · inspect · ส่วนต่อของ [แผนหลัก](tp-002-fixture-plan-001.md) · ทุก actual=NOT_RUN

## FX-01 fake clock + monotonic rollback (offline window / TTL / replay window)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-01a | wall clock แช่และย้อน + monotonic เดินต่อ + anchor {server UTC ล่าสุด, wall, max effective} | License offline 3 วัน · TP001-003/004/010 · AC-034-03/04, AC-035-05 | exp=min(checked_at+259200,license_exp); ขอบ exp−1s/exp/exp+1s; ย้อน→CLOCK_UNTRUSTED ต้อง online; monotonic ไม่ลด high-water; เปิดซ้ำไม่เลื่อน exp; replay คืน exp เดิมไม่ใช่ online check ใหม่ |
| FX-01b | server-side fake clock ขับ ReplayUntil (fixture ตั้ง TTL=900 วินาทีชัดเจน — อนุมัติตาม decisions-046) | create-license TTL replay · TP001-007 · AC-027-02/03 | ทดสอบที่ `ReplayUntil−1s` คืน key เดิม (ตรวจสิทธิ์+license ไม่ revoke); ที่/หลัง `ReplayUntil`→409 IDEMPOTENCY_EXPIRED+details.resource_id แม้ purge ยังไม่รัน (สัญญากำหนดเพียง ReplayUntil≤CompletedAt+900s จึงทดสอบรอบ ReplayUntil ไม่ใช่ offset จาก CompletedAt — แก้ตาม check 060f); retry ไม่ต่อ TTL; ResultCipher+ResultKeyId ล้างคู่กัน tombstone คง |
| FX-01c | fake clock พ้น window 24 ชม. ของ idempotency ทั่วไป | import/recheck replay · TP001-028/030/078 · AC-041-04, AC-042-05 | พ้น window→409 IDEMPOTENCY_EXPIRED+resource_id; Host GET ยืนยันไม่ POST ใหม่; snapshot freeze ไม่อ่านเนื้อหาที่แก้ภายหลัง |
| FX-01d | API stub คืน network unavailable ที่ exp−1s/exp/exp+1s; cache เดิม checked_at=T | TP001-003 · AC-034-03/04 | ก่อน exp ยังใช้สิทธิ์เดิม; ที่/หลัง exp ล็อก+แจ้งต่ออินเทอร์เน็ต; checked_at/exp ไม่เปลี่ยนเพราะเปิดซ้ำหรือผลตรวจล้มเหลว |
| FX-01e | A มี cache exp=E; fake binding ย้ายไป B ขณะ A offline ที่ T+1d; เปิด A ซ้ำที่ E−1s/E/E+1s | TP001-010 · AC-035-05 | A ใช้ได้ก่อน E และไม่ได้ที่/หลัง E; เก็บ E เดิมข้าม restart ไม่เริ่ม 3 วันจากเวลาย้าย; online stub ของ A คืน revoked แล้วไม่ใช้ cache ต่อ |

วิธี: inject clock interface (wall กับ monotonic แยกคู่ + จุด persist anchor) ที่ host/API ใช้ — ห้ามเปลี่ยนเวลาเครื่องจริง; เก็บ log เวลาทุกการอ่านค่าเป็น E-TRACE

## FX-02 trash 30 วัน: boundary · ปิดแอปข้ามอายุ · rollback · race

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-02a | fake wall ที่ deleted_at+29d23h59m59s / +30d / +30d+1s ขณะแอปเปิด | TP001-026 · AC-040-04/05/06 | now>=expires_at→TRASH_EXPIRED กู้ไม่ได้แม้ unlink ยังไม่สำเร็จ; ก่อนนั้น restore คืน UUID เดิม+counter ถัดไป; timer 60 วินาที (สมมติฐาน) + sweep ก่อนทุก operation |
| FX-02b | ปิดแอป (ไม่มี process) → เลื่อน wall ข้าม expires_at → เปิดใหม่ | TP001-026 · AC-040-06 | ไม่มี background service; เวลานับจาก absolute expires_at; เปิดครั้งถัดไป sweep ก่อน list/restore/export; งานปกติ/ประวัติ/tombstone ไม่ถูกลบ |
| FX-02c | ย้อน wall หลังลบ / VM snapshot | TP001-026 · BR-040-04 | ตรวจ rollback ตอน start/resume ก่อนเลื่อน anchor; ไม่น่าเชื่อถือ→CLOCK_UNTRUSTED หยุด restore+irreversible purge จน online ยืนยัน; ไม่ตั้ง deleted_at ใหม่ ไม่เพิ่มอายุ |
| FX-02d | restore ∥ sweep พร้อมกัน; inject unlink fail | TP001-026 · AC-040-05/06 | ผลเดียวชนะตามขอบเวลา; unlink fail→STORE_UNAVAILABLE และ retry ได้ แต่ list ต้องไม่แสดงว่ากู้ได้ |

วิธี: fake clock ของ FX-01 + fake local store (inject failpoint ที่ unlink/rename) · ห้ามใช้เวลาที่ UI ส่งเป็นความจริง (host สร้าง deleted_at/expires_at เอง)

## Setup / trigger / สิ่งที่วัด

- ระดับ unit สำหรับฟังก์ชันเวลา และ integration แบบ fake ใน PF-HOST สำหรับ admission/restart/timer; ไม่เปลี่ยน system clock
- FX-01a/d: เริ่ม T เป็น synthetic UTC จากการตรวจสำเร็จ; แยก license_exp>T+3d และ license_exp<T+3d; effective exp ตาม TP001-003. reset ทุก variation แล้วเดินเวลา exp−1s/exp/exp+1s; ทดสอบ Guest/Login ทั้ง 3 modes ผ่านหน้าเข้าและ direct bridge
- เปิด host ซ้ำจาก fake credential/anchor store เดิมที่แต่ละจุด; วัด checked_at/exp ก่อนและหลัง, allow/deny, spawn count และข้อความให้ต่ออินเทอร์เน็ต. ขณะ busy ข้าม exp ให้ FX-03a ปล่อย callback/timer หลัง admission ปิด; next movement=0
- FX-01e: cache A และ binding state ของ fake server แยกกัน; record E ก่อนย้ายและหลังย้าย/เปิดซ้ำ; spy ว่า A offline ไม่ได้ online validation สำเร็จใหม่. B ไม่ได้เขียน cache A
- FX-02a–d: fake local store เริ่มงาน live 1 รายการและ trash 1 รายการ; บันทึก UUID/deleted_at/expires_at. ขับ clock ไปก่อน/ตรง/หลัง 30 วันและ restart โดยไม่มี process ระหว่างนั้น; เก็บรายการกู้ได้/ผล restore/purge/ไฟล์คงเหลือ. barrier ให้ restore และ sweep ชนกัน; inject unlink fail เฉพาะรายการ trash
- แยก observation clock ของการรันออกจากค่าเวลาปลอม; E-TRACE บันทึก wall/monotonic/anchor ทุกจุด, restart, operation และจำนวน dispatch; ก่อน/หลังเวลาไม่น่าเชื่อถือเก็บ anchor เพื่อพิสูจน์ว่าไม่ได้ต่ออายุเงียบ
- FX-01b/c และ FX-02 เป็น fixtures สนับสนุนเดิมนอก 6 AC ของ pack; clock 30 วันไม่ใช่อายุ license. ไม่ยก AC-040 หรือ TTL/replay ขึ้นเป็นเส้นชัยใหม่


## Change Log
- 2026-10-29 — ใบงาน093: แยกรายละเอียดจากแผนหลัก คง IDs เดิม และเติม setup/trigger/สิ่งที่วัด; fake เท่านั้น ไม่มี test execution
