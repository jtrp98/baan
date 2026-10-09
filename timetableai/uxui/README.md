# timetableai — UX Drafts (`uxui/`)

ร่างโดย `uxui-designer` · วันที่ร่าง: 2026-09-29 · แก้ล่าสุด 2026-10-04 (บันทึก sign-off — UX-001..UX-004, UX-006 ผู้ใช้อนุมัติ as-is · ร่างเดิม 2026-09-29/30)
As-built basis: `sb-tech-upgrade-web-system` branch `backlog/ACA-5111` @ `c212ca6` + UI review 2026-09-29
Spec basis: `design.md` Rev 14 (DES-022 §47 — UX-006/UX-004) · Rev 13 (DES-019 BR-80/81/81a; Rev 12: DES-020, DES-022 §47, §43.2), `requirement.md` (AC-054/055/063/064; OQ-34..37 ปิดแล้ว)

**UX-001..UX-004 และ UX-006 เซ็นแล้ว — ผู้ใช้อนุมัติ as-is 2026-10-04 (ดูตาราง Sign-off ท้ายไฟล์) · UX-005 ยังเป็นร่างไม่มีผู้เซ็น** · UX sign-off เป็นการกระทำของคน
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
| [UX-007-term-context.md](UX-007-term-context.md) | บริบท/ตัวเลือกเทอมบนทั้ง 7 routes (อ้าง `TTerm` เท่านั้น) + สถานะเทอมว่าง/endpoint ล้ม/VR-8/VR-9 + ผลของการเปลี่ยนเทอม — **ร่าง 2026-10-07 รอเซ็น** | REQ-012 AC-027, DES-009 §34.2/§34.4/§34.6 | การเซ็นของผู้ใช้ + OD-1 (กลไกค้างเทอมข้ามหน้า — SA) · schema confirmation §27.5 |

## สิ่งที่ยังเปิดอยู่และต้องการคำตัดสินของคน

ปิดแล้ว (ผู้ใช้ยืนยัน 2026-09-30 — ไม่ใช่ตัวบล็อกอีกต่อไป): BR-81a (T_c = ⌈H_c / D_c⌉ ต่อห้อง · `ConsecutiveHeavy` เฉพาะระดับ 2 · ระดับ 0 ไม่มี UI ข้อเสนอแนะ) · D53/OQ-35 (เมนูปิด → UX-006) · SA-Q16 (หมวดจาก `TCourseGroup`; ค่าจริงยังรอ SA-Q18 — มี fallback)

- **ถ้อยคำทั้งหมดในทุกไฟล์เป็นข้อเสนอ** (ป้ายระดับ, `sSuggestion`, tooltip เมนูปิด, ข้อความ 403) — ผู้ใช้แก้ได้ ณ ตอนเซ็น
- **ผู้ใช้ตัดสินเพิ่ม 2026-09-30** (บันทึกใน "Decided by user" ท้ายไฟล์): UX-003 เตือนเฉพาะคู่ (ห้อง, วัน) ที่เพิ่งกลายเป็นละเมิด (รวมคู่ที่ตกเกณฑ์เพราะ T_c ลดหลังการแก้; L0 ไม่เตือน) · T_c คำนวณใหม่ต่อห้องจากกริดปัจจุบันหลังวาง/สลับ/ย้าย/ลบที่สำเร็จทุกครั้ง — ตรงกับ design.md Rev 13 (SA แก้สัญญาแล้ว ผู้ใช้ยืนยัน) · `ConsecutiveHeavy` `nThreshold = null` ไม่แสดงเพดาน · UX-006 เมนูปิดที่ตรงหน้าปัจจุบันไฮไลต์แต่คลิกไม่ได้ + tooltip ไม่มีบรรทัดติดต่อผู้ดูแล
- **ผู้ใช้ตัดสินเพิ่ม 2026-09-30 (รอบหลัง)**: UX-006 loading = ทุกรายการปิด + Spinner เล็กที่หัวกลุ่ม · ตรวจสิทธิ์ไม่สำเร็จ = ปิด + ไอคอนเตือน + tooltip ให้โหลดใหม่ ไม่ retry อัตโนมัติ · UX-003 toast หลายคู่ สูงสุด 3 แล้ว "และอีก k คู่" · คำนำ toast TH "แก้ไขตารางสำเร็จ" / EN "Timetable edited"
- **UX-006 ตรวจตรง design.md Rev 14 แล้ว (2026-09-30):** 4 สถานะรายการแยกกันได้ (enabled / noPermission = กุญแจ / loading = ทุกรายการปิด + spinner เล็กที่หัวกลุ่ม / checkFailed = ทุกรายการปิด + ไอคอนเตือน + tooltip ให้ reload) · "ไม่มีสิทธิ์" = 200 + `isRead:false` เท่านั้น — 401/403/5xx/network/timeout/ผิดรูป/ขาด MenuID = checkFailed · Sidebar ไม่เริ่ม SessionExpired และไม่แสดงข้อความ 401/403 · ไม่ retry อัตโนมัติ (ครั้งเดียวต่อการโหลดหน้า ในหน่วยความจำ) · UX-004 ปรับให้สอดคล้อง
- **ผู้ใช้ตัดสินเพิ่ม 2026-09-30 (UX-006):** reduced-motion → ตัวบ่งชี้โหลดที่หัวกลุ่มเป็นแบบนิ่ง · checkFailed → ไอคอนเตือนทั้งหัวกลุ่มและทุกรายการ
- **ผู้ใช้ตัดสินเพิ่ม 2026-09-30 (UX-004):** 403 ระดับหน้า (URL ตรงโดยไม่มีสิทธิ์) มีลิงก์ "กลับหน้าหลัก"
- **ยังเปิดอยู่ ("Open for user")**: วัด contrast `#7B8F9C` บน `#1F262D` · ชุดไอคอนจริงของ Sidebar · Sidebar หุบ/mobile · การเซ็นถ้อยคำ tooltip (ครบ 4 รายการ)
- **ปิดแล้ว 2026-10-04 — ผู้ใช้อนุมัติ as-is ครบทั้ง 4 รายการข้างบนพร้อมการเซ็น UX-006** · สิ่งที่ยังค้างเป็นขั้นตอนตรวจของ `frontend-engineer` ก่อน implement: วัด contrast `#7B8F9C` บน `#1F262D` ด้วยเครื่องมือ และยืนยัน as-built (ชุดไอคอนจริงของ Sidebar, Sidebar หุบ/mobile)
- `plan.md` FE-002 ยังอาจมีข้อความ "รอ SA-Q16" ที่ล้าสมัย — ไม่อยู่ในสิทธิ์ของ `uxui-designer`; เป็นของ `project-manager`/`system-analyst`

## ขั้นตอนหลังเซ็น

ผู้ใช้เซ็นในตาราง Sign-off ท้ายแต่ละไฟล์ (อนุมัติ/แก้ไข ระบุได้รายไฟล์) → `project-manager` เพิ่ม task ลง `plan.md` (ID และเฟสเป็นดุลยพินิจของ PM) → `frontend-engineer` ทำงานอ้างไฟล์ที่เซ็นแล้วเท่านั้น
