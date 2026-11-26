---
name: repo-map
description: Use when onboarding a project, checking Knowledge Drift against real code, or refreshing <project>/repo-map.md with stacks, entrypoints, domain boundaries, data models, and verified build/test commands. Read-only on target repositories.
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "[target-name or <project>]"
---

# 🗺️ `repo-map` — แผนที่โครงสร้างโค้ดและคำสั่งจริงของโปรเจกต์

สร้างและดูแล `<project>/repo-map.md` ให้เป็นจุดเริ่มต้นกลางที่ **Antigravity, Claude Code และ Codex** อ่านแล้วเข้าใจภาพรวมและคำสั่งจริงของโปรเจกต์ได้ทันทีในไฟล์เดียว

## ขั้นตอนปฏิบัติ (Antigravity-Native)

1. **ดึง Baseline ข้อเท็จจริงจาก BAAN Core**:
   ```bash
   baan survey --target <targetName> --json
   ```
   ตรวจ `stacks`, `components`, `entrypoints`, `commands`, `branchStatus` และ `drift`
2. **สำรวจเชิงลึกแบบขนาน (Read-Only)**:
   - ใช้ `invoke_subagent` (`TypeName: "research"`) — หรือ `run_workflow` (`parallel`) เมื่อมีหลาย repo/monorepo — เพื่อสแกน entrypoints, domain modules, dependencies ระหว่าง service/package, จุดเชื่อมต่อ DB/External API, และคำสั่ง build/test จริง
   - หากมีไฟล์เดิมใน `<project>/INDEX.md` หรือ `modules/` ให้ตรวจสอบเทียบกับโค้ดจริงเพื่อระบุ drift
3. **เขียน `<project>/repo-map.md` ให้กระชับ (บังคับ ≤ 15 KB)**:
   - ใช้ตารางและ exact paths เท่านั้น หลีกเลี่ยงข้อความบรรยายยาว:
     - **Metadata & Target Repos**: ชื่อโปรเจกต์, branch มาตรฐาน, path ของ target repo(s)
     - **Tech Stack & Entrypoints**: ภาษา/เฟรมเวิร์ก และไฟล์ entrypoint หลัก
     - **Domain / Module Map**: โมดูลหรือ service → path ในโค้ด → หน้าที่สั้นๆ → dependencies
     - **External Integrations & Data Stores**: DB, Redis/Queue, gRPC/REST ภายนอก
     - **Verified Commands**: `build`, `test_targeted`, `test_full`, `lint` ที่รันได้จริง (เช่น .NET ใช้ `dotnet test --logger "console;verbosity=normal"`)
4. **อัปเดตสารบัญและตรวจ Lint**:
   ```bash
   baan --index
   baan --lint-knowledge
   ```

## กฎเหล็ก
- **Read-Only ต่อ `target/*`**: ห้ามแก้ไขโค้ดใน target repository ระหว่างทำ `repo-map`
- **อ้างเฉพาะข้อเท็จจริงจากไฟล์ที่อ่านจริง**: ห้ามเดา path หรือคำสั่งที่ไม่ได้ตรวจจากไฟล์ config/code จริง
