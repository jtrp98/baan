# sb-compass-faculty-match — Modules

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


Back-links: `index.md`
