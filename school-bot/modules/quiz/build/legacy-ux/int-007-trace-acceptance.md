---
legacy: true
---
# 1. Trace ครบ 16 AC

> แก้ล่าสุด 2026-11-02 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (คืนแถว trace 12 แถวที่หลุดตอนแยกไฟล์ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](int-007-trace.md)


ฐานเดิม 15 AC; เพิ่ม [AC-046-07 (หมดเวลาได้ผลจากคำตอบที่บันทึกทันและคงสิทธิ์ซ่อมเดิม)](../../shared/requirements/req-046.md) ตาม[มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../../../../shared/decisions/decisions-042.md) ไม่ใช่หลักฐานตรวจรับระบบเพิ่มเติม

| AC | ส่วนร่าง / expected | หลักฐาน |
|---|---|---|
| [AC-046-01 (เปิด Quiz และ Test แล้วตรวจ policy ทั้งสี่ด้านที่กำหนดไว้ของแต่ละรายการได้)](../../shared/requirements/req-046.md) | หลัก §2 เห็นกติกาที่มีผล ไม่ผูกตามชื่อ | [req-046.md](../../shared/requirements/req-046.md); [des-010.md](../../../../build/design/des-010.md) |
| [AC-046-02 (Quiz/Test ที่ไม่ปรับค่าใช้ BR-046-05)](../../shared/requirements/req-046.md) | หลัก §2 ค่าเริ่มและการจำกัดจริง; states §1–3 | [req-046.md](../../shared/requirements/req-046.md); [des-010.md](../../../../build/design/des-010.md) |
| [AC-046-03 (รายการที่กำหนดสุ่มข้อ แสดงประวัติชุดและลำดับข้อที่ผู้เรียนได้รับจริงได้)](../../shared/requirements/req-046.md) | หลัก §2 ครั้งเดิมคงชุด/ลำดับจาก server; ข้อจำกัดด้านล่าง | [req-046.md](../../shared/requirements/req-046.md); [des-010.md](../../../../build/design/des-010.md) |
| [AC-046-04 (แก้คลังเป็น revision ใหม่แล้วประวัติการทำเดิมยังอ้าง snapshot และเกณฑ์เดิม ผลเดิมไม่เปลี่ยน)](../../shared/requirements/req-046.md) | หลัก §2 snapshot เดิมไม่เปลี่ยน; ไม่แต่ง revision ที่ไม่คืน | [req-046.md](../../shared/requirements/req-046.md); [des-010.md](../../../../build/design/des-010.md) |
| [AC-046-05 (ครูแก้เวลาสอบ/ช่วงเปิด–ปิดได้)](../../shared/requirements/req-046.md) | เว็บ T1 เฉพาะเวลา/เปิด–ปิด; field อื่นอ่านอย่างเดียว | [req-046.md](../../shared/requirements/req-046.md); [learning-rules-032-034.md](../../../../build/design/learning-rules-032-034.md) |
| [AC-046-06 (เปิดซ่อมให้ A แล้ว B ไม่ได้สิทธิ์)](../../shared/requirements/req-046.md) | เว็บ T2 ก ได้ใบ ข ไม่ได้; 6→9 ใช้ 9; ซ่อม 5 คง 6 | [req-046.md](../../shared/requirements/req-046.md); [des-010.md](../../../../build/design/des-010.md) |
| [AC-046-07 (หมดเวลาได้ผลจากคำตอบที่บันทึกทันและคงสิทธิ์ซ่อมเดิม)](../../shared/requirements/req-046.md) | Q43; recovery delta042: 4/10 ไม่รับย้อนหลัง นับสิทธิ์เดิม | [req-046.md](../../shared/requirements/req-046.md); [มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../../../../shared/decisions/decisions-042.md) |
| [AC-047-01 (ครูตั้ง A ให้นับ Quiz และ B ไม่นับ แล้วเห็นค่ารายหลักสูตร)](../../shared/requirements/req-047.md) | เว็บ S1 แยกรายหลักสูตร รวม 100% และ Quiz ไม่นับ=0 | [req-047.md](../../shared/requirements/req-047.md); [learning-rules-032-034.md](../../../../build/design/learning-rules-032-034.md) |
| [AC-047-02 (Quiz ของ B มีผลให้ดูและน้ำหนัก 0)](../../shared/requirements/req-047.md) | เว็บ S1 Quiz ยังมีผล แต่เปลี่ยน Quiz น้ำหนัก0 ไม่เปลี่ยนรวม | [req-047.md](../../shared/requirements/req-047.md); [des-010.md](../../../../build/design/des-010.md) |
| [AC-047-03 (ครูกำหนดสัดส่วน A แล้วเรียกดูสัดส่วนที่บันทึกได้ โดยไม่เปลี่ยน B)](../../shared/requirements/req-047.md) | เว็บ S1 อ่านค่าที่บันทึกของ A โดย B ไม่เปลี่ยน | [req-047.md](../../shared/requirements/req-047.md); [des-010.md](../../../../build/design/des-010.md) |
| [AC-047-04 (กิจกรรม 8/10 น้ำหนัก 20%, Quiz 6/10 น้ำหนัก 30%, Test 18/20 น้ำหนัก 50% ได้รวม 79/100 และแสดงส่วน 16+18+45 (ตัวเลขทดสอบจากสูตร ไม่ใช่ค่าเริ่ม))](../../shared/requirements/req-047.md) | เว็บ S1 ตาราง 16+18+45=79 | [req-047.md](../../shared/requirements/req-047.md); [learning-rules-032-034.md](../../../../build/design/learning-rules-032-034.md) |
| [AC-047-05 (เปลี่ยนน้ำหนักจาก 20/30/50 เป็น 30/20/50 แล้ว CourseRun เดิมยังได้ 79/100 ด้วยค่าเดิม)](../../shared/requirements/req-047.md) | เว็บ S1 รอบเดิม79 รอบใหม่81 ไม่คิดย้อนหลัง | [req-047.md](../../shared/requirements/req-047.md); [learning-rules-032-034.md](../../../../build/design/learning-rules-032-034.md) |
| [AC-048-01 (สิ้นเทอม roster 2 คนได้คะแนนรวม 80 และ 0 เพราะขาดทุกงาน ระบบแสดงเฉลี่ย 40 ไม่เสนอเลื่อนที่เกณฑ์ 70)](../../shared/requirements/req-048.md) | เว็บ L1 roster80/0 เฉลี่ย40; เสนอเมื่อ > เท่านั้น | [req-048.md](../../shared/requirements/req-048.md); [des-011.md](../../../../build/design/des-011.md) |
| [AC-048-02 (ก่อนครูยืนยัน Level ของห้องและนักเรียนทุกคนยังไม่เปลี่ยน)](../../shared/requirements/req-048.md) | เว็บ L1 proposed ยังไม่เปลี่ยนทุกคนก่อนยืนยัน | [req-048.md](../../shared/requirements/req-048.md); [des-011.md](../../../../build/design/des-011.md) |
| [AC-048-03 (ครูยืนยันข้อเสนอสิ้นเทอมแล้ว เทอมปัจจุบันไม่เปลี่ยน)](../../shared/requirements/req-048.md) | เว็บ L1 ยืนยันทั้งห้อง มีผลเทอมถัดไป | [req-048.md](../../shared/requirements/req-048.md); [des-011.md](../../../../build/design/des-011.md) |
| [AC-048-04 (เฉลี่ยเท่ากับหรือต่ำกว่าเกณฑ์ไม่เสนอเลื่อน เทอมถัดไปอยู่ Level เดิมและแสดงส่วนที่ขาด (เท่ากันแสดง 0))](../../shared/requirements/req-048.md) | เว็บ L1 เท่ากัน/ต่ำกว่าอยู่เดิม เท่ากัน gap0 | [req-048.md](../../shared/requirements/req-048.md); [des-011.md](../../../../build/design/des-011.md) |

