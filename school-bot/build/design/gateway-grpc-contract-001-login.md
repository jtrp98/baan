# Gateway–SchoolBot gRPC contract — Login routing และ admission

> Rev 3 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 052 — อายุ Desktop session นับจากเวลา bind)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) อธิบาย Login routing และ admission.

## 4. Login routing และ admission

sys056 พบ web lookup เลือก SId ล่าสุด, mobile เลือก category หลังตรวจ password/สร้าง token; ยังไม่มี single-account selector ที่พิสูจน์แล้ว. ห้ามนำ FirstOrDefault มาเป็น cardinality contract.

ก่อนส่ง password: trusted selector ใช้ school+username ตาม normalization ของ upstream ที่เลือก; ไม่ lowercase/Unicode-normalize เอง. ต้องพบ active account เดียว, cType เป็น 0 หรือ 1 และไม่มีความกำกวมด้านบัญชี/ประเภท; missing/deleted/unknown/ambiguous ปฏิเสธ ไม่ลองหลาย routes. Routing hint ให้เพียง account/tenant/category สำหรับเลือก student mobile หรือ employee web ไม่ให้สิทธิ์ login.

หลัง authentication: ต้องผูกผลกับ account เดิมจาก selector ตลอด password-change/2FA/contact/device stages และ re-read active account/profile/tenant ก่อนออก session. ห้ามให้ caller ส่ง validated=true หรือใช้ decoded JWT/response user เป็นหลักฐาน. private attempt binding/replay/expiry/store และ public continuation ยังรอ sb-api-gateway/owner; เอกสารนี้ไม่สร้าง ticket, actor/step field หรือ endpoint ใหม่.

แยก keys ตาม evidence002:
- AccountId คือ Master Tusers.SId; SchoolId คือ NCompany ที่ตรวจแล้ว.
- student candidate: School Tusers.SId+SchoolId จาก master SId; ต้องตรวจ active และ cardinality ไม่ใช่ถือ ID เท่ากันว่า join ผ่าน.
- employee candidate: Temployees.SEmp+SchoolId จาก NSystemId; web WorkStatus ใช้ SId, token ใช้ NSystemId??SId, 2FA ใช้ NSystemId>1 มิฉะนั้น SId. ทั้งสามไม่เท่ากันโดยอัตโนมัติ.
- เสนอ canonical employee linkage จาก server mapping ที่พิสูจน์แล้วเท่านั้น; ไม่ยอมรับ SId fallback เพียงเพราะมีค่า. ต้อง reconcile account/profile ที่ status/token/2FA ใช้ให้ตรงกัน; sentinel/null/หลาย profile ยังรอ sb-api-gateway/legacy/vault พิสูจน์. ไม่มี schema proposal ในรอบนี้.

เสนอ diagnostic codes ภายในใหม่: `AUTH_PROFILE_MISSING`, `AUTH_ACCOUNT_CARDINALITY`, `AUTH_PROFILE_CARDINALITY`. ทั้งหมดห้ามออก session; outward คง 503 AUTH_NOT_CONFIGURED สำหรับ linkage ที่ยังไม่ยืนยัน ไม่เผยจำนวนบัญชี/profile. missing/deleted account หรือ credential ผิด→401 UNAUTHORIZED; unknown category→503 AUTH_NOT_CONFIGURED. การเปิด codes ใหม่เป็น public API ต้องให้ owner รับรองก่อน ไม่แก้ rules Rev7 เอง.

กฎ admission ข้างต้นใช้ร่วมกับอายุ session ในหัวข้อถัดไป โดย Desktop session นับอายุจากเวลา bind สำเร็จตามมติ 052.

Login RPC ระบุเฉพาะ successful terminal contract; public pending/continuation ยังไม่ถูกตรึง จึงยังไม่พร้อมเปิด Login end-to-end. ห้ามแปลง pending เป็น 401/201 เพื่อปิดช่องว่างนี้.

## อายุ session

HTTP200 จาก HTTP API Gateway อาจเป็น pending; token+pending หรือ malformed outcome→503 AUTH_UNAVAILABLE. คง password-change→2FA→contact และ mobile device/password-reset ทุกขั้นก่อน fully_authenticated. หลัง admission ครบจึงออก unbound Desktop session5 นาที แล้ว bind ตาม membership สด เมื่อ bind สำเร็จตั้ง `ExpiresAt = เวลาที่ bind สำเร็จ + 8 ชั่วโมง` ตาม [DES-004 (ตัวตนและสิทธิ์) Rev 13](des-004-lifecycle.md). ไม่ยืดจาก retry. Web exchange คง 30 นาที/Staff8 ชม. จำกัดด้วย source expiry เมื่อมี; ข้อยกเว้น exp=null ของเว็บไม่ขยายไป Desktop.

## หลักฐาน

- ตรวจ source ซ้ำ 2026-11-02: `C:/src/schoolbright/target/school-bot/web/src/SchoolBot.Domain/Identity/SchoolBotSessionRecord.cs:3–20` มี `ExpiresAt` และ `CreateDate` แยกกัน; โครงสร้าง record ไม่ได้พิสูจน์การคำนวณอายุเมื่อ bind ข้อกำหนด 8 ชั่วโมงหลัง bind ใช้ [มติ 052 (อายุ Desktop session นับจากเวลา bind)](../../shared/decisions/decisions-052.md) และ DES-004 Rev 13
