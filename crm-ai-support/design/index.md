# crm-ai-support — Design Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `system-analyst` เท่านั้น · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `des-*.md` / `data-model.md` ที่ packet/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · ตาราง DES ด้านล่างคือรายชื่อไฟล์ contract ทั้งหมด

## Feature-by-Feature Feasibility

| Feature / REQ | Verdict | เหตุผล / หลักฐาน (`path:line`) |
|---|---|---|
| Feature (จาก requirement.md) | สถานะ | หมายเหตุ |
| บันทึกเคสทันทีทุกครั้ง | ตรงไปตรงมา | เขียนลง `TCrmSupport` ที่มีอยู่แล้ว ไม่ต้องเปลี่ยนช่องทางรับ |
| AI จำแนก 4 หมวด + เหตุผล/ความม | ตรงไปตรงมา | เรียก Gemini ผ่าน route ใหม่ (pattern เดียวกับ `/api/v1/ai/g |
| Safety override (BUG เท่านั้น) | ตรงไปตรงมา | keyword table + เช็คก่อนเชื่อผล AI |
| ค้นหา 3 แหล่งพร้อมกัน (ความรู้ | ตรงไปตรงมา **(แก้ 2026-08-17:  | ทั้ง 3 แหล่งอยู่ใน scope เต็ม: `TCrmKnowledgeEntry` (เวอร์ชั |
| แยกเคส/เรื่อง + รวบเรื่องเดียว | ตรงไปตรงมา (คน group) + **AI เ | คน (SA) group เข้า `TCrmIssue` เองได้ตามเดิม **และ** AI เสนอ |
| Human review queue + audit log | ตรงไปตรงมา | `ReviewStatus` ใน `TCrmCaseAiAssessment` + `TCrmAiDecisionLo |
| Priority ตาม SLA (rule-based) | ตรงไปตรงมา **(ปิดแล้ว 2026-08- | สูตรยืนยันครบแล้วเป็น `SlaRuleVersion = "v2"` — น้ำหนัก seve |
| แทรกคิวงานเร่งด่วน (ต้นทุนก่อน | ตรงไปตรงมา **(แก้ 2026-08-17:  | `TCrmQueueInterrupt` อยู่ใน scope เต็ม — ดู § Queue Interrup |
| กลไกเรียนรู้เบื้องหลัง (เสนอเพ | ตรงไปตรงมา **(แก้ 2026-08-17:  | เต็มรูปแบบผ่าน `TCrmAiSuggestion` ทั้ง 5 `SuggestionType` —  |
| จำแนกเมนู/subsystem (`MenuId`) | ตรงไปตรงมา **(เพิ่มแถว 2026-08 | ส่ง catalog `TMenu` (`active=true`, 372 แถว) เข้า prompt เดี |
| รีวิวแยกทีละมิติ (เมนู/ประเภท/ | ตรงไปตรงมา **(เพิ่มแถว 2026-08 | 3 คอลัมน์ `*ReviewStatus` แยกกันอยู่แล้วตั้งแต่ Phase 1 ไม่ต |
| Backfill เคสเก่า ~70k | ตรงไปตรงมา **(เพิ่มแถว 2026-08 | ปุ่มกดเอง 100–150 เคส/ครั้ง 2 โหมดแยกเด็ดขาด (Mode A full cl |
| แคตตาล็อกฟีเจอร์กลาง (Sales-fa | ตรงไปตรงมา **(เพิ่มแถว 2026-08 | `TCrmProductFeature` — 4 สถานะ ไม่มี `AVAILABLE` (ของจริงกลา |
| ความสัมพันธ์ระหว่างเมนู (คนประ | ตรงไปตรงมา **(เพิ่มแถว 2026-08 | `TCrmMenuRelation` — `AI_SUGGESTED` เริ่ม `PENDING_REVIEW` เ |
| บันทึกคำสัญญาลูกค้า (Sales-fac | ตรงไปตรงมา **(เพิ่มแถว 2026-08 | `TCrmCustomerPromise` — **ปิดแล้ว 2026-08-18: ไม่มีสูตรคำนวณ |
| บทบาทหน้าที่ (`TCrmStaffRole`) | ตรงไปตรงมา **(เพิ่มแถว 2026-08 | ตารางข้อมูลสำหรับมอบหมายงาน/แสดงรายชื่อ **ไม่ใช่กลไกตรวจสิทธ |

## Design Contracts

| ID | ชื่อ | Traces | ไฟล์ |
|---|---|---|---|
| DES-001 | Classification & Safety Override Rules | — | `des-001.md` |
| DES-002 | Menu Classification Rules (เพิ่ม 2026-08-16) | — | `des-002.md` |
| DES-003 | Per-Dimension Review Rules (เพิ่ม 2026-08-16 — แก้จากเดิม) | — | `des-003.md` |
| DES-004 | Legacy Backfill Rules (เพิ่ม 2026-08-16) | — | `des-004.md` |
| DES-005 | SLA & Priority Score Rules (เพิ่ม 2026-08-18 — ปิด Open Ques | — | `des-005.md` |
| DES-006 | Staff Role Sync Rules (เพิ่ม 2026-08-18 — ปิด Open Question  | — | `des-006.md` |
| DES-007 | Feature Registry & Menu Relation Rules (เพิ่ม 2026-08-16) | — | `des-007.md` |
| DES-008 | AI Suggestion & Learning Loop Rules (เพิ่ม 2026-08-16) | — | `des-008.md` |
| DES-009 | Queue Interrupt Rules (เพิ่ม 2026-08-16) | — | `des-009.md` |
| DES-010 | Customer Promise Rules (เพิ่ม 2026-08-16) | — | `des-010.md` |

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
