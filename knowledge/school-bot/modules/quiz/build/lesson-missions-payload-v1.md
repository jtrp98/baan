# Lesson Missions · สัญญา payload Rev 1

2026-11-05 · ร่างโดย นายช่าง · สำหรับตรวจ Backend, Gateway, Desktop และเว็บครู · รออนุมัติ basis รอบใหม่

[Proto สำหรับตรวจ](lesson-missions-v1.draft.proto) · [สัญญาระบบ F3](lessons-missions-contract.md) · [DDL Rev 8 และผล catalog](../../../build/db/migration-003-lessons-missions.md)

## `SchoolBotActivity.Config`

คง key เดิมของกิจกรรม และเพิ่ม object `lesson_mission` เฉพาะกิจกรรมที่ Admin เลือกให้ขึ้นแผนที่ ใช้ `ActivityKey` เป็น `stage_key` และ `ActivityId` เป็น ID ของแถวใน revision ที่เผยแพร่ คีย์ของด่านคงเดิมเมื่อเผยแพร่ revision ใหม่ ระดับของด่านอ่านจากหลักสูตร ส่วนเทอมและตำแหน่งอ่านจาก object นี้

```json
{
  "lesson_mission": {
    "version": 1,
    "term_no": 1,
    "position": 3,
    "completion_rule": { "kind": "score_threshold", "minimum_score": "3" },
    "require_pass_for_next": true,
    "scoring": { "kind": "points", "star_thresholds": ["3", "4", "5"] },
    "questions": []
  }
}
```

ตัวอย่างย่อ `questions` ใน Quiz จริงต้องมี 5–8 ข้อ กิจกรรม `instruction` ใช้เนื้อหาในบทเรียน กิจกรรม `project` ใช้ `mode` เดิมที่เป็น `arm` หรือ `block` และตรวจ `mission_key`/เกณฑ์ผ่าน `project-v1` เดิม กิจกรรม `quiz` ใช้ `questions` ใน object นี้ `test` แบบมีเวลาคงเส้นทางเดิม

- `term_no` รับ 1 หรือ 2 และ `position` เป็นจำนวนเต็มบวกที่ไม่ซ้ำภายในเทอม เรียงจากเทอม 1 ไป 2 โดยอิงข้อมูลที่เผยแพร่ แต่ละ Level ใช้สาย `CurriculumKey` ที่มีแผนที่เผยแพร่ได้หนึ่งสาย เลือก published revision ล่าสุดภายในสายเดียวกัน หากพบหลายสายให้แจ้ง `CONFLICTING_PUBLISHED_MAP` ตอนเผยแพร่
- `completion_rule.kind` เป็น `complete`, `submit`, `teacher_approval` หรือ `score_threshold` ใช้ `submit` และ `teacher_approval` กับโปรเจกต์ที่มีเส้นทางรับงานเดิม `score_threshold` ต้องเปิดคะแนนและกำหนด `minimum_score` ในช่วงคะแนนของกิจกรรม ส่วน `complete` ใช้การจบตามประเภท เช่น ตอบ Quiz ครบหรือส่งงานครบ
- `scoring.kind` เป็น `none` หรือ `points` Quiz แบบ `points` ใช้คะแนนต่อข้อ ส่วน Lab ใช้คะแนนและคะแนนเต็มจากผู้ตรวจงานเดิม เงื่อนไขตามคะแนนของ Lab ใช้ได้เมื่อเกณฑ์ของกิจกรรมนั้นกำหนดผลคะแนนเต็มไว้เพื่อ validate ตั้งแต่เผยแพร่ `star_thresholds` เป็นตัวเลือกที่มีสามค่าเรียงจากน้อยไปมาก ใช้หน่วยเดียวกับคะแนนด่าน คะแนนและเกณฑ์เป็น decimal string สูงสุด 6 ตำแหน่งตาม Rev 8
- `require_pass_for_next` ใช้กับด่านถัดไปทันทีในลำดับเผยแพร่ แม้ข้ามเทอม การเริ่มรอบใหม่ตรวจเงื่อนไขล่าสุด การซิงก์รอบเดิมใช้ ActivityId และสิทธิ์ของ revision ที่เริ่ม

## Quiz และการแสดงเนื้อหา

ทุกข้อมี `question_key` UUID, `kind`, `prompt` (`{th,en,zh}` เท่าที่มี), `explanation` สำหรับเฉลย และ `points` เมื่อเปิดคะแนน ใช้ `media_ref` ที่อ้าง asset จากระบบสำหรับภาพโจทย์หรือภาพตัวเลือก ค่าเก็บเป็น key คงที่ของตัวเลือกและชิ้นงาน

