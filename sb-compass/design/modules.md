# sb-compass — Modules

## Modules

### Module A: Score Aggregation (REQ-012)
**ครอบคลุม**: DES-002 · แก้ `CompassScoreService` เพิ่มเมธอดถ่วงน้ำหนักแยกจากของเดิม + fallback · ปรับปรุงการปัดเศษฝั่ง Premium ให้เป็นทศนิยม 2 ตำแหน่งทุกจุดรวมถึง Gap Report (`CompassPathCatalog.BuildAdvice` / `VMGapItem` — ปิด ISS-01)
**ตาราง/โมเดลที่แตะ**: ไม่มี schema change · อ่าน `PGTGradeDetail.nCredit`, `TPlane.nCredit`
**Dependency**: ไม่มี — เริ่มได้ทันที **เป็น module ที่ต้องเสร็จก่อน C และ D**
**สัญญาที่ต้องอ่าน**: `## Subject Score Aggregation Rules`
**ไม่ใช่ sensitive** — เป็นการคำนวณล้วน ไม่แตะสิทธิ์และไม่รับ input จากภายนอก

### Module B: Premium Entitlement & API Authorization (REQ-013, REQ-014, REQ-015) 🔒
**ครอบคลุม**: DES-004, DES-005, DES-006, DES-008, DES-009
**Dependency**: ไม่ขึ้นกับ A · **เริ่มได้ทันที** (v2 — OQ-14 ปิดแล้ว feature key มีชื่อชัดเจนแล้ว)
· deploy ต้องรอ PRE-01/02/03 (ดู `## Deployment Prerequisites`) · **v9: และ PRE-06 (schema) ก่อน PRE-01/02**
· **v3 (2026-08-25)**: งานส่วน `CheckEntitlement` (BE-004 และทุก task ที่ต่อจากมัน) **ต้องรอ BE-013
ยืนยันชื่อคอลัมน์กับ DB จริงก่อน** เพราะยังไม่ทราบว่าคอลัมน์ไหนเก็บ feature key (OQ-15(a))
· 🔴 **v4 (2026-08-25) — แก้ความเข้าใจของ v3**: BE-013 **ตอบข้อนี้ไม่ได้** · รายการคอลัมน์ถูกยืนยัน
ครบแล้วและ **ไม่มีคอลัมน์ key แบบ string อยู่จริง** → สิ่งที่ค้างคือ**การตัดสินกลไก** (OQ-15(a1))
และค่าที่ต้องเทียบตามกลไกนั้น (OQ-15(a2)) ซึ่งเป็นการตัดสินใจของผู้ใช้ + ทีม SB PLUS
**BE-004 จึงบล็อกที่ OQ-15(a1)/(a2) ไม่ใช่บล็อกที่ BE-013**
· 🟡 **v9 (2026-09-01) — OQ-15(a1) ตัดสินแล้ว (เพิ่มคอลัมน์ `"FeatureCode"`) แต่ BE-004 ยังบล็อกเหมือนเดิม**
เพราะคอลัมน์ยังไม่มีอยู่จริง (รอ **PRE-06**) และ OQ-15(a2) ยังไม่มีค่า **BE-004 ขั้นตอนที่ 4 และ
BE-005/006/007/012 จึงยังเป็น `pending` เหมือนก่อนรอบนี้ทุกประการ** · **v10 (2026-09-01): แก้ชื่อ
คอลัมน์เป็น `"FeatureCode"` (PascalCase) แทน `feature_code` (snake_case) — เป็นการแก้ชื่อเท่านั้น
ไม่กระทบสถานะบล็อก**
· ส่วนที่**ไม่ติดข้อนี้และเริ่มได้ทันทีจริง ๆ**: BE-008 (IP allowlist) และ BE-009/010/011 (identity fix)
**สัญญาที่ต้องอ่าน**: `## Premium Entitlement Rules`, `## Identity & Scope Rules`

**Sensitive concern: authorization / broken access control / personal data**
เป็น module ที่ปิดช่องโหว่ 3 ข้อพร้อมกัน จึงเป็นจุดที่พลาดแล้วเสียหายที่สุดใน module นี้

