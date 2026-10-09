# sb-compass-faculty-match — Data Model

> Budget ≤ 15 KB (`policies\documentation.md` §4) · เขียนโดย `system-analyst` เท่านั้น · นี่คือ **schema contract** — `qa-engineer` อ่านเต็มทุกรอบ, engineers implement verbatim

## Data Model

> **ไม่ใช่ Prisma โดยเจตนา** — ดูหมายเหตุเรื่อง stack ด้านบน
> **รอบที่ 2 (2026-08-31) — schema ของโมดูลนี้เองยังคง additive ล้วน** (ตารางใหม่ทั้งหมด ไม่มีข้อมูล
> จริงถูก implement มาก่อนตามที่ `status.md` ยืนยัน จึงไม่มีข้อมูลสูญหายแม้จะรื้อโครงจากรอบที่ 1) —
> **ข้อยกเว้นเดียว**: T-Score (REQ-013) ต้องเพิ่มคอลัมน์ `"StddevScore"` ที่ตาราง
> `public."TCompassLevelSubjectStat"` ของ **`sb-compass`** (additive/nullable แต่เป็นตารางที่โมดูลนี้
> ไม่ได้เป็นเจ้าของ) — **ยืนยันทิศทางแล้ว (OQ-F06 = ทางเลือก A) และ `sb-compass REQ-017` ลงใน
> `sb-compass/requirement.md` แล้ว (2026-08-31)** · ที่เหลือคือ design/implement ฝั่งนั้น ดู
> RISK-F14/DEP-F09 — **โมดูลนี้ยังคงอ่านคอลัมน์นั้นอย่างเดียว ไม่เขียน ไม่นิยาม DDL ของมันเอง**
> ตารางเดิมของ `sb-compass` (`public."TCompassLevelSubjectStat"`, `public."TCompassStudentLevelScore"`,
> `public."TCompassMbtiResult"` — **ชื่อใหม่ตาม `sb-compass/design.md` Contract Version 8**) และตาราง
> SB PLUS / ฐานข้อมูลเกรด **ไม่ถูกแตะเลยนอกจากข้อยกเว้นข้างบน** —
> ดูหัวข้อ `## Database Ownership Boundary` ว่าใครเขียนอะไรได้บ้าง

**ที่อยู่**: ~~ทุกตารางด้านล่างอยู่ใน **`PGGradeDB`** ที่เดียวกับตาราง `compass_*` เดิม เพื่อให้
`ClassOnlineWeb` อ่านได้ด้วย connection ที่มีอยู่แล้ว โดยไม่ต้องเพิ่ม connection string ใหม่~~

> 🔴 **v11 (2026-09-16) — ย่อหน้า "ที่อยู่" ถูก reconcile ตาม RISK-F22 (ผู้ใช้ยืนยัน 2026-09-14
> บันทึกในหัวไฟล์ bootstrap)** — ข้อสมมติเดิม "อ่านได้ด้วย connection ที่มีอยู่แล้ว ไม่ต้องเพิ่ม
> connection string" **ไม่จริงอีกต่อไป** ที่อยู่จริงแบ่งเป็นสองฐานข้อมูล:
>
> | กลุ่มตาราง | ฐานข้อมูล | การเชื่อมต่อ |
> |---|---|---|
> | **ตารางใหม่ 31 ตัวของโมดูลนี้** (กลุ่ม 1 คลังหลักสูตร + กลุ่ม 2 ผลนักเรียน — DDL/seed ตามสคริปต์ bootstrap) | **`SB_Compass`** — host `10.0.0.128:9499` · user `app_kindergarten` (`prod.config` `PGCompass_*` บรรทัด 141-145) | **`ClassOnlineWeb` ต้องเพิ่ม connection ใหม่ (PRE-F10)** — วันนี้ `configSource-prod.config` ไม่มี connection string ใดชี้ `SB_Compass` และไม่มีโค้ดอ่านคีย์ `PGCompass_*` เลย · Curriculum Service ใช้ slot `database_url` ของตัวเอง (`settings.py` — รอค่านี้อยู่) |
> | **ตารางทั้งหมดของโมดูล `sb-compass` เอง** (`public."TCompassLevelSubjectStat"` · `public."TCompassStudentLevelScore"` · `public."TCompassMbtiResult"` — **ไม่อยู่ในสคริปต์ bootstrap** · 🔴 ผู้ใช้ชี้ขาดที่อยู่ 2026-09-16: **อยู่ใน PGCompass (`SB_Compass`) ไม่ใช่ `PGGradeDB`**) | **`SB_Compass`** (ฐานเดียวกับตารางใหม่ 31 ตัว) | **Module C ของ `sb-compass` ต้องเปลี่ยน connection ก่อนสร้าง/คำนวณจริง** — โค้ดปัจจุบัน (`CompassRankingService.cs:33` `GradePrimary = "PGGradeDBEntities"`) ยังพาไปตก `PGGradeDB` ผิดฐาน · Module K อ่าน `public."TCompassLevelSubjectStat"` ด้วย connection ใหม่เช่นกัน |
> | ตารางเกรด (`"PGTGrade"`/`"PGTGradeDetail"` ฯลฯ — Module E อ่านคะแนน) + SB PLUS ~~+ legacy `compass_*`~~ *(v12 แก้: ตัด legacy ออก — `PGGradeDB` ไม่มีตาราง Compass ใดเลย ผู้ใช้ยืนยัน 2026-09-16 · ตาราง snake_case ยุคแรกไม่เคยถูกสร้างในฐานใดเลย ตาม v5/OQ-F10)* | **`PGGradeDB`** — host `10.0.0.136:9499` · user `app_academic` (`configSource-prod.config:10` `PGGradeDBEntities`) | **`PGGradeDBEntities` เหลือใช้เฉพาะกลุ่มนี้** — ~~legacy ไม่ย้าย (ผู้ใช้ยืนยัน 2026-09-14)~~ *(v12: กลุ่มนี้ไม่มีตาราง Compass ให้ย้ายตั้งแต่แรก — ตาราง Compass ทุกตัวอยู่ `SB_Compass`)* |
>
> **ผลที่ตามมาและห้ามผ่อน**:
> 1. **โค้ด faculty-match ปัจจุบันทุกไฟล์ยังใช้ `PGGradeDBEntities` กับตารางที่จะอยู่ใน `SB_Compass`**
>    (`CompassClusterService.cs:29` · `CompassRiasecService.cs:28` — ทั้งอ่านน้ำหนัก/เขียนผล
>    RIASEC/เขียนผล cluster) — **ต้องเปลี่ยน connection ของ read/write ตารางกลุ่ม 1-2 ไปทางใหม่**
>    · ครอบคลุม **ตารางของ `sb-compass` เองด้วย**: `public."TCompassLevelSubjectStat"` อ่านด้วย
>    connection ใหม่ ไม่ใช่ `PGGradeDBEntities` (ผู้ใช้ชี้ขาด 2026-09-16) · **`PGGradeDBEntities`
>    เหลือเฉพาะการอ่านตารางเกรดของ Module E** → **PRE-F10 + RISK-F23**
> 2. **ห้าม JOIN ข้ามสองฐานข้อมูลใน SQL เดียว** — PostgreSQL ข้าม cluster ไม่มี cross-database
>    JOIN · การรวมข้อมูลข้ามฐาน (เช่น ~~national stats จาก `PGGradeDB` × น้ำหนักจาก `SB_Compass`~~
>    — *v12 แก้ตัวอย่าง: national stats คือ `public."TCompassLevelSubjectStat"` เป็นตาราง Compass
>    จึงอยู่ `SB_Compass` แล้ว · ตัวอย่างที่ยังจริง: ข้อมูลเกรดจาก `PGGradeDB` × ตาราง Compass จาก
>    `SB_Compass`*) รวมที่ชั้น application เท่านั้น (pattern เดิมของ `CompassClusterService` อ่านแยกแล้ว join ใน
>    memory ตรงกับกติกานี้อยู่แล้ว)
> 3. **ความเป็นเจ้าของ/ผู้เขียน/ผู้อ่านไม่เปลี่ยนทุกช่อง** — ยังตามตารางของ `## DES-018`
>    (เปลี่ยนเฉพาะที่อยู่ ไม่ใช่สิทธิ์) · grant จริงเป็นของ PRE-F04 (อัปเดตแล้วใน `## DES-024`)
> 4. สคริปต์ bootstrap = **ground truth ของ DDL + seed ทั้งหมดใน `SB_Compass`** — รวมกลุ่ม 1 ที่
>    ปกติเป็นของ Curriculum Service (ข้อยกเว้น bootstrap ครั้งเดียวตามหัวไฟล์ + README;
>    เมื่อ service ถูกสร้างจริง ความเป็นเจ้าของ migration กลุ่ม 1 ย้ายกลับตาม DES-018)

> ✅ **v5 (2026-08-31) — OQ-F10 ปิดแล้วด้วยตัวเลือก B**: ชื่อตารางทั้งหมดด้านล่างถูกเปลี่ยนเป็น
> `public."T<PascalCase>"` + คอลัมน์ `"PascalCase"` + index `"IX_..."`/`"UX_..."` ตรงกับ naming
> convention จริงขององค์กรแล้ว (เดิม v1-v4 ร่างเป็น snake_case และรอ OQ-F10 ตัดสิน — ปิดแล้ว
> ดู `## Table Naming Convention`) — **`backend-engineer` สร้างตารางตามชื่อด้านล่างได้เลย**
>
> **หลักฐานที่ตรวจจาก repo จริง `C:\src\schoolbright-backend` (อ่านอย่างเดียว ไม่ใช่ Target ที่ config ไว้)**
> — ตาราง PostgreSQL **ทุกตัวที่สร้างใหม่** ในระบบหลังบ้านใช้รูปแบบเดียวกันหมด ไม่มีข้อยกเว้นเลย:
> `public."T<PascalCase>"` · คอลัมน์ `"PascalCase"` (quoted) · index `"IX_<Table>_<Cols>"`
> | ไฟล์อ้างอิง (path จริง) | ตัวอย่างที่พบ |
> |---|---|
> | `C:\src\schoolbright-backend\database-scripts\weekly-audit\migrations\01-create-tjobrunlog.sql:31` | `CREATE TABLE IF NOT EXISTS public."TJobRunLog" ("JobRunId" uuid, "JobKey" text, "StartedAt" timestamp, ...)` · index `"IX_TJobRunLog_JobKey_StartedAt"` |
> | `C:\src\schoolbright-backend\database-scripts\weekly-audit\migrations\03-create-tjobconfig.sql:48,58` | `public."TJobConfig"` · `public."TJobConfigHistory"` (`"HistoryId"`, `"FieldName"`, `"ChangedAt"`) |
> | `C:\src\schoolbright-backend\database-scripts\weekly-audit\migrations\04-create-tschoolfeatureflag.sql:16` | `public."TSchoolFeatureFlag"` (`"SchoolID"`, `"FeatureKey"`, `"IsEnabled"`) |
> | `C:\src\schoolbright-backend\database-scripts\weekly-audit\migrations\02-create-tauditdailyrollup.sql:43` | `public."TAuditDailyRollup"` (`"AuditDate"`, `"TopicKey"`, `"MetricKey"`) |
> | `C:\src\schoolbright-backend\jabjaiuniversity\docs\migration\004_create_TFCMSendRequestLog_and_TFCMDeliveryAck.sql:9,27` | `public."TFCMSendRequestLog"` · `public."TFCMDeliveryAck"` (`"ID" bigserial`, `"RequestId"`, `"CreatedDate"`) |
> | `C:\src\schoolbright-backend\database-scripts\TFCMSendLog_Create.sql:8` | `public."TFCMSendLog"` (`"ID" bigserial`, `"SendCorrelationID"`) |
> | `C:\src\schoolbright-backend\jabjaiuniversity\PostgreSQL\migration_add_offday_attendance_mode.sql:14` | `ALTER TABLE "TSystemSetting" ADD COLUMN "nOffDayAttendanceMode"` — **การเพิ่มคอลัมน์ในตารางเก่าใช้ prefix แบบ Hungarian ตามสไตล์ของตารางนั้นเอง ไม่ใช่ PascalCase ล้วน** |
>
> **ตาราง `compass_*` เดิม 3 ตัวเคยรันเป็น snake_case ไม่ quoted** — ยืนยันจากโค้ด Target ตอนที่
> ตรวจ (`Helper/CompassRankingService.cs:541,548` (`compass_level_subject_stat`,
> `compass_student_level_score`, index `ix_cslscore_level_avg`) และ `Helper/CompassMbtiStore.cs:94`
> (`compass_mbti_result`)) **แต่โค้ดนั้นยังไม่เคยถูก deploy จริง** (`sb-compass` ทุก phase เป็น
> `deployed ⬜`) และ **`sb-compass/design.md` Contract Version 8 เปลี่ยนชื่อทั้งสามตารางเป็น
> `public."TCompassLevelSubjectStat"` / `public."TCompassStudentLevelScore"` /
> `public."TCompassMbtiResult"` (PascalCase quoted) แล้ว โดยไม่ต้อง migration เพราะยังไม่เคยถูกสร้าง
> ในฐานข้อมูลใด ๆ เลย** — โค้ดที่อ้างชื่อ snake_case ข้างต้นเป็นสิ่งที่ `sb-compass` Module C ต้องแก้
> ไม่ใช่สภาพปัจจุบันของฐานข้อมูลอีกต่อไป
> ~~**ผลคือทุกตารางใน `PGGradeDB` ที่เกี่ยวข้องกับ Compass ตรงกับ convention องค์กรแล้วทั้งหมด**
> (`"PGTGrade"`, `"PGTGradeDetail"`, `"TPlane"`, `"TSubLevel"`, และตอนนี้รวมสามตารางของ `sb-compass`)~~
> *(v12 แก้: สามตารางของ `sb-compass` เป็นตาราง Compass จึงอยู่ `SB_Compass` ไม่ใช่ `PGGradeDB` —
> ผู้ใช้ยืนยัน 2026-09-16 · ที่ `PGGradeDB` เหลือเฉพาะตารางเกรด/SB PLUS ซึ่งไม่ใช่ตาราง Compass)*
>
> **ตาราง 27 ตัวใหม่ของโมดูลนี้เอง — เปลี่ยนเป็น `public."T<PascalCase>"` แล้ว (v5)**: ร่างแรกสืบทอด
> สไตล์ snake_case ของ 3 ตารางเดิมของ `sb-compass` มาโดยไม่ได้ตั้งใจ — ผู้ใช้ปิด OQ-F10 ด้วยตัวเลือก B
> (2026-08-31) จึงเปลี่ยนทั้งหมดให้ตรง convention องค์กร ดู DDL เต็มด้านล่างและ
> `## Table Naming Convention`

> 🟠 **v6 (2026-08-31) — เพิ่ม 3 ตาราง + 4 คอลัมน์ (additive ล้วน ไม่มี migration)**: จำนวนตาราง
> ใหม่ของโมดูลนี้เปลี่ยนจาก **27 เป็น 30** — `public."TCompassRiasecRankBlock"`,
> `public."TCompassRiasecRankOption"` (คำถามแบบเรียงลำดับ REQ-012 รอบที่ 3) และ
> `public."TCompassStudentClusterRun"` (หัวรอบของการคำนวณ cluster · ที่อยู่ของ `ClarityIndex`) ·
> เพิ่มคอลัมน์ `"RankAnswers"`, `"AnsweredCount"`, `"ActiveItemCount"` ที่
> `public."TCompassRiasecResult"` (สามตัวหลังคือฐานของ Confidence — `## Cluster Determination Rules`
> ข้อ 7.1) และ `"DisplayScore"` ที่ `public."TCompassStudentClusterScore"` (ค่าที่แสดงหลังปรับ —
> ข้อ 7.4 · **ค่าดิบ `"CombinedScore"` ยังห้ามเขียนทับ**) · **ทุกตัวใช้ convention เดียวกับ
> ที่ OQ-F10 ปิดไว้ (ตัวเลือก B) ไม่ใช่การเปิด OQ-F10 ใหม่** · ยังไม่มีตารางใดถูกสร้างจริงในฐานข้อมูล
> จึงยังไม่ต้อง migration เหมือนเดิม (ทุก phase ของโมดูลนี้ `implemented ⬜` ตาม `status.md`)
> · **แก้ข้อผิดพลาดที่พบระหว่างรอบนี้**: `public."TCompassStudentClusterScore"."AcademicFit"` เดิม
> เขียนเป็น `NOT NULL` ซึ่ง**ขัดกับ `## Cluster Determination Rules` ข้อ 2 กติกา 3** ที่กำหนดว่า
> `AcademicFit` เป็น `NULL` ได้ทุก cluster เมื่อกลุ่มสาระถูกตัดหมด → แก้เป็น nullable

> 🔴 **v9 (2026-09-15) — PK ของตาราง master 7 ตัวเปลี่ยนจาก text code เป็น int identity
> (breaking · ผู้ใช้ยืนยันแล้ว · ไม่มี migration เพราะฐานถูกสร้างใหม่ทั้งก้อน)**
> ผู้ใช้แก้สคริปต์ bootstrap จริงด้วยตัวเองที่
> `C:\src\sb-web-student\ClassOnlineWeb\DatabaseScripts\Compass\bootstrap-sb-compass-db.sql`
> (หัวไฟล์ลงวันที่ **2026-09-15** บันทึกทั้งคำสั่งและคำยืนยันไว้ในตัวไฟล์) — **ไฟล์นั้นคือ ground truth
> ของ schema ณ ตอนนี้ และ `## Data Model` ถูก reconcile ตามมัน** ไม่ใช่ทางกลับกันในรอบนี้
> - **PK ใหม่เป็น `serial "<Name>ID"` ทั้ง 7 ตาราง**: `TCompassUniversity` → `"UniversityID"` ·
>   `TCompassInterestCluster` → `"ClusterID"` · `TCompassFacultyGroup` → `"FacultyGroupID"`
>   (**ชื่อเดิม แต่ชนิดเปลี่ยนจาก `text` เป็น `integer`**) · `TCompassRiasecDimension` →
>   `"DimensionID"` · `TCompassEducationTrack` → `"TrackID"` · `TCompassStudyPlan` →
>   `"StudyPlanID"` (**ชื่อเดิม ชนิดเปลี่ยน**) · `TCompassCareer` → `"CareerID"` (**ชื่อเดิม ชนิดเปลี่ยน**)
> - **code เดิมไม่ถูกลบทิ้งสักตัว** — ยังเป็น `text NOT NULL UNIQUE` ทุกตาราง · ตัวที่ชื่อชนกับ PK ใหม่
>   ถูกเปลี่ยนชื่อเป็น `"FacultyGroupCode"` / `"StudyPlanCode"` / `"CareerCode"` · ที่เหลือคงชื่อเดิม
>   (`"UniversityCode"`, `"ClusterCode"`, `"DimensionCode"`, `"TrackCode"`) **แต่ไม่ใช่ PK อีกต่อไป**
> - **ทุก FK ที่เคยอ้าง code เปลี่ยนไปอ้าง Id (`integer`)** · PK ผสมและ index ที่มี code เป็นส่วนประกอบ
>   เปลี่ยนตามทั้งหมด (เช่น `PRIMARY KEY ("ProgramID", "ClusterID")` ·
>   `"IX_TCompassProgram_Status_UniversityID_CreatedAt"` · `"UX_TCompassRiasecRankOption_BlockID_DimensionID"`)
> - **ตารางที่ PK เป็น serial อยู่แล้วไม่ถูกแตะ**: `ProgramID` · `SourceID` · `QuestID` · `QuestionID` ·
>   `BlockID` · `OptionID` · `ResultID` · `AttemptID` · `TargetID` · `RunID` · `IntakeID`
> - **Migration/backfill: ไม่มี** — ผู้ใช้ยืนยันในไฟล์เดียวกัน (2026-09-15) ว่าฐานข้อมูลถูก `DROP ... CASCADE`
>   แล้วสร้างใหม่ทั้งก้อนเพราะยังไม่มีข้อมูลจริง · **แต่ Compatibility คือ `breaking`** สำหรับโค้ด/ร่าง
>   /seed ใด ๆ ที่เคยเขียน query โดยใช้ code เป็นคีย์ — รอบก่อนหน้าทุกรอบของเอกสารนี้เป็น additive
>   นี่เป็นรอบแรกที่ไม่ใช่
> - **กติกาที่ตามมาและห้ามผ่อน (code ยังเป็นคีย์ของมนุษย์ · Id เป็นคีย์ของฐานข้อมูล)**: ค่าที่ปรากฏใน
>   ไฟล์ seed · prompt/JSON ของ AI · ข้อความบนหน้าจอแอดมิน · เอกสารอ้างอิง ยังเป็น **code** เสมอ
>   (`'KMUTT'`, `'C1'`..`'C11'`, `'FG01'`..`'FG26'`, `'R'`/`'I'`/`'A'`/`'S'`/`'E'`/`'C'`,
>   `'upper_secondary'`, `'SP_UPPER_SCI_MATH'`, `'CR_SWE'`) · **การแปลง code → Id ทำที่ชั้น service
>   ตอน resolve เท่านั้น** (`JOIN ... ON "<Name>Code" = @code` แบบเดียวกับที่ seed ในสคริปต์ทำ) ·
>   **ห้ามส่ง Id ตัวเลขออกไปให้ AI · ห้ามใส่ Id ลงในไฟล์ seed · ห้าม hardcode Id ในโค้ด**
>   เพราะเป็นค่าที่ฐานข้อมูลกำหนดเอง ไม่เสถียรข้ามสภาพแวดล้อม → RISK-F21

> ⚠️ **drift ที่พบระหว่างรอบ v9 แต่ *ไม่ได้* แก้ในรอบนี้ — ต้องให้คนตัดสิน ห้ามให้ engineer เดาเอง**
> 1. **ความกว้างของ integer PK ของตารางที่ "ไม่ถูกแตะ"**: เอกสารนี้ระบุ `bigserial`/`bigint`
>    (`ProgramID`, `SourceID`, `IntakeID`, `QuestID`, `QuestionID`, `BlockID`, `OptionID`, `ResultID`,
>    `RunID`, `AttemptID`, `TargetID`) แต่สคริปต์ bootstrap สร้างจริงเป็น `serial`/`integer` (int4)
>    ทุกตัว — หัวไฟล์ระบุว่ากลุ่มนี้ "ไม่แตะ" แปลว่า**เป็น drift ที่มีมาก่อนรอบนี้** ไม่ใช่ผลของการ
>    เปลี่ยน PK · **`system-analyst` ไม่เลือกข้างให้เอง** เพราะ int4 vs int8 เป็นการตัดสินความจุ/สัญญา
>    ไม่ใช่การสะกดชื่อ → **OQ-F17** · DDL ด้านล่างจึงยังคง `bigserial`/`bigint` ไว้ตามสัญญาเดิม
>    **และตรงนี้คือจุดที่เอกสารกับฐานข้อมูลจริงยังไม่ตรงกัน** — `backend-engineer`/`qa-engineer` ต้องรู้
>    · ✅ **v11 (2026-09-16) ปิดแล้ว** — ผู้ใช้ยืนยันยึด DDL จริง (`serial`/`integer`) · DDL ด้านล่าง
>    ถูกแก้เป็น `serial`/`integer` ครบทุกตารางแล้ว — เอกสารตรงกับฐานจริงสมบูรณ์
> 2. **ที่อยู่ของฐานข้อมูล**: ย่อหน้า **ที่อยู่** ด้านล่างยังระบุ `PGGradeDB` แต่สคริปต์ bootstrap
>    สร้างตารางทั้งหมดในฐานข้อมูล **ใหม่** ชื่อ `SB_Compass` (`prod.config` `PGCompass_*`) โดยหัวไฟล์
>    บันทึกว่า **ผู้ใช้ยืนยันแล้ว 2026-09-14** ~~และตาราง Compass เดิมใน `PGGradeDB` ไม่ย้าย~~
>    *(v12 แก้: `PGGradeDB` ไม่มีตาราง Compass ใดอยู่เลย — ผู้ใช้ยืนยัน 2026-09-16)* ·
>    **รอบนี้ไม่แก้** เพราะอยู่นอกขอบเขตการ reconcile PK ที่ได้รับมอบหมาย และการแก้ต้องไล่ทั้ง
>    `## DES-018` (ownership/grant) · PRE-F03/PRE-F04 · RISK-F10/RISK-F11 · `## DES-024` พร้อมกัน →
>    **เป็นรอบ amend ของตัวเอง ไม่ใช่การแก้คำเดียว** — ดู RISK-F22 · ✅ **v11 (2026-09-16)
>    reconcile แล้ว** — ย่อหน้า **ที่อยู่** + DES-018 + DES-024 + RISK-F10/F11 แก้ครบในรอบเดียวกัน
>    ตามที่ข้อนี้กำหนดไว้ · ความกว้าง PK (ข้อ 1 ด้านบน) ยังเปิดเป็น OQ-F17 ตามเดิม

**วิธีสร้าง**: **migration ของ Curriculum Service เท่านั้น** — **ห้ามรับมรดก pattern
`CREATE TABLE IF NOT EXISTS` ตอน runtime ของ `sb-compass`** · `ClassOnlineWeb` **ห้ามสร้าง
ห้ามแก้โครงตารางกลุ่มนี้เด็ดขาด** ไม่ว่ากรณีใด (`CompassRankingService.EnsureTables` /
`CompassMbtiStore.EnsureTable` เป็น pattern ของตารางเดิม ห้ามขยายมาครอบตารางใหม่)

**ขอบเขตรอบนี้ — สายสามัญ (ม.ปลาย) เท่านั้น**: ทุกตาราง L2/L3 ด้านล่างออกแบบให้ขยายรองรับสายอาชีพ
(ปวช./ปวส./ทหาร/ตำรวจ) ได้ในอนาคตโดยไม่ต้องรื้อ (คอลัมน์ enum-like เป็น `text` ธรรมดา ไม่ใช้
PostgreSQL `ENUM` ชนิดจริง เพื่อเพิ่มค่าใหม่ได้โดยไม่ต้อง `ALTER TYPE`) แต่ **ข้อมูลจริงที่ seed
รอบนี้มีเฉพาะแถว `upper_secondary`** (REQ-015)

```sql
-- ============================================================
--  กลุ่มที่ 1 — คลังหลักสูตร (Curriculum Service เป็นผู้เขียนแต่ผู้เดียว)
-- ============================================================

-- มหาวิทยาลัย — มีตารางแยกเพราะรอบหน้าจะมีหลายแห่ง ปล่อยเป็น free text แล้วจะเพี้ยน
CREATE TABLE IF NOT EXISTS public."TCompassUniversity" (
    "UniversityID"   serial      PRIMARY KEY,          -- **v9** int identity · คีย์ที่ FK ทุกตัวอ้าง
    "UniversityCode" text        NOT NULL UNIQUE,      -- 'KMUTT' · คีย์ที่มนุษย์/seed อ้าง (เดิมเป็น PK)
    "NameTh"         text        NOT NULL,
    "NameEn"         text,
    "IsActive"       boolean     NOT NULL DEFAULT true,
    "CreatedAt"      timestamptz NOT NULL
);

-- REQ-005/011/014 — L1: 11 Interest Cluster (Presentation/filter layer — ไม่ใช่ source of truth
-- ตามที่ education-pathway-taxonomy-design.md ระบุไว้ใน E.1 — แต่ยังต้องมี referential integrity
-- เพื่อให้ validate ผล AI และหน้าจอแอดมินใช้ได้) แทนที่ 8 path เดิมของ CompassPathCatalog ทั้งหมด
-- **ห้ามเพิ่ม/ลบแถวโดยไม่ amend เอกสารนี้ก่อน** — seed จาก education-pathway-taxonomy-design.md ส่วน C
CREATE TABLE IF NOT EXISTS public."TCompassInterestCluster" (
    "ClusterID"      serial      PRIMARY KEY,          -- **v9** int identity
    "ClusterCode"    text        NOT NULL UNIQUE,      -- 'C1'..'C11' (เดิมเป็น PK · ยังเป็นคีย์ของ seed/ผล AI)
    "NameTh"         text        NOT NULL,             -- ชื่อบน UI เช่น "สุขภาพและการรักษาคน"
    "OneLinerTh"     text        NOT NULL,
    "Icon"           text,
    "SortOrder"      integer     NOT NULL,
    "CreatedAt"      timestamptz NOT NULL
);

-- L4 — 26 กลุ่มคณะเดิม (REQ-015 บังคับเก็บไว้ ห้ามลบ) — master ใหม่ของโมดูลนี้
-- (26 กลุ่มเดิมไม่เคยมีตัวตนเป็นตาราง DB มาก่อนในทั้งสอง codebase ที่ตรวจแล้ว — เป็นเนื้อหาจาก
-- education-pathway-taxonomy-design.md ส่วน A.5/D ล้วน ไม่ใช่ของที่ยืนยันจากระบบเดิม)
CREATE TABLE IF NOT EXISTS public."TCompassFacultyGroup" (
    "FacultyGroupID"   serial      PRIMARY KEY,        -- **v9** int identity (เดิมคอลัมน์ชื่อนี้เป็น text code)
    "FacultyGroupCode" text        NOT NULL UNIQUE,    -- เช่น 'FG01'..'FG26' — **v9 เปลี่ยนชื่อมาจาก "FacultyGroupID" เดิม**
    "LegacyNameTh"     text        NOT NULL,
    "CreatedAt"        timestamptz NOT NULL
);

-- cluster ↔ faculty_group (M:N + is_primary) — seed จาก taxonomy ส่วน D ตรง ๆ (26/26 map ครบ)
-- (seed เขียนเป็น INSERT ... SELECT ที่ JOIN ด้วย "ClusterCode"/"FacultyGroupCode" แล้วแปลงเป็น Id —
--  ห้ามใส่เลข Id ลงในไฟล์ seed โดยตรง)
CREATE TABLE IF NOT EXISTS public."TCompassClusterFacultyGroup" (
    "ClusterID"      integer NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),
    "FacultyGroupID" integer NOT NULL REFERENCES public."TCompassFacultyGroup"("FacultyGroupID"),
    "IsPrimary"      boolean NOT NULL,
    PRIMARY KEY ("ClusterID", "FacultyGroupID")
);

-- REQ-012 — 6 มิติ RIASEC มาตรฐาน (แทนที่ compass_behavior_trait 8 แกนที่ระบบออกแบบเองในรอบที่ 1)
-- **ห้ามเพิ่ม/ลบแถวโดยไม่ amend เอกสารนี้ก่อน** — เป็นมาตรฐานภายนอก ไม่ใช่ของที่แก้ได้ตามใจ
CREATE TABLE IF NOT EXISTS public."TCompassRiasecDimension" (
    "DimensionID"   serial      PRIMARY KEY,           -- **v9** int identity
    "DimensionCode" text        NOT NULL UNIQUE,       -- 'R' | 'I' | 'A' | 'S' | 'E' | 'C' (เดิมเป็น PK)
    "NameTh"        text        NOT NULL,               -- เช่น 'Realistic (ลงมือทำ)'
    "Description"   text        NOT NULL,
    "DisplayOrder"  integer     NOT NULL,
    "CreatedAt"     timestamptz NOT NULL
);

-- REQ-001 — เอกสารต้นฉบับ + ข้อความที่แปลงแล้ว (เก็บทั้งคู่เพื่อตรวจย้อนหลังได้)
CREATE TABLE IF NOT EXISTS public."TCompassProgramSource" (
    "SourceID"          serial   PRIMARY KEY,
    "UniversityID"      integer     NOT NULL REFERENCES public."TCompassUniversity"("UniversityID"),  -- **v9** เดิมเป็น "UniversityCode" text
    "OriginalFileUrl"   text        NOT NULL,          -- object storage URL ของ PDF ต้นฉบับ
    "OriginalFileName"  text        NOT NULL,
    "OriginalSha256"    text        NOT NULL,          -- กันนำไฟล์เดิมเข้าซ้ำโดยไม่ตั้งใจ
    "MarkdownText"      text        NOT NULL,          -- ผลจาก markitdown ('' ได้ ถ้า conversion ไม่ ok)
    "MarkdownOrigin"    text        NOT NULL,          -- 'markitdown' | 'markitdown+ocr' | 'manual'
    "ConversionStatus"  text        NOT NULL,          -- 'ok' | 'empty' | 'failed'
    "ConversionNote"    text,                          -- ข้อความ error ตอนแปลงไม่สำเร็จ
    "ImportedBy"        text        NOT NULL,          -- subject จาก SSO ของ Curriculum Service
    "ImportedAt"        timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassProgramSource_UniversityID_ImportedAt"
    ON public."TCompassProgramSource" ("UniversityID", "ImportedAt" DESC);
CREATE UNIQUE INDEX IF NOT EXISTS "UX_TCompassProgramSource_UniversityID_OriginalSha256"
    ON public."TCompassProgramSource" ("UniversityID", "OriginalSha256");

-- REQ-002/003/004 — สาขาที่ AI แกะได้จากเอกสาร "ก่อน" กลายเป็นของจริง
-- ตารางนี้คือคิวตรวจ · มีอยู่เพื่อไม่ให้การ dedup ข้ามมหาวิทยาลัยรวมสาขาเข้าด้วยกันเงียบ ๆ
-- **ลำดับในเอกสารนี้ไม่ใช่ลำดับที่รันได้**: "MatchedProgramID" มี FK ชี้ TCompassProgram ที่นิยามอยู่
-- ถัดไป — migration ต้องสร้าง TCompassProgram ก่อน (สคริปต์ bootstrap จริงสลับลำดับไว้แล้วด้วยเหตุนี้)
-- โครง DDL ของแต่ละตารางไม่เปลี่ยน เปลี่ยนแค่ลำดับการรัน
CREATE TABLE IF NOT EXISTS public."TCompassProgramIntake" (
    "IntakeID"          serial   PRIMARY KEY,
    "SourceID"          integer      NOT NULL REFERENCES public."TCompassProgramSource"("SourceID"),
    "RawProgramName"    text        NOT NULL,          -- ชื่อสาขาตามที่ปรากฏในเอกสาร
    "RawFacultyName"    text        NOT NULL DEFAULT '',
    "DedupKey"          text        NOT NULL,          -- ชื่อที่ normalize แล้ว (ดู ## Import Rules)
    "MatchedProgramID"  integer      REFERENCES public."TCompassProgram"("ProgramID"),  -- สาขาเดิมที่ระบบเดาว่าตรงกัน
    "Resolution"        text        NOT NULL,          -- 'pending' | 'new' | 'replace' | 'discard'
    "AiRawResponse"     text,                          -- คำตอบดิบของ AI (เก็บไว้แม้ validate ไม่ผ่าน)
    "AiError"           text,                          -- เหตุผลที่ validate ไม่ผ่าน / AI ล้มเหลว
    "ResolvedBy"        text,
    "ResolvedAt"        timestamptz,
    "CreatedAt"         timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassProgramIntake_Resolution_CreatedAt"
    ON public."TCompassProgramIntake" ("Resolution", "CreatedAt");

-- REQ-002/003/004/014 — หนึ่งแถว = หนึ่ง "สาขา" ที่มีตัวตนจริงในคลัง (แทนที่แนวคิด L5 major สำหรับรอบนี้)
CREATE TABLE IF NOT EXISTS public."TCompassProgram" (
    "ProgramID"       serial   PRIMARY KEY,
    "UniversityID"    integer     NOT NULL REFERENCES public."TCompassUniversity"("UniversityID"),  -- **v9** เดิมเป็น "UniversityCode" text
    "SourceID"        integer      NOT NULL REFERENCES public."TCompassProgramSource"("SourceID"),
    "FacultyName"     text        NOT NULL DEFAULT '', -- NOT NULL เพราะ NULL ไม่ชนกันใน UNIQUE
    "FacultyGroupID"  integer     REFERENCES public."TCompassFacultyGroup"("FacultyGroupID"),  -- L4 (REQ-014/015) · AI เสนอ + คนแก้ได้ · nullable ระหว่างรอตรวจ · **v9: integer ไม่ใช่ text code แล้ว**
    "ProgramName"     text        NOT NULL,
    "ProgramCode"     text,                            -- รหัสหลักสูตร ถ้ามีในเอกสาร
    "DedupKey"        text        NOT NULL,
    "Status"          text        NOT NULL,            -- 'pending_review' | 'approved' | 'retired'
    "AnalysisStatus"  text        NOT NULL,            -- 'ai_ok' | 'ai_incomplete' | 'manual'
    "BehaviorProfile" text,                            -- ข้อความบรรยาย (REQ-002 ข้อ 2)
    "AiModel"         text,                            -- โมเดลที่ใช้จริง เช่น 'glm-5.2'
    "AiRawResponse"   text,                            -- คำตอบดิบที่ผลิตข้อมูลชุดปัจจุบัน
    "AiAnalyzedAt"    timestamptz,
    "ReviewedBy"      text,                            -- subject จาก SSO · NOT NULL เสมอเมื่อ approved
    "ReviewedAt"      timestamptz,
    "CreatedAt"       timestamptz NOT NULL,
    "UpdatedAt"       timestamptz NOT NULL,
    UNIQUE ("UniversityID", "DedupKey")
);
CREATE INDEX IF NOT EXISTS "IX_TCompassProgram_Status_UniversityID_CreatedAt"
    ON public."TCompassProgram" ("Status", "UniversityID", "CreatedAt");
CREATE INDEX IF NOT EXISTS "IX_TCompassProgram_FacultyGroupID" ON public."TCompassProgram" ("FacultyGroupID");

-- REQ-002 ข้อ 1 — น้ำหนักกลุ่มสาระที่สาขานั้นต้องการ
CREATE TABLE IF NOT EXISTS public."TCompassProgramSubjectWeight" (
    "ProgramID" integer  NOT NULL REFERENCES public."TCompassProgram"("ProgramID") ON DELETE CASCADE,
    "Subject"   text    NOT NULL,                      -- ต้องเป็น 1 ใน 8 ชื่อ canonical เป๊ะ ๆ
    "Weight"    integer NOT NULL,                      -- 3=มาก · 2=ปานกลาง · 1=น้อย (ค่าอื่นห้าม)
    "IsManual"  boolean NOT NULL DEFAULT false,        -- true = คนกรอก/แก้เอง (REQ-004)
    PRIMARY KEY ("ProgramID", "Subject")
);

-- REQ-005/011/014 — สาขา ↔ 11 cluster (many-to-many ตามแนวทางเดิมของ D3 — แทนที่ compass_program_path)
CREATE TABLE IF NOT EXISTS public."TCompassProgramCluster" (
    "ProgramID"  integer  NOT NULL REFERENCES public."TCompassProgram"("ProgramID") ON DELETE CASCADE,
    "ClusterID"  integer NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),  -- **v9** เดิมเป็น "ClusterCode" text
    "AssignedBy" text    NOT NULL,                      -- 'ai' | 'human'
    PRIMARY KEY ("ProgramID", "ClusterID")
);
CREATE INDEX IF NOT EXISTS "IX_TCompassProgramCluster_ClusterID" ON public."TCompassProgramCluster" ("ClusterID");

-- REQ-013 — น้ำหนัก cluster ↔ กลุ่มสาระ (11×8) ใช้คำนวณ academic-fit ของแต่ละ cluster
-- **P-F03 sign-off แล้ว (2026-08-31, OQ-F07 ปิด) — พร้อม seed ค่าที่ร่างจาก taxonomy ได้**
-- ยังคงมาร์กเป็นสมมติฐานไม่มีแหล่งอ้างอิงเชิงตัวเลขภายนอก (RISK-F15) ตาม policy — sign-off ไม่ได้
-- ยกเว้นการติดป้ายนี้ เพียงอนุญาตให้เริ่มใช้งานได้
CREATE TABLE IF NOT EXISTS public."TCompassClusterSubjectWeight" (
    "ClusterID" integer NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),  -- **v9** เดิมเป็น "ClusterCode" text
    "Subject"   text    NOT NULL,                       -- 1 ใน 8 ชื่อ canonical
    "Weight"    integer NOT NULL,                       -- 3=มาก · 2=ปานกลาง · 1=น้อย
    PRIMARY KEY ("ClusterID", "Subject")
);

-- REQ-012/013 — น้ำหนัก cluster ↔ มิติ RIASEC (11×6) ใช้คำนวณ interest-fit ของแต่ละ cluster
-- **P-F03 sign-off แล้ว (2026-08-31, OQ-F07 ปิด) — พร้อม seed ค่าที่ร่างจาก taxonomy ได้ (RISK-F15 ยังติดป้ายไว้)**
CREATE TABLE IF NOT EXISTS public."TCompassClusterRiasecWeight" (
    "ClusterID"   integer NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),   -- **v9** เดิมเป็น code
    "DimensionID" integer NOT NULL REFERENCES public."TCompassRiasecDimension"("DimensionID"), -- **v9** เดิมเป็น code
    "Weight"      integer NOT NULL,                     -- 3=มาก · 2=ปานกลาง · 1=น้อย
    PRIMARY KEY ("ClusterID", "DimensionID")
);

-- REQ-002 ข้อ 2 (ครึ่งที่คำนวณได้) — โปรไฟล์ RIASEC ที่สาขานั้นต้องการ (แทนที่ compass_program_behavior_trait)
CREATE TABLE IF NOT EXISTS public."TCompassProgramRiasecProfile" (
    "ProgramID"    integer  NOT NULL REFERENCES public."TCompassProgram"("ProgramID") ON DELETE CASCADE,
    "DimensionID"  integer NOT NULL REFERENCES public."TCompassRiasecDimension"("DimensionID"),  -- **v9** เดิมเป็น code
    "DesiredLevel" integer NOT NULL,                    -- 1-5 (ค่าอื่นห้าม)
    "IsManual"     boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("ProgramID", "DimensionID")
);

-- REQ-012 — ชุดคำถาม RIASEC กลางชุดเดียว (แทนที่ compass_behavior_question)
-- **เนื้อหาคำถามจริงยังไม่ผ่านตรวจ (UI mockup ที่ requirement.md References อ้างถึง) — ห้าม seed
-- ข้อมูลจริงก่อน uxui-designer ตรวจ**
CREATE TABLE IF NOT EXISTS public."TCompassRiasecQuestion" (
    "QuestionID"    serial   PRIMARY KEY,
    "DisplayOrder"  integer     NOT NULL,
    "Prompt"        text        NOT NULL,
    "DimensionID"   integer     NOT NULL REFERENCES public."TCompassRiasecDimension"("DimensionID"),  -- **v9** เดิมเป็น code
    "ReverseScored" boolean     NOT NULL DEFAULT false,
    "IsActive"      boolean     NOT NULL DEFAULT true,
    "CreatedAt"     timestamptz NOT NULL,
    "UpdatedAt"     timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassRiasecQuestion_IsActive_DisplayOrder"
    ON public."TCompassRiasecQuestion" ("IsActive", "DisplayOrder");

-- REQ-012 (requirement.md รอบที่ 3, 2026-08-31) — คำถาม **แบบเรียงลำดับ** (forced choice)
-- อยู่คู่กับแบบ Likert ด้านบน **ไม่ใช่แทนที่กัน** · หนึ่ง block = หนึ่งชุดตัวเลือกที่ต้องจัดอันดับให้ครบ
-- **เนื้อหาจริงยังไม่ผ่านตรวจเช่นเดียวกับแบบ Likert — ห้าม seed ก่อน uxui-designer ตรวจ**
CREATE TABLE IF NOT EXISTS public."TCompassRiasecRankBlock" (
    "BlockID"      serial   PRIMARY KEY,
    "DisplayOrder" integer     NOT NULL,
    "Prompt"       text        NOT NULL,
    "IsActive"     boolean     NOT NULL DEFAULT true,
    "CreatedAt"    timestamptz NOT NULL,
    "UpdatedAt"    timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassRiasecRankBlock_IsActive_DisplayOrder"
    ON public."TCompassRiasecRankBlock" ("IsActive", "DisplayOrder");

-- ตัวเลือกภายใน block · จำนวนตัวเลือก active ต่อ block ต้องอยู่ระหว่าง 5-7 (บังคับที่ชั้น service
-- ตอน authoring และตอนรับคำตอบ — ดู `## RIASEC Fit Rules` ข้อ 1 · เช็คด้วย CHECK constraint ไม่ได้
-- เพราะเป็นเงื่อนไขข้ามแถว)
-- **ไม่มีคอลัมน์ "ReverseScored" โดยเจตนา** — ห้ามเพิ่ม ดูเหตุผลที่ `## RIASEC Fit Rules` ข้อ 3.3
CREATE TABLE IF NOT EXISTS public."TCompassRiasecRankOption" (
    "OptionID"      serial PRIMARY KEY,
    "BlockID"       integer    NOT NULL REFERENCES public."TCompassRiasecRankBlock"("BlockID") ON DELETE CASCADE,
    "DimensionID"   integer   NOT NULL REFERENCES public."TCompassRiasecDimension"("DimensionID"),  -- **v9** เดิมเป็น code
    "OptionText"    text      NOT NULL,
    "DisplayOrder"  integer   NOT NULL,
    "IsActive"      boolean   NOT NULL DEFAULT true
);
-- หนึ่งมิติปรากฏได้ไม่เกิน 1 ตัวเลือก active ต่อ block — กันไม่ให้มิติเดียวกันแย่งอันดับกันเองใน block เดียว
CREATE UNIQUE INDEX IF NOT EXISTS "UX_TCompassRiasecRankOption_BlockID_DimensionID"
    ON public."TCompassRiasecRankOption" ("BlockID", "DimensionID") WHERE "IsActive";
