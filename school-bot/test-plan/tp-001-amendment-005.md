# TP-001 Amendment005 — 2026-10-28

## TP001-082

อ้าง [AC-036-06/BR-036-05](../requirement/req-036.md), [decisions-046](../requirement/decisions-046.md), [decisions-049](../requirement/decisions-049.md), [decisions-050](../requirement/decisions-050.md), [DES-004](../design/des-004.md), [DES-012](../design/des-012.md), [gateway-logout-slice-001](../design/gateway-logout-slice-001.md), [gateway-logout-negative-boundary-001](../design/gateway-logout-negative-boundary-001.md), [gateway-controller-entry-001](../design/gateway-controller-entry-001.md). ต่อจาก TP001-081; cases เดิมไม่เปลี่ยน

ระดับ: unit/logic ตรวจ validator/rate-limiter/trailer/logger; integration ตรวจ HTTP G (`POST /api/school-bot/service/v2/auth/logout`) → gRPC B (`SchoolBotSessionService.Logout`) และ DB session store/audit ตาม PF-API/PF-LEGACY/PF-WEB/PF-ADMIN; UI/host ตรวจการล้างสถานะบัญชีและคงสิทธิ์ License บนเครื่องตาม PF-HOST/PF-UI-WIN/PF-UI-MAC เมื่อ full Login และ FE-002 พร้อม

Owner: Implementation = BE-006/sys, BE-039/sys, FE-002/front · Validation = QA-001/check

เงื่อนไขก่อนตรวจ (Preconditions / Fixture):
- เซสชันบัญชี Login ที่ใช้งานอยู่ 2 เซสชันแยกกัน (Session A ของคำขอที่สั่ง logout และ Session B ของอีกคำขอ/อุปกรณ์) พร้อม License lease ของเครื่องที่ active (`checked_at`/วันหมดอายุเดิม)
- ชุดคำขอไม่มี/ผิดรูป token: ไม่มี `Authorization`, รูปแบบผิด, JWT (รวม JWT ที่ถูก revoke), `Authorization` ซ้ำ, ส่ง token ใน body, body ขนาด 64 KiB และ >64 KiB (65537 bytes)
- ชุดตรวจช่องทางและขอบเขตความปลอดภัย: untrusted service peer, metadata ขาด/ผิดรูป/ซ้ำ (`x-caller` ไม่ใช่ `api-gateway`, `x-request-id` ไม่ใช่ UUID-D, `x-lang` ผิด, `traceparent` ผิด, metadata รวม >16384 bytes, แนบ Cookie/identity/tenant/forwarded headers ปลอม), `Origin` ไม่อยู่ใน allowlist, HTTP method อื่น (GET/PUT/DELETE/PATCH/HEAD/OPTIONS), เรียกเส้นทางพี่น้อง/private/v1/admin หรือยิงตรงเข้า B โดยไม่ผ่านช่องทางที่ได้รับอนุญาต, เปิดโหมด Production/ปิด `SchoolBotLogoutOptions.Enabled`
- ชุดขีดจำกัดและบริการขัดข้อง: ยิงเกิน source limiter (30/60s) และ concurrency limiter (8/queue 0), จำลอง auth store ล่ม (`AuthenticationUnavailableException`), unexpected exception, ยกเลิกคำขอ/หมดเวลา (15s outer deadline) และ G↔B trailer ผิดรูป/เกินขนาด/UUID ไม่ตรง

