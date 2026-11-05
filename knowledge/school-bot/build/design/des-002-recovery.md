# DES-002 — License และ device binding — สถานะในเครื่องและข้อผิดพลาด

> Rev 4 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (ระบุ setup ตรวจ race ของ License writers บน store ร่วม)

ส่วนต่อของ [DES-002 — License และ device binding](des-002.md)

## สถานะในเครื่องและข้อผิดพลาด

`unactivated → valid → expired|denied|clock_untrusted`; online Active เท่านั้นกลับ valid

เก็บ token/key/clock anchor แบบ atomic generation เดียว ก่อน unlock Anchor มี server UTC, observed wall time และ max effective UTC; session ใช้ monotonic elapsed ร่วมกับ wall time ไม่ให้เวลาถอย ทุกเริ่ม session/resume ตรวจ rollback เทียบ anchor และ persist high-water mark ก่อนอนุญาตงาน; rollback หรือข้อมูลเสียต้อง online ใหม่ Clock เดินหน้าอาจหมดสิทธิ์เร็ว แต่ห้ามย้อนกลับเพื่อคืนสิทธิ์

การ rollback ทั้ง disk/OS store โดย privileged attacker ยังเป็นข้อจำกัด ไม่อ้างป้องกันสมบูรณ์

| ผลตรวจ | พฤติกรรม |
|---|---|
| 403 LICENSE_INVALID / LICENSE_INACTIVE / BINDING_REVOKED | บันทึก denied, invalidate cache, ไม่ renew |
| 403 DEVICE_NOT_ACTIVATED / DEVICE_PROOF_INVALID | ไม่ unlock/renew; ให้ recovery |
| network/5xx/429 | ใช้สิทธิ์เดิมได้เฉพาะยัง valid; ไม่เลื่อน expiry |
| malformed success / signature ผิด | ไม่รับสิทธิ์ใหม่; คืน INVALID_ENTITLEMENT |
| 403 ไม่ทราบ code | locked รอ online recovery ไม่ตีความ Active |
| credential write ล้มเหลว | CREDENTIAL_STORE_FAILED; ไม่รายงาน activated พร้อมใช้ |

เครื่องเก่าออฟไลน์หลังย้ายใช้ได้ถึง exp เดิมตามมติ; เมื่อรู้ผลปฏิเสธออนไลน์ต้องหยุดใช้ cache Login/logout ไม่ต่ออายุหรือเพิกถอน License โดยตัวมันเอง

## Setup สำหรับ writer และผู้ตรวจ

ทดสอบแยกครบสอง backend ใน **หนึ่ง process**: memory ใช้ **SchoolBotDbAdapter สอง instance + store object เดียวกัน**; file ใช้ **adapter สอง instance + FileSchoolBotBackingStore สอง object ชี้ canonical directory เดียวกัน** ใช้ service คนละ instance และให้ทั้งคู่โหลด cache ก่อนเกิด race ใช้ License เดียว, device keys P-256 A/B, proof/challenge จริง และ admin ที่มีสิทธิ์พร้อม If-Match ล่าสุด

Proxy/barrier พักได้เฉพาะ scheduling ที่ขอบ service→commit/adapter หลังอ่านและตรวจ proof ก่อนเข้า store lock; ห้ามถือ store lock ขณะรอให้ unbind/revoke commit และห้ามแก้ record หรือปลอมผล อ่านผลจาก store/adapter instance ที่สาม และเปิด file backend ใหม่เพื่อตรวจ persistence ไม่ตรวจเพียง cache ผู้เขียน

