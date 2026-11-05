# TP-001 — License และสิทธิ์เครื่อง (TP001-006–TP001-008)

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — แยกเคส normal/full ก่อนพัฒนาและตรวจรับ)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-006"></a>

## TP001-006 — activate+validate ที่ E-1s, E, E+1s และหลัง revoke

ระดับ: full

BE-004: inactive ที่ทราบสถานะแล้วใช้ TP001-098 อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


AC: [AC-028-03 (หลัง revoke หรือถึงเวลาหมดอายุ ทั้ง activate และ validate ถูกปฏิเสธว่า…)](../../modules/app-shell/shared/requirements/req-028.md) · References: [DES-002 (License และ device binding)](../design/des-002.md) · Level: integration · Profiles: PF-API

เงื่อนไขก่อนตรวจ: ใช้ [S-LIC/S-OBS/S-GATE — topology/reader/ประตู](traceability-001-license-setup.md): หนึ่ง process, สอง adapter/service, memory store เดียว หรือ file สอง object directory เดียว; License active ของ S1 ผูก A, live=1, CurrentBindingId=A-binding, BindingEpoch=e, DetachedAt=null; actor device A พร้อม proof และ admin P1 พร้อม If-Match ล่าสุด ตั้ง ExpiresAt=E และ fake clock แต่ละ boundary ใช้ fixture ใหม่ อ่านผ่าน instance ที่สาม/reopen file กรณี revoke พัก activate A เครื่องเดิมและ validate แยกกันหลังอ่าน/proof ก่อน store lock ให้ service อีก instance revoke 200 แล้วปล่อย

ขั้นตอน: activate+validate ที่ E-1s, E, E+1s และหลัง revoke; replay response เดิมหลัง revoke

ผลที่คาด: E−1s ได้ 200 พร้อม lease exp ไม่เกิน E โดย live=1/pointer/epoch/DetachedAt ไม่เปลี่ยน; E/E+1s และ revoke ก่อน device commit→`403 LICENSE_INACTIVE` ไม่คืน token รวม replay เก่า หลัง revoke คง RevokedAt ที่ commit แล้ว และคง binding/pointer/epoch/DetachedAt/lease ทั้งหมดจากก่อน device resume ไม่เพิ่ม success audit/result ของ device; มี admin audit/result ของ revoke ตามหน่วย commitเท่านั้น

ส่วน stub ใน slice นี้: รันทั้งสอง backend ตาม setup รวมคำขอเริ่มก่อน E แต่พักจน now=E ก่อน commit ต้องถูกปฏิเสธ ใช้ fresh challenge แยกจากชุดทดสอบ replay ไม่ inject storage failure ในชุด expiry

ส่วนรอของจริง: หลาย process/host และ PostgreSQL isolation/rollback รอ DBA-003/G-CORE; revoke/expiry ผ่าน Gateway และ client cache รอ QA-001 ตาม S-GATE

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-007"></a>

## TP001-007 — POST/GET /v2/admin/licenses ตามแต่ละ fixture

ระดับ: normal

BE-003: normal เฉพาะ P1 สร้างข้อมูลถูกต้องและอ่าน metadata (AC-027-02/03); AC-027-01 ใช้ TP001-103 ส่วน invalid payload/ถอน role ระหว่างคำขอ/replay/TTL/fault ด้านล่างเป็น **ระดับ: full** อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


