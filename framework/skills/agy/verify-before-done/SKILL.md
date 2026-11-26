---
name: verify-before-done
description: Mandatory verification gate before claiming any task, feature, bugfix, or UI change is done. Runs real build/targeted/full test commands, checks git diff scope, dispatches fresh-eyes code-review for medium/high risk, checks UI via browser when applicable, and syncs knowledge.
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "<project> [target-repo]"
---

# ✅ `verify-before-done` — ประตูตรวจรับจริงก่อนรายงานว่างานเสร็จ

ห้ามรายงานว่างานเสร็จหรือเทสต์ผ่านจากการคาดคะเน ทุกคำกล่าวอ้างต้องมีคำสั่งจริง ผลรันล่าสุดหลังแก้ไขครั้งสุดท้าย และหลักฐานที่ตรวจซ้ำได้

## เช็กลิสต์บังคับ 6 ขั้น

1. **รันคำสั่ง Build และ Test จริง (หลังแก้ไขบรรทัดสุดท้าย)**:
   - รัน `build`, `test_targeted` และ `test_full` ตาม `<project>/repo-map.md` หรือแผนที่อนุมัติ (.NET ใช้ `dotnet test --logger "console;verbosity=normal"`)
   - งาน `bugfix` ต้องมีทั้งหลักฐาน **Red Test (fail ก่อนแก้)** และ **Green + Regression (ผ่านหลังแก้)**
   - ห้ามลด assertion, skip test หรือแก้ test เดิมเพื่อให้ผ่านโดยไม่มีเหตุผลตาม AC
2. **ตรวจขอบเขตการแก้ไขและ Git Safety**:
   - รัน `git status` และ `git diff --stat` ใน target repo ตรวจว่าไฟล์ที่แก้ทั้งหมดอยู่ในขอบเขต (`owns`) ที่ตกลงไว้
   - ห้าม `commit`, `push`, `reset`, `checkout` หรือเปลี่ยน branch ของ `target/*` โดยไม่มีคำสั่งชัดเจน
3. **Independent Fresh-Eyes Review (สำหรับงานเสี่ยงกลาง–สูง หรือแก้หลายไฟล์)**:
   - ส่งต่อให้ `code-review` ผ่าน `invoke_subagent` (หรือ `run_workflow` parallel lenses) โดยส่ง **เฉพาะ AC, contracts, diff และ file paths** (ห้ามส่งคำอธิบายของคนทำ)
   - แก้ประเด็น `Critical`/`High` ทั้งหมดแล้วรัน verification commands ใหม่อีกครั้ง
4. **UI & Visual Verification (เมื่อแตะหน้าจอ)**:
   - ตรวจด้วย `browser` subagent (`Model: "flash"`) และกฎ `ui-design-system` ว่าครบ 5 states (`loading/empty/error/disabled/success`) และไม่มี console error
5. **Knowledge & Defect Sync**:
   - งานบั๊ก: บันทึกผลลง `<project>/defects/BUG-xxx.md` (หรือ `<project>/shared/defects/BUG-xxx.md` ในโปรเจกต์เดิม)
   - งานที่เปลี่ยนโครงสร้าง/คำสั่ง: อัปเดต `repo-map.md` / `plan.md` แล้วรัน `baan --index` และ `baan --lint-knowledge`
6. **รายงานผลอย่างซื่อสัตย์ (Honest Engineering Summary)**:
   - แสดงเฉพาะคำสั่งที่รันจริง, จำนวนเคสที่ผ่าน/ล้มเหลว, AC ↔ test mapping, จุดที่ยังไม่แน่ใจ/ข้อจำกัด (ถ้ามี), และสิ่งที่ผู้ดูแลต้องรู้เมื่อกลับมาแก้เองในอีก 6 เดือน (`LEARNING.md`)
