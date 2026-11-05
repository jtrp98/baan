# timetableai — UX Drafts (`uxui/`)

ร่างโดย `uxui-designer` · วันที่ร่าง: 2026-09-29 · แก้ล่าสุด 2026-10-11 (บันทึก sign-off UX-009 และ UX-011 ทั้งฉบับโดย jtrp98; UX-001..UX-004, UX-006 ผู้ใช้อนุมัติ as-is 2026-10-04 · ร่างเดิม 2026-09-29/30)
As-built basis: `sb-tech-upgrade-web-system` branch `backlog/ACA-5111` @ `c212ca6` + UI review 2026-09-29
Spec basis: `design.md` Rev 14 (DES-022 §47 — UX-006/UX-004) · Rev 13 (DES-019 BR-80/81/81a; Rev 12: DES-020, DES-022 §47, §43.2), `requirement.md` (AC-054/055/063/064; OQ-34..37 ปิดแล้ว)

**UX-001..UX-004 และ UX-006 เซ็นแล้ว — ผู้ใช้อนุมัติ as-is 2026-10-04 · UX-009 และ UX-011 เซ็นทั้งฉบับโดย jtrp98 วันที่ 2026-10-11 (ดูตาราง Sign-off ใน artifact) · UX-005 ยังเป็นร่างไม่มีผู้เซ็น** · UX sign-off เป็นการกระทำของคน
หลักการ (CLAUDE.md Roles): `uxui-designer` เป็นที่ปรึกษา draft เท่านั้น — `frontend-engineer` อ่านได้เฉพาะ "signed UX artifact" และ `project-manager` ผู้เดียวที่เขียน `plan.md`

## รายการร่าง

| ไฟล์ | หัวข้อ | Traceability | บล็อกบน |
|---|---|---|---|
| [UX-001-post-generate-results.md](UX-001-post-generate-results.md) | ผลลัพธ์หลัง Generate/Regenerate + สรุปความเข้มข้นแสดงร่วม | DES-020 AC-056 BR-82..85 · DES-019 AC-054/055 BR-77..81, BR-81a | การเซ็นถ้อยคำของผู้ใช้ (รวมข้อเสนอแนะระดับ 0/1/2) — BR-81a และ SA-Q16 ปิดแล้ว |
| [UX-002-intensity-selector.md](UX-002-intensity-selector.md) | ตัวเลือก `nCourseIntensity` ใน modal สร้าง/แก้ตาราง + แก้ป้ายใน `/timetable/settings` (D51) | DES-019 §44.3, BR-78, D51 | การเซ็นถ้อยคำป้ายของผู้ใช้ (ป้าย UI ไม่ใช่การยืนยันธุรกิจ — บทเรียน D43) |
| [UX-003-nonblocking-warning.md](UX-003-nonblocking-warning.md) | คำเตือนแบบไม่บล็อกตอนวางมือที่ขัดเป้าหมายความเข้มข้น | BR-80, BR-81a, AC-054 | FE-003 (config/ฟังก์ชัน T_c จุดเดียว) + การเซ็นถ้อยคำ — BR-81a ปิดแล้ว |
| [UX-004-auth-messages.md](UX-004-auth-messages.md) | ข้อความ 401/403 ของ DES-018 | AC-063, design §43.2, VR-18..20 | การเซ็น copy ของผู้ใช้ (FE-001 ใช้ทางแสดงผลเดิมจนกว่าจะเซ็น) — ปรับให้สอดคล้องกับเมนูปิด (UX-006) 2026-09-30 |
| [UX-005-failure-surface-rules.md](UX-005-failure-surface-rules.md) | กติกาการแสดงความล้มเหลวของ action (แก้ as-built จาก UI review) | AC-063, DES-020 §45.3, AC-014 | — (รอเซ็นก่อนให้ engineer ใช้อ้าง) |
| [UX-006-sidebar-menu-disabled-state.md](UX-006-sidebar-menu-disabled-state.md) | เมนู Teaching Schedule ใน Sidebar แสดงปิดใช้งานตามสิทธิ์ (disabled look, tooltip, a11y, loading/error — fail-closed) | AC-064, DES-022 §47 BR-86..89, OQ-35, D53 | การเซ็นหน้าตา/ถ้อยคำของผู้ใช้ (เงื่อนไขสุดท้ายก่อน `frontend-engineer` ทำ DES-022) |
| [UX-007-term-context.md](UX-007-term-context.md) | บริบท/ตัวเลือกเทอมบนทั้ง 7 routes — jtrp98 อนุมัติ layout/flow, URL query และ preselect ตามเงื่อนไข วันที่ 09/10/2026; รายละเอียดนอกคำถามยัง draft | REQ-012 AC-027, DES-009 §34.2/§34.4/§34.6 | SA amend DES-009 §34.2a แล้ว; FE-021 approved subset พร้อม; precise copy/รายละเอียด/UX-005 ยังรอ sign-off ตามรายการใน artifact |

