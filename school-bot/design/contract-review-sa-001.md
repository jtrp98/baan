# SA-001 — ชุดทบทวนสัญญา — Rev1

ใบงาน093 · 2026-10-29 · [Oracle pack](../plan/SA-001.md): 6 AC; DES-002 Rev3 / 003 Rev4 / 004 Rev11 / 007 Rev3 ตรงฉบับที่ตรึง ไม่มี contract/schema delta

## ขอบเขต core / projects / release / auth

| ส่วน | สัญญาปัจจุบัน / ท่อนที่ใช้ | หน้าที่ |
|---|---|---|
| core | [DES-002](des-002.md) Rev3 §API และ proof; [กฎร่วม](data-contract-rules.md) Rev10 §Relations / uniqueness / invariants | B ตรวจ License; serialize writer ข้าม process; domain+idempotency+audit atomic; UQ/FK/CHECK ไม่มี |
| projects | [DES-003](des-003.md) Rev4 §Project document v2; [Project API](project-api-001.md) Rev1 §Operations | Local UUID/local_revision; Cloud integer IDs; owner/tenant จาก session; ETag(UpdateDate)/If-Match: ขาด→428, ชน→412; counter ≠ PK |
| release | [DES-007](des-007.md) Rev3 §ข้อเสนอ manifest / API, §Errors / recovery / invariants; [trust](release-trust-001.md) Rev1 | B จัด metadata; signer ตรวจ CI registry; Host ตรวจ artifact/publisher ก่อน installer; Check/Prepare/Install แยกเจตนา |
| auth | [DES-004](des-004.md) Rev11 §Permissions ตามช่องทางและบทบาท; [DES-012](des-012.md) Rev9; [License authorization](license-admin-security-001.md) Rev1 §Authorization | B ตรวจ session/Channel/tenant/StaffRole ซ้ำก่อน commit; reuse G Login ไม่ทำ verifier ซ้ำ; school_admin ≠ license_admin |

[Gateway integration](gateway-integration-001.md) Rev5 คง topology Rev3: Desktop→HTTP G→gRPC B; browser ผ่าน same-origin BFF ไม่มี direct public B fallback. [gRPC contract](gateway-grpc-contract-001.md) Rev2 §2/3/5 กำหนด RPC/tenant/error mapping; หลักฐาน logout ไม่รับรองงานอื่น. HTTP error envelope ตามกฎร่วม Rev10 §HTTP contract ร่วม: `{error:{code,message,request_id,details?}}`; ไม่เทียบ HTTP/gRPC status ตรง ๆ

## AC และหลักฐาน

trace ครบไม่ใช่ QA PASS; actual จาก source/DDL และ TP ที่ต้องตรวจต่อ:

| AC | ท่อนสัญญา / TP | expected | actual / ข้อจำกัด |
|---|---|---|---|
| AC-027-01 | DES-002 Rev3 §API และ proof + License authorization Rev1 §Authorization; TP001-007 | 503 AUTH_NOT_CONFIGURED; 401 UNAUTHORIZED/SESSION_EXPIRED; 403 STAFF_ROLE_REQUIRED; v1 static bearer สร้าง/ดูไม่ได้ | trace ครบ; E1 ยังเปิด v1 ใน entry ที่อ่าน v2 ยังไม่พิสูจน์ |
| AC-029-01 | DES-007 Rev3 §ข้อเสนอ manifest / API + กฎร่วม Rev10 แถว Release; TP001-046 | draft/published=false; ซ้ำ version/channel/platform → 409 RELEASE_EXISTS | trace ครบ; E2 มี logic แต่ process lock ไม่พิสูจน์ DB race ข้าม instance |
| AC-029-03 | [REQ-029](../requirement/req-029.md) AC-029-03 + DES-007 Rev3 §ข้อเสนอ manifest / API, §Errors / recovery / invariants; TP001-047 | published ใหม่สุด, channel/platform ตรง, version สูงกว่า; ไม่คืน draft/เท่ากัน/withdrawn | trace ครบ; E2 มี filter+numeric sort; v2/G/withdrawn persistence ยังไม่พิสูจน์ |
| AC-030-01 | DES-007 Rev3 §ข้อเสนอ manifest / API + [REQ-030](../requirement/req-030.md) AC-030-01; TP001-047 | ไม่มีรุ่นใหม่ → available=false, release=null, install_supported=false | trace ครบ; E3 ตรงใน source v1 ยังไม่เรียก API จริง |
| AC-033-04 | [model](data-model.md) Rev8 §วิธีอ่านฟิลด์ → [หกฟิลด์ร่วม](data-fields-001.md); TP001-052/053 | catalog ทุกตารางขึ้นต้น SchoolBot และมีหกฟิลด์ร่วม | trace ครบ; E4 static ครบ32/32; ขาด catalog ของ DB ทดสอบ |
| AC-033-05 | model Rev8 ย่อหน้าแรก + กฎร่วม Rev10 §Relations + [พจนานุกรม](data-dictionary/index.md); TP001-052/053 | PK int4; รหัสอ้างอิงคงชนิดตามแบบ; UQ/FK/CHECK=0 | trace ครบ; E4 ยืนยัน DDL; E5 ตรวจชนิด identity บางส่วน ไม่รับรอง legacy mapping/catalog ทุกฟิลด์ |

[TP-001](../test-plan/tp-001.md): 007/046 อ่านคู่ Amendment002; 047/052/053 ตามหัวข้อเดิม; Amendment004/005 ไม่เปลี่ยนห้า cases นี้