**Security Considerations**:
ขอบเขตความไว้วางใจคือ **ทุกอย่างที่มาจาก HTTP request เป็นข้อมูลที่เชื่อไม่ได้** — รวมถึง `SID`
ใน request body และ flag Premium ฝั่ง client · ข้อมูลที่ปกป้องคือ **คะแนนสอบและผลวิเคราะห์
รายบุคคลของผู้เยาว์** ซึ่งเป็นข้อมูลส่วนบุคคลที่อ่อนไหว · failure mode มี 3 แบบที่ต่างกัน:
(1) **IDOR** — ถ้าอ่าน `SID` จาก client ผู้ใช้แก้เลขใน request แล้วดูผลของเด็กคนอื่นได้ทันที
(2) **สิทธิ์รั่ว** — ถ้า entitlement fail-open เวลา DB มีปัญหา คนไม่จ่ายเงินได้ข้อมูล Premium ฟรี
และจะไม่มีใครสังเกตเพราะระบบยังทำงานปกติ
(3) **ทำลายข้อมูลทั้งเครือข่าย** — `recompute` สั่ง `TRUNCATE` สองตาราง ถ้ากั้นไม่พอ
ผู้ใช้คนเดียวลบสถิติของทุกโรงเรียนได้ และไม่มี audit log ว่าใครสั่ง
**การป้องกันที่กำหนดไว้**: identity จาก JWT เท่านั้น · fail-closed ทุกกรณีที่ตรวจสิทธิ์ไม่ได้ ·
raw SQL ต้องใช้ `NpgsqlParameter` เท่านั้น (ห้ามต่อ string — DB นี้เข้าถึงข้อมูลทั้งเครือข่าย) ·
`recompute` ต้องผ่าน **สองชั้น**: feature key `compass_admin_ops` (คนละตัวกับ `compass_premium`)
**และ** IP/internal-network allowlist — ห้ามตัดชั้นใดชั้นหนึ่งออก

### Module C: National Stats Alignment (REQ-004 × REQ-012 · **+ REQ-017 ใน v5** · **+ DES-012 ใน v7**)
**ครอบคลุม**: DES-003, **DES-011**, **DES-012** · แก้ `CompassRankingService` ทั้ง batch และ request-time
**Dependency**: **ต้องรอ Module A เสร็จก่อน** (ใช้เมธอดถ่วงน้ำหนักที่ A สร้าง)
**สัญญาที่ต้องอ่าน**: `## National Stats Batch Rules` (**รวมหัวข้อย่อย `"StddevScore"` ที่เพิ่มใน v5**)
· **v7: `## Data Model` กลุ่มที่ 1 ทั้งหัวข้อ** (DDL ใหม่ + ตารางแปลงชื่อ + กฎการ quote identifier)
**ไม่ใช่ sensitive ในตัวเอง** — แต่ endpoint ที่สั่งงานมันถูกกั้นใน Module B
**หมายเหตุ deploy**: module นี้เป็นตัวที่บังคับให้ต้อง recompute หลัง deploy

**งานส่วน REQ-017 (v5 · ชื่อคอลัมน์แก้ใน v7)**:
`ALTER TABLE public."TCompassLevelSubjectStat" ADD COLUMN IF NOT EXISTS "StddevScore" double precision NULL`
ใน `EnsureTables` · คำนวณ stddev พร้อม `"MeanScore"` ในรอบเดียว · เขียนลง `INSERT` เดิม (`:411`)
**เริ่มได้ทันทีเมื่อ Module A เสร็จ — ✅ OQ-18 ปิดแล้ว (2026-08-31) ไม่มีคำถามเปิดค้าง**:
สูตร = population stddev (หาร `n`) · `MIN_N_FOR_STDDEV = 30` · โครงคอลัมน์ · กติกา NULL/0
กำหนดครบทั้งหมดใน `## National Stats Batch Rules` § `"StddevScore"`
**ผู้บริโภคปลายทางคือ `sb-compass-faculty-match` Module K** ซึ่งรอ column นี้อยู่ (DEP-F09 ของโมดูลนั้น)

