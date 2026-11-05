# Plan

PlanTask format: 1

## Plan Summary

**sb-compass-faculty-match** (จับคู่คณะ/หลักสูตรจริง — Faculty Match) แบ่งงานเป็น 8 เฟส / 68 task ครอบสอง codebase (Curriculum Service Python/FastAPI ที่ตั้งใหม่ทั้งก้อน + ClassOnlineWeb .NET FW 4.8) ตาม Module E/F/G/I-a/I-b/K/H ของ `design.md` — ทุก task สถานะ `pending` และเฟส F, G, I-b (รวม Target Major Rules และ Development Plan), K, H และ Entitlement Wiring เป็น 🔒 Security gate ตาม Security Considerations ของ design

ตัวกรองชั้นแรกของ flow จับคู่คือ 11 Interest Cluster จาก Module K (T-Score + RIASEC) แทน 8 สายเดิม โดย Module H อ่านผล Module K ผ่าน BE-052 และงานที่ยังถูกบล็อกข้ามโมดูล (คีย์ `glm-5.2` PRE-F01, คอลัมน์ `"StddevScore"` DEP-F09, `sb-compass` OQ-15) ติดตามที่ Sequencing Notes / Unresolved Open Questions (OQ-F08, OQ-F14, OQ-F16 ปิดแล้ว 2026-09-15) — ไม่ block การเขียนโค้ดส่วนที่เดินได้

## Phase 1: Module E — Shared Score Access

### Task BE-001 — Lift GetSubjectAveragesAsync to CompassScoreService

Objective: ย้าย `GetSubjectAveragesAsync` จาก `private static` บน `CompassApiController` ขึ้นเป็น `public static GetCanonicalSubjectAveragesAsync(int schoolId, int sID)` บน `CompassScoreService` แล้วให้ `CompassApiController` เดิมเรียกตัวใหม่แทน — ย้ายเนื้อในครบทุกบรรทัด ห้ามเขียนสูตรใหม่ และห้ามคัดลอกกติกา fallback ไปไว้ที่อื่น (fallback หน่วยกิตรวม = 0 ต้องยังทำงานจากข้างใน `AggregateByCanonicalSubjectWeighted` ตามเดิม)
Why: โมดูลนี้ต้องใช้คะแนนกลุ่มสาระชุดเดียวกับที่ `sb-compass` คำนวณ — ถ้าเกิดสำเนาสูตรชุดที่สอง การแก้สูตรฝั่งต้นทางจะไม่ไหลมาให้โมดูลนี้โดยอัตโนมัติอีก
Owner: backend-engineer
Tier: T6
Depends on: none
Traceability: REQ-005, AC-005.2, DES-020, DEC-020
Produces: none
Consumes: Contract:ProgramMatchingRules.v1
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

เป็นการย้ายเมธอดล้วน ไม่แตะสูตร ไม่แตะสิทธิ์ ไม่รับ input ภายนอกใหม่ · caller เดิมบน `CompassApiController` ต้องชี้เมธอดใหม่ในการเปลี่ยนแปลงชุดเดียวกัน · ต้องประสานลำดับกับ `sb-compass` Phase 1 ที่กำลังแตะไฟล์เดียวกัน (DEP-F05)

#### Retrieval hints

Hypothesis: เมธอดเดิมน่าจะอยู่บริเวณ `CompassApiController.cs` ท้าย ๆ ไฟล์ และปลายทางคือ `CompassScoreService.cs` — ยืนยันซิกเนเจอร์/บรรทัดจริงกับซอร์สก่อนย้าย
Query: ค้น `GetSubjectAveragesAsync`, `AggregateByCanonicalSubjectWeighted`, `GetCanonicalSubjectAveragesAsync` ใน ClassOnlineWeb
Provenance: DES-020, DEC-020, Contract:ProgramMatchingRules.v1

#### Do not modify

สูตรถ่วงน้ำหนักและกติกา fallback ข้างใน `AggregateByCanonicalSubjectWeighted` · caller อื่นของ `sb-compass` นอกจากจุดเรียกที่ระบุ · ตาราง/สคีมาใด ๆ

#### Acceptance criteria

AC-005.2: คะแนนกลุ่มสาระที่ได้จากเมธอดใหม่เป็นค่าชุดเดียวกับที่ `sb-compass` REQ-012 คำนวณ (fallback หน่วยกิตรวม = 0 ยังทำงานจากข้างในเมธอดเดิมโดยอัตโนมัติ) — ไม่มีการคำนวณคะแนนกลุ่มสาระชุดที่สองเกิดขึ้นในโมดูลนี้

#### Required validation and expected evidence

ตรวจ AC-005.2 ด้วยการ diff เนื้อในเมธอดก่อน/หลังย้าย (ต้องเหมือนทุกบรรทัด) + build/typecheck ผ่าน + ยืนยัน caller เดิมเรียกเมธอดใหม่ครบทุกจุด — เก็บ diff และผล build เป็นหลักฐาน

#### Rollback/compatibility notes

revert การเปลี่ยนแปลงชุดเดียวคืนสภาพเดิมได้ (เมธอดกลับเป็น private + caller กลับเรียกตัวเดิม) — ไม่มีสคีมา/ข้อมูลที่เปลี่ยน

## Phase 2: Module F — Curriculum Import Service (REQ-001, REQ-002, REQ-004) 🔒 Security gate

### Task BE-002 — Scaffold Curriculum Service (FastAPI)

Objective: ตั้งโปรเจกต์ Curriculum Service (Python/FastAPI) ใหม่ทั้งก้อน — skeleton, dependency management, และกลไกโหลด secret/config ของ service เอง (ยังไม่ใช่การตั้งค่าคีย์ `glm-5.2` เอง) — ทำเองเพราะ `setup` agent ไม่รองรับ stack นี้ (DEP-F06)
Why: งาน import ทั้งหมดของโมดูลต้องมี service แยกของตัวเองเป็นฐาน และ secret/config ต้องมีกลไกโหลดที่ถูกต้องตั้งแต่โครง เพื่อไม่ให้งานลับไหลไปอยู่ใน config ฝั่ง .NET ตามเคย
Owner: backend-engineer
Depends on: none
Traceability: REQ-001, AC-001.1, DES-019, DEC-019
Produces: none
Consumes: none
Risk: medium
Human gate: schema
Status: verified

#### Scope and constraints

โครงโปรเจกต์ใหม่ล้วน — โหลด secret/config ผ่านกลไกของ service เอง ไม่ผูกกับ `prod.config` ของ ClassOnlineWeb · ยังไม่ implement pipeline ใด ๆ (งานของ task ถัดไปในเฟสนี้)

#### Retrieval hints

Hypothesis: โครง FastAPI มาตรฐาน (app factory + settings module + dependency lock) พอสำหรับขั้นนี้ — ยืนยันโครงจริงหลังสร้าง
Query: ค้นชื่อ service directory ใหม่, `settings`, `pyproject.toml`/`requirements.txt` ใน Target หลัง scaffold
Provenance: DES-019, DEC-019

#### Do not modify

โค้ด ClassOnlineWeb ทั้งหมด · ตาราง/สคีมาใด ๆ · `prod.config` (ห้ามเขียนค่าใดลงไป)

#### Acceptance criteria

AC-001.1 (ฐานรองรับ): โปรเจกต์พร้อมเป็นที่ตั้งของขั้นแปลง PDF → Markdown ด้วย markitdown ตาม REQ-001 — skeleton โหลด secret/config ผ่านกลไกของตัวเองสำเร็จ และไม่มีอะไรในโครงขัดลำดับขั้นการ import ของ DES-019

#### Required validation and expected evidence

ตรวจ AC-001.1 (ฐานรองรับ) ด้วยการรัน service ว่า start ได้ + โหลด config จากกลไกของตัวเองได้ + lint/typecheck ผ่าน — เก็บคำสั่ง/ผลรันเป็นหลักฐาน

#### Rollback/compatibility notes

โปรเจกต์ใหม่ additive ทั้งหมด — ลบ directory คืนสภาพเดิมได้ ไม่กระทบระบบเดิม

### Task BE-003 — First migration of catalog tables + seeds

Objective: migration ครั้งแรกของกลุ่มตารางคลังหลักสูตรตาม `## Data Model` **สถานะ v9 (2026-09-15)** (ชื่อปัจจุบัน `public."T<PascalCase>"` ทั้งชุด — แถวเดิมเขียน `compass_university` ถึง `compass_quest` ตามเลขเดิมก่อนเปลี่ยน naming convention) — **ตาราง master 7 ตัว (`TCompassUniversity`, `TCompassInterestCluster`, `TCompassFacultyGroup`, `TCompassRiasecDimension`, `TCompassEducationTrack`, `TCompassStudyPlan`, `TCompassCareer`) มี PK เป็น `serial "<Name>ID"` (integer identity) และเก็บ code เดิมไว้เป็น `text NOT NULL UNIQUE` คู่กัน (`"UniversityCode"`, `"ClusterCode"`, `"FacultyGroupCode"`, `"DimensionCode"`, `"TrackCode"`, `"StudyPlanCode"`, `"CareerCode"`) · FK ทุกตัวที่เคยอ้าง code ตอนนี้เป็น `integer` อ้าง Id** + seed ตารางมิติ RIASEC (แทน "8 แกนพฤติกรรม" เดิมที่ถูกแทนที่ด้วย 6 มิติ RIASEC แล้ว) ตาม PRE-F07 + seed แถว `'KMUTT'` ของ `public."TCompassUniversity"` — **ทุก seed ห้ามระบุค่า PK เอง และตารางเชื่อมต้องเขียนเป็น `INSERT ... SELECT ... JOIN` ที่แปลง code → Id ตอนรัน · `ON CONFLICT` ของตาราง master ใช้คอลัมน์ code ไม่ใช่ Id** — ผ่าน migration ของ Curriculum Service เท่านั้น ห้าม `CREATE TABLE IF NOT EXISTS` แบบ runtime ของเดิม
Why: ตารางคลังหลักสูตรเป็นของ Curriculum Service คนเดียวตามสัญญาความเป็นเจ้าของ และการสร้างตารางนอก migration คือแหล่งเกิด schema drift ที่ตรวจยาก — และหลังเปลี่ยน PK เป็น int identity ไฟล์ seed ที่ใส่เลข Id เองจะชี้ผิดแถวเงียบ ๆ ข้ามสภาพแวดล้อม (RISK-F21)
Owner: backend-engineer
Depends on: BE-002
Traceability: REQ-015, AC-015.1, DES-018, DEC-018
Produces: none
Consumes: Contract:DatabaseOwnershipBoundary.v1
Risk: medium
Human gate: schema, breaking-contract
Status: verified

#### Scope and constraints

สร้าง/seed ผ่าน migration ของ Curriculum Service เท่านั้น · ทุก identifier ต้อง quote และระบุ schema `public.` ตามกฎ quoting ของ DES-018 · ระบบต้องยังทำงานได้ปกติเมื่อตารางเนื้อหายังว่าง · **code = คีย์ของมนุษย์/ไฟล์ seed · Id = คีย์ของฐานข้อมูลเท่านั้น: ห้ามใส่เลข Id ในไฟล์ seed ห้าม hardcode Id ในโค้ด (RISK-F21)** · **ความกว้าง integer PK ของตารางที่รอบนี้ "ไม่แตะ" ยังเป็น drift ที่เปิดอยู่ (`bigserial`/`bigint` ในเอกสาร vs `serial`/`integer` ในสคริปต์ bootstrap จริง — OQ-F17): ยึด DDL จริง ห้ามรัน `ALTER TABLE` เปลี่ยนความกว้างเอง** · **ที่อยู่ฐานข้อมูลปลายทางยังไม่ reconcile (design เขียน `PGGradeDB` · สคริปต์ bootstrap จริงสร้างใน `SB_Compass` — RISK-F22): ยืนยันกับ `system-analyst`/`devops` ก่อนรัน migration จริง ห้ามเลือกฐานเอง**

#### Retrieval hints

Hypothesis: รายชื่อตาราง/DDL เต็มอยู่ที่ `## Data Model` (สถานะ v9, 2026-09-15) ของ design.md และรายการ seed อยู่ที่หัวข้อข้อมูลตั้งต้น ซึ่งระบุกติกา seed แบบ code → Id ไว้ — ยืนยันรายชื่อตาราง/ชนิดคอลัมน์ทั้งชุดกับเอกสาร และเทียบกับสคริปต์ bootstrap จริงที่เอกสารอ้างเป็น ground truth ของ schema (`ClassOnlineWeb/DatabaseScripts/Compass/bootstrap-sb-compass-db.sql` — หัวไฟล์บรรทัด 20, DDL master บรรทัด 76, seed code → Id JOIN บรรทัด 542 ตามที่ `## Data Model` บันทึกไว้) ก่อนเขียน migration
Query: ค้น `TCompassUniversity`, `TCompassRiasecDimension`, `TCompassInterestCluster`, `UniversityCode`, `FacultyGroupCode`, `StudyPlanCode`, `CareerCode`, `serial`, `CREATE TABLE` ใน design.md และ migration directory ของ service
Provenance: DES-018, DEC-018, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

ตารางเดิมของ `sb-compass`/SB PLUS/ฐานข้อมูลเกรด · โค้ด ClassOnlineWeb · ตรรกะ constraint ที่ `## Data Model` กำหนดไว้ (คงตามเอกสาร ไม่เพิ่ม/ตัดเอง) · **ชนิด/ชื่อคอลัมน์ที่ `## Data Model` (สถานะ v9) กำหนด — ห้ามกลับไปใช้ text code เป็น PK และห้ามตัดคอลัมน์ code ทิ้งเพราะ "ซ้ำซ้อนกับ Id"**

#### Acceptance criteria

AC-015.1 (ส่วนคลังหลักสูตร): กลุ่มตารางคลัง + ตารางมิติ RIASEC + cluster ถูกสร้างครบตาม `## Data Model` (สถานะ v9, 2026-09-15) ด้วยชื่อ `public."T<PascalCase>"` — ตาราง master ทุกตัวมี PK `serial "<Name>ID"` คู่กับคอลัมน์ code `text NOT NULL UNIQUE` และ FK ทุกตัวเป็น `integer` ที่ชี้ Id — พร้อม seed ตั้งต้น (6 มิติ RIASEC, แถว `'KMUTT'`) ที่ resolve ด้วย code ไม่ใช่เลข Id — ไม่มีตาราง snake_case เหลือตามรอบเก่า

#### Required validation and expected evidence

ตรวจ AC-015.1 (ส่วนคลังหลักสูตร) ด้วยการรัน migration บนฐานว่างแล้วเทียบรายชื่อตาราง/ชนิดคอลัมน์ PK/คอลัมน์ code ที่เป็น UNIQUE/ชนิด FK/index กับ `## Data Model` ทีละรายการ + ตรวจ seed แถวครบ + **grep ไฟล์ seed/migration ยืนยันว่าไม่มีค่า Id ตัวเลขถูกเขียนลงไปตรง ๆ (ต้องเป็น `INSERT ... SELECT ... JOIN` บนคอลัมน์ code)** — เก็บผลรัน migration/ผล query ตรวจ/ผล grep เป็นหลักฐาน

#### Rollback/compatibility notes

migration แรกบนตารางที่ยังไม่เคยมีอยู่จริง — rollback คือ drop ตารางของ migration นี้ (ยังไม่มีข้อมูลจริงให้เสีย) · ห้าม revert โดยแก้ DDL ใน migration เดิม ต้องเขียน migration ใหม่ · **การเปลี่ยน PK รอบ v9 ของ `## Data Model` เป็นการเปลี่ยนแบบ breaking (ไม่มี migration/backfill เพราะฐานถูก `DROP ... CASCADE` แล้วสร้างใหม่ทั้งก้อนตามที่ผู้ใช้ยืนยันในไฟล์ DDL 2026-09-15): ร่าง/โค้ด/seed ใด ๆ ที่เคยใช้ text code เป็นคีย์ต้องถูกแก้ ไม่ใช่รันคู่ขนาน — กติกา DDL/ความเป็นเจ้าของที่บังคับใช้อยู่คือ DES-018/DEC-018**

### Task BE-004 — markitdown conversion spike (PRE-F08)

Objective: spike ทดสอบแปลง PDF หลักสูตรจริงของ KMUTT อย่างน้อย 3 ฉบับด้วย markitdown ก่อนเริ่ม implement pipeline จริง — รายงาน conversion rate ('ok'/'empty'/'failed') กลับ เพื่อยืนยันว่า RISK-F02 ปิดได้ หรือ Module F ต้องขยายขอบเขตเพิ่ม OCR ตั้งแต่รอบแรก
Why: คุณภาพ markitdown กับ PDF หลักสูตรจริงยังไม่เคยถูกทดสอบ — ถ้าแย่เป็นวงกว่าง แผนทั้งเฟสต้องเปลี่ยน ค้นพบช้าไปจะเสียเวลา implement ฟรี
Owner: backend-engineer
Depends on: none
Traceability: REQ-001, AC-001.1, DES-019, DEC-019
Produces: none
Consumes: none
Risk: medium
Human gate: schema
Status: blocked

#### Scope and constraints

เป็นงานวัดผล/รายงาน ไม่ใช่ implement pipeline · ทดสอบกับไฟล์จริงอย่างน้อย 3 ฉบับและรายงานผลครบทั้งสามสถานะ ('ok'/'empty'/'failed') · ผล 'แย่เป็นวงกว่าง' ต้องยกระดับกลับมาตัดสินขอบเขต Module F ก่อน implement ต่อ

#### Retrieval hints

Hypothesis: markitdown เป็น Python package ที่เรียกตรงได้จาก service ใหม่ — ยืนยันเวอร์ชัน/พฤติกรรมจริงจากการรัน ไม่ใช่จากเอกสาร
Query: ค้น `markitdown`, `conversion_status`, `markdown_origin` ใน design.md และซอร์ส service
Provenance: DES-019, DEC-019

#### Do not modify

โค้ด production ใด ๆ (spike แยกจาก pipeline จริง) · ตาราง/สคีมา

#### Acceptance criteria

AC-001.1 (ฐานวัดผล): ได้ผลทดสอบแปลงจริงต่อไฟล์ (สถานะ 'ok'/'empty'/'failed' + เหตุผล) อย่างน้อย 3 ฉบับของ KMUTT พร้อมข้อสรุปว่า RISK-F02 ปิดได้หรือต้องเพิ่ม OCR ตั้งแต่รอบแรก

#### Required validation and expected evidence

ตรวจ AC-001.1 (ฐานวัดผล) ด้วยการเก็บไฟล์ต้นทาง + ผลแปลง + สถานะต่อฉบับไว้เป็นหลักฐานแนบรายงาน spike — ตัวเลข conversion rate ต้องมาจากการรันจริง ไม่ใช่ประเมิน

#### Rollback/compatibility notes

spike ไม่แตะของถาวร — ทิ้ง/เก็บรายงานไว้เป็นหลักฐานการตัดสินขอบเขตได้อิสระ

### Task BE-005 — PDF upload endpoint with sha256 dedup

Objective: endpoint อัปโหลด PDF ต้นฉบับของทีมงานภายใน — เก็บไฟล์ + `"OriginalSha256"` + เขียน `public."TCompassProgramSource"` โดย **resolve `"UniversityCode"` (เช่น `'KMUTT'`) เป็น `"UniversityID"` (integer) ที่ชั้น service ก่อนเขียน — ห้ามรับเลข Id จาก client และห้าม hardcode Id** · ชน unique index `"UX_TCompassProgramSource_UniversityID_OriginalSha256"` (กันไฟล์ซ้ำ **ต่อมหาวิทยาลัย**) ต้องตอบกลับเป็นข้อมูลว่าไฟล์นี้เคยเข้าแล้วเมื่อไหร่โดยใคร ไม่ใช่ error เฉย ๆ (DES-019 §1, §11) — ที่เก็บไฟล์จริงยังบล็อกที่ OQ-F09 (PRE-F06) ระบุ placeholder ไว้ก่อนได้
Why: ไฟล์ต้นฉบับคือหลักตรวจย้อนหลังว่าผลวิเคราะห์มาจากเอกสารฉบับไหน และการกันไฟล์ซ้ำต้องสื่อสารกับคนใช้งาน ไม่ใช่ปัดตกเงียบ ๆ
Owner: backend-engineer
Depends on: BE-003
Traceability: REQ-001, AC-001.2, DES-019, DEC-019, DES-024, DEC-024, DES-018, DEC-018
Produces: none
Consumes: Contract:ImportRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: security
Human gate: security, design-ambiguity, schema, breaking-contract
Status: pending

#### Scope and constraints

รับอัปโหลดจากทีมงานภายในเท่านั้น (ไม่ใช่โรงเรียน) · เก็บทั้งไฟล์ต้นฉบับและ hash คู่กันเสมอ · จุดที่เก็บไฟล์จริงเป็น placeholder ได้จนกว่า OQ-F09 จะปิด แต่ interface ต้องพร้อมเปลี่ยนที่เก็บโดยไม่แก้ flow · **สัญญาฝั่งนอกใช้ `"UniversityCode"` เสมอ · การแปลงเป็น `"UniversityID"` ทำที่ชั้น service ตอน resolve เท่านั้น · code ที่ resolve ไม่พบ = ปฏิเสธคำขอ ห้ามสร้างแถว `public."TCompassUniversity"` ใหม่ให้อัตโนมัติ (กติกา code → Id ของ `## Data Model` v9 · สัญญาที่อ้างอิงได้คือ DES-018/DEC-018)**

#### Retrieval hints

Hypothesis: endpoint อยู่ใน app ของ Curriculum Service ใหม่ และตาราง `public."TCompassProgramSource"` ถูกสร้างโดย BE-003 — ตาราง source ใช้ `"UniversityID" integer` FK (v9 เดิมเป็น `"UniversityCode"` text) — ยืนยัน DDL/ชื่อ+ชนิดคอลัมน์จริงจาก migration ก่อนเขียน
Query: ค้น `TCompassProgramSource`, `OriginalSha256`, `UX_TCompassProgramSource_UniversityID_OriginalSha256`, `UniversityCode`, `AzureUploadFile` ใน design.md/Target
Provenance: DES-019, DEC-019, DES-024, DEC-024, DES-018, DEC-018, Contract:ImportRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

`AzureUploadFile` ของ ClassOnlineWeb (ห้ามใช้ — hardcode AK/SK อยู่ในซอร์สและ parameter ไม่ตรงบริบท) · ตารางอื่นของคลัง · สคีมา

#### Acceptance criteria

AC-001.2: ระบบเก็บทั้งไฟล์ต้นฉบับและ hash ไว้ตรวจย้อนหลังได้ว่าผลวิเคราะห์มาจากเอกสารฉบับไหน — และการอัปโหลดไฟล์ที่เคยเข้าแล้ว (ชน unique index) ต้องได้รับข้อมูลว่าเคยเข้าเมื่อไหร่โดยใคร ไม่ใช่ error ทั่วไป

#### Required validation and expected evidence

ตรวจ AC-001.2 ด้วยการอัปโหลดไฟล์จริง 2 ครั้งภายใต้ `"UniversityCode"` เดียวกัน (ครั้งแรกสำเร็จ ครั้งสองชน hash) แล้วตรวจแถว `public."TCompassProgramSource"` ว่า `"UniversityID"` ถูก resolve จาก code จริง + ผลตอบกลับของกรณีชน — เก็บ request/response จริงเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert ได้โดยไม่กระทบ flow อื่น · placeholder ที่เก็บไฟล์ต้องถูกแทนที่ (ไม่ใช่ถอด) เมื่อ OQ-F09 ปิด

### Task BE-006 — markitdown conversion pipeline (sandboxed)

Objective: markitdown conversion pipeline — ตั้ง `conversion_status` ('ok'/'empty'/'failed') ตามเกณฑ์ข้อความหลัง trim ยาว ≥ 200 ตัวอักษร, รันการแปลงในโหมด sandbox/process แยกที่ไม่มี network ออก, จำกัดขนาดไฟล์ + timeout + ตรวจ MIME/magic bytes ฝั่งเซิร์ฟเวอร์ (DES-019 §2 + Module F Security Considerations)
Why: PDF ที่อัปโหลดเข้ามาเชื่อไม่ได้แม้มาจากทีมภายใน — parser ที่โดนไฟล์ที่จงใจทำให้พังต้องไม่ลาก service ล้ม และความล้มเหลวเงียบ ๆ ของ PDF สแกนต้องถูกจับด้วยเกณฑ์ 200 ตัวอักษร ไม่ปล่อยข้อความว่างเข้า AI
Owner: backend-engineer
Depends on: BE-004, BE-005
Traceability: REQ-001, AC-001.1, DES-019, DEC-019
Produces: none
Consumes: Contract:ImportRules.v1
Risk: high
Human gate: schema
Status: pending

#### Scope and constraints

แปลงก่อนเสมอ แล้วจึงมีทางส่งต่อ AI · 'empty'/'failed' → หยุด ห้ามเรียก AI เข้าคิวให้คนจัดการพร้อม `conversion_note` · การแปลงต้องอยู่ใน process แยกที่ตัด network ออก พร้อมขีดจำกัดขนาด/เวลาที่ชัดเจน

#### Retrieval hints

Hypothesis: pipeline ต่อจาก upload endpoint ของ BE-005 และเก็บสถานะลงคอลัมน์ `conversion_status`/`conversion_note` ของตาราง source — ยืนยันชื่อคอลัมน์จาก DDL จริง
Query: ค้น `conversion_status`, `conversion_note`, `markdown_origin`, `markitdown` ใน design.md และซอร์ส service
Provenance: DES-019, DEC-019, Contract:ImportRules.v1

#### Do not modify

เกณฑ์ 200 ตัวอักษร (ค่าที่เอกสารกำหนด ไม่ใช่ค่าที่ engineer ตั้งเอง) · endpoint upload · ตาราง/สคีมา

#### Acceptance criteria

AC-001.1: ระบบแปลง PDF เป็นข้อความ Markdown ด้วย markitdown ก่อนส่งข้อความให้ AI อ่านเสมอ — และผลแปลงที่สั้นกว่าเกณฑ์หรือล้ม ต้องถูกตั้งสถานะ 'empty'/'failed' พร้อมหยุดก่อนถึงขั้น AI ทุกครั้ง

#### Required validation and expected evidence

ตรวจ AC-001.1 ด้วยการรัน pipeline กับไฟล์จริง 3 กรณี (แปลงได้ / PDF สแกน / ไฟล์เสีย) และยืนยัน sandbox: process แปลงไม่มีทางออก network + จำกัดขนาด/timeout ทำงาน — เก็บผลรัน/บันทึก sandbox เป็นหลักฐาน

#### Rollback/compatibility notes

pipeline เป็นขั้นแยกของ service ใหม่ — revert ได้โดย upload endpoint ยังทำงานเก็บไฟล์ได้ตามปกติ

### Task BE-007 — Split document per program before AI

Objective: แยกเอกสารเป็นส่วนต่อสาขาก่อนเรียก AI — ตัดที่ขอบเขตหัวข้อ markdown เท่านั้น (`#`/`##`) ห้ามตัดกลางตาราง ถ้าหัวข้อเดียวยังยาวเกิน budget ให้ตัดต่อที่ขอบเขตย่อหน้า (DES-019 §3)
Why: เอกสารหนึ่งเล่มมีหลายสาขา และสัญญาบังคับเรียก AI หนึ่งครั้งต่อหนึ่งสาขา — การยัดทั้งเล่มทำให้ผลไม่นิ่งและผิดลำดับขั้นที่กำหนดไว้
Owner: backend-engineer
Depends on: BE-006
Traceability: REQ-002, AC-002.3, DES-019, DEC-019
Produces: none
Consumes: Contract:ImportRules.v1
Risk: medium
Human gate: schema
Status: pending

#### Scope and constraints

ตัดเฉพาะที่ขอบหัวข้อ แล้วจึงขอบย่อหน้า — ห้ามตัดกลางตารางเด็ดขาด · ทุกครั้งที่ต้องตัดชิ้น ต้องมีทางตั้ง `analysis_status = 'ai_incomplete'` ในขั้นถัดไป (BE-010)

#### Retrieval hints

Hypothesis: ตัวแบ่งเป็น utility แยกใน service ที่รับข้อความ markdown แล้วคืนชิ้นต่อสาขา — ยืนยันโครงหลังเขียน ไม่มี symbol เดิมให้ค้น
Query: ค้น `analysis_status`, `ai_incomplete` ใน design.md และซอร์ส service
Provenance: DES-019, DEC-019, Contract:ImportRules.v1

#### Do not modify

ข้อความที่แปลงแล้วจาก pipeline (อ่านอย่างเดียว) · ตาราง/สคีมา · เกณฑ์การเรียก AI ต่อสาขา

#### Acceptance criteria

AC-002.3 (ฐานรองรับ): โครงการแบ่งรองรับการเรียก AI ครั้งเดียวต่อหนึ่งสาขา ตามที่ REQ-002 บังคับ — การตัดไม่เคยทำตารางในเอกสารขาดครึ่ง

#### Required validation and expected evidence

ตรวจ AC-002.3 (ฐานรองรับ) ด้วยการรันตัวแบ่งกับเอกสารจริงที่มีตาราง แล้วตรวจว่าทุกชิ้นไม่มีตารางถูกตัดครึ่ง + ชิ้นต่อสาขาครบ — เก็บผลแบ่งเป็นหลักฐาน

#### Rollback/compatibility notes

utility ภายใน service — revert ได้ไม่กระทบข้อมูลที่เก็บแล้ว

### Task BE-008 — glm-5.2 integration with secret-store key

Objective: เชื่อมต่อ `glm-5.2` — เรียกหนึ่งครั้งต่อหนึ่งสาขา, retry ได้ไม่เกิน 2 ครั้งพร้อม backoff, คีย์จัดเก็บที่ `prod.config` กลุ่มคีย์ชื่อกลาง `ApiKey`/`Endpoint`/`Model` และ **service อ่าน prod.config ตรงเอง (v14 — ไม่มีขั้น env injection; path ปรับได้ด้วย `CURRICULUM_PROD_CONFIG_PATH`) ของ service ตอน launch (`CURRICULUM_GLM_API_KEY`) — ห้าม hardcode ในซอร์สโค้ดทุกจุด และฝั่ง ClassOnlineWeb ยังคงไม่มีโครงเรียก AI (**2026-09-16 — แก้ตามมติผู้ใช้ "รวม config ที่เดียว" design v13** ซึ่งยกเลิกข้อเดิม "ห้ามใส่ prod.config"; DES-019 §1, §7 ฉบับ v13) — การเขียน+ทดสอบจริงบล็อกที่ PRE-F01 (คีย์ยังไม่มีจริง) จนกว่าจะมีคีย์
Why: นี่เป็นการเรียกบริการ AI ภายนอกครั้งแรกของสายงาน — คีย์ที่หลุดเข้าซอร์ส/config ฝั่ง .NET ขยายพื้นผิวที่เปิดอยู่แล้วของระบบ และการเรียกซ้ำตอนเด็กเปิดหน้าจอผิดสัญญา REQ-002 โดยตรง
Owner: backend-engineer
Tier: T2
Depends on: BE-007
Traceability: REQ-002, AC-002.3, DES-019, DEC-019
Produces: none
Consumes: Contract:ImportRules.v1
Risk: security
Human gate: security, schema
Status: pending

#### Scope and constraints

เรียกเฉพาะตอน import ต่อหนึ่งสาขา — ฝั่ง ClassOnlineWeb ต้องไม่มีโค้ดเรียก AI เกิดขึ้นเลย · ครั้งสุดท้ายยังล้มต้องเดินเส้นทางของ BE-012 (ไม่ error ให้ปลายทางเห็น) · จนกว่า PRE-F01 จะเสร็จ งานนี้เขียน+ทดสอบ integration จริงไม่ได้ (mock ได้)

#### Retrieval hints

Hypothesis: จุดเรียกอยู่ใน service ใหม่หลังตัวแบ่งเอกสาร — ยืนยัน endpoint/model ของ `glm-5.2` กับผู้ให้บริการจริงตอน implement (ตัวเลขจากเอกสารไม่มี)
Query: ค้น `glm-5.2`, `retry`, `secret` ใน design.md และซอร์ส service
Provenance: DES-019, DEC-019, Contract:ImportRules.v1

#### Do not modify

`prod.config` และไฟล์ config ฝั่ง ClassOnlineWeb (ห้ามวางคีย์) · ตาราง/สคีมา · ลำดับขั้น import ก่อนหน้า

#### Acceptance criteria

AC-002.3: AI ถูกเรียกครั้งเดียวตอนนำเอกสารเข้าระบบ (ต่อหนึ่งสาขา) แล้วเก็บผลไว้ใช้ตลอด — ไม่มีเส้นทางใดเรียก AI ใหม่เมื่อเด็กเปิดหน้าจอ และคีย์ปรากฏเฉพาะใน secret store ของ service

#### Required validation and expected evidence

ตรวจ AC-002.3 ด้วยการนับจำนวนครั้งเรียกจริงต่อการ import หนึ่งสาขา (log/ตัวนับของ provider) + grep ยืนยันไม่มีคีย์ในซอร์ส/config — เก็บ log การเรียกและผล grep เป็นหลักฐาน (ทดสอบ integration จริงทำได้เมื่อ PRE-F01 ปิด)

#### Rollback/compatibility notes

