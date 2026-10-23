# Design archive

เก็บ Rev1 ก่อนใช้ amendment ของ SA ตาม decisions-010/011 วันที่ 2026-10-21 เนื้อหาแต่ละไฟล์เป็นสำเนา byte-for-byte ไม่ใช่แบบใช้งานปัจจุบัน อ่าน [index.md](index.md) สำหรับแบบล่าสุด

| ฉบับเดิม | Bytes | SHA-256 |
|---|---:|---|
| [design/index.md](archive/2026-10-21-identity-rev1/index.md) | 5489 | `a2ed01607cb9ee3d0ade5f5bfc3d8d6d0e01adc65a9508a61ec63c210af8a085` |
| [design/modules.md](archive/2026-10-21-identity-rev1/modules.md) | 3888 | `2868c1bcc8df01256474502864d2188d1ce8be23d812ffb52bb5b0e4a2d12b60` |
| [design/data-model.md](archive/2026-10-21-identity-rev1/data-model.md) | 7096 | `a6d935cd9c3049f19f8c158196754023a186463ace89adb839cee5ddda27bda7` |
| [design/data-contract-rules.md](archive/2026-10-21-identity-rev1/data-contract-rules.md) | 5274 | `8b6dc9ea9666383ba6e8b317991515d4f1d0030a7776745691335265fb23a718` |
| [design/des-003.md](archive/2026-10-21-identity-rev1/des-003.md) | 8004 | `305e5729a4d58e77a73960557d5afc7c44b41a54226dab8684547c78740000e8` |
| [design/des-004.md](archive/2026-10-21-identity-rev1/des-004.md) | 5500 | `215965aed870d644916f503634958d8be0923df89c9360f0a7495de96ebe2117` |
| [design/des-005.md](archive/2026-10-21-identity-rev1/des-005.md) | 8982 | `97baf3c55e92bad00d88a671eadfeb72ce5b2d416663ed115972cb4bf93f9161` |
| [design/risks.md](archive/2026-10-21-identity-rev1/risks.md) | 6493 | `9eb13895cfa13d1de12be601f2ba996de6efcde1b791f12b3e634699e81405ec` |
| [source-review-002.md](archive/2026-10-21-identity-rev1/source-review-002.md) | 4611 | `08cea97cead7d0b7781c5d15629cbe54a3ea328c73b15764658feb297280a159` |

## ก่อนเปลี่ยน PK int4 — 2026-10-21

สำเนา byte-for-byte ก่อน apply SA ตาม decisions-012; Rev เดิมของแต่ละไฟล์คงครบ

| ฉบับเดิม | Bytes | SHA-256 |
|---|---:|---|
| [index.md](archive/2026-10-21-before-int4/index.md) | 5965 | `cda223c060b443926d6d10aea6ebbd94c9850e69bc8a6caba187440b76589329` |
| [data-model.md](archive/2026-10-21-before-int4/data-model.md) | 8893 | `98e0258166494aeec023fc8b37669a02ce2942cea656f5d54c60eb6f3c272c0c` |
| [data-contract-rules.md](archive/2026-10-21-before-int4/data-contract-rules.md) | 5966 | `753679393a20abc2efc165adb542d02a91fb41839d9d43b30d659576053b2282` |
| [des-002.md](archive/2026-10-21-before-int4/des-002.md) | 9201 | `e44b875806306e75a75988d2f2979283cdf8bcf70698e8d33aa5e450d0adb6a2` |
| [des-003.md](archive/2026-10-21-before-int4/des-003.md) | 8149 | `094d1d035c26e78e949c4893bcc742340df6feb1088635133f7cab78bec0aa3d` |
| [des-004.md](archive/2026-10-21-before-int4/des-004.md) | 9414 | `d6aededb4e9a2a3365e4d8d208b5ccc7aaf20a564fd03a7897d06d582618fee1` |
| [des-005.md](archive/2026-10-21-before-int4/des-005.md) | 9322 | `b8d2d54ebd3bf4f1f90a820d652d54397348f064b28c60f380e5f74295e674eb` |
| [des-007.md](archive/2026-10-21-before-int4/des-007.md) | 6914 | `f4b249b4fbabf0219a35c977bb0ea3bc4cff6bab4a5fa67e5518fb0e4cc1642c` |
| [risks.md](archive/2026-10-21-before-int4/risks.md) | 7133 | `c1205ae1fc82083cef6a4f04ab4752ffd77b5bc3b49c6a672e20e0c3c335cd22` |

## ก่อน sync032..034 — 2026-10-23

