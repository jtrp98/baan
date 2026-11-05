# SB Compass (เข็มทิศเส้นทางการเรียน) — Feasibility & Design

**Contract Version:** 16

Design evidence format: 1

> **หมายเหตุเรื่อง stack — อ่านก่อนใช้เอกสารนี้**
> `CLAUDE.md` สรุป stack ของ pipeline ไว้เป็น Next.js + Express + Prisma แต่ **ระบบจริงของ module นี้
> ไม่ใช่ stack นั้น** — `sb-web-student/ClassOnlineWeb` เป็น **ASP.NET MVC 5 + Web API 2 บน
> .NET Framework 4.8 · Entity Framework 6.5.1 · Razor `.cshtml` + jQuery · PostgreSQL ผ่าน Npgsql**
> (ยืนยันจาก `ClassOnlineWeb.csproj`) และไฟล์ที่ `policies/coding.md` §9 กำหนดให้เป็นแหล่งความจริงของ
> stack (`.claude/agents/frontend-engineer.md` / `backend-engineer.md`) **ไม่มีอยู่ใน workspace นี้**
> `## Data Model` ด้านล่างจึงเขียนเป็น **PostgreSQL DDL จริง + EF6 pattern จริง ไม่ใช่ Prisma schema**
> ตามที่ผู้ใช้ยืนยันเมื่อ 2026-08-25 — เพราะสัญญาต้องเทียบกับของจริงได้ ถ้าเขียนเป็น Prisma จะกลายเป็น
> สัญญาที่ไม่มีอะไรในระบบจริงตรงกับมัน และ `check-schema-contract.js` จะเทียบเอกสารกับโค้ดที่ไม่มี Prisma
> **ผลที่ตามมา**: `setup` agent ไม่ต้องรันกับ module นี้ (ระบบมีอยู่แล้ว ไม่ใช่ project ใหม่)

## Feasibility Summary

งานส่วนใหญ่เป็นการแก้โค้ดที่มีอยู่แล้ว ไม่มีการเพิ่มตารางใหม่ ไม่มี dependency ภายนอกใหม่

> **สถานะปัจจุบัน (หลัง catch-up ตาม `policies/documentation.md` §4 เมื่อ 2026-09-21)** — บันทึกเล่ารอบแก้ไขที่ปิดแล้วทั้งหมด (v5 เพิ่ม `stddev_score` · v7 เปลี่ยนชื่อตาราง/คอลัมน์ทั้งใบ · v8 ตัด `ALTER TABLE ... RENAME` ออก · v9/v10 กลไก + ชื่อคอลัมน์ `"FeatureCode"` · v14 ยกเลิกสถาปัตยกรรมแยกฝั่งของ v12/v13 · และโน้ตบล็อก BE-004 ช่วง v4 ซึ่งตอนนี้ปลดบล็อกฝั่งธุรกิจแล้ว) ย้ายไปเก็บที่ `design-archive.md` § "จาก Feasibility Summary (2026-09-21)" แบบ verbatim — กติกาที่ใช้อยู่วันนี้:
> - schema change ทั้งหมด (คอลัมน์ `"StddevScore"` + ชื่อ `public."TCompassXxx"`/`"PascalCase"` ไม่ต้อง migration) → `## Data Model` · `## National Stats Batch Rules` § `"StddevScore"` · DES-011 · DES-012 · RISK-10
> - กลไก entitlement = `"FeatureCode" varchar UNIQUE` ค่า `compass_premium`/`compass_admin_ops` ยืนยันแล้ว (ปิด OQ-15(a1)/(a2)) — เหลือรอ **PRE-06** ก่อน deploy → `## Premium Entitlement Rules` ขั้นตอนที่ 4 · `## Deployment Prerequisites` PRE-06
> - สถาปัตยกรรมปัจจุบัน = `ClassOnlineWeb` ที่เดียว อ่าน `PGGradeDB` ตรงด้วย EF6 (v14 ยกเลิก target `sb-tech-upgrade-api-academic`/`sb-api-gateway` แล้ว) → `## Data Model` → รูปแบบการเข้าถึงข้อมูล (EF6) · `## Modules`

**แต่มี prerequisite นอกโค้ด 2 อย่างที่ต้องเสร็จก่อน deploy Module B** — feature key
`compass_premium` และ `compass_admin_ops` ยังไม่มีอยู่จริงใน SB PLUS ต้องให้ทีมที่ดูแล SB PLUS
สร้าง record ก่อน (ดู `## Deployment Prerequisites`) · นี่เป็นงานตั้งค่าระบบภายนอก ไม่ใช่งานเขียนโค้ด
จึงไม่บล็อกการวางแผนหรือการเริ่ม implement แต่บล็อกการ deploy

จุดที่ต้องระวังที่สุดไม่ใช่เรื่องยาก แต่เป็นเรื่อง **ความสอดคล้องของตัวเลข**: REQ-012 เปลี่ยนวิธีคิด
คะแนนกลุ่มสาระ ซึ่งกระทบข้อมูลที่ batch เก็บไว้แล้วใน `public."TCompassStudentLevelScore"` /
`public."TCompassLevelSubjectStat"` ถ้า deploy โดยไม่ recompute ใหม่ อันดับทั่วประเทศจะเพี้ยนแบบเป็นระบบ
(ดู `## National Stats Batch Rules` และ DES-003) — นี่เป็น **data break ไม่ใช่ schema break**
คือรูปตารางเหมือนเดิมทุกอย่าง แต่แถวเก่ากลายเป็นค่าที่เทียบกับค่าใหม่ไม่ได้

## Feature-by-Feature Feasibility

| ID | ครอบคลุม | คำวินิจฉัย | หมายเหตุ |
|---|---|---|---|
| **DES-001** | REQ-001, REQ-002 | **ไม่ต้องทำ (ของเดิมทำงานอยู่)** | ฝั่งฟรียังใช้ค่าเฉลี่ยดิบธรรมดาตามเดิม ห้ามแตะ · `AggregateByCanonicalSubject` ที่ REQ-012 จะแก้ **ถูกใช้ร่วมกับฝั่งฟรีด้วย** จึงต้องแยกเมธอด ไม่ใช่แก้ทับ (ดู `## Subject Score Aggregation Rules`) |
| **DES-002** | REQ-012 | **straightforward** | ข้อมูลหน่วยกิตมีจริงแล้ว (`CompassSubjectScore.Credit` ← `PGTGradeDetail.nCredit` fallback `TPlane.nCredit` — `CompassScoreService.cs:46,131,199`) ไม่ต้องเพิ่มคอลัมน์ ไม่ต้อง migration |
| **DES-003** | REQ-004 × REQ-012 | **straightforward แต่มี deployment step บังคับ** | batch ต้องใช้สูตรถ่วงน้ำหนักเดียวกัน (ผู้ใช้ยืนยัน 2026-08-25) → **ต้อง recompute ใหม่ทั้งเครือข่ายตอน deploy** ไม่งั้นค่าใหม่จะถูกเทียบกับค่าเก่าที่คิดคนละสูตร |
| **DES-004** | REQ-013 | **straightforward** *(v2 — เดิม feasible-with-risk, ปิด OQ-14 แล้ว)* | SB PLUS มีจริงและอยู่ใน `JabjaiSchoolSingleDB` ซึ่ง `ApiBaseController.GetSchoolConnection()` ต่ออยู่แล้ว จึงไม่ต้องเพิ่ม connection ใหม่ · **ไม่มี EF entity ของ `TSubscription` ในโปรเจกต์นี้** ต้องใช้ raw SQL ผ่าน `.Database.SqlQuery<T>()` · feature key = **`compass_premium`** · **v3: เส้นทาง join แก้เป็น 2 ตาราง (`TSubscription.subscription_plan_id` → `TPlan_Feature.plan_id`) ไม่ผ่าน `TSubcriptionPlan`** · **v9 (2026-09-01): OQ-15(a1) ตัดสินกลไกแล้ว (คอลัมน์ `"FeatureCode"`)** · ✅ **2026-09-15: ปิด OQ-15(a2) ฝั่งธุรกิจ** — ผู้ใช้ยืนยันรหัส FeatureCode ใน `TFeatureSBPlus` ว่าใช้ชื่อ **`compass_premium`** (ตรงกับชื่อที่โค้ด `CompassEntitlementService.FeatureKeyPremium` ใช้อยู่แล้ว) ดู `## Premium Entitlement Rules` ขั้นตอนที่ 4 |
| **DES-005** | REQ-014 | **feasible-with-risk** *(v2 — ความเสี่ยงเดิมปิดแล้วด้วยการแยก key + IP allowlist)* | ใช้ entitlement check ตัวเดียวกันแต่ผูกกับ feature key **`compass_admin_ops`** ที่ผูกเฉพาะแพ็กเกจ staff/internal · **บวก IP/internal-network allowlist อีกชั้น** เพราะ endpoint นี้สั่ง `TRUNCATE` ทั้งเครือข่าย จึงไม่พึ่งชั้น entitlement อย่างเดียว · **v9 (2026-09-01): กลไกตัดสินแล้ว (option i)** · ✅ **2026-09-15: ปิด OQ-15(a2) ฝั่งธุรกิจ** — ผู้ใช้ยืนยันรหัส FeatureCode ใน `TFeatureSBPlus` ว่าใช้ชื่อ **`compass_admin_ops`** (ตรงกับชื่อที่โค้ด `CompassEntitlementService.FeatureKeyAdminOps` ใช้อยู่แล้ว) ดู `## Premium Entitlement Rules` ขั้นตอนที่ 4 |
| **DES-006** | REQ-015, REQ-009 | **straightforward** | 3 endpoint (`AI_exercise/path`, `AI_exercise/submit`, `certificate/issue`) รับ `request.SID` ตรง ๆ ยืนยันจากโค้ด (`CompassApiController.cs:643, 675, 729`) และ **ทั้งสามไม่ได้เช็ค `ud == null` ด้วยซ้ำ** ต่างจาก endpoint อื่น |
| **DES-007** | REQ-016 | **straightforward** | ข้อมูลรายวิชามีอยู่แล้วก่อน aggregate ไม่ต้องหาแหล่งใหม่ · เป็นการเพิ่ม field ในชั้นแสดงผลล้วน ๆ · ✅ **2026-09-15: ปิด OQ-16** — ผู้ใช้ยืนยันแสดงผลเป็น **ตารางบรรจุภายในการ์ดกลุ่มสาระ (Table in Card)** และรายวิชาที่ไม่มีข้อมูลหน่วยกิตให้แสดง `"ไม่มีข้อมูลหน่วยกิต"` ชัดเจน (AC-016.7) |
| **DES-008** | *(ไม่มี REQ — ผมเสนอเพิ่ม)* | **straightforward** | `debug/scores`, `debug/national-stats`, `debug/my-stat` ยังเปิดอยู่ · โค้ดเขียนกำกับเองว่า "Lock down / remove before prod" (`CompassApiController.cs:753`) · `debug/national-stats` เทสถิติทั้งเครือข่ายให้นักเรียนคนไหนก็ได้ที่ล็อกอิน · ผู้ใช้อนุมัติให้เสนอปิด/ถอด 2026-08-25 · ✅ **OQ-17 ปิดแล้ว 2026-09-01 — ผลคือ "กั้นด้วย `compass_admin_ops`" ไม่ใช่ถอดทิ้ง** (BE-012 ใน `plan.md` implement ตรงนี้อยู่แล้ว) |
| **DES-009** | REQ-003, REQ-005, REQ-006, REQ-007 | **ไม่เปลี่ยน logic — เปลี่ยนแค่การกั้นสิทธิ์** | ทั้งหมดถูกกั้นด้วย DES-004 · **REQ-003 เป็นกรณีพิเศษ**: มันอยู่ใน endpoint เดียวกับฟีเจอร์ฟรี (`analyst/{sID}` field `Boost`) จึงกั้นทั้ง endpoint ไม่ได้ ต้องกั้นระดับ field · drift เรื่อง REQ-005/REQ-007 (ที่จะถูกถอดตาม `requirement.md` REQ-018) ปิดแล้ว 2026-09-02 — คงกติกากั้นสิทธิ์ทั้งสองปลายทางไว้จนกว่า trigger จะถึง (**DES-014**) · บันทึก drift เต็มย้ายไป `design-archive.md` |
| **DES-010** | REQ-008, REQ-011 | **out of scope รอบนี้ (ยกเว้นเรื่อง identity)** | REQ-008 คลังคำถาม/บันทึกผล = Later · REQ-011 ใบรับรอง = module `sb-compass-certificate` แยก · **แต่ DES-006 ยังต้องแก้ identity ของ endpoint พวกนี้** เพราะโค้ด stub อยู่ไฟล์เดียวกัน จะทิ้งช่องโหว่ค้างไว้ไม่ได้ |
| **DES-012** *(ใหม่ v7, 2026-08-31 · v8: ยืนยันว่าไม่ต้อง migration)* | *(ไม่มี REQ — การตัดสินเรื่อง naming convention โดยผู้ใช้, ปิด OQ-19 ด้วยตัวเลือก C)* | **straightforward ในเชิงเทคนิค แต่เป็น breaking change ต่อโค้ดที่เขียนไปแล้ว** | เปลี่ยนชื่อทั้งสามตารางเป็น `public."TCompassLevelSubjectStat"` · `public."TCompassStudentLevelScore"` · `public."TCompassMbtiResult"` พร้อมคอลัมน์ `"PascalCase"` และ index `"IX_..."` (DDL เต็มอยู่ที่ `## Data Model` กลุ่มที่ 1) · **ไม่ต้อง migration/rename เลย เพราะผู้ใช้ยืนยันแล้ว (v8, 2026-08-31) ว่าทั้งสามตารางยังไม่เคยถูกสร้างในฐานข้อมูลใด ๆ เลย** ไม่ใช่แค่ไม่มีข้อมูลนักเรียนจริง — `EnsureTables`/`EnsureTable` แก้ให้ใช้ชื่อใหม่แล้วสร้างตารางขึ้นตรง ๆ ก็พอ (สอดคล้องกับ `_docs/status.md` ที่ทุก phase เป็น `deployed ⬜`) · **แต่มีโค้ดจริงอ้างชื่อเดิมอยู่ 22 จุด** — `CompassRankingService.cs` (`:24,25,60,62,191,195,199,203,260,265,268,273,401,402,411,541,548,554,564`) และ `CompassMbtiStore.cs` (`:44,77,94`) → **นับเป็นงาน implement ของ Module C ไม่ใช่แค่การแก้เอกสาร** · กับดักที่ต้องระวัง: PostgreSQL fold identifier ที่ไม่ quote เป็นตัวพิมพ์เล็ก → **ทุก query ต้อง quote เสมอ** (ดู `## Data Model` → กฎการ quote) |
| **DES-011** *(ใหม่ v5, 2026-08-31 · ชื่อคอลัมน์แก้ใน v7)* | REQ-017 | **straightforward — แต่เป็น schema change ตัวแรกของ module นี้** | เพิ่มคอลัมน์ `"StddevScore"` (nullable) + คำนวณในรอบ batch เดียวกับ `"MeanScore"` · **ข้อมูลที่ต้องใช้มีครบอยู่แล้วในหน่วยความจำตอน batch คำนวณ `"MeanScore"`** จึงไม่ต้อง query เพิ่มและไม่กระทบเวลารันอย่างมีนัยสำคัญ (วนชุดเดิมอีกรอบเพื่อหาผลรวมกำลังสอง หรือสะสม Σx² ไปพร้อมกันในรอบเดียว) · ไม่ต้อง backfill (TRUNCATE + rewrite ทุกรอบ) · **ไม่กระทบ consumer เดิม** ที่อ่านเฉพาะ `"MeanScore"` · สูตร (population) และเกณฑ์ `n` ขั้นต่ำ (`MIN_N_FOR_STDDEV = 30`) **ปิดแล้วใน v6 (OQ-18)** · กติกาเต็มอยู่ที่ `## National Stats Batch Rules` § `"StddevScore"` · **v7: คอลัมน์นี้อยู่ในตาราง `public."TCompassLevelSubjectStat"` และใช้ PascalCase ตามตารางที่ถูกเปลี่ยนชื่อทั้งใบ — ไม่ใช่ snake_case ตามที่ v5/v6 กำหนดไว้อีกต่อไป** |
| **DES-013** *(ใหม่ 2026-08-31 · แก้ไขในวันเดียวกันหลังผู้ใช้ตัดสิน OQ-20)* | *(ไม่มี REQ — เอกสารร่าง `education-pathway-assessment-design.md`)* | 🟠 **ประเมินรายข้อแล้ว — รับบางส่วน ปฏิเสธบางส่วน · งาน amend จริงไม่ได้อยู่ที่ module นี้** | เอกสารร่างเสนอ **ระบบประเมินความสนใจ RIASEC ฉบับเต็ม** (Ranking 7 ข้อ + Engagement 18 ข้อ → Path Interest/Readiness/Final/Confidence เหนือ 11 Interest Cluster) พร้อม schema 18 ตาราง · **ผู้ใช้ตัดสิน (2026-08-31, coordinator relay) ให้ใช้เป็นฐานอ้างอิงหลัก พร้อมอนุญาตให้โต้แย้งเป็นข้อ ๆ** → คำวินิจฉัย **REJECT 5 · ADAPT 3 · ADOPT 4 · มีอยู่แล้ว 1** ที่ `### คำวินิจฉัยรายข้อ...` ด้านล่าง · **จุดที่ถูก REJECT เป็นเรื่อง feasibility ที่ตรวจกับข้อมูลจริงแล้ว ไม่ใช่ความเห็น** — โดยเฉพาะชั้น Readiness ที่ map ลงกลุ่มสาระ 8 กลุ่มของระบบจริงไม่ได้ (RISK-14) · **สัญญาที่ต้องถูกแก้อยู่ที่ `sb-compass-faculty-match/design.md` ไม่ใช่เอกสารนี้** → RISK-11/12/13/14 · **OQ-20 (ปิดแบบมีเงื่อนไข) · OQ-21 (ปิดแล้ว 2026-09-02 — ตัวเลขทั้งชุดเป็น assumption ที่มีป้ายกำกับ ไม่ใช่ fact ที่ยืนยันแล้ว ดูแถว OQ-21)** — การปิด OQ-21 ไม่ได้แปลว่า DES-013 กลายเป็น implementable ที่นี่ ยังคงเป็นงานของ `system-analyst` ของ `sb-compass-faculty-match` ที่ต้อง amend สัญญาของโมดูลนั้นก่อน |
| **DES-014** *(ใหม่ 2026-09-02, ปิด OQ-22)* | REQ-018 | **ไม่ใช่งาน implement ของรอบนี้ — เลื่อนออกไปตาม trigger ที่ยังไม่เกิด** | REQ-018 กำหนดว่าโค้ด/ตาราง/endpoint ของ REQ-005/REQ-007 (endpoint ที่ DES-009 กั้นไว้ · `public."TCompassMbtiResult"` · `CompassMbtiStore.cs` ที่ DES-012 แก้ไว้ · Fit Score consumer ใน `## Subject Score Aggregation Rules`) ต้องถูกถอดออกจริงภายใน **N=4 สัปดาห์หลัง `sb-compass-faculty-match REQ-011`/`REQ-012` ขึ้น production** — **เงื่อนไข trigger นี้ยังไม่เกิดขึ้น** (โมดูลนั้นยังไม่ deploy) จึง **ไม่มี task ถอดโค้ดใดใน `plan.md` ของรอบนี้ และเอกสารนี้ไม่เปิด phase/task ใหม่ให้โดยไม่มีวันจริงรองรับ** · งานที่ต้องทำวันนี้คือคงกติกากั้นสิทธิ์/โค้ดทั้ง 4 จุดไว้ตามปกติเท่านั้น (ดู DES-009) · **การติดตามวันครบ trigger และการเปิด task ถอดจริงเป็นหน้าที่ของ `project-manager`/`devops`** อ้างอิง `status.md` ของ `sb-compass-faculty-match` ตามที่ `requirement.md` REQ-018 ระบุไว้ — ไม่ใช่สิ่งที่ `system-analyst` ของโมดูลนี้ต้องประเมิน feasibility ซ้ำในรอบถัดไป เว้นแต่ trigger ใกล้ถึงแล้วจริง |
| **DES-015** *(เพิ่ม 2026-09-07 · ปรับปรุง 2026-09-15: ปิด ISS-01)* | REQ-012, REQ-006 | **straightforward** *(ปิด ISS-01 · 2026-09-15)* | ผูกกับ `## Subject Score Aggregation Rules` (REQ-012) · ✅ **2026-09-15: ปิด ISS-01** — กำหนดให้ Gap Report (`AI_advice/path`, REQ-006 ใน `CompassPathCatalog.BuildAdvice`) ต้องคงทศนิยม 2 ตำแหน่งสำหรับ `VMGapItem.Current` (`Math.Round(avg[kv.Key], 2)`) ห้าม re-round เป็น 0 dp และคำนวณ `VMGapItem.Gap` จากทศนิยม 2 ตำแหน่ง พร้อมแสดงผลทศนิยมตามจริงใน advice text (`{m.Gap:0.##}`) สอดคล้องกับข้อกำหนด Premium API 2 dp ของ REQ-012 |
| **DES-016** *(เพิ่ม 2026-09-07 — reconciliation pass)* | REQ-013, REQ-014 | **ไม่มีเนื้อหาเปลี่ยน — หัวข้อนี้อนุมัติแล้วตั้งแต่รอบก่อนหน้า** | ผูกกับ `## Premium Entitlement Rules` ซึ่งเป็นสัญญาของ REQ-013/REQ-014 ที่มีอยู่แล้ว · แถวนี้เพิ่มเพื่อ traceability เท่านั้น |
| **DES-017** *(เพิ่ม 2026-09-07 — reconciliation pass)* | REQ-015, REQ-009 | **ไม่มีเนื้อหาเปลี่ยน — หัวข้อนี้อนุมัติแล้วตั้งแต่รอบก่อนหน้า** | ผูกกับ `## Identity & Scope Rules` ซึ่งเป็นสัญญาของ REQ-015/REQ-009 ที่มีอยู่แล้ว · แถวนี้เพิ่มเพื่อ traceability เท่านั้น |
| **DES-018** *(เพิ่ม 2026-09-07 — reconciliation pass)* | REQ-016 | **ไม่มีเนื้อหาเปลี่ยน — หัวข้อนี้อนุมัติแล้วตั้งแต่รอบก่อนหน้า** | ผูกกับ `## Premium Subject Breakdown Contract` ซึ่งเป็นสัญญาของ REQ-016 ที่มีอยู่แล้ว · แถวนี้เพิ่มเพื่อ traceability เท่านั้น |
| **DES-019** *(เพิ่ม 2026-09-07 — reconciliation pass)* | *(ไม่มี REQ เฉพาะ — ครอบคลุมขั้นตอน deploy ข้าม Module B/C)* | **ไม่มีเนื้อหาเปลี่ยน — หัวข้อนี้อนุมัติแล้วตั้งแต่รอบก่อนหน้า** | ผูกกับ `## Deployment Prerequisites` (PRE-01..PRE-06) ที่มีอยู่แล้ว · แถวนี้เพิ่มเพื่อ traceability เท่านั้น |
| **DES-020** *(เพิ่ม 2026-09-07 — reconciliation pass, ลงทะเบียน traceability ย้อนหลัง ไม่ใช่การตัดสินใจใหม่)* | *(ไม่มี REQ เฉพาะในโมดูลนี้ — ผูกกับ REQ-004 (ของเดิม) และ `sb-compass-faculty-match` REQ-013 (ของใหม่) ตามที่ระบุใน § "ขอบเขตที่ต้องแก้")* | **ไม่มีเนื้อหาเปลี่ยน — หัวข้อนี้อนุมัติ/ยืนยันแล้วตั้งแต่รอบก่อนหน้า (2026-08-31, ขยายเพิ่ม 2026-09-02)** | ผูกกับ `## Risks & Dependencies` § **WORD-01** (ข้อกำหนดถ้อยคำของค่าสถิติเปรียบเทียบ — "เป็นข้อกำหนด ไม่ใช่คำแนะนำ") ที่มีอยู่แล้ว · แถวนี้เพิ่มเพื่อให้หัวข้อมี DES-NNN ตามที่ `sta --check-doc-structure` ต้องการเท่านั้น กติกาจริงไม่เปลี่ยน |

