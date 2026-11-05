# UX-007 — หลักฐานแบบข้อสอบ นโยบายคะแนน และเลื่อน Level

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย int · ขอโดย ผู้ใช้ (ใบงาน 095 — จัดหลักฐานแบบที่อนุมัติแล้ว)

เชื่อมเกณฑ์ตรวจรับ (Acceptance Criteria: AC) ทั้ง 16 ข้อกับแบบที่ผู้ใช้อนุมัติ Q43–Q46 รวมข้อความหมดเวลา วันที่ 2026-10-26 ตามมติ 043 ไม่มีแบบหรือข้อความใหม่รอเซ็น

## ฐานอนุมัติ

- [flow: ลำดับข้อสอบ](int-007-attempt-policy-flow.md)
- [กู้ผล: unknown และหมดเวลา](int-007-recovery-a11y.md)
- [เว็บครู: เวลา ซ่อม น้ำหนัก](../../../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-007-teacher-score-timing-weights.md) T1/T2/S1
- [เลื่อน Level: ผลประเมินและยืนยัน](../../../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-007-teacher-score-promotion.md) L1/A1
- [Sign-off Q43–Q46](int-007-attempt-policy.md): ผู้ใช้ / 2026-10-26 ครบทุกส่วน

ใช้ DES-010 (ข้อสอบและ Attempt) Rev6, DES-011 (เลื่อน Level) Rev7, DES-012 (auth) Rev9 และสัญญาย่อยตาม [เงื่อนไขร่วม](../../../../build/legacy-ux/evidence-ux-preconditions.md)

## ตารางราย AC

**Actual ทุกแถว:** ครบสำหรับการชี้แบบที่อนุมัติและ expected; UI/runtime ยังไม่ได้ทดสอบในงานนี้ คอลัมน์สุดท้ายระบุหลักฐาน implementation ที่ check ต้องรับ ไม่ถือว่าผ่านจากการอ่านแบบ