integration อยู่ใน service ใหม่ — ปิดเส้นทางเรียก AI ได้โดยไม่กระทบขั้นเก็บไฟล์/แปลง · ไม่มีข้อมูลเด็กเกี่ยวข้องใน flow นี้เลย

### Task BE-009 — Exact-match validation of AI output

Objective: validate ผล AI แบบ exact-match ตามตารางเกณฑ์ปัจจุบันของ DES-019 §5: กลุ่มสาระตรง 8 ชื่อ canonical เป๊ะ ๆ, น้ำหนัก (1/2/3 หรือคำไทย แปลงเป็น 1/2/3), `dimension_code` ตรงคอลัมน์ `"DimensionCode"` 6 มิติใน `public."TCompassRiasecDimension"` (แถวเดิมเขียน `trait_code`/8 แกน — ถูกแทนที่ด้วย RIASEC แล้ว), `desired_level` 1-5, `cluster_code` ตรงคอลัมน์ `"ClusterCode"` 1 ใน 11 code, **`faculty_group_code` ตรงคอลัมน์ `"FacultyGroupCode"` 1 ใน 26 code (v9: ฟิลด์นี้เดิมชื่อ `faculty_group_id` ในสัญญากับ AI — เปลี่ยนชื่อเพราะ `"FacultyGroupID"` เป็น int identity ของฐานข้อมูลไปแล้ว)** — **ทั้งสามฟิลด์เป็น text code เสมอในสัญญากับ AI · service เป็นผู้ resolve เป็น `"DimensionID"`/`"ClusterID"`/`"FacultyGroupID"` (integer) ก่อนเขียนลงตาราง · ห้ามส่งเลข Id เข้า prompt และห้ามให้ AI คืน Id** — แถวไม่ผ่านทิ้งจากชุดข้อมูลแต่ `ai_raw_response` ต้องเก็บเสมอ และตั้ง `analysis_status='ai_incomplete'` เมื่อมีแถวไม่ผ่าน
Why: 8 ชื่อกลุ่มสาระ canonical เป็นคีย์เชื่อมเดียวระหว่างผล AI กับคะแนนเด็ก — ชื่อที่เพี้ยนแม้ตัวเดียวหายไปเงียบ ๆ และ % ที่เด็กเห็นเพี้ยนโดยไม่มี error (RISK-F08)
Owner: backend-engineer
Depends on: BE-008
Traceability: REQ-002, AC-002.1, AC-002.2, DES-019, DEC-019, DES-018, DEC-018
Produces: none
Consumes: Contract:ImportRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: high
Human gate: schema, breaking-contract
Status: pending

#### Scope and constraints

validate แบบ exact match — ห้าม fuzzy match ห้าม normalize อื่นนอกจาก trim ช่องว่างหัวท้าย · เก็บบางส่วนได้ (แถวผ่านเก็บ แถวไม่ผ่านทิ้งพร้อมตั้ง ai_incomplete) · `faculty_group_code` ไม่ผ่าน (หรือ resolve เป็น Id ไม่ได้) ให้ปล่อย `public."TCompassProgram"."FacultyGroupID"` เป็น NULL ให้คนกรอก ไม่ปฏิเสธทั้งก้อน · **code ตัวใดที่ resolve เป็น Id ไม่ได้ = validate ไม่ผ่าน — ห้ามสร้างแถว master ใหม่ให้อัตโนมัติ (11 cluster / 6 มิติ / 26 กลุ่มคณะ เป็นชุดปิด) และห้ามเขียน Id ที่เดาเอง**

#### Retrieval hints

Hypothesis: รายชื่อ canonical ยืนยันได้จาก `CompassScoreService.MapCanonicalSubject` ใน ClassOnlineWeb และ seed ตาราง dimension/cluster/faculty group จาก BE-003 — การ resolve เป็น Id ทำด้วย `JOIN ... ON "<Name>Code" = @code` ตามกติกา v9 — ยืนยันชุด string จริงจากซอร์ส/seed ก่อนเขียน validator
Query: ค้น `MapCanonicalSubject`, `TCompassRiasecDimension`, `TCompassInterestCluster`, `TCompassFacultyGroup`, `FacultyGroupCode`, `faculty_group_code`, `ai_raw_response` ใน Target/design.md
Provenance: DES-019, DEC-019, DES-018, DEC-018, Contract:ImportRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

ชุด 8 ชื่อกลุ่มสาระ/11 cluster code/6 มิติ/26 กลุ่มคณะ (อ่านจาก seed ไม่เขียนใหม่) · ขั้นเรียก AI · สคีมา · **ชื่อฟิลด์ในสัญญากับ AI (`dimension_code`/`cluster_code`/`faculty_group_code` — ห้ามเปลี่ยนกลับเป็น `faculty_group_id` และห้ามเปลี่ยนเป็น Id)**

#### Acceptance criteria

AC-002.1: ผลที่ผ่าน validate ต่อหนึ่งสาขามีอย่างน้อย 2 ก้อน — กลุ่มสาระพร้อมน้ำหนัก และโปรไฟล์พฤติกรรม/ระดับมิติ RIASEC แบบที่จับคู่ได้ (ไม่ใช่ตัวอักษร MBTI ไม่ใช่คะแนนความประพฤติ)
AC-002.2: กลุ่มสาระที่ผ่าน validate ใช้ 8 ชื่อ canonical ชุดเดียวกับ `sb-compass` REQ-001 เสมอ — ชื่อนอกชุดไม่มีทางถูกเก็บ

#### Required validation and expected evidence

ตรวจ AC-002.1/AC-002.2 ด้วยชุดผล AI จำลอง: ชื่อถูกต้อง/เพี้ยนหนึ่งตัวอักษร/น้ำหนักคำไทย/level เกินช่วง/`cluster_code`-`dimension_code` ที่ไม่มีในคลัง/`faculty_group_code` ที่ไม่มีในคลัง (ต้องได้ `"FacultyGroupID"` เป็น NULL ไม่ใช่ปฏิเสธทั้งก้อน) — ตรวจว่าแถวไม่ผ่านถูกทิ้งแต่ `ai_raw_response` ยังอยู่ครบและ `analysis_status='ai_incomplete'` ถูกตั้ง + ตรวจว่าค่าที่เขียนลงตารางเป็น Id ที่ resolve มาจาก code จริง + grep prompt/payload ยืนยันว่าไม่มีเลข Id ถูกส่งออกไปหา AI — เก็บผล validate/ผล grep เป็นหลักฐาน

#### Rollback/compatibility notes

validator เป็นขั้นแยก — tighten/loosen ภายหลังต้อง amend เอกสารก่อน (เกณฑ์เป็นสัญญา) · revert ไม่กระทบข้อมูลที่เก็บแล้ว

### Task BE-010 — Deterministic multi-chunk merge

Objective: กติการวมผลจากหลายชิ้นส่วนแบบ deterministic (ห้ามใช้ดุลพินิจ): น้ำหนักกลุ่มสาระใช้ค่ามากสุด, มิติ RIASEC ใช้ค่าเฉลี่ยปัดเป็นจำนวนเต็มที่ใกล้ที่สุด (`.5` ปัดขึ้น), ข้อความบรรยายต่อกันตามลำดับชิ้น, cluster ที่เสนอรวมแบบ union — และบังคับ `analysis_status='ai_incomplete'` ทุกครั้งที่ต้องตัดชิ้น (DES-019 §3)
Why: เอกสารยาวถูกแบ่งหลายชิ้น ถ้าการรวมไม่นิ่ง คนสองคน import เอกสารเดียวกันจะได้ข้อมูลไม่เท่ากัน — ความนิ่งคือเงื่อนไขที่ทำให้ผลตรวจย้อนหลังได้
Owner: backend-engineer
Depends on: BE-009
Traceability: REQ-002, AC-002.1, DES-019, DEC-019
Produces: none
Consumes: Contract:ImportRules.v1
Risk: medium
Human gate: schema
Status: pending

#### Scope and constraints

กติกา 4 ข้อคงตามสัญญาเป๊ะ ไม่ปรับสัดส่วนเอง · ตั้ง ai_incomplete ทุกครั้งที่มีการตัดชิ้น ไม่ว่าผลรวมจะดูครบหรือไม่

#### Retrieval hints

Hypothesis: ตัวรวมทำงานบนผล validate ของ BE-009 ก่อนเขียน intake — ยืนยันโครง flow จริงหลัง implement
Query: ค้น `ai_incomplete`, `union`, `analysis_status` ใน design.md และซอร์ส service
Provenance: DES-019, DEC-019, Contract:ImportRules.v1

#### Do not modify

กติกาเฉลี่ย/ปัดของมิติ RIASEC (คงตามสัญญา) · validator ของ BE-009 · สคีมา

#### Acceptance criteria

AC-002.1: ผลรวมหลายชิ้นต่อหนึ่งสาขายังคงเป็นชุดข้อมูลที่จับคู่ได้ครบ 2 ก้อน (กลุ่มสาระ+น้ำหนัก, โปรไฟล์ RIASEC) ด้วยกติการวมที่ทำซ้ำได้ผลเดิมทุกครั้ง

#### Required validation and expected evidence

ตรวจ AC-002.1 ด้วยการรวมชุดชิ้นทดสอบเดียวกันซ้ำหลายรอบ (ต้องได้ผลเท่ากันทุกครั้ง) + เทียบกติการวมรายข้อกับสัญญา — เก็บผลรันซ้ำเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นขั้นคำนวณภายใน — revert ได้ · ข้อมูล intake ที่เขียนไปแล้วไม่ถูกคำนวณใหม่อัตโนมัติ

### Task BE-011 — dedup_key + intake write

Objective: คำนวณ `dedup_key` จาก `raw_program_name` ตามลำดับขั้นที่กำหนด (ตัดช่องว่าง/ยุบช่องว่างติดกัน → ตัดอักขระที่ระบุ → ตัดคำนำหน้า/คำลงท้ายซ้ำจนหมด → lowercase ตัวละติน) แล้วเขียน `public."TCompassProgramIntake"` พร้อม `matched_program_id` เป็นข้อเสนอเท่านั้น (DES-019 §8)
Why: ชื่อสาขาเขียนไม่เหมือนกันข้ามมหาวิทยาลัย — dedup ที่ชนต้องเป็นข้อเสนอให้คนตัดสินใน `resolution` ไม่ใช่ merge อัตโนมัติ ซึ่งจะรวมสาขาผิดคู่เงียบ ๆ แล้วเด็กเห็นสาขาเดียวกันสองครั้งใน top-10
Owner: backend-engineer
Depends on: BE-009
Traceability: REQ-006, AC-006.2, DES-019, DEC-019
Produces: none
Consumes: Contract:ImportRules.v1
Risk: medium
Human gate: schema
Status: pending

#### Scope and constraints

ลำดับขั้นคำนวณ dedup_key คงตามสัญญาเป๊ะ ห้ามเพิ่ม/ลดขั้น · การชนไม่ merge อัตโนมัติเด็ดขาด — ตั้ง matched_program_id แล้วให้คนตัดสิน

#### Retrieval hints

Hypothesis: ตัวคำนวณเป็น utility ของ service ที่รันก่อนเขียน intake — ยืนยันชื่อคอลัมน์ intake จาก DDL ของ BE-003
Query: ค้น `dedup_key`, `matched_program_id`, `TCompassProgramIntake` ใน design.md/Target
Provenance: DES-019, DEC-019, Contract:ImportRules.v1

#### Do not modify

ตาราง `public."TCompassProgram"` (ยังไม่แตะใน task นี้) · ลำดับขั้น dedup_key · validator ของ BE-009

#### Acceptance criteria

AC-006.2 (ฐานกันซ้ำ): สาขาที่ชื่อเขียนต่างกันแต่ตรงกันจริงถูกเสนอคู่กันผ่าน matched_program_id เพื่อให้คนตัดสิน — ระบบไม่มีทางสร้างสาขาซ้ำเงียบ ๆ จนไปโผล่ซ้ำในผลของเด็กภายหลัง

#### Required validation and expected evidence

ตรวจ AC-006.2 (ฐานกันซ้ำ) ด้วยชุดชื่อทดสอบ: เหมือนเป๊ะ/ต่างช่องว่าง/มีคำนำหน้า/ต่างมหาวิทยาลัย — เทียบ dedup_key ที่ได้กับลำดับขั้นสัญญาทีละขั้น + ตรวจแถว intake ที่เขียน — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

utility + เขียน intake ใหม่ — revert ได้ · แถว intake ที่เขียนไปแล้วเป็นประวัติ ไม่ถูกลบ

### Task BE-012 — AI-failure intake path (ai_incomplete)

Objective: เส้นทาง AI ล้มเหลว/ตอบไม่ครบหลัง retry ครบ 2 ครั้ง — เขียน intake ตามปกติพร้อม `ai_error` และ `analysis_status='ai_incomplete'` ห้ามเดาแทน AI ห้ามเติมค่า default ให้ครบ และห้าม error ให้ผู้ใช้ปลายทางเห็น (DES-019 §7)
Why: ผู้ใช้เลือกทาง "ให้คนกรอกมือแทน" ไม่ใช่ "ซ่อนสาขา" — เส้นทางล้มเหลวต้องทิ้งสาขาไว้ในคิวให้คนกรอกต่อ ไม่ใช่ทำให้ import ทั้งก้อนพัง
Owner: backend-engineer
Depends on: BE-008
Traceability: REQ-004, AC-004.1, DES-019, DEC-019
Produces: none
Consumes: Contract:ImportRules.v1
Risk: medium
Human gate: schema
Status: pending

#### Scope and constraints

สร้าง intake ตามปกติทุกกรณีที่ล้ม (ค่าว่างทิ้งไว้ให้คนกรอก) · ห้าม error ถึงผู้ใช้ปลายทาง · ห้ามเติมค่าแทน AI ด้วยเหตุผลใด

#### Retrieval hints

Hypothesis: เส้นทางนี้คือ catch ของ integration ใน BE-008 ที่ไหลเข้าเขียน intake เดียวกับ BE-011 — ยืนยันจุดต่อจริงหลัง implement
Query: ค้น `ai_error`, `ai_incomplete` ใน design.md และซอร์ส service
Provenance: DES-019, DEC-019, Contract:ImportRules.v1

#### Do not modify

ลูป retry ของ BE-008 (ค่า ≤2 ครั้ง + backoff คงเดิม) · validator ของ BE-009 · สคีมา

#### Acceptance criteria

AC-004.1: เมื่อ AI สรุปข้อมูลไม่ได้/ไม่ตอบ ระบบไม่ error ให้ผู้ใช้เห็นและไม่เดาแทน — สาขาค้างสถานะรอตรวจพร้อมช่องให้คนกรอกข้อมูลเอง (intake มี ai_error + ai_incomplete บันทึกไว้)

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วยการจำลอง AI ล้ม/ตอบไม่ครบ (mock) แล้วตรวจ intake ที่ถูกเขียน (ai_error ครบ, ไม่มีค่าแต่งเติม) + ผู้ใช้ปลายทางไม่เห็น error — เก็บผลจำลองเป็นหลักฐาน

#### Rollback/compatibility notes

เส้นทางย่อยของ service — revert ได้ · intake ที่เขียนไปแล้วเป็นประวัติของคนกรอกต่อ

## Phase 3: Module G — Review & Approval Console (REQ-003, REQ-004) 🔒 Security gate

### Task BE-013 — Staff auth middleware

Objective: Auth middleware ของ Curriculum Service — ตัวตนของผู้ใช้งาน console มาจาก SchoolBright Staff/Admin Login session (ปิด OQ-F08 2026-09-15) ห้ามรับ user id/role จาก client (DES-023 §4) — ใช้ session/token จากระบบ SchoolBright Staff ปัจจุบันโดยไม่สร้างระบบ SSO ใหม่
Why: คนที่ล็อกอินเข้ามาได้คือคนที่ตัดสินว่าเด็กทั้งเครือข่ายจะเห็นคำแนะนำอนาคตอะไร — ปิด OQ-F08 แล้ว โดยใช้ session ของ SchoolBright Staff/Admin ที่มีอยู่เดิม
Owner: backend-engineer
Tier: T3
Depends on: none
Traceability: REQ-010, AC-010.1, DES-023, DEC-023, DES-024, DEC-024
Produces: none
Consumes: Contract:AdminReviewRules.v1
Risk: security
Human gate: security, design-ambiguity, schema
Status: pending

#### Scope and constraints

ทุก endpoint ของ console ผ่าน middleware นี้ · fail-closed เมื่อตรวจตัวตนไม่ได้ · ตรวจสอบ session กับ SchoolBright Staff/Admin Login ปัจจุบัน (สกัด UserID / SchoolID จาก token/session ที่ยืนยันแล้ว)

#### Retrieval hints

Hypothesis: middleware อยู่ชั้นหน้าสุดของ app FastAPI และ user id ที่สกัดได้จะถูกใช้เติม `imported_by`/`reviewed_by` ใน task ถัดไป
Query: ค้น `reviewed_by`, `imported_by`, `CompanyID`, `UserID` ใน design.md และ ClassOnlineWeb
Provenance: DES-023, DEC-023, DES-024, DEC-024, Contract:AdminReviewRules.v1

#### Do not modify

กลไก Staff Login session ของระบบเดิม · endpoint อื่น · สคีมา

#### Acceptance criteria

AC-010.1 (เชิงตัวตนผู้ใช้งาน console): ทุก action ของ console ยึดตัวตนจาก session SchoolBright Staff/Admin เท่านั้น — ไม่มี endpoint ใดรับ user id/role จาก request body/header ที่ client ตั้งเองได้

#### Required validation and expected evidence

ตรวจ AC-010.1 (เชิงตัวตน) ด้วยการยิง request แนบ user id ปลอมใน body/header แล้วยืนยันถูกปฏิเสธ + กรณีไม่มี session ที่ถูกต้องต้อง fail-closed — เก็บผลทดสอบเป็นหลักฐาน

#### Rollback/compatibility notes

middleware ชั้นเดียว — revert ได้ แต่ต้องไม่ปล่อย console ขึ้นใช้จริงโดยไม่มี middleware นี้ · การเปลี่ยน provider ภายหลังแก้ที่ middleware จุดเดียว

### Task BE-014 — Review queue endpoints

Objective: endpoint คิวงาน: คิว `public."TCompassProgramIntake"` ที่ `resolution='pending'` **กรองตามมหาวิทยาลัยด้วย `"UniversityID"` ที่ join มาจาก `public."TCompassProgramSource"` (v9 — เดิมกรองที่ `university_code` ตรง ๆ) โดย API ยังรับ/คืนค่าเป็น `"UniversityCode"` (เช่น `'KMUTT'`) เหมือนเดิม และ resolve เป็น Id ที่ชั้น service** เรียงตาม `created_at` + คิว `public."TCompassProgram"` ที่ `status='pending_review'` (DES-023 §5)
Why: คิวคือหน้าต่างเดียวที่คนตรวจเห็นงานค้างครบ — การเรียง/กรองที่นิ่งทำให้งานไม่ตกหล่นเงียบ ๆ ในคลังที่จะโตเป็นร้อยสาขา
Owner: backend-engineer
Depends on: BE-013
Traceability: REQ-003, AC-003.2, DES-023, DEC-023, DES-018, DEC-018
Produces: none
Consumes: Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: low
Human gate: schema, breaking-contract
Status: pending

#### Scope and constraints

อ่านอย่างเดียว · กรอง/เรียงตามสัญญา (มหาวิทยาลัย, created_at) — **พารามิเตอร์ที่รับจากหน้าจอเป็น `"UniversityCode"` (text) เสมอ · การกรองจริงเกิดบน `"UniversityID"` (integer) หลัง resolve · ห้ามรับเลข Id จาก client และห้ามคืน Id เป็นค่าที่หน้าจอต้องส่งกลับมา** · ต้องอยู่หลัง middleware ของ BE-013

#### Retrieval hints

Hypothesis: endpoint อ่านสองตารางที่ BE-003 สร้าง และต้อง join `public."TCompassProgramSource"` เพื่อเข้าถึง `"UniversityID"` (intake ไม่ได้ถือคอลัมน์มหาวิทยาลัยเอง) — ยืนยันชื่อ/ชนิดคอลัมน์ (`resolution`, `created_at`, `status`, `"UniversityID"`, `"UniversityCode"`) จาก DDL จริง
Query: ค้น `TCompassProgramIntake`, `TCompassProgramSource`, `pending_review`, `UniversityID`, `UniversityCode` ใน design.md/Target
Provenance: DES-023, DEC-023, DES-018, DEC-018, Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

ตาราง/สคีมา (อ่านอย่างเดียว) · middleware ของ BE-013 · endpoint แก้ผล/ตัดสิน (task อื่น)

#### Acceptance criteria

AC-003.2 (ฐานคิว): คนตรวจเห็นงานที่รอตัดสิน/รอตรวจครบทุกแถวตามเงื่อนไขคิว เรียงการเข้าก่อน-หลังที่นิ่ง — เป็นฐานให้การแก้ผลก่อนอนุมัติเกิดขึ้นได้จริง

#### Required validation and expected evidence

ตรวจ AC-003.2 (ฐานคิว) ด้วยการ seed แถว intake/program หลายสถานะข้ามอย่างน้อยสองมหาวิทยาลัยแล้วเทียบคิวที่คืน (กรองด้วย `"UniversityCode"` ที่ส่งเข้าไปได้ผลถูกต้องผ่านการ join `"UniversityID"` เรียงถูก) + code ที่ไม่มีในคลังต้องไม่คืนคิวของคนอื่น + 401 เมื่อไม่ผ่าน middleware — เก็บผลเรียกจริงเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint อ่านใหม่ additive — revert ได้ปลอดภัย

### Task BE-015 — Edit AI results endpoint

Objective: endpoint แก้ผลของ AI — กลุ่มสาระ/น้ำหนัก/cluster/กลุ่มคณะเดิม/แกนมิติ RIASEC/ข้อความบรรยาย ทุกแถวที่คนแก้เองต้องถูกตั้ง `is_manual=true` (DES-023 §3) — **v9: ค่าที่รับเข้ามาเป็น code (`"ClusterCode"`/`"DimensionCode"`/`"FacultyGroupCode"`) แล้ว service resolve เป็น `"ClusterID"`/`"DimensionID"`/`"FacultyGroupID"` (integer) ก่อนเขียน `public."TCompassProgramCluster"`/`public."TCompassProgramRiasecProfile"`/`public."TCompassProgram"."FacultyGroupID"` · ห้ามให้ client ส่งเลข Id และห้ามให้คนพิมพ์เลข Id เอง · code ที่ resolve ไม่พบ = ปฏิเสธการแก้ ห้ามสร้างแถว master ใหม่**
Why: แถวที่คนแก้ไว้คืองานของคน — ถ้า import รอบถัดไปเขียนทับได้ งานแก้จะหายเงียบ ๆ ทุกครั้งที่มีเอกสารใหม่
Owner: backend-engineer
Depends on: BE-013
Traceability: REQ-003, AC-003.2, DES-023, DEC-023, DES-018, DEC-018
Produces: none
Consumes: Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: medium
Human gate: schema, breaking-contract
Status: pending

#### Scope and constraints

ทุกการแก้ผ่าน endpoint นี้เท่านั้น · ตั้ง is_manual=true ให้แถวที่คนแก้ครบทุกแถว · ยังไม่รวมการตัดสิน resolution (BE-016) · **สัญญาฝั่งนอกเป็น code เสมอ · การแปลง code → Id อยู่ที่ชั้น service จุดเดียว ไม่กระจายไปตามที่เรียก**

#### Retrieval hints

Hypothesis: endpoint แก้แถวน้ำหนัก/cluster/มิติ/กลุ่มคณะ/บรรยายของสาขา และตารางโปรไฟล์ — คอลัมน์เชื่อมเป็น `integer` Id ทั้งชุดตาม `## Data Model` v9 (`"ClusterID"`, `"DimensionID"`, `"FacultyGroupID"`) — ยืนยันตารางเป้าหมาย/ชนิดคอลัมน์จาก `## Modules` Module G + `## Data Model` ใน design.md
Query: ค้น `is_manual`, `TCompassProgramSubjectWeight`, `TCompassProgramRiasecProfile`, `TCompassProgramCluster`, `FacultyGroupID`, `FacultyGroupCode` ใน design.md/Target
Provenance: DES-023, DEC-023, DES-018, DEC-018, Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

เงื่อนไขก่อนอนุมัติ (BE-017) · กลไก import/validate · สคีมา

#### Acceptance criteria

AC-003.2: คนตรวจแก้ผลของ AI (กลุ่มสาระ/น้ำหนัก/โปรไฟล์พฤติกรรม) ได้ก่อนกดอนุมัติ — และทุกค่าที่คนแก้ถูกตั้งสถานะ manual ให้ระบบรู้เสมอ

#### Required validation and expected evidence

ตรวจ AC-003.2 ด้วยการแก้แถวจริงผ่าน endpoint (ส่งค่าเป็น code) แล้วตรวจ is_manual=true ทุกแถวที่แก้ + ค่าที่แก้ปรากฏจริงโดยคอลัมน์ในฐานเป็น Id ที่ resolve มาจาก code + กรณีส่ง code ที่ไม่มีในคลังต้องถูกปฏิเสธและไม่มีแถว master ใหม่เกิดขึ้น — เก็บผลเรียก/ตรวจแถวเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert ได้ · แถวที่แก้ไปแล้วมี is_manual กันการเขียนทับอยู่แล้ว

### Task BE-016 — Resolution endpoint (new/replace/discard)

Objective: endpoint ตัดสิน `resolution` ('new'/'replace'/'discard') — เส้นทาง 'new' ต้อง validate `dedup_key` ไม่ชนก่อนสร้างแถว `public."TCompassProgram"`, แถว `is_manual=true` ห้ามถูกเขียนทับนอกเส้นทาง 'replace' ที่คนสั่งเอง (DES-019 §8 + DES-023 §3)
Why: การตัดสินของคนคือสิ่งที่กันสาขาซ้ำ/ข้อมูลคนถูกทับ — ทาง 'new' ที่ไม่เช็คชนจะโดน UNIQUE ตอน runtime และการเขียนทับแถว manual คือการทำลายงานคนแบบไม่มีใครรู้
Owner: backend-engineer
Depends on: BE-013, BE-011
Traceability: REQ-003, AC-003.3, DES-019, DEC-019, DES-023, DEC-023
Produces: none
Consumes: Contract:ImportRules.v1, Contract:AdminReviewRules.v1
Risk: medium
Human gate: schema
Status: pending

#### Scope and constraints

'type' ของ resolution ตรวจฝั่งเซิร์ฟเวอร์ · 'new' ตรวจชนก่อนสร้างเสมอ · 'replace' ให้เขียนทับแถว manual ได้เมื่อคนสั่งเองเท่านั้น · 'discard' ไม่แตะ program เก็บ intake ไว้เป็นประวัติ

#### Retrieval hints

Hypothesis: endpoint ต่อจากคิวของ BE-014 และอ่าน dedup_key ที่ BE-011 คำนวณ — ยืนยัน flow จริงหลัง implement
Query: ค้น `resolution`, `dedup_key`, `is_manual` ใน design.md/Target
Provenance: DES-019, DEC-019, DES-023, DEC-023, Contract:ImportRules.v1, Contract:AdminReviewRules.v1

#### Do not modify

กลไก swap ของ 'replace' (BE-018) · เงื่อนไขก่อนอนุมัติ (BE-017) · สคีมา

#### Acceptance criteria

AC-003.3: การนำเอกสารใหม่มาแทนของเดิมเดินผ่านการตัดสินของคนเท่านั้น — สาขายังไม่กลับไปเปิดให้เด็กเห็นทันที และแถวที่คนแก้ไว้ไม่มีทางถูกเขียนทับโดยที่คนไม่ได้สั่ง

#### Required validation and expected evidence

ตรวจ AC-003.3 ด้วยการตัดสินจริงทั้งสามเส้นทาง: 'new' บนชื่อที่ชน (ต้องถูกปฏิเสธจนแก้ชื่อ), 'replace' เขียนทับแถว manual ได้เมื่อคนสั่ง, 'discard' ไม่เปลี่ยน program — เก็บผลเรียก/สถานะแถวเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert ได้ · แถว program ที่สร้างผ่าน 'new' เป็นข้อมูลปกติของคลัง

### Task BE-017 — Approval endpoint with 6 server-side conditions

Objective: endpoint กดอนุมัติ — บังคับเงื่อนไขก่อนอนุมัติทั้ง 6 ข้อฝั่งเซิร์ฟเวอร์ (มีแถวน้ำหนัก ≥1, subject canonical ครบ, weight 1/2/3, **มีแถว `public."TCompassProgramCluster"` ≥1 และทุก `"ClusterID"` resolve เป็น 1 ใน 11 แถวของ `public."TCompassInterestCluster"` ได้ — v9: เดิมเช็คที่ `cluster_code`; FK บังคับความถูกต้องให้แล้ว แต่ยังต้องเช็คจำนวนแถวเองที่เซิร์ฟเวอร์**, บรรยายไม่ว่าง, มีแถวโปรไฟล์ RIASEC ≥3 ที่ level 1-5) — fail-closed พร้อมระบุข้อที่ล้ม, ตั้ง `reviewed_by`/`reviewed_at` จาก SSO subject ห้ามเป็น NULL (DES-023 §2, §4)
Why: การอนุมัติคือประตูเดียวที่กันผล AI ถึงเด็ก — เงื่อนไขที่ตรวจแค่ฝั่งหน้าจอ (disable ปุ่ม) ไม่ใช่การป้องกัน และ approved ที่ไม่รู้ว่าใครอนุมัติตามย้อนหลังไม่ได้
Owner: backend-engineer
Depends on: BE-013, BE-015
Traceability: REQ-003, AC-003.1, DES-023, DEC-023, DES-018, DEC-018
Produces: none
Consumes: Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: authorization
Human gate: schema, breaking-contract
Status: pending

#### Scope and constraints

ตรวจเงื่อนไข 6 ข้อที่เซิร์ฟเวอร์ทุกครั้ง — ข้อใดล้มปฏิเสธพร้อมระบุข้อ · reviewed_by/reviewed_at มาจาก SSO เท่านั้น · สถานะหลังอนุมัติเป็น 'approved' เท่านั้นจึงเด็กเห็น

#### Retrieval hints

Hypothesis: endpoint อัปเดตสถานะ `public."TCompassProgram"` และอ่านแถวน้ำหนัก/cluster/โปรไฟล์ที่ BE-015 แก้ไว้ — แถว cluster/โปรไฟล์เชื่อมด้วย `"ClusterID"`/`"DimensionID"` (integer) ตาม `## Data Model` v9 — ยืนยันรายการเงื่อนไขกับ DES-023 §2 และชนิดคอลัมน์กับ `## Data Model` ก่อน implement
Query: ค้น `approved`, `reviewed_by`, `TCompassProgram`, `TCompassProgramCluster`, `ClusterID` ใน design.md/Target
Provenance: DES-023, DEC-023, DES-018, DEC-018, Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

รายการเงื่อนไข 6 ข้อ (คงตามสัญญา — แก้ต้อง amend) · แถวที่ is_manual=true · สคีมา

#### Acceptance criteria

AC-003.1: เด็กเห็นเฉพาะสาขาที่อนุมัติแล้วเท่านั้น — ผลวิเคราะห์ของ AI ห้ามถึงเด็กโดยตรง และการอนุมัติทุกครั้งผ่านการตรวจเงื่อนไขที่เซิร์ฟเวอร์พร้อมผู้อนุมัติที่ระบุตัวตนได้

#### Required validation and expected evidence

ตรวจ AC-003.1 ด้วยการกดอนุมัติบนชุดข้อมูลที่ขาดเงื่อนไขทีละข้อ (ต้องถูกปฏิเสธพร้อมข้อที่ล้ม) + อนุมัติสำเร็จแล้วตรวจ reviewed_by/reviewed_at ไม่ NULL — เก็บผลเรียกทุกกรณีเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert ได้ · สถานะ approved ที่ออกไปแล้วไม่ถูกย้อนโดย revert (ต้องถอนการอนุมัติด้วยมือตามกติกา)

### Task BE-018 — Replace-path data swap transaction

Objective: transaction สลับข้อมูลของเส้นทาง 'replace' — ลบแถวน้ำหนัก/mิติ/cluster ชุดเก่า → เขียนชุดใหม่ → อัปเดต `source_id`/`ai_raw_response`/`reviewed_by`/`reviewed_at`/`updated_at` ในทรานแซกชันเดียว เด็กยังเห็นชุดที่อนุมัติไว้เดิมจนกว่าจะสลับเสร็จ ห้ามเขียนทับข้อมูล approved ก่อนคนกดอนุมัติ (DES-019 §9)
Why: สาขาที่ใช้งานอยู่ต้องไม่หาย/เพี้ยนช่วงระหว่างรอตรวจเอกสารใหม่ — การสลับครึ่ง ๆ ทำให้เด็กเห็นข้อมูลผสมกันครึ่งเล่มเก่าครึ่งเล่มใหม่
Owner: backend-engineer
Depends on: BE-017
Traceability: REQ-003, AC-003.3, DES-019, DEC-019
Produces: none
Consumes: Contract:ImportRules.v1
Risk: high
Human gate: schema
Status: pending

#### Scope and constraints

