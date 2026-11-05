# การรับกฎ learning และคะแนนเข้าแบบปัจจุบัน

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 054 — approval_ref/evidence_ref ไม่เกิน 1,000 ตัวอักษรและไม่ขยาย schema)

ผลตรวจ SQL และผลปรับแบบวันที่ 2026-10-23 ถูกนำเข้าเอกสารแล้ว กฎธุรกิจอยู่ใน [กฎผลเรียน Rev2](learning-rules-032-034.md), [สูตรและ freeze Rev2](learning-rules-032-034-policy.md) และ [กฎ mapping/export Rev1](grade-rules-032-034.md) ไม่ต้องเลือกนโยบายเดิมซ้ำหรือเพิ่ม LearnerKind การรับเอกสารไม่ใช่การรับรอง implementation หรือผลทดสอบฐานจริง

## เทียบผลที่ต้องรับก่อน freeze

| ประเด็นจากผลตรวจ/ปรับแบบ | ที่อยู่ในแบบปัจจุบัน | Delta ที่ยังต้องทำสำหรับ DBA-005 |
|---|---|---|
| ทาง A: employee ทดลอง local/เก็บ Project Cloud แต่ไม่สร้าง Submission/Attempt ทุกช่องทางรวม import/retry/worker | กฎผลเรียน หัวข้อตัวตนและรอบเรียน; คืน 403 PROFILE_NOT_ALLOWED ก่อนสร้างผล/job | ไม่มี business/schema delta; ต้องพิสูจน์ authorization จริง |
| หนึ่งช่องหนึ่งกิจกรรม 100%, กิจกรรมหนึ่งลงหลายช่องได้; ใช้ช่องเดิมจริง | กฎ mapping/export หัวข้อช่องและล็อก; Sources หนึ่งรายการ weight_bps=10000 และคีย์ช่องพร้อมบริบทปี/เทอม/ห้อง/วิชา | ไม่มี delta; ไม่สร้างช่องอัตโนมัติหรือ alias ช่องด้วย run ใหม่ |
| ล็อก mapping ตั้งแต่ confirm รวม queued/partial/unknown; ห้าม retire/soft-delete/ชุดใหม่หลบประวัติ | กฎ mapping/export หัวข้อช่องและล็อก; lock ก่อน commit Export/Outbox/Preview และตรวจประวัติทุก run | ไม่มี delta; บังคับผ่าน application transaction ไม่ใช่ SQL UNIQUE |
| Freeze policy ต่อ CourseRun; สูตร SUM(normalized*weight) รวม 100%; quiz ไม่นับมีน้ำหนัก 0 | สูตรและ freeze; planned→active ตรึง CurrentPolicyId/policy_hash; น้ำหนักใหม่ใช้ run ใหม่ | ไม่มี delta; ห้ามแก้ pointer/weights/formula ย้อนหลัง |
| ครูเปลี่ยนเฉพาะเวลา/window; ซ่อมรายคนและคะแนนสูงสุดไม่ลดเพดาน | กฎผลเรียน หัวข้อข้อสอบและ Level; snapshot effective_policy/window และ RetakeGrant ผูก run/activity/learner | ไม่มี delta; AssessorId/EmployeeId และ LearnerId ไม่ใช่ชนิดตัวตนเดียวกัน |
| Submission ไม่มี CourseRunId ต้องพิสูจน์ผลต่อรอบ | กฎผลเรียน หัวข้อตัวตนและรอบเรียน; resolve active run เดียวและบันทึก Submission.Accepted Reason เป็น JSON {course_run_id}; ผูกกับ learner/mission/revision | ไม่มี physical field ใหม่; ไม่พบ/กำกวมคืน COURSE_RUN_NOT_RESOLVED; หลักฐานผลเดิมไม่ครบ block export/proposal |
| ส่งคะแนน earned/max*targetMax, decimal half-up; missing แยกรายช่องจากศูนย์จริง | กฎ mapping/export หัวข้อสูตรและ skip; skipped_cells ใน snapshot, ไม่เขียนทับค่าเดิม; ผลจริง 0 ยังส่งได้ | ไม่มี delta; Level ใช้ทุกคนใน roster และงานขาด=0 ตามกฎผลเรียน ไม่เอากฎ export skip มาแทน |
| Receipt/hash/lease/partial retry และ tenant/history | กฎ mapping/export หัวข้อ recheck และ partial; [DES-009 ส่วน delivery](des-009-delivery.md) หัวข้อ atomicity; claim lease+UpdateDate, serialize context/learner, operation lock และ receipt คู่คะแนน | รับเป็นข้อกำหนดแล้ว; ต้องพิสูจน์ lease/worker fencing และ crash/reconcile จริงใน DBA-007 ไม่อ้างผ่านจากเอกสาร |
| ชนิด int4, UpdateDate, ประวัติ immutable และ audit/domain commit ร่วม | [กฎ commit](data-contract-rules-transactions.md), [กฎคะแนน/งานระบบ](data-contract-rules-grades.md), [ข้ามฐาน](data-contract-rules-cross-database.md) และ dictionary | ไม่มี physical delta; approval_ref/evidence_ref ใช้ T1000 ตรงกับ Reason เดิมตามมติ 054 |

