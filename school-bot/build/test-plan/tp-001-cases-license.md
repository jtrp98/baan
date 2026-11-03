# TP-001 — License และสิทธิ์เครื่อง (TP001-001–TP001-005)

> Rev 3 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — แยกเคส normal/full ก่อนพัฒนาและตรวจรับ)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-001"></a>

## TP001-001 — เปิดแอป เลือก Guest แล้ว Login แยกกันเข้า Block/Arm/Code

AC: [AC-009-01 (เริ่มแอปโดยไม่เคยใส่ License แล้วเข้าใช้งาน Block Lab, Arm Lab และ Code…)](../../modules/app-shell/shared/requirements/req-009.md), [AC-009-02 (เลือก Guest หรือ Login โดยยังไม่มี License แล้วไม่สามารถข้ามข้อกำหนด…)](../../modules/app-shell/shared/requirements/req-009.md) · References: [DES-001 (Desktop host และ IPC)](../design/des-001.md), [DES-002 (License และ device binding)](../design/des-002.md), [BR-009-01 (ไม่มี License ที่ผ่านการยอมรับตามนโยบาย ไม่อนุญาตใช้งานแอปทั้งสามโหมด)](../../modules/app-shell/shared/requirements/req-009.md), [BR-009-02 (Guest/Local และ Login/Cloud ต่างต้องมี License)](../../modules/app-shell/shared/requirements/req-009.md) · Level: integration · Profiles: PF-HOST, PF-UI-WIN

เงื่อนไขก่อนตรวจ: ไม่มี entitlement/credential; fake engine นับ spawn

ขั้นตอน: เปิดแอป เลือก Guest แล้ว Login แยกกันเข้า Block/Arm/Code; เรียก bridge RunV2/Run/Save/Load เก่าตรงข้าม UI; ลอง mode/action นอก allowlist

ผลที่คาด: ทุกทางถูกปฏิเสธ LICENSE_REQUIRED/MODE_NOT_ALLOWED/ACTION_NOT_ALLOWED; engine spawn=0; มีทางกรอก License; Login ไม่ปลดล็อก; ไม่มี ungated compat path

หลักฐานที่ต้องเก็บ: E-TRACE+E-UI

ผลจริง: NOT_RUN

<a id="tp001-002"></a>

## TP001-002 — กรอก key ขณะ offline

ระดับ: full

BE-007: ทางหลัก offline ใช้ TP001-099 อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


AC: [AC-028-04 (เมื่อลองเปิดใช้ด้วย License ไม่ถูกต้องและไม่เคยมีสิทธิ์ที่ใช้ได้…)](../../modules/app-shell/shared/requirements/req-028.md), [AC-034-01 (ครั้งแรกไม่มีอินเทอร์เน็ต เข้าโหมดหลักไม่ได้แม้กรอก Key แล้ว)](../../modules/app-shell/shared/requirements/req-034.md) · References: DES-002, [BR-009-03 (เปิดใช้ครั้งแรกต้องออนไลน์)](../../modules/app-shell/shared/requirements/req-009.md) · Level: integration · Profiles: PF-HOST, PF-API

