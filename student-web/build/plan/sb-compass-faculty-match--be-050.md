# BE-050 — ClarityIndex/ClarityBand

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

`"ClarityIndex"`/`"ClarityBand"` (สัญญา §6, OQ-F12 ปิดแล้ว): `n = "ClusterCount"` = จำนวน cluster ที่มีคะแนนจริงตามฐาน (ห้ามนับ cluster ที่ฐานหายไปทั้งหมดเป็น 0) · `MeanOwn`/`SdOwn` (population หาร n)/`GapTop` จากค่าดิบ CombinedScore เสมอ (ห้ามใช้ค่าที่ปรับแล้ว) · `n<2` → GapTop NULL, `n=0` → ทั้งสาม NULL · `ClarityIndex = 100×min(1,(W_SD×min(1,SdOwn/SD_REF)+W_GAP×min(1,GapTop/GAP_REF))/(W_SD+W_GAP))` (`SD_REF=15`, `GAP_REF=10`, `W_SD=W_GAP=1` — engineering default ปิดแล้ว) · `n<3` → ClarityIndex/ClarityBand ทั้งคู่ NULL (ห้ามแสดง 'unclear'/0) · ClarityBand: `≥CLARITY_HIGH(70)`→'clear', `≥CLARITY_LOW(40)`→'moderate', อื่น→'unclear' (ตรวจ `0<LOW<HIGH<100` ตอน start ไม่ใช่ตอนคำนวณ) — เขียนลง `TCompassStudentClusterRun` — ไม่กระทบลำดับ top-3 (ใช้ CombinedScore ดิบเสมอ) ห้ามใช้ตัดคลัสเตอร์ออกจากผล — ค่าความชัดเจนเป็นข้อมูลกำกับที่ต้องอธิบายได้ ไม่ใช่ตัวคูณเงียบ ๆ — ถ้ามันเปลี่ยนลำดับหรือถูกใช้ตัดผล ผู้ใช้จะเห็นคำตอบที่ไม่มีใครอธิบายที่มาได้

## References

REQ-012, AC-012.4, DES-022, DEC-022

## Scope

ค่าคงที่ 6 ตัวเป็น named constant แก้ที่เดียว (engineering default ที่บันทึกไว้เปิดเผย) · ตรวจเงื่อนไขค่าคงที่ตอน start · เขียนเฉพาะคอลัมน์ของตารางหัวรอบ

- Security-sensitive: yes

## Out of Scope

ค่าดิบ CombinedScore ทั้งชุด · ลำดับ top-3 · สูตรของ §7 (คนละตัวคูณ)

## Expected Output

none

## Acceptance

AC-012.4: รอบที่โปรไฟล์ชัดกับรอบที่แบนต้องไม่ถูกแสดงเหมือนกัน — ClarityIndex/Band บันทึกตามสูตร และกรณี n น้อย (ไม่มีความหมาย) ต้องเป็น NULL ไม่ใช่แถบ 'unclear' หรือ 0

## Dependencies

BE-049

## Handoff

ตรวจ AC-012.4 ด้วยชุดผลทดสอบ: กระจายกว้าง/แบน/n=0/1/2/3 — เทียบค่าทุกขั้น (ClusterCount, MeanOwn, SdOwn, GapTop, ClarityIndex, Band) กับสูตร + ตรวจว่าลำดับ top-3 ไม่เปลี่ยน — เก็บตารางเทียบเป็นหลักฐาน
เป็นขั้นคำนวณ + เขียนคอลัมน์ของตารางตัวเอง — revert ได้ · ค่าที่เขียนแล้วเป็นบันทึกของรอบ
ส่งต่อ reviewer

Back-links: `INDEX.md`
