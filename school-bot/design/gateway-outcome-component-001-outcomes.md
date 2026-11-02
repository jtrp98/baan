# Gateway outcome component — Outcome และ HTTP errors

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway outcome component](gateway-outcome-component-001.md) อธิบาย Outcome และ HTTP errors.

## Truth table ของ HTTP200

ตารางนี้ใช้ results เป็นผลลัพธ์จาก Gateway; รายการ forbidden ใช้ presence แม้ค่าเป็น null. Fields presentation/unknown ละได้ตามกฎข้างบน.

| เงื่อนไขใน results | Kind / payload / NextStage |
|---|---|
| requirePasswordChange=true; changeToken ถูกต้อง; ไม่มี token/next/challengeToken/expiresAt/trustedDeviceToken หรือ send fields | PasswordChange / ChangeToken / PasswordChange |
| next='two-factor'; challengeToken/expiresAt ถูกต้อง; requirePasswordChange absent หรือ false; ไม่มี token/changeToken/trustedDeviceToken หรือ send fields | TwoFactor / ChallengeToken,ExpiresAt / TwoFactor |
| next='contact'; เงื่อนไขอื่นเหมือน two-factor | Contact / ChallengeToken,ExpiresAt / Contact |
| token/expiresAt ถูกต้อง; requirePasswordChange=false ต้องมี; trustedDeviceToken optional absent/null/secret ถูกต้อง; ไม่มี next/changeToken/challengeToken หรือ send fields | TerminalCandidate / Token,ExpiresAt,TrustedDeviceToken ถ้ามี / null |
| ref/masked/expiresAt/resendAfterSeconds ถูกต้อง; ไม่มี token/changeToken/challengeToken/next/requirePasswordChange/trustedDeviceToken | Sent / Ref,Masked,ExpiresAt,ResendAfterSeconds / stage เดิม |
| มี temporaryToken/isDeviceVerified/forceResetPassword แม้ null; unknown next; marker ผสม; required field ขาด/null/type ผิด; ไม่มี branch | Rejected(503,AUTH_UNAVAILABLE) |

send fields หมายถึง ref/masked/resendAfterSeconds. ไม่ส่ง channels/missing แม้เป็น JSON ถูกต้อง. ไม่มี PasswordReset/PendingDevice แบบ web ที่แอบแปลงเป็น terminal. TerminalCandidate ยืนยันเพียงโครงสร้าง ไม่สร้าง identity/session และไม่ decode JWT; token สมมติใน unit test ไม่ใช่ authenticated proof.

## Operation × stage × outcome

| Operation | input Stage เดียวที่รับ | HTTP200 Kind ที่รับ |
|---|---|---|
| Login | Initial | PasswordChange,TwoFactor,Contact,TerminalCandidate |
| FirstPassword | PasswordChange | TwoFactor,Contact,TerminalCandidate |
| TwoFactorSend | TwoFactor | Sent |
| TwoFactorVerify | TwoFactor | Contact,TerminalCandidate |
| ContactSend | Contact | Sent |
| ContactVerify | Contact | Contact,TerminalCandidate |

Stage เป็นบริบทสำหรับตรวจ combination ไม่ใช่ validated=true หรือหลักฐาน attempt. Sent ไม่เลื่อน stage; ContactVerify อาจยัง Contact เพราะยังขาดอีกช่องทาง. Outcome ที่ไม่อยู่ช่องของ operation →503 AUTH_UNAVAILABLE. การผูก attempt/target, replay, expiry และ cancellation เป็นงาน caller ภายหลัง ไม่จำลองใน decoder.

## HTTP errors และ conflict

HTTP200 ใช้ตารางข้างบน. Status อื่นไม่คืน secret หรือ success แม้ body ดูสำเร็จ. สำหรับ non200 อนุญาต body ว่าง/whitespace; หากมี JSON ต้องผ่าน bounds/structural checks และ code ถ้ามีต้องตรง status. results absent/null อนุญาต; ถ้ามีต้อง object. หาก results มี token/changeToken/challengeToken/next/requirePasswordChange ให้ 503 AUTH_UNAVAILABLE เพราะปน outcome. Body malformed/duplicate/wrong code/type ให้ 503 AUTH_UNAVAILABLE เสมอ.

| HTTP หลังตรวจ body | Rejected(Status,Code) |
|---|---|
| 400 | 400,INVALID_INPUT |
| 401 | 401,UNAUTHORIZED |
| 403 | 403,FORBIDDEN |
| 429 | 429,RATE_LIMITED |
| 100..199,201..399,4xx อื่น,500..599 | 503,AUTH_UNAVAILABLE |

5xx non-JSON จึงยังได้ 503 AUTH_UNAVAILABLE ไม่ส่ง upstream details. ไม่อ่าน header; ไม่บังคับ Retry-After และไม่ส่ง retryAfterSeconds จาก error body รอบนี้. ไม่มี cooldown/retry policy, request_id generation หรือ HTTP envelope ที่นี่; Status เป็นค่าผลภายในสำหรับ mapper ภายหลัง. ไม่เพิ่ม requesteffectivebounds validator เพราะไม่มี request construction. ไม่มี networkcalls จึงไม่ใช้ Postman simulation และ no-auto-retry อยู่นอก scope.
