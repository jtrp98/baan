# SchoolBot — คิวงานต่อเนื่องจากหลักฐานจริง (Queue 003)

วันที่ 2026-10-23 · เจ้าของ: gm · อ้างอิง: [plan/index](index.md), [evidence-002](evidence-002.md), [queue-002](queue-002.md), [backlog](../backlog.md)

## Override ใบงาน051 — 2026-10-24

ส่วนนี้มี precedence เหนือคิว/runner/Waiting on Human เดิมด้านล่าง. ผู้ใช้เลือก Codex สำหรับงานนี้และให้ทำเอกสารก่อน; ลำดับ Claude→AGY→Codex และ task023/AGY เป็นประวัติ ไม่สั่ง rerun งานเดิม.

ใช้ [Gateway Rev3](../design/gateway-integration-001.md) และ [receipt](../planning/auth-flow-handoff-001.md): client→HTTP G→gRPC B; browser ผ่าน BFF, ไม่มี HTTP relay/HttpClient หรือ direct public B fallback. HTTP Login เดิมของ G/decoder เป็นอีกขอบเขต. B มี HTTP logout/internal decoder และ 4032 local tests แล้ว แต่ยังไม่พิสูจน์ Gateway/gRPC/DB runtime; fullLogin NOT_READY.

035 และ cType category ตอบแล้ว ไม่ถามธุรกิจซ้ำ. รอทีมตรวจ pre-auth routing/profile linkage. มนุษย์ยังต้องให้ host/env/TLS/secret/service access/staff_admin และ approvals เดิมจาก artifact ที่ครบ; ไม่รอเลือก transport/HTTP exception.

คิวเฉพาะเอกสารใน SA-001/BE-001/BE-039: sys ตรวจ routing/linkage → arch/sys จัด RPC/DTO + HTTP mapping + auth/tenant trust (JWT กับ opaque session), error/timeout/cancellation/retry/private exposure → ส่ง implementation review ให้ G/Light และเตรียม H5. ไม่เขียน transport code/SQL หรือเปิด implementation ในรอบนี้; dependencies/gates เดิมคงทั้งหมด.

## 1. สถานะภาพรวมและข้อห้าม

- **Release Scope คงเดิม (Frozen)**: 44 REQ / 180 AC / 110 tasks (`pending` ทั้งหมด) / 8 phases / 17 gates ไม่เพิ่มลด task ไม่เปลี่ยน dependency หรือ gate IDs
- **ยังไม่มีการปิด Gate หรือ Sign-off ใหม่**: ในรอบนี้ไม่มีการเขียนโค้ด, ไม่รัน test SQL/DB, ไม่รันระบบจริง, ไม่มี UX/content/hardware sign-off และไม่มีการรับความเสี่ยง (risk acceptance) แทนมนุษย์
- **ข้อเท็จจริงที่ผู้ใช้ตอบแล้ว (ห้ามถามซ้ำเด็ดขาด)**:
  1. SchoolBot API ทำงานเป็น **1 service ผ่าน `sb-api-gateway`** (`C:\src\schoolbright\target\sb-api-gateway`) ตาม `planning/user-context-001.md`
  2. ต้นฉบับโค้ดเว็บเดิมอยู่ที่ **`C:\src\sb-web-academic-dev-1`** (ตรวจ HEAD และ SHA-256 ของ 13 ไฟล์ที่อ้างอิงแล้วใน `planning/legacy-source-check-001.json`)
  3. มติเดิมที่ปิดแล้ว (เช่น Guest policy, Level/Activity, ข้อสอบ/สูตรคะแนน, การใช้ช่องคะแนนเดิม, Learner A, OS target Win11 25H2 / macOS 15+) ห้ามเปิดถามซ้ำ
