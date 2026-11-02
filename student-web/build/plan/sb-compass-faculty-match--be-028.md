# BE-028 — Submit answers endpoint (100% complete)

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

endpoint ส่งคำตอบ — บังคับตอบครบทุกข้อ active ห้ามส่งไม่ครบเด็ดขาด (กติกา "ต้องตอบครบ 100% จึงส่งได้" ยืนยันซ้ำ — OQ-F11 ข้อ (ง) ถูกปฏิเสธ), ห้ามเติมค่ากลาง, `INSERT` แถวใหม่เสมอ (ไม่ `UPDATE`), เก็บ `answers` เป็น `"<question_id>:<1-5>"` คั่นด้วย comma และ `rankAnswers` ตามรูปแบบ option ต่อ block — ⚠️ scope correction (2026-09-02): ถ้า draft ใดของงานนี้เคยเขียนว่าอนุญาตส่งไม่ครบ ข้อนั้นผิดและต้องแก้ก่อน implement — ต้องบังคับจำนวนข้อตอบเท่าจำนวนข้อ active เสมอก่อนรับการส่ง — คำตอบเป็นข้อมูลเชิงจิตวิทยาของผู้เยาว์ที่เก็บเป็นบันทึกของวันนั้น — การรับส่งไม่ครบหรือแก้แถวเก่าทำให้ผลที่คำนวณจากมันตีความผิดทั้งชุดและแก้ย้อนไม่ได้

## References

REQ-012, AC-012.5, DES-025, DEC-025, DES-018, DEC-018

## Scope

ตรวจความครบฝั่งเซิร์ฟเวอร์ทุกคำขอ (ไม่เชื่อการตรวจของหน้าจอ) · บล็อกเรียงลำดับต้องเป็น permutation ครบของ block หรือไม่ตอบเลย — ไม่ครบปฏิเสธทั้งคำขอ · เก็บ `"AnsweredCount"`/`"ActiveItemCount"` ตามนิยามเดิมเพื่อการวินิจฉัย

- Security-sensitive: yes

## Out of Scope

แถวผลเก่าทุกแถว (INSERT เสมอ) · ตารางคลังคำถาม (อ่านอย่างเดียว) · สคีมา

## Expected Output

none

## Acceptance

AC-012.5: ต้องตอบครบ 100% ของแบบทดสอบ (ทั้ง Likert และบล็อกเรียงลำดับ) จึงจะส่งได้ — คำขอที่ส่งไม่ครบถูกปฏิเสธทั้งคำขอทุกครั้ง และการส่งสำเร็จเป็นการ INSERT แถวใหม่เสมอ

## Dependencies

BE-027

## Handoff

ตรวจ AC-012.5 ด้วยการส่งจริง: ครบทุกข้อ (สำเร็จ/แถวใหม่), ขาดหนึ่งข้อ (ปฏิเสธทั้งคำขอ), block เรียงลำดับไม่ครบ permutation (ปฏิเสธ) — เก็บผลเรียกทุกกรณี + แถวที่เกิดเป็นหลักฐาน
endpoint เขียนตารางของ ClassOnlineWeb เอง — revert ได้ · แถวที่ INSERT แล้วเป็นบันทึกของเด็ก ไม่ถูกถอดโดย revert โค้ด
ส่งต่อ reviewer

Back-links: `INDEX.md`
