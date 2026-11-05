---
owner: spec
---
# มติที่ 051 — อนุมัติทาง A: commit Project + Revision เป็นหน่วยเดียว และเปิดรอบแก้ F2 ของ BE-002 ใหม่

วันที่ 2026-11-02 · ผู้ตอบ: ผู้ใช้ในแชต · ผู้บันทึก: นายช่าง

## ที่มา

BE-002 S1-db-adapters ครบ rework 2/2 แล้วยัง FAIL ที่ F2 (check-094-wave2-gate-003 (memory)) · ผู้ใช้สั่งให้ arch หาจุดปรับปรุง → project-commit-proposal-001 (memory) เสนอทาง A/B/C แนะนำ A

ผู้ใช้ตอบ: "อนุมัติทาง A"

## มติ

- ใช้ **ทาง A** ตาม project-commit-proposal-001: `CommitProjectAsync` ที่ adapter + backing store · file store เป็น snapshot เดียว replace ครั้งเดียว · memory สลับ snapshot ใต้ lock เดียว · PostgreSQL transaction เดียว (ตอน DBA-003/G-CORE)
- **อนุญาตเปิดรอบแก้ F2 ใหม่ (rework 3)** เกินเพดาน 2 รอบได้ตามมตินี้ — ขอบเขตตามหัวข้อ "ขอบเขตงาน sys" ของข้อเสนอ · ถ้ารอบนี้ยัง FAIL ต้องกลับมาถามผู้ใช้ทันทีอีกครั้ง
- arch ออก delta แบบ: project-api-001 Rev2 · DES-004 Rev12 · data-contract-rules Rev11 · data-model Rev8 ไม่เปลี่ยน
- oracle ของ BE-002 S1 คงเดิม (AC-027-04/036-02/036-03/033-05 · DES-004 Rev11 · TP เดิม) + invariant 1–6 ของข้อเสนอสำหรับรอบนี้ — ไม่ขยายไป lost-update หลาย instance (backlog เดิม)

## ข้อเท็จจริงที่ปิดคำถามข้อ 2 ของข้อเสนอ (ข้อมูล file store เดิม)

ตรวจ 2026-11-02: `web/src/SchoolBot.Api/Program.cs:45` ลงทะเบียน `MemorySchoolBotBackingStore` · `FileSchoolBotBackingStore` ใช้เฉพาะใน tests · ไม่พบ `projects.json` ใน target → **ไม่มีข้อมูล file store สองไฟล์ที่ต้องนำเข้า** ไม่ต้องทำ importer/migration

## Change Log

- 2026-11-02 — ผู้ใช้อนุมัติทาง A
