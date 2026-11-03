# DES-005 — สัญญา Course Plan importer (BE-028)

> Rev 3 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย นายช่าง (ใบงาน 097 — ชี้จุด commit ของ importer: "helper ที่ห้ามแก้" คือ `CommitWithIdempotencyAsync` ระดับ adapter; `CommitMutationAsync` ระดับ application ทำเป็น generic ได้โดย BE-027 ไม่เปลี่ยนพฤติกรรม)

BE-028 นำเข้าแถวของ Course Plan Sheet ที่ผ่าน normalization แล้วลง curriculum **draft revision ที่มีอยู่แล้ว** ด้วยคำขอเดียว ทุกแถวเป็นบทเรียนในร่าง ไม่มีแถวใด publish เอง ที่มาและค่า D ราย Lesson เก็บใน `SchoolBotLesson.ImportSource` (jsonb NULL) ตาม [migration-002 Rev2](../db/migration-002-lesson-import-source.md) ซึ่งผู้ใช้อนุญาตวันที่ 2026-11-03 ให้เพิ่มเฉพาะคอลัมน์ ไม่มี index/CHECK/UNIQUE ใด ๆ — กฎรูปทรง JSON และการกันนำเข้าซ้ำจึงเป็นหน้าที่ application ทั้งหมดตามไฟล์นี้ ผลที่คาดราย case, ขอบเขต stub และความเสี่ยงอยู่ใน [persisted state และประตูระบบจริง](des-005-import-state.md)

AC ที่สัญญานี้รองรับ: AC-045-01 (เห็น draft พร้อมที่มาและความหมายว่าอนุมัติจากต้นทาง ไม่เผยแพร่เอง), AC-045-02 (เปลี่ยนเฉพาะคอลัมน์ O แล้วข้อมูลไม่เปลี่ยน), AC-045-03 (สื่อสองชุดอยู่ใน Lesson เดิม ไม่เกิด Course/Level ใหม่), AC-045-04 (รหัส Lesson แยกจากเลข C/Unit และคงเดิมเมื่อสลับลำดับ) ใน [REQ-045](../../modules/quiz/shared/requirements/req-045.md) ตาม [มติ 023 (นำเข้าทุกแถวเป็นร่าง; D=TRUE คือป้ายอนุมัติจากต้นทาง)](../../shared/decisions/decisions-023.md) และ [มติ 020 (หลักสูตรแบบ Level)](../../shared/decisions/decisions-020.md)

## 1. ImportSource เก็บอะไร และอ่านกลับทางไหน

**ค่าในคอลัมน์:** SQL NULL หรือ JSON object ที่มีสี่ key พอดี ไม่รับ JSON null ทั้งคอลัมน์, scalar, array หรือ key เกิน

| key | ชนิด | ความหมายและกฎ |
|---|---|---|
| `source_ref` | string 1–2048 ตัวอักษร ไม่ว่างหลัง trim | ที่มาของ batch ณ เวลานำเข้า (เช่น URL ของ Sheet) คัดลอกลงทุก Lesson ของ batch เก็บตรงตัวไม่ trim ไม่บังคับเป็น URL |
| `source_row_key` | string UUID รูป canonical lowercase (`D` format) | identity ของแถวจาก manifest ที่รับรองแล้ว ต้องเท่ากับ `LessonKey::text` ของแถวนั้นเสมอ |
| `source_approved` | `true` / `false` / `null` (key ต้องมีเสมอ) | ค่า D ณ เวลานำเข้า: true = อนุมัติจากต้นทาง, false = ต้นทางระบุว่ายังไม่อนุมัติ, null = ต้นทางไม่ระบุ ห้ามแปลง null เป็น false และไม่ใช่การอนุมัติหรือการเผยแพร่ของ SchoolBot |
| `row_hash` | string SHA-256 hex lowercase 64 ตัว | server คำนวณ (สูตรในข้อ 2) เป็น snapshot ของแถวต้นทาง ณ เวลานำเข้า ไม่ใช่ hash ของเนื้อหาปัจจุบันและไม่ใช่ unique key |

