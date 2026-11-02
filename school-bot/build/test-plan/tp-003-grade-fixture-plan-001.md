# TP-003 — แผน grade parity/coexistence/crash fixtures

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

อ้างอิง: [SA-004 Rev2](../design/export-proof-pack-001.md) (5 gates + synthetic fixtures หลัก), [DES-008 (Mapping หลักสูตรกับช่องคะแนน SchoolBright) Rev5](../design/des-008.md), [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright) Rev4](../design/des-009.md), [กฎ mapping/export Rev1](../design/grade-rules-032-034.md), [REQ-049 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)..[REQ-052 (สิทธิ์ การส่งซ้ำ และ audit คะแนน)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md), [TP-002 fixture plan Rev1](tp-002-fixture-plan-001.md), [transport กลางของ index](index.md). เอกสารนี้เป็น**แผนเตรียมเท่านั้น** (docs-only) ไม่มีการรัน fixture จริง ทุก actual=NOT_RUN ไม่ใช่ QA PASS และไม่ปิด gate ใดของ SA-004

## หลักการกลาง (ต่อ TP-002)

- **synthetic fixtures เป็นหลัก** ตาม SA-004 Rev2: ข้อมูลสมมติทั้งหมด ไม่คัดลอกข้อมูลบุคคล/credential/คะแนนจริง; synthetic identifiers สอดคล้องกันทั้งชุด; ทุก artifact ตรวจก่อนนำเข้า knowledge
- **จำลอง PGGradeDB ด้วย test store**: test PostgreSQL จริงที่สร้าง schema ตารางเดิม (Pgtassessment/PgtgradeDetail/PgtgradeAuditLog ฯลฯ) + synthetic rows เท่านั้น — ต้องเป็น engine จริงเพื่อให้ system column `xmin` เป็นของแท้ ไม่จำลองด้วยคอลัมน์ปลอม; ฝั่ง SchoolBot ใช้ test SchoolBot DB (ไม่ใช่ production 10.0.0.128:9499)
- **legacy-writer simulator**: writer เดิม `sb-service-academic-score-record` ไม่มี source (source-review-005) จึงจำลองด้วย simulator ที่เขียนตามสัญญาเดียวกัน (cells + expectedRowVersions = xmin) ติดป้าย (simulator — ไม่ใช่ writer เดิม); การปิด G-COEXIST จริงยังต้องรอ inventory writers/triggers/functions จากเจ้าของ
- **ไม่ mock เงื่อนไขผลลัพธ์**: expected ของ Gateway-PARITY คำนวณแยกด้วย decimal golden script จากสูตร DES-009/[มติ 023 (มติ writer คะแนน, ปัดเศษ, นำเข้า Sheet และเจ้าของ mapping)](../../shared/decisions/decisions-023.md)/033 แล้วเทียบ output จริงของ pipeline; ห้าม stub calculator/writer; reader อย่างเดียวไม่พิสูจน์ writer
- ทุก fixture ระบุ build/commit hash + profile (PF-GRADE) + evidence code (E-DB before/after+audit, E-API, E-TRACE); ผลทุกเคสเริ่ม NOT_RUN

## สารบัญ fixture

