# Desktop login adapter — ขอบเขตและ admission

> Rev 5 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 052 — อายุ Desktop session นับจากเวลา bind)

สัญญานี้กำหนด Data Transfer Object (DTO) ภายใน การแปลผล authentication และเงื่อนไขก่อนออก SchoolBot session ครูใช้ native continuation ผ่าน SchoolBot adapter ไป Gateway web flow เดิม นักเรียนยังไม่มี Desktop completion ที่พิสูจน์ได้ สัญญานี้ไม่เพิ่ม public endpoint หรือ schema

## ส่วนสัญญา

| เอกสาร | เนื้อหา |
|---|---|
| [Request และ bounds](desktop-login-adapter-requests.md) | operations, normalization และ password/trusted token limits |
| [Outcome decoder](desktop-login-adapter-outcomes.md) | การจำแนก challenge/terminal และเงื่อนไขสร้าง session |
| [Failure และ retry](desktop-login-adapter-failures.md) | error mapper, deadline, rate limit และ unknown outcome |

ใช้ร่วม [DES-004 (ตัวตน/session)](des-004.md), [DES-012 (auth ข้ามระบบ)](des-012.md) และ [Gateway outcome component](gateway-outcome-component-001.md) ซึ่งกำหนด callable web decoder/parser/outcomes และ unit tests ภายใน decoder นี้ทำและทดสอบโดยตรงได้โดยไม่ต้องมี production caller หรือ endpoint สมมติ Mobile อยู่นอก implementation ของ component; request validator เป็นหน้าที่ adapter ข้อกำหนด transport/header/retry ใช้เมื่อทำ transport จริง ไม่ขวางการทำ component

## เลือก route และตรึง actor

`actor=student|employee` และ `channel=desktop` ถูกตรึงตลอด attempt ผู้ใช้ยืนยันให้แยกประเภทด้วย cType จากข้อมูล server ที่ผูกกับบัญชี/tenant ผ่าน trusted boundary: `CType="0" → student`, `"1" → employee` ตัวเลขมาจาก source evidence ไม่ใช่เลขที่ผู้ใช้ระบุ หลัง authentication ต้องตรวจ binding นี้ก่อนยืนยัน actor

body/header cType, response user หรือ JWT ที่เพียง decode ไม่เป็น authority Mobile JWT ไม่มี CType; null/unknown/กำกวมไม่ใช่ employee และห้ามออก session unresolved mapping → `503 AUTH_NOT_CONFIGURED` cType ไม่พิสูจน์ admin/active/tenant/device และไม่พิสูจน์ AccountId=ProfileId

cType ที่ได้หลัง authentication เลือก route ย้อนหลังไม่ได้ ก่อนส่ง password ต้องมี server lookup ที่เลือกบัญชีไม่กำกวมและผูกผลกับบัญชีที่ authenticate จริง ผลก่อน auth ใช้เลือกเส้นทางเท่านั้น ไม่เป็น admission ยังไม่พิสูจน์ private routing seam สำหรับ SchoolBot เจ้าของ Gateway/sys ต้องตรวจ selector/cardinality/attempt binding โดยคง `/login` และ `/web/login` ห้ามเดา route เพิ่ม public actor หรือส่ง password ลองหลาย route เพราะมี attempts/lock side effects ไม่ fallback mobile ให้ครู

## Admission และขอบเขต public API

pending/challenge → terminal_candidate → trusted token + directory admission → fully_authenticated → commit opaque unbound session 5 นาที → bind profile fully_authenticated เป็นสถานะภายใน ไม่ใช่ public access token ก่อน admission ครบห้ามสร้างแม้ unbound session เมื่อ bind สำเร็จตั้ง `ExpiresAt = เวลาที่ bind สำเร็จ + 8 ชั่วโมง` ตาม [DES-004 (ตัวตนและสิทธิ์) Rev 13](des-004-lifecycle.md) ไม่ต่ออายุจาก retry

Public `/v2/auth/login` ยังใช้ DTO เดิม ห้ามเพิ่ม actor/step/flow_token หรือ continuation routes จาก DTO ภายใน ต้องพิสูจน์ attempt binding กับ school/account/License/current binding/DeviceJkt, stage, expiry, replay และ cancellation ก่อนส่ง pending กลับ host ไม่สร้าง store/ticket format ชดเชยโดยไม่มีฐานรองรับ รายการหลักฐานอยู่ใน desktop-auth-review-packet-001 (memory)

## ทางเลือกที่ไม่ใช้

ปัด browser handback เพราะไม่มี callback/redemption binding ไม่สร้าง verifier/hash ใหม่ ไม่ fake IMEI (รหัสประจำเครื่องโทรศัพท์) หรือใช้ installation ID/DeviceJkt แทน นักเรียนใช้ mobile ได้เฉพาะเมื่อเจ้าของพิสูจน์ Desktop device lifecycle

## หลักฐาน

- ตรวจ source ซ้ำ 2026-11-02: `C:/src/schoolbright/target/school-bot/web/src/SchoolBot.Domain/Identity/SchoolBotSessionRecord.cs:3–20` มี `ExpiresAt` และ `CreateDate` แยกกัน; record ไม่พิสูจน์การคำนวณอายุเมื่อ bind ข้อกำหนดนี้ใช้ [มติ 052 (อายุ Desktop session นับจากเวลา bind)](../../shared/decisions/decisions-052.md) และ DES-004 Rev 13

- desktop-login-evidence-001 และ desktop-login-wire-evidence-001 (memory) เป็น source evidence เดิมของ Gateway; desktop-login-owner-question-001 (memory) ยืนยันการใช้ cType แยกนักเรียน/ครู
- Gateway `TusersRepository.cs:103` มี FindAuthUserDetail และ `WebLoginService.cs:64` มี employee lookup ยังไม่พิสูจน์ private routing seam
- SchoolBot baseline เดิม: `web/src/SchoolBot.Api/Program.cs:43–44,84–118` มี memory management กับ v1 License/Release; `ManagementService.cs:45–65` ใช้ key/device ID ไม่ใช่ DeviceJkt proof; `InMemoryManagementStore.cs:8–13` ไม่มี session; `ApiErrors.cs:18–20` เป็น v1 envelope; `web/tests/SchoolBot.Tests/ApiHelpers.cs:19–28` มี WebApplicationFactory/FakeClock; `app/desktopservice.go:70–78` สุ่ม installation ID ข้อมูลนี้เป็นผลตรวจเดิม ไม่ใช่ภาพรวม implementation ปัจจุบันหรือการตรวจซ้ำในงานเรียบเรียง
