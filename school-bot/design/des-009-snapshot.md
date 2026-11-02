# DES-009 — Preview ยืนยัน และส่งคะแนนกลับ SchoolBright — สูตรคะแนนช่องและการป้องกัน LearnerId ชนกัน

> Rev 4 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-009 — Preview ยืนยัน และส่งคะแนนกลับ SchoolBright](des-009.md)

ชนิดข้อมูลที่ใช้: `A` = actor string ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## อ้างอิง

- [มติ 024 (เกณฑ์เลื่อน Level และ policy Quiz/Test)](../requirement/decisions-024.md)
- [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../requirement/decisions-025.md)
- [มติ 026 (อนุมัติ amendment-proposal-001/002 เป็น baseline ใหม่)](../requirement/decisions-026.md)
- [มติ 032 (ผลทดลองของครูและ cardinality/การล็อก mapping คะแนน)](../requirement/decisions-032.md)
- [มติ 023 (writer คะแนน, ปัดเศษ, นำเข้า Sheet และเจ้าของ mapping)](../requirement/decisions-023.md)
- [[BR-050-05 (ปัดแบบ half-up — x.5 ขึ้นไปปัดขึ้น ต่ำกว่าปัดลง (7.5 → 8, 7.4 → 7) ตาม [decisions-023])](../requirement/req-050.md) (ปัดแบบ half-up — x.5 ขึ้นไปปัดขึ้น ต่ำกว่าปัดลง (7.5 → 8, 7.4 → 7) ตาม [decisions-023])](../requirement/req-050.md)
- [DES-011 (ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง)](des-011.md)
- [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md)

## สูตรคะแนนช่องและการป้องกัน LearnerId ชนกัน

ทุก source มี earned/max จาก authoritative assessment/attempt และ policy revision ที่แน่นอน; max > 0, 0 <= earned <= max
quiz ใช้คะแนนสูงสุดของ attempt ที่ submit แล้วตามค่าเริ่ม (decisions-024)
ผลการสอบซ่อม Test ใช้คะแนนสูงสุดระหว่างครั้งจริงกับครั้งซ่อม ไม่มีเพดาน (ยืนยันตาม [decisions-025](../requirement/decisions-025.md) และ [decisions-026](../requirement/decisions-026.md))

**การป้องกัน `LearnerId` ของครูชนกับนักเรียน (`sEmp == sId`)**:
- `learner_ids` ใน `ScorePreview` ต้องเป็นสมาชิกนักเรียนใน roster ของห้องเรียน (`TUser.sID` จาก School DB) เท่านั้น
- เมื่อดึงผลจาก `SchoolBotSubmission` ต้องกรองเฉพาะแถวที่ผูกกับ `SchoolBotProject` ซึ่งมี `OwnerKind = 'student'` และ `OwnerId = LearnerId` เท่านั้น (และใน schema ปัจจุบันไม่อนุญาตให้ `ProfileKind = 'employee'` สร้าง `Submission` หรือ `Attempt` — ทาง A ยืนยันแล้วตาม [decisions-032](../requirement/decisions-032.md); ห้ามผล Cloud ของ employee รวม Guest import ตาม [กฎผลเรียน](learning-rules-032-034.md))

normalized = earned/max ของ source เดียว
raw_target = earned/max × target_max
integer_target = floor(raw_target + 0.5)

คำนวณด้วย decimal ไม่ใช่ binary float ปัด half-up ตามมติ decisions-023 / BR-050-05: x.5 ขึ้นไปปัดขึ้น ต่ำกว่า x.5 ปัดลง (7.5 → 8, 7.4 → 7) ปัดครั้งเดียวต่อช่องจาก source เดียวตาม decisions-032 และ [มติ 033 (ช่องคะแนนเดิม การแปลงคะแนนเต็ม และผลประเมินที่ยังไม่มี)](../requirement/decisions-033.md); ทุกช่องคำนวณจาก earned/max เดิม ไม่ใช้ผลปัดของอีกช่อง

หาก integer_target เกิน target_max ให้ปฏิเสธ ไม่ clamp ไม่เปลี่ยนคะแนนเต็มปลายทางเอง missing/ungraded/error ไม่กลายเป็นศูนย์ (ต่างจาก DES-011 ที่นับ 0 เฉพาะการเลื่อน Level) quiz ที่ policy ไม่นับคะแนนส่งออกไม่ได้

## Snapshot และการยืนยัน

Preview ผูก SchoolId, principal, course run, mapping (`id` + `update_date`), policy revision, roster, source result (`id` + `update_date`), writer/calculator version, target context/locks/settings, raw old cell values, destination row identity/`xmin` (ของ PGGradeDB) ณ เวลาอ่าน

SnapshotHash เป็น SHA-256 ของ canonical snapshot ที่ server สร้าง; เสนอ preview อายุ 15 นาที เป็น technical bound และเป็นเพดานอายุของ `xmin` ที่ใช้ Compare-and-Swap (CAS) ใน PGGradeDB
ยืนยันต้องใช้ `preview_id` + `snapshot_hash` + `If-Match` (opaque `ETag` จาก `UpdateDate` ของ `SchoolBotScorePreview` ตาม [decisions-030](../requirement/decisions-030.md)) ไม่รับคะแนนใหม่หรือ destination IDs ใหม่ในคำสั่งยืนยัน

