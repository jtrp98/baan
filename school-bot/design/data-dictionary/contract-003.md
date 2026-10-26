# สัญญาอ้างอิง — Enums และ embedded types

[กลับคู่มือ](../data-model.md) · [สารบัญสัญญา](contract-index.md)

ฐานชนิด/fieldsจากdata-modelRev5 พร้อมJSONreconciliationarch091/DES011ตามChangeLogRev3 ใช้คู่คำอธิบายรายตาราง; physicalfields/SQLเดิม ไม่อนุมัติstored-datarewrite.

## Enums และ embedded types

- `Mode=block|arm|code`
- `ActivityType=instruction|project|quiz|test`
- `Role=student|teacher|school_admin` normalized โดย web; ไม่ใช่ค่า `cType`/`UserType` และ `employee` ไม่เท่ากับ `teacher`
- `SessionChannel=desktop|school_web|staff_admin`
- `StaffRole=content_author|content_approver|level_policy_admin|license_admin|release_publisher|dashboard_viewer|staff_admin`
- `AssessmentMethod=automatic|teacher`
- `ContentState=draft|published|retired`
- `CourseRunState=planned|active|closing|closed`
- `SubmissionState=queued|grading|awaiting_teacher|evaluated|error`
- `JobState=queued|running|completed|failed`
- `Outcome=passed|not_yet`
- `QuestionKind=single_choice|boolean`
- `AttemptState=started|submitted|expired|voided`
- `Category=before_midterm|after_midterm|midterm|final`
- `PreviewState=open|conflicted|confirmed|superseded|expired`
- `PreviewItemState=ready|conflict|blocked`
- `ExportState=queued|running|paused_conflict|reconciling|completed|completed_with_skips|failed`
- `OutboxState=queued|running|applied|skipped|conflict|blocked|unknown`
- `LevelProposalState=proposed|promoted|retained|max_level|stale`
- `ReleaseState=draft|published|withdrawn`
- `Channel=stable|beta`
- `Platform=windows-amd64|darwin-amd64|darwin-arm64`
- `Jwk={kty:"EC",crv:"P-256",x:base64url32,y:base64url32}`; ไม่มี private field
- `Text={default_locale:"th"|"en"|"zh",th:T8000?,en:T8000?,zh:T8000?}`; locale หลักต้องมีข้อความ เนื้อหาหลักสูตรไม่ใช่ UI catalog
- `CurriculumSubject={subject_key:U,code:T64,title:Text}`
- `Indicator={indicator_key:U,code:T128,title:Text}`
- `ActivityConfig`:
  - `{kind:"instruction-v1",instructions:Text,media_refs:T2048[]}`
  - `{kind:"project-v1",mission_id:K}`
  - `{kind:"question-v1",bank_id:K,question_keys:U[],default_policy:AssessmentPolicy}`
- `AssessmentPolicy={max_attempts:N|null,selection:best|first|latest,time_limit_seconds:integer>=1|null,reveal:after_submit|after_close,shuffle_questions:B,shuffle_options:B}`
- `ScoringPolicy={quiz_counts:B,activity_weights:[{activity_id:K,weight_bps:int0..10000}],formula_version:T64|null}`
- `Question={question_key:U,kind:QuestionKind,prompt:Text,options:[{option_key:U,text:Text}],correct_option_keys:U[],max_score:DecimalString}`
- `Answer={question_key:U,selected_option_keys:U[]}`
- `AttemptSnapshot={bank_id:K,bank_revision:N,curriculum_revision:N,policy_id:K,evaluator_version:T128,questions:Question[],question_order:U[],option_order:[{question_key:U,option_keys:U[]}],effective_policy:AssessmentPolicy,opens_at:D|null,closes_at:D|null}` (server-only; APIคืนPublicQuestionที่ตัดcorrect_option_keysและreadprojectionตาม[attemptread](../learning-attempt-read-001.md); policy/windowsมาจากตอนเริ่มไม่resolveใหม่ตอนresume)
- `MappingSource={activity_id:K,indicator_key:U|null,weight_bps:int0..10000}`
- `TargetSnapshot={n_year:I,n_term:T64,classroom_id:I,plan_course_id:I,course_id:I,n_grade_id:I,assessment_id:I,score_identifier:T128,max_score:DecimalString,header_token:T512,assessment_token:T512,settings_hash:H}`
- `PreviewContext={mapping_versions:[{id:K,update_date:D}],policy_id:K,roster:I[],writer_version:T128,calculator_version:T128,authorization_checked_at:D}`
- `SourceResultRef={kind:assessment|attempt,id:K,update_date:D,activity_id:K,earned:DecimalString,max_score:DecimalString,weight_bps:int0..10000}`
- `PreviewItemSnapshot={cells:[{mapping_id:K,grade_slot_id:K,target:TargetSnapshot,grade_detail_id:I,row_token:T512,old_score:T128|null,last_exported_score:T128|null,raw_target:DecimalString,new_score:integer>=0,source_hash:H,sources:SourceResultRef[],special_result:T128|null,grade_edit_fingerprint:H,before_document_hash:H,decision:apply|keep_destination|replace_owned}],reason_codes:T64[]}`
- `LevelSnapshot={promotion_policy_id:K,promotion_policy_revision:N,formula_version:T64,policy_hash:H,scoring_policy_id:K,scoring_policy_revision:N,scoring_policy:ScoringPolicy,current_curriculum_id:K,roster:[{learner_id:I,total:DecimalString|null,source_hash:H,sources:SourceResultRef[]}],average:DecimalString|null,threshold:DecimalString,gap:DecimalString|null,member_count:integer>=0,missing_as_zero:true,eligible:B,effective_at:D,target_n_year:I,target_n_term:T64}`; policyเป็นfrozenสำเนา/refsชนิดเดิม ไม่มีsourceไม่สร้างrefปลอม. [Projection/compatibility](../learning-snapshot-projection-001.md): snapshotเก่าขาดrefsห้ามbackfillด้วยผลสด detail/reconfirmที่ต้องใช้refsคืนPROPOSAL_STALE; ต้องตรวจreadercompatก่อนเขียนรูปใหม่ ไม่rewriteข้อมูลเดิมในงานนี้.
- `RuleResult={rule_id:U,matched:B}`
- `ArmEvidence={profile_hash:H,acceptance_ref:T2048,note:T4000}`; เป็นข้อมูลประกอบ ไม่ยืนยันการเคลื่อนไหว
- `ProjectContent` นิยามครบใน [des-003.md](../des-003.md); `CriteriaRules` ใน [des-005.md](../des-005.md); `Manifest` เป็น JWS ตาม [des-007.md](../des-007.md)


Canonical เพิ่มเติม: [ผลเรียน](../learning-rules-032-034.md), [คะแนน](../grade-rules-032-034.md) รวม JSON effective_policy/windows/skipped_cells

## Change Log
- 2026-10-26 — Rev3 arch091: reconcileAttemptpolicy/windowsที่กำหนดแล้วและLevelSnapshotrefs/frozenpolicyตามDES011; ไม่เปลี่ยนphysicaljsonbfield/SQLหรืออนุมัติstored-datarewrite.
- 2026-10-23 — Rev2: sync032..034; physicalเดิม

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