| รายละเอียด | จุดตรวจ |
|---|---|
| [GF-01 สูตร/ปัด/preview ต่อช่อง (G-PARITY)](tp-003-grade-fixture-plan-001-gf-01.md) | ชุดข้อมูล วิธีจำลอง และผลที่คาดของกลุ่ม |
| [GF-02 derived totals/เกรด parity 100% + assignment semantics (G-PARITY)](tp-003-grade-fixture-plan-001-gf-02.md) | ชุดข้อมูล วิธีจำลอง และผลที่คาดของกลุ่ม |
| [GF-03 writer race/xmin CAS/advisory lock (G-COEXIST)](tp-003-grade-fixture-plan-001-gf-03.md) | ชุดข้อมูล วิธีจำลอง และผลที่คาดของกลุ่ม |
| [GF-04 ScoreData/identifier/detail row/receipt shape (G-TARGET)](tp-003-grade-fixture-plan-001-gf-04.md) | ชุดข้อมูล วิธีจำลอง และผลที่คาดของกลุ่ม |
| [GF-05 สิทธิ์/บริบท/lock/SubmitPeriod/override ฝั่ง server (G-AUTHZ)](tp-003-grade-fixture-plan-001-gf-05.md) | ชุดข้อมูล วิธีจำลอง และผลที่คาดของกลุ่ม |
| [GF-06 durable receipt/audit + crash ladder (G-DB — จำลองบน test DB)](tp-003-grade-fixture-plan-001-gf-06.md) | ชุดข้อมูล วิธีจำลอง และผลที่คาดของกลุ่ม |

[ตาราง AC → fixture ครบชุด](tp-003-grade-fixture-plan-001-coverage.md)

## ข้อจำกัด — สิ่งที่ต้องรอของจริงก่อน runtime

1. **G-PARITY "เทียบระบบเดิม 100%"**: synthetic golden ของ GF-01/02 พิสูจน์ได้เฉพาะความสอดคล้องกับสูตร/มติ; การปิด gate จริงต้องรอ writer/calculator source หรือ authoritative fixtures ที่เจ้าของรับรอง
2. **G-COEXIST**: legacy-writer simulator ไม่ใช่ writer เดิม; ต้องรอ inventory writers/triggers/functions ของ PGGradeDB จากเจ้าของ; test store ต้องเป็น PostgreSQL engine จริงเพื่อ xmin แท้
3. **G-TARGET**: รูป JSON/ขนาด receipt ที่มี field เกิน synthetic ของ production ต้องเก็บจาก synthetic เท่านั้น; ถ้าจำเป็นต้องอ้างของจริง ใช้เฉพาะ metadata/ผลสรุปภายใต้ขอบเขตที่เจ้าของอนุญาตเดิม
4. **G-AUTHZ**: ความหมาย lock/SubmitPeriod/override ต้องมาจากข้อมูลจริงตามเงื่อนไข gate — synthetic ใน GF-05d ใช้ semantic ตามสัญญา ต้อง confirm กับเจ้าของก่อน runtime
5. **G-DB**: บัญชี DB เดิม + เจ้าของระบบเกรดยอมให้ใช้ + พิสูจน์บนฐานทดสอบ = ประตูมนุษย์; GF-06 จำลองบน test DB ไม่ปิด G-DB; "SchoolBot API ไม่มี PG secret" ตรวจด้วย static config review ประกอบ
6. Runtime prerequisites ตาม test-plan/index ยังค้าง; ค่าสมมติฐาน (อายุ preview 15 นาที, lease/sweep cadence) ต้องยืนยันก่อนรัน; แก้แผนนี้ก่อนเมื่อสัญญาเปลี่ยน
7. ไม่มี fixture ใดเขียน PGGradeDB/School DB/SchoolBot DB production หรือเรียก service score-record เดิม; preview non-production ไม่ใช่สิทธิ์เปิด confirm/apply


## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · REQ = Requirement หรือข้อกำหนด · DES = Design หรือสัญญาออกแบบ · CAS = Compare-and-Swap



## ยังไม่ยืนยัน

อายุ preview 15 นาที และ outbox lease/sweep cadence ยังเป็นสมมติฐาน ต้องให้ arch/เจ้าของสัญญายืนยันก่อน runtime ให้ระบุค่าสมมติฐานใน expected ของผลรันแต่ละชุด

## หลักฐาน

นิยามงาน TP-003 (memory); source-review-005 เป็นที่มาว่าไม่มี source ของ writer เดิม งานเรียบเรียงนี้ไม่ได้ตรวจ code ซ้ำและไม่ได้รัน fixture ใด