- **สถานะงาน `task023` (arch)**: ณ ตอนจัดทำ `queue-003` งาน `task023` ยังไม่มี output ใน knowledge (เนื่องจาก Claude ชนเพดาน weekly limit และผู้คุมกำลังสลับรันด้วย **AGY**) ทั้งนี้ **ให้อ่าน `planning/handoff-002.md` ที่ผู้คุมจะบันทึกหลังรับงาน `arch` เป็นสถานะรับล่าสุด** และจากร่างคิวนี้ **ห้ามเขียนหรืออ้างว่า gateway integration / DES-004 / DES-012 / SA-001 เสร็จ, อนุมัติแล้ว หรือ route verified**
- **หมายเหตุความพยายาม (Effort)**: ตัวเลข effort ในแผนเป็นเพียงสมมติฐานสำหรับการจัดขนาดงาน (สมมติฐาน — ยังไม่ยืนยัน) **ไม่ใช่กำหนดส่ง (deadline)** และไม่มีการตั้งเพดานแบบ phase barrier งานเตรียมหลักฐานที่ไม่พึ่งพาคำตอบเดินหน้าขนานกันได้ทันที

## 2. นโยบายเลือก Runner ของผู้คุม (User Preference)

- ลำดับความสำคัญที่ผู้ใช้กำหนด: **Claude → AGY → Codex (เป็นลำดับสุดท้าย)**
- ผู้คุมเป็นคนคุมลำดับเองโดยใช้ `--no-fallback`
- **เมื่อรู้แล้วว่า Claude ชน weekly limit**: ให้ข้ามไปเรียก **AGY ทันที** (ห้าม retry Claude ซ้ำในที่ที่รู้ว่าใช้ไม่ได้ และห้าม fallback ไป Codex ก่อน AGY)
- เป็นกติการจัดคิวระดับผู้คุม ไม่ต้องแก้ไขไฟล์ global agents, config หรือ source code

## 3. คิวงานเตรียมหลักฐานและแก้งานเอกสารตาม Owner (ไม่ต้องรอ Phase Barrier)

### 3.1 `arch` (Owner alias: `sa` — รันผ่าน AGY)
1. **งาน `task023` (ณ ตอนจัดทำ `queue-003` ยังรอผลรัน — ดูสถานะรับล่าสุดที่ `planning/handoff-002.md`) + ผลอ่านโค้ด legacy รอบ 002 (`SA-001` / `DES-004` / `DES-012` / `auth-evidence-001`)**:
   - ซิงก์รูปแบบ SchoolBot เป็น 1 service ผ่าน `sb-api-gateway` (จาก `user-context-001.md`) โดยไม่เดา host/TLS/public exposure/secret ที่ผู้ใช้ยังไม่ได้ระบุ
   - ซิงก์ผล `planning/legacy-auth-review-002.md`: ต้นฉบับไม่ trim input username (C5), format วันเกิดด้วย culture ปัจจุบัน (แก้หมายเหตุ M4 เดิม), `lock`/`IsFirstLogin`/`v2:`/`OrdinalIgnoreCase` เป็นส่วนเพิ่มของ port, และ `bypassgarde` ออก `IsAdmin=1` เฉพาะ super admin (`UserID==0 && AdminID!=null`) ส่วนแอดมินโรงเรียนอยู่ใน Session token เท่านั้น (C11)
2. **ปิด Design Gaps จากแผนทดสอบ `TP-001` (`test-plan/tp-001.json`) และผล `spec-test-gaps-review-001.md`**:
   - **GAP-01 (`DES-003:31,89`)**: ปรับให้ตรง `REQ-025` (`BR-025-03`/`AC-025-03`) ว่าจุดโหลด UI นับ UTF-16 code units (16,384) ส่วนเพดาน 16,384 UTF-8 bytes อยู่ที่ engine ตอนรัน (ห้ามใช้ DES บังคับเปลี่ยนหน่วยโหลดของ REQ เอง)
   - **GAP-02 (`DES-002:27-30,84`, `DES-004:80`)**: เปลี่ยนพาธ `/admin/licenses` เป็น `/v2/admin/licenses` ด้วย `staff_admin` session และผูกรหัส error `503 AUTH_NOT_CONFIGURED` / `401` / `403 STAFF_ROLE_REQUIRED` กับ role ที่มีสิทธิ์ (`license_admin`) ให้ชัดเจน
   - **GAP-03 (`DES-002`, `DES-003`, `DES-007`)**: ซิงก์การอ้างอิง `version`/`source_version` เดิมให้เป็น `ETag` (`UpdateDate`/`update_date`) ตาม `decisions-030` และ `data-contract-rules.md` Rev6
   - **GAP-04 (`SA-001`/`SA-002` — `DES-003`/`004`/`005`)**: เติมสัญญา Guest shared workspace, ถังขยะ 30 วัน (การนับเวลาขณะปิดแอป/clock rollback/การลบถาวร), รูปแบบไฟล์ export, ใบเสร็จ/การกันซ้ำของ explicit import, และรูปแบบส่ง local history เข้าตรวจใหม่ครอบ `REQ-040..042`
   - **GAP-06 (`DES-004`/`DES-005`)**: ระบุตาราง authority เดียวของ "รายชื่อนักเรียนที่ได้รับมอบหมาย" (เช่น `course-teacher ∩ roster ∩ term` บน School DB โดยไม่มีตาราง `TeacherGrant` ใหม่)
   - **GAP-07 (`SA-001` — `DES-007` เทียบ `REQ-030`/`BE-019`)**: สรุปข้อเสนอ disposition ของ workflow `PrepareUpdate`/`InstallPreparedUpdate` เทียบกับ check-only เพื่อให้ผู้ใช้ตัดสินใจโดยไม่เพิ่ม AC เอง
   - **GAP-08 (`SA-003` — `DES-006`)**: ระบุความถี่ polling/debounce ของการตรวจหาหุ่นหลุดขณะ idle (`AC-024-01`) และทำสัญญา robot payload/bounds/drain-stop
3. **รับเงื่อนไขปิด Security จาก `planning/security-mitigation-001.md` เข้าสัญญา (`SA-001`/`SA-004`)**:
   - **SEC001-003 (`DES-007:33,37`)**: แก้ความขัดแย้งผู้ลงนาม manifest (ลงนามใน CI protected env หรือเทียบ pipeline registry) และบังคับให้ Desktop host pin ตัวตนผู้เผยแพร่ของ OS signature (Authenticode subject/thumbprint, Apple Team ID)
   - **SEC001-009 (`DES-002:51`, `data-contract-rules:41`)**: กำหนดหน้าต่าง replay TTL สั้นเฉพาะ `create-license` (เช่น ข้อเสนอ ≤15 นาที ติดป้ายสมมติฐาน) พร้อมลบ/เสื่อมอายุ `ResultCipher`/`ResultKeyId` เมื่อพ้น `ReplayUntil` โดยไม่ต้องเปลี่ยน schema
   - **SEC001-002 / `SA-004`**: เตรียม export contract proof pack และร่าง **credential matrix** (`process × ชื่อบัญชี × สิทธิ์อ่าน/เขียนจริง`) แยก worker/adapter ออกจาก public API รวมถึงร่าง **custody matrix** สำหรับ `SEC001-006`
   - **BL-001**: แก้คำอธิบายยอด constraint ใน `design/schema-notes.md` ให้ตรงกับผลนับจริงใน `db/review-006.md`

### 3.2 `vault` (Owner alias: `dba`)
1. **`DBA-001` / `DBA-002` / `DBA-005` / `DBA-006` (งานเตรียมเอกสารแบบไม่รัน DB)**:
   - ยืนยันว่าการใช้ TTL สั้นของ `ReplayUntil` ใน `SchoolBotIdempotency` (ตามแนวทาง `SEC001-009` ของ `jpo`) ไม่ต้องแก้ physical DDL (`db/schoolbot_db.sql:142-167`)
   - จัดทำตารางจำแนกข้อมูลส่วนบุคคล (PII inventory รายคอลัมน์ครอบ 32 ตาราง ตาม `SEC001-010`) ร่วมกับ `arch` และปรับคำชี้แจงยอดใน `db/review-005.md` ตาม `BL-001`
   - รวบรวมชุดคำขอ **DB safe-evidence** (DDL ของ `Master.TUser`, `TEmployees`, `TEmpSalaries` เพื่อดู collation/unique index/ชนิด `cType`/`cDel` ตาม `TR-AUTH-04` และผลนับ aggregate แบบปลอด PII ของ `nSystemID` เทียบ `sEmp`/`sID` และรูปแบบ prefix ของ `PasswordHash` ตาม `TR-AUTH-03`/`05`) สำหรับให้ผู้คุมส่งถามผู้ดูแลฐานข้อมูลในชุดเดียว