ทุกอย่างในทรานแซกชันเดียว — ล้มตรงไหน rollback ทั้งชุด · สาขาที่เคย approved คงสถานะ approved + ข้อมูลชุดเดิมจนกว่าอนุมัติชุดใหม่ · สาขาที่หายไปจากเอกสารใหม่ห้ามลบอัตโนมัติ (คงสถานะเดิม)

#### Retrieval hints

Hypothesis: จุดสลับอยู่ต่อจาก endpoint อนุมัติของ BE-017 ในเส้นทาง 'replace' — ยืนยันลำดับตารางที่แตะกับ `## Modules` Module G
Query: ค้น `replace`, `source_id`, `updated_at` ใน design.md/Target
Provenance: DES-019, DEC-019, Contract:ImportRules.v1

#### Do not modify

แถว approved ก่อนคนกดอนุมัติ · intake เดิม (เก็บเป็นประวัติ) · สคีมา

#### Acceptance criteria

AC-003.3: การนำเอกสารฉบับใหม่มาแทนทำให้สาขากลับไปรอตรวจ และข้อมูลชุดใหม่ถึงเด็กเฉพาะหลังอนุมัติ — ข้อมูลชุดเก่าที่ approved อยู่ไม่หายไปจากผลของเด็กระหว่างรอ

#### Required validation and expected evidence

ตรวจ AC-003.3 ด้วยสถานการณ์จริง: อัปโหลดเอกสารใหม่ของสาขาที่ approved อยู่ → ตรวจว่าเด็กยังเห็นชุดเดิม → อนุมัติชุดใหม่ → เห็นชุดใหม่ในทรานแซกชันเดียว (จำลองล้มกลางทางต้อง rollback ครบ) — เก็บผลสถานการณ์เป็นหลักฐาน

#### Rollback/compatibility notes

transaction ล้ม = rollback ครบตามธรรมชาติ · revert โค้ดไม่ย้อนการสลับที่เสร็จแล้ว (ประวัติอยู่ใน intake/source)

### Task BE-019 — Retire program endpoint

Objective: endpoint retire สาขา — ตั้ง `status='retired'`, เด็กไม่เห็น, เก็บประวัติไว้ (DES-023 §1)
Why: สาขาที่เลิกใช้ต้องหายจากผลของเด็กแบบชัดเจนโดยคนตัดสิน ไม่ใช่ลบข้อมูลทิ้งจนตามประวัติไม่ได้
Owner: backend-engineer
Depends on: BE-013
Traceability: REQ-003, AC-003.1, DES-023, DEC-023
Produces: none
Consumes: Contract:AdminReviewRules.v1
Risk: low
Human gate: schema
Status: pending

#### Scope and constraints

retire = set status เท่านั้น ห้ามลบแถว · ทำได้เฉพาะผ่าน console หลัง SSO

#### Retrieval hints

Hypothesis: endpoint อัปเดตสถานะเดียวบน `public."TCompassProgram"` — ยืนยันค่าสถานะที่รองรับจาก state machine ของ DES-023 §1
Query: ค้น `retired`, `status`, `TCompassProgram` ใน design.md/Target
Provenance: DES-023, DEC-023, Contract:AdminReviewRules.v1

#### Do not modify

แถวอื่นของสาขา · state machine อื่น · สคีมา

#### Acceptance criteria

AC-003.1 (ฐานสถานะ): สาขาที่ถูก retire ออกจากผลของเด็กทันที และแถวยังอยู่ในระบบให้ตามประวัติได้

#### Required validation and expected evidence

ตรวจ AC-003.1 (ฐานสถานะ) ด้วยการ retire สาขาจริงแล้วตรวจสถานะ/ผล query ฝั่งผู้บริโภคที่กรอง status — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

set status ย้อนกลับได้ด้วยตัว endpoint การจัดการสถานะ — ไม่มีข้อมูลสูญ

### Task FE-001 — Review queue screens

Objective: หน้าจอคิวงาน (intake queue + pending_review queue) พร้อมตัวกรองมหาวิทยาลัยที่ **แสดง/ส่งค่าเป็น `"UniversityCode"` (text เช่น `'KMUTT'`) เสมอ ไม่ใช่ `"UniversityID"` (integer) — v9: Id เป็นค่าที่ฐานข้อมูลออกเอง ไม่เสถียรข้ามสภาพแวดล้อม ห้ามให้หน้าจอถือ/ส่ง** ต่อกับ endpoint คิวของ BE-014
Why: คนตรวจใช้หน้าจอนี้เป็นทางเข้างานประจำวัน — ต้องแสดงตามคิวจริงจากเซิร์ฟเวอร์ ไม่ใช่สถานะที่หน้าจอเดาเอง
Owner: frontend-engineer
Depends on: BE-014
Traceability: REQ-003, AC-003.2, DES-023, DEC-023, DES-018, DEC-018
Produces: none
Consumes: Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: low
Human gate: schema, breaking-contract
Status: pending

#### Scope and constraints

แสดงจาก payload ของ BE-014 อย่างเดียว · ตัวกรองมหาวิทยาลัยส่ง `"UniversityCode"` ไปที่ endpoint ไม่กรองเองฝั่ง client จนข้อมูลไม่ตรง · **ห้าม hardcode รายการมหาวิทยาลัยหรือเลข Id ในหน้าจอ — รายชื่อมาจาก payload ของเซิร์ฟเวอร์**

#### Retrieval hints

Hypothesis: console ของ Curriculum Service เป็นหน้าจอชุดใหม่ทั้งหมด (service เพิ่งตั้ง) — โครงหน้า/วิธีเรียก API ยืนยันหลัง scaffold ฝั่ง frontend ของ service · พารามิเตอร์ตัวกรองเป็น code ไม่ใช่ Id ตาม DES-023 §5 (v9)
Query: ค้นโครง frontend ของ Curriculum Service, `UniversityCode`, queue payload ใน Target
Provenance: DES-023, DEC-023, DES-018, DEC-018, Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

endpoint ฝั่ง BE · middleware SSO · หน้าจออื่นของ console

#### Acceptance criteria

AC-003.2 (ฐานคิว): หน้าจอแสดงคิวจริงทั้งสองคิว กรองตามมหาวิทยาลัยด้วยค่า `"UniversityCode"` ได้จริง (ไม่มีเลข Id ปรากฏในคำขอ/หน้าจอ) — เป็นทางเข้าให้คนตรวจแก้ผลก่อนอนุมัติได้

#### Required validation and expected evidence

ตรวจ AC-003.2 (ฐานคิว) ด้วยการเปิดหน้าจอเทียบกับ payload ของ BE-014 (แถว/เรียง/กรองตรงกัน) + ไม่ผ่าน SSO ไม่เห็นข้อมูล — เก็บผลเทียบเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้ไม่กระทบ endpoint

### Task FE-002 — AI-result edit screen

Objective: หน้าจอแก้ผลของ AI (กลุ่มสาระ/น้ำหนัก/cluster/กลุ่มคณะเดิม/มิติ RIASEC/ข้อความบรรยาย) แสดงสถานะ manual ของแต่ละแถว ต่อกับ BE-015 — **v9: กลุ่มคณะเดิมต้องเป็นการเลือกจากรายชื่อ 26 กลุ่มที่แสดง `"FacultyGroupCode"`/`"LegacyNameTh"` (cluster/มิติ RIASEC เช่นเดียวกัน แสดง `"ClusterCode"`/`"DimensionCode"` + ชื่อไทย) แล้วส่งค่าเป็น code · ห้ามให้คนพิมพ์/หน้าจอส่งเลข Id เอง**
Why: คนตรวจต้องเห็นว่าค่าไหนมาจาก AI ค่าไหนคนแก้แล้ว เพื่อไม่แก้ซ้ำและรู้ว่างานตัวเองถูกเก็บสถานะไว้
Owner: frontend-engineer
Depends on: BE-015
Traceability: REQ-003, AC-003.2, DES-023, DEC-023, DES-018, DEC-018
Produces: none
Consumes: Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: low
Human gate: schema, breaking-contract
Status: pending

#### Scope and constraints

แก้ผ่าน endpoint ของ BE-015 เท่านั้น · แสดง is_manual ตาม payload จริง ไม่เดาเอง · **รายการตัวเลือก (26 กลุ่มคณะ / 11 cluster / 6 มิติ) มาจาก payload ของเซิร์ฟเวอร์ ห้าม hardcode ในหน้าจอ · ค่าที่ส่งกลับเป็น code เสมอ ไม่ใช่เลข Id**

#### Retrieval hints

Hypothesis: หน้าจอต่อจากคิวของ FE-001 เข้ารายการแก้ต่อสาขา — ตัวเลือกกลุ่มคณะ/cluster/มิติเป็น code+ชื่อไทยตาม DES-023 §3 (v9) — ยืนยัน payload ของ BE-015 ก่อนวาด
Query: ค้น `is_manual`, `FacultyGroupCode`, `LegacyNameTh`, edit payload ของ console ใน Target
Provenance: DES-023, DEC-023, DES-018, DEC-018, Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

endpoint ฝั่ง BE · เงื่อนไขการอนุมัติ · หน้าจออื่น

#### Acceptance criteria

AC-003.2: คนตรวจแก้ทุกชนิดของค่าได้จริงผ่านหน้าจอ (กลุ่มคณะเดิม/cluster/มิติเลือกจากรายชื่อที่แสดง code+ชื่อไทย ไม่ใช่ช่องพิมพ์เลข) และสถานะ manual ที่แสดงตรงกับสิ่งที่เซิร์ฟเวอร์เก็บ

#### Required validation and expected evidence

ตรวจ AC-003.2 ด้วยการแก้ผ่านหน้าจอจริงแล้วเทียบค่า/สถานะที่ endpoint เก็บ + ตรวจ request ที่หน้าจอส่งว่าเป็น code ไม่ใช่เลข Id — เก็บผลเทียบเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้

### Task FE-003 — Resolution + approval console screen

Objective: หน้าจอปุ่ม resolution (new/replace/discard) + ปุ่มอนุมัติ — เงื่อนไขก่อนอนุมัติ 6 ข้อแสดงเป็น UX hint เท่านั้น เซิร์ฟเวอร์ยังเป็นแหล่งความจริงเดียว (ต่อ BE-016/BE-017)
Why: ถ้าหน้าจอบังคับแทนเซิร์ฟเวอร์ ผู้ใช้จะเข้าใจว่าเงื่อนไขผ่านแล้วทั้งที่เซิร์ฟเวอร์ปฏิเสธ — ความจริงต้องมาจากฝั่งเดียว
Owner: frontend-engineer
Depends on: BE-016, BE-017
Traceability: REQ-003, AC-003.1, DES-023, DEC-023
Produces: none
Consumes: Contract:AdminReviewRules.v1
Risk: low
Human gate: schema
Status: pending

#### Scope and constraints

ปุ่มส่งคำสั่งไป endpoint จริงเสมอ · hint 6 ข้อเป็นข้อความช่วยจำ ไม่ใช่ตัวตัดสิน · error จากเซิร์ฟเวอร์ (ข้อที่ล้ม) ต้องแสดงกลับให้คนตรวจเห็น

#### Retrieval hints

Hypothesis: หน้าจอต่อจาก FE-001/FE-002 ใน flow เดียวกัน — ยืนยัน response error ของ BE-017 ก่อนออกแบบการแสดงผล
Query: ค้น response shape ของ approve/resolution endpoints ใน Target
Provenance: DES-023, DEC-023, Contract:AdminReviewRules.v1

#### Do not modify

เงื่อนไข 6 ข้อฝั่งเซิร์ฟเวอร์ · endpoint · หน้าจออื่น

#### Acceptance criteria

AC-003.1 (ฐานการตัดสิน): คนตรวจตัดสิน resolution และกดอนุมัติผ่านหน้าจอได้จริง โดยผลเสมอมาจากการตรวจของเซิร์ฟเวอร์ — ไม่มีทางที่หน้าจอปล่อยผ่านสิ่งที่เซิร์ฟเวอร์ปฏิเสธ

#### Required validation and expected evidence

ตรวจ AC-003.1 (ฐานการตัดสิน) ด้วยการกดจริงทั้ง 3 resolution + อนุมัติบนชุดข้อมูลขาดเงื่อนไข (ต้องเห็นข้อที่ล้มจากเซิร์ฟเวอร์) — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้

## Phase 4: Module I-a — RIASEC Content Authoring (REQ-007, REQ-008 ฝั่งคลังข้อมูล)

### Task BE-020 — RIASEC question bank CRUD

Objective: CRUD endpoint คลังคำถาม RIASEC กลาง (`public."TCompassRiasecQuestion"`: `"DisplayOrder"`, `"Prompt"`, **`"DimensionID"` — v9: `integer` FK ชี้ `public."TCompassRiasecDimension"("DimensionID")` แทนคอลัมน์ `dimension_code` เดิม (และก่อนหน้านั้นคือ `trait_code`/แกนพฤติกรรม)**, `"ReverseScored"`, `"IsActive"`) บน Curriculum Service หลัง SSO เดียวกับ console — **สัญญาฝั่ง API รับ/คืนเป็น `"DimensionCode"` (`R`/`I`/`A`/`S`/`E`/`C`) แล้ว resolve เป็น `"DimensionID"` ที่ชั้น service · เช่นเดียวกันกับ `public."TCompassRiasecRankOption"."DimensionID"` ของคำถามแบบเรียงลำดับ**
Why: ชุดคำถามเป็นชุดกลางชุดเดียวที่ทั้งฝั่ง authoring และฝั่งนักเรียนอ่าน — โครงคอลัมน์ต้องตรงกับกติกาการคำนวณของฝั่งนักเรียน (reverse-scoring, is_active, display_order)
Owner: backend-engineer
Tier: T5
Depends on: BE-013
Traceability: REQ-012, AC-012.3, DES-023, DEC-023, DES-018, DEC-018
Produces: none
Consumes: Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: medium
Human gate: schema, breaking-contract
Status: pending

#### Scope and constraints

CRUD บนตารางคลังคำถามของ Curriculum Service (เจ้าของตารางตามสัญญา) · ทุก operation ผ่าน SSO · คลังต้องรองรับทั้งแบบ Likert (มี reverse_scored) และบล็อกเรียงลำดับ (แยกตารางของตัวเอง) ให้ครบสองรูปแบบ

#### Retrieval hints

Hypothesis: ตารางถูกสร้างโดย BE-003 และ gติการ reverse-scored/สองรูปแบบคำถามอยู่ที่หมวด `## DES-025 — RIASEC Fit Rules` ของ design.md — คอลัมน์เชื่อมมิติเป็น `"DimensionID" integer` ตาม `## Data Model` v9 — ยืนยันชื่อ/ชนิดคอลัมน์จาก DDL จริง
Query: ค้น `TCompassRiasecQuestion`, `TCompassRiasecRankOption`, `DimensionID`, `DimensionCode`, `ReverseScored`, `DisplayOrder` ใน design.md/Target
Provenance: DES-023, DEC-023, DES-018, DEC-018, Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

ตารางบล็อกเรียงลำดับ/ตัวเลือก (คนละตาราง — อย่ายุบรวม) · คำตอบ/ผลที่เก็บแล้วของนักเรียน · สคีมาอื่น

#### Acceptance criteria

AC-012.3 (ฐานคลัง): คลังคำถามรองรับทั้งแบบให้คะแนนแยกข้อ (1-5) และแบบเรียงลำดับอยู่คู่กันตามที่แบบทดสอบต้องใช้ — CRUD เพิ่ม/แก้/ปิดใช้ข้อคำถามได้จริงหลัง SSO

#### Required validation and expected evidence

ตรวจ AC-012.3 (ฐานคลัง) ด้วยการ CRUD จริงผ่าน endpoint (ส่งมิติเป็น `"DimensionCode"`) + ตรวจแถวที่เก็บ (คอลัมน์ครบ, `"DimensionID"` เป็น Id ที่ resolve มาจาก code, is_active/display_order ทำงาน) + ส่ง code ที่ไม่ใช่ 1 ใน 6 ต้องถูกปฏิเสธ + 401 เมื่อไม่ผ่าน SSO — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint CRUD additive — revert ได้ · คำถามที่ถูกใช้ไปแล้วห้ามลบแบบทำผลเก่าตีความไม่ได้ (ปิดใช้ด้วย is_active)

### Task BE-021 — Quest bank CRUD + state machine

Objective: CRUD endpoint คลัง quest (`public."TCompassQuest"`: **`"DimensionID"` — v9: `integer` FK ชี้ `public."TCompassRiasecDimension"` แทนคอลัมน์ `dimension_code` เดิม · API รับ/คืนเป็น `"DimensionCode"` แล้ว resolve ที่ชั้น service**, `"Title"`, `"Description"`, `"Status"` — `"ProgramID"` ต้องเป็น NULL เสมอรอบนี้) พร้อม state machine `pending_review`→`approved`→`retired` (DES-023 + `## DES-025 — RIASEC Fit Rules` §9)
Why: quest ที่เสนอให้เด็กต้องมาจากคลังที่ผ่านการอนุมัติเท่านั้น — state machine เดียวกับ console ทำให้คุมคุณภาพเนื้อหาได้จุดเดียว
Owner: backend-engineer
Depends on: BE-013
Traceability: REQ-008, AC-008.1, DES-023, DEC-023, DES-018, DEC-018
Produces: none
Consumes: Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: medium
Human gate: schema, breaking-contract
Status: pending

#### Scope and constraints

state machine ทางเดียว ห้ามถอยกลับ · `"ProgramID"` เป็น NULL เสมอรอบนี้ (quest ระดับมิติ ไม่ผูกสาขา) · ทุก operation ผ่าน SSO · **มิติอ้างด้วย code ที่สัญญาฝั่งนอก แปลงเป็น `"DimensionID"` ที่ชั้น service — ห้ามให้ client ส่งเลข Id**

#### Retrieval hints

Hypothesis: ตาราง quest ถูกสร้างโดย BE-003 และ state machine เลียนแบบของ `public."TCompassProgram"` — index `"IX_TCompassQuest_DimensionID_Status"` ยืนยันว่าคีย์เลือก quest คือ `"DimensionID"` (v9) — ยืนยันค่าสถานะ/ชนิดคอลัมน์จาก design.md
Query: ค้น `TCompassQuest`, `DimensionID`, `IX_TCompassQuest_DimensionID_Status`, `pending_review`, `approved` ใน design.md/Target
Provenance: DES-023, DEC-023, DES-018, DEC-018, Contract:AdminReviewRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

`TCompassQuestAttempt` (ฝั่งนักเรียน — คนละตาราง) · state machine ของ program · สคีมา

#### Acceptance criteria

AC-008.1 (ฐานคลัง): คลัง quest ระดับมิติถูกจัดการผ่าน CRUD จริงและมีเพียง quest ที่ผ่าน 'approved' เท่านั้นที่มีสิทธิ์ถูกเสนอให้เด็กภายหลัง

#### Required validation and expected evidence

ตรวจ AC-008.1 (ฐานคลัง) ด้วยการเดิน state machine จริง (สร้าง→อนุมัติ→retire + พยายามถอยกลับต้องถูกปฏิเสธ) + ตรวจ `"ProgramID"` NULL ตลอด + ตรวจว่า `"DimensionID"` ที่เก็บ resolve มาจาก `"DimensionCode"` ที่ส่งเข้ามา — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint CRUD additive — revert ได้ · quest ที่ retire คงประวัติตามสถานะ

### Task FE-004 — Question bank screen

Objective: หน้าจอจัดการชุดคำถาม RIASEC กลาง (ทั้งสองรูปแบบ) ต่อกับ BE-020
Why: ทีมงานต้องดูแลคลังคำถามได้เองโดยไม่แตะฐานข้อมูลตรง ๆ — และต้องเห็นสองรูปแบบคำถามแยกกันชัดเจน
Owner: frontend-engineer
Depends on: BE-020
Traceability: REQ-012, AC-012.3, DES-023, DEC-023
Produces: none
Consumes: Contract:AdminReviewRules.v1
Risk: low
Human gate: schema
Status: pending

#### Scope and constraints

แสดง/แก้ผ่าน endpoint ของ BE-020 เท่านั้น · แยกมุมมอง Likert กับบล็อกเรียงลำดับชัดเจน

#### Retrieval hints

Hypothesis: หน้าจออยู่ชุดเดียวกับ console ของ Module G — ยืนยัน payload ของ BE-020 ก่อนวาด
Query: ค้น question bank payload/schema ของ console ใน Target
Provenance: DES-023, DEC-023, Contract:AdminReviewRules.v1

#### Do not modify

endpoint ฝั่ง BE · คำตอบนักเรียนที่เก็บแล้ว · หน้าจออื่น

#### Acceptance criteria

AC-012.3 (ฐานคลัง): จัดการคำถามทั้งสองรูปแบบผ่านหน้าจอได้จริง และข้อมูลที่แสดงตรงกับสิ่งที่ endpoint เก็บ

#### Required validation and expected evidence

ตรวจ AC-012.3 (ฐานคลัง) ด้วยการเพิ่ม/แก้/ปิดใช้คำถามผ่านหน้าจอจริงแล้วเทียบกับ endpoint — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้

### Task FE-005 — Quest bank screen

Objective: หน้าจอจัดการคลัง quest ระดับมิติ (~8-24 ชิ้น) พร้อมสถานะ ต่อกับ BE-021
Why: เนื้อหา quest ต้องผ่านการอนุมัติก่อนถึงเด็ก — หน้าจอต้องสะท้อน state machine จริง ไม่ใช่ให้แก้สถานะลอย ๆ
Owner: frontend-engineer
Depends on: BE-021
Traceability: REQ-008, AC-008.1, DES-023, DEC-023
Produces: none
Consumes: Contract:AdminReviewRules.v1
Risk: low
Human gate: schema
Status: pending

#### Scope and constraints

การเปลี่ยนสถานะส่งผ่าน endpoint ของ BE-021 (state machine ทางเดียว) — หน้าจอไม่มีปุ่มถอยสถานะ

#### Retrieval hints

Hypothesis: หน้าจอชุดเดียวกับ FE-004 — ยืนยัน payload สถานะของ BE-021 ก่อนวาด
Query: ค้น quest bank payload ของ console ใน Target
Provenance: DES-023, DEC-023, Contract:AdminReviewRules.v1

#### Do not modify

endpoint ฝั่ง BE · attempt ของนักเรียน · หน้าจออื่น

#### Acceptance criteria

AC-008.1 (ฐานคลัง): จัดการ quest ผ่านหน้าจอได้จริงตาม state machine — quest ที่ยังไม่ approved แสดงสถานะรอตรวจชัดเจน

#### Required validation and expected evidence

ตรวจ AC-008.1 (ฐานคลัง) ด้วยการเดินสถานะผ่านหน้าจอจริงแล้วเทียบกับ endpoint — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้

## Phase 5: Module I-b — RIASEC Test & Quest, ฝั่งนักเรียน (REQ-007, REQ-008, REQ-012, REQ-017, REQ-018) 🔒 Security gate

### Task BE-027 — Read active RIASEC questions endpoint

Objective: endpoint อ่านคำถาม RIASEC active (`"IsActive"=true` เรียง `"DisplayOrder"`) ทั้งสองรูปแบบ (Likert + บล็อกเรียงลำดับ) จากตารางที่ Curriculum Service เขียน โดย ClassOnlineWeb อ่านตรงแบบ read-only ตามสัญญาความเป็นเจ้าของ — ไม่มี HTTP call ไปหา service
Why: เด็กต้องเห็นชุดคำถามชุดเดียวกับที่คลังกำหนด และการอ่านตรงตามสัญญาทำให้หน้าเด็กไม่พังเมื่อ service ล่ม
Owner: backend-engineer
Depends on: none
Traceability: REQ-012, AC-012.3, DES-025, DEC-025, DES-018, DEC-018
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: low
Human gate: design-ambiguity, schema, breaking-contract
Status: verified

#### Scope and constraints

อ่านอย่างเดียว — ห้ามเขียนตารางคลัง · ระบุคอลัมน์ที่ quote ไว้เสมอ ห้าม `SELECT *` · ใช้ `NpgsqlParameter` ตาม pattern เดิม

#### Retrieval hints

Hypothesis: ตารางคำถาม/บล็อกเรียงลำดับถูกสร้างโดย BE-003 ฝั่ง Curriculum Service — ยืนยันชื่อตาราง/คอลัมน์จาก `## Data Model` ก่อนเขียน query · กติกา "เอาเฉพาะ `IsActive` เรียงตาม `DisplayOrder` ทั้งสองรูปแบบ" อยู่ที่ `## DES-025 — RIASEC Fit Rules` §1
Query: ค้น `TCompassRiasecQuestion`, `TCompassRiasecRankBlock`, `TCompassRiasecRankOption`, `IsActive` ใน design.md/Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1, DES-018, DEC-018

#### Do not modify

ตารางคลังทุกตาราง (อ่านอย่างเดียวตามสัญญา) · โครงตาราง/สคีมา · ลำดับขั้นการเรียง

#### Acceptance criteria

AC-012.3 (ฐานอ่านคำถาม): endpoint คืนคำถาม active ครบทั้งสองรูปแบบเรียงตาม display order — เป็นฐานให้แบบทดสอบแบบผสมแสดงได้จริง

#### Required validation and expected evidence

ตรวจ AC-012.3 (ฐานอ่านคำถาม) ด้วยการเรียก endpoint เทียบกับแถว active ในตารางจริง (ครบ/เรียงถูก/ไม่หลุดรูปแบบใด) — เก็บผลเรียกเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint อ่านใหม่ additive — revert ได้ปลอดภัย

### Task BE-028 — Submit answers endpoint (100% complete)

Objective: endpoint ส่งคำตอบ — บังคับตอบครบทุกข้อ active ห้ามส่งไม่ครบเด็ดขาด (กติกา "ต้องตอบครบ 100% จึงส่งได้" ยืนยันซ้ำ — OQ-F11 ข้อ (ง) ถูกปฏิเสธ), ห้ามเติมค่ากลาง, `INSERT` แถวใหม่เสมอ (ไม่ `UPDATE`), เก็บ `answers` เป็น `"<question_id>:<1-5>"` คั่นด้วย comma และ `rankAnswers` ตามรูปแบบ option ต่อ block — ⚠️ scope correction (2026-09-02): ถ้า draft ใดของงานนี้เคยเขียนว่าอนุญาตส่งไม่ครบ ข้อนั้นผิดและต้องแก้ก่อน implement — ต้องบังคับจำนวนข้อตอบเท่าจำนวนข้อ active เสมอก่อนรับการส่ง
Why: คำตอบเป็นข้อมูลเชิงจิตวิทยาของผู้เยาว์ที่เก็บเป็นบันทึกของวันนั้น — การรับส่งไม่ครบหรือแก้แถวเก่าทำให้ผลที่คำนวณจากมันตีความผิดทั้งชุดและแก้ย้อนไม่ได้
Owner: backend-engineer
Depends on: BE-027
Traceability: REQ-012, AC-012.5, DES-025, DEC-025, DES-018, DEC-018
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: high
Human gate: design-ambiguity, schema, breaking-contract
Status: verified

#### Scope and constraints

ตรวจความครบฝั่งเซิร์ฟเวอร์ทุกคำขอ (ไม่เชื่อการตรวจของหน้าจอ) · บล็อกเรียงลำดับต้องเป็น permutation ครบของ block หรือไม่ตอบเลย — ไม่ครบปฏิเสธทั้งคำขอ · เก็บ `"AnsweredCount"`/`"ActiveItemCount"` ตามนิยามเดิมเพื่อการวินิจฉัย

#### Retrieval hints

Hypothesis: เขียนลง `public."TCompassRiasecResult"` และรูปแบบ answers/rank answers อยู่ที่ `## DES-025 — RIASEC Fit Rules` §2 ของ design.md (กติกาความครบ §1 · INSERT แถวใหม่เสมอ §7) — ยืนยันชื่อคอลัมน์จาก DDL จริง
Query: ค้น `TCompassRiasecResult`, `Answers`, `RankAnswers`, `AnsweredCount` ใน design.md/Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1, DES-018, DEC-018

#### Do not modify

แถวผลเก่าทุกแถว (INSERT เสมอ) · ตารางคลังคำถาม (อ่านอย่างเดียว) · สคีมา

#### Acceptance criteria

AC-012.5: ต้องตอบครบ 100% ของแบบทดสอบ (ทั้ง Likert และบล็อกเรียงลำดับ) จึงจะส่งได้ — คำขอที่ส่งไม่ครบถูกปฏิเสธทั้งคำขอทุกครั้ง และการส่งสำเร็จเป็นการ INSERT แถวใหม่เสมอ

#### Required validation and expected evidence

ตรวจ AC-012.5 ด้วยการส่งจริง: ครบทุกข้อ (สำเร็จ/แถวใหม่), ขาดหนึ่งข้อ (ปฏิเสธทั้งคำขอ), block เรียงลำดับไม่ครบ permutation (ปฏิเสธ) — เก็บผลเรียกทุกกรณี + แถวที่เกิดเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint เขียนตารางของ ClassOnlineWeb เอง — revert ได้ · แถวที่ INSERT แล้วเป็นบันทึกของเด็ก ไม่ถูกถอดโดย revert โค้ด

### Task BE-029 — studentLevel mixed Likert+ranking formula

Objective: คำนวณ `studentLevel(dimension)` แบบผสม — ค่า Likert เฉลี่ยพร้อม reverse-scoring (6−answer) ข้อที่ reverse-scored, มิติที่ไม่มีคำตอบเลยตัดออก (ไม่ใช่ค่า 3), เก็บทศนิยมไม่ปัดก่อนคำนวณต่อ · รวมกับค่าจากบล็อกเรียงลำดับ (แปลงอันดับกลับเข้าสเกล 1-5 แบบเชิงเส้นระยะห่างเท่ากัน ต่อ block ที่ตอบครบ 5≤k≤7) ด้วยสูตรถ่วงน้ำหนักเท่ากัน `W_LIKERT = W_RANK = 1` (ยืนยันแล้ว 2026-09-02 OQ-F11) — ทุกมิติต้องมีคำถามครบทั้งสองรูปแบบเป็นเงื่อนไขฝั่งเนื้อหา ไม่ใช่ให้ engineer ชดเชยตอน runtime · ต้อง log มิติที่ได้ค่าจากรูปแบบเดียว
Why: ค่า studentLevel เป็น input ของทุกสูตรปลายน้ำ (%, จุดไม่เข้ากัน, InterestFit) — สูตรรวมที่เพี้ยนทำให้ทุกผลที่เด็กเห็นเพี้ยนพร้อมกันทั้งระบบ
Owner: backend-engineer
Depends on: BE-028
Traceability: REQ-012, AC-012.3, DES-025, DEC-025
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: high
Human gate: design-ambiguity
Status: blocked

#### Scope and constraints

ค่าคงที่ W_LIKERT/W_RANK เป็น named constant แก้ที่เดียว ไม่ hardcode · ไม่ปัดเป็นจำนวนเต็มก่อนเทียบ (ปัดเมื่อแสดงเท่านั้น) · block ที่มีตัวเลือก active นอกช่วง 5-7 ถือว่าคลังคำถามผิด — ตัด block นั้นออกและ log ห้ามคำนวณต่อด้วยสูตรปรับเอง

#### Retrieval hints

Hypothesis: คำนวณจากแถว `"TCompassRiasecResult"` ที่ BE-028 เขียน + คลังคำถามจาก BE-027 — ยืนยันรูปแบบเก็บ answers จาก `## DES-025 — RIASEC Fit Rules` §2-3 ของ design.md (สูตร §3.1/3.2/3.4 · ข้อห้าม reverse-scored ฝั่ง ranking §3.3)
Query: ค้น `studentLevel`, `RankLevel`, `LikertLevel`, `ReverseScored` ใน design.md/Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1

#### Do not modify

แถวผลที่เก็บแล้ว (คำนวณจากค่าที่เก็บ ไม่แก้ค่า) · คลังคำถาม · สูตรของขั้นถัดไป (คงสเกล 1-5 ตามสัญญา)

#### Acceptance criteria

AC-012.3: แบบทดสอบใช้แบบผสมจริง — studentLevel ของมิติหนึ่งถูกรวมจากทั้ง Likert (เฉลี่ย + reverse) และ ranking (แปลงเชิงเส้น) ด้วยน้ำหนักเท่ากัน และค่าที่ได้อยู่ในสเกล 1-5 เสมอโดยไม่กระทบสูตรปลายน้ำ

#### Required validation and expected evidence

ตรวจ AC-012.3 ด้วยชุดคำตอบทดสอบ: มี reverse-scored, มี ranking block ครบ/ไม่ครบ, มิติไม่มีคำตอบเลย — เทียบค่าที่คำนวณกับสูตรทีละขั้นด้วยมือ + ตรวจ log มิติที่มาจากรูปแบบเดียว — เก็บตารางเทียบเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นขั้นคำนวณ — revert ได้ · ผลเก่าที่เก็บไว้เป็นค่าของวันนั้น ห้ามคำนวณใหม่เมื่อคลังคำถามเปลี่ยน

### Task BE-029b — ConsistencyScore column + calculation

