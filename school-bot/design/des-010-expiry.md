# DES-010 — Question Bank, Attempt และนโยบายคะแนน — ข้อผิดพลาด

> Rev 5 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-010 — Question Bank, Attempt และนโยบายคะแนน](des-010.md)

## อ้างอิง

- [มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../requirement/decisions-042.md)
- [REQ-046 (Quiz/Test และคลังข้อสอบแบบ revision)](../requirement/req-046.md)
- [BR-046-07 (หมดเวลาปิด attempt ตรวจคำตอบที่ server บันทึกทัน; ข้อว่าง 0 เต็มทั้งชุด ไม่รับย้อนหลัง แยกจาก submit)](../requirement/req-046.md)
- [AC-046-07 (Test 10 ข้อละ 1; บันทึกทัน 6 ถูก 4; หมดเวลาไม่ส่งได้ 4/10 ไม่รับคำตอบช้า นับครั้ง/สิทธิ์ซ่อมตาม policy/snapshot เดิม)](../requirement/req-046.md)

## ข้อผิดพลาด

400 INVALID_INPUT, ANSWER_INVALID
401 UNAUTHORIZED, SESSION_EXPIRED
403 FORBIDDEN, SCHOOL_MISMATCH, SUBJECT_PERMISSION_REQUIRED, STAFF_ROLE_REQUIRED, CHANNEL_NOT_ALLOWED, PROFILE_NOT_ALLOWED, LICENSE_REQUIRED
404 NOT_FOUND
409 CONTENT_NOT_PUBLISHED, FOUR_EYES_REQUIRED, POLICY_NOT_CONFIGURED, QUESTION_KIND_UNSUPPORTED, ATTEMPT_LIMIT_REACHED, ATTEMPT_EXPIRED, ACTIVITY_NOT_OPEN, ACTIVITY_CLOSED, SCORING_POLICY_FROZEN, SCORING_WEIGHT_INVALID, STATE_CONFLICT, SOURCE_NOT_SCORABLE
412 VERSION_CONFLICT (`UpdateDate` ไม่ตรง `If-Match`)
428 PRECONDITION_REQUIRED
503 GRADER_UNAVAILABLE

อ่าน canonical [กฎผลเรียน](learning-rules-032-034.md)

## ผลข้อสอบเมื่อหมดเวลา

ผลเมื่อหมดเวลาใช้ decisions-042, REQ-046, BR-046-07 และ AC-046-07:
- ปิดด้วย state `expired` เดิม ตรวจอัตโนมัติจากคำตอบที่ server รับและบันทึกทันเวลา แม้ไม่กด submit; ข้อว่างได้ 0 ใช้คะแนนเต็มทั้งชุดตาม snapshot ไม่มีคำตอบได้ 0/เต็มทั้งชุด ไม่รับคำตอบย้อนหลัง
- นับครั้งตาม max_attempts/Sequence และใช้ RetakeGrant เดิมหากเป็นรอบซ่อม ไม่คืนสิทธิ์เพราะไม่กดส่ง และไม่ consume ซ้ำตอน finalize
- Mutation answers/submit หลังหมดเวลาไม่รับ answers เพิ่ม; mapping ใช้ `409 ATTEMPT_EXPIRED` เดิม ส่วน GET อ่าน outcome ได้ตามสิทธิ์เดิม ไม่ปฏิเสธการอ่านเพียงเพราะ expired; feedback/เฉลยยังขึ้นกับ reveal ของ snapshot ไม่เปิดทันทีเพราะหมดเวลา
- ผล expired ที่ตรวจเสร็จเข้า selection ตาม [กฎผลเรียน](learning-rules-032-034.md); Test ครั้งจริง/ซ่อมใช้ best ไม่มีเพดานลดคะแนน

รายละเอียดเทคนิคยัง PROPOSED และต้องตรึง/พิสูจน์: clock และขอบเส้นตาย, save/submit/expiry race, idempotent finalization, crash/retry/recovery, read ระหว่างยัง finalize ไม่เสร็จ และ reveal mapping; ไม่เลือกกลไกใหม่ในสัญญาส่วนนี้ ไม่ใช้ NULL เป็นคะแนน 0 ที่ตรวจแล้ว

ทางเลือกที่ไม่ใช้: ไม่มีคะแนนเมื่อ expired ขัดมติ 042 (ตรวจคำตอบที่บันทึกทันเมื่อหมดเวลา); บังคับเปลี่ยนเป็น submitted หรือเพิ่ม storage ไม่จำเป็นต่อมตินี้
