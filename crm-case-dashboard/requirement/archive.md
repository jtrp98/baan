# CRM Case Monitor Dashboard — Requirements

## Overview

หน้า Dashboard ผู้บริหาร/Sale/SA/PM สำหรับติดตามภาพรวมเคส CRM Support — เคสเปิดค้าง, MTTR, CSAT, SLA, จัดกลุ่มเคสตามประเภทพร้อมจัดอันดับความเร่งด่วน, สรุปตามโรงเรียน, และรายงานเชิงลึก (Process Bottleneck / Recurring Tasks / Feature Request) UI ออกแบบและ confirm ไว้แล้วเป็น mockup ที่ `src/app/pages/support/crm` (ข้อมูลทั้งหมดเป็น mock ยังไม่ผูก DB จริง) งานนี้คือการต่อข้อมูลจริงเข้ากับ UI ที่มีอยู่แล้ว ไม่ใช่ออกแบบ UI ใหม่

**แยกเป็น module ของตัวเอง** (ไม่รวมกับ `crm-ai-support`) แม้จะแตะ `TCrmSupport` ตารางเดียวกันและอ่านผลจากโมดูลนั้น เพราะ:
- Entity ใหม่ส่วนใหญ่ (SLA settings, CSAT settings+survey, insights 3 ประเภท) ไม่ได้พึ่ง AI classification เลย — มีจุดที่พึ่งจริงแค่ "จัดกลุ่มเคสตามประเภท" ที่อ่าน `AiCategory`/`ComputedPriorityScore` จาก `crm-ai-support`
- กลุ่มผู้ใช้ต่างกัน (ผู้บริหาร/Sale/SA/PM มองภาพรวม vs. CS/SA/PM ทำงานรายเคสใน crm-ai-support)
- จำนวน entity ใหม่ที่ไม่เกี่ยวข้องกันมาก (SLA/CSAT/insights ×3) เข้าเกณฑ์ "many unrelated entities" ที่ควรแยก module ตาม `.claude/shared/conventions.md` §8

**Cross-module dependency**: อ่าน `AiCategory`, `ComputedPriorityScore`, `MenuId` จาก `TCrmSupport`/`TCrmCaseAiAssessment` ที่ module `crm-ai-support` เป็นเจ้าของ (schema เดียวกัน — jabjai-master-single-db) — ไม่ทำซ้ำ ไม่เขียนทับ

## Target Users & Roles

- **ผู้บริหาร/Sale**: ดูภาพรวมเคส, MTTR, CSAT, โรงเรียนที่แจ้งบ่อย, subsystem ที่มีปัญหาบ่อย (หน้า `/pages/support/crm` หลัก)
- **SA**: จัดกลุ่มเคส วิเคราะห์ Root Cause ต่อ (ลิงก์ต่อจาก groups/[type]) กรอก Process Bottleneck/Recurring Tasks ใน insights
- **PM**: ดู Feature Request พร้อมจำนวนโรงเรียน/ดีลที่เกี่ยวข้องใน insights, ใช้ประกอบการตัดสินใจ backlog
- ตั้งค่า SLA/CSAT: ผู้ดูแลระบบ/หัวหน้า Support (permission เฉพาะ ยังไม่ระบุ role ชัดเจน — ดู Open Questions)

## Core Features

### REQ-001 — 1. ภาพรวมเคส (`/pages/support/crm`)
การ์ดสรุปเคสเปิดค้าง, MTTR (Average Fix Time), CSAT Score, กราฟแนวโน้มรายวัน, โรงเรียนที่แจ้งบ่อยสุด, subsystem/เมนูที่มีปัญหาบ่อยสุด, เคสเร่งด่วนอันดับต้น, สรุปจำนวนตามประเภทเคส (type breakdown)

**Acceptance criteria:**
- AC-001.1: หน้าภาพรวมแสดงครบทุกการ์ด: เคสเปิดค้าง, MTTR, CSAT Score, กราฟแนวโน้มรายวัน, โรงเรียนที่แจ้งบ่อยสุด, subsystem/เมนูที่มีปัญหาบ่อยสุด, เคสเร่งด่วนอันดับต้น และสรุปจำนวนตามประเภทเคส — ผูกข้อมูลจริงแทน mock data
- AC-001.2: MTTR คำนวณเป็น avg(`UpdateDate` − `IssueDate`) เฉพาะเคสที่ Status ปิด (CLOSED + RESOLVED) เท่านั้น โดย raw elapsed ไม่ปรับ business-hours ใน MVP (มติ 2026-08-23)
- AC-001.3: subsystem ที่แสดงรวมระดับ `TGroupMenu` (`active=true`) โดย map เคสผ่าน `MenuId → TMenu.groupmenuid` — ไม่ใช้ `ModuleKey` hardcode (มติ 2026-08-23)

