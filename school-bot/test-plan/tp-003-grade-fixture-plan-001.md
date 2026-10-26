# TP-003 — แผน grade parity/coexistence/crash fixtures — Rev1

วันที่ 2026-10-24 · รันโดย นายช่าง solo (subagent role inspect) · สถานะเอกสารอยู่ที่ [index](index.md)

อ้างอิง: [TP-003](../plan/TP-003.md) (นิยามงาน), [SA-004 Rev2](../design/export-proof-pack-001.md) (5 gates + synthetic fixtures หลัก), [DES-008 Rev4](../design/des-008.md), [DES-009 Rev4](../design/des-009.md), [กฎ mapping/export Rev1](../design/grade-rules-032-034.md), [REQ-049](../requirement/req-049.md)..[REQ-052](../requirement/req-052.md), [TP-002 fixture plan Rev1](tp-002-fixture-plan-001.md), [transport กลางของ index](index.md). เอกสารนี้เป็น**แผนเตรียมเท่านั้น** (docs-only) ไม่มีการรัน fixture จริง ทุก actual=NOT_RUN ไม่ใช่ QA PASS และไม่ปิด gate ใดของ SA-004

## หลักการกลาง (ต่อ TP-002)

- **synthetic fixtures เป็นหลัก** ตาม SA-004 Rev2: ข้อมูลสมมติทั้งหมด ไม่คัดลอกข้อมูลบุคคล/credential/คะแนนจริง; synthetic identifiers สอดคล้องกันทั้งชุด; ทุก artifact ตรวจก่อนนำเข้า knowledge
- **จำลอง PGGradeDB ด้วย test store**: test PostgreSQL จริงที่สร้าง schema ตารางเดิม (Pgtassessment/PgtgradeDetail/PgtgradeAuditLog ฯลฯ) + synthetic rows เท่านั้น — ต้องเป็น engine จริงเพื่อให้ system column `xmin` เป็นของแท้ ไม่จำลองด้วยคอลัมน์ปลอม; ฝั่ง SchoolBot ใช้ test SchoolBot DB (ไม่ใช่ production 10.0.0.128:9499)
- **legacy-writer simulator**: writer เดิม `sb-service-academic-score-record` ไม่มี source (source-review-005) จึงจำลองด้วย simulator ที่เขียนตามสัญญาเดียวกัน (cells + expectedRowVersions = xmin) ติดป้าย (simulator — ไม่ใช่ writer เดิม); การปิด G-COEXIST จริงยังต้องรอ inventory writers/triggers/functions จากเจ้าของ
- **ไม่ mock เงื่อนไขผลลัพธ์**: expected ของ G-PARITY คำนวณแยกด้วย decimal golden script จากสูตร DES-009/decisions-023/033 แล้วเทียบ output จริงของ pipeline; ห้าม stub calculator/writer; reader อย่างเดียวไม่พิสูจน์ writer
- ค่าสมมติฐาน (อายุ preview 15 นาที, outbox lease/sweep cadence) ติดป้าย (สมมติฐาน — ยังไม่ยืนยัน) ใน expected ของทุก run
- ทุก fixture ระบุ build/commit hash + profile (PF-GRADE) + evidence code (E-DB before/after+audit, E-API, E-TRACE); ผลทุกเคสเริ่ม NOT_RUN

## GF-01 สูตร/ปัด/preview ต่อช่อง (G-PARITY)

