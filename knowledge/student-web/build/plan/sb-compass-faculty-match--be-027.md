# BE-027 — Read active RIASEC questions endpoint

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

endpoint อ่านคำถาม RIASEC active (`"IsActive"=true` เรียง `"DisplayOrder"`) ทั้งสองรูปแบบ (Likert + บล็อกเรียงลำดับ) จากตารางที่ Curriculum Service เขียน โดย ClassOnlineWeb อ่านตรงแบบ read-only ตามสัญญาความเป็นเจ้าของ — ไม่มี HTTP call ไปหา service — เด็กต้องเห็นชุดคำถามชุดเดียวกับที่คลังกำหนด และการอ่านตรงตามสัญญาทำให้หน้าเด็กไม่พังเมื่อ service ล่ม

## References

REQ-012, AC-012.3, DES-025, DEC-025, DES-018, DEC-018

## Scope

อ่านอย่างเดียว — ห้ามเขียนตารางคลัง · ระบุคอลัมน์ที่ quote ไว้เสมอ ห้าม `SELECT *` · ใช้ `NpgsqlParameter` ตาม pattern เดิม

- Security-sensitive: yes

## Out of Scope

ตารางคลังทุกตาราง (อ่านอย่างเดียวตามสัญญา) · โครงตาราง/สคีมา · ลำดับขั้นการเรียง

## Expected Output

none

## Acceptance

AC-012.3 (ฐานอ่านคำถาม): endpoint คืนคำถาม active ครบทั้งสองรูปแบบเรียงตาม display order — เป็นฐานให้แบบทดสอบแบบผสมแสดงได้จริง

## Dependencies

—

## Handoff

ตรวจ AC-012.3 (ฐานอ่านคำถาม) ด้วยการเรียก endpoint เทียบกับแถว active ในตารางจริง (ครบ/เรียงถูก/ไม่หลุดรูปแบบใด) — เก็บผลเรียกเป็นหลักฐาน
endpoint อ่านใหม่ additive — revert ได้ปลอดภัย
ส่งต่อ reviewer

Back-links: `INDEX.md`
