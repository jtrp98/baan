# TP-001 — ความปลอดภัยและการกู้คืน (TP001-080–TP001-081)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-080"></a>

## TP001-080 — สั่งเตรียม→ตรวจ trust

AC: [AC-030-04 (การเตรียมอัปเดตเริ่มเฉพาะเมื่อผู้ใช้สั่งเอง และตรวจ trust ครบ)](../requirement/req-030.md)..08 (ผู้ใช้ตรวจรับแล้วตาม [มติ 037 (ตรวจรับ AC-030-04..08 + UX Q5/Q9 + เกณฑ์ performance)](../requirement/decisions-037.md)) · References: [DES-007 (Release และ trusted update)](../design/des-007.md) Rev3, release-trust-001, update-disposition-001, [BR-030-04 (การเตรียม/ติดตั้งอัปเดตเป็นคำสั่งแยกที่ผู้ใช้สั่งเอง (explicit intent) —…)](../requirement/req-030.md)..06 · Level: integration · Profiles: PF-HOST, PF-API, PF-UI-WIN

เงื่อนไขก่อนตรวจ: stub release registry + manifest ลงนาม (stub CI registry); artifact ถูกแก้หลัง staging (TOCTOU); release หมดอายุ/ถูก withdraw/เก่ากว่า; มีงานค้าง+หุ่น busy; inject install fail กลางทาง; ผู้ใช้ยกเลิก/ปิดแอประหว่างเตรียม

ขั้นตอน: สั่งเตรียม→ตรวจ trust; สั่งติดตั้ง→ตรวจ staging ซ้ำ/stop guard/ยืนยัน restart; ยกเลิก/ปิดกลางทาง; บังคับ fail ตอนติดตั้ง

ผลที่คาด: เตรียมผ่านเฉพาะ trust ครบ (hash ตรง manifest จาก registry + publisher pin) ไม่ผ่าน→ไม่มี artifact ใน staging + เหตุผลปฏิเสธ (AC-030-04) · staging ผิด/เปลี่ยน/หมดอายุ/withdraw/downgrade→ปฏิเสธไม่ติดตั้ง ([AC-030-05 (artifact ใน staging ถูกตรวจความสมบูรณ์ซ้ำ (กัน TOCTOU) ตอนสั่งติดตั้ง —…)](../requirement/req-030.md)) · ติดตั้งต้องขอหยุดงานค้าง/หุ่นก่อน + ผู้ใช้ยืนยันก่อน restart ([AC-030-06 (การติดตั้งต้องขอหยุดงานค้าง/หุ่น (stop เป็นเพียงคำขอ)…)](../requirement/req-030.md)) · fail กลางทาง→ใช้เวอร์ชันเดิมต่อได้ + รายงานสาเหตุ ไม่เหลือครึ่งติดตั้ง ([AC-030-07 (การติดตั้งล้มเหลวกลางทาง เครื่องกลับมาใช้งานเวอร์ชันเดิมได้…)](../requirement/req-030.md)) · ยกเลิก/ปิด→ไม่ติดตั้ง + staging ล้างหรือตรวจซ้ำครั้งถัดไป ([AC-030-08 (ผู้ใช้ยกเลิกหรือปิดแอประหว่างเตรียม/ก่อนติดตั้ง…)](../requirement/req-030.md))

หลักฐานที่ต้องเก็บ: E-API + trace ไฟล์/registry + spy process · Actual: NOT_RUN

<a id="tp001-081"></a>

## TP001-081 — คะแนนเมื่อหมดเวลาและการนับครั้ง/สิทธิ์ซ่อม

อ้าง [AC-046-07 (Test 10 ข้อละ 1)/BR-046-07 (หมดเวลาปิด attempt ตรวจคำตอบที่ server บันทึกทัน)](../requirement/req-046.md), [decisions-042 (ผลข้อสอบเมื่อหมดเวลา)](../requirement/decisions-042.md), [DES-010 (Question Bank, Attempt และนโยบายคะแนน)](../design/des-010.md), [LUX-05](../design/learning-ux-contract-gaps-001.md)

