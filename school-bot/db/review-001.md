# Physical Schema & SQL Migration Review — SchoolBot (Rev1)

> หมายเหตุ MYCELIUM 2026-10-22: ไฟล์ 001–006 ถูกรวมเป็น `schoolbot_schooldb.sql` และ 007 เปลี่ยนชื่อเป็น `schoolbot_pggradedb_grants.sql` ดู [review-003](review-003.md)

> บันทึกโดย MYCELIUM 2026-10-22 จาก output DBA (agy t2) รายงานเต็ม `C:/src/AICode/baan/baan/reports/2026-10-22-10-54-39-dba-tier-t2-1agents-Pwjg2n` · สถานะ: DRAFT — SQL ทุกไฟล์ยังไม่ถูกรันและยังไม่ผ่าน parser/ฐานทดสอบ (ผู้ใช้สั่ง "เขียนอย่างเดียว ห้ามรัน") · อิง amendment-proposal-001/002 ที่ยังไม่อนุมัติ

วันที่: 2026-10-22
บทบาท: Database Advisor (`dba`)
สถานะ: เสนอเพื่อขออนุมัติจากมนุษย์ (ห้ามรันอัตโนมัติ)

---

## 1. ข้อเท็จจริงจาก EF Core และฐานข้อมูลเดิม (As-Built Evidence)

จากการตรวจสอบซอร์สโค้ดแบบ read-only ใน `C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure`:

1. **การแยก 4 ฐานข้อมูล (Database Connections)**:
   - `Extensions/InfrastructureServiceExtensions.cs:80,109,138,167` ลงทะเบียน `DbContext` 4 ตัวแยกกันผ่าน `UseNpgsql` ได้แก่:
     - **School DB**: `JabjaiSchoolSingleDBPostgreSQLDBContext` (:80)
     - **Master DB**: `JabjaiMasterSingleDBPostgreSQLDBContext` (:109)
     - **Logs DB**: `JabjaiSchoolLogsPostgreSQLDBContext` (:138)
     - **PGGradeDB**: `PGGradeDBPostgreSQLDBContext` (:167)
   - ตาม `decisions-011.md` ตารางใหม่ของ SchoolBot ทั้งหมดจะวางไว้ใน **School DB** ที่เดียว เพื่อรองรับ atomic transaction ระหว่าง domain, idempotency และ audit โดยไม่สร้างฐานข้อมูลที่ 5 และไม่มี physical FK ข้าม database connection

2. **Schema, Naming และชนิดคอลัมน์ใน School DB (`JabjaiSchoolSingleDBPostgreSQLDBContext.cs`)**:
   - ตารางทั้งหมดใน `JabjaiSchoolSingleDBPostgreSQLDBContext` ถูก map ด้วย `.ToTable("<TableName>")` โดยไม่ระบุ schema แยก (จึงอยู่ใน PostgreSQL default schema คือ `public`) ต่างจาก Master DB ที่มีบางตารางระบุ `masterdb_schema` (`JabjaiMasterSingleDBPostgreSQLDBContext.cs:4576`)
   - คอลัมน์อ้างอิงหลักใน School DB:
     - นักเรียน (`TUser`): `JabjaiSchoolSingleDBPostgreSQLDBContext.cs:10347-10350` กำหนด PK `(SchoolId, SId)` ชื่อตาราง `"TUser"` โดย `SchoolId` และ `SId` เป็น `int` (`int4` ใน PostgreSQL; `Entities/JabjaiSchoolSingleDB/Tuser.cs:8,142`)
     - บุคลากร (`TEmployees`): `JabjaiSchoolSingleDBPostgreSQLDBContext.cs:5383-5385` กำหนด PK `(SchoolId, SEmp)` ชื่อตาราง `"TEmployees"` โดย `SchoolId` และ `SEmp` เป็น `int` (`int4`; `Entities/JabjaiSchoolSingleDB/Temployee.cs:8,92`)
     - แผนการเรียนและรายวิชา:
       - `"TPlan"` (`:7654-7656`) PK `(SchoolId, PlanId)` (`int4`)
       - `"TPlanCourse"` (`:7681-7683`) PK `(SchoolId, PlanCourseId)` (`int4`), `NYear` (`nYear` `int4`), `SPlaneId` (`sPlaneID` `int4`)
       - `"TPlanCourseTeacher"` (`:7897-7899`) PK `(SchoolId, PlanCourseTeacherId)`, มี `PlanCourseId` (`int4`), `SEmp` (`sEmp` `int4`), `IsActive` (`bool`), `CDel` (`cDel` `bool`)
       - `"TPlanCourseTerm"` (`:7923-7925`) PK `(SchoolId, PlanCourseTermId)`, มี `PlanCourseId` (`int4`), `NTerm` (`nTerm` `varchar(20)`)
       - `"TPlanTermSubLevel2"` (`:8020-8022`) PK `(SchoolId, PlanTermSubLevel2Id)`, มี `PlanId` (`int4`), `NTermSubLevel2` (`nTermSubLevel2` `int4`)
       - `"TPlane"` (`:8054-8056`) PK `(SchoolId, SPlaneId)` (`sPlaneID` `int4`)
       - `"TTerm"` (`:9993-9995`) PK `(SchoolId, NTerm)` โดย `NTerm` (`nTerm`) เป็น `varchar(20)` (ในบางตารางเช่น `TPlanCourseStudent:7887` ยาว `varchar(40)` และใน PGGradeDB `PGTGradeBackup:472` ยาว `varchar(50)` — ดังนั้นการใช้ `varchar(64)` สำหรับ `NTerm` ใน SchoolBot จึงครอบคลุมปลอดภัย)
       - `"TTermSubLevel2"` (`:10078-10080`) PK `(SchoolId, NTermSubLevel2)` (`int4`)
       - `"TStudentClassroomHistory"` (`:9450-9478`) มี `NHistoryId` (`int4`), `SchoolId` (`SchoolID` `int4`), `SId` (`sID` `int4`), `NTerm` (`nTerm` `varchar(20)`), `NTermSubLevel2` (`nTermSubLevel2` `int4`)

