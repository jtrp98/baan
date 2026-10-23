# อ่านฟิลด์ JSON ใน data model

[กลับคู่มือ](data-model.md) · [ตารางทั้งหมด](data-dictionary/index.md) · [นิยามชนิดข้อมูลเต็ม](data-dictionary/contract-index.md)

`jsonb` หมายถึงหนึ่งช่องในตารางเก็บข้อมูลหลายฟิลด์ด้านใน ตัวอย่างต่อไปนี้เป็นข้อมูลสมมติเพื่ออธิบายรูปแบบเดิม ไม่ใช่ข้อมูลที่นำเข้าฐานแล้ว และไม่ใช่ API request ครบชุด

## ชื่อ/คำอธิบายหลายภาษา: Text

ใช้ใน `Title`, `Objective`, `Instructions` ของเนื้อหากลาง เช่น:

```json
{"default_locale":"th","th":"รู้จักคำสั่งเดิน","en":"Movement commands"}
```

| ฟิลด์ย่อย | ใช้ทำอะไร |
|---|---|
| `default_locale` | ภาษาหลักของข้อความ ต้องมีข้อความภาษานั้นจริง |
| `th`, `en`, `zh` | ข้อความภาษาไทย อังกฤษ จีน; ภาษาที่ไม่ใช่ภาษาหลักอาจยังไม่มี |

นี่คือข้อความเนื้อหาบทเรียน ไม่ใช่ไฟล์คำแปลปุ่ม/เมนูของแอป

## กิจกรรมจะให้ทำอะไร: Activity.Config

`SchoolBotActivity.Type` บอกประเภทกิจกรรม ส่วน `Config.kind` บอกรูปแบบข้อมูลประกอบ:

| `kind` | ฟิลด์ด้านใน | ความหมาย |
|---|---|---|
| `instruction-v1` | `instructions`, `media_refs` | คำแนะนำแบบ Text และรายการอ้างอิงสื่อ |
| `project-v1` | `mission_id` | รหัส SchoolBotMission ที่เป็นโจทย์ของกิจกรรมนี้ |
| `question-v1` | `bank_id`, `question_keys`, `default_policy` | คลังข้อสอบ รายการข้อที่ใช้ และนโยบายเริ่มต้นของ Quiz/Test |

ตัวอย่างกิจกรรมแบบ project: `{"kind":"project-v1","mission_id":501}` หมายถึงให้ใช้โจทย์ SchoolBotMission รหัส 501 ไม่ใช่รหัส Project ของนักเรียน

## ข้อสอบและคำตอบ: Questions / Answers

`SchoolBotQuestionBank.Questions` เก็บรายการคำถาม `Question`; `SchoolBotAttempt.Answers` เก็บรายการคำตอบ `Answer` ที่นักเรียนเลือก

| ฟิลด์ย่อย | ความหมาย |
|---|---|
| `question_key` | UUID ของคำถาม ใช้อ้างคำถามเดิมข้าม revision; ไม่ใช่รหัสแถวของ QuestionBank |
| `kind` | `single_choice` = เลือกคำตอบเดียว, `boolean` = แบบสองตัวเลือก |
| `prompt` | โจทย์แบบ Text หลายภาษา |
| `options[].option_key` | UUID ของตัวเลือก |
| `options[].text` | ข้อความตัวเลือกแบบ Text |
| `correct_option_keys` | รายการเฉลย ฝั่ง server เก็บและไม่เปิดก่อนเวลาที่ policy อนุญาต |
| `max_score` | คะแนนเต็มข้อนี้ ส่งใน JSON เป็นข้อความเลขฐานสิบ เช่น `"5.000000"` |
| `selected_option_keys` | รายการรหัสตัวเลือกที่นักเรียนเลือกใน Answer ไม่ใช่คะแนนที่ client คำนวณเอง |

## กติกาทำข้อสอบ: AssessmentPolicy

ใช้ใน `Activity.Config.default_policy` และ `CourseRunActivity.PolicyOverride` ถ้า override เป็น NULL ให้ใช้ policy ที่มีผลตามสัญญาเดิม

| ฟิลด์ย่อย | ความหมาย |
|---|---|
| `max_attempts` | จำนวนครั้งปกติที่อนุญาต; NULL = ไม่จำกัดตาม policy |
| `selection` | เลือกผลครั้งไหน: `best` สูงสุด, `first` ครั้งแรก, `latest` ล่าสุด; สอบซ่อม Test มีกฎเฉพาะตาม DES-010 |
| `time_limit_seconds` | เวลาทำเป็นวินาที; NULL = ไม่จำกัดตาม policy; Test ต้องตั้งเวลาก่อน publish |
| `reveal` | `after_submit` แสดงผลตามสัญญาหลังส่ง, `after_close` หลังปิดกิจกรรม |
| `shuffle_questions` | สลับลำดับคำถามหรือไม่ |
| `shuffle_options` | สลับลำดับตัวเลือกหรือไม่ |

