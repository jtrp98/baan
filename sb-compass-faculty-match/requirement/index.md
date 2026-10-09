# sb-compass-faculty-match — Requirement Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `business-analyst` เท่านั้น · **สถานะของ REQ อยู่ในตารางนี้เท่านั้น** · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `req-*.md` / `scope.md` ที่ packet/brief ระบุ — ห้าม ls

| REQ | ชื่อ | Status | AC ids | ไฟล์ |
|---|---|---|---|---|
| REQ-001 | นำเข้าเอกสารหลักสูตรและแปลงเป็นข้อความ | confirmed | AC-001.1, AC-001.2 | `req-001.md` |
| REQ-002 | ให้ AI วิเคราะห์หลักสูตรออกมาเป็นข้อมูลที่จับคู่ได้ | confirmed | AC-002.1, AC-002.2, AC-002.3 | `req-002.md` |
| REQ-003 | ต้องมีคนอนุมัติก่อนสาขานั้นถูกเปิดให้เด็กเห็น | confirmed | AC-003.1, AC-003.2, AC-003.3 | `req-003.md` |
| REQ-004 | ถ้า AI อ่านไม่ออก/ไม่มั่นใจ ให้คนกรอกมือแทน | confirmed | AC-004.1, AC-004.2 | `req-004.md` |
| REQ-005 | การจับคู่เด็กกับสาขา | confirmed | AC-005.1, AC-005.2, AC-005.3 | `req-005.md` |
| REQ-006 | ผลลัพธ์ที่เด็กเห็น: 10 อันดับสาขา + % + คำแนะนำ | confirmed | AC-006.1, AC-006.2, AC-006.3 | `req-006.md` |
| REQ-007 | แบบทดสอบเชิงพฤติกรรม "รอบที่สอง" (หลังรู้สาย/รู้สาขาแล้ว) | confirmed | AC-007.1 | `req-007.md` |
| REQ-008 | quest เล็ก ๆ ให้เด็กลองทำ (ของใหม่ แยกจาก `sb-compass REQ-008`) | confirmed | AC-008.1 | `req-008.md` |
| REQ-009 | ทั้งโมดูลนี้เป็น Premium และต้องกั้นสิทธิ์ที่ฝั่งเซิร์ฟเวอร์ | confirmed | AC-009.1, AC-009.2 | `req-009.md` |
| REQ-010 | ขอบเขตข้อมูล: เด็กเจ้าของบัญชีเท่านั้น + ข้อมูลเด็กห้ามออกนอกระบบ | confirmed | AC-010.1, AC-010.2 | `req-010.md` |
| REQ-011 | เปลี่ยนตัวกรองชั้นแรกจาก 8 สายเดิม เป็น 11 กลุ่มความสนใจ (Interest Cluster) | confirmed | AC-011.1, AC-011.2 | `req-011.md` |
| REQ-012 | Holland Code (RIASEC) แทนที่แบบทดสอบบุคลิกภาพเดิมทั้งสองชุด | confirmed | AC-012.1, AC-012.2, AC-012.3, AC-012.4, AC-012.5 | `req-012.md` |
| REQ-016 | น้ำหนักระหว่าง "ความสนใจ" (RIASEC) กับ "ความสามารถ/เกรด" (T-Score) ในการตัดสิน cluster | confirmed | AC-016.1 | `req-016.md` |
| REQ-013 | T-Score ของคะแนนกลุ่มสาระ (เทียบระดับประเทศ) | confirmed | AC-013.1, AC-013.2, AC-013.3 | `req-013.md` |
| REQ-014 | ผูก AI-PDF Curriculum Matching (REQ-001/REQ-002 เดิม) เข้ากับ 11 กลุ่มใหม่ | confirmed | AC-014.1, AC-014.2 | `req-014.md` |
| REQ-015 | ขอบเขต Data Model: ทำ 6-Layer Schema เต็มรูปแบบทันที เฉพาะฝั่งสายสามัญ | confirmed | AC-015.1, AC-015.2, AC-015.3 | `req-015.md` |
| REQ-017 | ต้องทำแบบทดสอบรอบสอง (REQ-007) ของสาขานั้นก่อน จึงจะ "ตั้งเป็นเป้าหมาย" ได้ | confirmed | AC-017.1, AC-017.2, AC-017.3, AC-017.4 | `req-017.md` |
| REQ-018 | ขั้นตอน "แผนพัฒนา" (Development Plan) หลังตั้งเป้าหมาย | confirmed | AC-018.1, AC-018.2, AC-018.3, AC-017.4 | `req-018.md` |
| scope.md | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม | — | `scope.md` |

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `..\index.md`