| id | จุดตรวจ · AC ที่ครอบ | วิธีจำลอง | Expected หลัก |
| --- | --- | --- | --- |
| GF-01a | สูตร earned/max×target_max ปัด half-up ครั้งเดียวต่อช่อง · AC-050-01/03 | synthetic assessment/attempt/policy fixtures ครอบ 8/10→เต็ม20=16, 3/4→เต็ม10=7.5→8, 3/4→เต็ม12=9, 7.4→7, ขอบ x.5 หลายค่า, earned=0..max, สอบซ่อม max(จริง,ซ่อม) ไม่มีเพดาน (decisions-025/026), quiz ใช้ attempt สูงสุดที่ submit แล้ว (decisions-024) | raw_target=DecimalString ตรง golden decimal ทุกเคส; new_score=integer ตรง half-up; ทุกช่องคำนวณจาก earned/max เดิม ไม่ใช้ผลปัดของอีกช่อง; คำนวณด้วย decimal ไม่ใช่ binary float; รับเฉพาะ 0<=earned<=max, max>0 |
| GF-01b | ขอบปฏิเสธ/missing ≠ 0 · AC-050-01/03, AC-051-05 | synthetic: target_max parse ไม่ได้/<=0; integer_target>target_max; ผล missing/ungraded/error; ผลจริง 0; quiz policy ไม่นับคะแนน; A ไม่มีผลแต่ช่องเดิมมี 5 แล้วมีผลใหม่รอบหลัง | max ผิด→409 TARGET_NOT_READY; เกิน→ปฏิเสธ ไม่ clamp ไม่แปลง passed→100; missing→skipped_cells reason SOURCE_RESULT_MISSING/UNGRADED/ERROR คงค่าเดิม (คง 5) ไม่เสนอ 0; ผลจริง 0 = ready ส่งได้; policy ไม่นับ→ห้ามเป็น source (SOURCE_NOT_SCORABLE/POLICY_NOT_CONFIGURED); มีผลใหม่→preview ใหม่ส่งภายหลังได้; ทั้งคนข้าม→Outbox skipped LastErrorCode=SOURCE_RESULT_MISSING ไม่เขียน PG/ไม่สร้าง receipt ปลอม |
| GF-01c | preview ตรงคู่/อ่านไม่เขียน · AC-049-04, AC-050-01/02 | synthetic CourseRun+mapping หลายวิชาหลายช่อง (Category ต่างกัน) บางคน missing; เรียก POST/GET score-previews ทั้งชุดบน test env | CellPreview ตรงคู่ activity–slot ที่แมพเท่านั้น ไม่เพิ่มช่อง/เดาหมวดจาก Quiz/Test; sources:SourceResultRef แสดง earned/max คู่ target_max/raw_target/new_score; state ready/conflict/blocked; missing อย่างเดียว=ready พร้อม ReasonCodes แม้ cells=[]; old_score/last_exported_score จาก read; PreviewView แสดง export_gates ตามสถานะจริง; ไม่มี PGGradeDB write ใด |
| GF-01d | preview เก่า/ETag เก่าใช้ไม่ได้เมื่อข้อมูลเปลี่ยน · AC-050-04, AC-051-03 | สร้าง preview แล้ว inject เปลี่ยน source result/mapping/policy/roster/target/สิทธิ์/ปลายทาง ก่อน confirm; ส่ง snapshot_hash+If-Match เดิม/ETag เก่า; และ confirm ขณะ gate ค้าง | 409 PREVIEW_STALE หรือ 409 TARGET_CHANGED; If-Match ไม่ตรง→412 VERSION_CONFLICT; ต้อง preview ใหม่; hash ครอบ skipped_cells; ขณะ gate ค้าง confirm→503 CALCULATOR_NOT_VERIFIED/COEXISTENCE_NOT_VERIFIED/WRITER_NOT_VERIFIED/RECEIPT_UNAVAILABLE ตาม gate ที่ค้าง ไม่สร้าง export |

วิธี/ห้ามแตะ (ทุก fixture ในกลุ่ม): fake curriculum/assessment reader + test SchoolBot DB + synthetic fixtures; golden script แยกจาก pipeline; ห้ามเชื่อม/เขียน PGGradeDB จริง · ห้ามอ่าน/เขียน School DB จริง · ห้ามเรียก service score-record เดิม · ห้าม stub calculator

## GF-02 derived totals/เกรด parity 100% + assignment semantics (G-PARITY)

