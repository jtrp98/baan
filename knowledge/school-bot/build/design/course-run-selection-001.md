# Course run selection 001 — โรงเรียนเลือกหลักสูตรลงห้อง (AC-043-01 ส่วนโรงเรียน)

> Rev 1 · แก้ล่าสุด 2026-11-04 · แก้โดย arch · ขอโดย ผู้ใช้ (ปิดช่องว่างสัญญาที่ inspect พบ — ยังไม่ลงโค้ด)

สิ่งที่ตกลงแล้ว: "เลือกหลักสูตรลงห้อง" = สร้างแถว `SchoolBotCourseRun` ใหม่ (lifecycle planned) พร้อม `SchoolBotCourseRunActivity` ทุก Activity ของ revision นั้น · เพิ่ม 3 RPC ใน AssessmentService (CreateCourseRun, GetCourseRun, ListCourseRuns) และ HTTP ของ Gateway ใต้ `/api/service-school-bot/course-runs` · ไม่มี schema change · ผู้เรียกต้องเป็น school admin ทาง school_web ที่ License active · ตรวจห้อง/ปี/เทอม/แผนผ่าน port ใหม่ `ICourseRunTargetVerifier` ค่าเริ่มต้น fail closed (503) จนกว่าจะเชื่อม School DB จริง (ผูก gate G-CORE/DBA-003) · ยังไม่มี task ในแผนรับงานนี้ — เสนอ task BE ใหม่ให้ gm

## 1. ตรวจกับโค้ดจริง (as-built)

- `EvaluateSelectCurriculum` มีแล้วที่ `CurriculumAuthorizationService.cs:108–150` แต่มีแค่ test เรียกใช้ (`CurriculumAuthorizationTests.cs:128–201`) โค้ดหลักไม่มีใครเรียก
- ฝั่ง CourseRun มีแต่เมธอดอ่าน: `IAssessmentRepository.cs:11–13` มีแค่ `GetCourseRunByIdAsync` และ `GetCourseRunActivityAsync` ไม่มีทางเขียน
- `Curriculum.proto:9–19` และ `Assessment.proto:11–19` ไม่มี mutation ของ CourseRun ฝั่ง Gateway มีแค่ `GET course-runs/{id}/activities/{activityId}` (`AssessmentsController.cs:79`)
- ที่เก็บพร้อมแล้ว: `CurriculumStoreSnapshot.cs:41,43` มี `CourseRuns` และ `CourseRunActivities` อยู่ในหน่วย commit เดียวกับ audit และ ledger
- ตัวตนของ school admin พร้อมแล้ว: `GatewayPrincipalResolver.cs:90–101` ใส่ `school_web`, `IsSchoolAdmin` และตรวจ License รวมถึงตรวจซ้ำตอน commit ผ่าน `RecheckAsync`
- **ยังไม่มีตัวตรวจห้อง/ปี/เทอม/แผนกับ School DB:** `ISchoolProfileRepository` มีแค่ profile ส่วน `IAssessmentAuthority` ใน production เป็น `Unconfigured` (`ApplicationServiceExtensions.cs:49`)
- `GetActivityPolicy` ตอบ 404 เมื่อไม่มีแถว `CourseRunActivity` (`AssessmentReadService.cs:20–21`) แปลว่าการเลือกต้องสร้างแถวกิจกรรมไปพร้อมกัน

## 2. สัญญาที่เสนอ (เพิ่มอย่างเดียว ไม่ breaking)

### RPC ใหม่ใน `AssessmentService` (35 → 38 RPC)

| RPC | HTTP ใต้ `Q=/api/service-school-bot` | ผล |
|---|---|---|
| `CreateCourseRun` | `POST Q/course-runs` + `Idempotency-Key: UUID` (ไม่บังคับ เหมือน create ของ BE-027 แต่ FE ควรส่งทุกครั้ง) | 201 `CourseRunItem` + ETag |
| `GetCourseRun` | `GET Q/course-runs/{id}` | 200 `CourseRunItem` + ETag |
| `ListCourseRuns` | `GET Q/course-runs?n_year=&n_term=&classroom_id=&limit=&cursor=` | 200 `{items, next_cursor}` (กรองตาม SchoolId ของ session เท่านั้น) |

### Message

- `CreateCourseRunRequest`: `reserved 1 "authorization"`, `optional idempotency_key=2`, `int32 curriculum_id=3`, `int32 classroom_id=4`, `int32 n_year=5`, `string n_term=6`, `repeated int32 plan_course_ids=7`
- `CourseRunItem`: `id, curriculum_id, curriculum_revision, level_id, classroom_id, n_year, n_term, plan_course_ids[], lifecycle, effective_at, optional current_policy_id, optional previous_run_id, update_date, etag` เวลาใช้ ISO 8601 แบบ `Curriculum.proto`
- `GetCourseRunRequest {reserved 1; int32 id=2}`
- `ListCourseRunsRequest {reserved 1; optional n_year=2, n_term=3, classroom_id=4, limit=5, cursor=6}`

