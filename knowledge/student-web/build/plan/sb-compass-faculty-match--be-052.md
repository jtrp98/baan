# BE-052 — Read cluster results endpoint

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

endpoint อ่านผล cluster ของนักเรียน — top-3 พร้อม `CombinedScore`/`DisplayScore` (NULL ได้ตาม BE-051), `ClarityIndex`/`ClarityBand` พร้อม metadata อธิบายว่าปรับเพราะอะไร (ข้อ 6.6 บังคับ ห้ามซ่อน) — ผลที่ถูกปรับโดยไม่มีคำอธิบายคือสิ่งที่รอบนี้ปฏิเสธไปแล้ว — endpoint ต้องส่งทั้งค่าและเหตุผลการปรับไปพร้อมกัน

## References

REQ-011, AC-011.1, DES-022, DEC-022

## Scope

อ่านจากตารางของโมดูลเอง (แถวล่าสุดของรอบ) · payload ต้องแนบ metadata อธิบายการปรับเมื่อมีการปรับ · NULL ส่งเป็น NULL ไม่ใช่ 0

- Security-sensitive: yes

## Out of Scope

ตาราง/สูตรฝั่งคำนวณ (อ่านอย่างเดียว) · ลำดับ top-3 · สคีมา

## Expected Output

none

## Acceptance

AC-011.1 (ฐานอ่านผล): endpoint คืน top-3 ของรอบล่าสุดพร้อมค่าดิบ/ค่าแสดง/ข้อมูลกำกับความชัดเจนครบตามที่คำนวณไว้ — ไม่มีการตีความใหม่ที่ endpoint

## Dependencies

BE-051

## Handoff

ตรวจ AC-011.1 (ฐานอ่านผล) ด้วยการเรียก endpoint เทียบกับแถวที่ BE-049/BE-050/BE-051 เขียน (ค่า/NULL/metadata ตรงกัน) — เก็บผลเป็นหลักฐาน
endpoint อ่านใหม่ additive — revert ได้ปลอดภัย
ส่งต่อ reviewer

Back-links: `INDEX.md`
