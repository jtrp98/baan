# timetableai — Requirement Scope (เนื้อหา module-level)

> Budget ≤ 12 KB (`policies\documentation.md` §4) · เขียนโดย `business-analyst` · เนื้อหา module-level ทั้งหมดอยู่ที่นี่ — module `index.md` เป็นสารบัญล้วน

## Overview

Timetable AI คือโมดูลจัดตารางสอน (teaching schedule / class timetable) รายปีการศึกษาของโรงเรียนในระบบ School Bright ผู้ใช้ (ฝ่ายวิชาการ/admin โรงเรียน) กำหนด "กติกา" ของปีให้ครบ — คาบเรียน (bell schedule), เพดานการสอนของครู, กติกาวิชา, กลุ่มครู/ครูที่ปรึกษา — แล้วให้ระบบจัดตารางอัตโนมัติโดยไม่ผิดกติกา จากนั้นปรับมือได้ (ลาก/สลับ/ล็อก) และบันทึกเป็นตารางสอนของปีนั้น เปิด/ปิดใช้งานและลบได้

ข้อเท็จจริงตั้งต้นที่ยืนยันแล้วจาก code (design.md §1, §28.1): ระบบ**มีอยู่และทำงานจริงแล้ว** — เอกสารนี้จึงเป็นการ normalize ของที่มีอยู่เป็นข้อกำหนดอ้างอิง ไม่ใช่ requirement ใหม่ · ตัวจัดตารางอัตโนมัติคือ **constraint solver (Constraint Programming) ที่รันใน browser ของผู้ใช้** — ไม่มี AI/LLM/ML ฝั่ง server คำว่า "AI" เป็น positioning ของผลิตภัณฑ์ · ทุกกติกาถูกบังคับที่ **app layer เท่านั้น** (ฐานข้อมูลฝั่งโมดูลไม่มี FK/unique/check ใด ๆ)

**ขอบเขตทางกายภาพ:** 5 routes หลัก — `/timetable`, `/timetable/create-class-period`, `/timetable/manage-timetable`, `/timetable/subject-settings`, `/timetable/settings` — บวก 2 หน้าปลายทางของ flow จริง `/timetable/[year]` และ `/timetable/manage-teaching-schedule` (design.md §0) · ระบบตารางเก่า `/academic` (TSchedule + Service Academic + AI import) เป็นอีกระบบหนึ่ง (backend คนละตัว) — **ตั้งแต่ 2026-09-23 เป็นปลายทางการส่งตารางของ REQ-019** (ผู้ใช้ยืนยัน, ปิด OQ-11; design.md §41 DES-016) จึงไม่ได้อยู่นอกขอบเขตทั้งหมดอีกต่อไป · ส่วนอื่นของ `/academic` (UI/หน้าจอของระบบนั้นเอง, AI/OCR import) ยังไม่อยู่ในขอบเขตของโมดูลนี้ (design.md §22) · ความสัมพันธ์ระยะยาวของสองระบบยังเปิดอยู่ที่ OQ-7


## Target Users & Roles

- **ผู้ดูแลระบบโรงเรียน / ฝ่ายวิชาการ** — ผู้ใช้กลุ่มเดียวของโมดูล: ตั้งกติกา สร้าง/แก้ไข/จัดการตาราง ผ่านเมนู "Teaching Schedule" (การเห็นเมนูคุมจากเมนูฝั่ง server — inject เมื่อผู้ใช้อยู่กลุ่ม Academic id "22"; ฝั่ง client ไม่มีการเช็ค role — design.md §1, §10) · **target (ผู้ใช้ยืนยัน 2026-09-30 — OQ-35):** เมนูผูกกับสิทธิ์ MenuID 401/402/403/404/422 — ไม่มีสิทธิ์ = เห็นเป็น disabled (AC-064)
- **ไม่มี role แยกระดับภายในโมดูล** — ทุกคนที่เข้าถึงเมนูได้ ทำได้ทุกอย่าง (as-built, design.md §10 — การกำหนดสิทธิ์รายบทบาทเป็นคำถามเปิดของเจ้าของผลิตภัณฑ์)
- **สิทธิ์เรียก API (ตัดสินใจ 2026-09-29 — OQ-1/OQ-29, design.md DES-018)** — ทุก endpoint ของ backend ต้องมี `Authorization: Bearer` token ที่ระบบ SB ออก (verify ด้วย `token_secret` ตัวเดียวกับระบบ SB), โรงเรียนใน request ต้องตรง `NCompany` ของ token และผู้เรียกต้องมี **MenuID เฉพาะของ timetableai** — ไม่มี endpoint ยกเว้น · as-built ยังไม่มี authorization ใด ๆ (D1) จึงเป็น target · **MenuID ที่ทราบ: 401 `/timetable`, 402 `/manage-timetable`, 403 `/settings`, 404 `/create-class-period`, 401 `/timetable/[year]` (ใช้เมนูเดียวกับ `/timetable`), 422 `/subject-settings`** (ผู้ใช้ให้มา 2026-09-29) — API ของแต่ละหน้าต้องมีเมนูที่ตรงกับหน้านั้น · `/timetable/[year]` = 401 (เมนูเดียวกับ `/timetable`), 422 = `/timetable/subject-settings` · สิทธิ์อ่าน/เขียนตาม `TMenuPermission` ของ SB (OQ-29 ปิดแล้ว) · ผลกระทบ: ผู้เรียกที่ไม่มี token (รวม localhost ตอนพัฒนา) จะได้ 401 — **ผู้ใช้อนุมัติ breaking change นี้แล้ว 2026-09-29**


