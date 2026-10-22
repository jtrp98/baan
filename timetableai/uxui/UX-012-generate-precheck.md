# UX-012 — แผงตรวจความพร้อมก่อนจัดตารางสอน (Generate Precheck) (UX-012)

> ไฟล์ต่อ artifact (งบไม่กำหนดใน des-014 — คงกระชับ) · เขียนโดย `uxui-designer` · Status `draft` เท่านั้น

- **Status:** signed (ร่างเดิม + ส่วน fold จาก UX-014 ตามลำดับ sign-off ข้างล่าง)  <!-- บันทึกตามคำตอบจริงของ jtrp98 ไม่ใช่ agent เซ็นเอง -->
- **Signed by:** jtrp98 · **Signed on:** 2026-10-11 (ขอบเขตแรก = ร่างเดิม; ส่วน fold จาก UX-014 เซ็นเพิ่มแล้วตามแถว Sign-off ที่ 2 — ดู Sign-off)
- **Traces:** REQ-014, AC-033..AC-035, DES-011
- **Sources:** `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx`, `design\des-011.md`

## User Flow

1. **การตรวจสอบก่อนเริ่มจัดตารางอัตโนมัติ (Precheck Evaluation):**
   - เมื่อผู้ใช้เข้าสู่หน้า "จัดการตารางสอน" (`/timetable/manage-teaching-schedule`) หรือหลังจากเลือกหลักสูตร/แผนการเรียน
   - ระบบประเมินความพร้อมของทุกวิชาในแผนที่เลือก (\(\text{วิชา} \times \text{ห้องเรียน}\)):
     - ตรวจสอบว่ามีวิชาที่มีเหตุ "จัดไม่ได้โดยนิยาม" หรือไม่ (2 เหตุบล็อก):
       1. `NoEligibleTeacher`: ไม่มีครูผู้มีคุณสมบัติสอน (ไม่มีชื่อใน `TPlanCourseTeacher`, ติดจำกัดห้องประจำชั้น, หรือไม่ใช่ครูผู้ดูแลห้อง)
       2. `ZeroPeriodsPerWeek`: จำนวนคาบต่อสัปดาห์เป็น 0 หรือว่างเปล่า
     - ตรวจสอบคำเตือน (Warnings — ไม่บล็อก): โควตาไม่ลงตัวกับคาบต่อเนื่อง, ห้องไม่ได้ตั้งความจุ, กลุ่มวิชาชนเพราะ Link Subject

2. **การแสดงแผงแจ้งเตือนและบล็อก (Precheck Panel & Blocker State — AC-033, AC-034):**
   - หากพบ Blocker แม้แต่รายการเดียว:
     - ปุ่ม "จัดตารางสอนด้วย AI" และปุ่ม "Regenerate" จะอยู่ในสถานะ **Disabled**
     - แผง **"ความพร้อมก่อนจัดตารางสอน" (Precheck Banner / Modal)** จะแสดงขึ้นมาอย่างชัดเจนด้านบนของกริด
     - แสดงรายการ Blocker ทั้งหมดครบทุกรายการ (ไม่หยุดที่รายการแรก):
       - ชื่อวิชา / รหัสวิชา / แผนการเรียน / ห้องเรียน
       - เหตุผลที่บล็อก (เช่น "ไม่มีครูผู้สอนที่มีคุณสมบัติ", "จำนวนคาบต่อสัปดาห์เป็น 0")
       - **ปุ่มทางลัด (Shortcut Link — AC-033):** ทุก blocker มีทางลัดไปหน้า "จัดการหลักสูตร/แผน" จากเมนู runtime; เฉพาะ `sDetail: RoomCaretaker` เพิ่มทางลัด "ตั้งค่าห้องเรียน" ใน subject-settings (เปิดในแท็บใหม่ เพื่อคงสถานะกริดเดิมไว้)