ผู้คุมเก็บทุกไฟล์เดิมใน edits ใบงาน013 แบบ byte-for-byte ที่ archive/2026-10-23-before-decisions-032-034/<relative-path จาก design/> รวม index.md/archive.md ก่อนแก้; new_files ไม่มีฉบับก่อนหน้า ตรวจ bytes/SHA-256 ตรงต้นฉบับ ไม่ regenerate สำเนา

## Change Log
- 2026-10-23 — Rev4: เพิ่ม archive ใบงาน013; ผู้คุมบันทึกหลักฐานหลังสำเนาจริง
- 2026-10-21 — เก็บอีก 9 ไฟล์ก่อนแก้ PK int4 และตรวจ hash ก่อน apply

- 2026-10-21 — MYCELIUM แยก archive ตามไฟล์เพื่อคุมขนาดและตรวจ hash ตรงต้นฉบับทั้ง 9 ไฟล์ก่อน apply patch SA

## ก่อนเพิ่มคู่มืออ่านง่าย — 2026-10-23

เก็บ data-model Rev5 แบบ byte-for-byte ก่อนปรับคำอธิบาย Rev6; baseline/SQL ไม่เปลี่ยน

| ฉบับเดิม | Bytes | SHA-256 |
|---|---:|---|
| [data-model.md](archive/2026-10-23-before-readable-data-model/data-model.md) | 23815 | `c23ec3ab918a7176b571d559af581145f58bc592bfcd67c449e39e545c7170fd` |

- 2026-10-23 — นายช่างบันทึกต้นฉบับและตรวจ hash ตามใบงาน 009

## ก่อนเพิ่ม DBML notes และกลุ่มสี — 2026-10-23

| ฉบับเดิม | Bytes | SHA-256 |
|---|---:|---|
| [schoolbot.dbml Rev3](archive/2026-10-23-before-dbml-notes/schoolbot.dbml) | 45503 | `8ab66eb5002fefade1ca405ac2192ba2e41b239f7c93c784f69fcc633cfbd3eb` |

- 2026-10-23 — เก็บ byte-for-byte ก่อนเพิ่มคำอธิบาย Rev4; schema/FK ไม่เปลี่ยน

## ก่อนรับ auth evidence — 2026-10-23

สำเนา byte-for-byte ก่อนแก้ข้อเท็จจริงตาม arch ใบงาน020; สัญญา/schema เดิม

| ฉบับเดิม | Bytes | SHA-256 |
| --- | ---: | --- |
| [des-012.md](archive/2026-10-23-before-auth-evidence-001/des-012.md) | 12988 | `c8d23be9839c4d0d23d7dd48878b948c416f3644a8ea68af1ce496bafa4d4aeb` |
| [des-004.md](archive/2026-10-23-before-auth-evidence-001/des-004.md) | 20066 | `4ae285412982496db9d9b30cec928375280a0f1968af3e3ed87b50ff10468354` |
| [index.md](archive/2026-10-23-before-auth-evidence-001/index.md) | 18898 | `194f8d0c4870c6b9d709ba086f699adc0fa4e19b641145004dc22bdd1a44c3ef` |

- 2026-10-23 — นายช่างตรวจสำเนา/hash ก่อน apply edits ของ arch

## ก่อนจัด security disposition — 2026-10-23

| ฉบับเดิม | Bytes | SHA-256 |
| --- | ---: | --- |
| [auth-evidence-001.md Rev1](archive/2026-10-23-before-security-disposition-001/auth-evidence-001.md) | 11187 | `e6cc2ca3b5f708daebd903e028f37b0d9c55a9f6e188851fd7b932afdd7d513e` |

- 2026-10-23 — เก็บ byte-for-byte ก่อน edits5จุดจากarchใบงาน021; [manifest](archive/2026-10-23-before-security-disposition-001/manifest.json)

## ก่อนรับ Gateway integration — 2026-10-23

เก็บ DES-012 Rev4, auth-evidence Rev2 และ design/index แบบbyte-for-byteก่อนapply11editsจากarchใบงาน029; [manifestพร้อมbytes/SHA256](archive/2026-10-23-before-gateway-integration-001/manifest.json). ไม่มีphysicalschema/SQL delta

- 2026-10-23 — นายช่างเก็บฉบับเดิมและตรวจhashก่อนรับGateway addendum

## ก่อน sync decisions-035 — 2026-10-23

เก็บdesign/index, DES-012, Gateway integration และauth-evidenceแบบbyte-for-byteก่อนapply5editsจากarchใบงาน030ตามคำตอบผู้ใช้. [Manifestพร้อมbytes/SHA256](archive/2026-10-23-before-decisions-035/manifest.json); ไม่มีphysicalschema/SQL delta

- 2026-10-23 — นายช่างรับpolicyแหล่งis_adminตามมติ035 ไม่ปิดruntime/securitygate
