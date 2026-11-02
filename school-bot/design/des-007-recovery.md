# DES-007 — Release และ trusted update — ข้อผิดพลาด การกู้คืน และเงื่อนไขที่ต้องรักษา

> Rev 3 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-007 — Release และ trusted update](des-007.md)

## อ้างอิง

- [GAP-07 (ขอบเขต workflow ดาวน์โหลดและติดตั้งอัปเดต)](update-disposition-001.md)
- [REQ-030 (ตรวจข้อมูลอัปเดตจาก Desktop)](../requirement/req-030.md)
- [BE-019 (งาน Update check/Prepare/Install)](../plan/index.md)
- [OQ-011 (กลุ่มเครื่องและเกณฑ์ยอมรับการส่งมอบ)](../open-questions/oq-011.md)

## ข้อผิดพลาด การกู้คืน และเงื่อนไขที่ต้องรักษา

400 INVALID_RELEASE/INVALID_ARTIFACT; 409 RELEASE_EXISTS/RELEASE_NOT_PUBLISHED; 403 ARTIFACT_UNTRUSTED; 409 UPDATE_NOT_APPLICABLE/APP_BUSY; local DOWNLOAD_FAILED, HASH_MISMATCH, INSTALL_FAILED

Hash/signature/expiry ผิด: ไม่ execute, ไม่ replace แอป ใช้งานเวอร์ชันเดิมต่อได้ภายใต้ License; download retry เป็นการอ่าน ไม่ใช่ install retry อัตโนมัติ Withdraw ห้ามเริ่ม download/install ใหม่ แต่ไม่อ้างถอน binary ที่ติดตั้งแล้ว

Installer จัดการ files-in-use โดยขอให้ผู้ใช้ปิด ไม่ kill process ไม่ overwrite binary ที่เปิดอยู่ Cancellation ต้องรอ installer outcome ไม่ปลอมเปอร์เซ็นต์หรือถือว่า cancel=rollback สำเร็จ

Windows ใช้ transaction/repair ของ MSI; Mac ไม่อ้างว่า PKG rollback เทียบเท่า MSI ต้องตรวจ bundle หลัง failure และเสนอ repair ด้วย signed package ที่เหมาะสม ห้าม auto-downgrade; recovery release ใช้ version ใหม่ หรือ IT procedure ที่มนุษย์อนุมัติ

เก็บ Projects/Device identity/credential store เมื่อถอนตามนโยบายเดิม การล้างข้อมูลส่วนบุคคลเป็น operation แยกที่ต้องกำหนด ไม่รวม API ใน installer

## ความเข้ากันได้ ทางเลือก และการตรวจ

คง `/v1/updates/check` เป็น metadata-only และไม่เปลี่ยน [AC-030-01 (เมื่อไม่มี published release ใหม่กว่า ผลตรวจมี available=false, release=null และ install_supported=false)](../requirement/req-030.md) และ [AC-030-02 (เมื่อมี release ที่เข้าเงื่อนไข ผู้ใช้เห็น metadata แต่ไม่มีไฟล์ถูกดาวน์โหลด ติดตั้ง หรือ execute จากการตรวจ)](../requirement/req-030.md) Download/install ใหม่เป็น explicit workflow ที่ต้องทบทวนก่อน build; ไม่มีการเลือกตัด scope

Disposition GAP-07/REQ-030/BE-019: [update-disposition-001.md](update-disposition-001.md) มีทางเลือก/ผลกระทบ/คำถามผู้มีอำนาจครบ; arch แนะนำเสนอคง explicit workflow แต่ยังไม่เพิ่ม AC หรือตัด scope

ปัดตก checksum อย่างเดียว, arbitrary updater script และ unsigned silent install ใช้ repository package/version/resource/notices checks เดิม เพิ่ม trust verification

ตรวจ clean Windows install/repair/uninstall/upgrade/WebView2 และ Mac Universal Intel/ARM64; ตรวจ payload ไม่มี secrets/maps/debug tools เกณฑ์ OS ขั้นต่ำและ signing owner รอ OQ-011 ไม่มีผลทดสอบในงานนี้