### สิทธิ์

ทุก RPC ต้องเป็น `school_web` ที่เป็น school admin ของโรงเรียนนั้นและมี License active (ครูทั่วไปและ staff_admin ถูกปฏิเสธ)

### ลำดับตรวจของ Create และ error ↔ status

| ขั้น | กรณี | code | HTTP / gRPC |
|---|---|---|---|
| 1 | ไม่มี session หรือหมดอายุ | `UNAUTHORIZED` / `SESSION_EXPIRED` | 401 / Unauthenticated |
| 1 | ไม่ใช่ school_web, ไม่ใช่ admin, staff หรือ desktop | `CHANNEL_NOT_ALLOWED` | 403 / PermissionDenied |
| 1 | License ไม่ active | `LICENSE_REQUIRED` | 403 / PermissionDenied |
| 2 | id ≤ 0, `n_term` ว่างหรือยาวเกิน 64, `plan_course_ids` ว่าง/มีค่า ≤ 0/ซ้ำ (ปฏิเสธเลย ไม่ตัดซ้ำให้) หรือเกิน 20 รายการ (สมมติฐาน — ยังไม่ยืนยัน) | `INVALID_INPUT` | 400 / InvalidArgument |
| 3 | หลักสูตรไม่มีหรือถูกลบ | `NOT_FOUND` | 404 / NotFound |
| 3 | หลักสูตรยังไม่ published (ใช้ `EvaluateSelectCurriculum` ตัวเดิม) | `STATE_CONFLICT` | 409 / Aborted |
| 4 | ห้อง/ปี/เทอม/แผนไม่ใช่ของโรงเรียนนี้หรือไม่ตรงกัน | `INVALID_INPUT` | 400 / InvalidArgument |
| 4 | ตัวตรวจ School DB ยังไม่ตั้งค่าหรือใช้ไม่ได้ | `SERVICE_UNAVAILABLE` | 503 / Unavailable (fail closed) |
| 5 | มี run ที่ยังใช้อยู่ (planned/active/closing) ของห้อง/ปี/เทอมนี้แล้ว (`data-contract-rules-learning.md:16`) | `STATE_CONFLICT` | 409 / Aborted |
| 5 | Idempotency-Key เดิมแต่ body ต่าง | `IDEMPOTENCY_CONFLICT` | 409 / Aborted |

Get/List ใช้ขั้น 1 เหมือนกัน ถ้าขอ run ของโรงเรียนอื่นได้ `SCHOOL_MISMATCH` ตามแบบ `ReadRunAsync` เดิม และ id ที่ไม่มีได้ `NOT_FOUND`

### ตัวตรวจห้อง/ปี/เทอม/แผน (port ใหม่)

- เพิ่ม `ICourseRunTargetVerifier.VerifyAsync(schoolId, classroomId, nYear, nTerm, planCourseIds)` คืนผล Valid / Invalid(field) / Unavailable
- ค่าเริ่มต้นเป็น `UnconfiguredCourseRunTargetVerifier` ซึ่งคืน Unavailable ส่วน test ใช้ fake
- เส้นทางเชื่อมกับข้อมูลเดิมตาม `legacy-007/008/009/011`: `ClassroomId` ↔ `TTermSubLevel2.nTermSubLevel2`, `PlanCourseId` → `PlanId` → `TPlanTermSubLevel2` และเทอมผ่าน `TPlanCourseTerm.nTerm`
- ทางที่ไม่เลือก: เพิ่มเมธอดใน `IAssessmentAuthority` เพราะต้องแก้ fake 3 ตัว และปนหน้าที่อ่าน roster กับตรวจเป้าหมาย

### ตารางและหน่วย commit

เขียนครั้งเดียวผ่าน `CommitWithIdempotencyAsync` ตัวเดิม ไม่ต้องแก้ helper

- **`SchoolBotCourseRun` 1 แถว:**
  - `Lifecycle=planned`, `CurrentPolicyId=null`, `PreviousRunId=null`
  - `EffectiveAt` = เวลา server
  - `CreateBy` = `UpdateBy` = sEmp ของ admin
  - `PlanCourseIds` เรียงตามที่ส่งมา
- **`SchoolBotCourseRunActivity` 1 แถวต่อ Activity ที่ไม่ถูกลบของ revision นั้น:** `OpensAt`, `ClosesAt`, `PolicyOverride` เป็น null ทั้งหมด จึงใช้ `default_policy` ไปก่อน แล้วครูตั้งเวลาเองภายหลังผ่าน DES-010
- **audit 1 แถว:** `EntityType=SchoolBotCourseRun`, `Event=CourseRun.Created`, `Reason={"curriculum_id":K,"curriculum_revision":N}`
- **ledger 1 แถว:**
  - `SchoolId` = SchoolId ของ session
  - `Principal=school_web:{PrincipalId}`
  - `Operation=create_course_run`
  - `RequestHash` = SHA-256 ของ `JsonSerializer.Serialize(request)`
  - ถ้าไม่มี key ใช้ `Guid.NewGuid()` เหมือน BE-027