| กรณี | ลำดับควบคุม | ผลที่ต้องได้ |
|---|---|---|
| Validate หลัง unbind | A activate; พัก validate ก่อน commit; อีก adapter unbind ได้ 200; ปล่อย validate | `403 BINDING_REVOKED`; pointer null, epoch เพิ่มหนึ่ง, DetachedAt เก่าคงเดิม; LastCheckedAt/lease/audit/idempotency ไม่เปลี่ยนจากหลัง unbind |
| Activate เครื่องเดิมหลัง unbind | พักเส้นทางต่อ lease ของ A ก่อน commit; unbind สำเร็จแล้วปล่อย | `403 BINDING_REVOKED`; ไม่สร้างแถว/ไม่คืน token; A activate ใหม่ด้วย challenge ใหม่ได้ `409 DEVICE_LIMIT` จน admin อนุญาต next key |
| ย้ายและอนุญาตกลับ | unbind A ไม่ระบุ next; ลอง A แล้ว activate B; ต่อมา admin unbind B ระบุ next=A | A ครั้งแรกถูกปฏิเสธ; B สำเร็จทันที; A หลังอนุญาตสร้างแถวใหม่; ประวัติทุกแถวที่ถอดยัง detached; live ไม่เกินหนึ่ง |
| Activate ใหม่ชนกัน | A/B อ่าน pointer null/epoch เดียวกัน; ให้ commit พร้อมกัน | success หนึ่ง, `409 DEVICE_LIMIT` หนึ่ง; pointer ชี้แถวเดียวที่ live ไม่มี orphan/ID ชน |
| Revoke และ ETag | พัก validate/activate ก่อน commit; อีก adapter revoke 200 แล้วปล่อย; ทดสอบ unbind/revoke สองคำขอใช้ ETag เดียว | device writer ได้ `403 LICENSE_INACTIVE` ไม่ต่อ lease; admin ที่แพ้ ETag ได้ `412 VERSION_CONFLICT` ไม่เขียนข้อมูล |
| ลำดับกลับและ write failure | ให้ lease commit ก่อน unbind; อีกชุด inject signer failure/ก่อน publish และ file publish failure | lease ที่ชนะใช้ exp เดิมได้; unbind ไม่ย้อน; failure ไม่เผยแพร่ครึ่งหน่วย; reload เห็น generation เก่าหรือใหม่ครบชุดตามจุด commit |

ทุกกรณีเปรียบเทียบ state ก่อน/หลังคำขอที่ถูกปฏิเสธ ไม่ตัดสินจาก timeout; ตรวจ current/epoch, จำนวน live, DetachedAt, lease, audit และ idempotency ร่วมด้วย Replay ต้องคืน expiry เดิมและตรวจ current/authorization ก่อนคืนผล ชุดนี้ระบุ setup ของ regression เดิมให้ชัด ไม่เพิ่ม AC หรือเปลี่ยนผู้มีสิทธิ์ลง verdict

## ทางเลือกและการตรวจ

ปัดตก bearer cache ไม่ลงนาม, machine ID อย่างเดียว, frontend gate และรอ 3 วันก่อนย้าย ขัด trust/มติ ใช้ fake clock, multi-instance transaction races, lost response, replay หลัง unbind/revoke และ expiry boundary ทดสอบ [AC-028 (เกณฑ์ตรวจรับเรื่องActivate, validate และจำกัดอุปกรณ์)](../../modules/app-shell/shared/requirements/req-028.md) และ [AC-034 (เกณฑ์ตรวจรับเรื่องตรวจ License ออนไลน์และสิทธิ์ออฟไลน์ 3 วัน)](../../modules/app-shell/shared/requirements/req-034.md) และ [AC-035 (เกณฑ์ตรวจรับเรื่องผู้ดูแลปลดเครื่องและย้าย Key เดิม)](../../modules/app-shell/shared/requirements/req-035.md) ทุกข้อ; [AC-027-01 (เมื่อระบบยืนยันตัวตนพนักงานที่ `/v2/admin` ยังไม่ถูกตั้งค่า เรียก admin API ได้ 503; ไม่มี staff session หรือ session/token ไม่ถูกต้อง ได้ 401; มี session แต่ไม่มีบทบาท StaffRole ที่ active ซึ่งมีสิทธิ์จัดการ License ได้ 403; เรียก `/v1/admin` ด้วย static bearer แล้วไม่สามารถสร้างหรือดูรายการ License ได้)](../../modules/app-shell/shared/requirements/req-027.md) ใช้ 503/401/403 ตาม [role/errors/replay](license-admin-security-001.md)

## หลักฐาน

- Setup ขยายรายละเอียด regression ของ `C:/src/schoolbright/reports/school-bot/normal-095/snapshot-rw1/check/round-095-rw1-findings.md` ไม่ใช่ผลรัน source ปัจจุบัน
- Source ตรวจ 2026-11-03 ใต้ `C:/src/schoolbright/target/school-bot/web/src/`: `SchoolBot.Application/Licensing/LicenseDeviceService.cs:151–170,239–318`; `SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.cs:270–315,340–416,447–492`
- ผลที่คาดอ้าง [CAS ของทุก writer](des-002.md#เงื่อนไขร่วมก่อน-commit), [หน่วย commit](des-002-entitlement.md#หน่วย-commit-ของแต่ละ-writer) และ [protocol store](data-contract-rules-transactions.md#protocol-ของ-license-บน-stub-และ-db) ไม่ได้รัน tests/SQL ในงานนี้
