# 1. Trace ครบ 16 AC

> แก้ล่าสุด 2026-11-02 · แก้โดย int · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](int-007-trace.md)


ฐานเดิม 15 AC; เพิ่ม [AC-046-07 (หมดเวลาได้ผลจากคำตอบที่บันทึกทันและคงสิทธิ์ซ่อมเดิม)](../requirement/req-046.md) ตาม[มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../requirement/decisions-042.md) ไม่ใช่หลักฐานตรวจรับระบบเพิ่มเติม

| AC | ส่วนร่าง / expected | หลักฐาน |
|---|---|---|
| [AC-046-01 (เปิด Quiz และ Test แล้วตรวจ policy ทั้งสี่ด้านที่กำหนดไว้ของแต่ละรายการได้)](../requirement/req-046.md) | หลัก §2 เห็นกติกาที่มีผล ไม่ผูกตามชื่อ | [req-046.md](../requirement/req-046.md); [des-010.md](../design/des-010.md) |
| AC-046-07 | Q43 (บันทึก ส่ง กู้ผล และหมดเวลาข้อสอบ); recovery ผลข้อสอบเมื่อหมดเวลา: 4/10 ไม่รับย้อนหลัง นับสิทธิ์เดิม | [เกณฑ์ผลข้อสอบหมดเวลา](../requirement/req-046.md); [มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../requirement/decisions-042.md) |
| [AC-047-01 (ครูตั้ง A ให้นับ Quiz และ B ไม่นับ แล้วเห็นค่ารายหลักสูตร)](../requirement/req-047.md) | เว็บ S1 แยกรายหลักสูตร รวม 100% และ Quiz ไม่นับ=0 | [req-047.md](../requirement/req-047.md); [learning-rules-032-034.md](../design/learning-rules-032-034.md) |
| [AC-048-01 (สิ้นเทอม roster 2 คนได้คะแนนรวม 80 และ 0 เพราะขาดทุกงาน ระบบแสดงเฉลี่ย 40 ไม่เสนอเลื่อนที่เกณฑ์ 70)](../requirement/req-048.md) | เว็บ L1 roster80/0 เฉลี่ย40; เสนอเมื่อ > เท่านั้น | [req-048.md](../requirement/req-048.md); [des-011.md](../design/des-011.md) |

## 2. สัญญาที่ใช้ ไม่เพิ่ม API/field

Attempt ใช้ POST เริ่ม, GET ครั้งเดิม, PUT answers และ POST submit ตาม [des-010.md](../design/des-010.md); policy/เวลา/retake ตามสัญญาเดียวกัน; Level/เกณฑ์/confirm/decline ตาม [des-011.md](../design/des-011.md) ชื่อเหล่านี้เป็น client-facing semantics ผ่าน Gateway ไม่ใช่การอนุมัติ direct backend

Retry/error/opaque ETag ใช้ [data-contract-rules.md](../design/data-contract-rules.md) ไม่ parse ETag เป็นวันที่ ไม่เปลี่ยน key เพื่อหลบ conflict การรักษาสิทธิ์ก่อน commit อ้าง [des-012.md](../design/des-012.md) และ [teacher-authority-001.md](../design/teacher-authority-001.md)

สูตร/freeze/เลือกผล/งานขาด/roster ว่างใช้ [learning-rules-032-034.md](../design/learning-rules-032-034.md); snapshot types อยู่ [contract-003.md](../design/data-dictionary/contract-003.md) และการขยาย effective_policy/windows ที่ learning-rules ไม่อ่าน snapshot server-only มาเผยเฉลย

## ยังไม่ยืนยัน

หัวข้อและข้อความเดิมระบุว่าครอบคลุม 16 AC (ฐานเดิม 15 ข้อและเพิ่ม AC-046-07) แต่ตารางที่ได้รับมีเพียง AC-046-01, AC-046-07, AC-047-01 และ AC-048-01 รวม 4 รายการ จึงคงทั้งข้อความจำนวนและตารางไว้ ผู้รับผิดชอบเกณฑ์ตรวจรับต้องยืนยันรายการอีก 12 ข้อและตำแหน่ง trace เดิมก่อนอ้างว่าตารางนี้ครอบคลุมครบ 16 ข้อ งานเรียบเรียงนี้ไม่เพิ่มหรือลดเกณฑ์เอง

## หลักฐาน

- `design/des-010.md:62–84`
