# SchoolBotLicenseBinding

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บประวัติการผูกใบอนุญาตกับ installation key และอายุสิทธิ์ออฟไลน์ที่ออกให้

**หนึ่งแถว:** การผูก License กับ device key หนึ่งครั้งในหนึ่ง Epoch

**ใช้ตอนไหน/ใครใช้:** activate สร้าง binding; validate ต่ออายุ entitlement; unbind ปิด binding เดิม

**ตัวอย่างสมมติ:** สมมติ: ย้าย License จากเครื่องเก่าไปเครื่องใหม่ โดยเก็บ binding เก่าไว้เป็นประวัติ

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotLicenseBindingId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotLicenseBinding (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `LicenseId` | `integer` | ไม่ได้ | FK ไป SchoolBotLicense เจ้าของการผูกเครื่องนี้ |
| `DeviceJkt` | `varchar(64)` | ไม่ได้ | ลายนิ้วมือ public key ของ installation; ใช้ตรวจ device proof ไม่ใช่เลขเครื่องทางกายภาพ |
| `PublicJwk` | `jsonb` | ไม่ได้ | JSON public key แบบ EC/P-256 สำหรับตรวจลายเซ็นเครื่อง มี kty, crv, x, y; ไม่เก็บ private key |
| `Epoch` | `integer` | ไม่ได้ | เลขรุ่นของ binding ภายใน License; คู่ LicenseId/Epoch ไม่ซ้ำ |
| `ActivatedAt` | `timestamptz` | ไม่ได้ | เวลา UTC ที่การผูกเครื่องนี้เริ่มมีผล |
| `DetachedAt` | `timestamptz` | ได้ | เวลา UTC ที่ถอดเครื่องออก; null หมายถึงยังไม่ถูกถอด แต่ต้องตรวจ License และ current binding ร่วมด้วย |
| `LastCheckedAt` | `timestamptz` | ไม่ได้ | เวลา UTC ของการตรวจออนไลน์ล่าสุดที่ออกสิทธิ์ให้; replay คำขอเดิมไม่ถือเป็นการตรวจใหม่ |
| `LastEntitlementExpiresAt` | `timestamptz` | ไม่ได้ | เวลา UTC ที่ entitlement ล่าสุดหมดอายุ; ไม่เกิน LastCheckedAt บวก 259200 วินาที หรือ 3 วัน และตามสัญญาต้องไม่เกิน License.ExpiresAt |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `LicenseId` | [SchoolBotLicense](table-001.md) (`SchoolBotLicenseId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotLicense](table-001.md) (CurrentBindingId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `PublicJwk`: Jwk; JSON public key แบบ EC/P-256 สำหรับตรวจลายเซ็นเครื่อง มี kty, crv, x, y; ไม่เก็บ private key

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:61) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