| [UX-008-copy-across-term-year.md](UX-008-copy-across-term-year.md) | Copy 5 จุดเข้า Preview/Confirm/Apply พร้อม partial/template/dependents และผลจริง — draft | REQ-013 AC-029..032/050/051 · DES-010 | UX sign-off; BE-011 consume schema/owner §27.6 ยัง conditional |
| [UX-009-continuity-and-subject-groups.md](UX-009-continuity-and-subject-groups.md) | บล็อก continuity/G2/BR-53/VR-17 และ delta ผลตรวจเพดานครู signed jtrp98 2026-10-11 | REQ-015 AC-036..037c · DES-012 §37.2a/017 | ฐาน signed คงเดิม; คำตอบจริง “อนุมัติส่วนเพิ่ม UX-009 ตามร่าง (แนะนำ)” ปิด delta flow/copy/layout/a11y หลัง review15; FE-023 รอ actual backend/final eligibility ตาม plan |
| [UX-010-subject-rooms.md](UX-010-subject-rooms.md) | mapping วิชา→ห้อง, C2 conditional editor และ capacity/caretaker/cross-system states — draft | REQ-016 AC-038/038a/039/040 · DES-013 | UX sign-off + owner/schema SA-Q5/9/10; C2/C1′/X1/X2 ไม่อนุมัติแทนคน |
| [UX-011-teaching-caps-and-homeroom.md](UX-011-teaching-caps-and-homeroom.md) | ชั่วโมงเต็ม/วัน-สัปดาห์และ flag ครูรายคน พร้อม transition M1/H1 — signed jtrp98 2026-10-11 | REQ-017/018 AC-041..046a · DES-014/015 | UX sign-off ทั้งฉบับ/สรุปชั่วโมงและนาทีแล้ว; BE-013 schema/breaking dev approved แยก; paired cutover/DDL/deploy ยัง hold |
| [UX-012-generate-precheck.md](UX-012-generate-precheck.md) | precheck ทุกรายวิชา blockers เปิดครบ scrollable/recheck/warnings — draft | REQ-014 AC-033..035 · DES-011 | UX sign-off + FE-023/024/025/cutover ตาม Depends; ไม่ซ่อน blocker แรก 3 แถว |
| [UX-013-academic-push.md](UX-013-academic-push.md) | ส่งจากรายการ [year], ผลจริงรายคู่/แทนที่/ส่งซ้ำ และ T1 conditional — draft | REQ-019 AC-047..049/052/053 · DES-016 | UX sign-off + owner ยืนยัน concrete T1 proposal §41.4a/default/schema/security; SA แก้ provenance แล้ว ยังไม่เซ็น |

## สิ่งที่ยังเปิดอยู่และต้องการคำตัดสินของคน

ปิดแล้ว (ผู้ใช้ยืนยัน 2026-09-30 — ไม่ใช่ตัวบล็อกอีกต่อไป): BR-81a (T_c = ⌈H_c / D_c⌉ ต่อห้อง · `ConsecutiveHeavy` เฉพาะระดับ 2 · ระดับ 0 ไม่มี UI ข้อเสนอแนะ) · D53/OQ-35 (เมนูปิด → UX-006) · SA-Q16 (หมวดจาก `TCourseGroup`; ค่าจริงยังรอ SA-Q18 — มี fallback)