| id | จุดตรวจ · AC ที่ครอบ | วิธีจำลอง | Expected หลัก |
| --- | --- | --- | --- |
| GF-02a | เกรด/ผลรวมตรงกฎเดิม · AC-051-04, AC-052-04/05 | synthetic PgtgradeDetail rows บน test store ก่อน/หลังรัน writer path จริงของ SchoolBot แล้วคำนวณ derived totals/เกรด (GetScore100/ค่ารวมตาม DES-009) เทียบ golden before/after ที่คำนวณด้วยสูตรเดิม | เทียบตรง 100% ทุก cell รวมปัดเศษ/ผลพิเศษ/derived fields; รักษา override/PgtgradeEdit/ผลพิเศษ (ไม่แทนด้วยศูนย์); ช่องอื่นนอก mapping คงเดิม; before/after document hashes ตรง snapshot |
| GF-02b | assignment ไม่ใช่ increment · AC-052-03/04 | run export สองรอบด้วยผลเดิม/ผลใหม่ทับช่องเดิมที่มีค่าเดิมและค่าครูแก้ระหว่างรอบ | รอบสองได้ค่า assignment ใหม่ ไม่บวกซ้ำ ไม่สร้างผลซ้ำ; ไม่ส่งผลรวม SchoolBot ไปแทน GetScore100; ไม่เรียก submit/close-grade เป็นผลข้างเคียง |

วิธี/ห้ามแตะ: writer path จริงบน test store + test SchoolBot DB; เทียบ before/after hash + audit; ห้ามใช้ reader เท่านั้นเป็นหลักฐาน · ห้ามแตะ production PGGradeDB/SchoolBot DB

## GF-03 writer race/xmin CAS/advisory lock (G-COEXIST)