เงื่อนไขก่อนตรวจ: ใช้ [H-LIC/H-OBS — topology/doubles/fault](traceability-001-license-host-setup.md) ทั้ง memory/file; A มี device key แต่ไม่มี token/anchor/binding; ปิด network ก่อนส่ง ใช้ fixture สะอาดต่อ key ถูก/ผิด/revoked/expired ส่วน credential write fail เปิด network แล้วพักหลัง Active ก่อน publish local generation; response และ server/local state ตาม [pack BE-007](traceability-001-license-host-pack.md#be-007)

ขั้นตอน: กรอก key ขณะ offline; กรอก key ผิด/revoked ขณะ online; inject credential-store write fail

ผลที่คาด: ทุกกรณีไม่ปลดล็อกโหมดหลัก แจ้งให้ออนไลน์/กรอกใหม่ได้; ไม่เก็บ entitlement; write fail→CREDENTIAL_STORE_FAILED ไม่รายงาน ready

หลักฐานที่ต้องเก็บ: E-TRACE+E-API+E-UI

ผลจริง: NOT_RUN

<a id="tp001-003"></a>

## TP001-003 — เปิดแอปซ้ำ offline ที่ T+3d-1s, exp-1s, exp, exp+1s

ระดับ: full

BE-007: ทางหลักเปิดซ้ำ offline ใช้ TP001-100 อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


AC: [AC-034-03 (ออฟไลน์ภายใน 3 วันจากตรวจสำเร็จล่าสุดใช้งานได้)](../../modules/app-shell/shared/requirements/req-034.md), [AC-034-04 (ครบ 3 วันและติดต่อเซิร์ฟเวอร์ไม่ได้…)](../../modules/app-shell/shared/requirements/req-034.md) · References: DES-002, DES-001, BR-009-03 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: ใช้ [H-LIC/H-OBS — clock/restart/persistence](traceability-001-license-host-setup.md) ทั้ง memory/file; A activate ที่ T แล้วปิด network มี server LastCheckedAt=T/LastEntitlementExpiresAt=E และ local lease/anchor ตรงกัน รันแยก License.ExpiresAt=T+10 วัน (E=T+259200s) กับ T+1 วัน (E=T+86400s); reset fixture ต่อ boundary และหยุด/สร้าง Desktop instance ใหม่บน storage namespace A เดิม; server สอง instance/store ร่วมคงอยู่ หุ่น busy ใช้ fake; ทุก restart ต้องคง checked_at/exp=T/E, high-water mark เดินหน้าได้ตามเวลา ดู [pack BE-007](traceability-001-license-host-pack.md#be-007)

ขั้นตอน: เปิดแอปซ้ำ offline ที่ T+3d-1s, exp-1s, exp, exp+1s; ย้อน wall clock/VM snapshot; เปิด session ค้างข้าม exp ขณะ robot busy

ผลที่คาด: ก่อน exp ใช้ได้และเปิดซ้ำไม่เลื่อน exp; now>=exp locked+แจ้งต่ออินเทอร์เน็ต; exp=min(T+259200,license_exp); clock ย้อน→CLOCK_UNTRUSTED ต้อง online; timer เก่าไม่ส่งคำสั่งหลังหมด; robot busy→drain+stop ก่อน lock

หลักฐานที่ต้องเก็บ: E-TRACE+log เวลา

ผลจริง: NOT_RUN

<a id="tp001-004"></a>

## TP001-004 — ตรวจออนไลน์ในสถานะ valid และหลัง expired offline

ระดับ: normal

BE-007: normal เฉพาะ Active ครั้งแรกและตรวจ Key เดิม Active อีกครั้ง; denial ใช้ TP001-101 ส่วน replay/5xx/429/malformed/signature/unknown 403 ด้านล่างเป็น **ระดับ: full** อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


AC: [AC-034-02 (ตรวจออนไลน์ได้ Active แล้วเข้าใช้งานได้และมีสิทธิ์ในเครื่อง)](../../modules/app-shell/shared/requirements/req-034.md), [AC-034-05 (ตรวจ Key เดิมออนไลน์ได้ Active อีกครั้ง แล้วต่อสิทธิ์ 3…)](../../modules/app-shell/shared/requirements/req-034.md), [AC-034-06 (ได้ผล Key ไม่ Active แล้วไม่ต่อสิทธิ์หรือใช้ค่าเดิมข้ามผลปฏิเสธเพื่อปลดล็อก)](../../modules/app-shell/shared/requirements/req-034.md) · References: DES-002 · Level: integration · Profiles: PF-HOST, PF-API

เงื่อนไขก่อนตรวจ: ใช้ [H-LIC/H-OBS — response faults](traceability-001-license-host-setup.md) ทั้ง memory/file; แยก A สะอาดสำหรับ Active แรก กับ A มี lease T/E สำหรับ renew/denial; ตรวจครั้งใหม่ที่ T1=T+3600s และอีก fixture ที่ E+1s โดย License.ExpiresAt=T+10 วัน; server สอง instance/store ร่วม; revoke/unbind บน stub ก่อน validate เพื่อได้ LICENSE_INACTIVE/BINDING_REVOKED; fault อื่นตาม [pack BE-007 — response/server/local state](traceability-001-license-host-pack.md#be-007); หลัง denial restart offline ต้องยัง locked

ขั้นตอน: ตรวจออนไลน์ในสถานะ valid และหลัง expired offline; replay request เดิม

ผลที่คาด: Active→ปลดล็อก มีสิทธิ์ในเครื่อง exp ใหม่=min(checked_at+259200,license_expires_at); inactive/revoked→denied+invalidate cache ไม่ต่อ ไม่ใช้ค่าเดิมปลดล็อก; 5xx/429/network ไม่เลื่อน exp; malformed/signature ผิด→INVALID_ENTITLEMENT; 403 ไม่รู้ code→locked; replay คืน exp เดิม ไม่ถือเป็น online check ใหม่

หลักฐานที่ต้องเก็บ: E-API+E-TRACE

ผลจริง: NOT_RUN

<a id="tp001-005"></a>

## TP001-005 — activate A และ B พร้อมกัน ≥50 รอบ

ระดับ: full

BE-004: activate/validate ตามลำดับใช้ TP001-097 อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


AC: [AC-028-01 (เปิดใช้ Key เดียวบนเครื่อง A ซ้ำได้)](../../modules/app-shell/shared/requirements/req-028.md), [AC-028-02 (Validate device ที่ยังไม่ activate ได้ DEVICE_NOT_ACTIVATED)](../../modules/app-shell/shared/requirements/req-028.md) · References: DES-002 · Level: integration · Profiles: PF-API

เงื่อนไขก่อนตรวจ: ใช้ [S-LIC/S-OBS/S-GATE — topology, การอ่านผลและประตูของจริง](traceability-001-license-setup.md) ครบทั้ง memory/file: หนึ่ง process, สอง adapter/service; memory store object เดียว หรือ file สอง store object directory เดียว ให้ License active ของ S1 ยังไม่มี binding, CurrentBindingId=null, BindingEpoch=e; A/B มี challenge/proof แยกกัน พักทั้งสอง activate หลังอ่าน pointer/epoch ก่อนเข้า store lock แล้วปล่อยพร้อมกัน ทำ ≥50 รอบต่อ backend โดย reset fixture แต่ละรอบ อ่านผ่าน instance ที่สาม/reopen file

ขั้นตอน: activate A และ B พร้อมกัน ≥50 รอบ; A ซ้ำ; validate ก่อน/หลัง activate; Idempotency-Key เดิม payload ต่าง; inject commit/signer fail; proof ผิด/challenge reuse/เกิน 120s

ผลที่คาด: 200 หนึ่ง/409 DEVICE_LIMIT หนึ่ง, live=1/pointer ชี้ผู้ชนะ/epoch=e/DetachedAt=null; A ซ้ำ→200 ไม่เพิ่มแถว; validate ก่อน activate→403 DEVICE_NOT_ACTIVATED หลัง activate→200 ไม่เพิ่มแถว ไม่เปลี่ยน License และ patch เฉพาะเวลา lease; token/audit/result ตรงชุด commit ตาม [expected ฉบับเต็ม](traceability-001-license-device.md)
ส่วน stub ใน slice นี้: รันทั้ง memory/file รวม [fault/replay/lease ที่ไม่ถอยของ TP001-005](traceability-001-license-device.md) ซึ่งเป็นส่วนบังคับ ตรวจ signer/write/file publish failure ก่อน publish ให้ state/audit/result คงเดิม ไม่มี token; replay ไม่ต่อ lease

ส่วนรอของจริง: หลาย process/host, PostgreSQL lock/CAS/rollback/constraints รอ DBA-003/G-CORE; Gateway และ signed lease end-to-end รอ QA-001 ตาม S-GATE ผล stub ไม่ปิดประตูเหล่านี้

หลักฐานที่ต้องเก็บ: E-API (DB rows, audit)

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · IPC = Inter-Process Communication