| `kind` | ข้อมูลใน config | คำตอบที่ส่ง |
|---|---|---|
| `choice` | `choices[]` มี `key`, `label` หรือ `media_ref` และ `correct_choice_key` | `choice_key` หนึ่งตัว |
| `order` | `items[]` มี `key`, `label` และ `correct_order[]` ที่ใช้ทุก key ครั้งเดียว | `order.item_keys[]` เรียงครบทุกชิ้น |
| `match` | `slots[]`, `items[]` มี `key`, `label`, optional `media_ref` และ `correct_by_slot` | `match.by_slot` จับคู่ key ครบและไม่ใช้ชิ้นซ้ำ |
| `slider` | `axes[]` มี `key`, `label`, `min`, `max`, `step` และ `target_degrees_by_axis`, `tolerance_degrees_by_axis` | `slider.degrees_by_axis` ค่าจำนวนเต็มครบทุกแกน อยู่ในช่วงและตาม step |

เลือกตอบถูกเมื่อ key ตรง เรียงและจับคู่ถูกเมื่อครบทั้งข้อ สไลเดอร์ถูกเมื่อทุกแกนอยู่ใน tolerance ของโจทย์ ผู้เผยแพร่กำหนดเกณฑ์และคะแนนได้ตามโจทย์ ร่างนี้ใช้ all-or-nothing ต่อข้อและใช้ config ต่อโจทย์ จึงมีจุดให้ผู้ใช้ปรับกติกานี้ก่อนลงมือ

`Prepare.content_json` ออนไลน์ส่ง `{version, activity_kind, title, instructions, questions}` ตามชนิด ให้ Quiz ส่ง prompt และตัวเลือกโดยตัดเฉลย ค่าเป้าแบบตัวเลข และ `explanation` ออก ส่งคำอธิบายกับคำตอบที่ถูกเฉพาะใน `CheckAnswer` หลังรับคำตอบข้อนั้น ผู้ใช้ตรวจได้ครั้งเดียวต่อข้อ ตามลำดับที่เผยแพร่ การส่งคำตอบเดิมซ้ำคืนผลเดิม คำตอบเปลี่ยนคืน `ANSWER_ALREADY_CHECKED` เก็บคำตอบและผลตรวจลง `CompletionEvidence` ของ attempt ผ่าน transaction เดิม

ชุดออฟไลน์ที่ออกพร้อมสิทธิ์ใช้ `content_json` โครงเดียวกันและมี `offline_answer_key` สำหรับตรวจในเครื่อง ประกอบด้วย key, คำตอบและคำอธิบายตามข้อ เซิร์ฟเวอร์ตรวจจาก revision เดิมอีกครั้งตอนซิงก์ ทั้งสองเส้นทาง curriculum สำหรับนักเรียนต้องตัด `lesson_mission` ที่มีเฉลยออกจาก `Activity.Config` ก่อนคืน response โดยเก็บคีย์เดิมที่ caller ใช้ไว้ Admin ที่มีสิทธิ์แก้ config อ่านฉบับเต็มได้

## เวลาออฟไลน์และ `StartEvidence`

1. แอปส่ง `clock_session_key` UUID ที่คงที่ในรอบการบูตเดียว และจดค่า monotonic ตอนส่ง `Prepare` กับตอนรับ response เมื่อส่ง key มาบริการอาจออก grant แบบลงนาม ประกอบด้วย `grant_key`, ตัวตนโรงเรียน/นักเรียน/ห้อง, fingerprint กุญแจอุปกรณ์ที่ Gateway ตรวจ, `activity_id`, `clock_session_key`, `anchor_utc`, `start_before_utc` และ `sync_before_utc` เฉพาะด่านที่มีสิทธิ์เริ่มและเก็บเนื้อหาออฟไลน์ได้
2. เมื่อเริ่ม ให้ Host จด `started_ms` ด้วย monotonic clock เดียวกันและส่งทั้งสามค่าตาม `LessonMissionOfflineStart` ตรวจว่า `request_sent_ms <= response_received_ms <= started_ms` และ key ตรงกับ grant เซิร์ฟเวอร์กำหนดค่าความคลาดเคลื่อนและช่วงเวลาสูงสุดเอง โดยปฏิเสธค่าติดลบหรือ overflow ช่วงเวลาเริ่มประมาณจาก `[anchor + (started_ms - response_received_ms) - drift, anchor + (started_ms - request_sent_ms) + drift]` เทียบกับสิทธิ์และเวลาปิดของเซิร์ฟเวอร์ หาก boot เปลี่ยนหรือหลักฐานเวลายืนยันไม่ได้แต่ grant และบัญชีถูกต้อง ให้เก็บ `needs_review`
3. `StartEvidence` เวอร์ชัน 1 เก็บ `grant_key`, `clock_session_key`, ค่า monotonic สามค่าเท่าที่มี และ `reason` สำหรับกรณีต้องตรวจ เก็บช่วงเวลาที่คำนวณแล้วใน `StartedAtLowerBound`/`StartedAtUpperBound` เก็บเวลาที่เซิร์ฟเวอร์รับใน `StartReceivedAt` ส่วน token ดิบมีเฉพาะในคิวเครื่องและคำขอซิงก์ เซิร์ฟเวอร์ใช้ bounds ตัดสินการเปิดคืนตามกติกา Rev 8 หลักฐานเวลาเป็นค่าที่ Host รายงาน จึงยังต้องตรวจความสมเหตุสมผลฝั่งบริการ