| id | จุดตรวจ · AC ที่ครอบ | วิธีจำลอง | Expected หลัก |
| --- | --- | --- | --- |
| GF-03a | ครู(writer เดิม)แก้ช่อง SchoolBot หลังรอบก่อน · AC-051-01/03 | legacy-writer simulator UPDATE PgtgradeDetail ระหว่าง preview(จับ xmin)→worker apply; รวม inject delay ให้แก้หลัง snapshot เพียงเสี้ยววินาทีก่อน UPDATE | `SELECT..FOR UPDATE` + `UPDATE..WHERE PK + xmin(snapshot) + before_document_hash` → affected 0 → conflict รายคน rollback คนนั้น คงคนอื่น; export=paused_conflict แสดงรายการชน; ห้ามอ้าง UpdateDate ของ SchoolBot DB แทน xmin ของ PGGradeDB |
| GF-03b | resolve replace/keep **สำเร็จ** (ไม่มีแก้แทรก) · AC-051-02/03 (แยก case ตาม check-061) | หลังพบชน resolve {A:replace_owned, B:keep_destination} → preview ใหม่ → confirm → apply **โดยไม่ inject อะไรระหว่างทาง** | A ได้ค่าที่เสนอเมื่อ CAS ผ่าน (before/after snapshot ยืนยันเฉพาะช่อง A เปลี่ยนเป็นค่าเสนอ) และ B คงค่าครูเดิม (snapshot ยืนยันไม่เปลี่ยน) — พิสูจน์เส้นทางสำเร็จของ replace/keep แยกจากกรณีชนซ้ำ |
| GF-03b2 | resolve แล้วชนซ้ำ/ข้อมูลเปลี่ยนแทรก · AC-051-03 | เช่นเดิมของ GF-03b แต่ inject ปลายทางเปลี่ยนอีกหลัง resolve/preview ใหม่ ก่อน confirm/apply | 409 TARGET_CHANGED/PREVIEW_STALE ตรวจชนใหม่ หยุดก่อนเขียนทับค่าล่าสุดเงียบ; resolve ใช้ได้เฉพาะ conflict ที่ server ตรวจพบ; replace_owned ไม่ override lock/สิทธิ์/ผลพิเศษ/PgtgradeEdit; ครูต้อง confirm preview ใหม่อีกครั้ง |
| GF-03c | create race/ช่องซ้ำ · AC-049-02, AC-049-05 | สอง process พร้อมกัน: สร้าง GradeSlot ช่องเดียวกันแม้ยังไม่มี slot; เพิ่มกิจกรรม B เป็น source ที่สองของช่องที่ A ใช้ (PUT ชุดเดิม); สร้าง mapping ใหม่ B→ช่องของ A (POST); retire/soft-delete แล้วเปิดช่องเดิม | advisory lock คีย์ช่อง canonical + ล็อก CourseRun/GradeSlot/Mapping ตาม PK + อ่านประวัติซ้ำหลัง lock กัน create race ข้าม process; ผ่านรอดเดียว อีกฝ่าย 409; source ที่สอง→409 MAPPING_SOURCE_COUNT_INVALID; B→ช่องของ A ปฏิเสธตาม ux_schoolbot_scoremapping_active/ตระกูล SLOT_ALREADY_OWNED ไม่ประดิษฐ์รหัสใหม่; ux_schoolbot_gradeslot_active_ownership กัน ownership active ซ้ำรวม IsDelete/RetiredAt; retire/soft-delete แล้วเปิดช่องเดิม→409 MAPPING_LOCKED ห้าม hard-delete หลบ |
| GF-03d | outbox lease/serialize/EXPORT_IN_PROGRESS · AC-052-03 | worker สองตัว claim outbox เดียวกัน; ขณะ pending/running/unknown มี operation ใหม่ซ้อนช่อง+learner เดิม; worker recheck ก่อน apply | lease+UpdateDate(clock_timestamp()) เดียวชนะ (CreateBy/UpdateBy=null); serialize ต่อ SchoolId/grade context/learner; ซ้อน→409 EXPORT_IN_PROGRESS reconcile ก่อน; worker recheck source/policy/mapping/สิทธิ์/License/locks ก่อน PG transaction และไม่เติมผลใหม่ลงช่องที่ยืนยันให้ข้าม |
| GF-03d2 | lease boundary ก่อน/ตรง/หลัง LeaseUntil + worker เก่ากลับมา · AC-052-03 (เพิ่มตาม check-061) | fake clock ขับ `LeaseUntil`: (1) claim ที่ LeaseUntil−1s (ยังอยู่ในอายุ) (2) เที่ยงพอดี LeaseUntil (หมดอายุแล้ว) (3) LeaseUntil+1s; และ worker เก่า (W1) กลับมาทำงานต่อหลัง outbox ถูก W2 claim ใหม่แล้ว | ก่อนหมดอายุ: W2 ปฏิเสธ/รอ ผู้ถือ lease = W1 เท่านั้น; ที่/หลังหมดอายุ: W2 claim ได้ + W1 ต้องตรวจ lease ของตนก่อนเขียน — พบไม่ใช่ของตน → หยุด ไม่เขียนคะแนน/receipt ซ้ำ; ทุกกรณีตรวจผู้ถือ lease ปัจจุบัน + receipt ใน audit + คะแนนจริงจาก before/after snapshot — ไม่มีสอง receipt ต่อการ apply หนึ่งครั้ง |

วิธี/ห้ามแตะ: test SchoolBot DB + test PG store (schema เดิม xmin แท้) + legacy-writer simulator + fault injection (delay/failpoint ระหว่าง read→update); ห้ามแตะ PGGradeDB จริงทุกชนิด · ห้ามเรียก sb-service-academic-score-record เดิม · ห้ามรัน SQL กับ production · ห้าม GRANT/สร้าง role

## GF-04 ScoreData/identifier/detail row/receipt shape (G-TARGET)