### REQ-002 — 2. จัดกลุ่มเคสตามประเภท (`groups/[type]`)
จัดกลุ่มเคสตาม `AiCategory` (จาก `crm-ai-support`) พร้อมจัดอันดับความเร่งด่วนของแต่ละกลุ่ม — **ใช้ `ComputedPriorityScore` ที่ `crm-ai-support` คำนวณไว้แล้วเป็นฐานการจัดอันดับ ไม่คิดสูตรใหม่** (ยืนยันกับผู้ใช้แล้ว) ไล่ดูรายละเอียดกลุ่ม → รายละเอียดเคสเดี่ยว (message thread, timeline, ผู้รับผิดชอบ, คะแนน CSAT ของเคสนั้น)

**Acceptance criteria:**
- AC-002.1: เคสถูกจัดกลุ่มตาม `AiCategory` ที่ `crm-ai-support` คำนวณไว้
- AC-002.2: การจัดอันดับความเร่งด่วนของแต่ละกลุ่มใช้ `ComputedPriorityScore` ที่ `crm-ai-support` คำนวณไว้แล้วเป็นฐาน — ไม่คิดสูตรใหม่
- AC-002.3: ไล่ดูจากกลุ่ม → รายละเอียดเคสเดี่ยวได้ พร้อม message thread, timeline, ผู้รับผิดชอบ และคะแนน CSAT ของเคสนั้น

### REQ-003 — 3. สรุปตามโรงเรียน (`schools/[schoolName]`)
ตารางเคสของโรงเรียนหนึ่งๆ

**Acceptance criteria:**
- AC-003.1: เลือกโรงเรียนหนึ่งๆ แล้วหน้า schools/[schoolName] แสดงตารางเคสของโรงเรียนนั้นได้

### REQ-004 — 4. ตั้งค่า SLA (`settings/sla`)
เป้าหมายเวลาตอบ/ปิดเคสต่อระดับความรุนแรง (P1–P4), จุดเริ่ม/จุดหยุดนับเวลา, เวลาทำการ, ช่วงเวลาที่ยกเว้นการนับ (SLA exclusions) — **ตัวเลขในหน้า mockup ปัจจุบัน (เช่น P1 = 15 นาที/1 วัน, เวลาทำการ 08:30–17:30 จ.–ศ.) เป็นค่า default จริงที่ยืนยันแล้ว ไม่ใช่ placeholder** — ต้อง seed เป็นค่าเริ่มต้นในระบบ และแก้ไขได้ภายหลังผ่านหน้านี้โดย admin

**Acceptance criteria:**
- AC-004.1: ระบบ seed ค่า default SLA ตาม mockup (เช่น P1 = 15 นาที/1 วัน, เวลาทำการ 08:30–17:30 จ.–ศ.) เป็นค่าเริ่มต้นจริง ไม่ใช่ placeholder
- AC-004.2: หน้า settings/sla เป็น display-only — การแก้ค่า SLA ทำผ่าน code constant และ deploy ตามมติ Change Log 2026-08-23 (Rev 2) ที่ย้อนข้อความเดิมของข้อนี้ ไม่ใช่แก้ผ่านหน้าเว็บ

### REQ-005 — 5. ตั้งค่า CSAT (`settings/csat`)
มาตรวัด (ดาว 1–5), เกณฑ์นับว่าพอใจ (≥4 ดาว), จังหวะถามความเห็น, ช่องทางส่งแบบสอบถาม, กติกาการยกระดับเมื่อคะแนนต่ำ — **ค่าที่มีอยู่ใน mockup เป็นค่า default จริงที่ยืนยันแล้วเช่นกัน** แก้ไขได้ภายหลังผ่านหน้านี้

