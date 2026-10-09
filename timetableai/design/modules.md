# timetableai — Modules

## Modules

> DES-001 — traceability: การจัดกลุ่มต่อไปนี้สรุปจาก §4 Feature Catalog และตารางความครอบคลุมใน §33 เท่านั้น (การแบ่ง phase/task เป็นของ project-manager — ยังไม่มี plan.md)

| Module | ครอบคลุม | อ้างอิงในเอกสาร |
|---|---|---|
| Module A — ตั้งค่ากติกาของปีการศึกษา | F1–F6: settings, subject-settings, create-class-period, manage-timetable (กลุ่มครู + ครูที่ปรึกษา) | §3 Flow A, §5.2–5.5, DES-007 |
| Module B — สร้าง/จัดการตารางสอน | F7–F11: รายการตารางของปี, Generate (CP solver), ปรับมือ, บันทึก, export | §3 Flow B–D, §5.6–5.7, DES-003, DES-006 |
| Module C — ฐานรากที่ใช้ร่วมทั้งโมดูล | F12 (ปีการศึกษาเป็นศูนย์กลางการเข้าถึง) + ชั้น proxy/backend/data ที่ทุกหน้าเรียกผ่าน | §13, §25, DES-004, DES-005, DES-008 |
| **Module D — มิติภาคเรียน + การคัดลอกข้ามเทอม-ปี** *(Rev 4 — ยังไม่ implement)* | REQ-012 (เปลี่ยนหน่วยการทำงานเป็น (โรงเรียน, ปี, เทอม) ทั้งโมดูล → กระทบทุก feature ของ Module A/B/C), REQ-013 (copy กติกา/ตาราง) | §27.5, §34 (DES-009), §35 (DES-010), §13 หมายเหตุ Rev 4, D36–D37, R13–R18 · Rev 5: §35.7 (5 จุดเข้า), D45, R25 · Rev 6: §35.8 (แทนที่ทั้งหมด/บล็อก/คัดลอกบางส่วน/เลือกบางตาราง), R29 |
| **Module E — กติกาการจัดตารางชุด UI redesign Phase 2** *(Rev 5/6 — ยังไม่ implement)* | REQ-014 (บล็อก Generate), REQ-015 (continuity บังคับจริง + กลุ่มวิชา), REQ-016 (ห้องประจำวิชา + ความจุ + ครูผู้ดูแลห้องเป็นข้อบังคับ + ค่าห้องต่อปี/เทอม + นับการใช้ห้องของ `/academic`), REQ-017 (เพดานชั่วโมงเต็ม), REQ-018 (ครูประจำชั้นจำกัดห้อง) — กระทบหน้า settings/subject-settings ของ Module A (+ หน้าตั้งค่าห้องที่ตำแหน่งยังไม่กำหนด — OQ-31 ค) และ solver + validateDrop ของ Module B · ส่วน REQ-016 มี read ข้ามระบบไป Service Academic และผูก Module D (ค่าห้องต่อเทอม) | §36–§40 (DES-011–DES-015), §42 (DES-017), §27.6 (ก–ค), D38–D44, D46–D48, R20–R24, R26, R30, R31 |
| **Module F — ส่งตารางเข้า `/academic`** *(Rev 5/6 — ยังไม่ implement · cross-backend)* | REQ-019 (ปุ่ม "ใช้งานตารางสอน" → Service Academic: แทนที่ทั้งหมดต่อ (ห้องเรียน, เทอม), หลายชุดต่อครั้ง, `isActive` เป็น gate, บันทึกผลการส่ง) — บันทึกผลการส่งถูกใช้ย้อนโดย Module E (BR-56) | §41 (DES-016), §27.6 (ง), §22 หมายเหตุ Rev 5/6, D47, R19, R27, R28 |
| **Module G — ความปลอดภัยของ API** *(Rev 8/9 — ยังไม่ implement · cross-cutting)* | OQ-1/req OQ-29: Bearer JWT ของระบบ SB, tenant binding, สิทธิ์เมนูต่อหน้า (401/402/403/404/422 — §43.2a) ครอบทุก endpoint ของ backend (รวม endpoint ใหม่ของ Module D/E/F โดยอัตโนมัติ) · D17 ยอมรับชั่วคราว · (Rev 11) การแสดงเมนู Sidebar ตามสิทธิ์เดียวกัน — ไม่มีสิทธิ์ = แสดงแบบปิด (OQ-35) | §43 (DES-018), §47 (DES-022), DES-005/DES-008 หมายเหตุ Rev 8, D49, D50, D53, R32, R33 |
| **Module B (เพิ่ม Rev 8)** — ผลการ Generate | REQ-008 แจ้ง shortfall หลัง Generate (OQ-6) + REQ-002 ความเข้มข้นแบบ soft ต่อตาราง + สรุปผล (req OQ-30) | §45 (DES-020), §44 (DES-019), §27.7 (ก), D51, R34 |
| **Module H — เก็บกวาด legacy** *(Rev 8/9)* | OQ-5 / REQ-020: ลบโค้ดที่อ้าง `Tbl_TeachingSchedule` + endpoint/proxy `Schedule*` (page-old หายแล้ว) — **ไม่ DROP ตาราง/ข้อมูล** (Rev 9) | §46 (DES-021), §27.7 (ข), D52, R35 |

---


Back-links: `design\index.md`
