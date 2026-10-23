# ใบงาน 015 — gm ยืนยันร่างที่กู้ได้หลัง timeout

วันที่ของงาน: 2026-10-23 · ต่อ task-014 ผู้ใช้อนุญาตส่งต่อโครงการเดิม

รอบ gm task-014 หมดเวลา 1800 วินาทีก่อนส่ง final answer ไม่มี final verdict ผู้คุมกู้เฉพาะ workproduct ที่ gm สร้างใน public tool calls (ไม่ใช้ reasoning): replay pure data assembly call17..34 ใน VM ไม่มี filesystem/network/shell ใน VM; seed เอกสาร plan เดิมและ REQ180 ปัจจุบัน ร่างที่ได้คือ compact output ของ gm เดิม ไม่ได้แต่งแผนใหม่แทน gm

ร่างอยู่ C:/src/schoolbright/knowledge/school-bot/planning/gm-recovery-001.json SHA256=74b57a63b8db7ab0118860f0de08d59c634011a702d9d7c54f08fbe8f8bde25b
ยังไม่ apply ลง plan จริง; preview files อยู่ C:/src/schoolbright/.tmp-schoolbot-handoff/gm-preview/knowledge/school-bot/ (ตาม relative path ใน edits/new_files); canonical plan preview คือ plan/tasks-001.json

ผู้คุมตรวจ draft exact old texts/JSON old values และ ACL แล้ว; req44/AC180 unique ครบ แผน110tasks/8phases/17gates มีcoverage180ทั้งimplementation+check ไม่วนdependency ไม่มีunknownrefs สถานะpendingทั้งหมดไม่แตะStatusเดิม 74IDsอยู่ครบ เพิ่ม36task scopeเดิม ไม่เพิ่มfeature

ขอ gm เป็นเจ้าของยืนยันรับร่างนี้หรือส่งเฉพาะdeltaที่จำเป็น **ห้ามสร้าง/พิมพ์แผน117kตัวอักษรซ้ำ** ปิดงานนี้ด้วย output สั้น<=5000ตัวอักษร ไม่ต้องแก้ไฟล์จริง

อ่าน index-first knowledge/school-bot/index.md, requirement/index.md, plan/index.md, design/index.md และ planning/spec-review-001.md, arch-review-001.md, db/review-006.md, requirement/decisions-032.md,033.md,034.md; อ่าน draftด้วยโปรแกรมสรุป fields ได้และตรวจ hashเอง ส่วน preview ที่ต้องตรวจตรงๆ: plan/index.md, plan/scope-001.md, plan/gates-001.md, plan/dispatch-001.md, plan/evidence-002.md, plan/queue-002.md, plan/extension/index.md, plan/release-runbook-001.md, plan/tasks-001.json; design/learning-rules-032-034.md, grade-rules-032-034.md; ตามลิงก์taskเฉพาะที่ต้องใช้ในpreviewได้ ถ้า unchangedไม่อยู่previewอ่านplanต้นฉบับ pathเดิม

ตรวจเนื้อหา/คิวสำคัญ: freezeweightsใหม่เฉพาะrunใหม่; employeeห้ามผลCloud; mappingหนึ่งกิจกรรมหลายช่องแต่ช่องหนึ่งsourceเดียวส่งแล้วล็อก; exportmissing=skipต่างLevelmissing0; H4แบบอนุมัติแล้วไม่ปิดSQLruntime/gateอื่น; H5/credentialfixtures/UX/rubric/hardware/security/releaseยังรอหลักฐาน; rolealiasesทำให้ownerเดิมdispatchroleปัจจุบันถูกต้อง; ไม่มีอนุญาตimplementที่ติดgateจากผลเอกสารอย่างเดียว

ถ้าเห็นด้วยคืน fenced JSON เดียว:
{"state":"DONE","accept_recovered":true,"recovery_sha256":"74b57a63b8db7ab0118860f0de08d59c634011a702d9d7c54f08fbe8f8bde25b","summary":"...","edits":[],"new_files":[],"json_edits":[],"ready_next":[{"task":"...","role":"...","reason":"..."}],"waiting_on_human":["..."],"questions":[]}

ถ้าไม่เห็นด้วยใช้ accept_recovered:false พร้อมปัญหาที่อ้างpathชัดเจนและdeltaสั้น exactold/new เท่านั้น ห้ามยกคำถามธุรกิจที่ตอบแล้วขึ้นใหม่ ร่างเป็นoutputเดิมที่ยังไม่รับรอง ไม่ถือว่าผู้คุมลงนามแผนแทน gm ต้องให้คุณยืนยันก่อนบันทึกplanจริง ไม่รันSQL/deploy/source/hardware/เรียกroleซ้อน

## Change Log

- 2026-10-23 — นายช่างกู้ร่างเจ้าของแผนและตรวจstatic แล้ว ส่ง gm ยืนยันแบบสั้นแทน regenerate หลัง timeout
