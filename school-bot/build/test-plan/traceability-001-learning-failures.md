# Traceability — atomic failure และผู้รอ ของหลักสูตรกลาง

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (รายละเอียด TP001-087 แบบรันตามได้)

เอกสารนี้เป็นส่วนของ [TP001-087](tp-001-cases-learning-3.md#tp001-087) ระดับ integration บน stub ครอบ AC-043-01 (mutation ส่วนกลาง), AC-044-03 (publish/audit หลักฐาน), AC-044-05 (revision ไม่ซ้ำ) ต้องใช้ [setup ร่วมและตาราง mutation](traceability-001-learning-idempotency.md#setup) ผลจริงยัง NOT_RUN

<a id="tp001-087-detail"></a>

เงื่อนไขก่อนตรวจ: setup ร่วม ทำครบสี่ operations แยก fixture ต่อจุด inject; UUID/body เดิม; baseline หลัง setup ก่อน mutation อ่านผลจาก adapter ใหม่ตามชนิด store

| จุด inject / ขั้นตอน | ผลที่คาด response + persisted state |
|---|---|
| throw ระหว่าง encode result และก่อน file replace/memory swap หลัง mutate candidate | คำขอล้มเหลว ไม่คืน success; revision/children/audit/ledger เท่า baseline ทั้งสามส่วนไม่หลุดบางส่วน retry requestKey เดิมโดยถอด fault สำเร็จหนึ่งครั้ง ส่วนเพิ่มตามตารางร่วม |
| commit replace/swap สำเร็จแล้วทำ response สูญหายก่อนถึงผู้เรียก; ทิ้ง service/adapter และเปิดใหม่ retry requestKey เดิม | ผู้เรียกแรกไม่มี response; retry คืน success เดิม ID/ETag เดิม ส่วนเพิ่มเท่าหนึ่ง success มี ledger กู้ผลได้จาก store ไม่พึ่ง static dictionary |
| พักคำขอแรกใต้ lock ก่อน replace/swap; คำขอสองถึง store แล้วรอ ยกเลิก CancellationToken เฉพาะผู้รอ จากนั้นปล่อยแรก | ผู้รอถูกยกเลิก ไม่คืน success; แรกสำเร็จ ส่วนเพิ่มเท่าหนึ่ง success retry เดิมภายหลัง replay ไม่มีเพิ่ม ผู้รอไม่ยกเลิก/ลบ ledger ของแรก |
| หลัง success ล็อก store ด้วย fixture barrier; retry รออยู่ แล้วถอน role หรือเลื่อน clock ให้ session หมดอายุก่อนปล่อย lock | retry ได้ error สิทธิ์ 403/401 ตามกรณี ไม่เปิดผลเดิม ตรวจ clock/สิทธิ์สดเมื่อได้ lock; snapshot เท่าหลัง success แรก |
| หลัง success ใช้ clock ที่ ReplayUntil−1 tick, เท่ากับ ReplayUntil, และมากกว่า; แยก body เดิม/ต่าง | ก่อนหมดอายุ replay ได้; now≥ReplayUntil body เดิมได้ 409 IDEMPOTENCY_EXPIRED, body ต่างได้ 409 IDEMPOTENCY_CONFLICT; ไม่ mutate/เพิ่ม audit/ledger/ต่ออายุ คง tuple/hash/ResourceId และ tombstone แม้ยังไม่ purge |

ขอบเขตพิสูจน์: deterministic fault ของ stub ใน process เดียว; memory ไม่พิสูจน์ process restart; file replace fault ไม่พิสูจน์ power-loss/OS lock หลาย process PostgreSQL rollback/response loss/expiry และ tuple lock ข้ามสอง process/shared DB รอ DBA-003/G-CORE; custody/retention จริงยังไม่รับรอง ไม่ purge เอง

หลักฐานที่ต้องเก็บ: จุด inject/barrier/clock และ response พร้อม state ทั้งสามส่วนก่อน/หลัง · ผลจริง: NOT_RUN


## หลักฐาน

- [idempotency Rev1 (scope/lock/atomic commit)](../design/idempotency-001.md), [cross-database Rev1 (ขอบเขต stub/ประตูจริง)](../design/data-contract-rules-cross-database.md)
- normal-095/snapshot-rw1-027/check/round-095-be027-rw1.md finding 3/4 (reports): ใช้วาง regression ไม่มีการรันใหม่
