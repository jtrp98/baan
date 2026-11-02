# Source review 002

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

รายงานนี้อ่าน entity, Entity Framework (EF) mappings และ repository ของ Academic พบว่าบัญชี นักเรียน และบุคลากรมี key ต่างกัน จึงยังใช้ AccountId แทน profile ID ไม่ได้ ขอบเขตผลอ่านคือวันที่ 2026-10-21

ตรวจ 2026-10-21 ตาม [มติ 010 (ใช้ข้อมูล Login/User ที่มีอยู่แล้ว)](../requirement/decisions-010.md); อ่านเฉพาะ allowlist ไม่เขียนไฟล์ ไม่รัน SQL/build/test หลักฐานเป็น source/EF ไม่ใช่ผลตรวจฐานข้อมูลจริง พาธอ้างจาก academic root

## ข้อเท็จจริง as-built

- บัญชี `TmasterDbuser` (หลักฐาน E02) มี SId:int, NSystemId/NCompany:int?, CType:string?; มี credential fields แต่ไม่พิสูจน์วิธีตรวจรหัสผ่าน
- EF mapping (หลักฐาน E03) กำหนด PK SId → TMasterDBUser, column sID; MasterDbtuser เป็น keyless view MasterDBTUser ไม่ใช่ account PK อีกชุด
- นักเรียน `Tuser` (หลักฐาน E04) SId:int และ SchoolId:int. บุคลากร `Temployee` (หลักฐาน E05) SEmp:int และ SchoolId:int
- Master DB context (หลักฐาน E06) map TUser PK(SchoolId,SId); map TEmployees PK(SchoolId,SEmp). School DB context (หลักฐาน E07) และ  ใช้คู่เดียวกัน; School entities `Tuser` และ `Temployee` (หลักฐาน E13/E14) มีชนิดตรงกัน ไม่พิสูจน์ว่า deployment ใช้ฐานเดียวกัน
- Tenant `Tcompany` (หลักฐาน E08) NCompany:int; EF mapping (หลักฐาน E09) ใช้ HasNoKey และ  ToTable(TCompany,masterdb_schema) จึงยังรับรอง FK ไม่ได้
- `JabjaiUserClaim` (หลักฐาน E10) มี UserId/SchoolId:int, AuthorizationKey, ExpiredDate, UserType:short?; ไม่พิสูจน์ JSON Web Token (JWT)/OpenID Connect (OIDC) หรือ active endpoint
- ใน directory entity master เดียวกัน: `TgroupPermission`, `TgroupPermissionUser`, `Permission`, `TaccountRoleUser` และ `TaccountRole` (หลักฐาน E15–E19) เป็น fields สิทธิ์ ไม่ใช่กฎ scope ครู; `TclassMember` และ `TtermSubLevel2` (หลักฐาน E20/E21) มี class/teacher/tenant fields แต่ไม่พิสูจน์สิทธิ์ตรวจงาน
- `TeacherRepository` (หลักฐาน E11) join SEmp แล้ว filter SchoolId ทั้งสองฝั่ง, employee.CDel, assignment.CDel/IsActive; เป็น course assignment query ไม่ใช่ SchoolBot authorization

- Dependency injection ของ `InfrastructureServiceExtensions` (หลักฐาน E12) ระบุ School,  Master,  Logs,  PGGrade ใช้ UseNpgsql; ตรวจเฉพาะ  ไม่อ่าน connection values/secrets ไม่ยืนยัน connectivity หรือเพิ่ม DB ที่ห้า

## ข้อเสนอ ณ วันที่ตรวจและข้อจำกัด

ถอน SchoolBotUser ใช้ records เดิม; ตาม decisions-010/[มติ 011 (ใช้ฐานข้อมูลเดิมทั้ง 4 ตัวร่วมกับ SchoolBot)](../requirement/decisions-011.md) API รวม Login อยู่ school-bot-v2/web และ Desktop เรียก API เท่านั้น ไม่พึ่ง Academic Login/OIDC. Session ใหม่ตาม [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md) ไม่ใช่บัญชี/credential สำเนา; password compatibility, role/scope และ account-profile link ยังต้องมีหลักฐาน ห้ามถือว่า master.sID=student.sID=employee.sEmp หรือ nSystemID ชี้ profile

SchoolId:int ยืนยันแล้ว; เสนอทุกตาราง SchoolBot อยู่ School DB รวม domain/idempotency/audit ใน transaction เดียว ไม่อ้าง atomic ข้าม DB; physical keys/FKs/schema/deployment รอ DBA หลังมนุษย์อนุมัติ (หลักฐาน E01). Master/School ใช้ข้อมูลเดิม; Logs/PGGrade ไม่ต้องอ่านทุก login และไม่อนุญาตเขียนเกรดทางการ

คง Full production, Block/Arm/Code, Guest local/Login cloud หลายงาน, Code/Block auto–Arm teacher, Windows/Mac หุ่นจริง และ License mandatory: fixed 1 machine, first online, offline 3 days, immediate admin transfer, old lease allowed; ทุกตาราง SchoolBot คง prefix และ IsDelete/CreateBy/CreateDate/UpdateBy/UpdateDate/SchoolId

## หลักฐาน

- E01 — `CLAUDE.md:40` shared/database-first
- E02 — `src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/TmasterDbuser.cs:8`
- E03 — `src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiMasterSingleDBPostgreSQLDBContext.cs:7294`
- E04 — `src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/Tuser.cs:8`
- E05 — `src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/Temployee.cs:8`
- E06 — `src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiMasterSingleDBPostgreSQLDBContext.cs:10347`
- E07 — `src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:10347`
- E08 — `src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/Tcompany.cs:8`
- E09 — `src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiMasterSingleDBPostgreSQLDBContext.cs:4575`
- E10 — `src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/JabjaiUserClaim.cs:8`
- E11 — `src/ServiceAcademic.Infrastructure/Repositories/Databases/TeacherRepository.cs:26`
- E12 — `src/ServiceAcademic.Infrastructure/Extensions/InfrastructureServiceExtensions.cs:80`
- E13 — `Entities/JabjaiSchoolSingleDB/Tuser.cs:8,142`
- E14 — `Temployee.cs:8,92`
- E15 — `TgroupPermission.cs:8–16,`
- E16 — `TgroupPermissionUser.cs:8–16,`
- E17 — `Permission.cs:8–14,`
- E18 — `TaccountRoleUser.cs:8–12,`
- E19 — `TaccountRole.cs:8–24`
- E20 — `TclassMember.cs:10–20`
- E21 — `TtermSubLevel2.cs:8–24`

ตำแหน่งบรรทัดเพิ่มเติมที่รายงานเดิมอ้างในบริบทเดียวกัน: :10–22, :7296, :7312, :1508–1509, :142, :92, :5383, :5383, :4576, :18, :22, :28, :28–29, :30, :31–32, :109, :138, :167, :74–180
