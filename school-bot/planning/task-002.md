# SchoolBot — PK int4 / DBML / นายช่าง timeout

- วันที่: 2026-10-21
- ที่มา: [decisions-012.md](../requirement/decisions-012.md)
- เป้าหมาย: ปรับแบบ PK/FK เป็น int4, ส่งไฟล์ DBML เปิดใน dbdiagram.io และแก้ timeout ที่ใช้งานจริง
- ขอบเขต: แบบ/diagram และโค้ดตัวรัน นายช่าง; ไม่แก้ implementation SchoolBot หรือรัน SQL
- สถานะ: ส่ง DBML และ amend แบบตาม PK int4 แล้ว; timeout แก้และตรวจผ่าน ครบงานรอบนี้ ส่วน schema/placement ที่ยังเป็นข้อเสนอยังไม่อนุมัติให้รัน SQL หรือ implementation SchoolBot

## งานที่เปิดจริง

| Role | โหมด | รายงาน |
|---|---|---|
| SA t1 | read-only, 1800s | `C:/src/AICode/baan/baan/reports/2026-10-21-07-56-36-sa-tier-t1-1agents-6VOlid` |
| DBA t2 | read-only, 1800s | `C:/src/AICode/baan/baan/reports/2026-10-21-07-56-39-dba-tier-t2-1agents-R6uqY7` |
| BE t3 | write เฉพาะ MYCELIUM, 1800s | `C:/src/AICode/baan/baan/reports/2026-10-21-07-57-39-be-tier-t3-1agents-kKYk0U` |

BE รอบแรกอ่าน Git metadata ของ parent ไม่ได้จึง BLOCKED และยังไม่แก้ไฟล์ ผู้คุมตรวจ repository ด้วยสิทธิ์ที่ได้รับแล้วพบ clean; ต่อ session เดิมพร้อมเพิ่ม parent เข้า workspace ที่ผู้ใช้อนุญาต ผล resume เก็บ `codex.resumed.*` ไม่ลบสถานะรอบแรก

## การตรวจที่เตรียมไว้

- ตรวจ DBML ในเครื่องด้วย `@dbml/core` 10.3.1 ติดตั้งใน temporary directory ด้วย ignore-scripts ไม่เพิ่ม dependency ให้โปรเจกต์และไม่อัปโหลด schema
- ตรวจ PK/FK, ฟิลด์มาตรฐาน, references/uniqueness และความตรงกับ model หลัง SA amend
- ตัวรันต้องผ่าน npm test ตาม AGENTS.md ของ project-ai; ไม่เรียก provider จริงจาก tests
- ตรวจค่า timeout จริงและ override; workspace config เปลี่ยน 600 → 1800 แล้ว

## Change Log

- 2026-10-21 — รับ SA patch 9 ไฟล์ (NEEDS_HUMAN เฉพาะประตู implementation เดิม) และ DBA artifacts (DONE); เก็บฉบับก่อน int4 แบบ byte-for-byte ใน design/archive/2026-10-21-before-int4 ก่อน apply
- 2026-10-21 — ตรวจ @dbml/core 10.3.1 ผ่านทั้ง dbml/dbmlv2: 16 ตาราง, 243 คอลัมน์, 14 composite refs; ชื่อ fields ตรง model ครบและ PK/common columns ถูกต้อง เปลี่ยน TableGroup Note เป็น comment เพื่อรองรับ parser เก่า
- 2026-10-21 — BE resume DONE: ใช้ timeout helper เดียว, default 1800s, t0 3600s, explicit override ชนะ; role อ่าน workspace config และ invalid values ถูกปฏิเสธ ผู้คุมรัน npm test แบบปกติซ้ำเพื่อยืนยันข้อจำกัด TEMP ที่ role พบ: 85/85 ผ่าน; diff --check ผ่าน และ cache ที่ tests สร้างถูกเก็บกวาดเฉพาะ path ที่ตรวจแล้ว
- 2026-10-21 — ตรวจ installed npm junction ใช้ source ที่แก้จริง: role t1=1800, t0=3600, explicit=77 ตามค่าทดสอบ ไม่ bump version/commit/release ไม่แก้ SchoolBot source และไม่เชื่อม DB จริง
- 2026-10-21 — MYCELIUM เปิดงานตามคำสั่งผู้ใช้และบันทึกหลักฐาน role; การอนุญาตแก้ตัวรันไม่ใช่คำสั่ง commit/release

- 2026-10-23 — นายช่าง (BAAN) ปรับชื่อผู้คุมจาก MYCELIUM เป็นนายช่าง ในข้อความส่งต่อ ตามการเปลี่ยนชื่อระบบเป็น BAAN (release 0.12.0) — รายการลงวันที่เดิมที่อ้าง MYCELIUM คงไว้ตามประวัติ
