# school-bot — UX/UI Index

สถานะปัจจุบัน 2026-10-26: **เซ็นครบ 7/7 ชุด** ตาม decisions-036..041 และ [decisions-043](../requirement/decisions-043.md). Q39–Q46 รวม expired-copy delta042 อนุมัติแล้ว ไม่ถามซ้ำ

| ไฟล์ | ขอบเขต | สถานะ |
|---|---|---|
| [int-001-entry.md](int-001-entry.md) | UX-001 Entry/License/Guest-Login/Shell | อนุมัติครบ decisions-036/037/038 |
| [int-002-labs.md](int-002-labs.md) | UX-003 Labs สามโหมด | อนุมัติครบ decisions-037/038 |
| [int-003-projects.md](int-003-projects.md) | UX-002 Projects/Guest/import/history | อนุมัติครบ decisions-039 |
| [int-004-learning.md](int-004-learning.md) | UX-004 Learning/Quiz-Test/Level | อนุมัติครบ decisions-039/040; delta042 ตาม decisions-043 |
| [int-005-mapping.md](int-005-mapping.md) | UX-006 Mapping/preview/conflict/export | อนุมัติครบ decisions-041 |
| [int-006-admin-curriculum.md](int-006-admin-curriculum.md) | UX-005 Admin หลักสูตร/import/bank และ companion ทั้งชุด | อนุมัติ Q39–Q42 ครบ ผู้ใช้ 2026-10-26 · decisions-043 |
| [int-007-attempt-policy.md](int-007-attempt-policy.md) | UX-007 Attempt/policy/teacher/Level และ companion ทั้งชุด | อนุมัติ Q43–Q46 รวม delta042 ผู้ใช้ 2026-10-26 · decisions-043 |

ผลตรวจเอกสาร: [check073](../planning/check-073-ux-final-001.md) PASS ฐานร่าง; [check080](../planning/check-080-expired-delta-001.md) และ [check082](../planning/check-082-expired-spot-001.md) ตรวจ delta/ปิดข้อพบเอกสารแล้ว

การเซ็นครอบรูปแบบ ข้อความ state/a11y และ interaction ตามร่าง ไม่ใช่หลักฐาน UI/runtime; [ช่องว่าง LUX-01..07](../design/learning-ux-contract-gaps-001.md), owner/H5/DB/security/hardware gates และ backend dependencies คงอยู่. FullLogin ยัง NOT_READY. Front ใช้ส่วนที่เซ็นแล้วและตรวจสัญญาของงานที่เชื่อมจริงก่อน implement; กฎ web-system ยึด repo/DESIGN/shared props ตามร่าง
