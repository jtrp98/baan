# BE-204 — subsystem tiles + type breakdown buckets

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P2-04`

## Goal

subsystem tiles: `TGroupMenu active=true` ← `TMenu.groupmenuid` ← `TCrmSupport.MenuId` + bucket "ไม่ระบุระบบ" (`MenuId IS NULL`) ท้ายรายการเสมอ · type breakdown รวม bucket "ยังไม่จำแนก" (`AiCategory IS NULL`) ผลรวมทุก bucket = เคสในช่วง — การผูก subsystem ต้องเดินตามสคีมาเดิมเท่านั้น และเคสที่ยังไม่จำแนกต้องไม่ถูก drop เงียบ ๆ ไม่งั้นภาพรวมดูครบเกินจริง

## References

REQ-001, AC-001.3, DES-002, DEC-002

## Scope

ผูกผ่าน path `MenuId → TMenu.groupmenuid → TGroupMenu` พร้อม filter `DeleteDate IS NULL` ทุกชั้น — bucket "ไม่ระบุระบบ"/"ยังไม่จำแนก" ต้องอยู่ในผลลัพธ์เสมอ (ท้ายรายการ)

- Security-sensitive: no

## Out of Scope

สคีมา/ตาราง (อ่านอย่างเดียว) · นิยามกลุ่มที่ใช้ร่วมกับ groups API ของ Phase 3

## Expected Output

none

## Acceptance

AC-001.3: subsystem รวมระดับ `TGroupMenu` (`active=true`) ผ่าน `MenuId → groupmenuid` — ไม่ใช้ `ModuleKey` hardcode และมี bucket สำหรับเคสที่ไม่ระบุระบบ

## Dependencies

—

## Handoff

ตรวจ AC-001.3 ด้วยการเทียบ join path กับ schema + ทดสอบผลรวม bucket เท่าจำนวนเคสในช่วง + tsc/eslint (verified แล้วตามแถวเดิม)
เป็น query ภายใน repository ของโมดูล — revert ได้ ไม่กระทบตารางจริง
ส่งต่อ reviewer

Back-links: `INDEX.md`
