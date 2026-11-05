---
owner: spec
---
# timetableai — Open Questions Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `business-analyst` เท่านั้น · 1 แถว = 1 บรรทัด
> วิธีอ่าน: เปิดเฉพาะไฟล์ OQ ที่ packet ระบุ — ตารางนี้คือแหล่งรายชื่อไฟล์เดียว · ถ้อยคำคำถาม/คำตอบเต็มอยู่ในไฟล์ของแต่ละข้อ

| ID | คำถามย่อ | ผู้ตอบ | สถานะ | ไฟล์ |
|---|---|---|---|---|
| OQ-1 | Open Questions — C1′ read-only/schema reply; K=1+warning; derived subject-warning API (2026-10-11) | ผู้ใช้ / jtrp98 | answered | `oq-1.md` |
| OQ-43 | REQ-016: `TClassSetting` มี `nYear` — ตอบ: มี nYear + audit 4 คอลัมน์ (jtrp98 2026-10-11) | jtrp98 | answered | `oq-43.md` |
| OQ-44 | REQ-016: ครูผู้ดูแล 1 หรือหลายคน — ตอบ: หลายคน, ต้องเป็นครูในแผนและหลักสูตร (jtrp98 2026-10-11) | jtrp98 | answered | `oq-44.md` |
| OQ-45 | REQ-016: กติกาผู้ดูแลหลายคน (ก) อย่างน้อย 1 vs ทุกคนต้องสอน (ข) ขอบเขตครูในแผน (ค) Link Subject (ง) ผู้ดูแลไม่อยู่ในแผน — ตอบ (ก)(1) อย่างน้อย 1 คน (ข)(1) ผู้สอนในแผน/หลักสูตร ปี/เทอมเดียวกัน (ค)(1) คง Link Subject (ง)(1) ไม่นับ + เตือน (จ) ไม่มีผู้ดูแลที่นับได้ = ตามความจุ + เตือน ไม่บังคับ Link (jtrp98 2026-10-11) | jtrp98 | closed | `oq-45.md` |

## Change Log

- 2026-10-11 — OQ-45 เพิ่ม (จ) ติดตามผล: ห้องไม่มีผู้ดูแลที่นับได้ ใช้ตามความจุ + เตือน ไม่บังคับ Link (jtrp98); สถานะคง closed.
- 2026-10-11 — ปิด OQ-45 ตามคำตอบ jtrp98 (ก)(ข)(ค)(ง) = ตัวเลือก (1) ทั้งหมด; ค่าชั่วคราวเดิมกลายเป็นคำยืนยัน.
- 2026-10-11 — ปิด OQ-43 (มี nYear) / OQ-44 (ผู้ดูแลหลายคน) ตามคำตอบ jtrp98; เพิ่ม OQ-45 (การตีความกติกาผู้ดูแลหลายคน) เลขถัดจาก OQ-44.

- 2026-10-11 — เพิ่ม OQ-43 (nYear ใน TClassSetting) / OQ-44 (ผู้ดูแล 1 vs N) จากคำสั่ง jtrp98 ทะเบียนห้อง `TClass` + `TClassSetting`; เลขถัดจาก OQ-42 สูงสุดใน oq-1.md.

- 2026-10-11 — เพิ่มคำตอบ concrete SQL/read และ K=1+warning/derived subject-warning API ใน oq-1.md; ไม่มี OQ/REQ/AC renumber; SA-Q5/SA-Q10 owner facts คงเปิด.

- 2026-10-07 — แปลงเป็น split layout

- 2026-10-11 — ชี้คำตอบ jtrp98 C1′ read-only และ OQ-33 override; ประวัติ 2026-09-29 อยู่ oq-1.md; SA-Q5/SA-Q10/schema read contract ยังไม่ปิด

Back-links: `../../INDEX.md`