### เอกสารร่างสองฉบับในโฟลเดอร์นี้ (`education-pathway-*.md`) — สถานะและการจัดวาง (2026-08-31)

โฟลเดอร์ `_docs/module/sb-compass/` มีไฟล์ที่**ไม่ใช่เอกสารตามสัญญาของ pipeline** (ไม่ใช่
`requirement.md`/`design.md`/`plan.md`) อยู่ 2 ฉบับ ต้องแยกสถานะให้ชัดเพื่อไม่ให้ engineer หยิบไปใช้ผิด:

| ไฟล์ | สถานะ ณ วันนี้ | ใครใช้อยู่จริง |
|---|---|---|
| `education-pathway-taxonomy-design.md` | ✅ **reconcile แล้ว — เป็นเอกสารอ้างอิง (source material) ไม่ใช่สัญญา** | `sb-compass-faculty-match` ใช้เป็นฐานของ REQ-011/REQ-015 · seed 11 cluster + 26 faculty group + ตารางน้ำหนัก (ผู้ใช้ sign-off 2026-08-31, OQ-F07) · **กติกาที่บังคับใช้อยู่ที่ `sb-compass-faculty-match/design.md` ไม่ใช่ที่ไฟล์นี้** |
| `education-pathway-assessment-design.md` | 🟡 **ผู้ใช้เลือกให้เป็น "ฐานอ้างอิงหลัก" ของโมเดลประเมิน RIASEC/Cluster ต่อจากนี้ (2026-08-31, ผ่าน coordinator relay)** — แต่ **รับเข้าเป็นข้อ ๆ ไม่ใช่ทั้งฉบับ** · ผู้ใช้อนุญาตให้โต้แย้งโดยตรง: จุดใดที่เหตุผล/คณิตศาสตร์/ขอบเขตความเป็นเจ้าของ/ตัวเลขไม่มีที่มา **ไม่สมเหตุสมผล ให้ทักท้วง ไม่ใช่รับมาทั้งดุ้น** | **ยังไม่มีใครอ้างถึงในสัญญาใด** · คำวินิจฉัยรายข้ออยู่ที่ `### คำวินิจฉัยรายข้อ...` ด้านล่าง · **ยังห้าม implement ตามไฟล์นี้ตรง ๆ** — สิ่งที่ผูกพัน engineer คือสัญญาใน `sb-compass-faculty-match/design.md` หลังถูก amend เท่านั้น ไม่ใช่ตัวไฟล์ร่าง |

ตารางเปรียบเทียบ 5 จุดที่ชนกับสัญญาที่ยืนยันแล้ว (Cluster↔RIASEC · เครื่องมือวัด · สูตรคะแนนรวม · schema · ค่าคงที่ไม่มีที่มา) ย้ายไปเก็บที่ `design-archive.md` § "จาก Feature-by-Feature Feasibility" แบบ verbatim แล้ว (2026-09-21) — คำวินิจฉัยที่บังคับใช้อยู่คือตาราง `### คำวินิจฉัยรายข้อ...` ด้านล่าง

### คำวินิจฉัยรายข้อของเอกสารร่าง assessment — adopt / adapt / reject (ปิดแล้ว 2026-08-31)

> **บันทึกเหตุผลเต็มของคำวินิจฉัยแต่ละข้อ (ตาราง 14 แถว + ที่มา + ข้อโต้แย้ง) ย้ายไปเก็บที่
> `design-archive.md` แล้ว** ตาม `policies/documentation.md` §4 — ไม่ต้องเปิดไฟล์ archive เพื่อทำงานปกติ
> เปิดเฉพาะเมื่อต้องการรู้เหตุผลเบื้องหลังคำวินิจฉัยข้อใดข้อหนึ่ง ตารางด้านล่างนี้เก็บเฉพาะ ID → คำวินิจฉัย
> ที่ RISK-11/RISK-12/RISK-14/OQ-20/DES-013 ในเอกสารนี้อ้างอิงถึง

**ที่มา**: ผู้ใช้ตัดสิน OQ-20 (2026-08-31) — รายละเอียดย้ายไป `design-archive.md` § "จาก Feature-by-Feature Feasibility" แล้ว · สัญญาที่ต้องถูกแก้จริงตามคำวินิจฉัยเหล่านี้อยู่ที่ `sb-compass-faculty-match/design.md` (คนละ module)

| # | ประเด็น | คำวินิจฉัย |
|---|---|---|
| **A** | Cluster ↔ RIASEC ordered pair 0.65/0.35/tertiary 0.08 | 🔴 **REJECT** — คงเวกเตอร์ 11×6 ที่ยืนยันแล้ว |
| **A2** | Adaptive Threshold + Path Difficulty Constant | 🟠 **ADAPT** — ไม่ implement รอบแรก 🧑 |
| **B** | เครื่องมือวัด: Ranking 7 ข้อ + Likert 18 ข้อ แทน Likert ชุดเดียว | 🟡 **ADAPT** — รับได้เชิงเทคนิค แต่เป็นการตัดสินธุรกิจ 🧑 |
| **C** | Readiness ชั้น 1 — Subject→RIASEC weight (10 แถว) | 🔴 **REJECT ตามที่เขียน** — map ลงข้อมูลจริงไม่ได้ |
| **C2** | Readiness ชั้น 2 — Path Key Subjects | 🔴 **REJECT ตามที่เขียน** — กลไกพังตามข้อ C |
| **C3** | แหล่งคะแนนความพร้อม (สเกลของตัวเอง) | 🔴 **REJECT** — ขัดข้อห้ามที่ยืนยันแล้วโดยตรง |
| **C4** | สัดส่วน Interest:Readiness 0.6:0.4 แทน 0.5/0.5 | 🟡 **ADAPT** — ตัดสินธุรกิจล้วน 🧑 |
| **D** | schema 18 ตาราง snake_case | 🔴 **REJECT ตามที่เขียน** · 🟢 **ADOPT เฉพาะแนวคิด** (config-driven ฯลฯ) |
| **E** | Confidence / Profile Clarity + Explore Mode | 🟢 **ADOPT หลักการ** 🧑 องค์ประกอบ/เกณฑ์ต้องยืนยัน |
| **F** | ปุ่ม "ยังไม่เคยลอง" / "ไม่มีอันไหนที่ชอบเลย" | 🟢 **ADOPT หลักการ** 🧑 ค่าคงที่ต้องยืนยัน |
| **G** | Role Overlay ของ C11 | 🟢 **ADOPT หลักการ** 🟠 สูตร `max()` ควรทบทวน |
| **H** | Interest-only mode เมื่อข้อมูลเกรดไม่ครบ | 🟢 **ADOPT** — ภาพสะท้อนของกฎที่มีอยู่แล้ว |
| **I** | ข้อห้ามถ้อยคำ / ไม่แสดงอันดับ / แสดงหลายกลุ่ม | ✅ **มีอยู่แล้ว** — ไม่ต้องตัดสินใหม่ |

**สรุปการกระจายคำวินิจฉัย**: REJECT 5 ข้อ (A, C, C2, C3, D-ตามที่เขียน) · ADAPT 3 ข้อ (A2, B, C4) ·
ADOPT 4 ข้อ (E, F, G, H — ระดับหลักการ) · มีอยู่แล้ว 1 ข้อ (I) · เหตุผลเต็มของทุกแถว + ตารางเปรียบเทียบ
5 จุดที่ชนกับสัญญาที่ยืนยันแล้ว (Cluster↔RIASEC, เครื่องมือวัด, สูตรคะแนนรวม, schema, ค่าคงที่ไม่มีที่มา) →
`design-archive.md`

### การตัดสินใจที่ผู้ใช้ยืนยันแล้ว

> **บันทึกคำถาม-คำตอบของทุกรอบที่ปิดแล้ว (Q1–Q7) ย้ายไปเก็บที่ `design-archive.md` แล้ว**
> — กติกาที่ใช้จริงอยู่ในหัวข้อ contract ด้านล่างนี้ ไม่ต้องเปิดไฟล์ archive เพื่อทำงานปกติ

กติกาที่ปิดแล้วอยู่ที่ไหน:

| เรื่องที่ตัดสินไปแล้ว | กติกาที่บังคับใช้อยู่ที่ |
|---|---|
| Data Model เป็น DDL/EF6 ไม่ใช่ Prisma | หมายเหตุ stack ด้านบน + `## Data Model` |
| แหล่งความจริงของสิทธิ์ Premium = SB PLUS · feature key `compass_premium`/`compass_admin_ops` (ปิด OQ-14) · กลไก = คอลัมน์ `"FeatureCode" varchar UNIQUE` ค่ายืนยันแล้ว (ปิด OQ-15(a1)/(a2)) — เหลือรอ PRE-06 | `## Premium Entitlement Rules` ขั้นตอนที่ 3-4 · `## Deployment Prerequisites` PRE-06 |
| การจำกัดสิทธิ์ `recompute` (แยก key + IP allowlist) | `## Premium Entitlement Rules` → REQ-014 |
| batch ใช้สูตรถ่วงน้ำหนัก + recompute ตอน deploy | `## National Stats Batch Rules` |
| `TCompassMbtiResult` (เดิม `compass_mbti_result`) เป็นของที่มีอยู่แล้ว | `## Data Model` กลุ่มที่ 1 |
| **naming convention ของทั้งสามตาราง = `public."TCompassXxx"` + `"PascalCase"` + `"IX_..."`** (ปิด OQ-19 ตัวเลือก C 2026-08-31 · v8 ยืนยันไม่ต้อง migration เพราะไม่เคยมีตารางจริง) | `## Data Model` กลุ่มที่ 1 (DDL + กฎการ quote) · DES-012 |
| debug endpoints ให้กั้นด้วย `compass_admin_ops` ทั้ง 3 ตัว (✅ OQ-17 ปิดแล้ว 2026-09-01 — ไม่ใช่ "ถอดออก" ตามที่เคยเสนอไว้ในรอบแรก) | DES-008 + OQ-17 · `## Premium Entitlement Rules` |
| **เส้นทาง join จริงของ entitlement = 2 ตาราง** `TSubscription.subscription_plan_id` → `TPlan_Feature.plan_id` (แก้ Q2 รอบ v3 — ห้ามใช้บันทึก 4 ตารางใน archive เป็นสัญญา) | `## Premium Entitlement Rules` ขั้นตอนที่ 3 · `## Data Model` กลุ่มที่ 2 |
| **เกณฑ์การถอด REQ-005/REQ-007 (ปิด OQ-22 ด้วย REQ-018, trigger-based · 2026-09-02)** | `requirement.md` → REQ-018 (เจ้าของกติกา) · DES-009 (งานที่ยังต้องทำระหว่างรอ trigger) · DES-014 (สถานะ "เลื่อนออกไป ไม่ใช่ task ของรอบนี้") |
| **ค่าคงที่ทั้งหมดในเอกสารร่าง `education-pathway-assessment-design.md` = assumption ทั้งชุด (ปิด OQ-21 · 2026-09-02)** | `requirement.md` → `## References` (แถวขยายขอบเขต) · RISK-13 (เงื่อนไขบล็อก satisfied) · การนำไปใช้จริงเป็นสัญญาของ `sb-compass-faculty-match/design.md` |
| **ยกเลิกแล้ว (v14, 2026-09-08) — สถาปัตยกรรมแยกฝั่ง "ดึงคะแนน" ไป `sb-tech-upgrade-api-academic`/`sb-api-gateway`** — ผู้ใช้สั่งยกเลิก target ทั้งสอง ทุกอย่างกลับมาอยู่ใน `ClassOnlineWeb` ที่เดียว อ่าน `PGGradeDB` ตรงด้วย EF6 · เหตุผลเต็มย้ายไป `design-archive.md` | `## Data Model` → รูปแบบการเข้าถึงข้อมูล (EF6) · `## Modules` |
| **รหัส FeatureCode ใน SB PLUS = `compass_premium` และ `compass_admin_ops` (ปิด OQ-15(a2) ฝั่งธุรกิจ · 2026-09-15)** | `## Premium Entitlement Rules` ขั้นตอนที่ 4 · `CompassEntitlementService` |
| **Layout แสดงผล Breakdown รายวิชา Premium = ตารางภายในการ์ด (Table in Card) + ข้อความ "ไม่มีข้อมูลหน่วยกิต" (ปิด OQ-16 · 2026-09-15)** | `## DES-018 — Premium Subject Breakdown Contract` · AC-016.7 |
| **การปัดเศษใน Gap Report (`AI_advice/path`, REQ-006) คงทศนิยม 2 ตำแหน่ง ห้าม re-round เป็น 0 dp (ปิด ISS-01 · 2026-09-15)** | `## DES-015 — Subject Score Aggregation Rules` กฎข้อที่ 5 · `CompassPathCatalog.BuildAdvice` |

## Data Model

> **ไม่ใช่ Prisma โดยเจตนา** — ดูหมายเหตุเรื่อง stack ด้านบน
> **v7 (2026-08-31) — รอบนี้มี schema change แบบ breaking ต่อโค้ด**: ทั้งสามตารางของกลุ่มที่ 1
> **ถูกเปลี่ยนชื่อตาราง คอลัมน์ และ index ทั้งหมด** ให้ตรง convention องค์กร (OQ-19 ปิดด้วยตัวเลือก C)
> · **ไม่มีการย้ายข้อมูล** เพราะผู้ใช้ยืนยันว่ายังไม่ deploy ใช้งานจริง · ตารางกลุ่มที่ 2 และ 3
> เป็นของภายนอกที่อ่านอย่างเดียว **ไม่ถูกแตะและห้ามเปลี่ยนชื่อ**
> **v8 (2026-08-31) — ไม่ต้อง migration**: ผู้ใช้ยืนยันเพิ่มว่าทั้งสามตารางยังไม่เคยถูกสร้างใน
> ฐานข้อมูลใด ๆ เลย (ทุก phase ยังเป็น `deployed ⬜`) จึงตัดหัวข้อย่อย *การเปลี่ยนชื่อในฐานข้อมูล
> ที่มีตารางเดิมอยู่แล้ว* และ **PRE-06** ออกทั้งหมด — ดูบันทึกเต็มที่ `design-archive.md`

### กลุ่มที่ 1 — ตารางที่ module นี้เป็นเจ้าของ (อยู่ใน `PGGradeDB`)

ทั้งสามตารางถูก **สร้างโดยโค้ดแอปเองตอน runtime** ผ่าน `CREATE TABLE IF NOT EXISTS`
(`CompassRankingService.EnsureTables`, `CompassMbtiStore.EnsureTable`) **ไม่ได้ผ่าน migration**

> **DDL ด้านล่างคือ "สภาพที่ต้องเป็นหลัง v7" ไม่ใช่สภาพของโค้ดวันนี้** — ต่างจาก v1-v6 ที่ DDL
> คัดมาจากโค้ดจริงตรงตัว · โค้ดปัจจุบันยังใช้ชื่อเดิม (snake_case) อยู่ทั้งหมด และ **การแก้ให้ตรงกับ
> DDL นี้เป็นงาน implement ของ Module C** (DES-012) · `qa-engineer` ต้องถือ DDL นี้เป็นสัญญา
> และถือความต่างจากโค้ดปัจจุบันเป็น **งานที่ยังไม่ทำ ไม่ใช่ drift ของเอกสาร**

```sql
-- ค่าเฉลี่ยรายกลุ่มสาระ ต่อระดับชั้น (REQ-004) — เขียนโดย batch เท่านั้น
-- v5: เพิ่ม stddev_score (REQ-017) · v7: เปลี่ยนชื่อทั้งตารางตาม convention องค์กร (OQ-19 ตัวเลือก C)
-- ชื่อเดิมก่อน v7: compass_level_subject_stat (snake_case ไม่ quoted) — **เลิกใช้แล้ว ห้ามอ้างอีก**
CREATE TABLE IF NOT EXISTS public."TCompassLevelSubjectStat" (
    "LevelCode"    text             NOT NULL,
    "LevelName"    text,
    "Subject"      text             NOT NULL,
    "MeanScore"    double precision NOT NULL,
    "StddevScore"  double precision NULL,     -- REQ-017 · **NULL ได้โดยเจตนา** = คำนวณไม่ได้/ไม่มีความหมายทางสถิติ
                                              -- (ต่างจาก 0 ที่แปลว่า "ทุกคนได้คะแนนเท่ากันจริง") ดู ## National Stats Batch Rules
    "StudentCount" integer          NOT NULL, -- ตัวนี้คือ n ที่ใช้ตัดสินว่า "StddevScore" มีความหมายพอหรือไม่
    "SchoolCount"  integer          NOT NULL,
    "UpdatedAt"    timestamptz      NOT NULL,
    PRIMARY KEY ("LevelCode", "Subject")
);

-- คะแนนรวมต่อนักเรียน ใช้จัดอันดับ (REQ-004) — เขียนโดย batch เท่านั้น
-- ชื่อเดิมก่อน v7: compass_student_level_score
CREATE TABLE IF NOT EXISTS public."TCompassStudentLevelScore" (
    "SchoolID"   integer          NOT NULL,
    "SID"        integer          NOT NULL,
    "LevelCode"  text             NOT NULL,
    "OverallAvg" double precision NOT NULL,
    "UpdatedAt"  timestamptz      NOT NULL,
    PRIMARY KEY ("SchoolID", "SID")
);

-- ชื่อเดิมก่อน v7: ix_cslscore_level_avg
CREATE INDEX IF NOT EXISTS "IX_TCompassStudentLevelScore_LevelCode_OverallAvg"
    ON public."TCompassStudentLevelScore" ("LevelCode", "OverallAvg");

-- ผลแบบทดสอบบุคลิกภาพล่าสุดของนักเรียน (REQ-007) — upsert ทับ ไม่เก็บประวัติ
-- ชื่อเดิมก่อน v7: compass_mbti_result
CREATE TABLE IF NOT EXISTS public."TCompassMbtiResult" (
    "SchoolID"     integer     NOT NULL,
    "SID"          integer     NOT NULL,
    "PathCode"     text        NOT NULL,
    "CareerName"   text,
    "MatchPercent" integer,
    "Reason"       text,
    "Answers"      text,               -- CSV "0,1,0,..."
    "CreatedAt"    timestamptz NOT NULL,
    PRIMARY KEY ("SchoolID", "SID")
);
```

#### ตารางแปลงชื่อ เดิม → ใหม่ (v7) — ใช้เป็น checklist ตอนแก้โค้ด

| ตารางเดิม | ตารางใหม่ | คอลัมน์ที่เปลี่ยน |
|---|---|---|
| `compass_level_subject_stat` | `public."TCompassLevelSubjectStat"` | `level_code`→`"LevelCode"` · `level_name`→`"LevelName"` · `subject`→`"Subject"` · `mean_score`→`"MeanScore"` · `stddev_score`→`"StddevScore"` · `student_count`→`"StudentCount"` · `school_count`→`"SchoolCount"` · `updated_at`→`"UpdatedAt"` |
| `compass_student_level_score` | `public."TCompassStudentLevelScore"` | `school_id`→`"SchoolID"` · `s_id`→`"SID"` · `level_code`→`"LevelCode"` · `overall_avg`→`"OverallAvg"` · `updated_at`→`"UpdatedAt"` |
| `compass_mbti_result` | `public."TCompassMbtiResult"` | `school_id`→`"SchoolID"` · `s_id`→`"SID"` · `path_code`→`"PathCode"` · `career_name`→`"CareerName"` · `match_percent`→`"MatchPercent"` · `reason`→`"Reason"` · `answers`→`"Answers"` · `created_at`→`"CreatedAt"` |
| index `ix_cslscore_level_avg` | `"IX_TCompassStudentLevelScore_LevelCode_OverallAvg"` | — |

**ที่มาของรูปแบบชื่อคอลัมน์ (ไม่ใช่การเดา)**: `"SchoolID"` ตรงกับที่ `schoolbright-backend` ใช้จริง
(`04-create-tschoolfeatureflag.sql:16`) · `"SID"`/`"PathCode"`/`"CareerName"`/`"MatchPercent"`/
`"Reason"`/`"Answers"`/`"CreatedAt"` **ตรงกับ alias ที่โค้ดเดิมใช้อยู่แล้วตอน `SELECT`**
(`CompassMbtiStore.cs:74-77`) จึงเป็นชื่อที่ฝั่ง C# คาดหวังอยู่แล้ว · **`"MBTI"` ไม่ถูกเขียนเป็น
ตัวพิมพ์ใหญ่ทั้งหมด** เพราะชื่อตารางอ่านเป็นคำเดียว (`TCompassMbtiResult`) — ถ้าจะเปลี่ยนต้อง amend

#### กฎการ quote identifier — **ข้อห้ามที่ engineer ผิดพลาดไม่ได้**

PostgreSQL **fold identifier ที่ไม่ quote เป็นตัวพิมพ์เล็กทั้งหมด** → `SELECT MeanScore FROM
TCompassLevelSubjectStat` จะกลายเป็น `meanscore`/`tcompasslevelsubjectstat` และ **พังทันทีตอน runtime**
(ไม่ใช่ตอน compile — โค้ดนี้เป็น raw SQL ทั้งหมด ไม่มี EF entity มาช่วยจับ)

1. **ทุก raw SQL ที่แตะสามตารางนี้ ต้อง quote ชื่อตารางและชื่อคอลัมน์ทุกตัวด้วย `"` เสมอ**
   รวมถึงใน `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX`, `TRUNCATE`, `INSERT`, `SELECT`,
   `ON CONFLICT`, และรายการคอลัมน์ของ `DO UPDATE SET`
2. **ระบุ schema `public.` กับชื่อตารางเสมอ** ตามรูปแบบของ `schoolbright-backend`
3. **ห้ามใช้ `SELECT *`** — ระบุคอลัมน์ที่ quote แล้วเสมอ
4. **`NpgsqlParameter` ยังเป็นข้อบังคับเหมือนเดิม** — การ quote identifier เป็นคนละเรื่องกับการ
   ป้องกัน SQL injection **ห้ามเข้าใจสลับกัน** และ **ห้ามต่อ string ชื่อคอลัมน์จากค่าที่รับเข้ามา**
5. **alias ฝั่ง C# ยังต้องมีเหมือนเดิมถ้าชื่อที่ต้องการต่างจากชื่อคอลัมน์** — การเปลี่ยนชื่อคอลัมน์
   ให้ตรงกับ property แล้ว **ไม่ได้แปลว่าตัด alias ออกได้อย่างปลอดภัยเสมอไป** ให้ตรวจทีละจุด
6. ตารางภายนอกที่อ่านอย่างเดียว (กลุ่มที่ 2 SB PLUS · กลุ่มที่ 3 ฐานข้อมูลเกรด) **ใช้ชื่อของตัวเอง
   ตามเดิมทุกตัว** — เช่น `PGTGradeDetail."sID"` ยังเป็น `"sID"` ตัวเล็ก **ห้าม "แก้ให้ตรงกัน"**

#### ไม่ต้อง migration/rename — v8

> **ยกเลิกในรอบ v8**: v7 เคยเขียนขั้นตอน `ALTER TABLE ... RENAME` ไว้ที่นี่ เผื่อกรณี dev/staging
> มีตาราง snake_case เดิมค้างอยู่ · **ผู้ใช้ยืนยันเมื่อ 2026-08-31 ว่าไม่มีกรณีนั้นจริง — ทั้งสาม
> ตารางยังไม่เคยถูกสร้างในฐานข้อมูลใด ๆ เลย** (ทุก phase ยังเป็น `deployed ⬜`) ขั้นตอนเต็มที่ถูก
> ถอดออก (รวมทั้งเหตุผลและ SQL เดิม) ย้ายไปเก็บที่ `design-archive.md` แล้ว

