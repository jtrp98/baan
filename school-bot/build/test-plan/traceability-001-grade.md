# Traceability — ส่งคะแนน

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-049-01 (admin เห็นโรงเรียน/เทอม คาบ/กิจกรรม/ตัวชี้วัด วิชา/ช่องเดิม)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) | [TP001-069](tp-001-cases-quiz-grade-2.md#tp001-069) | BE-035/sys, FE-023/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-049-02 (กิจกรรม A แมพช่องวิชา X และ Y ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) | [TP001-070](tp-001-cases-quiz-grade-2.md#tp001-070) | BE-035/sys, FE-023/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-049-03 (สลับโรงเรียน/เทอมแล้ว mapping ไม่ถูกใช้ข้ามบริบทอัตโนมัติ)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) | [TP001-069](tp-001-cases-quiz-grade-2.md#tp001-069) | BE-035/sys, FE-023/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-049-04 (Preview ตรงคู่กิจกรรม–ช่องที่แมพ ไม่เพิ่มช่อง/เดาหมวดเอง)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) | [TP001-069](tp-001-cases-quiz-grade-2.md#tp001-069) | BE-035/sys, FE-023/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-049-05 (mapping ที่ส่งแล้วแก้คู่เดิมไม่ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) | [TP001-070](tp-001-cases-quiz-grade-2.md#tp001-070) | BE-035/sys, FE-023/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-050-01 (preview ตรวจค่าเดิม/ใหม่และปลายทางตาม BR-050-02/03 ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md) | [TP001-071](tp-001-cases-quiz-grade-2.md#tp001-071) | BE-036/sys, FE-024/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-050-02 (ก่อนยืนยันหรือเมื่อออกจาก preview โดยไม่ยืนยัน คะแนนปลายทางไม่เปลี่ยน)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md) | [TP001-072](tp-001-cases-quiz-grade-3.md#tp001-072) | BE-036/sys, FE-024/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-050-03 (กิจกรรม 8/10 ไปช่องเต็ม 20 ได้ 16)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md) | [TP001-071](tp-001-cases-quiz-grade-2.md#tp001-071) | BE-036/sys, FE-024/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-050-04 (เปลี่ยนคะแนนต้นทางหรือ mapping หลัง preview แล้วส่งค่าใหม่ด้วยการยืนยัน…)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md) | [TP001-071](tp-001-cases-quiz-grade-2.md#tp001-071) | BE-036/sys, FE-024/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-051-01 (ครูแก้ช่อง SchoolBot หลังส่งรอบก่อนแล้วส่งอีกครั้ง…)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md) | [TP001-072](tp-001-cases-quiz-grade-3.md#tp001-072) | BE-037/sys, FE-024/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-051-02 (เลือกทับนักเรียน A และคงค่า B แล้วยืนยันอีกครั้ง A ได้ค่าที่เสนอ B คงค่าครู)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md) | [TP001-072](tp-001-cases-quiz-grade-3.md#tp001-072) | BE-037/sys, FE-024/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-051-03 (แก้ปลายทางหลัง preview หรือหลังเลือกแก้ชนแล้ว ระบบหยุดให้ตรวจใหม่…)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md) | [TP001-072](tp-001-cases-quiz-grade-3.md#tp001-072) | BE-037/sys, FE-024/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-051-04 (ส่งคะแนนในข้อมูลที่มีช่องครู override และผลพิเศษแล้วค่าคุ้มครองคงเดิม…)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md) | [TP001-073](tp-001-cases-quiz-grade-3.md#tp001-073) | BE-037/sys, FE-024/front, UX-006/int, SA-004/arch | QA-015/check | NOT_RUN |
| [AC-051-05 (A ยังไม่มีผลกิจกรรมแต่ช่องเดิมมี 5 ส่งแล้วคง 5 และแสดงข้าม)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md) | [TP001-073](tp-001-cases-quiz-grade-3.md#tp001-073) | BE-036/sys, BE-038/sys, FE-024/front, UX-006/int, SA-004/arch | QA-015/check, QA-016/check | NOT_RUN |
| [AC-052-01 (ครูไม่มีสิทธิ์วิชา/ห้อง ข้ามโรงเรียน/เทอม หรือปลายทางล็อก…)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) | [TP001-074](tp-001-cases-quiz-grade-3.md#tp001-074) | BE-038/sys, FE-024/front, UX-006/int, SA-004/arch, DBA-007/vault | QA-016/check | NOT_RUN |
| [AC-052-02 (สิทธิ์/ล็อกเปลี่ยนหลัง preview แล้วการยืนยันเดิมเขียนคะแนนไม่ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) | [TP001-074](tp-001-cases-quiz-grade-3.md#tp001-074) | BE-038/sys, FE-024/front, UX-006/int, SA-004/arch, DBA-007/vault | QA-016/check | NOT_RUN |
| [AC-052-03 (ส่งรายการเดิมซ้ำรวมกรณีไม่ทราบผลครั้งก่อน คะแนนไม่บวกซ้ำและไม่เกิดผลซ้ำ)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) | [TP001-075](tp-001-cases-quiz-grade-3.md#tp001-075) | BE-038/sys, FE-024/front, UX-006/int, SA-004/arch, DBA-007/vault | QA-016/check | NOT_RUN |
| [AC-052-04 (เมื่อส่งสำเร็จบางรายการ ระบบแสดงผลจริงแยกรายการ)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) | [TP001-075](tp-001-cases-quiz-grade-3.md#tp001-075) | BE-038/sys, FE-024/front, UX-006/int, SA-004/arch, DBA-007/vault | QA-016/check | NOT_RUN |
| [AC-052-05 (ตรวจรายการส่งแล้วพบ audit ครบ BR-052-03)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) | [TP001-076](tp-001-cases-quiz-grade-4.md#tp001-076) | BE-037/sys, BE-038/sys, FE-024/front, UX-006/int, SA-004/arch, DBA-007/vault | QA-016/check | NOT_RUN |

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · BR = Business Rule หรือกฎธุรกิจ