## พฤติกรรม gRPC ที่ใช้ร่วมกัน

| RPC | ผู้เรียกและผล |
|---|---|
| `ListLevels`, `GetMap` | นักเรียนที่ยืนยันตัวตนแล้ว ระดับ 1–6 มีครบและเรียงตาม Level แผนที่ว่างส่ง `stages: []` แต่การโหลดความคืบหน้าล้มเหลวส่ง error หรือเว้นค่าที่ไม่ทราบตามสัญญา `availability` และ `progress` แยกกันตามสัญญา F3 |
| `Prepare` | นักเรียน โหลดเนื้อหาตาม `activity_id` และขอ grant เมื่อส่ง `clock_session_key` ใช้ตัวตนและอุปกรณ์จาก metadata ที่ตรวจแล้ว |
| `Sync` | นักเรียน เริ่มอย่างเดียว จบอย่างเดียว หรือเริ่มพร้อมจบในคำขอเดียว ใช้ `attempt_key` UUID จากเครื่องซ้ำเมื่อ retry การเริ่มออนไลน์เว้น `offline` การจบ instruction ส่ง `instruction_completed: true` การจบ Lab อ้าง `submission_id` ของงานที่ส่งผ่านเส้นทางเดิม และตรวจผู้ส่ง ด่าน และ revision การจบ Quiz ออนไลน์ใช้คำตอบที่เคยตรวจแล้ว ออฟไลน์ส่งคำตอบครบเรียงตามข้อ ทุกการเขียนเริ่ม/ผลและเปิดคืนที่เกี่ยวข้องใช้ transaction เดียวกัน |
| `CheckAnswer` | นักเรียนเจ้าของรอบที่เริ่มออนไลน์ ตรวจหนึ่งข้อ ส่งเฉลยหลังบันทึกคำตอบของข้อนั้น |
| `GetClassroom` | ครูที่มีสิทธิ์ห้อง อ่านสถานะเทอม/ด่านและผลนักเรียน ใช้ cursor ตาม learner ID และจำกัดหน้าไม่เกิน 100 คน ผลตรวจ Arm/Block ใช้เส้นทาง `ReviewSubmission` เดิม |
| `SetClassroomAccess` | ครูที่มีสิทธิ์ห้อง ส่ง `event_key` เพื่อ retry และ `expected_event_id` ของขอบเขตจากการอ่านล่าสุด ใช้ค่าว่างเมื่อขอบเขตยังไม่มีเหตุการณ์ บริการเช็กเงื่อนไขพร้อม lock ตามโรงเรียน การปิดเทอมตรวจทุกด่านในเทอม และบล็อกปิดเมื่อพบการเริ่มที่รับแล้ว |

ค่าระบุ UUID ส่งเป็นข้อความมาตรฐาน เวลาเป็น ISO 8601 พร้อม offset `StageKey` ที่หายหมายถึงทั้งเทอม แยก `StartStatus` เป็น `accepted`, `needs_review`, `rejected` และ `ProgressState` ตามสัญญา F3 รหัสข้อผิดพลาดแยก `NOT_FOUND`, `UNAUTHORIZED`, `ALREADY_STARTED`, `STATE_CONFLICT`, `REPLAY_CONFLICT`, `ANSWER_ALREADY_CHECKED` ตามช่องทางเดิม รายละเอียด route และ HTTP mapping ตรวจที่ Gateway gate

**ขอบเขต rollout ที่เสนอ** ให้ Backend เป็นเจ้าของ proto และสัญญา payload นี้ ใช้สำเนาตรงกันใน Gateway เมื่อผ่าน transport gate ส่วน `DatabaseSelfCheck/Program.cs` อยู่ในชุด Backend เดียวกับ EF mapping ให้ตรวจเพิ่ม Attempt 20 และ AccessEvent 13 บน model รวม 34 ตาราง 483 properties ของ baseline นี้ เครื่องมือใช้ synthetic connection และตรวจว่าไม่มีการเปิด connection
