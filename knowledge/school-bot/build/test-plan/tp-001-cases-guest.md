# TP-001 — บัญชีและพื้นที่ Guest (TP001-021–TP001-024)

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — แยกเคส normal/full ของ TP001-024 สำหรับ BE-031)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-021"></a>

## TP001-021 — บันทึกและเปิดหลายงานทั้งสามโหมด

AC: [AC-036-01 (Guest ที่มี License บันทึกและเปิดหลายงานทั้งสามโหมดในเครื่องได้โดยไม่ต้อ…)](../../modules/app-shell/shared/requirements/req-036.md) · References: [DES-003 (หลายโครงงาน Local/Cloud)](../design/des-003.md), [BR-036-01 (Guest ไม่ต้องมีบัญชี แต่ต้องมี License ตาม REQ-009/034)](../../modules/app-shell/shared/requirements/req-036.md) · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: Guest+License valid ไม่ Login

ขั้นตอน: บันทึกและเปิดหลายงานทั้งสามโหมด

ผลที่คาด: ทำได้ในเครื่องโดยไม่ Login ไม่เรียก Cloud API (request=0); workspace ร่วมหนึ่งแห่งต่อ OS account ใต้ app data root; ไม่ใช้ชื่อโครงงานเป็น path; per-project lock+atomic replace; index เป็น derive/rebuild ได้

หลักฐานที่ต้องเก็บ: E-TRACE

ผลจริง: NOT_RUN

<a id="tp001-022"></a>

## TP001-022 — Login แล้ว save/open Cloud

AC: [AC-036-02 (นักเรียนและครู Login ด้วยบัญชีเดิมและ License แล้วบันทึก/เปิดโครงงาน…)](../../modules/app-shell/shared/requirements/req-036.md), [AC-036-04 (บันทึก Cloud ไม่สำเร็จแล้วแจ้งความล้มเหลว ไม่แสดงว่า Cloud…)](../../modules/app-shell/shared/requirements/req-036.md) · References: DES-003, [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](../design/des-004.md) · Level: integration · Profiles: PF-API, PF-LEGACY, PF-HOST

เงื่อนไขก่อนตรวจ: บัญชีเดิม student และ employee (sanitized); Cloud save fail: timeout/503/DB commit fail/lost response; logout แล้ว login บัญชีอื่น

ขั้นตอน: Login แล้ว save/open Cloud; inject fail; retry Idempotency-Key เดิม

ผลที่คาด: เก็บ/เปิดโครงงานของตนได้; fail→แจ้งล้มเหลว ไม่แสดงสำเร็จ ไม่ผูกบัญชีอื่น ไม่สลับ Guest; retry ไม่สร้างซ้ำ; บัญชีใหม่ไม่เห็น/ไม่รับ callback ของเก่า

หลักฐานที่ต้องเก็บ: E-API+E-UI

ผลจริง: NOT_RUN

<a id="tp001-023"></a>

## TP001-023 — login desktop

AC: AC-036-02 · References: DES-004, [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](../design/des-012.md) · Level: integration · Profiles: PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: บัญชี/โปรไฟล์ sanitized: ถูก, ผิด, ปิด, หลายโปรไฟล์; โรงเรียนไม่มี/มี License; token ผิด channel

ขั้นตอน: login desktop; bind profile; school_web ไม่มี License; ใช้ desktop token เรียก endpoint ครู; ยิงเกิน rate limit; bind ซ้ำ/คนละ P

ผลที่คาด: ผิด/ปิด→401 UNAUTHORIZED แบบเดียว; ต้องมี License active+device proof; school_web ไม่มี License→403 LICENSE_REQUIRED; ผิดช่อง→403 CHANNEL_NOT_ALLOWED; bind ครั้งเดียว→409 SESSION_ALREADY_BOUND; 429+Retry-After; ไม่ log password/token

หลักฐานที่ต้องเก็บ: E-API+log scan

ผลจริง: NOT_RUN

<a id="tp001-024"></a>

## TP001-024 — ทดลอง local

ระดับ: normal

เฉพาะ BE-031/AC-036-05 (และ BE-015): ครูบน Desktop (`P=employee` รวมกรณี `sEmp==sId` ของนักเรียนในห้อง) เก็บโครงงาน Cloud ได้แต่เรียกสร้าง/แก้ไข/อ่าน attempt และส่ง submission ไป Cloud ทางตรงได้ 403 PROFILE_NOT_ALLOWED โดยไม่เกิดแถวผล Cloud ของครู ตาม [รายละเอียด TP001-024 ส่วน normal](tp-001-normal-learning-quiz.md#tp001-024-normal) และ [ตาราง normal](tp-001-normal-index.md); ส่วนการนำเข้า Guest ที่มีประวัติผลและ retry/worker ของ BE-026 เป็น **ระดับ: full**

AC: [AC-036-05 (ครูทดลองภารกิจ/ข้อสอบ local และเก็บโครงงาน Cloud ได้ แต่ส่ง…)](../../modules/app-shell/shared/requirements/req-036.md) · References: DES-004, [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md), learning-rules-032-034, [BR-036-04 (เลือกนำเข้า Guest ตาม REQ-041/042 ไม่ auto-upload)](../../modules/app-shell/shared/requirements/req-036.md) · Level: integration · Profiles: PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: employee P บน Desktop; นักเรียนที่ sId==sEmp (ชน); Guest import มี/ไม่มีประวัติผล

ขั้นตอน: ทดลอง local; เก็บโครงงาน Cloud; POST submission/attempt ตรง; import Guest มีประวัติ; import เฉพาะโครงงาน; retry/worker

ผลที่คาด: local ได้ Cloud project ได้ (OwnerKind=employee); submission/attempt→403 PROFILE_NOT_ALLOWED ก่อนสร้างผล/job; import ที่มีประวัติ→ปฏิเสธทั้งคำขอ ไม่บางส่วน; import เฉพาะโครงงานผ่าน; ไม่มีแถวผล Cloud ของครู; ไม่เชื่อ ID client

หลักฐานที่ต้องเก็บ: E-API DB rows=0

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · REQ = Requirement หรือข้อกำหนด · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · OS = Operating System
