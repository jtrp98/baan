# TP-001 — License และสิทธิ์เครื่อง (TP001-009–TP001-010)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-009"></a>

## TP001-009 — non-admin unbind

AC: [AC-035-01 (ผู้ไม่มีสิทธิ์ผู้ดูแลขอปลดเครื่องแล้วถูกปฏิเสธ และการผูกเครื่องไม่เปลี่ยน)](../../modules/app-shell/shared/requirements/req-035.md), [AC-035-02 (ผู้ดูแลปลด A แล้ว B เปิดใช้ Key เดิมได้ทันที แม้ A…)](../../modules/app-shell/shared/requirements/req-035.md), [AC-035-03 (B ต้องเปิดใช้ Key ออนไลน์ครั้งแรก ไม่ใช้สิทธิ์ออฟไลน์ของ A แทน)](../../modules/app-shell/shared/requirements/req-035.md), [AC-035-04 (หลัง Key ผูกกับ B แล้ว A ตรวจออนไลน์ไม่ผ่านและไม่ได้สิทธิ์ออฟไลน์รอบใหม่)](../../modules/app-shell/shared/requirements/req-035.md) · References: [DES-002 (License และ device binding)](../design/des-002.md) · Level: integration · Profiles: PF-API, PF-HOST

เงื่อนไขก่อนตรวจ: License bound A; admin/ไม่ใช่ admin/admin โรงเรียนอื่น; เครื่อง B; A มี entitlement เหลือ; fake clock

ขั้นตอน: non-admin unbind; admin unbind (If-Match ถูก/stale); B activate ทันที; B ลอง offline ด้วย entitlement ของ A; A validate online หลังย้าย; A activate กลับเอง; unbind∥activate race

ผลที่คาด: non-admin ถูกปฏิเสธ binding เดิม; ไม่สร้าง License ใหม่; B activate ได้ทันทีไม่รอ 3 วัน; B ต้องออนไลน์ครั้งแรก; A online→BINDING_REVOKED ไม่ได้สิทธิ์ใหม่; A activate เองไม่ได้ยกเว้น next_device_jkt; BindingEpoch เพิ่ม; audit ครบ; unbind If-Match จาก ETag(UpdateDate); stale→`412 VERSION_CONFLICT`+`details.current_etag`; ขาด→`428 PRECONDITION_REQUIRED`

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-010"></a>

## TP001-010 — A offline ที่ E-1s, E, E+1s

AC: [AC-035-05 (A ที่ออฟไลน์ยังใช้ได้ก่อนสิทธิ์เดิมหมด แต่ครบกำหนดแล้วเข้าโหมดหลักไม่ได้)](../../modules/app-shell/shared/requirements/req-035.md) · References: DES-002 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: A entitlement exp=E แล้วย้ายไป B

ขั้นตอน: A offline ที่ E-1s, E, E+1s; A online หลังย้าย

ผลที่คาด: ก่อน E ใช้ได้; ที่ E locked; ย้ายไม่เลื่อน E; รู้ผลปฏิเสธออนไลน์แล้วหยุดใช้ cache ทันที

หลักฐานที่ต้องเก็บ: E-TRACE+E-API

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ
