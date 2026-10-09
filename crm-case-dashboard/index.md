# crm-case-dashboard — Module Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน — เนื้อหา module-level ทั้งหมดอยู่ที่ `requirement\scope.md` · เขียนโดย `business-analyst`
> วิธีอ่าน: อ่าน index ของหมวดที่ packet/brief ชี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด

## Documents

| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `requirement\index.md` | สารบัญ requirement — ตาราง REQ + สถานะ + AC | พร้อม |
| `requirement\scope.md` | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม |
| `design\index.md` | สารบัญ design — feasibility + ตาราง DES + ไฟล์สัญญา | พร้อม |
| `plan\index.md` | สารบัญ plan — release scope, phases, ตาราง Tasks 6 คอลัมน์ | พร้อม |
| `open-questions\index.md` | สารบัญ OQ ทั้งหมด | พร้อม |

## Change Log

- 2026-10-07 — แปลงเอกสารโมดูลเข้าโครงสร้าง split layout (DES-014)
- 2026-08-23 (เย็น): **Amendment ตามมติผู้ใช้ — ไม่เพิ่มตารางใหม่**: ข้อความ § Core Features 4–5 ที่ระบุ "แก้ไขได้ภายหลังผ่านหน้านี้โดย admin" ถูกย้อนเป็น SLA/CSAT settings = code constant (แก้+deploy) หน้า settings display-only · insights เก็บบน `TCrmKnowledgeEntry` Category `INSIGHT_*` · จำนวน/ดีลของ Feature Request derive จากเคสจริง + `TCrmCustomerPromise` — รายละเอียดที่ `design.md` Rev 2
- 2026-08-23: ปิด Open Questions ครบ 3+1 ข้อตามมติผู้ใช้ (subsystem = `TGroupMenu` · MTTR = `UpdateDate − IssueDate` เฉพาะเคสปิด · settings permission = `support.crm_case.settings_manage` [ยกเลิกภายหลังใน Rev 2] · CSAT ส่ง LINE จริง) — design ต่อที่ `design.md`
- 2026-08-16: ย้าย Core Feature "Case Monitor Dashboard & Analytics" ออกจาก `_docs/hkt/module/crm-ai-support/requirement.md` (เคยเพิ่มเป็น Core Feature ข้อ 9/Phase 3 ของ module นั้น) มาเป็น module ใหม่ `crm-case-dashboard` — เหตุผล: วิเคราะห์แล้วพบว่า entity ใหม่ส่วนใหญ่ (SLA/CSAT/insights) ไม่พึ่ง AI classification เลย มีแค่ "จัดกลุ่มเคสตามประเภท" ที่พึ่งจริง กลุ่มผู้ใช้ก็ต่างกัน (ผู้บริหาร/Sale vs. CS/SA/PM) และจำนวน entity ไม่เกี่ยวข้องกันเข้าเกณฑ์ควรแยก module ตาม conventions.md §8 — เนื้อหา Core Features/Scope/Open Questions/References ทั้งหมดยกมาจากที่เคยเขียนไว้ใน `crm-ai-support` โดยไม่เปลี่ยนสาระ
- 2026-09-13: ผูกโครงสร้าง design evidence กับ sb-web-helper @ d98d4e5db59acdb0363a1c12eae3bd22993340da (branch dev/golf) — เพิ่ม DES-001..DES-008 พร้อม Contract/DEC/EVD-001..EVD-025 ครบทุก contract section, เปลี่ยนหัวข้อ "Data Contracts" เป็นหัวข้อ Data Model (เนื้อหาเดิมคงครบ), เพิ่มหัวข้อ Modules — เป็นการจัดโครงสร้าง/ผูกหลักฐานเท่านั้น ไม่แก้กติกาหรือมติใด
- 2026-08-23 (Rev 2): **ยกเลิก 7 ตารางใหม่ทั้งหมด** ตามมติผู้ใช้ "ไม่เพิ่มตาราง เพราะออกแบบตารางมาแล้ว" — ยืนยันสิ่งที่มีจริงด้วย `npx prisma db pull` (194 models) + regenerate schema-map: SLA/CSAT settings → code constants (ผู้ใช้ยอมรับ trade-off admin แก้ UI ไม่ได้ — ย้อน requirement § Core Features 4–5), insights ×3 → `TCrmKnowledgeEntry` Category `INSIGHT_*` + JSON contract, FR counts derive จากเคสจริง, ดีล derive จาก `TCrmCustomerPromise` — เพิ่ม pre-launch gate: filter `Category NOT LIKE 'INSIGHT_%'` ที่ QA retrieval ของ crm-ai-support · ตัด permission ใหม่ `settings_manage` (ไม่มี write settings แล้ว) · จด discovery `TQueueCsatSurvey` = CSAT คิวแชท (คนละ entity)
- 2026-08-23 (Rev 1): เขียน design ชุดแรก + ปิด Open Questions 3+1 ข้อ (subsystem=TGroupMenu · MTTR=UpdateDate−IssueDate เฉพาะเคสปิด · settings permission ใหม่ · CSAT ส่ง LINE จริง) — ข้อความเดิมถูกแทนที่ด้วย Rev 2 นี้