Objective: **ใหม่ทั้งหมดรอบนี้ (2026-09-02, Contract Version 8)**: เพิ่มคอลัมน์ `public."TCompassRiasecResult"."ConsistencyScore"` (numeric, nullable) และคำนวณ `ConsistencyScore = 1 − (Σ Disagreement(r) / (4 × R))` ต่อรอบทดสอบ โดยเทียบค่า Likert กับค่า ranking ที่คำนวณอยู่แล้วต่อมิติ (R ควรเท่ากับ 6 เพราะทุกมิติมีคำถามครบสองรูปแบบตาม BE-029) ตามสัญญา §7.2 — แทนที่กลไก Confidence/shrinkage ที่อิง "ตอบน้อยกว่า 50%": เกณฑ์นั้นไม่มีทาง trigger ได้จริงอีกต่อไปเพราะการส่งบังคับ 100% เสมอ (หลัง BE-028) — โครงสูตร shrinkage เดิมยังคงไว้ (`ConfidenceFactor`, `CONF_F_MIN=0.5`, `NEUTRAL_SCORE=50`, `CLARITY_F_MIN=0.5` — ปิดแล้วเป็น engineering default) แต่เปลี่ยนตัวแปรขับเคลื่อนเป็น `ConsistencyScore` เทียบ `CONSISTENCY_MIN` — ห้ามอ้าง `"AnsweredCount"`/`"ActiveItemCount"` เป็นตัวขับเคลื่อน Confidence อีกต่อไป (เก็บไว้เป็น diagnostic เท่านั้น) · คำนวณและบันทึกตอนส่งเท่านั้น ห้ามคำนวณย้อนหลัง
Why: เกณฑ์ความมั่นใจเดิมตายตัวตั้งแต่กติกา "ตอบครบ 100%" ถูกคงไว้ — ความสอดคล้องข้ามรูปแบบคำตอบเป็นสัญญาณที่มีอยู่จริงและวัดได้ทุกรอบ
Owner: backend-engineer
Depends on: BE-029
Traceability: REQ-012, AC-012.4, DES-022, DEC-022
Produces: none
Consumes: none
Risk: high
Human gate: design-ambiguity, schema
Status: verified

#### Scope and constraints

คอลัมน์ใหม่ additive — ไม่มีตารางใดถูกสร้างจริงจึงไม่มี migration/backfill · `R = 0` → ไม่มีค่า (NULL) + log เป็นปัญหาเนื้อหา ห้ามนับมิติขาดข้อมูลเป็น Disagreement = 0 · การเทียบกับ `CONSISTENCY_MIN` ที่ขั้นตัดสิน "ยังไม่มั่นใจ" ยังรอค่า (OQ-F16) — จนกว่าจะปิด ให้ implement การคำนวณ/บันทึกค่า และปล่อยขั้นตัดสินแสดงผลตาม fallback ของสัญญา

#### Retrieval hints

Hypothesis: สูตร/ค่าคงที่อยู่ที่หมวด Cluster Determination Rules §7 ของ design.md และจุดเขียนอยู่ใน flow ส่งคำตอบของ BE-028 — ยืนยัน DDL คอลัมน์ใหม่จาก `## Data Model`
Query: ค้น `ConsistencyScore`, `Disagreement`, `CONF_F_MIN`, `CONSISTENCY_MIN` ใน design.md/Target
Provenance: DES-022, DEC-022

#### Do not modify

โครงสูตร studentLevel ของ BE-029 (อ่านค่าที่คำนวณแล้ว) · ค่าคงที่ที่ปิดแล้ว · แถวผลเก่า (ห้ามคำนวณย้อนหลัง)

#### Acceptance criteria

AC-012.4 (ฐานสัญญาณ): ทุกรอบที่ส่งสำเร็จมี ConsistencyScore บันทึกไว้ตามสูตร (หรือ NULL เมื่อไม่มีมิติใดวัดครบสองรูปแบบ พร้อม log) — เป็นตัวแปรขับเคลื่อนความมั่นใจตัวใหม่ที่รองรับข้อกำหนด "คะแนนเท่ากันแต่ความชัดเจนต่างกันห้ามแสดงเหมือนกัน"

#### Required validation and expected evidence

ตรวจ AC-012.4 (ฐานสัญญาณ) ด้วยชุดคำตอบที่ Likert กับ ranking สอดคล้อง/ขัดแย้ง/ขาดมิติ — เทียบค่า ConsistencyScore ที่บันทึกกับสูตรทีละมิติ + ตรวจ NULL/log กรณี R=0 — เก็บตารางเทียบเป็นหลักฐาน

#### Rollback/compatibility notes

คอลัมน์ใหม่ additive บนตารางของตัวเอง — revert ได้โดยค่า NULL ไม่พังปลายทาง (ต้องตรวจว่า consumer อ่าน NULL ได้)

### Task BE-030 — RIASEC match percent formula

Objective: สูตร % ความเหมาะสมเชิง RIASEC — intersection ของมิติที่ทั้งสาขามี desired_level และเด็กมี studentLevel เท่านั้น, `n=0` → ไม่มี % (แสดงข้อความว่ายังประเมินด้านนี้ไม่ได้) ห้ามหารด้วยศูนย์ ห้าม error, ปัดเป็นจำนวนเต็มเมื่อแสดง, มิติที่มีอยู่ฝั่งเดียวตัดออกทั้งคู่
Why: % ที่ผิดเงียบ ๆ (เช่นคืน 0% เมื่อเทียบไม่ได้) อ่านเป็นคำตัดสินต่อเด็ก — สัญญาบังคับให้ "ไม่มี %" ต่างจาก "0%"
Owner: backend-engineer
Depends on: BE-029
Traceability: REQ-007, AC-007.1, DES-025, DEC-025, DES-018, DEC-018
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: medium
Human gate: design-ambiguity, schema, breaking-contract
Status: blocked

#### Scope and constraints

คำนวณสดจาก studentLevel + โปรไฟล์มิติของสาขาที่อนุมัติแล้ว · ห้ามคืน 0% แทนกรณีเทียบไม่ได้ · ทุกมิติน้ำหนักเท่ากันในขั้นนี้

#### Retrieval hints

Hypothesis: อ่านโปรไฟล์ desired_level ของสาขาจากตารางที่ Curriculum Service เขียน (read-only) — ยืนยันตาราง/คอลัมน์จาก `## Data Model` · สูตร % และกติกา `n = 0` อยู่ที่ `## DES-025 — RIASEC Fit Rules` §4
Query: ค้น `TCompassProgramRiasecProfile`, `desired_level`, `matchPercent` ใน design.md/Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1, DES-018, DEC-018

#### Do not modify

โปรไฟล์สาขา (อ่านอย่างเดียว) · สูตร studentLevel · สคีมา

#### Acceptance criteria

AC-007.1 (ฐานตัวเลข): ตัวเลข % ที่ได้คำนวณจากมิติที่เทียบกันได้จริงเท่านั้น และกรณีเทียบไม่ได้ต้องเป็น "ไม่มี %" ไม่ใช่ 0% — เป็นฐานให้การชี้จุดไม่เข้ากันของข้อ ถัดไปมีตัวเลขที่ถูกต้องใช้

#### Required validation and expected evidence

ตรวจ AC-007.1 (ฐานตัวเลข) ด้วยชุดทดสอบ: ทับกันบางมิติ/ไม่ทับเลย/เด็กไม่มีมิติใด — เทียบค่ากับสูตรทีละขั้น + ตรวจกรณี n=0 ไม่มี error — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นขั้นคำนวณ — revert ได้ ไม่เขียนข้อมูลถาวร

### Task BE-031 — Incompatibility points + alternatives

Objective: ตรวจจุดไม่เข้ากัน (`desiredLevel − studentLevel ≥ 2` เท่านั้น — ทิศตรงข้ามไม่ใช่จุดไม่เข้ากัน ห้ามเตือน) เรียงส่วนต่างมากไปน้อย เสมอกันเรียงตาม display order, เสนอสาขาทางเลือกใน cluster เดียวกันที่ desiredLevel ของมิตินั้นต่ำกว่า ไม่เกิน 3 รายการเรียงตาม % — การแนะนำต้องเอ่ยชื่อมิติที่ไม่เข้ากันอันดับ 1 ออกมาตรง ๆ
Why: ตัวอย่าง acceptance ของผู้ใช้ (อยากเป็น SA แต่ไม่ชอบงานเอกสาร) ผ่านได้ด้วยการเอ่ยชื่อมิติตรง ๆ — ตัวเลข % อย่างเดียวไม่ผ่านสิ่งที่ผู้ใช้ต้องการ
Owner: backend-engineer
Depends on: BE-030
Traceability: REQ-007, AC-007.1, DES-025, DEC-025, DES-018, DEC-018
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: medium
Human gate: design-ambiguity, schema, breaking-contract
Status: blocked

#### Scope and constraints

เกณฑ์ ≥ 2 คงตามสัญญา · ทิศตรงข้ามห้ามแจ้งเตือนเด็ดขาด · ทางเลือกจำกัด 3 รายการจาก cluster เดียวกัน

#### Retrieval hints

Hypothesis: อ่านโปรไฟล์สาขาอื่นใน cluster เดียวกันจากคลัง (read-only) — ยืนยันการผูกสาขา↔cluster จาก `## Data Model` · นิยาม "จุดไม่เข้ากัน" และกติกาทางเลือก ≤3 อยู่ที่ `## DES-025 — RIASEC Fit Rules` §5
Query: ค้น `TCompassProgramCluster`, `desired_level`, `display_order` ใน design.md/Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1, DES-018, DEC-018

#### Do not modify

โปรไฟล์สาขา (อ่านอย่างเดียว) · สูตร % ของ BE-030 · สคีมา

#### Acceptance criteria

AC-007.1: ผลแสดงจุดไม่เข้ากันพร้อมเอ่ยชื่อมิติที่ไม่เข้ากันอันดับ 1 ตรง ๆ และแนะนำทางเลือกอื่นภายใน cluster เดียวกัน — ไม่ตัดสินว่าเด็กทำไม่ได้

#### Required validation and expected evidence

ตรวจ AC-007.1 ด้วยชุดทดสอบเลียนแบบตัวอย่างของผู้ใช้: มีมิติต่าง ≥2 / ต่าง <2 / ทิศตรงข้าม — ตรวจรายการที่ชี้ เรียง และทางเลือก ≤3 — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นขั้นคำนวณ — revert ได้ ไม่เขียนข้อมูลถาวร

### Task BE-032 — Guided wording enforcement

Objective: บังคับถ้อยคำแบบไกด์นำทาง — กรอง/ห้ามคำว่า "ไม่เหมาะ"/"ไม่ผ่าน"/"ทำไม่ได้"/"ไม่ควรเรียน"/"คุณสมบัติไม่ถึง" และข้อความใดที่สื่อว่าเด็กถูกตัดสิทธิ์ ทุกจุดที่ส่งข้อความออก ต้องเสนอทางเลือกเสมอ (`## DES-025 — RIASEC Fit Rules` §6)
Why: ถ้อยคำที่ตัดสินเด็กเป็นความเสียหายเชิงจิตวิทยาที่ระบบไม่ควรสร้าง — ผู้ใช้ห้ามไว้ชัดเจน และแก้ความเสียหายหลังเด็กเห็นไปแล้วไม่ได้
Owner: backend-engineer
Depends on: BE-031
Traceability: REQ-007, AC-007.1, DES-025, DEC-025
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: low
Human gate: design-ambiguity
Status: verified

#### Scope and constraints

ใช้กับทุกข้อความที่ระบบสร้างใน flow ผล RIASEC (ผล %, จุดไม่เข้ากัน, คำแนะนำ) · ถ้อยคำแนะนำแบบ "อาจต้องเตรียมตัวเพิ่ม" + เสนอทางเลือกเสมอ

#### Retrieval hints

Hypothesis: จุดสร้างข้อความอยู่ในผลลัพธ์ของ BE-030/BE-031 — ทำเป็น filter/กติกา wording กลางจุดเดียวเพื่อคุมทุกจุดส่งออก
Query: ค้นรายการถ้อยคำต้องห้ามใน `## DES-025 — RIASEC Fit Rules` §6 ของ design.md
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1

#### Do not modify

ตัวเลข/โครงสร้าง payload (คุมเฉพาะถ้อยคำ) · หน้าจอ · สคีมา

#### Acceptance criteria

AC-007.1 (ฐานถ้อยคำ): ข้อความทุกจุดที่เด็กเห็นไม่มีถ้อยคำตัดสินตามรายการห้าม และมีทางเลือกเสนอเสมอเมื่อชี้จุดไม่เข้ากัน

#### Required validation and expected evidence

ตรวจ AC-007.1 (ฐานถ้อยคำ) ด้วยการรวบรวมข้อความทั้งหมดที่ flow สร้างในสถานการณ์จริงแล้วเทียบรายการห้ามทีละคำ — เก็บชุดข้อความ/ผลเทียบเป็นหลักฐาน

#### Rollback/compatibility notes

filter ข้อความ — revert ได้ · ไม่แตะข้อมูลที่เก็บ

### Task BE-033 — Quest suggestion endpoint

Objective: endpoint เสนอ quest — เฉพาะเมื่อมีจุดไม่เข้ากันอย่างน้อย 1 มิติ, เลือกจาก `public."TCompassQuest"` ที่ `"Status"='approved'` + `"ProgramID" IS NULL` + **`"DimensionID"` ตรงมิติที่ไม่เข้ากัน (v9 — เดิมเขียนว่า `dimension_code`; การจับคู่/แสดงผลต่อคนยังใช้ `"DimensionCode"`)**, ไม่เกิน 2 ชิ้นเรียงตามมิติที่ห่างมากที่สุดก่อน, มิติที่ไม่มี quest ในคลัง → ไม่เสนอ ห้าม error ห้ามแสดงช่องว่าง ห้ามเสนอ quest ของมิติอื่นมาแทน (`## DES-025 — RIASEC Fit Rules` §9)
Why: quest ที่ไม่ตรงมิติหรือมาจาก quest ที่ยังไม่อนุมัติทำให้เด็กฝึกสิ่งที่ไม่ตรงปัญหา — คุณภาพของการเสนอคือคุณค่าของฟีเจอร์นี้ทั้งหมด
Owner: backend-engineer
Depends on: BE-031
Traceability: REQ-008, AC-008.1, DES-025, DEC-025, DES-018, DEC-018
Produces: none
Consumes: Contract:RiasecFitRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: medium
Human gate: design-ambiguity, schema, breaking-contract
Status: verified

#### Scope and constraints

อ่านคลัง quest (read-only) · เสนอเมื่อมีจุดไม่เข้ากันเท่านั้น · ตรวจ `"Status"='approved'` ที่เซิร์ฟเวอร์ทุกครั้ง · **การจับคู่มิติทำด้วย `"DimensionID"` ภายใน · ข้อความ/payload ที่ออกไปหาเด็กยังอ้างมิติด้วย code/ชื่อไทย ไม่ใช่เลข Id**

#### Retrieval hints

Hypothesis: ต่อจากผลจุดไม่เข้ากันของ BE-031 และอ่านคลัง quest ที่ BE-021 ดูแล — ยืนยันคอลัมน์ `"DimensionID"`/`"Status"` จาก DDL (v9: quest เลือกด้วย `"DimensionID"` ตาม index `"IX_TCompassQuest_DimensionID_Status"`) · กติกาการเลือก/จำกัด 2 ชิ้นอยู่ที่ `## DES-025 — RIASEC Fit Rules` §9
Query: ค้น `TCompassQuest`, `suggested`, `DimensionID`, `DimensionCode` ใน design.md/Target
Provenance: DES-025, DEC-025, DES-018, DEC-018, Contract:RiasecFitRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

คลัง quest (อ่านอย่างเดียว) · ผล RIASEC · สคีมา

#### Acceptance criteria

AC-008.1: เมื่อมีจุดไม่เข้ากัน ระบบเสนอ quest ให้เด็กลองทำจริงผ่านกลไก quest ของโมดูลนี้ — เฉพาะ quest ที่ approved ตรงมิติ ไม่เกิน 2 ชิ้น และมิติที่ไม่มี quest ไม่ถูกแทนด้วย quest อื่น

#### Required validation and expected evidence

ตรวจ AC-008.1 ด้วยชุดทดสอบ: มี/ไม่มีจุดไม่เข้ากัน, คลังมี/ไม่มี quest ตรงมิติ, quest ยัง pending_review — เก็บผลเรียกทุกกรณีเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint อ่าน/เสนอ — revert ได้ ไม่เขียนข้อมูลถาวรในตัวเอง

### Task BE-034 — Quest attempt endpoint

Objective: endpoint `public."TCompassQuestAttempt"` — state machine `suggested`→`accepted`→`done` ทางเดียวห้ามถอยกลับ, ทำซ้ำสร้างแถวใหม่ได้, `reflection` ห้ามส่งออกนอกระบบและห้ามส่งให้ AI (REQ-010)
Why: reflection เป็นความคิดเห็นส่วนตัวของเด็กที่ให้มาโดยคาดหวังว่าไม่มีใครอื่นเห็น — ข้อมูลชิ้นนี้ห้ามออกนอกระบบเด็ดขาด
Owner: backend-engineer
Depends on: BE-033
Traceability: REQ-008, AC-008.1, REQ-010, AC-010.2, DES-025, DEC-025, DES-018, DEC-018
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: medium
Human gate: design-ambiguity, schema, breaking-contract
Status: verified

#### Scope and constraints

state machine บังคับที่เซิร์ฟเวอร์ · ทำซ้ำ = INSERT แถวใหม่ · reflection เก็บในตารางของโมดูลเท่านั้น — ไม่มีทางส่งออก (ไม่ log แบบเปิดเผย ไม่ส่งบริการภายนอก)

#### Retrieval hints

Hypothesis: ตาราง attempt เป็นของ ClassOnlineWeb ตามสัญญาความเป็นเจ้าของ — ยืนยัน DDL/ค่าสถานะจาก `## Data Model` · state machine ทางเดียวและข้อห้ามส่ง reflection ออกนอกระบบอยู่ที่ `## DES-025 — RIASEC Fit Rules` §9
Query: ค้น `TCompassQuestAttempt`, `suggested`, `reflection` ใน design.md/Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1, DES-018, DEC-018

#### Do not modify

คลัง quest (อ่านอย่างเดียว) · ผล RIASEC · สคีมา

#### Acceptance criteria

AC-008.1 (ฐาน attempt): เด็กยอมรับ/ทำ quest จบได้จริงตาม state machine ทางเดียว และทำซ้ำได้โดยไม่ทับประวัติเดิม
AC-010.2: reflection ไม่มีทางออกไปยัง AI ภายนอกหรือบริการภายนอกใด — สิ่งที่ออกจากระบบยังคงเป็นเอกสารหลักสูตรเท่านั้น

#### Required validation and expected evidence

ตรวจ AC-008.1 (ฐาน attempt) ด้วยการเดินสถานะจริง + พยายามถอยกลับ (ต้องถูกปฏิเสธ) + ทำซ้ำ (แถวใหม่) · ตรวจ AC-010.2 ด้วยการตรวจทุกเส้นทางออกของ reflection (log/ส่งต่อ) ว่าไม่มีจุดส่งออก — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint เขียนตารางของตัวเอง — revert ได้ · attempt ที่เกิดแล้วเป็นประวัติของเด็ก

### Task BE-035 — Profile-only mode (no program)

Objective: โหมด `program_id IS NULL` — แสดงเฉพาะระดับมิติ RIASEC ของตัวเอง (แถวเดิมเขียน 8 แกน — ปัจจุบันคือ 6 มิติ RIASEC) `match_percent` เป็น NULL ไม่มี quest ห้ามแสดง % หลอก ๆ (`## DES-025 — RIASEC Fit Rules` §8)
Why: เด็กที่อยากดูโปรไฟล์ตัวเองเฉย ๆ ต้องไม่ถูกป้อนตัวเลขที่ไม่มีความหมาย — ค่าว่างที่ตั้งใจต่างจากค่าศูนย์
Owner: backend-engineer
Depends on: BE-029
Traceability: REQ-012, AC-012.3, DES-025, DEC-025
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: low
Human gate: design-ambiguity
Status: verified

#### Scope and constraints

payload ของโหมดนี้ต้องชี้ชัดว่าเป็นการดูโปรไฟล์ ไม่ใช่ผลจับคู่ — match_percent ส่งเป็น NULL ไม่ใช่ 0

#### Retrieval hints

Hypothesis: ต่อจากการคำนวณ studentLevel ของ BE-029 ในกรณีไม่มีสาขา — ยืนยันรูปร่าง payload กับหน้าจอ FE-010 · กติกาโหมดนี้อยู่ที่ `## DES-025 — RIASEC Fit Rules` §8
Query: ค้น `match_percent`, `program_id` ใน design.md/Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1

#### Do not modify

สูตร studentLevel · ผลโหมดมีสาขา · สคีมา

#### Acceptance criteria

AC-012.3 (ฐานโหมด): โหมดดูโปรไฟล์คืนระดับทุกมิติที่มีค่าของเด็กโดยไม่มี % และไม่มีการเสนอ quest — ไม่มีทางได้ % ปลอมจากโหมดนี้

#### Required validation and expected evidence

ตรวจ AC-012.3 (ฐานโหมด) ด้วยการเรียก endpoint ในกรณีไม่ผูกสาขา แล้วตรวจ payload (มิติครบ, match_percent NULL, ไม่มี quest) — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

โหมดย่อยของ endpoint อ่าน — revert ได้ปลอดภัย

### Task BE-036 — Module I-b ownership/IDOR enforcement

Objective: บังคับความเป็นเจ้าของทุก endpoint ของ Module I-b — ผูก `school_id`/`s_id` จาก JWT เสมอ ตรวจความเป็นเจ้าของจริงทุกครั้งที่อ่าน/เขียน ไม่ใช่แค่ตรวจว่า id มีอยู่จริง (กัน IDOR ผ่าน `result_id`/`attempt_id`) — ห้ามรับตัวเลขนักเรียนจากฝั่งหน้าจอ
Why: คำตอบแบบทดสอบและ reflection เป็นข้อมูลเชิงจิตวิทยาของผู้เยาว์ — IDOR หนึ่งจุดคือการให้เด็กคนหนึ่งอ่านข้อมูลจิตวิทยาของเด็กอีกคน ซึ่งแก้ความเสียหายหลังเกิดไม่ได้
Owner: backend-engineer
Tier: T3
Depends on: BE-028, BE-034
Traceability: REQ-010, AC-010.1, DES-018, DEC-018
Produces: none
Consumes: Contract:DatabaseOwnershipBoundary.v1
Risk: security
Human gate: security, schema, breaking-contract
Status: blocked

#### Scope and constraints

ครอบทุก endpoint ของ Module I-b (อ่านคำถาม ส่งคำตอบ ผล จุดไม่เข้ากัน quest attempt) · ตรวจความเป็นเจ้าของใน query เดียวกับการอ่าน (filter ด้วย school_id/s_id เสมอ) · fail-closed เมื่อตรวจไม่ได้

#### Retrieval hints

Hypothesis: ทุก endpoint ของเฟสนี้ใช้ JWT กลางของ ClassOnlineWeb — ยืนยันวิธีอ่าน school_id/s_id จาก pattern เดิมของโมดูล (sb-compass) ที่คล้ายกัน
Query: ค้น `school_id`, `s_id`, JWT, `result_id` ใน Target/ClassOnlineWeb
Provenance: DES-018, DEC-018, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

กลไก JWT/ตัวตนของระบบเดิม · payload/สูตรของ task อื่น (ครอบเฉพาะการตรวจสิทธิ์) · สคีมา

#### Acceptance criteria

AC-010.1: ทุก endpoint ของ Module I-b ยึดตัวตนจาก session ที่ล็อกอินเท่านั้น — การอ้าง result_id/attempt_id ของคนอื่นต้องไม่มีทางได้ข้อมูลกลับมา ไม่ว่า id นั้นจะมีอยู่จริงหรือไม่

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วยการยิง endpoint ทุกตัวด้วย id ของเด็กอื่น (คนละ JWT) และ id ปลอม — ต้องได้ผลลบทุกกรณี + ยืนยันไม่มี endpoint ใดรับ s_id จาก body/header — เก็บผลทดสอบราย endpoint เป็นหลักฐาน

#### Rollback/compatibility notes

เป็นชั้นตรวจที่ครอบ endpoint ที่มีอยู่ — revert ได้ทางเทคนิคแต่ห้ามปล่อย endpoint เหล่านี้ใช้จริงโดยไม่มีชั้นนี้

### Task FE-007 — RIASEC test screen (round 2)

Objective: หน้าจอแบบทดสอบพฤติกรรมรอบ 2 (Likert 1-5 + บล็อกเรียงลำดับ) ทำซ้ำได้ — ต้องบังคับตอบครบทุกข้อก่อนกดส่งได้ในชั้น UI ด้วย (ไม่ใช่แค่ server-side ตาม BE-028 — กัน request ที่ตั้งใจส่งไม่ครบ ซึ่งยังโดนเซิร์ฟเวอร์ปฏิเสธเสมอ)
Why: ประสบการณ์ส่งแล้วโดนปฏิเสธทั้งคำขอเป็นประสบการณ์ที่แย่ต่อเด็ก — UI ต้องกันไว้ก่อน โดยเซิร์ฟเวอร์ยังเป็นแหล่งความจริงเดียว
Owner: frontend-engineer
Depends on: BE-028
Traceability: REQ-012, AC-012.5, DES-025, DEC-025
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: low
Human gate: design-ambiguity
Status: pending

#### Scope and constraints

ปุ่มส่งเปิดได้เมื่อตอบครบทุกข้อ active ทั้งสองรูปแบบ · ทำซ้ำได้ (เริ่มชุดใหม่เสมอ) · แสดงคำถามจาก payload ของ BE-027 เท่านั้น

#### Retrieval hints

Hypothesis: payload คำถามมาจาก BE-027 (Likert + บล็อกเรียงลำดับแยกกัน) — ยืนยันรูปร่าง payload ก่อนวาด · กติกา "ตอบครบ 100% จึงส่งได้" และ permutation ของ block อยู่ที่ `## DES-025 — RIASEC Fit Rules` §1
Query: ค้น question payload ของ BE-027 ใน Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1

#### Do not modify

endpoint ฝั่ง BE · กติกาความครบ (เซิร์ฟเวอร์เป็นผู้ตัดสิน) · หน้าจออื่น

#### Acceptance criteria

AC-012.5 (ฝั่ง UI): กดส่งไม่ได้จนตอบครบทุกข้อ — และการส่งที่สำเร็จเป็นรอบใหม่เสมอ (ทำซ้ำได้)

#### Required validation and expected evidence

ตรวจ AC-012.5 (ฝั่ง UI) ด้วยการทดสอบจริง: ตอบไม่ครบ (ปุ่มปิด), ตอบครบ (ส่งได้), ส่งไม่ครบด้วย request แกะเอง (เซิร์ฟเวอร์ปฏิเสธ) — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้

### Task FE-008 — RIASEC results screen

Objective: หน้าจอผลลัพธ์ — % ความเหมาะสม, จุดไม่เข้ากัน (เอ่ยชื่อมิติ), สาขาทางเลือก, ถ้อยคำแบบไกด์ — แสดงจาก payload ของ BE-030/BE-031/BE-032 เท่านั้น
Why: หน้าจอคือจุดที่เด็กอ่าน "ผล" — การเรียบเรียงที่เปลี่ยนความหมาย (เช่นแปลค่าว่างเป็น 0%) ทำลายกติกาถ้อยคำและค่า NULL ที่สัญญากำหนด
Owner: frontend-engineer
Depends on: BE-030, BE-031, BE-032
Traceability: REQ-007, AC-007.1, DES-025, DEC-025
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: low
Human gate: design-ambiguity
Status: pending

#### Scope and constraints

แสดงค่า NULL เป็นสถานะ "ยังประเมินด้านนี้ไม่ได้" ไม่ใช่ 0 · ไม่เพิ่มถ้อยคำตัดสินใน UI เอง · ทางเลือกแสดงไม่เกิน 3 ตาม payload

#### Retrieval hints

Hypothesis: payload ผลมาจาก endpoint เดียวกันกับที่ BE-030..032 ประกอบ — ยืนยันรูปร่าง payload (มี NULL ได้) ก่อนวาด · กติกา "ไม่มี % ต่างจาก 0%" §4 และข้อห้ามถ้อยคำ §6 อยู่ที่ `## DES-025 — RIASEC Fit Rules`
Query: ค้น result payload ของ Module I-b ใน Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1

#### Do not modify

payload/สูตรฝั่ง BE · ถ้อยคำที่เซิร์ฟเวอร์สร้าง (แสดงตาม) · หน้าจออื่น

#### Acceptance criteria

AC-007.1 (ฝั่งแสดงผล): เด็กเห็น % จุดไม่เข้ากันพร้อมชื่อมิติ ทางเลือก และถ้อยคำแบบไกด์ตรงตาม payload — ไม่มีการแปลค่าว่างเป็นตัวเลขหรือถ้อยคำตัดสินบนหน้าจอ

#### Required validation and expected evidence

ตรวจ AC-007.1 (ฝั่งแสดงผล) ด้วยการเปิดผลจริงทั้งกรณีมี/ไม่มีจุดไม่เข้ากัน มี/ไม่มี % (NULL) — เทียบกับ payload ทีละค่า — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้

### Task FE-009 — Quest screen

Objective: หน้าจอเสนอ quest + ปุ่ม accept/done + ช่องกรอก reflection ต่อกับ BE-033/BE-034
Why: quest ทำงานได้จริงต้องจบรอบได้บนหน้าจอ (เสนอ → รับ → ทำจบ + สะท้อนผล) — และช่อง reflection ต้องสื่อให้เด็กรู้ว่าข้อความส่วนตัว
Owner: frontend-engineer
Depends on: BE-033, BE-034
Traceability: REQ-008, AC-008.1, DES-025, DEC-025
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: low
Human gate: design-ambiguity
Status: pending

#### Scope and constraints

แสดงเฉพาะ quest ที่ payload เสนอ · ปุ่มตาม state machine ทางเดียว · reflection ส่งผ่าน endpoint เดียวของ BE-034

#### Retrieval hints

Hypothesis: payload quest มาจาก BE-033 และสถานะจาก BE-034 — ยืนยัน payload ก่อนวาด · state machine ทางเดียวและกติกา "มิติที่ไม่มี quest → ไม่แสดงช่องว่าง" อยู่ที่ `## DES-025 — RIASEC Fit Rules` §9
Query: ค้น quest suggestion/attempt payload ใน Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1

#### Do not modify

endpoint ฝั่ง BE · state machine · หน้าจออื่น

#### Acceptance criteria

AC-008.1 (ฝั่งแสดงผล): เด็กเห็น quest ที่ถูกเสนอ รับ/ทำจบ/กรอก reflection ได้จริงบนหน้าจอ — แสดงเฉพาะสิ่งที่เซิร์ฟเวอร์เสนอ

#### Required validation and expected evidence

ตรวจ AC-008.1 (ฝั่งแสดงผล) ด้วยการเดินรอบ quest จริงบนหน้าจอ (เสนอ→รับ→จบ) แล้วเทียบสถานะกับ endpoint — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้

### Task FE-010 — Profile-only screen

Objective: หน้าจอโหมดดูโปรไฟล์เฉย ๆ (ไม่มีสาขา) แสดงระดับมิติ RIASEC ของตัวเอง — ต่อกับ BE-035 (ไม่มี % ไม่มี quest)
Why: โหมดนี้คือทางเลือกให้เด็กดูตัวเองก่อนเลือกสาขา — หน้าจอต้องไม่ทำให้ดูเหมือนผลจับคู่ที่ว่างเปล่า
Owner: frontend-engineer
Depends on: BE-035
Traceability: REQ-012, AC-012.3, DES-025, DEC-025
Produces: none
Consumes: Contract:RiasecFitRules.v1
Risk: low
Human gate: design-ambiguity
Status: pending

#### Scope and constraints

แสดงจาก payload ของ BE-035 เท่านั้น · ไม่มีพื้นที่ % / quest บนหน้านี้

#### Retrieval hints

Hypothesis: payload โหมดโปรไฟล์มาจาก BE-035 — ยืนยันรูปร่าง payload ก่อนวาด · กติกา "ไม่มี % ไม่มี quest" อยู่ที่ `## DES-025 — RIASEC Fit Rules` §8
Query: ค้น profile-mode payload ของ Module I-b ใน Target
Provenance: DES-025, DEC-025, Contract:RiasecFitRules.v1

#### Do not modify

endpoint ฝั่ง BE · หน้าจอผลแบบมีสาขา · สคีมา

#### Acceptance criteria

AC-012.3 (ฝั่งแสดงผล): หน้าจอแสดงระดับมิติที่มีค่าครบ โดยไม่ปรากฏ % หรือ quest ใด ๆ

#### Required validation and expected evidence

ตรวจ AC-012.3 (ฝั่งแสดงผล) ด้วยการเปิดหน้าจอจริงเทียบ payload — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้

### Task BE-040 — TCompassTargetProgram migration

Objective: Migration `public."TCompassTargetProgram"` — append-only (เหมือน `TCompassRiasecResult`/`TCompassQuestAttempt`): `SchoolID`, `SID`, `ProgramID`, `RiasecResultID` (snapshot สำหรับ audit เท่านั้น ไม่ใช่ตัวตัดสิน gate), `Status` (`active`/`superseded`), `SupersededAt` พร้อม **Partial Unique Index `"UX_TCompassTargetProgram_Active_Student"` บน `("SchoolID", "SID") WHERE "Status" = 'active'`** ตามมติปิด OQ-F14 (จำกัด 1 active target ต่อคน, DES-021 §0-§1) เพื่อการันตีระดับฐานข้อมูล
Why: ปิด OQ-F14 แล้ว (ผู้ใช้ยืนยัน 2026-09-15): บังคับให้มี active target ได้เพียง 1 สาขาต่อคน — การันตีด้วย Partial Unique Index เพื่อป้องกัน race condition
Owner: backend-engineer
Depends on: none
Traceability: REQ-017, AC-017.1, DES-021, DEC-021
Produces: none
Consumes: Contract:TargetMajorRules.v1
Risk: medium
Human gate: schema
Status: verified