| id | จุดตรวจ · AC ที่ครอบ | วิธีจำลอง | Expected หลัก |
| --- | --- | --- | --- |
| GF-04a | merge ScoreData JSON exact · AC-051-04, AC-052-04/05 | synthetic detail rows ที่ ScoreData มีหลายช่อง+unknown properties+ลำดับรายการเฉพาะ+ผลพิเศษ; apply แล้ว diff JSON before/after บน test store | เปลี่ยนเฉพาะ Score ของช่อง (AssessmentId+ScoreIdentifier) ที่ ownership ถูกต้องและตรง SchoolBotGradeSlot active; คงรายการอื่น/unknown properties/ลำดับรายการ/ผลพิเศษ/ค่าครู; duplicate/ambiguous→หยุด; row cardinality รายคน/ช่องไม่เพิ่ม; before/after hashes ตรง snapshot |
| GF-04b | identifier resolve จากของจริง ไม่เดา ordinal · AC-049-01/04 | synthetic ที่ ordinal สลับ, NameIdentifier/MaxScoreIdentifier คนละคู่, duplicate identifier สองแถว, ช่องที่ยังไม่มี identifier | resolve จาก ScoreData จริงภายใต้ grade context เท่านั้น พบตรงหนึ่งรายการ; ห้ามเลือก array index ตาม Ordinal ห้าม MAX(id)+1 ห้ามเดาจาก NameIdentifier/ordinal; duplicate/ambiguous→หยุดไม่เลือกเอง; server derive identifier/context ไม่รับค่าที่ client ประกอบ |
| GF-04c | ไม่มีปลายทาง/ไม่สร้าง zero row · AC-049-01, AC-050-01, AC-051-05 | synthetic ที่ไม่มี detail/header/assessment ครบชุด และแถวครบแต่ assessment ถูกปิด/ช่องไม่ active | 409 TARGET_NOT_READY; ไม่สร้าง implicit zero row/ช่องคะแนน/Pgtassessment ใหม่ (สร้างช่องผ่านระบบเกรดเท่านั้น ตาม decisions-033); ค่าเดิมคงเดิม ไม่เสนอ 0 ทับ |
| GF-04d | receipt shape/ขนาด · AC-052-03/05 | หลัง apply บน test store อ่าน PgtgradeAuditLog receipt (Application="SchoolBot", MethodName="ScoreExport.Apply", SEmp=sEmp ครูผู้ยืนยัน) | receipt ผูก OperationKey/PayloadHash/context/learner/cells ที่เขียน/before-after hashes/calculator version/ผู้ยืนยัน ครบ; ขนาด/รูป JSON บันทึกเป็นผลสรุปจาก synthetic; ReceiptId/ReceiptHash กลับมาใน Outbox ใช้ reconcile ได้ |

วิธี/ห้ามแตะ: sanitized synthetic fixtures (ตรวจ JSON/logs/diff ก่อนเข้า knowledge ตาม SA-004 Rev2); test PG store เท่านั้น; ห้ามใช้ ScoreData/identifier/ขนาดจาก PGGradeDB จริง · ห้ามสร้าง Pgtassessment ใน test store นอกจาก restore schema เดิม

## GF-05 สิทธิ์/บริบท/lock/SubmitPeriod/override ฝั่ง server (G-AUTHZ)