3. **Schema, Naming, ชนิดคอลัมน์ และ Sequences ใน PGGradeDB (`PGGradeDBPostgreSQLDBContext.cs`)**:
   - ตารางทั้งหมดอยู่ใน schema `public` และใช้ double-quoted PascalCase/mixed-case identifiers:
     - `"PGTGrade"` (`:375-443`, `Entities/PGGradeDB/Pgtgrade.cs:6-113`): PK `"nGradeId"` (`int4`), `"SchoolID"` (`int4`), `"nTerm"` (`text`/`varchar`), `"sPlaneID"` (`int4?`), `"nTermSubLevel2"` (`int4?`), `"PlanId"` (`int4?`), `"cDel"` (`bool`), `"UpdatedDate"` (`timestamp without time zone`), `"UpdatedBy"` (`int4?`), `"dUpdate"` (`timestamp without time zone`), `"nUserUpdate"` (`int4`)
     - `"PGTGradeDetail"` (`:531-585`, `Entities/PGGradeDB/PgtgradeDetail.cs:6-73`): PK `"nGradeDetailId"` (`int4`), `"nGradeId"` (`int4`), `"sID"` (`int4`), `"SchoolID"` (`int4`), `"ScoreData"` (`text`/`json`), `"getScore100"`, `"getQuiz100"`, `"getMid100"`, `"getFinal100"`, `"getBeforeQuiz100"`, `"getAfterQuiz100"`, `"scoreMidTerm"`, `"scoreFinalTerm"`, `"scoreBeforeAfterMidTerm"`, `"ScoreBeforeMidTerm"`, `"ScoreAfterMidTerm"`, `"getGradeLabel"`, `"GradeSymbol"`, `"getSpecial"`, `"cDel"` (`bool`), `"UpdatedDate"` (`timestamp without time zone`), `"UpdatedBy"` (`int4?`)
       - **ข้อสังเกตสำคัญ**: Index `"IX_VV_PGTGradeDetail_SchoolID_nGradeID_cDel_sID"` (`:546`) **ไม่ได้ประกาศ `.IsUnique()`** และไม่มี concurrency token ใน EF model แต่ proto ของระบบเดิมระบุการใช้ PostgreSQL system column `xmin` (`source-review-005.md:60`)
     - `"PGTAssessment"` (`:218-282`, `Entities/PGGradeDB/Pgtassessment.cs:6-49`): PK `"AssessmentId"` (`int4`), `"SchoolId"` (`int4` — สังเกตว่าใน `Pgtassessment` ไม่ได้ map `.HasColumnName("SchoolID")` จึงใช้ชื่อ `"SchoolId"` ตาม property), `"nGradeId"` (`int4?`), `"nYear"` (`int4?`), `"nTerm"`, `"nTSubLevel"` (`int4?`), `"nTermSubLevel2"` (`int4?`), `"sPlaneID"` (`int4?`), `"AssessmentMaxScore"`, `"NameIdentifier"`, `"MaxScoreIdentifier"`, `"SubmitPeriod"`, `"IsActive"` (`bool?`), `"cDel"` (`bool`)
     - `"PGTGradeEdits"` (`:739-765`, `Entities/PGGradeDB/PgtgradeEdit.cs:6-49`): PK `"GradeEditsID"` (`int4`), `"GradeDetailID"` (`int4`), `"SchoolID"` (`int4`), `"UseGradeSet"` (`int4?`), `"getScore100"`, `"getSpecial"`, `"cDel"` (`bool`)
     - `"PGTGradeSetting"` (`:890-907`, `Entities/PGGradeDB/PgtgradeSetting.cs:6-37`): PK `"GradeSettingId"` (`int4`), `"SchoolID"` (`int4`), `"NYear"` (`int4`), `"ClassLevelId"` (`int4`), `"IsLocked"` (`bool`), `"cDel"` (`bool`)
     - `"PGTGradeAuditLog"` (`:447-453`, `Entities/PGGradeDB/PgtgradeAuditLog.cs:6-21`): PK `"GradeAuditLogId"` (`int8` / `bigint`), `"MethodName"`, `"Parameter"`, `"Application"`, `"Logdate"` (`timestamp without time zone`), `"SchoolId"` (`int4`), `"sEmp"` (`int4?`)
     - Sequence ของ Audit Log (`:1254`): `"PGTGradeAuditLog_GradeAuditLogId_seq"`

---

## 2. การตัดสินใจเชิง Physical Design (Physical Design Decisions)

1. **Physical Database & Schema Name**:
   - ตารางทั้งหมดของ SchoolBot (33 ตาราง) สร้างในฐานข้อมูล **School DB** (`JabjaiSchoolSingleDB`) ภายใต้ schema `public` โดยใช้ชื่อตารางและคอลัมน์ตรงตาม `data-model.md` (quoted PascalCase เช่น `"SchoolBotLicense"`, `"SchoolBotLicenseId"`) เพื่อให้ตรงกับ convention ของตารางใหม่ใน `JabjaiSchoolSingleDBPostgreSQLDBContext` (เช่น `"PGTAcademicSetting"`, `"TPlanCourseSection"`) และไม่ต้องตั้ง `search_path` พิเศษ
