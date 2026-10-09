# timetableai — Risks & Dependencies

## Risks & Dependencies

**32. Architecture Risks (จากหลักฐาน Current Architecture เท่านั้น)**

> Dependencies ของโมดูลอยู่ที่ §14 และ DES-008 — หัวข้อนี้ครอบคลุมฝั่งความเสี่ยง (R1–R12) และข้อเสนอแนะ 32.1 ที่ยังรอการตัดสินใจ

| # | Risk | หลักฐาน | ผลกระทบ |
|---|---|---|---|
| R1 | **Security boundary ไม่มีจริงใน app layer** — endpoint เชื่อ id จาก client, CORS เปิดหมด, secrets commit ใน repo | D1, D28 | ถ้าไม่มี gateway คุมจริง = อ่าน/เขียนข้ามโรงเรียนได้ (`Needs Confirmation` §21.1) |
| R2 | **Write ไม่ atomic + ไม่มี unique index** | D29, D11, D31 | ข้อมูลครึ่งก้อน/แถวซ้ำ — โดยเฉพาะ full-replace กติกาวิชา และบันทึกตาราง (พ่อ save แล้วลูกพัง) |
| R3 | **Save ตารางแจ้งผลเท็จ** | D26 | งานหายทั้งชุดทั้งที่ผู้ใช้เห็น "สำเร็จ" — ความเสี่ยงธุรกิจสูงสุดฝั่ง UX |
| R4 | **Compute ทั้งหมดบน client main thread** (yield แต่ไม่มี Worker) | §28.2 | ตารางใหญ่/เครื่องอ่อน = ช้า/กระตุก — เพดานขนาดโรงเรียนผูกกับเครื่องผู้ใช้ |
| R5 | **กติกา duplicate หลายชั้น** (solver / validateDrop / grid) + logic เล็กซ้ำกระจาย | §25.3 | แก้กติกาเดียวต้องแก้หลายไฟล์พร้อมกัน — เสี่ยงกติกาเหลื่อมกัน |
| R6 | **ค่าที่ผู้ใช้ตั้งแต่ไม่มีผล** (continuity, intensity) | D12 | ผู้ใช้เชื่อว่าระบบบังคับ — ตารางออกมาไม่ตรงความคาดหวัง |
| R7 | **ไม่มีตรวจความครบก่อนบันทึก + ตารางเก่าไม่ re-validate** เมื่อกติกา/ข้อมูลหลังเปลี่ยน | §28.4, §29 | ตารางเสียเงียบ ๆ — ไม่มีกลไกใดรู้ |
| R8 | **Response contract ไม่สม่ำเสมอ** (เมิน status / เช็คไม่ครบ / รูปแบบพิเศษ) ทั้งสองฝั่ง | D5, D14, D15, D26 | จุดผิดพลาดเงียบกระจายทั้งระบบ |
| R9 | **ชั้น proxy เปราะ** — ไม่มี timeout, TLS verify ปิด, URL dev hardcoded | D27, D19, D17 | call ค้าง / ต่อ production ผิด environment |
| R10 | **Performance ข้อมูล** — เปิดหน้า generate = อ่านตารางทั้งปีเป็น jsonb ทั้งก้อน + ไม่มี index บนเนื้อใน jsonb | §13, §18.8 | ยิ่งห้อง/ตารางเยอะ ยิ่งช้าทั้งโหลดและ solve |
| R11 | Backend instance sync-EF ไม่มี cache — throughput จำกัด | D35 | โดเมนนี้ผู้ใช้น้อย — ผลกระทบต่ำ-กลาง |
| R12 | **Maintainability: dead stack สืบทอด** (OBS, MasterDB, Messages, Schedule/Schedules legacy, greedy solver, page-old) | D21-D23, D32, D33, §26.2 | เข้าใจผิด/ต่อยอดผิด endpoint ได้ง่าย (พิสูจน์แล้วจาก D21, D23) |

**32.2 ความเสี่ยงของงาน REQ-012 / REQ-013 (เพิ่ม Rev 4 — ความเสี่ยงของ *แผน* ไม่ใช่ของ code ที่มีอยู่):**