| ชุดข้อมูล / ขอบเขต | ขั้นตอน (Steps) | Expected / Assertions |
|---|---|---|
| 1. เซสชันถูกต้อง + แยกเฉพาะคำขอ + คงสิทธิ์ License | สั่ง logout ด้วย Session A ผ่านช่องทางที่ได้รับอนุญาต (`POST /api/school-bot/service/v2/auth/logout` สำหรับ Desktop หรือผ่าน same-origin BFF สำหรับเว็บ); นำ Session A และ Session B ไปเรียกใช้งานต่อ; ตรวจสิทธิ์ License บนเครื่องและลองเข้าใช้งานแบบ Guest/Login ใหม่ | คืน `204 No Content` body ว่าง มี `Cache-Control: no-store` และ `X-Request-Id` UUID; B รับเฉพาะ canonical token แล้วส่งเข้า store เป็น lowercase SHA-256 เท่านั้น; Session A ถูกเพิกถอนใช้งานต่อไม่ได้ ส่วน Session B ยังใช้งานได้ตามปกติ; สิทธิ์ License และเวลาหมดอายุออฟไลน์ 3 วันของเครื่องไม่ถูกล้างหรือลดอายุ; หน้าจอล้างสถานะบัญชี A โดยไม่รั่วข้อมูลข้ามบัญชี |
| 2. ไม่มีเซสชัน / ข้อมูลเซสชันไม่สมบูรณ์ | ส่งคำขอ logout โดยไม่มี `Authorization`, header ผิดรูป, เป็น JWT/revoked JWT, `Authorization` ซ้ำ หรือใส่ token ใน body (แม้ขณะโควตา logout ของ limiter เต็ม) | เมื่อผ่าน peer/metadata/Origin แล้ว ระบบจบคำขอด้วย `204 No Content` body ว่าง (`no-store` + `X-Request-Id`); ไม่เรียก store (`store=0`), ไม่กินโควตา limiter (`quota=0`), ไม่เปลี่ยนสถานะเซสชันอื่นหรือสถานะระบบ และไม่บังคับตรวจ License/ETag ก่อนออกจากระบบ |
| 3. ช่องทางที่ได้รับอนุญาตเท่านั้น + เกณฑ์ความปลอดภัย | (ก) เรียกจาก untrusted peerเข้า B; (ข) ส่ง metadata ผิด/ซ้ำ/เกิน 16384 bytes หรือแนบ identity/tenant/Cookie ปลอม; (ค) ส่ง `Origin` นอก allowlist; (ง) ใช้ HTTP verb อื่นบน path logout หรือเรียก route อื่น/Production gate ปิด | (ก) B ปฏิเสธ `Unauthenticated` โดยไม่มี semantic trailer (`store=0/quota=0`) และ G ตอบ `502`; (ข) G คัดกรอง header ปลอม/ซ้ำ และหาก B พบ metadata ผิดจะตอบ `Internal/INTERNAL_ERROR` (`store=0/quota=0`) โดย G ตอบ `500` v2 (เมื่อ UUID ตรง) หรือ `502` (เมื่อไม่ตรง); (ค) ตอบ `403 ORIGIN_NOT_ALLOWED` v2 ไม่มี CORS header (`store=0/quota=0`); (ง) verb อื่นได้ `405 METHOD_NOT_ALLOWED` v2, body >64 KiB ได้ `413` ก่อนถึง RPC, เมื่อ SliceGate ปิด/Production ได้ `404` (`RPC=0`), ไม่เปิดช่องทางตรงเข้า B |
| 4. เกินขีดจำกัด / บริการขัดข้อง / ไม่รั่วข้อมูลลับ | ยิง canonical token เกิน source rate (30/60s) หรือเกิน concurrency (8); จำลอง store ล่ม (`AUTH_UNAVAILABLE`), unexpected error, deadline 15s หมด/cancel, หรือ B ส่ง trailer ผิดรูป; ตรวจการคืน permit และสแกน HTTP response/headers/logs ทุกกรณี | เกินขีดจำกัดได้ `429 RATE_LIMITED` v2 (พร้อม `Retry-After` ที่ผ่านการตรวจเท่านั้น) และคืน work permit เมื่องานจบ/ล้มเหลว/ยกเลิก; store ล่มได้ `503 AUTH_UNAVAILABLE` v2; ข้อผิดพลาดภายในได้ `500 INTERNAL_ERROR` v2 ข้อความกลาง (`The request failed.`/`คำขอล้มเหลว`); upstream/trailer ผิดได้ `502`, หมดเวลาได้ `504` ด้วย G envelope; ทุกกรณีไม่รั่ว raw token, hash, Cookie, stack trace, ชื่อตาราง/provider หรือรายละเอียดภายในทั้งใน response และ logs (รวม sanitizing channel logger) |

### การแยกขอบเขตหลักฐาน Local ที่มีแล้ว กับส่วนที่ยังต้องรอ (ห้ามนับเป็น QA PASS ของ TP001-082)

