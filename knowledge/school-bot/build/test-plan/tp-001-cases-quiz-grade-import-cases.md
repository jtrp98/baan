# TP-001 — เคสนำเข้า Course Plan ของ BE-028

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — expected state และป้าย normal/full ของ importer)

ใช้ [setup/fixture](tp-001-cases-quiz-grade-import.md) บน 1 host/process, services/adapters A/B และ reader C ทุกผล runtime NOT_RUN; AC = Acceptance Criteria (เกณฑ์ตรวจรับ) normal ใช้ integration บน stub ร่วมกับ unit ของ normalization ไม่มี fault injection แต่ละแถวเริ่ม S0/S1 ใหม่

<a id="tp001-062-detail"></a>

## TP001-062 — นำเข้าและอ่านกลับ

| Case / ระดับ / AC และ Business Rules (BR) | Setup และขั้นตอน | Response + persisted state ผ่าน C |
|---|---|---|
| A + อ่านกลับ · ระดับ: normal · AC-045-01/03/04; BR-045-01/03/04/05 | รัน memory/file แยกกัน; จาก S0 ให้ A normalize base, import k1 แล้ว C GET `/v2/admin/curricula/{id}` | import 200 created ×3 ตามลำดับ request ได้ lesson_id ใหม่ 3 ค่า; GET 200 draft/published_at=null/approval=null; Curriculum revision เดิม 1, Level 1, Lesson 3/Activity 3/Mission 0/Criteria 0/audit 1/ledger 1 = S1 |
| D · ระดับ: normal · AC-045-02; BR-045-02 | memory/file จาก S1; normalize base/o เทียบ DTO bytes แล้ว B import o ด้วย k3 ใหม่; C อ่าน | DTO bytes เท่ากัน (ไม่มี O ใน DTO/hash); 200 unchanged ×3, lesson_id/ETag เดิม; Lesson 3/Activity 3/audit 1/ledger 2; revision/Level/เนื้อหา/provenance/UpdateDate เดิม |
| E · ระดับ: normal · AC-045-04; BR-045-04 | memory/file จาก S1; B normalize reorder (5,3,4) แล้ว import k4 ใหม่; C อ่าน | 200 unchanged ×3 ตามลำดับ request; lesson_id/LessonKey เดิมตามแถวต้นทาง; Ordinal ที่เก็บยัง 1..3; Lesson 3/Activity 3/audit 1/ledger 2; revision/Level/ETag/provenance เดิม |
| P · ระดับ: normal · AC-045-04; BR-045-04 | memory/file จาก S1 ให้ A POST `/v2/admin/curricula` ด้วย CurriculumKey/Level เดิม, revision=2, title/source_ref/recommended_grades/subjects เดิม และ UUID ใหม่; C เก็บ baseline หลัง create แล้ว B import base เข้า id ใหม่ด้วย UUID ใหม่ | create 201; import 200 created ×3; C อ่านทั้งสอง revision: LessonKey เดิม แต่ lesson_id คนละค่าระหว่าง revision; revision 2 draft มี Lesson 3/Activity 3/audit import +1/ledger import +1 จาก baseline; รวม Curriculum 2/Lesson 6/Activity 6/audit 3/ledger 3; revision 1 และ Level เดิม |

หลัง A อ่าน C ยืนยัน `import_source` ทุก Lesson: source_ref=`fixture:course-plan-096`, source_row_key=LessonKey, source_approved ของแถว 3/4/5 = true/false/null แยกกัน; row_hash เป็น lowercase SHA-256 64 ตัวตามสูตร des-005-import Rev2 §2 และ codec parse ผ่าน ค่า C=6 กับ Unit=7 ไม่ใช่ LessonKey ของแถว 3; Activity แถวนี้มี media_refs 5 ค่า J/L/N/T/X ใน Lesson เดียว ไม่สร้าง Curriculum/Level จาก P–X และไม่มี publish audit

audit ของ A: Event=`Curriculum.LessonsImported`, EntityType=`SchoolBotCurriculum`, EntityId=id, Reason=`Curriculum lessons imported`; ledger ใช้ SchoolId=NULL, Principal ของ staffAuthor, Operation=`import_curriculum_lessons`, ResourceId=id และผลเข้ารหัส 200/ETag ตรง response; A เปลี่ยน UpdateDate เป็นเวลานำเข้า ส่วน B/C/D/E คง UpdateDate/ETag ของ S1 การอ่านไม่เพิ่ม state

