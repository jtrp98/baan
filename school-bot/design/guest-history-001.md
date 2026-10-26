# ประวัติ Guest และการตรวจใหม่ — Rev1

ต่อจาก [DES-003](des-003.md), [DES-004](des-004.md), [DES-005](des-005.md); REQ-042/decisions-032. สถานะอยู่ที่ [index](index.md)

## Local history

Host บันทึกหลังการประเมิน local แบบ atomic ต่อรายการ ไม่ขึ้นกับการเปิดหน้าบทเรียน; ยังไม่ใช่ผล Cloud. ทุก field บังคับ ยกเว้นที่ระบุ null:

```text
{schema:1,history_id:UUID,local_project_id:UUID,recorded_at:UTC,
 mission_id:int32,criteria_id:int32,curriculum_revision:positive_integer,
 snapshot:{mode:block|arm|code,name:string,content:ProjectContent},
 snapshot_hash:sha256,authority:"local",
 local_result:{outcome:passed|not_yet|awaiting_teacher|error,feedback:string},
 evidence:ArmEvidence|null}
```

Content IDs มาจาก published bundle ที่ตรวจแล้ว ไม่ใช่ index ของ sample UI; revision คือฉบับเนื้อหา ไม่ใช่ ETag. UTC เป็น RFC3339 instant ในเครื่อง ไม่เป็น trusted submitted_at. snapshot ใช้ ProjectContent/ขนาด/ชื่อใน DES-003 และเก็บเนื้อหาขณะทำภารกิจ; hash คือ SHA256 ของ canonical snapshot. feedback ≤4000 ตัวอักษร เป็นข้อความไม่ execute. ArmEvidence ใช้ [contract-003.md](data-dictionary/contract-003.md) `{profile_hash,acceptance_ref,note}`; null = ไม่มีหลักฐานประกอบ ไม่แปลว่าผ่าน

Local result อยู่ใน workspace ร่วม ไม่ระบุว่านักเรียนคนใดทำ. เปลี่ยน/ลบโครงงานไม่ทำลาย snapshot ประวัติอิสระ; 30 วันใช้เฉพาะ trash ของโครงงาน. ไม่ส่งผลจาก Login หรือนำเข้า Project อย่างเดียว

## คำสั่งตรวจใหม่

ผู้ใช้เลือกประวัติและยืนยันปลายทาง. ข้อเสนอ client HTTP `POST /v2/submissions/guest-imports` ผ่าน G รับ `{history_id,local_project_id,mission_id,criteria_id,snapshot,snapshot_hash,evidence}` ตามชนิดด้านบน. **ไม่รับ local_result, score, stars, learner_id หรือ submitted_at จาก client**. `Idempotency-Key=history_id`, operation `GuestHistory.Recheck`, Principal A/SchoolId จาก session; request ≤2 MiB และ snapshot document ≤1 MiB

ต้องเป็น desktop session ที่ bind student, License/device proof ถูกต้อง; employee → `403 PROFILE_NOT_ALLOWED`. ตรวจ mission/criteria published และสัมพันธ์กัน, mode ตรง Activity, hash ตรงที่ server คำนวณ. content ที่อ้างไม่มี → `409 CONTENT_NOT_PUBLISHED`/`CRITERIA_NOT_APPROVED`; ไม่เปลี่ยนไปเกณฑ์ล่าสุดเงียบ. โปรแกรมผิด → `400 PROGRAM_INVALID`; ข้อมูลผิด → `400 INVALID_INPUT`; ขนาดเกิน → `413 PAYLOAD_TOO_LARGE`

ใช้ transaction เดียวสร้าง **Project สำหรับ snapshot ที่เลือก**, ProjectRevision, Submission, GradingJob (เฉพาะ Code/Block), Idempotency และ Audit เดิม. Project เป็นสำเนาสำหรับตรวจใหม่ที่ OwnerKind=student/OwnerId จาก session; ไม่ทับ Cloud project ที่นำเข้าแยกไว้ และไม่ใช้ Local UUID เป็น PK. การเลือกประวัติระบุว่ารวมชิ้นงาน snapshot นี้; retry history เดิมไม่สร้าง Project/Submission ซ้ำ. ไม่สร้าง Attempt หรือใช้ประวัติแทนการสอบ Quiz/Test

