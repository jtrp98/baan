---
name: repo-map
description: Use when onboarding a project, checking Knowledge Drift against real code, or refreshing <project>/repo-map.md with stacks, entrypoints, domain boundaries, data stores, and verified build/test commands. Read-only on target repositories.
argument-hint: "[target-name หรือ <project>]"
metadata:
  author: baan
  version: "1.0.0"
---

# 🗺️ `repo-map` — แผนที่โครงสร้างโค้ดและคำสั่งจริงของโปรเจกต์

สร้างและดูแล `<project>/repo-map.md` ให้เป็นจุดเริ่มต้นกลางที่ **Claude Code, Codex และ Antigravity** อ่านไฟล์เดียวแล้วเข้าใจภาพรวมและคำสั่งจริงของโปรเจกต์ได้ทันที

## ขั้นตอนปฏิบัติ (Claude Code Native)

1. **ดึง Baseline ข้อเท็จจริงจาก BAAN Core**:
   ```bash
   baan survey --target <targetName> --json
   ```
   ตรวจ `stacks`, `components`, `entrypoints`, `commands`, `branchStatus` และ `drift` (`unmappedCode` / `unmappedModules`)
2. **สำรวจเชิงลึกแบบขนาน (Read-Only)**:
   - ส่ง `Agent` ชนิด `scout` หลายตัว **ใน message เดียว** (แบ่งตาม repo / service / layer) ให้สแกน entrypoints, domain modules, dependencies ระหว่าง service, จุดเชื่อม DB/External API และคำสั่ง build/test จริง — ให้ตอบเป็นตาราง + `file:line` เท่านั้น
   - ใช้ `scout` (haiku) แทน built-in `Explore` เพื่อถนอมโควตา (Explore รันบน opus เมื่อใช้แพ็ก subscription)
   - ถ้ามี `<project>/INDEX.md` หรือ `modules/` / `features/` เดิม ให้เทียบกับโค้ดจริงเพื่อระบุ drift
3. **เขียน `<project>/repo-map.md` ให้กระชับ (≤ 15 KB, lint เตือนที่ 25 KB)** — ตารางและ exact paths เท่านั้น:
   - **Metadata & Target Repos**: ชื่อโปรเจกต์, branch มาตรฐาน, path ของ target repo
   - **Tech Stack & Entrypoints**
   - **Domain / Module Map**: โมดูลหรือ service → path → หน้าที่สั้นๆ → dependencies
   - **External Integrations & Data Stores**: DB, Redis/Queue, gRPC/REST ภายนอก
   - **Verified Commands**: `build`, `test_targeted`, `test_full`, `lint` ที่รันได้จริง (.NET ใช้ `dotnet test --logger "console;verbosity=normal"`)
   - ไฟล์ยาวหลายส่วนส่งให้ `scribe` เขียนตามโครงที่ตกลงแล้วได้ (1 writer ต่อ repo)
4. **อัปเดตสารบัญและตรวจ Lint**:
   ```bash
   baan --index
   baan --lint-knowledge
   ```
5. **โปรเจกต์โครงสร้าง 3-slot เดิม**: ถ้าพบโค้ดที่ยังไม่มีโมดูล ให้เสนอชื่อโมดูลด้วย `AskUserQuestion` ก่อน แล้วค่อย `baan survey --target <name> --scaffold-module <module>` และเติม `<project>/modules/<module>/INDEX.md` ด้วยข้อมูลจริงที่สำรวจพบ

## กฎเหล็ก
- **Read-Only ต่อ `target/*`**: ห้ามแก้โค้ดใน target ระหว่างทำ `repo-map`
- **อ้างเฉพาะข้อเท็จจริงจากไฟล์ที่อ่านจริง**: ห้ามเดา path หรือคำสั่งที่ไม่ได้ตรวจจาก config/code จริง