3. **การตรวจสอบใหม่โดยไม่ต้องรีโหลดหน้า (Re-check Flow — AC-035):**
   - หลังผู้ใช้ไปแก้ไขข้อมูลในแท็บอื่นเสร็จแล้ว กลับมาที่หน้านี้
   - ผู้ใช้กดปุ่ม **"ตรวจสอบข้อมูลใหม่" (Re-check)** ที่แผง Precheck
   - ระบบดึงข้อมูล maps ใหม่และประเมินซ้ำทันที โดยไม่ล้างกริดหรือเซลล์ที่ถูกล็อกไว้
   - หากข้อมูลโหลดครบและ blocker หมดไป: แผง Blocker ปิดลง; ปุ่ม "จัดตารางสอนด้วย AI" เปิดเมื่อ gate required/conflict data อื่นพร้อมด้วย ไม่ปลดด้วยข้อมูลล้มเหลว

## States

| State | ผู้ใช้เห็นอะไร | ข้อความ (copy) |
|---|---|---|
| loading (checking) | Spinner ขนาดเล็กที่หัวแผง Precheck | กำลังตรวจสอบความพร้อมของวิชาและเงื่อนไข… |
| clean (ไม่มี blocker) | ปุ่มจัดตารางเปิดใช้งานปกติ แผง Precheck ซ่อนตัว | พร้อมสำหรับการจัดตารางสอน |
| blocked (`isGenerateBlocked`) | แผงสีแดงเตือนชัดเจน ปุ่ม Generate ปิดใช้งาน | ไม่สามารถจัดตารางสอนได้: พบ {count} รายการที่ไม่พร้อมจัดตาราง |
| warning only | แถบสีส้มแจ้งคำเตือน ปุ่ม Generate ยังกดได้ | มี {count} ข้อสังเกต แต่ยังสามารถจัดตารางสอนได้ |
| error (`recheckFailed`) | Inline toast สีแดงเมื่อ Re-check ล้มเหลว | ไม่สามารถตรวจสอบข้อมูลใหม่ได้ กรุณาลองอีกครั้ง |
| no permission for shortcut | ทางลัดแสดงเป็นข้อความแนะนำแทนลิงก์ | กรุณาติดต่อผู้ดูแลระบบเพื่อกำหนดครูผู้สอนในระบบจัดการหลักสูตร |

## Layout & Interaction

- **Precheck Alert Banner:**
  - วางอยู่ระหว่าง Filter Toolbar และ Timetable Grid
  - พื้น Surface/Secondary `#FFFFFF` ขอบและไอคอน Error token `#DA1A0C`; ข้อความ Text/Primary ตาม School Bright
  - ส่วนหัว: ไอคอน `TriangleAlert` สีแดง + ข้อความสรุป + ปุ่ม "ตรวจสอบใหม่" (Secondary button)
  - รายการตารางย่อย: ตารางแสดงรายละเอียดทุกรายการแบบเปิดทั้งหมด เลื่อนได้เมื่อยาว ไม่มี first-3/ดูเพิ่มเติมที่ซ่อน blocker (AC-034)
- **Shortcut Action:**
  - ลิงก์ปุ่มลูกศรเฉียง `ExternalLink` สีน้ำเงิน เปิดหน้าแก้ไขในแท็บใหม่ (`target="_blank" rel="noopener noreferrer"`)

## Accessibility

- แผง Blocker มี `role="region"` พร้อม `aria-label="แผงตรวจสอบความพร้อมก่อนจัดตารางสอน"`
- เมื่อเกิดสถานะบล็อก Announcement จะแจ้งผ่าน `aria-live="polite"`
- คีย์บอร์ดสามารถ Tab เข้าไปกดลิงก์ทางลัดและปุ่มตรวจสอบใหม่ได้สะดวก
- ต้องวัดสีตัวอักษร/พื้นหลังตาม WCAG2.2 AA (ข้อความปกติ ≥ 4.5:1); ยังไม่ได้วัดจริง

