# SA-004 — โครงชุดหลักฐาน export contract — Rev2

ใช้ [DES-008](des-008.md), [DES-009](des-009.md), [DES-012](des-012.md), [กฎคะแนน](grade-rules-032-034.md), [credential matrix](credential-matrix-001.md) และ [custody](signing-custody-001.md). สถานะอยู่ที่ [index](index.md); เป็น outline ไม่ใช่ผลรับรอง SA-004 หรือ gate closure

## ชุดหลักฐานที่ต้องจัด

แต่ละรายการแนบ revision/hash ของ source/contract, environment ที่ได้รับอนุญาต, **synthetic fixtures เป็นหลัก** (ข้อมูลสมมติที่สร้างขึ้นเพื่อทดสอบ ไม่คัดลอกข้อมูลบุคคล/credential จริง), criterion/AC, วิธีตรวจ, expected, actual, evidence path และข้อจำกัด. ระบุที่มา/version ของ fixtures และกรณีที่ครอบคลุม; คำว่า “ปิดบังข้อมูลแล้ว” เพียงอย่างเดียวไม่พอ หากหลักฐานสิทธิ์/config/พฤติกรรม legacy ต้องอ้างของจริง ให้ใช้เฉพาะ metadata/ผลสรุปที่จำเป็นภายใต้ขอบเขตที่เจ้าของอนุญาตเดิมและบันทึกข้อจำกัด. ช่อง actual/evidence runtime ยังไม่จัดทำในใบงาน060a; ห้ามเติม PASS จากการมีเอกสาร

**ตรวจทุก artifact ก่อนนำเข้า knowledge:** ครอบคลุม JSON ทุกระดับ/unknown fields, screenshots รวมข้อความและข้อมูลรอบภาพ, receipt, logs รวม error/stack trace และ before/after documents ทั้งฉบับรวม diff. ตรวจว่าไม่มีข้อมูลบุคคลจริงที่ระบุโดยตรงหรือเชื่อมกลับได้ นอก metadata ผู้รับผิดชอบ/identity ที่จำเป็นตาม matrix และขอบเขตที่อนุญาตเดิม; ห้ามมี password/hash/token/private key/connection string หรือ secret อื่น และตรวจ metadata/ชื่อไฟล์/URL ที่ติดมาด้วย. ใช้ synthetic identifiers ให้สอดคล้องกันตลอดชุดเพื่อคงความหมายของ join/receipt/CAS. แนบผู้ตรวจ วันที่ ขอบเขต วิธี/ผลตรวจ และข้อจำกัด โดยไม่แนบค่าที่ตรวจพบ; ถ้าพบข้อมูลนอกขอบเขตต้องแก้หรือสร้างหลักฐานใหม่แล้วตรวจซ้ำก่อนนำเข้า knowledge. การตรวจนี้เป็นเกณฑ์จัดชุดหลักฐาน ไม่ใช่ human gate ใหม่หรือการรับรอง runtime

| ชุด / เจ้าของเตรียม | Coverage เดิม | Expected ที่ต้องพิสูจน์ |
|---|---|---|
| Mapping / sys + inspect | AC-049-01..05 | admin เท่านั้น, ช่องเดิม, หนึ่งกิจกรรมหลายช่องแต่ช่องเดียวไม่รับหลายกิจกรรม, context school/term, preview ตรงคู่, mapping ส่งแล้วล็อกไม่หลบด้วย soft-delete/ชุดใหม่ |
| Preview / sys + inspect | AC-050-01..04 | แสดงก่อน/หลัง/source/target, อ่านไม่เขียน, 8/10×20=16 และ 3/4×10=8, missing ข้าม, source/mapping เปลี่ยนต้อง preview ใหม่ |
| Conflict/skip / sys + inspect | AC-051-01..05 | ครูแก้ owned cell ต้องชน, replace/keep รายคน, CAS หลัง resolve, คง override/ผลพิเศษ/unknown JSON, missing คงเดิมแต่คะแนนจริง0ส่งได้ |
| Authorization / sys + legacy owner | AC-052-01..02 | course-teacher∩roster∩term, Channel/License/tenant/locks ตรวจทั้ง preview/confirm/apply, ถอนสิทธิ์กลางทางต้องหยุด; authority ตาม DES-004 ไม่เดา account/profile join |
| Recovery/audit / sys + vault + inspect | AC-052-03..05 | assignment ไม่ increment, retry OperationKey/PayloadHash เดิม, crash หลัง PG commit ก่อน outbox ack ต้อง reconcile receipt, partial แสดงจริงรายคน/ช่อง, audit และ derived totals ตรงระบบเดิม |

## Gate evidence เดิมทั้งห้า

| Gate | Artifact ที่ยังต้องได้ | เงื่อนไขก่อนกล่าวว่าผ่าน |
|---|---|---|
| G-PARITY | writer/calculator source หรือ authoritative fixtures ที่เจ้าของรับรอง; golden before/after | เทียบระบบเดิม 100% ตาม DES-009 รวมผลพิเศษ/ปัดเศษ/derived fields; reader อย่างเดียวไม่พิสูจน์ writer |
| G-COEXIST | inventory writers/triggers/functions, race fixtures | xmin + before_document_hash/CAS และ operation lock กันชนจริง; ไม่อ้าง UpdateDate ของ SchoolBot ไปแทน xmin ของ PGGradeDB |
| G-TARGET | ScoreData/identifier/row cardinality/receipt shape + ขนาดจาก synthetic fixtures; ถ้าอ้างขนาดจริง ใช้ผลสรุปที่ผ่านการตรวจข้อมูลก่อนนำเข้า knowledge | ปลายทางมีอยู่และไม่กำกวม; ไม่สร้าง zero row/ช่องคะแนนโดยอัตโนมัติ; receipt เก็บได้ครบ |
| G-AUTHZ | สิทธิ์/roster/period/SubmitPeriod/override matrix จากเจ้าของและ negative tests | ไม่ใช้ SchoolId/ปลายทางจาก client, re-check สิทธิ์/locks ก่อน write; unknown ต้อง block |
| G-DB | account/grants จริงตาม credential matrix, เจ้าของเกรดยอมให้ใช้ + หลักฐานฐานทดสอบ | บัญชีเดิม UPDATE คะแนน+INSERT PGTGradeAuditLog ใน PG transaction เดียวได้; B API ไม่มี PG secret; ไม่รัน GRANT ใหม่ |

เงื่อนไข G-DB เรื่อง process boundary เป็น mitigation หลักฐานประกอบ SEC001-002 ไม่ใช่การแก้ gate/dependency ของแผน. Preview non-production ตาม DES-009 ยังไม่เป็นสิทธิ์ให้เปิด confirm/apply. Error เดิม `WRITER_NOT_VERIFIED`, `CALCULATOR_NOT_VERIFIED`, `COEXISTENCE_NOT_VERIFIED`, `GRADE_SOURCE_UNAVAILABLE`, `RECEIPT_UNAVAILABLE` และ `PREVIEW_STALE`/`VERSION_CONFLICT` ต้องมี expected/actual ที่ client boundary ผ่าน G

## Recovery proof ลำดับขั้นต่ำ

1. หยุดก่อน SchoolBot confirm commit → ไม่มี export/outbox ครึ่งชุด
2. confirm สำเร็จแต่ response หาย → key เดิมได้ export เดิม
3. worker fail ก่อน PG commit → ไม่มีคะแนน/receipt ค้างครึ่งคู่
4. PG commit แล้วขาด SchoolBot ack → unknown/reconciling อ่าน receipt เดิม ไม่ apply ซ้ำ
5. บางรายการ applied/บางรายการข้ามหรือชน → คง applied, re-preview เฉพาะส่วนที่อนุญาต ไม่เปลี่ยน mapping ที่ล็อก
6. ถอนสิทธิ์/License/ปลายทางล็อกระหว่างรอ → block ส่วนที่ยังไม่เขียน; ไม่ rollback คะแนนที่ลงแล้วโดยเดา

เลือก reuse contract/outbox/receipt เดิม ไม่เพิ่ม export queue/table/gate ใหม่; ปัดตก happy-path-only และทดสอบ mock อย่างเดียวเพื่อรับรอง cross-DB/legacy coexistence. ให้ผู้คุมส่ง sys/vault/inspect/jpo ตามคิวเดิม; คนลงนามเมื่อมีหลักฐานจริง งานนี้ไม่เรียก role ต่อเองหรือรัน SQL

## Change Log
- 2026-10-24 — Rev2: ใบงาน060g ตาม jpo060f ข้อ 3 ใช้ synthetic fixtures เป็นหลักและตรวจ JSON/screenshots/receipt/logs/before-after documents ก่อนเข้า knowledge; คงสัญญาและ task/gates เดิม
- 2026-10-24 — Rev1: ใบงาน060a เตรียม outline SA-004 ครบ 19 AC เดิมและห้า gate พร้อมช่องหลักฐานที่ยังขาด
