# 🏗️ แม่แบบ Workspace สำหรับ BAAN (Workspace Template)

โฟลเดอร์นี้เป็นแม่แบบตัวอย่าง (Blueprint) สำหรับการสร้าง Workspace อิสระของแต่ละโปรเจกต์หรือแต่ละบริษัท ตามสถาปัตยกรรม **Decoupled Architecture** ของ BAAN

---

## โครงสร้างใน Workspace

```text
<workspace-root>/
├── baan.config.json       # ไฟล์ตั้งค่าระบุ knowledge_roots, memory_root และ targets
├── AGENTS.md / CLAUDE.md  # สร้างอัตโนมัติด้วย `baan --init` (ชี้ไปที่ charter ของ BAAN)
├── .claude/               # เก็บ Interactive Roles และ Skills ที่ติดตั้งด้วย `baan --init`
├── knowledge/             # [Git repo แยก] สำหรับเก็บ Architecture, Requirements, Specs, ADR
├── memory/                # [Git repo แยก] สำหรับเก็บประวัติการรันและ audit trail
└── target/                # [Git repos แยก] สำหรับเก็บโค้ดจริง (API, Web, Mobile ฯลฯ)
```

---

## ขั้นตอนการสร้าง Workspace ใหม่

1. **สร้างโฟลเดอร์ Workspace ของคุณ**:
   ```powershell
   mkdir C:\src\my-company
   cd C:\src\my-company
   ```

2. **รันคำสั่งเริ่มต้น**:
   ```powershell
   baan --init --workspace C:/src/my-company
   ```

3. **แก้ไข `baan.config.json`**:
   - ปรับชื่อและ path ของ `knowledge` และ `memory` ให้ตรง
   - เพิ่มรายการ `targets` สำหรับ repos ซอร์สโค้ดของบริษัท

4. **สร้าง Git Repo สำหรับ Knowledge และ Memory**:
   ```powershell
   git -C knowledge init
   git -C memory init
   ```

5. **ตรวจสอบความพร้อม**:
   ```powershell
   baan --list
   ```
