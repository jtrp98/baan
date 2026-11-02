# Gateway–SchoolBot gRPC contract — 7. Review packet และการตัดสินใจ

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) ส่วนนี้อธิบาย7. Review packet และการตัดสินใจ อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)

## 7. Review packet และการตัดสินใจ

รายการรับรอง Gateway/Light สำหรับการเชื่อมระบบจริงและ RPC ที่ยังเป็นข้อเสนอ (ไม่ย้อนผล local logout):
1. รับรองข้อยกเว้น opaque-session tenant/pipeline พร้อม negative tests ของ spoofed headers, JWT/opaque สลับกัน, cross-school, anonymous logout; อ้าง AGENTS:35 และ metadata source ข้างต้น.
2. ตรวจ exact route manifest, policy/SbRateLimit/Swagger, control-plane maintenance/revocation และ BFF CSRF; ห้าม catch-all/private exposure. ระบุ CODEOWNERS สำหรับ Program/hosting/middleware/Common/Grpc.
3. ตรวจ named gRPC client, deadlines/retry/circuit/limits และ error mapper เฉพาะ Q; fixtures ต้องครอบ204,401,403,412,428,B503,Gateway HTTP 502/504/503 และ malformed trailers. อ้าง source ในหลักฐาน ผล local logout แยกไว้ใน [หลักฐาน integration](gateway-integration-evidence.md); ไม่รับรอง RPC อื่นตามไปด้วย.
4. sb-api-gateway/sys/legacy/vault คืน selector/account-profile cardinality และ status/token/2FA key ที่ตรงกัน; ทำ evidence เรื่อง deleted/null/sentinel/duplicate/cross-school. ไม่ใช้ cType อนุมัติ admin.
5. Owner ตรึง continuation/attempt/device-proof contract ก่อนเปิด Login; รับรอง internal diagnostic codes และ public codes หากต้องเพิ่ม.
6. Infra/sb-api-gateway/SchoolBot gRPC service ระบุ host/env-key owner/private exposure/TLS/peer authentication โดยไม่ส่งค่าลับ; ยืนยัน no-loop และ public reachability denial. H5 ยังเปิด.
7. หลังรับรอง ให้ SchoolBot gRPC service เป็นเจ้าของ .proto แล้ว sync ไป HTTP API Gateway ตาม AGENTS:32; ตรวจ parser/codegen/hash, HTTP fixtures และ integration จริงก่อนอ้างพร้อม. Login/exchange/session/me/revoke ยังไม่ถือว่า implement หรือรับรองจากผล local logout.

ADR: ใช้ application logout เดิมแทนเขียน persistence ที่ HTTP API Gateway; ใช้ typed RPC แทน generic tunnel; ใช้ C exchange/opaque session แทนแชร์ signing secret หรือบังคับ JWT คู่; companion trailer เฉพาะ SchoolBot gRPC service แทนเปลี่ยน global HTTP API Gateway envelope; ไม่ retry mutation เพื่อเลี่ยง OTP/consume/commit ซ้ำ. ข้อยกเว้น tenant และ mapper ยังต้อง owner รับรอง ไม่ถือว่าร่างคือ approval.

## ยังไม่ยืนยัน

HTTP200 จาก HTTP API Gateway อาจเป็น pending; token+pending หรือ malformed outcome→503 AUTH_UNAVAILABLE. คง password-change→2FA→contact และ mobile device/password-reset ทุกขั้นก่อน fully_authenticated. หลัง admission ครบจึงออก unbound Desktop session5นาที แล้ว bind ตาม membership สด อายุหลัง bind=CreateDate+8ชม. ไม่ยืดจาก retry. Web exchange คง30นาที/Staff8ชม. จำกัดด้วย source expiry เมื่อมี; ข้อยกเว้น exp=null ของเว็บไม่ขยายไป Desktop.

ข้อความอายุหลัง bind ข้างต้นคงถ้อยคำเชิงสัญญาของ Rev2 ส่วน [มติ 052 (อายุ Desktop session นับจากเวลา bind สำเร็จ)](../requirement/decisions-052.md) ระบุเวลา bind เป็นจุดเริ่มต้น ต้องให้เจ้าของสัญญาจัดการการแก้ความหมายแยกจากงานจัดรูปแบบนี้.

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

สัญญาเสนอสำหรับ client HTTP→HTTP API Gateway→SchoolBot gRPC service ตาม [Gateway Rev3](gateway-integration-001.md); browser ผ่าน BFF. อ่านร่วม [DES-012](des-012.md), [HTTP rules Rev7](data-contract-rules.md), [Desktop adapter Rev4](desktop-login-adapter-001.md). ไม่เปลี่ยน schema, session lifetime หรือมติ035; ไม่ต้องมี DBML delta. เอกสารนี้ไม่อนุญาต implementation และไม่รับรอง integration.

พาธหลักฐานอ้างจาก `target/`: Gateway คือ `sb-api-gateway` และ SchoolBot service คือ `school-bot`.