| id | จุดตรวจ · AC ที่ครอบ | วิธีจำลอง | Expected หลัก |
| --- | --- | --- | --- |
| GF-05a | course-teacher∩roster∩term + actor · AC-049-01, AC-052-01 | synthetic School DB fixture ต่อยอด FX-05a(TP-002): ครู T สอนวิชา X ห้อง 1 เทอม A; ครูอื่น/วิชาอื่น/ห้องอื่น/เทอมอื่น/โรงอื่น; learner ย้ายออก (history หลายแถว); sEmp==sId ชน; admin โรงอื่น; school_admin พยายาม confirm; ครูพยายามสร้าง/แก้ mapping | เห็น/ส่งได้เฉพาะ course-teacher∩roster∩term ของทุก plan_course ในชุด; อื่น ๆ→403 SUBJECT_PERMISSION_REQUIRED หรือ 404/SCHOOL_MISMATCH; learner_ids นอก roster ปฏิเสธ; ครู (sEmp) ไม่รั่วเป็นผู้เรียน (OwnerKind='student' เท่านั้น); ครูสร้าง/แก้ mapping→403 SCHOOL_ADMIN_REQUIRED; school_admin preview/confirm ไม่ได้ (อ่าน GET score-exports ได้); channel ไม่ใช่ school_web→403 CHANNEL_NOT_ALLOWED; SchoolId/ผู้กระทำจาก session เท่านั้น |
| GF-05b | ถอนสิทธิ์กลางทาง/License/SchoolId จาก client · AC-052-01/02 | inject ถอน TplanCourseTeacher/ยกเลิก SchoolBotLicense/ล็อกปลายทาง ณ 3 จุด (create preview / recheck ก่อน confirm commit / worker ก่อน PG transaction); ส่ง SchoolId/destination IDs ใน body | ทั้ง 3 จุดตรวจจาก School DB/PGGradeDB ผ่าน server เท่านั้นและ re-check ก่อน commit; in-flight ถูกปฏิเสธ คะแนนไม่เปลี่ยน; SchoolId/ปลายทางจาก client ไม่ถูกใช้; authority ตาม DES-012 ไม่เดา account/profile join; ไม่มีข้อมูลสิทธิ์→ปฏิเสธ |
| GF-05c | mapping lock/บริบทข้ามโรงเรียน-เทอม · AC-049-03, AC-049-05, AC-051-01 | mapping ที่ confirm ส่งแล้ว (จุดล็อกถาวร=confirm commit Export/Outbox/confirmed Preview) แล้วพยายาม PUT/retire/soft-delete/hard-delete; ใช้ mapping เดิมกับเทอม/โรงเรียนอื่น; สร้างชุดใหม่ทับช่องล็อก | 409 MAPPING_LOCKED ทุกทางรวม soft-delete/retire หลบล็อก; สลับโรงเรียน/เทอม resolve เป็น NYear/NTerm/ช่องจริงคนละค่า ไม่ใช้ข้ามบริบทอัตโนมัติ; ชุดใหม่ต้องใช้ช่องอื่นที่ไม่ถูกจองหรือบริบทใหม่ที่ resolve เป็นคนละช่องจริง ไม่ใช่ PK/run ใหม่ทับช่องล็อก; คู่/คะแนนที่ส่งแล้วคงเดิม ไม่ย้าย/ล้าง; แอปตรวจประวัติทุก run รวม IsDelete/RetiredAt และ pending/partial/failed/unknown/skipped ก่อน confirm |
| GF-05d | SubmitPeriod/ผลพิเศษ/override/PgtgradeEdit · AC-051-04, AC-052-01 | synthetic ปลายทาง: SubmitPeriod ปิด/หมด, special_result != none (รอผล/ขาดสอบ), มี PgtgradeEdit แถวที่เกี่ยว, ช่องครูกรอกเองนอก ownership; รวมพยายาม resolve replace_owned ทับ | block นักเรียนคนนั้น (blocked แยกจาก missing) ไม่ใช่ skip เงียบ; ห้าม clear override/แปลงผลพิเศษเป็นศูนย์/ทับช่องครูนอก ownership; CellPreview แสดง special_result/has_grade_edit; replace_owned ไม่ข้ามข้อห้าม; คะแนนไม่เปลี่ยน |

วิธี/ห้ามแตะ: stub School DB fixture (SQL sanitized + hash แนบทุก run) + synthetic ปลายทางบน test store; สิทธิ์ไม่ยกจาก client/cType; ห้ามแตะ School DB/PGGradeDB จริง · ห้ามใช้บัญชีจริง spoof; ความหมาย SubmitPeriod/lock จริงต้อง confirm กับเจ้าของก่อน runtime (ข้อจำกัด)

## GF-06 durable receipt/audit + crash ladder (G-DB — จำลองบน test DB)