| # | Risk | หลักฐาน / ที่มา | ผลกระทบ · การลด |
|---|---|---|---|
| R13 | **ชนิดคีย์เทอมผิด** — ถ้า implement เป็น `nTermID int` ตามที่หมายเหตุ requirement.md สมมติ จะ join `TTerm` (PK เป็น string) ไม่ติด | EVD-025 (Models/TTerm.cs:16), EVD-026 (:143 คืน `sTermID` เป็น string) | คืนค่าว่าง/รายการเทอมหายเงียบ ๆ ไม่มี error · ลด: ปิด SA-Q1 ก่อน implement |
| R14 | **Blast radius กว้าง + ไม่มีอะไรจับความผิด** — ต้องเติม filter เทอมทุกจุดอ่าน/เขียนใน 2 repo รวมชุด conflict data ของ solver ขณะที่กติกาถูก implement ซ้ำหลายชั้นอยู่แล้ว (R5) และฐานข้อมูล **ไม่มี FK/unique/check** ให้จับ | §25.3, DES-001 Fallback, §27.4 | ลืมจุดเดียว = ข้อมูลข้ามเทอมเงียบ ๆ = AC-026 fail โดยไม่มีสัญญาณ · ลด: ทำรายการจุดอ่าน/เขียนให้ครบใน §34.2 และให้ test-planner คุมด้วยเคสข้ามเทอมโดยเฉพาะ |
| R15 | **แถวซ้ำมากขึ้นตามจำนวนเทอม** — `Tbl_Setting` ไม่มี unique index (D11) และจะมี 1 แถวต่อ (school, year, term) | D11, §27.5 (ง) | setting ซ้ำ → generator อ่านแถวผิด · ลด: ทำ unique index พร้อมรอบเดียวกัน |
| R16 | **Migration ไม่มีเครื่องมือรองรับ** — ไม่มี EF Migrations, DDL เป็น SQL มือ, และ backfill ต้องข้าม 2 host จึง join ใน SQL ไม่ได้ | §27.4, EVD-032 | backfill ผิด/ไม่ครบ = ข้อมูลกำพร้า (AC-028 fail) · ลด: ลำดับ 5 ขั้นใน §27.5 (จ) + รายงานให้คนอ่านก่อนขั้นถัดไป |
| R17 | **copy ไม่เป็น atomic** — ไม่มี transaction ทั้ง repo (D29) และ pattern การ save ที่มีอยู่แจ้งผลเท็จ (D26) | D29, D26 | ชุดกติกาถูกคัดลอกครึ่งเดียวโดยผู้ใช้เห็นว่า "สำเร็จ" · ลด: §35.3 บังคับ transaction ใน write path ใหม่ + frontend ต้องอ่าน `status` |
| R18 | **id ของ school DB ไม่ portable ข้ามเทอม/ปี** — ห้องเรียนเป็นแถวต่อเทอม (`TTermSubLevel2.nTerm`) และหลักสูตรผูกปี (`TCurriculum.nYear`) | EVD-030, WebAPIController.cs:434, D36 | copy ตรง ๆ = ตารางปลายทางชี้ห้องของเทอมต้นทาง · ลด: §35.4 map ด้วย natural key + รายงานที่จับคู่ไม่ได้ (รอ OQ-10) |

> **§32.1 ข้อ 3 (transaction + unique index) เปลี่ยนสถานะเฉพาะจุด:** ยังเป็น "ข้อเสนอ" สำหรับ write path เดิมทั้งหมด แต่**กลายเป็นข้อบังคับภายในสัญญาใหม่ DES-010 เท่านั้น** (write path ใหม่ที่ยังไม่มีใครเรียก จึงไม่เปลี่ยนพฤติกรรมของเดิม) — ข้ออื่นใน §32.1 ยังรอการตัดสินใจตามเดิม

**32.3 ความเสี่ยงของงาน Rev 5 (REQ-013 ฉบับแก้, REQ-014..REQ-019 — ความเสี่ยงของ *แผน* ไม่ใช่ของ code ที่มีอยู่):**

