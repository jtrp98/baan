# TP-002 — ตารางเกณฑ์ตรวจรับและ fixture

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [แผน TP-002](tp-002-fixture-plan-001.md) ขอบเขตหก AC คงเดิมและผลจริงเป็น NOT_RUN

## ตารางเกณฑ์ตรวจรับ

ครบ 6/6 AC มี setup/trigger/สิ่งที่วัดในส่วนต่อ; ทุก runtime actual=NOT_RUN. expected เป็นสิ่งที่ check ต้องวัด ไม่ใช่ผลรอบนี้

| AC / reference | Fixture → TP case / ระดับ | Expected ที่ต้องวัด | Actual ของ deliverable / ข้อจำกัด |
| --- | --- | --- | --- |
| [AC-021-02 (หลังหยุดแล้วปล่อยคำตอบเก่าหรือ timer ค้าง ไม่มีคำสั่งท่าถัดไปออกไป) / BR-021-02 (คำตอบหรือ timer เก่าหลัง stop ต้องไม่เริ่มการเคลื่อนไหวถัดไป)](../../modules/arm-lab/shared/requirements/req-021.md) · [DES-001 (Desktop host และ IPC)](../design/des-001.md) Rev1 lifecycle | FX-03a/e → TP001-037, TP001-040 เฉพาะ stale generation / integration fake | หลัง stop ปล่อย callback/timer เก่าแล้ว next movement=0; drain/reap ก่อน stop | ครบในแผน; NOT_RUN; ไม่พิสูจน์ physical stop |
| [AC-024-02 (จำลอง transport error ระหว่างส่งท่าแล้วเห็นข้อผิดพลาดและไม่มีการส่งท่าเด…) / BR-024-02 (ความผิดพลาดการสื่อสารต้องแสดงให้ผู้ใช้เห็น และไม่ retry การเคลื่อนไหวเอง)](../../modules/arm-lab/shared/requirements/req-024.md) · TP001-040 | FX-03d → TP001-040 / integration fake; TP001-045 / manual รอคน | error ระหว่างส่งท่าแสดงต่อผู้ใช้; ท่าเดิม dispatch=1 ไม่มี auto retry | ครบในแผน; NOT_RUN; fake ไม่ปิด TP001-045/E-HW |
| [AC-034-03 (ออฟไลน์ภายใน 3 วันจากตรวจสำเร็จล่าสุดใช้งานได้) / BR-034-03 (สิทธิ์ออฟไลน์ใช้ได้ 3 วันนับจากการตรวจออนไลน์สำเร็จล่าสุด…)](../../modules/app-shell/shared/requirements/req-034.md) · DES-001 gate | FX-01a/d → TP001-003 / unit clock + integration fake | exp−1s เข้าได้; restart ไม่เลื่อน checked_at/exp | ครบในแผน; NOT_RUN; fake credential/clock |
| [AC-034-04 (ครบ 3 วันและติดต่อเซิร์ฟเวอร์ไม่ได้…) / BR-034-04 (ครบกำหนดต้องตรวจออนไลน์ใหม่)/05](../../modules/app-shell/shared/requirements/req-034.md) · DES-001 expiry | FX-01a/d + FX-03a → TP001-003 / unit + integration fake | exp/exp+1s+network fail ล็อกและแจ้งต่ออินเทอร์เน็ต; stale timer ไม่ dispatch | ครบในแผน; NOT_RUN; online/DB จริงยังไม่ตรวจ |
| [AC-035-05 (A ที่ออฟไลน์ยังใช้ได้ก่อนสิทธิ์เดิมหมด แต่ครบกำหนดแล้วเข้าโหมดหลักไม่ได้) / BR-035-04 (เครื่องเดิมออฟไลน์ได้จนสิทธิ์เดิมหมดตาม REQ-034 ไม่เริ่มนับ 3…)/05](../../modules/app-shell/shared/requirements/req-035.md) · TP001-010 | FX-01e → TP001-010 / unit + integration fake | ย้าย A→SchoolBot แล้ว A offline ใช้ก่อน E ได้ ที่/หลัง E ไม่ได้; E เดิมไม่เลื่อน | ครบในแผน; NOT_RUN; binding server เป็น stub |
| [AC-039-05 (ครูขอดูรายชื่อหรือผลนักเรียนนอกที่ได้รับมอบหมาย…) / BR-039-02 (ครูดูเฉพาะรายชื่อนักเรียนที่ผู้ดูแลกำหนดให้ครูแต่ละคนในโรงเรียน/บัญชีเดิ…)](../../modules/quiz/shared/requirements/req-039.md) · TP001-058/079 | FX-05a/b/c → TP001-058, TP001-079 / domain + integration fake | นอก assignment/ต่างโรงเรียน/รู้ ID ไม่เห็นรายชื่อหรือผล; positive control อ่านได้; resolver ล่ม fail closed | ครบในแผน; NOT_RUN; roster/history resolver จริงรอ proof |



## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · REQ = Requirement หรือข้อกำหนด · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · IPC = Inter-Process Communication
