# School Bot API — C# Clean Architecture

```text
SchoolBot.Api ───────────→ Application ───→ Domain
       └───────────────→ Infrastructure ──→ Application
```

`Api` เป็น Composition Root ที่เลือก Infrastructure Adapter
Domain ไม่มี dependency ต่อ ASP.NET, EF หรือ Infrastructure

| Layer | รับผิดชอบ |
|---|---|
| Domain | License invariants, activation/expiry/device rules, Release validation |
| Application | Use cases, store interface, DTOs; ไม่รู้ HTTP/EF |
| Infrastructure | In-memory repository (สลับเป็น PostgreSQL adapter ในอนาคต) |
| Api | HTTP routing, JSON options, DI, admin auth, rate limiting, error mapping |

เปิด `SchoolBot.slnx` ใน IDE หรือรัน:

```powershell
dotnet run --project src/SchoolBot.Api --no-launch-profile
dotnet test SchoolBot.slnx --disable-build-servers -m:1
```

SDK เลือก Stable .NET 10 ผ่าน `global.json` (`allowPrerelease: false`)
Admin token อ่านจาก environment `SCHOOL_BOT_ADMIN_KEY`; ไม่มี Secret ใน appsettings/source
ค่าเริ่มต้น bind `127.0.0.1:8080` ไม่มี CORS สำหรับเว็บอื่น เพราะ Desktop ติดต่อผ่าน Go Host

**PoC limitation:** Store หายในทุก restart, lock ป้องกัน concurrent activation ได้เฉพาะ process เดียว
ก่อนหลาย Instance ให้ทำ DB transaction/unique constraints, audit, identity/RBAC, HTTPS deployment และ key/signing management
`Publish` ใน PoC ทำให้ Metadata มองเห็นได้เท่านั้น ไม่รับรองว่า Artifact/Signature ถูกต้อง
ห้ามใช้เป็นระบบจำหน่าย License หรือเผยแพร่ Updates จริงจนกว่างานเหล่านี้เสร็จ

Admin Website ยังไม่ได้สร้าง API HTTP examples อยู่ใน `src/SchoolBot.Api/SchoolBot.Api.http`

## Logout v2 และ PostgreSQL

`POST /v2/auth/logout` รับ opaque Bearer token แบบ base64url 43 ตัว ใช้ SHA-256 ค้นหา session
และบันทึก revoke พร้อม audit ใน transaction เดียวของ PostgreSQL โดยไม่ใช้ memory store ของ v1
ไม่ต้องส่ง body, License, `If-Match` หรือ `Idempotency-Key` และไม่เรียก Gateway
token หาย/ผิดรูปแบบ/ไม่พบ/หมดอายุ/ถูกถอนแล้วคืน 204; ฐานข้อมูลไม่พร้อมคืน 503 `AUTH_UNAVAILABLE`
พร้อม v2 error envelope, `request_id` UUID และ `Cache-Control: no-store`

ก่อนเรียก service/store คำขอที่มี token รูปแบบ canonical ต้องผ่าน fixed-window limit ตาม connection peer
และ concurrency limit รวมสำหรับงาน logout ของ process นั้น โดยใช้ built-in .NET rate limiters และ queue เป็น 0 ทั้งคู่
token หาย/ผิดรูปแบบยังคืน 204 โดยไม่ใช้ quota และไม่เรียก store; token canonical ที่ถูกปฏิเสธคืน
429 `RATE_LIMITED` พร้อม v2 envelope, `request_id` UUID และ `Cache-Control: no-store`
`Retry-After` ส่งเฉพาะเมื่อ lease มี metadata ที่เป็นจำนวนวินาทีไม่ติดลบในช่วง integer
เป็นเวลาลองขอ local limiter ใหม่ ไม่ยืนยันว่า DB/Gateway พร้อมหรือ reset แล้ว; concurrency rejection ไม่มีเวลาคาดเดา

ตั้ง caps ผ่าน configuration/environment ก่อนเริ่มแอป (ต้องเป็นจำนวนเต็มบวก; ค่าผิดทำให้เริ่มแอปไม่สำเร็จ):

| ชื่อ | ค่าเริ่มต้น |
|---|---:|
| `SCHOOL_BOT_LOGOUT_RATE_LIMIT` | 30 คำขอที่มี token canonical ต่อ peer ต่อ window |
| `SCHOOL_BOT_LOGOUT_WINDOW_SECONDS` | 60 วินาที |
| `SCHOOL_BOT_LOGOUT_CONCURRENCY_LIMIT` | 8 งาน logout พร้อมกันต่อ process |

peer จับจาก connection ก่อนประมวลผล forwarded headers; IPv4-mapped IPv6 ใช้ bucket เดียวกับ IPv4
ไม่ใช้ `X-Forwarded-For`, header, token, account หรือ body เป็นตัวเลือก bucket; peer ที่ไม่มี address ใช้ bucket ร่วม
หลัง Gateway หลาย client อาจใช้ quota peer เดียวกัน นี่เป็น local defense ระหว่างรอ H5 trusted source
แต่ละ process/pod มี quota ของตัวเองและ restart แล้วเริ่มนับใหม่ ไม่ใช่ global cross-pod limit หรือ production SLA

ตั้ง environment `SCHOOL_BOT_DB_CONNECTION_STRING` ผ่าน secret reference ของระบบ deploy เท่านั้น
รูปแบบ placeholder: `Host=<host>;Port=<port>;Database=<database>;Username=<username>;Password=<secret>`
ไม่มีค่าเริ่มต้นหรือ fallback ฐานข้อมูล; อย่าใส่ connection string จริงใน source, logs หรือคำสั่งที่เก็บประวัติ
Npgsql 10.0.2 อ้างจาก package metadata ใน local NuGet cache และไม่เปิด connection ตอนเริ่มแอป
โค้ดไม่สร้าง schema/session/seed; ต้องเตรียม schema เดิมและสิทธิ์ DB ก่อนเปิดใช้งาน
งานนี้ยังไม่ครอบคลุม Login, persistence ของ v1, การตรวจรับ DB runtime หรือ deployment

## Change Log

- 2026-10-23 — จำกัด logout ตาม connection peer และจำนวนงานพร้อมกันก่อนเข้า store พร้อม caps ที่ตั้งค่าได้และ v2 429
- 2026-10-23 — เพิ่ม logout v2 พร้อม PostgreSQL transaction สำหรับ session และ audit และ configuration ผ่าน environment