- **ส่วนที่มีหลักฐาน local slice รองรับแล้ว (`done-local` เฉพาะ slice ในแผน):**
  - ฝั่ง B typed gRPC (`BE-006-S1-grpc-logout`): ตรวจรับเฉพาะจุดแล้วตาม check-092-grpc-r3-001 (memory) (BASE 150/0, ARCH 2084/0/8 NOT_RUN, รวม 2234 pass / 0 fail) และ jpo-092-logout-r4-001 (memory) (B UUID/Origin/binary/transport duplicate CLOSED) ครอบลำดับ `peer → metadata (≤16384, allowlist, duplicates, caller, UUID, traceparent, x-lang) → Origin → canonical token (SHA-256) → limiter (30/60s, concurrency 8) → fake store`
  - ฝั่ง G controller + module-owned channel (`BE-039-S1-gateway-logout`): มีหลักฐานตาม slice-092-gateway-r4-001 (memory) และ jpo-092-logout-r4-001 (memory) (SEC001-016 และ SEC001-017 CLOSED เฉพาะ local logout slice; helper 433/0, repro-r4 3/0, regression-r4 5/0, extended-r4 96/0, surface probe 6/0) ครอบ `SchoolBotAuthController`, `SchoolBotOpaque` scheme (ไม่ส่ง opaque token/revoked JWT ไปติด 401 ก่อนถึง handler), `[SchoolBotSliceGate]` 404/RPC0, `CreateChannel`/`CreateGeneratedClient` ไร้ reflection และ `SchoolBotSanitizingLogger`
- **ส่วนที่ยังต้องรอ (ยังไม่สามารถลง Actual = PASS ได้):**
  - รอระบบ Login เต็มรูปแบบ (`BE-006` full Login ยัง `NOT_READY`, รอ `G-AUTH` / `BE-001` credential/profile fixtures) เพื่อทดสอบวงจรออกเซสชันจริงแล้วสั่ง logout
  - รอหน้าจอและการจัดการสถานะฝั่ง client (`FE-002` Login/logout UI และการพิสูจน์ end-to-end บน `PF-HOST`/`PF-UI-WIN`/`PF-UI-MAC` ว่าหลังสั่งออกจากระบบแล้วสิทธิ์ License ของเครื่องไม่ถูกกระทบ)
  - รอฐานข้อมูลจริง (`G-CORE`, PostgreSQL session store/revocation persistence และ audit atomicity จริง แทน `fakeControlledLogoutStore`)
  - รอโครงสร้างพื้นฐานและความปลอดภัยระดับเชื่อมระบบจริง (`H5` TLS/mTLS/trusted peer จริง, physical HTTP/2 hidden headers บน Kestrel, distributed rate limiter, same-origin BFF CSRF, การเปิด route ใน `Program.cs` สำหรับ production และ Light `CODEOWNERS` review)

หลักฐานที่ check ต้องเก็บเมื่อรันครบ: unit/local harness logs; E-API แบบ sanitized (HTTP↔RPC correlation `X-Request-Id`, build/config/proto hash, fault point, DB session/audit rows ก่อน–หลัง และ log scan ว่าไร้ token/secret); E-TRACE + E-UI สำหรับการกด logout บน Desktop/Web และตรวจว่า License lease คงเดิม

Actual: NOT_RUN (หลักฐาน check-092/jpo-092 เป็น local component/transport slice เท่านั้น ไม่ใช่ end-to-end AC acceptance)

Traceability: AC-036-06 → TP001-082 (Implementation: BE-006/sys, BE-039/sys, FE-002/front · Validation: QA-001/check); AC-036-01..05 คง TP001-008, TP001-021..024. Coverage รวมตามฐานเดิม+Amendment005 เป็น 82 cases / 187 AC ไม่ใช่ผลทดสอบ; snapshot 180/77 คงเดิม

## Change Log
- 2026-10-28 — เพิ่ม TP001-082 ครอบ AC-036-06/BR-036-05 (logout) พร้อมแยกหลักฐาน local (check-092/jpo-092) ออกจากส่วนที่รอ full Login/FE-002/DB/H5; ทุก actual=NOT_RUN ไม่มี test execution ในรอบนี้
