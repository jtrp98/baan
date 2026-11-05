# สัญญาอ้างอิง — ตารางครบทุก field นอก common columns/PK (32 ตาราง)

[กลับคู่มือ](../data-model.md) · [สารบัญสัญญา](contract-index.md)

ข้อความจาก data-model Rev5 คงชื่อฟิลด์ ชนิด และกฎเดิม ใช้คู่กับคำอธิบายรายตาราง

## ตารางครบทุก field นอก common columns/PK (32 ตาราง)

| ตาราง | Fields |
|---|---|
| **SchoolBotLicense** | SchoolName:T200, KeyHash:H, KeyHint:T32, ExpiresAt:D, RevokedAt:D?, CurrentBindingId:K?, BindingEpoch:N, AllowedNextJkt:H? |
| **SchoolBotLicenseBinding** | LicenseId:K, DeviceJkt:H, PublicJwk:Jwk, Epoch:N, ActivatedAt:D, DetachedAt:D?, LastCheckedAt:D, LastEntitlementExpiresAt:D |
| **SchoolBotRelease** | VersionText:T32, Channel:Channel, Platform:Platform, Manifest:T16384, ArtifactHash:H, Lifecycle:ReleaseState, PublishedAt:D?, WithdrawnAt:D? |
| **SchoolBotIdempotency** | Principal:A, Operation:T200, RequestKey:U, RequestHash:H, NonceHash:H?, HttpStatus:integer100–599, ResultCipher:bytes?, ResultKeyId:T128?, ResourceId:K?, CompletedAt:D, ReplayUntil:D |
| **SchoolBotAuditEvent** | Actor:A, Event:T64, EntityType:T64, EntityId:K, RequestId:U, Reason:T1000 |
| **SchoolBotSession** | Channel:SessionChannel, AccountId:I?, TokenHash:H, ProfileKind:(student\|employee)?, ProfileId:I?, LegacyAdminId:T64?, DeviceJkt:H?, SourceTokenExpiresAt:D?, ExpiresAt:D, RevokedAt:D? |
| **SchoolBotStaffRole** | EmployeeId:I, Role:StaffRole, ValidFrom:D, ValidUntil:D?, Reason:T1000 |
| **SchoolBotProject** | OwnerKind:student\|employee, OwnerId:I, Mode:Mode, Name:T200, CurrentRevision:N |
| **SchoolBotProjectRevision** | ProjectId:K, Revision:N, Content:ProjectContent, ContentHash:H |
| **SchoolBotLevel** | LevelKey:U, Code:T64, Ordinal:N, Title:Text |
| **SchoolBotLevelPromotionPolicy** | LevelId:K, Revision:N, Threshold:numeric(9,6), Reason:T1000 |
| **SchoolBotCurriculum** | CurriculumKey:U, Revision:N, LevelId:K, Title:Text, RecommendedGrades:T16[], Subjects:CurriculumSubject[], SourceRef:T2048, Lifecycle:ContentState, PublishedAt:D? |
| **SchoolBotLesson** | CurriculumId:K, LessonKey:U, Ordinal:N, Title:Text, Objective:Text, Instructions:Text |
| **SchoolBotMission** | LessonId:K, MissionKey:U, Ordinal:N, Title:Text, Instructions:Text, Method:AssessmentMethod |
| **SchoolBotCriteria** | MissionId:K, Revision:N, Rules:CriteriaRules, SourceRef:T2048, ApprovedBy:A?, ApprovedAt:D? |
| **SchoolBotActivity** | LessonId:K, ActivityKey:U, Ordinal:N, Title:Text, Type:ActivityType, Mode:Mode?, Indicators:Indicator[], Config:ActivityConfig |
| **SchoolBotQuestionBank** | BankKey:U, Revision:N, Title:Text, Questions:Question[], SourceRef:T2048, Lifecycle:ContentState, PublishedAt:D? |
| **SchoolBotCourseRun** | CurriculumId:K, ClassroomId:I, NYear:I, NTerm:T64, PlanCourseIds:I[], CurrentPolicyId:K?, PreviousRunId:K?, EffectiveAt:D, Lifecycle:CourseRunState |
| **SchoolBotScoringPolicy** | CourseRunId:K, Revision:N, Policy:ScoringPolicy |
| **SchoolBotCourseRunActivity** | CourseRunId:K, ActivityId:K, OpensAt:D?, ClosesAt:D?, PolicyOverride:AssessmentPolicy? |
| **SchoolBotSubmission** | LearnerId:I, MissionId:K, CriteriaId:K, ProjectRevisionId:K, SubmittedAt:D, State:SubmissionState, CurrentAssessmentId:K?, Evidence:ArmEvidence? |
| **SchoolBotGradingJob** | SubmissionId:K, State:JobState, Attempts:integer≥0, LeaseOwner:T128?, LeaseUntil:D?, NextAttemptAt:D, LastErrorCode:T64? |
| **SchoolBotAssessment** | SubmissionId:K, Sequence:N, Method:AssessmentMethod, Outcome:Outcome, EarnedScore:numeric(18,6)?, MaxScore:numeric(18,6)?, RuleResults:RuleResult[], Feedback:T4000, GraderVersion:T128?, AssessorId:I?, SupersedesId:K?→Assessment |
| **SchoolBotAttempt** | CourseRunId:K, ActivityId:K, LearnerId:I, Sequence:N, State:AttemptState, StartedAt:D, DeadlineAt:D?, SubmittedAt:D?, Snapshot:AttemptSnapshot, Answers:Answer[], EarnedScore:numeric(18,6)?, MaxScore:numeric(18,6) |
| **SchoolBotRetakeGrant** | CourseRunId:K, ActivityId:K, LearnerId:I, Reason:T1000, ConsumedAttemptId:K? |
| **SchoolBotGradeSlot** | CourseRunId:K, PlanCourseId:I, CourseId:I, NGradeId:I, AssessmentId:I, ScoreIdentifier:T128, Category:Category, TargetSnapshot:TargetSnapshot, OwnershipReason:T1000, RetiredAt:D? |
| **SchoolBotScoreMapping** | CourseRunId:K, GradeSlotId:K, Sources:MappingSource[], RetiredAt:D? |
| **SchoolBotScorePreview** | CourseRunId:K, Principal:A, SnapshotHash:H, ExpiresAt:D, State:PreviewState, SupersedesId:K?, Context:PreviewContext |
| **SchoolBotScorePreviewItem** | ScorePreviewId:K, LearnerId:I, State:PreviewItemState, ReasonCodes:T64[], Snapshot:PreviewItemSnapshot |
| **SchoolBotScoreExport** | ScorePreviewId:K, ConfirmedBy:A, ConfirmedAt:D, State:ExportState |
| **SchoolBotScoreOutbox** | ScoreExportId:K, ScorePreviewItemId:K, OperationKey:U, PayloadHash:H, State:OutboxState, Attempts:integer≥0, LeaseOwner:T128?, LeaseUntil:D?, NextAttemptAt:D, ReceiptId:int8?, ReceiptHash:H?, LastErrorCode:T64? |
| **SchoolBotLevelProposal** | CourseRunId:K, TargetCurriculumId:K, SnapshotHash:H, Snapshot:LevelSnapshot, State:LevelProposalState, DecisionBy:A?, DecisionAt:D?, Reason:T1000?, SuccessorRunId:K? |

