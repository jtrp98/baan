# DES-010 — Question Bank, Attempt และนโยบายคะแนน — Activity และนโยบายข้อสอบ

> Rev 5 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-010 — Question Bank, Attempt และนโยบายคะแนน](des-010.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `U` = UUID; `N` = integer ≥1; `B` = boolean; `D` = UTC instant; `Tn` = ข้อความยาวไม่เกิน n ตัวอักษร ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## อ้างอิง

- [มติ 024 (เกณฑ์เลื่อน Level และ policy Quiz/Test)](../requirement/decisions-024.md)
- [REQ-047 (การนับคะแนน Quiz รายหลักสูตร)](../requirement/req-047.md)
- [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../requirement/decisions-025.md)
- [มติ 026 (อนุมัติ amendment-proposal-001/002 เป็น baseline ใหม่)](../requirement/decisions-026.md)

## Activity และนโยบายข้อสอบ

quiz/test อยู่ที่ Activity (`Config={kind:"question-v1",bank_id:K,question_keys:U[],default_policy:AssessmentPolicy}`)
AssessmentPolicy={max_attempts:N|null,selection:best|first|latest,time_limit_seconds:integer>=1|null,reveal:after_submit|after_close,shuffle_questions:B,shuffle_options:B}

ค่าเริ่มต้นเมื่อสร้าง Activity (decisions-024):
- quiz: `{max_attempts:null, selection:"best", time_limit_seconds:null, reveal:"after_submit", shuffle_questions:false, shuffle_options:false}`
- test: `{max_attempts:1, selection:"first", time_limit_seconds:<ต้องตั้งต่อ test>, reveal:"after_close", shuffle_questions:true, shuffle_options:false}` (test ไม่ตั้ง `time_limit_seconds` publish ไม่ได้)

CourseRunActivity (ต่อห้อง) = `{course_run_id, activity_id, opens_at:D|null, closes_at:D|null, policy_override:AssessmentPolicy|null}`; ครูเปลี่ยนเฉพาะ time_limit_seconds และ opens_at/closes_at; field อื่นต้องเท่าค่าส่วนกลาง มิฉะนั้น 403 POLICY_OVERRIDE_NOT_ALLOWED; ตรวจ window ตาม [กฎผลเรียน](learning-rules-032-034.md)

ScoringPolicy (ต่อ CourseRun, REQ-047) = `{quiz_counts:B, activity_weights:[{activity_id:K,weight_bps:0..10000}], formula_version:T64|null}`
`quiz_counts=false` บังคับน้ำหนัก quiz เป็น 0 และใช้ส่งคะแนนไม่ได้; น้ำหนักรวม 10000; ใช้ weighted-normalized-v1 และ freeze CurrentPolicyId เมื่อเริ่ม CourseRun ตาม [กฎผลเรียน](learning-rules-032-034.md); NULL คือร่างเปิดรอบไม่ได้ ไม่ใช่รอมติ

## สอบซ่อม (retake — ยืนยันตาม decisions-025 และ decisions-026)

ครูรายวิชาเปิดสอบซ่อมรายคนได้ (`SchoolBotRetakeGrant`): 1 ใบ = สิทธิ์เพิ่ม 1 attempt เกิน `max_attempts` สำหรับนักเรียน/กิจกรรมนั้น
**ผลที่ใช้หลังสอบซ่อม (ยืนยันตาม [decisions-025](../requirement/decisions-025.md) และ [decisions-026](../requirement/decisions-026.md))**: การสอบซ่อม Test ใช้**คะแนนสูงสุด (`best`) ระหว่างครั้งจริงกับครั้งสอบซ่อม โดยไม่มีเพดานคะแนน**