| # | Risk | หลักฐาน / ที่มา | ผลกระทบ · การลด |
|---|---|---|---|
| R19 | **REQ-019 เขียนข้ามระบบเข้า `/academic` โดยไม่มี transaction ร่วม** — `/academic` เป็นต้นทางเวลาเข้าเรียน/สาย และ Service Academic เพิ่งเปลี่ยน route/field แบบ breaking 2 รอบ (spec changelog 17/8/2569) · Rev 6: ธุรกิจยืนยัน "แทนที่ทั้งหมด" รวมแถวที่คนสร้างเองใน `/academic` | EVD-064, EVD-067, EVD-068, EVD-076..EVD-078 | ส่งครึ่งชุด / ข้อมูลที่คนสร้างใน `/academic` หาย (โดยเจตนาที่ยืนยันแล้ว) / กระทบการเช็คชื่อ · ลด: BR-48 ผลรายห้องเรียน, BR-61 Preview→Confirm→Apply ทุกครั้ง, §41.4 (T1 หรือ T2 — ห้าม T3), บันทึกผลการส่ง, SA-Q6/SA-Q11/SA-Q12 ยืนยันกับเจ้าของ, รอบ `security` |
| R20 | **REQ-017 เปลี่ยนหน่วยของ hard constraint หลักใน 2 ชั้นที่ implement ซ้ำกัน** (solver + validateDrop — R5) · Rev 6: M1 ยืนยันแล้ว = เพดานเดิมทุกโรงเรียนหมดผลที่ cutover | EVD-056, EVD-057, D38–D40 | ผสมหน่วยในรุ่นเดียว = ตารางผิดกติกาเงียบ ๆ; ผู้ใช้ไม่รู้ว่าเพดานหาย = ตารางหลัง cutover ไม่มีเพดาน · ลด: ฟังก์ชันเพดานตัวเดียวใช้ทั้ง 2 ชั้น, cutover รุ่นเดียว (SA-Q8), รายงาน (โรงเรียน, ปี) ที่เคยตั้งเพดานเพื่อสื่อสารก่อน deploy |
| R21 | **สุญญากาศสิทธิ์สอนจาก REQ-018** — แหล่งสิทธิ์ห้องแหล่งเดียวถูกยกเลิกโดยไม่ migrate (AC-046a) · Rev 6: แหล่งแทน BR-41 ยืนยันแล้ว — ความเสี่ยงเหลือที่ลำดับการออกรุ่น | EVD-058, EVD-060, D44 | ทุกวิชาถูกบล็อก (คู่กับ DES-011) ถ้าตัดของเดิมก่อน BR-41 ทำงาน · ครูได้สิทธิ์กว้างขึ้น (ทุกห้องของแผน) จนกว่าตั้ง flag — ผลที่ธุรกิจยืนยัน · ลด: ห้ามตัดแหล่งเดิมก่อนแหล่งใหม่ทำงาน (DES-015 Fallback), DES-015 ก่อน/พร้อม DES-011 (SA-Q8) |
| R22 | **REQ-015 เปลี่ยนโมเดล solver จาก "ช่อง" เป็น "บล็อก"** บน main thread ที่มีงบ backtrack คงที่ (R4) · Rev 6: ห้ามข้ามพัก + เพดานต่อเนื่องครูชนะ ทำให้ domain ของบล็อกแคบลง | §28.2, DES-006 Fallback | shortfall เพิ่ม/ช้าลง; บาง config จัดไม่ได้เลย · ลด: คำเตือน config ก่อน Generate (BR-53), วัดผลกับข้อมูลโรงเรียนจริงก่อนปรับงบ |
| R23 | **REQ-016 เพิ่มมิติ conflict แบบนับความจุ ข้ามตาราง + ข้ามระบบ** + ชนิด id ห้องเดิมไม่ตรง + schema `TRoom` รู้จากเพียง dump ที่ล้าสมัย | D42, D24, D46, EVD-049, EVD-072 | conflict data ใหญ่ขึ้น (R10); การนับพร้อมกันต้อง sweep เวลาจริง (ช่วงทับกันบางส่วนข้าม template); เทียบ id ผิดชนิดคืนว่างเงียบ · ลด: key `sRoomID` string (§27.6 ก), ฟังก์ชัน `canUseRoom` ตัวเดียว (§38.3), SA-Q5 |
| R24 | **งาน frontend ที่ยังไม่ commit นำหน้าสัญญา** — UI ส่งฟิลด์ที่ backend ทิ้ง, ป้ายหน่วยไม่ตรงการบังคับ, panel/modal เป็น mock, กติกาจาก tooltip | D38–D43, D45 | ถูก merge ในสภาพ "หน้าจอเสร็จ" ทั้งที่กติกาไม่ทำงาน — ผู้ใช้เชื่อว่าระบบบังคับ (รูปแบบเดียวกับ R6) · ลด: SA-Q8, `qa-engineer` ตรวจกับสัญญา §36–§41 ไม่ใช่กับหน้าจอ |
| R25 | **คัดลอกรายเมนู (REQ-013 ฉบับแก้) ทำให้ id อ้างลอย / ทับคอลัมน์ของอีกเมนู** — `Tbl_Setting` แถวเดียวถือ 2 เมนู; link subject และกลุ่มครูผูก template | §35.7, EVD-039 | ปลายทางมีกติกาที่ชี้ template ที่ไม่มี → Generate เพี้ยนเงียบ · ลด: partial-column update, รายงานใน Preview, Rev 6: template ที่อ้างหาย = บล็อกทั้งหมด (BR-67 — ยืนยันธุรกิจ) |
| R26 | **การนับห้องพึ่งระบบอื่นแบบสด** — ความพร้อมของ Service Academic (maintenance 503) และสัญญาที่เปลี่ยนแบบ breaking กลายเป็นเงื่อนไขของการ Generate | D46, D47, EVD-074 | `/academic` ล่ม = Generate ไม่ได้และวางมือวิชาที่มีห้องไม่ได้ (BR-57 fail-closed) · ลด: endpoint เดียวต่อเทอม (X2), ข้อความเหตุผลชัด, วิชาไม่มีห้องยังวางมือได้, SA-Q10 |
| R27 | **นับการใช้ห้องซ้ำกับสำเนาของตัวเองใน `/academic`** หลังส่งตาราง (REQ-019) | BR-56, §41.4 | ห้อง K=1 วางวิชานั้นไม่ได้อีกเลย / ความจุเต็มเท็จ · ลด: บันทึก `scheduleId` ที่ส่ง + ตัดออกตาม BR-56; บันทึกผลล้มเหลว → นับเข้ม ไม่หละหลวม · ต้องออก DES-016 (บันทึกผล) ก่อน/พร้อม DES-013 ส่วน (ค) (SA-Q8) |
| R28 | **"แทนที่ทั้งหมด" ใน `/academic` ไม่ atomic บน API ที่มีวันนี้** | EVD-076..EVD-078, D47 | T2 ค้างครึ่งทาง = แถวเก่า+ใหม่ซ้อนกันชั่วคราว (การเช็คชื่อ/รายงานของห้องเรียนนั้นเพี้ยนจนส่งซ้ำ) · ลด: T1 (ต้องมีเจ้าของสร้าง), ไม่งั้น T2 ที่ลู่เข้า + สถานะ `Partial` ชัดเจน, **ห้าม T3**, SA-Q12 |
| R29 | **คัดลอกรายเมนูแบบแทนที่ทั้งหมด ทำให้ของปลายทางนอก scope อ้าง template ที่ถูกลบ** — ระบบไม่มีการกันลบ template ที่ถูกใช้ (§5.4) | §35.8 BR-70 | ปลายทางมีกลุ่มครู/link/ตารางที่ชี้ template ที่ไม่มี · ลด: **บล็อก `DependentsWouldBeOrphaned` (ยืนยันธุรกิจ OQ-28 ก — 2026-09-29)** · ความเสี่ยงที่เหลือเป็นภาระผู้ใช้: ต้องแก้/ลบ dependents ที่ปลายทางก่อนคัดลอกโครงคาบเรียน — Preview ต้องแสดง `lstDependents` ครบพร้อมชื่อ (งาน UX) |
| R30 | **กลุ่มวิชาเป็น hard constraint ข้ามห้องเรียนและข้ามตาราง (G2)** เพิ่มความหนาแน่นของข้อบังคับบน solver งบคงที่ (R4, R22) และต้องมีรหัสวิชา+ครูของทุกตารางที่บันทึกแล้วของปีใน conflict data | DES-017, OQ-25 (ปิด) | shortfall เพิ่ม; conflict data ใหญ่ขึ้น (R10) · ลด: G เป็นพารามิเตอร์เดียวของชุดข้อมูลที่โหลด (BR-63), ข้อยกเว้นรหัสเดียวกัน-ครูต่างกัน (BR-64), กลุ่ม Link Subject นับเป็นการวางเดียว (BR-65), วัดผลกับข้อมูลโรงเรียนจริงก่อนปรับงบ |
| R31 | **ครูผู้ดูแลห้องเป็นตัวกรองสิทธิ์สอน + ค่าห้องต่อ (ปี, เทอม)** — วิชาที่ map กับห้องที่มีผู้ดูแลเหลือผู้สอนได้คนเดียว · ครูหนึ่งคนสอนหลายห้องเรียนพร้อมกันได้เฉพาะใน Link Subject (BR-11) → ความจุ ≥ 2 ใช้พร้อมกันในโมดูลได้เฉพาะผ่าน link · ทุกเทอม/ปีใหม่เริ่มโดยไม่มีค่าห้อง และยังไม่มีจุดคัดลอก | BR-71, BR-54, §27.6 ก2, OQ-31 | Generate ถูกบล็อกเพิ่ม (`NoEligibleTeacher` เมื่อผู้ดูแลไม่อยู่ใน `TPlanCourseTeacher` หรือถูกจำกัดห้อง) · shortfall เพิ่ม (ผู้ดูแลคนเดียวแบกทุกคาบของห้อง ภายใต้เพดาน DES-014) · ความจุที่ตั้ง ≥ 2 ไม่มีผลนอก link · เทอมใหม่กลับเป็น K = 1 / ไม่มีผู้ดูแลเงียบ ๆ · ลด: ตัวกรองอยู่ในจุด eligibility เดียว (DES-015 §40.3), เหตุ `sDetail: RoomCaretaker` + คำเตือน `RoomSettingMissing` (DES-011), คำเตือนตอนบันทึก `CaretakerNotTeachingMappedSubject`, OQ-31 (ก)(ข)(ค) |

