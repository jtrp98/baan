# BE-106 — CRM_SLA_RULES constant (v1)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-06`

## Goal

เพิ่ม `CRM_SLA_RULES` code constant แบบ versioned (version tag ตรงกับ `TCrmCaseAiAssessment.SlaRuleVersion`) — ค่าเริ่มต้น: severity weight CRITICAL/HIGH/MEDIUM/LOW = 100/70/40/10, contract-tier multiplier 1.0–2.0, `AiConfidence` threshold ส่งเข้า `NEEDS_HUMAN` = 0.6 — สูตรคะแนนและ threshold ต้องมาจากค่าเดียวที่แก้ได้โดย deploy ไม่ใช่ค่ากระจายในโค้ด — ผู้ใช้ยืนยันให้ตั้งค่าเริ่มต้นชั่วคราวเพื่อไม่ให้ Phase 1 ค้าง

## References

REQ-003, AC-003.1, AC-003.3, DES-005, DEC-005

## Scope

ไฟล์ constant ใหม่ 1 ไฟล์ (`crm-sla-rule.constant.ts`) — เก็บ version tag คู่กับค่าทุกตัว ห้ามให้ไฟล์นี้รู้จัก Prisma (การนับข้อมูลเป็นงาน repository/service ตาม DEC-005)

- Security-sensitive: yes

## Out of Scope

schema/ตาราง · call site ที่คำนวณคะแนน (import ค่าเท่านั้น) · ค่า threshold ที่ยืนยันไว้ (แก้ = ผ่าน version bump ตามกติกา)

## Expected Output

none

## Acceptance

AC-003.1: น้ำหนัก severity และตัวคูณอยู่ใน constant ตรงชุดที่ยืนยันไว้ ณ งานนี้ (คะแนน = weight × multiplier) — ค่ามาจาก constant เดียว
AC-003.3: constant มี version tag ผูกกับ `TCrmCaseAiAssessment.SlaRuleVersion` — อ่านคะแนนเก่าย้อนตามเวอร์ชันได้

## Dependencies

—

## Handoff

ตรวจ AC-003.1 ด้วยการเทียบค่า constant กับชุดที่ยืนยัน · ตรวจ AC-003.3 ด้วยการอ่านจุดเขียน `SlaRuleVersion` ว่าอ่านจาก constant — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ constant ใหม่ additive — แก้ค่าหลังใช้งานต้อง bump version ตามกติกา ไม่แก้ข้ามเวอร์ชัน
ส่งต่อ reviewer

Back-links: `INDEX.md`
