# LUX-05 — A042 finalization ที่ไม่เพิ่ม state/table

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

เอกสารนี้เป็นสัญญาทางเทคนิคสำหรับพัฒนาและทดสอบ local โดยใช้ขอบเขตและเงื่อนไขหยุดร่วมเดิม ยังไม่ใช่การอนุมัติ schema หรือหลักฐาน runtime ของระบบจริง

ใช้ finalizer เดียวสำหรับ submit, expiry และ recovery; ไม่สร้าง grading job ชนิดใหม่สำหรับ single-choice/boolean

**Clock และจุดรับคำตอบ**

- ทุกเวลาตัดสินมาจาก SchoolBot authoritative store clock; fake ใช้ `TimeProvider` ที่ควบคุมได้ ห้ามใช้ client time หรือเวลาเข้าที่ HTTP API Gateway
- `started_at` ใช้เวลาภายใน transaction เริ่มครั้ง
- `deadline_at = min(started_at + time_limit_seconds, closes_at)` โดยข้ามค่าที่ null; ทั้งคู่ null จึงไม่มี deadline
- รับคำตอบเมื่อ `t_accept < deadline_at`; **เท่ากับ deadline ถือว่าหมดเวลา**
- `t_accept` คือเวลาของ guarded write หลังได้ lock และผ่าน validation โดย transaction นั้นต้อง commit สำเร็จ จึงถือว่าบันทึกแล้ว ไม่ใช่เวลา HTTP ingress หรือ ACK
- transaction ที่ rollback ไม่ถือว่าบันทึกทัน แม้เริ่มก่อน deadline; ACK มาถึงหลัง deadline ไม่ทำให้คำตอบที่รับสำเร็จก่อนหน้าเสียสิทธิ์

นี่เป็นการตรึง technical linearization point ให้ check ทดสอบได้ ไม่อ้างว่าสามารถพิสูจน์ “commit record เสร็จก่อน deadline” ด้วยการอ่าน clock ก่อน commit เพียงอย่างเดียว

**ลำดับ transaction**

1. ตรวจ identity/channel/profile, payload และ required headers
2. ล็อก idempotency scope; ตรวจ replay ก่อนทำ domain mutation
3. ล็อก CourseRun แล้ว Attempt ตามลำดับเดียวกันกับ start/retake/finalizer
4. อ่านเวลาใหม่หลังได้ lock
5. ถ้า started และทันเวลา: ตรวจ ETag แล้ว save หรือ submit
6. ถ้าถึง deadline: ไม่รับ answers จากคำขอนี้; finalize จาก `Answers` ที่บันทึกอยู่เท่านั้น
7. commit terminal state/คะแนน/เวลาแก้/audit และผล idempotency ของคำขอร่วมกัน

**ผล finalization**

| เหตุการณ์ | State / ข้อมูล |
|---|---|
| submit ทันเวลา | `submitted`; บันทึก answers ชุดส่ง; `SubmittedAt=t_accept`; evaluate snapshot |
| หมดเวลา | `expired`; ใช้ answers ที่บันทึกไว้; `SubmittedAt` คง null เพราะไม่ได้กดส่ง |
| ตรวจสำเร็จ | `EarnedScore=sum(correct?max:0)`; `MaxScore` เต็มทั้ง snapshot |
| evaluator version ใช้ไม่ได้ | `503 GRADER_UNAVAILABLE`; ไม่เขียนคะแนนศูนย์แทน และไม่อ้าง finalization สำเร็จ |
| terminal แล้ว | ไม่ประเมิน/เขียนคะแนน/audit ซ้ำ |

หลังหมดเวลา answers/submit คืน `409 ATTEMPT_EXPIRED` แม้ finalizer ทำงานเสร็จแล้ว ส่วน GET อ่านผลได้ตาม reveal หากคำขอเก่าที่สำเร็จถูก replay ให้ผล replay เดิม แล้ว caller GET เพื่อทราบ state ปัจจุบัน ห้ามนำ replay ไปเพิ่มคำตอบอีก

Expired finalizer ไม่เพิ่ม Sequence ไม่ consume หรือคืน RetakeGrant ใช้ state transition ภายใต้ Attempt lock เป็นตัวกันทำซ้ำของงานระบบ ไม่สร้าง UUID ใหม่ทุกครั้งเพื่อหลบ dedup

**Recovery**

- มี bounded sweep ค้น `started` ที่ deadline ผ่าน และกรณี `expired` ที่ยังไม่มีผล แล้วเรียก finalizer เดียวกัน
- GET/list ที่พบรายการถึง deadline เรียก recovery เดียวกันก่อนสร้าง projection; ไม่เปิด mutation อีกเพียงเพราะ worker ยังไม่ทำงาน
- crash ก่อน commit → ไม่เห็น terminal partial result; sweep ทำใหม่ได้
- crash หลัง commit ก่อน response → GET พบผลเดิม; retry key เดิมไม่เกิดผลซ้ำ
- ถ้าอ่านพบ `expired/EarnedScore=null` และ recovery ยังทำไม่ได้ คืน error ที่อธิบายได้ เช่น `GRADER_UNAVAILABLE`; ห้ามแปลง null เป็น 0
- worker ที่แข่งกันต้องได้ audit finalization หนึ่งรายการ ผ่าน lock/state check ไม่พึ่ง process-local mutex เป็น production guarantee

ใช้ `Attempt.Submitted`/`Attempt.Expired` เป็น audit events; system actor `service:attempt-finalizer`, `CreateBy/UpdateBy=null` เมื่อเป็นงานระบบ

ทางเลือกที่ไม่ใช้: เปลี่ยน expired เป็น submitted, เพิ่ม pending state, client คำนวณคะแนน, queue framework ใหม่ และยอมรับคำตอบช้าเพื่อชดเชย network

**พร้อม local:** clock boundary, race, replay, evaluator และ recovery fake  
**ยังไม่พิสูจน์:** DB clock/transaction durability/multi-process locks และ worker deployment

## หลักฐาน

- E01 — ที่มาของขอบเขตและเงื่อนไขร่วม: planning/arch-091-learning-001.md (memory) เอกสารนี้คงข้อเสนอเดิม ไม่ได้ตรวจ source หรือ runtime ใหม่