## 2. สัญญาที่ใช้ ไม่เพิ่ม API/field

Attempt ใช้ POST เริ่ม, GET ครั้งเดิม, PUT answers และ POST submit ตาม [des-010.md](../../../../build/design/des-010.md); policy/เวลา/retake ตามสัญญาเดียวกัน; Level/เกณฑ์/confirm/decline ตาม [des-011.md](../../../../build/design/des-011.md) ชื่อเหล่านี้เป็น client-facing semantics ผ่าน Gateway ไม่ใช่การอนุมัติ direct backend

Retry/error/opaque ETag ใช้ [data-contract-rules.md](../../../../build/design/data-contract-rules.md) ไม่ parse ETag เป็นวันที่ ไม่เปลี่ยน key เพื่อหลบ conflict การรักษาสิทธิ์ก่อน commit อ้าง [des-012.md](../../../../build/design/des-012.md) และ [teacher-authority-001.md](../../../../build/design/teacher-authority-001.md)

สูตร/freeze/เลือกผล/งานขาด/roster ว่างใช้ [learning-rules-032-034.md](../../../../build/design/learning-rules-032-034.md); snapshot types อยู่ [contract-003.md](../../../../build/design/data-dictionary/contract-003.md) และการขยาย effective_policy/windows ที่ learning-rules ไม่อ่าน snapshot server-only มาเผยเฉลย

## หลักฐาน

- `design/des-010.md:62–84`
