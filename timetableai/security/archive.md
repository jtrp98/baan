# timetableai — Security Archive

> finding ที่ปิดแล้วเก็บ verbatim; สถานะปัจจุบันและหลักฐาน re-audit อยู่ที่ `..\security.md`

## SEC-03 — บันทึกก่อน re-audit 2026-10-09

### SEC-03 — Package vulnerability advisories (NU1904, NU1903 / BL-004)

- **Location:** `AITimeTableBackend/AITimeTableBackend.csproj:14,24`
- **Attack:** `System.Linq.Dynamic.Core` 1.2.20 มีช่องโหว่ระดับ Critical (NU1904) และ `Newtonsoft.Json` 10.0.3 มีช่องโหว่ระดับ High (NU1903 / CVE-2024-21907) แม้ในโค้ดปัจจุบันของ `timetableai` จะไม่มีการส่ง input จากภายนอกเข้า Dynamic LINQ parser โดยตรง แต่ dependency ที่มีช่องโหว่อาจถูกโจมตีผ่าน DoS หรือ vector อื่นได้
- **Fix:** อัปเกรด `Newtonsoft.Json` เป็น `>= 13.0.3` และอัปเกรด `System.Linq.Dynamic.Core` เป็นเวอร์ชันล่าสุดที่แพตช์แล้ว หรือลบ package ออกหากไม่ได้เรียกใช้จริง (ในคอนโทรลเลอร์พบเพียง using directive ที่ไม่ได้ใช้)
- **Status:** open → owner: backend-engineer · **คำตัดสินล่าสุด:** jtrp98 วันที่ 09/10/2026 เลือก 3A — ตรวจการใช้งานจริง แล้วลบ package ที่ไม่ใช้หรืออัปเกรด พร้อมทดสอบและตรวจ security ซ้ำ; ยังไม่ปิด finding จน re-audit การแก้จริง

## Change Log

- 2026-10-09 — เก็บบันทึก SEC-03 ก่อนปิดแบบ verbatim; วันที่จากผู้ใช้ jtrp98 09/10/2026

Back-links: `..\security.md`