AC: [AC-027-01 (เมื่อระบบยืนยันตัวตนพนักงานที่ /v2/admin ยังไม่ถูกตั้งค่า (เดิมเรียก…)](../../modules/app-shell/shared/requirements/req-027.md), [AC-027-02 (ผู้เรียกที่มี staff session และ StaffRole ที่มีสิทธิ์…)](../../modules/app-shell/shared/requirements/req-027.md), [AC-027-03 (ผู้เรียกที่มีสิทธิ์ (ตาม BR-027-01) เรียกรายการหลังสร้างแล้วเห็น…)](../../modules/app-shell/shared/requirements/req-027.md) · References: DES-002, [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](../design/des-004.md), [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](../design/des-012.md), [BR-027-01 (admin API ของ License อยู่ที่ /v2/admin ผู้เรียกต้องมี staff session…)](../../modules/app-shell/shared/requirements/req-027.md) · Level: integration · Profiles: PF-API, PF-ADMIN

เงื่อนไขก่อนตรวจ: ใช้ [setup/fixtures/expected ฉบับเต็มของ TP001-007](traceability-001-license-admin.md) ซึ่งเป็นส่วนบังคับของ case: หนึ่ง process สอง adapter/service; memory store object เดียว หรือ file สอง store object directory เดียว; P1 staff_admin + license_admin active, actor ผิดสิทธิ์/payload แยก fixture; create instance แรก list/replay อีก instance อ่าน persisted state จาก instance ที่สาม/reopen file พักก่อน store lock เฉพาะชุดถอน role และ inject failure ก่อน publish ตามรายละเอียด

ขั้นตอน: POST/GET /v2/admin/licenses และ /v1/admin ทุก fixture; replay ที่ ReplayUntil−1s/ReplayUntil/ReplayUntil+1s ด้วย TTL=900s; ตรวจ authority ซ้ำก่อน commit และ fault ก่อน publish

ผลที่คาด: valid create→201 Key สำหรับหนึ่งเครื่อง, list→200 ไม่คืน key/hash/device IDs; auth ไม่ configured→503, session ผิด→401, role ไม่อนุญาต→403; /v1/admin สร้าง/ดูไม่ได้; invalid payload ไม่สร้างข้อมูล; success สร้าง License หนึ่งแถว live=0/pointer=null พร้อม audit/result หน่วยเดียว; denial/failure ไม่เปลี่ยน state; expired replay→409 IDEMPOTENCY_EXPIRED ไม่สร้าง Key ใหม่ ล้าง cipher/key-id คู่กันคง tombstone รายละเอียด error/field/TTL ตามเอกสารเต็ม

ส่วน stub ใน slice นี้: รัน memory/file ตาม setup รวม audit/result, fault และถอน role ก่อน commit; restart ใช้ TP001-008

ส่วนรอของจริง: PostgreSQL/หลาย process รอ DBA-003/G-CORE; authority/Gateway/custody รอ QA-001 ตาม S-GATE
หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-008"></a>

## TP001-008 — restart ทุก instance

ระดับ: normal

BE-003: normal เฉพาะ create สำเร็จแล้ว dispose/reopen file และ list พบข้อมูลเดิม (AC-027-04); fail ก่อน publish/lost response/retry เป็น **ระดับ: full** ไม่จัดระดับใหม่ให้ AC-036-03 ของงานอื่น อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


AC: [AC-027-04 (ผู้เรียกที่มีสิทธิ์ (ตาม BR-027-01) สร้าง License แล้ว restart API…)](../../modules/app-shell/shared/requirements/req-027.md), [AC-036-03 (Restart บริการแล้ว Login บัญชีเดิมยังเรียกโครงงานที่บันทึกสำเร็จได้)](../../modules/app-shell/shared/requirements/req-036.md) · References: DES-002, [DES-003 (หลายโครงงาน Local/Cloud)](../design/des-003.md) · Level: integration · Profiles: PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: ส่วน AC-027-04 ใช้ [S-LIC/S-OBS/S-GATE — topology/reader/ประตู](traceability-001-license-setup.md): หนึ่ง process มีสอง adapter/service และ file store สอง object directory เดียว; P1 สร้าง License ผ่าน instance แรกได้ 201 แล้วอ่านอีก instance บันทึก metadata/status, live=0, CurrentBindingId=null, BindingEpoch เริ่มต้น, bindings/audit/idempotency ก่อน restart ปิด service/adapter/store ทั้งหมดและสร้างชุดใหม่จาก directory เดิม อ่านยืนยันด้วย instance ที่สาม/reopen; memory รันได้เฉพาะ failure/CAS โดยแชร์ object เดิม ไม่อ้างเป็น process restart persistence ส่วน Cloud project/AC-036-03 คง fixture บันทึกสำเร็จเดิมและแยกจาก BE-003

ขั้นตอน: รัน [restart/fault/lost-response ของ TP001-008 ทุกชุด](traceability-001-license-restart.md) ซึ่งเป็นส่วนบังคับ; dispose/reopen ทุก instance แยก fail ก่อน publish และ lost response หลัง commit

ผลที่คาด: list→200 พบ ID/status/epoch เดิม, live=0/pointer=null/audit+result ไม่ซ้ำ; failure ก่อน publish คงชุดเก่า; commit แล้วขาด response เห็นชุดใหม่ครบ/retry ไม่สร้างซ้ำ ไม่ยอมรับครึ่งหน่วย

ส่วน stub ใน slice นี้: file reopen และ fail ก่อน publish; memory ตรวจ atomicity ได้แต่ไม่พิสูจน์ process restart

ส่วนรอของจริง: PostgreSQL สอง process/host, kill/DB restart รอ DBA-003/G-CORE + QA-001; Cloud Login/project/Gateway รอ QA-001 ตามรายละเอียด
หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · TTL = Time to Live หรืออายุที่ใช้งานได้
