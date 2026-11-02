# สารบัญ UX/UI ของ SchoolBot

> แก้ล่าสุด 2026-11-02 · แก้โดย int · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

เอกสารทั้ง 7 ชุดมีผล Sign-off ครบตามบันทึกเดิม การอนุมัติครอบคลุมรูปแบบ ข้อความ สถานะ การเข้าถึง และ interaction ตามขอบเขตที่เซ็น ไม่ใช่หลักฐาน UI/runtime หรือการอนุมัติฐานข้อมูล ความปลอดภัย อุปกรณ์จริง และการเชื่อมระบบ

| หน้าจอหรือ flow | ใช้ทำอะไร | Sign-off |
|---|---|---|
| [UX-001 เข้าแอป](int-001-entry.md) | ตรวจ License เลือก Guest/Login เข้า shell และปิดแอปโดยรักษางาน | ผู้ใช้ 2026-10-24; มติ 037/038 และตารางเดิม โดยการอ้างมติ 036 ยังมีจุดต้องยืนยันในไฟล์ |
| [UX-003 Labs](int-002-labs.md) | สร้างและทดลองงาน Arm/Block/Code พร้อมสถานะหุ่นและการขอหยุด | ผู้ใช้ 2026-10-24; มติ 037/038 |
| [UX-002 โครงงาน](int-003-projects.md) | จัดโครงงาน Guest/Cloud กู้จากถังขยะ นำเข้า และตรวจประวัติ Guest ใหม่ | ผู้ใช้ 2026-10-24; มติ 039 |
| [UX-004 การเรียน](int-004-learning.md) | เรียนบทเรียน ทำภารกิจ ดูผล Quiz/Test ความคืบหน้า และ Level | ผู้ใช้ 2026-10-24; มติ 039/040; ข้อความหมดเวลาอนุมัติ 2026-10-26 ตามมติ 043 |
| [UX-006 ส่งคะแนน](int-005-mapping.md) | ผูกกิจกรรมกับช่องคะแนน พรีวิว ยืนยัน แก้คะแนนชน และดูประวัติส่ง | ผู้ใช้ 2026-10-24; มติ 041 |
| [UX-005 admin หลักสูตร](int-006-admin-curriculum.md) | สร้างและเผยแพร่หลักสูตร นำเข้า Course Plan Sheet และจัดคลังข้อสอบ | ผู้ใช้ 2026-10-26; มติ 043 ครอบ Q39–Q42 (หลักสูตร/นำเข้า/คลังข้อสอบ/ผลคำขอค้าง) |
| [UX-007 ข้อสอบและเว็บครู](int-007-attempt-policy.md) | ทำข้อสอบ กู้ผล ตั้งเวลา เปิดซ่อม จัดน้ำหนัก และยืนยันเลื่อน Level | ผู้ใช้ 2026-10-26; มติ 043 ครอบ Q43–Q46 (ข้อสอบ/เว็บครู/คะแนน/Level) รวมผลหมดเวลา |

มติอ้างอิง: [มติ 037 (ตัวเลือก Guest/Login และป้ายจำลอง)](../requirement/decisions-037.md), [มติ 038 (อนุมัติ Entry/Labs)](../requirement/decisions-038.md), [มติ 039 (อนุมัติโครงงานและการเรียนบางส่วน)](../requirement/decisions-039.md), [มติ 040 (อนุมัติการเรียนส่วนที่เหลือ)](../requirement/decisions-040.md), [มติ 041 (อนุมัติ mapping และส่งคะแนน)](../requirement/decisions-041.md), [มติ 043 (อนุมัติ admin และข้อสอบ/เว็บครู)](../requirement/decisions-043.md)

## ไฟล์ย่อย

ไฟล์ทางเข้าแต่ละชุดระบุหัวข้อและเลข § สำหรับเทียบตาราง Sign-off; รายการต่อไปนี้เปิดไฟล์ย่อยโดยตรงได้

