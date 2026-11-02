# มติที่ 050 — Gateway รับเส้น SchoolBot ตาม convention เดิมของ Gateway (controller)

วันที่ 2026-10-28 · ผู้ตอบ: ผู้ใช้ในแชต · ผู้บันทึก: นายช่าง

## ที่มา

ผู้ใช้ถามว่าเส้น web → API Gateway → SchoolBot service → API Gateway → web และ desktop app → API Gateway → SchoolBot service → API Gateway → desktop app ผ่าน API controller ของ Gateway ใช่หรือไม่ · นายช่างตอบตาม [Gateway Rev4](../design/gateway-integration-001.md) ว่าทิศทางถูก (เว็บต้องผ่าน same-origin BFF, client↔G เป็น HTTP/JSON, G↔B เป็น gRPC) แต่ logout ที่ทำอยู่เป็น minimal endpoint `endpoints.Map(...)` + `SchoolBotLogoutMiddleware` ไม่ใช่ controller และยังไม่ลงทะเบียนใน `Program.cs`

ผู้ใช้ตอบ: "ทำตาม แบบที่ คนอื่นเขาทำ"

## มติ (ตามที่นายช่างตีความ — ยืนยันกับผู้ใช้ในแชตแล้วเมื่อรายงาน)

- เส้น HTTP ของ SchoolBot ใน Gateway ใช้ **controller ตาม convention ที่ API อื่นของ Gateway ใช้** (route prefix `/api`, pipeline authentication → logging → control plane → authorization → rate limit → controllers) แทน minimal endpoint/middleware แยก
- G→B ยังเป็น gRPC, เว็บยังผ่าน BFF, ไม่มี direct public B — มติ transport Rev3/Rev4 ไม่เปลี่ยน
- logic ที่ผ่านการตรวจแล้ว (typed client, log boundary, trailer/metadata validator, deadline, error mapping) ให้ arch ระบุว่าย้ายเข้า controller/service อย่างไรโดยไม่ทำให้ผลตรวจเดิมเสีย

## ขอบเขต

- เป็นการเปลี่ยนแบบ → route ให้ `arch` ปรับ DES/สัญญาก่อน แล้วจึงเปิด sys · ไม่อนุญาต production registration/deploy เพิ่ม · ไม่ปิด H5/G-AUTH
- ไม่ย้อนผลการตรวจ B gRPC (check-092 (memory: planning/check-092-grpc-r3-001.md)) — ฝั่ง B ไม่กระทบ

## Change Log

- 2026-10-28 — ผู้ใช้สั่งให้ Gateway ทำตาม convention ที่ API อื่นใช้
