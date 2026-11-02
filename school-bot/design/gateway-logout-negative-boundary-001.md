# Logout negative boundary

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

HTTP API Gateway entry ปัจจุบันคือ SchoolBotAuthController → SchoolBotLogoutService ตาม [controller entry Rev2](gateway-controller-entry-001.md); direct invocation ฝั่ง HTTP API Gateway ใช้ controller/service ไม่ใช่ middleware.

## วิธีอ่าน

อ่านส่วนต่อด้านล่างตามลำดับ สัญญาและหลักฐานคง Rev เดียวกัน ทุกตารางและเงื่อนไขเดิมอยู่ในส่วนต่อ.

1. [Error table](gateway-logout-negative-boundary-001-contract.md)
2. [Validator rules](gateway-logout-negative-boundary-001-validation.md)
