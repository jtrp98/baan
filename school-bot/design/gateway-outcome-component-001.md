# Gateway outcome component — Rev1

สถานะอยู่ที่ [index](index.md). ใช้ต่อจาก [034](desktop-login-adapter-001.md); override เฉพาะ component ตาม037 ไม่ใช่แบบ Login ใหม่.

## หลักฐานและการตัดสินใจ

หลักฐาน033ที่034รับแล้ว: planning/desktop-login-evidence-001.json ส่วน teacher_flow อ้าง G/src/ApiGateway.API/Controllers/WebAuthController.cs:168,191,212,245,265–348: envelope code/message/messageTh/results/requestId, สี่ outcome และ send. ไม่ตรวจ source G ซ้ำและไม่อ้างว่า035เสร็จ.

ตรวจ B จริง: web/Directory.Build.props:3–6 เป็น net10.0/nullable/warnings-as-errors; web/src/SchoolBot.Infrastructure/SchoolBot.Infrastructure.csproj:2 อ้าง Application; README.md:5–6 ยืนยัน Clean Architecture. ใช้ Infrastructure สำหรับ wire decoder และ xUnit ใน SchoolBot.Tests เดิม ไม่ให้ Application อ้าง Infrastructure.

ADR: เลือก web-only เพราะ034มี branch/continuation ชัดกว่า mobile. ปัด mobile fallback, JWT decoder/verifier, general DI ports และ HTTP client. เลือก bounded bytes synchronous เพื่อตัด stream ownership/cancellation/network ออกจากงาน. ไม่รับ stream overload รอบนี้. การทดสอบ bytes โดยตรงเป็น behavior จริงของ component ไม่ใช่ mock authentication.

กฎรับเข้าด้านล่างเป็นสัญญา B ที่ตรึงใน037 ไม่ใช่ข้ออ้างว่า G deploy ตรงทุกค่า. โดยเฉพาะรูปแบบ code ต้องเทียบ fixtures035ภายหลัง; unknown code fail closed และไม่มีผลเป็น authenticated.

## Callable API และที่วาง

namespace SchoolBot.Infrastructure.Authentication; ทุก type ต่อไปนี้เป็น public CLR เพื่อเรียกข้าม assembly ภายใน solution ไม่ใช่ public HTTP DTO.

`public static GatewayOutcome Decode(GatewaySourceKind sourceKind, GatewayOperation operation, GatewayStage stage, int httpStatus, ReadOnlySpan<byte> utf8Json)` บน static class GatewayOutcomeDecoder.

Enums: GatewaySourceKind={Web,Mobile}; GatewayOperation={Login,FirstPassword,TwoFactorSend,TwoFactorVerify,ContactSend,ContactVerify}; GatewayStage={Initial,PasswordChange,TwoFactor,Contact}; GatewayOutcomeKind={Rejected,PasswordChange,TwoFactor,Contact,Sent,TerminalCandidate}. กำหนดค่าตามลำดับเริ่ม0; enum นอกชุดไม่ยอมรับ.

GatewayOutcome เป็น sealed class, constructor ไม่ public, properties get-only: Kind:GatewayOutcomeKind, SourceKind:GatewaySourceKind, NextStage:GatewayStage?, Token:GatewaySecret?, ChangeToken:GatewaySecret?, ChallengeToken:GatewaySecret?, TrustedDeviceToken:GatewaySecret?, ExpiresAt:DateTimeOffset?, Ref:string?, Masked:string?, ResendAfterSeconds:int?, Failure:GatewayFailure?. ไม่คืน raw JSON, user, claims, roles, channels หรือ missing.

GatewayFailure เป็น sealed class มี Status:int และ Code:string เท่านั้น. Code อยู่ในชุด INVALID_INPUT/UNAUTHORIZED/FORBIDDEN/RATE_LIMITED/AUTH_UNAVAILABLE. ไม่มี upstream message/details/requestId หรือ exception ในผลลัพธ์. Rejected มี Failure และ field payload ทุกตัวเป็น null; outcome อื่น Failure=null. ทุก field ที่ไม่ได้ระบุในตาราง outcome ต้อง null.