**งานส่วน DES-012 (v7 — การเปลี่ยนชื่อตาราง/คอลัมน์)**: อยู่ใน Module C เพราะ Module C เป็นเจ้าของ
`CompassRankingService` อยู่แล้ว **แต่ขอบเขตกว้างกว่า Module C ปกติหนึ่งจุด — มันแตะ
`CompassMbtiStore.cs` ด้วย** ซึ่งไม่ได้อยู่ใน DES-003/DES-011 · เนื้องาน:
1. `CompassRankingService.cs` — 19 จุด (`EnsureTables` 3 คำสั่ง · `TRUNCATE` 2 · `INSERT` 2 ·
   `SELECT` ที่เหลือ) เปลี่ยนเป็นชื่อใหม่พร้อม quote ครบ
2. `CompassMbtiStore.cs` — 3 จุด (`EnsureTable` · `INSERT ... ON CONFLICT` · `SELECT`)
   · **ระวัง `ON CONFLICT ("SchoolID", "SID") DO UPDATE SET` ต้อง quote ทุกคอลัมน์ในนั้นด้วย**
**v8: ไม่มีข้อ 3 (สคริปต์ rename) อีกต่อไป** — ทั้งสามตารางยังไม่เคยถูกสร้างในฐานข้อมูลใด ๆ เลย
จึงไม่มีตารางเดิมให้ rename · `EnsureTables`/`EnsureTable` ที่แก้แล้วสร้างตารางชื่อใหม่ตรง ๆ ก็พอ
**ลำดับที่ปลอดภัย**: ทำ DES-012 **ก่อน** DES-011 หรือทำพร้อมกันในรอบเดียว — **ห้ามเขียน
`stddev_score` snake_case ลงไปก่อนแล้วค่อยตามแก้** เพราะจะได้ตารางที่มีคอลัมน์สองสไตล์ปนกัน
ซึ่งเป็นสิ่งที่การตัดสิน OQ-19 ตั้งใจกำจัด
**ยังไม่ sensitive** แต่ **เป็นงานที่ `qa-engineer` ต้องตรวจแบบครบทุกจุด** — พลาดจุดเดียว = query
พังตอน runtime โดย build ผ่าน (ดู RISK-10)

### Module D: Premium Subject Breakdown (REQ-016)
**ครอบคลุม**: DES-007 · เพิ่ม `VMCourseBreakdown` + เติมข้อมูลใน `calculate/score` + หน้าจอ
**Dependency**: **ต้องรอ Module A** (ใช้ค่าถ่วงน้ำหนัก) และ **ต้องรอ Module B** (breakdown เป็นข้อมูล
Premium ห้ามหลุดให้ผู้ไม่มีสิทธิ์ — REQ-016 AC5)
**สัญญาที่ต้องอ่าน**: `## Premium Subject Breakdown Contract`

**Sensitive concern: personal data exposure**
**Security Considerations**: breakdown เปิดเผยข้อมูลละเอียดกว่าที่เคยเปิด — จากเดิมเห็นแค่คะแนน
กลุ่มสาระ กลายเป็นเห็นรายวิชา คะแนนดิบ และหน่วยกิตรายเทอม · failure mode คือถ้า field ใหม่ถูกเติม
ก่อนการตรวจสิทธิ์ (เช่นสร้าง object เต็มแล้วค่อยกรอง) ข้อมูลอาจหลุดผ่าน response ที่ควรถูกกั้น
→ ต้องตรวจสิทธิ์ **ก่อน** ประกอบ payload ไม่ใช่ประกอบแล้วค่อยตัดออก

### การตัดสินใจเรื่องการแบ่ง module

แบ่งเป็น 4 modules **ไม่ใช่ก้อนเดียว** เพราะมี dependency ที่บังคับลำดับจริง (A → C, D และ B → D)
และเพราะ **Module B มีเงื่อนไขการ deploy ที่อีก 3 ตัวไม่มี** (ต้องรอ SB PLUS สร้าง feature key
และตั้ง IP allowlist — PRE-01/02/03) ถ้ารวมเป็นก้อนเดียว งานที่ deploy ได้ทันที (A, C)
จะถูกถ่วงให้รอการตั้งค่าระบบภายนอกโดยไม่จำเป็น
**ทั้ง 4 ยังอยู่ใน module folder เดียวกัน** (`_docs/module/sb-compass/`) — เป็นผลิตภัณฑ์เดียวกัน
ที่ถูกสร้างต่อทีละส่วน ไม่ใช่ delivery unit แยก ตาม `policies/documentation.md` §1


Back-links: `design\index.md`