**32.4 ความเสี่ยงของงาน Rev 8 (DES-018..DES-021, OQ-4, OQ-8):**

| # | Risk | หลักฐาน / ที่มา | ผลกระทบ · การลด |
|---|---|---|---|
| R32 | **ความเสี่ยงที่ยอมรับชั่วคราว (OQ-4 — ตัดสินใจ 2026-09-29): production ใช้ backend + ฐานข้อมูลของ dev** (D17) | D17, requirement.md Constraints | ข้อมูลโรงเรียนจริงอยู่ในสภาพแวดล้อม dev; การ deploy/ทดสอบบน dev กระทบผู้ใช้จริง; เมื่อ DES-018 ใช้งาน dev backend ต้องถือ `token_secret` ของ production · **ไม่ออกแบบ override ตอนนี้ (ตามมติ)** · ลด: ทบทวนเมื่อมี prod backend (ไม่มีกำหนด), รอบ `security` รับทราบ |
| R33 | **เปิด auth แล้ว caller หลุด / secret รั่ว** — call ที่ไม่ส่ง Bearer (fire-and-forget D5, localhost dev) พังเป็น 401; `token_secret` ร่วมทั้งระบบ SB อยู่ใน repo (D49) · (Rev 9) ผู้ใช้ที่ไม่มีแถว `TGroupPermissionMenu` ของหน้าได้ 403 | EVD-089, EVD-090, EVD-093 | ฟีเจอร์เงียบพัง (คู่กับ D5/D26) / ปลอม token ได้ทั้งระบบ · ลด: fallback policy ทั่วทั้ง backend, ตรวจทุก call ของ 7 routes, 401/403 ต้องแสดงผล, ตรวจ MenuID ใน DB ก่อน deploy (SA-Q14) · **Rev 9: breaking อนุมัติ · `Token_Secret` ผู้ใช้เลือกไม่ rotate = ความเสี่ยงที่ผู้ใช้รับ (2026-09-29) — ยังเป็น finding Critical ที่ `security` ต้องตรวจก่อน production (ไม่ถือว่าปิด)** |
| R34 | **soft intensity ทำให้ solver ช้าลง/เลือก attempt ผิดลำดับ** | DES-019 BR-80, R4, R22 | ถ้า implement ผิด (ใช้เป็น hard) = shortfall เพิ่มเงียบ ๆ · ลด: shortfall ก่อน intensity ในการเลือก attempt, ห้าม backtrack เพราะ intensity, DES-020 แสดง shortfall ทุกครั้ง |
| R35 | **ลบโค้ด legacy ผิดชิ้น** — ชื่อ legacy ปนกับของที่ใช้อยู่ · (Rev 9) ไม่ DROP แล้ว — ความเสี่ยงข้อมูลหายตกไป | D52, EVD-108, EVD-111 | ลบ DTO/component ผิดตัว = หน้า manage-timetable/generate พัง · ลด: inventory §46.1, ตรวจรับ §46.2 ข้อ 3, ห้าม `Migrate()`/`EnsureCreated()` |
| R36 | **(Rev 11/12) สมมติฐาน "ข้อมูล legacy เป็นข้อมูลทดสอบ" (OQ-36/OQ-37) คู่กับ R32** — production ใช้ backend + ฐานข้อมูล dev · **Rev 12: ผู้ใช้ยืนยัน 2026-09-30 ว่าฐานข้อมูลโมดูลมีเฉพาะข้อมูลทดสอบ ไม่มีข้อมูลโรงเรียนจริง** — สมมติฐานยืนยันแล้ว ณ วันนั้น; ความเสี่ยงที่เหลือคือข้อมูลจริงเกิดขึ้นก่อน backfill ถูกรัน (production ชี้ฐานข้อมูลนี้อยู่) | OQ-36, OQ-37 (per user chat 2026-09-30), R32, D17 | ถ้ามีข้อมูลจริงในปีที่ไม่มี `TTerm` ก่อน backfill → หายจากมุมมองรายเทอมหลัง cutover โดยไม่มีใครรู้ · ปีที่มี `TTerm` ไม่เสี่ยง (ย้ายเข้าเทอมแรกเสมอ — AC-028) · ลด: ยืนยันซ้ำถ้ามีข้อมูลโรงเรียนจริงก่อน backfill (§27.5 จ) — ถ้ามี = OQ-36/OQ-37 เปิดใหม่ · ห้ามลบแถวอัตโนมัติ · ฉบับ Rev 11 ของแถวนี้อยู่ใน `design-archive.md` |
| R37 | **(Rev 11) การจำแนกวิชาหนักพึ่งข้อความอิสระต่อโรงเรียน + ค่าแปลตามภาษา** — `sCourseGroupDesc` ของ `GetSubjectsByPlan` คืน `DescriptionEn` เมื่อ header `sblanguage=en` (backendProxy ส่งตาม cookie ภาษา) · `TCourseGroup.Description` เป็น VARCHAR(30) ต่อโรงเรียน ค่าจริงไม่ได้ตรวจ (dump ไม่มีแถวข้อมูล) | EVD-099, §44.1 หมายเหตุ Rev 11 | UI อังกฤษ = ทุกแผน "จำแนกวิชาหนักไม่ได้" → ความเข้มข้นไม่มีผลเงียบ ๆ · โรงเรียนที่ตั้งชื่อหมวดต่างรูป (เช่น "รายวิชาพื้นฐาน") = จำแนกไม่ได้ · ลด: BR-77 จับคู่ค่าภาษาไทยดิบ (`sCourseGroupDescTh`), สรุปแจ้ง "จำแนกวิชาหนักไม่ได้" (ห้ามเดา), `devops`/technical owner ตรวจค่าจริงใน school DB ก่อนเปิดใช้ (SA-Q18) |
| R38 | **(Rev 17) Generate/Save บนข้อมูลที่โหลดไม่สำเร็จ** — load required (§43.2b ข้อ 3) 4 ตัวตั้ง loaded ใน `finally` และกริดที่ period load ล้มยังรายงานพร้อม → solver ข้ามกติกาเงียบ ๆ หรือวางบนโครงคาบ placeholder · ไม่ใช่ regression (มีมาก่อน แบบเงียบ — ตอนนี้มี toast) | RV-11, RV-12, §43.2b | ตารางที่บันทึกละเมิด link subject / ชนตารางอื่น / เวลาไม่ว่างของครู หรือผิดโครงคาบ · `settings/[year]` Save ทับค่าจริงด้วยค่าเริ่มต้นเมื่อโหลดล้มชั่วคราว · 403 ไม่ทำให้บันทึกผิด (write คู่กันได้ 403 ตาม §43.2a) — ความเสี่ยงมาจาก 5xx/network/`status:-1` · **ลด (Rev 18 — SA-Q19 = A, ผู้ใช้เลือก 2026-10-01; วลี "ลด: SA-Q19 (คนตัดสิน)" อยู่ใน `design-archive.md`):** §43.2b ข้อ 4 — Generate/Regenerate/Save ถูกบล็อกและ Generate ที่รออยู่ถูกยกเลิกเมื่อ required load ใดไม่สำเร็จ (รวม 200 + `status !== 1`) · `settings/[year]` Save ถูกบล็อกจน `setting/get` สำเร็จ · **ความเสี่ยงที่เหลือ:** (1) **ยังไม่ลดจนกว่างาน FE ของ §43.2b ข้อ 4 ถูก implement + verify** (as-built ยังเป็นแบบ R38 เดิม) (2) ทางกู้คืน = reload ทั้งหน้า จนกว่า UX-004 เซ็น — ผู้ใช้ที่ไม่ reload ทำงานต่อไม่ได้ (ไม่ใช่ความเสี่ยงความถูกต้อง) (3) load ของหน้าอื่นที่ยังไม่ถูกจัดชั้นตาม §43.2b ข้อ 3 ยังเป็นแบบเดิมจนกว่า engineer แตะหน้านั้น |

