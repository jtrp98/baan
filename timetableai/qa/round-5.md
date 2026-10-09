# timetableai — QA Round 5 — UX-007

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `qa-engineer` · run `r-20261007-214754-954d` session `s-92-1e97` (attempt 3) · Phase 8 · วันที่ 2026-10-07 (จาก packet) · โหมด orchestrated — ไม่เขียน `plan\index.md`

**Status:** ✅ Verified

## Open Issues

- ไม่มี QA defect ใหม่ในรอบนี้
- REV-004 (Minor → backlog, `review\round-4.md`) ยังเปิด — route 7 ไม่ระบุพฤติกรรมเมื่อสะพาน `localStorage` ไม่มี `sTermID`/ได้ `TermNotInYear` · ไม่ขัด AC-027 · แก้ได้ตอนผู้ใช้เซ็น
- **Human gate 3:** artifact ยังเป็น `draft` ไม่มีผู้เซ็น (`uxui\UX-007-term-context.md:3-4`, `:92-96`) → FE-021 ห้ามเริ่มจนกว่าคนเซ็น (ตาม `plan\ux-007.md:37`) · OD-1..OD-5 (`:86-90`) รอผู้ตัดสิน

## Checks run

| Command | ผล |
|---|---|
| — | **not run** — task เป็น UX artifact ล้วน ไม่มีโค้ด/ไม่มี diff ใน target repo · check commands ใน `CLAUDE.md` (`npm test` ที่ `code\agent-team\`) ไม่ใช่ของ target `sb-tech-upgrade-web-system` และไม่ครอบเอกสาร |

## Per-task

| Task | ผล |
|---|---|
| UX-007 | verified |

## ผลตรวจราย AC / Handoff

| รายการ | ผล | หลักฐาน |
|---|---|---|
| AC-027 — ตัวเลือกเทอมทุกหน้าอ้าง `TTerm` ของปีนั้น, ไม่มี hardcode จำนวน/ชื่อเทอม | ✅ Verified | แหล่งเดียว = endpoint Terms (`UX-007-term-context.md:11`) · แสดง `sTermNumber` ตามที่ได้รับ ไม่ localize (:12) · ไม่มี default "เทอม 1" (:13, :49) · ไม่มีเทอมนอก `TTerm` ทุก route (:36) |
| ครอบครบ 7 routes | ✅ Verified | ตาราง :26-34 — `/timetable`, `[year]`, `settings`, `subject-settings`, `create-class-period`, `manage-timetable`, `manage-teaching-schedule` |
| กรณี `TTerm` ว่าง / endpoint ล้ม (Fallback DES-009) | ✅ Verified | :45 empty แจ้ง + ไม่มีปุ่มบันทึก, :46 error + ลองใหม่เอง ไม่ fallback ค่าที่จำ/ค่าตายตัว |
| ผลการเปลี่ยนเทอมต่อ state | ✅ Verified | :62-65 dialog งานไม่บันทึก, reset+reload, ทิ้งผล request เก่า |
| การเขียนทับเกี่ยวกับเทอมมีขั้นยืนยัน (§35.2 ร่วม UX-008) | ✅ Verified | :66 ข้อความยืนยันระบุเทอม · flow Copy ส่งไป UX-008 ตาม Scope |
| ตาราง Sign-off ท้ายไฟล์ ไม่เซ็นแทน | ✅ Verified | :92-96 ว่าง · Status `draft` (:3) |
| ทะเบียนใน `uxui\README.md` | ✅ Verified | `uxui\README.md:20` |
| เงื่อนไขเริ่ม: schema confirmation §27.5 เซ็นแล้ว | ✅ Verified | `design\data-model.md:45` "เซ็นแล้ว 2026-10-04 (ผู้ใช้)" · `plan\index.md` Waiting on Human ว่าง (:12-15) — ปิดข้อ "Could not review" ของ `review\round-4.md:41` |
| Open finding REV-004 | ⚠️ Partial (Minor → backlog — ไม่ขวาง) | `review\round-4.md:25-31` |

## Data Model check

เทียบ `design\data-model.md` กับคีย์ที่ artifact ใช้:

- `sTermID` = `TTerm.nTerm` ชนิด **string** (`data-model.md:51`, `:53`) ↔ artifact ถือ `sTermID` เป็น string ทึบ ไม่ตีความ/เรียง (`UX-007-term-context.md:73`) — ตรง
- ชื่อเทอมจาก `sTermNumber` + `dStart` ↔ `TTerm` อ่านอย่างเดียวจาก school DB (`data-model.md:21`, `:43`) — ไม่มีทางสร้าง `TTerm` จากโมดูล (artifact :45) — ตรง
- artifact ไม่ใช้ `nTermID` (ชื่อที่ schema จริงไม่รองรับ — `data-model.md:51`) — ตรง
- ไม่มี divergence

## Unverified Behaviour

- พฤติกรรมจริงของ UI ทั้งหมด — ยังไม่มีโค้ด (FE-021 pending) · ตรวจได้เฉพาะเอกสาร
- รายชื่อ 7 routes เทียบกับ `design\des-004.md` §25.1 — ไม่อยู่ใน readSections จึงไม่ได้ตรวจ (เชื่อตาม task + artifact)
- รูปแบบค่า `sTermNumber` จริง (OD-3) และตำแหน่งกับ Figma redesign (OD-5) — ต้องตรวจกับข้อมูล/ดีไซน์จริงตอนเซ็น

## 🔒 Security gate

Phase 8 มี 🔒 Security gate อยู่แล้ว (task ระบุ Security-sensitive: yes — term key เป็น untrusted input ที่ backend ต้องตรวจ VR-8/VR-9) · คงไว้ ไม่ปิด

Back-links: `index.md` · `..\plan\ux-007.md` · `..\review\round-4.md`