## ผลต่อ physical baseline และสิ่งค้าง

ยอด 40 FK/24 UNIQUE/80 CHECK/13 unique indexes ในผลตรวจวันที่ 2026-10-23 เป็นประวัติของ SQL รุ่นนั้น ไม่ใช่สัญญาปัจจุบัน [มติ 044 (constraints เฉพาะ PK)](../../shared/decisions/decisions-044.md) ถอนข้อบังคับเหล่านี้ ปัจจุบัน SQL Rev7 มี 32 ตาราง/450 fields/PK32, FK/UNIQUE/CHECK/standalone indexes0 ข้อความ single FK ใน acceptance หมายถึง reference ID เดิมร่วม application tenant check ไม่ใช่สิทธิ์เพิ่ม physical FK

ข้อความเก่าใน grade-rules-032-034.md ที่กล่าว SQL คุม active rows และชื่อ UQ ใน des-009-delivery.md ยังเป็นช่องคลาดเคลื่อนของคำอธิบาย ต้องอ่านเป็น application invariants ตามกฎข้อมูลปัจจุบัน ไม่ใช่หลักฐาน constraints หรือสิทธิ์คืน SQL เดิม ข้อเสนอแก้คำอธิบายเหล่านี้ส่งผู้คุมจัดขอบเขตต่อ ไม่เพิ่ม schema ในงานนี้

Storage ของ DBA-005/DBA-006 ใช้ [Reason ตรงตัวไม่เกิน 1,000 ตัวอักษร](audit-evidence-storage-001.md) ตาม [มติ 054 (จำกัดเลขอ้างอิงโดยไม่ขยาย schema)](../../shared/decisions/decisions-054.md) จึง [ไม่มี physical delta หรือ migration](audit-evidence-migration-001.md) ให้ vault ทบทวนผลความจุใหม่ ส่วน roster/ผู้ตรวจ/transaction/receipt/runtime และการเชื่อมฐานยังต้องมีหลักฐานตามเงื่อนไขเดิม

## หลักฐาน

- memory/school-bot/_cross/planning/task-012.md: Change Log ระบุ vault ส่ง NEEDS_DESIGN_CHANGE และบันทึกผลตรวจ; ผลจริงอ่าน memory/school-bot/_cross/db/review-006.md ครบ รวม design gaps และ schema_delta_required=false ซึ่งแปลว่ายังไม่เสนอ physical delta ไม่ได้แปลว่าปิดทุกข้อ
- memory/school-bot/_cross/planning/task-013.md: Change Log ระบุ arch DONE และผู้คุมบันทึก patches/canonical rules แล้ว ไม่ถือเป็นคำอนุมัติ runtime ของมนุษย์
- memory/school-bot/_cross/design/dbml-review-002.md: ผู้คุมรับ output และตรวจ @dbml/core 10.3.1 dialect dbmlv2, structural before/after เหมือนเดิมของ revision ณ 2026-10-23; ตัวเลข FK เก่าไม่ใช่ผล parser ของแบบปัจจุบัน
- กฎผลเรียน: learning-rules-032-034.md:9–29; สูตร/freeze: learning-rules-032-034-policy.md:9–15; mapping/export: grade-rules-032-034.md:9–43; delivery: des-009-delivery.md:15–22 อ่านจริงในงานนี้
- knowledge/school-bot/build/db/dba-005-learning-review.md และ dba-095-schema-parity.md เป็นผลตรวจไฟล์ล่าสุด ไม่ใช่ deployed catalog; source publish/memory store ที่ตรวจจริงอยู่ในหลักฐานของสัญญา storage