**สิ่งที่ต้องทำจริงจึงเหลือแค่**: แก้ `EnsureTables`/`EnsureTable` ในโค้ดให้ใช้ `CREATE TABLE IF NOT
EXISTS` ด้วยชื่อใหม่ตาม DDL ด้านบนตรง ๆ (Module C, DES-012) — ไม่มีขั้นตอน pre-deploy อื่นเพิ่มเติม
สำหรับสามตารางนี้ · **ถ้าพบว่า environment ใดมีตาราง snake_case เดิมอยู่จริงระหว่างทำงาน** (ขัดกับ
ข้อเท็จจริงที่ใช้ปิด OQ-19) ให้หยุดและส่งกลับ `system-analyst` + ผู้ใช้ทันที ไม่ใช่เดินหน้าเดา

**หมายเหตุการเป็นเจ้าของ**: `"TCompassMbtiResult"` (เดิม `compass_mbti_result`) **ไม่ได้อยู่ในตาราง
"Pre-existing assets reconciled" ของ `requirement.md`** (ที่นั่นระบุไว้แค่ 2 ตาราง) — ผมพบจากโค้ดจริง
`CompassMbtiStore.cs:94-98` และผู้ใช้ยืนยันเมื่อ 2026-08-25 ให้ถือเป็น **MVP ของที่มีอยู่แล้ว**
สอดคล้องกับ REQ-007 ที่กำหนดว่าต้องจำผลไว้ให้เห็นครั้งถัดไป · **v7: "ไม่ต้องทำอะไร" ไม่จริงอีกต่อไป**
— ตรรกะทางธุรกิจยังไม่ต้องแก้ แต่ชื่อตาราง/คอลัมน์ในโค้ดต้องแก้ตาม DES-012

### กลุ่มที่ 2 — ตาราง SB PLUS (อยู่ใน `JabjaiSchoolSingleDB`) — **อ่านอย่างเดียว ไม่ใช่ของ module นี้**

module นี้ **ห้าม** `CREATE` / `ALTER` / เขียนตารางกลุ่มนี้เด็ดขาด — เป็นระบบ entitlement ภายนอก
ที่ Compass แค่เรียกตรวจและบังคับผลตาม REQ-013

| ตาราง | คอลัมน์ที่ module นี้พึ่งพา | ใช้ทำอะไร | ระดับความเชื่อถือของชื่อคอลัมน์ |
|---|---|---|---|
| `TSubscription` | `subscription_id`, `sID`, `parent_code`, `status`, `expire_at`, **`subscription_plan_id`** | หาแถว subscription ที่ยังมีผลของนักเรียน · **`subscription_plan_id` คือค่าที่ใช้ join ต่อไปยัง `TPlan_Feature.plan_id` โดยตรง** | 🟡 จากเอกสาร handoff ยังไม่ตรวจกับ DB จริง |
| `TPlan_Feature` | `plan_id`, `feature_id`, `display_*` | รายการ feature ของแผน + ค่า override · `plan_id` รับค่ามาจาก `TSubscription.subscription_plan_id` | 🟡 จากเอกสาร handoff · ชื่อคอลัมน์ฝั่ง `display_*` ยังไม่ยืนยัน (OQ-15(b)) · **v4: ตารางนี้ไม่ใช่ที่เก็บตัวระบุ feature เชิงแนวคิด** — มันชี้ไปที่ `TFeatureSBPlus.feature_id` จึงรับความไม่เสถียรของเลขนั้นมาทั้งหมด (ดูด้านล่าง) |
| `TFeatureSBPlus` | `feature_id`, `feature_description`, `default_title`, `default_icon`, `schoolID` | ข้อมูลของ feature แต่ละตัว | 🟢 **v4 (2026-08-25): ผู้ใช้ยืนยันรายการคอลัมน์ครบทั้งตารางแล้ว** (9 คอลัมน์ — ดูหัวข้อย่อยด้านล่าง) · 🔴 **และผลคือไม่มีคอลัมน์ที่เก็บ feature key แบบ string อยู่จริงเลย** → OQ-15(a1) |
| `TParentStudent` | *(ไม่ใช้รอบนี้)* | flow ฝั่งผู้ปกครอง — **ไม่ implement** เพราะรอบนี้ไม่มี role ผู้ปกครอง (REQ ปิด OQ-01/OQ-02) | — |

**`TSubcriptionPlan` ถูกถอดออกจากตารางนี้แล้ว (2026-08-25 · v3) — ห้ามเอากลับเข้ามา**
เอกสารนี้จนถึง v2 ระบุ `TSubcriptionPlan` พร้อมคอลัมน์ `plan_id` ว่าเป็นตัวเชื่อม subscription → แผน
ซึ่งมาจากเอกสาร handoff **และเป็นข้อมูลผิด 2 ชั้น**: (1) ตารางนี้**ไม่มีคอลัมน์ `plan_id` อยู่จริง**
PK จริงคือ `subscription_plan_id` และ (2) **flow `CheckEntitlement` จริงไม่ได้ join ตารางนี้เลย**
(ผู้ใช้ตรวจ flow จริงแล้วยืนยัน 2026-08-25) · เส้นทางจริงคือ `TSubscription.subscription_plan_id`
→ `TPlan_Feature.plan_id` ตรง ๆ · ตารางนี้จึงไม่ใช่ dependency ของ module นี้ และหัวข้อนี้ประกาศ
เฉพาะ "คอลัมน์ที่ module นี้พึ่งพา" **ถ้าวันหน้าเปิด flow ผู้ปกครองแล้วจำเป็นต้องใช้ตารางนี้จริง
ต้องกลับมา amend ที่นี่ก่อน ไม่ใช่เพิ่ม join เอาเองในโค้ด**

**ที่มาและระดับความเชื่อถือ**: ชื่อตาราง/คอลัมน์และตรรกะการเช็คทั้งหมด**เดิม**มาจากเอกสาร dev-handoff
`sbplus-entitlement-check-logic.html` ที่ผู้ใช้ส่งมา (2026-08-25) และ**ไม่ได้ตรวจกับ schema จริง** เพราะ
`schema.prisma` ตัวจริงอยู่ใน repo แยก `sb-web-helper-2` ที่เซสชันนี้เข้าไม่ถึง → บันทึกเป็น **OQ-15**
**รอบ v3 ผู้ใช้ไปตรวจกับของจริงมาแล้วบางส่วน** และผลคือเอกสาร handoff **ผิดจริง 2 จุดจากที่ตรวจ 2 จุด**
(`TSubcriptionPlan.plan_id` และ `default_description`) — นี่ไม่ใช่ความบังเอิญ ให้ถือว่า**ทุกชื่อคอลัมน์
ที่ยังเป็น 🟡 ในตารางข้างบนมีโอกาสผิดสูง** · `backend-engineer` ต้องยืนยันกับ DB จริงก่อนเขียน query
(BE-013 / PRE-05) ถ้าไม่ตรง **ให้ส่งกลับมาที่ `system-analyst` ห้ามเดาชื่อคอลัมน์ใกล้เคียงเอาเอง**

**feature key ที่ต้องใช้** (ปิด OQ-14 แล้ว — v2): **`compass_premium`** สำหรับ REQ-013 และ
**`compass_admin_ops`** สำหรับ REQ-014 · ทั้งสองเป็นคนละ key กันโดยเจตนา และ**ยังไม่มี record จริง
ใน SB PLUS** ต้องให้ทีมที่ดูแล SB PLUS สร้างก่อน deploy → `## Deployment Prerequisites` (PRE-01/02)
· **แต่ทั้งสองชื่อนี้เป็น "key เชิงแนวคิด" ไม่ใช่ค่าที่มีคอลัมน์รองรับอยู่จริง** — ดูหัวข้อย่อยถัดไป

#### โครงสร้างจริงของ `TFeatureSBPlus` — ยืนยันครบทั้งตารางแล้ว (2026-08-25 · v4)

ผู้ใช้ส่งรายการคอลัมน์จริงทั้งตารางจาก `JabjaiSchoolSingleDB` มาให้ **ครบ 9 คอลัมน์ ไม่มีมากกว่านี้**
รายการนี้ปิดคำถาม "คอลัมน์ไหนเก็บ feature key" อย่างถาวร — **คำตอบคือไม่มีคอลัมน์นั้น**

| คอลัมน์ | ชนิด | Null | หมายเหตุ |
|---|---|---|---|
| `feature_id` | `integer` | NOT NULL | **PK · serial / auto-increment** — ค่าถูกกำหนดโดยลำดับการ insert ไม่ใช่โดยความหมายของ feature |
| `feature_description` | `text` | NOT NULL | คำอธิบาย · **ข้อมูลแสดงผล** ไม่มี unique constraint และแก้ได้จากฝั่งจัดการ SB PLUS |
| `default_icon` | `character varying` | nullable | ไอคอนเริ่มต้น (แสดงผล) |
| `default_title` | `character varying` | nullable | ชื่อที่แสดงเริ่มต้น (แสดงผล) |
| `schoolID` | `character varying` | nullable | **ตัวที่ทำให้ `feature_id` ไม่ปลอดภัยที่จะ hardcode** — ดูข้อ (2) ด้านล่าง |
| `created_by` | `character varying` | nullable | audit |
| `updated_by` | `character varying` | nullable | audit |
| `created_at` | `timestamp` | NOT NULL default `CURRENT_TIMESTAMP` | audit |
| `updated_at` | `timestamp` | NOT NULL default `CURRENT_TIMESTAMP` | audit |

*(ความยาวของ `character varying` แต่ละคอลัมน์ผู้ใช้ไม่ได้ระบุมา — เอกสารนี้จะไม่เดา
เพราะไม่มีผลต่อการเขียน query ของรอบนี้)*

> 🟡 **v9 (2026-09-01) — ตารางนี้จะมีคอลัมน์ที่ 10 เพิ่มเข้ามา แต่ยังไม่มีอยู่จริงวันนี้**
> ผู้ใช้ตัดสิน OQ-15(a1) ว่ากลไกระบุตัว feature = ทีมที่ดูแล SB PLUS **จะเพิ่ม**
> `"FeatureCode" varchar UNIQUE` ให้ตาราง `TFeatureSBPlus` (ดู `## Deployment Prerequisites`
> **PRE-06**) · **รายการ 9 คอลัมน์ด้านบนยังเป็นสภาพจริงของตาราง ณ วันนี้** — ห้ามเขียนโค้ดอ้างอิง
> `"FeatureCode"` ก่อนที่ PRE-06 จะเสร็จและมีการยืนยันกลับมาว่าคอลัมน์ถูกสร้างแล้วจริง ·
> ค่าที่ `"FeatureCode"` ต้องเก็บสำหรับ `compass_premium`/`compass_admin_ops` ยังไม่ถูกกำหนด
> (OQ-15(a2)) — ทีม SB PLUS ต้องส่งค่ากลับมาให้ `system-analyst` amend หัวข้อนี้อีกรอบ
>
> 🟢 **v10 (2026-09-01) — แก้ชื่อคอลัมน์เป็น `"FeatureCode"` (PascalCase) แทน `feature_code`
> (snake_case)** ตามการตัดสินใจเรื่อง naming ของผู้ใช้ (สอดคล้อง OQ-19 ตัวเลือก C) — เป็นการแก้ชื่อ
> เท่านั้น ไม่กระทบมติ OQ-15(a1) หรือสถานะบล็อกใด ๆ ข้างต้น

**สิ่งที่โครงสร้างนี้บอก และเป็นเหตุผลที่ `CheckEntitlement` ยัง implement ไม่ได้:**

1. **ไม่มีคอลัมน์ key แบบ string ที่เสถียรเลย** · ตัวที่เป็น text/varchar ทั้งหมด
   (`feature_description`, `default_title`, `default_icon`) เป็น**ข้อมูลแสดงผล**
   ไม่ใช่ตัวระบุ: ไม่มี unique constraint และแก้ไขได้จากฝั่งจัดการ SB PLUS
   → การเทียบ `compass_premium` กับคอลัมน์พวกนี้คือการ**ผูกการอนุญาตสิทธิ์เข้ากับข้อความที่แก้ได้**
   (ดู RISK-08)
2. **`schoolID` มีอยู่และเป็น nullable** → เป็นไปได้ 2 แบบที่ให้ผลต่างกันคนละทาง และเอกสารนี้
   **ยังไม่ทราบว่าแบบไหน**: (i) ตารางนี้เป็น catalog กลางทั้งเครือข่าย โดย `schoolID = NULL`
   หมายถึง global — `feature_id` หนึ่งค่าใช้ได้ทุกโรงเรียน · หรือ (ii) ตารางนี้เก็บ feature
   **แยกตามโรงเรียน** — `compass_premium` จะกลายเป็น **หลายแถว หลาย `feature_id`**
   และการ hardcode เลขเดียวจะถูกเฉพาะโรงเรียนเดียว **เงียบ ๆ** (โรงเรียนอื่นได้ 403 ทั้งที่จ่ายเงินแล้ว
   เพราะกฎ fail-closed) · นอกจากนี้ `feature_id` ที่เป็น serial ยัง**ต่างกันระหว่าง environment**
   (staging/prod insert คนละลำดับ) จึงไม่ใช่ค่าที่เขียนลงโค้ดได้
3. **`TPlan_Feature` ไม่ได้ช่วยเรื่องนี้** — มันชี้ไปที่ `TFeatureSBPlus.feature_id` จึงรับความ
   ไม่เสถียรของเลขนั้นมาทั้งหมด และไม่มีคอลัมน์ตัวระบุเชิงแนวคิดของตัวเอง

→ **กลไกการระบุตัว feature — OQ-15(a1) ตัดสินแล้ว (2026-09-01, ตัวเลือก i): เพิ่มคอลัมน์
`"FeatureCode" varchar UNIQUE`** · เป็นการตัดสินใจของผู้ใช้ + ทีมที่ดูแล SB PLUS **ไม่ใช่สิ่งที่
`backend-engineer` ไปตรวจ DB แล้วจะได้คำตอบมาเอง** (BE-013 ตรวจได้แค่ว่าคอลัมน์ชื่ออะไร ซึ่งตอนนี้
ทราบครบแล้วและคำตอบคือไม่มี — ยังไม่มีจนกว่า PRE-06 จะเสร็จ) · **ห้ามเลือกกลไกอื่นเองในโค้ด และ
ห้ามอ้างอิงคอลัมน์ `"FeatureCode"` ก่อนที่ PRE-06 จะยืนยันว่าถูกสร้างแล้วจริง** — ดูรายละเอียด
ที่ `## Premium Entitlement Rules` ขั้นตอนที่ 4 และ `## Unresolved Open Questions` OQ-15(a1)/(a2)

### กลุ่มที่ 3 — ตารางฐานข้อมูลเกรด (อยู่ใน `PGGradeDB` / school DB) — **อ่านอย่างเดียว ไม่ใช่ของ module นี้**

| ตาราง | คอลัมน์ที่พึ่งพา | หมายเหตุ |
|---|---|---|
| `PGTGrade` | `nGradeId`, `SchoolID`, `nTerm`, `nTermSubLevel2`, `sPlaneID`, `cDel` | อ่านผ่าน read replica `PGGradeDBReadReplicaEntities` |
| `PGTGradeDetail` | `nGradeDetailId`, `nGradeId`, `sID`, `getScore100`, `getGradeLabel`, `getSpecial`, **`nCredit`**, `cDel` | `nCredit` คือแหล่งหน่วยกิตหลักของ REQ-012 |
| `PGTGradeEdit` | `GradeDetailID`, `SchoolID`, `getScore100`, `getGradeLabel`, `cDel` | override เกรดที่ครูแก้ |
| `TPlane` | `sPlaneID`, `SchoolID`, `sPlaneName`, `courseCode`, `courseGroup`, **`nCredit`** | ชื่อวิชา + หน่วยกิต fallback |
| `TSubLevel`, `TTermSubLevel2` | `nTSubLevel`, `MasterCode`, `SubLevelNameTH`, `fullName`, `SubLevel`, `nTermSubLevel2` | ใช้เทียบระดับชั้นข้ามโรงเรียน |

**ข้อสำคัญเรื่องชนิดข้อมูล**: `getScore100` เป็น **text ไม่ใช่ตัวเลข** ค่าที่เจอจริงมีทั้ง `"85"`,
`"85.50"`, `""`, `null` และ marker ที่ไม่ใช่ตัวเลข — การแปลงต้องใช้
`double.TryParse(..., CultureInfo.InvariantCulture)` แปลงไม่ได้ = ไม่มีคะแนน (ไม่ใช่ 0)
ตรรกะนี้มีอยู่แล้วใน `CompassScoreService.ParseScore` **ห้ามเขียนใหม่ให้ต่างไปจากนี้**

### รูปแบบการเข้าถึงข้อมูล (EF6) — สัญญาสำหรับ `backend-engineer`

- **ไม่มี EF entity ของตาราง SB PLUS ในโปรเจกต์นี้** (ตรวจแล้ว: `TSubscription` ไม่ปรากฏใน
  `sb-web-student` เลย) → ต้องใช้ **raw SQL ผ่าน `context.Database.SqlQuery<T>()` พร้อม
  `NpgsqlParameter`** ซึ่งเป็น pattern เดียวกับที่ `CompassRankingService` / `CompassMbtiStore`
  ใช้อยู่แล้ว · **ห้ามต่อ string เข้าไปใน SQL เด็ดขาด — parameter เท่านั้น**
- connection ที่ต้องใช้: `ApiBaseController.GetSchoolConnection()` → `JabjaiSchoolSingleDBEntities`
  **มีให้ทุก endpoint อยู่แล้ว ไม่ต้องเพิ่ม connection string หรือ config ใหม่**
- ห้ามเพิ่ม `CREATE TABLE IF NOT EXISTS` **ของตารางใหม่** ใด ๆ ในรอบนี้ · **v7: การแก้คำสั่ง
  `CREATE TABLE IF NOT EXISTS` เดิมใน `EnsureTables`/`EnsureTable` ให้ใช้ชื่อใหม่ ไม่ถือว่าผิดข้อนี้**
  — เป็นตารางเดิมสามตัวเดิม ไม่ใช่ตารางใหม่
- **v7: ทุก query ที่แตะสามตารางของกลุ่มที่ 1 ต้อง quote ชื่อตาราง/คอลัมน์และระบุ `public.` เสมอ**
  ตาม `## Data Model` → กฎการ quote identifier · **ลืม quote = query พังตอน runtime ไม่ใช่ตอน build**
  และไม่มี EF entity มาช่วยจับ เพราะทั้งหมดเป็น raw SQL

## DES-015 — Subject Score Aggregation Rules

> **DES-015** — traceability id ของหัวข้อนี้ (ลงทะเบียนระหว่าง reconciliation pass 2026-09-07 ·
> ไม่ใช่การตัดสินใจใหม่ กติกาในหัวข้อนี้ไม่เปลี่ยน · ดูแถวใน `## Feature-by-Feature Feasibility`)

**สัญญาของ REQ-012 — เป็นจุดที่ผิดง่ายที่สุดใน module นี้ อ่านให้ครบก่อนเขียนโค้ด**

### กฎข้อที่ 0 — ต้องมีสองสูตร ไม่ใช่สูตรเดียว

`CompassScoreService.AggregateByCanonicalSubject` ปัจจุบันถูกเรียกจากทั้งฝั่งฟรีและฝั่ง Premium
(`analyst/{sID}`, `calculate/score`, `GetSubjectAveragesAsync`, และ batch)
**ห้ามแก้เมธอดนี้ทับให้กลายเป็นถ่วงน้ำหนัก** เพราะฝั่งฟรีต้องคงค่าเฉลี่ยดิบไว้ตามที่ผู้ใช้กลับคำไว้

ให้เพิ่ม **เมธอดใหม่แยกต่างหาก** เช่น `AggregateByCanonicalSubjectWeighted(...)` แล้วเปลี่ยน
เฉพาะ caller ที่ระบุในตารางด้านล่าง:

| Caller | ใช้สูตรไหน | เหตุผล |
|---|---|---|
| `analyst/{sID}` — REQ-001/REQ-002 (ฟรี) | **ค่าเฉลี่ยดิบธรรมดา (เดิม)** | ผู้ใช้กลับคำแล้วว่าฟีเจอร์ฟรีไม่เปลี่ยนสูตร |
| `calculate/score` — REQ-004/REQ-016 (Premium) | **ถ่วงน้ำหนัก** | REQ-016 AC1 บังคับให้แสดงคะแนนที่ถ่วงน้ำหนักแล้ว |
| `GetSubjectAveragesAsync` → Fit Score / Gap (REQ-005/REQ-006) | **ถ่วงน้ำหนัก** | REQ-012 ระบุ Fit Score เป็น consumer ตรง ๆ |
| `CompassRankingService.RecomputeAsync` (batch) | **ถ่วงน้ำหนัก** | ผู้ใช้ยืนยัน 2026-08-25 — ดู `## National Stats Batch Rules` |
| `GetStudentNationalStatsAsync` (คำนวณสดตอน request) | **ถ่วงน้ำหนัก** | ต้องตรงกับ batch ไม่งั้นอันดับเพี้ยน |

### กฎข้อที่ 1 — สูตร

```
คะแนนกลุ่มสาระ = Σ(คะแนนวิชา_i × หน่วยกิตวิชา_i) / Σ(หน่วยกิตวิชา_i)
```
โดย `i` = ทุกวิชาที่ map เข้ากลุ่มสาระเดียวกัน **และ** มีคะแนนเป็นตัวเลข **และ** มีหน่วยกิตที่ใช้ได้

### กฎข้อที่ 2 — "หน่วยกิตที่ใช้ได้" หมายถึงอะไร

หน่วยกิตของวิชาหนึ่งถือว่า **ใช้ไม่ได้** เมื่อเป็น `null` **หรือ `<= 0`**

- วิชาที่หน่วยกิตใช้ไม่ได้ **ถูกตัดออกจากทั้งตัวตั้งและตัวหารของสูตรถ่วงน้ำหนัก**
  (ไม่ใช่นับเป็น 0 แล้วยังอยู่ในตัวตั้ง)
- **จุดนี้ต่างจากโค้ดปัจจุบัน** — `TotalCredit = gr.Sum(x => x.Credit ?? 0)` ตอนนี้แปลง null เป็น 0
  ซึ่งใช้กับสูตรใหม่ไม่ได้ ต้องแยกให้ชัดระหว่าง "หน่วยกิต 0" กับ "ไม่มีข้อมูลหน่วยกิต"
- ที่มาของหน่วยกิตยังเป็นของเดิม: `PGTGradeDetail.nCredit` ถ้าเป็น null ตกไปที่ `TPlane.nCredit`
  (`CompassScoreService.cs:199`) — ตรรกะนี้ไม่ต้องแก้

### กฎข้อที่ 3 — วิชาที่ไม่มีคะแนนเป็นตัวเลข

ตัดออกทั้งตัวตั้งและตัวหาร **เสมอ** ไม่ว่าจะมีหน่วยกิตหรือไม่ (REQ-012 AC3)
วิชาที่ `CanonicalSubject` เป็น `null` (non-core: ชุมนุม กิจกรรม สอนซ่อมเสริม) ก็ตัดออกเช่นกัน

### กฎข้อที่ 4 — fallback เมื่อหน่วยกิตรวม = 0

