---
owner: spec
---
# crm-ai-support — Requirement Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `business-analyst` เท่านั้น · **สถานะของ REQ อยู่ในตารางนี้เท่านั้น** · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `req-*.md` / `scope.md` ที่ packet/brief ระบุ — ห้าม ls

| REQ | ชื่อ | Status | AC ids | ไฟล์ |
|---|---|---|---|---|
| REQ-001 | 1. บันทึกเคสทันทีทุกครั้ง (ไม่มีข้อยกเว้น) | confirmed | AC-001.1, AC-001.2 | `req-001.md` |
| REQ-002 | 2. AI จำแนกประเภทเคสเป็น 4 หมวด | confirmed | AC-002.1, AC-002.2, AC-002.3 | `req-002.md` |
| REQ-003 | 2b. สูตรคะแนนลำดับความสำคัญ (priority score) — ยืนยัน 2026-08-18 | confirmed | AC-003.1, AC-003.2, AC-003.3 | `req-003.md` |
| REQ-004 | 3. กลไกบังคับความปลอดภัย (Safety override) | confirmed | AC-004.1, AC-004.2, AC-004.3 | `req-004.md` |
| REQ-005 | 4. ค้นหาข้อมูลที่เกี่ยวข้อง 3 แหล่งพร้อมกัน | confirmed | AC-005.1, AC-005.2 | `req-005.md` |
| REQ-006 | 4b. จำแนกเมนู/subsystem ที่เคสเกี่ยวข้อง (Menu classification — เพิ่มเข้ามาทีหลัง) | confirmed | AC-006.1, AC-006.2, AC-006.3 | `req-006.md` |
| REQ-007 | 4c. Backfill ข้อมูลเก่า (~70k เคส) | confirmed | AC-007.1, AC-007.2, AC-007.3 | `req-007.md` |
| REQ-008 | 5. Flow ปลายทางตามประเภทเคส | confirmed | AC-008.1, AC-008.2, AC-008.3, AC-008.4 | `req-008.md` |
| REQ-009 | 5b. รีวิวแยกทีละมิติ (per-dimension review — เพิ่มเข้ามาทีหลัง แก้จากที่เคยออกแบบเป็นการตัดสินใจเดียวทั้งเคส) | confirmed | AC-009.1, AC-009.2, AC-009.3 | `req-009.md` |
| REQ-010 | 6. แยก "เคส" กับ "เรื่อง" | confirmed | AC-010.1, AC-010.2 | `req-010.md` |
| REQ-011 | 7. กลไกเรียนรู้เบื้องหลัง — `TCrmAiSuggestion` (แก้ 2026-08-16: เต็มรูปแบบ ไม่ใช่แค่เสนอผ่าน audit log แล้ว) | confirmed | AC-011.1, AC-011.2, AC-011.3 | `req-011.md` |
| REQ-012 | 8. การแทรกคิวงานเร่งด่วน — `TCrmQueueInterrupt` | confirmed | AC-012.1, AC-012.2, AC-012.3 | `req-012.md` |
| REQ-013 | 9. แคตตาล็อกฟีเจอร์กลาง — `TCrmProductFeature` (Sales-facing) | confirmed | AC-013.1, AC-013.2, AC-013.3 | `req-013.md` |
| REQ-014 | 10. ความสัมพันธ์ระหว่างเมนู — `TCrmMenuRelation` (ปิด Open Question เดิม) | confirmed | AC-014.1, AC-014.2, AC-014.3 | `req-014.md` |
| REQ-015 | 11. บันทึกคำสัญญาลูกค้า — `TCrmCustomerPromise` (Sales-facing) | confirmed | AC-015.1, AC-015.2, AC-015.3 | `req-015.md` |
| REQ-016 | 12. บทบาทหน้าที่ — `TCrmStaffRole` | confirmed | AC-016.1, AC-016.2, AC-016.3 | `req-016.md` |
| scope.md | เนื้อหา module-level: Overview · Target Users · Release Scope · Constraints · Declined · References | พร้อม | — | `scope.md` |

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `../../INDEX.md`