## น้ำหนักคะแนน: ScoringPolicy และ MappingSource

`SchoolBotScoringPolicy.Policy` เก็บนโยบายคะแนนของ CourseRun; `SchoolBotScoreMapping.Sources` เก็บว่าช่องคะแนนปลายทางหนึ่งช่องนำผลมาจากกิจกรรมใด

| ฟิลด์ย่อย | ความหมาย |
|---|---|
| `quiz_counts` | ให้นับ Quiz เป็นคะแนนหรือไม่; false บังคับน้ำหนัก Quiz เป็น 0 |
| `activity_weights[].activity_id` | รหัส SchoolBotActivity ที่มีน้ำหนักในนโยบายคะแนนรวม |
| `activity_weights[].weight_bps` | น้ำหนักเป็นจำนวนเต็ม: 10000 = 100%, 2500 = 25% ไม่ใช่ 2500 คะแนน |
| `formula_version` | weighted-normalized-v1 ตาม034; NULL ใช้เฉพาะร่างก่อนเปิดรอบ |
| `Sources[].activity_id` | รหัสกิจกรรมต้นทางของ mapping ช่องนี้ |
| `Sources[].indicator_key` | UUID ตัวชี้วัดที่เลือก; NULL เมื่อไม่แยกตัวชี้วัด |
| `Sources[].weight_bps` | น้ำหนักของแหล่งผลนั้นใน mapping; 10000 = 100% |

## Snapshot คือสำเนาข้อมูล ณ ตอนทำรายการ

| ฟิลด์ JSON | ทำไมต้องเก็บ |
|---|---|
| `SchoolBotAttempt.Snapshot` | เก็บข้อสอบ ลำดับ เฉลย policy และรุ่นตัวตรวจที่ใช้จริง เพื่อไม่ให้การแก้คลังข้อสอบเปลี่ยนข้อสอบที่เริ่มไปแล้ว |
| `SchoolBotGradeSlot.TargetSnapshot` | เก็บบริบทช่องเกรดเดิม เช่น ห้อง เทอม วิชา ช่องคะแนน คะแนนเต็ม และ token สำหรับตรวจว่าปลายทางเปลี่ยนหรือไม่ |
| `SchoolBotScorePreview.Context` | เก็บรุ่น mapping/policy รายชื่อนักเรียน รุ่น writer/calculator และเวลาตรวจสิทธิ์ที่ใช้สร้าง preview |
| `SchoolBotScorePreviewItem.Snapshot` | เก็บช่องคะแนนของนักเรียน: คะแนนเดิม ผลต้นทาง คะแนนใหม่ และ token/hash ที่ใช้ตรวจการแก้แทรก |
| `SchoolBotLevelProposal.Snapshot` | เก็บรายชื่อนักเรียน คะแนนรวม ค่าเฉลี่ย เกณฑ์ และ policy ที่ใช้เสนอเลื่อน Level ทั้งห้อง |

`hash` ใช้ตรวจว่าชุดข้อมูลเปลี่ยนหรือไม่ ส่วน `token` ใช้เทียบสถานะ/รุ่นข้อมูลตามสัญญานั้น ๆ การมี hash หรือ snapshot ไม่ได้แปลว่าระบบตรวจคะแนนหรือส่งคะแนนสำเร็จแล้ว

ดูทุกฟิลด์ย่อยและกฎที่ [สัญญาชนิดข้อมูล/JSON](data-dictionary/contract-index.md), [ข้อสอบ](des-010.md), [การส่งคะแนน](des-009.md) และ [เลื่อน Level](des-011.md)

## นิยามเพิ่มเติม

[ผลเรียน](learning-rules-032-034.md) นิยาม effective_policy/windows และ audit ผูก run; [คะแนน](grade-rules-032-034.md) นิยาม Sources หนึ่งรายการ, skipped_cells และ lock จาก snapshot

## Change Log
- 2026-10-23 — Rev2: sync032..034; SQL เดิม

- 2026-10-23 — นายช่างขยายคำอธิบาย JSON จาก data-model Rev5 และ DES-005/009/010/011 ตามคำติผู้ใช้ โดยคงรูปแบบข้อมูลเดิม
