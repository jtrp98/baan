# TP-001 Amendment004 — 2026-10-26

## TP001-081

อ้าง [AC-046-07/BR-046-07](../requirement/req-046.md), [decisions-042](../requirement/decisions-042.md), [DES-010](../design/des-010.md), [LUX-05](../design/learning-ux-contract-gaps-001.md). ต่อจาก TP001-080; cases เดิมไม่เปลี่ยน

ระดับ: unit ตรวจคะแนน; integration ตรวจ lifecycle/count/recovery ผ่าน PF-API ตาม index; UI reload เฉพาะเมื่อ backend และ signed UX พร้อม

เงื่อนไขก่อนตรวจ: synthetic Test 10 ข้อละ 1 คะแนน; student มีสิทธิ์และ snapshot/policy เดิม; test environment/transport/DB prerequisites ตาม index พร้อม. Guest ใช้แทน server attempt ไม่ได้; คงข้อห้าม teacher Cloud attempt ตาม REQ-046 เดิม ไม่เพิ่ม manual grading

| ชุดข้อมูล | ขั้นตอน | Expected/assertions |
|---|---|---|
| Q1–6 server บันทึกทัน: ถูก4ผิด2; Q7–8 ค้างเครื่อง; Q9–10 ว่าง | ไม่กด submit ปล่อยหมดเวลา แล้วอ่านผล | ปิด attempt อัตโนมัติ ได้4/10; ข้อที่ไม่ได้บันทึกได้0; คะแนนเต็มยัง10 |
| ไม่มีคำตอบบันทึกเลย | ไม่ส่งและปล่อยหมดเวลา | ได้0/10; ไม่เป็นผลว่างหรือคะแนนเต็ม0 |
| ผล4/10 ข้างต้น; คำตอบค้าง/ส่งช้าอาจทำให้คะแนนเพิ่ม | ส่งคำตอบเหล่านั้นหลังหมดเวลา แล้วอ่านซ้ำ | ไม่รับย้อนหลัง; ผลยัง4/10; จำนวนครั้งไม่คืนเพราะไม่กดส่ง |
| ครั้งปกติและรอบซ่อมแยก fixture; ผลก่อนซ่อม6/10 หรือ2/10 | ปล่อยรอบซ่อมหมดเวลาได้4/10; จำลอง response สูญหายหลังปิดผล แล้ว reload/อ่านซ้ำ | นับครั้ง/ใช้สิทธิ์ซ่อมตาม snapshot เดิม ไม่คืนหรือกินซ้ำ; คะแนนสูงสุดเป็น6/10 หรือ4/10 ตามลำดับ; ผลเดิมคงอยู่ ไม่ finalize ซ้ำ |

หลักฐานที่ check ต้องเก็บ: unit log; E-API แบบ sanitized พร้อม build/config/fixture revision, attempt/snapshot refs, คำตอบและเวลาที่ server บันทึก, fault point, ผล/count/grant/audit ก่อน–หลัง; E-UI สำหรับ reload เท่านั้น. ต้องแยก response หายหลัง commit จากคำตอบที่ server ยังไม่บันทึก

Pending technical proof: DES-010 Rev4/LUX-05 ที่อ่านยังไม่บันทึก amendment076. ใช้042เป็น expected ธุรกิจ; รอ arch/sys ตรึง clock authority/precision, ก่อน–ตรง–หลัง deadline, answers/submit/expiry race, atomic finalize/retry/recovery/DTO. เตรียม fault ก่อน/หลัง commit และ concurrent expiry/reload แต่ไม่เดา equality, error code หรือเวลา recovery. ยังไม่ยอมรับความเสี่ยงเพื่อเปิด gate

Actual: NOT_RUN ทุกชุดย่อย รวม clock/race/boundary

Traceability: AC-046-07 → TP001-081; AC-046-01..06 คง TP001-063..065. Coverage รวมตามฐานเดิม+Amendment004 เป็น81 cases/186 AC ไม่ใช่ผลทดสอบ; snapshot180/77คงเดิม

## Change Log
- 2026-10-26 — ใบงาน078: เพิ่ม TP001-081 ตาม042; coverageเท่านั้น ไม่มี test execution
