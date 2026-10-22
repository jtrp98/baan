# Source review 002 — Rev2

ตรวจ 2026-10-21 ตาม decisions-010; อ่านเฉพาะ allowlist ไม่เขียนไฟล์ ไม่รัน SQL/build/test หลักฐานเป็น source/EF ไม่ใช่ผลตรวจฐานข้อมูลจริง พาธอ้างจาก academic root

## ข้อเท็จจริง as-built

- บัญชี: `src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/TmasterDbuser.cs:8` มี SId:int, NSystemId/NCompany:int?, CType:string? (:10–22); มี credential fields แต่ไม่พิสูจน์วิธีตรวจรหัสผ่าน
- `src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiMasterSingleDBPostgreSQLDBContext.cs:7294` กำหนด PK SId → TMasterDBUser (:7296), column sID (:7312); MasterDbtuser เป็น keyless view MasterDBTUser (:1508–1509) ไม่ใช่ account PK อีกชุด
- นักเรียน: `src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/Tuser.cs:8` SId:int และ SchoolId:int (:142). บุคลากร: `src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/Temployee.cs:8` SEmp:int และ SchoolId:int (:92)
- `src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiMasterSingleDBPostgreSQLDBContext.cs:10347` map TUser PK(SchoolId,SId); :5383 map TEmployees PK(SchoolId,SEmp). `src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:10347` และ :5383 ใช้คู่เดียวกัน; Entities/JabjaiSchoolSingleDB/Tuser.cs:8,142 และ Temployee.cs:8,92 มีชนิดตรงกัน ไม่พิสูจน์ว่า deployment ใช้ฐานเดียวกัน
- Tenant: `src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/Tcompany.cs:8` NCompany:int; `src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiMasterSingleDBPostgreSQLDBContext.cs:4575` HasNoKey และ :4576 ToTable(TCompany,masterdb_schema) จึงยังรับรอง FK ไม่ได้
- `src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/JabjaiUserClaim.cs:8` มี UserId/SchoolId:int, AuthorizationKey (:18), ExpiredDate (:22), UserType:short? (:28); ไม่พิสูจน์ JWT/OIDC หรือ active endpoint
- ใน directory entity master เดียวกัน: TgroupPermission.cs:8–16, TgroupPermissionUser.cs:8–16, Permission.cs:8–14, TaccountRoleUser.cs:8–12, TaccountRole.cs:8–24 เป็น fields สิทธิ์ ไม่ใช่กฎ scope ครู; TclassMember.cs:10–20 และ TtermSubLevel2.cs:8–24 มี class/teacher/tenant fields แต่ไม่พิสูจน์สิทธิ์ตรวจงาน
- `src/ServiceAcademic.Infrastructure/Repositories/Databases/TeacherRepository.cs:26` join SEmp แล้ว filter SchoolId ทั้งสองฝั่ง (:28–29), employee.CDel (:30), assignment.CDel/IsActive (:31–32); เป็น course assignment query ไม่ใช่ SchoolBot authorization

- เพิ่มหลักฐาน `src/ServiceAcademic.Infrastructure/Extensions/InfrastructureServiceExtensions.cs:80` School, :109 Master, :138 Logs, :167 PGGrade ใช้ UseNpgsql; ตรวจเฉพาะ :74–180 ไม่อ่าน connection values/secrets ไม่ยืนยัน connectivity หรือเพิ่ม DB ที่ห้า

## ข้อเสนอ SA และข้อจำกัด

ถอน SchoolBotUser ใช้ records เดิม; ตาม decisions-010/011 API รวม Login อยู่ school-bot-v2/web และ Desktop เรียก API เท่านั้น ไม่พึ่ง Academic Login/OIDC. Session ใหม่ตาม DES-004 ไม่ใช่บัญชี/credential สำเนา; password compatibility, role/scope และ account-profile link ยังต้องมีหลักฐาน ห้ามถือว่า master.sID=student.sID=employee.sEmp หรือ nSystemID ชี้ profile

SchoolId:int ยืนยันแล้ว; เสนอทุกตาราง SchoolBot อยู่ School DB รวม domain/idempotency/audit ใน transaction เดียว ไม่อ้าง atomic ข้าม DB; physical keys/FKs/schema/deployment รอ DBA หลังมนุษย์อนุมัติ (`CLAUDE.md:40` shared/database-first). Master/School ใช้ข้อมูลเดิม; Logs/PGGrade ไม่ต้องอ่านทุก login และไม่อนุญาตเขียนเกรดทางการ

คง Full production, Block/Arm/Code, Guest local/Login cloud หลายงาน, Code/Block auto–Arm teacher, Windows/Mac หุ่นจริง และ License mandatory: fixed 1 machine, first online, offline 3 days, immediate admin transfer, old lease allowed; ทุกตาราง SchoolBot คง prefix และ IsDelete/CreateBy/CreateDate/UpdateBy/UpdateDate/SchoolId

## Change Log
- 2026-10-21 — Rev2: เพิ่ม DI 4 DB และมติ web auth; ไม่เปลี่ยน generated entities

- 2026-10-21 — Rev1: ตรวจบัญชี/profile/tenant เพื่อ amend เฉพาะจุด
