# Gateway integration — Trust boundary และ failure

> Rev 5 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway integration (เส้นทาง/controller)](gateway-integration-001.md) คงให้ SchoolBot service เป็น authority ของ opaque session และ tenant; Gateway เป็น HTTP edge และ gRPC client

## การแยก credential และ identity

- Exchange ส่งเฉพาะ legacy credential ที่จำเป็นไป SchoolBot แล้ว SchoolBot ส่งไป private Gateway หลังแลก resource ส่งเฉพาะ SchoolBot Bearer ไม่พก legacy credential ต่อ
- BFF เป็นทางส่ง ไม่ผลิตสิทธิ์ admin BFF อ่าน `__Host-sb-admin` ใน session ของตน แปลงเป็น Bearer ฝั่ง server ไม่ส่ง Cookie ไป Gateway/SchoolBot; mutation ตรวจ Origin และ Cross-Site Request Forgery (CSRF) ก่อนใช้ cookie
- ตัด identity/tenant headers จาก client รวม x-school-id/x-user-id, forwarding และ hop-by-hop headers สร้าง forwarding metadata เฉพาะ trusted proxy ไม่ใช้ header suffix/body เป็น SchoolId หรือสิทธิ์ SchoolId ของ resource มาจาก SchoolBot session; ตอน exchange มาจาก introspection ที่ตรวจแล้ว
- ใช้ request/response header allowlist ตาม endpoint เช่น Content-Type, Accept, Authorization, Origin, ETag/If-Match, Idempotency-Key, Retry-After, request-id ไม่ส่ง Cookie/Set-Cookie, secret หรือ connection string เกินจำเป็น ไม่ log token/body หรือชื่อ JabjaiWebKey ที่มีตัวตน
- Upstream origin/port/path ตั้งฝั่ง server ด้วย allowlist ไม่รับ Host/URL override ตรวจ normalized path ป้องกัน traversal ไม่ follow redirect/auto-cookie และไม่ retry mutation อัตโนมัติ จำกัด timeout/body/cancellation ตาม endpoint; ส่วน gRPC ใช้ RPC/metadata/deadline/retry contract ที่ [สัญญา gRPC](gateway-grpc-contract-001.md)
- เส้นข้าม host ใช้ Transport Layer Security (TLS) และตรวจ certificate เจ้าของ infra ระบุ termination/network จริงก่อนเปิดเส้นทาง ค่า HTTP default ใน source ไม่พิสูจน์ TLS; SchoolBot upstream ไม่ชี้กลับ Gateway/BFF และ introspection URL ชี้เฉพาะ private Gateway route

## Private web-principal

ใช้ JabjaiWebLegacy scheme ที่ตรึงไว้และ authenticated policy ไม่ใช้ MenuPermission เฉพาะเมนู ปฏิเสธ purpose/aud, missing school หรือไม่มีทั้ง user/admin ตาม security-mitigation-001 (memory) ใช้ raw user_id/admin_id ไม่ใช้ Sid ที่รวมสองค่า

คง expires_at=null ตาม [มติ 025 (ยอมรับ token เว็บไม่มี exp สำหรับ exchange)](../../shared/decisions/decisions-025.md), no-store และ rate limit identity ที่ยังไม่ตรวจใช้ IP partition Network/service identity แยกจาก credential ของผู้ใช้ แหล่ง is_admin ใช้ [เกณฑ์ admin ฝั่ง server](gateway-integration-admin.md)

## Error และผล mutation

ผลจาก SchoolBot ส่งกลับ status/body ตามสัญญา client เดิม Transport failure ก่อนถึง SchoolBot ใช้ gateway envelope เดิมที่ sanitize แล้ว: ติดต่อ upstream ไม่ได้ 502, timeout 504, maintenance 503 ไม่รายงาน mutation สำเร็จ RPC/error mapping ราย operation ใช้ [สัญญา gRPC](gateway-grpc-contract-001.md) และ [logout negative boundary](gateway-logout-negative-boundary-001.md) โดยคง error pairs, metadata accounting, correlation, trace/lang และ trailers

Exchange: introspection token ไม่ผ่าน 401; unavailable/timeout 503 AUTH_UNAVAILABLE; identity/mapping ยังไม่พร้อม 503 AUTH_NOT_CONFIGURED; ไม่มี License 403 LICENSE_REQUIRED ตาม [DES-012 exchange](des-012-exchange.md) ไม่มี fallback ยกระดับสิทธิ์

## เจ้าของหลักฐานก่อนเปิดใช้

| เจ้าของ | สิ่งที่ต้องพิสูจน์ |
|---|---|
| Gateway/Light | opaque isolation, private endpoint, route/rate-limit/log และ protected paths review; local logout มีขอบเขตหลักฐานแยกจาก Login/exchange |
| web-system/admin BFF | Gateway mapping, credential filtering, Origin/CSRF |
| SchoolBot/sys | exchange/session/Channel/License/revocation และ staff_admin bootstrap |
| infra/Gateway/SchoolBot | public/private origin, service upstream, TLS/allowlist/service access, secret แยกหรือ fallback; ระบุ key name/owner/deploy status โดยไม่ส่งค่า |
| legacy/vault | พิสูจน์ login TAdmin, account/profile mapping, collation, hash/culture และ student login |

H5 คือเงื่อนไข env/route/network/trust ระหว่างระบบ เจ้าของแต่ละ process กำหนดชื่อ env ใหม่ web-system ใช้ GATEWAY_API_URL ตามหลักฐานเดิม ไม่ตั้ง SCHOOL_BOT_API_URL ชี้ SchoolBot ตรงโดยอัตโนมัติ

## ยังไม่ยืนยัน

ชื่อ host/env/instance, secret owner และ trust/tenant integration จริงยังไม่มีหลักฐานยืนยันครบ Gateway convention ที่กำหนด tenant จาก JWT ต้องตรวจให้เข้ากับ SchoolBot opaque session โดยไม่สร้าง legacy principal จาก opaque token ต้องได้ผล Gateway/Light review และ H5/TLS/peer/runtime ตามขอบเขตจริง

## หลักฐาน

- Gateway `AGENTS.md:29,35–37` ตามที่เอกสารเดิมอ้าง: REST→gRPC, tenant จาก JWT และ Light review ของ hosting/auth pipeline งานนี้ไม่ได้เปิดอ่าน AGENTS.md หรือ source เพิ่ม
- [หลักฐาน integration](gateway-integration-evidence.md) แยก local implementation จากสิ่งที่ยังไม่ได้ตรวจ; ไม่มี schema change/SQL/DBML ในงานเรียบเรียง
