# BE-048 — StddevScore fallback rules

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

fallback เมื่อ `"StddevScore"` เป็น `NULL`/`0` (สัญญา §2 กติกา 5 ข้อ): ตัดกลุ่มสาระนั้นออกจากตัวตั้งและตัวหารของ `AcademicFit(c)` ทุก cluster (ห้ามแทนค่าเดา/coverage-penalty แบบ Program Matching) · ฐานต้องเหมือนกันทั้ง 11 cluster เสมอ (ห้ามบาง cluster คิดจาก 8 กลุ่ม บางอันคิดจาก 5) · ทุกกลุ่มถูกตัดหมด → `AcademicFit` NULL ทุก cluster → ใช้ `InterestFit` แทนชั่วคราว · ทั้งสองฝั่ง NULL → แสดง "ยังประเมินไม่ได้" ห้าม error/0%/อันดับปลอม · เก็บ `NULL` กับ `0` แยกกันไม่ยุบรวม (diagnostic) — การตัดฐานไม่เท่ากันข้าม cluster ทำให้ CombinedScore เทียบข้ามกันไม่ได้และอันดับเพี้ยนแบบเงียบ — ฐานเดียวกันคือเงื่อนไขความถูกต้องของทั้งรอบ

## References

REQ-013, AC-013.2, DES-022, DEC-022

## Scope

กติกา 5 ข้อคงตามสัญญาเป๊ะ · การตัดเกิดพร้อมกันทุก cluster ในรอบเดียวกัน · ค่า NULL/0 ปฏิบัติเหมือนกันในการคำนวณแต่ต้องแยกได้ตอนอ่านจาก DB เพื่อ log วินิจฉัย

- Security-sensitive: yes

## Out of Scope

สูตร T-Score (BE-047) · กติกา coverage-penalty ของ Program Matching (คนละเรื่องโดยเจตนา — ห้ามลอก) · ตาราง sb-compass

## Expected Output

none

## Acceptance

AC-013.2 (ฐาน fallback): รอบที่ `"StddevScore"` ขาด/เป็น 0 ต้องยังให้ผลได้ถูกต้องตามกติกา — ฐานทั้ง 11 cluster เหมือนกันเสมอ และกรณีประเมินไม่ได้ต้องแสดงข้อความ ไม่ใช่ 0% หรืออันดับปลอม

## Dependencies

BE-047

## Handoff

ตรวจ AC-013.2 (ฐาน fallback) ด้วยชุดทดสอบ: ปกติ / กลุ่มเดียว NULL / หลายกลุ่ม NULL / ถูกตัดหมด / ทั้งสองฝั่ง NULL — ตรวจฐานที่ใช้เหมือนกันทุก cluster + ผลแสดงที่ถูกต้อง — เก็บผลทุกกรณีเป็นหลักฐาน
เป็นขั้นคำนวณ — revert ได้ · ค่า diagnostic ที่เก็บ (NULL แยก 0) ไม่ถูกลบโดย revert
ส่งต่อ reviewer

Back-links: `INDEX.md`
