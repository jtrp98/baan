# Traceability — 187 AC

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ตารางนี้เชื่อม Acceptance Criteria (AC: เกณฑ์ตรวจรับ) ทั้ง 187 ข้อกับ 82 cases ของ [TP-001 (แผนตรวจรับ SchoolBot)](tp-001.md) รวม case เพิ่มเติมและการปรับ mapping ปัจจุบันแล้ว ทุก Actual เป็น NOT_RUN จึงไม่ใช่ผลผ่านหรือความพร้อม transport

| ตาราง AC → case | จำนวน AC |
|---|---:|
| [AC-009-01 (เริ่มแอปโดยไม่เคยใส่ License แล้วเข้าใช้งาน Block Lab, Arm Lab และ Code…)–AC-016-03 (ปรับข้อต่อถี่ผ่าน test bridge แล้ว trace มีคำสั่งทำงานครั้งละหนึ่งรายการ)](traceability-001-desktop.md) | 25 |
| [AC-017-01 (โหลดโครงงานถูกต้องที่มีสองท่าและกลุ่ม แล้วได้ชื่อ ค่า เวลา ลำดับ…)–AC-017-03 (บันทึกและเปิดใหม่แล้วไม่มีสถานะยืนยันว่าอัปโหลดตรงกับบอร์ดหรืออยู่ตรงท่า…)](traceability-001-desktop-2.md) | 3 |
| [AC-018-01 (ให้สองท่าและสองรอบผ่าน test bridge แล้วพบการส่งตามลำดับเดิมครบสี่ท่า)–AC-025-03 (บันทึกแล้วเปิด source เดิมได้)](traceability-001-robot.md) | 25 |
| [AC-026-01 (move_right(2) ตามด้วย repeat 2 ครั้งของ jump ให้ผลคำสั่ง move_right,…)–AC-026-04 (บันทึก workspace แล้วเปิดใหม่ได้บล็อก ค่า การเชื่อมต่อ และสถานะ enabled…)](traceability-001-robot-2.md) | 4 |
| [AC-027-01 (เมื่อระบบยืนยันตัวตนพนักงานที่ /v2/admin ยังไม่ถูกตั้งค่า (เดิมเรียก…)–AC-032-01 (ติดตั้งแพ็กเกจเดียวบนเครื่องทดสอบ macOS 15+ ทั้ง Intel และ Apple Silicon…)](traceability-001-license.md) | 25 |
| [AC-032-02 (บน macOS 15+ ทั้ง Intel และ Apple Silicon…)–AC-036-06 (เมื่อสั่งออกจากระบบของบัญชี Login…)](traceability-001-license-2.md) | 24 |
| [AC-037-01 (เลือก Activity ภารกิจ Block, Arm และ Code แล้วเข้าถึงเนื้อหาและภารกิจตรง…)–AC-041-03 (หลังนำเข้าแต่ละโหมดสำเร็จ เปิดต้นฉบับใน Guest ได้เนื้อหาเดิม…)](traceability-001-learning.md) | 25 |
| [AC-041-04 (นำเข้างานเดิมซ้ำในบัญชีเดิม รวม retry หลังคำตอบสูญหาย/เปิดแอปใหม่…)–AC-044-05 (ขอแก้ฉบับ publish แล้วฉบับเดิมไม่เปลี่ยน)](traceability-001-learning-2.md) | 17 |
| [AC-045-01 (นำเข้าแถว D=TRUE แล้วเห็นเป็น draft…)–AC-048-04 (เฉลี่ยเท่ากับหรือต่ำกว่าเกณฑ์ไม่เสนอเลื่อน เทอมถัดไปอยู่ Level…)](traceability-001-quiz.md) | 20 |
| [AC-049-01 (admin เห็นโรงเรียน/เทอม คาบ/กิจกรรม/ตัวชี้วัด วิชา/ช่องเดิม)–AC-052-05 (ตรวจรายการส่งแล้วพบ audit ครบ BR-052-03)](traceability-001-grade.md) | 19 |

## ความครบถ้วนและ owner

AC-041-04/05 เพิ่ม TP001-078 สำหรับ tombstone; [AC-038-05 (ครูตรวจ Arm ของนักเรียนนอกรายชื่อที่ได้รับมอบหมายหรือข้ามโรงเรียนไม่ได้…)](../../modules/quiz/shared/requirements/req-038.md) และ [AC-039-05 (ครูขอดูรายชื่อหรือผลนักเรียนนอกที่ได้รับมอบหมาย…)](../../modules/quiz/shared/requirements/req-039.md) เพิ่ม TP001-079 สำหรับ authority; [AC-030-04 (การเตรียมอัปเดตเริ่มเฉพาะเมื่อผู้ใช้สั่งเอง และตรวจ trust ครบ)](../../modules/app-shell/shared/requirements/req-030.md)–08 ใช้ TP001-080 โดย AC-030-04 มี TP001-048 ตรวจ metadata-only; [AC-046-07 (Test 10 ข้อละ 1)](../../modules/quiz/shared/requirements/req-046.md) ใช้ TP001-081 สำหรับหมดเวลา; AC-036-06 ใช้ TP001-082 สำหรับ logout ตารางไฟล์ย่อยคง owner เดิม และผูก [BE-019 (Update check/Prepare/Install)](../plan/index.md)/[QA-010 (Update/assets QA)](../plan/index.md) ของการอัปเดตจาก plan/index.md


## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · BR = Business Rule หรือกฎธุรกิจ



## ยังไม่ยืนยัน

เอกสารต้นฉบับของ TP001-081 ไม่ระบุ implementation/validation task owner เพิ่ม จึงไม่เดาเจ้าของจาก case ข้างเคียง ให้ gm ยืนยัน mapping งานในแผน โดยไม่กระทบ expected ธุรกิจและ coverage ของ AC-046-07

## หลักฐาน

ตาราง 180 AC เดิม join owner จาก plan/tasks-001.json (memory) revision2; แถว logout ระบุ [BE-006 (Login/session)](../plan/index.md)/sys, [BE-039 (เชื่อม SchoolBot ผ่าน Gateway)](../plan/index.md)/sys, [FE-002 (Login UI)](../plan/index.md)/front → [QA-001 (License QA)](../plan/index.md)/check ไว้แล้ว ข้อมูลสำหรับเครื่อง traceability-001.json และ tp-001.json คง snapshot 180 AC/77 cases ไม่เปลี่ยนในงานนี้
