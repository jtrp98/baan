# UX-008 — การคัดลอกกติกาและตารางสอนข้ามเทอม-ปี (5 จุดเข้า + Flow Preview/Apply)

> ไฟล์ต่อ artifact (งบไม่กำหนดใน des-014 — คงกระชับ) · เขียนโดย `uxui-designer` · Status `draft` เท่านั้น

- **Status:** signed  <!-- บันทึกตามคำตอบจริงของ jtrp98 ไม่ใช่ agent เซ็นเอง -->
- **Signed by:** jtrp98 · **Signed on:** 2026-10-11 (ขอบเขต = ร่างปัจจุบันของไฟล์นี้; ดู Sign-off)
- **Traces:** REQ-013, AC-029..AC-032, AC-050, AC-051, DES-010, DEC-010
- **Sources:** 5 หน้ารายการใน `src/app/[locale]/timetable/`, `design\des-010.md` §35, skill `school-bright-design`

## User Flow

1. **จุดเข้าตามบริบทของหน้า (AC-029, AC-030):**
   - ผู้ใช้กดปุ่ม "คัดลอกข้อมูลข้ามเทอม/ปี" ที่ส่วนหัวของ 1 ใน 5 หน้า:
     - `/timetable` → ล็อกขอบเขต `scope: all` (คัดลอกทุกกติกา + ตารางสอนที่สร้างเสร็จแล้ว)
     - `/timetable/manage-timetable` → ล็อกขอบเขต `scope: teacherConditions` (กลุ่มครู + เวลาไม่ว่าง)
     - `/timetable/settings` → ล็อกขอบเขต `scope: systemConditions` (เพดานคาบ/ชั่วโมง, homeroom, intensity)
     - `/timetable/create-class-period` → ล็อกขอบเขต `scope: classPeriods` (คาบเรียน template)
     - `/timetable/subject-settings` → ล็อกขอบเขต `scope: subjectConditions` (วิชาต่อเนื่อง, link subject, subject rooms)
2. **ขั้นตอนที่ 1: เลือกต้นทาง-ปลายทาง (Select Scope & Target):**
   - Modal แสดงขึ้นมา:
     - ปี/เทอมต้นทาง (Source Year/Term) — default คือปี/เทอมปัจจุบันที่เปิดดูอยู่
     - ปี/เทอมปลายทาง (Destination Year/Term) — dropdown เทอมจริงจาก `TTerm` ของโรงเรียน
     - หากเป็น `scope: all` จะมีส่วนแสดงรายการตารางสอนของต้นทางให้เลือก (checkbox รายตาราง หรือเลือกทั้งหมดตาม BR-69)
   - ผู้ใช้กดปุ่ม "ตรวจสอบข้อมูล (Preview)"
3. **ขั้นตอนที่ 2: สรุปผลการตรวจสอบและการยืนยัน (Preview & Confirmation — AC-031):**
   - ระบบเรียก `Copy/Preview` และนำผลมาแสดง:
     - **รายการที่จะสร้างใหม่:** จำนวนและชื่อจาก Preview §35.2 — ไม่กำหนดชื่อ field เพิ่มเอง; `lstCreated` เป็นผล Apply §35.3
     - **รายการที่จะถูกแทนที่/เขียนทับ:** แสดงชื่อ/จำนวนตาม Preview §35.2 เป็นแถบ Warning หากปลายทางมีข้อมูล; `lstOverwritten` ใช้สรุปผล Apply
     - **คำเตือนการจับคู่ (`lstUnmatched` / BR-68):** แสดงทุก `{kind, source, reason}` ที่จับคู่ไม่ได้; `lstSkipped` เป็นผล Apply · checkbox draft "คัดลอกเฉพาะส่วนที่จับคู่ได้" ต้องยืนยันแยกและส่ง `isConfirmPartial:true`
     - **กรณีบล็อก (BR-67/BR-70):** `lstMissingTemplates` แสดง `sourceTemplateName/referencedBy`; `lstDependents` แสดง `kind/name/nPeriodID` — มีอย่างใดอย่างหนึ่งปิด Apply ทั้งคำสั่ง · จัดการ template/dependents ที่ปลายทางแล้ว Preview ใหม่ ไม่สร้าง template หรือ re-point เอง
   - หากปลายทางมีข้อมูลที่จะถูกเขียนทับ ผู้ใช้ต้องทำเครื่องหมายถูกที่ช่อง:
     - `[ ] ข้าพเจ้ารับทราบว่าข้อมูลเดิมในเทอมปลายทางจะถูกแทนที่ทั้งหมด` (บังคับติ๊กเพื่อปลดล็อกปุ่มยืนยัน)