ถ้าในกลุ่มสาระหนึ่ง ผลรวมหน่วยกิตของวิชาที่มีคะแนน = 0 (ทุกวิชาไม่มีข้อมูลหน่วยกิต)
→ **ใช้ค่าเฉลี่ยคะแนนดิบธรรมดา (simple average) ของทุกวิชาที่มีคะแนนเป็นตัวเลขในกลุ่มนั้น**

- **ห้ามหารด้วยศูนย์ ห้ามคืน 0 ห้าม error ให้ผู้ใช้เห็น**
- **fallback นี้ต้องอยู่ในเมธอดเดียวกัน** เพื่อให้ทุก consumer ได้เลขเดียวกันโดยอัตโนมัติ
  ห้ามให้แต่ละ caller ทำ fallback เอง (REQ-012 AC4 บังคับว่าทุกจุดต้องได้เลขเดียวกัน)
- กลุ่มสาระที่ **ไม่มีวิชาที่มีคะแนนเลย** → **ไม่มีค่า ตัดกลุ่มนั้นทิ้ง** (ไม่ใช่ 0 ไม่ใช่ fallback)
- กลุ่มสาระที่ **บางวิชามีหน่วยกิต บางวิชาไม่มี** → **ไม่เข้า fallback** เพราะหน่วยกิตรวม ≠ 0
  ใช้สูตรถ่วงน้ำหนักกับเฉพาะวิชาที่หน่วยกิตใช้ได้ ตามกฎข้อ 2

### กฎข้อที่ 5 — การปัดเศษ (ถ้าทำผิดข้อนี้ acceptance criteria จะไม่ผ่าน)

- ค่าคะแนนกลุ่มสาระที่คำนวณได้ ให้ **ปัดเป็นทศนิยม 2 ตำแหน่ง** (`Math.Round(x, 2)`)
- **ค่าที่ส่งออกทาง API ฝั่ง Premium ทุกตัวต้องเป็นทศนิยม 2 ตำแหน่ง ไม่ใช่จำนวนเต็ม** —
  REQ-012 AC1 บังคับว่าต้องแสดง **67.5** · โค้ดปัจจุบันของจุดต่าง ๆ ต้องปฏิบัติตามนี้:
  - `calculate/score` (`CompassApiController.cs:269`): ห้ามใช้ `Math.Round(a.AverageScore, 0)` ซึ่งจะได้ 68 → **ต้องแก้ให้ส่ง 2 ตำแหน่ง**
  - `AI_advice/path` (REQ-006, Gap Report ใน `CompassPathCatalog.cs:105` `BuildAdvice`): **ห้าม re-round คะแนนเฉลี่ยเป็นจำนวนเต็ม 0 dp** (`Math.Round(avg[kv.Key], 0)`) ต้องเก็บ `VMGapItem.Current` เป็นทศนิยม 2 ตำแหน่ง (`Math.Round(avg[kv.Key], 2)`), คำนวณ `VMGapItem.Gap = Math.Round(Math.Max(0.0, target - cur), 2)`, และข้อความ `advice` แสดงทศนิยมตามจริง (`{m.Gap:0.##}`) ป้องกันปัญหา 67.5 แสดงเป็น 68 และ Gap เพี้ยน (ปิด **ISS-01**, 2026-09-15)
- ฝั่งฟรี (`analyst/{sID}`) **คงการปัดเป็นจำนวนเต็มไว้เหมือนเดิม** ห้ามแตะ
- การตัดระดับ strong/normal/weak ให้ใช้ค่า **หลังปัด 2 ตำแหน่ง** เทียบกับเกณฑ์
- เกณฑ์คงเดิมและเท่ากันทุกกลุ่มสาระ: **≥ 80 = strong · < 60 = weak · 60–79.99 = normal**

### ตัวอย่างที่ต้องผ่าน (จาก REQ-012)

| กรณี | ข้อมูล | ผลที่ต้องได้ |
|---|---|---|
| ถ่วงน้ำหนักปกติ | คณิตพื้นฐาน 60 (1.5 นก.) · คณิตเพิ่มเติม 90 (0.5 นก.) | **67.5** → `normal` |
| หน่วยกิตสลับ | คณิตพื้นฐาน 60 (0.5) · คณิตเพิ่มเติม 90 (1.5) | **82.5** → `strong` |
| fallback | ศิลปะ 70 และ 80 ทั้งคู่ไม่มีหน่วยกิต | **75** (ค่าเฉลี่ยธรรมดา) · Fit Score ที่อ้างศิลปะต้องใช้ 75 ตัวเดียวกัน |
| ไม่มีคะแนนเลย | ศิลปะไม่มีวิชาที่มีคะแนน | **ไม่มีค่า** ตัดกลุ่มทิ้ง (ไม่ใช่ 0) |
| Gap Report (ISS-01) | คณิตถ่วงน้ำหนักได้ 67.50 · เป้าหมายสายการเรียน 75.00 | **Current = 67.5**, **Gap = 7.5** (ไม่ใช่ Current 68, Gap 7) |

Contract:SubjectScoreAggregation.v1 — สัญญาการรวมคะแนนรายกลุ่มสาระฝั่ง Premium: ถ่วงน้ำหนักด้วยหน่วยกิต Σ(คะแนน×หน่วยกิต)/Σ(หน่วยกิต) นับเฉพาะวิชาที่มีคะแนนเป็นตัวเลขและหน่วยกิตใช้ได้ (ไม่ใช่ null และ > 0 — นอกนั้นตัดออกทั้งตัวตั้งและตัวหาร) · หน่วยกิตรวม = 0 → ค่าเฉลี่ยดิบธรรมดาในเมธอดเดียวกัน · ไม่มีวิชาที่มีคะแนนเลย → ตัดกลุ่มทิ้ง (ไม่ใช่ 0) · ปัด 2 ตำแหน่งก่อนตัดระดับ (≥ 80 strong · < 60 weak) และทุก endpoint ฝั่ง Premium (`calculate/score`, Gap Report `AI_advice/path` ใน `VMGapItem.Current` และ `VMGapItem.Gap`) ต้องคงทศนิยม 2 ตำแหน่ง ห้าม re-round เป็น 0 dp (ปิด ISS-01 · 2026-09-15) — ดู `## DES-015` ด้านบน
DEC-015 — ห้ามแก้ `AggregateByCanonicalSubject` เดิมทับ (ฝั่งฟรี `analyst/{sID}` คงค่าเฉลี่ยดิบและการปัดจำนวนเต็มไว้เหมือนเดิม) ให้เพิ่มเมธอดถ่วงน้ำหนักแยกต่างหาก (`AggregateByCanonicalSubjectWeighted`) แล้วเปลี่ยนเฉพาะ caller ฝั่ง Premium/batch ตามตาราง caller ข้างบน และ fallback ต้องอยู่ในเมธอดเดียวกัน ห้ามให้แต่ละ caller ทำเอง เพื่อให้ทุก consumer ได้เลขเดียวกัน · ทั้งนี้ caller ปลายทางฝั่ง Premium ทั้ง `calculate/score` และ `CompassPathCatalog.BuildAdvice` (`AI_advice/path`) ต้องไม่ re-round คะแนนเป็นจำนวนเต็ม (0 dp) โดยเด็ดขาด (ปิด ISS-01) — ดู `## DES-015` ด้านบน

Evidence EVD-001: claim=DES-015 | state=confirmed | path=ClassOnlineWeb/Helper/CompassScoreService.cs | symbol=AggregateByCanonicalSubject | line=214 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6dfb00c0d5804542dc39cedc0da77d9c81f97b4ecb8003524dfb3ddcdb32fdc5
Evidence EVD-002: claim=Contract:SubjectScoreAggregation.v1 | state=confirmed | path=ClassOnlineWeb/Helper/CompassScoreService.cs | symbol=AggregateByCanonicalSubjectWeighted | line=245 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6dfb00c0d5804542dc39cedc0da77d9c81f97b4ecb8003524dfb3ddcdb32fdc5
Evidence EVD-003: claim=DEC-015 | state=confirmed | path=ClassOnlineWeb/Helper/CompassScoreService.cs | symbol=GetCanonicalSubjectAveragesAsync | line=282 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6dfb00c0d5804542dc39cedc0da77d9c81f97b4ecb8003524dfb3ddcdb32fdc5
Evidence EVD-022: claim=DEC-015 | state=confirmed | path=ClassOnlineWeb/Helper/CompassPathCatalog.cs | symbol=BuildAdvice | line=105 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=95a48a0c19e0d9db0d4ea7c17f8bff62b69fdfc47365bffdfb352985fdd18879

Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: none
Fallback: ผลรวมหน่วยกิตของกลุ่มสาระ = 0 → ใช้ค่าเฉลี่ยคะแนนดิบธรรมดา (simple average) ของทุกวิชาที่มีคะแนนเป็นตัวเลขในกลุ่มนั้น ภายในเมธอดเดียวกัน (AggregateByCanonicalSubjectWeighted) — ห้ามหารด้วยศูนย์ ห้ามคืน 0 ห้าม error ให้ผู้ใช้เห็น และห้ามให้ caller ทำ fallback เอง · กลุ่มสาระที่ไม่มีวิชาที่มีคะแนนเลย → ตัดกลุ่มนั้นทิ้ง (ไม่มีค่า ไม่ใช่ 0)
Material ambiguity: none

## DES-016 — Premium Entitlement Rules

> **DES-016** — traceability id ของหัวข้อนี้ (ลงทะเบียนระหว่าง reconciliation pass 2026-09-07 ·
> ไม่ใช่การตัดสินใจใหม่ กติกาในหัวข้อนี้ไม่เปลี่ยน · ดูแถวใน `## Feature-by-Feature Feasibility`)

**สัญญาของ REQ-013 + REQ-014**

### feature key ที่ต้องใช้ (ยืนยันโดยผู้ใช้ 2026-08-25 — ปิด OQ-14)

| feature key | ใช้กับ | ผูกกับแพ็กเกจ |
|---|---|---|
| **`compass_premium`** | ทุก endpoint Premium ของ REQ-003/004/005/006/007/008 และ `certificate/issue` | แพ็กเกจนักเรียน/ผู้ปกครอง (ผ่าน `TPlan_Feature.plan_id`) |
| **`compass_admin_ops`** | `recompute/national-stats` และ `recompute/status` (REQ-014) เท่านั้น | **เฉพาะแพ็กเกจ staff/internal — ห้ามผูกกับแพ็กเกจที่ขายให้นักเรียน/ผู้ปกครองเด็ดขาด** |

**ทั้งสองเป็นคนละ key กันโดยเจตนา ห้ามใช้ตัวเดียวกัน** — ถ้า `recompute` ถูกผูกกับ
`compass_premium` นักเรียนที่จ่ายเงินทุกคนจะสั่ง `TRUNCATE` สถิติทั้งเครือข่ายได้
ซึ่งขัดกับ REQ-014 ที่บังคับว่า "นักเรียนทั่วไปต้องเรียกไม่ได้เด็ดขาด" (นักเรียนที่จ่ายเงินก็ยังเป็นนักเรียน)

**ทั้งสอง key ยังไม่มี record จริงใน SB PLUS** → ดู `## Deployment Prerequisites`

### แหล่งความจริง

เลิกใช้ `localStorage['compass_premium']` (`compass.js:60`) โดยสิ้นเชิง — มันเป็น flag ฝั่ง client
ที่ใครก็แก้ได้ · แหล่งความจริงใหม่คือ **SB PLUS** ใน `JabjaiSchoolSingleDB`

### ขั้นตอนการเช็คสิทธิ์ (`CheckEntitlement(sID)`)

1. หาแถว subscription ที่ยังมีผล:
   ```sql
   SELECT * FROM TSubscription
   WHERE sID = @sID
     AND status IN ('Active', 'PendingCancel')
     AND expire_at >= NOW()
   ORDER BY subscription_id DESC
   LIMIT 1
   ```
2. **ไม่เจอแถว → `{ entitled: false, features: [] }`** ไม่มีสิทธิ์อะไรเลย
3. เจอแถว → ดึงรายการ feature ของแผนนั้น โดย join **สองตาราง ไม่ใช่สามตาราง** (แก้ใน v3):
   ```sql
   SELECT pf.feature_id, f.feature_description
   FROM   TPlan_Feature pf
   JOIN   TFeatureSBPlus f ON f.feature_id = pf.feature_id
   WHERE  pf.plan_id = @subscription_plan_id   -- ค่าจากแถว TSubscription ที่ได้ในข้อ 1
   ```
   - **ห้าม join `TSubcriptionPlan`** — ผู้ใช้ตรวจ flow `CheckEntitlement` จริงแล้วยืนยัน (2026-08-25)
     ว่าเส้นทางจริงคือ `TSubscription.subscription_plan_id` → `TPlan_Feature.plan_id` **ตรง ๆ**
     และ `TSubcriptionPlan` **ไม่มีคอลัมน์ `plan_id`** (PK จริงคือ `subscription_plan_id`)
     การ join สามตารางตามที่เอกสารนี้เขียนไว้จนถึง v2 จะพังตอน runtime
   - คอลัมน์คำอธิบายฝั่ง `TFeatureSBPlus` ชื่อ **`feature_description`** (ยืนยันกับ DB จริงแล้ว)
     **ไม่ใช่ `default_description`** ตามที่เอกสารนี้เขียนไว้จนถึง v2
   - **การตัดสินสิทธิ์ในข้อ 4 ใช้เฉพาะ "มี feature key ที่ต้องการอยู่ในรายการหรือไม่" เท่านั้น
     คำอธิบายเป็นข้อมูลแสดงผลล้วน ๆ ไม่มีผลต่อการอนุญาต** — ดังนั้นถ้าคอลัมน์ฝั่ง override
     (`pf.display_*` ตาม pattern `COALESCE` ที่ v2 เขียนไว้) กลายเป็นชื่ออื่นหรือไม่มีอยู่จริง
     **ต้องไม่ทำให้การเช็คสิทธิ์พัง** · **ชื่อคอลัมน์ฝั่ง `display_*` ยังไม่ได้ยืนยันกับ DB จริง → OQ-15**
     ห้ามเดา · ถ้ามีจริงให้ใช้ `COALESCE(pf.<display column>, f.feature_description)` ถ้าไม่มี
     ให้อ่านจาก `f.feature_description` อย่างเดียว แล้วแจ้งกลับ `system-analyst` ให้ amend ข้อนี้
4. ตรวจว่ารายการ feature ที่ได้มี **feature ที่ต้องการ** (Compass Premium / Compass Admin Ops)
   หรือไม่
   - 🟡 **v9 (2026-09-01) — กลไกตัดสินแล้ว (OQ-15(a1), ตัวเลือก i) แต่ขั้นตอนนี้ยังเขียนโค้ดไม่ได้**
     ผู้ใช้ตัดสินให้ทีมที่ดูแล SB PLUS **เพิ่มคอลัมน์ `"FeatureCode" varchar UNIQUE`** ให้
     `TFeatureSBPlus` แล้วให้ขั้นตอนนี้เทียบด้วยค่าคอลัมน์นั้นแทนการเทียบข้อความ/เลข `feature_id`
     ตรง ๆ:
      ```sql
      -- รูปแบบที่ต้องใช้หลัง PRE-06 เสร็จ (ค่าจริงของ @compass_premium_code /
      -- @compass_admin_ops_code ปิดแล้ว 2026-09-15: 'compass_premium' และ 'compass_admin_ops'
      -- กำหนดผ่าน configuration/constant ใน CompassEntitlementService)
      SELECT 1 FROM TFeatureSBPlus f
      WHERE f.feature_id = @feature_id_from_step_3
        AND f."FeatureCode" = @required_feature_code
      ```
    - ✅ **v15 (2026-09-15) — ปิด OQ-15(a2) ฝั่งธุรกิจ**: ผู้ใช้ยืนยันรหัส FeatureCode ในระบบ SB PLUS แล้ว:
      - Premium: **`compass_premium`**
      - Admin Ops: **`compass_admin_ops`**
      ตรงกับค่าคงที่ที่โค้ดจริงใน `CompassEntitlementService.cs` (`FeatureKeyPremium = "compass_premium"`, `FeatureKeyAdminOps = "compass_admin_ops"`) ใช้งานอยู่แล้ว จึงไม่มี drift ระหว่างข้อกำหนดทางธุรกิจกับโค้ด
    - **การเตรียมระบบเพื่อ deploy (PRE-06)**: ทีมดูแล SB PLUS หรือ devops ต้องรันสคริปต์ `_docs/module/sb-compass/sql/pre-06-add-feature-code.sql` เพื่อสร้างคอลัมน์ `"FeatureCode"` และกำหนดค่า 'compass_premium' / 'compass_admin_ops' ในตาราง `TFeatureSBPlus` ของ `JabjaiSchoolSingleDB` ก่อน deploy
    - **ส่วนที่ไม่ติดข้อนี้และทำได้เลย**: ขั้นตอนที่ 1–3 (query subscription + join 2 ตาราง),
      กฎ fail-closed ทั้งหมด, และ BE-008 (IP allowlist) — เขียนได้ทันทีโดยไม่ต้องรอ PRE-06

### กฎที่ห้ามผ่อน

- **`sID` ต้องมาจาก `UserData.UserID` (JWT) เท่านั้น** ห้ามรับจาก client ทุกกรณี (กัน IDOR)
- **`sID` ไม่ใช่ `parent_code` และไม่ใช่ `subscription_id`** — เป็นคนละฟิลด์ อย่าสลับ
- **`status` ต้องยอมรับทั้ง `'Active'` และ `'PendingCancel'`** — `PendingCancel` ถือว่ายังมีสิทธิ์
  **นี่คือการออกแบบที่ตั้งใจ ไม่ใช่บั๊ก** ห้าม "แก้ให้ถูก" เป็นเฉพาะ `Active`
- **`expire_at` ต้องเช็คคู่กับ `status` เสมอ** ไม่ใช่เช็คอย่างใดอย่างหนึ่ง
- flow ฝั่งผู้ปกครอง (`type=parent`, LEFT JOIN `TParentStudent`) **ไม่ implement รอบนี้**
  เพราะไม่มี role ผู้ปกครอง — ถ้าวันหน้าเปิด ต้องกลับมา amend และ `parent_code` ต้องอ่านจาก JWT เท่านั้น

### กรณีที่ requirement ไม่ได้ระบุ — ผมกำหนดให้ตรงนี้ (engineer ห้ามตัดสินเอง)

| กรณี | ต้องทำอย่างไร |
|---|---|
| **ไม่มีสิทธิ์** | คืน **HTTP 403** พร้อม `VMResponseModel` ที่ `Data = null` · **ห้ามคืน payload Premium แล้วให้หน้าจอซ่อน** (REQ-013 บังคับ) |
| **DB entitlement ล่ม / query throw** | **fail-closed — ถือว่าไม่มีสิทธิ์ (403)** ห้าม fail-open เด็ดขาด · ต่างจาก `CompassMbtiStore.GetLatest` ที่กลืน exception ได้ เพราะนั่นเป็นเรื่องความสะดวก ส่วนนี่เป็นเรื่องสิทธิ์ |
| **`expire_at` เป็น NULL** | ถือว่า **ไม่ผ่าน** (ไม่มีสิทธิ์) — เงื่อนไข `expire_at >= NOW()` เป็นเท็จเมื่อ NULL อยู่แล้ว อย่าเขียน logic พิเศษให้ NULL แปลว่าไม่มีวันหมดอายุ |
| **นักเรียนมีหลาย subscription** | `ORDER BY subscription_id DESC LIMIT 1` — เอาแถวล่าสุดแถวเดียว ตามที่เอกสาร SB PLUS กำหนด |
| **เรียกซ้ำหลายครั้งใน request เดียว** | cache ผลไว้ต่อ request ได้ (เช่นตัวแปร local) **ห้าม cache ข้ามr request** — สิทธิ์อาจหมดอายุระหว่างนั้น |

### endpoint ที่ต้องกั้น (REQ-013)

| endpoint | REQ | วิธีกั้น |
|---|---|---|
| `POST analyst/{sID}` | REQ-003 | **กั้นระดับ field ไม่ใช่ทั้ง endpoint** — ดูหัวข้อย่อยด้านล่าง |
| `POST calculate/score` | REQ-004, REQ-016 | กั้นทั้ง endpoint |
| `POST AI_calculate/path` | REQ-005 | กั้นทั้ง endpoint |
| `POST AI_advice/path` | REQ-006 | กั้นทั้ง endpoint |
| `POST AI_mbti/questions` · `AI_mbti/answer` · `AI_mbti/latest` | REQ-007 | กั้นทั้ง endpoint ทั้งสามตัว |
| `POST AI_exercise/path` · `AI_exercise/submit` | REQ-008 | กั้นทั้ง endpoint (แม้ตัวฟีเจอร์ยังไม่เสร็จ) |
| `POST certificate/issue` | REQ-011 | กั้นทั้ง endpoint (แม้ module ใบรับรองจะแยกไปทำภายหลัง) |

**กรณีพิเศษ `analyst/{sID}` — จุดที่ engineer จะทำผิดถ้าไม่อ่านตรงนี้**
endpoint นี้ให้บริการ **ทั้งฟีเจอร์ฟรีและฟีเจอร์ Premium ในตัวเดียวกัน**:
- ฟรี (REQ-001/REQ-002): `Subjects[].Subject/Score/Level/HighlightTopic` + `AiSummary` + `PassScore`
- **Premium (REQ-003): `Subjects[].Boost`** เท่านั้น (`CompassApiController.cs:56`)

→ **ห้ามคืน 403 ทั้ง endpoint** เพราะจะทำให้ฟีเจอร์ฟรีพัง (ขัด REQ-016 AC6 ที่บังคับว่าหน้าฟรีต้องไม่เปลี่ยน)
→ ถ้าไม่มีสิทธิ์: คืน 200 ตามปกติแต่ **`Boost` ต้องเป็น `null` ทุกวิชา** ไม่ใช่คำนวณแล้วให้หน้าจอซ่อน

### REQ-014 — `recompute/national-stats` — ต้องมีการป้องกัน **สองชั้น**

ครอบคลุมทั้ง `recompute/national-stats` และ `recompute/status` (ตัวหลังเปิดเผยสถานะงาน batch
ระดับเครือข่าย ไม่ควรให้นักเรียนทั่วไปเห็น)

**ชั้นที่ 1 — entitlement**: ใช้ `CheckEntitlement` ตัวเดียวกัน แต่ตรวจ feature key
**`compass_admin_ops`** ไม่ใช่ `compass_premium`

**ชั้นที่ 2 — IP / internal-network allowlist**: ต้องผ่านการตรวจว่า request มาจาก
internal network / IP ที่อนุญาต **ก่อน** ตรวจ entitlement · ไม่ผ่าน → **404 หรือ 403 โดยไม่เปิดเผย
ว่ามี endpoint นี้อยู่**

**ทำไมต้องสองชั้น**: endpoint นี้สั่ง `TRUNCATE` สองตารางของทั้งเครือข่ายในคำสั่งเดียว
การพึ่งชั้น entitlement อย่างเดียวแปลว่าความผิดพลาดในการตั้งค่าฝั่ง SB PLUS เพียงจุดเดียว
(ผูก `compass_admin_ops` เข้าแพ็กเกจที่ขายให้นักเรียนโดยไม่ตั้งใจ) จะเปิดช่องให้ลบข้อมูล
ทั้งเครือข่ายได้ทันที · ชั้น IP เป็นตัวกันไม่ให้ความผิดพลาดฝั่งการตั้งค่ากลายเป็นความเสียหายจริง
**ห้ามตัดชั้นใดชั้นหนึ่งออกเพราะเห็นว่าซ้ำซ้อน — ความซ้ำซ้อนคือจุดประสงค์**

รายการ IP/ช่วง network ที่อนุญาต ต้องอ่านจาก configuration (`Web.config` / environment)
**ห้าม hardcode ในโค้ด** และค่าเริ่มต้นเมื่อไม่ได้ตั้งค่าคือ **ปฏิเสธทุก request** (fail-closed)

