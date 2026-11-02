# DES-003 — หลายโครงงาน Local/Cloud — ทางเลือกและการตรวจ

> Rev 4 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-003 — หลายโครงงาน Local/Cloud](des-003.md)

## ทางเลือกและการตรวจ

เลือก revision+optimistic concurrency; ปัดตกหนึ่ง slot, filename ตามชื่อ, silent sync และ overwrite หลัง conflict ทดสอบสองงานต่อสามโหมดทั้งสอง stores, restart durability, save timeout/retry, corrupt file และ migration rerun ตาม [AC-011 (เกณฑ์ตรวจรับเรื่องบันทึกและเปิดหลายโครงงาน)](../../modules/my-work/shared/requirements/req-011.md) และ [AC-036 (เกณฑ์ตรวจรับเรื่องGuest Local และ Login Cloud)](../../modules/app-shell/shared/requirements/req-036.md)