| id | จุดตรวจ · AC ที่ครอบ | วิธีจำลอง | Expected หลัก |
| --- | --- | --- | --- |
| GF-06a | receipt+audit atomic · AC-052-03/05 | บน test store: inject fail ระหว่าง UPDATE คะแนนกับ INSERT PgtgradeAuditLog ใน PG transaction เดียว; ตรวจ audit rows หลัง export สำเร็จ | fail→ทั้งคู่ rollback ไม่มีคะแนนโดยไม่มี receipt และไม่มี receipt ปลอม; สำเร็จ→Outbox(applied, ReceiptId/ReceiptHash)+SchoolBotAuditEvent ตามลำดับ; audit ครบ BR-052-03 |
| GF-06b1 | crash ก่อน confirm commit · AC-050-02, AC-052-03 | inject crash ก่อน SchoolBot DB transaction ของ confirm commit | ไม่มี export/outbox/idempotency ครึ่งชุด; ปลายทางไม่เปลี่ยน; confirm ใหม่ได้ |
| GF-06b2 | confirm commit แล้ว response หาย · AC-052-03 | drop response หลัง durable commit | retry Idempotency-Key เดิม→ได้ export_id เดิม state ล่าสุด ไม่สร้าง export ใหม่ |
| GF-06b3 | worker fail ก่อน PG commit · AC-052-03 | inject worker crash หลัง claim ก่อน PG transaction commit | ไม่มีคะแนน/receipt ค้างครึ่งคู่; outbox คง lease/retry ได้; ไม่ mark applied |
| GF-06b4 | PG commit แล้วขาด SchoolBot ack · AC-052-03/04 | inject crash ระหว่างขั้น 4→5 (หลัง PG commit ก่อนบันทึก ReceiptId) | state=unknown/reconciling; worker อ่าน receipt ใน PgtgradeAuditLog reconcile ลง SchoolBot DB โดยไม่เขียนคะแนนซ้ำ; retry OperationKey/PayloadHash เดิม idempotent; unknown ไม่ใช่ failed ห้ามส่งใหม่ทันที |
| GF-06b5 | partial applied/skipped/conflict · AC-052-04 | export หลายคน: inject คนหนึ่ง applied, หนึ่ง skipped (missing), หนึ่ง conflict ระหว่างรอบ | คง applied; export=completed_with_skips (เมื่อเหลือแค่ข้าม)/paused_conflict แสดงจริงรายคน/ช่อง (items state+reason_code); ส่งเฉพาะส่วนค้าง=ชุดส่งใหม่: ล็อก outbox เก่า mark blocked/LastErrorCode=SUPERSEDED_BY_PREVIEW + audit อ้าง preview ใหม่ก่อน confirm ใหม่; worker ห้าม claim เก่า; ส่วนสำเร็จไม่ซ้ำ; mapping ที่ล็อกคงเดิม |
| GF-06b6 | ถอนสิทธิ์/License/ปลายทางล็อกระหว่างรอ · AC-052-02/04 | inject ถอนสิทธิ์/License หมด/ปลายทางล็อก หลัง worker claim ก่อนเขียนบางรายการ | block เฉพาะส่วนที่ยังไม่เขียน (blocked+reason); ไม่ rollback คะแนนที่ลงแล้วโดยเดา; re-preview เฉพาะส่วนที่อนุญาตเมื่อเงื่อนไขกลับ |
| GF-06c | idempotency conflict · AC-052-03 | retry OperationKey เดิมด้วย payload ต่าง; key ใหม่ขณะงานเดิมค้าง; retry หลังสำเร็จ | payload ต่าง→409 IDEMPOTENCY_CONFLICT ไม่เปลี่ยน key อัตโนมัติ; key ใหม่ไม่ข้ามงานค้าง (409 EXPORT_IN_PROGRESS); หลังสำเร็จ retry อ่าน receipt ไม่เขียนซ้ำ |

วิธี/ห้ามแตะ: failpoint/crash injection ตามลำดับขั้น 1–6 ของ DES-009 + recovery ladder 6 ขั้นของ SA-004; test SchoolBot DB + test store เท่านั้น; **บัญชี DB เดิมต่อ PGGradeDB + เจ้าของระบบเกรดยอมให้ใช้ = ประตูมนุษย์** — GF-06 จำลองบนบัญชีทดสอบจึงไม่ถือเป็นการปิด G-DB จริง; ไม่รัน GRANT/สร้าง role ใด ๆ

## Coverage table (AC → fixtures)

