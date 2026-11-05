# Gateway–SchoolBot — authentication และ Desktop compatibility

> Rev 4 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

Resource API ปัจจุบัน reuse Gateway JWT ที่ผ่าน full login ไม่ออก SchoolBot opaque session ใหม่ ไม่มี Login/ExchangeWebSession/Logout RPC ใน proto ทั้งห้า service; session storage ยังอยู่เพื่อ snapshot compatibility เท่านั้น

## งาน integration ที่ยังค้าง

Desktop ต้องต่อ Login/continuation ของ Gateway ให้ครบ password-change/2FA/contact/device verification แล้วใช้ JWT ที่พ้น temporary state สำหรับ resources; การ decode token หรือพบ HTTP200 ไม่เพียงพอยืนยัน full login ต้องตรวจ tenant/account/profile linkage กับระบบจริง ไม่เลือกหลาย upstream แบบลอง password

Desktop ใช้ Gateway prefix `/api/service-school-bot` สำหรับ update check, device challenge, license และ resource API พร้อม Gateway JWT/X-Device-Entitlement ตามชนิดคำขอ; defaultAPIURL=`http://localhost:8080` และ override ผ่าน SCHOOL_BOT_API_URL หรือ ARM_API_URL การเปิดใช้จริงยังต้องตั้ง Gateway origin และผ่าน transport/authority gates

Signed device proof ใช้ `/api/service-school-bot/licenses/activate` หรือ `/api/service-school-bot/licenses/validate` ตรงกับ HTTP path ทั้งตัวสร้างบน Desktop และตัวตรวจฝั่ง SchoolBot ไม่มี alias ของ API เดิม ต้องอัปเดต client/server คู่กัน

Admin ของ sb-helper ใช้ session login เดิมและ BFF `/api/service-school-bot/admin/...`; Helper สร้าง JWT assertion ฝั่ง server แล้วส่งไป Gateway ด้วย prefix เดียวกัน ไม่ส่ง JWT/private key กลับ Browser

Web ต้องผ่าน same-origin BFF พร้อม cookie/CSRF/Origin policy และส่ง JWT ไป Gateway ไม่พบหลักฐาน end-to-end ของ BFF จริงในการตรวจรอบนี้; legacy private introspection/session admission เป็นข้อกำหนด/หลักฐานรุ่นก่อนที่ต้อง reconcile กับ JWT flow ปัจจุบัน ไม่ถือว่า implement แล้ว

## หลักฐาน

SchoolBot app/desktopservice.go:28,111, app/internal/license/host.go:95,113,117,221 เป็นต้นไป; Gateway SchoolBotHttpPipeline.IdentityAsync; handoff005 และใบงาน101/103 (memory) ไม่มีหลักฐานใหม่ที่แทน HostServer fixture compile issue: Program.cs ยังใช้ Application.Licensing และ SchoolBotDbAdapter ที่ไม่มีแล้ว ไม่ rebuild Go หรือแจก installer ในรอบเอกสารนี้