Contract:PremiumEntitlement.v1
DEC-016

Evidence EVD-004: claim=DES-016 | state=confirmed | path=ClassOnlineWeb/Helper/CompassEntitlementService.cs | symbol=FeatureKeyPremium | line=27 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=75807a551d8492cebbb1bd420a8cf6680d777a8cb2c992a2e957c71acb3910d6
Evidence EVD-005: claim=Contract:PremiumEntitlement.v1 | state=confirmed | path=ClassOnlineWeb/Helper/CompassEntitlementService.cs | symbol=HasFeature | line=87 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=75807a551d8492cebbb1bd420a8cf6680d777a8cb2c992a2e957c71acb3910d6
Evidence EVD-006: claim=DEC-016 | state=unresolved | path=ClassOnlineWeb/Helper/CompassEntitlementService.cs | symbol=ResolveFeatureCode | line=109 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=75807a551d8492cebbb1bd420a8cf6680d777a8cb2c992a2e957c71acb3910d6

Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: sensitive
Fallback: DB entitlement ล่ม / query throw / คอลัมน์ `"FeatureCode"` ยังไม่พร้อมใน environment (PRE-06 ยังไม่เสร็จ) → fail-closed ถือว่าไม่มีสิทธิ์ คืน HTTP 403 พร้อม `VMResponseModel` ที่ `Data = null` ห้าม fail-open เด็ดขาด · `expire_at` เป็น NULL → ถือว่าไม่ผ่าน อย่าเขียน logic พิเศษให้ NULL แปลว่าไม่มีวันหมดอายุ · นักเรียนมีหลาย subscription → `ORDER BY subscription_id DESC LIMIT 1` (แถวล่าสุดแถวเดียว)
Material ambiguity: unresolved

## DES-017 — Identity & Scope Rules

> **DES-017** — traceability id ของหัวข้อนี้ (ลงทะเบียนระหว่าง reconciliation pass 2026-09-07 ·
> ไม่ใช่การตัดสินใจใหม่ กติกาในหัวข้อนี้ไม่เปลี่ยน · ดูแถวใน `## Feature-by-Feature Feasibility`)

**สัญญาของ REQ-015 + REQ-009 — กติกาที่ห้ามผ่อนตลอดไป**

ทุก endpoint ใน `CompassApiController` ต้องยึดตัวตนจาก `UserData` (JWT) เท่านั้น:
`schoolId = UserData.CompanyID` · `sID = UserData.UserID`

### สิ่งที่ต้องแก้ในรอบนี้

3 จุดที่ยังรับ `SID` จาก client — ยืนยันจากโค้ดจริง:

| บรรทัด | endpoint | ปัญหาปัจจุบัน |
|---|---|---|
| 643 | `AI_exercise/path` | `int sid = request != null ? request.SID : 0;` |
| 675 | `AI_exercise/submit` | `int sid = request != null ? request.SID : 0;` |
| 729 | `certificate/issue` | `int sid = request != null ? request.SID : 0;` |

**ทั้งสาม endpoint ยังไม่ได้เช็ค `ud == null` ด้วยซ้ำ** ต่างจาก endpoint อื่นทั้งหมด → ต้องเพิ่มด้วย

### กฎ

- ต้องเปลี่ยนไปใช้ `UserData.UserID` ทั้งสามจุด และเพิ่มการตรวจ `ud == null → 401`
- **คงฟิลด์ `SID` ไว้ใน request DTO ตามเดิม** (`VMAdvicePathRequest`, `VMExerciseSubmitRequest`,
  `VMCertificateRequest`) เพราะหน้าจอปัจจุบันยังส่งมาอยู่ (`compass.js` / `PathFinder.cshtml:177`)
  การถอดฟิลด์ออกจะทำให้ frontend พังโดยไม่จำเป็น — **แต่ server ต้องไม่อ่านค่านั้นเลย**
  เป็นพฤติกรรมเดียวกับ endpoint หลักที่ทำไว้แล้ว (`CompassApiController.cs:318` "IGNORED by design")
- `SID` ใน response ต้องเป็น `UserData.UserID` เสมอ ห้ามสะท้อนค่าที่ client ส่งมากลับไป
- `certificate/issue` — **แก้เฉพาะเรื่อง identity เท่านั้น** ห้ามแตะ business logic ของใบรับรอง
  (การตรวจว่าสอบผ่านจริง / เลขใบรับรองที่เดาได้) เพราะเป็นขอบเขตของ module
  `sb-compass-certificate` ที่ยังไม่ได้สัมภาษณ์

Contract:IdentityScope.v1
DEC-017

Evidence EVD-007: claim=DES-017 | state=confirmed | path=ClassOnlineWeb/Controllers/Api/CompassApiController.cs | symbol=AiExercisePath | line=705 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6e08ee5c7023bb69b3895bcd58c7ac61dc43e86c0fafafd541dbf8eaf5308e74
Evidence EVD-008: claim=Contract:IdentityScope.v1 | state=confirmed | path=ClassOnlineWeb/Controllers/Api/CompassApiController.cs | symbol=AiCalculatePath | line=367 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6e08ee5c7023bb69b3895bcd58c7ac61dc43e86c0fafafd541dbf8eaf5308e74
Evidence EVD-009: claim=DEC-017 | state=confirmed | path=ClassOnlineWeb/Controllers/Api/CompassApiController.cs | symbol=IssueCertificate | line=803 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6e08ee5c7023bb69b3895bcd58c7ac61dc43e86c0fafafd541dbf8eaf5308e74

Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: sensitive
Fallback: `sID`/`schoolId` ต้องมาจาก `UserData.UserID` / `UserData.CompanyID` (JWT) เท่านั้น — ค่า `request.SID` ที่ client ส่งมาถูกละเว้นเสมอ ("IGNORED by design") · `ud == null` → 401 · `SID` ใน response ต้องเป็น `UserData.UserID` เสมอ ห้ามสะท้อนค่าที่ client ส่งมากลับไป
Material ambiguity: none

## DES-021 — National Stats Batch Rules

> **DES-021** — traceability id ของหัวข้อนี้ (ลงทะเบียนระหว่าง design-evidence conversion 2026-09-13 ·
> เลข 021 เคยถูกใช้กับหัวข้อ `## Service Ownership Boundary — Score Retrieval vs Analysis` ที่ถอดออก
> ทั้งหมดใน v14 (2026-09-08) — เลขซ้ำเพราะเลขเดิมว่างอยู่ ตามแบบเดียวกับ PRE-06 · บันทึกเดิมอยู่ที่
> `design-archive.md`)

**สัญญาของ REQ-004 + REQ-010 หลังการตัดสินใจ Q4**

> **v7 (2026-08-31)**: ชื่อตาราง/คอลัมน์ทั้งหมดในหัวข้อนี้เปลี่ยนตาม OQ-19 ตัวเลือก C แล้ว —
> `"TCompassLevelSubjectStat"` · `"TCompassStudentLevelScore"` · `"MeanScore"` · `"StddevScore"` ·
> `"OverallAvg"` · `"StudentCount"` · `"LevelCode"` · **สูตร ตรรกะ และค่าคงที่ทุกตัวไม่เปลี่ยนเลย
> แม้แต่ข้อเดียว** — ข้อนี้เป็นการเปลี่ยนชื่อล้วน ๆ ห้ามถือเป็นโอกาสแก้พฤติกรรม

### สิ่งที่เปลี่ยน

`CompassRankingService` ต้องเปลี่ยนไปใช้ **สูตรถ่วงน้ำหนัก** ทั้งสองฝั่ง:

| จุด | บรรทัดอ้างอิง | เดิม | ใหม่ |
|---|---|---|---|
| batch — คะแนนกลุ่มสาระต่อนักเรียน | `RecomputeAsync` :362 | `AggregateByCanonicalSubject` | สูตรถ่วงน้ำหนัก |
| batch — `"OverallAvg"` ต่อนักเรียน | :365 | `subjAvgs.Average(a => a.AverageScore)` | เฉลี่ยจากค่ากลุ่มสาระที่**ถ่วงน้ำหนักแล้ว** |
| batch — `"MeanScore"` ต่อ (ระดับชั้น × กลุ่มสาระ) | :382, :409 | เฉลี่ยของค่าเฉลี่ยดิบ | เฉลี่ยของค่าที่ถ่วงน้ำหนักแล้ว |
| request-time — `overall` ที่ใช้จัดอันดับ | `GetStudentNationalStatsAsync` :175 | `agg.Average(a => a.AverageScore)` | ต้องใช้สูตรเดียวกับ batch |

**`"OverallAvg"` = ค่าเฉลี่ยธรรมดาของคะแนนกลุ่มสาระ (ที่ถ่วงน้ำหนักมาแล้วในชั้นก่อนหน้า)
ไม่ใช่การถ่วงน้ำหนักซ้ำอีกชั้น** — หน่วยกิตถูกใช้ไปแล้วตอนยุบวิชาย่อยเข้ากลุ่มสาระ

### ทำไมต้องเปลี่ยนทั้งคู่พร้อมกัน

`RankInLevel` = จำนวนคนใน `public."TCompassStudentLevelScore"` ที่ `"OverallAvg"` สูงกว่าค่าที่คำนวณสด
ตอน request (`:198-200`) — ถ้าเปลี่ยนแค่ฝั่ง request จะกลายเป็นการเอา**เลขถ่วงน้ำหนัก
ไปเทียบกับกองเลขไม่ถ่วงน้ำหนัก** อันดับจะเพี้ยนอย่างเป็นระบบ ไม่ใช่คลาดเคลื่อนเล็กน้อย

### deployment step ที่บังคับ — `devops` ต้องรู้

**หลัง deploy ต้องสั่ง recompute ใหม่ทั้งเครือข่ายทันที ก่อนเปิดให้ผู้ใช้เข้าหน้า Premium**

- นี่เป็น **data break ไม่ใช่ schema break** — โครงสร้างตารางเหมือนเดิมทุกคอลัมน์
  แต่แถวเดิมทั้งหมดคำนวณด้วยสูตรเก่า จึงเทียบกับค่าใหม่ไม่ได้
- ไม่ต้องมี migration script ไม่ต้อง backfill — `RecomputeAsync` ทำ `TRUNCATE` แล้วเขียนใหม่อยู่แล้ว
- **ระวัง `limit`**: ค่า default ของ endpoint คือ `limit = 10` (แค่ 10 โรงเรียนที่มีข้อมูลมากที่สุด)
  ถ้าตั้งใจให้ครอบคลุมทั้งเครือข่ายจริงต้องส่ง `?limit=0` — ผู้ใช้ยอมรับข้อจำกัดนี้ไว้แล้ว
  (`requirement.md` → References) แต่ตอน deploy ต้องเลือกอย่างจงใจ ไม่ใช่ปล่อยตาม default

### กฎเดิมที่ยังคงไว้ (REQ-010 — ไม่เปลี่ยน)

- งานรันเบื้องหลัง มีสถานะ `idle`/`running`/`done`/`failed` และกันการสั่งซ้อน
- โรงเรียนที่คำนวณพลาดต้องไม่ทำให้ทั้ง batch ล้ม (นับ failed แล้วไปต่อ)
- ถ้าตารางยังไม่เคยถูกคำนวณ ต้องไม่ error — คืนค่าว่าง/0 แบบไม่ล้ม (`:218-231`)
- ไม่มีเกณฑ์ขนาดกลุ่มตัวอย่างขั้นต่ำ แสดงอันดับเสมอ (ปิด OQ-05 แล้ว)

### `"StddevScore"` — สัญญาของ REQ-017 (ใหม่ v5, 2026-08-31 · เปลี่ยนชื่อคอลัมน์ใน v7)

**ที่มา**: `sb-compass-faculty-match REQ-013` (T-Score) ต้องการส่วนเบี่ยงเบนมาตรฐานระดับประเทศต่อ
(ระดับชั้น × กลุ่มสาระ) · `sb-compass` เป็นเจ้าของตารางนี้จึงเป็นผู้คำนวณและเขียนแต่ผู้เดียว —
โมดูลปลายทาง **อ่านอย่างเดียว ห้ามเขียน** (สอดคล้องกับ `sb-compass-faculty-match/design.md` →
`## Database Ownership Boundary`)

#### 1. คำนวณที่ไหน เมื่อไหร่

- **คำนวณในรอบ batch เดียวกับ `"MeanScore"` ทุกประการ** — จุดเดียวกัน (`RecomputeAsync` :382, :409),
  รอบเดียวกัน, `TRUNCATE` + เขียนใหม่ทั้งตารางเหมือนกัน · **ห้ามทำเป็น backfill แยก และห้ามทำเป็น
  incremental update ต่อคะแนนที่เข้ามาใหม่** (REQ-017 กำหนดตรง ๆ · ยืนยันจากโค้ดจริงว่านี่คือ pattern
  ของ `"MeanScore"` อยู่แล้ว)
- **ประชากรที่ใช้คำนวณต้องเป็นชุดเดียวกับที่ใช้คำนวณ `"MeanScore"` ของแถวนั้นเป๊ะ ๆ** — ค่าคะแนน
  รายนักเรียนที่เข้าสูตรคือค่าที่ **ถ่วงน้ำหนักหน่วยกิตแล้ว** ตาม REQ-012 (เหมือน `"MeanScore"`
  หลัง DES-003) **ห้ามใช้ค่าเฉลี่ยดิบมาคำนวณ stddev ในขณะที่ `"MeanScore"` ใช้ค่าถ่วงน้ำหนัก** —
  ถ้าสองค่านี้มาจากคนละชุด T-Score ที่ปลายทางจะเพี้ยนแบบไม่มีอะไรฟ้อง
- `"StudentCount"` ของแถวนั้นคือ `n` ที่ใช้ตัดสินกฎข้อ 3 — ต้องเป็นจำนวนเดียวกับที่นับเข้า `"MeanScore"`

#### 2. สูตร — **population standard deviation** ✅ ยืนยันแล้ว (ผู้ใช้, 2026-08-31 · ปิด OQ-18 ข้อ ก)

```
"StddevScore" = sqrt( Σ(x_i − "MeanScore")² / n )        -- population (หาร n)
   โดย x_i = คะแนนกลุ่มสาระ (ถ่วงน้ำหนักหน่วยกิตแล้ว) ของนักเรียนคนที่ i ในระดับชั้น × กลุ่มสาระนั้น
             = ชุดเดียวกับที่ใช้คำนวณ "MeanScore" ของแถวเดียวกัน
        n   = "StudentCount" ของแถวเดียวกัน
```

- **ห้ามใช้ sample stddev (หาร `n−1`) เว้นแต่จะ amend ข้อนี้ก่อน** — สองสูตรให้ตัวเลขคนละค่า และ
  T-Score ที่ปลายทางเปลี่ยนตาม ถ้าปล่อยให้ engineer เลือกเอง ค่าจะไม่นิ่งข้าม environment
- **ข้อควรรู้สำหรับ implementer**: ใน PostgreSQL `stddev()` = `stddev_samp` (หาร `n−1`)
  **ไม่ใช่** ตัวที่เอกสารนี้กำหนด — ถ้าคำนวณด้วย SQL ต้องเรียก **`stddev_pop()`** ชัดเจน ·
  ถ้าคำนวณใน C# (`CompassRankingService` คำนวณในหน่วยความจำอยู่แล้ว) ต้องหารด้วย `n` ไม่ใช่ `n−1`
- **เหตุผลที่เลือก population**: ค่านี้ถูกใช้เป็น**ตัวหารเพื่อวางตำแหน่งนักเรียนภายในกองข้อมูลอ้างอิง
  ที่ระบบมีจริง** (T-Score) ไม่ได้ใช้อนุมานพารามิเตอร์ของประชากรที่กว้างกว่า — เมื่อ "ประชากร" ที่
  นิยามไว้คือกองข้อมูลนั้นเอง population stddev คือสิ่งที่ตรงกับนิยามและให้ผลนิ่งกว่า ·
  **ข้อโต้แย้งที่ `system-analyst` เสนอไว้ตอนยังไม่ปิด (ถ้าถือว่าเป้าหมายคือ "ทั้งประเทศ" จริง ข้อมูล
  ที่มีคือ sample → ควรใช้ `n−1`) ถูกพิจารณาแล้วและผู้ใช้เลือก population** — บันทึกเต็มอยู่ที่
  `design-archive.md` · **ประเด็นเรื่องฐานข้อมูลไม่ครอบคลุมทั้งประเทศไม่ได้หายไป** แต่ถูกจัดการที่
  **ถ้อยคำที่แสดงต่อผู้ใช้ปลายทางแทน** (RISK-09) ไม่ใช่ที่สูตร

#### 3. กลุ่มตัวอย่างเล็กเกินไป — คืน `NULL` ไม่ใช่ `0` · **`MIN_N_FOR_STDDEV = 30`** ✅ ยืนยันแล้ว (2026-08-31)

| กรณี | `"StddevScore"` | เหตุผล |
|---|---|---|
| **`n < 30`** (`MIN_N_FOR_STDDEV` — **ค่ายืนยันแล้ว ไม่ใช่ค่าที่รอตัดสิน**) | **`NULL`** | ค่าที่คำนวณได้ไม่มีความหมายทางสถิติ · การคืนตัวเลขที่ดูใช้ได้แต่เชื่อไม่ได้ อันตรายกว่าการคืน `NULL` เพราะปลายทางแยกไม่ออก |
| `n = 1` | **`NULL`** | ครอบด้วยเกณฑ์ `n < 30` อยู่แล้ว · ระบุแยกไว้เพราะเป็นกรณีที่ stddev ของคนเดียว = 0 เสมอ ซึ่งเป็น 0 ปลอม ไม่ใช่ "ทุกคนได้เท่ากัน" |
| `n ≥ 30` **แต่ทุกคนได้คะแนนเท่ากันจริง** | **`0`** (ค่าจริง ไม่ใช่ NULL) | เป็นข้อเท็จจริงที่ถูกต้อง ปลายทางต้องรับมือได้ (หารด้วยศูนย์) — ดูข้อ 4 |
| `n ≥ 30` ปกติ | ค่าที่คำนวณได้ | — |

- **`NULL` กับ `0` ต้องแยกจากกันเด็ดขาด ห้ามยุบเป็นค่าเดียว** — `NULL` = "คำนวณไม่ได้/ไม่ควรเชื่อ",
  `0` = "กระจายตัวเป็นศูนย์จริง" · ปลายทาง (T-Score) ต้องแยกสองกรณีนี้เพื่อเลือกข้อความที่ถูกต้อง
- **ข้อนี้ไม่ได้เปิด OQ-05 ที่ปิดไปแล้วใหม่** — REQ-004 ยืนยันว่า **`"MeanScore"` และการจัดอันดับ
  ไม่มีเกณฑ์ขนาดกลุ่มตัวอย่างขั้นต่ำ และยังคงเป็นแบบนั้นทุกประการ** · เกณฑ์ `MIN_N_FOR_STDDEV = 30`
  ใช้กับ **คอลัมน์ `"StddevScore"` เท่านั้น** เพราะ mean ของ n น้อยยังมีความหมาย แต่ stddev ไม่มี
- **เก็บเป็นค่าคงที่ที่มีชื่อในโค้ด** (`MIN_N_FOR_STDDEV = 30`) แก้ที่เดียวได้ ไม่ใช่ magic number
  กระจายในหลายที่ · **ที่มาของเลข 30**: เกณฑ์ rule-of-thumb ที่กลุ่มตัวอย่างเริ่มให้ค่าการกระจายตัว
  ที่เสถียรพอ และสอดคล้องกับสมมติฐานการแจกแจงที่ T-Score ตั้งอยู่ — **ผู้ใช้ยืนยันเลขนี้แล้ว
  ไม่ใช่ค่าที่ `system-analyst` ตั้งเอง** · ถ้าจะเปลี่ยนต้อง amend ข้อนี้ก่อน
- **ผลข้างเคียงที่ต้องเฝ้าดูหลัง deploy**: ยิ่ง `n` ของ (ระดับชั้น × กลุ่มสาระ) เล็ก ยิ่งมีแถวเป็น
  `NULL` มาก → กลุ่มสาระนั้นถูกตัดออกจากการคำนวณ T-Score ที่ปลายทาง · ใช้ query ใน
  `## Unresolved Open Questions` (ท้ายหัวข้อ OQ-12) ตรวจสัดส่วนจริงหลัง recompute รอบแรก

#### 4. สัญญากับผู้บริโภคค่านี้ (`sb-compass-faculty-match` Module K)

ตารางนี้ **รับประกันแค่**: `"StddevScore"` เป็น `NULL` ได้ · เป็น `0` ได้ · และเมื่อมีค่า จะคำนวณจาก
ประชากรชุดเดียวกับ `"MeanScore"` ของแถวเดียวกันเสมอ

**v7 — สิ่งที่ผู้บริโภคต้องแก้ตามด้วย**: `sb-compass-faculty-match` Module K อ่านตารางนี้ด้วย raw SQL
จึงต้องเปลี่ยนมาอ่าน `public."TCompassLevelSubjectStat"` (`"MeanScore"`, `"StddevScore"`,
`"StudentCount"`, `"LevelCode"`, `"Subject"`) พร้อม quote ครบทุกตัว — บันทึกไว้ที่
`_docs/module/sb-compass-faculty-match/design.md` → `## Database Ownership Boundary` และ
`## Cluster Determination Rules` ข้อ 2 แล้ว (v4 ของเอกสารนั้น)

**ผู้บริโภคต้องรับมือทั้ง `NULL` และ `0` เองโดยไม่ error** — กติกา fallback ฝั่งผู้บริโภคอยู่ที่
`_docs/module/sb-compass-faculty-match/design.md` → `## Cluster Determination Rules` ข้อ 2
(ตัดกลุ่มสาระนั้นออกจากการคำนวณ ไม่ใช่แทนค่าเดา) · **เอกสารนี้ไม่นิยามพฤติกรรม T-Score แทนโมดูลนั้น
และโมดูลนั้นก็ห้ามนิยาม DDL ของคอลัมน์นี้แทนเอกสารนี้**

#### 5. กับดักของ implementer — ตารางถูกสร้างตอน runtime ไม่ใช่ผ่าน migration

`CompassRankingService.EnsureTables` ใช้ `CREATE TABLE IF NOT EXISTS` ตอนรัน — **ฐานข้อมูลที่มีตาราง
อยู่แล้วจะไม่ได้อะไรจากการแก้ข้อความ `CREATE TABLE`** เพราะ `IF NOT EXISTS` จะข้ามทั้งก้อน

**v7 — กับดักนี้ใหญ่ขึ้นกว่าเดิม เพราะตอนนี้ทั้งชื่อตารางและชื่อคอลัมน์เปลี่ยน · v8: ไม่มีตารางเดิม
ให้ชนกัน (ยังไม่เคยถูกสร้างในฐานข้อมูลใด ๆ เลย) แต่ยังมีกับดักคอลัมน์ `"StddevScore"` เหลืออยู่:**

- ทั้งสามตารางยังไม่เคยถูกสร้างในฐานข้อมูลใด ๆ เลย (`deployed ⬜` ทุก phase) จึงไม่มี "ตารางชื่อเดิม
  ค้างอยู่คู่กับของใหม่" ให้ระวังอีกต่อไป — `EnsureTables`/`EnsureTable` ที่แก้ใช้ชื่อใหม่จะสร้าง
  ตารางขึ้นตรง ๆ ครั้งแรก (v8 — ดูรายละเอียดที่ `## Data Model` → *ไม่ต้อง migration/rename — v8*)
- คอลัมน์ `"StddevScore"` ต้องอยู่ใน `CREATE TABLE IF NOT EXISTS` ของ `EnsureTables` ตั้งแต่แรก
  (ไม่ใช่ `ADD COLUMN` แยกทีหลัง เพราะไม่มีตารางเก่าให้ต้องเติมคอลัมน์เข้าไป) — ดู DDL เต็มที่
  `## Data Model` กลุ่มที่ 1 · **ลืมคอลัมน์นี้ = batch จะล้มตอน `INSERT`**
