# DES-004 — สิทธิ์ตามช่องทางและ License

> Rev 12 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-004 (ตัวตนและสิทธิ์)](des-004.md) profile ในเอกสารเดิมใช้สัญลักษณ์ `P` หมายถึงชนิดและรหัสนักเรียนหรือพนักงาน ไม่ใช่ AccountId

## สิทธิ์ผู้ใช้

Guest policy ตาม [REQ-040 (พื้นที่ร่วม Guest)](../requirement/req-040.md), [REQ-041 (นำเข้า Project)](../requirement/req-041.md) และ [REQ-042 (นำเข้าประวัติและตรวจใหม่)](../requirement/req-042.md) ยืนยันแล้ว: workspace ร่วมต่อบัญชีระบบปฏิบัติการ (OS account)/ไม่มี PIN, explicit import ตาม [guest-import](guest-import-001.md), history แยกเลือกและตรวจใหม่ตาม [guest-history](guest-history-001.md). Identity ของผู้รับเข้ามาจาก session ไม่ใช่ผู้สร้าง Guest; employee นำเข้า Project ได้ แต่ห้าม Submission/Attempt Cloud. Logout/สลับบัญชี invalidate callbacks และใบรับต้องผูก P เดิม

| Actor | ช่องทาง Session | อนุญาต |
|---|---|---|
| Guest + License | desktop (local) | local projects/Labs/cached published lessons; ไม่มี Cloud identity |
| Student (`P=student`) | desktop | CRUD งานตน (`OwnerKind='student'`), ส่ง/อ่าน submission, ทำ quiz/test attempt และดูผลตนในโหมดเรียน/ทดลอง |
| Teacher บน Desktop (`P=employee`) | desktop | **ใช้เรียน/ทดลองและจัดการโครงงานทดลองของตน (`SchoolBotProject` ที่ `OwnerKind='employee'`) เท่านั้น** ไม่มีเมนูครู ไม่ตรวจงานนักเรียน และไม่ส่งคะแนนใน Desktop ([มติ 022 (Desktop ใช้เรียน)](../requirement/decisions-022.md), [มติ 025 (Login ตามช่องทาง)](../requirement/decisions-025.md) และ [มติ 026 (รับแบบแก้ไข)](../requirement/decisions-026.md)); ใน schema ปัจจุบันไม่อนุญาตให้ `P=employee` สร้างแถวใน `SchoolBotSubmission`/`SchoolBotAttempt` เพื่อป้องกันเลข `sEmp` ชนกับ `sId` นักเรียน (ทาง A ยืนยันแล้วตาม [มติ 032 (ครูเก็บ Project Cloud ได้ แต่ไม่สร้างผลเรียน Cloud)](../requirement/decisions-032.md); ห้ามผล Cloud ของ employee รวม Guest import ตาม [กฎผลเรียน](learning-rules-032-034.md)) |
| ครูรายวิชา (`P=employee`) | school_web ([DES-012 (auth ข้ามระบบ)](des-012.md)) | ดูความคืบหน้า, ตรวจภารกิจ Arm, ตั้งค่า `ScoringPolicy`/override/สอบซ่อม, ยืนยันเลื่อน Level ทั้งห้อง และ preview/ยืนยันส่งคะแนนเฉพาะวิชาที่ตนสอนใน `web-system` |
| ผู้ดูแลโรงเรียน (`IsAdmin=1`) | school_web ([DES-012 (auth ข้ามระบบ)](des-012.md)) | จัดการ `GradeSlot`/`ScoreMapping` ([DES-008 (mapping ช่องคะแนน)](des-008.md)), เปิด/ปิด `CourseRun`, อ่านสถานะ export ของโรงเรียน (และจัดการ grant หากเปิดใช้ fallback) ใน `web-system` |
| พนักงานส่วนกลาง SchoolBright | staff_admin ([DES-012 (auth ข้ามระบบ)](des-012.md)) | `/v2/admin/*` ตาม `SchoolBotStaffRole` (`content_author`, `content_approver` แบบ four-eyes, `level_policy_admin`, `license_admin`, `release_publisher`, `dashboard_viewer`, `staff_admin`) |

ไม่ให้ครูเห็นทั้งโรงเรียนโดยปริยาย; administrative role (`school_admin` / `staff_admin`) ไม่ได้รับสิทธิ์อ่าน source นักเรียนหรือส่งคะแนนแทนครูรายวิชาอัตโนมัติ; session ที่ `Channel` ไม่ตรงกับ endpoint คืน `403 CHANNEL_NOT_ALLOWED`

