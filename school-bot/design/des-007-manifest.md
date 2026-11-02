# DES-007 — Release และ trusted update — ผู้ใช้และเงื่อนไขก่อนเริ่ม

> Rev 3 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-007 — Release และ trusted update](des-007.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `D` = UTC instant; `H` = SHA-256 hex 64 ตัว; `Tn` = ข้อความยาวไม่เกิน n ตัวอักษร ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## ผู้ใช้และเงื่อนไขก่อนเริ่ม

Publisher สร้าง/publish metadata; ผู้ใช้กด check, download และ install เป็นคนละ operation; release ต้องมี trusted artifact ก่อนติดตั้ง ไม่ดาวน์โหลด/execute เพียงเพราะ available=true

## ข้อเสนอ manifest / API

JSON Web Signature (JWS) ES256 header `typ:"schoolbot-release+jws",kid`; payload:
`{release_id:K,version:string,channel,platform,url:string,sha256:H,size_bytes:positive_integer,package_kind:"windows-setup"|"windows-msi"|"macos-pkg",min_os:string,engine_hashes:[{id:"demo"|"zide",sha256:H}],issued_at:D,expires_at:D}`

Version ใช้ x.y.z ตามเดิม; HTTPS URL ≤2048 ไม่มี userinfo; hash ของ artifact **หลัง signing/notarization**; Mac สอง platform records ชี้ Universal PKG hash เดียวกันได้ ต้องตรง manifest ทั้งคู่

| Endpoint `/v2` | Input/ผล |
|---|---|
| POST /admin/releases | `{manifest_input:ReleaseManifestInput}` → 201 `{id:K,update_date:D,lifecycle:"draft"}` + ETag |
| GET /admin/releases | pagination → summaries |
| POST /admin/releases/{id}/publish | `{evidence_ref:T2048}` + If-Match → release summary |
| POST /admin/releases/{id}/withdraw | `{reason}` + If-Match → release summary |
| GET /updates/check | version,channel,platform → `{available,release:null|{id,manifest},install_supported:false}` |

Admin ใช้ `staff_admin` session + active `release_publisher` รายบุคคล แยกจาก role อื่น; public check ใช้ global catalog ที่เสนอ null SchoolId แต่ audit/common fields ครบตาม data-model. Resource summary ใช้ update_date/ETag จาก UpdateDate; publish/withdraw ใช้ If-Match, ขาด → 428 PRECONDITION_REQUIRED, ชน → 412 VERSION_CONFLICT พร้อม details.current_etag. `version` ใน manifest/query ยังคง x.y.z ของ binary (`VersionText`) ไม่ใช่คอลัมน์ Version หรือ concurrency token

Server/signer ตรวจ immutable trusted CI registry ก่อน sign/publish ตาม [release-trust-001.md](release-trust-001.md); ไม่ sign arbitrary artifact จาก API. ทางที่เลือกคง server-assigned release_id/API flow เดิม

Trust key แยก License; public roots อยู่ใน host; rotation root-signed/keyset versioned ห้ามเชื่อ public key ที่แนบกับ manifest เอง

`ReleaseManifestInput` คือ manifest payload ที่ไม่มี release_id; API จัดสรร K แล้ว signer แยก process ตรวจ registry เองก่อน sign และ API verify/store. Failure/idempotency/audit/ทางเลือกตาม [release trust](release-trust-001.md); release ID เป็น K และ download_id เป็น host UUID ไม่ใช่ DBPK

## ขั้นตอนและสถานะของ host

`idle → available → downloading → verified → awaiting_close → installing → completed|failed`

`CheckUpdatesV2()` ไม่เปลี่ยนไฟล์
`PrepareUpdate({release_id}) → {download_id,state}` โหลด metadata ใหม่ ตรวจ signature/expiry/platform/version/size/allowlisted HTTPS origin แล้ว stream ลง staging; ไม่ตาม cross-origin redirects ไม่ resume partial bytes ที่ hash ยังไม่ยืนยัน

`InstallPreparedUpdate({download_id})` ต้องผู้ใช้สั่ง, verified artifact, แอปไม่มี active robot work และ close guards สำเร็จ ตรวจ hash/signature อีกครั้งทันทีที่ส่งให้ OS installer จาก protected staging ป้องกันเปลี่ยนไฟล์หลังตรวจ ไม่รับ arbitrary URL/path/arguments จาก frontend

ต้องตรวจ OS publisher signature เพิ่มจาก manifest hash; Windows setup/MSI ใช้ installer เดิม, Mac PKG ใช้ Developer ID Installer และ app/engines ใช้ Developer ID Application/notarization ไม่มี private signing key ใน payload

Host บังคับ publisher pin: Authenticode subject+thumbprint / Apple Team ID จาก trusted host configuration ตาม [release trust](release-trust-001.md); signature ถูกแต่ publisher ผิดหรือไม่มี pin → ARTIFACT_UNTRUSTED