ระดับ: unit ตรวจคะแนน; integration ตรวจ lifecycle/count/recovery ผ่าน PF-API ตาม index; UI reload เฉพาะเมื่อ backend และ signed UX พร้อม

เงื่อนไขก่อนตรวจ: synthetic Test 10 ข้อละ 1 คะแนน; student มีสิทธิ์และ snapshot/policy เดิม; test environment/transport/DB prerequisites ตาม index พร้อม. Guest ใช้แทน server attempt ไม่ได้; คงข้อห้าม teacher Cloud attempt ตาม [REQ-046 (Quiz/Test และคลังข้อสอบแบบ revision)](../requirement/req-046.md) เดิม ไม่เพิ่ม manual grading

| ชุดข้อมูล | ขั้นตอน | Expected/assertions |
|---|---|---|
| Q1–6 server บันทึกทัน: ถูก4ผิด2; Q7–8 ค้างเครื่อง; Q9–10 ว่าง | ไม่กด submit ปล่อยหมดเวลา แล้วอ่านผล | ปิด attempt อัตโนมัติ ได้4/10; ข้อที่ไม่ได้บันทึกได้0; คะแนนเต็มยัง10 |
| ไม่มีคำตอบบันทึกเลย | ไม่ส่งและปล่อยหมดเวลา | ได้0/10; ไม่เป็นผลว่างหรือคะแนนเต็ม0 |
| ผล4/10 ข้างต้น; คำตอบค้าง/ส่งช้าอาจทำให้คะแนนเพิ่ม | ส่งคำตอบเหล่านั้นหลังหมดเวลา แล้วอ่านซ้ำ | ไม่รับย้อนหลัง; ผลยัง4/10; จำนวนครั้งไม่คืนเพราะไม่กดส่ง |
| ครั้งปกติและรอบซ่อมแยก fixture; ผลก่อนซ่อม6/10 หรือ2/10 | ปล่อยรอบซ่อมหมดเวลาได้4/10; จำลอง response สูญหายหลังปิดผล แล้ว reload/อ่านซ้ำ | นับครั้ง/ใช้สิทธิ์ซ่อมตาม snapshot เดิม ไม่คืนหรือกินซ้ำ; คะแนนสูงสุดเป็น6/10 หรือ4/10 ตามลำดับ; ผลเดิมคงอยู่ ไม่ finalize ซ้ำ |

หลักฐานที่ check ต้องเก็บ: unit log; E-API แบบ sanitized พร้อม build/config/fixture revision, attempt/snapshot refs, คำตอบและเวลาที่ server บันทึก, fault point, ผล/count/grant/audit ก่อน–หลัง; E-UI สำหรับ reload เท่านั้น. ต้องแยก response หายหลัง commit จากคำตอบที่ server ยังไม่บันทึก

ข้อรอพิสูจน์ทางเทคนิค: DES-010 Rev4/LUX-05 มีสัญญาธุรกิจแล้ว แต่รายละเอียดเทคนิคยัง OPEN. ใช้มติ 042 เรื่องคะแนนเมื่อหมดเวลาเป็น expected ธุรกิจ; รอ arch/sys ตรึง clock authority/precision, ก่อน–ตรง–หลัง deadline, answers/submit/expiry race, atomic finalize/retry/recovery/DTO. เตรียม fault ก่อน/หลัง commit และ concurrent expiry/reload แต่ไม่เดา equality, error code หรือเวลา recovery. ยังไม่ยอมรับความเสี่ยงเพื่อเปิด gate

ผลจริง: NOT_RUN ทุกชุดย่อย รวม clock/race/boundary



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · REQ = Requirement หรือข้อกำหนด · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · DTO = Data Transfer Object · TOCTOU = Time of Check to Time of Use · CI = Continuous Integration