4. **ขั้นตอนที่ 3: ดำเนินการคัดลอก (Apply — AC-032):**
   - ผู้ใช้กดปุ่ม "ยืนยันการคัดลอก (Apply)"
   - ระบบส่งคำขอพร้อม `sPreviewToken` ไปยัง `Copy/Apply` ภายใน transaction เดียว
5. **ขั้นตอนที่ 4: สรุปผลลัพธ์ (Result Modal):**
   - แสดงผลสำเร็จจริงจาก backend (`status: 1`):
     - แจ้งจำนวนรายการที่สร้างใหม่, เขียนทับ, และรายการที่ข้าม
     - ปุ่ม "ไปยังเทอมปลายทาง" หรือ "ปิดหน้าต่าง"

## States

| State | ผู้ใช้เห็นอะไร | ข้อความ (copy) |
|---|---|---|
| loading (preview) | Spinner กลาง Modal พร้อม disable ปุ่มตรวจสอบ | กำลังตรวจสอบข้อมูลเทอมปลายทาง… |
| loading (apply) | Spinner พร้อม disable ปุ่มยืนยัน ป้องกันการกดย้ำ | กำลังคัดลอกข้อมูล กรุณารอสักครู่… |
| empty (ต้นทางไม่มีข้อมูล) | แถบสีเทาแจ้งเตือน ไม่สามารถกด Preview ได้ | ไม่พบข้อมูลในเทอมต้นทางที่เลือก |
| error (DestinationChanged) | แถบสีแดงแจ้งเตือนว่าสถานะปลายทางเปลี่ยนระหว่างทำรายการ | ข้อมูลปลายทางมีการเปลี่ยนแปลง กรุณากดตรวจสอบใหม่อีกครั้ง |
| error (MissingTemplate) | แถบสีแดงแจ้งเหตุผลที่บล็อกการคัดลอก | ไม่สามารถคัดลอกได้: ไม่พบโครงสร้างคาบเรียน (Template) ที่ตรงกันในเทอมปลายทาง |
| success | Modal แสดงไอคอนสำเร็จสีเขียว พร้อมสรุปจำนวน | คัดลอกข้อมูลสำเร็จเรียบร้อยแล้ว |
| no permission | ปุ่มคัดลอกที่หน้าจอหลักถูก disabled | ไม่มีสิทธิ์แก้ไขข้อมูลในหน้านี้ |

## Layout & Interaction

- **Trigger Button:** ปุ่มกลางสไตล์ Secondary/Outline ใช้ Web Primary token `#09C6DD` หรือปุ่มไอคอนสำเนาพร้อมข้อความ "คัดลอกข้ามเทอม/ปี" ที่ Action Bar มุมขวาบนของแต่ละหน้า
- **Modal ขนาดกลาง (600px - 720px — สมมติฐานด้าน layout ยังไม่ยืนยัน):**
  - Header: หัวข้อระบุชัดเจนตามเมนู เช่น "คัดลอกเงื่อนไขครูข้ามเทอม/ปี"
  - Body: แบ่ง 2 ส่วน (ส่วนเลือกต้นทาง-ปลายทาง และส่วนแสดงผล Preview)
  - Footer: ปุ่ม "ยกเลิก" (Secondary) และปุ่ม "คัดลอกข้อมูล" (Primary/Warning ตามสถานะการเขียนทับ)

## Accessibility

- Focus trap ทำงานถูกต้องเมื่อเปิด Modal
- การกดปุ่ม `Esc` สามารถปิด Modal ได้ (หากไม่อยู่ในสถานะกำลัง Apply)
- ช่อง checkbox ยืนยันการเขียนทับมี `aria-describedby` ชี้ไปยังคำเตือน
- รองรับการนำทางด้วยคีย์บอร์ด (Tab, Shift+Tab, Spacebar เพื่อเลือก checkbox, Enter เพื่อส่ง)
- ต้องตรวจ contrast ของข้อความเตือนและปุ่มตาม WCAG 2.2 AA (ข้อความปกติ ≥ 4.5:1) ก่อนอ้างว่าผ่าน; ยังไม่ได้วัดจริง

## Open Decisions

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน |
|---|---|---|---|
| 1 | เมื่อคัดลอกสำเร็จ ควรนำทาง (redirect) ไปยังปี/เทอมปลายทางทันที หรือให้อยู่ที่หน้าเดิม | (ก) แสดงตัวเลือกให้ผู้ใช้เลือกว่าจะไปเทอมปลายทางหรือไม่ (แนะนำ คงต้นทางจนผู้ใช้เลือก) / (ข) เปลี่ยน context ของหน้าเป็นเทอมปลายทางอัตโนมัติ | jtrp98 / 2026-10-11 — ปิด: เลือก (ก) |

