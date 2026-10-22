# Amendment proposal 002 — ต่อจาก amendment-proposal-001 สำหรับ DES-008–012

สถานะ: APPLIED (พร้อมแก้ 2 จุดตาม decisions-025/026) — อนุมัติเป็น baseline ใหม่ตาม [decisions-026.md](../requirement/decisions-026.md) (2026-10-22) และ sync เข้า `data-model.md` Rev4, `data-contract-rules.md` Rev4, `des-004.md` Rev4, `des-005.md` Rev4, `schoolbot.dbml` Rev2 และ `schema-notes.md` Rev2 แล้ว โดยแก้ไข §3 ของข้อเสนอเดิม 2 จุดให้ตรง [decisions-025.md](../requirement/decisions-025.md):
1. session channel `school_web` ต้องตรวจว่าโรงเรียนมี `SchoolBotLicense` ที่ active (ไม่ต้องมี device binding) — ไม่ใช่ตรวจ License เฉพาะ `/auth/login` ของ desktop
2. Desktop bind ได้ทั้งนักเรียนและครู (`P=student` หรือ `employee`) เพื่อใช้เรียน/ลองเท่านั้น ไม่มีเมนูครูหรือการส่งคะแนนใน Desktop — ถอนข้อเสนอ "Desktop bind เฉพาะ P=student"

## 1. แก้ข้อเสนอใน amendment-proposal-001

| จุดใน 001 | แก้เป็น |
|---|---|
| ActivityConfig question-v1 `{bank_id,question_keys,shuffle_questions,shuffle_options}` | `{kind:"question-v1",bank_id:K,question_keys:U[],default_policy:AssessmentPolicy}` (DES-010 Rev2) |
| SchoolBotScoringPolicy.Policy shape (quiz/test/missing_result/approval_ref) | `{quiz_counts:B,activity_weights:[…],formula_version:T64|null}` |
| QuestionKind | `single_choice|boolean` |
| SchoolBotCourseRun | เพิ่ม `PlanCourseIds:I[]` (≥1, ไม่ซ้ำ, ทุกค่าอยู่ห้อง/เทอมของ run), Lifecycle เพิ่ม `closing` |
| SchoolBotLevelProposal.State | `proposed|promoted|retained|max_level|stale` |
| LevelSnapshot | เพิ่ม `promotion_policy_id:K, promotion_policy_revision:N, formula_version:T64, gap:DecimalString|null, member_count:integer>=0, missing_as_zero:true`; ถอน `promotion_policy_ref` |
| Placement data-model บรรทัด 84 | คงข้อความใน 001 และเพิ่ม: "การเขียนเปิดได้หลังผ่าน release gates ของ DES-009 Rev2" |

## 2. data-model — เพิ่ม/แก้ (Rev4 รวม 001)

ตารางเดิม:
| ตาราง | Amendment |
|---|---|
| SchoolBotSession | เพิ่ม `Channel:desktop|school_web|staff_admin`; `DeviceJkt:H?` (ต้องมีเมื่อ desktop เท่านั้น); `AccountId:I?` (ต้องมีเมื่อ desktop; web/staff ใช้ P จาก token ที่ตรวจแล้ว); เพิ่ม `LegacyAdminId:T64?`, `SourceTokenExpiresAt:D?` — **breaking ต่อ DES-004/data-model Rev3** |

ตารางใหม่ (PK `SchoolBot<Name>Id:K` + common columns ครบ):
| ตาราง | Fields |
|---|---|
| SchoolBotStaffRole | `EmployeeId:I, Role:StaffRole, ValidFrom:D, ValidUntil:D?, Reason:T1000` (SchoolId = โรงเรียนของบัญชีพนักงาน) |
| SchoolBotLevelPromotionPolicy | `LevelId:K, Revision:N, Threshold:numeric(9,6) 0..100, Reason:T1000` (global, SchoolId=null) |
| SchoolBotCourseRunActivity | `CourseRunId:K, ActivityId:K, OpensAt:D?, ClosesAt:D?, PolicyOverride:AssessmentPolicy?` |
| SchoolBotRetakeGrant | `CourseRunId:K, ActivityId:K, LearnerId:I, Reason:T1000, ConsumedAttemptId:K?` |

Enums/shapes:
- `StaffRole=content_author|content_approver|level_policy_admin|license_admin|release_publisher|dashboard_viewer|staff_admin`
- `SessionChannel=desktop|school_web|staff_admin`
- `AssessmentPolicy` ตาม DES-010 Rev2
- Actor `A` เพิ่ม `web:<S>:employee:<I>`, `web:<S>:admin:<T64>`, `staff:<S>:<I>`

Integrity (เพิ่มใน data-contract-rules):
- live unique `(SchoolId,EmployeeId,Role)` ของ StaffRole
- unique `(LevelId,Revision)` ของ LevelPromotionPolicy; Level ใหม่ต้องมี revision 1 = 70
- unique `(CourseRunId,ActivityId)` ของ CourseRunActivity; ClosesAt > OpensAt เมื่อมีทั้งคู่
- Session: Channel=desktop ⇔ DeviceJkt not null และ AccountId not null
- SchoolBot ไม่มี CORS; request ที่มี Origin นอก allow-list → 403 ORIGIN_NOT_ALLOWED
- domain errors ใหม่จาก DES-008–012 ใช้ envelope เดิม

## 3. DES-004 Rev3 → Rev4 (ข้อความแทนเฉพาะจุด)

- บรรทัด 13 Actor: ครูและผู้ดูแลโรงเรียนใช้ web-system ผ่าน DES-012; Desktop สำหรับนักเรียน/Guest
- บรรทัด 21–23: session มี Channel; ข้อกำหนด License/device proof/DeviceJkt ใช้กับ channel desktop
- บรรทัด 48–49 ตาราง Permissions: Teacher/School admin ย้ายไป DES-012 (school_web);
  Platform publisher/admin → staff_admin + StaffRole
- บรรทัด 54: "Login ต้องมี active License…" จำกัดเฉพาะ `/auth/login` (desktop)
- บรรทัด 71: static admin key คงเป็น dev/compat; production ใช้ staff session (DES-012)
- ข้อเสนอ: Desktop bind เฉพาะ P=student (รอ BA)

## 4. design/index.md

| เอกสาร | Rev | สถานะเสนอ |
|---|---:|---|
| DES-008 | 2 | PROPOSED — รอ schema/slot allocation และนิยาม school_admin (H3) |
| DES-009 | 2 | PROPOSED — BLOCKED export จนผ่าน G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB |
| DES-010 | 2 | PROPOSED — รอ schema; retake/ขอบเขต override/สูตรรวม (OQ-014) รอมติ |
| DES-011 | 2 | PROPOSED — รอ schema และ OQ-014; ตรวจแหล่ง roster/วันสิ้นเทอม |
| DES-012 | 1 | PROPOSED — รอ H1–H8 |
| amendment-proposal-002 | 1 | PROPOSED |
REQ mapping เพิ่ม: REQ-043→005,010,012 · REQ-044→005,010 · REQ-045→005 ·
REQ-046/047→010 · REQ-048→011,012 · REQ-049→008,012 · REQ-050/051→009,012 · REQ-052→009,012

## 5. งานนอก SchoolBot ที่ต้องมีเจ้าของ

| งาน | repo | ผู้อนุมัติ |
|---|---|---|
| endpoint web-principal | sb-api-gateway | เจ้าของ gateway (CODEOWNERS) + มนุษย์ |
| upstream `schoolBot` + env `SCHOOL_BOT_API_URL` + BFF route | sb-tech-upgrade-web-system | เจ้าของ repo (R0 env) |
| fixtures/inventory PGGradeDB, DB user SchoolBot | DBA | DBA + เจ้าของข้อมูล (PDPA) |
| ทดสอบ G-COEXIST บน environment ทดสอบ / CAS ใน writer เดิมถ้าไม่ผ่าน | sb-service-academic-score-record | เจ้าของ service |

## 6. ประตูมนุษย์และ DBA ที่ยังเปิด

H1–H8 ตาม DES-012; schema ทั้งหมดใน §1–2 (breaking: Session, ScoringPolicy shape, Curriculum.Mode จาก 001);
release gates ของ DES-009; OQ-014 (สูตรรวม), OQ-016 (หลาย source ต่อช่อง/แก้ mapping หลังส่ง);
decisions-024 ยังไม่ตัดสิน (ผลสอบซ่อม/เพดาน, ขอบเขต override ของครู);
shuffle_options ของ test; UX sign-off หน้าครู/mapping/admin ก่อน FE

## Change Log
- 2026-10-22 — SA เสนอ amendment ต่อจาก 001 ตาม decisions-022/023/024 และ DES-012; ยังไม่ apply
