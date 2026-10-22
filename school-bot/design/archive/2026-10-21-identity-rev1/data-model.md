# Logical data contract — Rev1

อ้าง REQ-011, 027–029, 033–039 ชุดนี้ไม่มี SQL และไม่กำหนดชื่อ database/schema ทางกายภาพ

## ชนิดและกฎร่วมที่เสนอ

`U` = UUID; `N` = integer ≥1; `B` = boolean; `Tn` = Unicode string ยาวไม่เกิน n; `D` = UTC instant; `H` = SHA-256 hex 64 ตัว; `?` = nullable; `[]` = array; ค่าอื่น non-null ไม่มี implicit default

`S` = SchoolId จากระบบเจ้าของโรงเรียน **ชนิด physical, FK และแหล่งอ้างอิงยัง PENDING**; wire ใช้ opaque string ห้าม parse เป็นเลขหรืออนุมานชื่อโรงเรียน

`A` = actor reference ยาว ≤512: `user:<U>`, `device:<H>`, `service:<name>` หรือ identity ผู้ดูแลที่ adapter ยืนยัน ไม่มี FK ไป auth provider โดยสมมติ

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

ทุกตารางมี PK `SchoolBot<Entity>Id:U` ตามชื่อเต็มตาราง เช่น `SchoolBotLicenseId` ห้ามใช้ชื่อ PK อื่น คอลัมน์ FK `XId` ด้านล่างอ้าง `SchoolBotX.SchoolBotXId`; FK ภายในโรงเรียนตรวจคู่ `(SchoolId,XId)` เสมอ

Default reads ตัด IsDelete=true; unique keys ที่ระบุไม่ถูกคืนให้ใช้ใหม่เมื่อ soft delete เว้นแต่ระบุ “live” ห้าม cascade hard delete ผลเรียน/ประวัติ Immutable rows ไม่แก้ business fields หลังสร้าง

## ตารางครบทุก field นอก common columns/PK

| ตาราง | Fields |
|---|---|
| **SchoolBotLicense** | SchoolName:T200, KeyHash:H, KeyHint:T32, ExpiresAt:D, RevokedAt:D?, CurrentBindingId:U?, BindingEpoch:N, AllowedNextJkt:H? |
| SchoolBotLicenseBinding | LicenseId:U, DeviceJkt:H, PublicJwk:Jwk, Epoch:N, ActivatedAt:D, DetachedAt:D?, LastCheckedAt:D, LastEntitlementExpiresAt:D |
| SchoolBotUser | Issuer:T2048, Subject:T256, DisplayName:T200, Roles:Role[], DisabledAt:D? |
| SchoolBotTeacherGrant | TeacherId:U→User, LearnerId:U→User, Mode:Mode, CanView:B, CanAssess:B, ValidFrom:D, ValidUntil:D? |
| SchoolBotProject | OwnerId:U→User, Mode:Mode, Name:T200, CurrentRevision:N |
| SchoolBotProjectRevision | ProjectId:U, Revision:N, Content:ProjectContent, ContentHash:H |
| SchoolBotCurriculum | CurriculumKey:U, Revision:N, Mode:Mode, Title:Text, SourceRef:T2048, Lifecycle:ContentState, PublishedAt:D? |
| SchoolBotLesson | CurriculumId:U, LessonKey:U, Ordinal:N, Title:Text, Objective:Text, Instructions:Text |
| SchoolBotMission | LessonId:U, MissionKey:U, Ordinal:N, Title:Text, Instructions:Text, Method:AssessmentMethod |
| SchoolBotCriteria | MissionId:U, Revision:N, Rules:CriteriaRules, SourceRef:T2048, ApprovedBy:A?, ApprovedAt:D? |
| SchoolBotSubmission | LearnerId:U→User, MissionId:U, CriteriaId:U, ProjectRevisionId:U, SubmittedAt:D, State:SubmissionState, CurrentAssessmentId:U?, Evidence:ArmEvidence? |
| SchoolBotGradingJob | SubmissionId:U, State:JobState, Attempts:integer≥0, LeaseOwner:T128?, LeaseUntil:D?, NextAttemptAt:D, LastErrorCode:T64? |
| SchoolBotAssessment | SubmissionId:U, Sequence:N, Method:AssessmentMethod, Outcome:Outcome, RuleResults:RuleResult[], Feedback:T4000, GraderVersion:T128?, AssessorId:U?→User, SupersedesId:U?→Assessment |
| SchoolBotRelease | VersionText:T32, Channel:Channel, Platform:Platform, Manifest:T16384, ArtifactHash:H, Lifecycle:ReleaseState, PublishedAt:D?, WithdrawnAt:D? |
| SchoolBotIdempotency | Principal:A, Operation:T200, RequestKey:U, RequestHash:H, NonceHash:H?, HttpStatus:integer100–599, ResultCipher:bytes?, ResultKeyId:T128?, ResourceId:U?, CompletedAt:D, ReplayUntil:D |
| SchoolBotAuditEvent | Actor:A, Event:T64, EntityType:T64, EntityId:U, PreviousVersion:integer≥0, NewVersion:N, RequestId:U, Reason:T1000 |

`SchoolBotRelease.SchoolId` เสนอให้ null สำหรับ catalog กลาง; `SchoolBotIdempotency` และ `SchoolBotAuditEvent` null ได้เฉพาะ operation กลางนั้น ทุก row ยังมีคอลัมน์ครบ ไม่ใช้ SchoolId ปลอมหรือศูนย์ ข้อยกเว้น null นี้รอมนุษย์/DBA อนุมัติ

## Enums และ embedded types

- `Mode=block|arm|code`
- `Role=student|teacher|school_admin`; platform publisher/admin เป็น scope จาก trusted identity adapter
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

## กฎข้อมูลและ HTTP contract ร่วม

อ่าน [data-contract-rules.md](data-contract-rules.md) ประกอบเสมอ: มี relations, uniqueness, invariants, error envelope, headers, pagination และขนาด payload ของ DES ทั้งชุด

## Change Log
- 2026-10-21 — Rev1: เสนอ logical schema, audit/SchoolId ทุกตาราง, concurrency และ error contract เพื่อส่ง DBA หลังอนุมัติ
- 2026-10-21 — MYCELIUM แยกกฎข้อมูลและ HTTP contract เพื่อคุมขนาด โดยไม่เปลี่ยน fields หรือ IDs
