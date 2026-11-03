# TP-001 — License และสิทธิ์เครื่อง (TP001-009–TP001-010, TP001-083 และ TP001-088)

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — setup ที่รันตามได้ของ BE-005/BE-007)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-009"></a>

## TP001-009 — non-admin unbind

AC: [AC-035-01 (ผู้ไม่มีสิทธิ์ผู้ดูแลขอปลดเครื่องแล้วถูกปฏิเสธ และการผูกเครื่องไม่เปลี่ยน)](../../modules/app-shell/shared/requirements/req-035.md), [AC-035-02 (ผู้ดูแลปลด A แล้ว B เปิดใช้ Key เดิมได้ทันที แม้ A…)](../../modules/app-shell/shared/requirements/req-035.md), [AC-035-03 (B ต้องเปิดใช้ Key ออนไลน์ครั้งแรก ไม่ใช้สิทธิ์ออฟไลน์ของ A แทน)](../../modules/app-shell/shared/requirements/req-035.md), [AC-035-04 (หลัง Key ผูกกับ B แล้ว A ตรวจออนไลน์ไม่ผ่านและไม่ได้สิทธิ์ออฟไลน์รอบใหม่)](../../modules/app-shell/shared/requirements/req-035.md) · References: [DES-002 (License และ device binding)](../design/des-002.md) · Level: integration · Profiles: PF-API, PF-HOST

