# sb-compass — Requirement Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `business-analyst` เท่านั้น · **สถานะของ REQ อยู่ในตารางนี้เท่านั้น** · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `req-*.md` / `scope.md` ที่ packet/brief ระบุ — ห้าม ls

| REQ | ชื่อ | Status | AC ids | ไฟล์ |
|---|---|---|---|---|
| REQ-001 | จุดแข็ง/จุดอ่อนรายวิชา (ฟรี) | confirmed | AC-001.1, AC-001.2, AC-001.3 | `req-001.md` |
| REQ-002 | ข้อความสรุปแบบ AI (ฟรี) | confirmed | AC-002.1, AC-002.2 | `req-002.md` |
| REQ-003 | คำแนะนำเชิงลึกต่อวิชาที่ควรเสริม (Premium) | confirmed | AC-003.1, AC-003.2 | `req-003.md` |
| REQ-004 | สถิติเทียบเครือข่ายทั่วประเทศ + อันดับ (Premium) | confirmed | AC-004.1, AC-004.2, AC-004.3, AC-004.4, AC-004.5 | `req-004.md` |
| REQ-005 | จัดอันดับสายการเรียนที่เหมาะ (Premium, โหมด "ยังไม่รู้ว่าจะไปสายไหน") | confirmed | AC-005.1, AC-005.2 | `req-005.md` |
| REQ-006 | Gap Report ของสายที่เลือก (Premium, โหมด "รู้แล้วว่าจะไปสายไหน") | confirmed | AC-006.1 | `req-006.md` |
| REQ-007 | แบบทดสอบบุคลิกภาพ 10 ข้อ (Premium) | confirmed | AC-007.1, AC-007.2 | `req-007.md` |
| REQ-008 | แบบฝึกหัดทดลองสาย + ตรวจให้คะแนน (Premium) | confirmed | AC-008.1, AC-008.2 | `req-008.md` |
| REQ-009 | ขอบเขตข้อมูล: ยึดตัวตนจาก session เท่านั้น | confirmed | AC-009.1, AC-009.2 | `req-009.md` |
| REQ-010 | งาน batch คำนวณสถิติเครือข่าย | confirmed | AC-010.1, AC-010.2, AC-010.3 | `req-010.md` |
| REQ-011 | ใบรับรองเส้นทางการเรียน → แยกเป็น module ต่างหาก | confirmed | AC-011.1 | `req-011.md` |
| REQ-012 | ค่าเฉลี่ยถ่วงน้ำหนักด้วยหน่วยกิต | confirmed | AC-012.1, AC-012.2, AC-012.3, AC-012.4, AC-012.5 | `req-012.md` |
| REQ-013 | ฟีเจอร์ Premium ต้องถูกกั้นสิทธิ์ที่ฝั่ง API ด้วย (must-fix รอบนี้) | confirmed | AC-013.1, AC-013.2 | `req-013.md` |
| REQ-014 | จำกัดสิทธิ์การสั่ง `recompute/national-stats` (must-fix รอบนี้) | confirmed | AC-014.1, AC-014.2 | `req-014.md` |
| REQ-015 | ปิดช่องโหว่ `SID` จาก client ให้ครบทุก endpoint (must-fix รอบนี้) | confirmed | AC-015.1, AC-015.2 | `req-015.md` |
| REQ-016 | Premium ต้องโชว์รายละเอียดระดับ "รายวิชา" เพิ่มจากระดับกลุ่มสาระ (งานใหม่ รอบนี้) | confirmed | AC-016.1, AC-016.2, AC-016.3, AC-016.4, AC-016.5, AC-016.6, AC-016.7 | `req-016.md` |
| REQ-017 | เพิ่มคอลัมน์ `stddev_score` ใน `compass_level_subject_stat` (รองรับ T-Score ของ `sb-compass-faculty-match REQ-013`) | confirmed | AC-017.1, AC-017.2, AC-017.3 | `req-017.md` |
| REQ-018 | เกณฑ์การถอด REQ-005/REQ-007 ออกจากระบบ (trigger-based ไม่ใช่วันที่ตายตัว) | confirmed | AC-018.1, AC-018.2 | `req-018.md` |
| REQ-019 | รวมหน้าจอ Analytics.cshtml + PathFinder.cshtml เป็นหน้าเดียว `MyCompass.cshtml` (page-level consolidation เท่านั้น) | confirmed | AC-019.1, AC-019.2, AC-019.3, AC-019.4, AC-016.7 | `req-019.md` |
| scope.md | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม | — | `scope.md` |

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `..\index.md`
