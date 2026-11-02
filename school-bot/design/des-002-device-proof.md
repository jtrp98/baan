# DES-002 — License และ device binding — ข้อเสนอการเก็บ key และตัวตนอุปกรณ์

> Rev 3 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-002 — License และ device binding](des-002.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `S` = SchoolId; `U` = UUID; `D` = UTC instant; `H` = SHA-256 hex 64 ตัว; `P` = profile ที่ระบุโรงเรียน kind และ id ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## ข้อเสนอการเก็บ key และตัวตนอุปกรณ์

Host เก็บ License Key และ device private key ใน Windows protected credential store หรือ macOS Keychain แยกจาก user-login tokens; ไม่เก็บใน localStorage/project/log ไม่มี secret signer ใน Desktop

Device ใช้ P-256 key pair; `device_jkt` เป็น JSON Web Key (JWK) thumbprint การคัดลอก device-id/entitlement อย่างเดียวใช้ไม่ได้ ต้องพิสูจน์ private key ด้วย OS store ทุกครั้งที่เปิดแอป Key store ใช้ไม่ได้ต้อง locked ไม่ fallback temp/plaintext

การผูกนี้พิสูจน์ installation key ไม่รับรอง physical uniqueness ต่อผู้มีสิทธิ์ administrator หรือ cloned VM ต้องยืนยันวิธี machine/shared-user custody ก่อน implementation ไม่เปลี่ยนมติหนึ่งเครื่องต่อ Key

## API และ proof

ทุก path ด้านล่างเขียนเต็มแล้ว เป็น HTTP semantics ที่ client → HTTP API Gateway (`sb-api-gateway`); HTTP API Gateway (`sb-api-gateway`) → SchoolBot gRPC service ใช้ gRPC ตาม [Gateway](gateway-integration-001.md); license key ≤256 ตัวอักษร ส่ง body ผ่าน HTTPS เท่านั้น

| Method/path | Input | Result |
|---|---|---|
| POST /v2/device-challenges | `{device_jwk}` | 200 `{challenge,server_time,expires_at}` |
| POST /v2/licenses/activate | `{key,device_jwk,challenge,proof}` | 200 EntitlementResult |
| POST /v2/licenses/validate | `{key,binding_id:K,challenge,proof}` | 200 EntitlementResult |
| GET /v2/admin/licenses | pagination | LicenseView list |
| POST /v2/admin/licenses | `{school_id,school_name,expires_at}` | 201 `{license:LicenseView,key}` |
| POST /v2/admin/licenses/{id}/revoke | `{reason}` + If-Match | 200 LicenseView |
| POST /v2/admin/licenses/{id}/unbind | `{reason,next_device_jkt:H?}` + If-Match | 200 LicenseView |

`LicenseView={id:K,school_id:S,school_name,key_hint,expires_at,revoked,activated_devices:0|1,update_date:D}` ไม่คืน hash/device IDs; response ของ resource เดี่ยวส่ง `ETag` จาก `UpdateDate`; revoke/unbind ใช้ `If-Match` ตาม [กฎกลาง](data-contract-rules.md) ไม่รับ `version` จาก client
`EntitlementResult={valid:true,license_id:K,binding_id:K,entitlement,checked_at,expires_at}` เป็น host-only; UI ได้เพียงสถานะ/กำหนดอายุ

Challenge เป็น server-signed JSON Web Signature (JWS) ผูก device_jkt, nonce สุ่ม, issued_at และ expiry 120 วินาที Proof เป็น device-signed JWS ผูก challenge, HTTP method/path, Idempotency-Key และ SHA256 ของ canonical JSON body ที่ตัด proof ออก ใช้ JSON Canonicalization Scheme (JCS); ตรวจ nonce ไม่ถูกใช้กับ operation อื่น

API Cloud ใช้ device proof ผูก hash ของ access token เพิ่มด้วย และตรวจ binding ปัจจุบัน การ retry mutation ใช้ RequestKey เดิม; signed GET replay ในช่วง challenge ไม่สร้าง mutation

`/v2/admin/licenses/{id}` ใช้ K; server สร้าง License/Binding PK และคืน ID เดิมเมื่อ replay; device identity/proof ไม่ใช่ PK. Challenge nonce:U และ Idempotency-Key:U เป็น proof identifiers ไม่ใช่ table keys

License admin ใช้ staff_admin + active license_admin; 503 AUTH_NOT_CONFIGURED / 401 / 403 STAFF_ROLE_REQUIRED ตาม [role/errors/replay](license-admin-security-001.md); ไม่เปิด v1 static bearer