## Scope

### MVP (must-have)

REQ-001..REQ-011 ทั้งหมด — เป็นพฤติกรรม as-built ของโมดูลที่**มีอยู่และทำงานจริงแล้ว** เอกสารนี้ normalize ขึ้นเป็นข้อกำหนดอ้างอิง (baseline) เพื่อให้งานต่อไป (bug list, plan.md, production pipeline) มีตัวตั้งเทียบ

REQ-012 (รองรับเทอม), REQ-013 (คัดลอกกติกา/ตารางข้ามเทอม-ปี), REQ-014..REQ-019 (UI redesign — บล็อก Generate ที่ไม่ครบ, คาบต่อเนื่องบังคับจริง, ห้องเรียนประจำวิชา, เพดานครูหน่วยชั่วโมง+รายสัปดาห์บังคับ, ครูประจำชั้นจำกัดห้อง, ส่งเข้าระบบตารางสอนหลัก) — **confirmed new/amended requirements**, ยืนยันธุรกิจแล้วแต่ยังไม่ผ่านการออกแบบ schema จาก system-analyst — ห้ามเริ่ม implementation ก่อนมี design.md amendment · *สถานะ 2026-09-29 (แทนสถานะ 2026-09-28 ที่ยังเขียนว่า REQ-019 รอ OQ-12/OQ-13/OQ-18 และ REQ-014/REQ-018 รอ OQ-17 (ง) — ข้อเหล่านั้นปิดแล้ว 2026-09-28):* คำถามธุรกิจของกลุ่มนี้ **OQ-9..OQ-24 ปิดครบ** และ design.md **Rev 6** (DES-010..DES-017) ออกแบบตามคำตอบแล้ว — แต่ "ปิดคำถามธุรกิจ" ≠ "พร้อม implement": ยังมีประตูมนุษย์เปิดอยู่ ได้แก่ schema confirmation (design.md §27.6), คำถามเทคนิค/อำนาจอนุมัติ SA-Q4..SA-Q13 (design.md §21.2), คำถามธุรกิจใหม่ที่พบระหว่างออกแบบ **OQ-25..OQ-28** (เปิด — ดู `## Open Questions`), รอบ `security` และ UX sign-off — **ไม่มี REQ ใดในกลุ่มนี้ implementation-ready**

### Later (nice-to-have)

ยังไม่มีรายการ Later ที่ยืนยันแล้ว (REQ-020 เป็นงานที่ยืนยันแล้ว ไม่ใช่ Later) — ข้อเสนอเชิงเทคนิคทั้งหมด (DB transaction, unique index, shortfall UI, Web Worker, รวมกติกาเป็น module เดียว เก็บกวาด dead code) อยู่ใน design.md §32.1 ซึ่ง**ระบุเองว่ายังรอการตัดสินใจหลัง requirement interview** ห้ามยกมาเป็น requirement ก่อนเจ้าของผลิตภัณฑ์ตัดสิน (ดู `## Open Questions`)


## Constraints & Assumptions