- **ห้ามคง `CREATE TABLE IF NOT EXISTS` ของชื่อเดิม (snake_case) ไว้ในโค้ดคู่กับของใหม่** ไม่ว่าด้วยเหตุผลใด

Contract:NationalStatsBatch.v1
DEC-021

Evidence EVD-010: claim=DES-021 | state=confirmed | path=ClassOnlineWeb/Helper/CompassRankingService.cs | symbol=RecomputeAsync | line=344 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=59244efe66215802be3ddec568dd9c71d801568262a4c697e93e05e680e7cdb5
Evidence EVD-011: claim=Contract:NationalStatsBatch.v1 | state=confirmed | path=ClassOnlineWeb/Helper/CompassRankingService.cs | symbol=MinNForStddev | line=452 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=59244efe66215802be3ddec568dd9c71d801568262a4c697e93e05e680e7cdb5
Evidence EVD-012: claim=DEC-021 | state=confirmed | path=ClassOnlineWeb/Helper/CompassRankingService.cs | symbol=EnsureTables | line=595 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=59244efe66215802be3ddec568dd9c71d801568262a4c697e93e05e680e7cdb5

Compatibility: breaking
Data/schema: breaking
Migration/backfill: none
Security: none
Fallback: ตารางยังไม่เคยถูกคำนวณ / ว่างชั่วคราวระหว่าง `TRUNCATE` + เขียนใหม่ → คืนค่าว่าง/0 แบบไม่ล้ม (พฤติกรรมเดิม `:218-231` ที่ REQ-010 รับไว้แล้ว) · โรงเรียนที่คำนวณพลาด → นับ failed แล้วไปต่อ ห้ามให้ทั้ง batch ล้ม · `n < MIN_N_FOR_STDDEV` (30) → เขียน `"StddevScore"` เป็น `NULL` ไม่ใช่ 0 · `n ≥ 30` ที่ทุกคนได้คะแนนเท่ากันจริง → เขียน `0` (ค่าจริง)
Material ambiguity: none

## DES-018 — Premium Subject Breakdown Contract

> **DES-018** — traceability id ของหัวข้อนี้ (ลงทะเบียนระหว่าง reconciliation pass 2026-09-07 ·
> ไม่ใช่การตัดสินใจใหม่ กติกาในหัวข้อนี้ไม่เปลี่ยน · ดูแถวใน `## Feature-by-Feature Feasibility`)

**สัญญาของ REQ-016 — รูปร่าง response ที่ `backend-engineer` ต้องสร้างและ `frontend-engineer` อ่าน**

### สิ่งที่เพิ่ม

เพิ่ม list รายวิชาย่อยเข้าไปใน `VMSubjectStat` (response ของ `calculate/score`)

```csharp
public class VMCourseBreakdown
{
    public string CourseName { get; set; }   // ชื่อวิชาจาก TPlane.sPlaneName
    public string CourseCode { get; set; }   // TPlane.courseCode — อาจเป็น null
    public string Term { get; set; }         // PGTGrade.nTerm
    public double Score { get; set; }        // คะแนนดิบ 0-100 (ไม่ใช่ค่าที่ถ่วงน้ำหนักแล้ว)
    public double? Credit { get; set; }      // null = ไม่มีข้อมูลหน่วยกิต — ห้ามแปลงเป็น 0
}

public class VMSubjectStat
{
    public string Subject { get; set; }
    public double StudentScore { get; set; }              // ค่าถ่วงน้ำหนัก ทศนิยม 2 ตำแหน่ง
    public double Mean { get; set; }
    public double Percentile { get; set; }                // ยังคง 0 คงที่ (OQ-05 เดิม)
    public List<VMCourseBreakdown> Courses { get; set; }  // ← ใหม่ (REQ-016)
}
```

### กฎ — รวมกรณีที่ requirement ไม่ได้ระบุและผมกำหนดให้

| กรณี | ต้องทำอย่างไร | ที่มา |
|---|---|---|
| กลุ่มสาระมีหลายวิชา | แสดงทุกวิชาแยกแถว | AC1 |
| กลุ่มสาระมีวิชาเดียว | แสดง 1 รายการ **ห้ามซ่อน breakdown** | AC2 |
| วิชาไม่มีคะแนนเป็นตัวเลข | **ไม่แสดงใน breakdown** | AC3 |
| วิชามีคะแนนแต่ไม่มีหน่วยกิต | **ยังต้องแสดง** โดย `Credit` เป็น **JSON `null`** · **ห้ามส่ง 0 และห้ามซ่อนวิชา** · หน้าจอแสดงข้อความ **"ไม่มีข้อมูลหน่วยกิต"** ชัดเจน ไม่ใช่ "0" และไม่ใช่เว้นว่าง (ปิด OQ-16 · 2026-09-15) | AC4 / AC-016.7 |
| **รูปแบบ Layout หน้าจอ Premium** | แสดงผล Breakdown รายวิชาเป็น **ตารางบรรจุภายในการ์ดกลุ่มสาระ (Table in Card)** (ปิด OQ-16 · 2026-09-15) | AC-016.7 |
| ไม่มีสิทธิ์ Premium | ไม่ได้ breakdown เลย — ทั้ง endpoint ถูกกั้น 403 | AC5 |
| หน้าฟรี | **ไม่เปลี่ยนแปลงใด ๆ** — ยังเป็นกลุ่มสาระ + ค่าเฉลี่ยดิบ | AC6 |
| **วิชาชื่อเดียวกันหลายเทอม** *(requirement ไม่ได้ระบุ — ผมกำหนด)* | **แสดงแยกแถวต่อเทอม พร้อมฟิลด์ `Term`** ไม่ยุบรวม — เพราะแต่ละแถวคือหน่วยที่เข้าสูตรถ่วงน้ำหนักจริง ถ้ายุบรวมตัวเลขที่เห็นจะอธิบายคะแนนกลุ่มสาระไม่ได้ | ผมกำหนด |
| **ลำดับการเรียง** *(requirement ไม่ได้ระบุ — ผมกำหนด)* | เรียง **คะแนนมากไปน้อย** ถ้าเท่ากันเรียงตามชื่อวิชา | ผมกำหนด |
| **วิชา non-core** (`CanonicalSubject` = null) | ไม่แสดง เพราะไม่สังกัดกลุ่มสาระใด — สอดคล้องกับ REQ-001 ที่ตัดออกจากการคำนวณ | สอดคล้อง REQ-001 |
| กลุ่มสาระที่เข้า fallback (หน่วยกิตรวม = 0) | ยังแสดง breakdown ตามปกติ โดย `Credit` ทุกแถวเป็น `null` และ `StudentScore` คือค่าเฉลี่ยธรรมดา | กฎข้อ 4 |

Contract:PremiumSubjectBreakdown.v1
DEC-018

Evidence EVD-013: claim=DES-018 | state=confirmed | path=ClassOnlineWeb/Controllers/Api/CompassApiController.cs | symbol=VMCourseBreakdown | line=290 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6e08ee5c7023bb69b3895bcd58c7ac61dc43e86c0fafafd541dbf8eaf5308e74
Evidence EVD-014: claim=Contract:PremiumSubjectBreakdown.v1 | state=confirmed | path=ClassOnlineWeb/Controllers/Api/CompassApiController.cs | symbol=Courses | line=286 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6e08ee5c7023bb69b3895bcd58c7ac61dc43e86c0fafafd541dbf8eaf5308e74
Evidence EVD-015: claim=DEC-018 | state=confirmed | path=ClassOnlineWeb/Controllers/Api/CompassApiController.cs | symbol=CalculateScore | line=261 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=6e08ee5c7023bb69b3895bcd58c7ac61dc43e86c0fafafd541dbf8eaf5308e74

Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: sensitive
Fallback: วิชาไม่มีคะแนนเป็นตัวเลข → ไม่แสดงใน breakdown · วิชามีคะแนนแต่ไม่มีหน่วยกิต → ยังแสดงโดย `Credit` เป็น JSON `null` ห้ามส่ง 0 และห้ามซ่อนวิชา · กลุ่มสาระที่เข้า fallback (หน่วยกิตรวม = 0) → `StudentScore` คือค่าเฉลี่ยธรรมดา · payload ต้องประกอบหลังผ่านการตรวจสิทธิ์ `compass_premium` เท่านั้น ห้ามประกอบเต็มแล้วค่อยกรองออก
Material ambiguity: none

## DES-019 — Deployment Prerequisites

> **DES-019** — traceability id ของหัวข้อนี้ (ลงทะเบียนระหว่าง reconciliation pass 2026-09-07 ·
> ไม่ใช่การตัดสินใจใหม่ กติกาในหัวข้อนี้ไม่เปลี่ยน · ดูแถวใน `## Feature-by-Feature Feasibility`)

**งานที่ต้องเสร็จก่อน deploy — ไม่ใช่งานเขียนโค้ด จึงไม่บล็อกการวางแผนหรือการ implement
แต่บล็อกการ deploy · `devops` ต้องยืนยันครบทุกข้อก่อนปล่อยขึ้น production**

| # | สิ่งที่ต้องทำ | ใครทำ | บล็อกอะไร |
|---|---|---|---|
| **PRE-01** | สร้าง record ของ Compass Premium ใน `TFeatureSBPlus` (ตั้งค่า `"FeatureCode"` = ค่าจาก OQ-15(a2)) และผูกเข้าแพ็กเกจนักเรียน/ผู้ปกครองผ่าน `TPlan_Feature` · **v4: ต้องรอ OQ-15(a1) ตัดสินกลไกก่อน** เพราะตารางไม่มีคอลัมน์ key แบบ string การ "สร้าง record ชื่อ `compass_premium`" จึงยังไม่มีความหมายที่ชัดเจน · **v9 (2026-09-01): OQ-15(a1) ตัดสินแล้ว — ต้องรอ PRE-06 เสร็จก่อน** (คอลัมน์ `"FeatureCode"` ต้องมีอยู่จริงก่อนจะตั้งค่าได้) แล้วส่งค่า `"FeatureCode"` ที่ใช้จริงกลับมา amend เอกสารนี้ (= OQ-15(a2)) · **v10: แก้ชื่อคอลัมน์เป็น PascalCase — ไม่กระทบเนื้อหา** | ทีมที่ดูแล **SB PLUS** | deploy Module B · ถ้าไม่มี record ผู้ใช้ที่จ่ายเงินแล้วจะถูกปฏิเสธทั้งหมด (เพราะ fail-closed) |
| **PRE-02** | สร้าง record ของ Compass Admin Ops ใน `TFeatureSBPlus` (ตั้งค่า `"FeatureCode"` = ค่าจาก OQ-15(a2)) และผูก **เฉพาะแพ็กเกจ staff/internal** · **ตรวจซ้ำว่าไม่ได้ผูกกับแพ็กเกจใดที่ขายให้นักเรียน/ผู้ปกครอง** · **v4: ติดเงื่อนไข OQ-15(a1)/(a2) เหมือน PRE-01** · **v9: ต้องรอ PRE-06 เสร็จก่อนเช่นเดียวกับ PRE-01** · **v10: แก้ชื่อคอลัมน์เป็น PascalCase — ไม่กระทบเนื้อหา** | ทีมที่ดูแล **SB PLUS** | deploy Module B · การผูกผิดที่นี่คือช่องทางลบข้อมูลทั้งเครือข่าย |
| **PRE-06** *(ใหม่ v9, 2026-09-01 — เลขนี้เคยใช้แล้วถอดออกใน v8 ด้วยเหตุผลคนละเรื่อง ดู `design-archive.md`)* | **เพิ่มคอลัมน์ `"FeatureCode" varchar UNIQUE` ให้ตาราง `TFeatureSBPlus`** แล้วกำหนดค่าให้กับแถวของ Compass Premium และ Compass Admin Ops (ค่าจริงคือคำตอบของ **OQ-15(a2)**) · เป็นผลจากการปิด OQ-15(a1) ด้วยตัวเลือก (i) · **v10 (2026-09-01): แก้ชื่อคอลัมน์จาก `feature_code` เป็น `"FeatureCode"` (PascalCase) — ไม่กระทบมติหรือลำดับขั้นตอน** · สคริปต์พร้อมใช้อยู่ที่ `_docs/module/sb-compass/sql/pre-06-add-feature-code.sql` · **สั่งรันแล้ว 2026-10-04 (ผู้ใช้สั่ง "ปิด human gate ทั้งหมด" ในแชต): ให้ทีม SB PLUS รันสคริปต์แล้วรายงานผลกลับ (ยืนยันว่าคอลัมน์ถูกสร้างจริง) — deploy Module B ขั้นตอนที่ 4 ยังรอผลยืนยันจากทีม SB PLUS** | ทีมที่ดูแล **SB PLUS** | **PRE-01/PRE-02** (ต้องมีคอลัมน์ก่อนถึงจะตั้งค่าได้) · deploy Module B ขั้นตอนที่ 4 ของ `CheckEntitlement` (BE-004 และ BE-005/006/007/012 ที่ต่อจากมัน) — **นี่คือ deployment prerequisite ตัวใหม่ที่ไม่เคยมีมาก่อน ไม่ใช่การนับ PRE ซ้ำ** |
| **PRE-03** | ตั้งค่า IP/internal-network allowlist สำหรับ endpoint `recompute/*` ใน configuration | `devops` | deploy Module B · ไม่ตั้งค่า = ปฏิเสธทุก request (fail-closed) ซึ่งปลอดภัยแต่ใช้งานไม่ได้ |
| **PRE-04** | **สั่ง recompute ใหม่ทั้งเครือข่ายด้วย `?limit=0` ทันทีหลัง deploy** ก่อนเปิดให้ผู้ใช้เข้าหน้า Premium | `devops` | ความถูกต้องของอันดับทั้งหมด — ดู RISK-01 และ `## National Stats Batch Rules` |
| **PRE-05** | ยืนยันชื่อคอลัมน์จริงของ **2 ตาราง** SB PLUS ที่เหลือกับ DB จริง (`TSubscription`, `TPlan_Feature` — `TSubcriptionPlan` ถูกถอดออกใน v3 · **`TFeatureSBPlus` ยืนยันครบทั้งตารางแล้วใน v4 ไม่ต้องตรวจอีก**) · **ที่ยังต้องตรวจ**: คอลัมน์ override ฝั่ง `TPlan_Feature.display_*` (OQ-15(b)) · `TSubscription.status`/`expire_at`/`subscription_plan_id` (OQ-15(c)) · ⚠️ **v4: "คอลัมน์ที่เก็บ feature key" ถูกถอดออกจาก PRE-05 แล้ว** — ไม่มีคอลัมน์นั้นอยู่จริง จึงไม่ใช่งานตรวจของ engineer อีกต่อไป แต่เป็น OQ-15(a1) ที่ผู้ใช้ + ทีม SB PLUS ต้องตัดสิน | `backend-engineer` | ขั้นตอนที่ 1–3 ของ `CheckEntitlement` · **ไม่ปลดบล็อกขั้นตอนที่ 4 — ตัวนั้นบล็อกที่ OQ-15(a1)/(a2)** |
> **PRE-06 (ความหมายเดิม) ถูกถอดออกใน v8** — v7 เคยกำหนดให้ rename ตารางเดิมก่อน deploy Module C
> แต่ผู้ใช้ยืนยันแล้วว่าทั้งสามตารางยังไม่เคยถูกสร้างในฐานข้อมูลใด ๆ เลย จึงไม่มีตารางเดิมให้ rename
> (ดู `## Data Model` → *ไม่ต้อง migration/rename — v8* และ `design-archive.md`)
> **v9 (2026-09-01) — เลข PRE-06 ถูกใช้ใหม่กับเรื่องคนละเรื่อง**: ตอนนี้ PRE-06 หมายถึง
> "SB PLUS เพิ่มคอลัมน์ `"FeatureCode"`" (ผลจากการปิด OQ-15(a1)) **ไม่เกี่ยวกับการ rename ตาราง
> ของ v7/v8 เลย** — เลขซ้ำเพราะเลขเดิมว่างอยู่ ไม่ใช่ความสับสนของเอกสาร
> **PRE-07 ถูกถอดออกทั้งหมดใน v14 (2026-09-08)** — v12/v13 เคยกำหนดให้ตั้งค่า connection string +
> implement gRPC endpoint + route ที่ gateway ก่อนย้าย "ดึงคะแนน" ไป `sb-tech-upgrade-api-academic`/
> `sb-api-gateway` แต่ผู้ใช้สั่งยกเลิก target ทั้งสองตัวแล้ว (2026-09-08) prerequisite นี้จึงไม่มี
> อยู่อีกต่อไป — บันทึกเต็มย้ายไป `design-archive.md`

**ลำดับที่ถูกต้อง**: **PRE-06 (schema)** → PRE-01/02 (SB PLUS สร้าง record) → PRE-03 (config) →
deploy → PRE-04 (recompute)

Contract:DeploymentPrerequisites.v1
DEC-019

Evidence EVD-016: claim=DES-019 | state=confirmed | path=ClassOnlineWeb/Helper/InternalNetworkAccessGuard.cs | symbol=AllowedIpsAppSettingKey | line=21 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=65b447d9e3e808ce5dfffe2e97bcbe397b8058673bde072a6a49cfa7c5b7e4ee
Evidence EVD-017: claim=Contract:DeploymentPrerequisites.v1 | state=confirmed | path=ClassOnlineWeb/Helper/InternalNetworkAccessGuard.cs | symbol=IsAllowed | line=35 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=65b447d9e3e808ce5dfffe2e97bcbe397b8058673bde072a6a49cfa7c5b7e4ee
Evidence EVD-018: claim=DEC-019 | state=unresolved | path=ClassOnlineWeb/Helper/CompassEntitlementService.cs | symbol=FeatureCodeAppSettingKeys | line=37 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=75807a551d8492cebbb1bd420a8cf6680d777a8cb2c992a2e957c71acb3910d6

Compatibility: unchanged
Data/schema: unchanged
Migration/backfill: none
Security: sensitive
Fallback: PRE-03 ไม่ได้ตั้งค่า (`Compass_Recompute_AllowedIPs` ว่าง) → `InternalNetworkAccessGuard` ปฏิเสธทุก request (fail-closed — 404/403 โดยไม่เปิดเผยว่ามี endpoint นี้อยู่) ปลอดภัยแต่ใช้งานไม่ได้ จึงต้องตั้งค่าก่อน deploy Module B · PRE-04: สั่ง recompute ใหม่ทั้งเครือข่ายด้วย `?limit=0` ทันทีหลัง deploy ก่อนเปิดให้ผู้ใช้เข้าหน้า Premium
Material ambiguity: unresolved

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

## Risks & Dependencies