ขอบเขต `SchoolId` ตามมติ [decisions-026.md](../../../shared/decisions/decisions-026.md) และ `db/review-005.md` (memory):
- **Global เท่านั้น (`SchoolId = null` เสมอ — 8 ตาราง)**: `SchoolBotLevel`, `SchoolBotLevelPromotionPolicy`, `SchoolBotCurriculum`, `SchoolBotLesson`, `SchoolBotMission`, `SchoolBotCriteria`, `SchoolBotActivity`, `SchoolBotQuestionBank`
- **Mixed Global/Tenant (`SchoolId = null` เฉพาะ catalog/operation กลาง หรือ `SchoolId > 0` สำหรับรายการรายโรงเรียน — 3 ตาราง)**: `SchoolBotRelease`, `SchoolBotIdempotency`, `SchoolBotAuditEvent`
- **Tenant เท่านั้น (`SchoolId > 0` เสมอ — 21 ตาราง)**: ตารางอื่นทั้งหมด (โดย `SchoolBotStaffRole.SchoolId` คือโรงเรียนต้นสังกัดของบัญชีพนักงาน)
ทุกแถวยังมีคอลัมน์มาตรฐานครบ ห้ามใช้ `SchoolId = 0` หรือค่าจำลองแทน global

`ResourceId:K?` ชี้ resource หลักที่ endpoint คืนตาม `Operation`; `EntityType` = ชื่อตารางที่ `EntityId:K` อ้าง. Web ตรวจชนิด/`SchoolId` เพราะไม่ใช่ FK เดี่ยวข้ามตาราง. Local UUID/receipts ไม่เป็น DB PK; ไม่เพิ่ม `ClientId`/public UUID