> **Rev 8 — ผลต่อความเสี่ยงเดิม:** R1 — OQ-1 ปิด: ไม่มี gateway ให้พึ่ง, การลด = DES-018 · R6 — ส่วน intensity มีสัญญาแล้ว (DES-019) · R3/R8 — ส่วน shortfall UI ของ §32.1 ข้อ 2 มี requirement แล้ว (DES-020) · R9 — D17 ยอมรับชั่วคราว (R32) · R12 — legacy `Schedule*` มีแผนลบ (DES-021) · R14/R30 — ขอบเขต conflict ข้ามเทอมปิดแล้ว (S1 — §34.3)

> **Rev 5 — ต่อจากหมายเหตุ §32.1 ข้อ 3 ข้างบน:** write path ใหม่ของ Rev 5 (`SubjectRoom/Set` — §38.3 ตั้งแต่ Rev 6) อยู่ภายใต้หลักเดียวกับ DES-010: ต้องอยู่ใน transaction เดียว เพราะเป็น path ใหม่ที่ยังไม่มี caller · write path เดิม (`Setting/Set` ที่ได้ฟิลด์ใหม่จาก DES-014/DES-015) ยังเป็นแถวเดียวต่อ request จึงไม่ต้องเพิ่ม transaction ในรอบนี้
> **Rev 6:** write path ใหม่เพิ่ม `RoomSetting/Set` (ถ้า C2 — §38.3) และ `Timetable/SetAcademicSyncResult` (§41.4) — อยู่ใต้หลักเดียวกัน (transaction เดียวต่อ request) · ข้อความ R19–R23, R25 ฉบับ Rev 5 ย้ายไป `design-archive.md` แบบ verbatim
> **Rev 7:** R29/R30 แก้ตามคำตอบ OQ-28/OQ-25 (ฉบับ Rev 6 ย้ายไป `design-archive.md` แบบ verbatim) · เพิ่ม R31 (ผลของคำตอบ OQ-26) · `RoomSetting/Set` ได้ขอบเขต (ปี[, เทอม]) — ยังอยู่ใต้หลัก transaction เดียวต่อ request

