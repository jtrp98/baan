# timetableai — Review Round 4 — UX-007

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` · run `r-20261007-214754-954d` session `s-84-e02a` (attempt 3) · วันที่ 2026-10-07 (จาก packet)

**Verdict:** PASS

| Task | Verdict |
|---|---|
| UX-007 | PASS |

ตรวจอิสระของ UX artifact ร่าง (ไม่มีโค้ด) เทียบ `plan\ux-007.md` (Scope/Acceptance/Handoff), REQ-012 AC-027, DES-009 BR-23/BR-26, §34.2 FE ข้อ 1–5, §34.4 VR-8/VR-9, §34.6, Fallback · ไม่ได้อ่าน `qa\` / `security.md` · ไม่รันอะไร

## ผลตรวจ

1. **AC-027 — ไม่มีจุด hardcode จำนวน/ชื่อเทอม ✔** แหล่งเดียว = endpoint Terms ผ่าน proxy ใหม่ (`UX-007-term-context.md:11`, ตรง BR-23 + §34.2 ข้อ 1) · แสดง `sTermNumber` ตามที่ได้รับ ไม่ localize คีย์ (:12, §34.2 ข้อ 5) · ไม่มี default "เทอม 1" — preselect ได้เฉพาะเทอมเดียวจากข้อมูลหรือที่เลือกไว้และยังอยู่ในชุดที่โหลดใหม่ (:13, :49) · ประโยคปิดตาราง route (:36) ยืนยันไม่มีเทอมนอก `TTerm`
2. **ครบ 7 routes ✔** (:26-34) — รายชื่อตรงกับที่ task อ้าง; route 6 แถบเดียวคุมทั้ง 2 tabs ที่ mount พร้อมกัน (:33); route 7 อ่านอย่างเดียว + เทอมมาทางสะพาน `localStorage` คู่ `nScheduleID`/`nYear` (:21, :34 — ตรง §34.2 ข้อ 3); route 5 กรองห้อง/plan ตามเทอม (:32 — D36)
3. **Fallback `TTerm` ว่าง / endpoint ล้ม ✔** (:45-46) — แจ้งผู้ใช้, ไม่เดาเทอม, ไม่ fallback ค่าที่จำไว้/ค่าตายตัว, ไม่มีทางสร้าง `TTerm` จากโมดูล · loading ไม่ยิง API ที่ต้องมีเทอม (:44) สอดคล้อง VR-9 · error รวม `status≠1` (:46 — §34.4 ท้าย)
4. **VR-8/VR-9 ✔** (:56-57) — ล้างเทอมค้างแล้วให้เลือกใหม่ ไม่เดาแล้ว retry · บันทึกล้มไม่โชว์ success (:58)
5. **ผลของการเปลี่ยนเทอมต่อ state ✔** (:62-65) — dialog ก่อนทิ้งงานที่ยังไม่บันทึก, reset + โหลดใหม่, ทิ้งผล request เก่า (race) · ข้อความยืนยันการบันทึกต้องระบุเทอม (:66) และส่ง flow ยืนยันเขียนทับข้ามเทอม (§35.2) ไป UX-008 — ตรง Scope "ร่วมกับ UX-008"
6. **ขอบเขต ✔** — แตะเฉพาะ `uxui\UX-007-term-context.md` (ไฟล์ใหม่) + 1 แถวใน `uxui\README.md:20` (diff numstat 1/0) · ไม่ตัดสินสัญญาเอง: กลไกค้างเทอมข้ามหน้าส่งเป็น OD-1 ให้ `system-analyst` (:86) และถือ `sTermID` เป็น string ทึบเพราะ SA-Q1 ยังเปิด (:73)
7. **Sign-off ✔** — Status `draft`, Signed by/on ว่าง, ตาราง Sign-off ว่าง (:3-4, :92-96) — agent ไม่เซ็นแทน

## Findings

### REV-004
- **Severity:** Minor → backlog
- **Task:** UX-007
- **Location:** `C:\src\schoolbright\knowledge\timetableai\uxui\UX-007-term-context.md:57` (เกี่ยวกับ :21, :34)
- **Problem:** route 7 (`manage-teaching-schedule`) ไม่มีตัวเลือกเทอม แต่ state ของ VR-8/VR-9 สั่ง "ล้างเทอมที่ค้าง กลับสถานะ no selection" ซึ่งใช้ได้เฉพาะหน้าที่มีตัวเลือก — ยังไม่ระบุว่า route 7 ทำอะไรเมื่อสะพาน `localStorage` ไม่มี `sTermID` (ค่าเก่าก่อน release / เข้าหน้าตรง) หรือได้ `TermNotInYear` · ไม่ขัด AC-027 (ไม่มีการเดาเทอม) แต่ engineer ต้องเดาพฤติกรรม เสนอ: แจ้ง + พากลับ `/timetable/[year]` และห้ามบันทึก — แก้ได้ตอนผู้ใช้เซ็น
- **Reference:** DES-009 §34.2 ข้อ 3, §34.4 VR-9, Fallback
- **Owner:** uxui-designer

## Open Findings

| ID | Severity | Location | Owner | Status |
|---|---|---|---|---|
| REV-004 | Minor | `uxui\UX-007-term-context.md:57` | uxui-designer | → backlog |

## Could not review

- เงื่อนไขเริ่ม "หลัง schema confirmation §27.5 เซ็น" (`plan\ux-007.md:15` — Waiting on Human #10): `plan\index.md` ไม่อยู่ใน readSections จึงตรวจไม่ได้ · `uxui\README.md:20` ยังระบุ schema confirmation เป็น dependency ค้าง → driver ควรยืนยันกับคนว่าประตูนี้ปิดแล้วก่อนส่งเซ็น
- ไม่ได้ตรวจกับ `design\des-004.md` §25.1–25.2 (ไม่อยู่ใน readSections) — รายชื่อ 7 routes เชื่อตาม artifact + task
- Figma (OD-5) ไม่ได้ตรวจ
- บรรทัด :7 เขียน "attempt 2" แต่ packet เป็น attempt 3 — ข้อความประวัติเท่านั้น ไม่เป็น finding

## Reviewed

- `C:\src\schoolbright\knowledge\timetableai\uxui\UX-007-term-context.md` (1-98)
- `C:\src\schoolbright\knowledge\timetableai\uxui\README.md` (grep UX-007 — :20)
- `sessions\s-83-9e09\diff.patch`
- `plan\ux-007.md` · `requirement\req-012.md` · `design\des-009.md` · `review\index.md`

Back-links: `index.md`
