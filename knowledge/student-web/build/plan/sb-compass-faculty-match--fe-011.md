# FE-011 — Set-as-target button

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

ปุ่ม "ตั้งเป็นเป้าหมาย" — เมื่อ gate เป็นเท็จ (409/400 จาก BE-041/042) ต้อง disable/แสดงสถานะปิดใช้งานพร้อมนำทางไปหน้า RIASEC ของสาขานั้น ไม่ใช่ปิดปุ่มด้วยเงื่อนไขที่หน้าจอคิดเอง (เซิร์ฟเวอร์เป็นแหล่งความจริงเดียว) — หน้าตา/ตำแหน่งปุ่มและข้อความตอนกดยังบล็อกโดย OQ-F15 (รอ `uxui-designer` ยืนยัน) — เงื่อนไข gate คือกติกา REQ-017 ที่เซิร์ฟเวอร์เป็นผู้ตัดสิน — หน้าจอที่คิดเงื่อนไขเองจะทำให้เด็กเห็นสถานะที่ไม่ตรงกับความจริงของ gate

## References

REQ-017, AC-017.1, DES-021, DEC-021

## Scope

สถานะปุ่มมาจากผล endpoint จริง (409/400 → ปิดใช้งาน + นำทาง) · จนกว่า OQ-F15 จะปิด งานหน้าตา/ตำแหน่ง/ข้อความค้างอยู่ — logic ตอบสนอง gate ทำได้ก่อน

- Security-sensitive: yes

## Out of Scope

gate/endpoint ฝั่ง BE · เงื่อนไขที่หน้าจอคิดเอง (ห้ามมี) · หน้าจออื่น

## Expected Output

none

## Acceptance

AC-017.1 (ฝั่งแสดงผล): เมื่อ gate เป็นเท็จ หน้าจอสะท้อนสถานะปิดใช้งานและพาไปหน้า RIASEC ของสาขานั้น — สถานะมาจากเซิร์ฟเวอร์ ไม่มีเงื่อนไขที่หน้าจอตัดสินเอง

## Dependencies

BE-042

## Handoff

ตรวจ AC-017.1 (ฝั่งแสดงผล) ด้วยสถานการณ์จริง: gate เท็จ (ปุ่มปิด + นำทางถูกที่) และ gate จริง (ตั้งสำเร็จ) — เก็บผลเป็นหลักฐาน (รอ OQ-F15 สำหรับหน้าตาสุดท้าย)
หน้าจอ additive — revert ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
