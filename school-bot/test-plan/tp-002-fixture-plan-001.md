# TP-002 — แผน failure/race fixtures — Rev2

วันที่ 2026-10-24 · รันโดย นายช่าง solo (subagent role inspect) · สถานะเอกสารอยู่ที่ [index](index.md)
อ้างอิง: [TP-002](../plan/TP-002.md) (bridge/API/clock fixtures · Acceptance "late callback/drain/transport/DB failure/lease boundary จำลองได้ ไม่สั่งหุ่น"), [TP-001 + Amendment002](tp-001.md), [ผลตรวจ060a](../design/gap-sync-review-001.md) และสัญญา DES-002/003/004/006 + guest-workspace/guest-import/guest-history/teacher-authority/robot-boundary Rev1. เอกสารนี้เป็น**แผนเตรียมเท่านั้น** ไม่มีการรัน fixture จริง ไม่ใช่ QA PASS

## หลักการกลาง

- จำลองด้วย fake เท่านั้น: fake clock (wall+monotonic+anchor), fake engine transport (scripted JSON Lines), stub G proxy (drop/delay/replay), synthetic School DB fixture, test SchoolBot DB (ไม่ใช่ shared env)
- **ห้าม**: set system clock ของเครื่องจริง · สั่งหุ่นจริงทุกชนิด (ไม่ HID/Serial จริง, ไม่ motion/upload/torque/stop ลง hardware — dry-run/fake bridge เท่านั้น) · เขียน production DB/PGGradeDB · ใช้ sample/preview/mock เป็นหลักฐาน native/Cloud/hardware
- ค่าที่เป็นสมมติฐานในสัญญา (timer sweep 60 วินาที, poll 3000 ms/debounce 0; TTL 15 นาทีอนุมัติแล้วตาม decisions-046) ต้องติดป้าย (สมมติฐาน — ยังไม่ยืนยัน) ใน expected ของทุก run
- ทุก fixture ระบุ build/commit hash + profile + evidence code ตาม TP-001; ผลทุกเคสเริ่ม NOT_RUN

## FX-01 fake clock + monotonic rollback (offline window / TTL / replay window)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-01a | wall clock แช่และย้อน + monotonic เดินต่อ + anchor {server UTC ล่าสุด, wall, max effective} | License offline 3 วัน · TP001-003/004/010 · AC-034-03/04, AC-035-05 | exp=min(checked_at+259200,license_exp); ขอบ exp−1s/exp/exp+1s; ย้อน→CLOCK_UNTRUSTED ต้อง online; monotonic ไม่ลด high-water; เปิดซ้ำไม่เลื่อน exp; replay คืน exp เดิมไม่ใช่ online check ใหม่ |
| FX-01b | server-side fake clock ขับ ReplayUntil (fixture ตั้ง TTL=900 วินาทีชัดเจน — สมมติฐาน) | create-license TTL replay · TP001-007 · AC-027-02/03 | ทดสอบที่ `ReplayUntil−1s` คืน key เดิม (ตรวจสิทธิ์+license ไม่ revoke); ที่/หลัง `ReplayUntil`→409 IDEMPOTENCY_EXPIRED+details.resource_id แม้ purge ยังไม่รัน (สัญญากำหนดเพียง ReplayUntil≤CompletedAt+900s จึงทดสอบรอบ ReplayUntil ไม่ใช่ offset จาก CompletedAt — แก้ตาม check 060f); retry ไม่ต่อ TTL; ResultCipher+ResultKeyId ล้างคู่กัน tombstone คง |
| FX-01c | fake clock พ้น window 24 ชม. ของ idempotency ทั่วไป | import/recheck replay · TP001-028/030/078 · AC-041-04, AC-042-05 | พ้น window→409 IDEMPOTENCY_EXPIRED+resource_id; Host GET ยืนยันไม่ POST ใหม่; snapshot freeze ไม่อ่านเนื้อหาที่แก้ภายหลัง |

วิธี: inject clock interface (wall กับ monotonic แยกคู่ + จุด persist anchor) ที่ host/API ใช้ — ห้ามเปลี่ยนเวลาเครื่องจริง; เก็บ log เวลาทุกการอ่านค่าเป็น E-TRACE

