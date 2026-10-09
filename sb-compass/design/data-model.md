# sb-compass — Data Model

> Budget ≤ 15 KB (`policies\documentation.md` §4) · เขียนโดย `system-analyst` เท่านั้น · นี่คือ **schema contract** — `qa-engineer` อ่านเต็มทุกรอบ, engineers implement verbatim

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


## Change Log

- 2026-10-07 — Migrated to split layout

Back-links: `design\index.md` · `..\index.md`
