# TP-001 — บัญชีและพื้นที่ Guest (TP001-027–TP001-029)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-027"></a>

## TP001-027 — Login ไม่สั่งนำเข้า

AC: [AC-041-01 (มีงาน Guest หลายงานแล้ว Login โดยไม่สั่งนำเข้า ไม่เกิดงานเหล่านั้นในบัญชี)](../requirement/req-041.md), [AC-041-02 (เลือกงาน A แล้วนำเข้า บัญชีเปิด A ได้โหมดและเนื้อหาตรงต้นทาง)](../requirement/req-041.md), [AC-041-03 (หลังนำเข้าแต่ละโหมดสำเร็จ เปิดต้นฉบับใน Guest ได้เนื้อหาเดิม…)](../requirement/req-041.md) · References: [มติ 014 (มติ Guest พื้นที่ร่วม การนำงานและประวัติเข้าบัญชี)](../requirement/decisions-014.md), BR-041 · Level: integration · Profiles: PF-HOST, PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: Guest มีงานหลายงานสามโหมด; บัญชี Login

ขั้นตอน: Login ไม่สั่งนำเข้า; เลือก A นำเข้า; เปิดต้นฉบับ

ผลที่คาด: ไม่มีงานเกิดในบัญชีเอง; A เปิดได้โหมด/เนื้อหาตรง B ไม่ถูกนำเข้า; ต้นฉบับเปิดเนื้อหาเดิม งานอื่นสองพื้นที่ไม่ถูกทับ; Login ไม่เริ่มนำเข้า; เห็นบัญชี/โรงเรียน/profile ปลายทางก่อนสั่ง; Host freeze snapshot+session generation ขณะเลือก; `POST /v2/projects/imports` `{local_project_id,mode,name,content}`; `Idempotency-Key=local_project_id`; `201 {project:CloudProjectDocument}`+ETag หลัง commit เท่านั้น; รับ student+employee (สร้าง Project เท่านั้น ประวัติแยก); Guest UUID ไม่เป็น AccountId; ไม่รับ school/owner/Cloud PK จาก body; audit `Event=GuestProject.Import` Actor=ผู้รับเข้า `Reason=guest-project:<UUID>`; ต้นฉบับทุกชิ้นคงอยู่; สำเร็จรายงานแยกชิ้น

หลักฐานที่ต้องเก็บ: E-API+E-TRACE

ผลจริง: NOT_RUN

<a id="tp001-028"></a>

## TP001-028 — retry import ด้วย receipt/RequestKey เดิม

AC: [AC-041-04 (นำเข้างานเดิมซ้ำในบัญชีเดิม รวม retry หลังคำตอบสูญหาย/เปิดแอปใหม่…)](../requirement/req-041.md), [AC-041-05 (เมื่อบันทึกนำเข้าล้มเหลว ไม่แสดงว่างานนั้นสำเร็จ ต้นฉบับยังเปิดได้…)](../requirement/req-041.md) · References: [DES-003 (หลายโครงงาน Local/Cloud)](../design/des-003.md), [BR-041-03 (ป้องกันนำเข้างานเดิมซ้ำในบัญชีเดิม รวม retry หลังไม่ทราบผล ไม่ทับงานอื่น)](../requirement/req-041.md) · Level: integration · Profiles: PF-HOST, PF-API

เงื่อนไขก่อนตรวจ: import A; lost response; restart แอป; DB fail; 2 clients import พร้อมกัน; บัญชีอื่น

ขั้นตอน: retry import ด้วย receipt/RequestKey เดิม; import ซ้ำ; inject save fail

ผลที่คาด: สำเนา Cloud เดียว ไม่ทับงานอื่น; fail→ไม่แสดงสำเร็จ ต้นฉบับเปิดได้ ไม่ผูกบัญชีอื่น; ใบรับเขียนก่อนส่ง (lock/atomic replace) มี snapshot freeze ไม่อ่านเนื้อหาที่แก้ภายหลัง; response หาย/restart→ส่ง snapshot/key เดิม; replay window ทั่วไป 24 ชม.; พ้น window→`409 IDEMPOTENCY_EXPIRED`+resource_id; Host GET ยืนยัน ไม่ POST ใหม่; UUID เดิมแต่เนื้อหา/ชื่อเปลี่ยน→RequestHash ต่าง→`409 IDEMPOTENCY_CONFLICT` ไม่เปลี่ยน key อัตโนมัติ; งาน Cloud ถูกลบ/สิทธิ์หาย→404/403 state=unavailable ไม่คืนชีพ; แข่งกันเหลือชุดเดียวตาม unique `(SchoolId,Principal,Operation,RequestKey)`; logout ไม่ย้ายใบรับ; callback generation เก่าไม่เติม UI บัญชีปัจจุบัน

หลักฐานที่ต้องเก็บ: E-API DB rows

ผลจริง: NOT_RUN

<a id="tp001-029"></a>

## TP001-029 — เปิดแอปใหม่

AC: [AC-042-01 (Guest ทำภารกิจแล้วเปิดแอปใหม่ ยังเรียกประวัติและความคืบหน้า local…)](../requirement/req-042.md), [AC-042-02 (Login หรือนำเข้าเฉพาะโครงงาน ไม่สร้างผลจากประวัติ Guest…)](../requirement/req-042.md), [AC-042-03 (เลือกย้ายประวัติ A เท่านั้น แล้วมีเฉพาะ A…)](../requirement/req-042.md) · References: decisions-014, BR-042 · Level: integration · Profiles: PF-HOST, PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: Guest ผลภารกิจ A,B (synthetic criteria test-only); บัญชีนักเรียน

ขั้นตอน: เปิดแอปใหม่; Login/import โครงงานเฉพาะ; เลือกย้ายประวัติ A

ผลที่คาด: Guest เรียกประวัติ/ความคืบหน้า local ได้; Login/import โครงงานไม่สร้างผลในบัญชี; มีเฉพาะ A เข้าตรวจใหม่ B ไม่ย้าย ประวัติ local เก็บหลังประเมิน local แบบ atomic ต่อรายการ; `authority:"local"` ไม่ระบุตัวผู้เรียน; เปลี่ยน/ลบโครงงานไม่ทำลาย snapshot; Login/import Project ไม่สร้างผล; เลือก A เท่านั้น→`POST /v2/submissions/guest-imports` `Idempotency-Key=history_id`

หลักฐานที่ต้องเก็บ: E-API+E-TRACE

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · PK = Primary Key