#### Scope and constraints

DDL ตาม `## Data Model`/DES-021 §1 เป๊ะ (รวม Partial Unique Index `"UX_TCompassTargetProgram_Active_Student"`) · append-only — ไม่มีเส้นทาง DELETE แถวสถานะ · quote identifier ครบตามกฎ

#### Retrieval hints

Hypothesis: DDL ของตารางใหม่อยู่ที่ `## Data Model` + DES-021 §1 — ยืนยันรายชื่อคอลัมน์/index จากเอกสารก่อนเขียน migration
Query: ค้น `TCompassTargetProgram`, `SupersededAt`, `UX_TCompassTargetProgram_Active_Student` ใน design.md/Target
Provenance: DES-021, DEC-021, Contract:TargetMajorRules.v1

#### Do not modify

ตารางอื่นทั้งหมด · ตาราง `public."TCompassRiasecResult"` (มีแล้ว — ไม่แตะ) · เงื่อนไข constraint ที่สัญญากำหนดโดยเจตนา

#### Acceptance criteria

AC-017.1 (ฐานสถานะ): ตารางเป้าหมายพร้อมใช้ด้วยโครง append-only ตามสัญญา — มี Partial Unique Index บังคับแถว active ได้ไม่เกิน 1 แถวต่อนักเรียน

#### Required validation and expected evidence

ตรวจ AC-017.1 (ฐานสถานะ) ด้วยการรัน migration แล้วเทียบโครงตาราง/index กับสัญญา + ทดสอบ INSERT สองแถว active พร้อมกันต้องถูกฐานข้อมูลปฏิเสธ (unique violation) — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

migration ใหม่บนตารางที่ยังไม่มีอยู่จริง — drop ตารางคืนสภาพได้ (ยังไม่มีข้อมูลจริง)

### Task BE-041 — CanSetAsTarget gate

Objective: `CanSetAsTarget(SchoolID, SID, ProgramID)` — เช็คด้วยการมีอยู่ของแถวใน `public."TCompassRiasecResult"` ที่ SchoolID/SID/ProgramID ตรงกันเป๊ะทั้งสามค่าเท่านั้น (ห้ามเช็ค `"MatchPercent"`/`"Advice"` เลยแม้แต่น้อย — ผลไม่เหมาะสมก็ตั้งเป้าหมายได้) — ต้องกรองด้วย `"ProgramID"` เสมอ ห้ามใช้นิยาม "ผลล่าสุด" (คีย์แค่ school_id/s_id) ของฝั่ง RIASEC มาแทน เพราะเป็นคำถามคนละแบบ (DES-021 §2, RISK-F20) — `"ProgramID" IS NULL` ไม่นับเป็นการทำ REQ-007 ของสาขานั้นไม่ว่ากรณีใด · gate เป็นเท็จ → คืน 409/400 พร้อมพาไปหน้า RIASEC ของสาขานั้น ห้ามคืน 200 แล้วให้หน้าจอ disable ปุ่มเอง · สาขาที่เคย superseded แล้วผูกกับหน้าต่างเวลาหลัง SupersededAt ตามสูตร §3
Why: จุดผิดง่ายที่สุดของ endpoint นี้คือลอกนิยาม "ผลล่าสุด" มาใช้ — เขียนผิดแล้วเด็กจะตั้งเป้าหมายสาขาที่ยังไม่เคยทำแบบทดสอบได้เลย โดยไม่มีอะไรฟ้อง (RISK-F20)
Owner: backend-engineer
Depends on: BE-040
Traceability: REQ-017, AC-017.1, AC-017.2, AC-017.3, DES-021, DEC-021
Produces: none
Consumes: Contract:TargetMajorRules.v1
Risk: high
Human gate: schema
Status: verified

#### Scope and constraints

query ของ gate เขียนเองตามสูตร §2/§3 — ห้ามเรียก/ลอก query "ผลล่าสุด" · ไม่มีเงื่อนไขคุณภาพผลเพิ่มโดยเด็ดขาด · fail-closed ที่เซิร์ฟเวอร์

#### Retrieval hints

Hypothesis: query อ่านสองตารางของ ClassOnlineWeb (`TCompassRiasecResult`, `TCompassTargetProgram`) — ยืนยันชื่อคอลัมน์ `"CreatedAt"`/`"SupersededAt"` จาก DDL จริง
Query: ค้น `CanSetAsTarget`, `SupersededAt`, `TCompassRiasecResult` ใน design.md/Target
Provenance: DES-021, DEC-021, Contract:TargetMajorRules.v1

#### Do not modify

แถว `public."TCompassRiasecResult"` ทุกแถว (อ่านอย่างเดียว) · นิยาม "ผลล่าสุด" ฝั่ง RIASEC (ไม่แตะไม่ลอก) · สคีมา

#### Acceptance criteria

AC-017.1: สาขาที่ยังไม่เคยทำแบบทดสอบรอบสองของสาขานั้น → gate เป็นเท็จ → endpoint คืน 409/400 พร้อมทางไปหน้า RIASEC ของสาขานั้น
AC-017.2: สาขาที่ทำแบบทดสอบจบแล้ว (มีแถวตรงเป๊ะ 3 ค่า) → gate ผ่าน ไม่ว่าผล % / คำแนะนำจะเป็นอย่างไร — ไม่มีเงื่อนไขคุณภาพผลเพิ่ม
AC-017.3: สาขาที่เคยถูก superseded → gate ผ่านได้เฉพาะแถว RIASEC ที่เกิดหลังหน้าต่าง SupersededAt ตามสูตร §3 (ต้องทำใหม่จริง)

#### Required validation and expected evidence

ตรวจ AC-017.1/AC-017.2/AC-017.3 ด้วยชุดสถานการณ์จริง: ไม่เคยทำ (เท็จ/409), เคยทำผลแย่ (ผ่าน), เคยทำสาขา A แล้วสลับไป B แล้วกลับมา A (ต้องทำใหม่จึงผ่าน), เคยทำแบบไม่ผูกสาขา (ProgramID NULL — ไม่ผ่าน) — เก็บผลทุกกรณีเป็นหลักฐาน

#### Rollback/compatibility notes

เป็น function gate แยก — revert ได้ · แถวที่เขียนผ่าน gate ที่ผิดพลาดยังตามสถานะ supersede ได้ภายหลัง

### Task BE-042 — Set-target endpoint

Objective: endpoint ตั้งเป้าหมาย — เรียก `CanSetAsTarget` (BE-041) ก่อนเขียนเสมอ, เมื่อผ่าน gate ให้ทำเครื่องหมายสาขาเดิมที่ active อยู่เป็น `Status='superseded'`, `SupersededAt=now()` ใน transaction เดียวกัน ก่อนเขียนแถวใหม่ `Status='active'` พร้อม `RiasecResultID` snapshot ที่ผ่าน gate (OQ-F14 ปิดแล้ว: 1 active target)
Why: การเขียนก่อนเรียก gate แม้ครั้งเดียวคือช่องทางให้เป้าหมายเกิดโดยไม่ผ่านกติกา — และการบังคับ 1 active target (OQ-F14) ต้อง supersede แถวเดิมก่อน insert ใหม่ เพื่อไม่ให้ชน partial unique index
Owner: backend-engineer
Depends on: BE-041
Traceability: REQ-017, AC-017.1, AC-017.2, DES-021, DEC-021
Produces: none
Consumes: Contract:TargetMajorRules.v1
Risk: medium
Human gate: schema
Status: verified

#### Scope and constraints

เรียก gate ก่อนเขียนทุกคำขอ (ลำดับในโค้ดเดียวกัน) · หากมีแถวเดิมที่ active อยู่ ต้อง supersede ก่อน insert แถว active ใหม่ใน transaction เดียวกันเสมอ · บังคับ 1 active target ต่อคน

#### Retrieval hints

Hypothesis: endpoint ต่อจาก gate ของ BE-041 ใน controller เดียวกัน — ยืนยัน flow จริงหลัง implement
Query: ค้น `TCompassTargetProgram`, `RiasecResultID`, `Status`, `SupersededAt` ใน design.md/Target
Provenance: DES-021, DEC-021, Contract:TargetMajorRules.v1

#### Do not modify

query ของ gate (BE-041) · ตาราง RIASEC result · สคีมา

#### Acceptance criteria

AC-017.1 (ฐาน endpoint): การตั้งเป้าหมายเกิดได้เฉพาะผ่าน gate เสมอ — ไม่มีเส้นทางเขียนแถว active ที่ข้าม gate
AC-017.2 (ฐาน endpoint): การตั้งที่ผ่าน gate ทำการ supersede แถวเดิม (ถ้ามี) และเขียนแถว active ใหม่สำเร็จพร้อม snapshot ของรอบที่ผ่าน gate — มีแถว active คงอยู่เพียง 1 รายการเสมอ

#### Required validation and expected evidence

ตรวจ AC-017.1/AC-017.2 (ฐาน endpoint) ด้วยการเรียกจริง: ผ่าน gate โดยไม่มีเป้าหมายเดิม (active แถวแรกเกิด), ผ่าน gate โดยมีเป้าหมายเดิม (แถวเดิมกลายเป็น superseded + แถวใหม่ active), ไม่ผ่าน gate (ไม่มีแถวเกิด + 409/400) — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert ได้ · แถวที่เขียนแล้วถูกจัดการด้วย supersede ไม่ใช่การลบ

### Task BE-043 — Supersede-target endpoint

Objective: endpoint สลับ/ยกเลิกเป้าหมาย — เมื่อสาขาที่เคย active ถูกแทนที่ ตั้ง `Status='superseded'`, `SupersededAt=now()` ที่แถวเดิม ห้ามลบ/แก้ไข `public."TCompassRiasecResult"` เลยแม้แต่แถวเดียว (DES-021 §3) — การ invalidate เกิดที่ชั้น gate เท่านั้น ผลเก่ายังใช้ดู/อ้างประวัติได้ตามปกติ เพียงแต่ใช้ผ่าน gate ซ้ำไม่ได้อีกหลังถูก supersede
Why: การตัดสินใจเปลี่ยนสาขาเป็นสัญญาณให้ทบทวนใหม่ — แต่การ invalidate ต้องไม่แตะบันทึกเดิมของเด็ก เพราะผลเก่าเป็นบันทึกของวันนั้นตาม append-only
Owner: backend-engineer
Depends on: BE-041
Traceability: REQ-017, AC-017.3, DES-021, DEC-021
Produces: none
Consumes: Contract:TargetMajorRules.v1
Risk: medium
Human gate: schema
Status: verified

#### Scope and constraints

แก้เฉพาะแถวของ `public."TCompassTargetProgram"` · `SupersededAt` ตั้งเมื่อ supersede เท่านั้น · ห้าม DELETE แถว

#### Retrieval hints

Hypothesis: endpoint อัปเดตสถานะแถวเดิมของ BE-042 — ยืนยันค่าสถานะ/คอลัมน์จากสัญญา §3
Query: ค้น `superseded`, `SupersededAt`, `TCompassTargetProgram` ใน design.md/Target
Provenance: DES-021, DEC-021, Contract:TargetMajorRules.v1

#### Do not modify

`public."TCompassRiasecResult"` (ห้ามลบ/แก้เด็ดขาด) · gate ของ BE-041 (แต่พฤติกรรมหลัง supersede ต้องตรงกัน) · สคีมา

#### Acceptance criteria

AC-017.3: การเปลี่ยนเป้าหมายจากสาขา A ไปสาขาอื่นทำให้แถว A เป็น superseded พร้อมเวลา และ gate ของ A ภายหลังผูกกับหน้าต่างหลัง SupersededAt — โดยแถว RIASEC เดิมไม่ถูกแตะทุกกรณี

#### Required validation and expected evidence

ตรวจ AC-017.3 ด้วยสถานการณ์จริง: ตั้ง A → สลับไป B → ตรวจแถว A (superseded + SupersededAt) + ตรวจแถว RIASEC ของ A ยังครบทุกแถว + gate ของ A หลังจากนั้นต้องการแถวใหม่ — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

set สถานะบนตารางของตัวเอง — revert ได้ · ประวัติ supersede คงอยู่เพื่อ audit

### Task BE-044 — Target Major Rules ownership enforcement

Objective: บังคับความเป็นเจ้าของ (`school_id`/`s_id` จาก JWT เท่านั้น ห้ามรับจาก client) บนทุก endpoint ใหม่ของหมวดนี้ (BE-041/042/043) — กติกาเดียวกับ BE-036 ที่ครอบ Module I-b อยู่แล้ว แต่ endpoint ตั้ง/สลับเป้าหมายเป็นจุดเขียนข้อมูลใหม่ที่ต้องมี ownership check ของตัวเองครบ กัน IDOR ผ่าน `program_id` ที่ส่งมาตั้งเป้าหมาย
Why: endpoint ตั้งเป้าหมายเป็นจุดเขียนใหม่ล้วน — ถ้ารับ SchoolID/SID จาก body เด็กแก้เลขแล้วตั้งเป้าหมายในบัญชีอื่นได้ทันที
Owner: backend-engineer
Depends on: BE-042, BE-043, BE-036
Traceability: REQ-010, AC-010.1, DES-018, DEC-018, DES-021, DEC-021
Produces: none
Consumes: Contract:TargetMajorRules.v1
Risk: security
Human gate: security, schema, breaking-contract
Status: blocked

#### Scope and constraints

ครอบ BE-041/042/043 ทุกตัว · gate query ต้องใช้ค่าจาก JWT เท่านั้น (BE-041 ต้องไม่รับ SchoolID/SID เป็นพารามิเตอร์จาก client) · fail-closed

#### Retrieval hints

Hypothesis: ใช้กลไก JWT เดียวกับ BE-036 — ยืนยันจุดอ่านตัวตนใน controller ชุดเป้าหมายจริงหลัง implement
Query: ค้น `SchoolID`, `SID`, JWT ใน Target/ClassOnlineWeb
Provenance: DES-018, DEC-018, DES-021, DEC-021, Contract:TargetMajorRules.v1

#### Do not modify

กลไก JWT ของระบบเดิม · query gate (แก้เฉพาะแหล่งค่าตัวตน) · สคีมา

#### Acceptance criteria

AC-010.1: endpoint ตั้ง/สลับ/ตรวจเป้าหมายทุกตัวยึดตัวตนจาก session เท่านั้น — การแนบ SchoolID/SID ของคนอื่นใน body/header ไม่มีผลกับการเขียน/อ่านทุกจุด

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วยการยิง BE-041/042/043 ด้วยตัวตนของเด็กอื่นแนบใน body (ต้องไม่มีผล) + ยืนยันการเขียนเกิดใต้ JWT จริงเสมอ — เก็บผลทดสอบราย endpoint เป็นหลักฐาน

#### Rollback/compatibility notes

ชั้นตรวจครอบ endpoint ใหม่ — revert ได้ทางเทคนิคแต่ห้ามปล่อย endpoint เป้าหมายใช้จริงโดยไม่มีชั้นนี้

### Task FE-011 — Set-as-target button

Objective: ปุ่ม "ตั้งเป็นเป้าหมาย" — เมื่อ gate เป็นเท็จ (409/400 จาก BE-041/042) ต้อง disable/แสดงสถานะปิดใช้งานพร้อมนำทางไปหน้า RIASEC ของสาขานั้น ไม่ใช่ปิดปุ่มด้วยเงื่อนไขที่หน้าจอคิดเอง (เซิร์ฟเวอร์เป็นแหล่งความจริงเดียว) — หน้าตา/ตำแหน่งปุ่มและข้อความตอนกดยังบล็อกโดย OQ-F15 (รอ `uxui-designer` ยืนยัน)
Why: เงื่อนไข gate คือกติกา REQ-017 ที่เซิร์ฟเวอร์เป็นผู้ตัดสิน — หน้าจอที่คิดเงื่อนไขเองจะทำให้เด็กเห็นสถานะที่ไม่ตรงกับความจริงของ gate
Owner: frontend-engineer
Depends on: BE-042
Traceability: REQ-017, AC-017.1, DES-021, DEC-021
Produces: none
Consumes: Contract:TargetMajorRules.v1
Risk: low
Human gate: schema
Status: pending

#### Scope and constraints

สถานะปุ่มมาจากผล endpoint จริง (409/400 → ปิดใช้งาน + นำทาง) · จนกว่า OQ-F15 จะปิด งานหน้าตา/ตำแหน่ง/ข้อความค้างอยู่ — logic ตอบสนอง gate ทำได้ก่อน

#### Retrieval hints

Hypothesis: ปุ่มอยู่บนหน้าสาขา/ผลจับคู่ที่ FE-006/FE-008 วาดไว้ — ยืนยัน response shape ของ BE-041/BE-042 ก่อนวาด
Query: ค้น target set endpoint response และหน้ารวมสาขา ใน Target
Provenance: DES-021, DEC-021, Contract:TargetMajorRules.v1

#### Do not modify

gate/endpoint ฝั่ง BE · เงื่อนไขที่หน้าจอคิดเอง (ห้ามมี) · หน้าจออื่น

#### Acceptance criteria

AC-017.1 (ฝั่งแสดงผล): เมื่อ gate เป็นเท็จ หน้าจอสะท้อนสถานะปิดใช้งานและพาไปหน้า RIASEC ของสาขานั้น — สถานะมาจากเซิร์ฟเวอร์ ไม่มีเงื่อนไขที่หน้าจอตัดสินเอง

#### Required validation and expected evidence

ตรวจ AC-017.1 (ฝั่งแสดงผล) ด้วยสถานการณ์จริง: gate เท็จ (ปุ่มปิด + นำทางถูกที่) และ gate จริง (ตั้งสำเร็จ) — เก็บผลเป็นหลักฐาน (รอ OQ-F15 สำหรับหน้าตาสุดท้าย)

#### Rollback/compatibility notes

หน้าจอ additive — revert ได้

### Task BE-054 — Development Plan calculation & recommendations

Objective: endpoint แผนพัฒนาตนเอง (Development Plan, REQ-018 / DES-026): ตรวจสอบ active target major ของนักเรียน (`public."TCompassTargetProgram"` มีแถว `Status = 'active'`) — หากไม่มี คืน `RequiresTargetMajor = true`; คำนวณ Gap Analysis รายกลุ่มสาระที่สาขากำหนดไว้ใน `public."TCompassProgramSubjectWeight"` ด้วยสูตร `Gap = max(0, TARGET_SCORE - StudentScore)` เทียบกับ `TARGET_SCORE = 75.0` (ดึงคะแนนกลุ่มสาระผ่าน `GetCanonicalSubjectAveragesAsync`); ดึงโจทย์แบบฝึกหัดทบทวน 4 ข้อเพื่อประเมินความพร้อม; แนะนำตัวช่วยติวเตอร์/คอร์สจาก Orbit Tutor สำหรับกลุ่มสาระที่มี Gap สูงสุด
Why: REQ-018 กำหนดให้มีแท็บแผนพัฒนาตนเองหลังเลือกเป้าหมายแล้ว เพื่อให้นักเรียนทราบจุดที่ต้องปรับปรุงก่อนสอบเข้ามหาวิทยาลัย (DES-026, DEC-027)
Owner: backend-engineer
Depends on: BE-042
Traceability: REQ-018, AC-018.1, AC-018.2, AC-018.3, DES-026, DEC-027
Produces: none
Consumes: Contract:DevelopmentPlan.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

ตรวจสอบเงื่อนไข active target ก่อนคำนวณเสมอ · คำนวณ Gap จากกลุ่มสาระของสาขาเป้าหมายเท่านั้น · กรณีไม่มีคะแนนในบางวิชาถือ `CurrentScore = 0` และ `Gap = TARGET_SCORE` พร้อมแฟล็ก `missing_score` · คืนโครงสร้าง ViewModels: `VMDevelopmentPlan`, `VMSubjectGapItem`, `VMReviewExerciseItem`, `VMSupportRecommendation` ตามสัญญา DES-026 · fail-closed หากเกิดข้อผิดพลาด

#### Retrieval hints

Hypothesis: endpoint อยู่ใน ClassOnlineWeb (เช่น `CompassApiController` หรือ `CompassDevelopmentPlanController`) และเรียก `CompassScoreService.GetCanonicalSubjectAveragesAsync` — ยืนยัน ViewModels และสัญญาใน DES-026
Query: ค้น `VMDevelopmentPlan`, `VMSubjectGapItem`, `GetCanonicalSubjectAveragesAsync`, `TARGET_SCORE` ใน design.md และ ClassOnlineWeb
Provenance: DES-026, DEC-027, Contract:DevelopmentPlan.v1

#### Do not modify

สูตร Gap Analysis (`max(0, TARGET_SCORE - score)`) · ค่าคงที่ `TARGET_SCORE = 75.0` · ตารางฐานข้อมูล (สัญญา Data/schema: unchanged) · กติกา fallback ของ DES-026

#### Acceptance criteria

AC-018.1: หากนักเรียนยังไม่มี active target major คืน `RequiresTargetMajor = true` และไม่คำนวณ Gap
AC-018.2: เมื่อมี active target major คำนวณ Gap Analysis ครบทุกกลุ่มสาระที่สาขากำหนด โดยวิชาที่มีคะแนน ≥ 75.0 มี `Gap = 0` และวิชาที่ต่ำกว่ามี Gap ตามส่วนต่าง
AC-018.3: คืนโจทย์ทบทวน 4 ข้อ และการ์ดแนะนำ Orbit Tutor สำหรับวิชาที่ Gap สูงสุดอย่างถูกต้อง

#### Required validation and expected evidence

ตรวจ AC-018.1, AC-018.2, AC-018.3 ด้วยชุดทดสอบ: ยังไม่มีเป้าหมาย, มีเป้าหมายแต่คะแนนผ่านหมด (Gap = 0), มีเป้าหมายและมี Gap หลายวิชา — ตรวจ ViewModels และ payload ที่ตอบกลับ บันทึกเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert ได้โดยไม่กระทบโมดูลหรือฟีเจอร์อื่น

### Task FE-013 — Development Plan screen (tab=gap in MyCompass)

Objective: หน้าจอแท็บแผนพัฒนาตนเอง (`tab=gap` ใน `MyCompass.cshtml` / `compass-design.js` lines 579-627): แสดงผล Gap Analysis รายกลุ่มสาระ (แถบความคืบหน้าเทียบคะแนนปัจจุบันกับคะแนนเป้าหมาย), แบบฝึกหัดทบทวน 4 ข้อ, และการ์ดแนะนำติวเตอร์/คอร์ส Orbit Tutor จาก payload `VMDevelopmentPlan` (DES-026); หากไม่มี active target major แสดงข้อความแนะนำให้เลือกเป้าหมายก่อน
Why: REQ-018 ฝั่งแสดงผล — เชื่อมโยง UI mockup เดิมใน `tplGap` เข้ากับ API แผนพัฒนาตนเองจริงตามสัญญา DES-026
Owner: frontend-engineer
Depends on: BE-054, FE-011
Traceability: REQ-018, AC-018.1, AC-018.2, AC-018.3, DES-026, DEC-027
Produces: none
Consumes: Contract:DevelopmentPlan.v1
Risk: low
Human gate: none
Status: pending

#### Scope and constraints

เรนเดอร์ข้อมูลจาก `VMDevelopmentPlan` เท่านั้น — ห้ามคำนวณ Gap เองที่หน้าจอ · หาก `RequiresTargetMajor = true` แสดง prompt แนะนำให้ไปเลือกสาขาเป้าหมายที่แท็บสาขาแนะนำ · หากทุกวิชา `Gap == 0` แสดงการ์ดยินดีและคำแนะนำการรักษามาตรฐานตาม fallback ของ DES-026

#### Retrieval hints

Hypothesis: โครงสร้าง HTML/JS มีอยู่แล้วใน `MyCompass.cshtml` และ `compass-design.js` ฟังก์ชัน `tplGap` (lines 579-627) — ต้องเชื่อมต่อข้อมูลสดแทนข้อมูล mockup
Query: ค้น `tplGap`, `gapRows`, `tab=gap` ใน Views/Compass/MyCompass.cshtml และ assets/js/compass-design.js
Provenance: DES-026, DEC-027, Contract:DevelopmentPlan.v1

#### Do not modify

สูตร Gap Analysis (ทำที่ backend เท่านั้น) · แท็บอื่นใน MyCompass · โค้ดของโมดูลอื่น

#### Acceptance criteria

AC-018.1: หน้าจอแสดงแถบ Gap Analysis รายวิชาถูกต้องตามข้อมูลที่ได้รับจาก backend
AC-018.2: แสดงแบบฝึกหัดทบทวน 4 ข้อ และการ์ดแนะนำ Orbit Tutor
AC-018.3: กรณีไม่มี active target major แสดงข้อความแนะนำให้เลือกเป้าหมายพร้อมปุ่มนำทางอย่างถูกต้อง

#### Required validation and expected evidence

ตรวจ AC-018.1, AC-018.2, AC-018.3 โดยเปิดหน้าจอจริงทั้งกรณีมีเป้าหมายและไม่มีเป้าหมาย บันทึกภาพหน้าจอและ DOM เป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอ additive — revert คืนสภาพ mockup เดิมได้

## Phase 6: Module K — Cluster Determination, T-Score + RIASEC (REQ-011, REQ-013) 🔒 Security gate

### Task BE-045 — Cluster run/score tables migration

Objective: migration: `public."TCompassStudentClusterRun"` (หัวรอบ: `RunID`, `SchoolID`, `SID`, `CreatedAt`, `"ClusterCount"`/`"MeanOwn"`/`"SdOwn"`/`"GapTop"`/`"ClarityIndex"`/`"ClarityBand"`) + `public."TCompassStudentClusterScore"` (ต่อ cluster: `RunID` FK, `SchoolID`, `SID`, **`"ClusterID" integer` FK ชี้ `public."TCompassInterestCluster"("ClusterID")` — v9: เดิมเป็น `"ClusterCode" text` FK**, `"AcademicFit"`, `"InterestFit"`, `"CombinedScore"`, `"DisplayScore"`) ตาม `## Data Model` DDL (สถานะ v9, 2026-09-15) — index `("SchoolID","SID","CreatedAt" DESC)` ทั้งสองตาราง + index `RunID` บนตารางลูก
Why: ผล cluster เป็นผลของ "รอบ" (run) ไม่ใช่ของคลัสเตอร์เดียว — โครงสองตารางนี้คือเงื่อนไขที่ทำให้ค่าสถิติรอบ (เช่น ClarityIndex) เก็บได้ถูกตารางและตามประวัติได้
Owner: backend-engineer
Depends on: BE-003
Traceability: REQ-011, AC-011.1, DES-022, DEC-022, DES-018, DEC-018
Produces: none
Consumes: Contract:ClusterDeterminationRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: medium
Human gate: design-ambiguity, schema, breaking-contract
Status: verified

#### Scope and constraints

DDL ตาม `## Data Model` เป๊ะ (รวมคอลัมน์ `"DisplayScore"` ที่ยังเขียน NULL จนกว่า OQ-F16 จะปิด) · quote identifier ครบ · ค่าสถิติระดับรอบเก็บที่ตารางหัวรอบเดียว ห้ามซ้ำ 11 แถว · **FK ของตารางลูกเป็น `"ClusterID" integer` — ห้ามเขียน text code ลงคอลัมน์นี้ ห้าม hardcode เลข Id ในโค้ด: resolve ผ่าน `"ClusterCode"` เสมอ (RISK-F21)**

#### Retrieval hints

Hypothesis: DDL สองตารางอยู่ที่ `## Data Model` (สถานะ v9, 2026-09-15) ของ design.md และถูกอ้างในหมวด `## DES-022 — Cluster Determination Rules` §1/§6 — `TCompassStudentClusterRun` ไม่ถูกแตะโดย v9 ส่วน `TCompassStudentClusterScore` เปลี่ยน FK เป็น `"ClusterID"` — ยืนยันชื่อ/ชนิดคอลัมน์ทั้งชุดก่อนเขียน migration
Query: ค้น `TCompassStudentClusterRun`, `TCompassStudentClusterScore`, `ClusterID`, `DisplayScore`, `ScoreBasis` ใน design.md/Target
Provenance: DES-022, DEC-022, DES-018, DEC-018, Contract:ClusterDeterminationRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

ตารางอื่น · ตาราง `public."TCompassLevelSubjectStat"` ของ sb-compass (read-only) · ตรรกะ constraint ที่เอกสารกำหนด

#### Acceptance criteria

AC-011.1 (ฐานสถานะ): ตารางรอบ/คะแนน cluster พร้อมใช้ตาม DDL ปัจจุบัน (สถานะ v9 ของ `## Data Model`) — คะแนนต่อ cluster ผูกด้วย `"ClusterID" integer` FK ที่ resolve ได้จริง — เก็บผลต่อรอบ/ต่อ cluster ได้จริง รวมค่า NULL ของ `"DisplayScore"` ที่ยังไม่เปิดใช้

#### Required validation and expected evidence

ตรวจ AC-011.1 (ฐานสถานะ) ด้วยการรัน migration แล้วเทียบโครง/ชนิดคอลัมน์ FK/index กับ `## Data Model` + ทดสอบ INSERT/SELECT พื้นฐาน (รวม NULL ได้ + INSERT ที่ใส่ text code ลง `"ClusterID"` ต้องถูกฐานปฏิเสธ) — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

migration ใหม่บนตารางที่ยังไม่เคยมี — drop คืนสภาพได้ (ยังไม่มีข้อมูลจริง)

### Task BE-046 — Cluster weight seeds

Objective: seed/ยืนยัน `public."TCompassClusterSubjectWeight"` (11×8) และ `public."TCompassClusterRiasecWeight"` (11×6) ตาม PRE-F07 (OQ-F07 sign-off ปิดแล้ว 2026-08-31) — **v9: ทั้งสองตารางผูกด้วย Id (`"ClusterID"`, `"DimensionID"` เป็น `integer` FK) ไม่ใช่ text code อีกต่อไป จึงต้อง seed ด้วย `INSERT ... SELECT ... JOIN` ที่แปลง `"ClusterCode"`/`"DimensionCode"` → Id ตอนรัน · ห้ามใส่เลข Id ลงในไฟล์ seed** — ยังมาร์กเป็นสมมติฐานไม่มีแหล่งอ้างอิงภายนอก (RISK-F15) ต่อไปแม้ sign-off ให้ใช้แล้ว — ไม่แตะ `public."TCompassInterestCluster"` เดิม (สร้าง/seed แล้วที่ Module F)
Why: ตารางน้ำหนักเป็นตัวกำหนดทิศทางการจัดอันดับทั้งระบบ — เก็บเป็นข้อมูลแก้ได้ (ไม่ hardcode) เพื่อให้แก้ทีหลังได้โดยไม่ redeploy และเพื่อให้สถานะสมมติฐานถูกเห็นตลอด
Owner: backend-engineer
Depends on: BE-045
Traceability: REQ-011, AC-011.1, DES-022, DEC-022, DES-018, DEC-018
Produces: none
Consumes: Contract:ClusterDeterminationRules.v1, Contract:DatabaseOwnershipBoundary.v1
Risk: medium
Human gate: design-ambiguity, schema, breaking-contract
Status: pending

#### Scope and constraints

seed ผ่าน migration เท่านั้น · ค่าตามชุดที่ OQ-F07 ปิดไว้ — ห้ามปรับค่าเอง · ตารางเก็บเป็นข้อมูล (ไม่ hardcode ในโค้ด) · **ไฟล์ seed เขียนด้วย code เสมอ แล้ว JOIN แปลงเป็น Id ตอนรัน (`JOIN public."TCompassInterestCluster" c ON c."ClusterCode" = v.cluster_code` และแบบเดียวกันกับมิติ) · code ที่ JOIN ไม่ติด = seed ต้องล้ม ห้ามข้ามแถวเงียบ ๆ และห้ามสร้างแถว master ใหม่**

#### Retrieval hints

Hypothesis: ชุดค่า seed อยู่ที่หมวด `## DES-022 — Cluster Determination Rules` §4 / ข้อมูลตั้งต้นของ `## Data Model` ซึ่งระบุกติกา seed แบบ code → Id ของ v9 ไว้ตรง ๆ — ยืนยันจำนวนแถว 11×8 และ 11×6 และชนิดคอลัมน์ FK จากเอกสาร
Query: ค้น `TCompassClusterSubjectWeight`, `TCompassClusterRiasecWeight`, `ClusterCode`, `DimensionCode`, `INSERT ... SELECT`, PRE-F07 ใน design.md/Target
Provenance: DES-022, DEC-022, DES-018, DEC-018, Contract:ClusterDeterminationRules.v1, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

`public."TCompassInterestCluster"` / `public."TCompassRiasecDimension"` (seed แล้วที่ Module F — อ่านเพื่อ JOIN เท่านั้น) · ค่าน้ำหนักที่ sign-off ไว้ (ห้ามแต่ง) · สคีมา