| ID | ความเสี่ยง | ผลกระทบ | การจัดการ |
|---|---|---|---|
| **RISK-01** | **deploy REQ-012 โดยไม่ recompute** → อันดับทั่วประเทศเพี้ยนแบบเป็นระบบ | สูง · ผู้ใช้เห็นอันดับผิดโดยไม่มีอะไรฟ้อง ระบบไม่ error | บังคับ recompute เป็น deployment step (ดู `## National Stats Batch Rules`) · `devops` ต้องเห็นข้อนี้ก่อน deploy |
| **RISK-02** | *(ปิดแล้ว 2026-08-25 — บันทึกเต็มย้ายไป `design-archive.md`)* ความเสี่ยงว่า `recompute` จะเปิดให้นักเรียนที่จ่ายเงินสั่ง TRUNCATE ได้ | — | **ปิดด้วยการแยก feature key (`compass_admin_ops`) + IP allowlist สองชั้น** → กติกาอยู่ที่ `## Premium Entitlement Rules` → REQ-014 · ความถูกต้องของการตั้งค่าย้ายไปเป็น **PRE-02** |
| **RISK-07** | **การตั้งค่าฝั่ง SB PLUS ผิด** — ถ้า `compass_admin_ops` ถูกผูกเข้าแพ็กเกจที่ขายให้นักเรียนโดยไม่ตั้งใจ ช่องโหว่ RISK-02 จะกลับมาทันทีโดยที่โค้ดถูกต้องทุกบรรทัด | สูง · โค้ดฝั่งเราตรวจไม่เจอ เพราะไม่ใช่ความผิดพลาดในโค้ด | ชั้น IP allowlist (PRE-03) เป็นตัวกันความเสียหายเมื่อการตั้งค่าผิด · `devops` ต้องยืนยัน PRE-02 ด้วยการตรวจจริงว่า key นี้ไม่ปรากฏในแพ็กเกจนักเรียน ไม่ใช่เชื่อคำบอกเล่า |
| **RISK-03** | ชื่อตาราง/คอลัมน์ SB PLUS มาจากเอกสาร handoff **ยังไม่ได้ตรวจกับ schema จริง** · **v3 (2026-08-25): ยกระดับความรุนแรง** — ผู้ใช้ตรวจของจริงไป 2 จุด **ผิดทั้ง 2 จุด** (`TSubcriptionPlan.plan_id` ไม่มีอยู่จริง + flow จริงไม่ได้ join ตารางนี้เลย · `default_description` ชื่อจริงคือ `feature_description`) จึงถือว่าเอกสาร handoff **เชื่อไม่ได้ทั้งฉบับ** ไม่ใช่แค่ "อาจคลาดเคลื่อน" | **สูง** (เดิมกลาง) · ถ้าไม่ตรง query พังตอน runtime และตอนนี้มีหลักฐานแล้วว่าไม่ตรงจริง | `backend-engineer` **ต้อง**ตรวจทุกคอลัมน์ที่ยังเป็น 🟡 กับ DB จริงก่อนเขียน query (BE-013 ต้องทำก่อน BE-004 ไม่ใช่ทำท้ายเฟส) ถ้าไม่ตรงส่งกลับ `system-analyst` ห้ามเดา (OQ-15(b)/(c)) · **v4: `TFeatureSBPlus` ไม่อยู่ในรายการที่ต้องตรวจอีกแล้ว** (ยืนยันครบทั้งตาราง 🟢) แต่ผลการตรวจกลับทำให้เกิด **RISK-08** ขึ้นแทน |
| **RISK-04** | ระหว่าง `recompute` ทำงาน ตารางถูก `TRUNCATE` ก่อนเขียนใหม่ → **นักเรียนที่เปิดหน้า Premium ตอนนั้นเห็นอันดับ 0 / สถิติว่าง** | กลาง · เป็นพฤติกรรมเดิมที่ REQ-010 รับไว้แล้ว แต่จะถูกกระตุ้นบ่อยขึ้นเพราะ RISK-01 บังคับให้ต้อง recompute ตอน deploy | เลือกเวลารันนอกช่วงใช้งาน · โค้ดคืนค่าว่างแบบไม่ error อยู่แล้ว (`:218-231`) ไม่ต้องแก้ |
| **RISK-05** | ไม่มีการบันทึกว่าใครสั่ง `recompute` — ไม่มี audit log | กลาง | ไม่แก้ในรอบนี้ (OQ-10 ปิดไปแล้วเพราะไม่มีการเข้าถึงข้ามคน) แต่บันทึกไว้ · ถ้าเปิด role เพิ่มในอนาคตต้องกลับมาเปิดเรื่องนี้ |
| **RISK-06** | คุณภาพข้อมูลหน่วยกิต — ถ้ากรอกไม่ครบเป็นวงกว้าง fallback จะทำงานบ่อยกว่าที่คาด | ต่ำ · **ผลลัพธ์ยังถูกต้องและไม่ error ทุกกรณี** คุณค่าของ REQ-012 แค่น้อยกว่าที่ตั้งใจ | ไม่บล็อก implementation · ดู OQ-12 |
| **RISK-08** | **v4 (2026-08-25) — ไม่มีตัวระบุ feature ที่เสถียรใน `TFeatureSBPlus`** · ถ้าเลือกกลไกที่เทียบด้วยข้อความ (`feature_description`/`default_title`) = ผูก**การอนุญาตสิทธิ์**เข้ากับข้อความที่ไม่มี unique constraint และแก้ได้จากฝั่งจัดการ SB PLUS · ถ้าเลือกกลไกที่ใช้เลข `feature_id` = ผูกเข้ากับค่า serial ที่ต่างกันได้ทุก environment และอาจมีหลายแถวถ้าตารางแยกตามโรงเรียน (`schoolID`) | **สูง** · ทั้งสองแบบพังแบบ**เงียบ**: กฎ fail-closed ทำให้ผู้ใช้ที่จ่ายเงินถูกปฏิเสธโดยระบบไม่ error เลย · ในทางกลับกันถ้าข้อความถูกแก้ให้ตรงกับที่โค้ดเทียบ คนไม่มีสิทธิ์จะผ่านได้ | **v9 (2026-09-01): OQ-15(a1) ปิดทิศทาง — เลือกกลไก `"FeatureCode" varchar UNIQUE` (ตัวเลือก i) ซึ่งไม่ใช่ทั้งสองแบบที่ความเสี่ยงนี้เตือน** (ไม่ใช่เทียบข้อความ ไม่ใช่ hardcode `feature_id`) จึงเป็นการจัดการที่ปิดความเสี่ยงนี้ได้ **เมื่อสร้างจริงแล้ว** · **แต่ยังไม่ปิดวันนี้** เพราะคอลัมน์ยังไม่มีอยู่จริง (PRE-06) และ OQ-15(a2) ยังไม่มีค่า — ความเสี่ยงเดิมยังมีผลจนกว่า PRE-06 จะเสร็จ · `security` ต้องเห็นข้อนี้ตอน audit Phase 2 และตรวจว่ากลไกที่ implement จริงตรงกับ `"FeatureCode"` ไม่ใช่กลไกอื่นที่ engineer เลือกเอง · **v10 (2026-09-01): แก้ชื่อคอลัมน์เป็น `"FeatureCode"` (PascalCase) แทน `feature_code` (snake_case) — เป็นการแก้ชื่อเท่านั้น ไม่กระทบการประเมินความเสี่ยงหรือสถานะเปิด/ปิด** |
| **RISK-09** *(ใหม่ v5, 2026-08-31 · **จัดการแล้วด้วยข้อกำหนดถ้อยคำ — ดูด้านล่างตาราง**)* | **ฐานที่ใช้คำนวณ `"MeanScore"`/`"StddevScore"` ไม่ใช่ "นักเรียนทั้งประเทศ" จริง ๆ** — เป็นนักเรียนใน**โรงเรียนที่ใช้ SchoolBright เท่านั้น** และ endpoint `recompute` มี **`limit` default = 10 โรงเรียน** (ดู `## National Stats Batch Rules` § deployment step) ถ้ารันโดยไม่ส่ง `?limit=0` ฐานจะแคบกว่าที่ชื่อบอกอีกมาก | กลาง-สูง · ตัวเลขยัง**เรียงลำดับถูก**ในกลุ่มที่มีข้อมูล แต่**คำอธิบายที่ให้ผู้ใช้ปลายทางเกินจริง** และแก้ทีหลังไม่ได้เมื่อเด็กเห็นตัวเลขไปแล้ว · REQ-017 ทำให้ชัดขึ้นเพราะ stddev เป็นตัวหารของ T-Score โดยตรง | **ผู้ใช้ตัดสินแล้ว (2026-08-31): "ปรับคำพูดให้ตรงความจริง"** — ไม่แก้สูตร ไม่แก้ฐานข้อมูล แต่**เปลี่ยนถ้อยคำที่แสดงต่อผู้ใช้ปลายทาง** → กลายเป็น **ข้อกำหนดที่ต้องทำ (WORD-01)** ไม่ใช่ความเสี่ยงที่แค่บันทึกไว้ · บวก: `devops` ต้องรัน recompute ด้วย `?limit=0` โดยจงใจ (มีใน deployment step แล้ว) |
| **RISK-10** *(ใหม่ v7, 2026-08-31 · v8: ข้อ (3) เดิมถอดออกเพราะไม่ต้อง migration)* | **การเปลี่ยนชื่อตาราง/คอลัมน์ (DES-012) พังแบบเงียบได้ 2 ทาง**: (1) **ลืม quote** — PostgreSQL fold เป็นตัวพิมพ์เล็ก → query พังตอน runtime โดย build ผ่าน และ `qa-engineer` ที่ไม่มี test suite จับไม่ได้จากการอ่านโค้ดเพียงผิวเผิน (2) **แก้ไม่ครบทุกจุด** — มี 22 จุดใน 2 ไฟล์ จุดที่ถูกลืมจะพังเฉพาะ code path ที่ไม่ค่อยถูกเรียก (เช่น `GetAllLevelStats` ของ debug endpoint) | **สูง** · ทั้งสองแบบ**ไม่มีอะไรฟ้อง** | `qa-engineer` ต้องตรวจ **ทุกจุดใน 2 ไฟล์แบบนับจำนวน** ไม่ใช่สุ่มดู (รายการบรรทัดอยู่ใน DES-012) · **หลัง deploy ต้องรัน recompute (PRE-04) แล้วตรวจว่าตารางใหม่มีแถวจริง** ไม่ใช่เชื่อว่างานสำเร็จเพราะไม่มี error |
| **RISK-11** *(ใหม่ 2026-08-31)* | **ความจริงสองชุดเรื่อง RIASEC/Cluster ในผลิตภัณฑ์เดียว** — `education-pathway-assessment-design.md` เสนอโมเดลคะแนนคนละชุดกับ `sb-compass-faculty-match` `## RIASEC Fit Rules` + `## Cluster Determination Rules` ที่ผู้ใช้ปิดเป็น confirmed แล้ว (2026-08-31) · เอกสารร่างเขียนตัวเองว่า "พร้อมส่งต่อให้ Product / UX / Frontend / Backend implement" **ซึ่งไม่จริงในสถานะปัจจุบัน** | **สูง** · ถ้ามีใครหยิบไฟล์ร่างไป implement ตรง ๆ จะได้ระบบที่ขัดกับสัญญาที่ยืนยันแล้ว และเด็กคนเดียวจะมีคะแนนความสนใจ/ความพร้อมสองค่าที่ไม่ตรงกัน · ความเสียหายจะไม่ปรากฏเป็น error — จะปรากฏเป็นผลลัพธ์ที่อธิบายไม่ได้ | **v2 (หลังผู้ใช้ปิด OQ-20)**: ความเสี่ยงยังอยู่ **แต่เปลี่ยนรูป** — ตอนนี้ไฟล์ร่างเป็น "ฐานอ้างอิงหลัก" อย่างเป็นทางการ ความเสี่ยงจึงกลายเป็น **การรับมาทั้งฉบับโดยไม่ผ่านคำวินิจฉัยรายข้อ** · การจัดการ: `### คำวินิจฉัยรายข้อ...` ระบุ adopt/adapt/reject ครบทุกข้อพร้อมเหตุผล · **สิ่งที่ผูกพัน engineer คือสัญญาใน `sb-compass-faculty-match/design.md` หลัง amend เท่านั้น ไม่ใช่ตัวไฟล์ร่าง** — ห้าม implement จากไฟล์ร่างโดยตรงไม่ว่ากรณีใด · การ amend สัญญานั้นเป็นงานของ `system-analyst` รอบของโมดูลนั้น และข้อที่ 🧑 ต้องผ่าน `business-analyst` + ผู้ใช้ก่อน |
| **RISK-12** *(ใหม่ 2026-08-31)* | **schema ที่เอกสารร่างเสนอ (§ I.1) ละเมิดขอบเขตความเป็นเจ้าของข้อมูล** — เสนอให้ Compass เก็บ `student`, `student_grade`, `subject` ของตัวเอง ทั้งที่ `## Data Model` กลุ่มที่ 3 กำหนดว่าฐานข้อมูลเกรดเป็นของภายนอก **อ่านอย่างเดียว** · และชื่อทั้ง 18 ตารางเป็น snake_case ซึ่งขัดกับ OQ-19 ตัวเลือก C ที่เพิ่งปิดในวันเดียวกัน | **สูง** · การเก็บสำเนาคะแนนนักเรียนชุดที่สองคือ **ข้อมูลส่วนบุคคลของผู้เยาว์ที่ต้องดูแลเพิ่มอีกชุด** และเป็นแหล่งที่ข้อมูลจะไม่ตรงกับต้นทางเมื่อครูแก้เกรด (ซึ่ง `## Constraints` ของ `requirement.md` บังคับให้เคารพ) | **v2 (หลังผู้ใช้ปิด OQ-20)**: คำวินิจฉัย = **REJECT schema ตามที่เขียน · ADOPT เฉพาะแนวคิด** (ดูข้อ D ของ `### คำวินิจฉัยรายข้อ...`) · **ตัด `student`/`student_grade`/`subject` ทิ้งทั้งสามตาราง** — อ่านจากกลุ่มที่ 3 + ค่า REQ-012 แทน · ตารางที่เหลือต้องเขียน DDL ใหม่เป็น `public."TCompassXxx"` + `"PascalCase"` + `"IX_..."` ในรอบ `system-analyst` ของ `sb-compass-faculty-match` · **แนวคิดที่รับ**: config-driven (ห้าม hard-code ค่าคงที่) · แยก raw response จากผลคำนวณ · `config_snapshot_id` เพื่อ reproducibility · time-series ห้ามเขียนทับ |
| **RISK-13** *(ใหม่ 2026-08-31 · เงื่อนไขบล็อก satisfied แล้ว 2026-09-02)* | **ตัวเลขในเอกสารร่างไม่มีแหล่งอ้างอิง แต่เขียนด้วยน้ำเสียงของผลการทดลอง** — เช่น "ทดสอบด้วยนักเรียนสาย C ได้ 60.1", "ρ = 0.97", "α คาดการณ์ 0.68–0.78", "completion rate 80–87%", "ม.3 เริ่มตอบมั่วหลังข้อที่ 25–28", "SEM ราว ±6–10 จุด" · เอกสารอ้างว่าตัวเลข PART 9 มาจาก **reference implementation จริง (`scoring_reference.py`)** แต่ **ไฟล์นั้นไม่มีอยู่ใน repo นี้** (ค้นแล้วไม่พบ) · เอกสารประกาศ A4 เองว่าค่าคงที่ยังไม่ได้พิสูจน์ทางสถิติ **แต่ไม่ได้ครอบตัวเลขกลุ่มข้างต้น** | กลาง-สูง · ตัวเลขที่อ่านเหมือนหลักฐานจะถูกใช้เป็นเหตุผลตัดสินใจ (เช่น "ต้องเปิด Adaptive Threshold บังคับ") โดยไม่มีใครตรวจว่ามาจากไหน · **ความเสี่ยงต่อความถูกต้องของโมเดลยังคงอยู่ถาวร** (ตัวเลขยังไม่ผ่านการยืนยันทางสถิติจากภายนอก) แม้เงื่อนไขที่เคยบล็อกจะปิดแล้ว | **เงื่อนไขที่เคยบล็อก ("ต้องมีแถวใน `## References` ของ `requirement.md` พร้อมที่มาก่อน") satisfied แล้ว 2026-09-02** — OQ-21 ปิดแล้ว และ `requirement.md` → `## References` มีแถวมาร์กตัวเลขทั้งชุดเป็น `(assumption — unconfirmed)` ครบแล้ว (ดูแถว OQ-21 ของตารางนี้) · **ทั้งหมดยังต้องถือเป็น *(สมมติฐาน — ยังไม่ยืนยัน)* ต่อไปเสมอ** — การปิด OQ-21 คือ "ไม่ต้องหาที่มาจริงเพิ่มก่อนใช้" ไม่ใช่ "ตัวเลขถูกต้องแล้ว" · ตัวเลขที่มาจากการรันโค้ดยังต้องแนบโค้ดนั้นเข้า repo ก่อน จึงจะนับเป็นหลักฐานตรวจซ้ำได้ · residual risk (ความแม่นยำของโมเดล) ยังเปิดอยู่ถาวรและเป็นความเสี่ยงที่ผู้ใช้รับทราบแล้วผ่านการปิด OQ-21 ไม่ใช่สิ่งที่ต้องบล็อกงานต่อ |
| **RISK-14** *(ใหม่ 2026-08-31 — ข้อค้นพบเชิงข้อมูลจริง ไม่ใช่ความเห็น)* | **ชั้น Readiness ของเอกสารร่างคำนวณจากข้อมูลที่ระบบไม่มี** · ตาราง Subject → RIASEC (§6.2) มี **10 แถววิชา** แต่ระบบจริงมีกลุ่มสาระ **8 กลุ่ม** (REQ-001) และ **2 แถว map ลงไม่ได้**: (1) *"กิจกรรมพัฒนาผู้เรียน/ชุมนุม/จิตอาสา"* — REQ-001 ระบุว่าคอร์ส **ชุมนุม/กิจกรรม ถูกตัดออก ไม่นำมาคิดเลย** ทั้งที่เอกสารร่างเรียกแถวนี้เองว่า **"แหล่งข้อมูลเดียวที่วัด S และ E ได้จริง"** (2) *"การงานอาชีพ"* กับ *"เทคโนโลยี/คอมพิวเตอร์"* เป็นคนละแถวที่น้ำหนักต่างกันมาก แต่ระบบจริงรวมเป็นกลุ่มเดียว (`การงานอาชีพและเทคโนโลยี`) | **สูง ต่อความถูกต้องของโมเดล — ไม่ใช่ต่อ runtime** · ระบบจะ**ไม่ error** แต่ `Rd_S`/`Rd_E` จะถูกคำนวณโดยขาดแหล่งที่เอกสารร่างระบุว่าจำเป็น และกลไกแยก C2 ออกจาก C3 ที่เอกสารร่างยกเป็นเหตุผลของโครงสร้าง 2 ชั้น (*"เทคโนโลยี C3 = 0.40 vs C2 = 0.15"*) **จะไม่ทำงานเลย** · ผลคือคะแนนที่ดูสมเหตุสมผลแต่ผิดอย่างเป็นระบบ | **REJECT ชั้น Readiness ตามที่เขียน** (ข้อ C/C2/C3 ของ `### คำวินิจฉัยรายข้อ...`) · ใช้ `AcademicFit(c)` จาก **T-Score ของกลุ่มสาระ 8 กลุ่ม** ที่ยืนยันแล้วแทน — ซึ่ง**มีข้อมูลจริงรองรับครบ** · ถ้าธุรกิจต้องการสัญญาณ `S`/`E` จากกิจกรรมนอกห้องเรียนจริง **ต้องเปิดเป็น requirement ใหม่ว่าจะเก็บข้อมูลนั้นจากไหน** (REQ-001 ตัดทิ้งโดยเจตนา การกลับคำต้องผ่าน `business-analyst`) — **ห้าม engineer ประดิษฐ์แหล่งข้อมูลขึ้นเอง** |
| **DEP-01** | Module A ต้องเสร็จก่อน Module C และ Module D | — | ระบุใน `## Modules` |
| **DEP-02** | Module B ต้องเสร็จก่อน Module D (REQ-016 AC5) | — | ระบุใน `## Modules` |
| **DEP-03** | *(ปิดแล้ว 2026-08-25)* Module B เคยถูกบล็อกด้วย OQ-14 · **ตอนนี้เริ่มได้แล้ว** เหลือเพียง prerequisite ตอน deploy | — | ย้ายไปเป็น PRE-01/02/03 ใน `## Deployment Prerequisites` |
| **DEP-04** | ไม่ต้องรัน `setup` agent — ระบบมีอยู่แล้ว ไม่ใช่โปรเจกต์ใหม่ และไม่ได้ใช้ stack ที่ `setup` รู้จัก | — | ระบุในหมายเหตุ stack ด้านบน |

> **RISK-15 / RISK-16 / DEP-05 ถูกถอดออกทั้งหมดใน v14 (2026-09-08)** — ทั้งสามผูกกับ DES-021
> (การย้าย "ดึงคะแนน" ไป `sb-tech-upgrade-api-academic`/`sb-api-gateway`) ซึ่งผู้ใช้สั่งยกเลิก target
> ทั้งสองตัวแล้ว · บันทึกเต็มย้ายไป `design-archive.md`

## DES-020 — WORD-01: ข้อกำหนดถ้อยคำของค่าสถิติเปรียบเทียบ (ผู้ใช้ยืนยัน 2026-08-31)

> **DES-020** — traceability id ของหัวข้อนี้ (ลงทะเบียนระหว่าง reconciliation pass 2026-09-07 ·
> ไม่ใช่การตัดสินใจใหม่ กติกาในหัวข้อนี้ไม่เปลี่ยน · ดูแถวใน `## Feature-by-Feature Feasibility`)

**สถานะ: เป็นข้อกำหนด ไม่ใช่คำแนะนำ** — เกิดจากการตัดสินของผู้ใช้ในการปิด RISK-09 · ผูกกับทุกจุดที่
แสดงค่าที่คำนวณจาก `public."TCompassLevelSubjectStat"` / `public."TCompassStudentLevelScore"`
ต่อผู้ใช้ปลายทาง

| | รายละเอียด |
|---|---|
| **ห้ามใช้** | ถ้อยคำที่สื่อว่าเทียบกับ**นักเรียนทั้งประเทศ** — เช่น "เทียบกับทั้งประเทศ" · "ระดับประเทศ" · "อันดับของประเทศ" · "นักเรียนทั่วประเทศ" หรือคำอื่นที่ให้ความหมายเดียวกัน |
| **ให้ใช้แทน** | ถ้อยคำที่สื่อว่าเทียบกับ **ฐานข้อมูลนักเรียนในระบบ SchoolBright** เช่น "เทียบกับนักเรียนในระบบ SchoolBright" · "เทียบกับฐานข้อมูลนักเรียนของเรา" — **ถ้อยคำสุดท้ายเป็นของ `uxui-designer`/`business-analyst`** เอกสารนี้กำหนดแค่ *ความหมายที่ต้องสื่อ* ไม่ได้เขียน copy ให้ |
| **ขอบเขตที่ต้องแก้** | (1) **ของใหม่**: ทุกจุดที่แสดง T-Score ของ `sb-compass-faculty-match REQ-013` (2) **ของเดิมที่มีอยู่แล้ว**: หน้าจอ/ข้อความของ **REQ-004** (อันดับและค่าเฉลี่ยเทียบระดับชั้น) ที่ปัจจุบันอาจใช้คำว่า "ระดับประเทศ" อยู่ — **ต้องตรวจ copy จริงในหน้าจอปัจจุบันด้วย ไม่ใช่แก้เฉพาะของใหม่** (3) **v11 (2026-09-02) — เพิ่ม `Views/Compass/MyCompass.cshtml` + `assets/js/compass-design.js`/`compass-design-data.js`/`compass-design-engine.js`**: มอคอัปหน้าจอใหม่ (frontend-only, นำเข้าจาก Claude Design draft) ที่ routed อยู่จริงที่ `Compass/MyCompass` และ **ผูกอยู่ใน student nav แล้ว** (`Views/Shared/_Layout.cshtml:631`) — ยังไม่มีการต่อ backend ใด ๆ (เนื้อหาทั้งหมดมาจาก mock data ใน JS ไฟล์ข้างต้น) แต่ตัวข้อความสถิติที่แสดง (`compass-design.js` ราวบรรทัด 379-394) ใช้หัวข้อ **"เทียบเครือข่ายทั่วประเทศ"** ซึ่ง**ละเมิด WORD-01 อยู่แล้วตามนิยามเดิม** (มี "ทั่วประเทศ") — เอกสารนี้ไม่เคยรู้จักไฟล์นี้มาก่อนตอนตั้ง WORD-01 (2026-08-31) จึงต้องระบุชื่อไฟล์ไว้ตรง ๆ ไม่ให้หลุดขอบเขต · **กติกาถ้อยคำเดียวกันทุกประการ** (ห้าม "ทั่วประเทศ"/"ระดับประเทศ" ให้ใช้กรอบ "เครือข่าย SchoolBright" แทน) **ไม่ใช่การเปิดกติกาใหม่** · ตัวเลขมอคอัปอื่น ๆ ในไฟล์เดียวกัน (เช่น `"อันดับ 3,693 จาก 4,191 คน"`, `"เทียบเครือข่ายทั้ง 9 โรงเรียน"` ที่เล็กกว่าฐานจริง ~400 โรงเรียน/~400,000 คนตาม `RISK-09`/`## National Stats Batch Rules` มาก) **ไม่ใช่ขอบเขตของ WORD-01** — เป็นเรื่องขนาด/ตัวเลขมอคอัปที่ยังไม่ต่อข้อมูลจริง ไม่ใช่ถ้อยคำ (WORD-01 แก้เฉพาะคำอธิบายฐานเทียบ ไม่แตะสูตร/ตัวเลข/ตรรกะการจัดอันดับของมอคอัป) |
| **ใครทำ** | `uxui-designer` (เขียน copy) + `frontend-engineer` (นำไปใช้) · **`business-analyst` ตรวจว่าข้อความสุดท้ายไม่ได้อ้างเกินฐานข้อมูลจริง** |
| **ไม่ใช่งานของใคร** | **ไม่ใช่งานของ `backend-engineer`** — ไม่มีการเปลี่ยนสูตร ชื่อคอลัมน์ หรือ payload · เป็นเรื่องชั้นแสดงผลล้วน ๆ |

**หมายเหตุขอบเขตของ `system-analyst`**: ข้อ (2) แตะหน้าจอของ REQ-004 ซึ่งเป็น scope ที่ปิดไปแล้ว —
เอกสารนี้**ไม่ได้แก้ contract ของ REQ-004** และไม่ได้เปิดการตัดสินใจเดิมใหม่ · สิ่งที่เพิ่มคือ
**ข้อกำหนดเรื่องถ้อยคำที่ครอบจุดแสดงผลเดิมด้วย** ตามที่ผู้ใช้สั่งตรง ๆ ว่า "ไม่ใช้คำว่าเทียบกับ
ทั้งประเทศต่อไป" — ถ้าการแก้ copy ของ REQ-004 กระทบ acceptance criteria เดิมข้อใด ให้ส่งกลับ
`business-analyst` ไม่ใช่ตัดสินเองที่ชั้น design · **หมายเหตุเพิ่ม (v11, 2026-09-02)**: ข้อ (3)
เช่นกัน — `Views/Compass/MyCompass.cshtml` เป็นมอคอัปที่ไม่เคยผ่านรอบ requirement/design ใด ๆ
ของ `sb-compass` มาก่อน (นำเข้าจาก Claude Design draft ตรง ๆ) เอกสารนี้**ไม่ได้รับรองความถูกต้อง
ของมอคอัปทั้งหน้า ไม่เปิด REQ ใหม่ให้มัน และไม่ตัดสินเรื่องการรวม Analytics + PathFinder** (ยืนยัน
กับผู้ใช้แล้วว่าเป็นแค่รายละเอียดการตั้งชื่อ/รวมหน้าจอ ไม่ใช่การเปลี่ยน scope — ดู
`CompassController.cs:37-45`) — **ขยายเฉพาะขอบเขตของ WORD-01 ให้ครอบไฟล์นี้ด้วยเท่านั้น**

Contract:StatWordingRules.v1
DEC-020

