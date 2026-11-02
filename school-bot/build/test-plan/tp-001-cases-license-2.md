# TP-001 — License และสิทธิ์เครื่อง (TP001-006–TP001-008)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-006"></a>

## TP001-006 — activate+validate ที่ E-1s, E, E+1s และหลัง revoke

AC: [AC-028-03 (หลัง revoke หรือถึงเวลาหมดอายุ ทั้ง activate และ validate ถูกปฏิเสธว่า…)](../../modules/app-shell/shared/requirements/req-028.md) · References: [DES-002 (License และ device binding)](../design/des-002.md) · Level: integration · Profiles: PF-API

เงื่อนไขก่อนตรวจ: license expires_at=E; license revoked

ขั้นตอน: activate+validate ที่ E-1s, E, E+1s และหลัง revoke; replay response เดิมหลัง revoke

ผลที่คาด: now>=E หรือ revoke→ทั้งสอง API ปฏิเสธ license inactive; replay ไม่คืน entitlement เก่า (ตรวจ binding ก่อน)

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-007"></a>

## TP001-007 — POST/GET /v2/admin/licenses ตามแต่ละ fixture

AC: [AC-027-01 (เมื่อระบบยืนยันตัวตนพนักงานที่ /v2/admin ยังไม่ถูกตั้งค่า (เดิมเรียก…)](../../modules/app-shell/shared/requirements/req-027.md), [AC-027-02 (ผู้เรียกที่มี staff session และ StaffRole ที่มีสิทธิ์…)](../../modules/app-shell/shared/requirements/req-027.md), [AC-027-03 (ผู้เรียกที่มีสิทธิ์ (ตาม BR-027-01) เรียกรายการหลังสร้างแล้วเห็น…)](../../modules/app-shell/shared/requirements/req-027.md) · References: DES-002, [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](../design/des-004.md), [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](../design/des-012.md), [BR-027-01 (admin API ของ License อยู่ที่ /v2/admin ผู้เรียกต้องมี staff session…)](../../modules/app-shell/shared/requirements/req-027.md) · Level: integration · Profiles: PF-API, PF-ADMIN

เงื่อนไขก่อนตรวจ: staff auth ของ /v2/admin ไม่ configured/configured; staff session (staff_admin) ขาด/ไม่ถูกต้อง/หมดอายุ; session ที่ไม่มี StaffRole active ที่มีสิทธิ์ License (role อื่น/ถูกถอน/valid_until หมด); token school_web/desktop; static bearer เดิมของ /v1/admin; ผู้เรียกมีสิทธิ์ + payload valid, ชื่อว่าง/whitespace, expires_at อดีต/=now, ฟิลด์ limit>1; fake clock ฝั่ง API สำหรับ TTL replay; role `license_admin` active (ValidFrom/ValidUntil ครอบช่วง), role `staff_admin`/`release_publisher` เพียงอย่างเดียว, role ถูกถอน/IsDelete

ขั้นตอน: POST/GET /v2/admin/licenses ตามแต่ละ fixture; POST/GET /v1/admin ด้วย static bearer และด้วย staff session; replay create;  replay create โดย fixture ตั้ง TTL=900 วินาทีชัดเจน **(ผู้ใช้อนุมัติตาม [มติ 046 (Gateway dev และระยะเวลา replay ของ License)](../../shared/decisions/decisions-046.md))** แล้วทดสอบที่ `ReplayUntil−1s / ReplayUntil / ReplayUntil+1s` (สัญญากำหนดเพียง `ReplayUntil ≤ CompletedAt+900s` จึงห้ามคาดหวังจาก offset จาก CompletedAt โดยตรง )

ผลที่คาด: assert ได้เต็มตาม BR-027-01 + license-admin-security Rev1 — `/v2/admin/licenses`; auth ยังไม่ configured→`503 AUTH_NOT_CONFIGURED`; ไม่มี/ผิด/ถูกถอน→`401 UNAUTHORIZED`, หมดอายุ→`401 SESSION_EXPIRED`; channel ผิด→`403 CHANNEL_NOT_ALLOWED`; channel `staff_admin` แต่ไม่มี `license_admin` active→`403 STAFF_ROLE_REQUIRED` (staff_admin/release_publisher เพียงลำพังไม่ให้สิทธิ์ License); `/v1/admin` static bearer สร้าง/ดูไม่ได้ · replay: คืน key เดิมเฉพาะ `(SchoolId,Principal,Operation,RequestKey,RequestHash)` เดิม+ยังมีสิทธิ์+license ไม่ถูก revoke; TTL 15 นาที **(ผู้ใช้อนุมัติตาม decisions-046)** ตรวจ read-time ทุกครั้งแม้ purge ยังไม่รัน ไม่ต่อ TTL เมื่อ retry; ก่อน `ReplayUntil`→คืนผลเดิม, ที่/หลัง `ReplayUntil`→`409 IDEMPOTENCY_EXPIRED`+`details.resource_id` ไม่สร้าง key ใหม่ ไม่คืน ciphertext; ล้าง ResultCipher+ResultKeyId คู่กัน คง tombstone; `Cache-Control: no-store`; list ไม่มี key/hash/device IDs; ผู้เรียกมีสิทธิ์: valid→201+key เดียว 1 เครื่อง; ชื่อว่าง/whitespace/หมดอายุ→4xx; สร้างหลายเครื่องไม่ได้; list มี activated_devices 0|1; /v1/admin ทั้ง static bearer และ staff session สร้าง/ดูไม่ได้ ตรวจ DB rows ไม่เปลี่ยน ไม่ assert status ที่ AC ไม่ระบุ

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-008"></a>

## TP001-008 — restart ทุก instance

AC: [AC-027-04 (ผู้เรียกที่มีสิทธิ์ (ตาม BR-027-01) สร้าง License แล้ว restart API…)](../../modules/app-shell/shared/requirements/req-027.md), [AC-036-03 (Restart บริการแล้ว Login บัญชีเดิมยังเรียกโครงงานที่บันทึกสำเร็จได้)](../../modules/app-shell/shared/requirements/req-036.md) · References: DES-002, [DES-003 (หลายโครงงาน Local/Cloud)](../design/des-003.md) · Level: integration · Profiles: PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: license+Cloud project ที่บันทึกสำเร็จ

ขั้นตอน: restart ทุก instance; kill ระหว่าง commit; inject DB commit fail แล้ว restart

ผลที่คาด: หลัง restart list (License สร้าง/เรียกผ่าน /v2/admin ด้วยผู้เรียกที่มีสิทธิ์ตาม BR-027-01; AC-027-04)/Login บัญชีเดิม/โครงงานเดิมครบ; commit fail ไม่รายงานสำเร็จและไม่มีแถวค้างครึ่ง

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · TTL = Time to Live หรืออายุที่ใช้งานได้
