# TP-001 — ขอบเขตหลักฐาน Logout

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้ประกอบ TP001-082 (ออกจากระบบโดยคงสิทธิ์ License) ตาม [แผนหลัก](tp-001.md)

## ข้อรอระบบจริง

- **ส่วนที่ยังต้องรอ (ยังไม่สามารถลง Actual = PASS ได้):**
  - รอระบบ Login เต็มรูปแบบ ([BE-006 (Login/session)](../plan/index.md) full Login ยัง `NOT_READY`, รอ `G-AUTH` / [BE-001 (Legacy auth)](../plan/index.md) credential/profile fixtures) เพื่อทดสอบวงจรออกเซสชันจริงแล้วสั่ง logout
  - รอหน้าจอและการจัดการสถานะฝั่ง client ([FE-002 (Login UI)](../plan/index.md) Login/logout UI และการพิสูจน์ end-to-end บน `PF-HOST`/`PF-UI-WIN`/`PF-UI-MAC` ว่าหลังสั่งออกจากระบบแล้วสิทธิ์ License ของเครื่องไม่ถูกกระทบ)
  - รอฐานข้อมูลจริง (`G-CORE`, PostgreSQL session store/revocation persistence และ audit atomicity จริง แทน `fakeControlledLogoutStore`)
  - รอโครงสร้างพื้นฐานและความปลอดภัยระดับเชื่อมระบบจริง (`H5` TLS/mTLS/trusted peer จริง, physical HTTP/2 hidden headers บน Kestrel, distributed rate limiter, same-origin BFF CSRF, การเปิด route ใน `Program.cs` สำหรับ production และ Light `CODEOWNERS` review)

## คำย่อ

BFF = Backend for Frontend ซึ่งอยู่ origin เดียวกับเว็บ · CSRF = Cross-Site Request Forgery · JWT = JSON Web Token


## หลักฐาน

- **ส่วนที่มีหลักฐาน local ส่วนงาน รองรับแล้ว (`done-local` เฉพาะ ส่วนงาน ในแผน):**
  - ฝั่ง SchoolBot typed gRPC (`BE-006 ส่วน gRPC logout`): ตรวจรับเฉพาะจุดแล้วตาม check-092-grpc-r3-001 (memory) (BASE 150/0, ARCH 2084/0/8 NOT_RUN, รวม 2234 pass / 0 fail) และ jpo-092-logout-r4-001 (memory) (SchoolBot UUID/Origin/binary/transport duplicate CLOSED) ครอบลำดับ `peer → metadata (≤16384, allowlist, duplicates, caller, UUID, traceparent, x-lang) → Origin → canonical token (SHA-256) → limiter (30/60s, concurrency 8) → fake store`
  - ฝั่ง Gateway controller + module-owned channel (`[BE-039 (เชื่อม SchoolBot ผ่าน Gateway)](../plan/index.md) ส่วน Gateway logout`): มีหลักฐานตาม slice-092-gateway-r4-001 (memory) และ jpo-092-logout-r4-001 (memory) (SEC001-016 และ SEC001-017 CLOSED เฉพาะ local logout ส่วนงาน; helper 433/0, repro-r4 3/0, regression-r4 5/0, extended-r4 96/0, surface probe 6/0) ครอบ `SchoolBotAuthController`, `SchoolBotOpaque` scheme (ไม่ส่ง opaque token/revoked JWT ไปติด 401 ก่อนถึง handler), `[SchoolBotSliceGate]` 404/RPC0, `CreateChannel`/`CreateGeneratedClient` ไร้ reflection และ `SchoolBotSanitizingLogger`