- โมดูลทำงาน**รายปีการศึกษาเท่านั้น** ไม่รองรับภาคเรียน — โครงสร้างข้อมูลฝั่งโมดูลไม่มี term (design.md §18.3) — **as-built fact ณ 2026-09-21; อยู่ระหว่างเปลี่ยนแปลงตาม REQ-012 (ยืนยันธุรกิจแล้ว รอ system-analyst amend design.md)**
- ทุกกติกาถูกบังคับที่ app layer เท่านั้น (ฐานข้อมูลฝั่งโมดูลไม่มี FK/unique/check) — การแก้กติกาใด ๆ ต้องคงจุดบังคับเดิม ห้ามย้ายไปพึ่ง constraint ระดับฐานข้อมูลโดยไม่แก้ design ประกอบ (design.md DES-001 Fallback)
- การคำนวณทั้งหมดอยู่ฝั่ง client (browser, main thread) — backend เป็น CRUD ล้วน ไม่มี solver/AI/job ฝั่ง server (DES-005, DES-006)
- การบันทึกไม่เป็น atomic (ไม่มี DB transaction — D29) และ save ตารางแจ้งผลเท็จ (D26) — เป็นข้อเท็จจริง as-built ที่บันทึกไว้ การแก้เป็นการตัดสินใจตาม design.md §32.1 ข้อ 2–3
- **Auth (ยืนยัน 2026-09-29 — OQ-1):** ~~สมมติฐานว่ามี gateway คุม auth~~ ถูกแทนที่ด้วยการตัดสินใจ: API ของโมดูลต้องมี `[Authorize]` ด้วยวิธีเดียวกับ `BypassAcademic.aspx.cs` (JWT + `token_secret`) · ก่อนมี design + implement, backend as-built ยังไม่มี authorization ใด ๆ (D1) — **ยังเป็น blocker ก่อน production** · กลไกปิดแล้ว (OQ-29, 2026-09-29): Bearer JWT + `token_secret` เดียวกับ SB + สิทธิ์ตามเมนูและ `TMenuPermission` (MenuID 401/402/403/404/422) ไม่มี endpoint ยกเว้น · ผู้ใช้อนุมัติ breaking change 401 · *2026-10-02:* กติกาสถานะ admin/โรงเรียน (AC-071/AC-072) ขยายขอบเขต breaking เกินการอนุมัติ 2026-09-29 — **ยังไม่ได้รับทราบ (OQ-40)** · คอลัมน์และความหมาย null ของ "active"/"ถูกลบ" ยังไม่ยืนยัน (OQ-39) — ระหว่างรอ design.md ใช้คอลัมน์ที่ resolver ใช้อยู่เป็น fallback เชิงเทคนิค (สมมติฐาน — ยังไม่ยืนยัน)
- **`token_secret` (ความเสี่ยงที่ผู้ใช้รับ 2026-09-29):** SA รายงาน (D49) และผมยืนยันว่ามีคีย์ `Token_Secret` ใน `sb-api-academic-timetable-ai/AITimeTableBackend/appsettings.json` บรรทัด 13 (ไม่ได้บันทึกค่า) — ผู้ใช้ตัดสินใจ **"ปล่อยไว้แบบนี้"** ไม่ rotate/ย้ายไป secret store: ใครอ่าน repo ได้ปลอม token ของ SB ได้ · ผู้ใช้ไม่มีสิทธิ์ rotate เอง (เป็นการกระทำของเจ้าของระบบ SB) · ความเสี่ยงนี้เป็นของ DES-018 และยังต้องผ่านรอบ `security` (Critical/Important = ประตูมนุษย์)
- **`BACKEND_URL` (ตัดสินใจชั่วคราว 2026-09-29 — OQ-4):** production ชี้โดเมน dev (`dev-service-academic-timetable-ai.schoolbright.co` — D17) ต่อไปก่อน ไม่ต้องมีวิธี override ในตอนนี้ · ความเสี่ยง: production ใช้ backend/ข้อมูลของ dev · ต้องทบทวนเมื่อมี prod backend · **ข้อมูลใน DB (ผู้ใช้ยืนยัน 2026-09-30):** DB ที่โมดูลใช้อยู่ตอนนี้ (production frontend → backend dev, R32) **ไม่มีข้อมูลโรงเรียนจริง มีแต่ข้อมูลทดสอบ** · ต้องยืนยันซ้ำก่อนมีข้อมูล production (ยังไม่มีวันที่)
- **`nCourseIntensity` (ยืนยันเจตนา 2026-09-29 — OQ-2):** ต้องบังคับใช้จริง (ปัจจุบัน as-built เก็บอย่างเดียว — D12) · ระดับ 0/1/2 และสูตรหนัก/เบายืนยันแล้ว (OQ-30 ปิด 2026-09-29, design.md DES-019) · **เกณฑ์ "หนักเกิน" (ผู้ใช้ยืนยัน 2026-09-30 — OQ-34):** class-day ที่จำนวนคาบหนักเกิน ⌈คาบหนักทั้งสัปดาห์ ÷ วันที่มีคาบ⌉ ของห้องนั้น — T_c คำนวณต่อห้องเรียนจากกริดของห้องนั้นเองในตารางนั้น (ผู้ใช้ชี้แจง 2026-09-30) · `ConsecutiveHeavy` เฉพาะระดับ 2 · ระดับ 0 ไม่แสดงข้อเสนอแนะ · (design.md BR-78 ใช้เกณฑ์เดียวกันเป็นเป้าหมาย L1 ของ solver — การผูกนั้นเป็นการตีความเชิงเทคนิคของ SA) · หมวด {พื้นฐาน, เพิ่มเติม} = `TCourseGroup` (ผู้ใช้ตอบ 2026-09-29 — design.md Rev 10 SA-Q16) · ส่วน Class Continuity ยืนยันแล้วว่าต้องบังคับจริง (REQ-015, 2026-09-23)
- เอกสารนี้ครอบคลุมโมดูล timetableai (7 routes) **บวก integration ขาออกไป `/academic` ตาม REQ-019** (ส่งตารางผ่าน API ของ Service Academic — design.md §41) · ส่วนอื่นของระบบ `/academic` (หน้าจอ/ข้อมูลของระบบนั้นเอง), OCR/kruai import และ menu/notification service ยังอยู่นอกขอบเขต (design.md §22 — หมายเหตุ Rev 5)


