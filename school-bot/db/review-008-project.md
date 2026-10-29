# Review 008 — physical fields และกฎ Project

วันที่ของงาน: 2026-10-29 · [runbook](review-008.md) · [AC](review-008-ac.md)

## Physical delta

เพิ่ม/ลบ/เปลี่ยนชื่อตาราง0 คอลัมน์0 ชนิด/NULL/default/identity/PK0; โครงสร้าง Rev7 คงเดิมทั้ง32ตาราง/450ฟิลด์ JSON/enum/status meanings ไม่เปลี่ยน ไม่เพิ่มคอลัมน์ Version, ClientId หรือ FK

เปลี่ยนเฉพาะพฤติกรรมสคริปต์: CREATE ไม่ข้ามตารางเดิมด้วย IF NOT EXISTS; rollback ต้องว่างครบ32และล็อกก่อน DROP ดูข้อกำหนดฐานใหม่ใน runbook ไม่มี migration แปลงข้อมูลเดิม; ฐานที่มีอยู่ใช้ catalog review หากต่างต้องออก delta ใหม่ก่อนคนรัน

## SchoolBotProject — หนึ่งแถวต่อโครงงาน Cloud

ทุกฟิลด์ด้านล่างไม่มี DEFAULT เว้นระบุในตารางร่วม

| คอลัมน์ | ชนิด / NULL | ความหมายและการบังคับ |
|---|---|---|
| SchoolBotProjectId | integer NOT NULL | PK เดียว; GENERATED ALWAYS AS IDENTITY เริ่ม1/เพิ่ม1/ช่วง1..2147483647/NO CYCLE; แยกงานA/Bและให้serverจัดสรร |
| OwnerKind | varchar(16) NOT NULL | student/employee เลือกทะเบียนเจ้าของ; enum/ห้ามเปลี่ยนเป็นกฎแอป ไม่มีCHECK |
| OwnerId | integer NOT NULL | TUser.sID หรือ TEmployees.sEmp ตามชนิดและ SchoolId; logicalข้ามDB ไม่มีFK |
| Mode | varchar(16) NOT NULL | block/arm/code; ต้องตรง Content.kind; ห้ามเปลี่ยนเป็นกฎแอป |
| Name | varchar(200) NOT NULL | ชื่อแสดงผล ไม่ใช่path; DBจำกัดความยาว แต่ชื่อว่าง/ขนาดdocumentให้แอปตรวจ |
| CurrentRevision | integer NOT NULL | เลข Revision ของ Project นี้ ไม่ใช่ SchoolBotProjectRevisionId; ไม่มีpointer FK |

## SchoolBotProjectRevision — หนึ่งแถวต่อ snapshot

ทุกฟิลด์ด้านล่างไม่มี DEFAULT; immutable เป็นกฎแอป ไม่มีtrigger/สิทธิ์DBใหม่

| คอลัมน์ | ชนิด / NULL | ความหมายและการบังคับ |
|---|---|---|
| SchoolBotProjectRevisionId | integer NOT NULL | PK identity ALWAYS ช่วง/การเพิ่มเหมือน Project; ใช้อ้าง snapshot ที่แน่นอน |
| ProjectId | integer NOT NULL | logicalไป SchoolBotProject.SchoolBotProjectId; ไม่มีFK/ON DELETE/ON UPDATE action |
| Revision | integer NOT NULL | เลขฉบับเริ่ม1; คู่(ProjectId,Revision)ต้องไม่ซ้ำในแอป ไม่มีUNIQUE |
| Content | jsonb NOT NULL | ProjectContentตาม DES-003 Rev4; ไม่เปลี่ยนJSON: code.source, block.stacks/blocks, arm.poses/order/groups/joint_names/time_mode/loops/view; nested shape/limitsเป็นvalidationแอป |
| ContentHash | varchar(64) NOT NULL | SHA256เนื้อหา snapshot; ไม่ใช่ผลตรวจงาน และSQLไม่ตรวจรูปแบบhash |

## หกคอลัมน์ร่วมของทั้งสองตาราง