2. **Database Roles & Least Privilege**:
   - ออกแบบให้ใช้ role แยกกัน:
     - `schoolbot_app` (NOLOGIN role หรือ group role สำหรับมอบสิทธิ์ให้ login user ของ backend `school-bot-v2/web`): ใน School DB มีสิทธิ์เฉพาะ `SELECT, INSERT, UPDATE` บนตาราง `"SchoolBot*"` และ `SELECT` บนตาราง legacy ใน School DB ที่ต้องใช้อ่านตรวจสิทธิ์ (`"TUser"`, `"TEmployees"`, `"TPlan"`, `"TPlanCourse"`, `"TPlanCourseTeacher"`, `"TPlanCourseTerm"`, `"TPlanTermSubLevel2"`, `"TPlane"`, `"TTerm"`, `"TTermSubLevel2"`, `"TStudentClassroomHistory"`, `"TPlanCourseStudent"`)
     - **ไม่ให้สิทธิ์ `DELETE`, `TRUNCATE`, `ALTER`, `DROP`** แก่ `schoolbot_app` เพราะระบบใช้ soft-delete (`"IsDelete" = true`) และห้าม hard delete ประวัติ/ผลเรียน/receipt ตาม `data-contract-rules.md` (ส่วนการล้าง `ResultCipher` ที่หมดอายุใน `SchoolBotIdempotency` เป็น `UPDATE ... SET "ResultCipher" = NULL`)
3. **Primary Key Generation & Capacity (`int4`)**:
   - ใช้ `integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE)` ตาม `decisions-012.md` และ `data-model.md` (ห้าม client ส่งค่า PK มาเอง และห้าม wrap/reuse เมื่อเต็ม)
   - ความเสี่ยงเรื่องเพดาน `int4` (2,147,483,647) บนตารางที่มีอัตราการเติบโตสูง (`SchoolBotAuditEvent`, `SchoolBotIdempotency`, `SchoolBotAttempt`, `SchoolBotSubmission`) บันทึกไว้ในหัวข้อความเสี่ยงด้านล่าง พร้อมข้อเสนอการติดตาม sequence usage
4. **Representation ของ Enums**:
   - ใช้ `varchar` คู่กับ `CHECK (... IN (...))` แทน PostgreSQL `CREATE TYPE ... AS ENUM` สำหรับทุก enum (เช่น `Mode`, `Lifecycle`, `State`, `Channel`, `Platform`, `StaffRole`) ตามหมายเหตุใน `schoolbot.dbml:17` ("Enum เป็น logical values สำหรับ review ไม่ใช่อนุมัติ PostgreSQL enum migration") เพื่อให้การเพิ่ม/ลด state ในอนาคตและการทำ rollback ไม่ติดข้อจำกัดของ `ALTER TYPE ... DROP VALUE` ใน PostgreSQL และเข้ากันได้กับ EF Core string conversion ทันที
5. **Global Content vs Tenant Scope (`SchoolId IS NULL`)**:
   - ตาราง Global เท่านั้น (`SchoolBotLevel`, `SchoolBotLevelPromotionPolicy`, `SchoolBotCurriculum`, `SchoolBotLesson`, `SchoolBotMission`, `SchoolBotCriteria`, `SchoolBotActivity`, `SchoolBotQuestionBank`): บังคับ `CHECK ("SchoolId" IS NULL)` เพื่อป้องกันการใส่ `SchoolId = 0` หรือผูกโรงเรียนโดยพลการ
   - ตาราง Mixed Global/Tenant (`SchoolBotRelease`, `SchoolBotIdempotency`, `SchoolBotAuditEvent`): บังคับ `CHECK ("SchoolId" IS NULL OR "SchoolId" > 0)` และสร้าง **Partial Unique Index แยก 2 ตัว** (ตัวหนึ่งสำหรับ `WHERE "SchoolId" IS NULL` และอีกตัวสำหรับ `WHERE "SchoolId" IS NOT NULL`) เพื่อให้รองรับ PostgreSQL ทุกเวอร์ชัน (รวมรุ่นก่อน PG 15 ที่ยังไม่มี `NULLS NOT DISTINCT`)
   - ตาราง Tenant เท่านั้น (อีก 22 ตาราง): บังคับ `"SchoolId" integer NOT NULL CHECK ("SchoolId" > 0)`
   - **การอ้างอิงข้าม Scope (Tenant → Global)**: ตารางของโรงเรียนที่อ้างถึง Global Content (เช่น `SchoolBotSubmission` → `Mission`/`Criteria`, `SchoolBotCourseRun` → `Curriculum`, `SchoolBotAttempt` → `Activity`) ใช้ single-column FK ไปยัง PK ของตาราง Global โดยตรง (ไม่ใช้ composite FK `("SchoolId", ...)` เพราะ `SchoolId` ของ Global เป็น `NULL` ซึ่งใน SQL `MATCH SIMPLE` จะข้ามการตรวจ FK ทันทีหากคอลัมน์ใดเป็น `NULL`)
   - **การอ้างอิงภายใน Tenant เดียวกัน (Tenant → Tenant)**: ใช้ composite FK `("SchoolId", <TargetId>)` คู่กับ `UNIQUE ("SchoolId", <PK>)` เพื่อบังคับระดับฐานข้อมูลว่า parent และ child ต้องอยู่โรงเรียนเดียวกันเสมอ
