# BE-301 — GET /groups/[type] ranked list

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P3-01`

## Goal

`GET /api/v2/support/crm-case/groups/[type]` — list กลุ่ม (type ∈ BUG\|FEATURE\|TASK\|QA ตรวจด้วย Zod enum) จัดอันดับ max→avg `ComputedPriorityScore` (NULL ไม่นับ · กลุ่มไม่มี score ท้ายสุด + flag `pendingScore`) + slaLevel chip ✅ (groups.repository/service, raw SQL LEFT JOIN assessment, slaLevel = oldest open vs closeMinutes) — การจัดอันดับกลุ่มต้อง reuse คะแนนที่ crm-ai-support คำนวณไว้ ไม่คิดสูตรใหม่ และกลุ่มที่ยังไม่มี score ต้องถูก flag ไม่ใช่หายไป

## References

REQ-002, AC-002.1, AC-002.2, DES-002, DES-003, DEC-002

## Scope

type ตรวจด้วย Zod enum 4 ค่า — กลุ่ม = เคส `AiCategory` เดียวกัน + `MenuId` เดียวกัน (groupId = `MenuId` หรือ `"none"`) — slaLevel ใช้ `closeMinutes` ของ `CRM_CASE_SLA_TARGETS` (>100% danger / >70% warn / else ok)

- Security-sensitive: no

## Out of Scope

คะแนน/assessment ต้นทางของ crm-ai-support · สคีมาใด ๆ · constant SLA

## Expected Output

Contract:CrmCaseSubsystemGrouping.v1

## Acceptance

AC-002.1: กลุ่มถูกจัดตาม `AiCategory` ที่ crm-ai-support คำนวณไว้ ครบ 4 type ที่ enum รับ
AC-002.2: อันดับใช้ max→avg ของ `ComputedPriorityScore` เท่านั้น — score NULL ไม่ถูกนับและกลุ่มที่ไม่มี score ไปท้ายพร้อม flag `pendingScore`

## Dependencies

—

## Handoff

ตรวจ AC-002.1 และ AC-002.2 ด้วยชุดข้อมูลที่มี/ไม่มี score — เทียบลำดับ + flag + tsc/eslint (verified แล้วตามแถวเดิม)
endpoint ใหม่ additive — revert รายไฟล์ได้ ไม่กระทบตารางจริง
ส่งต่อ reviewer

Back-links: `INDEX.md`