<a id="tp001-093"></a>

## TP001-093 — อ่านผลนำเข้าซ้ำหลังเปิด file adapter ใหม่

AC-045-01..04 ตามความหมายใน setup · ระดับ integration บน file store; ใช้ A/B สอง services/adapters กับ store objects สองตัว directory เดียวและ reader C ที่สาม เริ่ม S1 แยกใหม่ต่อแถว เก็บ response bytes/ETag ของ A และ snapshot baseline ก่อน dispose A/B แล้วสร้าง service/adapter/store ใหม่ใน directory เดิม คง cipher/key/actor/fake clock; ไม่มี fault injection และไม่ฆ่า process

| Case / ระดับ | ขั้นตอน | Response + persisted state ผ่าน C |
|---|---|---|
| B · ระดับ: normal | B ที่ reopen import base ด้วย k1 เดิม | 200 status/body/ETag เดิมทุก byte; Lesson 3/Activity 3/audit 1/ledger 1; IDs/provenance/revision/Level/UpdateDate เดิม ไม่ mutate ซ้ำ |
| C · ระดับ: normal | B ที่ reopen import base ด้วย k2 ใหม่ | 200 unchanged ×3, lesson_id/ETag เดิม; Lesson 3/Activity 3/audit 1/ledger 2; revision/Level/UpdateDate/provenance เดิม; ledger ใหม่เก็บผล unchanged ของ k2 |

## รายการสำหรับ full pass

รายการนี้เป็นชื่อเคสเท่านั้น ยังไม่ขยาย setup ในใบงาน normal; F–L/O อยู่ใต้ TP001-062, M/N อยู่ใต้ TP001-093 ตาม des-005-import-state Rev1 §1

| Case / ระดับ | สิ่งที่ตรวจและ AC |
|---|---|
| F · ระดับ: full | reorder ใช้ k1 เดิม → 409 IDEMPOTENCY_CONFLICT; AC-045-04 |
| G · ระดับ: full | identity เดิมเปลี่ยน D/สื่อ/source_ref → 409 STATE_CONFLICT ทั้ง batch; AC-045-01/03/04 |
| H · ระดับ: full | batch ผสมแถวเดิมกับใหม่ → unchanged/created ไม่เขียนซ้ำ; AC-045-04 |
| I · ระดับ: full | LessonKey ชนแถว ImportSource=NULL → conflict ไม่ยึด provenance; AC-045-01/04 |
| J · ระดับ: full | import เข้า published revision → conflict; AC-045-01 |
| K · ระดับ: full | identity/ordinal/position/สื่อ/JSON ผิดรูปหรือเกิน input bounds → 400 ทั้ง batch; AC-045-01/03/04 |
| L · ระดับ: full | preview ทุก variant ไม่เรียก commit และ zero writes; AC-045-01..04 |
| M · ระดับ: full | A/B แข่ง key ต่างใต้ lock ร่วม → created/unchanged ไม่เพิ่มแถวซ้ำ; AC-045-04 |
| N · ระดับ: full | ตัด response หลัง commit แล้ว reopen retry → replay ไม่เขียนซ้ำ; AC-045-01..04 |
| O · ระดับ: full | content PUT หลัง import รักษา ImportSource ตาม LessonKey; AC-045-01/04 |
| ImportSource เสีย · ระดับ: full | admin reader พบ ImportSource ผิดรูป → 500 ห้าม fallback เป็น null; AC-045-01 |

## ประตูและความเสี่ยง

stub พิสูจน์เฉพาะ process เดียว ไม่รับรอง PostgreSQL transaction/หลาย host, jsonb/identity จริง หรือ process-kill durability; ผู้ใช้ต้องรัน migration-002, PostgreSQL รอ DBA-003/G-CORE, เนื้อหา/manifest จริงรอ G-LEARN และตัวตน/transport จริงรอ H5 ความเสี่ยงไม่มี DB constraint ตาม des-005-import-state §3 ยังเปิด ไม่มีการรับความเสี่ยงแทนผู้ใช้

## หลักฐาน

- [REQ-045 (กฎและ AC นำเข้า)](../../modules/quiz/shared/requirements/req-045.md), [import Rev2](../design/des-005-import.md), [state Rev1 §1](../design/des-005-import-state.md#1-ผลที่คาดราย-case)
- [API Rev11](../design/des-005-api.md), [idempotency Rev4](../design/idempotency-001.md), [migration-002 Rev2](../db/migration-002-lesson-import-source.md)
