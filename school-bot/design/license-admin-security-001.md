# License admin authorization และ replay

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## เอกสารอ้างอิง

[DES-002 (License และ device binding)](des-002.md) · [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md) · [GAP-02 (ช่องว่างสิทธิ์ License admin และ replay)](license-admin-security-001.md) · [SEC001-009 (อายุข้อมูลลับที่เก็บเพื่อ replay License key)](license-admin-security-001.md) · [REQ-027 (จัดการ license ผ่าน admin API)](../requirement/req-027.md)

ต่อจาก [DES-002](des-002.md), [DES-004](des-004.md) และ [กฎกลาง](data-contract-rules.md); GAP-02/SEC001-009. สถานะอยู่ที่ [index](index.md)

## Authorization

ทุก License admin operation ต้องมี session `Channel=staff_admin` และ `SchoolBotStaffRole.Role=license_admin` ที่ active (`IsDelete=false`, ถึง `ValidFrom` และยังไม่ถึง `ValidUntil` ถ้ามี) ของพนักงานที่ยืนยันแล้ว; role `staff_admin` หรือ `release_publisher` เพียงอย่างเดียวไม่ให้สิทธิ์ License. ตรวจ session/role ณ request, ก่อน commit และก่อน replay. ระบบ auth ยังไม่ตั้งค่า → `503 AUTH_NOT_CONFIGURED`; ไม่มี/ผิด/ถูกถอน token → `401 UNAUTHORIZED`, หมดอายุ → `401 SESSION_EXPIRED`; channel ผิด → `403 CHANNEL_NOT_ALLOWED`; channel ถูกแต่ไม่มี role ที่กำหนด → `403 STAFF_ROLE_REQUIRED`. ไม่เปิด `/v1/admin` static bearer ตาม REQ-027.

## Create-license replay

- Create key replay คืน key เดิมเฉพาะ `SchoolId+Principal+Operation+RequestKey+RequestHash` เดิมและยังมี `license_admin`; ตรวจว่า License ไม่ถูก revoke ก่อนคืน key. TTL **15 นาที (ผู้ใช้อนุมัติตาม decisions-046)**: `ReplayUntil ≤ CompletedAt+900 วินาที`; ใช้เวลาฝั่ง server และตรวจ `now < ReplayUntil` ทุกครั้งแม้ purge ยังไม่รัน ไม่ต่อ TTL เมื่อ retry. ตั้งแต่ `now >= ReplayUntil` คืน `409 IDEMPOTENCY_EXPIRED` พร้อม `details.resource_id` เมื่อยังมีสิทธิ์; ไม่สร้าง Key ใหม่และไม่คืน ciphertext/key. ผู้ดูแลใช้ revoke/create เดิมเมื่อกู้ key ไม่ได้
- เมื่อพ้น ReplayUntil ล้าง `ResultCipher` และ `ResultKeyId` พร้อมกันด้วย cleanup/read-time cleanup ที่ retry ได้; คง tombstone/ResourceId ป้องกันซ้ำ. envelope key อยู่นอก DB/API host ตาม [custody](signing-custody-001.md); backup ต้องไม่ทำให้ decrypt secret พ้น TTL ได้ (ต้องมีหลักฐานการหมดอายุของ key/material ไม่ใช่อาศัย purge live DB อย่างเดียว). ใช้ `Cache-Control: no-store`, ปิด body logging และไม่ใส่ key ใน audit/error/list/ETag; ไม่ลบหลังอ่านครั้งแรกเพราะ response อาจสูญหาย

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

หลักฐาน DDL ตาราง `SchoolBotIdempotency` ใน `db/schoolbot_db.sql` มีฟิลด์และ pair CHECK อยู่แล้ว; API ปัจจุบัน `Program.cs:107–122` ยังเป็น v1 static bearer. ไม่เปลี่ยน schema; เงื่อนไขนี้เป็นข้อเสนอ tightening ตาม security-mitigation-001 ไม่ใช่ผล re-audit. ปัดตก replay24ชั่วโมงสำหรับ key และการลบหลังอ่านครั้งแรก เพราะเสี่ยง secret ค้างนาน/กู้ response หายไม่ได้ตามลำดับ
