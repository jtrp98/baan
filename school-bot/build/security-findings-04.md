# รายละเอียดความปลอดภัยและเงื่อนไขการแก้

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

TTL คือ Time to Live หรือระยะเวลาที่อนุญาตให้เก็บหรือใช้; JWS คือ JSON Web Signature; IPC คือ Inter-Process Communication.

ข้อสังเกตเดิมคงความหมายตามวันที่ตรวจ; สถานะปัจจุบันรวมผลตรวจต่อมาของข้อนั้น.

## SEC001-004 — Desktop ไม่บังคับ entitlement ฝั่ง host เลย: Run/Save/Load ไม่มี gate, ผล activate ถูกทิ้ง และไม่มี signed lease

**สถานะปัจจุบัน:** เปิด · Important. ต้องแก้ host gate และ signed lease แล้วตรวจซ้ำตามขอบเขตจริง.

ลักษณะข้อค้นพบ: planned_gap. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ผู้ใช้เปิดใช้ทั้งสามโหมดได้โดยไม่ต้อง activate, เรียก host method ตรงจาก webview ได้ และ frontend gate เพียงอย่างเดียวจะข้ามได้. ไม่มีข้อมูลรั่ว แต่ [REQ-009 (Desktop และการใช้งานออฟไลน์)](../modules/app-shell/shared/requirements/req-009.md), [REQ-028 (Activate, validate และจำกัดอุปกรณ์)](../modules/app-shell/shared/requirements/req-028.md) และ [REQ-034 (ตรวจ License ออนไลน์และสิทธิ์ออฟไลน์ 3 วัน)](../modules/app-shell/shared/requirements/req-034.md) จะไม่ถูกบังคับจนกว่าจะทำ host gate และ lease

วิธีแก้: ตามแบบ [DES-001 (Desktop host และ IPC)](design/des-001.md) และ [DES-002 (License และ device binding)](design/des-002.md): gate ใน host ก่อน dispatch และก่อน Save/Load, lease เป็น JWS ES256 ผูก device key และ exp=min(checked_at+259200, license_expires_at) พร้อม public root ฝังใน host, เก็บใน OS credential store แบบ fail closed ไม่ fallback เป็นไฟล์ plaintext, ตรวจ rollback ของเวลา. อย่าถือ UI gate เป็นการควบคุม

ผู้รับ: be

การตรวจซ้ำ: jpo re-audit: เรียก bridge ตรงโดยไม่มีสิทธิ์ต้องไม่ dispatch, copy lease ข้ามเครื่องต้องใช้ไม่ได้, denial ชนะ cache, restart ไม่ต่ออายุ ตาม [AC-034 (เกณฑ์ตรวจ License ออนไลน์และสิทธิ์ออฟไลน์ 3 วัน)](../modules/app-shell/shared/requirements/req-034.md)

## SEC001-005 — Device binding เป็น ID สุ่มที่คัดลอกได้ และไม่มี unbind จึงทั้งใช้ซ้ำข้ามเครื่องและเกิดการล็อก seat ได้

**สถานะปัจจุบัน:** เปิด · Important. ต้องพิสูจน์ device proof, race และ unbind.

ลักษณะข้อค้นพบ: planned_gap. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ใครคัดลอกไฟล์ device-id ไปเครื่องอื่นจะใช้ seat เดียวกันได้ไม่จำกัด. ผู้ถือ key ที่รั่วส่ง device_id สุ่มจนเต็ม DeviceLimit ได้ทำให้เครื่องจริงถูกปฏิเสธ (409) และไม่มี unbind ให้ผู้ดูแลแก้ ตรงข้ามกับ [REQ-035 (ผู้ดูแลปลดเครื่องและย้าย Key เดิม)](../modules/app-shell/shared/requirements/req-035.md). ผลกระทบเป็นเชิงสิทธิ์การใช้งาน ไม่ใช่ข้อมูลส่วนบุคคล

วิธีแก้: ใช้ P-256 device key ใน OS store พร้อม challenge และ proof ตาม DES-002 (device_jkt แทน device-id), unbind ผ่าน admin พร้อม If-Match และ BindingEpoch, rate limit ต่อ license และต่อ IP, ล็อกการ activate ที่ล้มเหลวซ้ำ. ยอมรับตามที่ DES-002 ระบุว่า key store ไม่ป้องกัน cloned VM หรือผู้ใช้ที่เป็น administrator

ผู้รับ: be

การตรวจซ้ำ: jpo re-audit: race สองเครื่องเหลือ 1 binding, คัดลอก state ข้ามเครื่องต้องปฏิเสธ, unbind แล้วเครื่องเก่าต่อ lease ไม่ได้ ตาม [AC-035 (เกณฑ์ปลดเครื่องและย้าย Key เดิม)](../modules/app-shell/shared/requirements/req-035.md)

## ยังไม่ยืนยัน

ข้อมูลที่ยังต้องพิสูจน์ระบุในสถานะปัจจุบันและวิธีตรวจซ้ำของแต่ละข้อ. การแก้แบบยังไม่ยืนยัน implementation; ตัวเลข TTL/limit เดิมยังต้องยืนยัน ยกเว้น replay 15 นาทีตาม [มติ 046 (อนุมัติ replay License 15 นาที)](../shared/decisions/decisions-046.md).

## หลักฐาน

- SEC001-004: app/desktopservice.go:98-107,118-124; app/desktopstorage.go:103-141; app/frontend/src/core/client.ts:55-94; knowledge/school-bot/design/des-001.md:5-8,28
- งานที่รับข้อค้นพบนี้: BE-007, BE-004, BE-010, FE-001
- SEC001-005: app/desktopservice.go:70-81; app/desktopstorage.go:45-52; ManagementService.cs:51-58; SchoolLicense.cs:20-27; Program.cs:109-118
- งานที่รับข้อค้นพบนี้: BE-004, BE-005, BE-007