GatewaySecret เป็น sealed IDisposable, private byte[] เก็บ UTF-8 ของค่าหลัง JSON unescape; internal constructor. API `int ByteLength { get; }`, `int CopyTo(Span<byte> destination)`, `void Dispose()`. CopyTo คืนจำนวน bytes; destination เล็กไปโยน ArgumentException โดยไม่คัดลอกบางส่วน; หลัง dispose ทั้ง ByteLength/CopyTo โยน ObjectDisposedException. Dispose idempotent และ zero buffer. ไม่มี getter string/byte[]/implicit conversion. GatewayOutcome.Dispose() dispose secret ทั้งหมดและทำซ้ำได้. ToString ของ outcome คืนเฉพาะ Kind; secret คืน [REDACTED]. ใส่ System.Text.Json converters ที่ Read/Write โยน NotSupportedException สำหรับ outcome/secret เพื่อกัน accidental serialization. ไม่ใช้ record ที่พิมพ์ properties อัตโนมัติ. ห้าม log rawbody/secret/ref/masked; ไม่มี logger ใน component. Caller เป็นเจ้าของ input buffer และสำเนาจาก CopyTo; ต้องล้างเมื่อใช้จบ. ไม่อ้าง zeroization ของ managed parser/string ทั้งหมด.

วาง GatewayOutcomeDecoder.cs, GatewayOutcome.cs, GatewaySecret.cs ใต้ web/src/SchoolBot.Infrastructure/Authentication/ และ GatewayOutcomeDecoderTests.cs ใต้ web/tests/SchoolBot.Tests/. ไม่แก้ Program/DI/Application/Domain หรือเพิ่ม package.

## Validation และ bounds ตามลำดับ

1. enum/status นอก100..599 หรือ operation-stage ไม่ตรงตาราง → Rejected(400,INVALID_INPUT). Mobile ทุก operation รวม terminal/pending_device/password_reset → Rejected(400,INVALID_INPUT) โดยไม่ decode body; ไม่ fallback web.
2. body เกิน2,097,152 bytes → Rejected(503,AUTH_UNAVAILABLE). สำหรับ200 body ว่าง/whitespace ไม่ผ่าน. ไม่ truncate; ขนาดวัดก่อน parse.
3. ใช้ System.Text.Json ตรวจ UTF-8/Unicode ถูกต้อง รวม escaped surrogate; JSON เดียวทั้ง input, root object, depthไม่เกิน32 (root container=1), ไม่มี BOM/comments/trailing comma/trailing document. ตรวจ duplicate property names หลัง unescape แบบ Ordinal ทุก object ทั้ง tree รวม unknown fields/arrays. Duplicate, malformed, depthเกิน, wrong type →503 AUTH_UNAVAILABLE. ห้ามข้าม unknown subtree ก่อนตรวจ.
4. names case-sensitive. ที่ root และ results หากชื่อเทียบ OrdinalIgnoreCase ตรง known name แต่สะกด case ผิดให้ปฏิเสธ. Known root: code/results/message/messageTh/requestId; known results: fields ในสัญญานี้รวม channels/missing/user/retryAfterSeconds และ mobile markers. Unknown fields อื่นละได้หลังตรวจทั้งtree ไม่ใช้เป็น authority และไม่ส่งออก.
5. code ถ้ามีต้องเป็น JSON integer lexical100..599 หรือ stringสามหลัก100..599 เท่านั้น ไม่รับ decimal/exponent/space/null/boolean. ต้องเท่ากับ httpStatus; ขัดกันหรือ code อื่น →503 AUTH_UNAVAILABLE. HTTP200 บังคับมี code และ results object; ไม่รับ null. กฎรับ code สอง representation เป็น tolerance ของ B ไม่ใช่ข้อยืนยันรูปแบบ G.
6. ตรวจ HTTP errors ก่อนเลือก success branch ตามตารางถัดไป. สำหรับ200 เลือกได้หนึ่ง branchและต้องอนุญาตโดย operation; ไม่ตรง/หลาย branch →503 AUTH_UNAVAILABLE.

Unknown presentation values รวม channels/missing/user รับ JSON value ใดก็ได้ภายใน bounds แต่ไม่ตีความ. message/messageTh/requestId ไม่ถูกใช้ตัดสิน outcome. Known authority fields ห้ามอาศัย unknown-field rule: null ไม่เท่ากับ absent; marker ที่ branch ไม่ใช้ต้อง absent เว้นแต่ระบุข้อยกเว้น.

Secret ที่ต้องมีต้องเป็น string ไม่ว่าง ไม่มี Unicode whitespace/control; ไม่ trim/normalize. token/changeToken/trustedDeviceToken ไม่เกิน16,384 UTF-8 bytes หลัง unescape. challengeToken ใช้เพดานเดียวกันและไม่เกิน200 UTF-16 code units. ref/masked เป็น string1..512 UTF-16 code units ไม่มี control; ไม่ trim. resendAfterSeconds เป็น JSON integer lexical0..2147483647 ไม่รับ string/fraction/exponent.