- **ถ้อยคำในส่วนที่ยังไม่เซ็นเป็นข้อเสนอ** — ขอบเขตที่อนุมัติของแต่ละไฟล์อยู่ใน Sign-off; UX-009 และ UX-011 อนุมัติ copy ทั้งฉบับแล้ววันที่ 2026-10-11
- **ผู้ใช้ตัดสินเพิ่ม 2026-09-30** (บันทึกใน "Decided by user" ท้ายไฟล์): UX-003 เตือนเฉพาะคู่ (ห้อง, วัน) ที่เพิ่งกลายเป็นละเมิด (รวมคู่ที่ตกเกณฑ์เพราะ T_c ลดหลังการแก้; L0 ไม่เตือน) · T_c คำนวณใหม่ต่อห้องจากกริดปัจจุบันหลังวาง/สลับ/ย้าย/ลบที่สำเร็จทุกครั้ง — ตรงกับ design.md Rev 13 (SA แก้สัญญาแล้ว ผู้ใช้ยืนยัน) · `ConsecutiveHeavy` `nThreshold = null` ไม่แสดงเพดาน · UX-006 เมนูปิดที่ตรงหน้าปัจจุบันไฮไลต์แต่คลิกไม่ได้ + tooltip ไม่มีบรรทัดติดต่อผู้ดูแล
- **ผู้ใช้ตัดสินเพิ่ม 2026-09-30 (รอบหลัง)**: UX-006 loading = ทุกรายการปิด + Spinner เล็กที่หัวกลุ่ม · ตรวจสิทธิ์ไม่สำเร็จ = ปิด + ไอคอนเตือน + tooltip ให้โหลดใหม่ ไม่ retry อัตโนมัติ · UX-003 toast หลายคู่ สูงสุด 3 แล้ว "และอีก k คู่" · คำนำ toast TH "แก้ไขตารางสำเร็จ" / EN "Timetable edited"
- **UX-006 ตรวจตรง design.md Rev 14 แล้ว (2026-09-30):** 4 สถานะรายการแยกกันได้ (enabled / noPermission = กุญแจ / loading = ทุกรายการปิด + spinner เล็กที่หัวกลุ่ม / checkFailed = ทุกรายการปิด + ไอคอนเตือน + tooltip ให้ reload) · "ไม่มีสิทธิ์" = 200 + `isRead:false` เท่านั้น — 401/403/5xx/network/timeout/ผิดรูป/ขาด MenuID = checkFailed · Sidebar ไม่เริ่ม SessionExpired และไม่แสดงข้อความ 401/403 · ไม่ retry อัตโนมัติ (ครั้งเดียวต่อการโหลดหน้า ในหน่วยความจำ) · UX-004 ปรับให้สอดคล้อง
- **ผู้ใช้ตัดสินเพิ่ม 2026-09-30 (UX-006):** reduced-motion → ตัวบ่งชี้โหลดที่หัวกลุ่มเป็นแบบนิ่ง · checkFailed → ไอคอนเตือนทั้งหัวกลุ่มและทุกรายการ
- **ผู้ใช้ตัดสินเพิ่ม 2026-09-30 (UX-004):** 403 ระดับหน้า (URL ตรงโดยไม่มีสิทธิ์) มีลิงก์ "กลับหน้าหลัก"
- **ยังเปิดอยู่ ("Open for user")**: วัด contrast `#7B8F9C` บน `#1F262D` · ชุดไอคอนจริงของ Sidebar · Sidebar หุบ/mobile · การเซ็นถ้อยคำ tooltip (ครบ 4 รายการ)
- **ปิดแล้ว 2026-10-04 — ผู้ใช้อนุมัติ as-is ครบทั้ง 4 รายการข้างบนพร้อมการเซ็น UX-006** · สิ่งที่ยังค้างเป็นขั้นตอนตรวจของ `frontend-engineer` ก่อน implement: วัด contrast `#7B8F9C` บน `#1F262D` ด้วยเครื่องมือ และยืนยัน as-built (ชุดไอคอนจริงของ Sidebar, Sidebar หุบ/mobile)
- `plan.md` FE-002 ยังอาจมีข้อความ "รอ SA-Q16" ที่ล้าสมัย — ไม่อยู่ในสิทธิ์ของ `uxui-designer`; เป็นของ `project-manager`/`system-analyst`

**ประวัติร่าง UX-008..UX-013 รอบ amend 2026-10-09:** ณ รอบนั้น draft ทุกไฟล์, Signed by/on ว่าง และตาราง Sign-off ว่าง; proposal copy/interaction ยังไม่ใช่การอนุมัติ. **อัปเดต 2026-10-11:** UX-009 signed ทั้งฉบับตามคำตอบจริงของ jtrp98 และคำถามใน artifact; UX-008/010/012/013 ยัง draft ไม่ได้เซ็น; UX-011 signed ตามคำตอบจริง 2026-10-11. ตรวจเอกสารกับ page source ที่ระบุ ไม่ใช่ browser/QA/sign-off. ใช้ skill School Bright และ policy WCAG 2.2 AA; ไม่อ้าง Figma ใหม่. ก่อน frontend ใช้ส่วนที่พึ่ง draft ต้องคนเซ็น และ schema/owner ที่เกี่ยวข้องพร้อมแยกต่างหาก.

