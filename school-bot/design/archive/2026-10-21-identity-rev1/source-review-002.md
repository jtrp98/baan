# Source review 002 — Rev1

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

## ข้อเสนอ SA และข้อจำกัด

ถอน SchoolBotUser ใช้บัญชีเดิม; ไม่เพิ่ม credential/mapping DB ใช้ P และ adapter ใน data-model/DES-004 ไม่ถือว่า master.sID=student.sID=employee.sEmp หรือ nSystemID ชี้ profile; role enum, account-profile link, token validation/revocation และเจ้าของ scope ยังต้องยืนยันจาก integration จริง

SchoolId:int เลิก pending เรื่องชนิด; physical keys/FKs, DB routing และ deployment ยังรอ DBA หลังมนุษย์อนุมัติ (`CLAUDE.md:40` ระบุ shared/database-first ห้าม EF migrations). ปัดตกการเดา join และสร้าง login provider ใหม่; adapter ต้อง deny เมื่อยืนยันไม่ได้

คง Full production, Block/Arm/Code, Guest local/Login cloud หลายงาน, Code/Block auto–Arm teacher, Windows/Mac หุ่นจริง และ License mandatory: fixed 1 machine, first online, offline 3 days, immediate admin transfer, old lease allowed; ทุกตาราง SchoolBot คง prefix และ IsDelete/CreateBy/CreateDate/UpdateBy/UpdateDate/SchoolId

## Change Log

- 2026-10-21 — Rev1: ตรวจบัญชี/profile/tenant เพื่อ amend เฉพาะจุด
