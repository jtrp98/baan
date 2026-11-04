# Gateway–SchoolBot — authentication และ Desktop compatibility

> Rev 4 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

Resource API ปัจจุบัน reuse Gateway JWT ที่ผ่าน full login ไม่ออก SchoolBot opaque session ใหม่ ไม่มี Login/ExchangeWebSession/Logout RPC ใน proto ทั้งห้า service; session storage ยังอยู่เพื่อ snapshot compatibility เท่านั้น

## งาน integration ที่ยังค้าง

Desktop ต้องต่อ Login/continuation ของ Gateway ให้ครบ password-change/2FA/contact/device verification แล้วใช้ JWT ที่พ้น temporary state สำหรับ resources; การ decode token หรือพบ HTTP200 ไม่เพียงพอยืนยัน full login ต้องตรวจ tenant/account/profile linkage กับระบบจริง ไม่เลือกหลาย upstream แบบลอง password

Desktop source ปัจจุบัน defaultAPIURL=`http://localhost:8080`, override ผ่าน SCHOOL_BOT_API_URL หรือ ARM_API_URL; CheckUpdates เรียก `/v1/updates/check`; license Host เรียก `/v2/device-challenges`, `/v2/licenses/activate`, `/v2/licenses/validate` เป็น HTTP จริง และยังไม่แนบ Authorization Bearer/X-Device-Entitlement สำหรับ resource API การเปลี่ยน base URL อย่างเดียวจึงยังไม่เชื่อม Gateway ใหม่ ต้องย้าย HTTP paths เป็น versionless Gateway prefix และต่อ auth flow

ค่า `/v2/licenses/activate` และ `/v2/licenses/validate` ใน signed device proof เป็น canonical signature paths ตาม contract ต้องคงไว้แยกจาก public HTTP path การย้าย URL ห้ามเปลี่ยนค่าลายเซ็นตามโดยอัตโนมัติ

Web ต้องผ่าน same-origin BFF พร้อม cookie/CSRF/Origin policy และส่ง JWT ไป Gateway ไม่พบหลักฐาน end-to-end ของ BFF จริงในการตรวจรอบนี้; legacy private introspection/session admission เป็นข้อกำหนด/หลักฐานรุ่นก่อนที่ต้อง reconcile กับ JWT flow ปัจจุบัน ไม่ถือว่า implement แล้ว

## หลักฐาน

SchoolBot app/desktopservice.go:28,111, app/internal/license/host.go:95,113,117,221 เป็นต้นไป; Gateway SchoolBotHttpPipeline.IdentityAsync; handoff005 และใบงาน101/103 (memory) ไม่มีหลักฐานใหม่ที่แทน HostServer fixture compile issue: Program.cs ยังใช้ Application.Licensing และ SchoolBotDbAdapter ที่ไม่มีแล้ว ไม่ rebuild Go หรือแจก installer ในรอบเอกสารนี้
