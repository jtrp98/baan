# Desktop login adapter — Request และ effective bounds

> Rev 4 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Desktop adapter (admission และ route)](desktop-login-adapter-001.md) เป็นคำสั่งภายใน adapter ไม่ใช่ body หรือ public API ใหม่

## Operations

school_id เป็น positive int32; mobile จำกัด 1..99999 ความยาว string นับ UTF-16 code units ให้ตรง C# ไม่ truncate/lowercase/Unicode-normalize หรือ trim password

| Operation | Gateway route ใต้ /api/auth | Payload และ effective bounds |
|---|---|---|
| student_login | /login | user:string 1..100, password:string 1..20, schoolId:int, imei:string 1..50 จาก lifecycle ที่เจ้าของรองรับ |
| employee_login | /web/login | schoolId:int, username:string ตรวจ raw ไม่เกิน 100 แล้ว Trim และต้องไม่ว่าง, password:string 1..100, lang?:string, trustedDeviceToken?:secret |
| first_password | /web/first-password | changeToken:secret, newPassword:ASCII 0–9 เท่านั้น ยาว 8..20, lang?:string |
| two_factor_send | /web/two-factor/send | challengeToken:string 1..200, channel:sms\|email |
| two_factor_verify | /web/two-factor/verify | challengeToken:string 1..200, code:string 1..20, trustDevice:boolean |
| contact_send | /web/contact/send | challengeToken:string 1..200, type:phone\|email, value:string 1..100 |
| contact_verify | /web/contact/verify | ฟิลด์ contact_send + code:string 1..20 + trustDevice:boolean |

## ตรวจ request ก่อนส่ง

[DES-004 (ตัวตนและสิทธิ์)](des-004.md) มีเพดาน username 256/password 1024 ก่อนส่ง upstream หากเกิน effective bounds ให้ `400 INVALID_INPUT` ก่อนเรียก Gateway ไม่ลองอีก actor employee ตรวจ raw username ก่อน Trim: เกิน 100 แม้ Trim แล้วสั้นก็ปฏิเสธ Trim เฉพาะ username; student เปรียบเทียบตามเดิม

first_password ใช้ effective policy ASCII digits 8..20 แทน Data Transfer Object (DTO) ceiling เดิม 1..100 SchoolBot ตรวจรูปแบบก่อนส่ง; Gateway ยังตรวจ changeToken และ policy เอง source Gateway ตรวจ changeToken ก่อน policy การตรวจ local ไม่ยืนยัน token และไม่รับรองลำดับ error เมื่อผิดหลายเงื่อนไข ไม่เลือก password policy ใหม่

trustedDeviceToken ขาเข้า employee_login ถ้าเป็น string ต้องไม่เกิน 2000 UTF-16 code units เกิน → `400 INVALID_INPUT` ก่อนเรียก Gateway ไม่ truncate/ทิ้งเงียบ ค่าที่ผ่านส่งโดยไม่แปลง absent/null หมายถึงไม่มี token แม้ source Gateway จะทิ้งค่าที่เกิน 2000 เป็น null เพดาน secret parser 16 KiB UTF-8 เป็นข้อจำกัดอีกชั้น ไม่ขยาย request limit หรือเปลี่ยน response-secret cap ของ decoder

lang/trusted token ใช้ Gateway เดิม ไม่แปลง phone/email/code เอง Gateway ตรวจ/normalize ตาม flow เดิม contact_verify ต้องใช้ type/value ของ send เดียวกัน secret ใช้ใน memory ไม่ log/persist

## ยังไม่ยืนยัน

### Parser limits ที่เสนอ

Request 64 KiB, response 2 MiB, depth 32; token/changeToken/trustedDeviceToken ไม่เกิน 16 KiB UTF-8; challenge ไม่เกิน 200 ตาม Gateway เป็นข้อเสนอป้องกัน parser ของ SchoolBot ไม่ใช่ deployed limit ของ Gateway และไม่เพิ่ม request validator ใน decoder

## หลักฐาน

- desktop-login-evidence-001 (memory): Gateway `WebAuthController.cs:15–35,143–245`, `WebLoginService.cs:58`, mobile `LoginRequestValidator.cs:10`
- desktop-login-wire-evidence-001 (memory): Gateway `src/ApiGateway.API/Controllers/WebAuthController.cs:147,153` และ `src/ApiGateway.Infrastructure/Authentication/WebLoginService.cs:137` ยืนยัน bounds ที่ปรับ; ไม่ได้ตรวจ source ซ้ำในงานนี้
