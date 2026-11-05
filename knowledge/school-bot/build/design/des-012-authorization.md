# DES-012 — Authorization, admin API และ browser session

> Rev 9 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (อ้างมติ 052 — อายุ Desktop session นับจากเวลา bind)

ส่วนต่อของ [DES-012 (auth ข้ามระบบ)](des-012.md) ตรวจสิทธิ์ทุก request และตรวจจาก School DB กับ SchoolBot DB ซ้ำก่อน commit

## แหล่งสิทธิ์

| Actor | ช่องทาง Session | แหล่งสิทธิ์ที่ยืนยัน | ใช้กับ |
|---|---|---|---|
| ผู้ดูแลโรงเรียน (`school_admin`) | `school_web` | ผล `web-principal` ที่ตรวจกลุ่มแอดมิน/ผู้บริหารฝั่ง server หรือ super admin เดิมตาม [มติ 035 (แหล่งสิทธิ์ school_admin)](../../shared/decisions/decisions-035.md) | [DES-008 (mapping ช่องคะแนน)](des-008.md) mapping/GradeSlot, เปิด/ปิด `CourseRun` + `PlanCourseIds`, อ่านสถานะ export (และ grant หากเปิดใช้ fallback) |
| ครูรายวิชา | `school_web`, `P=employee` | `TplanCourseTeacher(SchoolId, PlanCourseId, SEmp=P)` `IsActive & !CDel`; `TEmployees` ไม่ถูกลบ `WorkStatus ∉ {2,3}`; `TplanCourse` `CourseStatus=1`; `TplanCourseTerm` `NTerm` ตรง; ห้อง ∈ `TplanTermSubLevel2` | [DES-005 (หลักสูตรและผลประเมิน)](des-005.md) ตรวจ Arm, [DES-009 (preview และส่งคะแนน)](des-009.md) preview/confirm/resolve, [DES-010 (ข้อสอบและ Attempt)](des-010.md) policy/override/retake, [DES-011 (เลื่อน Level)](des-011.md) proposal, [DES-008 (mapping ช่องคะแนน)](des-008.md) อ่าน |
| พนักงานส่วนกลาง SchoolBright | `staff_admin` | `SchoolBotStaffRole` active ใน SchoolBot DB (publish เนื้อหากลางและคลังข้อสอบต้องผ่าน **four-eyes** ตาม [มติ 025 (แลก token ผ่าน Gateway และแยกสิทธิ์ตามช่องทาง)](../../shared/decisions/decisions-025.md) H6) | `/v2/admin/*` (ปิด `/v1/admin/*` static bearer ตาม [มติ 025 (แลก token ผ่าน Gateway และแยกสิทธิ์ตามช่องทาง)](../../shared/decisions/decisions-025.md) H8) |
| นักเรียนและครูบน Desktop | `desktop` | [DES-004 (ตัวตนและสิทธิ์)](des-004.md) (`P=student` หรือ `employee` ตาม [มติ 025 (นโยบาย auth และช่องทาง)](../../shared/decisions/decisions-025.md) และ [มติ 026 (รับแบบที่ปรับแล้ว)](../../shared/decisions/decisions-026.md)) | ใช้เรียน/ทดลองและจัดการ `SchoolBotProject` ของตน (ไม่มีเมนูครู/ส่งคะแนนบน Desktop; `Submission`/`Attempt` และนำเข้าประวัติ จำกัดเฉพาะ `P=student` ตาม [มติ 032 (ครูเก็บ Project Cloud ได้ แต่ไม่สร้างผลเรียน Cloud)](../../shared/decisions/decisions-032.md); employee เก็บ project Cloud ได้) |

`is_admin` จาก request body/header/query ไม่เป็น authority JWT พนักงานที่มี IsAdmin=0 ไม่ตัดสิทธิ์หากตรวจกลุ่มผ่าน สิทธิ์กลุ่มจำกัด school_web และโรงเรียนที่ตรวจแล้ว ไม่เป็น staff_admin หรือสิทธิ์ครูทุกคน ตรวจ mapping และสถานะพนักงาน/โรงเรียน/กลุ่มซ้ำก่อน commit; mapping หรือ lookup ยังไม่พร้อมให้ fail closed ตาม [เกณฑ์ admin ของ Gateway](gateway-integration-admin.md)