- ชุด 1: [entry-flow](int-001-entry-flow.md) · [entry-activation](int-001-entry-activation.md) · [entry-validation](int-001-entry-validation.md) · [entry-login](int-001-entry-login.md) · [entry-shell](int-001-entry-shell.md)
- ชุด 2: [labs-block](int-002-labs-block.md) · [labs-a11y](int-002-labs-a11y.md) · [labs-rules-connect](int-002-labs-rules-connect.md) · [labs-profile-workspace](int-002-labs-profile-workspace.md) · [labs-playback-upload](int-002-labs-playback-upload.md) · [labs-stop-reconnect](int-002-labs-stop-reconnect.md) · [labs-projects-code](int-002-labs-projects-code.md)
- ชุด 3: [projects-workspace](int-003-projects-workspace.md) · [projects-save](int-003-projects-save.md) · [projects-trash](int-003-projects-trash.md) · [projects-import](int-003-projects-import.md) · [projects-history](int-003-projects-history.md) · [projects-save-list](int-003-projects-save-list.md) · [projects-save-conflict](int-003-projects-save-conflict.md)
- ชุด 4: [learning-structure](int-004-learning-structure.md) · [learning-lesson](int-004-learning-lesson.md) · [learning-assessment](int-004-learning-assessment.md) · [learning-progress](int-004-learning-progress.md) · [learning-quiz](int-004-learning-quiz.md) · [learning-a11y](int-004-learning-a11y.md)
- ชุด 5: [mapping-permissions](int-005-mapping-permissions.md) · [mapping-audit](int-005-mapping-audit.md) · [mapping-ownership](int-005-mapping-ownership.md) · [mapping-sources-validation](int-005-mapping-sources-validation.md) · [mapping-lock-errors](int-005-mapping-lock-errors.md) · [mapping-preview](int-005-mapping-preview.md) · [mapping-missing](int-005-mapping-missing.md) · [mapping-confirm](int-005-mapping-confirm.md) · [mapping-conflict-status](int-005-mapping-conflict-status.md)
- ชุด 6: [admin-errors-a11y](int-006-admin-errors-a11y.md) · [admin-import-bank](int-006-admin-import-bank.md) · [admin-review-signoff](int-006-admin-review-signoff.md) · [admin-states](int-006-admin-states.md) · [admin-trace](int-006-admin-trace.md) · [admin-trace-acceptance](int-006-admin-trace-acceptance.md) · [admin-trace-contracts](int-006-admin-trace-contracts.md)
- ชุด 7: [ลำดับทำข้อสอบ](int-007-attempt-policy-flow.md) · [recovery-a11y](int-007-recovery-a11y.md) · [states](int-007-states.md) · [teacher-score](int-007-teacher-score.md) · [trace](int-007-trace.md) · [states-flows](int-007-states-flows.md) · [states-auth](int-007-states-auth.md) · [teacher-score-promotion](int-007-teacher-score-promotion.md) · [trace-acceptance](int-007-trace-acceptance.md) · [trace-constraints](int-007-trace-constraints.md) · [teacher-score-timing-weights](int-007-teacher-score-timing-weights.md)


## เงื่อนไขการนำไปใช้

Front ใช้ส่วนที่เซ็นแล้วและตรวจสัญญาของงานที่จะเชื่อมจริงก่อน implement ช่องว่างด้านอ่าน/แก้ร่าง นำเข้า Sheet คลังข้อสอบ อ่าน Attempt ผลหมดเวลา snapshot คะแนน และเส้นทางบริการยังติดตามใน [ช่องว่างสัญญา Learning/UX](../design/learning-ux-contract-gaps-001.md) การอนุมัติ UX ไม่ปิดเงื่อนไขผู้รับผิดชอบ ฐานข้อมูล ความปลอดภัย อุปกรณ์จริง หรือ backend dependencies; H5 คือเงื่อนไข route/env/network/trust ระหว่างระบบ FullLogin ยังไม่มีหลักฐานพร้อมใช้งานจริง กฎ web-system ใช้ DESIGN และ shared props ของ repository ตามเอกสารชุดนี้

## หลักฐาน

- ผลตรวจเอกสารฐานร่าง: check073 PASS (memory: planning/check-073-ux-final-001.md)
- ผลตรวจข้อความหมดเวลาและการปิดข้อพบเอกสาร: check080 และ check082 (memory: planning/check-080-expired-delta-001.md; planning/check-082-expired-spot-001.md)
