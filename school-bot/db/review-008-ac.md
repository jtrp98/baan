# Review 008 — ตาราง AC แยกตาม task

วันที่ของงาน: 2026-10-29 · [runbook](review-008.md) · [physical/parity](review-008-parity.md) · [Project fields](review-008-project.md)

“บางส่วน” = เตรียม SQL/ตรวจไฟล์ครบตามขอบเขต แต่ actual ของ AC ยังรอคนและ runtime; ไม่มีแถวใดเป็น QA acceptance คำว่า C0–C5 อ้างหัวข้อใน [schoolbot_catalog_review.sql](schoolbot_catalog_review.sql)

## DBA-002

ตรึง `plan/DBA-002.md#Oracle pack`, DES-002 Rev3; TP001-052 static / TP001-053 E-CAT

| AC | Deliverable / วิธีตรวจ | Expected | Actual/สถานะ | ข้อจำกัด |
|---|---|---|---|---|
| AC-033-01 | `schoolbot_db.sql` Section001: SchoolBotLicense; catalog C0/C1/C2 | public.SchoolBotLicense ตัวพิมพ์ตรง ใน DB ที่ API ทดสอบใช้ | บางส่วน: พบใน DDL; catalog รอคน | 045ไม่ระบุ hash/environment; ไม่อนุมานจาก connection เก่า |
| AC-033-02 | ตารางเดียวกัน: PK_SchoolBotLicense; C3/C4 | SchoolBotLicenseId int4 เป็น PK คอลัมน์เดียว; identity ALWAYS | บางส่วน: integer identity+PK ในไฟล์; รอคน | integer คือ alias int4; C3 typname=int4/identity_kind=a |
| AC-033-03 | SchoolBotLicense; C3 | IsDelete/CreateBy/CreateDate/UpdateBy/UpdateDate/SchoolId ครบตรงชื่อ | บางส่วน: ครบ6ในไฟล์; รอคน | audit4ตัว NULL DEFAULT NULL ไม่เติมเวลาอัตโนมัติ |
| AC-033-04 | DDL Section001–006 + dictionary32หน้า/DBML; C1/C2/C3 | 32ตาราง/450ฟิลด์ ชื่อเริ่ม SchoolBot หกฟิลด์ร่วมครบ; ไม่มีตารางผลิตภัณฑ์ตกหล่น | บางส่วน: staticครบ32/450; รอคน | C1ต้องจำแนกตารางทั้งหมดด้วยเจ้าของ ไม่พึ่ง prefix filter อย่างเดียว |
| AC-033-05 | DDLทุกตาราง; C3/C4/C5 + dictionary/contract-001 | PK32 int4; ชนิดอ้างอิงเดิมตรงแบบ; UQ0/FK0/CHECK0; indexesเฉพาะPK | บางส่วน: staticตรง; catalogรอคน | เทียบ C3ครบ450 ไม่ใช้ชื่อ *Id เดาชนิด; app relations ไม่ใช่FK |

เกณฑ์ core SQL/rollback/runbook: เตรียมครบสำหรับคน review; PK/รหัสอ้างอิง int4, audit int NULL และ UpdateDate คงตามมติ ไม่เพิ่ม physical FK สวน044 ไม่มี grants School/PGGradeDB การอนุมัติแบบ H4 ไม่แทนผลรัน SQL/rollback/catalog

## DBA-004

ตรึง `plan/DBA-004.md#Oracle pack`, DES-003 Rev4; TP001-008/015/016/022/023/052/053/077 ตาม pack โดย TP001-008 เป็น License revoke precondition ไม่ใช่หลักฐาน Project storage

| AC | Deliverable / วิธีตรวจ | Expected | Actual/สถานะ | ข้อจำกัด |
|---|---|---|---|---|
| AC-011-01 | DDL Section002: SchoolBotProject/ProjectRevision; [กฎ Project](review-008-project.md); TP001-015/016 | Guest+Login เก็บ2งานต่อ block/arm/code เปิดครบไม่ปะปน | บางส่วน: PKแยกงาน, OwnerKind/OwnerId/Mode/SchoolId และ snapshotพร้อม; runtimeรอคน | Guestเป็น local fileไม่มีDDL; SQLไม่มีenum/owner authorization/UQแทนแอป |
| AC-011-02 | Project.CurrentRevision/UpdateDate + Revision.ProjectId/Revision/Content; project-api Rev1; TP001-015/016/077 | แก้Aแล้วเปิดใหม่ล่าสุด Bไม่เปลี่ยน; conflictไม่ทับ | บางส่วน: ฟิลด์ครบ ไม่มีVersion; runtimeรอคน | CurrentRevisionเป็นเลขฉบับ ไม่ใช่revision PK; ไม่มีpointer FK/immutability trigger |
| AC-036-02 | SchoolBotSession(AccountId/ProfileKind/ProfileId/SchoolId), License, Project owner; TP001-022/023 | student+employee Loginบัญชีเดิมพร้อมLicense เปิด/บันทึกเฉพาะของตน | บางส่วน: placement/owner fieldsครบ; runtimeรอคน | mappingบัญชี→profile/License/device proof/ข้ามtenantเป็นแอป; ไม่มีFKข้ามDB |
| AC-036-03 | Project/ProjectRevision เป็น ordinary logged CREATE TABLE; catalog C1/C2 + API restart fixture | durable commitแล้ว restartบริการ Loginบัญชีเดิมเปิดได้ | บางส่วน: ไม่มีTEMP/UNLOGGED; runtimeรอคน | catalogไม่พิสูจน์APIใช้ฐานนี้/commitก่อนตอบ; packไม่ระบุTPเฉพาะrestart จึงยังต้องมีreceiptตามACนี้ ไม่สร้างTP IDเอง |
| AC-033-04 | DDLรวม32ตาราง + C1/C2/C3; TP001-052/053 | prefixและหกฟิลด์ร่วมทุกตาราง | บางส่วน: staticครบ; รอคน | ตรวจทั้งผลิตภัณฑ์ ไม่ตรวจแค่Project2ตาราง |
| AC-033-05 | DDLรวม + C3/C4/C5; TP001-052/053 | PK int4/ชนิดอ้างอิงเดิม; UQ0/FK0/CHECK0 | บางส่วน: staticตรง; รอคน | relations/unique/validationและraceยังไม่มีruntime evidence |

เกณฑ์ placement/ownership/version/constraints/rollback: ครบสำหรับคน review ตาม [Project fields](review-008-project.md) และ [runbook](review-008.md) ไม่ใช้ “DDLพร้อม” แทน AC ด้านแอป

## หลักฐานตรวจจริง

คำสั่ง `node reports/school-bot/normal-094/vault-static-check.cjs` exit0: SQL/dictionary/DBML 32ตาราง/450ฟิลด์, PK32/UQ0/FK0/CHECK0, audit4ตัว NULL/default NULL, rollbackครบ32ชื่อ; structural signature คงเดิม ดู [parity](review-008-parity.md) รายละเอียด raw อยู่ `reports/school-bot/normal-094/vault-static-result.json` ไม่ได้รัน TP integration/installer/SQL

## Change Log

- 2026-10-29 — ใบงาน094: traceครบ5ACของDBA-002 และ6ACของDBA-004 แยก SQL readiness จากผลรอคน
