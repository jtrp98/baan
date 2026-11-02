# TP-002 — การเตรียมและวัดผล API

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้ร่วมกับ [ชุดข้อมูล API](tp-002-fixture-api-001.md) และ [แผนหลัก](tp-002-fixture-plan-001.md) ทุกผลจริงยัง NOT_RUN

## การเตรียมและกระตุ้นเหตุการณ์

- API ระดับ unit/domain ใช้ trusted-session stub, scripted Gateway boundary และ in-memory transactional fake; ไม่มี DSN/credentials หรือ connection ถึง DB/service จริง. PF-API/PF-WEB/PF-LEGACY เป็นเป้าหมาย integration ภายหลังตาม prerequisites ใน index ไม่ใช่ integration ที่รันแล้ว
- FX-04a/e: seed store ว่าง, Guest UUID และ frozen snapshot/hash/key สมมติ; barrier ก่อน commit และหลัง durable-in-fake commit แยกกัน. วัด staged/committed Project/Revision/idempotency/audit counts ก่อน/หลัง, result ID และ attempt count. fail ก่อน commit เหลือศูนย์; drop หลัง commit+retry เหลือชุดเดิม 1 ชุด. receipt ไม่ใช่หลักฐาน PGGradeDB
- FX-05a: seed School A/B ให้ learner ID และ classroom ID ชนกัน; T สอนวิชา A/ห้อง1/เทอม X, U สอนวิชา B ในห้องเดียวกัน. ใส่ผลสมมติคนละ marker ต่อคน/วิชา; T→R วิชา A เป็น positive control แล้ว T→รายชื่อ/ผลวิชา B, U→ผลวิชา A, ข้าม School/term, ครูไม่ assigned และ ID ที่ทราบ ต้องไม่เห็นข้อมูลต้องห้าม
- สัญญา fixture resolver ระบุผลตอบต่อ tuple (School, teacher, course, learner, term) ชัดเจนเป็น allow/deny/unavailable/ambiguous; history หลายแถวของ S ใช้ scripted expected ไม่เดา latest row หรือสร้างกฎ roster เอง. sId==sEmp ต้องไม่ทำให้ employee กลายเป็น learner
- FX-05b: spoof tenant/identity/profile/channel ใน request และถอน assignment หลัง read ก่อน commit ผ่าน barrier; trusted session คงเป็น authority. วัด response body/list/detail/error ไม่มี marker/ชื่อ/คะแนนของขอบเขตต้องห้าม, downstream result reads และ committed mutations=0 เมื่อถูกปฏิเสธ; positive control ต้องอ่านได้เพื่อกัน fake ที่ deny ทุกคำขอ
- FX-05c: สลับ resolver เป็น unavailable/ambiguous ก่อนอ่านและก่อน commit; ตรวจ fail closed ตามตาราง ไม่ใช้ cache/query เปิดสิทธิ์; ผลเดิมไม่เปลี่ยน. teacher ban ในงานนี้หมายถึงไม่ assigned/ถูกถอนสิทธิ์ตาม [AC-039-05 (ครูขอดูรายชื่อหรือผลนักเรียนนอกที่ได้รับมอบหมาย…)](../requirement/req-039.md) ไม่เพิ่มนโยบาย ban บัญชีใหม่
- แยก fake receipt กับหลักฐาน DB จริง; E-API เก็บ sanitized request/outcome/correlation + dataset hash + counts/audit/fault point โดยไม่มี token/key หรือข้อมูลจริง. transport จริงต้องรอ HTTP API Gateway→gRPC SchoolBot service mapping ตาม index; ไม่กำหนด RPC/error ใหม่
- export parity/coexistence/score writer/crash และ lease worker ของคะแนนอยู่ที่ [TP-003](tp-003-grade-fixture-plan-001.md); FX-04 เป็น Project import เท่านั้น ไม่ปิด grade gates

## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · RPC = Remote Procedure Call