**Acceptance criteria:**
- AC-005.1: ระบบ seed ค่า default CSAT ตาม mockup (มาตรวัดดาว 1–5, เกณฑ์นับว่าพอใจ ≥4 ดาว) เป็นค่าเริ่มต้นจริง และหน้า settings/csat เป็น display-only — แก้ผ่าน code constant และ deploy ตามมติ Change Log 2026-08-23 (Rev 2)
- AC-005.2: แบบสอบถาม CSAT ส่งผ่าน LINE จริงและเก็บคะแนนจริง โดย reuse ลูปเดิมที่มีอยู่แล้ว (`TCrmFeedback` + `crm-line-notify.service.ts` + `/liff/crm-feedback`) (มติ 2026-08-23)

### REQ-006 — 6. รายงานเชิงลึก (`insights`)
Process Bottleneck, Recurring Tasks (พร้อมสถานะ SOP), Feature Request (พร้อมจำนวนโรงเรียน/ดีลที่เกี่ยวข้อง) — **ทั้งหมดเป็นข้อมูลที่ SA/PM กรอกเองผ่านฟอร์ม ไม่ใช่ระบบตรวจจับ/คำนวณอัตโนมัติใน MVP นี้** (ยืนยันกับผู้ใช้แล้ว — เหตุผลคือความซับซ้อนของ auto-detect ไม่คุ้มกับ MVP) รวมถึงคอลัมน์ "ดีล" ใน Feature Request ก็กรอกเองเช่นกัน ไม่ได้ดึงจากระบบ Sales pipeline ใดๆ ที่มีอยู่

**Acceptance criteria:**
- AC-006.1: insights ทั้ง 3 ประเภท (Process Bottleneck / Recurring Tasks พร้อมสถานะ SOP / Feature Request) ถูกกรอกเองโดย SA/PM ผ่านฟอร์ม — ไม่มีระบบตรวจจับ/คำนวณอัตโนมัติใน MVP นี้
- AC-006.2: ข้อมูล insights เก็บบน `TCrmKnowledgeEntry` ด้วย Category `INSIGHT_*` (มติ Change Log 2026-08-23 Rev 2)
- AC-006.3: จำนวนโรงเรียน/ดีลของ Feature Request derive จากเคสจริง + `TCrmCustomerPromise` (มติ Rev 2) — ไม่ดึงจากระบบ Sales pipeline

## Scope

### MVP (must-have)
- ทุกฟีเจอร์ใน § Core Features ข้อ 1–6 ต่อจาก mockup ที่มีอยู่แล้ว — ผูกข้อมูลจริงแทน mock data ทั้งหมด
- ตั้งค่า SLA/CSAT พร้อมค่า default ตาม mockup, แก้ไขได้ภายหลัง
- Insights กรอกเองโดย SA/PM ผ่านฟอร์ม

### Later (nice-to-have)
- Auto-detect สำหรับ Process Bottleneck/Recurring Tasks/Feature Request (แทนการกรอกเอง)
- เชื่อม Feature Request กับระบบ Sales pipeline จริงสำหรับคอลัมน์ "ดีล"
- ไม่มีกำหนดเส้นตายตายตัว

## Constraints & Assumptions

- ต้องทำหลัง `crm-ai-support` Phase 1 มีข้อมูลจริงแล้ว (ต้องการ `AiCategory`/`ComputedPriorityScore`/`MenuId`) — ไม่ใช่ hard blocker สำหรับหน้าที่ไม่พึ่ง AI (เช่น settings/sla, settings/csat) แต่หน้า groups/[type] และ dashboard บางการ์ดต้องรอ
- ข้อมูลเมนูที่ใช้แสดงผลต้องกรองเฉพาะเมนูที่ "เปิดใช้งานจริง" เท่านั้น (คอลัมน์ `active` ไม่ใช่ `actvice` ที่สะกดผิดในระบบเดิม — ดู `_docs/schema-map/jabjai-master-single-db.md`)

## Open Questions

> **ปิดครบแล้ว 2026-08-23** — มติทั้ง 3 ข้อยืนยันกับผู้ใช้และออกแบบต่อจบที่ `design.md` § การตัดสินใจที่ผู้ใช้ยืนยันแล้ว (ข้อความเดิมเก็บไว้ด้านล่างเป็นประวัติ)

