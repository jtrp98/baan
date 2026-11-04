# Gateway–SchoolBot gRPC contract ปัจจุบัน

> Rev 4 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

สัญญา implementation ใช้ unary RPC package `ServiceSchoolBot` และ `csharp_namespace = "SchoolBot.Infrastructure.Protos"` คง namespace ของ generated contract แม้โปรเจกต์ Backend ชื่อ ServiceSchoolBot ไม่ใช้ package `schoolbot.v2` หรือ SessionService ของข้อเสนอเก่า

## HTTP และ RPC ที่มีจริง

ให้ Q = `/api/school-bot/service`; Gateway เติม `/api` ผ่าน convention แต่ละ controller ใช้ explicit methods ไม่มี catch-all proxy

| Service | RPC methods | HTTP ภายใต้ Q |
|---|---|---|
| ProjectService | ListProjects, CreateProject, GetProject, UpdateProject, DeleteProject, CopyProject | GET/POST projects; GET/PUT/DELETE projects/{id}; POST projects/{id}/copies |
| LicenseService | CreateDeviceChallenge, ActivateLicense, ValidateLicense, ListLicenses, CreateLicense, RevokeLicense, UnbindLicense | POST device-challenges, licenses/activate, licenses/validate; GET/POST admin/licenses; POST admin/licenses/{id}/revoke และ /unbind |
| CurriculumService | ListPublishedCurricula, GetPublishedCurriculum, ListAdminCurricula, GetAdminCurriculum, CreateCurriculum, UpdateCurriculumMetadata, UpdateCurriculumContent, PublishCurriculum, ImportCurriculum | GET curricula, curricula/{id}, admin/curricula, admin/curricula/{id}; POST admin/curricula; PUT admin/curricula/{id} และ /content; POST /publish และ /import |
| AssessmentService | GetProgress, CreateQuestionBank, UpdateQuestionBank, PublishQuestionBank, GetQuestionBank, ListQuestionBanks, GetActivityPolicy, GetAttempt, ListAttempts | GET progress; POST admin/question-banks; PUT admin/question-banks/{id}; POST /{id}/publish; GET admin/question-banks และ /{id}; GET course-runs/{id}/activities/{activityId}, attempts/{id}, attempts |
| ReleaseService | CheckUpdate, ListReleases, CreateRelease, PublishRelease | GET updates/check; GET/POST admin/releases; POST admin/releases/{id}/publish |

รวม 35 RPC ไม่มี Login/ExchangeWebSession/Logout/BindProfile/GetSession/GetMe/RevokeSessions ใน proto ปัจจุบัน ไม่อ้างว่า Assessment write/submission หรือ score export ครบจากรายการอ่านข้างต้น · RPC เขียนของงานเรียน (5 ตัว) ตัดสินแล้วแต่ยังไม่ลงโค้ด ดู [learning-write-rpc-001](learning-write-rpc-001.md)

## Proto และ generated clients

ต้นฉบับอยู่ `school-bot/web/src/ServiceSchoolBot.Infrastructure/Protos/ServiceSchoolBot`; สำเนาอยู่ `sb-api-gateway/src/ApiGateway.Infrastructure/Protos/ServiceSchoolBot` มี Common, Project, License, Curriculum, Assessment, Release รวม 6 ไฟล์ตรงกันทุกไบต์

SchoolBot API csproj ใช้ GrpcServices=Both จาก proto ของ Infrastructure; Gateway Infrastructure csproj ใช้ GrpcServices=Client Repository ทั้งห้า map DTO/request/reply ผ่าน generated clients ไม่ใช้ JSON Execute proxy

ตรวจ hash ด้วย Gateway `scripts/proto-hash.ps1 -ProtoDir <directory>` ทั้งสองฝั่งได้ `1cbd1f0140c128ccb650ded32be8df1b80192c5e6ce5a34fb770e7cc5a029d27` ตรง .proto-hash: service=ServiceSchoolBot, repo=school-bot, commit=35c62bfc25966d1899244f190b1fba1db7435a76, dirty=false, syncedAt=2026-11-04T12:10:51.5163430+07:00 ไม่มีการ refresh หรือแก้ source ในรอบเอกสารนี้

อ่าน [DTO](gateway-grpc-contract-001-dto.md), [identity](gateway-grpc-contract-001-identity.md), [auth/compatibility](gateway-grpc-contract-001-login.md), [errors](gateway-grpc-contract-001-errors.md), [limits](gateway-grpc-contract-001-limits.md), [หลักฐาน](gateway-integration-evidence.md)

## หลักฐาน

ตรวจ proto, controllers และ repository mappings ที่ HEAD SchoolBot 35c62bf/Gateway b4181ca วันที่ 2026-11-04; ใบงาน106 (memory) เก็บคำสั่งและข้อจำกัด ไม่ได้ regenerate client หรือ build ใหม่