6. **Circular Foreign Keys & Deferred Constraints**:
   - ความสัมพันธ์ที่เป็นวงกลมระหว่าง parent กับ current pointer/child:
     - `SchoolBotLicense.CurrentBindingId` ↔ `SchoolBotLicenseBinding.LicenseId`
     - `SchoolBotProject.CurrentRevision` ↔ `SchoolBotProjectRevision.(ProjectId, Revision)`
     - `SchoolBotSubmission.CurrentAssessmentId` ↔ `SchoolBotAssessment.SubmissionId`
     - `SchoolBotCourseRun.CurrentPolicyId` ↔ `SchoolBotScoringPolicy.CourseRunId`
   - ออกแบบให้ FK ฝั่ง current pointer เป็น `DEFERRABLE INITIALLY DEFERRED` เพื่อให้ backend สามารถ `INSERT` แถวหลักและแถวลูก แล้วอัปเดต current pointer ได้ภายใน atomic transaction เดียวกันโดยไม่ติดลำดับก่อนหลัง

---

## 3. การจับคู่งานตามแผน (Mapping to Plan Tasks)

| ไฟล์ SQL | เนื้อหาหลัก | งานในแผนที่ครอบคลุม |
|---|---|---|
| `db/001_base_license_release_atomic.sql` (+ rollback) | Roles/grants พื้นฐาน, `SchoolBotLicense`, `SchoolBotLicenseBinding`, `SchoolBotRelease`, `SchoolBotIdempotency`, `SchoolBotAuditEvent` | `DBA-001`, `DBA-002` (ส่วน License/Idempotency/Audit), `DBA-006` (ส่วน Release) |
| `db/002_identity_session_staff.sql` (+ rollback) | `SchoolBotSession` (รองรับทั้ง DES-004 และ DES-012 `Channel`), `SchoolBotStaffRole`, `SchoolBotTeacherGrant` (conditional), `SchoolBotProject`, `SchoolBotProjectRevision` | `DBA-002` (ส่วน Session/TeacherGrant), `DBA-004` (ส่วน Projects), ประตู `H4` (Session/StaffRole) |
| `db/003_learning_content_global.sql` (+ rollback) | `SchoolBotLevel`, `SchoolBotLevelPromotionPolicy`, `SchoolBotCurriculum`, `SchoolBotLesson`, `SchoolBotMission`, `SchoolBotCriteria`, `SchoolBotActivity`, `SchoolBotQuestionBank` | `DBA-005` (ส่วน Content/QuestionBank ตาม `amendment-proposal-001/002`) |
| `db/004_course_run_policy_attempt_submission.sql` (+ rollback) | `SchoolBotCourseRun`, `SchoolBotScoringPolicy`, `SchoolBotCourseRunActivity`, `SchoolBotSubmission`, `SchoolBotGradingJob`, `SchoolBotAssessment`, `SchoolBotAttempt`, `SchoolBotRetakeGrant` | `DBA-005` (ส่วน Submission/Grading/Assessment + CourseRun/Policy/Attempt/Retake) |
| `db/005_grade_slot_mapping_preview_export.sql` (+ rollback) | `SchoolBotGradeSlot`, `SchoolBotScoreMapping`, `SchoolBotScorePreview`, `SchoolBotScorePreviewItem`, `SchoolBotScoreExport`, `SchoolBotScoreOutbox` | ส่วนขยาย `DES-008` และ `DES-009` (`amendment-proposal-001/002`) |
| `db/006_level_proposal.sql` (+ rollback) | `SchoolBotLevelProposal` + GRANT สิทธิ์อ่านตาราง legacy ใน School DB ให้ `schoolbot_app` | ส่วนขยาย `DES-011` (`amendment-proposal-001/002`) |
| `db/007_pggradedb_grants.sql` (+ rollback) | เฉพาะ `GRANT SELECT/UPDATE/INSERT` บนตารางเกรดใน **PGGradeDB** สำหรับ `schoolbot_app` (ไม่แก้ schema) | ประตู `G-DB` ของ `DES-009` |

---

## 4. สรุปตาราง, Key Constraints และ Partial Unique Indexes ทั้ง 33 ตาราง

### ไฟล์ 001: Base, License, Release, Atomic Operations (5 ตาราง)
1. **`SchoolBotLicense`** (Tenant: `SchoolId > 0`):
   - PK: `SchoolBotLicenseId int4 IDENTITY`
   - Unique: `KeyHash`, `(SchoolId, SchoolBotLicenseId)`
   - FK (Deferred): `(SchoolId, SchoolBotLicenseId, CurrentBindingId)` → `SchoolBotLicenseBinding(SchoolId, LicenseId, SchoolBotLicenseBindingId)`
2. **`SchoolBotLicenseBinding`** (Tenant: `SchoolId > 0`):
   - PK: `SchoolBotLicenseBindingId int4 IDENTITY`
   - Unique: `(LicenseId, Epoch)`, `(SchoolId, LicenseId, SchoolBotLicenseBindingId)`
   - **Partial Unique Index**: `ux_schoolbot_license_binding_active` บน `(LicenseId) WHERE "DetachedAt" IS NULL AND "IsDelete" = false` (บังคับ 1 active binding ต่อ License)
   - Check: `"LastEntitlementExpiresAt" <= "LastCheckedAt" + interval '259200 seconds'` (ไม่เกิน 3 วันตาม `DES-002`)
