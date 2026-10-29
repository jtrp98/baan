# SEC-001 — หลักฐานและข้อรอคน ใบงาน093

วันที่ 2026-10-29 · jpo · Rev1 · ใช้คู่ [ตาราง AC](security-review-093-001.md#ตาราง-ac-และการควบคุม)

## หลักฐานที่อ่าน

Source เริ่มจาก `C:/src/schoolbright/target/`; ใช้ Get-Content -Encoding UTF8 และ rg -n แบบ read-only; ไม่รัน tests ใหม่.

| Ref | หลักฐาน / ผลจำกัด |
|---|---|
| E1 | `school-bot/web/src/SchoolBot.Api/Program.cs:107` v1 static-bearer filter; `:120`/`:121` list/create. เทียบ DES-004 Rev11/license-admin-security Rev1 เป็นช่องว่างเดิม SEC001-007/001 ไม่อ้างว่ามี deployment public |
| E2 | `school-bot/web/src/SchoolBot.Application/ManagementService.cs:45` รับ key/DeviceId; `:52` process lock, `:58` Activate, `:63` Validate, `:65` activation result. ไม่พิสูจน์ proof/tx ข้าม instances/signed lease หรือ expiry ใน domain |
| E3 | `school-bot/app/desktopservice.go:98` Run ตรวจขนาด/JSON แล้ว Execute (`:105`) ไม่มี gate ใน method; `:118` ActivateLicense คืน API JSON (`:123`). `Program.cs:96` check คืน install_supported=false (`:99`). ไม่พิสูจน์ engine/installer ทั้งระบบ |
| E4 | G `src/ApiGateway.API/SchoolBot/SchoolBotAuthController.cs:38`→service; `SchoolBotSessionGrpcClient.cs:17`/`:49`/`:91` provenance/factory, `:155`/`:165` sanitize scope/message/exception; `SchoolBotLogoutRegistration.cs:41` production gate, `:120` selector. [JPO092#Oracle](../planning/jpo-092-logout-r4-001.md#oracle-pwsh-7-foreground): G 3/0,5/0,96/0,6/0; [check092#ผล](../planning/check-092-grpc-r3-001.md#ผล): B 2234/0 และ 8 NOT_RUN. ผล local เดิม ไม่ได้รันซ้ำ/re-audit B ทั้งไฟล์ |
| E5 | [teacher-authority Rev1](teacher-authority-001.md#authority-เดียวของรายชื่อนักเรียนที่ได้รับมอบหมาย) บังคับ tenant ทุก alias/fail closed เมื่อ resolver พิสูจน์ไม่ได้; TP001-079 synthetic test-only ยัง NOT_RUN ไม่ใช่ DB authorization proof |

TP ที่อ่านเฉพาะ case/Amendment ที่เกี่ยว: [tp-001](../test-plan/tp-001.md) 004/005/006/007/009/058/079/080 และ [Amendment005](../test-plan/tp-001-amendment-005.md) 082. ไม่เปลี่ยน Actual; Amendment004 เพิ่ม 081 นอก scope นี้.

พาธ design/security-disposition-001.md, security-mitigation-001.md, security-gap-sync-review-001.md ในใบงานเปิดไม่ได้ (PathNotFound); อ่านตามลิงก์จาก security.md ที่มีจริง: [disposition](../planning/security-disposition-001.md), [mitigation](../planning/security-mitigation-001.md), [review060](../planning/security-gap-sync-review-001.md). พาธย่อ SchoolBot.Domain/SchoolLicense.cs จากรายงานเก่าเปิดไม่ได้ จึงไม่อ้างตรวจ domain ซ้ำ. เพียงพอจัด pack ไม่ใช่ source audit ครบทั้งระบบ.

## Findings และเกณฑ์ปลด blocker

รายละเอียด [findings เดิม](../security.md#findings); ใช้ mitigation/review060/มติปัจจุบันประกอบ ไม่คัดลอกเป็น finding ใหม่.

| Severity / IDs | ผู้แก้ / หลักฐานก่อนปิด |
|---|---|
| Important SEC001-001 | BE-039/006: จำกัด scheme/token type, tenant/identity/channel/role สด, session cap; negative purpose/aud/wrong-key+log proof. มติ035 ตัดสินแหล่ง admin แล้ว |
| Important SEC001-002 | sys+DB/infra: effective privileges/credential/process boundary, tenant ทุก query/alias, cross-tenant tests/re-check. ไม่ GRANT ไม่ใช่ risk acceptance; Login reuse G ไม่ให้ B ตรวจ password ซ้ำ |
| Important SEC001-003 | BE-018/019/022: registry signer+publisher pin, negative staging swap/expiry/withdraw/downgrade และ RC signature จริง. four-eyes เพิ่มเติมไม่ใช่ must ใหม่ |
| Important SEC001-004/005 | BE-004/005/007/010: host gate ทุก entry, lease/device proof/BindingEpoch, race/replay/denial/clock tests+custody; re-audit |
| Important SEC001-006 | release/infra: custody/caller/rotation/revoke/backup, signer exp cap/rate limit+scan private key. License พักตาม047; stub ต่อได้ |
| Medium SEC001-007/009/010/011/012 | v1 closure; replay TTL/cleanup/backup; PII/retention; secret separation; deployment/TLS. TTL900s อนุมัติ046แล้ว ไม่ถามซ้ำ/ไม่ลบหลังอ่านครั้งแรก |
| Minor SEC001-013 | เจ้าของ G/BE-039: ไม่ log header ที่มี school/user IDs; ต้องตรวจ handler/log จริง ไม่ใช้ logout logger รับรองเส้นอื่น |
| CLOSED local SEC001-016/017, SEC040-001 | คงผลเดิม; ไม่เปิดซ้ำเพราะขาด production proof ไม่ขยายเป็น full Login/H5/BFF/DB |

Current OPEN เดิม Important6/Medium6/Minor3 ไม่เปลี่ยน. SEC001-008/014/015 นอก AC คง backlog เดิม ไม่เพิ่มงาน/เหตุ FAIL. ทุก Important ต้อง fix+re-audit หรือผู้มีอำนาจรับ residual ระบุผู้ตอบ/วันที่/ขอบเขตเป็นลายลักษณ์อักษร.

## ข้อรอคน

| Ref / Task / Reference | คำถาม / ผู้ตอบหรือผู้ตัดสิน | งานที่จะปลดล็อก / Reason |
|---|---|---|
| H1 / BE-039,006 / SEC001-001,011,012 | เจ้าของ G/Light/infra มีหลักฐาน secret แยก (ตอบสถานะ), peer/TLS/private exposure/BFF CSRF/production registration/review แล้วหรือยัง? | full session/AC-036-06 จริง; local ต่อได้ ไม่ถามสิทธิ์ dev ซ้ำ |
| H2 / BE-002,003,017 / SEC001-002 | DB+infra ยืนยัน effective privileges/บัญชีแคบที่มี/process isolation ได้หรือยัง; เจ้าของ admin ระบุ active license_admin; legacy ส่ง resolver proof ได้หรือยัง? ถ้าแก้ residual ไม่ได้ ผู้มีอำนาจรับขอบเขตใดเป็นลายลักษณ์อักษร? | authz/License/Arm จริง; ไม่ขอ SQL/GRANT ใหม่ |
| H3 / BE-004,005,007 / SEC001-005,006 | **พักตาม047**: เมื่อกลับมาใช้ signer จริง ให้ License/release/infra ระบุ store/custodian/caller/machine/shared-user custody; ตอนนี้ไม่ถามซ้ำ | production lease/binding; stub ต่อได้ |
| H4 / BE-018,019,022 / SEC001-003,006 | release/infra ระบุผู้ถือ OS cert/Team ID, pins, registry ACL และ signer custody ที่ตรวจสอบได้แล้วหรือยัง? | trusted update/RC; stub ต่อได้ |
| H5 / SEC001-010 / flow ครูและผู้เรียน | ผู้ควบคุมข้อมูล/DPO ยืนยัน purpose/ฐานประมวลผล, retention/ลบ/ส่งออก/backup, masking/encryption/access/ผู้รับข้อมูลได้หรือยัง? | compliance flow จริง; synthetic fixtures ต่อได้ |

ไม่มีผู้รับ residual ใหม่ในหลักฐานที่อ่าน. Risk acceptance ด้านเทคนิคไม่ยกเว้นหน้าที่กฎหมาย. [Compliance และ dependencies](security-review-093-compliance-001.md) แยกหลักฐานที่ยังขาดไว้.

## Change Log

- 2026-10-29 — jpo บันทึก source/check evidence และ human gates ของ review pack; ไม่มี risk acceptance/gate closure ใหม่.