ผล `201 SubmissionView` + ETag หลัง commit; Code/Block เริ่ม queued แล้วตรวจใหม่ด้วย approved evaluator, Arm เริ่ม awaiting_teacher จนผู้มีสิทธิ์ตาม DES-004 ตรวจ. infrastructure failure เป็น error/`503 GRADER_UNAVAILABLE` ตามระยะที่ล้มเหลว ไม่เป็น passed จากการเดา; ผลจริงแสดงเมื่อ evaluator/ครู commit แล้ว

## ที่มาและ recovery โดยไม่เพิ่ม schema

AuditEvent ใช้ `Event=GuestHistory.Recheck`, `EntityType=SchoolBotSubmission`, `EntityId=Submission PK`, Actor เป็นผู้รับเข้า, `Reason=guest-history:<UUID>;guest-project:<UUID>;snapshot:<SHA256>` ภายใน varchar(1000) เดิม. เป็นคำอ้างแหล่ง local ไม่รับรองผู้สร้าง; server สร้างข้อความเอง ไม่เก็บ local score/source ใน audit. Submission.Evidence คง ArmEvidence เดิม ไม่ใส่ JSON รูปใหม่

SubmissionView เพิ่ม read-only `origin:"guest_recheck"|"cloud"` โดย derive จาก event นี้; ไม่เป็นคอลัมน์ใหม่/ไม่ใช่ผลผ่าน. อ่าน origin ต้องตรวจ owner/ครูเหมือนอ่าน Submission ไม่คืน audit ทั้งก้อน. ไม่ purge event ที่จำเป็นต่อ provenance โดยพลการ

Host เก็บ receipt `{schema:1,history_id:UUID,destination:Pพร้อมaccount_id,request_key:UUID,request_hash:sha256,snapshot:RecheckRequest,state:pending|committed|conflict|unavailable,cloud_submission_id:int32|null,cloud_project_revision_id:int32|null,committed_at:UTC|null}`. destination มีชื่อ/ชนิด field เดียวกับ [guest-import](guest-import-001.md); RecheckRequest คือ body ข้างต้นที่ freeze และ IDs/เวลาเป็น null จนทราบผล commit. หลังสำเร็จเติม Submission.id/project_revision_id จากผลตอบโดยไม่ต้องเดา Cloud project_id. ใช้ atomic receipt/session-generation guard เดียวกับ import โครงงาน

UI แสดง local_result/authority=local แยกกับ GET Submission ที่ origin=guest_recheck; ไม่เติม assessment ว่างด้วย passed เดิม. เมื่อ replay หมดอายุใช้ resource_id อ่าน Submission เดิม; auth/snapshot เปลี่ยน → conflict/error ไม่สร้างซ้ำหรือย้ายบัญชี. ผลแยกรายการตามที่เลือก

## เหตุผลและหลักฐาน

DDL ตาราง `SchoolBotSubmission` ใน `db/schoolbot_db.sql` มี Submission/ProjectRevisionId/Evidence; ตาราง `SchoolBotAuditEvent` มี AuditEvent และ Idempotency มี ResourceId. เลือก reuse rows/audit แทนตารางประวัติ Cloud ใหม่; ปัดตกเชื่อ client stars, เดาผู้สร้าง Guest และนำเข้าผลครูเป็นนักเรียน. `app/internal/engine/demo.go:24–66` เป็น bounded runtime ไม่ใช่ authoritative grader

ครอบ AC-042-01..06; ต้องพิสูจน์ local restart, เลือกเฉพาะ A, ปลอม passed, Arm รอครู, grader fail, snapshot เปลี่ยน, lost response และ provenance หลัง replay หมดอายุ. รอบนี้ไม่มี runtime proof

## Change Log
- 2026-10-24 — Rev1: ใบงาน060a กำหนด snapshot/explicit recheck/ที่มา/recovery ด้วย schema เดิม; คงทาง A
