---
name: knowledge-handoff
description: Use at milestone completion, after major architectural decisions, or when handing off work from Antigravity to Claude Code or Codex via provider-neutral Knowledge files, ADR records, Knowledge Gaps, and baan sync.
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "<project> [feature-or-topic]"
---

# 🤝 `knowledge-handoff` — สรุปความรู้และส่งต่องานข้าม 3 ค่ายอย่างไม่ตกหล่น

ทำให้เอกสารใน Knowledge Root เป็น **แหล่งความจริงกลางของทั้ง Antigravity, Claude Code และ Codex** และช่วยให้ผู้ใช้กลับมาดูแลระบบต่อได้ในอีก 6 เดือน

## ขั้นตอนปฏิบัติ

1. **บันทึกการตัดสินใจสถาปัตยกรรม (ADR)**:
   - หากมีมติสำคัญระหว่างงาน ให้บันทึกหรืออัปเดต `<project>/decisions/ADR-xxx.md` (หรือ `<project>/shared/adr/` ในโปรเจกต์เดิม) ครบ 6 ส่วน: Title, Status, Context & Problem, Options Considered (Trade-offs), Decision & Rationale, Consequences & Rollback Plan
2. **อัปเดต Knowledge Gaps (`LEARNING.md`)**:
   - หากพบจุดที่ผู้ใช้หรือทีมควรทำความเข้าใจเพิ่มเติม (Priority 1–5) ให้บันทึก/อัปเดตใน `<project>/decisions/knowledge-gaps.md` (หรือ `<project>/shared/knowledge-gaps.md`)
3. **อัปเดต Neutral Knowledge กลาง**:
   - ปรับสถานะใน `<project>/features/<feature>/plan.md` (หรือ `<project>/modules/<module>/INDEX.md`) ให้ตรงความจริงปัจจุบัน
   - อัปเดต `repo-map.md` / `coding-pattern.md` / `ui-design-system.md` เฉพาะส่วนที่เปลี่ยนจริง (รักษาขนาดให้กระชับ ≤ 15–25 KB)
4. **ตรวจความสมบูรณ์ด้วย BAAN Core**:
   ```bash
   baan --index
   baan --lint-knowledge
   ```
   ต้องได้ `0 errors` และเสนอผู้ใช้รัน `baan sync` / `baan --commit` เพื่อเก็บเข้า Git repo ของ Knowledge (ห้าม auto-commit target repo)
5. **เขียนสรุป Handoff สำหรับคนและค่ายถัดไป**:
   - **สิ่งที่ตัดสินแล้ว & ทำเสร็จ**: พร้อมลิงก์ไฟล์จริงและผลทดสอบ
   - **ไฟล์ที่แก้ไข / Ownership**: list exact paths + branch
   - **คำถามหรือความเสี่ยงค้าง (Open Questions / Known Limits)**
   - **Next Step**: บอกชัดเจนว่าถ้าเปิด Claude Code หรือ Codex ต่อ ควรเริ่มอ่านไฟล์ไหนและรันคำสั่งใดต่อ
