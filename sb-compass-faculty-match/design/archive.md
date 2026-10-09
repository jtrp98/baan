# SB Compass — จับคู่คณะ/หลักสูตรจริง (Faculty Match) — Feasibility & Design

Design evidence format: 1

**Contract Version:** 14

> **แก้ไขรอบที่ 2 (2026-08-31)** — รื้อทิศทางเดิมของโมดูลนี้ตาม `requirement.md` REQ-011..REQ-015
> (ยืนยันจากผู้ใช้ทั้งหมด 2026-08-31): เปลี่ยนตัวกรองชั้นแรกจาก **8 สายเดิม** เป็น **11 Interest
> Cluster** (อ้างอิง `_docs/module/sb-compass/education-pathway-taxonomy-design.md`) · แทนที่แบบทดสอบ
> บุคลิกภาพเดิมทั้งสองชุดด้วย **Holland Code (RIASEC)** · เพิ่ม **T-Score** ของคะแนนกลุ่มสาระเทียบ
> ระดับประเทศ · ทำ **6-layer schema เต็มรูปแบบเฉพาะฝั่งสายสามัญ (ม.ปลาย)** · ผู้ใช้ยืนยันแล้วว่า
> **อนุญาตให้รื้อเอกสารนี้ได้เต็มที่** (ไม่มีข้อมูลจริงถูก implement เลย ณ วันที่แก้ไข — ดู `status.md`)
> **สิ่งที่ยังคงเดิมและไม่เปิดใหม่**: stack ทั้งสอง codebase (`ClassOnlineWeb` .NET FW 4.8 + Curriculum
> Service Python/FastAPI) · การแยกความเป็นเจ้าของตาราง · เส้นแบ่งข้อมูลเด็ก/AI ภายนอก (REQ-010)
> **บันทึกคำถาม–คำตอบที่ปิดแล้วของรอบที่ 1 (D1-D11) ถูกย้ายไปที่ `design-archive.md` แล้ว** ตาม
> `policies/documentation.md` §4 — กติกาที่ใช้จริงยังอยู่ครบใน Contract sections ด้านล่าง

> **แก้ไขรอบที่สอง ในวันเดียวกัน (2026-08-31)** — ผู้ใช้ปิด **OQ-F03 (สูตรรวม cluster)**,
> **OQ-F06 (แหล่งที่มา `stddev_score`)**, และ **OQ-F07 (ตารางน้ำหนัก cluster↔subject/RIASEC)** เป็น
> **confirmed ทั้งหมด** ตามข้อเสนอของเอกสารนี้ ไม่มีการปรับ — `## Cluster Determination Rules` จึง
> เป็น Contract ที่ implement ได้แล้ว **ยกเว้น DEP-F09** (คอลัมน์ `stddev_score` — `sb-compass REQ-017`
> ลงใน requirement ของโมดูลนั้นแล้ว 2026-08-31 แต่ยังไม่มีคอลัมน์จริงในฐานข้อมูล และ `sb-compass OQ-14`
> ยังเปิดอยู่) · **ปิดเพิ่มในวันเดียวกัน**: ไม่แยก Module K เป็นโมดูลใหม่ (ดู `## Modules`) ·
> ขอบเขตการใช้ T-Score ไม่แตะ `TARGET_SCORE` (ดู `## Cluster Determination Rules` ข้อ 1+5) ·
> **OQ-F04 ปิดแล้ว** — `sb-compass/requirement.md` amend เสร็จ (REQ-005/REQ-007 ถูกแทนที่ + REQ-017 ใหม่)

> 🟢 **แก้ไขรอบที่สาม (2026-08-31, Contract Version 4) — sync กับการเปลี่ยนชื่อตาราง/คอลัมน์ของ
> `sb-compass` (v8)**: `sb-compass` ปิด OQ-19 ด้วย **ตัวเลือก C** และยืนยันเพิ่มว่า **ทั้งสามตาราง
> (`compass_level_subject_stat` / `compass_student_level_score` / `compass_mbti_result`) ยังไม่เคย
> ถูกสร้างในฐานข้อมูลใด ๆ เลย** ไม่ใช่แค่ไม่มีข้อมูลนักเรียนจริงตามที่เอกสารนี้เข้าใจตอนเปิด OQ-F10 —
> ทั้งสามตารางถูกเปลี่ยนชื่อเป็น `public."TCompassLevelSubjectStat"` / `public."TCompassStudentLevelScore"`
> / `public."TCompassMbtiResult"` พร้อมคอลัมน์ `"PascalCase"` แล้ว **ไม่ต้อง migration** (ดู
> `sb-compass/design.md` Contract Version 8 → `## Data Model` กลุ่มที่ 1) · **ผลกระทบต่อเอกสารนี้**:
> (1) ทุกจุดที่อ้างชื่อเดิม (`compass_level_subject_stat`, `mean_score`, `stddev_score` ฯลฯ) ของ
> `sb-compass` แก้เป็นชื่อใหม่ตามด้านล่าง (2) **สมมติฐานหลักของ OQ-F10 ที่ว่า "3 ตารางเดิมเปลี่ยนชื่อ
> ไม่ได้ฟรี ๆ" ไม่จริงอีกต่อไป** — ดู `## Table Naming Convention` ที่แก้ไขแล้ว **แต่ OQ-F10 ยังไม่ปิด
> เอง** เพราะเป็นการตัดสินเรื่อง convention ของ 27 ตารางใหม่ที่โมดูลนี้เป็นเจ้าของ ต้องให้ผู้ใช้ยืนยัน

> 🟢 **แก้ไขรอบที่สี่ (2026-08-31, Contract Version 5) — ปิด OQ-F10 ด้วยตัวเลือก B**: ผู้ใช้ยืนยัน
> ให้ทั้ง 27 ตารางใหม่ของโมดูลนี้ใช้ `public."T<PascalCase>"` + คอลัมน์ `"PascalCase"` + index
> `"IX_..."`/`"UX_..."` แทน snake_case ที่เคยร่างไว้ — DDL ทั้งชุดใน `## Data Model` เปลี่ยนชื่อครบ
> ทุกตาราง/คอลัมน์/index/FK (คงตรรกะและ constraint เดิมทุกจุด ไม่ใช่ schema change) · เพิ่มกฎการ
> quote identifier ใน `## Database Ownership Boundary` · **OQ-F10 ปิดแล้ว** — ดู
> `## Table Naming Convention` และ Change Log entry ของรอบนี้สำหรับรายละเอียดครบ

> 🟠 **แก้ไขรอบที่ห้า (2026-08-31, Contract Version 6) — รับ `requirement.md` "แก้ไขรอบที่ 3" +
> REQ-016**: ผู้ใช้ยืนยันเพิ่มสามเรื่องที่กระทบสัญญาโดยตรง (1) **คำถาม RIASEC ใช้แบบผสม** — เพิ่ม
> **แบบเรียงลำดับ (forced-choice ranking, 5-7 ตัวเลือกต่อชุด)** เข้ามา**คู่กับ**แบบให้คะแนนแยกข้อ
> (Likert 1-5) **ไม่ใช่แทนที่กัน** → `## RIASEC Fit Rules` ข้อ 1-3 เขียนใหม่ + ตารางใหม่ 2 ตัว
> (2) **relative/adaptive scoring** — คะแนนดิบเท่ากันแต่โปรไฟล์ชัดเจนไม่เท่ากัน **ห้ามแสดงเหมือนกัน**
> → `## Cluster Determination Rules` ข้อ 6-7 (**ข้อเสนอ — ค่าคงที่ยังไม่ยืนยัน ดู OQ-F12**)
> (3) **REQ-016 ปิดน้ำหนัก 50/50 ซ้ำอีกครั้ง** ไม่เปลี่ยนเป็น 60/40 → สูตรข้อ 3 คงเดิมทุกตัว
> **สิ่งที่ยังคงเดิมและห้ามรื้อ**: เวกเตอร์น้ำหนัก `public."TCompassClusterRiasecWeight"` (11×6) —
> โมเดล ordered-pair ของเอกสารร่าง **ถูก REJECT ไปแล้ว ห้ามนำกลับเข้ามา** (`sb-compass/design.md`
> คำวินิจฉัยข้อ A) · กลไก `"ReverseScored"` ของฝั่ง Likert **ยังอยู่ครบ ห้ามถอด**
> (`## RIASEC Fit Rules` ข้อ 3.3) · `studentLevel` ยังอยู่ในสเกล 1-5 เท่าเดิม สูตรที่กินค่านี้
> (`matchPercent`, จุดไม่เข้ากัน, `InterestFit`) **ไม่ต้องแก้แม้แต่ตัวเดียว**

> 🟠 **แก้ไขรอบที่หก (2026-09-02, Contract Version 7) — รับ REQ-017 ("ตั้งเป็นเป้าหมาย")**: `requirement.md`
> "แก้ไขรอบที่ 4" เพิ่ม concept ใหม่ที่ไม่เคยมีในเอกสารนี้มาก่อน — นักเรียนยืนยันสาขาหนึ่งจาก 10 อันดับ
> ของ REQ-006 เป็น "เป้าหมาย" อย่างเป็นทางการ โดยมี **hard gate ที่การกระทำ**: ต้องทำ RIASEC รอบสอง
> (REQ-007) ของสาขานั้นให้ **เสร็จ** ก่อน (ไม่ใช่ต้อง **ผ่าน**) และต้องทำใหม่ทุกครั้งที่เปลี่ยนสาขา
> เป้าหมาย → เพิ่มตารางใหม่ `public."TCompassTargetProgram"` + หมวดสัญญาใหม่ `## Target Major Rules`
> (additive ล้วน ไม่มีตารางของโมดูลนี้ถูกสร้างจริงตาม `status.md`) · **ยังเปิดไว้เป็น handoff ไม่ใช่
> คำถามที่บล็อก**: จำนวนเป้าหมายที่เก็บพร้อมกันได้ต่อคน (OQ-F14) และ UI/ตำแหน่งของปุ่ม (OQ-F15) —
> ดู Change Log entry ของรอบนี้สำหรับรายละเอียดครบ
>
> 🟢 **แก้ไขรอบที่เจ็ด (2026-09-02, Contract Version 8) — ปิด OQ-F02/OQ-F04/OQ-F11/OQ-F12 · re-scope
> OQ-F13**: `requirement.md` "แก้ไขรอบที่ 5" ปิดคำถามที่ `system-analyst` เปิดไว้ในเอกสารนี้ครบ 4 ข้อ
> จาก 5 ข้อที่ยังค้าง (1) **OQ-F02 ปิด — ไม่บล็อก**: ผู้ใช้รับความเสี่ยงเรื่องลิขสิทธิ์เอกสารหลักสูตร
> เอง (เป็นเอกสารสาธารณะดาวน์โหลดได้) — เป็น risk-acceptance ทางธุรกิจ ไม่ใช่คำวินิจฉัยทาง
> กฎหมาย/`security` (2) **OQ-F04 ปิดใหม่**: `sb-compass/requirement.md` เพิ่ม **REQ-018** —
> การถอด `sb-compass REQ-005`/`REQ-007` เป็น **trigger-based** (N=4 สัปดาห์หลัง REQ-011/REQ-012
> ของโมดูลนี้ deploy production จริง) แทนที่คำตอบเดิม (ถอดทันที ไม่มีช่วง deprecation) ที่ปิดไปเมื่อ
> 2026-08-31 (3) **OQ-F11 ปิดบางส่วน**: `W_LIKERT=W_RANK=1`, การแปลงอันดับเชิงเส้น, ทุกมิติต้องมี
> คำถามครบสองรูปแบบ — **ยืนยันตามที่เสนอ** · **แต่ปฏิเสธ (ง)**: กติกาเดิม "ต้องตอบครบ 100% จึงส่งได้"
> ยังคงอยู่ ห้ามส่งไม่ครบ (4) **OQ-F12 ปิด**: ผู้ใช้อนุญาตให้เลือกค่าเริ่มต้นทางวิศวกรรมทั้ง 6 ตัวของ
> `ClarityIndex`/`ClarityBand` เอง (5) **OQ-F13 ปิดแบบ re-scope ไม่ใช่ปิดตรง ๆ**: การปฏิเสธ (ง) ของ
> OQ-F11 ทำให้เกณฑ์เดิม "ตอบน้อยกว่า 50%" ไม่มีทาง trigger ได้จริงกับผลที่ส่งสำเร็จแล้ว (บังคับ 100%
> เสมอ) — **`system-analyst` ใช้สิทธิ์ตามที่ผู้ใช้มอบไว้ (OQ-F12/OQ-F13 sign-off) เลือก re-scope
> ตัวชี้วัด Confidence จากอัตราความครบ → ความสอดคล้องข้ามรูปแบบคำตอบ (Likert vs ranking รายมิติ)**
> เก็บโครงสูตร shrinkage เดิมไว้ทั้งหมด เปลี่ยนเฉพาะสัญญาณนำเข้า · ค่าคงที่ 3 ตัวเดิมยังเลือกเป็น
> engineering default ได้ **แต่เกณฑ์ threshold ของตัวชี้วัดใหม่เป็นคำถามใหม่ที่ยังไม่มีคำตอบ →
> เปิด OQ-F16** ไม่ใช่สิ่งที่ปิดไปพร้อมกัน — ดู `## Cluster Determination Rules` ข้อ 7 (เขียนใหม่
> ทั้งข้อ พร้อมเหตุผลของการ re-scope) และ Change Log ของรอบนี้สำหรับรายละเอียดครบ · **ยังไม่ปิด**:
> OQ-F01, OQ-F03 (ไม่อยู่ในรอบนี้)
>
> 🔴 **แก้ไขรอบที่แปด (2026-09-15, Contract Version 9) — reconcile `## Data Model` กับสคริปต์
> bootstrap จริงที่ผู้ใช้แก้เอง · PK ของตาราง master 7 ตัวเปลี่ยนจาก text code เป็น int identity**
> ผู้ใช้แก้ `C:\src\sb-web-student\ClassOnlineWeb\DatabaseScripts\Compass\bootstrap-sb-compass-db.sql`
> ด้วยตัวเองและยืนยันการเปลี่ยนแปลงไว้ในหัวไฟล์ (2026-09-15) — **ไฟล์นั้นคือ ground truth ของ schema
> และเอกสารนี้ถูก reconcile ตามมัน** ไม่ใช่การเปิดคำถามเรื่องชนิด PK ใหม่ · **นี่เป็นรอบแรกของเอกสารนี้
> ที่ `Compatibility: breaking`** (ทุกรอบก่อนหน้าเป็น additive) แม้ **Migration/backfill จะเป็น `none`**
> เพราะฐานถูก `DROP ... CASCADE` แล้วสร้างใหม่ทั้งก้อนตอนที่ยังไม่มีข้อมูลจริง — สองเรื่องนี้แยกกัน
> ห้ามสรุปว่า "ไม่มี migration = ไม่ breaking" · **กติกาใหม่ที่ตามมา**: code (`'C1'`, `'FG01'`, `'R'`,
> `'KMUTT'`, ...) ยังเป็นคีย์ของมนุษย์/seed/ผล AI เสมอ · Id เป็นคีย์ของฐานข้อมูลเท่านั้น ·
> **ห้ามส่ง Id ให้ AI ห้ามใส่ Id ในไฟล์ seed ห้าม hardcode Id** → RISK-F21 · **drift 2 จุดที่รอบนี้
> ไม่แก้และต้องให้คนตัดสิน**: `bigserial` vs `serial` ของตารางที่ "ไม่ถูกแตะ" (**OQ-F17**) และที่อยู่
> ฐานข้อมูล `PGGradeDB` vs `SB_Compass` (**RISK-F22**) — ดู Change Log ของรอบนี้สำหรับรายละเอียดครบ
>
> 🔴 **แก้ไขรอบ v11 (2026-09-16, Contract Version 11) — reconcile ที่อยู่ฐานข้อมูล (ปิด RISK-F22)
> + ปิด design gap ของ ISS-F03 (Module K)**: (1) **ที่อยู่ฐานข้อมูลถูก reconcile ตามที่ผู้ใช้ยืนยัน
> 2026-09-14** (บันทึกในหัวไฟล์ bootstrap) — ตารางใหม่ทั้ง 31 ตัวอยู่ใน **`SB_Compass`**
> (`10.0.0.128:9499` · `PGCompass_*`) และ **ตารางของ `sb-compass` เอง (3 ตัว) ก็อยู่ใน `SB_Compass`
> เช่นกัน** (ผู้ใช้ชี้ขาดเพิ่ม 2026-09-16: อยู่ใน PGCompass ไม่ใช่ `PGGradeDB` — Module C ต้องเปลี่ยน
> connection ก่อนสร้างจริง) · สิ่งที่คงอยู่ใน `PGGradeDB` คือตารางเกรด/SB PLUS เท่านั้น
> ~~legacy `compass_*`~~ *(v12 แก้: `PGGradeDB` ไม่มีตาราง Compass ใดเลย — ผู้ใช้ยืนยัน 2026-09-16 ·
> ตาราง snake_case ยุคแรกไม่เคยถูกสร้างในฐานข้อมูลใดมาก่อนตามที่ v5/OQ-F10 บันทึกไว้)* —
> ย่อหน้า **ที่อยู่** + `## DES-018` + `## DES-024` (PRE-F03/F04 และเพิ่ม PRE-F10) + RISK-F10/F11
> แก้พร้อมกันตามที่ RISK-F22 กำหนด · **ClassOnlineWeb ต้องเพิ่ม connection ใหม่** — ข้อสมมติ
> "ไม่ต้องเพิ่ม connection string" ไม่จริงอีกต่อไป (ยืนยันจากโค้ด: ไม่มี connection string ใดชี้
> `SB_Compass` ใน `configSource-prod.config` และไม่มีโค้ดอ่านคีย์ `PGCompass_*` เลย) (2) **ISS-F03**
> — design gap ที่โค้ด Module K บันทึกไว้ (`TryGetCreditPercentile` คืน `false` เสมอ +
> `CompositeMean`/`CompositeSd` ไม่มีแหล่งเก็บ) ตอบด้วย `## DES-022` ข้อ 1a ใหม่ (🔒 schema gate
> ฝั่ง `sb-compass` → OQ-F19) และช่องว่าง seed น้ำหนักที่สคริปต์ bootstrap ปฏิเสธการเดา (บรรทัด
> 579-585) ตอบด้วย §4a ใหม่ (เมทริกซ์ 11×8 / 11×6 ฉบับร่างใหม่ — 🔒 OQ-F18 เพราะค่าที่ sign-off
> เดิม 2026-08-31 **ไม่เคยถูกบันทึกลงไฟล์ใดเลย**) (3) เก็บถาวร Change Log v1-v10 ลง
> `design-archive.md` ตาม `policies/documentation.md` §4 + ย้าย RISK-F22 ฉบับเต็มไปเก็บ
> (4) **ผู้ใช้ตัดสินครบ 3 คำถามค้างของเอกสารในวันเดียวกัน (ตอบผ่านหน้าคำถามตรง)**: **OQ-F18** —
> มอบสิทธิ์ SA ยืนยันเมทริกซ์ §4a เป็น engineering default → seed น้ำหนักปลดล็อก · **OQ-F19** —
> เลือกทางเลือก A (ขยาย `public."TCompassLevelSubjectStat"` +4 คอลัมน์ คงสูตร 60/40) → เหลือ
> รอบ amend + implement ฝั่ง `sb-compass` · **OQ-F17** — ยึด DDL จริง `serial`/`integer` →
> DDL ใน `## Data Model` แก้ตรงทั้งชุด — **เอกสารตรงกับฐานข้อมูลจริงสมบูรณ์ ไม่มี material
> ambiguity เปิดอยู่** · คำถามเปิดที่เหลือของโมดูลไม่บล็อกการใช้งาน (OQ-F01 เนื้อหา · OQ-F09
> ที่เก็บไฟล์ · OQ-F15 UI ปุ่ม)
>
> 🔴 **แก้ไขรอบ v13 (2026-09-16, Contract Version 13) — ผู้ใช้ตัดสินทับกติกาที่เก็บ config ของ
> Curriculum Service: รวม config ทั้งหมดที่เดียว = `ClassOnlineWeb/prod.config`** — คำตอบมาจาก
> ผู้ใช้โดยตรง (ยืนยันซ้ำสองครั้งในวันเดียวกัน) · `prod.config` เติมบล็อกใหม่ท้าย appSettings แล้ว
> (`prod.config:147-152`): `ApiKey` (ค่าว่าง — ชื่อกลางที่ผู้ใช้เลือกเอง "เผื่อเปลี่ยนเจ้า/vendor") ·
> `Endpoint` (ว่าง) · `Model = glm-5.2` · `Curriculum_DatabaseUrl` (ว่าง) ·
> `Curriculum_PdfStoreEndpoint` (ว่าง) · ~~กลไกส่งค่า: `devops` ฉีดเข้า process ของ service เป็น env
> `CURRICULUM_*` ตอน launch (interface pydantic-settings ของ service **ไม่เปลี่ยน** — service
> ไม่แยกพาร์ส `prod.config` เอง)~~ *(v14 2026-09-16 ทับกลไกนี้ — service แยกพาร์ส `prod.config`
> เองโดยตรง ไม่มีขั้น env-injection — ดู banner v14 ด้านล่าง)* · **RISK-F05: ผู้ใช้ทราบ warning เรื่อง plaintext แล้วและตัดสินรับ
> ความเสี่ยงเอง (USER RISK ACCEPTANCE — รูปแบบเดียวกับ OQ-F02) ไม่ใช่การรับรองของ
> `system-analyst`** · **สิ่งที่ยังคงเดิม ไม่เปิดใหม่**: การแยกสอง codebase · ห้าม hardcode คีย์ใน
> ซอร์สทุกไฟล์ · `ClassOnlineWeb` ยังไม่มีโค้ดเรียก AI เด็ดขาด (service เรียกตอน import เท่านั้น) ·
> `/readyz` รายงานแค่ "มี/ไม่มีค่า" ห้ามรายงานค่า · กติกายุค D1 "คีย์อยู่ secret store ของ service
> ห้ามใส่ `prod.config`" **ถูกทับด้วยการตัดสินนี้** → Feasibility บล็อก 1 + `## DES-019` §1 + Module F
> Security Considerations + `## DES-024` (PRE-F01/F03/F10) + RISK-F01/F05/F11 แก้พร้อมกัน —
> ดู Change Log v13
>
> 🔴 **แก้ไขรอบ v14 (2026-09-16, Contract Version 14) — ผู้ใช้ตัดสินปรับกลไกส่งค่า config:
> Curriculum Service อ่าน `ClassOnlineWeb/prod.config` เองโดยตรง ไม่มีขั้น env-injection** —
> คำตอบมาจากผู้ใช้โดยตรง ("ให้ อ่านจาก prod.config แทนสิ" — หลังได้ยินคำอธิบายเรื่อง
> source-of-truth) · การตัดสินนี้**ปรับแต่ง v13 ไม่ทับแหล่งความจริง**: v13 คง `prod.config` เป็น
> source of truth แต่ยังส่งค่าด้วย env `CURRICULUM_*` ตอน launch — รอบนี้ขั้น env-injection ถูกตัด
> ออกทั้งขั้น · **กลไกใหม่**: service แยกพาร์ส XML `<appSettings>` ของ `prod.config` เอง
> (`ApiKey`→`glm_api_key` · `Endpoint`→`glm_endpoint` · `Model`→`glm_model` ·
> `Curriculum_DatabaseUrl`→`database_url` · `Curriculum_PdfStoreEndpoint`→`pdf_store_endpoint`) ·
> path = env `CURRICULUM_PROD_CONFIG_PATH` ทับได้ ไม่งั้น resolve `<repo-root>\ClassOnlineWeb\prod.config`
> จากตำแหน่ง package · ลำดับค่า: env `CURRICULUM_*` ที่ตั้งชัดเจน > XML > `.env` (legacy mirror) >
> defaults · ค่าว่างใน XML = ยังไม่ตั้งค่า · ไฟล์หาย = degrade แบบมี warning บูตต่อได้ ·
> **ความเชื่อมโยงที่ผู้ใช้รับไว้ (accepted coupling)**: process Python ต้องเข้าถึงไฟล์ prod.config
> ได้จากที่ deploy — ที่ deploy ของ PRE-F02 ยังเปิด ถ้า deploy นอกเครื่อง `CURRICULUM_PROD_CONFIG_PATH`
> ต้องชี้สำเนาไฟล์ที่ sync (ข้อจำกัด operation นี้ผู้ใช้รับเอง — RISK-F25) · **สิ่งที่ยังคงเดิม**:
> interface ของ service (ชื่อฟิลด์ · `/readyz` รายงาน presence-only · guard DSN ว่างของ migrator) ·
> ห้าม hardcode คีย์ · secret ไม่ถูก log · `ClassOnlineWeb` ยังไม่มีโค้ดเรียก AI · งานของ `devops`
> แคบลงเหลือ deploy ให้ path resolve ได้ (หรือตั้ง `CURRICULUM_PROD_CONFIG_PATH`) — **PRE-F10 ยัง
> เป็นงานแยกของตัวเอง** · เงื่อนไขบล็อกคงเดิม: ผู้ใช้เติม `ApiKey` + `Endpoint` → Feasibility บล็อก 1 +
> `## DES-019` §1 + Module F Security Considerations + `## DES-024` (PRE-F01) + RISK-F05/F25 แก้
> พร้อมกัน — ดู Change Log v14

> **การอ้างถึงข้อกำหนด/ข้อออกแบบของอีกโมดูล** — กติกาเดียวกับ `requirement.md`
> `REQ-0NN` / `DES-0NN` เฉย ๆ = ของ **โมดูลนี้** · ของโมดูลเดิมเขียนเต็มว่า
> **`sb-compass REQ-0NN`** / **`sb-compass DES-0NN`** เสมอ

> **หมายเหตุเรื่อง stack — อ่านก่อนใช้เอกสารนี้**
> โมดูลนี้กินพื้นที่ **สอง codebase** ไม่ใช่หนึ่ง
> 1. **`ClassOnlineWeb`** (Target ปัจจุบัน `C:\src\sb-web-student\ClassOnlineWeb`) — **ASP.NET MVC 5 +
>    Web API 2 · .NET Framework 4.8 · EF6 · PostgreSQL ผ่าน Npgsql 4.1.13 · Razor + jQuery**
>    (ยืนยันจาก `ClassOnlineWeb.csproj` และ `packages.config:10,37`) · เป็นที่อยู่ของ **ฝั่งนักเรียน**
> 2. **Curriculum Service** (ของใหม่ ยังไม่มีในระบบ) — **Python + FastAPI** · เป็นที่อยู่ของ
>    **หลังบ้านคลังหลักสูตรทั้งหมด** (นำเข้า · แปลง · เรียก AI · หน้าจอตรวจ/อนุมัติ)
>
> ไฟล์ที่ `policies/coding.md` §9 กำหนดให้เป็นแหล่งความจริงของ stack
> (`.claude/agents/frontend-engineer.md` / `backend-engineer.md`) **ไม่มีอยู่ใน workspace นี้**
> stack ข้างบนจึงยืนยันจาก Target จริง ตรงกับที่ `sb-compass/design.md` บันทึกไว้และผู้ใช้ยืนยันแล้ว
>
> `## Data Model` ด้านล่างจึงเขียนเป็น **PostgreSQL DDL จริง ไม่ใช่ Prisma schema** ตามแนวเดียวกับ
> `sb-compass` — เพราะสัญญาต้องเทียบกับของจริงได้ · **ผลที่ตามมา**: `setup` agent ไม่ต้องรันกับ
> `ClassOnlineWeb` (ระบบมีอยู่แล้ว) แต่ **Curriculum Service เป็นโปรเจกต์ใหม่จริง ๆ**

---

## Feasibility Summary

**ทำได้ทั้ง 15 REQ (REQ-001..REQ-015)** ในกรอบ stack เดิม (`ClassOnlineWeb` + Curriculum Service
Python/FastAPI ที่ยังไม่มีอยู่จริง) — **แก้ไข 2026-08-31 (ยืนยันรอบที่สองในวันเดียวกัน)**: ผู้ใช้ปิด
OQ-F03/OQ-F06/OQ-F07 เป็น **confirmed** ครบทั้งสามข้อแล้ว → สูตร T-Score, สูตรรวม cluster, และ
ตารางน้ำหนักใน `## Cluster Determination Rules` **ไม่ใช่ข้อเสนอที่รอยืนยันอีกต่อไป** เหลือเพียง
**1 dependency เชิงการดำเนินการ (ไม่ใช่การตัดสินใจ)**: คอลัมน์ `stddev_score` ที่ `sb-compass` ต้อง
เพิ่มยังไม่ถูกสร้างจริง (ดู RISK-F14/DEP-F09) นอกเหนือจากบล็อกเดิม 3 จุดของรอบที่ 1 ที่ยังไม่ปิด
(คีย์ `glm-5.2`, `sb-compass` OQ-15, Curriculum Service ยังไม่มีอยู่จริง — ดูรายละเอียดเดิมใน
`## Risks & Dependencies`)

✅ **ปิดแล้ว (2026-08-31) — สูตร T-Score + สูตรรวม cluster (เดิมคือ "บล็อกใหม่ 2")** · ผู้ใช้ยืนยัน
ข้อเสนอของเอกสารนี้ทั้งหมดตามที่เสนอไว้ ไม่มีการปรับ: (1) T-Score ตีความ "คะแนนดิบ 60% + หน่วยกิต
40%" ตามที่เอกสารนี้เสนอ (ดู `## Cluster Determination Rules` ข้อ 1) (2) **`TScore_s` คำนวณครั้งเดียว
ต่อ (นักเรียน × กลุ่มสาระ) แล้วใช้ซ้ำในสูตรรวมของทั้ง 11 cluster — ไม่คำนวณแยกหลายชุด · และใช้
เฉพาะในการเลือก cluster เท่านั้น ไม่แตะกลไก `TARGET_SCORE = 75` ที่จัดอันดับสาขา/โปรแกรม** (ยืนยัน
ผ่าน coordinator relay 2026-08-31 — ดู `## Cluster Determination Rules` ข้อ 1 และ 5) (3) สูตรรวม
cluster = 50% T-Score (academic-fit) + 50% RIASEC (interest-fit) แสดง top-3 cluster ตามที่เสนอเลย
ไม่มีการปรับ → กติกาอยู่ที่ `## Cluster Determination Rules` ทั้งหมดแล้ว เป็น Contract ที่ implement
ได้ทันที (ไม่ติด OQ-F03 อีกต่อไป)

✅ **ปิดแล้ว (2026-08-31) — ตารางน้ำหนัก cluster↔subject/cluster↔RIASEC (เดิมคือ OQ-F07)** · ผู้ใช้
sign-off ให้ใช้ค่าที่ `system-analyst` ร่างจาก `education-pathway-taxonomy-design.md` ได้เลย —
**สถานะยังเป็น "สมมติฐานที่ไม่มีแหล่งอ้างอิงภายนอกยืนยัน" เหมือนเดิมตาม policy การจัดการสมมติฐาน**
การ sign-off นี้คือ "อนุญาตให้เริ่มใช้งานได้" ไม่ใช่ "ยกเว้นการติดป้ายสมมติฐาน" → ยังคงเห็นป้ายนี้ใน
`## Data Model` และ RISK-F15 ต่อไป เพียงแต่ไม่บล็อกการ implement แล้ว

⚠️ **เหลือเฉพาะการ implement — คำถามเปิดปิดหมดแล้วทั้งสองฝั่ง (เดิมคือ "บล็อกใหม่ 1" / OQ-F06)** ·
`sb-compass REQ-017` + **`sb-compass/design.md` v6**: DDL `stddev_score` · `## National Stats Batch
Rules` § `stddev_score` (**สูตร population stddev · `MIN_N_FOR_STDDEV = 30` · กติกา `NULL` vs `0` ·
กับดัก `EnsureTables`** — ทั้งหมดยืนยันโดยผู้ใช้ 2026-08-31) และ **กติกา fallback ฝั่งผู้บริโภคของ
เอกสารนี้** (`## Cluster Determination Rules` ข้อ 2) · **ผลคือ Module K เขียนโค้ดได้แล้ว** — สิ่งที่
เหลือคือ **คอลัมน์ต้องถูกสร้างและคำนวณจริงในฐานข้อมูลก่อน Module K จะรันได้** → ดู **DEP-F09**

📝 **ข้อกำหนดใหม่ที่ต้องส่งต่อ (ไม่ใช่ความเสี่ยง)**: ผู้ใช้ตัดสินว่า **ห้ามใช้คำว่า "เทียบระดับประเทศ"**
กับ T-Score อีกต่อไป ให้เปลี่ยนเป็นถ้อยคำที่สื่อว่าเทียบกับ **ฐานข้อมูลนักเรียนในระบบ SchoolBright**
→ **WORD-F01** (ท้าย `## Risks & Dependencies`) · ผู้รับงานคือ `uxui-designer`/`frontend-engineer`
· **`business-analyst` ต้องปรับถ้อยคำใน `requirement.md` REQ-013 ให้ตรงด้วย** — เอกสารนี้แก้เองไม่ได้

✅ **ปิดแล้ว (2026-08-31) — OQ-F04 / cross-module sync กับ `sb-compass`** · `sb-compass/requirement.md`
ระบุแล้วว่า **REQ-005/REQ-007 ถูกแทนที่ทันทีโดย REQ-011/REQ-012 ของโมดูลนี้ ไม่ปล่อยรันคู่ขนาน**
(เนื้อหาเดิมคงไว้แบบขีดฆ่าเพื่อประวัติ) → เอกสารสองโมดูลไม่ขัดกันแล้วในระดับ requirement ·
**สิ่งที่ยังเหลือฝั่งนั้น**: `sb-compass/design.md` และ `plan.md` อาจยังมีงานที่อ้างอิง REQ-005/REQ-007
อยู่ — เป็นขอบเขตของ `system-analyst`/`project-manager` รอบที่รันกับโมดูล `sb-compass` (DEP-F08)

🟢 **อัปเดต 2026-09-02 (รอบที่เจ็ด, Contract Version 8) — OQ-F11/OQ-F12 ปิดแล้ว · OQ-F13 ปิดแบบ
re-scope**: (1) **แบบผสม (ranking + Likert)** — **ปิด (ก)(ข)(ค) ของ OQ-F11 แล้ว**: `W_LIKERT =
W_RANK = 1`, การแปลงอันดับเป็นเชิงเส้นระยะห่างเท่ากัน, ทุกมิติต้องมีคำถามครบสองรูปแบบ ยืนยันตามที่
เสนอทั้งหมด — **แต่ (ง) "อนุญาตให้ส่งไม่ครบได้" ถูกปฏิเสธ** กติกาเดิม "ต้องตอบครบ 100%" ยังคงอยู่
(2) **relative/adaptive scoring (`ClarityIndex`)** — **ปิด OQ-F12 แล้ว**: ผู้ใช้อนุญาตให้
`system-analyst` เลือกค่าเริ่มต้นทางวิศวกรรมทั้ง 6 ตัว implement ได้เต็มชั้นแสดงผลแล้ว (3)
**Confidence/shrinkage** — **การปฏิเสธ (ง) ของ OQ-F11 ทำให้เงื่อนไขเดิม "ตอบน้อยกว่า 50%" ไม่มีทาง
เกิดขึ้นได้จริงกับผลที่ส่งสำเร็จแล้ว** (บังคับ 100% เสมอ) `system-analyst` จึง **re-scope ตัวชี้วัด
Confidence ใหม่จากอัตราความครบ → ความสอดคล้องข้ามรูปแบบคำตอบ (Likert เทียบ ranking รายมิติ)** เก็บ
โครงสูตร shrinkage เดิมไว้ · ค่าคงที่ 3 ตัวเดิม (`NEUTRAL_SCORE`/`CONF_F_MIN`/`CLARITY_F_MIN`) ยัง
เลือกเป็น engineering default ได้ตามที่อนุญาตไว้ แต่ **เกณฑ์ threshold ของตัวชี้วัดใหม่เป็นค่าใหม่ที่
ยังไม่มีจากผู้ใช้ → เปิด OQ-F16** · **ผลรวม: ชั้นแสดงผลของข้อ (2) implement ได้เต็มแล้ว ข้อ (3)
implement ได้เฉพาะสถิติดิบ ส่วนชั้นแสดงผล (`"DisplayScore"`) ยังรอ OQ-F16** (ดู RISK-F19 ที่แก้ไข
แล้ว) — รายละเอียดทั้งหมดอยู่ที่ `## RIASEC Fit Rules` ข้อ 1/3.4, `## Cluster Determination Rules`
ข้อ 6-7, และ Change Log รอบนี้

🟢 **ใหม่ (2026-09-02, Contract Version 7) — REQ-017 "ตั้งเป็นเป้าหมาย"** · **straightforward** —
persistence ของ gate (`public."TCompassRiasecResult"."ProgramID"`) มีอยู่แล้วจาก REQ-007/REQ-012
รอบก่อนหน้า จึงไม่ต้องออกแบบตารางเก็บผลใหม่ เพิ่มเฉพาะตารางสถานะ `public."TCompassTargetProgram"`
+ gate check ที่ `## Target Major Rules` (ใหม่) · **ไม่มีบล็อกทางเทคนิค** เหลือเพียง 2 รายการที่
`requirement.md` ยืนยันเองว่าไม่ใช่คำถามธุรกิจที่ต้องรอผู้ใช้ (OQ-F14 จำนวนเป้าหมายพร้อมกัน ·
OQ-F15 หน้าตาปุ่ม) — ทั้งสองเป็น handoff ไปยัง `uxui-designer` ไม่บล็อก backend

**จุดที่ยังไม่ยาก และมาจากรอบที่ 1 อยู่แล้ว**: การอ่านคะแนน REQ-012 มาใช้ต่อ (Module E) ·
โครงสร้าง 2-codebase เดิมยังใช้ได้ทั้งหมด ไม่ต้องเปลี่ยน stack · Import/Admin/Approval flow (REQ-001
ถึง REQ-004) ไม่กระทบจากรอบนี้เลย เปลี่ยนแค่ "ผูกกับ cluster อะไร" แทน "ผูกกับสายอะไร" (REQ-014)

🔴 **บล็อก 1 — คีย์ `glm-5.2` ยังไม่มีอยู่จริง** · ตรวจไฟล์จริงแล้ว: `Web.config:14` อ่าน
`<appSettings file="prod.config">` และใน `prod.config` **ไม่มีคีย์ที่เกี่ยวกับ AI/LLM เลยสักตัว**
คีย์ Compass ที่มีอยู่ตัวเดียวคือ `Compass_Recompute_AllowedIPs` (ค่าว่าง) → ดู **RISK-F01** ·
~~หลังการตัดสิน D1 คีย์นี้ย้ายไปอยู่ที่ **config ของ Curriculum Service ไม่ใช่ `prod.config`**~~ ·
**v13 (2026-09-16 — ผู้ใช้ตัดสินทับ)**: แหล่งค่าเดียว = บล็อกใหม่ใน `prod.config` (`ApiKey` · `Endpoint` ·
`Model` — คีย์มีอยู่แล้ว ค่าว่างรอผู้ใช้เติม `prod.config:148-150`) · ~~`devops` ฉีดเป็น env
`CURRICULUM_*` ตอน launch~~ · **v14 (2026-09-16 — ผู้ใช้ตัดสิน "ให้ อ่านจาก prod.config แทนสิ")**:
service แยกพาร์ส XML ของ `prod.config` เองโดยตรง ไม่มีขั้น env-injection (path =
`CURRICULUM_PROD_CONFIG_PATH` ทับได้ — RISK-F25) → ดู **PRE-F01** (สถานะบล็อกคงเดิม — ยังเขียน
integration ไม่ได้จนค่าครบ)

🔴 **บล็อก 2 — REQ-009 รับมรดกการบล็อกของ `sb-compass` มาเต็ม** · `CheckEntitlement` ยังเขียนไม่ได้
เพราะ `sb-compass` OQ-15(a1)/(a2) (ตาราง `TFeatureSBPlus` ไม่มีคอลัมน์ feature key แบบ string)
ในโค้ดจริงยังเป็น `TODO(BE-007)` ที่ `CompassApiController.cs:302,320` → **ฝั่งนักเรียนทั้งหมด
(Module H · I-b · J) กั้นสิทธิ์ไม่ได้จนกว่า OQ-15 จะปิด** และนี่ไม่ใช่สิ่งที่โมดูลนี้แก้เองได้ → **RISK-F04**
· **แต่หลังการตัดสิน D2 ครึ่งหลังบ้าน (Module F · G · I-a) หลุดจากบล็อกนี้แล้ว เริ่มได้ทันที**

🔴 **บล็อก 3 — Curriculum Service ยังไม่มีอยู่จริง** ต้องตั้งโปรเจกต์ · deploy · เปิด network เข้า
~~`PGGradeDB`~~ **`SB_Compass`** *(v12 แก้: ตาม PRE-F03 — ตาราง Compass ทุกตัวอยู่ `SB_Compass`
ผู้ใช้ยืนยัน 2026-09-16 จุดนี้ตกค้างจากก่อน v11)* · ต่อ SSO ภายใน ก่อนงานเขียนโค้ดใด ๆ ของ Module F จะรันได้ → `## Deployment Prerequisites`

✅ **จุดที่ requirement ขัดกันเองในรอบที่ 1 และเอกสารนี้เคยขยายความให้ (ผู้ใช้ยืนยันแล้ว 2026-08-26)** ·
REQ-002 ข้อ 2 บังคับว่าโปรไฟล์พฤติกรรมเป็น **ข้อความบรรยาย** และห้ามเป็นตัวอักษร MBTI · แต่ REQ-007
บังคับให้ออก **"% ความเหมาะสม"** จากการเทียบคำตอบเด็กกับโปรไฟล์นั้น — **เทียบตัวเลขกับข้อความบรรยาย
ไม่ได้** → รอบที่ 1 แก้ด้วยเวกเตอร์แกนพฤติกรรม 8 แกนที่ระบบออกแบบเอง **รอบที่ 2 (2026-08-31) แทนที่
กลไกนั้นทั้งหมดด้วย 6 มิติ RIASEC มาตรฐาน** ซึ่งแก้ปัญหาเดียวกันได้และเป็นมาตรฐานภายนอกแทนของที่คิดเอง
→ `## RIASEC Fit Rules` (เดิมชื่อ `## Behavior Fit Rules`)

**จุดที่ไม่ยาก และยืนยันแล้วว่าไม่ต้องกลัว**: การอ่านคะแนน REQ-012 มาใช้ต่อ — เมธอดถ่วงน้ำหนัก
พร้อม fallback **มีอยู่จริงแล้วในโค้ด** (`CompassScoreService.cs:250`) และ fallback อยู่ในเมธอด
เดียวกัน (`:264-266`) → เรียกแล้วได้กติกาครบโดยอัตโนมัติ ไม่มีทางเกิดสูตรชุดที่สอง

**รอบที่ 1 ไม่มีการแก้ตารางเดิมแม้แต่คอลัมน์เดียว** — เป็นการเพิ่มตารางใหม่ล้วน (additive) และการ
refactor เมธอดหนึ่งตัวใน `ClassOnlineWeb` ให้เรียกได้จากภายนอก class · **รอบที่ 2 ยังคงหลักการนี้
สำหรับตารางของโมดูลนี้เอง** — ข้อยกเว้นเดียวคือ REQ-013 (T-Score) ต้องการคอลัมน์เพิ่มที่ตาราง
`public."TCompassLevelSubjectStat"` ของ **`sb-compass`** ซึ่ง **ผู้ใช้ยืนยันทิศทางแล้ว (OQ-F06 = ทางเลือก A,
additive/nullable column)** แต่คอลัมน์จริงยังไม่ถูกสร้าง — ดู RISK-F14/DEP-F09

---

## Feature-by-Feature Feasibility

| ID | ครอบคลุม | คำวินิจฉัย | หมายเหตุ |
|---|---|---|---|
| **DES-001** | REQ-001 | **needs new service** | markitdown เป็น Python package แต่ `ClassOnlineWeb` เป็น .NET FW 4.8 · ทั้งโปรเจกต์ **ไม่มี `Process.Start` ไม่มี Python ไม่มี `HttpClient`** (มี `RestSharp` ใช้ที่เดียวคือ `HomeVisitController`) → เรียกตรงไม่ได้ · ตัดสินแล้ว (D1) = **Curriculum Service แยก (Python/FastAPI)** · เก็บทั้งไฟล์ต้นฉบับและข้อความที่แปลงแล้วตาม REQ-001 |
| **DES-002** | REQ-002 | **needs new dependency (external AI) · feasible-with-risk** | `glm-5.2` เป็นบริการภายนอกตัวแรกของสายงาน Compass · **คีย์ยังไม่มีในระบบจริง → RISK-F01** · เรียกครั้งเดียวตอน import แล้ว cache — ห้ามเรียกตอนเด็กเปิดหน้าจอเด็ดขาด · ผล AI ต้อง validate กับ **8 ชื่อกลุ่มสาระ canonical เป๊ะ ๆ** ไม่งั้นจับคู่กับคะแนนเด็กไม่ได้ (→ RISK-F08) |
| **DES-003** | REQ-003 | **straightforward (ใน service ใหม่)** | สถานะ + คิวตรวจ + สิทธิ์อนุมัติ อยู่ใน Curriculum Service ทั้งหมด · **ไม่ติด `sb-compass` OQ-15** เพราะไม่ได้ใช้ `CheckEntitlement` · กติกาสถานะ/เงื่อนไขอนุมัติอยู่ที่ `## Admin & Review Rules` |
| **DES-004** | REQ-004 | **straightforward** | ทำได้ด้วย `analysis_status` + `is_manual` บนแถวน้ำหนัก/แกน · **ข้อสำคัญคือข้อห้าม**: สาขาที่ยังไม่ `approved` ต้อง **ไม่โผล่ในผลของเด็กเลย** ไม่ใช่โผล่แบบข้อมูลว่าง |
| **DES-005** | REQ-005 (แก้ไข 2026-08-31 โดย REQ-011) | **straightforward** | ตัวกรองชั้นแรกเปลี่ยนจาก `CompassPathCatalog.RankPaths()` (8 path) เป็น **`Module K` — จัดอันดับ 11 interest cluster** ตาม `## Cluster Determination Rules` · **คะแนนเด็กยังใช้เมธอดเดิมชุดเดียว** (Module E) ไม่เปลี่ยน · `CompassPathCatalog.cs` **เลิกใช้ในสายงานนี้** แต่ไม่ต้องลบไฟล์ (อาจยังถูกใช้ที่อื่นใน `sb-compass` เดิม — ไม่ใช่ขอบเขตของเอกสารนี้) |
| **DES-006** | REQ-006 | **straightforward — ไม่เปลี่ยนจากรอบที่ 1** | คำนวณสดทุก request จากข้อมูล approved ที่ cache ไว้ + คะแนนปัจจุบัน · ไม่เก็บผลจับคู่ลง DB · สูตร/การตัดสินกรณีขอบอยู่ที่ `## Program Matching Rules` (ยังใช้ `TARGET_SCORE = 75` เดิมสำหรับจัดอันดับ**ภายใน**คลัสเตอร์ — คนละหน้าที่กับ T-Score ของ REQ-013 ที่ใช้**เลือกคลัสเตอร์**) |
| **DES-007** | REQ-007 (แทนที่ทั้งหมด 2026-08-31 โดย REQ-012) | **straightforward — เปลี่ยนกลไกจากแกนพฤติกรรมที่ออกแบบเอง (8 แกน) เป็น RIASEC มาตรฐาน (6 มิติ)** | เดิม (รอบที่ 1) ใช้เวกเตอร์แกนพฤติกรรม 8 แกนที่ระบบออกแบบเอง (D11 — ดู `design-archive.md`) เพื่อแก้ปัญหา "ข้อความบรรยายเทียบตัวเลขไม่ได้" · **รอบที่ 2 แทนที่ด้วย 6 มิติ RIASEC มาตรฐาน** ซึ่งแก้ปัญหาเดียวกันได้และเป็นมาตรฐานที่ยืนยันได้ภายนอก ไม่ใช่ของที่ระบบคิดเอง → กติกาอยู่ที่ `## RIASEC Fit Rules` (เดิมชื่อ `## Behavior Fit Rules`) |
| **DES-008** | REQ-008 | **straightforward — ไม่เปลี่ยนจากรอบที่ 1 ยกเว้นชื่อคอลัมน์อ้างอิง** | quest ผูกกับ **มิติ RIASEC แทนแกนพฤติกรรมเดิม** ไม่ใช่สาขา → เขียนครั้งเดียว ~8-24 ชิ้น (D6) ใช้ได้ทุกสาขาทุกมหาวิทยาลัยตลอดไป · `public."TCompassQuest"."ProgramID"` คงไว้เผื่ออนาคตแต่ **รอบนี้ต้องเป็น NULL เสมอ** |
| **DES-009** | REQ-009 | 🔴 **blocked — ไม่เปลี่ยนจากรอบที่ 1** | ใช้ `CheckEntitlement` ตัวเดียวกับ `sb-compass REQ-013` ซึ่ง **ยังเขียนไม่ได้** (OQ-15(a1)/(a2)) → RISK-F04 · **การกั้นสิทธิ์แอดมินไม่ใช่ข้อนี้** — ทีมงานภายในเป็นคนละแถวใน Target Users และใช้ SSO ของ service ใหม่แทน |
| **DES-010** | REQ-010 | **straightforward — ไม่เปลี่ยนจากรอบที่ 1** | ทุก endpoint ฝั่งนักเรียนยึด `UserData.UserID`/`CompanyID` เท่านั้น · **Curriculum Service ไม่มีสิทธิ์เข้าถึงตารางนักเรียนเลย** เป็นการบังคับ REQ-010 ที่ระดับสถาปัตยกรรม ไม่ใช่ระดับ code review |
| **DES-011** | REQ-011 | **straightforward — schema ล้วน ไม่กระทบ backend logic อื่น** | ต้อง seed ตาราง `public."TCompassInterestCluster"` (11 แถว) + `public."TCompassFacultyGroup"` (26 แถว) + mapping `public."TCompassClusterFacultyGroup"` (M:N, `"IsPrimary"`) จาก `education-pathway-taxonomy-design.md` ส่วน C และ D ตรง ๆ — **เนื้อหาการ mapping นี้เป็นข้อเสนอของเอกสาร taxonomy เอง ไม่มีแหล่งอ้างอิงภายนอก** (ยอมรับความเสี่ยงนี้ไว้แล้วตามที่ผู้ใช้ยืนยันใช้เอกสารนี้เป็นฐาน — `requirement.md` References) |
| **DES-012** | REQ-012 | **feasible-with-risk — เนื้อหาคำถามยังไม่ผ่านตรวจ · v6: เพิ่มรูปแบบคำถามที่สอง** | schema แทนที่ `compass_behavior_*` ด้วย `TCompassRiasec*` ตรงไปตรงมา (ดู `## Data Model`) · **เนื้อหาคำถาม RIASEC จริงอยู่ที่ UI mockup ที่ยังไม่มีใครตรวจ** (`requirement.md` References) → ส่งต่อ `uxui-designer` ตรวจก่อนใส่ข้อมูลจริงลงตาราง `public."TCompassRiasecQuestion"` ไม่ใช่งานของ `system-analyst`/`backend-engineer` · **v6 (2026-08-31, `requirement.md` รอบที่ 3)**: เพิ่ม **แบบเรียงลำดับ** คู่กับ Likert → ตารางใหม่ `public."TCompassRiasecRankBlock"`/`public."TCompassRiasecRankOption"` + คอลัมน์ `"RankAnswers"` · สูตรผสมอยู่ที่ `## RIASEC Fit Rules` ข้อ 3 · **`uxui-designer` ต้องตรวจเนื้อหาของ *ทั้งสองรูปแบบ*** และต้องคุมให้ทุกมิติมีคำถามครบทั้งสองรูปแบบเท่าที่ทำได้ (RISK-F18) |
| **DES-013** | REQ-013 | 🟡 **feasible — ออกแบบครบทุกด้านแล้ว (2026-08-31) เหลือรอ implement ข้ามโมดูล** | สูตร T-Score, การตีความ "คะแนนดิบ 60% + หน่วยกิต 40%", **ขอบเขตการใช้ (เลือก cluster เท่านั้น ไม่แตะ `TARGET_SCORE`)** และ **กติกา fallback เมื่อ `"StddevScore"` = `NULL`/`0`** **confirmed ครบ** (ดู `## Cluster Determination Rules` ข้อ 1, 2, 5) · **ที่เหลือไม่ใช่งานออกแบบแล้ว**: คอลัมน์ `"StddevScore"` ต้องถูก implement จริงฝั่ง `sb-compass` (REQ-017 · design Contract Version 8 เสร็จแล้ว · Module C ของโมดูลนั้น) → RISK-F14, DEP-F09 · **v11 อัปเดต (2026-09-16, ISS-F03)**: งานออกแบบเปิดใหม่ 2 จุดแล้ว **ปิดคำถามครบในวันเดียวกัน** — `## DES-022` §1a (คอลัมน์ credit/composite — ✅ OQ-F19 ปิด เลือกทางเลือก A เหลือ amend+implement ฝั่ง `sb-compass`) และ §4a (เมทริกซ์น้ำหนัก — ✅ OQ-F18 ปิด มอบสิทธิ์ SA) ดู RISK-F24 |
| **DES-014** | REQ-014 | **straightforward** | เปลี่ยนจากผูก `compass_program_path` (8 path, superseded) เป็นผูก `public."TCompassProgramCluster"` (11 cluster, M:N, AI เสนอ+คนแก้ได้ ตามแนวทางเดิมของ D3) + เพิ่มคอลัมน์ `"FacultyGroupID"` บน `public."TCompassProgram"` (1:N จาก `public."TCompassFacultyGroup"` · **v9: เป็น `integer` ชี้ `"FacultyGroupID"` ที่เป็น int identity — AI ยังคืนเป็น code แล้ว service แปลงเป็น Id ด้วย `"FacultyGroupCode"`**) · **AI ต้องคืนผลเพิ่ม 1 ก้อน**: กลุ่มความสนใจที่เกี่ยวข้อง แทนที่ "รายการสายที่เสนอ" เดิม |
| **DES-015** | REQ-015 | 🟡 **feasible — สูตร/ตารางน้ำหนักยืนยันแล้ว (2026-08-31) แต่ Module K รอคอลัมน์ข้ามโมดูล** · ส่วน schema ของ L2/L3/L3.5/L6 เอง **straightforward** | schema เต็มรูปแบบ (L1-L6 + L3.5) เขียนได้ทันทีเพราะเป็นตารางใหม่ล้วน ไม่กระทบของเดิม — เนื้อหาจริงของ L2/L3/L3.5/L6 ยังไม่มีแหล่งข้อมูล (ตามที่เอกสาร taxonomy ยอมรับไว้ในหัวข้อ I.4) → สร้างแบบ**ว่างเปล่าไว้ก่อน** ไม่บล็อกการ ship Module F/G/H/I-a/I-b (เหมือน OQ-F01 เดิม) · **Module K เองไม่ติดคำถามเปิดแล้ว** (OQ-F03/F06/F07 ปิดหมด) เหลือรอเฉพาะ DEP-F09 (คอลัมน์ `"StddevScore"` ที่ `sb-compass` ต้องเพิ่ม) |
| **DES-016** *(ใหม่ v6, 2026-08-31)* | REQ-016 | ✅ **ไม่มีอะไรต้องออกแบบเพิ่ม — ยืนยันสิ่งที่สัญญามีอยู่แล้ว** | REQ-016 ปิดน้ำหนัก **Interest : Readiness = 50/50** ซ้ำอีกครั้ง (ปฏิเสธข้อเสนอ 60/40) — ตรงกับ `CombinedScore(c) = 0.5 × AcademicFit + 0.5 × InterestFit` ที่ `## Cluster Determination Rules` ข้อ 3 ยืนยันไปแล้วตั้งแต่ Contract Version 3 · **ผลของรอบนี้คือปิดข้อ C4 ของคำวินิจฉัยที่ `sb-compass/design.md` (ADAPT 🧑 — เสนอเปลี่ยนเป็น `PI^0.6 × PR^0.4`) ให้กลายเป็น REJECT โดยผู้ใช้เอง** ห้าม `system-analyst`/engineer รอบหลังเปิดใหม่โดยอ้างเอกสารร่าง · **ส่วนที่ยังเปิดอยู่ของ OQ-F03 (การจัดการคะแนนเสมอ/ใกล้เคียงข้ามกลุ่ม) ไม่ใช่เรื่องน้ำหนัก** — ตอบด้วย `ClarityIndex` ของข้อ 6 แทน |
| **DES-017** *(v7 · ปรับปรุง 2026-09-15)* | REQ-017 | **straightforward** | "ตั้งเป็นเป้าหมาย" ใช้ตาราง `public."TCompassTargetProgram"` + gate check ผ่าน `TCompassRiasecResult` · ✅ **2026-09-15 ปิด OQ-F14**: นักเรียน 1 คนมีเป้าหมาย active ได้สูงสุด 1 รายการเท่านั้น (AC-017.4) การตั้งเป้าหมายใหม่จะ supersede แถวเดิมอัตโนมัติ |
| **DES-026** *(ใหม่ 2026-09-15)* | REQ-018 | **straightforward** | แท็บ "แผนพัฒนา" (Development Plan) หลังตั้งเป้าหมาย: Gap Analysis รายวิชากับเกณฑ์สาขาเป้าหมาย (`TARGET_SCORE = 75.0`) คำนวณจากคะแนนกลุ่มสาระถ่วงน้ำหนักที่มีอยู่เดิม + คำถาม/แบบฝึกหัดทบทวน 4 ข้อเพื่อพัฒนาตนเอง + บล็อกแนะนำตัวช่วย (Orbit Tutor) · ดู `## DES-026 — Development Plan Contract` |

### บันทึกอ้างอิง — การตัดสินใจของรอบที่ 1 (D1-D11)

**ย้ายไปที่ `design-archive.md` แล้ว** (catch-up archival ตอน amend รอบที่ 2 ตาม
`policies/documentation.md` §4) — กติกาที่เกิดจากการตัดสินใจเหล่านั้นยังมีผลอยู่ครบใน
`## Import Rules`, `## Program Matching Rules`, `## Database Ownership Boundary`, `## Modules`
ด้านล่าง เปิดอ่านไฟล์นั้นเฉพาะเมื่อต้องการรู้เหตุผล/ทางเลือกที่ถูกตัดทิ้งของรอบที่ 1

### ข้อเสนอของรอบที่ 2 — ปิดเป็น confirmed แล้ว (2026-08-31)

**ย้าย Q&A (P-F01–P-F04) ไปที่ `design-archive.md` แล้ว** (ผู้ใช้ยืนยันปิด OQ-F03/OQ-F06/OQ-F07
ทั้งหมดในวันเดียวกับที่เสนอ — decision settled ตาม `policies/documentation.md` §4) — กติกาที่ยืนยัน
แล้วอยู่ที่ `## Cluster Determination Rules` (สูตร T-Score, สูตรรวม cluster, ตารางน้ำหนัก) ทั้งหมด
เป็น Contract ที่ implement ได้แล้ว **ยกเว้น DEP-F09** (คอลัมน์ `stddev_score` ที่ `sb-compass` ต้อง
เพิ่มยังไม่ถูกสร้างจริง — ทิศทางปิดแล้ว แต่การดำเนินการยังไม่เสร็จ)

---

## Data Model

> **ไม่ใช่ Prisma โดยเจตนา** — ดูหมายเหตุเรื่อง stack ด้านบน
> **รอบที่ 2 (2026-08-31) — schema ของโมดูลนี้เองยังคง additive ล้วน** (ตารางใหม่ทั้งหมด ไม่มีข้อมูล
> จริงถูก implement มาก่อนตามที่ `status.md` ยืนยัน จึงไม่มีข้อมูลสูญหายแม้จะรื้อโครงจากรอบที่ 1) —
> **ข้อยกเว้นเดียว**: T-Score (REQ-013) ต้องเพิ่มคอลัมน์ `"StddevScore"` ที่ตาราง
> `public."TCompassLevelSubjectStat"` ของ **`sb-compass`** (additive/nullable แต่เป็นตารางที่โมดูลนี้
> ไม่ได้เป็นเจ้าของ) — **ยืนยันทิศทางแล้ว (OQ-F06 = ทางเลือก A) และ `sb-compass REQ-017` ลงใน
> `sb-compass/requirement.md` แล้ว (2026-08-31)** · ที่เหลือคือ design/implement ฝั่งนั้น ดู
> RISK-F14/DEP-F09 — **โมดูลนี้ยังคงอ่านคอลัมน์นั้นอย่างเดียว ไม่เขียน ไม่นิยาม DDL ของมันเอง**
> ตารางเดิมของ `sb-compass` (`public."TCompassLevelSubjectStat"`, `public."TCompassStudentLevelScore"`,
> `public."TCompassMbtiResult"` — **ชื่อใหม่ตาม `sb-compass/design.md` Contract Version 8**) และตาราง
> SB PLUS / ฐานข้อมูลเกรด **ไม่ถูกแตะเลยนอกจากข้อยกเว้นข้างบน** —
> ดูหัวข้อ `## Database Ownership Boundary` ว่าใครเขียนอะไรได้บ้าง

**ที่อยู่**: ~~ทุกตารางด้านล่างอยู่ใน **`PGGradeDB`** ที่เดียวกับตาราง `compass_*` เดิม เพื่อให้
`ClassOnlineWeb` อ่านได้ด้วย connection ที่มีอยู่แล้ว โดยไม่ต้องเพิ่ม connection string ใหม่~~

> 🔴 **v11 (2026-09-16) — ย่อหน้า "ที่อยู่" ถูก reconcile ตาม RISK-F22 (ผู้ใช้ยืนยัน 2026-09-14
> บันทึกในหัวไฟล์ bootstrap)** — ข้อสมมติเดิม "อ่านได้ด้วย connection ที่มีอยู่แล้ว ไม่ต้องเพิ่ม
> connection string" **ไม่จริงอีกต่อไป** ที่อยู่จริงแบ่งเป็นสองฐานข้อมูล:
>
> | กลุ่มตาราง | ฐานข้อมูล | การเชื่อมต่อ |
> |---|---|---|
> | **ตารางใหม่ 31 ตัวของโมดูลนี้** (กลุ่ม 1 คลังหลักสูตร + กลุ่ม 2 ผลนักเรียน — DDL/seed ตามสคริปต์ bootstrap) | **`SB_Compass`** — host `10.0.0.128:9499` · user `app_kindergarten` (`prod.config` `PGCompass_*` บรรทัด 141-145) | **`ClassOnlineWeb` ต้องเพิ่ม connection ใหม่ (PRE-F10)** — วันนี้ `configSource-prod.config` ไม่มี connection string ใดชี้ `SB_Compass` และไม่มีโค้ดอ่านคีย์ `PGCompass_*` เลย · Curriculum Service ใช้ slot `database_url` ของตัวเอง (`settings.py` — รอค่านี้อยู่) |
> | **ตารางทั้งหมดของโมดูล `sb-compass` เอง** (`public."TCompassLevelSubjectStat"` · `public."TCompassStudentLevelScore"` · `public."TCompassMbtiResult"` — **ไม่อยู่ในสคริปต์ bootstrap** · 🔴 ผู้ใช้ชี้ขาดที่อยู่ 2026-09-16: **อยู่ใน PGCompass (`SB_Compass`) ไม่ใช่ `PGGradeDB`**) | **`SB_Compass`** (ฐานเดียวกับตารางใหม่ 31 ตัว) | **Module C ของ `sb-compass` ต้องเปลี่ยน connection ก่อนสร้าง/คำนวณจริง** — โค้ดปัจจุบัน (`CompassRankingService.cs:33` `GradePrimary = "PGGradeDBEntities"`) ยังพาไปตก `PGGradeDB` ผิดฐาน · Module K อ่าน `public."TCompassLevelSubjectStat"` ด้วย connection ใหม่เช่นกัน |
> | ตารางเกรด (`"PGTGrade"`/`"PGTGradeDetail"` ฯลฯ — Module E อ่านคะแนน) + SB PLUS ~~+ legacy `compass_*`~~ *(v12 แก้: ตัด legacy ออก — `PGGradeDB` ไม่มีตาราง Compass ใดเลย ผู้ใช้ยืนยัน 2026-09-16 · ตาราง snake_case ยุคแรกไม่เคยถูกสร้างในฐานใดเลย ตาม v5/OQ-F10)* | **`PGGradeDB`** — host `10.0.0.136:9499` · user `app_academic` (`configSource-prod.config:10` `PGGradeDBEntities`) | **`PGGradeDBEntities` เหลือใช้เฉพาะกลุ่มนี้** — ~~legacy ไม่ย้าย (ผู้ใช้ยืนยัน 2026-09-14)~~ *(v12: กลุ่มนี้ไม่มีตาราง Compass ให้ย้ายตั้งแต่แรก — ตาราง Compass ทุกตัวอยู่ `SB_Compass`)* |
>
> **ผลที่ตามมาและห้ามผ่อน**:
> 1. **โค้ด faculty-match ปัจจุบันทุกไฟล์ยังใช้ `PGGradeDBEntities` กับตารางที่จะอยู่ใน `SB_Compass`**
>    (`CompassClusterService.cs:29` · `CompassRiasecService.cs:28` — ทั้งอ่านน้ำหนัก/เขียนผล
>    RIASEC/เขียนผล cluster) — **ต้องเปลี่ยน connection ของ read/write ตารางกลุ่ม 1-2 ไปทางใหม่**
>    · ครอบคลุม **ตารางของ `sb-compass` เองด้วย**: `public."TCompassLevelSubjectStat"` อ่านด้วย
>    connection ใหม่ ไม่ใช่ `PGGradeDBEntities` (ผู้ใช้ชี้ขาด 2026-09-16) · **`PGGradeDBEntities`
>    เหลือเฉพาะการอ่านตารางเกรดของ Module E** → **PRE-F10 + RISK-F23**
> 2. **ห้าม JOIN ข้ามสองฐานข้อมูลใน SQL เดียว** — PostgreSQL ข้าม cluster ไม่มี cross-database
>    JOIN · การรวมข้อมูลข้ามฐาน (เช่น ~~national stats จาก `PGGradeDB` × น้ำหนักจาก `SB_Compass`~~
>    — *v12 แก้ตัวอย่าง: national stats คือ `public."TCompassLevelSubjectStat"` เป็นตาราง Compass
>    จึงอยู่ `SB_Compass` แล้ว · ตัวอย่างที่ยังจริง: ข้อมูลเกรดจาก `PGGradeDB` × ตาราง Compass จาก
>    `SB_Compass`*) รวมที่ชั้น application เท่านั้น (pattern เดิมของ `CompassClusterService` อ่านแยกแล้ว join ใน
>    memory ตรงกับกติกานี้อยู่แล้ว)
> 3. **ความเป็นเจ้าของ/ผู้เขียน/ผู้อ่านไม่เปลี่ยนทุกช่อง** — ยังตามตารางของ `## DES-018`
>    (เปลี่ยนเฉพาะที่อยู่ ไม่ใช่สิทธิ์) · grant จริงเป็นของ PRE-F04 (อัปเดตแล้วใน `## DES-024`)
> 4. สคริปต์ bootstrap = **ground truth ของ DDL + seed ทั้งหมดใน `SB_Compass`** — รวมกลุ่ม 1 ที่
>    ปกติเป็นของ Curriculum Service (ข้อยกเว้น bootstrap ครั้งเดียวตามหัวไฟล์ + README;
>    เมื่อ service ถูกสร้างจริง ความเป็นเจ้าของ migration กลุ่ม 1 ย้ายกลับตาม DES-018)

> ✅ **v5 (2026-08-31) — OQ-F10 ปิดแล้วด้วยตัวเลือก B**: ชื่อตารางทั้งหมดด้านล่างถูกเปลี่ยนเป็น
> `public."T<PascalCase>"` + คอลัมน์ `"PascalCase"` + index `"IX_..."`/`"UX_..."` ตรงกับ naming
> convention จริงขององค์กรแล้ว (เดิม v1-v4 ร่างเป็น snake_case และรอ OQ-F10 ตัดสิน — ปิดแล้ว
> ดู `## Table Naming Convention`) — **`backend-engineer` สร้างตารางตามชื่อด้านล่างได้เลย**
>
> **หลักฐานที่ตรวจจาก repo จริง `C:\src\schoolbright-backend` (อ่านอย่างเดียว ไม่ใช่ Target ที่ config ไว้)**
> — ตาราง PostgreSQL **ทุกตัวที่สร้างใหม่** ในระบบหลังบ้านใช้รูปแบบเดียวกันหมด ไม่มีข้อยกเว้นเลย:
> `public."T<PascalCase>"` · คอลัมน์ `"PascalCase"` (quoted) · index `"IX_<Table>_<Cols>"`
> | ไฟล์อ้างอิง (path จริง) | ตัวอย่างที่พบ |
> |---|---|
> | `C:\src\schoolbright-backend\database-scripts\weekly-audit\migrations\01-create-tjobrunlog.sql:31` | `CREATE TABLE IF NOT EXISTS public."TJobRunLog" ("JobRunId" uuid, "JobKey" text, "StartedAt" timestamp, ...)` · index `"IX_TJobRunLog_JobKey_StartedAt"` |
> | `C:\src\schoolbright-backend\database-scripts\weekly-audit\migrations\03-create-tjobconfig.sql:48,58` | `public."TJobConfig"` · `public."TJobConfigHistory"` (`"HistoryId"`, `"FieldName"`, `"ChangedAt"`) |
> | `C:\src\schoolbright-backend\database-scripts\weekly-audit\migrations\04-create-tschoolfeatureflag.sql:16` | `public."TSchoolFeatureFlag"` (`"SchoolID"`, `"FeatureKey"`, `"IsEnabled"`) |
> | `C:\src\schoolbright-backend\database-scripts\weekly-audit\migrations\02-create-tauditdailyrollup.sql:43` | `public."TAuditDailyRollup"` (`"AuditDate"`, `"TopicKey"`, `"MetricKey"`) |
> | `C:\src\schoolbright-backend\jabjaiuniversity\docs\migration\004_create_TFCMSendRequestLog_and_TFCMDeliveryAck.sql:9,27` | `public."TFCMSendRequestLog"` · `public."TFCMDeliveryAck"` (`"ID" bigserial`, `"RequestId"`, `"CreatedDate"`) |
> | `C:\src\schoolbright-backend\database-scripts\TFCMSendLog_Create.sql:8` | `public."TFCMSendLog"` (`"ID" bigserial`, `"SendCorrelationID"`) |
> | `C:\src\schoolbright-backend\jabjaiuniversity\PostgreSQL\migration_add_offday_attendance_mode.sql:14` | `ALTER TABLE "TSystemSetting" ADD COLUMN "nOffDayAttendanceMode"` — **การเพิ่มคอลัมน์ในตารางเก่าใช้ prefix แบบ Hungarian ตามสไตล์ของตารางนั้นเอง ไม่ใช่ PascalCase ล้วน** |
>
> **ตาราง `compass_*` เดิม 3 ตัวเคยรันเป็น snake_case ไม่ quoted** — ยืนยันจากโค้ด Target ตอนที่
> ตรวจ (`Helper/CompassRankingService.cs:541,548` (`compass_level_subject_stat`,
> `compass_student_level_score`, index `ix_cslscore_level_avg`) และ `Helper/CompassMbtiStore.cs:94`
> (`compass_mbti_result`)) **แต่โค้ดนั้นยังไม่เคยถูก deploy จริง** (`sb-compass` ทุก phase เป็น
> `deployed ⬜`) และ **`sb-compass/design.md` Contract Version 8 เปลี่ยนชื่อทั้งสามตารางเป็น
> `public."TCompassLevelSubjectStat"` / `public."TCompassStudentLevelScore"` /
> `public."TCompassMbtiResult"` (PascalCase quoted) แล้ว โดยไม่ต้อง migration เพราะยังไม่เคยถูกสร้าง
> ในฐานข้อมูลใด ๆ เลย** — โค้ดที่อ้างชื่อ snake_case ข้างต้นเป็นสิ่งที่ `sb-compass` Module C ต้องแก้
> ไม่ใช่สภาพปัจจุบันของฐานข้อมูลอีกต่อไป
> ~~**ผลคือทุกตารางใน `PGGradeDB` ที่เกี่ยวข้องกับ Compass ตรงกับ convention องค์กรแล้วทั้งหมด**
> (`"PGTGrade"`, `"PGTGradeDetail"`, `"TPlane"`, `"TSubLevel"`, และตอนนี้รวมสามตารางของ `sb-compass`)~~
> *(v12 แก้: สามตารางของ `sb-compass` เป็นตาราง Compass จึงอยู่ `SB_Compass` ไม่ใช่ `PGGradeDB` —
> ผู้ใช้ยืนยัน 2026-09-16 · ที่ `PGGradeDB` เหลือเฉพาะตารางเกรด/SB PLUS ซึ่งไม่ใช่ตาราง Compass)*
>
> **ตาราง 27 ตัวใหม่ของโมดูลนี้เอง — เปลี่ยนเป็น `public."T<PascalCase>"` แล้ว (v5)**: ร่างแรกสืบทอด
> สไตล์ snake_case ของ 3 ตารางเดิมของ `sb-compass` มาโดยไม่ได้ตั้งใจ — ผู้ใช้ปิด OQ-F10 ด้วยตัวเลือก B
> (2026-08-31) จึงเปลี่ยนทั้งหมดให้ตรง convention องค์กร ดู DDL เต็มด้านล่างและ
> `## Table Naming Convention`

> 🟠 **v6 (2026-08-31) — เพิ่ม 3 ตาราง + 4 คอลัมน์ (additive ล้วน ไม่มี migration)**: จำนวนตาราง
> ใหม่ของโมดูลนี้เปลี่ยนจาก **27 เป็น 30** — `public."TCompassRiasecRankBlock"`,
> `public."TCompassRiasecRankOption"` (คำถามแบบเรียงลำดับ REQ-012 รอบที่ 3) และ
> `public."TCompassStudentClusterRun"` (หัวรอบของการคำนวณ cluster · ที่อยู่ของ `ClarityIndex`) ·
> เพิ่มคอลัมน์ `"RankAnswers"`, `"AnsweredCount"`, `"ActiveItemCount"` ที่
> `public."TCompassRiasecResult"` (สามตัวหลังคือฐานของ Confidence — `## Cluster Determination Rules`
> ข้อ 7.1) และ `"DisplayScore"` ที่ `public."TCompassStudentClusterScore"` (ค่าที่แสดงหลังปรับ —
> ข้อ 7.4 · **ค่าดิบ `"CombinedScore"` ยังห้ามเขียนทับ**) · **ทุกตัวใช้ convention เดียวกับ
> ที่ OQ-F10 ปิดไว้ (ตัวเลือก B) ไม่ใช่การเปิด OQ-F10 ใหม่** · ยังไม่มีตารางใดถูกสร้างจริงในฐานข้อมูล
> จึงยังไม่ต้อง migration เหมือนเดิม (ทุก phase ของโมดูลนี้ `implemented ⬜` ตาม `status.md`)
> · **แก้ข้อผิดพลาดที่พบระหว่างรอบนี้**: `public."TCompassStudentClusterScore"."AcademicFit"` เดิม
> เขียนเป็น `NOT NULL` ซึ่ง**ขัดกับ `## Cluster Determination Rules` ข้อ 2 กติกา 3** ที่กำหนดว่า
> `AcademicFit` เป็น `NULL` ได้ทุก cluster เมื่อกลุ่มสาระถูกตัดหมด → แก้เป็น nullable

> 🔴 **v9 (2026-09-15) — PK ของตาราง master 7 ตัวเปลี่ยนจาก text code เป็น int identity
> (breaking · ผู้ใช้ยืนยันแล้ว · ไม่มี migration เพราะฐานถูกสร้างใหม่ทั้งก้อน)**
> ผู้ใช้แก้สคริปต์ bootstrap จริงด้วยตัวเองที่
> `C:\src\sb-web-student\ClassOnlineWeb\DatabaseScripts\Compass\bootstrap-sb-compass-db.sql`
> (หัวไฟล์ลงวันที่ **2026-09-15** บันทึกทั้งคำสั่งและคำยืนยันไว้ในตัวไฟล์) — **ไฟล์นั้นคือ ground truth
> ของ schema ณ ตอนนี้ และ `## Data Model` ถูก reconcile ตามมัน** ไม่ใช่ทางกลับกันในรอบนี้
> - **PK ใหม่เป็น `serial "<Name>ID"` ทั้ง 7 ตาราง**: `TCompassUniversity` → `"UniversityID"` ·
>   `TCompassInterestCluster` → `"ClusterID"` · `TCompassFacultyGroup` → `"FacultyGroupID"`
>   (**ชื่อเดิม แต่ชนิดเปลี่ยนจาก `text` เป็น `integer`**) · `TCompassRiasecDimension` →
>   `"DimensionID"` · `TCompassEducationTrack` → `"TrackID"` · `TCompassStudyPlan` →
>   `"StudyPlanID"` (**ชื่อเดิม ชนิดเปลี่ยน**) · `TCompassCareer` → `"CareerID"` (**ชื่อเดิม ชนิดเปลี่ยน**)
> - **code เดิมไม่ถูกลบทิ้งสักตัว** — ยังเป็น `text NOT NULL UNIQUE` ทุกตาราง · ตัวที่ชื่อชนกับ PK ใหม่
>   ถูกเปลี่ยนชื่อเป็น `"FacultyGroupCode"` / `"StudyPlanCode"` / `"CareerCode"` · ที่เหลือคงชื่อเดิม
>   (`"UniversityCode"`, `"ClusterCode"`, `"DimensionCode"`, `"TrackCode"`) **แต่ไม่ใช่ PK อีกต่อไป**
> - **ทุก FK ที่เคยอ้าง code เปลี่ยนไปอ้าง Id (`integer`)** · PK ผสมและ index ที่มี code เป็นส่วนประกอบ
>   เปลี่ยนตามทั้งหมด (เช่น `PRIMARY KEY ("ProgramID", "ClusterID")` ·
>   `"IX_TCompassProgram_Status_UniversityID_CreatedAt"` · `"UX_TCompassRiasecRankOption_BlockID_DimensionID"`)
> - **ตารางที่ PK เป็น serial อยู่แล้วไม่ถูกแตะ**: `ProgramID` · `SourceID` · `QuestID` · `QuestionID` ·
>   `BlockID` · `OptionID` · `ResultID` · `AttemptID` · `TargetID` · `RunID` · `IntakeID`
> - **Migration/backfill: ไม่มี** — ผู้ใช้ยืนยันในไฟล์เดียวกัน (2026-09-15) ว่าฐานข้อมูลถูก `DROP ... CASCADE`
>   แล้วสร้างใหม่ทั้งก้อนเพราะยังไม่มีข้อมูลจริง · **แต่ Compatibility คือ `breaking`** สำหรับโค้ด/ร่าง
>   /seed ใด ๆ ที่เคยเขียน query โดยใช้ code เป็นคีย์ — รอบก่อนหน้าทุกรอบของเอกสารนี้เป็น additive
>   นี่เป็นรอบแรกที่ไม่ใช่
> - **กติกาที่ตามมาและห้ามผ่อน (code ยังเป็นคีย์ของมนุษย์ · Id เป็นคีย์ของฐานข้อมูล)**: ค่าที่ปรากฏใน
>   ไฟล์ seed · prompt/JSON ของ AI · ข้อความบนหน้าจอแอดมิน · เอกสารอ้างอิง ยังเป็น **code** เสมอ
>   (`'KMUTT'`, `'C1'`..`'C11'`, `'FG01'`..`'FG26'`, `'R'`/`'I'`/`'A'`/`'S'`/`'E'`/`'C'`,
>   `'upper_secondary'`, `'SP_UPPER_SCI_MATH'`, `'CR_SWE'`) · **การแปลง code → Id ทำที่ชั้น service
>   ตอน resolve เท่านั้น** (`JOIN ... ON "<Name>Code" = @code` แบบเดียวกับที่ seed ในสคริปต์ทำ) ·
>   **ห้ามส่ง Id ตัวเลขออกไปให้ AI · ห้ามใส่ Id ลงในไฟล์ seed · ห้าม hardcode Id ในโค้ด**
>   เพราะเป็นค่าที่ฐานข้อมูลกำหนดเอง ไม่เสถียรข้ามสภาพแวดล้อม → RISK-F21

> ⚠️ **drift ที่พบระหว่างรอบ v9 แต่ *ไม่ได้* แก้ในรอบนี้ — ต้องให้คนตัดสิน ห้ามให้ engineer เดาเอง**
> 1. **ความกว้างของ integer PK ของตารางที่ "ไม่ถูกแตะ"**: เอกสารนี้ระบุ `bigserial`/`bigint`
>    (`ProgramID`, `SourceID`, `IntakeID`, `QuestID`, `QuestionID`, `BlockID`, `OptionID`, `ResultID`,
>    `RunID`, `AttemptID`, `TargetID`) แต่สคริปต์ bootstrap สร้างจริงเป็น `serial`/`integer` (int4)
>    ทุกตัว — หัวไฟล์ระบุว่ากลุ่มนี้ "ไม่แตะ" แปลว่า**เป็น drift ที่มีมาก่อนรอบนี้** ไม่ใช่ผลของการ
>    เปลี่ยน PK · **`system-analyst` ไม่เลือกข้างให้เอง** เพราะ int4 vs int8 เป็นการตัดสินความจุ/สัญญา
>    ไม่ใช่การสะกดชื่อ → **OQ-F17** · DDL ด้านล่างจึงยังคง `bigserial`/`bigint` ไว้ตามสัญญาเดิม
>    **และตรงนี้คือจุดที่เอกสารกับฐานข้อมูลจริงยังไม่ตรงกัน** — `backend-engineer`/`qa-engineer` ต้องรู้
>    · ✅ **v11 (2026-09-16) ปิดแล้ว** — ผู้ใช้ยืนยันยึด DDL จริง (`serial`/`integer`) · DDL ด้านล่าง
>    ถูกแก้เป็น `serial`/`integer` ครบทุกตารางแล้ว — เอกสารตรงกับฐานจริงสมบูรณ์
> 2. **ที่อยู่ของฐานข้อมูล**: ย่อหน้า **ที่อยู่** ด้านล่างยังระบุ `PGGradeDB` แต่สคริปต์ bootstrap
>    สร้างตารางทั้งหมดในฐานข้อมูล **ใหม่** ชื่อ `SB_Compass` (`prod.config` `PGCompass_*`) โดยหัวไฟล์
>    บันทึกว่า **ผู้ใช้ยืนยันแล้ว 2026-09-14** ~~และตาราง Compass เดิมใน `PGGradeDB` ไม่ย้าย~~
>    *(v12 แก้: `PGGradeDB` ไม่มีตาราง Compass ใดอยู่เลย — ผู้ใช้ยืนยัน 2026-09-16)* ·
>    **รอบนี้ไม่แก้** เพราะอยู่นอกขอบเขตการ reconcile PK ที่ได้รับมอบหมาย และการแก้ต้องไล่ทั้ง
>    `## DES-018` (ownership/grant) · PRE-F03/PRE-F04 · RISK-F10/RISK-F11 · `## DES-024` พร้อมกัน →
>    **เป็นรอบ amend ของตัวเอง ไม่ใช่การแก้คำเดียว** — ดู RISK-F22 · ✅ **v11 (2026-09-16)
>    reconcile แล้ว** — ย่อหน้า **ที่อยู่** + DES-018 + DES-024 + RISK-F10/F11 แก้ครบในรอบเดียวกัน
>    ตามที่ข้อนี้กำหนดไว้ · ความกว้าง PK (ข้อ 1 ด้านบน) ยังเปิดเป็น OQ-F17 ตามเดิม

**วิธีสร้าง**: **migration ของ Curriculum Service เท่านั้น** — **ห้ามรับมรดก pattern
`CREATE TABLE IF NOT EXISTS` ตอน runtime ของ `sb-compass`** · `ClassOnlineWeb` **ห้ามสร้าง
ห้ามแก้โครงตารางกลุ่มนี้เด็ดขาด** ไม่ว่ากรณีใด (`CompassRankingService.EnsureTables` /
`CompassMbtiStore.EnsureTable` เป็น pattern ของตารางเดิม ห้ามขยายมาครอบตารางใหม่)

**ขอบเขตรอบนี้ — สายสามัญ (ม.ปลาย) เท่านั้น**: ทุกตาราง L2/L3 ด้านล่างออกแบบให้ขยายรองรับสายอาชีพ
(ปวช./ปวส./ทหาร/ตำรวจ) ได้ในอนาคตโดยไม่ต้องรื้อ (คอลัมน์ enum-like เป็น `text` ธรรมดา ไม่ใช้
PostgreSQL `ENUM` ชนิดจริง เพื่อเพิ่มค่าใหม่ได้โดยไม่ต้อง `ALTER TYPE`) แต่ **ข้อมูลจริงที่ seed
รอบนี้มีเฉพาะแถว `upper_secondary`** (REQ-015)

```sql
-- ============================================================
--  กลุ่มที่ 1 — คลังหลักสูตร (Curriculum Service เป็นผู้เขียนแต่ผู้เดียว)
-- ============================================================

-- มหาวิทยาลัย — มีตารางแยกเพราะรอบหน้าจะมีหลายแห่ง ปล่อยเป็น free text แล้วจะเพี้ยน
CREATE TABLE IF NOT EXISTS public."TCompassUniversity" (
    "UniversityID"   serial      PRIMARY KEY,          -- **v9** int identity · คีย์ที่ FK ทุกตัวอ้าง
    "UniversityCode" text        NOT NULL UNIQUE,      -- 'KMUTT' · คีย์ที่มนุษย์/seed อ้าง (เดิมเป็น PK)
    "NameTh"         text        NOT NULL,
    "NameEn"         text,
    "IsActive"       boolean     NOT NULL DEFAULT true,
    "CreatedAt"      timestamptz NOT NULL
);

-- REQ-005/011/014 — L1: 11 Interest Cluster (Presentation/filter layer — ไม่ใช่ source of truth
-- ตามที่ education-pathway-taxonomy-design.md ระบุไว้ใน E.1 — แต่ยังต้องมี referential integrity
-- เพื่อให้ validate ผล AI และหน้าจอแอดมินใช้ได้) แทนที่ 8 path เดิมของ CompassPathCatalog ทั้งหมด
-- **ห้ามเพิ่ม/ลบแถวโดยไม่ amend เอกสารนี้ก่อน** — seed จาก education-pathway-taxonomy-design.md ส่วน C
CREATE TABLE IF NOT EXISTS public."TCompassInterestCluster" (
    "ClusterID"      serial      PRIMARY KEY,          -- **v9** int identity
    "ClusterCode"    text        NOT NULL UNIQUE,      -- 'C1'..'C11' (เดิมเป็น PK · ยังเป็นคีย์ของ seed/ผล AI)
    "NameTh"         text        NOT NULL,             -- ชื่อบน UI เช่น "สุขภาพและการรักษาคน"
    "OneLinerTh"     text        NOT NULL,
    "Icon"           text,
    "SortOrder"      integer     NOT NULL,
    "CreatedAt"      timestamptz NOT NULL
);

-- L4 — 26 กลุ่มคณะเดิม (REQ-015 บังคับเก็บไว้ ห้ามลบ) — master ใหม่ของโมดูลนี้
-- (26 กลุ่มเดิมไม่เคยมีตัวตนเป็นตาราง DB มาก่อนในทั้งสอง codebase ที่ตรวจแล้ว — เป็นเนื้อหาจาก
-- education-pathway-taxonomy-design.md ส่วน A.5/D ล้วน ไม่ใช่ของที่ยืนยันจากระบบเดิม)
CREATE TABLE IF NOT EXISTS public."TCompassFacultyGroup" (
    "FacultyGroupID"   serial      PRIMARY KEY,        -- **v9** int identity (เดิมคอลัมน์ชื่อนี้เป็น text code)
    "FacultyGroupCode" text        NOT NULL UNIQUE,    -- เช่น 'FG01'..'FG26' — **v9 เปลี่ยนชื่อมาจาก "FacultyGroupID" เดิม**
    "LegacyNameTh"     text        NOT NULL,
    "CreatedAt"        timestamptz NOT NULL
);

-- cluster ↔ faculty_group (M:N + is_primary) — seed จาก taxonomy ส่วน D ตรง ๆ (26/26 map ครบ)
-- (seed เขียนเป็น INSERT ... SELECT ที่ JOIN ด้วย "ClusterCode"/"FacultyGroupCode" แล้วแปลงเป็น Id —
--  ห้ามใส่เลข Id ลงในไฟล์ seed โดยตรง)
CREATE TABLE IF NOT EXISTS public."TCompassClusterFacultyGroup" (
    "ClusterID"      integer NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),
    "FacultyGroupID" integer NOT NULL REFERENCES public."TCompassFacultyGroup"("FacultyGroupID"),
    "IsPrimary"      boolean NOT NULL,
    PRIMARY KEY ("ClusterID", "FacultyGroupID")
);

-- REQ-012 — 6 มิติ RIASEC มาตรฐาน (แทนที่ compass_behavior_trait 8 แกนที่ระบบออกแบบเองในรอบที่ 1)
-- **ห้ามเพิ่ม/ลบแถวโดยไม่ amend เอกสารนี้ก่อน** — เป็นมาตรฐานภายนอก ไม่ใช่ของที่แก้ได้ตามใจ
CREATE TABLE IF NOT EXISTS public."TCompassRiasecDimension" (
    "DimensionID"   serial      PRIMARY KEY,           -- **v9** int identity
    "DimensionCode" text        NOT NULL UNIQUE,       -- 'R' | 'I' | 'A' | 'S' | 'E' | 'C' (เดิมเป็น PK)
    "NameTh"        text        NOT NULL,               -- เช่น 'Realistic (ลงมือทำ)'
    "Description"   text        NOT NULL,
    "DisplayOrder"  integer     NOT NULL,
    "CreatedAt"     timestamptz NOT NULL
);

-- REQ-001 — เอกสารต้นฉบับ + ข้อความที่แปลงแล้ว (เก็บทั้งคู่เพื่อตรวจย้อนหลังได้)
CREATE TABLE IF NOT EXISTS public."TCompassProgramSource" (
    "SourceID"          serial   PRIMARY KEY,
    "UniversityID"      integer     NOT NULL REFERENCES public."TCompassUniversity"("UniversityID"),  -- **v9** เดิมเป็น "UniversityCode" text
    "OriginalFileUrl"   text        NOT NULL,          -- object storage URL ของ PDF ต้นฉบับ
    "OriginalFileName"  text        NOT NULL,
    "OriginalSha256"    text        NOT NULL,          -- กันนำไฟล์เดิมเข้าซ้ำโดยไม่ตั้งใจ
    "MarkdownText"      text        NOT NULL,          -- ผลจาก markitdown ('' ได้ ถ้า conversion ไม่ ok)
    "MarkdownOrigin"    text        NOT NULL,          -- 'markitdown' | 'markitdown+ocr' | 'manual'
    "ConversionStatus"  text        NOT NULL,          -- 'ok' | 'empty' | 'failed'
    "ConversionNote"    text,                          -- ข้อความ error ตอนแปลงไม่สำเร็จ
    "ImportedBy"        text        NOT NULL,          -- subject จาก SSO ของ Curriculum Service
    "ImportedAt"        timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassProgramSource_UniversityID_ImportedAt"
    ON public."TCompassProgramSource" ("UniversityID", "ImportedAt" DESC);
CREATE UNIQUE INDEX IF NOT EXISTS "UX_TCompassProgramSource_UniversityID_OriginalSha256"
    ON public."TCompassProgramSource" ("UniversityID", "OriginalSha256");

-- REQ-002/003/004 — สาขาที่ AI แกะได้จากเอกสาร "ก่อน" กลายเป็นของจริง
-- ตารางนี้คือคิวตรวจ · มีอยู่เพื่อไม่ให้การ dedup ข้ามมหาวิทยาลัยรวมสาขาเข้าด้วยกันเงียบ ๆ
-- **ลำดับในเอกสารนี้ไม่ใช่ลำดับที่รันได้**: "MatchedProgramID" มี FK ชี้ TCompassProgram ที่นิยามอยู่
-- ถัดไป — migration ต้องสร้าง TCompassProgram ก่อน (สคริปต์ bootstrap จริงสลับลำดับไว้แล้วด้วยเหตุนี้)
-- โครง DDL ของแต่ละตารางไม่เปลี่ยน เปลี่ยนแค่ลำดับการรัน
CREATE TABLE IF NOT EXISTS public."TCompassProgramIntake" (
    "IntakeID"          serial   PRIMARY KEY,
    "SourceID"          integer      NOT NULL REFERENCES public."TCompassProgramSource"("SourceID"),
    "RawProgramName"    text        NOT NULL,          -- ชื่อสาขาตามที่ปรากฏในเอกสาร
    "RawFacultyName"    text        NOT NULL DEFAULT '',
    "DedupKey"          text        NOT NULL,          -- ชื่อที่ normalize แล้ว (ดู ## Import Rules)
    "MatchedProgramID"  integer      REFERENCES public."TCompassProgram"("ProgramID"),  -- สาขาเดิมที่ระบบเดาว่าตรงกัน
    "Resolution"        text        NOT NULL,          -- 'pending' | 'new' | 'replace' | 'discard'
    "AiRawResponse"     text,                          -- คำตอบดิบของ AI (เก็บไว้แม้ validate ไม่ผ่าน)
    "AiError"           text,                          -- เหตุผลที่ validate ไม่ผ่าน / AI ล้มเหลว
    "ResolvedBy"        text,
    "ResolvedAt"        timestamptz,
    "CreatedAt"         timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassProgramIntake_Resolution_CreatedAt"
    ON public."TCompassProgramIntake" ("Resolution", "CreatedAt");

-- REQ-002/003/004/014 — หนึ่งแถว = หนึ่ง "สาขา" ที่มีตัวตนจริงในคลัง (แทนที่แนวคิด L5 major สำหรับรอบนี้)
CREATE TABLE IF NOT EXISTS public."TCompassProgram" (
    "ProgramID"       serial   PRIMARY KEY,
    "UniversityID"    integer     NOT NULL REFERENCES public."TCompassUniversity"("UniversityID"),  -- **v9** เดิมเป็น "UniversityCode" text
    "SourceID"        integer      NOT NULL REFERENCES public."TCompassProgramSource"("SourceID"),
    "FacultyName"     text        NOT NULL DEFAULT '', -- NOT NULL เพราะ NULL ไม่ชนกันใน UNIQUE
    "FacultyGroupID"  integer     REFERENCES public."TCompassFacultyGroup"("FacultyGroupID"),  -- L4 (REQ-014/015) · AI เสนอ + คนแก้ได้ · nullable ระหว่างรอตรวจ · **v9: integer ไม่ใช่ text code แล้ว**
    "ProgramName"     text        NOT NULL,
    "ProgramCode"     text,                            -- รหัสหลักสูตร ถ้ามีในเอกสาร
    "DedupKey"        text        NOT NULL,
    "Status"          text        NOT NULL,            -- 'pending_review' | 'approved' | 'retired'
    "AnalysisStatus"  text        NOT NULL,            -- 'ai_ok' | 'ai_incomplete' | 'manual'
    "BehaviorProfile" text,                            -- ข้อความบรรยาย (REQ-002 ข้อ 2)
    "AiModel"         text,                            -- โมเดลที่ใช้จริง เช่น 'glm-5.2'
    "AiRawResponse"   text,                            -- คำตอบดิบที่ผลิตข้อมูลชุดปัจจุบัน
    "AiAnalyzedAt"    timestamptz,
    "ReviewedBy"      text,                            -- subject จาก SSO · NOT NULL เสมอเมื่อ approved
    "ReviewedAt"      timestamptz,
    "CreatedAt"       timestamptz NOT NULL,
    "UpdatedAt"       timestamptz NOT NULL,
    UNIQUE ("UniversityID", "DedupKey")
);
CREATE INDEX IF NOT EXISTS "IX_TCompassProgram_Status_UniversityID_CreatedAt"
    ON public."TCompassProgram" ("Status", "UniversityID", "CreatedAt");
CREATE INDEX IF NOT EXISTS "IX_TCompassProgram_FacultyGroupID" ON public."TCompassProgram" ("FacultyGroupID");

-- REQ-002 ข้อ 1 — น้ำหนักกลุ่มสาระที่สาขานั้นต้องการ
CREATE TABLE IF NOT EXISTS public."TCompassProgramSubjectWeight" (
    "ProgramID" integer  NOT NULL REFERENCES public."TCompassProgram"("ProgramID") ON DELETE CASCADE,
    "Subject"   text    NOT NULL,                      -- ต้องเป็น 1 ใน 8 ชื่อ canonical เป๊ะ ๆ
    "Weight"    integer NOT NULL,                      -- 3=มาก · 2=ปานกลาง · 1=น้อย (ค่าอื่นห้าม)
    "IsManual"  boolean NOT NULL DEFAULT false,        -- true = คนกรอก/แก้เอง (REQ-004)
    PRIMARY KEY ("ProgramID", "Subject")
);

-- REQ-005/011/014 — สาขา ↔ 11 cluster (many-to-many ตามแนวทางเดิมของ D3 — แทนที่ compass_program_path)
CREATE TABLE IF NOT EXISTS public."TCompassProgramCluster" (
    "ProgramID"  integer  NOT NULL REFERENCES public."TCompassProgram"("ProgramID") ON DELETE CASCADE,
    "ClusterID"  integer NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),  -- **v9** เดิมเป็น "ClusterCode" text
    "AssignedBy" text    NOT NULL,                      -- 'ai' | 'human'
    PRIMARY KEY ("ProgramID", "ClusterID")
);
CREATE INDEX IF NOT EXISTS "IX_TCompassProgramCluster_ClusterID" ON public."TCompassProgramCluster" ("ClusterID");

-- REQ-013 — น้ำหนัก cluster ↔ กลุ่มสาระ (11×8) ใช้คำนวณ academic-fit ของแต่ละ cluster
-- **P-F03 sign-off แล้ว (2026-08-31, OQ-F07 ปิด) — พร้อม seed ค่าที่ร่างจาก taxonomy ได้**
-- ยังคงมาร์กเป็นสมมติฐานไม่มีแหล่งอ้างอิงเชิงตัวเลขภายนอก (RISK-F15) ตาม policy — sign-off ไม่ได้
-- ยกเว้นการติดป้ายนี้ เพียงอนุญาตให้เริ่มใช้งานได้
CREATE TABLE IF NOT EXISTS public."TCompassClusterSubjectWeight" (
    "ClusterID" integer NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),  -- **v9** เดิมเป็น "ClusterCode" text
    "Subject"   text    NOT NULL,                       -- 1 ใน 8 ชื่อ canonical
    "Weight"    integer NOT NULL,                       -- 3=มาก · 2=ปานกลาง · 1=น้อย
    PRIMARY KEY ("ClusterID", "Subject")
);

-- REQ-012/013 — น้ำหนัก cluster ↔ มิติ RIASEC (11×6) ใช้คำนวณ interest-fit ของแต่ละ cluster
-- **P-F03 sign-off แล้ว (2026-08-31, OQ-F07 ปิด) — พร้อม seed ค่าที่ร่างจาก taxonomy ได้ (RISK-F15 ยังติดป้ายไว้)**
CREATE TABLE IF NOT EXISTS public."TCompassClusterRiasecWeight" (
    "ClusterID"   integer NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),   -- **v9** เดิมเป็น code
    "DimensionID" integer NOT NULL REFERENCES public."TCompassRiasecDimension"("DimensionID"), -- **v9** เดิมเป็น code
    "Weight"      integer NOT NULL,                     -- 3=มาก · 2=ปานกลาง · 1=น้อย
    PRIMARY KEY ("ClusterID", "DimensionID")
);

-- REQ-002 ข้อ 2 (ครึ่งที่คำนวณได้) — โปรไฟล์ RIASEC ที่สาขานั้นต้องการ (แทนที่ compass_program_behavior_trait)
CREATE TABLE IF NOT EXISTS public."TCompassProgramRiasecProfile" (
    "ProgramID"    integer  NOT NULL REFERENCES public."TCompassProgram"("ProgramID") ON DELETE CASCADE,
    "DimensionID"  integer NOT NULL REFERENCES public."TCompassRiasecDimension"("DimensionID"),  -- **v9** เดิมเป็น code
    "DesiredLevel" integer NOT NULL,                    -- 1-5 (ค่าอื่นห้าม)
    "IsManual"     boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("ProgramID", "DimensionID")
);

-- REQ-012 — ชุดคำถาม RIASEC กลางชุดเดียว (แทนที่ compass_behavior_question)
-- **เนื้อหาคำถามจริงยังไม่ผ่านตรวจ (UI mockup ที่ requirement.md References อ้างถึง) — ห้าม seed
-- ข้อมูลจริงก่อน uxui-designer ตรวจ**
CREATE TABLE IF NOT EXISTS public."TCompassRiasecQuestion" (
    "QuestionID"    serial   PRIMARY KEY,
    "DisplayOrder"  integer     NOT NULL,
    "Prompt"        text        NOT NULL,
    "DimensionID"   integer     NOT NULL REFERENCES public."TCompassRiasecDimension"("DimensionID"),  -- **v9** เดิมเป็น code
    "ReverseScored" boolean     NOT NULL DEFAULT false,
    "IsActive"      boolean     NOT NULL DEFAULT true,
    "CreatedAt"     timestamptz NOT NULL,
    "UpdatedAt"     timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassRiasecQuestion_IsActive_DisplayOrder"
    ON public."TCompassRiasecQuestion" ("IsActive", "DisplayOrder");

-- REQ-012 (requirement.md รอบที่ 3, 2026-08-31) — คำถาม **แบบเรียงลำดับ** (forced choice)
-- อยู่คู่กับแบบ Likert ด้านบน **ไม่ใช่แทนที่กัน** · หนึ่ง block = หนึ่งชุดตัวเลือกที่ต้องจัดอันดับให้ครบ
-- **เนื้อหาจริงยังไม่ผ่านตรวจเช่นเดียวกับแบบ Likert — ห้าม seed ก่อน uxui-designer ตรวจ**
CREATE TABLE IF NOT EXISTS public."TCompassRiasecRankBlock" (
    "BlockID"      serial   PRIMARY KEY,
    "DisplayOrder" integer     NOT NULL,
    "Prompt"       text        NOT NULL,
    "IsActive"     boolean     NOT NULL DEFAULT true,
    "CreatedAt"    timestamptz NOT NULL,
    "UpdatedAt"    timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassRiasecRankBlock_IsActive_DisplayOrder"
    ON public."TCompassRiasecRankBlock" ("IsActive", "DisplayOrder");

-- ตัวเลือกภายใน block · จำนวนตัวเลือก active ต่อ block ต้องอยู่ระหว่าง 5-7 (บังคับที่ชั้น service
-- ตอน authoring และตอนรับคำตอบ — ดู `## RIASEC Fit Rules` ข้อ 1 · เช็คด้วย CHECK constraint ไม่ได้
-- เพราะเป็นเงื่อนไขข้ามแถว)
-- **ไม่มีคอลัมน์ "ReverseScored" โดยเจตนา** — ห้ามเพิ่ม ดูเหตุผลที่ `## RIASEC Fit Rules` ข้อ 3.3
CREATE TABLE IF NOT EXISTS public."TCompassRiasecRankOption" (
    "OptionID"      serial PRIMARY KEY,
    "BlockID"       integer    NOT NULL REFERENCES public."TCompassRiasecRankBlock"("BlockID") ON DELETE CASCADE,
    "DimensionID"   integer   NOT NULL REFERENCES public."TCompassRiasecDimension"("DimensionID"),  -- **v9** เดิมเป็น code
    "OptionText"    text      NOT NULL,
    "DisplayOrder"  integer   NOT NULL,
    "IsActive"      boolean   NOT NULL DEFAULT true
);
-- หนึ่งมิติปรากฏได้ไม่เกิน 1 ตัวเลือก active ต่อ block — กันไม่ให้มิติเดียวกันแย่งอันดับกันเองใน block เดียว
CREATE UNIQUE INDEX IF NOT EXISTS "UX_TCompassRiasecRankOption_BlockID_DimensionID"
    ON public."TCompassRiasecRankOption" ("BlockID", "DimensionID") WHERE "IsActive";
CREATE INDEX IF NOT EXISTS "IX_TCompassRiasecRankOption_BlockID_DisplayOrder"
    ON public."TCompassRiasecRankOption" ("BlockID", "DisplayOrder");

-- REQ-008 — คลัง quest ระดับมิติ RIASEC (D6 — แทนที่ trait_code ด้วย dimension_code)
CREATE TABLE IF NOT EXISTS public."TCompassQuest" (
    "QuestID"       serial   PRIMARY KEY,
    "DimensionID"   integer     NOT NULL REFERENCES public."TCompassRiasecDimension"("DimensionID"),  -- **v9** เดิมเป็น code
    "ProgramID"     integer      REFERENCES public."TCompassProgram"("ProgramID"),  -- **รอบนี้ต้องเป็น NULL เสมอ**
    "Title"         text        NOT NULL,
    "Description"   text        NOT NULL,
    "Status"        text        NOT NULL,               -- 'pending_review' | 'approved' | 'retired'
    "CreatedBy"     text        NOT NULL,
    "CreatedAt"     timestamptz NOT NULL,
    "UpdatedAt"     timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassQuest_DimensionID_Status" ON public."TCompassQuest" ("DimensionID", "Status");

-- ============================================================
--  กลุ่มที่ 1b — Education Pathway Taxonomy (L2/L3/L3.5/L6) — เฉพาะฝั่งสายสามัญ (REQ-015)
--  schema พร้อมใช้ทันที · เนื้อหาจริง (ชื่อแผนการเรียน/เกณฑ์รับเข้า/อาชีพ) เป็นงานทยอยเติมภายหลัง
--  ไม่บล็อกการ ship Module F/G/H/I-a/I-b (เหมือน OQ-F01) — ดู DES-015 และ Feature-by-Feature
-- ============================================================

-- L2 — ประเภทเส้นทางการศึกษา (enum-like master, text ธรรมดาเพื่อขยายได้โดยไม่ ALTER TYPE)
-- รอบนี้ seed แค่ 1 แถว: 'upper_secondary' — ค่าอื่น (vocational_certificate ฯลฯ) เป็นเฟสถัดไป
CREATE TABLE IF NOT EXISTS public."TCompassEducationTrack" (
    "TrackID"   serial      PRIMARY KEY,   -- **v9** int identity
    "TrackCode" text        NOT NULL UNIQUE,   -- 'upper_secondary' (รอบนี้มีแถวเดียว · เดิมเป็น PK)
    "NameTh"    text        NOT NULL,
    "IsActive"  boolean     NOT NULL DEFAULT true,
    "CreatedAt" timestamptz NOT NULL
);

-- L3 — แผนการเรียน ม.ปลาย (canonical) + alias เพราะโรงเรียนตั้งชื่อเองไม่ตรงกัน (taxonomy H.8)
CREATE TABLE IF NOT EXISTS public."TCompassStudyPlan" (
    "StudyPlanID"   serial      PRIMARY KEY,           -- **v9** int identity (เดิมคอลัมน์ชื่อนี้เป็น text code)
    "StudyPlanCode" text        NOT NULL UNIQUE,       -- เช่น 'SP_UPPER_SCI_MATH' — **v9 เปลี่ยนชื่อมาจาก "StudyPlanID" เดิม**
    "TrackID"       integer     NOT NULL REFERENCES public."TCompassEducationTrack"("TrackID"),  -- **v9** เดิมเป็น "TrackCode" text
    "NameTh"        text        NOT NULL,               -- เช่น 'วิทย์-คณิต'
    "NotesTh"       text,
    "CreatedAt"     timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS public."TCompassStudyPlanAlias" (
    "StudyPlanID" integer NOT NULL REFERENCES public."TCompassStudyPlan"("StudyPlanID") ON DELETE CASCADE,
    "AliasNameTh" text    NOT NULL,
    PRIMARY KEY ("StudyPlanID", "AliasNameTh")
);

-- cluster ↔ study_plan (M:N + strength ตาม taxonomy E.3)
CREATE TABLE IF NOT EXISTS public."TCompassClusterStudyPlan" (
    "ClusterID"      integer NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),  -- **v9** เดิมเป็น code
    "StudyPlanID"    integer NOT NULL REFERENCES public."TCompassStudyPlan"("StudyPlanID"),      -- **v9** integer ไม่ใช่ text code
    "Strength"       text NOT NULL,   -- 'highly_related'|'related'|'possible'|'depends_on_admission'|'not_eligible_typical'
    "ReasonTh"       text,
    "SourceRef"      text,
    "LastVerifiedAt" timestamptz,
    PRIMARY KEY ("ClusterID", "StudyPlanID")
);

-- study_plan ↔ subject (M:N) — วิชาที่สายนั้นสอน (taxonomy E.2: ตัวเชื่อมจริงคือ "วิชา" ไม่ใช่ชื่อสาย)
CREATE TABLE IF NOT EXISTS public."TCompassStudyPlanSubject" (
    "StudyPlanID" integer NOT NULL REFERENCES public."TCompassStudyPlan"("StudyPlanID") ON DELETE CASCADE,
    "Subject"     text    NOT NULL,   -- 1 ใน 8 ชื่อ canonical
    PRIMARY KEY ("StudyPlanID", "Subject")
);

-- study_plan ↔ faculty_group (M:N + strength) — **ควร derive จาก subject_requirement เมื่อมีข้อมูลพอ**
CREATE TABLE IF NOT EXISTS public."TCompassStudyPlanFacultyGroup" (
    "StudyPlanID"          integer NOT NULL REFERENCES public."TCompassStudyPlan"("StudyPlanID"),        -- **v9** integer
    "FacultyGroupID"       integer NOT NULL REFERENCES public."TCompassFacultyGroup"("FacultyGroupID"),  -- **v9** integer
    "Strength"             text NOT NULL,
    "ReasonTh"             text,
    "DerivedFromSubjects"  boolean NOT NULL DEFAULT false,
    "SourceRef"            text,
    "LastVerifiedAt"       timestamptz,
    PRIMARY KEY ("StudyPlanID", "FacultyGroupID")
);

-- L3.5 — เกณฑ์วิชาที่สาขา (TCompassProgram) ต้องการ (taxonomy E.2 — "สำคัญที่สุดและมักถูกลืม")
CREATE TABLE IF NOT EXISTS public."TCompassProgramSubjectRequirement" (
    "ProgramID"  integer  NOT NULL REFERENCES public."TCompassProgram"("ProgramID") ON DELETE CASCADE,
    "Subject"    text    NOT NULL,           -- 1 ใน 8 ชื่อ canonical
    "MinScore"   numeric,                    -- เกณฑ์คะแนนขั้นต่ำ ถ้าระบุในเอกสาร
    "MinCredit"  numeric,                    -- เกณฑ์หน่วยกิตขั้นต่ำ ถ้าระบุในเอกสาร
    "IsRequired" boolean NOT NULL DEFAULT true,
    "SourceRef"  text,
    PRIMARY KEY ("ProgramID", "Subject")
);

-- L6 — อาชีพ (master) + สาขา↔อาชีพ (M:N + strength)
-- **AI ต้องเพิ่ม output ก้อนใหม่ (รายการอาชีพที่เกี่ยวข้อง) เพื่อ populate ตารางนี้ — เป็นส่วนขยายของ
-- REQ-002 ที่ system-analyst เสนอ ยังไม่เคยถูกถามในสัมภาษณ์ — ต้องยืนยันก่อน implement (ดู OQ-F07)**
CREATE TABLE IF NOT EXISTS public."TCompassCareer" (
    "CareerID"         serial      PRIMARY KEY,   -- **v9** int identity (เดิมคอลัมน์ชื่อนี้เป็น text code)
    "CareerCode"       text        NOT NULL UNIQUE,   -- เช่น 'CR_SWE' — **v9 เปลี่ยนชื่อมาจาก "CareerID" เดิม**
    "NameTh"           text        NOT NULL,
    "LicenseRequired"  boolean NOT NULL DEFAULT false,
    "CreatedAt"        timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS public."TCompassProgramCareer" (
    "ProgramID" integer  NOT NULL REFERENCES public."TCompassProgram"("ProgramID") ON DELETE CASCADE,
    "CareerID"  integer NOT NULL REFERENCES public."TCompassCareer"("CareerID"),   -- **v9** integer ไม่ใช่ text code
    "Strength"  text   NOT NULL,   -- ตาม taxonomy E.3 5 ระดับ
    "IsManual"  boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("ProgramID", "CareerID")
);

-- ============================================================
--  กลุ่มที่ 2 — ผลของนักเรียน (ClassOnlineWeb เป็นผู้เขียนแต่ผู้เดียว)
-- ============================================================

-- REQ-012 — ทำซ้ำได้หลายรอบ จึง "เก็บประวัติ" ไม่ upsert ทับ (แทนที่ compass_behavior_result)
-- (ตั้งใจให้ต่างจาก public."TCompassMbtiResult" ของเดิมที่ทับโดยเจตนา — REQ-007/REQ-012 บังคับให้ทำซ้ำได้)
CREATE TABLE IF NOT EXISTS public."TCompassRiasecResult" (
    "ResultID"     serial   PRIMARY KEY,
    "SchoolID"     integer     NOT NULL,
    "SID"          integer     NOT NULL,
    "ProgramID"    integer      REFERENCES public."TCompassProgram"("ProgramID"),  -- NULL = โหมดดูโปรไฟล์เฉย ๆ
    "Answers"      text        NOT NULL,                -- Likert: "<question_id>:<1-5>" คั่นด้วย comma
                                                        -- **v6: เป็นสตริงว่างได้** (ตอบเฉพาะแบบเรียงลำดับ)
    "RankAnswers"  text,                                -- **ใหม่ v6** แบบเรียงลำดับ: "<option_id>:<rank>"
                                                        -- คั่นด้วย comma · NULL = ไม่ได้ตอบส่วนเรียงลำดับเลย
                                                        -- **ห้ามว่างทั้งคู่** (`"Answers" = ''` และ
                                                        -- `"RankAnswers" IS NULL`) — บังคับที่ชั้น service
    "AnsweredCount"   integer NOT NULL,                 -- **ใหม่ v6** จำนวน "ข้อที่ตอบแล้ว" ณ เวลาส่ง
                                                        -- (Likert 1 ข้อ = 1 · block เรียงลำดับที่ตอบครบ = 1)
    "ActiveItemCount" integer NOT NULL,                 -- **ใหม่ v6** จำนวนข้อ active ทั้งหมด ณ เวลาส่ง
                                                        -- **ทั้งคู่บันทึกตอนส่งเท่านั้น ห้ามคำนวณย้อนหลัง
                                                        -- จากคลังคำถามปัจจุบัน** (`## RIASEC Fit Rules` ข้อ 7)
                                                        -- นิยาม + การใช้: `## Cluster Determination Rules` ข้อ 7.1
                                                        -- **v8 (2026-09-02): ไม่ใช่ input ของ Confidence
                                                        -- อีกต่อไป (re-scope OQ-F13) — เก็บไว้เป็น
                                                        -- diagnostic เท่านั้น ค่าเท่ากันเสมอเพราะบังคับ
                                                        -- ตอบครบ 100% จึงจะส่งได้ (OQ-F11 ข้อ (ง) ปฏิเสธ)
    "ConsistencyScore" numeric,                         -- **ใหม่ v8 (2026-09-02, re-scope OQ-F13)**
                                                        -- ความสอดคล้อง Likert vs ranking รายมิติ ∈ [0,1]
                                                        -- NULL = ประเมินไม่ได้ (R=0, ดูนิยามที่
                                                        -- `## Cluster Determination Rules` ข้อ 7.2)
                                                        -- บันทึกตอนส่งเท่านั้น ห้ามคำนวณย้อนหลัง (เหตุผล
                                                        -- เดียวกับ AnsweredCount/ActiveItemCount ด้านบน)
                                                        -- เป็น input ของ ConfidenceFactor แทน AnswerCoverage
    "MatchPercent" integer,                             -- NULL เมื่อ ProgramID เป็น NULL
    "Advice"       text,
    "CreatedAt"    timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassRiasecResult_SchoolID_SID_CreatedAt"
    ON public."TCompassRiasecResult" ("SchoolID", "SID", "CreatedAt" DESC);

-- REQ-013 — ผลคำนวณ T-Score + คะแนนรวมต่อ cluster ล่าสุดของนักเรียน (คำนวณสด ไม่ upsert
-- เพื่อไม่ให้ conflict กับ TCompassRiasecResult ที่ทำซ้ำได้หลายรอบ — ดู `## Cluster Determination Rules`)
-- **สูตรและ dependency ยืนยันแล้ว (2026-08-31, OQ-F03/OQ-F06/OQ-F07 ปิด) — implement ได้
-- ยกเว้นต้องรอ DEP-F09 (`"StddevScore"`: `sb-compass REQ-017` ลง requirement แล้ว แต่คอลัมน์จริง
-- ยังไม่มีในฐานข้อมูล — ไม่ต้อง migration ตาม `sb-compass/design.md` v8)**
-- **ใหม่ v6 (2026-08-31)** — หัวรอบของการคำนวณ cluster หนึ่งครั้ง
-- เหตุผลที่ต้องมีตารางหัวรอบ: `ClarityIndex` และค่าประกอบของมันเป็นสมบัติของ **ชุดคะแนนทั้ง 11 cluster
-- ในรอบเดียวกัน** ไม่ใช่ของ cluster ใด cluster หนึ่ง — ถ้าเก็บซ้ำ 11 แถวจะเกิดสองความจริงได้ทันที
-- และขัดกับ `## Cluster Determination Rules` ข้อ 2 กติกา 4 (ฐานการคำนวณต้องเหมือนกันทั้ง 11 cluster)
CREATE TABLE IF NOT EXISTS public."TCompassStudentClusterRun" (
    "RunID"            serial   PRIMARY KEY,
    "SchoolID"         integer     NOT NULL,
    "SID"              integer     NOT NULL,
    "RiasecResultID"   integer      REFERENCES public."TCompassRiasecResult"("ResultID"),  -- NULL = ยังไม่ทำ RIASEC
    "ScoreBasis"       text        NOT NULL,   -- 'combined' | 'academic_only' | 'interest_only'
    "ClusterCount"     integer     NOT NULL,   -- n ของ `## Cluster Determination Rules` ข้อ 6.2
    "MeanOwn"          numeric,                -- ค่าเฉลี่ยของชุดคะแนนในรอบนี้ (ค่าอ้างอิงของตัวนักเรียนเอง)
    "SdOwn"            numeric,
    "GapTop"           numeric,
    "ClarityIndex"     numeric,                -- 0-100 · NULL = ประเมินความชัดเจนไม่ได้ (n < 3)
    "ClarityBand"      text,                   -- 'clear' | 'moderate' | 'unclear' · NULL คู่กับ ClarityIndex
    "ExcludedSubjects" text,                   -- กลุ่มสาระที่ถูกตัดตามข้อ 2 (คั่นด้วย comma) — ไว้วินิจฉัย ไม่ใช่ค่าที่แสดง
    "CreatedAt"        timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassStudentClusterRun_SchoolID_SID_CreatedAt"
    ON public."TCompassStudentClusterRun" ("SchoolID", "SID", "CreatedAt" DESC);

CREATE TABLE IF NOT EXISTS public."TCompassStudentClusterScore" (
    "ResultID"       serial   PRIMARY KEY,
    "RunID"          integer      NOT NULL REFERENCES public."TCompassStudentClusterRun"("RunID") ON DELETE CASCADE,
    "SchoolID"       integer     NOT NULL,
    "SID"            integer     NOT NULL,
    "ClusterID"      integer     NOT NULL REFERENCES public."TCompassInterestCluster"("ClusterID"),  -- **v9** เดิมเป็น "ClusterCode" text
    "AcademicFit"    numeric,                -- 0-100 จาก T-Score ถ่วงน้ำหนัก · **v6: NULL ได้** เมื่อกลุ่มสาระ
                                             -- ถูกตัดหมดตามข้อ 2 กติกา 3 (v5 เขียน NOT NULL ไว้ ซึ่งขัดกับกติกานั้น)
    "InterestFit"    numeric,                -- 0-100 จาก RIASEC ถ่วงน้ำหนัก · NULL ถ้ายังไม่ทำ RIASEC
    "CombinedScore"  numeric,                -- NULL ถ้าฝั่งใดฝั่งหนึ่งเป็น NULL (ยังรวมไม่ได้)
                                             -- **ค่าดิบเสมอ ห้ามเขียนทับด้วยค่าที่ผ่าน shrinkage/clarity แล้ว**
                                             -- (`## Cluster Determination Rules` ข้อ 7)
    "DisplayScore"   numeric,                -- **ใหม่ v6** ค่าที่แสดงต่อนักเรียนหลังผ่านชั้นปรับร่วม
                                             -- (clarity × confidence) ของ `## Cluster Determination Rules`
                                             -- ข้อ 7.5 (เดิมข้อ 7.4) · **ห้ามใช้จัดอันดับ** (อันดับใช้
                                             -- `"CombinedScore"` เสมอ) · **v8: OQ-F12 ปิดแล้ว (ClarityFactor
                                             -- ใช้ได้เต็มแล้ว) — ยังเหลือ NULL จนกว่า OQ-F16 จะปิด**
                                             -- (threshold ของ ConsistencyScore, เดิมรอ OQ-F13 ซึ่ง
                                             -- ปิดแบบ re-scope ไปแล้ว) — RISK-F19
    "CreatedAt"      timestamptz NOT NULL
    -- **v6: `"RiasecResultID"` ย้ายไปอยู่ที่ตารางหัวรอบ** — เดิมอยู่ที่นี่ ทำให้ 11 แถวเก็บค่าเดียวกันซ้ำ
);
CREATE INDEX IF NOT EXISTS "IX_TCompassStudentClusterScore_SchoolID_SID_CreatedAt"
    ON public."TCompassStudentClusterScore" ("SchoolID", "SID", "CreatedAt" DESC);
CREATE INDEX IF NOT EXISTS "IX_TCompassStudentClusterScore_RunID"
    ON public."TCompassStudentClusterScore" ("RunID");

-- REQ-008 — เด็กลองทำ quest จริง (FK ชี้ TCompassRiasecResult แทน compass_behavior_result)
CREATE TABLE IF NOT EXISTS public."TCompassQuestAttempt" (
    "AttemptID"  serial   PRIMARY KEY,
    "SchoolID"   integer     NOT NULL,
    "SID"        integer     NOT NULL,
    "QuestID"    integer      NOT NULL REFERENCES public."TCompassQuest"("QuestID"),
    "ResultID"   integer      REFERENCES public."TCompassRiasecResult"("ResultID"),  -- รอบทดสอบที่ทำให้เสนอ quest นี้
    "Status"     text        NOT NULL,                   -- 'suggested' | 'accepted' | 'done'
    "Reflection" text,                                   -- "ลองแล้วเป็นยังไง" — เด็กกรอกเอง
    "CreatedAt"  timestamptz NOT NULL,
    "UpdatedAt"  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "IX_TCompassQuestAttempt_SchoolID_SID_CreatedAt" ON public."TCompassQuestAttempt" ("SchoolID", "SID", "CreatedAt" DESC);

-- REQ-017 (ใหม่ v7, 2026-09-02) — "ตั้งเป็นเป้าหมาย" (target major) · append-only เหมือน
-- TCompassRiasecResult/TCompassQuestAttempt (ไม่ UPDATE ทับ) — แต่ละแถวคือ 1 การกระทำ ('active' ตอน
-- ตั้ง · 'superseded' ตอนถูกแทนที่) ไม่ใช่สถานะปัจจุบันที่ query แล้วได้ตรง ๆ
-- ดูตรรกะเต็มที่ `## Target Major Rules`
CREATE TABLE IF NOT EXISTS public."TCompassTargetProgram" (
    "TargetID"       serial   PRIMARY KEY,
    "SchoolID"       integer     NOT NULL,
    "SID"            integer     NOT NULL,
    "ProgramID"      integer      NOT NULL REFERENCES public."TCompassProgram"("ProgramID"),
    "RiasecResultID" integer      NOT NULL REFERENCES public."TCompassRiasecResult"("ResultID"),
                                             -- รอบทดสอบ REQ-007 ของสาขานี้ที่ผ่าน gate ตอนกดตั้งเป้าหมาย
                                             -- (snapshot เพื่อ audit — "ผ่าน gate ด้วยอะไร" ไม่ใช่ตัวกำหนด gate เอง)
    "Status"         text        NOT NULL,   -- 'active' | 'superseded' — ดูข้อ 3 ของ `## Target Major Rules`
    "SetAt"          timestamptz NOT NULL,
    "SupersededAt"   timestamptz             -- NULL ขณะยังเป็น 'active'
);
CREATE INDEX IF NOT EXISTS "IX_TCompassTargetProgram_SchoolID_SID_ProgramID_SetAt"
    ON public."TCompassTargetProgram" ("SchoolID", "SID", "ProgramID", "SetAt" DESC);
-- OQ-F14 ปิด 2026-09-15: นักเรียน 1 คนมีเป้าหมาย active ได้สูงสุด 1 รายการ (AC-017.4)
CREATE UNIQUE INDEX IF NOT EXISTS "UX_TCompassTargetProgram_Active_Student"
    ON public."TCompassTargetProgram" ("SchoolID", "SID")
    WHERE "Status" = 'active';
```

### ข้อมูลตั้งต้นที่ migration ต้อง seed

> **v9 (2026-09-15) — กติกาการเขียน seed หลังเปลี่ยน PK เป็น int identity**: ทุกตาราง master ด้านล่าง
> **ห้ามระบุค่า PK เอง** (เป็น `serial` ฐานข้อมูลออกให้) · ทุก seed ที่เป็นตารางเชื่อม
> (`TCompassClusterFacultyGroup`, `TCompassClusterStudyPlan`, `TCompassStudyPlanFacultyGroup`,
> `TCompassClusterSubjectWeight`, `TCompassClusterRiasecWeight`, ...) ต้องเขียนเป็น
> `INSERT ... SELECT ... JOIN` ที่แปลง **code → Id** ตอนรัน (เช่น
> `JOIN public."TCompassInterestCluster" c ON c."ClusterCode" = v.cluster_code`) — ตรงกับที่สคริปต์
> bootstrap จริงทำอยู่ · `ON CONFLICT` ของตาราง master ใช้คอลัมน์ **code** (`"ClusterCode"`,
> `"FacultyGroupCode"`, `"DimensionCode"`, `"TrackCode"`, `"UniversityCode"`, ...) ไม่ใช่ Id

- **`public."TCompassInterestCluster"`** — 11 แถว (C1-C11) ตาม `education-pathway-taxonomy-design.md` ส่วน C ตรง ๆ
- **`public."TCompassFacultyGroup"`** — 26 แถว ตามส่วน A.5/D ของเอกสารเดียวกัน
- **`public."TCompassClusterFacultyGroup"`** — mapping ตามตาราง Section D ของเอกสารเดียวกัน (26/26 ครบ ตามที่เอกสารยืนยัน Validation ไว้แล้ว)
- **`public."TCompassRiasecDimension"`** — 6 แถวคงที่: `R` (Realistic) · `I` (Investigative) · `A` (Artistic) ·
  `S` (Social) · `E` (Enterprising) · `C` (Conventional) — เป็นมาตรฐาน Holland Code ทั่วไป ไม่ใช่ของที่ระบบคิดเอง
- **`public."TCompassEducationTrack"`** — 1 แถว: `upper_secondary`
- **`public."TCompassClusterSubjectWeight"` (11×8), `public."TCompassClusterRiasecWeight"` (11×6)** — **sign-off
  แล้ว (2026-08-31, OQ-F07 ปิด) — seed ค่าที่ร่างจาก `education-pathway-taxonomy-design.md` ส่วน C
  ได้ทันที** (ยังมาร์กเป็นสมมติฐานไม่มีแหล่งอ้างอิงภายนอกต่อ ตาม RISK-F15) ·
  🔴 **v11 (2026-09-16): แต่ "ค่าที่ร่างไว้" ไม่เคยถูกบันทึกลงไฟล์ใดเลย** — เอกสารนี้เขียนไว้แค่
  ตัวอย่างราย cluster, เอกสาร taxonomy ไม่มีตารางตัวเลข 3/2/1 (ตรวจไฟล์จริงแล้ว), และสคริปต์ bootstrap
  **ปฏิเสธเดาค่าเองโดยเจตนา** (บรรทัด 579-585) → สองตารางนี้จึงยังว่าง · ค่าฉบับที่ยืนยันแล้ว
  (engineering default ตามการมอบสิทธิ์ — OQ-F18 ปิด 2026-09-16) อยู่ที่ `## DES-022` §4a —
  **INSERT seed ได้แล้ว**
- **`public."TCompassRiasecQuestion"`, `public."TCompassRiasecRankBlock"`, `public."TCompassRiasecRankOption"`**
  — **ห้าม seed ในรอบ migration** เป็นเนื้อหาที่ต้องผ่าน `uxui-designer` ก่อนทั้งสองรูปแบบ
  (`## RIASEC Fit Rules` ข้อ 0) · ระบบต้องทำงานได้ปกติเมื่อตารางเหล่านี้ยังว่าง (ไม่มีมิติใดมีค่า
  → `InterestFit` เป็น `NULL` ทุก cluster ตามข้อ 3 ไม่ใช่ error)
- **`public."TCompassStudyPlan"*`, `public."TCompassProgramSubjectRequirement"`, `public."TCompassCareer"`,
  `public."TCompassProgramCareer"`** — **ยังไม่ seed** จนกว่าจะมีคนไปหาเนื้อหาจริงมา (ตารางเนื้อหา
  L2/L3/L3.5/L6 — ไม่บล็อกรอบนี้ตาม DES-015 เพราะไม่มีตัวไหนที่ Module F/G/H/I-a/I-b ต้องใช้)

> **สถานะของการเปลี่ยนแปลงรอบ v9 (2026-09-15) — บันทึกไว้เป็นร้อยแก้วโดยเจตนา ไม่ใช่ claim block**
> `## Data Model` เป็นหัวข้อมาตรฐานของ schema เอกสาร **ไม่ใช่ contract section ที่มี `DES-NNN`** จึง
> **ไม่ผูก `Contract:`/`DEC-`/`Evidence` เข้ากับหัวข้อนี้** ตามแบบแผนเดียวกับทุกโมดูล — หมวดสัญญาที่ต้อง
> ใช้บริบทของ Data Model อ้างถึงมันเป็นร้อยแก้วแทน (`## DES-018` เป็นเจ้าของกติกาความเป็นเจ้าของ/DDL)
> - **Compatibility: breaking** — ร่าง/โค้ด/seed ใด ๆ ที่เคยใช้ text code เป็นคีย์ต้องถูกแก้ ไม่ใช่รันคู่ขนาน
> - **Migration/backfill: none** — ผู้ใช้ยืนยัน 2026-09-15 ในไฟล์ DDL เองว่าฐานข้อมูลถูก `DROP ... CASCADE`
>   แล้วสร้างใหม่ทั้งก้อนเพราะยังไม่มีข้อมูลจริง (ทุก phase `implemented ⬜` ตาม `status.md`) —
>   **ห้ามตีความว่า "ไม่มี migration" แปลว่า "ไม่ breaking"**
> - **Security: none** — การเปลี่ยน PK ไม่แตะเส้นแบ่งข้อมูลนักเรียน/AI ของ `## DES-018` และไม่เปลี่ยน grant ของใคร
> - **Fallback** — code ที่ resolve เป็น Id ไม่ได้ (cluster/dimension/faculty group/study plan/career/
>   university) → validate ไม่ผ่าน เก็บ `ai_raw_response` ตั้ง `analysis_status = 'ai_incomplete'`
>   ให้คนกรอกต่อ ตาม `## DES-019` ข้อ 5 — **ห้ามสร้างแถว master ใหม่อัตโนมัติ ห้ามเขียน Id ที่เดาเอง
>   ห้าม error ถึงมือเด็ก**
> - **Material ambiguity: none** *(อัปเดต v11 2026-09-16 — ปิดครบทั้งสองจุด)*: ที่อยู่ฐานข้อมูล
>   `PGGradeDB` vs `SB_Compass` reconcile แล้ว (RISK-F22 ปิด) · ความกว้าง PK ปิดแล้วโดยผู้ใช้ยืนยัน
>   ยึด DDL จริง (`serial`/`integer`) — DDL ด้านล่างแก้ตรงกันทุกตัว (OQ-F17 ปิด)
> - **หลักฐานของรอบนี้** — `ClassOnlineWeb/DatabaseScripts/Compass/bootstrap-sb-compass-db.sql`
>   (หัวไฟล์บรรทัด 20 บันทึกการเปลี่ยน PK + คำยืนยันของผู้ใช้ · DDL ตาราง master เริ่มบรรทัด 76 ·
>   seed แบบ code → Id JOIN บรรทัด 542) — **อ่านไฟล์จริงในเซสชันที่ไม่มี shell** จึงยืนยัน
>   path/บรรทัด/เนื้อหาได้ แต่คำนวณ `revision`/`hash` ไม่ได้ · งานที่ต้องใช้สัญญาแบบอ้างอิงได้ให้ผูกกับ
>   **`DES-018` / `DEC-018` / `Contract:DatabaseOwnershipBoundary.v1`** ซึ่งเป็นเจ้าของกติกา DDL อยู่แล้ว

---

## DES-018 — Database Ownership Boundary

**สัญญาที่สำคัญที่สุดของโมดูลนี้ — สอง codebase ใช้ฐานข้อมูลเดียวกัน ถ้าไม่บังคับข้อนี้จะกลายเป็น drift**

> 🟢 **v5 (2026-08-31) — OQ-F10 ปิดด้วยตัวเลือก B**: ตารางทั้งหมดในแถวแรกด้านล่างเปลี่ยนชื่อเป็น
> `public."T<PascalCase>"` แล้ว (เดิมร่างเป็น snake_case) — ดู `## Table Naming Convention` และ
> `## Data Model` สำหรับ DDL เต็ม

> 🔴 **v11 (2026-09-16) — เพิ่มมิติ "ที่อยู่" ของตารางทุกกลุ่ม (ปิด RISK-F22)**: ตารางสองแถวแรก
> ด้านล่างอยู่ใน **`SB_Compass`** (`10.0.0.128:9499` · `PGCompass_*` ของ `prod.config:141-145`) ·
> **ตารางของ `sb-compass` เอง (3 ตัว) ก็อยู่ใน `SB_Compass` เช่นกัน** (ผู้ใช้ชี้ขาด 2026-09-16 —
> Module C ต้องเปลี่ยน connection จาก `PGGradeDBEntities` ก่อนสร้างจริง เพราะโค้ดปัจจุบัน
> `CompassRankingService.cs:33` ยังพาไปตก `PGGradeDB` ผิดฐาน) · ส่วน SB PLUS + ฐานข้อมูลเกรด
> คงอยู่ใน **`PGGradeDB`** (`10.0.0.136:9499` · `PGGradeDBEntities` — `configSource-prod.config:10`)
> — ~~legacy ไม่ย้าย (ผู้ใช้ยืนยัน 2026-09-14)~~ *(v12 แก้: ไม่มีตาราง Compass — legacy หรือใหม่ —
> คงอยู่ใน `PGGradeDB` เลย ผู้ใช้ยืนยัน 2026-09-16 · กลุ่มนี้คือตารางเกรด/SB PLUS ล้วน)* · **กติกาใหม่ที่ห้ามผ่อน: ห้าม JOIN ข้ามสองฐานใน SQL
> เดียว** — รวมข้อมูลข้ามฐานที่ชั้น application เท่านั้น · `ClassOnlineWeb` ต้องเพิ่ม connection
> ใหม่สำหรับ `SB_Compass` (PRE-F10) — โค้ดปัจจุบันทุกไฟล์ของโมดูลนี้ยังใช้ `PGGradeDBEntities`
> กับตาราง Compass ซึ่งไม่ตรงที่อยู่จริง (RISK-F23) · กติกา ความเป็นเจ้าของ/ผู้เขียน/ผู้อ่าน
> ในตารางด้านล่าง **ไม่เปลี่ยนทุกช่อง** — เปลี่ยนเฉพาะที่อยู่ ไม่ใช่สิทธิ์

| ตาราง | ผู้เขียน | ผู้อ่าน |
|---|---|---|
| `public."TCompassUniversity"` · `public."TCompassInterestCluster"` · `public."TCompassFacultyGroup"` · `public."TCompassClusterFacultyGroup"` · `public."TCompassRiasecDimension"` · `public."TCompassProgramSource"` · `public."TCompassProgramIntake"` · `public."TCompassProgram"` · `public."TCompassProgramSubjectWeight"` · `public."TCompassProgramCluster"` · `public."TCompassClusterSubjectWeight"` · `public."TCompassClusterRiasecWeight"` · `public."TCompassProgramRiasecProfile"` · `public."TCompassRiasecQuestion"` · `public."TCompassQuest"` · `public."TCompassEducationTrack"` · `public."TCompassStudyPlan"` · `public."TCompassStudyPlanAlias"` · `public."TCompassClusterStudyPlan"` · `public."TCompassStudyPlanSubject"` · `public."TCompassStudyPlanFacultyGroup"` · `public."TCompassProgramSubjectRequirement"` · `public."TCompassCareer"` · `public."TCompassProgramCareer"` | **Curriculum Service เท่านั้น** | Curriculum Service (เต็ม) · **`ClassOnlineWeb` อ่านอย่างเดียว** |
| `public."TCompassRiasecResult"` · `public."TCompassStudentClusterScore"` · `public."TCompassQuestAttempt"` · `public."TCompassTargetProgram"` *(ใหม่ v7, REQ-017)* | **`ClassOnlineWeb` เท่านั้น** | `ClassOnlineWeb` เท่านั้น · **Curriculum Service ห้ามอ่าน** (เป็นข้อมูลนักเรียน) |
| ตารางเดิมทั้งหมดของ `sb-compass` (รวม `public."TCompassLevelSubjectStat"` ที่กำลังจะเพิ่มคอลัมน์ `"StddevScore"` ตาม **`sb-compass REQ-017`** — requirement ลงแล้ว 2026-08-31 · DDL/batch/implement ยังไม่เสร็จ ดู RISK-F14/DEP-F09 · **DDL ของคอลัมน์นั้นเป็นของ `sb-compass/design.md` ไม่ใช่เอกสารนี้**) · ตาราง SB PLUS · ฐานข้อมูลเกรด | ตามที่ `sb-compass/design.md` Contract Version 8 กำหนดไว้ | **Curriculum Service ห้ามแตะทั้งหมด** · `ClassOnlineWeb` (โมดูลนี้) อ่าน `public."TCompassLevelSubjectStat"` ได้อย่างเดียวเพื่อคำนวณ T-Score (REQ-013) — **ไม่เขียน ไม่ว่ากรณีใด** |

**หมายเหตุ (แทนที่ตารางเดิมของรอบที่ 1 ทั้งหมด)**: `compass_program_path`, `compass_behavior_trait`,
`compass_program_behavior_trait`, `compass_behavior_question`, `compass_behavior_result` ของรอบที่ 1
**ถูกแทนที่แล้วในรอบที่ 2** ด้วยตารางที่อิงคลัสเตอร์/RIASEC ข้างต้น — ไม่มีข้อมูลจริงสูญหาย
เพราะยังไม่เคย implement (ดู `status.md`)

### กฎที่ห้ามผ่อน

1. **`ClassOnlineWeb` ห้ามรัน `CREATE TABLE` / `ALTER TABLE` / `INSERT` / `UPDATE` / `DELETE`
   กับตารางกลุ่มคลังหลักสูตร** ไม่ว่ากรณีใด · การเพิ่ม `EnsureTables` ให้ครอบตารางใหม่ = ❌
2. **Curriculum Service ต้องไม่มีทางเข้าถึงข้อมูลนักเรียนเลย** — ไม่อ่าน `compass_behavior_result`,
   `public."TCompassQuestAttempt"`, `public."TCompassStudentLevelScore"`, `public."TCompassMbtiResult"`, ตารางเกรด
   หรือตาราง SB PLUS · **นี่คือการบังคับ REQ-010 ที่ระดับสถาปัตยกรรม ไม่ใช่ระดับ code review**
   → `devops` ควรบังคับด้วย DB grant แยก user ไม่ใช่พึ่งวินัยของโค้ด (PRE-F04)
3. **ไม่มี HTTP call จาก `ClassOnlineWeb` ไป Curriculum Service เลยแม้แต่จุดเดียว** ·
   `ClassOnlineWeb` อ่านตารางตรง ๆ ด้วย raw SQL + `NpgsqlParameter` ตาม pattern เดิมของโมดูล
   · **เหตุผลเชิงธุรกิจ**: เด็กที่กำลังเปิดหน้าจอต้องไม่พังเมื่อ service ล่ม ซึ่งเป็นเหตุผลเดียวกับที่
   REQ-002 บังคับให้ cache ผล AI ไว้ตั้งแต่ตอน import · HTTP API ของ service มีไว้ให้หน้าจอแอดมิน
   ของตัวเองใช้ ไม่ใช่ให้แอปนักเรียนเรียก
4. **การเปลี่ยนโครงตารางกลุ่มคลังหลักสูตรทำผ่าน migration ของ Curriculum Service เท่านั้น** และ
   ต้อง amend เอกสารนี้ก่อนเสมอ (`policies/architecture.md` §7) · `ClassOnlineWeb` ต้องทนกับการ
   มีคอลัมน์ใหม่ที่มันไม่รู้จัก — **ห้ามใช้ `SELECT *`** ให้ระบุคอลัมน์เสมอ
5. **`ClassOnlineWeb` ห้าม JOIN ข้ามไปตารางนักเรียนแล้วส่งออกนอกระบบ** และ **ห้ามส่งข้อมูลใด ๆ
   ของนักเรียนไปยัง Curriculum Service หรือผู้ให้บริการ AI** (REQ-010)

### กฎการ quote identifier — **ข้อห้ามที่ engineer ผิดพลาดไม่ได้ (v5, หลังปิด OQ-F10)**

ทุกตารางในโมดูลนี้เป็น `public."T<PascalCase>"` + คอลัมน์ `"PascalCase"` (quoted) ตั้งแต่แรก
(OQ-F10 ปิดด้วยตัวเลือก B — ดู `## Table Naming Convention`) ตรงกับ pattern เดียวกับที่
`sb-compass/design.md` Contract Version 8 ใช้กับ 3 ตารางของโมดูลนั้น — กฎการ quote จึงเหมือนกัน:

1. **PostgreSQL fold identifier ที่ไม่ quote เป็นตัวพิมพ์เล็กทั้งหมด** → `SELECT ProgramName FROM
   TCompassProgram` จะกลายเป็น `programname`/`tcompassprogram` และ **พังทันทีตอน runtime** ไม่ใช่ตอน
   compile — ราว SQL ทั้งหมดของ `ClassOnlineWeb` และ ORM query ทั้งหมดของ Curriculum Service
   (Python) ต้อง quote ชื่อตารางและชื่อคอลัมน์ทุกตัวด้วย `"` เสมอ รวมถึงใน `CREATE TABLE IF NOT
   EXISTS`, `CREATE INDEX`, `INSERT`, `UPDATE`, `SELECT`, `ON CONFLICT`
2. **ระบุ schema `public.` กับชื่อตารางเสมอ** ตามรูปแบบของ `schoolbright-backend`
3. **ห้ามใช้ `SELECT *`** — ระบุคอลัมน์ที่ quote แล้วเสมอ (ซ้ำกับข้อ 4 ด้านบน แต่ย้ำเพราะเป็นเหตุผล
   quoting ด้วย ไม่ใช่แค่ forward-compat)
4. **`NpgsqlParameter` (ฝั่ง `ClassOnlineWeb`) / parameterized query (ฝั่ง Curriculum Service)
   ยังเป็นข้อบังคับเหมือนเดิม** — การ quote identifier เป็นคนละเรื่องกับการป้องกัน SQL injection
   **ห้ามเข้าใจสลับกัน** และ **ห้ามต่อ string ชื่อคอลัมน์จากค่าที่รับเข้ามา**
5. ตารางภายนอกที่อ่านอย่างเดียว (ตารางเดิมของ `sb-compass`, SB PLUS, ฐานข้อมูลเกรด) **ใช้ชื่อของ
   ตัวเองตามเดิมทุกตัว** — เช่น `PGTGradeDetail."sID"` ยังเป็น `"sID"` ตัวเล็ก **ห้าม "แก้ให้ตรงกัน"**

### หมายเหตุเรื่องการ migrate ไป .NET 10 — **อย่ากลับมารื้อข้อนี้**

เส้นแบ่งข้างบนถูกเลือกโดย **ไม่อ้างอิงเวอร์ชัน framework ของ `ClassOnlineWeb` โดยเจตนา** —
ทั้ง .NET Framework 4.8 และ .NET 10 ต่อ PostgreSQL ได้เท่ากัน สัญญาระหว่างสองฝั่งคือ **ตาราง
ไม่ใช่ API** จึงข้ามการ migrate ได้โดยไม่ต้องแก้อะไรเลย

ข้อจำกัดเฉพาะยุค 4.8 ที่พบตอนวิเคราะห์ (**ไม่มี pattern `HttpClient` ทั้งโปรเจกต์** · **Npgsql
4.1.13** ซึ่งเก่าเกินกว่าจะรองรับ `pgvector` · **ไม่มี Python runtime**) เป็นเหตุผลที่ Curriculum
Service **ไม่ควรผูกกับ process นั้นตั้งแต่แรก** ไม่ใช่ข้อจำกัดถาวรที่ต้องออกแบบอ้อมมัน —
**การ migrate 4.8 → .NET 10 ในอนาคตจึงไม่ใช่เหตุผลให้เปิดการตัดสิน D1/D2 ใหม่**

Contract:DatabaseOwnershipBoundary.v1
DEC-018

Evidence EVD-001: claim=DES-018 | state=confirmed | path=ClassOnlineWeb/Helper/CompassClusterService.cs | symbol=LoadNationalStats | line=309 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=43fd40e54fd80003a1045bc4f72fa8103984105e55a425b454830ea5cfb36bcf
Evidence EVD-002: claim=Contract:DatabaseOwnershipBoundary.v1 | state=confirmed | path=ClassOnlineWeb/Helper/CompassClusterService.cs | symbol=DetermineAsync | line=232 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=43fd40e54fd80003a1045bc4f72fa8103984105e55a425b454830ea5cfb36bcf
Evidence EVD-003: claim=DEC-018 | state=confirmed | path=ClassOnlineWeb/Helper/CompassScoreService.cs | symbol=GetCanonicalSubjectAveragesAsync | line=282 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6dfb00c0d5804542dc39cedc0da77d9c81f97b4ecb8003524dfb3ddcdb32fdc5
Evidence EVD-031: claim=Contract:DatabaseOwnershipBoundary.v1 | state=confirmed | path=ClassOnlineWeb/DatabaseScripts/Compass/bootstrap-sb-compass-db.sql | symbol=app_kindergarten | line=7 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=72a9d61b6010d48df187c8ef30011a192593fc55787800518e2438a81189d418
Evidence EVD-032: claim=DES-018 | state=confirmed | path=ClassOnlineWeb/prod.config | symbol=PGCompass_DataSource | line=141 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=8261bd0ff4d26626b3d6663524532fb8d541f2285a93525546b32033ea48cc6d
Evidence EVD-033: claim=Contract:DatabaseOwnershipBoundary.v1 | state=confirmed | path=ClassOnlineWeb/configSource-prod.config | symbol=PGGradeDBEntities | line=10 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=527c343faac7bf7ba50b3b7bd7f7c0889769b69eb587fea89107201829e13cc6
Evidence EVD-034: claim=DEC-018 | state=confirmed | path=ClassOnlineWeb/Helper/CompassRiasecService.cs | symbol=GradePrimary | line=28 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=fef1d2089dd13826320bdac72272a5f86e833732bd2f8158dba374797c74ce4d

Compatibility: breaking
Data/schema: additive
Migration/backfill: none
Security: sensitive
Fallback: ตาราง/คอลัมน์ที่อ่านไม่ได้ → ClassOnlineWeb ถือว่า national stats ไม่พร้อมแล้วเดินตามกติกา DES-022 §2 ข้อ 3 (AcademicFit = NULL → ใช้ InterestFit อย่างเดียว หรือแสดงข้อความ "ยังประเมินไม่ได้") — ห้าม error และห้าม fallback ไปเขียนตารางกลุ่มคลังหลักสูตรเองทุกกรณี
Material ambiguity: none

---

## DES-019 — Import Rules

**สัญญาของ REQ-001 + REQ-002 + REQ-004 — engineer ห้ามตัดสินกรณีใดในนี้เอง**

### 1. ลำดับขั้นตอน และจุดที่ห้ามข้าม

```
staff อัปโหลด PDF
  → เก็บไฟล์ต้นฉบับ + sha256          (public."TCompassProgramSource")
  → markitdown แปลง                    (conversion_status)
  → ถ้า conversion_status ≠ 'ok'  →  หยุด ห้ามเรียก AI  →  เข้าคิวให้คนจัดการ
  → เรียก glm-5.2 หนึ่งครั้ง ต่อหนึ่งสาขา
  → validate ผล                        (public."TCompassProgramIntake")
  → คนตรวจ/แก้/ตัดสิน                  (resolution)
  → คนกดอนุมัติ                        (public."TCompassProgram".status = 'approved')
  → เด็กจึงเห็น
```

**ห้ามเรียก AI ตอนเด็กเปิดหน้าจอ ไม่ว่ากรณีใดทั้งสิ้น** — ทั้งเพราะค่าใช้จ่ายโตตามจำนวนเด็ก และ
เพราะผลที่เด็กเห็นจะไม่นิ่ง (REQ-002) · ฝั่ง `ClassOnlineWeb` **ไม่มีโค้ดที่เรียก AI เลย** โดยการออกแบบ

> **v13 (2026-09-16)** — แหล่งค่า config ของขั้น "เรียก `glm-5.2`" (endpoint/key/model) = คีย์ `ApiKey` /
> `Endpoint` / `Model` ใน `ClassOnlineWeb/prod.config` แหล่งเดียว (มติผู้ใช้ 2026-09-16 —
> ตัดสินทับกติกายุค D1 "secret store ของ service") · ~~`devops` ฉีดเข้า env `CURRICULUM_*` ตอน launch~~
> *(v14 2026-09-16 — ผู้ใช้ตัดสิน "ให้ อ่านจาก prod.config แทนสิ": service แยกพาร์ส XML ของ
> `prod.config` เองโดยตรง ไม่มีขั้น env-injection · ลำดับค่า: env `CURRICULUM_*` ที่ตั้งชัดเจน > XML >
> `.env` (legacy mirror) > defaults — ดู PRE-F01)* ·
> **กติกาที่ยังผูกกับขั้นนี้คงเดิมทุกข้อ**: ห้าม hardcode คีย์ในซอร์สทุกไฟล์ · `ClassOnlineWeb` ยังไม่มีโค้ด
> เรียก AI เด็ดขาด · `/readyz` รายงานแค่การมีอยู่ของค่า ห้ามรายงานค่า — รายละเอียดที่ PRE-F01/RISK-F05

### 2. `conversion_status` — กันความล้มเหลวแบบเงียบจาก PDF สแกน

| ค่า | เงื่อนไข | ทำอะไรต่อ |
|---|---|---|
| `'ok'` | แปลงสำเร็จ **และ** ข้อความหลัง trim ยาว **≥ 200 ตัวอักษร** | เรียก AI ต่อ |
| `'empty'` | แปลงสำเร็จแต่ข้อความหลัง trim **< 200 ตัวอักษร** (เกือบทุกครั้งคือ PDF เป็นภาพสแกน) | **ห้ามเรียก AI** · เข้าคิวพร้อมข้อความบอกให้ลอง OCR หรือกรอกมือ |
| `'failed'` | markitdown throw / ไฟล์เสีย / ไม่ใช่ PDF | **ห้ามเรียก AI** · เก็บ error ลง `conversion_note` |

**เหตุผลของเกณฑ์ 200**: เอกสารหลักสูตรจริงไม่มีทางสั้นกว่านี้ · ถ้าปล่อยข้อความว่างเข้า AI มันจะ
"วิเคราะห์" ความว่างเปล่าออกมาเป็นข้อมูลที่ดูใช้ได้ โดยไม่มีอะไรฟ้อง — นั่นคือความล้มเหลวแบบที่
คนตรวจจับไม่ได้ **ตัวเลข 200 เป็นค่าที่เอกสารนี้กำหนด ไม่ได้มาจาก requirement**

### 3. หนึ่งเอกสารมีหลายสาขา — และเรื่องความยาว

- เอกสารหลักสูตรหนึ่งฉบับมักมีหลายสาขา → **แยกเอกสารเป็นส่วน ๆ ตามสาขาก่อน แล้วเรียก AI
  หนึ่งครั้งต่อหนึ่งสาขา** ไม่ใช่ยัดทั้งเล่มเข้าไปครั้งเดียว
- ถ้าส่วนของสาขาเดียวยังยาวเกิน budget ของโมเดล → ตัดเพิ่มที่ **ขอบเขตหัวข้อ markdown
  (`#`/`##`) เท่านั้น ห้ามตัดกลางตาราง** · ถ้าหัวข้อเดียวยังยาวเกิน ให้ตัดที่ขอบเขตย่อหน้า
- **กติกาการรวมผลจากหลายชิ้น** (deterministic ห้ามใช้ดุลพินิจ):
  - น้ำหนักกลุ่มสาระ: กลุ่มสาระที่โผล่หลายชิ้น → **ใช้ค่าน้ำหนักที่มากที่สุด**
  - มิติ RIASEC: มิติที่โผล่หลายชิ้น → **ค่าเฉลี่ยแล้วปัดเป็นจำนวนเต็มที่ใกล้ที่สุด** (`.5` ปัดขึ้น) — กติกาเดียวกับแกนพฤติกรรมเดิมของรอบที่ 1
  - ข้อความบรรยาย: ต่อกันตามลำดับชิ้น
  - cluster ที่เสนอ: **รวมทุกชิ้นแบบ union ไม่ใช่ intersection** (สาขาอาจเกี่ยวข้องกับหลาย cluster ตามที่ taxonomy เองรองรับ multi-category)
- **ทุกครั้งที่ต้องตัดชิ้น ให้ตั้ง `analysis_status = 'ai_incomplete'` เสมอ** เพื่อบังคับให้คนอ่านซ้ำ

### 4. สิ่งที่ส่งออกไปหา AI ได้ และห้ามส่ง

- **ส่งได้อย่างเดียว**: ข้อความจากเอกสารหลักสูตรของมหาวิทยาลัย
- **ห้ามส่งเด็ดขาด**: ชื่อเด็ก · คะแนนเด็ก · ผลแบบทดสอบ · ชื่อโรงเรียนของเด็ก · ข้อมูลใด ๆ
  จากตารางนักเรียน (REQ-010) · **Curriculum Service ไม่มีสิทธิ์อ่านข้อมูลพวกนี้อยู่แล้วโดยการออกแบบ**

### 5. รูปแบบผลลัพธ์ที่ AI ต้องคืน และการ validate

**แก้ไข 2026-08-31 (REQ-012/014/015)** — AI ต้องคืน JSON ต่อหนึ่งสาขา ประกอบด้วย: ชื่อสาขา · ชื่อคณะ ·
รหัสหลักสูตร (ถ้ามี) · รายการกลุ่มสาระพร้อมน้ำหนัก · ข้อความบรรยายโปรไฟล์พฤติกรรม ·
**รายการมิติ RIASEC พร้อมระดับ 1-5** (แทนที่ "รายการแกนพฤติกรรม 8 แกน" เดิม) ·
**รายการ interest cluster ที่เสนอ** (แทนที่ "รายการสายที่เสนอ" เดิม) ·
**กลุ่มคณะเดิม (26 กลุ่ม) ที่เสนอ 1 ค่า** (ฟิลด์ใหม่ REQ-014 — **v9: ฟิลด์ `faculty_group_code`
เป็น text code · service แปลงเป็น `public."TCompassProgram"."FacultyGroupID"` (integer) ก่อนเขียน**) ·
**รายการอาชีพที่เกี่ยวข้อง (ฟิลด์ใหม่ที่ระบบเสนอเพื่อรองรับ L6 ตาม REQ-015 — ยังไม่เคยถูกถามใน
สัมภาษณ์ ต้องยืนยันก่อน implement ดู OQ-F07)**

**กติกา validate — ทุกข้อบังคับ ไม่มีข้อยกเว้น:**

| ตรวจอะไร | เกณฑ์ | ไม่ผ่านแล้วทำอย่างไร |
|---|---|---|
| ชื่อกลุ่มสาระ | ต้องตรงกับ **8 สตริงไทย canonical เป๊ะ ๆ** หลัง trim ช่องว่างหัวท้ายเท่านั้น · **ห้าม fuzzy match ห้าม normalize อย่างอื่น ห้ามเดาว่าใกล้เคียง** | แถวนั้นไม่ถูกเก็บ · `analysis_status = 'ai_incomplete'` · เก็บ `ai_raw_response` ไว้ครบ |
| น้ำหนัก | ต้องเป็น `1` / `2` / `3` หรือคำว่า `น้อย` / `ปานกลาง` / `มาก` (แปลงเป็น 1/2/3) | เหมือนข้างบน |
| `dimension_code` | ต้องตรงกับ `"DimensionCode"` 1 ใน 6 มิติของ `public."TCompassRiasecDimension"` (`R`/`I`/`A`/`S`/`E`/`C`) — **แทนที่ `trait_code` เดิม 8 แกน** | เหมือนข้างบน |
| `desired_level` | จำนวนเต็ม 1-5 | เหมือนข้างบน |
| `cluster_code` | ต้องตรงกับ `"ClusterCode"` 1 ใน 11 code ของ `public."TCompassInterestCluster"` — **แทนที่ `path_code` เดิม 8 code** | เหมือนข้างบน |
| `faculty_group_code` | ต้องตรงกับ `"FacultyGroupCode"` 1 ใน 26 code ของ `public."TCompassFacultyGroup"` (**v9: ฟิลด์นี้เดิมชื่อ `faculty_group_id` ในสัญญา AI — เปลี่ยนชื่อให้ตรงความจริง เพราะ `"FacultyGroupID"` เป็น int identity ของฐานข้อมูลไปแล้ว**) | ถ้าไม่ผ่าน → ปล่อย `public."TCompassProgram"."FacultyGroupID"` เป็น `NULL` ให้คนกรอกเอง ไม่ปฏิเสธทั้งก้อน |

> **v9 (2026-09-15) — สัญญากับ AI ยังเป็น "code" เสมอ ห้ามเปลี่ยนเป็น Id**: ทั้งสามฟิลด์ข้างบน
> (`dimension_code`, `cluster_code`, `faculty_group_code`) เป็น **text code** ต่อไป · service เป็นผู้
> resolve เป็น `"DimensionID"` / `"ClusterID"` / `"FacultyGroupID"` (integer) ก่อนเขียนลงตาราง ·
> **ห้ามส่งเลข Id เข้า prompt และห้ามให้ AI คืน Id** — Id เป็นค่าที่ฐานข้อมูลออกเอง ไม่เสถียรข้าม
> สภาพแวดล้อม และ AI ไม่มีทางรู้ค่าที่ถูกต้องได้ (RISK-F21) · **code ที่ resolve ไม่พบ = validate ไม่ผ่าน
> ห้ามสร้างแถว master ใหม่ให้อัตโนมัติ** (11 cluster / 6 มิติ / 26 กลุ่มคณะ เป็นชุดปิดตาม `## Data Model`)

**8 ชื่อกลุ่มสาระ canonical** (ยืนยันจาก `CompassScoreService.MapCanonicalSubject`,
`CompassScoreService.cs:296-311` — **นี่คือคีย์เชื่อมเดียวระหว่างผล AI กับคะแนนเด็ก**):
`คณิตศาสตร์` · `วิทยาศาสตร์` · `ภาษาอังกฤษ` · `ภาษาไทย` · `สังคมศึกษา` ·
`สุขศึกษาและพลศึกษา` · `ศิลปะ` · `การงานอาชีพและเทคโนโลยี`

**11 cluster code** (seed จาก `education-pathway-taxonomy-design.md` ส่วน C — **แทนที่ 8 path code
เดิมของ `CompassPathCatalog` ในสายงานนี้ทั้งหมด**):
`C1` health_care · `C2` science_research · `C3` computing_digital · `C4` engineering_making ·
`C5` business_money · `C6` service_travel · `C7` agri_food_env · `C8` law_governance ·
`C9` language_media_humanities · `C10` art_design_music · `C11` teaching_people

**6 มิติ RIASEC** (มาตรฐาน Holland Code — แทนที่ 8 `trait_code` ที่ระบบออกแบบเองในรอบที่ 1):
`R` Realistic · `I` Investigative · `A` Artistic · `S` Social · `E` Enterprising · `C` Conventional

**สำคัญ — เก็บของที่ validate ไม่ผ่านไว้เสมอ ห้ามทิ้ง**: `ai_raw_response` ต้องถูกบันทึกทุกครั้ง
แม้ validate ล้มทั้งก้อน · ที่ 10 สาขาความต่างนี้เล็ก แต่ที่ 200 สาขาข้ามหลายมหาวิทยาลัย
นี่คือส่วนต่างระหว่าง "คนตรวจแก้ 30 วินาที" กับ "คนตรวจกรอกใหม่ทั้งสาขา" (RISK-F08)

**เก็บบางส่วนได้ ไม่ต้อง all-or-nothing**: แถวที่ผ่าน validate ให้เก็บ แถวที่ไม่ผ่านให้ทิ้งพร้อม
ตั้ง `ai_incomplete` · ปลอดภัยเพราะสาขายังไม่ `approved` เด็กจึงยังไม่เห็นอะไรทั้งนั้น

### 6. ภาษาของเอกสาร

เอกสารอาจเป็น **ไทยหรืออังกฤษ** (หลักสูตรนานาชาติ) · prompt ต้องรับได้ทั้งสอง แต่
**ผลลัพธ์ต้องเป็น 8 ชื่อกลุ่มสาระภาษาไทยเสมอ** ไม่ว่าเอกสารต้นทางเป็นภาษาอะไร

### 7. AI ล้มเหลว / ตอบไม่ครบ

- retry ได้ **ไม่เกิน 2 ครั้ง** พร้อม backoff · ครั้งสุดท้ายยังล้ม → สร้าง intake ตามปกติโดย
  `ai_error` บันทึกเหตุผล และ `analysis_status = 'ai_incomplete'`
- **ห้ามเดาแทน AI ห้ามเติมค่า default ให้ครบ** (REQ-004) — ปล่อยว่างแล้วให้คนกรอก
- **ห้าม error ให้ผู้ใช้ปลายทางเห็น** — เด็กไม่มีทางเห็น flow นี้อยู่แล้ว เพราะสาขายังไม่ approved

### 8. dedup และการนำเอกสารฉบับใหม่เข้ามาแทน

**`dedup_key` คำนวณจาก `raw_program_name` ตามลำดับนี้เท่านั้น** (deterministic ทำซ้ำได้):

1. ตัดช่องว่างหัวท้าย · ยุบช่องว่างติดกันให้เหลือช่องเดียว
2. ตัดอักขระ `.` `,` `(` `)` `-` `/` ออกทั้งหมด
3. ตัดคำนำหน้าเหล่านี้ออกถ้าอยู่ต้นสตริง (ตัดซ้ำจนไม่มีให้ตัด): `หลักสูตร` · `สาขาวิชา` · `สาขา` ·
   token ใด ๆ ที่ลงท้ายด้วย `บัณฑิต` · `วศบ` · `วทบ` · `บธบ` · `ศศบ` · `คบ`
4. แปลงอักษรละตินเป็นตัวพิมพ์เล็ก

**การชนกันของ `dedup_key` ไม่ merge อัตโนมัติเด็ดขาด** — ระบบแค่ตั้ง `matched_program_id`
เป็นข้อเสนอ แล้วให้คนตัดสินใน `resolution`:

| `resolution` | ความหมาย | ผลที่เกิด |
|---|---|---|
| `'pending'` | ยังไม่มีคนตัดสิน | ไม่มีอะไรเกิดกับ `public."TCompassProgram"` |
| `'new'` | เป็นสาขาใหม่จริง ไม่ใช่ตัวเดิม | สร้างแถว `public."TCompassProgram"` ใหม่ · **คนต้องแก้ `program_name` ให้ `dedup_key` ไม่ชนก่อน** ไม่งั้น UNIQUE จะปฏิเสธ |
| `'replace'` | เป็นสาขาเดิม เอกสารใหม่มาแทน | ดูกติกาข้างล่าง |
| `'discard'` | ไม่เอา (แกะผิด/ไม่ใช่หลักสูตร) | ไม่มีอะไรเกิด · เก็บ intake ไว้เป็นประวัติ |

**เหตุผลที่ต้องมีขั้นให้คนตัดสิน**: ชื่อสาขาเขียนไม่เหมือนกันข้ามมหาวิทยาลัยและข้ามเอกสาร
(`วิศวกรรมคอมพิวเตอร์` · `วิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์` · `วศ.บ. วิศวกรรมคอมพิวเตอร์`)
· ที่ 10 สาขาคนจับได้เอง · ที่ 200 สาขา การ merge อัตโนมัติจะสร้างสาขาซ้ำหรือรวมสาขาผิดคู่**เงียบ ๆ**
แล้วเด็กจะเห็นสาขาเดียวกันสองครั้งใน top-10 (ผิด REQ-006)

### 9. `'replace'` — สาขาที่ approved อยู่แล้วต้องไม่หายไปจากผลของเด็กระหว่างรอตรวจ

**นี่เป็นการตีความ REQ-003 ที่เอกสารนี้กำหนดให้ ไม่ใช่ข้อความตรงตัวใน requirement:**

- REQ-003 เขียนว่า *"ถ้ามีการนำเอกสารฉบับใหม่เข้ามาแทนของเดิม ต้องกลับไปสถานะรอตรวจอีกครั้ง
  ไม่ใช่เปิดให้เด็กเห็นทันที"* — ข้อความนี้ห้าม **ข้อมูลชุดใหม่** ถึงเด็กก่อนอนุมัติ
  **ไม่ได้สั่งให้ซ่อนข้อมูลชุดเก่าที่อนุมัติไปแล้ว**
- ถ้าตีความแบบซ่อนทั้งสาขา ผลคือสาขาที่ใช้งานได้ดีอยู่จะ**หายไปจากผลของเด็กทันทีที่มีคนอัปโหลด
  ไฟล์ใหม่** ซึ่งเป็นการถดถอยที่ไม่มีเหตุผลทางธุรกิจรองรับ

**กติกาที่ใช้จริง:**

| สภาพของสาขา | มี intake ค้าง | เด็กเห็นอะไร |
|---|---|---|
| สาขาใหม่ ไม่เคยอนุมัติ | — | **ไม่เห็นเลย** (`status = 'pending_review'`) |
| เคยอนุมัติแล้ว มี intake `'replace'` รออยู่ | ✅ | **ยังเห็นข้อมูลชุดที่อนุมัติไว้เดิม** · `status` ยังเป็น `'approved'` |
| อนุมัติชุดใหม่แล้ว | — | เห็นชุดใหม่ |

- การสลับข้อมูลเกิด **ตอนกดอนุมัติชุดใหม่เท่านั้น** และต้องทำใน transaction เดียว:
  ลบแถวน้ำหนัก/แกน/สายชุดเก่า → เขียนชุดใหม่ → อัปเดต `source_id`, `ai_raw_response`,
  `reviewed_by`, `reviewed_at`, `updated_at`
- **ห้ามเขียนทับข้อมูลของสาขาที่ approved อยู่ก่อนคนกดอนุมัติ** ไม่ว่ากรณีใด

### 10. สาขาที่หายไปจากเอกสารฉบับใหม่

**ห้ามลบอัตโนมัติ** · สาขาที่เคย approved แล้วไม่ปรากฏในเอกสารฉบับใหม่ ให้คงสถานะเดิมไว้ ·
ถ้าจะเลิกใช้ ต้องให้คนตั้ง `status = 'retired'` เอง (มองไม่เห็นสำหรับเด็ก แต่เก็บประวัติไว้)

### 11. ไฟล์ซ้ำ

`ux_cpsource_sha` กันการนำไฟล์เดิมเข้าซ้ำในมหาวิทยาลัยเดียวกัน · ชนแล้ว **แจ้งคนว่าไฟล์นี้เคยเข้าแล้ว
เมื่อไหร่ โดยใคร** ไม่ใช่ error เฉย ๆ และไม่ใช่เงียบ ๆ สร้างซ้ำ

Contract:ImportRules.v1
DEC-019

Evidence EVD-004: claim=DES-019 | state=unresolved | path=ClassOnlineWeb/Helper/CompassScoreService.cs | symbol=MapCanonicalSubject | line=305 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6dfb00c0d5804542dc39cedc0da77d9c81f97b4ecb8003524dfb3ddcdb32fdc5
Evidence EVD-005: claim=Contract:ImportRules.v1 | state=unresolved | path=ClassOnlineWeb/Helper/CompassScoreService.cs | symbol=MapCanonicalSubject | line=301 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6dfb00c0d5804542dc39cedc0da77d9c81f97b4ecb8003524dfb3ddcdb32fdc5
Evidence EVD-006: claim=DEC-019 | state=confirmed | path=ClassOnlineWeb/Helper/CompassScoreService.cs | symbol=MapCanonicalSubject | line=301 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6dfb00c0d5804542dc39cedc0da77d9c81f97b4ecb8003524dfb3ddcdb32fdc5

Compatibility: additive-external
Data/schema: additive
Migration/backfill: none
Security: sensitive
Fallback: conversion_status = 'empty'/'failed' → งดเรียก AI เข้าคิวให้คนจัดการพร้อม conversion_note · AI ล้มครบ 2 retry → บันทึก ai_raw_response ตั้ง analysis_status = 'ai_incomplete' แล้วให้คนกรอกต่อ · ห้ามให้ error ถึงมือเด็กทุกกรณี
Material ambiguity: none

---

## DES-020 — Program Matching Rules

**สัญญาของ REQ-005 + REQ-006 — ทั้งหมดนี้อยู่ใน `ClassOnlineWeb` (C#)**

### 1. แหล่งคะแนนของเด็ก — ข้อห้ามที่สำคัญที่สุดของโมดูลนี้

**ต้องเรียกเมธอดเดียวกับที่ `sb-compass` ใช้ ห้ามคำนวณเอง ห้ามคัดลอกสูตรมาเขียนใหม่**

โค้ดปัจจุบันที่รวมร่างคะแนนอยู่ที่ `CompassApiController.cs:843` และเป็น **`private static`**
จึงเรียกจากภายนอก class ไม่ได้:

```csharp
private static async Task<Dictionary<string, double>> GetSubjectAveragesAsync(int schoolId, int sID)
{
    var scores = await CompassScoreService.GetSubjectScoresAsync(schoolId, sID);
    return CompassScoreService.AggregateByCanonicalSubjectWeighted(scores)
        .ToDictionary(a => a.CanonicalSubject, a => a.AverageScore);
}
```

**สิ่งที่ต้องทำ (Module E)**: ย้ายเมธอดนี้ขึ้นไปเป็น **`public static` บน `CompassScoreService`**
(ชื่อที่เสนอ: `GetCanonicalSubjectAveragesAsync(int schoolId, int sID)`) แล้วให้
`CompassApiController` เดิมเรียกตัวใหม่แทน · **เป็นการย้าย ไม่ใช่การเขียนใหม่ — เนื้อในต้องเหมือนเดิม
ทุกบรรทัด**

**ทำไมข้อนี้ปิดความเสี่ยงเรื่องสูตรซ้ำได้จริง**: กติกา fallback ของ REQ-012 (หน่วยกิตรวม = 0 →
ใช้ค่าเฉลี่ยดิบ) อยู่ **ข้างใน `AggregateByCanonicalSubjectWeighted` เอง**
(`CompassScoreService.cs:264-266`) ไม่ได้อยู่ที่ caller → เรียกเมธอดนี้แล้วได้กติกาครบโดยอัตโนมัติ
และถ้า `sb-compass` แก้สูตรวันไหน โมดูลนี้เปลี่ยนตามทันทีโดยไม่ต้องแก้อะไรเลย ตรงตาม REQ-005

**ห้ามโดยเด็ดขาด**: เขียน `AggregateByCanonicalSubject*` ตัวใหม่ · คัดลอกสูตรถ่วงน้ำหนักไปไว้ที่อื่น ·
ทำ fallback เองที่ caller · จับคู่ที่ระดับรายวิชาแทนกลุ่มสาระ (REQ-005 + `sb-compass REQ-004`)

### 2. ตัวกรองชั้นแรก — 11 Interest Cluster (แก้ไข 2026-08-31 โดย REQ-011 — แทนที่ 8 สายเดิมทั้งหมด)

> **REQ-005 เดิมใช้ `CompassPathCatalog.RankPaths()` ตรงนี้ — เลิกใช้ในสายงานนี้แล้ว**
> ตัวกรองชั้นแรกตอนนี้มาจาก `Module K` (`## Cluster Determination Rules`) ซึ่ง**ยังไม่ปิด**
> (รอ OQ-F03/OQ-F06/OQ-F07) — ขั้นตอนด้านล่างเขียนไว้ตามโครงที่ตกลงแล้ว แต่**ห้าม implement**
> จนกว่าสูตรจริงของ Module K จะยืนยันจากผู้ใช้

1. เรียกผลจัดอันดับ 11 cluster ของนักเรียนจาก `Module K` (T-Score + RIASEC ผสมกัน ตาม
   `## Cluster Determination Rules`) → ได้ cluster เรียงตาม `combined_score` มากไปน้อย
2. **ไล่เก็บสาขาผู้สมัครทีละ cluster ตามลำดับ `combined_score`** จนกว่าจะได้ **ครบ 10 สาขา หรือ
   หมดทั้ง 11 cluster**
   - สาขาที่ผูกหลาย cluster นับครั้งเดียว (dedup ด้วย `program_id`)
   - นับเฉพาะสาขาที่ `status = 'approved'` เท่านั้น
3. **ตัวกรองนี้เป็นการ "จัดลำดับความสำคัญของผู้สมัคร" ไม่ใช่ "ตัดทิ้ง"** — เหตุผลคือคลังหลักสูตร
   รอบแรกมีแค่ ~10 สาขา ถ้าตัดแข็งที่ cluster อันดับ 1 อย่างเดียว เด็กจะได้ผลลัพธ์ 1-2 รายการ
   (หลักการเดียวกับรอบที่ 1 เพียงเปลี่ยนหน่วยจาก "สาย" เป็น "cluster")
4. **การจัดอันดับสุดท้ายใช้ % ของสาขา (ข้อ 3 ด้านล่าง) ไม่ใช่ลำดับของ cluster** — cluster ทำหน้าที่
   เลือกผู้สมัครเท่านั้น — **ไม่เปลี่ยนจากรอบที่ 1**
5. **นักเรียนที่ยังไม่ทำ RIASEC (REQ-012)**: `Module K` คืนได้เฉพาะ `academic_fit` (จาก T-Score)
   `interest_fit`/`combined_score` เป็น `NULL` → ใช้ `academic_fit` แทนลำดับความสำคัญชั่วคราว
   พร้อมข้อความชวนทำ RIASEC เพื่อผลแม่นขึ้น — **ไม่ error ไม่บล็อกไม่ให้เห็นผล REQ-006**

### 3. สูตร % ความเหมาะสมของสาขา (D4)

```
TARGET_SCORE = 75.0   (ค่าคงที่ ใช้กับทุกกลุ่มสาระเท่ากัน)

matchPercent = Σ( weight_s × min(1, score_s / TARGET_SCORE) ) / Σ( weight_s ) × 100
```

- `s` = **ทุกกลุ่มสาระที่สาขานั้นประกาศไว้ใน `public."TCompassProgramSubjectWeight"`**
- `weight_s` = 3 / 2 / 1
- `score_s` = คะแนนกลุ่มสาระของเด็กจากข้อ 1
- **กลุ่มสาระที่เด็กไม่มีคะแนน**: `score_s` ถือเป็น 0 ในตัวตั้ง **แต่ `weight_s` ยังอยู่ในตัวหาร**
  (coverage penalty — พฤติกรรมเดียวกับ `CompassPathCatalog.ComputeFit`, `:163-177`)
  เพื่อไม่ให้สาขาที่พึ่งวิชาที่เด็กยังไม่เคยเรียนได้คะแนนสูงปลอม ๆ
- `min(1, ...)` ทำให้คะแนนเกินเป้าไม่ช่วยดันคะแนนรวมให้เฟ้อ
- **ปัดเป็นจำนวนเต็ม** (`Math.Round(x, 0)`) ให้ตรงกับ `FitScore` ของหน้า 8 สายที่ใช้อยู่แล้ว

**`TARGET_SCORE = 75` เป็นค่าที่เอกสารนี้กำหนด ไม่ได้มาจากเกณฑ์รับเข้าของคณะใด** — เป็นสมมติฐาน
ที่ตั้งใจเลือกเพราะให้ AI เดา "คะแนนที่ควรถึง" จากเอกสารที่ format ต่างกันหลายมหาวิทยาลัยจะยิ่งไม่นิ่ง
(ดู RISK-F12) · **ต้องเก็บเป็นค่าคงที่ที่มีชื่อ ไม่ใช่ magic number กระจายในโค้ด**

### 4. กรณีขอบ — ทั้งหมดนี้ requirement ไม่ได้ระบุ เอกสารนี้กำหนดให้

| กรณี | ต้องทำอย่างไร |
|---|---|
| **เด็กยังไม่มีคะแนนในระบบเลย** (`avg` ว่าง) | คืนสถานะ "รอครูกรอกผลสอบ" แบบเดียวกับ `sb-compass REQ-002` · **ไม่ใช่รายการว่าง ไม่ใช่ error ไม่ใช่หน้าเปล่า** |
| **คลังที่ approved มีน้อยกว่า 10 สาขา** | แสดงเท่าที่มี · **ห้าม error ห้ามเติมของปลอม** (REQ-006) |
| **คลังที่ approved ว่างเปล่า** | ข้อความว่าคลังหลักสูตรยังไม่พร้อม · ไม่ใช่ error |
| **สาขาที่ไม่มีแถวน้ำหนักเลย** | **ตัดออกจากผู้สมัคร** (หารด้วยศูนย์ไม่ได้) · กรณีนี้ไม่ควรเกิดเพราะเงื่อนไขอนุมัติบังคับให้มีอย่างน้อย 1 แถว แต่โค้ดต้องกันไว้ |
| **% เท่ากันหลายสาขา** | เรียง **% มากไปน้อย → แล้วเรียงตาม `program_name` แบบ ordinal ascending** เพื่อให้ผลนิ่งทุกครั้งที่เปิด |
| **สาขา `pending_review` / `retired`** | **ไม่โผล่เลย** ไม่ใช่โผล่แบบเทา ๆ ไม่ใช่โผล่พร้อมป้ายเตือน (REQ-004) |
| **สาขาเดียวผูกหลาย cluster** | แสดงครั้งเดียว |

### 5. คำแนะนำต่อสาขา (REQ-006)

ใช้รูปแบบเดียวกับ `CompassPathCatalog.BuildReason` (`:179-208`) โดยเปลี่ยนคำว่า "สาย" เป็น "สาขา":

- **จุดแข็ง** = กลุ่มสาระที่ `weight` สูงสุด ในบรรดากลุ่มที่ `score ≥ TARGET_SCORE × 0.9`
- **จุดต้องเร่ง** = กลุ่มสาระที่ `(TARGET_SCORE − score) × weight` มากที่สุด ในบรรดากลุ่มที่ `score < TARGET_SCORE`
- **ยังไม่มีคะแนน** = กลุ่มสาระที่ `weight` สูงสุด ในบรรดากลุ่มที่เด็กไม่มีคะแนน
- เสมอกันให้เลือกตามลำดับตัวอักษรของชื่อกลุ่มสาระ เพื่อให้ข้อความนิ่ง

### 6. ไม่เก็บผลจับคู่ลงฐานข้อมูล

คำนวณสดทุก request · เหตุผล: เด็กต้องเห็นผลอัปเดตทันทีเมื่อครูกรอกคะแนนใหม่ และไม่มี cache ให้
ค้างเป็นข้อมูลเก่า · **ข้อห้าม "ห้ามเรียก AI ใหม่" ของ REQ-002 พูดถึงการเรียก AI ไม่ใช่การคำนวณจับคู่**

Contract:ProgramMatchingRules.v1
DEC-020

Evidence EVD-007: claim=DES-020 | state=confirmed | path=ClassOnlineWeb/Helper/CompassScoreService.cs | symbol=GetCanonicalSubjectAveragesAsync | line=282 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6dfb00c0d5804542dc39cedc0da77d9c81f97b4ecb8003524dfb3ddcdb32fdc5
Evidence EVD-008: claim=Contract:ProgramMatchingRules.v1 | state=unresolved | path=ClassOnlineWeb/Helper/CompassPathCatalog.cs | symbol=RankPaths | line=81 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=95a48a0c19e0d9db0d4ea7c17f8bff62b69fdfc47365bffdfb352985fdd18879
Evidence EVD-009: claim=DEC-020 | state=confirmed | path=ClassOnlineWeb/Helper/CompassPathCatalog.cs | symbol=BuildReason | line=179 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=95a48a0c19e0d9db0d4ea7c17f8bff62b69fdfc47365bffdfb352985fdd18879

Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: none
Fallback: เด็กไม่มีคะแนน → คืนสถานะ "รอครูกรอกผลสอบ" ไม่ใช่รายการว่าง · คลัง approved ว่าง → ข้อความคลังหลักสูตรยังไม่พร้อม ไม่ใช่ error · ได้น้อยกว่า 10 สาขา → แสดงเท่าที่มีห้ามเติมของปลอม · % เสมอกัน → เรียง program_name แบบ ordinal ascending
Material ambiguity: none

---

## DES-025 — RIASEC Fit Rules

> **แก้ไข 2026-08-31 (REQ-012)** — เดิมชื่อ `## Behavior Fit Rules` ใช้แกนพฤติกรรม 8 แกนที่ระบบ
> ออกแบบเอง (D11) กับตาราง `compass_behavior_*` — **ถูกแทนที่ทั้งหมด**ด้วย 6 มิติ RIASEC มาตรฐาน
> และตาราง `compass_riasec_*` กติกาโครงสร้าง (ทำซ้ำได้ · ไม่ตัดสิน · ชี้จุดไม่เข้ากัน · quest)
> **ไม่เปลี่ยน** เปลี่ยนแค่หน่วยจาก "แกน" เป็น "มิติ RIASEC" ตลอดทั้งหมวด

**สัญญาของ REQ-007 (ตามที่ REQ-012 แก้ไข) + REQ-008 — ฝั่งคำถาม/quest อยู่ใน Curriculum Service ·
ฝั่งคำนวณ/บันทึกอยู่ใน `ClassOnlineWeb`**

### 0. เนื้อหาคำถามยังไม่ผ่านตรวจ — ขอบเขตของหมวดนี้

หมวดนี้กำหนด**กลไกการคำนวณ** เท่านั้น (สูตร %, การชี้จุดไม่เข้ากัน, การเสนอ quest) — **เนื้อหาคำถาม
RIASEC จริง** (ข้อความ/จำนวนข้อ/การ map เป็นมิติ) อยู่ที่ UI mockup ที่ `requirement.md` References
อ้างถึงและยังไม่ผ่านการตรวจสอบจากใคร → ส่งต่อ `uxui-designer` ก่อน `backend-engineer` จะ seed
`public."TCompassRiasecQuestion"` ด้วยเนื้อหาจริงได้ (ดู DES-012)

### 1. คำถามที่แสดง — **แบบผสมสองรูปแบบ (แก้ไข v6, 2026-08-31 · `requirement.md` REQ-012 รอบที่ 3)**

ชุดคำถาม RIASEC มี **สองรูปแบบที่อยู่คู่กัน ไม่ใช่แทนที่กัน** (ผู้ใช้ยืนยัน 2026-08-31):

| รูปแบบ | เก็บที่ | หน่วยคำตอบ | reverse-scored |
|---|---|---|---|
| **A — ให้คะแนนแยกข้อ (Likert)** | `public."TCompassRiasecQuestion"` | 1-5 ต่อข้อ **อิสระต่อกัน** (1 = ไม่ใช่เลย · 5 = ใช่มากที่สุด) | **มี** (`"ReverseScored"`) |
| **B — เรียงลำดับ (forced choice)** | `public."TCompassRiasecRankBlock"` + `public."TCompassRiasecRankOption"` | อันดับ 1..k ภายในหนึ่ง block · **k = จำนวนตัวเลือก active ของ block นั้น บังคับ 5 ≤ k ≤ 7** | **ไม่มี และห้ามมี** (ข้อ 3.3) |

- เอาเฉพาะ `"IsActive" = true` ทั้งสองรูปแบบ เรียงตาม `"DisplayOrder"` ของแต่ละรูปแบบ ·
  การสลับ/ผสมลำดับสองรูปแบบบนหน้าจอเป็นเรื่องของ UI สัญญานี้ไม่บังคับ
- **เป็นชุดกลางชุดเดียว ไม่แยกตามสาขา** (REQ-007 ยืนยันแล้ว ไม่เปลี่ยนจากรอบที่ 1 — ใช้กับทั้งสองรูปแบบ)
- **กติกาของ block เรียงลำดับ — ตอบครบทั้ง block หรือไม่ตอบเลย เท่านั้น**: อันดับที่ส่งมาต้องเป็น
  **permutation ของ 1..k ของตัวเลือก active ทั้งหมดใน block นั้น** — ห้ามเสมอ ห้ามข้ามเลขอันดับ
  ห้ามจัดอันดับแค่บางตัว · block ใดที่ส่งมาไม่ครบ/ไม่ใช่ permutation → **ปฏิเสธคำขอทั้งคำขอ (400)**
  ห้ามรับบางส่วน ห้ามเติมอันดับที่เหลือให้เอง (เหตุผล: จัดอันดับไม่ครบแปลว่า `rankScore` ของตัวที่เหลือ
  ไม่มีนิยาม — เดาแทนคือการแต่งข้อมูลของเด็ก)
- ✅ **กติกาเดิม "ต้องตอบครบ 100% ของแบบทดสอบ (ทั้ง Likert และบล็อกเรียงลำดับ) จึงจะส่งได้" ยังคงอยู่
  ไม่เปลี่ยน — OQ-F11 ข้อ (ง) ปิดแล้ว 2026-09-02 โดยผู้ใช้ปฏิเสธข้อเสนอ "ส่งแบบไม่ครบได้"**:
  `system-analyst` เคยเสนอเปลี่ยนกติกานี้เพราะ REQ-012 รอบที่ 3 ยืนยันฟีเจอร์ Confidence ที่ตีว่า
  *"ตอบน้อยกว่า 50% ของจำนวนคำถามทั้งหมด = ยังไม่มั่นใจ"* ซึ่งเกณฑ์นั้นไม่มีทาง trigger ได้เลยถ้ายัง
  บังคับตอบครบ 100% ก่อนส่ง — **ผู้ใช้ปฏิเสธข้อเสนอนี้ตรง ๆ**: **ห้ามส่งแบบไม่ครบเด็ดขาด** กติกาเดิม
  ยังคงอยู่ทุกประการ · **ผลที่ตามมาซึ่งบันทึกไว้ตรง ๆ ไม่ปิดบัง**: เกณฑ์ Confidence เดิมที่อ้างอิง
  `AnsweredCount`/`ActiveItemCount` (% ความครบ) จึง**ไม่มีทางเกิดขึ้นได้จริงกับผลที่ส่งสำเร็จแล้วอีก
  ต่อไป** เพราะ `AnsweredCount == ActiveItemCount` เสมอโดยโครงสร้าง — `system-analyst` re-scope
  กลไก Confidence ใหม่จากสัญญาณอื่นแทน ดูรายละเอียดที่ `## Cluster Determination Rules` ข้อ 7
  (เขียนใหม่ทั้งข้อ 2026-09-02) — **ไม่ใช่การเปิดคำถามให้ผู้ใช้ตัดสินอีกรอบ** เป็นการตัดสินใจทาง
  วิศวกรรมที่ผู้ใช้มอบสิทธิ์ไว้แล้ว (OQ-F12/OQ-F13 sign-off)
- **REQ-012 เพิ่มเงื่อนไข**: คำถามอ้างอิงผลการเรียน**ทั้งช่วงชั้น** (เช่น ม.6 ใช้ ม.4-ม.6 ทั้งหมด)
  และอ้างอิงคณะ/สาขาในสายที่เลือก — รายละเอียดกลไกนี้อยู่ในขอบเขตของ UI mockup ที่ยังไม่ผ่านตรวจ
  เช่นกัน (ดู ข้อ 0 ด้านบน)

### 2. รูปแบบการเก็บคำตอบ

| คอลัมน์ | รูปแบบ | ตัวอย่าง |
|---|---|---|
| `public."TCompassRiasecResult"."Answers"` | `"<question_id>:<1-5>"` คั่นด้วย comma | `"12:4,13:2,14:5"` |
| `public."TCompassRiasecResult"."RankAnswers"` *(ใหม่ v6)* | `"<option_id>:<rank>"` คั่นด้วย comma · `rank` เริ่มที่ 1 = ชอบที่สุด | `"81:2,82:1,83:5,84:3,85:4"` |

- **ตั้งใจไม่ใช้ CSV ตามตำแหน่งแบบ `public."TCompassMbtiResult"."Answers"` ของเดิม** เพราะชุดคำถามชุดนี้
  แก้ไขได้จากหน้าจอแอดมิน — เก็บตามตำแหน่งแล้วผลเก่าจะตีความผิดทันทีที่มีคนเพิ่ม/ลบคำถาม ·
  **เหตุผลเดียวกันบังคับให้ `"RankAnswers"` เก็บเป็น `option_id` ไม่ใช่ลำดับตัวเลือกใน block**
- `block_id` **ไม่ต้องเก็บซ้ำ** — สืบจาก `option_id` ได้เสมอ · การ validate ว่าครบทั้ง block
  (ข้อ 1) ทำโดย group ตาม `"BlockID"` ของ option ที่ส่งมา
- **ห้ามคำนวณผลเก่าใหม่เมื่อชุดคำถามเปลี่ยน** (ข้อ 7) ใช้กับทั้งสองคอลัมน์เท่ากัน

### 3. ระดับมิติ RIASEC ของเด็ก — **สูตรผสม (เขียนใหม่ v6, 2026-08-31)**

**3.1 ค่าจากรูปแบบ Likert — ไม่เปลี่ยนจากเดิม**

```
LikertLevel(r) = ค่าเฉลี่ยของคำตอบ **ทุกข้อที่ตอบแล้ว** ซึ่งมี "DimensionID" = r
                 โดยข้อที่ "ReverseScored" = true ใช้ค่า (6 − answer)
                 ∈ [1,5] · ไม่มีข้อที่ตอบแล้วของมิตินั้นเลย → ไม่มีค่า
```

**3.2 ค่าจากรูปแบบเรียงลำดับ — ใหม่**

```
สำหรับ block b ที่ **ตอบครบ** · k_b = จำนวนตัวเลือก active ของ block นั้น (5 ≤ k_b ≤ 7)
ตัวเลือก o ใน b ได้อันดับ rank_o ∈ 1..k_b (1 = ชอบที่สุด):

  rankScore(o) = 1 + 4 × (k_b − rank_o) / (k_b − 1)          ∈ [1,5] เสมอ
                 (อันดับ 1 → 5.0 · อันดับสุดท้าย → 1.0 · ระยะห่างเท่ากันทุกช่วง)

RankLevel(r)   = ค่าเฉลี่ยของ rankScore(o) ของทุกตัวเลือก o ที่ "DimensionID" = r
                 จาก **ทุก block ที่ตอบครบ** · ไม่มีเลย → ไม่มีค่า
```

> **v9 (2026-09-15)** — `r` ในสูตรทั้งสองข้างบนคือ **มิติ** ซึ่งตอนนี้ระบุด้วย `"DimensionID"`
> (integer) ตาม `## Data Model` v9 · **การจับคู่/แสดงผลต่อคนยังใช้ `"DimensionCode"`** (`R`/`I`/`A`/
> `S`/`E`/`C`) เหมือนเดิม — เปลี่ยนแค่คีย์ที่ใช้ join ไม่ได้เปลี่ยนสูตรหรือความหมายของค่าใด ๆ

- `k_b ≥ 5` ทำให้ตัวหาร `k_b − 1 ≥ 4` เสมอ — **ไม่มีทางหารด้วยศูนย์** · ถ้าพบ block ที่มีตัวเลือก
  active < 5 หรือ > 7 ให้ถือว่า **ข้อมูลคลังคำถามผิด** ตัด block นั้นออกจากการคำนวณและ log
  **ห้ามคำนวณต่อด้วยสูตรที่ปรับเอง**
- หนึ่งมิติมีได้ไม่เกิน 1 ตัวเลือก active ต่อ block (บังคับด้วย unique index ที่ `## Data Model`)
- **การแปลงอันดับเป็นคะแนนเป็นเชิงเส้นระยะห่างเท่ากันโดยเจตนา** ไม่ถ่วงหัวแถวมากกว่าท้ายแถว — ✅
  **ยืนยันแล้ว 2026-09-02 (OQ-F11 ข้อ (ข)) — ใช้ตามที่เสนอ ไม่ปรับ** ทางเลือกอื่น (เช่นให้อันดับ 1
  ห่างกว่าช่วงอื่น) ไม่ถูกเลือกเพราะไม่มีเหตุผลเชิงข้อมูลรองรับ

**3.3 `"ReverseScored"` อยู่กับ Likert เท่านั้น — ข้อห้ามที่ห้ามพลาด**

- **กลไก reverse-scored ยังอยู่ครบและห้ามถอด** — เป็นกลไกเดียวของฝั่ง Likert ที่กันการตอบไปทางเดียว
  รวด (straight-lining) · เอกสารร่าง `education-pathway-assessment-design.md` **ไม่มีข้อ reverse
  เลยสักข้อ** และ `sb-compass/design.md` คำวินิจฉัยข้อ B ตั้งข้อสังเกตไว้แล้วว่า *ถ้ารับรูปแบบ
  ranking เข้ามาต้องตัดสินว่าจะทิ้งกลไกนี้หรือไม่* — **คำตอบของสัญญานี้คือ ไม่ทิ้ง**
- **ตัวเลือกของ ranking ห้ามมี reverse-scored** และตาราง `public."TCompassRiasecRankOption"`
  **ไม่มีคอลัมน์นั้นโดยเจตนา ห้ามเพิ่ม** — ภายใน forced choice ทิศทางถูกกำหนดด้วยอันดับอยู่แล้ว
  การกลับด้านตัวเลือกใดตัวเลือกหนึ่งจะทำให้ permutation ของ block นั้นตีความไม่ได้ (ตัวเลือกที่เหลือ
  ถูกจัดอันดับเทียบกับความหมายคนละทิศ)
- ถ้าวันใดคลังคำถามเหลือข้อ `"ReverseScored" = true` เป็น **0 ข้อ** ให้ถือเป็น **การเปลี่ยนกติกา
  ต้อง amend ก่อน** ไม่ใช่ผลข้างเคียงที่ยอมรับได้ของการแก้เนื้อหาคำถาม (ข้อกำหนดของ Module I-a)

**3.4 การรวมสองรูปแบบเป็น `studentLevel`**

```
studentLevel(r) = ( W_LIKERT × LikertLevel(r) + W_RANK × RankLevel(r) ) / ( W_LIKERT + W_RANK )

  โดย **ตัดพจน์ของรูปแบบที่ไม่มีค่าออกจากทั้งตัวตั้งและตัวหาร**
  (มีเฉพาะ Likert → studentLevel = LikertLevel · มีเฉพาะ ranking → studentLevel = RankLevel)
```

- ✅ **`W_LIKERT = W_RANK = 1` (เท่ากัน) — ยืนยันแล้ว 2026-09-02 (OQ-F11 ข้อ (ก))** ตามที่เสนอ ไม่ปรับ
  — เก็บเป็นค่าคงที่ที่มีชื่อ แก้ที่เดียวได้ เหมือน `TARGET_SCORE` (ไม่ hardcode ค่า `1` ตรง ๆ ในสูตร)
- **เฉลี่ยภายในรูปแบบก่อนแล้วค่อยรวมข้ามรูปแบบ (ไม่ใช่เทกองรวมกันแล้วเฉลี่ยครั้งเดียว)** โดยเจตนา —
  ถ้าเทรวม สัดส่วนอิทธิพลของสองรูปแบบจะกลายเป็นผลพลอยได้ของ *จำนวนข้อที่ผู้เขียนคำถามใส่มา* และ
  จะเปลี่ยนไปเงียบ ๆ ทุกครั้งที่มีคนเพิ่ม/ลบคำถามจากหน้าจอแอดมิน
- ทั้งสองพจน์อยู่ในสเกล 1-5 → **`studentLevel(r)` อยู่ใน [1,5] เสมอ** จึง **ไม่กระทบสูตรปลายน้ำแม้แต่
  ตัวเดียว**: ข้อ 4 (`matchPercent` ที่หารด้วย `4 × n`) · ข้อ 5 (จุดไม่เข้ากัน `≥ 2`) ·
  `InterestFit(c)` (`(studentLevel − 1) / 4 × 100` ที่ `## Cluster Determination Rules` ข้อ 3) —
  **ทั้งหมดคงเดิม ไม่ต้องแก้** นี่คือเหตุผลที่ออกแบบให้ ranking ถูกแปลงกลับเข้าสเกล 1-5 แทนการเปลี่ยน
  นิยามของ `studentLevel` (ซึ่งจะลากไปแก้ทั้ง `## Cluster Determination Rules`)
- **ไม่ปัดเป็นจำนวนเต็มก่อนนำไปเทียบ** — เก็บทศนิยมไว้ (ปัด 1 ตำแหน่งเมื่อต้องแสดงผล)
- มิติที่ **ไม่มีค่าเลยทั้งสองรูปแบบ** → **ไม่มีค่า ตัดออกจากการคำนวณ ไม่ใช่ 3** (กติกาเดิม ไม่เปลี่ยน)
- **ต้อง log ว่ามิติใดได้ค่ามาจากรูปแบบเดียว** — มิติที่วัดด้วยรูปแบบเดียวเทียบกับมิติที่วัดครบสองรูปแบบ
  ได้ไม่เท่ากันโดยธรรมชาติ (ipsative vs normative — RISK-F18) · **การแก้ที่ถูกจุดคือฝั่งเนื้อหา**:
  ✅ **Module I-a ต้องคุมให้ทุกมิติมีคำถามครบทั้งสองรูปแบบ ไม่ใช่ให้ engineer ชดเชยตอน runtime —
  ยืนยันแล้ว 2026-09-02 (OQ-F11 ข้อ (ค)) ตามที่เสนอ ไม่ปรับ** — ข้อนี้ไม่ใช่แค่เรื่องความเทียบกันได้
  ของคะแนนอีกต่อไป แต่เป็น**เงื่อนไขจำเป็นของกลไก Confidence ที่ re-scope แล้ว**ด้วย
  (`## Cluster Determination Rules` ข้อ 7 ใหม่ — เทียบ LikertLevel กับ RankLevel รายมิติ ต้องมี
  ทั้งสองค่าต่อมิติจึงจะวัดความสอดคล้องได้)

### 4. สูตร % ความเหมาะสมเชิง RIASEC

```
T = เซตของมิติที่ "สาขามี desired_level" และ "เด็กมี studentLevel"  (intersection เท่านั้น)
n = |T|

matchPercent = ( 1 − Σ_{t∈T} |studentLevel_t − desiredLevel_t| / (4 × n) ) × 100
```

- `4` คือระยะห่างสูงสุดต่อมิติ (1 เทียบ 5)
- ทุกมิติน้ำหนักเท่ากันในรอบนี้ (ยังไม่มีการถ่วงน้ำหนักมิติในขั้นนี้ — คนละเรื่องกับตาราง
  `public."TCompassClusterRiasecWeight"` ที่ใช้ใน `## Cluster Determination Rules`)
- **ปัดเป็นจำนวนเต็ม**
- **`n = 0`** (สาขาไม่มีมิติ หรือเด็กไม่มีมิติที่ตรงกันเลย) → **ไม่มี % ให้แสดงข้อความว่ายังประเมิน
  ด้านนี้ของสาขาไม่ได้** · ห้ามคืน 0% ห้ามหารด้วยศูนย์ ห้าม error
- มิติที่มีอยู่ฝั่งเดียว (สาขามีแต่เด็กไม่มี หรือกลับกัน) → **ตัดออกทั้งคู่** ไม่นับเป็นระยะห่าง

### 5. การชี้จุดที่ไม่เข้ากัน — หัวใจของ REQ-007

**"จุดที่ไม่เข้ากัน" นิยามว่า: `desiredLevel_t − studentLevel_t ≥ 2`**

- เรียงจากส่วนต่างมากไปน้อย · เสมอกันเรียงตาม `display_order` ของมิติ
- **คำแนะนำต้องเอ่ยชื่อมิติที่ไม่เข้ากันอันดับ 1 ออกมาตรง ๆ** — นี่คือสิ่งที่ทำให้ตัวอย่าง
  acceptance ของผู้ใช้ผ่าน (*"ได้สาย IT อยากเป็น SA แต่ตอบว่าไม่ชอบงานเอกสารเลย → ระบบต้องชี้ให้เห็น
  ความไม่เข้ากันตรงนี้และแนะนำทางเลือกอื่นภายในสาย IT"*) · **ตัวเลข % อย่างเดียวไม่ผ่าน acceptance ข้อนี้**
- **ทิศตรงข้าม (`studentLevel − desiredLevel ≥ 2`) ไม่ใช่จุดที่ไม่เข้ากัน ห้ามเตือน** — การที่เด็ก
  มีมิตินั้นสูงกว่าที่สาขาต้องการไม่ใช่ปัญหา
- เมื่อมีจุดไม่เข้ากัน ต้องเสนอ **สาขาทางเลือกอื่นภายใน cluster เดียวกัน** (แทนที่ "สายเดียวกัน" เดิม)
  ที่ `desiredLevel` ของมิตินั้นต่ำกว่า เรียงตาม % ของสาขามากไปน้อย เอาไม่เกิน 3 รายการ

### 6. เป็นไกด์ ไม่ใช่คำตัดสิน — ข้อห้ามเรื่องถ้อยคำ

REQ-007 ระบุชัดว่า *"เป็นไกด์นำทาง ไม่ใช่คำตัดสินว่าผ่าน/ไม่ผ่าน"*

**ห้ามใช้ถ้อยคำเหล่านี้ในผลลัพธ์ทุกกรณี**: `ไม่เหมาะ` · `ไม่ผ่าน` · `ทำไม่ได้` · `ไม่ควรเรียน` ·
`คุณสมบัติไม่ถึง` · หรือข้อความใดที่สื่อว่าเด็กถูกตัดสิทธิ์ · ให้ใช้ถ้อยคำแบบ
"ตรงนี้อาจจะต้องเตรียมใจ/เตรียมตัวเพิ่ม" และเสนอทางเลือกเสมอ

### 7. ทำซ้ำได้

- ทุกครั้งที่ส่งคำตอบ = **`INSERT` แถวใหม่** ไม่ใช่ `UPDATE` (ต่างจาก `public."TCompassMbtiResult"` โดยเจตนา)
- "ผลล่าสุด" = แถวที่ `created_at` มากที่สุดของ (`school_id`, `s_id`) นั้น
- **ห้ามคำนวณผลเก่าใหม่** เมื่อชุดคำถามหรือข้อมูลสาขาเปลี่ยน — ผลเก่าเป็นบันทึกของวันนั้น

### 8. `program_id` เป็น NULL ได้

- **มีสาขา** → คำนวณ %, จุดไม่เข้ากัน, คำแนะนำ, quest ครบ
- **ไม่มีสาขา** (เด็กอยากดูโปรไฟล์ตัวเองเฉย ๆ) → แสดง **ระดับ 6 มิติ RIASEC ของตัวเองเท่านั้น**
  `match_percent` เป็น `NULL` · **ไม่มี quest** · ห้ามแสดง % หลอก ๆ

### 9. quest (REQ-008)

- เสนอ quest เมื่อ **มีจุดไม่เข้ากันอย่างน้อย 1 มิติ** เท่านั้น
- เลือกจาก `public."TCompassQuest"` ที่ `"DimensionID"` (**v9** — เดิมเขียนว่า `dimension_code`)
  ตรงกับมิติที่ไม่เข้ากันอันดับต้น ๆ · `status = 'approved'` ·
  `program_id IS NULL` (รอบนี้บังคับ)
- เสนอ **ไม่เกิน 2 ชิ้นต่อรอบ** เรียงตามลำดับมิติที่ห่างมากที่สุดก่อน
- **มิติที่ไม่มี quest ในคลัง → ไม่เสนอ quest สำหรับมิตินั้น · ห้าม error ห้ามแสดงช่องว่าง
  ห้ามเสนอ quest ของมิติอื่นมาแทน**
- สถานะของ `public."TCompassQuestAttempt"` เดินทางเดียว: `'suggested'` → `'accepted'` → `'done'` ·
  **ห้ามถอยกลับ** · เด็กทำ quest เดิมซ้ำได้โดยสร้าง attempt แถวใหม่
- `reflection` เป็นข้อความที่เด็กกรอกเอง — **ไม่ส่งออกนอกระบบ ไม่ส่งให้ AI** (REQ-010)

Contract:RiasecFitRules.v1
DEC-025

Evidence EVD-022: claim=DES-025 | state=confirmed | path=ClassOnlineWeb/Helper/CompassRiasecService.cs | symbol=ComputeDimensionLevels | line=314 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=read | hash=6ad6ff98f15e5d7bdbb17580400661bd26eda9f46d243c6284aa33e4af51e909
Evidence EVD-023: claim=Contract:RiasecFitRules.v1 | state=confirmed | path=ClassOnlineWeb/Helper/CompassRiasecService.cs | symbol=SubmitAsync | line=181 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=read | hash=6ad6ff98f15e5d7bdbb17580400661bd26eda9f46d243c6284aa33e4af51e909
Evidence EVD-024: claim=DEC-025 | state=confirmed | path=ClassOnlineWeb/Helper/CompassRiasecService.cs | symbol=ComputeMatchPercent | line=423 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=read | hash=6ad6ff98f15e5d7bdbb17580400661bd26eda9f46d243c6284aa33e4af51e909

Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: sensitive
Fallback: block เรียงลำดับที่ส่งมาไม่ครบ/ไม่ใช่ permutation ของ 1..k → ปฏิเสธทั้งคำขอ (400) ห้ามรับบางส่วน ห้ามเติมอันดับให้เอง (ข้อ 1) · block ที่มีตัวเลือก active < 5 หรือ > 7 → ตัด block นั้นออกจากการคำนวณ + log ห้ามปรับสูตรเอง (ข้อ 3.2) · มิติที่ไม่มีค่าทั้งสองรูปแบบ → ตัดออกจากการคำนวณ ไม่ใช่ค่า 3 (ข้อ 3.4) · n = 0 → ไม่มี % แสดงข้อความว่ายังประเมินด้านนี้ไม่ได้ ห้ามคืน 0% ห้ามหารด้วยศูนย์ ห้าม error (ข้อ 4) · `program_id` เป็น NULL → แสดงระดับ 6 มิติของตัวเองเท่านั้น `match_percent` = NULL ไม่มี quest (ข้อ 8) · มิติที่ไม่มี quest ในคลัง → ไม่เสนอ quest ของมิตินั้น ห้าม error ห้ามเสนอ quest ของมิติอื่นแทน (ข้อ 9)
Material ambiguity: unresolved

---

## DES-021 — Target Major Rules

> **ใหม่ทั้งหมด v7 (2026-09-02, `requirement.md` "แก้ไขรอบที่ 4")** — สัญญาของ **REQ-017**
> ("ตั้งเป็นเป้าหมาย") · concept ใหม่ที่ไม่เคยมีมาก่อนในเอกสารนี้ ใช้ persistence ที่มีอยู่แล้วของ
> `## RIASEC Fit Rules` (`public."TCompassRiasecResult"`) ทั้งหมด **ไม่เพิ่มตารางบันทึกผลใหม่**
> ที่เพิ่มมีเฉพาะตารางสถานะ "เป้าหมาย" เอง (`public."TCompassTargetProgram"`)

**สัญญาของ REQ-017 — อยู่ใน `ClassOnlineWeb` ทั้งหมด (Module I-b ขยายขอบเขต — ดู `## Modules`)**

### 0. ขอบเขตของหมวดนี้

หมวดนี้กำหนด **กติกาธุรกิจของ gate** (ต้องทำ REQ-007 ของสาขานั้นให้ **เสร็จ** ก่อนจึงตั้งเป็นเป้าหมายได้) และ **จำนวนเป้าหมายที่ Active** (นักเรียน 1 คน มีเป้าหมาย Active ได้สูงสุด 1 รายการเท่านั้นตาม AC-017.4 — ปิด **OQ-F14**) · **ไม่กำหนด** หน้าตา/ตำแหน่งปุ่มบนหน้าจอ (ส่งต่อ `uxui-designer` ตาม **OQ-F15**)

### 1. State — `public."TCompassTargetProgram"`

- **Append-only เหมือน `TCompassRiasecResult`/`TCompassQuestAttempt`** — ทุกการกระทำ ("ตั้ง" หรือ
  "ถูกแทนที่") คือ `INSERT`/`UPDATE` แถวสถานะ ไม่ใช่การลบแถวเดิมทิ้ง (เก็บ audit trail ว่าใครเคยตั้ง
  อะไรเป็นเป้าหมายเมื่อไหร่)
- **"เป้าหมายปัจจุบัน" ของนักเรียนคนหนึ่ง — มีได้สูงสุด 1 รายการ (AC-017.4, ปิด OQ-F14)**:
  - บังคับที่ระดับ DB ด้วย Partial Unique Index: `"UX_TCompassTargetProgram_Active_Student"` บน `("SchoolID", "SID") WHERE "Status" = 'active'`
  - บังคับที่ระดับ Service: เมื่อนักเรียนตั้งเป้าหมายสาขาใหม่ จะทำการ UPDATE แถว active เดิมของนักเรียนคนนั้นให้เป็น `'superseded'` ทันทีใน Transaction เดียวกัน ก่อน INSERT แถวใหม่
- `"RiasecResultID"` เก็บ**รอบทดสอบที่ผ่าน gate ตอนกดตั้งเป้าหมาย** ไว้เป็น snapshot เพื่อ audit
  ("ผ่าน gate ด้วยผลข้อไหน") — **ไม่ใช่ตัวตัดสิน gate เอง** (ดูข้อ 2 ว่า gate เช็คจากอะไรจริง ๆ)

### 2. Gate check — หัวใจของ REQ-017

**`CanSetAsTarget(SchoolID, SID, ProgramID)` = มีอย่างน้อย 1 แถวใน `public."TCompassRiasecResult"`
ที่ `"SchoolID"` / `"SID"` / `"ProgramID"` ตรงกันเป๊ะ ทั้งสามค่า**

```
SELECT EXISTS (
    SELECT 1 FROM public."TCompassRiasecResult"
    WHERE "SchoolID" = @SchoolID AND "SID" = @SID AND "ProgramID" = @ProgramID
)
```

- **เช็คที่การมีอยู่ของแถว (completion) เท่านั้น — ไม่เช็ค `"MatchPercent"` หรือเนื้อหา `"Advice"`
  เลยแม้แต่น้อย** (ยืนยัน REQ-017 ตรง ๆ: ผลออกมาไม่เหมาะสมก็ยังตั้งเป็นเป้าหมายได้) —
  **ห้าม engineer เผลอเพิ่มเงื่อนไข `"MatchPercent" >= x` เข้าไปเอง** ไม่ว่าด้วยเหตุผลใด
- **ต้องกรองด้วย `"ProgramID"` เสมอ ห้ามเช็คแค่ "เคยทำ REQ-007 มาก่อนหรือยัง" แบบไม่ดูสาขา** — เป็น
  จุดที่ผิดง่ายที่สุดของ endpoint นี้ เพราะ `## RIASEC Fit Rules` ข้อ 7 นิยาม "ผลล่าสุด" ของนักเรียน
  แบบคีย์แค่ (`school_id`, `s_id`) โดยไม่รวม `program_id` (นิยามนั้นถูกของมันเองสำหรับหน้าจอ "ดูผล
  ล่าสุด" ของ REQ-007) — **gate ของ REQ-017 เป็นคำถามคนละแบบ ("เคยทำของสาขานี้ครบหรือยัง" ไม่ใช่
  "ผลล่าสุดคืออะไร") จึงต้องเขียน query ของตัวเองแบบข้างบน ห้ามลอกนิยาม "ผลล่าสุด" มาใช้ตรง ๆ**
  → ดู **RISK-F20**
- **`"ProgramID" IS NULL`** (โหมดดูโปรไฟล์เฉย ๆ ตาม `## RIASEC Fit Rules` ข้อ 8) **ไม่นับเป็นการทำ
  REQ-007 "ของสาขานั้น"** ไม่ว่ากรณีใด — gate จึงไม่มีทางผ่านด้วยแถวที่ `"ProgramID" IS NULL`
  (query ข้างบนกรองออกให้แล้วโดยธรรมชาติเพราะ `@ProgramID` ที่ส่งเข้ามาไม่มีทางเป็น `NULL`)
- gate เป็นเท็จ → endpoint คืน 409/400 พร้อมพาไปหน้า RIASEC ของสาขานั้น (Module I-b) **ห้ามคืน 200
  แล้วให้หน้าจอ disable ปุ่มเอง** — ตรงกับหลักการเดิมของโมดูลนี้ (REQ-009: กั้นที่เซิร์ฟเวอร์ ไม่ใช่
  กั้นที่หน้าจอ)

### 3. สลับสาขาเป้าหมาย — การ invalidate ผลเก่าเพื่อจุดประสงค์ของ gate เท่านั้น

**การตัดสินใจของเอกสารนี้ (requirement ไม่ได้ระบุ — เลือกทางที่ปลอดภัยกว่า)**: เมื่อสาขา A ที่เคยเป็น
`'active'` ถูกแทนที่ด้วยสาขาอื่น (ไม่ว่าจะเปลี่ยนเป็น B หรือกรณีอื่นใดที่ทำให้ A เลิกเป็น `'active'`)
ให้ตั้ง `"Status" = 'superseded'`, `"SupersededAt" = now()` ที่แถว A นั้น **แล้วผูก gate check ของ A
เข้ากับหน้าต่างเวลาหลังจากนั้น**:

```
CanSetAsTarget(SchoolID, SID, ProgramID) = EXISTS (
    SELECT 1 FROM public."TCompassRiasecResult" r
    WHERE r."SchoolID" = @SchoolID AND r."SID" = @SID AND r."ProgramID" = @ProgramID
      AND r."CreatedAt" > COALESCE(
            (SELECT max("SupersededAt") FROM public."TCompassTargetProgram" t
             WHERE t."SchoolID" = @SchoolID AND t."SID" = @SID AND t."ProgramID" = @ProgramID
               AND t."SupersededAt" IS NOT NULL),
            '-infinity'::timestamptz)
)
```

- **เหตุผล**: ถ้านักเรียนเคยตั้ง A เป็นเป้าหมาย (ทำ REQ-007 ของ A ผ่านแล้ว) แล้วเปลี่ยนไปตั้ง B ต่อมา
  อยากกลับมาตั้ง A อีกครั้ง — สัญญานี้**บังคับให้ทำ REQ-007 ของ A ใหม่**แทนที่จะให้ผลเก่าของ A ใช้ซ้ำ
  ได้ฟรี ๆ เพราะการที่นักเรียนเปลี่ยนใจออกจาก A ไปแล้วครั้งหนึ่งเป็นสัญญาณที่สมควรให้ทบทวนใหม่ ไม่ใช่
  เชื่อผลของวันที่ตั้งใจครั้งก่อน
- **ไม่ลบ/ไม่แก้ไข `public."TCompassRiasecResult"` ของ A เลยแม้แต่แถวเดียว** — ยังคงหลักการ append-only
  ของ `## RIASEC Fit Rules` ข้อ 7 ("ห้ามคำนวณผลเก่าใหม่ ผลเก่าเป็นบันทึกของวันนั้น") ทุกประการ ·
  การ invalidate เกิดที่ **ชั้น gate ของ REQ-017 เท่านั้น** (เปรียบเทียบกับ `"SupersededAt"` ของ
  `TCompassTargetProgram`) ไม่ใช่การแก้ความหมายของแถว RIASEC เดิม — ผลเก่ายังใช้ดู/อ้างอิงประวัติได้
  ตามปกติ เพียงแต่ **ใช้ผ่าน gate ซ้ำไม่ได้อีกหลังถูก supersede**
- **นี่เป็นกลไกที่เอกสารนี้กำหนดเอง ไม่ใช่คำตอบตรงจากผู้ใช้** เพราะ REQ-017 ไม่ได้ถามเรื่องนี้ตรง ๆ
  (ถามแค่ "ห้ามใช้ผลของสาขาอื่นข้ามมา" ซึ่งชัดเจนอยู่แล้วจากการกรองด้วย `"ProgramID"` ในข้อ 2) —
  ถ้าผู้ใช้ต้องการให้ผลเก่าของสาขาที่เคยตั้งแล้วเลิกตั้งยังใช้ผ่าน gate ซ้ำได้ฟรี (ไม่ต้องทำใหม่)
  ต้อง amend ข้อนี้

### 4. Cardinality (จำนวนเป้าหมายพร้อมกัน) และ UI — ไม่ใช่ของหมวดนี้

ดู **OQ-F14** (จำนวนเป้าหมายพร้อมกัน — ส่งต่อ `uxui-designer` + `business-analyst`) และ **OQ-F15**
(หน้าตา/ตำแหน่งปุ่ม — ส่งต่อ `uxui-designer`) ที่ `## Unresolved Open Questions` — schema และ gate
ของหมวดนี้ใช้ได้ไม่ว่าคำตอบของทั้งสองข้อจะเป็นอย่างไร (ดูข้อ 1)

Contract:TargetMajorRules.v1
DEC-021

Evidence EVD-010: claim=DES-021 | state=confirmed | path=ClassOnlineWeb/Helper/CompassRiasecService.cs | symbol=SetTargetAsync | line=699 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6ad6ff98f15e5d7bdbb17580400661bd26eda9f46d243c6284aa33e4af51e909
Evidence EVD-011: claim=Contract:TargetMajorRules.v1 | state=confirmed | path=ClassOnlineWeb/Helper/CompassRiasecService.cs | symbol=CheckTargetGateAsync | line=663 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6ad6ff98f15e5d7bdbb17580400661bd26eda9f46d243c6284aa33e4af51e909
Evidence EVD-012: claim=DEC-021 | state=confirmed | path=ClassOnlineWeb/Controllers/Api/CompassRiasecController.cs | symbol=RiasecTargetSet | line=111 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=f444567a3c9b37dcec3d92c2479ec3dd8afeff439969aebda73b6e94e468faaf

Compatibility: additive-internal
Data/schema: additive
Migration/backfill: none
Security: none
Fallback: gate เป็นเท็จหรือ query ล้มเหลว → endpoint ตอบ 409/400 พร้อมพาไปหน้า RIASEC ของสาขานั้น (fail closed ที่เซิร์ฟเวอร์) — ห้ามตอบ 200 แล้วให้หน้าจอ disable ปุ่มเอง · แถว "ProgramID" IS NULL ไม่มีทางผ่าน gate
Material ambiguity: none

---

## DES-026 — Development Plan Contract

> **ใหม่ทั้งหมด (2026-09-15)** — สัญญาของ **REQ-018** ("ขั้นตอนแผนพัฒนา (Development Plan) หลังตั้งเป้าหมาย", ปิด **OQ-23**)
> อยู่ใน `ClassOnlineWeb` (Module I-b ขยายขอบเขต) · เชื่อมโยงผลจาก REQ-017 (สาขาเป้าหมาย) เข้ากับคะแนนกลุ่มสาระ และการแนะแนวทางพัฒนา

**สัญญาของ REQ-018 — อยู่ใน `ClassOnlineWeb` ทั้งหมด**

### 1. เงื่อนไขตั้งต้น (Preconditions & Visibility)
- **การเข้าถึงแท็บ "แผนพัฒนา" (Development Plan)**:
  - ต้องมีเป้าหมายสาขาที่ Active อยู่ใน `public."TCompassTargetProgram"` (`"Status" = 'active'`) สำหรับนักเรียนคนนั้น (`SchoolID`, `SID`)
  - หากยังไม่มีเป้าหมาย active: หน้าจอแสดง Empty State แจ้งเตือนว่า *"ยังไม่มีแผนพัฒนา กรุณาเลือกและตั้งเป้าหมายสาขาก่อนที่หน้าเส้นทางแนะนำ/เป้าหมายของฉัน"* พร้อมปุ่มนำทางไปยังหน้าเลือกสาขาเป้าหมาย (สอดคล้องกับ `tplGap` ใน mockup `compass-design.js:583-585`)

### 2. การวิเคราะห์ช่องว่างคะแนน (Gap Analysis Contract)
- คำนวณสดทุก request (ไม่ persist ผล gap ลง DB — สอดคล้องกับหลักการจับคู่คะแนนใน DES-020):
  1. ดึงเป้าหมาย active ของนักเรียน: `ProgramID` จาก `public."TCompassTargetProgram"`
  2. ดึงรายการกลุ่มสาระที่สาขานั้นต้องการจาก `public."TCompassProgramSubjectWeight"` (`ProgramID`, `Subject`, `Weight`)
  3. ดึงคะแนนกลุ่มสาระจริงของนักเรียนผ่าน `CompassScoreService.GetCanonicalSubjectAveragesAsync(schoolId, sID)` (ตามสัญญา DES-020 ข้อ 1)
  4. คำนวณ Gap รายกลุ่มสาระ:
     ```
     BenchmarkScore = TARGET_SCORE (75.0)   // ค่าคงที่เดียวกับ DES-020
     StudentScore   = score_s              // คะแนนจริงของเด็ก (0-100), หากไม่มีคะแนน = 0 (พร้อมระบุสถานะ "ไม่มีคะแนน")
     Gap            = max(0.0, BenchmarkScore - StudentScore)
     HasGap         = Gap > 0.0
     ```
  5. ผลลัพธ์ Gap Analysis แต่ละกลุ่มสาระส่งกลับโครงสร้าง:
     - `SubjectName`: ชื่อกลุ่มสาระ (1 ใน 8 กลุ่ม canonical)
     - `Weight`: น้ำหนักความสำคัญของสาขา (3=มาก, 2=ปานกลาง, 1=น้อย)
     - `CurrentScore`: คะแนนปัจจุบันของนักเรียน
     - `RequiredScore`: เกณฑ์คะแนนที่แนะนำ (75.0)
     - `GapScore`: คะแนนที่ยังขาดอยู่
     - `Status`: `'passed'` (คะแนนถึงเกณฑ์) หรือ `'needs_improvement'` (คะแนนยังไม่ถึงเกณฑ์)
  6. ลำดับการแสดงผล:
     - เรียงกลุ่มสาระที่ `needs_improvement` ขึ้นก่อน โดยเรียงตาม `Weight DESC`, ตามด้วย `GapScore DESC` เพื่อให้เด็กเห็นจุดที่ต้องเร่งพัฒนาที่สุดก่อน

### 3. แบบฝึกหัดทบทวนเพื่อพัฒนาตนเอง (Development Review Exercises)
- แสดงบล็อกแบบฝึกหัด/คำถามทบทวนสั้น ๆ สำหรับการพัฒนา (เช่น กล่องแบบฝึกหัด 4 ข้อตาม mockup):
  - มุ่งเน้นการทบทวนจุดที่ยังมี Gap หรือเตรียมความพร้อมเฉพาะทางของสาขาเป้าหมาย
  - **แยกขาดจาก REQ-008**: เป็นคำถามเสริมประจำแท็บแผนพัฒนา ไม่ใช่คลังแบบฝึกหัดทดลองสายชุดใหญ่ (REQ-008 ยังคงอยู่ใน Scope: Later ตามเดิม — ปิด OQ-24)
  - ตอบแล้วให้ feedback / สรุปความเข้าใจทันทีโดยไม่ต้องบันทึกลงตารางผลทางการ

### 4. บล็อกแนะนำตัวช่วย / แผนปฏิบัติการ (Action Plan & Orbit Tutor)
- สำหรับกลุ่มสาระที่มี `HasGap = true`:
  - แสดงกล่องแนะนำตัวช่วยพัฒนา เช่น คอร์สเสริม "Orbit Tutor" ที่ตรงกับกลุ่มสาระที่ขาด
  - ข้อมูลที่ส่งให้ Frontend: รายการคอร์ส/หัวข้อทบทวนที่แนะนำ (`CourseTitle`, `Subject`, `Provider = "Orbit Tutor"`, `LinkUrl`)

### 5. Data Contract (ViewModel)

```csharp
public class VMDevelopmentPlan
{
    public int ProgramID { get; set; }
    public string ProgramName { get; set; }
    public string FacultyName { get; set; }
    public List<VMSubjectGapItem> GapItems { get; set; }
    public List<VMReviewExerciseItem> ReviewExercises { get; set; }
    public List<VMSupportRecommendation> SupportResources { get; set; }
}

public class VMSubjectGapItem
{
    public string Subject { get; set; }
    public int Weight { get; set; }
    public double CurrentScore { get; set; }
    public double RequiredScore { get; set; }
    public double GapScore { get; set; }
    public bool HasGap { get; set; }
}

public class VMReviewExerciseItem
{
    public int ExerciseID { get; set; }
    public string QuestionText { get; set; }
    public List<string> Options { get; set; }
}

public class VMSupportRecommendation
{
    public string Subject { get; set; }
    public string Title { get; set; }
    public string Provider { get; set; }       // เช่น "Orbit Tutor"
    public string ActionUrl { get; set; }
}
```

Contract:DevelopmentPlan.v1
DEC-027

Evidence EVD-028: claim=DES-026 | state=confirmed | path=ClassOnlineWeb/assets/js/compass-design.js | symbol=tplGap | line=579 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=b341cc8c2a10bf5001320729e0e65558bcd55b52896e49737379c0ca1f409b01
Evidence EVD-029: claim=Contract:DevelopmentPlan.v1 | state=confirmed | path=ClassOnlineWeb/assets/js/compass-design.js | symbol=gapRows | line=591 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=b341cc8c2a10bf5001320729e0e65558bcd55b52896e49737379c0ca1f409b01
Evidence EVD-030: claim=DEC-027 | state=confirmed | path=ClassOnlineWeb/Helper/CompassScoreService.cs | symbol=GetCanonicalSubjectAveragesAsync | line=282 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6dfb00c0d5804542dc39cedc0da77d9c81f97b4ecb8003524dfb3ddcdb32fdc5

Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: sensitive
Fallback: นักเรียนไม่มีเป้าหมาย active → คืนสถานะ target_empty และแนะนำให้เลือกสาขาเป้าหมายก่อน · สาขาไม่มีแถวน้ำหนักกลุ่มสาระ → แสดง Gap รายการว่างพร้อมเตือนข้อมูลหลักสูตรไม่สมบูรณ์ · นักเรียนไม่มีคะแนนบางวิชา → ถือ CurrentScore = 0 พร้อมแฟล็ก missing_score
Material ambiguity: none

---

## DES-022 — Cluster Determination Rules

> **ใหม่ทั้งหมดในรอบที่ 2 (REQ-011 + REQ-013)** — สัญญานี้คือคำตอบของ OQ-F03 ที่ `requirement.md`
> สั่งให้ `system-analyst` เสนอ · **ผู้ใช้ยืนยันปิด OQ-F03/OQ-F06/OQ-F07 เป็น confirmed ทั้งหมดแล้ว
> (2026-08-31, รอบยืนยันที่สองในวันเดียวกัน)** — ทุกสูตรในหมวดนี้เป็น **Contract แล้ว ไม่ใช่ข้อเสนอ**
> Q&A ของรอบที่เสนอถูกย้ายไปที่ `design-archive.md` (P-F01–P-F04) **ข้อยกเว้นเดียวที่ยังไม่ปิด**:
> Module K implement ได้ในทางทฤษฎีแล้ว แต่ **ยังรอ DEP-F09** (คอลัมน์ `stddev_score` ที่ `sb-compass`
> ต้องเพิ่มยังไม่มีอยู่จริง — ทิศทางเลือกแล้ว การดำเนินการยังไม่เสร็จ)

**สัญญาของ REQ-011 + REQ-013 — ทั้งหมดนี้อยู่ใน `ClassOnlineWeb` (C#), Module K**

### 1. T-Score ของกลุ่มสาระ (REQ-013) — confirmed

**ปัญหาที่ `system-analyst` แก้ให้**: REQ-013 เขียนสูตรว่า "คะแนนดิบ 60% + หน่วยกิต 40%" แต่ใน
ย่อหน้าเดียวกันห้ามคำนวณคะแนนดิบชุดที่สอง (ต้องใช้ค่าถ่วงน้ำหนักหน่วยกิตของ REQ-012 ตัวเดียว) —
อ่านตรงตัวพร้อมกันไม่ได้ · **ผู้ใช้ยืนยันการตีความด้านล่างตามที่เสนอ ไม่มีการปรับ (2026-08-31)**:

```
สำหรับแต่ละกลุ่มสาระ s (8 กลุ่ม canonical) ต่อนักเรียนหนึ่งคน:

  WeightedScore_s = ค่าที่ CompassScoreService.GetCanonicalSubjectAveragesAsync คืนมา (Module E)
                    — ตัวเลขเดียวที่มีอยู่แล้วจาก REQ-012 ไม่คำนวณใหม่

  TotalCredit_s   = ผลรวมหน่วยกิตของทุกวิชาที่ map เข้ากลุ่มสาระ s (ตัวชี้วัดความลึก/ความเข้ม
                    ของการเรียน ไม่ใช่ตัวคูณที่ใช้ในสูตรถ่วงน้ำหนักของ REQ-012)

  ScorePercentile_s  = percentile ของ WeightedScore_s เทียบนักเรียนทั้งประเทศที่ระดับชั้นเดียวกัน
  CreditPercentile_s = percentile ของ TotalCredit_s เทียบนักเรียนทั้งประเทศที่ระดับชั้นเดียวกัน

  Composite_s = 0.6 × ScorePercentile_s + 0.4 × CreditPercentile_s   (0-100)

  TScore_s = 50 + 10 × (Composite_s − nationalMean(Composite_s)) / nationalSD(Composite_s)
```

**`TScore_s` เป็นค่าเดียว คำนวณครั้งเดียวต่อ (นักเรียน × กลุ่มสาระ) แล้วใช้ซ้ำทุกที่ที่ต้องใช้
T-Score** — ผู้ใช้ยืนยันชัดเจนว่า **ค่า T-Score ที่ใช้วิเคราะห์ว่านักเรียนเหมาะกับคลัสเตอร์ไหน
(ข้อ 3 ด้านล่าง) ต้องเป็นค่าเดียวกับที่คำนวณในข้อนี้ ไม่ใช่คำนวณ T-Score แยกอีกชุดสำหรับแต่ละที่ที่ใช้**
— Module K คำนวณ `TScore_s` ครบ 8 กลุ่มสาระหนึ่งครั้งต่อคำขอ แล้วป้อนเข้าสูตร `AcademicFit(c)` ของ
ทั้ง 11 cluster จากชุดค่าเดียวกัน (ดู `## Data Model` — `public."TCompassStudentClusterScore"` เก็บผลลัพธ์
สุดท้ายเท่านั้น ไม่เก็บ `TScore_s` รายกลุ่มสาระแยก เพราะเป็นค่าที่คำนวณสดจากข้อมูลต้นทางเสมอ)

**ขอบเขตการใช้ T-Score — ยืนยันแล้ว (2026-08-31)**: `TScore_s` **ใช้เฉพาะในสูตรรวม 11-cluster ของ
หมวดนี้เท่านั้น** · **ไม่เข้าไปแทนที่หรือกระทบกลไก `TARGET_SCORE = 75`** ที่ใช้จัดอันดับสาขา/โปรแกรม
ใน `## Program Matching Rules` ข้อ 3 ซึ่งเป็นคนละชั้นข้อมูลและยังคงแยกจากกันเหมือนเดิม (ดูข้อ 5
ด้านล่าง) — **นี่คือคำตอบที่ยืนยันแล้ว ไม่ใช่ข้อสันนิษฐานของ `system-analyst` อีกต่อไป**
*(ที่มาของคำยืนยัน: ผู้ใช้ตอบผ่าน **coordinator relay** ในรอบนี้ ไม่ใช่การสัมภาษณ์ตรงโดย
`system-analyst` — บันทึกที่มาไว้เพื่อความโปร่งใสตาม convention เดียวกับที่ `sb-compass/requirement.md`
ใช้กับคำตอบที่มาผ่านตัวกลาง)*

### 1a. แหล่งค่าอ้างอิงที่สูตรต้องใช้แต่ฐานข้อมูลยังไม่มี — `CreditPercentile` + `nationalMean/SD(Composite)` (ใหม่ v11, 2026-09-16 — ✅ ผู้ใช้อนุมัติทางเลือก A แล้ว · เหลือรอบ amend + implement ฝั่ง `sb-compass`)

**ปัญหาที่พบจากโค้ดจริง (ครึ่งหนึ่งของ ISS-F03 — รายงานโดยรอบ verify และยืนยันจากไฟล์จริงแล้ว)**:
โค้ด Module K (`CompassClusterService.cs`) บันทึก design gap ไว้สองชั้น:
1. **`TryGetCreditPercentile` คืน `false` เสมอ** (บรรทัด 340-346 — คอมเมนต์ในไฟล์ระบุเองว่า
   "no nationwide credit distribution exists in any table today") → caller ตัดทุกกลุ่มสาระตามกติกา
   §2 → `tscoreBySubject` ว่าง → `AcademicFit` เป็น `NULL` ทุก cluster → รอบคำนวณดีที่สุดได้
   basis `interest_only` และถ้าไม่มีคำตอบ RIASEC/น้ำหนัก = `none` (สถานะจริงปัจจุบัน)
2. **`CompositeMean`/`CompositeSd` ไม่มีแหล่งเก็บ** (`NatRow` บรรทัด 300-301 ระบุ "no stored source
   today — always NULL" · gate บรรทัด 132-136 ตัด subject เมื่อเป็น `NULL`) — แม้ข้อ 1 จะแก้
   สูตร `TScore_s = 50 + 10 × (Composite_s − nationalMean) / nationalSD` ของ §1 ยังคำนวณไม่ได้อีก

`public."TCompassLevelSubjectStat"` (v8 ของ `sb-compass`) มีคอลัมน์ `"MeanScore"`/`"StddevScore"`/
`"StudentCount"`/`"SchoolCount"` เท่านั้น — **ไม่มีคอลัมน์ใดเก็บการกระจายหน่วยกิตหรือสถิติของ Composite**

**ทางแก้ที่เสนอ (ตาม precedent ของ OQ-F06 ทางเลือก A ที่ผู้ใช้เลือกไว้แล้ว)**: เพิ่มคอลัมน์
**additive 4 ตัว** ที่ `public."TCompassLevelSubjectStat"`: `"CreditMean"` · `"CreditSd"` ·
`"CompositeMean"` · `"CompositeSd"` (`double precision NULL` ได้ · กติกา `NULL`/`0` เดียวกับ
`"StddevScore"` ตามข้อ 2) คำนวณใน batch ชุดเดียวกันต่อ (ระดับชั้น × กลุ่มสาระ):
- `"CreditMean"`/`"CreditSd"` = population mean/SD ของ `TotalCredit_s` (หน่วยกิตรวมที่เด็กแต่ละคน
  เรียนจริงในกลุ่มสาระ s — ค่าเดียวกับที่ Module E คำนวณรายคนอยู่แล้ว) ของประชากรในแถวนั้น ·
  `MIN_N_FOR_STDDEV = 30` ใช้กฎเดียวกับ `"StddevScore"`
- `"CompositeMean"`/`"CompositeSd"` = mean/SD ของ `Composite_s = 0.6 × ScorePercentile_s + 0.4 ×
  CreditPercentile_s` จากประชากรชุดเดียวกัน (batch ต้องคำนวณเป็นสอง pass ภายในรอบเดียว)

**ผูกพันข้ามโมดูล**: ตารางและ batch เป็นของ **`sb-compass` Module C** — โมดูลนี้**อ่านอย่างเดียว
ไม่เขียน ไม่นิยาม DDL เอง** เหมือนที่ทำกับ `"StddevScore"` · ตามคำชี้ขาดที่อยู่ 2026-09-16
ตารางนี้อยู่ใน **`SB_Compass` (PGCompass)** — รอบ amend ฝั่ง `sb-compass` ต้องระบุการเปลี่ยน
connection ด้วย (โค้ดปัจจุบัน `CompassRankingService.cs:33` ยังชี้ `PGGradeDBEntities` ซึ่งจะ
สร้างตารางผิดฐาน) · ✅ **OQ-F19 ปิดแล้ว (2026-09-16) —
ผู้ใช้เลือกทางเลือก A** เหลือเป็น **งานตามลำดับ ไม่ใช่คำถามเปิด**: (1) `business-analyst` ของ
`sb-compass` ขยาย `sb-compass REQ-017` หรือเปิด REQ ใหม่ (2) `system-analyst` ฝั่งนั้น amend
DDL/batch contract ตามสูตรในข้อนี้ (3) implement + recompute `?limit=0` — ติดตามแบบเดียวกับ
DEP-F09/PRE-F09

**ทางเลือก B ที่ผู้ใช้พิจารณาแล้ว**: เปลี่ยนสูตร §1 เป็น score-only (ตัดส่วน 40% หน่วยกิตทิ้ง) —
**ผู้ใช้ไม่เลือกทางนี้ (2026-09-16)** เพราะขัด OQ-F03/P-F01 ที่ยืนยัน 60/40 ไว้ · **ห้าม engineer
ยกขึ้นเสนอใหม่โดยไม่มีเหตุใหม่** · ถ้าวันหน้าจะเปลี่ยนต้อง amend §1 ใหม่ทั้งข้อ

**สถานะระหว่างรอ implement ฝั่ง `sb-compass`**: โค้ดคงพฤติกรรมปัจจุบัน (ตัด subject → fallback
ตาม §2) ซึ่ง**ถูกต้องตามสัญญาแล้ว ไม่ใช่บั๊ก** — ISS-F03 จะปิดได้เมื่อ (ก) รอบ amend + implement
ฝั่ง `sb-compass` ตามทางเลือก A เสร็จ (อนุมัติแล้ว) และ (ข) seed น้ำหนัก §4a ถูก INSERT
(ค่ายืนยันแล้ว — OQ-F18 ปิด) — ต้องเกิดพร้อมกันจึงได้ `ScoreBasis ≠ none`

### 2. `"StddevScore"` — requirement ฝั่ง `sb-compass` ลงแล้ว เหลือ implement (RISK-F14, DEP-F09)

`nationalSD(Composite_s)` ในข้อ 1 ต้องมีส่วนเบี่ยงเบนมาตรฐานระดับประเทศต่อ (ระดับชั้น × กลุ่มสาระ)
แต่ `public."TCompassLevelSubjectStat"` **ยังไม่เคยถูกสร้างในฐานข้อมูลใด ๆ เลย** (`sb-compass`
ทุก phase ยัง `deployed ⬜`) — **ยังไม่มี `"StddevScore"` ในฐานข้อมูลจริง เพราะยังไม่มีตารางเลย**

**OQ-F06 ปิดแล้ว (2026-08-31) — ทางเลือก A**: เพิ่มคอลัมน์ `"StddevScore"` ใน
`public."TCompassLevelSubjectStat"` แบบ additive คำนวณในรอบ batch เดียวกับ `"MeanScore"` — ไม่ใช่การสร้าง
ตาราง national-stats ซ้ำซ้อนของโมดูลนี้เอง (ทางเลือก B ถูกตัด) และไม่ใช่การเลื่อน T-Score ไปเฟสถัดไป
(ทางเลือก C ถูกตัด)

**ความคืบหน้าจริง (2026-08-31) — ออกแบบครบทั้งสองฝั่งแล้ว เหลือ implement**:

- ✅ `sb-compass/requirement.md` → **`sb-compass REQ-017`** (คอลัมน์ `"StddevScore"`)
- ✅ `sb-compass/design.md` **Contract Version 8** → DDL (`"StddevScore" double precision NULL`
  อยู่ใน `CREATE TABLE IF NOT EXISTS` ตั้งแต่แรก — **ไม่ใช่ `ALTER TABLE ... ADD COLUMN` แยกต่างหาก
  เพราะไม่มีตารางเก่าให้ต้องเติมคอลัมน์เข้าไป**) และ contract การคำนวณอยู่ที่
  `sb-compass/design.md` → `## National Stats Batch Rules` § `"StddevScore"` · งานอยู่ใน **Module C**
  ของโมดูลนั้น
- ✅ **`sb-compass OQ-18` ปิดแล้ว (2026-08-31)** — (ก) สูตร = **population stddev (หาร `n`)** ·
  (ข) **`MIN_N_FOR_STDDEV = 30`** (ยืนยันโดยผู้ใช้ · เขียนเป็นค่าคงที่ในสัญญาของโมดูลนั้นแล้ว)
  *(หมายเหตุเลข: `sb-compass/requirement.md` เรียกคำถามนี้ว่า "OQ-14" แต่ `sb-compass/design.md`
  ใช้ **OQ-18** เพราะ OQ-14 ของ design ฝั่งนั้นถูกใช้/ปิดไปแล้วตั้งแต่ 2026-08-25 — คนละเลข คำถามเดียวกัน)*
- ⬜ **เหลืออย่างเดียว: implement จริง** (แก้ `CompassRankingService.EnsureTables` ให้สร้างตาราง
  ด้วย DDL ใหม่ + batch + recompute ด้วย `?limit=0`) ที่ `sb-compass` Module C — **ไม่ต้อง migration**
  เพราะทั้งตารางยังไม่เคยถูกสร้าง (`sb-compass/design.md` v8) · **ไม่มีคำถามเปิดค้างอยู่แล้วทั้งสองฝั่ง**

**สิ่งที่ `sb-compass` รับประกันให้เอกสารนี้ (สัญญาข้ามโมดูล — อ้างจาก `## National Stats Batch Rules`
§ `"StddevScore"` ข้อ 3-4 ของโมดูลนั้น)**: `"StddevScore"` **เป็น `NULL` ได้** (n น้อยเกินไป/คำนวณไม่ได้)
· **เป็น `0` ได้** (ทุกคนได้คะแนนเท่ากันจริง) · และเมื่อมีค่า จะคำนวณจากประชากรและค่าที่ถ่วงน้ำหนัก
หน่วยกิตชุดเดียวกับ `"MeanScore"` ของแถวเดียวกันเสมอ

#### กติกา fallback ของ Module K — confirmed (ไม่ต้องรอ `sb-compass OQ-18`)

ทั้งสองกรณี (`NULL` และ `0`) ทำให้ `TScore_s` ของกลุ่มสาระนั้น **คำนวณไม่ได้** (หารด้วยศูนย์ /
ไม่มีตัวหาร) → กติกาคือ:

1. **ตัดกลุ่มสาระนั้นออกจากการคำนวณ `AcademicFit(c)` ทั้งตัวตั้งและตัวหาร** (ทุก cluster) —
   ไม่ใช่แทนค่าเดา ไม่ใช่ให้ `TScore_s = 50`
2. **ตัดออกจากทั้งตัวตั้งและตัวหาร ไม่ใช่ coverage penalty แบบ `## Program Matching Rules` ข้อ 3**
   — จุดนี้ต่างกันโดยเจตนา: ที่นั่นการที่เด็ก**ไม่มีคะแนน**เป็นข้อมูลจริงเกี่ยวกับตัวเด็ก จึงหักคะแนนได้
   · แต่ที่นี่การที่**ระบบไม่มีค่าอ้างอิงระดับประเทศ**เป็นช่องว่างของข้อมูลฝั่งเรา **ไม่ใช่ความบกพร่อง
   ของเด็ก** — หักคะแนนเด็กเพราะฐานข้อมูลเราไม่พร้อมคือการลงโทษผิดคน
3. **ถ้าทุกกลุ่มสาระถูกตัดหมด** → `AcademicFit(c)` เป็น `NULL` ทุก cluster → **ใช้ `InterestFit(c)`
   อย่างเดียวชั่วคราว** (สมมาตรกับกรณีที่เด็กยังไม่ทำ RIASEC ในข้อ 3) · ถ้า **ทั้งสองฝั่งเป็น `NULL`**
   → แสดงข้อความว่ายังประเมินไม่ได้ · **ห้าม error ห้ามคืน 0% ห้ามแสดงอันดับปลอม**
4. **ฐานการคำนวณต้องเหมือนกันทั้ง 11 cluster ในผลลัพธ์ชุดเดียวกันเสมอ** — ถ้ากลุ่มสาระใดถูกตัด
   ต้องตัดออกจากทุก cluster พร้อมกัน · **ห้ามให้บาง cluster คิดจาก 8 กลุ่มสาระ แต่บาง cluster
   คิดจาก 5** เพราะจะทำให้ `CombinedScore` ข้าม cluster เทียบกันไม่ได้ และอันดับจะเพี้ยนแบบเงียบ
5. **`NULL` กับ `0` ปฏิบัติเหมือนกันในการคำนวณ แต่ห้ามยุบเป็นค่าเดียวตอนอ่านจาก DB** — ต้องแยกได้
   เพื่อ log/วินิจฉัยว่าเป็น "ข้อมูลอ้างอิงไม่พอ" หรือ "กลุ่มนั้นคะแนนเท่ากันหมด" ซึ่งเป็นคนละปัญหา

**เกณฑ์ที่ `sb-compass` ใช้จริงคือ `MIN_N_FOR_STDDEV = 30`** (ยืนยัน 2026-08-31) — แปลว่า
(ระดับชั้น × กลุ่มสาระ) ที่มีนักเรียนน้อยกว่า 30 คนในฐานข้อมูลจะได้ `"StddevScore" = NULL` และ
**ถูกตัดออกจากการคำนวณ `AcademicFit` ตามกติกา 5 ข้อข้างบน** · เลขนี้เปลี่ยนแค่ *จำนวนแถว* ที่เป็น
`NULL` ไม่ได้เปลี่ยนกติกา → **Module K เขียนโค้ดตามนี้ได้เลย** · ถ้าหลัง deploy พบว่าถูกตัดเป็นวงกว้าง
จนคุณภาพ T-Score ตก ให้ส่งตัวเลขกลับไปที่ `system-analyst` **เพื่อ amend เกณฑ์ที่ `sb-compass`**
ไม่ใช่แก้ที่โมดูลนี้

### 3. สูตรรวม cluster (คำตอบของ OQ-F03) — confirmed ไม่มีการปรับ

```
สำหรับแต่ละ cluster c ใน 11 cluster:

  AcademicFit(c) = Σ_s ( clusterSubjectWeight_c,s × TScore_s ) / Σ_s ( clusterSubjectWeight_c,s )
                   — TScore_s คือค่าเดียวกับข้อ 1 (ไม่คำนวณใหม่) · ปรับสเกล TScore (mean 50, SD 10,
                   ไม่มีขอบเขตบนล่างแน่นอน) ให้อยู่ใน 0-100 ด้วย clamp:
                   min(100, max(0, 50 + (TScore_s − 50) × 5))  -- ทำให้ ±5 SD ครอบคลุม 0-100

  InterestFit(c) = Σ_r ( clusterRiasecWeight_c,r × riasecScore_r ) / Σ_r ( clusterRiasecWeight_c,r )
                   — riasecScore_r คือ studentLevel(r) ตาม `## RIASEC Fit Rules` ข้อ 3 แปลงเป็น 0-100
                   ด้วย (studentLevel_r − 1) / 4 × 100

  CombinedScore(c) = 0.5 × AcademicFit(c) + 0.5 × InterestFit(c)   -- น้ำหนัก 50/50 ยืนยันแล้ว ไม่มีการปรับ
```

- **แสดงผล top-3 cluster พร้อม % เสมอ ไม่ใช่ผู้ชนะเดียว** — สอดคล้องกับที่
  `education-pathway-taxonomy-design.md` แนะนำไว้เองในโหมด "ยังไม่รู้ว่าชอบอะไร" (ส่วน F.1, Journey 6)
  และลดความเสี่ยงจากตารางน้ำหนักที่ยังเป็นสมมติฐาน (ข้อ 4) — การชี้ผู้ชนะเดียวผิดพลาดได้ง่ายกว่า
  การเสนอ 3 อันดับให้เด็กเลือกเอง — **ยืนยันแล้วตามที่เสนอ ไม่มีการปรับ**
- **นักเรียนที่ยังไม่ทำ RIASEC**: `InterestFit(c)` และ `CombinedScore(c)` เป็น `NULL` ทั้งคู่ —
  ใช้ `AcademicFit(c)` แสดงแทนชั่วคราวพร้อมข้อความชวนทำ RIASEC (ดู `## Program Matching Rules` ข้อ 2.5)

### 4. ตารางน้ำหนัก cluster↔subject และ cluster↔RIASEC — confirmed (sign-off, ยังมาร์กเป็นสมมติฐาน)

`public."TCompassClusterSubjectWeight"` (11×8) และ `public."TCompassClusterRiasecWeight"` (11×6) **ไม่มีแหล่ง
อ้างอิงเชิงตัวเลขภายนอก** — ร่างจากคำอธิบายเชิงคุณภาพของแต่ละ cluster ใน
`education-pathway-taxonomy-design.md` ส่วน C (เช่น C1 สุขภาพ: คณิต/วิทย์ = มาก(3), ภาษาอังกฤษ =
ปานกลาง(2), ที่เหลือ = น้อย(1) · C9 ภาษา: ภาษาไทย/ภาษาอังกฤษ = มาก(3) ฯลฯ) และมิติ RIASEC จากงานวิจัย
Holland Code มาตรฐานที่จับคู่อาชีพแต่ละกลุ่มกับมิติ (เช่น C1 สุขภาพ ↔ S+I สูง · C3 คอมพิวเตอร์ ↔
I+R+C สูง · C10 ศิลปะ ↔ A สูง) — **ผู้ใช้ sign-off แล้ว (2026-08-31, OQ-F07 ปิด) ให้เริ่ม seed/ใช้ค่า
เหล่านี้ได้** แต่ตาม policy การจัดการสมมติฐาน **ยังคงติดป้าย "ไม่มีแหล่งอ้างอิงภายนอกยืนยัน" ต่อไป** —
sign-off คือการอนุญาตให้เริ่มใช้งาน ไม่ใช่การยกระดับเป็นข้อเท็จจริง (ดู RISK-F15)

> 🔴 **v11 (2026-09-16) — พบว่าค่าที่ sign-off ไว้ไม่เคยมีอยู่ในไฟล์ใดเลย**: ตัวเลขน้ำหนักที่ผู้ใช้
> sign-off เมื่อ 2026-08-31 (OQ-F07) **ไม่เคยถูกบันทึกลงเอกสารหรือไฟล์ seed ใด** — เอกสารนี้
> เขียนไว้แค่ตัวอย่างราย cluster, `education-pathway-taxonomy-design.md` มีแต่คำบรรยายเชิงคุณภาพ
> (ไม่มีตารางตัวเลข 3/2/1 — ตรวจไฟล์จริงแล้ว), และสคริปต์ bootstrap ที่ผู้ใช้แก้เอง **ปฏิเสธเดาค่า
> เองโดยเจตนา** (บรรทัด 579-585: "ใส่ตัวเลขเดาเองในสคริปต์นี้จะขัดกับห้ามเดาเอง") → สองตาราง
> น้ำหนักยังว่างจนถึงวันนี้ · **ช่องว่างนี้คือรากของครึ่งหนึ่งของ ISS-F03** (ทุก `InterestFit`/
> `AcademicFit` เป็น `NULL` เพราะ `LoadClusterSubjectWeights`/`LoadClusterRiasecWeights` ได้
> dict ว่าง)

### 4a. เมทริกซ์น้ำหนักฉบับร่างใหม่ (ใหม่ v11, 2026-09-16 — ✅ ยืนยันแล้วเป็น engineering default · seed ได้)

**สถานะ: engineering default ที่ยืนยันแล้ว** — ผู้ใช้มอบสิทธิ์ให้ `system-analyst` เลือกค่าเองแบบ
OQ-F12/OQ-F16 (2026-09-16 — **OQ-F18 ปิด**) เขียนแทนชุดเดิมที่ไม่เคยถูกบันทึก · **INSERT seed ได้ทันที**
ในรูปแบบ `INSERT ... SELECT ... JOIN` บนคอลัมน์ code ตามกติกา v9 ของ `## Data Model` § seed (ห้ามใส่ Id)

**กติกาการร่าง (อ่านย้อนได้)**: มาก = 3 · ปานกลาง = 2 · น้อย = 1 (ชุดเดียวกับ D4 ใน archive) ·
ฝั่งกลุ่มสาระ: 3 = วิชาที่เนื้องานหลักของ cluster ตั้งอยู่บนวิชานั้น (จับคู่กับ Keywords/สาย ม.ปลาย
ของ taxonomy §C), 2 = เครื่องมือสำคัญรอง, 1 = พื้นฐาน · ฝั่ง RIASEC: 3 = มิติหลัก, 2 = รอง,
1 = ต่ำ จากการจับคู่ Holland มาตรฐาน · แถวที่ **§4 เดิมระบุตัวอย่างไว้จริง (C1/C9 ฝั่งกลุ่มสาระ ·
C1/C3/C10 ฝั่ง RIASEC) ล็อกตามตัวอย่างนั้น**

**`public."TCompassClusterSubjectWeight"` (11×8) — ลำดับคอลัมน์: คณิต · วิทย์ · อังกฤษ · ไทย · สังคม · พลศึกษา · ศิลปะ · การงาน/เทคโนโลยี**:

| Cluster | คณิต | วิทย์ | อังกฤษ | ไทย | สังคม | พลศึกษา | ศิลปะ | การงาน/เทค | ที่มา (taxonomy §C) |
|---|---|---|---|---|---|---|---|---|---|
| C1 สุขภาพ | 3 | 3 | 2 | 1 | 1 | 1 | 1 | 1 | **ตัวอย่างเดิมที่ §4 ระบุ (ล็อก)** |
| C2 วิทย์-ค้นคว้า | 3 | 3 | 2 | 1 | 1 | 1 | 1 | 1 | Keywords: คณิต/ฟิสิกส์/เคมี/สถิติ |
| C3 คอมพิวเตอร์ | 3 | 2 | 2 | 1 | 1 | 1 | 1 | 3 | วิทย์–คณิต + ตรรกะ · โปรแกรมมิ่งอยู่การงาน/เทค |
| C4 วิศวกรรม | 3 | 3 | 2 | 1 | 1 | 1 | 1 | 3 | วิทย์–คณิตบังคับ + สายช่าง/อุตสาหกรรม |
| C5 ธุรกิจ | 2 | 1 | 2 | 1 | 2 | 1 | 1 | 3 | บัญชี/เศรษฐศาสตร์ + สายพาณิชยกรรม |
| C6 บริการ/ท่องเที่ยว | 1 | 1 | 3 | 2 | 2 | 1 | 1 | 3 | "ศิลป์–ภาษา จุดแข็งสุด" + คหกรรม/ท่องเที่ยว |
| C7 เกษตร/อาหาร/สิ่งแวดล้อม | 1 | 3 | 1 | 1 | 2 | 1 | 1 | 3 | ชีวะ/ธรรมชาติ + เกษตร/คหกรรม |
| C8 กฎหมาย/การปกครอง | 1 | 1 | 2 | 3 | 3 | 1 | 1 | 1 | ศิลป์–สังคม + อ่านเยอะ/โต้แย้ง |
| C9 ภาษา/สื่อ/มนุษยศาสตร์ | 1 | 1 | 3 | 3 | 2 | 1 | 2 | 1 | **ตัวอย่างเดิมที่ §4 ระบุ (ล็อก)** + ผลิตสื่อ |
| C10 ศิลปะ/ออกแบบ/ดนตรี | 2 | 1 | 1 | 1 | 1 | 1 | 3 | 2 | สถาปัตย์ต้องคณิต/ฟิสิกส์ + พอร์ตโฟลิโอศิลป์ |
| C11 การสอน/จิตวิทยา | 2 | 2 | 2 | 3 | 3 | 2 | 1 | 2 | "ขึ้นกับวิชาเอกที่จะสอน" → ฐานกว้าง + ไทย/สังคมหนัก |

**`public."TCompassClusterRiasecWeight"` (11×6) — ลำดับคอลัมน์: R · I · A · S · E · C**:

| Cluster | R | I | A | S | E | C | ที่มา |
|---|---|---|---|---|---|---|---|
| C1 สุขภาพ | 2 | 3 | 1 | 3 | 1 | 2 | **ตัวอย่างเดิม S+I สูง (ล็อก)** + ละเอียดรอบคอบ |
| C2 วิทย์-ค้นคว้า | 2 | 3 | 1 | 1 | 1 | 2 | I หัวใจ + แล็บ/สถิติ |
| C3 คอมพิวเตอร์ | 3 | 3 | 1 | 1 | 1 | 2 | **ตัวอย่างเดิม I+R+C สูง (C ลดเป็นรอง)** |
| C4 วิศวกรรม | 3 | 2 | 1 | 1 | 1 | 1 | ลงมือทำ/สร้าง/ซ่อม |
| C5 ธุรกิจ | 1 | 1 | 1 | 2 | 3 | 2 | E หัวใจ + บัญชี/ทีม |
| C6 บริการ/ท่องเที่ยว | 1 | 1 | 1 | 3 | 2 | 1 | ต้อนรับ/ทำงานกับคน |
| C7 เกษตร/อาหาร/สิ่งแวดล้อม | 3 | 2 | 1 | 1 | 1 | 1 | ทำงานนอกอาคาร/ปลูก/เลี้ยง |
| C8 กฎหมาย/การปกครอง | 1 | 2 | 1 | 2 | 3 | 2 | E หัวใจ + เหตุผล/ช่วยสังคม/กฎระเบียบ |
| C9 ภาษา/สื่อ/มนุษยศาสตร์ | 1 | 2 | 3 | 2 | 1 | 1 | เล่าเรื่อง/คอนเทนต์ + มนุษยศาสตร์ |
| C10 ศิลปะ/ออกแบบ/ดนตรี | 2 | 1 | 3 | 1 | 1 | 1 | **ตัวอย่างเดิม A สูง (ล็อก)** + ฝีมือ/เครื่องมือ |
| C11 การสอน/จิตวิทยา | 1 | 2 | 1 | 3 | 1 | 1 | สอน/ช่วยเหลือ/เข้าใจคน |

**หลัง seed ถูกรัน**: ตารางน้ำหนักมีข้อมูลจริง → `InterestFit` คำนวณได้ทุก cluster · และ RISK-F15
(สมมติฐานไม่มีแหล่งอ้างอิงภายนอก) **ยังคงเป็นจริงเหมือนเดิม** — การมอบสิทธิ์/sign-off ไม่ยกระดับ
ค่าเป็นข้อเท็จจริง

### 5. TARGET_SCORE เดิมกับ T-Score ใหม่ — แยกกันคนละชั้น (ยืนยันแล้ว 2026-08-31)

`## Program Matching Rules` ข้อ 3 (`TARGET_SCORE = 75`) เป็นคนละกลไกกับ T-Score ของหมวดนี้ —
**ไม่รวมกัน ไม่แทนที่กัน · ผู้ใช้ยืนยันข้อนี้โดยตรงแล้ว (2026-08-31)**:

| กลไก | ใช้ค่าอะไร | ใช้ทำอะไร | อยู่ที่ไหน |
|---|---|---|---|
| `TARGET_SCORE = 75` | `WeightedScore_s` ดิบของ REQ-012 เทียบค่าคงที่ 75 (**ไม่ใช่ T-Score**) | จัดอันดับ **สาขา/โปรแกรมภายใน cluster** (REQ-006) | `## Program Matching Rules` ข้อ 3 |
| `TScore_s` | คะแนน+หน่วยกิตเทียบ percentile ระดับประเทศ แล้ว standardize (ข้อ 1) | **เลือก/จัดอันดับ 11 cluster** (REQ-011/013) | `## Cluster Determination Rules` ข้อ 1+3 |

เป็นคนละชั้นของ flow ตามที่ REQ-005 กำหนดไว้ ("เข้าสายก่อนแล้วเจาะลงสาขา" — ตอนนี้ "สาย" คือ cluster)
· **การเปลี่ยนกลไกจัดอันดับสาขาไปใช้ T-Score แทน `TARGET_SCORE` เป็นสิ่งที่ผู้ใช้ปฏิเสธไปแล้วในรอบนี้
ห้าม engineer รวมสองค่านี้เข้าด้วยกันเอง** — ถ้าวันหน้าอยากเปลี่ยนต้องกลับมา amend เอกสารนี้ก่อน

### 6. ความชัดเจนของโปรไฟล์ (`ClarityIndex`) — relative/adaptive scoring (ใหม่ v6, REQ-012 รอบที่ 3)

> **สถานะ: ✅ ปิดครบแล้ว (OQ-F12, 2026-09-02)** — กติกาธุรกิจ confirmed ตั้งแต่รอบก่อน และผู้ใช้
> อนุญาตให้ `system-analyst` เลือกค่าเริ่มต้นทางวิศวกรรมทั้ง 6 ตัวของข้อ 6.4-6.5 เอง (engineering
> judgment) — **`backend-engineer` implement ข้อ 6 ทั้งข้อได้เต็มแล้ว รวมชั้นแสดงผล 6.4-6.6**
> ค่าคงที่ทั้ง 6 ตัวด้านล่างเป็น **engineering default ที่บันทึกไว้อย่างเปิดเผย ไม่ใช่ตัวเลขที่มี
> แหล่งอ้างอิงทางวิชาการ/สถิติภายนอกรองรับ** — แก้ที่เดียวได้เหมือน `TARGET_SCORE` ถ้าในอนาคตมีข้อมูล
> จริงมาปรับ (ไม่ต้อง amend สัญญา)

**6.1 กติกาธุรกิจที่ผู้ใช้ยืนยันแล้ว — ไม่เปิดใหม่**

`requirement.md` REQ-012 (แก้ไขรอบที่ 3, ยืนยัน 2026-08-31): **คะแนนดิบเท่ากันแต่ความชัดเจนของโปรไฟล์
ต่างกัน ห้ามแสดงเหมือนกัน** — ตัวอย่างที่ผู้ใช้ให้: เด็ก X ได้ 70 ในคลัสเตอร์หนึ่ง โดยคะแนนคลัสเตอร์อื่น
กระจาย 40-95 (ชัดว่าชอบคลัสเตอร์นี้กว่าที่อื่นจริง) เทียบกับเด็ก Y ที่ได้ 70 เท่ากันแต่ทุกคลัสเตอร์อยู่
ที่ 65-75 (ไม่ชัดว่าชอบอะไร) — **ตัวเลขที่เด็กสองคนเห็นต้องไม่ใช่ "70" เหมือนกัน** · สิ่งที่ผู้ใช้
**ไม่ได้**ให้คือกลไกและค่าคงที่ (ระบุไว้ในย่อหน้าเดียวกันว่าเป็นงานของ `system-analyst`) → ข้อ 6.2-6.6
คือข้อเสนอ **ห้ามอ่านเป็นค่าที่ยืนยันแล้ว**

**6.2 ฐานของรอบ — `"ClusterCount"` (n)**

```
n = "ClusterCount" = จำนวนคลัสเตอร์ที่ **มีคะแนนจริงในรอบนี้** ตามฐานที่บันทึกไว้ใน "ScoreBasis"
    ('combined' → นับแถวที่ "CombinedScore" IS NOT NULL ·
     'academic_only' → "AcademicFit" IS NOT NULL · 'interest_only' → "InterestFit" IS NOT NULL)
```

- คลัสเตอร์ที่ฐานการคำนวณของมันหายไปทั้งหมดตาม **ข้อ 2 กติกา 3-4** ไม่ถูกนับใน `n` — **ห้ามนับเป็น 0
  แล้วเอาเข้าสูตร** เพราะจะทำให้การกระจายกว้างขึ้นเทียม ๆ · กลุ่มสาระที่ถูกตัดบันทึกไว้ที่
  `"ExcludedSubjects"` เพื่อการวินิจฉัย ไม่ใช่ค่าที่แสดง
- ข้อ 2 กติกา 4 บังคับให้ฐานเหมือนกันทั้ง 11 คลัสเตอร์อยู่แล้ว ดังนั้นในทางปฏิบัติ `n` เป็น **11 หรือ 0**
  เกือบทุกครั้ง — แต่สัญญานี้ **ไม่สมมติว่า `n = 11`** เพราะจำนวนคลัสเตอร์เป็นข้อมูล (`TCompassInterestCluster`)
  ไม่ใช่ค่าคงที่ในโค้ด
- **`n` และค่าสถิติทั้งหมดในหมวดนี้เป็นสมบัติของรอบ (`public."TCompassStudentClusterRun"`) ไม่ใช่ของ
  คลัสเตอร์ใดคลัสเตอร์หนึ่ง** — ห้ามเก็บซ้ำ 11 แถว (เหตุผลอยู่ในหมายเหตุของตารางหัวรอบใน `## Data Model`)

**6.3 ค่าสถิติของนักเรียนเอง — `"MeanOwn"` / `"SdOwn"` / `"GapTop"`**

```
S      = ชุดคะแนนของรอบนี้ตามฐานในข้อ 6.2 (|S| = n)
MeanOwn = ค่าเฉลี่ยเลขคณิตของ S
SdOwn   = ส่วนเบี่ยงเบนมาตรฐานแบบ **population (หาร n)** ของ S
GapTop  = (คะแนนสูงสุดใน S) − (คะแนนสูงสุดอันดับสอง ใน S)   -- เสมอกันที่หัวแถว → 0
```

- **population ไม่ใช่ sample** โดยเจตนา และเป็นค่าเดียวกับที่ `sb-compass` ใช้กับ `"StddevScore"`
  (ข้อ 2) — ที่นี่ `S` **คือประชากรทั้งหมดที่สนใจจริง ๆ** (คลัสเตอร์ทั้งหมดของรอบนั้น) ไม่ใช่กลุ่มตัวอย่าง
  ของอะไร · ผลพลอยได้: ไม่มีตัวหาร `n − 1` จึงไม่มีทางหารด้วยศูนย์เมื่อ `n = 1`
- `n < 2` → `"GapTop"` เป็น `NULL` (ไม่มีอันดับสอง) · `n = 0` → ทั้งสามค่าเป็น `NULL`
- **ทั้งสามค่าคำนวณจากค่าดิบ `"CombinedScore"` เสมอ** ห้ามคำนวณจากค่าที่ผ่านชั้นปรับของข้อ 7.4 แล้ว
  (ไม่งั้นจะเป็นการป้อนกลับตัวเอง)

**6.4 `"ClarityIndex"` (0-100) — ปิดแล้ว (OQ-F12, 2026-09-02) · ค่าคงที่เป็น engineering default**

```
ClarityIndex = 100 × min( 1 , ( W_SD  × min(1, SdOwn  / SD_REF )
                             + W_GAP × min(1, GapTop / GAP_REF) ) / ( W_SD + W_GAP ) )

  เมื่อ n < 3  →  ClarityIndex = NULL   (และ ClarityBand = NULL คู่กันเสมอ)
```

- **ค่าคงที่ 4 ตัวนี้ปิดแล้ว (OQ-F12) — ผู้ใช้อนุญาตให้ `system-analyst` เลือกเองเป็น engineering
  default** เก็บเป็นค่าคงที่ที่มีชื่อ แก้ที่เดียวได้ เหมือน `TARGET_SCORE`/`MIN_N_FOR_STDDEV`:
  - `SD_REF = 15` — **ระยะกระจายอ้างอิง**: ค่า `SdOwn` ที่ถือว่า "ชัดเจนเต็มที่แล้ว" (ตัวหารมาตรฐาน) —
    เลือกจากเหตุผลที่ว่า `CombinedScore` ทั้ง 11 คลัสเตอร์มักไม่กระจายเต็มช่วง 0-100 แบบสุ่มสม่ำเสมอ
    (ซึ่งจะให้ population SD ≈ 28.9) เพราะคลัสเตอร์หลายตัวใช้กลุ่มสาระ/มิติ RIASEC ร่วมกันบางส่วนจึง
    มีสหสัมพันธ์กันเอง — SD ที่ 15 ถือเป็นระดับที่ถือว่า "แยกตัวชัดเจนแล้ว" สำหรับข้อมูลลักษณะนี้
    **(สมมติฐานทางวิศวกรรม ยังไม่มีข้อมูลจริงมาปรับเทียบ)**
  - `GAP_REF = 10` — ระยะห่างอ้างอิงระหว่างอันดับ 1 กับอันดับ 2 (ทั้งคู่อยู่ใน [0,100]) ที่ถือว่า
    "อันดับหนึ่งโดดแล้ว" — เลือกจากสัดส่วนเดียวกับ `SD_REF` (~2/3 ของ SD ที่ถือว่าชัดเจน) ไม่มีแหล่ง
    อ้างอิงภายนอก
  - `W_SD = 1`, `W_GAP = 1` — น้ำหนักเท่ากันของสองพจน์ ตามรูปแบบเดียวกับ `W_LIKERT = W_RANK = 1`
    ที่ผู้ใช้ยืนยันแล้วใน `## RIASEC Fit Rules` ข้อ 3.4 (ไม่มีเหตุผลให้เอนเอียงไปทางใดทางหนึ่งก่อน
    มีข้อมูลจริง)
- **ทำไมต้องมีสองพจน์**: `SdOwn` ตอบว่า *โปรไฟล์ทั้งชุดแยกกันหรือไม่* · `GapTop` ตอบว่า *ตัวเลือกอันดับ 1
  โดดออกจากอันดับ 2 หรือไม่* — สองอย่างนี้ไม่ใช่เรื่องเดียวกัน (โปรไฟล์กระจายกว้างแต่หัวแถวติดกันสองตัว
  = ยังเลือกไม่ได้จริง) และผลลัพธ์ที่เด็กเห็นคือ **top-3 เรียงอันดับ** ตามข้อ 3 ระยะห่างที่หัวแถวจึงมีความหมาย
  ต่อการอ่านผลโดยตรง · **การตัดพจน์ใดพจน์หนึ่งทิ้งทำได้โดยตั้งน้ำหนักของมันเป็น 0 ไม่ต้องแก้สูตร**
- `min(1, …)` ทั้งสองชั้นทำให้ค่าอยู่ใน 0-100 เสมอ **ไม่ว่าค่าคงที่จะถูกตั้งเป็นเท่าไร** — ป้องกัน
  ไม่ให้การตั้งค่าผิดทำให้เกิดคะแนนเกิน 100 ในชั้นแสดงผล
- **เกณฑ์ `n < 3` เป็นส่วนหนึ่งของสัญญา ไม่ใช่ค่าที่เปิดให้ตั้ง** — ต่ำกว่านี้ "การกระจาย" ไม่มีความหมาย
  ให้ตีความ (สองจุดมีระยะห่างเดียวเสมอ) · กรณีนี้ **ต้องแสดงว่า "ยังประเมินความชัดเจนไม่ได้" ห้ามแสดง
  เป็น `'unclear'` และห้ามแทนด้วย 0** (ค่า `NULL` ของ `"ClarityIndex"`/`"ClarityBand"` ใน `## Data Model`
  หมายถึงข้อนี้)

**6.5 `"ClarityBand"` — 3 แถบ · เกณฑ์ปิดแล้ว (OQ-F12, 2026-09-02)**

```
ClarityIndex ≥ CLARITY_HIGH   → 'clear'
ClarityIndex ≥ CLARITY_LOW    → 'moderate'
มิฉะนั้น                        → 'unclear'
ClarityIndex IS NULL          → NULL  (ไม่ใช่ 'unclear' — ดูข้อ 6.4)
```

- **`CLARITY_HIGH = 70`, `CLARITY_LOW = 40`** — ปิดแล้ว (OQ-F12) เป็น engineering default เลือกจาก
  รูปแบบเกณฑ์ 3 ระดับที่ผู้ใช้คุ้นเคยอยู่แล้วใน `sb-compass` (เกณฑ์ 60/80 ของ REQ-001) โดยปรับตัวเลข
  ให้เหมาะกับสเกล `ClarityIndex` (0-100 เช่นกัน) — ไม่มีแหล่งอ้างอิงภายนอกรองรับ · บังคับ
  `0 < CLARITY_LOW < CLARITY_HIGH < 100` และ **ตรวจตอนอ่านค่าคงที่ ไม่ใช่ตอนคำนวณ** — ตั้งค่าผิดต้อง
  ล้มตั้งแต่ตอน start ไม่ใช่ไปโผล่เป็นแถบที่ไม่มีใครได้
- แถบเป็น**ค่าที่มาจาก `"ClarityIndex"` ล้วน ๆ** — เก็บไว้ในตารางเพื่อให้ผลเก่าอ่านได้เหมือนวันที่คำนวณ
  แม้ค่าคงที่จะถูกแก้ทีหลัง (หลักการเดียวกับ `## RIASEC Fit Rules` ข้อ 7 "ห้ามคำนวณผลเก่าใหม่")

**6.6 เป็นข้อมูลกำกับที่ต้องอธิบายได้ ไม่ใช่ตัวคูณเงียบ ๆ**

- `"ClarityIndex"`/`"ClarityBand"` เป็น **diagnostic/display metadata** · เมื่อใดที่ตัวเลขที่เด็กเห็น
  ถูกปรับด้วยค่าเหล่านี้ (ข้อ 7.4) **ต้องแสดงคำอธิบายกำกับเสมอในหน้าจอเดียวกัน** ว่าปรับเพราะอะไร —
  **ตัวเลขที่ถูกย่อโดยไม่มีคำอธิบายให้เห็นคือสิ่งที่รอบนี้ปฏิเสธไปแล้ว**: ข้อเสนอ "Adaptive Threshold"
  ของ `education-pathway-assessment-design.md` ถูก REJECT ด้วยเหตุผลนี้ (`sb-compass/design.md`
  คำวินิจฉัย) **ห้ามนำกลับเข้ามาในรูปของตัวคูณที่ไม่มีใครเห็น**
- ถ้อยคำสุดท้ายเป็นของ `uxui-designer` ตามวินัยเดียวกับ **WORD-F01** — สัญญานี้กำหนดเฉพาะ
  *สิ่งที่ต้องสื่อ* (ปรับแล้ว · ปรับเพราะอะไร · ค่าดิบยังอยู่) ไม่ได้เขียน copy ให้ · และเช่นเดียวกับ
  WORD-F01 **ห้ามใช้ถ้อยคำเชิงตัดสิน** ตาม `## RIASEC Fit Rules` ข้อ 6 (เด็กที่โปรไฟล์ยังไม่ชัด
  ไม่ใช่เด็กที่ "ไม่ผ่าน")

**6.7 ไม่กระทบการจัดอันดับ — ข้อห้ามที่ห้ามพลาด**

- **การเลือก/เรียง top-3 ของข้อ 3 ใช้ `"CombinedScore"` ค่าดิบเสมอ** · ข้อ 6 เปลี่ยนเฉพาะ *ตัวเลขที่
  แสดงคู่กับอันดับ* ไม่เคยเปลี่ยน *ลำดับ* — และชั้นปรับในข้อ 7.4 เป็นการแปลงเชิงเส้นที่ใช้ตัวคูณเดียวกัน
  ทั้งรอบ จึง **รักษาลำดับไว้โดยโครงสร้าง ไม่ใช่โดยบังเอิญ**
- **ห้ามเขียนค่าที่ปรับแล้วทับ `"CombinedScore"`** (ข้อบังคับใน `## Data Model`) — ค่าที่แสดงมีคอลัมน์
  ของตัวเองคือ `"DisplayScore"`
- ห้ามใช้ `"ClarityIndex"` ไปตัดคลัสเตอร์ออกจากผล ห้ามใช้เป็นเกณฑ์ผ่าน/ไม่ผ่าน และห้ามใช้เปลี่ยนจำนวน
  รายการที่แสดง (top-3 คือ top-3 เสมอตามข้อ 3)

### 7. Confidence + shrinkage (ใหม่ v6, REQ-012 รอบที่ 3 ข้อ 4 · **re-scope ทั้งข้อ v8, 2026-09-02**)

> ⚠️ **เหตุผลของการ re-scope — อ่านก่อนใช้หมวดนี้**: OQ-F11 ข้อ (ง) ("อนุญาตให้ส่งคำตอบไม่ครบได้")
> **ถูกปฏิเสธ** — `requirement.md` รอบที่ 5 (2026-09-02) ยืนยันว่ากติกาเดิม **"ต้องตอบครบ 100% ของ
> แบบทดสอบจึงจะส่งได้" ยังคงอยู่ ห้ามส่งไม่ครบ** เด็ดขาด แต่กลไก Confidence ทั้งข้อที่เขียนไว้เดิม
> (v6) **ถูกออกแบบขึ้นโดยมีสมมติฐานว่าการส่งแบบไม่ครบเป็นไปได้** — นิยาม `AnswerCoverage =
> AnsweredCount / ActiveItemCount` และเกณฑ์ "< 50%" ทั้งหมดมีความหมายก็ต่อเมื่อ `AnsweredCount`
> สามารถน้อยกว่า `ActiveItemCount` ได้จริง เมื่อการส่งบังคับ 100% เสมอ **`AnsweredCount ==
> ActiveItemCount` ทุกแถวโดยโครงสร้าง** — `AnswerCoverage` จะเท่ากับ `1` เสมอ และเกณฑ์
> `< CONFIDENCE_MIN_COVERAGE (0.50)` **ไม่มีทางเป็นจริงได้อีกต่อไปกับผลที่ผ่านการส่งสำเร็จแล้ว**
> กลไก shrinkage ทั้งข้อจึงไม่มีทาง trigger ได้จริงถ้าคงสัญญาณนำเข้าเดิมไว้ — เป็นฟีเจอร์ที่ "implement
> ได้" แต่ "ไม่มีวันทำงาน" ซึ่งแย่กว่าการไม่มีฟีเจอร์นี้เลย เพราะดูเหมือนออกแบบมาแล้วทั้งที่ตายจากพื้นฐาน
>
> **ทางเลือกที่พิจารณา** (ตามที่ `requirement.md` REQ-012 เปิดไว้ให้ `system-analyst` เลือก):
> (i) re-scope ตัวชี้วัด Confidence จากอัตราความครบ → สัญญาณอื่น (เช่น เวลาตอบต่อข้อ หรือความสม่ำเสมอ
> ของคำตอบ) แล้วคงกลไก shrinkage เดิมไว้ · (ii) ถามผู้ใช้ตรง ๆ ว่ายังต้องการฟีเจอร์นี้อยู่ไหม ·
> (iii) ถอดฟีเจอร์นี้ทิ้งทั้งข้อ (Later)
>
> **การตัดสินใจ (สิทธิ์ของ `system-analyst` ตาม OQ-F12/OQ-F13 sign-off — ไม่ใช่คำถามที่ต้องรอผู้ใช้
> อีกรอบ)**: เลือก **(i) re-scope เป็นความสอดคล้องข้ามรูปแบบคำตอบ (cross-format consistency)**
> ไม่ใช่เวลาตอบต่อข้อ เพราะ **(1)** ไม่ต้องเก็บข้อมูลใหม่ — `LikertLevel(r)` และ `RankLevel(r)` ต่อมิติ
> ถูกคำนวณอยู่แล้วที่ `## RIASEC Fit Rules` ข้อ 3.1-3.2 และ **OQ-F11 ข้อ (ค) ยืนยันแล้ว (2026-09-02)
> ว่าทุกมิติต้องมีคำถามครบทั้งสองรูปแบบ** จึงมีสัญญาณทั้งคู่ให้เทียบกันครบทุกมิติโดยไม่ต้องเพิ่มคอลัมน์
> เก็บเวลา/timestamp ต่อข้อซึ่งไม่มีอยู่ในสัญญาปัจจุบันเลย **(2)** เวลาตอบต่อข้อวัดพฤติกรรม "ตอบเร็วไป
> จนไม่ได้อ่าน" ได้จริง แต่ต้องเพิ่ม schema (per-item timestamp) และยังตีความยากกว่า (เด็กอ่านเร็ว
> ตามธรรมชาติกับเด็กตอบมั่วแยกไม่ออกจากตัวเลขเดียว) **(3)** ความไม่สอดคล้องระหว่าง Likert กับ
> ranking ในมิติเดียวกัน (เช่น ให้คะแนน Likert สูงว่า "ชอบงานศิลปะ" แต่จัดอันดับตัวเลือกศิลปะไว้
> ท้ายแถวในบล็อกเรียงลำดับ) เป็นสัญญาณของการตอบไม่ตั้งใจ/ไม่เข้าใจคำถามที่ตรงประเด็นกว่า และเป็น
> **เหตุผลเดียวกับที่ RISK-F18 เตือนไว้แล้ว** (สองรูปแบบวัดคนละแบบ ipsative vs normative) — ใช้ปัญหา
> เดิมที่มีอยู่แล้วในสัญญาให้เป็นประโยชน์แทนที่จะมองข้าม · **กลไก shrinkage เดิม (สูตร §7.5-7.6 ด้านล่าง)
> ยังคงอยู่ทุกประการ เปลี่ยนเฉพาะสัญญาณนำเข้าเท่านั้น** — เก็บคุณค่าของงานออกแบบเดิมไว้ให้มากที่สุด
>
> **สถานะหลัง re-scope**: กลไก + ค่าคงที่ `NEUTRAL_SCORE`/`CONF_F_MIN`/`CLARITY_F_MIN` ปิดแล้ว
> (engineering default เหมือนที่ OQ-F13 อนุญาตไว้เดิม) **แต่ threshold ของตัวชี้วัดใหม่
> (`CONSISTENCY_MIN`) เป็นค่าใหม่ที่ OQ-F13 เดิมไม่เคยครอบคลุม — เปิดเป็นคำถามใหม่ OQ-F16** เพราะ
> "50% ของความครบ" กับ "ระดับความสอดคล้องที่ถือว่าน่าเชื่อถือ" เป็นคนละปริมาณที่ผู้ใช้ไม่เคยเห็น/
> ยืนยันมาก่อน — **`system-analyst` เลือกไม่ปิดให้เองแบบเงียบ ๆ** ตามหลัก "อย่าเลื่อนเป็นข้อเท็จจริง
> โดยไม่ผ่านการยืนยัน" แม้จะมีสิทธิ์ engineering judgment อยู่ก็ตาม เพราะนี่คือเกณฑ์ตัดสิน ไม่ใช่
> พารามิเตอร์ปรับความแรงเหมือนอีกสามตัว **บล็อกเฉพาะ §7.6 (`"DisplayScore"` ของข้อ 7) จนกว่า OQ-F16
> จะปิด** (RISK-F19 ที่แก้ไขแล้ว) — ข้อ 6 (`ClarityIndex`) implement ได้เต็มแล้วเพราะ OQ-F12 ปิดครบ

**7.1 `"AnsweredCount"`/`"ActiveItemCount"` — คอลัมน์เดิมยังอยู่ แต่ไม่ใช่สัญญาณของ Confidence อีกต่อไป**

- **ยังบันทึกทั้งสองค่าลง `public."TCompassRiasecResult"` ตามเดิมทุกประการ** (นิยามไม่เปลี่ยน: จำนวน
  "ข้อที่เด็กเห็น" ทั้งหมด และจำนวนที่ตอบแล้ว ณ เวลาส่ง — 1 block เรียงลำดับที่ตอบครบ = 1 ข้อ เท่ากับ
  คำถาม Likert 1 ข้อ) — **ไม่ใช่ schema change ที่ต้องแก้** เพราะการตัดสินใจ "ต้องตอบครบ 100%" ทำให้
  `"AnsweredCount" == "ActiveItemCount"` เสมอโดยโครงสร้าง ค่าทั้งสองจึงกลายเป็น **diagnostic เท่านั้น**
  (ยืนยันว่าคลังคำถาม ณ เวลานั้นมีกี่ข้อ ไม่ใช่ตัววัดความมั่นใจอีกต่อไป)
- **`AnswerCoverage` (= AnsweredCount/ActiveItemCount) ไม่ใช่ input ของ Confidence อีกต่อไป** — สูตร
  ที่ใช้จริงอยู่ที่ข้อ 7.2 ด้านล่าง (`ConsistencyScore`) แทน · `backend-engineer` **ห้ามอ้าง
  `AnswerCoverage`/`CONFIDENCE_MIN_COVERAGE` ในโค้ดของชั้นแสดงผลอีก** — ชื่อทั้งสองถือเป็นเลิกใช้
  (deprecated) นับจากรอบนี้
- **ไม่ถอดคอลัมน์ทิ้งในรอบนี้** — เก็บไว้เพื่อการวินิจฉัย/ตรวจสอบย้อนหลัง (เช่น ยืนยันว่าคลังคำถาม
  ตอนนั้นมีกี่ข้อ) ไม่ใช่ schema churn ที่ไม่มีประโยชน์ · ถ้าอนาคตพบว่าไม่มีใครใช้จริง การถอดเป็นงาน
  แยกที่ต้องเปิดขึ้นเอง ไม่ใช่ผลพลอยได้ของรอบนี้ (`Later`)

**7.2 ตัวชี้วัดใหม่ — `ConsistencyScore` (ความสอดคล้องข้ามรูปแบบคำตอบรายมิติ)**

```
สำหรับมิติ r ที่มีค่าทั้ง LikertLevel(r) และ RankLevel(r) (นิยามที่ `## RIASEC Fit Rules` ข้อ 3.1-3.2):

  Disagreement(r) = | LikertLevel(r) − RankLevel(r) |          ∈ [0,4]   (ทั้งคู่อยู่ในสเกล [1,5])

R = จำนวนมิติ (จาก 6 มิติ RIASEC) ที่มีค่าครบทั้งสองรูปแบบ

ConsistencyScore = 1 − ( Σ_r Disagreement(r) / (4 × R) )        ∈ [0,1]     เมื่อ R > 0
                 = ไม่มีค่า (ประเมินไม่ได้)                                   เมื่อ R = 0
```

- **1 = ทุกมิติที่วัดได้ทั้งสองรูปแบบให้ค่าตรงกันสนิท · 0 = ขัดแย้งกันสูงสุดในทุกมิติ**
- **R ควรเท่ากับ 6 ในเนื้อหาที่ออกแบบถูกต้อง** เพราะ OQ-F11 ข้อ (ค) บังคับให้ทุกมิติมีคำถามครบทั้งสอง
  รูปแบบอยู่แล้ว (`## RIASEC Fit Rules` ข้อ 3.4/RISK-F18) — สูตรนี้ยังคงเขียนเผื่อ `R < 6` แบบตั้งรับ
  (เช่น เนื้อหาคลังคำถามมีช่องโหว่ชั่วคราว) **ห้ามนับมิติที่ขาดข้อมูลเป็น `Disagreement = 0`** (จะทำให้
  ดูสอดคล้องกว่าความเป็นจริง) — ตัดออกจากทั้งตัวตั้งและ `R` เหมือนกติกาการตัด `"ClusterCount"` ที่
  ข้อ 6.2
- **`R = 0`** (ไม่มีมิติใดเลยที่มีครบสองรูปแบบ — ความผิดปกติของคลังคำถาม ไม่ใช่พฤติกรรมของเด็ก) →
  **`ConfidenceFactor = 1` (ไม่ปรับ) และไม่แสดงข้อความเรื่องความมั่นใจ** ปฏิบัติเหมือนกรณี "ไม่มีผล
  RIASEC เลย" ที่ข้อ 7.3 — **ต้อง log เป็นปัญหาเนื้อหา** (คล้ายกติกา log ที่ `## RIASEC Fit Rules`
  ข้อ 3.2) ไม่ใช่ไปลงโทษเด็กด้วยคะแนนความมั่นใจต่ำเพราะเนื้อหาคลังคำถามไม่ครบ
- **คำนวณจาก `LikertLevel`/`RankLevel` ที่ตีความด้วยคลังคำถาม ณ เวลาส่งเสมอ** (หลักการเดียวกับ
  `## RIASEC Fit Rules` ข้อ 7 "ห้ามคำนวณผลเก่าใหม่เมื่อคลังคำถามเปลี่ยน") — **ต้องคำนวณและบันทึกค่า
  ที่ตอนส่งเท่านั้น ห้ามคำนวณย้อนหลัง** เหตุผลเดียวกับที่ข้อ 7.1 เคยบันทึก `AnsweredCount`/
  `ActiveItemCount` ไว้ ณ เวลาส่ง → เพิ่มคอลัมน์ใหม่ `public."TCompassRiasecResult"."ConsistencyScore"`
  (numeric, nullable — `NULL` เมื่อ `R = 0`) ดู `## Data Model` **(schema change ใหม่ของรอบนี้ —
  additive, ไม่มีตารางใดถูกสร้างจริงตาม `status.md` จึงไม่มี migration/backfill)**

**7.3 เกณฑ์ "ยังไม่มั่นใจ" — ปิดแล้ว 2026-09-15 (OQ-F16)**

```
ConsistencyScore < CONSISTENCY_MIN  →  ผลรอบนั้นเป็น "ยังไม่มั่นใจ" (low confidence)

  CONSISTENCY_MIN = 0.60 (ค่าเริ่มต้นทางวิศวกรรม / Engineering Default ที่ผู้ใช้มอบสิทธิ์ 2026-09-15, ปิด OQ-F16)
```

- **`CONSISTENCY_MIN = 0.60`** — ปิดแล้ว (OQ-F16, 2026-09-15) เป็นค่าเริ่มต้นทางวิศวกรรม (Engineering Default):
  ระดับ Disagreement เฉลี่ยข้ามมิติที่เกิน 1.6 แต้มบนสเกล 1-5 (เทียบเท่าความสอดคล้องต่ำกว่า 60%) จะถือว่าเป็นผลที่ "ยังไม่มั่นใจ" และเข้าสู่กลไก shrinkage ดึงเข้าสู่ `NEUTRAL_SCORE`
  (บันทึกเป็นสมมติฐานทางวิศวกรรมใน `requirement.md` `## References` ปลดบล็อกการคำนวณ `"DisplayScore"`)
- **รอบที่ไม่มีผล RIASEC เลย** (`"RiasecResultID" IS NULL`, `"ScoreBasis" = 'academic_only'`) หรือ
  **`R = 0`** (ข้อ 7.2) → **ไม่ประเมิน confidence** (ไม่ใช่ "ไม่มั่นใจ") — กรณีแรกมีข้อความของตัวเอง
  อยู่แล้วตามข้อ 3 (ชวนทำ RIASEC) กรณีหลัง log เป็นปัญหาเนื้อหาตามข้อ 7.2
- **`ConsistencyScore` ไม่เก็บซ้ำในตารางหัวรอบ** — สืบจาก `"RiasecResultID"` → คอลัมน์ใหม่ของข้อ 7.2
  ได้เสมอ (หลักการเดียวกับข้อ 6.2 ที่ไม่เก็บสถิติซ้ำ)

**7.4 กลไก shrinkage — สูตรเดิมคงไว้ · ค่าคงที่ปิดแล้ว (OQ-F13, 2026-09-02) และ threshold ปิดแล้ว (OQ-F16, 2026-09-15)**

```
ConfidenceFactor = 1                                                    เมื่อ ConsistencyScore ≥ CONSISTENCY_MIN (0.60)
                 = CONF_F_MIN + (1 − CONF_F_MIN) × (ConsistencyScore / CONSISTENCY_MIN)
                                                                        เมื่อ ConsistencyScore <  CONSISTENCY_MIN (0.60)
                 = 1                                                    เมื่อประเมิน confidence ไม่ได้ (ข้อ 7.3)
```

- **`CONF_F_MIN = 0.5`** — ปิดแล้ว (OQ-F13) เป็น engineering default: ความแรงสูงสุดของการดึงเข้า
  ค่ากลางเมื่อ `ConsistencyScore = 0` (ขัดแย้งสูงสุด) คือดึงครึ่งทางไปหา `NEUTRAL_SCORE` ไม่ใช่ดึง
  เต็มที่ (ซึ่งจะลบข้อมูลดิบทั้งหมดทิ้ง) — ค่าปานกลางโดยเจตนา ไม่มีแหล่งอ้างอิงภายนอกรองรับ · บังคับ
  `0 < CONF_F_MIN < 1` เหมือนเดิม
- **โค้งนี้ยังต่อเนื่องที่เกณฑ์ `CONSISTENCY_MIN` โดยเจตนา** (`ConsistencyScore = CONSISTENCY_MIN` →
  `ConfidenceFactor = 1`) — เหตุผลเดิมยังใช้ได้ (กันตัวเลขกระโดดที่อธิบายให้เด็กฟังไม่ได้)
- **ทางเลือกที่ตัดทิ้งโดยเจตนา**: แสดงคะแนนดิบพร้อมป้ายเตือนอย่างเดียว — `requirement.md` REQ-012
  ปฏิเสธไว้ตรง ๆ (*"ไม่ใช่แค่แสดงพร้อมป้ายเตือนเฉย ๆ"*) **ห้ามเสนอกลับ** (ข้อนี้ไม่เปลี่ยนแม้สัญญาณ
  นำเข้าจะเปลี่ยน)

**7.5 การประกอบกับข้อ 6 — สูตรเดียว ตัวคูณอิสระสองตัว ที่ชั้นแสดงผลเท่านั้น (โครงสร้างเดิม ไม่เปลี่ยน)**

```
DisplayScore(c) = NEUTRAL_SCORE
                + (CombinedScore(c) − NEUTRAL_SCORE) × ClarityFactor × ConfidenceFactor

  ClarityFactor    = 1                                                   เมื่อ ClarityIndex IS NULL (ข้อ 6.4)
                   = CLARITY_F_MIN + (1 − CLARITY_F_MIN) × ClarityIndex / 100   มิฉะนั้น
  ConfidenceFactor = ตามข้อ 7.4
```

- **ลำดับการประกอบไม่กำกวมเพราะไม่มีลำดับ**: ทั้งสองเป็น**ตัวคูณอิสระบนค่าดิบตัวเดียวกัน** คูณกัน
  (การคูณสลับที่ได้) · **ห้าม implement เป็นสองขั้นที่ขั้นหลังกินผลของขั้นแรก** — การย่อค่าที่ถูกย่อมาแล้ว
  จะทำให้เด็กที่ทั้งไม่ชัดและไม่สอดคล้องโดนหักซ้ำแบบทบต้นโดยไม่มีใครตั้งใจ
- **`NEUTRAL_SCORE = 50`** — ปิดแล้ว (OQ-F13) เป็น engineering default: จุดกึ่งกลางของสเกล
  `CombinedScore`/`DisplayScore` ([0,100]) เป็นตัวเลือกที่อธิบายง่ายที่สุด ("ไม่เอนไปทางชอบหรือไม่ชอบ")
  และไม่ต้องอิงข้อมูลอื่นเพิ่ม · บังคับ `0 ≤ NEUTRAL_SCORE ≤ 100` · เป็น **ค่ากลางร่วมของทั้งสองกลไก**
  โดยเจตนา (ข้อ 6 และข้อ 7 ดึงเข้าหาจุดเดียวกัน)
- **ดึงเข้าหา `NEUTRAL_SCORE` ไม่ใช่เข้าหา `"MeanOwn"`** — จุดนี้คือหัวใจของกติกาข้อ 6.1: ถ้าดึงเข้าหา
  ค่าเฉลี่ยของตัวเด็กเอง เด็ก Y (โปรไฟล์แบน ค่าเฉลี่ยของตัวเอง ≈ 70) จะยังเห็น "70" เท่าเดิม
  ซึ่งเป็นสิ่งที่ผู้ใช้ห้ามไว้ตรง ๆ · `"MeanOwn"` ใช้เป็น**ค่าวินิจฉัยและอาจใช้ประกอบการอธิบายผล**
  ไม่ใช่จุดยึดของการปรับ
- **`CLARITY_F_MIN = 0.5`** — ปิดแล้ว (OQ-F13) เป็น engineering default สอดคล้อง/เท่ากับ `CONF_F_MIN`
  โดยเจตนา (ทั้งสองกลไกดึงเข้าหาจุดเดียวกันด้วยความแรงสูงสุดเท่ากันเมื่อยังไม่มีเหตุผลให้ต่างกัน)
- **คุณสมบัติที่ต้องคงไว้เสมอ** (`qa-engineer` ตรวจได้ตรง ๆ): (1) ตัวคูณทั้งสอง ∈ (0,1] และ**เท่ากันทุก
  คลัสเตอร์ภายในรอบเดียวกัน** → เป็นการแปลงเชิงเส้นเพิ่มทางเดียว **ลำดับ top-3 ไม่เปลี่ยน** (ข้อ 6.7)
  (2) `CombinedScore ∈ [0,100]` + `NEUTRAL_SCORE ∈ [0,100]` → `DisplayScore ∈ [0,100]` เสมอ **ไม่ต้อง
  clamp เพิ่ม** (3) ค่าดิบทั้งสามชั้น (`"AcademicFit"`, `"InterestFit"`, `"CombinedScore"`)
  **ไม่ถูกแตะ** (4) `"CombinedScore" IS NULL` → `"DisplayScore" IS NULL` (ไม่มีอะไรให้ปรับ)
- **ปัดเศษเมื่อแสดงเท่านั้น** — เก็บทศนิยมในคอลัมน์ (แนวเดียวกับ `## RIASEC Fit Rules` ข้อ 3.4)
- **ต้องอธิบายให้เห็น** เช่นเดียวกับข้อ 6.6: เมื่อ `ConfidenceFactor < 1` ต้องบอกเด็กว่าผลนี้คำนวณจาก
  คำตอบที่ **ไม่สอดคล้องกันระหว่างสองรูปแบบคำถาม** (ไม่ใช่ "ตอบไม่ครบ" อีกต่อไป — ถ้อยคำต้องแก้ตาม
  สัญญาณใหม่) และชวนให้ทบทวนคำตอบ — **ห้ามย่อเงียบ ๆ** · ถ้อยคำสุดท้ายเป็นของ `uxui-designer`
  ตามวินัยเดียวกับ WORD-F01/ข้อ 6.6

**7.6 สิ่งที่ implement ได้แล้ววันนี้ (ปลดบล็อกสมบูรณ์ 2026-09-15)**

| ส่วน | สถานะ |
|---|---|
| DDL ทั้งหมดของข้อ 6-7 (`public."TCompassStudentClusterRun"` + `"AnsweredCount"`/`"ActiveItemCount"`/`"ConsistencyScore"`/`"DisplayScore"`) | ✅ implement ได้ทันที — ไม่มีค่าคงที่เปิดค้าง |
| การนับ/บันทึก `"ClusterCount"`, `"MeanOwn"`, `"SdOwn"`, `"GapTop"`, `"ExcludedSubjects"`, `"AnsweredCount"`, `"ActiveItemCount"`, `"ConsistencyScore"` | ✅ implement ได้ทันที — เป็นสถิติดิบ ไม่มีค่าคงที่ที่ยังเปิดค้าง |
| `"ClarityIndex"`, `"ClarityBand"` (ข้อ 6) | ✅ **implement ได้ทันที — OQ-F12 ปิดครบแล้ว** |
| `"DisplayScore"` + ชั้นแสดงผลของข้อ 6.6/7.5 | ✅ **implement ได้ทันที — ปิด OQ-F16 แล้ว (`CONSISTENCY_MIN = 0.60`)** |

Contract:ClusterDeterminationRules.v1
DEC-022

Evidence EVD-013: claim=DES-022 | state=confirmed | path=ClassOnlineWeb/Helper/CompassClusterService.cs | symbol=DetermineAsync | line=104 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=43fd40e54fd80003a1045bc4f72fa8103984105e55a425b454830ea5cfb36bcf
Evidence EVD-014: claim=Contract:ClusterDeterminationRules.v1 | state=confirmed | path=ClassOnlineWeb/Helper/CompassClusterService.cs | symbol=DetermineAsync | line=213 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=43fd40e54fd80003a1045bc4f72fa8103984105e55a425b454830ea5cfb36bcf
Evidence EVD-015: claim=DEC-022 | state=confirmed | path=ClassOnlineWeb/Helper/CompassClusterService.cs | symbol=DetermineAsync | line=252 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=43fd40e54fd80003a1045bc4f72fa8103984105e55a425b454830ea5cfb36bcf
Evidence EVD-035: claim=DES-022 | state=unresolved | path=ClassOnlineWeb/Helper/CompassClusterService.cs | symbol=TryGetCreditPercentile | line=340 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=1263adc89bb998a6f997f014fcc512ec9a4ff62400a49d5c0eb3d49a4bb6556c
Evidence EVD-036: claim=Contract:ClusterDeterminationRules.v1 | state=unresolved | path=ClassOnlineWeb/Helper/CompassClusterService.cs | symbol=DetermineAsync | line=115 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=1263adc89bb998a6f997f014fcc512ec9a4ff62400a49d5c0eb3d49a4bb6556c
Evidence EVD-037: claim=DEC-022 | state=unresolved | path=ClassOnlineWeb/Helper/CompassClusterService.cs | symbol=DetermineAsync | line=132 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=1263adc89bb998a6f997f014fcc512ec9a4ff62400a49d5c0eb3d49a4bb6556c

Compatibility: additive-internal
Data/schema: additive
Migration/backfill: none
Security: none
Fallback: "StddevScore" = NULL หรือ 0 → ตัดกลุ่มสาระนั้นออกจากตัวตั้งและตัวหารของ AcademicFit ทั้ง 11 cluster พร้อมกัน · ถูกตัดหมด → AcademicFit เป็น NULL ใช้ InterestFit อย่างเดียว · ทั้งคู่ NULL → แสดงข้อความ "ยังประเมินไม่ได้" — ห้าม error ห้ามคืน 0% ห้ามแสดงอันดับปลอม
Material ambiguity: none

---

## DES-023 — Admin & Review Rules

**สัญญาของ REQ-003 + REQ-004 — ทั้งหมดอยู่ใน Curriculum Service**

### 1. สถานะและการเปลี่ยนสถานะของ `public."TCompassProgram"`

```
(ไม่มี) ──► pending_review ──► approved ──► retired
                  ▲                │
                  └────────────────┘   (เฉพาะกรณีคนสั่งถอนการอนุมัติเอง)
```

- **สาขาที่ไม่ใช่ `approved` เด็กไม่เห็นเลย** ไม่ใช่เห็นแบบเทา ไม่ใช่เห็นพร้อมป้าย (REQ-004)
- `retired` = เลิกใช้ แต่เก็บประวัติ · เด็กไม่เห็น
- การนำเอกสารใหม่เข้ามาแทน **ไม่** เปลี่ยนสถานะของสาขาที่ approved อยู่ — ดู `## Import Rules` ข้อ 9

### 2. เงื่อนไขก่อนกดอนุมัติได้ — service ต้องปฏิเสธถ้าข้อใดข้อหนึ่งไม่ผ่าน

**แก้ไข 2026-08-31 (REQ-011/012/014)** — ข้อ 4 และ 6 เปลี่ยนหน่วยจาก 8-path/8-trait เป็น
11-cluster/6-RIASEC ตามลำดับ:

1. มีแถวใน `public."TCompassProgramSubjectWeight"` **อย่างน้อย 1 แถว**
2. ทุกแถว `subject` เป็น **1 ใน 8 ชื่อ canonical** เป๊ะ ๆ
3. ทุกแถว `weight` ∈ {1, 2, 3}
4. มีแถวใน `public."TCompassProgramCluster"` **อย่างน้อย 1 แถว** และทุก `"ClusterID"` ต้อง resolve เป็น
   1 ใน 11 แถวของ `public."TCompassInterestCluster"` ได้ (**v9** — เดิมเช็คที่ `cluster_code`;
   FK บังคับให้แล้ว แต่ยังต้องเช็คจำนวนแถว) (**แทนที่ `compass_program_path` เดิม**)
5. `behavior_profile` ไม่ว่าง
6. มีแถวใน `public."TCompassProgramRiasecProfile"` **อย่างน้อย 3 แถว** และทุกแถว `desired_level` ∈ 1..5
   (**แทนที่ `compass_program_behavior_trait` เดิม — เพดาน 3 เดิมยังใช้ได้เพราะมี 6 มิติทั้งหมด
   3 จาก 6 ยังเป็นเงื่อนไขที่สมเหตุสมผล**)

**ทำไมต้อง ≥ 3 มิติ**: สูตร % เชิง RIASEC หารด้วยจำนวนมิติที่ทับกัน ถ้าสาขามีมิติเดียวแล้วเด็ก
บังเอิญไม่มีมิตินั้น จะได้ `n = 0` ทุกครั้ง · **ตัวเลข 3 เป็นค่าที่เอกสารนี้กำหนด (สืบทอดจากรอบที่ 1)**

### 3. การแก้ผลของ AI (REQ-003 + REQ-004)

- คนตรวจแก้ได้ทุกอย่าง: กลุ่มสาระ · น้ำหนัก · cluster · กลุ่มคณะเดิม (`public."TCompassProgram"."FacultyGroupID"`
  — **v9: หน้าจอให้เลือกจากรายชื่อ 26 กลุ่มโดยแสดง `"FacultyGroupCode"`/`"LegacyNameTh"` แล้วบันทึกเป็น Id
  ห้ามให้คนพิมพ์เลข Id เอง**) ·
  ข้อความบรรยาย · ระดับมิติ RIASEC
- แถวที่คนเพิ่ม/แก้เอง ต้องตั้ง **`is_manual = true`**
- **แถว `is_manual = true` ห้ามถูกเขียนทับโดยการ import รอบถัดไป** เว้นแต่คนตรวจสั่งเองในรอบ
  `'replace'` — ไม่งั้นงานที่คนแก้ไว้จะหายเงียบ ๆ ทุกครั้งที่มีเอกสารใหม่เข้ามา
- `analysis_status = 'manual'` เมื่อข้อมูลชุดปัจจุบันมาจากคนล้วน ๆ (AI ล้มเหลวหรือไม่ได้เรียก)

### 4. ตัวตนและการบันทึกว่าใครทำอะไร

- ทุก action ยึด **ตัวตนจากระบบ Staff/Admin Login ภายในของ SchoolBright** (D9 · ✅ ปิด **OQ-F08** 2026-09-15: ใช้กลไก Session/Auth เดิมของ SchoolBright ไม่ต้องสร้าง SSO provider ใหม่) · **ห้ามรับ user id จาก client**
- `imported_by` · `reviewed_by` · `resolved_by` · `public."TCompassQuest".created_by` เก็บ subject / Admin UserID จาก auth session ของระบบ SchoolBright เดิม · **แถวที่ `status = 'approved'` ต้องมี `reviewed_by` และ `reviewed_at` เสมอ ห้ามเป็น NULL**
- **รอบนี้ยังไม่มีการแยกบทบาท "ผู้นำเข้า" กับ "ผู้อนุมัติ"** — ใครล็อกอินได้ก็ทั้งนำเข้าและอนุมัติได้
  ซึ่งแปลว่า **ไม่มีการตรวจสอบสองชั้น** → บันทึกไว้เป็น **RISK-F13** เจตนาให้เห็น ไม่ใช่ตกหล่น

### 5. คิวงาน

หน้าจอหลักคือคิว `public."TCompassProgramIntake"` ที่ `resolution = 'pending'` เรียงตาม `created_at`
พร้อมกรองตามมหาวิทยาลัย (**v9**: กรองด้วย `"UniversityID"` ที่ join มาจาก `public."TCompassProgramSource"`
— หน้าจอยังแสดง/รับค่าเป็น `"UniversityCode"` เช่น `'KMUTT'` เหมือนเดิม) · และคิว
`public."TCompassProgram"` ที่ `status = 'pending_review'`

### 6. Curriculum Service ห้ามแตะข้อมูลนักเรียน

ย้ำจาก `## Database Ownership Boundary` ข้อ 2 — **ไม่มี endpoint ใดใน Curriculum Service
ที่คืนข้อมูลนักเรียน เพราะมันไม่มีสิทธิ์อ่านตั้งแต่ระดับ DB grant**

Contract:AdminReviewRules.v1
DEC-023

Evidence EVD-016: claim=DES-023 | state=unresolved | path=ClassOnlineWeb/Helper/CompassRiasecService.cs | symbol=SuggestQuestsAsync | line=560 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6ad6ff98f15e5d7bdbb17580400661bd26eda9f46d243c6284aa33e4af51e909
Evidence EVD-017: claim=Contract:AdminReviewRules.v1 | state=unresolved | path=ClassOnlineWeb/Controllers/Api/CompassRiasecController.cs | symbol=CompassRiasecController | line=27 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=f444567a3c9b37dcec3d92c2479ec3dd8afeff439969aebda73b6e94e468faaf
Evidence EVD-018: claim=DEC-023 | state=confirmed | path=ClassOnlineWeb/Helper/CompassRiasecService.cs | symbol=ComputeAlternativesAsync | line=479 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6ad6ff98f15e5d7bdbb17580400661bd26eda9f46d243c6284aa33e4af51e909

Compatibility: additive-external
Data/schema: additive
Migration/backfill: none
Security: sensitive
Fallback: เงื่อนไขก่อนอนุมัติข้อใดไม่ผ่าน → service ปฏิเสธการอนุมัติพร้อมระบุข้อที่ล้ม · สาขา status ≠ 'approved' ต้องถูก filter ออกจากผลของเด็กเด็ดขาด · คิวตรวจ = intake resolution = 'pending' เรียงตาม created_at
Material ambiguity: none

---

## Modules

### Module E: Shared Score Access
**ครอบคลุม**: ส่วนหนึ่งของ DES-005 · อยู่ใน **`ClassOnlineWeb`**
**เนื้องาน**: ย้าย `GetSubjectAveragesAsync` จาก `private` บน `CompassApiController` ขึ้นเป็น
`public static` บน `CompassScoreService` แล้วให้ caller เดิมเรียกตัวใหม่
**ตาราง/โมเดลที่แตะ**: ไม่มี — ไม่มี schema change
**Dependency**: ไม่มี **เริ่มได้ทันที · ต้องเสร็จก่อน Module H**
**สัญญาที่ต้องอ่าน**: `## Program Matching Rules` ข้อ 1
**ไม่ใช่ sensitive** — เป็นการย้ายเมธอดล้วน ไม่แตะสิทธิ์ ไม่รับ input ภายนอก
**ข้อควรระวัง**: `sb-compass` กำลัง implement อยู่และแตะไฟล์เดียวกัน → ต้องประสานลำดับกับ
`sb-compass` Phase 1 (DEP-F05)

### Module F: Curriculum Import Service (REQ-001, REQ-002, REQ-004) 🔒
**ครอบคลุม**: DES-001, DES-002, DES-004 · อยู่ใน **Curriculum Service (Python/FastAPI) — ของใหม่ทั้งหมด**
**เนื้องาน**: ตั้งโปรเจกต์ · migration ของตารางกลุ่มคลังหลักสูตร · รับอัปโหลด PDF · เก็บไฟล์ต้นฉบับ ·
markitdown · เรียก `glm-5.2` · validate · เขียน `public."TCompassProgramIntake"`
**ตาราง/โมเดลที่แตะ**: `public."TCompassUniversity"`, `public."TCompassInterestCluster"` (seed 11), `public."TCompassFacultyGroup"`
(seed 26), `public."TCompassClusterFacultyGroup"` (seed mapping), `public."TCompassRiasecDimension"` (seed 6),
`public."TCompassProgramSource"`, `public."TCompassProgramIntake"`
**Dependency**: 🔴 **คีย์ `glm-5.2` (RISK-F01)** · PRE-F01..F04 · **ไม่ติด `sb-compass` OQ-15**
**สัญญาที่ต้องอ่าน**: `## Import Rules`, `## Database Ownership Boundary`

**Sensitive concern: untrusted file input · การเรียกบริการภายนอก · API key · เอกสารของบุคคลที่สาม**

**Security Considerations**:
ขอบเขตความไว้วางใจคือ **ไฟล์ PDF ที่อัปโหลดเข้ามาเป็นข้อมูลที่เชื่อไม่ได้** แม้จะมาจากทีมงานภายใน —
PDF เป็น format ที่ฝัง JavaScript, external reference และ payload ที่ทำให้ parser พังได้ · failure
mode: (1) **parser ถูกโจมตี** — markitdown/ตัว PDF parser ประมวลผลไฟล์ที่จงใจทำให้พัง อาจ hang,
กิน memory จนล่ม, หรือแย่กว่านั้นคือ SSRF ผ่าน external reference ในไฟล์ → ต้องจำกัดขนาดไฟล์,
ตั้ง timeout, ตรวจ MIME/magic bytes ฝั่งเซิร์ฟเวอร์ (ไม่ใช่เชื่อนามสกุลไฟล์), และรันการแปลงใน
sandbox/process แยกที่ไม่มี network ออกนอก (2) **ไฟล์ต้นฉบับถูกเสิร์ฟกลับด้วย content-type ที่เดาเอง**
→ ต้องบังคับ `application/pdf` + `Content-Disposition: attachment` และห้ามให้ path ที่เก็บไฟล์
รันสคริปต์ได้ (3) **API key ของ `glm-5.2` รั่ว** → ~~ต้องอยู่ใน secret store ของ service **ห้าม
hardcode ห้ามใส่ `prod.config`**~~ *(v13 2026-09-16 — ผู้ใช้ตัดสินรวม config ที่เดียว = prod.config
และรับความเสี่ยง plaintext ไว้เอง — USER RISK ACCEPTANCE ดู RISK-F05)* แหล่งค่าเดียว =
`prod.config` คีย์ `ApiKey` → **v14 (2026-09-16): service แยกพาร์ส XML ของ `prod.config` เองโดยตรง
ไม่มีขั้น env-injection** (PRE-F01) · **พื้นผิวเข้าถึงไฟล์ที่รับไว้โดยเจตนา (accepted file-access
surface — ให้ `security` เห็นชัดใน audit ถัดไป)**: process Python ต้องอ่านไฟล์ .NET config ได้จากที่
deploy — ผู้ใช้ตัดสินรับข้อจำกัด operation นี้เอง (ถ้า deploy นอกเครื่อง `CURRICULUM_PROD_CONFIG_PATH`
ต้องชี้สำเนาไฟล์ที่ sync — RISK-F25) · **กติกาที่ยังอยู่ครบ**: ห้าม hardcode ในซอร์สทุกไฟล์ ·
secret ไม่ถูก log เด็ดขาด · `ClassOnlineWeb` ยังไม่มีโค้ดเรียก AI เด็ดขาด · `/readyz` รายงานแค่
"มี/ไม่มีค่า" ห้ามรายงานค่า
(4) **prompt injection จากเนื้อหาในเอกสาร** — เอกสารเป็นข้อความที่ควบคุมไม่ได้ ผลลัพธ์ของ AI จึงถือ
เป็นข้อมูลที่เชื่อไม่ได้เสมอ ต้องผ่าน validate ทุกฟิลด์ตาม `## Import Rules` ข้อ 5 **และผ่านคนอนุมัติ
เสมอ** — ซึ่ง REQ-003 บังคับไว้อยู่แล้วและเป็นการป้องกันชั้นสุดท้ายที่แท้จริงของข้อนี้
(5) **เอกสารเป็นของบุคคลที่สาม** — ส่งออกไปยังผู้ให้บริการภายนอกโดยยังไม่ได้ตรวจเงื่อนไขการใช้ → OQ-F02

### Module G: Review & Approval Console (REQ-003, REQ-004) 🔒
**ครอบคลุม**: DES-003, DES-004 · อยู่ใน **Curriculum Service**
**เนื้องาน**: SSO login · คิวตรวจ · หน้าจอแก้กลุ่มสาระ/น้ำหนัก/cluster/กลุ่มคณะเดิม/โปรไฟล์ RIASEC/
ข้อความบรรยาย · การตัดสิน `resolution` · การกดอนุมัติพร้อมเงื่อนไข 6 ข้อ
**ตาราง/โมเดลที่แตะ**: `public."TCompassProgram"`, `public."TCompassProgramSubjectWeight"`, `public."TCompassProgramCluster"`,
`public."TCompassProgramRiasecProfile"`, `public."TCompassProgramIntake"`
**Dependency**: รอ Module F · รอ SSO (OQ-F08) · **ไม่ติด `sb-compass` OQ-15**
**สัญญาที่ต้องอ่าน**: `## Admin & Review Rules`, `## Import Rules` ข้อ 8-10

**Sensitive concern: authorization — คนที่ล็อกอินเข้ามาได้คือคนที่ตัดสินว่าเด็กทั้งเครือข่ายจะเห็นอะไร**

**Security Considerations**:
ขอบเขตความไว้วางใจคือ **ทุกอย่างที่มาจาก HTTP request รวมถึงตัวตนผู้ใช้** — ต้องมาจาก session
ที่ SSO ออกให้เท่านั้น **ห้ามรับ user id / role จาก request body หรือ header ที่ client ตั้งเองได้** ·
สิ่งที่ปกป้องไม่ใช่ข้อมูลส่วนบุคคล (service นี้ไม่มีข้อมูลนักเรียนเลย) แต่คือ **ความถูกต้องของคำแนะนำ
เรื่องอนาคตที่เด็กทั้งเครือข่ายจะได้รับ** · failure mode: (1) **คนนอกกดอนุมัติได้** → ข้อมูลที่ AI
อ่านผิดถึงเด็กโดยไม่มีใครตรวจ ซึ่งเป็นความเสียหายที่ REQ-003 มีไว้กันโดยตรง และ **ตามแก้ทีหลังไม่ได้**
เพราะเด็กตัดสินใจเรื่องอนาคตไปแล้ว (2) **IDOR ที่ระดับ `program_id`** — ต้องตรวจสิทธิ์ทุก endpoint
ไม่ใช่แค่หน้า list (3) **ไม่มีการแยกผู้นำเข้ากับผู้อนุมัติ** (RISK-F13) → บันทึกทุกการกระทำลง
`reviewed_by`/`resolved_by` เป็นอย่างน้อย เพื่อให้ย้อนกลับไปหาได้ว่าใครอนุมัติอะไร
**การป้องกันที่กำหนดไว้**: SSO เท่านั้น · fail-closed เมื่อตรวจสิทธิ์ไม่ได้ · เงื่อนไขก่อนอนุมัติ 6 ข้อ
ต้องตรวจฝั่งเซิร์ฟเวอร์ **ไม่ใช่แค่ disable ปุ่มในหน้าจอ**

### Module I-a: RIASEC Content Authoring (REQ-007, REQ-008 ฝั่งคลังข้อมูล)
**ครอบคลุม**: ส่วนหนึ่งของ DES-012, DES-008 · อยู่ใน **Curriculum Service**
**เนื้องาน**: หน้าจอจัดการชุดคำถาม RIASEC (ชุดกลางชุดเดียว) และคลัง quest ระดับมิติ ~8-24 ชิ้น
**ตาราง/โมเดลที่แตะ**: `public."TCompassRiasecQuestion"`, `public."TCompassQuest"`
**Dependency**: รอ Module G (ใช้ SSO + โครงหน้าจอเดียวกัน) · **รอ `uxui-designer` ตรวจ UI mockup ก่อน
seed เนื้อหาคำถามจริง** (ดู `## RIASEC Fit Rules` ข้อ 0)
**สัญญาที่ต้องอ่าน**: `## RIASEC Fit Rules` ข้อ 0, 1, 9 · `## Admin & Review Rules`
**ไม่ใช่ sensitive ในตัวเอง** — แต่อยู่หลัง SSO เดียวกับ Module G

### Module H: Program Matching & Top-10 (REQ-005, REQ-006, REQ-011) 🔒
**ครอบคลุม**: DES-005, DES-006 · อยู่ใน **`ClassOnlineWeb`**
**เนื้องาน**: endpoint ใหม่ที่อ่านคะแนนเด็กจาก Module E → กรองด้วยผลจัดอันดับ cluster จาก
**Module K** → อ่านสาขา `approved` จากตารางคลัง → คำนวณ % → คืน 10 อันดับ + คำแนะนำ · พร้อมหน้าจอ
**ตาราง/โมเดลที่แตะ**: อ่านอย่างเดียว — `public."TCompassProgram"`, `public."TCompassProgramSubjectWeight"`,
`public."TCompassProgramCluster"`, `public."TCompassUniversity"`
**Dependency**: **ต้องรอ Module E** · **ต้องรอ Module K** (คนละ dependency กันแล้วจาก 8-path
ของรอบที่ 1 ที่ผูกกับ `CompassPathCatalog` โดยตรง — ตอนนี้ต้องรอผลคำนวณ cluster จริง) · ต้องมีข้อมูล
`approved` จาก Module G จึงจะทดสอบได้จริง · 🔴 การกั้นสิทธิ์รอ Module J
**สัญญาที่ต้องอ่าน**: `## Program Matching Rules`, `## Database Ownership Boundary`

**Sensitive concern: personal data + premium gating**

**Security Considerations**:
ข้อมูลที่ปกป้องคือ **ผลวิเคราะห์เส้นทางอนาคตรายบุคคลของผู้เยาว์** ซึ่งอ่อนไหวกว่าคะแนนดิบ เพราะมัน
คือข้อสรุปเกี่ยวกับตัวเด็ก · ขอบเขตความไว้วางใจ: **`SID` จาก request body เชื่อไม่ได้** ต้องใช้
`UserData.UserID` เสมอ (กติกาเดียวกับ `sb-compass REQ-015` ที่ห้ามผ่อน) · failure mode:
(1) **IDOR** — ถ้าอ่าน `SID` จาก client เด็กแก้เลขแล้วดูผลของคนอื่นได้ทันที (2) **ข้อมูลรั่วผ่าน
payload ที่ประกอบก่อนตรวจสิทธิ์** — ต้องตรวจสิทธิ์ **ก่อน** ประกอบ response ไม่ใช่ประกอบแล้วค่อยกรอง
(3) **สาขาที่ยังไม่อนุมัติหลุดออกไป** — query ต้องมี `status = 'approved'` เป็นเงื่อนไขบังคับทุกครั้ง
ไม่ใช่กรองทีหลังในโค้ด
**การป้องกันที่กำหนดไว้**: raw SQL ต้องใช้ `NpgsqlParameter` เท่านั้น **ห้ามต่อ string** ·
ตารางคลังหลักสูตรเปิดให้ `ClassOnlineWeb` แบบ **read-only ที่ระดับ DB grant**

### Module K: Cluster Determination — T-Score + RIASEC (REQ-011, REQ-013) 🔒
**ครอบคลุม**: DES-011, DES-013, DES-015 (เฉพาะส่วนที่กระทบ flow การจับคู่) · อยู่ใน **`ClassOnlineWeb`**
**เนื้องาน**: คำนวณ T-Score ต่อกลุ่มสาระ (REQ-013) · คำนวณ `AcademicFit`/`InterestFit`/
`CombinedScore` ต่อ cluster (REQ-011) ตาม `## Cluster Determination Rules` · เขียน
`public."TCompassStudentClusterScore"`
**ตาราง/โมเดลที่แตะ**: อ่าน `public."TCompassLevelSubjectStat"` (ของ `sb-compass`, read-only) ·
`public."TCompassClusterSubjectWeight"`, `public."TCompassClusterRiasecWeight"`, `public."TCompassInterestCluster"` ·
**เขียน** `public."TCompassStudentClusterScore"`
**Dependency**: ✅ **OQ-F03/OQ-F06/OQ-F07 ปิดหมดแล้ว (2026-08-31) — สูตรและตารางน้ำหนัก confirmed**
· ✅ **กติกา fallback เมื่อ `"StddevScore"` เป็น `NULL`/`0` ปิดแล้วเช่นกัน** (`## Cluster Determination
Rules` ข้อ 2) → **เขียนโค้ดได้แล้ว ไม่ต้องรอ `sb-compass OQ-18`** · 🔴 **แต่รันจริงไม่ได้จนกว่า
DEP-F09 จะเสร็จ** (ตาราง `public."TCompassLevelSubjectStat"` พร้อมคอลัมน์ `"StddevScore"` ต้องมีอยู่จริง
ในฐานข้อมูล — ออกแบบครบแล้ว รอ implement ฝั่ง `sb-compass` Module C · **ไม่ต้อง migration** ตาม
`sb-compass/design.md` v8) · ต้องรอ Module E (ใช้คะแนนกลุ่มสาระเดียวกัน) · **Module H รอ Module K**
ไม่ใช่กลับกัน · 🔴 **v11 (2026-09-16) — เงื่อนไข "รันจริง" เป็น 4 ชิ้น (ISS-F03) · คำถามปิดหมดแล้ว
เหลือ implement**: (1) DEP-F09/PRE-F09 (`"StddevScore"`) (2) **`## DES-022` ข้อ 1a** — คอลัมน์
`"CreditMean"/"CreditSd"/"CompositeMean"/"CompositeSd"` (✅ OQ-F19 ปิด — ผู้ใช้เลือกทางเลือก A ·
เหลือรอบ amend + implement ฝั่ง `sb-compass`) (3) **seed น้ำหนัก §4a** — ค่ายืนยันแล้ว (✅ OQ-F18 ปิด)
เหลือ INSERT เป็น seed จริง (4) **PRE-F10** — connection ไป `SB_Compass` ยังไม่มีในโค้ด → อ่าน/เขียน
ตาราง Compass ทุกตัว รวม `public."TCompassLevelSubjectStat"` (อยู่ใน `SB_Compass` ตามคำชี้ขาด
2026-09-16) ไม่ได้จริง (RISK-F23) · ครบทั้ง 4 ชิ้นจึงจะได้ `ScoreBasis ≠ none`
**สัญญาที่ต้องอ่าน**: `## Cluster Determination Rules` ทั้งหมด

**Sensitive concern: ไม่ใช่ข้อมูลส่วนบุคคลที่รั่วออกนอกระบบ** — Module K อ่าน `public."TCompassLevelSubjectStat"`
(สถิติรวมระดับประเทศ ไม่ใช่รายคน) และเขียนผลตัวเองไว้ใน `public."TCompassStudentClusterScore"` ซึ่งมีกติกา
เจ้าของข้อมูลเดียวกับ Module H/I-b (ดู `## Database Ownership Boundary`) · ยังไม่ implement จนกว่า
DEP-F09 จะปิด แต่ไม่ใช่เพราะติดคำถามเปิดด้าน business rule อีกต่อไป

### Module I-b: RIASEC Test & Quest — ฝั่งนักเรียน (REQ-007, REQ-008, REQ-012, REQ-017) 🔒
**ครอบคลุม**: DES-012, DES-008, **DES-017 *(ใหม่ v7)*** · อยู่ใน **`ClassOnlineWeb`**
**เนื้องาน**: แสดงคำถาม · รับคำตอบ · คำนวณระดับมิติ RIASEC + % + จุดไม่เข้ากัน + คำแนะนำ · บันทึกผล ·
เสนอ quest · รับ reflection · **(ใหม่ v7) endpoint "ตั้งเป็นเป้าหมาย"** — เช็ค gate ตาม
`## Target Major Rules` ข้อ 2 แล้วเขียน/แทนที่แถวใน `public."TCompassTargetProgram"` ตามข้อ 3
**ตาราง/โมเดลที่แตะ**: อ่าน `public."TCompassRiasecQuestion"`, `public."TCompassRiasecDimension"`,
`public."TCompassProgramRiasecProfile"`, `public."TCompassQuest"`, `public."TCompassRiasecResult"`
*(อ่านเพิ่มเพื่อ gate check ของ REQ-017)* · **เขียน** `public."TCompassRiasecResult"`,
`public."TCompassQuestAttempt"`, **`public."TCompassTargetProgram"` *(ใหม่ v7)`**
**Dependency**: **ต้องรอ Module H** (ต้องมีสาขาก่อนจึงเทียบได้) และ **Module I-a** (ต้องมีคำถาม/quest) ·
**ไม่ต้องรอ Module K** — ผลลัพธ์ของ Module I-b (% ความเหมาะสมภายในสาขา) เป็นคนละกลไกกับ
`InterestFit`/`CombinedScore` ของ Module K (เลือก cluster) แม้จะใช้คำตอบ RIASEC ชุดเดียวกัน ·
**REQ-017 ไม่มี dependency เพิ่มจากเดิม** — ใช้ตาราง/gate ที่อยู่ในขอบเขตของ Module I-b เองทั้งหมด
🔴 การกั้นสิทธิ์รอ Module J
**สัญญาที่ต้องอ่าน**: `## RIASEC Fit Rules`, `## Target Major Rules` *(ใหม่ v7)*

**Sensitive concern: personal data**

**Security Considerations**:
คำตอบแบบทดสอบและ `reflection` เป็น **ข้อมูลเชิงจิตวิทยาและความคิดเห็นส่วนตัวของผู้เยาว์** —
อ่อนไหวกว่าคะแนนสอบ และเป็นข้อมูลที่เด็กให้มาโดยคาดหวังว่าไม่มีใครอื่นเห็น · failure mode:
(1) **IDOR ผ่าน `result_id` / `attempt_id`** — ทุกการอ่าน/เขียนต้องผูกกับ (`school_id`, `s_id`)
จาก JWT **ไม่ใช่แค่ตรวจว่า id มีอยู่จริง** (2) **ข้อมูลหลุดออกนอกระบบ** — `reflection` และคำตอบ
**ห้ามส่งให้ AI หรือบริการภายนอกใด ๆ** (REQ-010) และ Curriculum Service ก็ห้ามอ่าน
(3) **ผลลัพธ์กลายเป็นคำตัดสิน** — ถ้อยคำที่สื่อว่าเด็ก "ไม่เหมาะ" กับสาขาหนึ่งเป็นความเสียหายเชิง
จิตวิทยาที่ระบบไม่ควรสร้าง และผู้ใช้ห้ามไว้ชัดเจน → `## RIASEC Fit Rules` ข้อ 6
(4) *(ใหม่ v7 — endpoint "ตั้งเป็นเป้าหมาย")* **IDOR ผ่าน `program_id` ที่ส่งมาตั้งเป็นเป้าหมาย** —
ต้องเช็ค gate (`## Target Major Rules` ข้อ 2) ด้วย (`SchoolID`, `SID`) จาก JWT เท่านั้น เหมือนทุก
endpoint อื่นของโมดูลนี้ **ห้ามรับ `SchoolID`/`SID` จาก request body**

### Module J: Premium Entitlement & Identity Gating (REQ-009, REQ-010) 🔒
**ครอบคลุม**: DES-009, DES-010 · อยู่ใน **`ClassOnlineWeb`**
**เนื้องาน**: กั้นทุก endpoint ใหม่ของโมดูลนี้ด้วย `CheckEntitlement` + `compass_premium`
และบังคับให้ทุก endpoint ยึดตัวตนจาก JWT
**Dependency**: 🔴 **บล็อกที่ `sb-compass` OQ-15(a1)/(a2)** — ไม่ใช่สิ่งที่โมดูลนี้แก้ได้ (RISK-F04)
**สัญญาที่ต้องอ่าน**: `sb-compass/design.md` → `## Premium Entitlement Rules` (ห้ามเขียนกติกาใหม่
ที่นี่ — ใช้ของเดิมตัวเดียวกัน) · `## Identity & Scope Rules`

**Sensitive concern: broken access control**

**Security Considerations**:
ทุกข้อของ `sb-compass` Module B ใช้กับที่นี่เท่ากันทุกประการ · เพิ่มเติมเฉพาะของโมดูลนี้:
**fail-closed เมื่อตรวจสิทธิ์ไม่ได้ (403) ห้าม fail-open เด็ดขาด** และ **ห้ามคืน payload แล้วให้
หน้าจอซ่อน** (REQ-009 บังคับตรง ๆ) · endpoint ของโมดูลนี้ **ไม่มีตัวไหนที่เป็นฟีเจอร์ฟรี** จึงกั้น
ทั้ง endpoint ได้ทุกตัว ไม่มีกรณีพิเศษแบบ `analyst/{sID}` ของโมดูลเดิม

### การตัดสินใจเรื่องการแบ่ง module

**แก้ไข 2026-08-31 — เพิ่ม Module K** แบ่งเป็น **7 ก้อน ข้าม 2 codebase** เพราะมี dependency ที่
บังคับลำดับจริง (E → K → H → I-b · F → G → I-a) และเพราะ **เส้นแบ่ง codebase ทำให้บล็อกไม่เท่ากัน**:
F/G/I-a ไม่ติด `sb-compass` OQ-15 จึงเริ่มได้ทันทีที่มีคีย์ `glm-5.2` ส่วน H/I-b/J ติด และ **Module K
มีบล็อกคนละชุด** — เดิม (ตอนเสนอ) เป็นคำถามธุรกิจ/สูตร (OQ-F03/F06/F07) **ปิดหมดแล้ว (2026-08-31)**
เหลือเพียง DEP-F09 (การดำเนินการข้ามโมดูล ไม่ใช่คำถามธุรกิจ) — ถ้ารวมเป็นก้อนเดียวงานครึ่งที่เดินได้
จะถูกถ่วงโดยไม่จำเป็น

**ทั้ง 7 ยังอยู่ใน module folder เดียวกัน** (`_docs/module/sb-compass-faculty-match/`) — เป็นงาน
ที่มาจากบทสนทนาธุรกิจเดียวกัน มีขอบเขตเดียวกัน และ ship/ยกเลิกด้วยกัน ตาม
`policies/documentation.md` §1 · **การที่มันกิน 2 codebase ไม่ใช่เหตุผลให้แยก module folder**

**ผลกระทบต่อ `plan.md`**: การเปลี่ยนจาก 6 เป็น 7 modules และเปลี่ยน dependency chain (Module H
ตอนนี้รอทั้ง E และ K ไม่ใช่แค่ E) หมายความว่า **`project-manager` ต้องมาแก้ไข `plan.md` ใหม่**
ให้ตรงกับ Module/Dependency ชุดนี้ — ไม่ใช่สิ่งที่เอกสารนี้แก้เอง (`plan.md` เป็นของ `project-manager`)

### ✅ ปิดแล้ว — ไม่แยก Module K เป็น module folder ใหม่ (ผู้ใช้ยืนยัน 2026-08-31)

**สถานะ: ตัดสินแล้ว — `Module K` อยู่ใน `sb-compass-faculty-match` ต่อไป ไม่มีการย้ายไฟล์ ไม่มีการ
สร้าง module folder ใหม่** · ผู้ใช้ตั้งคำถามนี้เองระหว่างยืนยัน OQ-F03/F06/F07 (ถ้าการรวม Module K
เข้าโมดูลเดิมยุ่งยากเกินไป ให้ประเมินว่าควรแยกไหม) แล้ว **ยอมรับคำแนะนำ "ไม่แยก" ของ `system-analyst`
ในวันเดียวกัน** — เหตุผลด้านล่างเก็บไว้เพื่อไม่ให้มีใครเปิดประเด็นนี้ใหม่โดยไม่มีข้อมูลใหม่
(ประเมินตามเกณฑ์ของ `policies/documentation.md` §1 — "มีบทสนทนาธุรกิจของตัวเอง" +
"shippable/cancellable แยกจากกันได้")

**เหตุผลที่ไม่แยก:**

1. **Module K ไม่ผ่านเกณฑ์ "shippable/cancellable แยกอิสระ"** — REQ-005/006 ("เข้าสายก่อน แล้วเจาะ
   ลงสาขา") **ใช้ผลลัพธ์ของ Module K เป็นตัวกรองชั้นแรกโดยตรง** (`## Program Matching Rules` ข้อ 2)
   ถ้าไม่มี Module K, flow หลักของโมดูลนี้ทำงานไม่ได้เลย ไม่ใช่ฟีเจอร์เสริมที่ยกเลิกแล้วส่วนอื่นยังอยู่ได้
2. **ไม่มีบทสนทนาธุรกิจแยกต่างหาก** — REQ-011/REQ-013 (ที่มาของ Module K) เกิดจากสัมภาษณ์รอบเดียวกัน
   ในวันเดียวกันกับ REQ-012/014/015 ไม่ใช่ความต้องการทางธุรกิจใหม่ที่มีผู้ใช้ปลายทาง/ขอบเขตต่างจาก
   `sb-compass-faculty-match` เดิม
3. **ผู้ใช้เหมือนกันทุกประการ** — นักเรียนเจ้าของบัญชีคนเดียวกับที่ใช้ REQ-005/006/007/008
4. **`policies/documentation.md` §1 เตือนตรง ๆ ว่า "splitting into folders is not a way to manage
   size"** — ความซับซ้อนของ Module K (T-Score ใหม่, cross-module dependency กับ `sb-compass`) เป็น
   ความซับซ้อนเชิง**เนื้องาน** ไม่ใช่เชิง**ขนาดเอกสาร** และ `plan.md` ที่มีหลาย phase (ตาม Module) คือ
   เครื่องมือที่ถูกต้องสำหรับจัดการความซับซ้อนแบบนี้อยู่แล้ว ไม่ใช่การแยกโฟลเดอร์
5. **cross-module dependency กับ `sb-compass` (DEP-F09) ไม่ใช่เหตุผลให้แยก** — Module E ของโมดูลนี้
   เองก็มี cross-module dependency กับ `sb-compass` เช่นกัน (DEP-F05, แก้ไฟล์เดียวกัน) และไม่เคยถูก
   เสนอให้แยกโฟลเดอร์ด้วยเหตุผลนั้น รูปแบบ dependency แบบนี้มีมาก่อนแล้วในโมดูลนี้

**สิ่งที่อาจเปลี่ยนคำแนะนำนี้ในอนาคต (ไม่ใช่ตอนนี้)**: `sb-compass/requirement.md` amend เสร็จแล้ว
(2026-08-31, ปิด OQ-F04) โดยระบุว่า REQ-005/REQ-007 **ถูกแทนที่ทันทีและมีแผนถอดออก** — ยังไม่ใช่การ
ประกาศว่า `sb-compass` จะ**สร้าง flow ของตัวเองบน 11-cluster + RIASEC** · ถ้าวันหน้ามีการตัดสินใจ
แบบหลังจริง (โมดูล `sb-compass` มี flow ที่ใช้ cluster/RIASEC/T-Score ของตัวเองคู่ขนานกับโมดูลนี้)
เมื่อนั้น engine ชุดนี้จะกลายเป็นโครงสร้างพื้นฐาน
ที่ทั้งสองโมดูลใช้ร่วมกันจริง (ผ่านเกณฑ์ "shared by two independent business flows") — **นั่นคือ
จังหวะที่ควรกลับมาพิจารณาแยกเป็นโมดูลใหม่ (เช่น "sb-compass-taxonomy") ผ่านการสัมภาษณ์ของ
`business-analyst` ตามปกติ ไม่ใช่ตอนนี้ที่มันยังใช้เฉพาะใน `sb-compass-faculty-match` เท่านั้น**

**ห้ามเปิดประเด็นนี้ใหม่โดยไม่มีข้อมูลใหม่** — ผู้ใช้ปิดแล้ว 2026-08-31 · เงื่อนไขเดียวที่ทำให้กลับมา
พิจารณาได้คือย่อหน้าด้านบน (`sb-compass` ย้ายมาใช้ cluster/RIASEC ชุดเดียวกันผ่าน OQ-F04) ซึ่ง
ยังไม่เกิดขึ้น

---

## DES-024 — Deployment Prerequisites

**งานที่ต้องเสร็จก่อน deploy — ไม่ใช่งานเขียนโค้ด จึงไม่บล็อกการวางแผน แต่บล็อกการเริ่ม/การ deploy
· `devops` ต้องยืนยันครบทุกข้อ**

| # | สิ่งที่ต้องทำ | ใครทำ | บล็อกอะไร |
|---|---|---|---|
| **PRE-F01** | **ตั้งค่า `glm-5.2`**: endpoint · API key · โมเดล · budget/rate limit — 🔴 **v13 (2026-09-16 — ผู้ใช้ตัดสินทับกติกาเดิม "secret store ของ service ไม่ใช่ prod.config")**: แหล่งความจริงเดียว = **`ClassOnlineWeb/prod.config`** บล็อกใหม่ท้าย appSettings (หลัง `PGCompass_*`) — คีย์ `ApiKey` (ชื่อกลางที่ผู้ใช้เลือกเอง "เผื่อเปลี่ยนเจ้า/vendor") · `Endpoint` · `Model = glm-5.2` · `Curriculum_DatabaseUrl` · `Curriculum_PdfStoreEndpoint` (`prod.config:148-152` — ยืนยันจากไฟล์จริง EVD-040) · **ผู้ใช้เป็นคนเติมค่าจริง** · 🔴 **v14 (2026-09-16 — ผู้ใช้ตัดสิน "ให้ อ่านจาก prod.config แทนสิ")**: service แยกพาร์ส XML `<appSettings>` ของ `prod.config` เองโดยตรง — **ไม่มีขั้น env-injection อีกต่อไป** (ทับกลไก v13 · interface pydantic-settings **ไม่เปลี่ยน** — ชื่อฟิลด์ · `/readyz` รายงานแค่ presence ของค่า · guard DSN ว่างของ migrator คงเดิม · path = env `CURRICULUM_PROD_CONFIG_PATH` ทับได้ ไม่งั้น resolve `<repo-root>\ClassOnlineWeb\prod.config` จากตำแหน่ง package · ลำดับค่า: env `CURRICULUM_*` ที่ตั้งชัดเจน > XML > `.env` (legacy local mirror) > defaults · ค่าว่างใน XML = ยังไม่ตั้งค่า · ไฟล์หาย = degrade แบบ warning ฟิลด์ไม่มีค่า — บูตต่อได้ก่อน `ClassOnlineWeb` จะมีอยู่บนเครื่อง · RISK-F25) · **งานของ `devops` แคบลงเหลือ**: deploy service ที่ path นี้ resolve ได้ หรือตั้ง `CURRICULUM_PROD_CONFIG_PATH` ชี้สำเนาไฟล์ที่ sync — **PRE-F10 (ClassOnlineWeb ↔ `SB_Compass`) ยังเป็นงานแยกของตัวเอง ไม่หายไปไหน** | ผู้ใช้ + `devops` | 🔴 **ยังบล็อกการ implement Module F** ไม่ใช่แค่ deploy — คีย์มีอยู่แล้วแต่ `ApiKey`/`Endpoint` ยังค่าว่าง (`prod.config:148-149` ณ 2026-09-16) = เขียน integration แล้วทดสอบไม่ได้จนผู้ใช้เติมครบ |
| **PRE-F02** | ตั้งโปรเจกต์ Curriculum Service + ที่ deploy (Python/FastAPI) + pipeline | `devops` | Module F, G, I-a ทั้งหมด |
| **PRE-F03** | **เปิด network จาก Curriculum Service เข้า `SB_Compass`** (`10.0.0.128:9499` ตาม `PGCompass_*` ของ `prod.config:141-145` — 🔴 **v11 แก้ที่อยู่ตาม RISK-F22**: ~~เดิมเขียน "เข้า `PGGradeDB` (`GradeDataSource = 119.8.174.123,9499`)"~~) + DB credential ของ service — *(v13 2026-09-16: แหล่งค่า = คีย์ `Curriculum_DatabaseUrl` ใน `prod.config` เช่นเดียวกับ config อื่นทั้งหมดของ service — มติรวม config ที่เดียว ทับคำ "secret store")* slot `database_url` ของ `settings.py` รอค่านี้อยู่ | `devops` | Module F, G, I-a · ผู้ใช้ยืนยันแล้ว (D10) · ที่อยู่ใหม่ยืนยันจากหัวไฟล์ bootstrap + `prod.config` |
| **PRE-F04** | **สร้าง DB user แยกให้ Curriculum Service** บนฐาน **`SB_Compass`** (v11 — ไม่ใช่ `PGGradeDB` ตามเดิม) ที่ **เข้าถึงได้เฉพาะตารางกลุ่มคลังหลักสูตร** และ **ไม่มีสิทธิ์อ่านตารางนักเรียนใด ๆ** · และ user ของ `ClassOnlineWeb` (`app_kindergarten` ตาม `PGCompass_*`) ต้องเป็น **read-only** บนตารางกลุ่มคลังหลักสูตร และ read-write เฉพาะตารางกลุ่มที่ 2 ตาม `## DES-018` | `devops` | เป็นการบังคับ `## Database Ownership Boundary` และ REQ-010 ที่ระดับ DB ไม่ใช่ระดับวินัยของโค้ด |
| **PRE-F05** | ต่อ SSO ภายในเข้ากับ Curriculum Service — ต้องรู้ก่อนว่า provider ตัวไหน · โปรโตคอลอะไร · claim ไหนใช้เป็น subject (OQ-F08 — เดิมชื่อ OQ-F03 ในรอบที่ 1 ก่อนถูกเปลี่ยนเลขเลี่ยงการชนกับ OQ-F03 ของ `requirement.md`) | `devops` + ผู้ใช้ | Module G, I-a |
| **PRE-F06** | ที่เก็บไฟล์ PDF ต้นฉบับ — bucket/prefix แยกของโมดูลนี้ · **ห้ามใช้ `AzureUploadFile` ของ `ClassOnlineWeb`** ซึ่ง hardcode AK/SK ไว้ในซอร์ส (`AzureUploadFile.cs:18-21`) และรับพารามิเตอร์ `studentid` ที่ไม่ตรงบริบท (OQ-F09) | `devops` | Module F |
| **PRE-F07** | **seed ข้อมูลตั้งต้นตาม `## Data Model` § ข้อมูลตั้งต้นที่ต้อง seed**: 11 cluster · 26 faculty group · mapping cluster↔faculty_group · 6 มิติ RIASEC · 1 แถว `upper_secondary` · `public."TCompassUniversity"` แถว `KMUTT` — ✅ **ส่วนนี้อยู่ในสคริปต์ bootstrap จริงแล้ว (บรรทัด 474-577)** · **ส่วนตารางน้ำหนัก `public."TCompassClusterSubjectWeight"`/`public."TCompassClusterRiasecWeight"` ยัง INSERT ไม่ได้** — bootstrap ปฏิเสธเดาค่าเองโดยเจตนา (บรรทัด 579-585) · ค่าที่ยืนยันแล้วอยู่ที่ `## DES-022` §4a → ✅ **OQ-F18 ปิดแล้ว (ผู้ใช้มอบสิทธิ์ 2026-09-16) — seed ส่วนนี้ได้** | `backend-engineer` (migration) | Module F, G, I-a · **K (ฝั่ง `InterestFit`)** |
| **PRE-F08** | **ทดสอบแปลง PDF หลักสูตรจริงของ KMUTT อย่างน้อย 3 ฉบับด้วย markitdown ก่อนเริ่ม implement** แล้วส่งผลกลับมา | ผู้ใช้ / `backend-engineer` | ไม่บล็อกโค้ด แต่ **ปิด RISK-F02 ไม่ได้ถ้าไม่ทำ** — และถ้าผลออกมาแย่เป็นวงกว้าง แผนของ Module F ต้องเปลี่ยน (ต้องเพิ่ม OCR ตั้งแต่รอบแรก) |
| **PRE-F09** | **ตาราง `public."TCompassLevelSubjectStat"` พร้อมคอลัมน์ `"StddevScore"` ต้องมีอยู่จริงในฐานข้อมูลก่อน Module K รันได้** — 🔴 **v11 (2026-09-16): ที่อยู่คือ `SB_Compass` (PGCompass) ตามคำชี้ขาดของผู้ใช้ — Module C ของ `sb-compass` ต้องเปลี่ยน connection จาก `PGGradeDBEntities` ก่อนสร้างตาราง/คำนวณจริง** (โค้ดปัจจุบันยังชี้ `PGGradeDB`) — ✅ `sb-compass/requirement.md` REQ-017 · ✅ `sb-compass/design.md` Contract Version 8 (DDL + batch contract, งานอยู่ใน **Module C** ของโมดูลนั้น) · ⬜ เหลือ: **ผู้ใช้ยืนยันเลข `MIN_N_FOR_STDDEV`** (`sb-compass OQ-18` ข้อ ข — **ปิดแล้ว ยืนยัน 30**) · `project-manager` ของ `sb-compass` เพิ่มงานนี้เข้า `plan.md` · implement (แก้ `EnsureTables` ให้สร้างตารางด้วยชื่อ/DDL ใหม่ + batch — **ไม่ต้อง migration**) · **recompute ด้วย `?limit=0`** | ผู้ใช้ + `project-manager`/engineer/`devops` **ของโมดูล `sb-compass`** | 🔴 บล็อก **การรันจริง** ของ Module K (REQ-013) — **ไม่บล็อกการเขียนโค้ด Module K แล้ว** และไม่บล็อก Module E/F/G/H/I-a/I-b (ดู DEP-F09) |
| **PRE-F10** 🆕 *(v11, 2026-09-16 — ผลของการปิด RISK-F22)* | **เชื่อม `ClassOnlineWeb` เข้า `SB_Compass`**: เพิ่ม connection string ใหม่ใน `configSource-prod.config` (อ้างค่า `PGCompass_*` ของ `prod.config:141-145` — host `10.0.0.128:9499` · user `app_kindergarten` ซึ่ง `PGCompass_Password` วันนี้ยังเป็นค่าว่าง (`prod.config:143`) ต้องเติมจริงก่อน deploy — *(v13 progress 2026-09-16: ผู้ใช้จัดหาแล้ว — `PGCompass_Password` ไม่ว่างอีกต่อไป และ `PGCompass_UserID` เปลี่ยนเป็น `app_academic` ตามค่าจริงใน `prod.config:142-143` ซึ่งทับชื่อ `app_kindergarten` ที่เอกสารจุดนี้เคยเขียน · ส่วนการต่อ connection/network ยังเปิด — `devops` (ISS-F05))* — **ขึ้นกับ ISS-F05 (Open ใน `review.md` · เจ้าของ `devops` · ยืนยันจากการ grep ว่าไม่มี `.cs` ใดอ่านคีย์ `PGCompass_*` เลย)**) · เปิด network จาก app server ถึง `10.0.0.128:9499` · **เปลี่ยน connection ของโค้ดตาราง Compass ทั้งหมด** จาก `PGGradeDBEntities` (ปัจจุบัน `CompassClusterService.cs:29` · `CompassRiasecService.cs:28` — อ่านน้ำหนัก · เขียน RIASEC · เขียนผล cluster) โดย **คง `PGGradeDBEntities` เฉพาะการอ่านตารางเกรด** (Module E) — **ตาราง `TCompass*` ทุกตัว รวม `public."TCompassLevelSubjectStat"` ของ `sb-compass` ผ่าน connection ใหม่** (ผู้ใช้ชี้ขาดที่อยู่ 2026-09-16 · รวมถึง `CompassRankingService.cs:33` ฝั่ง `sb-compass` ที่ต้องเปลี่ยนก่อนสร้างตาราง) | `backend-engineer` (โค้ด) + `devops` (network/credential) | **ทุกโมดูลที่แตะตาราง Compass** (F, G, I-a, I-b, H, K) — ปลายทางตารางอยู่คนละฐานกับที่โค้ดเขียนสวนอยู่ (RISK-F23) |

**ลำดับที่ถูกต้อง**: PRE-F02 → PRE-F03/F04 → PRE-F01/F05/F06 → PRE-F07 → deploy Module F/G/I-a ·
**แยกอิสระ**: PRE-F09 → Module K (ไม่ต้องรอ/ไม่ถ่วง Module F/G/H/I-a/I-b) · **v11 (2026-09-16)**:
Module K "รันจริง" ต้องมีครบ **PRE-F09 + PRE-F10 + OQ-F18 (seed §4a) + OQ-F19 (คอลัมน์
credit/composite ตาม §1a)** — สูตร/ตารางน้ำหนัก (OQ-F03/F06/F07) ปิดหมดแล้วเหมือนเดิม แต่การผลิต
คะแนนจริงยังติด 4 เงื่อนไขนี้ (ISS-F03 / RISK-F24)

Contract:DeploymentPrerequisites.v1
DEC-024

Evidence EVD-019: claim=DES-024 | state=confirmed | path=ClassOnlineWeb/Web.config | symbol=appSettings | line=14 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=4d6a295c613a39e7042e7307b92767341cc7346288d8cf70d465aed0b41524f2
Evidence EVD-020: claim=Contract:DeploymentPrerequisites.v1 | state=unresolved | path=ClassOnlineWeb/Helper/AzureUploadFile.cs | symbol=AzureUploadFile | line=18 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=2a764d5215a7dbc2faa6513a277026f6d067e83b1dfffd8578fc0cce53083870
Evidence EVD-021: claim=DEC-024 | state=confirmed | path=ClassOnlineWeb/Helper/AzureUploadFile.cs | symbol=UploadFileHttpRequestBase | line=22 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=2a764d5215a7dbc2faa6513a277026f6d067e83b1dfffd8578fc0cce53083870
Evidence EVD-038: claim=DES-024 | state=unresolved | path=curriculum-service/curriculum_service/settings.py | symbol=database_url | line=15 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=read | hash=9120fbc46324c6c104b993c79e7ecb767d3845c7a534e85e8d13b17a7c5e797f
Evidence EVD-039: claim=Contract:DeploymentPrerequisites.v1 | state=confirmed | path=ClassOnlineWeb/DatabaseScripts/Compass/README.md | symbol=SB_Compass | line=33 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=read | hash=c6d0f6cb5b1ec342dd6e5d3a3e72c52b13b1501737eb3ce9a57e4cf0f4b1fe20
Evidence EVD-040: claim=Contract:DeploymentPrerequisites.v1 | state=confirmed | path=ClassOnlineWeb/prod.config | symbol=ApiKey | line=148 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=995e27ccd00b96e1242151667964e8080f07b4f061a69da61503e6987787fb96
Evidence EVD-041: claim=Contract:DeploymentPrerequisites.v1 | state=confirmed | path=curriculum-service/curriculum_service/settings.py | symbol=_PROD_CONFIG_KEY_MAP | line=85 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=read | hash=3dee49183e77f938af103d33d0606f72524f1534e0c4e26f9d54b0c869c1ae9d
  — แมปคีย์ XML→ฟิลด์ครบ 5 ตัว (ไฟล์ยัง untracked ณ 2026-09-16 — engineer run ตกไฟล์ระหว่างรอบ amend แล้วยืนยันจากการอ่านจริง) · อ้างอิง PRE-F01
Evidence EVD-042: claim=Contract:DeploymentPrerequisites.v1 | state=confirmed | path=curriculum-service/curriculum_service/settings.py | symbol=settings_customise_sources | line=241 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=read | hash=3dee49183e77f938af103d33d0606f72524f1534e0c4e26f9d54b0c869c1ae9d
  — ลำดับค่า env > prod.config XML > .env > defaults + `_resolve_prod_config_path` (`CURRICULUM_PROD_CONFIG_PATH`, line 111) + degrade-แบบ-warning ไม่ crash เมื่อไฟล์หาย/พัง และไม่ log ค่า (`read_prod_config`, line 119) · อ้างอิง PRE-F01

Compatibility: additive-external
Data/schema: additive
Migration/backfill: none
Security: sensitive
Fallback: PRE-F08 พบ markitdown แย่เป็นวงกว้าง → Module F เพิ่ม OCR ตั้งแต่รอบแรก (markdown_origin = 'markitdown+ocr') · PRE-F09 ยังไม่เสร็จ → Module K แสดงข้อความ "ยังประเมินไม่ได้" ขณะที่ Module F/G/I-a deploy ตามลำดับเดิมได้โดยไม่เดิน
Material ambiguity: unresolved

---

## Risks & Dependencies

| ID | ความเสี่ยง | ผลกระทบ | การจัดการ |
|---|---|---|---|
| **RISK-F01** 🔴 | **คีย์ `glm-5.2` ยังไม่มีอยู่จริง** — ยืนยันจากไฟล์: `Web.config:14` ชี้ `prod.config` และในนั้นไม่มีคีย์ AI/LLM เลยสักตัว | **บล็อกการ implement Module F ทั้งก้อน** ไม่ใช่แค่บล็อก deploy | PRE-F01 · ~~**หลัง D1 คีย์นี้ย้ายไปอยู่ที่ secret store ของ Curriculum Service** — เป็นผลพลอยได้ที่ดี~~ *(v13 2026-09-16 — ผู้ใช้ตัดสินทับ: คีย์มีที่อยู่แล้วใน `prod.config` `ApiKey`/`Endpoint`/`Model` — ค่าว่างรอผู้ใช้เติม ดู RISK-F05)* |
| **RISK-F02** 🔴 | **คุณภาพ markitdown กับ PDF หลักสูตรจริงยังไม่เคยทดสอบ** — `system-analyst` ทดสอบเองไม่ได้ในเซสชันนี้ (ไม่มี Bash และไม่มีไฟล์ตัวอย่าง) · **ที่หลายมหาวิทยาลัยจะเจอ PDF สแกนแน่นอน ซึ่งแปลงไม่ออกถ้าไม่มี OCR** | สูง · REQ-004 (ให้คนกรอกมือ) รับความเสี่ยงนี้ไว้แล้ว **แต่ถ้าแปลงได้แย่เป็นวงกว้าง "กรอกมือ" จะกลายเป็นค่า default และคุณค่าของ AI หายไปทั้งหมด** — จะกลายเป็นระบบกรอกข้อมูลด้วยมือที่มีค่า AI ติดมาเปล่า ๆ | **PRE-F08 — ทดสอบจริง 3 ฉบับก่อนเริ่ม implement** · `conversion_status = 'empty'` กันความล้มเหลวแบบเงียบ (`## Import Rules` ข้อ 2) · `markdown_origin` รองรับ `'markitdown+ocr'` ไว้แล้ว |
| **RISK-F03** ✅ | REQ-002 กับ REQ-007 ขัดกันจนคำนวณไม่ได้ | — | **ปิดแล้ว** — บันทึกเต็มย้ายไป `design-archive.md` (2026-09-21) |
| **RISK-F04** 🔴 | **REQ-009 บล็อกที่ `sb-compass` OQ-15(a1)/(a2)** — `CheckEntitlement` ยังเขียนไม่ได้เพราะ `TFeatureSBPlus` ไม่มีคอลัมน์ feature key แบบ string · ในโค้ดจริงยังเป็น `TODO(BE-007)` (`CompassApiController.cs:302,320`) | สูง · **บล็อก Module J ทั้งก้อน และบล็อกการเปิดให้เด็กใช้ Module H/I-b จริง** (ฟีเจอร์ทำงานได้แต่กั้นสิทธิ์ไม่ได้ = ปล่อยขึ้น production ไม่ได้) | **ไม่ใช่สิ่งที่โมดูลนี้แก้ได้** — ต้องรอ `sb-compass` ปิด OQ-15 · **สิ่งที่โมดูลนี้ทำได้และทำแล้วคือ ย้ายครึ่งหลังบ้าน (F/G/I-a) ออกจากบล็อกนี้ด้วยการตัดสิน D2** |
| **RISK-F05** 🟠 | **`prod.config` เก็บ secret จริงเป็น plaintext ทั้งไฟล์** (รหัส DB ทุกตัว · `token_secret` · LINE `ChannelAccessToken` · Azure `AccountKey`) และ **`Helper/AzureUploadFile.cs:18-21` hardcode Huawei OBS AK/SK ในซอร์สโค้ด** | สูง แต่**เป็นของเดิม ไม่ใช่ของที่โมดูลนี้สร้าง** · ความเสี่ยงที่โมดูลนี้เพิ่มคือ **ถ้าเอา API key ของ `glm-5.2` ไปวางที่เดิม จะขยายพื้นผิวที่เปิดอยู่แล้ว** | **การตัดสิน D1 ลดข้อนี้ไปบางส่วนโดยบังเอิญ** — ~~คีย์อยู่ใน Curriculum Service ไม่ต้องเข้า `prod.config` (PRE-F01)~~ · PRE-F06 ห้ามใช้ `AzureUploadFile` · **ของเดิมยังไม่ถูกแก้ → `security` ต้องเห็นข้อนี้ ไม่ใช่ขอบเขตที่ `system-analyst` ปิดได้** · **v13 (2026-09-16) — USER RISK ACCEPTANCE (รูปแบบเดียวกับ OQ-F02 — ไม่ใช่การรับรองของ `system-analyst`)**: ผู้ใช้ทราบ warning นี้แล้ว (`prod.config` เป็น plaintext + มีรหัส DB ทุกตัว/`token_secret`/LINE token/Azure `AccountKey` อยู่ก่อน) และตัดสินให้ config ของ Curriculum Service ทั้งหมด — รวม API key `ApiKey` + `Curriculum_DatabaseUrl` — ไปรวมอยู่ `prod.config` เช่นกัน **พื้นผิว plaintext จึงขยายขึ้นตามการตัดสินของผู้ใช้เอง** · `security` ยังมีสิทธิ์ยกขึ้นใหม่ใน audit ครั้งถัดไปถ้าเห็นเหตุผลเฉพาะเจาะจง · hardcode AK/SK ของ `AzureUploadFile.cs:18-21` ยังเป็นของเดิมนอกขอบเขตเช่นเดิม · **v14 (2026-09-16)**: การให้ service แยกพาร์ส `prod.config` เอง (แทน env-injection ของ v13) **ไม่เพิ่มพื้นผิว secret ใหม่** — ไฟล์เดิม · plaintext เดิม · USER RISK ACCEPTANCE ข้างบนครอบครองเหมือนเดิม แต่**เพิ่มความเชื่อมโยงด้าน path ของไฟล์** → RISK-F25 (Minor · ผู้ใช้ตัดสินรับ 2026-09-16) |
| **RISK-F06** 🟡 **ผู้ใช้รับความเสี่ยงเองแล้ว** *(OQ-F02 ปิด 2026-09-02)* | ลิขสิทธิ์/เงื่อนไขการใช้เอกสารหลักสูตร — ผู้ใช้ตัดสินรับความเสี่ยงเอง · บันทึกการตัดสินเต็มย้ายไป `design-archive.md` | — | 🟡 รับความเสี่ยงแล้ว |
| **RISK-F07** 🟡 | เอกสารหลักสูตรยาวเกิน context ของ `glm-5.2` | กลาง · ผลอาจไม่ครบโดยไม่มีอะไรฟ้อง | กติกาแยกเอกสารต่อสาขา + ตัดที่ขอบหัวข้อ + **บังคับ `ai_incomplete` ทุกครั้งที่ต้องตัด** (`## Import Rules` ข้อ 3) |
| **RISK-F08** 🟡→🟠 | **`MapCanonicalSubject` เป็น keyword heuristic ที่มี `TODO` คาอยู่** (`CompassScoreService.cs:290-314`) · 8 ชื่อกลุ่มสาระเป็น**คีย์เชื่อมเดียว**ระหว่างผล AI กับคะแนนเด็ก — AI คืนชื่อนอกชุดนี้แม้แต่ตัวอักษรเดียว กลุ่มนั้นจะหายไป **เงียบ ๆ** · **แย่ลงเมื่อหลายมหาวิทยาลัย** เพราะแต่ละที่เรียกวิชาไม่เหมือนกัน | กลาง-สูง · % ของสาขาจะเพี้ยนโดยไม่มี error และคนตรวจอาจไม่สังเกตเพราะหน้าจอดูปกติ | validate แบบ exact match + **บังคับเก็บ `ai_raw_response` ไว้เสมอแม้ validate ล้ม** เพื่อให้คนแก้ได้เร็ว (`## Import Rules` ข้อ 5) · เงื่อนไขก่อนอนุมัติบังคับให้ทุก `subject` ถูกต้อง |
| **RISK-F09** 🟠 | **Curriculum Service เป็นพื้นผิว operation ใหม่ทั้งหมด** — deploy · monitor · secret · patch · backup | กลาง-สูง · ทีมยังไม่เคยดูแลบริการ Python มาก่อนในสายงานนี้ (ทั้ง Target เป็น .NET ล้วน) | PRE-F02 · เป็นราคาที่ผู้ใช้ยอมจ่ายโดยรู้ตัวเพื่อแลกกับการไม่ผูกงานใหม่เข้ากับ 4.8 ที่กำลังจะถูก migrate |
| **RISK-F10** 🟠 | **สอง codebase ใช้ตารางชุดเดียวกัน** — ถ้าไม่บังคับว่าใครเขียนได้บ้าง จะกลายเป็น schema drift ที่ `check-schema-contract.js` ตรวจยาก เพราะ Data Model เดียวครอบสอง codebase ที่ไม่ได้อยู่ใน repo เดียวกัน | สูง · drift แบบนี้ค้นพบตอน runtime ไม่ใช่ตอน review | `## Database Ownership Boundary` เป็น contract section เต็มรูป · **บังคับที่ระดับ DB grant (PRE-F04) ไม่ใช่พึ่งวินัยของโค้ด** · `qa-engineer` ต้องตรวจทั้งสองฝั่ง · **v11**: ตารางชุดเดียวกันถูกกระจายสองฐาน (`SB_Compass` + `PGGradeDB` read-only) แล้ว — grant ของ PRE-F04/PRE-F10 จึงบังคับทั้งที่อยู่และสิทธิ์พร้อมกัน · **v12 แก้คำของ v11**: ไม่ใช่ "ตารางชุดเดียวกระจายสองฐาน" — `SB_Compass` ครอบตาราง Compass ทุกตัว (31 ตัวใหม่ + 3 ตัวเดิมของ `sb-compass` ที่ runtime-created) ส่วน `PGGradeDB` เหลือเฉพาะตารางเกรด/SB PLUS ที่ไม่ใช่ Compass (ผู้ใช้ยืนยัน 2026-09-16) — grant จึงยังบังคับทั้งที่อยู่และสิทธิ์พร้อมกัน |
| **RISK-F11** 🟡 | **DB credential ของ `PGGradeDB` ไปอยู่เพิ่มอีกที่หนึ่ง** (secret store ของ service ใหม่) | กลาง | PRE-F03/F04 — user แยกที่มีสิทธิ์แคบที่สุดเท่าที่งานต้องใช้ ไม่ใช่ใช้ `root` ร่วมกับของเดิม · **v11**: credential ชุดใหม่ของ `SB_Compass` (`app_kindergarten`) เพิ่มเข้ามาอีกหนึ่งชุด — `PGCompass_Password` วันนี้ยังว่างใน `prod.config` ต้องไม่คงสภาพว่างนี้ไป deploy · **v13 (2026-09-16)**: แหล่งค่า credential ฝั่ง service = คีย์ `Curriculum_DatabaseUrl` ใน `prod.config` (มติรวม config ที่เดียว — ทับคำ "secret store ของ service") · `PGCompass_Password` ผู้ใช้จัดหาแล้ว (ไม่ว่าง) และ `PGCompass_UserID` = `app_academic` — การต่อ connection ยังเปิด (PRE-F10/ISS-F05 — `devops`) |
| **RISK-F12** 🟡 | **`TARGET_SCORE = 75` ไม่มีที่มาเชิงวิชาการ** — เป็นค่าที่เอกสารนี้กำหนดเอง เช่นเดียวกับที่ `sb-compass` มี target/weight ของ 8 สายที่ไม่มีเอกสารอ้างอิงเกณฑ์รับเข้าคณะใด | ต่ำ-กลาง · % ที่เด็กเห็นเป็นตัวเลขที่อธิบายที่มาไม่ได้ถ้ามีคนถาม · ผลลัพธ์ยัง**เรียงลำดับถูก**เสมอเพราะทุกสาขาใช้ค่าเดียวกัน | บันทึกเป็นสมมติฐานอย่างเปิดเผย · เก็บเป็นค่าคงที่ที่มีชื่อ แก้ที่เดียวได้ · ถ้าวันหน้ามีเกณฑ์จริงให้ amend |
| **RISK-F13** 🟡 | **ไม่มีการแยกบทบาทผู้นำเข้ากับผู้อนุมัติ** — คนเดียวอัปโหลดแล้วกดอนุมัติเองได้ ทำให้ REQ-003 เหลือการตรวจชั้นเดียว | กลาง · REQ-003 มีไว้กันไม่ให้ผล AI ถึงเด็กโดยไม่มีใครดู ซึ่งยังบรรลุ แต่กันคนที่ตั้งใจข้ามขั้นไม่ได้ | รอบนี้ยอมรับโดยเจตนา (ทีมงานภายในกลุ่มเล็ก) · บันทึก `imported_by`/`reviewed_by` ทุกแถวเพื่อย้อนกลับได้ · **ถ้าจะเปิดให้คนนอกทีมนำเข้าได้ ต้องกลับมา amend ก่อน** |
| **RISK-F14** 🟡 | **T-Score (REQ-013) ต้องการ `"StddevScore"` ต่อ (ระดับชั้น × กลุ่มสาระ)** — ต้องรอ `sb-compass` implement คอลัมน์นี้ (RISK-F14 เดิม 🔴 ลดเพราะ `sb-compass` ออกแบบครบแล้ว · บันทึกเต็มย้ายไป `design-archive.md`) | — | ติดตามที่ DEP-F09 |
| **RISK-F17** 🟢 **จัดการแล้วด้วย WORD-F01** | ฐานที่ใช้คำนวณ T-Score ไม่ใช่ "นักเรียนทั้งประเทศ" — จัดการด้วยข้อกำหนดถ้อยคำด้านล่าง (WORD-F01) · บันทึกเต็มย้ายไป `design-archive.md` | — | 🟢 จัดการแล้ว |
| **RISK-F15** 🟠 | **ตารางน้ำหนัก `public."TCompassClusterSubjectWeight"` (11×8) และ `public."TCompassClusterRiasecWeight"` (11×6) เป็นข้อเสนอของ `system-analyst` เอง ไม่มีแหล่งอ้างอิงเชิงตัวเลขภายนอก** (P-F03) — ต่างจาก 8 ชื่อกลุ่มสาระ/26 กลุ่มคณะที่ยืนยันจากโค้ด/เอกสาร taxonomy ที่ยืนยันแล้ว | กลาง-สูง · ถ้าน้ำหนักผิดสัดส่วน เด็กอาจถูกแนะนำ cluster ที่ไม่ตรงกับความถนัด/ความสนใจจริงอย่างเป็นระบบ (systematic bias) ไม่ใช่แค่รายคน | **OQ-F07 ปิดแล้ว (sign-off 2026-08-31)** — เก็บเป็นตารางแก้ไขได้ (ไม่ hardcode ในโค้ด) เพื่อแก้ทีหลังได้โดยไม่ redeploy · **สถานะ "สมมติฐานไม่มีแหล่งอ้างอิงภายนอก" ยังคงอยู่ต่อไปตาม policy แม้ sign-off แล้ว** — ไม่ใช่ risk ที่ปิดสนิท เพียงได้รับอนุญาตให้ดำเนินการ |
| **RISK-F16** 🟡 🆕 | **`education-pathway-taxonomy-design.md` เป็นเอกสารที่ Claude ช่วยร่างให้ผู้ใช้ ไม่ผ่านสัมภาษณ์ทางการมาก่อน และตัวเลข/เกณฑ์ภายในยังไม่มีการตรวจสอบแหล่งอ้างอิงภายนอกใด ๆ** (ยืนยันจากหัวข้อ I.4 ของเอกสารเอง) — ใช้เป็นฐานสำหรับ 11 cluster, 26 faculty group mapping, และ L2/L3/L3.5/L6 ทั้งหมด | กลาง · ความเสี่ยงกระจายไปทั้ง schema เพราะเป็นฐานเดียวของทุกตารางใหม่ | ผู้ใช้ยืนยันตรง ๆ ว่าต้องการใช้เอกสารนี้เป็น requirement จริงแล้ว (2026-08-31) — **ยอมรับความเสี่ยงนี้ไว้แล้วในระดับนโยบาย** ไม่ใช่สิ่งที่ต้องปิดก่อน implement แต่ `qa-engineer`/`business-analyst` ควรทราบไว้เป็นบริบทเมื่อพบข้อมูลที่ดูผิดปกติ |
| **RISK-F18** 🟢 **จัดการแล้ว** *(v6 · ปิด v8, 2026-09-02)* | คะแนนจากสองรูปแบบเทียบกันไม่ได้โดยธรรมชาติ — ปิดด้วยการ re-scope ตาม v8 · บันทึกเต็มย้ายไป `design-archive.md` · กติกาที่ใช้อยู่ที่ `## DES-025 — RIASEC Fit Rules` ข้อ 3 | — | 🟢 ปิด |
| **RISK-F19** 🟡 **ลดลงบางส่วน** *(v6 · แก้ไข v8, 2026-09-02)* | schema ของข้อ 6-7 พร้อมแล้ว — ส่วนที่เหลือเป็นงาน implement · บันทึกเต็มย้ายไป `design-archive.md` · สัญญาปัจจุบันที่ `## DES-025` ข้อ 6-7 | — | 🟡 เหลือ implement |
| **RISK-F20** 🟠 🆕 *(v7, 2026-09-02)* | **gate ของ REQ-017 (`## Target Major Rules` ข้อ 2) ผิดง่ายถ้า engineer ลอกนิยาม "ผลล่าสุด" ของ `## RIASEC Fit Rules` ข้อ 7 มาใช้ตรง ๆ** — นิยามนั้นคีย์แค่ (`SchoolID`, `SID`) ไม่รวม `ProgramID` (ถูกของมันเองสำหรับ "ดูผลล่าสุด") แต่ gate ของ REQ-017 ต้องเป็นคนละคำถาม ("เคยทำของสาขานี้ครบหรือยัง") ถ้าเขียนผิดจะกลายเป็น **เช็คว่า "เคยทำ REQ-007 ของสาขาไหนก็ได้" แทนที่จะเช็คสาขาที่กำลังจะตั้งเป็นเป้าหมาย** | สูง · เด็กจะกดตั้งเป้าหมายสาขาที่ยังไม่เคยทำ REQ-007 ของสาขานั้นได้เลย ซึ่งขัด REQ-017 ตรง ๆ และ**ไม่มีอะไรฟ้อง** เพราะระบบไม่ error แค่ปล่อยผ่าน gate ที่ไม่ควรผ่าน | เขียน gate query ของตัวเองตามที่ `## Target Major Rules` ข้อ 2 ระบุ (`WHERE "SchoolID"=@ AND "SID"=@ AND "ProgramID"=@`) **ห้ามเรียกใช้/ลอก query "ผลล่าสุด" ของ RIASEC Fit Rules** · `qa-engineer` ต้องทดสอบเคส "ทำ REQ-007 ของสาขา A แล้ว แต่ยังไม่ได้ตั้ง B เป็นเป้าหมาย" ว่ากด "ตั้ง B" ไม่ได้จริง |
| **RISK-F21** 🟠 🆕 *(v9, 2026-09-15)* | **PK ของตาราง master เป็น int identity แล้ว แต่ทุกอย่างที่มนุษย์/AI/ไฟล์ seed อ้างถึงยังเป็น text code** (`'C1'`, `'FG01'`, `'R'`, `'KMUTT'`, `'SP_UPPER_SCI_MATH'`, `'CR_SWE'`) — มีชั้นแปลง code → Id เกิดขึ้นใหม่ที่ไม่เคยมีในดีไซน์เดิม · **จุดที่พลาดง่ายที่สุดคือ `"FacultyGroupID"` ซึ่ง *ชื่อเดิม* แต่ *ชนิดเปลี่ยน* จาก text code เป็น integer** — โค้ด/prompt/seed ที่ยังใส่ `'FG01'` ลงคอลัมน์นี้จะพังหรือ (แย่กว่า) ถูก cast เงียบ ๆ ในบางเส้นทาง | กลาง-สูง · ถ้า engineer เอา Id ไปใส่ในไฟล์ seed หรือ prompt ของ AI จะผูกกับเลขที่ฐานข้อมูลออกให้ในสภาพแวดล้อมหนึ่ง **แล้วชี้ผิดแถวเงียบ ๆ ในอีกสภาพแวดล้อม** (dev/prod ได้เลขไม่เหมือนกัน) — ไม่มี error ให้เห็น | **กติกาบังคับที่ `## Data Model` v9 note**: code เป็นคีย์ของมนุษย์/seed/AI · Id เป็นคีย์ของฐานข้อมูลเท่านั้น · seed ทุกชุดเขียนเป็น `INSERT ... SELECT ... JOIN` บนคอลัมน์ code · **ห้ามส่ง Id ให้ AI ห้าม hardcode Id ในโค้ด ห้ามใส่ Id ในไฟล์ seed** · `DES-019` ข้อ 5 เปลี่ยนชื่อฟิลด์สัญญา AI เป็น `faculty_group_code` ให้ตรงความจริง · `qa-engineer` ตรวจตรง ๆ ได้ว่ามีเลข Id โผล่ใน seed/prompt/โค้ดหรือไม่ |
| **RISK-F22** ✅ **ปิดแล้ว (v11, 2026-09-16)** | ~~drift เรื่องที่อยู่ฐานข้อมูล~~ — reconcile แล้ว · บันทึกเต็มย้ายไป `design-archive.md` · กติกาปัจจุบันที่ `## DES-018 — Database Ownership Boundary` | — | ✅ ปิด |
| **RISK-F23** 🟠 🆕 *(v11, 2026-09-16)* | **โค้ด Compass ทุกจุดยังใช้ `PGGradeDBEntities` กับตารางที่อยู่ใน `SB_Compass`** (`CompassClusterService.cs:29` · `CompassRiasecService.cs:28` · และ **`CompassRankingService.cs:33` ฝั่ง `sb-compass` ที่จะสร้าง `TCompassLevelSubjectStat` ผิดฐาน** — ยืนยันจากไฟล์จริง) — ถ้าตารางถูกสร้าง/seed ใน `SB_Compass` ตาม bootstrap แต่โค้ดยังเขียน/อ่านสวนไป `PGGradeDB` จะเกิด **split-brain: ตารางว่างใน `SB_Compass` ขณะที่ข้อมูลผู้ใช้ทดสอบไปกองใน `PGGradeDB`** โดยไม่มี error ให้เห็น | กลาง-สูง · ทิศทางผิดแบบเงียบทั้งรอบทดสอบ | PRE-F10 — เปลี่ยน connection ของโค้ดตาราง Compass ทั้งสองโมดูลก่อน implement ถัดจากนี้ · `qa-engineer` ตรวจได้ตรง ๆ ว่า read/write ตาราง `TCompass*` ชี้ `SB_Compass` และ `PGGradeDBEntities` ถูกใช้เฉพาะตารางเกรด |
| **RISK-F24** 🔴 🆕 *(v11, 2026-09-16 — design gap ของ ISS-F03 · คำถามปิดหมดแล้ว เหลือ implement)* | **Module K ผลิตคะแนนไม่ได้จนกว่า 4 เงื่อนไขจะครบ**: โค้ดจริงกันไว้แล้วว่า `TryGetCreditPercentile` คืน `false` เสมอ + `CompositeMean`/`CompositeSd` ไม่มีแหล่งเก็บ → `AcademicFit` เป็น `NULL` ทุกกลุ่มสาระ · สองตารางน้ำหนักยังว่าง (ค่าที่ sign-off เดิม 2026-08-31 ไม่เคยถูกบันทึกไว้ที่ใด) → `InterestFit` เป็น `NULL` ทุก cluster · รวมกันทุกรอบคำนวณลง `ScoreBasis = 'none'` | สูง · ฟีเจอร์หลักของ REQ-011/REQ-013 ยังไม่มีทางให้ผลจริงแก่นักเรียน | **คำถามปิดครบแล้ว (2026-09-16 — ผู้ใช้มอบสิทธิ์ค่าน้ำหนัก OQ-F18 + เลือกทางเลือก A ขยายตาราง OQ-F19)** · เหลือ **implement 4 ชิ้น**: PRE-F09 (`"StddevScore"`) · PRE-F10 (connection) · seed §4a (ค่าพร้อม) · รอบ amend + batch คอลัมน์ credit/composite ฝั่ง `sb-compass` ตาม §1a (ทิศทางอนุมัติแล้ว) · **ห้าม engineer เดาค่าน้ำหนักหรือเขียน credit distribution เองทุกกรณี** — ค่าและสูตรมีครบในเอกสารแล้ว |
| **RISK-F25** 🟡 Minor 🆕 *(v14, 2026-09-16 — accepted by user decision ผู้ใช้ตัดสินรับเอง)* | **file-path coupling ของ `prod.config`** — v14 ให้ Curriculum Service แยกพาร์ส `ClassOnlineWeb/prod.config` เอง จึงต้องเข้าถึงไฟล์นั้นได้จากที่ deploy · ที่ deploy ของ service (PRE-F02) ยังเปิด — ถ้า deploy นอกเครื่องที่ repo `ClassOnlineWeb` อยู่ ต้องมีสำเนาไฟล์ที่ sync และชี้ด้วย `CURRICULUM_PROD_CONFIG_PATH` ไม่งั้น service บูตแบบไม่มีค่า config ทั้งชุด (degrade แบบมี warning — ไม่ล้ม แต่ Module F เรียก AI/ต่อฐานไม่ได้จนไฟล์กลับมา) | ต่ำ · service บูตได้เสมอแม้ไฟล์หาย (ฟิลด์ว่าง = `/readyz` รายงานไม่ครบ ไม่มีการเดาค่า) · ผู้ใช้ตัดสินรับข้อจำกัด operation นี้เอง 2026-09-16 | mitigation = **`CURRICULUM_PROD_CONFIG_PATH`** (env override สำหรับกรณี path default resolve ไม่ได้) · พื้นผิว secret **ไม่เพิ่ม**จาก v13 — ไฟล์เดิม plaintext เดิม (RISK-F05 ครอบครอง) · `devops` ยืนยัน path resolve ได้จริงก่อน deploy (ส่วนหนึ่งของ PRE-F01/PRE-F02) · **หมายเหตุเลข**: F23 ถูกใช้แล้วตั้งแต่ v11 (split-brain connection) จึงเลขข้ามมาที่ F25 |
| **DEP-F01** | Module E ต้องเสร็จก่อน Module H **และก่อน Module K** | — | `## Modules` |
| **DEP-F02** | Module F → G → I-a ตามลำดับ | — | `## Modules` |
| **DEP-F03** | Module H ต้องเสร็จก่อน I-b · I-a ต้องเสร็จก่อน I-b · **Module K ต้องเสร็จก่อน Module H** (เปลี่ยนจากรอบที่ 1 ที่ Module H ผูกกับ `CompassPathCatalog` ตรง ๆ ไม่ต้องรอโมดูลคำนวณแยก) | — | `## Modules` |
| **DEP-F04** | Module H และ I-b เปิดใช้จริงไม่ได้จนกว่า Module J เสร็จ ซึ่งรอ `sb-compass` OQ-15 | — | RISK-F04 |
| **DEP-F05** | **Module E แตะไฟล์เดียวกับที่ `sb-compass` Phase 1 กำลัง implement อยู่** (`CompassScoreService.cs`, `CompassApiController.cs`) | — | ต้องประสานลำดับกับ `sb-compass` · `project-manager` ต้องเห็นข้อนี้ตอนวางแผน |
| **DEP-F06** | ไม่ต้องรัน `setup` agent กับ `ClassOnlineWeb` (ระบบมีอยู่แล้ว) **แต่ Curriculum Service เป็นโปรเจกต์ใหม่จริง ๆ** ที่ต้องตั้งจากศูนย์ | — | PRE-F02 · `setup` agent รู้จักแต่ stack Next.js/Prisma จึงใช้กับ service Python นี้ไม่ได้ตรง ๆ |
| **DEP-F07** | **Module K ขึ้นกับการ implement ข้ามโมดูลที่ยังไม่เสร็จ** (RISK-F14 — การตัดสินใจและงานออกแบบปิดหมดแล้วทั้งสองฝั่ง เหลือแค่การสร้างคอลัมน์ + คำนวณจริงที่ `sb-compass` Module C) — เป็น dependency ด้านลำดับงาน ไม่ใช่ technical blocker ภายในโมดูลนี้เอง | — | RISK-F14, DEP-F09, PRE-F09 · `project-manager` ควรวาง Module K เป็น phase ที่แยกอิสระจาก F/G/H/I-a/I-b ไม่ให้ถ่วงงานที่เดินได้ · **และต้องประสานลำดับกับ `plan.md` ของ `sb-compass` (Module C) ข้ามโมดูล** |
| **DEP-F08** ✅ | ~~`sb-compass REQ-005`/`REQ-007` ยังไม่ถูกแก้ให้สอดคล้องกับ 11 cluster~~ — ปิดแล้ว (ถอดตาม trigger ของ `sb-compass` REQ-018) · บันทึกเต็มย้ายไป `design-archive.md` | — | ✅ ปิด |
| **DEP-F09** 🟢 **ออกแบบครบ + คำถามเปิดปิดหมด เหลือ implement** | **ตาราง `public."TCompassLevelSubjectStat"` (พร้อมคอลัมน์ `"StddevScore"`) ยังไม่เคยถูกสร้างในฐานข้อมูลใด ๆ เลย แต่งานออกแบบปิดครบทั้งสองฝั่งแล้ว (2026-08-31)**: ✅ `sb-compass REQ-017` (requirement) · ✅ `sb-compass/design.md` **Contract Version 8** — DDL + `## National Stats Batch Rules` § `"StddevScore"` (สูตร population · กติกา `NULL` vs `0` · กับดัก `EnsureTables` · **ไม่ต้อง migration**) · ✅ กติกา fallback ฝั่งผู้บริโภคเขียนครบใน `## Cluster Determination Rules` ข้อ 2 ของเอกสารนี้แล้ว · ✅ **`sb-compass OQ-18` ปิดแล้ว** — population stddev · `MIN_N_FOR_STDDEV = 30` · ⬜ เหลืออย่างเดียว: **implement จริง** (แก้ `EnsureTables` ให้สร้างตารางด้วยชื่อ/DDL ใหม่ + batch + recompute `?limit=0`) ที่ `sb-compass` Module C | — | RISK-F14, PRE-F09 · **ไม่มีคำถามเปิดค้างแล้วทั้งสองฝั่ง** · **สิ่งที่ยังบล็อกคือตารางต้องถูกสร้างจริงก่อน Module K จะรันได้** (เขียนโค้ดได้แล้ว) |

### Table Naming Convention — ปิดแล้ว ตัวเลือก B (OQ-F10, ปิดแล้ว 2026-08-31 v5)

> **ข้อเท็จจริงเปรียบเทียบ + ตัวเลือก A/B/C ที่เคยพิจารณาและเหตุผลเต็มของการปิด ย้ายไปเก็บที่
> `design-archive.md` แล้ว** ตาม `policies/documentation.md` §4 — เปิดเฉพาะเมื่อต้องการรู้ที่มา

**ผลการปิด**: **27 ตารางใหม่ของโมดูลนี้ → `public."TCompassXxx"` + คอลัมน์ `"PascalCase"` +
index `"IX_..."`/`"UX_..."`** ทั้งหมด (ตรงกับ 3 ตารางเดิมของ `sb-compass` ที่เปลี่ยนไปก่อนหน้านี้แล้ว
ใน Contract Version 8 — ไม่มีตาราง snake_case เหลืออยู่ใน `PGGradeDB` อีกต่อไป) · DDL เต็มอยู่ที่
`## Data Model` · กฎ "ทุก query ต้อง quote ชื่อตาราง/คอลัมน์เสมอ" อยู่ที่ `## Database Ownership
Boundary` § กฎการ quote identifier · `backend-engineer` สร้างตารางตามชื่อใหม่ได้ทันที

---

### WORD-F01 — ข้อกำหนดถ้อยคำของ T-Score ที่แสดงต่อนักเรียน (ผู้ใช้ยืนยัน 2026-08-31)

**สถานะ: เป็นข้อกำหนด ไม่ใช่คำแนะนำ** — เกิดจากการที่ผู้ใช้ปิด RISK-F17/`sb-compass` RISK-09 ด้วย
ทางเลือก **"ปรับคำพูดให้ตรงความจริง"** · เป็นคู่แฝดของ **`sb-compass/design.md` → WORD-01**
(ข้อกำหนดเดียวกัน เขียนไว้ทั้งสองโมดูลเพราะทั้งสองฝั่งมีหน้าจอที่แสดงค่าจากฐานข้อมูลชุดนี้)

| | รายละเอียด |
|---|---|
| **ห้ามใช้** | ถ้อยคำที่สื่อว่าเทียบกับ**นักเรียนทั้งประเทศ** — "เทียบกับทั้งประเทศ" · "ระดับประเทศ" · "ทั่วประเทศ" · "อันดับของประเทศ" หรือคำที่ให้ความหมายเดียวกัน · **รวมถึงคำอธิบาย T-Score ใน REQ-013 ที่ `requirement.md` เขียนว่า "เทียบระดับประเทศ"** |
| **ให้ใช้แทน** | ถ้อยคำที่สื่อว่าเทียบกับ **ฐานข้อมูลนักเรียนในระบบ SchoolBright** · **ถ้อยคำสุดท้ายเป็นของ `uxui-designer`** — เอกสารนี้กำหนดเฉพาะ *ความหมายที่ต้องสื่อ* ไม่ได้เขียน copy ให้ |
| **ครอบจุดไหนในโมดูลนี้** | ทุกที่ที่ T-Score หรือผลที่ได้จากมันปรากฏต่อนักเรียน — หน้าผลจัดอันดับ 11 cluster (Module K/H) · ข้อความอธิบายว่าคะแนนนี้คืออะไร · tooltip/คำอธิบายประกอบ |
| **ใครทำ** | `uxui-designer` (copy) + `frontend-engineer` (นำไปใช้) · `business-analyst` ตรวจว่าไม่อ้างเกินฐานข้อมูลจริง |
| **ไม่ใช่งานของใคร** | **ไม่ใช่ `backend-engineer`** — ไม่เปลี่ยนสูตร ชื่อคอลัมน์ หรือ payload · เป็นชั้นแสดงผลล้วน ๆ |

**ผลต่อ `requirement.md` ของโมดูลนี้**: REQ-013 ใช้คำว่า "เทียบระดับประเทศ" อยู่ —
**เอกสารนี้ไม่แก้ `requirement.md` เอง** (ไม่ใช่ไฟล์ของ `system-analyst`) · บันทึกไว้ให้
`business-analyst` ปรับถ้อยคำใน REQ-013 ให้ตรงกับข้อกำหนดนี้ในรอบถัดไป —
**เป็นการแก้ถ้อยคำให้ตรงความจริง ไม่ใช่การเปลี่ยนกติกาทางธุรกิจ**

---

## Unresolved Open Questions

> **หมายเหตุเรื่องเลข ID (2026-08-31)** — `requirement.md` รอบที่ 2 เพิ่ม OQ-F03/OQ-F04 ของตัวเอง
> ที่ชนกับเลขเดิมของ `design.md` รอบที่ 1 (ซึ่งเคยเป็น "SSO" กับ "ที่เก็บไฟล์ PDF" ตามลำดับ) —
> เอกสารนี้ให้ **OQ-F03/OQ-F04 ตามความหมายของ `requirement.md` เป็นหลัก** (ต้องตรงกันข้ามเอกสาร)
> และ **เปลี่ยนเลขของ 2 ข้อเดิมของ `design.md` เป็น OQ-F08/OQ-F09** แทน — ไม่มีเนื้อหาใดถูกปิดทิ้ง
> เป็นแค่การจัดเลขใหม่เพื่อไม่ให้สับสน

| ID | คำถาม | ใครตอบ | สถานะ |
|---|---|---|---|
| **OQ-F01** | **เกณฑ์การเลือก ~10 สาขาแรกของ KMUTT** (ยกมาจาก `requirement.md`) | ผู้ใช้ | 🟢 **ไม่บล็อกอะไรเลย ยืนยันแล้ว** — เป็นเรื่องเนื้อหาในคลังข้อมูล ไม่กระทบ schema หรือกติกาใด ๆ ในเอกสารนี้ · ตอบตอนเริ่มนำเข้าจริงได้ · **เลื่อนโดยเจตนา ไม่ใช่ตกหล่น** |
| **OQ-F02** ✅ | ~~**ลิขสิทธิ์/เงื่อนไขการนำเอกสารหลักสูตรของมหาวิทยาลัยไปประมวลผลผ่าน AI ภายนอก**~~ **ปิดแล้ว 2026-09-02** (ยกมาจาก `requirement.md`) | ผู้ใช้ (ตอบแล้ว) | ✅ **ปิด — ไม่บล็อก** ผู้ใช้รับความเสี่ยงเอง (2026-09-02): เอกสารหลักสูตรที่โมดูลนี้ใช้เป็นเอกสารสาธารณะที่มหาวิทยาลัยเปิดให้ดาวน์โหลดได้เอง ไม่ใช่เอกสารลับ/ที่ต้องซื้อ จึงไม่มองว่าลิขสิทธิ์เป็นตัวกั้นการส่งให้ `glm-5.2` ประมวลผล — **นี่คือการประเมินความเสี่ยงทางธุรกิจของผู้ใช้เอง ไม่ใช่คำวินิจฉัยทางกฎหมาย/สัญญาอย่างเป็นทางการ** (`requirement.md` → `## References` บันทึกไว้ตรงกัน) · **ไม่ต้องมี `security`/ทีมกฎหมายตรวจก่อนใช้จริงตามที่ผู้ใช้ยืนยัน** — แต่ถ้า `security` ตรวจ Module F แล้วเห็นเหตุผลให้ยกขึ้นมาอีก (เช่นเงื่อนไขเฉพาะของมหาวิทยาลัยใดมหาวิทยาลัยหนึ่งที่ต่างจากสมมติฐานนี้) **ยังเป็นสิทธิ์ของ `security` ที่จะหยิบขึ้นมาระหว่าง audit ได้เสมอ** — การปิดนี้ไม่ใช่การตัดสิทธิ์ตรวจของ `security` ในอนาคต · RISK-F06 ปรับสถานะตามนี้ |
| **OQ-F03** ✅ | **สูตรรวม T-Score (REQ-013) + RIASEC (REQ-012) → 1 ใน 11 interest cluster** (ยกมาจาก `requirement.md` รอบที่ 2) | `system-analyst` เสนอ → **ผู้ใช้ยืนยันแล้ว (2026-08-31)** | **ปิดแล้ว — confirmed ไม่มีการปรับ** — กติกาอยู่ที่ `## Cluster Determination Rules` ข้อ 1+3 (Q&A เดิมย้ายไปที่ `design-archive.md` P-F01/P-F02) |
| **OQ-F04** ✅ | **ผลกระทบต่อ `sb-compass REQ-005` และ `REQ-007`** (ยกมาจาก `requirement.md` รอบที่ 2) | `business-analyst` | **ปิดแล้ว 2026-08-31 — แก้ไขคำตอบ 2026-09-02**: คำตอบเดิม (ถอดโค้ด REQ-005/REQ-007 ทันที ไม่มีช่วง deprecation) **ถูกแทนที่แล้วโดย `sb-compass/requirement.md` REQ-018** — การถอดโค้ดจริงเปลี่ยนเป็น **trigger-based** (N=4 สัปดาห์หลัง REQ-011/REQ-012 ของโมดูลนี้ขึ้น production จริง, N เป็น assumption ของ `business-analyst` ไม่ใช่คำตอบผู้ใช้) **ไม่ใช่ทันที** · **สิ่งที่ไม่เปลี่ยน**: การตัดสินใจว่า REQ-005/REQ-007 ถูกแทนที่แล้วในเชิงธุรกิจ/business logic (เด็กใช้ระบบใหม่ทันทีที่ REQ-011/REQ-012 launch ไม่รันคู่ขนานสองระบบให้เด็กเลือก) — สิ่งที่เปลี่ยนคือ**จังหวะการถอดโค้ด/ตาราง/endpoint ของเดิมออกจากระบบ**เท่านั้น และเพิ่ม **`sb-compass REQ-017`** (`stddev_score`) — ดู DEP-F08/DEP-F09 สำหรับงานที่ยังเหลือฝั่ง `design.md`/`plan.md` ของโมดูลนั้น และ `sb-compass/design.md` DES-009/DES-014 สำหรับสถานะล่าสุดของงานที่ยังต้องคงไว้ระหว่างรอ trigger |
| **OQ-F05** | **นโยบายเก็บไฟล์ต้นฉบับนานแค่ไหน** — เอกสารหลักสูตรเก่าที่ถูกแทนแล้ว เก็บตลอดไปหรือลบเมื่อครบกำหนด | ผู้ใช้ | 🟡 ไม่บล็อก · ดีไซน์ปัจจุบัน **เก็บทุกฉบับตลอดไป** ซึ่งตอบ REQ-001 ("ตรวจย้อนหลังได้ว่าผลมาจากเอกสารฉบับไหน") ได้ครบที่สุด · ถ้าจะจำกัดต้อง amend |
| **OQ-F06** ✅ | **แหล่งที่มาของ `stddev_score` ที่ T-Score ต้องใช้** — 3 ทางเลือก A/B/C ที่เสนอไว้ | ผู้ใช้ | **ปิดแล้ว — เลือกทางเลือก A (2026-08-31)** · `sb-compass REQ-017` ลง requirement แล้ว · **การดำเนินการที่เหลือ (design/implement + `sb-compass OQ-14`) ติดตามที่ DEP-F09/RISK-F14 ไม่ใช่ที่นี่** (Q&A เดิมย้ายไปที่ `design-archive.md` P-F04) |
| **OQ-F07** ✅ | **ยืนยันตารางน้ำหนัก `public."TCompassClusterSubjectWeight"` (11×8) และ `public."TCompassClusterRiasecWeight"` (11×6)** ที่ `system-analyst` ร่างจากคำอธิบายเชิงคุณภาพของ `education-pathway-taxonomy-design.md` | ผู้ใช้ | **ปิดแล้ว — sign-off ให้ใช้ค่าที่ร่างไว้ได้ (2026-08-31)** — ยังคงมาร์กเป็นสมมติฐานไม่มีแหล่งอ้างอิงภายนอกต่อไปตาม RISK-F15 (Q&A เดิมย้ายไปที่ `design-archive.md` P-F03) |
| ~~**OQ-F08**~~ (เดิมชื่อ OQ-F03 ในรอบที่ 1) | **ปิดแล้ว 2026-09-15** — ผู้ใช้ยืนยันใช้ระบบ **Staff/Admin Login เดิมของ SchoolBright** ไม่ต้องทำ SSO หรือ Auth Provider แยกใหม่ · `backend-engineer` และ `devops` ยึด Admin Session/Token ของระบบ SchoolBright เดิม (กติกาอยู่ที่ `## DES-023 — Admin & Review Rules` ข้อ 4) | ผู้ใช้ (ยืนยันตรง 2026-09-15) | ✅ **ปิด — ปลดบล็อก Module G และ I-a** |
| ~~**OQ-F10**~~ ✅ *(เปิด 2026-08-31 · ข้อเท็จจริงแก้ v4 · ปิดแล้ว v5)* | **โมดูลนี้ควรตั้งชื่อตาราง/คอลัมน์ตาม convention ไหน** — `schoolbright-backend` ใช้ `public."T<PascalCase>"` + คอลัมน์ `"PascalCase"` + index `"IX_..."` **อย่างสม่ำเสมอทุกตารางใหม่ ไม่มีข้อยกเว้น** (หลักฐาน + path จริงอยู่ใน `## Data Model` ย่อหน้าแรก) · **v4: ข้อสันนิษฐานเดิมที่ว่า 3 ตารางเดิมของ `sb-compass` "เปลี่ยนชื่อไม่ได้ฟรี ๆ" ไม่จริง** — `sb-compass/design.md` Contract Version 8 ยืนยันว่าทั้งสามตารางไม่เคยถูกสร้างในฐานข้อมูลใด ๆ เลย และเปลี่ยนชื่อเป็น PascalCase ไปแล้วโดยไม่ต้อง migration | **ผู้ใช้** | **ปิดแล้ว (2026-08-31): ตัวเลือก B** — ทั้ง 27 ตารางใหม่ของโมดูลนี้เปลี่ยนเป็น `public."T<PascalCase>"` + คอลัมน์ `"PascalCase"` + index `"IX_..."` แล้ว ตรงกับ 3 ตารางเดิมของ `sb-compass` ที่เปลี่ยนไปก่อนหน้านี้ · DDL เต็มอยู่ที่ `## Data Model` · กติกาการ quote identifier อยู่ที่ `## Database Ownership Boundary` § กฎการ quote identifier · **`backend-engineer` เริ่มสร้างตารางตามชื่อใหม่ได้แล้ว** · ✅ **ปิด — ไม่มีตารางไหนในโมดูลนี้เหลือ snake_case อีกต่อไป** |
| **OQ-F11** ✅ *(v6, 2026-08-31 · ปิด 2026-09-02)* | ~~**แบบทดสอบ RIASEC รูปแบบผสม — 4 จุดที่ผู้ใช้ยังไม่ได้ตัดสิน**~~ **ปิดแล้ว (ก)(ข)(ค) — ปฏิเสธ (ง)** — ข้อความเต็มตอนที่ยังเปิดอยู่ย้ายไป `design-archive.md` แล้ว | ผู้ใช้ (ตอบแล้ว 2026-09-02) | ✅ **(ก)(ข)(ค) ปิด — ยืนยันตามที่เสนอทั้งหมด**: `W_LIKERT=W_RANK=1` · การแปลงอันดับเชิงเส้นระยะห่างเท่ากัน · ทุกมิติต้องมีคำถามครบสองรูปแบบ — implement สูตร `## RIASEC Fit Rules` ข้อ 3.4 ได้เต็มแล้ว · ❌ **(ง) ถูกปฏิเสธ — กติกาเดิม "ต้องตอบครบ 100% จึงส่งได้" ยังคงอยู่ ห้ามส่งไม่ครบ** ผลคือเกณฑ์ Confidence เดิม (อ้างอิง % ความครบ) ไม่มีทาง trigger ได้จริงอีกต่อไป → `system-analyst` re-scope กลไก Confidence ใหม่ ดู OQ-F13 |
| **OQ-F12** ✅ *(v6, 2026-08-31 · ปิด 2026-09-02)* | ~~**ค่าคงที่ของ `ClarityIndex`/`ClarityBand` (relative/adaptive scoring)**~~ **ปิดแล้ว** — ข้อความเต็มตอนที่ยังเปิดอยู่ย้ายไป `design-archive.md` แล้ว | `system-analyst` เสนอ → **ผู้ใช้ยืนยัน (2026-09-02)** | ✅ **ปิด — implement เต็มแล้ว** ผู้ใช้อนุญาตให้ `system-analyst` เลือกค่าเริ่มต้นทางวิศวกรรมทั้ง 6 ตัวเอง: `SD_REF=15`, `GAP_REF=10`, `W_SD=1`, `W_GAP=1`, `CLARITY_HIGH=70`, `CLARITY_LOW=40` (engineering default บันทึกไว้เปิดเผยที่ `## Cluster Determination Rules` ข้อ 6.4-6.5 — ไม่มีแหล่งอ้างอิงภายนอก) · RISK-F19 ส่วนของข้อ 6 ปิดแล้ว |
| **OQ-F13** 🟡 *(v6, 2026-08-31 · ตอบแล้ว แต่ปิดแบบ re-scope 2026-09-02 — ไม่ใช่ "ปิดตรง ๆ")* | ~~**ค่าคงที่ของ Confidence shrinkage**~~ **ตอบแล้ว แต่การปฏิเสธ OQ-F11(ง) ทำให้เงื่อนไขเดิม ("ตอบน้อยกว่า 50%") ไม่มีทาง trigger ได้จริงกับผลที่ส่งสำเร็จแล้ว** — ข้อความเต็มตอนที่ยังเปิดอยู่ย้ายไป `design-archive.md` แล้ว | `system-analyst` เสนอ → **ผู้ใช้ยืนยัน (2026-09-02)** | 🟡 **ปิดแบบ re-scope — ไม่ใช่แค่เลือกตัวเลข**: `system-analyst` ใช้สิทธิ์ที่ผู้ใช้มอบไว้ re-scope ตัวชี้วัด Confidence จาก "% ความครบ" → "ความสอดคล้องข้ามรูปแบบคำตอบ (`ConsistencyScore`)" เก็บโครงสูตร shrinkage เดิมไว้ (`## Cluster Determination Rules` ข้อ 7 เขียนใหม่ทั้งข้อ) · ค่าคงที่ 3 ตัวเดิมปิดแล้วเป็น engineering default: `NEUTRAL_SCORE=50`, `CONF_F_MIN=0.5`, `CLARITY_F_MIN=0.5` · **แต่ threshold ของตัวชี้วัดใหม่ (`CONSISTENCY_MIN`) เป็นค่าใหม่ที่ OQ-F13 เดิมไม่ครอบคลุม — เปิดคำถามใหม่ OQ-F16** ไม่ใช่สิ่งที่ `system-analyst` ปิดเองแบบเงียบ ๆ |
| ~~**OQ-F16**~~ | **ปิดแล้ว 2026-09-15** — **`CONSISTENCY_MIN = 0.60`** (ค่าเริ่มต้นทางวิศวกรรม / Engineering Default ที่ `system-analyst` กำหนดตามที่ผู้ใช้มอบสิทธิ์ 2026-09-15) · บันทึกที่ `## DES-022 — Cluster Determination Rules` ข้อ 7.3 · ปลดบล็อกการคำนวณ `"DisplayScore"` และชั้นแสดงผลข้อ 7.5 เต็มรูปแบบ | `system-analyst` (ผู้ใช้มอบสิทธิ์ 2026-09-15) | ✅ **ปิด — ปลดบล็อก `"DisplayScore"`** |
| **OQ-F09** (เดิมชื่อ OQ-F04 ในรอบที่ 1) | **ที่เก็บไฟล์ PDF ต้นฉบับ** — ใช้ Huawei OBS bucket เดิม (`onlineclassroom-system`) แต่คนละ prefix, สร้าง bucket ใหม่, หรือใช้ที่เก็บอื่นของ Curriculum Service · **ห้ามใช้ `AzureUploadFile` ของเดิมไม่ว่ากรณีใด** (hardcode AK/SK + รับ `studentid` ที่ไม่ตรงบริบท) | ผู้ใช้ + `devops` | 🟡 บล็อก Module F เฉพาะส่วนเก็บไฟล์ · ส่วนที่เหลือของ F เดินได้ |
| **OQ-F17** ✅ *(v9, 2026-09-15 · ปิด v11 2026-09-16)* | ~~**ความกว้างของ integer PK ของตารางที่การเปลี่ยน PK รอบนี้ "ไม่แตะ"** — `## Data Model` ระบุ `bigserial`/`bigint` (`ProgramID`, `SourceID`, `IntakeID`, `QuestID`, `QuestionID`, `BlockID`, `OptionID`, `ResultID`, `RunID`, `AttemptID`, `TargetID`) แต่สคริปต์ bootstrap ที่รันจริงสร้างเป็น `serial`/`integer` (int4) ทุกตัว~~ | ผู้ใช้ (ตอบผ่านหน้าคำถามตรง 2026-09-16) | ✅ **ปิด — ยึด DDL จริง (`serial`/`integer`)** · `## Data Model` แก้ DDL ทั้งชุดเป็น `serial`/`integer` แล้วในรอบ v11 · **เอกสารตรงกับฐานข้อมูลจริงสมบูรณ์** (รวมกับ RISK-F22 ที่ reconcile แล้ว) · `backend-engineer` ห้าม `ALTER TABLE` เปลี่ยนความกว้างเอง — ทั้งสองฝั่งเป็น `serial`/`integer` เดียวกันแล้ว |
| ~~**OQ-F14**~~ | **ปิดแล้ว 2026-09-15** — จำนวนเป้าหมายที่ Active ได้พร้อมกัน = **สูงสุด 1 รายการต่อคน** (AC-017.4) · การตั้งเป้าหมายใหม่จะทำการ supersede เป้าหมาย active เดิมของนักเรียนคนนั้นโดยอัตโนมัติ · บังคับด้วย index `"UX_TCompassTargetProgram_Active_Student"` และตรรกะ service ใน `## DES-021 — Target Major Rules` | ผู้ใช้ (ยืนยันตรง 2026-09-15) | ✅ **ปิด — ปลดบล็อก BE-041/BE-042/BE-051** |
| **OQ-F15** 🆕 *(v7, 2026-09-02)* | **หน้าตา/ตำแหน่งของปุ่ม "ตั้งเป็นเป้าหมาย"** และข้อความตอนกดไม่ได้ (นำทางไปหน้า RIASEC อย่างไร) — `requirement.md` REQ-017 ระบุเองว่าไม่ได้กำหนดรูปแบบ UI | `uxui-designer` | 🟡 **ไม่บล็อก backend/gate** · บล็อกเฉพาะงาน `frontend-engineer` ของ Module I-b ส่วน REQ-017 — **เป็น handoff ไปยัง `uxui-designer` ตามปกติของโมดูลนี้ (เทียบ OQ-16 ของ `sb-compass`) ไม่ใช่คำถามที่ต้องสัมภาษณ์ผู้ใช้ใหม่** |
| **OQ-F18** ✅ *(v11, 2026-09-16 · ตั้งและปิดในวันเดียวกัน)* | ~~**ยืนยันเมทริกซ์น้ำหนัก 11×8 / 11×6 ฉบับ `## DES-022` §4a** — ชุดเดิมที่ sign-off 2026-08-31 (OQ-F07) ไม่เคยถูกบันทึกลงไฟล์ใด สคริปต์ bootstrap จึงปฏิเสธเดาค่าเอง (บรรทัด 579-585)~~ | ผู้ใช้ (ตอบผ่านหน้าคำถามตรง 2026-09-16) | ✅ **ปิด — ผู้ใช้มอบสิทธิ์ให้ `system-analyst` เลือกค่าเองแบบ OQ-F12/OQ-F16** → ค่าใน §4a เป็น **engineering default ที่ยืนยันแล้ว** · **ปลดล็อก INSERT seed ตารางน้ำหนัก (PRE-F07)** → ปลดบล็อก `InterestFit` ทุก cluster · RISK-F15 (สมมติฐานไม่มีแหล่งอ้างอิงภายนอก) **ยังคงอยู่** — การมอบสิทธิ์ไม่ยกระดับค่าเป็นข้อเท็จจริง |
| **OQ-F19** ✅ *(v11, 2026-09-16 · ตั้งและปิดในวันเดียวกัน)* | ~~**อนุมัติเพิ่มคอลัมน์ `"CreditMean"`/`"CreditSd"`/`"CompositeMean"`/`"CompositeSd"` ที่ `public."TCompassLevelSubjectStat"`** — schema change บนตารางของ `sb-compass`~~ | ผู้ใช้ (ตอบผ่านหน้าคำถามตรง 2026-09-16) | ✅ **ปิด — เลือกทางเลือก A (ขยายตาราง +4 คอลัมน์) คงสูตร 60/40 ตาม OQ-F03** · เหลือเป็น **งานตามลำดับ ไม่ใช่คำถามเปิด**: (1) `business-analyst` ของ `sb-compass` ขยาย `sb-compass REQ-017` หรือเปิด REQ ใหม่ (2) `system-analyst` ฝั่งนั้น amend DDL/batch contract ตามสูตรใน §1a (3) implement + recompute `?limit=0` — ติดตามแบบเดียวกับ DEP-F09/PRE-F09 |

**เรื่องที่ปิดไปแล้ว ห้ามยกขึ้นมาเสนอใหม่** (จาก `requirement.md` และรอบวิเคราะห์นี้ — บันทึกไว้เพื่อไม่ให้เสียรอบ):
role ครู/แนะแนว/ผู้ปกครอง/ผู้บริหาร · การส่งข้อมูลเด็กออกไปให้ AI ภายนอก · การใช้/ขยาย `sb-compass
REQ-008` มาทำ quest · คำถามพฤติกรรมแยกชุดตามสาขา · การเก็บค่าเทอม/จำนวนรับ/คะแนนขั้นต่ำ/รอบ TCAS ·
bookmark/เปรียบเทียบสาขา · การเปิดคำถาม consent ใหม่ ·
**การใช้ pgvector/embedding แทนเวกเตอร์แกนพฤติกรรม** (ตัดแล้วเพราะให้ตัวเลขตัวเดียว บอกไม่ได้ว่าแกนไหน
ชนกัน — เหตุผลเดียวกันนี้ยังใช้ได้กับ RIASEC ของรอบที่ 2: การ embed คำตอบเด็กด้วยบริการภายนอกผิด REQ-010) ·
**การใช้ .NET PDF library แทน markitdown** (ตัดแล้วเพราะไม่มีทางต่อ OCR ซึ่งจำเป็นเมื่อมีหลายมหาวิทยาลัย) ·
**การแทนที่สายการเรียน 8 สายเดิมด้วยคณะจริงทั้งหมด** (Declined เดิม 2026-08-26 — เปิดใหม่แล้วแต่
กลายเป็น "แทนที่ด้วย 11 interest cluster" ตาม REQ-011 ไม่ใช่ "คณะจริงทั้งหมด" ตามที่เคยขอ — อย่าเสนอ
แบบเดิมอีก)

---

## Change Log

- (v10→v11 · v11→v12 · v12→v13 · 2026-09-16) ย้ายไปเก็บที่ `design-archive.md` § Change Log แบบ verbatim แล้ว (ตาม `policies/documentation.md` §4) — กติกาที่ยังใช้อยู่อยู่ครบใน Contract sections ของเอกสารนี้ · สัญญาปัจจุบันคือ v14

> รายการ Change Log ของ Contract Version 1-10 ย้ายไปเก็บที่ `design-archive.md` แล้ว (2026-09-16, รอบ v11) ตาม `policies/documentation.md` §4 — ย้ายแบบคำต่อคำ ไม่มีการตัดทอน · เหลือไว้ที่นี่เฉพาะรายการของเวอร์ชันปัจจุบัน

- **2026-09-16: v13 -> v14 — ผู้ใช้ตัดสินปรับกลไกส่งค่า config: Curriculum Service อ่าน `prod.config` เองโดยตรง ไม่มีขั้น env-injection** · bump version เพราะเปลี่ยนกลไกส่งค่าของสัญญา config (แหล่งความจริงคงเดิมตาม v13 — เปลี่ยนวิธีที่ค่าไหลเข้า service):
  **คำตอบของผู้ใช้ (2026-09-16, แจ้งตรง — หลังได้ยินคำอธิบายเรื่อง source-of-truth)**: "ให้ อ่านจาก prod.config แทนสิ" — Curriculum Service
  อ่าน `ClassOnlineWeb/prod.config` เอง · การตัดสินนี้**ปรับแต่ง v13 ไม่ใช่ทับ**: v13 คง `prod.config` เป็นแหล่งความจริงแต่ยังส่งค่าด้วย env
  `CURRICULUM_*` ตอน launch — รอบนี้ขั้น env-injection ถูกตัดออกทั้งขั้น · **ความเชื่อมโยงที่ผู้ใช้รับไว้ (accepted coupling)**: service ต้อง
  เข้าถึงไฟล์ prod.config ได้จากที่ deploy ทุกที่ — ที่ deploy ของ PRE-F02 ยังเปิด ถ้า deploy นอกเครื่อง `CURRICULUM_PROD_CONFIG_PATH` ต้องชี้
  สำเนาไฟล์ที่ sync (ข้อจำกัด operation นี้ผู้ใช้รับเอง — RISK-F25)
  **กลไกที่ตกลงกัน (engineering spec)**: แหล่ง pydantic-settings ใหม่พาร์ส XML `<appSettings>` ของ prod.config — `ApiKey`→`glm_api_key` ·
  `Endpoint`→`glm_endpoint` · `Model`→`glm_model` · `Curriculum_DatabaseUrl`→`database_url` · `Curriculum_PdfStoreEndpoint`→`pdf_store_endpoint` ·
  path: env `CURRICULUM_PROD_CONFIG_PATH` ทับ ไม่งั้น resolve `<repo-root>\ClassOnlineWeb\prod.config` จากตำแหน่ง package · ลำดับค่า: env
  `CURRICULUM_*` ที่ตั้งชัดเจน > XML ของ prod.config > `.env` (legacy local mirror) > defaults · ค่าว่างใน XML = ยังไม่ตั้งค่า · ไฟล์หาย =
  degrade แบบมี warning ฟิลด์ไม่มีค่า — service บูตได้ก่อน `ClassOnlineWeb` จะมีอยู่บนเครื่อง
  **Interface ไม่เปลี่ยน**: ชื่อฟิลด์ · `/readyz` รายงาน presence-only · guard DSN ว่างของ migrator
  **ส่วนที่แก้ในรอบ v14**: (1) banner v14 + Contract Version 13 → 14 + ขีดฆ่าวลีกลไก env-injection ใน banner v13 (2) Feasibility บล็อก 1 —
  ขีดฆ่า "`devops` ฉีดเป็น env ตอน launch" → v14 (3) `## DES-019` §1 — ขีดฆ่าวลี injection ของ note v13 แทนด้วย v14 (4) Module F Security
  Considerations ข้อ (3) — กลไก v14 + พื้นผิวเข้าถึงไฟล์ที่รับไว้โดยเจตนา (accepted file-access surface ให้ `security` เห็นชัดใน audit ถัดไป) (5)
  `## DES-024` — **PRE-F01 เขียนกลไกใหม่ตาม v14** (เจ้าของคงเดิม ผู้ใช้ + `devops` · **เงื่อนไขบล็อกคงเดิม**: ผู้ใช้เติม `ApiKey` + `Endpoint` ·
  งาน devops แคบลงเหลือ deploy ให้ path resolve ได้ / ตั้ง `CURRICULUM_PROD_CONFIG_PATH` · **PRE-F10 ยังเป็นงานแยกของตัวเอง**) (6) RISK-F05 —
  addendum v14 (การอ่านไฟล์ตรง **ไม่เพิ่มพื้นผิว secret ใหม่** — ไฟล์เดิม plaintext เดิม USER RISK ACCEPTANCE ครอบครองเหมือนเดิม) · เพิ่ม
  **RISK-F25** (file-path coupling · Minor · accepted by user decision 2026-09-16 · mitigation = `CURRICULUM_PROD_CONFIG_PATH`) — **เลข F23 ถูก
  ใช้แล้วตั้งแต่ v11 (split-brain connection) จึงเลขข้ามมาที่ F25** (7) เพิ่มหลักฐาน **EVD-041/EVD-042** — engineer run วาง `curriculum_service\settings.py` ฉบับ v14 ระหว่างรอบ amend นี้ และ
  ยืนยันจากการอ่านไฟล์จริง (อ่านอย่างเดียว — Target เป็นของ DEV, revision `b7747bd5`) แล้วว่าตรง spec: แมป `_PROD_CONFIG_KEY_MAP`
  (settings.py:85-91) · path `CURRICULUM_PROD_CONFIG_PATH` ทับได้ + resolve จากตำแหน่ง package ไม่ขึ้น CWD (settings.py:111-116 ·
  218-221) · degrade แบบมี warning ไม่ crash เมื่อไฟล์หาย/พัง และ**ไม่ log ค่า** (settings.py:119-152) · ลำดับค่า env > XML > `.env` >
  defaults + กติกาค่าว่างทุกชั้น (settings.py:241-257) · interface คงเดิม: ฟิลด์เดิม + additive `glm_endpoint`/`glm_model`
  (settings.py:228-239) — `qa-engineer` ยังต้อง verify ตามรอบปกติ
  **สิ่งที่ยังคงเดิม ไม่เปิดใหม่**: แหล่งความจริงเดียว = `prod.config` (มติ v13) · การแยกสอง codebase · ห้าม hardcode คีย์ในซอร์สทุกไฟล์ · secret
  ไม่ถูก log เด็ดขาด (`/readyz` presence-only) · `ClassOnlineWeb` ยังไม่มีโค้ดเรียก AI เด็ดขาด (service เรียกตอน import เท่านั้น — `## DES-019` §1) ·
  เงื่อนไขบล็อก implement Module F = ผู้ใช้เติม `ApiKey` + `Endpoint` · **Compatibility: additive-internal** (เปลี่ยนกลไกส่งค่า — ไม่แตะ
  schema/ตาราง/สูตร/interface ใด)
  **งานที่ relay/รายงาน (ไม่แก้จากที่นี่)**: `plan.md` relay แยกต่างหาก (รอบนี้ไม่แตะ) · ฝั่ง DEV: `curriculum-service/curriculum_service/settings.py`
  ฉบับ v14 ตกไฟล์แล้วระหว่างรอบ amend นี้ (engineer run ขนาน) — ยืนยันจากการอ่านจริงแล้วว่าตรง spec ทั้งหมด (ดูข้อ (7)) · ไฟล์ยังสถานะ untracked
  (ยังไม่ commit — เป็นงานของ DEV เท่านั้น ไม่แตะจาก Knowledge)

