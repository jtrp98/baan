# Gateway outcome component — Acceptance และหลักฐาน

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway outcome component](gateway-outcome-component-001.md) อธิบาย Acceptance และหลักฐาน.

## Acceptance และ tests ที่ต้องทำ

ใช้ xUnit เรียก Decode จริงด้วย UTF-8 fixture bytes ที่สร้างใน test; ไม่ mock decoder หรือคืน success คงที่. ทุก positive fixture ใช้ envelope code=200/results เป็น object ตามตัวอย่าง และ secret สมมติเท่านั้น.

1. สร้าง Cartesian tests ของทุก row operation กับทุก Kind: รับเฉพาะช่องตาราง; stage ผิดทุกคู่ได้ 400. Mobile ทุก stage/outcome รวม reset/pending ได้ 400; enum/status นอกช่วงได้ 400.
2. Positive results: password={requirePasswordChange:true,changeToken:'test-change'}; 2FA/contact={next:'two-factor'หรือ'contact',challengeToken:'test-challenge',expiresAt:'2030-01-02T03:04:05Z'}; terminal={token:'test-token',requirePasswordChange:false,expiresAt:วันเดียวกัน}; sent={ref:'r',masked:'m',expiresAt:วันเดียวกัน,resendAfterSeconds:60}. ทั้งหมดเป็น notation สำหรับสร้าง JSON จริง. ตรวจ exact payload/null fields/NextStage และ terminal ไม่มี authenticated/session side effect.
3. ทุก required field: absent/null/wrong type/empty/เกินเพดาน; ทุก forbidden marker ใส่ค่าและ null; token+next/changeToken, unknown next, mobile markers, requirePasswordChange=true+token ต้อง 503. TrustedDeviceToken absent/null/valid รับเฉพาะ terminal.
4. HTTP400/401/403/429/502/503, empty/non-JSON/JSON, code ตรง/ขัด/ขาด/null/unknown; 200+code401 และ 401+code200 ได้ 503. 429 ไม่มี header ต้องรับได้. Unknown upstream ข้อความ/PII ไม่หลุดในผล.
5. Duplicate root/results/unknown nested/array object รวมชื่อ escaped ที่เท่ากัน; case ผิดของ known key; invalid UTF-8/surrogate, truncated/trailing JSON, BOM/comments/comma. ทดสอบ response2MiB และ+1, depth32 และ 33, secret16KiB และ+1, challenge200/201 UTF-16. Boundary ที่ผ่านต้องยังเป็น valid fixture; unknown filler ไม่เปลี่ยน outcome.
6. วันที่ leap-day ถูก/ผิด, timezone หาย/offset เกิน/leap second/เศษเกิน 7/อดีต/offset เทียบเท่า UTC. ตรวจ int resend ขอบ 0/int.MaxValue และค่าผิดชนิด/ติดลบ/overflow.
7. Unknown channels/missing ที่ bounded ไม่เปลี่ยน outcome แต่ duplicates ภายในต้อง 503; ไม่ปรากฏใน output. ToString/serialization/exception text ไม่เผย sentinel secret/rawbody; CopyTo ได้ bytes ตรง, buffer เล็กไม่เขียน, dispose ซ้ำได้และอ่านหลัง dispose ไม่ได้. ไม่อ้าง managed-memory forensic erasure.
8. รันจาก school-bot/web: `dotnet test SchoolBot.slnx --disable-build-servers -m:1`; check ตรวจเฉพาะ component/architecture regression. ไม่มี endpoint/WAF/network test จำเป็นใน scope นี้; ผล unit tests ไม่ใช่ Gateway wire parity หรือ production acceptance.

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

หลักฐานที่ Desktop login adapter รับไว้แล้ว: planning/desktop-login-evidence-001.json (memory) ส่วน teacher_flow อ้าง sb-api-gateway/src/ApiGateway.API/Controllers/WebAuthController.cs:168,191,212,245,265–348: envelope code/message/messageTh/results/requestId, สี่ outcome และ send. ไม่ตรวจ source HTTP API Gateway ซ้ำและไม่อ้างว่าการตรวจ Gateway เสร็จ.

ตรวจ SchoolBot gRPC service จริง: web/Directory.Build.props:3–6 เป็น net10.0/nullable/warnings-as-errors; web/src/SchoolBot.Infrastructure/SchoolBot.Infrastructure.csproj:2 อ้าง Application; README.md:5–6 ยืนยัน Clean Architecture. ใช้ Infrastructure สำหรับ wire decoder และ xUnit ใน SchoolBot.Tests เดิม ไม่ให้ Application อ้าง Infrastructure.

ADR: เลือก web-only เพราะ Desktop login adapter มี branch/continuation ชัดกว่า mobile. ปัด mobile fallback, JWT decoder/verifier, general DI ports และ HTTP client. เลือก bounded bytes synchronous เพื่อตัด stream ownership/cancellation/network ออกจากงาน. ไม่รับ stream overload รอบนี้. การทดสอบ bytes โดยตรงเป็น behavior จริงของ component ไม่ใช่ mock authentication.

กฎรับเข้าด้านล่างเป็นสัญญา SchoolBot gRPC service ที่ตรึงในสัญญา component นี้ ไม่ใช่ข้ออ้างว่า HTTP API Gateway deploy ตรงทุกค่า. โดยเฉพาะรูปแบบ code ต้องเทียบ fixtures ของ Gateway ภายหลัง; unknown code fail closed และไม่มีผลเป็น authenticated.
