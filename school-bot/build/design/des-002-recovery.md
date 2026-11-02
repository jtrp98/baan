# DES-002 — License และ device binding — สถานะในเครื่องและข้อผิดพลาด

> Rev 3 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

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

## ทางเลือกและการตรวจ

ปัดตก bearer cache ไม่ลงนาม, machine ID อย่างเดียว, frontend gate และรอ 3 วันก่อนย้าย ขัด trust/มติ ใช้ fake clock, multi-instance transaction races, lost response, replay หลัง unbind/revoke และ expiry boundary ทดสอบ [AC-028 (เกณฑ์ตรวจรับเรื่องActivate, validate และจำกัดอุปกรณ์)](../../modules/app-shell/shared/requirements/req-028.md) และ [AC-034 (เกณฑ์ตรวจรับเรื่องตรวจ License ออนไลน์และสิทธิ์ออฟไลน์ 3 วัน)](../../modules/app-shell/shared/requirements/req-034.md) และ [AC-035 (เกณฑ์ตรวจรับเรื่องผู้ดูแลปลดเครื่องและย้าย Key เดิม)](../../modules/app-shell/shared/requirements/req-035.md) ทุกข้อ; [AC-027-01 (เมื่อระบบยืนยันตัวตนพนักงานที่ `/v2/admin` ยังไม่ถูกตั้งค่า เรียก admin API ได้ 503; ไม่มี staff session หรือ session/token ไม่ถูกต้อง ได้ 401; มี session แต่ไม่มีบทบาท StaffRole ที่ active ซึ่งมีสิทธิ์จัดการ License ได้ 403; เรียก `/v1/admin` ด้วย static bearer แล้วไม่สามารถสร้างหรือดูรายการ License ได้)](../../modules/app-shell/shared/requirements/req-027.md) ใช้ 503/401/403 ตาม [role/errors/replay](license-admin-security-001.md)
