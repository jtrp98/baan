---
owner: spec
---
# timetableai — Requirement Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `business-analyst` เท่านั้น · **สถานะของ REQ อยู่ในตารางนี้เท่านั้น** · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `req-*.md` / `scope.md` ที่ packet/brief ระบุ — ห้าม ls

| REQ | ชื่อ | Status | AC ids | ไฟล์ |
|---|---|---|---|---|
| REQ-001 | ปีการศึกษาเป็นศูนย์กลางของโมดูล | confirmed | AC-001, AC-002 | `req-001.md` |
| REQ-002 | เงื่อนไขระบบรายปี (เพดานครู, ครูที่ปรึกษา, ความหนักตาราง) | confirmed | AC-003, AC-004, AC-054, AC-055 | `req-002.md` |
| REQ-003 | กติกาวิชา (ต่อเนื่อง + ตรึงวิชา) | confirmed | AC-005, AC-006, AC-007 | `req-003.md` |
| REQ-004 | โครงคาบเรียน (Class Period Template) | confirmed | AC-008, AC-009 | `req-004.md` |
| REQ-005 | กลุ่มครู + เวลาไม่ว่าง | confirmed | AC-010, AC-011 | `req-005.md` |
| REQ-006 | ครูที่ปรึกษาประจำระดับ/ห้อง | confirmed | AC-012 | `req-006.md` |
| REQ-007 | รายการตารางของปี + สถานะการใช้งาน + การลบ | confirmed | AC-013, AC-014 | `req-007.md` |
| REQ-008 | การจัดตารางอัตโนมัติ (CP Solver ใน browser) | confirmed | AC-015, AC-016, AC-017, AC-018, AC-056 | `req-008.md` |
| REQ-009 | การปรับตารางด้วยมือ (ทุกการกระทำผ่านกติกา) | confirmed | AC-019, AC-020, AC-021, AC-057 | `req-009.md` |
| REQ-010 | การบันทึกและ restore ตาราง (snapshot) | confirmed | AC-022, AC-023, AC-024 | `req-010.md` |
| REQ-011 | มุมมอง การกรอง และการส่งออก | confirmed | AC-025 | `req-011.md` |
| REQ-012 | รองรับภาคเรียน (Term) ทั้งโมดูล — **New requirement (ยืนยันธุรกิจแล้ว 2026-09-21 — ยังไม่ผ่านการออกแบบ schema)** | confirmed | AC-065, AC-026, AC-027, AC-028 | `req-012.md` |
| REQ-013 | คัดลอกกติกา/ตารางไปยังเทอม-ปีที่ต้องการ — **New requirement (ยืนยันธุรกิจแล้ว 2026-09-21 — ยังไม่ผ่านการออกแบบ schema, ขึ้นกับ REQ-012)** | confirmed | AC-046, AC-029, AC-030, AC-031, AC-032, AC-050, AC-051 | `req-013.md` |
| REQ-014 | ..REQ-019 — UI Redesign (Figma "AI Timetable to SB System" Phase 2) — **ยืนยันธุรกิจแล้ว 2026-09-23** | confirmed | — | `req-014.md` |
| REQ-014 | บล็อกการ Generate เมื่อพบวิชาไม่มีครู/โควตา 0 (แก้ REQ-008) | confirmed | AC-016, AC-033, AC-034, AC-035, AC-046, AC-045 | `req-014.md` |
| REQ-015 | วิชาคาบต่อเนื่อง (Class Continuity) เป็น hard constraint บังคับจริง (แก้ REQ-003(a), ปิด OQ-2 **บางส่วน — เฉพาะ Class Continuity**; ส่วน `nCourseIntensity` ของ OQ-2 ยังเปิด) | confirmed | AC-007, AC-019, AC-036, AC-037 | `req-015.md` |
| REQ-016 | ห้องเรียนประจำวิชา (ทะเบียน `TClass`) + capacity/ครูผู้ดูแลรายปี/เทอมใน `TClassSetting` School DB อ่านอย่างเดียว (jtrp98 2026-10-11; OQ-43/44 ปิด — มี nYear, ผู้ดูแลหลายคน; OQ-45 ปิด — อย่างน้อย 1 ผู้ดูแลสอน, คง Link Subject) | confirmed | AC-038, AC-039, AC-019, AC-040 | `req-016.md` |
| REQ-017 | เพดานการสอนของครู: หน่วยเป็นชั่วโมงจริง + เพดานรายสัปดาห์เป็น hard constraint (แก้ REQ-002) | confirmed | AC-041, AC-042, AC-003, AC-043 | `req-017.md` |
| REQ-018 | ครูประจำชั้นสอนเฉพาะห้องที่รับผิดชอบ (Homeroom-restricted Teaching) — แก้ REQ-006 | confirmed | AC-044, AC-045, AC-046 | `req-018.md` |
| REQ-019 | ส่งตารางสอนเข้าระบบตารางสอนหลักของ SB System (ปุ่ม "ใช้งานตารางสอน") — **ใหม่** | confirmed | AC-031, AC-049, AC-047, AC-048, AC-052, AC-053, AC-039 | `req-019.md` |
| REQ-020 | ลบระบบตารางสอนเก่า (Legacy Removal) | confirmed | AC-058, AC-059 | `req-020.md` |
| REQ-021 | การยืนยันตัวตนและสิทธิ์เรียก API (API Authentication & Authorization) | confirmed | AC-060, AC-061, AC-062, AC-063, AC-064, AC-066, AC-067, AC-068, AC-069, AC-070, AC-071, AC-072 | `req-021.md` |
| scope.md | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม | — | `scope.md` |

## Change Log

- 2026-10-11 — REQ-016 ปิด OQ-45 (jtrp98): กติกาผู้ดูแลหลายคน + AC-038a; status/AC IDs คงเดิม.
- 2026-10-11 — REQ-016 ปิด OQ-43/44 (มี nYear; ผู้ดูแลหลายคน ต้องเป็นครูในแผนและหลักสูตร), เปิด OQ-45; status/AC IDs คงเดิม.
- 2026-10-11 — REQ-016 ทะเบียนห้อง `TRoom` → `TClass`, ที่เก็บค่าห้อง → `TClassSetting` (jtrp98); status/AC IDs คงเดิม; OQ-43/44 เปิด.

- 2026-10-11 — REQ-015/016 normalize คำตอบเพิ่มเติม jtrp98: derived warning API, C1′ read/schema ส่ง SA และ K=1+warning; REQ statuses/AC IDs/scope คงเดิม.

- 2026-10-07 — ตัด AC ซ้ำซ้อนใน REQ-021 ให้ตรงกับ req-021.md
- 2026-10-07 — แปลงเป็น split layout (DES-014)

- 2026-10-11 — amend REQ-013/REQ-016 ตาม jtrp98: C1′ read-only/ไม่ copy ค่าห้อง; คง confirmed และ REQ/AC IDs เดิม; ส่งต่อ SA amend contracts

Back-links: `../../INDEX.md`
