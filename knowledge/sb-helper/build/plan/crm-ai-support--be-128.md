# BE-128 — menu catalog เข้า prompt จำแนก

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-16`

## Goal

แก้ `classify-with-gemini.ts` ให้ดึง catalog เมนู (`TMenu` active=true join `TGroupMenu` active=true ผ่าน `groupmenuid`, label `{groupmenu} > {MenuName}`) ส่งเข้า prompt เดียวกับ category/severity ขอ `menuId`/`menuConfidence`/`menuReasoning` คืนมาด้วย — AI จำแนกเมนูได้แม่นเพราะเห็น catalog จริงในรอบเดียวกับ category/severity — ไม่ต้อง vector search และไม่เพิ่มรอบเรียก

## References

REQ-006, AC-006.2, DES-002, DEC-002

## Scope

แก้ prompt/request ของ classify เดิมเท่านั้น — catalog มาจาก `TMenu`/`TGroupMenu` active=true เท่านั้น ผ่าน join `groupmenuid` ตามสคีมา

- Security-sensitive: yes

## Out of Scope

รอบเรียก Gemini เดิมของ category/severity (ส่งรวมใน prompt เดียว ไม่เพิ่มรอบ) · schema/ตาราง · เส้นทาง safety override ที่เหลือ (task ถัดไป)

## Expected Output

Contract:CrmAiMenuClassification.v1

## Acceptance

AC-006.2: catalog ที่ส่งให้ AI สร้างจาก `TMenu` active=true เท่านั้นใน prompt เดียวกับ category/severity — ผลกลับมามี menuId/menuConfidence/menuReasoning ครบ

## Dependencies

—

## Handoff

ตรวจ AC-006.2 ด้วยการอ่าน prompt ที่สร้างจริง (catalog ครบ/label ถูกรูปแบบ) + ผลจำแนกมี 3 ค่าเมนู — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
แก้ไฟล์ classify เดิม — revert ได้ ผลจำแนกเก่าคงอยู่ใน assessment
ส่งต่อ reviewer

Back-links: `INDEX.md`