| AC และความหมาย | หน้าจอ/สถานะอนุมัติ | Expected | ข้อจำกัด/actual ที่ยังขาด |
|---|---|---|---|
| AC-046-01 อ่าน policy | flow ก่อนเริ่ม | แสดงครั้ง เฉลย เวลา สุ่ม และค่าจริงแต่ละ Activity | pre-start/effective policy read-back |
| AC-046-02 ค่าเริ่ม/บังคับจริง | flow; states | Quiz ไม่จำกัด/สูงสุด/ไม่จับเวลา/ไม่สุ่ม/เฉลยหลังส่ง; Test 1 ครั้ง/จับเวลา/สุ่มข้อ/เฉลยหลังปิด | start/save/submit/reveal ตาม snapshot |
| AC-046-03 ประวัติชุดสุ่ม | flow ครั้งเดิม | กลับเข้าคำถาม/ลำดับเดิมจาก server ไม่สุ่มใหม่ | discovery/history/saved answers มีสัญญาแล้ว รอผลจริง |
| AC-046-04 snapshot เดิม | flow รายละเอียด | bank ใหม่ไม่เปลี่ยนข้อ เกณฑ์ policy deadline หรือผลเดิม | history ก่อน/หลังแก้ bank |
| AC-046-05 ครูแก้เฉพาะเวลา | เว็บครู T1 | เวลา/เปิด–ปิดแก้ได้; ค่าอื่น “กำหนดโดยส่วนกลาง”; ครั้งเดิมคงเดิม | save/read-back และปฏิเสธ field ต้องห้าม |
| AC-046-06 ซ่อมรายคน/best | เว็บครู T2 | ก เพิ่ม 1 ครั้ง ข ไม่ได้; 6→9 ใช้ 9; ซ่อม 5 คง 6 ไม่มีเพดานลด | grant/selection/replay ไม่เพิ่มใบซ้ำ |
| AC-046-07 ผลหมดเวลา | กู้ผล หัวข้อผลข้อสอบเมื่อหมดเวลา | 10 ข้อ บันทึกทัน 6 ถูก 4 ได้ 4/10; ไม่รับช้า นับครั้ง/ใบซ่อมเดิม; ซ่อนคะแนน/เฉลยก่อน reveal | boundary/race/recovery/reveal; null ไม่ใช่ 0 |
| AC-047-01 ตั้งนับ Quiz | เว็บครู S1 | A นับ B ไม่นับ; บันทึกเมื่อรวม 100% เท่านั้น | policy A/B และ reject น้ำหนักไม่ครบ |
| AC-047-02 Quiz ไม่นับ | เว็บครู S1 | B ดูผล Quiz ได้ น้ำหนัก 0; เปลี่ยน Quiz อย่างเดียวรวม B คงเดิม | aggregate ก่อน/หลัง |
| AC-047-03 สัดส่วนแยกหลักสูตร | เว็บครู S1 | อ่านน้ำหนัก A ที่บันทึกแล้ว B ไม่เปลี่ยน | policy read-back แยก CourseRun |
| AC-047-04 สูตรรวม 79 | เว็บครู S1 ตารางแยกส่วน | 8/10×20 + 6/10×30 + 18/20×50 = 16+18+45 = 79/100 | breakdown server พร้อม policy revision ไม่ใช้ passed แทนคะแนน |
| AC-047-05 freeze รอบเดิม | เว็บครู S1 รอบอ่านอย่างเดียว | เปลี่ยน 20/30/50 เป็น 30/20/50; รอบเดิม 79 รอบใหม่ 81 | frozen policy/source refs สองรอบ |
| AC-048-01 เฉลี่ยครบ roster | เลื่อน Level L1 | 80 และงานขาด 0 เฉลี่ย 40 เกณฑ์ 70 ขาด 30; สูงกว่าเท่านั้นจึงเสนอ | roster/term authority และ snapshot ห้ามละคนไม่มีงาน |
| AC-048-02 รอครูยืนยัน | เลื่อน Level L1 proposed | “รอครูยืนยัน”; ห้องและทุกคนยัง Level เดิม | ผลก่อน confirm ไม่เปลี่ยน placement เงียบ |
| AC-048-03 ทั้งห้องเทอมหน้า | เลื่อน Level L1 ยืนยัน | สรุปทั้งห้อง Level เดิม→ใหม่ มีผลเทอมหน้า; เทอมปัจจุบันคงเดิม | successor/term recheck; stale ประเมินใหม่ |
| AC-048-04 เท่ากับ/ต่ำกว่า | เลื่อน Level L1 retained | 70=70 ไม่เสนอ ขาด 0; ต่ำกว่าคงเดิมพร้อมส่วนที่ขาด | strict > ก่อนปัดและ retained successor |

## สถานะและการเข้าถึงที่ตรวจประกอบ

ใช้ [states](int-007-states.md), [flow states](int-007-states-flows.md), [auth states](int-007-states-auth.md) และกู้ผล ครอบ loading/error/empty/disabled/ข้อมูลผิดปกติ หมดเวลาล็อกแก้→ประมวลผล→อ่าน server: “หมดเวลา — คะแนนครั้งนี้ 4/10” เมื่อเปิดผลได้; ก่อนเปิด “หมดเวลา — คะแนนและเฉลยจะแสดงตามกำหนด” unknown ใช้ “ยังยืนยันผลเมื่อหมดเวลาไม่ได้ — ตรวจสอบการเชื่อมต่อแล้วตรวจสอบผล” ไม่ส่งคำตอบค้างย้อนหลัง

ตรวจ keyboard/radio/dialog focus, aria-live ไม่ประกาศทุกวินาที, label/error, contrast ข้อความ ≥4.5:1 และ reduced-motion ตามกู้ผล §4 ภาษาอังกฤษอ้างคำเดิม “Time expired — Processing saved answers” ไม่เพิ่มคำแปลใหม่

## หลักฐาน

- [มติ 043 อนุมัติ UX-005/007](../../../../shared/decisions/decisions-043.md); [trace เดิมครบ 16 ข้อ](int-007-trace-acceptance.md)
- [REQ-046 ข้อสอบ](../../shared/requirements/req-046.md), [REQ-047 คะแนนหลักสูตร](../../shared/requirements/req-047.md), [REQ-048 เลื่อนทั้งห้อง](../../shared/requirements/req-048.md)
- รายการ AC ตรวจตรง build/plan/tasks-001.json รายการ UX-007 และ build/plan/UX-007.md วันที่ 2026-11-03; [เงื่อนไขก่อนใช้และข้อจำกัด](../../../../build/legacy-ux/evidence-ux-preconditions.md)