**License admin:** `/v2/admin/licenses` รวม list/create/revoke/unbind ต้องมี active `license_admin` ใน `SchoolBotStaffRole` และ channel `staff_admin` ตาม [DES-002 (License และ device binding)](des-002.md). role อื่นรวม staff_admin เพียงอย่างเดียวไม่ให้สิทธิ์ License; channel ถูกแต่ role ไม่ครบ → `403 STAFF_ROLE_REQUIRED`. ระบบยืนยันตัวตนยังไม่พร้อม → `503 AUTH_NOT_CONFIGURED`; ไม่มี/ผิด/ถูกถอน session → `401 UNAUTHORIZED`, หมดอายุ → `401 SESSION_EXPIRED` ตาม [AC-027-01 (เกณฑ์จัดการ License)](../requirement/req-027.md); `/v1/admin` static bearer ใช้แทนไม่ได้

### Authority เดียวของรายชื่อนักเรียนที่ได้รับมอบหมาย

ใช้ [ตาราง authority](teacher-authority-001.md): course-teacher ∩ roster ∩ term บน School DB; ทุก read/assessment ใช้ตารางนี้และ re-check ก่อน commit. ไม่สร้าง TeacherGrant; fallback ด้านบนไม่ใช่สิทธิ์ที่เปิดใช้. หลักฐานที่ไม่ครบต้อง fail closed ไม่เดา roster/status/เวลา

**ข้อกำหนดการตรวจ License ตามช่องทาง (ยืนยันตาม [มติ 025 (นโยบาย auth และช่องทาง)](../requirement/decisions-025.md) และ [มติ 026 (รับแบบที่ปรับแล้ว)](../requirement/decisions-026.md)):**
1. **ช่อง `desktop` (`/v2/auth/login` และทุก private request ของ desktop)**: ต้องมี active `SchoolBotLicense` ของโรงเรียน **พร้อม device proof (`DeviceJkt`) ที่ผูกกับเครื่องนั้น** และ `school_id` ตรงกัน; web ตรวจ credential แล้วสร้าง session ผูก `SchoolId`/`DeviceJkt`
2. **ช่อง `school_web` (`/v2/auth/web-sessions` และทุก private request ของ `school_web` ตาม [DES-012 (auth ข้ามระบบ)](des-012.md))**: **ต้องตรวจว่าโรงเรียนมี `SchoolBotLicense` ที่ active (ยังไม่หมดอายุและไม่ถูกเพิกถอน) เช่นกัน แต่ไม่ต้องมี device binding (`DeviceJkt=null`)** หากโรงเรียนไม่มี License ที่ active คืน `403 LICENSE_REQUIRED`
3. **ช่อง `staff_admin`**: ตรวจ `SchoolBotStaffRole` ที่ active ของพนักงานส่วนกลาง ไม่ผูกกับ License ของโรงเรียน

## เกณฑ์ตรวจสิทธิ์

ตรวจ cross-school IDs, เว็บไม่มี License → `403 LICENSE_REQUIRED`, ครู Desktop เรียน/ทดลองได้แต่เรียก endpoint ครู → `403 CHANNEL_NOT_ALLOWED`, การถอนสิทธิ์ระหว่างรายการ และสลับบัญชีแล้วไม่รับ callback/ข้อมูลบัญชีเก่า เกณฑ์เดิมคือ [AC-035-01 (เกณฑ์ปลดเครื่อง/ย้าย Key)](../requirement/req-035.md), [AC-038-03 (เกณฑ์ประเมินงาน)](../requirement/req-038.md), [AC-039-02 และ AC-039-04 (เกณฑ์ติดตามผลโดยครู)](../requirement/req-039.md) อ้าง [REQ-035 (ย้าย Key)](../requirement/req-035.md), [REQ-038 (ประเมินงาน)](../requirement/req-038.md), [REQ-039 (ความคืบหน้าและครู)](../requirement/req-039.md)

## หลักฐาน

- อำนาจรายชื่อใช้ [teacher-authority-001 (ครูรายวิชา ∩ roster ∩ term)](teacher-authority-001.md) และ [กฎผลเรียน](learning-rules-032-034.md)
- นโยบาย Guest สอดคล้อง [REQ-040 (พื้นที่ร่วม)](../requirement/req-040.md), [REQ-041 (นำเข้า Project)](../requirement/req-041.md), [REQ-042 (นำเข้าประวัติและตรวจใหม่)](../requirement/req-042.md)