2. **`DBA-007` (หลัง `SA-004` พร้อม)**: เตรียมชุดตรวจสอบ cross-DB/export runtime evidence pack (`G-PARITY`, `G-COEXIST`, `G-TARGET`, `G-AUTHZ`, `G-DB`) โดยไม่รัน SQL เอง

### 3.3 `spec` (Owner alias: `ba`)
1. **`BA-001`**: สรุปมติ Guest ที่ผู้ใช้ตอบแล้ว (`decisions-014/015/032`) เป็นชุดอ้างอิงส่งต่อให้ `arch`/`int` โดยไม่เปิดคำถามนโยบายซ้ำ
2. **`BA-002`**: จัดทำ inventory บทเรียนสามโหมด (Block/Arm/Code) พร้อมที่มา, เกณฑ์ผ่าน/ดาว, ตารางคู่ตัวอย่างผ่าน–ไม่ผ่าน และช่องระบุผู้อนุมัติแต่ละ revision เพื่อเตรียมเข้า `G-LEARN` (แก้ `GAP-09` ก่อนทำ `BA-005`/`BA-006`)
3. **`BA-003`**: จัดทำตาราง hardware acceptance pack (ครอบ `AC-014-03`, `019-03`, `021-01`, `021-03`, `024-01`, `024-02`, `031-05`, `032-02`) พร้อมช่องว่างให้มนุษย์กรอกรุ่นหุ่น/firmware/calibration/เกณฑ์ stop-unplug-emergency/ผู้รับรอง/สิทธิ์สั่งหุ่น (แก้ `GAP-05` — ค่าที่เสนอต้องติดป้าย `(สมมติฐาน — ยังไม่ยืนยัน)`)
4. **`BA-004`**: จัดทำ delivery & decision-owner pack สำหรับ Windows 11 25H2 x64 และ macOS 15+ (Intel/ARM) แยกเกณฑ์ signing/notarization/installer cases ให้คนตรวจรับเข้า `G-DELIVERY` โดยไม่ถาม OS ซ้ำ

### 3.4 `int` (Owner alias: `ux`)
1. **`UX-001` (Entry/License/Login) และ `UX-003` (Labs)**: เริ่มร่าง UX artifact ได้ทันทีตามมติที่นิ่งแล้ว เพื่อเตรียมส่งผู้ใช้ sign-off (`G-UX-ENTRY`, `G-UX-LABS`)
2. **`UX-002` (Projects/Guest), `UX-004` (Learning), `UX-005..007` (Admin/Mapping/Exam/Promotion)**: เตรียมตามลำดับเมื่อเอกสารจาก `BA-001`/`BA-002` และ `SA-002`/`SA-004` พร้อม ห้ามให้ `front` เริ่มเขียน UI ก่อนมี signed UX ของส่วนนั้น

### 3.5 `inspect` (Owner alias: `tp`)
1. **หลัง `arch` ซิงก์ `GAP-01..04/06/07/08` เสร็จ**: อัปเดต expected และสถานะช่องว่างใน `test-plan/tp-001.json` และ `tp-001.md` ให้ตรงสัญญาที่ซิงก์แล้ว (โดยคง `actual=NOT_RUN` ไม่ใช่ QA PASS)
2. **`TP-002`**: เตรียมแผน failure/race fixtures (fake clock/monotonic rollback, late callback/drain-stop, lost response ตอน import, cross-tenant injection, 30-day trash expiry)
3. **`TP-003` (หลัง `SA-004` พร้อม)**: เตรียม grade parity/coexistence/crash fixtures สำหรับ `AC-049..052`

## 4. รายการที่รอทีมเตรียม Artifact ให้ครบก่อนส่งถามมนุษย์ (Do Not Ask Prematurely)

| เรื่องที่ต้องให้มนุษย์ตัดสิน/ให้ข้อมูล | ต้องรอ Artifact ใดจากทีมก่อน | ผู้เตรียม | Gate ที่เกี่ยวข้อง |
|---|---|---|---|
| ยืนยัน route/policy ของ `web-principal`, แหล่ง `is_admin`, สถานะ `LegacyWebJwt:Secret` แยกจาก `Jwt:Secret`, และ `staff_admin` คนแรก | ผล `arch` (`task023` ผ่าน AGY) ที่ซิงก์ `user-context-001` + `legacy-auth-review-002` เข้า `DES-004`/`DES-012`/`auth-evidence-001` | `arch` | `G-AUTH` |
| ขอ DDL (`TUser`/`TEmployees`/`TEmpSalaries`) และผลนับ aggregate ปลอด PII (`TR-AUTH-03..06`) + ยืนยันบัญชี DB เดิมและขอบเขตสิทธิ์ (`SEC001-002`) | ชุดคำขอ DB safe-evidence ที่รวบรวมครบ + ร่าง credential matrix (`process × บัญชี × สิทธิ์อ่าน/เขียน`) | `vault`, `arch` | `G-AUTH`, `G-CORE`, `G-DB` |
| ตัดสินใจเรื่อง update workflow (`PrepareUpdate`/`InstallPreparedUpdate` vs check-only), ขอบเขต four-eyes ของ release (`SEC001-003`), และ custody ของ signing keys (`SEC001-006`) | ข้อเสนอ disposition ใน `SA-001` + `DES-007` ที่แก้จุดขัดแย้ง `:33` vs `:37` + ร่าง custody matrix | `arch` | `G-RELEASE-DB` |
| ตรวจรับเนื้อหาบทเรียน เกณฑ์คะแนน/ดาว และผู้อนุมัติ revision | Inventory/rubric decision pack (`BA-002`) | `spec` | `G-LEARN` |
| ยืนยันรุ่นหุ่น/firmware/calibration เกณฑ์ผ่านทางกายภาพ และออกคำสั่งอนุญาตทดสอบหุ่นจริง | Hardware acceptance pack (`BA-003`) + สัญญา transport/bounds (`SA-003`) | `spec`, `arch` | `G-HW`, `G-ROBOT-CONTRACT` |
| ยืนยันผู้ถือใบรับรอง code signing/notarization, ช่องทางแจกจ่าย และเกณฑ์ตรวจรับการติดตั้ง | Delivery decision pack (`BA-004`) | `spec` | `G-DELIVERY` |
| อนุมัติหน้าจอ (UX Sign-off) แยกตามผู้ใช้งาน | เอกสาร UX (`UX-001..007`) | `int` | `G-UX-ENTRY`, `G-UX-PROJECT`, `G-UX-LABS`, `G-UX-LEARN` |
| รันทดสอบ SQL DDL + rollback + catalog verification บนฐานทดสอบ | `SA-001`/`DBA-001`/`DBA-002` ซิงก์สัญญาล่าสุดครบ | `arch`, `vault` | `G-CORE`, `G-PROJECT-DB`, `G-LEARN-DB`, `G-RELEASE-DB` |

## 5. การจัดการข้อค้นพบนอกขอบเขต (Backlog Routing)

- ข้อบกพร่องในโค้ดของ `sb-api-gateway` (G), `sb-tech-upgrade-academic` (A) และ `sb-web-academic-dev-1` (legacy) บันทึกแยกตามเจ้าของระบบไว้ใน `backlog.md` (`BL-002`, `BL-003`, `BL-004`) พร้อมป้ายกำกับ **"ยังไม่ผ่าน security triage ของเจ้าของระบบ"** โดยไม่เปิด task ใหม่และไม่ขยายขอบเขตของ SchoolBot
- ข้อกำหนดด้านความปลอดภัยที่มี task รองรับอยู่ในแผน SchoolBot แล้ว (เช่น การบังคับ `SchoolId` ทุก query ใน `BE-002`/`BE-006`, การปฏิเสธ `purpose`/`aud` และการไม่ log ชื่อ header ใน `BE-039` ตาม `SEC001-001`/`013`, และการแยก process ของ grade writer ใน `BE-023`/`BE-037`/`BE-038`) ให้เดินตาม task เดิมโดยไม่แตกงานซ้ำ

## Change Log
- 2026-10-24 — ใบงาน051: override คิวเดิมตาม049/receipt/คำสั่ง Codex ปัจจุบัน; คงประวัติและทุก gate.

- 2026-10-23 — สร้าง `queue-003.md` จากหลักฐานจริงรอบ `task017..026` และ `user-context-001`; บันทึกลำดับ runner `Claude → AGY → Codex` (`--no-fallback`) และจัดคิวงานเตรียม artifact ราย owner โดยคง 110 tasks `pending` / 44 REQ / 180 AC / 17 gates เดิม