expiresAt เป็น stringรูปแบบ `YYYY-MM-DDTHH:mm:ss[.1..7digits](Z|±HH:mm)`, ปี0001..9999, Gregorian date/time ถูกต้อง, seconds00..59, offsetไม่เกิน±14:00; ใช้ invariant culture, normalizeเป็น UTC DateTimeOffset. ปฏิเสธ timezoneหาย/epoch/null/dateผิด/leap second. ไม่เทียบเวลาปัจจุบัน ไม่ตัดสิน token lifetime หรือ authenticity; ค่าที่เป็นอดีตยัง decode ได้และต้องตรวจต่อที่ admission ภายหลัง.

## Truth table ของ HTTP200

R=results; รายการ forbidden ใช้ presence แม้ค่าเป็น null. Fields presentation/unknown ละได้ตามกฎข้างบน.

| เงื่อนไขใน R | Kind / payload / NextStage |
|---|---|
| requirePasswordChange=true; changeToken ถูกต้อง; ไม่มี token/next/challengeToken/expiresAt/trustedDeviceToken หรือ send fields | PasswordChange / ChangeToken / PasswordChange |
| next='two-factor'; challengeToken/expiresAt ถูกต้อง; requirePasswordChange absent หรือ false; ไม่มี token/changeToken/trustedDeviceToken หรือ send fields | TwoFactor / ChallengeToken,ExpiresAt / TwoFactor |
| next='contact'; เงื่อนไขอื่นเหมือน two-factor | Contact / ChallengeToken,ExpiresAt / Contact |
| token/expiresAt ถูกต้อง; requirePasswordChange=false ต้องมี; trustedDeviceToken optional absent/null/secretถูกต้อง; ไม่มี next/changeToken/challengeToken หรือ send fields | TerminalCandidate / Token,ExpiresAt,TrustedDeviceTokenถ้ามี / null |
| ref/masked/expiresAt/resendAfterSeconds ถูกต้อง; ไม่มี token/changeToken/challengeToken/next/requirePasswordChange/trustedDeviceToken | Sent / Ref,Masked,ExpiresAt,ResendAfterSeconds / stageเดิม |
| มี temporaryToken/isDeviceVerified/forceResetPassword แม้null; unknown next; markerผสม; required fieldขาด/null/typeผิด; ไม่มี branch | Rejected(503,AUTH_UNAVAILABLE) |

send fields หมายถึง ref/masked/resendAfterSeconds. ไม่ส่ง channels/missing แม้เป็น JSON ถูกต้อง. ไม่มี PasswordReset/PendingDevice แบบ web ที่แอบแปลงเป็น terminal. TerminalCandidate ยืนยันเพียงโครงสร้าง ไม่สร้าง identity/session และไม่ decode JWT; tokenสมมติใน unit test ไม่ใช่ authenticated proof.

## Operation × stage × outcome

| Operation | input Stage เดียวที่รับ | HTTP200 Kind ที่รับ |
|---|---|---|
| Login | Initial | PasswordChange,TwoFactor,Contact,TerminalCandidate |
| FirstPassword | PasswordChange | TwoFactor,Contact,TerminalCandidate |
| TwoFactorSend | TwoFactor | Sent |
| TwoFactorVerify | TwoFactor | Contact,TerminalCandidate |
| ContactSend | Contact | Sent |
| ContactVerify | Contact | Contact,TerminalCandidate |

Stage เป็นบริบทสำหรับตรวจ combination ไม่ใช่ validated=true หรือหลักฐาน attempt. Sent ไม่เลื่อน stage; ContactVerify อาจยัง Contact เพราะยังขาดอีกช่องทาง. Outcome ที่ไม่อยู่ช่องของ operation →503 AUTH_UNAVAILABLE. การผูก attempt/target, replay, expiry และ cancellation เป็นงาน callerภายหลัง ไม่จำลองใน decoder.

## HTTP errors และ conflict

HTTP200 ใช้ตารางข้างบน. Statusอื่นไม่คืน secret หรือ success แม้ body ดูสำเร็จ. สำหรับ non200 อนุญาต body ว่าง/whitespace; หากมี JSON ต้องผ่าน bounds/structural checks และ codeถ้ามีต้องตรง status. results absent/null อนุญาต; ถ้ามีต้อง object. หาก results มี token/changeToken/challengeToken/next/requirePasswordChange ให้503 AUTH_UNAVAILABLE เพราะปน outcome. Body malformed/duplicate/wrong code/type ให้503 AUTH_UNAVAILABLE เสมอ.

