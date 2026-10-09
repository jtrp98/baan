# sb-compass-faculty-match — Design Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `system-analyst` เท่านั้น · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `des-*.md` / `data-model.md` ที่ packet/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · ตาราง DES ด้านล่างคือรายชื่อไฟล์ contract ทั้งหมด

## Feature-by-Feature Feasibility

| Feature / REQ | Verdict | เหตุผล / หลักฐาน (`path:line`) |
|---|---|---|
| ID | ครอบคลุม | คำวินิจฉัย |
| **DES-001** | REQ-001 | **needs new service** |
| **DES-002** | REQ-002 | **needs new dependency (external AI) · feasible-with-risk** |
| **DES-003** | REQ-003 | **straightforward (ใน service ใหม่)** |
| **DES-004** | REQ-004 | **straightforward** |
| **DES-005** | REQ-005 (แก้ไข 2026-08-31 โดย  | **straightforward** |
| **DES-006** | REQ-006 | **straightforward — ไม่เปลี่ยนจากรอบที่ 1** |
| **DES-007** | REQ-007 (แทนที่ทั้งหมด 2026-08 | **straightforward — เปลี่ยนกลไกจากแกนพฤติกรรมที่ออกแบบเอง (8 |
| **DES-008** | REQ-008 | **straightforward — ไม่เปลี่ยนจากรอบที่ 1 ยกเว้นชื่อคอลัมน์อ |
| **DES-009** | REQ-009 | 🔴 **blocked — ไม่เปลี่ยนจากรอบที่ 1** |
| **DES-010** | REQ-010 | **straightforward — ไม่เปลี่ยนจากรอบที่ 1** |
| **DES-011** | REQ-011 | **straightforward — schema ล้วน ไม่กระทบ backend logic อื่น* |
| **DES-012** | REQ-012 | **feasible-with-risk — เนื้อหาคำถามยังไม่ผ่านตรวจ · v6: เพิ่ |
| **DES-013** | REQ-013 | 🟡 **feasible — ออกแบบครบทุกด้านแล้ว (2026-08-31) เหลือรอ im |
| **DES-014** | REQ-014 | **straightforward** |
| **DES-015** | REQ-015 | 🟡 **feasible — สูตร/ตารางน้ำหนักยืนยันแล้ว (2026-08-31) แต่ |
| **DES-016** *(ใหม่ v6, 2026-08 | REQ-016 | ✅ **ไม่มีอะไรต้องออกแบบเพิ่ม — ยืนยันสิ่งที่สัญญามีอยู่แล้ว* |
| **DES-017** *(v7 · ปรับปรุง 20 | REQ-017 | **straightforward** |
| **DES-026** *(ใหม่ 2026-09-15) | REQ-018 | **straightforward** |

## Design Contracts

| ID | ชื่อ | Traces | ไฟล์ |
|---|---|---|---|
| DES-001 | **needs new service** | REQ-001 | `des-001.md` |
| DES-002 | **needs new dependency (external AI) · feasible-with-risk** | REQ-002 | `des-002.md` |
| DES-003 | **straightforward (ใน service ใหม่)** | REQ-003 | `des-003.md` |
| DES-004 | **straightforward** | REQ-004 | `des-004.md` |
| DES-005 | **straightforward** | REQ-005 | `des-005.md` |
| DES-006 | **straightforward — ไม่เปลี่ยนจากรอบที่ 1** | REQ-006 | `des-006.md` |
| DES-007 | **straightforward — เปลี่ยนกลไกจากแกนพฤติกรรมที่ออกแบบเอง (8 | REQ-007 | `des-007.md` |
| DES-008 | **straightforward — ไม่เปลี่ยนจากรอบที่ 1 ยกเว้นชื่อคอลัมน์อ | REQ-008 | `des-008.md` |
| DES-009 | 🔴 **blocked — ไม่เปลี่ยนจากรอบที่ 1** | REQ-009 | `des-009.md` |
| DES-010 | **straightforward — ไม่เปลี่ยนจากรอบที่ 1** | REQ-010 | `des-010.md` |
| DES-011 | **straightforward — schema ล้วน ไม่กระทบ backend logic อื่น* | REQ-011 | `des-011.md` |
| DES-012 | **feasible-with-risk — เนื้อหาคำถามยังไม่ผ่านตรวจ · v6: เพิ่ | REQ-012 | `des-012.md` |
| DES-013 | 🟡 **feasible — ออกแบบครบทุกด้านแล้ว (2026-08-31) เหลือรอ im | REQ-013 | `des-013.md` |
| DES-014 | **straightforward** | REQ-014 | `des-014.md` |
| DES-015 | 🟡 **feasible — สูตร/ตารางน้ำหนักยืนยันแล้ว (2026-08-31) แต่ | REQ-015 | `des-015.md` |
| DES-016 | ✅ **ไม่มีอะไรต้องออกแบบเพิ่ม — ยืนยันสิ่งที่สัญญามีอยู่แล้ว* | REQ-016 | `des-016.md` |
| DES-017 | **straightforward** | REQ-017 | `des-017.md` |
| DES-018 | Database Ownership Boundary | REQ-017, REQ-017, REQ-013, REQ-010, REQ-002, REQ-010 | `des-018.md` |
| DES-019 | Import Rules | REQ-001, REQ-002, REQ-004, REQ-002, REQ-010, REQ-012, REQ-014, REQ-015, REQ-004, REQ-006, REQ-003, REQ-003 | `des-019.md` |
| DES-020 | Program Matching Rules | REQ-005, REQ-006, REQ-012 (หน่วยกิตรวม = 0 → ใช้ค่าเฉลี่ยดิบ), REQ-005, REQ-005, REQ-004, REQ-011, REQ-005, REQ-012, REQ-006, REQ-002, REQ-006, REQ-004, REQ-006, REQ-002 | `des-020.md` |
| DES-021 | Target Major Rules | REQ-017, REQ-017, REQ-007, REQ-017, REQ-017, REQ-007, REQ-007, REQ-017, REQ-007, REQ-009, REQ-007, REQ-007, REQ-017, REQ-017 | `des-021.md` |
| DES-022 | Cluster Determination Rules | REQ-011, REQ-013, REQ-011, REQ-013, REQ-013, REQ-013, REQ-012, REQ-012, REQ-012, REQ-017, REQ-017, REQ-012, REQ-006, REQ-011, REQ-005, REQ-012, REQ-012 (แก้ไขรอบที่ 3, ยืนยัน 2026-08-31), REQ-001, REQ-012, REQ-012, REQ-012 | `des-022.md` |
| DES-023 | Admin & Review Rules | REQ-003, REQ-004, REQ-004, REQ-011, REQ-003, REQ-004, REQ-001, REQ-002, REQ-004, REQ-003, REQ-003, REQ-004, REQ-003, REQ-007, REQ-008, REQ-005, REQ-006, REQ-011, REQ-015, REQ-011, REQ-013, REQ-013, REQ-011, REQ-007, REQ-008, REQ-012, REQ-017, REQ-017, REQ-017, REQ-010, REQ-009, REQ-010, REQ-009, REQ-005, REQ-011, REQ-013 (ที่มาของ Module K), REQ-012, REQ-005, REQ-005, REQ-007 | `des-023.md` |
| DES-024 | Deployment Prerequisites | REQ-010, REQ-017, REQ-013, REQ-004 (ให้คนกรอกมือ), REQ-002, REQ-007, REQ-009, REQ-003, REQ-003, REQ-013, REQ-017 (`## Target Major Rules` ข้อ 2), REQ-017, REQ-007, REQ-007, REQ-017, REQ-007, REQ-011, REQ-013, REQ-005, REQ-007, REQ-018, REQ-017, REQ-013, REQ-013, REQ-013, REQ-013, REQ-012, REQ-005, REQ-007, REQ-005, REQ-007, REQ-018, REQ-011, REQ-012, REQ-005, REQ-007, REQ-011, REQ-012, REQ-017, REQ-001 ("ตรวจย้อนหลังได้ว่าผลมาจากเอกสารฉบับไหน"), REQ-017, REQ-017, REQ-017, REQ-017, REQ-008, REQ-010, REQ-011 | `des-024.md` |
| DES-025 | RIASEC Fit Rules | REQ-012, REQ-007 (ตามที่ REQ-012 แก้ไข), REQ-008, REQ-012, REQ-007, REQ-012, REQ-012, REQ-007, REQ-007, REQ-008, REQ-010 | `des-025.md` |
| DES-026 | Development Plan Contract | REQ-018, REQ-017 (สาขาเป้าหมาย), REQ-018, REQ-008, REQ-008 | `des-026.md` |

## ไฟล์อื่นในหมวดนี้

| ไฟล์ | เนื้อหา |
|---|---|
| `data-model.md` | schema contract |
| `modules.md` | feature group ภายใน delivery unit |
| `risks.md` | dependencies + risks |
| `archive.md` | Q&A ที่ปิดแล้ว + Change Log entries ที่ถูกแทน — verbatim |

## Unresolved Open Questions

| ID | คำถาม | ผู้ตอบ | Blocking? |
|---|---|---|---|

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `..\index.md`