## FX-02 trash 30 วัน: boundary · ปิดแอปข้ามอายุ · rollback · race

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-02a | fake wall ที่ deleted_at+29d23h59m59s / +30d / +30d+1s ขณะแอปเปิด | TP001-026 · AC-040-04/05/06 | now>=expires_at→TRASH_EXPIRED กู้ไม่ได้แม้ unlink ยังไม่สำเร็จ; ก่อนนั้น restore คืน UUID เดิม+counter ถัดไป; timer 60 วินาที (สมมติฐาน) + sweep ก่อนทุก operation |
| FX-02b | ปิดแอป (ไม่มี process) → เลื่อน wall ข้าม expires_at → เปิดใหม่ | TP001-026 · AC-040-06 | ไม่มี background service; เวลานับจาก absolute expires_at; เปิดครั้งถัดไป sweep ก่อน list/restore/export; งานปกติ/ประวัติ/tombstone ไม่ถูกลบ |
| FX-02c | ย้อน wall หลังลบ / VM snapshot | TP001-026 · BR-040-04 | ตรวจ rollback ตอน start/resume ก่อนเลื่อน anchor; ไม่น่าเชื่อถือ→CLOCK_UNTRUSTED หยุด restore+irreversible purge จน online ยืนยัน; ไม่ตั้ง deleted_at ใหม่ ไม่เพิ่มอายุ |
| FX-02d | restore ∥ sweep พร้อมกัน; inject unlink fail | TP001-026 · AC-040-05/06 | ผลเดียวชนะตามขอบเวลา; unlink fail→STORE_UNAVAILABLE และ retry ได้ แต่ list ต้องไม่แสดงว่ากู้ได้ |

วิธี: fake clock ของ FX-01 + fake local store (inject failpoint ที่ unlink/rename) · ห้ามใช้เวลาที่ UI ส่งเป็นความจริง (host สร้าง deleted_at/expires_at เอง)

## FX-03 late callback / drain-stop / idle lost (fake engine เท่านั้น)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-03a | fake engine process หน่วง reply จนเลย stop; ปล่อย callback หลัง unmount/generation เปลี่ยน | TP001-037/040 · AC-021-01..04, AC-024-01..03 | cancel+drain ก่อนคำขอ stop (ลำดับใน trace); stop ซ้ำ join งานเดิมไม่สร้างคิวใหม่; รอ child reaped+stdout/stderr drained; callback ผลเก่าถูกทิ้งไม่เริ่ม movement ถัดไป; deadline host 5 วินาที |
| FX-03b | partial write แล้ว cancel; stop request ล้มเหลว | TP001-037/039 · AC-021-03, AC-023-03 | ไม่รับประกันไม่มี movement; stop fail→error ไม่ยืนยันหยุดจริง; relock เฉพาะ stop request ส่งสำเร็จ; คง lost/unknown delivery ไม่ replay command |
| FX-03c | discovery inject หาย 1 ผลขณะ idle; poll ทับขณะ busy/stopping | TP001-040 · AC-024-01 | poll 3000 ms/debounce 0 หนึ่งผลสำเร็จที่ไม่พบ target→DEVICE_NOT_FOUND/lost (สมมติฐาน); ไม่ซ้อน poll; busy/cancelled ไม่เปลี่ยน connected; lost invalidate uploaded session |

วิธี: fake engine process/test bridge ตาม PF-HOST (spawn จริงเป็นโปรเซสจำลอง ส่ง JSON Lines ตามสคริปต์ delay/drop/dup/partial) — **ไม่เปิด HID/Serial จริง ไม่มีคำสั่งถึงหุ่นใด ๆ (dry-run เท่านั้น)**; cadence 3000 ms เป็นสมมติฐาน ไม่ใช้วัด stop latency

## FX-04 lost response ตอน explicit import (receipt/tombstone)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-04a | stub G/proxy กล response หลัง DB commit สำเร็จ (drop response post-commit) | TP001-028 · AC-041-04 | 201 เกิดหลัง durable commit เท่านั้น; response หาย→retry ด้วย RequestKey/snapshot เดิม ได้ผลเดิม ไม่เกิดสำเนาใหม่ |
| FX-04b | crash host ก่อนเติมใบรับ/หลังเขียน pending; ลบไฟล์ใบรับ | TP001-028/078 · AC-041-04/05 | ใบรับเขียนก่อนส่ง (atomic); สูญหายยังคำนวณ key จาก UUID; server ไม่เชื่อ local receipt; state เติมจากผล server เท่านั้น |
| FX-04c | แก้เนื้อหา/ชื่อ Guest หลัง freeze; 2 clients POST พร้อมกัน | TP001-028 · AC-041-04 | RequestHash ต่าง→409 IDEMPOTENCY_CONFLICT ไม่เปลี่ยน key อัตโนมัติ; unique (SchoolId,Principal,Operation,RequestKey) เหลือชุดเดียว |
| FX-04d | ล้าง Guest workspace + trash sweep แล้ว retry; ล้าง ResultCipher | TP001-078 · AC-041-04 | tombstone กันซ้ำข้ามการล้าง; ไม่ purge จากการล้าง Guest/trash |