SQL NULL = บทเรียนนี้ไม่มีหลักฐานนำเข้าที่ยืนยันได้ (สร้างผ่าน content PUT หรือเป็นแถวก่อน migration) ไม่แปลว่าต้นทางไม่อนุมัติ ตัวอย่างสมมติ: `{"source_ref":"fixture:course-plan-096","source_row_key":"00000000-0000-4000-8000-000000000003","source_approved":true,"row_hash":"<64 hex>"}`

**ตรวจก่อนเขียน (application):** ค่าทุกตัวสร้างโดย codec เดียว `LessonImportSourceCodec` ใน Application (serialize จาก record ชนิดจริงสี่ property เรียง key ตามตารางข้างบน `source_approved` เขียน null ออกมาเสมอ) และก่อนส่งให้ adapter ต้อง parse ค่าที่ serialize แล้วกลับผ่านตัวตรวจเดียวกันให้ผ่าน: object สี่ key พอดี ชนิด/ความยาว/รูปตามตาราง และ `source_row_key == LessonKey` ส่วน `SchoolId` ของ Lesson ที่นำเข้าต้องเป็น NULL (เนื้อหากลาง) ห้ามเขียน `ImportSource` จากทางอื่นนอก importer

**การเก็บใน domain record:** `SchoolBotLessonRecord` เพิ่ม `string? ImportSource = null` ต่อท้ายพารามิเตอร์เดิม เก็บเป็น JSON string แบบ `SchoolBotActivityRecord.Config` และติด `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]` เพื่อให้ snapshot ของงานเดิมที่ไม่มีการนำเข้า serialize เป็น bytes เดิม (แนวเดียวกับ [การเก็บบน stub store ของ DES-010](des-010-stub-persistence.md#1-ที่เก็บ-ขยาย-snapshot-หลักสูตรเดิมเป็นหน่วยเดียว))

**อ่านกลับ:** `GET /v2/admin/curricula/{id}` (staff_admin) คืน `lessons[]` ที่มีฟิลด์เดิมของ `LessonInput` ครบ **บวก** `import_source:{source_ref,source_row_key,source_approved,row_hash}|null` ทุก Lesson (key มีเสมอ) อ่านจาก `Lesson.ImportSource` ด้วย codec เดียวกัน ไม่ fallback จาก publication approval, `Curriculum.SourceRef` หรือ `Audit.Reason` ค่าที่เก็บอยู่แต่ parse ไม่ผ่านถือเป็นข้อมูลเสีย: reader throw → `500` ตาม envelope เดิม ห้ามแสดงเป็น null เพราะจะกลายเป็น "ไม่มีที่มา" โดยเงียบ การแสดงผลตาม AC-045-01 = `lifecycle=draft`, `published_at=null`, `approval=null` คู่กับ `import_source.source_approved` (true = "อนุมัติจากต้นทาง ณ เวลานำเข้า")

Public `GET /v2/curricula/{id}` **ไม่เพิ่ม** `import_source` — JSON ของ public คงเดิมทุก byte ไม่ส่ง `source_ref` ให้ผู้เรียน (ตอนนี้ builder เดียวกันสร้างทั้งสอง view ผู้เขียนต้องแยกชนิด view ของ admin ออก) `GET /v2/admin/curricula` (รายการ) ไม่เปลี่ยน

## 2. Operation ของ importer และการกันนำเข้าซ้ำ

`POST /v2/admin/curricula/{id}/import` · staff_admin ที่มี `content_author` (สิทธิ์เดียวกับ content PUT) · header `Idempotency-Key:U` แบบเดียวกับ mutation อื่น ไม่ส่ง = ทำได้แต่ไม่รับประกัน replay · **ไม่ใช้ If-Match** เพราะ import ไม่แก้แถวเดิม (ดูทางเลือกท้ายไฟล์)

```text
CurriculumImportRequest = {
  source_ref: T2048,
  rows: [{                         // อย่างน้อย 1 แถว
    source_row_key: U,             // ต้องเท่ากับ lesson.lesson_key
    source_position: N,            // ใช้ชี้ error เท่านั้น ไม่เก็บ ไม่เข้า row_hash
    source_approved: B|null,       // [JsonRequired]: ต้องมี key, ค่า null ได้
    lesson: LessonInput            // DTO เดิมของ content PUT
  }]
}
200 CurriculumImportResponse = { id:K, update_date:D,
  lessons: [{ source_row_key:U, lesson_id:K, outcome:"created"|"unchanged" }] }  // เรียงตาม rows
```

คำขอนี้รับเฉพาะแถวที่ normalize แล้ว ไม่รับคอลัมน์ดิบของ Sheet: ตัว normalize (preview ฝั่ง application) ต้องตัด O ทิ้งก่อนสร้าง request จึงไม่มีทางที่ O ไปถึง commit (AC-045-02) สื่อ P–X ต้องอยู่ใน `activities[].config` แบบ `instruction-v1` ของ Lesson เดิม ไม่สร้าง Level/Course (AC-045-03) และต้องส่ง D แบบ `bool?` ตรงจากแถวดิบ — ห้ามใช้ `TransformedCoursePlanLesson.SourceApproved` ปัจจุบันที่ยุบ null เป็น false

**Idempotency** ตาม [สัญญาส่วนกลาง Rev4](idempotency-001.md): SchoolId=NULL · Principal=`staff_admin:{PrincipalId}` · Operation=`import_curriculum_lessons` · RequestHash = SHA-256 ของ `id + "|" + JsonSerializer.Serialize(request)` (สูตรเดียวกับ content PUT) · ResourceId = curriculum id · ETag = `OpaqueConcurrencyToken.ToETag(response.update_date)` (= `Curriculum.UpdateDate` หลัง commit) · status 200 · replay/conflict/expired ตามตารางกลางเดิม

**จุด commit (ตัดสินใน Rev3):** helper ที่ **ห้ามแก้** คือของส่วนกลางระดับ adapter — `IIdempotentSchoolBotCommit.CommitWithIdempotencyAsync<T>` (interface, `MutationResult<T>`, `IdempotentCommitResult<T>`), การ implement ใน `SchoolBotDbAdapter.Idempotency.cs` และ `CurriculumReplayCipher` ทั้งสามเป็น generic ต่อชนิด response อยู่แล้ว จึงรับ `CurriculumImportResponse` ได้ทันที ส่วน `CurriculumService.CommitMutationAsync` เป็น wrapper ระดับ application ของ BE-027 ซึ่งผูกชนิด `CurriculumMutationResponse` ไว้ ให้ทำดังนี้:

1. แยก core เป็น generic `private Task<TResponse> CommitMutationAsync<TResponse>(principal, operation, requestHash, key, httpStatus, mutate, Func<TResponse,(int Id, DateTimeOffset UpdateDate)> resource, ct)` ที่มีขั้น recheck (เรียก `principal.RecheckAsync` บน transaction + `switch` สิทธิ์ตาม operation) และการสร้าง `MutationResult<TResponse>(body, httpStatus, resource(body).Id, ToETag(resource(body).UpdateDate))` เหมือนเดิมทุกบรรทัด
2. คง `CommitMutationAsync` แบบเดิม (signature เดิม คืน `CurriculumMutationResponse`) เป็น wrapper บรรทัดเดียวที่ส่ง `b => (b.Id, b.UpdateDate)` — call site เดิมทั้งสี่ (create, revision, content PUT, publish) ห้ามแก้
3. importer เรียก core ด้วย `TResponse = CurriculumImportResponse`, httpStatus 200 และ `r => (r.Id, r.UpdateDate)` สิทธิ์ใน recheck เท่ากับ content PUT (`EvaluateUpdateCurriculumContent`) — จะเขียน arm `"import_curriculum_lessons"` ให้ชัดใน `switch` ก็ได้ แต่ผลต้องเท่ากับ default arm เดิม

**ข้อกำหนดที่ต้องคง:**
- ไฟล์ของ helper ระดับ adapter ข้างบนไม่มี diff
- operation เดิมทั้งสี่ยังใช้ `T = CurriculumMutationResponse` จึงได้ plaintext ของ ledger และ body ของ replay เป็น bytes เดิม test ของ BE-027 เดิมต้องผ่านโดยไม่แก้
- replay ของ import (key เดิม + RequestHash เดิม ภายใน `ReplayUntil`) คืน `CurriculumImportResponse` ที่ถอดจาก ledger — `id`, `update_date` และ `lessons[]` (ลำดับและ `outcome`) ตรงกับคำตอบครั้งแรก byte-for-byte ไม่คำนวณใหม่ (คำตอบครั้งแรกเป็น `created` replay ก็ยังเป็น `created` ไม่ใช่ `unchanged`) ไม่เรียก `mutate`, ไม่เขียน audit, ไม่แตะ UpdateDate
- `CurriculumImportResponse` และ record ของ `lessons[]` ต้อง round-trip ผ่าน `JsonSerializer` ค่าเริ่มต้น (ที่ cipher ใช้) โดยกำหนดชื่อด้วย `[JsonPropertyName]` บน type และให้ `outcome` เป็น string `"created"`/`"unchanged"` (ถ้าใช้ enum ต้องติด `JsonStringEnumConverter` บน type ไม่ใช่ใน options ของ API) — ห้ามพึ่ง options ระดับ API
- exception ใน `mutate` (`404`/`409`) ทำให้ไม่มีการเขียน domain, audit หรือ ledger ตามพฤติกรรมเดิมของ helper ส่วน `400 INVALID_INPUT` ตรวจก่อนเรียก commit

**row_hash** = SHA-256 hex lowercase ของ UTF-8 จาก `JsonSerializer.Serialize(RowHashPayload)` (options ค่าเริ่มต้นแบบ RequestHash) โดย `RowHashPayload` เป็น record เรียง property ตายตัว: `source_ref`, `source_row_key` (string lowercase), `source_approved` (true/false/null แยกกัน), `title`, `objective`, `instructions`, `missions`, `activities` จาก `lesson` — **ไม่รวม** `source_position` และ `lesson.ordinal` (ตำแหน่ง/ลำดับแสดง) และไม่มี O เพราะไม่อยู่ใน request เปลี่ยนรูป payload นี้ = hash ของทุกแถวที่เคยนำเข้าเปลี่ยน = breaking contract ต้องผ่าน arch และผู้ใช้ client ส่ง hash มาแทนไม่ได้

**ตรวจ input ก่อนเข้า commit** (ผิด = `400 INVALID_INPUT` ทั้ง batch ไม่เขียนอะไร): source_ref ตามตารางข้อ 1; rows ไม่ว่าง; `source_row_key` ไม่ใช่ `Guid.Empty` และเท่ากับ `lesson.lesson_key`; `source_position ≥ 1`; ห้าม `source_row_key` หรือ `lesson.ordinal` ซ้ำใน batch; ทุก Lesson ผ่านกฎ `ValidateContentInput` เดิม; Activity ที่ `config.kind = instruction-v1` ต้องมี `media_refs` ทุกตัวเป็น absolute URI scheme http/https ยาว ≤2048 รายละเอียด error ใช้ `details:{source_position,source_row_key,field}` ของแถวแรกที่ผิดใน envelope เดิม เกิน body limit เดิมของ API = ปฏิเสธทั้งชุด

**ค้นก่อนเขียนในหน่วยเดียว** — ทำใน `mutate` บน transaction-scoped facade ใต้ store lock เดียวกับ ledger ผ่านเมธอดใหม่ `ISchoolBotDbAdapter.ImportCurriculumLessonsAsync(curriculumId, rows, audit, ct)` ซึ่งเรียกบน root adapter แล้ว throw `InvalidOperationException` (ไม่มีทางเขียน import โดยไม่ผ่าน ledger):

1. curriculum ไม่มีหรือ `IsDelete` → `404 NOT_FOUND`; `Lifecycle ≠ draft` หรือ `PublishedAt` ไม่ NULL → `409 STATE_CONFLICT`
2. อ่าน Lesson **ทุกแถว** ของ curriculum นี้รวม `IsDelete=true` แล้วตัดสินรายแถวด้วย `LessonKey`:
   - ไม่พบ → `created`
   - พบ, ไม่ถูกลบ, `ImportSource` parse ผ่าน, `source_row_key` และ `row_hash` ตรง → `unchanged` (ไม่แตะแถวนั้น)
   - กรณีอื่นทั้งหมด (ImportSource NULL, ถูกลบ, hash ต่างเพราะเปลี่ยน D/เนื้อหา/สื่อ/source_ref, parse ไม่ผ่าน) → `409 STATE_CONFLICT` ทั้ง batch พร้อม `details:{source_row_key}` ไม่ overwrite/merge/skip/auto-attach
3. `ordinal` ของแถว `created` ต้องไม่ชน `Ordinal` ที่เก็บอยู่ของ Lesson อื่นที่ไม่ถูกลบใน revision → ชน = `409 STATE_CONFLICT`; แถว `unchanged` คง Ordinal เดิม (สลับลำดับในไฟล์ไม่ย้ายบทเรียนที่มีอยู่)
4. มีแถว `created` ≥1: เพิ่ม Lesson (+ Mission/Criteria/Activity ตาม mapping เดียวกับ content PUT, `SchoolId=NULL`), ตั้ง `Curriculum.UpdateDate=now` และ audit หนึ่งแถว `Event=Curriculum.LessonsImported`, `EntityType=SchoolBotCurriculum`, `EntityId=id`, `Reason="Curriculum lessons imported"` (ไม่ใส่ source_ref ลง Reason) · ไม่มี `created` เลย: ไม่แตะ domain/audit, UpdateDate/ETag คงเดิม แต่ helper ยังบันทึก ledger ของ key ใหม่ตามปกติ

**content PUT ต้องรักษา provenance:** `UpdateCurriculumContentAsync` ของ adapter ซึ่งแทน children ทั้งชุด ต้องคัดลอก `ImportSource` จาก Lesson เดิมของ revision ที่มี `LessonKey` เดียวกันไปยังแถวใหม่ `LessonInput` ไม่มี field นี้ client จึงตั้ง/ล้างเองไม่ได้ Lesson ที่ author ตัดออกจาก PUT หายไปพร้อม provenance (เป็นการกระทำชัดแจ้งที่มี audit `Curriculum.ContentUpdated`) การแก้เนื้อหาหลังนำเข้าไม่เปลี่ยน `row_hash` จึงนำเข้าไฟล์เดิมซ้ำได้ `unchanged` และไม่ทับงานของ author Published/retired children ไม่เปลี่ยนตามกฎเดิม และไม่ backfill ImportSource ย้อนหลัง

## ทางเลือกที่ไม่เลือก

| ทางเลือก | เหตุผล |
|---|---|
| create + content PUT สองคำขอ | ไม่ atomic และ content PUT ไม่รับ provenance |
| import แทน children ทั้งชุดแบบ content PUT | ทับงานที่ author แก้หลังนำเข้า และทำให้ dedup ด้วย row identity ไม่มีความหมาย |
| import สร้าง revision ใหม่ในคำขอเดียว | Sheet ไม่ได้กำหนด Level/ชื่อ revision ที่เชื่อถือได้; `create_curriculum` เดิมทำหน้าที่นี้แล้ว |
| บังคับ If-Match | retry ไฟล์เดิมด้วย key ใหม่หลังคำขอแรก commit จะได้ 412 แทนผล `unchanged`; import ไม่แก้แถวเดิมจึงไม่มี lost update ที่ ETag ต้องกัน |
| unique/partial index หรือ CHECK บน ImportSource | ผู้ใช้ไม่อนุญาต (มติ 2026-11-03 "เพิ่ม column ได้ แต่ไม่เพิ่ม index หรืออะไรทั้งนั้น") |
| เปิด `import_source` ใน public GET | ผู้เรียนไม่ต้องใช้ และเลี่ยงส่ง source_ref ออกนอกส่วนกลาง |
| ให้ `row_hash` รวม ordinal | สลับลำดับแล้วนำเข้าซ้ำจะ conflict ขัด AC-045-04 |
| importer เขียน commit path ของตัวเองแบบ `QuestionBankService.CommitAsync` (BE-030) | ต้องคัดลอกขั้น recheck บน transaction และ `switch` สิทธิ์ของ curriculum มาอีกชุด สองชุดจะเพี้ยนกันได้ ส่วน path ของ BE-030 ตรวจสิทธิ์จาก principal ที่ถือมาเท่านั้น ไม่ recheck ใน transaction จึงไม่ใช่แบบที่ควรลอกสำหรับ curriculum |
| แก้ helper ระดับ adapter หรือ cipher ให้รู้จัก import | ไม่จำเป็น เพราะ generic อยู่แล้ว และกระทบ BE-027/BE-030 ทุก operation |
| ใส่ผลราย Lesson ลงใน `CurriculumMutationResponse` | เปลี่ยน JSON ของ operation เดิมทั้งสี่ = breaking contract |

## ยังไม่ยืนยัน

- manifest ที่ผูก `source_row_key` กับแถว Sheet จริงและ mapping คอลัมน์ → `LessonInput`/`instruction-v1` ยังเป็นของ fixture `(สมมติฐาน — ยังไม่ยืนยัน)` ยืนยันเมื่อ content owner ส่ง manifest และผู้ใช้เซ็นเนื้อหา (G-LEARN)

## หลักฐาน

- [ผลเทียบกับโค้ดจริง Rev2](des-005-import-evidence.md) — file/line ของ DTO, transformer, content writer, reader, helper และ snapshot ตรวจ 2026-11-03 ไม่ได้รัน runtime หรือเชื่อมฐาน
- จุด commit (ตรวจโค้ดจริง 2026-11-03): `web/src/SchoolBot.Application/Abstractions/IIdempotentSchoolBotCommit.cs:10–24` (generic `MutationResult<T>` และ `CommitWithIdempotencyAsync<T>`) · `web/src/SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.Idempotency.cs:23–74` (replay ถอด `Decrypt<T>` ไม่เรียก mutate; exception ใน mutate ไม่เขียน ledger) · `web/src/SchoolBot.Infrastructure/Persistence/CurriculumReplayCipher.cs:26–49` (`JsonSerializer` ค่าเริ่มต้น) · `web/src/SchoolBot.Application/Curriculum/CurriculumService.Commit.cs:9–42` (wrapper ผูก `CurriculumMutationResponse`; default arm = `EvaluateUpdateCurriculumContent`) · call site เดิม `CurriculumService.Mutations.cs:29,102`, `CurriculumService.Content.cs:34`, `CurriculumService.Publish.cs:38` · แบบอ้างอิง BE-030 `web/src/SchoolBot.Application/Assessment/QuestionBankService.cs:64–89`
- [physical delta และรายการที่ vault ส่งให้ arch](../db/migration-002-lesson-import-source-contract.md) ข้อ 1–6 ถูกตรึงในไฟล์นี้ทุกข้อ; [supplied-row contract](learning-sheet-import-001.md) เป็นที่มาของรูป request และกฎ dedup
