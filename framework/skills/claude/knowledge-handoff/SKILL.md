---
name: knowledge-handoff
description: Use at milestone completion, after major architectural decisions, or when handing work from Claude Code to Codex or Antigravity — records ADRs, Knowledge Gaps, plan status, and runs baan --index / --lint-knowledge so provider-neutral knowledge stays the single source of truth.
argument-hint: "<project> [feature-or-topic]"
metadata:
  author: baan
  version: "1.0.0"
---

# 🤝 `knowledge-handoff` — สรุปความรู้และส่งต่องานข้าม 3 ค่ายไม่ให้ตกหล่น

ทำให้ Knowledge Root เป็น **แหล่งความจริงกลางของ Claude Code, Codex และ Antigravity** และให้ผู้ใช้กลับมาดูแลระบบต่อได้ในอีก 6 เดือน

## ขั้นตอนปฏิบัติ

1. **ADR**: มติสำคัญระหว่างงานบันทึกที่ `<project>/decisions/ADR-xxx.md` (หรือ `<project>/shared/adr/` ในโครงสร้างเดิม) ครบ 6 ส่วน: Title, Status, Context & Problem, Options Considered (trade-offs), Decision & Rationale, Consequences & Rollback Plan
2. **Knowledge Gaps (`LEARNING.md`)**: จุดที่ผู้ใช้/ทีมควรเข้าใจเพิ่ม (Priority 1–5) บันทึกที่ `<project>/decisions/knowledge-gaps.md` (หรือ `<project>/shared/knowledge-gaps.md`)
3. **อัปเดต Neutral Knowledge**:
   - สถานะใน `<project>/features/<feature>/plan.md` (หรือ `<project>/modules/<module>/INDEX.md`) ให้ตรงความจริง
   - `repo-map.md` / `coding-pattern.md` / `ui-design-system.md` เฉพาะส่วนที่เปลี่ยนจริง (กระชับ ≤ 15–25 KB)
   - เอกสารหลายไฟล์ส่งให้ `scribe` เขียนตามโครงที่ตกลง (1 writer ต่อ repo)
4. **ตรวจด้วย BAAN Core**:
   ```bash
   baan --index
   baan --lint-knowledge
   ```
   ต้องได้ `0 errors` แล้วเสนอผู้ใช้ `baan sync` / `baan --commit` เพื่อเก็บเข้า Git repo ของ knowledge (ห้าม auto-commit target repo)
5. **สรุป Handoff สำหรับคนและค่ายถัดไป**:
   - **ตัดสินแล้ว & เสร็จแล้ว**: ลิงก์ไฟล์จริงและผลทดสอบ
   - **ไฟล์ที่แก้ / Ownership**: exact paths + branch
   - **คำถามหรือความเสี่ยงค้าง**
   - **Next Step**: ถ้าเปิด Codex หรือ Antigravity ต่อ ควรอ่านไฟล์ไหนก่อนและรันคำสั่งใด