3. **`SchoolBotRelease`** (Global/Tenant: `SchoolId IS NULL OR SchoolId > 0`):
   - PK: `SchoolBotReleaseId int4 IDENTITY`
   - **Partial Unique Indexes**:
     - `ux_schoolbot_release_global` บน `(VersionText, Channel, Platform) WHERE "SchoolId" IS NULL`
     - `ux_schoolbot_release_tenant` บน `(SchoolId, VersionText, Channel, Platform) WHERE "SchoolId" IS NOT NULL`
4. **`SchoolBotIdempotency`** (Global/Tenant: `SchoolId IS NULL OR SchoolId > 0`):
   - PK: `SchoolBotIdempotencyId int4 IDENTITY`
   - **Partial Unique Indexes**:
     - `ux_schoolbot_idempotency_global` บน `(Principal, Operation, RequestKey) WHERE "SchoolId" IS NULL`
     - `ux_schoolbot_idempotency_tenant` บน `(SchoolId, Principal, Operation, RequestKey) WHERE "SchoolId" IS NOT NULL`
     - `ux_schoolbot_idempotency_nonce` บน `(NonceHash) WHERE "NonceHash" IS NOT NULL`
5. **`SchoolBotAuditEvent`** (Global/Tenant: `SchoolId IS NULL OR SchoolId > 0`):
   - PK: `SchoolBotAuditEventId int4 IDENTITY`
   - Indexes: `(SchoolId, EntityType, EntityId, CreateDate DESC)`, `(RequestId)`

### ไฟล์ 002: Identity, Session, StaffRole, TeacherGrant, Projects (5 ตาราง)
6. **`SchoolBotSession`** (Tenant: `SchoolId > 0`):
   - PK: `SchoolBotSessionId int4 IDENTITY`
   - Unique: `TokenHash`
   - Check (`DES-004` + `DES-012` / `amendment-proposal-002`):
     - `("ProfileKind" IS NULL AND "ProfileId" IS NULL) OR ("ProfileKind" IS NOT NULL AND "ProfileId" IS NOT NULL)`
     - `("Channel" = 'desktop' AND "DeviceJkt" IS NOT NULL AND "AccountId" IS NOT NULL) OR ("Channel" IN ('school_web', 'staff_admin') AND "DeviceJkt" IS NULL)`
7. **`SchoolBotStaffRole`** (Tenant: `SchoolId > 0` = โรงเรียนต้นสังกัดของบัญชีพนักงาน):
   - PK: `SchoolBotStaffRoleId int4 IDENTITY`
   - **Partial Unique Index**: `ux_schoolbot_staff_role_live` บน `(SchoolId, EmployeeId, Role) WHERE "IsDelete" = false`
8. **`SchoolBotTeacherGrant`** (Tenant: `SchoolId > 0`, Conditional Fallback ตาม `DES-004`):
   - PK: `SchoolBotTeacherGrantId int4 IDENTITY`
   - **Partial Unique Index**: `ux_schoolbot_teacher_grant_live` บน `(SchoolId, TeacherId, LearnerId, Mode) WHERE "IsDelete" = false`
   - Check: `(NOT "CanAssess") OR "CanView"`, `"ValidUntil" IS NULL OR "ValidUntil" > "ValidFrom"`
9. **`SchoolBotProject`** (Tenant: `SchoolId > 0`):
   - PK: `SchoolBotProjectId int4 IDENTITY`
   - Unique: `(SchoolId, SchoolBotProjectId)`
   - FK (Deferred): `(SchoolId, SchoolBotProjectId, CurrentRevision)` → `SchoolBotProjectRevision(SchoolId, ProjectId, Revision)`
10. **`SchoolBotProjectRevision`** (Tenant: `SchoolId > 0`):
    - PK: `SchoolBotProjectRevisionId int4 IDENTITY`
    - Unique: `(SchoolId, SchoolBotProjectRevisionId)`, `(ProjectId, Revision)`, `(SchoolId, ProjectId, Revision)`

### ไฟล์ 003: Global Learning Content & Question Bank (8 ตาราง, ทุกตาราง `SchoolId IS NULL`)
11. **`SchoolBotLevel`**: PK `SchoolBotLevelId`, Unique `LevelKey`, `Code`, `Ordinal`
12. **`SchoolBotLevelPromotionPolicy`**: PK `SchoolBotLevelPromotionPolicyId`, Unique `(LevelId, Revision)`, Check `Threshold >= 0 AND Threshold <= 100`
13. **`SchoolBotCurriculum`**: PK `SchoolBotCurriculumId`, Unique `(CurriculumKey, Revision)`, FK `LevelId` → `SchoolBotLevel` (ถอน `Mode` ตาม `amendment-proposal-001`)
14. **`SchoolBotLesson`**: PK `SchoolBotLessonId`, Unique `(CurriculumId, LessonKey)`, `(CurriculumId, Ordinal)`
15. **`SchoolBotMission`**: PK `SchoolBotMissionId`, Unique `(LessonId, MissionKey)`, `(LessonId, Ordinal)`
16. **`SchoolBotCriteria`**: PK `SchoolBotCriteriaId`, Unique `(MissionId, Revision)`, `(MissionId, SchoolBotCriteriaId)`
17. **`SchoolBotActivity`**: PK `SchoolBotActivityId`, Unique `(LessonId, ActivityKey)`, `(LessonId, Ordinal)`, Check `("Type" = 'project' AND "Mode" IS NOT NULL) OR ("Type" IN ('instruction', 'quiz', 'test') AND "Mode" IS NULL)`
18. **`SchoolBotQuestionBank`**: PK `SchoolBotQuestionBankId`, Unique `(BankKey, Revision)`