| HTTP หลังตรวจ body | Rejected(Status,Code) |
|---|---|
| 400 | 400,INVALID_INPUT |
| 401 | 401,UNAUTHORIZED |
| 403 | 403,FORBIDDEN |
| 429 | 429,RATE_LIMITED |
| 100..199,201..399,4xxอื่น,500..599 | 503,AUTH_UNAVAILABLE |

5xx non-JSON จึงยังได้503 AUTH_UNAVAILABLE ไม่ส่ง upstream details. ไม่อ่าน header; ไม่บังคับ Retry-After และไม่ส่ง retryAfterSeconds จาก error body รอบนี้. ไม่มี cooldown/retry policy, request_id generation หรือ HTTP envelope ที่นี่; Status เป็นค่าผลภายในสำหรับ mapperภายหลัง. ไม่เพิ่ม requesteffectivebounds validator เพราะไม่มี request construction. ไม่มี networkcalls จึงไม่ใช้ Postman simulation และ no-auto-retryอยู่นอกscope.

## Acceptance และ tests ที่ต้องทำ

ใช้ xUnit เรียก Decode จริงด้วย UTF-8 fixture bytes ที่สร้างใน test; ไม่ mock decoder หรือคืน success คงที่. ทุก positive fixture ใช้ envelope code=200/results=R และ secretสมมติเท่านั้น.

1. สร้าง Cartesian tests ของทุก row operationกับทุก Kind: รับเฉพาะช่องตาราง; stageผิดทุกคู่ได้400. Mobileทุก stage/outcomeรวม reset/pending ได้400; enum/statusนอกช่วงได้400.
2. Positive R: password={requirePasswordChange:true,changeToken:'test-change'}; 2FA/contact={next:'two-factor'หรือ'contact',challengeToken:'test-challenge',expiresAt:'2030-01-02T03:04:05Z'}; terminal={token:'test-token',requirePasswordChange:false,expiresAt:วันเดียวกัน}; sent={ref:'r',masked:'m',expiresAt:วันเดียวกัน,resendAfterSeconds:60}. ทั้งหมดเป็น notation สำหรับสร้าง JSON จริง. ตรวจ exact payload/null fields/NextStage และ terminalไม่มี authenticated/session side effect.
3. ทุก required field: absent/null/wrong type/empty/เกินเพดาน; ทุก forbidden markerใส่ค่าและnull; token+next/changeToken, unknown next, mobile markers, requirePasswordChange=true+token ต้อง503. TrustedDeviceToken absent/null/valid รับเฉพาะterminal.
4. HTTP400/401/403/429/502/503, empty/non-JSON/JSON, codeตรง/ขัด/ขาด/null/unknown; 200+code401และ401+code200ได้503. 429ไม่มีheaderต้องรับได้. Unknown upstreamข้อความ/PIIไม่หลุดในผล.
5. Duplicate root/results/unknown nested/array object รวมชื่อ escapedที่เท่ากัน; caseผิดของknown key; invalid UTF-8/surrogate, truncated/trailing JSON, BOM/comments/comma. ทดสอบ response2MiBและ+1, depth32และ33, secret16KiBและ+1, challenge200/201 UTF-16. Boundaryที่ผ่านต้องยังเป็นvalid fixture; unknown fillerไม่เปลี่ยนoutcome.
6. วันที่ leap-dayถูก/ผิด, timezoneหาย/offsetเกิน/leap second/เศษเกิน7/อดีต/offsetเทียบเท่าUTC. ตรวจ int resendขอบ0/int.MaxValue และค่าผิดชนิด/ติดลบ/overflow.
7. Unknown channels/missingที่boundedไม่เปลี่ยนoutcome แต่ duplicatesภายในต้อง503; ไม่ปรากฏในoutput. ToString/serialization/exception textไม่เผย sentinel secret/rawbody; CopyToได้bytesตรง, bufferเล็กไม่เขียน, disposeซ้ำได้และอ่านหลังdisposeไม่ได้. ไม่อ้าง managed-memory forensic erasure.
8. รันจาก B/web: `dotnet test SchoolBot.slnx --disable-build-servers -m:1`; checkตรวจเฉพาะcomponent/architecture regression. ไม่มี endpoint/WAF/network testจำเป็นในscopeนี้; ผลunit testsไม่ใช่Gateway wire parityหรือproduction acceptance.

## Change Log
- 2026-10-23 — Rev1: ใบงาน037ตรึง web decoder API/bounds/outcomes/errors/acceptance; ไม่มี schema, public endpoint หรือ production admission

- 2026-10-24 — นายช่างจัดรูปแบบ literal วันที่เป็น code span เพื่อไม่ให้ Markdown ตีความเป็นลิงก์; ความหมายสัญญาเดิม
