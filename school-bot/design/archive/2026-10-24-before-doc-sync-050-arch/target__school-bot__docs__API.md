# API v1 · PoC

Base URL: `http://127.0.0.1:8080` (local dev). JSON fields เป็น `snake_case`
Desktop ใช้ `http://localhost:8080` ระหว่างพัฒนา และเรียก HTTPS Domain เมื่อ Deploy
ตั้ง URL ฝังตอน Build ด้วย `SCHOOL_BOT_BUILD_API_URL`; อ่านขั้นตอนใน `docs/DEPLOYMENT.md`
ทุก response ที่ไม่ใช่ 2xx ใช้รูปแบบเดียวกัน `{ "error": { "code": "...", "message": "..." } }` (ดูตาราง Errors)
Update metadata ไม่ได้ authorize การติดตั้ง

| Method | Path | Auth | Scope |
|---|---|---|---|
| GET | `/healthz` | none | ระบุสถานะและ Memory Store |
| GET | `/v1/updates/check?version=0.1.0&channel=stable&platform=windows-amd64` | none | เฉพาะ Published Release ที่ใหม่กว่า |
| POST | `/v1/licenses/activate` | License Key ใน body | Activate ตาม device limit |
| POST | `/v1/licenses/validate` | License Key ใน body | ตรวจ expiry/revocation/activated device |
| GET/POST | `/v1/admin/licenses` | Admin Bearer | List / create |
| POST | `/v1/admin/licenses/{id}/revoke` | Admin Bearer | Revoke |
| GET/POST | `/v1/admin/releases` | Admin Bearer | List / create draft |
| POST | `/v1/admin/releases/{id}/publish` | Admin Bearer | Publish metadata |

## Errors

| Status | `error.code` | เมื่อไร |
|---|---|---|
| 400 | `INVALID_REQUEST` | JSON เสีย/มี field เกิน/ขาด, query หาย |
| 400 | `INVALID_INPUT`, `INVALID_QUERY`, `INVALID_LICENSE`, `INVALID_RELEASE`, `INVALID_ARTIFACT` | ค่าไม่ผ่านกฎ (ความยาว, ช่วงค่า, รูปแบบ version/URL/hash) |
| 401 | `UNAUTHORIZED` | Admin bearer token หายหรือผิด |
| 403 | `LICENSE_INVALID`, `LICENSE_INACTIVE`, `DEVICE_NOT_ACTIVATED` | key ไม่พบ, หมดอายุ/ถูก revoke, device ยังไม่ activate |
| 404 | `NOT_FOUND` | ไม่มี route หรือไม่มี id |
| 405 | `METHOD_NOT_ALLOWED` | method ไม่ตรงกับ route |
| 409 | `DEVICE_LIMIT`, `RELEASE_EXISTS` | เกิน device limit, release ซ้ำ |
| 413 | `PAYLOAD_TOO_LARGE` | body เกิน 64 KB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Content-Type ไม่ใช่ `application/json` |
| 429 | `RATE_LIMITED` | เกินโควต้าต่อ IP; มี header `Retry-After` (วินาที) |
| 503 | `ADMIN_NOT_CONFIGURED` | ยังไม่ตั้ง `SCHOOL_BOT_ADMIN_KEY` (≥ 32 ตัวอักษร) หรือ legacy `ARM_ADMIN_KEY` |

Admin key อ่านจาก `SCHOOL_BOT_ADMIN_KEY` ก่อน ถ้าไม่ตั้งจึงใช้ `ARM_ADMIN_KEY` (ชื่อเดิม) และต้องยาวอย่างน้อย 32 ตัวอักษรทั้งสองชื่อ

ขีดจำกัดของคำขอ:

| รายการ | ขีดจำกัด |
|---|---|
| Request body | 64 KB (เกิน → 413 `PAYLOAD_TOO_LARGE`) |
| `school` (create license) | 1–200 ตัวอักษร |
| `device_limit` | 1–1000 |
| `key` (activate/validate) | ไม่เกิน 256 ตัวอักษร |
| `device_id` (activate/validate) | 8–128 ตัวอักษร |
| `url` / `signature` (create release) | ไม่เกิน 2048 / 4096 ตัวอักษร |

โควต้าต่อ IP ต่อนาที: `/v1/licenses/*` 30 request, `/v1/updates/check` 60 request
IP ที่ใช้คือ client IP ที่ reverse proxy ในเครื่องเดียวกันส่งมาใน `X-Forwarded-For`; ดู `docs/DEPLOYMENT.md`

## Create license

```json
{
  "school": "Demo school",
  "device_limit": 5,
  "expires_at": "2027-10-16T00:00:00Z"
}
```

201 คืน `{license, key, notice}` — key สุ่ม 256 bits และคืนครั้งเดียว (ไม่มี `Location` header เพราะไม่มี GET ต่อ id)
`expires_at` ต้องเป็นอนาคต และ response คืนเป็น UTC เสมอไม่ว่า offset ที่ส่งมาจะเป็นอะไร
GET list คืนเฉพาะ metadata รวม activated_devices ไม่คืน hash หรือ device IDs

## Activate / validate

```json
{ "key": "SBOT-<key returned by create>", "device_id": "<installation-random-id>" }
```

สำเร็จคืน `valid`, `license_id`, `school`, `expires_at`, `offline_entitlement: false`
Key ไม่ใช่ user login และ PoC ไม่มี signed offline entitlement
Activate ซ้ำ device เดิมไม่ใช้ quota เพิ่ม; อุปกรณ์ปลอมแปลง ID ได้ จึงยังไม่ใช่ production anti-copy

## Create release

```json
{
  "version": "0.2.0",
  "channel": "beta",
  "platform": "windows-amd64",
  "url": "https://your-artifact-host/school-bot-0.2.0.exe",
  "sha256": "<64 hex characters computed from the real artifact>",
  "signature": "<signature metadata from your signing pipeline>"
}
```

Supported platforms: `windows-amd64`, `darwin-amd64`, `darwin-arm64`
Version ใน PoC รับเฉพาะเลข `x.y.z` ไม่มีศูนย์นำหน้า newline หรือ whitespace (no prerelease/build metadata); channel ใช้ stable/beta แยก
`url` ยาวไม่เกิน 2048 ตัวอักษร (HTTPS ไม่มี userinfo), `signature` ยาวไม่เกิน 4096 ตัวอักษร; 201 ไม่มี `Location` header
API ตรวจรูปแบบ URL/hash และมี signature metadata แต่ **ยังไม่ verify signature หรือดาวน์โหลด artifact**
อย่า Publish ของจริงจาก PoC นี้

Update check คืน `{ "available": false, "release": null, "install_supported": false }` เมื่อไม่มี release
ถ้ามีจะคืนเฉพาะ Published Release ที่ channel/platform ตรงและเวอร์ชันใหม่กว่า `version` ที่ส่งมา (ตัวใหม่สุดตัวเดียว)
รูปแบบ `release`: `{ "id", "version", "channel", "platform", "url", "sha256", "signature", "published": true }`
Query ที่ไม่ผ่านกฎคืน 400 `INVALID_QUERY`
Desktop ใช้ Metadata เท่านั้น Desktop ไม่ download/execute แม้ API ตอบ available=true

## Production follow-up

HTTPS, persistent DB, admin identity/RBAC, distributed rate limiting, audit, key rotation,
signed offline entitlements, artifact trust root, compatibility matrix และ recovery/rollback
ไม่ส่ง License Key ใน URL และไม่บันทึก Request Body ลง Logs
