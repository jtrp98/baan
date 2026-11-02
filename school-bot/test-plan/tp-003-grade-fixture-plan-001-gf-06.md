# TP-003 — GF-06 durable receipt/audit + crash ladder (G-DB — จำลองบน test DB)

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้ประกอบ [TP-003 (แผน grade fixtures)](tp-003-grade-fixture-plan-001.md) ภายใต้หลักการและข้อรอระบบจริงเดียวกัน PF-GRADE คือสภาพแวดล้อมฐานคะแนนทดสอบใน [TP-001](tp-001.md#profiles) ทุก actual เป็น NOT_RUN

| id | จุดตรวจ · AC ที่ครอบ | วิธีจำลอง | Expected หลัก |
| --- | --- | --- | --- |
| GF-06a | receipt+audit atomic · [AC-052-03 (ส่งรายการเดิมซ้ำรวมกรณีไม่ทราบผลครั้งก่อน คะแนนไม่บวกซ้ำและไม่เกิดผลซ้ำ)](../requirement/req-052.md)/05 | บน test store: inject fail ระหว่าง UPDATE คะแนนกับ INSERT PgtgradeAuditLog ใน PG transaction เดียว; ตรวจ audit rows หลัง export สำเร็จ | fail→ทั้งคู่ rollback ไม่มีคะแนนโดยไม่มี receipt และไม่มี receipt ปลอม; สำเร็จ→Outbox(applied, ReceiptId/ReceiptHash)+SchoolBotAuditEvent ตามลำดับ; audit ครบ [BR-052-03 (audit อ้างต้นทางและ revision, mapping ที่ใช้, ปลายทาง, เดิม/ใหม่,…)](../requirement/req-052.md) |
| GF-06b1 | crash ก่อน confirm commit · [AC-050-02 (ก่อนยืนยันหรือเมื่อออกจาก preview โดยไม่ยืนยัน คะแนนปลายทางไม่เปลี่ยน)](../requirement/req-050.md), AC-052-03 | inject crash ก่อน SchoolBot DB transaction ของ confirm commit | ไม่มี export/outbox/idempotency ครึ่งชุด; ปลายทางไม่เปลี่ยน; confirm ใหม่ได้ |
| GF-06b2 | confirm commit แล้ว response หาย · AC-052-03 | drop response หลัง durable commit | retry Idempotency-Key เดิม→ได้ export_id เดิม state ล่าสุด ไม่สร้าง export ใหม่ |
| GF-06b3 | worker fail ก่อน PG commit · AC-052-03 | inject worker crash หลัง claim ก่อน PG transaction commit | ไม่มีคะแนน/receipt ค้างครึ่งคู่; outbox คง lease/retry ได้; ไม่ mark applied |
| GF-06b4 | PG commit แล้วขาด SchoolBot ack · AC-052-03/04 | inject crash ระหว่างขั้น 4→5 (หลัง PG commit ก่อนบันทึก ReceiptId) | state=unknown/reconciling; worker อ่าน receipt ใน PgtgradeAuditLog reconcile ลง SchoolBot DB โดยไม่เขียนคะแนนซ้ำ; retry OperationKey/PayloadHash เดิม idempotent; unknown ไม่ใช่ failed ห้ามส่งใหม่ทันที |
| GF-06b5 | partial applied/skipped/conflict · [AC-052-04 (เมื่อส่งสำเร็จบางรายการ ระบบแสดงผลจริงแยกรายการ)](../requirement/req-052.md) | export หลายคน: inject คนหนึ่ง applied, หนึ่ง skipped (missing), หนึ่ง conflict ระหว่างรอบ | คง applied; export=completed_with_skips (เมื่อเหลือแค่ข้าม)/paused_conflict แสดงจริงรายคน/ช่อง (items state+reason_code); ส่งเฉพาะส่วนค้าง=ชุดส่งใหม่: ล็อก outbox เก่า mark blocked/LastErrorCode=SUPERSEDED_BY_PREVIEW + audit อ้าง preview ใหม่ก่อน confirm ใหม่; worker ห้าม claim เก่า; ส่วนสำเร็จไม่ซ้ำ; mapping ที่ล็อกคงเดิม |
| GF-06b6 | ถอนสิทธิ์/License/ปลายทางล็อกระหว่างรอ · [AC-052-02 (สิทธิ์/ล็อกเปลี่ยนหลัง preview แล้วการยืนยันเดิมเขียนคะแนนไม่ได้)](../requirement/req-052.md)/04 | inject ถอนสิทธิ์/License หมด/ปลายทางล็อก หลัง worker claim ก่อนเขียนบางรายการ | block เฉพาะส่วนที่ยังไม่เขียน (blocked+reason); ไม่ rollback คะแนนที่ลงแล้วโดยเดา; re-preview เฉพาะส่วนที่อนุญาตเมื่อเงื่อนไขกลับ |
| GF-06c | idempotency conflict · AC-052-03 | retry OperationKey เดิมด้วย payload ต่าง; key ใหม่ขณะงานเดิมค้าง; retry หลังสำเร็จ | payload ต่าง→409 IDEMPOTENCY_CONFLICT ไม่เปลี่ยน key อัตโนมัติ; key ใหม่ไม่ข้ามงานค้าง (409 EXPORT_IN_PROGRESS); หลังสำเร็จ retry อ่าน receipt ไม่เขียนซ้ำ |

วิธี/ห้ามแตะ: failpoint/crash injection ตามลำดับขั้น 1–6 ของ [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](../design/des-009.md) + recovery ladder 6 ขั้นของ SA-004; test SchoolBot DB + test store เท่านั้น; **บัญชี DB เดิมต่อ PGGradeDB + เจ้าของระบบเกรดยอมให้ใช้ = ประตูมนุษย์** — GF-06 จำลองบนบัญชีทดสอบจึงไม่ถือเป็นการปิด G-DB จริง; ไม่รัน GRANT/สร้าง role ใด ๆ

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ
