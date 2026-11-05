---
legacy: true
---
# สารบัญ UX/UI ของ SchoolBot

> แก้ล่าสุด 2026-11-03 · แก้โดย int · ขอโดย ผู้ใช้ (เพิ่มทางเข้าหลักฐาน UX admin และข้อสอบ)

เอกสารทั้ง 7 ชุดมีผล Sign-off ครบตามบันทึกเดิม การอนุมัติครอบคลุมรูปแบบ ข้อความ สถานะ การเข้าถึง และ interaction ตามขอบเขตที่เซ็น ไม่ใช่หลักฐาน UI/runtime หรือการอนุมัติฐานข้อมูล ความปลอดภัย อุปกรณ์จริง และการเชื่อมระบบ

| หน้าจอหรือ flow | ใช้ทำอะไร | Sign-off |
|---|---|---|
| [UX-001 เข้าแอป](../../modules/app-shell/build/legacy-ux/int-001-entry.md) | ตรวจ License เลือก Guest/Login เข้า shell และปิดแอปโดยรักษางาน | ผู้ใช้ 2026-10-24; มติ 037/038 และตารางเดิม โดยการอ้างมติ 036 ยังมีจุดต้องยืนยันในไฟล์ |
| [UX-003 Labs](int-002-labs.md) | สร้างและทดลองงาน Arm/Block/Code พร้อมสถานะหุ่นและการขอหยุด | ผู้ใช้ 2026-10-24; มติ 037/038 |
| [UX-002 โครงงาน](../../modules/my-work/build/legacy-ux/int-003-projects.md) | จัดโครงงาน Guest/Cloud กู้จากถังขยะ นำเข้า และตรวจประวัติ Guest ใหม่ | ผู้ใช้ 2026-10-24; มติ 039 |
| [UX-004 การเรียน](../../modules/quiz/build/legacy-ux/int-004-learning.md) | เรียนบทเรียน ทำภารกิจ ดูผล Quiz/Test ความคืบหน้า และ Level | ผู้ใช้ 2026-10-24; มติ 039/040; ข้อความหมดเวลาอนุมัติ 2026-10-26 ตามมติ 043 |
| [UX-006 ส่งคะแนน](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-005-mapping.md) | ผูกกิจกรรมกับช่องคะแนน พรีวิว ยืนยัน แก้คะแนนชน และดูประวัติส่ง | ผู้ใช้ 2026-10-24; มติ 041 |
| [UX-005 admin หลักสูตร](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-curriculum.md) | สร้างและเผยแพร่หลักสูตร นำเข้า Course Plan Sheet และจัดคลังข้อสอบ | ผู้ใช้ 2026-10-26; มติ 043 ครอบ Q39–Q42 (หลักสูตร/นำเข้า/คลังข้อสอบ/ผลคำขอค้าง) |
| [UX-007 ข้อสอบและเว็บครู](../../modules/quiz/build/legacy-ux/int-007-attempt-policy.md) | ทำข้อสอบ กู้ผล ตั้งเวลา เปิดซ่อม จัดน้ำหนัก และยืนยันเลื่อน Level | ผู้ใช้ 2026-10-26; มติ 043 ครอบ Q43–Q46 (ข้อสอบ/เว็บครู/คะแนน/Level) รวมผลหมดเวลา |

มติอ้างอิง: [มติ 037 (ตัวเลือก Guest/Login และป้ายจำลอง)](../../shared/decisions/decisions-037.md), [มติ 038 (อนุมัติ Entry/Labs)](../../shared/decisions/decisions-038.md), [มติ 039 (อนุมัติโครงงานและการเรียนบางส่วน)](../../shared/decisions/decisions-039.md), [มติ 040 (อนุมัติการเรียนส่วนที่เหลือ)](../../shared/decisions/decisions-040.md), [มติ 041 (อนุมัติ mapping และส่งคะแนน)](../../shared/decisions/decisions-041.md), [มติ 043 (อนุมัติ admin และข้อสอบ/เว็บครู)](../../shared/decisions/decisions-043.md)

## ไฟล์ย่อย

ไฟล์ทางเข้าแต่ละชุดระบุหัวข้อและเลข § สำหรับเทียบตาราง Sign-off; รายการต่อไปนี้เปิดไฟล์ย่อยโดยตรงได้

