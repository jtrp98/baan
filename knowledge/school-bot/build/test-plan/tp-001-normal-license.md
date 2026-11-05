# TP-001 — ทางหลัก License และสิทธิ์ admin

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — ทางหลักบน stub)

เคสนี้ใช้ component/integration บน stub หนึ่ง host/process สอง service/adapter instances ต่อ store ร่วม รัน memory object เดียวและ file store สอง object directory เดียวแยก fixture อ่านผลจาก adapter ที่สาม/file object ใหม่ ไม่มี barrier/fault ใช้ fake UTC clock, test signer ที่ตรวจ signature จริง, device A/B คนละ P-256 key และ challenge/proof จริงตาม S-LIC T=2026-11-03T00:00:00Z เป็นเวลาเริ่มของทุก fixture ทุกผลจริง NOT_RUN

<a id="tp001-097"></a>
## TP001-097 — activate เครื่องเดิมและ validate ตามลำดับ

ระดับ: normal

อ้าง AC-028-01 (เครื่องเดิมเปิดซ้ำได้ เครื่องอื่นถูกจำกัด) และ AC-028-02 (validate ก่อน/หลัง activate) · BE-004 · DES-002 Rev4

Setup: License active S1 หนึ่งใบ ExpiresAt=T+10 วัน, T=2026-11-03T00:00:00Z, ไม่มี binding/pointer, epoch=e; A/B ไม่มี Login session ใช้ device proof ของตน

ขั้นตอน: A validate ก่อน activate; A activate; เลื่อน clock +1 ชั่วโมงแล้ว A activate ใหม่ด้วย request key ใหม่ (ไม่ replay); A validate; B activate ตามลำดับ

Response: 403 DEVICE_NOT_ACTIVATED, 200, 200, 200, 409 DEVICE_LIMIT ตามลำดับ สำเร็จได้ signed entitlement ที่ jkt/binding/epoch/เวลาอ้างชุด commit

Persisted state: ก่อน activate ไม่มี binding; หลัง A ครั้งแรก live=1, pointer=A, DetachedAt=null, epoch=e; ครั้งถัดไปไม่เพิ่ม binding/License, validate patch เฉพาะเวลา lease; checked_at ตรงเวลาตรวจ exp=min(checked_at+259200s,License.ExpiresAt) ไม่ถอย; audit/result ตาม operation ในหน่วยเดียว ไม่มี header idempotency ใหม่สำหรับ validate; B ปฏิเสธแล้ว domain/success audit/result เท่าก่อน B

ระดับ: full — TP001-005/083 ตรวจ race/replay/proof/fault และ writer ชน unbind ตาม AC-028-01/02

<a id="tp001-098"></a>
## TP001-098 — License inactive ปฏิเสธตรงสถานะ

ระดับ: normal

อ้าง AC-028-03 (revoke หรือหมดอายุแล้ว activate/validate ไม่ผ่าน) · BE-004 · DES-002 Rev4

Setup: topology เดิม; fixture แรก A activate แล้ว P1 staff_admin+license_admin revoke สำเร็จ; fixture ที่สอง A activate ที่ T แล้วตั้ง fake server clock T+11 วันหลัง ExpiresAt=T+10 วัน ไม่มีคำขอค้าง เก็บ baseline หลัง revoke/เลื่อน clock

ขั้นตอน: A activate ด้วย request ใหม่และ validate ด้วย proof ถูกต้องในแต่ละ fixture

Response: ทั้งสอง operations ได้ 403 LICENSE_INACTIVE ไม่มี entitlement

Persisted state: License/ทุก binding/pointer/epoch/DetachedAt/LastCheckedAt/LastEntitlementExpiresAt/success audit/result เท่ากับ baseline หลัง admin action ไม่ renew ไม่สร้าง binding; แยก nonce consumption จาก domain mutation

ระดับ: full — TP001-006 ตรวจ E−1/E/E+1 และ revoke แทรกก่อน commit ตาม AC-028-03

<a id="tp001-103"></a>
## TP001-103 — ผลควบคุมสิทธิ์ admin ตามสถานะตั้งต้น

ระดับ: normal

อ้าง AC-027-01 (admin ไม่พร้อม/ไม่มี session/ไม่มี role ใช้งานไม่ได้และปิด v1) · BE-003 · DES-002 Rev4, DES-004 Rev13, DES-012 Rev9

Setup: topology เดิม fixture ใหม่ต่อสถานะ เริ่ม License=0/binding=0 บันทึก audit/result baseline; payload ถูกต้อง ชื่อโรงเรียน S1 วันหมดอายุ T+10 วัน; actor แต่ละ fixture: auth ไม่ configured; ไม่มี session; staff_admin session ถูกต้องแต่ไม่มี license_admin active; static bearer ทดสอบของ /v1/admin ไม่มีการปลอม input หรือถอนสิทธิ์ระหว่างคำขอ

ขั้นตอน: POST และ GET admin licenses ผ่าน boundary fake ที่ map status ตาม contract ในแต่ละ fixture; control ใช้ P1 staff_admin+license_admin และทำ TP001-007

Response: v2 ไม่ configured→503 AUTH_NOT_CONFIGURED, ไม่มี session→401 UNAUTHORIZED, ไม่มี role→403 STAFF_ROLE_REQUIRED; v1 ไม่สร้าง/ไม่เปิดรายการ (ไม่กำหนด status เพิ่มจาก AC)

Persisted state: ทุก denied fixture คง License/binding/audit/result เท่า baseline; control สร้างได้หนึ่งใบตาม TP001-007 นี่เป็นผลหลักที่ AC ระบุให้ปฏิเสธ ไม่ใช่ inject fault

ระดับ: full — TP001-007 ส่วน token ผิด/channel ผิด/role race/TTL/replay/invalid payload ตาม AC-027-01..03

## หลักฐาน

- [REQ-027 (admin License)](../../modules/app-shell/shared/requirements/req-027.md), [REQ-028 (activate/validate)](../../modules/app-shell/shared/requirements/req-028.md)
- [S-LIC/S-OBS/S-GATE](traceability-001-license-setup.md), [admin fixtures](traceability-001-license-admin.md), [device contract](traceability-001-license-device.md)
- [DES-002 Rev4](../design/des-002.md), [DES-004 Rev13](../design/des-004.md), [DES-012 Rev9](../design/des-012.md)
