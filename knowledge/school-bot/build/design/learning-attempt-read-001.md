# LUX-04 — discovery, saved answers, history และ policy

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

เอกสารนี้เป็นสัญญาทางเทคนิคสำหรับพัฒนาและทดสอบ local โดยใช้ขอบเขตและเงื่อนไขหยุดร่วมเดิม ยังไม่ใช่การอนุมัติ schema หรือหลักฐาน runtime ของระบบจริง

คง route create/GET/answers/submit เดิม เพิ่ม:

```text
GET /v2/attempts
  ?course_run_id:K
  &activity_id:K?
  &state:AttemptState?
  &limit
  &cursor
```

คืน `{items:AttemptSummary[],next_cursor}` เฉพาะนักเรียนเจ้าของจาก session ไม่มี `learner_id` ให้ client เลือก เรียง `StartedAt DESC, id DESC`; filter `started` ใช้ค้นหาครั้งค้าง ส่วน history ไม่กรอง state และรวม voided

```text
AttemptSummary = {
  id:K, update_date:D, sequence:N, state:AttemptState,
  course_run_id:K, activity_id:K,
  started_at:D, deadline_at:D|null, submitted_at:D|null,
  earned:DecimalString|null, max_score:DecimalString
}
```

เพิ่ม read-only fields ใน `AttemptView` เดิม:

```text
answers:Answer[]
effective_policy:AssessmentPolicy
opens_at:D|null
closes_at:D|null
bank_id:K
bank_revision:N
curriculum_revision:N
policy_id:K
evaluator_version:T128
server_now:D
```

ทุก field มาจาก `Answers`/`Snapshot` เดิม รวม effective policy/windows ที่กำหนดแล้วใน [กฎผลเรียนและ policy](learning-rules-032-034.md) ไม่เพิ่มคอลัมน์ ไม่สร้าง policy ใหม่จากค่า default ตอน resume

เพิ่ม read ก่อนเริ่มเพื่อรองรับ signed UX:

```text
GET /v2/course-runs/{id}/activities/{activity_id}
→ {
  course_run_id:K, activity_id:K,
  opens_at:D|null, closes_at:D|null,
  effective_policy:AssessmentPolicy,
  update_date:D
}
```

Desktop `student` อ่านได้หลังตรวจ membership ของ run; ครู `school_web` ตาม authority เดิม อ่านก่อนเริ่มเป็นข้อมูลประกอบเท่านั้น POST attempt ต้อง resolve/re-check อีกครั้งและคืน snapshot ที่ใช้จริง

**คำตอบและเฉลย**

- answers PUT/submit เป็น **full replacement** ของคำตอบชุดที่ส่ง ไม่ใช่ merge แฝง; ข้อที่ไม่อยู่ใน array คือไม่ได้ตอบ
- key คำถามต้องอยู่ใน snapshot, selected option ต้องอยู่ในข้อเดียวกัน, ไม่ซ้ำ; รุ่นนี้เลือกได้ 0 หรือ 1 ตัว ผิด → `400 ANSWER_INVALID`
- `questions` เรียงตาม `question_order`/`option_order` เดิม; ห้ามสุ่มใหม่ตอน GET
- `earned` และ `feedback` ใช้ reveal gate เดียวกัน ตาม UX ที่ระบุซ่อนทั้งคะแนนและเฉลยก่อนปิดสอบ
- `after_submit`: เปิดเมื่อ submitted หรือ expired ที่ตรวจเสร็จแล้ว
- `after_close`: เปิดเมื่อ terminal และ server time ถึง `Snapshot.closes_at`; ห้ามใช้เวลาปิดที่ครูเพิ่งแก้
- ถ้า `reveal=after_close` แต่ไม่มีขอบปิดที่ตีความได้ ให้ `409 POLICY_NOT_CONFIGURED` ก่อนสร้าง attempt ไม่ใช้ deadline เป็นวันเปิดเฉลยโดยเดา
- สถานะ voided ไม่ถูกนำไป selection; ไม่เปิด answer key ผ่าน raw snapshot
- employee Cloud ปฏิเสธ `403 PROFILE_NOT_ALLOWED` รวม retry/worker/import path ตามกฎเดิม

**พร้อม local:** DTO, list/discovery, resume, saved answers, history, reveal และ pre-start policy ด้วย authority fake  
**ยังไม่พร้อมเชื่อมจริง:** authority resolver และ owner-reviewed HTTP API Gateway → SchoolBot gRPC service

## ชนิดข้อมูลที่ใช้

ชนิดย่ออ้าง [สัญญาชนิดข้อมูลกลาง](data-dictionary/contract-001.md): `K` คือรหัส int4 ช่วง 1–2147483647; `I` คือ signed int32; `N` คือ integer ≥1; `U` คือ UUID; `B` คือ boolean; `D` คือเวลา UTC; `H` คือ SHA-256 hex 64 ตัว; `Tn` คือ Unicode string ยาวไม่เกิน n; `A` คือตัวตนผู้ทำรายการตามช่องทาง; `?`/`null` คือค่าว่าง และ `[]` คือ array ส่วน `DecimalString` เป็นเลขฐานสิบไม่ติดลบใน JSON string ไม่เกินหกตำแหน่งทศนิยม

## หลักฐาน

- E01 — ที่มาของขอบเขตและเงื่อนไขร่วม: planning/arch-091-learning-001.md (memory) เอกสารนี้คงข้อเสนอเดิม ไม่ได้ตรวจ source หรือ runtime ใหม่

หลักฐานอ้างอิงเดิมของ effective policy: `design/learning-rules-032-034.md:21`