### คำตัดสิน OD-1 — jtrp98 2026-10-11

- คำตอบจริง: 1A 2A 3A
- ผล: คัดลอกสำเร็จแล้วอยู่หน้าเดิม พร้อมปุ่มให้ผู้ใช้เลือกไปปี/เทอมปลายทาง ไม่เปลี่ยน context อัตโนมัติ
- who/when ตามผู้ใช้ระบุ: `jtrp98 / 2026-10-11`; บันทึกคำตัดสินของมนุษย์ เฉพาะ OD-1 ไม่ขยายเป็น schema/owner/security/DDL/deploy/release approval. ข้อความใน Sign-off และ Change Log เดิมเป็นประวัติก่อนคำตอบนี้.

### Contract / states ที่ต้องอ่านประกอบร่าง

- Draft copy/checkbox/layout ทั้งหมดรอคนเซ็น; ไม่เพิ่มธุรกิจ/API. ต้นทางและปลายทางเลือกปี/เทอมได้อิสระในโรงเรียนเดียว; default เฉพาะ context ที่ผ่าน Terms ตาม UX-007. เปลี่ยน source/destination/scope/ตารางที่เลือกหลัง Preview → ผล/token/checkbox ยืนยันเดิมหมดใช้ ต้อง Preview ใหม่.
- `scope=all` เลือกตาราง 0..ทั้งหมดรวม inactive ได้ (BR-69). เลือก 0 ยังแทนตารางปลายทางทั้งหมดตาม BR-66: คำเตือน draft "ไม่ได้เลือกตารางต้นทาง ตารางเดิมทั้งหมดในปลายทางจะถูกลบเมื่อยืนยัน". ไม่ถือเป็น empty โดยอัตโนมัติ. แต่ละอีก 4 จุดเข้าไม่มี checkbox ผสมเมนู; systemConditions ไม่ทับ blob กติกาวิชา; subjectConditions รวม RoomSetting ตาม §35.8 และไม่รวม teacher assignment เก่า.
- Preview เป็น read-only; Apply ใช้ `sPreviewToken`, `isConfirmOverwrite` ตามที่ยืนยัน และ `isConfirmPartial` เมื่อมี unmatched. `lstMissingTemplates` (subjectConditions/teacherConditions — BR-67; all พา template มาด้วย) และ `lstDependents` (classPeriods — BR-70) ต้องบล็อกก่อนส่วนยืนยัน; ไม่ส่ง Apply เพื่อทดลองดูว่าจะผ่านหรือไม่.

| State เพิ่ม | ผู้ใช้เห็นอะไร | Copy draft / ทางกลับ |
|---|---|---|
| loading (ปี/Terms/ตาราง) | Spinner; Preview/Apply ปิดจน context และข้อมูลพร้อม | "กำลังโหลดข้อมูลต้นทางและปลายทาง…" |
| empty (Terms) | ข้อความอย่างเดียว ไม่มี CTA ของ empty; ไม่เดาเทอม | "ปีการศึกษานี้ไม่มีภาคเรียน จึงยังคัดลอกข้อมูลไม่ได้" |
| warning (partial) | รายการ unmatched ทั้งหมด + ยืนยันแยกจากเขียนทับ | "ข้อมูลบางรายการจับคู่กับปลายทางไม่ได้ ตรวจรายการก่อนยืนยันคัดลอกส่วนที่จับคู่ได้" |
| blocked (dependents) | รายการอ้าง template ทั้งหมด; Apply ปิด | "คัดลอกโครงคาบไม่ได้ เพราะข้อมูลปลายทางยังอ้างโครงคาบเดิม กรุณาจัดการรายการที่แสดงแล้วตรวจสอบใหม่" |
| error (request/status/shape) | ช่องทาง failure เดียว; ไม่แสดง success; ไม่ส่ง Apply ซ้ำอัตโนมัติ | "คัดลอกไม่สำเร็จ กรุณาตรวจข้อมูลปลายทางแล้วตรวจสอบใหม่ก่อนยืนยัน"; 401 ใช้ SessionExpired เท่านั้น, 403 ตาม UX-004 |
| error (confirmation/context) | `ConfirmationRequired`/`PartialMatchConfirmationRequired` กลับ Preview; `InvalidCopyScope`/`TermNotInYear` กลับเลือกข้อมูล; `NothingToCopy` แจ้งผลจริง | "กรุณาตรวจสอบข้อมูลและยืนยันรายการอีกครั้ง"; ไม่เดา payload/field ที่ contract ไม่ได้กำหนด |
| success (verified response) | อ่าน `status===1` และผลจริง `lstCreated/lstOverwritten/lstSkipped`; รายการพร้อม reason, ไม่มี success จาก HTTP เพียงอย่างเดียว | "คัดลอกข้อมูลสำเร็จ สร้างใหม่ {จำนวน} รายการ แทนที่ {จำนวน} รายการ ข้าม {จำนวน} รายการ"; ปลายทางเป็นข้อมูลอิสระ แก้แล้วไม่กระทบต้นทาง (AC-032) |

