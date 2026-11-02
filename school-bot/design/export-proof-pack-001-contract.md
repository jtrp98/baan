# SA-004 — โครงชุดหลักฐาน export contract — ชุดหลักฐานที่ต้องจัด

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [SA-004 — โครงชุดหลักฐาน export contract](export-proof-pack-001.md) ส่วนนี้อธิบายชุดหลักฐานที่ต้องจัด อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[DES-008 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](des-008.md) · [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](des-009.md) · [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md) · [SA-004 (งานเตรียมหลักฐานความปลอดภัยและ export)](export-proof-pack-001.md) · [AC-049-01 (admin เห็นโรงเรียน/เทอม คาบ/กิจกรรม/ตัวชี้วัด วิชา/ช่องเดิม; สร้างช่องใหม่ไม่ได้ ครูสร้าง/แก้ mapping ไม่ได้)](../requirement/req-049.md) · [AC-050-01 (preview ตรวจค่าเดิม/ใหม่และปลายทางตาม BR-050-02/03 ได้; คนไม่มีผลแสดงข้าม ไม่เสนอ 0 ทับค่าเดิม)](../requirement/req-050.md) · [AC-051-01 (ครูแก้ช่อง SchoolBot หลังส่งรอบก่อนแล้วส่งอีกครั้ง ระบบหยุดและแสดงรายการชนก่อนเปลี่ยนคะแนน)](../requirement/req-051.md) · [AC-052-01 (ครูไม่มีสิทธิ์วิชา/ห้อง ข้ามโรงเรียน/เทอม หรือปลายทางล็อก ส่งแล้วถูกปฏิเสธและคะแนนไม่เปลี่ยน)](../requirement/req-052.md) · [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md) · [AC-052-03 (ส่งรายการเดิมซ้ำรวมกรณีไม่ทราบผลครั้งก่อน คะแนนไม่บวกซ้ำและไม่เกิดผลซ้ำ)](../requirement/req-052.md)

ใช้ [DES-008](des-008.md), [DES-009](des-009.md), [DES-012](des-012.md), [กฎคะแนน](grade-rules-032-034.md), [credential matrix](credential-matrix-001.md) และ [custody](signing-custody-001.md). สถานะอยู่ที่ [index](index.md); เป็น outline ไม่ใช่ผลรับรอง SA-004 หรือ gate closure

## ชุดหลักฐานที่ต้องจัด

แต่ละรายการแนบ revision/hash ของ source/contract, environment ที่ได้รับอนุญาต, **synthetic fixtures เป็นหลัก** (ข้อมูลสมมติที่สร้างขึ้นเพื่อทดสอบ ไม่คัดลอกข้อมูลบุคคล/credential จริง), criterion/AC, วิธีตรวจ, expected, actual, evidence path และข้อจำกัด. ระบุที่มา/version ของ fixtures และกรณีที่ครอบคลุม; คำว่า “ปิดบังข้อมูลแล้ว” เพียงอย่างเดียวไม่พอ หากหลักฐานสิทธิ์/config/พฤติกรรม legacy ต้องอ้างของจริง ให้ใช้เฉพาะ metadata/ผลสรุปที่จำเป็นภายใต้ขอบเขตที่เจ้าของอนุญาตเดิมและบันทึกข้อจำกัด. ช่อง actual/evidence runtime ยังไม่จัดทำในงานเดิม 060a; ห้ามเติม PASS จากการมีเอกสาร

**ตรวจทุก artifact ก่อนนำเข้า knowledge:** ครอบคลุม JSON ทุกระดับ/unknown fields, screenshots รวมข้อความและข้อมูลรอบภาพ, receipt, logs รวม error/stack trace และ before/after documents ทั้งฉบับรวม diff. ตรวจว่าไม่มีข้อมูลบุคคลจริงที่ระบุโดยตรงหรือเชื่อมกลับได้ นอก metadata ผู้รับผิดชอบ/identity ที่จำเป็นตาม matrix และขอบเขตที่อนุญาตเดิม; ห้ามมี password/hash/token/private key/connection string หรือ secret อื่น และตรวจ metadata/ชื่อไฟล์/URL ที่ติดมาด้วย. ใช้ synthetic identifiers ให้สอดคล้องกันตลอดชุดเพื่อคงความหมายของ join/receipt/CAS. แนบผู้ตรวจ วันที่ ขอบเขต วิธี/ผลตรวจ และข้อจำกัด โดยไม่แนบค่าที่ตรวจพบ; ถ้าพบข้อมูลนอกขอบเขตต้องแก้หรือสร้างหลักฐานใหม่แล้วตรวจซ้ำก่อนนำเข้า knowledge. การตรวจนี้เป็นเกณฑ์จัดชุดหลักฐาน ไม่ใช่ human gate ใหม่หรือการรับรอง runtime

| ชุด / เจ้าของเตรียม | Coverage เดิม | Expected ที่ต้องพิสูจน์ |
|---|---|---|
| Mapping / sys + inspect | AC-049-01..05 | admin เท่านั้น, ช่องเดิม, หนึ่งกิจกรรมหลายช่องแต่ช่องเดียวไม่รับหลายกิจกรรม, context school/term, preview ตรงคู่, mapping ส่งแล้วล็อกไม่หลบด้วย soft-delete/ชุดใหม่ |
| Preview / sys + inspect | AC-050-01..04 | แสดงก่อน/หลัง/source/target, อ่านไม่เขียน, 8/10×20=16 และ 3/4×10=8, missing ข้าม, source/mapping เปลี่ยนต้อง preview ใหม่ |
| Conflict/skip / sys + inspect | AC-051-01..05 | ครูแก้ owned cell ต้องชน, replace/keep รายคน, CAS หลัง resolve, คง override/ผลพิเศษ/unknown JSON, missing คงเดิมแต่คะแนนจริง0ส่งได้ |
| Authorization / sys + legacy owner | AC-052-01..02 | course-teacher∩roster∩term, Channel/License/tenant/locks ตรวจทั้ง preview/confirm/apply, ถอนสิทธิ์กลางทางต้องหยุด; authority ตาม DES-004 ไม่เดา account/profile join |
| Recovery/audit / sys + vault + inspect | AC-052-03..05 | assignment ไม่ increment, retry OperationKey/PayloadHash เดิม, crash หลัง PG commit ก่อน outbox ack ต้อง reconcile receipt, partial แสดงจริงรายคน/ช่อง, audit และ derived totals ตรงระบบเดิม |