ข้อเสนอ UX ที่เหลือสำหรับคนตรวจ (ไม่ถาม UX-007 หรือ BR-42 ซ้ำ): UX-008 คงต้นทางหลังสำเร็จ มีปุ่มไปปลายทาง; UX-010 แสดงชื่อห้องเสมอพร้อมชื่อเต็มเมื่อ focus; UX-012 เปิดทุกรายการใน scroll region; UX-013 ใช้ปุ่ม "เสร็จสิ้น" จน owner ยืนยัน academic deep-link. ทุกข้อเป็น recommended proposal รวม copy/states ในแต่ละ draft ให้คนปรับหรือเซ็นได้; ไม่ถือว่าคนเลือกแล้ว.
UX-009 ปิด OD-1 แล้ว: jtrp98 วันที่ 2026-10-11 ตอบ “อนุมัติ UX-009 ทั้งฉบับ เลือกลากทั้งบล็อก (แนะนำ)” ครอบ flow/copy/layout/a11y และคำชี้แจง BR-29 (ช่องเรียนติดกัน ไม่มีพักคั่น อนุญาตเวลาเปลี่ยนคาบ). FE-023 ใช้ signed artifact ได้ตาม plan; schema/T1/deploy และ draft อื่นยังต้องหลักฐานของตัวเอง. การอนุมัตินี้ไม่ใช่ runtime QA.

## ขั้นตอนหลังเซ็น

ผู้ใช้เซ็นในตาราง Sign-off ท้ายแต่ละไฟล์ (อนุมัติ/แก้ไข ระบุได้รายไฟล์) → `project-manager` เพิ่ม task ลง `plan.md` (ID และเฟสเป็นดุลยพินิจของ PM) → `frontend-engineer` ทำงานอ้างไฟล์ที่เซ็นแล้วเท่านั้น

UX-011 ปิด OD-1 และ UX gate แล้ว: jtrp98 วันที่ 2026-10-11 ตอบ “อนุมัติ UX-011 ทั้งฉบับ สรุปเป็นชั่วโมงและนาที (แนะนำ)” ครอบ flow/copy/layout/a11y ตามคำถาม; สรุปภาระเป็นชั่วโมงและนาที. Dev schema approval ของ BE-013 อยู่ใน DES-014/015 แยกจากการเซ็น UX และไม่อนุมัติ shared DDL/cutover/deploy.

## Change Log

- 2026-10-11 — บันทึก UX-011 signed ทั้งฉบับตามคำตอบจริงของ jtrp98 และปิด OD-1 ชั่วโมงและนาที; ไม่เปลี่ยน task Status หรืออ้างผล runtime.

- 2026-10-09 — อัปเดตทะเบียน UX-007 ตามคำอนุมัติ layout/flow, URL query และ preselect ตามเงื่อนไขของ jtrp98 วันที่ 09/10/2026; ขอบเขตและส่วนที่ยังไม่เซ็นอยู่ใน artifact
- 2026-10-09 — reference UX-007 หลัง align DES-009 §34.2a; คง draft/partial approval และชี้รายการ precise copy/รายละเอียด/UX-005 ที่ยังไม่เซ็น
- 2026-10-09 — register/amend UX-008..UX-013 ครบ6drafts พร้อม flow/states/copy/a11y/Sign-off ว่างและข้อเสนอ UX ที่เหลือ; schema/owner/T1 conditional ตาม plan/data-model provenance; ไม่เซ็นหรือเปลี่ยน task Status
- 2026-10-09 — align ทะเบียน UX-013 กับ DES-016 §41.4a concrete proposal ที่มีแล้วและ owner gates/recovery; คง draft/ไม่มี Sign-off ใหม่
- 2026-10-11 — อัปเดตทะเบียน UX-009 เป็น signed ตามคำอนุมัติจริงของ jtrp98 ทั้งฉบับ/ลากทั้งบล็อก พร้อมหลักฐาน BR-29 ใน artifact; drafts อื่นคงเดิมและไม่เปลี่ยน task Status
