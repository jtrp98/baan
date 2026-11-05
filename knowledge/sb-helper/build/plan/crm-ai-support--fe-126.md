# FE-126 — auto-trigger classify หลัง createCase

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P1-12`

## Goal

เชื่อม auto-trigger `POST /api/v2/support/crm-ai/cases/[id]/classify` เข้ากับ `createCase` ใน `src/app/pages/support/backlog/crm/_stores/crm-store.ts` (fire-and-forget หลังสร้างเคสสำเร็จ) — เป็นจุดที่ CS สร้างเคสจริง ไม่สร้างหน้าสร้างเคสใหม่ซ้ำ — ทุกเคสต้องถูกจำแนกทันทีที่บันทึก — ต่อที่จุดสร้างเคสจริงเดิมจึงไม่มีเคสไหนหลุดและไม่สร้างช่องทางใหม่แย่งความหมาย

## References

REQ-001, AC-001.1, REQ-002, AC-002.1, DES-001, DEC-001

## Scope

แตะ store ของ backlog/crm จุดเดียว (หลังสร้างเคสสำเร็จ) — fire-and-forget: classify ล้มห้ามทำให้การบันทึกเคสล้ม

- Security-sensitive: yes

## Out of Scope

flow สร้างเคสเดิม (ห้ามบล็อก/ห้ามรอ classify) · type-tag/severity-tag/status-tag mockup เดิมของ backlog (casing คนละแบบกับ `AiCategory` จริง)

## Expected Output

none

## Acceptance

AC-001.1: เคสทุกใบที่สร้างจากฟอร์มเดิมถูกบันทึกปกติและถูกส่งจำแนกทันที — ไม่มีเคสที่ข้ามการจำแนก
AC-002.1: ผลจำแนกปรากฏบนเคสใหม่ผ่านเส้นทาง auto-trigger จริง

## Dependencies

—

## Handoff

ตรวจ AC-001.1/AC-002.1 ด้วยการสร้างเคสจริงผ่านฟอร์มเดิมแล้วเห็น assessment ถูกสร้าง + กรณี classify ล้มการบันทึกเคสยังสำเร็จ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ต่อที่จุดเดียวแบบ fire-and-forget — ถอด trigger คืนได้ทันทีโดย flow สร้างเคสไม่เปลี่ยน
ส่งต่อ reviewer

Back-links: `INDEX.md`
