# BE-012 — AI-failure intake path (ai_incomplete)

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

เส้นทาง AI ล้มเหลว/ตอบไม่ครบหลัง retry ครบ 2 ครั้ง — เขียน intake ตามปกติพร้อม `ai_error` และ `analysis_status='ai_incomplete'` ห้ามเดาแทน AI ห้ามเติมค่า default ให้ครบ และห้าม error ให้ผู้ใช้ปลายทางเห็น (DES-019 §7) — ผู้ใช้เลือกทาง "ให้คนกรอกมือแทน" ไม่ใช่ "ซ่อนสาขา" — เส้นทางล้มเหลวต้องทิ้งสาขาไว้ในคิวให้คนกรอกต่อ ไม่ใช่ทำให้ import ทั้งก้อนพัง

## References

REQ-004, AC-004.1, DES-019, DEC-019

## Scope

สร้าง intake ตามปกติทุกกรณีที่ล้ม (ค่าว่างทิ้งไว้ให้คนกรอก) · ห้าม error ถึงผู้ใช้ปลายทาง · ห้ามเติมค่าแทน AI ด้วยเหตุผลใด

- Security-sensitive: yes

## Out of Scope

ลูป retry ของ BE-008 (ค่า ≤2 ครั้ง + backoff คงเดิม) · validator ของ BE-009 · สคีมา

## Expected Output

none

## Acceptance

AC-004.1: เมื่อ AI สรุปข้อมูลไม่ได้/ไม่ตอบ ระบบไม่ error ให้ผู้ใช้เห็นและไม่เดาแทน — สาขาค้างสถานะรอตรวจพร้อมช่องให้คนกรอกข้อมูลเอง (intake มี ai_error + ai_incomplete บันทึกไว้)

## Dependencies

BE-008

## Handoff

ตรวจ AC-004.1 ด้วยการจำลอง AI ล้ม/ตอบไม่ครบ (mock) แล้วตรวจ intake ที่ถูกเขียน (ai_error ครบ, ไม่มีค่าแต่งเติม) + ผู้ใช้ปลายทางไม่เห็น error — เก็บผลจำลองเป็นหลักฐาน
เส้นทางย่อยของ service — revert ได้ · intake ที่เขียนไปแล้วเป็นประวัติของคนกรอกต่อ
ส่งต่อ reviewer

Back-links: `INDEX.md`