| AC | Fixtures |
| --- | --- |
| AC-049-01 | GF-04b, GF-04c, GF-05a |
| AC-049-02 | GF-03c |
| AC-049-03 | GF-05c |
| AC-049-04 | GF-01c, GF-04b |
| AC-049-05 | GF-03c, GF-05c |
| AC-050-01 | GF-01a, GF-01b, GF-01c, GF-04c |
| AC-050-02 | GF-01c, GF-06b1 |
| AC-050-03 | GF-01a, GF-01b |
| AC-050-04 | GF-01d |
| AC-051-01 | GF-03a, GF-05c |
| AC-051-02 | GF-03b, GF-03b2 |
| AC-051-03 | GF-01d, GF-03a, GF-03b, GF-03b2 |
| AC-051-04 | GF-02a, GF-04a, GF-05d |
| AC-051-05 | GF-01b, GF-04c |
| AC-052-01 | GF-05a, GF-05b, GF-05d |
| AC-052-02 | GF-05b, GF-06b6 |
| AC-052-03 | GF-02b, GF-03d, GF-03d2, GF-04d, GF-06a, GF-06b1, GF-06b2, GF-06b3, GF-06b4, GF-06c |
| AC-052-04 | GF-02a, GF-02b, GF-03a, GF-04a, GF-06b4, GF-06b5, GF-06b6 |
| AC-052-05 | GF-02a, GF-04a, GF-04d, GF-06a |

ทุก actual=NOT_RUN — ตารางนี้เป็นการวางแผน coverage ไม่ใช่ผลตรวจรับ

## ข้อจำกัด — สิ่งที่ต้องรอของจริงก่อน runtime

1. **G-PARITY "เทียบระบบเดิม 100%"**: synthetic golden ของ GF-01/02 พิสูจน์ได้เฉพาะความสอดคล้องกับสูตร/มติ; การปิด gate จริงต้องรอ writer/calculator source หรือ authoritative fixtures ที่เจ้าของรับรอง
2. **G-COEXIST**: legacy-writer simulator ไม่ใช่ writer เดิม; ต้องรอ inventory writers/triggers/functions ของ PGGradeDB จากเจ้าของ; test store ต้องเป็น PostgreSQL engine จริงเพื่อ xmin แท้
3. **G-TARGET**: รูป JSON/ขนาด receipt ที่มี field เกิน synthetic ของ production ต้องเก็บจาก synthetic เท่านั้น; ถ้าจำเป็นต้องอ้างของจริง ใช้เฉพาะ metadata/ผลสรุปภายใต้ขอบเขตที่เจ้าของอนุญาตเดิม
4. **G-AUTHZ**: ความหมาย lock/SubmitPeriod/override ต้องมาจากข้อมูลจริงตามเงื่อนไข gate — synthetic ใน GF-05d ใช้ semantic ตามสัญญา ต้อง confirm กับเจ้าของก่อน runtime
5. **G-DB**: บัญชี DB เดิม + เจ้าของระบบเกรดยอมให้ใช้ + พิสูจน์บนฐานทดสอบ = ประตูมนุษย์; GF-06 จำลองบน test DB ไม่ปิด G-DB; "B API ไม่มี PG secret" ตรวจด้วย static config review ประกอบ
6. Runtime prerequisites ตาม test-plan/index ยังค้าง; ค่าสมมติฐาน (อายุ preview 15 นาที, lease/sweep cadence) ต้องยืนยันก่อนรัน; แก้แผนนี้ก่อนเมื่อสัญญาเปลี่ยน
7. ไม่มี fixture ใดเขียน PGGradeDB/School DB/SchoolBot DB production หรือเรียก service score-record เดิม; preview non-production ไม่ใช่สิทธิ์เปิด confirm/apply

## Change Log

- 2026-10-24 — แก้ตาม check-061-verify: เพิ่ม GF-03d2 (lease boundary ก่อน/ตรง/หลัง LeaseUntil + worker เก่ากลับมา) และแยก GF-03b เป็น case สำเร็จล้วน + case ชนซ้ำ; อัปเดต coverage
- 2026-10-24 — Rev1: สร้างแผน grade parity/coexistence/crash fixtures (GF-01..06) แยกตาม 5 gate ของ SA-004 Rev2 ครอบ AC-049..052 พร้อม coverage table และข้อจำกัดรอของจริง; docs-only read-only ทุก actual=NOT_RUN — รันโดย นายช่าง solo (subagent role inspect)
