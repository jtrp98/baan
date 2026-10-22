# timetableai — Test Plan Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB · 1 แถว = 1 บรรทัด

| TP | Phase | REQ/AC | ไฟล์ |
|---|---|---|---|
| TP-001 | 1 | REQ-001 / AC-001 | `tp-001.md` |
| TP-002 | 12 | REQ-017/AC-041 | `round-1.md` |
| TP-003 | 12 | REQ-018/AC-046; REQ-021/AC-060..062 | `round-1.md` |
| TP-004 | 12 | REQ-018/AC-044..046a | `round-1.md` |
| TP-005 | 10/12 | REQ-017/AC-043/043a; REQ-015/AC-037b | `round-1.md` |
| TP-006 | 10/12 | REQ-021/AC-060..062; REQ-015/AC-037b | `round-1.md` |
| TP-007 | 10/12 | REQ-015/AC-036/037b | `round-1.md` |
| TP-008 | 10/12 | REQ-015/AC-037b; REQ-018/AC-044/045 | `round-1.md` |
| TP-009 | 10/12 | REQ-015/AC-037b | `round-1.md` |
| TP-010 | 10/12 | REQ-015/AC-037b | `round-1.md` |
| TP-011 | 10 | REQ-015/AC-037b | `round-1.md` |
| TP-012 | 12 | REQ-017/AC-041/042/043a | `round-1.md` |
| TP-013 | 12 | REQ-017/AC-043b; REQ-018/AC-046a | `round-1.md` |
| TP-014 | 10/11/12 | REQ-015/AC-037b; REQ-016/AC-038..040 | `round-1.md` |

## Change Log

- 2026-10-11 — TP-004 ใช้ DES-015 §40.3a correction: VR-9 missing request term เดิม ไม่อ่าน projection; แยก valid-request legacy setting NULL fallback. ไม่รันตรวจ/ไม่เปลี่ยน approval/Status.

- 2026-10-11 — TP-004/006 เพิ่ม Settings scoped responsibility/403-only และ absence-vs-error ตาม DES-015 §40.3a; UX-009 delta signed จริง. TP IDs/rows คงเดิม; ไม่รันตรวจ.

- 2026-10-11 — เพิ่ม TP-002..014 shared cross-task/security strategy BE-013/FE-023/FE-025 ใน round-1.md; ไม่มีการรันตรวจหรือแก้ Status/legacy cases.

- 2026-10-07 — แปลงเป็น split layout

Back-links: `..\index.md`
