# Gateway outcome component — หลักฐาน

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway outcome component](gateway-outcome-component-001.md) ส่วนนี้อธิบายหลักฐาน อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

1. สร้าง Cartesian tests ของทุก row operationกับทุก Kind: รับเฉพาะช่องตาราง; stageผิดทุกคู่ได้400. Mobileทุก stage/outcomeรวม reset/pending ได้400; enum/statusนอกช่วงได้400.
2. Positive results: password={requirePasswordChange:true,changeToken:'test-change'}; 2FA/contact={next:'two-factor'หรือ'contact',challengeToken:'test-challenge',expiresAt:'2030-01-02T03:04:05Z'}; terminal={token:'test-token',requirePasswordChange:false,expiresAt:วันเดียวกัน}; sent={ref:'r',masked:'m',expiresAt:วันเดียวกัน,resendAfterSeconds:60}. ทั้งหมดเป็น notation สำหรับสร้าง JSON จริง. ตรวจ exact payload/null fields/NextStage และ terminalไม่มี authenticated/session side effect.
3. ทุก required field: absent/null/wrong type/empty/เกินเพดาน; ทุก forbidden markerใส่ค่าและnull; token+next/changeToken, unknown next, mobile markers, requirePasswordChange=true+token ต้อง503. TrustedDeviceToken absent/null/valid รับเฉพาะterminal.
4. HTTP400/401/403/429/502/503, empty/non-JSON/JSON, codeตรง/ขัด/ขาด/null/unknown; 200+code401และ401+code200ได้503. 429ไม่มีheaderต้องรับได้. Unknown upstreamข้อความ/PIIไม่หลุดในผล.
5. Duplicate root/results/unknown nested/array object รวมชื่อ escapedที่เท่ากัน; caseผิดของknown key; invalid UTF-8/surrogate, truncated/trailing JSON, BOM/comments/comma. ทดสอบ response2MiBและ+1, depth32และ33, secret16KiBและ+1, challenge200/201 UTF-16. Boundaryที่ผ่านต้องยังเป็นvalid fixture; unknown fillerไม่เปลี่ยนoutcome.
6. วันที่ leap-dayถูก/ผิด, timezoneหาย/offsetเกิน/leap second/เศษเกิน7/อดีต/offsetเทียบเท่าUTC. ตรวจ int resendขอบ0/int.MaxValue และค่าผิดชนิด/ติดลบ/overflow.
7. Unknown channels/missingที่boundedไม่เปลี่ยนoutcome แต่ duplicatesภายในต้อง503; ไม่ปรากฏในoutput. ToString/serialization/exception textไม่เผย sentinel secret/rawbody; CopyToได้bytesตรง, bufferเล็กไม่เขียน, disposeซ้ำได้และอ่านหลังdisposeไม่ได้. ไม่อ้าง managed-memory forensic erasure.
8. รันจาก school-bot/web: `dotnet test SchoolBot.slnx --disable-build-servers -m:1`; checkตรวจเฉพาะcomponent/architecture regression. ไม่มี endpoint/WAF/network testจำเป็นในscopeนี้; ผลunit testsไม่ใช่Gateway wire parityหรือproduction acceptance.

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

หลักฐานที่ Desktop login adapter รับไว้แล้ว: planning/desktop-login-evidence-001.json (memory) ส่วน teacher_flow อ้าง sb-api-gateway/src/ApiGateway.API/Controllers/WebAuthController.cs:168,191,212,245,265–348: envelope code/message/messageTh/results/requestId, สี่ outcome และ send. ไม่ตรวจ source HTTP API Gateway ซ้ำและไม่อ้างว่าการตรวจ Gateway เสร็จ.

ตรวจ SchoolBot gRPC service จริง: web/Directory.Build.props:3–6 เป็น net10.0/nullable/warnings-as-errors; web/src/SchoolBot.Infrastructure/SchoolBot.Infrastructure.csproj:2 อ้าง Application; README.md:5–6 ยืนยัน Clean Architecture. ใช้ Infrastructure สำหรับ wire decoder และ xUnit ใน SchoolBot.Tests เดิม ไม่ให้ Application อ้าง Infrastructure.

ADR: เลือก web-only เพราะDesktop login adapterมี branch/continuation ชัดกว่า mobile. ปัด mobile fallback, JWT decoder/verifier, general DI ports และ HTTP client. เลือก bounded bytes synchronous เพื่อตัด stream ownership/cancellation/network ออกจากงาน. ไม่รับ stream overload รอบนี้. การทดสอบ bytes โดยตรงเป็น behavior จริงของ component ไม่ใช่ mock authentication.

กฎรับเข้าด้านล่างเป็นสัญญา SchoolBot gRPC service ที่ตรึงในสัญญา component นี้ ไม่ใช่ข้ออ้างว่า HTTP API Gateway deploy ตรงทุกค่า. โดยเฉพาะรูปแบบ code ต้องเทียบ fixtures ของ Gatewayภายหลัง; unknown code fail closed และไม่มีผลเป็น authenticated.