#### Acceptance criteria

AC-011.1 (ฐานน้ำหนัก): ตารางน้ำหนักทั้งสองมีครบ 11×8 และ 11×6 แถวตามชุดที่ปิดไว้ โดยทุกแถวผูกด้วย `"ClusterID"`/`"DimensionID"` ที่ resolve มาจาก code — พร้อมใช้โดยสูตรรวม cluster โดยไม่มีค่า hardcode (ทั้งน้ำหนักและเลข Id) ในโค้ด/ไฟล์ seed

#### Required validation and expected evidence

ตรวจ AC-011.1 (ฐานน้ำหนัก) ด้วยการนับแถว/เทียบค่ากับชุด seed ในเอกสารทีละกลุ่ม (join กลับเป็น code เพื่อเทียบ) + grep ไฟล์ seed ยืนยันว่าไม่มีเลข Id เขียนตรง ๆ + รัน seed ซ้ำบนฐานที่สร้างใหม่แล้วได้ mapping เดิมแม้เลข Id ต่างกัน — เก็บผล query เทียบ/ผล grep เป็นหลักฐาน

#### Rollback/compatibility notes

seed บนตารางของโมดูลเอง — แก้ค่าภายหลังได้ผ่าน migration/ข้อมูล โดยไม่แก้โค้ด

### Task BE-047 — T-Score per subject group

Objective: T-Score ต่อกลุ่มสาระ (สัญญา §1): `WeightedScore_s` จาก Module E (ค่าเดียว ไม่คำนวณใหม่) + `TotalCredit_s` + percentile เทียบฐานระดับชั้นเดียวกัน (`ScorePercentile_s`/`CreditPercentile_s`) → `Composite_s = 0.6×Score + 0.4×Credit` → `TScore_s = 50 + 10×(Composite_s − nationalMean)/nationalSD` — คำนวณครบ 8 กลุ่มสาระครั้งเดียวต่อคำขอ ใช้ซ้ำทุกจุดที่ต้องใช้ T-Score (ห้ามคำนวณแยกอีกชุด) — เขียนโค้ดได้แล้ว แต่รันจริงไม่ได้จนกว่า `sb-compass` DEP-F09 (คอลัมน์ `"StddevScore"`) จะเสร็จ — ห้ามผสาน T-Score เข้ากับ `TARGET_SCORE=75` ของหมวด Program Matching โดยเด็ดขาด เป็นคนละกลไกที่ผู้ใช้ยืนยันแยกกันแล้ว (สัญญา §5)
Why: ค่า T-Score ที่คำนวณสองชุดหรือผสมกับ TARGET_SCORE ทำให้อันดับ cluster เพี้ยนแบบเงียบ และละเมิดการยืนยันของผู้ใช้ที่แยกสองกลไกไว้ชัดเจน
Owner: backend-engineer
Tier: T4
Depends on: BE-001
Traceability: REQ-013, AC-013.1, AC-013.2, AC-013.3, DES-022, DEC-022
Produces: none
Consumes: Contract:ClusterDeterminationRules.v1
Risk: shared-contract
Human gate: design-ambiguity, schema
Status: blocked

#### Scope and constraints

อ่าน `public."TCompassLevelSubjectStat"` แบบ read-only (ของ sb-compass) · `TScore_s` คำนวณครั้งเดียวต่อคำขอแล้วใช้ซ้ำทั้ง 11 cluster · เกณฑ์ `MIN_N_FOR_STDDEV = 30` ทำให้บางกลุ่มได้ NULL — เดินตามกติกา fallback ของ BE-048 ไม่แทนค่าเดา

#### Retrieval hints

Hypothesis: อ่านค่าคะแนนจากเมธอดของ BE-001 และสถิติระดับประเทศจากตารางของ sb-compass — ยืนยันชื่อคอลัมน์ `"StddevScore"`/`"MeanScore"` กับ design ของ sb-compass ก่อนเขียน
Query: ค้น `TScore`, `Composite`, `TCompassLevelSubjectStat`, `StddevScore` ใน design.md/Target
Provenance: DES-022, DEC-022, Contract:ClusterDeterminationRules.v1

#### Do not modify

สูตรคะแนนของ Module E/`sb-compass` (อ่านอย่างเดียว) · `TARGET_SCORE` และกลไกจัดอันดับสาขา (แยกกันเสมอ) · ตารางของ sb-compass (ห้ามเขียน)

#### Acceptance criteria

AC-013.1: คะแนนที่นำไปแปลงเป็น T-Score มาจากค่าเดียวของ Module E (เมธอดเดียวกับ sb-compass) — ไม่คำนวณคะแนนดิบชุดที่สอง
AC-013.2: คะแนนของเด็กถูกแปลงเป็น T-Score เทียบฐานคะแนนระดับชั้นที่ระบบมีอยู่จริง (percentile → composite → standardize)
AC-013.3: สูตรเป็นสูตรเดียว 0.6×Score + 0.4×Credit ตามสัญญา — ไม่มีสูตรแยกสองชุดและไม่มีการผสมกับ TARGET_SCORE

#### Required validation and expected evidence

ตรวจ AC-013.1/AC-013.2/AC-013.3 ด้วยชุดค่าทดสอบ (คะแนน/หน่วยกิต/percentile จำลอง) เทียบผลทีละขั้นกับสูตร + ตรวจว่า T-Score ถูกคำนวณครั้งเดียวต่อคำขอ (จุดเรียกเดียว) — เก็บตารางเทียบเป็นหลักฐาน (รันต่อข้อมูลจริงเมื่อ DEP-F09 เสร็จ)

#### Rollback/compatibility notes

เป็นขั้นคำนวณใหม่ — revert ได้ · ไม่เขียนตารางของโมดูลอื่น จึงไม่มีผลข้ามระบบ

### Task BE-048 — StddevScore fallback rules

Objective: fallback เมื่อ `"StddevScore"` เป็น `NULL`/`0` (สัญญา §2 กติกา 5 ข้อ): ตัดกลุ่มสาระนั้นออกจากตัวตั้งและตัวหารของ `AcademicFit(c)` ทุก cluster (ห้ามแทนค่าเดา/coverage-penalty แบบ Program Matching) · ฐานต้องเหมือนกันทั้ง 11 cluster เสมอ (ห้ามบาง cluster คิดจาก 8 กลุ่ม บางอันคิดจาก 5) · ทุกกลุ่มถูกตัดหมด → `AcademicFit` NULL ทุก cluster → ใช้ `InterestFit` แทนชั่วคราว · ทั้งสองฝั่ง NULL → แสดง "ยังประเมินไม่ได้" ห้าม error/0%/อันดับปลอม · เก็บ `NULL` กับ `0` แยกกันไม่ยุบรวม (diagnostic)
Why: การตัดฐานไม่เท่ากันข้าม cluster ทำให้ CombinedScore เทียบข้ามกันไม่ได้และอันดับเพี้ยนแบบเงียบ — ฐานเดียวกันคือเงื่อนไขความถูกต้องของทั้งรอบ
Owner: backend-engineer
Depends on: BE-047
Traceability: REQ-013, AC-013.2, DES-022, DEC-022
Produces: none
Consumes: Contract:ClusterDeterminationRules.v1
Risk: shared-contract
Human gate: design-ambiguity, schema
Status: verified

#### Scope and constraints

กติกา 5 ข้อคงตามสัญญาเป๊ะ · การตัดเกิดพร้อมกันทุก cluster ในรอบเดียวกัน · ค่า NULL/0 ปฏิบัติเหมือนกันในการคำนวณแต่ต้องแยกได้ตอนอ่านจาก DB เพื่อ log วินิจฉัย

#### Retrieval hints

Hypothesis: ตรรกะตัดฐานอยู่ต่อจากการคำนวณ T-Score ของ BE-047 — ยืนยันกติกาทั้ง 5 ข้อกับหมวด Cluster Determination Rules §2 ก่อน implement
Query: ค้น `StddevScore`, `ExcludedSubjects`, `MIN_N_FOR_STDDEV` ใน design.md/Target
Provenance: DES-022, DEC-022, Contract:ClusterDeterminationRules.v1

#### Do not modify

สูตร T-Score (BE-047) · กติกา coverage-penalty ของ Program Matching (คนละเรื่องโดยเจตนา — ห้ามลอก) · ตาราง sb-compass

#### Acceptance criteria

AC-013.2 (ฐาน fallback): รอบที่ `"StddevScore"` ขาด/เป็น 0 ต้องยังให้ผลได้ถูกต้องตามกติกา — ฐานทั้ง 11 cluster เหมือนกันเสมอ และกรณีประเมินไม่ได้ต้องแสดงข้อความ ไม่ใช่ 0% หรืออันดับปลอม

#### Required validation and expected evidence

ตรวจ AC-013.2 (ฐาน fallback) ด้วยชุดทดสอบ: ปกติ / กลุ่มเดียว NULL / หลายกลุ่ม NULL / ถูกตัดหมด / ทั้งสองฝั่ง NULL — ตรวจฐานที่ใช้เหมือนกันทุก cluster + ผลแสดงที่ถูกต้อง — เก็บผลทุกกรณีเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นขั้นคำนวณ — revert ได้ · ค่า diagnostic ที่เก็บ (NULL แยก 0) ไม่ถูกลบโดย revert

### Task BE-049 — Cluster combined score formula

Objective: สูตรรวม cluster (สัญญา §3): `AcademicFit(c) = Σ(clusterSubjectWeight×TScore_s)/Σ(weight)` พร้อม clamp สเกล `min(100, max(0, 50+(TScore_s−50)×5))` · `InterestFit(c) = Σ(clusterRiasecWeight×riasecScore_r)/Σ(weight)` (riasecScore_r จาก studentLevel ของ BE-029 แปลงเป็น 0-100 ด้วย `(level−1)/4×100`) · `CombinedScore(c) = 0.5×AcademicFit + 0.5×InterestFit` (น้ำหนัก 50/50 ยืนยันแล้ว REQ-016) — แสดง top-3 พร้อม % เสมอ ไม่ใช่ผู้ชนะเดียว · นักเรียนยังไม่ทำ RIASEC → `InterestFit`/`CombinedScore` NULL ทั้งคู่ ใช้ `AcademicFit` แสดงแทนชั่วคราว
Why: สูตรนี้คือคำตอบของ OQ-F03 ที่ผู้ใช้ปิดแล้ว — การเปลี่ยนน้ำหนักหรือรูปแบบผลลัพธ์ (ผู้ชนะเดียว) คือการกลับคำตัดสินที่ปิดไปแล้ว
Owner: backend-engineer
Depends on: BE-048, BE-046, BE-029
Traceability: REQ-011, AC-011.1, REQ-016, AC-016.1, DES-022, DEC-022
Produces: none
Consumes: Contract:ClusterDeterminationRules.v1
Risk: high
Human gate: design-ambiguity, schema
Status: blocked

#### Scope and constraints

น้ำหนัก 50/50 คงตาม REQ-016 · เขียนผลลง `public."TCompassStudentClusterScore"` ต่อรอบ · ฐานการคำนวณเดียวกันทุก cluster (ผ่าน BE-048)

#### Retrieval hints

Hypothesis: สูตรทั้งชุดอยู่ที่หมวด Cluster Determination Rules §3 — ตรวจแหล่งน้ำหนักจากตารางของ BE-046 และ riasecScore จาก BE-029 ก่อน implement
Query: ค้น `AcademicFit`, `InterestFit`, `CombinedScore`, `TCompassStudentClusterScore` ใน design.md/Target
Provenance: DES-022, DEC-022, Contract:ClusterDeterminationRules.v1

#### Do not modify

สูตร T-Score/fallback (BE-047/BE-048) · studentLevel (BE-029 — อ่านค่า) · น้ำหนัก 50/50 (คงตาม REQ-016)

#### Acceptance criteria

AC-011.1: ผลรอบให้อันดับ 11 cluster จาก CombinedScore รวมสองฝั่งตามสูตร — แสดง top-3 พร้อม % เสมอ และกรณียังไม่ทำ RIASEC ต้องได้ผลฝั่ง Academic เท่านั้นโดยไม่ error
AC-016.1: น้ำหนัก Academic:Interest ใน CombinedScore คงที่ 50/50 — ไม่ปรับเป็นสัดส่วนอื่น

#### Required validation and expected evidence

ตรวจ AC-011.1/AC-016.1 ด้วยชุดค่าทดสอบ (TScore/น้ำหนัก/studentLevel จำลอง) เทียบทีละขั้นกับสูตร + กรณียังไม่ทำ RIASEC (NULL ครบ) + ตรวจผลที่เขียนลงตาราง — เก็บตารางเทียบเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นขั้นคำนวณ — revert ได้ · ผลที่เขียนแล้วเป็นบันทึกของรอบนั้น

### Task BE-050 — ClarityIndex/ClarityBand

Objective: `"ClarityIndex"`/`"ClarityBand"` (สัญญา §6, OQ-F12 ปิดแล้ว): `n = "ClusterCount"` = จำนวน cluster ที่มีคะแนนจริงตามฐาน (ห้ามนับ cluster ที่ฐานหายไปทั้งหมดเป็น 0) · `MeanOwn`/`SdOwn` (population หาร n)/`GapTop` จากค่าดิบ CombinedScore เสมอ (ห้ามใช้ค่าที่ปรับแล้ว) · `n<2` → GapTop NULL, `n=0` → ทั้งสาม NULL · `ClarityIndex = 100×min(1,(W_SD×min(1,SdOwn/SD_REF)+W_GAP×min(1,GapTop/GAP_REF))/(W_SD+W_GAP))` (`SD_REF=15`, `GAP_REF=10`, `W_SD=W_GAP=1` — engineering default ปิดแล้ว) · `n<3` → ClarityIndex/ClarityBand ทั้งคู่ NULL (ห้ามแสดง 'unclear'/0) · ClarityBand: `≥CLARITY_HIGH(70)`→'clear', `≥CLARITY_LOW(40)`→'moderate', อื่น→'unclear' (ตรวจ `0<LOW<HIGH<100` ตอน start ไม่ใช่ตอนคำนวณ) — เขียนลง `TCompassStudentClusterRun` — ไม่กระทบลำดับ top-3 (ใช้ CombinedScore ดิบเสมอ) ห้ามใช้ตัดคลัสเตอร์ออกจากผล
Why: ค่าความชัดเจนเป็นข้อมูลกำกับที่ต้องอธิบายได้ ไม่ใช่ตัวคูณเงียบ ๆ — ถ้ามันเปลี่ยนลำดับหรือถูกใช้ตัดผล ผู้ใช้จะเห็นคำตอบที่ไม่มีใครอธิบายที่มาได้
Owner: backend-engineer
Depends on: BE-049
Traceability: REQ-012, AC-012.4, DES-022, DEC-022
Produces: none
Consumes: Contract:ClusterDeterminationRules.v1
Risk: high
Human gate: design-ambiguity, schema
Status: verified

#### Scope and constraints

ค่าคงที่ 6 ตัวเป็น named constant แก้ที่เดียว (engineering default ที่บันทึกไว้เปิดเผย) · ตรวจเงื่อนไขค่าคงที่ตอน start · เขียนเฉพาะคอลัมน์ของตารางหัวรอบ

#### Retrieval hints

Hypothesis: สูตร/ค่าคงที่อยู่ที่หมวด Cluster Determination Rules §6 — ตรวจค่าที่ปิดไว้ (OQ-F12) ก่อน implement ทุกตัว
Query: ค้น `ClarityIndex`, `ClarityBand`, `SD_REF`, `CLARITY_HIGH` ใน design.md/Target
Provenance: DES-022, DEC-022, Contract:ClusterDeterminationRules.v1

#### Do not modify

ค่าดิบ CombinedScore ทั้งชุด · ลำดับ top-3 · สูตรของ §7 (คนละตัวคูณ)

#### Acceptance criteria

AC-012.4: รอบที่โปรไฟล์ชัดกับรอบที่แบนต้องไม่ถูกแสดงเหมือนกัน — ClarityIndex/Band บันทึกตามสูตร และกรณี n น้อย (ไม่มีความหมาย) ต้องเป็น NULL ไม่ใช่แถบ 'unclear' หรือ 0

#### Required validation and expected evidence

ตรวจ AC-012.4 ด้วยชุดผลทดสอบ: กระจายกว้าง/แบน/n=0/1/2/3 — เทียบค่าทุกขั้น (ClusterCount, MeanOwn, SdOwn, GapTop, ClarityIndex, Band) กับสูตร + ตรวจว่าลำดับ top-3 ไม่เปลี่ยน — เก็บตารางเทียบเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นขั้นคำนวณ + เขียนคอลัมน์ของตารางตัวเอง — revert ได้ · ค่าที่เขียนแล้วเป็นบันทึกของรอบ

### Task BE-051 — Confidence shrinkage + DisplayScore

Objective: Confidence/shrinkage + `"DisplayScore"` (สัญญา §7.4-7.6): อ่าน `"ConsistencyScore"` ที่ Phase 5 (BE-029b) เขียนไว้ที่ `public."TCompassRiasecResult"` → `ConfidenceFactor` (สูตร/ค่าคงที่ `CONF_F_MIN=0.5`/`NEUTRAL_SCORE=50`/`CLARITY_F_MIN=0.5` และ `CONSISTENCY_MIN=0.60` ปิดแล้วเป็น engineering default 2026-09-15) → ดึง CombinedScore เข้าหา NEUTRAL_SCORE ด้วยสองตัวคูณอิสระ (ClarityFactor × ConfidenceFactor คูณกัน ห้ามทำเป็นสองขั้นซ้อน) แล้วเขียน `"DisplayScore"` ที่ `TCompassStudentClusterScore` (ห้ามเขียนทับ `"CombinedScore"` ดิบ) — ปิด OQ-F16 แล้ว ปลดล็อกการคำนวณและบันทึก "DisplayScore" ครบวงจร
Why: ปิด OQ-F16 แล้ว (ผู้ใช้ยืนยัน engineering default `CONSISTENCY_MIN = 0.60` 2026-09-15): ปลดล็อกการคำนวณและบันทึก DisplayScore ในตารางผลคะแนนคลัสเตอร์
Owner: backend-engineer
Depends on: BE-050
Traceability: REQ-012, AC-012.4, DES-022, DEC-022
Produces: none
Consumes: Contract:ClusterDeterminationRules.v1
Risk: high
Human gate: schema
Status: blocked

#### Scope and constraints

สองตัวคูณเป็นตัวคูณอิสระบนค่าดิบตัวเดียวกัน (คุณสมบัติ: เท่ากันทุก cluster ในรอบเดียว → ลำดับ top-3 ไม่เปลี่ยน) · `"CombinedScore" IS NULL` → `"DisplayScore" IS NULL` · ใช้ `CONSISTENCY_MIN = 0.60` ตัดสินความมั่นใจ หาก ConsistencyScore < 0.60 คำนวณ ConfidenceFactor ตามสูตร shrinkage ดึงเข้าหา 50; หากไม่เข้า shrinkage และมั่นใจ ให้ใช้ค่า CombinedScore ตรงๆ หรือปรับตาม ClarityFactor

#### Retrieval hints

Hypothesis: สูตร §7.4-7.6 อยู่ที่หมวด Cluster Determination Rules และอ่าน ConsistencyScore จาก BE-029b — ใช้ค่าคงที่ CONSISTENCY_MIN = 0.60
Query: ค้น `ConfidenceFactor`, `DisplayScore`, `NEUTRAL_SCORE`, `CONSISTENCY_MIN` ใน design.md/Target
Provenance: DES-022, DEC-022, Contract:ClusterDeterminationRules.v1

#### Do not modify

ค่าดิบ `"CombinedScore"` (ห้ามเขียนทับ) · สูตร ClarityIndex (§6) · ค่าคงที่ `CONSISTENCY_MIN = 0.60` (ห้ามเปลี่ยนเอง)

#### Acceptance criteria

AC-012.4 (ฐานแสดงผล): ตัวเลขที่เด็กเห็นถูกปรับด้วยกลไกที่สัญญากำหนดเท่านั้น — คำนวณ `DisplayScore` สำเร็จตามเกณฑ์ `CONSISTENCY_MIN = 0.60` และบันทึกลงตาราง `TCompassStudentClusterScore`

#### Required validation and expected evidence

ตรวจ AC-012.4 (ฐานแสดงผล) ด้วยชุดทดสอบ: ConsistencyScore สูง (≥0.60), ต่ำ (<0.60), R=0, ไม่มีผล RIASEC — ตรวจ ConfidenceFactor/DisplayScore ที่ได้ + คุณสมบัติลำดับ top-3 ไม่เปลี่ยน — เก็บตารางเทียบเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นขั้นคำนวณ + คอลัมน์ DisplayScore ของตารางตัวเอง — revert ได้

### Task BE-052 — Read cluster results endpoint

Objective: endpoint อ่านผล cluster ของนักเรียน — top-3 พร้อม `CombinedScore`/`DisplayScore` (NULL ได้ตาม BE-051), `ClarityIndex`/`ClarityBand` พร้อม metadata อธิบายว่าปรับเพราะอะไร (ข้อ 6.6 บังคับ ห้ามซ่อน)
Why: ผลที่ถูกปรับโดยไม่มีคำอธิบายคือสิ่งที่รอบนี้ปฏิเสธไปแล้ว — endpoint ต้องส่งทั้งค่าและเหตุผลการปรับไปพร้อมกัน
Owner: backend-engineer
Depends on: BE-051
Traceability: REQ-011, AC-011.1, DES-022, DEC-022
Produces: none
Consumes: Contract:ClusterDeterminationRules.v1
Risk: medium
Human gate: design-ambiguity, schema
Status: blocked

#### Scope and constraints

อ่านจากตารางของโมดูลเอง (แถวล่าสุดของรอบ) · payload ต้องแนบ metadata อธิบายการปรับเมื่อมีการปรับ · NULL ส่งเป็น NULL ไม่ใช่ 0

#### Retrieval hints

Hypothesis: endpoint อ่าน `TCompassStudentClusterRun`/`Score` แถวล่าสุดของ (SchoolID, SID) — ยืนยันรูปร่าง payload กับ FE-012
Query: ค้น `TCompassStudentClusterScore`, `ClarityIndex`, `DisplayScore` ใน design.md/Target
Provenance: DES-022, DEC-022, Contract:ClusterDeterminationRules.v1

#### Do not modify

ตาราง/สูตรฝั่งคำนวณ (อ่านอย่างเดียว) · ลำดับ top-3 · สคีมา

#### Acceptance criteria

AC-011.1 (ฐานอ่านผล): endpoint คืน top-3 ของรอบล่าสุดพร้อมค่าดิบ/ค่าแสดง/ข้อมูลกำกับความชัดเจนครบตามที่คำนวณไว้ — ไม่มีการตีความใหม่ที่ endpoint

#### Required validation and expected evidence

ตรวจ AC-011.1 (ฐานอ่านผล) ด้วยการเรียก endpoint เทียบกับแถวที่ BE-049/BE-050/BE-051 เขียน (ค่า/NULL/metadata ตรงกัน) — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint อ่านใหม่ additive — revert ได้ปลอดภัย

### Task BE-053 — Module K ownership enforcement

Objective: บังคับความเป็นเจ้าของบนทุก endpoint ใหม่ของ Module K (BE-052 เป็นอย่างน้อย) — `SchoolID`/`SID` จาก JWT เท่านั้น กติกาเดียวกับ Module H (BE-026)/Module I-b (BE-036/BE-044) — เขียน `TCompassStudentClusterScore` คีย์ด้วย SchoolID/SID เดียวกับ Module H/I-b ตามสัญญา Database Ownership Boundary แม้ข้อมูลนำเข้า (สถิติรวมระดับชั้น) จะไม่ใช่ข้อมูลส่วนบุคคลก็ตาม
Why: ผล cluster เป็นข้อสรุปเรื่องอนาคตรายบุคคลของผู้เยาว์ — การอ่านข้ามบัญชีผ่าน IDOR เสี่ยงเท่ากับข้อมูลอื่นของโมดูล
Owner: backend-engineer
Depends on: BE-052
Traceability: REQ-010, AC-010.1, DES-018, DEC-018
Produces: none
Consumes: Contract:DatabaseOwnershipBoundary.v1
Risk: security
Human gate: security, schema, breaking-contract
Status: blocked

#### Scope and constraints

ครอบ endpoint อ่านผลของ Module K · ตรวจความเป็นเจ้าของใน query เดียวกับการอ่าน · fail-closed

#### Retrieval hints

Hypothesis: ใช้กลไก JWT เดียวกับ BE-026/BE-036 — ยืนยันจุดอ่านตัวตนใน endpoint ของ Module K จริงหลัง implement
Query: ค้น `SchoolID`, `SID`, JWT, `TCompassStudentClusterScore` ใน Target/ClassOnlineWeb
Provenance: DES-018, DEC-018, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

กลไก JWT ของระบบเดิม · ตารางสถิติของ sb-compass (read-only) · payload ของ BE-052

#### Acceptance criteria

AC-010.1: endpoint ผล cluster ยึดตัวตนจาก session เท่านั้น — การอ้าง run/score ของเด็กอื่นไม่มีทางได้ข้อมูลกลับมา

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วยการยิง endpoint ด้วย id ของเด็กอื่น/id ปลอม (ต้องได้ผลลบ) + ยืนยันการเขียนคีย์ SchoolID/SID จาก JWT — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

ชั้นตรวจครอบ endpoint — revert ได้ทางเทคนิคแต่ห้ามปล่อย endpoint ใช้จริงโดยไม่มีชั้นนี้

### Task FE-012 — Cluster results screen

Objective: หน้าจอผลลัพธ์ cluster — top-3 พร้อม %, `ClarityIndex`/`ClarityBand` พร้อมคำอธิบายกำกับเมื่อมีการปรับ (ถ้อยคำสุดท้ายเป็นของ `uxui-designer` ตามวินัย WORD-F01 — ห้ามถ้อยคำเชิงตัดสิน) · โหมดยังไม่ทำ RIASEC → แสดงเฉพาะ `AcademicFit` พร้อม CTA ชวนทำ RIASEC — ต่อกับ BE-052
Why: ค่าที่ถูกปรับต้องมาพร้อมคำอธิบายในหน้าจอเดียวกัน และถ้อยคำห้ามสื่อว่าเด็ก "ไม่ผ่าน" — หน้าจอคือจุดที่กติการะเบียบการสื่อสารถึงผู้ใช้จริง
Owner: frontend-engineer
Depends on: BE-052
Traceability: REQ-011, AC-011.1, DES-022, DEC-022, DES-018, DEC-018
Produces: none
Consumes: Contract:ClusterDeterminationRules.v1
Risk: low
Human gate: design-ambiguity, schema, breaking-contract
Status: pending

#### Scope and constraints

แสดงจาก payload ของ BE-052 เท่านั้น · ค่า NULL แสดงเป็นสถานะรอ/ยังไม่ประเมิน ไม่ใช่ 0 · โหมดยังไม่ทำ RIASEC แสดง AcademicFit + ชวนทำ RIASEC

#### Retrieval hints

Hypothesis: payload มีค่าดิบ/ค่าแสดง/metadata จาก BE-052 — ยืนยันรูปร่าง payload (NULL ได้ทุกช่องที่สัญญาให้) ก่อนวาด
Query: ค้น cluster results payload ของ BE-052 ใน Target
Provenance: DES-022, DEC-022, Contract:ClusterDeterminationRules.v1

#### Do not modify

payload/สูตรฝั่ง BE · ถ้อยคำตัดสิน (ห้ามเพิ่ม) · หน้าจออื่น

#### Acceptance criteria

AC-011.1 (ฝั่งแสดงผล): เด็กเห็น top-3 พร้อมค่าและคำอธิบายกำกับเมื่อมีการปรับ หรือผลฝั่ง Academic พร้อมชวนทำ RIASECในกรณียังไม่ทำ — ทั้งหมดตรงตาม payload

#### Required validation and expected evidence

ตรวจ AC-011.1 (ฝั่งแสดงผล) ด้วยการเปิดหน้าจอจริงทั้งกรณีมี RIASEC/ไม่มี, มี/ไม่มีการปรับ — เทียบกับ payload ทีละค่า — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้

## Phase 7: Module H — Program Matching & Top-10 (REQ-005, REQ-006, REQ-011) 🔒 Security gate

### Task BE-022 — First-filter endpoint (Module K results)

Objective: endpoint ตัวกรองชั้นแรก — แก้ไข (2026-09-02): อ่านผล cluster ที่ผ่านการจัดอันดับแล้วจาก Module K (BE-052) แล้วไล่เก็บสาขา approved ทีละ cluster ตาม Fit% (dedup ด้วย `program_id`) จนครบ 10 หรือหมด cluster ที่มีผล — แทนการเรียก `CompassPathCatalog.RankPaths(avg)` (กลไก 8-path เดิม) ตามหมวด Program Matching §2 · `CompassPathCatalog.RankPaths` เดิมไม่ถูกลบ (ยังใช้อยู่ที่อื่นหรือเป็น fallback ก่อน RIASEC เสร็จ) — ยืนยันขอบเขตที่แน่นอนกับ `system-analyst` ก่อน implement เพราะ design เขียนกฎ 8-path ไว้เป็น contract เดิมและไม่ได้พูดชัดว่าเลิกใช้ทั้งหมด
Why: Module H ต้องจัดอันดับบนผล cluster จริงของ Module K — ถ้ายังผูกกับกลไก 8-path เดิม ผลแรกของ flow ทั้งสายผิดตั้งแต่ขั้นตัวกรอง
Owner: backend-engineer
Tier: T4
Depends on: BE-001, BE-052
Traceability: REQ-005, AC-005.1, REQ-011, AC-011.1, DES-020, DEC-020
Produces: none
Consumes: Contract:ProgramMatchingRules.v1
Risk: high
Human gate: none
Status: pending

#### Scope and constraints

เรียงผู้สมัครตามลำดับ cluster จาก BE-052 — เป็นการ "จัดลำดับความสำคัญ" ไม่ใช่ตัดทิ้ง · นับเฉพาะสาขา status='approved' · นักเรียนยังไม่ทำ RIASEC → ใช้ academic_fit เป็นลำดับชั่วคราวพร้อมข้อความชวนทำ RIASEC ไม่ error ไม่บล็อก · สาขาผูกหลาย cluster นับครั้งเดียว

#### Retrieval hints

Hypothesis: endpoint อ่าน payload cluster ของ BE-052 และตารางคลัง approved — ยืนยันการผูกสาขา↔cluster และสถานะจาก `## Data Model` ก่อนเขียน
Query: ค้น `TCompassProgramCluster`, `TCompassProgram`, `status`, `combined_score` ใน design.md/Target
Provenance: DES-020, DEC-020, Contract:ProgramMatchingRules.v1

#### Do not modify

`CompassPathCatalog` เดิม (ไม่ลบ ไม่แก้ — ขอบเขตยังรอยืนยันจาก system-analyst) · payload ของ BE-052 (อ่าน) · สคีมา

#### Acceptance criteria

AC-005.1: การจับคู่กรองชั้นแรกด้วยผล 11 cluster ของ Module K ก่อน แล้วจึงจัดอันดับสาขาภายในกลุ่มนั้นจากคลัง — ไม่ใช้กลไก 8 สายเดิมเป็นตัวกรองชั้นแรก
AC-011.1: ตัวกรองชั้นแรกเป็น 11 กลุ่มความสนใจจริง — ลำดับผู้สมัครมาจากผล cluster ที่ Module K คำนวณ

#### Required validation and expected evidence

ตรวจ AC-005.1/AC-011.1 ด้วยชุดทดสอบ: ผล cluster จำลอง + คลังสาขา approved/pending_review/ผูกหลาย cluster — ตรวจลำดับผู้สมัคร การ dedup และการหยุดที่ 10/หมด cluster — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

endpoint ใหม่ additive — กลไกเดิมยังอยู่ครบ (ไม่ลบ) จึง revert ได้โดยไม่พังทางอื่น · รอการยืนยันขอบเขตกลไกเดิมก่อนปิดงาน

### Task BE-023 — Program match percent (TARGET_SCORE)

Objective: สูตร % ความเหมาะสมของสาขา — `TARGET_SCORE=75` เป็นค่าคงที่มีชื่อ, coverage-penalty ตามสัญญา (กลุ่มสาระที่เด็กไม่มีคะแนน: ตัวตั้งถือ 0 แต่น้ำหนักยังอยู่ในตัวหาร), ปัดเป็นจำนวนเต็ม, `min(1, score/75)` กันคะแนนเกินเป้าดันคะแนนรวมให้เฟ้อ (หมวด Program Matching §3)
Why: % คือตัวเลขที่เด็กเห็นเป็นอันดับแรก — สูตรและค่าคงที่ต้องมาจากสัญญาจุดเดียว ไม่กระจาย magic number ในโค้ด
Owner: backend-engineer
Depends on: BE-022
Traceability: REQ-006, AC-006.1, DES-020, DEC-020
Produces: none
Consumes: Contract:ProgramMatchingRules.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

`TARGET_SCORE = 75.0` เป็น named constant แก้ที่เดียว · ใช้คะแนนกลุ่มสาระจาก BE-001 (ค่าเดียว) · คำนวณสดทุก request ไม่เก็บผลจับคู่ลงฐานข้อมูล

#### Retrieval hints