**32.5 หลักฐานนอก Target / ที่ hash ไม่ได้ (Rev 10 — `inferred` เชิงเล่า ไม่ใช่บรรทัด Evidence)**

> เหตุผล: `design-evidence-v1` ต้องการ path ภายใน Target + sha256 ของไฟล์ + basis ในชุดที่อนุญาต — รายการด้านล่างไม่ผ่านอย่างน้อยหนึ่งข้อ จึงถอนจาก Evidence โดย **ไม่ทิ้งข้อมูล** (บรรทัดเดิมทั้งหมดอยู่ใน `design-archive.md` Rev 10) · ข้อสรุปที่พึ่งพารายการเหล่านี้ยังเป็นคำถามเทคนิคที่ต้องให้เจ้าของยืนยัน (คอลัมน์สุดท้าย) · ตรวจซ้ำที่ `c212ca6`/`6d997a3` ในรอบนี้ตามที่ระบุ

| id เดิม | แหล่ง (repo) | ข้อเท็จจริงที่อ้าง | สถานะ Rev 10 | พึ่งพาใน |
|---|---|---|---|---|
| EVD-034 | frontend `src/app/api/school/[schoolId]/` (directory) | ไม่มี proxy `years/[yearId]/terms` | **ยังจริงที่ `c212ca6`** (มีเพียง `curriculums`, `plans`) | DES-009 §34.2 ข้อ 1 |
| EVD-049, EVD-072 | backend repo root `school_db.sql:3799` (dump ล้าสมัย — D24; ไม่ได้ hash) | `TRoom` = `sRoomID varchar(10)`, `sRoomName`, `cDel`, `SchoolID` — ไม่มีความจุ/ผู้ดูแล | inferred | SA-Q5, SA-Q9 |
| EVD-073, EVD-068 | `school_db.sql:3836` | `TSchedule` ไม่มีคอลัมน์ห้อง | inferred | SA-Q10 (D46) |
| EVD-067 | `school_db.sql:4445` | `TTermTimeTable` ผูกเทอม | inferred | DES-016 BR-46 |
| EVD-052, 074, 075, 063, 064, 076, 077, 078 | frontend `_docs/academic/academic-api-spec.md` (spec ของ Service Academic — ไม่ใช่ source/schema) | 6.12 Get Rooms (1114) · 6.1 by-room ไม่มี `roomId` (801) · 6.5 detail มี `roomId` (880) · 12.3 Get Home Teacher (1366) · 6.9 import (989) · 6.6 upsert `calculate` required (926) · import row ไม่มี `calculate`/`roomId` (1003) · 6.8 delete (976) | inferred | SA-Q6, SA-Q10, SA-Q11, SA-Q12 |
| EVD-084 | frontend `src/app/[locale]/timetable/` (directory) | ไม่มี UI ตั้งความจุ/ผู้ดูแลห้อง | **ยังจริงที่ `c212ca6`** (grep `caretaker|roomCapacity|ความจุ|ครูผู้ดูแล|room-setting` ใน `src` = 0) | DES-013 §38.3 |
| EVD-062, 080, 098 (ส่วนข้อความ) | frontend `messages/th.json:617`, `:687-689`, `:711-716` (ไม่ได้ hash) | ข้อความ tooltip ครูประจำชั้น (D43), tooltip กลุ่มวิชา, ป้ายระดับความเข้มข้น (D51) | ตำแหน่ง key ยืนยันที่ `c212ca6` (617/687/711) · Evidence ย้ายไปบรรทัดที่ `src` ใช้ key | DES-015, DES-017, DES-019 |
| EVD-091 | repo `sb-web-academic-dev-1` @ `1ac95443…` `jabjaiuniversity/FingerprintPayment/BypassAcademic.aspx.cs:96-225, 357-405` (ไม่ใช่ Target) | JWT verify ด้วย `token_secret`; เมนูจาก `TGroupPermissionUser→TGroupPermissionMenu(Type='W')→TMenuPermission`; admin ได้ทุกเมนูที่ active; payload `Menus{id,role,url}` เก็บใน Session | inferred (อ่านจริง ไม่ใช่ Target) | DES-018 BR-74..BR-76 · SA-Q14 |
| EVD-092 | repo `sb-tech-upgrade-api-system` @ `4b587169…` `src/Web.API/Security/LegacyTokenAuthenticationHandler.cs:30` + `src/Web.API/Program.cs:159-167` (ไม่ใช่ Target — resolver อ่านเป็น path ของ frontend จึง "missing") | แบบอย่าง AuthenticationHandler + FallbackPolicy | inferred (แบบอย่าง ไม่บังคับ) | DES-018 §43.2 |
| EVD-095 | Knowledge repo `_docs/schema-map/jabjai-master-single-db.md:1203-1414` | `TMenuPermission(Id, MenuID, MenuName, MenuUrl)` ไม่มีข้อมูลอ่าน/เขียน; `TGroupPermissionMenu(MenuID, GroupID, Type, Role, …)` | inferred (schema-map ไม่ใช่ Target) | DES-018 BR-75 · SA-Q14 |
| EVD-110 | frontend `src/` (directory) | ไม่มี `page-old.tsx` | **ยังจริงที่ `c212ca6`** | DES-021 |
| EVD-112 | backend repo root `db_20260606.sql:108` (dump ล้าสมัย) | `Tbl_Timetable.nTeachingScheduleID` เคยมี | inferred — ไม่มีผลต่อสัญญาแล้ว (ไม่ DROP) | DES-021 (ข้อมูลประกอบ) |