## ข้อเท็จจริง as-built

`B=C:/src/schoolbright/target/school-bot`; `S=B/web/src`; [DDL](../db/schoolbot_db.sql) Rev7; ตรวจ working tree

- **E1:** `S/SchoolBot.Api/Program.cs:43,107–129` ใช้ InMemoryManagementStore และ v1 static bearer สำหรับ License/release; ยังไม่ตรง AC-027-01
- **E2:** `S/SchoolBot.Domain/Releases/DesktopRelease.cs:25–26` สร้าง Published=false/string GUID; `S/SchoolBot.Application/ManagementService.cs:74–84,99–110` ตรวจซ้ำ/เลือกใหม่สุด; `S/SchoolBot.Infrastructure/Persistence/InMemoryManagementStore.cs:32–37` กรอง published/channel/platform. ไม่ใช่ integer ID/registry signer ตามแบบใหม่
- **E3:** `S/SchoolBot.Api/Program.cs:96–100` คืน check/install_supported=false; `B/app/desktopservice.go:109–115` เรียก v1; `B/app/desktopstorage.go:103–140` ยัง save/load slot `<mode>.json`. ตรวจเฉพาะ entry นี้
- **E4:** PowerShell อ่าน DDL ตัด line comments แล้วนับ CREATE TABLE/fields/constraints: 32ตาราง/450ฟิลด์, prefix32/32, หกฟิลด์32/32, PK integer identity32/32, UQ0/FK0/CHECK0, SchoolBotUser0; exit0. static text audit ไม่ใช่ SQL parser หรือ TP001-053
- **E5:** DDL:135–204 เทียบพจนานุกรม [Session](data-dictionary/table-006.md)/[StaffRole](data-dictionary/table-007.md)/[Project](data-dictionary/table-008.md): AccountId/ProfileId/EmployeeId/OwnerId/SchoolId เป็น integer; LegacyAdminId varchar(64). ห้ามถือ AccountId=sId=sEmp โดยไม่มี proof

SchoolBot แยก DB; legacy ใช้ connection เดิม/re-check ข้าม DB. [DB index](../db/index.md) บันทึกผู้ใช้สร้างตารางแล้ว catalog parity ยังขาด

## Disposition และผลกระทบ

ใช้ **[ตาราง disposition เดิม Rev1](update-disposition-001.md#disposition-gap-07-สำหรับผู้มีอำนาจ)** คู่ [มติ036](../requirement/decisions-036.md#มติ)/[มติ037 ข้อ1](../requirement/decisions-037.md#มติ); ไม่สร้างตารางทางเลือกซ้ำ

Check ↔ AC-030-01..03; PrepareUpdate ↔ AC-030-04/08; InstallPreparedUpdate ↔ AC-030-05..08. ผู้ใช้เลือกคงและรับ AC แล้ว; “รออนุมัติ” ใน DES-007/ตารางเดิมเป็นประวัติก่อน037. AC-030-04..08 ใช้ trace ไม่เพิ่มเส้นชัย SA-001

BE-018 รับ registry/sign/publish; BE-019 คง prepare/install และ trust/close/recovery guards; QA-010 ตรวจ check/prepare/install แยกกัน; packaging BE-020/021/022 ส่ง signed artifacts/repair proof ราย OS. Effort updater คงอยู่ ให้เจ้าของงานประเมิน ไม่มีตัวเลข. install_supported=false คงจน implement ตาม036; business approval ไม่ปิด G-RELEASE-DB/security/runtime

## ช่องว่างและผู้รับต่อ

- **ข้อเสนอ:** gRPC §2 ยังไม่มี core/projects/release manifest; arch/sys/G/Light จัด RPC/DTO/error รวม RELEASE_EXISTS, device proof/global tenant ก่อนเชื่อม local/stub เดินต่อได้
- **เอกสารคลาดเคลื่อน:** Project API Rev1 ยังอ้าง composite FK; License authorization Rev1 อ้าง pair CHECK; E4/กฎร่วม Rev10 ไม่มีแล้ว. เสนอ backlog ให้ arch/vault ปรับถ้อยคำ ไม่เสนอใส่ constraints คืน
- **รอคนเดิม:** Task BE-018/019/022 · Reference release-trust Rev1 · Reason: ใครถือ cert/รับรอง registry/publisher pin? ผู้ใช้/เจ้าของ signing ตอบเพื่อปลดล็อก trusted artifact จริง; คงการพัก License custody
- **รอหลักฐานเดิม:** Task DBA-003 · Reference AC-033-04/05 · Reason: catalog ของ DB ทดสอบตรง revision ใด? เจ้าของ DB/vault ส่งเพื่อทำ TP001-053; รอบนี้ไม่เชื่อม DB. H5/tenant/private-peer รอ G/Light/infra/B ไม่ถาม dev ซ้ำ

เลือก reuse สัญญา/มติเดิม ปัดตกสำเนาซ้ำที่เสี่ยงขัดกัน. ไม่มี schema/model delta; ใช้[DBML](dbml-guide-001.md) ไม่รัน parser/parity; ไม่ audit dictionary/legacy/JSON ทั้งชุด

## Change Log

- 2026-10-29 — Rev1: trace6AC แยกสี่ขอบเขต อ้างมติ updater และตรวจ source/DDL แบบอ่านอย่างเดียว; ไม่แก้สัญญา/แผน/สถานะ task