Evidence EVD-019: claim=DES-020 | state=confirmed | path=ClassOnlineWeb/Views/Compass/MyCompass.cshtml | symbol=sbcd-root | line=20 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=4fc8e1af4d578e6da0edca5d47b34f5bf8282b2258fcc11042093a44590f1b8a
Evidence EVD-020: claim=Contract:StatWordingRules.v1 | state=confirmed | path=ClassOnlineWeb/assets/js/compass-design.js | symbol=เทียบกับนักเรียนในระบบ SchoolBright | line=307 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=b341cc8c2a10bf5001320729e0e65558bcd55b52896e49737379c0ca1f409b01
Evidence EVD-021: claim=DEC-020 | state=unresolved | path=ClassOnlineWeb/assets/js/compass-design.js | symbol=statTitle | line=381 | revision=b7747bd50379ac57ec918a7542511f99428dc1db | basis=source | tool=rg-read | hash=b341cc8c2a10bf5001320729e0e65558bcd55b52896e49737379c0ca1f409b01

Compatibility: unchanged
Data/schema: unchanged
Migration/backfill: none
Security: none
Fallback: ถ้า copy สุดท้ายจาก `uxui-designer` ยังไม่ลง — คงถ้อยคำที่แสดงบนหน้าจอเดิมไว้ทุกจุด (เช่น `statTitle` ของ `compass-design.js` บรรทัด 307/381) จนกว่า copy สุดท้ายจะมา ห้าม engineer ประดิษฐ์ถ้อยคำทดแทนเอง · แต่จุดแสดงผลใด ๆ ที่ยังใช้ถ้อยคำต้องห้าม ("ทั่วประเทศ"/"ระดับประเทศ") ต้องเปลี่ยนเป็นกรอบ "เครือข่าย SchoolBright" ทันทีตามตารางข้างบน — ไม่รอ copy สุดท้าย
Material ambiguity: none

## Unresolved Open Questions

| ID | คำถาม | ใครตอบ | สถานะ |
|---|---|---|---|
| ~~OQ-14~~ | **ปิดแล้ว 2026-08-25** — `compass_premium` และ `compass_admin_ops` · บันทึกเต็มย้ายไป `design-archive.md` · กติกาอยู่ที่ `## Premium Entitlement Rules` และ `## Deployment Prerequisites` | — | ✅ ปิด |
| **OQ-15** | ชื่อคอลัมน์จริงของตาราง SB PLUS ตรงกับเอกสาร handoff หรือไม่ (`schema.prisma` อยู่ใน repo `sb-web-helper-2` ที่เซสชันนี้เข้าไม่ถึง) · `sbplus-api-spec.html §04-A` ยังไม่ได้อ่าน · *(ข้อย่อยที่ปิดไปแล้วในรอบ v3 — `TSubcriptionPlan` ไม่อยู่ใน flow จริง และ `TFeatureSBPlus.feature_description` คือชื่อจริง — ย้ายไป `design-archive.md` แล้วใน v4 · กติกาที่ใช้จริงอยู่ที่ `## Premium Entitlement Rules` ขั้นตอนที่ 3 + `## Data Model` กลุ่มที่ 2)*<br>🟡 **(a1) — กลไก · ตัดสินทิศทางแล้ว 2026-09-01 แต่ยังไม่ปลดบล็อก** ผู้ใช้เลือก **ตัวเลือก (i)**: **ทีมที่ดูแล SB PLUS จะเพิ่มคอลัมน์ `"FeatureCode" varchar UNIQUE` ให้ `TFeatureSBPlus`** แล้ว `CheckEntitlement` เทียบด้วยค่าคอลัมน์นั้น (ตัวเลือก (ii)/(iii)/(iv) ที่เคยเสนอไว้ถูกปฏิเสธ — ข้อความเต็มของทุกตัวเลือกและเหตุผลย้ายไป `design-archive.md` แล้วแบบคัดลอกตรงตัว) · **นี่คือการตัดสินกลไก ไม่ใช่การสร้างคอลัมน์จริง** — คอลัมน์ยังไม่มีอยู่ในฐานข้อมูลวันนี้ ต้องรอทีม SB PLUS ทำ **PRE-06** ก่อน · **v10 (2026-09-01): ชื่อคอลัมน์แก้เป็น `"FeatureCode"` (PascalCase) แทน `feature_code` (snake_case) — แก้ชื่อเท่านั้น ไม่เปลี่ยนมติ (i)** | **ผู้ใช้ + ทีมที่ดูแล SB PLUS** (ไม่ใช่ `backend-engineer` — BE-013 ตอบข้อนี้ไม่ได้) | 🔴 **ยังบล็อกขั้นตอนที่ 4 ของ `CheckEntitlement` → บล็อก BE-004 และทุก task ที่ต่อจากมัน (BE-005/006/007/012) เหมือนเดิมทุกประการ** — สิ่งที่เปลี่ยนคือ "รออะไร": จาก "รอเลือกกลไก" เป็น "รอ PRE-06 (สร้างคอลัมน์) และ OQ-15(a2) (ค่าจริง)" · **ไม่บล็อก** BE-008/009/010/011 และไม่บล็อกการวาง plan |
| ~~**OQ-15(a2)**~~ | **ปิดแล้ว 2026-09-15** — ผู้ใช้ยืนยันรหัส FeatureCode ในระบบ SB PLUS ว่า `compass_premium` และ `compass_admin_ops` คือชื่อจริง ตรงกับที่โค้ด `CompassEntitlementService` กำหนดไว้ · กติกาอยู่ที่ `## Premium Entitlement Rules` ขั้นตอนที่ 4 · รอทีม SB PLUS/devops รัน PRE-06 ก่อน deploy | ผู้ใช้ (ยืนยันตรง 2026-09-15) | ✅ **ปิดฝั่งธุรกิจ — ปลดบล็อก BE-004** (โค้ด query มีอยู่แล้ว รอเพียง PRE-06 ก่อน deploy) |
| **OQ-12** | **(ยกมาจาก `requirement.md` — ยังปิดไม่ได้ในรอบนี้)** ในทางปฏิบัติจริง มีรายวิชากี่ % ที่มีข้อมูลหน่วยกิต และต่างกันมากไหมระหว่างโรงเรียน | ต้องรัน query กับ DB จริง | 🟡 **ผมตอบไม่ได้ในเซสชันนี้** — ไม่มีสิทธิ์เข้าถึงฐานข้อมูลและไม่มี Bash tool · **ผมจะไม่เดาตัวเลข** · query ที่ต้องรันอยู่ด้านล่าง · **ไม่บล็อก implementation** เพราะ fallback ทำงานถูกต้องทุกกรณีอยู่แล้ว |
| ~~**OQ-16**~~ | **ปิดแล้ว 2026-09-15** — Breakdown รายวิชา = ตารางบรรจุในการ์ดกลุ่มสาระ (Table in Card) + ข้อความ `"ไม่มีข้อมูลหน่วยกิต"` (AC-016.7) · บันทึกเต็มย้ายไป `design-archive.md` · กติกาอยู่ที่ `## DES-018 — Premium Subject Breakdown Contract` | ผู้ใช้ (ยืนยันตรง 2026-09-15) | ✅ ปิด — ปลดบล็อก FE-001 |
| ~~**OQ-18**~~ *(เปิดและปิดในวันเดียวกัน 2026-08-31 — `requirement.md` เรียก "OQ-14 (ใหม่)")* | **ปิดแล้ว** — (ก) สูตร = population stddev (หาร `n`) · (ข) `MIN_N_FOR_STDDEV = 30` · บันทึกข้อเสนอ/ข้อโต้แย้งเต็มย้ายไป `design-archive.md` · กติกาอยู่ที่ `## National Stats Batch Rules` § `"StddevScore"` ข้อ 2-3 | ผู้ใช้ (ยืนยัน 2026-08-31) | ✅ ปิด — ไม่บล็อกอะไรอีก |
| ~~**OQ-19**~~ *(เปิดและปิดในวันเดียวกัน 2026-08-31)* | **ปิดด้วยตัวเลือก C — เปลี่ยนชื่อทุกตารางเป็น `public."TCompassXxx"` + `"PascalCase"` + `"IX_..."`** (ไม่ต้อง migration — v8 ยืนยันไม่เคยมีตารางจริง) · บันทึกประเมินเต็มย้ายไป `design-archive.md` · กติกาอยู่ที่ `## Data Model` กลุ่มที่ 1 · DES-012 · RISK-10 | ผู้ใช้ (ยืนยัน 2026-08-31) | ✅ ปิด |
| ~~**OQ-20**~~ *(เปิดและปิดในวันเดียวกัน 2026-08-31)* | **ปิดแบบมีเงื่อนไข** — ใช้เอกสารร่างเป็น "ฐานอ้างอิงหลัก" ต่อจากนี้ พร้อมอนุญาตให้โต้แย้งเป็นข้อ ๆ (ผล = ตาราง `### คำวินิจฉัยรายข้อ...` — REJECT 5 · ADAPT 3 · ADOPT 4 · มีอยู่แล้ว 1) · **เงื่อนไขที่ยังต้องทำต่อ**: (1) ข้อที่ทำเครื่องหมาย 🧑 เป็นการเปลี่ยนกติกาธุรกิจ ต้องผ่าน `business-analyst` + ผู้ใช้ก่อน (2) การ amend สัญญาจริงทำที่ `sb-compass-faculty-match/design.md` เท่านั้น · บันทึกข้อความเต็ม + ตัวเลือก (i)/(ii)/(iii) ย้ายไป `design-archive.md` | ผู้ใช้ (ปิดแล้ว 2026-08-31) · เงื่อนไขที่เหลือ → `business-analyst` + `system-analyst` ของ `sb-compass-faculty-match` | ✅ ปิด — 🔴 บล็อกการ implement โมเดลประเมินจนกว่าสัญญาโมดูลนั้นถูก amend (ไม่บล็อก Phase 1-4 ของโมดูลนี้) |
| ~~**OQ-21**~~ | **ปิดแล้ว 2026-09-02** — ตัวเลข/ค่าคงที่ทั้งชุดในเอกสารร่างถูกมาร์ก `(assumption — unconfirmed)` ใน `requirement.md` → `## References` แล้ว · บันทึกเต็มย้ายไป `design-archive.md` · ดู RISK-13 | ผู้ใช้ (ปิดแล้ว) · `business-analyst` บันทึกลง `## References` แล้ว | ✅ ปิด — ปลดล็อกการเขียนสัญญา RIASEC/Confidence ที่ `sb-compass-faculty-match/design.md` (ใช้เป็น engineering assumption เท่านั้น ไม่ใช่ fact) |
| ~~**OQ-22**~~ | **ปิดแล้ว 2026-09-02 ผ่าน `requirement.md` REQ-018 (trigger-based — N=4 สัปดาห์หลัง faculty-match REQ-011/012 ขึ้น production, N เป็น assumption)** — การถอด REQ-005/REQ-007 จริงยังไม่มี task เพราะ trigger ยังไม่เกิด คงกติกา 4 จุดไว้จนถึงตอนนั้น (DES-009 · DES-014) · บันทึกเต็มย้ายไป `design-archive.md` | ผู้ใช้ (trigger/N) + `business-analyst` (เขียน REQ-018) | ✅ ปิด — ไม่บล็อก implementation ของรอบนี้ |
| ~~**OQ-17**~~ | **ปิดแล้ว 2026-09-01** — กั้น debug endpoint ทั้ง 3 (`debug/scores`, `debug/my-stat`, `debug/national-stats`) ด้วย feature key `compass_admin_ops` ไม่ถอดออก (BE-012 ใน `plan.md` implement ตรงตามนี้แล้ว · `security` ต้องยืนยันตอน audit Module B ว่ากั้นครบจริง) · บันทึกตรวจโค้ดเต็มย้ายไป `design-archive.md` | ผู้ใช้ | ✅ ปิด |
| ~~**OQ-23**~~ | **ถอนคำถามแล้ว 2026-09-08 (v14)** — ยกเลิก target `sb-tech-upgrade-api-academic`/`sb-api-gateway` DES-021 เดิมถูกถอดทั้งหมด คำถาม gRPC/gateway จึงไม่มีความหมาย · บันทึกเต็มย้ายไป `design-archive.md` | — | ✅ ถอน — ไม่บล็อกอะไร |

**query สำหรับ OQ-12** (ให้ผู้ใช้หรือ `devops` รันแล้วส่งผลกลับมา):
```sql
-- % ของรายวิชาที่มีคะแนนเป็นตัวเลข และมีหน่วยกิตใช้ได้ แยกตามโรงเรียน
SELECT g."SchoolID",
       count(*)                                               AS graded_rows,
       count(*) FILTER (WHERE d."nCredit" IS NOT NULL
                          AND d."nCredit" > 0)                AS with_credit,
       round(100.0 * count(*) FILTER (WHERE d."nCredit" IS NOT NULL
                                        AND d."nCredit" > 0) / count(*), 1) AS pct
FROM   "PGTGrade" g
JOIN   "PGTGradeDetail" d ON d."nGradeId" = g."nGradeId"
WHERE  NOT g."cDel" AND NOT d."cDel"
GROUP  BY g."SchoolID"
ORDER  BY graded_rows DESC
LIMIT  20;
```
*(ชื่อ/การ quote คอลัมน์อาจต้องปรับตาม naming convention จริงของ PGGradeDB)*

**query ตรวจผลของ `MIN_N_FOR_STDDEV = 30` (OQ-18 ปิดแล้ว — query นี้เปลี่ยนจาก "ใช้ตัดสิน" เป็น
"ใช้เฝ้าดูหลัง deploy")** — บอกว่าเกณฑ์ 30 ทำให้กี่แถวเป็น `NULL` จริง · **`devops`/`qa-engineer`
ควรรันหลัง recompute รอบแรกที่มี `"StddevScore"`** ถ้าสัดส่วน `null_if_min_30` สูงจนน่ากังวล
(กลุ่มสาระถูกตัดออกจาก T-Score เป็นวงกว้าง) ให้ส่งตัวเลขกลับมาที่ `system-analyst`
**เพื่อ amend เกณฑ์ — ไม่ใช่ให้ engineer เปลี่ยนเลขเอง**:

```sql
-- แต่ละเกณฑ์จะทำให้ "StddevScore" เป็น NULL กี่แถว (จากทั้งหมดกี่แถว)
-- v7: ชื่อตาราง/คอลัมน์ตาม OQ-19 ตัวเลือก C — quote ทุกตัว
SELECT count(*)                                       AS total_rows,
       count(*) FILTER (WHERE "StudentCount" < 2)     AS null_if_min_2,
       count(*) FILTER (WHERE "StudentCount" < 10)    AS null_if_min_10,
       count(*) FILTER (WHERE "StudentCount" < 30)    AS null_if_min_30,
       min("StudentCount")                            AS smallest_group,
       round(avg("StudentCount"))                     AS avg_group_size
FROM   public."TCompassLevelSubjectStat";
```

*(ตัวเลขที่ต้องดูคือสัดส่วน `null_if_min_30 / total_rows` · คอลัมน์ `null_if_min_10`/`null_if_min_2`
เก็บไว้เพื่อให้เห็นว่าถ้าจะผ่อนเกณฑ์จะได้ข้อมูลเพิ่มเท่าไร — **ไม่ใช่ทางเลือกที่เปิดอยู่ เกณฑ์ปัจจุบัน
คือ 30 ที่ผู้ใช้ยืนยันแล้ว** การเปลี่ยนต้อง amend · `system-analyst` รันเองไม่ได้ในเซสชันนี้
— ไม่มีสิทธิ์เข้าถึงฐานข้อมูลและไม่มี Bash tool)*

**เรื่องที่ปิดไปแล้ว ห้ามยกขึ้นมาเสนอใหม่** (จาก `requirement.md` — บันทึกไว้เพื่อไม่ให้เสียรอบ):
เกณฑ์ 60/80 แยกตามกลุ่มสาระ · ปัจจัยขนาด/ชื่อเสียงโรงเรียนในสูตร · **minimum sample size ของ
`mean_score`/การจัดอันดับ** · consent gate เพิ่ม · role ผู้ปกครอง/ครู/ผู้บริหาร ·
การเทียบ/จัดอันดับที่ระดับรายวิชา · การไม่รอ `IsTermApproved` ·
การเปลี่ยน keyword matching เป็นตาราง mapping (อยู่ใน Later)

> **หมายเหตุ v5 (2026-08-31) — อ่านคู่กับรายการข้างบนเพื่อไม่ให้เข้าใจผิด**: เกณฑ์
> `MIN_N_FOR_STDDEV` ที่เพิ่มใน REQ-017 (`## National Stats Batch Rules` § `"StddevScore"` ข้อ 3)
> **ไม่ใช่การเปิด "minimum sample size" ที่ปิดไปแล้วใหม่** — ของเดิมที่ปิดไปคือ *ไม่ตั้งเกณฑ์ขั้นต่ำ
> สำหรับการแสดง `"MeanScore"`/อันดับ* ซึ่ง **ยังคงเป็นแบบนั้นทุกประการ ไม่มีอะไรเปลี่ยน** ·
> เกณฑ์ใหม่ใช้กับ **คอลัมน์ `"StddevScore"` เท่านั้น** ด้วยเหตุผลทางคณิตศาสตร์คนละเรื่องกัน
> (ค่าเฉลี่ยของกลุ่มเล็กยังมีความหมาย แต่ค่าการกระจายตัวของกลุ่มเล็กไม่มี)

## Change Log

- (รอบ v1 ถึง v15 · 2026-08-25 ถึง 2026-09-15 ก่อน v16) ย้ายไปเก็บที่ `design-archive.md` § Change Log แบบ verbatim แล้ว (ตาม `policies/documentation.md` §4) — กติกาที่ยังใช้อยู่ของแต่ละรอบอยู่ครบใน Contract sections ของเอกสารนี้





  อย่างเดียว ชื่อของมัน (`PGTGradeDetail."sID"` ฯลฯ) **ห้ามแก้ให้ตรงกัน** · OQ-15/OQ-16/OQ-17
  ไม่เปลี่ยนสถานะ · REQ-005/REQ-007 และประเด็นที่ `business-analyst` ปิดไปแล้ว ไม่ถูกแตะ

  **ไม่แตะ**: DDL ของ `CREATE TABLE IF NOT EXISTS` เอง (ชื่อตาราง/คอลัมน์/index PascalCase),
  สูตรคำนวณ, REQ-017/DES-011, ทุก module อื่นนอกจาก Module C

  **ไม่แตะ**: `## Data Model` · contract section ทุกหัวข้อ · Modules A-D · PRE-01..PRE-05 ·
  OQ-15/16/17 · สัญญาของ `sb-compass-faculty-match` (เอกสารนี้ไม่มีสิทธิ์แก้ และการรับข้อเสนอ
  ของเอกสารร่างต้อง amend ที่โมดูลนั้น ไม่ใช่ที่นี่)

  `## Data Model` · contract section ทุกหัวข้อ · Modules A-D · PRE-01..PRE-05 · OQ-15/16/17 ·
  **และ `sb-compass-faculty-match/design.md` ซึ่งเป็นที่ที่คำวินิจฉัยเหล่านี้ต้องถูกเขียนเป็นสัญญาจริง
  — `system-analyst` ของ `sb-compass` ไม่มีสิทธิ์เขียนไฟล์นั้น**

  **ไม่แตะ**: `## Data Model` กลุ่มที่ 1 (DDL ของตารางที่ module นี้เป็นเจ้าของ) · Modules A-D
  ส่วนที่ไม่เกี่ยวกับ OQ-15(a1)/OQ-17 · OQ-16 · OQ-19/20/21/22 · สัญญาของ
  `sb-compass-faculty-match`

  **ไม่แตะ**: มติของ OQ-15(a1) (ตัวเลือก i) · สถานะบล็อกของ BE-004 และ task ที่ต่อจากมัน ·
  OQ-15(a2) (ยังเปิด รอค่าจริง) · OQ-17 (ปิดแล้ว) · OQ-16/19/20/21/22 · Phase 1/3 · `## Data Model`
  DDL ของตารางที่ module นี้เป็นเจ้าของ · สัญญาของ `sb-compass-faculty-match` · `plan.md` (เอกสารนี้
  ไม่มีสิทธิ์เขียน — ดูรายการจุดที่ `plan.md` ยังอ้าง `feature_code` ในหมายเหตุ handoff ท้ายรอบนี้)

  เดิมมาก่อนที่ต้องประกาศเปลี่ยนแปลง

  **ไม่แตะ**: `## Data Model` · `## National Stats Batch Rules` · `## Premium Subject Breakdown
  Contract` · สูตร/ค่าคงที่ทุกตัว · มติของ OQ-15/17/19/20/21/22 · Phase 1-4 · สัญญาของ
  `sb-compass-faculty-match`


  **ไม่แตะ**: `## Data Model` · contract section ทุกหัวข้อ · Modules A-D · PRE-01..PRE-06 · OQ-15/16/17/19/20
  · WORD-01 · สัญญาของ `sb-compass-faculty-match` (การนำ REQ-018/OQ-21 ไปใช้จริงเป็นงานของ
  `system-analyst` ของโมดูลนั้น)
  และทุกการตัดสินใจอื่นที่ปิดไปก่อน v12 — รอบนี้ถอดเฉพาะสิ่งที่ v12/v13 เพิ่มเข้ามาเท่านั้น

  **ยังไม่ตัดสิน — ส่งต่อ**: `plan.md` ไม่เคยถูกแก้เพื่อรองรับ DES-021 มาตั้งแต่ v12 (ยังไม่
  implementable ในตอนนั้น) จึงไม่มี task ใดต้องถอดออกจาก `plan.md` ในรอบนี้ — ไม่มีอะไรส่งต่อให้
  `project-manager`
- 2026-09-15 — **v16 — แก้ไขข้อกำหนด ISS-01 เรื่องจุดทศนิยมใน Gap Report (Contract Version 15 → 16)**:
  **(1) ปิด ISS-01 ใน DES-015**: กำหนดสัญญาให้ Gap Report (`AI_advice/path`, REQ-006 ใน `CompassPathCatalog.BuildAdvice`)
  ต้องไม่ re-round คะแนนกลุ่มสาระที่ถ่วงน้ำหนักแล้วเป็นจำนวนเต็ม (`Math.Round(avg[kv.Key], 0)`) แต่ให้คงทศนิยม 2 ตำแหน่ง
  สำหรับ `VMGapItem.Current` (`Math.Round(avg[kv.Key], 2)`), คำนวณ `VMGapItem.Gap = Math.Round(Math.Max(0.0, target - cur), 2)`,
  และแสดงผลทศนิยมตามจริงในข้อความ advice (`{m.Gap:0.##}`) เพื่อไม่ให้คะแนน 67.5 แสดงเป็น 68 ใน Gap report และ Gap เพี้ยน
  **(2) อัปเดต Contract:SubjectScoreAggregation.v1 และ DEC-015**: ระบุข้อห้าม re-round เป็น 0 dp ชัดเจนในระดับสัญญา
  และเพิ่ม `Evidence EVD-022` ผูกกับ `ClassOnlineWeb/Helper/CompassPathCatalog.cs:105` (`BuildAdvice`)
  **(3) อัปเดต Feasibility, Confirmed Decisions, และ Module A**: บันทึกการปิด ISS-01 ในตาราง Feasibility (DES-015),
  เพิ่มแถวใน `### การตัดสินใจที่ผู้ใช้ยืนยันแล้ว`, และบันทึกขอบเขตใน Module A
- 2026-10-04 — **สั่งรัน PRE-06** (คำสั่งผู้ใช้ "ปิด human gate ทั้งหมด ถามมาได้เลย" ในแชต — วันที่ = วันที่ของ session): ให้ทีมดูแล SB PLUS รัน `sql/pre-06-add-feature-code.sql` บน `JabjaiSchoolSingleDB` แล้วรายงานผลกลับ (ยืนยันคอลัมน์ `"FeatureCode"` ถูกสร้างจริง + ค่าที่ตั้ง) เพื่อบันทึกยืนยันในเอกสารนี้ — OQ-15(a1)/(a2) ปิดอยู่แล้ว ทุกสัญญาคงสถานะเดิม ไม่แตะส่วนอื่น · system-analyst (บันทึกคำสั่ง)


