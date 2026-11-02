# Gateway integration — เส้นทางและ controller ของ SchoolBot

> Rev 5 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

สัญญานี้กำหนด Desktop/Web → HTTP API Gateway → gRPC SchoolBot service เว็บผ่าน same-origin Backend for Frontend (BFF) เสมอ และไม่มี direct public SchoolBot fallback API Gateway ใช้ controller convention เดิมตาม [มติ 050 (รับเส้น SchoolBot ผ่าน controller)](../requirement/decisions-050.md)

## Topology และ route

```text
browser web-system → same-origin web-system BFF → Gateway public service-route → gRPC SchoolBot
browser admin web → same-origin admin BFF → Gateway public service-route → gRPC SchoolBot
Desktop host → Gateway public service-route → gRPC SchoolBot
SchoolBot exchange → Gateway private web-principal → response กลับ SchoolBot
```

SchoolBot เป็น service เดียว เส้น introspection แยก route/listener exposure จาก public service-route ไม่วนผ่าน BFF หรือ SchoolBot route

Public prefix `/api/school-bot/service/v2/<path>` รับ HTTP method/path allowlist ตามสัญญา เช่น POST auth/web-sessions, POST auth/login และ resources หลัง Login HTTP paths/status เป็นฝั่ง client ของ Gateway ไม่กำหนดให้ SchoolBot expose HTTP endpoint เดียวกัน RPC/Data Transfer Object (DTO) และ HTTP/error mapping อยู่ใน [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md)

Private route คง `GET /api/school-bot/auth/web-principal` ตาม [DES-012 (token exchange)](des-012.md) ห้ามเปิดผ่าน public ingress/BFF service-route ห้าม catch-all รวม `/api/school-bot/*`, `/v1/admin`, health/control หรือ URL ปลายทางจาก client

web-system ใช้ upstream Gateway เดิมและเพิ่ม SchoolBot mapping; admin BFF ใช้ Gateway เช่นกัน Desktop base URL รวม public service prefix ชื่อ host/instance ยังไม่ยืนยัน

## Controller entry และ module-owned channel

เส้น local logout คือ client HTTP → SchoolBotAuthController → SchoolBotLogoutService → typed gRPC client → SchoolBot ตาม [สัญญา controller entry](gateway-controller-entry-001.md) module ลงทะเบียนด้วย AddSchoolBotLogoutModule และรับ route ผ่าน MapControllers ใช้ `/api` prefix convention และ controller pipeline เดิม

SmartScheme เลือก SchoolBotOpaque สำหรับ `/api/school-bot/service/v2`; handler คืน NoResult ไม่แปลง opaque token เป็น JWT AllowAnonymous ของ logout ทำงานร่วม scheme selector ไม่ใช่มาตรการแยก token เพียงอย่างเดียว Channel/client สร้างผ่าน CreateChannel/CreateGeneratedClient และตรวจ provenance โดยไม่ใช้ reflection

ไม่ใช้ public relay branch ก่อน UseAuthentication/UserEnricher, minimal endpoint หรือ SchoolBotLogoutMiddleware ส่วน security headers, limits, rate limit และ maintenance ของ route คงอยู่ Session/revocation/Channel/tenant/authorization เป็น authority ของ SchoolBot

## ส่วนสัญญาและหลักฐาน

| เอกสาร | รายละเอียด |
|---|---|
| [Trust boundary และ error](gateway-integration-trust.md) | credential/header filtering, private introspection, network และ failure |
| [แหล่งสิทธิ์ admin](gateway-integration-admin.md) | กลุ่มแอดมิน/ผู้บริหาร, super admin, fail closed และกรณีตรวจ |
| [หลักฐาน integration](gateway-integration-evidence.md) | source ที่บันทึกไว้ ขอบเขต local logout และสิ่งที่ยังต้องพิสูจน์ |

Login HTTP เดิมของ Gateway และ HTTP/JSON decoder เป็นขอบเขตแยกจาก Gateway→SchoolBot gRPC ไม่ rewrite Login จากมติ transport คงวิธี C (แลก token ผ่าน private introspection), opaque session, Channel/License, cType และ [มติ 035 (admin กลุ่มฝั่ง server)](../requirement/decisions-035.md)

## เหตุผลและทางเลือกที่ไม่ใช้

ใช้ controller convention และโค้ดเดิมที่มติ 050 เลือก ไม่ใช้ middleware/minimal entry หรือ HTTP relay/HttpClient เป็น service transport เพราะ Gateway ใช้มาตรฐาน REST→gRPC ไม่ถามเลือก transport ซ้ำ ไม่ใช้ direct SchoolBot เพราะขัด topology; ไม่แชร์ signing secret กับ SchoolBot เพราะขัดวิธี C และไม่เพิ่ม generic proxy framework

## หลักฐาน

- [มติ 046 (อนุญาตพัฒนา Gateway บน branch ที่เตรียมไว้)](../requirement/decisions-046.md) ไม่ใช่ production approval; [มติ 050 (controller entry)](../requirement/decisions-050.md) คง transport เดิม
- Gateway `src/ApiGateway.API/SchoolBot/SchoolBotAuthController.cs:8–58`, `SchoolBotLogoutRegistration.cs:15–28,97–163`, `SchoolBotLogoutService.cs:24–223`, `SchoolBotSessionGrpcClient.cs:17–102` เป็นหลักฐาน controller/service/channel ที่เอกสารเดิมบันทึก
- ขอบเขตที่ตรวจแล้วและที่ยังขาดอ่าน [หลักฐาน integration](gateway-integration-evidence.md) เอกสารนี้เรียบเรียงผลเดิม ไม่ตรวจ source/runtime ซ้ำ