Hypothesis: อ่านน้ำหนักสาขาจากตารางคลัง (read-only) — ยืนยันตารางน้ำหนัก/ชื่อคอลัมน์จาก `## Data Model` ก่อนเขียน
Query: ค้น `TCompassProgramSubjectWeight`, `TARGET_SCORE`, `matchPercent` ใน design.md/Target
Provenance: DES-020, DEC-020, Contract:ProgramMatchingRules.v1

#### Do not modify

ค่า TARGET_SCORE (เป็นสมมติฐานที่บันทึกไว้เปิดเผย — แก้ต้อง amend) · สูตร studentLevel/T-Score (คนละชั้น) · ตารางคลัง (อ่านอย่างเดียว)

#### Acceptance criteria

AC-006.1 (ฐานตัวเลข): % ของสาขาคำนวณจากสูตรสัญญาบนค่าคะแนนชุดเดียวกับ Module E — ตัวเลขนิ่งทุกครั้งที่เปิดและคำนวณสดจากข้อมูลจริง

#### Required validation and expected evidence

ตรวจ AC-006.1 (ฐานตัวเลข) ด้วยชุดค่าทดสอบ (มี/ไม่มีคะแนนบางกลุ่ม, เกินเป้า) เทียบทีละขั้นกับสูตร + ตรวจ named constant — เก็บตารางเทียบเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นขั้นคำนวณ — revert ได้ ไม่เขียนข้อมูลถาวร

### Task BE-024 — Module H edge cases

Objective: กรณีขอบทั้งหมดของ Module H — เด็กยังไม่มีคะแนนเลย → สถานะ "รอครูกรอกผลสอบ" ไม่ใช่รายการว่าง/error, คลัง approved ว่าง → ข้อความคลังยังไม่พร้อม, น้อยกว่า 10 → แสดงเท่าที่มีห้ามเติมของปลอม, สาขาไม่มีแถวน้ำหนัก → ตัดออกจากผู้สมัคร, % เสมอกัน → เรียง `program_name` ordinal ascending, สาขา pending_review/retired → ไม่โผล่เลย, สาขาผูกหลาย cluster → แสดงครั้งเดียว (หมวด Program Matching §4)
Why: ทุกกรณีนี้ requirement ไม่ได้ระบุเอง — เอกสารกำหนดไว้เพื่อกัน "หน้าว่าง/ตัวเลขปลอม/เรียงไม่นิ่ง" ซึ่งเป็นความล้มเหลวที่เด็กเห็นก่อนใคร
Owner: backend-engineer
Depends on: BE-023
Traceability: REQ-006, AC-006.2, AC-006.3, DES-020, DEC-020
Produces: none
Consumes: Contract:ProgramMatchingRules.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

พฤติกรรมทั้งเจ็ดกรณีคงตามสัญญาเป๊ะ · การเรียงต้องนิ่งทุกครั้งที่เปิด · สาขาที่ไม่ approved ไม่มีทางโผล่แม้แบบเทา

#### Retrieval hints

Hypothesis: ตรรกะขอบต่อจาก endpoint ของ BE-022/BE-023 ใน flow เดียว — ยืนยันรายการกรณีกับหมวด Program Matching §4 ก่อน implement
Query: ค้น `approved`, `ordinal`, `pending_review` ใน design.md/Target
Provenance: DES-020, DEC-020, Contract:ProgramMatchingRules.v1

#### Do not modify

สูตร % (BE-023) · ตารางคลัง (อ่านอย่างเดียว) · สคีมา

#### Acceptance criteria

AC-006.2: คลังที่ approved มีน้อยกว่า 10 สาขา แสดงเท่าที่มี — ห้าม error และห้ามเติมของปลอมทุกกรณี
AC-006.3: ถ้าเด็กยังไม่มีคะแนนในระบบเลย แสดงสถานะรอครูกรอกผลสอบ — ไม่แสดงหน้าว่างหรือ error

#### Required validation and expected evidence

ตรวจ AC-006.2/AC-006.3 ด้วยการจำลองทุกกรณีขอบ (คลังว่าง/น้อยกว่า 10/ไม่มีน้ำหนัก/เสมอกัน/ไม่มีคะแนน) แล้วเทียบพฤติกรรมกับสัญญา — เก็บผลทุกกรณีเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นตรรกะภายใน endpoint — revert ได้ · ไม่เขียนข้อมูลถาวร

### Task BE-025 — Per-program advice

Objective: คำแนะนำต่อสาขา — จุดแข็ง (กลุ่มสาระ weight สูงสุดในกลุ่มที่ score ≥ 90% ของเป้า), จุดต้องเร่ง (กลุ่มที่ (เป้า − score) × weight มากที่สุดในกลุ่มที่ score < เป้า), ยังไม่มีคะแนน (weight สูงสุดในกลุ่มที่เด็กไม่มีคะแนน) — เสมอกันเลือกตามลำดับตัวอักษรชื่อกลุ่มสาระ เพื่อให้ข้อความนิ่ง (หมวด Program Matching §5)
Why: คำแนะนำคือครึ่งหลังของ "10 อันดับ + % + คำแนะนำ" — ข้อความที่ไม่นิ่งทำให้เด็กเห็นคำแนะนำต่างกันทุกครั้งที่เปิดหน้าเดียวกัน
Owner: backend-engineer
Depends on: BE-023
Traceability: REQ-006, AC-006.1, DES-020, DEC-020
Produces: none
Consumes: Contract:ProgramMatchingRules.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

กติกาสามชนิดคงตามสัญญา · นิ่งเมื่อเสมอกัน (เรียงตามชื่อกลุ่มสาระ) · ใช้ค่าคะแนนชุดเดียวกับ %

#### Retrieval hints

Hypothesis: สร้างข้อความต่อจาก % ของ BE-023 ใน flow เดียว — ยืนยันกติกาสามชนิดกับหมวด Program Matching §5 ก่อน implement
Query: ค้น `BuildReason`, `TARGET_SCORE`, advice ใน design.md/Target
Provenance: DES-020, DEC-020, Contract:ProgramMatchingRules.v1

#### Do not modify

รูปแบบคำแนะนำเดิมของ 8 สายที่ใช้ต้นแบบ (เปลี่ยนแค่หน่วยเป็นสาขา) · สูตร % · สคีมา

#### Acceptance criteria

AC-006.1 (ฐานคำแนะนำ): สาขาแต่ละอันดับมีคำแนะนำตามกติกาสัญญา และข้อความนิ่งทุกครั้งที่เปิดซ้ำ (เสมอกันเรียงถูก)

#### Required validation and expected evidence

ตรวจ AC-006.1 (ฐานคำแนะนำ) ด้วยชุดค่าทดสอบ: จุดแข็ง/จุดเร่ง/ไม่มีคะแนน/เสมอกัน — เทียบข้อความที่สร้างกับกติกา + เปิดซ้ำตรวจความนิ่ง — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

เป็นขั้นสร้างข้อความ — revert ได้ ไม่เขียนข้อมูลถาวร

### Task BE-026 — Module H identity enforcement

Objective: บังคับตัวตนจาก `UserData.UserID`/`CompanyID` ทุก endpoint ของ Module H ห้ามรับ `SID` จากฝั่งหน้าจอ — ตรวจสิทธิ์ก่อนประกอบ response (ข้อมูลรั่วผ่าน payload ที่ประกอบก่อนตรวจสิทธิ์เป็น failure mode ที่ design เตือนไว้)
Why: ผลจับคู่เป็นข้อสรุปเรื่องอนาคตรายบุคคลของผู้เยาว์ — SID ที่รับจาก client ทำให้เด็กแก้เลขแล้วดูผลของคนอื่นได้ทันที (IDOR)
Owner: backend-engineer
Depends on: BE-022
Traceability: REQ-010, AC-010.1, DES-018, DEC-018
Produces: none
Consumes: Contract:DatabaseOwnershipBoundary.v1
Risk: security
Human gate: security, schema, breaking-contract
Status: pending

#### Scope and constraints

ครอบทุก endpoint ของ Module H · query ใช้ `NpgsqlParameter` เท่านั้น ห้ามต่อ string · fail-closed เมื่อตรวจตัวตนไม่ได้

#### Retrieval hints

Hypothesis: ใช้ pattern ตัวตนเดิมของ ClassOnlineWeb (`UserData`) — ยืนยันจุดอ่านตัวตน/จุดเรียกใน endpoint ชุดใหม่จริงหลัง implement
Query: ค้น `UserData`, `SID`, `CompanyID` ใน Target/ClassOnlineWeb
Provenance: DES-018, DEC-018, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

กลไกตัวตนเดิมของระบบ · payload/สูตรของ task อื่น · สคีมา

#### Acceptance criteria

AC-010.1: ทุก endpoint ของ Module H ยึดตัวตนจาก session เท่านั้น — SID ที่ส่งมาจากหน้าจอไม่มีผลกับข้อมูลที่คืน ทุกกรณี

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วยการยิง endpoint ด้วย SID ของเด็กอื่นแนบใน body/query (ต้องไม่มีผล — ข้อมูลมาจาก UserData เสมอ) + กรณีไม่มี session fail-closed — เก็บผลราย endpoint เป็นหลักฐาน

#### Rollback/compatibility notes

ชั้นตรวจครอบ endpoint — revert ได้ทางเทคนิคแต่ห้ามปล่อย endpoint ใช้จริงโดยไม่มีชั้นนี้

### Task FE-006 — Top-10 screen

Objective: หน้าจอ Top-10 สาขา พร้อม % และคำแนะนำ รูปแบบเดียวกับหน้าจอ 8 สายเดิม — ต่อกับ BE-024/BE-025
Why: รูปแบบเดิมที่ผู้ใช้คุ้นอยู่แล้วคือมาตรฐานการสื่อสารของสายงาน — เปลี่ยนแค่หน่วยจากสายเป็นสาขา ไม่ใช่ออกแบบรูปแบบใหม่เอง
Owner: frontend-engineer
Depends on: BE-024, BE-025
Traceability: REQ-006, AC-006.1, DES-020, DEC-020
Produces: none
Consumes: Contract:ProgramMatchingRules.v1
Risk: low
Human gate: none
Status: pending

#### Scope and constraints

แสดงจาก payload ของ BE-024/BE-025 เท่านั้น (รวมสถานะ "รอครูกรอกผลสอบ" และกรณีน้อยกว่า 10) · ไม่เติม/แต่งรายการเอง

#### Retrieval hints

Hypothesis: payload มาจาก endpoint ของ Module H (มีค่า NULL/สถานะพิเศษได้) — ยืนยันรูปร่าง payload ก่อนวาด
Query: ค้น top-10 endpoint payload ของ Module H ใน Target
Provenance: DES-020, DEC-020, Contract:ProgramMatchingRules.v1

#### Do not modify

endpoint ฝั่ง BE · หน้าจอ 8 สายเดิม (ใช้เป็นแบบ) · สคีมา

#### Acceptance criteria

AC-006.1 (ฝั่งแสดงผล): เด็กเห็นอันดับ 1-10 พร้อม % และคำแนะนำตรงตาม payload — รวมกรณีเท่าที่มี/รอคะแนน โดยไม่มีรายการปลอมปรากฏ

#### Required validation and expected evidence

ตรวจ AC-006.1 (ฝั่งแสดงผล) ด้วยการเปิดหน้าจอจริงทั้งกรณีครบ 10/น้อยกว่า 10/รอคะแนน — เทียบกับ payload ทีละค่า — เก็บผลเป็นหลักฐาน

#### Rollback/compatibility notes

หน้าจอใหม่ additive — revert ได้

## Phase 8: Module H + I-b — Entitlement Wiring & Ownership Audit (cross-module) 🔒 Security gate

### Task BE-037 — Premium entitlement wiring (Module H)

Objective: เชื่อม `CheckEntitlement` + `compass_premium` เข้าทุก endpoint ของ Module H — fail-closed (403) ห้าม fail-open ห้ามคืน payload แล้วให้หน้าจอซ่อน (กติกา Premium เดิมของ `sb-compass` `## Premium Entitlement Rules` — ใช้กติกาเดิมห้ามเขียนใหม่ สัญญาอยู่นอก design.md ของโมดูลนี้) — บล็อกที่ `sb-compass` OQ-15(a1)/(a2)
Why: โมดูลนี้เป็น Premium ทั้งหมด — การคืน payload แล้วให้หน้าจอซ่อนคือการให้ข้อมูลเด็กไหลออกถึงคนที่จ่ายไม่และไม่มีสิทธิ์
Owner: backend-engineer
Depends on: BE-022
Traceability: REQ-009, AC-009.1, AC-009.2, DES-018, DEC-018
Produces: none
Consumes: Contract:DatabaseOwnershipBoundary.v1
Risk: security
Human gate: security, schema, breaking-contract
Status: pending

#### Scope and constraints

ตรวจสิทธิ์ก่อนคืนข้อมูลทุก endpoint · ตัวกลไก entitlement เป็นของภายนอก — โมดูลเรียกตรวจและบังคับผลเท่านั้น · จนกว่า `sb-compass` OQ-15(a1)/(a2) จะปิด งานเขียนได้แต่เปิดใช้จริงไม่ได้

#### Retrieval hints

Hypothesis: กติกา/กลไก `CheckEntitlement` อยู่ฝั่ง `sb-compass` (design ของโมดูลนั้น) — อ่านจากต้นทางจริง ห้ามเขียนกติกาใหม่ที่นี่
Query: ค้น `CheckEntitlement`, `compass_premium`, `OQ-15` ใน sb-compass design/Target
Provenance: DES-018, DEC-018, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

กติกา entitlement ของ `sb-compass` (ใช้ตามเดิม) · endpoint ของ Module H อื่นที่ไม่ใช่การกั้น · สคีมา

#### Acceptance criteria

AC-009.1: ทุก endpoint ของ Module H ตรวจสิทธิ์ Premium ที่ฝั่งเซิร์ฟเวอร์ก่อนคืนข้อมูล
AC-009.2: ผู้ใช้ที่ไม่มีสิทธิ์ไม่ได้ข้อมูลกลับไปเลย (403 fail-closed) — ไม่ใช่คืนข้อมูลแล้วให้หน้าจอซ่อน

#### Required validation and expected evidence

ตรวจ AC-009.1/AC-009.2 ด้วยการยิงทุก endpoint ในสามสถานะ (มีสิทธิ์/ไม่มีสิทธิ์/ตรวจไม่ได้) — ไม่มีสิทธิ์/ตรวจไม่ได้ต้องไม่ได้ payload กลับ — เก็บผลราย endpoint เป็นหลักฐาน (เปิดใช้จริงหลัง OQ-15 ปิด)

#### Rollback/compatibility notes

ชั้นกั้นครอบ endpoint — revert ได้ทางเทคนิคแต่ห้ามเปิดโมดูลให้ใช้จริงโดยไม่มีชั้นนี้

### Task BE-038 — Premium entitlement wiring (Module I-b)

Objective: เชื่อม `CheckEntitlement` เข้าทุก endpoint ของ Module I-b เช่นเดียวกับ BE-037 (รวม endpoint ใหม่ของ Target Major Rules — BE-041/042/043) — fail-closed เดียวกัน — บล็อกที่ `sb-compass` OQ-15(a1)/(a2)
Why: endpoint ตั้ง/สลับเป้าหมายเป็นจุดเขียนข้อมูลใหม่ — ถ้าลืมกั้น คนที่ไม่มีสิทธิ์เขียนเป้าหมายเข้าบัญชีได้ ไม่ใช่แค่อ่าน
Owner: backend-engineer
Depends on: BE-027, BE-041
Traceability: REQ-009, AC-009.1, AC-009.2, DES-018, DEC-018
Produces: none
Consumes: Contract:DatabaseOwnershipBoundary.v1
Risk: security
Human gate: security, schema, breaking-contract
Status: pending

#### Scope and constraints

ครอบ endpoint อ่านคำถาม ส่งคำตอบ ผล quest และชุดเป้าหมายทั้งหมด · กติกา/กลไกเดียวกับ BE-037 (จุดเดียวกัน) · จนกว่า OQ-15 จะปิด เปิดใช้จริงไม่ได้

#### Retrieval hints

Hypothesis: ใช้กลไก `CheckEntitlement` ตัวเดียวกับ BE-037 — ยืนยันรายการ endpoint ของ Module I-b ครบทุกตัวรวมชุดเป้าหมาย
Query: ค้น `CheckEntitlement`, endpoint list ของ Module I-b ใน Target
Provenance: DES-018, DEC-018, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

กติกา entitlement ของ `sb-compass` · endpoint อื่นที่ไม่ใช่การกั้น · สคีมา

#### Acceptance criteria

AC-009.1: ทุก endpoint ของ Module I-b (รวม Target Major Rules) ตรวจสิทธิ์ Premium ที่เซิร์ฟเวอร์ก่อนอ่าน/เขียน
AC-009.2: ผู้ใช้ที่ไม่มีสิทธิ์ไม่ได้ข้อมูลและไม่มีทางเขียนข้อมูลกลับ — fail-closed ทุกจุด

#### Required validation and expected evidence

ตรวจ AC-009.1/AC-009.2 ด้วยการยิง endpoint ทุกตัว (รวม BE-041/042/043) ในสามสถานะ — ไม่มีสิทธิ์ต้องไม่ได้ข้อมูลและไม่มีการเขียนเกิด — เก็บผลราย endpoint เป็นหลักฐาน

#### Rollback/compatibility notes

ชั้นกั้นครอบ endpoint — revert ได้ทางเทคนิคแต่ห้ามเปิดโมดูลให้ใช้จริงโดยไม่มีชั้นนี้

### Task BE-039 — Final identity/entitlement audit

Objective: audit รอบสุดท้ายของการยึดตัวตนทั้ง Module H + I-b (รวม Target Major Rules endpoints) — ยืนยันไม่มี endpoint ไหนรับ `SID`/`school_id` จาก body/header ของ client, fail-closed เมื่อตรวจสิทธิ์ไม่ได้, entitlement ถูกกั้นครบทุก endpoint ตาม BE-037/BE-038
Why: การกั้นที่ทำรายจุดมีโอกาสตกหล่น endpoint เดียวได้ — audit ปิดท้ายคือการยืนยันว่าครบทุกตัวก่อนเปิดใช้จริง
Owner: backend-engineer
Tier: T3
Depends on: BE-037, BE-038, BE-044
Traceability: REQ-010, AC-010.1, DES-018, DEC-018
Produces: none
Consumes: Contract:DatabaseOwnershipBoundary.v1
Risk: security
Human gate: security, schema, breaking-contract
Status: pending

#### Scope and constraints

เป็นการตรวจ + แก้จุดที่ตกหล่นเท่านั้น ไม่ใช่งานใหม่ · ตรวจราย endpoint ครบทั้งสองโมดูล (รวมชุดเป้าหมาย) · บันทึกผลราย endpoint ไว้เป็นหลักฐาน

#### Retrieval hints

Hypothesis: รวมรายการ endpoint จาก payload ของ task ทั้งเฟส H/I-b — ตรวจทีละตัวกับซอร์สจริงว่าแหล่งค่าตัวตนมาจาก session/JWT เดิม
Query: ค้น route/controller ของ Module H + I-b ใน Target แล้ว grep จุดรับ `SID`/`school_id`
Provenance: DES-018, DEC-018, Contract:DatabaseOwnershipBoundary.v1

#### Do not modify

กลไกตัวตน/entitlement เดิม (แก้เฉพาะจุดที่ audit เจอว่าตกหล่น) · สคีมา · payload ธุรกิจ

#### Acceptance criteria

AC-010.1 (ฐาน audit): ไม่มี endpoint ใดของ Module H/I-b รับตัวเลขนักเรียนจาก client และทุก endpoint fail-closed เมื่อตรวจสิทธิ์ไม่ได้ — ผลตรวจราย endpoint ถูกบันทึกครบ

#### Required validation and expected evidence

ตรวจ AC-010.1 (ฐาน audit) ด้วยการไล่ตรวจทุก endpoint ตามรายการ (ซอร์ส + ทดสอบยิงจริง) และเก็บตารางผลราย endpoint (ผ่าน/พบ/แก้แล้ว) เป็นหลักฐาน

#### Rollback/compatibility notes

audit แก้เฉพาะจุด — revert ต่อจุดได้ · ผล audit เป็นเอกสารหลักฐานก่อนเปิดใช้จริง

## Sequencing Notes

- Phase order follows `design.md`'s Module dependency chain: **E → F → G → I-a**, and separately **E →
  H** (with the flagged Module K gap — see Phase 7) and **G → I-a/I-b** (shared SSO + screen frame).
  Phase 5 (I-b) itself doesn't strictly need Phase 7 (H) to finish first, but Phase 8 needs both.
- **Phase 2 (Module F) is blocked end-to-end on the `glm-5.2` API key (RISK-F01/PRE-F01)** — BE-008
  onward cannot be tested for real until the key exists; BE-002/003/004 can proceed without it.
- **Phase 3 (Module G) auth requirement is closed per OQ-F08** (2026-09-15) — BE-013 uses the existing SchoolBright Staff/Admin Login session, unblocking Phase 3 tasks.
- **Phase 5's new Target Major Rules tasks (BE-040–044, FE-011) depend on Phase 5's own RIASEC-submission
  work being complete** (see the dependency-uncertainty bullet below) — do not start BE-041 before
  confirming which existing task actually writes `TCompassRiasecResult`.
- **Phase 8 is cross-cutting and depends on `sb-compass` OQ-15(a1)/(a2)/PRE-06** (a different module's
  open question) for BE-037/038 — this plan cannot resolve that; it's tracked in `sb-compass/plan.md`.
- **The 100%-submission reversion (BE-028) and the `ConsistencyScore` re-scope (BE-029b) are corrections
  to this round's understanding, not new features** — `design.md` v8 (2026-09-02) explicitly rejected the
  "allow partial submission" proposal that was under consideration in OQ-F11, and re-scoped the old
  "confidence from completion %" mechanic into "confidence from cross-format consistency" because the
  100% rule makes completion-based confidence structurally impossible to trigger. Any assumption in
  earlier drafts/discussions that partial submission would be allowed is now known-wrong and must not be
  implemented.
- **Phase 6 (Module K) is code-writable in parallel with Phases 5/7** — it doesn't depend on either
  finishing (BE-047's T-Score calc only needs Module E/BE-001; BE-049's `InterestFit` needs Phase 5's
  RIASEC `studentLevel` calc, BE-029, not the whole phase). **It cannot run end-to-end against real data
  until `sb-compass` ships DEP-F09** (`"StddevScore"` column, that module's Phase 3/Module C) — this is
  a cross-module runtime dependency this plan cannot resolve, tracked in `sb-compass/plan.md` instead.
- **Phase 7's BE-022 now depends on Phase 6 (BE-052)** instead of standing alone on the old
  `CompassPathCatalog` 8-path mechanism — Module H cannot ship ahead of Module K per `design.md`'s own
  dependency chain. The exact fate of the old mechanism (retired vs. kept as fallback) still needs a
  `system-analyst` confirmation, noted on the task itself rather than assumed either way.
- **Phase 1 coordination note**: `sb-compass` Phase 1 (Module A) touches the same file as BE-001 —
  sequence with that module's Phase 1 rather than in parallel (DEP-F05).
- **Phase 4 dependency note**: Module G (Staff auth + review console) must exist first — this uses the same auth
  layer and screen frame (BE-013).
- **Phase 5 Target Major Rules cardinality note**: **OQ-F14 ปิดแล้ว 2026-09-15** — ผู้ใช้ยืนยันกำหนดให้เลือกเป้าหมาย active ได้สูงสุด 1 สาขาต่อคน บังคับด้วย Partial Unique Index `"UX_TCompassTargetProgram_Active_Student"` ใน BE-040 และการ supersede แถวเดิมก่อน insert ใหม่ใน BE-042
- **Phase 5 Development Plan note (REQ-018 / DES-026)**: BE-054 และ FE-013 ทำหน้าที่คำนวณ Gap Analysis รายกลุ่มสาระเทียบกับเกณฑ์ `TARGET_SCORE = 75.0` พร้อมแบบฝึกหัดทบทวน 4 ข้อ และการ์ดแนะนำ Orbit Tutor บนแท็บ `tab=gap` ของ MyCompass โดยมี Precondition คือนักเรียนต้องมี active target major
- **Phase 5/6 `"DisplayScore"` note**: **OQ-F16 ปิดแล้ว 2026-09-15** — กำหนดค่า Engineering Default `CONSISTENCY_MIN = 0.60` ปลดล็อกการคำนวณและบันทึก `"DisplayScore"` ใน BE-051 ไม่ต้องเขียนค่า NULL อีกต่อไป
- **Phase 7 note (dependency gap closed this round)**: Module H now depends on **Phase 6 (Module K)** — see BE-022's
  corrected `Depends on` above. BE-022's exact interaction with the pre-existing `CompassPathCatalog`
  mechanism still needs a `system-analyst` confirmation pass (flagged in the task row itself) since
  `design.md` never explicitly says the old 8-path contract is retired — that's a smaller, scoped
  question now, not an open "Module K doesn't exist" gap.
- **Not planned as a separate task**: point §5 (`TARGET_SCORE` vs. T-Score staying two separate mechanisms)
  is a hard constraint written into BE-047's task note, not an endpoint of its own — nothing to implement,
  only something to not accidentally merge.

## Unresolved Open Questions

- **OQ-F08** — **ปิดแล้ว 2026-09-15**: ผู้ใช้ยืนยันใช้ SchoolBright Staff/Admin Login session เดิมของระบบปัจจุบัน ไม่ต้องทำ SSO หรือ auth provider ใหม่ (ปลดบล็อก BE-013)
- **OQ-F09** — PDF original-file storage location, blocks only BE-005's storage step (placeholder
  allowed elsewhere in Phase 2). Owner: user + `devops`.
- **OQ-F14** — **ปิดแล้ว 2026-09-15**: ผู้ใช้ยืนยันโควตาเป้าหมาย active ได้สูงสุด 1 สาขาต่อคน บังคับด้วย Partial Unique Index `"UX_TCompassTargetProgram_Active_Student"` ใน BE-040 และการ supersede แถวเดิมก่อน insert ใหม่ใน BE-042
- **OQ-F15** — "ตั้งเป็นเป้าหมาย" button placement/copy, blocks FE-011 only. Owner: `uxui-designer`.
- **OQ-F16** — **ปิดแล้ว 2026-09-15**: กำหนดค่า Engineering Default `CONSISTENCY_MIN = 0.60` ปลดล็อกการคำนวณและบันทึก `"DisplayScore"` ใน BE-051
- **sb-compass OQ-15(a1)/(a2)** — blocks Phase 8 (BE-037/038). Tracked in `sb-compass/plan.md`, not
  owned here.
- **OQ-F17** *(new, opened by `design.md` v9, 2026-09-15)* — integer PK width for the 11 tables the PK
  change did *not* touch (`bigserial`/`bigint` in `## Data Model` vs `serial`/`integer` in the real
  bootstrap script). **No task's Owner/Depends-on/Tier/gate changes because of it**: it is a capacity
  decision, not a plan-affecting fact, and `design.md` already tells engineers to follow the real DDL
  and never `ALTER TABLE` the width themselves — recorded as a constraint inside BE-003 rather than as
  a new task. It does block anyone claiming doc-vs-database parity, which is QA-visible. Owner: user
  (or `system-analyst` under an engineering-judgment grant, as with OQ-F12/OQ-F13).
- **RISK-F22** *(new, opened by `design.md` v9, 2026-09-15 — user-confirmed 2026-09-14, not yet
  reconciled)* — the module's tables actually live in a **new database `SB_Compass`**, not `PGGradeDB`
  as `## Data Model`'s "ที่อยู่" paragraph, `## DES-018`, PRE-F03/PRE-F04, RISK-F10/F11 and `## DES-024`
  still say. **Not fixable from the plan side**: it changes DB ownership/grants, network prerequisites,
  and possibly forces a new `ClassOnlineWeb` connection string — an SA amend round of its own, and a
  `devops` prerequisite, not a task rewrite. Recorded as a "confirm the target database before running
  the migration" constraint on BE-003; no Owner/Depends-on/Tier/gate changed, because until SA
  reconciles DES-018/DES-024 nobody can say whether PRE-F03/PRE-F04 grow a new prerequisite task.
  Owner: `system-analyst` (amend) then `devops`.
- **Raised for `system-analyst`, not resolved here (1)** — `## Data Model`'s **วิธีสร้าง** still says the
  catalog tables may be created **only** by the Curriculum Service's migration and that `ClassOnlineWeb`
  must never create or alter them, yet the same section's v9 status note names
  `ClassOnlineWeb/DatabaseScripts/Compass/bootstrap-sb-compass-db.sql` as the schema's ground truth and
  the database has already been built from it. BE-003 keeps the migration-only rule as written, so the
  two statements now contradict each other on who owns table creation. This planner did not pick a side:
  it is a `DES-018`/`Contract:DatabaseOwnershipBoundary.v1` ownership question, and picking either way
  silently would either invalidate a real, user-run script or weaken the ownership contract. (Read from
  `design.md`'s current `## Data Model` v9 status note; the Target file itself was not opened in this
  session.)
- **Raised for `system-analyst`, not resolved here (2)** — v9 fixes what identifies a cluster/dimension
  **in the database** and **towards AI/seed files**, but says nothing about what identifies a cluster in
  the **student-facing payloads** (BE-052/FE-012, BE-022's ordering input). RISK-F21 forbids Ids in
  seeds/prompts/code, not in API responses, so the honest state is "unspecified". BE-052 was left
  unchanged rather than have this plan invent a payload rule. Owner: `system-analyst` (DES-022 §/DES-020
  contract text).

## Change Log

- 2026-09-02 — Wrote `plan.md` fresh (file did not exist in the working tree; prior version existed only
  in git history and the user declined restoring it). Rebuilt Phases 1–7 verbatim from `design.md`
  Contract Version 8's Modules E/F/G/I-a/H/I-b and the task bodies already captured in
  `knowledge/sb-compass-faculty-match/task/*.yaml` (same 49 task IDs, same `DES-NNN`/dependency
  references, `Status` = `pending` throughout — matches this module's real state, all Phases were
  `implemented ⬜` per `_docs/status.md` already). Added Phase 6 amendment (BE-040–044, FE-011) for
  REQ-017/DES-017 Target Major Rules, new this round — flagged `🔒 Security gate` given the IDOR failure
  mode `design.md` already calls out for Module I-b, and added BE-044 specifically for ownership
  enforcement on the three new write endpoints. Corrected BE-028's description to reflect the confirmed
  100%-submission rule (partial-submission proposal rejected) and added BE-029b for the `ConsistencyScore`
  re-scope (OQ-F13) — no task IDs renumbered. Flagged the Module K gap (no tasks exist for
  `DES-011`/`DES-013`/`DES-015` anywhere in the source data) and a dependency-uncertainty note on BE-041
  rather than resolving either without a design/test-plan pass. Did not create tasks for OQ-23 (new
  "แผนพัฒนา" REQ, not yet defined) or OQ-24 (whether the mockup's 4-question exercise replaces REQ-008) —
  both are real but explicitly not yet specified; noted here only as pointers for a future
  `business-analyst`/`system-analyst` round.
- 2026-09-02 (same day, follow-up) — Added **Phase 8: Module K — Cluster Determination** (BE-045–053,
  FE-012), closing the gap flagged in the prior round: `design.md`'s `## Cluster Determination Rules`
  (`DES-011`/`DES-013`/`DES-015`) is fully closed business-rule-wise and was legitimate backed work, not
  invented scope. Split into migration (BE-045/046), T-Score calc + fallback (BE-047/048, 🔴 blocked at
  runtime on `sb-compass` DEP-F09), the 11-cluster combined-score formula (BE-049), ClarityIndex/Band
  (BE-050), Confidence/shrinkage + `DisplayScore` (BE-051, ⬜ blocked on OQ-F16 for its final step only),
  the read endpoint (BE-052), ownership enforcement (🔴 BE-053, same IDOR discipline as BE-026/BE-036/
  BE-044), and the results screen (FE-012). Flagged `🔒 Security gate` per `design.md`'s Module K
  Security Considerations (ownership over `TCompassStudentClusterScore`, same pattern as Modules H/I-b).
  Corrected Phase 5's BE-022 to depend on Phase 8 instead of standing alone on the old 8-path mechanism,
  per `design.md`'s explicit Module H → Module K dependency — removed the prior round's "gap" flag from
  Phase 5 and Plan Summary accordingly, replacing it with a smaller scoped question (old-mechanism
  retirement) for `system-analyst` to confirm.
- 2026-09-07 — Reconciliation fix: corrected the "Phase 6 amendment — Target Major Rules" heading from
  `###` (H3) to `##` (H2) to match every other phase heading's level in this file. `sta --check-plan`
  only recognizes `##`-level headings as phase boundaries, so the mis-leveled heading had caused the
  entire table under it (BE-040–044, FE-011) to be silently skipped when building the task DAG,
  surfacing as false "depends on a task not in this plan" errors for BE-038→BE-041 and BE-039→BE-044.
  No task content, IDs, or dependencies changed.
- 2026-09-07 (same day, follow-up) — **Reordered phase blocks to match true dependency order**, closing
  a genuine circular dependency `sta --check-plan` reported: `BE-022 -> BE-023 -> BE-024 -> FE-006 ->
  BE-027 -> ... -> BE-052 -> BE-022`. Root cause: the 2026-09-02 change made Module H's BE-022 depend on
  Module K's BE-052 (a legitimate, already-confirmed design decision per `design.md` v8 — Module H's
  ranking now reads Module K's cluster results instead of the old 8-path mechanism), but the document
  still listed Module K's phase (old Phase 8) *after* Module H's phase (old Phase 5). Because 🔒
  Security-gated phases are enforced to run in strict document order, and Module K's own tasks depend on
  Module I-b's RIASEC output (old Phase 6) and Module E (old Phase 1), the old ordering (E, F, G, I-a, H,
  I-b, Entitlement Wiring, K) combined with the new H→K edge was unsatisfiable. Physically reordered the
  whole phase blocks (tables intact, no task content/Status/Owner/Depends-on/DES-NNN changed) to: 1)
  Module E, 2) Module F, 3) Module G, 4) Module I-a, 5) Module I-b (+ its Target Major Rules amendment,
  renumbered from "Phase 6 amendment" to "Phase 5 amendment"), 6) Module K (was Phase 8), 7) Module H
  (was Phase 5), 8) Module H + I-b Entitlement Wiring (was Phase 7, unchanged position as the last
  phase). Updated all phase-number prose references in Plan Summary, the Phase 5/5-amendment/6/7 body
  notes, Sequencing Notes, and Unresolved Open Questions to the new numbering; left references to a
  *different* module's own phase numbers (e.g. `sb-compass` Phase 1/Phase 3) untouched since those are
  not this plan's numbering. No task IDs, dependency edges, or acceptance criteria changed — only phase
  position and heading numbers/labels.
- 2026-09-08 — Added the optional `Tier` column to all 8 phase tables (plus the Phase 5 amendment table,
  which shares Phase 5's cast) per `policies/architecture.md`/the PM role contract. Exactly one
  phase-level cast per phase, on the row judged most representative of that phase's overall risk; every
  other row's `Tier` cell left blank. No `T1` used (reserved), no analysis phase cast (this plan has none
  — all 8 phases are implementation phases; QA runs per `review.md`, not as a plan phase here). No task
  IDs, Status, Owner, `Depends on`, or other content changed. Rationale per phase: **Phase 1 (Module
  E)** → `T6` on BE-001 — a pure mechanical move of an existing method to a new home, explicitly no new
  logic. **Phase 2 (Module F)** → `T2` on BE-008 — the highest-risk task of the plan's highest-risk
  phase: a brand-new microservice's first live external-AI call (`glm-5.2`) with secret-store key
  handling and retry logic, sitting downstream of untrusted PDF upload/sandboxed conversion; warrants the
  planning/security-grade tier. **Phase 3 (Module G)** → `T3` on BE-013 — SSO auth middleware is the
  security-load-bearing task every other Phase 3/4 task depends on transitively; risky but narrower in
  blast radius than Phase 2's external-AI/untrusted-upload surface. **Phase 4 (Module I-a)** → `T5` on
  BE-020 — plain CRUD authoring endpoints, no security gate, lowest-risk implementation phase alongside
  Phase 1. **Phase 5 (Module I-b + Target Major Rules amendment)** → `T3` on BE-036 — chosen over the
  formula-heavy tasks because ownership/IDOR enforcement across the whole module (including the new
  Target Major Rules write endpoints) is this phase's dominant risk, on top of several new business-rule
  formulas (combined Likert+ranking scoring, `ConsistencyScore`) and a student-facing submission surface;
  the Phase 5 amendment table shares this single cast rather than casting again. **Phase 6 (Module K)** →
  `T4` on BE-047 — hard implementation explicitly spanning a cross-module contract (`sb-compass`'s
  `"StddevScore"` column, DEP-F09) underneath an 11-cluster weighted-combination formula; chosen over
  `T3` because the cross-module contract dependency, not just formula complexity, is the defining risk.
  **Phase 7 (Module H)** → `T4` on BE-022 — hard implementation reading another module's contract output
  (Module K's cluster results replacing the old 8-path mechanism), the same "across a contract" profile
  as Phase 6. **Phase 8 (Entitlement Wiring & Ownership Audit)** → `T3` on BE-039 — smaller in task count
  than Phases 2/5/6/7 but security-critical and cross-cutting: the final ownership/entitlement audit
  across both Module H and Module I-b (including the new Target Major Rules endpoints), fail-closed by
  design.
- 2026-09-08 (same day, follow-up) — Added the `## Execution Runbook` section below (mechanical addition
  only): copy-pasteable `sta run` commands grouped into rounds by phase/cast Tier, cross-checked against
  this file's own `## Unresolved Open Questions` and `## Sequencing Notes` for which tasks are actually
  runnable vs. blocked as of 2026-09-08. No task IDs, Status, Owner, `Depends on`, or Tier values changed;
  no phases reordered; no task table content touched.
- 2026-09-13 — Structure-only conversion to canonical `PlanTask format: 1` (no task id, status, owner,
  dependency, or Tier change): every task row of the former `| Task | Status | Owner | Depends on | Tier |`
  tables under `## Phase 1..8` plus the Phase 5 amendment table — 66 tasks in total, including BE-029b and
  the amendment rows BE-040–044/FE-011 — became a canonical `### Task` section keeping the same id,
  Status (`pending` throughout), Owner, `Depends on` edges and the 8 Tier values (BE-001 T6, BE-008 T2,
  BE-013 T3, BE-020 T5, BE-022 T4, BE-036 T3, BE-047 T4, BE-039 T3); rows with blank Tier cells omit the
  Tier line, per the parser. The `## Phase 5 amendment — …` H2 became regular task sections inside
  `## Phase 5` (the parser accepts `## Phase N: …` headings only), and the prose notes that lived under
  phase tables (Phase 1 coordination, Phase 4 dependency, Phase 5 cardinality/dependency-uncertainty/
  DisplayScore notes, Phase 6 status note, Phase 7 dependency-gap note, the TARGET_SCORE-vs-T-Score note)
  moved into `## Sequencing Notes` as prose bullets — the parser forbids prose between task sections;
  `## Unresolved Open Questions (tracked here, not owned here)` was renamed to the exact
  `## Unresolved Open Questions`. Traceability now cites the REQ/AC ids of `requirement.md` and the
  addressable `DES-018..024`/`DEC-018..024`/`Contract:*.vN` claims of `design.md` (renumbered 2026-09-07),
  mapped from each row's old DES-001..017 citation by section title: Import Rules → DES-019, Program
  Matching Rules → DES-020, Target Major Rules → DES-021, Cluster Determination Rules → DES-022, Admin &
  Review Rules → DES-023, identity/ownership (old DES-010/015) → DES-018; rows whose rules live in the
  standalone `## RIASEC Fit Rules` section (Module I-b student-side rows) anchor on DES-018, the
  addressable ownership contract those endpoints implement, because that section carries no DES claim of
  its own (BE-029b anchors on DES-022, which is where §7.2 `ConsistencyScore` actually lives in the
  current design). Risk/Human gate per row, honest picks from each row's own text: rows marked 🔴 carry
  `Risk: security` + `Human gate: security` inside their 🔒 phases (BE-005, BE-008, BE-013, BE-026,
  BE-036, BE-044, BE-053, BE-037, BE-038, plus the final audit BE-039); every task selecting DES-022 or
  DES-024 claims declares `Human gate: design-ambiguity` (matching `Material ambiguity: unresolved` —
  OQ-F16 `CONSISTENCY_MIN` for DES-022, OQ-F08 SSO / OQ-F09 PDF storage for DES-024 on BE-005/BE-013);
  and every task whose selected DES section declares `Data/schema: additive` (DES-018/019/021/022/023/024 —
  all 60 tasks except the six DES-020-only rows BE-001/BE-022/BE-023/BE-024/BE-025/FE-006) declares
  `Human gate: schema` per design-trigger gate parity (the checker's diagnostics demanded it, and schema
  confirmation is one of this workspace's human gates — the module adds its catalog/cluster/target
  tables); BE-047/BE-048 carry `Risk: shared-contract` for the cross-module `"StddevScore"` dependency (DEP-F09);
  stale row terminology was reconciled to the current design in Objectives only (8 แกน → 6 มิติ RIASEC,
  `trait_code` → `dimension_code`, `path_code` 8 → `cluster_code` 11, snake_case → `public."T<PascalCase>"`)
  with no scope change. Residual task tables deleted — the canonical task sections are now the sole task
  authority. No requirement.md/design.md/knowledge change; no state-changing git.
- 2026-09-14 — Drift check only, **no task section touched**. Re-read `design.md`'s working-tree
  `Design evidence format: 1` backfill (structured `Contract:*.v1`/`DEC-0NN`/`Evidence EVD-001..021`/
  `Compatibility`/`Data/schema`/`Migration/backfill`/`Security`/`Fallback`/`Material ambiguity` blocks
  under `## DES-018`..`## DES-024`, plus the `## <Title> (DES-0NN)` → `## DES-0NN — <Title>` heading
  rename) against all 66 tasks. The pass adds evidence/metadata on top of claim ids this plan already
  cites; it closes no open question, renumbers nothing, and changes no rule — so no Traceability,
  Consumes, Produces, Provenance, Risk, Human gate, `Depends on` edge, Tier, or acceptance criterion
  needs to change. Specifically re-checked the two sections still marked `Material ambiguity:
  unresolved`: **DES-022 Cluster Determination Rules** (still open via OQ-F16 `CONSISTENCY_MIN`, per
  `design.md` `## Unresolved Open Questions` and RISK-F19) and **DES-024 Deployment Prerequisites**
  (still open via OQ-F08 SSO details and OQ-F09 PDF storage; PRE-F09 remains a cross-module runtime
  blocker, not a new one) — the 12 tasks carrying `Human gate: design-ambiguity` are exactly the 12
  tasks selecting a DES-022 or DES-024 claim (BE-029b, BE-045–053, FE-012 for DES-022; BE-005, BE-013
  for DES-024), so the gate mapping is unchanged and still 1:1. Also re-verified `Data/schema` parity:
  DES-020 remains `unchanged` and its six DES-020-only tasks (BE-001, BE-022, BE-023, BE-024, BE-025,
  FE-006) correctly carry no schema gate, while the other 60 tasks select an `additive` section and
  carry `Human gate: schema`. `Compatibility`/`Migration/backfill: none` contradicts no task's
  rollback/compatibility note. Two observations handed back to `system-analyst` rather than resolved
  here: (1) `## RIASEC Fit Rules` is the one contract section the pass left without a `DES-0NN`/
  `Contract:*.v1`/evidence block, which is why the Module I-b student-side tasks still anchor on
  DES-018 as recorded on 2026-09-13; (2) `Contract:DeploymentPrerequisites.v1` is cited by no task's
  `Consumes` — BE-005/BE-013 reference DES-024/DEC-024 as a prerequisite blocker, not as an
  implementation contract they consume. No requirement.md/design.md/knowledge change; no
  state-changing git; `sta --check-plan` not run in this session (no shell access).
- 2026-09-14 (same day, follow-up) — **Re-pointed the Module I-b student-side citations from the
  DES-018 fallback to the now-addressable `## DES-025 — RIASEC Fit Rules`** — closing observation (1)
  of the entry immediately above, which this planner raised on 2026-09-14 and `system-analyst` has now
  resolved by giving that section a `DES-025`/`DEC-025`/`Contract:RiasecFitRules.v1` claim with evidence
  `EVD-022..EVD-024` (`ClassOnlineWeb/Helper/CompassRiasecService.cs` — `ComputeDimensionLevels:314`,
  `SubmitAsync:181`, `ComputeMatchPercent:423`). Section re-read in full before amending; no rule text
  changed. **13 tasks touched, Traceability/`Consumes`/Provenance only** — no Status, Owner,
  `Depends on`, Tier, Risk, Human gate, acceptance criterion or task id changed, nothing renumbered:
  · **`DES-025, DEC-025` added alongside the retained `DES-018, DEC-018` (6 tasks)** — BE-027, BE-028,
  BE-030, BE-031, BE-033, BE-034: each implements a DES-025 rule **and** genuinely reads a
  Curriculum-Service-owned table cross-service read-only (question bank, program RIASEC profile,
  cluster mapping, quest bank), so the ownership-boundary claim is a real second concern, not a fallback.
  · **`DES-018, DEC-018` replaced by `DES-025, DEC-025` (7 tasks)** — BE-029 (studentLevel §3.1-3.4),
  BE-032 (forbidden wording §6), BE-035 (profile-only mode §8), FE-007 (§1 completeness in UI),
  FE-008 (§4/§5/§6 display), FE-009 (§9 quest flow), FE-010 (§8 profile-only screen): these compute or
  render over payloads produced upstream and touch no cross-service DB access, so DES-018 was a pure
  fallback anchor there and is now wrong to keep. · All 13 now declare
  `Consumes: Contract:RiasecFitRules.v1` (previously `Consumes: none`), matching this plan's convention
  that a task consumes the contract whose rules it implements; `Produces` stays `none` throughout —
  this plan uses no producer convention. Retrieval `Hypothesis`/`Query` lines of the same 13 tasks now
  name the exact DES-025 sub-section each rule comes from (§1-§9), and the three Objectives that cited
  the section by its old heading (BE-032 §6, BE-033 §9, BE-035 §8) plus the Phase 5 `TCompassRiasecResult`
  sequencing note now use the renamed `## DES-025 — RIASEC Fit Rules` heading — citation labels only,
  no scope change. **Deliberately not re-pointed**: BE-036/BE-044/BE-053/BE-026/BE-037/BE-038/BE-039
  (identity/IDOR/entitlement — their rules really are DES-018), BE-029b (DES-022 §7.2 `ConsistencyScore`),
  BE-003 (catalog migration/quoting, DES-018), and BE-020/BE-021/FE-004/FE-005 (Module I-a admin side —
  anchored on the genuine DES-023 Admin & Review Rules, not on a DES-018 fallback, even though BE-020's
  Hypothesis and BE-021's Objective reference RIASEC Fit Rules for column shape and the §9
  `program_id IS NULL` constraint). **Two gate-parity consequences observed and deliberately left
  unchanged, not silently applied** — they change human-gate behaviour, which is not a citation fix:
  (a) DES-025 declares `Material ambiguity: unresolved` (its §0 — real RIASEC question content still
  unverified, `uxui-designer` before any seed), so by the 2026-09-13 parity rule the 13 tasks now
  selecting DES-025 would also warrant `Human gate: design-ambiguity`, which none of them carries today;
  (b) DES-025 declares `Data/schema: unchanged`, so the 7 tasks that no longer select any `additive`
  section keep a `Human gate: schema` that the same parity rule would no longer require (over-gating,
  safe direction). Both are decisions for the user/`system-analyst`, not for this amend.
  No requirement.md/design.md/knowledge change; no state-changing git; `sta --check-plan` not run in this
  session (no shell access) — `Depends on` edges were not touched, so the DAG is unchanged.
- 2026-09-14 (same day, gate fix on the entry above) — **Human-gate parity for the 13 re-pointed tasks,
  after the coordinator ran `sta --check-plan --module sb-compass-faculty-match` and it failed on all 13
  with "design trigger material-ambiguity requires human gate design-ambiguity"**. This closes both
  parity consequences the previous entry recorded as open, in the direction the deterministic rule
  dictates — not a new planning decision, the checker's verdict on an existing rule. (a) **`design-ambiguity`
  added to all 13** (BE-027, BE-028, BE-029, BE-030, BE-031, BE-032, BE-033, BE-034, BE-035, FE-007,
  FE-008, FE-009, FE-010), because DES-025 declares `Material ambiguity: unresolved` (§0 — real RIASEC
  question content unverified until `uxui-designer` signs off, per DES-012); appended to the existing
  value in the file's established `security, design-ambiguity, schema` order, never replacing one.
  (b) **`schema` dropped from the 7 tasks that no longer select any `additive` section** — BE-029,
  BE-032, BE-035, FE-007, FE-008, FE-009, FE-010 now anchor on DES-025 alone, which declares
  `Data/schema: unchanged`, so under the same parity rule that leaves the six DES-020-only tasks
  (BE-001/022/023/024/025/FE-006) ungated for schema, these seven no longer qualify either; they carry
  `Human gate: design-ambiguity` only. The 6 dual-anchor tasks (BE-027, BE-028, BE-030, BE-031, BE-033,
  BE-034) keep `schema` because they still select DES-018, which is `additive`, and now read
  `Human gate: design-ambiguity, schema`. Nothing else changed: no Status, Owner, `Depends on`, Tier,
  Risk, Traceability, `Consumes`, Provenance, acceptance criterion or task id, and no id renumbered.
  **Not changed and flagged instead**: DES-025 also declares `Security: sensitive`, and these 13 tasks
  carry no `security` gate of their own — Phase 5 is a phase-level 🔒 Security gate and BE-036 carries
  the Module I-b `Risk: security` + `Human gate: security`; the checker did not flag this, so whether
  the sensitive-data gate should also land per task is left to `system-analyst`/the user, not decided
  here. `sta --check-plan` still not runnable in this session (no shell access) — coordinator to re-run.
- 2026-09-15 — **Schema reconciliation round: re-pointed the tasks that named a text-code column the
  `## Data Model` no longer has.** Trigger: `system-analyst` amended `## Data Model` to **Contract
  Version 9** (`Contract:CompassDataModel.v9` / `DEC-026` / `EVD-025..027`, `Compatibility: breaking`,
  `Migration/backfill: none`) to reconcile it against the user's own DDL change in
  `ClassOnlineWeb/DatabaseScripts/Compass/bootstrap-sb-compass-db.sql` — 7 master tables moved from a
  text-code PK to `serial "<Name>ID"` int identity, the old codes stayed as `text NOT NULL UNIQUE`
  (renamed to `"FacultyGroupCode"`/`"StudyPlanCode"`/`"CareerCode"` where they collided), 16 dependent
  tables were re-pointed to integer FKs, and `DES-019` §5's AI-contract field `faculty_group_id` became
  `faculty_group_code`. `## Data Model`, `## DES-019` §5, `## DES-023` §2/§3/§5 and `## DES-025` §3/§9
  were re-read in full before amending; no plan rule was invented on top of them.
  **13 tasks changed, no id renumbered, no Status/Owner/`Depends on`/Tier touched**: **BE-003**
  (master-table PK/code shape + seed-by-`INSERT ... SELECT ... JOIN` rule + AC-015.1 and its validation
  now observe both), **BE-005** (stale index name `ux_cpsource_sha` → the real
  `"UX_TCompassProgramSource_UniversityID_OriginalSha256"`, and `"UniversityCode"` → `"UniversityID"`
  resolution before the source row is written), **BE-009** (`faculty_group_id` → `faculty_group_code`
  plus the explicit "AI contract stays text code, service resolves to Id" rule and a resolve-failure
  case in its evidence), **BE-014** (queue filter now joins `"UniversityID"` from
  `public."TCompassProgramSource"` while the API still takes `"UniversityCode"`), **BE-015** + **FE-002**
  (DES-023 §3 edit path: cluster/dimension/faculty-group edited by code, stored as Id; the screen picks
  from a code+Thai-name list and never accepts a typed Id), **BE-017** (approval condition 4 now checks
  row count with `"ClusterID"` resolving into the 11 clusters, not `cluster_code`), **BE-020** and
  **BE-021** (`dimension_code` column → `"DimensionID"` integer FK, API still speaks `"DimensionCode"`),
  **BE-033** (quest selected by `"DimensionID"` per DES-025 §9), **FE-001** (filter value stays the text
  code; no Ids in the client), **BE-045** (`"ClusterCode"` FK → `"ClusterID"` FK on
  `public."TCompassStudentClusterScore"`), **BE-046** (weight seeds now need code→Id joins instead of
  direct code FKs, with a no-Ids-in-seed-files check in the evidence).
  **Checked and deliberately left unchanged**: BE-011/BE-012/BE-016/BE-018/BE-019 (their tables —
  `TCompassProgramIntake`, `TCompassProgram` status/`dedup_key`/`source_id` — are in v9's "nothing
  changed" set and they name no altered column), FE-003 (refers to the 6 conditions as a group, no
  column names), BE-031 and BE-022/BE-023/BE-024 (speak of "cluster" as a concept, never of
  `"ClusterCode"`), BE-049/BE-050/BE-051/BE-052 (`"ClusterCount"`/`"ClarityIndex"`/`"DisplayScore"` are
  untouched columns), FE-004/FE-005 (no column names), and the Module I-b student-side tasks other than
  BE-033 (DES-025's formulas changed their join key only, which none of those task texts names).
  **Gate parity applied, not discretionary**: the 13 tasks above now select the `DEC-026` claim, whose
  `## Data Model` block declares `Material ambiguity: unresolved` (OQ-F17 + RISK-F22) — so under the
  same deterministic rule `sta --check-plan` enforced on 2026-09-14, the 9 of them that carried
  `Human gate: schema` alone (BE-003, BE-009, BE-014, BE-015, BE-017, BE-020, BE-021, FE-001, FE-002)
  now read `Human gate: design-ambiguity, schema`; the other 4 already had it. **No `Human gate: schema`
  needed adding anywhere** — every task touched already carried it, and the six DES-020-only tasks
  (BE-001/022/023/024/025/FE-006) still select no schema-bearing section, so `Data/schema: breaking`
  does not reach them. `Risk` values unchanged: the breaking-ness lands on documents and unwritten code,
  not on live data (`Migration/backfill: none` — the database was dropped and rebuilt with no real rows).
  **Flagged, not resolved** (added to `## Unresolved Open Questions`): **OQ-F17** (int4 vs int8 for the
  11 untouched PKs) and **RISK-F22** (the tables actually live in a new `SB_Compass` database, not
  `PGGradeDB`) — neither changes any task's Owner/`Depends on`/Tier/gate on this planner's own reading,
  so both are recorded as constraints inside BE-003 and as open items for `system-analyst`; plus two
  observations this round surfaced and did not decide: `## Data Model`'s "migration-only" creation rule
  now contradicts the real bootstrap script's location under `ClassOnlineWeb`, and v9 never says what
  identifies a cluster in student-facing payloads. No requirement.md/design.md/knowledge change; no
  state-changing git; `sta --check-plan` not run in this session (no shell access) — `Depends on` edges
  untouched, so the DAG is unchanged; coordinator to re-run the checker.
- 2026-09-15 (same day, correction to the entry above) — **`DEC-026` / `Contract:CompassDataModel.v9` /
  `EVD-025..027` were retracted by `system-analyst` and every citation of them was repointed to
  `DES-018` / `DEC-018` / `Contract:DatabaseOwnershipBoundary.v1`.** Trigger: the coordinator ran
  `sta --check-plan --module sb-compass-faculty-match` and it failed — `DEC-026` is not a valid
  addressable claim, because SA had attached that block to the plain `## Data Model` heading, which the
  parser only recognises under a `## DES-NNN — Title` heading (no module's Data Model section ever
  carries a formal claim). SA has since removed the block; `design.md`'s current `## Data Model` records
  the v9 PK change as **prose only** and states explicitly that work needing an addressable contract
  binds to `DES-018`/`DEC-018`/`Contract:DatabaseOwnershipBoundary.v1`, which already owns the
  DDL/ownership rules. Section re-read in full before amending, as were `## DES-018` and its claim block.
  **The 13 tasks keep every rule change from the entry above** — this is a citation repoint, not a
  re-planning: **BE-003** (already cited DES-018/DEC-018 — the duplicate ids were simply dropped),
  **BE-005**, **BE-009**, **BE-014**, **BE-015**, **BE-017**, **FE-001**, **FE-002**, **BE-020**,
  **BE-021**, **BE-045**, **BE-046** (gained `DES-018, DEC-018` +
  `Contract:DatabaseOwnershipBoundary.v1` alongside their existing section), and **BE-033** (already had
  DES-018/DEC-018; the dead pair was dropped and its `Consumes`/Provenance repointed). Three prose spots
  carrying dead-id text were repointed with their substance intact: BE-003's retrieval hint (the
  bootstrap-script reference now cites the file and the line numbers `## Data Model` itself records,
  not `EVD-025..027`), BE-003's rollback note (the breaking-compatibility warning now states the fact
  without the retracted claim id), and BE-005's scope note. Four more `Contract Version 9` labels
  (BE-003 Objective/AC/do-not-modify, BE-045 Objective/AC/hint) became "สถานะ v9 (2026-09-15) ของ
  `## Data Model`", and the `## Unresolved Open Questions` bullet that cited `EVD-025..027` now cites the
  section's own v9 status note.
  **Gate parity reverted with the claim**: the 9 tasks that gained `Human gate: design-ambiguity` in the
  previous entry (BE-003, BE-009, BE-014, BE-015, BE-017, BE-020, BE-021, FE-001, FE-002) are back to
  `Human gate: schema` alone. The addition was derived solely from the retracted block's
  `Material ambiguity: unresolved`; the sections they actually select — `DES-018`, `DES-019`, `DES-023` —
  each declare `Material ambiguity: none`, so the design trigger no longer exists and the gate would be
  unbacked. BE-005 (DES-024), BE-033 (DES-025) and BE-045/BE-046 (DES-022) keep the
  `design-ambiguity` gate they already had for their own sections' unresolved ambiguity. `Human gate:
  schema` still holds everywhere it did, and `DES-018` is `Data/schema: additive`, so adding it creates
  no new schema-gate obligation. **Observed and deliberately not acted on**: `DES-018` is
  `Security: sensitive`, and the tasks that newly select it carry no per-task `security` gate — exactly
  the situation recorded on 2026-09-14 for DES-025/DES-019/DES-023 (the checker did not flag it; it is
  an SA/user call, not this planner's). **OQ-F17 and RISK-F22 remain open and still have no
  addressable claim of their own** now that the block is gone — they live as prose in `## Data Model`,
  as constraints inside BE-003, and as items in `## Unresolved Open Questions`; if they should gate
  anything, SA must first give them a home under a `DES-NNN` section. Not touched, per SA's explicit
  instruction: `DES-026 — Development Plan Contract` and its `Contract:DevelopmentPlan.v1`/`DEC-027`/
  `EVD-028..030` (a different, valid section added concurrently) — nothing was renumbered or reused.
  Historical Change Log entries that narrate the retracted ids were left verbatim as an accurate record
  of what happened. No Status, Owner, `Depends on`, Tier or task id changed; no id renumbered; no
  requirement.md/design.md/knowledge change; no state-changing git; `sta --check-plan` not runnable in
  this session (no shell access) — coordinator to re-run.
- 2026-09-15 — **Unblock OQ-F08, OQ-F14, OQ-F16 and add Development Plan tasks (BE-054, FE-013) for REQ-018 / DES-026**:
  - **OQ-F14**: ผู้ใช้ยืนยันกำหนดโควตาเป้าหมาย active ได้สูงสุด 1 สาขาต่อคน — อัปเดต **BE-040** (เพิ่ม Partial Unique Index `"UX_TCompassTargetProgram_Active_Student"` บน `("SchoolID", "SID") WHERE "Status" = 'active'`) และ **BE-042** (บังคับ supersede แถวเดิมเป็น `'superseded'` ก่อน insert แถวใหม่ใน transaction เดียวกัน)
  - **OQ-F16**: ผู้ใช้ยืนยันค่า Engineering Default `CONSISTENCY_MIN = 0.60` — อัปเดต **BE-051** ปลดล็อกการคำนวณ Shrinkage Layer ดึงคะแนนเข้าหา 50 และบันทึกลงคอลัมน์ `"DisplayScore"` (ไม่ต้องเขียน NULL อีกต่อไป) พร้อมปรับ `Human gate: schema` หลัง DES-022 `Material ambiguity: none`
  - **OQ-F08**: ผู้ใช้ยืนยันใช้ SchoolBright Staff/Admin Login session ปัจจุบัน — อัปเดต **BE-013** ปลดล็อก Auth middleware สำหรับหน้าจอแอดมินโดยไม่ต้องสร้างระบบ SSO ใหม่
  - **REQ-018 / DES-026**: เพิ่ม 2 tasks ใหม่ใน Phase 5:
    - **BE-054** (Backend): คำนวณ Gap Analysis รายกลุ่มสาระเทียบเกณฑ์ `TARGET_SCORE = 75.0` (`Gap = max(0, TARGET_SCORE - StudentScore)`), ดึงโจทย์ทบทวน 4 ข้อ, และการ์ดแนะนำ Orbit Tutor (`Contract:DevelopmentPlan.v1`, `DEC-027`)
    - **FE-013** (Frontend): หน้าจอแท็บแผนพัฒนาตนเอง `tab=gap` ใน `MyCompass.cshtml` / `compass-design.js` (lines 579-627)
  - ปรับปรุง `Plan Summary` (ยอด task รวม 68 tasks), `Sequencing Notes`, และ `Unresolved Open Questions` บันทึกการปิด OQ-F08, OQ-F14, OQ-F16
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Two tables applied verbatim:
  (1) Round 1 FULL (2026-09-14, recovered from a mislocated DEV-repo copy — ISS-F13) mapping 25 tasks:
  BE-001/027/028/029b/032/033/034/035/040/041/042/043/045/048/050 -> `verified`; BE-029/030/031/036/044/047/049/051/052/053
  -> `blocked` (block reasons per that round: ISS-F02, open 🔒 gates, ISS-F03, OQ-F16, ISS-F09; note OQ-F16 has since
  closed 2026-09-15, lifting BE-051's specific blocker). BE-046 stays `pending` (weight seeds absent). All other tasks
  (Phases 2, 3, 4, 7, 8) stay `pending`. (2) Phase 1 FULL (2026-09-15, canonical `review.md` in the Knowledge repo):
  BE-001 re-verified against the current tree. Module remains NOT deployable: 3 Critical open issues (ISS-F01..F03).
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `review.md`'s Round 3 (TARGETED + BE-002) sync row verbatim: BE-002 -> `verified` (Curriculum Service
  scaffold at `curriculum-service/`, ruff/mypy exit 0, config via service-own mechanism, no pipeline code).
  Same round closed ISS-F01 (nav removal per user decision 2026-09-15) and ISS-F02 (divisor already
  correct in current tree, verified independently); new: ISS-F14 (Important — missing §3.4/RISK-F18
  single-format logging), ISS-F15 (Minor — direct-URL residual of MyCompass, owner ruling pending).
  Phase 2 remains open: BE-003 (schema human gate + RISK-F22), BE-004 pending implementation.
  (Round 1's 24-row relay from the mislocated record was applied earlier today — ISS-F13's work item.)
- 2026-09-16 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `review.md`'s Round 4 (TARGETED) sync rows verbatim: BE-003 -> `verified` (26-table catalog migration +
  seeds; all 88+66 weight cells verified against DES-022 §4a; validated on a throwaway local Postgres only —
  real-DB run is the schema human gate); BE-004 -> `blocked` (markitdown 0.1.3 + converter + spike verified;
  AC-001.1's ">=3 real KMUTT PDFs" pending from the user, RISK-F02 verdict honestly pending). Same round:
  ISS-F17 fixed post-round by backend-engineer (docstring citation, ruff/mypy re-run exit 0); new ISS-F16
  (Minor, system-analyst — DES-018 ownership table omissions). Phase 2 remains open pending the security
  gate and the first real-DB migration run (devops PRE-F10/ISS-F05 wiring incl. PGCompass_Password).
- 2026-09-16 — **Amend BE-008 + PRE-F01 ตามมติผู้ใช้ "รวม config ที่เดียวทั้งหมด" (design v13, relay of user decision)**:
  ยกเลิกข้อความเดิม "คีย์อยู่ใน secret store ของ service เอง ห้ามใส่ prod.config" — ที่เก็บ config ทั้งหมดของ
  Curriculum Service คือ `prod.config` กลุ่มคีย์ `ApiKey` / `Endpoint` / `Model` (ชื่อกลางทั้งชุด สำรองไว้เปลี่ยน vendor — ปรับครั้งที่สอง
  ตามมติผู้ใช้ 2026-09-16) / `Curriculum_DatabaseUrl` / `Curriculum_PdfStoreEndpoint` (slot ว่าง ผู้ใช้เติมเอง); service แยก XML
  `<appSettings>` ของ prod.config เอง (v14 — ไม่มี env injection; ลำดับค่า: env override > XML >
  `.env` local mirror > defaults; ค่าว่าง = ยังไม่ตั้ง; ไฟล์หาย = degrade พร้อม warning) · **คงไม่เปลี่ยน**: ห้าม hardcode ในซอร์สโค้ด · ฝั่ง
  ClassOnlineWeb ไม่มีโค้ดเรียก AI · ผู้ใช้ยอมรับความเสี่ยง RISK-F05 (plaintext prod.config) เอง 2026-09-16 ·
  `.env` ของ service เหลือเป็น local override mirror เท่านั้น
- 2026-09-16 — **Knowledge sync/relay (user decision, design v14)**: BE-008 กลไกการรับค่าเปลี่ยนเป็น
  "service อ่าน prod.config ตรง" — ตัดขั้น devops env-injection ออก (ทับข้อความ relay ก่อนหน้าของ v13) ·
  กติกาที่คงเดิม: ห้าม hardcode ในซอร์ส · ฝั่ง ClassOnlineWeb ไม่มีโค้ดเรียก AI · `/readyz` รายงานแค่ presence ·
  เงื่อนไขปลดล็อก BE-008 ไม่เปลี่ยน: ผู้ใช้เติม `ApiKey` + `Endpoint` ใน prod.config · RISK-F25 (Minor,
  file-path coupling) ยอมรับโดยมติผู้ใช้