### ไฟล์ 004: CourseRun, Policy, Attempt, Submission, Grading (8 ตาราง, ทุกตาราง `SchoolId > 0`)
19. **`SchoolBotCourseRun`**:
    - PK: `SchoolBotCourseRunId int4 IDENTITY`, คอลัมน์ `PlanCourseIds int4[]` (`cardinality >= 1`)
    - **Partial Unique Indexes**:
      - `ux_schoolbot_courserun_active_room` บน `(SchoolId, ClassroomId, NYear, NTerm) WHERE "Lifecycle" IN ('planned', 'active', 'closing') AND "IsDelete" = false`
      - `ux_schoolbot_courserun_one_successor` บน `(PreviousRunId) WHERE "PreviousRunId" IS NOT NULL AND "IsDelete" = false`
20. **`SchoolBotScoringPolicy`**: PK `SchoolBotScoringPolicyId`, Unique `(CourseRunId, Revision)`, `(SchoolId, CourseRunId, SchoolBotScoringPolicyId)`
21. **`SchoolBotCourseRunActivity`**: PK `SchoolBotCourseRunActivityId`, Unique `(CourseRunId, ActivityId)`, Check `"ClosesAt" IS NULL OR "OpensAt" IS NULL OR "ClosesAt" > "OpensAt"`
22. **`SchoolBotSubmission`**: PK `SchoolBotSubmissionId`, FK `MissionId` → `SchoolBotMission`, `(MissionId, CriteriaId)` → `SchoolBotCriteria`, `(SchoolId, ProjectRevisionId)` → `SchoolBotProjectRevision`
23. **`SchoolBotGradingJob`**: PK `SchoolBotGradingJobId`, Unique `SubmissionId`, Partial Index สำหรับคิวงาน `WHERE "State" IN ('queued', 'running') AND "IsDelete" = false`
24. **`SchoolBotAssessment`**: PK `SchoolBotAssessmentId`, Unique `(SubmissionId, Sequence)`, Check คะแนนตัวเลข `("EarnedScore" IS NULL AND "MaxScore" IS NULL) OR ("EarnedScore" IS NOT NULL AND "MaxScore" IS NOT NULL AND "MaxScore" > 0 AND "EarnedScore" >= 0 AND "EarnedScore" <= "MaxScore")`
25. **`SchoolBotAttempt`**: PK `SchoolBotAttemptId`, Unique `(SchoolId, CourseRunId, ActivityId, LearnerId, Sequence)`
26. **`SchoolBotRetakeGrant`**: PK `SchoolBotRetakeGrantId`, FK `(SchoolId, CourseRunId)` → `SchoolBotCourseRun`, `ActivityId` → `SchoolBotActivity`

### ไฟล์ 005: GradeSlot, ScoreMapping, ScorePreview, ScoreExport, ScoreOutbox (6 ตาราง, ทุกตาราง `SchoolId > 0`)
27. **`SchoolBotGradeSlot`**:
    - PK: `SchoolBotGradeSlotId int4 IDENTITY`
    - **Partial Unique Index**: `ux_schoolbot_gradeslot_active_ownership` บน `(SchoolId, NGradeId, AssessmentId, ScoreIdentifier) WHERE "RetiredAt" IS NULL` (**ไม่กรอง `IsDelete = false`** เพื่อห้ามหลบ ownership ด้วย soft-delete ตาม `amendment-proposal-001`)
28. **`SchoolBotScoreMapping`**:
    - PK: `SchoolBotScoreMappingId int4 IDENTITY`
    - **Partial Unique Index**: `ux_schoolbot_scoremapping_active` บน `(CourseRunId, GradeSlotId) WHERE "RetiredAt" IS NULL AND "IsDelete" = false`
29. **`SchoolBotScorePreview`**: PK `SchoolBotScorePreviewId`, FK `(SchoolId, CourseRunId)` → `SchoolBotCourseRun`, Self-FK `SupersedesId`
30. **`SchoolBotScorePreviewItem`**: PK `SchoolBotScorePreviewItemId`, Unique `(ScorePreviewId, LearnerId)`, `(SchoolId, ScorePreviewId, SchoolBotScorePreviewItemId)`
31. **`SchoolBotScoreExport`**: PK `SchoolBotScoreExportId`, Unique `ScorePreviewId`, `(SchoolId, ScoreBotScoreExportId)`
32. **`SchoolBotScoreOutbox`**:
    - PK: `SchoolBotScoreOutboxId int4 IDENTITY`
    - Unique: `OperationKey`, `(ScoreExportId, ScorePreviewItemId)`
    - คอลัมน์ `ReceiptId bigint NULL` (อ้างอิง `PGTGradeAuditLog.GradeAuditLogId` แบบ logical ไม่สร้าง cross-DB FK)

### ไฟล์ 006: Level Proposal (1 ตาราง, `SchoolId > 0`)
33. **`SchoolBotLevelProposal`**:
    - PK: `SchoolBotLevelProposalId int4 IDENTITY`
    - **Partial Unique Indexes**:
      - `ux_schoolbot_levelproposal_confirmed_per_run` บน `(CourseRunId) WHERE "State" IN ('promoted', 'retained', 'max_level') AND "IsDelete" = false`
      - `ux_schoolbot_levelproposal_successor_unique` บน `(SuccessorRunId) WHERE "SuccessorRunId" IS NOT NULL AND "IsDelete" = false`

---

## 5. ความเสี่ยงและข้อจำกัด (Risks & Assumptions)