| คอลัมน์ | ชนิด / NULL / default | เหตุผล |
|---|---|---|
| IsDelete | boolean NOT NULL DEFAULT false | soft delete; ไม่ทำลาย snapshot ที่ถูกอ้าง |
| CreateBy | integer NULL DEFAULT NULL | sId/sEmpผู้สร้าง; NULL=ระบบหรือไม่มีprofileชนิดนี้ |
| CreateDate | timestamptz NULL DEFAULT NULL | เวลาUTCจากserverเมื่อแอปกำหนด; DBไม่เติมเอง |
| UpdateBy | integer NULL DEFAULT NULL | ผู้แก้ล่าสุด; แยกชนิดผู้ทำผ่านAuditEvent.Actor |
| UpdateDate | timestamptz NULL DEFAULT NULL | concurrency tokenจากserverตาม030; ไม่มีVersion; SQLไม่มีtriggerเติมเวลา |
| SchoolId | integer NOT NULL ไม่มีdefault | แยกtenant; >0และต้องตรงแม่/เจ้าของเป็นกฎแอป ไม่ใช่CHECK/FK |

PKทั้งสองสร้างbacking index; ไม่มีUNIQUE/FK/CHECK/standalone indexอื่น ความสัมพันธ์ Project(CurrentRevision)→Revision(ProjectId,Revision) และ Revision(ProjectId)→Project เป็นlogicalทั้งคู่ ไม่มีDEFERRABLEหรือCASCADEในSQL

## Read/write impact และการพิสูจน์ที่เหลือ

- SchoolBot DB/public เก็บProject2ตารางร่วมกับ License/Session/Idempotency/AuditEvent; ไม่คัดลอกบัญชีหรือpassword Master DBอ่าน TMasterDBUser.sID/nCompany; School DBอ่าน TUser(SchoolID,sID), TEmployees(SchoolID,sEmp) และ TCompany.nCompanyเพื่อตรวจtenant; ทั้งหมด logicalข้ามDB ชนิดอ้างอิงintegerเดิม ไม่แก้schema/เขียนทะเบียนเก่า
- Ownerใช้(SchoolId,OwnerKind,OwnerId)จากsession; AccountIdแยกจากProfileId ครู/studentเก็บCloudได้ตาม032 ส่วนGuestใช้local UUID/local_revision ไม่มีตารางGuestและห้ามcastUUIDเป็นPK
- saveต้อง serialize writerต่อProject, ตรวจสิทธิ์/If-MatchจากUpdateDate, สร้างsnapshotฉบับใหม่+ปรับCurrentRevision+idempotency+auditในtransactionเดียวและcommitก่อนตอบสำเร็จ; ตรวจduplicate(ProjectId,Revision)และpointer/tenantในแอปตามกฎกลาง ไม่มีruntime evidenceในงานนี้
- UpdateDate nullableตามมติ: แอปต้องตั้งตอนcreate/updateก่อนออกETag; DDLอย่างเดียวไม่พิสูจน์non-null/ความก้าวหน้าของtokenหรือกันlost update SQLไม่เติมเวลาให้เอง ตรวจconcurrent clientsผ่านTP001-016
- Query patternจาก project-api: listตามowner+SchoolId+mode, เปิดตามPK+owner, โหลดrevisionตามProjectId/Revision การlistและหาrevisionอาจscanเพราะมีเฉพาะPK ยังไม่เพิ่มindexตามมติ; ต้องมีmeasurement/query planจริงก่อนเสนอ ไม่อ้างประสิทธิภาพจากจำนวนแถวสมมติ เพิ่มindexภายหลังมีต้นทุนเขียน/storage
- PIIส่งjpo: owner/profile/audit IDsเชื่อมกลับบุคคลได้; Project.Name/Contentอาจมีข้อมูลเด็ก ใช้ `pii-inventory-001.md` F2/F4/F6/F7/F8 ประเมินmasking/encryption/retention/backupต่อ ไม่ถือว่าIsDeleteคือลบข้อมูลจริง ไม่มีPII fieldใหม่ในรอบนี้

## Change Log

- 2026-10-29 — ใบงาน094: ส่งfield-level delta=0 พร้อมphysical contract23ฟิลด์ของProject2ตาราง แยกSQLจากapplication/cross-DBชัดเจน
