# แผนที่ระบบเก่า → sketchbook (นำเข้า 2026-10-21)

ระบบเก่า: `~/Documents/School Bot/` (pipeline 4 agent: Orchestrator → Architect → Designer → Auditor · 110 ไฟล์) · ตรวจครบทุกไฟล์ แล้วย้ายเฉพาะ "ข้อมูลที่สำคัญต่อการออกแบบ" · ไฟล์นี้ใช้ตามรอย ID เดิม ไม่ต้องอ่านเมื่อออกแบบ

## 1. ไฟล์เดิม → ที่ใหม่

| ไฟล์เดิม | ไปที่ | หมายเหตุ |
|---|---|---|
| `School Bot Studio.md` (v4.1), `_archive/School Bot Studio_v1–v4.md` | `sketchbook-project-index.md`, `../../shared/context.md` | brief ตั้งต้น v1 ที่หายจากฉบับปัจจุบัน → `../../shared/context.md` §ที่มาตั้งต้น |
| `Handoff/01_REQUIREMENT/01_PROJECT_BRIEF` | `../../shared/context.md` | ผู้ใช้ ผลลัพธ์ ขอบเขต สิ่งที่ไม่รวม |
| `…/02_REQUIREMENTS` (FR/NFR/UJ/EC/AC) | `modules/*/requirements.md` ตาม §2 · NFR → `../../shared/context.md` | |
| `…/03_CURRENT_STATE` (EV, สถานะ frame, BUG-01–20) | `modules/*/feasibility.md` §R# และ §ทั่วไป (BUG ตาม module) · EV-06 มาสคอต → `sketchbook-brand.md` §8 | |
| `…/04_DECISIONS_AND_OPEN_QUESTIONS` (DEC, OQ, CF, CHG) | DEC ร่วม → `../../shared/context.md` · DEC ผูก module → `requirements.md` ของ module · OQ → `oq.md` ของ module · CHG → `sketchbook-changelog.md` | |
| `…/05_UX_UI_DIRECTION` | `../../shared/context.md` (ลำดับ UX, อ้างอิง) · `sketchbook-brand.md` §8–9 (มาสคอต, ข้อตัดสินหน้าจอ) | |
| `…/06_CONSTRAINTS_AND_RISKS` | `../../shared/context.md` | |
| `…/07_HANDOFF_AND_ACCEPTANCE`, `08_SESSION_STATUS`, `00_START_HERE`, `README` | ไม่ย้าย (process/สถานะเซสชัน) | สถานะงาน ณ 2026-10-21 สรุปใน `../../shared/context.md` §สถานะงานเดิม |
| `Handoff/02_FEASIBILITY/FEASIBILITY_REPORT` (ARC-I) | `modules/*/feasibility.md` ตาม module เจ้าของ | รายการหมวดบล็อกทั้งตาราง → block-lab |
| `…/SCREEN_INVENTORY` (SCR, ST, Navigation) | `modules/*/feasibility.md` ตาม module · Navigation ทั้งแอป → app-shell | |
| `…/DATA_MAP` (ENT, ระบบภายนอก) | ENT → `feasibility.md` ตาม module · ระบบภายนอก → `../../shared/context.md` | |
| `…/DEV_QUESTIONS` | `feasibility.md` + `oq.md` ตาม module (DEV-Q01 อยู่หลาย module) | |
| `…/00_START_HERE`, `STATUS`, `README` | ไม่ย้าย (สรุปที่ย้ายแล้วในไฟล์อื่น) | ข้อกำหนดที่ Designer ต้องใช้ 11 ข้อ กระจายตามเรื่องแล้ว |
| `Handoff/03_DESIGN/DESIGN_PLAN` | แผน frame → `sketchbook-project-index.md` ของ module ("งานออกแบบเดิม") · DSG → `sketchbook-brand.md` §9–10 · ข้อมูลตัวอย่าง → `sketchbook-brand.md` · สมมติฐานที่ออกแบบเผื่อ → `oq.md`/`feasibility.md` | |
| `…/FRAME_REGISTRY`, `EDIT_LOG`, `STATUS` | สถานะ frame + ผลการแก้ที่ตัดสินแล้ว → `sketchbook-project-index.md`/`feasibility.md` ของ module · ค่า DS ที่ฝังใน EDIT_LOG → `sketchbook-brand.md` §9 | log รายละเอียด (ขนาดไฟล์ KB, ตำแหน่ง x/y บน canvas) ไม่ย้าย: เป็นของ canvas ไม่ใช่การออกแบบ |
| `Handoff/04_AUDIT/AUDIT_REPORT_2026-10-21` (AUD-F01–F09) | `../../modules/arm-lab/design/review.md`, `../../modules/app-shell/design/review.md` | ตารางผลตรวจและ contrast |
| `Handoff/CHANGE_REQUESTS` (CR-01–11) | `sketchbook-changelog.md` + เหตุผลของการตัดสินใน module ที่เกี่ยว | CR-01 เป็นตัวอย่างแม่แบบ ไม่ย้าย |
| `Auditor/AUD-C_STANDARDS_CHECKLIST` | เกณฑ์เฉพาะโปรเจกต์ → `../../shared/context.md` §เกณฑ์ตรวจเฉพาะโปรเจกต์ · WCAG ทั่วไปใช้ `knowledge/` | เช็กลิสต์ WCAG 2.2 AA ฉบับเต็มยังไม่ได้ยกเป็น `knowledge/wcag-aa.md` (ทำได้ถ้าทีมต้องการ) |
| `Architect/ARC-C_FEASIBILITY_CHECKLIST` (12 มิติ) | ไม่ย้าย: role `ruler` ใช้เกณฑ์ของตัวเอง | ใช้เป็นแนวคิดตอนเขียน feasibility |
| `Designer/DSN-B` (กฎคุม token ใน Claude Design) | `../../shared/context.md` §บทเรียน canvas | |
| `Auditor/AUD-B` (เกณฑ์ความรุนแรง C/M/m) | `../../shared/context.md` §เกณฑ์ตรวจ (ระวัง M สองความหมาย) | |
| `00_PIPELINE_README`, `Orchestrator/*` (รวม `_archive/v1`), `Architect/ARC-A,B,D`, `Designer/DSN-A,C`, `Auditor/AUD-A,B,D` | **ไม่ย้าย** | process ของ pipeline เก่า แทนด้วย roles ของ sketchbook (pencil/ruler/crayon/highlighter) |
| `_archive/Handoff_*`, `CHANGE_REQUESTS_v3`, `Handoff_02_FEASIBILITY_v2.4` | **ไม่ย้าย** (เหลือเฉพาะสิ่งที่ตกหล่นแล้ว: ดู `../../shared/context.md` §ที่มาตั้งต้น) | ฉบับเก่าถูกแทนที่ครบ |
| `../assets/mascot/schoolbot_mascot_sheet_10poses.png` | `assets/mascot/` | คัดลอกไฟล์แล้ว |
| `Claude outputs/P0-2_MainV6A_before_after.png` | ไม่ย้าย | หลักฐานการเทียบ render ตอนแยก component |
| skill `schoolbot-design` (DESIGN.md v0.7, DECISIONS D-01–D-23) | `sketchbook-brand.md` §1–7 (นำเข้าไว้ก่อนแล้ว) | ต้นฉบับอยู่ใน skill ไม่ได้อยู่ในโฟลเดอร์ School Bot |

## 2. ID เดิม → module

| ID เดิม | module |
|---|---|
| FR-01–05, FR-32 · SCR-01–05, SCR-20 · ST-01–10 (ส่วนหน้าหลัก/login/installer), ST-39 · ENT-01, 02, 24, 27 · AC-01–04, 19 · UJ-01 · BUG-01, 04 · CR-08–10 (แถบหน้าต่าง) · FRM-01, 05, 09–11, 15 | app-shell |
| FR-22–25 · SCR-09, 10, 11 · ST-17, 18 · ENT-13, 18 · AC-13 · EC-01, 04 · ARC-I05–07, 16, 17 · DEV-Q05, 06 · CR-06, 07 · FRM-03, 07 · BUG-02, 03 | my-work |
| FR-06–09 · SCR-06–08 · ST-11–16 · ENT-07–12 · AC-05, 06 · EC-05 · UJ-02 · ARC-I02, 03 · DEV-Q12 · FRM-12–14 · DSG-05, 10 | quiz |
| FR-10–14 · SCR-12–15 · ST-19–26, 48 · ENT-14–16, 20, 23 · AC-07–09 · UJ-03, 06 · ARC-I04, 11, 31 · DEV-Q02, 07, 15 · BUG-05–12 · CR-05, 11 · FRM-02, 04, 06, 08 · AUD-F02, F07–F09 | arm-lab |
| FR-15–20, 30, 31 · SCR-16–19, 26 · ST-27–30, 32–34, 40–47 · ENT-17, 25, 26 · AC-10–12, 16–18 · EC-07–09 · UJ-04 · ARC-I08–10, 22–30, 33, 34 · DEV-Q03 (Uno), 04, 13, 14, 16 · BUG-13–20 · FRM-16–19 · DSG-09 | block-lab |
| FR-26–29 · SCR-21–25 · ST-35–38 · ENT-03–06, 21, 22 · AC-14 · UJ-05 · ARC-I01, 12–15, 18 · DEV-Q01, 08–10 · FRM-20–24 · DSG-01, 07 | teacher-web |
| DEC ร่วม, CON, RSK, NFR, ระบบภายนอก, เกณฑ์ตรวจ | [../../shared/context.md](../../shared/context.md) |
| DSG-02–04, 08, 11, 12 · สีหน้าต่าง/มาสคอต/พื้นที่ 856 | brand.md §8–10 |
