# timetableai — QA Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `qa-engineer` · 1 แถว = 1 บรรทัด
> วิธีอ่าน: หา QA id ในตาราง Findings แล้วเปิดเฉพาะ round file ที่แถวนั้นระบุ

## Rounds

| Round | Tasks | Status | ไฟล์ |
|---|---|---|---|
| 1 | Round 1 | ✅ Verified | `round-1.md` |
| 2 | Round 2 | ✅ Verified | `round-2.md` |
| 3 | Round 3 | ✅ Verified | `round-3.md` |
| 4 | FE-014 | ✅ Verified | `round-4.md` |
| 5 | UX-007 | ✅ Verified | `round-5.md` |

## Findings

| ID | Task | Severity | ไฟล์ |
|---|---|---|---|
| QA-001 | BE-001 | Minor | `round-1.md` |
| QA-002 | BE-001 | Minor | `round-2.md` |
| QA-003 | BE-001 | Minor | `round-3.md` |
| QA-004 | FE-014 | Minor | `round-4.md` |
| QA-005 | FE-014 | Minor | `round-4.md` |

## Change Log

- 2026-10-07 — แปลงเป็น split layout
- 2026-10-07 — Round 4 (FE-014) ✅ Verified · QA-004/QA-005 Minor
- 2026-10-07 — Round 5 (UX-007) ✅ Verified · ไม่มี defect ใหม่ · รอคนเซ็น artifact ก่อน FE-021 (gate 3)

Back-links: `..\index.md`
