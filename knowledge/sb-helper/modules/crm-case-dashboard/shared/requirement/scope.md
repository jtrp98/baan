---
owner: spec
---
# crm-case-dashboard — Requirement Scope (เนื้อหา module-level)

> Budget ≤ 12 KB (`policies\documentation.md` §4) · เขียนโดย `business-analyst` · เนื้อหา module-level ทั้งหมดอยู่ที่นี่ — module `index.md` เป็นสารบัญล้วน

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


## Declined / Not Pursuing

_(ยังไม่มีรายการ)_


## References

| หัวข้อ | แหล่งที่มา | วันที่ | หมายเหตุ |
|---|---|---|---|
| SLA targets/เวลาทำการ/exclusions (P1=15นาที/1วัน ฯลฯ) | UI mockup ที่มีอยู่จริง: `src/app/pages/support/crm/settings/sla/_data/sla-mock.data.ts` | 2026-08-16 | ยืนยันกับผู้ใช้แล้วว่าเป็นค่า default จริง ไม่ใช่ placeholder |
| CSAT scale/กติกา (ดาว 1–5, ≥4=พอใจ ฯลฯ) | UI mockup ที่มีอยู่จริง: `src/app/pages/support/crm/settings/csat/_data/csat-mock.data.ts` | 2026-08-16 | ยืนยันกับผู้ใช้แล้วว่าเป็นค่า default จริง |


## Change Log

- 2026-10-07 — Migrated to DES-014 split layout

Back-links: `index.md` · `../../INDEX.md`