- ชุด 1: [entry-flow](../../modules/app-shell/build/legacy-ux/int-001-entry-flow.md) · [entry-activation](../../modules/app-shell/build/legacy-ux/int-001-entry-activation.md) · [entry-validation](../../modules/app-shell/build/legacy-ux/int-001-entry-validation.md) · [entry-login](../../modules/app-shell/build/legacy-ux/int-001-entry-login.md) · [entry-shell](../../modules/app-shell/build/legacy-ux/int-001-entry-shell.md)
- ชุด 2: [labs-block](../../modules/block-lab/build/legacy-ux/int-002-labs-block.md) · [labs-a11y](int-002-labs-a11y.md) · [labs-rules-connect](../../modules/arm-lab/build/legacy-ux/int-002-labs-rules-connect.md) · [labs-profile-workspace](../../modules/arm-lab/build/legacy-ux/int-002-labs-profile-workspace.md) · [labs-playback-upload](../../modules/arm-lab/build/legacy-ux/int-002-labs-playback-upload.md) · [labs-stop-reconnect](../../modules/arm-lab/build/legacy-ux/int-002-labs-stop-reconnect.md) · [labs-projects-code](../../modules/code-lab/build/legacy-ux/int-002-labs-projects-code.md)
- ชุด 3: [projects-workspace](../../modules/my-work/build/legacy-ux/int-003-projects-workspace.md) · [projects-save](../../modules/my-work/build/legacy-ux/int-003-projects-save.md) · [projects-trash](../../modules/my-work/build/legacy-ux/int-003-projects-trash.md) · [projects-import](../../modules/my-work/build/legacy-ux/int-003-projects-import.md) · [projects-history](../../modules/my-work/build/legacy-ux/int-003-projects-history.md) · [projects-save-list](../../modules/my-work/build/legacy-ux/int-003-projects-save-list.md) · [projects-save-conflict](../../modules/my-work/build/legacy-ux/int-003-projects-save-conflict.md)
- ชุด 4: [learning-structure](../../modules/quiz/build/legacy-ux/int-004-learning-structure.md) · [learning-lesson](../../modules/quiz/build/legacy-ux/int-004-learning-lesson.md) · [learning-assessment](../../modules/quiz/build/legacy-ux/int-004-learning-assessment.md) · [learning-progress](../../modules/quiz/build/legacy-ux/int-004-learning-progress.md) · [learning-quiz](../../modules/quiz/build/legacy-ux/int-004-learning-quiz.md) · [learning-a11y](../../modules/quiz/build/legacy-ux/int-004-learning-a11y.md)
- ชุด 5: [mapping-permissions](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-005-mapping-permissions.md) · [mapping-audit](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-005-mapping-audit.md) · [mapping-ownership](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-005-mapping-ownership.md) · [mapping-sources-validation](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-005-mapping-sources-validation.md) · [mapping-lock-errors](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-005-mapping-lock-errors.md) · [mapping-preview](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-005-mapping-preview.md) · [mapping-missing](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-005-mapping-missing.md) · [mapping-confirm](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-005-mapping-confirm.md) · [mapping-conflict-status](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-005-mapping-conflict-status.md)
- ชุด 6: [admin-errors-a11y](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-errors-a11y.md) · [admin-import-bank](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-import-bank.md) · [admin-review-signoff](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-review-signoff.md) · [admin-states](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-states.md) · [admin-trace](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-trace.md) · [admin-trace-acceptance](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-trace-acceptance.md) · [admin-trace-contracts](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-trace-contracts.md)
- ชุด 7: [ลำดับทำข้อสอบ](../../modules/quiz/build/legacy-ux/int-007-attempt-policy-flow.md) · [recovery-a11y](../../modules/quiz/build/legacy-ux/int-007-recovery-a11y.md) · [states](../../modules/quiz/build/legacy-ux/int-007-states.md) · [teacher-score](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-007-teacher-score.md) · [trace](../../modules/quiz/build/legacy-ux/int-007-trace.md) · [states-flows](../../modules/quiz/build/legacy-ux/int-007-states-flows.md) · [states-auth](../../modules/quiz/build/legacy-ux/int-007-states-auth.md) · [teacher-score-promotion](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-007-teacher-score-promotion.md) · [trace-acceptance](../../modules/quiz/build/legacy-ux/int-007-trace-acceptance.md) · [trace-constraints](../../modules/quiz/build/legacy-ux/int-007-trace-constraints.md) · [teacher-score-timing-weights](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-007-teacher-score-timing-weights.md)


## หลักฐานสำหรับตรวจแบบที่อนุมัติ

- [UX-005 หลักสูตรและคลังข้อสอบ](evidence-ux-005.md): ตารางครบ 12 เกณฑ์ตรวจรับ อ้างหน้าจอและสถานะที่อนุมัติ พร้อม expected และข้อจำกัดหลักฐานจริง
- [UX-007 ข้อสอบ นโยบายคะแนน และเลื่อน Level](../../modules/quiz/build/legacy-ux/evidence-ux-007.md): ตารางครบ 16 เกณฑ์ตรวจรับ รวมผลหมดเวลา
- [เงื่อนไขร่วมและสัญญาปัจจุบัน](evidence-ux-preconditions.md): เทียบ preconditions กับมติอนุมัติและ DES ล่าสุด โดยแยกการอนุมัติ UX ออกจากผล UI/runtime

## เงื่อนไขการนำไปใช้

Front ใช้ส่วนที่เซ็นแล้วและตรวจสัญญาของงานที่จะเชื่อมจริงก่อน implement ช่องว่างด้านอ่าน/แก้ร่าง นำเข้า Sheet คลังข้อสอบ อ่าน Attempt ผลหมดเวลา snapshot คะแนน และเส้นทางบริการยังติดตามใน [ช่องว่างสัญญา Learning/UX](../design/learning-ux-contract-gaps-001.md) การอนุมัติ UX ไม่ปิดเงื่อนไขผู้รับผิดชอบ ฐานข้อมูล ความปลอดภัย อุปกรณ์จริง หรือ backend dependencies; H5 คือเงื่อนไข route/env/network/trust ระหว่างระบบ FullLogin ยังไม่มีหลักฐานพร้อมใช้งานจริง กฎ web-system ใช้ DESIGN และ shared props ของ repository ตามเอกสารชุดนี้

## หลักฐาน

- ผลตรวจเอกสารฐานร่าง: check073 PASS (memory: planning/check-073-ux-final-001.md)
- ผลตรวจข้อความหมดเวลาและการปิดข้อพบเอกสาร: check080 และ check082 (memory: planning/check-080-expired-delta-001.md; planning/check-082-expired-spot-001.md)

