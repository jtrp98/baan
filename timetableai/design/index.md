# timetableai — Design Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `system-analyst` เท่านั้น · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `des-*.md` / `data-model.md` ที่ packet/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · ตาราง DES ด้านล่างคือรายชื่อไฟล์ contract ทั้งหมด

## Feature-by-Feature Feasibility

| Feature / REQ | Verdict | เหตุผล / หลักฐาน (`path:line`) |
|---|---|---|
| REQ | คำวินิจฉัย | เหตุผลที่ตัดสินได้ (หลักฐาน) |
| REQ-012 รองรับเทอมทั้งโมดูล | **feasible-with-risk** | หน่วยขอบเขตเป็นคอลัมน์ `nYear` บนตารางราก + derive ผ่าน id แ |
| REQ-013 คัดลอกกติกา/ตารางข้ามเ | **feasible-with-risk · blocked | write path ใหม่ล้วน แต่ปริมาณเล็กและ backend CRUD sync (DES- |
| REQ | คำวินิจฉัย | เหตุผลที่ตัดสินได้ (หลักฐาน) |
| REQ-013 (5 จุดเข้า) | **feasible-with-risk · blocked | กติกาครบและยืนยันธุรกิจทุกข้อ (§35.8 BR-66..BR-70 — OQ-28 ปิ |
| REQ-014 บล็อก Generate | **feasible** | จุดตัดวิชาเงียบจุดเดียว (EVD-042) · แหล่งสิทธิ์ BR-41 อ่านได |
| REQ-015 คาบต่อเนื่อง + กลุ่มวิ | **feasible-with-risk** | blob เข้ากันได้ (EVD-045, EVD-046) · กลุ่มวิชาอยู่ใน blob เด |
| REQ-016 ห้อง + ความจุ + ผู้ดูแ | **feasible-with-risk (high)** | `TRoom` ไม่มีความจุ/ผู้ดูแล (EVD-072) · `TSchedule` ไม่มีคอล |
| REQ-017 เพดานชั่วโมง | **feasible-with-risk** | เวลาจริงของช่องมีอยู่แล้ว (BR-17, EVD-057) · M1 ไม่ต้อง back |
| REQ-018 ครูประจำชั้นจำกัดห้อง | **feasible-with-risk** | จุดกรองเดียว (EVD-060) · `TClassMember` อ่านได้อยู่แล้ว (EVD |
| REQ-019 ส่งเข้า `/academic` | **feasible-with-risk (high)** | upsert รายแถวแบก `calculate`/`roomId` ได้ (EVD-076) · import |
| เรื่อง | คำวินิจฉัย | เหตุผลที่ตัดสินได้ (หลักฐาน) |
| Auth ของ API (DES-018) | **feasible-with-risk (critical | ตัวถอด JWT มีแล้ว (EVD-086) · frontend ส่ง Bearer (EVD-089)  |
| REQ-002 `nCourseIntensity` (DE | **feasible** | ข้อมูลหน่วยกิต/หมวดมีแล้ว (EVD-099, EVD-100) · soft ผ่าน val |
| เมนู Sidebar ผูกสิทธิ์ (DES-02 | **feasible** | Sidebar inject เมนู 5 รายการฝั่ง client จุดเดียว (EVD-114) · |
| REQ-008 แจ้ง shortfall (DES-02 | **feasible** | shortfall/remaining มีใน solver (EVD-103..EVD-105) · ไม่มี s |
| REQ-020 ลบ legacy (DES-021) | **feasible** | ไม่มี caller (EVD-109) · page-old หายแล้ว (EVD-110) · ไม่ DR |
| `BACKEND_URL` (OQ-4) | **ยอมรับความเสี่ยงชั่วคราว** — | D17 |

## Design Contracts

| ID | ชื่อ | Traces | ไฟล์ |
|---|---|---|---|
| DES-001 | 6. Business Rules รวบรวม (ที่ code บังคับจริง) | REQ-013 | `des-001.md` |
| DES-002 | 7. Validation Rules สรุปเฉพาะที่ backend บังคับ (นอกเหนือจาก | — | `des-002.md` |
| DES-003 | 9. Status / State Transitions | — | `des-003.md` |
| DES-004 | 12. Data / Entity สำคัญ (มุมมองธุรกิจ) | REQ-012, REQ-013, REQ-014, REQ-015, REQ-016, REQ-017, REQ-018, REQ-019, REQ-012, REQ-016, REQ-017, REQ-014, REQ-019, REQ-012, REQ-012, REQ-017, REQ-018, REQ-014, REQ-014, REQ-012, REQ-013 (เพิ่ม Rev 4), REQ-013, REQ-019, REQ-017, REQ-019, REQ-019, REQ-019, REQ-019, REQ-014, REQ-013, REQ-015, REQ-016, REQ-016, REQ-019, REQ-016, REQ-013, REQ-021, REQ-002, REQ-002, REQ-012, REQ-021, REQ-002, REQ-015, REQ-019 | `des-004.md` |
| DES-005 | 26. Backend Architecture | REQ-012, REQ-012, REQ-012, REQ-016, REQ-017, REQ-018, REQ-019, REQ-014, REQ-015, REQ-015, REQ-016, REQ-013, REQ-016, REQ-013, REQ-013, REQ-017, REQ-018, REQ-019, REQ-020 | `des-005.md` |
| DES-006 | 28. Timetable Generation Architecture | — | `des-006.md` |
| DES-007 | 29. Settings → Generation Influence Map (ความสัมพันธ์ settin | — | `des-007.md` |
| DES-008 | 31. Dependency & Integration Map | REQ-012 (เปลี่ยนหน่วยการทำงานเป็น (โรงเรียน, ปี, เทอม), REQ-013 (copy กติกา/ตาราง), REQ-014 (บล็อก Generate), REQ-015 (continuity บังคับจริง + กลุ่มวิชา), REQ-016 (ห้องประจำวิชา + ความจุ + ครูผู้ดูแลห้องเป็นข้อบังคับ + ค่าห้องต่อปี/เทอม + นับการใช้ห้องของ `/academic`), REQ-017 (เพดานชั่วโมงเต็ม), REQ-018 (ครูประจำชั้นจำกัดห้อง), REQ-016, REQ-019 (ปุ่ม "ใช้งานตารางสอน" → Service Academic: แทนที่ทั้งหมดต่อ (ห้องเรียน, เทอม), REQ-008, REQ-002, REQ-020, REQ-012, REQ-013 (เพิ่ม Rev 4 — ความเสี่ยงของ *แผน* ไม่ใช่ของ code ที่มีอยู่), REQ-013, REQ-014, REQ-019, REQ-019, REQ-017, REQ-018, REQ-015, REQ-016, REQ-013, REQ-019 | `des-008.md` |
| DES-009 | 34. มิติภาคเรียน (Term Dimension) — สัญญาเป้าหมายของ REQ-012 | REQ-012, REQ-012, REQ-008, REQ-012, REQ-002, REQ-011 | `des-009.md` |
| DES-010 | 35. การคัดลอกกติกา/ตารางข้ามเทอม-ปี — สัญญาเป้าหมายของ REQ-0 | REQ-013, REQ-013, REQ-010, REQ-013, REQ-013, REQ-006, REQ-013, REQ-013 (ยืนยันหมายเหตุ Rev 5 ข้างล่าง), REQ-013, REQ-013 | `des-010.md` |
| DES-011 | 36. ตรวจความพร้อมก่อน Generate และบล็อกเมื่อพบวิชาจัดไม่ได้  | REQ-014, REQ-014, REQ-014, REQ-009, REQ-014, REQ-014, REQ-009 | `des-011.md` |
| DES-012 | 37. Class Continuity เป็น hard constraint — สัญญาเป้าหมายของ | REQ-015, REQ-014, REQ-014, REQ-015 | `des-012.md` |
| DES-013 | 38. ห้องเรียนประจำวิชา + ความจุห้อง + นับการใช้ห้องข้าม `/ac | REQ-016, REQ-013 (§35.8), REQ-016 | `des-013.md` |
| DES-014 | 39. เพดานการสอนของครูเป็นเวลาสอนจริง + เพดานรายสัปดาห์ — สัญ | REQ-017, REQ-017, REQ-017 | `des-014.md` |
| DES-015 | 40. ครูประจำชั้นสอนเฉพาะห้องที่รับผิดชอบ — สัญญาเป้าหมายของ  | REQ-018, REQ-013 (ยืนยัน OQ-20 ข — §35.8 BR-66), REQ-018 | `des-015.md` |
| DES-016 | 41. ส่งตารางสอนเข้า `/academic` (ปุ่ม "ใช้งานตารางสอน") — สั | REQ-019, REQ-007, REQ-019 | `des-016.md` |
| DES-017 | 42. กลุ่มวิชา (`subjectGroups`) ห้ามจัดชนกันเอง — สัญญาเป้าห | REQ-015 (ส่วนกลุ่มวิชา), REQ-015, REQ-015 (`subjectGroups`, ปิด OQ-21) | `des-017.md` |
| DES-018 | 43. Authentication + Authorization ของ API โมดูล (แก้ D1) —  | REQ-007, REQ-021 | `des-018.md` |
| DES-019 | 44. ความเข้มข้นการจัดตาราง (`nCourseIntensity`) แบบ soft + ส | REQ-002 (ส่วน intensity), REQ-002 (`nCourseIntensity`) | `des-019.md` |
| DES-020 | 45. แจ้งผลวิชาที่วางไม่ได้หลัง Generate (shortfall report) — | REQ-008, REQ-014 (DES-011), REQ-008, REQ-014 | `des-020.md` |
| DES-021 | 46. ลบ legacy `Tbl_TeachingSchedule` + `page-old.tsx` อย่างป | REQ-020, REQ-020 (ไม่ DROP) | `des-021.md` |
| DES-022 | 47. การแสดงเมนู Teaching Schedule ใน Sidebar ตามสิทธิ์เมนู ( | REQ-021, REQ-012 (term dimension), REQ-013 (copy), REQ-013 (5 จุดเข้า), REQ-014, REQ-019 (UI redesign Phase 2), REQ-013, REQ-019 (requirement.md 2026-09-28 — OQ-9..OQ-24), REQ-014, REQ-016 (SA-Q5/SA-Q9/SA-Q10 กับเจ้าของ school DB/Service Academic), REQ-019 (SA-Q6/SA-Q11/SA-Q12 กับเจ้าของ `/academic`), REQ-021, REQ-013, REQ-012, REQ-015, REQ-012, REQ-013, REQ-002 | `des-022.md` |

## ไฟล์อื่นในหมวดนี้

| ไฟล์ | เนื้อหา |
|---|---|
| `data-model.md` | schema contract |
| `modules.md` | feature group ภายใน delivery unit |
| `risks.md` | dependencies + risks |
| `archive.md` | Q&A ที่ปิดแล้ว + Change Log entries ที่ถูกแทน — verbatim |

## Unresolved Open Questions

| ID | คำถาม | ผู้ตอบ | Blocking? |
|---|---|---|---|

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `..\index.md`