## Open Decisions

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน |
|---|---|---|---|
| 1 | ความสูงของรายการ blocker ที่เปิดครบทุกแถว (AC-034 ไม่ซ่อน 3 รายการแรก) | (ก) ตาราง Scrollable สูงตามพื้นที่หน้าจอ มีทุกแถวและ keyboard เลื่อนถึงทุกแถว (แนะนำ) / (ข) ตารางเปิดครบยืดตามเนื้อหาโดยไม่มีส่วนยุบ | jtrp98 / 2026-10-11 — ปิด: เลือก (ก) |

### คำตัดสิน OD-1 — jtrp98 2026-10-11

- คำตอบจริง: 1A 2A 3A
- ผล: รายการ blocker สูงตามพื้นที่หน้าจอ มีทุกแถวและเลื่อนด้วย keyboard ได้ครบ ไม่ยุบหรือซ่อนบางรายการ
- who/when ตามผู้ใช้ระบุ: `jtrp98 / 2026-10-11`; บันทึกคำตัดสินของมนุษย์ เฉพาะ OD-1 ไม่ขยายเป็น schema/owner/security/DDL/deploy/release approval. ข้อความใน Sign-off และ Change Log เดิมเป็นประวัติก่อนคำตอบนี้.

### รายละเอียด states / copy ที่พร้อมให้คนตรวจ (ยัง draft)

- AC033: ประเมินทุก sub-course ของทุกแผนใน sPlanIDs × ห้องของแผนในตาราง แม้วิชานั้นไม่ได้เลือกใน Schedule Summary. ทุกเหตุแสดง courseCode/courseName/plan/class ที่มี source; id ใช้แทนชื่อถ้าโหลดชื่อไม่ได้ ไม่เดา. BR27 มีเพียง NoEligibleTeacher กับ ZeroPeriodsPerWeek; RoomCaretaker เป็น sDetail ของ NoEligibleTeacher ไม่ใช่เหตุบล็อกที่สาม.
- AC034: header "พบ {จำนวน} รายการที่ต้องแก้ก่อนจัดตาราง"; เปิดรายการทั้งหมดใน scroll region พร้อมจำนวนรวมและช่องทางแก้ของทุกแถว. ทุกแถวอยู่ในรายการ ไม่ใช้ pagination/first3/ยุบที่ทำให้ blocker หาย. กลุ่ม/ลำดับการแสดงตามแผนแล้ววิชาเป็นข้อเสนอ UX ยังไม่ใช่กติกา solver.
- AC035: "ตรวจสอบข้อมูลใหม่" โหลด maps ตาม BR28 แล้วแทนผลเมื่อโหลดครบเท่านั้น; ระหว่างรอปิด Generate/Regenerate, คงกริด/ล็อก/selection เดิม. ล้มคง blocker เก่าและสถานะไม่พร้อม; ห้ามผล stale ของ context เก่าปลดปุ่ม. ไม่โหลดกติกาทุกชุดใหม่เกินข้อยกเว้น BR28. การวางมือไม่ถูกบล็อกด้วยรายการ precheck แต่ยังผ่านกติกาวางตาม REQ009/DES013.
- ทางลัดทุก blocker resolve จากข้อมูลเมนูที่ user ได้รับอยู่แล้ว ตาม BR51/SAQ13; ไม่ hardcode URL/route academic หรือเดา deep-link parameters. ลิงก์เปิดแท็บใหม่โดยแจ้ง accessible name "เปิดแท็บใหม่". ไม่มีสิทธิ์/resolve ไม่ได้ → ข้อความแนะนำที่ไม่มีลิงก์; RoomCaretaker เสนอ link subject-settings เพิ่มเฉพาะเมื่อปลายทาง/สิทธิ์พร้อม ไม่เลือก C2 เอง.