1. **ความเสี่ยงจากการเขียน PGGradeDB (`DES-009`)**:
   - ตาราง `"PGTGradeDetail"` ใน EF model ไม่มี unique constraint บน `("SchoolID", "nGradeId", "sID", "cDel")` (`PGGradeDBPostgreSQLDBContext.cs:546`) ดังนั้น adapter ของ SchoolBot ต้องตรวจสอบจำนวนแถวที่อ่านได้เสมอ (ถ้าพบ `> 1` แถวที่ `"cDel" = false` ต้องหยุดด้วย `TARGET_AMBIGUOUS`) และตอน `UPDATE` ต้องระบุ `WHERE "nGradeDetailId" = @detailId AND "SchoolID" = @schoolId AND xmin = @expectedXmin`
   - ตาราง `"PGTGradeAuditLog"` ไม่มี unique index บน `"Parameter"` หรือ operation key และห้ามเพิ่ม index ใน PGGradeDB ตาม `decisions-021/023` ดังนั้น SchoolBot worker ทุก instance ต้องใช้ `pg_advisory_xact_lock` บน PGGradeDB (ผูกกับ hash ของ `OperationKey` หรือ `(SchoolId, NGradeDetailId)`) ก่อนค้นหาและ `INSERT` receipt ใน transaction เดียวกับการอัปเดตคะแนน
2. **เพดาน `int4` (2,147,483,647) และ Retention `(สมมติฐาน — ยังไม่ยืนยัน)`**:
   - PK ทุกตารางใช้ `int4` ตาม `decisions-012.md` สำหรับตารางที่มีการเพิ่มแถวตลอดเวลา ได้แก่ `SchoolBotAuditEvent`, `SchoolBotIdempotency`, `SchoolBotAttempt`, `SchoolBotSubmission` และ `SchoolBotSession` หากมีปริมาณธุรกรรมสูงต่อเนื่องหลายปี อาจเข้าใกล้เพดาน `2,147,483,647`
   - การทำ table partitioning หรือนโยบาย retention/archival ของ `SchoolBotAuditEvent` และ `SchoolBotIdempotency` tombstone ยังเป็น `(สมมติฐาน — ยังไม่ยืนยัน)` รอเจ้าของข้อมูลกำหนดตาม PDPA (ในชั้นนี้จึงยังไม่เปิด partitioning อัตโนมัติเพราะ PostgreSQL บังคับให้ partition key ต้องอยู่ในทุก unique constraint/PK ซึ่งจะกระทบโครงสร้าง single-column PK `int4`)
3. **ผลกระทบต่อข้อมูลเดิม (Data Impact)**:
   - การรัน migration `001`–`006` เป็นการสร้างตารางใหม่ทั้งหมดใน School DB (`SchoolBot*`) **ไม่กระทบข้อมูลเดิมในตารางของระบบ SchoolBright**
   - การรัน rollback `001_rollback`–`006_rollback` จะ **ทำลายข้อมูลทั้งหมดในตาราง `SchoolBot*` ที่ถูก `DROP`** (ระบุไว้ในหัวไฟล์ rollback ทุกไฟล์) จึงห้ามรัน rollback บน production ที่มีข้อมูลจริงแล้วโดยไม่มี backup

---

## 6. ลำดับการรัน (Execution Runbook — สำหรับมนุษย์เป็นผู้รัน)

> **คำเตือน**: ห้ามรัน `007_pggradedb_grants.sql` จนกว่าจะผ่าน release gates `G-PARITY`, `G-COEXIST`, `G-TARGET`, `G-AUTHZ`, `G-DB` ของ `DES-009`

### การรันเดินหน้า (Forward Migration)
รันบน **School DB (`JabjaiSchoolSingleDB`)** ด้วยสิทธิ์ database owner / migration admin พร้อม `psql -v ON_ERROR_STOP=1`:
1. `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/001_base_license_release_atomic.sql`
2. `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/002_identity_session_staff.sql`
3. `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/003_learning_content_global.sql`
4. `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/004_course_run_policy_attempt_submission.sql`
5. `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/005_grade_slot_mapping_preview_export.sql`
6. `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/006_level_proposal.sql`

รันบน **PGGradeDB** (เฉพาะเมื่อผ่าน G-DB และมนุษย์อนุมัติแล้วเท่านั้น):
7. `psql -v ON_ERROR_STOP=1 -d <pggrade_db> -f db/007_pggradedb_grants.sql`

### การรันย้อนกลับ (Rollback — ย้อนลำดับจากท้ายสุดมาหน้าสุด)
1. บน **PGGradeDB**: `psql -v ON_ERROR_STOP=1 -d <pggrade_db> -f db/007_pggradedb_grants_rollback.sql`
2. บน **School DB**:
   - `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/006_level_proposal_rollback.sql`
   - `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/005_grade_slot_mapping_preview_export_rollback.sql`
   - `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/004_course_run_policy_attempt_submission_rollback.sql`
   - `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/003_learning_content_global_rollback.sql`
   - `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/002_identity_session_staff_rollback.sql`
   - `psql -v ON_ERROR_STOP=1 -d <school_db> -f db/001_base_license_release_atomic_rollback.sql`

---

## 7. เช็กลิสต์และคำสั่งตรวจสอบหลังรัน (สำหรับ `DBA-003` ใช้ตรวจหลักฐานจากมนุษย์)

เมื่อมนุษย์รันสคริปต์บน environment ทดสอบแล้ว ให้รันคำสั่งตรวจสอบแบบ read-only ต่อไปนี้และส่งผลลัพธ์กลับมาให้ `DBA-003`:

