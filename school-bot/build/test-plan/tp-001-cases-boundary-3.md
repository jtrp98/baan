# TP-001 — ความปลอดภัยและการกู้คืน (TP001-082–TP001-082)

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — แยกเคส normal/full ก่อนพัฒนาและตรวจรับ)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-082"></a>

## TP001-082 — ออกจากระบบและคงสิทธิ์ License

ระดับ: normal

BE-006/BE-039: normal เฉพาะแถว 1 ของตาราง logout; malformed/ไม่มี token/security/limits/fault แถว 2–4 และ fixtures ด้านล่างเป็น **ระดับ: full** แยกจากชนิดการตรวจ unit/integration/host อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


อ้าง [AC-036-06 (เมื่อสั่งออกจากระบบของบัญชี Login…)/BR-036-05 (การออกจากระบบของบัญชี Login ต้องเพิกถอนสิทธิ์ของเซสชันนั้นผ่านช่องทางบริ…)](../../modules/app-shell/shared/requirements/req-036.md), [decisions-046 (Gateway dev และระยะเวลา replay ของ License)](../../shared/decisions/decisions-046.md), [decisions-049 (อนุมัติแก้รอบ 3 แบบแคบ B gRPC logout และ Gateway typed logout)](../../shared/decisions/decisions-049.md), [decisions-050 (Gateway รับเส้น SchoolBot ตาม convention เดิมของ Gateway (controller))](../../shared/decisions/decisions-050.md), [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](../design/des-004.md), [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](../design/des-012.md), [ขอบเขต Logout ผ่าน Gateway](../design/gateway-logout-slice-001.md), [gateway-logout-negative-boundary-001](../design/gateway-logout-negative-boundary-001.md), [gateway-controller-entry-001](../design/gateway-controller-entry-001.md)

ชนิดการตรวจ: unit/logic ตรวจ validator/rate-limiter/trailer/logger; integration ตรวจ HTTP API Gateway (`POST /api/service-school-bot/v2/auth/logout`) → gRPC SchoolBot service (`SchoolBotSessionService.Logout`) และ DB session store/audit ตาม PF-API/PF-LEGACY/PF-WEB/PF-ADMIN; UI/host ตรวจการล้างสถานะบัญชีและคงสิทธิ์ License บนเครื่องตาม PF-HOST/PF-UI-WIN/PF-UI-MAC เมื่อ full Login และ [FE-002 (Login UI)](../plan/index.md) พร้อม

Owner: Implementation = [BE-006 (Login/session)](../plan/index.md)/sys, [BE-039 (เชื่อม SchoolBot ผ่าน Gateway)](../plan/index.md)/sys, FE-002/front · Validation = [QA-001 (License QA)](../plan/index.md)/check

เงื่อนไขก่อนตรวจ (Preconditions / Fixture):

- เซสชันบัญชี Login ที่ใช้งานอยู่ 2 เซสชันแยกกัน (Session A ของคำขอที่สั่ง logout และ Session B ของอีกคำขอ/อุปกรณ์) พร้อม License lease ของเครื่องที่ active (`checked_at`/วันหมดอายุเดิม)
- ชุดคำขอไม่มี/ผิดรูป token: ไม่มี `Authorization`, รูปแบบผิด, JWT (รวม JWT ที่ถูก revoke), `Authorization` ซ้ำ, ส่ง token ใน body, body ขนาด 64 KiB และ >64 KiB (65537 bytes)
- ชุดตรวจช่องทางและขอบเขตความปลอดภัย: untrusted service peer, metadata ขาด/ผิดรูป/ซ้ำ (`x-caller` ไม่ใช่ `api-gateway`, `x-request-id` ไม่ใช่ UUID-D, `x-lang` ผิด, `traceparent` ผิด, metadata รวม >16384 bytes, แนบ Cookie/identity/tenant/forwarded headers ปลอม), `Origin` ไม่อยู่ใน allowlist, HTTP method อื่น (GET/PUT/DELETE/PATCH/HEAD/OPTIONS), เรียกเส้นทางพี่น้อง/private/v1/admin หรือยิงตรงเข้า SchoolBot โดยไม่ผ่านช่องทางที่ได้รับอนุญาต, เปิดโหมด Production/ปิด `SchoolBotLogoutOptions.Enabled`
- ชุดขีดจำกัดและบริการขัดข้อง: ยิงเกิน source limiter (30/60s) และ concurrency limiter (8/queue 0), จำลอง auth store ล่ม (`AuthenticationUnavailableException`), unexpected exception, ยกเลิกคำขอ/หมดเวลา (15s outer deadline) และ Gateway↔SchoolBot trailer ผิดรูป/เกินขนาด/UUID ไม่ตรง

ชุดข้อมูล ขั้นตอน และผลที่คาดทุกกรณีอยู่ใน [ตารางตรวจ Logout ของ TP001-082](tp-001-logout-matrix.md)

ขอบเขตหลักฐาน local และข้อรอระบบจริงอยู่ที่ [หลักฐาน Logout](tp-001-logout-evidence.md)

หลักฐานที่ check ต้องเก็บเมื่อรันครบ: unit/local harness logs; E-API แบบ sanitized (HTTP↔RPC correlation `X-Request-Id`, build/config/proto hash, fault point, DB session/audit rows ก่อน–หลัง และ log scan ว่าไร้ token/secret); E-TRACE + E-UI สำหรับการกด logout บน Desktop/Web และตรวจว่า License lease คงเดิม

ผลจริง: NOT_RUN; หลักฐาน local ไม่ใช่การตรวจรับครบวงจร



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · RPC = Remote Procedure Call · JWT = JSON Web Token