| State | ผู้ใช้เห็นอะไร | Copy draft |
|---|---|---|
| no selection / empty plan | ยังไม่เลือกแผนหรือไม่มีวิชา; Generate ปิดจน context/ข้อมูลจริงครบ; ข้อความอย่างเดียว ไม่มี CTA ของ empty | "เลือกหลักสูตรและแผนก่อนตรวจความพร้อม" / "แผนที่เลือกไม่มีรายวิชาสำหรับจัดตาราง" |
| loading first / recheck | Spinner ที่หัวแผง มีรายการเดิมให้ดูเมื่อ recheck แต่ไม่ใช้เป็นผลพร้อม | "กำลังตรวจสอบรายวิชาและสิทธิ์ครู…" |
| blocker NoEligibleTeacher | แถวเหตุและทางลัดหลักสูตร/แผน | "ไม่มีครูที่มีสิทธิ์สอนวิชานี้ในห้อง {ห้อง} กรุณาตรวจครูประจำวิชาและข้อจำกัดห้อง" |
| ~~blocker RoomCaretaker detail~~ | ~~แสดงห้องประจำวิชา/ผู้ดูแลจาก room data ที่มีจริง และทางลัดเพิ่ม~~ | ~~"ผู้ดูแลห้อง {ห้องพิเศษ} คือ {ผู้ดูแล} แต่ไม่ผ่านสิทธิ์สอนวิชานี้ในห้อง {ห้องเรียน} กรุณาตรวจผู้ดูแลและการมอบหมายครู"~~ **[แทนที่โดย fold — ดูหัวข้อ "Fold จาก UX-014" ก่อน Sign-off]** |
| blocker ZeroPeriodsPerWeek | แถวเหตุพร้อมทางลัดหลักสูตร/แผน | "จำนวนคาบต่อสัปดาห์ของวิชานี้เป็น 0 หรือยังไม่กำหนด กรุณาตั้งค่าในหลักสูตร/แผน" |
| warnings only | Warning section แยกจาก blockers; ไม่มีข้อความว่าต้องแก้ทั้งหมดเพื่อ Generate | "มี {จำนวน} ข้อสังเกต ตรวจรายละเอียดก่อนจัดตาราง"; ใช้ BR53 ทั้ง4, RoomSettingMissing conditionalK1 และ SubjectGroupPinnedConflict ตาม UX009/010 |
| error maps/recheck | failure ช่องทางเดียว; ไม่ลบ blocker/ไม่อ้าง clean | "ตรวจความพร้อมไม่สำเร็จ กรุณาลองตรวจสอบใหม่ ข้อมูลเดิมยังไม่ใช่ผลตรวจล่าสุด" |
| success / clean | ตรวจครบไม่มี blockers; แสดงผลสำเร็จ/live summary ขณะปุ่มยังต้องผ่าน readiness อื่น | "ตรวจความพร้อมครบแล้ว ไม่พบรายการบล็อก" |
| no permission shortcut | แถว/เหตุยังอยู่ ไม่มี link | "กรุณาให้ผู้มีสิทธิ์ตรวจข้อมูลในหน้าจัดการหลักสูตร/แผน" |
| no permission page/action | UX004 เดิม; ไม่เพิ่มสิทธิ์/ปุ่มฝ่าข้อจำกัด | 401 SessionExpired เท่านั้น; 403 ช่องทางเดิม |

Layout/a11y draft: แผงถาวรระหว่าง toolbar/grid ตามร่างเดิม; table header ชัด ทุก row wrap เหตุยาว/ชื่อวิชา ไม่ตัดข้อความที่ใช้แก้ปัญหา. Scroll region keyboard เข้าออกได้ไม่มี trap; focus errorแรก/หัวแผงเมื่อผู้ใช้กด Generate ที่ถูกบล็อก ไม่ขโมย focus ระหว่าง auto load. มี live summary, link text ระบุแผน+แท็บใหม่, error alert; warning icon+ข้อความไม่พึ่งสี. reuse Alert/Button/Card/token School Bright/TH Sarabun New/8px/radius12px/48px, responsive จอแคบเป็นแถวอ่านครบ และ WCAG2.2 AA ต้องตรวจจริง.

Evidence 2026-10-09: อ่าน workspace/page จริงพบ isScheduleDataReady/required-load gates และ GenerateResultPanel; ไม่พบ lstGenerateBlockers/NoEligibleTeacher/ZeroPeriodsPerWeek ใน page ที่ค้น. ไม่ตรวจ child generator/browser จึงไม่อ้างว่า target precheck ทำแล้ว. Gate: FE023/024/025 + UX signoff/backend/room-owner schema/read path ยังต้องพร้อมก่อน FE026; DES011 ต้องเปิดพร้อม BR41/DES015 ตาม SAQ8,ไม่ถือ verified draft เป็น release/signoff.

## [Fold จาก UX-014 — 2026-10-11 — เซ็นแล้ว jtrp98 2026-10-11]

> **สถานะ: เซ็นแล้ว (jtrp98 2026-10-11 — ดูแถวที่ 2 ใน Sign-off).** คัดมาจาก `UX-014-multi-caretaker-delta.md` §C (signed ในตัวมันเอง 2026-10-11) ตามที่ jtrp98 อนุญาต fold โดยต้องเซ็นส่วน fold ซ้ำ. Sign-off เดิมของไฟล์นี้ไม่ครอบคลุมบล็อกนี้. ข้อความเดิมที่ถูกแทนขีดฆ่าไว้ ไม่ลบ. blocker/endpoint/ทางลัดไม่เปลี่ยน. `roomCaretakerMismatch`/`roomCaretakerLinkRequired` เป็นเหตุปฏิเสธตอนวางมือ/solver ไม่ใช่รายการใน precheck (ดู UX-010 ส่วน fold).

| State | ผู้ใช้เห็นอะไร | ข้อความ (copy) |
|---|---|---|
| warning `RoomCaretakerNotInPlan` | ส่วน Warning (ไม่บล็อก ไม่ปิด Generate); **หนึ่งแถวต่อห้อง** (OD-5 ก) ใช้ detail `{sRoomID, roomName, notCounted:[{nTeacherID, sTeacherName\|null}], hasCountedCaretaker}` ตาม DES-013 §38.5a ข้อ 3 / DES-011; รายชื่อผู้ดูแลที่ไม่นับตัดทอน 3 + ขยาย; ชื่อ null → "ไม่พบข้อมูลชื่อครู (รหัส {nTeacherID})"; `roomName` ไม่มี → `sRoomID` | "ห้อง {ห้อง}: ผู้ดูแล {ชื่อ…} ไม่ได้อยู่ในแผน/หลักสูตรของภาคเรียนนี้ จึงไม่นับ" · ถ้า `hasCountedCaretaker = false` ต่อท้าย "ห้องนี้จึงใช้ตามความจุ ไม่บังคับ Link Subject" |
| warning `RoomSettingMissing` | คงตาม UX-010 (แยกความจุ/ผู้ดูแลขาด) ไม่ออกซ้ำกับ `RoomCaretakerNotInPlan` เหตุเดียวกัน | ตาม UX-010 |
| blocker `NoEligibleTeacher` (`sDetail: RoomCaretaker`) | แทนแถว "blocker RoomCaretaker detail" เดิม (ผู้ดูแลคนเดียว); ระบุชุดผู้ดูแลที่นับได้ (3 คน + "และอีก {m} คน"); ทางลัด/เงื่อนไขลิงก์ตามที่ signed เดิม | "ผู้ดูแลที่นับได้ของห้อง {ห้อง} ({ชื่อ1}, {ชื่อ2} และอีก {m} คน) ไม่มีใครมีสิทธิ์สอนวิชานี้ในห้อง {ห้องเรียน} กรุณาตรวจผู้ดูแลห้องและการมอบหมายครู" |
| คำเตือนรวม | จำนวนข้อสังเกตรวมแถวใหม่ตามเดิม | "มี {จำนวน} ข้อสังเกต ตรวจรายละเอียดก่อนจัดตาราง" |

A11y: แถว warning ใหม่ icon + ข้อความ ไม่พึ่งสี; ปุ่มขยายรายชื่อเป็น `<button>` มี `aria-expanded`/`aria-controls` และเป้าหมาย ≥48px.

## Sign-off (คนเท่านั้น)

| ผู้เซ็น | วันที่ | ผล (อนุมัติ/แก้ไข) | หมายเหตุ |
|---|---|---|---|
| jtrp98 | 2026-10-11 | อนุมัติ (ตามที่ผู้ใช้เลือก) | เลือกอนุมัติ sign-off ผ่านคำตอบ AskUserQuestion (review แล้ว ตามที่ผู้ใช้เลือก) ขอบเขต = ร่างปัจจุบันของไฟล์นี้ · **ไม่ครอบคลุมส่วนผู้ดูแลหลายคนที่ UX-014 ยังไม่ sign-off** (จะ fold ตอน align และต้องให้ผู้ใช้เซ็นส่วนที่ fold อีกครั้ง — เช่น copy/ทางลัด RoomCaretaker ที่อิงผู้ดูแลคนเดียว) · Open Decision #1 (ความสูงรายการ blocker) ผู้ใช้ยังไม่ได้ตอบเป็นรายข้อ จึงไม่บันทึกว่าปิด · gate FE-023/024/025, room-owner schema/read path ยังแยก ไม่ถูกปิดด้วย sign-off นี้ |
| jtrp98 | 2026-10-11 | อนุมัติส่วน fold จาก UX-014 (ตามที่ผู้ใช้เลือก) | ตอบ AskUserQuestion "เซ็นทั้ง UX-010 และ UX-012 (Recommended)" · ขอบเขต = เนื้อหาหัวข้อ "Fold จาก UX-014" เท่านั้น (แถวเตือน RoomCaretakerNotInPlan ต่อห้อง + blocker NoEligibleTeacher ชุดที่นับได้) · ไม่ใช่การอนุมัติ schema/DDL/deploy/security/release · OD-1 (ความสูงรายการ blocker) ยังเปิดตามเดิม · gate FE-023/024/025 และ room-owner schema/read path ยังแยก |

## Change Log

- 2026-10-11 — บันทึกคำตัดสิน OD-1 ของ jtrp98: เลือก (ก) — รายการ blocker สูงตามพื้นที่หน้าจอ มีทุกแถวและเลื่อนด้วย keyboard ได้ครบ ไม่ยุบหรือซ่อนบางรายการ; เก็บประวัติ sign-off เดิม ไม่ปิด gate อื่น.

- 2026-10-11 — บันทึก sign-off ส่วน fold จาก UX-014 ตามคำตอบจริงของ jtrp98 (เพิ่มแถว Sign-off ใหม่); ปรับ Status และเปลี่ยนป้ายหัวข้อ fold จาก "รอเซ็นซ้ำ" เป็น "เซ็นแล้ว"; แถว Sign-off เดิมและเนื้อหาอื่นไม่ถูกแก้; OD-1 ยังเปิด.

- 2026-10-11 — fold ส่วนผู้ดูแลหลายคนจาก UX-014 §C เป็นหัวข้อติดป้าย "รอ jtrp98 เซ็นซ้ำ"; ขีดฆ่า (ไม่ลบ) แถว blocker RoomCaretaker เดิม; ปรับ Status เป็น "signed ตามร่างเดิม; ส่วน fold ยังไม่เซ็น"; Sign-off เดิมไม่ถูกแก้. ส่วน fold ยังไม่เซ็น.

- 2026-10-11 — บันทึก sign-off ตามคำตอบจริงของ jtrp98 (AskUserQuestion) ต่อร่างปัจจุบัน; ไม่ครอบคลุมผู้ดูแลหลายคน (UX-014) ซึ่งต้องเซ็นใหม่หลัง fold; OD-1 ยังไม่ถูกตอบเป็นรายข้อ.

- 2026-10-09 — amend UX-012 ครบ AC033/034/035: blockers เปิดครบ scrollable ไม่ซ่อน first3, shortcut/runtime fallback, recheck fail-closed และ states/copy/a11y; เปลี่ยนสีนอก token; คง draft/ไม่มี human sign-off.

Back-links: `..\index.md`