- `recheckAccess` เรียก resolver Recheck + `EvaluateSelectCurriculum` ซ้ำ ส่วนกฎ run ซ้ำตรวจใต้ store lock

### Read-back ที่ใช้พิสูจน์

1. `POST` ได้ 201
2. เปิด store หรือ adapter ใหม่แล้ว `GET Q/course-runs/{id}` และ `ListCourseRuns` ต้องเห็น `curriculum_revision` ที่เลือกกับ `lifecycle=planned`
3. `GET Q/course-runs/{id}/activities/{activityId}` ได้ 200 โดยหน้าต่างเวลาเป็น null
4. หลักสูตรกลาง children และ audit ของหลักสูตรต้องไม่เปลี่ยน
5. เลือกซ้ำได้ 409 และไม่เพิ่มแถวใดเลย

### ลำดับงานเขียนโค้ด

1. ServiceSchoolBot: แก้ `Assessment.proto`, service, repository และ verifier
2. คัดลอก proto ให้ตรงกันทุกไบต์ไปที่ `sb-api-gateway/.../Protos/ServiceSchoolBot`
3. รัน `scripts/proto-hash.ps1` ทั้งสองฝั่ง และอัปเดต `.proto-hash`
4. Gateway: เพิ่มใน `AssessmentsController.cs` และ `AssessmentGrpcRepository.cs`

### ผูกกับแผน (เสนอให้ gm)

ไม่มี task เดิมที่รับงานนี้ได้โดยไม่ต้องเปิด task ที่ verified แล้วขึ้นมาใหม่:
- BE-039-S2 ครอบแค่ authorization
- BE-029 ครอบ AC-043-02..04 และเป็นการอ่านอย่างเดียว

**จึงเสนอ task ใหม่** เช่น "BE-0xx CourseRun selection write" owner sys, depends BE-027 และ BE-029, AC-043-01 (ส่วนโรงเรียน, ระดับ API) และให้ qa แก้ TP001-130 ส่วนที่ "ยังเขียนไม่ได้" ให้ใช้ path ใหม่กับ read-back ข้างบน การเชื่อม School DB จริง (verifier ของจริง) ผูกกับ gate G-CORE/DBA-003 ตามแบบ stub เดิม

## 4. สิ่งที่ขัดกับเอกสารเดิม

- BR-043-05, des-005-actors และ int-006 §1 อ้างว่ามี Next.js admin ใน `school-bot/web` แต่ไม่มีจริง
- หลักฐานใน `des-010-stub-persistence.md` ใช้ path เก่า `src/SchoolBot.Infrastructure/Persistence/...` ส่วนโค้ดจริงอยู่ที่ `ServiceSchoolBot.Infrastructure/Repositories/Storage/...`
- `gateway-grpc-contract-001` Rev4 ต้องเลื่อนเป็น Rev5 (38 RPC) เมื่องานนี้ merge

## คำถามที่รอผู้ใช้ (ประตูมนุษย์)

1. หน้า admin ส่วนกลาง (FE-019) อยู่ที่ไหน — A: Next.js ใหม่ใน `target/school-bot/web/<ชื่อ>` ตามมติ 022/031 (arch แนะนำ ต้องได้ชื่อโฟลเดอร์) หรือ B: วางในเว็บ sb-tech-upgrade-web-system (ต้องเปลี่ยนมติ 022)
2. ส่วนโรงเรียนของ AC-043-01 — arch แนะนำ: FE-019 เหลือส่วนกลาง · ส่วนโรงเรียนพิสูจน์ระดับ API ด้วย task BE ใหม่ · หน้าเลือกในเว็บโรงเรียนเป็น FE task แยกที่รอ UX เซ็น
3. เลือกผิดแล้วแก้ได้ไหม — run planned นับเป็น run ที่ใช้อยู่ ห้องนั้นเลือกใหม่ไม่ได้ · arch แนะนำใส่ "ยกเลิก run ที่ยัง planned" ใน backlog ไม่ทำรอบนี้

## หลักฐาน

มติจาก arch 2026-11-04 (ใบงาน107 ใน memory) · อ้าง CurriculumAuthorizationService.cs:108–150 · IAssessmentRepository.cs:11–13 · Curriculum.proto:9–19 · Assessment.proto:11–19 · AssessmentsController.cs:79 · CurriculumStoreSnapshot.cs:41,43 · GatewayPrincipalResolver.cs:90–101 · ApplicationServiceExtensions.cs:49 · AssessmentReadService.cs:20–21 · data-contract-rules-learning.md:16
