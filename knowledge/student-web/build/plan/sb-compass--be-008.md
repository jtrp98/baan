# BE-008 — IP/internal-network allowlist in front of recompute/*

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

เพิ่มชั้นตรวจ IP/internal-network allowlist หน้า `recompute/*` (ตรวจก่อนชั้น entitlement) — อ่านรายการที่อนุญาตจาก configuration (`Web.config`/environment) เท่านั้น ห้าม hardcode; ไม่ได้ตั้งค่า = ปฏิเสธทุก request (fail-closed); ไม่ผ่าน → 404/403 โดยไม่เปิดเผยว่ามี endpoint นี้อยู่ — REQ-014 บังคับสองชั้น — ชั้น IP เป็นตัวกันไม่ให้ความผิดพลาดฝั่งการตั้งค่า SB PLUS (ผูก key ผิดแพ็กเกจ) กลายเป็นการลบข้อมูลทั้งเครือข่ายจริง (DES-016 REQ-014 ชั้นที่ 2; RISK-07)

## References

REQ-014, AC-014.1, AC-014.2, DES-016

## Scope

ชั้นนี้รันก่อนการตรวจ entitlement เสมอ — ความซ้ำซ้อนของสองชั้นคือจุดประสงค์ ห้ามตัดชั้นใดชั้นหนึ่ง ·
ค่าเริ่มต้นเมื่อไม่ได้ตั้งค่า = ปฏิเสธทุก request (ปลอดภัยแต่ใช้งานไม่ได้ จึงต้องตั้งค่า PRE-03 ก่อน deploy) ·
หมายเหตุ: task นี้เองไม่ขึ้นกับ OQ-15(a1)/(a2) — gate design-ambiguity มาจาก parity ของหัวข้อ DES-016 ทั้งหัวข้อ ไม่ใช่เงื่อนไขบล็อกของงานนี้

- Security-sensitive: yes

## Out of Scope

ห้าม hardcode รายการ IP/ช่วง network ในโค้ด; ห้ามเปลี่ยนพฤติกรรม fail-closed เมื่อไม่ได้ตั้งค่า;
ห้ามเปิดเผยการมีอยู่ของ endpoint ใน response เมื่อไม่ผ่าน (404/403 ตามที่ design กำหนด)

## Expected Output

none

## Acceptance

AC-014.1: request ที่มาจาก IP ภายในรายการอนุญาตเท่านั้นที่ผ่านชั้นนี้ไปถึงการตรวจ entitlement ของ `recompute/*`
AC-014.2: request จากนักเรียน/IP ภายนอก และกรณีที่ config ไม่ได้ตั้งค่า ต้องถูกปฏิเสธทุกกรณี (fail-closed) โดยไม่เปิดเผยว่ามี endpoint

## Dependencies

—

## Handoff

ตรวจ AC-014.1 และ AC-014.2 ด้วยกรณี: IP ในรายการ, IP นอกรายการ, config ว่าง — บันทึก status code และ response ของแต่ละกรณี;
ยืนยันลำดับการตรวจว่าชั้น IP รันก่อนชั้น entitlement; ยืนยันว่าไม่มี IP ใดถูกเขียนในโค้ด (grep หาค่าคงที่)
ถอดชั้นนี้ได้เดี่ยว แต่ต้องเหลือชั้น entitlement (BE-007) คุม `recompute/*` อย่างน้อยหนึ่งชั้นเสมอ —
การตั้งค่า PRE-03 ใน config ไม่ถูกแตะโดยการถอดโค้ด
ส่งต่อ reviewer

Back-links: `INDEX.md`