Layout draft: reuse Dropdown/Button/ModalConfirm ที่มีจริง, Text/Primary/Warning/Error/Success ตาม School Bright; TH Sarabun New, 8px grid, radius12px, touch48px และแถบ context ห่อบนจอแคบ. ชื่อยาว/รายการ preview wrap ไม่ตัด reason; รายการยาวเลื่อนได้และเข้าถึงทุกแถวด้วย keyboard. เปิด modal โฟกัสหัวเรื่อง/field แรก, ยืนยันความเสี่ยงโฟกัส "ยกเลิก", ปิดคืน trigger; ประกาศผลผ่าน live region และ error ผ่าน alert. การรองรับ keyboard/focus/contrast ของ component ต้องตรวจจริง ยังไม่ใช่ QA.

Evidence 2026-10-09: อ่าน page ของ `/timetable`, `[year]`, `settings/[year]`, `subject-settings/[year]`, `create-class-period/[year]`, `manage-timetable/[year]` จริง; พบ component กลางและ term context แต่ไม่พบ `Copy/Preview`/`Copy/Apply` ใน page ที่อ่าน — flow นี้เป็นข้อเสนอ target ไม่ใช่ as-built; ไม่อ้าง modal `/academic` เป็น precedent. ใช้ DES-010 §35.2/3/7/8/9 + REQ-013 เป็นสัญญา; Sources แบบเดิมไม่ได้ยืนยัน Figma ใหม่.

Dependencies: §35.9 ยังรอ schema/owner ที่ Copy consume (BE-012/013, data-model §27.6). บันทึก archive:2717 ไม่ใช่ human approval. ไม่มีสิทธิ์ข้าม schema gate แม้ UX ผ่าน reviewer หรือคนเซ็น UX; C1′ ยังต้อง owner edit/copy contract ก่อน implement.

## Sign-off (คนเท่านั้น)

| ผู้เซ็น | วันที่ | ผล (อนุมัติ/แก้ไข) | หมายเหตุ |
|---|---|---|---|
| jtrp98 | 2026-10-11 | อนุมัติ (ตามที่ผู้ใช้เลือก) | เลือกอนุมัติ sign-off ผ่านคำตอบ AskUserQuestion (review แล้ว ตามที่ผู้ใช้เลือก) ขอบเขต = ร่างปัจจุบันของไฟล์นี้เท่านั้น · ไม่ใช่การปิด schema/owner gate (§35.9, BE-012/013, data-model §27.6 ยังเป็นเงื่อนไขแยก) · Open Decision #1 (redirect หลังคัดลอกสำเร็จ) ผู้ใช้ยังไม่ได้ตอบเป็นรายข้อ จึงไม่บันทึกว่าปิด — ร่างแนะนำ (ก) ยังเป็นข้อเสนอ |

## Change Log

- 2026-10-11 — บันทึกคำตัดสิน OD-1 ของ jtrp98: เลือก (ก) — คัดลอกสำเร็จแล้วอยู่หน้าเดิม พร้อมปุ่มให้ผู้ใช้เลือกไปปี/เทอมปลายทาง ไม่เปลี่ยน context อัตโนมัติ; เก็บประวัติ sign-off เดิม ไม่ปิด gate อื่น.

- 2026-10-11 — บันทึก sign-off ตามคำตอบจริงของ jtrp98 (AskUserQuestion) ต่อร่างปัจจุบัน; ไม่แก้เนื้อหา design; OD-1 ยังไม่ถูกตอบเป็นรายข้อ; ไม่ปิด schema/owner gate.

- 2026-10-09 — amend UX-008: แยก Preview fields/Apply results ให้ตรง DES-010, เติม partial/dependents/zero-table warning, request states/a11y/evidence และ schema dependency; ใช้ School Bright token; คง draft/ไม่มี human sign-off.

Back-links: `..\index.md`