เงื่อนไขก่อนตรวจ: ส่วน unbind ของ BE-003 ใช้ [S-LIC/S-OBS/S-GATE — topology/reader/ประตู](traceability-001-license-setup.md): หนึ่ง process, สอง adapter/service; memory store object เดียว หรือ file สอง object directory เดียว; License active ของ S1 ผูก A, CurrentBindingId=A-binding, BindingEpoch=e, live=1, DetachedAt=null และ lease ยังเหลือ; P1 เป็น admin ที่มีสิทธิ์, actor ไม่มี role/ผิด scope แยก fixture; P1 อ่าน ETag เก่า แล้วอีก service ทำ unbind ด้วย ETag ปัจจุบันสำเร็จ จากนั้นส่งคำขอด้วย ETag เก่า บันทึก state หลังคำขอแรกก่อนตรวจ 412 อ่านผ่าน instance ที่สาม/reopen file ใช้ fresh fixture สำหรับ success/missing If-Match/denial; ส่วน BE-005/BE-007 ใช้ [H-LIC/H-OBS — fixture ย้าย](traceability-001-license-host-setup.md) แยกจาก BE-003: Desktop A/B คนละ storage namespace/P-256 key; A มี lease T/E, B ไม่เคยมีสิทธิ์; P1 กับ actor ไม่มี active license_admin/ผิด scope ใช้ fixture แยก; ปิด network A ก่อน P1 unbind ด้วย If-Match ล่าสุด แล้ว B activate ทันทีเมื่อ unbind 200 ที่ T+3600s ไม่เลื่อน clock ไป E; เปิด network A ตรวจเดิมตาม [pack BE-005](traceability-001-license-host-pack.md#be-005)

ขั้นตอน: non-admin unbind; admin unbind (If-Match ถูก/stale); B activate ทันที; B ลอง offline ด้วย entitlement ของ A; A validate online หลังย้าย; A activate กลับเอง; unbind∥activate race

ผลที่คาด: non-admin ถูกปฏิเสธ binding เดิม; ไม่สร้าง License ใหม่; B activate ได้ทันทีไม่รอ 3 วัน; B ต้องออนไลน์ครั้งแรก; A online→BINDING_REVOKED ไม่ได้สิทธิ์ใหม่; A activate เองไม่ได้ยกเว้น next_device_jkt; BindingEpoch เพิ่ม; audit ครบ; unbind If-Match จาก ETag(UpdateDate); stale→`412 VERSION_CONFLICT`+`details.current_etag`; ขาด→`428 PRECONDITION_REQUIRED`

ส่วน stub ใน slice นี้ (BE-003): stale If-Match→`412 VERSION_CONFLICT` พร้อม details.current_etag ตรงกับ state ล่าสุด และ License/Binding/DetachedAt/BindingEpoch/CurrentBindingId/audit/idempotency ทุก field เท่าก่อนคำขอ 412; missing→428 และ unauthorized→ปฏิเสธตามสัญญา โดย state คงเดิม Success unbind→200: live=0, pointer=null, epoch=e+1, DetachedAt ของ A มีเวลา commit และไม่เปลี่ยนกลับ; คง binding ID/key/Epoch/ActivatedAt/lease เดิม, เก็บ admin audit actor/reason+result ในหน่วยเดียว ไม่ลบประวัติ Inject store write failure หรือ file publish failure ก่อนสลับ generation ใน fixture แยก: ไม่ตอบ success และ reopen เห็นชุดก่อน unbind ครบ กรณี validate ชน unbind ใช้ TP001-083 แทนคำว่า concurrent ที่ไม่มีลำดับ

ส่วนรอของจริง: unbind หลาย process/host และ PostgreSQL rollback/lock รอ DBA-003/G-CORE; ย้าย B/สิทธิ์ offline และ transport/auth จริงรอ QA-001 ตาม S-GATE ไม่ใช้ผล stub ปิดประตู
หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-010"></a>

## TP001-010 — A offline ที่ E-1s, E, E+1s

AC: [AC-035-05 (A ที่ออฟไลน์ยังใช้ได้ก่อนสิทธิ์เดิมหมด แต่ครบกำหนดแล้วเข้าโหมดหลักไม่ได้)](../../modules/app-shell/shared/requirements/req-035.md) · References: DES-002 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: ใช้ [H-LIC/H-OBS — fixture ย้าย](traceability-001-license-host-setup.md) ทั้ง memory/file; A มี lease/anchor checked_at=T/exp=E; ปิด network A ก่อน P1 unbind และ B activate ที่ T+3600s บน server สอง instance/store ร่วม; A/B คนละ storage namespace/key; แยก fixture E-1s/E/E+1s กับ online denial; restart A ด้วย storage เดิมก่อนแต่ละ boundary ตาม [pack BE-007](traceability-001-license-host-pack.md#be-007)

ขั้นตอน: A offline ที่ E-1s, E, E+1s; A online หลังย้าย

ผลที่คาด: ก่อน E ใช้ได้; ที่ E locked; ย้ายไม่เลื่อน E; รู้ผลปฏิเสธออนไลน์แล้วหยุดใช้ cache ทันที server คง License เดิม, A detached คง LastCheckedAt=T/LastEntitlementExpiresAt=E และ B เป็น live แถวเดียว; local A คง T/E ทุก restart ขณะ offline การย้ายไม่เขียน storage A; online denial บันทึก denied/invalidate cache และ restart offline ยัง locked

หลักฐานที่ต้องเก็บ: E-TRACE+E-API

ผลจริง: NOT_RUN



<a id="tp001-088"></a>

## TP001-088 — ปฏิเสธ tamper/copy ข้ามเครื่อง

AC: AC-034-02 (Active แล้วจึงมีสิทธิ์ในเครื่อง), AC-035-03 (B ต้องเปิดใช้ออนไลน์ครั้งแรก ไม่ใช้สิทธิ์ A) · Criterion BE-007: tamper/copy · Level: host component/integration บน doubles · Profile: PF-HOST

เงื่อนไขก่อนตรวจ ขั้นตอน จุด inject และ expected response/server/local state ทั้งหก subcase อยู่ใน [TP001-088 ฉบับเต็ม](traceability-001-license-host-negative.md#tp001-088) ใช้ H-LIC/H-OBS ทั้ง memory/file และ secure storage แยก A/B ตามนั้น; ผลจริง NOT_RUN

<a id="tp001-083"></a>

## TP001-083 — validate/activate เครื่องเดิมที่ค้างต้องไม่ย้อน unbind

AC: [AC-028-01 (A เปิดใช้ซ้ำได้ ขณะผูก A ต้องปฏิเสธ B)](../../modules/app-shell/shared/requirements/req-028.md), [AC-028-02 (validate ก่อน activate ถูกปฏิเสธ หลัง activate สำเร็จผ่าน)](../../modules/app-shell/shared/requirements/req-028.md) · ขอบเขต BE-003: unbind สำเร็จคงประวัติ detached · References: [DES-002 — CAS ของ License writers Rev4](../design/des-002.md), [หน่วย commit/lease patch Rev4](../design/des-002-entitlement.md), [setup race Rev4](../design/des-002-recovery.md), [transaction Rev12](../design/data-contract-rules-transactions.md) · Level: integration บน stub · Profile: PF-API

เงื่อนไขก่อนตรวจ: ใช้ [S-LIC/S-OBS/S-GATE — topology/reader/ประตู](traceability-001-license-setup.md) ทั้ง memory/file: หนึ่ง process, สอง service/adapter โหลด cache แล้ว; memory store เดียว หรือ file สอง store object directory เดียว P1 มีสิทธิ์ unbind ของ S1; A/B มี P-256 proof จริง License active ผูก A, pointer=A-binding, BindingEpoch=e, live=1, DetachedAt=null; เก็บ lease/audit/result เริ่มต้น ใช้ store สะอาดต่อ subcase อ่าน state ทุก checkpoint ด้วย instance ที่สาม/file object ใหม่

ขั้นตอนและผลที่คาด: รัน [ตารางลำดับและ response/state ทุก subcase ของ TP001-083](traceability-001-license-race.md) ทุก subcase: (1) validate อ่านก่อน unbind แล้ว commit ทีหลัง→403 BINDING_REVOKED; (2) activate เครื่องเดิมที่ค้างเช่นเดียวกัน→403 BINDING_REVOKED แล้ว A ขอใหม่→409 DEVICE_LIMIT/B activate→200; (3) lease commit ก่อน unbind คงสิทธิ์เดิม; (4) admin อนุญาต A กลับจึงสร้าง binding ใหม่ได้ ทุกชุดต้องคง DetachedAt ประวัติ, live≤1, pointer/epoch/lease/audit/result ตรง commit และไม่ออก token เมื่อถูกปฏิเสธ
ส่วน stub ใน slice นี้: ทุกแถวต้องรันสอง backend ตาม topology ห้ามแคบเหลือ adapter/service เดียว ไม่ inject data corruption และไม่พักใต้ lock; entitlement ของ success ต้องลงนามและผูก jkt/binding/epoch/เวลาจาก commit การปฏิเสธไม่มี success audit/result ใหม่ ตรวจ state diff รวมทุกแถว ไม่ใช่เพียง pointer หรือ HTTP status

ส่วนรอของจริง: ชุดเดิมบนสอง process/host ต่อ PostgreSQL ฐานเดียวและ reader ที่สาม รอ DBA-003/G-CORE; QA-001 ตรวจ transport/ย้าย/denial จริง ผลนี้ไม่พิสูจน์ PostgreSQL isolation, OS crash durability หรืออนุมัติความเสี่ยง Important แทนมนุษย์

หลักฐานที่ต้องเก็บ: E-API + sanitized response/state diff ทุก checkpoint แยก backend และ subcase

ผลจริง: NOT_RUN
## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ
