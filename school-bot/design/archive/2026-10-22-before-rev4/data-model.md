# Logical data contract — Rev3

อ้าง REQ-011, 027–029, 033–039 ชุดนี้ไม่มี SQL และไม่กำหนดชื่อ database/schema ทางกายภาพ

## ชนิดและกฎร่วมที่เสนอ

`K` = PostgreSQL int4, 1–2147483647; `U` = UUID ที่ไม่ใช่ table key; `N` = integer ≥1; `B` = boolean; `Tn` = Unicode string ยาวไม่เกิน n; `D` = UTC instant; `H` = SHA-256 hex 64 ตัว; `?` = nullable; `[]` = array; ค่าอื่น non-null ไม่มี implicit default

`I` = signed int32; `S` = SchoolId:I (JSON integer); ชนิดยืนยันจาก source ส่วน physical DB/FK รอ DBA ดู [review](../source-review-002.md)

`P={school_id:S,kind:student|employee,profile_id:I}`; student → TUser(SchoolId,SId), employee → TEmployees(SchoolId,SEmp). AccountId:I → TMasterDBUser.sID แยกจาก P; ห้ามเดา link

`A` = string ≤512: `account:<S>:<AccountId>:none` ก่อนเลือก P หรือ `account:<S>:<AccountId>:<kind>:<profile_id>` หลังเลือก, `device:<H>`, `service:<name>`; integer canonical decimal; name `[A-Za-z0-9._-]{1,128}` จาก server เท่านั้น

**ทุกตาราง** ด้านล่างมี common columns จริง:

| Column | ชนิด/กฎ |
|---|---|
| IsDelete | B; เริ่ม false; soft delete โดย authorized operation |
| CreateBy | A; server กำหนด |
| CreateDate | D; server UTC |
| UpdateBy | A; เริ่มเท่ากับ CreateBy |
| UpdateDate | D; เริ่มเท่ากับ CreateDate |
| SchoolId | S; non-null ยกเว้น global rows ที่ระบุชัดด้านล่าง |
| Version | N; เริ่ม 1; เพิ่มเมื่อแก้ row ใช้ optimistic concurrency |

ทุกตาราง SchoolBot มี PK `SchoolBot<Entity>Id:K` ที่ server จัดสรร; FK/current pointer ที่ชี้ PK ใช้ K และตรวจ `(SchoolId,XId)`; legacy refs:I ไม่ใช่ SchoolBotUser FK

K เป็น JSON integer; create ไม่รับ PK จาก client และคืน K หลัง commit เท่านั้น ห้าม wrap/reuse เมื่อเต็ม; generation ทางกายภาพให้ DBA ออกแบบตาม decisions-012. `CurrentRevision`, `Revision`, `Version`, `Sequence`, `BindingEpoch` เป็น N ไม่ใช่ row ID.

Default reads ตัด IsDelete=true; unique keys ที่ระบุไม่ถูกคืนให้ใช้ใหม่เมื่อ soft delete เว้นแต่ระบุ “live” ห้าม cascade hard delete ผลเรียน/ประวัติ Immutable rows ไม่แก้ business fields หลังสร้าง

## ตารางครบทุก field นอก common columns/PK

| ตาราง | Fields |
|---|---|
| **SchoolBotLicense** | SchoolName:T200, KeyHash:H, KeyHint:T32, ExpiresAt:D, RevokedAt:D?, CurrentBindingId:K?, BindingEpoch:N, AllowedNextJkt:H? |
| SchoolBotLicenseBinding | LicenseId:K, DeviceJkt:H, PublicJwk:Jwk, Epoch:N, ActivatedAt:D, DetachedAt:D?, LastCheckedAt:D, LastEntitlementExpiresAt:D |
| SchoolBotSession | AccountId:I, TokenHash:H, ProfileKind:(student\|employee)?, ProfileId:I?, DeviceJkt:H, ExpiresAt:D, RevokedAt:D? |
| SchoolBotTeacherGrant | TeacherId:I, LearnerId:I, Mode:Mode, CanView:B, CanAssess:B, ValidFrom:D, ValidUntil:D? |
| SchoolBotProject | OwnerKind:student\|employee, OwnerId:I, Mode:Mode, Name:T200, CurrentRevision:N |
| SchoolBotProjectRevision | ProjectId:K, Revision:N, Content:ProjectContent, ContentHash:H |
| SchoolBotCurriculum | CurriculumKey:U, Revision:N, Mode:Mode, Title:Text, SourceRef:T2048, Lifecycle:ContentState, PublishedAt:D? |
| SchoolBotLesson | CurriculumId:K, LessonKey:U, Ordinal:N, Title:Text, Objective:Text, Instructions:Text |
| SchoolBotMission | LessonId:K, MissionKey:U, Ordinal:N, Title:Text, Instructions:Text, Method:AssessmentMethod |
| SchoolBotCriteria | MissionId:K, Revision:N, Rules:CriteriaRules, SourceRef:T2048, ApprovedBy:A?, ApprovedAt:D? |
| SchoolBotSubmission | LearnerId:I, MissionId:K, CriteriaId:K, ProjectRevisionId:K, SubmittedAt:D, State:SubmissionState, CurrentAssessmentId:K?, Evidence:ArmEvidence? |
| SchoolBotGradingJob | SubmissionId:K, State:JobState, Attempts:integer≥0, LeaseOwner:T128?, LeaseUntil:D?, NextAttemptAt:D, LastErrorCode:T64? |
| SchoolBotAssessment | SubmissionId:K, Sequence:N, Method:AssessmentMethod, Outcome:Outcome, RuleResults:RuleResult[], Feedback:T4000, GraderVersion:T128?, AssessorId:I?, SupersedesId:K?→Assessment |
| SchoolBotRelease | VersionText:T32, Channel:Channel, Platform:Platform, Manifest:T16384, ArtifactHash:H, Lifecycle:ReleaseState, PublishedAt:D?, WithdrawnAt:D? |
| SchoolBotIdempotency | Principal:A, Operation:T200, RequestKey:U, RequestHash:H, NonceHash:H?, HttpStatus:integer100–599, ResultCipher:bytes?, ResultKeyId:T128?, ResourceId:K?, CompletedAt:D, ReplayUntil:D |
| SchoolBotAuditEvent | Actor:A, Event:T64, EntityType:T64, EntityId:K, PreviousVersion:integer≥0, NewVersion:N, RequestId:U, Reason:T1000 |

`SchoolBotRelease.SchoolId` เสนอให้ null สำหรับ catalog กลาง; `SchoolBotIdempotency` และ `SchoolBotAuditEvent` null ได้เฉพาะ operation กลางนั้น ทุก row ยังมีคอลัมน์ครบ ไม่ใช้ SchoolId ปลอมหรือศูนย์ ข้อยกเว้น null นี้รอมนุษย์/DBA อนุมัติ

ResourceId:K? ชี้ resource หลักที่ endpoint คืนตาม Operation; EntityType=ชื่อตารางที่ EntityId:K อ้าง. Web ตรวจชนิด/SchoolId เพราะไม่ใช่ FK เดี่ยวข้ามตาราง. Local UUID/receipts ไม่เป็น DBPK; ไม่เพิ่ม ClientId/public UUID

## Enums และ embedded types

- `Mode=block|arm|code`
- `Role=student|teacher|school_admin` normalized โดย web; ไม่ใช่ค่า cType/UserType และ employee ไม่เท่ากับ teacher
- `AssessmentMethod=automatic|teacher`
- `ContentState=draft|published|retired`
- `SubmissionState=queued|grading|awaiting_teacher|evaluated|error`
- `JobState=queued|running|completed|failed`
- `Outcome=passed|not_yet`
- `ReleaseState=draft|published|withdrawn`
- `Channel=stable|beta`
- `Platform=windows-amd64|darwin-amd64|darwin-arm64`
- `Jwk={kty:"EC",crv:"P-256",x:base64url32,y:base64url32}`; ไม่มี private field
- `Text={default_locale:"th"|"en"|"zh",th:T8000?,en:T8000?,zh:T8000?}`; locale หลักต้องมีข้อความ เนื้อหาหลักสูตรไม่ใช่ UI catalog
- `RuleResult={rule_id:U,matched:B}`
- `ArmEvidence={profile_hash:H,acceptance_ref:T2048,note:T4000}`; เป็นข้อมูลประกอบ ไม่ยืนยันการเคลื่อนไหว
- `ProjectContent` นิยามครบใน DES-003; `CriteriaRules` ใน DES-005; `Manifest` เป็น JWS ตาม DES-007

## Legacy refs / placement ที่เสนอ

ถอน SchoolBotUser ไม่คัดลอกบัญชี/password หรือเพิ่ม identity mapping table; Session เก็บสิทธิ์เข้า web ที่เพิกถอนได้ ไม่ใช่บัญชีใหม่ ทุกตารางใหม่ข้างต้นยังมี prefix/PK และ common columns ครบ

Owner=(SchoolId,OwnerKind,OwnerId); LearnerId คือ student; TeacherId/AssessorId คือ employee ใช้ SchoolId ของ row ประกอบ P; API legacy *_id:I ใช้ context/kind เดียวกัน (owner มี owner_kind); resource IDs ของ SchoolBot เป็น K

TeacherGrant เป็น fallback สิทธิ์เฉพาะคู่เมื่อเจ้าของยืนยันช่องว่างจาก scope เดิมและอนุมัติ schema ไม่ใช่ identity mapping ไม่รวมสิทธิ์สองแหล่งเอง

ใช้ 4 DB เดิม: Master อ่านบัญชี; School อ่าน profile และเสนอวาง **ทุกตาราง SchoolBot** ใน physical target เดียว รวม Session/Idempotency/AuditEvent/Release; Logs/PGGradeDB ใช้เฉพาะกรณีที่ระบุภายหลัง ไม่ใช่ทุก login และไม่มีสิทธิ์เขียนเกรดทางการโดยมตินี้ ไม่เพิ่ม DB ที่ห้า; schema/physical FK/deployment รอ DBA

## กฎข้อมูลและ HTTP contract ร่วม

อ่าน [data-contract-rules.md](data-contract-rules.md) ประกอบเสมอ: มี relations, uniqueness, invariants, error envelope, headers, pagination และขนาด payload ของ DES ทั้งชุด

## Change Log
- 2026-10-21 — Rev3: PK/FK เป็น K; แยก legacy I และ logical UUID U
- 2026-10-21 — Rev2: legacy keys; ถอน User ซ้ำ เพิ่ม Session/placement
- 2026-10-21 — Rev1: เสนอ logical schema, audit/SchoolId ทุกตาราง, concurrency และ error contract เพื่อส่ง DBA หลังอนุมัติ
- 2026-10-21 — MYCELIUM แยกกฎข้อมูลและ HTTP contract เพื่อคุมขนาด โดยไม่เปลี่ยน fields หรือ IDs