วิธี: stub G proxy (ควบคุม drop/delay/replay) + test SchoolBot DB ตรวจ rows before/after+audit (E-API); Project/Revision/Idempotency commit เป็น transaction เดียว

## FX-05 cross-tenant / authority injection (GAP-06)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-05a | synthetic School DB fixture: T/A/ห้อง1/เทอมX, U/B/ห้อง1/เทอมX, R ใน roster, S ย้ายออก (หลายแถว history), sId==sEmp ชน, SchoolID ทุก alias | TP001-058/079 · AC-038-05, AC-039-05 | เห็นเฉพาะ course-teacher∩roster∩term; ครูอีกคนในห้อง/PlanCourseIds ของ run ไม่เปิดสิทธิ์; ใช้ history ไม่ใช่ห้องปัจจุบันของ TUser; ไม่เดา Max(nHistoryId) |
| FX-05b | spoof identity/tenant/forwarding headers; ใช้ ID ข้ามโรงเรียน/เทอม; ถอนสิทธิ์ระหว่าง read→commit | TP001-058/079 · AC-038-05, AC-039-05 | 403 SUBJECT_PERMISSION_REQUIRED หรือ 404; tenant ทุก join; re-check ก่อน commit ปฏิเสธ in-flight; ผลเดิมไม่เปลี่ยน |
| FX-05c | inject School DB resolver ล่ม / ข้อมูลกำกวม | TP001-079 · AC-038-05 | แหล่งล่ม→503 AUTH_UNAVAILABLE; resolve ไม่ได้→fail closed 503 AUTH_NOT_CONFIGURED ไม่เปิดสิทธิ์จาก query |

วิธี: stub School DB fixture (SQL sanitized + hash แนบทุก run) — **synthetic ติดป้าย test-only** จนได้ resolver roster/status/move/term + tenant alias proof จาก legacy/sys ตาม gap-sync-review §ผู้รับต่อ; สิทธิ์ไม่ยกจาก client/cType

## การใช้ร่วมและขอบเขตที่ไม่ทำ

- แผนที่ cases→fixtures: TP001-003/004/010→FX-01a · TP001-007→FX-01b · TP001-026→FX-01a(clock ร่วม)+FX-02 · TP001-028→FX-01c+FX-04a–c · TP001-078→FX-04d · TP001-037/039/040→FX-03 · TP001-058/079→FX-05 · PF-HOST fake clock+monotonic harness ใน Profiles ของ TP-001 อ้างชุดนี้
- **ไม่มี fixture ของ GAP-07** (PrepareUpdate/InstallPreparedUpdate) จนกว่าผู้มีอำนาจเลือก disposition ตาม update-disposition-001; ไม่มี fixture สั่งหุ่นจริงตาม Acceptance ของ TP-002 ("ไม่สั่งหุ่น"); hardware/unplug/emergency-stop เป็นของ PF-HW ภายใต้ G-HW เท่านั้น
- TTL 15 นาทีอนุมัติแล้วตาม decisions-046; ค่าที่ยังเป็นสมมติฐาน: timer sweep 60 วินาที, poll 3000 ms/debounce 0 — ถ้าสัญญาเปลี่ยน ให้ amend แผนนี้ก่อนรัน

## Change Log
- 2026-10-24 — Rev1: สร้างแผน failure/race fixtures ตามใบงาน060e (fake clock/monotonic, trash 30 วัน/rollback/ปิดแอป, late callback/drain-stop, lost response/receipt/tombstone, cross-tenant GAP-06); docs-only ไม่มีการรัน
- 2026-10-24 — แก้ตาม check 060f (นายช่างสวมบท inspect): FX-01b ปรับเป็น fixture TTL=900s และทดสอบรอบ ReplayUntil (ไม่ใช่ offset จาก CompletedAt)

- 2026-10-26 — แก้ป้าย create-license TTL 15 นาทีตาม decisions-046 (แก้ตาม sweep); ไม่เปลี่ยน logic/ผลทดสอบ/สมมติฐานอื่น