- ~~**Subsystem/module ใน mockup dashboard** (`ModuleKey` เช่น `fin`/`att`/`grade` ใน `crm/_data/crm.types.ts`)~~ → **มติ: ผูก `TMenu` → รวมระดับ `TGroupMenu`** (`active=true`) เป็น subsystem, เคส map ผ่าน `MenuId → TMenu.groupmenuid`, `ModuleKey` hardcode เลิกใช้
- ~~**MTTR ("Average Fix Time")**~~ → **มติ: MTTR = avg(`UpdateDate` − `IssueDate`) เฉพาะเคส Status ปิด (alias CLOSED+RESOLVED)** — raw elapsed ไม่ปรับ business-hours ใน MVP
- ~~สิทธิ์ตั้งค่า SLA/CSAT ควรเป็น role ไหน~~ → **มติ: ค่า permission ใหม่ `support.crm_case.settings_manage`** มอบผ่านหน้าจัดการสิทธิ์ให้ role หัวหน้า Support/admin
- **(เพิ่ม/ปิด 2026-08-23)** CSAT MVP ส่งจริงไหม → **มติ: ส่ง LINE จริง + เก็บคะแนนจริง** — reuse ลูปเดิมที่มีอยู่แล้ว (`TCrmFeedback` + `crm-line-notify.service.ts` + `/liff/crm-feedback`)

## Declined / Not Pursuing

_(ยังไม่มีรายการ)_

## References

| หัวข้อ | แหล่งที่มา | วันที่ | หมายเหตุ |
|---|---|---|---|
| SLA targets/เวลาทำการ/exclusions (P1=15นาที/1วัน ฯลฯ) | UI mockup ที่มีอยู่จริง: `src/app/pages/support/crm/settings/sla/_data/sla-mock.data.ts` | 2026-08-16 | ยืนยันกับผู้ใช้แล้วว่าเป็นค่า default จริง ไม่ใช่ placeholder |
| CSAT scale/กติกา (ดาว 1–5, ≥4=พอใจ ฯลฯ) | UI mockup ที่มีอยู่จริง: `src/app/pages/support/crm/settings/csat/_data/csat-mock.data.ts` | 2026-08-16 | ยืนยันกับผู้ใช้แล้วว่าเป็นค่า default จริง |

## Change Log

- 2026-08-23 (เย็น): **Amendment ตามมติผู้ใช้ — ไม่เพิ่มตารางใหม่**: ข้อความ § Core Features 4–5 ที่ระบุ "แก้ไขได้ภายหลังผ่านหน้านี้โดย admin" ถูกย้อนเป็น SLA/CSAT settings = code constant (แก้+deploy) หน้า settings display-only · insights เก็บบน `TCrmKnowledgeEntry` Category `INSIGHT_*` · จำนวน/ดีลของ Feature Request derive จากเคสจริง + `TCrmCustomerPromise` — รายละเอียดที่ `design.md` Rev 2
- 2026-08-23: ปิด Open Questions ครบ 3+1 ข้อตามมติผู้ใช้ (subsystem = `TGroupMenu` · MTTR = `UpdateDate − IssueDate` เฉพาะเคสปิด · settings permission = `support.crm_case.settings_manage` [ยกเลิกภายหลังใน Rev 2] · CSAT ส่ง LINE จริง) — design ต่อที่ `design.md`
- 2026-08-16: ย้าย Core Feature "Case Monitor Dashboard & Analytics" ออกจาก `_docs/hkt/module/crm-ai-support/requirement.md` (เคยเพิ่มเป็น Core Feature ข้อ 9/Phase 3 ของ module นั้น) มาเป็น module ใหม่ `crm-case-dashboard` — เหตุผล: วิเคราะห์แล้วพบว่า entity ใหม่ส่วนใหญ่ (SLA/CSAT/insights) ไม่พึ่ง AI classification เลย มีแค่ "จัดกลุ่มเคสตามประเภท" ที่พึ่งจริง กลุ่มผู้ใช้ก็ต่างกัน (ผู้บริหาร/Sale vs. CS/SA/PM) และจำนวน entity ไม่เกี่ยวข้องกันเข้าเกณฑ์ควรแยก module ตาม conventions.md §8 — เนื้อหา Core Features/Scope/Open Questions/References ทั้งหมดยกมาจากที่เคยเขียนไว้ใน `crm-ai-support` โดยไม่เปลี่ยนสาระ
