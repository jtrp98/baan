# sb-compass — Design Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `system-analyst` เท่านั้น · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `des-*.md` / `data-model.md` ที่ packet/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · ตาราง DES ด้านล่างคือรายชื่อไฟล์ contract ทั้งหมด

## Feature-by-Feature Feasibility

| Feature / REQ | Verdict | เหตุผล / หลักฐาน (`path:line`) |
|---|---|---|
| ID | ครอบคลุม | คำวินิจฉัย |
| **DES-001** | REQ-001, REQ-002 | **ไม่ต้องทำ (ของเดิมทำงานอยู่)** |
| **DES-002** | REQ-012 | **straightforward** |
| **DES-003** | REQ-004 × REQ-012 | **straightforward แต่มี deployment step บังคับ** |
| **DES-004** | REQ-013 | **straightforward** *(v2 — เดิม feasible-with-risk, ปิด OQ-1 |
| **DES-005** | REQ-014 | **feasible-with-risk** *(v2 — ความเสี่ยงเดิมปิดแล้วด้วยการแย |
| **DES-006** | REQ-015, REQ-009 | **straightforward** |
| **DES-007** | REQ-016 | **straightforward** |
| **DES-008** | *(ไม่มี REQ — ผมเสนอเพิ่ม)* | **straightforward** |
| **DES-009** | REQ-003, REQ-005, REQ-006, REQ | **ไม่เปลี่ยน logic — เปลี่ยนแค่การกั้นสิทธิ์** |
| **DES-010** | REQ-008, REQ-011 | **out of scope รอบนี้ (ยกเว้นเรื่อง identity)** |
| **DES-012** *(ใหม่ v7, 2026-08 | *(ไม่มี REQ — การตัดสินเรื่อง  | **straightforward ในเชิงเทคนิค แต่เป็น breaking change ต่อโค |
| **DES-011** *(ใหม่ v5, 2026-08 | REQ-017 | **straightforward — แต่เป็น schema change ตัวแรกของ module น |
| **DES-013** *(ใหม่ 2026-08-31  | *(ไม่มี REQ — เอกสารร่าง `educ | 🟠 **ประเมินรายข้อแล้ว — รับบางส่วน ปฏิเสธบางส่วน · งาน amen |
| **DES-014** *(ใหม่ 2026-09-02, | REQ-018 | **ไม่ใช่งาน implement ของรอบนี้ — เลื่อนออกไปตาม trigger ที่ |
| **DES-015** *(เพิ่ม 2026-09-07 | REQ-012, REQ-006 | **straightforward** *(ปิด ISS-01 · 2026-09-15)* |
| **DES-016** *(เพิ่ม 2026-09-07 | REQ-013, REQ-014 | **ไม่มีเนื้อหาเปลี่ยน — หัวข้อนี้อนุมัติแล้วตั้งแต่รอบก่อนหน |
| **DES-017** *(เพิ่ม 2026-09-07 | REQ-015, REQ-009 | **ไม่มีเนื้อหาเปลี่ยน — หัวข้อนี้อนุมัติแล้วตั้งแต่รอบก่อนหน |
| **DES-018** *(เพิ่ม 2026-09-07 | REQ-016 | **ไม่มีเนื้อหาเปลี่ยน — หัวข้อนี้อนุมัติแล้วตั้งแต่รอบก่อนหน |
| **DES-019** *(เพิ่ม 2026-09-07 | *(ไม่มี REQ เฉพาะ — ครอบคลุมขั | **ไม่มีเนื้อหาเปลี่ยน — หัวข้อนี้อนุมัติแล้วตั้งแต่รอบก่อนหน |
| **DES-020** *(เพิ่ม 2026-09-07 | *(ไม่มี REQ เฉพาะในโมดูลนี้ —  | **ไม่มีเนื้อหาเปลี่ยน — หัวข้อนี้อนุมัติ/ยืนยันแล้วตั้งแต่รอ |
| ไฟล์ | สถานะ ณ วันนี้ | ใครใช้อยู่จริง |
| `education-pathway-taxonomy-de | ✅ **reconcile แล้ว — เป็นเอกสา | `sb-compass-faculty-match` ใช้เป็นฐานของ REQ-011/REQ-015 · s |
| `education-pathway-assessment- | 🟡 **ผู้ใช้เลือกให้เป็น "ฐานอ้ | **ยังไม่มีใครอ้างถึงในสัญญาใด** · คำวินิจฉัยรายข้ออยู่ที่ `# |
| # | ประเด็น | คำวินิจฉัย |
| **A** | Cluster ↔ RIASEC ordered pair  | 🔴 **REJECT** — คงเวกเตอร์ 11×6 ที่ยืนยันแล้ว |
| **A2** | Adaptive Threshold + Path Diff | 🟠 **ADAPT** — ไม่ implement รอบแรก 🧑 |
| **B** | เครื่องมือวัด: Ranking 7 ข้อ + | 🟡 **ADAPT** — รับได้เชิงเทคนิค แต่เป็นการตัดสินธุรกิจ 🧑 |
| **C** | Readiness ชั้น 1 — Subject→RIA | 🔴 **REJECT ตามที่เขียน** — map ลงข้อมูลจริงไม่ได้ |
| **C2** | Readiness ชั้น 2 — Path Key Su | 🔴 **REJECT ตามที่เขียน** — กลไกพังตามข้อ C |
| **C3** | แหล่งคะแนนความพร้อม (สเกลของตั | 🔴 **REJECT** — ขัดข้อห้ามที่ยืนยันแล้วโดยตรง |
| **C4** | สัดส่วน Interest:Readiness 0.6 | 🟡 **ADAPT** — ตัดสินธุรกิจล้วน 🧑 |
| **D** | schema 18 ตาราง snake_case | 🔴 **REJECT ตามที่เขียน** · 🟢 **ADOPT เฉพาะแนวคิด** (config |
| **E** | Confidence / Profile Clarity + | 🟢 **ADOPT หลักการ** 🧑 องค์ประกอบ/เกณฑ์ต้องยืนยัน |
| **F** | ปุ่ม "ยังไม่เคยลอง" / "ไม่มีอั | 🟢 **ADOPT หลักการ** 🧑 ค่าคงที่ต้องยืนยัน |
| **G** | Role Overlay ของ C11 | 🟢 **ADOPT หลักการ** 🟠 สูตร `max()` ควรทบทวน |
| **H** | Interest-only mode เมื่อข้อมูล | 🟢 **ADOPT** — ภาพสะท้อนของกฎที่มีอยู่แล้ว |
| **I** | ข้อห้ามถ้อยคำ / ไม่แสดงอันดับ  | ✅ **มีอยู่แล้ว** — ไม่ต้องตัดสินใหม่ |
| เรื่องที่ตัดสินไปแล้ว | กติกาที่บังคับใช้อยู่ที่ | ยืนยันแล้ว |
| Data Model เป็น DDL/EF6 ไม่ใช่ | หมายเหตุ stack ด้านบน + `## Da | ยืนยันแล้ว |
| แหล่งความจริงของสิทธิ์ Premium | `## Premium Entitlement Rules` | ยืนยันแล้ว |
| การจำกัดสิทธิ์ `recompute` (แย | `## Premium Entitlement Rules` | ยืนยันแล้ว |
| batch ใช้สูตรถ่วงน้ำหนัก + rec | `## National Stats Batch Rules | ยืนยันแล้ว |
| `TCompassMbtiResult` (เดิม `co | `## Data Model` กลุ่มที่ 1 | ยืนยันแล้ว |
| **naming convention ของทั้งสาม | `## Data Model` กลุ่มที่ 1 (DD | ยืนยันแล้ว |
| debug endpoints ให้กั้นด้วย `c | DES-008 + OQ-17 · `## Premium  | ยืนยันแล้ว |
| **เส้นทาง join จริงของ entitle | `## Premium Entitlement Rules` | ยืนยันแล้ว |
| **เกณฑ์การถอด REQ-005/REQ-007  | `requirement.md` → REQ-018 (เจ | ยืนยันแล้ว |
| **ค่าคงที่ทั้งหมดในเอกสารร่าง  | `requirement.md` → `## Referen | ยืนยันแล้ว |
| **ยกเลิกแล้ว (v14, 2026-09-08) | `## Data Model` → รูปแบบการเข้ | ยืนยันแล้ว |
| **รหัส FeatureCode ใน SB PLUS  | `## Premium Entitlement Rules` | ยืนยันแล้ว |
| **Layout แสดงผล Breakdown รายว | `## DES-018 — Premium Subject  | ยืนยันแล้ว |
| **การปัดเศษใน Gap Report (`AI_ | `## DES-015 — Subject Score Ag | ยืนยันแล้ว |

## Design Contracts

| ID | ชื่อ | Traces | ไฟล์ |
|---|---|---|---|
| DES-001 | **ไม่ต้องทำ (ของเดิมทำงานอยู่)** | REQ-001 | `des-001.md` |
| DES-002 | **straightforward** | REQ-012 | `des-002.md` |
| DES-003 | **straightforward แต่มี deployment step บังคับ** | REQ-004 | `des-003.md` |
| DES-004 | **straightforward** *(v2 — เดิม feasible-with-risk, ปิด OQ-1 | REQ-013 | `des-004.md` |
| DES-005 | **feasible-with-risk** *(v2 — ความเสี่ยงเดิมปิดแล้วด้วยการแย | REQ-014 | `des-005.md` |
| DES-006 | **straightforward** | REQ-015 | `des-006.md` |
| DES-007 | **straightforward** | REQ-016 | `des-007.md` |
| DES-008 | **straightforward** | REQ-001 | `des-008.md` |
| DES-009 | **ไม่เปลี่ยน logic — เปลี่ยนแค่การกั้นสิทธิ์** | REQ-003 | `des-009.md` |
| DES-010 | **out of scope รอบนี้ (ยกเว้นเรื่อง identity)** | REQ-008 | `des-010.md` |
| DES-011 | **straightforward — แต่เป็น schema change ตัวแรกของ module น | REQ-017 | `des-011.md` |
| DES-012 | **straightforward ในเชิงเทคนิค แต่เป็น breaking change ต่อโค | REQ-001 | `des-012.md` |
| DES-013 | 🟠 **ประเมินรายข้อแล้ว — รับบางส่วน ปฏิเสธบางส่วน · งาน amen | REQ-001 | `des-013.md` |
| DES-014 | **ไม่ใช่งาน implement ของรอบนี้ — เลื่อนออกไปตาม trigger ที่ | REQ-018 | `des-014.md` |
| DES-015 | Subject Score Aggregation Rules | REQ-012, REQ-001, REQ-002 (ฟรี), REQ-004, REQ-016 (Premium), REQ-016, REQ-005, REQ-006, REQ-012, REQ-012, REQ-012, REQ-012, REQ-006, REQ-012 | `des-015.md` |
| DES-016 | Premium Entitlement Rules | REQ-013, REQ-014, REQ-003, REQ-014, REQ-014, REQ-013, REQ-013, REQ-003, REQ-004, REQ-016, REQ-005, REQ-006, REQ-007, REQ-008, REQ-011, REQ-001, REQ-002, REQ-003, REQ-016, REQ-014 | `des-016.md` |
| DES-017 | Identity & Scope Rules | REQ-015, REQ-009 | `des-017.md` |
| DES-018 | Premium Subject Breakdown Contract | REQ-016, REQ-016, REQ-001, REQ-001 | `des-018.md` |
| DES-019 | Deployment Prerequisites | REQ-012, REQ-013, REQ-014, REQ-015, REQ-004, REQ-012, REQ-017, REQ-017 (v5 · ชื่อคอลัมน์แก้ใน v7), REQ-016, REQ-016, REQ-012, REQ-014, REQ-010, REQ-012, REQ-017, REQ-012, REQ-001, REQ-001, REQ-001, REQ-016 | `des-019.md` |
| DES-020 | WORD-01: ข้อกำหนดถ้อยคำของค่าสถิติเปรียบเทียบ (ผู้ใช้ยืนยัน  | REQ-013, REQ-004, REQ-004, REQ-004, REQ-004, REQ-018 (trigger-based — N=4 สัปดาห์หลัง faculty-match REQ-011/012 ขึ้น production, N เป็น assumption), REQ-005, REQ-007, REQ-018, REQ-017 (`## National Stats Batch Rules` § `"StddevScore"` ข้อ 3), REQ-005, REQ-007, REQ-017, REQ-018, REQ-006 | `des-020.md` |
| DES-021 | National Stats Batch Rules | REQ-004, REQ-010, REQ-010, REQ-017 (ใหม่ v5, 2026-08-31 · เปลี่ยนชื่อคอลัมน์ใน v7), REQ-013, REQ-017, REQ-012 (เหมือน `"MeanScore"`   หลัง DES-003), REQ-004, REQ-010 | `des-021.md` |

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

Back-links: `../../INDEX.md`