> **ทางเลือกของผู้ใช้ (ยังไม่ตัดสิน):** การปฏิบัติต่อหลักฐานนอก Target — SA ใช้ข้อเสนอของ main session (ย้ายเป็นเรื่องเล่า + คงคำถาม SA-Q) · ถ้าผู้ใช้ต้องการให้เป็น Evidence จริง ต้อง bind repo เหล่านั้นเป็น Target หรือคำนวณ hash ของ dump/spec/messages ใน Target ที่มีอยู่ แล้ว amend

**32.1 Recommendation (ข้อเสนอ — ไม่ใช่ Current Architecture · ห้ามถือเป็น requirement · รอการตัดสินใจหลัง requirement interview):**

1. ยืนยัน auth ชั้น gateway ให้เป็นข้อเท็จจริงก่อนขึ้น production (R1 — ตรงกับ §23 ข้อ 1 และ open question §21.1)
2. แก้ R3/R8 ระดับ bug-fix: อ่าน status ตอน save, แจ้งผลล้มเหลว, shortfall UI — ไม่ต้อง redesign
3. R2: ครอบ multi-step write ด้วย DB transaction + เพิ่ม unique index (school, year) และ (timetable, class) — schema change เล็ก
4. R4/R10: หากพบโรงเรียนขนาดใหญ่จริงจาก requirement ค่อยพิจารณา Web Worker หรือย้าย solver ขึ้น server — **ยังไม่แนะนำทำตอนนี้** เพราะไม่มี requirement รองรับ
5. R5: รวมกติกาเป็น module เดียวที่ solver กับ UI ใช้ร่วมกัน — ทำเมื่อมี amend รอบใหญ่
6. เก็บกวาด dead code (D32, D33, legacy endpoints, OBS/MasterDB) เมื่อเริ่ม phase พัฒนาจริง

---


Back-links: `design\index.md`