CREATE INDEX IF NOT EXISTS "IX_TCompassRiasecRankOption_BlockID_DisplayOrder"
    ON public."TCompassRiasecRankOption" ("BlockID", "DisplayOrder");

-- REQ-008 — คลัง quest ระดับมิติ RIASEC (D6 — แทนที่ trait_code ด้วย dimension_code)
CREATE TABLE IF NOT EXISTS public."TCompassQuest" (
    "QuestID"       serial   PRIMARY KEY,
    "DimensionID"   integer     NOT NULL REFERENCES public."TCompassRiasecDimension"("DimensionID"),  -- **v9** เดิมเป็น code
    "ProgramID"     integer      REFERENCES public."TCompassProgram"("ProgramID"),  -- **รอบนี้ต้องเป็น NULL เสมอ**
    "Title"         text        NOT NULL,
    "Description"   text        NOT NULL,
    "Status"        text        NOT NULL,               -- 'pending_review' | 'approved' | 'retired'
    "CreatedBy"     text        NOT NULL,
    "CreatedAt"     timestamptz NOT NULL,
    "UpdatedAt"     timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassQuest_DimensionID_Status" ON public."TCompassQuest" ("DimensionID", "Status");

-- ============================================================
--  กลุ่มที่ 1b — Education Pathway Taxonomy (L2/L3/L3.5/L6) — เฉพาะฝั่งสายสามัญ (REQ-015)
--  schema พร้อมใช้ทันที · เนื้อหาจริง (ชื่อแผนการเรียน/เกณฑ์รับเข้า/อาชีพ) เป็นงานทยอยเติมภายหลัง
--  ไม่บล็อกการ ship Module F/G/H/I-a/I-b (เหมือน OQ-F01) — ดู DES-015 และ Feature-by-Feature
-- ============================================================

-- L2 — ประเภทเส้นทางการศึกษา (enum-like master, text ธรรมดาเพื่อขยายได้โดยไม่ ALTER TYPE)
-- รอบนี้ seed แค่ 1 แถว: 'upper_secondary' — ค่าอื่น (vocational_certificate ฯลฯ) เป็นเฟสถัดไป
CREATE TABLE IF NOT EXISTS public."TCompassEducationTrack" (
    "TrackID"   serial      PRIMARY KEY,   -- **v9** int identity
    "TrackCode" text        NOT NULL UNIQUE,   -- 'upper_secondary' (รอบนี้มีแถวเดียว · เดิมเป็น PK)
    "NameTh"    text        NOT NULL,
    "IsActive"  boolean     NOT NULL DEFAULT true,
    "CreatedAt" timestamptz NOT NULL
);

-- L3 — แผนการเรียน ม.ปลาย (canonical) + alias เพราะโรงเรียนตั้งชื่อเองไม่ตรงกัน (taxonomy H.8)
CREATE TABLE IF NOT EXISTS public."TCompassStudyPlan" (
    "StudyPlanID"   serial      PRIMARY KEY,           -- **v9** int identity (เดิมคอลัมน์ชื่อนี้เป็น text code)
    "StudyPlanCode" text        NOT NULL UNIQUE,       -- เช่น 'SP_UPPER_SCI_MATH' — **v9 เปลี่ยนชื่อมาจาก "StudyPlanID" เดิม**
    "TrackID"       integer     NOT NULL REFERENCES public."TCompassEducationTrack"("TrackID"),  -- **v9** เดิมเป็น "TrackCode" text
    "NameTh"        text        NOT NULL,               -- เช่น 'วิทย์-คณิต'
    "NotesTh"       text,
    "CreatedAt"     timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS public."TCompassStudyPlanAlias" (
    "StudyPlanID" integer NOT NULL REFERENCES public."TCompassStudyPlan"("StudyPlanID") ON DELETE CASCADE,
    "AliasNameTh" text    NOT NULL,
    PRIMARY KEY ("StudyPlanID", "AliasNameTh")
);

-- cluster ↔ study_plan (M:N + strength ตาม taxonomy E.3)
CREATE TABLE IF NOT EXISTS public."TCompassClusterStudyPlan" (
    "ClusterID"      integer NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),  -- **v9** เดิมเป็น code
    "StudyPlanID"    integer NOT NULL REFERENCES public."TCompassStudyPlan"("StudyPlanID"),      -- **v9** integer ไม่ใช่ text code
    "Strength"       text NOT NULL,   -- 'highly_related'|'related'|'possible'|'depends_on_admission'|'not_eligible_typical'
    "ReasonTh"       text,
    "SourceRef"      text,
    "LastVerifiedAt" timestamptz,
    PRIMARY KEY ("ClusterID", "StudyPlanID")
);

-- study_plan ↔ subject (M:N) — วิชาที่สายนั้นสอน (taxonomy E.2: ตัวเชื่อมจริงคือ "วิชา" ไม่ใช่ชื่อสาย)
CREATE TABLE IF NOT EXISTS public."TCompassStudyPlanSubject" (
    "StudyPlanID" integer NOT NULL REFERENCES public."TCompassStudyPlan"("StudyPlanID") ON DELETE CASCADE,
    "Subject"     text    NOT NULL,   -- 1 ใน 8 ชื่อ canonical
    PRIMARY KEY ("StudyPlanID", "Subject")
);

-- study_plan ↔ faculty_group (M:N + strength) — **ควร derive จาก subject_requirement เมื่อมีข้อมูลพอ**
CREATE TABLE IF NOT EXISTS public."TCompassStudyPlanFacultyGroup" (
    "StudyPlanID"          integer NOT NULL REFERENCES public."TCompassStudyPlan"("StudyPlanID"),        -- **v9** integer
    "FacultyGroupID"       integer NOT NULL REFERENCES public."TCompassFacultyGroup"("FacultyGroupID"),  -- **v9** integer
    "Strength"             text NOT NULL,
    "ReasonTh"             text,
    "DerivedFromSubjects"  boolean NOT NULL DEFAULT false,
    "SourceRef"            text,
    "LastVerifiedAt"       timestamptz,
    PRIMARY KEY ("StudyPlanID", "FacultyGroupID")
);

-- L3.5 — เกณฑ์วิชาที่สาขา (TCompassProgram) ต้องการ (taxonomy E.2 — "สำคัญที่สุดและมักถูกลืม")
CREATE TABLE IF NOT EXISTS public."TCompassProgramSubjectRequirement" (
    "ProgramID"  integer  NOT NULL REFERENCES public."TCompassProgram"("ProgramID") ON DELETE CASCADE,
    "Subject"    text    NOT NULL,           -- 1 ใน 8 ชื่อ canonical
    "MinScore"   numeric,                    -- เกณฑ์คะแนนขั้นต่ำ ถ้าระบุในเอกสาร
    "MinCredit"  numeric,                    -- เกณฑ์หน่วยกิตขั้นต่ำ ถ้าระบุในเอกสาร
    "IsRequired" boolean NOT NULL DEFAULT true,
    "SourceRef"  text,
    PRIMARY KEY ("ProgramID", "Subject")
);

-- L6 — อาชีพ (master) + สาขา↔อาชีพ (M:N + strength)
-- **AI ต้องเพิ่ม output ก้อนใหม่ (รายการอาชีพที่เกี่ยวข้อง) เพื่อ populate ตารางนี้ — เป็นส่วนขยายของ
-- REQ-002 ที่ system-analyst เสนอ ยังไม่เคยถูกถามในสัมภาษณ์ — ต้องยืนยันก่อน implement (ดู OQ-F07)**
CREATE TABLE IF NOT EXISTS public."TCompassCareer" (
    "CareerID"         serial      PRIMARY KEY,   -- **v9** int identity (เดิมคอลัมน์ชื่อนี้เป็น text code)
    "CareerCode"       text        NOT NULL UNIQUE,   -- เช่น 'CR_SWE' — **v9 เปลี่ยนชื่อมาจาก "CareerID" เดิม**
    "NameTh"           text        NOT NULL,
    "LicenseRequired"  boolean NOT NULL DEFAULT false,
    "CreatedAt"        timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS public."TCompassProgramCareer" (
    "ProgramID" integer  NOT NULL REFERENCES public."TCompassProgram"("ProgramID") ON DELETE CASCADE,
    "CareerID"  integer NOT NULL REFERENCES public."TCompassCareer"("CareerID"),   -- **v9** integer ไม่ใช่ text code
    "Strength"  text   NOT NULL,   -- ตาม taxonomy E.3 5 ระดับ
    "IsManual"  boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("ProgramID", "CareerID")
);

-- ============================================================
--  กลุ่มที่ 2 — ผลของนักเรียน (ClassOnlineWeb เป็นผู้เขียนแต่ผู้เดียว)
-- ============================================================

-- REQ-012 — ทำซ้ำได้หลายรอบ จึง "เก็บประวัติ" ไม่ upsert ทับ (แทนที่ compass_behavior_result)
-- (ตั้งใจให้ต่างจาก public."TCompassMbtiResult" ของเดิมที่ทับโดยเจตนา — REQ-007/REQ-012 บังคับให้ทำซ้ำได้)
CREATE TABLE IF NOT EXISTS public."TCompassRiasecResult" (
    "ResultID"     serial   PRIMARY KEY,
    "SchoolID"     integer     NOT NULL,
    "SID"          integer     NOT NULL,
    "ProgramID"    integer      REFERENCES public."TCompassProgram"("ProgramID"),  -- NULL = โหมดดูโปรไฟล์เฉย ๆ
    "Answers"      text        NOT NULL,                -- Likert: "<question_id>:<1-5>" คั่นด้วย comma
                                                        -- **v6: เป็นสตริงว่างได้** (ตอบเฉพาะแบบเรียงลำดับ)
    "RankAnswers"  text,                                -- **ใหม่ v6** แบบเรียงลำดับ: "<option_id>:<rank>"
                                                        -- คั่นด้วย comma · NULL = ไม่ได้ตอบส่วนเรียงลำดับเลย
                                                        -- **ห้ามว่างทั้งคู่** (`"Answers" = ''` และ
                                                        -- `"RankAnswers" IS NULL`) — บังคับที่ชั้น service
    "AnsweredCount"   integer NOT NULL,                 -- **ใหม่ v6** จำนวน "ข้อที่ตอบแล้ว" ณ เวลาส่ง
                                                        -- (Likert 1 ข้อ = 1 · block เรียงลำดับที่ตอบครบ = 1)
    "ActiveItemCount" integer NOT NULL,                 -- **ใหม่ v6** จำนวนข้อ active ทั้งหมด ณ เวลาส่ง
                                                        -- **ทั้งคู่บันทึกตอนส่งเท่านั้น ห้ามคำนวณย้อนหลัง
                                                        -- จากคลังคำถามปัจจุบัน** (`## RIASEC Fit Rules` ข้อ 7)
                                                        -- นิยาม + การใช้: `## Cluster Determination Rules` ข้อ 7.1
                                                        -- **v8 (2026-09-02): ไม่ใช่ input ของ Confidence
                                                        -- อีกต่อไป (re-scope OQ-F13) — เก็บไว้เป็น
                                                        -- diagnostic เท่านั้น ค่าเท่ากันเสมอเพราะบังคับ
                                                        -- ตอบครบ 100% จึงจะส่งได้ (OQ-F11 ข้อ (ง) ปฏิเสธ)
    "ConsistencyScore" numeric,                         -- **ใหม่ v8 (2026-09-02, re-scope OQ-F13)**
                                                        -- ความสอดคล้อง Likert vs ranking รายมิติ ∈ [0,1]
                                                        -- NULL = ประเมินไม่ได้ (R=0, ดูนิยามที่
                                                        -- `## Cluster Determination Rules` ข้อ 7.2)
                                                        -- บันทึกตอนส่งเท่านั้น ห้ามคำนวณย้อนหลัง (เหตุผล
                                                        -- เดียวกับ AnsweredCount/ActiveItemCount ด้านบน)
                                                        -- เป็น input ของ ConfidenceFactor แทน AnswerCoverage
    "MatchPercent" integer,                             -- NULL เมื่อ ProgramID เป็น NULL
    "Advice"       text,
    "CreatedAt"    timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassRiasecResult_SchoolID_SID_CreatedAt"
    ON public."TCompassRiasecResult" ("SchoolID", "SID", "CreatedAt" DESC);

-- REQ-013 — ผลคำนวณ T-Score + คะแนนรวมต่อ cluster ล่าสุดของนักเรียน (คำนวณสด ไม่ upsert
-- เพื่อไม่ให้ conflict กับ TCompassRiasecResult ที่ทำซ้ำได้หลายรอบ — ดู `## Cluster Determination Rules`)
-- **สูตรและ dependency ยืนยันแล้ว (2026-08-31, OQ-F03/OQ-F06/OQ-F07 ปิด) — implement ได้
-- ยกเว้นต้องรอ DEP-F09 (`"StddevScore"`: `sb-compass REQ-017` ลง requirement แล้ว แต่คอลัมน์จริง
-- ยังไม่มีในฐานข้อมูล — ไม่ต้อง migration ตาม `sb-compass/design.md` v8)**
-- **ใหม่ v6 (2026-08-31)** — หัวรอบของการคำนวณ cluster หนึ่งครั้ง
-- เหตุผลที่ต้องมีตารางหัวรอบ: `ClarityIndex` และค่าประกอบของมันเป็นสมบัติของ **ชุดคะแนนทั้ง 11 cluster
-- ในรอบเดียวกัน** ไม่ใช่ของ cluster ใด cluster หนึ่ง — ถ้าเก็บซ้ำ 11 แถวจะเกิดสองความจริงได้ทันที
-- และขัดกับ `## Cluster Determination Rules` ข้อ 2 กติกา 4 (ฐานการคำนวณต้องเหมือนกันทั้ง 11 cluster)
CREATE TABLE IF NOT EXISTS public."TCompassStudentClusterRun" (
    "RunID"            serial   PRIMARY KEY,
    "SchoolID"         integer     NOT NULL,
    "SID"              integer     NOT NULL,
    "RiasecResultID"   integer      REFERENCES public."TCompassRiasecResult"("ResultID"),  -- NULL = ยังไม่ทำ RIASEC
    "ScoreBasis"       text        NOT NULL,   -- 'combined' | 'academic_only' | 'interest_only'
    "ClusterCount"     integer     NOT NULL,   -- n ของ `## Cluster Determination Rules` ข้อ 6.2
    "MeanOwn"          numeric,                -- ค่าเฉลี่ยของชุดคะแนนในรอบนี้ (ค่าอ้างอิงของตัวนักเรียนเอง)
    "SdOwn"            numeric,
    "GapTop"           numeric,
    "ClarityIndex"     numeric,                -- 0-100 · NULL = ประเมินความชัดเจนไม่ได้ (n < 3)
    "ClarityBand"      text,                   -- 'clear' | 'moderate' | 'unclear' · NULL คู่กับ ClarityIndex
    "ExcludedSubjects" text,                   -- กลุ่มสาระที่ถูกตัดตามข้อ 2 (คั่นด้วย comma) — ไว้วินิจฉัย ไม่ใช่ค่าที่แสดง
    "CreatedAt"        timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassStudentClusterRun_SchoolID_SID_CreatedAt"
    ON public."TCompassStudentClusterRun" ("SchoolID", "SID", "CreatedAt" DESC);

CREATE TABLE IF NOT EXISTS public."TCompassStudentClusterScore" (
    "ResultID"       serial   PRIMARY KEY,
    "RunID"          integer      NOT NULL REFERENCES public."TCompassStudentClusterRun"("RunID") ON DELETE CASCADE,
    "SchoolID"       integer     NOT NULL,
    "SID"            integer     NOT NULL,
    "ClusterID"      integer     NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),  -- **v9** เดิมเป็น "ClusterCode" text
    "AcademicFit"    numeric,                -- 0-100 จาก T-Score ถ่วงน้ำหนัก · **v6: NULL ได้** เมื่อกลุ่มสาระ
                                             -- ถูกตัดหมดตามข้อ 2 กติกา 3 (v5 เขียน NOT NULL ไว้ ซึ่งขัดกับกติกานั้น)
    "InterestFit"    numeric,                -- 0-100 จาก RIASEC ถ่วงน้ำหนัก · NULL ถ้ายังไม่ทำ RIASEC
    "CombinedScore"  numeric,                -- NULL ถ้าฝั่งใดฝั่งหนึ่งเป็น NULL (ยังรวมไม่ได้)
                                             -- **ค่าดิบเสมอ ห้ามเขียนทับด้วยค่าที่ผ่าน shrinkage/clarity แล้ว**
                                             -- (`## Cluster Determination Rules` ข้อ 7)
    "DisplayScore"   numeric,                -- **ใหม่ v6** ค่าที่แสดงต่อนักเรียนหลังผ่านชั้นปรับร่วม
                                             -- (clarity × confidence) ของ `## Cluster Determination Rules`
                                             -- ข้อ 7.5 (เดิมข้อ 7.4) · **ห้ามใช้จัดอันดับ** (อันดับใช้
                                             -- `"CombinedScore"` เสมอ) · **v8: OQ-F12 ปิดแล้ว (ClarityFactor
                                             -- ใช้ได้เต็มแล้ว) — ยังเหลือ NULL จนกว่า OQ-F16 จะปิด**
                                             -- (threshold ของ ConsistencyScore, เดิมรอ OQ-F13 ซึ่ง
                                             -- ปิดแบบ re-scope ไปแล้ว) — RISK-F19
    "CreatedAt"      timestamptz NOT NULL
    -- **v6: `"RiasecResultID"` ย้ายไปอยู่ที่ตารางหัวรอบ** — เดิมอยู่ที่นี่ ทำให้ 11 แถวเก็บค่าเดียวกันซ้ำ
);
CREATE INDEX IF NOT EXISTS "IX_TCompassStudentClusterScore_SchoolID_SID_CreatedAt"
    ON public."TCompassStudentClusterScore" ("SchoolID", "SID", "CreatedAt" DESC);
CREATE INDEX IF NOT EXISTS "IX_TCompassStudentClusterScore_RunID"
    ON public."TCompassStudentClusterScore" ("RunID");

-- REQ-008 — เด็กลองทำ quest จริง (FK ชี้ TCompassRiasecResult แทน compass_behavior_result)
CREATE TABLE IF NOT EXISTS public."TCompassQuestAttempt" (
    "AttemptID"  serial   PRIMARY KEY,
    "SchoolID"   integer     NOT NULL,
    "SID"        integer     NOT NULL,
    "QuestID"    integer      NOT NULL REFERENCES public."TCompassQuest"("QuestID"),
    "ResultID"   integer      REFERENCES public."TCompassRiasecResult"("ResultID"),  -- รอบทดสอบที่ทำให้เสนอ quest นี้
    "Status"     text        NOT NULL,                   -- 'suggested' | 'accepted' | 'done'
    "Reflection" text,                                   -- "ลองแล้วเป็นยังไง" — เด็กกรอกเอง
    "CreatedAt"  timestamptz NOT NULL,
    "UpdatedAt"  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassQuestAttempt_SchoolID_SID_CreatedAt" ON public."TCompassQuestAttempt" ("SchoolID", "SID", "CreatedAt" DESC);

-- REQ-017 (ใหม่ v7, 2026-09-02) — "ตั้งเป็นเป้าหมาย" (target major) · append-only เหมือน
-- TCompassRiasecResult/TCompassQuestAttempt (ไม่ UPDATE ทับ) — แต่ละแถวคือ 1 การกระทำ ('active' ตอน
-- ตั้ง · 'superseded' ตอนถูกแทนที่) ไม่ใช่สถานะปัจจุบันที่ query แล้วได้ตรง ๆ
-- ดูตรรกะเต็มที่ `## Target Major Rules`
CREATE TABLE IF NOT EXISTS public."TCompassTargetProgram" (
    "TargetID"       serial   PRIMARY KEY,
    "SchoolID"       integer     NOT NULL,
    "SID"            integer     NOT NULL,
    "ProgramID"      integer      NOT NULL REFERENCES public."TCompassProgram"("ProgramID"),
    "RiasecResultID" integer      NOT NULL REFERENCES public."TCompassRiasecResult"("ResultID"),
                                             -- รอบทดสอบ REQ-007 ของสาขานี้ที่ผ่าน gate ตอนกดตั้งเป้าหมาย
                                             -- (snapshot เพื่อ audit — "ผ่าน gate ด้วยอะไร" ไม่ใช่ตัวกำหนด gate เอง)
    "Status"         text        NOT NULL,   -- 'active' | 'superseded' — ดูข้อ 3 ของ `## Target Major Rules`
    "SetAt"          timestamptz NOT NULL,
    "SupersededAt"   timestamptz             -- NULL ขณะยังเป็น 'active'
);
CREATE INDEX IF NOT EXISTS "IX_TCompassTargetProgram_SchoolID_SID_ProgramID_SetAt"
    ON public."TCompassTargetProgram" ("SchoolID", "SID", "ProgramID", "SetAt" DESC);
-- OQ-F14 ปิด 2026-09-15: นักเรียน 1 คนมีเป้าหมาย active ได้สูงสุด 1 รายการ (AC-017.4)
CREATE UNIQUE INDEX IF NOT EXISTS "UX_TCompassTargetProgram_Active_Student"
    ON public."TCompassTargetProgram" ("SchoolID", "SID")
    WHERE "Status" = 'active';
```

### ข้อมูลตั้งต้นที่ migration ต้อง seed

> **v9 (2026-09-15) — กติกาการเขียน seed หลังเปลี่ยน PK เป็น int identity**: ทุกตาราง master ด้านล่าง
> **ห้ามระบุค่า PK เอง** (เป็น `serial` ฐานข้อมูลออกให้) · ทุก seed ที่เป็นตารางเชื่อม
> (`TCompassClusterFacultyGroup`, `TCompassClusterStudyPlan`, `TCompassStudyPlanFacultyGroup`,
> `TCompassClusterSubjectWeight`, `TCompassClusterRiasecWeight`, ...) ต้องเขียนเป็น
> `INSERT ... SELECT ... JOIN` ที่แปลง **code → Id** ตอนรัน (เช่น
> `JOIN public."TCompassInterestCluster" c ON c."ClusterCode" = v.cluster_code`) — ตรงกับที่สคริปต์
> bootstrap จริงทำอยู่ · `ON CONFLICT` ของตาราง master ใช้คอลัมน์ **code** (`"ClusterCode"`,
> `"FacultyGroupCode"`, `"DimensionCode"`, `"TrackCode"`, `"UniversityCode"`, ...) ไม่ใช่ Id

- **`public."TCompassInterestCluster"`** — 11 แถว (C1-C11) ตาม `education-pathway-taxonomy-design.md` ส่วน C ตรง ๆ
- **`public."TCompassFacultyGroup"`** — 26 แถว ตามส่วน A.5/D ของเอกสารเดียวกัน
- **`public."TCompassClusterFacultyGroup"`** — mapping ตามตาราง Section D ของเอกสารเดียวกัน (26/26 ครบ ตามที่เอกสารยืนยัน Validation ไว้แล้ว)
- **`public."TCompassRiasecDimension"`** — 6 แถวคงที่: `R` (Realistic) · `I` (Investigative) · `A` (Artistic) ·
  `S` (Social) · `E` (Enterprising) · `C` (Conventional) — เป็นมาตรฐาน Holland Code ทั่วไป ไม่ใช่ของที่ระบบคิดเอง
- **`public."TCompassEducationTrack"`** — 1 แถว: `upper_secondary`
- **`public."TCompassClusterSubjectWeight"` (11×8), `public."TCompassClusterRiasecWeight"` (11×6)** — **sign-off
  แล้ว (2026-08-31, OQ-F07 ปิด) — seed ค่าที่ร่างจาก `education-pathway-taxonomy-design.md` ส่วน C
  ได้ทันที** (ยังมาร์กเป็นสมมติฐานไม่มีแหล่งอ้างอิงภายนอกต่อ ตาม RISK-F15) ·
  🔴 **v11 (2026-09-16): แต่ "ค่าที่ร่างไว้" ไม่เคยถูกบันทึกลงไฟล์ใดเลย** — เอกสารนี้เขียนไว้แค่
  ตัวอย่างราย cluster, เอกสาร taxonomy ไม่มีตารางตัวเลข 3/2/1 (ตรวจไฟล์จริงแล้ว), และสคริปต์ bootstrap
  **ปฏิเสธเดาค่าเองโดยเจตนา** (บรรทัด 579-585) → สองตารางนี้จึงยังว่าง · ค่าฉบับที่ยืนยันแล้ว
  (engineering default ตามการมอบสิทธิ์ — OQ-F18 ปิด 2026-09-16) อยู่ที่ `## DES-022` §4a —
  **INSERT seed ได้แล้ว**
- **`public."TCompassRiasecQuestion"`, `public."TCompassRiasecRankBlock"`, `public."TCompassRiasecRankOption"`**
  — **ห้าม seed ในรอบ migration** เป็นเนื้อหาที่ต้องผ่าน `uxui-designer` ก่อนทั้งสองรูปแบบ
  (`## RIASEC Fit Rules` ข้อ 0) · ระบบต้องทำงานได้ปกติเมื่อตารางเหล่านี้ยังว่าง (ไม่มีมิติใดมีค่า
  → `InterestFit` เป็น `NULL` ทุก cluster ตามข้อ 3 ไม่ใช่ error)
- **`public."TCompassStudyPlan"*`, `public."TCompassProgramSubjectRequirement"`, `public."TCompassCareer"`,
  `public."TCompassProgramCareer"`** — **ยังไม่ seed** จนกว่าจะมีคนไปหาเนื้อหาจริงมา (ตารางเนื้อหา
  L2/L3/L3.5/L6 — ไม่บล็อกรอบนี้ตาม DES-015 เพราะไม่มีตัวไหนที่ Module F/G/H/I-a/I-b ต้องใช้)

> **สถานะของการเปลี่ยนแปลงรอบ v9 (2026-09-15) — บันทึกไว้เป็นร้อยแก้วโดยเจตนา ไม่ใช่ claim block**
> `## Data Model` เป็นหัวข้อมาตรฐานของ schema เอกสาร **ไม่ใช่ contract section ที่มี `DES-NNN`** จึง
> **ไม่ผูก `Contract:`/`DEC-`/`Evidence` เข้ากับหัวข้อนี้** ตามแบบแผนเดียวกับทุกโมดูล — หมวดสัญญาที่ต้อง
> ใช้บริบทของ Data Model อ้างถึงมันเป็นร้อยแก้วแทน (`## DES-018` เป็นเจ้าของกติกาความเป็นเจ้าของ/DDL)
> - **Compatibility: breaking** — ร่าง/โค้ด/seed ใด ๆ ที่เคยใช้ text code เป็นคีย์ต้องถูกแก้ ไม่ใช่รันคู่ขนาน
> - **Migration/backfill: none** — ผู้ใช้ยืนยัน 2026-09-15 ในไฟล์ DDL เองว่าฐานข้อมูลถูก `DROP ... CASCADE`
>   แล้วสร้างใหม่ทั้งก้อนเพราะยังไม่มีข้อมูลจริง (ทุก phase `implemented ⬜` ตาม `status.md`) —
>   **ห้ามตีความว่า "ไม่มี migration" แปลว่า "ไม่ breaking"**
> - **Security: none** — การเปลี่ยน PK ไม่แตะเส้นแบ่งข้อมูลนักเรียน/AI ของ `## DES-018` และไม่เปลี่ยน grant ของใคร
> - **Fallback** — code ที่ resolve เป็น Id ไม่ได้ (cluster/dimension/faculty group/study plan/career/
>   university) → validate ไม่ผ่าน เก็บ `ai_raw_response` ตั้ง `analysis_status = 'ai_incomplete'`
>   ให้คนกรอกต่อ ตาม `## DES-019` ข้อ 5 — **ห้ามสร้างแถว master ใหม่อัตโนมัติ ห้ามเขียน Id ที่เดาเอง
>   ห้าม error ถึงมือเด็ก**
> - **Material ambiguity: none** *(อัปเดต v11 2026-09-16 — ปิดครบทั้งสองจุด)*: ที่อยู่ฐานข้อมูล
>   `PGGradeDB` vs `SB_Compass` reconcile แล้ว (RISK-F22 ปิด) · ความกว้าง PK ปิดแล้วโดยผู้ใช้ยืนยัน
>   ยึด DDL จริง (`serial`/`integer`) — DDL ด้านล่างแก้ตรงกันทุกตัว (OQ-F17 ปิด)
> - **หลักฐานของรอบนี้** — `ClassOnlineWeb/DatabaseScripts/Compass/bootstrap-sb-compass-db.sql`
>   (หัวไฟล์บรรทัด 20 บันทึกการเปลี่ยน PK + คำยืนยันของผู้ใช้ · DDL ตาราง master เริ่มบรรทัด 76 ·
>   seed แบบ code → Id JOIN บรรทัด 542) — **อ่านไฟล์จริงในเซสชันที่ไม่มี shell** จึงยืนยัน
>   path/บรรทัด/เนื้อหาได้ แต่คำนวณ `revision`/`hash` ไม่ได้ · งานที่ต้องใช้สัญญาแบบอ้างอิงได้ให้ผูกกับ
>   **`DES-018` / `DEC-018` / `Contract:DatabaseOwnershipBoundary.v1`** ซึ่งเป็นเจ้าของกติกา DDL อยู่แล้ว

---


## Change Log

- 2026-10-07 — Migrated to split layout

Back-links: `design\index.md` · `..\index.md`
