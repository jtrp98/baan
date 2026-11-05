# timetableai — Review Round 28 — FE-027

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

รอบนี้ไม่มี finding ใหม่ (FE-027 implementation ผ่านเกณฑ์การตรวจทั้งหมด; REV-021..REV-023 ยังคงอยู่ใน backlog)

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-021 | Minor | `…/_lib/use-select-curriculum.ts:137` | project-manager | → backlog |
| REV-022 | Minor | `…/settings/[year]/page.tsx:453` | project-manager | → backlog |
| REV-023 | Minor | `…/_lib/teaching-caps.ts:223` | project-manager | → backlog |

## Round 28

**Verdict:** PASS

| Task | Verdict |
|---|---|
| FE-027 | PASS |

ผลการตรวจสอบ FE-027 (Phase 13 Push Timetable UI & Orchestration — Direction A + Atomic T1, AC-047..AC-049, AC-052, AC-053, DES-016, UX-013, OD-1 ข):
- `Proxy Endpoint (set-academic-sync-result/route.ts)`:
  - Proxy POST ไปยัง `/WebAPI/Timetable/SetAcademicSyncResult` (BE-014) ผ่าน `proxyToBackend` ครบถ้วน
  - ส่งผ่าน session headers และ Bearer JWT อย่างปลอดภัย
- `Push Orchestration Library (academic-push.ts)`:
  - `extractClassRows`: กำหนด `calculate: true` เสมอ (AC-052), แมปวันเป็น `nPlaneDay` (Sunday=0..Saturday=6), default nulls สำหรับ attendance และ abbreviation fields ตามตาราง DES-016 §41.7 ครบถ้วน
  - `buildClassPushItems`: ตรวจสอบสถานะ `isActive` (AC-047, BR-58); ตรวจจับกรณี `ClassInMultipleTimetables` (BR-60, AC-053) เมื่อคู่ `(classId, term)` ปรากฏใน active timetables $\ge 2$ ชุด โดยทำเครื่องหมายเป็น `NotSendable` ขณะที่คู่ที่ไม่ขัดแย้งสามารถส่งได้ตามปกติ
  - `fetchPushPreview`: เรียก API Gateway `/api/gateway/service-academic/timetables/replace-by-room/preview` เพื่อคำนวณ preview การแทนที่รายห้อง
  - `executePushToAcademic`: ทำ atomic replace ต่อคู่ `(classroom, term)` ผ่าน `/api/gateway/service-academic/timetables/replace-by-room` และบันทึกผลจริงรายคู่ไปยัง `/api/timetable/set-academic-sync-result` (`nStatus = 1` สำเร็จ, `2` ถูกปฏิเสธ, `3` ล้มเหลว) โดยไม่เดาสถานะล่วงหน้า
- `Push Modal UI (push-academic-modal.tsx)`:
  - Accessible dialog (`role="dialog"`, `aria-modal="true"`)
  - ตารางพรีวิวแสดงรายการห้องเรียน จำนวนคาบ และจำนวนคาบเดิมที่จะถูกเขียนทับ
  - แบนเนอร์เตือนข้อขัดแย้ง BR-60 สำหรับคู่ที่เป็น `ClassInMultipleTimetables`
  - กล่องเตือนการเขียนทับข้อมูล (AC-049) พร้อม checkbox ยืนยันบังคับก่อนส่ง เมื่อพบคาบเดิม $> 0$
  - Progress bar (`role="progressbar"`) แสดงความคืบหน้าระหว่างส่ง
  - หน้าแสดงผลสรุปรายห้อง พร้อมปุ่ม "ส่งซ้ำเฉพาะรายการที่ล้มเหลว" สำหรับ retry เฉพาะรายการที่ failed
  - ปฏิบัติตาม OD-1 ทางเลือก (ข) โดยมีปุ่ม "เสร็จสิ้น" สำหรับปิด Modal โดยไม่ deep link ไปยัง `/academic`
- `Page Integration (timetable/[year]/page.tsx)`:
  - ระบบเลือกตารางสอนผ่าน checkbox รายแถว (`selectedTimetableIds`)
  - ปุ่ม Action bar "ใช้งานตารางสอน" เปิดใช้งานเมื่อเลือก active timetables และแสดง tooltip คำอธิบายเมื่อเลือก inactive
  - ตัวเลือก "ใช้งานตารางสอน" ในเมนูดรอปดาวน์รายแถว
  - Render `<PushAcademicModal>` เพื่อเปิด flow การส่งเมื่อผู้ใช้สั่งการ

## Reviewed

- `src/app/api/timetable/set-academic-sync-result/route.ts`
- `src/app/[locale]/timetable/[year]/_lib/academic-push.ts`
- `src/app/[locale]/timetable/[year]/_components/push-academic-modal.tsx`
- `src/app/[locale]/timetable/[year]/page.tsx`
- `tests/integration/timetable-fe027-push.test.tsx`

---
Change Log:
- 2026-10-11 — Review Round 28: FE-027 PASS (Push orchestration Direction A + atomic T1, AC-047..AC-049, AC-052, AC-053, BR-60 multi-timetable conflict, overwrite confirmation, OD-1 choice ข).