1. **ตรวจจำนวนตาราง SchoolBot ทั้ง 33 ตาราง และชนิด PK (`int4` identity)**:
   ```sql
   SELECT c.table_name, c.column_name, c.data_type, c.is_identity, c.identity_generation
   FROM information_schema.columns c
   WHERE c.table_schema = 'public'
     AND c.table_name LIKE 'SchoolBot%'
     AND c.column_name = c.table_name || 'Id'
   ORDER BY c.table_name;
   ```
   - *Expected*: ได้ 33 แถว (หรือ 32 แถวหากยังไม่เปิด `SchoolBotTeacherGrant`), `data_type = 'integer'`, `is_identity = 'YES'`, `identity_generation = 'ALWAYS'`

2. **ตรวจ Common Columns ครบทุกตาราง (7 คอลัมน์ต่อตาราง)**:
   ```sql
   SELECT table_name, COUNT(*) AS common_col_count
   FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name LIKE 'SchoolBot%'
     AND column_name IN ('IsDelete', 'CreateBy', 'CreateDate', 'UpdateBy', 'UpdateDate', 'SchoolId', 'Version')
   GROUP BY table_name
   HAVING COUNT(*) <> 7;
   ```
   - *Expected*: `0 rows` (ทุกตารางมีครบ 7 คอลัมน์)

3. **ตรวจ Partial Unique Indexes และ Deferred Foreign Keys**:
   ```sql
   SELECT indexname, tablename, indexdef
   FROM pg_indexes
   WHERE schemaname = 'public'
     AND tablename LIKE 'SchoolBot%'
     AND indexdef LIKE '%WHERE%'
   ORDER BY tablename, indexname;

   SELECT conname, conrelid::regclass AS table_name, condeferred, condeferrable
   FROM pg_constraint
   WHERE conrelid::regclass::text LIKE '"SchoolBot%'
     AND contype = 'f'
     AND condeferrable = true
   ORDER BY table_name, conname;
   ```
   - *Expected*: พบ partial indexes ครบตามที่กำหนด (active binding, global/tenant release & idempotency, live staff role, live teacher grant, active course run, active grade slot, active score mapping, confirmed level proposal) และพบ deferred FKs 4 รายการ (`CurrentBindingId`, `CurrentRevision`, `CurrentAssessmentId`, `CurrentPolicyId`)

4. **ตรวจสิทธิ์ของ `schoolbot_app` (ไม่มี `DELETE` หรือ `TRUNCATE`)**:
   ```sql
   SELECT table_name, privilege_type
   FROM information_schema.role_table_grants
   WHERE grantee = 'schoolbot_app'
     AND table_schema = 'public'
   ORDER BY table_name, privilege_type;
   ```
   - *Expected*: บนตาราง `SchoolBot*` มีเฉพาะ `SELECT`, `INSERT`, `UPDATE`; บนตาราง legacy มีเฉพาะ `SELECT`

5. **ตรวจ Inventory ของ PGGradeDB สำหรับ Gate `G-PARITY` / `G-DB`** (รันบน PGGradeDB แบบ read-only):
   ```sql
   -- ตรวจ triggers บนตารางเกรด
   SELECT event_object_table, trigger_name, event_manipulation, action_statement
   FROM information_schema.triggers
   WHERE event_object_schema = 'public'
     AND event_object_table IN ('PGTGrade', 'PGTGradeDetail', 'PGTAssessment', 'PGTGradeEdits', 'PGTGradeSetting', 'PGTGradeAuditLog');

   -- ตรวจนิยามฟังก์ชัน getstudentgradebysid
   SELECT proname, pg_get_functiondef(oid)
   FROM pg_proc
   WHERE proname ILIKE '%getstudentgradebysid%';
   ```

---

## 8. สิ่งที่มนุษย์ต้องอนุมัติก่อนรัน (Human Gates)

1. **อนุมัติ Schema Baseline + Amendments (`H4`)**: ยืนยันการนำ `amendment-proposal-001` และ `amendment-proposal-002` มารวมใน DDL ชุดนี้ (รวมถึงการถอน `Curriculum.Mode`, การแยก `SchoolId IS NULL` สำหรับ global content และการเพิ่ม `Channel` ใน `SchoolBotSession`)
2. **อนุมัติ Conditional Table (`SchoolBotTeacherGrant`)**: ยืนยันว่าจะให้สร้างตาราง `SchoolBotTeacherGrant` ไว้พร้อมใช้งานใน `002_identity_session_staff.sql` หรือไม่
3. **อนุมัติชื่อ Database Role**: ยืนยันการใช้ role `schoolbot_app` และการ bind เข้ากับ login user จริงในแต่ละ environment
4. **อนุมัติ Gate `G-DB` และ Release Gates ของ `DES-009` ก่อนรัน `007_pggradedb_grants.sql`**: ห้ามเปิดสิทธิ์เขียนบน PGGradeDB ใน production จนกว่าผลการทดสอบ `G-PARITY`, `G-COEXIST`, `G-TARGET`, `G-AUTHZ` และ `G-DB` จะผ่านครบและได้รับการลงนามจากเจ้าของระบบเกรด

## Change Log
- 2026-10-22 — สร้างเอกสารรีวิว physical schema, ลำดับการรัน และเช็กลิสต์ตรวจสอบหลังรันสำหรับ SchoolBot ทั้ง 33 ตารางใน School DB และสิทธิ์ใน PGGradeDB
