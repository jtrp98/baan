# TP-001 — ข้อสอบและการส่งคะแนน (TP001-072–TP001-075)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-072"></a>

## TP001-072 — ออกจาก preview ไม่ยืนยัน

AC: [AC-050-02 (ก่อนยืนยันหรือเมื่อออกจาก preview โดยไม่ยืนยัน คะแนนปลายทางไม่เปลี่ยน)](../requirement/req-050.md), [AC-051-01 (ครูแก้ช่อง SchoolBot หลังส่งรอบก่อนแล้วส่งอีกครั้ง…)](../requirement/req-051.md), [AC-051-02 (เลือกทับนักเรียน A และคงค่า B แล้วยืนยันอีกครั้ง A ได้ค่าที่เสนอ B คงค่าครู)](../requirement/req-051.md), [AC-051-03 (แก้ปลายทางหลัง preview หรือหลังเลือกแก้ชนแล้ว ระบบหยุดให้ตรวจใหม่…)](../requirement/req-051.md) · References: [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](../design/des-009.md), grade-rules-032-034, BR-051 · Level: integration · Profiles: PF-GRADE, PF-WEB

เงื่อนไขก่อนตรวจ: PGGradeDB sanitized; ช่อง SchoolBot ถูกครูแก้หลังส่งรอบก่อน; ปลายทางแก้หลัง preview/หลังเลือกแก้ชน; A,B ชน

ขั้นตอน: ออกจาก preview ไม่ยืนยัน; ส่งใหม่; เลือกทับ A คง B; แก้ปลายทางระหว่างขั้นตอน

ผลที่คาด: ก่อนยืนยัน/ออกจาก preview ปลายทางไม่เปลี่ยน (hash ก่อน/หลัง); หยุดแสดงรายการชนก่อนเปลี่ยนคะแนน; A=ค่าที่เสนอ B=ค่าครู; แก้ปลายทางอีก→หยุดตรวจใหม่ ไม่เขียนทับเงียบ (CAS/recheck) fixtures ใช้ร่วม TP-003

หลักฐานที่ต้องเก็บ: E-API+PG before/after

ผลจริง: NOT_RUN

<a id="tp001-073"></a>

## TP001-073 — ส่งคะแนน

AC: [AC-051-04 (ส่งคะแนนในข้อมูลที่มีช่องครู override และผลพิเศษแล้วค่าคุ้มครองคงเดิม…)](../requirement/req-051.md), [AC-051-05 (A ยังไม่มีผลกิจกรรมแต่ช่องเดิมมี 5 ส่งแล้วคง 5 และแสดงข้าม)](../requirement/req-051.md) · References: DES-009, grade-rules-032-034, [BR-051-03 (ห้ามทับช่องที่ครูกรอกเองนอกช่อง SchoolBot, PgtgradeEdit override…)](../requirement/req-051.md), [BR-051-05 (ไม่มีผลประเมินกิจกรรมให้ข้าม คงช่องเดิม ไม่แทน 0)](../requirement/req-051.md) · Level: integration · Profiles: PF-GRADE

เงื่อนไขก่อนตรวจ: ช่องครูกรอกเอง; PgtgradeEdit override; ผลพิเศษ รอผล/ขาดสอบ; A ไม่มีผลช่องเดิม=5; C ผลจริง 0; ทุกคนไม่มีผล; ungraded/error; SOURCE_SCOPE_UNPROVEN

ขั้นตอน: ส่งคะแนน; ส่งภายหลังเมื่อ A มีผล

ผลที่คาด: ค่าคุ้มครองคงเดิม ไม่แทนศูนย์ แม้เลือกทับ; A คง 5 แสดงข้าม (reason code); ผลมาแล้วส่งภายหลังได้; C ส่ง 0 ไม่ข้าม; ทั้งคนข้าม→Outbox skipped ไม่เขียน PG ไม่สร้าง receipt; SCOPE_UNPROVEN=blocked แยกจาก missing

หลักฐานที่ต้องเก็บ: E-API+PG diff

ผลจริง: NOT_RUN

<a id="tp001-074"></a>

## TP001-074 — ส่ง

AC: [AC-052-01 (ครูไม่มีสิทธิ์วิชา/ห้อง ข้ามโรงเรียน/เทอม หรือปลายทางล็อก…)](../requirement/req-052.md), [AC-052-02 (สิทธิ์/ล็อกเปลี่ยนหลัง preview แล้วการยืนยันเดิมเขียนคะแนนไม่ได้)](../requirement/req-052.md) · References: DES-009, [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](../design/des-012.md), [BR-052-01 (ตรวจสิทธิ์ครูรายวิชา/ห้อง/โรงเรียน/เทอมและล็อกที่ server ขณะบันทึก)](../requirement/req-052.md) · Level: integration · Profiles: PF-GRADE, PF-WEB

เงื่อนไขก่อนตรวจ: ครูไม่มีสิทธิ์วิชา/ห้อง; ข้ามโรงเรียน/เทอม; ปลายทางล็อก/SubmitPeriod; สิทธิ์/ล็อก/License เปลี่ยนหลัง preview และก่อน worker apply

ขั้นตอน: ส่ง; ยืนยัน preview เดิม

ผลที่คาด: ถูกปฏิเสธ คะแนนไม่เปลี่ยน; การยืนยันเดิมเขียนไม่ได้ (recheck ที่ confirm และ worker); ไม่เชื่อ ID/สิทธิ์จาก client

หลักฐานที่ต้องเก็บ: E-API+PG diff

ผลจริง: NOT_RUN

<a id="tp001-075"></a>

## TP001-075 — ส่งซ้ำ/retry OperationKey เดิม

AC: [AC-052-03 (ส่งรายการเดิมซ้ำรวมกรณีไม่ทราบผลครั้งก่อน คะแนนไม่บวกซ้ำและไม่เกิดผลซ้ำ)](../requirement/req-052.md), [AC-052-04 (เมื่อส่งสำเร็จบางรายการ ระบบแสดงผลจริงแยกรายการ)](../requirement/req-052.md) · References: DES-009, grade-rules-032-034, [BR-052-02 (ส่งซ้ำไม่บวกหรือสร้างผลซ้ำ)](../requirement/req-052.md) · Level: integration · Profiles: PF-GRADE

เงื่อนไขก่อนตรวจ: crash หลัง PG commit ก่อนบันทึก receipt; lost response; partial; payload ต่าง; ซ้อนช่อง+learner

ขั้นตอน: ส่งซ้ำ/retry OperationKey เดิม; resume ส่วนค้าง; reconcile unknown

ผลที่คาด: ไม่บวกซ้ำ ไม่เกิดผลซ้ำ; ซ้อน→EXPORT_IN_PROGRESS; payload ต่าง→IDEMPOTENCY_CONFLICT; partial แสดงผลจริงรายรายการ ส่งต่อเฉพาะค้าง ไม่ซ้ำส่วนสำเร็จ; unknown ต้อง reconcile ไม่ส่งใหม่ทันที (fixtures crash ใช้ร่วม TP-003)

หลักฐานที่ต้องเก็บ: E-API+PG receipt

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · CAS = Compare-and-Swap