## Declined / Not Pursuing

- ณ วันจัดทำเอกสาร (2026-09-21) **ยังไม่มีรายการที่เจ้าของผลิตภัณฑ์ปฏิเสธชัดเจนเป็นลายลักษณ์อักษร**
- สิ่งที่ระบบปัจจุบัน**ไม่มี** — publish/approve workflow, undo/redo/version history, notification, AI/OCR import ตาราง (อยู่ใน `/academic`) — เป็น**ข้อเท็จจริง as-built** ไม่ใช่การตัดสินใจทางธุรกิจ (design.md §4 หมายเหตุ, §18, §22) การปิดถาวรรายการใดต้องได้การยืนยันจากเจ้าของผลิตภัณฑ์แล้วจึงบันทึกไว้ในหัวข้อนี้
- ~~copy ตารางจากปีก่อน~~ และ ~~การรองรับภาคเรียน~~ — เดิมเป็น as-built fact ที่ระบบไม่มี แต่ผู้ใช้ยืนยันเป็น**ข้อกำหนดใหม่**แล้ว (2026-09-21) → ย้ายไป REQ-012/REQ-013 ไม่ถือเป็นรายการ declined อีกต่อไป


## References

| หัวข้อ | แหล่งที่มา | วันที่ | หมายเหตุ |
|---|---|---|---|
| ที่มาของ REQ/AC ทุกข้อ | `_docs/module/timetableai/design.md` (Rev 1–3) — DES-001–DES-008, EVD-001–EVD-024, BR-1–BR-21, D1–D35 | 2026-09-08 / 2026-09-13 | reverse-engineering จาก code จริงทั้งสองฝั่ง (backend @ `6d997a3…`, frontend @ `a2c9138…`, hash ยืนยัน 2026-09-13) ตรวจยืนยันโดย system-analyst (§33) |
| คำสั่งจัดทำเอกสาร | ผู้ใช้ (session 2026-09-21): ให้ requirement.md ทุกโมดูลตรงกับ STA 5.0.0 | 2026-09-21 | เป็นฐานให้ normalize as-built เป็น REQ ได้ — **ไม่แทนการ interview เจ้าของผลิตภัณฑ์** ตาม design.md §23 |
| ลำดับความสำคัญหลักฐาน | Source Priority (AD-12): current code & runtime behaviour อันดับ 1 | — | ใช้จัดอันดับว่า REQ นี้อ้างข้อเท็จจริงจาก code ได้ |
| UI redesign ที่มาของ REQ-014..019 | Figma board "AI Timetable to SB System" (`https://www.figma.com/design/2GIsX1uMROXVApM7tcyXNk/AI-Powered-Timetabling?node-id=5964-151249`, ~45 หน้าจอที่ตรวจ) + โค้ด frontend ที่ยังไม่ commit ใน `sb-tech-upgrade-web-system` (working tree ณ 2026-09-23, ต่อจาก commit `e7a916e`) | 2026-09-23 | Figma เป็น mockup ไม่ใช่ implementation จริง — ใช้ยืนยัน "หน้าตา/flow ที่ตั้งใจ" เท่านั้น ส่วน "พฤติกรรมต้องเป็นอย่างไร" ยืนยันจากผู้ใช้ตรง ๆ ทุกข้อ (ดู REQ-014..019) |
| ผลตรวจโค้ดของ SA ที่แก้ข้อความ REQ-014..019 และเปิด OQ-14..OQ-24 | `_docs/module/timetableai/design.md` Rev 5 — §36–§41 (DES-011..DES-016), §21.2, D38 (เพดาน/สัปดาห์ถูก backend ทิ้ง), D42 (โครงห้องค้างครึ่งทาง), D44 (`Tbl_TeacherClassAssignment` แหล่งสิทธิ์ห้องแหล่งเดียว), EVD-042..EVD-071 | 2026-09-23 | ข้อเท็จจริงจากโค้ด (backend @ `6d997a3…`, frontend @ `e7a916e…`+worktree ยังไม่ commit — volatile) · ข้อเสนอของ SA (BR-41, BR-33, M1 ฯลฯ) **ไม่ถูกนำมาเป็น requirement** จนกว่าผู้ใช้ยืนยัน |
| ผลออกแบบ SA ที่แก้ requirement drift 6 จุด และเปิด OQ-25..OQ-28 | `_docs/module/timetableai/design.md` Rev 6 — §21.2 (drift list + OQ-25..OQ-28), §35.8 (DES-010), §36–§42 (DES-011..DES-017), D46 (`TSchedule` ไม่มีคอลัมน์ห้อง), D47 (ไม่มี endpoint อ่านการใช้ห้อง), D48 (หน้าจัดการหลักสูตร/แผนมาจากเมนู server), EVD-072..EVD-083 | 2026-09-29 | ข้อเท็จจริงจาก dump/spec/โค้ด (EVD-077 เป็น `inferred` จาก spec-doc) · ข้อเสนอและ fallback ของ SA (BR-54 K=1, fallback ของ OQ-25..OQ-28, X2/T1/C2) **ไม่ถูกนำมาเป็น requirement** |
| แบบอย่างกลไก auth ของ OQ-1 | `C:\src\sb-web-academic-dev-1\jabjaiuniversity\FingerprintPayment\BypassAcademic.aspx.cs` (อ่านโดย main session) | 2026-09-29 | ผู้ใช้ระบุเป็นแบบอย่าง — สิ่งที่เห็นในไฟล์: รับ `?token=` → ถอด JWT ด้วย `JwtDecoder(verify: true)` และ `token_secret` จาก AppSettings → payload มี `user_id`/`admin_id`, `NCompany`, `Menus` (id/role/url), `IsAdmin`, `HostURL` → ตรวจโรงเรียนต้อง active และพนักงานไม่ลาออก (`WorkStatus` 2/3) → เก็บ session แล้ว redirect · **ไฟล์นี้เป็นหน้า login (ASP.NET Web Forms) ไม่ใช่ `[Authorize]` attribute** — การนำมาใช้กับ API ของ timetableai ยังไม่ได้ระบุ (OQ-29) |
| คำตอบผู้ใช้ SA-Q19 = A และ SA-Q20 (ก)(ข) + คำถามคอลัมน์ SA-Q21 (ที่มาของ AC-066..AC-072, OQ-39, OQ-40) | ผู้ใช้ตอบใน chat ส่งต่อโดย coordinator — BA ไม่ได้ถามเอง · บันทึกใน `_docs/module/timetableai/design.md` Rev 18 — DES-018 §43.2b ข้อ 1 และข้อ 4 (a)–(e), BR-74 (ข), BR-76 (ก), BR-88, Compatibility (Rev 18 — ขยายขอบเขต breaking ยังไม่มีบันทึกการอนุมัติ), §21.3 SA-Q19/SA-Q20 (ปิด), SA-Q21 (เปิด) | design.md ระบุ 2026-10-01 · BA บันทึก 2026-10-02 | BA อ่านข้อความใน design.md แล้วตรงกับที่ส่งต่อมา · ข้อเท็จจริงเรื่องคอลัมน์ (`TAdmin.*`, `TCompany.*`) มาจากการอ่าน working tree ของ Target โดย SA (`inferred`, ไม่มี sha256) — ใช้เป็นบริบทของ OQ-39 เท่านั้น ไม่ใช่ข้อยืนยัน |
| requirement drift ช่วงข้อย่อย §43.2b ข้อ 4 และคำถาม SA-Q22 (ที่มาของการแก้ย่อหน้า REQ-021 และ OQ-41) | `_docs/module/timetableai/design.md` §21.3 ย่อหน้าท้าย (requirement drift cross-ref 2026-10-02 ข้อ (1)(2)) + แถว SA-Q22 · DES-018 §43.2b ข้อ 4 (ข้อย่อย (a)–(f); ตาราง map (a)→AC-067 · (b)+(d)→AC-068 · (c)→AC-069 · (e)→AC-070 · (f) ไม่มี AC) · BR-74 (ข) · VR-20 | design.md cross-ref 2026-10-02 · BA บันทึก 2026-10-02 | BA อ่าน §43.2b ข้อ 4 และแถว SA-Q22 ใน design.md แล้ว · "(a)–(d)" ใน design เป็นกติกา "ออกพร้อมกัน" ของ Fallback ไม่ใช่การ map AC · กรณีไม่พบโรงเรียน = ทางเลือกของ SA ไม่ใช่คำตอบผู้ใช้ |
| คำตอบ OQ-41 (= SA-Q22) "A ทำตามคำแนะนำ" — ไม่พบโรงเรียนในทะเบียน = ปฏิเสธ (ที่มาของการเพิ่มกรณีใน AC-072 และกลุ่มที่สามใน OQ-40) | ผู้ใช้ตอบใน chat ส่งต่อโดย coordinator — BA ไม่ได้ถามเอง | 2026-10-02 (วันที่ของ session ไม่ใช่วันที่ผู้ใช้บอกเอง) | คำตอบเป็นการเลือกทางเลือก A ตามที่ OQ-41 นิยามไว้ · ไม่ใช่การรับทราบ breaking ของ OQ-40 |
| คำตอบ OQ-39 (= SA-Q21) — คอลัมน์ active/ถูกลบ ของโรงเรียนและ admin + ความหมายของ null: "tcompany ใช้ isactive , cdel  == false , TAdmin ใช้ active and del != true" · "null = ปกติ" · "active != false (ตามโค้ดตอนนี้)" (ที่มาของกฎใน REQ-021, AC-071, AC-072) | ผู้ใช้ตอบใน chat ผ่าน AskUserQuestion ของ orchestrator | 2026-10-02 (วันที่ผู้ใช้ให้) | กฎที่ผู้ใช้ระบุ: โรงเรียนผ่านเมื่อ `TCompany.isActive != false` และ `TCompany.cDel != true` · admin ผ่านเมื่อ `TAdmin.active != false` และ `TAdmin.del != true` · ไม่ใช้ `TAdmin.IsActive` · null = active / ไม่ถูกลบ · การตรวจข้อมูลจริง (`devops`) และยืนยัน fail-closed (`security`) ยังไม่ได้ทำ |
| คำตอบ OQ-42 (= SA-Q24): "A: ยอมรับตามที่เป็นอยู่ (Recommended)" — restore ล้ม (header + toast ไม่มีกริด) ถือว่าผ่าน AC-067 | ผู้ใช้ตอบใน chat ผ่าน AskUserQuestion ของ driver — BA ไม่ได้ถามเอง | 2026-10-04 (วันที่ผู้ใช้ให้) | ทางเลือก B (empty-state เดิม) และ C (มุมมองลดรูป + UX artifact/task ใหม่) ไม่ได้เลือก · ข้อเท็จจริงของพฤติกรรม: design.md §43.2b ข้อ 5.4 (Rev 20) |
| การรับทราบ OQ-40 — ขอบเขต breaking ที่ขยาย 3 กลุ่ม: "รับทราบทั้ง 3 กลุ่ม" | ผู้ใช้ตอบใน chat ผ่าน AskUserQuestion ของ orchestrator | 2026-10-02 (วันที่ผู้ใช้ให้) | คำถามแสดงครบทั้งสามกลุ่ม: (ก) ผู้ใช้ทั่วไปของโรงเรียนที่ไม่ active/ถูกลบ (ข) admin ที่ไม่ active/ถูกลบ (ค) ผู้ใช้ทั่วไปที่ไม่พบโรงเรียนในทะเบียน master (AC-072) |


## Change Log

- 2026-10-07 — Migrated to DES-014 split layout

Back-links: `requirement\index.md` · `..\index.md`