## Staff endpoints

ชนิด Data Transfer Object (DTO) ใช้ [พจนานุกรมชนิด](des-012-exchange.md#ชนิดและข้อผิดพลาด) `StaffRoleView`/`StaffRole` ใช้ [พจนานุกรมข้อมูล](data-model.md)

- `GET /v2/admin/staff-roles` (`staff_admin`) → `{items:[StaffRoleView],next_cursor}`
- `POST /v2/admin/staff-roles` `{school_id:I,employee_id:I,role:StaffRole,valid_until:D|null,reason:T1000}` → `201 StaffRoleView` (+ ETag)
- `DELETE /v2/admin/staff-roles/{id}` + `If-Match` (`ETag` จาก `UpdateDate`) → `200 {id:K,deleted:true,update_date:D}`
- `POST /v2/admin/sessions/revoke` `{school_id:I,profile_id:I|null,legacy_admin_id:T64|null,channel:T16|null,reason:T1000}` → `200 {revoked:integer>=0}`

## Browser security และอายุ session

Cross-Origin Resource Sharing (CORS) คงกฎไม่ส่ง `Access-Control-Allow-*`; Origin นอก allow-list → `403 ORIGIN_NOT_ALLOWED` เป้าหมาย web-system เก็บ token ใน memory (Zustand); admin web เก็บใน `__Host-sb-admin` HttpOnly cookie การใช้ cookie เพื่อ mutation ต้องตรวจ Origin และ Cross-Site Request Forgery (CSRF) ก่อน

อายุ absolute: school_web 30 นาที; staff_admin 8 ชั่วโมง ทั้งสองไม่เกิน SourceTokenExpiresAt เมื่อมีค่า Desktop มีอายุ 8 ชั่วโมงหลัง bind สำเร็จ (`ExpiresAt = เวลาที่ bind สำเร็จ + 8 ชั่วโมง`) ตาม [มติ 052 (อายุ Desktop session นับจากเวลา bind)](../../shared/decisions/decisions-052.md) และ [DES-004 (ตัวตนและสิทธิ์)](des-004.md) Rev13; bind ซ้ำ profile เดิมไม่ต่ออายุตาม [Lifecycle](des-004-lifecycle.md)

## หลักฐาน

- เงื่อนไข baseline ครู: `TplanCourseTeacher(SchoolId,PlanCourseId,SEmp)` ที่ `IsActive & !CDel` ร่วม `TEmployees` โรงเรียนตรงและ `CDel null|'0'`; `TplanCourse` ต้อง `CourseStatus=1 & IsActive & !CDel`, `TplanCourseTerm` ต้อง `IsActive & !CDel & NTerm` ตรง; ห้อง join `TplanTermSubLevel2` ด้วย PlanId ที่ `IsActive & !CDel` ร่วม `TtermSubLevel2` ที่ `!CDel & NWorkingStatus=1` เงื่อนไขเหล่านี้เป็นผลอ่าน source เดิม ไม่แทน roster authority
- หลักฐานครูจาก academic: `TeacherRepository.cs:24–32,111–122` ตรวจครูรายวิชา/แผน/เทอม; `PlanCourseRepository.cs:194–215` join ห้องผ่าน PlanId แต่ query นี้ไม่กรองครูและ SchoolId ทุก alias จึงไม่ใช่ authorization ที่คัดลอกใช้ได้ทันที
- [มติ 035 (กลุ่ม admin และ super admin)](../../shared/decisions/decisions-035.md) ปิดเฉพาะ policy; technical proof, implementation และ H5 (เงื่อนไข route/env/network/trust ระหว่างระบบ) คงค้าง
- ผู้ใช้ยืนยันในแชตวันที่ 2026-11-02 ว่า Desktop session มีอายุ 8 ชั่วโมงหลัง bind สำเร็จ ตาม [มติ 052 (อายุ Desktop session นับจากเวลา bind)](../../shared/decisions/decisions-052.md); [DES-004 (ตัวตนและสิทธิ์)](des-004.md) Rev13 ใช้จุดเริ่มนับนี้ร่วมกับ DES-012 Rev9
- กฎผลเรียนร่วมอยู่ใน [learning-rules-032-034.md](learning-rules-032-034.md)
