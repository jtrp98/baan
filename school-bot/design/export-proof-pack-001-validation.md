# SA-004 — โครงชุดหลักฐาน export contract — Gate evidence เดิมทั้งห้า

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [SA-004 — โครงชุดหลักฐาน export contract](export-proof-pack-001.md) ส่วนนี้อธิบายGate evidence เดิมทั้งห้า อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](des-009.md) · [SEC001-002 (การแยก credential ของ PGGradeDB ออกจาก API)](credential-matrix-001.md)

## Gate evidence เดิมทั้งห้า

| Gate | Artifact ที่ยังต้องได้ | เงื่อนไขก่อนกล่าวว่าผ่าน |
|---|---|---|
| G-PARITY | writer/calculator source หรือ authoritative fixtures ที่เจ้าของรับรอง; golden before/after | เทียบระบบเดิม 100% ตาม DES-009 รวมผลพิเศษ/ปัดเศษ/derived fields; reader อย่างเดียวไม่พิสูจน์ writer |
| G-COEXIST | inventory writers/triggers/functions, race fixtures | xmin + before_document_hash/CAS และ operation lock กันชนจริง; ไม่อ้าง UpdateDate ของ SchoolBot ไปแทน xmin ของ PGGradeDB |
| G-TARGET | ScoreData/identifier/row cardinality/receipt shape + ขนาดจาก synthetic fixtures; ถ้าอ้างขนาดจริง ใช้ผลสรุปที่ผ่านการตรวจข้อมูลก่อนนำเข้า knowledge | ปลายทางมีอยู่และไม่กำกวม; ไม่สร้าง zero row/ช่องคะแนนโดยอัตโนมัติ; receipt เก็บได้ครบ |
| G-AUTHZ | สิทธิ์/roster/period/SubmitPeriod/override matrix จากเจ้าของและ negative tests | ไม่ใช้ SchoolId/ปลายทางจาก client, re-check สิทธิ์/locks ก่อน write; unknown ต้อง block |
| G-DB | account/grants จริงตาม credential matrix, เจ้าของเกรดยอมให้ใช้ + หลักฐานฐานทดสอบ | บัญชีเดิม UPDATE คะแนน+INSERT PGTGradeAuditLog ใน PG transaction เดียวได้; SchoolBot gRPC service API ไม่มี PG secret; ไม่รัน GRANT ใหม่ |

เงื่อนไข G-DB เรื่อง process boundary เป็น mitigation หลักฐานประกอบ SEC001-002 ไม่ใช่การแก้ gate/dependency ของแผน. Preview non-production ตาม DES-009 ยังไม่เป็นสิทธิ์ให้เปิด confirm/apply. Error เดิม `WRITER_NOT_VERIFIED`, `CALCULATOR_NOT_VERIFIED`, `COEXISTENCE_NOT_VERIFIED`, `GRADE_SOURCE_UNAVAILABLE`, `RECEIPT_UNAVAILABLE` และ `PREVIEW_STALE`/`VERSION_CONFLICT` ต้องมี expected/actual ที่ client boundary ผ่าน HTTP API Gateway

## Recovery proof ลำดับขั้นต่ำ

1. หยุดก่อน SchoolBot confirm commit → ไม่มี export/outbox ครึ่งชุด
2. confirm สำเร็จแต่ response หาย → key เดิมได้ export เดิม
3. worker fail ก่อน PG commit → ไม่มีคะแนน/receipt ค้างครึ่งคู่
4. PG commit แล้วขาด SchoolBot ack → unknown/reconciling อ่าน receipt เดิม ไม่ apply ซ้ำ
5. บางรายการ applied/บางรายการข้ามหรือชน → คง applied, re-preview เฉพาะส่วนที่อนุญาต ไม่เปลี่ยน mapping ที่ล็อก
6. ถอนสิทธิ์/License/ปลายทางล็อกระหว่างรอ → block ส่วนที่ยังไม่เขียน; ไม่ rollback คะแนนที่ลงแล้วโดยเดา

เลือก reuse contract/outbox/receipt เดิม ไม่เพิ่ม export queue/table/gate ใหม่; ปัดตก happy-path-only และทดสอบ mock อย่างเดียวเพื่อรับรอง cross-DB/legacy coexistence. ให้ผู้คุมส่ง sys/vault/inspect/jpo ตามคิวเดิม; คนลงนามเมื่อมีหลักฐานจริง งานนี้ไม่เรียก role ต่อเองหรือรัน SQL

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.
